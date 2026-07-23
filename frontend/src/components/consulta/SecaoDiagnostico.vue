<template>
  <section class="space-y-5">
    <div
      v-if="!possuiDiagnosticoRegistrado"
      class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center"
    >
      <DocumentTextIcon class="mx-auto mb-3 h-8 w-8 text-slate-300" />
      <p class="text-sm font-medium text-slate-500">Diagnóstico ainda não registrado</p>
      <p class="mt-1 text-xs text-slate-400">
        O CID-10 é obrigatório para encaminhamentos e faturamento. Preencha ao final da consulta.
      </p>
    </div>

    <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">CID-10 Principal <span class="text-red-500">*</span></label>
      <div ref="autocompleteRef" class="relative mt-3">
        <input
          v-model="termoBusca"
          type="text"
          role="combobox"
          aria-autocomplete="list"
          :aria-expanded="listaAberta"
          class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          placeholder="Digite código ou descrição. Ex: Z00.1 ou resfriado"
          @input="aoDigitar"
          @focus="abrirLista"
          @keydown="aoTeclar"
        />
        <ul
          v-if="listaAberta && sugestoes.length"
          class="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          <li
            v-for="(item, index) in sugestoes"
            :key="item.codigo"
            :class="[
              'cursor-pointer px-3 py-2 text-sm',
              index === indiceDestacado ? 'bg-teal-50 text-teal-800' : 'text-slate-700 hover:bg-slate-50',
            ]"
            @mousedown.prevent="selecionarCid(item)"
            @mouseenter="indiceDestacado = index"
          >
            <span class="font-semibold">{{ item.codigo }}</span>
            <span class="text-slate-400"> — </span>
            <span>{{ item.descricao }}</span>
          </li>
        </ul>
        <p
          v-else-if="listaAberta && termoBusca.trim().length > 0"
          class="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 shadow-lg"
        >
          Nenhum CID encontrado na lista inicial. O texto digitado será mantido como diagnóstico.
        </p>
      </div>
      <p class="mt-2 text-xs text-slate-500">
        O CID-10 é obrigatório para encaminhamentos, laudos e faturamento.
      </p>
    </div>

    <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p v-if="diagnosticoCompleto" class="text-sm font-medium text-teal-700">
            Campos obrigatórios preenchidos. A seção está completa.
          </p>
          <p v-else-if="possuiDiagnosticoRegistrado" class="text-sm font-medium text-amber-700">
            Informe o CID-10 principal para concluir a seção.
          </p>
          <p v-else class="text-sm text-slate-500">
            Preencha o CID-10 principal para concluir a seção.
          </p>
          <p v-if="mensagemSucesso" class="mt-1 text-xs text-teal-700">{{ mensagemSucesso }}</p>
          <p v-if="consulta.erroSalvamentoDiagnostico" class="mt-1 text-xs text-red-600">
            {{ consulta.erroSalvamentoDiagnostico }}
          </p>
        </div>
        <button
          v-if="false"
          class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          :disabled="consulta.salvandoDiagnostico"
          @click="salvar"
        >
          {{ consulta.salvandoDiagnostico ? 'Salvando...' : 'Salvar seção' }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { DocumentTextIcon } from '@heroicons/vue/24/outline'
import { useConsultaStore } from '../../stores/consulta'
import { cid10Starter, type ItemCID10 } from '../../data/cid10'

const consulta = useConsultaStore()
const mensagemSucesso = ref('')

const diagnostico = computed(() => consulta.diagnostico)

const termoBusca = ref(diagnostico.value.cid10Principal)
const listaAberta = ref(false)
const indiceDestacado = ref(-1)
const autocompleteRef = ref<HTMLElement | null>(null)

const LIMITE_SUGESTOES = 8

// Mantém o campo sincronizado quando o diagnóstico é carregado do backend.
watch(() => diagnostico.value.cid10Principal, (novoValor) => {
  if (novoValor !== termoBusca.value) {
    termoBusca.value = novoValor
  }
})

const sugestoes = computed<ItemCID10[]>(() => {
  const termo = termoBusca.value.trim().toLowerCase()
  if (!termo) {
    return cid10Starter.slice(0, LIMITE_SUGESTOES)
  }
  return cid10Starter
    .filter(item => (
      item.codigo.toLowerCase().includes(termo) ||
      item.descricao.toLowerCase().includes(termo)
    ))
    .slice(0, LIMITE_SUGESTOES)
})

const possuiDiagnosticoRegistrado = computed(() => (
  diagnostico.value.cid10Principal.trim().length > 0
))

const diagnosticoCompleto = computed(() => diagnostico.value.cid10Principal.trim().length > 0)

function abrirLista() {
  listaAberta.value = true
  indiceDestacado.value = -1
}

function aoDigitar() {
  listaAberta.value = true
  indiceDestacado.value = -1
  consulta.atualizarCampoDiagnostico('cid10Principal', termoBusca.value)
}

function selecionarCid(item: ItemCID10) {
  const texto = `${item.codigo} — ${item.descricao}`
  termoBusca.value = texto
  consulta.atualizarCampoDiagnostico('cid10Principal', texto)
  listaAberta.value = false
  indiceDestacado.value = -1
}

function aoTeclar(evento: KeyboardEvent) {
  if (evento.key === 'ArrowDown') {
    evento.preventDefault()
    if (!listaAberta.value) {
      listaAberta.value = true
    }
    if (sugestoes.value.length) {
      indiceDestacado.value = (indiceDestacado.value + 1) % sugestoes.value.length
    }
  } else if (evento.key === 'ArrowUp') {
    evento.preventDefault()
    if (sugestoes.value.length) {
      indiceDestacado.value = indiceDestacado.value <= 0
        ? sugestoes.value.length - 1
        : indiceDestacado.value - 1
    }
  } else if (evento.key === 'Enter') {
    if (listaAberta.value && indiceDestacado.value >= 0 && sugestoes.value[indiceDestacado.value]) {
      evento.preventDefault()
      selecionarCid(sugestoes.value[indiceDestacado.value])
    }
  } else if (evento.key === 'Escape') {
    listaAberta.value = false
    indiceDestacado.value = -1
  }
}

function aoClicarFora(evento: MouseEvent) {
  if (autocompleteRef.value && !autocompleteRef.value.contains(evento.target as Node)) {
    listaAberta.value = false
    indiceDestacado.value = -1
  }
}

onMounted(() => {
  document.addEventListener('mousedown', aoClicarFora)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', aoClicarFora)
})

async function salvar() {
  mensagemSucesso.value = ''
  await consulta.salvarDiagnostico()
  mensagemSucesso.value = 'Diagnóstico salvo no banco.'
}
</script>
