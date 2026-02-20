// lib/quranData.ts

export interface Surah {
    name: string;
    totalAyahs: number;
}

// Data Akurat 114 Surah Al-Quran
export const quranMetadata: Record<number, Surah> = {
    1: { name: "Al-Fatihah", totalAyahs: 7 }, 2: { name: "Al-Baqarah", totalAyahs: 286 }, 3: { name: "Ali 'Imran", totalAyahs: 200 }, 4: { name: "An-Nisa'", totalAyahs: 176 }, 5: { name: "Al-Ma'idah", totalAyahs: 120 }, 6: { name: "Al-An'am", totalAyahs: 165 }, 7: { name: "Al-A'raf", totalAyahs: 206 }, 8: { name: "Al-Anfal", totalAyahs: 75 }, 9: { name: "At-Taubah", totalAyahs: 129 }, 10: { name: "Yunus", totalAyahs: 109 },
    11: { name: "Hud", totalAyahs: 123 }, 12: { name: "Yusuf", totalAyahs: 111 }, 13: { name: "Ar-Ra'd", totalAyahs: 43 }, 14: { name: "Ibrahim", totalAyahs: 52 }, 15: { name: "Al-Hijr", totalAyahs: 99 }, 16: { name: "An-Nahl", totalAyahs: 128 }, 17: { name: "Al-Isra'", totalAyahs: 111 }, 18: { name: "Al-Kahf", totalAyahs: 110 }, 19: { name: "Maryam", totalAyahs: 98 }, 20: { name: "Taha", totalAyahs: 135 },
    21: { name: "Al-Anbiya'", totalAyahs: 112 }, 22: { name: "Al-Hajj", totalAyahs: 78 }, 23: { name: "Al-Mu'minun", totalAyahs: 118 }, 24: { name: "An-Nur", totalAyahs: 64 }, 25: { name: "Al-Furqan", totalAyahs: 77 }, 26: { name: "Ash-Shu'ara'", totalAyahs: 227 }, 27: { name: "An-Naml", totalAyahs: 93 }, 28: { name: "Al-Qasas", totalAyahs: 88 }, 29: { name: "Al-'Ankabut", totalAyahs: 69 }, 30: { name: "Ar-Rum", totalAyahs: 60 },
    31: { name: "Luqman", totalAyahs: 34 }, 32: { name: "As-Sajdah", totalAyahs: 30 }, 33: { name: "Al-Ahzab", totalAyahs: 73 }, 34: { name: "Saba'", totalAyahs: 54 }, 35: { name: "Fatir", totalAyahs: 45 }, 36: { name: "Ya Sin", totalAyahs: 83 }, 37: { name: "As-Saffat", totalAyahs: 182 }, 38: { name: "Sad", totalAyahs: 88 }, 39: { name: "Az-Zumar", totalAyahs: 75 }, 40: { name: "Ghafir", totalAyahs: 85 },
    41: { name: "Fussilat", totalAyahs: 54 }, 42: { name: "Ash-Shura", totalAyahs: 53 }, 43: { name: "Az-Zukhruf", totalAyahs: 89 }, 44: { name: "Ad-Dukhan", totalAyahs: 59 }, 45: { name: "Al-Jathiyah", totalAyahs: 37 }, 46: { name: "Al-Ahqaf", totalAyahs: 35 }, 47: { name: "Muhammad", totalAyahs: 38 }, 48: { name: "Al-Fath", totalAyahs: 29 }, 49: { name: "Al-Hujurat", totalAyahs: 18 }, 50: { name: "Qaf", totalAyahs: 45 },
    51: { name: "Ad-Zariyat", totalAyahs: 60 }, 52: { name: "At-Tur", totalAyahs: 49 }, 53: { name: "An-Najm", totalAyahs: 62 }, 54: { name: "Al-Qamar", totalAyahs: 55 }, 55: { name: "Ar-Rahman", totalAyahs: 78 }, 56: { name: "Al-Waqi'ah", totalAyahs: 96 }, 57: { name: "Al-Hadid", totalAyahs: 29 }, 58: { name: "Al-Mujadilah", totalAyahs: 22 }, 59: { name: "Al-Hashr", totalAyahs: 24 }, 60: { name: "Al-Mumtahanah", totalAyahs: 13 },
    61: { name: "As-Saff", totalAyahs: 14 }, 62: { name: "Al-Jumu'ah", totalAyahs: 11 }, 63: { name: "Al-Munafiqun", totalAyahs: 11 }, 64: { name: "At-Taghabun", totalAyahs: 18 }, 65: { name: "At-Talaq", totalAyahs: 12 }, 66: { name: "At-Tahrim", totalAyahs: 12 }, 67: { name: "Al-Mulk", totalAyahs: 30 }, 68: { name: "Al-Qalam", totalAyahs: 52 }, 69: { name: "Al-Haqqah", totalAyahs: 52 }, 70: { name: "Al-Ma'arij", totalAyahs: 44 },
    71: { name: "Nuh", totalAyahs: 28 }, 72: { name: "Al-Jinn", totalAyahs: 28 }, 73: { name: "Al-Muzzammil", totalAyahs: 20 }, 74: { name: "Al-Muddaththir", totalAyahs: 56 }, 75: { name: "Al-Qiyamah", totalAyahs: 40 }, 76: { name: "Al-Insan", totalAyahs: 31 }, 77: { name: "Al-Mursalat", totalAyahs: 50 }, 78: { name: "An-Naba'", totalAyahs: 40 }, 79: { name: "An-Nazi'at", totalAyahs: 46 }, 80: { name: "'Abasa", totalAyahs: 42 },
    81: { name: "At-Takwir", totalAyahs: 29 }, 82: { name: "Al-Infitar", totalAyahs: 19 }, 83: { name: "Al-Mutaffifin", totalAyahs: 36 }, 84: { name: "Al-Inshiqaq", totalAyahs: 25 }, 85: { name: "Al-Buruj", totalAyahs: 22 }, 86: { name: "At-Tariq", totalAyahs: 17 }, 87: { name: "Al-A'la", totalAyahs: 19 }, 88: { name: "Al-Ghashiyah", totalAyahs: 26 }, 89: { name: "Al-Fajr", totalAyahs: 30 }, 90: { name: "Al-Balad", totalAyahs: 20 },
    91: { name: "Ash-Shams", totalAyahs: 15 }, 92: { name: "Al-Lail", totalAyahs: 21 }, 93: { name: "Ad-Duha", totalAyahs: 11 }, 94: { name: "Ash-Sharh", totalAyahs: 8 }, 95: { name: "At-Tin", totalAyahs: 8 }, 96: { name: "Al-'Alaq", totalAyahs: 19 }, 97: { name: "Al-Qadr", totalAyahs: 5 }, 98: { name: "Al-Bayyinah", totalAyahs: 8 }, 99: { name: "Az-Zalzalah", totalAyahs: 8 }, 100: { name: "Al-'Adiyat", totalAyahs: 11 },
    101: { name: "Al-Qari'ah", totalAyahs: 11 }, 102: { name: "At-Takathur", totalAyahs: 8 }, 103: { name: "Al-'Asr", totalAyahs: 3 }, 104: { name: "Al-Humazah", totalAyahs: 9 }, 105: { name: "Al-Fil", totalAyahs: 5 }, 106: { name: "Quraish", totalAyahs: 4 }, 107: { name: "Al-Ma'un", totalAyahs: 7 }, 108: { name: "Al-Kauthar", totalAyahs: 3 }, 109: { name: "Al-Kafirun", totalAyahs: 6 }, 110: { name: "An-Nasr", totalAyahs: 3 },
    111: { name: "Al-Masad", totalAyahs: 5 }, 112: { name: "Al-Ikhlas", totalAyahs: 4 }, 113: { name: "Al-Falaq", totalAyahs: 5 }, 114: { name: "An-Nas", totalAyahs: 6 }
};

