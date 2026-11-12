// "use client"

// import { Separator } from "@/components/ui/separator"
// import { SidebarTrigger } from "@/components/ui/sidebar"
// import { SiteBreadcrumbs } from "./site-breadcrumbs"
// import { UserMenu } from "../user-menu"
// import { LanguageIndicator } from "../language-indicator"

// export function SiteHeader() {
//   return (
//     <header className="sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center border-b-2 border-[#E5E7EB] bg-[#F7F9F5] transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
//       <div className="flex w-full min-w-0 items-center gap-2 px-4 lg:px-6">
//         <SidebarTrigger className="-ml-1 shrink-0" />

//         <Separator
//           orientation="vertical"
//           className="mx-1 h-10 shrink-0"
//         />

//         <div className="min-w-0 flex-1 overflow-hidden">
//           <SiteBreadcrumbs />
//         </div>

//         <div className="ml-auto flex shrink-0 items-center gap-4">
//           <LanguageIndicator />
//           <UserMenu />
//         </div>
//       </div>
//     </header>
//   )
// }

"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { SiteBreadcrumbs } from "./site-breadcrumbs"
import { UserMenu } from "../user-menu"
import { LanguageIndicator } from "../language-indicator"

export function SiteHeader() {
  return (
    <header className="
      sticky top-0 z-50 flex h-(--header-height)
      shrink-0 items-center border-b border-[#E5E7EB]
      bg-[#F7F9F5] transition-[width,height] ease-linear
      group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)
    ">
      <div className="
        flex w-full min-w-0 items-center
        gap-1.5 px-2.5
        sm:gap-2 sm:px-4
        lg:px-6
      ">
        {/* Sidebar */}
        <SidebarTrigger className="
          -ml-1 size-8 shrink-0
          sm:size-9
        " />

        {/* Separator */}
        <Separator
          orientation="vertical"
          className="mx-0.5 h-6 shrink-0 sm:mx-1 sm:h-8"
        />

        {/* Breadcrumbs */}
        <div className="min-w-0 flex-1 overflow-hidden">
          <SiteBreadcrumbs />
        </div>

        {/* Right controls */}
        <div className="
          ml-auto flex shrink-0 items-center
          gap-2
          sm:gap-3
          lg:gap-4
        ">
          <LanguageIndicator />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
