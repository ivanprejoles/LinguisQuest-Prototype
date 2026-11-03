
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
    <main className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#17130f]">
      {image && (
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-[#21180f]/80 to-black/95" />

      <section className="relative z-10 mx-4 w-full max-w-2xl overflow-hidden rounded-2xl border border-[#d9b978]/50 bg-gradient-to-br from-[#49351f]/90 via-[#30251b]/95 to-[#1e1915]/95 p-5 text-center shadow-[0_20px_70px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:p-7">
        <div className="pointer-events-none absolute inset-2 rounded-xl border border-[#d9b978]/20" />

        <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#d9b978]/60 bg-[#d9b978]/10">
          {isWin ? (
            <Trophy className="h-7 w-7 text-[#f4d58e]" />
          ) : (
            <BookOpen className="h-7 w-7 text-[#d9b978]" />
          )}
        </div>

        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[#d9b978]">
          {isWin ? 'A tale of triumph' : 'The end of this path'}
        </p>

        <h1 className="font-serif text-2xl font-bold text-[#fff0cf] sm:text-4xl">
          {isWin ? 'Victory Awaits!' : 'Your Journey Ends Here'}
        </h1>

        <div className="my-4 flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-[#d9b978]/50" />
          <Sparkles className="h-4 w-4 text-[#e7cb91]" />
          <span className="h-px w-10 bg-[#d9b978]/50" />
        </div>

        <p className="mx-auto max-w-lg font-serif text-sm leading-6 text-[#f5e8cf]/90 sm:text-base sm:leading-7">
          {isWin
            ? 'Against every obstacle, your courage carried you forward. The choices you made have led you to this moment. Your story ends in triumph, and your victory will be remembered.'
            : 'Every journey has its turning points. This time, the path led to an unexpected ending. Though this chapter closes in defeat, every mistake is a lesson, and every ending holds the possibility of a new beginning.'}
        </p>

        <p className="mt-3 font-serif text-sm italic text-[#d9b978]/80">
          {title}
        </p>

        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onReturn}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#e4c47e] bg-gradient-to-b from-[#f8e7b5] to-[#bd9145] px-6 py-2.5 font-serif text-sm font-bold text-[#493619] transition hover:-translate-y-0.5 hover:brightness-110"
          >
            <ArrowLeft size={17} />
            Return to Story List
          </button>

          <button
            type="button"
            onClick={onReplay}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#d9b978]/50 bg-black/20 px-6 py-2.5 font-serif text-sm text-[#f5e8cf] transition hover:bg-black/40"
          >
            <RotateCcw size={16} />
            Play Again
          </button>
        </div>

        <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-[#d9c39b]/50">
          Every choice shapes a different story
        </p>
      </section>
    </main>
  );
}
