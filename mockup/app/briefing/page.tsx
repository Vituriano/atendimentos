"use client"

import { useState, Suspense } from "react"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { EntryTypeBadge } from "@/components/status-badge"
import { CategoryBadge } from "@/components/category-badge"
import { WeightSparkline } from "@/components/charts/weight-sparkline"
import {
  currentPatient as defaultPatient,
  consultationHistory,
  alertasExpandidos,
  anthropometricData,
  getPatientById,
} from "@/lib/mock-data"
import { usePatient } from "@/lib/patient-context"
import { ArrowDown, ArrowUp, Minus, AlertOctagon, AlertTriangle, FileText, BookOpen, FileInput, Info, Play, Clock, Copy, RotateCcw, ArrowLeft } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { CategoriaAlerta } from "@/lib/types"

// Trend icon component
function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") return <ArrowUp className="h-3 w-3 text-green-600" />
  if (trend === "down") return <ArrowDown className="h-3 w-3 text-red-600" />
  return <Minus className="h-3 w-3 text-muted-foreground" />
}

export default function BriefingClinicoPage() {
  return (
    <Suspense fallback={<BriefingLoading />}>
      <BriefingClinico />
    </Suspense>
  )
}

function BriefingLoading() {
  return (
    <MainLayout title="Briefing Clinico">
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    </MainLayout>
  )
}

