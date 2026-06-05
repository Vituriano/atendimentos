"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, ClipboardList, BookOpen, BarChart3, Database } from "lucide-react"
import { usePatient } from "@/lib/patient-context"
import { cn, getInitials } from "@/lib/utils"

const generalMenuItems = [
  {
    title: "Fila de Atendimento",
    url: "/",
    icon: Users,
  },
  {
    title: "Base de Pacientes",
    url: "/pacientes",
    icon: Database,
  },
  // Dashboard Gerencial - deprioritized, hidden from menu but code kept
  // {
  //   title: "Dashboard Gerencial",
  //   url: "/dashboard",
  //   icon: BarChart3,
  // },
]

const patientMenuItems = [
  {
    title: "Briefing Clinico",
    url: "/briefing",
    icon: FileText,
  },
  {
    title: "Formulario de Consulta",
    url: "/consulta",
    icon: ClipboardList,
  },
  {
    title: "Caderneta Digital",
    url: "/caderneta",
    icon: BookOpen,
  },
]

function PatientChip() {
  const { activePatient } = usePatient()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  if (!activePatient) return null

  const initials = getInitials(activePatient.name)

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              {initials}
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="font-medium">{activePatient.name}</p>
            <p className="text-xs text-muted-foreground">{activePatient.record}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-3">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-sm text-sidebar-foreground">
            {activePatient.name}
          </p>
          <p className="text-xs text-muted-foreground">{activePatient.age}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground">{activePatient.record}</span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {activePatient.visitType}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}

function DisabledMenuItem({ item }: { item: typeof patientMenuItems[0] }) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground/50 cursor-not-allowed",
              isCollapsed && "justify-center px-2"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>{item.title}</span>}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Selecione um paciente na Fila de Atendimento</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const { activePatient } = usePatient()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-6 py-4 bg-gradient-to-b from-slate-50 to-white">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-600 to-teal-800 text-primary-foreground font-bold text-sm">
            HC
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-lg text-sidebar-foreground">HC Pediatria</span>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {/* GERAL Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase text-[10px] font-semibold tracking-wider text-muted-foreground">
            {!isCollapsed && "Geral"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {generalMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* PACIENTE EM ATENDIMENTO Section */}
        <SidebarGroup>
          <div
            className={cn(
              "relative",
              activePatient && !isCollapsed && "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-primary before:rounded-full"
            )}
          >
            <SidebarGroupLabel className="uppercase text-[10px] font-semibold tracking-wider text-muted-foreground pl-2">
              {!isCollapsed && "Paciente em Atendimento"}
            </SidebarGroupLabel>
          </div>
          <SidebarGroupContent className="space-y-2">
            {/* Patient Chip - only when patient is active */}
            {activePatient && (
              <div className={cn("px-2", isCollapsed && "px-0")}>
                <PatientChip />
              </div>
            )}

            {/* Patient Navigation Items */}
            <SidebarMenu>
              {patientMenuItems.map((item) =>
                activePatient ? (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <DisabledMenuItem item={item} />
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
