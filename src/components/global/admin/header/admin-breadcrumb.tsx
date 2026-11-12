
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Languages,
  LayoutGrid,
  Route,
  BookOpen,
  MessageCircle,
  Layers,
  FileText,
  MessagesSquare,
  ChevronRight,
  Home,
  Podium,
  Users,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface AdminBreadcrumbProps {
  languageName?: string;
  roadmapName?: string;
  storyName?: string;
  conversationTopicName?: string;
}

const featureConfig: Record<
  string,
  { label: string; icon: LucideIcon }
> = {
  foundation: {
    label: "Foundation Roadmaps",
    icon: Route,
  },
  story: {
    label: "Stories",
    icon: BookOpen,
  },
  conversation: {
    label: "Conversations",
    icon: MessageCircle,
  },
};

export function AdminBreadcrumb({
  languageName,
  roadmapName,
  storyName,
  conversationTopicName,
}: AdminBreadcrumbProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] !== "admin-portal") return null;

  const adminId = segments[1];

  if (!adminId) return null;

  const items: BreadcrumbItem[] = [
    {
      label: "Languages",
      href: `/admin-portal/${adminId}`,
      icon: Languages,
    },
  ];

  if (segments.length === 2) {
    return renderBreadcrumbs(items, pathname);
  }

  if (segments[2] === "leaderboards") {
    items.push({
      label: "Leaderboards",
      href: pathname,
      icon: Podium,
    });

    return renderBreadcrumbs(items, pathname);
  }

  if (segments[2] === "accounts") {
    items.push({
      label: "Accounts",
      href: pathname,
      icon: Users,
    });

    return renderBreadcrumbs(items, pathname);
  }

  const languageId = segments[2];

  items.push({
    label: languageName || "Selected Language",
    href: `/admin-portal/${adminId}/${languageId}`,
    icon: LayoutGrid,
  });

  if (segments.length === 3) {
    return renderBreadcrumbs(items, pathname);
  }

  const feature = segments[3];
  const config = featureConfig[feature];

  if (!config) {
    return renderBreadcrumbs(items, pathname);
  }

  items.push({
    label: config.label,
    href: `/admin-portal/${adminId}/${languageId}/${feature}`,
    icon: config.icon,
  });

  if (segments.length === 4) {
    return renderBreadcrumbs(items, pathname);
  }

  const itemId = segments[4];

  if (itemId) {
    let label = "Selected Item";
    let icon: LucideIcon = FileText;

    if (feature === "foundation") {
      label = roadmapName || "Selected Roadmap";
      icon = Layers;
    }

    if (feature === "story") {
      label = storyName || "Selected Story";
      icon = BookOpen;
    }

    if (feature === "conversation") {
      label = conversationTopicName || "Selected Topic";
      icon = MessagesSquare;
    }

    items.push({
      label,
      href: pathname,
      icon,
    });
  }

  if (feature === "foundation" && segments[5]) {
    items.push({
      label: "Selected Stage",
      href: pathname,
      icon: Layers,
    });
  }

  return renderBreadcrumbs(items, pathname);
}

function renderBreadcrumbs(
  items: BreadcrumbItem[],
  pathname: string
) {
  return (
    <nav
      aria-label="Admin breadcrumb"
      className="min-w-0"
    >
      <ol className="
        flex min-w-0 items-center gap-1.5
        overflow-x-auto whitespace-nowrap
        scrollbar-none
      ">
        {items.map((item, index) => {
          const Icon = item.icon;
          const isCurrent = index === items.length - 1;

          return (
            <li
              key={item.href}
              className="flex shrink-0 items-center gap-1.5"
            >
              {index > 0 && (
                <ChevronRight
                  className="size-4 shrink-0 text-slate-300"
                  aria-hidden="true"
                />
              )}

              <Link
                href={item.href}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                  isCurrent
                    ? "bg-cyan-50 font-bold text-cyan-800"
                    : "font-medium text-slate-500 hover:bg-slate-100 hover:text-cyan-700"
                )}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0",
                    isCurrent
                      ? "text-cyan-600"
                      : "text-slate-400"
                  )}
                />

                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
