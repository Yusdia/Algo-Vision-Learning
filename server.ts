import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load configuration
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON requests with increased limit for base64 chart images
app.use(express.json({ limit: "10mb" }));

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

// Dedicated routes for search engines and site verification
app.get("/sitemap.xml", (req, res) => {
  const possiblePaths = [
    path.join(process.cwd(), "dist/sitemap.xml"),
    path.join(process.cwd(), "public/sitemap.xml")
  ];
  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      res.header("Content-Type", "application/xml");
      return res.sendFile(filePath);
    }
  }
  res.status(404).send("Sitemap not found");
});

app.get("/robots.txt", (req, res) => {
  const possiblePaths = [
    path.join(process.cwd(), "dist/robots.txt"),
    path.join(process.cwd(), "public/robots.txt")
  ];
  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      res.header("Content-Type", "text/plain");
      return res.sendFile(filePath);
    }
  }
  res.status(404).send("robots.txt not found");
});

app.get("/google11097922d253aa0e.html", (req, res) => {
  const possiblePaths = [
    path.join(process.cwd(), "dist/google11097922d253aa0e.html"),
    path.join(process.cwd(), "public/google11097922d253aa0e.html")
  ];
  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      res.header("Content-Type", "text/html");
      return res.sendFile(filePath);
    }
  }
  res.status(404).send("Verification file not found");
});

