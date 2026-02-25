// app/api/transcribe/route.ts
import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { validateTadarusInput, calculatePagesRead, getAbsoluteAyah, getSurahAyahFromAbsolute, quranMetadata } from '@/lib/quranData';
import { prisma } from '@/lib/prisma';
import { env } from '@/src/config/env';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Redis } from '@upstash/redis';

export const maxDuration = 60; // Mengizinkan Vercel menunggu maksimal 1 menit (tidak mati di 10 detik)

// KITA CUMA PAKAI GROQ SEKARANG! (Gemini dihapus)
const groq = new Groq({ apiKey: env.GROQ_API_KEY });
const redis = new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN });

/**
 * POST /api/transcribe
 * @description Proses data tadarus AI (Whisper) menjadi format JSON yang valid.
 * @param {Request} req - Request object containing information about the current request.
 * @return {Promise<Response>} - Response object containing the result of the request.
 * @throws {Response} - If the request fails, it throws an error response with a 400 or 500 status code.
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized. Silakan login dulu.' }, { status: 401 });
        }

        // --- SISTEM RATE LIMITER (ENERGI) ---
        const todayStr = new Date().toISOString().split('T')[0];
        const redisKey = `energy:${session.user.id}:${todayStr}`;
        const usedEnergy = (await redis.get<number>(redisKey)) || 0;

        if (usedEnergy >= 10) {
            return NextResponse.json({
                success: false,
                error: 'Energi AI kamu hari ini habis (0/10 ⚡). Istirahat dulu ya, lanjut lapor tadarus besok!'
            }, { status: 429 });
        }

        const formData = await req.formData();
        const audioFile = formData.get('audio') as File;

        if (!audioFile) {
            return NextResponse.json({ error: 'File audio tidak ditemukan.' }, { status: 400 });
        }

        // 1. GROQ WHISPER: Audio to Text
        const transcription = await groq.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-large-v3',
            prompt: 'Tadarus Al-Quran, Juz, Surah, Ayat, Khatam',
            response_format: 'json',
            language: 'id',
        });
        const rawText = transcription.text;

        // 2. GROQ LLAMA-3: Text to JSON
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `Kamu adalah asisten ahli ekstraksi data tadarus Al-Quran.
                    Tugasmu: Ambil teks ucapan user dan ubah HANYA menjadi format JSON yang valid. Jangan tambahkan penjelasan apapun, markdown, atau teks lain.

                    Pemetaan Nomor Surah:
                    - Al-Fatihah = 1
                    - Al-Baqarah = 2
                    - Ali 'Imran = 3
                    (dan seterusnya sesuai mushaf)

                    Format output JSON:
                    {
                    "start_surah": <nomor surat awal>,
                    "start_ayah": <nomor ayat awal>,
                    "end_surah": <nomor surat akhir>,
                    "end_ayah": <nomor ayat akhir>
                    }

                    Aturan: Jika hanya 1 surah disebut, start_surah dan end_surah harus bernilai sama.`
                },
                {
                    role: 'user',
                    content: rawText
                }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0,
            response_format: { type: "json_object" }
        });

        const jsonString = chatCompletion.choices[0]?.message?.content;
        const extractedData = JSON.parse(jsonString || '{}');

        // 3. GATEKEEPER VALIDATION
        if (!extractedData.start_surah || !extractedData.start_ayah || !extractedData.end_surah || !extractedData.end_ayah) {
            return NextResponse.json({
                success: false,
                error: 'Kurang spesifik nih. Coba sebutin lengkap surah dan ayatnya ya.'
            });
        }

        const validation = validateTadarusInput(
            extractedData.start_surah, extractedData.start_ayah,
            extractedData.end_surah, extractedData.end_ayah
        );

        if (!validation.isValid) {
            return NextResponse.json({ success: false, error: validation.message });
        }

        const newStartAbs = getAbsoluteAyah(extractedData.start_surah, extractedData.start_ayah);
        const newEndAbs = getAbsoluteAyah(extractedData.end_surah, extractedData.end_ayah);

        // ====================================================================
        // --- MULTI-KHATAM ISOLATION LOGIC (THE ULTIMATE ENGINE) ---
        // ====================================================================

        // 1. Cari kapan terakhir kali dia Khatam (Membaca Surah 114 An-Nas)
        const lastKhatamLog = await prisma.progressLog.findFirst({
            where: { userId: session.user.id, endSurah: 114 },
            orderBy: { createdAt: 'desc' }
        });

        // 2. Ambil semua log HANYA pada putaran target yang sedang berjalan
        const currentIterationLogs = await prisma.progressLog.findMany({
            where: {
                userId: session.user.id,
                ...(lastKhatamLog ? { createdAt: { gt: lastKhatamLog.createdAt } } : {})
            },
            orderBy: { createdAt: 'desc' }
        });

        // 3. CEK OVERLAP (Ayat Bertumpuk) KHUSUS DI PUTARAN INI SAJA
        let isOverlap = false;
        for (const log of currentIterationLogs) {
            const logStartAbs = getAbsoluteAyah(log.startSurah, log.startAyah);
            const logEndAbs = getAbsoluteAyah(log.endSurah, log.endAyah);

            if (Math.max(newStartAbs, logStartAbs) <= Math.min(newEndAbs, logEndAbs)) {
                isOverlap = true;
                break;
            }
        }

        if (isOverlap) {
            return NextResponse.json({
                success: false,
                error: `Tunggu dulu... Ayat ini sudah pernah kamu setor pada putaran Khatam ini. Lanjut ke ayat berikutnya ya!`
            }, { status: 400 });
        }

        // 4. CEK GAP (AYAT TERLEWAT) & ANTI-MUNDUR
        let gapWarning = null;
        const lastLog = currentIterationLogs.length > 0 ? currentIterationLogs[0] : null;

        if (lastLog) {
            const lastEndAbs = getAbsoluteAyah(lastLog.endSurah, lastLog.endAyah);

            // Anti-Mundur
            if (newStartAbs <= lastEndAbs) {
                const lastSurahName = quranMetadata[lastLog.endSurah]?.name || `Surah ${lastLog.endSurah}`;
                return NextResponse.json({
                    success: false,
                    error: `Kamu sudah sampai ${lastSurahName} ayat ${lastLog.endAyah}. Tidak perlu mundur lagi!`
                }, { status: 400 });
            }

            // Gap Detection (Ayat terlewat)
            if (newStartAbs > lastEndAbs + 1) {
                const gapStart = getSurahAyahFromAbsolute(lastEndAbs + 1);
                const gapEnd = getSurahAyahFromAbsolute(newStartAbs - 1);

                let gapText = '';
                if (gapStart.surah === gapEnd.surah && gapStart.ayah === gapEnd.ayah) {
                    gapText = `${gapStart.name} ayat ${gapStart.ayah}`;
                } else if (gapStart.surah === gapEnd.surah) {
                    gapText = `${gapStart.name} ayat ${gapStart.ayah}-${gapEnd.ayah}`;
                } else {
                    gapText = `${gapStart.name} ayat ${gapStart.ayah} s/d ${gapEnd.name} ayat ${gapEnd.ayah}`;
                }
                gapWarning = `Kamu melompati <b>${gapText}</b>. Jangan lupa dituntaskan ya!`;
            }
        } else {
            // Jika ini adalah setoran PERTAMA di putaran Khatam baru (misal Khatam ke-2)
            if (newStartAbs > 1) {
                const gapEnd = getSurahAyahFromAbsolute(newStartAbs - 1);
                let gapText = gapEnd.surah === 1 && gapEnd.ayah === 1
                    ? `Al-Fatihah ayat 1`
                    : `Al-Fatihah ayat 1 s/d ${gapEnd.name} ayat ${gapEnd.ayah}`;
                gapWarning = `Putaran baru! Kamu melompati <b>${gapText}</b>.`;
            }
        }
        // ====================================================================

        // 4. CALCULATE ESTIMATED PAGES
        const totalPages = calculatePagesRead(
            extractedData.start_surah, extractedData.start_ayah,
            extractedData.end_surah, extractedData.end_ayah
        );

        // 5. INSERT TO DATABASE
        const savedRecord = await prisma.progressLog.create({
            data: {
                startSurah: extractedData.start_surah,
                startAyah: extractedData.start_ayah,
                endSurah: extractedData.end_surah,
                endAyah: extractedData.end_ayah,
                totalPagesRead: totalPages,
                rawTranscript: rawText,
                userId: session.user.id,
            }
        });

        // --- NEW: SYARAT KHATAM KETAT (ANTI-CHEAT) MULTI-KHATAM ---
        // Hitung total halaman yang dibaca HANYA di putaran ini, ditambah setoran barusan
        const currentIterationTotalPages = currentIterationLogs.reduce((sum, log) => sum + log.totalPagesRead, 0) + savedRecord.totalPagesRead;

        // Dianggap Khatam HANYA JIKA dia menyentuh An-Nas DAN halamannya masuk akal untuk 1 putaran (~590 halaman min)
        const isKhatam = savedRecord.endSurah === 114 && currentIterationTotalPages >= 590;

        await redis.incr(redisKey);
        await redis.expire(redisKey, 86400);

        return NextResponse.json({
            success: true,
            text: rawText,
            data: savedRecord,
            gapWarning,
            isKhatam // Bendera Checkpoint
        });

    } catch (error: any) {
        console.error("Groq/Transcribe Error:", error);
        // if error from internet connection or timeout (ECONNRESET) 
        if (error.code === 'ECONNRESET' || error.message.includes('fetch')) {
            return NextResponse.json({ 
                success: false, 
                error: "Koneksi ke AI terputus. Pastikan rekaman tidak terlalu panjang dan internet stabil." 
            }, { status: 500 });
        }
        return NextResponse.json({ success: false, error: "Gagal memproses suara. Coba lagi." }, { status: 500 });
    }
}