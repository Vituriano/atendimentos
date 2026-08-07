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
          @click="adicionarProcedimento()"
        >
          <PlusIcon class="h-4 w-4" />
          Adicionar procedimento
        </button>
      </div>

      <div v-if="procedimentos.procedimentos.length === 0" class="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-400">
        Nenhum procedimento adicionado. Clique em “Adicionar procedimento” para registrar.
      </div>

      <article
        v-for="item in pilha"
        :key="item.localId"
        class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200"
      >
        <div class="flex items-start justify-between gap-3" :class="estaMinimizado(item.localId) ? '' : 'mb-3'">
          <div class="flex min-w-0 items-center gap-2">
            <p class="text-sm font-semibold text-slate-900">Procedimento</p>
            <span
              v-if="estaMinimizado(item.localId) && resumoProcedimento(item)"
              class="truncate text-sm text-slate-500"
            >
              {{ resumoProcedimento(item) }}
            </span>
          </div>
          <div class="flex shrink-0 items-center gap-1">
            <button
              type="button"
              class="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              :title="estaMinimizado(item.localId) ? 'Expandir' : 'Minimizar'"
              :aria-label="estaMinimizado(item.localId) ? 'Expandir' : 'Minimizar'"
              @click="alternarMinimizado(item.localId)"
            >
              <ChevronDownIcon v-if="estaMinimizado(item.localId)" class="h-5 w-5" />
              <ChevronUpIcon v-else class="h-5 w-5" />
            </button>
            <button
              type="button"
              class="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              title="Remover procedimento"
              @click="consulta.removerProcedimento(item.localId)"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>
        </div>

        <template v-if="!estaMinimizado(item.localId)">
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
        </template>
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
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { useConsultaStore, type ProcedimentoConsulta } from '../../stores/consulta'
import { usePilha } from '../../composables/usePilha'

const consulta = useConsultaStore()
const procedimentos = computed(() => consulta.procedimentos)

const listaProcedimentos = computed<ProcedimentoConsulta[]>(() => procedimentos.value.procedimentos)

// Comportamento de pilha (igual ao Exame Físico): o procedimento adicionado/editado
// por último sobe para o topo e os demais preenchidos são colapsados. Reusa o
// composable genérico usePilha, ordenando por localId.
const { pilha, promover, estaMinimizado, alternarMinimizado } = usePilha<ProcedimentoConsulta>({
  itens: listaProcedimentos,
  getId: item => item.localId,
  estaPreenchido: item => Boolean(item.procedimento.trim()),
})

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

function adicionarProcedimento() {
  consulta.adicionarProcedimento()
  const criado = listaProcedimentos.value.at(-1)
  if (criado) {
    promover(criado.localId)
  }
}

function atualizarCampo<K extends keyof ProcedimentoConsulta>(
  localId: string,
  campo: K,
  valor: ProcedimentoConsulta[K],
) {
  consulta.atualizarCampoProcedimento(localId, campo, valor)
  promover(localId)
}

function atualizarQuantidade(localId: string, valor: string) {
  const numero = valor === '' ? null : Number(valor)
  consulta.atualizarCampoProcedimento(localId, 'quantidade', Number.isFinite(numero) ? numero : null)
  promover(localId)
}

// Resumo exibido no cabeçalho quando o card está minimizado.
function resumoProcedimento(item: ProcedimentoConsulta): string {
  const nome = item.procedimento.trim()
  if (!nome) return ''
  return item.quantidade && item.quantidade > 0 ? `${nome} — ${item.quantidade}x` : nome
}

</script>
