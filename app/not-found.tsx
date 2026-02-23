// app/not-found.tsx
import Link from "next/link";
import { Home } from "lucide-react";

const QiraLogo = () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10">
        <path d="M12 2L14.5 8.5L21 9L16 13.5L17.5 20L12 16.5L6.5 20L8 13.5L3 9L9.5 8.5L12 2Z" fill="#6B8E6B" fillOpacity="0.2" />
        <path d="M12 2L14.5 8.5L21 9L16 13.5L17.5 20L12 16.5L6.5 20L8 13.5L3 9L9.5 8.5L12 2Z" stroke="#6B8E6B" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" fill="#D97757" />
    </svg>
);

export default function NotFound() {
    return (
        <main className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 relative overflow-hidden" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/arabesque.png")` }}>

            {/* KONTAINER UTAMA 404 */}
            <div className="bg-white/95 backdrop-blur-xl p-10 md:p-12 rounded-[2.5rem] shadow-2xl text-center max-w-sm w-full border border-[#E5E0D8] relative overflow-hidden z-10 group">

                {/* EFEK KALIGRAFI KUFIC MODERN */}
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2v-2h2v2h2v-2h2v2h2v-2h2v2h2v-2h2v2h2v-2h2v2h2v-2h2v2h-2v2h2v2h-2v2h2v2h-2v2h2v2h-2v2h2v2h-2v2h2v2h-2v2h2v2h-2v2h2v2h-2v2h2v2h-2v2h2v2h-2v2h2v2h-2v2h2v2h-2v2h2v2h-2v2h2v-2h-2v2h-2v-2h-2v2h-2v-2h-2v2h-2v-2h-2v2h-2v-2h-2v2h-2v-2h-2v2h-2v-2h-2v2h-2v-2h-2v2h-2v-2h-2v2h-2v-2h-2v2h-2v-2h-2v2h-2V20.5H20z' fill='%236B8E6B' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                        backgroundSize: '30px 30px'
                    }}
                />

                {/* ORNAMEN GRADIENT HALUS */}
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#FFF4F1] rounded-full blur-3xl opacity-60 pointer-events-none"></div>
                <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-[#EAF0EA] rounded-full blur-3xl opacity-60 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="flex justify-center mb-6 drop-shadow-sm"><QiraLogo /></div>

                    <h1 className="text-7xl font-black text-[#6B8E6B] mb-2 tracking-tighter drop-shadow-sm">404</h1>
                    <h2 className="text-xl font-extrabold text-[#3E4F3E] mb-3">Halaman Tidak Ditemukan</h2>

                    <p className="text-[#8C8273] text-sm mb-8 font-medium leading-relaxed">
                        Waduh, sepertinya kamu keluar dari jalur tadarus. Yuk, kembali ke jalan yang benar!
                    </p>

                    <Link href="/" className="w-full bg-gradient-to-r from-[#D97757] to-[#c26446] text-white px-5 py-3.5 rounded-2xl text-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group/btn">
                        <Home className="w-4 h-4 transition-transform duration-300 group-hover/btn:-translate-y-0.5" />
                        Kembali ke Beranda
                    </Link>
                </div>
            </div>

            <div className="absolute bottom-8 text-center z-10">
                <p className="text-[10px] text-[#A39A8E] font-medium tracking-[0.15em] uppercase opacity-80">
                    A Product by <strong className="text-[#6B8E6B]">Illusphere Creative</strong>
                </p>
            </div>

        </main>
    );
}