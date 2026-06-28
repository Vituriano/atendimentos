<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ScaleIcon,
} from '@heroicons/vue/24/outline'
import { usePacienteStore } from '../../stores/paciente'
import { useConsultaStore } from '../../stores/consulta'
import {
  classificarImcPorIdade,
  getAntropometriaRangePaciente,
  type ClassificacaoImc,
  type RangeNumerico,
} from '../../data/antropometria-ranges'

const pacienteStore = usePacienteStore()
const consultaStore = useConsultaStore()

let atualizandoRascunhoPelaTela = false

const form = reactive({
  pesoKg: valorInicial(consultaStore.antropometria.pesoKg),
  alturaCm: valorInicial(consultaStore.antropometria.alturaCm),
  perimetroCefalicoCm: valorInicial(consultaStore.antropometria.perimetroCefalicoCm),
  pressaoSistolicaMmHg: valorInicial(consultaStore.antropometria.pressaoSistolicaMmHg),
  pressaoDiastolicaMmHg: valorInicial(consultaStore.antropometria.pressaoDiastolicaMmHg),
})

watch(
  () => consultaStore.antropometria,
  dados => {
    if (atualizandoRascunhoPelaTela) return

    form.pesoKg = valorInicial(dados.pesoKg)
    form.alturaCm = valorInicial(dados.alturaCm)
    form.perimetroCefalicoCm = valorInicial(dados.perimetroCefalicoCm)
    form.pressaoSistolicaMmHg = valorInicial(dados.pressaoSistolicaMmHg)
    form.pressaoDiastolicaMmHg = valorInicial(dados.pressaoDiastolicaMmHg)
  },
  { deep: true }
)

function valorInicial(valor: number | null): string {
  return valor === null || valor === undefined ? '' : String(valor).replace('.', ',')
}

function parseNumero(valor: string): number | null {
  const normalizado = valor.trim().replace(',', '.')
  if (!normalizado) return null
  const numero = Number(normalizado)
  return Number.isFinite(numero) ? numero : null
}

function formatNumero(valor: number, casas = 1): string {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: valor % 1 === 0 ? 0 : casas,
    maximumFractionDigits: casas,
  })
}

function formatRange(range: RangeNumerico, unidade: string, casas = 1): string {
  return `${formatNumero(range.min, casas)} a ${formatNumero(range.max, casas)} ${unidade}`
}

function foraDaFaixa(valor: number | null, range: RangeNumerico | null): boolean {
  if (valor === null || !range) return false
  return valor < range.min || valor > range.max
}

const pacienteAtivo = computed(() => pacienteStore.pacienteAtivo)
const idadeEmMeses = computed(() => pacienteAtivo.value?.idadeEmMeses ?? 0)
const sexoPaciente = computed(() => pacienteAtivo.value?.sexoBiologico ?? pacienteAtivo.value?.sexo ?? 'F')

const rangePaciente = computed(() =>
  getAntropometriaRangePaciente(idadeEmMeses.value, sexoPaciente.value)
)

const idadePacienteTexto = computed(() => pacienteAtivo.value?.idade ?? `${idadeEmMeses.value} meses`)
const sexoPacienteTexto = computed(() => rangePaciente.value.sexo === 'M' ? 'masculino' : 'feminino')

const peso = computed(() => parseNumero(form.pesoKg))
const altura = computed(() => parseNumero(form.alturaCm))
const perimetroCefalico = computed(() => parseNumero(form.perimetroCefalicoCm))
const pressaoSistolica = computed(() => parseNumero(form.pressaoSistolicaMmHg))
const pressaoDiastolica = computed(() => parseNumero(form.pressaoDiastolicaMmHg))

const imc = computed(() => {
  if (peso.value === null || altura.value === null || altura.value <= 0) return null
  const alturaMetros = altura.value / 100
  return Math.round((peso.value / (alturaMetros * alturaMetros)) * 10) / 10
})

const classificacaoImc = computed<ClassificacaoImc | null>(() => {
  if (imc.value === null) return null
  return classificarImcPorIdade(imc.value, rangePaciente.value)
})

const classificacaoImcView = computed(() => {
  if (classificacaoImc.value === 'abaixo') {
    return {
      label: 'Abaixo do esperado',
      class: 'bg-amber-100 text-amber-700',
    }
  }
  if (classificacaoImc.value === 'sobrepeso') {
    return {
      label: 'Sobrepeso',
      class: 'bg-orange-100 text-orange-700',
    }
  }
  if (classificacaoImc.value === 'normal') {
    return {
      label: 'Normal',
      class: 'bg-emerald-100 text-emerald-700',
    }
  }
  return {
    label: 'Informe peso e altura',
    class: 'bg-slate-100 text-slate-500',
  }
})

const camposObrigatoriosPreenchidos = computed(() => peso.value !== null && altura.value !== null)
const secaoCompleta = computed(() => consultaStore.completedSections.has('anthropometric'))

