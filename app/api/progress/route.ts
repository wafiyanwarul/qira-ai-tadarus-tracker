// app/api/progress/route.ts
import { prisma } from '@/lib/prisma';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { Redis } from '@upstash/redis';
import { env } from '@/src/config/env';
import { quranMetadata } from '@/lib/quranData';
import { getAyahWithCache } from '@/lib/quranApi';

const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * GET /api/progress
 * 
 * Mengembalikan data progress user yang berisi tentang:
 * 1. Total halaman yang sudah dibaca
 * 2. Target halaman yang ingin dibaca
 * 3. Jumlah halaman yang dibaca hari ini
 * 4. Jumlah halaman yang harus dibaca setiap hari untuk mencapai target
 * 5. Persentase yang sudah dibaca
 * 6. Jumlah hari yang tersisa untuk mencapai target
 * 7. Jumlah putaran Khatam yang sudah dibaca
 * 8. Data log bacaan hari ini
 * 9. Energi yang digunakan hari ini
 * 10. Data log bacaan terakhir
 * 
 * Parameter:
 * target: Opsiional, target Khatam yang ingin dicapai. Default = 1
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const targetKhatam = parseInt(req.nextUrl.searchParams.get('target') || '1');

        // --- BACA ENERGI DARI REDIS ---
        const todayStr = new Date().toISOString().split('T')[0];
        const redisKey = `energy:${session.user.id}:${todayStr}`;
        const usedEnergy = (await redis.get<number>(redisKey)) || 0;

        const logs = await prisma.progressLog.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' }
        });

        const today = new Date().toISOString().split('T')[0];
        const todayLogsRaw = logs.filter(log => new Date(log.createdAt).toISOString().split('T')[0] === today);

        // --- NEW: TARIK TEKS ARAB DARI REDIS/API ---
        const todayLogs = await Promise.all(todayLogsRaw.map(async (log) => {
            // Kita ambil teks ayat pertama dari bacaan dia
            const quranData = await getAyahWithCache(log.endSurah, log.endAyah);

            return {
                start: `${quranMetadata[log.startSurah]?.name} ${log.startAyah}`,
                end: `${quranMetadata[log.endSurah]?.name} ${log.endAyah}`,
                pages: log.totalPagesRead,
                time: new Date(log.createdAt).toLocaleTimeString('id-ID', {
                    timeZone: 'Asia/Jakarta',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                arabic: quranData?.arabic || null,
                translation: quranData?.translation || null,
                endAyahNumber: log.endAyah,
            };
        }));

        // --- MENGHITUNG TOTAL ---
        // Ubah const menjadi let agar bisa kita modifikasi angkanya
        let totalPagesRead = logs.reduce((sum, log) => sum + log.totalPagesRead, 0);
        const pagesReadToday = todayLogsRaw.reduce((sum, log) => sum + log.totalPagesRead, 0);
        const totalPagesTarget = targetKhatam * 604;

        // --- NEW: PLAFON HALAMAN (ANTI PREMATURE LOCK) ---
        // Menghitung berapa kali user benar-benar sudah menyetor Surah 114 (An-Nas)
        const actualKhatamCount = logs.filter(log => log.endSurah === 114).length;

        // Jika halaman "kebablasan" nembus target karena akumulasi desimal, 
        // TAPI user belum beneran nyentuh An-Nas untuk putaran target ini...
        if (actualKhatamCount < targetKhatam && totalPagesRead >= totalPagesTarget) {
            // Tahan total halamannya sedikit di bawah target (diskon 0.5 halaman)
            // Supaya UI mentok di 99.9% dan tombol Mic TIDAK DIGEMBOK!
            totalPagesRead = totalPagesTarget - 0.5;
        }
        // --------------------------------------------------

        // --- KALKULASI DINAMIS RAMADHAN ---
        const ramadanStart = new Date('2026-02-19T00:00:00+07:00');
        const now = new Date();

        // Menghitung selisih waktu
        const diffTime = now.getTime() - ramadanStart.getTime();
        // Math.floor membulatkan ke bawah. Tanggal 23 - 19 = 4 hari penuh yang udah lewat.
        const passedDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

        const puasaHariKe = passedDays + 1; // Sekarang berarti Hari ke-5!
        const remainingDays = Math.max(1, 30 - puasaHariKe); // 30 - 5 = 25 Hari Sisa

        // --- LOGIKA TARGET PINTAR ---
        const totalRemainingPages = Math.max(0, totalPagesTarget - totalPagesRead);
        const baseDailyTarget = totalRemainingPages === 0 ? 0 : (totalRemainingPages / remainingDays);
        const remainingToday = Math.max(0, baseDailyTarget - pagesReadToday);

        let percentage = (totalPagesRead / totalPagesTarget) * 100;
        // Kunci di 99.99% jika belum menyentuh An-Nas
        if (actualKhatamCount < targetKhatam && percentage >= 99.99) {
            percentage = 99.99;
        } else {
            percentage = Math.min(100, percentage);
        }

        // Ambil data paling atas (paling baru)
        const lastLog = logs.length > 0 ? {
            surahName: quranMetadata[logs[0].endSurah]?.name,
            ayah: logs[0].endAyah
        } : null;

        return NextResponse.json({
            success: true,
            data: {
                totalPagesRead: Math.round(totalPagesRead * 10) / 10,
                totalPagesTarget,
                pagesReadToday: Math.round(pagesReadToday * 10) / 10,
                remainingToday: Math.round(remainingToday * 10) / 10,
                dailyTarget: Math.round(baseDailyTarget * 10) / 10,
                // --- UBAH DI SINI: Dari 10 menjadi 100 untuk 2 angka desimal ---
                percentage: Math.round(percentage * 100) / 100,
                remainingDays,
                puasaHariKe,
                todayLogs,
                actualKhatamCount,
                energy: { used: usedEnergy, max: 10 },
                lastRead: lastLog
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Gagal mengambil data progress.' }, { status: 500 });
    }
}