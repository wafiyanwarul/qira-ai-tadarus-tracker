// app/api/transcribe/route.ts
import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { GoogleGenAI } from '@google/genai';
import { validateTadarusInput, calculatePagesRead } from '@/lib/quranData';
import { prisma } from '@/lib/prisma';
import { env } from '@/src/config/env';

const groq = new Groq({ apiKey: env.GROQ_API_KEY });
const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const audioFile = formData.get('audio') as File;

        if (!audioFile) {
            return NextResponse.json({ error: 'File audio tidak ditemukan.' }, { status: 400 });
        }

        // 1. WHISPER: Audio to Text
        const transcription = await groq.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-large-v3',
            prompt: 'Tadarus Al-Quran, Juz, Surah, Ayat, Khatam',
            response_format: 'json',
            language: 'id',
        });
        const rawText = transcription.text;

        // 2. GEMINI: Text to JSON
        const systemInstruction = `
        Kamu adalah asisten ahli ekstraksi data tadarus Al-Quran.
        Tugasmu: Ambil teks ucapan user dan ubah HANYA menjadi format JSON yang valid.
        
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
        
        Aturan: Jika hanya 1 surah disebut, start_surah dan end_surah harus bernilai sama. Jangan tambahkan teks markdown.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: rawText,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: 'application/json',
            }
        });

        const jsonString = response.text;
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

        // 4. CALCULATE ESTIMATED PAGES
        const totalPages = calculatePagesRead(
            extractedData.start_surah, extractedData.start_ayah,
            extractedData.end_surah, extractedData.end_ayah
        );

        // 5. INSERT TO DATABASE (SUPABASE VIA PRISMA)
        const savedRecord = await prisma.progressLog.create({
            data: {
                startSurah: extractedData.start_surah,
                startAyah: extractedData.start_ayah,
                endSurah: extractedData.end_surah,
                endAyah: extractedData.end_ayah,
                totalPagesRead: totalPages, // Pakai field yang baru
                rawTranscript: rawText,
            }
        });

        // Kembalikan response sukses ke Frontend
        return NextResponse.json({
            success: true,
            text: rawText,
            data: savedRecord // Sekarang kita kirim data dari database!
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Gagal memproses data di server.' }, { status: 500 });
    }
}
