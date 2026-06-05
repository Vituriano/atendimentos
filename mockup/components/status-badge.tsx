import { Badge } from "@/components/ui/badge"
import type { Status, EntryType } from "@/lib/types"
import { cn } from "@/lib/utils"

const statusColors: Record<Status, string> = {
  "Aguardando": "bg-amber-100 text-amber-700 hover:bg-amber-100",
  "Em Atendimento": "bg-blue-100 text-blue-600 hover:bg-blue-100",
  "Finalizado": "bg-green-100 text-green-700 hover:bg-green-100",
  "Pendente": "bg-orange-100 text-orange-700 hover:bg-orange-100",
  "Agendado": "bg-slate-100 text-slate-700 hover:bg-slate-100",
}

const entryTypeColors: Record<EntryType, string> = {
  "Retorno": "bg-teal-100 text-teal-800 hover:bg-teal-100",
  "Egresso": "bg-sky-100 text-sky-800 hover:bg-sky-100",
  "Encaminhamento Externo": "bg-violet-100 text-violet-800 hover:bg-violet-100",
  "Internacao": "bg-rose-100 text-rose-800 hover:bg-rose-100",
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge variant="secondary" className={cn("font-medium", statusColors[status])}>
      {status}
    </Badge>
  )
}

export function EntryTypeBadge({ type }: { type: EntryType }) {
  return (
    <Badge variant="secondary" className={cn("font-medium", entryTypeColors[type])}>
      {type}
    </Badge>
  )
}
