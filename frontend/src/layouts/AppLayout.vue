<template>
  <div class="flex h-screen overflow-hidden bg-gray-50">
    <!-- Sidebar -->
    <aside
      :class="[sidebarOpen ? 'w-64' : 'w-16', 'transition-all duration-300 bg-white border-r border-slate-200 flex flex-col shrink-0']"
    >
      <!-- Header Evoluir -->
      <div class="h-16 flex items-center px-4 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200 shrink-0 overflow-hidden">
        <img src="/favicon.svg" alt="Evoluir" class="h-8 w-8 shrink-0" />
        <span v-if="sidebarOpen" class="ml-2 font-semibold text-lg text-slate-800 whitespace-nowrap">Evoluir</span>
      </div>

      <!-- Nav content -->
      <nav class="flex-1 p-2 space-y-1 overflow-y-auto overflow-x-hidden">
        <!-- Seção GERAL -->
        <p v-if="sidebarOpen" class="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          Geral
        </p>

        <RouterLink
          to="/fila"
          class="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          active-class="bg-slate-100 text-slate-900 font-medium"
          :title="!sidebarOpen ? 'Fila de Atendimento' : undefined"
        >
          <QueueListIcon class="h-4 w-4 shrink-0" />
          <span v-if="sidebarOpen">Fila de Atendimento</span>
        </RouterLink>

        <RouterLink
          to="/pacientes"
          class="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          active-class="bg-slate-100 text-slate-900 font-medium"
          :title="!sidebarOpen ? 'Base de Pacientes' : undefined"
        >
          <CircleStackIcon class="h-4 w-4 shrink-0" />
          <span v-if="sidebarOpen">Base de Pacientes</span>
        </RouterLink>

        <!-- Seção PACIENTE EM ATENDIMENTO -->
        <div class="pt-2">
          <p v-if="sidebarOpen" class="px-3 pb-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            Paciente em Atendimento
          </p>
        </div>

        <!-- PatientChip quando há paciente -->
        <template v-if="pacienteAtivo">
          <div v-if="sidebarOpen" class="mx-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div class="flex items-start gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white text-sm font-semibold">
                {{ initials }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate font-medium text-sm text-slate-800">{{ pacienteAtivo.nome }}</p>
                <p class="text-xs text-slate-500">{{ pacienteAtivo.idade }}</p>
                <div class="mt-1 flex flex-wrap items-center gap-1.5">
                  <span class="text-xs text-slate-500">{{ pacienteAtivo.prontuarios?.[0]?.numero ?? pacienteAtivo.prontuario }}</span>
                  <span v-if="tipoEntradaPaciente" class="rounded-full border border-slate-300 px-1.5 py-0 text-[10px] text-slate-600">
                    {{ tipoEntradaPaciente }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="flex justify-center py-1">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-full bg-teal-700 text-white text-xs font-semibold"
              :title="pacienteAtivo.nome"
            >
              {{ initials }}
            </div>
          </div>

          <!-- Patient nav links (active) -->
          <RouterLink
            to="/briefing"
            class="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            active-class="bg-slate-100 text-slate-900 font-medium"
            :title="!sidebarOpen ? 'Briefing Clínico' : undefined"
          >
            <ClipboardDocumentListIcon class="h-4 w-4 shrink-0" />
            <span v-if="sidebarOpen">Briefing Clínico</span>
          </RouterLink>

          <RouterLink
            v-if="!modoLeitura"
            to="/consulta"
            class="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            active-class="bg-slate-100 text-slate-900 font-medium"
            :title="!sidebarOpen ? 'Formulário de Consulta' : undefined"
          >
            <DocumentTextIcon class="h-4 w-4 shrink-0" />
            <span v-if="sidebarOpen">Formulário de Consulta</span>
          </RouterLink>

          <RouterLink
            to="/caderneta"
            class="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            active-class="bg-slate-100 text-slate-900 font-medium"
            :title="!sidebarOpen ? 'Caderneta Digital' : undefined"
          >
            <BookOpenIcon class="h-4 w-4 shrink-0" />
            <span v-if="sidebarOpen">Caderneta Digital</span>
          </RouterLink>
        </template>

        <!-- Patient nav links (disabled — sem paciente ativo) -->
        <template v-else>
          <div
            v-for="item in patientNavItems"
            :key="item.label"
            class="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-400 cursor-not-allowed opacity-50"
            :title="!sidebarOpen ? item.label : 'Selecione um paciente na Fila de Atendimento'"
          >
            <component :is="item.icon" class="h-4 w-4 shrink-0" />
            <span v-if="sidebarOpen">{{ item.label }}</span>
          </div>
        </template>
      </nav>

      <!-- Footer: usuário + logout -->
      <div class="border-t border-slate-200 p-2 shrink-0">
        <div v-if="sidebarOpen" class="flex items-center gap-2 px-3 py-2">
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 text-xs font-semibold">
            {{ userInitials }}
          </div>
          <span class="flex-1 truncate text-sm text-slate-700">{{ displayName }}</span>
          <button
            @click="handleLogout"
            class="text-slate-400 hover:text-red-500 transition-colors"
            title="Sair"
          >
            <ArrowRightOnRectangleIcon class="h-5 w-5" />
          </button>
        </div>
        <div v-else class="flex justify-center">
          <button
            @click="handleLogout"
            class="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-md"
            title="Sair"
          >
            <ArrowRightOnRectangleIcon class="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Conteúdo principal -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header sticky -->
      <header class="h-16 border-b border-slate-200 bg-white flex items-center px-4 gap-2 shrink-0">
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
          :title="sidebarOpen ? 'Recolher menu' : 'Expandir menu'"
        >
          <Bars3Icon class="h-5 w-5" />
        </button>
        <div class="h-4 w-px bg-slate-200 mx-1" />
        <h1 class="text-xl font-bold tracking-tight text-slate-900">{{ route.meta.title ?? '' }}</h1>
      </header>

      <main class="flex-1 overflow-auto px-6 py-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  QueueListIcon,
  CircleStackIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  BookOpenIcon,
  Bars3Icon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '../stores/auth'
import { usePacienteStore } from '../stores/paciente'

const sidebarOpen = ref(true)
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const pacienteStore = usePacienteStore()

const pacienteAtivo = computed(() => pacienteStore.pacienteAtivo)
const tipoEntradaPaciente = computed(() => pacienteAtivo.value?.tipoEntrada ?? null)
const modoLeitura = computed(() => pacienteStore.modoLeitura)

const patientNavItems = [
  { label: 'Briefing Clínico', icon: ClipboardDocumentListIcon },
  { label: 'Formulário de Consulta', icon: DocumentTextIcon },
  { label: 'Caderneta Digital', icon: BookOpenIcon },
]

const initials = computed(() => {
  const nome = pacienteAtivo.value?.nome ?? ''
  return nome.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
})

const displayName = computed(() => {
  const given = auth.user?.givenName
  if (Array.isArray(given) && given.length > 0) return given[0]
  return auth.user?.username ?? ''
})

const userInitials = computed(() =>
  displayName.value.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?'
)

function handleLogout() {
  auth.logout(router)
}
</script>
