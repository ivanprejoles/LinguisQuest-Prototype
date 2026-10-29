"use client"

import * as React from "react"
import {
  Languages,
  Trophy,
  UserRound,
  BookOpen,
  BookText,
  MessageCircle,
} from "lucide-react"
import Image from "next/image"
import { usePathname, useParams } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

import { NavMain } from "./nav-main"

const staticLinks = [
  { title: "Language", url: "/language", icon: Languages },
  { title: "Leaderboards", url: "/leaderboards", icon: Trophy },
  { title: "Profile", url: "/profile", icon: UserRound },
]

const languageLinks = [
  { title: "Foundation", path: "foundation", icon: BookOpen },
  { title: "Story", path: "story", icon: BookText },
  { title: "AI Conversation", path: "conversation", icon: MessageCircle },
]

function isRouteActive(pathname: string, url: string) {
  if (url === "/language") {
    const segments = pathname.split("/").filter(Boolean)

    return (
      pathname === "/language" ||
      (segments.length === 2 && segments[0] === "language")
    )
  }

  return pathname === url || pathname.startsWith(`${url}/`)
}

export function AppSidebar(
  props: React.ComponentProps<typeof Sidebar>
) {
  const pathname = usePathname()
  const params = useParams<{ languageId?: string }>()

  const languageId = params.languageId

  const navMainTabs = React.useMemo(() => {
    const dynamicLinks = languageId
      ? languageLinks.map((link) => ({
          title: link.title,
          url: `/language/${encodeURIComponent(languageId)}/${link.path}`,
          icon: link.icon,
        }))
      : []

    const items = [
      staticLinks[0],
      ...dynamicLinks,
      ...staticLinks.slice(1),
    ]

    // Only one item can be active.
    const activeItem = items
      .filter((item) => isRouteActive(pathname, item.url))
      .sort((a, b) => b.url.length - a.url.length)[0]

    return items.map((item) => ({
      ...item,
      isActive: item.url === activeItem?.url,
    }))
  }, [pathname, languageId])

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="h-[calc(var(--header-height)-16px)]">
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5! h-full"
              render={
                <a href="/">
                  <Image
                    src="/LinguisQuest-title.png"
                    alt="LinguisQuest Logo"
                    width={160}
                    height={40}
                    priority
                    className="h-14 w-auto object-contain"
                  />
                </a>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMainTabs} />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}