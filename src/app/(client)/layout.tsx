import { AppSidebar } from "@/components/global/client/app-sidebar"
import { SiteHeader } from "@/components/global/client/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { getOrCreateUser } from "@/lib/user"
import { LearningProvider } from "@/providers/learning-provider"
import { redirect } from "next/navigation"
import React from "react"



export default async function Page({
    children
}: {
    children: React.ReactNode
}) {

  // Ensure the authenticated Clerk user exists in MongoDB.
  const user = await getOrCreateUser();

  // Redirect if no authenticated user is available.
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <SidebarProvider
    style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 17)",
          } as React.CSSProperties
        }
      >
        <LearningProvider>
        <AppSidebar  />
          <SidebarInset>
              <div className="flex flex-1 flex-col bg-[#F7F9F5]">
                  <SiteHeader />
                  <div className="@container/main flex flex-1 flex-col gap-2 bg-[#F7F9F5]">
                      {/* <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6"> */}
                      {children}
                      {/* </div> */}
                  </div>
              </div>
          </SidebarInset>
        </LearningProvider>
      </SidebarProvider>
  )
}
