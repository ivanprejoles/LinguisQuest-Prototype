
"use client"

import { usePathname } from "next/navigation"
import { type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup className="px-3 py-2">
      <SidebarMenu className="gap-2">
        {items.map((item) => {
          const isActive =
            pathname === item.url ||
            (item.url !== "/" && pathname.startsWith(`${item.url}/`))

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={isActive}
                render={<a href={item.url} />}
                className={`
                  h-10 rounded-xl border-2
                  px-3 gap-3
                  text-[13px] font-extrabold uppercase tracking-wide
                  transition-all duration-150

                  [&>svg]:size-5
                  [&>svg]:shrink-0

                  ${
                    isActive
                      ? "!bg-sky-50 !text-sky-600 !border-sky-200 !shadow-[0_3px_0_#d9f0fa]"
                      : "border-transparent text-slate-500 hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200"
                  }
                `}
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
