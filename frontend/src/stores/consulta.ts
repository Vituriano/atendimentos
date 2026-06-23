import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'
import type { ExameFisico, SistemaExame, SistemaStatus } from '../types/clinica'

type SistemaStatusSelection = SistemaStatus | ''

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

export const useConsultaStore = defineStore('consulta', () => {
  const exameFisico = reactive<ExameFisicoForm>(createDefaultExameFisico())

  const avaliadosCount = computed(() =>
    Object.values(exameFisico).filter((sistema) => sistema.status === 'normal' || sistema.status === 'alterado').length,
  )

  const allStatusesSelected = computed(() =>
    Object.values(exameFisico).every((sistema) => sistema.status !== ''),
  )

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
    updateSistemaStatus,
    updateSistemaDescricao,
    resetExameFisico,
  }
})
