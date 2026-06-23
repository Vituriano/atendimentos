<template>
  <section class="space-y-4">
    <div class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl font-semibold text-slate-900">Exame Físico</h2>
        <p class="mt-1 text-sm text-paper-text">Avalie cada sistema corporal, registre status e descreva alterações.</p>
      </div>

      <div class="inline-flex items-center gap-3 rounded-full bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
        <span>{{ avaliadosCount }} de {{ totalSistemas }} sistemas avaliados</span>
        <span
          class="rounded-full px-2.5 py-1 text-xs font-semibold"
          :class="isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'"
        >
          {{ isComplete ? 'Completo' : 'Incompleto' }}
        </span>
      </div>
    </div>

    <div class="grid gap-4">
      <SistemaExame
        v-for="sistema in sistemas"
        :key="sistema.id"
        :id="sistema.id"
        :label="sistema.label"
        :system="consultaStore.exameFisico[sistema.id]"
        @update-status="updateStatus"
        @update-descricao="updateDescricao"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConsultaStore } from '../../stores/consulta'
import SistemaExame from './SistemaExame.vue'
import type { ExameFisico, SistemaStatus } from '../../types/clinica'

type SistemaStatusSelection = SistemaStatus | ''

const consultaStore = useConsultaStore()

const sistemas = [
  { id: 'geral' as const, label: 'Geral' },
  { id: 'pele' as const, label: 'Pele' },
  { id: 'cabecaPescoco' as const, label: 'Cabeça/Pescoço' },
  { id: 'olhos' as const, label: 'Olhos' },
  { id: 'ouvidos' as const, label: 'Ouvidos' },
  { id: 'nariz' as const, label: 'Nariz' },
  { id: 'bocaGarganta' as const, label: 'Boca/Garganta' },
  { id: 'cardiovascular' as const, label: 'Cardiovascular' },
  { id: 'respiratorio' as const, label: 'Respiratório' },
  { id: 'abdome' as const, label: 'Abdome' },
  { id: 'genitourinario' as const, label: 'Genitourinário' },
  { id: 'extremidades' as const, label: 'Extremidades' },
  { id: 'neurologico' as const, label: 'Neurológico' },
  { id: 'musculoesqueletico' as const, label: 'Musculoesquelético' },
] as const

const totalSistemas = sistemas.length
const avaliadosCount = computed(() => consultaStore.avaliadosCount)
const isComplete = computed(() => consultaStore.allStatusesSelected)

function updateStatus(payload: { id: string; status: SistemaStatusSelection }) {
  consultaStore.updateSistemaStatus(payload.id as keyof ExameFisico, payload.status)
}

function updateDescricao(payload: { id: string; descricao: string }) {
  consultaStore.updateSistemaDescricao(payload.id as keyof ExameFisico, payload.descricao)
}
</script>
