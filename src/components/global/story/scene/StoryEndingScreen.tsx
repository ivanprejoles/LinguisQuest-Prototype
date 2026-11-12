
// import {
//   ArrowLeft,
//   BookOpen,
//   RotateCcw,
//   Sparkles,
//   Trophy,
// } from 'lucide-react';

// interface StoryEndingScreenProps {
//   outcome: 'win' | 'loss';
//   title: string;
//   image?: string | null;
//   onReturn: () => void;
//   onReplay: () => void;
// }

// export default function StoryEndingScreen({
//   outcome,
//   title,
//   image,
//   onReturn,
//   onReplay,
// }: StoryEndingScreenProps) {
//   const isWin = outcome === 'win';

//   return (
//     <main className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#17130f]">
//       {image && (
//         <img
//           src={image}
//           alt=""
//           className="absolute inset-0 h-full w-full object-cover opacity-35"
//         />
//       )}

//       <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-[#21180f]/80 to-black/95" />

//       <section className="relative z-10 mx-4 w-full max-w-2xl overflow-hidden rounded-2xl border border-[#d9b978]/50 bg-gradient-to-br from-[#49351f]/90 via-[#30251b]/95 to-[#1e1915]/95 p-5 text-center shadow-[0_20px_70px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:p-7">
//         <div className="pointer-events-none absolute inset-2 rounded-xl border border-[#d9b978]/20" />

//         <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#d9b978]/60 bg-[#d9b978]/10">
//           {isWin ? (
//             <Trophy className="h-7 w-7 text-[#f4d58e]" />
//           ) : (
//             <BookOpen className="h-7 w-7 text-[#d9b978]" />
//           )}
//         </div>

//         <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[#d9b978]">
//           {isWin ? 'A tale of triumph' : 'The end of this path'}
//         </p>

//         <h1 className="font-serif text-2xl font-bold text-[#fff0cf] sm:text-4xl">
//           {isWin ? 'Victory Awaits!' : 'Your Journey Ends Here'}
//         </h1>

//         <div className="my-4 flex items-center justify-center gap-3">
//           <span className="h-px w-10 bg-[#d9b978]/50" />
//           <Sparkles className="h-4 w-4 text-[#e7cb91]" />
//           <span className="h-px w-10 bg-[#d9b978]/50" />
//         </div>

//         <p className="mx-auto max-w-lg font-serif text-sm leading-6 text-[#f5e8cf]/90 sm:text-base sm:leading-7">
//           {isWin
//             ? 'Against every obstacle, your courage carried you forward. The choices you made have led you to this moment. Your story ends in triumph, and your victory will be remembered.'
//             : 'Every journey has its turning points. This time, the path led to an unexpected ending. Though this chapter closes in defeat, every mistake is a lesson, and every ending holds the possibility of a new beginning.'}
//         </p>

//         <p className="mt-3 font-serif text-sm italic text-[#d9b978]/80">
//           {title}
//         </p>

//         <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
//           <button
//             type="button"
//             onClick={onReturn}
//             className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#e4c47e] bg-gradient-to-b from-[#f8e7b5] to-[#bd9145] px-6 py-2.5 font-serif text-sm font-bold text-[#493619] transition hover:-translate-y-0.5 hover:brightness-110"
//           >
//             <ArrowLeft size={17} />
//             Return to Story List
//           </button>

//           <button
//             type="button"
//             onClick={onReplay}
//             className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#d9b978]/50 bg-black/20 px-6 py-2.5 font-serif text-sm text-[#f5e8cf] transition hover:bg-black/40"
//           >
//             <RotateCcw size={16} />
//             Play Again
//           </button>
//         </div>

//         <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-[#d9c39b]/50">
//           Every choice shapes a different story
//         </p>
//       </section>
//     </main>
//   );
// }

