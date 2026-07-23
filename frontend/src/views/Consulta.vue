<template>
  <div class="flex h-full">

    <!-- Tela pós-finalização (cobre o layout inteiro) -->
    <ResumoConsulta
      v-if="mostrarResumo"
      class="flex-1 min-w-0"
      :texto-a-g-h-u="textoAGHU"
      :encaminhamentos="consulta.encaminhamentos"
      :textos-encaminhamento="textosEncaminhamento"
      @nova-consulta="novaConsulta"
    />

    <!-- Sidebar nav (oculto quando mostrando resumo) -->
    <aside v-if="!mostrarResumo" class="w-56 shrink-0 border-r border-slate-200 bg-white overflow-y-auto">
      <ConsultaNav
        :secoes="consulta.secoes"
        :active-section="consulta.activeSection"
        :completed-sections="consulta.completedSections"
        :started-sections="consulta.startedSections"
        @select-section="consulta.setActiveSection"
      />
    </aside>

    <!-- Main content (oculto quando mostrando resumo) -->
    <div v-if="!mostrarResumo" class="flex flex-1 flex-col overflow-hidden">
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
          <div class="flex flex-col items-end gap-1">
            <button
              class="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
              :disabled="salvandoRascunho"
              @click="salvarRascunho"
            >
              {{ salvandoRascunho ? 'Salvando...' : 'Salvar Rascunho' }}
            </button>
            <p v-if="mensagemRascunho" class="text-xs text-teal-700">{{ mensagemRascunho }}</p>
            <p v-if="erroRascunho" class="text-xs text-red-600">{{ erroRascunho }}</p>
          </div>
          <button
            class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
            :disabled="consulta.finalizandoConsulta"
            @click="mostrarDialogFinalizacao = true"
          >
            {{ consulta.finalizandoConsulta ? 'Finalizando...' : 'Finalizar Consulta' }}
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
          <SecaoImunizacoes v-else-if="consulta.activeSection === 'imunizacoes'" />
          <SecaoEscolaridade v-else-if="consulta.activeSection === 'escolaridade'" />
          <SecaoTriagemNeonatal v-else-if="consulta.activeSection === 'triagemNeonatal'" />
          <SecaoExameFisico v-else-if="consulta.activeSection === 'clinical'" />
          <SecaoMarcos v-else-if="consulta.activeSection === 'milestones'" />
          <SecaoMCHATR v-else-if="consulta.activeSection === 'mchat'" />
          <SecaoHistoriaFamiliar v-else-if="consulta.activeSection === 'historiaFamiliar'" />
          <SecaoDinamicaFamiliar v-else-if="consulta.activeSection === 'dinamicaFamiliar'" />
          <SecaoCondicoesSocioeconomicas v-else-if="consulta.activeSection === 'socioeconomico'" />
          <SecaoEncaminhamentos v-else-if="consulta.activeSection === 'referral'" />
          <SecaoDiagnostico v-else-if="consulta.activeSection === 'diagnostico'" />
          <SecaoHipotesesCondutas v-else-if="consulta.activeSection === 'condutasHipoteses'" />
          <SecaoProcedimentos v-else-if="consulta.activeSection === 'procedimentos'" />
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
        <div class="flex items-center gap-3">
          <div class="flex flex-col items-end gap-1">
            <button
              class="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
              :disabled="salvandoRascunho"
              @click="salvarRascunho"
            >
              {{ salvandoRascunho ? 'Salvando...' : 'Salvar Rascunho' }}
            </button>
            <p v-if="erroRascunho" class="text-xs text-red-600">{{ erroRascunho }}</p>
          </div>
          <div class="flex flex-col items-end gap-1">
            <button
              class="flex items-center gap-1 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              :disabled="!consulta.canGoNext"
              @click="consulta.goNext()"
            >
              Próxima <ChevronRightIcon class="h-4 w-4" />
            </button>
            <p v-if="consulta.erroSalvamentoNavegacao" class="text-xs text-red-600">
              {{ consulta.erroSalvamentoNavegacao }}
            </p>
          </div>
        </div>
      </footer>
    </div>
  </div>

  <!-- Dialog de finalização com validação -->
  <DialogFinalizacao
    v-if="mostrarDialogFinalizacao"
    @confirm-with-aghu="confirmarComAGHU"
    @confirm-without-aghu="confirmarSemAGHU"
    @cancel="mostrarDialogFinalizacao = false"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  ChevronLeftIcon, ChevronRightIcon,
  ChartBarIcon, DocumentTextIcon, ShieldCheckIcon, SparklesIcon,
  AcademicCapIcon, HeartIcon, ClipboardDocumentCheckIcon, CpuChipIcon,
  UsersIcon, HomeIcon, PaperAirplaneIcon, DocumentMagnifyingGlassIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/vue/24/outline'
