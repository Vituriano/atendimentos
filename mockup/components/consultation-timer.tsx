"use client"

import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import { formatDuration } from "@/lib/utils"

interface ConsultationTimerProps {
  seconds: number
}

export function ConsultationTimer({ seconds }: ConsultationTimerProps) {
  return (
    <Badge variant="secondary" className="bg-orange-100 text-orange-800 font-mono">
      <Clock className="mr-1 h-3 w-3" />
      {formatDuration(seconds, true)}
    </Badge>
  )
}
