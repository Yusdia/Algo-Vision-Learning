import React, { useState, useEffect } from "react";
import { Instrument, Position, TradeLog } from "../types";
import { Play, Pause, SkipForward, RotateCcw, TrendingUp, ShieldAlert, FileText, Ban, Clock } from "lucide-react";
import { Language, translations } from "../translations";

interface BacktestConsoleProps {
  instruments: Instrument[];
  selectedInstrument: Instrument;
  onChangeInstrument: (inst: Instrument) => void;
  // Replay State
  currentCandleIndex: number;
  maxCandlesCount: number;
  isReplaying: boolean;
  onSetReplaying: (playing: boolean) => void;
  onStepForward: () => void;
  onRestartReplay: () => void;
  // Simulation Trade State
  balance: number;
  activePosition: Position | null;
  tradeHistory: TradeLog[];
  onOpenPosition: (type: "BUY" | "SELL", lot: number, leverage: number, sl: number | null, tp: number | null) => void;
  onClosePosition: (reason: "MANUAL_CLOSE") => void;
  currentClosePrice: number;
  pipDecimal: number;
  // Duration Selectors
  backtestDuration: number;
  onChangeDuration: (duration: number) => void;
  language: Language;
}

export const BacktestConsole: React.FC<BacktestConsoleProps> = ({
  instruments,
  selectedInstrument,
  onChangeInstrument,
  currentCandleIndex,
  maxCandlesCount,
  isReplaying,
  onSetReplaying,
  onStepForward,
  onRestartReplay,
  balance,
  activePosition,
  tradeHistory,
  onOpenPosition,
  onClosePosition,
  currentClosePrice,
  pipDecimal,
  backtestDuration,
  onChangeDuration,
  language
}) => {
  const t = translations[language];

  // Trade setup variables
  const [lotSize, setLotSize] = useState<number>(0.1);
  const [leverage, setLeverage] = useState<number>(100);
  
  // SL / TP Inputs
  const [useSl, setUseSl] = useState(true);
  const [useTp, setUseTp] = useState(true);
  const [slPips, setSlPips] = useState<number>(30); // distance in pips
  const [tpPips, setTpPips] = useState<number>(60); // distance in pips

  // State values calculated
  const [calculatedSl, setCalculatedSl] = useState<number | null>(null);
  const [calculatedTp, setCalculatedTp] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<"trade" | "history">("trade");
  const [replaySpeed, setReplaySpeed] = useState<number>(1000); // ms per candle

  // Automatically recalculate corresponding absolute SL/TP prices based on current price plus pip bounds
  const updatePricesAndPips = (type: "BUY" | "SELL") => {
    const pipMultiplier = selectedInstrument.pipSize;
    
    let slVal: number | null = null;
    let tpVal: number | null = null;

    if (type === "BUY") {
      if (useSl) slVal = currentClosePrice - slPips * pipMultiplier;
      if (useTp) tpVal = currentClosePrice + tpPips * pipMultiplier;
    } else {
      if (useSl) slVal = currentClosePrice + slPips * pipMultiplier;
      if (useTp) tpVal = currentClosePrice - tpPips * pipMultiplier;
    }

    setCalculatedSl(slVal ? Number(slVal.toFixed(pipDecimal)) : null);
    setCalculatedTp(tpVal ? Number(tpVal.toFixed(pipDecimal)) : null);
  };

  // Re-run updates on parameter shifts
  useEffect(() => {
    updatePricesAndPips("BUY"); // default calculation reference
  }, [currentClosePrice, slPips, tpPips, useSl, useTp, selectedInstrument]);

  // Handle Play continuous interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isReplaying) {
      interval = setInterval(() => {
        if (currentCandleIndex >= maxCandlesCount - 1) {
          onSetReplaying(false);
        } else {
          onStepForward();
        }
      }, replaySpeed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isReplaying, currentCandleIndex, maxCandlesCount, replaySpeed]);

  // Compute margins & dynamic estimations
  const lotStep = selectedInstrument.id === "eurusd" ? 0.1 : 0.05;
  const minLot = 0.01;
  const maxLot = 5.0;

  const currentContractValue = currentClosePrice * lotSize * selectedInstrument.contractSize;
  const requiredMargin = currentContractValue / leverage;
  const expectedRiskDollars = useSl ? (slPips * selectedInstrument.pipSize * lotSize * selectedInstrument.contractSize) : null;
  const expectedRewardDollars = useTp ? (tpPips * selectedInstrument.pipSize * lotSize * selectedInstrument.contractSize) : null;
  const riskRewardRatio = useSl && useTp && slPips > 0 ? (tpPips / slPips).toFixed(1) : "N/A";

  const handleOpenLocalPosition = (type: "BUY" | "SELL") => {
    if (requiredMargin > balance) {
      if (language === "ID") {
        alert("⚠️ Jaminan Margin Tidak Cukup! Perkecil ukuran lot Anda atau naikkan leverage.");
      } else {
        alert("⚠️ Insufficient Margin Collateral! Decrease lot size or increase selected leverage.");
      }
      return;
    }

    const pipMultiplier = selectedInstrument.pipSize;
    let finalSl: number | null = null;
    let finalTp: number | null = null;

    if (type === "BUY") {
      if (useSl) finalSl = currentClosePrice - slPips * pipMultiplier;
      if (useTp) finalTp = currentClosePrice + tpPips * pipMultiplier;
    } else {
      if (useSl) finalSl = currentClosePrice + slPips * pipMultiplier;
      if (useTp) finalTp = currentClosePrice - tpPips * pipMultiplier;
    }

    // Set precise digits representation
    const roundSl = finalSl ? Number(finalSl.toFixed(pipDecimal)) : null;
    const roundTp = finalTp ? Number(finalTp.toFixed(pipDecimal)) : null;

    onOpenPosition(type, lotSize, leverage, roundSl, roundTp);
  };

  // Premade R:R helpers for easy setup
  const setRecommendedRatio = (ratio: 1.5 | 2 | 3) => {
    setUseSl(true);
    setUseTp(true);
    let sl = 30;
    if (selectedInstrument.id === "bitcoin") {
      sl = 400;
    } else if (selectedInstrument.id === "gold") {
      sl = 40;
    } else {
      sl = 25;
    }
    setSlPips(sl);
    setTpPips(Math.round(sl * ratio));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-slate-200">
      
      {/* 1. SPEEDBAR & REPLAY DECKS (left col span 5) */}
      <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {language === "ID" ? "Kombinasi Replay" : "Replay System"}
            </span>
            <span className="text-xs font-mono text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
              Bar: {currentCandleIndex + 1}/{maxCandlesCount}
            </span>
          </div>

          {/* Asset instrument swapper */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] uppercase font-bold text-slate-400">
              {language === "ID" ? "Pilih Aset Perdagangan:" : "Select Trading Instrument:"}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {instruments.map((ins) => {
                const isActive = selectedInstrument.id === ins.id;
                return (
                  <button
                    key={ins.id}
                    onClick={() => {
                      if (activePosition) {
                        const leave = confirm(t.confirmTimeframe);
                        if (!leave) return;
                      }
                      onChangeInstrument(ins);
                    }}
                    className={`px-2 py-2 rounded-xl text-xs font-bold transition-all border text-center ${
                      isActive
                        ? "bg-slate-950 text-emerald-400 border-emerald-500/50 shadow-md"
                        : "bg-slate-950/40 text-slate-400 border-slate-850 hover:border-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <div>{ins.symbol}</div>
                    <div className="text-[8px] font-normal opacity-85">{ins.name.split(" ")[0]}</div>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400 leading-tight italic pl-1">{selectedInstrument.description}</p>
          </div>

          {/* Dynamic Replay Duration Selection */}
          <div className="space-y-1.5 pt-1 text-left">
            <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.durationLabel}</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { value: 365, label: language === "ID" ? "1 Tahun" : "1 Year", desc: language === "ID" ? "365 Hari - Tick" : "365 Days - Tick" },
                { value: 180, label: language === "ID" ? "6 Bulan" : "6 Months", desc: language === "ID" ? "180 Hari" : "180 Days" },
                { value: 90, label: language === "ID" ? "3 Bulan" : "3 Months", desc: language === "ID" ? "90 Hari" : "90 Days" },
              ].map((opt) => {
                const isSel = backtestDuration === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      if (activePosition) {
                        const leave = confirm(t.confirmTimeframe);
                        if (!leave) return;
                      }
                      onChangeDuration(opt.value);
                    }}
                    className={`px-1.5 py-1.5 rounded-xl text-xs font-bold transition-all border text-center ${
                      isSel
                        ? "bg-slate-950 text-emerald-400 border-emerald-500/50 shadow-md"
                        : "bg-slate-950/40 text-slate-400 border-slate-850 hover:border-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <div className="text-[11px] font-black">{opt.label}</div>
                    <div className="text-[8px] font-normal opacity-75">{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Replay controller button pad */}
          <div className="space-y-2 pt-1 text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400 block pb-1">{t.controlsTitle}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSetReplaying(!isReplaying)}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all outline-none ${
                    isReplaying
                      ? "bg-cyan-600 hover:bg-cyan-700 text-white animate-pulse"
                      : "bg-emerald-500 hover:bg-emerald-600 text-slate-950"
                  }`}
              >
                {isReplaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-white text-white" />
                    <span>{language === "ID" ? "Pause Replay" : "Pause Replay"}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
                    <span>{language === "ID" ? "Putar Replay" : "Play Replay"}</span>
                  </>
                )}
              </button>

              <button
                onClick={onStepForward}
                disabled={isReplaying || currentCandleIndex >= maxCandlesCount - 1}
                title={language === "ID" ? "Lompati 1 Candle" : "Skip 1 Candle"}
                aria-label={language === "ID" ? "Lompati 1 Candle" : "Skip 1 Candle"}
                className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl hover:bg-slate-850 hover:border-slate-700 transition-all text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const reset = confirm(t.confirmResetReplay);
                  if (reset) {
                    onRestartReplay();
                  }
                }}
                title={language === "ID" ? "Ulangi dari Awal" : "Start Anew"}
                aria-label={language === "ID" ? "Ulangi dari Awal" : "Start Anew"}
                className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl hover:bg-slate-850 hover:border-slate-700 hover:text-rose-400 text-slate-300 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Play speed slider */}
          <div className="space-y-1.5 pt-1 text-left">
            <label htmlFor="replay-speed-slider" className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400 cursor-pointer block w-full">
              <span>{t.replaySpeedLabel}</span>
              <span className="font-mono text-emerald-400">{(1000 / replaySpeed).toFixed(1)} Bar/{language === "ID" ? "detik" : "sec"}</span>
            </label>
            <input
              type="range"
              min="200"
              max="2400"
              step="200"
              value={2600 - replaySpeed} // invert so larger value is faster
              onChange={(e) => setReplaySpeed(2600 - Number(e.target.value))}
              id="replay-speed-slider"
              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              aria-label={t.replaySpeedLabel}
            />
          </div>
        </div>

        {/* Tip section */}
        <div className="mt-4 bg-slate-950/80 p-2.5 rounded-xl border border-slate-850 text-[10px] leading-relaxed text-slate-400 text-left">
          {language === "ID" ? (
            <>
              <span className="font-bold text-amber-500">PRO TIPS:</span> Tekan tombol **Putar Replay** untuk mensimulasikan pergerakan pasar secara otomatis. Tekan **Pause Replay** lalu tekan **Lompati 1 Candle** untuk menganalisis perkembangan posisi lilin demi lilin lebih teliti!
            </>
          ) : (
            <>
              <span className="font-bold text-amber-500">PRO TIPS:</span> Tap the **Play Replay** button to cycle historical charts autonomously. Pausing the system and stepping over candle-by-candle enables incredibly deep visual confirmations.
            </>
          )}
        </div>
      </div>

      {/* 2. ORDER DESK & TRADE TABS (col-span 7) */}
      <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col">
        
        {/* Tab Headers */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl mb-4 border border-slate-850">
          <button
            onClick={() => setActiveTab("trade")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              activeTab === "trade"
                ? "bg-slate-850 text-emerald-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{t.orderSetupTab}</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              activeTab === "history"
                ? "bg-slate-850 text-emerald-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t.tradeHistoryTab} ({tradeHistory.length})</span>
          </button>
        </div>

        {/* ================= TAB A: SIMULATION TRADE INTERFACE ================= */}
        {activeTab === "trade" && (
          <div className="space-y-4 flex-grow flex flex-col justify-between">
            
            {/* If there's an active running position */}
            {activePosition ? (
              <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-3 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        activePosition.type === "BUY" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                      }`}>
                        {activePosition.type} {language === "ID" ? "POSISI AKTIF" : "RUNNING POSITION"}
                      </span>
                      <span className="text-xs text-slate-300 font-bold">{selectedInstrument.symbol}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Lot: {activePosition.lotSize}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-slate-900 p-2.5 rounded-xl border border-slate-850/60 mt-2 text-xs text-left">
                    <div>
                      <span className="text-[10px] text-slate-400 block">{language === "ID" ? "Harga Masuk:" : "Entry Price:"}</span>
                      <span className="font-mono font-bold text-slate-200">{activePosition.entryPrice.toFixed(pipDecimal)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">{language === "ID" ? "Harga Saat Ini:" : "Current Price:"}</span>
                      <span className="font-mono font-bold text-slate-200">{currentClosePrice.toFixed(pipDecimal)}</span>
                    </div>
                    <div className="col-span-2 border-t border-slate-800/80 pt-2 flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">{language === "ID" ? "Pengaman Stop Loss (SL):" : "Stop Loss Guard (SL):"}</span>
                      <span className="font-mono font-bold text-rose-450/90">{activePosition.slPrice ? activePosition.slPrice.toFixed(pipDecimal) : (language === "ID" ? "Tanpa SL" : "No SL Protected")}</span>
                    </div>
                    <div className="col-span-2 border-t border-slate-800/80 pt-1 flex justify-between items-center font-mono">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">{language === "ID" ? "Target Take Profit (TP):" : "Target Take Profit (TP):"}</span>
                      <span className="font-mono font-bold text-emerald-450/90">{activePosition.tpPrice ? activePosition.tpPrice.toFixed(pipDecimal) : (language === "ID" ? "Tanpa TP" : "No TP Set")}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {/* Floating PnL meter */}
                  {(() => {
                    const priceDiff = currentClosePrice - activePosition.entryPrice;
                    const contractSize = selectedInstrument.contractSize;
                    const floatPnL = activePosition.type === "BUY" 
                      ? priceDiff * activePosition.lotSize * contractSize
                      : -priceDiff * activePosition.lotSize * contractSize;
                    
                    const isProfit = floatPnL >= 0;

                    return (
                      <div className="space-y-1 text-center bg-slate-900 border border-slate-850 p-2.5 rounded-xl">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">{t.floatingPnl}:</span>
                        <div className={`text-xl font-mono font-black ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>
                          {isProfit ? "+" : "-"}${Math.abs(floatPnL).toFixed(2)}
                        </div>
                      </div>
                    );
                  })()}

                  <button
                    onClick={() => onClosePosition("MANUAL_CLOSE")}
                    className="w-full bg-rose-500 hover:bg-rose-600 active:scale-95 text-slate-950 font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg"
                  >
                    <Ban className="w-4 h-4 text-slate-950" />
                    <span>{t.closePositionBtn}</span>
                  </button>
                </div>
              </div>
            ) : (
              // Setup Position desk
              <div className="space-y-3.5 text-left">
                
                {/* Lot & Leverage options */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="lot-size-input" className="text-[10px] font-bold uppercase text-slate-400 flex justify-between cursor-pointer">
                      <span>{t.lotSizeLabel}:</span>
                      <span className="text-emerald-400 font-mono font-bold">{(lotSize).toFixed(2)} Lot</span>
                    </label>
                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl overflow-hidden p-1">
                      <button
                        type="button"
                        onClick={() => setLotSize((l) => Math.max(minLot, Number((l - lotStep).toFixed(2))))}
                        aria-label={language === "ID" ? "Kurangi lot" : "Decrease lot size"}
                        className="px-2 py-1 text-slate-450 hover:bg-slate-900 hover:text-slate-100 rounded text-xs outline-none"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        step={lotStep}
                        min={minLot}
                        max={maxLot}
                        value={lotSize}
                        onChange={(e) => setLotSize(Math.max(minLot, Math.min(maxLot, Number(Number(e.target.value).toFixed(2)) || minLot)))}
                        id="lot-size-input"
                        className="w-full bg-transparent text-center text-xs font-mono font-bold outline-none text-slate-100"
                        aria-label={t.lotSizeLabel}
                      />
                      <button
                        type="button"
                        onClick={() => setLotSize((l) => Math.min(maxLot, Number((l + lotStep).toFixed(2))))}
                        aria-label={language === "ID" ? "Tambah lot" : "Increase lot size"}
                        className="px-2 py-1 text-slate-450 hover:bg-slate-900 hover:text-slate-100 rounded text-xs outline-none"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="leverage-select" className="text-[10px] font-bold uppercase text-slate-400 cursor-pointer">{t.leverageLabel}:</label>
                    <select
                      id="leverage-select"
                      value={leverage}
                      onChange={(e) => setLeverage(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 outline-none"
                      aria-label={t.leverageLabel}
                    >
                      <option value="10">1:10 ({language === "ID" ? "Konservatif" : "Conservative"})</option>
                      <option value="50">1:50 ({language === "ID" ? "Sedang" : "Moderate"})</option>
                      <option value="100">1:100 ({language === "ID" ? "Disarankan" : "Recommended"})</option>
                      <option value="200">1:200 ({language === "ID" ? "Agresif" : "Aggressive"})</option>
                    </select>
                  </div>
                </div>

                {/* SL / TP toggle options */}
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-350 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                      <span>{language === "ID" ? "Sistem Perlindungan Modal (SL & TP)" : "Modal Protection System (SL & TP)"}</span>
                    </span>

                    {/* Pre-calculated R:R ratios helper */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setRecommendedRatio(2)}
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950 transition-all font-mono"
                      >
                        R:R 1:2
                      </button>
                      <button
                        onClick={() => setRecommendedRatio(3)}
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-slate-950 transition-all font-mono"
                      >
                        R:R 1:3
                      </button>
                    </div>
                  </div>

                  {/* SL adjustment row */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1 bg-slate-900/60 p-2 rounded-lg border border-slate-850">
                      <div className="flex items-center justify-between">
                        <label htmlFor="use-sl-checkbox" className="text-[10px] font-semibold text-slate-300 cursor-pointer">{t.slLabel}:</label>
                        <input
                          type="checkbox"
                          id="use-sl-checkbox"
                          checked={useSl}
                          onChange={(e) => setUseSl(e.target.checked)}
                          className="rounded accent-emerald-500 bg-slate-950 cursor-pointer w-4 h-4"
                          aria-label={t.slLabel}
                        />
                      </div>
                      
                      {useSl && (
                        <div className="space-y-1 pt-1.5 font-sans">
                          <label htmlFor="sl-pips-slider" className="flex items-center justify-between gap-1 cursor-pointer block w-full">
                            <span className="text-[9px] text-slate-405">{language === "ID" ? "Jarak SL:" : "SL Distance:"}</span>
                            <span className="text-[10px] font-bold font-mono text-slate-200">{slPips} pips</span>
                          </label>
                          <input
                            type="range"
                            id="sl-pips-slider"
                            min="5"
                            max={selectedInstrument.id === "bitcoin" ? "2000" : selectedInstrument.id === "gold" ? "200" : "150"}
                            value={slPips}
                            onChange={(e) => setSlPips(Number(e.target.value))}
                            className="w-full h-1 bg-slate-950 appearance-none cursor-ew-resize accent-rose-450"
                            aria-label={language === "ID" ? "Jarak SL" : "SL Distance"}
                          />
                        </div>
                      )}
                    </div>

                    {/* TP adjustment row */}
                    <div className="space-y-1 bg-slate-900/60 p-2 rounded-lg border border-slate-850">
                      <div className="flex items-center justify-between">
                        <label htmlFor="use-tp-checkbox" className="text-[10px] font-semibold text-slate-300 cursor-pointer">{t.tpLabel}:</label>
                        <input
                          type="checkbox"
                          id="use-tp-checkbox"
                          checked={useTp}
                          onChange={(e) => setUseTp(e.target.checked)}
                          className="rounded accent-emerald-500 bg-slate-950 cursor-pointer w-4 h-4"
                          aria-label={t.tpLabel}
                        />
                      </div>
                      
                      {useTp && (
                        <div className="space-y-1 pt-1.5 font-sans">
                          <label htmlFor="tp-pips-slider" className="flex items-center justify-between gap-1 cursor-pointer block w-full">
                            <span className="text-[9px] text-slate-405">{language === "ID" ? "Jarak TP:" : "TP Distance:"}</span>
                            <span className="text-[10px] font-bold font-mono text-slate-200">{tpPips} pips</span>
                          </label>
                          <input
                            type="range"
                            id="tp-pips-slider"
                            min="10"
                            max={selectedInstrument.id === "bitcoin" ? "5000" : selectedInstrument.id === "gold" ? "400" : "300"}
                            value={tpPips}
                            onChange={(e) => setTpPips(Number(e.target.value))}
                            className="w-full h-1 bg-slate-950 appearance-none cursor-ew-resize accent-emerald-400"
                            aria-label={language === "ID" ? "Jarak TP" : "TP Distance"}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Estimation summary stats */}
                  <div className="border-t border-slate-850 pt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 font-mono">
                    <div>{language === "ID" ? "Margin:" : "Margin:"} <span className="text-amber-400 font-bold">${requiredMargin.toFixed(2)}</span></div>
                    {useSl && expectedRiskDollars && (
                      <div>{t.estimatedRisk} <span className="text-rose-400 font-bold">-${expectedRiskDollars.toFixed(1)}</span></div>
                    )}
                    {useTp && expectedRewardDollars && (
                      <div>{t.estimatedReward} <span className="text-emerald-400 font-bold">+${expectedRewardDollars.toFixed(1)}</span></div>
                    )}
                    <div>R:R Ratio: <span className="text-cyan-400 font-bold font-semibold bg-cyan-950/40 px-1 py-0.2 rounded border border-cyan-500/10">{riskRewardRatio}</span></div>
                  </div>
                </div>

                {/* BUY / SELL Action Blocks */}
                <div className="grid grid-cols-2 gap-3.5 pt-1">
                  <button
                    onClick={() => handleOpenLocalPosition("BUY")}
                    className="bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-slate-950 font-black py-3 rounded-xl flex flex-col items-center justify-center shadow-lg transition-all border-b-4 border-emerald-700"
                  >
                    <span className="text-xs tracking-wider">{language === "ID" ? "Mulai BUY (Long)" : "Open BUY (Long)"}</span>
                    <span className="text-[9px] font-normal opacity-85 mt-0.5">{language === "ID" ? "Ekspektasi Pasar Naik" : "Expect Market Surge"}</span>
                  </button>

                  <button
                    onClick={() => handleOpenLocalPosition("SELL")}
                    className="bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-slate-950 font-black py-3 rounded-xl flex flex-col items-center justify-center shadow-lg transition-all border-b-4 border-rose-700"
                  >
                    <span className="text-xs tracking-wider">{language === "ID" ? "Mulai SELL (Short)" : "Open SELL (Short)"}</span>
                    <span className="text-[9px] font-normal opacity-85 mt-0.5">{language === "ID" ? "Ekspektasi Pasar Jatuh" : "Expect Market Fall"}</span>
                  </button>
                </div>

              </div>
            )}
          </div>
        )}

        {/* ================= TAB B: TRADE JOURNAL LOG DISPLAY ================= */}
        {activeTab === "history" && (
          <div className="flex-grow flex flex-col h-full bg-slate-950/40 border border-slate-850 rounded-xl overflow-hidden p-1.5 text-left">
            {tradeHistory.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <FileText className="w-10 h-10 mb-2 stroke-1 text-slate-700" />
                <p className="text-sm font-bold">{language === "ID" ? "Belum ada catatan" : "No recordings yet"}</p>
                <p className="text-xs mt-1 max-w-xs leading-normal">
                  {language === "ID" 
                    ? "Buka tab transaksi, belilah/jual aset, dan saksikan pertempuran di bagan grafik menyentuh SL atau TP!" 
                    : "Configure trade sizes on the action desk, buy/sell and witness active items hit boundaries!"}
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto max-h-[310px] space-y-2 pr-1 select-text">
                {tradeHistory.slice().reverse().map((log) => {
                  const isProfit = log.pnl >= 0;
                  return (
                    <div
                      key={log.id}
                      className="bg-slate-950 border border-slate-900 rounded-xl p-2.5 flex items-center justify-between text-xs transition-hover hover:border-slate-800"
                    >
                      <div className="space-y-1 text-left">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                            log.type === "BUY" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                          }`}>
                            {log.type}
                          </span>
                          <span className="font-bold text-slate-300 font-mono text-[10px]">{log.lotSize} lot</span>
                          <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                        </div>

                        <div className="text-[11px] text-slate-400 space-x-2 font-mono">
                          <span>In: <strong className="text-slate-300">{log.entryPrice}</strong></span>
                          <span>Out: <strong className="text-slate-300">{log.exitPrice}</strong></span>
                          <span>Hold: <strong className="text-slate-300">{log.exitIndex - log.entryIndex} bars</strong></span>
                        </div>
                      </div>

                      <div className="text-right space-y-1 flex flex-col items-end">
                        <span className={`font-mono font-bold text-xs ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>
                          {isProfit ? "+" : "-"}${Math.abs(log.pnl).toFixed(2)}
                        </span>
                        
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          log.exitReason === "TP_HIT" 
                            ? "bg-emerald-500/10 text-emerald-400" 
                            : log.exitReason === "SL_HIT"
                            ? "bg-rose-500/10 text-rose-400"
                            : "bg-slate-800 text-slate-400"
                        }`}>
                          {log.exitReason === "TP_HIT" 
                            ? "🟢 HIT TP" 
                            : log.exitReason === "SL_HIT"
                            ? "🛑 HIT SL" 
                            : (language === "ID" ? "Manual" : "Manual Closed")
                          }
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
