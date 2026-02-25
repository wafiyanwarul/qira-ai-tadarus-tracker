"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, Target, Clock, Github, ChevronDown, MapPin, ListChecks, Zap, History, BookOpen, CalendarHeart } from "lucide-react";
import MarqueeBanner from "@/components/MarqueeBanner";
import Swal from 'sweetalert2';
import confetti from 'canvas-confetti';
import { useSession, signIn, signOut } from "next-auth/react";
import { getKhatamPrayerHtml, termsAndConditionsHtml, guideHtml } from "@/lib/templates/templates";

const QiraLogo = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
    <path d="M12 2L14.5 8.5L21 9L16 13.5L17.5 20L12 16.5L6.5 20L8 13.5L3 9L9.5 8.5L12 2Z" fill="#6B8E6B" fillOpacity="0.2" />
    <path d="M12 2L14.5 8.5L21 9L16 13.5L17.5 20L12 16.5L6.5 20L8 13.5L3 9L9.5 8.5L12 2Z" stroke="#6B8E6B" strokeWidth="2" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" fill="#D97757" />
  </svg>
);

export default function Home() {
  const { data: session, status } = useSession();

  // --- STATE MANAGEMENT ---
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [volumes, setVolumes] = useState<number[]>(new Array(30).fill(0));
  const [targetKhatam, setTargetKhatam] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [locationName, setLocationName] = useState("Menunggu akses...");
  const [prayerTimings, setPrayerTimings] = useState<any>(null);
  const [imgError, setImgError] = useState(false);
  const [energy, setEnergy] = useState({ used: 0, max: 10 });

  const [progress, setProgress] = useState({
    totalPagesRead: 0, totalPagesTarget: 604, pagesReadToday: 0,
    remainingToday: 20.1, dailyTarget: 20.1, percentage: 0, todayLogs: [] as any[], lastRead: null as any,
    remainingDays: 30, puasaHariKe: 1
  });

  const [prayerRecommendation, setPrayerRecommendation] = useState({ upcomingCount: 0, pagesPerPrayer: 0, nextPrayerName: "Subuh" });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- EFFECTS & LOGICS ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsDropdownOpen(false);
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
          html: `<p class="text-[#4A4238] text-sm">Selamat datang di Qira.ai. Tinggal sebutin surah dan ayatnya, AI kami yang otomatis nge-rekap!</p><div class="mt-4 bg-[#FFF4F1] p-3 rounded-xl border border-[#FADCD5] text-left"><p class="text-xs text-[#D97757] font-semibold leading-relaxed">📍 <b>Penting:</b> Setelah ini, izinkan akses <b>Lokasi</b> ya! Ini khusus dipakai agar sistem bisa menghitung pembagian target tadarus sesuai <b>Jadwal Sholat</b> di wilayahmu.</p></div>`,
          confirmButtonText: 'Mulai', confirmButtonColor: '#6B8E6B', background: '#FDFBF7', customClass: { popup: '!rounded-3xl' }
        });
        localStorage.setItem('qira_onboarded', 'true');
      }
      fetchLocationAndPrayers();
    };
    initApp();
  }, [status]);

  useEffect(() => { if (status === "authenticated") fetchProgress(); }, [targetKhatam, status]);
  useEffect(() => { if (prayerTimings && progress) calculatePrayerTargets(progress.remainingToday, prayerTimings); }, [progress.remainingToday, prayerTimings]);

  const fetchLocationAndPrayers = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        try {
          const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=11`);
          const data = await res.json();
          setPrayerTimings(data.data.timings);
          if (session?.user) {
            const backendRes = await fetch('/api/location', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lat, lng }) });
            const backendData = await backendRes.json();
            if (backendData.success) setLocationName(backendData.location);
          }
        } catch (err) { setLocationName("Lokasi tak diketahui"); }
      }, () => setLocationName("Akses Lokasi Ditolak"));
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
    const prayers = [{ name: "Subuh", time: timings.Fajr }, { name: "Dzuhur", time: timings.Dhuhr }, { name: "Ashar", time: timings.Asr }, { name: "Maghrib", time: timings.Maghrib }, { name: "Isya", time: timings.Isha }];
    const upcomingPrayers = prayers.filter(p => p.time > currentTimeStr);
    if (upcomingPrayers.length > 0) {
      setPrayerRecommendation({ upcomingCount: upcomingPrayers.length, pagesPerPrayer: Math.ceil((remainingPages / upcomingPrayers.length) * 10) / 10, nextPrayerName: upcomingPrayers[0].name });
    } else {
      setPrayerRecommendation({ upcomingCount: 0, pagesPerPrayer: remainingPages, nextPrayerName: "Besok" });
    }
  };

  const showRecap = () => {
    if (progress.todayLogs.length === 0) return;
    const toArabicNumber = (num: number) => num.toString().split('').map(n => ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'][parseInt(n)]).join('');
    const recapHtml = progress.todayLogs.map(log => `
      <div style="background:#FAFAF8; margin-bottom:12px; padding:16px; border-radius:16px; text-align:left; border:1px solid #E5E0D8; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px; border-bottom: 1px dashed #E5E0D8; padding-bottom: 8px;">
          <p style="font-size:12px; font-weight:800; color:#8C8273;">🕒 ${log.time}</p>
          <p style="font-size:13px; font-weight:900; color:#D97757; background:#FFF4F1; padding:2px 8px; border-radius:8px;">+${log.pages} Hal</p>
        </div>
        ${log.arabic ? `<div style="margin-bottom: 12px; text-align: right; padding: 0 4px;"><p dir="rtl" style="font-size:24px; font-family: 'Amiri', serif; color:#3E4F3E; line-height: 2; margin-bottom: 8px;">${log.arabic} <span style="color:#6B8E6B; font-size: 20px; margin: 0 4px;">﴿${toArabicNumber(log.endAyahNumber)}﴾</span></p><p style="font-size:11px; color:#8C8273; font-style: italic; text-align: left; line-height: 1.5;">"${log.translation}"</p></div>` : ''}
        <div style="background:#EAF0EA; padding: 8px 12px; border-radius: 8px; display:inline-block; border: 1px solid #c7dcc7;"><p style="font-size:12px; font-weight:bold; color:#4A6B4A;">📖 ${log.start} s/d ${log.end}</p></div>
      </div>
    `).join('');
    Swal.fire({ title: 'Rekap Tadarus Hari Ini 📖', html: `<div style="max-height: 60vh; overflow-y: auto; padding-right:4px;">${recapHtml}</div>`, confirmButtonText: 'Tutup', confirmButtonColor: '#6B8E6B', background: '#FCFCFA', customClass: { popup: '!rounded-[2rem]' }, width: '90%' });
  };

  const playSound = (freq: number, type: "sine" | "sawtooth" = "sine", duration: number = 0.1) => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + duration);
  };
  const playSuccessChime = () => [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => setTimeout(() => playSound(freq, "sine", 0.5), i * 100));

  const startRecording = async () => {
    if (progress.totalPagesRead >= progress.totalPagesTarget) {
      Swal.fire({ title: "Masya Allah! 🏆", text: `Kamu sudah menuntaskan target ${targetKhatam}x Khatam. Tingkatkan target di menu atas untuk lanjut ngaji!`, icon: "info", confirmButtonColor: "#D97757", customClass: { popup: '!rounded-3xl' } });
      return;
    }
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

            // LOGIC FIXED: STRICT MATH LOCK!
            // Harus minimal ~603 halaman per putaran buat dianggap khatam sejati!
            const newTotalPages = progress.totalPagesRead + data.data.totalPagesRead;
            const currentLoop = Math.floor(progress.totalPagesRead / 603.5) + 1;
            const isStrictKhatam = data.isKhatam;

            const gapHtml = data.gapWarning
              ? `<div class="mt-4 mb-2 bg-[#FFF0E5] p-4 rounded-2xl border border-[#FADCD5] text-sm text-[#D97757] font-semibold flex items-start gap-3 shadow-sm text-left"><span class="text-xl">⚠️</span><div><p class="mb-1 text-[#A35941] font-black">Ada Ayat Terlewat!</p><p class="text-xs leading-relaxed">${data.gapWarning}</p></div></div>`
              : '';

            // Notifikasi hukuman kalau nyampe An-Nas tapi bolong (pages < 604)
            const skippedKhatamWarning = (data.isKhatam && !isStrictKhatam)
              ? `<div class="mt-3 bg-[#FFF4F1] p-3 rounded-xl border border-[#FADCD5] text-xs text-[#D97757] font-semibold flex items-start gap-2 shadow-sm text-left"><span class="text-base">🚨</span><p>Kamu mencapai Surah An-Nas, tapi total halamanmu belum 604. <b>Doa Khatam dikunci</b> sampai semua halaman terpenuhi!</p></div>`
              : '';

            if (isStrictKhatam) {
              confetti({ particleCount: 300, spread: 120, origin: { y: 0.4 } });
              try { const audio = new Audio('/alhamdulillah.mp3'); audio.volume = 0.4; audio.play(); } catch (e) { }

              Swal.fire({
                title: "Masyallah, Khatam! 🌟",
                html: `${gapHtml} <div class="mt-4">${getKhatamPrayerHtml(targetKhatam)}</div>`,
                icon: "success",
                confirmButtonText: "Aamiin Ya Rabbal 'Alamin",
                confirmButtonColor: "#6B8E6B",
                background: '#FCFCFA',
                width: '95%',
                customClass: { popup: '!rounded-[2.5rem]' }
              });
            } else {
              if (isTargetMet) {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                try { const audio = new Audio('/alhamdulillah.mp3'); audio.volume = 0.4; audio.play(); } catch (e) { }
              }
              Swal.fire({
                title: isTargetMet ? "Alhamdulillah! 🎉" : "Masya Allah!",
                html: `<div class="text-left space-y-2 mt-2"><div class="bg-[#EAF0EA] p-4 rounded-2xl border border-[#c7dcc7] shadow-sm"><p class="text-sm font-semibold text-[#3E4F3E]">Surah ${data.data.startSurah}:${data.data.startAyah} - Surah ${data.data.endSurah}:${data.data.endAyah}</p><p class="text-2xl font-black text-[#6B8E6B] mt-1">+${data.data.totalPagesRead} Halaman</p></div>${isTargetMet ? '<p class="text-[#D97757] font-bold text-center mt-3 tracking-wide">Target harianmu TUNTAS!</p>' : ''}${gapHtml}${skippedKhatamWarning}</div>`,
                icon: "success", confirmButtonColor: "#6B8E6B", background: '#FCFCFA', customClass: { popup: '!rounded-3xl' }
              });
            }
          } else {
            playSound(150, "sawtooth", 0.3);
            if (res.status === 429) {
              Swal.fire({ title: "Energi Habis ⚡", text: data.error, icon: "warning", confirmButtonColor: "#D97757", background: '#FDFBF7', customClass: { popup: '!rounded-3xl' } });
            } else {
              Swal.fire({ title: "Tunggu Dulu...", text: data.error, icon: "warning", confirmButtonColor: "#D97757", customClass: { popup: '!rounded-3xl' } });
            }
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

  // ============================================================================
  // 🎨 RENDER METHODS (CLEAN CODE ARCHITECTURE)
  // ============================================================================

  const renderHeader = () => (
    <div className="flex justify-between items-center w-full mb-8 lg:mb-12">
      <div className="flex items-center gap-3">
        <QiraLogo />
        <h1 className="text-2xl lg:text-3xl font-extrabold text-[#3E4F3E] tracking-tight">Qira.ai</h1>
      </div>
      <div className="flex items-center gap-3">
        {session?.user?.image && !imgError ? (
          <img src={session.user.image} alt="Profile" referrerPolicy="no-referrer" onError={() => setImgError(true)} className="w-10 h-10 lg:w-11 lg:h-11 rounded-full border-2 border-[#E5E0D8] shadow-sm object-cover" />
        ) : (
          <div className="w-10 h-10 lg:w-11 lg:h-11 bg-gradient-to-br from-[#6B8E6B] to-[#4A6B4A] rounded-full flex items-center justify-center border-2 border-[#E5E0D8] shadow-sm">
            <span className="font-bold text-white text-lg uppercase">{session?.user?.name?.charAt(0) || 'U'}</span>
          </div>
        )}
        <button onClick={() => signOut()} className="text-[11px] lg:text-xs font-bold text-[#D97757] bg-[#FFF4F1] border border-[#FADCD5] px-3.5 py-1.5 lg:py-2 rounded-full hover:bg-[#FADCD5] hover:text-[#A35941] transition-all cursor-pointer shadow-sm">Keluar</button>
      </div>
    </div>
  );

  const renderProgressSection = () => {
    // STRICT MATH: Tombol Doa Khatam cuma muncul kalau beneran lulus ujian 604 halaman!
    const strictKhatamCount = Math.floor(progress.totalPagesRead / 603.5);

    return (
      <div className="w-full flex flex-col mb-8 lg:mb-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-4 gap-4">
          <div>
            <p className="text-[11px] lg:text-xs font-black text-[#8C8273] uppercase tracking-widest mb-1">Total Halaman</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl lg:text-6xl font-black text-[#2D372B] tracking-tighter">{Math.min(progress.totalPagesRead, progress.totalPagesTarget)}</span>
              <span className="text-lg lg:text-xl font-semibold text-[#8C8273]">/ {progress.totalPagesTarget}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative" ref={dropdownRef}>
              <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 text-[#4A4238] text-xs lg:text-sm font-semibold bg-white px-4 py-2 lg:py-2.5 rounded-full border border-[#E5E0D8] cursor-pointer hover:border-[#D97757] hover:shadow-sm transition-all shadow-sm">
                <span>Target: {targetKhatam}x</span>
                <ChevronDown className={`w-4 h-4 text-[#D97757] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-full min-w-[140px] bg-white border border-[#E5E0D8] rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <div key={num} onClick={() => { setTargetKhatam(num); setIsDropdownOpen(false); }} className={`px-4 py-3 text-sm text-center cursor-pointer border-b border-[#F9F8F6] last:border-0 transition-colors ${targetKhatam === num ? 'font-bold text-[#D97757] bg-[#FFF4F1]' : 'text-[#8C8273] font-medium hover:bg-[#F3EFE8] hover:text-[#4A4238]'}`}>{num}x Khatam</div>
                  ))}
                </div>
              )}
            </div>

            {/* Hanya tampil jika benar-benar lulus verifikasi Math (strictKhatamCount > 0) */}
            {strictKhatamCount > 0 && (
              <button onClick={() => Swal.fire({ title: "Masyallah, Khatam! 🌟", html: getKhatamPrayerHtml(strictKhatamCount), icon: "success", confirmButtonText: "Aamiin Ya Rabbal 'Alamin", confirmButtonColor: "#6B8E6B", background: '#FCFCFA', width: '95%', customClass: { popup: '!rounded-[2.5rem]' } })} className="flex items-center gap-1.5 bg-gradient-to-r from-[#D97757] to-[#c26446] text-white px-4 py-2 lg:py-2.5 rounded-full text-[11px] lg:text-xs font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
                <span>✨</span> Doa Khatam
              </button>
            )}
          </div>
        </div>

        {/* Persentase diperbesar dan padding disesuaikan */}
        <div className="relative w-full h-3 lg:h-4 bg-[#E5E0D8] rounded-full mt-4 lg:mt-6 shadow-inner">
          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#6B8E6B] to-[#82a382] rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(107,142,107,0.4)]" style={{ width: `${Math.min(100, progress.percentage)}%` }}></div>

          {/* FIX: Batasi perhitungan left maksimal di 85% biar mentoknya aman dan ga kepotong */}
          <div className="absolute top-1/2 -translate-y-1/2 bg-[#D97757] text-white text-xs lg:text-sm font-black px-4 py-1.5 lg:px-5 lg:py-2 rounded-full shadow-lg transition-all border-[2px] border-white" style={{ left: `calc(${Math.min(85, Math.max(5, progress.percentage))}%)` }}>
            {progress.percentage}%
          </div>
        </div>
      </div>
    );
  };

  const renderMiddleSection = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 w-full mb-6 lg:mb-8">

      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#E5E0D8] shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden h-full min-h-[160px]">
        {progress.totalPagesRead >= progress.totalPagesTarget ? (
          <>
            <h2 className="text-[#2D372B] font-serif italic font-bold text-2xl lg:text-3xl mb-2">Target Tuntas!</h2>
            <p className="text-sm text-[#8C8273] font-medium mb-5">Masya Allah, {targetKhatam}x Khatam telah dicapai.</p>
            <button onClick={() => setIsDropdownOpen(true)} className="bg-[#D97757] text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-[#c26446] transition-all shadow-md">Tingkatkan Target</button>
          </>
        ) : progress.remainingToday <= 0 ? (
          <>
            <h2 className="text-[#2D372B] font-serif italic font-bold text-2xl lg:text-3xl mb-1 mt-2">Alhamdulillah! <span className="not-italic text-lg">✨</span></h2>
            <p className="text-sm text-[#8C8273] font-medium mb-5 mt-1">Target harianmu sudah terpenuhi.</p>
            <button onClick={showRecap} className="bg-[#6B8E6B] text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-[#5a7a5a] transition-all shadow-md hover:-translate-y-0.5 mb-2">Lihat Rekap Hari Ini</button>
          </>
        ) : (
          <div className="w-full flex flex-col items-start text-left">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-[#FFF4F1] p-2 rounded-xl border border-[#FADCD5]"><Target className="w-5 h-5 text-[#D97757]" /></div>
              <h2 className="text-[#2D372B] font-bold text-base lg:text-lg">Sisa Target Hari Ini</h2>
            </div>
            <p className="text-[#D97757] font-black text-3xl lg:text-4xl mb-4">{progress.remainingToday} <span className="text-base font-semibold text-[#8C8273]">halaman</span></p>
            <div className="w-full border-t border-[#E5E0D8] pt-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#8C8273]"><Clock className="w-4 h-4 text-[#D97757]" /><span className="text-xs font-medium">Sisa {prayerRecommendation.upcomingCount} Sholat</span></div>
              <div className="bg-[#F9F8F6] px-3 py-1.5 rounded-lg text-xs font-bold text-[#D97757] border border-[#E5E0D8]">± {prayerRecommendation.pagesPerPrayer} hal/sholat</div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col justify-center gap-4 lg:gap-6 pl-2 lg:pl-6">
        <div className="flex items-center gap-4 group">
          <div className="bg-[#F9F8F6] p-2.5 rounded-2xl border border-[#E5E0D8] group-hover:bg-white group-hover:border-[#D97757] transition-colors"><CalendarHeart className="w-5 h-5 lg:w-6 lg:h-6 text-[#8C8273] group-hover:text-[#D97757] transition-colors" /></div>
          <p className="text-sm lg:text-base font-bold text-[#4A4238]">Puasa Hari Ke-{progress.puasaHariKe} <span className="font-normal text-[#8C8273] text-xs lg:text-sm ml-1">(Sisa {progress.remainingDays} Hari)</span></p>
        </div>
        <div className="flex items-center gap-4 group">
          <div className="bg-[#F9F8F6] p-2.5 rounded-2xl border border-[#E5E0D8] group-hover:bg-white group-hover:border-[#6B8E6B] transition-colors"><Target className="w-5 h-5 lg:w-6 lg:h-6 text-[#8C8273] group-hover:text-[#6B8E6B] transition-colors" /></div>
          <p className="text-sm lg:text-base font-bold text-[#4A4238]">Target: <span className="font-extrabold text-[#6B8E6B]">{targetKhatam}x Khatam</span></p>
        </div>

        {progress.lastRead && (
          <div className="flex items-center gap-4 group">
            <div className="bg-[#F9F8F6] p-2.5 rounded-2xl border border-[#E5E0D8] group-hover:bg-white group-hover:border-[#6B8E6B] transition-colors"><History className="w-5 h-5 lg:w-6 lg:h-6 text-[#8C8273] group-hover:text-[#6B8E6B] transition-colors" /></div>
            <p className="text-sm lg:text-base font-medium text-[#4A4238]">Terakhir dibaca: <span className="font-bold text-[#2D372B]">{progress.lastRead.surahName} ayat {progress.lastRead.ayah}</span></p>
          </div>
        )}

        <div className="flex items-center gap-4 group">
          <div className="bg-[#F9F8F6] p-2.5 rounded-2xl border border-[#E5E0D8] group-hover:bg-white group-hover:border-[#D97757] transition-colors"><MapPin className="w-5 h-5 lg:w-6 lg:h-6 text-[#8C8273] group-hover:text-[#D97757] transition-colors" /></div>
          <p className="text-sm lg:text-base font-medium text-[#8C8273]">{locationName}</p>
        </div>
      </div>

    </div>
  );

  const renderBottomAction = () => (
    <div className="w-full flex flex-col items-center pt-8 lg:pt-10 border-t border-[#E5E0D8]/70 mt-2 lg:mt-4 pb-6 lg:pb-8 relative z-10">

      <div className="flex flex-col items-center justify-center w-full mt-2">
        {/* Tombol Mic */}
        <div className="relative flex items-center justify-center w-[130px] h-[130px]">
          <div className={`absolute inset-0 rounded-full border-[1.5px] border-[#D97757]/40 transition-all duration-700 ${isRecording ? 'scale-110 opacity-0' : 'scale-100 opacity-100'}`}></div>
          <button
            onClick={isRecording ? stopRecording : startRecording} disabled={isLoading}
            className={`relative z-10 flex items-center justify-center w-[84px] h-[84px] lg:w-[96px] lg:h-[96px] rounded-full transition-all duration-300 shadow-xl border-[5px] border-white cursor-pointer ${isRecording ? "bg-[#D97757] hover:bg-[#c26446] scale-95" : "bg-[#6B8E6B] hover:bg-[#5a7a5a] hover:scale-105 hover:-translate-y-1"} ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isLoading ? <Loader2 className="w-8 h-8 lg:w-10 lg:h-10 text-white animate-spin" /> : isRecording ? <Square className="w-6 h-6 lg:w-8 lg:h-8 text-white fill-current" /> : <Mic className="w-8 h-8 lg:w-10 lg:h-10 text-white" />}
          </button>
        </div>

        {/* KOTAK ANTI-LONCAT: Tinggi dikunci 80px biar UI bawahnya ga kempes narik Marquee */}
        <div className="h-[80px] flex flex-col items-center justify-start mt-3">
          {isRecording ? (
            // Saat Rekaman: Muncul Visualizer & Waktu
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
              <div className="flex items-end justify-center gap-[4px] h-6 mb-1.5">
                {volumes.map((vol, idx) => (<div key={idx} className="w-1.5 bg-[#D97757] rounded-full transition-all duration-75" style={{ height: `${Math.max(4, (vol / 255) * 24)}px` }} />))}
              </div>
              <div className="flex items-center space-x-2 text-[#D97757] font-bold text-sm"><div className="w-2.5 h-2.5 bg-[#D97757] rounded-full animate-pulse" /><span>{formatTime(recordingTime)}</span></div>
            </div>
          ) : isLoading ? (
            // Saat Loading Memproses
            <div className="flex items-center justify-center h-full">
              <p className="text-sm font-bold text-[#8C8273] animate-pulse">Memproses tadarus...</p>
            </div>
          ) : (
            // Saat Idle: Muncul Energi & Panduan
            <div className="flex items-center gap-3 lg:gap-4 mt-2 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center gap-2 bg-gradient-to-r from-[#FFF4F1] to-[#FFEFEA] border border-[#FADCD5] px-4 lg:px-5 py-2 rounded-full shadow-sm cursor-default">
                <Zap className="w-3.5 h-3.5 text-[#D97757] fill-[#D97757]" />
                <span className="text-[11px] lg:text-xs font-black text-[#D97757] uppercase tracking-widest">Energi: {energy.max - energy.used}/{energy.max}</span>
              </div>
              <button onClick={() => Swal.fire({ title: 'Panduan Qira.ai 📖', html: guideHtml, confirmButtonText: 'Tutup', confirmButtonColor: '#6B8E6B', background: '#FCFCFA', customClass: { popup: '!rounded-[2rem]' }, width: '90%' })} className="flex items-center gap-1.5 bg-[#F9F8F6] border border-[#E5E0D8] text-[#8C8273] px-4 lg:px-5 py-2 rounded-full shadow-sm hover:shadow-md hover:bg-[#F3EFE8] transition-all cursor-pointer group">
                <BookOpen className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#6B8E6B] group-hover:scale-110 transition-transform" />
                <span className="text-[11px] lg:text-xs font-bold uppercase tracking-wider">Panduan</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );

  // ============================================================================
  // 🔥 RENDER UTAMA 
  // ============================================================================

  if (status === "loading") return <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center"><Loader2 className="w-10 h-10 text-[#6B8E6B] animate-spin" /></div>;

  if (status === "unauthenticated") {
    const showTermsAndConditions = (e: React.MouseEvent) => {
      e.preventDefault();
      Swal.fire({ title: 'Syarat & Ketentuan Layanan', html: termsAndConditionsHtml, icon: 'info', confirmButtonText: 'Saya Mengerti', confirmButtonColor: '#6B8E6B', background: '#FCFCFA', customClass: { popup: '!rounded-[2rem]' }, width: '90%' });
    };

    return (
      <main className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 relative overflow-hidden" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/arabesque.png")` }}>
        <div className="absolute top-6 right-6 md:top-8 md:right-8 bg-[#6B8E6B] backdrop-blur-md border border-[#5a7a5a] px-3 lg:px-4 py-1.5 lg:py-2 rounded-full shadow-[0_0_15px_rgba(107,142,107,0.5)] flex items-center gap-1.5 lg:gap-2 z-50 cursor-default">
          <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-white rounded-full animate-pulse shadow-[0_0_5px_rgba(255,255,255,0.8)]"></div>
          <span className="text-[10px] lg:text-xs font-black text-white tracking-widest uppercase drop-shadow-sm">Qira.ai v2.5</span>
        </div>
        <div className="text-center mb-8 z-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EAF0EA] border border-[#c7dcc7] text-[#4A6B4A] text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow-sm"><span>🌙 Ramadhan 1447 H</span></div>
          <h2 className="text-3xl md:text-4xl font-black text-[#2D372B] tracking-tight mb-3">Tadarus Lebih Bermakna</h2>
          <p className="text-[#8C8273] font-medium text-sm md:text-base max-w-sm md:max-w-md mx-auto leading-relaxed">Pantau progres, kejar target khatam, dan raih<br />keberkahan bersama <span className="inline-flex items-center px-3 py-[2px] bg-white border border-[#E5E0D8] rounded-full shadow-sm text-[#2D372B] font-extrabold text-sm ml-0.5 align-baseline relative -top-[1px]">Qira.ai</span></p>
        </div>
        <div className="bg-white/95 backdrop-blur-xl p-10 md:p-12 rounded-[2.5rem] shadow-2xl text-center max-w-md w-full border border-[#E5E0D8] relative overflow-hidden z-10 group transition-all duration-500 hover:shadow-3xl hover:border-[#c7dcc7]">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none transition-opacity duration-500 group-hover:opacity-[0.05]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2v-2h2v2h2v-2h2v2h2v-2h2v2h2v-2h2v2h2v-2h2v2h2v-2h2v2h2v-2h2v2h-2v2h2v2h-2v2h2v2h-2v2h2v2h-2v2h2v2h-2v2h2v2h-2v2h2v2h-2v2h2v2h-2V20.5H20z' fill='%236B8E6B' fill-rule='evenodd'/%3E%3C/svg%3E")`, backgroundSize: '30px 30px' }} />
          <div className="relative z-10">
            <div className="flex justify-center mb-5 transition-transform duration-500 hover:scale-110"><QiraLogo /></div>
            <h1 className="text-4xl font-extrabold text-[#2D372B] mb-2 tracking-tight">Qira.ai</h1>
            <p className="text-[#8C8273] text-sm mb-10 font-bold uppercase tracking-widest">Asisten Tadarus Pintar</p>
            <button onClick={() => signIn("google")} className="w-full bg-white text-[#4A4238] border-[1.5px] border-[#E5E0D8] font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-[#F9F8F6] hover:border-[#D97757] hover:shadow-md transition-all duration-300 cursor-pointer group/btn">
              <svg className="w-5 h-5 transition-transform duration-300 group-hover/btn:scale-110" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" /><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" /></svg>
              Masuk dengan Google
            </button>
            <div className="mt-6 text-[9px] font-medium text-[#8C8273] uppercase tracking-wider">Dengan masuk, kamu menyetujui <a href="#" onClick={showTermsAndConditions} className="underline font-bold hover:text-[#D97757] transition-colors cursor-pointer">Syarat & Ketentuan</a></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4 lg:p-10 font-sans text-[#4A4238] relative" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/arabesque.png")` }}>

      <div className="absolute top-6 right-6 md:top-8 md:right-8 bg-[#6B8E6B] backdrop-blur-md border border-[#5a7a5a] px-3 py-1.5 lg:px-4 lg:py-2 rounded-full shadow-[0_0_15px_rgba(107,142,107,0.6)] flex items-center gap-1.5 lg:gap-2 z-50 cursor-default">
        <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-white rounded-full animate-pulse shadow-[0_0_5px_rgba(255,255,255,0.8)]"></div>
        <span className="text-[10px] lg:text-xs font-black text-white tracking-widest uppercase drop-shadow-sm">Qira.ai v2.5</span>
      </div>

      <div className="w-full max-w-md lg:max-w-4xl bg-[#FCFCFA]/95 backdrop-blur-xl rounded-[2.5rem] lg:rounded-[3rem] shadow-2xl border border-[#E5E0D8] flex flex-col relative z-10 overflow-hidden mt-8 lg:mt-0">

        <div className="absolute top-0 right-0 w-40 h-40 lg:w-64 lg:h-64 bg-gradient-to-bl from-[#F3EFE8] to-transparent rounded-bl-full opacity-60 pointer-events-none z-0"></div>

        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#EAF0EA]/80 to-transparent pointer-events-none z-0" />
        <div className="absolute bottom-0 left-0 right-0 h-36 opacity-[0.05] pointer-events-none z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2v-2h2v2h2v-2h2v2h2v-2h2v2h2v-2h2v2h2v-2h2v2h2v-2h2v2h2v-2h2v2h-2v2h2v2h-2v2h2v2h-2v2h2v2h-2v2h2v2h-2v2h2v2h-2v2h2v2h-2v2h2v2h-2V20.5H20z' fill='%236B8E6B' fill-rule='evenodd'/%3E%3C/svg%3E")`, backgroundSize: '30px 30px', maskImage: 'linear-gradient(to top, black, transparent)', WebkitMaskImage: 'linear-gradient(to top, black, transparent)' }} />

        {/* BUNGKUSAN KONTEN UTAMA */}
        <div className="relative z-10 flex-grow px-6 pt-6 lg:px-12 lg:pt-12 flex flex-col w-full">
          {renderHeader()}
          {renderProgressSection()}
          {renderMiddleSection()}
          {renderBottomAction()}
        </div>

        {/* MARQUEE BANNER PADA BOTTOM ABSOLUTE */}
        <div className="w-full bg-[#6B8E6B] relative z-20 mt-auto border-t border-[#5a7a5a]/30">
          <MarqueeBanner />
        </div>
      </div>

      <footer className="mt-8 relative z-10 flex flex-col items-center gap-3 bg-white/70 backdrop-blur-md px-8 py-5 rounded-3xl border border-[#E5E0D8] shadow-sm mb-4 lg:mb-0">
        <p className="text-xs font-medium text-[#8C8273]">Crafted with 🤍 by <span className="font-bold text-[#6B8E6B]">Wafiy Anwarul Hikam</span></p>
        <a href="https://github.com/wafiyanwarul/qira-ai-tadarus-tracker" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/90 border border-[#E5E0D8] px-4 py-2 rounded-full shadow-sm hover:shadow-md hover:bg-white transition-all group cursor-pointer text-[#4A4238]">
          <Github className="w-4 h-4 text-[#8C8273] group-hover:text-[#4A4238] transition-colors" />
          <span className="text-xs font-bold tracking-wide">Qira.ai Repository</span>
        </a>
      </footer>

    </main>
  );
}