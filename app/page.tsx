"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, BookOpen, Target, Sparkles } from "lucide-react";
import Swal from 'sweetalert2';

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [volumes, setVolumes] = useState<number[]>(new Array(30).fill(0));

  // State untuk Data Progress
  const [progress, setProgress] = useState({
    totalPagesRead: 0,
    totalPagesTarget: 1812, // 3x Khatam
    dailyTarget: 62.5,
    percentage: 0
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Fungsi fetch data progress dari database
  const fetchProgress = async () => {
    try {
      const res = await fetch('/api/progress');
      const data = await res.json();
      if (data.success) {
        setProgress(data.data);
      }
    } catch (err) {
      console.error("Gagal load progress", err);
    }
  };

  // Ambil data pertama kali web dibuka
  useEffect(() => {
    fetchProgress();
  }, []);

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
          const res = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();

          if (data.success) {
            // Refresh angka progress bar di UI
            fetchProgress();

            Swal.fire({
              title: "Masya Allah!",
              html: `Tadarus tercatat.<br/><span style="color:#6B8E6B; font-weight:bold;">+${data.data.totalPagesRead} Halaman</span>`,
              icon: "success",
              confirmButtonColor: "#6B8E6B", // Matcha color
            });
          } else {
            playErrorBeep();
            Swal.fire({
              title: "Tunggu Dulu...",
              text: data.error,
              icon: "warning",
              confirmButtonColor: "#D97757", // Terracotta color
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

      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-sm border border-[#E5E0D8] p-8 flex flex-col items-center space-y-8 relative overflow-hidden">

        {/* Dekorasi Estetik */}
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
              className="h-full bg-[#6B8E6B] transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${Math.min(100, progress.percentage)}%` }}
            />
          </div>

          {/* Dynamic Target Box */}
          <div className="bg-[#FFF4F1] border border-[#FADCD5] rounded-xl p-3 flex items-center gap-3 mt-2">
            <div className="bg-[#D97757] p-2 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#D97757]">TARGET HARIANMU HARI INI</p>
              <p className="text-sm font-medium text-[#A35941]"><span className="font-bold text-lg">{progress.dailyTarget}</span> halaman lagi agar on-track!</p>
            </div>
          </div>
        </div>

        {/* Mic Button & Waveform Area */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full min-h-[180px]">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            className={`
              relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 shadow-xl border-[6px] border-white
              ${isRecording
                ? "bg-[#D97757] hover:bg-[#c26446] scale-95" // Terracotta saat rekam
                : "bg-[#6B8E6B] hover:bg-[#5a7a5a] hover:scale-105"} // Matcha saat diam
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

          {/* Bar Waveform */}
          <div className={`mt-6 flex items-end justify-center gap-[4px] h-10 transition-opacity duration-300 ${isRecording ? "opacity-100" : "opacity-0 hidden"}`}>
            {volumes.map((vol, idx) => (
              <div
                key={idx}
                className="w-1.5 bg-[#D97757] rounded-full transition-all duration-75"
                style={{ height: `${Math.max(4, (vol / 255) * 40)}px` }}
              />
            ))}
          </div>

          {/* Status & Timer */}
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