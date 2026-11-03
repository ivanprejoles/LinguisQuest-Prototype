
"use client";

import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";

const sections = [
  {
    title: "1. Information We Collect",
    content:
      "When you create an account or use LinguisQuest, the system may collect information such as your name, email address, account details, learning progress, lesson completion records, and assessment results. The information collected depends on the features you use.",
  },
  {
    title: "2. How We Use Your Information",
    content:
      "Your information may be used to create and manage your account, save your learning progress, display assessment results, provide learning activities, improve your learning experience, and maintain the operation of LinguisQuest.",
  },
  {
    title: "3. Account Information",
    content:
      "LinguisQuest uses Clerk for authentication. Account registration, sign-in, and related authentication information are handled through the configured Clerk services. Please review Clerk's privacy information to understand how its services process information.",
  },
  {
    title: "4. AI-Powered Features",
    content:
      "LinguisQuest includes AI-assisted learning features, which may process prompts, questions, or conversation content to generate responses and learning assistance. Do not submit passwords, financial information, or other sensitive personal information in AI conversations. The AI service provider and the information shared with it should be identified in this policy before publication.",
  },
  {
    title: "5. Learning Progress",
    content:
      "The system may store information about completed lessons, activity results, quiz scores, and overall learning progress so that you can continue your learning journey.",
  },
  {
    title: "6. Data Sharing",
    content:
      "Personal information should only be shared with service providers when necessary to operate the platform, provide its features, or meet applicable legal requirements. LinguisQuest does not claim that information is never shared; the actual service providers and data flows must be confirmed by the project team.",
  },
  {
    title: "7. Data Storage and Security",
    content:
      "We take reasonable steps to protect information handled by the platform. However, no online system can guarantee absolute security. The actual hosting provider, storage arrangements, access controls, and retention periods should be documented by the project team.",
  },
  {
    title: "8. Your Privacy Rights",
    content:
      "Depending on applicable law, you may have rights to request access to, correction of, or deletion of your personal information, subject to applicable exceptions. You may contact the LinguisQuest team using the contact details provided below to raise a privacy concern.",
  },
  {
    title: "9. Children's Privacy",
    content:
      "LinguisQuest is intended for learners. If the platform is used by children, the project team must establish appropriate age requirements, parental or guardian consent procedures where required, and safeguards for children's personal information before making the service available to them.",
  },
  {
    title: "10. Changes to This Policy",
    content:
      "This Privacy Policy may be updated as LinguisQuest develops. Any updated version should include a revised effective date and be made available on this page.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#f2fbff] px-5 py-12 text-[#124b82] sm:px-8">
      <Link
        href="/"
        aria-label="Back to homepage"
        className="fixed left-5 top-5 z-50 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/50 bg-slate-950/90 text-cyan-300 shadow-lg transition-all hover:-translate-x-1 hover:bg-cyan-950 sm:left-8 sm:top-8"
      >
        <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
      </Link>

      <div className="mx-auto max-w-4xl pt-10">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-600">
            LinguisQuest
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-[#64829b]">
            Effective date: November 3, 2026
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#64829b]">
            This policy explains how LinguisQuest may collect, use, and
            handle information when you use our language-learning platform.
          </p>
        </div>

        <div className="space-y-5">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-cyan-100 bg-white p-6 shadow-sm sm:p-8"
            >
              <h2 className="text-lg font-bold text-[#124b82]">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#64829b]">
                {section.content}
              </p>
            </section>
          ))}
        </div>

        <section className="mt-5 rounded-2xl border border-cyan-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold">11. Contact Us</h2>
          <p className="mt-3 text-sm leading-7 text-[#64829b]">
            For questions, requests, or concerns about this Privacy Policy
            or your personal information, contact the LinguisQuest team:
          </p>
          <p className="mt-3 text-sm font-semibold text-cyan-700">
            linguisquest@gmail.com
          </p>
        </section>

        <p className="mt-10 text-center text-xs text-[#7894aa]">
          © {new Date().getFullYear()} LinguisQuest. All rights reserved.
        </p>
      </div>
    </main>
  );
}
