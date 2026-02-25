import { Redis } from '@upstash/redis';
import { env } from '@/src/config/env';

const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Fetch ayah from Al-Quran API with caching.
 * @param {number} surah - The number of the surah.
 * @param {number} ayah - The number of the ayah.
 * @returns {Promise<{ arabic: string, translation: string }>} - The ayah with its arabic text and Indonesian translation.
 * @throws {Error} - If there is an error while fetching the ayah.
 */
export async function getAyahWithCache(surah: number, ayah: number) {
    const cacheKey = `quran:${surah}:${ayah}`;

    try {
        // 1. Cek - is the arabic text already in (Redis)
        const cached = await redis.get<{ arabic: string, translation: string }>(cacheKey);
        if (cached) return cached;

        // 2. (Official API)
        // Pakai koma untuk narik Arab (quran-uthmani) dan Terjemahan (id.indonesian) sekaligus
        const res = await fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/editions/quran-uthmani,id.indonesian`);
        const data = await res.json();

        if (data.code === 200) {
            const result = {
                arabic: data.data[0].text,
                translation: data.data[1].text
            };

            // 3. Save to Redis (Expired 30 days because the Al-Quran text will never change, so no need to refresh it too often)
            await redis.set(cacheKey, result, { ex: 2592000 });
            return result;
        }
    } catch (error) {
        console.error("Gagal fetch Quran API:", error);
    }

    return null;
}