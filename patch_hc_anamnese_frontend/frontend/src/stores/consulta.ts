import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { usePacienteStore } from './paciente'
import api from '../services/api'
import type { StatusMarco } from '../types/clinica'
import type { ClassificacaoImc } from '../data/antropometria-ranges'

export type ClassificacaoDesenvolvimento = 'adequado' | 'alerta' | 'provavel-atraso'

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

export type AbaAnamnese = 'clinica' | 'alimentacao' | 'habitos'

export interface AnamneseClinica {
  queixaPrincipal: string
  historiaDoencaAtual: string
  usoMedicamentos: string
  alergias: string
}

export interface AnamneseAlimentacao {
  aleitamentoMaterno: string
  introducaoAlimentar: string
  dietaAtual: string
  restricoes: string
}

export interface AnamneseHabitos {
  sono: string
  atividadeFisica: string
  usoTelas: string
  higiene: string
}

export interface DadosAnamneseConsulta {
  clinica: AnamneseClinica
  alimentacao: AnamneseAlimentacao
  habitos: AnamneseHabitos
  atualizadoEm: string | null
}

export type DadosAnamnesePayload = Omit<DadosAnamneseConsulta, 'atualizadoEm'>

function criarAnamneseVazia(): DadosAnamneseConsulta {
  return {
    clinica: {
      queixaPrincipal: '',
      historiaDoencaAtual: '',
      usoMedicamentos: '',
      alergias: '',
    },
    alimentacao: {
      aleitamentoMaterno: '',
      introducaoAlimentar: '',
      dietaAtual: '',
      restricoes: '',
    },
    habitos: {
      sono: '',
      atividadeFisica: '',
      usoTelas: '',
      higiene: '',
    },
    atualizadoEm: null,
  }
}

function possuiConteudoAnamnese(dados: DadosAnamneseConsulta | DadosAnamnesePayload): boolean {
  return [
    ...Object.values(dados.clinica),
    ...Object.values(dados.alimentacao),
    ...Object.values(dados.habitos),
  ].some(valor => valor.trim().length > 0)
}


interface AntropometriaApiResponse {
  id: number
  consulta_id: number
  peso_kg: number | null
  altura_cm: number | null
  perimetro_cefalico_cm: number | null
  pressao_sistolica_mmhg: number | null
  pressao_diastolica_mmhg: number | null
  imc: number | null
  classificacao_imc: ClassificacaoImc | null
  atualizado_em: string | null
}

interface ConsultaAtivaApiResponse {
  id: number
  paciente_id: string
  medico_username: string
  data: string
  status: string
  completed_sections: string[]
  antropometria: AntropometriaApiResponse | null
}

export interface DadosAntropometricosConsulta {
  pesoKg: number | null
  alturaCm: number | null
  perimetroCefalicoCm: number | null
  pressaoSistolicaMmHg: number | null
  pressaoDiastolicaMmHg: number | null
  imc: number | null
  classificacaoImc: ClassificacaoImc | null
  atualizadoEm: string | null
}


