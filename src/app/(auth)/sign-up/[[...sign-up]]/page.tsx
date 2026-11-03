
"use client";

import { ChevronLeft } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

const SignUp = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.SignUp),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full animate-pulse rounded-2xl bg-slate-900/80" />
    ),
  }
);

const backgroundImage =
  "https://ik.imagekit.io/uch28of0b/tr:w-1920,q-75,f-auto/LinguisQuest-public-assets/Tagalog%20Adventure%20in%20the%20Enchanted%20Valley.png";

export default function SignUpPage() {
  return (
    <main className="relative isolate flex min-h-screen min-h-[100svh] items-center justify-center overflow-hidden bg-slate-950 px-4 py-8 sm:px-8 lg:justify-end lg:pr-[14%] lg:pl-8">

        {/* Back to homepage button */}
        <Link
        href="/"
        aria-label="Back to homepage"
        className="fixed left-5 top-5 z-50 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/50 bg-slate-950/90 text-cyan-300 shadow-lg shadow-cyan-950/30 backdrop-blur-md transition-all duration-200 hover:-translate-x-1 hover:border-cyan-300 hover:bg-cyan-950 hover:text-cyan-100 sm:left-8 sm:top-8"
        >
            <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
        </Link>
        
      {/* Background image */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-cover bg-[position:30%_center] lg:bg-center"
        style={{ backgroundImage: `url("${backgroundImage}")` }}
      />

      {/* Light overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-slate-950/20 lg:bg-gradient-to-r lg:from-slate-950/0 lg:via-slate-950/10 lg:to-slate-950/45"
      />

      {/* Sign-up card with cyan 3D shadow */}
      <section className="w-full max-w-[400px]">
        <SignUp
          signInUrl="/sign-in"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "w-full rounded-2xl border border-cyan-400/60 bg-slate-950/95 text-slate-100 shadow-[0_8px_0_#083344,0_16px_32px_rgba(6,182,212,0.30)]",

              headerTitle:
                "font-heading text-2xl font-bold text-cyan-300",
              headerSubtitle: "text-cyan-100/70",

              formFieldLabel: "font-medium text-cyan-100",
              formFieldInput:
                "rounded-lg border border-cyan-800 bg-slate-900 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400",

              formButtonPrimary:
                "rounded-xl border-b-4 border-cyan-800 bg-cyan-500 font-heading font-bold uppercase tracking-wider text-slate-950 transition-colors hover:bg-cyan-400 active:translate-y-1 active:border-b-0",

              footerActionLink:
                "font-semibold text-cyan-300 hover:text-cyan-100",

              dividerLine: "bg-cyan-900/70",
              dividerText: "text-cyan-100/60",

              socialButtonsBlockButton:
                "rounded-lg border border-cyan-800 bg-slate-900 text-cyan-50 hover:border-cyan-400 hover:bg-cyan-950",

              socialButtonsBlockButtonText: "text-cyan-50",

              formFieldInputShowPasswordButton:
                "text-cyan-300 hover:text-cyan-100",

              identityPreviewText: "text-cyan-50",
              identityPreviewEditButton:
                "text-cyan-300 hover:text-cyan-100",

              otpCodeFieldInput:
                "border-cyan-700 bg-slate-900 text-cyan-100 focus:border-cyan-400",
            },
          }}
        />
      </section>
    </main>
  );
}
