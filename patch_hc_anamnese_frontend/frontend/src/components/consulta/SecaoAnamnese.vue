<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  MoonIcon,
  SparklesIcon,
  UserCircleIcon,
} from '@heroicons/vue/24/outline'
import {
  useConsultaStore,
  type AbaAnamnese,
  type AnamneseAlimentacao,
  type AnamneseClinica,
  type AnamneseHabitos,
} from '../../stores/consulta'

interface CampoTexto<TCampo extends string> {
  campo: TCampo
  label: string
  placeholder: string
  required?: boolean
  rows?: number
}

const consultaStore = useConsultaStore()
const activeTab = ref<AbaAnamnese>('clinica')

const camposClinica: CampoTexto<keyof AnamneseClinica & string>[] = [
  {
    campo: 'queixaPrincipal',
    label: 'Queixa principal',
    placeholder: 'Ex.: Tosse há 7 dias, febre nos últimos 2 dias.',
    required: true,
    rows: 3,
  },
  {
    campo: 'historiaDoencaAtual',
    label: 'História da doença atual',
    placeholder: 'Descreva início, evolução, sintomas associados, fatores de melhora/piora e atendimentos prévios.',
    rows: 5,
  },
  {
    campo: 'usoMedicamentos',
    label: 'Uso de medicamentos',
    placeholder: 'Ex.: Vitamina D 400 UI/dia, sulfato ferroso, antitérmico nas últimas 24h.',
    rows: 3,
  },
  {
    campo: 'alergias',
    label: 'Alergias',
    placeholder: 'Registre alergias medicamentosas, alimentares ou ambientais. Se negar, registre “nega alergias conhecidas”.',
    rows: 3,
  },
]

const camposAlimentacao: CampoTexto<keyof AnamneseAlimentacao & string>[] = [
  {
    campo: 'aleitamentoMaterno',
    label: 'Aleitamento materno',
    placeholder: 'Ex.: Aleitamento exclusivo, misto, fórmula exclusiva, frequência das mamadas e intercorrências.',
    rows: 3,
  },
  {
    campo: 'introducaoAlimentar',
    label: 'Introdução alimentar',
    placeholder: 'Descreva início, aceitação, consistência dos alimentos e principais dificuldades.',
    rows: 3,
  },
  {
    campo: 'dietaAtual',
    label: 'Dieta atual',
    placeholder: 'Descreva rotina alimentar, refeições principais, lanches, líquidos e padrão geral da dieta.',
    rows: 4,
  },
  {
    campo: 'restricoes',
    label: 'Restrições',
    placeholder: 'Registre restrições alimentares, intolerâncias, dietas especiais ou orientações em acompanhamento.',
    rows: 3,
  },
]

const camposHabitos: CampoTexto<keyof AnamneseHabitos & string>[] = [
  {
    campo: 'sono',
    label: 'Sono',
    placeholder: 'Ex.: Dorme às 21h, acorda às 7h, despertares noturnos, ronco, rotina antes de dormir.',
    rows: 3,
  },
  {
    campo: 'atividadeFisica',
    label: 'Atividade física',
    placeholder: 'Descreva brincadeiras, escola, esportes, tempo ativo e limitações percebidas.',
    rows: 3,
  },
  {
    campo: 'usoTelas',
    label: 'Uso de telas',
    placeholder: 'Registre dispositivos usados, tempo diário aproximado, horários e uso durante refeições/sono.',
    rows: 3,
  },
  {
    campo: 'higiene',
    label: 'Higiene',
    placeholder: 'Descreva banho, higiene oral, desfralde, higiene do sono ou outros cuidados relevantes.',
    rows: 3,
  },
]

const abas = computed(() => [
  {
    id: 'clinica' as const,
    label: 'Clínica',
    description: 'Queixa principal, história da doença atual, medicamentos e alergias.',
    icon: UserCircleIcon,
    preenchidos: contarPreenchidos(Object.values(consultaStore.anamnese.clinica)),
  },
  {
    id: 'alimentacao' as const,
    label: 'Alimentação',
    description: 'Aleitamento, introdução alimentar, dieta atual e restrições.',
    icon: SparklesIcon,
    preenchidos: contarPreenchidos(Object.values(consultaStore.anamnese.alimentacao)),
  },
  {
    id: 'habitos' as const,
    label: 'Hábitos',
    description: 'Sono, atividade física, telas e higiene.',
    icon: MoonIcon,
    preenchidos: contarPreenchidos(Object.values(consultaStore.anamnese.habitos)),
  },
])

const abaAtual = computed(() => abas.value.find(aba => aba.id === activeTab.value) ?? abas.value[0])
const secaoIniciada = computed(() => consultaStore.startedSections.has('anamnesis'))
const secaoCompleta = computed(() => consultaStore.completedSections.has('anamnesis'))
const queixaPrincipalPreenchida = computed(() => consultaStore.anamnese.clinica.queixaPrincipal.trim().length > 0)
const totalCamposPreenchidos = computed(() => contarPreenchidos([
  ...Object.values(consultaStore.anamnese.clinica),
  ...Object.values(consultaStore.anamnese.alimentacao),
  ...Object.values(consultaStore.anamnese.habitos),
]))

