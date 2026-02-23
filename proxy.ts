// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Koneksi ke Upstash Redis
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Buat aturan: Maksimal 30 request per 10 detik dari IP yang sama
const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(30, '10 s'),
    analytics: true,
});

export async function proxy(request: NextRequest) {
    // Ambil IP Address user dari header (Standar Next.js terbaru)
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.1';

    // Cek apakah IP ini melebih batas request
    const { success, pending, limit, reset, remaining } = await ratelimit.limit(ip);

    // Jika terlalu banyak request (Bot/Spam)
    if (!success) {
        return new NextResponse('Terdeteksi aktivitas mencurigakan. Permintaan diblokir.', {
            status: 429,
            headers: {
                'X-RateLimit-Limit': limit.toString(),
                'X-RateLimit-Remaining': remaining.toString(),
                'X-RateLimit-Reset': reset.toString(),
            },
        });
    }

    // Jika aman, persilakan masuk
    return NextResponse.next();
}

// Tentukan path mana saja yang mau dijaga ketat oleh satpam ini
export const config = {
    matcher: [
        // Lindungi semua API routes
        '/api/:path*',
        // Lindungi halaman utama
        '/',
    ],
};