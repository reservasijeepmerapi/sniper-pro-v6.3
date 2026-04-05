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
      const prompt = "Analyze candlestick patterns, RSI, and Trendlines. Output JSON only.";
      const parts = [{ text: prompt }];
      parts.push({ inlineData: { mimeType: "image/jpeg", data: images.primary.split(',')[1] } });
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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
    if (!loading && images.primary) analyzeMarket();
  }, [images]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 italic font-sans">
      <div className="max-w-md mx-auto space-y-4">
        {/* HEADER FIXED STRUCTURE */}
        <div className="bg-[#0f172a] rounded-[2rem] p-6 border border-indigo-500/30">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 rounded-2xl flex items-end gap-1 h-12 w-12 justify-center pb-2">
              <div className="w-1.5 h-3 bg-white/40 rounded-sm"></div>
              <div className="w-1.5 h-5 bg-white/70 rounded-sm"></div>
              <div className="w-1.5 h-7 bg-white rounded-sm"></div>
            </div>
            <div>
              <h1 className="text-xl font-black uppercase italic leading-none">SNIPER ELITE <span className="text-indigo-400">v6.3</span></h1>
              <p className="text-[8px] font-bold text-slate-500 mt-1 uppercase tracking-widest">{currentTime} WIB</p>
            </div>
          </div>
        </div>

        {/* UPLOAD AREA */}
        <div onClick={() => !loading && fileInputPrimary.current.click()} className="relative border-2 border-dashed border-indigo-500/20 rounded-[2.5rem] aspect-video flex items-center justify-center bg-indigo-500/5 cursor-pointer overflow-hidden">
          <input type="file" ref={fileInputPrimary} onChange={(e) => handleFileUpload(e, 'primary')} className="hidden" />
          {images.primary ? <img src={images.primary} className="absolute inset-0 w-full h-full object-cover" /> : <UploadCloud className="w-10 h-10 text-indigo-500 opacity-40" />}
        </div>

        {loading && <div className="text-center p-10 animate-pulse text-indigo-400 font-black uppercase text-[10px] tracking-widest">{loadingStep}</div>}
        
        {result && (
          <div className="bg-gradient-to-br from-indigo-950 to-black rounded-[2.5rem] p-8 border border-indigo-500/30">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2">Analysis Result</span>
            <h2 className="text-5xl font-black text-white">{result.target_entry_time}</h2>
          </div>
        )}
      </div>
    </div>
  );
}
