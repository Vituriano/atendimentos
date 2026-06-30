<template>
  <section class="space-y-6">

    <!-- Calendário vacinal interativo -->
    <div class="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div class="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <ShieldCheckIcon class="h-5 w-5 text-teal-600 shrink-0" />
        <div>
          <p class="text-sm font-semibold text-slate-800">Calendário Nacional de Imunização (PNI)</p>
          <p class="text-xs text-slate-500 mt-0.5">Marque as doses conforme verificado na caderneta física.</p>
        </div>
      </div>

      <div class="divide-y divide-slate-100">
        <div
          v-for="vacina in calendarioVacinal"
          :key="vacina.id"
          class="flex items-start gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors"
        >
          <!-- Barra colorida + nome -->
          <div class="flex items-center gap-2.5 min-w-[220px] shrink-0">
            <div
              class="w-2.5 h-2.5 rounded-full shrink-0"
              :class="cores(vacina.cor).dot"
            />
            <span class="text-sm font-medium text-slate-800 leading-tight">{{ vacina.nome }}</span>
          </div>

          <!-- Doses -->
          <div class="flex flex-wrap gap-2">
            <div
              v-for="dose in vacina.doses"
              :key="dose.id"
              class="flex flex-col items-center gap-1"
            >
              <span class="text-[10px] font-medium text-slate-500 whitespace-nowrap">
                {{ dose.label }}
              </span>
              <div class="flex gap-1">
                <!-- Aplicada -->
                <button
                  @click="consulta.toggleStatusVacina(vacina.id, dose.id, 'aplicada')"
                  :title="`Marcar ${dose.label} como aplicada`"
                  class="w-7 h-7 rounded border flex items-center justify-center transition-colors"
                  :class="consulta.getStatusVacina(vacina.id, dose.id) === 'aplicada'
                    ? 'bg-green-100 border-green-500 text-green-600'
                    : 'border-slate-200 text-slate-300 hover:bg-slate-100 hover:text-slate-500'"
                >
                  <CheckIcon class="h-3.5 w-3.5" />
                </button>
                <!-- Em atraso -->
                <button
                  @click="consulta.toggleStatusVacina(vacina.id, dose.id, 'em-atraso')"
                  :title="`Marcar ${dose.label} como em atraso`"
                  class="w-7 h-7 rounded border flex items-center justify-center transition-colors"
                  :class="consulta.getStatusVacina(vacina.id, dose.id) === 'em-atraso'
                    ? 'bg-red-100 border-red-500 text-red-600'
                    : 'border-slate-200 text-slate-300 hover:bg-slate-100 hover:text-slate-500'"
                >
                  <XMarkIcon class="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Legenda -->
    <div class="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
      <div class="flex items-center gap-1.5">
        <div class="w-6 h-6 rounded border bg-green-100 border-green-500 flex items-center justify-center">
          <CheckIcon class="h-3.5 w-3.5 text-green-600" />
        </div>
        Aplicada
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-6 h-6 rounded border bg-red-100 border-red-500 flex items-center justify-center">
          <XMarkIcon class="h-3.5 w-3.5 text-red-600" />
        </div>
        Em atraso / não aplicada
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-6 h-6 rounded border border-slate-200"></div>
        Não avaliado
      </div>
    </div>

    <!-- Alertas: doses em atraso -->
    <div
      v-if="dosesEmAtraso.length > 0"
      class="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      <ExclamationTriangleIcon class="h-4 w-4 mt-0.5 shrink-0 text-red-500" />
      <div>
        <p class="font-medium">Doses em atraso registradas:</p>
        <ul class="list-disc list-inside mt-1 text-xs space-y-0.5">
          <li v-for="d in dosesEmAtraso" :key="d">{{ d }}</li>
        </ul>
      </div>
    </div>

    <!-- Histórico vacinal de consultas anteriores -->
    <div
      v-if="possuiHistoricoVacinal"
      class="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-5"
    >
      <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <ClockIcon class="h-5 w-5 text-teal-600" />
          Observações de consultas anteriores
        </div>
        <span class="inline-flex w-fit rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
          Histórico
        </span>
      </div>

      <div class="space-y-3">
        <article
          v-for="item in historicoImunizacoes"
          :key="item.consultaId"
          class="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
        >
          <div class="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Consulta de {{ formatarData(item.dataConsulta) }}
            </p>
            <p v-if="item.atualizadoEm" class="text-xs text-slate-400">
              Atualizado em {{ formatarData(item.atualizadoEm) }}
            </p>
          </div>
          <p class="whitespace-pre-line text-sm leading-relaxed text-slate-700">
            {{ item.statusVacinal }}
          </p>
        </article>
      </div>
    </div>

    <!-- Observações gerais -->
    <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Observações gerais
      </label>
      <p class="mt-1 text-xs text-slate-400">
        Pendências, doses em atraso ou informações complementares sobre o status vacinal.
      </p>
      <textarea
        v-model="statusVacinal"
        rows="3"
        class="mt-3 w-full resize-y rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
        placeholder="Ex: Calendário em dia. DTP reforço pendente — família não compareceu na data prevista."
      />
    </div>

  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import {
  ShieldCheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'
import { CheckIcon, XMarkIcon } from '@heroicons/vue/24/solid'
import { useConsultaStore } from '../../stores/consulta'
import { calendarioVacinal, CORES_VACINA } from '../../data/calendario-vacinal'

const consulta = useConsultaStore()
const { imunizacoes, historicoImunizacoes } = storeToRefs(consulta)

function cores(cor: string) {
  return CORES_VACINA[cor] ?? CORES_VACINA['slate']
}

const statusVacinal = computed({
  get: () => imunizacoes.value.statusVacinal,
  set: (valor: string) => consulta.atualizarStatusVacinal(valor),
})

const possuiHistoricoVacinal = computed(() => historicoImunizacoes.value.length > 0)

const dosesEmAtraso = computed(() => {
  const result: string[] = []
  for (const vacina of calendarioVacinal) {
    for (const dose of vacina.doses) {
      if (consulta.getStatusVacina(vacina.id, dose.id) === 'em-atraso') {
        result.push(`${vacina.nome} — ${dose.label}`)
      }
    }
  }
  return result
})

function formatarData(dataIso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dataIso))
}
</script>
