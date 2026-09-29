// "use client";

// import React, { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { Loader2, X, Volume2, CheckCircle2, AlertCircle } from "lucide-react";

// interface StageData {
//   id: string;
//   type: string;
//   question: string;
//   payload: any;
//   roadmap: {
//     language: {
//       id: string;
//       voiceLanguage: string;
//     };
//   };
// }

// export default function StageLessonPage() {
//   const params = useParams();
//   const router = useRouter();

//   const languageId = params?.languageId as string;
//   const stageId = params?.stageId as string;

//   const [stage, setStage] = useState<StageData | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [selectedOption, setSelectedOption] = useState<string | null>(null);
//   const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
//   const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

// //   console.log(stage)

//   useEffect(() => {
//     async function fetchStage() {
//       if (!stageId) return;
//       try {
//         const res = await fetch(`/api/client/foundation/stages/${stageId}`);
//         if (!res.ok) throw new Error("Stage not found");
//         const data = await res.json();
//         setStage(data);
//       } catch (err) {
//         console.error("Failed to load stage:", err);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchStage();
//   }, [stageId]);

//   // Audio synthesis handler using language voice metadata
//   const speakText = (text: string) => {
//     if ("speechSynthesis" in window && stage?.roadmap?.language?.voiceLanguage) {
//       const utterance = new SpeechSynthesisUtterance(text);
//       utterance.lang = stage.roadmap.language.voiceLanguage;
//       window.speechSynthesis.speak(utterance);
//     }
//   };

//   const handleCheckAnswer = () => {
//     if (!stage || !selectedOption) return;
//     const correctAnswer = stage.payload?.correctAnswer;
//     setIsCorrect(selectedOption === correctAnswer);
//     setIsSubmitted(true);
//   };

//   const handleExit = () => {
//     router.push(`/foundation/${languageId}`);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-white">
//         <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
//       </div>
//     );
//   }

//   if (!stage) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
//         <p className="text-slate-600 font-bold">Stage data could not be loaded.</p>
//         <button
//           onClick={handleExit}
//           className="px-6 py-3 bg-slate-200 text-slate-800 rounded-2xl font-black"
//         >
//           Exit Lesson
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white flex flex-col justify-between">
//       {/* Lesson Header */}
//       <header className="max-w-2xl w-full mx-auto px-6 py-6 flex items-center gap-4">
//         <button
//           onClick={handleExit}
//           className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-colors"
//         >
//           <X className="w-6 h-6 stroke-[3]" />
//         </button>
//         <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
//           <div className="h-full bg-green-500 rounded-full w-2/3 transition-all" />
//         </div>
//       </header>

//       {/* Main Activity Section */}
//       <main className="max-w-xl w-full mx-auto px-6 flex-1 flex flex-col justify-center">
//         <h2 className="text-2xl font-black text-slate-800 mb-6">
//           {stage.question || "Select the correct answer"}
//         </h2>

//         {/* Audio Button for Audio-driven Stage Types */}
//         {(stage.type === "tapWhatYouHear" || stage.payload?.audioText) && (
//           <button
//             onClick={() => speakText(stage.payload?.audioText || stage.question)}
//             className="mb-8 self-start p-4 bg-sky-500 hover:bg-sky-400 text-white rounded-2xl shadow-[0_4px_0_0_#0284c7] active:translate-y-1 active:shadow-none transition-all flex items-center gap-3 font-black"
//           >
//             <Volume2 className="w-6 h-6" />
//             <span>Play Audio</span>
//           </button>
//         )}

//         {/* Options List */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           {(stage.payload?.options || []).map((option: string, idx: number) => {
//             const isSelected = selectedOption === option;
//             return (
//               <button
//                 key={idx}
//                 onClick={() => !isSubmitted && setSelectedOption(option)}
//                 className={`p-5 rounded-2xl border-2 border-b-4 font-black text-left transition-all active:translate-y-0.5 ${
//                   isSelected
//                     ? "bg-sky-50 border-sky-400 text-sky-600 shadow-[0_4px_0_0_#38bdf8]"
//                     : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-[0_4px_0_0_#e2e8f0]"
//                 }`}
//               >
//                 {option}
//               </button>
//             );
//           })}
//         </div>
//       </main>

//       {/* Answer Verification Footer */}
//       <footer
//         className={`w-full py-6 px-6 border-t-2 ${
//           isSubmitted
//             ? isCorrect
//               ? "bg-green-100 border-green-300"
//               : "bg-rose-100 border-rose-300"
//             : "bg-white border-slate-200"
//         }`}
//       >
//         <div className="max-w-xl mx-auto flex items-center justify-between">
//           {isSubmitted ? (
//             <div className="flex items-center gap-3">
//               {isCorrect ? (
//                 <>
//                   <CheckCircle2 className="w-8 h-8 text-green-600" />
//                   <div>
//                     <p className="font-black text-green-800 text-lg">Excellent!</p>
//                     <p className="text-xs font-bold text-green-600">You got it right.</p>
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   <AlertCircle className="w-8 h-8 text-rose-600" />
//                   <div>
//                     <p className="font-black text-rose-800 text-lg">Not quite</p>
//                     <p className="text-xs font-bold text-rose-600">
//                       Correct answer: {stage.payload?.correctAnswer}
//                     </p>
//                   </div>
//                 </>
//               )}
//             </div>
//           ) : (
//             <div />
//           )}

