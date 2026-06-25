<template>
  <div class="space-y-6">
    <!-- Stat cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="stat in statCards"
        :key="stat.label"
        class="shadow-sm border border-slate-200 border-l-4 bg-white rounded-xl p-4"
        :class="stat.borderColor"
      >
        <div class="flex items-center justify-between pb-2">
          <p class="text-xs font-medium uppercase tracking-wide text-slate-500">{{ stat.label }}</p>
          <component :is="stat.icon" class="h-4 w-4" :class="stat.color" />
        </div>
        <div class="text-2xl font-bold tabular-nums" :class="stat.color">{{ stat.value }}</div>
      </div>
    </div>

    <!-- Tabela de pacientes -->
    <div class="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-100">
        <h2 class="text-base font-semibold text-slate-800">Pacientes na Fila</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b border-slate-100 bg-slate-50">
              <th class="pl-5 pr-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Paciente</th>
              <th class="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide hidden sm:table-cell">Idade</th>
              <th class="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide hidden md:table-cell">Tipo de Entrada</th>
              <th class="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide hidden lg:table-cell">Status</th>
              <th class="pr-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="entrada in fila.entradas"
              :key="entrada.id"
              class="cursor-pointer hover:bg-slate-50 h-14 transition-colors"
              @click="handleRowClick(entrada)"
            >
              <!-- Paciente -->
              <td class="pl-5 pr-3 py-4">
                <div class="space-y-0.5">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-medium text-slate-900">{{ entrada.paciente.nome }}</span>
                    <span
                      v-if="(entrada.faltas ?? 0) === 1"
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700"
                    >
                      1 falta
                    </span>
                    <span
                      v-else-if="(entrada.faltas ?? 0) >= 2"
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700"
                    >
                      <ExclamationTriangleIcon class="h-3 w-3" />
                      {{ entrada.faltas }} faltas
                    </span>
                  </div>
                  <div class="text-xs text-slate-400">CPF: {{ maskCpf(entrada.paciente.cpf ?? '', 'partial') }}</div>
                  <!-- Mobile: extra info -->
                  <div class="flex flex-wrap gap-2 sm:hidden mt-1">
                    <span class="text-xs text-slate-500">{{ entrada.paciente.idade }}</span>
                    <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium" :class="entryTypeBadgeClass(entrada.tipoEntrada)">{{ entrada.tipoEntrada }}</span>
                    <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium" :class="statusBadgeClass(entrada.status)">{{ entrada.status }}</span>
                  </div>
                </div>
              </td>
              <!-- Idade -->
              <td class="px-3 py-4 text-sm text-slate-700 hidden sm:table-cell whitespace-nowrap">{{ entrada.paciente.idade }}</td>
              <!-- Tipo de Entrada -->
              <td class="px-3 py-4 hidden md:table-cell">
                <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium" :class="entryTypeBadgeClass(entrada.tipoEntrada)">
                  {{ entrada.tipoEntrada }}
                </span>
              </td>
              <!-- Status -->
              <td class="px-3 py-4 hidden lg:table-cell">
                <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium" :class="statusBadgeClass(entrada.status)">
                  {{ entrada.status }}
                </span>
              </td>
              <!-- Menu -->
              <td class="pr-4 py-4" @click.stop>
                <div class="relative">
                  <button
                    @click="toggleDropdown(entrada.id)"
                    class="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <EllipsisVerticalIcon class="h-4 w-4" />
                  </button>
                  <div
                    v-show="dropdownAberto === entrada.id"
                    class="absolute right-0 z-20 mt-1 w-44 rounded-lg bg-white shadow-lg ring-1 ring-slate-200"
                  >
                    <div class="py-1">
                      <button
                        @click="handleVerBriefing(entrada)"
                        class="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <DocumentTextIcon class="h-4 w-4 text-slate-400" />
                        Ver Briefing
                      </button>
                      <div class="my-1 border-t border-slate-100" />
                      <button
                        @click="abrirConfirmacaoConsulta(entrada)"
                        class="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <PlayIcon class="h-4 w-4 text-slate-400" />
                        Iniciar Consulta
                      </button>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-if="fila.entradas.length === 0">
              <td colspan="5" class="py-10 text-center text-sm text-slate-400">Nenhum paciente na fila.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Dialog: Selecionar paciente (Ver Briefing) -->
    <div v-if="pendingBriefing" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="pendingBriefing = null">
      <div class="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <h3 class="text-base font-semibold text-slate-800">Selecionar paciente?</h3>
        <p class="mt-2 text-sm text-slate-600">
          Você está prestes a selecionar <strong>{{ pendingBriefing.paciente.nome }}</strong> para visualizar o briefing clínico.<br />
          Tipo de entrada: <strong>{{ pendingBriefing.tipoEntrada }}</strong>
        </p>
        <div class="mt-5 flex justify-end gap-2">
          <button @click="pendingBriefing = null" class="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            Cancelar
          </button>
          <button @click="confirmarBriefing" class="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
            Confirmar
          </button>
        </div>
      </div>
    </div>

    <!-- Dialog: Iniciar atendimento -->
    <div v-if="pendingConsulta" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="pendingConsulta = null">
      <div class="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <h3 class="text-base font-semibold text-slate-800">Iniciar atendimento?</h3>
        <p class="mt-2 text-sm text-slate-600">
          Você está prestes a iniciar o atendimento de <strong>{{ pendingConsulta.paciente.nome }}</strong>.<br />
          Tipo de entrada: <strong>{{ pendingConsulta.tipoEntrada }}</strong>
        </p>
        <div class="mt-5 flex justify-end gap-2">
          <button @click="pendingConsulta = null" class="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            Cancelar
          </button>
          <button @click="confirmarConsulta" class="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
            Confirmar e Iniciar
          </button>
        </div>
      </div>
    </div>

    <!-- Overlay fechar dropdown -->
    <div v-if="dropdownAberto" class="fixed inset-0 z-10" @click="dropdownAberto = null" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  EllipsisVerticalIcon,
  DocumentTextIcon,
  PlayIcon,
  ExclamationTriangleIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/vue/24/outline'
