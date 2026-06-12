<template>
  <div class="space-y-6">
    <!-- Stats -->
    <div class="flex items-center gap-2 text-sm text-slate-500">
      <UsersIcon class="h-4 w-4" />
      <span>{{ mockPacientes.length }} pacientes cadastrados</span>
    </div>

    <!-- Search -->
    <div class="relative max-w-md">
      <MagnifyingGlassIcon class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar por nome ou CPF..."
        class="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
      />
    </div>

    <!-- LGPD CPF warning -->
    <div
      v-if="isCpfSearch && !isCpfComplete && searchQuery.length > 0"
      class="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800"
    >
      Digite o CPF completo para buscar (LGPD)
    </div>

    <!-- Empty state -->
    <div v-if="filteredPacientes.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
      <XMarkIcon class="h-10 w-10 text-slate-300 mb-3" />
      <p class="text-sm font-medium text-slate-600">
        {{ isCpfSearch && !isCpfComplete ? 'Digite o CPF completo' : 'Nenhum paciente encontrado' }}
      </p>
      <p class="text-xs text-slate-400 mt-1">
        {{ isCpfSearch && !isCpfComplete
          ? 'Por razões de privacidade (LGPD), a busca por CPF requer o número completo.'
          : 'Tente ajustar os termos de busca.' }}
      </p>
    </div>

    <!-- Table -->
    <template v-else>
      <div class="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
        <table class="min-w-full">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="pl-5 pr-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide w-72">Paciente</th>
              <th class="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide hidden sm:table-cell w-24">Idade</th>
              <th class="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide hidden md:table-cell w-40">Prontuário</th>
              <th class="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide hidden lg:table-cell w-48">CPF</th>
              <th class="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide hidden xl:table-cell w-36">Última consulta</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="paciente in paginatedPacientes"
              :key="paciente.id"
              class="cursor-pointer hover:bg-slate-50 h-14 transition-colors"
              @click="handleRowClick(paciente)"
            >
              <td class="pl-5 pr-3 py-3">
                <div class="flex items-center gap-3">
                  <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 text-sm font-semibold">
                    {{ getInitials(paciente.nome) }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-medium text-slate-900 truncate">{{ paciente.nome }}</p>
                    <div class="flex flex-wrap gap-2 sm:hidden mt-0.5 text-xs text-slate-500">
                      <span>{{ paciente.idade }}</span>
                      <span>{{ paciente.prontuario }}</span>
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-3 py-3 text-sm text-slate-700 hidden sm:table-cell">{{ paciente.idade }}</td>
              <td class="px-3 py-3 text-sm text-slate-500 hidden md:table-cell">{{ paciente.prontuario }}</td>
              <td class="px-3 py-3 hidden lg:table-cell" @click.stop>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-mono text-slate-500">
                    {{ revealedCpfs.has(paciente.id) ? paciente.cpf : maskCpf(paciente.cpf ?? '') }}
                  </span>
                  <button
                    class="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    @click="toggleCpfReveal(paciente.id)"
                  >
                    <EyeSlashIcon v-if="revealedCpfs.has(paciente.id)" class="h-3.5 w-3.5" />
                    <EyeIcon v-else class="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
              <td class="px-3 py-3 text-sm text-slate-500 hidden xl:table-cell">
                {{ getLastConsultation(paciente) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="filteredPacientes.length > PAGE_SIZE" class="flex items-center justify-between pt-2 border-t border-slate-200">
        <p class="text-sm text-slate-500">
          Mostrando {{ (currentPage - 1) * PAGE_SIZE + 1 }}–{{ Math.min(currentPage * PAGE_SIZE, filteredPacientes.length) }} de {{ filteredPacientes.length }} pacientes
        </p>
        <div class="flex items-center gap-2">
          <button
            :disabled="currentPage === 1"
            @click="currentPage--"
            class="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon class="h-4 w-4" />
            Anterior
          </button>
          <span class="text-sm font-medium px-2">{{ currentPage }} / {{ totalPages }}</span>
          <button
            :disabled="currentPage === totalPages"
            @click="currentPage++"
            class="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Próxima
            <ChevronRightIcon class="h-4 w-4" />
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  UsersIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/vue/24/outline'
import { mockPacientes } from '../stores/paciente'
import type { Paciente } from '../types/clinica'

const router = useRouter()

const PAGE_SIZE = 20
const searchQuery = ref('')
const currentPage = ref(1)
const revealedCpfs = ref(new Set<string>())

const isCpfSearch = computed(() => /[\d.-]/.test(searchQuery.value))
const normalizedCpfQuery = computed(() => searchQuery.value.replace(/\D/g, ''))
const isCpfComplete = computed(() => normalizedCpfQuery.value.length === 11)

const filteredPacientes = computed<Paciente[]>(() => {
  if (!searchQuery.value.trim()) {
    return [...mockPacientes].sort((a, b) => a.nome.localeCompare(b.nome))
  }
  if (isCpfSearch.value) {
    if (!isCpfComplete.value) return []
    return mockPacientes.filter(p => (p.cpf ?? '').replace(/\D/g, '') === normalizedCpfQuery.value)
  }
  const q = searchQuery.value.toLowerCase().trim()
  return [...mockPacientes].filter(p => p.nome.toLowerCase().includes(q)).sort((a, b) => a.nome.localeCompare(b.nome))
})

watch(searchQuery, () => { currentPage.value = 1 })

const totalPages = computed(() => Math.max(1, Math.ceil(filteredPacientes.value.length / PAGE_SIZE)))

const paginatedPacientes = computed(() =>
  filteredPacientes.value.slice((currentPage.value - 1) * PAGE_SIZE, currentPage.value * PAGE_SIZE)
)

function getInitials(nome: string): string {
  return nome.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

function maskCpf(cpf: string): string {
  return cpf.replace(/^(\d{3})\.(\d{3})\.(\d{3})-(\d{2})$/, '***.$2.$3-**') || cpf
}

function toggleCpfReveal(id: string) {
  const next = new Set(revealedCpfs.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
    setTimeout(() => {
      revealedCpfs.value = new Set([...revealedCpfs.value].filter(x => x !== id))
    }, 5000)
  }
  revealedCpfs.value = next
}

function getLastConsultation(paciente: Paciente): string {
  const primary = paciente.prontuarios?.find(p => p.numero === paciente.prontuarioPrimario) ?? paciente.prontuarios?.[0]
  return primary?.consultas?.[0]?.data ?? '—'
}

function handleRowClick(paciente: Paciente) {
  router.push(`/briefing?source=base&patientId=${paciente.id}`)
}
</script>
