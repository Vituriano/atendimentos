<template>
  <div class="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <label class="space-y-1 text-sm font-medium text-slate-900">
        <span>Data da consulta externa</span>
        <input
          v-model="rascunho.dataConsultaExterna"
          type="date"
          class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
        />
      </label>

      <label class="space-y-1 text-sm font-medium text-slate-900">
        <span>Serviço de origem</span>
        <input
          v-model="rascunho.servicoOrigem"
          type="text"
          placeholder="Ex: UBS Mangueira, Clínica São Lucas"
          class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
        />
      </label>

      <label class="space-y-1 text-sm font-medium text-slate-900">
        <span>Peso (kg)</span>
        <input
          :value="rascunho.pesoKg ?? ''"
          type="text"
          inputmode="decimal"
          placeholder="Ex: 10,9"
          class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          @input="rascunho.pesoKg = valorNumerico(($event.target as HTMLInputElement).value)"
        />
      </label>

      <label class="space-y-1 text-sm font-medium text-slate-900">
        <span>Altura (cm)</span>
        <input
          :value="rascunho.alturaCm ?? ''"
          type="text"
          inputmode="decimal"
          placeholder="Ex: 81"
          class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          @input="rascunho.alturaCm = valorNumerico(($event.target as HTMLInputElement).value)"
        />
      </label>
    </div>

    <label class="block space-y-1 text-sm font-medium text-slate-900">
      <span>Observações clínicas</span>
      <textarea
        v-model="rascunho.observacoesClinicas"
        rows="3"
        placeholder="Informações relevantes do atendimento externo (diagnósticos, condutas, medicações...)"
        class="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
      />
    </label>

    <label class="block space-y-1 text-sm font-medium text-slate-900">
      <span>Como os dados foram obtidos <span class="text-red-500">*</span></span>
      <textarea
        v-model="rascunho.comoDadosObtidos"
        rows="3"
        placeholder="Ex: Dados fornecidos pela mãe a partir de caderneta física trazida na consulta de hoje"
        class="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
      />
    </label>

    <p v-if="erroRegistro" class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
      {{ erroRegistro }}
    </p>

    <button
      type="button"
      class="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      @click="registrarDadoExterno"
    >
      <PlusIcon class="h-4 w-4" />
      Registrar dados externos
    </button>

    <div class="border-t border-slate-200 pt-4">
      <p class="mb-2 text-sm font-medium text-slate-700">Dados externos registrados nesta sessão:</p>

      <div v-if="consulta.dadosExternos.length === 0" class="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
        Nenhum dado externo registrado nesta consulta.
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="item in consulta.dadosExternos"
          :key="item.localId"
          class="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700"
        >
          <div class="min-w-0">
            <p class="truncate font-medium text-slate-800">
              {{ item.servicoOrigem || 'Serviço não informado' }}
              <span v-if="item.dataConsultaExterna" class="font-normal text-slate-500">— {{ formatarData(item.dataConsultaExterna) }}</span>
              <span v-if="item.pesoKg !== null" class="font-normal text-slate-600"> Peso: {{ item.pesoKg }}kg</span>
              <span v-if="item.alturaCm !== null" class="font-normal text-slate-600"> Altura: {{ item.alturaCm }}cm</span>
            </p>
            <p class="truncate text-xs text-slate-500">{{ item.comoDadosObtidos }}</p>
          </div>
          <button
            type="button"
            class="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-red-600"
            title="Remover registro"
            @click="consulta.removerDadoExterno(item.localId)"
          >
            <XMarkIcon class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-slate-200 bg-white p-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p :class="consulta.completedSections.has('externo') ? 'text-teal-700' : 'text-slate-500'" class="text-sm font-medium">
            {{ consulta.completedSections.has('externo') ? 'Dados externos registrados. A seção está completa.' : 'Registre ao menos um dado externo com origem dos dados para completar a seção.' }}
          </p>
          <p v-if="consulta.erroSalvamentoDadosExternos" class="mt-1 text-sm text-red-600">
            {{ consulta.erroSalvamentoDadosExternos }}
          </p>
        </div>
        <button
          type="button"
          class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="consulta.salvandoDadosExternos"
          @click="salvar"
        >
          {{ consulta.salvandoDadosExternos ? 'Salvando...' : 'Salvar seção' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { PlusIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { useConsultaStore, type DadoExternoConsulta } from '../../stores/consulta'

const consulta = useConsultaStore()
const erroRegistro = ref<string | null>(null)

function criarRascunho(): DadoExternoConsulta {
  return {
    id: null,
    localId: `externo-draft-${Date.now()}`,
    dataConsultaExterna: '',
    servicoOrigem: '',
    pesoKg: null,
    alturaCm: null,
    observacoesClinicas: '',
    comoDadosObtidos: '',
    atualizadoEm: null,
  }
}

const rascunho = reactive<DadoExternoConsulta>(criarRascunho())

function valorNumerico(valor: string): number | null {
  const normalizado = valor.trim().replace(',', '.')
  if (!normalizado) return null
  const numero = Number(normalizado)
  return Number.isFinite(numero) ? numero : null
}

function rascunhoPossuiConteudo() {
  return Boolean(
    rascunho.dataConsultaExterna ||
    rascunho.servicoOrigem.trim() ||
    rascunho.pesoKg !== null ||
    rascunho.alturaCm !== null ||
    rascunho.observacoesClinicas.trim() ||
    rascunho.comoDadosObtidos.trim()
  )
}

function limparRascunho() {
  Object.assign(rascunho, criarRascunho())
}

function registrarDadoExterno() {
  erroRegistro.value = null

  if (!rascunhoPossuiConteudo()) {
    erroRegistro.value = 'Preencha algum dado externo antes de registrar.'
    return
  }

  if (!rascunho.comoDadosObtidos.trim()) {
    erroRegistro.value = 'Informe como os dados foram obtidos antes de registrar.'
    return
  }

  consulta.adicionarDadoExterno({ ...rascunho, localId: `externo-${Date.now()}` })
  limparRascunho()
}

async function salvar() {
  erroRegistro.value = null

  if (rascunhoPossuiConteudo()) {
    registrarDadoExterno()
    if (erroRegistro.value) return
  }

  await consulta.salvarDadosExternos()
}

function formatarData(valor: string) {
  if (!valor) return ''
  const [ano, mes, dia] = valor.split('-')
  if (!ano || !mes || !dia) return valor
  return `${dia}/${mes}/${ano}`
}
</script>
