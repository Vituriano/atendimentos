<template>
  <div class="space-y-5">
    <div class="flex justify-end">
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        @click="consulta.adicionarEncaminhamento()"
      >
        <PlusIcon class="h-4 w-4" />
        Adicionar encaminhamento
      </button>
    </div>

    <div
      v-if="consulta.encaminhamentos.length === 0"
      class="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center"
    >
      <PaperAirplaneIcon class="mb-4 h-10 w-10 text-slate-300" />
      <p class="text-sm font-medium text-slate-500">Nenhum encaminhamento adicionado</p>
      <p class="mt-1 text-sm text-slate-400">
        Clique em “Adicionar encaminhamento” para registrar um encaminhamento desta consulta.
      </p>
    </div>

    <div v-else class="space-y-4">
      <section
        v-for="encaminhamento in consulta.encaminhamentos"
        :key="encaminhamento.localId"
        class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_160px_auto_auto] lg:items-start">
          <label class="space-y-2">
            <span class="text-sm font-semibold text-slate-900">Especialidade</span>
            <select
              class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              :value="encaminhamento.especialidade"
              @change="atualizarCampo(encaminhamento.localId, 'especialidade', ($event.target as HTMLSelectElement).value)"
            >
              <option value="">Selecione a especialidade...</option>
              <option v-for="especialidade in especialidades" :key="especialidade" :value="especialidade">
                {{ especialidade }}
              </option>
            </select>
          </label>

          <label class="space-y-2">
            <span class="text-sm font-semibold text-slate-900">Prioridade</span>
            <select
              class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              :value="encaminhamento.prioridade"
              @change="atualizarCampo(encaminhamento.localId, 'prioridade', ($event.target as HTMLSelectElement).value as PrioridadeEncaminhamento)"
            >
              <option value="Alta">Alta</option>
              <option value="Média">Média</option>
              <option value="Baixa">Baixa</option>
            </select>
          </label>

          <span
            class="mt-8 inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium"
            :class="badgePrioridadeClass(encaminhamento.prioridade)"
          >
            {{ encaminhamento.prioridade }}
          </span>

          <button
            type="button"
            class="mt-7 inline-flex w-fit items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
            @click="consulta.removerEncaminhamento(encaminhamento.localId)"
          >
            <XMarkIcon class="h-4 w-4" />
            Cancelar interconsulta
          </button>
        </div>

        <label class="mt-4 block space-y-2">
          <span class="text-sm font-semibold text-slate-900">Procedimento / Motivo</span>
          <input
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            placeholder="Descreva o procedimento ou motivo do encaminhamento"
            :value="encaminhamento.procedimentoMotivo"
            @input="atualizarCampo(encaminhamento.localId, 'procedimentoMotivo', ($event.target as HTMLInputElement).value)"
          />
        </label>

        <label class="mt-4 block space-y-2">
          <span class="text-sm font-semibold text-slate-900">Justificativa clínica</span>
          <textarea
            class="min-h-20 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            placeholder="Justificativa clínica para o encaminhamento (será impressa no documento)"
            :value="encaminhamento.justificativaClinica"
            @input="atualizarCampo(encaminhamento.localId, 'justificativaClinica', ($event.target as HTMLTextAreaElement).value)"
          />
        </label>
      </section>
    </div>

    <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p
            class="text-sm font-medium"
            :class="secaoCompleta ? 'text-teal-700' : 'text-slate-600'"
          >
            <CheckCircleIcon v-if="secaoCompleta" class="mr-1 inline h-4 w-4" />
            {{ mensagemStatus }}
          </p>
          <p v-if="consulta.erroSalvamentoEncaminhamentos" class="mt-1 text-sm text-red-600">
            {{ consulta.erroSalvamentoEncaminhamentos }}
          </p>
        </div>
        <button
          v-if="false"
          type="button"
          class="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="consulta.salvandoEncaminhamentos"
          @click="salvar"
        >
          {{ consulta.salvandoEncaminhamentos ? 'Salvando...' : 'Salvar seção' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  CheckCircleIcon,
  PaperAirplaneIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { useConsultaStore, type EncaminhamentoConsulta, type PrioridadeEncaminhamento } from '../../stores/consulta'

const consulta = useConsultaStore()

const especialidades = [
  'Gastroenterologia',
  'Neurologia',
  'Cardiologia',
  'Pneumologia',
  'Endocrinologia',
  'Psicologia',
  'Fonoaudiologia',
  'Fisioterapia',
  'Terapia Ocupacional',
  'Cirurgia Pediátrica',
  'Oftalmologia',
  'Ortopedia',
  'Dermatologia',
  'Hematologia',
  'Infectologia',
  'ADI',
  'Pediátrico',
]

const secaoCompleta = computed(() => consulta.completedSections.has('referral'))
const mensagemStatus = computed(() => {
  if (secaoCompleta.value) return 'Há encaminhamento completo registrado para esta consulta.'
  if (consulta.encaminhamentos.length > 0) return 'Preencha especialidade e procedimento/motivo para completar a seção.'
  return 'Nenhum encaminhamento registrado nesta consulta.'
})

function atualizarCampo<K extends keyof EncaminhamentoConsulta>(
  localId: string,
  campo: K,
  valor: EncaminhamentoConsulta[K],
) {
  consulta.atualizarCampoEncaminhamento(localId, campo, valor)
}

function badgePrioridadeClass(prioridade: PrioridadeEncaminhamento) {
  if (prioridade === 'Alta') return 'bg-red-100 text-red-700'
  if (prioridade === 'Média') return 'bg-amber-100 text-amber-800'
  return 'bg-emerald-100 text-emerald-700'
}

async function salvar() {
  await consulta.salvarEncaminhamentos()
}
</script>
