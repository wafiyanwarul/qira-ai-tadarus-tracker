// src/lib/quranData.ts

export interface Surah {
    number: number;
    name: string;
    totalAyahs: number;
}

// Data statis untuk validasi (Sample 5 Surah awal & 1 Surah akhir untuk testing)
// Nanti kita bisa load dari JSON file yang lebih lengkap
export const quranMetadata: Record<number, Surah> = {
    1: { number: 1, name: "Al-Fatihah", totalAyahs: 7 },
    2: { number: 2, name: "Al-Baqarah", totalAyahs: 286 },
    3: { number: 3, name: "Ali 'Imran", totalAyahs: 200 },
    4: { number: 4, name: "An-Nisa'", totalAyahs: 176 },
    5: { number: 5, name: "Al-Ma'idah", totalAyahs: 120 },
    114: { number: 114, name: "An-Nas", totalAyahs: 6 }
};

/**
 * Fungsi untuk validasi apakah input surah dan ayat masuk akal
 */
export function validateTadarusInput(surahNumber: number, ayahNumber: number): { isValid: boolean; message: string } {
    const surah = quranMetadata[surahNumber];

    if (!surah) {
        return { isValid: false, message: `Surah ke-${surahNumber} tidak ditemukan.` };
    }

    if (ayahNumber > surah.totalAyahs || ayahNumber < 1) {
        return {
            isValid: false,
            message: `Tunggu dulu, Surah ${surah.name} itu cuma punya ${surah.totalAyahs} ayat lho. Coba cek lagi ya!`
        };
    }

    return { isValid: true, message: "Valid" };
}