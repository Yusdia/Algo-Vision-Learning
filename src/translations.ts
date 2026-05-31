export type Language = "ID" | "EN";

export interface TranslationDictionary {
  headerTitle: string;
  headerSubtitle: string;
  tabSimulator: string;
  tabAcademy: string;
  tabAnalyzer: string;
  tabGuide: string;
  balanceLabel: string;
  xpLabel: string;
  
  // Indicators Toolbar
  indicatorHeader: string;
  indicatorShortMa: string;
  indicatorLongMa: string;
  indicatorBb: string;
  indicatorSr: string;
  chartTimeframe: string;
  resetBalanceBtn: string;
  
  // Backtest Console
  accountDashboard: string;
  marginUsed: string;
  freeMargin: string;
  floatingPnl: string;
  newOrderHeader: string;
  lotSizeLabel: string;
  leverageLabel: string;
  slLabel: string;
  tpLabel: string;
  estimatedRisk: string;
  estimatedReward: string;
  riskRewardRatio: string;
  buyButton: string;
  sellButton: string;
  closePositionBtn: string;
  rrTitle: string;
  historyTitle: string;
  orderSetupTab: string;
  tradeHistoryTab: string;
  durationLabel: string;
  controlsTitle: string;
  replaySpeedLabel: string;
  pipsLabel: string;
  
  // Mentor AI
  mentorHeader: string;
  mentorStatus: string;
  mentorPing: string;
  mentorPromptPlaceholder: string;
  mentorInitialMessage: string;
  mentorResetChat: string;
  mentorResponseLoading: string;
  mentorConnectionError: string;
  
  // Chart Analyzer
  analyzerHeader: string;
  analyzerSub: string;
  dropText: string;
  orBrowse: string;
  supportedFormats: string;
  demoHeader: string;
  demoDoubleBottomTitle: string;
  demoDoubleBottomDesc: string;
  demoHeadShouldersTitle: string;
  demoHeadShouldersDesc: string;
  analyzerNotesLabel: string;
  analyzerNotesPlaceholder: string;
  analyzerBtn: string;
  analyzerBtnLoading: string;
  analyzerResultHeader: string;
  analyzerResultSub: string;
  analyzerDisclaimerHeader: string;
  analyzerDisclaimerText: string;
  analyzerEmptyHeader: string;
  analyzerEmptyDesc: string;
  analyzerEmptyPrompt: string;
  statusLoaded: string;
  changeImage: string;
  
  // Modal Welcome
  welcomeHeader: string;
  welcomeSub: string;
  welcomeIntro: string;
  welcomePointHeader: string;
  welcomePoint1: string;
  welcomePoint2: string;
  welcomePoint3: string;
  welcomePoint4: string;
  welcomeStartBtn: string;
  
  // Educational Section
  studyProgress: string;
  studyFinishedUnits: string;
  studyFinishedCertHeader: string;
  studyFinishedCertText: string;
  studyCurriculumHeader: string;
  studyModuleLabel: string;
  studyLessonLabel: string;
  quizHeader: string;
  quizSubmitBtn: string;
  quizPracticeHintHeader: string;
  quizPracticeHintText: string;
  quizEmptyState: string;
  
  // Interactive Guide
  guideHeader: string;
  guideIntro: string;
  guideStep1Header: string;
  guideStep1Text: string;
  guideStep1Points: string;
  guideStep2Header: string;
  guideStep2Text: string;
  guideStep3Header: string;
  guideStep3Text: string;
  guideStep4Header: string;
  guideStep4Text: string;
  guideFooterText: string;
  guideStartBtn: string;