function contarPreenchidos(valores: string[]): number {
  return valores.filter(valor => valor.trim().length > 0).length
}

function setClinica(campo: keyof AnamneseClinica, event: Event) {
  consultaStore.atualizarCampoAnamnese('clinica', campo, valorTextarea(event))
}

function setAlimentacao(campo: keyof AnamneseAlimentacao, event: Event) {
  consultaStore.atualizarCampoAnamnese('alimentacao', campo, valorTextarea(event))
}

function setHabitos(campo: keyof AnamneseHabitos, event: Event) {
  consultaStore.atualizarCampoAnamnese('habitos', campo, valorTextarea(event))
}

function valorTextarea(event: Event): string {
  return (event.target as HTMLTextAreaElement).value
}
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-6">
    <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="mb-6 flex items-start gap-4">
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
          <ClipboardDocumentListIcon class="h-6 w-6" />
        </div>
        <div class="space-y-1">
          <h3 class="text-base font-semibold text-slate-900">Anamnese da consulta</h3>
          <p class="text-sm text-slate-500">
            Registre a história clínica, alimentação e hábitos de vida. A queixa principal é obrigatória para completar a seção.
          </p>
        </div>
      </div>

      <div class="grid gap-3 rounded-xl bg-slate-100 p-1 md:grid-cols-3">
        <button
          v-for="aba in abas"
          :key="aba.id"
          type="button"
          class="flex items-center justify-between gap-3 rounded-lg px-4 py-3 text-left text-sm transition"
          :class="activeTab === aba.id
            ? 'bg-white text-teal-700 shadow-sm ring-1 ring-teal-100'
            : 'text-slate-600 hover:bg-white/60'"
          @click="activeTab = aba.id"
        >
          <span class="flex items-center gap-2">
            <component :is="aba.icon" class="h-5 w-5" />
            <span class="font-medium">{{ aba.label }}</span>
          </span>
          <span
            v-if="aba.preenchidos > 0"
            class="rounded-full px-2 py-0.5 text-xs font-semibold"
            :class="activeTab === aba.id ? 'bg-teal-50 text-teal-700' : 'bg-slate-200 text-slate-500'"
          >
            {{ aba.preenchidos }}/4
          </span>
        </button>
      </div>

      <div class="mt-5 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-semibold text-slate-800">{{ abaAtual.label }}</p>
            <p class="mt-1 text-xs text-slate-500">{{ abaAtual.description }}</p>
          </div>
          <span class="hidden rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200 md:inline-flex">
            Conteúdo preservado ao trocar de aba
          </span>
        </div>
      </div>
    </section>

    <section v-if="activeTab === 'clinica'" class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="mb-5">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Dados clínicos</p>
        <h4 class="mt-1 text-base font-semibold text-slate-900">Clínica</h4>
      </div>

      <div class="grid gap-5">
        <label v-for="campo in camposClinica" :key="campo.campo" class="space-y-2">
          <span class="text-sm font-medium text-slate-700">
            {{ campo.label }}
            <span v-if="campo.required" class="text-red-500">*</span>
          </span>
          <textarea
            :value="consultaStore.anamnese.clinica[campo.campo]"
            :rows="campo.rows ?? 3"
            :placeholder="campo.placeholder"
            class="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            @input="setClinica(campo.campo, $event)"
          />
        </label>
      </div>
    </section>

    <section v-else-if="activeTab === 'alimentacao'" class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="mb-5">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Rotina alimentar</p>
        <h4 class="mt-1 text-base font-semibold text-slate-900">Alimentação</h4>
      </div>

      <div class="grid gap-5">
        <label v-for="campo in camposAlimentacao" :key="campo.campo" class="space-y-2">
          <span class="text-sm font-medium text-slate-700">{{ campo.label }}</span>
          <textarea
            :value="consultaStore.anamnese.alimentacao[campo.campo]"
            :rows="campo.rows ?? 3"
            :placeholder="campo.placeholder"
            class="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            @input="setAlimentacao(campo.campo, $event)"
          />
        </label>
      </div>
    </section>

    <section v-else class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="mb-5">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Rotina e ambiente</p>
        <h4 class="mt-1 text-base font-semibold text-slate-900">Hábitos</h4>
      </div>

      <div class="grid gap-5">
        <label v-for="campo in camposHabitos" :key="campo.campo" class="space-y-2">
          <span class="text-sm font-medium text-slate-700">{{ campo.label }}</span>
          <textarea
            :value="consultaStore.anamnese.habitos[campo.campo]"
            :rows="campo.rows ?? 3"
            :placeholder="campo.placeholder"
            class="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            @input="setHabitos(campo.campo, $event)"
          />
        </label>
      </div>
    </section>

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

      <div class="rounded-lg px-4 py-2 text-xs font-medium" :class="queixaPrincipalPreenchida ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-500'">
        Salvamento local em tempo real na store
      </div>
    </section>
  </div>
</template>
