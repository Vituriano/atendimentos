export type TipoEntrada = 'Retorno' | 'Egresso' | 'Encaminhamento Externo' | 'Internacao'
export type StatusFila = 'Aguardando' | 'Em Atendimento' | 'Finalizado' | 'Pendente' | 'Agendado'
export type SistemaStatus = 'normal' | 'alterado' | 'nao-avaliado'
export type TipoAlerta = 'critico' | 'atencao'
export type CategoriaAlerta = 'peso' | 'marco' | 'encaminhamento' | 'falta' | 'negligencia'
export type PrioridadeEncaminhamento = 'Alta' | 'Média' | 'Baixa'
export type StatusMarco = 'confirmed' | 'not-evaluated' | 'not-achieved' | 'not-verified'
export type StatusVacina = 'aplicada' | 'em-atraso'

export interface Prontuario {
  numero: string
  dataAbertura: string
  consultas: Consulta[]
  deletedAt?: string
}

export interface Paciente {
  id: string
  nome: string
  cpf?: string
  nomeCompleto?: string
  nomeMae?: string
  nomePai?: string
  dataNascimento: string
  idade: string
  idadeEmMeses: number
  sexo?: 'M' | 'F'
  sexoBiologico?: 'M' | 'F'
  cor?: string
  prontuario: string
  prontuarioPrimario?: string
  especialidade?: string
  indOrigem?: 'R' | 'EC' | 'E' | 'I'
  tipoEntrada?: TipoEntrada
  prontuarios?: Prontuario[]
  deletedAt?: string
}

export interface EntradaFila {
  id: string
  horario: string
  paciente: Paciente
  tipoEntrada: TipoEntrada
  status: StatusFila
  tempoEspera?: string | null
  faltas?: number
  deletedAt?: string
}

export interface SistemaExame {
  status: SistemaStatus | '';
  descricao: string
}

export interface ExameFisico {
  geral: SistemaExame;
  pele: SistemaExame;
  olhos: SistemaExame;
  ouvidos: SistemaExame;
  bocaDentes: SistemaExame; // <-- Atualizado
  cabeca: SistemaExame;     // <-- Atualizado
  ganglios: SistemaExame;   // <-- Novo
  pescoco: SistemaExame;    // <-- Atualizado
  cardiovascular: SistemaExame;
  respiratorio: SistemaExame;
  gastrointestinal: SistemaExame; // <-- Atualizado
  genitourinario: SistemaExame;
  musculoesqueletico: SistemaExame;
  nervoso: SistemaExame;          // <-- Atualizado
}

export interface CodigoCID {
  codigo: string
  descricao: string
  isPrincipal: boolean
}

export interface Diagnostico {
  cids: CodigoCID[]
}

export interface Procedimento {
  id: string
  nome: string
  quantidade: number
  cidVinculado: string
  observacoes: string
  deletedAt?: string
}

export interface Encaminhamento {
  id: string
  especialidade: string
  procedimento: string
  justificativa: string
  prioridade: PrioridadeEncaminhamento
  dataCriacao: string
  retornoConfirmado: boolean
  dataRetorno: string | null
  deletedAt?: string
}

export interface ConsultaExterna {
  id: string
  dataConsulta: string
  servicoOrigem: string
  peso: number | null
  altura: number | null
  observacoes: string
  origemDescricao: string
  deletedAt?: string
}

export interface Consulta {
  id?: string
  data: string
  tipo: TipoEntrada | 'externo'
  peso: number
  tendenciaPeso: 'up' | 'down' | 'stable'
  cid: string | null
  encaminhamento: string | null
  servicoOrigem?: string
  observacoes?: string
  isExterno?: boolean
  exameFisico?: ExameFisico
  diagnostico?: Diagnostico
  procedimentos?: Procedimento[]
  encaminhamentos?: Encaminhamento[]
  consultasExternas?: ConsultaExterna[]
  editadoEm?: string
  camposEditados?: string[]
  deletedAt?: string
}

export interface AlertaClinico {
  id: string
  tipo: TipoAlerta
  categoria: CategoriaAlerta
  mensagem: string
  deletedAt?: string
}

export interface DadosAntropometricos {
  peso: number
  percentilPeso: string
  altura: number
  percentilAltura: string
  perimetroCefalico: number | null
  imc: number
}

export interface PontoGrowth {
  idadeEmMeses: number
  valor: number
}

export interface Marco {
  id: string
  nome: string
  instrucao: string
  faixaEtariaMeses: [number, number]
}

export interface RegistroMarco {
  marcoId: string
  dataConsulta: string
  status: StatusMarco
  deletedAt?: string
}

export interface PerguntaMCHAT {
  id: number
  pergunta: string
  invertida: boolean
}
