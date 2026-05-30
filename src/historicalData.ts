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

export function generateHistoricalCandles(instrumentId: string): Candlestick[] {
  const candles: Candlestick[] = [];
  let basePrice = 2000;
  let volatility = 0.02;
  let seed = 42;

  if (instrumentId === "gold") {
    basePrice = 2320.0;
    volatility = 4.5; // average move in dollars
    seed = 101;
  } else if (instrumentId === "bitcoin") {
    basePrice = 61500.0;
    volatility = 350.0;
    seed = 202;
  } else if (instrumentId === "eurusd") {
    basePrice = 1.0845;
    volatility = 0.0012;
    seed = 303;
  }

  const rand = createRandom(seed);
  let currentPrice = basePrice;

  // Let's model a realistic scenario with 150 candlesticks:
  // - First 40 bars: Sideways market forming strong Support and Resistance bounds
  // - Next 30 bars: A powerful breakout and uptrend
  // - Next 30 bars: Distribution and correction (retesting the breakout level)
  // - Final 50 bars: Continuous bounce or trend continuation
  
  for (let i = 0; i < 150; i++) {
    let trendMultiplier = 0;
    
    // Scenario mapping
    if (instrumentId === "gold") {
      // Gold: Double Bottom -> Uptrend -> Retest support -> Bounce
      if (i >= 0 && i < 30) {
        // Sideways / consolidation
        trendMultiplier = Math.sin(i / 3) * 0.4;
      } else if (i >= 30 && i < 65) {
        // Strong uptrend breakout
        trendMultiplier = 1.3 - (i - 65) * 0.01;
      } else if (i >= 65 && i < 95) {
        // Corrective drop
        trendMultiplier = -0.9;
      } else {
        // Dynamic bounce
        trendMultiplier = 0.8 + Math.sin(i / 10) * 0.3;
      }
    } else if (instrumentId === "bitcoin") {
      // Bitcoin: Accumulation -> Huge Breakout -> Sharp crash -> Sideways
      if (i >= 0 && i < 40) {
        trendMultiplier = -0.1 + Math.sin(i / 5) * 0.3;
      } else if (i >= 40 && i < 80) {
        trendMultiplier = 2.2;
      } else if (i >= 80 && i < 110) {
        trendMultiplier = -1.8;
      } else {
        trendMultiplier = 0.5;
      }
    } else {
      // EURUSD: Pure range bounce between bounds, excellent for S/R practice
      trendMultiplier = Math.sin(i / 8) * 0.9;
    }

    const open = currentPrice;
    const change = (rand() - 0.5) * volatility + (trendMultiplier * volatility * 0.5);
    const close = open + change;
    
    // Establish high and low with realistic tails
    const upwardWick = rand() * volatility * 0.6;
    const downwardWick = rand() * volatility * 0.6;
    const high = Math.max(open, close) + upwardWick;
    const low = Math.min(open, close) - downwardWick;

    // Simulate time string (staggered days)
    const date = new Date(2026, 0, 1);
    date.setDate(date.getDate() + i);
    const timeStr = date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short"
    });

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