import { storeToRefs } from 'pinia'
import { usePacienteStore } from '../stores/paciente'
import { useConsultaStore, type SecaoId } from '../stores/consulta'
import { useFilaStore } from '../stores/fila'
import { getGrupoAtivo } from '../data/marcos-desenvolvimento'
import { gerarTextoAGHU, gerarTextoEncaminhamento } from '../utils/gerarTextoAGHU'
import ConsultaNav from '../components/consulta/ConsultaNav.vue'
import ConsultaTimer from '../components/consulta/ConsultaTimer.vue'
import DialogFinalizacao from '../components/consulta/DialogFinalizacao.vue'
import ResumoConsulta from '../components/consulta/ResumoConsulta.vue'
import SecaoMarcos from '../components/consulta/SecaoMarcos.vue'
import SecaoAntropometria from '../components/consulta/SecaoAntropometria.vue'
import SecaoAnamnese from '../components/consulta/SecaoAnamnese.vue'
import SecaoImunizacoes from '../components/consulta/SecaoImunizacoes.vue'
import SecaoExameFisico from '../components/consulta/SecaoExameFisico.vue'
import SecaoEscolaridade from '../components/consulta/SecaoEscolaridade.vue'
import SecaoTriagemNeonatal from '../components/consulta/SecaoTriagemNeonatal.vue'
import SecaoMCHATR from '../components/consulta/SecaoMCHATR.vue'
import SecaoEncaminhamentos from '../components/consulta/SecaoEncaminhamentos.vue'
import SecaoHistoriaFamiliar from '../components/consulta/SecaoHistoriaFamiliar.vue'
import SecaoDinamicaFamiliar from '../components/consulta/SecaoDinamicaFamiliar.vue'
import SecaoCondicoesSocioeconomicas from '../components/consulta/SecaoCondicoesSocioeconomicas.vue'
import SecaoDiagnostico from '../components/consulta/SecaoDiagnostico.vue'
import SecaoHipotesesCondutas from '../components/consulta/SecaoHipotesesCondutas.vue'
import SecaoProcedimentos from '../components/consulta/SecaoProcedimentos.vue'

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
}

const router = useRouter()
const pacienteStore = usePacienteStore()
const { pacienteAtivo } = storeToRefs(pacienteStore)
const consulta = useConsultaStore()
const filaStore = useFilaStore()

const mostrarDialogFinalizacao = ref(false)
const mostrarResumo = ref(false)
const textoAGHU = ref('')
const textosEncaminhamento = ref<string[]>([])
const salvandoRascunho = ref(false)
const mensagemRascunho = ref('')
const erroRascunho = ref('')

const secaoAtiva = computed(() => consulta.secoes.find(s => s.id === consulta.activeSection))

async function carregarContextoDaConsulta() {
  const pacienteId = pacienteAtivo.value?.id
  if (!pacienteId || pacienteStore.modoLeitura) {
    router.push('/fila')
    return
  }

  consulta.prepararConsultaPaciente(pacienteId)
  await consulta.carregarConsultaAtiva()
}

onMounted(carregarContextoDaConsulta)

watch(
  () => pacienteAtivo.value?.id,
  async (novoPacienteId, pacienteAnteriorId) => {
    if (!novoPacienteId) {
      router.push('/fila')
      return
    }

    if (novoPacienteId !== pacienteAnteriorId) {
      await carregarContextoDaConsulta()
    }
  }
)

async function salvarRascunho() {
  if (salvandoRascunho.value) return

  salvandoRascunho.value = true
  mensagemRascunho.value = ''
  erroRascunho.value = ''

  try {
    await consulta.salvarRascunhoSecaoAtiva()
    mensagemRascunho.value = 'Rascunho do atendimento salvo.'
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : 'Não foi possível salvar o rascunho.'
    erroRascunho.value = mensagem
  } finally {
    salvandoRascunho.value = false
  }
}

function calcularDuracaoMinutos(): number {
  if (!consulta.consultaIniciada) return 0
  return Math.round((Date.now() - consulta.consultaIniciada.getTime()) / 60000)
}

function gerarTextos() {
  if (!pacienteAtivo.value) return
  const paciente = pacienteAtivo.value
  const idadeEmMeses = paciente.idadeEmMeses
  const grupo = getGrupoAtivo(idadeEmMeses)

  textoAGHU.value = gerarTextoAGHU({
    paciente,
    tipoEntrada: paciente.tipoEntrada ?? 'Retorno',
    duracaoMinutos: calcularDuracaoMinutos(),
    is0to2: idadeEmMeses <= 24,
    is3to9: idadeEmMeses >= 36 && idadeEmMeses <= 108,
    antropometria: consulta.antropometria,
    anamnese: consulta.anamnese,
    imunizacoes: consulta.imunizacoes,
    triagemNeonatal: consulta.triagemNeonatal,
    escolaridade: consulta.escolaridade,
    encaminhamentos: consulta.encaminhamentos,
    historiaFamiliar: consulta.historiaFamiliar,
    dinamicaFamiliar: consulta.dinamicaFamiliar,
    condicoesSocioeconomicas: consulta.condicoesSocioeconomicas,
    diagnostico: consulta.diagnostico,
    hipotesesCondutas: consulta.hipotesesCondutas,
    procedimentos: consulta.procedimentos,
    statusMarcos: consulta.statusMarcos,
    marcosDoGrupo: grupo.marcos,
    idadeEmMeses,
    classificacaoDesenvolvimento: consulta.classificacaoDesenvolvimento,
    exameFisico: consulta.exameFisico,
  })

  textosEncaminhamento.value = consulta.encaminhamentos.map(enc =>
    gerarTextoEncaminhamento(enc, paciente, consulta.diagnostico, consulta.antropometria)
  )
}

function confirmarComAGHU() {
  mostrarDialogFinalizacao.value = false
  gerarTextos()
  if (pacienteAtivo.value) filaStore.concluirConsulta(pacienteAtivo.value.id)
  mostrarResumo.value = true
}

function confirmarSemAGHU() {
  mostrarDialogFinalizacao.value = false
  if (pacienteAtivo.value) filaStore.concluirConsulta(pacienteAtivo.value.id)
  consulta.resetConsulta()
  pacienteStore.limparPaciente()
  router.push('/fila')
}

function novaConsulta() {
  consulta.resetConsulta()
  pacienteStore.limparPaciente()
  router.push('/fila')
}
</script>
