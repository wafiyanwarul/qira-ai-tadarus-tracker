"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2 } from "lucide-react"; // Waveform udah dihapus biar nggak error!

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  
  // Array untuk menyimpan 30 bar gelombang suara
  const [volumes, setVolumes] = useState<number[]>(new Array(30).fill(0)); 
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextCtor();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 64; // Dikecilin biar dapat bar yang solid
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Mengambil 30 titik data untuk 30 bar gelombang
        const newVolumes = [];
        for (let i = 0; i < 30; i++) {
          newVolumes.push(dataArray[i] || 0);
        }
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
      setTranscript("");
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

    } catch (error) {
      console.error("Akses Mic Ditolak:", error);
      alert("Tolong izinkan akses mikrofon di browsermu ya!");
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
            setTranscript(data.text);
          } else {
            alert("Error: " + data.error);
          }
        } catch (err) {
          console.error(err);
          alert("Gagal memproses audio, pastikan internet stabil.");
        } finally {
          setIsLoading(false);
        }
      };
      
      mediaRecorderRef.current.stop();
      playBeep("stop");
      
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      setVolumes(new Array(30).fill(0)); // Reset gelombang jadi rata
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      if (audioContextRef.current) audioContextRef.current.close();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <main 
      className="min-h-screen relative flex flex-col items-center justify-center p-6 font-sans overflow-hidden"
      style={{
        // URL gambar Quran gratis dari Unsplash
        backgroundImage: "url('https://images.unsplash.com/photo-1564121211835-e88c852648ab?q=80&w=2070&auto=format&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Blue & Blur Overlay */}
      <div className="absolute inset-0 bg-blue-950/70 backdrop-blur-md z-0"></div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 flex flex-col items-center text-center space-y-8 border border-white/20">
        
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight drop-shadow-sm">Qira.ai</h1>
          <p className="text-blue-600/80 font-medium text-sm">AI Tadarus Tracker</p>
        </div>

        {/* Mic Button & Waveform Area */}
        <div className="flex flex-col items-center justify-center min-h-[220px] w-full">
          
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            className={`
              relative z-10 flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 shadow-xl border-4 border-white
              ${isRecording 
                ? "bg-rose-500 hover:bg-rose-600 scale-95" 
                : "bg-blue-600 hover:bg-blue-700 hover:scale-105"}
              ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            {isLoading ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : isRecording ? (
              <Square className="w-8 h-8 text-white fill-current" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </button>
          
          {/* Bar Waveform Visualizer (Tampil pas rekaman aja) */}
          <div className={`mt-8 flex items-end justify-center gap-[3px] h-12 transition-opacity duration-300 ${isRecording ? "opacity-100" : "opacity-0 hidden"}`}>
            {volumes.map((vol, idx) => (
              <div 
                key={idx}
                className="w-1.5 bg-rose-500 rounded-full transition-all duration-75"
                // Minimal tinggi 4px, maksimal 48px
                style={{ height: `${Math.max(4, (vol / 255) * 48)}px` }}
              />
            ))}
          </div>

          {/* Status & Timer */}
          <div className="mt-4 h-8 flex items-center justify-center">
            {isRecording ? (
              <div className="flex items-center space-x-2 text-rose-500 font-bold bg-rose-50 px-4 py-1.5 rounded-full border border-rose-100 shadow-inner">
                <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />
                <span>{formatTime(recordingTime)}</span>
              </div>
            ) : isLoading ? (
              <p className="text-sm font-semibold text-blue-400 animate-pulse">Menerjemahkan suara...</p>
            ) : (
              <p className="text-sm font-medium text-slate-400">Tap mic untuk setor tadarus</p>
            )}
          </div>
        </div>

        {/* Output Box */}
        {transcript && (
          <div className="w-full bg-blue-50/80 rounded-2xl p-5 text-left border border-blue-100 shadow-sm transition-all">
            <p className="text-[10px] text-blue-400 font-bold mb-2 uppercase tracking-widest">Hasil Transkripsi</p>
            <p className="text-slate-700 leading-relaxed font-medium">"{transcript}"</p>
          </div>
        )}

      </div>
    </main>
  );
}