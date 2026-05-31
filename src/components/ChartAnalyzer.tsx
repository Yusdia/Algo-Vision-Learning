import React, { useState, useRef } from "react";
import { 
  Upload, 
  Sparkles, 
  FileImage, 
  Lightbulb, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  ArrowRight, 
  AlertCircle,
  HelpCircle,
  CornerDownRight
} from "lucide-react";
import { Language, translations } from "../translations";

interface ChartAnalyzerProps {
  language: Language;
}

export const ChartAnalyzer: React.FC<ChartAnalyzerProps> = ({ language }) => {
  const t = translations[language];

  const [image, setImage] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick Demo Image assets or placeholders
  const handleSelectDemo = (preset: "double_bottom" | "head_shoulders") => {
    setSelectedDemo(preset);
    setErrorText(null);
    if (preset === "double_bottom") {
      setImage("DEMO_DOUBLE_BOTTOM");
      setNotes(
        language === "ID"
          ? "Saya mendeteksi pola pembalikan arah di support emas ($2,300), apakah titik pantulan ini valid?"
          : "I detected a double bottom reversal pattern at the gold support level ($2,300). Is this bounce confirmation valid?"
      );
    } else {
      setImage("DEMO_HEAD_SHOULDERS");
      setNotes(
        language === "ID"
          ? "Ini terjadi d puncak uptrend, apakah garis leher di $103.20 akan tertembus kuat?"
          : "This occurs at the peak of an uptrend. Will the neckline around $103.20 be broken down decisively?"
      );
    }
  };

  const clearAll = () => {
    setImage(null);
    setNotes("");
    setAnalysisResult(null);
    setErrorText(null);
    setSelectedDemo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Convert File object to base64 encoding string
  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorText(
        language === "ID"
          ? "Format file tidak didukung. Harap unggah file gambar (PNG, JPG, WebP)."
          : "Unsupported file format. Please upload an image file (PNG, JPG, WebP)."
      );
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErrorText(
        language === "ID"
          ? "Ukuran gambar terlalu besar. Maksimal batas unggahan adalah 8MB."
          : "Image size is too large. Maximum size limit is 8MB."
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setSelectedDemo(null);
      setErrorText(null);
    };
    reader.onerror = () => {
      setErrorText(
        language === "ID" ? "Gagal membaca file gambar Anda." : "Failed to open and read your image file."
      );
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const triggerUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setErrorText(null);

    // Prepare JSON payload
    const payload = {
      image: image.startsWith("DEMO_") ? null : image,
      notes,
      demoPreset: selectedDemo,
      language // Pass language parameter to API to get translated output
    };

    try {
      const response = await fetch("/api/analyze-chart-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          language === "ID"
            ? "Gagal mengirimkan gambar analisis ke server."
            : "Failed to dispatch chart analytical payload."
        );
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysisResult(data.analysis);
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || (language === "ID" ? "Terdapat kendala koneksi." : "Connection timeout."));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-slate-100 select-text">
      
      {/* LEFT SECTION: Image Input and Options (Col-5) */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3 text-left">
            <h3 className="text-sm font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>{t.analyzerHeader}</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">{t.analyzerSub}</p>
          </div>

          {/* Drap & Drop / Upload area */}
          {!image ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerUploadClick}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] ${
                isDragging 
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-300" 
                  : "border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/60"
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
              <div className="p-3.5 bg-slate-900 border border-slate-800/80 rounded-2xl mb-3 text-slate-400">
                <Upload className="w-6 h-6 text-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs font-bold text-slate-200">{t.dropText}</p>
              <p className="text-[10px] text-slate-400 mt-1">{t.orBrowse}</p>
              <div className="mt-4 flex items-center gap-1 text-[9px] bg-slate-900 px-2 py-0.8 rounded text-slate-400 border border-slate-850">
                <FileImage className="w-3 h-3 text-emerald-500" />
                <span>{t.supportedFormats}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/80 aspect-video flex items-center justify-center">
                {image.startsWith("DEMO_") ? (
                  <div className="p-6 text-center space-y-2">
                    <FileImage className="w-10 h-10 text-amber-500 mx-auto" />
                    <p className="text-xs font-bold text-slate-200">
                      {selectedDemo === "double_bottom" ? `📊 ${t.demoDoubleBottomTitle}` : `📊 ${t.demoHeadShouldersTitle}`}
                    </p>
                    <p className="text-[9px] text-slate-400">
                      {language === "ID" ? "Gambar simulasi telah dimurnikan untuk latihan." : "Pre-loaded clean practice simulation image."}
                    </p>
                  </div>
                ) : (
                  <img 
                    src={image} 
                    alt="Uploaded chart preview" 
                    className="w-full h-full object-contain"
                  />
                )}
                
                <button
                  type="button"
                  onClick={clearAll}
                  className="absolute top-2.5 right-2.5 p-1 bg-slate-950/90 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-full border border-slate-800 shadow"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex justify-between items-center text-[10px] text-slate-400 pl-1 ">
                <span>{t.statusLoaded}</span>
                <button onClick={clearAll} className="text-rose-400 font-semibold hover:underline flex items-center gap-0.5">
                  <RefreshCw className="w-3 h-3" /> {t.changeImage}
                </button>
              </div>
            </div>
          )}

          {/* Quick Study Presets (Demos) */}
          <div className="space-y-2 pt-1 border-t border-slate-800/60 text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400 block pb-1">{t.demoHeader}</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectDemo("double_bottom")}
                className={`flex flex-col text-left p-2 rounded-xl border transition-all ${
                  selectedDemo === "double_bottom"
                    ? "bg-amber-500/10 border-amber-500/60 text-amber-300"
                    : "bg-slate-950/30 border-slate-850 text-slate-400 hover:border-slate-850 hover:bg-slate-950/50"
                }`}
              >
                <span className="text-[10px] font-bold">{t.demoDoubleBottomTitle}</span>
                <span className="text-[8px] opacity-75 mt-0.5">{t.demoDoubleBottomDesc}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemo("head_shoulders")}
                className={`flex flex-col text-left p-2 rounded-xl border transition-all ${
                  selectedDemo === "head_shoulders"
                    ? "bg-violet-500/10 border-violet-500/60 text-violet-300"
                    : "bg-slate-950/30 border-slate-850 text-slate-400 hover:border-slate-850 hover:bg-slate-950/50"
                }`}
              >
                <span className="text-[10px] font-bold">{t.demoHeadShouldersTitle}</span>
                <span className="text-[8px] opacity-75 mt-0.5">{t.demoHeadShouldersDesc}</span>
              </button>
            </div>
          </div>

          {/* Custom user prompt / notes */}
          <div className="space-y-1.5 pt-1 border-t border-slate-800/60 text-left">
            <label className="text-[10px] font-bold uppercase text-slate-415 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.analyzerNotesLabel}</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.analyzerNotesPlaceholder}
              rows={3}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-emerald-500 transition-all resize-none"
            />
          </div>

          <button
            type="button"
            disabled={!image || isAnalyzing}
            onClick={handleAnalyze}
            className={`w-full py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-lg border-b-4 ${
              !image || isAnalyzing
                ? "bg-slate-800 text-slate-500 border-slate-900 cursor-not-allowed opacity-50"
                : "bg-emerald-500 hover:bg-emerald-600 text-slate-950 border-emerald-700 active:scale-[0.98]"
            }`}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>{t.analyzerBtnLoading}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span>{t.analyzerBtn}</span>
              </>
            )}
          </button>

          {errorText && (
            <div className="bg-rose-950/70 border border-rose-500/30 p-3 rounded-xl flex items-start gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <p className="leading-snug text-left">{errorText}</p>
            </div>
          )}
        </div>

        {/* Tip area */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-2.5">
          <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-left text-[10px] text-slate-400 leading-normal">
            {language === "ID" ? (
              <>
                <span className="font-bold text-amber-400 uppercase">Bagaimana cara mengambil screenshot?</span> Tekan **PrtScn** atau **Windows+Shift+S** (Mac: **Cmd+Shift+4**) pada platform trading Anda (seperti TradingView, MetaTrader, atau chart bursa), gunakan tombol salin, lalu tempel atau simpan untuk diunggah di panel ini!
              </>
            ) : (
              <>
                <span className="font-bold text-amber-400 uppercase">How to command a screenshot?</span> Tap **PrtScn** or **Windows+Shift+S** (Mac: **Cmd+Shift+4**) inside TradingView, MetaTrader or other bursa structures. Paste or drag the assets on this frame trigger!
              </>
            )}
          </div>
        </div>

      </div>

      {/* RIGHT SECTION: Expert Analytical Dashboard (Col-7) */}
      <div className="lg:col-span-7 flex flex-col h-full min-h-[460px]">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-full flex-grow">
          
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">{t.analyzerResultHeader}</h3>
                <p className="text-[10px] text-slate-400">{t.analyzerResultSub}</p>
              </div>
            </div>

            {analysisResult && (
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                <span>{language === "ID" ? "Analisa Selesai" : "Analysis Ready"}</span>
              </span>
            )}
          </div>

          {/* Core Content Body */}
          <div className="flex-grow mt-4 min-h-[300px] flex flex-col justify-between">
            {isAnalyzing ? (
              <div className="flex-grow flex flex-col items-center justify-center p-10 text-center space-y-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border-4 border-slate-800 border-t-emerald-500 animate-spin" />
                  <Sparkles className="w-6 h-6 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                
                <div className="max-w-xs space-y-2">
                  <p className="text-xs font-black text-slate-200 uppercase tracking-widest animate-pulse">
                    {language === "ID" ? "Menghubungkan Peta Otak AI" : "Connecting Neural Networks"}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    {language === "ID" 
                      ? "Mendeteksi sumbu lilin (shadow), garis moving average, volume tren, dan zona support resistance secara real-time..."
                      : "Trigging pixel matrices, identifying candle wicks, EMA lines, volume bounds, and S&R pivot regions..."
                    }
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-1.5 w-full max-w-sm pt-4">
                  <div className="border border-slate-850 bg-slate-950/40 p-2 rounded-xl text-center">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block mr-1" />
                    <span className="text-[8px] text-slate-400">{language === "ID" ? "Pembacaan Piksel" : "Pixel Parsing"}</span>
                  </div>
                  <div className="border border-slate-850 bg-slate-950/40 p-2 rounded-xl text-center">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block mr-1" />
                    <span className="text-[8px] text-slate-400">{language === "ID" ? "Pencorakan Pola" : "Boundary Tracing"}</span>
                  </div>
                  <div className="border border-slate-850 bg-slate-950/40 p-2 rounded-xl text-center">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block mr-1 animate-pulse" />
                    <span className="text-[8px] text-slate-300">{language === "ID" ? "Formulasi Sinyal" : "Signal Synthesis"}</span>
                  </div>
                </div>
              </div>
            ) : analysisResult ? (
              <div className="space-y-4 flex-grow flex flex-col justify-between text-left">
                <div className="bg-slate-950 border border-slate-850/80 rounded-2xl p-5 overflow-y-auto max-h-[370px] space-y-3 leading-relaxed text-xs text-slate-200">
                  {analysisResult.split("\n\n").map((para, paraIdx) => {
                    const isHeader = para.startsWith("###");
                    
                    if (isHeader) {
                      return (
                        <h4 
                          key={paraIdx} 
                          className="text-xs font-black uppercase text-emerald-400 border-b border-slate-800 pb-1 mt-3 first:mt-0 tracking-wider flex items-center gap-1.5"
                        >
                          <CornerDownRight className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{para.replace("###", "").trim()}</span>
                        </h4>
                      );
                    }

                    // Simple custom formatting
                    let formattedText = para
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      .replace(/^-\s(.*)/gm, "<li class='list-disc pl-4 mt-1'>$1</li>");

                    return (
                      <p 
                        key={paraIdx} 
                        className="mb-1.5 last:mb-0" 
                        dangerouslySetInnerHTML={{ __html: formattedText }} 
                      />
                    );
                  })}
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 flex gap-2.5 items-center mt-3">
                  <div className="p-1 rounded bg-amber-500/10 text-amber-500">
                    <Lightbulb className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-[9px] text-slate-400 leading-normal">
                    <span className="font-bold text-slate-300">{t.analyzerDisclaimerHeader}</span> {t.analyzerDisclaimerText}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-slate-500 space-y-3">
                <div className="p-4 bg-slate-950 border border-slate-850 rounded-full">
                  <FileImage className="w-10 h-10 text-slate-700 stroke-1" />
                </div>
                <div className="max-w-xs space-y-1">
                  <p className="text-xs font-bold text-slate-400">{t.analyzerEmptyHeader}</p>
                  <p className="text-[10px] text-slate-600">{t.analyzerEmptyDesc}</p>
                </div>
                
                {/* Visual arrow guides */}
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold flex items-center gap-1">
                  <span>{t.analyzerEmptyPrompt}</span>
                  <ArrowRight className="w-3 h-3 text-emerald-400" />
                </span>
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};
