// app/api/progress/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // 1. Ambil semua log tadarus user (sementara hardcode 'guest-user' untuk MVP)
        const logs = await prisma.progressLog.findMany({
            where: { userId: 'guest-user' }
        });

        // 2. Jumlahkan total halaman yang sudah dibaca
        const totalPagesRead = logs.reduce((sum, log) => sum + log.totalPagesRead, 0);

        // 3. Kalkulasi Dinamis (Asumsi: Target Khatam 3x sebulan)
        // 1x Khatam = 604 Halaman. 3x Khatam = 1812 Halaman.
        const targetKhatam = 3;
        const totalPagesTarget = targetKhatam * 604;

        // Sisa hari puasa (Untuk MVP kita asumsikan sisa 29 hari)
        // Nanti bisa dibikin dinamis pakai Date() menghitung selisih ke Idul Fitri
        const daysLeft = 29;

        // Rumus The Gatekeeper of Target:
        const remainingPages = Math.max(0, totalPagesTarget - totalPagesRead);
        const dailyTarget = remainingPages / daysLeft;

        // Persentase
        const percentage = (totalPagesRead / totalPagesTarget) * 100;

        return NextResponse.json({
            success: true,
            data: {
                totalPagesRead: Math.round(totalPagesRead * 10) / 10, // Bulatkan 1 desimal
                totalPagesTarget,
                remainingPages: Math.round(remainingPages * 10) / 10,
                dailyTarget: Math.round(dailyTarget * 10) / 10,
                percentage: Math.round(percentage * 10) / 10,
            }
        });

    } catch (error) {
        console.error('Progress API Error:', error);
        return NextResponse.json({ error: 'Gagal mengambil data progress.' }, { status: 500 });
    }
}