import {
  ArrowLeft,
  BookOpen,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';

interface StoryEndingScreenProps {
  outcome: 'win' | 'loss';
  title: string;
  image?: string | null;
  onReturn: () => void;
  onReplay: () => void;
}

export default function StoryEndingScreen({
  outcome,
  title,
  image,
  onReturn,
  onReplay,
}: StoryEndingScreenProps) {
  const isWin = outcome === 'win';

  return (
    <main className="relative flex h-full w-full items-center justify-center overflow-y-auto bg-[#17130f] px-3 py-3 sm:px-6 sm:py-6">
      {image && (
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-[#21180f]/80 to-black/95" />

      <section className="relative z-10 my-auto w-full max-w-2xl overflow-hidden rounded-xl border border-[#d9b978]/50 bg-gradient-to-br from-[#49351f]/90 via-[#30251b]/95 to-[#1e1915]/95 p-3.5 text-center shadow-[0_20px_70px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:rounded-2xl sm:p-7">
        <div className="pointer-events-none absolute inset-1.5 rounded-lg border border-[#d9b978]/20 sm:inset-2 sm:rounded-xl" />

        <div className="relative mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-full border border-[#d9b978]/60 bg-[#d9b978]/10 sm:mb-4 sm:h-14 sm:w-14">
          {isWin ? (
            <Trophy className="h-5 w-5 text-[#f4d58e] sm:h-7 sm:w-7" />
          ) : (
            <BookOpen className="h-5 w-5 text-[#d9b978] sm:h-7 sm:w-7" />
          )}
        </div>

        <p className="mb-1.5 text-[9px] uppercase tracking-[0.2em] text-[#d9b978] sm:mb-2 sm:text-xs sm:tracking-[0.3em]">
          {isWin ? 'A tale of triumph' : 'The end of this path'}
        </p>

        <h1 className="font-serif text-xl font-bold leading-tight text-[#fff0cf] sm:text-4xl">
          {isWin ? 'Victory Awaits!' : 'Your Journey Ends Here'}
        </h1>

        <div className="my-2.5 flex items-center justify-center gap-2 sm:my-4 sm:gap-3">
          <span className="h-px w-7 bg-[#d9b978]/50 sm:w-10" />
          <Sparkles className="h-3.5 w-3.5 text-[#e7cb91] sm:h-4 sm:w-4" />
          <span className="h-px w-7 bg-[#d9b978]/50 sm:w-10" />
        </div>

        <p className="mx-auto max-w-lg font-serif text-xs leading-5 text-[#f5e8cf]/90 sm:text-base sm:leading-7">
          {isWin
            ? 'Against every obstacle, your courage carried you forward. The choices you made have led you to this moment. Your story ends in triumph, and your victory will be remembered.'
            : 'Every journey has its turning points. This time, the path led to an unexpected ending. Though this chapter closes in defeat, every mistake is a lesson, and every ending holds the possibility of a new beginning.'}
        </p>

        <p className="mt-2 break-words font-serif text-xs italic text-[#d9b978]/80 sm:mt-3 sm:text-sm">
          {title}
        </p>

        <div className="mt-4 flex flex-col justify-center gap-2 sm:mt-6 sm:flex-row">
          <button
            type="button"
            onClick={onReturn}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#e4c47e] bg-gradient-to-b from-[#f8e7b5] to-[#bd9145] px-4 py-2 font-serif text-xs font-bold text-[#493619] transition hover:-translate-y-0.5 hover:brightness-110 sm:px-6 sm:py-2.5 sm:text-sm"
          >
            <ArrowLeft size={15} />
            Return to Story List
          </button>

          <button
            type="button"
            onClick={onReplay}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#d9b978]/50 bg-black/20 px-4 py-2 font-serif text-xs text-[#f5e8cf] transition hover:bg-black/40 sm:px-6 sm:py-2.5 sm:text-sm"
          >
            <RotateCcw size={14} />
            Play Again
          </button>
        </div>

        <p className="mt-3 text-[8px] uppercase tracking-[0.15em] text-[#d9c39b]/50 sm:mt-4 sm:text-[10px] sm:tracking-[0.2em]">
          Every choice shapes a different story
        </p>
      </section>
    </main>
  );
}
