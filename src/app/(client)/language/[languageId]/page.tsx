
"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  ArrowDownRight,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Mic,
  Sparkles,
  UserRound,
  X,
} from "lucide-react"

type Feature = {
  id: string
  title: string
  subtitle: string
  description: string
  icon: typeof GraduationCap
  image: string
  accent: string
  glow: string
  href: string
}

const features: Feature[] = [
  {
    id: "foundation",
    title: "Foundation Path",
    subtitle: "BUILD YOUR BASICS",
    description:
      "Learn essential vocabulary and grammar through fun, structured lessons.",
    icon: GraduationCap,
    image:
      "https://ik.imagekit.io/uch28of0b/LinguisQuest-public-assets/Path%20to%20the%20Enchanted%20Academy.png?auto=format&fit=crop&w=1400&q=85",
    accent: "#32ddba",
    glow: "rgba(50,221,186,0.35)",
    href: "foundation",
  },
  {
    id: "story",
    title: "Story Quest",
    subtitle: "CHOOSE YOUR PATH",
    description:
      "Enter interactive stories, make meaningful choices, and discover where your adventure leads.",
    icon: BookOpen,
    image:
      "https://ik.imagekit.io/uch28of0b/LinguisQuest-public-assets/Adventurer_s%20View%20of%20the%20Skybound%20Kingdom.png?auto=format&fit=crop&w=1400&q=85",
    accent: "#ff8c37",
    glow: "rgba(255,140,55,0.35)",
    href: "story",
  },
  {
    id: "communication",
    title: "AI Communication",
    subtitle: "SPEAK WITH CONFIDENCE",
    description:
      "Practice real conversations with an AI partner and build your speaking confidence.",
    icon: Mic,
    image:
      "https://ik.imagekit.io/uch28of0b/LinguisQuest-public-assets/Cozy%20AI%20English%20Learning%20Chat.png?auto=format&fit=crop&w=1400&q=85",
    accent: "#bd69ff",
    glow: "rgba(189,105,255,0.35)",
    href: "conversation",
  },
]

type Origin = {
  left: number
  top: number
  width: number
  height: number
}

