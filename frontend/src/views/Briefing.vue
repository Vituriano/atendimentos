<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Banner modo leitura -->
    <div v-if="modoLeitura" class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 flex items-center gap-3">
      <InformationCircleIcon class="h-5 w-5 text-amber-600 flex-shrink-0" />
      <p class="text-sm text-amber-800">Modo leitura — visualizando histórico sem iniciar atendimento.</p>
    </div>

    <!-- Header do paciente -->
    <div class="bg-white rounded-xl border border-gray-200 p-5 mb-6 flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ pacienteAtivo?.nome }}</h1>
        <div class="flex flex-wrap gap-4 mt-1 text-sm text-gray-600">
          <span>{{ pacienteAtivo?.idade }}</span>
          <span>·</span>
          <span>Nascimento: {{ pacienteAtivo?.dataNascimento }}</span>
          <span>·</span>
          <span>Prontuário: {{ pacienteAtivo?.prontuario }}</span>
        </div>
      </div>
      <button
        v-if="!modoLeitura"
        @click="router.push('/consulta')"
        class="ml-4 flex-shrink-0 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        Iniciar Atendimento
      </button>
    </div>

    <!-- Layout 2 colunas -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Coluna esquerda: Timeline + Padrões de conduta -->
      <div class="flex flex-col gap-6">

        <!-- Timeline de consultas -->
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <h2 class="text-base font-semibold text-gray-800 mb-4">Histórico de Consultas</h2>
          <div v-if="historicoOrdenado.length === 0" class="text-sm text-gray-500">
            Sem consultas anteriores.
          </div>
          <ol v-else class="relative border-l border-gray-200 ml-2 space-y-4">
            <li
              v-for="consulta in historicoOrdenado"
              :key="consulta.id ?? consulta.data"
              class="ml-4"
            >
              <span class="absolute -left-1.5 mt-1 h-3 w-3 rounded-full border-2 border-white bg-teal-500"></span>
              <div class="flex items-center gap-2 text-sm">
                <span class="font-medium text-gray-700">{{ consulta.data }}</span>
                <span class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {{ consulta.isExterno ? 'Externo' : consulta.tipo }}
                </span>
                <span v-if="consulta.isExterno && consulta.servicoOrigem" class="text-xs text-gray-400">
                  ({{ consulta.servicoOrigem }})
                </span>
              </div>
              <div class="flex items-center gap-3 mt-1">
                <span class="text-sm text-gray-600">
                  Peso: <span class="font-medium">{{ consulta.peso }} kg</span>
                  <span :class="tendenciaClass(consulta.tendenciaPeso)" class="ml-1 font-bold">
                    {{ tendenciaIcon(consulta.tendenciaPeso) }}
                  </span>
                </span>
                <span v-if="consulta.cid" class="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                  CID: {{ consulta.cid }}
                </span>
              </div>
              <p v-if="consulta.encaminhamento" class="text-xs text-purple-700 mt-0.5">
                Encam.: {{ consulta.encaminhamento }}
              </p>
              <p v-if="consulta.observacoes" class="text-xs text-gray-400 italic mt-0.5">
                {{ consulta.observacoes }}
              </p>
            </li>
          </ol>
        </div>

        <!-- Padrões de conduta -->
        <div v-if="historicoOrdenado.length > 0" class="bg-white rounded-xl border border-gray-200 p-5">
          <h2 class="text-base font-semibold text-gray-800 mb-4">Padrões de Conduta</h2>

          <!-- CIDs mais frequentes -->
          <div v-if="cidsFrequentes.length > 0" class="mb-3">
            <p class="text-xs font-medium text-gray-500 uppercase mb-2">CIDs mais frequentes</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="item in cidsFrequentes"
                :key="item.cid"
                class="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-full"
              >
                {{ item.cid }} ({{ item.count }}x)
              </span>
            </div>
          </div>

          <!-- Encaminhamentos -->
          <div v-if="encaminhamentos.length > 0">
            <p class="text-xs font-medium text-gray-500 uppercase mb-2">Encaminhamentos</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="enc in encaminhamentos"
                :key="enc"
                class="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-1 rounded-full"
              >
                {{ enc }}
              </span>
            </div>
          </div>
        </div>

      </div>

      <!-- Coluna direita: Alertas + Antropometria + Sparkline -->
      <div class="flex flex-col gap-6">

        <!-- Alertas categorizados -->
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <h2 class="text-base font-semibold text-gray-800 mb-4">Alertas Clínicos</h2>
          <div v-if="alertasOrdenados.length === 0" class="text-sm text-gray-500">
            Nenhum alerta ativo.
          </div>
          <div v-else class="flex flex-col gap-3">
            <AlertCard
              v-for="alerta in alertasOrdenados"
              :key="alerta.id"
              :alerta="alerta"
            />
          </div>
        </div>

        <!-- Dados antropométricos -->
        <div v-if="antropometria" class="bg-white rounded-xl border border-gray-200 p-5">
          <h2 class="text-base font-semibold text-gray-800 mb-4">Últimos Dados Antropométricos</h2>
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-teal-50 rounded-lg p-3">
              <p class="text-xs text-teal-600 font-medium">Peso</p>
              <p class="text-lg font-bold text-teal-800">{{ antropometria.peso }} kg</p>
              <p class="text-xs text-teal-600">{{ antropometria.percentilPeso }}</p>
            </div>
            <div class="bg-blue-50 rounded-lg p-3">
              <p class="text-xs text-blue-600 font-medium">Altura</p>
              <p class="text-lg font-bold text-blue-800">{{ antropometria.altura }} cm</p>
              <p class="text-xs text-blue-600">{{ antropometria.percentilAltura }}</p>
            </div>
            <div class="bg-purple-50 rounded-lg p-3">
              <p class="text-xs text-purple-600 font-medium">Perímetro Cefálico</p>
              <p class="text-lg font-bold text-purple-800">
                {{ antropometria.perimetroCefalico != null ? antropometria.perimetroCefalico + ' cm' : '—' }}
              </p>
            </div>
            <div class="bg-orange-50 rounded-lg p-3">
              <p class="text-xs text-orange-600 font-medium">IMC</p>
              <p class="text-lg font-bold text-orange-800">{{ antropometria.imc }}</p>
            </div>
          </div>
        </div>

        <!-- Sparkline de peso -->
        <div v-if="historicoOrdenado.length > 1" class="bg-white rounded-xl border border-gray-200 p-5">
          <h2 class="text-base font-semibold text-gray-800 mb-3">Evolução do Peso</h2>
          <Line :data="sparklineData" :options="sparklineOptions" class="max-h-40" />
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { InformationCircleIcon } from '@heroicons/vue/24/outline'
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
import { useBriefingStore } from '../stores/briefing'
import AlertCard from '../components/AlertCard.vue'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

