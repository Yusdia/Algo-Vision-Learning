import { useState, useEffect } from "react";
import { availableInstruments, generateHistoricalCandles, calculateIndicators } from "./historicalData";
import { Candlestick, Position, TradeLog, Instrument } from "./types";
import { TradingCanvas } from "./components/TradingCanvas";
import { EducationalSection } from "./components/EducationalSection";
import { MentorAI } from "./components/MentorAI";
import { BacktestConsole } from "./components/BacktestConsole";
import { ChartAnalyzer } from "./components/ChartAnalyzer";
import { Language, translations } from "./translations";
import {   
  GraduationCap, 
  LineChart, 
  Sparkles, 
  Coins, 
  BookOpen, 
  HelpCircle, 
  Info, 
  Check, 
  X, 
  Award,
  Clock,
  Globe,
  Server,
  Settings,
  Code,
  Copy,
  Save,
  RefreshCw
} from "lucide-react";

export default function App() {
  const [language, setLanguage] = useState<Language>("ID");
  const t = translations[language];

  const [activeMainTab, setActiveMainTab] = useState<"simulator" | "academy" | "guide" | "analyzer" | "monetize">("simulator");

  // Onboarding modal on first load
  const [showWelcome, setShowWelcome] = useState(true);

  // Active Instrument state
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>(availableInstruments[0]);
  
  // Loaded historical chart data
  const [allCandles, setAllCandles] = useState<Candlestick[]>([]);
  const [backtestDuration, setBacktestDuration] = useState<number>(365); // 1-Year dynamic backtest duration
  const [timeframe, setTimeframe] = useState<"1D" | "4H" | "1H">("1D"); // Multi timeframe setting
  const [currentCandleIndex, setCurrentCandleIndex] = useState<number>(45); // start with first 45 candles visible
  const [isReplaying, setIsReplaying] = useState<boolean>(false);

  // Indicators toggle configs
  const [showShortMa, setShowShortMa] = useState(true);
  const [showLongMa, setShowLongMa] = useState(true);
  const [showBb, setShowBb] = useState(false);
  const [showSr, setShowSr] = useState(true); // beginners guide to S&R on by default

  // Cumulative Account Balance state
  const [balance, setBalance] = useState<number>(10000.0);
  const [activePosition, setActivePosition] = useState<Position | null>(null);
  const [tradeHistory, setTradeHistory] = useState<TradeLog[]>([]);

  // Educational progress
  const [userProgress, setUserProgress] = useState<{ [lessonId: string]: boolean }>({});
  const [xpPoints, setXpPoints] = useState<number>(0);

  // Visual simulation alerts / toast
  const [simulationAlert, setSimulationAlert] = useState<{
    id: string;
    type: "success" | "danger" | "info";
    title: string;
    message: string;
  } | null>(null);

  // Monetization Ad Slots States
  const [topBannerCode, setTopBannerCode] = useState<string>(() => {
    return localStorage.getItem("ad_top_banner") || `
<script async="async" data-cfasync="false" src="https://pl29593346.effectivecpmnetwork.com/df88b15d2af695fb16f6b52ba42e21f7/invoke.js"></script>
<div id="container-df88b15d2af695fb16f6b52ba42e21f7" style="min-height: 90px; width: 100%; display: flex; justify-content: center; align-items: center;"></div>
    `.trim();
  });

  const [sidebarBannerCode, setSidebarBannerCode] = useState<string>(() => {
    return localStorage.getItem("ad_sidebar_banner") || `
<div class="w-full bg-slate-900/60 border border-slate-850 rounded-xl p-3.5 text-center space-y-2.5">
  <p class="text-[8px] uppercase font-bold text-slate-500 tracking-widest">REKOMENDASI HOSTING VPS</p>
  <div class="bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 p-2.5 rounded-lg font-mono text-center">
    <span class="text-xs block font-bold">⚡ VPS TRADING PRO</span>
    <span class="text-[9px] text-indigo-400">Uptime 99.99% • Ping 1ms</span>
  </div>
  <p class="text-[10px] text-slate-400 leading-normal">Pindahkan bot simulasi & web akademi Anda ke server VPS handal mulai dari <strong>$2.99/bulan</strong> saja!</p>
  <a href="#" class="block bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold text-[9px] py-1.5 rounded-lg transition-all uppercase tracking-wide">Sewa VPS Sekarang</a>
</div>
    `.trim();
  });

  const [popupScriptCode, setPopupScriptCode] = useState<string>(() => {
    return localStorage.getItem("ad_popup_script") || `
<!-- Contoh Script Kode Pop-under / Tracker Iklan Ketiga -->
<script>
  console.log("Tag Popup Aktif! Pasang kode skrip pop-under atau tracker Anda di Panel Iklan & VPS.");
</script>
    `.trim();
  });

  const [popunderScriptCode, setPopunderScriptCode] = useState<string>(() => {
    return localStorage.getItem("ad_popunder_script") || `
<!-- Contoh Script Iklan Popunder Ketiga -->
<script>
  console.log("Tag Popunder Aktif! Pasang kode atau script popunder iklan bursa Anda di sini.");
</script>
    `.trim();
  });

  // Dynamically inject script tag and handle evaluation for Custom Ad HTMLs (e.g. popups)
  useEffect(() => {
    if (!popupScriptCode) return;
    const divId = "popup-script-container";
    let container = document.getElementById(divId);
    if (container) {
      container.innerHTML = "";
    } else {
      container = document.createElement("div");
      container.id = divId;
      container.style.display = "none";
      document.body.appendChild(container);
    }

    try {
      container.innerHTML = popupScriptCode;
      const parser = new DOMParser();
      const parsed = parser.parseFromString(`<div>${popupScriptCode}</div>`, "text/html");
      const scripts = parsed.getElementsByTagName("script");

      for (let s of Array.from(scripts)) {
        const newScript = document.createElement("script");
        if (s.src) {
          newScript.src = s.src;
          if (s.async) newScript.async = true;
          if (s.defer) newScript.defer = true;
        } else {
          newScript.textContent = s.textContent;
        }
        
        // Copy custom attributes
        const attribs = s.attributes;
        for (let i = 0; i < attribs.length; i++) {
          const attr = attribs[i];
          if (attr.name !== "src" && attr.name !== "async" && attr.name !== "defer") {
            newScript.setAttribute(attr.name, attr.value);
          }
        }
        
        container.appendChild(newScript);
      }
    } catch (e) {
      console.warn("Gagal menyematkan skrip popup:", e);
    }
  }, [popupScriptCode]);

  // Dynamically inject script tag and handle evaluation for Custom Popunder scripts
  useEffect(() => {
    if (!popunderScriptCode) return;
    const divId = "popunder-script-container";
    let container = document.getElementById(divId);
    if (container) {
      container.innerHTML = "";
    } else {
      container = document.createElement("div");
      container.id = divId;
      container.style.display = "none";
      document.body.appendChild(container);
    }

    try {
      container.innerHTML = popunderScriptCode;
      const parser = new DOMParser();
      const parsed = parser.parseFromString(`<div>${popunderScriptCode}</div>`, "text/html");
      const scripts = parsed.getElementsByTagName("script");

      for (let s of Array.from(scripts)) {
        const newScript = document.createElement("script");
        if (s.src) {
          newScript.src = s.src;
          if (s.async) newScript.async = true;
          if (s.defer) newScript.defer = true;
        } else {
          newScript.textContent = s.textContent;
        }
        
        // Copy custom attributes
        const attribs = s.attributes;
        for (let i = 0; i < attribs.length; i++) {
          const attr = attribs[i];
          if (attr.name !== "src" && attr.name !== "async" && attr.name !== "defer") {
            newScript.setAttribute(attr.name, attr.value);
          }
        }
        
        container.appendChild(newScript);
      }
    } catch (e) {
      console.warn("Gagal menyematkan skrip popunder:", e);
    }
  }, [popunderScriptCode]);

  // Dynamically inject scripts found inside topBannerCode
  useEffect(() => {
    if (!topBannerCode) return;
    const divId = "top-banner-script-container";
    let container = document.getElementById(divId);
    if (container) {
      container.innerHTML = "";
    } else {
      container = document.createElement("div");
      container.id = divId;
      container.style.display = "none";
      document.body.appendChild(container);
    }

    try {
      const parser = new DOMParser();
      const parsed = parser.parseFromString(`<div>${topBannerCode}</div>`, "text/html");
      const scripts = parsed.getElementsByTagName("script");

      for (let s of Array.from(scripts)) {
        const newScript = document.createElement("script");
        if (s.src) {
          newScript.src = s.src;
          newScript.async = true;
        } else {
          newScript.textContent = s.textContent;
        }
        
        // Copy custom attributes
        const attribs = s.attributes;
        for (let i = 0; i < attribs.length; i++) {
          const attr = attribs[i];
          if (attr.name !== "src") {
            newScript.setAttribute(attr.name, attr.value);
          }
        }
        container.appendChild(newScript);
      }
    } catch (e) {
      console.warn("Gagal menyematkan skrip banner atas:", e);
    }
  }, [topBannerCode]);

  const handleSaveTopBanner = (code: string) => {
    setTopBannerCode(code);
    localStorage.setItem("ad_top_banner", code);
  };

  const handleSaveSidebarBanner = (code: string) => {
    setSidebarBannerCode(code);
    localStorage.setItem("ad_sidebar_banner", code);
  };

  const handleSavePopupScript = (code: string) => {
    setPopupScriptCode(code);
    localStorage.setItem("ad_popup_script", code);
  };

  const handleSavePopunderScript = (code: string) => {
    setPopunderScriptCode(code);
    localStorage.setItem("ad_popunder_script", code);
  };

  // Load persistence states on startup
  useEffect(() => {
    try {
      const persistedProgress = localStorage.getItem("trader_academy_progress");
      if (persistedProgress) setUserProgress(JSON.parse(persistedProgress));

      const persistedXp = localStorage.getItem("trader_academy_xp");
      if (persistedXp) setXpPoints(Number(persistedXp));

      const persistedBalance = localStorage.getItem("trader_academy_balance");
      if (persistedBalance) setBalance(Number(persistedBalance));

      const persistedHistory = localStorage.getItem("trader_academy_history");
      if (persistedHistory) setTradeHistory(JSON.parse(persistedHistory));

      const persistedLang = localStorage.getItem("trader_academy_lang");
      if (persistedLang === "EN" || persistedLang === "ID") {
        setLanguage(persistedLang as Language);
      }
    } catch (e) {
      console.warn("Storage reading failed, standard settings used.");
    }
  }, []);

  // Save changes
  const handleCompleteLessonLocal = (lessonId: string) => {
    const updated = { ...userProgress, [lessonId]: true };
    setUserProgress(updated);
    localStorage.setItem("trader_academy_progress", JSON.stringify(updated));
  };

  const handleAddXpLocal = (points: number) => {
    const updated = xpPoints + points;
    setXpPoints(updated);
    localStorage.setItem("trader_academy_xp", updated.toString());
  };

  const handleAddTradeHistory = (log: TradeLog) => {
    const updated = [...tradeHistory, log];
    setTradeHistory(updated);
    localStorage.setItem("trader_academy_history", JSON.stringify(updated));
  };

  const handleUpdateBalance = (newBal: number) => {
    const rounded = Number(newBal.toFixed(2));
    setBalance(rounded);
    localStorage.setItem("trader_academy_balance", rounded.toString());
  };

  // Switch Language
  const handleToggleLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("trader_academy_lang", lang);
  };

  // Generate dataset on instrument, backtest duration, or timeframe changes
  useEffect(() => {
    const candlesRaw = generateHistoricalCandles(selectedInstrument.id, backtestDuration, timeframe);
    const withIndicators = calculateIndicators(candlesRaw);
    setAllCandles(withIndicators);
    setCurrentCandleIndex(45); // reset view to initial 45 items
    setActivePosition(null); // dump running position
    setIsReplaying(false);
  }, [selectedInstrument, backtestDuration, timeframe]);

  // Rolling current window visible slice (showing last 45 bars up to current index index)
  const visibleCandlesCount = 45;
  const visibleCandles = allCandles.slice(
    Math.max(0, currentCandleIndex - visibleCandlesCount),
    currentCandleIndex + 1
  );

  // Triggers checking loop when index increases (tick event)
  const handleTickCheck = (indexToCheck: number) => {
    if (!activePosition) return;
    
    // Acquire newly exposed candle to see if high/low touched SL or TP
    const candle = allCandles[indexToCheck];
    if (!candle) return;

    const { high, low } = candle;
    const { type, slPrice, tpPrice } = activePosition;

    let hasHitSl = false;
    let hasHitTp = false;

    // 1. Evaluate Buy (Long) Order
    if (type === "BUY") {
      if (slPrice !== null && low <= slPrice) {
        hasHitSl = true;
      }
      if (tpPrice !== null && high >= tpPrice) {
        hasHitTp = true;
      }
    } 
    // 2. Evaluate Sell (Short) Order
    else {
      if (slPrice !== null && high >= slPrice) {
        hasHitSl = true;
      }
      if (tpPrice !== null && low <= tpPrice) {
        hasHitTp = true;
      }
    }

    if (hasHitSl && hasHitTp) {
      // Conservative Stop Loss occurred first (standard protective simulation)
      triggerPositionExit(slPrice!, "SL_HIT", indexToCheck, candle);
    } else if (hasHitSl) {
      triggerPositionExit(slPrice!, "SL_HIT", indexToCheck, candle);
    } else if (hasHitTp) {
      triggerPositionExit(tpPrice!, "TP_HIT", indexToCheck, candle);
    }
  };

  // Process exit logic for dynamic trades
  const triggerPositionExit = (
    exitPrice: number,
    exitReason: "SL_HIT" | "TP_HIT" | "MANUAL_CLOSE",
    exitIndex: number,
    exitCandle: Candlestick
  ) => {
    if (!activePosition) return;

    setIsReplaying(false); // Stop playback to draw user's focus

    const { type, entryPrice, lotSize, entryIndex } = activePosition;
    const contractMultiplier = selectedInstrument.contractSize;
    let priceSpread = exitPrice - entryPrice;
    
    if (type === "SELL") {
      priceSpread = entryPrice - exitPrice;
    }

    const tradePnl = priceSpread * lotSize * contractMultiplier;
    const newBalance = balance + tradePnl;
    handleUpdateBalance(newBalance);

    // Save completed trade
    const completedTrade: TradeLog = {
      id: Math.random().toString(),
      type,
      entryPrice,
      exitPrice,
      entryIndex,
      exitIndex,
      lotSize,
      leverage: activePosition.leverage,
      pnl: tradePnl,
      exitReason,
      timestamp: exitCandle.time
    };

    handleAddTradeHistory(completedTrade);
    setActivePosition(null);

    // Show educational floating summary alert based on result
    if (exitReason === "TP_HIT") {
      if (language === "ID") {
        setSimulationAlert({
          id: Math.random().toString(),
          type: "success",
          title: "🎯 TARGET TAKE PROFIT TERCAPAI!",
          message: `Luar biasa! Posisi ${type} menyentuh target TP di ${exitPrice.toFixed(selectedInstrument.pipDecimal)}. Anda mendulang keuntungan sebesar **+$${tradePnl.toFixed(2)}**! Analisa chart Anda sangat presisi.`
        });
      } else {
        setSimulationAlert({
          id: Math.random().toString(),
          type: "success",
          title: "🎯 TAKE PROFIT TARGET HARVESTED!",
          message: `Splendid! Your running ${type} hit the TP target at ${exitPrice.toFixed(selectedInstrument.pipDecimal)}. You harvested a markup of **+$${tradePnl.toFixed(2)}** sandbox tokens! Precision technical reading.`
        });
      }
      handleAddXpLocal(100);
    } else if (exitReason === "SL_HIT") {
      if (language === "ID") {
        setSimulationAlert({
          id: Math.random().toString(),
          type: "danger",
          title: "🛑 PERLINDUNGAN STOP LOSS TRIGERRED",
          message: `Posisi ${type} menyentuh batas pengaman SL di ${exitPrice.toFixed(selectedInstrument.pipDecimal)}. Mengalami rugi terkawal **-$${Math.abs(tradePnl).toFixed(2)}**. Ini keputusan cerdas! Memasang SL menyelamatkan sisa modal belajar Anda dari Margin Call.`
        });
      } else {
        setSimulationAlert({
          id: Math.random().toString(),
          type: "danger",
          title: "🛑 STOP LOSS SHIELD TRIGGERED",
          message: `Your running ${type} touched the defensive Stop Loss line at ${exitPrice.toFixed(selectedInstrument.pipDecimal)}. Accrued a governed loss of **-$${Math.abs(tradePnl).toFixed(2)}**. Excellent risk planning! Placing defensive stops guards your account balance against severe market moves.`
        });
      }
      handleAddXpLocal(30); // small XP for protective trading habits
    }
  };

  const handleOpenPosition = (
    type: "BUY" | "SELL",
    lot: number,
    leverage: number,
    sl: number | null,
    tp: number | null
  ) => {
    if (activePosition) {
      if (language === "ID") {
        alert("⚠️ Anda sudah memiliki posisi aktif yang berjalan! Tutup terlebih dahulu posisi ini sebelum membuka transaksi baru.");
      } else {
        alert("⚠️ You already have an active running position. Please close it first layout before preparing a new transaction.");
      }
      return;
    }

    const currentCandle = allCandles[currentCandleIndex];
    if (!currentCandle) return;

    const entryPrice = currentCandle.close;
    const contractMultiplier = selectedInstrument.contractSize;
    const requiredMargin = (entryPrice * lot * contractMultiplier) / leverage;

    const newPos: Position = {
      id: Math.random().toString(),
      type,
      entryIndex: currentCandleIndex,
      entryPrice,
      lotSize: lot,
      leverage,
      slPrice: sl,
      tpPrice: tp,
      margin: requiredMargin
    };

    setActivePosition(newPos);
    
    // Tiny toast confirmation message
    if (language === "ID") {
      setSimulationAlert({
        id: Math.random().toString(),
        type: "info",
        title: "🚀 POSISI BERHASIL DIBUKA",
        message: `Membuka transaksi ${type} ${lot} lot pada level entry ${entryPrice.toFixed(selectedInstrument.pipDecimal)}. Jalankan atau percepat Replay di samping untuk melihat perkembangannya!`
      });
    } else {
      setSimulationAlert({
        id: Math.random().toString(),
        type: "info",
        title: "🚀 TRANSACTION SECURED OPEN",
        message: `Opened ${type} ${lot} lot at price level ${entryPrice.toFixed(selectedInstrument.pipDecimal)}. Unpause or speed up the replay engine to trace live charts tick-by-tick!`
      });
    }
  };

  const handleManualClosePosition = () => {
    if (!activePosition) return;
    const currentCandle = allCandles[currentCandleIndex];
    if (!currentCandle) return;

    triggerPositionExit(currentCandle.close, "MANUAL_CLOSE", currentCandleIndex, currentCandle);
  };

  // Replay control handlers passed into console
  const handleStepForward = () => {
    if (currentCandleIndex >= allCandles.length - 1) {
      setIsReplaying(false);
      return;
    }
    const targetIdx = currentCandleIndex + 1;
    setCurrentCandleIndex(targetIdx);
    handleTickCheck(targetIdx);
  };

  const handleRestartReplay = () => {
    const confirmReset = confirm(
      language === "ID"
        ? "Apakah Anda ingin menyetel ulang visual replay ke 45 candle pertama? Seluruh catatan transaksi aktif Anda saat ini akan dihentikan."
        : "Do you wish to reset current chart replay to the first 45 candles? Your active running transaction will be closed without payout."
    );
    if (!confirmReset) return;

    setCurrentCandleIndex(45);
    setActivePosition(null);
    setIsReplaying(false);

    if (language === "ID") {
      setSimulationAlert({
        id: Math.random().toString(),
        type: "info",
        title: "🔄 REPLAY CHART DIRESET",
        message: "Grafik historis berhasil disetel ulang ke titik mula pembelajaran. Anda siap melakukan latihan backtesting baru."
      });
    } else {
      setSimulationAlert({
        id: Math.random().toString(),
        type: "info",
        title: "🔄 REPLAY REBOOTED",
        message: "Historical charts have been rolled back to starting bar layouts. You are clear to begin a fresh backtesting session."
      });
    }
  };

  // Reset balance values
  const handleResetStorageBalance = () => {
    const check = confirm(
      language === "ID"
        ? "Apakah Anda ingin mereset saldo simulasi Anda kembali ke $10,000?"
        : "Are you sure you want to reset your sandbox balance back to $10,000 and flush history logs?"
    );
    if (!check) return;
    handleUpdateBalance(10000.0);
    setTradeHistory([]);
    localStorage.removeItem("trader_academy_history");
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col justify-between">
      
      {/* 1. TOP NAVBAR HEADBOARD */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & title context */}
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 text-slate-950 p-2 rounded-xl font-bold flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <GraduationCap className="w-5.5 h-5.5" />
            </div>
            <div className="text-left">
              <h1 className="text-sm md:text-base font-extrabold text-slate-100 tracking-tight">{t.headerTitle}</h1>
              <p className="text-[10px] text-slate-400 font-medium">{t.headerSubtitle}</p>
            </div>
          </div>

          {/* Tab Selection Row */}
          <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveMainTab("simulator")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeMainTab === "simulator"
                  ? "bg-slate-850 text-emerald-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>{t.tabSimulator}</span>
            </button>
            <button
              onClick={() => setActiveMainTab("academy")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeMainTab === "academy"
                  ? "bg-slate-850 text-emerald-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t.tabAcademy}</span>
            </button>
            <button
              onClick={() => setActiveMainTab("analyzer")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeMainTab === "analyzer"
                  ? "bg-slate-850 text-emerald-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.tabAnalyzer}</span>
            </button>
            <button
              onClick={() => setActiveMainTab("guide")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeMainTab === "guide"
                  ? "bg-slate-850 text-emerald-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t.tabGuide}</span>
            </button>
            <button
              onClick={() => setActiveMainTab("monetize")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeMainTab === "monetize"
                  ? "bg-slate-850 text-emerald-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Settings className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === "ID" ? "Iklan & VPS" : "Ads & VPS"}</span>
            </button>
          </nav>

          {/* Right Header Stats & Language Selector Deck */}
          <div className="flex items-center gap-3">
            {/* Language toggle flag */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-850 text-[10px]">
              <Globe className="w-3.5 h-3.5 text-slate-400 ml-1 mr-0.5" />
              <button
                onClick={() => handleToggleLanguage("ID")}
                className={`px-1.5 py-0.5 rounded font-black transition-all ${
                  language === "ID" ? "bg-slate-800 text-emerald-400" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                ID
              </button>
              <button
                onClick={() => handleToggleLanguage("EN")}
                className={`px-1.5 py-0.5 rounded font-black transition-all ${
                  language === "EN" ? "bg-slate-800 text-emerald-400" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                EN
              </button>
            </div>

            {/* Balance Badge */}
            <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-850 px-3 py-1.5 rounded-xl">
              <Coins className="w-4 h-4 text-emerald-400" />
              <div className="text-left font-mono">
                <span className="text-[8px] text-slate-400 block leading-none">{t.balanceLabel}</span>
                <span className="text-xs font-black text-slate-100">${balance.toLocaleString(language === "ID" ? "id-ID" : "en-US", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* XP Points Badge */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-950/80 border border-slate-850 px-3 py-1.5 rounded-xl">
              <Award className="w-4 h-4 text-amber-500" />
              <div className="text-left">
                <span className="text-[8px] text-slate-400 block leading-none">{t.xpLabel}</span>
                <span className="text-xs font-black text-amber-400">{xpPoints} XP</span>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Global Top leaderboard Ad Container */}
      <div className="max-w-7xl w-full mx-auto px-4 mt-4">
        <div className="bg-slate-900/60 border border-slate-805/80 rounded-2xl p-2.5 relative overflow-hidden flex flex-col gap-1 shadow-md">
          <div className="flex items-center justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest px-1 mb-1">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              {language === "ID" ? "📢 CONTAINER SLOT BANNER (LEADERBOARD 728x90)" : "📢 AD CONTAINER SLOT (728x90 LEADERBOARD)"}
            </span>
            <button 
              onClick={() => {
                setActiveMainTab("monetize");
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
              className="text-emerald-400 hover:text-emerald-300 underline font-normal text-[9px] lowercase tracking-normal bg-transparent border-0 outline-none cursor-pointer"
            >
              {language === "ID" ? "[ edit kode script ]" : "[ edit ad script ]"}
            </button>
          </div>
          
          <div className="w-full flex justify-center items-center overflow-x-auto min-h-[60px] md:min-h-[90px]">
            {topBannerCode ? (
              <div 
                className="w-full flex justify-center items-center"
                dangerouslySetInnerHTML={{ __html: topBannerCode }} 
              />
            ) : (
              <div className="text-xs text-slate-500 italic py-4">
                {language === "ID" ? "Kode Banner Kosong. Klik 'edit kode' untuk menyematkan script iklan bursa Anda." : "Banner Code Empty. Click 'edit ad script' to embed your custom script."}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. BODY CONTENT ROUTER (max width wrapper) */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 flex flex-col gap-5">
        
        {/* Floating simulation result toast */}
        {simulationAlert && (
          <div className={`p-4 rounded-2xl border text-xs text-left relative overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-4 duration-350 ${
            simulationAlert.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-250"
              : simulationAlert.type === "danger"
              ? "bg-rose-950/80 border-rose-500/40 text-rose-250"
              : "bg-indigo-950/80 border-indigo-500/40 text-indigo-250"
          }`}>
            <div className="flex gap-3">
              <div className="p-1.5 rounded-lg bg-white/5 h-fit mt-0.5">
                {simulationAlert.type === "success" ? <Check className="w-4 h-4" /> : <Info className="w-4 h-4" />}
              </div>
              <div className="flex-1 pr-6">
                <p className="font-extrabold tracking-wide uppercase">{simulationAlert.title}</p>
                <p className="opacity-90 mt-1 leading-relaxed" dangerouslySetInnerHTML={{
                  __html: simulationAlert.message.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                }} />
              </div>
              <button 
                onClick={() => setSimulationAlert(null)}
                className="absolute top-3 right-3 text-white/55 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB VIEW A: MAIN SIMULATION TERMINAL ================= */}
        {activeMainTab === "simulator" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            
            {/* L1: The Chart visual window and operations console (columns 8) */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              
              {/* Interactive Toolbar for Indicators toggle and Timeframe selection */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 text-xs">
                {/* Left: Indicator Toggles */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-slate-400 font-bold mr-1">{language === "ID" ? "Indikator:" : "Indicators:"}</span>
                  
                  <button
                    onClick={() => setShowShortMa(!showShortMa)}
                    className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${
                      showShortMa
                        ? "bg-amber-400/10 border-amber-500/50 text-amber-300"
                        : "bg-slate-950/40 border-slate-850 text-slate-500 hover:text-slate-350"
                    }`}
                  >
                    Short MA (7)
                  </button>

                  <button
                    onClick={() => setShowLongMa(!showLongMa)}
                    className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${
                      showLongMa
                        ? "bg-violet-400/10 border-violet-500/50 text-violet-300"
                        : "bg-slate-950/40 border-slate-850 text-slate-500 hover:text-slate-350"
                    }`}
                  >
                    Long MA (20)
                  </button>

                  <button
                    onClick={() => setShowBb(!showBb)}
                    className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${
                      showBb
                        ? "bg-purple-400/10 border-purple-500/50 text-purple-300"
                        : "bg-slate-950/40 border-slate-850 text-slate-500 hover:text-slate-350"
                    }`}
                  >
                    Bollinger Bands
                  </button>
                  
                  <button
                    onClick={() => setShowSr(!showSr)}
                    className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${
                      showSr
                        ? "bg-emerald-400/10 border-emerald-500/50 text-emerald-300"
                        : "bg-slate-950/40 border-slate-850 text-slate-500 hover:text-slate-350"
                    }`}
                  >
                    {language === "ID" ? "Rekomendasi S&R" : "S&R Guide lines"}
                  </button>
                </div>

                {/* Right: Multi Timeframe and Reset balance */}
                <div className="flex flex-wrap items-center gap-4 justify-between md:justify-end">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-bold flex items-center gap-1 text-[11px] uppercase">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      {language === "ID" ? "Waktu Grafik:" : "Timeframe:"}
                    </span>
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 font-mono">
                      {[
                        { id: "1H", label: "H1", tooltip: language === "ID" ? "1 Jam (Intraday Halus)" : "1 Hour per Candle (Local intraday)" },
                        { id: "4H", label: "H4", tooltip: language === "ID" ? "4 Jam (Ayunan Menengah)" : "4 Hours per Candle (Swing)" },
                        { id: "1D", label: "D1", tooltip: language === "ID" ? "1 Hari (Trend Utama)" : "Daily Candles (Macro trends)" }
                      ].map((tf) => {
                        const isSelected = timeframe === tf.id;
                        return (
                          <button
                            key={tf.id}
                            onClick={() => {
                              if (activePosition) {
                                const confirmChange = confirm(
                                  language === "ID"
                                    ? "Mengubah timeframe sekarang akan memuat ulang bagan grafik dan menutup posisi aktif Anda. Lanjutkan?"
                                    : "Warning: pivoting timeframe now triggers a chart reload and will dump your executing open positions. Continue?"
                                );
                                if (!confirmChange) return;
                              }
                              setTimeframe(tf.id as "1D" | "4H" | "1H");
                            }}
                            title={tf.tooltip}
                            className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                              isSelected
                                ? "bg-emerald-500 text-slate-950 shadow-md"
                                : "text-slate-450 hover:text-slate-200"
                            }`}
                          >
                            {tf.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={handleResetStorageBalance}
                    className="text-xs text-slate-500 hover:text-slate-350 underline font-medium outline-none"
                  >
                    {language === "ID" ? "Reset Saldo" : "Reset Portfolio"}
                  </button>
                </div>
              </div>

              {/* Dynamic Chart Stage Canvas Component */}
              <div className="flex-1 min-h-[420px]">
                <TradingCanvas
                  visibleCandles={visibleCandles}
                  allCandles={allCandles}
                  activePosition={activePosition}
                  tradeHistory={tradeHistory}
                  showShortMa={showShortMa}
                  showLongMa={showLongMa}
                  showBb={showBb}
                  showSr={showSr}
                  pipDecimal={selectedInstrument.pipDecimal}
                  symbol={selectedInstrument.symbol}
                  timeframe={timeframe}
                  language={language}
                />
              </div>

              {/* Control Bay Console (Lot choices, buying buttons, speed management) */}
              <BacktestConsole
                instruments={availableInstruments}
                selectedInstrument={selectedInstrument}
                onChangeInstrument={setSelectedInstrument}
                currentCandleIndex={currentCandleIndex}
                maxCandlesCount={allCandles.length}
                isReplaying={isReplaying}
                onSetReplaying={setIsReplaying}
                onStepForward={handleStepForward}
                onRestartReplay={handleRestartReplay}
                balance={balance}
                activePosition={activePosition}
                tradeHistory={tradeHistory}
                onOpenPosition={handleOpenPosition}
                onClosePosition={handleManualClosePosition}
                currentClosePrice={allCandles[currentCandleIndex]?.close || 1.0}
                pipDecimal={selectedInstrument.pipDecimal}
                backtestDuration={backtestDuration}
                onChangeDuration={setBacktestDuration}
                language={language}
              />

            </div>

            {/* L2: AI Mentor Panel chat board (columns 4) */}
            <div className="lg:col-span-4 flex flex-col h-full gap-4">
              <MentorAI
                currentInstrument={selectedInstrument}
                activePosition={activePosition}
                tradeHistory={tradeHistory}
                balance={balance}
                language={language}
              />

              {/* Dynamic Sidebar Banner Slot */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl relative overflow-hidden text-left space-y-3">
                <div className="flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    {language === "ID" ? "📢 CONTAINER WIDGET IKLAN (300x250)" : "📢 AD WIDGET SLOT (300x250)"}
                  </span>
                  <button 
                    onClick={() => {
                      setActiveMainTab("monetize");
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                    className="text-emerald-400 hover:text-emerald-300 underline font-normal lowercase bg-transparent border-0 outline-none cursor-pointer"
                  >
                    {language === "ID" ? "[ ganti ]" : "[ configure ]"}
                  </button>
                </div>
                
                <div className="w-full flex justify-center items-center min-h-[140px] text-xs">
                  {sidebarBannerCode ? (
                    <div 
                      className="w-full flex justify-center items-center"
                      dangerouslySetInnerHTML={{ __html: sidebarBannerCode }} 
                    />
                  ) : (
                    <div className="text-slate-500 italic text-center py-4">
                      {language === "ID" ? "Pasang script widget iklan 300x250 di sini." : "Place your 300x250 widget scripts here."}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB VIEW B: LEARNING SCHOOL ACADEMY ================= */}
        {activeMainTab === "academy" && (
          <div className="w-full">
            <EducationalSection
              onSuggestTradeSetup={(setup) => {
                const insMatch = availableInstruments.find(i => i.symbol === setup.symbol);
                if (insMatch) {
                  setSelectedInstrument(insMatch);
                  setActiveMainTab("simulator");
                  if (language === "ID") {
                    setSimulationAlert({
                      id: Math.random().toString(),
                      type: "info",
                      title: "Rekomendasi Set Up Dimuat",
                      message: `Mentor Anda merekomendasikan order **${setup.type}** pada ${setup.symbol}. Silakan tinjau level grafik lalu execute order!`
                    });
                  } else {
                    setSimulationAlert({
                      id: Math.random().toString(),
                      type: "info",
                      title: "Trade Recommendation Loaded",
                      message: `Your AI Mentor recommends a **${setup.type}** order on ${setup.symbol}. Inspect support ranges and execute now!`
                    });
                  }
                }
              }}
              userProgress={userProgress}
              onCompleteLesson={handleCompleteLessonLocal}
              xpPoints={xpPoints}
              onAddXp={handleAddXpLocal}
              language={language}
            />
          </div>
        )}

        {/* ================= TAB VIEW C: USER SYSTEM GUIDE ================= */}
        {activeMainTab === "guide" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-4xl mx-auto space-y-6 text-left text-slate-300 text-xs">
            <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-slate-100">{language === "ID" ? "Bimbingan Praktik Simulator Backtesting" : "Backtesting Simulator Practice Guidelines"}</h2>
            </div>

            <div className="space-y-4 leading-relaxed">
              <p>{language === "ID" ? "Platform ini dirancang khusus untuk mewujudkan salah satu taktik belajar trading paling efektif bagi pemula yang disebut **Backtesting Sejarah Pasar**." : "This sandbox environment serves the absolute best professional training workflow: **Historical Market Backtesting**."}</p>
              
              <div className="space-y-2">
                <h3 className="font-bold text-slate-200 uppercase text-[10px]">{language === "ID" ? "Langkah Ke-1: Membaca Strategi di Sekolah Akademi" : "Phase 1: Gain Insights in Academy School"}</h3>
                <p>{language === "ID" ? "Silakan buka tab **Sekolah Dasar (0-100)** terlebih dahulu. Di sana Anda dapat mempelajari:" : "Jump on the **Elementary School** tab to master high-value rules:"}</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li>{language === "ID" ? "Bagaimana membaca volume lilin (**Candlestick Anatomy**)." : "Decoding candle parts and lower wicks (Candlestick Anatomy)."}</li>
                  <li>{language === "ID" ? "Bagaimana cara jitu menentukan arah pasar (**Uptrend, Downtrend, Sideways**)." : "Recognizing major structures (Uptrend, Downtrend, and Sideways ranges)."}</li>
                  <li>{language === "ID" ? "Prinsip perlindungan utama modal Anda (**Stop Loss, Take Profit, dan Rasio 1:2**)." : "The ultimate portfolio protective rules (Stop Loss (SL), Take Profit (TP), and 1:2 Risk ratios)."}</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-200 uppercase text-[10px]">{language === "ID" ? "Langkah Ke-2: Menentukan Titik Masuk (Entry)" : "Phase 2: Establish Entry Triggers on Replay Charts"}</h3>
                <p>{language === "ID" ? "Pindahkan tab Anda ke **Replay & Simulasi**. Pilih instrumen yang ingin dipelajari (misal: Emas/XAU-USD)." : "Switch over to the **Replay & Simulator** tab. Choose your preferred trading market (e.g. Gold/XAU-USD)."}</p>
                <ol className="list-decimal pl-5 space-y-1.5 text-slate-400">
                  <li>{language === "ID" ? "Gunakan tombol kontrol kecepatan untuk melihat bagaimana pergerakan harga berfluktuasi secara visual." : "Slide the replay speed controls to visualize complex candle formations dynamically."}</li>
                  <li>{language === "ID" ? "Aktifkan asisten **Panduan S&R** untuk otomatis menandai garis support (lantai psikologis harga) dan resistance (atap psikologis harga)." : "Enable the **S&R lines** to map horizontal floors (Support demand zones) and ceilings (Resistance supply barriers)."}</li>
                  <li>{language === "ID" ? "Carilah konfirmasi pola lilin reversal seperti **Hammer** di dekat support atau **Engulfing** di dekat resistance setelah menekan pause." : "Identify high-probability setups like **Hammers** or bullish pinbars hovering near support zones."}</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-200 uppercase text-[10px]">{language === "ID" ? "Langkah Ke-3: Masuk ke Simulasi Transaksi (BUY atau SELL)" : "Phase 3: Deploy Execution Orders (BUY or SELL)"}</h3>
                <p>{language === "ID" ? "Tentukan parameter ukuran lot Anda (misal: 0.1 lot). Sangat direkomendasikan menguji dengan rasio perlindungan risiko ketat:" : "Choose your trade sizing (lot sizes). We strictly advise the following professional settings:"}</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li>{language === "ID" ? "Nyalakan checkbox **Stop Loss (SL)** dan **Take Profit (TP)**." : "Always keep **Stop Loss (SL)** and **Take Profit (TP)** enabled."}</li>
                  <li>{language === "ID" ? "Tekan tombol **Atur R:R 1:2** untuk meletakkan pengaman secara proporsional otomatis demi meminimalisir kegagalan." : "Tap **R:R 1:2** to set mathematically balanced limits instantly."}</li>
                  <li>{language === "ID" ? "Tekan tombol **BUY** (jika memprediksi harga memantul naik) atau **SELL** (jika memprediksi harga tertekan turun)." : "Tap **BUY** (for upward expectation) or **SELL** (for downward expectation)."}</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-200 uppercase text-[10px]">{language === "ID" ? "Langkah Ke-4: Evaluasi Menggunakan Asisten AI" : "Phase 4: Seek Mentoring and Portfolio Audits"}</h3>
                <p>{language === "ID" ? "Di kolom bagian kanan layar Anda, **Mentor AI Aksara** siap membimbing Anda kapan pun. Tanyakan padanya tentang letak posisi transaksi Anda!" : "In the right-hand panel, **Mentor AI Aksara** stands ready 24/7. Query him about active or past results!"}</p>
                <p className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 leading-normal text-[11px] font-mono select-all">
                  {language === "ID" 
                    ? `Cobalah bertanya: "Aksara, apakah penempatan SL 25 pips pada EURUSD yang baru saja saya buka sudah aman sesuai teori support terdekat?"`
                    : `Try asking: "Aksara, is my Stop Loss under the EURUSD local floor safe according to sound support theory?"`
                  }
                </p>
                <p>{language === "ID" ? "Asisten AI akan mendeteksi transaksi simulasi aktif Anda secara real-time dan memberikan koreksi, evaluasi, serta dorongan psikologis yang sehat!" : "Aksara automatically retrieves active coordinates, giving constructive performance critiques and psychological guidance!"}</p>
              </div>
            </div>
            
            <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-[11px] text-slate-500">
              <span>{language === "ID" ? "Selamat berlatih, trader masa depan! Keberhasilan ada di tangan disiplin Anda." : "Happy training, future market wizards!"}</span>
              <button
                onClick={() => setActiveMainTab("simulator")}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg"
              >
                {language === "ID" ? "Mulai Latihan Replay" : "Open Replay Simulator"}
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB VIEW D: AI CHART IMAGE ANALYZER ================= */}
        {activeMainTab === "analyzer" && (
          <div className="w-full">
            <ChartAnalyzer language={language} />
          </div>
        )}

        {/* ================= TAB VIEW E: MONETISASI IKLAN & VPS HOSTING PANEL ================= */}
        {activeMainTab === "monetize" && (
          <div className="space-y-6 max-w-5xl mx-auto text-left">
            
            {/* Header intro card */}
            <div className="bg-slate-900 border border-slate-805 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="space-y-2 flex-grow">
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  {language === "ID" ? "Monetisasi & Hosting" : "Monetization & Web Hosting"}
                </div>
                <h2 className="text-xl font-black text-slate-100 uppercase tracking-tight flex items-center gap-2">
                  <Settings className="w-5.5 h-5.5 text-amber-500" />
                  {language === "ID" ? "Pengaturan Slot Iklan & Deployment VPS" : "Third-Party Ad Slot & VPS Setup"}
                </h2>
                <p className="text-slate-350 text-xs leading-relaxed max-w-2xl">
                  {language === "ID" 
                    ? "Kelola monetisasi aplikasi Anda dengan menyematkan kode skrip iklan banner, pop-under, popup, atau skrip tracker analytics dari pihak ketiga (seperti AdSense, Adsterra, Adsterra Direct Link, PropellerAds, PopAds, dll). Pelajari juga cara memindahkan website bursa simulasi ini ke VPS milik sendiri." 
                    : "Manage code monetization arrays. Paste custom scripts (leaderboard frames, popup triggers, redirects, or analytics code) from third-party partners (e.g. Google AdSense, Adsterra, PropellerAds, PopAds) directly. Review steps to migrate onto standard VPS."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <button
                  onClick={() => {
                    const confirmResetDefaults = confirm(
                      language === "ID"
                        ? "Kembalikan slot iklan ke banner bawaan VIP, skrip popup & skrip popunder?"
                        : "Reset all ad slots, popup and popunder scripts back to default?"
                    );
                    if (confirmResetDefaults) {
                      localStorage.removeItem("ad_top_banner");
                      localStorage.removeItem("ad_sidebar_banner");
                      localStorage.removeItem("ad_popup_script");
                      localStorage.removeItem("ad_popunder_script");
                      window.location.reload();
                    }
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all outline-none"
                >
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                  <span>{language === "ID" ? "Reset Default" : "Reset Default"}</span>
                </button>
              </div>
            </div>

            {/* Ads Code manager grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Leaderboard slot code manager card */}
              <div className="bg-slate-900 border border-slate-805 rounded-2.5xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded-xl text-amber-400">
                      <Code className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-100 text-xs">BANNER LEADERBOARD</h3>
                      <p className="text-[10px] text-slate-400">Slot Atas (728x90 px)</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-450 leading-normal mb-1">
                    {language === "ID" 
                      ? "Kode HTML atau <iframe /> yang akan di-render di bawah bar navigasi global."
                      : "Pasted HTML, iframe frame, or tag lines loaded at top leaderboard spaces."}
                  </p>
                  
                  <textarea
                    value={topBannerCode}
                    onChange={(e) => handleSaveTopBanner(e.target.value)}
                    placeholder="Contoh: <iframe src='https://...' width='728' height='90'></iframe>"
                    className="w-full h-40 bg-slate-950 border border-slate-805 rounded-xl p-3 font-mono text-[10px] text-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
                  />
                </div>
                
                <button
                  onClick={() => {
                    alert(language === "ID" ? "Disimpan! Perubahan pada Slot Banner Leaderboard langsung diterapkan." : "Saved! Leaderboard banner array modernized instantly.");
                  }}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md outline-none mt-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{language === "ID" ? "Simpan Slider Atas" : "Apply Top Banner"}</span>
                </button>
              </div>

              {/* Sidebar item ad code manager card */}
              <div className="bg-slate-900 border border-slate-805 rounded-2.5xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-500/10 border border-blue-500/30 p-2 rounded-xl text-blue-405">
                      <Coins className="w-4 h-4 text-emerald-450" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-100 text-xs">WIDGET AD SIDEBAR</h3>
                      <p className="text-[10px] text-slate-400">Slot Kotak (300x250 px)</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-450 leading-normal mb-1">
                    {language === "ID" 
                      ? "Kode bursa iklan widget yang akan dirender di bagian kanan layar bursa simulasi."
                      : "Pasted elements injected dynamically in right sidebar widget panels."}
                  </p>
                  
                  <textarea
                    value={sidebarBannerCode}
                    onChange={(e) => handleSaveSidebarBanner(e.target.value)}
                    placeholder="Contoh: <a href='https://...'><img src='https://...' /></a>"
                    className="w-full h-40 bg-slate-950 border border-slate-805 rounded-xl p-3 font-mono text-[10px] text-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
                  />
                </div>
                
                <button
                  onClick={() => {
                    alert(language === "ID" ? "Disimpan! Perubahan pada Widget Ad Sidebar langsung diterapkan." : "Saved! Sidebar widget structure stored successfully.");
                  }}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md outline-none mt-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{language === "ID" ? "Simpan Widget" : "Apply Sidebar Ad"}</span>
                </button>
              </div>

              {/* Popup / Direct JS inject managers card */}
              <div className="bg-slate-900 border border-slate-850 rounded-2.5xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="bg-pink-500/10 border border-pink-500/30 p-2 rounded-xl text-pink-400">
                      <Globe className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-100 text-xs">SKRIP POPUP & TRACKER</h3>
                      <p className="text-[10px] text-slate-400">Skrip Head/Body Injeksi</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-450 leading-normal mb-1">
                    {language === "ID" 
                      ? "Skrip popup otomatis, direct link, atau analytics tracker."
                      : "Embed visitor counts, custom overlays, or general JS triggers."}
                  </p>
                  
                  <textarea
                    value={popupScriptCode}
                    onChange={(e) => handleSavePopupScript(e.target.value)}
                    placeholder="Contoh: <script src='https://...' async></script>"
                    className="w-full h-40 bg-slate-950 border border-slate-805 rounded-xl p-3 font-mono text-[10px] text-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
                  />
                </div>
                
                <button
                  onClick={() => {
                    alert(language === "ID" ? "Disimpan! Kode skrip/popup di-injeksi ke DOM sistem utama." : "Saved! Custom scripts parsed and live appended on active frame state.");
                  }}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md outline-none mt-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{language === "ID" ? "Terapkan Popup" : "Inject Popup Script"}</span>
                </button>
              </div>

              {/* Popunder specific slot manager card */}
              <div className="bg-slate-900 border border-slate-850 rounded-2.5xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="bg-purple-500/10 border border-purple-500/30 p-2 rounded-xl text-purple-400">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-100 text-xs">SKRIP POPUNDER</h3>
                      <p className="text-[10px] text-slate-400">Penampung Khusus Popunder</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-450 leading-normal mb-1">
                    {language === "ID" 
                      ? "Kode script iklan popunder otomatis atau directlink dari jaringan periklanan Anda."
                      : "Pasted popunder codes, smartlink tags, or direct click redirects."}
                  </p>
                  
                  <textarea
                    value={popunderScriptCode}
                    onChange={(e) => handleSavePopunderScript(e.target.value)}
                    placeholder="Contoh: <script src='https://...'></script>"
                    className="w-full h-40 bg-slate-950 border border-slate-805 rounded-xl p-3 font-mono text-[10px] text-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
                  />
                </div>
                
                <button
                  onClick={() => {
                    alert(language === "ID" ? "Disimpan! Kode popunder telah disematkan secara dinamis." : "Saved! Popunder scripts initialized and loaded.");
                  }}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md outline-none mt-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{language === "ID" ? "Terapkan Popunder" : "Inject Popunder"}</span>
                </button>
              </div>

            </div>

            {/* VPS HOSTING AND DEPLOYMENT DETAILED INSTRUCTIONS MANUAL CARD */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="border-b border-slate-800 pb-3 flex items-center gap-2.5">
                <Server className="w-5.5 h-5.5 text-emerald-400" />
                <h3 className="text-sm md:text-base font-extrabold text-slate-100 tracking-tight uppercase">
                  {language === "ID" ? "🚀 PANDUAN DEPLOYMENT KE HOSTING VPS (Virtual Private Server)" : "🚀 DEPLOYMENT GUIDE TO SELF-HOSTED VPS"}
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs text-slate-300 leading-relaxed font-sans">
                
                {/* Steps Column (Col 7) */}
                <div className="lg:col-span-7 space-y-5">
                  <p>
                    {language === "ID" 
                      ? "Aplikasi Akademi Trading Interaktif dibangun menggunakan teknologi modern React + Vite + TypeScript yang sangat ringan. Anda bisa mendeploy-nya dengan sangat mudah pada hosting VPS Linux murah (seperti DigitalOcean, Linode, Vultr, Biznet, DomaiNesia, dll) menggunakan beberapa langkah berikut:"
                      : "This Interactive Trading Academy app is crafted on lightning-fast React + Vite + TypeScript foundations. You can spin it up globally on low-cost virtual private servers (VPS) with total control by carrying out these standard steps:"}
                  </p>

                  <div className="space-y-4">
                    
                    <div className="space-y-1">
                      <h4 className="font-black text-emerald-400 uppercase text-[11px]">1. Persiapan Server VPS</h4>
                      <p className="text-slate-400">
                        {language === "ID" 
                          ? "Gunakan OS Ubuntu Server 20.04/22.04 LTS. Masuk (SSH) ke VPS Anda lalu install Node.js versi 18+ atau Docker."
                          : "Rent an Ubuntu 20.04/22.04 box. SSH into your core host terminal and configure NodeJS framework binaries."}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-black text-emerald-400 uppercase text-[11px]">2. Membangun Kode Produksi (Build)</h4>
                      <p className="text-slate-400">
                        {language === "ID" 
                          ? "Pada folder utama proyek Anda, jalankan perintah pembuatan file statis yang optimal:"
                          : "Run build compiler on local development files to yield optimized production outputs:"}
                      </p>
                      <pre className="bg-slate-950 p-2 rounded-xl border border-slate-850 text-[10px] font-mono text-amber-400 overflow-x-auto">
                        npm run build
                      </pre>
                      <p className="text-slate-400 text-[11px]">
                        {language === "ID" 
                          ? "Perintah ini akan menciptakan direktori bernama 'dist' yang berisi seluruh halaman HTML, biner CSS, gambar, dan bundel JS terkompresi."
                          : "This builds a self-contained static folder named '/dist' containing complete cached scripts, assets, and assets stylesheets."}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-black text-emerald-400 uppercase text-[11px]">3. Distribusi Menggunakan File Server (Nginx)</h4>
                      <p className="text-slate-400">
                        {language === "ID" 
                          ? "Upload seluruh isi folder 'dist' ke folder server VPS (misalnya di /var/www/trading-academy/) lalu arahkan menggunakan konfigurasi Nginx Server Block."
                          : "Compress and secure transmit root '/dist' content into server targets, and mount under Nginx rules."}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-black text-emerald-400 uppercase text-[11px]">4. Menjalankan Server Node (PM2)</h4>
                      <p className="text-slate-400">
                        {language === "ID" 
                          ? "Jika Anda mendeploy custom full-stack backend (server.ts), jalankan PM2 agar backend tetap menyala di latar belakang (background process) pada Port 3000:"
                          : "If you scale with customized Node server.ts backends, start up PM2 process keeper to preserve execution on port 3000:"}
                      </p>
                      <pre className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 text-[10px] font-mono text-amber-400 overflow-x-auto">
                        npm install -g pm2<br />
                        pm2 start server.ts --name trading-academy<br />
                        pm2 save && pm2 startup
                      </pre>
                    </div>

                  </div>
                </div>

                {/* Configurations Column (Col 5) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-950 p-4.5 rounded-2xl border border-slate-850 space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-850 pb-2 font-black">
                      <Code className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-slate-200 text-[11px] uppercase tracking-wide">Template Config Nginx</span>
                    </div>
                    <p className="text-[11px] text-slate-450 leading-relaxed">
                      {language === "ID" 
                        ? "Gunakan konfigurasi Nginx berikut di /etc/nginx/sites-available/trading-academy untuk performa proxy bursa stabil:"
                        : "Use this clean reverse proxy routing block on /etc/nginx/sites-available configuration files:"}
                    </p>
                    
                    <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-[9px] font-mono text-emerald-400 overflow-x-auto leading-normal select-all select-text">
{`server {
    listen 80;
    server_name domainanda.com;

    # Folder statis hasil build dist
    root /var/www/trading-academy;
    index index.html;

    # Mengatur rute single page application
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API server jika menggunakan backend
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}`}
                    </pre>
                    
                    <div className="text-[10px] text-slate-500 leading-normal border-t border-slate-850 pt-2 bg-slate-950 space-y-1">
                      <div className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Support Single Page URL routing</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Reverse proxy safe on port 3000</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </main>

      {/* 4. FOOTER CREDITS */}
      <footer className="bg-slate-900 border-t border-slate-800 p-4 text-center text-[11px] text-slate-500 space-y-2">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <span>{language === "ID" ? "© 2026 Akademi Belajar Trading - Backtesting Simulator Tanpa Risiko" : "© 2026 Interactive Candlestick Academy - Risk-Free Replay Backtester"}</span>
          <div className="flex items-center gap-4">
            <span>{language === "ID" ? "Ditenagai oleh Gemini 3.5 Flash" : "Powered by Gemini 3.5 Flash"}</span>
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            <span>{language === "ID" ? "Konektivitas Edukasi Profesional" : "Professional Mentorship Portal"}</span>
          </div>
        </div>
      </footer>

      {/* ================= WELCOME ONBOARDING WINDOW MODAL ================= */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-left shadow-2xl relative space-y-4">
            
            <div className="flex gap-3.5 items-center">
              <div className="bg-emerald-500 text-slate-950 p-2.5 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-100">{t.welcomeHeader}</h3>
                <p className="text-[10px] text-emerald-400 font-mono">{t.welcomeSub}</p>
              </div>
            </div>

            <div className="space-y-3 prose prose-invert prose-xs text-xs text-slate-350 leading-relaxed border-t border-slate-800 pt-3">
              <p>{t.welcomeIntro}</p>
              <p>{t.welcomePointHeader}</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                {[t.welcomePoint1, t.welcomePoint2, t.welcomePoint3, t.welcomePoint4].map((pt, ptIdx) => (
                  <li key={ptIdx}>{pt}</li>
                ))}
              </ul>
            </div>

            <div className="border-t border-slate-800 pt-3 flex justify-end">
              <button
                onClick={() => setShowWelcome(false)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 font-black text-slate-950 py-2.5 rounded-xl text-xs tracking-wider transition-all shadow-lg outline-none"
              >
                {t.welcomeStartBtn}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
