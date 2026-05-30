import React, { useState, useRef, useEffect } from "react";
import { Candlestick, Position, TradeLog } from "../types";

interface TradingCanvasProps {
  visibleCandles: Candlestick[];
  allCandles: Candlestick[];          // All candles generated so far up to current index
  activePosition: Position | null;
  tradeHistory: TradeLog[];
  showShortMa: boolean;
  showLongMa: boolean;
  showBb: boolean;
  showSr: boolean;                    // Enable intuitive S&R visual learning lanes
  pipDecimal: number;
  symbol: string;
}

export const TradingCanvas: React.FC<TradingCanvasProps> = ({
  visibleCandles,
  allCandles,
  activePosition,
  tradeHistory,
  showShortMa,
  showLongMa,
  showBb,
  showSr,
  pipDecimal,
  symbol
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 380 });
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [mouseCoord, setMouseCoord] = useState<{ x: number; y: number } | null>(null);

  // Resize handler
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({
          width: Math.max(width, 300),
          height: Math.max(height, 280) // accommodate RSI panel as well
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  if (visibleCandles.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-slate-950 border border-slate-800 text-slate-500 rounded-xl">
        Belum ada data grafik historis untuk ditampilkan.
      </div>
    );
  }

  // Margin spacing inside the main SVG area
  const margin = { top: 30, right: 70, bottom: 40, left: 15 };
  const graphWidth = dimensions.width - margin.left - margin.right;
  const graphHeight = dimensions.height - margin.top - margin.bottom;

  // Split view heights: 75% Candlestick, 25% RSI panel
  const chartHeightPart = graphHeight * 0.72;
  const rsiHeightPart = graphHeight * 0.22;
  const rsiTop = margin.top + chartHeightPart + 15;

  // Find price bounds of current visible window for proper mathematical scaling
  let maxPrice = -Infinity;
  let minPrice = Infinity;

  visibleCandles.forEach((c) => {
    maxPrice = Math.max(maxPrice, c.high);
    minPrice = Math.min(minPrice, c.low);

    if (showBb) {
      if (c.bbUpper) maxPrice = Math.max(maxPrice, c.bbUpper);
      if (c.bbLower) minPrice = Math.min(minPrice, c.bbLower);
    }
  });

  // Add 10% buffer top and bottom to make the candles float elegantly
  const priceBuffer = (maxPrice - minPrice) * 0.1 || 1.0;
  maxPrice += priceBuffer;
  minPrice -= priceBuffer;

  // Coordinate projection helper functions
  const getX = (indexInWindow: number) => {
    if (visibleCandles.length <= 1) return margin.left + graphWidth / 2;
    return margin.left + (indexInWindow / (visibleCandles.length - 1)) * graphWidth;
  };

  const getY = (price: number) => {
    return margin.top + (1 - (price - minPrice) / (maxPrice - minPrice)) * chartHeightPart;
  };

  const getRsiY = (rsiVal: number) => {
    return rsiTop + (1 - rsiVal / 100) * rsiHeightPart;
  };

  // Identify local support and resistance levels autonomously for educational display
  // We scan across the immediate 40 candles to find regional valleys and peaks
  const findSrLines = () => {
    const list: { price: number; type: "S" | "R"; label: string }[] = [];
    if (visibleCandles.length < 5) return list;

    // Scan window
    const len = visibleCandles.length;
    for (let i = 2; i < len - 2; i++) {
      const c = visibleCandles[i];
      // Peak detection (Resistance)
      if (c.high > visibleCandles[i-1].high && c.high > visibleCandles[i-2].high &&
          c.high > visibleCandles[i+1].high && c.high > visibleCandles[i+2].high) {
        list.push({ price: c.high, type: "R", label: "Resistance" });
      }
      // Trough detection (Support)
      if (c.low < visibleCandles[i-1].low && c.low < visibleCandles[i-2].low &&
          c.low < visibleCandles[i+1].low && c.low < visibleCandles[i+2].low) {
        list.push({ price: c.low, type: "S", label: "Support" });
      }
    }

    // De-duplicate S/R lines that are extremely close
    const merged: typeof list = [];
    const threshold = (maxPrice - minPrice) * 0.04;

    list.forEach((item) => {
      const existing = merged.find((m) => Math.abs(m.price - item.price) < threshold && m.type === item.type);
      if (!existing) {
        merged.push(item);
      }
    });

    return merged.slice(0, 4); // Limit to top 4 lines in screen to avoid clutter
  };

  const srLevels = findSrLines();

  // Handle Mouse Events for Hover / Crosshair tooltip
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMouseCoord({ x, y });

    // Invert X coordinate to find closest candle index
    const graphX = x - margin.left;
    const pct = Math.min(Math.max(graphX / graphWidth, 0), 1);
    const floatIndex = pct * (visibleCandles.length - 1);
    const closestIndex = Math.round(floatIndex);

    if (closestIndex >= 0 && closestIndex < visibleCandles.length) {
      setHoverIndex(closestIndex);
    } else {
      setHoverIndex(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    setMouseCoord(null);
  };

  // Determine active dynamic price from currently held hover index or last candle
  const hoveredCandle = hoverIndex !== null ? visibleCandles[hoverIndex] : visibleCandles[visibleCandles.length - 1];

  // Helper values to draw indicators smoothly using SVG Polyline patterns
  const buildLinePoints = (field: "maShort" | "maLong" | "bbUpper" | "bbLower" | "rsi") => {
    return visibleCandles
      .map((c, i) => {
        const val = c[field];
        if (val === undefined) return null;
        const cx = getX(i);
        const cy = field === "rsi" ? getRsiY(val) : getY(val);
        return `${cx},${cy}`;
      })
      .filter((pts) => pts !== null)
      .join(" ");
  };

  // Helper to draw candle bodies
  const candleWidth = Math.max(3, Math.min(25, (graphWidth / visibleCandles.length) * 0.7));

  return (
    <div className="flex flex-col w-full h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-2 select-none shadow-2xl relative" ref={containerRef}>
      
      {/* Dynamic OHLV Panel in Toolbar Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1 bg-slate-950 rounded-lg text-[11px] font-mono border border-slate-800/80 mb-2">
        <div className="flex items-center gap-1.5 ">
          <span className="text-emerald-500 font-bold">{symbol}</span>
          <span className="text-slate-400">Idx: {hoveredCandle.index}</span>
          <span className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-semibold">{hoveredCandle.time}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-slate-400">O: <span className="text-slate-200">{hoveredCandle.open.toFixed(pipDecimal)}</span></span>
          <span className="text-slate-400">H: <span className="text-emerald-400">{hoveredCandle.high.toFixed(pipDecimal)}</span></span>
          <span className="text-slate-400">L: <span className="text-rose-400">{hoveredCandle.low.toFixed(pipDecimal)}</span></span>
          <span className="text-slate-400">C: <span className={`${hoveredCandle.close >= hoveredCandle.open ? "text-emerald-400" : "text-rose-400"}`}>{hoveredCandle.close.toFixed(pipDecimal)}</span></span>
          <span className="text-slate-400">Vol: <span className="text-sky-300">{hoveredCandle.volume}</span></span>
          {showShortMa && hoveredCandle.maShort && (
            <span className="text-yellow-400">MA(7): <span>{hoveredCandle.maShort.toFixed(pipDecimal)}</span></span>
          )}
          {showLongMa && hoveredCandle.maLong && (
            <span className="text-violet-400">MA(20): <span>{hoveredCandle.maLong.toFixed(pipDecimal)}</span></span>
          )}
          {hoveredCandle.rsi && (
            <span className={hoveredCandle.rsi >= 70 ? "text-orange-400 font-bold" : hoveredCandle.rsi <= 30 ? "text-cyan-400 font-bold" : "text-slate-400"}>
              RSI(14): <span>{hoveredCandle.rsi.toFixed(1)}</span>
            </span>
          )}
        </div>
      </div>

      {/* Main SVG Plot Stage */}
      <svg
        width="100%"
        height={dimensions.height - 40}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="cursor-crosshair overflow-visible bg-slate-950 rounded-lg border border-slate-900"
      >
        <defs>
          <clipPath id="chart-area">
            <rect x={margin.left} y={margin.top} width={graphWidth} height={chartHeightPart} />
          </clipPath>
          <clipPath id="rsi-area">
            <rect x={margin.left} y={rsiTop} width={graphWidth} height={rsiHeightPart} />
          </clipPath>
          {/* Gradients */}
          <linearGradient id="bull-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bear-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* ================= BACKGROUND GRID LINES (Candlestick portion) ================= */}
        <g stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3">
          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
            const price = minPrice + p * (maxPrice - minPrice);
            const y = getY(price);
            return <line key={i} x1={margin.left} y1={y} x2={margin.left + graphWidth} y2={y} />;
          })}
          
          {/* Vertical grid lines (every 5 candles) */}
          {visibleCandles.map((c, i) => {
            if (i % 6 !== 0) return null;
            const x = getX(i);
            return <line key={i} x1={x} y1={margin.top} x2={x} y2={margin.top + chartHeightPart} />;
          })}
        </g>

        {/* Price scale axis labels (Right side) */}
        <g fill="#64748b" fontSize="9" fontFamily="monospace">
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
            const price = minPrice + p * (maxPrice - minPrice);
            const y = getY(price);
            return (
              <text key={i} x={margin.left + graphWidth + 6} y={y + 3} textAnchor="start">
                {price.toFixed(pipDecimal)}
              </text>
            );
          })}
        </g>

        {/* Absolute Candle Dates (Bottom of candlestick portion) */}
        <g fill="#64748b" fontSize="8" textAnchor="middle" fontFamily="monospace">
          {visibleCandles.map((c, i) => {
            if (i % 8 !== 0) return null;
            const x = getX(i);
            return (
              <text key={i} x={x} y={margin.top + chartHeightPart + 12}>
                {c.time}
              </text>
            );
          })}
        </g>

        {/* ================= TECHNICAL INDICATORS PLOT ================= */}
        {/* Bollinger Bands Shaded Area */}
        {showBb && (
          <g clipPath="url(#chart-area)">
            {/* Draw BB bands upper & lower as separate lines and fill in between */}
            <path
              d={visibleCandles.reduce((acc, c, i) => {
                if (c.bbUpper === undefined || c.bbLower === undefined) return acc;
                const cx = getX(i);
                const cyUpper = getY(c.bbUpper);
                const cyLower = getY(c.bbLower);
                if (i === 0) {
                  return `M ${cx} ${cyUpper}`;
                }
                // Draw upper, then loop lower in reverse (standard SVG polygon shape loop)
                return `${acc} L ${cx} ${cyUpper}`;
              }, "") + visibleCandles.slice().reverse().reduce((acc, c, i) => {
                const actualIndex = visibleCandles.length - 1 - i;
                if (c.bbLower === undefined) return acc;
                const cx = getX(actualIndex);
                const cyLower = getY(c.bbLower);
                return `${acc} L ${cx} ${cyLower}`;
              }, "") + " Z"}
              fill="#c084fc"
              fillOpacity="0.04"
              stroke="#8b5cf6"
              strokeWidth="0.5"
              strokeDasharray="2 2"
            />
          </g>
        )}

        {/* Long Moving Average (20) */}
        {showLongMa && (
          <polyline
            fill="none"
            stroke="#a78bfa"
            strokeWidth="1.5"
            points={buildLinePoints("maLong")}
            clipPath="url(#chart-area)"
          />
        )}

        {/* Short Moving Average (7) */}
        {showShortMa && (
          <polyline
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1.5"
            points={buildLinePoints("maShort")}
            clipPath="url(#chart-area)"
          />
        )}

        {/* ================= TUTOR S&R CHANNELS ================= */}
        {showSr && srLevels.map((sr, idx) => {
          const sy = getY(sr.price);
          const color = sr.type === "S" ? "#10b981" : "#f43f5e";
          return (
            <g key={idx} clipPath="url(#chart-area)" opacity="0.65">
              <line
                x1={margin.left}
                y1={sy}
                x2={margin.left + graphWidth}
                y2={sy}
                stroke={color}
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <rect
                x={margin.left + 5}
                y={sy - 15}
                width={85}
                height={13}
                fill={sr.type === "S" ? "rgba(16,185,129,0.15)" : "rgba(244,63,94,0.15)"}
                rx="3"
              />
              <text
                x={margin.left + 8}
                y={sy - 5}
                fill={color}
                fontSize="8"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {sr.type === "S" ? "🔑 Support Floor" : "🧱 Resistance Ceiling"}
              </text>
            </g>
          );
        })}

        {/* ================= CANDLESTICKS PLOT ================= */}
        <g clipPath="url(#chart-area)">
          {visibleCandles.map((c, i) => {
            const cx = getX(i);
            const cyOpen = getY(c.open);
            const cyClose = getY(c.close);
            const cyHigh = getY(c.high);
            const cyLow = getY(c.low);
            const isBullish = c.close >= c.open;
            const candleColor = isBullish ? "#10b981" : "#f43f5e";

            return (
              <g key={c.index}>
                {/* Wick shadow */}
                <line x1={cx} y1={cyHigh} x2={cx} y2={cyLow} stroke={candleColor} strokeWidth="1.2" />
                {/* Candle body */}
                <rect
                  x={cx - candleWidth / 2}
                  y={Math.min(cyOpen, cyClose)}
                  width={candleWidth}
                  height={Math.max(1, Math.abs(cyOpen - cyClose))}
                  fill={candleColor}
                  rx="1"
                />
              </g>
            );
          })}
        </g>

        {/* ================= HISTORICAL ORDER MARKERS ================= */}
        <g clipPath="url(#chart-area)">
          {tradeHistory.map((trade) => {
            // Find if this trade's entry index or exit index is in current visible window
            const visEntryIdx = visibleCandles.findIndex((c) => c.index === trade.entryIndex);
            const visExitIdx = visibleCandles.findIndex((c) => c.index === trade.exitIndex);

            return (
              <g key={trade.id}>
                {/* Entry marker */}
                {visEntryIdx !== -1 && (
                  <g transform={`translate(${getX(visEntryIdx)}, ${getY(trade.entryPrice)})`}>
                    <circle r="6" fill={trade.type === "BUY" ? "#3b82f6" : "#f59e0b"} stroke="#ffffff" strokeWidth="1" />
                    <text x="0" y="-10" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                      {trade.type === "BUY" ? "BUY" : "SELL"}
                    </text>
                  </g>
                )}
                {/* Exit marker */}
                {visExitIdx !== -1 && (
                  <g transform={`translate(${getX(visExitIdx)}, ${getY(trade.exitPrice)})`}>
                    <polygon
                      points="0,-6 6,4 -6,4"
                      fill={trade.pnl >= 0 ? "#10b981" : "#f43f5e"}
                      stroke="#ffffff"
                      strokeWidth="1"
                      transform={trade.pnl >= 0 ? "rotate(0)" : "rotate(180)"}
                    />
                    <text x="0" y="14" textAnchor="middle" fill={trade.pnl >= 0 ? "#10b981" : "#f43f5e"} fontSize="8" fontWeight="bold">
                      {trade.pnl >= 0 ? `+$${trade.pnl.toFixed(2)}` : `-$${Math.abs(trade.pnl).toFixed(2)}`}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* ================= ACTIVE SIMULATION TRADING LINES (Stop Loss / Take Profit) ================= */}
        {activePosition && (
          <g clipPath="url(#chart-area)">
            {/* Visual indicators for Entry, Profit Area / Loss Area lanes */}
            {(() => {
              const entryY = getY(activePosition.entryPrice);
              const slY = activePosition.slPrice ? getY(activePosition.slPrice) : null;
              const tpY = activePosition.tpPrice ? getY(activePosition.tpPrice) : null;
              const curCandle = visibleCandles[visibleCandles.length - 1];
              const curY = getY(curCandle.close);

              return (
                <g>
                  {/* Profit shaded channel */}
                  {tpY !== null && (
                    <rect
                      x={margin.left}
                      y={activePosition.type === "BUY" ? Math.min(entryY, tpY) : Math.min(entryY, entryY)}
                      width={graphWidth}
                      height={Math.abs(entryY - tpY)}
                      fill="#10b981"
                      fillOpacity="0.05"
                    />
                  )}

                  {/* Loss shaded channel */}
                  {slY !== null && (
                    <rect
                      x={margin.left}
                      y={activePosition.type === "BUY" ? Math.min(entryY, slY) : Math.min(entryY, entryY)}
                      width={graphWidth}
                      height={Math.abs(entryY - slY)}
                      fill="#f43f5e"
                      fillOpacity="0.05"
                    />
                  )}

                  {/* Entry Price Dash representation */}
                  <line
                    x1={margin.left}
                    y1={entryY}
                    x2={margin.left + graphWidth}
                    y2={entryY}
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />
                  <rect x={margin.left + graphWidth - 65} y={entryY - 8} width={63} height={14} fill="#3b82f6" rx="2" />
                  <text x={margin.left + graphWidth - 60} y={entryY + 2} fill="#ffffff" fontSize="8" fontFamily="monospace" fontWeight="bold">
                    ENT: {activePosition.entryPrice.toFixed(pipDecimal)}
                  </text>

                  {/* Take profit line */}
                  {tpY !== null && activePosition.tpPrice && (
                    <g>
                      <line
                        x1={margin.left}
                        y1={tpY}
                        x2={margin.left + graphWidth}
                        y2={tpY}
                        stroke="#10b981"
                        strokeWidth="1.2"
                      />
                      <rect x={margin.left + 5} y={tpY - 8} width={80} height={14} fill="#10b981" rx="2" />
                      <text x={margin.left + 8} y={tpY + 2} fill="#ffffff" fontSize="8" fontFamily="monospace" fontWeight="bold">
                        🟢 TP: {activePosition.tpPrice.toFixed(pipDecimal)}
                      </text>
                    </g>
                  )}

                  {/* Stop loss line */}
                  {slY !== null && activePosition.slPrice && (
                    <g>
                      <line
                        x1={margin.left}
                        y1={slY}
                        x2={margin.left + graphWidth}
                        y2={slY}
                        stroke="#f43f5e"
                        strokeWidth="1.2"
                      />
                      <rect x={margin.left + 5} y={slY - 8} width={80} height={14} fill="#f43f5e" rx="2" />
                      <text x={margin.left + 8} y={slY + 2} fill="#ffffff" fontSize="8" fontFamily="monospace" fontWeight="bold">
                        🛑 SL: {activePosition.slPrice.toFixed(pipDecimal)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })()}
          </g>
        )}

        {/* ================= RSI OSCILLATOR PANEL (Secondary bottom plot) ================= */}
        <g clipPath="url(#rsi-area)">
          {/* Secondary background box */}
          <rect x={margin.left} y={rsiTop} width={graphWidth} height={rsiHeightPart} fill="#020617" opacity="0.8" />
          
          {/* RSI Reference borders (Overbought 70, Neutral 50, Oversold 30) */}
          <line x1={margin.left} y1={getRsiY(70)} x2={margin.left + graphWidth} y2={getRsiY(70)} stroke="#f97316" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.6"/>
          <text x={margin.left + 5} y={getRsiY(70) - 3} fill="#f97316" fontSize="7" opacity="0.7">70% OVERBOUGHT</text>
          
          <line x1={margin.left} y1={getRsiY(50)} x2={margin.left + graphWidth} y2={getRsiY(50)} stroke="#334155" strokeWidth="0.5" />
          
          <line x1={margin.left} y1={getRsiY(30)} x2={margin.left + graphWidth} y2={getRsiY(30)} stroke="#06b6d4" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.6" />
          <text x={margin.left + 5} y={getRsiY(30) + 9} fill="#06b6d4" fontSize="7" opacity="0.7">30% OVERSOLD</text>

          {/* RSI value text markings */}
          <text x={margin.left + graphWidth + 6} y={getRsiY(70) + 3} fill="#64748b" fontSize="8" fontFamily="monospace">70</text>
          <text x={margin.left + graphWidth + 6} y={getRsiY(30) + 3} fill="#64748b" fontSize="8" fontFamily="monospace">30</text>

          {/* RSI dynamic calculated polyline */}
          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="1"
            points={buildLinePoints("rsi")}
          />
        </g>

        {/* ================= INTERACTIVE HOVER CROSSHAIR ================= */}
        {mouseCoord && mouseCoord.x >= margin.left && mouseCoord.x <= margin.left + graphWidth && (
          <g>
            {/* Vertical crosshair line */}
            <line
              x1={mouseCoord.x}
              y1={margin.top}
              x2={mouseCoord.x}
              y2={margin.top + chartHeightPart}
              stroke="#64748b"
              strokeWidth="0.5"
              strokeDasharray="2 2"
            />
            {/* Horizontal crosshair line (only on candlestick portion) */}
            {mouseCoord.y >= margin.top && mouseCoord.y <= margin.top + chartHeightPart && (
              <line
                x1={margin.left}
                y1={mouseCoord.y}
                x2={margin.left + graphWidth}
                y2={mouseCoord.y}
                stroke="#64748b"
                strokeWidth="0.5"
                strokeDasharray="2 2"
              />
            )}
          </g>
        )}
      </svg>
    </div>
  );
};
