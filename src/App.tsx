import { useState, useEffect } from "react";
import { availableInstruments, generateHistoricalCandles, calculateIndicators } from "./historicalData";
import { Candlestick, Position, TradeLog, Instrument } from "./types";
import { TradingCanvas } from "./components/TradingCanvas";
import { EducationalSection } from "./components/EducationalSection";
import { MentorAI } from "./components/MentorAI";
import { BacktestConsole } from "./components/BacktestConsole";
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
  AlertCircle, 
  Award,
  TrendingUp,
  Scale
} from "lucide-react";

export default function App() {
  const [activeMainTab, setActiveMainTab] = useState<"simulator" | "academy" | "guide">("simulator");

  // Onboarding modal on first load
  const [showWelcome, setShowWelcome] = useState(true);

  // Active Instrument state
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>(availableInstruments[0]);
  
  // Loaded historical chart data
  const [allCandles, setAllCandles] = useState<Candlestick[]>([]);
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

  // Generate dataset on instrument changes
  useEffect(() => {
    const candlesRaw = generateHistoricalCandles(selectedInstrument.id);
    const withIndicators = calculateIndicators(candlesRaw);
    setAllCandles(withIndicators);
    setCurrentCandleIndex(45); // reset view to initial 45 items
    setActivePosition(null); // dump running position
    setIsReplaying(false);
  }, [selectedInstrument]);

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

    const { high, low, close, time } = candle;
    const { type, entryPrice, slPrice, tpPrice, lotSize } = activePosition;
    const contractMultiplier = selectedInstrument.contractSize;

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
      // In a wild candle that touched both limits in 1 single session:
      // We assume conservative Stop Loss occurred first (standard protective simulation)
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
      setSimulationAlert({
        id: Math.random().toString(),
        type: "success",
        title: "🎯 TARGET TAKE PROFIT TERCAPAI!",
        message: `Luar biasa! Posisi ${type} menyentuh target TP di ${exitPrice.toFixed(selectedInstrument.pipDecimal)}. Anda mendulang keuntungan sebesar **+$${tradePnl.toFixed(2)}**! Analisa chart Anda sangat presisi.`
      });
      handleAddXpLocal(100);
    } else if (exitReason === "SL_HIT") {
      setSimulationAlert({
        id: Math.random().toString(),
        type: "danger",
        title: "🛑 PERLINDUNGAN STOP LOSS TRIGERRED",
        message: `Posisi ${type} menyentuh batas pengaman SL di ${exitPrice.toFixed(selectedInstrument.pipDecimal)}. Mengalami rugi terkawal **-$${Math.abs(tradePnl).toFixed(2)}**. Ini keputusan cerdas! Memasang SL menyelamatkan sisa modal belajar Anda dari Margin Call.`
      });
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
      alert("⚠️ Anda sudah memiliki posisi aktif yang berjalan! Tutup terlebih dahulu posisi ini sebelum membuka transaksi baru.");
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
    setSimulationAlert({
      id: Math.random().toString(),
      type: "info",
      title: "🚀 POSISI BERHASIL DIBUKA",
      message: `Membuka transaksi ${type} ${lot} lot pada level entry ${entryPrice.toFixed(selectedInstrument.pipDecimal)}. Jalankan atau percepat Replay di samping untuk melihat perkembangannya!`
    });
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
    const confirmReset = confirm("Apakah Anda ingin menyetel ulang visual replay ke 45 candle pertama? Seluruh catatan transaksi aktif Anda saat ini akan dihentikan.");
    if (!confirmReset) return;

    setCurrentCandleIndex(45);
    setActivePosition(null);
    setIsReplaying(false);
    setSimulationAlert({
      id: Math.random().toString(),
      type: "info",
      title: "🔄 REPLAY CHART DIRESET",
      message: "Grafik historis berhasil disetel ulang ke titik mula pembelajaran. Anda siap melakukan latihan backtesting baru."
    });
  };

  // Reset balance values
  const handleResetStorageBalance = () => {
    const check = confirm("Apakah Anda ingin mereset saldo simulasi Anda kembali ke $10,000?");
    if (!check) return;
    handleUpdateBalance(10000.0);
    setTradeHistory([]);
    localStorage.removeItem("trader_academy_history");
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col justify-between">
      
      {/* 1. TOP NAVBAR HEADBOARD */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Logo & title context */}
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-500 text-slate-950 p-2 rounded-xl font-bold flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h1 className="text-base font-extrabold text-slate-150 tracking-tight">Akademi Trading Interaktif</h1>
              <p className="text-[10px] text-slate-400 font-medium">Belajar Analisa Grafik & Backtesting Risiko Nol</p>
            </div>
          </div>

          {/* Tab Selection Row */}
          <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveMainTab("simulator")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMainTab === "simulator"
                  ? "bg-slate-850 text-emerald-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Replay & Simulasi</span>
            </button>
            <button
              onClick={() => setActiveMainTab("academy")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMainTab === "academy"
                  ? "bg-slate-850 text-emerald-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Sekolah Dasar (0-100)</span>
            </button>
            <button
              onClick={() => setActiveMainTab("guide")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMainTab === "guide"
                  ? "bg-slate-850 text-emerald-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Petunjuk Praktik</span>
            </button>
          </nav>

          {/* Right Header Stats Deck */}
          <div className="flex items-center gap-3">
            {/* Balance Badge */}
            <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-850 px-3 py-1.5 rounded-xl">
              <Coins className="w-4 h-4 text-emerald-400" />
              <div className="text-left font-mono">
                <span className="text-[8px] text-slate-400 block leading-none">SALDO SIMULASI</span>
                <span className="text-xs font-black text-slate-100">${balance.toLocaleString("id-ID", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            {/* XP Points Badge */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-950/80 border border-slate-850 px-3 py-1.5 rounded-xl">
              <Award className="w-4 h-4 text-amber-500" />
              <div className="text-left">
                <span className="text-[8px] text-slate-400 block leading-none">PRESTASI SKOR</span>
                <span className="text-xs font-black text-amber-400">{xpPoints} XP</span>
              </div>
            </div>
          </div>

        </div>
      </header>

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
              
              {/* Interactive Toolbar for Indicators toggle */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3.5 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 font-bold mr-1">Tampilan Indikator:</span>
                  
                  <button
                    onClick={() => setShowShortMa(!showShortMa)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all ${
                      showShortMa
                        ? "bg-amber-400/10 border-amber-500/50 text-amber-300"
                        : "bg-slate-950/40 border-slate-850 text-slate-500 hover:text-slate-350"
                    }`}
                  >
                    Short MA (7)
                  </button>

                  <button
                    onClick={() => setShowLongMa(!showLongMa)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all ${
                      showLongMa
                        ? "bg-violet-400/10 border-violet-500/50 text-violet-300"
                        : "bg-slate-950/40 border-slate-850 text-slate-500 hover:text-slate-350"
                    }`}
                  >
                    Long MA (20)
                  </button>

                  <button
                    onClick={() => setShowBb(!showBb)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all ${
                      showBb
                        ? "bg-purple-400/10 border-purple-500/50 text-purple-300"
                        : "bg-slate-950/40 border-slate-850 text-slate-500 hover:text-slate-350"
                    }`}
                  >
                    Bollinger Bands
                  </button>
                  
                  <button
                    onClick={() => setShowSr(!showSr)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all ${
                      showSr
                        ? "bg-emerald-400/10 border-emerald-500/50 text-emerald-300"
                        : "bg-slate-950/40 border-slate-850 text-slate-500 hover:text-slate-350"
                    }`}
                  >
                    Panduan S&R
                  </button>
                </div>

                {/* Reset Balance Sheet helper */}
                <button
                  onClick={handleResetStorageBalance}
                  className="text-xs text-slate-500 hover:text-slate-300 underline font-medium outline-none"
                >
                  Reset Saldo Simulasi
                </button>
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
              />

            </div>

            {/* L2: AI Mentor Panel chat board (columns 4) */}
            <div className="lg:col-span-4 flex flex-col h-full">
              <MentorAI
                currentInstrument={selectedInstrument}
                activePosition={activePosition}
                tradeHistory={tradeHistory}
                balance={balance}
              />
            </div>

          </div>
        )}

        {/* ================= TAB VIEW B: INDONESIAN TRADING SCHOOL ================= */}
        {activeMainTab === "academy" && (
          <div className="w-full">
            <EducationalSection
              onSuggestTradeSetup={(setup) => {
                const insMatch = availableInstruments.find(i => i.symbol === setup.symbol);
                if (insMatch) {
                  setSelectedInstrument(insMatch);
                  setActiveMainTab("simulator");
                  setSimulationAlert({
                    id: Math.random().toString(),
                    type: "info",
                    title: "Rekomendasi Set Up Dimuat",
                    message: `Mentor Anda merekomendasikan order **${setup.type}** pada ${setup.symbol}. Silakan tinjau level grafik lalu execute order!`
                  });
                }
              }}
              userProgress={userProgress}
              onCompleteLesson={handleCompleteLessonLocal}
              xpPoints={xpPoints}
              onAddXp={handleAddXpLocal}
            />
          </div>
        )}

        {/* ================= TAB VIEW C: USER SYSTEM GUIDE ================= */}
        {activeMainTab === "guide" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-4xl mx-auto space-y-6 text-left text-slate-300 text-xs">
            <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-slate-100">Bimbingan Praktik Simulator Backtesting</h2>
            </div>

            <div className="space-y-4 leading-relaxed">
              <p>Platform ini dirancang khusus untuk mewujudkan salah satu taktik belajar trading paling efektif bagi pemula yang disebut **Backtesting Sejarah Pasar**.</p>
              
              <div className="space-y-2">
                <h3 className="font-bold text-slate-200 uppercase text-[10px]">Langkah Ke-1: Memilih Strategi Di Sekolah</h3>
                <p>Silakan buka tab **Sekolah Dasar (0-100)** terlebih dahulu. Di sana Anda dapat mempelajari:</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li>Bagaimana membaca volume lilin (**Candlestick Anatomy**).</li>
                  <li>Bagaimana cara jitu menentukan arah pasar (**Uptrend, Downtrend, Sideways**).</li>
                  <li>Prinsip perlindungan utama modal Anda (**Stop Loss, Take Profit, dan Rasio 1:2**).</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-200 uppercase text-[10px]">Langkah Ke-2: Menentukan Entry Di Grafik Sejarah</h3>
                <p>Pindahkan tab Anda ke **Replay & Simulasi**. Pilih instrumen yang ingin dipelajari (misal: Emas/XAU-USD).</p>
                <ol className="list-decimal pl-5 space-y-1.5 text-slate-400">
                  <li>Gunakan tombol kontrol kecepatan untuk melihat bagaimana pergerakan harga berfluktuasi secara visual.</li>
                  <li>Aktifkan asisten **Panduan S&R** untuk otomatis menandai garis support (lantai psikologis harga) dan resistance (atap psikologis harga).</li>
                  <li>Carilah konfirmasi pola lilin reversal seperti **Hammer** di dekat support atau **Engulfing** di dekat resistance setelah menekan pause.</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-200 uppercase text-[10px]">Langkah Ke-3: Masuk ke Simulasi Transaksi (BUY atau SELL)</h3>
                <p>Tentukan parameter ukuran lot Anda (misal: 0.1 lot). Sangat direkomendasikan menguji dengan rasio perlindungan risiko ketat:</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li>Nyalakan checkbox **Stop Loss (SL)** dan **Take Profit (TP)**.</li>
                  <li>Tekan tombol **Atur R:R 1:2** untuk meletakkan pengaman secara proporsional otomatis demi meminimalisir kegagalan.</li>
                  <li>Tekan tombol **BUY** (jika memprediksi harga memantul naik) atau **SELL** (jika memprediksi harga tertekan turun).</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-200 uppercase text-[10px]">Langkah Ke-4: Evaluasi Menggunakan Asisten AI</h3>
                <p>Di kolom bagian kanan layar Anda, **Mentor AI Aksara** siap membimbing Anda kapan pun. Tanyakan padanya tentang letak posisi transaksi Anda!</p>
                <p className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 leading-normal text-[11px] font-mono select-all">
                  Cobalah bertanya: "Aksara, apakah penempatan SL 25 pips pada EURUSD yang baru saja saya buka sudah aman sesuai teori support terdekat?"
                </p>
                <p>Asisten AI akan mendeteksi transaksi simulasi aktif Anda secara real-time dan memberikan koreksi, evaluasi, serta dorongan psikologis yang sehat!</p>
              </div>
            </div>
            
            <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-[11px] text-slate-500">
              <span>Selamat berlatih, trader masa depan! Keberhasilan ada di tangan disiplin Anda.</span>
              <button
                onClick={() => setActiveMainTab("simulator")}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg"
              >
                Mulai Latihan Replay
              </button>
            </div>
          </div>
        )}

      </main>

      {/* 4. FOOTER CREDITS */}
      <footer className="bg-slate-900 border-t border-slate-800 p-4 text-center text-[11px] text-slate-500 space-y-2">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <span>&copy; 2026 Akademi Belajar Trading - Backtesting Simulator Tanpa Risiko</span>
          <div className="flex items-center gap-4">
            <span>Ditenagai oleh Gemini 3.5 Flash</span>
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            <span>Konektivitas Edukasi Profesional</span>
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
                <h3 className="text-base font-black text-slate-100">Selamat Datang di Akademi Trading!</h3>
                <p className="text-[10px] text-emerald-400 font-mono">Bimbingan Dasar trading dari nol sampai lulus</p>
              </div>
            </div>

            <div className="space-y-3 prose prose-invert prose-xs text-xs text-slate-350 leading-relaxed border-t border-slate-800 pt-3">
              <p>Halo calon trader! Kami menyediakan simulator interkatif di mana Anda bisa **memutar ulang sejarah pergerakan harga pasar (Gold, Bitcoin, & Forex) secara candle-by-candle**.</p>
              <p>Di sini Anda bebas melakukan:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li>Menguji strategi tanpa resiko menggunakan dana simulasi **$10,000**.</li>
                <li>Mencoba open posisi BUY atau SELL, memasang **Stop Loss (SL)** perlindungan, serta target **Take Profit (TP)** di grafik.</li>
                <li>Belajar kurikulum materi lengkap dengan kuis interaktif berhadiah XP.</li>
                <li>Berkonsultasi langsung secara real-time dengan **Mentor AI Aksara** mengenai grafik atau riwayat portofolio Anda!</li>
              </ul>
            </div>

            <div className="border-t border-slate-800 pt-3 flex justify-end">
              <button
                onClick={() => setShowWelcome(false)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 font-black text-slate-950 py-2.5 rounded-xl text-xs tracking-wider transition-all shadow-lg outline-none"
              >
                Mulai Masuk & Belajar Sekarang
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
