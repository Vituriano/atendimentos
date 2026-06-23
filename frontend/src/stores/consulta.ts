import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { usePacienteStore } from './paciente'

export type SecaoId =
  | 'anthropometric' | 'anamnesis' | 'imunizacoes' | 'triagemNeonatal'
  | 'escolaridade' | 'clinical' | 'milestones' | 'mchat'
  | 'historiaFamiliar' | 'dinamicaFamiliar' | 'socioeconomico'
  | 'referral' | 'diagnostico' | 'condutasHipoteses' | 'procedimentos' | 'externo'

export interface Secao {
  id: SecaoId
  label: string
  group: 'formulario' | 'registro'
}

export const useConsultaStore = defineStore('consulta', () => {
  const pacienteStore = usePacienteStore()

  const activeSection = ref<SecaoId>('anthropometric')
  const completedSections = ref(new Set<SecaoId>())
  const consultaIniciada = ref<Date | null>(null)

  const idadeEmMeses = computed(() => pacienteStore.pacienteAtivo?.idadeEmMeses ?? 0)
  const is0to2 = computed(() => idadeEmMeses.value <= 24)
  const is3to9 = computed(() => idadeEmMeses.value >= 36 && idadeEmMeses.value <= 108)
  const showMchat = computed(() => idadeEmMeses.value >= 16 && idadeEmMeses.value <= 30)

  const secoes = computed((): Secao[] => {
    const base: Secao[] = [
      { id: 'anthropometric', label: 'Antropometria', group: 'formulario' },
      { id: 'anamnesis', label: 'Anamnese', group: 'formulario' },
      { id: 'imunizacoes', label: 'Imunizações', group: 'formulario' },
    ]

    if (is0to2.value) {
      base.push({ id: 'triagemNeonatal', label: 'Triagem Neonatal', group: 'formulario' })
    }
    if (is3to9.value) {
      base.push({ id: 'escolaridade', label: 'Escolaridade', group: 'formulario' })
    }

    base.push(
      { id: 'clinical', label: 'Exame Físico', group: 'formulario' },
      { id: 'milestones', label: 'Marcos do Desenvolvimento', group: 'formulario' },
    )

    if (showMchat.value) {
      base.push({ id: 'mchat', label: 'M-CHAT-R', group: 'formulario' })
    }
    if (is3to9.value) {
      base.push(
        { id: 'historiaFamiliar', label: 'História Familiar', group: 'formulario' },
        { id: 'dinamicaFamiliar', label: 'Dinâmica Familiar', group: 'formulario' },
        { id: 'socioeconomico', label: 'Condições Socioeconômicas', group: 'formulario' },
      )
    }

    base.push(
      { id: 'referral', label: 'Encaminhamentos', group: 'formulario' },
      { id: 'diagnostico', label: 'Diagnóstico', group: 'registro' },
      { id: 'condutasHipoteses', label: 'Hipóteses e Condutas', group: 'registro' },
      { id: 'procedimentos', label: 'Procedimentos', group: 'registro' },
      { id: 'externo', label: 'Dados Externos', group: 'registro' },
    )

    return base
  })

  const currentIndex = computed(() => secoes.value.findIndex(s => s.id === activeSection.value))
  const canGoPrev = computed(() => currentIndex.value > 0)
  const canGoNext = computed(() => currentIndex.value < secoes.value.length - 1)

  function iniciarConsulta() {
    consultaIniciada.value = new Date()
    activeSection.value = 'anthropometric'
    completedSections.value = new Set()
  }

  function setActiveSection(id: SecaoId) {
    activeSection.value = id
  }

  function markSectionComplete(id: SecaoId) {
    completedSections.value = new Set([...completedSections.value, id])
  }

  function goNext() {
    if (canGoNext.value) {
      markSectionComplete(activeSection.value)
      activeSection.value = secoes.value[currentIndex.value + 1].id
    }
  }

  function goPrev() {
    if (canGoPrev.value) {
      activeSection.value = secoes.value[currentIndex.value - 1].id
    }
  }

  function resetConsulta() {
    consultaIniciada.value = null
    activeSection.value = 'anthropometric'
    completedSections.value = new Set()
  }

  return {
    activeSection,
    completedSections,
    consultaIniciada,
    secoes,
    currentIndex,
    canGoPrev,
    canGoNext,
    iniciarConsulta,
    setActiveSection,
    markSectionComplete,
    goNext,
    goPrev,
    resetConsulta,
  }
})
