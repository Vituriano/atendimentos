"use client"

import { useState, useEffect, useId, useMemo, Suspense } from "react"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  currentPatient as defaultPatient, 
  milestones0to3, 
  milestones3to6, 
  milestones6to12, 
  milestones1to2, 
  milestones35to5, 
  mchatQuestions, 
  alertasExpandidos,
  consultationHistory
} from "@/lib/mock-data"
import { usePatient } from "@/lib/patient-context"
import { 
  Clock, AlertTriangle, Check, X, Minus, Loader2, Brain, Eye, Heart, Wind, 
  Circle, User, Layers, MoveHorizontal, Activity, FileText, Stethoscope, 
  Plus, Send, Printer, Copy, Info, Save, FileInput, Scale, ClipboardList, 
  CheckSquare, ChevronLeft, ChevronRight, Shield, GraduationCap, Baby, Users,
  Home, Utensils, Moon, Smartphone, Lock, AlertOctagon, Ear, Smile, RotateCcw
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { cn, formatDuration } from "@/lib/utils"
import { toast } from "sonner"
import { ConsultationTimer } from "@/components/consultation-timer"
import type { SistemaStatus, PrioridadeEncaminhamento, Encaminhamento, Procedimento, ConsultaExterna } from "@/lib/types"

// Alimentacao labels - used in both getSectionSummary and generateAGHUText
const ALIMENTACAO_LABELS: Record<string, string> = {
  "aleitamento-exclusivo": "Aleitamento materno exclusivo",
  "aleitamento-misto": "Aleitamento materno misto",
  "formula-exclusiva": "Formula exclusiva",
  "introducao-alimentar": "Introducao alimentar em andamento",
  "dieta-familia": "Dieta da familia",
}

// Milestone groups by age range
const milestoneGroups = [
  {
    label: "0 a 3 meses",
    milestones: milestones0to3,
    ageColumns: [0, 1, 2, 3],
    minAge: 0,
    maxAge: 3,
  },
  {
    label: "3 a 6 meses",
    milestones: milestones3to6,
    ageColumns: [3, 4, 5, 6],
    minAge: 3,
    maxAge: 6,
  },
  {
    label: "6 a 12 meses",
    milestones: milestones6to12,
    ageColumns: [6, 7, 8, 9, 10, 11, 12],
    minAge: 6,
    maxAge: 12,
  },
  {
    label: "1 a 2 anos",
    milestones: milestones1to2,
    ageColumns: [12, 15, 18, 21, 24],
    minAge: 12,
    maxAge: 24,
  },
  {
    label: "3 anos e meio a 5 anos",
    milestones: milestones35to5,
    ageColumns: [42, 44, 46, 48, 50, 52, 54, 56, 58, 60],
    minAge: 42,
    maxAge: 60,
  },
]

// Function to get the active milestone group for a patient's age
function getActiveGroup(ageInMonths: number) {
  const reversed = [...milestoneGroups].reverse()
  return reversed.find((g) => ageInMonths >= g.minAge) ?? milestoneGroups[0]
}

// Sistema de exame físico (ordem cefálo-caudal)
const sistemasExame = [
  { id: "geral", nome: "Geral", icon: Activity, placeholder: "Estado geral, hidratação, coloração, atividade..." },
  { id: "pele", nome: "Pele", icon: Layers, placeholder: "Turgor, icterícia, cianose, exantemas, lesões..." },
  { id: "olhos", nome: "Olhos", icon: Eye, placeholder: "Reflexo vermelho, alinhamento, secreções, conjuntivas..." },
  { id: "ouvidos", nome: "Ouvidos", icon: Ear, placeholder: "Otoscopia, membrana timpânica, secreções..." },
  { id: "bocaDentes", nome: "Boca e Dentes", icon: Smile, placeholder: "Mucosa oral, dentição, cáries, amígdalas, faringe..." },
  { id: "cabecaPescoco", nome: "Cabeça", icon: Brain, placeholder: "Fontanelas, formato do crânio...", showFontanelas: true },
  { id: "gangliosLinfaticos", nome: "Gânglios linfáticos", icon: Circle, placeholder: "Adenomegalias — localização, tamanho, consistência, mobilidade..." },
  { id: "pescoco", nome: "Pescoço", icon: MoveHorizontal, placeholder: "Mobilidade, tireoide, linfonodos cervicais..." },
  { id: "cardiovascular", nome: "Cardiovascular", icon: Heart, placeholder: "Bulhas, sopros, frequência cardíaca, perfusão periférica..." },
  { id: "respiratorio", nome: "Respiratório", icon: Wind, placeholder: "Ausculta pulmonar, retrações, frequência respiratória, saturação..." },
  { id: "abdomen", nome: "Ap. Gastrointestinal", icon: Circle, placeholder: "Visceromegalias, ruídos hidroaéreos, dor à palpação, distensão..." },
  { id: "genitalia", nome: "Ap. Geniturinário", icon: User, placeholder: "Desenvolvimento adequado para a idade, alterações observadas..." },
  { id: "membrosColuna", nome: "Sist. Musculoesquelético", icon: MoveHorizontal, placeholder: "Tônus muscular, reflexos, deformidades, marcha, postura..." },
  { id: "neurologico", nome: "Sistema Nervoso", icon: Activity, placeholder: "Nível de consciência, responsividade, reflexos primitivos...", showReflexosPrimitivos: true },
]

// Sistemas do interrogatório sintomatológico
const interrogSistemas = [
  { id: "geral", nome: "Geral", placeholder: "Febre, fadiga, perda de peso, apetite..." },
  { id: "peleMucosas", nome: "Pele e mucosas", placeholder: "Lesões, prurido, icterícia, palidez..." },
  { id: "olhos", nome: "Olhos", placeholder: "Secreção, vermelhidão, lacrimejamento..." },
  { id: "ouvidos", nome: "Ouvidos", placeholder: "Otalgia, otorreia, hipoacusia..." },
  { id: "boca", nome: "Boca", placeholder: "Dor, afta, dificuldade de deglutição..." },
  { id: "respiratorio", nome: "Respiratório", placeholder: "Tosse, dispneia, sibilância, coriza..." },
  { id: "cardiovascular", nome: "Cardiovascular", placeholder: "Palpitação, cianose, edema..." },
  { id: "gastrointestinal", nome: "Gastrointestinal", placeholder: "Vômitos, diarreia, constipação, dor abdominal..." },
  { id: "geniturinario", nome: "Geniturinário", placeholder: "Disúria, hematúria, polaciúria..." },
  { id: "musculoEsqueletico", nome: "M��sculo-esquelético", placeholder: "Dor articular, limitação de movimento..." },
  { id: "nervoso", nome: "Sistema Nervoso", placeholder: "Cefaleia, convulsão, alteração de comportamento..." },
]

// Lista de especialidades
const especialidades = [
  "Gastroenterologia",
  "Neurologia",
  "Cardiologia",
  "Pneumologia",
  "Endocrinologia",
  "Psicologia",
  "Fonoaudiologia",
  "Fisioterapia",
  "Terapia Ocupacional",
  "Cirurgia Pediátrica",
  "Oftalmologia",
  "Ortopedia",
  "Dermatologia",
]

// Lista de procedimentos
const procedimentosLista = [
  "Nebulização",
  "Curativo simples",
  "Curativo complexo",
  "Coleta de sangue venoso",
  "Teste do pezinho",
  "Aplicação de vacina",
  "Sondagem vesical",
  "Sutura simples",
  "Eletrocardiograma",
  "Glicemia capilar",
]

// Section icons mapping
const sectionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  anthropometric: Scale,
  anamnesis: ClipboardList,
  imunizacoes: Shield,
  escolaridade: GraduationCap,
  triagemNeonatal: Baby,
  clinical: Stethoscope,
  milestones: CheckSquare,
  mchat: Brain,
  historiaFamiliar: Users,
  dinamicaFamiliar: Heart,
  socioeconomico: Home,
  referral: Send,
  diagnostico: FileText,
  condutasHipoteses: FileText,
  procedimentos: Stethoscope,
  externo: FileInput,
}

// Section descriptions
const sectionDescriptions: Record<string, string> = {
  anthropometric: "Registre as medidas aferidas nesta consulta.",
  anamnesis: "Queixa principal, HDA, alimentação e hábitos de vida.",
  imunizacoes: "Registre o status vacinal conforme o Calendário Nacional de Imunização (PNI).",
  escolaridade: "Crescimento e desenvolvimento — avaliação escolar (opinião dos familiares).",
  triagemNeonatal: "Registro dos testes de triagem neonatal e dados do nascimento.",
  clinical: "Avaliação cefálo-caudal por sistemas. Selecione os sistemas avaliados.",
  milestones: "Acompanhamento do desenvolvimento neuropsicomotor por faixa etária.",
  mchat: "Triagem de risco para Transtorno do Espectro Autista. Aplicável de 16 a 30 meses.",
  historiaFamiliar: "Condições de saúde e contexto dos familiares próximos.",
  dinamicaFamiliar: "Triagem psicossocial — perguntas estruturadas sobre contexto familiar.",
  socioeconomico: "Condições de moradia e contexto socioeconômico familiar — coletado apenas na primeira consulta.",
  referral: "Registre os encaminhamentos gerados nesta consulta.",
  diagnostico: "Registro do diagnóstico principal e secundários (CID-10 / SID).",
  condutasHipoteses: "Raciocínio clínico e plano de cuidado desta consulta.",
  procedimentos: "Procedimentos realizados durante o atendimento, vinculados ao diagnóstico.",
  externo: "Dados de consultas realizadas em outros serviços, fornecidos pela família.",
}

type SecaoId = "anthropometric" | "anamnesis" | "imunizacoes" | "escolaridade" | "triagemNeonatal" | "clinical" | "milestones" | "mchat" | "historiaFamiliar" | "dinamicaFamiliar" | "socioeconomico" | "referral" | "diagnostico" | "condutasHipoteses" | "procedimentos" | "externo"

export default function ConsultaPage() {
  return (
    <Suspense fallback={<ConsultaLoading />}>
      <FormularioConsulta />
    </Suspense>
  )
}

function ConsultaLoading() {
  return (
    <MainLayout title="Consulta">
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    </MainLayout>
  )
}

function FormularioConsulta() {
  const { activePatient, clearActivePatient, entryType } = usePatient()
  const router = useRouter()
  const formId = useId()
  const searchParams = useSearchParams()
  
  // Reopen mode state
  const isReopening = searchParams.get('reopen') === 'true'
  const reopenDate = searchParams.get('date') ?? ''
  
  // Anthropometric state
  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")
  const [headCircumference, setHeadCircumference] = useState("")
  const [pressaoArterial, setPressaoArterial] = useState("")
  
  // Anamnese state - expanded
  const [queixaPrincipal, setQueixaPrincipal] = useState("")
  const [hda, setHda] = useState("")
  const [alimentacao, setAlimentacao] = useState("")
  const [sono, setSono] = useState("")
  
  // Interrogatório Sintomatológico
  const [interrogGeral, setInterrogGeral] = useState("")
  const [interrogPeleMucosas, setInterrogPeleMucosas] = useState("")
  const [interrogOlhos, setInterrogOlhos] = useState("")
  const [interrogOuvidos, setInterrogOuvidos] = useState("")
  const [interrogBoca, setInterrogBoca] = useState("")
  const [interrogRespiratorio, setInterrogRespiratorio] = useState("")
  const [interrogCardiovascular, setInterrogCardiovascular] = useState("")
  const [interrogGastrointestinal, setInterrogGastrointestinal] = useState("")
  const [interrogGeniturinario, setInterrogGeniturinario] = useState("")
  const [interrogMusculoEsqueletico, setInterrogMusculoEsqueletico] = useState("")
  const [interrogNervoso, setInterrogNervoso] = useState("")
  const [interrogSistemasSelecionados, setInterrogSistemasSelecionados] = useState<Set<string>>(new Set())
  
  // Medicaç��es e Exames
  const [medicacoesRotina, setMedicacoesRotina] = useState("")
  const [examesComplementares, setExamesComplementares] = useState("")
  
  // Antecedentes Pessoais (primeira consulta)
  const [antecedentesDoencas, setAntecedentesDoencas] = useState("")
  
  // Alimentação detalhada
  const [cardapioCafe, setCardapioCafe] = useState("")
  const [cardapioLancheManha, setCardapioLancheManha] = useState("")
  const [cardapioAlmoco, setCardapioAlmoco] = useState("")
  const [cardapioLancheTarde, setCardapioLancheTarde] = useState("")
  const [cardapioJantar, setCardapioJantar] = useState("")
  const [cardapioCeia, setCardapioCeia] = useState("")
  const [localRefeicoes, setLocalRefeicoes] = useState("")
  const [telaRefeicoes, setTelaRefeicoes] = useState(false)
  
  // Hábitos - Sono
  const [sonoHorario, setSonoHorario] = useState("")
  const [sonoLocal, setSonoLocal] = useState("")
  const [sonoHigiene, setSonoHigiene] = useState("")
  const [sonoAlteracoes, setSonoAlteracoes] = useState("")
  
  // Hábitos - Telas
  const [telasDispositivos, setTelasDispositivos] = useState<string[]>([])
  const [telasTempoDiario, setTelasTempoDiario] = useState("")
  const [telasFrequencia, setTelasFrequencia] = useState("")
  
  // Outros hábitos
  const [chupetaChupaDedo, setChupetaChupaDedo] = useState<boolean | null>(null)
  const [higieneDentaria, setHigieneDentaria] = useState("")
  const [atividadesRecreativas, setAtividadesRecreativas] = useState("")
  
  // Imunizações
  const [statusVacinal, setStatusVacinal] = useState("")
  
  // Triagem Neonatal (0-2 anos)
  const [idadeGestacional, setIdadeGestacional] = useState("")
  const [pesoNascimento, setPesoNascimento] = useState("")
  const [hipDiagAnterior, setHipDiagAnterior] = useState("")
  const [testePezinho, setTestePezinho] = useState({ resultado: "", data: "", descricao: "" })
  const [testeOrelhinha, setTesteOrelhinha] = useState({ resultado: "", data: "", descricao: "" })
  const [testeOlhinho, setTesteOlhinho] = useState({ resultado: "", data: "", descricao: "" })
  const [testeCoracaozinho, setTesteCoracaozinho] = useState({ resultado: "", data: "", descricao: "" })
  
  // Escolaridade (3-9 anos)
  const [frequentaEscola, setFrequentaEscola] = useState<boolean | null>(null)
  const [anoEscolar, setAnoEscolar] = useState("")
  const [reprovacaoEscolar, setReprovacaoEscolar] = useState<boolean | null>(null)
  const [rendimentoEscolar, setRendimentoEscolar] = useState("")
  
  // Classificação Desenvolvimento
  const [classificacaoDesenvolvimento, setClassificacaoDesenvolvimento] = useState<"adequado" | "alerta" | "provavel-atraso" | null>(null)
  
  // História Familiar (3-9 anos)
  const [historiaFamiliarMudou, setHistoriaFamiliarMudou] = useState<boolean | null>(null)
  const [maternalIdade, setMaternalIdade] = useState("")
  const [maternalSaude, setMaternalSaude] = useState("")
  const [maternalOcupacao, setMaternalOcupacao] = useState("")
  const [paternalIdade, setPaternalIdade] = useState("")
  const [paternalSaude, setPaternalSaude] = useState("")
  const [paternalOcupacao, setPaternalOcupacao] = useState("")
  const [coabitacaoPais, setCoabitacaoPais] = useState("")
  const [irmaosSaude, setIrmaosSaude] = useState("")
  
  // Dinâmica Familiar (3-9 anos)
  const [dinamicaMudou, setDinamicaMudou] = useState<boolean | null>(null)
  const [relacionamentoConjugal, setRelacionamentoConjugal] = useState("")
  const [resolucaoDesentendimentos, setResolucaoDesentendimentos] = useState("")
  const [fumanteCasa, setFumanteCasa] = useState<boolean | null>(null)
  const [fumanteCasaParentesco, setFumanteCasaParentesco] = useState("")
  const [alcoolDrogasCasa, setAlcoolDrogasCasa] = useState<boolean | null>(null)
  const [alcoolDrogasTipo, setAlcoolDrogasTipo] = useState("")
  const [alcoolDrogasVontadeDiminuir, setAlcoolDrogasVontadeDiminuir] = useState<boolean | null>(null)
  const [alcoolDrogasConsequencias, setAlcoolDrogasConsequencias] = useState<boolean | null>(null)
  const [alcoolDrogasConsequenciasDesc, setAlcoolDrogasConsequenciasDesc] = useState("")
  const [insegurancaAlimentar, setInsegurancaAlimentar] = useState<boolean | null>(null)
  const [familiarPreso, setFamiliarPreso] = useState<boolean | null>(null)
  const [familiarPresoParentesco, setFamiliarPresoParentesco] = useState("")
  const [preocupacaoComportamento, setPreocupacaoComportamento] = useState<boolean | null>(null)
  const [disciplina, setDisciplina] = useState<string[]>([])
  const [disciplinaOutros, setDisciplinaOutros] = useState("")
  
  // Condições Socioeconômicas (primeira consulta + 3-9 anos)
  const [rendaFamiliar, setRendaFamiliar] = useState("")
  const [rendaNaoSabe, setRendaNaoSabe] = useState(false)
  const [tipoCasa, setTipoCasa] = useState("")
  const [numeroComodos, setNumeroComodos] = useState("")
  const [temBanheiro, setTemBanheiro] = useState<boolean | null>(null)
  const [quartoCrianca, setQuartoCrianca] = useState("")
  const [presencaAnimais, setPresencaAnimais] = useState<boolean | null>(null)
  const [saneamentoPresenteItems, setSaneamentoPresenteItems] = useState<string[]>(["agua", "energia", "esgoto", "lixo"])
  const [areaViolencia, setAreaViolencia] = useState<boolean | null>(null)
  
  // Hipóteses e Condutas
  const [hipotesesDiagnosticas, setHipotesesDiagnosticas] = useState("")
  const [condutas, setCondutas] = useState("")
  
  // Exame físico state
  const [exameFisico, setExameFisico] = useState<Record<string, { status: SistemaStatus | null; descricao: string; fontanelas?: string; reflexos?: string }>>({})
  const [sistemasSelecionados, setSistemasSelecionados] = useState<Set<string>>(new Set())
  
  // Active section state (lateral navigation)
  const [activeSection, setActiveSection] = useState<SecaoId>("anthropometric")
  const [visitedSections, setVisitedSections] = useState<Set<SecaoId>>(new Set(["anthropometric"]))
  
  // Diagnóstico state
  const [cidPrincipal, setCidPrincipal] = useState("")
  const [cidsSecundarios, setCidsSecundarios] = useState<Array<{ codigo: string; descricao: string }>>([])
  const [sid, setSid] = useState("")
  
  // Procedimentos state
  const [procedimentosAtivos, setProcedimentosAtivos] = useState(false)
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([])
  
  // Encaminhamentos state
  const [encaminhamentos, setEncaminhamentos] = useState<Encaminhamento[]>([])
  const [showEncaminhamentoDoc, setShowEncaminhamentoDoc] = useState<Encaminhamento | null>(null)
  const [copiedEncaminhamento, setCopiedEncaminhamento] = useState(false)
  
  // Dados externos state
  const [dataConsultaExterna, setDataConsultaExterna] = useState("")
  const [servicoOrigem, setServicoOrigem] = useState("")
  const [pesoExterno, setPesoExterno] = useState("")
  const [alturaExterna, setAlturaExterna] = useState("")
  const [observacoesExternas, setObservacoesExternas] = useState("")
  const [origemDados, setOrigemDados] = useState("")
  const [consultasExternas, setConsultasExternas] = useState<ConsultaExterna[]>([])
  
  // Milestones state - FIXED: composite key ${milestone.id}-${age}
  const [milestoneStatus, setMilestoneStatus] = useState<Record<string, "confirmed" | "not-achieved" | null>>({})
  
  // M-CHAT state
  const [mchatAnswers, setMchatAnswers] = useState<Record<number, "yes" | "no" | null>>({})
  
  // Dialog state
  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false)
  const [showAGHUDialog, setShowAGHUDialog] = useState(false)
  const [copiedAGHU, setCopiedAGHU] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
