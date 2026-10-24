"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { SiteBreadcrumbs } from "./site-breadcrumbs"
import { UserMenu } from "../user-menu"
import { LanguageIndicator } from "../language-indicator"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center border-b-2 border-[#E5E7EB] bg-[#F7F9F5] transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full min-w-0 items-center gap-2 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1 shrink-0" />

        <Separator
          orientation="vertical"
          className="mx-1 h-10 shrink-0"
        />

        <div className="min-w-0 flex-1 overflow-hidden">
          <SiteBreadcrumbs />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-4">
          <LanguageIndicator />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}