"use client"

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"

interface MainLayoutProps {
  children: React.ReactNode
  title?: string
  actions?: React.ReactNode
}

export function MainLayout({ children, title, actions }: MainLayoutProps) {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          {title && <h1 className="text-2xl font-bold tracking-tight">{title}</h1>}
          {actions && <div className="ml-auto flex items-center gap-3">{actions}</div>}
        </header>
        <main className="flex-1 overflow-hidden px-6 py-6">
          {children}
        </main>
      </SidebarInset>
    </>
  )
}