const [consultationSeconds, setConsultationSeconds] = useState(0)
  
  // Unified timer for consultation duration
  useEffect(() => {
    const interval = setInterval(() => {
      setConsultationSeconds((s) => s + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  
  // Use active patient from context or fallback to default
  const currentPatient = activePatient || defaultPatient
  
  // Derived variables for conditional rendering
  const isFirstVisit = currentPatient.visitType === "Primeira Vez" || entryType === "Primeira Vez"
  const is0to2 = currentPatient.ageInMonths <= 24
  const is3to9 = currentPatient.ageInMonths > 24 && currentPatient.ageInMonths <= 108

  // Check if M-CHAT should be shown (patient between 16-30 months)
  const showMchat = currentPatient.ageInMonths >= 16 && currentPatient.ageInMonths <= 30

  // Get active milestone group based on patient age
  const activeGroup = getActiveGroup(currentPatient.ageInMonths)
  const activeMilestones = activeGroup.milestones
  const ageColumns = activeGroup.ageColumns

  // Build sections array dynamically
  const secoes = useMemo(() => {
    const base: Array<{ id: SecaoId; label: string; group: "formulario" | "registro" }> = [
      { id: "anthropometric", label: "Antropometria", group: "formulario" },
      { id: "anamnesis", label: "Anamnese", group: "formulario" },
      { id: "imunizacoes", label: "Imunizações", group: "formulario" },
    ]
    
    // Escolaridade (3-9 anos)
    if (is3to9) {
      base.push({ id: "escolaridade", label: "Escolaridade", group: "formulario" })
    }
    
    // Triagem Neonatal (0-2 anos)
    if (is0to2) {
      base.push({ id: "triagemNeonatal", label: "Triagem Neonatal", group: "formulario" })
    }
    
    base.push({ id: "clinical", label: "Exame Físico", group: "formulario" })
    base.push({ id: "milestones", label: "Marcos do Desenvolvimento", group: "formulario" })
    
    if (showMchat) {
      base.push({ id: "mchat", label: "M-CHAT-R", group: "formulario" })
    }
    
    // História Familiar (3-9 anos)
    if (is3to9) {
      base.push({ id: "historiaFamiliar", label: "História Familiar", group: "formulario" })
    }
    
    // Dinâmica Familiar (3-9 anos)
    if (is3to9) {
      base.push({ id: "dinamicaFamiliar", label: "Dinâmica Familiar", group: "formulario" })
    }
    
    // Condições Socioeconômicas (primeira consulta + 3-9 anos)
    if (isFirstVisit && is3to9) {
      base.push({ id: "socioeconomico", label: "Condições Socioeconômicas", group: "formulario" })
    }
    
    base.push(
      { id: "referral", label: "Encaminhamentos", group: "formulario" },
      { id: "diagnostico", label: "Diagnóstico", group: "registro" },
      { id: "condutasHipoteses", label: "Hipóteses e Condutas", group: "registro" },
      { id: "procedimentos", label: "Procedimentos", group: "registro" },
      { id: "externo", label: "Dados Externos", group: "registro" },
    )
    
    return base
  }, [showMchat, is0to2, is3to9, isFirstVisit])

  // Navigation helpers
  const currentIndex = secoes.findIndex((s) => s.id === activeSection)
  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < secoes.length - 1
  const goNext = () => {
    if (canGoNext) {
      const nextSection = secoes[currentIndex + 1].id
      setActiveSection(nextSection)
      setVisitedSections(prev => new Set([...prev, nextSection]))
    }
  }
  const goPrev = () => {
    if (canGoPrev) {
      setActiveSection(secoes[currentIndex - 1].id)
    }
  }

  // Handle section change
  const handleSectionChange = (sectionId: SecaoId) => {
    setActiveSection(sectionId)
    setVisitedSections(prev => new Set([...prev, sectionId]))
  }

  // Timer tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setConsultationSeconds((s) => s + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  
  // Pre-fill fields when reopening a consultation
  useEffect(() => {
    if (isReopening && reopenDate) {
      const consultation = consultationHistory.find(c => c.date === reopenDate)
      if (consultation) {
        if (consultation.weight) setWeight(String(consultation.weight))
        if (consultation.cid) setCidPrincipal(consultation.cid)
        if (consultation.referral) {
          // Add as first encaminhamento entry
          setEncaminhamentos(prev => {
            const exists = prev.some(e => e.especialidade === consultation.referral)
            if (!exists) {
              return [{
                id: `reopen-enc-${Date.now()}`,
                especialidade: consultation.referral!,
                procedimento: "",
                justificativa: "Encaminhamento reaberto da consulta original",
                prioridade: "Eletivo" as const,
                dataCriacao: new Date().toISOString(),
                retornoConfirmado: false,
                dataRetorno: null,
              }, ...prev]
            }
            return prev
          })
        }
      }
    }
}, [isReopening, reopenDate])

  const calculateBmi = () => {
    const w = parseFloat(weight)
    const h = parseFloat(height) / 100 // convert cm to m
    if (w > 0 && h > 0) {
      return (w / (h * h)).toFixed(1)
    }
    return "—"
  }

  const getPercentileEstimate = (value: string, type: "weight" | "height") => {
    const v = parseFloat(value)
    if (!v) return null
    if (type === "weight") {
      if (v < 10) return "P5"
      if (v < 11) return "P10"
      if (v < 12) return "P25"
      if (v < 13) return "P50"
      return "P75"
    } else {
      if (v < 80) return "P10"
      if (v < 85) return "P25"
      if (v < 88) return "P50"
      return "P75"
    }
  }

  // Interrogatório sintomatológico helpers
  const getInterrogValue = (id: string): string => {
    const map: Record<string, string> = {
      geral: interrogGeral, peleMucosas: interrogPeleMucosas, olhos: interrogOlhos,
      ouvidos: interrogOuvidos, boca: interrogBoca, respiratorio: interrogRespiratorio,
      cardiovascular: interrogCardiovascular, gastrointestinal: interrogGastrointestinal,
      geniturinario: interrogGeniturinario, musculoEsqueletico: interrogMusculoEsqueletico,
      nervoso: interrogNervoso,
    }
    return map[id] ?? ""
  }

  const setInterrogValue = (id: string, value: string) => {
    const setters: Record<string, (v: string) => void> = {
      geral: setInterrogGeral, peleMucosas: setInterrogPeleMucosas, olhos: setInterrogOlhos,
      ouvidos: setInterrogOuvidos, boca: setInterrogBoca, respiratorio: setInterrogRespiratorio,
      cardiovascular: setInterrogCardiovascular, gastrointestinal: setInterrogGastrointestinal,
      geniturinario: setInterrogGeniturinario, musculoEsqueletico: setInterrogMusculoEsqueletico,
      nervoso: setInterrogNervoso,
    }
    setters[id]?.(value)
  }

  const toggleInterrogSistema = (id: string) => {
    setInterrogSistemasSelecionados(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // M-CHAT-R scoring
  const calculateMchatScore = () => {
    let score = 0
    Object.entries(mchatAnswers).forEach(([id, answer]) => {
      if (answer === null) return
      const question = mchatQuestions.find((q) => q.id === parseInt(id))
      if (!question) return
      
      if (question.inverted) {
        if (answer === "yes") score++
      } else {
        if (answer === "no") score++
      }
    })
    return score
  }

  const answeredCount = Object.values(mchatAnswers).filter((a) => a !== null).length
  const mchatScore = calculateMchatScore()
  const allAnswered = answeredCount === 20

  const getMchatRiskLevel = () => {
    if (mchatScore <= 2) return "low"
    if (mchatScore <= 7) return "medium"
    return "high"
  }

  // Section completion status
  const isSectionComplete = (id: SecaoId): boolean => {
    switch (id) {
      case "anthropometric": return !!weight && !!height
      case "anamnesis": return !!queixaPrincipal && !!alimentacao
      case "imunizacoes": return !!statusVacinal
      case "escolaridade": return frequentaEscola !== null
      case "triagemNeonatal": return !!idadeGestacional || !!pesoNascimento
      case "clinical": return sistemasSelecionados.size > 0
      case "milestones": return Object.keys(milestoneStatus).length > 0 && classificacaoDesenvolvimento !== null
      case "mchat": return Object.keys(mchatAnswers).filter(k => mchatAnswers[Number(k)] !== null).length === 20
      case "historiaFamiliar": return isFirstVisit ? !!maternalSaude : historiaFamiliarMudou !== null
      case "dinamicaFamiliar": return isFirstVisit ? true : dinamicaMudou !== null
      case "socioeconomico": return !!tipoCasa
      case "referral": return encaminhamentos.length > 0
      case "diagnostico": return !!cidPrincipal
      case "condutasHipoteses": return !!condutas
      case "procedimentos": return !procedimentosAtivos || procedimentos.length > 0
      case "externo": return true // always optional
      default: return false
    }
  }

  // Get section summary for inline display
  const getSectionSummary = (id: SecaoId): string | null => {
    switch (id) {
      case "anthropometric":
        if (weight) {
          const percentile = getPercentileEstimate(weight, "weight")
          return `${weight} kg${percentile ? ` · ${percentile}` : ""}`
        }
        return null
      case "anamnesis":
        if (alimentacao) {
          return ALIMENTACAO_LABELS[alimentacao]?.substring(0, 20) || alimentacao.substring(0, 20)
        }
        return null
      case "clinical":
        if (sistemasSelecionados.size > 0) {
          return `${sistemasSelecionados.size} sistemas avaliados`
        }
        return null
      case "milestones":
        const totalMilestones = activeMilestones.length
        const registeredCount = Object.keys(milestoneStatus).length
        if (registeredCount > 0) {
          return `${registeredCount}/${totalMilestones} marcos registrados`
        }
        return null
      case "mchat":
        if (allAnswered) {
          const riskText = getMchatRiskLevel() === "low" ? "Baixo" : getMchatRiskLevel() === "medium" ? "Médio" : "Alto"
          return `Pontuação: ${mchatScore}/20 · ${riskText}`
        } else if (answeredCount > 0) {
          return `${answeredCount}/20 respondidas`
        }
        return null
      case "referral":
        if (encaminhamentos.length > 0) {
          return `${encaminhamentos.length} encaminhamento${encaminhamentos.length > 1 ? "s" : ""}`
        }
        return null
      case "diagnostico":
        if (cidPrincipal) {
          return cidPrincipal.substring(0, 20)
        }
        return null
      case "procedimentos":
        if (procedimentos.length > 0) {
          return `${procedimentos.length} procedimento${procedimentos.length > 1 ? "s" : ""}`
        }
        return procedimentosAtivos ? null : "Nenhum"
      case "externo":
        if (consultasExternas.length > 0) {
          return `${consultasExternas.length} registro${consultasExternas.length > 1 ? "s" : ""}`
        }
        return null
      default:
        return null
    }
  }

  // Auto-add M-CHAT encaminhamento
  useEffect(() => {
    if (allAnswered && getMchatRiskLevel() !== "low") {
      const riskLevel = getMchatRiskLevel()
      const existingMchatEnc = encaminhamentos.find(e => e.procedimento.includes("M-CHAT"))
      
      if (!existingMchatEnc) {
        const newEnc: Encaminhamento = {
          id: `mchat-${Date.now()}`,
          especialidade: "Neurologia",
          procedimento: riskLevel === "medium" 
            ? "Entrevista de seguimento M-CHAT-R/F" 
            : "Avaliação diagnóstica para TEA e intervenção precoce",
          justificativa: riskLevel === "medium"
            ? `Triagem M-CHAT-R com pontuação de risco médio (${mchatScore}/20). Indicada entrevista de seguimento.`
            : `Triagem M-CHAT-R com pontuação de risco elevado (${mchatScore}/20). Criança deve ser encaminhada imediatamente para avaliação diagnóstica e intervenção precoce.`,
          prioridade: riskLevel === "medium" ? "Prioritário" : "Urgente",
          dataCriacao: new Date().toISOString(),
          retornoConfirmado: false,
          dataRetorno: null,
        }
        setEncaminhamentos(prev => [...prev, newEnc])
        toast.info("Encaminhamento automático adicionado devido ao resultado do M-CHAT-R.")
      }
    }
  }, [allAnswered, mchatScore])

  const handleFinalize = () => {
    setShowFinalizeDialog(true)
  }

  const confirmFinalize = () => {
    clearActivePatient()
    toast.success("Atendimento finalizado com sucesso.")
    setShowFinalizeDialog(false)
    router.push("/")
  }

  const handleOpenAGHU = () => {
    // Validation: CID principal is always required
    if (!cidPrincipal) {
      toast.error("Preencha o CID-10 principal antes de finalizar.")
      return
    }
    
    // Check if any procedimento is missing CID
    const procSemCid = procedimentos.find(p => !p.cidVinculado)
    if (procSemCid) {
      toast.error("Vincule um CID a todos os procedimentos antes de finalizar.")
      return
    }
    
    setShowAGHUDialog(true)
  }

  const handleCopyAGHU = async () => {
    const texto = generateAGHUText()
    await navigator.clipboard.writeText(texto)
    setCopiedAGHU(true)
    setTimeout(() => setCopiedAGHU(false), 2000)
  }

  const handleCopyEncaminhamento = async (enc: Encaminhamento) => {
    const texto = generateEncaminhamentoText(enc)
    await navigator.clipboard.writeText(texto)
    setCopiedEncaminhamento(true)
    setTimeout(() => setCopiedEncaminhamento(false), 2000)
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    toast.success("Rascunho salvo com sucesso.")
  }

  // Add secondary CID
  const addCidSecundario = () => {
    if (cidsSecundarios.length < 5) {
      setCidsSecundarios([...cidsSecundarios, { codigo: "", descricao: "" }])
    }
  }

  // Remove secondary CID
  const removeCidSecundario = (index: number) => {
    setCidsSecundarios(cidsSecundarios.filter((_, i) => i !== index))
  }

  // Add procedimento
  const addProcedimento = () => {
    setProcedimentos([...procedimentos, {
      id: `proc-${Date.now()}`,
      nome: "",
      quantidade: 1,
      cidVinculado: cidPrincipal,
      observacoes: "",
    }])
  }

  // Remove procedimento
  const removeProcedimento = (id: string) => {
    setProcedimentos(procedimentos.filter(p => p.id !== id))
  }

  // Add encaminhamento
  const addEncaminhamento = () => {
    setEncaminhamentos([...encaminhamentos, {
      id: `enc-${Date.now()}`,
      especialidade: "",
      procedimento: "",
      justificativa: "",
      prioridade: "Eletivo",
      dataCriacao: new Date().toISOString(),
      retornoConfirmado: false,
      dataRetorno: null,
    }])
  }

  // Remove encaminhamento
  const removeEncaminhamento = (id: string) => {
    setEncaminhamentos(encaminhamentos.filter(e => e.id !== id))
  }

  // Register external data
  const handleRegistrarDadosExternos = () => {
    if (!origemDados.trim()) {
      toast.error("Preencha o campo 'Como os dados foram obtidos'.")
      return
    }

    const novaConsulta: ConsultaExterna = {
      id: `ext-${Date.now()}`,
      dataConsulta: dataConsultaExterna,
      servicoOrigem,
      peso: pesoExterno ? parseFloat(pesoExterno) : null,
      altura: alturaExterna ? parseFloat(alturaExterna) : null,
      observacoes: observacoesExternas,
      origemDescricao: origemDados,
    }

    setConsultasExternas([...consultasExternas, novaConsulta])
    
    // Clear form
    setDataConsultaExterna("")
    setServicoOrigem("")
    setPesoExterno("")
    setAlturaExterna("")
    setObservacoesExternas("")
    setOrigemDados("")
    
    toast.success("Dados externos registrados. Aparecerão na linha do tempo com marcação de origem externa.")
  }

  // Remove external consultation
  const removeConsultaExterna = (id: string) => {
    setConsultasExternas(consultasExternas.filter(c => c.id !== id))
  }

  // Toggle sistema selection
  const toggleSistema = (key: string) => {
    setSistemasSelecionados(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  // Select all sistemas
  const selectAllSistemas = () => {
    setSistemasSelecionados(new Set(sistemasExame.map(s => s.id)))
  }

  // Clear all sistemas selection
  const clearSistemasSelection = () => {
    setSistemasSelecionados(new Set())
  }

  // Check if milestone cell is editable
  const isMilestoneEditable = (milestone: typeof activeMilestones[0], age: number) => {
    const [minAge, maxAge] = milestone.ageRangeMonths
    return age >= minAge && age <= maxAge && age <= currentPatient.ageInMonths
  }

  const isMilestoneFuture = (age: number) => {
    return age > currentPatient.ageInMonths
  }

  const isMilestonePast = (milestone: typeof activeMilestones[0], age: number) => {
    const [minAge] = milestone.ageRangeMonths
    return age < minAge
  }

  // Generate AGHU text
  const generateAGHUText = () => {
    const weightPercentile = getPercentileEstimate(weight, "weight") || "—"
    const heightPercentile = getPercentileEstimate(height, "height") || "—"
    const bmi = calculateBmi()
    
// Helper function for alimentacao label
  const getAlimentacaoLabel = (value: string) => ALIMENTACAO_LABELS[value] || value
    
    // Helper for classificacao desenvolvimento
    const getClassificacaoLabel = (value: string | null) => {
      const map: Record<string, string> = {
        "adequado": "Adequado para a idade",
        "alerta": "Alerta para o desenvolvimento",
        "provavel-atraso": "Provavel atraso no desenvolvimento",
      }
      return value ? map[value] || value : "Nao classificado"
    }
    
    // Pad label helper for consistent alignment (14 chars)
    const pad = (label: string) => label.padEnd(14)
    
    let texto = `================================================
   ATENDIMENTO PEDIATRICO - HC/UFPE
================================================

${pad("Paciente")}  : ${currentPatient.name}
${pad("Prontuario")}  : ${currentPatient.record}
${pad("Data Nasc.")}  : ${currentPatient.birthDate}
${pad("Data")}  : ${new Date().toLocaleDateString('pt-BR')}
${pad("Tipo")}  : ${entryType || "Retorno"}
${pad("Duracao")}  : ${formatDuration(consultationSeconds, false)}

--- ANTROPOMETRIA -----------------------------------
${pad("Peso")}  : ${weight || "—"} kg  |  Percentil: ${weightPercentile}  |  Tendencia: ->
${pad("Altura")}  : ${height || "—"} cm  |  Percentil: ${heightPercentile}
${pad("PC")}  : ${headCircumference || "nao aferido"} cm
${pad("PA")}  : ${pressaoArterial || "nao aferida"}
${pad("IMC")}  : ${bmi} kg/m2

--- ANAMNESE ----------------------------------------
Queixa principal e duracao: ${queixaPrincipal || "—"}
${hda ? `\nHDA:\n${hda}\n` : ""}
${medicacoesRotina ? `Medicacoes de rotina: ${medicacoesRotina}` : ""}
${examesComplementares ? `Exames complementares: ${examesComplementares}` : ""}
${isFirstVisit && antecedentesDoencas ? `Antecedentes pessoais: ${antecedentesDoencas}` : ""}

--- INTERROGATORIO SINTOMATOLOGICO ------------------
${interrogSistemasSelecionados.size === 0 
  ? `Sem alteracoes relatadas por sistema.`
  : interrogSistemas
      .filter(s => interrogSistemasSelecionados.has(s.id))
      .map(s => `${s.nome.padEnd(22)}: ${getInterrogValue(s.id) || "—"}`)
      .join('\n')
}

--- ALIMENTACAO -------------------------------------
Tipo: ${getAlimentacaoLabel(alimentacao) || "—"}
${cardapioCafe ? `Cafe da manha: ${cardapioCafe}` : ""}
${cardapioLancheManha ? `Lanche da manha: ${cardapioLancheManha}` : ""}
${cardapioAlmoco ? `Almoco: ${cardapioAlmoco}` : ""}
${cardapioLancheTarde ? `Lanche da tarde: ${cardapioLancheTarde}` : ""}
${cardapioJantar ? `Jantar: ${cardapioJantar}` : ""}
${cardapioCeia ? `Ceia: ${cardapioCeia}` : ""}
Local das refeicoes: ${localRefeicoes || "—"}
Uso de tela durante refeicoes: ${telaRefeicoes ? "Sim" : "Nao"}

--- HABITOS -----------------------------------------
Sono:
  Horario: ${sonoHorario || "—"}
  Local: ${sonoLocal || "—"}
  Higiene do sono: ${sonoHigiene || "—"}
  Alteracoes: ${sonoAlteracoes || "Nenhuma relatada"}

Exposicao a telas:
  Dispositivos: ${telasDispositivos.length > 0 ? telasDispositivos.join(", ") : "—"}
  Tempo diario: ${telasTempoDiario || "—"}
  Frequencia: ${telasFrequencia || "—"}

Outros:
  Chupeta/chupa-dedo: ${chupetaChupaDedo === null ? "—" : chupetaChupaDedo ? "Sim" : "Nao"}
  Higiene dentaria: ${higieneDentaria || "—"}
  Atividades recreativas: ${atividadesRecreativas || "—"}

--- IMUNIZACOES -------------------------------------
${statusVacinal || "Nao informado"}
`
    
    // Triagem Neonatal (0-2 anos)
    if (is0to2) {
      texto += `
--- TRIAGEM NEONATAL --------------------------------
${pad("IG ao nascer")}  : ${idadeGestacional ? `${idadeGestacional} semanas` : "—"}
${pad("Peso nasc.")}  : ${pesoNascimento ? `${pesoNascimento}g` : "—"}
${hipDiagAnterior ? `Hipoteses diagnosticas anteriores: ${hipDiagAnterior}\n` : ""}
Teste do Pezinho: ${testePezinho.resultado || "—"} ${testePezinho.data ? `(${testePezinho.data})` : ""} ${testePezinho.descricao || ""}
Teste da Orelhinha: ${testeOrelhinha.resultado || "—"} ${testeOrelhinha.data ? `(${testeOrelhinha.data})` : ""} ${testeOrelhinha.descricao || ""}
Teste do Olhinho: ${testeOlhinho.resultado || "—"} ${testeOlhinho.data ? `(${testeOlhinho.data})` : ""} ${testeOlhinho.descricao || ""}
Teste do Coracaozinho: ${testeCoracaozinho.resultado || "—"} ${testeCoracaozinho.data ? `(${testeCoracaozinho.data})` : ""} ${testeCoracaozinho.descricao || ""}
`
    }
    
    // Escolaridade (3-9 anos)
    if (is3to9 && frequentaEscola !== null) {
      texto += `
--- ESCOLARIDADE ------------------------------------
Frequenta escola: ${frequentaEscola ? "Sim" : "Nao"}
${frequentaEscola ? `Ano/serie: ${anoEscolar || "—"}` : ""}
Reprovacao: ${reprovacaoEscolar === null ? "—" : reprovacaoEscolar ? "Sim" : "Nao"}
Rendimento escolar: ${rendimentoEscolar || "—"}
`
    }

    texto += `
--- EXAME FISICO ------------------------------------
`
    
    sistemasExame.forEach(sistema => {
      const estado = exameFisico[sistema.id]
      const selecionado = sistemasSelecionados.has(sistema.id)
      
      if (!selecionado) {
        texto += `${sistema.nome.padEnd(22)}: Nao avaliado\n`
      } else if (estado?.status === "normal") {
        let extra = ""
        if (sistema.showFontanelas && currentPatient.ageInMonths <= 18 && estado.fontanelas) {
          extra = ` (Fontanelas: ${estado.fontanelas})`
        }
        texto += `${sistema.nome.padEnd(22)}: Normal${extra}\n`
      } else if (estado?.status === "alterado") {
        let extra = ""
        if (sistema.showFontanelas && currentPatient.ageInMonths <= 18 && estado.fontanelas) {
          extra = ` | Fontanelas: ${estado.fontanelas}`
        }
        if (sistema.showReflexosPrimitivos && currentPatient.ageInMonths <= 12 && estado.reflexos) {
          extra = ` | Reflexos: ${estado.reflexos}`
        }
        texto += `${sistema.nome.padEnd(22)}: Alterado - ${estado.descricao}${extra}\n`
      } else {
        texto += `${sistema.nome.padEnd(22)}: Selecionado mas nao preenchido\n`
      }
    })

    texto += `
--- MARCOS DO DESENVOLVIMENTO -----------------------
Faixa etaria: ${currentPatient.ageInMonths} meses
Avaliados nesta consulta:
`
    
    // FIXED: Use composite key for milestone status
    activeMilestones.forEach((milestone) => {
      const colAtual = [...activeGroup.ageColumns]
        .reverse()
        .find((col) => col <= currentPatient.ageInMonths) ?? activeGroup.ageColumns[0]
      const cellKey = `${milestone.id}-${colAtual}`
      const status = milestoneStatus[cellKey]
      if (status === "confirmed") texto += `  [OK] ${milestone.name}\n`
      else if (status === "not-achieved") texto += `  [X] ${milestone.name}\n`
      else texto += `  [-] ${milestone.name} (nao avaliado)\n`
    })
    
    texto += `\nClassificacao do desenvolvimento: ${getClassificacaoLabel(classificacaoDesenvolvimento)}\n`

    // M-CHAT if applicable
    if (showMchat && allAnswered) {
      const riskLevel = getMchatRiskLevel()
      const riskText = riskLevel === "low" ? "Baixo" : riskLevel === "medium" ? "Medio" : "Alto"
      texto += `
--- TRIAGEM M-CHAT-R --------------------------------
Pontuacao: ${mchatScore}/20  |  Risco: ${riskText}
Conduta  : ${riskLevel === "low" ? "Acompanhamento de rotina" : riskLevel === "medium" ? "Aplicar entrevista de seguimento" : "Encaminhar para avaliacao diagnostica imediata"}
`
    }

    // História Familiar (3-9 anos)
    if (is3to9 && (isFirstVisit || historiaFamiliarMudou)) {
      texto += `
--- HISTORIA FAMILIAR -------------------------------
Mae: ${maternalIdade || "—"} anos | ${maternalSaude || "—"} | ${maternalOcupacao || "—"}
Pai: ${paternalIdade || "—"} anos | ${paternalSaude || "—"} | ${paternalOcupacao || "—"}
Coabitacao dos pais: ${coabitacaoPais || "—"}
Irmaos: ${irmaosSaude || "—"}
`
    }
    
    // Dinâmica Familiar (3-9 anos)
    if (is3to9 && (isFirstVisit || dinamicaMudou)) {
      texto += `
--- DINAMICA FAMILIAR -------------------------------
Relacionamento conjugal: ${relacionamentoConjugal || "—"}
Resolucao de desentendimentos: ${resolucaoDesentendimentos || "—"}
Fumante no domicilio: ${fumanteCasa === null ? "—" : fumanteCasa ? `Sim (${fumanteCasaParentesco || "—"})` : "Nao"}
Uso de alcool/drogas: ${alcoolDrogasCasa === null ? "—" : alcoolDrogasCasa ? `Sim (${alcoolDrogasTipo || "—"})` : "Nao"}
${alcoolDrogasCasa ? `  Vontade de diminuir: ${alcoolDrogasVontadeDiminuir === null ? "—" : alcoolDrogasVontadeDiminuir ? "Sim" : "Nao"}` : ""}
${alcoolDrogasCasa && alcoolDrogasConsequencias ? `  Consequencias: ${alcoolDrogasConsequenciasDesc || "Sim"}` : ""}
Inseguranca alimentar: ${insegurancaAlimentar === null ? "—" : insegurancaAlimentar ? "Sim" : "Nao"}
Familiar preso: ${familiarPreso === null ? "—" : familiarPreso ? `Sim (${familiarPresoParentesco || "—"})` : "Nao"}
Preocupacao com comportamento: ${preocupacaoComportamento === null ? "—" : preocupacaoComportamento ? "Sim" : "Nao"}
Disciplina: ${disciplina.length > 0 ? disciplina.join(", ") : "—"} ${disciplina.includes("outros") ? `(${disciplinaOutros})` : ""}
`
    }
    
    // Condições Socioeconômicas (primeira consulta + 3-9 anos)
    if (isFirstVisit && is3to9) {
      texto += `
--- CONDICOES SOCIOECONOMICAS -----------------------
Renda familiar: ${rendaNaoSabe ? "Nao informado" : rendaFamiliar ? `R$ ${rendaFamiliar}` : "—"}
Tipo de casa: ${tipoCasa || "—"}
Comodos: ${numeroComodos || "—"}
Banheiro: ${temBanheiro === null ? "—" : temBanheiro ? "Sim" : "Nao"}
Quarto da crianca: ${quartoCrianca || "—"}
Animais domesticos: ${presencaAnimais === null ? "—" : presencaAnimais ? "Sim" : "Nao"}
Agua encanada: ${saneamentoPresenteItems.includes("agua") ? "Sim" : "Nao"}
Energia eletrica: ${saneamentoPresenteItems.includes("energia") ? "Sim" : "Nao"}
Esgoto: ${saneamentoPresenteItems.includes("esgoto") ? "Sim" : "Nao"}
Coleta de lixo: ${saneamentoPresenteItems.includes("lixo") ? "Sim" : "Nao"}
Area de violencia: ${areaViolencia === null ? "—" : areaViolencia ? "Sim" : "Nao"}
`
    }

    // Encaminhamentos
    if (encaminhamentos.length > 0) {
      texto += `
--- ENCAMINHAMENTOS ---------------------------------
`
      encaminhamentos.forEach((enc, i) => {
        texto += `${i + 1}. ${enc.especialidade} - ${enc.procedimento}
     Prioridade: ${enc.prioridade}
     Justificativa: ${enc.justificativa}
`
      })
    }

    texto += `
--- DIAGNOSTICO -------------------------------------
${pad("CID-10 princ.")}  : ${cidPrincipal || "—"}
`
    
    if (cidsSecundarios.length > 0) {
      cidsSecundarios.forEach(cid => {
        if (cid.codigo) {
          texto += `CID-10 secund. : ${cid.codigo} - ${cid.descricao}\n`
        }
      })
    }
    
    texto += `${pad("SID")}  : ${sid || "nao aplicavel"}

--- HIPOTESES E CONDUTAS ----------------------------
${hipotesesDiagnosticas ? `Hipoteses diagnosticas:\n${hipotesesDiagnosticas}\n` : ""}
${condutas ? `Condutas:\n${condutas}` : "Nenhuma conduta registrada."}
`

    // Procedimentos
    if (procedimentos.length > 0) {
      texto += `
--- PROCEDIMENTOS REALIZADOS ------------------------
`
      procedimentos.forEach((proc, i) => {
        texto += `${i + 1}. ${proc.nome}  Qtd: ${proc.quantidade}  CID: ${proc.cidVinculado}
`
        if (proc.observacoes) {
          texto += `     ${proc.observacoes}\n`
        }
      })
    }

    // Alertas
    texto += `
--- ALERTAS ATIVOS ----------------------------------
`
    if (alertasExpandidos.length > 0) {
      alertasExpandidos.forEach(alerta => {
        const prefix = alerta.tipo === "critico" ? "[CRITICO]" : "[ATENCAO]"
        texto += `${prefix} ${alerta.mensagem}\n`
      })
    } else {
      texto += `Nenhum alerta ativo.\n`
    }

    // Dados externos
    if (consultasExternas.length > 0) {
      texto += `
--- DADOS DE ATENDIMENTO EXTERNO --------------------
`
      consultasExternas.forEach(ext => {
        texto += `Data: ${ext.dataConsulta}  |  Servico: ${ext.servicoOrigem}
Peso: ${ext.peso ? `${ext.peso} kg` : "—"}  |  Altura: ${ext.altura ? `${ext.altura} cm` : "—"}
Observacoes: ${ext.observacoes || "—"}
Origem: ${ext.origemDescricao}

`
      })
    }

    // Audit note for reopened consultations
    if (isReopening) {
      texto += `
--- NOTA DE AUDITORIA -------------------------------
ATENCAO: Este registro foi REABERTO e editado apos finalizacao original.
Data da edicao : ${new Date().toLocaleDateString('pt-BR')}
Hora           : ${new Date().toLocaleTimeString('pt-BR')}
Registro origin: ${reopenDate}
Este texto substitui o registro anterior na integra.
`
    }

    return texto
  }

  // Generate encaminhamento text
  const generateEncaminhamentoText = (enc: Encaminhamento) => {
    const weightPercentile = getPercentileEstimate(weight, "weight") || "—"
    const heightPercentile = getPercentileEstimate(height, "height") || "—"
    const bmi = calculateBmi()
    
    return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOSPITAL DAS CLÍNICAS — UFPE
AMBULATÓRIO DE PEDIATRIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ENCAMINHAMENTO

Paciente : ${currentPatient.name}
Prontuário: ${currentPatient.record}
Data Nasc.: ${currentPatient.birthDate}   Idade: ${currentPatient.age}
Data      : ${new Date().toLocaleDateString('pt-BR')}

Encaminho para: ${enc.especialidade.toUpperCase()}
Procedimento  : ${enc.procedimento}
Prioridade    : ${enc.prioridade}

Justificativa clínica:
${enc.justificativa}

Dados clínicos relevantes:
  Peso  : ${weight || "—"} kg  (${weightPercentile})
  Altura: ${height || "—"} cm  (${heightPercentile})
  IMC   : ${bmi} kg/m²
  CID-10: ${cidPrincipal || "—"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Médico / Enfermeiro responsável:

_____________________________________________
Nome: ______________________   CRM/COREN: ___
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
  }

  // Render section content
  const renderSectionContent = () => {
    const IconComponent = sectionIcons[activeSection]
    const description = sectionDescriptions[activeSection]
    const currentSectionLabel = secoes.find(s => s.id === activeSection)?.label || ""

    return (
      <div className="space-y-6">
        {/* Section Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <IconComponent className="h-6 w-6 text-teal-700" />
            <h2 className="text-xl font-semibold">{currentSectionLabel}</h2>
          </div>
          <p className="text-sm text-slate-500">{description}</p>
          <Separator />
        </div>

        {/* Section Content */}
        {activeSection === "anthropometric" && (
          <div className="space-y-6">
            <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 11.2"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
                {weight && (
                  <p className="text-xs text-muted-foreground">
                    Percentil estimado: {getPercentileEstimate(weight, "weight")}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Altura (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 82"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
                {height && (
                  <p className="text-xs text-muted-foreground">
                    Percentil estimado: {getPercentileEstimate(height, "height")}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="head">Perímetro Cefálico (cm)</Label>
                <Input
                  id="head"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 48.5"
                  value={headCircumference}
                  onChange={(e) => setHeadCircumference(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pa">Pressão Arterial (mmHg)</Label>
                <Input
                  id="pa"
                  type="text"
                  placeholder="Ex: 100/65"
                  value={pressaoArterial}
                  onChange={(e) => setPressaoArterial(e.target.value)}
                />
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-teal-50 to-slate-50 rounded-lg border border-teal-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                  <Scale className="h-5 w-5 text-teal-700" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">IMC Calculado</p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-bold text-2xl text-teal-700">{calculateBmi()}</span>
                    {calculateBmi() !== "—" && (
                      <span className="text-sm text-slate-500">kg/m²</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === "anamnesis" && (
          <Tabs defaultValue="clinico" className="w-full">
            <TabsList className="w-full flex overflow-x-auto">
              <TabsTrigger value="clinico" className="flex-1 min-w-fit">Clínico</TabsTrigger>
              <TabsTrigger value="alimentacao" className="flex-1 min-w-fit">Alimentação</TabsTrigger>
              <TabsTrigger value="habitos" className="flex-1 min-w-fit">Hábitos</TabsTrigger>
            </TabsList>
            
            {/* Aba Clínico */}
            <TabsContent value="clinico" className="space-y-6 pt-4">
              {/* Bloco 1 — Queixa e Doença Atual */}
              <div className="rounded-lg border border-slate-200 p-4 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Queixa e Doença Atual</p>
                <div className="space-y-2">
                  <Label htmlFor="complaint">Queixa Principal e Duração (QPD)</Label>
                  <Textarea
                    id="complaint"
                    placeholder="Ex: Tosse há 7 dias, febre nos últimos 2 dias"
                    rows={3}
                    value={queixaPrincipal}
                    onChange={(e) => setQueixaPrincipal(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hda">História da Doença Atual (HDA)</Label>
                  <Textarea
                    id="hda"
                    placeholder="Ex: Criança com 4 anos apresentou tosse produtiva há 7 dias, associada a febre vespertina (38,5°C)..."
                    rows={5}
                    value={hda}
                    onChange={(e) => setHda(e.target.value)}
                  />
                  {is0to2 && !isFirstVisit && (
                    <p className="text-xs text-slate-500">No segundo parágrafo, incluir resumo do período neonatal e especialidades em acompanhamento.</p>
                  )}
                </div>
              </div>
              
              <div className="my-4" />
              
              {/* Bloco 2 — Interrogatório Sintomatológico (chips) */}
              <div className="rounded-lg border border-slate-200 p-4 space-y-4 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Interrogatório Sintomatológico</p>
                  {interrogSistemasSelecionados.size > 0 && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      {interrogSistemasSelecionados.size} sistema{interrogSistemasSelecionados.size > 1 ? 's' : ''} com alteração
                    </Badge>
                  )}
                </div>
                
                {/* Zona 1 — Chips de sistema */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-slate-600">Clique nos sistemas com alterações encontradas:</p>
                    {interrogSistemasSelecionados.size > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => setInterrogSistemasSelecionados(new Set())} className="text-slate-500 hover:text-slate-700">
                        Limpar
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {interrogSistemas.map((s) => {
                      const selecionado = interrogSistemasSelecionados.has(s.id)
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleInterrogSistema(s.id)}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm border-2 transition-all font-medium",
                            selecionado
                              ? "border-amber-500 bg-amber-100 text-amber-800 shadow-sm"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                          )}
                        >
                          {selecionado && <Check className="h-3.5 w-3.5" />}
                          {s.nome}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Zona 2 — Textareas apenas para sistemas selecionados */}
                {interrogSistemasSelecionados.size > 0 && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {interrogSistemas
                      .filter(s => interrogSistemasSelecionados.has(s.id))
                      .map(s => (
                        <div key={s.id} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">{s.nome}</Label>
                            <button onClick={() => toggleInterrogSistema(s.id)} className="text-slate-400 hover:text-slate-600" aria-label={`Remover ${s.nome}`}>
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <Textarea
                            rows={2}
                            placeholder={s.placeholder}
                            value={getInterrogValue(s.id)}
                            onChange={(e) => setInterrogValue(s.id, e.target.value)}
                          />
                        </div>
                      ))}
                  </div>
                )}
              </div>
              
              <div className="my-4" />
              
              {/* Bloco 3 — Medicações e Exames */}
              <div className="rounded-lg border border-slate-200 p-4 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Medicações e Exames</p>
                <div className="space-y-2">
                  <Label htmlFor="medicacoes">Medicações de rotina</Label>
                  <Textarea
                    id="medicacoes"
                    placeholder="Ex: Vitamina D 400UI/dia, Sulfato ferroso 25mg/dia, Fluconazol se necessário"
                    rows={3}
                    value={medicacoesRotina}
                    onChange={(e) => setMedicacoesRotina(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exames">Exames complementares atuais</Label>
                  <Textarea
                    id="exames"
                    placeholder="Ex: Hemograma (12/04) — Hb 11,2, leucócitos 8.900. Rx tórax normal."
                    rows={3}
                    value={examesComplementares}
                    onChange={(e) => setExamesComplementares(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Bloco 4 — Antecedentes Pessoais (apenas primeira consulta) */}
              {isFirstVisit && (
                <>
                  <div className="my-4" />
                  <div className="rounded-lg border border-slate-200 p-4 space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Antecedentes Pessoais</p>
                    <div className="space-y-2">
                      <Label htmlFor="antecedentes">Doenças anteriores e internamentos</Label>
                      <Textarea
                        id="antecedentes"
                        placeholder="Ex: Internação em 2023 por bronquiolite. Fratura de antebraço em 2024. Cirurgia de hérnia inguinal."
                        rows={4}
                        value={antecedentesDoencas}
                        onChange={(e) => setAntecedentesDoencas(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
            
            {/* Aba Alimentação */}
            <TabsContent value="alimentacao" className="space-y-6 pt-4">
              <div className="rounded-lg border border-slate-200 p-4 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tipo de Aleitamento</p>
                <Select value={alimentacao} onValueChange={setAlimentacao}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de alimentação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aleitamento-exclusivo">Aleitamento materno exclusivo</SelectItem>
                    <SelectItem value="aleitamento-misto">Aleitamento materno misto (mama + complemento)</SelectItem>
                    <SelectItem value="formula-exclusiva">Fórmula exclusiva</SelectItem>
                    <SelectItem value="introducao-alimentar">Introdução alimentar em andamento</SelectItem>
                    <SelectItem value="dieta-familia">Dieta da família</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="rounded-lg border border-slate-200 p-4 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cardápio Diário</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Café da manhã</Label>
                    <Input placeholder="Ex: Leite com achocolatado, pão com manteiga" value={cardapioCafe} onChange={(e) => setCardapioCafe(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Lanche da manhã</Label>
                    <Input placeholder="Ex: Fruta (banana), biscoito integral" value={cardapioLancheManha} onChange={(e) => setCardapioLancheManha(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Almoço</Label>
                    <Input placeholder="Ex: Arroz, feijão, carne moída, legumes" value={cardapioAlmoco} onChange={(e) => setCardapioAlmoco(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Lanche da tarde</Label>
                    <Input placeholder="Ex: Iogurte, fruta picada" value={cardapioLancheTarde} onChange={(e) => setCardapioLancheTarde(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Jantar</Label>
                    <Input placeholder="Ex: Sopa de legumes com frango desfiado" value={cardapioJantar} onChange={(e) => setCardapioJantar(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Ceia</Label>
                    <Input placeholder="Ex: Leite morno, mingau" value={cardapioCeia} onChange={(e) => setCardapioCeia(e.target.value)} />
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border border-slate-200 p-4 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ambiente das Refeições</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Local das refeições</Label>
                    <Input placeholder="Ex: Mesa da cozinha, sala com TV" value={localRefeicoes} onChange={(e) => setLocalRefeicoes(e.target.value)} />
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <Switch id="tela-refeicoes" checked={telaRefeicoes} onCheckedChange={setTelaRefeicoes} />
                    <Label htmlFor="tela-refeicoes">Uso de tela durante as refeições</Label>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Aba Hábitos */}
            <TabsContent value="habitos" className="space-y-6 pt-4">
              {/* Rotina do Sono */}
              <div className="rounded-lg border border-slate-200 p-4 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rotina do Sono</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Hora que dorme e acorda</Label>
                    <Input placeholder="Ex: Dorme 21h, acorda 7h" value={sonoHorario} onChange={(e) => setSonoHorario(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Local onde dorme</Label>
                    <Select value={sonoLocal} onValueChange={setSonoLocal}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o local" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cama-propria">Cama própria</SelectItem>
                        <SelectItem value="cama-pais">Cama dos pais</SelectItem>
                        <SelectItem value="berco-quarto-pais">Berço no quarto dos pais</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Higiene do sono</Label>
                  <Textarea rows={2} placeholder="Ex: Banho às 20h, história antes de dormir, sem tela 1h antes" value={sonoHigiene} onChange={(e) => setSonoHigiene(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Alterações do sono</Label>
                  <Textarea rows={2} placeholder="Ex: Acorda 2x/noite, pesadelos frequentes, ronco" value={sonoAlteracoes} onChange={(e) => setSonoAlteracoes(e.target.value)} />
                </div>
                {(sonoAlteracoes.toLowerCase().includes("ronco") || sonoAlteracoes.toLowerCase().includes("apneia")) && (
                  <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>Considere investigação adicional ou encaminhamento especializado.</span>
                  </div>
                )}
              </div>
              
              {/* Exposição a telas */}
              <div className="rounded-lg border border-slate-200 p-4 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Exposição a Telas</p>
                <div className="space-y-3">
                  <Label>Dispositivos utilizados</Label>
                  <div className="flex flex-wrap gap-4">
                    {["TV", "Celular", "Tablet", "Computador"].map((dispositivo) => (
                      <div key={dispositivo} className="flex items-center gap-2">
                        <Checkbox
                          id={`tela-${dispositivo}`}
                          checked={telasDispositivos.includes(dispositivo)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setTelasDispositivos([...telasDispositivos, dispositivo])
                            } else {
                              setTelasDispositivos(telasDispositivos.filter(d => d !== dispositivo))
                            }
                          }}
                        />
                        <Label htmlFor={`tela-${dispositivo}`} className="font-normal">{dispositivo}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Tempo total diário de tela</Label>
                    <Input placeholder="Ex: 2 horas" value={telasTempoDiario} onChange={(e) => setTelasTempoDiario(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Frequência semanal</Label>
                    <Select value={telasFrequencia} onValueChange={setTelasFrequencia}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a frequência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos-dias">Todos os dias</SelectItem>
                        <SelectItem value="5-6-dias">5-6 dias</SelectItem>
                        <SelectItem value="3-4-dias">3-4 dias</SelectItem>
                        <SelectItem value="1-2-dias">1-2 dias</SelectItem>
                        <SelectItem value="raramente">Raramente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Outros hábitos */}
              <div className="rounded-lg border border-slate-200 p-4 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Outros Hábitos</p>
                <div className="space-y-2">
                  <Label>Uso de chupeta ou chupa-dedo</Label>
                  <RadioGroup
                    value={chupetaChupaDedo === null ? "" : chupetaChupaDedo ? "sim" : "nao"}
                    onValueChange={(v) => setChupetaChupaDedo(v === "sim")}
                    className="flex gap-4"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="sim" id="chupeta-sim" />
                      <Label htmlFor="chupeta-sim" className="font-normal">Sim</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="nao" id="chupeta-nao" />
                      <Label htmlFor="chupeta-nao" className="font-normal">Não</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label>Higiene dentária</Label>
                  <Textarea rows={2} placeholder="Ex: Escova 2x ao dia com pasta fluoretada, sem uso de fio dental" value={higieneDentaria} onChange={(e) => setHigieneDentaria(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Atividades recreativas</Label>
                  <Textarea rows={2} placeholder="Ex: Futebol 3x/semana com amigos na praça, jogos no tablet" value={atividadesRecreativas} onChange={(e) => setAtividadesRecreativas(e.target.value)} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Seção Imunizações */}
        {activeSection === "imunizacoes" && (
          <div className="space-y-6">
            {!statusVacinal && (
              <div className="flex flex-col items-center justify-center py-10 text-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50">
                <Shield className="h-8 w-8 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-500">Nenhum dado de vacinação registrado</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">Registre o status vacinal conforme verificado na caderneta física.</p>
              </div>
            )}
            <div className="rounded-lg border border-slate-200 p-4 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status de Imunização</p>
              <Textarea
                id="status-vacinal"
                placeholder="Ex: Calendário em dia conforme PNI. Última dose: DTP reforço em jan/2025."
                rows={4}
                value={statusVacinal}
                onChange={(e) => setStatusVacinal(e.target.value)}
              />
              <p className="text-xs text-slate-500">
                A caderneta de vacinas física deve ser verificada. Registre aqui o status geral e quaisquer pendências observadas.
              </p>
            </div>
          </div>
        )}

        {/* Seção Escolaridade (3-9 anos) */}
        {activeSection === "escolaridade" && is3to9 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Frequenta escola ou creche?</Label>
                <RadioGroup
                  value={frequentaEscola === null ? "" : frequentaEscola ? "sim" : "nao"}
                  onValueChange={(v) => setFrequentaEscola(v === "sim")}
                  className="flex gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="sim" id="escola-sim" />
                    <Label htmlFor="escola-sim" className="font-normal">Sim</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="nao" id="escola-nao" />
                    <Label htmlFor="escola-nao" className="font-normal">Não</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {frequentaEscola && (
                <div className="space-y-2">
                  <Label htmlFor="ano-escolar">Ano/série que está cursando</Label>
                  <Input
                    id="ano-escolar"
                    placeholder="Ex: 2º ano do Ensino Fundamental"
                    value={anoEscolar}
                    onChange={(e) => setAnoEscolar(e.target.value)}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Houve reprovação?</Label>
                <RadioGroup
                  value={reprovacaoEscolar === null ? "" : reprovacaoEscolar ? "sim" : "nao"}
                  onValueChange={(v) => setReprovacaoEscolar(v === "sim")}
                  className="flex gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="sim" id="reprovacao-sim" />
                    <Label htmlFor="reprovacao-sim" className="font-normal">Sim</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="nao" id="reprovacao-nao" />
                    <Label htmlFor="reprovacao-nao" className="font-normal">Não</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rendimento-escolar">Rendimento e relacionamento escolar</Label>
                <Textarea
                  id="rendimento-escolar"
                  placeholder="Descreva o rendimento acadêmico e o relacionamento com colegas e professores"
                  rows={3}
                  value={rendimentoEscolar}
                  onChange={(e) => setRendimentoEscolar(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Seção Triagem Neonatal (0-2 anos) */}
        {activeSection === "triagemNeonatal" && is0to2 && (
          <div className="space-y-6">
            {/* Bloco 1 — Identificação estendida */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700">Identificação Estendida</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ig">Idade gestacional ao nascer (semanas)</Label>
                  <Input
                    id="ig"
                    type="number"
                    placeholder="Ex: 34"
                    value={idadeGestacional}
                    onChange={(e) => setIdadeGestacional(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="peso-nascimento">Peso ao nascimento (gramas)</Label>
                  <Input
                    id="peso-nascimento"
                    type="number"
                    placeholder="Ex: 2450"
                    value={pesoNascimento}
                    onChange={(e) => setPesoNascimento(e.target.value)}
                  />
                </div>
              </div>
              
              {idadeGestacional && parseInt(idadeGestacional) < 37 && (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                  <Badge className="bg-teal-100 text-teal-800">
                    Idade corrigida: {Math.max(0, currentPatient.ageInMonths - Math.round((40 - parseInt(idadeGestacional)) / 4.33)).toFixed(1)} meses
                  </Badge>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="hip-diag">Hipóteses diagnósticas anteriores</Label>
                <Textarea
                  id="hip-diag"
                  placeholder="Liste diagnósticos prévios relevantes..."
                  rows={3}
                  value={hipDiagAnterior}
                  onChange={(e) => setHipDiagAnterior(e.target.value)}
                />
              </div>
            </div>
            
            <div className="my-4" />
            
            {/* Bloco 2 — Testes de Triagem Neonatal */}
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Testes de Triagem Neonatal</p>
              
              {/* Hint quando todos vazios */}
              {!testePezinho.resultado && !testeOrelhinha.resultado && !testeOlhinho.resultado && !testeCoracaozinho.resultado && (
                <p className="text-sm text-slate-500 bg-slate-50 rounded-lg p-3">
                  Registre o resultado de cada teste de triagem. Se não realizado, selecione &quot;Não realizado&quot;.
                </p>
              )}
              
              <div className="grid gap-4 md:grid-cols-2">
                {/* Teste do Pezinho */}
                <div className={cn(
                  "rounded-lg border p-4 space-y-3 transition-colors",
                  testePezinho.resultado === "alterado" && "border-red-300 bg-red-50",
                  testePezinho.resultado === "pendente" && "border-amber-300 bg-amber-50",
                  testePezinho.resultado === "nao-realizado" && "border-slate-300 bg-slate-50",
                  testePezinho.resultado === "normal" && "border-green-300 bg-green-50",
                  !testePezinho.resultado && "border-slate-200 bg-white",
                )}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">Teste do Pezinho</p>
                    {testePezinho.resultado && (
                      <Badge variant="secondary" className={cn(
                        "text-xs",
                        testePezinho.resultado === "normal" && "bg-green-100 text-green-700",
                        testePezinho.resultado === "alterado" && "bg-red-100 text-red-700",
                        testePezinho.resultado === "pendente" && "bg-amber-100 text-amber-700",
                        testePezinho.resultado === "nao-realizado" && "bg-slate-100 text-slate-600",
                      )}>
                        {testePezinho.resultado === "normal" ? "Normal" :
                         testePezinho.resultado === "alterado" ? "Alterado" :
                         testePezinho.resultado === "pendente" ? "Pendente" : "Não realizado"}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Resultado</Label>
                    <Select value={testePezinho.resultado} onValueChange={(v) => setTestePezinho({ ...testePezinho, resultado: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="alterado">Alterado</SelectItem>
                        <SelectItem value="nao-realizado">Não realizado</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Data</Label>
                    <Input type="date" value={testePezinho.data} onChange={(e) => setTestePezinho({ ...testePezinho, data: e.target.value })} />
                  </div>
                  {testePezinho.resultado === "alterado" && (
                    <div className="space-y-2">
                      <Label className="text-xs">Descrição do resultado</Label>
                      <Textarea rows={2} value={testePezinho.descricao} onChange={(e) => setTestePezinho({ ...testePezinho, descricao: e.target.value })} />
                    </div>
                  )}
                </div>
                
                {/* Teste da Orelhinha */}
                <div className={cn(
                  "rounded-lg border p-4 space-y-3 transition-colors",
                  testeOrelhinha.resultado === "alterado" && "border-red-300 bg-red-50",
                  testeOrelhinha.resultado === "pendente" && "border-amber-300 bg-amber-50",
                  testeOrelhinha.resultado === "nao-realizado" && "border-slate-300 bg-slate-50",
                  testeOrelhinha.resultado === "normal" && "border-green-300 bg-green-50",
                  !testeOrelhinha.resultado && "border-slate-200 bg-white",
                )}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">Teste da Orelhinha (PEATE)</p>
                    {testeOrelhinha.resultado && (
                      <Badge variant="secondary" className={cn(
                        "text-xs",
                        testeOrelhinha.resultado === "normal" && "bg-green-100 text-green-700",
                        testeOrelhinha.resultado === "alterado" && "bg-red-100 text-red-700",
                        testeOrelhinha.resultado === "pendente" && "bg-amber-100 text-amber-700",
                        testeOrelhinha.resultado === "nao-realizado" && "bg-slate-100 text-slate-600",
                      )}>
                        {testeOrelhinha.resultado === "normal" ? "Normal" :
                         testeOrelhinha.resultado === "alterado" ? "Alterado" :
                         testeOrelhinha.resultado === "pendente" ? "Pendente" : "Não realizado"}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Resultado</Label>
                    <Select value={testeOrelhinha.resultado} onValueChange={(v) => setTesteOrelhinha({ ...testeOrelhinha, resultado: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="alterado">Alterado</SelectItem>
                        <SelectItem value="nao-realizado">Não realizado</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Data</Label>
                    <Input type="date" value={testeOrelhinha.data} onChange={(e) => setTesteOrelhinha({ ...testeOrelhinha, data: e.target.value })} />
                  </div>
                  {testeOrelhinha.resultado === "alterado" && (
                    <div className="space-y-2">
                      <Label className="text-xs">Descrição do resultado</Label>
                      <Textarea rows={2} value={testeOrelhinha.descricao} onChange={(e) => setTesteOrelhinha({ ...testeOrelhinha, descricao: e.target.value })} />
                    </div>
                  )}
                </div>
                
                {/* Teste do Olhinho */}
                <div className={cn(
                  "rounded-lg border p-4 space-y-3 transition-colors",
                  testeOlhinho.resultado === "alterado" && "border-red-300 bg-red-50",
                  testeOlhinho.resultado === "pendente" && "border-amber-300 bg-amber-50",
                  testeOlhinho.resultado === "nao-realizado" && "border-slate-300 bg-slate-50",
                  testeOlhinho.resultado === "normal" && "border-green-300 bg-green-50",
                  !testeOlhinho.resultado && "border-slate-200 bg-white",
                )}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">Teste do Olhinho / Fundo de olho</p>
                    {testeOlhinho.resultado && (
                      <Badge variant="secondary" className={cn(
                        "text-xs",
                        testeOlhinho.resultado === "normal" && "bg-green-100 text-green-700",
                        testeOlhinho.resultado === "alterado" && "bg-red-100 text-red-700",
                        testeOlhinho.resultado === "pendente" && "bg-amber-100 text-amber-700",
                        testeOlhinho.resultado === "nao-realizado" && "bg-slate-100 text-slate-600",
                      )}>
                        {testeOlhinho.resultado === "normal" ? "Normal" :
                         testeOlhinho.resultado === "alterado" ? "Alterado" :
                         testeOlhinho.resultado === "pendente" ? "Pendente" : "Não realizado"}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Resultado</Label>
                    <Select value={testeOlhinho.resultado} onValueChange={(v) => setTesteOlhinho({ ...testeOlhinho, resultado: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="alterado">Alterado</SelectItem>
                        <SelectItem value="nao-realizado">Não realizado</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Data</Label>
                    <Input type="date" value={testeOlhinho.data} onChange={(e) => setTesteOlhinho({ ...testeOlhinho, data: e.target.value })} />
                  </div>
                  {testeOlhinho.resultado === "alterado" && (
                    <div className="space-y-2">
                      <Label className="text-xs">Descrição do resultado</Label>
                      <Textarea rows={2} value={testeOlhinho.descricao} onChange={(e) => setTesteOlhinho({ ...testeOlhinho, descricao: e.target.value })} />
                    </div>
                  )}
                </div>
                
                {/* Teste do Coraçãozinho */}
                <div className={cn(
                  "rounded-lg border p-4 space-y-3 transition-colors",
                  testeCoracaozinho.resultado === "alterado" && "border-red-300 bg-red-50",
                  testeCoracaozinho.resultado === "pendente" && "border-amber-300 bg-amber-50",
                  testeCoracaozinho.resultado === "nao-realizado" && "border-slate-300 bg-slate-50",
                  testeCoracaozinho.resultado === "normal" && "border-green-300 bg-green-50",
                  !testeCoracaozinho.resultado && "border-slate-200 bg-white",
                )}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">Teste do Coraçãozinho (Oximetria)</p>
                    {testeCoracaozinho.resultado && (
                      <Badge variant="secondary" className={cn(
                        "text-xs",
                        testeCoracaozinho.resultado === "normal" && "bg-green-100 text-green-700",
                        testeCoracaozinho.resultado === "alterado" && "bg-red-100 text-red-700",
                        testeCoracaozinho.resultado === "pendente" && "bg-amber-100 text-amber-700",
                        testeCoracaozinho.resultado === "nao-realizado" && "bg-slate-100 text-slate-600",
                      )}>
                        {testeCoracaozinho.resultado === "normal" ? "Normal" :
                         testeCoracaozinho.resultado === "alterado" ? "Alterado" :
                         testeCoracaozinho.resultado === "pendente" ? "Pendente" : "Não realizado"}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Resultado</Label>
                    <Select value={testeCoracaozinho.resultado} onValueChange={(v) => setTesteCoracaozinho({ ...testeCoracaozinho, resultado: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="alterado">Alterado</SelectItem>
                        <SelectItem value="nao-realizado">Não realizado</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Data</Label>
                    <Input type="date" value={testeCoracaozinho.data} onChange={(e) => setTesteCoracaozinho({ ...testeCoracaozinho, data: e.target.value })} />
                  </div>
                  {testeCoracaozinho.resultado === "alterado" && (
                    <div className="space-y-2">
                      <Label className="text-xs">Descrição do resultado</Label>
                      <Textarea rows={2} value={testeCoracaozinho.descricao} onChange={(e) => setTesteCoracaozinho({ ...testeCoracaozinho, descricao: e.target.value })} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === "clinical" && (
          <div className="space-y-6">
            {/* Zona 1: Sistema selection chips */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {sistemasExame.map((sistema) => {
                  const SistemaIcon = sistema.icon
                  const isSelected = sistemasSelecionados.has(sistema.id)
                  
                  return (
                    <button
                      key={sistema.id}
                      type="button"
                      onClick={() => toggleSistema(sistema.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors cursor-pointer",
                        isSelected
                          ? "border border-teal-600 bg-teal-50 text-teal-800 font-medium"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50"
                      )}
                    >
                      <SistemaIcon className="h-3.5 w-3.5" />
                      {sistema.nome}
                    </button>
                  )
                })}
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllSistemas}>
                  Selecionar todos
                </Button>
                <Button variant="ghost" size="sm" onClick={clearSistemasSelection}>
                  Limpar seleção
                </Button>
              </div>
            </div>

            {/* Zona 2: Forms for selected systems */}
            {sistemasSelecionados.size === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-slate-50">
                <Stethoscope className="h-10 w-10 text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">Nenhum sistema selecionado</p>
                <p className="text-sm text-slate-400">Clique nos chips acima para selecionar os sistemas que foram avaliados.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sistemasExame
                  .filter(sistema => sistemasSelecionados.has(sistema.id))
                  .map((sistema) => {
                    const SistemaIcon = sistema.icon
                    const estado = exameFisico[sistema.id] || { status: null, descricao: "", fontanelas: "", reflexos: "" }
                    
                    return (
                      <div 
                        key={sistema.id} 
                        className={cn(
                          "rounded-lg border p-4 space-y-4 transition-colors",
                          estado.status === "normal" && "bg-green-50 border-green-200",
                          estado.status === "alterado" && "bg-red-50 border-red-200",
                          !estado.status && "bg-slate-50 border-dashed border-slate-300"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <SistemaIcon className="h-5 w-5 text-slate-600" />
                            <span className="font-medium">{sistema.nome}</span>
                            {estado.status === "normal" && (
                              <Check className="h-4 w-4 text-green-600" />
                            )}
                            {estado.status === "alterado" && (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleSistema(sistema.id)}
                            className="text-slate-400 hover:text-slate-600 p-1"
                            title="Remover sistema"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">Como está?</span>
                            <ToggleGroup 
                              type="single" 
                              value={estado.status || ""} 
                              onValueChange={(value) => {
                                setExameFisico({
                                  ...exameFisico,
                                  [sistema.id]: { 
                                    ...estado,
                                    status: (value as SistemaStatus) || null, 
                                    descricao: value === "normal" ? "" : estado.descricao 
                                  }
                                })
                              }}
                            >
                              <ToggleGroupItem 
                                value="normal" 
                                className={cn(
                                  "data-[state=on]:bg-green-100 data-[state=on]:text-green-800 data-[state=on]:border-green-300",
                                  "bg-slate-50 text-slate-600 border border-slate-200"
                                )}
                              >
                                Normal
                              </ToggleGroupItem>
                              <ToggleGroupItem 
                                value="alterado"
                                className={cn(
                                  "data-[state=on]:bg-red-100 data-[state=on]:text-red-800 data-[state=on]:border-red-300",
                                  "bg-slate-50 text-slate-600 border border-slate-200"
                                )}
                              >
                                Alterado
                              </ToggleGroupItem>
                            </ToggleGroup>
                          </div>
                          
                          {/* Textarea for alterado */}
                          {estado.status === "alterado" && (
                            <Textarea
                              placeholder={sistema.placeholder}
                              rows={2}
                              value={estado.descricao}
                              onChange={(e) => setExameFisico({
                                ...exameFisico,
                                [sistema.id]: { ...estado, descricao: e.target.value }
                              })}
                            />
                          )}
                          
                          {/* Conditional Fontanelas for Cabeça e pescoço (≤ 18 months) */}
                          {sistema.showFontanelas && currentPatient.ageInMonths <= 18 && (
                            <div className="border-t pt-3 space-y-2">
                              <Label className="text-sm">Fontanelas</Label>
                              <ToggleGroup 
                                type="single" 
                                value={estado.fontanelas || ""} 
                                onValueChange={(value) => {
                                  setExameFisico({
                                    ...exameFisico,
                                    [sistema.id]: { ...estado, fontanelas: value }
                                  })
                                }}
                              >
                                <ToggleGroupItem value="normal" className="text-sm">Normal</ToggleGroupItem>
                                <ToggleGroupItem value="alterado-abaulada" className="text-sm">Alterado/Abaulada</ToggleGroupItem>
                                <ToggleGroupItem value="fechada-precoce" className="text-sm">Fechada precocemente</ToggleGroupItem>
                              </ToggleGroup>
                            </div>
                          )}
                          
                          {/* Conditional Reflexos primitivos for Neurológico (≤ 12 months) */}
                          {sistema.showReflexosPrimitivos && currentPatient.ageInMonths <= 12 && (
                            <div className="border-t pt-3 space-y-2">
                              <Label className="text-sm">Reflexos primitivos</Label>
                              <ToggleGroup 
                                type="single" 
                                value={estado.reflexos || ""} 
                                onValueChange={(value) => {
                                  setExameFisico({
                                    ...exameFisico,
                                    [sistema.id]: { ...estado, reflexos: value }
                                  })
                                }}
                              >
                                <ToggleGroupItem value="presentes" className="text-sm">Presentes</ToggleGroupItem>
                                <ToggleGroupItem value="ausentes" className="text-sm">Ausentes</ToggleGroupItem>
                                <ToggleGroupItem value="assimetricos" className="text-sm">Assimétricos</ToggleGroupItem>
                              </ToggleGroup>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        )}

        {activeSection === "milestones" && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left font-medium p-3 min-w-[180px] border-r">Marco</th>
                    <th className="text-left font-medium p-3 text-muted-foreground min-w-[300px] border-r">
                      Como pesquisar
                    </th>
                    {ageColumns.map((age) => (
                      <th
                        key={age}
                        className={cn(
                          "text-center font-medium p-2 min-w-[50px] border-r last:border-r-0",
                          age === currentPatient.ageInMonths && "bg-teal-100 text-teal-800"
                        )}
                      >
                        <div>{age}</div>
                        {age === currentPatient.ageInMonths && (
                          <Badge variant="secondary" className="text-[10px] px-1 py-0 mt-1 bg-teal-200 text-teal-800">
                            Hoje
                          </Badge>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeMilestones.map((milestone) => (
                    <tr key={milestone.id} className="border-b last:border-b-0">
                      <td className="p-3 font-medium border-r">{milestone.name}</td>
                      <td className="p-3 text-muted-foreground text-xs border-r">
                        {milestone.instruction}
                      </td>
                      {ageColumns.map((age) => {
                        const editable = isMilestoneEditable(milestone, age)
                        const future = isMilestoneFuture(age)
                        const past = isMilestonePast(milestone, age)
                        const isCurrentAge = age === currentPatient.ageInMonths
                        // FIXED: Use composite key
                        const cellKey = `${milestone.id}-${age}`
                        
                        return (
                          <td
                            key={age}
                            className={cn(
                              "p-2 text-center border-r last:border-r-0",
                              editable && "bg-teal-50 cursor-pointer hover:bg-teal-100",
                              future && "bg-slate-100 opacity-40 cursor-not-allowed",
                              past && !editable && "bg-slate-50 cursor-default",
                              isCurrentAge && "bg-teal-50/80"
                            )}
                          >
                            {editable ? (
                              <div className="flex justify-center gap-1">
                                <button
                                  onClick={() => setMilestoneStatus(prev => ({
                                    ...prev,
                                    [cellKey]: prev[cellKey] === "confirmed" ? null : "confirmed"
                                  }))}
                                  className={cn(
                                    "w-6 h-6 rounded border flex items-center justify-center transition-colors",
                                    milestoneStatus[cellKey] === "confirmed"
                                      ? "bg-green-100 border-green-500 text-green-600"
                                      : "hover:bg-slate-100 border-teal-200"
                                  )}
                                >
                                  <Check className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => setMilestoneStatus(prev => ({
                                    ...prev,
                                    [cellKey]: prev[cellKey] === "not-achieved" ? null : "not-achieved"
                                  }))}
                                  className={cn(
                                    "w-6 h-6 rounded border flex items-center justify-center transition-colors",
                                    milestoneStatus[cellKey] === "not-achieved"
                                      ? "bg-red-100 border-red-500 text-red-600"
                                      : "hover:bg-slate-100 border-teal-200"
                                  )}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ) : future ? (
                              <span className="text-slate-300">—</span>
                            ) : (
                              <Minus className="h-4 w-4 text-slate-300 mx-auto" />
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground pt-4 border-t">
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded border bg-green-100 border-green-500 flex items-center justify-center">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <span>Confirmado (observado nesta consulta)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded border bg-red-100 border-red-500 flex items-center justify-center">
                  <X className="h-3 w-3 text-red-600" />
                </div>
                <span>Não atingido (esperado não observado)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded border flex items-center justify-center">
                  <Minus className="h-3 w-3 text-slate-400" />
                </div>
                <span>Não avaliado</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded bg-teal-50 border border-teal-200"></div>
                <span>Dentro da janela</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded bg-slate-100 opacity-40"></div>
                <span>Fora do alcance (futuro)</span>
              </div>
            </div>
            
            {/* Classificação do Desenvolvimento */}
            <Separator />
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700">Classificação do Desenvolvimento</h3>
              <p className="text-xs text-muted-foreground">
                Baseado na avaliação dos marcos, classifique o desenvolvimento neuropsicomotor da criança:
              </p>
              <RadioGroup
                value={classificacaoDesenvolvimento || ""}
                onValueChange={(v) => setClassificacaoDesenvolvimento(v as "adequado" | "alerta" | "provavel-atraso")}
                className="grid gap-3"
              >
                <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                  <RadioGroupItem value="adequado" id="class-adequado" className="mt-1" />
                  <div>
                    <Label htmlFor="class-adequado" className="font-medium text-green-700 cursor-pointer">
                      Desenvolvimento adequado para a idade
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Todos os marcos esperados para a idade foram alcançados.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                  <RadioGroupItem value="alerta" id="class-alerta" className="mt-1" />
                  <div>
                    <Label htmlFor="class-alerta" className="font-medium text-amber-700 cursor-pointer">
                      Alerta para o desenvolvimento
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ausência de um ou mais marcos esperados para a idade. Necessário acompanhamento mais próximo.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                  <RadioGroupItem value="provavel-atraso" id="class-atraso" className="mt-1" />
                  <div>
                    <Label htmlFor="class-atraso" className="font-medium text-red-700 cursor-pointer">
                      Provável atraso no desenvolvimento
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ausência de marcos de faixas etárias anteriores. Encaminhamento para avaliação especializada indicado.
                    </p>
                  </div>
                </div>
              </RadioGroup>
              
              {classificacaoDesenvolvimento === "provavel-atraso" && (
                <Alert className="border-red-300 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Considere encaminhamento para neuropediatra, fonoaudiologia e/ou estimulação precoce conforme área de atraso identificada.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        )}

        {activeSection === "mchat" && showMchat && (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Este instrumento rastreia sinais de risco para o Transtorno do Espectro Autista (TEA). 
              As perguntas devem ser respondidas pelo cuidador com base no comportamento habitual da criança.
            </p>

            <div className="space-y-3">
              {mchatQuestions.map((q) => (
                <div
                  key={q.id}
                  className="flex items-start gap-4 p-4 border rounded-lg"
                >
                  <span className="font-bold text-sm text-muted-foreground w-6">
                    {q.id}.
                  </span>
                  <div className="flex-1">
                    <p className="text-sm">{q.question}</p>
                  </div>
                  <RadioGroup
                    value={mchatAnswers[q.id] || ""}
                    onValueChange={(v) => setMchatAnswers({
                      ...mchatAnswers,
                      [q.id]: v as "yes" | "no"
                    })}
                    className="flex gap-4"
                  >
                    <div className="flex items-center gap-1">
                      <RadioGroupItem value="yes" id={`q${q.id}-yes`} />
                      <Label htmlFor={`q${q.id}-yes`} className="text-sm">Sim</Label>
                    </div>
                    <div className="flex items-center gap-1">
                      <RadioGroupItem value="no" id={`q${q.id}-no`} />
                      <Label htmlFor={`q${q.id}-no`} className="text-sm">Não</Label>
                    </div>
                  </RadioGroup>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm">
                <span className="text-muted-foreground">Pontuação parcial:</span>{" "}
                <span className="font-bold">{mchatScore} / 20</span>
                <span className="text-muted-foreground ml-2">({answeredCount} de 20 respondidas)</span>
              </p>
            </div>

            {allAnswered && (
              <Card className={cn(
                "border-l-4",
                getMchatRiskLevel() === "low" && "border-l-green-500 bg-green-50",
                getMchatRiskLevel() === "medium" && "border-l-amber-500 bg-amber-50",
                getMchatRiskLevel() === "high" && "border-l-red-500 bg-red-50"
              )}>
                <CardContent className="pt-6">
                  {getMchatRiskLevel() === "low" && (
                    <>
                      <p className="font-semibold text-green-800">
                        Pontuação Total: {mchatScore}. Baixo risco para TEA.
                      </p>
                      <p className="text-sm text-green-700 mt-2">
                        Se a criança tem menos de 24 meses, reaplicar o M-CHAT após o aniversário de 2 anos.
                      </p>
                      <Button variant="ghost" className="mt-4">Registrar resultado</Button>
                    </>
                  )}
                  {getMchatRiskLevel() === "medium" && (
                    <>
                      <p className="font-semibold text-amber-800">
                        Pontuação Total: {mchatScore}. Risco médio. Aplicar a Entrevista de Seguimento (M-CHAT-R/F).
                      </p>
                      <p className="text-sm text-amber-700 mt-2">
                        O teste é considerado positivo se a criança falhar em 2 ou mais itens na entrevista de seguimento. Encaminhamento automático adicionado.
                      </p>
                    </>
                  )}
                  {getMchatRiskLevel() === "high" && (
                    <>
                      <p className="font-semibold text-red-800">
                        Pontuação Total: {mchatScore}. Risco elevado para TEA.
                      </p>
                      <p className="text-sm text-red-700 mt-2">
                        A criança deve ser encaminhada imediatamente para avaliação diagnóstica e intervenção precoce. 
                        Encaminhamento automático adicionado.
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            <Alert className="border-amber-300 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                ATENÇÃO: Em caso de suspeita por parte da família ou do profissional, a criança deverá ser 
                encaminhada para avaliação mesmo que o resultado seja de baixo risco.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Seção História Familiar (3-9 anos) */}
        {activeSection === "historiaFamiliar" && is3to9 && (
          <div className="space-y-6">
            {!isFirstVisit && (
              <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                <div className="space-y-2">
                  <Label>Houve mudança na história familiar desde a última consulta?</Label>
                  <RadioGroup
                    value={historiaFamiliarMudou === null ? "" : historiaFamiliarMudou ? "sim" : "nao"}
                    onValueChange={(v) => setHistoriaFamiliarMudou(v === "sim")}
                    className="flex gap-4"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="sim" id="hist-mudou-sim" />
                      <Label htmlFor="hist-mudou-sim" className="font-normal">Sim</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="nao" id="hist-mudou-nao" />
                      <Label htmlFor="hist-mudou-nao" className="font-normal">Não</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}
            
            {!isFirstVisit && historiaFamiliarMudou === false && (
              <div className="p-4 bg-slate-50 border rounded-lg">
                <p className="text-sm text-slate-600 mb-3">Sem mudanças registradas desde a última consulta.</p>
                <Button variant="ghost" size="sm" onClick={() => setHistoriaFamiliarMudou(true)}>
                  Registrar mudança
                </Button>
              </div>
            )}
            
            {(isFirstVisit || historiaFamiliarMudou) && (
              <div className="space-y-6">
                {/* Dados Maternos */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="text-sm font-semibold text-slate-700">Dados Maternos</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Idade</Label>
                      <Input placeholder="Ex: 32 anos" value={maternalIdade} onChange={(e) => setMaternalIdade(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Estado de saúde</Label>
                      <Input placeholder="Ex: Saudável, HAS controlada" value={maternalSaude} onChange={(e) => setMaternalSaude(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Ocupação</Label>
                      <Input placeholder="Ex: Professora" value={maternalOcupacao} onChange={(e) => setMaternalOcupacao(e.target.value)} />
                    </div>
                  </div>
                </div>
                
                {/* Dados Paternos */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="text-sm font-semibold text-slate-700">Dados Paternos</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Idade</Label>
                      <Input placeholder="Ex: 35 anos" value={paternalIdade} onChange={(e) => setPaternalIdade(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Estado de saúde</Label>
                      <Input placeholder="Ex: Saudável, DM2" value={paternalSaude} onChange={(e) => setPaternalSaude(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Ocupação</Label>
                      <Input placeholder="Ex: Motorista" value={paternalOcupacao} onChange={(e) => setPaternalOcupacao(e.target.value)} />
                    </div>
                  </div>
                </div>
                
                {/* Coabitação e Irmãos */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Coabitação dos pais</Label>
                    <Select value={coabitacaoPais} onValueChange={setCoabitacaoPais}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="juntos">Moram juntos</SelectItem>
                        <SelectItem value="separados">Separados</SelectItem>
                        <SelectItem value="falecido-mae">Mãe falecida</SelectItem>
                        <SelectItem value="falecido-pai">Pai falecido</SelectItem>
                        <SelectItem value="desconhecido">Pai desconhecido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Irmãos — idades e saúde</Label>
                    <Textarea rows={2} placeholder="Ex: 2 irmãos (8a e 5a), todos saudáveis" value={irmaosSaude} onChange={(e) => setIrmaosSaude(e.target.value)} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Seção Dinâmica Familiar (3-9 anos) */}
        {activeSection === "dinamicaFamiliar" && is3to9 && (
          <div className="space-y-6">
            {!isFirstVisit && (
              <div className="rounded-lg bg-slate-50 p-4 space-y-3">
                <div className="space-y-2">
                  <Label>Houve mudança na dinâmica familiar desde a última consulta?</Label>
                  <RadioGroup
                    value={dinamicaMudou === null ? "" : dinamicaMudou ? "sim" : "nao"}
                    onValueChange={(v) => setDinamicaMudou(v === "sim")}
                    className="flex gap-4"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="sim" id="din-mudou-sim" />
                      <Label htmlFor="din-mudou-sim" className="font-normal">Sim</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="nao" id="din-mudou-nao" />
                      <Label htmlFor="din-mudou-nao" className="font-normal">Não</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}
            
            {!isFirstVisit && dinamicaMudou === false && (
              <div className="rounded-lg bg-slate-50 p-4 space-y-3">
                <p className="text-sm text-slate-600">Sem mudanças registradas. Dinâmica familiar inalterada desde a última consulta.</p>
                <Button variant="ghost" size="sm" onClick={() => setDinamicaMudou(true)}>
                  Registrar mudança
                </Button>
              </div>
            )}
            
            {(isFirstVisit || dinamicaMudou) && (
              <div className="space-y-4">
                {/* Perguntas numeradas em container único */}
                <div className="rounded-lg border border-slate-200 divide-y divide-slate-100">
                  {/* 1. Relacionamento conjugal */}
                  <div className="flex items-center justify-between gap-6 py-3 px-4">
                    <p className="text-sm font-medium text-slate-800 flex-1">
                      <span className="text-slate-400 mr-2 tabular-nums">1.</span>
                      Relacionamento com companheiro(a)
                    </p>
                    <Select value={relacionamentoConjugal} onValueChange={setRelacionamentoConjugal}>
                      <SelectTrigger className="w-52">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sem-conflito">Não tem conflito</SelectItem>
                        <SelectItem value="algum-conflito">Com algum conflito</SelectItem>
                        <SelectItem value="muito-conflito">Com muito conflito</SelectItem>
                        <SelectItem value="nao-aplica">Não se aplica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* 2. Resolução de desentendimentos */}
                  <div className="flex items-center justify-between gap-6 py-3 px-4">
                    <p className="text-sm font-medium text-slate-800 flex-1">
                      <span className="text-slate-400 mr-2 tabular-nums">2.</span>
                      Vocês resolvem desentendimentos
                    </p>
                    <Select value={resolucaoDesentendimentos} onValueChange={setResolucaoDesentendimentos}>
                      <SelectTrigger className="w-52">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sem-dificuldade">Sem dificuldade</SelectItem>
                        <SelectItem value="alguma-dificuldade">Com alguma dificuldade</SelectItem>
                        <SelectItem value="muita-dificuldade">Com muita dificuldade</SelectItem>
                        <SelectItem value="nao-aplica">Não se aplica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* 3. Fumante no domicílio */}
                  <div className="flex items-start justify-between gap-6 py-3 px-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 leading-snug">
                        <span className="text-slate-400 mr-2 tabular-nums">3.</span>
                        Há fumante no domicílio?
                      </p>
                      {fumanteCasa && (
                        <div className="mt-2 ml-5">
                          <Input className="max-w-xs" placeholder="Parentesco (ex: pai, avó)" value={fumanteCasaParentesco} onChange={(e) => setFumanteCasaParentesco(e.target.value)} />
                        </div>
                      )}
                    </div>
                    <RadioGroup value={fumanteCasa === null ? "" : fumanteCasa ? "sim" : "nao"} onValueChange={(v) => setFumanteCasa(v === "sim")} className="flex gap-3 shrink-0 pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <RadioGroupItem value="sim" id="fumante-sim" />
                        <Label className="font-normal text-sm" htmlFor="fumante-sim">Sim</Label>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <RadioGroupItem value="nao" id="fumante-nao" />
                        <Label className="font-normal text-sm" htmlFor="fumante-nao">Não</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  {/* 4. Álcool ou drogas */}
                  <div className="flex items-start justify-between gap-6 py-3 px-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 leading-snug">
                        <span className="text-slate-400 mr-2 tabular-nums">4.</span>
                        Há uso de álcool ou drogas por familiar na residência?
                      </p>
                      {alcoolDrogasCasa && (
                        <div className="mt-2 ml-5 space-y-2">
                          <Input className="max-w-xs" placeholder="Tipo (ex: álcool, maconha...)" value={alcoolDrogasTipo} onChange={(e) => setAlcoolDrogasTipo(e.target.value)} />
                        </div>
                      )}
                    </div>
                    <RadioGroup value={alcoolDrogasCasa === null ? "" : alcoolDrogasCasa ? "sim" : "nao"} onValueChange={(v) => setAlcoolDrogasCasa(v === "sim")} className="flex gap-3 shrink-0 pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <RadioGroupItem value="sim" id="alcool-sim" />
                        <Label className="font-normal text-sm" htmlFor="alcool-sim">Sim</Label>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <RadioGroupItem value="nao" id="alcool-nao" />
                        <Label className="font-normal text-sm" htmlFor="alcool-nao">Não</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  {/* 5. Insegurança alimentar */}
                  <div className="flex items-start justify-between gap-6 py-3 px-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 leading-snug">
                        <span className="text-slate-400 mr-2 tabular-nums">5.</span>
                        Há insegurança alimentar em casa (falta de comida)?
                      </p>
                    </div>
                    <RadioGroup value={insegurancaAlimentar === null ? "" : insegurancaAlimentar ? "sim" : "nao"} onValueChange={(v) => setInsegurancaAlimentar(v === "sim")} className="flex gap-3 shrink-0 pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <RadioGroupItem value="sim" id="inseg-sim" />
                        <Label className="font-normal text-sm" htmlFor="inseg-sim">Sim</Label>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <RadioGroupItem value="nao" id="inseg-nao" />
                        <Label className="font-normal text-sm" htmlFor="inseg-nao">Não</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  {/* 6. Familiar preso */}
                  <div className="flex items-start justify-between gap-6 py-3 px-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 leading-snug">
                        <span className="text-slate-400 mr-2 tabular-nums">6.</span>
                        Há familiar próximo que está ou esteve preso?
                      </p>
                      {familiarPreso && (
                        <div className="mt-2 ml-5">
                          <Input className="max-w-xs" placeholder="Parentesco (ex: tio, pai)" value={familiarPresoParentesco} onChange={(e) => setFamiliarPresoParentesco(e.target.value)} />
                        </div>
                      )}
                    </div>
                    <RadioGroup value={familiarPreso === null ? "" : familiarPreso ? "sim" : "nao"} onValueChange={(v) => setFamiliarPreso(v === "sim")} className="flex gap-3 shrink-0 pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <RadioGroupItem value="sim" id="preso-sim" />
                        <Label className="font-normal text-sm" htmlFor="preso-sim">Sim</Label>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <RadioGroupItem value="nao" id="preso-nao" />
                        <Label className="font-normal text-sm" htmlFor="preso-nao">Não</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  {/* 7. Preocupação com comportamento */}
                  <div className="flex items-start justify-between gap-6 py-3 px-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 leading-snug">
                        <span className="text-slate-400 mr-2 tabular-nums">7.</span>
                        Há preocupação com o comportamento da criança?
                      </p>
                    </div>
                    <RadioGroup value={preocupacaoComportamento === null ? "" : preocupacaoComportamento ? "sim" : "nao"} onValueChange={(v) => setPreocupacaoComportamento(v === "sim")} className="flex gap-3 shrink-0 pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <RadioGroupItem value="sim" id="preocupa-sim" />
                        <Label className="font-normal text-sm" htmlFor="preocupa-sim">Sim</Label>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <RadioGroupItem value="nao" id="preocupa-nao" />
                        <Label className="font-normal text-sm" htmlFor="preocupa-nao">Não</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                
                {/* Bloco Disciplina separado */}
                <div className="rounded-lg border border-slate-300 p-4 space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Disciplina</p>
                  <div className="space-y-3">
                    <Label className="text-sm">Como a criança é disciplinada em casa? (múltipla escolha)</Label>
                    <div className="grid gap-2 md:grid-cols-2">
                      {[
                        { id: "conversa", label: "Conversa" },
                        { id: "castigo", label: "Castigo (tempo, privilégios)" },
                        { id: "gritos", label: "Gritos" },
                        { id: "palmadas", label: "Palmadas" },
                        { id: "agressao", label: "Agressão física" },
                        { id: "outros", label: "Outros" },
                      ].map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`disciplina-${item.id}`}
                            checked={disciplina.includes(item.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setDisciplina([...disciplina, item.id])
                              } else {
                                setDisciplina(disciplina.filter(d => d !== item.id))
                              }
                            }}
                          />
                          <Label htmlFor={`disciplina-${item.id}`} className="font-normal">{item.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  {disciplina.includes("outros") && (
                    <div className="space-y-2">
                      <Label>Descreva outros métodos</Label>
                      <Input value={disciplinaOutros} onChange={(e) => setDisciplinaOutros(e.target.value)} />
                    </div>
                  )}
                  
                  {(disciplina.includes("agressao") || disciplina.includes("palmadas")) && (
                    <Alert className="border-red-300 bg-red-50">
                      <AlertOctagon className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        A presença de agressão física deve ser investigada e, se confirmada, notificada ao Conselho Tutelar conforme protocolo institucional.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Seção Condições Socioeconômicas (primeira consulta + 3-9 anos) */}
        {activeSection === "socioeconomico" && isFirstVisit && is3to9 && (
          <div className="space-y-6">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              <Info className="h-4 w-4 inline mr-2" />
              Esta seção é coletada apenas na primeira consulta. Os dados serão reutilizados em atendimentos futuros.
            </div>
            
            {/* Bloco 1 — Renda */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="text-sm font-semibold text-slate-700">Renda Familiar</h3>
              <div className="space-y-2">
                <Label>Renda familiar mensal (R$)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    placeholder="Ex: 3500"
                    value={rendaFamiliar}
                    onChange={(e) => setRendaFamiliar(e.target.value)}
                    disabled={rendaNaoSabe}
                    className="max-w-[200px]"
                  />
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="renda-nao-sabe"
                      checked={rendaNaoSabe}
                      onCheckedChange={(checked) => {
                        setRendaNaoSabe(!!checked)
                        if (checked) setRendaFamiliar("")
                      }}
                    />
                    <Label htmlFor="renda-nao-sabe" className="font-normal">Não sabe / Não informado</Label>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bloco 2 — Moradia */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="text-sm font-semibold text-slate-700">Moradia</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tipo de casa</Label>
                    <Select value={tipoCasa} onValueChange={setTipoCasa}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alvenaria">Alvenaria (tijolo)</SelectItem>
                        <SelectItem value="madeira">Madeira</SelectItem>
                        <SelectItem value="mista">Mista</SelectItem>
                        <SelectItem value="taipa">Taipa</SelectItem>
                        <SelectItem value="improvisada">Improvisada / Barraco</SelectItem>
                        <SelectItem value="apartamento">Apartamento</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                  <Label>Número de cômodos</Label>
                  <Input type="number" placeholder="Ex: 5" value={numeroComodos} onChange={(e) => setNumeroComodos(e.target.value)} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>A casa possui banheiro?</Label>
                <RadioGroup
                  value={temBanheiro === null ? "" : temBanheiro ? "sim" : "nao"}
                  onValueChange={(v) => setTemBanheiro(v === "sim")}
                  className="flex gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="sim" id="banheiro-sim" />
                    <Label htmlFor="banheiro-sim" className="font-normal">Sim</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="nao" id="banheiro-nao" />
                    <Label htmlFor="banheiro-nao" className="font-normal">Não</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label>Quarto da criança</Label>
                <Select value={quartoCrianca} onValueChange={setQuartoCrianca}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Quarto individual</SelectItem>
                    <SelectItem value="compartilhado-irmaos">Compartilhado com irmãos</SelectItem>
                    <SelectItem value="compartilhado-pais">Compartilhado com pais</SelectItem>
                    <SelectItem value="comodo-unico">Cômodo único</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Há animais domésticos?</Label>
                <RadioGroup
                  value={presencaAnimais === null ? "" : presencaAnimais ? "sim" : "nao"}
                  onValueChange={(v) => setPresencaAnimais(v === "sim")}
                  className="flex gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="sim" id="animais-sim" />
                    <Label htmlFor="animais-sim" className="font-normal">Sim</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="nao" id="animais-nao" />
                    <Label htmlFor="animais-nao" className="font-normal">Não</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            {/* Bloco 3 — Saneamento (checkboxes) */}
            <div className="rounded-lg border border-slate-200 p-4 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Saneamento e Infraestrutura</p>
              <p className="text-xs text-slate-400">Marque os serviços disponíveis na residência.</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "agua", label: "Água encanada" },
                  { id: "energia", label: "Energia elétrica" },
                  { id: "esgoto", label: "Rede de esgoto" },
                  { id: "lixo", label: "Coleta de lixo" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`san-${item.id}`}
                      checked={saneamentoPresenteItems.includes(item.id)}
                      onCheckedChange={(checked) => {
                        setSaneamentoPresenteItems(prev =>
                          checked ? [...prev, item.id] : prev.filter(i => i !== item.id)
                        )
                      }}
                    />
                    <Label htmlFor={`san-${item.id}`} className="font-normal text-sm">{item.label}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Bloco 4 — Segurança */}
            <div className="rounded-lg border border-slate-200 p-4 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Segurança</p>
              <div className="flex items-start justify-between gap-6">
                <p className="text-sm font-medium text-slate-800">Área de violência urbana?</p>
                <RadioGroup
                  value={areaViolencia === null ? "" : areaViolencia ? "sim" : "nao"}
                  onValueChange={(v) => setAreaViolencia(v === "sim")}
                  className="flex gap-3 shrink-0"
                >
                  <div className="flex items-center gap-1.5">
                    <RadioGroupItem value="sim" id="violencia-sim" />
                    <Label htmlFor="violencia-sim" className="font-normal text-sm">Sim</Label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RadioGroupItem value="nao" id="violencia-nao" />
                    <Label htmlFor="violencia-nao" className="font-normal text-sm">Não</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        )}

        {activeSection === "referral" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={addEncaminhamento} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar encaminhamento
              </Button>
            </div>
            
            {encaminhamentos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-slate-50">
                <Send className="h-10 w-10 text-slate-300 mb-4" />
                <p className="text-muted-foreground">Nenhum encaminhamento adicionado</p>
                <p className="text-sm text-muted-foreground">
                  Clique em {"\""} + Adicionar encaminhamento{"\""} para registrar um encaminhamento.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {encaminhamentos.map((enc) => (
                  <div key={enc.id} className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
                    {/* Row 1: Especialidade + Prioridade + Remove */}
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-2">
                        <Label>Especialidade</Label>
                        <Select 
                          value={enc.especialidade} 
                          onValueChange={(v) => {
                            setEncaminhamentos(encaminhamentos.map(e => 
                              e.id === enc.id ? { ...e, especialidade: v } : e
                            ))
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a especialidade..." />
                          </SelectTrigger>
                          <SelectContent>
                            {especialidades.map(esp => (
                              <SelectItem key={esp} value={esp}>{esp}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-36 space-y-2">
                        <Label>Prioridade</Label>
                        <Select 
                          value={enc.prioridade} 
                          onValueChange={(v) => {
                            setEncaminhamentos(encaminhamentos.map(e => 
                              e.id === enc.id ? { ...e, prioridade: v as PrioridadeEncaminhamento } : e
                            ))
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Eletivo">Eletivo</SelectItem>
                            <SelectItem value="Prioritário">Prioritário</SelectItem>
                            <SelectItem value="Urgente">Urgente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {enc.prioridade && (
                        <Badge className={cn(
                          "mt-8",
                          enc.prioridade === "Eletivo" && "bg-slate-100 text-slate-600",
                          enc.prioridade === "Prioritário" && "bg-amber-100 text-amber-800",
                          enc.prioridade === "Urgente" && "bg-red-100 text-red-800"
                        )}>
                          {enc.prioridade}
                        </Badge>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="mt-6 text-slate-400 hover:text-red-500"
                        onClick={() => removeEncaminhamento(enc.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Row 2: Procedimento */}
                    <div className="space-y-2">
                      <Label>Procedimento / Motivo</Label>
                      <Input 
                        placeholder="Descreva o procedimento ou motivo do encaminhamento"
                        value={enc.procedimento}
                        onChange={(e) => {
                          setEncaminhamentos(encaminhamentos.map(en => 
                            en.id === enc.id ? { ...en, procedimento: e.target.value } : en
                          ))
                        }}
                      />
                    </div>
                    
                    {/* Row 3: Justificativa */}
                    <div className="space-y-2">
                      <Label>Justificativa clínica</Label>
                      <Textarea 
                        placeholder="Justificativa clínica para o encaminhamento (será impressa no documento)"
                        rows={3}
                        value={enc.justificativa}
                        onChange={(e) => {
                          setEncaminhamentos(encaminhamentos.map(en => 
                            en.id === enc.id ? { ...en, justificativa: e.target.value } : en
                          ))
                        }}
                      />
                    </div>
                    
                    {/* Row 4: Actions */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Button 
                        variant="ghost" 
                        className="text-teal-700"
                        onClick={() => setShowEncaminhamentoDoc(enc)}
                      >
                        <Printer className="mr-2 h-4 w-4" />
                        Visualizar documento
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        O documento será gerado com os dados desta consulta.
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === "diagnostico" && (
          <div className="space-y-4">
            {!cidPrincipal && (
              <div className="flex flex-col items-center justify-center py-10 text-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50">
                <FileText className="h-8 w-8 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-500">Diagnóstico ainda não registrado</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">O CID-10 é obrigatório para encaminhamentos e faturamento. Preencha ao final da consulta.</p>
              </div>
            )}
            <div className="rounded-lg border border-slate-200 p-4 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">CID-10 Principal</p>
              <Input 
                id="cid-principal"
                placeholder="Ex: Z00.1 — Exame médico geral do lactente"
                value={cidPrincipal}
                onChange={(e) => setCidPrincipal(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                O CID-10 é obrigatório para encaminhamentos, laudos e faturamento.
              </p>
            </div>
            
            {/* CIDs Secundários */}
            <div className="space-y-2">
              <Label>CIDs Secundários</Label>
              {cidsSecundarios.map((cid, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input 
                    className="w-28"
                    placeholder="Código"
                    value={cid.codigo}
                    onChange={(e) => {
                      const newCids = [...cidsSecundarios]
                      newCids[index] = { ...newCids[index], codigo: e.target.value }
                      setCidsSecundarios(newCids)
                    }}
                  />
                  <Input 
                    className="flex-1"
                    placeholder="Descrição"
                    value={cid.descricao}
                    onChange={(e) => {
                      const newCids = [...cidsSecundarios]
                      newCids[index] = { ...newCids[index], descricao: e.target.value }
                      setCidsSecundarios(newCids)
                    }}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-slate-400 hover:text-red-500"
                    onClick={() => removeCidSecundario(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {cidsSecundarios.length < 5 ? (
                <Button variant="ghost" onClick={addCidSecundario} className="text-sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar CID secundário
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">Máximo de 5 CIDs secundários atingido.</p>
              )}
            </div>
            
            {/* SID */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="sid">SID</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sistema de Informação sobre Nascidos Vivos e similares.<br />Preencha quando houver código específico do serviço.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input 
                id="sid"
                placeholder="Código SID, se aplicável"
                value={sid}
                onChange={(e) => setSid(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Seção Hipóteses e Condutas */}
        {activeSection === "condutasHipoteses" && (
          <div className="space-y-6">
            {!hipotesesDiagnosticas && !condutas && (
              <div className="flex flex-col items-center justify-center py-10 text-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50">
                <ClipboardList className="h-8 w-8 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-500">Raciocínio clínico ainda não registrado</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">Registre as hipóteses diagnósticas e o plano de cuidado ao encerrar a consulta.</p>
              </div>
            )}
            <div className="rounded-lg border border-slate-200 p-4 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hipóteses Diagnósticas</p>
              <Textarea
                id="hipoteses"
                placeholder="Ex: 1. Asma brônquica (J45). 2. DRGE associada. 3. Rinite alérgica a investigar."
                rows={4}
                value={hipotesesDiagnosticas}
                onChange={(e) => setHipotesesDiagnosticas(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Este campo destina-se ao raciocínio clínico. O diagnóstico formal deve ser registrado na seção Diagnóstico.
              </p>
            </div>
            
            <div className="my-4" />
            
            <div className="rounded-lg border border-slate-200 p-4 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Condutas e Plano de Cuidado</p>
              <Textarea
                id="condutas"
                placeholder="Ex: 1. Manter dieta habitual. 2. Retorno em 30 dias. 3. Azitromicina 10mg/kg/dia por 3 dias. 4. Encaminhar Pneumologia."
                rows={6}
                value={condutas}
                onChange={(e) => setCondutas(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Inclua: orientações à família, prescrições, solicitação de exames, encaminhamentos e data do retorno.
              </p>
            </div>
          </div>
        )}

        {activeSection === "procedimentos" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
              <Label htmlFor="procedimentos-switch">Foram realizados procedimentos nesta consulta?</Label>
              <Switch 
                id="procedimentos-switch"
                checked={procedimentosAtivos}
                onCheckedChange={setProcedimentosAtivos}
              />
            </div>
            
            {procedimentosAtivos && (
              <div className="space-y-4">
                <Button variant="outline" onClick={addProcedimento}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar procedimento
                </Button>
                
                {procedimentos.map((proc) => (
                  <div key={proc.id} className="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-3 relative">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                      onClick={() => removeProcedimento(proc.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-2">
                        <Label>Procedimento</Label>
                        <Select 
                          value={proc.nome}
                          onValueChange={(v) => {
                            setProcedimentos(procedimentos.map(p => 
                              p.id === proc.id ? { ...p, nome: v } : p
                            ))
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o procedimento" />
                          </SelectTrigger>
                          <SelectContent>
                            {procedimentosLista.map(p => (
                              <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-20 space-y-2">
                        <Label>Qtd.</Label>
                        <Input 
                          type="number"
                          min={1}
                          max={99}
                          value={proc.quantidade}
                          onChange={(e) => {
                            setProcedimentos(procedimentos.map(p => 
                              p.id === proc.id ? { ...p, quantidade: parseInt(e.target.value) || 1 } : p
                            ))
                          }}
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Label>CID vinculado</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Procedimentos devem estar vinculados a um diagnóstico para fins de faturamento SUS.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input 
                          value={proc.cidVinculado}
                          onChange={(e) => {
                            setProcedimentos(procedimentos.map(p => 
                              p.id === proc.id ? { ...p, cidVinculado: e.target.value } : p
                            ))
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Observações</Label>
                      <Textarea 
                        placeholder="Intercorrências ou detalhes do procedimento (opcional)"
                        rows={2}
                        value={proc.observacoes}
                        onChange={(e) => {
                          setProcedimentos(procedimentos.map(p => 
                            p.id === proc.id ? { ...p, observacoes: e.target.value } : p
                          ))
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === "externo" && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Data da consulta externa</Label>
                <Input 
                  type="date"
                  value={dataConsultaExterna}
                  onChange={(e) => setDataConsultaExterna(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Serviço de origem</Label>
                <Input 
                  placeholder="Ex: UBS Mangueira, Clínica São Lucas"
                  value={servicoOrigem}
                  onChange={(e) => setServicoOrigem(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Peso (kg)</Label>
                <Input 
                  type="number"
                  step="0.1"
                  placeholder="Ex: 10,9"
                  value={pesoExterno}
                  onChange={(e) => setPesoExterno(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Altura (cm)</Label>
                <Input 
                  type="number"
                  placeholder="Ex: 81"
                  value={alturaExterna}
                  onChange={(e) => setAlturaExterna(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Observações clínicas</Label>
              <Textarea 
                placeholder="Informações relevantes do atendimento externo (diagnósticos, condutas, medicações...)"
                rows={3}
                value={observacoesExternas}
                onChange={(e) => setObservacoesExternas(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Como os dados foram obtidos *</Label>
              <Textarea 
                placeholder="Ex: Dados fornecidos pela mãe a partir de caderneta física trazida na consulta de hoje"
                rows={2}
                value={origemDados}
                onChange={(e) => setOrigemDados(e.target.value)}
              />
            </div>
            
            <Button variant="outline" className="w-full" onClick={handleRegistrarDadosExternos}>
              <Save className="mr-2 h-4 w-4" />
              Registrar dados externos
            </Button>
            
            {/* List of registered external consultations */}
            {consultasExternas.length > 0 && (
              <div className="pt-4 border-t space-y-2">
                <Label className="text-muted-foreground">Dados externos registrados nesta sessão:</Label>
                {consultasExternas.map((ext) => (
                  <div key={ext.id} className="flex items-center justify-between p-2 bg-slate-50 rounded border">
                    <div className="text-sm">
                      <span className="font-medium">{ext.servicoOrigem}</span>
                      <span className="text-muted-foreground"> — {ext.dataConsulta}</span>
                      {ext.peso && <span className="ml-2">Peso: {ext.peso}kg</span>}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-slate-400 hover:text-red-500"
                      onClick={() => removeConsultaExterna(ext.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Render navigation item indicator
  const renderIndicator = (sectionId: SecaoId) => {
    const isActive = activeSection === sectionId
    const isComplete = isSectionComplete(sectionId)
    const isVisited = visitedSections.has(sectionId)

    if (isComplete) {
      return (
        <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center shrink-0 shadow-sm">
          <Check className="h-3.5 w-3.5 text-white" />
        </div>
      )
    }
    
    if (isVisited) {
      return (
        <div className="w-6 h-6 rounded-full border-2 border-teal-500 bg-teal-50 shrink-0" />
      )
    }
    
    return (
      <div className="w-6 h-6 rounded-full border-2 border-slate-300 bg-white shrink-0" />
    )
  }

  return (
    <MainLayout title="Formulário de Consulta">
      <TooltipProvider>
        {/* Sticky Top Bar */}
        <div className={cn(
          "sticky top-0 z-40 -mx-6 -mt-6 border-b px-4 md:px-6 py-2",
          isReopening
            ? "bg-amber-50 border-amber-300"
            : "bg-background border-b"
        )}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              {isReopening && (
                <div className="flex items-center gap-1.5 text-amber-700 shrink-0">
                  <RotateCcw className="h-4 w-4" />
                  <span className="text-sm font-medium hidden sm:inline">
                    Modo edição — {reopenDate}
                  </span>
                </div>
              )}
              <span className="font-medium truncate">{currentPatient.name}</span>
              {!isReopening && (
                <Badge className="bg-blue-100 text-blue-800 shrink-0 hidden sm:inline-flex">Consulta em andamento</Badge>
              )}
              <div className="hidden lg:block">
                <ConsultationTimer seconds={consultationSeconds} />
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="ghost" size="sm" onClick={handleSaveDraft} disabled={isSaving} className="hidden md:inline-flex">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Rascunho"
                )}
              </Button>
              <Button 
                size="sm" 
                onClick={() => setShowFinalizeDialog(true)}
                className={cn(isReopening ? "bg-amber-600 hover:bg-amber-700" : "bg-teal-600 hover:bg-teal-700")}
              >
                {isReopening ? "Salvar Edição" : "Finalizar Consulta"}
              </Button>
            </div>
          </div>
        </div>

        {/* Audit banner for reopen mode */}
        {isReopening && (
          <div className="flex items-center gap-3 rounded-lg border-2 border-amber-300 bg-amber-50 px-4 py-3 text-sm mt-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-semibold text-amber-800">
                Editando registro de {reopenDate} — modo de reabertura
              </p>
              <p className="text-amber-700 text-xs mt-0.5">
                Todas as alterações serão registradas com data e hora no momento da finalização.
              </p>
            </div>
          </div>
        )}

        {/* Mobile navigation - removed, using bottom nav instead */}
        
        {/* Two-column layout - fixed height, scroll only in content */}
        <div className="flex gap-6 pt-4 h-[calc(100vh-8rem)] overflow-hidden">
          {/* Left column: Navigation (hidden on mobile) - fixed, no scroll */}
          <div className="hidden md:block w-64 shrink-0 overflow-hidden">
            <div className="space-y-3 pb-4 pt-8">
              {/* Progress indicator */}
              {(() => {
                const completed = secoes.filter(s => isSectionComplete(s.id)).length
                const total = secoes.length
                const pct = Math.round((completed / total) * 100)
                return (
                  <div className="px-2 pb-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{completed} / {total} seções completas</span>
                      <span className="font-medium text-teal-700">{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                )
              })()}
              
              {/* Group 1: Formulário Clínico */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-2 mb-2">
                  Formulário Clínico
                </p>
                {secoes.filter(s => s.group === "formulario").map((secao) => {
                  const isActive = activeSection === secao.id
                  const summary = getSectionSummary(secao.id)
                  
                  return (
                    <button
                      key={secao.id}
                      onClick={() => handleSectionChange(secao.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg transition-all",
                        isActive
                          ? "bg-teal-50 border-l-4 border-l-teal-700"
                          : "hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {renderIndicator(secao.id)}
                        <div className="min-w-0 flex-1">
                          <p className={cn(
                            "text-sm",
                            isActive ? "text-teal-800 font-semibold" : "font-medium text-slate-700"
                          )}>
                            {secao.label}
                          </p>
                          {summary && (
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {summary}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              <Separator />

              {/* Group 2: Registro */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-2 mb-2">
                  Registro
                </p>
                {secoes.filter(s => s.group === "registro").map((secao) => {
                  const isActive = activeSection === secao.id
                  const summary = getSectionSummary(secao.id)
                  
                  return (
                    <button
                      key={secao.id}
                      onClick={() => handleSectionChange(secao.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg transition-all",
                        isActive
                          ? "bg-teal-50 border-l-4 border-l-teal-700"
                          : "hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {renderIndicator(secao.id)}
                        <div className="min-w-0 flex-1">
                          <p className={cn(
                            "text-sm",
                            isActive ? "text-teal-800 font-semibold" : "font-medium text-slate-700"
                          )}>
                            {secao.label}
                          </p>
                          {summary && (
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {summary}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right column: Content - only this has scroll */}
          <div className="flex-1 min-w-0 pb-24 md:pb-0 overflow-y-auto">
            <Card>
              <CardContent className="pt-6">
                {renderSectionContent()}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Finalize Confirmation Dialog */}
        <AlertDialog open={showFinalizeDialog} onOpenChange={setShowFinalizeDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {isReopening ? "Salvar edição de registro" : "Finalizar Atendimento"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isReopening
                  ? `Salvando edição do registro de ${reopenDate}. Uma nota de auditoria será incluída automaticamente.`
                  : `Encerrando o atendimento de ${currentPatient.name}.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex flex-col gap-3 py-2">
              <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={() => {
                setShowFinalizeDialog(false)
                handleOpenAGHU()
              }}>
                <Copy className="mr-2 h-4 w-4" />
                {isReopening ? "Copiar para AGHU e Salvar" : "Copiar para AGHU e Finalizar"}
              </Button>
              <Button variant="outline" className="w-full" onClick={confirmFinalize}>
                {isReopening ? "Salvar sem copiar" : "Finalizar sem copiar para AGHU"}
              </Button>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* AGHU Export Dialog */}
        <Dialog open={showAGHUDialog} onOpenChange={setShowAGHUDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Exportar para AGHU</DialogTitle>
              <DialogDescription>
                Copie o texto abaixo e cole no campo de evolução do AGHU. Após colar, assine com seu certificado Certbr.
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-auto max-h-[400px]">
              <Textarea 
                readOnly
                className="font-mono text-xs min-h-[400px]"
                value={generateAGHUText()}
              />
            </div>
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <span className="text-sm text-amber-800">
                Após colar no AGHU, assine digitalmente com seu certificado Certbr. A assinatura não é feita neste sistema.
              </span>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowAGHUDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCopyAGHU}>
                {copiedAGHU ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar texto
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Encaminhamento Document Dialog */}
        <Dialog open={!!showEncaminhamentoDoc} onOpenChange={() => setShowEncaminhamentoDoc(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Encaminhamento — {showEncaminhamentoDoc?.especialidade}</DialogTitle>
              <DialogDescription>
                Documento para entrega à família. Imprima ou copie o texto.
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-auto max-h-[350px]">
              <Textarea 
                readOnly
                className="font-mono text-sm min-h-[350px]"
                value={showEncaminhamentoDoc ? generateEncaminhamentoText(showEncaminhamentoDoc) : ""}
              />
            </div>
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <Printer className="h-4 w-4 text-amber-600 shrink-0" />
              <span className="text-sm text-amber-800">
                Para imprimir: cole o texto em um editor de texto e imprima.
              </span>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEncaminhamentoDoc(null)}>
                Fechar
              </Button>
              <Button onClick={() => showEncaminhamentoDoc && handleCopyEncaminhamento(showEncaminhamentoDoc)}>
                {copiedEncaminhamento ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar texto
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t px-2 py-2 safe-area-inset-bottom">
          <div className="flex items-center justify-around">
            {secoes.slice(0, 5).map((secao) => {
              const isActive = activeSection === secao.id
              const IconMap: Record<string, React.ElementType> = {
                anthropometric: Scale,
                anamnesis: FileText,
                imunizacoes: Shield,
                escolaridade: GraduationCap,
                triagemNeonatal: Baby,
                clinical: Stethoscope,
                milestones: Activity,
                mchat: Brain,
                historiaFamiliar: Users,
                dinamicaFamiliar: Home,
                socioeconomico: Home,
                referral: Send,
                diagnostico: FileText,
                condutasHipoteses: ClipboardList,
                procedimentos: Plus,
                externo: FileInput,
              }
              const Icon = IconMap[secao.id] || Circle
              return (
                <button
                  key={secao.id}
                  onClick={() => handleSectionChange(secao.id)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-2 py-1 rounded-md transition-colors min-w-[56px]",
                    isActive ? "text-teal-700 bg-teal-50" : "text-slate-500"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] leading-tight truncate max-w-[56px]">
                    {secao.label.split(" ")[0]}
                  </span>
                </button>
              )
            })}
            {/* More button */}
            <Select value={activeSection} onValueChange={(v) => handleSectionChange(v as SecaoId)}>
              <SelectTrigger className="w-auto h-auto border-0 shadow-none p-0">
                <div className="flex flex-col items-center gap-0.5 px-2 py-1 text-slate-500">
                  <Layers className="h-5 w-5" />
                  <span className="text-[10px] leading-tight">Mais</span>
                </div>
              </SelectTrigger>
              <SelectContent align="end">
                {secoes.map((secao) => (
                  <SelectItem key={secao.id} value={secao.id}>
                    {secao.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </TooltipProvider>
    </MainLayout>
  )
}
