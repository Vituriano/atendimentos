"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { StatusBadge, EntryTypeBadge } from "@/components/status-badge"
import { queueData } from "@/lib/mock-data"
import { usePatient } from "@/lib/patient-context"
import { RefreshCw, Users, Clock, CheckCircle, AlertCircle, AlertTriangle, MoreVertical, FileText, Play } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import type { Patient, EntryType } from "@/lib/types"

const stats = [
  { label: "Total do dia", value: 18, icon: Users, color: "text-slate-700", borderColor: "border-l-slate-500" },
  { label: "Aguardando", value: 5, icon: Clock, color: "text-amber-600", borderColor: "border-l-amber-500" },
  { label: "Em Atendimento", value: 3, icon: AlertCircle, color: "text-blue-600", borderColor: "border-l-blue-500" },
  { label: "Finalizados", value: 10, icon: CheckCircle, color: "text-green-600", borderColor: "border-l-green-500" },
]

function formatDate() {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date())
}

function FaltasBadge({ faltas }: { faltas: number }) {
  if (faltas === 0) return null
  
  if (faltas === 1) {
    return (
      <Badge variant="secondary" className="bg-orange-100 text-orange-700 ml-2">
        1 falta
      </Badge>
    )
  }
  
  return (
    <Badge variant="secondary" className="bg-red-100 text-red-700 ml-2 flex items-center gap-1">
      <AlertTriangle className="h-3 w-3" />
      {faltas} faltas
    </Badge>
  )
}

function QueueTable() {
  const { setActivePatient } = usePatient()
  const router = useRouter()
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [confirmBriefingOpen, setConfirmBriefingOpen] = useState(false)
  const [pendingPatient, setPendingPatient] = useState<{ patient: Patient; entryType: EntryType } | null>(null)

  const handleStartConsultation = (patient: Patient, entryType: EntryType) => {
    setPendingPatient({ patient, entryType })
    setConfirmDialogOpen(true)
  }

  const confirmStartConsultation = () => {
    if (pendingPatient) {
      setActivePatient(pendingPatient.patient, pendingPatient.entryType)
      router.push("/consulta")
    }
    setConfirmDialogOpen(false)
    setPendingPatient(null)
  }

  const handleViewBriefing = (patient: Patient, entryType: EntryType) => {
    setPendingPatient({ patient, entryType })
    setConfirmBriefingOpen(true)
  }

  const confirmViewBriefing = () => {
    if (pendingPatient) {
      setActivePatient(pendingPatient.patient, pendingPatient.entryType)
      router.push("/briefing")
    }
    setConfirmBriefingOpen(false)
    setPendingPatient(null)
  }

  return (
    <>
      <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Paciente</TableHead>
            <TableHead className="hidden sm:table-cell">Idade</TableHead>
            <TableHead className="hidden md:table-cell">Tipo de Entrada</TableHead>
            <TableHead className="hidden lg:table-cell">Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {queueData.map((entry) => {
            // Format CPF with asterisks: show first 3 and last 2 digits
            const cpf = entry.patient.cpf || "000.000.000-00"
            const maskedCpf = cpf.replace(/^(\d{3})\.?\d{3}\.?\d{3}-?(\d{2})$/, "$1.***.***-$2")
            
            return (
              <TableRow 
                key={entry.id} 
                className="cursor-pointer hover:bg-slate-50 h-14"
                onClick={() => handleViewBriefing(entry.patient, entry.entryType)}
              >
                <TableCell className="pl-4 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{entry.patient.name}</span>
                      {entry.faltas && entry.faltas > 0 && (
                        <FaltasBadge faltas={entry.faltas} />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">CPF: {maskedCpf}</div>
                    {/* Mobile: show extra info inline */}
                    <div className="flex flex-wrap gap-2 sm:hidden mt-1.5">
                      <span className="text-xs text-muted-foreground">{entry.patient.age}</span>
                      <EntryTypeBadge type={entry.entryType} />
                      <StatusBadge status={entry.status} />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell py-4">{entry.patient.age}</TableCell>
                <TableCell className="hidden md:table-cell py-4">
                  <EntryTypeBadge type={entry.entryType} />
                </TableCell>
                <TableCell className="hidden lg:table-cell py-4">
                  <StatusBadge status={entry.status} />
                </TableCell>
                <TableCell className="pr-4 py-4" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Abrir menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewBriefing(entry.patient, entry.entryType)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Ver Briefing
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleStartConsultation(entry.patient, entry.entryType)}>
                        <Play className="mr-2 h-4 w-4" />
                        Iniciar Consulta
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      </div>

      {/* Confirmation Dialog - Start Consultation */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Iniciar atendimento?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingPatient && (
                <>
                  Voce esta prestes a iniciar o atendimento de <strong>{pendingPatient.patient.name}</strong>.
                  <br />
                  Tipo de entrada: <strong>{pendingPatient.entryType}</strong>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStartConsultation}>
              Confirmar e Iniciar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog - View Briefing */}
      <AlertDialog open={confirmBriefingOpen} onOpenChange={setConfirmBriefingOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Selecionar paciente?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingPatient && (
                <>
                  Voce esta prestes a selecionar <strong>{pendingPatient.patient.name}</strong> para visualizar o briefing clinico.
                  <br />
                  Tipo de entrada: <strong>{pendingPatient.entryType}</strong>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmViewBriefing}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default function FilaDeAtendimento() {
  return (
    <MainLayout
      title="Fila de Atendimento - Pediatria"
      actions={
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground capitalize">{formatDate()}</span>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className={cn("shadow-sm border-slate-200 border-l-4", stat.borderColor)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Patient Queue Table */}
        <Card>
          <CardHeader>
            <CardTitle>Pacientes na Fila</CardTitle>
          </CardHeader>
          <CardContent>
            <QueueTable />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
