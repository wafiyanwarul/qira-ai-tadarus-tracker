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
                time: new Date(log.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                arabic: quranData?.arabic || null,
                translation: quranData?.translation || null,
                endAyahNumber: log.endAyah,
            };
        }));

        // --- MENGHITUNG TOTAL ---
        const totalPagesRead = logs.reduce((sum, log) => sum + log.totalPagesRead, 0);
        const pagesReadToday = todayLogsRaw.reduce((sum, log) => sum + log.totalPagesRead, 0);
        const totalPagesTarget = targetKhatam * 604;

        // --- KALKULASI DINAMIS RAMADHAN ---
        const ramadanStart = new Date('2026-02-19T00:00:00+07:00');
        const now = new Date();

        // Menghitung selisih hari dengan akurat
        const diffTime = now.getTime() - ramadanStart.getTime();
        const passedDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
        const remainingDays = Math.max(1, 30 - passedDays);

        // --- LOGIKA TARGET PINTAR ---
        const totalRemainingPages = Math.max(0, totalPagesTarget - totalPagesRead);

        // Target harian menyesuaikan sisa halaman dibagi sisa hari
        // Jadi kalau dia "ngebut" di awal, hari berikutnya targetnya makin santai!
        const baseDailyTarget = totalRemainingPages === 0 ? 0 : (totalRemainingPages / remainingDays);

        const remainingToday = Math.max(0, baseDailyTarget - pagesReadToday);
        const percentage = Math.min(100, (totalPagesRead / totalPagesTarget) * 100);

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
                percentage: Math.round(percentage * 10) / 10,
                remainingDays, // <--- Kirim sisa hari ke Frontend
                todayLogs,
                energy: { used: usedEnergy, max: 10 },
                lastRead: lastLog
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Gagal mengambil data progress.' }, { status: 500 });
    }
}