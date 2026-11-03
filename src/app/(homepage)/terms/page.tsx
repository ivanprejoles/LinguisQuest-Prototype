
"use client";

import Link from "next/link";
import { ChevronLeft, FileText } from "lucide-react";

const sections = [
  {
    title: "1. Acceptance of These Terms",
    content:
      "By accessing or using LinguisQuest, you agree to these Terms of Service. If you do not agree with these terms, please do not use the platform.",
  },
  {
    title: "2. About LinguisQuest",
    content:
      "LinguisQuest is a web-based, AI-powered gamified language-learning system. It provides guided learning activities, interactive exercises, practical communication scenarios, AI-assisted conversations, and learning progress features. Tagalog is the default learning language, with other language options depending on the languages supported by the system.",
  },
  {
    title: "3. User Accounts",
    content:
      "Some features require an account. You are responsible for providing accurate registration information, keeping your sign-in credentials secure, and notifying the team if you believe your account has been accessed without permission.",
  },
  {
    title: "4. Acceptable Use",
    content:
      "You agree to use LinguisQuest responsibly and for lawful learning purposes. You must not attempt to disrupt the platform, access another user's account without permission, misuse its features, or submit content that is unlawful, harmful, or abusive.",
  },
  {
    title: "5. Learning Activities and Assessments",
    content:
      "LinguisQuest provides lessons, exercises, quizzes, interactive scenarios, and Lesson Mastery Assessments to support learning. Scores and results are intended to help learners monitor their progress. They should not be treated as formal academic certification unless the project explicitly provides such certification.",
  },
  {
    title: "6. AI-Powered Features",
    content:
      "AI-generated responses, suggestions, and conversations are intended to support language practice. They may occasionally contain inaccurate, incomplete, or inappropriate information. Learners should use their judgment and should not treat AI responses as guaranteed correct or as a replacement for qualified instruction.",
  },
  {
    title: "7. Intellectual Property",
    content:
      "The LinguisQuest name, branding, interface, original learning materials, and other project content are owned by or used with permission by their respective rights holders. You may use the platform for personal learning, but you may not reproduce, distribute, or commercially exploit protected content without permission.",
  },
  {
    title: "8. Service Availability",
    content:
      "LinguisQuest is provided through a web browser. Features may occasionally be unavailable because of maintenance, technical issues, connectivity problems, or changes to third-party services. We do not guarantee uninterrupted availability.",
  },
  {
    title: "9. Third-Party Services",
    content:
      "Some features may rely on third-party services, including authentication and AI service providers. Their services may be governed by separate terms and privacy policies. Users should review those policies where applicable.",
  },
  {
    title: "10. Account Suspension or Termination",
    content:
      "Access to an account may be restricted or terminated if there is misuse of the platform, a violation of these terms, or another legitimate operational or legal reason. Any applicable user rights remain subject to relevant law.",
  },
  {
    title: "11. Changes to These Terms",
    content:
      "These terms may be revised as LinguisQuest changes. Updated terms should be published on this page with a revised effective date. Continued use after changes take effect may constitute acceptance where permitted by applicable law.",
  },
];

export default function TermsPage() {
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
            <FileText className="h-7 w-7" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-600">
            LinguisQuest
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-[#64829b]">
            Effective date: November 3, 2026
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#64829b]">
            Please read these terms before using LinguisQuest. They explain
            the basic rules and responsibilities for using our platform.
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
          <h2 className="text-lg font-bold">12. Contact Information</h2>
          <p className="mt-3 text-sm leading-7 text-[#64829b]">
            If you have questions about these Terms of Service, you may
            contact the LinguisQuest team at:
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
