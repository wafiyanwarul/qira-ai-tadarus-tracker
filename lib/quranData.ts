// lib/quranData.ts

export interface Surah {
    name: string;
    totalAyahs: number;
    startPage: number; // FITUR BARU: Mapping ke Mushaf Madinah
}

// Data Akurat 114 Surah (Ditambah startPage)
export const quranMetadata: Record<number, Surah> = {
    1: { name: "Al-Fatihah", totalAyahs: 7, startPage: 1 }, 2: { name: "Al-Baqarah", totalAyahs: 286, startPage: 2 }, 3: { name: "Ali 'Imran", totalAyahs: 200, startPage: 50 }, 4: { name: "An-Nisa'", totalAyahs: 176, startPage: 77 }, 5: { name: "Al-Ma'idah", totalAyahs: 120, startPage: 106 }, 6: { name: "Al-An'am", totalAyahs: 165, startPage: 128 }, 7: { name: "Al-A'raf", totalAyahs: 206, startPage: 151 }, 8: { name: "Al-Anfal", totalAyahs: 75, startPage: 177 }, 9: { name: "At-Taubah", totalAyahs: 129, startPage: 187 }, 10: { name: "Yunus", totalAyahs: 109, startPage: 208 },
    11: { name: "Hud", totalAyahs: 123, startPage: 221 }, 12: { name: "Yusuf", totalAyahs: 111, startPage: 235 }, 13: { name: "Ar-Ra'd", totalAyahs: 43, startPage: 249 }, 14: { name: "Ibrahim", totalAyahs: 52, startPage: 255 }, 15: { name: "Al-Hijr", totalAyahs: 99, startPage: 262 }, 16: { name: "An-Nahl", totalAyahs: 128, startPage: 267 }, 17: { name: "Al-Isra'", totalAyahs: 111, startPage: 282 }, 18: { name: "Al-Kahf", totalAyahs: 110, startPage: 293 }, 19: { name: "Maryam", totalAyahs: 98, startPage: 305 }, 20: { name: "Taha", totalAyahs: 135, startPage: 312 },
    21: { name: "Al-Anbiya'", totalAyahs: 112, startPage: 322 }, 22: { name: "Al-Hajj", totalAyahs: 78, startPage: 332 }, 23: { name: "Al-Mu'minun", totalAyahs: 118, startPage: 342 }, 24: { name: "An-Nur", totalAyahs: 64, startPage: 350 }, 25: { name: "Al-Furqan", totalAyahs: 77, startPage: 359 }, 26: { name: "Ash-Shu'ara'", totalAyahs: 227, startPage: 367 }, 27: { name: "An-Naml", totalAyahs: 93, startPage: 377 }, 28: { name: "Al-Qasas", totalAyahs: 88, startPage: 385 }, 29: { name: "Al-'Ankabut", totalAyahs: 69, startPage: 396 }, 30: { name: "Ar-Rum", totalAyahs: 60, startPage: 404 },
    31: { name: "Luqman", totalAyahs: 34, startPage: 411 }, 32: { name: "As-Sajdah", totalAyahs: 30, startPage: 415 }, 33: { name: "Al-Ahzab", totalAyahs: 73, startPage: 418 }, 34: { name: "Saba'", totalAyahs: 54, startPage: 428 }, 35: { name: "Fatir", totalAyahs: 45, startPage: 434 }, 36: { name: "Ya Sin", totalAyahs: 83, startPage: 440 }, 37: { name: "As-Saffat", totalAyahs: 182, startPage: 446 }, 38: { name: "Sad", totalAyahs: 88, startPage: 453 }, 39: { name: "Az-Zumar", totalAyahs: 75, startPage: 458 }, 40: { name: "Ghafir", totalAyahs: 85, startPage: 467 },
    41: { name: "Fussilat", totalAyahs: 54, startPage: 477 }, 42: { name: "Ash-Shura", totalAyahs: 53, startPage: 483 }, 43: { name: "Az-Zukhruf", totalAyahs: 89, startPage: 489 }, 44: { name: "Ad-Dukhan", totalAyahs: 59, startPage: 496 }, 45: { name: "Al-Jathiyah", totalAyahs: 37, startPage: 499 }, 46: { name: "Al-Ahqaf", totalAyahs: 35, startPage: 502 }, 47: { name: "Muhammad", totalAyahs: 38, startPage: 507 }, 48: { name: "Al-Fath", totalAyahs: 29, startPage: 511 }, 49: { name: "Al-Hujurat", totalAyahs: 18, startPage: 515 }, 50: { name: "Qaf", totalAyahs: 45, startPage: 518 },
    51: { name: "Ad-Zariyat", totalAyahs: 60, startPage: 520 }, 52: { name: "At-Tur", totalAyahs: 49, startPage: 523 }, 53: { name: "An-Najm", totalAyahs: 62, startPage: 526 }, 54: { name: "Al-Qamar", totalAyahs: 55, startPage: 528 }, 55: { name: "Ar-Rahman", totalAyahs: 78, startPage: 531 }, 56: { name: "Al-Waqi'ah", totalAyahs: 96, startPage: 534 }, 57: { name: "Al-Hadid", totalAyahs: 29, startPage: 537 }, 58: { name: "Al-Mujadilah", totalAyahs: 22, startPage: 542 }, 59: { name: "Al-Hashr", totalAyahs: 24, startPage: 545 }, 60: { name: "Al-Mumtahanah", totalAyahs: 13, startPage: 549 },
    61: { name: "As-Saff", totalAyahs: 14, startPage: 551 }, 62: { name: "Al-Jumu'ah", totalAyahs: 11, startPage: 553 }, 63: { name: "Al-Munafiqun", totalAyahs: 11, startPage: 554 }, 64: { name: "At-Taghabun", totalAyahs: 18, startPage: 556 }, 65: { name: "At-Talaq", totalAyahs: 12, startPage: 558 }, 66: { name: "At-Tahrim", totalAyahs: 12, startPage: 560 }, 67: { name: "Al-Mulk", totalAyahs: 30, startPage: 562 }, 68: { name: "Al-Qalam", totalAyahs: 52, startPage: 564 }, 69: { name: "Al-Haqqah", totalAyahs: 52, startPage: 566 }, 70: { name: "Al-Ma'arij", totalAyahs: 44, startPage: 568 },
    71: { name: "Nuh", totalAyahs: 28, startPage: 570 }, 72: { name: "Al-Jinn", totalAyahs: 28, startPage: 572 }, 73: { name: "Al-Muzzammil", totalAyahs: 20, startPage: 574 }, 74: { name: "Al-Muddaththir", totalAyahs: 56, startPage: 575 }, 75: { name: "Al-Qiyamah", totalAyahs: 40, startPage: 577 }, 76: { name: "Al-Insan", totalAyahs: 31, startPage: 578 }, 77: { name: "Al-Mursalat", totalAyahs: 50, startPage: 580 }, 78: { name: "An-Naba'", totalAyahs: 40, startPage: 582 }, 79: { name: "An-Nazi'at", totalAyahs: 46, startPage: 583 }, 80: { name: "'Abasa", totalAyahs: 42, startPage: 585 },
    81: { name: "At-Takwir", totalAyahs: 29, startPage: 586 }, 82: { name: "Al-Infitar", totalAyahs: 19, startPage: 587 }, 83: { name: "Al-Mutaffifin", totalAyahs: 36, startPage: 587 }, 84: { name: "Al-Inshiqaq", totalAyahs: 25, startPage: 589 }, 85: { name: "Al-Buruj", totalAyahs: 22, startPage: 590 }, 86: { name: "At-Tariq", totalAyahs: 17, startPage: 591 }, 87: { name: "Al-A'la", totalAyahs: 19, startPage: 591 }, 88: { name: "Al-Ghashiyah", totalAyahs: 26, startPage: 592 }, 89: { name: "Al-Fajr", totalAyahs: 30, startPage: 593 }, 90: { name: "Al-Balad", totalAyahs: 20, startPage: 594 },
    91: { name: "Ash-Shams", totalAyahs: 15, startPage: 595 }, 92: { name: "Al-Lail", totalAyahs: 21, startPage: 595 }, 93: { name: "Ad-Duha", totalAyahs: 11, startPage: 596 }, 94: { name: "Ash-Sharh", totalAyahs: 8, startPage: 596 }, 95: { name: "At-Tin", totalAyahs: 8, startPage: 597 }, 96: { name: "Al-'Alaq", totalAyahs: 19, startPage: 597 }, 97: { name: "Al-Qadr", totalAyahs: 5, startPage: 598 }, 98: { name: "Al-Bayyinah", totalAyahs: 8, startPage: 598 }, 99: { name: "Az-Zalzalah", totalAyahs: 8, startPage: 599 }, 100: { name: "Al-'Adiyat", totalAyahs: 11, startPage: 599 },
    101: { name: "Al-Qari'ah", totalAyahs: 11, startPage: 600 }, 102: { name: "At-Takathur", totalAyahs: 8, startPage: 600 }, 103: { name: "Al-'Asr", totalAyahs: 3, startPage: 601 }, 104: { name: "Al-Humazah", totalAyahs: 9, startPage: 601 }, 105: { name: "Al-Fil", totalAyahs: 5, startPage: 601 }, 106: { name: "Quraish", totalAyahs: 4, startPage: 602 }, 107: { name: "Al-Ma'un", totalAyahs: 7, startPage: 602 }, 108: { name: "Al-Kauthar", totalAyahs: 3, startPage: 602 }, 109: { name: "Al-Kafirun", totalAyahs: 6, startPage: 603 }, 110: { name: "An-Nasr", totalAyahs: 3, startPage: 603 },
    111: { name: "Al-Masad", totalAyahs: 5, startPage: 603 }, 112: { name: "Al-Ikhlas", totalAyahs: 4, startPage: 604 }, 113: { name: "Al-Falaq", totalAyahs: 5, startPage: 604 }, 114: { name: "An-Nas", totalAyahs: 6, startPage: 604 }
};