export function validateTadarusInput(startSurah: number, startAyah: number, endSurah: number, endAyah: number) {
    const surahAwal = quranMetadata[startSurah];
    const surahAkhir = quranMetadata[endSurah];

    if (!surahAwal || !surahAkhir) {
        return { isValid: false, message: "Wah, nomor surahnya tidak ditemukan di Al-Quran." };
    }

    if (startAyah > surahAwal.totalAyahs || startAyah < 1) {
        return { isValid: false, message: `Surah ${surahAwal.name} cuma sampai ${surahAwal.totalAyahs} ayat. Coba diulangi ya.` };
    }

    if (endAyah > surahAkhir.totalAyahs || endAyah < 1) {
        return { isValid: false, message: `Surah ${surahAkhir.name} cuma sampai ${surahAkhir.totalAyahs} ayat. Coba diulangi ya.` };
    }

    // Validasi urutan (nggak boleh mundur)
    if (startSurah > endSurah || (startSurah === endSurah && startAyah > endAyah)) {
        return { isValid: false, message: "Urutan ngajinya terbalik nih, coba diulang dari surah/ayat yang benar ya." };
    }

    return { isValid: true, message: "Valid" };
}

// caculate total ayat dari rentang surah/ayat yang diberikan, misal dari Al-Baqarah 10 sampai Ali 'Imran 5
export function calculateTotalAyahs(startSurah: number, startAyah: number, endSurah: number, endAyah: number): number {
    let total = 0;

    if (startSurah === endSurah) {
        // Kalau masih di surah yang sama (contoh: Al-Baqarah 10 - 20)
        total = endAyah - startAyah + 1;
    } else {
        // 1. Hitung sisa ayat di surah pertama
        const sisaSurahPertama = quranMetadata[startSurah].totalAyahs - startAyah + 1;
        total += sisaSurahPertama;

        // 2. Hitung total ayat di surah-surah pertengahan (kalau ada lompatan, misal dari Surah 2 ke Surah 4)
        for (let i = startSurah + 1; i < endSurah; i++) {
            total += quranMetadata[i].totalAyahs;
        }

        // 3. Tambahkan ayat di surah terakhir
        total += endAyah;
    }

    return total;
}