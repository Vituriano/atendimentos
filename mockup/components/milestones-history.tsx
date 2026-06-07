"use client"

import { useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Check, X, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  milestones0to3,
  milestones3to6,
  milestones6to12,
  milestones1to2,
  milestones35to5,
  milestoneRecords,
} from "@/lib/mock-data"

interface MilestoneGroup {
  title: string
  ageRange: string
  milestones: typeof milestones0to3
  defaultOpen: boolean
}

const milestoneGroups: MilestoneGroup[] = [
  { title: "0 a 3 meses", ageRange: "0-3m", milestones: milestones0to3, defaultOpen: false },
  { title: "3 a 6 meses", ageRange: "3-6m", milestones: milestones3to6, defaultOpen: false },
  { title: "6 a 12 meses", ageRange: "6-12m", milestones: milestones6to12, defaultOpen: false },
  { title: "1 a 2 anos", ageRange: "1-2a", milestones: milestones1to2, defaultOpen: false },
  { title: "3 anos e meio a 5 anos", ageRange: "3.5-5a", milestones: milestones35to5, defaultOpen: true },
]

const consultationDates = ["Jul/2024", "Out/2024", "Jan/2025", "Mar/2025"]

function getStatusIcon(status: "confirmed" | "not-evaluated" | "not-achieved") {
  switch (status) {
    case "confirmed":
      return <Check className="h-4 w-4 text-green-600" />
    case "not-achieved":
      return <X className="h-4 w-4 text-red-600" />
    default:
      return <Minus className="h-4 w-4 text-slate-400" />
  }
}

function getStatusForMilestone(milestoneId: string, date: string) {
  const record = milestoneRecords.find(
    (r) => r.milestoneId === milestoneId && r.consultationDate === date
  )
  return record?.status || "not-evaluated"
}

export function MilestonesHistory() {
  const [openGroups, setOpenGroups] = useState<string[]>(["3 anos e meio a 5 anos"])

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    )
  }

  return (
    <div className="space-y-2">
      {milestoneGroups.map((group) => (
        <Collapsible
          key={group.title}
          open={openGroups.includes(group.title)}
          onOpenChange={() => toggleGroup(group.title)}
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-4 py-3 hover:bg-slate-100 transition-colors">
            <span className="font-medium">{group.title}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                openGroups.includes(group.title) && "rotate-180"
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border rounded-lg mt-2 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left font-medium p-3 min-w-[180px]">Marco</th>
                    <th className="text-left font-medium p-3 text-muted-foreground min-w-[250px]">
                      Como pesquisar
                    </th>
                    {consultationDates.map((date) => (
                      <th
                        key={date}
                        className={cn(
                          "text-center font-medium p-3 min-w-[80px]",
                          date === "Mar/2025" && "bg-teal-50 text-teal-800"
                        )}
                      >
                        {date}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {group.milestones.map((milestone) => (
                    <tr key={milestone.id} className="border-b last:border-b-0">
                      <td className="p-3 font-medium">{milestone.name}</td>
                      <td className="p-3 text-muted-foreground text-xs">
                        {milestone.instruction}
                      </td>
                      {consultationDates.map((date) => (
                        <td
                          key={date}
                          className={cn(
                            "p-3 text-center",
                            date === "Mar/2025" && "bg-teal-50/50"
                          )}
                        >
                          <div className="flex justify-center">
                            {getStatusIcon(getStatusForMilestone(milestone.id, date))}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-muted-foreground pt-4 border-t mt-4">
        <div className="flex items-center gap-1">
          <Check className="h-4 w-4 text-green-600" />
          <span>Confirmado</span>
        </div>
        <div className="flex items-center gap-1">
          <Minus className="h-4 w-4 text-slate-400" />
          <span>Não avaliado</span>
        </div>
        <div className="flex items-center gap-1">
          <X className="h-4 w-4 text-red-600" />
          <span>Não atingido</span>
        </div>
      </div>
    </div>
  )
}
