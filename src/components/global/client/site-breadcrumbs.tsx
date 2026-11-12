// "use client"

// import Link from "next/link"
// import { usePathname } from "next/navigation"
// import {
//   Languages,
//   LayoutGrid,
//   Route,
//   Layers,
//   Gamepad2,
//   BookOpen,
//   MessageCircle,
//   ChevronRight,
//   ChevronDown,
//   LucideIcon,
//   MoreHorizontal,
// } from "lucide-react"

// import { cn } from "@/lib/utils"

// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"

// type BreadcrumbItem = {
//   label: string
//   href: string
//   icon: LucideIcon
// }

// const featureConfig = {
//   foundation: {
//     label: "Foundation Roadmap",
//     icon: Route,
//   },
//   story: {
//     label: "Stories",
//     icon: BookOpen,
//   },
//   "ai-communication": {
//     label: "AI Communication",
//     icon: MessageCircle,
//   },
// } as const

// export function SiteBreadcrumbs({
//   languageName = "Your language",
//   stageName,
// }: {
//   languageName?: string
//   stageName?: string
// }) {
//   const pathname = usePathname()
//   const segments = pathname.split("/").filter(Boolean)

//   if (segments[0] !== "language") return null

//   const items: BreadcrumbItem[] = [
//     {
//       label: "Languages",
//       href: "/language",
//       icon: Languages,
//     },
//   ]

//   const languageId = segments[1]

//   if (!languageId) return renderBreadcrumbs(items, pathname)

//   items.push({
//     label: languageName,
//     href: `/language/${languageId}`,
//     icon: LayoutGrid,
//   })

//   const feature = segments[2]

//   if (!feature) {
//     items[1].label = "Choose a feature"
//     return renderBreadcrumbs(items, pathname)
//   }

//   const config =
//     featureConfig[feature as keyof typeof featureConfig]

//   items.push({
//     label: config?.label ?? formatLabel(feature),
//     href: `/language/${languageId}/${feature}`,
//     icon: config?.icon ?? LayoutGrid,
//   })

//   if (segments.length === 3) {
//     return renderBreadcrumbs(items, pathname)
//   }

//   const stageId = segments[3]

//   if (stageId) {
//     items.push({
//       label: stageName ?? "Stage",
//       href: `/language/${languageId}/${feature}/${stageId}`,
//       icon: Layers,
//     })
//   }

//   const gameId = segments[4]

//   if (gameId && feature === "foundation") {
//     items.push({
//       label: "Playing game",
//       href: pathname,
//       icon: Gamepad2,
//     })
//   }

//   return renderBreadcrumbs(items, pathname)
// }

// function formatLabel(value: string) {
//   return value
//     .split("-")
//     .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//     .join(" ")
// }

// function renderBreadcrumbs(
//   items: BreadcrumbItem[],
//   pathname: string
// ) {
//   const currentItem = items[items.length - 1]
//   const CurrentIcon = currentItem.icon

//   return (
//     <nav aria-label="Breadcrumb" className="min-w-0">
//       {/* Mobile breadcrumb dropdown */}
//       <div className="min-w-0 sm:hidden">
//         <DropdownMenu>
//           <DropdownMenuTrigger render={(

//             <button
//               type="button"
//               className={cn(
//                 "inline-flex min-w-0 max-w-full items-center gap-2",
//                 "rounded-xl border border-slate-200 bg-white px-3 py-2",
//                 "text-sm font-semibold text-slate-700 shadow-sm",
//                 "transition-colors hover:border-cyan-200 hover:bg-cyan-50",
//                 "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500",
//                 "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
//               )}
//             >
//               <CurrentIcon className="size-4 shrink-0 text-cyan-600" />

//               {/* <span className="truncate">
//                 {currentItem.label}
//               </span> */}

//               <ChevronDown className="size-4 shrink-0 text-slate-400" />
//             </button>
//           )}/>
//           <DropdownMenuContent
//             align="start"
//             sideOffset={8}
//             className="w-[min(280px,calc(100vw-2rem))] rounded-xl border border-slate-200 p-2 shadow-xl dark:border-slate-700"
//           >
//             <div className="px-2 py-2">
//               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
//                 Navigation
//               </p>
//               <p className="mt-1 text-xs text-muted-foreground">
//                 Browse your current location
//               </p>
//             </div>

