<template>
  <div class="flex h-full">
    <!-- Sidebar nav -->
    <aside class="w-56 shrink-0 border-r border-slate-200 bg-white overflow-y-auto">
      <ConsultaNav
        :secoes="consulta.secoes"
        :active-section="consulta.activeSection"
        :completed-sections="consulta.completedSections"
        :started-sections="consulta.startedSections"
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
        <div class="space-y-6">
          <!-- Section header: icon + title + description + separator -->
          <div class="space-y-2">
            <div class="flex items-center gap-3">
              <component
                :is="sectionIcons[consulta.activeSection]"
                class="h-6 w-6 text-teal-700"
              />
              <h2 class="text-xl font-semibold text-slate-900">{{ secaoAtiva?.label }}</h2>
            </div>
            <p class="text-sm text-slate-500">{{ sectionDescriptions[consulta.activeSection] }}</p>
            <hr class="border-slate-200" />
          </div>

          <SecaoAntropometria v-if="consulta.activeSection === 'anthropometric'" />
          <SecaoAnamnese v-else-if="consulta.activeSection === 'anamnesis'" />
          <SecaoMarcos v-else-if="consulta.activeSection === 'milestones'" />
          <!-- Placeholder para seções ainda não implementadas -->
          <div v-else class="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-sm text-slate-400">
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
import {
  ChevronLeftIcon, ChevronRightIcon, XMarkIcon,
  ChartBarIcon, DocumentTextIcon, ShieldCheckIcon, SparklesIcon,
  AcademicCapIcon, HeartIcon, ClipboardDocumentCheckIcon, CpuChipIcon,
  UsersIcon, HomeIcon, PaperAirplaneIcon, DocumentMagnifyingGlassIcon,
  WrenchScrewdriverIcon, DocumentArrowDownIcon,
} from '@heroicons/vue/24/outline'
import { storeToRefs } from 'pinia'
import { usePacienteStore } from '../stores/paciente'
import { useConsultaStore, type SecaoId } from '../stores/consulta'
import ConsultaNav from '../components/consulta/ConsultaNav.vue'
import ConsultaTimer from '../components/consulta/ConsultaTimer.vue'
import SecaoMarcos from '../components/consulta/SecaoMarcos.vue'
import SecaoAntropometria from '../components/consulta/SecaoAntropometria.vue'
import SecaoAnamnese from '../components/consulta/SecaoAnamnese.vue'

const sectionIcons: Record<SecaoId, unknown> = {
  anthropometric: ChartBarIcon,
  anamnesis: DocumentTextIcon,
  imunizacoes: ShieldCheckIcon,
  triagemNeonatal: SparklesIcon,
  escolaridade: AcademicCapIcon,
  clinical: HeartIcon,
  milestones: ClipboardDocumentCheckIcon,
  mchat: CpuChipIcon,
  historiaFamiliar: UsersIcon,
  dinamicaFamiliar: HeartIcon,
  socioeconomico: HomeIcon,
  referral: PaperAirplaneIcon,
  diagnostico: DocumentMagnifyingGlassIcon,
  condutasHipoteses: DocumentTextIcon,
  procedimentos: WrenchScrewdriverIcon,
  externo: DocumentArrowDownIcon,
}

const sectionDescriptions: Record<SecaoId, string> = {
  anthropometric: 'Registre as medidas aferidas nesta consulta.',
  anamnesis: 'Queixa principal, HDA, alimentação e hábitos de vida.',
  imunizacoes: 'Registre o status vacinal conforme o Calendário Nacional de Imunização (PNI).',
  escolaridade: 'Crescimento e desenvolvimento — avaliação escolar (opinião dos familiares).',
  triagemNeonatal: 'Registro dos testes de triagem neonatal e dados do nascimento.',
  clinical: 'Avaliação cefálo-caudal por sistemas. Selecione os sistemas avaliados.',
  milestones: 'Acompanhamento do desenvolvimento neuropsicomotor por faixa etária.',
  mchat: 'Triagem de risco para Transtorno do Espectro Autista. Aplicável de 16 a 30 meses.',
  historiaFamiliar: 'Condições de saúde e contexto dos familiares próximos.',
  dinamicaFamiliar: 'Triagem psicossocial — perguntas estruturadas sobre contexto familiar.',
  socioeconomico: 'Condições de moradia e contexto socioeconômico familiar — coletado apenas na primeira consulta.',
  referral: 'Registre os encaminhamentos gerados nesta consulta.',
  diagnostico: 'Registro do diagnóstico principal e secundários (CID-10 / SID).',
  condutasHipoteses: 'Raciocínio clínico e plano de cuidado desta consulta.',
  procedimentos: 'Procedimentos realizados durante o atendimento, vinculados ao diagnóstico.',
  externo: 'Dados de consultas realizadas em outros serviços, fornecidos pela família.',
}

const router = useRouter()
const pacienteStore = usePacienteStore()
const { pacienteAtivo } = storeToRefs(pacienteStore)
const consulta = useConsultaStore()

const confirmFinalizarOpen = ref(false)

const secaoAtiva = computed(() => consulta.secoes.find(s => s.id === consulta.activeSection))

onMounted(async () => {
  if (!pacienteAtivo.value) {
    router.push('/fila')
    return
  }
  if (!consulta.consultaIniciada) {
    consulta.iniciarConsulta()
  }

  await consulta.carregarConsultaAtiva()
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
