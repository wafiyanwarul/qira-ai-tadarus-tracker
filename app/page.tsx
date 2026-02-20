"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, BookOpen, Target, Sparkles, Clock, Github, ChevronDown, MapPin, ListChecks } from "lucide-react";
import Swal from 'sweetalert2';
import confetti from 'canvas-confetti';

// Komponen Custom Logo Qira.ai (Islamic Star + Tech Core)
const QiraLogo = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
    <path d="M12 2L14.5 8.5L21 9L16 13.5L17.5 20L12 16.5L6.5 20L8 13.5L3 9L9.5 8.5L12 2Z" fill="#6B8E6B" fillOpacity="0.2"/>
    <path d="M12 2L14.5 8.5L21 9L16 13.5L17.5 20L12 16.5L6.5 20L8 13.5L3 9L9.5 8.5L12 2Z" stroke="#6B8E6B" strokeWidth="2" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3" fill="#D97757"/>
  </svg>
);

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [volumes, setVolumes] = useState<number[]>(new Array(30).fill(0)); 
  
  const [targetKhatam, setTargetKhatam] = useState(1);
  const [locationName, setLocationName] = useState("Menunggu akses...");
  const [prayerTimings, setPrayerTimings] = useState<any>(null);

  const [progress, setProgress] = useState({
    totalPagesRead: 0,
    totalPagesTarget: 604,
    pagesReadToday: 0,
    remainingToday: 20.1,
    dailyTarget: 20.1,
    percentage: 0,
    todayLogs: [] as any[]
  });

  const [prayerRecommendation, setPrayerRecommendation] = useState({ upcomingCount: 0, pagesPerPrayer: 0, nextPrayerName: "Subuh" });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const initApp = async () => {
      const hasVisited = localStorage.getItem('qira_onboarded');
      
      if (!hasVisited) {
        await Swal.fire({
          title: 'Marhaban ya Ramadhan ✨',
          text: 'Selamat datang di Qira.ai, asisten personal tadarusmu. Tinggal sebutin surah dan ayatnya, AI kami yang otomatis nge-rekap progresmu!',
          confirmButtonText: 'Mulai Perjalanan',
          confirmButtonColor: '#6B8E6B',
          background: '#FDFBF7',
          color: '#4A4238',
          backdrop: `rgba(10, 25, 47, 0.4)`
        });

        await Swal.fire({
          title: 'Akses Jadwal Sholat 🕌',
          text: 'Biar Qira.ai bisa ngasih target pintar sesuai waktu sholat di tempatmu, izinkan akses lokasi ya.',
          icon: 'info',
          confirmButtonText: 'Izinkan Lokasi',
          confirmButtonColor: '#D97757',
          background: '#FDFBF7',
          color: '#4A4238',
        });
        
        localStorage.setItem('qira_onboarded', 'true');
        fetchLocationAndPrayers();
      } else {
        fetchLocationAndPrayers();
      }
    };
    initApp();
  }, []);

  useEffect(() => { fetchProgress(); }, [targetKhatam]);

  useEffect(() => {
    if (prayerTimings && progress) {
      calculatePrayerTargets(progress.remainingToday, prayerTimings);
    }
  }, [progress.remainingToday, prayerTimings]);

  const fetchLocationAndPrayers = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude; const lng = position.coords.longitude;
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
      if (data.success) setProgress(data.data);
    } catch (err) { console.error("Gagal load progress", err); }
  };

  const calculatePrayerTargets = (remainingPages: number, timings: any) => {
    const now = new Date();
    const currentHour = now.getHours(); const currentMin = now.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;

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
    const recapHtml = progress.todayLogs.map(log => `
      <div style="background:#EAF0EA; margin-bottom:8px; padding:10px; border-radius:10px; text-align:left; border:1px solid #c7dcc7;">
        <p style="font-size:12px; font-weight:bold; color:#3E4F3E;">${log.time}</p>
        <p style="font-size:14px; color:#4A4238;">${log.start} - ${log.end}</p>
        <p style="font-size:13px; font-weight:bold; color:#6B8E6B;">+${log.pages} Halaman</p>
      </div>
    `).join('');

    Swal.fire({
      title: 'Rekap Tadarus Hari Ini 📖',
      html: `<div style="max-height: 250px; overflow-y: auto;">${recapHtml}</div>`,
      confirmButtonText: 'Tutup', confirmButtonColor: '#6B8E6B', background: '#FDFBF7'
    });
  };

  const playBeep = (type: "start" | "stop") => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.type = "sine"; osc.frequency.setValueAtTime(type === "start" ? 880 : 440, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.1);
  };

  const playSuccessChime = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = "sine"; osc.frequency.value = freq;
      const startTime = ctx.currentTime + (i * 0.1);
      gain.gain.setValueAtTime(0, startTime); gain.gain.linearRampToValueAtTime(0.1, startTime + 0.05); gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
      osc.connect(gain); gain.connect(ctx.destination); osc.start(startTime); osc.stop(startTime + 0.5);
    });
  };

  const playErrorBeep = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.type = "sawtooth"; osc.frequency.setValueAtTime(150, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.2, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.3);
  };

  const triggerConfetti = () => {
    const end = Date.now() + 3000;
    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#6B8E6B', '#D97757', '#F3EFE8'] });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#6B8E6B', '#D97757', '#F3EFE8'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextCtor();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current); analyserRef.current.fftSize = 64; 
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const newVolumes = []; for (let i = 0; i < 30; i++) newVolumes.push(dataArray[i] || 0);
        setVolumes(newVolumes); animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder; audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };
      
      mediaRecorder.start(); playBeep("start"); setIsRecording(true); setRecordingTime(0);
      timerRef.current = setInterval(() => { setRecordingTime((prev) => prev + 1); }, 1000);
    } catch (error) { Swal.fire("Oops", "Tolong izinkan akses mikrofon ya!", "warning"); }
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
            new Audio('/alhamdulillah.mp3').play(); 
            await fetchProgress(); 
            
            const isTargetMet = (progress.pagesReadToday + data.data.totalPagesRead) >= progress.dailyTarget;
            if (isTargetMet) triggerConfetti();

            Swal.fire({
              title: isTargetMet ? "Alhamdulillah! 🎉" : "Masya Allah!",
              html: `
                <div class="text-left space-y-2 mt-2">
                  <div class="bg-[#EAF0EA] p-3 rounded-xl border border-[#c7dcc7]">
                    <p class="text-sm font-semibold text-[#3E4F3E]">Surah ${data.data.startSurah}:${data.data.startAyah} - Surah ${data.data.endSurah}:${data.data.endAyah}</p>
                    <p class="text-lg font-black text-[#6B8E6B]">+${data.data.totalPagesRead} Halaman</p>
                  </div>
                  ${isTargetMet ? '<p class="text-[#D97757] font-bold text-center mt-3">Target harianmu TUNTAS!</p>' : ''}
                </div>
              `,
              icon: "success", confirmButtonColor: "#6B8E6B", background: '#FDFBF7'
            });
          } else {
            playErrorBeep();
            Swal.fire({ title: "Tunggu Dulu...", text: data.error, icon: "warning", confirmButtonColor: "#D97757" });
          }
        } catch (err) { Swal.fire("Error", "Gagal memproses, cek internetmu.", "error"); } 
        finally { setIsLoading(false); }
      };
      
      mediaRecorderRef.current.stop(); playBeep("stop");
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      setVolumes(new Array(30).fill(0)); mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <main 
      className="min-h-screen flex flex-col items-center justify-center p-6 font-sans text-[#4A4238] relative"
      style={{ backgroundColor: '#FDFBF7', backgroundImage: `url("https://www.transparenttextures.com/patterns/arabesque.png")` }}
    >
      
      {/* VERSION BADGE (Hijau Matcha dgn Teks Putih & Dot Putih Kelip-kelip) */}
      <div className="absolute top-6 right-6 md:top-8 md:right-8 bg-[#6B8E6B] backdrop-blur-md border border-[#5a7a5a] px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 z-50">
        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_5px_rgba(255,255,255,0.8)]"></div>
        <span className="text-[10px] font-black text-white tracking-widest uppercase drop-shadow-sm">Qira.ai v1.0</span>
      </div>

      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-[2rem] shadow-xl border border-[#E5E0D8] p-8 flex flex-col items-center space-y-7 relative overflow-hidden z-10 mt-6">
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F3EFE8] rounded-bl-full -z-0 opacity-50" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#EAF0EA] rounded-tr-full -z-0 opacity-50" />

        <div className="relative z-10 w-full flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-[#3E4F3E] flex items-center gap-2">
              Qira.ai <QiraLogo />
            </h1>
            <div className="flex items-center gap-1 text-[#8C8273] text-sm font-medium bg-[#F9F8F6] px-2 py-1 rounded-md border border-[#E5E0D8] w-fit cursor-pointer hover:bg-[#F3EFE8] transition-colors">
              <span className="text-xs">Target Khatam:</span>
              <select 
                value={targetKhatam}
                onChange={(e) => setTargetKhatam(Number(e.target.value))}
                className="bg-transparent font-bold text-[#D97757] outline-none cursor-pointer appearance-none pr-1"
              >
                {[1,2,3,4,5,6].map(num => <option key={num} value={num}>{num}x</option>)}
              </select>
              <ChevronDown className="w-3 h-3 text-[#D97757]" />
            </div>
          </div>
          <div className="w-12 h-12 bg-[#F3EFE8] rounded-full flex items-center justify-center border border-[#E5E0D8] shadow-inner">
            <BookOpen className="w-6 h-6 text-[#6B8E6B]" />
          </div>
        </div>

        <div className="relative z-10 w-full bg-[#FAFAF8] rounded-2xl p-5 border border-[#E5E0D8] flex flex-col gap-4 shadow-sm">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs font-bold text-[#A39A8E] uppercase tracking-wider mb-1">Total Halaman</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-[#4A4238]">{progress.totalPagesRead}</span>
                <span className="text-sm font-semibold text-[#8C8273]">/ {progress.totalPagesTarget}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="bg-[#EAF0EA] text-[#6B8E6B] font-bold px-3 py-1 rounded-full text-sm shadow-inner">
                {progress.percentage}%
              </span>
            </div>
          </div>

          <div className="w-full h-3 bg-[#E5E0D8] rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-[#6B8E6B] transition-all duration-1000 ease-out rounded-full relative" style={{ width: `${Math.min(100, progress.percentage)}%` }}>
              <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-[pulse_2s_ease-in-out_infinite]"></div>
            </div>
          </div>

          {progress.remainingToday > 0 ? (
            <div className="bg-[#FFF4F1] border border-[#FADCD5] rounded-xl p-4 flex flex-col gap-3 mt-2 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-[#D97757] p-2 rounded-lg shadow-sm"><Target className="w-5 h-5 text-white" /></div>
                <div>
                  <p className="text-xs font-bold text-[#D97757] uppercase tracking-wider">Sisa Target Hari Ini</p>
                  <p className="text-sm font-medium text-[#A35941]"><span className="font-bold text-lg">{progress.remainingToday}</span> halaman</p>
                </div>
              </div>
              <div className="border-t border-[#FADCD5]/50 pt-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#A35941]">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-semibold">Tersisa {prayerRecommendation.upcomingCount} Sholat</span>
                  </div>
                  <div className="bg-white/60 px-2 py-1 rounded-md text-xs font-bold text-[#D97757] shadow-sm">
                    ± {prayerRecommendation.pagesPerPrayer} hal / sholat
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-[#D97757]/70 font-medium">
                  <MapPin className="w-3 h-3" /><span>Jadwal: {locationName}</span>
                </div>
              </div>
            </div>
          ) : (
             <div className="bg-[#EAF0EA] border border-[#c7dcc7] rounded-xl p-4 flex flex-col items-center justify-center text-center mt-2 shadow-sm">
                <p className="text-[#3E4F3E] font-bold">Alhamdulillah! 🎉</p>
                <p className="text-sm text-[#6B8E6B] font-medium mt-1 mb-3">Target harianmu sudah terpenuhi.</p>
                <button 
                  onClick={showRecap}
                  className="flex items-center gap-2 bg-[#6B8E6B] text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-[#5a7a5a] transition-colors shadow-md"
                >
                  <ListChecks className="w-4 h-4" /> Lihat Rekap Hari Ini
                </button>
             </div>
          )}
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full min-h-[170px]">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 shadow-xl border-[6px] border-white ${isRecording ? "bg-[#D97757] hover:bg-[#c26446] scale-95" : "bg-[#6B8E6B] hover:bg-[#5a7a5a] hover:scale-105"} ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isLoading ? <Loader2 className="w-10 h-10 text-white animate-spin" /> : isRecording ? <Square className="w-8 h-8 text-white fill-current" /> : <Mic className="w-10 h-10 text-white" />}
          </button>
          <div className={`mt-6 flex items-end justify-center gap-[4px] h-10 transition-opacity duration-300 ${isRecording ? "opacity-100" : "opacity-0 hidden"}`}>
            {volumes.map((vol, idx) => (<div key={idx} className="w-1.5 bg-[#D97757] rounded-full transition-all duration-75" style={{ height: `${Math.max(4, (vol / 255) * 40)}px` }} />))}
          </div>
          <div className="mt-4 h-6 flex items-center justify-center">
            {isRecording ? (
              <div className="flex items-center space-x-2 text-[#D97757] font-bold">
                <div className="w-2.5 h-2.5 bg-[#D97757] rounded-full animate-pulse" /><span>{formatTime(recordingTime)}</span>
              </div>
            ) : isLoading ? <p className="text-sm font-semibold text-[#8C8273] animate-pulse">Memproses tadarus...</p> : <p className="text-sm font-semibold text-[#8C8273]">Tap mic untuk lapor ngaji</p>}
          </div>
        </div>
      </div>

      {/* FOOTER CONTAINER */}
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