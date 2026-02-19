// app/api/transcribe/route.ts
import { validateTadarusInput } from '@/lib/quranData';
import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { GoogleGenAI } from '@google/genai'; // Import SDK Gemini terbaru

// Inisialisasi API Clients
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const audioFile = formData.get('audio') as File;

        if (!audioFile) {
            return NextResponse.json({ error: 'File audio tidak ditemukan.' }, { status: 400 });
        }

        // ==========================================
        // 1. PROSES AUDIO KE TEKS (GROQ WHISPER)
        // ==========================================
        const transcription = await groq.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-large-v3',
            prompt: 'Tadarus Al-Quran, Juz, Surah, Ayat, Khatam',
            response_format: 'json',
            language: 'id',
        });

        const rawText = transcription.text;

        // ==========================================
        // 2. PROSES TEKS KE DATA TERSTRUKTUR (GEMINI)
        // ==========================================
        // Ini adalah "Prompt Engineering" agar AI paham tugasnya
        const systemInstruction = `
      Kamu adalah asisten ahli ekstraksi data tadarus Al-Quran.
      Tugasmu: Ambil teks ucapan user dan ubah HANYA menjadi format JSON yang valid.
      
      Pemetaan Nomor Surah (Penting!):
      - Al-Fatihah = 1
      - Al-Baqarah = 2
      - Ali 'Imran / Al-Imran = 3
      - An-Nisa = 4
      - Al-Ma'idah = 5
      (dan seterusnya sesuai urutan mushaf standar)

      Format JSON yang diminta:
      {
        "start_surah": <nomor surat awal, tipe angka>,
        "start_ayah": <nomor ayat awal, tipe angka>,
        "end_surah": <nomor surat akhir, tipe angka>,
        "end_ayah": <nomor ayat akhir, tipe angka>
      }

      Aturan:
      1. Jika user hanya menyebutkan 1 nama surat (contoh: "Surah Al-Imran ayat 35 sampai 112"), maka start_surah dan end_surah bernilai sama (yaitu 3).
      2. Jangan tambahkan teks markdown, penjelasan, atau apapun selain JSON murni.
      3. Jika data tidak lengkap, isi dengan null.
    `;

        // Memanggil model Gemini 2.5 Flash (sangat cepat untuk task ringan)
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: rawText,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: 'application/json', // Paksa output jadi JSON
            }
        });

        // Ambil hasil JSON dari Gemini dan ubah jadi Object JavaScript
        const jsonString = response.text;
        const extractedData = JSON.parse(jsonString || '{}');

        // --- FITUR BARU: GATEKEEPER VALIDATION ---
        // Pastikan data yang diekstrak AI itu lengkap angkanya
        if (!extractedData.start_surah || !extractedData.start_ayah || !extractedData.end_surah || !extractedData.end_ayah) {
            return NextResponse.json({
                success: false,
                error: 'Kurang spesifik nih. Coba sebutin lengkap dari surah apa ayat berapa, sampai surah apa ayat berapa ya.',
                text: rawText
            });
        }

        // Lakukan crosscheck ke metadata asli Al-Quran
        const validation = validateTadarusInput(
            extractedData.start_surah,
            extractedData.start_ayah,
            extractedData.end_surah,
            extractedData.end_ayah
        );

        if (!validation.isValid) {
            return NextResponse.json({
                success: false,
                error: validation.message,
                text: rawText
            });
        }
        // ------------------------------------------

        // Jika lolos validasi, kembalikan data sukses
        return NextResponse.json({
            success: true,
            text: rawText,
            data: extractedData
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Gagal memproses data di server.' }, { status: 500 });
    }
}