"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Flame,
  Trophy,
  BookOpen,
  Mic,
  Heart,
  Sprout,
  ArrowRight,
  CheckCircle2,
  Globe,
  Compass,
  WandSparkles,
  MessageCircle,
  Headphones,
  Star,
  Play,
  Gamepad2,
  Brain,
  Target,
  Map,
} from "lucide-react";

const benefits = [
  {
    icon: Flame,
    title: "Gamified Learning",
    description: "Play, progress, and earn rewards as you learn.",
  },
  {
    icon: Mic,
    title: "Voice AI Companions",
    description: "Practice speaking through natural conversations.",
  },
  {
    icon: Heart,
    title: "Free to Start",
    description: "Begin your language adventure at no cost.",
  },
  {
    icon: Sprout,
    title: "Build Your Foundation",
    description: "Learn essential skills one step at a time.",
  },
];

const features = [
  {
    id: "foundation",
    label: "Foundation Learning",
    title: "Build Your Language Skills Step by Step",
    description:
      "Follow a guided learning roadmap that takes you from basic letters and vocabulary to grammar, sentence construction, and practical communication.",
    points: [
      "Follow a structured learning roadmap",
      "Practice through tracing, matching, and quizzes",
      "Test your understanding with mastery assessments",
    ],
    button: "Explore Foundation",
    href: "/sign-up",
    icon: BookOpen,
    color: "cyan",
    image: "https://ik.imagekit.io/uch28of0b/LinguisQuest-public-assets/Cheerful%20Icy-Blue%20Bird%20in%20the%20Sky.png",
  },
  {
    id: "story-mode",
    label: "Interactive Scenarios",
    title: "Learn Through Everyday Situations",
    description:
      "Explore practical situations and interactive activities where you can apply what you've learned and discover how language is used in everyday communication.",
    points: [
      "Practice real-life communication scenarios",
      "Apply vocabulary in meaningful situations",
      "Learn by actively participating",
    ],
    button: "Explore Scenarios",
    href: "/sign-up",
    icon: WandSparkles,
    color: "amber",
    image: "https://ik.imagekit.io/uch28of0b/LinguisQuest-public-assets/Magical%20Kingdom%20Rising%20from%20a%20Storybook.png",
  },
  {
    id: "ai-companion",
    label: "AI Companion",
    title: "Practice Conversations with AI",
    description:
      "Build your communication confidence through AI-powered voice conversations and an interactive chatbox where you can practice, ask questions, and express yourself.",
    points: [
      "Practice speaking through AI conversations",
      "Chat and ask questions anytime",
      "Improve pronunciation and communication confidence",
    ],
    button: "Meet Your Companion",
    href: "/sign-up",
    icon: Headphones,
    color: "blue",
    image: "https://ik.imagekit.io/uch28of0b/LinguisQuest-public-assets/Cheerful%20Bird%20Video%20Call.png",
  },
];