//             <div className="mb-1 border-t border-slate-100 dark:border-slate-800" />

//             {items.map((item, index) => {
//               const isCurrent = item.href === pathname
//               const Icon = item.icon

//               return (
//                 <DropdownMenuItem
//                   key={`${item.href}-${index}`}
//                   className="cursor-pointer rounded-lg p-0 focus:bg-cyan-50 dark:focus:bg-cyan-950/40"
//                   render={(

//                   <Link
//                     href={item.href}
//                     aria-current={isCurrent ? "page" : undefined}
//                     className={cn(
//                       "flex w-full items-center gap-3 rounded-lg px-3 py-2.5",
//                       isCurrent
//                         ? "bg-cyan-50 font-bold text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300"
//                         : "text-slate-600 dark:text-slate-300"
//                     )}
//                   >
//                     <Icon
//                       className={cn(
//                         "size-4 shrink-0",
//                         isCurrent
//                           ? "text-cyan-600"
//                           : "text-slate-400"
//                       )}
//                     />

//                     <span className="min-w-0 flex-1 truncate text-sm">
//                       {item.label}
//                     </span>

//                     {isCurrent ? (
//                       <span className="shrink-0 rounded-full bg-cyan-100 px-2 py-0.5 text-[9px] font-black uppercase text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300">
//                         Current
//                       </span>
//                     ) : null}
//                   </Link>
//                   )}
//                 />
//               )
//             })}
//           </DropdownMenuContent>
//         </DropdownMenu>
//       </div>

//       {/* Desktop full breadcrumb */}
//       <ol className="hidden min-w-0 items-center gap-1.5 sm:flex">
//         {items.map((item, index) => {
//           const isCurrent = item.href === pathname
//           const Icon = item.icon

//           return (
//             <li
//               key={`${item.href}-${index}`}
//               className="flex min-w-0 items-center gap-1.5"
//             >
//               {index > 0 && (
//                 <ChevronRight
//                   aria-hidden="true"
//                   className="size-4 shrink-0 text-muted-foreground/60"
//                 />
//               )}

//               <Link
//                 href={item.href}
//                 aria-current={isCurrent ? "page" : undefined}
//                 className={cn(
//                   "group inline-flex min-w-0 items-center gap-1.5 rounded-md px-1.5 py-1.5 lg:px-2",
//                   "text-sm transition-colors",
//                   "hover:bg-cyan-50 hover:text-cyan-600",
//                   "dark:hover:bg-cyan-950/50 dark:hover:text-cyan-400",
//                   isCurrent
//                     ? "font-medium text-foreground"
//                     : "text-muted-foreground"
//                 )}
//               >
//                 <Icon
//                   aria-hidden="true"
//                   className="size-4 shrink-0 transition-colors group-hover:text-cyan-600 dark:group-hover:text-cyan-400"
//                 />

//                 <span className="hidden truncate 2xl:inline">
//                   {item.label}
//                 </span>
//               </Link>
//             </li>
//           )
//         })}
//       </ol>
//     </nav>
//   )
// }

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Languages,
  LayoutGrid,
  Route,
  Layers,
  Gamepad2,
  BookOpen,
  MessageCircle,
  FileText,
  MessagesSquare,
  ChevronRight,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type BreadcrumbItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const featureConfig: Record<
  string,
  { label: string; icon: LucideIcon }
> = {
  foundation: {
    label: "Foundation Roadmap",
    icon: Route,
  },
  story: {
    label: "Stories",
    icon: BookOpen,
  },
  conversation: {
    label: "AI Conversations",
    icon: MessageCircle,
  },
};

type SiteBreadcrumbsProps = {
  languageName?: string;
  stageName?: string;
  storyName?: string;
  conversationTopicName?: string;
};

