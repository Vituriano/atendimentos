"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, RotateCcw, Scale, ClipboardList, Shield, Stethoscope, 
  CheckSquare, Brain, Users, Heart, Send, FileText, Baby, GraduationCap
} from "lucide-react"
import { currentPatient as defaultPatient, getConsultationDetails, allPatients } from "@/lib/mock-data"
import { usePatient } from "@/lib/patient-context"
import { cn } from "@/lib/utils"

// Section icons mapping (same as consulta/page.tsx)
const sectionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  anthropometric: Scale,
  anamnesis: ClipboardList,
  imunizacoes: Shield,
  escolaridade: GraduationCap,
  triagemNeonatal: Baby,
  exameFisico: Stethoscope,
  marcos: CheckSquare,
  mchat: Brain,
  historiaFamiliar: Users,
  dinamicaFamiliar: Heart,
  encaminhamentos: Send,
  diagnostico: FileText,
  condutasHipoteses: FileText,
  procedimentos: Stethoscope,
}

// Alimentacao labels
const ALIMENTACAO_LABELS: Record<string, string> = {
  "aleitamento-exclusivo": "Aleitamento materno exclusivo",
  "aleitamento-misto": "Aleitamento materno misto",
  "formula-exclusiva": "Formula exclusiva",
  "introducao-alimentar": "Introducao alimentar em andamento",
  "dieta-familia": "Dieta da familia",
}

export default function ConsultaHistoricoPage() {
  return (
    <Suspense fallback={<HistoricoLoading />}>
      <ConsultaHistorico />
    </Suspense>
  )
}

function HistoricoLoading() {
  return (
    <MainLayout title="Historico da Consulta">
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    </MainLayout>
  )
}

