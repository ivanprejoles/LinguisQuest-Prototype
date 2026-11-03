
"use client";

import Link from "next/link";
import {
  ChevronLeft,
  Mail,
  MessageCircle,
  Headphones,
  Send,
} from "lucide-react";

const contactEmail = "linguisquest@gmail.com";

export default function ContactPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f2fbff] px-5 py-12 text-[#124b82] sm:px-8">
      {/* Back to homepage */}
      <Link
        href="/"
        aria-label="Back to homepage"
        className="fixed left-5 top-5 z-50 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/50 bg-slate-950/90 text-cyan-300 shadow-lg transition-all hover:-translate-x-1 hover:bg-cyan-950 sm:left-8 sm:top-8"
      >
        <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
      </Link>

      <div className="mx-auto max-w-5xl pt-10">
        {/* Page heading */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
            <MessageCircle className="h-7 w-7" />
          </div>

          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-600">
            We're Here to Help
          </p>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            Contact Us
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#64829b] sm:text-base">
            Have a question, need assistance, or want to share feedback?
            We'd love to hear from you. Get in touch with the LinguisQuest
            team.
          </p>
        </div>

        {/* Contact content */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact information */}
          <section className="rounded-3xl border border-cyan-100 bg-white p-7 shadow-sm sm:p-9">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
              <Headphones className="h-6 w-6" />
            </div>

            <h2 className="text-2xl font-black">
              Get in Touch
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#64829b]">
              For questions or concerns about LinguisQuest, you can
              reach our team through the email address below.
            </p>

            <div className="mt-8 rounded-2xl border border-cyan-100 bg-[#f2fbff] p-5">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-cyan-600" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#7894aa]">
                    Email Address
                  </p>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="mt-1 break-all text-sm font-bold text-cyan-700 transition hover:text-cyan-500"
                  >
                    {contactEmail}
                  </a>
                </div>
              </div>
            </div>

            <a
              href={`mailto:${contactEmail}?subject=${encodeURIComponent("LinguisQuest Inquiry")}`}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border-b-4 border-cyan-800 bg-cyan-500 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 active:translate-y-1 active:border-b-0"
            >
              <Send className="h-4 w-4" />
              Send Us an Email
            </a>
          </section>

          {/* Inquiry categories */}
          <section className="rounded-3xl border border-cyan-100 bg-white p-7 shadow-sm sm:p-9">
            <h2 className="text-2xl font-black">
              How Can We Help?
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#64829b]">
              You can contact us about any of the following:
            </p>

            <div className="mt-7 space-y-5">
              {[
                {
                  title: "Account Assistance",
                  description:
                    "Questions about registration, signing in, or your account.",
                },
                {
                  title: "Technical Support",
                  description:
                    "Report problems with lessons, activities, or platform features.",
                },
                {
                  title: "Learning Support",
                  description:
                    "Questions about learning activities, assessments, or AI practice.",
                },
                {
                  title: "Privacy Concerns",
                  description:
                    "Questions or requests concerning your personal information.",
                },
                {
                  title: "Feedback and Suggestions",
                  description:
                    "Share ideas that could improve the LinguisQuest experience.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-3">
                  <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-500" />
                  <div>
                    <h3 className="text-sm font-bold text-[#124b82]">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-[#7894aa]">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <p className="mt-12 text-center text-xs text-[#7894aa]">
          © {new Date().getFullYear()} LinguisQuest. All rights reserved.
        </p>
      </div>
    </main>
  );
}
