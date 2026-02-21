"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, Target, Clock, Github, ChevronDown, MapPin, ListChecks, Zap, History } from "lucide-react";
import Swal from 'sweetalert2';
import confetti from 'canvas-confetti';
import { useSession, signIn, signOut } from "next-auth/react";

const QiraLogo = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
    <path d="M12 2L14.5 8.5L21 9L16 13.5L17.5 20L12 16.5L6.5 20L8 13.5L3 9L9.5 8.5L12 2Z" fill="#6B8E6B" fillOpacity="0.2" />
    <path d="M12 2L14.5 8.5L21 9L16 13.5L17.5 20L12 16.5L6.5 20L8 13.5L3 9L9.5 8.5L12 2Z" stroke="#6B8E6B" strokeWidth="2" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" fill="#D97757" />
  </svg>
);

export default function Home() {
  const { data: session, status } = useSession();

  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [volumes, setVolumes] = useState<number[]>(new Array(30).fill(0));
  const [targetKhatam, setTargetKhatam] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State Custom Dropdown
  const [locationName, setLocationName] = useState("Menunggu akses...");
  const [prayerTimings, setPrayerTimings] = useState<any>(null);
  const [imgError, setImgError] = useState(false);
  const [energy, setEnergy] = useState({ used: 0, max: 10 });

  const [progress, setProgress] = useState({
    totalPagesRead: 0, totalPagesTarget: 604, pagesReadToday: 0,
    remainingToday: 20.1, dailyTarget: 20.1, percentage: 0, todayLogs: [] as any[], lastRead: null as any
  });

  const [prayerRecommendation, setPrayerRecommendation] = useState({ upcomingCount: 0, pagesPerPrayer: 0, nextPrayerName: "Subuh" });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Ref untuk klik di luar dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    const initApp = async () => {
      const hasVisited = localStorage.getItem('qira_onboarded');
      if (!hasVisited) {
        await Swal.fire({
          title: 'Marhaban ya Ramadhan ✨',
          text: 'Selamat datang di Qira.ai. Tinggal sebutin surah dan ayatnya, AI kami yang otomatis nge-rekap!',
          confirmButtonText: 'Mulai', confirmButtonColor: '#6B8E6B', background: '#FDFBF7',
          customClass: { popup: '!rounded-3xl' } // Bikin border lengkung
        });
        localStorage.setItem('qira_onboarded', 'true');
        fetchLocationAndPrayers();
      } else {
        fetchLocationAndPrayers();
      }
    };
    initApp();
  }, [status]);

  useEffect(() => { if (status === "authenticated") fetchProgress(); }, [targetKhatam, status]);

  useEffect(() => {
    if (prayerTimings && progress) calculatePrayerTargets(progress.remainingToday, prayerTimings);
  }, [progress.remainingToday, prayerTimings]);

  const fetchLocationAndPrayers = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        try {
          const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=11`);
          const data = await res.json();
          setPrayerTimings(data.data.timings);
          setLocationName(data.data.meta.timezone.split('/')[1].replace('_', ' '));
        } catch (err) { setLocationName("Lokasi tak diketahui"); }
      }, () => setLocationName("Akses Ditolak"));
    }
  };

  const fetchProgress = async () => {
    try {
      const res = await fetch(`/api/progress?target=${targetKhatam}`);
      const data = await res.json();
      if (data.success) {
        setProgress(data.data);
        if (data.data.energy) setEnergy(data.data.energy);
      }
    } catch (err) { console.error("Gagal load progress", err); }
  };

  const calculatePrayerTargets = (remainingPages: number, timings: any) => {
    const now = new Date();
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const prayers = [
      { name: "Subuh", time: timings.Fajr }, { name: "Dzuhur", time: timings.Dhuhr },
      { name: "Ashar", time: timings.Asr }, { name: "Maghrib", time: timings.Maghrib }, { name: "Isya", time: timings.Isha }
    ];
    const upcomingPrayers = prayers.filter(p => p.time > currentTimeStr);
    if (upcomingPrayers.length > 0) {
      setPrayerRecommendation({
        upcomingCount: upcomingPrayers.length,
        pagesPerPrayer: Math.ceil((remainingPages / upcomingPrayers.length) * 10) / 10,
        nextPrayerName: upcomingPrayers[0].name
      });
    } else {
      setPrayerRecommendation({ upcomingCount: 0, pagesPerPrayer: remainingPages, nextPrayerName: "Besok" });
    }
  };

  const showRecap = () => {
    if (progress.todayLogs.length === 0) return;

    // Helper untuk ubah angka biasa ke angka Arab
    const toArabicNumber = (num: number) => {
      const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
      return num.toString().split('').map(n => arabicNumbers[parseInt(n)]).join('');
    };

    const recapHtml = progress.todayLogs.map(log => `
      <div style="background:#FAFAF8; margin-bottom:12px; padding:16px; border-radius:16px; text-align:left; border:1px solid #E5E0D8; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px; border-bottom: 1px dashed #E5E0D8; padding-bottom: 8px;">
          <p style="font-size:12px; font-weight:800; color:#8C8273;">🕒 ${log.time}</p>
          <p style="font-size:13px; font-weight:900; color:#D97757; background:#FFF4F1; padding:2px 8px; border-radius:8px;">+${log.pages} Hal</p>
        </div>
        
        ${log.arabic ? `
          <div style="margin-bottom: 12px; text-align: right; padding: 0 4px;">
            <p dir="rtl" style="font-size:24px; font-family: 'Amiri', 'Traditional Arabic', serif; color:#3E4F3E; line-height: 2; margin-bottom: 8px;">
              ${log.arabic} <span style="color:#6B8E6B; font-size: 20px; margin: 0 4px; font-weight: normal;">﴿${toArabicNumber(log.endAyahNumber)}﴾</span>
            </p>
            <p style="font-size:11px; color:#8C8273; font-style: italic; text-align: left; line-height: 1.5;">"${log.translation}"</p>
          </div>
        ` : ''}
        
        <div style="background:#EAF0EA; padding: 8px 12px; border-radius: 8px; display:inline-block; border: 1px solid #c7dcc7;">
          <p style="font-size:12px; font-weight:bold; color:#4A6B4A;">📖 ${log.start} s/d ${log.end}</p>
        </div>
      </div>
    `).join('');

    Swal.fire({
      title: 'Rekap Tadarus Hari Ini 📖',
      html: `<div style="max-height: 60vh; overflow-y: auto; padding-right:4px;">${recapHtml}</div>`,
      confirmButtonText: 'Tutup',
      confirmButtonColor: '#6B8E6B',
      background: '#FDFBF7',
      customClass: { popup: '!rounded-[2rem]' },
      width: '90%'
    });
  };

  const playSound = (freq: number, type: "sine" | "sawtooth" = "sine", duration: number = 0.1) => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + duration);
  };

  const playSuccessChime = () => {
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => setTimeout(() => playSound(freq, "sine", 0.5), i * 100));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextCtor(); analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current); analyserRef.current.fftSize = 64;
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        setVolumes(Array.from(dataArray).slice(0, 30));
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder; audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.start(); playSound(880); setIsRecording(true); setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000);
    } catch (err) { Swal.fire({ title: "Oops", text: "Tolong izinkan akses mikrofon ya!", icon: "warning", customClass: { popup: '!rounded-3xl' } }); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = async () => {
        setIsRecording(false); setIsLoading(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const formData = new FormData(); formData.append("audio", new File([audioBlob], "tadarus.webm", { type: "audio/webm" }));

        try {
          const res = await fetch("/api/transcribe", { method: "POST", body: formData });
          const data = await res.json();

          if (data.success) {
            playSuccessChime();
            await fetchProgress();

            const isTargetMet = (progress.pagesReadToday + data.data.totalPagesRead) >= progress.dailyTarget;

            // Audio Alhamdulillah kembali menyala jika target beres
            if (isTargetMet) {
              confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
              try { new Audio('/alhamdulillah.mp3').play(); } catch (e) { }
            }

            // HTML Warning Ayat Terlewat
            const gapHtml = data.gapWarning
              ? `<div class="mt-4 bg-[#FFF0E5] p-3 rounded-xl border border-[#FADCD5] text-xs text-[#D97757] font-semibold flex items-start gap-2 shadow-sm text-left"><span class="text-base">💡</span><p>${data.gapWarning}</p></div>`
              : '';

            Swal.fire({
              title: isTargetMet ? "Alhamdulillah! 🎉" : "Masya Allah!",
              html: `
                <div class="text-left space-y-2 mt-2">
                  <div class="bg-[#EAF0EA] p-4 rounded-2xl border border-[#c7dcc7] shadow-sm">
                    <p class="text-sm font-semibold text-[#3E4F3E]">Surah ${data.data.startSurah}:${data.data.startAyah} - Surah ${data.data.endSurah}:${data.data.endAyah}</p>
                    <p class="text-2xl font-black text-[#6B8E6B] mt-1">+${data.data.totalPagesRead} Halaman</p>
                  </div>
                  ${isTargetMet ? '<p class="text-[#D97757] font-bold text-center mt-3 tracking-wide">Target harianmu TUNTAS!</p>' : ''}
                  ${gapHtml}
                </div>
              `,
              icon: "success", confirmButtonColor: "#6B8E6B", background: '#FDFBF7',
              customClass: { popup: '!rounded-3xl' } // Bikin border lengkung
            });
          } else {
            if (res.status === 429) {
              playSound(150, "sawtooth", 0.3);
              Swal.fire({ title: "Energi Habis ⚡", text: data.error, icon: "warning", confirmButtonColor: "#D97757", background: '#FDFBF7', customClass: { popup: '!rounded-3xl' } });
              return;
            }
            playSound(150, "sawtooth", 0.3);
            Swal.fire({ title: "Tunggu Dulu...", text: data.error, icon: "warning", confirmButtonColor: "#D97757", customClass: { popup: '!rounded-3xl' } });
          }
        } catch (err) { Swal.fire({ title: "Error", text: "Gagal memproses, cek internetmu.", icon: "error", customClass: { popup: '!rounded-3xl' } }); }
        finally { setIsLoading(false); }
      };

      mediaRecorderRef.current.stop(); playSound(440);
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      setVolumes(new Array(30).fill(0)); mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
  };

  const formatTime = (sec: number) => `${Math.floor(sec / 60).toString().padStart(2, "0")}:${(sec % 60).toString().padStart(2, "0")}`;

  if (status === "loading") {
    return <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center"><Loader2 className="w-10 h-10 text-[#6B8E6B] animate-spin" /></div>;
  }

  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/arabesque.png")` }}>
        <div className="bg-white/95 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl text-center max-w-sm w-full border border-[#E5E0D8]">
          <div className="flex justify-center mb-4"><QiraLogo /></div>
          <h1 className="text-3xl font-extrabold text-[#3E4F3E] mb-2">Qira.ai</h1>
          <p className="text-[#8C8273] text-sm mb-8 font-medium">Asisten Tadarus Pintar</p>

          <button
            onClick={() => signIn("google")}
            className="w-full bg-white text-[#4A4238] border-2 border-[#E5E0D8] font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-[#6B8E6B] hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            Masuk dengan Google
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 font-sans text-[#4A4238] relative" style={{ backgroundColor: '#FDFBF7', backgroundImage: `url("https://www.transparenttextures.com/patterns/arabesque.png")` }}>

      <div className="absolute top-6 right-6 md:top-8 md:right-8 bg-[#6B8E6B] backdrop-blur-md border border-[#5a7a5a] px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 z-50 cursor-default">
        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_5px_rgba(255,255,255,0.8)]"></div>
        <span className="text-[10px] font-black text-white tracking-widest uppercase drop-shadow-sm">Qira.ai v2.0</span>
      </div>

      {/* overflow-hidden dihapus dari sini */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-xl border border-[#E5E0D8] p-8 flex flex-col items-center space-y-7 relative z-10 mt-6">

        {/* Dekorasi dibungkus kontainer khusus biar nggak meluber */}
        <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F3EFE8] rounded-bl-full opacity-50" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#EAF0EA] rounded-tr-full opacity-50" />
        </div>

        <div className="relative z-50 w-full flex justify-between items-start">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-[#3E4F3E] flex items-center gap-2">Qira.ai <QiraLogo /></h1>

            {/* CUSTOM DROPDOWN UI */}
            <div className="relative" ref={dropdownRef}>
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1.5 text-[#8C8273] text-sm font-medium bg-[#F9F8F6] px-3 py-1.5 rounded-xl border border-[#E5E0D8] cursor-pointer hover:bg-[#F3EFE8] transition-colors shadow-sm w-fit"
              >
                <span className="text-[11px] uppercase tracking-wider">Target Khatam:</span>
                <span className="font-bold text-[#D97757] text-sm">{targetKhatam}x</span>
                <ChevronDown className={`w-4 h-4 text-[#D97757] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-full min-w-[140px] bg-white border border-[#E5E0D8] rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <div
                      key={num}
                      onClick={() => { setTargetKhatam(num); setIsDropdownOpen(false); }}
                      className={`px-4 py-3 text-sm text-center cursor-pointer border-b border-[#F9F8F6] last:border-0 transition-colors ${targetKhatam === num ? 'font-bold text-[#D97757] bg-[#FFF4F1]' : 'text-[#8C8273] font-medium hover:bg-[#F3EFE8] hover:text-[#4A4238]'}`}
                    >
                      {num}x Khatam
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          <div className="flex flex-col items-end gap-2">
            {session?.user?.image && !imgError ? (
              <img src={session.user.image} alt="Profile" referrerPolicy="no-referrer" onError={() => setImgError(true)} className="w-12 h-12 rounded-full border-[3px] border-white shadow-md object-cover" />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-[#6B8E6B] to-[#4A6B4A] rounded-full flex items-center justify-center border-[3px] border-white shadow-md">
                <span className="font-bold text-white text-lg uppercase">{session?.user?.name?.charAt(0) || 'U'}</span>
              </div>
            )}
            <button onClick={() => signOut()} className="text-[10px] font-bold text-[#D97757] bg-[#FFF4F1] px-2.5 py-1 rounded-md border border-[#FADCD5] hover:bg-[#FADCD5] hover:text-[#A35941] transition-all cursor-pointer shadow-sm">Keluar</button>
          </div>
        </div>

        <div className="relative z-10 w-full bg-[#FAFAF8] rounded-3xl p-5 border border-[#E5E0D8] flex flex-col gap-4 shadow-sm">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black text-[#A39A8E] uppercase tracking-widest mb-1.5">Total Halaman</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-[#4A4238]">{progress.totalPagesRead}</span>
                <span className="text-sm font-semibold text-[#8C8273]">/ {progress.totalPagesTarget}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="bg-[#EAF0EA] text-[#6B8E6B] font-bold px-3 py-1 rounded-full text-sm shadow-inner border border-[#c7dcc7]">{progress.percentage}%</span>
            </div>
          </div>

          <div className="w-full h-3.5 bg-[#E5E0D8] rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-gradient-to-r from-[#6B8E6B] to-[#82a382] transition-all duration-1000 ease-out rounded-full relative" style={{ width: `${Math.min(100, progress.percentage)}%` }}>
              <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-[pulse_2s_ease-in-out_infinite]"></div>
            </div>
          </div>

          {progress.remainingToday > 0 ? (
            <div className="bg-gradient-to-br from-[#FFF4F1] to-white border border-[#FADCD5] rounded-2xl p-4 flex flex-col gap-3 mt-2 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-[#D97757] to-[#A35941] p-2 rounded-xl shadow-md"><Target className="w-5 h-5 text-white" /></div>
                <div>
                  <p className="text-[10px] font-black text-[#D97757] uppercase tracking-widest">Sisa Target Hari Ini</p>
                  <p className="text-sm font-medium text-[#A35941]"><span className="font-bold text-lg">{progress.remainingToday}</span> halaman</p>
                </div>
              </div>
              <div className="border-t border-[#FADCD5]/60 pt-3 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#A35941]">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-semibold">Tersisa {prayerRecommendation.upcomingCount} Sholat</span>
                  </div>
                  <div className="bg-white px-2.5 py-1 rounded-lg text-xs font-bold text-[#D97757] shadow-sm border border-[#FADCD5]">± {prayerRecommendation.pagesPerPrayer} hal / sholat</div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-[#D97757]/80 font-semibold">
                  <MapPin className="w-3 h-3" /><span>Jadwal: {locationName}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-[#EAF0EA] to-white border border-[#c7dcc7] rounded-2xl p-5 flex flex-col items-center justify-center text-center mt-2 shadow-sm">
              <p className="text-[#3E4F3E] font-black text-lg">Alhamdulillah! 🎉</p>
              <p className="text-sm text-[#6B8E6B] font-medium mt-1 mb-4">Target harianmu sudah terpenuhi.</p>
              <button onClick={showRecap} className="flex items-center gap-2 bg-[#6B8E6B] text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-[#5a7a5a] transition-all shadow-md cursor-pointer hover:-translate-y-0.5"><ListChecks className="w-4 h-4" /> Lihat Rekap Hari Ini</button>
            </div>
          )}
        </div>

        {/* UI LAST READ REMINDER */}
        {!isRecording && !isLoading && progress.lastRead && (
          <div className="flex items-center gap-2 bg-[#F9F8F6] border border-[#E5E0D8] px-4 py-2 rounded-full shadow-sm text-xs font-medium text-[#8C8273]">
            <History className="w-4 h-4 text-[#6B8E6B]" />
            Terakhir dibaca: <span className="font-bold text-[#6B8E6B]">{progress.lastRead.surahName} ayat {progress.lastRead.ayah}</span>
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center justify-center w-full min-h-[170px]">
          <button
            onClick={isRecording ? stopRecording : startRecording} disabled={isLoading}
            className={`relative flex items-center justify-center w-[104px] h-[104px] rounded-full transition-all duration-300 shadow-2xl border-[6px] border-white cursor-pointer ${isRecording ? "bg-[#D97757] hover:bg-[#c26446] scale-95" : "bg-[#6B8E6B] hover:bg-[#5a7a5a] hover:scale-105 hover:-translate-y-1"} ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isLoading ? <Loader2 className="w-10 h-10 text-white animate-spin" /> : isRecording ? <Square className="w-8 h-8 text-white fill-current" /> : <Mic className="w-11 h-11 text-white" />}
          </button>

          <div className={`mt-6 flex items-end justify-center gap-[4px] h-10 transition-opacity duration-300 ${isRecording ? "opacity-100" : "opacity-0 hidden"}`}>
            {volumes.map((vol, idx) => (<div key={idx} className="w-1.5 bg-[#D97757] rounded-full transition-all duration-75" style={{ height: `${Math.max(4, (vol / 255) * 40)}px` }} />))}
          </div>

          {!isRecording && !isLoading && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-[#FFF4F1] to-[#FFEFEA] border border-[#FADCD5] px-4 py-1.5 rounded-full shadow-md mt-6 hover:shadow-lg transition-all cursor-default">
              <Zap className="w-4 h-4 text-[#D97757] fill-[#D97757]" />
              <span className="text-xs font-black text-[#D97757] uppercase tracking-widest">Energi: {energy.max - energy.used} Setoran</span>
            </div>
          )}

          <div className="mt-3 h-6 flex items-center justify-center">
            {isRecording ? (
              <div className="flex items-center space-x-2 text-[#D97757] font-bold"><div className="w-2.5 h-2.5 bg-[#D97757] rounded-full animate-pulse" /><span>{formatTime(recordingTime)}</span></div>
            ) : isLoading ? <p className="text-sm font-semibold text-[#8C8273] animate-pulse">Memproses tadarus...</p> : null}
          </div>
        </div>
      </div>

      <footer className="mt-8 relative z-10 flex flex-col items-center gap-3 bg-white/70 backdrop-blur-md px-8 py-5 rounded-3xl border border-[#E5E0D8] shadow-sm">
        <p className="text-xs font-medium text-[#8C8273]">Crafted with 🤍 by <span className="font-bold text-[#6B8E6B]">Wafiy Anwarul Hikam</span></p>
        <a href="https://github.com/wafiyanwarul/qira-ai-tadarus-tracker" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/90 border border-[#E5E0D8] px-4 py-2 rounded-full shadow-sm hover:shadow-md hover:bg-white transition-all group cursor-pointer text-[#4A4238]">
          <Github className="w-4 h-4 text-[#8C8273] group-hover:text-[#4A4238] transition-colors" />
          <span className="text-xs font-bold tracking-wide">Qira.ai Repository</span>
        </a>
      </footer>
    </main>
  );
}