export const useConsultaStore = defineStore('consulta', () => {
  const pacienteStore = usePacienteStore()

  // Navegação entre seções
  const activeSection = ref<SecaoId>('anthropometric')
  const completedSections = ref(new Set<SecaoId>())
  const startedSections = ref(new Set<SecaoId>())
  const consultaIniciada = ref<Date | null>(null)
  const consultaAtivaId = ref<number | null>(null)
  const salvandoAntropometria = ref(false)
  const erroSalvamentoAntropometria = ref<string | null>(null)
  const antropometria = ref<DadosAntropometricosConsulta>({
    pesoKg: null,
    alturaCm: null,
    perimetroCefalicoCm: null,
    pressaoSistolicaMmHg: null,
    pressaoDiastolicaMmHg: null,
    imc: null,
    classificacaoImc: null,
    atualizadoEm: null,
  })
  const anamnese = ref<DadosAnamneseConsulta>(criarAnamneseVazia())

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

  // Marcos do desenvolvimento — chave composta: `${marcoId}-${idadeColuna}`
  const statusMarcos = ref<Record<string, StatusMarco | null>>({})
  const observacoesMarcos = ref<Record<string, string>>({})
  const classificacaoDesenvolvimento = ref<ClassificacaoDesenvolvimento | null>(null)

  const totalMarcosRegistrados = computed(
    () => Object.values(statusMarcos.value).filter(v => v !== null).length
  )

  function toggleStatusMarco(marcoId: string, idadeColuna: number, status: StatusMarco) {
    const key = `${marcoId}-${idadeColuna}`
    const atual = statusMarcos.value[key]
    statusMarcos.value = {
      ...statusMarcos.value,
      [key]: atual === status ? null : status,
    }
  }

  function getStatusMarco(marcoId: string, idadeColuna: number): StatusMarco | null {
    return statusMarcos.value[`${marcoId}-${idadeColuna}`] ?? null
  }

  function setObservacaoMarco(marcoId: string, obs: string) {
    observacoesMarcos.value = { ...observacoesMarcos.value, [marcoId]: obs }
  }

  function getObservacaoMarco(marcoId: string): string {
    return observacoesMarcos.value[marcoId] ?? ''
  }

  function setClassificacao(classificacao: ClassificacaoDesenvolvimento | null) {
    classificacaoDesenvolvimento.value = classificacao
  }

  // Funções de navegação
  function iniciarConsulta() {
    consultaIniciada.value = new Date()
    activeSection.value = 'anthropometric'
    completedSections.value = new Set()
    startedSections.value = new Set()
    anamnese.value = criarAnamneseVazia()
  }

  function setActiveSection(id: SecaoId) {
    activeSection.value = id
  }

  function markSectionStarted(id: SecaoId) {
    startedSections.value = new Set([...startedSections.value, id])
  }

  function markSectionComplete(id: SecaoId) {
    completedSections.value = new Set([...completedSections.value, id])
    markSectionStarted(id)
  }

  function setSectionComplete(id: SecaoId, completo: boolean) {
    const secoes = new Set(completedSections.value)
    if (completo) {
      secoes.add(id)
      markSectionStarted(id)
    } else {
      secoes.delete(id)
    }
    completedSections.value = secoes
  }

  function aplicarConsultaAtiva(response: ConsultaAtivaApiResponse | null) {
    if (!response) return

    consultaAtivaId.value = response.id
    consultaIniciada.value = new Date(response.data)
    completedSections.value = new Set(response.completed_sections as SecaoId[])
    startedSections.value = new Set(response.completed_sections as SecaoId[])

    if (response.antropometria) {
      antropometria.value = {
        pesoKg: response.antropometria.peso_kg,
        alturaCm: response.antropometria.altura_cm,
        perimetroCefalicoCm: response.antropometria.perimetro_cefalico_cm,
        pressaoSistolicaMmHg: response.antropometria.pressao_sistolica_mmhg,
        pressaoDiastolicaMmHg: response.antropometria.pressao_diastolica_mmhg,
        imc: response.antropometria.imc,
        classificacaoImc: response.antropometria.classificacao_imc,
        atualizadoEm: response.antropometria.atualizado_em,
      }
    }
  }

  async function carregarConsultaAtiva() {
    const pacienteId = pacienteStore.pacienteAtivo?.id
    if (!pacienteId) return null

    try {
      const { data } = await api.get<ConsultaAtivaApiResponse | null>(`/api/consultas/ativas/${pacienteId}`)
      aplicarConsultaAtiva(data)
      return data
    } catch (error) {
      console.error('Erro ao carregar consulta ativa:', error)
      return null
    }
  }

  async function salvarAntropometria(dados: Omit<DadosAntropometricosConsulta, 'atualizadoEm'>) {
    const pacienteId = pacienteStore.pacienteAtivo?.id
    if (!pacienteId) {
      throw new Error('Nenhum paciente ativo para salvar a antropometria.')
    }

    salvandoAntropometria.value = true
    erroSalvamentoAntropometria.value = null

    try {
      const { data } = await api.post<ConsultaAtivaApiResponse>('/api/consultas/antropometria', {
        paciente_id: pacienteId,
        peso_kg: dados.pesoKg,
        altura_cm: dados.alturaCm,
        perimetro_cefalico_cm: dados.perimetroCefalicoCm,
        pressao_sistolica_mmhg: dados.pressaoSistolicaMmHg,
        pressao_diastolica_mmhg: dados.pressaoDiastolicaMmHg,
        imc: dados.imc,
        classificacao_imc: dados.classificacaoImc,
      })

      aplicarConsultaAtiva(data)
      return data
    } catch (error) {
      erroSalvamentoAntropometria.value = 'Não foi possível salvar a antropometria no banco.'
      console.error('Erro ao salvar antropometria:', error)
      throw error
    } finally {
      salvandoAntropometria.value = false
    }
  }

  function atualizarStatusAnamnese() {
    const possuiConteudo = possuiConteudoAnamnese(anamnese.value)
    const possuiQueixaPrincipal = anamnese.value.clinica.queixaPrincipal.trim().length > 0

    if (possuiConteudo) {
      markSectionStarted('anamnesis')
    }

    setSectionComplete('anamnesis', possuiQueixaPrincipal)
  }

  function atualizarAnamnese(dados: DadosAnamnesePayload) {
    anamnese.value = {
      clinica: { ...dados.clinica },
      alimentacao: { ...dados.alimentacao },
      habitos: { ...dados.habitos },
      atualizadoEm: new Date().toISOString(),
    }
    atualizarStatusAnamnese()
  }

  function atualizarCampoAnamnese(aba: 'clinica', campo: keyof AnamneseClinica, valor: string): void
  function atualizarCampoAnamnese(aba: 'alimentacao', campo: keyof AnamneseAlimentacao, valor: string): void
  function atualizarCampoAnamnese(aba: 'habitos', campo: keyof AnamneseHabitos, valor: string): void
  function atualizarCampoAnamnese(aba: AbaAnamnese, campo: string, valor: string) {
    const dados: DadosAnamnesePayload = {
      clinica: { ...anamnese.value.clinica },
      alimentacao: { ...anamnese.value.alimentacao },
      habitos: { ...anamnese.value.habitos },
    }

    ;(dados[aba] as unknown as Record<string, string>)[campo] = valor
    atualizarAnamnese(dados)
  }

  function goNext() {
    if (canGoNext.value) {
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
    consultaAtivaId.value = null
    salvandoAntropometria.value = false
    erroSalvamentoAntropometria.value = null
    activeSection.value = 'anthropometric'
    completedSections.value = new Set()
    startedSections.value = new Set()
    statusMarcos.value = {}
    observacoesMarcos.value = {}
    classificacaoDesenvolvimento.value = null
    antropometria.value = {
      pesoKg: null,
      alturaCm: null,
      perimetroCefalicoCm: null,
      pressaoSistolicaMmHg: null,
      pressaoDiastolicaMmHg: null,
      imc: null,
      classificacaoImc: null,
      atualizadoEm: null,
    }
    anamnese.value = criarAnamneseVazia()
  }

  return {
    activeSection,
    completedSections,
    startedSections,
    consultaIniciada,
    consultaAtivaId,
    antropometria,
    anamnese,
    salvandoAntropometria,
    erroSalvamentoAntropometria,
    secoes,
    currentIndex,
    canGoPrev,
    canGoNext,
    statusMarcos,
    observacoesMarcos,
    classificacaoDesenvolvimento,
    totalMarcosRegistrados,
    iniciarConsulta,
    setActiveSection,
    markSectionStarted,
    markSectionComplete,
    setSectionComplete,
    carregarConsultaAtiva,
    salvarAntropometria,
    atualizarAnamnese,
    atualizarCampoAnamnese,
    goNext,
    goPrev,
    resetConsulta,
    toggleStatusMarco,
    getStatusMarco,
    setObservacaoMarco,
    getObservacaoMarco,
    setClassificacao,
  }
})
