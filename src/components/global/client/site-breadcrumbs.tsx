"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Languages,
  LayoutGrid,
  Route,
  Layers,
  Gamepad2,
  BookOpen,
  MessageCircle,
  ChevronRight,
  House,
  LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

type BreadcrumbItem = {
  label: string
  href: string
  icon: LucideIcon
}

const featureConfig = {
  foundation: {
    label: "Foundation Roadmap",
    icon: Route,
  },
  story: {
    label: "Stories",
    icon: BookOpen,
  },
  "ai-communication": {
    label: "AI Communication",
    icon: MessageCircle,
  },
} as const

export function SiteBreadcrumbs({
  languageName = "Your language",
  stageName,
}: {
  languageName?: string
  stageName?: string
}) {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  // Only show these breadcrumbs inside the language section.
  if (segments[0] !== "language") return null

  const items: BreadcrumbItem[] = [
    {
      label: "Languages",
      href: "/language",
      icon: Languages,
    },
  ]

  const languageId = segments[1]

  if (!languageId) return renderBreadcrumbs(items, pathname)

  items.push({
    label: languageName,
    href: `/language/${languageId}`,
    icon: LayoutGrid,
  })

  const feature = segments[2]

  // Language feature selection page.
  if (!feature) {
    items[1].label = "Choose a feature"
    return renderBreadcrumbs(items, pathname)
  }

  const config =
    featureConfig[feature as keyof typeof featureConfig]

  // Feature pages: foundation, story, or ai-communication.
  items.push({
    label: config?.label ?? formatLabel(feature),
    href: `/language/${languageId}/${feature}`,
    icon: config?.icon ?? LayoutGrid,
  })

  // Foundation roadmap page.
  if (segments.length === 3) {
    return renderBreadcrumbs(items, pathname)
  }

  // Stage selection page.
  const stageId = segments[3]

  if (stageId) {
    items.push({
      label: stageName ?? "Stage",
      href: `/language/${languageId}/${feature}/${stageId}`,
      icon: Layers,
    })
  }

  // Actual learning game page (Foundation only).
  const gameId = segments[4]

  if (gameId && feature === "foundation") {
    items.push({
      label: "Playing game",
      href: pathname,
      icon: Gamepad2,
    })
  }

  return renderBreadcrumbs(items, pathname)
}

function formatLabel(value: string) {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function renderBreadcrumbs(
  items: BreadcrumbItem[],
  pathname: string
) {
  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1.5">
        {items.map((item, index) => {
          const isCurrent = item.href === pathname
          const Icon = item.icon

          return (
            <li
              key={`${item.href}-${index}`}
              className="flex min-w-0 items-center gap-1.5"
            >
              {index > 0 && (
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground/60"
                />
              )}

              <Link
                href={item.href}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "group inline-flex min-w-0 items-center gap-1.5 rounded-md px-1.5 py-1.5 lg:px-2",
                  "text-sm transition-colors",
                  "hover:bg-cyan-50 hover:text-cyan-600",
                  "dark:hover:bg-cyan-950/50 dark:hover:text-cyan-400",
                  isCurrent
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                )}
              >
                <Icon
                  aria-hidden="true"
                  className="size-4 shrink-0 transition-colors group-hover:text-cyan-600 dark:group-hover:text-cyan-400"
                />

                <span className="hidden truncate 2xl:inline">
                  {item.label}
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
