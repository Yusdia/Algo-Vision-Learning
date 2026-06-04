import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, RefreshCw, AlertCircle } from "lucide-react";
import { Position, TradeLog } from "../types";
import { Language, translations } from "../translations";

interface MentorAIProps {
  currentInstrument: { symbol: string; name: string };
  activePosition: Position | null;
  tradeHistory: TradeLog[];
  balance: number;
  language: Language;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const MentorAI: React.FC<MentorAIProps> = ({
  currentInstrument,
  activePosition,
  tradeHistory,
  balance,
  language
}) => {
  const t = translations[language];

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Synchronize initial message upon language toggle or start
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: t.mentorInitialMessage
      }
    ]);
  }, [language]);

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    setInputValue("");
    setErrorText(null);

    // Append user message
    const updatedMessages = [...messages, { role: "user", content: userText } as Message];
    setMessages(updatedMessages);
    setIsLoading(true);

    // Build context summary dynamically based on language
    let chartContext = "";
    if (language === "ID") {
      chartContext = `Pengguna berada pada instrumen ${currentInstrument.name} (${currentInstrument.symbol}). Saldo saat ini: $${balance.toFixed(2)}.`;
      if (activePosition) {
        chartContext += `\nAda posisi AKTIF terbuka saat ini:
- Tipe: ${activePosition.type}
- Angka Entry: ${activePosition.entryPrice}
- Lot: ${activePosition.lotSize} lot
- Stop Loss (SL): ${activePosition.slPrice || "Tidak dipasang"}
- Take Profit (TP): ${activePosition.tpPrice || "Tidak dipasang"}`;
      } else {
        chartContext += `\nTidak ada posisi aktif saat ini.`;
      }
      if (tradeHistory.length > 0) {
        const wins = tradeHistory.filter((t) => t.pnl > 0).length;
        const losses = tradeHistory.filter((t) => t.pnl <= 0).length;
        const totalPnl = tradeHistory.reduce((acc, t) => acc + t.pnl, 0);
        chartContext += `\nRiwayat backtesting ringkas:
- Total Transaksi Selesai: ${tradeHistory.length} kali
- Transaksi Profit (Win): ${wins} kali
- Transaksi Rugi (Loss): ${losses} kali
- Akumulasi Profit/Loss Historis: $${totalPnl.toFixed(2)}`;
      }
    } else {
      chartContext = `The user is examining ${currentInstrument.name} (${currentInstrument.symbol}). Running Balance: $${balance.toFixed(2)}.`;
      if (activePosition) {
        chartContext += `\nActive running position details:
- Operations Type: ${activePosition.type}
- Entry Rate: ${activePosition.entryPrice}
- Volume: ${activePosition.lotSize} lots
- Stop Loss (SL): ${activePosition.slPrice || "None set"}
- Take Profit (TP): ${activePosition.tpPrice || "None set"}`;
      } else {
        chartContext += `\nThere is no live position running currently.`;
      }
      if (tradeHistory.length > 0) {
        const wins = tradeHistory.filter((t) => t.pnl > 0).length;
        const losses = tradeHistory.filter((t) => t.pnl <= 0).length;
        const totalPnl = tradeHistory.reduce((acc, t) => acc + t.pnl, 0);
        chartContext += `\nPast Trade Journals Context:
- Completed Trades Count: ${tradeHistory.length} orders
- Prosperous Trades (Win): ${wins} times
- Defensive Trades (Loss): ${losses} times
- Total accumulated historical Profit/Loss: $${totalPnl.toFixed(2)}`;
      }
    }

    try {
      const response = await fetch("/api/mentor-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
          chartContext,
          language // Pass the preferred active user language!
        }),
      });

      if (!response.ok) {
        throw new Error(t.mentorConnectionError);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Append assistant message
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response || (language === "ID" ? "Minta maaf, saya kehilangan sinyal. Bisa diulangi?" : "Apologies, I lost the connection. Could you please repeat?") },
      ]);
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || (language === "ID" ? "Gagal menghubungi server Mentor." : "Failed to connect to the Mentor services."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        role: "assistant",
        content: t.mentorResetChat
      },
    ]);
    setErrorText(null);
  };

  return (
    <div className="flex flex-col h-[440px] md:h-[520px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      
      {/* Header Panel */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/30">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <div className="text-left">
            <h4 className="text-xs font-bold text-slate-100">{t.mentorHeader}</h4>
            <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              <span>{t.mentorStatus}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          title={language === "ID" ? "Reset Percakapan" : "Reset Chat"}
          aria-label={language === "ID" ? "Reset Percakapan" : "Reset Chat"}
          className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 p-1.5 rounded-lg transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
        {messages.map((msg, index) => {
          const isAI = msg.role === "assistant";
          return (
            <div
              key={index}
              className={`flex gap-3 max-w-[88%] ${isAI ? "self-start" : "self-end ml-auto flex-row-reverse"}`}
            >
              <div className={`p-1.5 rounded-xl h-fit flex-shrink-0 ${
                isAI ? "bg-emerald-950/40 border border-emerald-500/20 text-emerald-400" : "bg-blue-950/40 border border-blue-500/20 text-blue-400"
              }`}>
                {isAI ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div className={`flex flex-col gap-1 rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                isAI
                  ? "bg-slate-950 border border-slate-800/80 text-slate-200 rounded-tl-sm text-left"
                  : "bg-emerald-600 text-slate-950 font-medium rounded-tr-sm text-left"
              }`}>
                {/* Parse Markdown representation simply */}
                {msg.content.split("\n\n").map((para, pIdx) => {
                  return (
                    <p key={pIdx} className="mb-2 last:mb-0 text-left" dangerouslySetInnerHTML={{
                      __html: para
                        // bold syntax
                        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                        // bullet list simple formatting
                        .replace(/^-\s(.*)/gm, "<li class='list-disc pl-4 mt-1'>$1</li>")
                    }} />
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex gap-3 max-w-[85%] self-start">
            <div className="bg-emerald-950/40 border border-emerald-500/20 p-1.5 rounded-xl text-emerald-400 h-fit">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-950 border border-slate-800/80 rounded-2xl rounded-tl-sm px-4 py-3 text-xs text-slate-400 flex items-center gap-1.5 font-mono">
              <span className="animate-pulse">{t.mentorResponseLoading}</span>
              <span className="flex gap-1">
                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" />
              </span>
            </div>
          </div>
        )}

        {/* Errors Block */}
        {errorText && (
          <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
            <div className="text-left">
              <p className="font-semibold">{language === "ID" ? "Sambungan Bermasalah" : "Connection Issue"}</p>
              <p className="text-[11px] opacity-90">{errorText}</p>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Input Form Stage */}
      <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t.mentorPromptPlaceholder}
          disabled={isLoading}
          id="mentor-chat-input"
          aria-label={t.mentorPromptPlaceholder}
          className="flex-1 bg-slate-900 border border-slate-800 text-xs text-slate-100 rounded-xl px-3.5 py-2 placeholder:text-slate-500 outline-none focus:border-emerald-500 transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          id="mentor-chat-submit-btn"
          aria-label={language === "ID" ? "Kirim pesan ke Mentor AI" : "Send message to Mentor AI"}
          className={`p-2 rounded-xl transition-all ${
            inputValue.trim() && !isLoading
              ? "bg-emerald-500 text-slate-950 hover:scale-105 active:scale-95 cursor-pointer"
              : "bg-slate-800 text-slate-500 cursor-not-allowed"
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