app.post("/api/mentor-chat", async (req, res) => {
  const { messages, chartContext, language } = req.body;
  const isEn = language === "EN";

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ 
      error: isEn ? "Invalid request format. 'messages' must be an array." : "Format request tidak valid. 'messages' harus berupa array." 
    });
  }

  // Fallback if AI or API key is not available
  if (!ai) {
    const lastUserMsg = messages[messages.length - 1]?.content || "";
    let offlineReply = "";

    if (isEn) {
      offlineReply = "Hello! I am your Trading Mentor. Currently, the Gemini API key has not been configured in Secrets. However, I have vital beginner guidelines: Always place a supportive Stop Loss (SL), restrict risk potential to 1-2% of balance per trade, and align your setups with higher timeframe trend lines!";
      if (lastUserMsg.toLowerCase().includes("candle") || lastUserMsg.toLowerCase().includes("lilin") || lastUserMsg.toLowerCase().includes("wick")) {
        offlineReply = "About Candlesticks: Bullish candles (green) signify buyers holding controls, whereas bearish ones (red) show sellers pushing downwards. Look for long lower shadows (wicks): they represent strong price rejection near key zones, suggesting imminent upward bounces!";
      } else if (lastUserMsg.toLowerCase().includes("indicator") || lastUserMsg.toLowerCase().includes("rsi") || lastUserMsg.toLowerCase().includes("ma")) {
        offlineReply = "About Indicators: Moving Averages guide you through the primary direction of the trend. Meanwhile, momentum oscillators like RSI indicate if an asset is oversold (<30) or overbought (>70). Wait for RSI pullbacks before chasing momentum!";
      } else if (lastUserMsg.toLowerCase().includes("sl") || lastUserMsg.toLowerCase().includes("tp")) {
        offlineReply = "About SL & TP: Stop Losses (SL) keep your portfolio breathing in heavy volatile scenarios. Always place SL below active swing lows (for BUY) or above swing highs (for SELL). Always set target rewards at least double the distance of your risk!";
      }
    } else {
      offlineReply = "Halo! Saya Mentor Trading Anda. Saat ini koneksi API ke server Gemini belum dikonfigurasi (kunci API belum diset di Secrets). Namun saya punya tips dasar: Selalu gunakan Stop Loss (SL) di setiap posisi Anda, batasi resiko maksimal 1-2% dari modal per trade, dan lakukan analisa tren di timeframe besar sebelum memutuskan open posisi!";
      if (lastUserMsg.toLowerCase().includes("candle") || lastUserMsg.toLowerCase().includes("lilin")) {
        offlineReply = "Tentang Candlestick: Candlestick hijau (bullish) tandanya harga naik, sedangkan lilin merah (bearish) menandakan penjual memegang kendali. Perhatikan sumbu bawah yang panjang: itu adalah tanda penolakan (rejection) harga rendah, sering kali merupakan awal kenaikan harga!";
      } else if (lastUserMsg.toLowerCase().includes("indikator") || lastUserMsg.toLowerCase().includes("rsi")) {
        offlineReply = "Tentang Indikator: Moving Average membantu Anda melihat ke arah mana tren berjalan. Sedangkan RSI membantu menunjuk kejenuhan harga. Jika RSI di atas 70, waspadai pasar jenuh beli (overbought) dan bersiap tren berbalik turun!";
      } else if (lastUserMsg.toLowerCase().includes("sl") || lastUserMsg.toLowerCase().includes("tp")) {
        offlineReply = "Tentang SL & TP: Stop Loss (SL) adalah kunci hidup Anda di pasar. Selalu letakkan SL di bawah swing low terdekat untuk posisi BUY atau di atas swing high untuk posisi SELL. Rasio keuntungan minimal 1:2!";
      }
    }
    return res.json({ response: offlineReply });
  }

  try {
    // Generate context summary system instruction
    let systemInstruction = "";
    if (isEn) {
      systemInstruction = `You are 'Aksara', a senior Professional Financial Trading Mentor who is exceptionally patient, warm, encouraging, and guides beginners learning trading from zero.
Always reply thoroughly and completely in English.
Keep technical concepts simple, using easy analogies. Emphasize strict capital risk management rules (restricting setups to 1-2% maximum balance risk, using defensive Stop Losses (SL) and Take Profits (TP), and maintaining a minimum 1:2 Reward-to-Risk ratio).
Never give guarantees of profits or promote fast-wealth claims. Highlight that trading is a game of probability.
Format output beautifully with clean Markdown typography (headers, bullets, blockquotes).`;
    } else {
      systemInstruction = `Anda adalah 'Aksara', seorang Mentor Trading Keuangan Profesional yang sangat sabar, ramah, bijaksana, dan membimbing pengguna belajar trading dari nol (beginner).
Gunakan bahasa Indonesia yang santun, komunikatif, mudah dimengerti, dan hindari jargon rumit tanpa penjelasan sederhana.
Prioritaskan konsep manajemen risiko yang ketat (membatasi risiko 1-2% per posisi, pentingnya Stop Loss (SL) dan Take Profit (TP), serta rasio Reward-to-Risk minimal 1:2).
Jangan pernah memberi jaminan keuntungan pasti kaya atau mempromosikan skema cepat kaya. Selalu tekankan bahwa trading adalah seni mengelola probabilitas dan disiplin psikologis.
Tanggapi percakapan dengan format Markdown yang rapi (gunakan cetak tebal, list, atau sekat bahasan agar nyaman dibaca).`;
    }

    if (chartContext) {
      if (isEn) {
        systemInstruction += `\n\nAdditional visual state context from the user's active simulator running:\n${chartContext}`;
      } else {
        systemInstruction += `\n\nInformasi Tambahan tentang Kondisi Grafik Simulasi Pengguna Saat Ini:\n${chartContext}`;
      }
    }

    // Format chat contents for the GoogleGenAI chats API
    const chatContents = messages.map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7
      }
    });

    const replyText = response.text || (isEn ? "Apologies, I am unable to formulate a response at this moment. Please check again." : "Mohon maaf, saya belum bisa memformulasikan jawaban. Silakan coba lagi.");
    return res.json({ response: replyText });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    return res.status(500).json({ 
      error: isEn ? "AI Mentor helper is temporarily offline." : "Terjadi gangguan pada server asisten AI.",
      details: error.message || error
    });
  }
});

