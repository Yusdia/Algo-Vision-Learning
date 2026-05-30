export interface Candlestick {
  index: number;
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  // Indicators calculated dynamically or statically
  maLong?: number;  // e.g. 20 MA
  maShort?: number; // e.g. 7 MA
  bbUpper?: number; // Bollinger Upper
  bbLower?: number; // Bollinger Lower
  rsi?: number;     // RSI indicator
}

export type TradeType = "BUY" | "SELL";

export interface Position {
  id: string;
  type: TradeType;
  entryIndex: number;
  entryPrice: number;
  lotSize: number;
  leverage: number;
  slPrice: number | null;
  tpPrice: number | null;
  margin: number;
}

export interface TradeLog {
  id: string;
  type: TradeType;
  entryPrice: number;
  exitPrice: number;
  entryIndex: number;
  exitIndex: number;
  lotSize: number;
  leverage: number;
  pnl: number;
  exitReason: "TP_HIT" | "SL_HIT" | "MANUAL_CLOSE" | "SESSION_RESTART";
  timestamp: string;
}

export interface Instrument {
  id: string;
  name: string;
  symbol: string;
  description: string;
  pipSize: number; // e.g. 0.01 for gold or 0.0001 for forex
  pipDecimal: number;
  contractSize: number; // Multiplier, e.g., 100 for gold, 100000 for standard forex lot
  initialPrice: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string; // Markdown supported content
  quiz: QuizQuestion[];
}

export interface Module {
  id: string;
  title: string;
  icon: string;
  description: string;
  lessons: Lesson[];
}

export interface AccountState {
  balance: number;
  equity: number;
  marginUsed: number;
  freeMargin: number;
  unrealizedPnL: number;
}
