<template>
  <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

    <div class="mb-6 flex flex-wrap gap-2">
      <button
        v-for="sistema in sistemas"
        :key="sistema.id"
        @click="toggleSistema(sistema.id)"
        class="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors"
        :class="[
          sistemasSelecionados.includes(sistema.id)
            ? 'border-emerald-400 bg-white text-emerald-600' // Chip Selecionado (Borda e texto verde)
            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
        ]"
      >
        <component :is="sistema.icon" class="h-4 w-4" />
        {{ sistema.label }}
      </button>
    </div>

    <div class="mb-8 flex items-center gap-4">
      <button
        @click="selecionarTodos"
        class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
      >
        Selecionar todos
      </button>
      <button
        @click="limparSelecao"
        class="text-sm font-medium text-slate-700 transition-colors hover:text-slate-900"
      >
        Limpar seleção
      </button>
    </div>

    <div
      v-if="sistemasSelecionados.length === 0"
      class="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/50 p-16 text-center"
    >
      <Stethoscope class="mb-3 h-10 w-10 text-slate-300" />
      <h3 class="text-base font-medium text-slate-600">Nenhum sistema selecionado</h3>
      <p class="mt-1 text-sm text-slate-400">
        Clique nos chips acima para selecionar os sistemas que foram avaliados.
      </p>
    </div>

    <div v-else class="grid gap-4">
      <SistemaExame
        v-for="id in sistemasSelecionados"
        :key="id"
        :id="id"
        :label="getSistemaLabel(id)"
        :icon="getSistemaIcon(id)"
        :system="consultaStore.exameFisico[id as keyof ExameFisico] || { status: '', descricao: '' }"
        @update-status="updateStatus"
        @update-descricao="updateDescricao"
        @remove="toggleSistema(id)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useConsultaStore } from '../../stores/consulta'
import SistemaExame from './SistemaExame.vue'
import type { ExameFisico, SistemaStatus } from '../../types/clinica'
import {
  Stethoscope, Activity, Layers, Eye, Ear, Smile, Brain, 
  Circle, MoveHorizontal, Heart, Wind, User
} from 'lucide-vue-next'

type SistemaStatusSelection = SistemaStatus | ''

const consultaStore = useConsultaStore()

const sistemas = [
  { id: 'geral' as const, label: 'Geral', icon: Activity },
  { id: 'pele' as const, label: 'Pele', icon: Layers },
  { id: 'olhos' as const, label: 'Olhos', icon: Eye },
  { id: 'ouvidos' as const, label: 'Ouvidos', icon: Ear },
  { id: 'bocaDentes' as const, label: 'Boca e Dentes', icon: Smile },
  { id: 'cabeca' as const, label: 'Cabeça', icon: Brain },
  { id: 'ganglios' as const, label: 'Gânglios linfáticos', icon: Circle },
  { id: 'pescoco' as const, label: 'Pescoço', icon: MoveHorizontal },
  { id: 'cardiovascular' as const, label: 'Cardiovascular', icon: Heart },
  { id: 'respiratorio' as const, label: 'Respiratório', icon: Wind },
  { id: 'gastrointestinal' as const, label: 'Ap. Gastrointestinal', icon: Circle },
  { id: 'genitourinario' as const, label: 'Ap. Geniturinário', icon: User },
  { id: 'musculoesqueletico' as const, label: 'Sist. Musculoesquelético', icon: MoveHorizontal },
  { id: 'nervoso' as const, label: 'Sistema Nervoso', icon: Activity },
] as const

const sistemasSelecionados = ref<Array<keyof ExameFisico>>([])

function toggleSistema(id: string) {
  const validId = id as keyof ExameFisico
  if (sistemasSelecionados.value.includes(validId)) {
    sistemasSelecionados.value = sistemasSelecionados.value.filter(sId => sId !== validId)
  } else {
    sistemasSelecionados.value.push(validId)
  }
}

function selecionarTodos() {
  sistemasSelecionados.value = sistemas.map(s => s.id as keyof ExameFisico)
}

function limparSelecao() {
  sistemasSelecionados.value = []
}

function getSistemaLabel(id: string): string {
  return sistemas.find(s => s.id === id)?.label || id
}

function getSistemaIcon(id: string) {
  return sistemas.find(s => s.id === id)?.icon
}

function updateStatus(payload: { id: string; status: SistemaStatusSelection }) {
  consultaStore.updateSistemaStatus(payload.id as keyof ExameFisico, payload.status)
}

function updateDescricao(payload: { id: string; descricao: string }) {
  consultaStore.updateSistemaDescricao(payload.id as keyof ExameFisico, payload.descricao)
}
</script>