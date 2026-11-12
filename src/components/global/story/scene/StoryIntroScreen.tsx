
// 'use client';

// import React from 'react';
// import { BookOpen, Sparkles, Play } from 'lucide-react';

// interface StoryIntroScreenProps {
//   title: string;
//   description: string;
//   image?: string;
//   onStart: () => void;
// }

// export default function StworyIntroScreen({
//   title,
//   description,
//   image,
//   onStart,
// }: StoryIntroScreenProps) {
//   return (
//     <div className="relative flex h-full min-h-[500px] w-full
//       items-center justify-center overflow-hidden bg-[#17130f]">

//       {/* Background image */}
//       {image && (
//         <img
//           src={image}
//           alt=""
//           className="absolute inset-0 h-full w-full
//             object-cover opacity-60"
//         />
//       )}

//       {/* Atmospheric overlays */}
//       <div className="absolute inset-0 bg-gradient-to-b
//         from-black/50 via-[#21180f]/45 to-black/90" />

//       <div className="absolute inset-0 bg-black/15 backdrop-blur-[2px]" />

//       {/* Introduction content */}
//       <div className="relative z-10 mx-auto flex w-full
//         max-w-3xl flex-col items-center px-6 py-12 text-center">

//         {/* Decorative icon */}
//         <div className="mb-6 flex h-14 w-14 items-center
//           justify-center rounded-full border border-[#d9b978]/60
//           bg-[#49351f]/50 text-[#f1d69e] shadow-lg">
//           <BookOpen size={26} />
//         </div>

//         {/* Eyebrow */}
//         <div className="mb-4 flex items-center gap-3">
//           <span className="h-px w-10 bg-[#d9b978]/70" />
//           <span className="font-serif text-xs uppercase
//             tracking-[0.3em] text-[#e7cb91]">
//             Your story begins
//           </span>
//           <span className="h-px w-10 bg-[#d9b978]/70" />
//         </div>

//         {/* Story title */}
//         <h1 className="max-w-2xl font-serif text-3xl
//           font-bold leading-tight text-[#fff0cf]
//           drop-shadow-lg sm:text-5xl">
//           {title}
//         </h1>

//         {/* Decorative divider */}
//         <div className="my-6 flex items-center gap-3">
//           <span className="h-px w-12 bg-[#d9b978]/50" />
//           <Sparkles className="h-4 w-4 text-[#e7cb91]" />
//           <span className="h-px w-12 bg-[#d9b978]/50" />
//         </div>

//         {/* Description */}
//         <p className="max-w-xl font-serif text-sm
//           leading-7 text-[#f5e8cf]/90 sm:text-base">
//           {description || 'An unforgettable adventure awaits. Are you ready to begin?'}
//         </p>

//         {/* Start button */}
//         <button
//           type="button"
//           onClick={onStart}
//           className="group mt-10 inline-flex items-center
//             justify-center gap-3 rounded-lg
//             border border-[#e4c47e]
//             bg-gradient-to-b from-[#f8e7b5] to-[#bd9145]
//             px-8 py-3.5 font-serif text-base font-bold
//             text-[#493619] shadow-[0_5px_20px_rgba(0,0,0,0.4)]
//             transition-all duration-300
//             hover:-translate-y-1 hover:brightness-110
//             hover:shadow-[0_8px_25px_rgba(0,0,0,0.5)]
//             active:translate-y-0">

//           <Play size={18} className="fill-current" />
//           <span>Begin Story</span>
//         </button>

//         <p className="mt-5 text-[10px] uppercase
//           tracking-[0.2em] text-[#d9c39b]/60">
//           Enter a world of possibilities
//         </p>
//       </div>
//     </div>
//   );
// }

'use client';

import { BookOpen, Sparkles, Play } from 'lucide-react';

interface StoryIntroScreenProps {
  title: string;
  description: string;
  image?: string;
  onStart: () => void;
}

export default function StworyIntroScreen({
  title,
  description,
  image,
  onStart,
}: StoryIntroScreenProps) {
  return (
    <main className="relative flex h-full w-full items-center justify-center overflow-y-auto bg-[#17130f] px-3 py-3 sm:px-6 sm:py-6">

      {/* Background image */}
      {image && (
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
      )}

      {/* Atmospheric overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-[#21180f]/70 to-black/95" />
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />

      {/* Introduction content */}
      <section className="relative z-10 my-auto flex w-full max-w-2xl flex-col items-center px-2 py-4 text-center sm:px-6 sm:py-7">

        {/* Decorative icon */}
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#d9b978]/60 bg-[#49351f]/50 text-[#f1d69e] shadow-lg sm:mb-5 sm:h-14 sm:w-14">
          <BookOpen className="h-5 w-5 sm:h-7 sm:w-7" />
        </div>

        {/* Eyebrow */}
        <div className="mb-2.5 flex items-center gap-2 sm:mb-4 sm:gap-3">
          <span className="h-px w-6 bg-[#d9b978]/70 sm:w-10" />
          <span className="font-serif text-[9px] uppercase tracking-[0.2em] text-[#e7cb91] sm:text-xs sm:tracking-[0.3em]">
            Your story begins
          </span>
          <span className="h-px w-6 bg-[#d9b978]/70 sm:w-10" />
        </div>

        {/* Story title */}
        <h1 className="max-w-xl break-words font-serif text-2xl font-bold leading-tight text-[#fff0cf] drop-shadow-lg sm:text-5xl">
          {title}
        </h1>

        {/* Decorative divider */}
        <div className="my-3 flex items-center gap-2 sm:my-5 sm:gap-3">
          <span className="h-px w-8 bg-[#d9b978]/50 sm:w-12" />
          <Sparkles className="h-3.5 w-3.5 text-[#e7cb91] sm:h-4 sm:w-4" />
          <span className="h-px w-8 bg-[#d9b978]/50 sm:w-12" />
        </div>

        {/* Description */}
        <p className="max-w-lg font-serif text-xs leading-5 text-[#f5e8cf]/90 sm:text-base sm:leading-7">
          {description || 'An unforgettable adventure awaits. Are you ready to begin?'}
        </p>

        {/* Start button */}
        <button
          type="button"
          onClick={onStart}
          className="group mt-5 inline-flex items-center justify-center gap-2 rounded-lg border border-[#e4c47e] bg-gradient-to-b from-[#f8e7b5] to-[#bd9145] px-6 py-2.5 font-serif text-sm font-bold text-[#493619] shadow-[0_5px_20px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-1 hover:brightness-110 active:translate-y-0 sm:mt-8 sm:gap-3 sm:px-8 sm:py-3.5 sm:text-base"
        >
          <Play size={16} className="fill-current sm:h-[18px] sm:w-[18px]" />
          <span>Begin Story</span>
        </button>

        <p className="mt-3 text-[8px] uppercase tracking-[0.15em] text-[#d9c39b]/60 sm:mt-5 sm:text-[10px] sm:tracking-[0.2em]">
          Enter a world of possibilities
        </p>
      </section>
    </main>
  );
}
