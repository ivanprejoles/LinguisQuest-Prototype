// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-4 text-center select-none">
      {/* Gamified Error Badge */}
      <div className="relative mb-6">
        <h1 className="font-heading font-extrabold text-8xl md:text-9xl text-quest-purple tracking-wider drop-shadow-[0_10px_0_#a855f7]">
          404
        </h1>
      </div>

      {/* Gamified Message */}
      <h2 className="font-heading font-bold text-2xl md:text-3xl text-slate-100 mb-2">
        Quest Route Lost!
      </h2>
      <p className="font-sans text-slate-400 max-w-md mb-8 text-base md:text-lg">
        The map segment you are searching for does not exist or has been hidden in another realm.
      </p>

      {/* Action Button */}
      <Link
        href="/"
        className="font-heading font-bold text-base md:text-lg uppercase px-8 py-3.5 bg-quest-green hover:bg-quest-green-dark text-white rounded-2xl border-b-4 border-quest-green-dark active:border-b-0 active:translate-y-1 transition-all shadow-lg"
      >
        Return to Home Realm
      </Link>
    </div>
  );
}