export default function LinguisQuestHome() {
    type ActiveSection = "home" | "features" | "about" | "faq";

  const [activeSection, setActiveSection] =
    useState<ActiveSection>("home");

  // Track which section is currently visible
  useEffect(() => {
    const updateActiveSection = () => {
      const marker = window.scrollY + 180;

      let currentSection: ActiveSection = "home";

      const sections: ActiveSection[] = [
        "features",
        "about",
        "faq",
      ];

      sections.forEach((sectionId) => {
        const section = document.getElementById(sectionId);

        if (section) {
          const sectionTop =
            section.getBoundingClientRect().top + window.scrollY;

          if (marker >= sectionTop) {
            currentSection = sectionId;
          }
        }
      });

      setActiveSection(currentSection);
    };

    updateActiveSection();

    window.addEventListener("scroll", updateActiveSection, {
      passive: true,
    });

    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, []);

  // Navigate to a section, even if its hash is already in the URL
  const scrollToSection = (
    event: React.MouseEvent<HTMLAnchorElement>,
    sectionId: ActiveSection
  ) => {
    event.preventDefault();

    const target = document.getElementById(sectionId);

    if (!target) return;

    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}#${sectionId}`
    );

    setActiveSection(sectionId);

    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Return to the homepage's top section
  const scrollToHome = (
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
    event.preventDefault();

    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search
    );

    setActiveSection("home");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  
  return (
    <main
      className="
        relative isolate min-h-screen
        bg-[#f2fbff] font-sans text-[#124b82]
        selection:bg-cyan-200 selection:text-[#075985]
        before:pointer-events-none before:absolute before:inset-0 before:-z-10
        before:bg-[linear-gradient(to_right,rgba(34,211,238,0.16)_0%,rgba(34,211,238,0.06)_22%,transparent_50%,rgba(34,211,238,0.06)_78%,rgba(34,211,238,0.16)_100%)]
      "
    >
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-cyan-100/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-2 px-3 sm:h-[76px] sm:gap-4 sm:px-8">

          {/* LOGO */}
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="https://ik.imagekit.io/uch28of0b/LinguisQuest-public-assets/LinguisQuest-title.png"
              alt="LinguisQuest"
              width={230}
              height={65}
              priority
              className="h-auto w-[125px] object-contain sm:w-[210px]"
            />
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden items-center gap-9 text-sm font-semibold md:flex">
            {/* HOME */}
            <Link
              href="/"
              onClick={scrollToHome}
              aria-current={activeSection === "home" ? "page" : undefined}
              className={`relative inline-flex items-center py-2 transition-colors duration-300
                after:absolute after:bottom-0 after:left-0 after:h-[3px]
                after:w-full after:origin-left after:rounded-full
                after:bg-cyan-500 after:transition-transform after:duration-300
                after:ease-out
                ${
                  activeSection === "home"
                    ? "text-cyan-700 after:scale-x-100 after:shadow-[0_0_8px_rgba(6,182,212,0.45)]"
                    : "text-[#285c89] after:scale-x-0 hover:text-cyan-600 hover:after:scale-x-100"
                }`}
            >
              Home
            </Link>

            {/* EXPLORE */}
            <Link
              href="#features"
              onClick={(event) => scrollToSection(event, "features")}
              aria-current={activeSection === "features" ? "location" : undefined}
              className={`relative inline-flex items-center py-2 transition-colors duration-300
                after:absolute after:bottom-0 after:left-0 after:h-[3px]
                after:w-full after:origin-left after:rounded-full
                after:bg-cyan-500 after:transition-transform after:duration-300
                after:ease-out
                ${
                  activeSection === "features"
                    ? "text-cyan-700 after:scale-x-100 after:shadow-[0_0_8px_rgba(6,182,212,0.45)]"
                    : "text-[#285c89] after:scale-x-0 hover:text-cyan-600 hover:after:scale-x-100"
                }`}
            >
              Explore
            </Link>

            {/* ABOUT */}
            <Link
              href="#about"
              onClick={(event) => scrollToSection(event, "about")}
              aria-current={activeSection === "about" ? "location" : undefined}
              className={`relative inline-flex items-center py-2 transition-colors duration-300
                after:absolute after:bottom-0 after:left-0 after:h-[3px]
                after:w-full after:origin-left after:rounded-full
                after:bg-cyan-500 after:transition-transform after:duration-300
                after:ease-out
                ${
                  activeSection === "about"
                    ? "text-cyan-700 after:scale-x-100 after:shadow-[0_0_8px_rgba(6,182,212,0.45)]"
                    : "text-[#285c89] after:scale-x-0 hover:text-cyan-600 hover:after:scale-x-100"
                }`}
            >
              About
            </Link>

            {/* FAQ */}
            <Link
              href="#faq"
              onClick={(event) => scrollToSection(event, "faq")}
              aria-current={activeSection === "faq" ? "location" : undefined}
              className={`relative inline-flex items-center py-2 transition-colors duration-300
                after:absolute after:bottom-0 after:left-0 after:h-[3px]
                after:w-full after:origin-left after:rounded-full
                after:bg-cyan-500 after:transition-transform after:duration-300
                after:ease-out
                ${
                  activeSection === "faq"
                    ? "text-cyan-700 after:scale-x-100 after:shadow-[0_0_8px_rgba(6,182,212,0.45)]"
                    : "text-[#285c89] after:scale-x-0 hover:text-cyan-600 hover:after:scale-x-100"
                }`}
            >
              FAQ
            </Link>
          </nav>

          {/* AUTH BUTTONS */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <Link
              href="/sign-in"
              className="rounded-full px-2 py-2 text-xs font-bold text-[#285c89] transition hover:bg-cyan-50 sm:px-4 sm:text-sm"
            >
              Sign In
            </Link>

            <Link
              href="/sign-up"
              className="flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 px-3 py-2.5 text-xs font-extrabold text-white shadow-md shadow-cyan-200 transition hover:-translate-y-0.5 hover:shadow-cyan-300 sm:gap-2 sm:px-5 sm:text-sm"
            >
              <span className="sm:hidden">Get Started</span>
              <span className="hidden sm:inline">Start Learning Free</span>
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          </div>

        </div>
      </header>
  
      {/* HERO */}
      <section className="relative isolate min-h-[620px] overflow-hidden bg-[#dff7ff] sm:min-h-[680px] lg:min-h-[720px]">

        {/* Full-section background image */}
        <div className="absolute inset-0 -z-20">
          <Image
            src="https://ik.imagekit.io/uch28of0b/LinguisQuest-public-assets/Chibi%20Blue%20Bird%20Knight%20in%20Fantasy%20Landscape.png"
            alt="LinguisQuest adventurer overlooking an enchanted valley"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        {/* Soft overlay for readable text */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#e7f9ff]/95 via-[#e7f9ff]/45 to-transparent" />

        {/* Additional soft atmospheric overlay */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-white/10 via-transparent to-cyan-100/20" />

        {/* Hero content */}
        <div className="relative z-10 mx-auto grid min-h-[620px] max-w-7xl items-center px-5 pb-28 pt-16 sm:px-8 sm:pb-32 lg:min-h-[720px] lg:grid-cols-2 lg:pb-36">

          <div className="flex max-w-xl flex-col items-start">

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/80 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-cyan-700 shadow-sm backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-cyan-500" />
              Your language adventure begins
            </div>

            <h1 className="text-4xl font-black leading-[1.12] tracking-tight text-[#104d85] sm:text-5xl lg:text-[3.8rem]">
              Learn Languages.
              <span className="block bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                Play, Practice, Progress.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base font-medium leading-8 text-[#315f84] sm:text-lg">
              Discover a more engaging way to learn languages through guided
              lessons, interactive activities, real-life scenarios, and
              AI-powered conversations. Start your journey with Tagalog
              and build your confidence one adventure at a time.
            </p>

            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/sign-up"
                className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-500 px-8 py-4 text-sm font-black text-white shadow-xl shadow-cyan-300/40 transition hover:-translate-y-1 hover:shadow-cyan-400/50"
              >
                Start Learning Free
                <ArrowRight className="h-5 w-5" />
              </Link>

              <Link
                href="#features"
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/80 bg-white/80 px-7 py-4 text-sm font-bold text-[#23618d] shadow-sm backdrop-blur-md transition hover:bg-white"
              >
                <Play className="h-4 w-4 fill-cyan-500 text-cyan-500" />
                Explore Features
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-xs font-bold text-[#426b8d] sm:text-sm">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-cyan-600" />
                Free to Start
              </span>

              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-cyan-600" />
                AI-Powered
              </span>

              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-cyan-600" />
                Learn by Playing
              </span>
            </div>
          </div>

          {/* Keeps the right side open so the mascot and castle remain visible */}
          <div className="hidden lg:block" />
        </div>

        {/* WAVE 1 - Cyan translucent wave behind */}
        <div className="pointer-events-none absolute bottom-0 left-0 z-20 w-full overflow-hidden leading-none">
          <svg
            className="block h-[75px] w-full sm:h-[105px]"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,65 C240,120 430,5 720,48 C1010,92 1190,110 1440,35 L1440,120 L0,120 Z"
              fill="rgba(165,243,252,0.7)"
            />
          </svg>
        </div>

        {/* WAVE 2 - Light cyan / white foreground wave */}
        <div className="pointer-events-none absolute bottom-0 left-0 z-30 w-full overflow-hidden leading-none">
          <svg
            className="block h-[48px] w-full sm:h-[70px]"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
  d="M0,55 C250,5 450,100 720,65 C1000,30 1200,5 1440,55 L1440,120 L0,120 Z"
  fill="#D2F5FC"
/>
          </svg>
        </div>
      </section>
      {/* BENEFITS STRIP */}
      <section className="relative z-10 mx-auto -mt-1 max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-2 gap-5 rounded-[2rem] border border-white bg-white/85 p-6 shadow-xl shadow-sky-100/70 backdrop-blur md:grid-cols-4 md:gap-3 md:p-7">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <div
                key={benefit.title}
                className={`flex flex-col items-center px-2 text-center ${
                  index !== 0 && index !== 2
                    ? "md:border-l md:border-cyan-100"
                    : ""
                }`}
              >
                <Icon className="mb-3 h-7 w-7 text-cyan-500" />
                <h3 className="text-sm font-black text-[#15558d]">
                  {benefit.title}
                </h3>
                <p className="mt-1 max-w-[190px] text-xs leading-5 text-[#64829b]">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 sm:px-8">

        <div className="mb-14 text-center">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-cyan-600">
            Discover your learning path
          </span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#124b82] sm:text-4xl">
            Three Ways to Begin Your Quest
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#64829b] sm:text-base">
            Build your skills, create your own adventures, and practice
            speaking with an AI companion. Your journey is yours to shape.
          </p>
        </div>

        
<div className="space-y-8">
  {features.map((feature) => {
    const isStory = feature.id === "story-mode";
    const imageOnLeft = !isStory;

    const background = isStory
      ? "#fff9e8"
      : feature.id === "ai-companion"
      ? "#e5f7ff"
      : "#f2fbff";

    return (
      <article
        key={feature.id}
        id={feature.id}
        className="relative isolate min-h-[380px] overflow-hidden rounded-[2rem] border-4 border-white shadow-xl shadow-sky-100/70 sm:min-h-[420px]"
        style={{ backgroundColor: background }}
      >
        {/* IMAGE - HIDDEN ON MOBILE */}
        <div
          className={`absolute inset-y-0 hidden w-[60%] lg:block ${
            imageOnLeft ? "left-0" : "right-0"
          }`}
        >
          <Image
            src={feature.image}
            alt={`${feature.label} illustration`}
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
          />
        </div>

        {/* GRADIENT - DESKTOP ONLY */}
        <div
          className="pointer-events-none absolute inset-0 z-[1] hidden lg:block"
          style={{
            background: imageOnLeft
              ? `linear-gradient(
                  to left,
                  ${background} 0%,
                  ${background} 38%,
                  ${background} 48%,
                  transparent 82%
                )`
              : `linear-gradient(
                  to right,
                  ${background} 0%,
                  ${background} 38%,
                  ${background} 48%,
                  transparent 82%
                )`,
          }}
        />

        {/* CONTENT */}
        <div
          className={`relative z-10 flex min-h-[380px] items-center justify-start py-10 sm:min-h-[420px] sm:py-14 ${
            imageOnLeft
              ? "lg:justify-end"
              : "lg:justify-start"
          }`}
        >
          <div
            className={`w-full px-6 sm:px-10 lg:w-[55%] lg:px-12 ${
              imageOnLeft
                ? "lg:ml-auto"
                : "lg:mr-auto"
            }`}
          >
            <span
              className={`inline-flex rounded-full px-4 py-1.5 text-xs font-black ${
                isStory
                  ? "bg-amber-200/90 text-amber-800"
                  : "bg-cyan-100 text-cyan-700"
              }`}
            >
              {feature.label}
            </span>

            <h3 className="mt-4 text-2xl font-black leading-tight text-[#124b82] sm:text-3xl">
              {feature.title}
            </h3>

            <p className="mt-4 max-w-lg text-sm leading-7 text-[#426b8d] sm:text-base">
              {feature.description}
            </p>

            <ul className="mt-5 space-y-3">
              {feature.points.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-2.5 text-sm font-semibold text-[#315f84]"
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-cyan-500" />
                  {point}
                </li>
              ))}
            </ul>

            <Link
              href={feature.href}
              className="mt-7 inline-flex items-center gap-2 rounded-full border border-cyan-400 bg-white/80 px-5 py-3 text-sm font-extrabold text-cyan-700 transition hover:bg-cyan-500 hover:text-white"
            >
              {feature.button}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>
    );
  })}
</div>
</section>


      {/* ABOUT / FINAL CTA */}
      {/* <section id="about" className="px-5 pb-20 sm:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-cyan-200 via-sky-100 to-blue-200 px-6 py-12 shadow-lg shadow-sky-100 sm:px-12 sm:py-14">
          <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-white/40 blur-2xl" />
          <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-cyan-300/40 blur-2xl" />

          <div className="relative flex flex-col items-center justify-between gap-8 text-center md:flex-row md:text-left">
            <div>
              <div className="mb-3 flex items-center justify-center gap-2 md:justify-start">
                <Sparkles className="h-5 w-5 text-cyan-600" />
                <span className="text-xs font-black uppercase tracking-widest text-cyan-700">
                  Your journey starts here
                </span>
              </div>
              <h2 className="text-2xl font-black text-[#124b82] sm:text-3xl">
                Your Language Adventure Awaits!
              </h2>
              <p className="mt-3 text-sm font-medium text-[#426b8d]">
                Join LinguisQuest and discover a more confident you.
              </p>
            </div>

            <Link
              href="/sign-up"
              className="flex shrink-0 items-center gap-3 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 px-7 py-4 text-sm font-black text-white shadow-xl shadow-cyan-300/50 transition hover:-translate-y-1"
            >
              Start Learning Free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section> */}
      {/* ABOUT LINGUISQUEST */}
      <section
        id="about"
        className="relative scroll-mt-24 px-5 py-24 sm:px-8"
      >
        <div className="mx-auto max-w-7xl">

          <div className="mx-auto mb-14 max-w-3xl text-center">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-cyan-600">
              About LinguisQuest
            </span>

            <h2 className="mt-3 text-3xl font-black leading-tight text-[#124b82] sm:text-4xl">
              A Smarter and More Interactive Way to Learn Languages
            </h2>

            <p className="mt-5 text-sm leading-8 text-[#64829b] sm:text-base">
              LinguisQuest is an AI-powered gamified language learning
              system designed to make learning more engaging, interactive,
              and accessible. By combining guided lessons, game-based
              activities, and artificial intelligence, learners can
              develop their language skills through active participation
              instead of relying only on memorization.
            </p>
          </div>

          <div className="grid items-center gap-10 lg:grid-cols-2">

            {/* Main description */}
            <div className="relative overflow-hidden rounded-[2rem] border-4 border-white bg-gradient-to-br from-cyan-100 via-sky-100 to-blue-100 p-8 shadow-xl shadow-sky-100/70 sm:p-12">
              <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/50 blur-3xl" />
              <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-cyan-200/50 blur-3xl" />

              <div className="relative">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-xs font-bold text-cyan-700">
                  <Sparkles className="h-4 w-4" />
                  Learn. Play. Communicate.
                </div>

                <h3 className="text-2xl font-black leading-tight text-[#124b82] sm:text-3xl">
                  More Than Lessons. A Complete Learning Journey.
                </h3>

                <p className="mt-5 text-sm leading-8 text-[#426b8d]">
                  Start with the fundamentals, strengthen your understanding
                  through interactive activities, and apply your knowledge
                  in practical communication scenarios. With AI-powered
                  assistance and personalized learning support, LinguisQuest
                  encourages you to keep learning at your own pace.
                </p>

                <Link
                  href="/sign-up"
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-cyan-200 transition hover:-translate-y-0.5"
                >
                  Start Your Quest
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* System highlights */}
            <div className="space-y-5">

              {[
                {
                  icon: Map,
                  title: "Guided Learning Roadmap",
                  description:
                    "Progress through organized learning stages, from letters and sounds to vocabulary, grammar, and communication.",
                },
                {
                  icon: Gamepad2,
                  title: "Gamified Learning Experience",
                  description:
                    "Stay motivated through interactive activities, points, achievements, levels, and progress tracking.",
                },
                {
                  icon: Brain,
                  title: "AI-Powered Learning Support",
                  description:
                    "Receive AI-assisted learning suggestions and practice conversations based on your learning needs.",
                },
                {
                  icon: Target,
                  title: "Lesson Mastery Assessment",
                  description:
                    "Review your understanding at the end of each lesson and revisit assessments whenever you want to practice again.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex gap-5 rounded-2xl border border-cyan-100 bg-white/85 p-6 shadow-sm"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-100">
                      <Icon className="h-6 w-6 text-cyan-600" />
                    </div>

                    <div>
                      <h3 className="font-black text-[#15558d]">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-[#64829b]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section
        id="faq"
        className="relative scroll-mt-24 px-5 py-24 sm:px-8"
      >
        <div className="mx-auto max-w-4xl">

          <div className="mb-12 text-center">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-cyan-600">
              Frequently Asked Questions
            </span>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#124b82] sm:text-4xl">
              Everything You Need to Know
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#64829b] sm:text-base">
              Learn more about LinguisQuest, its features, and how you
              can begin your language-learning journey.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "What is LinguisQuest?",
                answer:
                  "LinguisQuest is an AI-powered gamified language learning system that combines guided lessons, interactive activities, real-life scenarios, and AI-assisted conversations to create a more engaging learning experience.",
              },
              {
                question: "What languages can I learn?",
                answer:
                  "LinguisQuest supports multiple language-learning options, with Tagalog as the default learning language. Available language options depend on the languages currently supported by the system.",
              },
              {
                question: "How does the Foundation Learning Path work?",
                answer:
                  "The Foundation Learning Path guides you through progressive stages of learning. It begins with Letters and Sounds, followed by Basic Vocabulary, Simple Sentence Construction, Grammar Fundamentals, Practice and Application, and Confidence and Communication.",
              },
              {
                question: "What activities are available?",
                answer:
                  "Learners can participate in interactive activities such as tracing, matching-type exercises, and multiple-choice assessments. These activities help reinforce letter recognition, vocabulary, comprehension, and understanding.",
              },
              {
                question: "What is the Lesson Mastery Assessment?",
                answer:
                  "The Lesson Mastery Assessment is an assessment provided at the end of each lesson to check your understanding. Even after answering correctly, you can revisit the assessment and practice again to reinforce what you have learned.",
              },
              {
                question: "How does AI help me learn?",
                answer:
                  "AI supports the learning experience through personalized learning suggestions, conversational practice, and an interactive chatbox. It allows you to ask questions, practice dialogues, and receive responses while learning.",
              },
              {
                question: "Can I practice speaking with an AI assistant?",
                answer:
                  "Yes! LinguisQuest includes AI-powered conversational practice that allows you to speak with an AI assistant. It is designed to help you develop pronunciation, fluency, and confidence in communication.",
              },
              {
                question: "Can I track my learning progress?",
                answer:
                  "Yes. LinguisQuest includes progress tracking so you can monitor completed lessons, assessment scores, and your overall learning progress.",
              },
              {
                question: "Do I need to install an application?",
                answer:
                  "No separate application installation is required. LinguisQuest is web-based and can be accessed through a supported browser on an internet-connected device.",
              },
              {
                question: "Who can use LinguisQuest?",
                answer:
                  "LinguisQuest is intended for high school and college students, as well as independent learners who want to improve their vocabulary, comprehension, pronunciation, and communication skills.",
              },
            ].map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl border border-cyan-100 bg-white/90 p-5 shadow-sm transition duration-300 hover:border-cyan-200 hover:shadow-md sm:p-6"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-[#15558d] marker:hidden">
                  <span>{item.question}</span>

                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-cyan-600 transition duration-300 group-open:rotate-45 group-open:bg-cyan-100">
                    <span className="text-2xl leading-none">+</span>
                  </span>
                </summary>

                <p className="mt-4 border-t border-cyan-50 pt-4 text-sm leading-7 text-[#64829b]">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>

          <div className="mt-12 rounded-[2rem] bg-gradient-to-r from-cyan-100 via-sky-100 to-blue-100 px-6 py-8 text-center sm:px-10">
            <h3 className="text-xl font-black text-[#124b82]">
              Your Language Journey Starts Here!
            </h3>

            <p className="mt-2 text-sm leading-7 text-[#64829b]">
              Explore a new way to learn, practice, and grow with LinguisQuest.
            </p>

            <Link
              href="/sign-up"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-cyan-200 transition hover:-translate-y-0.5"
            >
              Start Learning Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* FAQ ANCHOR / FOOTER */}
      <footer className="border-t border-cyan-100 bg-white/80">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 py-8 text-center sm:px-8 md:flex-row md:text-left">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <Image
              src="https://ik.imagekit.io/uch28of0b/LinguisQuest-public-assets/LinguisQuest-title.png"
              alt="LinguisQuest"
              width={180}
              height={50}
              className="h-auto w-[155px] object-contain"
            />
            <p className="text-xs text-[#7894aa]">
              © {new Date().getFullYear()} LinguisQuest. All rights reserved.
            </p>
          </div>     
          <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold text-[#64829b]">
            <Link
              href="/privacy-policy"
              className="transition hover:text-cyan-600"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms"
              className="transition hover:text-cyan-600"
            >
              Terms of Service
            </Link>

            <Link
              href="/contact"
              className="transition hover:text-cyan-600"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
