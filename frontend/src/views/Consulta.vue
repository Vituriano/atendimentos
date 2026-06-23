<template>
  <div class="flex h-full">
    <!-- Sidebar nav -->
    <aside class="w-56 shrink-0 border-r border-slate-200 bg-white overflow-y-auto">
      <ConsultaNav
        :secoes="consulta.secoes"
        :active-section="consulta.activeSection"
        :completed-sections="consulta.completedSections"
        @select-section="consulta.setActiveSection"
      />
    </aside>

    <!-- Main content -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Header -->
      <header class="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 shrink-0">
        <div class="flex items-center gap-4">
          <div>
            <p class="text-xs text-slate-400">Consulta em andamento</p>
            <p class="text-sm font-medium text-slate-800">{{ pacienteAtivo?.nome }}</p>
          </div>
          <ConsultaTimer v-if="consulta.consultaIniciada" :start-time="consulta.consultaIniciada" />
        </div>
        <div class="flex items-center gap-2">
          <button
            class="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            @click="salvarRascunho"
          >
            Salvar Rascunho
          </button>
          <button
            class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
            @click="confirmFinalizarOpen = true"
          >
            Finalizar Consulta
          </button>
        </div>
      </header>

      <!-- Section content -->
      <main class="flex-1 overflow-y-auto p-6">
        <div class="mx-auto max-w-3xl">
          <h2 class="mb-6 text-lg font-semibold text-slate-900">
            {{ secaoAtiva?.label }}
          </h2>
          <!-- Placeholder — cada seção será implementada em tasks separadas -->
          <div class="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-sm text-slate-400">
            Conteúdo da seção "{{ secaoAtiva?.label }}" será implementado em breve.
          </div>
        </div>
      </main>

      <!-- Prev / Next -->
      <footer class="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-3 shrink-0">
        <button
          class="flex items-center gap-1 rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          :disabled="!consulta.canGoPrev"
          @click="consulta.goPrev()"
        >
          <ChevronLeftIcon class="h-4 w-4" /> Anterior
        </button>
        <span class="text-xs text-slate-400">
          {{ consulta.currentIndex + 1 }} / {{ consulta.secoes.length }}
        </span>
        <button
          class="flex items-center gap-1 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          :disabled="!consulta.canGoNext"
          @click="consulta.goNext()"
        >
          Próxima <ChevronRightIcon class="h-4 w-4" />
        </button>
      </footer>
    </div>
  </div>

  <!-- Dialog de confirmação -->
  <div
    v-if="confirmFinalizarOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    @click.self="confirmFinalizarOpen = false"
  >
    <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
      <div class="mb-4 flex items-start justify-between">
        <h3 class="text-base font-semibold text-slate-900">Finalizar consulta?</h3>
        <button class="text-slate-400 hover:text-slate-600" @click="confirmFinalizarOpen = false">
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
      <p class="mb-6 text-sm text-slate-600">
        A consulta será marcada como concluída. Verifique se todas as seções foram preenchidas antes de finalizar.
      </p>
      <div class="flex justify-end gap-3">
        <button
          class="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
          @click="confirmFinalizarOpen = false"
        >
          Cancelar
        </button>
        <button
          class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          @click="finalizarConsulta"
        >
          Confirmar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { storeToRefs } from 'pinia'
import { usePacienteStore } from '../stores/paciente'
import { useConsultaStore } from '../stores/consulta'
import ConsultaNav from '../components/consulta/ConsultaNav.vue'
import ConsultaTimer from '../components/consulta/ConsultaTimer.vue'

const router = useRouter()
const pacienteStore = usePacienteStore()
const { pacienteAtivo } = storeToRefs(pacienteStore)
const consulta = useConsultaStore()

const confirmFinalizarOpen = ref(false)

const secaoAtiva = computed(() => consulta.secoes.find(s => s.id === consulta.activeSection))

onMounted(() => {
  if (!pacienteAtivo.value) {
    router.push('/fila')
    return
  }
  if (!consulta.consultaIniciada) {
    consulta.iniciarConsulta()
  }
})

function salvarRascunho() {
  // placeholder — implementado na task "Salvar consulta"
}

function finalizarConsulta() {
  confirmFinalizarOpen.value = false
  consulta.resetConsulta()
  pacienteStore.limparPaciente()
  router.push('/fila')
}
</script>
