import { defineStore } from 'pinia'
import { reactive, computed, ref } from 'vue'
import type { ExameFisico, Encaminhamento, PrioridadeEncaminhamento, SistemaExame, SistemaStatus } from '../types/clinica'
import { mchatPerguntas } from '../data/mchat-perguntas'

type SistemaStatusSelection = SistemaStatus | ''
type MchatAnswer = 'yes' | 'no' | null

type ExameFisicoForm = {
  [K in keyof ExameFisico]: Omit<SistemaExame, 'status'> & { status: SistemaStatusSelection }
}

function createDefaultSistema(): Omit<SistemaExame, 'status'> & { status: SistemaStatusSelection } {
  return {
    status: '',
    descricao: '',
  }
}

function createDefaultExameFisico(): ExameFisicoForm {
  return {
    geral: createDefaultSistema(),
    pele: createDefaultSistema(),
    cabecaPescoco: createDefaultSistema(),
    olhos: createDefaultSistema(),
    ouvidos: createDefaultSistema(),
    nariz: createDefaultSistema(),
    bocaGarganta: createDefaultSistema(),
    cardiovascular: createDefaultSistema(),
    respiratorio: createDefaultSistema(),
    abdome: createDefaultSistema(),
    genitourinario: createDefaultSistema(),
    extremidades: createDefaultSistema(),
    neurologico: createDefaultSistema(),
    musculoesqueletico: createDefaultSistema(),
  }
}

function createDefaultMchatAnswers(): Record<number, MchatAnswer> {
  return mchatPerguntas.reduce((acc, pergunta) => {
    acc[pergunta.id] = null
    return acc
  }, {} as Record<number, MchatAnswer>)
}

function createMchatEncaminhamento(risk: 'medium' | 'high'): Encaminhamento {
  const prioridade: PrioridadeEncaminhamento = risk === 'high' ? 'Urgente' : 'Prioritário'
  return {
    id: 'mchat-encaminhamento',
    especialidade: 'Neurologia',
    procedimento: 'Avaliação do desenvolvimento neuropsicomotor',
    justificativa: `Risco ${risk === 'high' ? 'alto' : 'médio'} no protocolo M-CHAT-R`,
    prioridade,
    dataCriacao: new Date().toLocaleDateString('pt-BR'),
    retornoConfirmado: false,
    dataRetorno: null,
  }
}

export const useConsultaStore = defineStore('consulta', () => {
  const exameFisico = reactive<ExameFisicoForm>(createDefaultExameFisico())
  const mchatAnswers = reactive<Record<number, MchatAnswer>>(createDefaultMchatAnswers())
  const encaminhamentos = ref<Encaminhamento[]>([])

  const avaliadosCount = computed(() =>
    Object.values(exameFisico).filter((sistema) => sistema.status === 'normal' || sistema.status === 'alterado').length,
  )

  const allStatusesSelected = computed(() =>
    Object.values(exameFisico).every((sistema) => sistema.status !== ''),
  )

  const mchatAnsweredCount = computed(() =>
    Object.values(mchatAnswers).filter((answer) => answer !== null).length,
  )

  const mchatScore = computed(() =>
    mchatPerguntas.reduce((sum, pergunta) => {
      return sum + (mchatAnswers[pergunta.id] === pergunta.riskAnswer ? 1 : 0)
    }, 0),
  )

  const mchatRiskLevel = computed(() => {
    if (Object.values(mchatAnswers).some((answer) => answer === null)) {
      return 'pending'
    }
    if (mchatScore.value <= 2) {
      return 'low'
    }
    if (mchatScore.value <= 7) {
      return 'medium'
    }
    return 'high'
  })

  const hasInvalidAlteradoDescricao = computed(() =>
    Object.values(exameFisico).some(
      (sistema) => sistema.status === 'alterado' && !sistema.descricao.trim(),
    ),
  )

  function updateSistemaStatus(id: keyof ExameFisico, status: SistemaStatusSelection) {
    exameFisico[id].status = status
  }

  function updateSistemaDescricao(id: keyof ExameFisico, descricao: string) {
    exameFisico[id].descricao = descricao
  }

  function updateMchatAnswer(questionId: number, answer: MchatAnswer) {
    mchatAnswers[questionId] = answer
    if (Object.values(mchatAnswers).every((value) => value !== null)) {
      if (mchatRiskLevel.value === 'medium' || mchatRiskLevel.value === 'high') {
        ensureMchatEncaminhamento(mchatRiskLevel.value)
      } else {
        removeMchatEncaminhamento()
      }
    } else {
      removeMchatEncaminhamento()
    }
  }

  function ensureMchatEncaminhamento(risk: 'medium' | 'high') {
    const existing = encaminhamentos.value.find((item) => item.id === 'mchat-encaminhamento')
    const referral = createMchatEncaminhamento(risk)
    if (existing) {
      const index = encaminhamentos.value.findIndex((item) => item.id === existing.id)
      encaminhamentos.value[index] = referral
    } else {
      encaminhamentos.value.push(referral)
    }
  }

  function removeMchatEncaminhamento() {
    encaminhamentos.value = encaminhamentos.value.filter((item) => item.id !== 'mchat-encaminhamento')
  }

  function resetMchatAnswers() {
    const novo = createDefaultMchatAnswers()
    Object.keys(novo).forEach((key) => {
      const id = Number(key)
      mchatAnswers[id] = novo[id]
    })
    removeMchatEncaminhamento()
  }

  function resetExameFisico() {
    const novo = createDefaultExameFisico()
    Object.keys(novo).forEach((key) => {
      const typedKey = key as keyof ExameFisico
      exameFisico[typedKey].status = novo[typedKey].status
      exameFisico[typedKey].descricao = novo[typedKey].descricao
    })
  }

  return {
    exameFisico,
    avaliadosCount,
    allStatusesSelected,
    hasInvalidAlteradoDescricao,
    mchatAnswers,
    mchatAnsweredCount,
    mchatScore,
    mchatRiskLevel,
    encaminhamentos,
    updateSistemaStatus,
    updateSistemaDescricao,
    updateMchatAnswer,
    resetMchatAnswers,
    resetExameFisico,
  }
})
