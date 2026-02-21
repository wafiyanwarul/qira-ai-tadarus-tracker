import Link from "next/link";

export default function TermsOfService() {
    return (
        <main className="min-h-screen bg-[#FDFBF7] p-8 text-[#4A4238] font-sans flex justify-center">
            <div className="max-w-2xl w-full bg-white p-8 rounded-[2rem] shadow-sm border border-[#E5E0D8]">
                <h1 className="text-2xl font-black text-[#3E4F3E] mb-6">Persyaratan Layanan (Terms of Service)</h1>
                <div className="space-y-4 text-sm leading-relaxed">
                    <p>Terakhir diperbarui: Februari 2026</p>
                    <p><strong>1. Penggunaan Layanan</strong><br />Qira.ai adalah asisten tadarus eksperimental. Pengguna diharapkan menggunakan aplikasi ini dengan bijak untuk tujuan kebaikan (mencatat progres ngaji).</p>
                    <p><strong>2. Batasan Teknologi AI</strong><br />Aplikasi ini menggunakan teknologi Kecerdasan Buatan (AI) untuk mendeteksi ucapan. Meskipun kami berusaha memberikan akurasi tertinggi, kami tidak menjamin 100% akurasi ekstraksi surah dan ayat. Pengguna disarankan tetap mengecek manual hasil rekap jika diperlukan.</p>
                    <p><strong>3. Ketersediaan Layanan</strong><br />Kami berhak membatasi penggunaan (Rate Limiting) untuk menjaga stabilitas server. Kami juga tidak menjamin layanan ini akan tersedia tanpa gangguan (100% uptime).</p>
                    <p>Dikembangkan oleh <a href="https://illusphere-creative.biz.id/"><strong>Illusphere Creative</strong></a>.</p>
                </div>
                <Link href="/" className="mt-8 inline-block text-[#6B8E6B] font-bold hover:underline">Kembali ke Beranda</Link>
            </div>
        </main>
    );
}