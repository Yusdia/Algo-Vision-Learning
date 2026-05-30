import React, { useState } from "react";
import { educationalModules } from "../lessonsData";
import { Module, Lesson } from "../types";
import { BookOpen, Trophy, Check, AlertCircle, Award, ArrowRight, ArrowLeft } from "lucide-react";

interface EducationalSectionProps {
  onSuggestTradeSetup: (setup: { symbol: string; type: "BUY" | "SELL"; sl: number; tp: number }) => void;
  userProgress: { [lessonId: string]: boolean };
  onCompleteLesson: (lessonId: string) => void;
  xpPoints: number;
  onAddXp: (pts: number) => void;
}

export const EducationalSection: React.FC<EducationalSectionProps> = ({
  onSuggestTradeSetup,
  userProgress,
  onCompleteLesson,
  xpPoints,
  onAddXp
}) => {
  const [selectedModule, setSelectedModule] = useState<Module | null>(educationalModules[0]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(educationalModules[0].lessons[0]);
  
  // Quiz state
  const [currentQuizAns, setCurrentQuizAns] = useState<{ [qId: string]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState<{ [qId: string]: boolean }>({});
  const [quizFeedbacks, setQuizFeedbacks] = useState<{ [qId: string]: string }>({});

  const handleSelectModule = (mod: Module) => {
    setSelectedModule(mod);
    setSelectedLesson(mod.lessons[0] || null);
    // Reset temporary quiz states
    setCurrentQuizAns({});
    setQuizSubmitted({});
    setQuizFeedbacks({});
  };

  const handleSelectLesson = (les: Lesson) => {
    setSelectedLesson(les);
    setCurrentQuizAns({});
    setQuizSubmitted({});
    setQuizFeedbacks({});
  };

  const handleSelectOption = (qId: string, optIndex: number) => {
    if (quizSubmitted[qId]) return; // locked once submitted
    setCurrentQuizAns((prev) => ({ ...prev, [qId]: optIndex }));
  };

  const handleSubmitQuiz = (qId: string, correctIdx: number, explanation: string) => {
    const userAns = currentQuizAns[qId];
    if (userAns === undefined) return;

    setQuizSubmitted((prev) => ({ ...prev, [qId]: true }));
    
    // Check answer correctness
    const isCorrect = userAns === correctIdx;
    
    if (isCorrect) {
      setQuizFeedbacks((prev) => ({ 
        ...prev, 
        [qId]: `Benar! 🎉 +50 XP. ${explanation}` 
      }));
      onAddXp(50);
    } else {
      setQuizFeedbacks((prev) => ({ 
        ...prev, 
        [qId]: `Kurang tepat. 💡 Pelajari lagi: ${explanation}` 
      }));
      onAddXp(10); // small participation points
    }

    // If all quiz questions of this lesson are submitted, declare lesson complete
    const lessonQuizzes = selectedLesson?.quiz || [];
    const updatedSubmitted = { ...quizSubmitted, [qId]: true };
    const allQuizDone = lessonQuizzes.every((q) => updatedSubmitted[q.id]);
    
    if (allQuizDone && selectedLesson) {
      onCompleteLesson(selectedLesson.id);
    }
  };

  // Percent calculation
  const totalLessonsCount = educationalModules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedCount = Object.keys(userProgress).filter(k => userProgress[k]).length;
  const progressPercent = Math.round((completedCount / totalLessonsCount) * 100) || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full text-slate-100">
      
      {/* LEFT COLUMN: Modules & Progress Navigation (cols 4) */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        {/* Progress Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-400">Kemajuan Studi</span>
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold bg-amber-500/10 px-2 py-1 rounded-full">
              <Trophy className="w-3.5 h-3.5" />
              <span>{xpPoints} XP</span>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline text-xs text-slate-300">
              <span>{completedCount} dari {totalLessonsCount} Materi Selesai</span>
              <span className="font-bold text-sm text-emerald-400">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {progressPercent === 100 && (
            <div className="mt-3 bg-indigo-500/10 border border-indigo-500/30 p-2.5 rounded-xl flex items-center gap-2 text-indigo-300 text-xs text-left">
              <Award className="w-5 h-5 flex-shrink-0 text-indigo-400" />
              <span>Hebat! Anda memperoleh <strong>Sertifikat Virtual Kelulusan Dasar Trading</strong>! Anda sudah siap bertransaksi.</span>
            </div>
          )}
        </div>

        {/* List Modules */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Kurikulum Level</span>
          {educationalModules.map((mod, index) => {
            const isSelected = selectedModule?.id === mod.id;
            const completedInModule = mod.lessons.filter(l => userProgress[l.id]).length;
            const isAllCompleted = completedInModule === mod.lessons.length;

            return (
              <button
                key={mod.id}
                onClick={() => handleSelectModule(mod)}
                className={`flex flex-col text-left p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? "bg-gradient-to-r from-slate-850 to-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-500/5"
                    : "bg-slate-900/50 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-2.5 justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950 rounded px-1.5 py-0.5">
                      MODUL 0{index + 1}
                    </span>
                    {isAllCompleted && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <span className="text-xs font-semibold text-slate-400">{completedInModule}/{mod.lessons.length}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-200 mt-1">{mod.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{mod.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: Lesson Content & Quizzes (cols 8) */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        {selectedModule && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col h-full">
            
            {/* Lesson Sub-Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 pb-3 mb-4 overflow-x-auto">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-tight mr-2">Materi Modul:</span>
              {selectedModule.lessons.map((les) => {
                const isLesSelected = selectedLesson?.id === les.id;
                const isLesDone = userProgress[les.id];

                return (
                  <button
                    key={les.id}
                    onClick={() => handleSelectLesson(les)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isLesSelected
                        ? "bg-slate-950 border border-slate-800 text-emerald-400 font-bold"
                        : "hover:bg-slate-800 text-slate-300"
                    }`}
                  >
                    <BookOpen className={`w-3.5 h-3.5 ${isLesSelected ? "text-emerald-400" : "text-slate-400"}`} />
                    <span>{les.title}</span>
                    {isLesDone && <Check className="w-3 h-3 text-emerald-400" />}
                  </button>
                );
              })}
            </div>

            {selectedLesson ? (
              <div className="flex flex-col gap-5 flex-grow">
                {/* Scrollable details content */}
                <div className="prose prose-invert prose-slate max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
                  {/* Clean renderer using structured templates */}
                  {selectedLesson.content.split("\n\n").map((part, pIdx) => {
                    if (part.startsWith("###")) {
                      return <h3 key={pIdx} className="text-base font-bold text-emerald-400 border-b border-slate-800/60 pb-1 mt-4">{part.replace("### ", "")}</h3>;
                    }
                    if (part.startsWith("####")) {
                      return <h4 key={pIdx} className="text-sm font-semibold text-slate-200 mt-2">{part.replace("#### ", "")}</h4>;
                    }
                    if (part.startsWith("* **") || part.startsWith("* ")) {
                      return (
                        <ul key={pIdx} className="list-disc pl-5 space-y-1">
                          {part.split("\n").map((li, lIdx) => (
                            <li key={lIdx} dangerouslySetInnerHTML={{
                              __html: li.replace("* ", "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\`(.*?)\`/g, "<code class='bg-slate-950 px-1 py-0.2 rounded font-mono text-cyan-300'>$1</code>")
                            }} />
                          ))}
                        </ul>
                      );
                    }
                    if (part.startsWith(">")) {
                      return (
                        <blockquote key={pIdx} className="border-l-4 border-amber-500 bg-amber-500/5 p-3 rounded-r-lg text-amber-300/90 text-xs italic">
                          {part.replace("> ", "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}
                        </blockquote>
                      );
                    }
                    // regular paragraph
                    return (
                      <p key={pIdx} className="" dangerouslySetInnerHTML={{
                        __html: part.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\`(.*?)\`/g, "<code class='bg-slate-950 px-1 py-0.2 rounded font-mono text-cyan-300'>$1</code>")
                      }} />
                    );
                  })}
                </div>

                {/* Interactive Practice Quiz Block */}
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 mt-5">
                  <div className="flex items-center gap-2 mb-3.5">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <h5 className="text-sm font-bold text-slate-200">Kuis Pemahaman Materi (+50 XP)</h5>
                  </div>

                  <div className="space-y-6">
                    {selectedLesson.quiz.map((q, qIndex) => {
                      const isSub = quizSubmitted[q.id];
                      const chosenIdx = currentQuizAns[q.id];
                      const feedback = quizFeedbacks[q.id];

                      return (
                        <div key={q.id} className="border-t border-slate-800/80 pt-4 first:border-0 first:pt-0">
                          <p className="text-xs font-semibold text-slate-400 mb-1">PERTANYAAN 0{qIndex + 1}:</p>
                          <p className="text-sm text-slate-200 font-medium mb-3">{q.question}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {q.options.map((opt, oIdx) => {
                              const isSelected = chosenIdx === oIdx;
                              const isCorrectOption = oIdx === q.correctOptionIndex;
                              
                              let btnClass = "bg-slate-900 border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-300";
                              if (isSelected) {
                                btnClass = "bg-emerald-500/10 border-emerald-500/80 text-emerald-400 font-medium";
                              }
                              if (isSub) {
                                if (isCorrectOption) {
                                  btnClass = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold";
                                } else if (isSelected) {
                                  btnClass = "bg-rose-500/15 border-rose-500 text-rose-300";
                                } else {
                                  btnClass = "bg-slate-900/40 border-slate-900/60 text-slate-500 opacity-60";
                                }
                              }

                              return (
                                <button
                                  key={oIdx}
                                  disabled={isSub}
                                  onClick={() => handleSelectOption(q.id, oIdx)}
                                  className={`flex text-left p-2.5 rounded-lg border text-xs transition-all ${btnClass}`}
                                >
                                  <span className="mr-2 font-mono bg-slate-950 px-1.5 py-0.5 rounded text-[10px] text-slate-400 flex-shrink-0 h-fit">
                                    {String.fromCharCode(65 + oIdx)}
                                  </span>
                                  <span>{opt}</span>
                                </button>
                              );
                            })}
                          </div>

                          {!isSub ? (
                            <button
                              disabled={chosenIdx === undefined}
                              onClick={() => handleSubmitQuiz(q.id, q.correctOptionIndex, q.explanation)}
                              className={`mt-3.5 w-full md:w-auto px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                                chosenIdx !== undefined
                                  ? "bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold"
                                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
                              }`}
                            >
                              <span>Kirim Jawaban</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <div className={`mt-3.5 p-3 rounded-lg flex gap-2 text-xs leading-relaxed ${
                              feedback?.startsWith("Benar")
                                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                                : "bg-cyan-500/10 border border-cyan-500/20 text-cyan-200"
                            }`}>
                              {feedback?.startsWith("Benar") ? (
                                <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-400" />
                              ) : (
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-cyan-400" />
                              )}
                              <span>{feedback}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Helpful Lesson Guide for Replaying & Charting */}
                <div className="mt-4 bg-slate-950/40 px-4 py-3 rounded-xl border border-slate-800 text-xs text-left">
                  <h6 className="font-semibold text-slate-300 mb-1">💡 Petunjuk Praktik Replay Simulator:</h6>
                  <p className="text-slate-400 leading-relaxed">
                    Setelah membaca rangkuman ini, silakan pindah ke tab **Replay Simulator** di layar atas.
                    Gunakan kendali replay untuk memutarkan harga candlestick demi candlestick, cari penolakan candlestick (seperti **Hammer**), dan letakkan simulasi transaksi **BUY** atau **SELL** dengan disiplin Stop Loss (SL) yang tepat!
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-grow flex items-center justify-center text-slate-400 italic">
                Silakan pilih materi pelajaran di panel atas.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