export function SiteBreadcrumbs({
  languageName = "Your language",
  stageName,
  storyName,
  conversationTopicName,
}: SiteBreadcrumbsProps) {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] !== "language") return null;

  const languageId = segments[1];

  const items: BreadcrumbItem[] = [
    {
      label: "Languages",
      href: "/language",
      icon: Languages,
    },
  ];

  if (!languageId) {
    return renderBreadcrumbs(items, pathname);
  }

  // Language selection
  items.push({
    label: languageName,
    href: `/language/${languageId}`,
    icon: LayoutGrid,
  });

  const feature = segments[2];

  if (!feature) {
    items[1].label = "Choose a feature";

    return renderBreadcrumbs(items, pathname);
  }

  const config = featureConfig[feature];

  if (!config) {
    return renderBreadcrumbs(items, pathname);
  }

  // Feature selection
  items.push({
    label: config.label,
    href: `/language/${languageId}/${feature}`,
    icon: config.icon,
  });

  // Feature listing page
  if (segments.length === 3) {
    return renderBreadcrumbs(items, pathname);
  }

  // Selected content
  const contentId = segments[3];

  if (contentId) {
    let label = "Selected Content";
    let icon: LucideIcon = FileText;

    switch (feature) {
      case "foundation":
        label = stageName || "Selected Stage";
        icon = Layers;
        break;

      case "story":
        label = storyName || "Selected Story";
        icon = FileText;
        break;

      case "conversation":
        label = conversationTopicName || "Conversation Topic";
        icon = MessagesSquare;
        break;
    }

    items.push({
      label,
      href: `/language/${languageId}/${feature}/${contentId}`,
      icon,
    });
  }

  // Foundation game page
  const gameId = segments[4];

  if (gameId && feature === "foundation") {
    items.push({
      label: "Playing Game",
      href: pathname,
      icon: Gamepad2,
    });
  }

  return renderBreadcrumbs(items, pathname);
}

function renderBreadcrumbs(
  items: BreadcrumbItem[],
  pathname: string
) {
  const currentItem = items[items.length - 1];
  const CurrentIcon = currentItem.icon;

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      {/* Mobile breadcrumb dropdown */}
      <div className="min-w-0 sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label={`Current location: ${currentItem.label}. Open breadcrumb navigation`}
                className={cn(
                  "inline-flex min-w-0 max-w-full items-center gap-2",
                  "rounded-xl border border-slate-200 bg-white px-3 py-2",
                  "text-sm font-semibold text-slate-700 shadow-sm",
                  "transition-colors hover:border-cyan-200 hover:bg-cyan-50",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500",
                  "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                )}
              >
                <CurrentIcon className="size-4 shrink-0 text-cyan-600" />

                <span className="max-w-[180px] truncate">
                  {currentItem.label}
                </span>

                <ChevronDown className="size-4 shrink-0 text-slate-400" />
              </button>
            }
          />

          <DropdownMenuContent
            align="start"
            sideOffset={8}
            className="w-[min(280px,calc(100vw-2rem))] rounded-xl border border-slate-200 p-2 shadow-xl dark:border-slate-700"
          >
            <div className="px-2 py-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Navigation
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Browse your current location
              </p>
            </div>

            <div className="mb-1 border-t border-slate-100 dark:border-slate-800" />

            {items.map((item, index) => {
              const isCurrent = index === items.length - 1;
              const Icon = item.icon;

              return (
                <DropdownMenuItem
                  key={`${item.href}-${index}`}
                  className="cursor-pointer rounded-lg p-0 focus:bg-cyan-50 dark:focus:bg-cyan-950/40"
                  render={
                    <Link
                      href={item.href}
                      aria-current={isCurrent ? "page" : undefined}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5",
                        isCurrent
                          ? "bg-cyan-50 font-bold text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300"
                          : "text-slate-600 dark:text-slate-300"
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

                      <span className="min-w-0 flex-1 truncate text-sm">
                        {item.label}
                      </span>

                      {isCurrent && (
                        <span className="shrink-0 rounded-full bg-cyan-100 px-2 py-0.5 text-[9px] font-black uppercase text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300">
                          Current
                        </span>
                      )}
                    </Link>
                  }
                />
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop breadcrumb */}
      <ol className="hidden min-w-0 items-center gap-1.5 sm:flex">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          const Icon = item.icon;

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
          );
        })}
      </ol>
    </nav>
  );
}
