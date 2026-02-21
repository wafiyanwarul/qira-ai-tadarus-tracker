import { Redis } from '@upstash/redis';
import { env } from '@/src/config/env';

const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
});

export async function getAyahWithCache(surah: number, ayah: number) {
    const cacheKey = `quran:${surah}:${ayah}`;

    try {
        // 1. Cek apakah teks Arab-nya udah ada di kulkas (Redis)
        const cached = await redis.get<{ arabic: string, translation: string }>(cacheKey);
        if (cached) return cached;

        // 2. Kalau belum ada, beli ke "pasar" (API Resmi)
        // Pakai koma untuk narik Arab (quran-uthmani) dan Terjemahan (id.indonesian) sekaligus
        const res = await fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/editions/quran-uthmani,id.indonesian`);
        const data = await res.json();

        if (data.code === 200) {
            const result = {
                arabic: data.data[0].text,
                translation: data.data[1].text
            };

            // 3. Simpan di kulkas Redis (Expired 30 hari karena teks Al-Quran ga akan berubah)
            await redis.set(cacheKey, result, { ex: 2592000 });
            return result;
        }
    } catch (error) {
        console.error("Gagal fetch Quran API:", error);
    }

    return null;
}