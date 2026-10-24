// "use client"

// import * as React from "react"
// import {
//   House,
//   Languages,
//   Trophy,
//   ShieldCheck,
//   ShoppingBag,
//   UserRound,
//   Ellipsis,
// } from "lucide-react"

// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarRail,
// } from "@/components/ui/sidebar"
// import Image from "next/image"
// import { NavMain } from "./nav-main"

// const navMainTabs = [
//   {
//     title: "Learn",
//     url: "/learn",
//     icon: House,
//   },
//   {
//     title: "Language",
//     url: "/language",
//     icon: Languages,
//   },
//   {
//     title: "Leaderboards",
//     url: "/leaderboards",
//     icon: Trophy,
//   },
//   {
//     title: "Quests",
//     url: "/quests",
//     icon: ShieldCheck,
//   },
//   {
//     title: "Shop",
//     url: "/shop",
//     icon: ShoppingBag,
//   },
//   {
//     title: "Profile",
//     url: "/profile",
//     icon: UserRound,
//   },
//   {
//     title: "More",
//     url: "/more",
//     icon: Ellipsis,
//   },
// ]

// export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
//   return (
//     <Sidebar collapsible="offcanvas" {...props}>
//       <SidebarHeader>
//         <SidebarMenu>
//           <SidebarMenuItem className=" h-[calc(var(--header-height)-16px)]">
//             <SidebarMenuButton
//               className="data-[slot=sidebar-menu-button]:p-1.5! h-full"
//               render={(
//               <a href="/">
//                 <Image
//                   src="/LinguisQuest-title.png"
//                   alt="LinguisQuest Logo"
//                   width={160}
//                   height={40}
//                   priority
//                   className="h-14 w-auto object-contain"
//                 />
//               </a>
//               )}
//             />
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarHeader>
//       <SidebarContent>
//         <NavMain items={navMainTabs} />
//       </SidebarContent>
//       <SidebarRail />
//     </Sidebar>
//   )
// }

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
import { Language, useLanguageStore } from "@/store/foundation/language-store"

export function AppSidebar(
  props: React.ComponentProps<typeof Sidebar>
) {
  const selectedLanguage = useLanguageStore(
    (state: { selectedLanguage: Language | null }) => state.selectedLanguage
  )

  const navMainTabs = React.useMemo(() => {
    const tabs = [
      {
        title: "Language",
        url: "/language",
        icon: Languages,
      },
    ]

    // Show these links only when a language is selected.
    if (selectedLanguage) {
      const languageId = encodeURIComponent(selectedLanguage.id)
      const baseUrl = `/language/${languageId}`

      tabs.push(
        {
          title: "Foundation",
          url: `${baseUrl}/foundation`,
          icon: BookOpen,
        },
        {
          title: "Story",
          url: `${baseUrl}/story`,
          icon: BookText,
        },
        {
          title: "AI Conversation",
          url: `${baseUrl}/ai-conversation`,
          icon: MessageCircle,
        }
      )
    }

    tabs.push(
      {
        title: "Leaderboards",
        url: "/leaderboards",
        icon: Trophy,
      },
      {
        title: "Profile",
        url: "/profile",
        icon: UserRound,
      }
    )

    return tabs
  }, [selectedLanguage])

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