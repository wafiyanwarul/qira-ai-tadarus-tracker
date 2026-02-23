import { Star } from 'lucide-react';

export default function MarqueeBanner() {
    return (
        // py-1.5 bikin bannernya tipis dan manis
        <div className="absolute bottom-0 left-0 w-full bg-[#6B8E6B] text-white py-1.5 overflow-hidden rounded-b-[2.5rem] border-t border-[#5a7a5a] flex items-center">
            <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 15s linear infinite;
        }
      `}</style>

            {/* Container ini w-max supaya teksnya membentang seluas-luasnya tanpa dipotong */}
            <div className="animate-marquee w-max">
                {/* Kita render 2 kali berturut-turut supaya loopnya nyambung (seamless) */}
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 text-[9px] font-bold tracking-[0.2em] uppercase px-4 shrink-0 whitespace-nowrap">
                        <span>Qira.ai</span>
                        <Star className="w-3 h-3 fill-[#D97757] text-white drop-shadow-sm" strokeWidth={2.5} />
                        <span>Your Smart Tadarus Tracker</span>
                        <Star className="w-3 h-3 fill-[#D97757] text-white drop-shadow-sm" strokeWidth={2.5} />
                        <span>Ramadhan 1447 H</span>
                        <Star className="w-3 h-3 fill-[#D97757] text-white drop-shadow-sm" strokeWidth={2.5} />
                        <span>Illusphere Creative</span>
                        <Star className="w-3 h-3 fill-[#D97757] text-white drop-shadow-sm" strokeWidth={2.5} />
                    </div>
                ))}
            </div>
        </div>
    );
}