<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import {
  CheckCircleIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import {
  useConsultaStore,
  type AbaAnamnese,
  type AnamneseAlimentacao,
  type AnamneseClinica,
  type AnamneseHabitos,
  type AntecedentesGestacionais,
  type AntecedentesPeriNeonatal,
  type ClassificacaoPesoNascimento,
  type ExameTrazido,
  type SorologiaGestacional,
  type ValorCampoAnamnese,
} from '../../stores/consulta'
import { usePacienteStore } from '../../stores/paciente'

type CampoInterrogatorio =
  | 'interrogatorioGeral'
  | 'interrogatorioPeleMucosas'
  | 'interrogatorioOlhos'
  | 'interrogatorioOuvidos'
  | 'interrogatorioBoca'
  | 'interrogatorioRespiratorio'
  | 'interrogatorioCardiovascular'
  | 'interrogatorioGastrointestinal'
  | 'interrogatorioGeniturinario'
  | 'interrogatorioMusculoEsqueletico'
  | 'interrogatorioSistemaNervoso'

interface SistemaInterrogatorio {
  id: string
  nome: string
  campo: CampoInterrogatorio
  placeholder: string
}

const consultaStore = useConsultaStore()
const pacienteStore = usePacienteStore()
const { pacienteAtivo } = storeToRefs(pacienteStore)
const activeTab = ref<AbaAnamnese>('clinica')
const mensagemSalvamento = ref<string | null>(null)

const abas: { id: AbaAnamnese; label: string }[] = [
  { id: 'clinica', label: 'Clínico' },
  { id: 'alimentacao', label: 'Alimentação' },
  { id: 'habitos', label: 'Hábitos' },
]

const opcoesAleitamento = [
  { value: 'aleitamento-exclusivo', label: 'Aleitamento materno exclusivo' },
  { value: 'aleitamento-misto', label: 'Aleitamento materno misto (mama + complemento)' },
  { value: 'formula-exclusiva', label: 'Fórmula exclusiva' },
  { value: 'introducao-alimentar', label: 'Introdução alimentar em andamento' },
  { value: 'dieta-familia', label: 'Dieta da família' },
]

const opcoesLocalSono = [
  { value: 'cama-propria', label: 'Cama própria' },
  { value: 'cama-pais', label: 'Cama dos pais' },
  { value: 'berco-quarto-pais', label: 'Berço no quarto dos pais' },
  { value: 'outro', label: 'Outro' },
]

const dispositivosTela = ['TV', 'Celular', 'Tablet', 'Computador']

const opcoesTipoParto = [
  { value: 'vaginal', label: 'Vaginal' },
  { value: 'cesarea', label: 'Cesárea' },
]

const opcoesResultadoSorologia = [
  { value: 'reagente', label: 'Reagente' },
  { value: 'nao-reagente', label: 'Não reagente' },
  { value: 'nao-realizado', label: 'Não realizado' },
]

const opcoesOrtolani = [
  { value: 'positivo', label: 'Positivo' },
  { value: 'negativo', label: 'Negativo' },
  { value: 'nao-realizado', label: 'Não realizado' },
]

const opcoesClassificacaoPesoNascimento: { value: ClassificacaoPesoNascimento; label: string }[] = [
  { value: 'aig', label: 'AIG — Adequado para Idade Gestacional' },
  { value: 'pig', label: 'PIG — Pequeno para Idade Gestacional' },
  { value: 'gig', label: 'GIG — Grande para Idade Gestacional' },
]

const interrogSistemas: SistemaInterrogatorio[] = [
  {
    id: 'geral',
    nome: 'Geral',
    campo: 'interrogatorioGeral',
    placeholder: 'Febre, fadiga, perda de peso, apetite...',
  },
  {
    id: 'pele-mucosas',
    nome: 'Pele e mucosas',
    campo: 'interrogatorioPeleMucosas',
    placeholder: 'Lesões, prurido, icterícia, palidez...',
  },
  {
    id: 'olhos',
    nome: 'Olhos',
    campo: 'interrogatorioOlhos',
    placeholder: 'Secreção, vermelhidão, lacrimejamento...',
  },
  {
    id: 'ouvidos',
    nome: 'Ouvidos',
    campo: 'interrogatorioOuvidos',
    placeholder: 'Otalgia, otorreia, hipoacusia...',
  },
  {
    id: 'boca',
    nome: 'Boca',
    campo: 'interrogatorioBoca',
    placeholder: 'Dor, lesões, alterações de dentes ou gengivas...',
  },
  {
    id: 'respiratorio',
    nome: 'Respiratório',
    campo: 'interrogatorioRespiratorio',
    placeholder: 'Tosse, dispneia, chiado, coriza...',
  },
  {
    id: 'cardiovascular',
    nome: 'Cardiovascular',
    campo: 'interrogatorioCardiovascular',
    placeholder: 'Cianose, dor torácica, palpitações, edema...',
  },
  {
    id: 'gastrointestinal',
    nome: 'Gastrointestinal',
    campo: 'interrogatorioGastrointestinal',
    placeholder: 'Vômitos, diarreia, dor abdominal, constipação...',
  },
  {
    id: 'geniturinario',
    nome: 'Geniturinário',
    campo: 'interrogatorioGeniturinario',
    placeholder: 'Disúria, alterações urinárias, corrimento...',
  },
  {
    id: 'musculo-esqueletico',
    nome: 'Músculo-esquelético',
    campo: 'interrogatorioMusculoEsqueletico',
    placeholder: 'Dor, limitação, edema, alteração de marcha...',
  },
  {
    id: 'sistema-nervoso',
    nome: 'Sistema Nervoso',
    campo: 'interrogatorioSistemaNervoso',
    placeholder: 'Cefaleia, convulsões, fraqueza, alterações de comportamento...',
  },
]

const secaoIniciada = computed(() => consultaStore.startedSections.has('anamnesis'))
const secaoCompleta = computed(() => consultaStore.completedSections.has('anamnesis'))
const totalCamposPreenchidos = computed(() => contarValores([
  ...Object.values(consultaStore.anamnese.clinica),
  ...Object.values(consultaStore.anamnese.alimentacao),
  ...Object.values(consultaStore.anamnese.habitos),
]))
const sistemasSelecionados = computed(() => consultaStore.anamnese.clinica.sistemasInterrogatorioAlterados)
const sistemasSelecionadosDetalhe = computed(() =>
  interrogSistemas.filter(sistema => sistemasSelecionados.value.includes(sistema.id))
)
const possuiAlertaSono = computed(() => {
  const texto = consultaStore.anamnese.habitos.sonoAlteracoes.toLowerCase()
  return texto.includes('ronco') || texto.includes('apneia')
})

function valorPreenchido(valor: unknown): boolean {
  if (typeof valor === 'string') return valor.trim().length > 0
  if (typeof valor === 'boolean') return valor
  if (Array.isArray(valor)) return valor.length > 0
  return false
}

function contarValores(valores: unknown[]): number {
  return valores.filter(valorPreenchido).length
}

function valorCampo(event: Event): string {
  return (event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value
}

function setClinica(campo: keyof AnamneseClinica, valor: ValorCampoAnamnese) {
  mensagemSalvamento.value = null
  consultaStore.atualizarCampoAnamnese('clinica', campo, valor as AnamneseClinica[keyof AnamneseClinica])
}

function setAlimentacao(campo: keyof AnamneseAlimentacao, valor: ValorCampoAnamnese) {
  mensagemSalvamento.value = null
  consultaStore.atualizarCampoAnamnese('alimentacao', campo, valor as AnamneseAlimentacao[keyof AnamneseAlimentacao])
}

function setHabitos(campo: keyof AnamneseHabitos, valor: ValorCampoAnamnese) {
  mensagemSalvamento.value = null
  consultaStore.atualizarCampoAnamnese('habitos', campo, valor as AnamneseHabitos[keyof AnamneseHabitos])
}

function setAntecedentesGestacionais<K extends keyof AntecedentesGestacionais>(campo: K, valor: AntecedentesGestacionais[K]) {
  const atual = consultaStore.anamnese.clinica.antecedentesPerinatais
  setClinica('antecedentesPerinatais', {
    ...atual,
    gestacional: { ...atual.gestacional, [campo]: valor },
  })
}

function setSorologiaGestacional<K extends keyof SorologiaGestacional>(campo: K, valor: SorologiaGestacional[K]) {
  const atual = consultaStore.anamnese.clinica.antecedentesPerinatais
  setClinica('antecedentesPerinatais', {
    ...atual,
    gestacional: {
      ...atual.gestacional,
      sorologias: { ...atual.gestacional.sorologias, [campo]: valor },
    },
  })
}

function setAntecedentesPeriNeonatal<K extends keyof AntecedentesPeriNeonatal>(campo: K, valor: AntecedentesPeriNeonatal[K]) {
  const atual = consultaStore.anamnese.clinica.antecedentesPerinatais
  setClinica('antecedentesPerinatais', {
    ...atual,
    periNeonatal: { ...atual.periNeonatal, [campo]: valor },
  })
}

function criarExameTrazidoVazio(): ExameTrazido {
  return {
    localId: `exame-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    exame: '',
    analise: '',
  }
}

function adicionarExameTrazido() {
  mensagemSalvamento.value = null
  const lista = [...consultaStore.anamnese.clinica.examesTrazidos, criarExameTrazidoVazio()]
  setClinica('examesTrazidos', lista)
}

function removerExameTrazido(localId: string) {
  mensagemSalvamento.value = null
  const lista = consultaStore.anamnese.clinica.examesTrazidos.filter(item => item.localId !== localId)
  setClinica('examesTrazidos', lista)
}

function atualizarExameTrazido(localId: string, campo: 'exame' | 'analise', valor: string) {
  mensagemSalvamento.value = null
  const lista = consultaStore.anamnese.clinica.examesTrazidos.map(item =>
    item.localId === localId ? { ...item, [campo]: valor } : item
  )
  setClinica('examesTrazidos', lista)
}

function valorInicialNumero(valor: number | null | undefined): string {
  return valor === null || valor === undefined ? '' : String(valor).replace('.', ',')
}

function parseNumeroPtBr(valor: string): number | null {
  const normalizado = valor.trim().replace(',', '.')
  if (!normalizado) return null
  const numero = Number(normalizado)
  return Number.isFinite(numero) ? numero : null
}

type CampoNumericoPeriNeonatal = 'idadeGestacionalSemanas' | 'pesoNascimentoGramas' | 'comprimentoNascimentoCm' | 'perimetroCefalicoCm'

let atualizandoPeriNeonatalNumeroPelaTela = false

const camposNumericosPeriNeonatal = reactive({
  idadeGestacionalSemanas: valorInicialNumero(consultaStore.anamnese.clinica.antecedentesPerinatais.periNeonatal.idadeGestacionalSemanas),
  pesoNascimentoGramas: valorInicialNumero(consultaStore.anamnese.clinica.antecedentesPerinatais.periNeonatal.pesoNascimentoGramas),
  comprimentoNascimentoCm: valorInicialNumero(consultaStore.anamnese.clinica.antecedentesPerinatais.periNeonatal.comprimentoNascimentoCm),
  perimetroCefalicoCm: valorInicialNumero(consultaStore.anamnese.clinica.antecedentesPerinatais.periNeonatal.perimetroCefalicoCm),
})

watch(
  () => consultaStore.anamnese.clinica.antecedentesPerinatais.periNeonatal,
  periNeonatal => {
    if (atualizandoPeriNeonatalNumeroPelaTela) return

    camposNumericosPeriNeonatal.idadeGestacionalSemanas = valorInicialNumero(periNeonatal.idadeGestacionalSemanas)
    camposNumericosPeriNeonatal.pesoNascimentoGramas = valorInicialNumero(periNeonatal.pesoNascimentoGramas)
    camposNumericosPeriNeonatal.comprimentoNascimentoCm = valorInicialNumero(periNeonatal.comprimentoNascimentoCm)
    camposNumericosPeriNeonatal.perimetroCefalicoCm = valorInicialNumero(periNeonatal.perimetroCefalicoCm)
  }
)

function atualizarPeriNeonatalNumero(campo: CampoNumericoPeriNeonatal, valor: string) {
  camposNumericosPeriNeonatal[campo] = valor

  atualizandoPeriNeonatalNumeroPelaTela = true
  setAntecedentesPeriNeonatal(campo, parseNumeroPtBr(valor))
  queueMicrotask(() => {
    atualizandoPeriNeonatalNumeroPelaTela = false
  })
}

const idadeGestacionalSemanas = computed(() => consultaStore.anamnese.clinica.antecedentesPerinatais.periNeonatal.idadeGestacionalSemanas)

const idadeGestacionalInvalida = computed(() => {
  const valor = idadeGestacionalSemanas.value
  return valor !== null && (valor < 20 || valor > 45)
})

const idadeCorrigidaTexto = computed(() => {
  const idadeGestacional = idadeGestacionalSemanas.value
  const idadeEmMeses = pacienteAtivo.value?.idadeEmMeses ?? 0
  if (!idadeGestacional || idadeGestacional >= 37) return ''

  const mesesParaCorrigir = Math.max(0, (40 - idadeGestacional) / 4.33)
  const idadeCorrigida = Math.max(0, idadeEmMeses - mesesParaCorrigir)
  return `${idadeCorrigida.toFixed(1).replace('.', ',')} meses`
})

function toggleSistemaInterrogatorio(id: string) {
  const selecionados = new Set(consultaStore.anamnese.clinica.sistemasInterrogatorioAlterados)
  if (selecionados.has(id)) {
    selecionados.delete(id)
  } else {
    selecionados.add(id)
  }
  setClinica('sistemasInterrogatorioAlterados', Array.from(selecionados))
}

function limparSistemasInterrogatorio() {
  setClinica('sistemasInterrogatorioAlterados', [])
}

function toggleDispositivo(dispositivo: string) {
  const dispositivos = new Set(consultaStore.anamnese.habitos.telasDispositivos)
  if (dispositivos.has(dispositivo)) {
    dispositivos.delete(dispositivo)
  } else {
    dispositivos.add(dispositivo)
  }
  setHabitos('telasDispositivos', Array.from(dispositivos))
}

async function salvarSecao() {
  if (consultaStore.salvandoAnamnese) return

  mensagemSalvamento.value = null
  try {
    await consultaStore.salvarAnamnese()
    mensagemSalvamento.value = 'Anamnese salva no banco para este paciente.'
  } catch {
    mensagemSalvamento.value = consultaStore.erroSalvamentoAnamnese ?? 'Não foi possível salvar a anamnese no banco.'
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="grid rounded-lg bg-slate-100 p-1 md:grid-cols-3">
      <button
        v-for="aba in abas"
        :key="aba.id"
        type="button"
        class="rounded-md px-4 py-2 text-sm font-medium transition"
        :class="activeTab === aba.id
          ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
          : 'text-slate-600 hover:bg-white/70'"
        @click="activeTab = aba.id"
      >
        {{ aba.label }}
      </button>
    </div>

    <template v-if="activeTab === 'clinica'">
      <section class="rounded-lg border border-slate-200 bg-white p-4 space-y-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Queixa e Doença Atual</p>

        <label class="block space-y-2">
          <span class="text-sm font-medium text-slate-900">Queixa Principal e Duração (QPD) <span class="text-red-500">*</span></span>
          <textarea
            :value="consultaStore.anamnese.clinica.queixaPrincipal"
            rows="3"
            placeholder="Ex: Tosse há 7 dias, febre nos últimos 2 dias"
            class="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            @input="setClinica('queixaPrincipal', valorCampo($event))"
          />
        </label>

        <label class="block space-y-2">
          <span class="text-sm font-medium text-slate-900">História da Doença Atual (HDA)</span>
          <textarea
            :value="consultaStore.anamnese.clinica.historiaDoencaAtual"
            rows="5"
            placeholder="Ex: Criança com 4 anos apresentou tosse produtiva há 7 dias, associada a febre vespertina (38,5°C)..."
            class="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            @input="setClinica('historiaDoencaAtual', valorCampo($event))"
          />
        </label>
      </section>

      <section class="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Interrogatório Sintomatológico</p>
          <span
            v-if="sistemasSelecionados.length > 0"
            class="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700"
          >
            {{ sistemasSelecionados.length }} sistema{{ sistemasSelecionados.length > 1 ? 's' : '' }} com alteração
          </span>
        </div>

        <div class="space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="text-sm text-slate-600">Clique nos sistemas com alterações encontradas:</p>
            <button
              v-if="sistemasSelecionados.length > 0"
              type="button"
              class="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-white hover:text-slate-700"
              @click="limparSistemasInterrogatorio"
            >
              Limpar
            </button>
          </div>

          <div class="flex flex-wrap gap-2">
            <button
              v-for="sistema in interrogSistemas"
              :key="sistema.id"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-full border-2 px-3.5 py-2 text-sm font-medium transition-all"
              :class="sistemasSelecionados.includes(sistema.id)
                ? 'border-amber-500 bg-amber-100 text-amber-800 shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'"
              @click="toggleSistemaInterrogatorio(sistema.id)"
            >
              <CheckIcon v-if="sistemasSelecionados.includes(sistema.id)" class="h-3.5 w-3.5" />
              {{ sistema.nome }}
            </button>
          </div>
        </div>

        <div v-if="sistemasSelecionadosDetalhe.length > 0" class="grid gap-4 md:grid-cols-2">
          <div v-for="sistema in sistemasSelecionadosDetalhe" :key="sistema.id" class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium text-slate-900">{{ sistema.nome }}</label>
              <button
                type="button"
                class="text-slate-400 hover:text-slate-600"
                :aria-label="`Remover ${sistema.nome}`"
                @click="toggleSistemaInterrogatorio(sistema.id)"
              >
                <XMarkIcon class="h-4 w-4" />
              </button>
            </div>
            <textarea
              :value="consultaStore.anamnese.clinica[sistema.campo]"
              rows="2"
              :placeholder="sistema.placeholder"
              class="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              @input="setClinica(sistema.campo, valorCampo($event))"
            />
          </div>
        </div>
      </section>

      <section class="rounded-lg border border-slate-200 bg-white p-4 space-y-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Medicações e Exames</p>

        <label class="block space-y-2">
          <span class="text-sm font-medium text-slate-900">Medicações de rotina</span>
          <textarea
            :value="consultaStore.anamnese.clinica.medicacoesRotina"
            rows="3"
            placeholder="Ex: Vitamina D 400UI/dia, Sulfato ferroso 25mg/dia, Fluconazol se necessário"
            class="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            @input="setClinica('medicacoesRotina', valorCampo($event))"
          />
        </label>

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-slate-900">Exames trazidos pelo paciente</span>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              @click="adicionarExameTrazido"
            >
              <PlusIcon class="h-3.5 w-3.5" />
              Adicionar exame
            </button>
          </div>

          <p
            v-if="consultaStore.anamnese.clinica.examesTrazidos.length === 0"
            class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-400"
          >
            Nenhum exame trazido registrado. Clique em “Adicionar exame” para registrar.
          </p>

          <article
            v-for="item in consultaStore.anamnese.clinica.examesTrazidos"
            :key="item.localId"
            class="rounded-lg border border-slate-200 bg-slate-50/50 p-3 space-y-2"
          >
            <div class="flex items-start justify-between gap-3">
              <input
                :value="item.exame"
                placeholder="Ex: Raio-X de tórax"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                @input="atualizarExameTrazido(item.localId, 'exame', ($event.target as HTMLInputElement).value)"
              />
              <button
                type="button"
                class="rounded-full p-1 text-slate-400 hover:bg-white hover:text-slate-600"
                title="Remover exame"
                @click="removerExameTrazido(item.localId)"
              >
                <XMarkIcon class="h-4 w-4" />
              </button>
            </div>
            <textarea
              :value="item.analise"
              rows="2"
              placeholder="Análise do médico sobre esse exame"
              class="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              @input="atualizarExameTrazido(item.localId, 'analise', ($event.target as HTMLTextAreaElement).value)"
            />
          </article>
        </div>

        <label class="block space-y-2">
          <span class="text-sm font-medium text-slate-900">Acompanhamentos</span>
          <textarea
            :value="consultaStore.anamnese.clinica.acompanhamentos"
            rows="3"
            placeholder="Ex: Acompanhamento com neuropediatra desde 2024; fonoaudiologia semanal"
            class="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            @input="setClinica('acompanhamentos', valorCampo($event))"
          />
        </label>
      </section>

      <section class="rounded-lg border border-slate-200 bg-white p-4 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Antecedentes Gestacionais e Perinatais</p>
          <span
            v-if="idadeCorrigidaTexto"
            class="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700"
          >
            Idade corrigida: {{ idadeCorrigidaTexto }}
          </span>
        </div>

        <div class="space-y-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Gestacional</p>

          <div class="space-y-2">
            <span class="text-sm font-medium text-slate-900">Gravidez planejada?</span>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 text-sm text-slate-900">
                <input
                  type="radio"
                  name="gravidez-planejada"
                  :checked="consultaStore.anamnese.clinica.antecedentesPerinatais.gestacional.gravidezPlanejada === true"
                  class="h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500"
                  @change="setAntecedentesGestacionais('gravidezPlanejada', true)"
                />
                Sim
              </label>
              <label class="flex items-center gap-2 text-sm text-slate-900">
                <input
                  type="radio"
                  name="gravidez-planejada"
                  :checked="consultaStore.anamnese.clinica.antecedentesPerinatais.gestacional.gravidezPlanejada === false"
                  class="h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500"
                  @change="setAntecedentesGestacionais('gravidezPlanejada', false)"
                />
                Não
              </label>
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <label class="space-y-2">
              <span class="text-sm font-medium text-slate-900">Local e número de consultas do Pré-natal</span>
              <input
                :value="consultaStore.anamnese.clinica.antecedentesPerinatais.gestacional.preNatalLocalConsultas"
                placeholder="Ex: UBS Bairro X, 7 consultas"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                @input="setAntecedentesGestacionais('preNatalLocalConsultas', valorCampo($event))"
              />
            </label>
            <label class="space-y-2">
              <span class="text-sm font-medium text-slate-900">Medicações durante a gestação</span>
              <input
                :value="consultaStore.anamnese.clinica.antecedentesPerinatais.gestacional.medicacoes"
                placeholder="Ex: Ácido fólico, sulfato ferroso"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                @input="setAntecedentesGestacionais('medicacoes', valorCampo($event))"
              />
            </label>
            <label class="space-y-2">
              <span class="text-sm font-medium text-slate-900">Comorbidades durante a gestação</span>
              <input
                :value="consultaStore.anamnese.clinica.antecedentesPerinatais.gestacional.comorbidadesGestacao"
                placeholder="Ex: Diabetes gestacional, pré-eclâmpsia"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                @input="setAntecedentesGestacionais('comorbidadesGestacao', valorCampo($event))"
              />
            </label>
            <label class="space-y-2">
              <span class="text-sm font-medium text-slate-900">Tabagismo materno</span>
              <input
                :value="consultaStore.anamnese.clinica.antecedentesPerinatais.gestacional.tabagismoMaterno"
                placeholder="Ex: Negado, ou quantidade/frequência"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                @input="setAntecedentesGestacionais('tabagismoMaterno', valorCampo($event))"
              />
            </label>
            <label class="space-y-2">
              <span class="text-sm font-medium text-slate-900">Etilismo materno</span>
              <input
                :value="consultaStore.anamnese.clinica.antecedentesPerinatais.gestacional.etilismoMaterno"
                placeholder="Ex: Negado, ou quantidade/frequência"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                @input="setAntecedentesGestacionais('etilismoMaterno', valorCampo($event))"
              />
            </label>
            <label class="space-y-2">
              <span class="text-sm font-medium text-slate-900">Outras drogas</span>
              <input
                :value="consultaStore.anamnese.clinica.antecedentesPerinatais.gestacional.outrasDrogas"
                placeholder="Ex: Negado"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                @input="setAntecedentesGestacionais('outrasDrogas', valorCampo($event))"
              />
            </label>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-medium text-slate-900">Sorologias maternas</p>
            <div class="grid gap-3 md:grid-cols-3">
              <label class="space-y-1">
                <span class="text-xs font-medium text-slate-700">VDRL</span>
                <select
                  :value="consultaStore.anamnese.clinica.antecedentesPerinatais.gestacional.sorologias.vdrl"
                  class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  @change="setSorologiaGestacional('vdrl', valorCampo($event))"
                >
                  <option value="">Selecione</option>
                  <option v-for="opcao in opcoesResultadoSorologia" :key="opcao.value" :value="opcao.value">{{ opcao.label }}</option>
                </select>
              </label>
              <label class="space-y-1">
                <span class="text-xs font-medium text-slate-700">HIV</span>
                <select
                  :value="consultaStore.anamnese.clinica.antecedentesPerinatais.gestacional.sorologias.hiv"
                  class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  @change="setSorologiaGestacional('hiv', valorCampo($event))"
                >
                  <option value="">Selecione</option>
                  <option v-for="opcao in opcoesResultadoSorologia" :key="opcao.value" :value="opcao.value">{{ opcao.label }}</option>
                </select>
              </label>
              <label class="space-y-1">
                <span class="text-xs font-medium text-slate-700">Hepatite B</span>
                <select
                  :value="consultaStore.anamnese.clinica.antecedentesPerinatais.gestacional.sorologias.hepatiteB"
                  class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  @change="setSorologiaGestacional('hepatiteB', valorCampo($event))"
                >
                  <option value="">Selecione</option>
                  <option v-for="opcao in opcoesResultadoSorologia" :key="opcao.value" :value="opcao.value">{{ opcao.label }}</option>
                </select>
              </label>
              <label class="space-y-1">
                <span class="text-xs font-medium text-slate-700">Hepatite C</span>
                <select
                  :value="consultaStore.anamnese.clinica.antecedentesPerinatais.gestacional.sorologias.hepatiteC"
                  class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  @change="setSorologiaGestacional('hepatiteC', valorCampo($event))"
                >
                  <option value="">Selecione</option>
                  <option v-for="opcao in opcoesResultadoSorologia" :key="opcao.value" :value="opcao.value">{{ opcao.label }}</option>
                </select>
              </label>
              <label class="space-y-1">
                <span class="text-xs font-medium text-slate-700">Toxoplasmose</span>
                <select
                  :value="consultaStore.anamnese.clinica.antecedentesPerinatais.gestacional.sorologias.toxoplasmose"
                  class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  @change="setSorologiaGestacional('toxoplasmose', valorCampo($event))"
                >
                  <option value="">Selecione</option>
                  <option v-for="opcao in opcoesResultadoSorologia" :key="opcao.value" :value="opcao.value">{{ opcao.label }}</option>
                </select>
              </label>
              <label class="space-y-1">
                <span class="text-xs font-medium text-slate-700">CMV</span>
                <select
                  :value="consultaStore.anamnese.clinica.antecedentesPerinatais.gestacional.sorologias.cmv"
                  class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  @change="setSorologiaGestacional('cmv', valorCampo($event))"
                >
                  <option value="">Selecione</option>
                  <option v-for="opcao in opcoesResultadoSorologia" :key="opcao.value" :value="opcao.value">{{ opcao.label }}</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        <div class="space-y-3 border-t border-slate-100 pt-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Peri e Neonatal</p>

          <div class="grid gap-4 md:grid-cols-2">
            <label class="space-y-2">
              <span class="text-sm font-medium text-slate-900">Tipo de parto</span>
              <select
                :value="consultaStore.anamnese.clinica.antecedentesPerinatais.periNeonatal.tipoParto"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                @change="setAntecedentesPeriNeonatal('tipoParto', valorCampo($event))"
              >
                <option value="">Selecione</option>
                <option v-for="opcao in opcoesTipoParto" :key="opcao.value" :value="opcao.value">{{ opcao.label }}</option>
              </select>
            </label>
            <label class="space-y-2">
              <span class="text-sm font-medium text-slate-900">Apgar</span>
              <input
                :value="consultaStore.anamnese.clinica.antecedentesPerinatais.periNeonatal.apgar"
                placeholder="Ex: 8/9"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                @input="setAntecedentesPeriNeonatal('apgar', valorCampo($event))"
              />
            </label>
          </div>

          <div class="space-y-2">
            <span class="text-sm font-medium text-slate-900">Necessidade de reanimação?</span>
            <div class="flex flex-wrap items-center gap-4">
              <label class="flex items-center gap-2 text-sm text-slate-900">
                <input
                  type="radio"
                  name="necessidade-reanimacao"
                  :checked="consultaStore.anamnese.clinica.antecedentesPerinatais.periNeonatal.necessidadeReanimacao === true"
                  class="h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500"
                  @change="setAntecedentesPeriNeonatal('necessidadeReanimacao', true)"
                />
                Sim
              </label>
              <label class="flex items-center gap-2 text-sm text-slate-900">
                <input
                  type="radio"
                  name="necessidade-reanimacao"
                  :checked="consultaStore.anamnese.clinica.antecedentesPerinatais.periNeonatal.necessidadeReanimacao === false"
                  class="h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500"
                  @change="setAntecedentesPeriNeonatal('necessidadeReanimacao', false)"
                />
                Não
              </label>
            </div>
            <input
              v-if="consultaStore.anamnese.clinica.antecedentesPerinatais.periNeonatal.necessidadeReanimacao === true"
              :value="consultaStore.anamnese.clinica.antecedentesPerinatais.periNeonatal.reanimacaoDetalhe"
              placeholder="Detalhe a reanimação realizada"
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              @input="setAntecedentesPeriNeonatal('reanimacaoDetalhe', valorCampo($event))"
            />
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-900" for="anamnese-idade-gestacional">Idade gestacional ao nascer (semanas)</label>
              <input
                id="anamnese-idade-gestacional"
                :value="camposNumericosPeriNeonatal.idadeGestacionalSemanas"
                type="text"
                inputmode="decimal"
                placeholder="Ex: 34"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                @input="atualizarPeriNeonatalNumero('idadeGestacionalSemanas', ($event.target as HTMLInputElement).value)"
              />
              <p v-if="idadeGestacionalInvalida" class="text-xs text-amber-700">Faixa esperada: 20 a 45 semanas.</p>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-900" for="anamnese-peso-nascimento">Peso ao nascimento (gramas)</label>
              <input
                id="anamnese-peso-nascimento"
                :value="camposNumericosPeriNeonatal.pesoNascimentoGramas"
                type="text"
                inputmode="decimal"
                placeholder="Ex: 2450"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                @input="atualizarPeriNeonatalNumero('pesoNascimentoGramas', ($event.target as HTMLInputElement).value)"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-900" for="anamnese-comprimento-nascimento">Comprimento ao nascimento (cm)</label>
              <input
                id="anamnese-comprimento-nascimento"
                :value="camposNumericosPeriNeonatal.comprimentoNascimentoCm"
                type="text"
                inputmode="decimal"
                placeholder="Ex: 47,5"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                @input="atualizarPeriNeonatalNumero('comprimentoNascimentoCm', ($event.target as HTMLInputElement).value)"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-900" for="anamnese-pc-nascimento">Perímetro cefálico ao nascimento (cm)</label>
              <input
                id="anamnese-pc-nascimento"
                :value="camposNumericosPeriNeonatal.perimetroCefalicoCm"
                type="text"
                inputmode="decimal"
                placeholder="Ex: 34,5"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                @input="atualizarPeriNeonatalNumero('perimetroCefalicoCm', ($event.target as HTMLInputElement).value)"
              />
            </div>
          </div>

          <div class="space-y-2">
            <span class="text-sm font-medium text-slate-900">Classificação do peso ao nascer</span>
            <div class="flex flex-wrap gap-4">
              <label
                v-for="opcao in opcoesClassificacaoPesoNascimento"
                :key="opcao.value"
                class="flex items-center gap-2 text-sm text-slate-900"
              >
                <input
                  type="radio"
                  name="classificacao-peso-nascimento"
                  :value="opcao.value"
                  :checked="consultaStore.anamnese.clinica.antecedentesPerinatais.periNeonatal.classificacaoPesoNascimento === opcao.value"
                  class="h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500"
                  @change="setAntecedentesPeriNeonatal('classificacaoPesoNascimento', opcao.value)"
                />
                {{ opcao.label }}
              </label>
            </div>
          </div>

          <label class="space-y-2">
            <span class="text-sm font-medium text-slate-900">Ortolani</span>
            <select
              :value="consultaStore.anamnese.clinica.antecedentesPerinatais.periNeonatal.ortolani"
              class="w-full max-w-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              @change="setAntecedentesPeriNeonatal('ortolani', valorCampo($event))"
            >
              <option value="">Selecione</option>
              <option v-for="opcao in opcoesOrtolani" :key="opcao.value" :value="opcao.value">{{ opcao.label }}</option>
            </select>
          </label>

          <label class="block space-y-2">
            <span class="text-sm font-medium text-slate-900">Exames (painel neonatal)</span>
            <textarea
              :value="consultaStore.anamnese.clinica.antecedentesPerinatais.periNeonatal.exames"
              rows="2"
              placeholder="Ex: Triagem metabólica normal"
              class="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              @input="setAntecedentesPeriNeonatal('exames', valorCampo($event))"
            />
          </label>

          <div class="grid gap-4 md:grid-cols-2">
            <label class="space-y-2">
              <span class="text-sm font-medium text-slate-900">Tipagem sanguínea materna</span>
              <input
                :value="consultaStore.anamnese.clinica.antecedentesPerinatais.periNeonatal.tipagemSanguineaMaterna"
                placeholder="Ex: O+"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                @input="setAntecedentesPeriNeonatal('tipagemSanguineaMaterna', valorCampo($event))"
              />
            </label>
            <label class="space-y-2">
              <span class="text-sm font-medium text-slate-900">Tipagem sanguínea do paciente</span>
              <input
                :value="consultaStore.anamnese.clinica.antecedentesPerinatais.periNeonatal.tipagemSanguineaPaciente"
                placeholder="Ex: A+"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                @input="setAntecedentesPeriNeonatal('tipagemSanguineaPaciente', valorCampo($event))"
              />
            </label>
            <label class="space-y-2">
              <span class="text-sm font-medium text-slate-900">VDRL (painel neonatal)</span>
              <select
                :value="consultaStore.anamnese.clinica.antecedentesPerinatais.periNeonatal.vdrlNeonatal"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                @change="setAntecedentesPeriNeonatal('vdrlNeonatal', valorCampo($event))"
              >
                <option value="">Selecione</option>
                <option v-for="opcao in opcoesResultadoSorologia" :key="opcao.value" :value="opcao.value">{{ opcao.label }}</option>
              </select>
            </label>
            <label class="space-y-2">
              <span class="text-sm font-medium text-slate-900">HIV (painel neonatal)</span>
              <select
                :value="consultaStore.anamnese.clinica.antecedentesPerinatais.periNeonatal.hivNeonatal"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                @change="setAntecedentesPeriNeonatal('hivNeonatal', valorCampo($event))"
              >
                <option value="">Selecione</option>
                <option v-for="opcao in opcoesResultadoSorologia" :key="opcao.value" :value="opcao.value">{{ opcao.label }}</option>
              </select>
            </label>
          </div>
        </div>
      </section>
    </template>

    <template v-else-if="activeTab === 'alimentacao'">
      <section class="rounded-lg border border-slate-200 bg-white p-4 space-y-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Tipo de Aleitamento</p>
        <select
          :value="consultaStore.anamnese.alimentacao.tipoAleitamento"
          class="w-full max-w-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          @change="setAlimentacao('tipoAleitamento', valorCampo($event))"
        >
          <option value="">Selecione o tipo de alimentação</option>
          <option v-for="opcao in opcoesAleitamento" :key="opcao.value" :value="opcao.value">
            {{ opcao.label }}
          </option>
        </select>
      </section>

      <section class="rounded-lg border border-slate-200 bg-white p-4 space-y-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Cardápio Diário</p>
        <div class="grid gap-4 md:grid-cols-2">
          <label class="space-y-2">
            <span class="text-sm font-medium text-slate-900">Café da manhã</span>
            <input
              :value="consultaStore.anamnese.alimentacao.cardapioCafe"
              placeholder="Ex: Leite com achocolatado, pão com manteiga"
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              @input="setAlimentacao('cardapioCafe', valorCampo($event))"
            />
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-slate-900">Lanche da manhã</span>
            <input
              :value="consultaStore.anamnese.alimentacao.cardapioLancheManha"
              placeholder="Ex: Fruta (banana), biscoito integral"
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              @input="setAlimentacao('cardapioLancheManha', valorCampo($event))"
            />
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-slate-900">Almoço</span>
            <input
              :value="consultaStore.anamnese.alimentacao.cardapioAlmoco"
              placeholder="Ex: Arroz, feijão, carne moída, legumes"
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              @input="setAlimentacao('cardapioAlmoco', valorCampo($event))"
            />
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-slate-900">Lanche da tarde</span>
            <input
              :value="consultaStore.anamnese.alimentacao.cardapioLancheTarde"
              placeholder="Ex: Iogurte, fruta picada"
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              @input="setAlimentacao('cardapioLancheTarde', valorCampo($event))"
            />
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-slate-900">Jantar</span>
            <input
              :value="consultaStore.anamnese.alimentacao.cardapioJantar"
              placeholder="Ex: Sopa de legumes com frango desfiado"
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              @input="setAlimentacao('cardapioJantar', valorCampo($event))"
            />
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-slate-900">Ceia</span>
            <input
              :value="consultaStore.anamnese.alimentacao.cardapioCeia"
              placeholder="Ex: Leite morno, mingau"
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              @input="setAlimentacao('cardapioCeia', valorCampo($event))"
            />
          </label>
        </div>
      </section>

      <section class="rounded-lg border border-slate-200 bg-white p-4 space-y-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Ambiente das Refeições</p>
        <div class="grid gap-4 md:grid-cols-2">
          <label class="space-y-2">
            <span class="text-sm font-medium text-slate-900">Local das refeições</span>
            <input
              :value="consultaStore.anamnese.alimentacao.localRefeicoes"
              placeholder="Ex: Mesa da cozinha, sala com TV"
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              @input="setAlimentacao('localRefeicoes', valorCampo($event))"
            />
          </label>
          <label class="flex items-center gap-3 pt-7 text-sm font-medium text-slate-900">
            <input
              type="checkbox"
              :checked="consultaStore.anamnese.alimentacao.usoTelaRefeicoes"
              class="h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              @change="setAlimentacao('usoTelaRefeicoes', ($event.target as HTMLInputElement).checked)"
            />
            Uso de tela durante as refeições
          </label>
        </div>
      </section>
    </template>

    <template v-else>
      <section class="rounded-lg border border-slate-200 bg-white p-4 space-y-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Rotina do Sono</p>
        <div class="grid gap-4 md:grid-cols-2">
          <label class="space-y-2">
            <span class="text-sm font-medium text-slate-900">Hora que dorme e acorda</span>
            <input
              :value="consultaStore.anamnese.habitos.sonoHorario"
              placeholder="Ex: Dorme 21h, acorda 7h"
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              @input="setHabitos('sonoHorario', valorCampo($event))"
            />
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-slate-900">Local onde dorme</span>
            <select
              :value="consultaStore.anamnese.habitos.sonoLocal"
              class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              @change="setHabitos('sonoLocal', valorCampo($event))"
            >
              <option value="">Selecione o local</option>
              <option v-for="opcao in opcoesLocalSono" :key="opcao.value" :value="opcao.value">
                {{ opcao.label }}
              </option>
            </select>
          </label>
        </div>
        <label class="block space-y-2">
          <span class="text-sm font-medium text-slate-900">Higiene do sono</span>
          <textarea
            :value="consultaStore.anamnese.habitos.sonoHigiene"
            rows="2"
            placeholder="Ex: Banho às 20h, história antes de dormir, sem tela 1h antes"
            class="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            @input="setHabitos('sonoHigiene', valorCampo($event))"
          />
        </label>
        <label class="block space-y-2">
          <span class="text-sm font-medium text-slate-900">Alterações do sono</span>
          <textarea
            :value="consultaStore.anamnese.habitos.sonoAlteracoes"
            rows="2"
            placeholder="Ex: Acorda 2x/noite, pesadelos frequentes, ronco"
            class="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            @input="setHabitos('sonoAlteracoes', valorCampo($event))"
          />
        </label>
        <div v-if="possuiAlertaSono" class="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-sm text-amber-800">
          <ExclamationTriangleIcon class="h-4 w-4 shrink-0 text-amber-600" />
          <span>Considere investigação adicional ou encaminhamento especializado.</span>
        </div>
      </section>

      <section class="rounded-lg border border-slate-200 bg-white p-4 space-y-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Exposição a Telas</p>
        <div class="space-y-3">
          <p class="text-sm font-medium text-slate-900">Dispositivos utilizados</p>
          <div class="flex flex-wrap gap-4">
            <label v-for="dispositivo in dispositivosTela" :key="dispositivo" class="flex items-center gap-2 text-sm text-slate-900">
              <input
                type="checkbox"
                :checked="consultaStore.anamnese.habitos.telasDispositivos.includes(dispositivo)"
                class="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                @change="toggleDispositivo(dispositivo)"
              />
              {{ dispositivo }}
            </label>
          </div>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <label class="space-y-2">
            <span class="text-sm font-medium text-slate-900">Tempo total diário de tela</span>
            <input
              :value="consultaStore.anamnese.habitos.telasTempoDiario"
              placeholder="Ex: 2 horas"
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              @input="setHabitos('telasTempoDiario', valorCampo($event))"
            />
          </label>
        </div>
      </section>

      <section class="rounded-lg border border-slate-200 bg-white p-4 space-y-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Outros Hábitos</p>
        <div class="space-y-2">
          <p class="text-sm font-medium text-slate-900">Uso de chupeta ou chupa-dedo</p>
          <div class="flex gap-4">
            <label class="flex items-center gap-2 text-sm text-slate-900">
              <input
                type="radio"
                name="chupeta-chupa-dedo"
                value="sim"
                :checked="consultaStore.anamnese.habitos.chupetaChupaDedo === 'sim'"
                class="h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500"
                @change="setHabitos('chupetaChupaDedo', 'sim')"
              />
              Sim
            </label>
            <label class="flex items-center gap-2 text-sm text-slate-900">
              <input
                type="radio"
                name="chupeta-chupa-dedo"
                value="nao"
                :checked="consultaStore.anamnese.habitos.chupetaChupaDedo === 'nao'"
                class="h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500"
                @change="setHabitos('chupetaChupaDedo', 'nao')"
              />
              Não
            </label>
          </div>
        </div>
        <label class="block space-y-2">
          <span class="text-sm font-medium text-slate-900">Higiene dentária</span>
          <textarea
            :value="consultaStore.anamnese.habitos.higieneDentaria"
            rows="2"
            placeholder="Ex: Escova 2x ao dia com pasta fluoretada, sem uso de fio dental"
            class="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            @input="setHabitos('higieneDentaria', valorCampo($event))"
          />
        </label>
        <label class="block space-y-2">
          <span class="text-sm font-medium text-slate-900">Atividades recreativas</span>
          <textarea
            :value="consultaStore.anamnese.habitos.atividadesRecreativas"
            rows="2"
            placeholder="Ex: Futebol 3x/semana com amigos na praça, jogos no tablet"
            class="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            @input="setHabitos('atividadesRecreativas', valorCampo($event))"
          />
        </label>
      </section>
    </template>

    <section class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div class="flex items-start gap-3 text-sm">
        <CheckCircleIcon
          v-if="secaoCompleta"
          class="mt-0.5 h-5 w-5 shrink-0 text-teal-600"
        />
        <ExclamationTriangleIcon
          v-else
          class="mt-0.5 h-5 w-5 shrink-0 text-amber-500"
        />
        <div>
          <p :class="secaoCompleta ? 'text-teal-700' : 'text-amber-700'">
            {{ secaoCompleta ? 'Queixa principal preenchida. A seção está completa.' : 'Preencha a queixa principal para completar a seção.' }}
          </p>
          <p class="mt-1 text-xs text-slate-400">
            <template v-if="secaoIniciada">
              Seção iniciada — {{ totalCamposPreenchidos }} campo{{ totalCamposPreenchidos === 1 ? '' : 's' }} preenchido{{ totalCamposPreenchidos === 1 ? '' : 's' }}.
            </template>
            <template v-else>
              A seção será marcada como iniciada ao preencher qualquer campo.
            </template>
          </p>
        </div>
      </div>

      <div class="flex flex-col items-stretch gap-2 md:items-end">
        <button
          v-if="false"
          class="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
          :class="secaoIniciada ? 'bg-teal-600 hover:bg-teal-700' : 'bg-slate-300'"
          :disabled="!secaoIniciada || consultaStore.salvandoAnamnese"
          @click="salvarSecao"
        >
          {{ consultaStore.salvandoAnamnese ? 'Salvando...' : 'Salvar seção' }}
        </button>
        <p v-if="consultaStore.erroSalvamentoAnamnese" class="text-xs text-red-600">
          {{ consultaStore.erroSalvamentoAnamnese }}
        </p>
        <p v-else-if="mensagemSalvamento" class="text-xs text-teal-700">
          {{ mensagemSalvamento }}
        </p>
        <p v-else class="text-xs text-slate-400">
          Os dados digitados ficam na tela; clique em Salvar Rascunho no topo da tela para gravar no banco.
        </p>
      </div>
    </section>
  </div>
</template>
