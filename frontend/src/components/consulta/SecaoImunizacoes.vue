<template>
  <section class="space-y-6">
    <div
      v-if="!possuiHistoricoVacinal"
      class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center"
    >
      <ShieldCheckIcon class="mb-3 h-9 w-9 text-slate-300" />
      <p class="text-sm font-medium text-slate-500">Nenhum dado de vacinação registrado</p>
      <p class="mt-1 max-w-xs text-xs text-slate-400">
        Registre o status vacinal conforme verificado na caderneta física.
      </p>
    </div>

    <div
      v-else
      class="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-5"
    >
      <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div class="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <ClockIcon class="h-5 w-5 text-teal-600" />
            Histórico de vacinação
          </div>
          <p class="mt-1 text-xs text-slate-500">
            Status registrados nas últimas {{ historicoImunizacoes.length }} consultas anteriores deste paciente.
          </p>
        </div>
        <span class="inline-flex w-fit rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
          Últimas consultas
        </span>
      </div>

      <div class="space-y-3">
        <article
          v-for="item in historicoImunizacoes"
          :key="item.consultaId"
          class="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
        >
          <div class="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Consulta de {{ formatarDataConsulta(item.dataConsulta) }}
            </p>
            <p v-if="item.atualizadoEm" class="text-xs text-slate-400">
              Atualizado em {{ formatarDataConsulta(item.atualizadoEm) }}
            </p>
          </div>
          <p class="whitespace-pre-line text-sm leading-relaxed text-slate-700">
            {{ item.statusVacinal }}
          </p>
        </article>
      </div>
    </div>

    <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="space-y-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Status de Imunização</p>
          <p class="mt-1 text-sm text-slate-500">
            Consulte a caderneta física da criança e registre o status geral, últimas doses e pendências observadas.
          </p>
        </div>

        <textarea
          id="status-vacinal"
          v-model="statusVacinal"
          rows="4"
          class="w-full resize-y rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
          placeholder="Ex: Calendário em dia conforme PNI. Última dose: DTP reforço em jan/2025."
        />

        <p class="text-xs text-slate-500">
          A caderneta de vacinas física deve ser verificada. Registre aqui o status geral e quaisquer pendências observadas.
        </p>
      </div>
    </div>

    <div class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
      <div class="space-y-1">
        <div v-if="possuiStatusVacinal" class="flex items-center gap-2 text-sm text-teal-700">
          <CheckCircleIcon class="h-5 w-5" />
          <span>Status vacinal preenchido. A seção será marcada como completa.</span>
        </div>
        <div v-else class="flex items-center gap-2 text-sm text-slate-500">
          <ExclamationCircleIcon class="h-5 w-5" />
          <span>Informe o status de imunização para completar a seção.</span>
        </div>
        <p v-if="imunizacoes.atualizadoEm" class="text-xs text-slate-400">
          Última atualização: {{ dataAtualizacaoFormatada }}
        </p>
        <p v-if="mensagemSucesso" class="text-xs font-medium text-teal-700">{{ mensagemSucesso }}</p>
        <p v-if="erroSalvamentoImunizacoes" class="text-xs font-medium text-red-600">
          {{ erroSalvamentoImunizacoes }}
        </p>
      </div>

      <button
        type="button"
        class="inline-flex items-center justify-center rounded-lg bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="salvandoImunizacoes"
        @click="salvarSecao"
      >
        <span v-if="salvandoImunizacoes">Salvando...</span>
        <span v-else>Salvar seção</span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon,
} from '@heroicons/vue/24/outline'
import { useConsultaStore } from '../../stores/consulta'

const consulta = useConsultaStore()
const {
  imunizacoes,
  historicoImunizacoes,
  salvandoImunizacoes,
  erroSalvamentoImunizacoes,
} = storeToRefs(consulta)
const mensagemSucesso = ref('')

const statusVacinal = computed({
  get: () => imunizacoes.value.statusVacinal,
  set: (valor: string) => {
    mensagemSucesso.value = ''
    consulta.atualizarStatusVacinal(valor)
  },
})

const possuiStatusVacinal = computed(() => statusVacinal.value.trim().length > 0)
const possuiHistoricoVacinal = computed(() => historicoImunizacoes.value.length > 0)

const dataAtualizacaoFormatada = computed(() => {
  if (!imunizacoes.value.atualizadoEm) return ''
  return formatarDataConsulta(imunizacoes.value.atualizadoEm)
})

function formatarDataConsulta(dataIso: string) {
  const data = new Date(dataIso)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(data)
}

async function salvarSecao() {
  mensagemSucesso.value = ''
  await consulta.salvarImunizacoes()
  mensagemSucesso.value = possuiStatusVacinal.value
    ? 'Imunizações salvas no banco e seção marcada como completa.'
    : 'Imunizações salvas no banco. A seção permanece incompleta até informar o status vacinal.'
}
</script>