const alertas = computed(() => {
  const mensagens: string[] = []

  if (foraDaFaixa(peso.value, rangePaciente.value.pesoKg)) {
    mensagens.push(`Peso fora da faixa esperada para ${idadePacienteTexto.value}, sexo ${sexoPacienteTexto.value}.`)
  }

  if (foraDaFaixa(altura.value, rangePaciente.value.alturaCm)) {
    mensagens.push(`Altura fora da faixa esperada para ${idadePacienteTexto.value}, sexo ${sexoPacienteTexto.value}.`)
  }

  if (foraDaFaixa(perimetroCefalico.value, rangePaciente.value.perimetroCefalicoCm)) {
    mensagens.push(`Perímetro cefálico fora da faixa esperada para ${idadePacienteTexto.value}, sexo ${sexoPacienteTexto.value}.`)
  }

  if (foraDaFaixa(pressaoSistolica.value, rangePaciente.value.pressaoSistolicaMmHg)) {
    mensagens.push('Pressão sistólica fora da faixa ampla esperada para a idade.')
  }

  if (foraDaFaixa(pressaoDiastolica.value, rangePaciente.value.pressaoDiastolicaMmHg)) {
    mensagens.push('Pressão diastólica fora da faixa ampla esperada para a idade.')
  }

  return mensagens
})

function atualizarRascunhoAntropometria() {
  atualizandoRascunhoPelaTela = true

  consultaStore.antropometria = {
    pesoKg: peso.value,
    alturaCm: altura.value,
    perimetroCefalicoCm: perimetroCefalico.value,
    pressaoSistolicaMmHg: pressaoSistolica.value,
    pressaoDiastolicaMmHg: pressaoDiastolica.value,
    imc: imc.value,
    classificacaoImc: classificacaoImc.value,
    atualizadoEm: consultaStore.antropometria.atualizadoEm,
  }

  const possuiAlgumDado = [
    peso.value,
    altura.value,
    perimetroCefalico.value,
    pressaoSistolica.value,
    pressaoDiastolica.value,
  ].some(valor => valor !== null)

  if (possuiAlgumDado) {
    consultaStore.markSectionStarted('anthropometric')
  }
  consultaStore.setSectionComplete('anthropometric', camposObrigatoriosPreenchidos.value)

  queueMicrotask(() => {
    atualizandoRascunhoPelaTela = false
  })
}

watch(
  () => [form.pesoKg, form.alturaCm, form.perimetroCefalicoCm, form.pressaoSistolicaMmHg, form.pressaoDiastolicaMmHg],
  atualizarRascunhoAntropometria,
  { immediate: true }
)