export function validateTadarusInput(startSurah: number, startAyah: number, endSurah: number, endAyah: number) {
    const surahAwal = quranMetadata[startSurah];
    const surahAkhir = quranMetadata[endSurah];

    if (!surahAwal || !surahAkhir) return { isValid: false, message: "Nomor surahnya tidak ditemukan di Al-Quran." };
    if (startAyah > surahAwal.totalAyahs || startAyah < 1) return { isValid: false, message: `Surah ${surahAwal.name} cuma sampai ${surahAwal.totalAyahs} ayat.` };
    if (endAyah > surahAkhir.totalAyahs || endAyah < 1) return { isValid: false, message: `Surah ${surahAkhir.name} cuma sampai ${surahAkhir.totalAyahs} ayat.` };
    if (startSurah > endSurah || (startSurah === endSurah && startAyah > endAyah)) return { isValid: false, message: "Urutan ngajinya terbalik nih, coba diulang." };

    return { isValid: true, message: "Valid" };
}

// ALGORITMA BARU: ESTIMASI HALAMAN YANG DIBACA (Return dalam bentuk Float/Desimal)
export function calculatePagesRead(startSurah: number, startAyah: number, endSurah: number, endAyah: number): number {
    let totalPages = 0;

    const getSurahPages = (surahNum: number) => {
        if (surahNum === 114) return 1; // An-Nas cuma hitung 1 halaman (asumsi akhir)
        return quranMetadata[surahNum + 1].startPage - quranMetadata[surahNum].startPage || 1;
    };

    if (startSurah === endSurah) {
        const surahData = quranMetadata[startSurah];
        const totalPagesInSurah = getSurahPages(startSurah);
        const fractionRead = (endAyah - startAyah + 1) / surahData.totalAyahs;
        totalPages = fractionRead * totalPagesInSurah;
    } else {
        // 1. Fraksi halaman di surah pertama
        const sisaAyahSurahPertama = quranMetadata[startSurah].totalAyahs - startAyah + 1;
        totalPages += (sisaAyahSurahPertama / quranMetadata[startSurah].totalAyahs) * getSurahPages(startSurah);

        // 2. Full halaman surah-surah di tengah
        for (let i = startSurah + 1; i < endSurah; i++) {
            totalPages += getSurahPages(i);
        }

        // 3. Fraksi halaman di surah terakhir
        totalPages += (endAyah / quranMetadata[endSurah].totalAyahs) * getSurahPages(endSurah);
    }

    // Dibulatkan ke 2 angka desimal (misal: 2.50 halaman)
    return Math.round(totalPages * 100) / 100;
}

// Fungsi untuk mengubah Surah & Ayat jadi nomor absolut (1 - 6236)
export function getAbsoluteAyah(surah: number, ayah: number): number {
    let absolute = 0;
    for (let i = 1; i < surah; i++) {
        if (quranMetadata[i]) {
            absolute += quranMetadata[i].totalAyahs;
        }
    }
    return absolute + ayah;
}

// Fungsi untuk mengubah nomor absolut kembali jadi Surah & Ayat (Untuk Gap Detection)
export function getSurahAyahFromAbsolute(abs: number): { surah: number; ayah: number; name: string } {
    let current = 0;
    for (let i = 1; i <= 114; i++) {
        if (current + quranMetadata[i].totalAyahs >= abs) {
            return { surah: i, ayah: abs - current, name: quranMetadata[i].name };
        }
        current += quranMetadata[i].totalAyahs;
    }
    return { surah: 114, ayah: 6, name: "An-Nas" };
}