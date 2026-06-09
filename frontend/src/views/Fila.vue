<template>
  <div class="space-y-6">
    <!-- Cabeçalho -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Fila de Atendimento</h1>
        <p class="mt-1 text-sm text-gray-500">{{ dataAtual }}</p>
      </div>
    </div>

    <!-- Stat cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <p class="text-sm font-medium text-gray-500">Total</p>
        <p class="mt-1 text-3xl font-bold text-gray-900">{{ fila.stats.total }}</p>
        <p class="mt-1 text-xs text-gray-400">pacientes hoje</p>
      </div>
      <div class="bg-amber-50 rounded-xl border border-amber-200 p-4">
        <p class="text-sm font-medium text-amber-700">Aguardando</p>
        <p class="mt-1 text-3xl font-bold text-amber-800">{{ fila.stats.aguardando }}</p>
        <p class="mt-1 text-xs text-amber-600">na fila</p>
      </div>
      <div class="bg-teal-50 rounded-xl border border-teal-200 p-4">
        <p class="text-sm font-medium text-teal-700">Em Atendimento</p>
        <p class="mt-1 text-3xl font-bold text-teal-800">{{ fila.stats.emAtendimento }}</p>
        <p class="mt-1 text-xs text-teal-600">em consulta</p>
      </div>
      <div class="bg-green-50 rounded-xl border border-green-200 p-4">
        <p class="text-sm font-medium text-green-700">Concluídos</p>
        <p class="mt-1 text-3xl font-bold text-green-800">{{ fila.stats.concluidos }}</p>
        <p class="mt-1 text-xs text-green-600">finalizados</p>
      </div>
    </div>

    <!-- Busca -->
    <div class="relative">
      <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        v-model="fila.busca"
        type="text"
        placeholder="Buscar paciente por nome..."
        class="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
      />
    </div>

    <!-- Tabela -->
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horário</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Idade</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Tipo</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Espera</th>
            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="entrada in fila.entradasFiltradas"
            :key="entrada.id"
            class="hover:bg-gray-50 transition-colors"
          >
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ entrada.horario }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ entrada.paciente.nome }}</p>
                  <p class="text-xs text-gray-400">{{ entrada.paciente.prontuario }}</p>
                </div>
                <span
                  v-if="(entrada.faltas ?? 0) >= 2"
                  class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700"
                >
                  <ExclamationTriangleIcon class="h-3 w-3" />
                  {{ entrada.faltas }} faltas
                </span>
              </div>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell whitespace-nowrap">{{ entrada.paciente.idade }}</td>
            <td class="px-4 py-3 hidden md:table-cell">
              <span class="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                {{ entrada.tipoEntrada }}
              </span>
            </td>
            <td class="px-4 py-3">
              <span
                class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                :class="statusClass(entrada.status)"
              >
                {{ entrada.status }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell whitespace-nowrap">
              {{ entrada.tempoEspera ?? '—' }}
            </td>
            <td class="px-4 py-3 text-right">
              <!-- Dropdown menu -->
              <div class="relative inline-block text-left">
                <button
                  @click.stop="toggleDropdown(entrada.id)"
                  class="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Opções"
                >
                  <EllipsisVerticalIcon class="h-5 w-5" />
                </button>
                <div
                  v-show="dropdownAberto === entrada.id"
                  class="absolute right-0 z-10 mt-1 w-44 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-gray-200 focus:outline-none"
                >
                  <div class="py-1">
                    <button
                      @click="handleVerBriefing(entrada)"
                      class="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <DocumentTextIcon class="h-4 w-4 text-gray-400" />
                      Ver Briefing
                    </button>
                    <button
                      @click="abrirConfirmacao(entrada)"
                      class="flex w-full items-center gap-2 px-4 py-2 text-sm text-teal-700 hover:bg-teal-50"
                    >
                      <PlayIcon class="h-4 w-4 text-teal-500" />
                      Iniciar Consulta
                    </button>
                  </div>
                </div>
              </div>
            </td>
          </tr>
          <tr v-if="fila.entradasFiltradas.length === 0">
            <td colspan="7" class="px-4 py-10 text-center text-sm text-gray-400">
              Nenhum paciente encontrado.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Dialog de confirmação -->
    <div
      v-if="entradaParaConfirmar"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @click.self="fecharConfirmacao"
    >
      <div class="absolute inset-0 bg-black/40" @click="fecharConfirmacao" />
      <div class="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
        <h2 class="text-lg font-semibold text-gray-900">Iniciar Consulta</h2>
        <p class="mt-2 text-sm text-gray-600">
          Deseja iniciar a consulta de
          <span class="font-medium text-gray-900">{{ entradaParaConfirmar.paciente.nome }}</span>?
        </p>
        <div class="mt-5 flex gap-3 justify-end">
          <button
            @click="fecharConfirmacao"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="confirmarConsulta"
            class="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Iniciar
          </button>
        </div>
      </div>
    </div>

    <!-- Overlay para fechar dropdown ao clicar fora -->
    <div
      v-if="dropdownAberto"
      class="fixed inset-0 z-[5]"
      @click="dropdownAberto = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  PlayIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'
import { useFilaStore } from '../stores/fila'
import type { EntradaFila, StatusFila } from '../types/clinica'

const fila = useFilaStore()

const dropdownAberto = ref<string | null>(null)
const entradaParaConfirmar = ref<EntradaFila | null>(null)

const dataAtual = computed(() => {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

function statusClass(status: StatusFila): string {
  const map: Record<StatusFila, string> = {
    'Aguardando': 'bg-amber-100 text-amber-800',
    'Em Atendimento': 'bg-teal-100 text-teal-800',
    'Finalizado': 'bg-green-100 text-green-800',
    'Pendente': 'bg-gray-100 text-gray-700',
    'Agendado': 'bg-blue-100 text-blue-700',
  }
  return map[status] ?? 'bg-gray-100 text-gray-700'
}

function toggleDropdown(id: string) {
  dropdownAberto.value = dropdownAberto.value === id ? null : id
}

function handleVerBriefing(entrada: EntradaFila) {
  dropdownAberto.value = null
  fila.verBriefing(entrada)
}

function abrirConfirmacao(entrada: EntradaFila) {
  dropdownAberto.value = null
  entradaParaConfirmar.value = entrada
}

function fecharConfirmacao() {
  entradaParaConfirmar.value = null
}

function confirmarConsulta() {
  if (entradaParaConfirmar.value) {
    fila.iniciarConsulta(entradaParaConfirmar.value)
    entradaParaConfirmar.value = null
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    dropdownAberto.value = null
    entradaParaConfirmar.value = null
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>