// Endpoint untuk analisa gambar chart buatan user
app.post("/api/analyze-chart-image", async (req, res) => {
  const { image, notes, demoPreset, language } = req.body;
  const isEn = language === "EN";

  if (!image && !demoPreset) {
    return res.status(400).json({ 
      error: isEn ? "An image upload or example preset is required to process charts." : "Gambar atau pilihan demo diperlukan untuk memproses analisa." 
    });
  }

  // If offline or no AI, return polished educational templates based on content (for premium experience)
  if (!ai) {
    let mockResponse = "";
    if (isEn) {
      mockResponse = `### Chart Structural Technical Analysis Report (Offline Sandbox Mode)

⚠️ **API Key Connection Pending**: You are currently operating the assistant in *Offline Mode*, meaning we cannot dynamically parse custom images using Gemini.

*How to Establish Connection:*
To unlock dynamic AI Image parsing instantly:
1. Tap on the **Settings** gear icon in your AI Studio workstation.
2. Initialize a new Secret Variable named **GEMINI_API_KEY**.
3. Input your official Gemini API key.

---

### 📈 Trading Preset Simulation: ${demoPreset ? (demoPreset === "double_bottom" ? "Double Bottom Pattern" : "Head & Shoulders Pattern") : "Uploaded Custom Layout"}

`;
      if (demoPreset === "double_bottom") {
        mockResponse += `**1. Structure & Trends**: 
A classic Double Bottom setup has formed at the support neckline of $2,300 (Gold) following a severe decline. This represents a highly reliable Bullish Reversal trigger.

**2. Candlestick Confirmation**:
An exquisite pinbar bullish wick (long lower shadow) rejects the support floor on the second test, showing that bulls are vigorously absorbing sellers' volume.

**3. Actionable Setup Guidelines**:
- **Entry Level**: Trigger long entries once the neckline boundary at $2,340 is decisively breached and closed above on a strong green candle.
- **Stop Loss (SL)**: Place a defensive stop protection underneath the twin valley floor at $2,290 (~50 pips).
- **Take Profit (TP)**: Target a profit taker near $2,440 maintaining a minimum 1:2 Risk-to-Reward ratio.`;
      } else if (demoPreset === "head_shoulders") {
        mockResponse += `**1. Structure & Trends**:
A classic Head and Shoulders continuation is active near trend peaks, showing extreme buyer exhaustion and signaling a Bearish Reversal.

**2. Pattern Necklines**:
Symmetrical left and right shoulders form zones around $104.50, with the head topping at $106.00. The key supportive neckline floor rests at $103.20.

**3. Actionable Setup Guidelines**:
- **Entry Level**: Open short orders (SELL) immediately as a solid bearish candle closes below the support neckline of $103.00.
- **Stop Loss (SL)**: Place a security guard above the right shoulder peak around $104.80.
- **Take Profit (TP)**: Secure profits around $99.40 to capture an advantageous 1:2 Risk-to-Reward ratio.`;
      } else {
        mockResponse += `**Technical Guidelines for Uploaded Custom Charts**:
Under offline constraints, adhere to basic structural reading techniques:
- **Finding Major Supports (Floors)**: Pinpoint local low clusters where price rates have bounced multiple times. These define robust demand basins for BUY setups.
- **Finding Major Resistances (Ceilings)**: Spot localized high peaks where sellers reject upwards momentum. These define high probability supply walls for SELL setups.
- **Safety Margins**: Ensure your Take Profit distance is always at least twice the size of your Stop Loss risk.`;
      }
    } else {
      mockResponse = `### Laporan Analisa Teknikal Grafis (Mode Simulasi Offline)

⚠️ **Konektivitas API Kunci Belum Tersambung**: Anda saat ini menggunakan asisten dalam *Mode Belajar Offline*, sehingga kami belum bisa menganalisa gambar asli yang Anda unggah secara dinamis menggunakan kecerdasan buatan Gemini.

*Cara Menghubungkan:*
Untuk mengaktifkan Analisa AI Gambar Chart secara instan:
1. Klik menu **Settings** (ikon roda gigi) di workspace AI Studio Anda.
2. Tambahkan rahasia baru dengan nama kunci **GEMINI_API_KEY**.
3. Masukkan kunci API Gemini Anda.

---

### 📈 Simulasi Pola Edukasi: ${demoPreset ? (demoPreset === "double_bottom" ? "Double Bottom Pattern" : "Head & Shoulders Pattern") : "Gambar Unggahan Kustom"}

`;
      if (demoPreset === "double_bottom") {
        mockResponse += `**1. Struktur Tren & Pola**: 
Double Bottom Pattern terdeteksi di level support horizontal $2,300 (emas) setelah tren turun yang berkepanjangan. Ini adalah pola pembalikan arah harga (Bullish Reversal) yang sangat kuat.

**2. Candlestick Sinyal**:
Terdapat lilin pinbar bullish (ekor bawah panjang) pada sentuhan dasar ke-2, menandakan pembeli aktif melakukan aksi beli di level support tersebut.

**3. Rencana Perdagangan (Trading Setup)**:
- **Level Entry**: Masuk setelah garis leher (neckline) di $2,340 berhasil ditembus dan ditutup di atasnya.
- **Stop Loss (SL)**: Tempatkan di bawah lembah kedua di $2,290 (~50 pips).
- **Take Profit (TP)**: Target minimum di $2,440 dengan Rasio Risk-to-Reward ideal 1:2.`;
      } else if (demoPreset === "head_shoulders") {
        mockResponse += `**1. Struktur Tren & Pola**:
Pola Head and Shoulders klasik terbentuk pada titik puncak uptrend, menandakan kejenuhan pembeli dan potensi pembalikan arah menjadi menurun (Bearish Reversal).

**2. Titik Pemicu**:
Garis bahu kiri dan kanan terbentuk seimbang di kisaran $104.50, sementara kepala memuncak di $106.00. Garis leher (neckline) support horizontal berada di $103.20.

**3. Rencana Perdagangan (Trading Setup)**:
- **Level Entry**: Mulai posisi SELL setelah lilin bearish solid ditutup meluncur menembus garis leher di $103.00.
- **Stop Loss (SL)**: Letakkan proteksi di atas bahu kanan di $104.80.
- **Take Profit (TP)**: Target target jatuh di level $99.40 untuk menjaga ketahanan rasio Reward-Kehilangan 1:2.`;
      } else {
        mockResponse += `**Analisis Dasar Grafik yang diunggah**:
Karena sistem dalam status offline tanpa kunci API, Anda tetap bisa mempelajari asas-asas membaca visual chart:
- **Mencari Support utama (Lantai harga)**: Carilah kumpulan harga terendah di mana grafik tampak memantul ke atas berkali-kali. Ini adalah zona demand potensial untuk memasang order BUY.
- **Mencari Resistance utama (Atap harga)**: Carilah kluster harga tertinggi di mana grafik berulang kali tertekan jatuh kembali. Ini merupakan zona penawaran (supply) potensial untuk SELL.
- **Rasio Risiko**: Selalu pastikan target profit (TP) Anda berukuran setidaknya dua kali jarak stop loss (SL) Anda dari titik masuk!`;
      }
    }

    return res.json({ analysis: mockResponse });
  }

  try {
    let systemInstruction = "";
    if (isEn) {
      systemInstruction = `You are 'Aksara', a senior Technical Analysis Expert and Trading Mentor.
Your task is to analyze the user-uploaded candlestick chart screenshot (Forex, Gold, Cryptos, or Stocks) and present a professional, structured, educational technical analysis report in English.
Report Anatomy requirements:
1. **Trend & Market Structures**: Is the market in an Uptrend, Downtrend, or flat Sideways? Supply quantitative arguments (S&R pivots, candlestick shapes, EMA locations).
2. **Candlesticks & Key Patterns**: Detail any recognizable setups (Hammer, Pinbars, Engulfing wicks, Double Bottoms, Head & Shoulders). Clarify what psychological action they reflect.
3. **Indicator Assessments**: If Moving Averages, Bollinger Bands, or RSI momentum lines are displayed, parse their active levels.
4. **Actionable Scenario Setup (Risk Protection focus)**:
   - Bullish Long Scenario (logical entry bounds, safety Stop Loss under support, target Take Profit rates)
   - Bearish Short Scenario (logical entry bounds, safety Stop Loss above resistance, target Take Profit rates)
5. **Beginner Wisdom Checkpoints**: Restate the absolute importance of preserving capital using 1% maximum trade risk protection and 1:2 Risk-to-Reward rules.
Render everything beautifully in clean, highly readable Markdown bullet guides and tables.`;
    } else {
      systemInstruction = `Anda adalah 'Aksara', pakar Analisa Teknikal Grafis Keuangan professional senior sekaligus Mentor Trading yang membimbing pemula.
Tugas Anda adalah membedah gambar chart (saham, forex, crypto, komoditas) yang diunggah oleh pengguna dan memberikan laporan analisa teknis yang mendalam, terukur, objektif, dan mendidik.

Anatomi Analisa yang wajib Anda berikan:
1. **Arah Tren & Struktur Pasar**: Apakah Downtrend, Uptrend, atau Sideways? Sebutkan alasannya (struktur Support/Resistance, letak candlestick, dll).
2. **Pola Candlestick & Chart Pattern Utama**: Apakah Anda mendeteksi pola seperti Hammer, Engulfing, Head & Shoulders, Double Bottom, Pinbar, dll? Jelaskan implikasinya.
3. **Analisa Indikator (jika terlihat)**: Jika ada garis Moving Average, Bollinger Bands, RSI atau MACD pada tangkapan layar, jelaskan sinyal yang dipancarkan.
4. **Rencana Skenario Dagang (Trading Setup)**:
   - Skenario Bullish/Buy (Level Entry, SL, dan TP yang logis)
   - Skenario Bearish/Sell (Level Entry, SL, dan TP yang logis)
5. **Rekomendasi Edukasi & Pengamanan**: Tekankan pentingnya Stop Loss (SL) perlindungan modal dan rasio Risk-Reward minimal 1:2.

Gunakan bahasa Indonesia yang ramah, profesional, mudah dicerna pemula, dan disajikan dalam format Markdown yang indah (gunakan tebal, daftar poin, kutipan blokir, dan tabel jika relevan).`;
    }

    let mimeType = "image/png";
    let base64Data = image;

    if (image && image.includes("data:") && image.includes(";base64,")) {
      const parts = image.split(";base64,");
      mimeType = parts[0].replace("data:", "");
      base64Data = parts[1];
    }

    // Prepare multimodal parts
    const textPart = {
      text: notes 
        ? (isEn 
            ? `User's Special Inquiry:\n"${notes}"\n\nPlease incorporate this request in your comprehensive technical report above.` 
            : `Catatan/Pertanyaan Tambahan Pengguna:\n"${notes}"\n\nTolong lakukan analisa mendalam terhadap gambar chart di atas dengan menyertakan instruksi sistem.`)
        : (isEn 
            ? "Provide a deep technical and structural visual analysis of the provided chart screenshot." 
            : "Lakukan analisa teknikal grafis mendalam pada tangkapan layar chart yang saya berikan berikut."),
    };

    let contents: any;

    if (base64Data) {
      const imagePart = {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      };
      contents = { parts: [imagePart, textPart] };
    } else {
      contents = { parts: [textPart] };
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const analysis = response.text || (isEn ? "Apologies, I cannot decode this chart image clearly. Please re-upload with better resolution." : "Mohon maaf, saya belum bisa membaca gambar chart ini. Silakan coba unggah kembali dengan resolusi yang lebih jernih.");
    return res.json({ analysis });
  } catch (error: any) {
    console.error("Chart analysis API error:", error);
    return res.status(500).json({
      error: isEn ? "Failed to establish image analytical pipeline." : "Terjadi gangguan saat memproses analisa gambar grafik.",
      details: error.message || error,
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
