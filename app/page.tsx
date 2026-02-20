"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, BookOpen, Target, Sparkles, Clock } from "lucide-react";
import Swal from 'sweetalert2';
import confetti from 'canvas-confetti';

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [volumes, setVolumes] = useState<number[]>(new Array(30).fill(0));

  const [progress, setProgress] = useState({
    totalPagesRead: 0,
    totalPagesTarget: 1812,
    pagesReadToday: 0,
    remainingToday: 62.5,
    dailyTarget: 62.5,
    percentage: 0
  });

  const [prayerRecommendation, setPrayerRecommendation] = useState({
    upcomingCount: 5,
    pagesPerPrayer: 12.5,
    nextPrayerName: "Subuh"
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 1. Fetch Progress dari Database
  const fetchProgress = async () => {
    try {
      const res = await fetch('/api/progress');
      const data = await res.json();
      if (data.success) {
        setProgress(data.data);
        calculatePrayerTargets(data.data.remainingToday);
      }
    } catch (err) {
      console.error("Gagal load progress", err);
    }
  };

  // 2. Kalkulasi Sholat (API Aladhan untuk Trenggalek)
  const calculatePrayerTargets = async (remainingPages: number) => {
    try {
      // Fetch jadwal sholat hari ini khusus area Trenggalek
      const res = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Trenggalek&country=Indonesia&method=11');
      const data = await res.json();
      const timings = data.data.timings;

      const now = new Date();
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;

      // Daftar sholat wajib
      const prayers = [
        { name: "Subuh", time: timings.Fajr },
        { name: "Dzuhur", time: timings.Dhuhr },
        { name: "Ashar", time: timings.Asr },
        { name: "Maghrib", time: timings.Maghrib },
        { name: "Isya", time: timings.Isha }
      ];

      // Cari sholat yang belum lewat jamnya
      const upcomingPrayers = prayers.filter(p => p.time > currentTimeStr);

      if (upcomingPrayers.length > 0) {
        setPrayerRecommendation({
          upcomingCount: upcomingPrayers.length,
          pagesPerPrayer: Math.ceil((remainingPages / upcomingPrayers.length) * 10) / 10,
          nextPrayerName: upcomingPrayers[0].name
        });
      } else {
        // Kalau udah lewat Isya, target dilempar ke besok pagi
        setPrayerRecommendation({
          upcomingCount: 1,
          pagesPerPrayer: remainingPages,
          nextPrayerName: "Besok Subuh"
        });
      }
    } catch (err) {
      console.error("Gagal load jadwal sholat", err);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  // --- SOUND EFFECTS ---
  const playBeep = (type: "start" | "stop") => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(type === "start" ? 880 : 440, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  // Suara Sukses yang Estetik (Chord Arpeggio)
  const playSuccessChime = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C Major Chord (C5, E5, G5, C6)

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;

      const startTime = ctx.currentTime + (i * 0.1);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  };

  const playErrorBeep = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#6B8E6B', '#D97757', '#F3EFE8']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#6B8E6B', '#D97757', '#F3EFE8']
      });

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
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 64;
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const newVolumes = [];
        for (let i = 0; i < 30; i++) newVolumes.push(dataArray[i] || 0);
        setVolumes(newVolumes);
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.start();
      playBeep("start");
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

    } catch (error) {
      alert("Tolong izinkan akses mikrofon ya!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = async () => {
        setIsRecording(false);
        setIsLoading(true);

        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioFile = new File([audioBlob], "tadarus.webm", { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", audioFile);

        try {
          const res = await fetch("/api/transcribe", { method: "POST", body: formData });
          const data = await res.json();

          if (data.success) {
            playSuccessChime(); // Bunyikan notif magis
            new Audio('/alhamdulillah.mp3').play();
            await fetchProgress(); // Refresh data progress terbaru

            // Cek apakah target hari ini terpenuhi
            const isTargetMet = (progress.pagesReadToday + data.data.totalPagesRead) >= progress.dailyTarget;

            if (isTargetMet) triggerConfetti();

            Swal.fire({
              title: isTargetMet ? "Alhamdulillah! 🎉" : "Masya Allah!",
              html: `
                <div class="text-left space-y-2 mt-2">
                  <p class="text-slate-600">Tadarus tercatat dengan baik.</p>
                  <div class="bg-[#EAF0EA] p-3 rounded-xl border border-[#c7dcc7]">
                    <p class="text-sm font-semibold text-[#3E4F3E]">Surah ${data.data.startSurah}:${data.data.startAyah} - Surah ${data.data.endSurah}:${data.data.endAyah}</p>
                    <p class="text-lg font-black text-[#6B8E6B]">+${data.data.totalPagesRead} Halaman</p>
                  </div>
                  ${isTargetMet ? '<p class="text-[#D97757] font-bold text-center mt-3">Target harianmu hari ini TUNTAS!</p>' : ''}
                </div>
              `,
              icon: "success",
              confirmButtonColor: "#6B8E6B",
            });
          } else {
            playErrorBeep();
            Swal.fire({
              title: "Tunggu Dulu...",
              text: data.error,
              icon: "warning",
              confirmButtonColor: "#D97757",
              confirmButtonText: "Ulangi"
            });
          }
        } catch (err) {
          Swal.fire("Error", "Gagal memproses, cek internetmu.", "error");
        } finally {
          setIsLoading(false);
        }
      };

      mediaRecorderRef.current.stop();
      playBeep("stop");
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      setVolumes(new Array(30).fill(0));
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      if (audioContextRef.current) audioContextRef.current.close();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 font-sans text-[#4A4238]">

      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-sm border border-[#E5E0D8] p-8 flex flex-col items-center space-y-7 relative overflow-hidden">

        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F3EFE8] rounded-bl-full -z-0 opacity-50" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#EAF0EA] rounded-tr-full -z-0 opacity-50" />

        {/* Header */}
        <div className="relative z-10 w-full flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-[#3E4F3E] flex items-center gap-2">
              Qira.ai <Sparkles className="w-5 h-5 text-[#D97757]" />
            </h1>
            <p className="text-[#8C8273] font-medium text-sm">Target Khatam 3x Sebulan</p>
          </div>
          <div className="w-12 h-12 bg-[#F3EFE8] rounded-full flex items-center justify-center border border-[#E5E0D8]">
            <BookOpen className="w-6 h-6 text-[#6B8E6B]" />
          </div>
        </div>

        {/* Dashboard Progress Panel */}
        <div className="relative z-10 w-full bg-[#FAFAF8] rounded-2xl p-5 border border-[#E5E0D8] flex flex-col gap-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs font-bold text-[#A39A8E] uppercase tracking-wider mb-1">Total Halaman</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-[#4A4238]">{progress.totalPagesRead}</span>
                <span className="text-sm font-semibold text-[#8C8273]">/ {progress.totalPagesTarget}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-[#A39A8E] uppercase tracking-wider mb-1">Progress</p>
              <span className="bg-[#EAF0EA] text-[#6B8E6B] font-bold px-3 py-1 rounded-full text-sm">
                {progress.percentage}%
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-[#E5E0D8] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#6B8E6B] transition-all duration-1000 ease-out rounded-full relative"
              style={{ width: `${Math.min(100, progress.percentage)}%` }}
            >
              {/* Efek shimmer di dalam progress bar */}
              <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-[pulse_2s_ease-in-out_infinite]"></div>
            </div>
          </div>

          {/* Smart Recommendation Container */}
          {progress.remainingToday > 0 ? (
            <div className="bg-[#FFF4F1] border border-[#FADCD5] rounded-xl p-4 flex flex-col gap-3 mt-2 relative overflow-hidden">
              <div className="flex items-center gap-3 relative z-10">
                <div className="bg-[#D97757] p-2 rounded-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#D97757] uppercase tracking-wider">Sisa Target Hari Ini</p>
                  <p className="text-sm font-medium text-[#A35941]"><span className="font-bold text-lg">{progress.remainingToday}</span> halaman</p>
                </div>
              </div>

              {/* Pembagian Per Waktu Sholat */}
              <div className="border-t border-[#FADCD5]/50 pt-3 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-1.5 text-[#A35941]">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-semibold">Tersisa {prayerRecommendation.upcomingCount} Waktu Sholat</span>
                </div>
                <div className="bg-white/60 px-3 py-1 rounded-md text-xs font-bold text-[#D97757]">
                  ± {prayerRecommendation.pagesPerPrayer} hal / sholat
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#EAF0EA] border border-[#c7dcc7] rounded-xl p-4 flex items-center justify-center text-center mt-2">
              <div>
                <p className="text-[#3E4F3E] font-bold">Alhamdulillah! 🎉</p>
                <p className="text-sm text-[#6B8E6B] font-medium mt-1">Target harianmu sudah terpenuhi.</p>
              </div>
            </div>
          )}
        </div>

        {/* Mic Button & Waveform Area */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full min-h-[170px]">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            className={`
              relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 shadow-xl border-[6px] border-white
              ${isRecording
                ? "bg-[#D97757] hover:bg-[#c26446] scale-95"
                : "bg-[#6B8E6B] hover:bg-[#5a7a5a] hover:scale-105"}
              ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            {isLoading ? (
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            ) : isRecording ? (
              <Square className="w-8 h-8 text-white fill-current" />
            ) : (
              <Mic className="w-10 h-10 text-white" />
            )}
          </button>

          <div className={`mt-6 flex items-end justify-center gap-[4px] h-10 transition-opacity duration-300 ${isRecording ? "opacity-100" : "opacity-0 hidden"}`}>
            {volumes.map((vol, idx) => (
              <div
                key={idx}
                className="w-1.5 bg-[#D97757] rounded-full transition-all duration-75"
                style={{ height: `${Math.max(4, (vol / 255) * 40)}px` }}
              />
            ))}
          </div>

          <div className="mt-4 h-6 flex items-center justify-center">
            {isRecording ? (
              <div className="flex items-center space-x-2 text-[#D97757] font-bold">
                <div className="w-2.5 h-2.5 bg-[#D97757] rounded-full animate-pulse" />
                <span>{formatTime(recordingTime)}</span>
              </div>
            ) : isLoading ? (
              <p className="text-sm font-semibold text-[#8C8273] animate-pulse">Memproses tadarus...</p>
            ) : (
              <p className="text-sm font-semibold text-[#8C8273]">Tap mic untuk lapor ngaji</p>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}