async function salvarSecao() {
  if (!camposObrigatoriosPreenchidos.value || consultaStore.salvandoAntropometria) return

  await consultaStore.salvarAntropometria({
    pesoKg: peso.value,
    alturaCm: altura.value,
    perimetroCefalicoCm: perimetroCefalico.value,
    pressaoSistolicaMmHg: pressaoSistolica.value,
    pressaoDiastolicaMmHg: pressaoDiastolica.value,
    imc: imc.value,
    classificacaoImc: classificacaoImc.value,
  })
}
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-6">
    <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="mb-6 flex items-start gap-4">
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
          <ScaleIcon class="h-6 w-6" />
        </div>
        <div class="space-y-1">
          <h3 class="text-base font-semibold text-slate-900">Dados antropométricos da consulta atual</h3>
          <p class="text-sm text-slate-500">
            Informe as medidas aferidas no atendimento. Peso e altura são obrigatórios para cálculo do IMC.
          </p>
          <p class="text-xs text-slate-400">
            Paciente {{ sexoPacienteTexto }}, {{ idadePacienteTexto }}. As faixas abaixo são ajustadas por idade e sexo para apoiar a conferência do preenchimento.
          </p>
        </div>
      </div>

      <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <label class="space-y-2">
          <span class="text-sm font-medium text-slate-700">Peso (kg) <span class="text-red-500">*</span></span>
          <input
            v-model="form.pesoKg"
            inputmode="decimal"
            placeholder="Ex.: 11,2"
            class="h-11 w-full rounded-lg border px-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            :class="foraDaFaixa(peso, rangePaciente.pesoKg) ? 'border-amber-400 bg-amber-50/40' : 'border-slate-200'"
          />
          <span class="block text-xs text-slate-400">
            Faixa por idade/sexo: {{ formatRange(rangePaciente.pesoKg, 'kg') }}
          </span>
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-slate-700">Altura (cm) <span class="text-red-500">*</span></span>
          <input
            v-model="form.alturaCm"
            inputmode="decimal"
            placeholder="Ex.: 82"
            class="h-11 w-full rounded-lg border px-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            :class="foraDaFaixa(altura, rangePaciente.alturaCm) ? 'border-amber-400 bg-amber-50/40' : 'border-slate-200'"
          />
          <span class="block text-xs text-slate-400">
            Faixa por idade/sexo: {{ formatRange(rangePaciente.alturaCm, 'cm') }}
          </span>
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-slate-700">Perímetro Cefálico (cm)</span>
          <input
            v-model="form.perimetroCefalicoCm"
            inputmode="decimal"
            placeholder="Ex.: 48,5"
            class="h-11 w-full rounded-lg border px-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            :class="foraDaFaixa(perimetroCefalico, rangePaciente.perimetroCefalicoCm) ? 'border-amber-400 bg-amber-50/40' : 'border-slate-200'"
          />
          <span class="block text-xs text-slate-400">
            <template v-if="rangePaciente.perimetroCefalicoCm">
              Faixa por idade/sexo: {{ formatRange(rangePaciente.perimetroCefalicoCm, 'cm') }}
            </template>
            <template v-else>
              Medida usualmente acompanhada nas curvas até 5 anos.
            </template>
          </span>
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-slate-700">Pressão Arterial (mmHg)</span>
          <div class="flex items-center gap-2">
            <input
              v-model="form.pressaoSistolicaMmHg"
              inputmode="numeric"
              placeholder="Sistólica"
              class="h-11 min-w-0 flex-1 rounded-lg border px-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              :class="foraDaFaixa(pressaoSistolica, rangePaciente.pressaoSistolicaMmHg) ? 'border-amber-400 bg-amber-50/40' : 'border-slate-200'"
            />
            <span class="text-slate-400">/</span>
            <input
              v-model="form.pressaoDiastolicaMmHg"
              inputmode="numeric"
              placeholder="Diastólica"
              class="h-11 min-w-0 flex-1 rounded-lg border px-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              :class="foraDaFaixa(pressaoDiastolica, rangePaciente.pressaoDiastolicaMmHg) ? 'border-amber-400 bg-amber-50/40' : 'border-slate-200'"
            />
          </div>
          <span class="block text-xs text-slate-400">
            Faixa ampla por idade: sistólica {{ formatRange(rangePaciente.pressaoSistolicaMmHg, 'mmHg', 0) }}; diastólica {{ formatRange(rangePaciente.pressaoDiastolicaMmHg, 'mmHg', 0) }}
          </span>
        </label>
      </div>

      <div
        v-if="alertas.length > 0"
        class="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
      >
        <div class="flex items-start gap-2">
          <ExclamationTriangleIcon class="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p class="font-medium">Confira os valores informados</p>
            <ul class="mt-1 list-inside list-disc space-y-0.5 text-xs">
              <li v-for="mensagem in alertas" :key="mensagem">{{ mensagem }}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-xl border border-teal-100 bg-teal-50/60 p-6">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div class="flex items-center gap-4">
          <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
            <ScaleIcon class="h-7 w-7" />
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">IMC calculado</p>
            <div class="mt-1 flex items-end gap-2">
              <span class="text-4xl font-bold text-teal-700">{{ imc ?? '—' }}</span>
              <span class="pb-1 text-sm text-slate-500">kg/m²</span>
            </div>
            <p class="mt-2 text-xs text-slate-500">
              Faixa normal estimada para idade/sexo: {{ formatRange(rangePaciente.imcNormal, 'kg/m²') }}
            </p>
          </div>
        </div>

        <div class="max-w-md text-right">
          <span class="inline-flex rounded-full px-4 py-1.5 text-sm font-semibold" :class="classificacaoImcView.class">
            {{ classificacaoImcView.label }}
          </span>
          <p class="mt-3 text-sm text-slate-500">
            Classificação simplificada por IMC, idade e sexo. A avaliação pediátrica completa deve considerar curva de crescimento, histórico, exame físico e contexto clínico.
          </p>
        </div>
      </div>
    </section>

    <section class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div class="flex items-start gap-3 text-sm">
        <CheckCircleIcon
          v-if="camposObrigatoriosPreenchidos"
          class="mt-0.5 h-5 w-5 shrink-0 text-teal-600"
        />
        <ExclamationTriangleIcon
          v-else
          class="mt-0.5 h-5 w-5 shrink-0 text-amber-500"
        />
        <div>
          <p :class="camposObrigatoriosPreenchidos ? 'text-teal-700' : 'text-amber-700'">
            {{ consultaStore.salvandoAntropometria ? 'Salvando dados no banco...' : (camposObrigatoriosPreenchidos ? 'Campos obrigatórios preenchidos.' : 'Informe peso e altura para completar a seção.') }}
          </p>
          <p v-if="consultaStore.erroSalvamentoAntropometria" class="mt-1 text-xs text-red-600">
            {{ consultaStore.erroSalvamentoAntropometria }}
          </p>
          <p v-else-if="secaoCompleta" class="mt-1 text-xs text-slate-400">Seção salva no banco e marcada como completa.</p>
          <p v-else class="mt-1 text-xs text-slate-400">Depois de conferir os dados, clique em Salvar Rascunho no topo da tela.</p>
        </div>
      </div>

      <button
        v-if="false"
        class="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
        :class="camposObrigatoriosPreenchidos ? 'bg-teal-600 hover:bg-teal-700' : 'bg-slate-300'"
        :disabled="!camposObrigatoriosPreenchidos || consultaStore.salvandoAntropometria"
        @click="salvarSecao"
      >
        {{ consultaStore.salvandoAntropometria ? 'Salvando...' : 'Salvar seção' }}
      </button>
    </section>
  </div>
</template>
