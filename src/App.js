import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, RefreshCcw, Zap, AlertOctagon, BrainCircuit, ShieldCheck, Target, BarChart3, X, Activity, Award, ToggleLeft, ToggleRight, Clock, TrendingUp, CheckCircle2
} from 'lucide-react';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

export default function App() {
  const [images, setImages] = useState({ primary: null, secondary: null });
  const [isDoubleMode, setIsDoubleMode] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [tradeCount, setTradeCount] = useState(0);
  const [winCount, setWinCount] = useState(0);
  const [currentTime, setCurrentTime] = useState('');
  const [countdown, setCountdown] = useState(null);

  const fileInputPrimary = useRef(null);
  const fileInputSecondary = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour12: false }));
      if (result?.target_entry_time) {
        try {
          const [h, m] = result.target_entry_time.split(':').map(Number);
          const targetDate = new Date();
          targetDate.setHours(h, m, 0, 0);
          const diff = Math.floor((targetDate - now) / 1000);
          setCountdown(diff > -5 && diff <= 120 ? diff : null);
        } catch(e) { setCountdown(null); }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [result]);

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages(prev => ({ ...prev, [type]: event.target.result }));
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeMarket = async () => {
    if (!images.primary) return;
    setLoading(true);
    setError(null);
    setLoadingStep("TARGETING MARKET...");
    try {
      const prompt = `You are Sniper Elite v6.3 AI. Perform high-precision technical analysis... (Analisis Candlestick, RSI, Trendlines)`;
      const parts = [{ text: prompt }];
      parts.push({ inlineData: { mimeType: "image/jpeg", data: images.primary.split(',')[1] } });
      if (images.secondary && isDoubleMode) parts.push({ inlineData: { mimeType: "image/jpeg", data: images.secondary.split(',')[1] } });

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: "user", parts: parts }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.1 }
        })
      });
      const data = await response.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (raw) setResult(JSON.parse(raw));
    } catch (err) {
      setError("ANALISA GAGAL: Periksa API Key atau Jaringan.");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!loading && ((isDoubleMode && images.primary && images.secondary) || (!isDoubleMode && images.primary))) {
      analyzeMarket();
    }
  }, [images, isDoubleMode]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 font-sans italic pb-32">
      <div className="max-w-md mx-auto space-y-4">
        {/* Konten UI Header, Mode Selector, dan Uploads sesuai file asli Anda */}
        <div className="bg-[#0f172a] rounded-[2.5rem] p-6 border border-indigo-500/30 shadow-2xl shadow-indigo-500/10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg flex items-end gap-1 h-12 w-12 justify-center pb-2">
                <div className="w-1.5 h-3 bg-white/40 rounded-sm"></div>
                <div className="w-1.5 h-5 bg-white/70 rounded-sm"></div>
                <div className="w-1.5 h-7 bg-white rounded-sm shadow-[0_0_10px_white]"></div>
              </div>
              <div>
                <h1 className="text-xl font-black uppercase leading-none italic">SNIPER ELITE <span className="text-indigo-400">v6.3</span></h1>
                <p className="text-[8px] font-bold text-slate-500 mt-1 tracking-[0.4em] uppercase">{currentTime} WIB</p>
              </div>
            </div>
            <Activity className="w-6 h-6 text-indigo-500 animate-pulse" />
          </div>
        </div>

        {/* Form Upload */}
        <div className="grid grid-cols-1 gap-4">
            <div onClick={() => !loading && fileInputPrimary.current.click()} className="relative border-2 border-dashed border-indigo-500/20 rounded-[2.5rem] aspect-video flex flex-col items-center justify-center bg-indigo-500/5 cursor-pointer">
              <input type="file" ref={fileInputPrimary} onChange={(e) => handleFileUpload(e, 'primary')} className="hidden" accept="image/*" />
              {images.primary ? <img src={images.primary} className="absolute inset-0 w-full h-full object-cover rounded-[2.5rem]" /> : <UploadCloud className="w-8 h-8 text-indigo-500 opacity-40" />}
            </div>
        </div>
        
        {loading && <div className="text-center p-10 bg-slate-900/50 rounded-3xl animate-pulse text-indigo-400 font-black uppercase text-[10px] tracking-widest">{loadingStep}</div>}
        
        {result && (
            <div className="bg-indigo-950/30 p-6 rounded-[2.5rem] border border-indigo-500/20">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Entry Time</p>
                <h2 className="text-5xl font-black">{result.target_entry_time}</h2>
                <p className="mt-2 text-xs text-slate-400">{result.psychological_reason}</p>
            </div>
        )}
      </div>
    </div>
  );
}