function ConsultaHistorico() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { activePatient } = usePatient()
  
  const consultationDate = searchParams.get("date") || ""
  const source = searchParams.get("source")
  const isFromBase = source === "base"
  const details = getConsultationDetails(consultationDate)
  
  // Get patient from details or context
  const patient = details?.patientId 
    ? allPatients.find(p => p.id === details.patientId) || activePatient || defaultPatient
    : activePatient || defaultPatient

  if (!details) {
    return (
      <MainLayout title="Historico da Consulta">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">Consulta nao encontrada para a data: {consultationDate}</p>
          <Button variant="outline" onClick={() => router.push("/briefing")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Briefing
          </Button>
        </div>
      </MainLayout>
    )
  }

  const headerActions = (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => router.push(isFromBase ? "/pacientes" : "/briefing")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        {isFromBase ? "Voltar a Base de Pacientes" : "Voltar ao Briefing"}
      </Button>
      {!isFromBase && (
        <Button 
          variant="default" 
          size="sm" 
          onClick={() => router.push(`/consulta?reopen=true&date=${consultationDate}`)}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reabrir para edicao
        </Button>
      )}
    </div>
  )

  return (
    <MainLayout title="Historico da Consulta" actions={headerActions}>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Patient Header */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{patient.name}</CardTitle>
                <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                  <span>Prontuario: {patient.record}</span>
                  <span>|</span>
                  <span>Data: {details.date}</span>
                  <span>|</span>
                  <Badge variant="secondary">{details.type}</Badge>
                  {details.duration && (
                    <>
                      <span>|</span>
                      <span>Duracao: {details.duration}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Read-only indicator */}
        <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
          <FileText className="h-4 w-4 shrink-0" />
          <span>
            {isFromBase 
              ? "Visualizacao historica — paciente nao esta em atendimento ativo."
              : "Visualizacao somente leitura. Use \"Reabrir para edicao\" para fazer alteracoes."
            }
          </span>
        </div>

        {/* Anthropometric Section */}
        {details.anthropometric && (
          <SectionCard 
            icon={sectionIcons.anthropometric} 
            title="Antropometria"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <DataItem label="Peso" value={`${details.anthropometric.weight} kg`} />
              <DataItem label="Altura" value={`${details.anthropometric.height} cm`} />
              {details.anthropometric.headCircumference && (
                <DataItem label="PC" value={`${details.anthropometric.headCircumference} cm`} />
              )}
              {details.anthropometric.bloodPressure && (
                <DataItem label="PA" value={details.anthropometric.bloodPressure} />
              )}
              {details.anthropometric.bmi && (
                <DataItem label="IMC" value={details.anthropometric.bmi.toFixed(1)} />
              )}
            </div>
          </SectionCard>
        )}

        {/* Anamnesis Section */}
        {details.anamnesis && (
          <SectionCard 
            icon={sectionIcons.anamnesis} 
            title="Anamnese"
          >
            <div className="space-y-4">
              {details.anamnesis.queixaPrincipal && (
                <DataItem label="Queixa Principal" value={details.anamnesis.queixaPrincipal} />
              )}
              {details.anamnesis.hda && (
                <DataItem label="Historia da Doenca Atual" value={details.anamnesis.hda} />
              )}
              {details.anamnesis.alimentacao && (
                <DataItem 
                  label="Alimentacao" 
                  value={ALIMENTACAO_LABELS[details.anamnesis.alimentacao] || details.anamnesis.alimentacao} 
                />
              )}
              {details.anamnesis.habitos && (
                <div className="grid grid-cols-3 gap-4">
                  {details.anamnesis.habitos.sonoHoras && (
                    <DataItem label="Sono" value={`${details.anamnesis.habitos.sonoHoras}h/noite`} />
                  )}
                  {details.anamnesis.habitos.telaHoras !== undefined && (
                    <DataItem label="Tempo de Tela" value={`${details.anamnesis.habitos.telaHoras}h/dia`} />
                  )}
                  {details.anamnesis.habitos.atividadeFisica && (
                    <DataItem label="Atividade Fisica" value={details.anamnesis.habitos.atividadeFisica} />
                  )}
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {/* Interrogatorio Sintomatologico */}
        {details.interrogatorioSintomatologico && details.interrogatorioSintomatologico.length > 0 && (
          <SectionCard 
            icon={sectionIcons.anamnesis} 
            title="Interrogatorio Sintomatologico"
          >
            <div className="space-y-2">
              {details.interrogatorioSintomatologico.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Badge variant="outline" className="shrink-0">{item.sistema}</Badge>
                  <span className="text-sm">{item.alteracao}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Imunizacoes */}
        {details.imunizacoes && (
          <SectionCard 
            icon={sectionIcons.imunizacoes} 
            title="Imunizacoes"
          >
            <div className="flex items-center gap-4">
              <Badge 
                variant="secondary"
                className={cn(
                  details.imunizacoes.status === "completo" && "bg-green-100 text-green-700",
                  details.imunizacoes.status === "incompleto" && "bg-amber-100 text-amber-700",
                  details.imunizacoes.status === "atrasado" && "bg-red-100 text-red-700"
                )}
              >
                {details.imunizacoes.status === "completo" ? "Calendario Completo" : 
                 details.imunizacoes.status === "incompleto" ? "Calendario Incompleto" : "Calendario Atrasado"}
              </Badge>
              {details.imunizacoes.observacoes && (
                <span className="text-sm text-muted-foreground">{details.imunizacoes.observacoes}</span>
              )}
            </div>
          </SectionCard>
        )}

        {/* Triagem Neonatal */}
        {details.triagemNeonatal && (
          <SectionCard 
            icon={sectionIcons.triagemNeonatal} 
            title="Triagem Neonatal"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <DataItem label="IG" value={`${details.triagemNeonatal.idadeGestacional} semanas`} />
              <DataItem label="Peso ao Nascer" value={`${details.triagemNeonatal.pesoNascimento}g`} />
              {details.triagemNeonatal.testePezinho && (
                <DataItem label="Teste do Pezinho" value={details.triagemNeonatal.testePezinho} />
              )}
              {details.triagemNeonatal.testeOrelhinha && (
                <DataItem label="Teste da Orelhinha" value={details.triagemNeonatal.testeOrelhinha} />
              )}
              {details.triagemNeonatal.testeOlhinho && (
                <DataItem label="Teste do Olhinho" value={details.triagemNeonatal.testeOlhinho} />
              )}
              {details.triagemNeonatal.testeCoracaozinho && (
                <DataItem label="Teste do Coracaozinho" value={details.triagemNeonatal.testeCoracaozinho} />
              )}
            </div>
          </SectionCard>
        )}

        {/* Escolaridade */}
        {details.escolaridade && (
          <SectionCard 
            icon={sectionIcons.escolaridade} 
            title="Escolaridade"
          >
            <div className="space-y-2">
              <DataItem 
                label="Frequenta Escola" 
                value={details.escolaridade.frequentaEscola ? "Sim" : "Nao"} 
              />
              {details.escolaridade.tipo && (
                <DataItem label="Tipo" value={details.escolaridade.tipo} />
              )}
              {details.escolaridade.desempenho && (
                <DataItem label="Desempenho" value={details.escolaridade.desempenho} />
              )}
              {details.escolaridade.observacoes && (
                <DataItem label="Observacoes" value={details.escolaridade.observacoes} />
              )}
            </div>
          </SectionCard>
        )}

        {/* Exame Fisico */}
        {details.exameFisico && details.exameFisico.length > 0 && (
          <SectionCard 
            icon={sectionIcons.exameFisico} 
            title="Exame Fisico"
          >
            <div className="space-y-3">
              {details.exameFisico.map((sistema, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <Badge 
                    variant="secondary"
                    className={cn(
                      "shrink-0",
                      sistema.status === "normal" && "bg-green-100 text-green-700",
                      sistema.status === "alterado" && "bg-amber-100 text-amber-700"
                    )}
                  >
                    {sistema.status === "normal" ? "Normal" : "Alterado"}
                  </Badge>
                  <div>
                    <span className="font-medium">{sistema.sistema}</span>
                    {sistema.descricao && (
                      <p className="text-sm text-muted-foreground mt-1">{sistema.descricao}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Marcos do Desenvolvimento */}
        {details.marcos && details.marcos.length > 0 && (
          <SectionCard 
            icon={sectionIcons.marcos} 
            title="Marcos do Desenvolvimento"
          >
            <div className="flex flex-wrap gap-2">
              {details.marcos.map((marco, idx) => (
                <Badge 
                  key={idx}
                  variant="secondary"
                  className={cn(
                    marco.status === "confirmado" && "bg-green-100 text-green-700",
                    marco.status === "nao-confirmado" && "bg-red-100 text-red-700",
                    marco.status === "nao-avaliado" && "bg-slate-100 text-slate-700"
                  )}
                >
                  {marco.nome}
                </Badge>
              ))}
            </div>
          </SectionCard>
        )}

        {/* M-CHAT */}
        {details.mchat && (
          <SectionCard 
            icon={sectionIcons.mchat} 
            title="M-CHAT-R"
          >
            <div className="flex items-center gap-4">
              <DataItem label="Pontuacao" value={`${details.mchat.pontuacao}/20`} />
              <Badge 
                variant="secondary"
                className={cn(
                  details.mchat.risco === "baixo" && "bg-green-100 text-green-700",
                  details.mchat.risco === "medio" && "bg-amber-100 text-amber-700",
                  details.mchat.risco === "alto" && "bg-red-100 text-red-700"
                )}
              >
                Risco {details.mchat.risco}
              </Badge>
            </div>
          </SectionCard>
        )}

        {/* Historia Familiar */}
        {details.historiaFamiliar && (
          <SectionCard 
            icon={sectionIcons.historiaFamiliar} 
            title="Historia Familiar"
          >
            <div className="space-y-2">
              {details.historiaFamiliar.antecedentes && details.historiaFamiliar.antecedentes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {details.historiaFamiliar.antecedentes.map((ant, idx) => (
                    <Badge key={idx} variant="outline">{ant}</Badge>
                  ))}
                </div>
              )}
              {details.historiaFamiliar.observacoes && (
                <p className="text-sm text-muted-foreground">{details.historiaFamiliar.observacoes}</p>
              )}
            </div>
          </SectionCard>
        )}

        {/* Dinamica Familiar */}
        {details.dinamicaFamiliar && (
          <SectionCard 
            icon={sectionIcons.dinamicaFamiliar} 
            title="Dinamica Familiar"
          >
            <div className="space-y-2">
              {details.dinamicaFamiliar.composicao && (
                <DataItem label="Composicao Familiar" value={details.dinamicaFamiliar.composicao} />
              )}
              {details.dinamicaFamiliar.observacoes && (
                <p className="text-sm text-muted-foreground">{details.dinamicaFamiliar.observacoes}</p>
              )}
            </div>
          </SectionCard>
        )}

        {/* Encaminhamentos */}
        {details.encaminhamentos && details.encaminhamentos.length > 0 && (
          <SectionCard 
            icon={sectionIcons.encaminhamentos} 
            title="Encaminhamentos"
          >
            <div className="space-y-3">
              {details.encaminhamentos.map((enc, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border bg-slate-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{enc.especialidade}</span>
                      <Badge 
                        variant="secondary"
                        className={cn(
                          enc.prioridade === "Eletivo" && "bg-blue-100 text-blue-700",
                          enc.prioridade === "Prioritário" && "bg-amber-100 text-amber-700",
                          enc.prioridade === "Urgente" && "bg-red-100 text-red-700"
                        )}
                      >
                        {enc.prioridade}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{enc.justificativa}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Diagnostico */}
        {details.diagnostico && (
          <SectionCard 
            icon={sectionIcons.diagnostico} 
            title="Diagnostico"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-teal-600">Principal</Badge>
                <span className="font-medium">{details.diagnostico.cidPrincipal}</span>
                <span className="text-muted-foreground">- {details.diagnostico.cidPrincipalDescricao}</span>
              </div>
              {details.diagnostico.cidsSecundarios && details.diagnostico.cidsSecundarios.length > 0 && (
                <div className="space-y-2">
                  {details.diagnostico.cidsSecundarios.map((cid, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Badge variant="outline">Secundario</Badge>
                      <span className="font-medium">{cid.codigo}</span>
                      <span className="text-muted-foreground">- {cid.descricao}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {/* Condutas e Hipoteses */}
        {details.condutasHipoteses && (
          <SectionCard 
            icon={sectionIcons.condutasHipoteses} 
            title="Hipoteses e Condutas"
          >
            <div className="space-y-4">
              {details.condutasHipoteses.hipoteses && (
                <DataItem label="Hipoteses Diagnosticas" value={details.condutasHipoteses.hipoteses} />
              )}
              {details.condutasHipoteses.condutas && (
                <DataItem label="Condutas" value={details.condutasHipoteses.condutas} />
              )}
            </div>
          </SectionCard>
        )}

        {/* Procedimentos */}
        {details.procedimentos && details.procedimentos.length > 0 && (
          <SectionCard 
            icon={sectionIcons.procedimentos} 
            title="Procedimentos Realizados"
          >
            <div className="space-y-2">
              {details.procedimentos.map((proc, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-50">
                  <span>{proc.nome}</span>
                  <Badge variant="secondary">Qtd: {proc.quantidade}</Badge>
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>
    </MainLayout>
  )
}

// Reusable section card component
function SectionCard({ 
  icon: Icon, 
  title, 
  children 
}: { 
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode 
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-teal-700" />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        {children}
      </CardContent>
    </Card>
  )
}

// Reusable data item component
function DataItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-sm text-muted-foreground">{label}</span>
      <p className="font-medium">{value}</p>
    </div>
  )
}
