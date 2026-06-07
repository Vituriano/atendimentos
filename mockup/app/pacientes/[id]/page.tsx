"use client"

import { useState, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Empty } from "@/components/ui/empty"
import { WeightSparkline } from "@/components/charts/weight-sparkline"
import { HeightChart } from "@/components/charts/height-chart"
import { BmiChart } from "@/components/charts/bmi-chart"
import { MilestonesHistory } from "@/components/milestones-history"
import {
  ArrowLeft,
  Pencil,
  FileText,
  X,
  Check,
  ArrowDown,
  ArrowUp,
  Minus,
  AlertOctagon,
  AlertTriangle,
  BookOpen,
  FileInput,
  Info,
  Copy,
} from "lucide-react"
import {
  getPatientById,
  alertasExpandidos,
  anthropometricData,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import type { Consultation, Prontuario, CategoriaAlerta } from "@/lib/types"
import { toast } from "sonner"

function maskCpf(cpf: string): string {
  return cpf.replace(/^(\d{3})\.(\d{3})\.(\d{3})-(\d{2})$/, "***.$2.$3-**")
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function WeightTrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  switch (trend) {
    case "up":
      return <ArrowUp className="h-3 w-3 text-green-600" />
    case "down":
      return <ArrowDown className="h-3 w-3 text-red-600" />
    default:
      return <Minus className="h-3 w-3 text-slate-500" />
  }
}

function CategoryBadge({ categoria }: { categoria: CategoriaAlerta }) {
  const categoryConfig: Record<CategoriaAlerta, { bg: string; text: string; label: string }> = {
    peso: { bg: "bg-teal-100", text: "text-teal-700", label: "Peso" },
    marco: { bg: "bg-violet-100", text: "text-violet-700", label: "Marco" },
    encaminhamento: { bg: "bg-amber-100", text: "text-amber-700", label: "Encaminhamento" },
    falta: { bg: "bg-orange-100", text: "text-orange-700", label: "Falta" },
    negligencia: { bg: "bg-red-100", text: "text-red-700", label: "Negligencia" },
  }

  const config = categoryConfig[categoria]

  return (
    <Badge variant="secondary" className={cn("text-xs", config.bg, config.text)}>
      {config.label}
    </Badge>
  )
}

interface ConsultationItemProps {
  consultation: Consultation
  isEditing: boolean
  onEdit: () => void
  onSave: (updated: Consultation) => void
  onCancel: () => void
}

function ConsultationItem({ consultation, isEditing, onEdit, onSave, onCancel }: ConsultationItemProps) {
  const [editValues, setEditValues] = useState({
    weight: consultation.weight,
    cid: consultation.cid || "",
    referral: consultation.referral || "",
    observacoes: consultation.observacoes || "",
  })

  const handleSave = () => {
    const changedFields: string[] = []
    if (editValues.weight !== consultation.weight) changedFields.push("weight")
    if (editValues.cid !== (consultation.cid || "")) changedFields.push("cid")
    if (editValues.referral !== (consultation.referral || "")) changedFields.push("referral")
    if (editValues.observacoes !== (consultation.observacoes || "")) changedFields.push("observacoes")

    const updated: Consultation = {
      ...consultation,
      weight: editValues.weight,
      cid: editValues.cid || null,
      referral: editValues.referral || null,
      observacoes: editValues.observacoes || undefined,
      editedAt: new Date().toISOString(),
      editedFields: [...(consultation.editedFields || []), ...changedFields.filter(f => !(consultation.editedFields || []).includes(f))],
    }
    onSave(updated)
    toast.success("Dados atualizados.")
  }

  // Edit mode
  if (isEditing) {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-800">{consultation.date}</span>
            <Badge variant="secondary">{consultation.type === "externo" ? "Externo" : consultation.type}</Badge>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={editValues.weight}
              onChange={(e) => setEditValues(v => ({ ...v, weight: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cid">CID</Label>
            <Input
              id="cid"
              value={editValues.cid}
              onChange={(e) => setEditValues(v => ({ ...v, cid: e.target.value }))}
              placeholder="Ex: Z00.1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="referral">Encaminhamento</Label>
            <Input
              id="referral"
              value={editValues.referral}
              onChange={(e) => setEditValues(v => ({ ...v, referral: e.target.value }))}
              placeholder="Ex: Gastroenterologia"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="observacoes">Observacoes</Label>
          <Textarea
            id="observacoes"
            value={editValues.observacoes}
            onChange={(e) => setEditValues(v => ({ ...v, observacoes: e.target.value }))}
            placeholder="Observacoes adicionais..."
            rows={2}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" />
            Cancelar
          </Button>
          <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={handleSave}>
            <Check className="h-4 w-4 mr-1" />
            Salvar
          </Button>
        </div>
      </div>
    )
  }

  // External consultation display
  if (consultation.isExterno) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-1.5 hover:border-slate-300 transition-colors">
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
            <span className="text-sm text-slate-600 flex items-center gap-1">
              {consultation.weight}kg
              <WeightTrendIcon trend={consultation.weightTrend} />
            </span>
            {consultation.editedAt && (
              <span className="text-xs text-amber-600 flex items-center gap-1 ml-2">
                <Pencil className="h-3 w-3" />
                * editado em {new Date(consultation.editedAt).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-slate-400 cursor-help shrink-0" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Dados de atendimento realizado fora do HC. Inseridos manualmente com base em informacoes fornecidas pela familia.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        {/* Line 2 - External */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{consultation.servicoOrigem}</span>
        </div>
        {consultation.observacoes && (
          <p className="text-slate-500 text-xs pt-1">{consultation.observacoes}</p>
        )}
      </div>
    )
  }

  // Regular consultation display
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-1.5 hover:border-slate-300 transition-colors">
      {/* Line 1 - Regular consultation */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-slate-700">{consultation.date}</span>
          <Badge variant="secondary" className="text-xs">{consultation.type}</Badge>
          <span className="text-sm text-slate-600 flex items-center gap-1">
            {consultation.weight}kg
            <WeightTrendIcon trend={consultation.weightTrend} />
          </span>
          {consultation.editedAt && (
            <span className="text-xs text-amber-600 flex items-center gap-1 ml-2">
              <Pencil className="h-3 w-3" />
              * editado em {new Date(consultation.editedAt).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-xs"
            onClick={() => window.location.href = `/consulta/historico?date=${consultation.date}&source=base`}
          >
            <FileText className="h-3 w-3 mr-1" />
            Ver detalhes
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onEdit}>
            <Pencil className="h-3 w-3 mr-1" />
            Editar
          </Button>
        </div>
      </div>
      {/* Line 2 - Regular consultation */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>CID: {consultation.cid || "—"}</span>
        <span>{consultation.referral ? `Encam.: ${consultation.referral}` : "Sem encaminhamento"}</span>
      </div>
      {consultation.observacoes && (
        <p className="text-slate-500 text-xs pt-1">{consultation.observacoes}</p>
      )}
    </div>
  )
}

interface ProntuarioContentProps {
  prontuario: Prontuario
  consultations: Consultation[]
  editingId: string | null
  onEditStart: (id: string) => void
  onEditSave: (prontuarioNumber: string, consultation: Consultation) => void
  onEditCancel: () => void
  patientId: string
}

function ProntuarioContent({
  prontuario,
  consultations,
  editingId,
  onEditStart,
  onEditSave,
  onEditCancel,
  patientId,
}: ProntuarioContentProps) {
  const router = useRouter()
  // Only show charts and detailed data for the first patient (Ana Clara)
  const hasFullData = patientId === "1"

  return (
    <div className="space-y-6">
      {/* Two-column grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Timeline Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Linha do Tempo</CardTitle>
              <CardDescription>Consultas deste prontuario</CardDescription>
            </CardHeader>
            <CardContent>
              {consultations.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <FileText className="h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500">Nenhuma consulta registrada neste prontuario</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {consultations.map((consultation) => (
                    <ConsultationItem
                      key={consultation.id || consultation.date}
                      consultation={consultation}
                      isEditing={editingId === (consultation.id || consultation.date)}
                      onEdit={() => onEditStart(consultation.id || consultation.date)}
                      onSave={(updated) => onEditSave(prontuario.number, updated)}
                      onCancel={onEditCancel}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conduct Patterns Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Padrao de Condutas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  CIDs mais frequentes
                </div>
                <div className="text-sm">
                  {hasFullData ? "Z00.1 (3x), J06.9 (1x)" : "—"}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Encaminhamentos
                </div>
                <div className="text-sm">
                  {hasFullData ? (
                    <>Gastroenterologia (Mar/2025) — <span className="text-amber-600">retorno nao confirmado (45 dias)</span></>
                  ) : (
                    <span className="text-muted-foreground">Nenhum registrado</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Internacoes
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
          {/* Alerts Card - only show for patient with full data */}
          {hasFullData && (
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
                        {alerta.tipo === "critico" ? "ALERTA: " : "ATENCAO: "}
                        {alerta.mensagem}
                      </span>
                      <CategoryBadge categoria={alerta.categoria} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Latest Data Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ultimos Dados Coletados</CardTitle>
              <CardDescription>{consultations[0]?.date || "—"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Peso:</span>{" "}
                  <span className="font-medium">{hasFullData ? anthropometricData.weight : consultations[0]?.weight || "—"} kg</span>{" "}
                  {hasFullData && <span className="text-muted-foreground">({anthropometricData.weightPercentile})</span>}
                </div>
                <div>
                  <span className="text-muted-foreground">Altura:</span>{" "}
                  {hasFullData ? (
                    <>
                      <span className="font-medium">{anthropometricData.height} cm</span>{" "}
                      <span className="text-muted-foreground">({anthropometricData.heightPercentile})</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground italic">nao registrado</span>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">Perimetro Cefalico:</span>{" "}
                  <span className="text-muted-foreground italic">nao registrado</span>
                </div>
                <div>
                  <span className="text-muted-foreground">IMC:</span>{" "}
                  {hasFullData ? (
                    <span className="font-medium">{anthropometricData.bmi}</span>
                  ) : (
                    <span className="text-muted-foreground italic">nao calculado</span>
                  )}
                </div>
              </div>

              {hasFullData && (
                <div className="pt-4 border-t">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Evolucao do Peso (ultimas 4 consultas)
                  </div>
                  <WeightSparkline />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Full-width sections - Growth Charts */}
      {hasFullData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Curva de Estatura por Idade</CardTitle>
              <CardDescription>
                Referencia OMS (0 a 5 anos) — Meninas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HeightChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Curva de IMC por Idade</CardTitle>
              <CardDescription>
                Referencia OMS (0 a 5 anos) — Meninas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BmiChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Marcos do Desenvolvimento</CardTitle>
              <CardDescription>
                Historico de avaliacao por faixa etaria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MilestonesHistory />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default function PatientDetailPage() {
  const router = useRouter()
  const params = useParams()
  const patientId = params.id as string

  const patient = getPatientById(patientId)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [prontuarioOpen, setProntuarioOpen] = useState(false)
  
  // Local state for consultations (allows editing)
  const [localProntuarios, setLocalProntuarios] = useState<Prontuario[]>(
    patient?.prontuarios || []
  )

  if (!patient) {
    return (
      <MainLayout title="Paciente nao encontrado">
        <div className="flex flex-col items-center justify-center py-12">
          <Empty
            icon={FileText}
            title="Paciente nao encontrado"
            description="O paciente solicitado nao existe na base de dados."
          />
          <Button variant="outline" className="mt-4" onClick={() => router.push("/pacientes")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Base de Pacientes
          </Button>
        </div>
      </MainLayout>
    )
  }

  const primaryProntuario = localProntuarios.find(p => p.number === patient.primaryRecord) || localProntuarios[0]

  const handleEditSave = (prontuarioNumber: string, updatedConsultation: Consultation) => {
    setLocalProntuarios(prev => prev.map(p => {
      if (p.number !== prontuarioNumber) return p
      return {
        ...p,
        consultations: p.consultations.map(c => 
          (c.id || c.date) === (updatedConsultation.id || updatedConsultation.date) 
            ? updatedConsultation 
            : c
        ),
      }
    }))
    setEditingId(null)
  }

  return (
    <MainLayout 
      title="Detalhes do Paciente"
      actions={
        <Button variant="outline" size="sm" onClick={() => router.push('/pacientes')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Base de Pacientes
        </Button>
      }
    >
      <TooltipProvider>
        <div className="space-y-6">
          {/* Read-only notice banner */}
          <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
            <Info className="h-4 w-4 shrink-0" />
            Visualizacao historica — paciente nao esta em atendimento ativo
          </div>

          {/* Patient Header Card */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 text-lg font-bold">
                    {getInitials(patient.name)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-xl">{patient.name}</CardTitle>
                    </div>
                    <CardDescription className="text-sm">
                      {patient.age} | Nascimento: {patient.birthDate} | CPF: {maskCpf(patient.cpf || "")}
                    </CardDescription>
                    <CardDescription className="text-sm">
                      Prontuario atual: {patient.primaryRecord || patient.record}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => router.push(`/caderneta?patientId=${patientId}`)}>
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
          </Card>

          {/* Prontuario Section - always show primary only */}
          {primaryProntuario && (
            <>
              <div className="text-xs text-muted-foreground">
                Aberto em: {primaryProntuario.openedDate} | {primaryProntuario.consultations.length} consulta(s)
              </div>
              <ProntuarioContent
                prontuario={primaryProntuario}
                consultations={primaryProntuario.consultations}
                editingId={editingId}
                onEditStart={setEditingId}
                onEditSave={handleEditSave}
                onEditCancel={() => setEditingId(null)}
                patientId={patientId}
              />
            </>
          )}
        </div>
      </TooltipProvider>

      {/* Prontuario Dialog */}
      <Dialog open={prontuarioOpen} onOpenChange={setProntuarioOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-700" />
              Prontuario Completo
            </DialogTitle>
            <DialogDescription>
              O prontuario completo esta disponivel no AGHU.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm space-y-1">
              <p className="font-medium text-slate-800">{patient.name}</p>
              <p className="text-slate-500">Prontuario: {patient.primaryRecord || patient.record}</p>
            </div>
            <p className="text-sm text-slate-600">
              Para acessar o historico completo, evolucao e exames anteriores, acesse o
              prontuario no <span className="font-medium">AGHU</span> e busque pelo numero
              de prontuario acima.
            </p>
            <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              O prontuario legal do paciente e mantido no AGHU. Este sistema registra
              os dados estruturados das consultas realizadas aqui.
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="default"
              onClick={() => {
                navigator.clipboard.writeText(patient.primaryRecord || patient.record)
                toast.success("Numero do prontuario copiado!")
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copiar numero do prontuario
            </Button>
            <Button variant="ghost" onClick={() => setProntuarioOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
