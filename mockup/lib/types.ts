export type EntryType = "Retorno" | "Egresso" | "Encaminhamento Externo" | "Internacao"
export type Status = "Aguardando" | "Em Atendimento" | "Finalizado" | "Pendente" | "Agendado"

// A single prontuario (record) belonging to a patient
export interface Prontuario {
  number: string           // e.g. "HC-2024-00847"
  openedDate: string       // e.g. "10/01/2024"
  consultations: Consultation[]
}

export interface Patient {
  id: string
  name: string
  birthDate: string
  age: string
  ageInMonths: number
  record: string           // kept for backward compatibility (= primaryRecord)
  cpf?: string
  prontuarios?: Prontuario[]  // multiple records
  primaryRecord?: string      // the most recent/active record number
}

export interface QueueEntry {
  id: string
  time: string
  patient: Patient
  entryType: EntryType
  status: Status
  waitTime: string | null
  faltas?: number
}

export interface Consultation {
  id?: string              // unique identifier for editing
  date: string
  type: EntryType | "externo"
  weight: number
  weightTrend: "up" | "down" | "stable"
  cid: string | null
  referral: string | null
  servicoOrigem?: string
  observacoes?: string
  isExterno?: boolean
  exameFisico?: ExameFisico
  diagnostico?: Diagnostico
  procedimentos?: Procedimento[]
  encaminhamentos?: Encaminhamento[]
  consultasExternas?: ConsultaExterna[]
  // Edit audit fields
  editedAt?: string        // ISO date string, present only if consultation was edited
  editedFields?: string[]  // list of field names that were changed
}

export interface Alert {
  type: "critical" | "warning"
  message: string
}

export interface AnthropometricData {
  weight: number
  weightPercentile: string
  height: number
  heightPercentile: string
  headCircumference: number | null
  bmi: number
}

export interface GrowthDataPoint {
  ageInMonths: number
  value: number
}

export interface Milestone {
  id: string
  name: string
  instruction: string
  ageRangeMonths: [number, number]
}

export interface MilestoneRecord {
  milestoneId: string
  consultationDate: string
  status: "confirmed" | "not-evaluated" | "not-achieved"
}

export interface MChatQuestion {
  id: number
  question: string
  inverted: boolean
}

// Exame físico por sistema
export type SistemaStatus = "normal" | "alterado" | "nao-avaliado"

export interface SistemaExame {
  status: SistemaStatus
  descricao: string // preenchido apenas quando status === "alterado"
}

export interface ExameFisico {
  cabecaPescoco: SistemaExame
  olhos: SistemaExame
  cardiovascular: SistemaExame
  respiratorio: SistemaExame
  abdomen: SistemaExame
  genitalia: SistemaExame
  pele: SistemaExame
  membrosColuna: SistemaExame
  neurologico: SistemaExame
}

// Diagnóstico
export interface CodigoCID {
  codigo: string  // ex: "Z00.1"
  descricao: string
  isPrincipal: boolean
}

export interface Diagnostico {
  cids: CodigoCID[]  // primeiro item é sempre o principal
  sid: string        // código SID ou string vazia
}

// Procedimentos
export interface Procedimento {
  id: string
  nome: string
  quantidade: number
  cidVinculado: string  // código CID
  observacoes: string
}

// Encaminhamento (substituir o tipo simples existente)
export type PrioridadeEncaminhamento = "Eletivo" | "Prioritário" | "Urgente"

export interface Encaminhamento {
  id: string
  especialidade: string
  procedimento: string
  justificativa: string
  prioridade: PrioridadeEncaminhamento
  dataCriacao: string
  retornoConfirmado: boolean
  dataRetorno: string | null
}

// Consulta externa (dados de outros serviços)
export interface ConsultaExterna {
  id: string
  dataConsulta: string
  servicoOrigem: string
  peso: number | null
  altura: number | null
  observacoes: string
  origemDescricao: string  // campo obrigatório explicando como os dados foram obtidos
}

// Alertas expandidos
export type TipoAlerta = "critico" | "atencao"
export type CategoriaAlerta =
  | "peso"
  | "marco"
  | "encaminhamento"
  | "falta"
  | "negligencia"

export interface AlertaExpandido {
  id: string
  tipo: TipoAlerta
  categoria: CategoriaAlerta
  mensagem: string
}
