import { Candlestick, Instrument } from "./types";

export const availableInstruments: Instrument[] = [
  {
    id: "gold",
    name: "Emas (Gold)",
    symbol: "XAU/USD",
    description: "Sangat direkomendasikan untuk belajar Support & Resistance harian.",
    pipSize: 0.1,
    pipDecimal: 1,
    contractSize: 100, // 1 Standard Lot = 100 oz of gold
    initialPrice: 2320.0
  },
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC/USD",
    description: "Volatilitas sangat tinggi, cocok melatih kekuatan psikologis trading.",
    pipSize: 1.0,
    pipDecimal: 0,
    contractSize: 1, // 1 Standard Lot = 1 BTC
    initialPrice: 62500.0
  },
  {
    id: "eurusd",
    name: "Euro vs US Dollar",
    symbol: "EUR/USD",
    description: "Pergerakan tenang dan presisi, istimewa untuk mengasah taktik momentum.",
    pipSize: 0.0001,
    pipDecimal: 4,
    contractSize: 100000, // 1 Standard Lot = 100,000 EUR
    initialPrice: 1.0850
  }
];

// Seeded pseudo-random generator to guarantee identical realistic charts
function createRandom(seed: number) {
  let s = seed;
  return function () {
    const x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
  };
}

export function generateHistoricalCandles(
  instrumentId: string,
  daysCount: number = 365,
  timeframe: "1D" | "4H" | "1H" = "1D"
): Candlestick[] {
  const candles: Candlestick[] = [];
  let basePrice = 2000;
  let rawVolatility = 0.02;
  let seed = 42;

  if (instrumentId === "gold") {
    basePrice = 2320.0;
    rawVolatility = 4.5; // average move in dollars
    seed = 101;
  } else if (instrumentId === "bitcoin") {
    basePrice = 61500.0;
    rawVolatility = 350.0;
    seed = 202;
  } else if (instrumentId === "eurusd") {
    basePrice = 1.0845;
    rawVolatility = 0.0012;
    seed = 303;
  }

  // Timeframe specific subdivisions
  let stepsPerDay = 1;
  let volatilityScale = 1.0;

  if (timeframe === "4H") {
    stepsPerDay = 6;
    volatilityScale = 1.0 / Math.sqrt(6); // scale volatility proportionately to time square root
  } else if (timeframe === "1H") {
    stepsPerDay = 24;
    volatilityScale = 1.0 / Math.sqrt(24);
  }

  const totalCandles = daysCount * stepsPerDay;
  const rand = createRandom(seed);
  let currentPrice = basePrice;
  const volatility = rawVolatility * volatilityScale;

  // We model a realistic 1-year scenario (totalCandles bars):
  // - First 25%: Sideways market forming strong Support & Resistance bounds
  // - Next 25%: Powerful breakout rally and solid uptrend
  // - Next 20%: Corrective drop / distribution retesting support levels
  // - Final 30%: Dynamic trend continuation or recovery bounce
  
  for (let i = 0; i < totalCandles; i++) {
    let trendMultiplier = 0;
    const progress = i / totalCandles;
    
    // Scenario mapping scaled to the selected dataset length and timesteps
    if (instrumentId === "gold") {
      // Gold: Double Bottom -> Uptrend -> Retest support -> Bounce
      if (progress < 0.20) {
        // Sideways / consolidation
        trendMultiplier = Math.sin(i / (3.5 * stepsPerDay)) * 0.45;
      } else if (progress >= 0.20 && progress < 0.45) {
        // Strong uptrend breakout
        trendMultiplier = 1.3 - (progress - 0.45) * 0.04;
      } else if (progress >= 0.45 && progress < 0.68) {
        // Corrective drop (retest)
        trendMultiplier = -0.95;
      } else {
        // Dynamic bounce
        trendMultiplier = 0.85 + Math.sin(i / (15 * stepsPerDay)) * 0.35;
      }
    } else if (instrumentId === "bitcoin") {
      // Bitcoin: Accumulation -> Huge Breakout -> Sharp crash -> Sideways
      if (progress < 0.25) {
        trendMultiplier = -0.1 + Math.sin(i / (6 * stepsPerDay)) * 0.35;
      } else if (progress >= 0.25 && progress < 0.55) {
        trendMultiplier = 2.1;
      } else if (progress >= 0.55 && progress < 0.75) {
        trendMultiplier = -1.9;
      } else {
        trendMultiplier = 0.6;
      }
    } else {
      // EURUSD: Range bounce between bounds, exceptional for S&R practice
      trendMultiplier = Math.sin(i / (12 * stepsPerDay)) * 0.95;
    }

    const open = currentPrice;
    const change = (rand() - 0.5) * volatility + (trendMultiplier * volatility * 0.5);
    const close = open + change;
    
    // Establish high and low with realistic tails
    const upwardWick = rand() * volatility * 0.55;
    const downwardWick = rand() * volatility * 0.55;
    const high = Math.max(open, close) + upwardWick;
    const low = Math.min(open, close) - downwardWick;

    // Simulate time string (starting Jan 1, 2025 up to Dec 31, 2025 for a 365-day year)
    const date = new Date(2025, 0, 1);
    if (timeframe === "4H") {
      date.setHours(date.getHours() + i * 4);
    } else if (timeframe === "1H") {
      date.setHours(date.getHours() + i * 1);
    } else {
      date.setDate(date.getDate() + i);
    }

    let timeStr = "";
    if (timeframe === "4H" || timeframe === "1H") {
      const dayStr = date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short"
      });
      const hourStr = date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
      timeStr = `${dayStr}, ${hourStr}`;
    } else {
      timeStr = date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    }

    candles.push({
      index: i,
      time: timeStr,
      open: Number(open.toFixed(instrumentId === "eurusd" ? 4 : 2)),
      high: Number(high.toFixed(instrumentId === "eurusd" ? 4 : 2)),
      low: Number(low.toFixed(instrumentId === "eurusd" ? 4 : 2)),
      close: Number(close.toFixed(instrumentId === "eurusd" ? 4 : 2)),
      volume: Math.floor(rand() * 1000 + 500)
    });

    currentPrice = close;
  }

  return candles;
}

