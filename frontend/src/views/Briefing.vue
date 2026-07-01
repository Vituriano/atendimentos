<template>
  <div class="space-y-6">
    <!-- Botão Voltar (modo leitura via base de pacientes ou fila) -->
    <div v-if="isReadOnly" class="flex items-center gap-3">
      <button
        @click="router.push(route.query.source === 'fila' ? '/fila' : '/pacientes')"
        class="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
      >
        <ArrowLeftIcon class="h-4 w-4" />
        {{ route.query.source === 'fila' ? 'Voltar para Fila' : 'Voltar para Base de Pacientes' }}
      </button>
    </div>

    <!-- Banner modo leitura -->
    <div v-if="isReadOnly" class="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
      <InformationCircleIcon class="h-4 w-4 shrink-0" />
      Visualização histórica — paciente não está em atendimento ativo
    </div>

    <!-- Header do paciente -->
    <div class="rounded-lg border border-slate-200 bg-white p-5">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div class="space-y-1">
          <div class="flex items-center gap-3">
            <h1 class="text-xl font-semibold text-slate-900">{{ currentPatient?.nome }}</h1>
          </div>
          <p class="text-sm text-slate-500">
            {{ currentPatient?.idade }}
            · Nascimento: {{ currentPatient?.dataNascimento }}
            · Prontuário: {{ prontuarioPrimario }}
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <template v-if="!isReadOnly">
            <button
              v-if="consultaEmAndamento"
              @click="router.push('/consulta')"
              class="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <ClockIcon class="h-4 w-4" />
              Continuar Atendimento
              <span class="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">Em andamento</span>
            </button>
            <button
              v-else
              @click="confirmStartOpen = true"
              class="inline-flex items-center gap-2 rounded-md bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700"
            >
              <PlayIcon class="h-4 w-4" />
              Iniciar Atendimento
            </button>
          </template>

          <button
            disabled
            class="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-400 cursor-not-allowed"
            title="Caderneta Digital (em breve)"
          >
            <BookOpenIcon class="h-4 w-4" />
            Ver Caderneta Digital
          </button>
          <button
            @click="prontuarioOpen = true"
            class="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <DocumentTextIcon class="h-4 w-4" />
            Ver Prontuário Completo
          </button>
        </div>
      </div>

      <!-- Banner consulta em andamento -->
      <div
        v-if="!isReadOnly && consultaEmAndamento"
        class="mt-4 flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700"
      >
        <ClockIcon class="h-4 w-4 shrink-0" />
        <span>Consulta em andamento</span>
        <span class="ml-auto font-medium">Timer ativo no formulário</span>
      </div>
    </div>

    <!-- Grid 2 colunas -->
    <div class="grid gap-6 lg:grid-cols-2">

      <!-- Coluna esquerda -->
      <div class="space-y-6">

        <!-- Timeline -->
        <div class="rounded-lg border border-slate-200 bg-white">
          <div class="border-b border-slate-100 px-5 py-4">
            <h2 class="text-sm font-semibold text-slate-800">Linha do Tempo</h2>
            <p class="text-xs text-slate-500 mt-0.5">Últimas consultas</p>
          </div>
          <div class="p-5 space-y-3">
            <p v-if="historicoOrdenado.length === 0" class="text-sm text-slate-400">Sem consultas anteriores.</p>
            <div
              v-for="consulta in historicoOrdenado"
              :key="consulta.id ?? consulta.data"
              :class="[
                'rounded-lg border p-3 space-y-1.5 transition-colors hover:border-slate-300',
                consulta.isExterno ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200'
              ]"
            >
              <!-- Externa -->
              <template v-if="consulta.isExterno">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <ArrowDownTrayIcon class="h-4 w-4 text-slate-400" />
                    <span class="text-sm font-medium text-slate-700">{{ consulta.data }}</span>
                    <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">Externo</span>
                    <span class="text-sm text-slate-600">
                      {{ consulta.peso }}kg
                      <component :is="trendIcon(consulta.tendenciaPeso)" :class="trendClass(consulta.tendenciaPeso)" class="inline h-3 w-3 ml-0.5" />
                    </span>
                  </div>
                  <span class="cursor-help" :title="'Dados de atendimento externo ao HC, inseridos com base em informações da família.'">
                    <InformationCircleIcon class="h-4 w-4 text-slate-400" />
                  </span>
                </div>
                <div class="text-xs text-slate-400">{{ consulta.servicoOrigem }}</div>
              </template>

              <!-- Regular -->
              <template v-else>
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-slate-700">{{ consulta.data }}</span>
                    <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{{ consulta.tipo }}</span>
                    <span class="text-sm text-slate-600">
                      {{ consulta.peso }}kg
                      <component :is="trendIcon(consulta.tendenciaPeso)" :class="trendClass(consulta.tendenciaPeso)" class="inline h-3 w-3 ml-0.5" />
                    </span>
                  </div>
                </div>
                <div class="flex items-center gap-3 text-xs text-slate-400">
                  <span>CID: {{ consulta.cid ?? '—' }}</span>
                  <span>{{ consulta.encaminhamento ? `Encam.: ${consulta.encaminhamento}` : 'Sem encaminhamento' }}</span>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Padrões de conduta -->
        <div class="rounded-lg border border-slate-200 bg-white">
          <div class="border-b border-slate-100 px-5 py-4">
            <h2 class="text-sm font-semibold text-slate-800">Padrão de Condutas</h2>
          </div>
          <div class="p-5 space-y-4">
            <div>
              <p class="text-xs font-medium uppercase text-slate-400 mb-1">CIDs mais frequentes</p>
              <p class="text-sm text-slate-700">
                <template v-if="cidsFrequentes.length > 0">{{ cidsFrequentes.map(c => `${c.cid} (${c.count}x)`).join(', ') }}</template>
                <span v-else class="text-slate-400">Nenhum registrado</span>
              </p>
            </div>
            <div>
              <p class="text-xs font-medium uppercase text-slate-400 mb-1">Encaminhamentos</p>
              <p class="text-sm text-slate-700">
                <span v-if="encaminhamentos.length > 0">{{ encaminhamentos.join(' · ') }}</span>
                <span v-else class="text-slate-400">Nenhum registrado</span>
              </p>
            </div>
            <div>
              <p class="text-xs font-medium uppercase text-slate-400 mb-1">Internações</p>
              <p class="text-sm text-slate-400">Nenhuma registrada</p>
            </div>
          </div>
        </div>

      </div>

      <!-- Coluna direita -->
      <div class="space-y-6">

        <!-- Alertas -->
        <div class="rounded-lg border-l-4 border border-amber-400 bg-white">
          <div class="border-b border-slate-100 px-5 py-4">
            <h2 class="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <ExclamationTriangleIcon class="h-4 w-4 text-amber-600" />
              Alertas Ativos
            </h2>
          </div>
          <div class="p-5 space-y-3">
            <p v-if="alertasOrdenados.length === 0" class="text-sm text-slate-400">Nenhum alerta ativo.</p>
            <div
              v-for="alerta in alertasOrdenados"
              :key="alerta.id"
              class="flex items-start gap-3 text-sm"
            >
              <ExclamationCircleIcon v-if="alerta.tipo === 'critico'" class="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
              <ExclamationTriangleIcon v-else class="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <span :class="alerta.tipo === 'critico' ? 'text-red-800' : 'text-amber-800'" class="flex-1">
                <strong>{{ alerta.tipo === 'critico' ? 'ALERTA: ' : 'ATENÇÃO: ' }}</strong>{{ alerta.mensagem }}
              </span>
              <span :class="categoryBadgeClass(alerta.categoria)" class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium">
                {{ categoryLabel(alerta.categoria) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Dados coletados + sparkline -->
        <div class="rounded-lg border border-slate-200 bg-white">
          <div class="border-b border-slate-100 px-5 py-4">
            <h2 class="text-sm font-semibold text-slate-800">Últimos Dados Coletados</h2>
            <p v-if="dataUltimaConsulta" class="mt-0.5 text-xs text-slate-500">{{ dataUltimaConsulta }}</p>
          </div>
          <div class="p-5 space-y-4">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-slate-500">Peso:</span>
                <span class="ml-1 font-medium text-slate-800">{{ currentAntropometria?.peso }} kg</span>
                <span class="ml-1 text-slate-400">({{ currentAntropometria?.percentilPeso }})</span>
              </div>
              <div>
                <span class="text-slate-500">Altura:</span>
                <span class="ml-1 font-medium text-slate-800">{{ currentAntropometria?.altura }} cm</span>
                <span class="ml-1 text-slate-400">({{ currentAntropometria?.percentilAltura }})</span>
              </div>
              <div>
                <span class="text-slate-500">Perímetro Cefálico:</span>
                <span v-if="currentAntropometria?.perimetroCefalico != null" class="ml-1 font-medium text-slate-800">{{ currentAntropometria?.perimetroCefalico }} cm</span>
                <span v-else class="ml-1 italic text-slate-400">não registrado</span>
              </div>
              <div>
                <span class="text-slate-500">IMC:</span>
                <span class="ml-1 font-medium text-slate-800">{{ currentAntropometria?.imc }}</span>
              </div>
            </div>

            <div v-if="historicoOrdenado.length > 1" class="border-t border-slate-100 pt-4">
              <p class="mb-2 text-xs font-medium text-slate-400">Evolução do Peso (últimas consultas)</p>
              <Line :data="sparklineData" :options="sparklineOptions" class="max-h-36" />
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Dialog: Prontuário AGHU -->
    <div v-if="prontuarioOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="prontuarioOpen = false">
      <div class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
        <div class="mb-1 flex items-center gap-2">
          <DocumentTextIcon class="h-5 w-5 text-teal-700" />
          <h3 class="text-base font-semibold text-slate-800">Prontuário Completo</h3>
        </div>
        <p class="mb-4 text-sm text-slate-500">O prontuário completo está disponível no AGHU.</p>

        <div class="mb-3 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm space-y-0.5">
          <p class="font-medium text-slate-800">{{ currentPatient?.nome }}</p>
          <p class="text-slate-500">Prontuário: {{ prontuarioPrimario }}</p>
        </div>
        <p class="mb-3 text-sm text-slate-600">
          Para acessar o histórico completo, evolução e exames anteriores, acesse o prontuário no
          <strong>AGHU</strong> e busque pelo número acima.
        </p>
        <div class="mb-5 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          <ExclamationTriangleIcon class="h-3.5 w-3.5 shrink-0" />
          O prontuário legal do paciente é mantido no AGHU. Este sistema registra os dados estruturados das consultas realizadas aqui.
        </div>

        <div class="flex flex-col gap-2 sm:flex-row">
          <button
            @click="copyRecord"
            class="inline-flex items-center justify-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            <DocumentDuplicateIcon class="h-4 w-4" />
            Copiar número do prontuário
          </button>
          <button
            @click="prontuarioOpen = false"
            class="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>

    <!-- Dialog: Confirmar início -->
    <div v-if="confirmStartOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="confirmStartOpen = false">
      <div class="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
        <h3 class="mb-2 text-base font-semibold text-slate-800">Iniciar atendimento?</h3>
        <p class="mb-6 text-sm text-slate-600">
          Você está prestes a iniciar o atendimento de <strong>{{ currentPatient?.nome }}</strong>.
        </p>
        <div class="flex justify-end gap-2">
          <button
            @click="confirmStartOpen = false"
            class="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            @click="confirmarInicio"
            class="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            Confirmar e Iniciar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  InformationCircleIcon,
  ClockIcon,
  PlayIcon,
  BookOpenIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
  ExclamationTriangleIcon,
  DocumentDuplicateIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon,
} from '@heroicons/vue/24/outline'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js'
import { useConsultaStore } from '../stores/consulta'
import { usePacienteStore } from '../stores/paciente'
import { storeToRefs } from 'pinia'
import type { CategoriaAlerta } from '../types/clinica'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

const router = useRouter()
const route = useRoute()
const pacienteStore = usePacienteStore()
const consultaStore = useConsultaStore()
const { pacienteAtivo, historico, alertas } = storeToRefs(pacienteStore)

const isReadOnly = computed(() => route.query.source === 'base' || route.query.source === 'fila')
const patientIdFromUrl = computed(() => route.query.patientId as string | undefined)

const currentPatient = computed(() => pacienteAtivo.value)

const currentHistorico = computed(() => historico.value ?? [])

const currentAlertas = computed(() => alertas.value ?? [])

const currentAntropometria = computed(() => pacienteStore.antropometria)

const prontuarioOpen = ref(false)
const confirmStartOpen = ref(false)

const prontuarioPrimario = computed(
  () => currentPatient.value?.prontuarioPrimario ?? currentPatient.value?.prontuario ?? '—'
)

const consultaEmAndamento = computed(() => !isReadOnly.value && !!consultaStore.consultaIniciada)
const dataUltimaConsulta = computed(() => historicoOrdenado.value[0]?.data ?? null)

onMounted(async () => {
  if (!currentPatient.value) {
    router.push('/fila')
    return
  }
  const idParaCarregar = patientIdFromUrl.value ?? currentPatient.value.id
  await pacienteStore.carregarBriefing(idParaCarregar)
})

const historicoOrdenado = computed(() => [...currentHistorico.value].reverse())

const alertasOrdenados = computed(() =>
  [...currentAlertas.value].sort((a, b) => {
    if (a.tipo === 'critico' && b.tipo !== 'critico') return -1
    if (a.tipo !== 'critico' && b.tipo === 'critico') return 1
    return 0
  })
)

const cidsFrequentes = computed(() => {
  const counts: Record<string, number> = {}
  for (const c of currentHistorico.value) {
    if (c.cid) counts[c.cid] = (counts[c.cid] ?? 0) + 1
  }
  return Object.entries(counts)
    .map(([cid, count]) => ({ cid, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})

const encaminhamentos = computed(() => {
  const set = new Set<string>()
  for (const c of currentHistorico.value) {
    if (c.encaminhamento) set.add(c.encaminhamento)
  }
  return [...set]
})

function trendIcon(trend: string) {
  if (trend === 'up') return ArrowUpIcon
  if (trend === 'down') return ArrowDownIcon
  return MinusIcon
}

function trendClass(trend: string) {
  if (trend === 'up') return 'text-green-600'
  if (trend === 'down') return 'text-red-600'
  return 'text-slate-400'
}


const categoryLabels: Record<string, string> = {
  peso: 'Peso', marco: 'Marco', encaminhamento: 'Encaminhamento', falta: 'Falta', negligencia: 'Negligência',
}

function categoryLabel(cat: CategoriaAlerta) {
  return categoryLabels[cat] ?? cat
}

function categoryBadgeClass(cat: CategoriaAlerta) {
  const map: Record<string, string> = {
    peso: 'bg-teal-100 text-teal-700',
    marco: 'bg-violet-100 text-violet-700',
    encaminhamento: 'bg-amber-100 text-amber-700',
    falta: 'bg-orange-100 text-orange-700',
    negligencia: 'bg-red-100 text-red-700',
  }
  return map[cat] ?? 'bg-slate-100 text-slate-600'
}

function confirmarInicio() {
  confirmStartOpen.value = false
  router.push('/consulta')
}

function copyRecord() {
  navigator.clipboard.writeText(prontuarioPrimario.value).catch(() => {})
  prontuarioOpen.value = false
}

const sparklineData = computed(() => ({
  labels: historicoOrdenado.value.map((c) => c.data),
  datasets: [{
    data: historicoOrdenado.value.map((c) => c.peso),
    borderColor: '#0d9488',
    backgroundColor: 'rgba(13,148,136,0.08)',
    fill: true,
    tension: 0.4,
    pointRadius: 3,
    pointBackgroundColor: '#0d9488',
  }],
}))

const sparklineOptions = {
  responsive: true,
  plugins: { legend: { display: false }, tooltip: { enabled: true } },
  scales: { x: { display: false }, y: { display: false } },
}
</script>
