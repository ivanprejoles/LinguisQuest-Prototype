"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <SignIn
        appearance={{
          elements: {
            card: "shadow-2xl border border-slate-800 bg-slate-900 text-slate-100",
            headerTitle: "font-heading text-2xl text-slate-100",
            buttonPrimary:
              "bg-quest-green hover:bg-quest-green-dark text-white font-heading uppercase tracking-wider rounded-xl border-b-4 border-quest-green-dark active:border-b-0 active:translate-y-1 transition-all",
          },
        }}
      />
    </div>
  );
}