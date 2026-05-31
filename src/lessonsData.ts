import { Module } from "./types";

export const educationalModules: Module[] = [
  {
    id: "m1",
    title: "Dasar Trading Terbimbing",
    icon: "TrendingUp",
    description: "Pondasi utama belajar pasar keuangan, instrumen trading, terminologi pips, lot, leverage, dan anatomi candlestick.",
    lessons: [
      {
        id: "l1_1",
        title: "Dunia Trading & Instrumennya",
        description: "Apa itu trading dan apa saja yang ditransaksikan di pasar keuangan?",
        content: `### Pengenalan Mentoring: Apa Itu Trading?

Trading secara sederhana adalah proses **membeli dan menjual instrumen keuangan** (seperti Forex, Emas, Kripto, atau Saham) dengan tujuan mendapatkan keuntungan dari selisih pergerakan harganya.

Berbeda dengan investasi jangka panjang yang menyimpan aset hingga bertahun-tahun, seorang trader memanfaatkan fluktuasi harga dalam kurun waktu harian, jam, bahkan menit.

#### Instrumen Populer di Pasar Keuangan:
1. **Forex (Foreign Exchange):** Pasar pertukaran mata uang global (misal: EUR/USD, GBP/USD). Likuiditasnya sangat tinggi (lebih dari $6 Triliun transaksi per hari!).
2. **Komoditas (Emas / XAUUSD):** Sering dikategorikan sebagai *safe-haven* yaitu aset perlindungan saat kondisi ekonomi atau geopolitik sedang tidak menentu.
3. **Kripto (Bitcoin / BTCUSD):** Aset digital yang beroperasi di jaringan terdesentralisasi. Terkenal karena volatilitas harganya yang sangat ekstrem namun menawarkan potensi keuntungan tinggi.

#### Memahami Konsep Esensial:
* **Bid & Ask:** *Bid* adalah harga beli terbaik yang ditawarkan oleh pasar, sedangkan *Ask* adalah harga jual terbaik yang ditawarkan. Selisih keduanya dinamakan **Spread** (biaya transaksi yang diambil oleh broker).
* **Leverage (Daya Ungkit):** Pinjaman dana dari broker agar Anda bisa bertransaksi dengan nilai kontrak yang jauh lebih besar dari modal asli Anda. Contoh rasio leverage **1:100** berarti bermodalkan $100 Anda bisa melakukan transaksi bernilai $10,000.
* **Lot & Volume:** Ukuran unit transaksi di pasar. Pada Forex standard 1 Lot mewakili 100,000 unit mata uang dasar. Pada Emas, 1 Lot umumnya mewakili 100 troy ounce emas.`,
        quiz: [
          {
            id: "q1_1_1",
            question: "Manakah pengertian di bawah ini yang paling tepat menggambarkan istilah 'Spread' dalam perdagangan?",
            options: [
              "Selisih harga pembuka (Open) dan harga penutup (Close) pada satu candlestick",
              "Selisih harga beli terbaik (Bid) dan harga jual terbaik (Ask)",
              "Jumlah modal minimal yang didepositokan ke broker",
              "Biaya penalti saat transaksi mengalami kerugian"
            ],
            correctOptionIndex: 1,
            explanation: "Spread adalah selisih antara harga penawaran beli (Bid) dan penawaran jual (Ask) yang ditetapkan oleh pasar/broker sebagai biaya transaksi trading."
          },
          {
            id: "q1_1_2",
            question: "Jika trader menggunakan leverage sebesar 1:100, apa pengaruhnya terhadap modal?",
            options: [
              "Kerugian trader dibatasi maksimal hanya sebesar 1%",
              "Trader bisa bertransaksi dengan nilai 100 kali lipat dari modal asli",
              "Trader dijamin menang dalam 100 transaksi pertama",
              "Akurasi sinyal trading meningkat sebesar 100%"
            ],
            correctOptionIndex: 1,
            explanation: "Leverage 1:100 berfungsi sebagai daya ungkit finansial yang memungkinkan trader mengontrol volume transaksi hingga 100 kali lipat dari jaminan modal (margin) yang disetorkan."
          }
        ]
      },
      {
        id: "l1_2",
        title: "Anatomi Candlestick",
        description: "Membaca bahasa visual pasar keuangan melalui grafik lilin Jepang.",
        content: `### Membaca Grafik Lilin (Candlestick Chart)

Grafik Candlestick pertama kali diciptakan oleh pedagang beras asal Jepang pada abad ke-18. Setiap candlestick menceritakan kisah pertarungan antara **pembeli (bulls)** dan **penjual (bears)** dalam periode waktu tertentu.

Setiap lilin tunggal memberikan 4 informasi penting:
1. **O (Open):** Harga pembuka periode tersebut.
2. **H (High):** Harga tertinggi yang pernah dicapai selama periode tersebut.
3. **L (Low):** Harga terendah yang pernah dicapai selama periode tersebut.
4. **C (Close):** Harga penutupan periode tersebut.

#### Visual Candlestick:
* **Bullish Candle (Hijau / Putih):** Harga ditutup **lebih tinggi** daripada saat pembukaan (\`Close > Open\`). Ini menandakan pembeli mendominasi pasar.
* **Bearish Candle (Merah / Hitam):** Harga ditutup **lebih rendah** daripada saat pembukaan (\`Close < Open\`). Ini menandakan penjual mendominasi pasar.

#### Bagian Tubuh Candlestick:
* **Body (Badan Lilin):** Bagian tebal di antara harga Open dan Close. Semakin panjang badannya, semakin kuat momentum dorongan harganya.
* **Wick / Shadow (Sumbu Lilin):** Garis tipis di atas dan di bawah badan. Ini mewakili penolakan harga (*rejection*). 
  * Sumbu atas yang panjang menandakan penjual berhasil menekan balik pembeli yang mencoba naik.
  * Sumbu bawah yang panjang menandakan pembeli berhasil mengangkat balik harga dari tekanan jatuh para penjual.`,
        quiz: [
          {
            id: "q1_2_1",
            question: "Apa arti dari sumbu bawah (lower shadow) yang sangat panjang pada sebuah candlestick bullish?",
            options: [
              "Tren secara absolut akan segera berbalik turun",
              "Terdapat penolakan kuat dari pembeli setelah harga ditarik turun oleh penjual",
              "Volume transaksi sedang menurun drastis",
              "Pasar didominasi sepenuhnya oleh penjual dari menit pertama hingga akhir"
            ],
            correctOptionIndex: 1,
            explanation: "Sumbu bawah yang panjang menggambarkan bahwa harga sempat ditekan turun oleh penjual (mencapai Low), namun berhasil ditarik naik kembali oleh dorongan beli yang kuat sebelum candle ditutup."
          }
        ]
      }
    ]
  },
  {
    id: "m2",
    title: "Tren & Struktur Pasar",
    icon: "Compass",
    description: "Keterampilan mengidentifikasi ke mana arah pasar bergerak dan menentukan zona transaksi strategis.",
    lessons: [
      {
        id: "l2_1",
        title: "Identifikasi Tren (Trend Is Your Friend)",
        description: "Menghindari kerugian konyol dengan selalu trading searah arus pasar.",
        content: `### Mengenali Arah Tren Pasar

Tren menggambarkan arah umum perjalanan harga. Bermain melawan tren (*counter-trend*) bagi pemula diibaratkan seperti berdiri di rel menghadang kereta cepat. Ada tiga fase utama di dalam pasar:

1. **Uptrend (Tren Naik):**
   Harga membentuk puncak yang lebih tinggi (**Higher High - HH**) dan lembah yang juga lebih tinggi (**Higher Low - HL**). Di fase ini, trader sebaiknya hanya mencari peluang **BUY**.
   
2. **Downtrend (Tren Turun):**
   Harga membentuk puncak yang lebih rendah (**Lower High - LH**) dan lembah yang juga lebih rendah (**Lower Low - LL**). Di fase ini, trader sebaiknya hanya mencari peluang **SELL**.
   
3. **Sideways / Ranging (Datar):**
   Harga bergerak di dalam kotak horizontal terbatas, memantul di antara rentang puncak dan lembah yang setara. Transaksi dapat dilakukan dengan memantul di batas-batas tersebut atau menunggu ledakan breakout.

> **Pesan Mentor:** Selalu zoom out grafik Anda untuk melihat tren di jangka waktu (*timeframe*) yang lebih besar (seperti 4 jam atau harian) guna menghindari jebakan noise jangka pendek.`,
        quiz: [
          {
            id: "q2_1_1",
            question: "Bagaimanakah struktur pembentukan pasar yang sedang berada dalam fase Uptrend?",
            options: [
              "Membentuk Lower Low (LL) diikuti Higher Low (HL)",
              "Membentuk puncak yang lebih tinggi (Higher High) dan lembah yang lebih tinggi (Higher Low)",
              "Bentuk candle hanya berwarna hijau terus menerus tanpa ada sumbu",
              "Harga berada dalam rentang sempit horizontal secara konsisten"
            ],
            correctOptionIndex: 1,
            explanation: "Definisi teknis dari tren naik (uptrend) yang sehat adalah ketika pergerakan harga membentuk serangkaian puncak yang lebih tinggi (HH) dan lembah yang juga lebih tinggi (HL)."
          }
        ]
      },
      {
        id: "l2_2",
        title: "Support & Resistance (S&R)",
        description: "Menentukan lantai dan atap psikologis harga di pasar.",
        content: `### Rahasia Klasik: Support & Resistance

Support dan Resistance adalah level-level kritis di dalam grafik di mana harga cenderung berbalik arah atau menemui rintangan.

#### 1. Support (Lantai Harga)
Level horizontal di bawah harga saat ini di mana minat beli diperkirakan cukup besar untuk mengatasi tekanan jual. Ketika harga turun menyentuh Support, pembeli biasanya masuk ke pasar, menahan harga agar tidak jatuh lebih dalam.

#### 2. Resistance (Atap Harga)
Level horizontal di atas harga saat ini di mana minat jual diperkirakan cukup kuat untuk menandingi daya beli. Ketika harga merangkak naik mendekati Resistance, penjual mulai melepas posisi sehingga harga sulit melintas ke atas.

#### Aturan Penting: S&R Saling Bertukar Peran
* **SBR (Support Become Resistance):** Jika harga berhasil menembus (*breakout*) lantai Support ke bawah, maka bekas lantai tersebut akan berubah fungsi menjadi atap Resistance baru saat harga kembali memantul naik (*retest*).
* **RBS (Resistance Become Support):** Sebaliknya, jika atap Resistance dijebol ke atas, zona tersebut sering kali menjadi lantai Support baru ketika harga melakukan koreksi turun.`,
        quiz: [
          {
            id: "q2_2_1",
            question: "Apa yang terjadi apabila level Resistance yang kuat berhasil ditembus (breakout) oleh harga ke arah atas?",
            options: [
              "Level resistance tersebut otomatis hancur dan tidak berguna selamanya",
              "Level tersebut berpotensi berubah peran menjadi level Support baru di masa depan",
              "Harga pasti akan langsung terjun bebas seketika",
              "Aktivitas perdagangan di pasar dihentikan sementara secara sepihak"
            ],
            correctOptionIndex: 1,
            explanation: "Berdasarkan prinsip RBS (Resistance Become Support), bekas level resistance yang berhasil dijebol ke atas sering kali berubah sifat menjadi level pertahanan/support baru ketika harga kembali menguji level tersebut."
          }
        ]
      }
    ]
  },
  {
    id: "m3",
    title: "Senjata Indikator & Pola",
    icon: "BarChart2",
    description: "Mengoptimalkan indikator rata-rata pergerakan harga dan osilator momentum untuk menemukan peluang.",
    lessons: [
      {
        id: "l3_1",
        title: "Moving Average (MA) & RSI",
        description: "Mempelajari alat sensor tren dan pengukur kejenuhan harga pasar.",
        content: `### Alat Bantu Analisis: Indikator Teknikal

Indikator teknis adalah formula matematis yang menghitung data historis harga untuk memberikan visualisasi tren atau momentum.

#### 1. Moving Average (MA) / Rata-rata Bergerak
Indikator penunjuk arah tren dengan menghaluskan gejolak harga harian.
* **MA di atas harga:** Berfungsi sebagai resistensi dinamis (menandakan tren turun / Bearish).
* **MA di bawah harga:** Berfungsi sebagai support dinamis (menandakan tren naik / Bullish).
* **Persilangan (Crossover):** Ketika MA jangka pendek memotong MA jangka panjang ke atas, sering dianggap sebagai sinyal beli (*Golden Cross*).

#### 2. Relative Strength Index (RSI)
Indikator osilator pengukur kekuatan momentum dengan skala 0 hingga 100.
* **Overbought (> 70):** Pasar dianggap sudah terlalu jenuh beli. Harga naik terlalu cepat dan rentan mengalami koreksi turun atau aksi ambil untung (*profit taking*).
* **Oversold (< 30):** Pasar dianggap sudah terlalu jenuh jual. Harga turun terlalu tajam dan siap-siap melambung kembali karena pembeli mulai melirik harga murah.`,
        quiz: [
          {
            id: "q3_1_1",
            question: "Bila garis RSI di grafik berada di atas angka 75, indikasi teknis apa yang dipancarkan?",
            options: [
              "Harga sangat murah dan harus segera melakukan aksi BUY tanpa ragu",
              "Pasar berada dalam kondisi Overbought (Jenuh Beli), waspadai potensi koreksi turun",
              "Pasar telah ditutup dan libur akhir pekan dimulai",
              "Tren turun sedang berada pada puncaknya"
            ],
            correctOptionIndex: 1,
            explanation: "Nilai RSI di atas 70 menunjukkan kondisi jenuh beli (Overbought), mengisyaratkan bahwa kenaikan harga sudah dinilai terlalu cepat dan berisiko jenuh, sehingga rentan terjadi pembalikan atau penurunan."
          }
        ]
      },
      {
        id: "l3_2",
        title: "Pola Reversal Candlestick",
        description: "Menemukan pola-pola konfirmasi pembalikan harga yang akurat.",
        content: `### Pola Candlestick Pembalikan Arah (Reversal)

Sebelum membuka transaksi, trader profesional menunggu pemicu berupa pola candle tertentu di zona S&R. Tiga pola paling kuat di antaranya:

1. **Pinbar / Hammer:**
   Badan kecil di bagian atas dengan sumbu bawah yang sangat panjang (menyerupai palu). Pola ini di level support mengindikasikan dominasi beli mendadak setelah tekanan jual yang ekstrem berakhir.

2. **Bullish & Bearish Engulfing:**
   * **Bullish Engulfing:** Candle hijau berbadan besar yang menelan seluruh badan candle merah sebelumnya. Menandakan perputaran kendali sepenuhnya ke tangan pembeli.
   * **Bearish Engulfing:** Candle merah berbadan raksasa menelan habis candle hijau hari sebelumnya. Isyarat kuat harga siap meluncur turun.

3. **Doji:**
   Candle yang harga Open dan Close-nya hampir sama persis (berbentuk tanda tambah atau silang). Ini mencerminkan keraguan ekstrem pasar, di mana pembeli dan penjual sama kuat. Terbentuknya Doji di puncak tren sering merupakan awal dari pembalikan tren.`,
        quiz: [
          {
            id: "q3_2_1",
            question: "Bagaimanakah bentuk visual dari pola candle 'Hammer' (Palu) yang valid?",
            options: [
              "Badan candle sangat panjang tanpa sumbu sedikit pun",
              "Dua buah candle kecil sejajar horizontal",
              "Badan berukuran kecil di bagian atas dengan ekor/sumbu bawah yang panjang minimal dua kali ukuran badannya",
              "Candle silang tipis dengan sumbu atas bawah yang sama rata panjangnya"
            ],
            correctOptionIndex: 2,
            explanation: "Candle Hammer (Palu) diidentifikasi dengan badan realistis kecil di atas dan sumbu bawah panjang menjuntai (penolakan penurunan) minimal dua hingga tiga kali lipat ukuran badan lilinnya."
          }
        ]
      }
    ]
  },
  {
    id: "m4",
    title: "Seni Manajemen Risiko",
    icon: "ShieldAlert",
    description: "Kunci utama bertahan hidup di pasar finansial. Tanpa bab ini, akun trading Anda pasti akan terkuras habis.",
    lessons: [
      {
        id: "l4_1",
        title: "Konsep SL, TP & Rasio Profit",
        description: "Belajar mengatur rem dan target di setiap transaksi Anda.",
        content: `### Disiplin Manajemen Risiko: Tameng Trader

Banyak pemula gagal bukan karena salah menganalisis arah pasar, melainkan karena **tidak memiliki rem pengaman**. Di pasar keuangan, Anda harus selalu berasumsi bahwa analisis Anda bisa saja keliru.

#### Tiga Pilar Manajemen Posisi:
1. **Stop Loss (SL) - Rem Pengaman:**
   Perintah otomatis untuk menutup transaksi yang merugi pada harga tertentu. SL membatasi kerugian Anda sehingga jika pasar bergejolak ekstrem melawan posisi Anda, modal Anda tidak tergerak habis (*Margin Call*).

2. **Take Profit (TP) - Target Keuntungan:**
   Perintah otomatis menutup transaksi saat target profit tercapai. Ini memastikan Anda mengunci keuntungan sebelum arah harga berbalik arah.

3. **Rasio Risk-to-Reward (R:R Ratio):**
   Perbandingan kerugian maksimal dibandingkan potensi keuntungan. 
   * Contoh: R:R = **1:2** berarti untuk setiap kerugian $10 yang siap Anda ambil (SL), Anda menargetkan keuntungan $20 (TP).
   * **Keajaiban Matematika:** Dengan rasio 1:2 yang konsisten, Anda hanya membutuhkan akurasi transaksi **40%** untuk tetap menjadi trader yang menghasilkan profit secara bulanan!

#### Rumus Posisi yang Sehat:
Jangan mempertaruhkan lebih dari **1% - 2%** dari total saldo akun Anda dalam satu transaksi tunggal.`,
        quiz: [
          {
            id: "q4_1_1",
            question: "Andi memiliki saldo $10,000. Sesuai aturan manajemen risiko profesional maksimal pertaruhan 1% per posisi, berapa nominal maksimal kerugian Andi jika posisi terkena Stop Loss?",
            options: [
              "$1,000",
              "$500",
              "$100",
              "$10"
            ],
            correctOptionIndex: 2,
            explanation: "1% dari saldo $10,000 = $100. Disiplin membatasi kerugian maksimal $100 per posisi melindungi trader dari gulung tikar meski mengalami rugi berturut-turut."
          },
          {
            id: "q4_1_2",
            question: "Mengapa menggunakan Rasio Risk-to-Reward (R:R) minimal 1:2 sangat menguntungkan trader?",
            options: [
              "Karena membuat kursor trading Anda bergerak otomatis ke target",
              "Sebab memperbesar peluang profit berkali-kali lipat tanpa batasan",
              "Memungkinkan akun trader tetap profitable (tumbuh positif) meskipun tingkat kemenangan (win rate) transaksi di bawah 50%",
              "Membebaskan trader dari biaya komisi atau bunga inap broker"
            ],
            correctOptionIndex: 2,
            explanation: "Dengan rasio 1:2, keuntungan dari transaksi yang menang melipatgandakan kerugian dari transaksi yang kalah. Bahkan dengan winrate 40%, 4 transaksi menang ($80) dikurangi 6 transaksi kalah ($60) menyisakan profit bersih sebesar $20!"
          }
        ]
      }
    ]
  }
];

