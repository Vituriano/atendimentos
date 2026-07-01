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
      <input
        :value="diagnostico.cid10Principal"
        type="text"
        class="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
        placeholder="Ex: Z00.1 — Exame médico geral do lactente"
        @input="consulta.atualizarCampoDiagnostico('cid10Principal', ($event.target as HTMLInputElement).value)"
      />
      <p class="mt-2 text-xs text-slate-500">
        O CID-10 é obrigatório para encaminhamentos, laudos e faturamento.
      </p>
    </div>

    <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 class="text-sm font-semibold text-slate-900">CIDs Secundários</h3>
          <p class="text-xs text-slate-500">Registre diagnósticos associados, se houver.</p>
        </div>
        <button
          class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          type="button"
          @click="consulta.adicionarCidSecundario()"
        >
          <PlusIcon class="h-4 w-4" />
          Adicionar CID secundário
        </button>
      </div>

      <div v-if="diagnostico.cidsSecundarios.length" class="space-y-2">
        <div
          v-for="item in diagnostico.cidsSecundarios"
          :key="item.localId"
          class="grid grid-cols-[120px_1fr_auto] gap-2"
        >
          <input
            :value="item.codigo"
            type="text"
            class="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            placeholder="Código"
            @input="consulta.atualizarCampoCidSecundario(item.localId, 'codigo', ($event.target as HTMLInputElement).value)"
          />
          <input
            :value="item.descricao"
            type="text"
            class="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            placeholder="Descrição"
            @input="consulta.atualizarCampoCidSecundario(item.localId, 'descricao', ($event.target as HTMLInputElement).value)"
          />
          <button
            class="rounded-lg px-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            type="button"
            title="Remover CID secundário"
            @click="consulta.removerCidSecundario(item.localId)"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>
      </div>

      <button
        v-else
        class="inline-flex items-center gap-2 text-sm font-medium text-teal-700 hover:text-teal-800"
        type="button"
        @click="consulta.adicionarCidSecundario()"
      >
        <PlusIcon class="h-4 w-4" />
        Adicionar CID secundário
      </button>
    </div>

    <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="mb-3 flex items-center gap-2">
        <label class="text-sm font-semibold text-slate-900">SID</label>
        <span
          class="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold text-slate-500"
          title="Preencha o código SID quando aplicável à instituição."
        >
          i
        </span>
      </div>
      <input
        :value="diagnostico.sid"
        type="text"
        class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
        placeholder="Código SID, se aplicável"
        @input="consulta.atualizarCampoDiagnostico('sid', ($event.target as HTMLInputElement).value)"
      />
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
import { computed, ref } from 'vue'
import { DocumentTextIcon, PlusIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { useConsultaStore } from '../../stores/consulta'

const consulta = useConsultaStore()
const mensagemSucesso = ref('')

const diagnostico = computed(() => consulta.diagnostico)

const possuiDiagnosticoRegistrado = computed(() => (
  diagnostico.value.cid10Principal.trim().length > 0 ||
  diagnostico.value.sid.trim().length > 0 ||
  diagnostico.value.cidsSecundarios.some(item => item.codigo.trim() || item.descricao.trim())
))

const diagnosticoCompleto = computed(() => diagnostico.value.cid10Principal.trim().length > 0)

async function salvar() {
  mensagemSucesso.value = ''
  await consulta.salvarDiagnostico()
  mensagemSucesso.value = 'Diagnóstico salvo no banco.'
}
</script>
