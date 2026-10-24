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
// import { NavMain } from "./nav-main"
// import { NavProjects } from "./nav-projects"
// import { NavUser } from "./nav-user"
// import Image from "next/image"

// const navMainTabs = [
//   {
//     title: "Learn",
//     url: "/learn",
//     icon: House,
//   },
//   {
//     title: "Languages",
//     url: "/languages",
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
//           <SidebarMenuItem>
//             <SidebarMenuButton
//               className="data-[slot=sidebar-menu-button]:p-1.5!"
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