export const educationalModulesEN: Module[] = [
  {
    id: "m1",
    title: "Guided Trading Foundations",
    icon: "TrendingUp",
    description: "The primary foundation of understanding financial markets, trading assets, pips, lots, leverage, and candlestick anatomy.",
    lessons: [
      {
        id: "l1_1",
        title: "Trading Universe & Instruments",
        description: "What constitutes financial trading and what exactly is exchanged in these global markets?",
        content: `### Mentorship Intro: What is Trading?

Trading at its core is simply the **act of buying and selling financial assets** (such as Forex, Gold, Crypto, or Stocks) to pocket a profit from price fluctuation differentials.

Unlike traditional long-term investing where assets are held for years, active traders aim to leverage price changes over days, hours, or even minutes.

#### Highly Populated Asset Classes:
1. **Forex (Foreign Exchange):** Currencies traded globally in pairs (e.g., EUR/USD, GBP/USD). It boasts ultra-high liquidity (exceeding $6 Trillion daily volume!).
2. **Commodities (Gold / XAUUSD):** Frequently recognized as a *safe-haven* shelter during geopolitical or macroeconomic stress.
3. **Crypto (Bitcoin / BTCUSD):** Digital assets in dynamic decentralized networks. Celebrated for extreme volatility with spectacular high-growth capabilities.

#### Vital Core Terminologies:
* **Bid & Ask:** *Bid* represents the best available market buy price, whereas *Ask* constitutes the best available sell price. The distance between them is the **Spread** (the broker's structural operational fee).
* **Leverage (Financial Leverage):** Broker-issued virtual buffers letting you negotiate contract sizes vastly larger than your capital base. A **1:100** leverage ratio facilitates controlling $10,000 using merely $100.
* **Lots & Margins:** Volume measures. 1 Standard Lot in Forex signifies 100,000 units of base currency. In Gold, it represents 100 troy ounces.`,
        quiz: [
          {
            id: "q1_1_1",
            question: "Which definition below best describes 'Spread' in active trading?",
            options: [
              "The distance between Open and Close candlestick values",
              "The spread/differential between the best Bid price and Ask price",
              "Minimum required account reload volume",
              "Special liquidation commissions levied on losses"
            ],
            correctOptionIndex: 1,
            explanation: "Spread is defined as the structural pricing difference between the prevailing Bid (buy offer) and Ask (sell offer) rates of the market."
          },
          {
            id: "q1_1_2",
            question: "When selecting a 1:100 leverage ratio, what influence does it exert on a trader's margin?",
            options: [
              "Limits your systemic risk to exactly 1%",
              "Empowers you to command trading power up to 100 times your collateral",
              "Grants 100% successful win rate on your initial trades",
              "Vastly accelerates standard indicator accuracies"
            ],
            correctOptionIndex: 1,
            explanation: "Leverage functions as a financial multiplier, enabling traders to control positions valued at 100x their deposited collateral margin."
          }
        ]
      },
      {
        id: "l1_2",
        title: "Candlestick Anatomy",
        description: "Decrypting the visual language of the markets through classic Japanese candle structures.",
        content: `### Reading visual Candlesticks

Introduced in the 18th century by Japanese rice merchants, candlesticks are visual battle representations tracing struggle indicators between **Buyers (Bulls)** and **Sellers (Bears)**.

Each candle contains 4 central metrics:
1. **O (Open):** Period introductory pricing.
2. **H (High):** Reached peak price point.
3. **L (Low):** Reached floor price point.
4. **C (Close):** Period final ending rate.

#### Visual Formats:
* **Bullish Candle (Green):** Assets ended **above** open rate (\`Close > Open\`). Sellers were overpowered by bulls.
* **Bearish Candle (Red):** Assets settled **below** opening rate (\`Close < Open\`). Bears dominated market direction.

#### Major Components:
* **Body:** The thick rectangular sector mapping the path from Open to Close. More extensive bodies reveal elevated buying/selling momentum.
* **Wicking Shadows:** Delicate vertical pins above and below the body. These present price **Rejections**.
  * Extending upper wicks reflect prompt seller responses pushing prices down from highs.
  * Deep lower shadows indicate persistent buyer actions recovering prices from low points.`,
        quiz: [
          {
            id: "q1_2_1",
            question: "What does an incredibly long lower shadow (wick) indicate on a bullish candle near support?",
            options: [
              "An absolute confirmation of a crash",
              "Substantial buying rejection after sellers attempted to drop rates",
              "Dramatically falling market volume metrics",
              "Complete seller dominance throughout the period"
            ],
            correctOptionIndex: 1,
            explanation: "An extended lower shadow displays that although sellers drove prices down, bulls vigorously bought the dip, raising rates before close."
          }
        ]
      }
    ]
  },
  {
    id: "m2",
    title: "Market Trends & Structure",
    icon: "Compass",
    description: "Learn to trace general market trends and identify high-probability trading boundaries.",
    lessons: [
      {
        id: "l2_1",
        title: "Spotting Market Trends",
        description: "Improve trade performance by aligning your orders with major market currents.",
        content: `### Recognizing general Market Trends

'The Trend is Your Friend.' Counter-trend trading without proper structure is highly risky. Market trends generally occupy 1 of 3 phases:

1. **Uptrend (Bull Market):**
   Characteristics include sequential high peaks (**Higher Highs - HH**) and high valley floors (**Higher Lows - HL**). Focus intensely on **BUY** opportunities.
   
2. **Downtrend (Bear Market):**
   Characterized by declining peaks (**Lower Highs - LH**) and declining floors (**Lower Lows - LL**). Focus intensely on **SELL** opportunities.
   
3. **Sideways / Range Limit:**
   Consolidated horizontal bounce bounds where prices oscillate within clear support and resistance coordinates.

> **Mentor Advice:** Always step back and view higher timeframes (such as 4H or 1D) to escape short-term noise channels before mapping entries.`,
        quiz: [
          {
            id: "q2_1_1",
            question: "What is the structural signature of a healthy Uptrend?",
            options: [
              "A series of Lower Lows (LL) followed by Lower Highs",
              "A structural sequence of Higher Highs (HH) and Higher Lows (HL)",
              "Strictly consecutive green candles with zero shadows",
              "Prolonged horizontal price stabilization"
            ],
            correctOptionIndex: 1,
            explanation: "Uptrends are defined by consecutive Higher High peaks and Higher Low valley formations, indicating continuous buying demand."
          }
        ]
      },
      {
        id: "l2_2",
        title: "Support & Resistance (S&R)",
        description: "Mapping the horizontal psychological floors and ceilings of global assets.",
        content: `### Understanding Support & Resistance

Support and Resistance are horizontal boundaries where price rates tend to stall or bounce back.

#### 1. Support (The Floor)
Key structural horizontal level below current prices where intense buying demand stops prices from falling further.

#### 2. Resistance (The Ceiling)
Key structural horizontal level above current prices where strong selling supply is expected to turn prices downward.

#### Core Principle: Role Reversals
* **SBR (Support Become Resistance):** When support gets broken downwards, it frequently matures into an active resistance ceiling upon future tests.
* **RBS (Resistance Become Support):** When resistance gets broken upwards, it frequently converts into a strong support floor on future corrective pullbacks.`,
        quiz: [
          {
            id: "q2_2_1",
            question: "What commonly occurs when a strong historic Resistance level is decisively broken upward?",
            options: [
              "It ceases to exist or serve any technical function",
              "It is highly likely to function as a new Support floor during subsequent retracements",
              "Prices are guaranteed to crash instantaneously",
              "Asset operations are halted on global boards"
            ],
            correctOptionIndex: 1,
            explanation: "Per the RBS (Resistance Become Support) guideline, broken resistance ceilings frequently offer reliable support floors when tested again from above."
          }
        ]
      }
    ]
  },
  {
    id: "m3",
    title: "Indicators & Candlestick Patterns",
    icon: "BarChart2",
    description: "Empower your chart reads using core Moving Averages, RSI oscillations, and high-probability patterns.",
    lessons: [
      {
        id: "l3_1",
        title: "Moving Averages (MA) & RSI",
        description: "Examine mechanical trend-trackers and price boundary oscillators.",
        content: `### Technical Analysis: Built-in Indicators

Indicators process past price computations to highlight trends, momentums, or impending reversals.

#### 1. Moving Averages (MA)
Smooth price data to illuminate underlying directional trends.
* **MA above price:** Represents dynamic resistance (Bearish indicator).
* **MA below price:** Represents dynamic support (Bullish indicator).
* **Crossovers:** A short-term MA crossing above a long-term MA triggers buying interest, widely termed as a *Golden Cross*.

#### 2. Relative Strength Index (RSI)
A momentum oscillator scaled between 0 and 100.
* **Overbought (> 70):** Indicates markets may be overextended upwards due to aggressive buying, suggesting possible corrective pullbacks.
* **Oversold (< 30):** Indicates rates are oversold due to heavy selling, presenting discounted value buy targets.`,
        quiz: [
          {
            id: "q3_1_1",
            question: "If the RSI indicator prints above 75, what technical signal does it convey?",
            options: [
              "The asset is exceptionally cheap and you should immediately BUY",
              "The market is Overbought, signaling potential downside corrections",
              "The currency exchange operations are closed",
              "The bearish structural trend is picking up speed"
            ],
            correctOptionIndex: 1,
            explanation: "An RSI over 70 highlights Overbought conditions, meaning the buying surge is overextended and could invite profit-taking pullbacks."
          }
        ]
      },
      {
        id: "l3_2",
        title: "Reversal Candle Formations",
        description: "Harness structural high-impact confirmations near key zones.",
        content: `### Powerful Candlestick Reversal Formations

Before launching entries, wait for specific candle formations to confirm reversals at key S&R boundaries.

1. **The Hammer / Pinbar:**
   Features a tiny body at the top paired with an elongated lower shadow. Located at support, it confirms strong buying rejection of lower values.

2. **Engulfing Patterns:**
   * **Bullish Engulfing:** A large green body that completely eats/engulfs the previous red candle's body, showing a surge in buyers.
   * **Bearish Engulfing:** A large red body that completely overwhelms the preceding green candle, signaling a shift in control to sellers.

3. **Doji Star:**
   Occurs when Open and Close prints are nearly identical, creating a cross. This signifies severe market indecision. A Doji forming at trend peaks often precedes reversals.`,
        quiz: [
          {
            id: "q3_2_1",
            question: "How is a valid 'Hammer' candlestick visually identified?",
            options: [
              "An extremely long body with absolutely no wicks",
              "Two tiny identical horizontal bars side by side",
              "A small body at the top with a lower shadow at least twice its body length",
              "A perfect symmetrical cross with identical shadows"
            ],
            correctOptionIndex: 2,
            explanation: "A valid Hammer candlestick features a tiny upper body and a long lower shadow that is at least twice the size of the body, indicating strong downside price rejection."
          }
        ]
      }
    ]
  },
  {
    id: "m4",
    title: "Capital Risk Administration",
    icon: "ShieldAlert",
    description: "The absolute law of trading survival. Master this block to prevent capital depletion.",
    lessons: [
      {
        id: "l4_1",
        title: "SL, TP & Risk-to-Reward Ratios",
        description: "Learn how to establish shields and profit targets systematically.",
        content: `### Risk Management: The Trader's Ultimate Shield

Many novice traders fail not because of inaccurate market analysis, but due to a **lack of systematic risk management**. Treat every trade assuming your thesis could be wrong.

#### The Three Core Pillars of Position Management:
1. **Stop Loss (SL) - The Safety Shield:**
   An automated target price that cuts losing trades short, preserving your capital from severe market swings.
2. **Take Profit (TP) - The Harvest Target:**
   An automated target rate that locks in profits when your target price is reached, securing gains before market reversals.
3. **Risk-to-Reward (R:R) Ratio:**
   A metric comparing potential risk against potential reward.
   * An R:R ratio of **1:2** means for every $10 risked (SL), you target a profit of $20 (TP).
   * **The Math Advantage:** With a consistent 1:2 R:R ratio, you only need a **40% win rate** to remain consistently profitable over time.

#### Standard Sizing Rule:
Never risk more than **1% to 2%** of your total account balance on a single trade.`,
        quiz: [
          {
            id: "q4_1_1",
            question: "If a trader with a $10,000 balance strictly risks 1% per setup, what is the maximum dollar loss if the Stop Loss is hit?",
            options: [
              "$1,000",
              "$500",
              "$100",
              "$10"
            ],
            correctOptionIndex: 2,
            explanation: "1% of a $10,000 balance equals $100. Restricting risk to $100 per position protects traders from ruin during inevitable consecutive losses."
          },
          {
            id: "q4_1_2",
            question: "Why is implementing a minimum 1:2 Risk-to-Reward ratio highly advantageous?",
            options: [
              "It automates your trading cursor to hit targets",
              "It guarantees unlimited profit gains with no capital restrictions",
              "It keeps an account profitable even with a win rate below 50%",
              "It eliminates broker commissions and dynamic rollover interest fees"
            ],
            correctOptionIndex: 2,
            explanation: "With a 1:2 R:R ratio, winning trades yield twice as much as losing trades. Even with a 40% win rate, 4 wins ($80) minus 6 losses ($60) yields a net profit of $20."
          }
        ]
      }
    ]
  }
];