const router = useRouter()
const store = useBriefingStore()

const { pacienteAtivo, historico, alertas, antropometria, modoLeitura } = store

onMounted(() => {
  if (!pacienteAtivo) {
    router.push('/fila')
  }
})

const historicoOrdenado = computed(() =>
  [...historico].reverse()
)

const alertasOrdenados = computed(() =>
  [...alertas].sort((a, b) => {
    if (a.tipo === 'critico' && b.tipo !== 'critico') return -1
    if (a.tipo !== 'critico' && b.tipo === 'critico') return 1
    return 0
  })
)

const cidsFrequentes = computed(() => {
  const counts: Record<string, number> = {}
  for (const c of historico) {
    if (c.cid) {
      counts[c.cid] = (counts[c.cid] ?? 0) + 1
    }
  }
  return Object.entries(counts)
    .map(([cid, count]) => ({ cid, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})

const encaminhamentos = computed(() => {
  const set = new Set<string>()
  for (const c of historico) {
    if (c.encaminhamento) set.add(c.encaminhamento)
  }
  return [...set]
})

function tendenciaIcon(trend: string): string {
  if (trend === 'up') return '↑'
  if (trend === 'down') return '↓'
  return '→'
}

function tendenciaClass(trend: string): string {
  if (trend === 'up') return 'text-green-600'
  if (trend === 'down') return 'text-red-500'
  return 'text-gray-400'
}

const sparklineData = computed(() => ({
  labels: [...historico].map((c) => c.data),
  datasets: [
    {
      data: [...historico].map((c) => c.peso),
      borderColor: '#0d9488',
      backgroundColor: 'rgba(13,148,136,0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
    },
  ],
}))

const sparklineOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
  },
  scales: {
    x: { display: false },
    y: { display: false },
  },
}
</script>
