import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load configuration
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON requests
app.use(express.json());

// Initialize GoogleGenAI client (Server-side ONLY)
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("GoogleGenAI initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize GoogleGenAI client:", err);
  }
} else {
  console.warn("GEMINI_API_KEY is not defined. AI Mentor functionality will fall back to offline mode.");
}

// Define API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", aiEnabled: !!ai });
});

app.post("/api/mentor-chat", async (req, res) => {
  const { messages, chartContext } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Format request tidak valid. 'messages' harus berupa array." });
  }

  // Fallback if AI or API key is not available
  if (!ai) {
    const lastUserMsg = messages[messages.length - 1]?.content || "";
    let offlineReply = "Halo! Saya Mentor Trading Anda. Saat ini koneksi API ke server Gemini belum dikonfigurasi (kunci API belum diset di Secrets). Namun saya punya tips dasar: Selalu gunakan Stop Loss (SL) setia posisi Anda, batasi resiko maksimal 1-2% dari modal per trade, dan lakukan analisa tren di timeframe besar sebelum memutuskan open posisi!";
    
    if (lastUserMsg.toLowerCase().includes("candle") || lastUserMsg.toLowerCase().includes("lilin")) {
      offlineReply = "Tentang Candlestick: Candlestick hijau (bullish) tandanya harga naik, sedangkan lilin merah (bearish) menandakan penjual memegang kendali. Perhatikan sumbu bawah yang panjang: itu adalah tanda penolakan (rejection) harga rendah, sering kali merupakan awal kenaikan harga!";
    } else if (lastUserMsg.toLowerCase().includes("indikator") || lastUserMsg.toLowerCase().includes("rsi")) {
      offlineReply = "Tentang Indikator: Moving Average membantu Anda melihat ke arah mana tren berjalan. Sedangkan RSI membantu menunjuk kejenuhan harga. Jika RSI di atas 70, waspadai pasar jenuh beli (overbought) dan bersiap tren berbalik turun!";
    } else if (lastUserMsg.toLowerCase().includes("sl") || lastUserMsg.toLowerCase().includes("tp")) {
      offlineReply = "Tentang SL & TP: Stop Loss (SL) adalah kunci hidup Anda di pasar. Selalu letakkan SL di bawah swing low terdekat untuk posisi BUY atau di atas swing high untuk posisi SELL. Rasio keuntungan minimal 1:2!";
    }
    return res.json({ response: offlineReply });
  }

  try {
    // Generate context summary system instruction
    let systemInstruction = `Anda adalah 'Aksara', seorang Mentor Trading Keuangan Profesional yang sangat sabar, ramah, bijaksana, dan membimbing pengguna belajar trading dari nol (beginner).
Gunakan bahasa Indonesia yang santun, komunikatif, mudah dimengerti, dan hindari jargon rumit tanpa penjelasan sederhana.
Prioritaskan konsep manajemen risiko yang ketat (membatasi risiko 1-2% per posisi, pentingnya Stop Loss (SL) dan Take Profit (TP), serta rasio Reward-to-Risk minimal 1:2).
Jangan pernah memberi jaminan keuntungan pasti kaya atau mempromosikan skema cepat kaya. Selalu tekankan bahwa trading adalah seni mengelola probabilitas dan disiplin psikologis.

Tanggapi percakapan dengan format Markdown yang rapi (gunakan cetak tebal, list, atau sekat bahasan agar nyaman dibaca).`;

    if (chartContext) {
      systemInstruction += `\n\nInformasi Tambahan tentang Kondisi Grafik Simulasi Pengguna Saat Ini:\n${chartContext}`;
    }

    // Format chat contents for the GoogleGenAI chats API
    // Ensure accurate mappings according to the gemini-api SKILL guidelines.
    // Each message has role-based content
    const chatContents = messages.map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    // Generate output utilizing ai.models.generateContent
    const lastMessageObj = chatContents[chatContents.length - 1];
    const contextPrompt = lastMessageObj ? lastMessageObj.parts[0].text : "Halo Mentor!";

    // Prepare history without the last system message or current prompt if using generateContent
    // Or we can query generateContent with the full block of contents holding the conversation history
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7
      }
    });

    const replyText = response.text || "Mohon maaf, saya belum bisa memformulasikan jawaban. Silakan coba lagi.";
    return res.json({ response: replyText });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    return res.status(500).json({ 
      error: "Terjadi gangguan pada server asisten AI.",
      details: error.message || error
    });
  }
});

// Configure Vite middleware or serve static production build
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite integration...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server successfully running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
