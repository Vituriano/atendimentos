<template>
  <div class="flex h-screen overflow-hidden bg-gray-50">
    <!-- Sidebar -->
    <aside
      :class="[sidebarOpen ? 'w-64' : 'w-16', 'transition-all duration-300 bg-white border-r border-gray-200 flex flex-col shrink-0']"
    >
      <!-- Header HC Pediatria -->
      <div class="h-16 flex items-center px-4 bg-teal-600 text-white shrink-0 overflow-hidden">
        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-800 font-bold text-sm">
          HC
        </div>
        <span v-if="sidebarOpen" class="ml-2 font-semibold text-lg whitespace-nowrap">HC Pediatria</span>
      </div>

      <!-- Nav content -->
      <nav class="flex-1 p-2 space-y-1 overflow-y-auto overflow-x-hidden">
        <!-- Seção GERAL -->
        <p v-if="sidebarOpen" class="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
          Geral
        </p>

        <RouterLink
          to="/fila"
          class="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
          active-class="bg-teal-50 text-teal-700 font-medium"
          :title="!sidebarOpen ? 'Fila de Atendimento' : undefined"
        >
          <QueueListIcon class="h-5 w-5 shrink-0" />
          <span v-if="sidebarOpen">Fila de Atendimento</span>
        </RouterLink>

        <RouterLink
          to="/pacientes"
          class="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
          active-class="bg-teal-50 text-teal-700 font-medium"
          :title="!sidebarOpen ? 'Base de Pacientes' : undefined"
        >
          <UsersIcon class="h-5 w-5 shrink-0" />
          <span v-if="sidebarOpen">Base de Pacientes</span>
        </RouterLink>

        <!-- Seção PACIENTE EM ATENDIMENTO -->
        <template v-if="pacienteAtivo">
          <div class="pt-2">
            <p v-if="sidebarOpen" class="px-3 pb-1 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Paciente em Atendimento
            </p>
          </div>

          <!-- PatientChip (inline) -->
          <div v-if="sidebarOpen" class="mx-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div class="flex items-start gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white text-sm font-semibold">
                {{ initials }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate font-medium text-sm text-gray-800">{{ pacienteAtivo.nome }}</p>
                <p class="text-xs text-gray-500">{{ pacienteAtivo.idade }}</p>
                <span class="text-xs text-gray-500">{{ pacienteAtivo.prontuarios?.[0]?.numero ?? pacienteAtivo.prontuario }}</span>
              </div>
            </div>
          </div>
          <div v-else class="flex justify-center py-1">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-white text-xs font-semibold"
              :title="pacienteAtivo.nome"
            >
              {{ initials }}
            </div>
          </div>

          <!-- Patient nav links -->
          <RouterLink
            to="/briefing"
            class="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
            active-class="bg-teal-50 text-teal-700 font-medium"
            :title="!sidebarOpen ? 'Briefing Clínico' : undefined"
          >
            <ClipboardDocumentListIcon class="h-5 w-5 shrink-0" />
            <span v-if="sidebarOpen">Briefing Clínico</span>
          </RouterLink>

          <RouterLink
            to="/consulta"
            class="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
            active-class="bg-teal-50 text-teal-700 font-medium"
            :title="!sidebarOpen ? 'Formulário de Consulta' : undefined"
          >
            <DocumentTextIcon class="h-5 w-5 shrink-0" />
            <span v-if="sidebarOpen">Formulário de Consulta</span>
          </RouterLink>

          <RouterLink
            to="/caderneta"
            class="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
            active-class="bg-teal-50 text-teal-700 font-medium"
            :title="!sidebarOpen ? 'Caderneta Digital' : undefined"
          >
            <BookOpenIcon class="h-5 w-5 shrink-0" />
            <span v-if="sidebarOpen">Caderneta Digital</span>
          </RouterLink>
        </template>
      </nav>

      <!-- Footer: usuário + logout -->
      <div class="border-t border-gray-200 p-2 shrink-0">
        <div v-if="sidebarOpen" class="flex items-center gap-2 px-3 py-2">
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-600 text-xs font-semibold">
            {{ userInitials }}
          </div>
          <span class="flex-1 truncate text-sm text-gray-700">{{ displayName }}</span>
          <button
            @click="handleLogout"
            class="text-gray-400 hover:text-red-500 transition-colors"
            title="Sair"
          >
            <ArrowRightOnRectangleIcon class="h-5 w-5" />
          </button>
        </div>
        <div v-else class="flex justify-center">
          <button
            @click="handleLogout"
            class="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-md"
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
      <header class="h-16 border-b border-gray-200 bg-white flex items-center px-4 gap-3 shrink-0">
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
          :title="sidebarOpen ? 'Recolher menu' : 'Expandir menu'"
        >
          <Bars3Icon class="h-5 w-5" />
        </button>
        <h1 class="text-lg font-semibold text-gray-800">{{ route.meta.title ?? '' }}</h1>
      </header>

      <main class="flex-1 overflow-auto p-6">
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
  UsersIcon,
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

const initials = computed(() => {
  const nome = pacienteAtivo.value?.nome ?? ''
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
})

const displayName = computed(() => {
  const given = auth.user?.givenName
  if (Array.isArray(given) && given.length > 0) return given[0]
  return auth.user?.username ?? ''
})

const userInitials = computed(() =>
  displayName.value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || '?'
)

function handleLogout() {
  auth.logout(router)
}
</script>