import { useFilaStore } from '../stores/fila'
import type { EntradaFila, TipoEntrada, StatusFila } from '../types/clinica'
import { maskCpf } from '../utils/cpf'

const fila = useFilaStore()

const dropdownAberto = ref<string | null>(null)
const pendingBriefing = ref<EntradaFila | null>(null)
const pendingConsulta = ref<EntradaFila | null>(null)

const statCards = computed(() => [
  { label: 'Total do dia', value: fila.stats.total, icon: UsersIcon, color: 'text-slate-700', borderColor: 'border-l-slate-500' },
  { label: 'Aguardando', value: fila.stats.aguardando, icon: ClockIcon, color: 'text-amber-600', borderColor: 'border-l-amber-500' },
  { label: 'Em Atendimento', value: fila.stats.emAtendimento, icon: ExclamationCircleIcon, color: 'text-blue-600', borderColor: 'border-l-blue-500' },
  { label: 'Finalizados', value: fila.stats.concluidos, icon: CheckCircleIcon, color: 'text-green-600', borderColor: 'border-l-green-500' },
])


const entryTypeClasses: Record<TipoEntrada, string> = {
  'Retorno': 'bg-teal-100 text-teal-800',
  'Egresso': 'bg-sky-100 text-sky-800',
  'Encaminhamento Externo': 'bg-violet-100 text-violet-800',
  'Internacao': 'bg-rose-100 text-rose-800',
}

function entryTypeBadgeClass(tipo: TipoEntrada): string {
  return entryTypeClasses[tipo] ?? 'bg-slate-100 text-slate-700'
}

const statusClasses: Record<StatusFila, string> = {
  'Aguardando': 'bg-amber-100 text-amber-700',
  'Em Atendimento': 'bg-blue-100 text-blue-600',
  'Finalizado': 'bg-green-100 text-green-700',
  'Pendente': 'bg-orange-100 text-orange-700',
  'Agendado': 'bg-slate-100 text-slate-700',
}

function statusBadgeClass(status: StatusFila): string {
  return statusClasses[status] ?? 'bg-slate-100 text-slate-700'
}

function toggleDropdown(id: string) {
  dropdownAberto.value = dropdownAberto.value === id ? null : id
}

function handleRowClick(entrada: EntradaFila) {
  pendingBriefing.value = entrada
}

function handleVerBriefing(entrada: EntradaFila) {
  dropdownAberto.value = null
  pendingBriefing.value = entrada
}

function confirmarBriefing() {
  if (pendingBriefing.value) {
    fila.verBriefing(pendingBriefing.value)
    pendingBriefing.value = null
  }
}

function abrirConfirmacaoConsulta(entrada: EntradaFila) {
  dropdownAberto.value = null
  pendingConsulta.value = entrada
}

function confirmarConsulta() {
  if (pendingConsulta.value) {
    fila.iniciarConsulta(pendingConsulta.value)
    pendingConsulta.value = null
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    dropdownAberto.value = null
    pendingBriefing.value = null
    pendingConsulta.value = null
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>
