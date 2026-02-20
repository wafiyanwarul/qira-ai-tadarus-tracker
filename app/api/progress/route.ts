import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { quranMetadata } from '@/lib/quranData';

export async function GET(req: NextRequest) {
    try {
        const targetKhatam = parseInt(req.nextUrl.searchParams.get('target') || '1');

        const logs = await prisma.progressLog.findMany({
            where: { userId: 'guest-user' },
            orderBy: { createdAt: 'desc' } // Urutkan dari yang terbaru
        });

        const today = new Date().toISOString().split('T')[0];
        const todayLogsRaw = logs.filter(log => new Date(log.createdAt).toISOString().split('T')[0] === today);

        // Format log untuk ditampilkan di Rekap
        const todayLogs = todayLogsRaw.map(log => ({
            start: `${quranMetadata[log.startSurah]?.name} ${log.startAyah}`,
            end: `${quranMetadata[log.endSurah]?.name} ${log.endAyah}`,
            pages: log.totalPagesRead,
            time: new Date(log.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }));

        const totalPagesRead = logs.reduce((sum, log) => sum + log.totalPagesRead, 0);
        const pagesReadToday = todayLogsRaw.reduce((sum, log) => sum + log.totalPagesRead, 0);

        const totalPagesTarget = targetKhatam * 604;
        const daysLeft = 29;

        const baseDailyTarget = totalPagesTarget / 30;
        const remainingToday = Math.max(0, baseDailyTarget - pagesReadToday);
        const percentage = Math.min(100, (totalPagesRead / totalPagesTarget) * 100);

        return NextResponse.json({
            success: true,
            data: {
                totalPagesRead: Math.round(totalPagesRead * 10) / 10,
                totalPagesTarget,
                pagesReadToday: Math.round(pagesReadToday * 10) / 10,
                remainingToday: Math.round(remainingToday * 10) / 10,
                dailyTarget: Math.round(baseDailyTarget * 10) / 10,
                percentage: Math.round(percentage * 10) / 10,
                todayLogs // Kirim data rekap ke Frontend
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Gagal mengambil data progress.' }, { status: 500 });
    }
}