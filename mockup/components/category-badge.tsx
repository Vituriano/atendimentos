"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { CategoriaAlerta } from "@/lib/types"

const categoryConfig: Record<CategoriaAlerta, { bg: string; text: string; label: string }> = {
  peso: { bg: "bg-teal-100", text: "text-teal-700", label: "Peso" },
  marco: { bg: "bg-violet-100", text: "text-violet-700", label: "Marco" },
  encaminhamento: { bg: "bg-amber-100", text: "text-amber-700", label: "Encaminhamento" },
  falta: { bg: "bg-orange-100", text: "text-orange-700", label: "Falta" },
  negligencia: { bg: "bg-red-100", text: "text-red-700", label: "Negligencia" },
}

export function CategoryBadge({ categoria }: { categoria: CategoriaAlerta }) {
  const config = categoryConfig[categoria]

  return (
    <Badge variant="secondary" className={cn("text-xs", config.bg, config.text)}>
      {config.label}
    </Badge>
  )
}