function BriefingClinico() {
  const { activePatient, setActivePatient } = usePatient()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Dialog state
  const [prontuarioOpen, setProntuarioOpen] = useState(false)
  const [confirmStartOpen, setConfirmStartOpen] = useState(false)
  
  // Check if source is from base (read-only mode)
  const isReadOnly = searchParams.get('source') === 'base'
  const patientIdFromUrl = searchParams.get('patientId')
  
  // Load patient: from URL param (base view) or from context
  const currentPatient = isReadOnly && patientIdFromUrl 
    ? getPatientById(patientIdFromUrl) || defaultPatient
    : activePatient || defaultPatient
  
  // Check if there's an active consultation for this patient (not in read-only mode)
  const consultaEmAndamento = !isReadOnly && activePatient?.id === currentPatient.id

  const handleStartConsultation = () => {
    setConfirmStartOpen(true)
  }
  
  const confirmStartConsultation = () => {
    if (!activePatient) {
      setActivePatient(currentPatient, "Retorno")
    }
    setConfirmStartOpen(false)
    router.push("/consulta")
  }
  
  const handleContinueConsultation = () => {
    router.push("/consulta")
  }

  return (
    <MainLayout 
      title="Briefing Clinico"
      actions={isReadOnly ? (
        <Button variant="outline" size="sm" onClick={() => router.push('/pacientes')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Base de Pacientes
        </Button>
      ) : undefined}
    >
      <TooltipProvider>
        <div className="space-y-6">
          {/* Read-only notice banner */}
          {isReadOnly && (
            <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
              <Info className="h-4 w-4 shrink-0" />
              Visualizacao historica — paciente nao esta em atendimento ativo
            </div>
          )}

          {/* Patient Header Card */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-xl">{currentPatient.name}</CardTitle>
                    <EntryTypeBadge type="Retorno" />
                  </div>
                  <CardDescription className="text-sm">
                    {currentPatient.age} | Nascimento: {currentPatient.birthDate} | Prontuário: {currentPatient.record}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  {/* Hide action buttons in read-only mode */}
                  {!isReadOnly && (
                    <>
                      {consultaEmAndamento ? (
                        <Button variant="outline" onClick={handleContinueConsultation}>
                          <Clock className="mr-2 h-4 w-4" />
                          Continuar Atendimento
                          <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700 text-xs">
                            Em andamento
                          </Badge>
                        </Button>
                      ) : (
                        <Button onClick={handleStartConsultation}>
                          <Play className="mr-2 h-4 w-4" />
                          Iniciar Atendimento
                        </Button>
                      )}
                    </>
                  )}
                  <Button variant="outline" onClick={() => router.push("/caderneta")}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Ver Caderneta Digital
                  </Button>
                  <Button variant="ghost" onClick={() => setProntuarioOpen(true)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Ver Prontuario Completo
                  </Button>
                </div>
              </div>
</CardHeader>
            {!isReadOnly && consultaEmAndamento && (
              <div className="mx-6 mb-4 flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
                <Clock className="h-4 w-4 shrink-0" />
                <span>Consulta em andamento</span>
                <span className="ml-auto font-medium">Timer ativo no formulário</span>
              </div>
            )}
          </Card>
  
          {/* Two-column grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Timeline Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Linha do Tempo</CardTitle>
                  <CardDescription>Últimas consultas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {consultationHistory.map((consultation, index) => (
                      <div
                        key={index}
                        className={cn(
                          "rounded-lg border p-3 space-y-1.5 hover:border-slate-300 transition-colors",
                          consultation.isExterno 
                            ? "bg-slate-50 border-slate-200" 
                            : "bg-white border-slate-200"
                        )}
                      >
                        {consultation.isExterno ? (
                          <>
                            {/* Line 1 - External */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 text-slate-400">
                                  <FileInput className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-medium text-slate-700">{consultation.date}</span>
                                <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-xs">
                                  Externo
                                </Badge>
                                <span className="text-sm text-slate-600">
                                  {consultation.weight}kg
                                  <TrendIcon trend={consultation.weightTrend} />
                                </span>
                              </div>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-slate-400 cursor-help shrink-0" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">Dados de atendimento realizado fora do HC. Inseridos manualmente com base em informações fornecidas pela família.</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            {/* Line 2 - External */}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{consultation.servicoOrigem}</span>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Line 1 - Regular consultation */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-700">{consultation.date}</span>
                                <Badge variant="secondary" className="text-xs">{consultation.type}</Badge>
                                <span className="text-sm text-slate-600">
                                  {consultation.weight}kg
                                  <TrendIcon trend={consultation.weightTrend} />
                                </span>
                              </div>
                              {/* Reabrir button — only when source !== 'base' */}
                              {!isReadOnly && (
                                <div className="flex items-center gap-1 shrink-0">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 text-xs"
                                    onClick={() => router.push(`/consulta/historico?date=${consultation.date}`)}
                                  >
                                    <FileText className="h-3 w-3 mr-1" />
                                    Ver detalhes
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-7 text-xs"
                                    onClick={() => router.push(`/consulta?reopen=true&date=${consultation.date}`)}
                                  >
                                    <RotateCcw className="h-3 w-3 mr-1" />
                                    Reabrir
                                  </Button>
                                </div>
                              )}
                            </div>
                            {/* Line 2 - Regular consultation */}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>CID: {consultation.cid || "—"}</span>
                              <span>{consultation.referral ? `Encam.: ${consultation.referral}` : "Sem encaminhamento"}</span>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Conduct Patterns Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Padrão de Condutas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      CIDs mais frequentes
                    </div>
                    <div className="text-sm">
                      Z00.1 (3x), J06.9 (1x)
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Encaminhamentos
                    </div>
                    <div className="text-sm">
                      Gastroenterologia (Mar/2025) — <span className="text-amber-600">retorno não confirmado (45 dias)</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Internações
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Nenhuma registrada
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Alerts Card */}
              <Card className="border-l-4 border-l-amber-500">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Alertas Ativos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {alertasExpandidos.map((alerta) => (
                      <div
                        key={alerta.id}
                        className="flex items-start gap-3 text-sm"
                      >
                        {alerta.tipo === "critico" ? (
                          <AlertOctagon className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                        )}
                        <span className={cn(
                          "flex-1",
                          alerta.tipo === "critico" ? "text-red-800" : "text-amber-800"
                        )}>
                          {alerta.tipo === "critico" ? "ALERTA: " : "ATENÇÃO: "}
                          {alerta.mensagem}
                        </span>
                        <CategoryBadge categoria={alerta.categoria} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Latest Data Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Últimos Dados Coletados</CardTitle>
                  <CardDescription>Março/2025</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Peso:</span>{" "}
                      <span className="font-medium">{anthropometricData.weight} kg</span>{" "}
                      <span className="text-muted-foreground">({anthropometricData.weightPercentile})</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Altura:</span>{" "}
                      <span className="font-medium">{anthropometricData.height} cm</span>{" "}
                      <span className="text-muted-foreground">({anthropometricData.heightPercentile})</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Perímetro Cefálico:</span>{" "}
                      <span className="text-muted-foreground italic">não registrado</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">IMC:</span>{" "}
                      <span className="font-medium">{anthropometricData.bmi}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      Evolução do Peso (últimas 4 consultas)
                    </div>
                    <WeightSparkline />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Prontuário Dialog */}
        <Dialog open={prontuarioOpen} onOpenChange={setProntuarioOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-teal-700" />
                Prontuário Completo
              </DialogTitle>
              <DialogDescription>
                O prontuário completo está disponível no AGHU.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm space-y-1">
                <p className="font-medium text-slate-800">{currentPatient.name}</p>
                <p className="text-slate-500">Prontuário: {currentPatient.record}</p>
              </div>
              <p className="text-sm text-slate-600">
                Para acessar o histórico completo, evolução e exames anteriores, acesse o
                prontuário no <span className="font-medium">AGHU</span> e busque pelo número
                de prontuário acima.
              </p>
              <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                O prontuário legal do paciente é mantido no AGHU. Este sistema registra
                os dados estruturados das consultas realizadas aqui.
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="default"
                onClick={() => {
                  navigator.clipboard.writeText(currentPatient.record)
                  toast.success("Número do prontuário copiado!")
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar número do prontuário
              </Button>
              <Button variant="ghost" onClick={() => setProntuarioOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      {/* Confirmation Dialog for Starting Consultation */}
      <AlertDialog open={confirmStartOpen} onOpenChange={setConfirmStartOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Iniciar atendimento?</AlertDialogTitle>
            <AlertDialogDescription>
              Voce esta prestes a iniciar o atendimento de <strong>{currentPatient.name}</strong>.
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
      </TooltipProvider>
    </MainLayout>
  )
}
