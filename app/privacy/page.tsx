import Link from "next/link";

export default function PrivacyPolicy() {
    return (
        <main className="min-h-screen bg-[#FDFBF7] p-8 text-[#4A4238] font-sans flex justify-center">
            <div className="max-w-2xl w-full bg-white p-8 rounded-[2rem] shadow-sm border border-[#E5E0D8]">
                <h1 className="text-2xl font-black text-[#3E4F3E] mb-6">Kebijakan Privasi (Privacy Policy)</h1>
                <div className="space-y-4 text-sm leading-relaxed">
                    <p>Terakhir diperbarui: Februari 2026</p>
                    <p><strong>1. Pengumpulan Data</strong><br />Qira.ai mengumpulkan informasi dasar dari akun Google Anda (Nama, Alamat Email, dan Foto Profil) semata-mata untuk keperluan autentikasi dan pembuatan profil pengguna di aplikasi.</p>
                    <p><strong>2. Data Suara (Audio)</strong><br />Rekaman suara tadarus Anda dikirim sementara ke layanan pihak ketiga (Groq Llama-3) untuk diproses menjadi teks (transkripsi). Kami <strong>tidak</strong> menyimpan file audio Anda di server kami secara permanen.</p>
                    <p><strong>3. Keamanan Data</strong><br />Log aktivitas ngaji Anda disimpan secara aman di database kami (Supabase) dan tidak akan dibagikan, dijual, atau disewakan kepada pihak ketiga mana pun.</p>
                    <p>Dikembangkan oleh <a href="https://illusphere-creative.biz.id/"><strong>Illusphere Creative</strong></a>.</p>
                </div>
                <Link href="/" className="mt-8 inline-block text-[#6B8E6B] font-bold hover:underline">Kembali ke Beranda</Link>
            </div>
        </main>
    );
}