//           {!isSubmitted ? (
//             <button
//               disabled={!selectedOption}
//               onClick={handleCheckAnswer}
//               className="px-8 py-4 bg-green-500 hover:bg-green-400 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none text-white rounded-2xl font-black shadow-[0_4px_0_0_#16a34a] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider"
//             >
//               Check
//             </button>
//           ) : (
//             <button
//               onClick={handleExit}
//               className={`px-8 py-4 rounded-2xl font-black text-white shadow-[0_4px_0_0] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider ${
//                 isCorrect
//                   ? "bg-green-500 hover:bg-green-400 shadow-green-600"
//                   : "bg-rose-500 hover:bg-rose-400 shadow-rose-600"
//               }`}
//             >
//               Continue
//             </button>
//           )}
//         </div>
//       </footer>
//     </div>
//   );
// }

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, X, CheckCircle2, AlertCircle } from "lucide-react";
import { StageData, StageMaterialRenderer } from "@/components/global/client/foundation/StageMaterialRenderer";

export default function StageLessonPage() {
  const params = useParams();
  const router = useRouter();

  const languageId = params?.languageId as string;
  const stageId = params?.stageId as string;

  const [stage, setStage] = useState<StageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // States to manage answer checking and progress footer
  const [isCurrentAnswerCorrect, setIsCurrentAnswerCorrect] =
    useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  useEffect(() => {
    async function fetchStage() {
      if (!stageId) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/client/foundation/stages/${stageId}`);
        if (!res.ok) throw new Error("Stage not found");
        const data: StageData = await res.json();
        setStage(data);
      } catch (err) {
        console.error("Failed to load stage data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStage();
  }, [stageId]);

  const handleCheckAnswer = () => {
    setIsSubmitted(true);
  };

  const handleNextStage = () => {
    // Reset local verification state before routing or transitioning
    setIsSubmitted(false);
    setIsCurrentAnswerCorrect(false);

    // Route back to language roadmap or next stage
    router.push(`/foundation/${languageId}`);
  };

  const handleExit = () => {
    router.push(`/foundation/${languageId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  if (!stage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
        <p className="text-slate-600 font-bold">Stage data could not be loaded.</p>
        <button
          onClick={handleExit}
          className="px-6 py-3 bg-slate-200 text-slate-800 rounded-2xl font-black"
        >
          Exit Lesson
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between select-none">
      {/* Lesson Navigation Header */}
      <header className="max-w-2xl w-full mx-auto px-6 py-6 flex items-center gap-4">
        <button
          onClick={handleExit}
          className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-colors"
          aria-label="Close lesson"
        >
          <X className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Progress Bar */}
        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full w-1/3 transition-all duration-300" />
        </div>
      </header>

      {/* Main Material Socket Area */}
      <main className="max-w-xl w-full mx-auto px-6 flex-1 flex flex-col justify-center py-6">
        <StageMaterialRenderer
          stage={stage}
          onAnswerChange={(isCorrect) => setIsCurrentAnswerCorrect(isCorrect)}
        />
      </main>

      {/* Answer Feedback & Submit Footer */}
      <footer
        className={`w-full py-6 px-6 border-t-2 transition-colors duration-200 ${
          isSubmitted
            ? isCurrentAnswerCorrect
              ? "bg-green-100 border-green-300"
              : "bg-rose-100 border-rose-300"
            : "bg-white border-slate-200"
        }`}
      >
        <div className="max-w-xl mx-auto flex items-center justify-between">
          {isSubmitted ? (
            <div className="flex items-center gap-3">
              {isCurrentAnswerCorrect ? (
                <>
                  <CheckCircle2 className="w-8 h-8 text-green-600 shrink-0" />
                  <div>
                    <p className="font-black text-green-800 text-lg">
                      Excellent!
                    </p>
                    <p className="text-xs font-bold text-green-600">
                      Your answer is correct.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-8 h-8 text-rose-600 shrink-0" />
                  <div>
                    <p className="font-black text-rose-800 text-lg">
                      Not quite
                    </p>
                    <p className="text-xs font-bold text-rose-600">
                      Check your response and try again.
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div />
          )}

          {!isSubmitted ? (
            <button
              onClick={handleCheckAnswer}
              className="px-8 py-4 bg-green-500 hover:bg-green-400 text-white rounded-2xl font-black shadow-[0_4px_0_0_#16a34a] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider ml-auto"
            >
              Check
            </button>
          ) : (
            <button
              onClick={handleNextStage}
              className={`px-8 py-4 rounded-2xl font-black text-white shadow-[0_4px_0_0] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider ml-auto ${
                isCurrentAnswerCorrect
                  ? "bg-green-500 hover:bg-green-400 shadow-green-600"
                  : "bg-rose-500 hover:bg-rose-400 shadow-rose-600"
              }`}
            >
              Continue
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}