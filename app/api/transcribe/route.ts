// app/api/transcribe/route.ts
import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { validateTadarusInput, calculatePagesRead, getAbsoluteAyah, getSurahAyahFromAbsolute } from '@/lib/quranData';
import { prisma } from '@/lib/prisma';
import { env } from '@/src/config/env';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Redis } from '@upstash/redis';


// KITA CUMA PAKAI GROQ SEKARANG! (Gemini dihapus)
const groq = new Groq({ apiKey: env.GROQ_API_KEY });
const redis = new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN });

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
            }, { status: 429 }); // Status 429 = Too Many Requests
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

        // 2. GROQ LLAMA-3: Text to JSON (Nggak pake Gemini lagi!)
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
            // Kita pakai model Llama-3 8B yang super cepat dan gratis
            model: 'llama-3.3-70b-versatile',
            temperature: 0,
            // Paksa Groq untuk mengeluarkan format JSON
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

        // --- LOGIC PENCEGAH AYAT GANDA ---
        const newStartAbs = getAbsoluteAyah(extractedData.start_surah, extractedData.start_ayah);
        const newEndAbs = getAbsoluteAyah(extractedData.end_surah, extractedData.end_ayah);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayLogs = await prisma.progressLog.findMany({
            where: {
                userId: session.user.id,
                createdAt: { gte: today }
            }
        });

        let isOverlap = false;
        for (const log of todayLogs) {
            const logStart = getAbsoluteAyah(log.startSurah, log.startAyah);
            const logEnd = getAbsoluteAyah(log.endSurah, log.endAyah);

            if (Math.max(newStartAbs, logStart) <= Math.min(newEndAbs, logEnd)) {
                isOverlap = true;
                break;
            }
        }

        if (isOverlap) {
            return NextResponse.json({
                success: false,
                error: 'Sebagian/seluruh ayat ini sudah kamu setor hari ini. Lanjut ke ayat berikutnya ya!'
            });
        }

        // --- GAP DETECTION (AYAT TERLEWAT) ---
        let gapWarning = null;
        const lastLog = await prisma.progressLog.findFirst({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' }
        });

        if (lastLog) {
            const lastEndAbs = getAbsoluteAyah(lastLog.endSurah, lastLog.endAyah);

            // Cek apakah ini "Looping" (Dari akhir Quran kembali ke awal)
            const isLooping = lastEndAbs > 6200 && newStartAbs < 100;

            if (newStartAbs > lastEndAbs + 1 && !isLooping) {
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
        }

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

        // --- NEW: DETEKSI KHATAM YANG ABSOLUT (ANTI GAGAL) ---
        // Kita pakai savedRecord.endSurah karena ini 100% data valid yang masuk DB
        const isKhatam = savedRecord.endSurah === 114;

        await redis.incr(redisKey);
        await redis.expire(redisKey, 86400);

        return NextResponse.json({
            success: true,
            text: rawText,
            data: savedRecord,
            gapWarning,
            isKhatam // Bendera Checkpoint
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Gagal memproses data di server.' }, { status: 500 });
    }
}