export default function LanguagesPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [selected, setSelected] = useState<Feature | null>(null)
  const [origin, setOrigin] = useState<Origin | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function enterFeature(
    feature: Feature,
    element: HTMLButtonElement,
  ) {
    if (selected) return

    const rect = element.getBoundingClientRect()

    setOrigin({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    })

    setSelected(feature)
    setExpanded(false)
    setIsExiting(false)

    requestAnimationFrame(() => {
      requestAnimationFrame(() => setExpanded(true))
    })
  }

  function closePortal() {
    if (!origin || !selected) return

    setIsExiting(true)
    setExpanded(false)

    timerRef.current = setTimeout(() => {
      setSelected(null)
      setOrigin(null)
      setIsExiting(false)
    }, 720)
  }

  function finishTransition() {
    if (!selected || !expanded || isExiting) return

    // Extract just the last segment (e.g., "foundation", "story-quest") from selected.href
    const subRoute = selected.href.split("/").pop()
    
    const basePath = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname
    router.push(`${basePath}/${subRoute}`)
  }

  return (
    <main className="relative h-fit overflow-hidden text-white">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-cyan-500/[0.07] blur-[130px]" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-blue-600/[0.06] blur-[150px]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-violet-500/[0.05] blur-[120px]" />
      </div>


      {/* Main selection */}
      <section className="relative z-10 mx-auto max-w-[1600px] px-5 pb-16 pt-8 sm:px-8 lg:items-center lg:gap-10 lg:px-12 lg:py-12">
        

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon

            return (
              <button
                key={feature.id}
                type="button"
                onClick={(event) =>
                  enterFeature(feature, event.currentTarget)
                }
                disabled={!!selected}
                aria-label={`Enter ${feature.title}`}
                className="group relative isolate flex min-h-[430px] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[#0a111d] text-left transition duration-300 hover:-translate-y-1 hover:border-white/30 hover:shadow-2xl disabled:cursor-default sm:min-h-[470px] xl:min-h-[530px]"
                style={{
                  ["--accent" as string]: feature.accent,
                  ["--glow" as string]: feature.glow,
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Background image */}
                <div
                  className="absolute inset-0 -z-20 bg-cover bg-center transition duration-700 ease-out group-hover:scale-105"
                  style={{ backgroundImage: `url("${feature.image}")` }}
                />

                {/* Dark gradient */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#05080d]/25 via-[#05080d]/25 to-[#05080d] transition duration-300 group-hover:from-[#05080d]/10" />

                <div
                  className="absolute inset-0 -z-10 opacity-0 transition duration-500 group-hover:opacity-100"
                  style={{
                    background: `linear-gradient(145deg, ${feature.glow}, transparent 65%)`,
                  }}
                />

                {/* Top label */}
                <div className="flex w-full items-center justify-between p-5 sm:p-6">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                    Journey 0{index + 1}
                  </span>
                  <span className="rounded-full border border-white/20 bg-black/20 px-3 py-1 text-[10px] text-white/80 backdrop-blur-md">
                    Explore
                  </span>
                </div>

                <div className="mt-auto p-5 sm:p-6">
                  <div
                    className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 backdrop-blur-xl transition duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: `${feature.accent}30`,
                      color: feature.accent,
                      boxShadow: `0 0 30px ${feature.glow}`,
                    }}
                  >
                    <Icon size={25} />
                  </div>

                  <p
                    className="mb-2 text-[10px] font-bold tracking-[0.2em]"
                    style={{ color: feature.accent }}
                  >
                    {feature.subtitle}
                  </p>

                  <h2 
                    className="text-2xl font-bold tracking-tight sm:text-[27px]"
                    style={{ color: feature.accent }}
                  >
                    {feature.title}
                  </h2>

                  <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">
                    {feature.description}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-white/15 pt-4">
                    <span className="text-xs font-medium text-white/70 transition group-hover:text-white">
                      Enter experience
                    </span>
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/20 transition duration-300 group-hover:translate-x-1 group-hover:border-white group-hover:bg-white group-hover:text-black"
                    >
                      <ArrowRight size={18} />
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </section>


      {/* Cinematic portal overlay */}
      {selected && origin && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Entering ${selected.title}`}
          className="fixed z-[100] overflow-hidden bg-[#05080d]"
          onTransitionEnd={(event) => {
            if (
              event.target === event.currentTarget &&
              event.propertyName === "width"
            ) {
              finishTransition()
            }
          }}
          style={{
            left: expanded ? 0 : origin.left,
            top: expanded ? 0 : origin.top,
            width: expanded ? "100vw" : origin.width,
            height: expanded ? "100dvh" : origin.height,
            borderRadius: expanded ? 0 : 24,
            transition:
              "left 700ms cubic-bezier(0.16, 1, 0.3, 1), top 700ms cubic-bezier(0.16, 1, 0.3, 1), width 700ms cubic-bezier(0.16, 1, 0.3, 1), height 700ms cubic-bezier(0.16, 1, 0.3, 1), border-radius 500ms ease",
            willChange: "left, top, width, height",
          }}
        >
          <div
            className="absolute inset-0 scale-110 bg-cover bg-center transition-transform duration-[1200ms]"
            style={{
              backgroundImage: `url("${selected.image}")`,
              transform: expanded ? "scale(1)" : "scale(1.12)",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#03060c]/95 via-[#03060c]/65 to-[#03060c]/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#03060c]/80 via-transparent to-[#03060c]/20" />

          <button
            type="button"
            onClick={closePortal}
            aria-label="Cancel transition"
            className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-xl transition hover:bg-white/15"
          >
            <X size={20} />
          </button>

          <div
            className={`relative flex h-full flex-col justify-center px-7 py-16 transition-all duration-500 sm:px-14 lg:px-24 ${
              expanded
                ? "translate-y-0 opacity-100"
                : "translate-y-6 opacity-0"
            }`}
          >
            <div className="max-w-2xl">
              <div
                className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 backdrop-blur-xl sm:h-20 sm:w-20"
                style={{
                  color: selected.accent,
                  backgroundColor: `${selected.accent}25`,
                  boxShadow: `0 0 60px ${selected.glow}`,
                }}
              >
                <selected.icon size={34} />
              </div>

              <p
                className="mb-4 text-xs font-semibold tracking-[0.3em] sm:text-sm"
                style={{ color: selected.accent }}
              >
                YOUR NEXT ADVENTURE BEGINS
              </p>

              <h2 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                {selected.title}
              </h2>

              <p className="mt-6 max-w-xl text-base leading-8 text-slate-200 sm:text-lg">
                {selected.description}
              </p>

              <div className="mt-10 flex items-center gap-3 text-sm text-white/70">
                <span
                  className="h-2 w-2 animate-pulse rounded-full"
                  style={{ backgroundColor: selected.accent }}
                />
                Preparing your experience...
              </div>
            </div>
          </div>

          {/* Portal light sweep */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 opacity-30 blur-2xl"
            style={{
              background: `linear-gradient(90deg, transparent, ${selected.accent}, transparent)`,
              animation: expanded
                ? "portal-sweep 1.1s ease-out both"
                : "none",
            }}
          />
        </div>
      )}

      <style jsx global>{`
        @keyframes portal-sweep {
          from {
            transform: translateX(-150%) skewX(-12deg);
          }
          to {
            transform: translateX(450%) skewX(-12deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </main>
  )
}
