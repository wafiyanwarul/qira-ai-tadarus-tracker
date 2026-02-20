// app/api/progress/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const logs = await prisma.progressLog.findMany({
            where: { userId: 'guest-user' }
        });

        const totalPagesRead = logs.reduce((sum, log) => sum + log.totalPagesRead, 0);

        // Hitung halaman yang dibaca HARI INI (berdasarkan tanggal lokal)
        const today = new Date().toISOString().split('T')[0];
        const pagesReadToday = logs
            .filter(log => new Date(log.createdAt).toISOString().split('T')[0] === today)
            .reduce((sum, log) => sum + log.totalPagesRead, 0);

        const targetKhatam = 3;
        const totalPagesTarget = targetKhatam * 604;
        const daysLeft = 29;

        // Target asli harian (misal: 62.5 halaman/hari)
        const baseDailyTarget = totalPagesTarget / 30;

        // Sisa target hari ini (Target Harian - Yang udah dibaca hari ini)
        const remainingToday = Math.max(0, baseDailyTarget - pagesReadToday);

        const percentage = (totalPagesRead / totalPagesTarget) * 100;

        return NextResponse.json({
            success: true,
            data: {
                totalPagesRead: Math.round(totalPagesRead * 10) / 10,
                totalPagesTarget,
                pagesReadToday: Math.round(pagesReadToday * 10) / 10,
                remainingToday: Math.round(remainingToday * 10) / 10,
                dailyTarget: Math.round(baseDailyTarget * 10) / 10,
                percentage: Math.round(percentage * 10) / 10,
            }
        });

    } catch (error) {
        return NextResponse.json({ error: 'Gagal mengambil data progress.' }, { status: 500 });
    }
}