<template>
  <section class="space-y-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p class="mb-3 text-sm font-semibold text-slate-900">Frequenta escola ou creche?</p>
      <div class="flex flex-wrap gap-4">
        <label class="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="radio"
            name="frequenta-escola-creche"
            class="h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500"
            :checked="dados.frequentaEscolaCreche === true"
            @change="consulta.atualizarCampoEscolaridade('frequentaEscolaCreche', true)"
          />
          Sim
        </label>
        <label class="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="radio"
            name="frequenta-escola-creche"
            class="h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500"
            :checked="dados.frequentaEscolaCreche === false"
            @change="consulta.atualizarCampoEscolaridade('frequentaEscolaCreche', false)"
          />
          Não
        </label>
      </div>
    </div>

    <div v-if="dados.frequentaEscolaCreche === false" class="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <AcademicCapIcon class="mx-auto h-8 w-8 text-slate-300" />
      <p class="mt-3 text-sm font-medium text-slate-600">Criança não frequenta escola ou creche nesta consulta.</p>
      <p class="mt-1 text-xs text-slate-400">A informação pode ser salva assim mesmo.</p>
    </div>

    <div class="space-y-4">
      <label class="block space-y-1 text-sm font-medium text-slate-900">
        <span>Ano/série que está cursando</span>
        <input
          type="text"
          class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          placeholder="Ex: 2º ano do Ensino Fundamental"
          :value="dados.anoSerie"
          @input="consulta.atualizarCampoEscolaridade('anoSerie', ($event.target as HTMLInputElement).value)"
        />
      </label>

      <div class="space-y-2">
        <p class="text-sm font-semibold text-slate-900">Houve reprovação?</p>
        <div class="flex flex-wrap gap-4">
          <label class="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="houve-reprovacao"
              class="h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500"
              :checked="dados.houveReprovacao === true"
              @change="consulta.atualizarCampoEscolaridade('houveReprovacao', true)"
            />
            Sim
          </label>
          <label class="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="houve-reprovacao"
              class="h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500"
              :checked="dados.houveReprovacao === false"
              @change="consulta.atualizarCampoEscolaridade('houveReprovacao', false)"
            />
            Não
          </label>
        </div>
      </div>

      <label class="block space-y-1 text-sm font-medium text-slate-900">
        <span>Rendimento e relacionamento escolar</span>
        <textarea
          rows="4"
          class="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          placeholder="Descreva o rendimento acadêmico e o relacionamento com colegas e professores"
          :value="dados.rendimentoRelacionamento"
          @input="consulta.atualizarCampoEscolaridade('rendimentoRelacionamento', ($event.target as HTMLTextAreaElement).value)"
        />
      </label>
    </div>

    <div class="rounded-xl border border-slate-200 bg-white p-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-sm font-medium" :class="secaoCompleta ? 'text-teal-700' : 'text-slate-600'">
            {{ mensagemStatus }}
          </p>
          <p v-if="consulta.erroSalvamentoEscolaridade" class="mt-1 text-xs text-red-600">
            {{ consulta.erroSalvamentoEscolaridade }}
          </p>
        </div>
        <button
          v-if="false"
          type="button"
          class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="consulta.salvandoEscolaridade"
          @click="salvar"
        >
          {{ consulta.salvandoEscolaridade ? 'Salvando...' : 'Salvar seção' }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AcademicCapIcon } from '@heroicons/vue/24/outline'
import { useConsultaStore } from '../../stores/consulta'

const consulta = useConsultaStore()
const dados = computed(() => consulta.escolaridade)

const secaoCompleta = computed(() => consulta.completedSections.has('escolaridade'))

const mensagemStatus = computed(() => {
  if (secaoCompleta.value) {
    return 'Escolaridade registrada. A seção está completa.'
  }
  return 'Responda se a criança frequenta escola ou creche para completar a seção.'
})

async function salvar() {
  await consulta.salvarEscolaridade()
}
</script>