  // Alerts
  alertAddSlTpError: string;
  alertOpenPositionTitle: string;
  alertOpenPositionMsg: string;
  alertTpTitle: string;
  alertTpMsg: string;
  alertSlTitle: string;
  alertSlMsg: string;
  alertResetTitle: string;
  alertResetMsg: string;
  confirmTimeframe: string;
  confirmResetReplay: string;
  confirmResetBalance: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  ID: {
    headerTitle: "Akademi Trading Interaktif",
    headerSubtitle: "Belajar Analisa Grafik & Backtesting Risiko Nol",
    tabSimulator: "Replay & Simulasi",
    tabAcademy: "Sekolah Dasar (0-100)",
    tabAnalyzer: "Analisa Chart (AI Gambar)",
    tabGuide: "Petunjuk Praktik",
    balanceLabel: "SALDO SIMULASI",
    xpLabel: "PRESTASI SKOR",
    
    // Indicators Toolbar
    indicatorHeader: "Indikator:",
    indicatorShortMa: "Short MA (7)",
    indicatorLongMa: "Long MA (20)",
    indicatorBb: "Bollinger Bands",
    indicatorSr: "Panduan S&R",
    chartTimeframe: "Waktu Grafik:",
    resetBalanceBtn: "Reset Saldo",
    
    // Backtest Console
    accountDashboard: "Dasbor Logistik Akun",
    marginUsed: "Marjin Tersandera",
    freeMargin: "Sisa Margin Bebas",
    floatingPnl: "Untung/Rugi Mengambang",
    newOrderHeader: "Pengaturan Transaksi Baru",
    lotSizeLabel: "Ukuran Lot",
    leverageLabel: "Daya Ungkit (Leverage)",
    slLabel: "Penjaga Kerugian (Stop Loss)",
    tpLabel: "Target Profit (Take Profit)",
    estimatedRisk: "Estimasi Risiko:",
    estimatedReward: "Estimasi Reward:",
    riskRewardRatio: "Rasio Risk-to-Reward:",
    buyButton: "Beli / BUY (Panah Naik)",
    sellButton: "Jual / SELL (Panah Turun)",
    closePositionBtn: "Tutup Posisi Sekarang",
    rrTitle: "Pintasan Otomatis Rasio R:R",
    historyTitle: "RIWAYAT TRANSAKSI Jurnal Belajar",
    orderSetupTab: "Eksekusi Transaksi",
    tradeHistoryTab: "Riwayat Perdagangan",
    durationLabel: "Durasi Replay Sejarah:",
    controlsTitle: "Kemudi Putar Sejarah:",
    replaySpeedLabel: "Kecepatan Putar Replay:",
    pipsLabel: "pips",
    
    // Mentor AI
    mentorHeader: "AI Mentor: Aksara",
    mentorStatus: "Sedia Membimbing 24/7",
    mentorPing: "Aktif",
    mentorPromptPlaceholder: "Tanya mentor (misal: 'gimana cara pasang SL yang aman?')...",
    mentorInitialMessage: "Halo! Saya **Aksara**, mentor pribadi Anda. Saya siap menemani perjalanan belajar trading Anda dari nol.\n\nAnda bisa bertanya apa saja mengenai **analisa candlestick**, **cara pakai indikator, cara mengatur Stop Loss (SL)**, hingga meminta saya mengevaluasi strategi trading Anda hari ini! Silakan ketik pertanyaan Anda.",
    mentorResetChat: "Bagus, obrolan telah disetel ulang. Ada materi atau posisi chart mana lagi yang ingin kita diskusikan bersama?",
    mentorResponseLoading: "Aksara sedang merenungkan jawaban",
    mentorConnectionError: "Gagal mengambil tanggapan dari server asisten AI.",
    
    // Chart Analyzer
    analyzerHeader: "Unggah Tangkapan Layar Chart",
    analyzerSub: "Kami menganalisis candlestick, rentang harga, tren, dan pembentukan indikator.",
    dropText: "Seret & Jatuhkan gambar di sini",
    orBrowse: "atau klik untuk menelusuri folder file Anda",
    supportedFormats: "Mendukung PNG, JPG, WebP (Maks. 8MB)",
    demoHeader: "Sekolah Cepat: Gunakan Gambar Contoh",
    demoDoubleBottomTitle: "W Double Bottom",
    demoDoubleBottomDesc: "Sinyal Pembalikan Bullish",
    demoHeadShouldersTitle: "Head & Shoulders",
    demoHeadShouldersDesc: "Sinyal Reversal Bearish",
    analyzerNotesLabel: "Pertanyaan Tambahan (Opsional):",
    analyzerNotesPlaceholder: "Contoh: 'Apakah tren ini tergolong breakout yang valid?', 'Berapa target TP jika saya entry sekarang?'...",
    analyzerBtn: "Analisa Gambar Sekarang",
    analyzerBtnLoading: "Memproses Analisa Teoritik...",
    analyzerResultHeader: "Hasil Analisa Ahli Aksara",
    analyzerResultSub: "Rincian terstruktur dari asisten analis teknis Anda.",
    analyzerDisclaimerHeader: "💡 DISKLAIMER MEDIS KEUANGAN:",
    analyzerDisclaimerText: "Analisa ini dipetik melalui pencitraan pola kecerdasan model. Lakukan konfirmasi berulang pada demo simulasi backtesting bebas-risiko kami sebelum menaruh modal riil Anda.",
    analyzerEmptyHeader: "Siap Menerima Unggahan Anda",
    analyzerEmptyDesc: "Pilih gambar di sebelah kiri untuk melakukan bedah visual grafik candlestick dari bursa nyata.",
    analyzerEmptyPrompt: "Cari tombol 'Coba Gambar Contoh' untuk demo cepat!",
    statusLoaded: "Status: Gambar Berhasil Dimuat",
    changeImage: "Ganti Gambar",
    
    // Modal Welcome
    welcomeHeader: "Selamat Datang di Akademi Trading!",
    welcomeSub: "Bimbingan Dasar trading dari nol sampai lulus",
    welcomeIntro: "Halo calon trader! Kami menyediakan simulator interkatif di mana Anda bisa **memutar ulang sejarah pergerakan harga pasar (Gold, Bitcoin, & Forex) secara candle-by-candle**.",
    welcomePointHeader: "Di sini Anda bebas melakukan:",
    welcomePoint1: "Menguji strategi tanpa resiko menggunakan dana simulasi **$10,000**.",
    welcomePoint2: "Mencoba open posisi BUY atau SELL, memasang **Stop Loss (SL)** perlindungan, serta target **Take Profit (TP)** di grafik.",
    welcomePoint3: "Belajar kurikulum materi lengkap dengan kuis interaktif berhadiah XP.",
    welcomePoint4: "Berkonsultasi langsung secara real-time dengan **Mentor AI Aksara** mengenai grafik atau riwayat portofolio Anda!",
    welcomeStartBtn: "Mulai Masuk & Belajar Sekarang",
    
    // Educational Section
    studyProgress: "Kemajuan Studi",
    studyFinishedUnits: "Materi Selesai",
    studyFinishedCertHeader: "Hebat!",
    studyFinishedCertText: "Anda memperoleh <strong>Sertifikat Virtual Kelulusan Dasar Trading</strong>! Anda sudah siap bertransaksi.",
    studyCurriculumHeader: "Kurikulum Level",
    studyModuleLabel: "MODUL",
    studyLessonLabel: "Materi Modul:",
    quizHeader: "Kuis Pemahaman Materi (+50 XP)",
    quizSubmitBtn: "Kirim Jawaban",
    quizPracticeHintHeader: "💡 Petunjuk Praktik Replay Simulator:",
    quizPracticeHintText: "Setelah membaca rangkuman ini, silakan pindah ke tab **Replay Simulator** di layar atas. Gunakan kendali replay untuk memutarkan harga candlestick demi candlestick, cari penolakan candlestick (seperti **Hammer**), dan letakkan simulasi transaksi **BUY** atau **SELL** dengan disiplin Stop Loss (SL) yang tepat!",
    quizEmptyState: "Silakan pilih materi pelajaran di panel atas.",
    
    // Interactive Guide
    guideHeader: "Bimbingan Praktik Simulator Backtesting",
    guideIntro: "Platform ini dirancang khusus untuk mewujudkan salah satu taktik belajar trading paling efektif bagi pemula yang disebut **Backtesting Sejarah Pasar**.",
    guideStep1Header: "Langkah Ke-1: Memilih Strategi Di Sekolah",
    guideStep1Text: "Silakan buka tab **Sekolah Dasar (0-100)** terlebih dahulu. Di sana Anda dapat mempelajari:",
    guideStep1Points: "Bagaimana membaca volume lilin (**Candlestick Anatomy**).,Bagaimana cara jitu menentukan arah pasar (**Uptrend, Downtrend, Sideways**).,Prinsip perlindungan utama modal Anda (**Stop Loss, Take Profit, dan Rasio 1:2**).",
    guideStep2Header: "Langkah Ke-2: Menentukan Entry Di Grafik Sejarah",
    guideStep2Text: "Pindahkan tab Anda ke **Replay & Simulasi**. Pilih instrumen yang ingin dipelajari (misal: Emas/XAU-USD). Use the replay buttons to step candles, active S&R assistance lines to help target bounces.",
    guideStep3Header: "Langkah Ke-3: Masuk ke Simulasi Transaksi (BUY atau SELL)",
    guideStep3Text: "Tentukan parameter ukuran lot Anda (misal: 0.1 lot). Sangat direkomendasikan menguji dengan rasio perlindungan risiko ketat, nyalakan checkbox SL & TP.",
    guideStep4Header: "Langkah Ke-4: Evaluasi Menggunakan Asisten AI",
    guideStep4Text: "Di kolom bagian kanan layar Anda, **Mentor AI Aksara** siap membimbing Anda kapan pun. Tanyakan padanya tentang letak posisi transaksi Anda!",
    guideFooterText: "Selamat berlatih, trader masa depan! Keberhasilan ada di tangan disiplin Anda.",
    guideStartBtn: "Mulai Latihan Replay",

    // Alerts
    alertAddSlTpError: "⚠️ Anda sudah memiliki posisi aktif yang berjalan! Tutup terlebih dahulu posisi ini sebelum membuka transaksi baru.",
    alertOpenPositionTitle: "🚀 POSISI BERHASIL DIBUKA",
    alertOpenPositionMsg: "Membuka transaksi **{type}** **{lot}** lot pada level entry {entryPrice}. Jalankan atau percepat Replay di samping untuk melihat perkembangannya!",
    alertTpTitle: "🎯 TARGET TAKE PROFIT TERCAPAI!",
    alertTpMsg: "Luar biasa! Posisi {type} menyentuh target TP di {exitPrice}. Anda mendulang keuntungan sebesar **+${tradePnl}**! Analisa chart Anda sangat presisi.",
    alertSlTitle: "🛑 PERLINDUNGAN STOP LOSS TRIGERRED",
    alertSlMsg: "Posisi {type} menyentuh batas pengaman SL di {exitPrice}. Mengalami rugi terkawal **-${tradePnl}**. Ini keputusan cerdas! Memasang SL menyelamatkan sisa modal belajar Anda dari Margin Call.",
    alertResetTitle: "🔄 REPLAY CHART DIRESET",
    alertResetMsg: "Grafik historis berhasil disetel ulang ke titik mula pembelajaran. Anda siap melakukan latihan backtesting baru.",
    confirmTimeframe: "Mengubah timeframe sekarang akan memuat ulang bagan grafik dan menutup posisi aktif Anda. Lanjutkan?",
    confirmResetReplay: "Apakah Anda ingin menyetel ulang visual replay ke 45 candle pertama? Seluruh catatan transaksi aktif Anda saat ini akan dihentikan.",
    confirmResetBalance: "Apakah Anda ingin mereset saldo simulasi Anda kembali ke $10,000?"
  },
  EN: {
    headerTitle: "Interactive Trading Academy",
    headerSubtitle: "Learn Chart Analysis & Backtesting with Zero Risk",
    tabSimulator: "Replay & Simulation",
    tabAcademy: "Basic Trading School (0-100)",
    tabAnalyzer: "AI Chart Analyzer",
    tabGuide: "Practice Guide",
    balanceLabel: "SIMULATION BALANCE",
    xpLabel: "ACHIEVEMENT SCORE",
    
    // Indicators Toolbar
    indicatorHeader: "Indicators:",
    indicatorShortMa: "Short MA (7)",
    indicatorLongMa: "Long MA (20)",
    indicatorBb: "Bollinger Bands",
    indicatorSr: "S&R Guide",
    chartTimeframe: "Chart Timeframe:",
    resetBalanceBtn: "Reset Balance",
    
    // Backtest Console
    accountDashboard: "Account Logistics Dashboard",
    marginUsed: "Margin Used",
    freeMargin: "Free Margin",
    floatingPnl: "Floating Profit/Loss",
    newOrderHeader: "New Trade Configuration",
    lotSizeLabel: "Lot Size",
    leverageLabel: "Leverage",
    slLabel: "Stop Loss (SL)",
    tpLabel: "Take Profit (TP)",
    estimatedRisk: "Estimated Risk:",
    estimatedReward: "Estimated Reward:",
    riskRewardRatio: "Risk-to-Reward Ratio:",
    buyButton: "BUY (Upward Move)",
    sellButton: "SELL (Downward Move)",
    closePositionBtn: "Close Active Position Now",
    rrTitle: "Automatic R:R Ratio Shortcuts",
    historyTitle: "TRANSACTION HISTORY Study Journal",
    orderSetupTab: "Execute Order",
    tradeHistoryTab: "Trade History",
    durationLabel: "Historical Replay Duration:",
    controlsTitle: "Historical Playback Controls:",
    replaySpeedLabel: "Replay Playback Speed:",
    pipsLabel: "pips",
    
    // Mentor AI
    mentorHeader: "AI Mentor: Aksara",
    mentorStatus: "Guiding You 24/7",
    mentorPing: "Active",
    mentorPromptPlaceholder: "Ask your mentor (e.g., 'how do I set a safe SL?')...",
    mentorInitialMessage: "Hello! I am **Aksara**, your personal trading mentor. I am ready to guide you on your trading journey from the very basics.\n\nYou can ask me anything about **candlestick analysis**, **how to use indicators, setting Stop Losses (SL)**, or ask me to evaluate your trading strategies for today! Please type your question.",
    mentorResetChat: "Excellent, the conversation has been reset. What other layout or chart position shall we evaluate next?",
    mentorResponseLoading: "Aksara is contemplating your query",
    mentorConnectionError: "Failed to fetch response from the AI Assistant server.",
    
    // Chart Analyzer
    analyzerHeader: "Upload Chart Screenshot",
    analyzerSub: "We analyze the candlesticks, price levels, immediate trend, and indicator formations.",
    dropText: "Drag & Drop your image here",
    orBrowse: "or click to browse your folders",
    supportedFormats: "Supports PNG, JPG, WebP (Max. 8MB)",
    demoHeader: "Quick Learn: Use Example Images",
    demoDoubleBottomTitle: "W Double Bottom",
    demoDoubleBottomDesc: "Bullish Reversal Signal",
    demoHeadShouldersTitle: "Head & Shoulders",
    demoHeadShouldersDesc: "Bearish Reversal Signal",
    analyzerNotesLabel: "Additional Questions (Optional):",
    analyzerNotesPlaceholder: "Example: 'Is this trend breakthrough valid?', 'What is a good target TP if I enter now?'...",
    analyzerBtn: "Analyze Chart Image",
    analyzerBtnLoading: "Processing Theoretical Analysis...",
    analyzerResultHeader: "Expert Analysis by Aksara",
    analyzerResultSub: "Structured breakdown from your technical analysis assistant.",
    analyzerDisclaimerHeader: "💡 FINANCIAL EDUCATION DISCLAIMER:",
    analyzerDisclaimerText: "This analysis is produced through automated image processing models. Always test and verify with our risk-free demo simulator before risking real hard-earned money.",
    analyzerEmptyHeader: "Ready to Receive Your Image",
    analyzerEmptyDesc: "Upload or drop a screenshot of a real bursa or financial chart on the left panel to trigger comprehensive structural AI reviews.",
    analyzerEmptyPrompt: "Look for the example preset buttons to see a quick demo!",
    statusLoaded: "Status: Image Loaded Successfully",
    changeImage: "Change Image",
    
    // Modal Welcome
    welcomeHeader: "Welcome to the Trading Academy!",
    welcomeSub: "Beginner trade guidance from zero to graduation",
    welcomeIntro: "Hello future trader! We provide an interactive simulator where you can **replay historical market prices (Gold, Bitcoin, & Forex) candle-by-candle**.",
    welcomePointHeader: "Here you are free to:",
    welcomePoint1: "Test strategies risk-free with a simulated balance of **$10,000**.",
    welcomePoint2: "Open BUY or SELL positions, set protective **Stop Losses (SL)**, and target **Take Profits (TP)** directly on the chart.",
    welcomePoint3: "Learn from our curriculum with interactive quiz questions to earn experience points.",
    welcomePoint4: "Consult in real-time with **AI Mentor Aksara** regarding active chart situations and portfolio journal histories!",
    welcomeStartBtn: "Enter School & Start Learning Now",
    
    // Educational Section
    studyProgress: "Learning Progress",
    studyFinishedUnits: "Units Completed",
    studyFinishedCertHeader: "Awesome!",
    studyFinishedCertText: "You have earned the **Virtual Trading Basics Graduation Certificate**! You are fully prepared to tackle backtests.",
    studyCurriculumHeader: "Path Curriculum",
    studyModuleLabel: "MODULE",
    studyLessonLabel: "Module Lessons:",
    quizHeader: "Learning Checkpoint Quiz (+50 XP)",
    quizSubmitBtn: "Submit Answer",
    quizPracticeHintHeader: "💡 Simulator Practice Hint:",
    quizPracticeHintText: "After reading this summary, head over to the **Replay Simulator** tab in the main header. Use the replay controls to advance prices candle-by-candle. Look for rejection candlesticks (like **Hammer**) and execute simulated BUY or SELL orders with high-disciplined Stop Loss parameters!",
    quizEmptyState: "Please select a lesson package from the left menu navigation to begin.",
    
    // Interactive Guide
    guideHeader: "Backtesting Simulator Practice Guide",
    guideIntro: "This system is curated to implement **Historical Replay Backtesting**, which is widely regarded as the single most effective way for novice traders to build chart reading proficiency.",
    guideStep1Header: "Step 1: Choose a Strategy in the Academy",
    guideStep1Text: "Open the **Trading School (0-100)** tab in the header menu. Here you'll absorb:",
    guideStep1Points: "How to read individual candelsticks (**Candlestick Anatomy**).,How to spot trending moves (**Uptrend, Downtrend, Sideways**).,Basic margin survival rules (**Stop Losses, Take Profits, and the 1:2 Ratio**).",
    guideStep2Header: "Step 2: Locate Entry Points on History Charts",
    guideStep2Text: "Switch over to the **Replay & Simulation** tab. Choose your preferred asset (e.g. Gold/XAU-USD). Use the play controls to run prices, and leverage S&R indicators to find key bounce zones.",
    guideStep3Header: "Step 3: Setup Simulated Orders (BUY or SELL)",
    guideStep3Text: "Determine your lot volume size (e.g. 0.1 lot). We strongly recommend trading with strict risk management by checking both Stop Loss and Take Profit guidelines.",
    guideStep4Header: "Step 4: Audit Performance with AI Companion",
    guideStep4Text: "In the right-side feedback column, **AI Mentor Aksara** is always online to support your journey. Ask him about your active trade setups!",
    guideFooterText: "Happy practicing, future trader! Trading mastery is purely a reward of consistent risk discipline.",
    guideStartBtn: "Switch to Simulator Tab",

    // Alerts
    alertAddSlTpError: "⚠️ You already have a live position running! Please close or wait for the existing position to settle before opening a new trade.",
    alertOpenPositionTitle: "🚀 POSITION OPENED SUCCESSFULLY",
    alertOpenPositionMsg: "Opened trade order **{type}** of **{lot}** lot at entry level {entryPrice}. Run or speed up the Replay system on the sidebar to follow the outcome!",
    alertTpTitle: "🎯 TARGET TAKE PROFIT HIT!",
    alertTpMsg: "Phenomenal! Your {type} position touched the TP target price-level at {exitPrice}. You secured a study profit of **+${tradePnl}**! Outstanding technical projection.",
    alertSlTitle: "🛑 STOP LOSS LEVEL TRIGGERED",
    alertSlMsg: "Your active {type} trade touched the protective SL bound at {exitPrice}. Settled with a disciplined study defense of **-${tradePnl}**. Wise move! Protecting capitals keeps you in the game.",
    alertResetTitle: "🔄 CHART REPLAY RESET",
    alertResetMsg: "Historical chart successfully rewound to the initial study window. You are fresh and ready for new backtesting runs.",
    confirmTimeframe: "Changing the chart timeframe now will reload the data flow and force-abort your running active position. Proceed?",
    confirmResetReplay: "Do you want to reset the candle playback index to the first 45 historical bars? Your open active trade will be terminated.",
    confirmResetBalance: "Are you sure you want to restore your simulated demo balance back to $10,000?"
  }
};
