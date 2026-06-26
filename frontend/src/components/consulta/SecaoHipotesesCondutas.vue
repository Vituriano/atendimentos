<template>
  <section class="space-y-5">
    <div
      v-if="!possuiConteudoRegistrado"
      class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center"
    >
      <ClipboardDocumentListIcon class="mx-auto mb-3 h-8 w-8 text-slate-300" />
      <p class="text-sm font-medium text-slate-500">Raciocínio clínico ainda não registrado</p>
      <p class="mt-1 text-xs text-slate-400">
        Registre as hipóteses diagnósticas e o plano de cuidado ao encerrar a consulta.
      </p>
    </div>

    <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">Hipóteses Diagnósticas</label>
      <textarea
        :value="dados.hipotesesDiagnosticas"
        class="mt-3 min-h-24 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
        placeholder="Ex: 1. Asma brônquica (J45). 2. DRGE associada. 3. Rinite alérgica a investigar."
        @input="consulta.atualizarCampoHipotesesCondutas('hipotesesDiagnosticas', ($event.target as HTMLTextAreaElement).value)"
      />
      <p class="mt-2 text-xs text-slate-500">
        Este campo destina-se ao raciocínio clínico. O diagnóstico formal deve ser registrado na seção Diagnóstico.
      </p>
    </div>

    <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">Condutas e Plano de Cuidado</label>
      <textarea
        :value="dados.condutasPlanoCuidado"
        class="mt-3 min-h-24 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
        placeholder="Ex: 1. Manter dieta habitual. 2. Retorno em 30 dias. 3. Azitromicina 10mg/kg/dia por 3 dias. 4. Encaminhar Pneumologia."
        @input="consulta.atualizarCampoHipotesesCondutas('condutasPlanoCuidado', ($event.target as HTMLTextAreaElement).value)"
      />
      <p class="mt-2 text-xs text-slate-500">
        Inclua orientações à família, prescrições, solicitação de exames, encaminhamentos e data de retorno.
      </p>
    </div>

    <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p v-if="secaoCompleta" class="text-sm font-medium text-teal-700">
            <CheckCircleIcon class="mr-1 inline h-4 w-4" />
            Hipóteses e condutas preenchidas. A seção está completa.
          </p>
          <p v-else-if="possuiConteudoRegistrado" class="text-sm font-medium text-amber-700">
            Preencha hipóteses diagnósticas e condutas/plano de cuidado para concluir a seção.
          </p>
          <p v-else class="text-sm text-slate-500">
            Registre as hipóteses diagnósticas e o plano de cuidado desta consulta.
          </p>
          <p v-if="mensagemSucesso" class="mt-1 text-xs text-teal-700">{{ mensagemSucesso }}</p>
          <p v-if="consulta.erroSalvamentoHipotesesCondutas" class="mt-1 text-xs text-red-600">
            {{ consulta.erroSalvamentoHipotesesCondutas }}
          </p>
        </div>
        <button
          class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          :disabled="consulta.salvandoHipotesesCondutas"
          @click="salvar"
        >
          {{ consulta.salvandoHipotesesCondutas ? 'Salvando...' : 'Salvar seção' }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { CheckCircleIcon, ClipboardDocumentListIcon } from '@heroicons/vue/24/outline'
import { useConsultaStore } from '../../stores/consulta'

const consulta = useConsultaStore()
const mensagemSucesso = ref('')
const dados = computed(() => consulta.hipotesesCondutas)

const possuiConteudoRegistrado = computed(() => (
  dados.value.hipotesesDiagnosticas.trim().length > 0 ||
  dados.value.condutasPlanoCuidado.trim().length > 0
))

const secaoCompleta = computed(() => consulta.completedSections.has('condutasHipoteses'))

async function salvar() {
  mensagemSucesso.value = ''
  await consulta.salvarHipotesesCondutas()
  mensagemSucesso.value = 'Hipóteses e condutas salvas no banco.'
}
</script>