// Calculate technical indicators (SMA 20, Bollinger Bands, RSI) dynamically on sliced historical candle array
export function calculateIndicators(candles: Candlestick[]): Candlestick[] {
  const result = [...candles];
  const maPeriod = 20;
  const shortMaPeriod = 7;
  const rsiPeriod = 14;

  for (let i = 0; i < result.length; i++) {
    // 1. Long Moving Average (20)
    if (i >= maPeriod - 1) {
      let sum = 0;
      for (let j = i - maPeriod + 1; j <= i; j++) {
        sum += result[j].close;
      }
      const maValue = sum / maPeriod;
      result[i].maLong = Number(maValue.toFixed(4));

      // Bollinger Bands (2 Std Dev from 20 MA)
      let varianceSum = 0;
      for (let j = i - maPeriod + 1; j <= i; j++) {
        varianceSum += Math.pow(result[j].close - maValue, 2);
      }
      const stdDev = Math.sqrt(varianceSum / maPeriod);
      result[i].bbUpper = Number((maValue + 2 * stdDev).toFixed(4));
      result[i].bbLower = Number((maValue - 2 * stdDev).toFixed(4));
    }

    // 2. Short Moving Average (7)
    if (i >= shortMaPeriod - 1) {
      let sum = 0;
      for (let j = i - shortMaPeriod + 1; j <= i; j++) {
        sum += result[j].close;
      }
      result[i].maShort = Number((sum / shortMaPeriod).toFixed(4));
    }

    // 3. RSI 14 (Wilder's calculation)
    if (i >= rsiPeriod) {
      let gains = 0;
      let losses = 0;

      for (let j = i - rsiPeriod + 1; j <= i; j++) {
        const difference = result[j].close - result[j - 1].close;
        if (difference > 0) {
          gains += difference;
        } else {
          losses -= difference;
        }
      }

      let avgGain = gains / rsiPeriod;
      let avgLoss = losses / rsiPeriod;

      if (avgLoss === 0) {
        result[i].rsi = 100;
      } else {
        const rs = avgGain / avgLoss;
        result[i].rsi = Number((100 - 100 / (1 + rs)).toFixed(1));
      }
    } else {
      result[i].rsi = 50; // default baseline neutral
    }
  }

  return result;
}
