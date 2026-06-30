<template>
  <section class="space-y-5">
    <div class="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm font-medium text-slate-900">Foram realizados procedimentos nesta consulta?</span>
        <button
          type="button"
          role="switch"
          :aria-checked="procedimentos.realizados === true"
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
          :class="procedimentos.realizados === true ? 'bg-teal-600' : 'bg-slate-300'"
          @click="alternarRealizados"
        >
          <span
            class="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform"
            :class="procedimentos.realizados === true ? 'translate-x-5' : 'translate-x-0.5'"
          />
        </button>
        <button
          type="button"
          class="rounded-full px-3 py-1 text-xs font-medium transition-colors"
          :class="procedimentos.realizados === false ? 'bg-slate-200 text-slate-700' : 'text-slate-500 hover:bg-slate-100'"
          @click="consulta.atualizarRealizadosProcedimentos(false)"
        >
          Nenhum procedimento
        </button>
      </div>
    </div>

    <div v-if="procedimentos.realizados === false" class="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
      <CheckCircleIcon class="mx-auto h-8 w-8 text-teal-600" />
      <p class="mt-3 text-sm font-medium text-slate-600">Nenhum procedimento realizado nesta consulta</p>
      <p class="mt-1 text-xs text-slate-400">A seção pode ser salva com essa informação.</p>
    </div>

    <template v-else>
      <div class="flex justify-start">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          @click="consulta.adicionarProcedimento()"
        >
          <PlusIcon class="h-4 w-4" />
          Adicionar procedimento
        </button>
      </div>

      <div v-if="procedimentos.procedimentos.length === 0" class="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-400">
        Nenhum procedimento adicionado. Clique em “Adicionar procedimento” para registrar.
      </div>

      <article
        v-for="item in procedimentos.procedimentos"
        :key="item.localId"
        class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div class="mb-3 flex items-start justify-between gap-3">
          <p class="text-sm font-semibold text-slate-900">Procedimento</p>
          <button
            type="button"
            class="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            title="Remover procedimento"
            @click="consulta.removerProcedimento(item.localId)"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>

        <div class="grid gap-4 lg:grid-cols-[1fr_90px_1fr]">
          <label class="space-y-1">
            <span class="text-xs font-medium text-slate-700">Procedimento</span>
            <select
              class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              :value="item.procedimento"
              @change="atualizarCampo(item.localId, 'procedimento', ($event.target as HTMLSelectElement).value)"
            >
              <option value="">Selecione o procedimento</option>
              <option v-for="opcao in opcoesProcedimento" :key="opcao" :value="opcao">{{ opcao }}</option>
            </select>
          </label>

          <label class="space-y-1">
            <span class="text-xs font-medium text-slate-700">Qtd.</span>
            <input
              type="number"
              min="1"
              max="999"
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              :value="item.quantidade ?? ''"
              @input="atualizarQuantidade(item.localId, ($event.target as HTMLInputElement).value)"
            />
          </label>

          <label class="space-y-1">
            <span class="inline-flex items-center gap-1 text-xs font-medium text-slate-700">
              CID vinculado
              <InformationCircleIcon class="h-4 w-4 text-slate-400" />
            </span>
            <input
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              placeholder="Ex: J06.9"
              :value="item.cidVinculado"
              @input="atualizarCampo(item.localId, 'cidVinculado', ($event.target as HTMLInputElement).value)"
            />
          </label>
        </div>

        <label class="mt-3 block space-y-1">
          <span class="text-xs font-medium text-slate-700">Observações</span>
          <textarea
            rows="3"
            class="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
            placeholder="Intercorrências ou detalhes do procedimento (opcional)"
            :value="item.observacoes"
            @input="atualizarCampo(item.localId, 'observacoes', ($event.target as HTMLTextAreaElement).value)"
          />
        </label>
      </article>
    </template>

    <div class="rounded-xl border border-slate-200 bg-white p-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-sm font-medium" :class="secaoCompleta ? 'text-teal-700' : 'text-slate-600'">
            {{ mensagemStatus }}
          </p>
          <p v-if="consulta.erroSalvamentoProcedimentos" class="mt-1 text-xs text-red-600">
            {{ consulta.erroSalvamentoProcedimentos }}
          </p>
        </div>
        <button
          v-if="false"
          type="button"
          class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="consulta.salvandoProcedimentos"
          @click="salvar"
        >
          {{ consulta.salvandoProcedimentos ? 'Salvando...' : 'Salvar seção' }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  CheckCircleIcon,
  InformationCircleIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { useConsultaStore, type ProcedimentoConsulta } from '../../stores/consulta'

const consulta = useConsultaStore()
const procedimentos = computed(() => consulta.procedimentos)

const opcoesProcedimento = [
  'Nebulização',
  'Curativo',
  'Retirada de pontos',
  'Administração de medicamento',
  'Teste rápido',
  'Sutura',
  'Lavagem auricular',
  'Coleta de material',
  'Orientação/procedimento educativo',
  'Outro',
]

const secaoCompleta = computed(() => {
  if (procedimentos.value.realizados === false) return true
  if (procedimentos.value.realizados !== true) return false
  return procedimentos.value.procedimentos.some(item => Boolean(item.procedimento.trim() && item.quantidade && item.quantidade > 0))
})

const mensagemStatus = computed(() => {
  if (procedimentos.value.realizados === false) {
    return 'Nenhum procedimento informado. A seção está completa.'
  }
  if (secaoCompleta.value) {
    return 'Procedimentos registrados. A seção está completa.'
  }
  return 'Informe se foram realizados procedimentos e preencha procedimento + quantidade quando aplicável.'
})

function alternarRealizados() {
  consulta.atualizarRealizadosProcedimentos(procedimentos.value.realizados !== true)
}

function atualizarCampo<K extends keyof ProcedimentoConsulta>(
  localId: string,
  campo: K,
  valor: ProcedimentoConsulta[K],
) {
  consulta.atualizarCampoProcedimento(localId, campo, valor)
}

function atualizarQuantidade(localId: string, valor: string) {
  const numero = valor === '' ? null : Number(valor)
  consulta.atualizarCampoProcedimento(localId, 'quantidade', Number.isFinite(numero) ? numero : null)
}

async function salvar() {
  await consulta.salvarProcedimentos()
}
</script>
