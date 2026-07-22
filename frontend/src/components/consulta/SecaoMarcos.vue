<script setup lang="ts">
import { computed } from 'vue'
import {
  CheckIcon,
  XMarkIcon,
  MinusIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/solid'
import { usePacienteStore } from '../../stores/paciente'
import { useConsultaStore, type ClassificacaoDesenvolvimento } from '../../stores/consulta'
import { getGrupoAtivo } from '../../data/marcos-desenvolvimento'
import type { Marco } from '../../types/clinica'
import type { StatusMarco } from '../../types/clinica'

const pacienteStore = usePacienteStore()
const consultaStore = useConsultaStore()

const idadeEmMeses = computed(() => pacienteStore.idadeEmMeses)
const grupoAtivo = computed(() => getGrupoAtivo(idadeEmMeses.value))

function isEditable(faixa: [number, number], coluna: number): boolean {
  return coluna >= faixa[0] && coluna <= faixa[1] && coluna <= idadeEmMeses.value
}

function isFuture(coluna: number): boolean {
  return coluna > idadeEmMeses.value
}

function isColunaAtual(coluna: number): boolean {
  return coluna === idadeEmMeses.value
}

function getStatus(marcoId: string, coluna: number): StatusMarco | null {
  return consultaStore.getStatusMarco(marcoId, coluna)
}

function toggleStatus(marcoId: string, coluna: number, status: StatusMarco) {
  consultaStore.toggleStatusMarco(marcoId, coluna, status)
}

function marcoTemAlerta(marco: Marco): boolean {
  return grupoAtivo.value.colunas.some(
    col => isEditable(marco.faixaEtariaMeses, col) && getStatus(marco.id, col) === 'not-achieved'
  )
}

function marcoTemQualquerStatus(marco: Marco): boolean {
  return grupoAtivo.value.colunas.some(col => {
    const s = getStatus(marco.id, col)
    return s !== null && s !== undefined
  })
}

const marcosComAlerta = computed(() =>
  grupoAtivo.value.marcos.filter(m => marcoTemAlerta(m))
)


const classificacaoOpcoes: Array<{
  value: ClassificacaoDesenvolvimento
  label: string
  description: string
  labelClass: string
  radioClass: string
  radioDotClass: string
}> = [
  {
    value: 'adequado',
    label: 'Desenvolvimento adequado para a idade',
    description: 'Todos os marcos esperados para a idade foram alcançados.',
    labelClass: 'text-green-700',
    radioClass: 'border-green-500',
    radioDotClass: 'bg-green-500',
  },
  {
    value: 'alerta',
    label: 'Alerta para o desenvolvimento',
    description: 'Ausência de um ou mais marcos esperados para a idade. Necessário acompanhamento mais próximo.',
    labelClass: 'text-amber-700',
    radioClass: 'border-amber-500',
    radioDotClass: 'bg-amber-500',
  },
  {
    value: 'provavel-atraso',
    label: 'Provável atraso no desenvolvimento',
    description: 'Ausência de marcos de faixas etárias anteriores. Encaminhamento para avaliação especializada indicado.',
    labelClass: 'text-red-700',
    radioClass: 'border-red-500',
    radioDotClass: 'bg-red-500',
  },
]

async function salvarSecao() {
  await consultaStore.salvarMarcosDesenvolvimento()
}

</script>

<template>
  <div class="space-y-4">

    <!-- Alerta: marcos não atingidos -->
    <div
      v-if="marcosComAlerta.length > 0"
      class="flex items-start gap-2 p-3 bg-red-50 border border-red-300 rounded-lg text-sm text-red-800"
    >
      <ExclamationTriangleIcon class="h-4 w-4 mt-0.5 shrink-0 text-red-600" />
      <div>
        <p class="font-medium">Marco(s) esperado(s) não atingido(s):</p>
        <ul class="list-disc list-inside mt-1 text-xs space-y-0.5">
          <li v-for="m in marcosComAlerta" :key="m.id">{{ m.nome }}</li>
        </ul>
      </div>
    </div>

    <!-- Tabela de marcos -->
    <div class="overflow-x-auto rounded-lg border border-slate-200">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b bg-slate-50">
            <th class="text-left font-medium p-3 min-w-[170px] border-r">Marco</th>
            <th class="text-left font-normal text-xs text-slate-500 p-3 min-w-[260px] border-r">
              Como pesquisar
            </th>
            <th
              v-for="col in grupoAtivo.colunas"
              :key="col"
              class="text-center font-medium p-2 min-w-[52px] border-r last:border-r-0 text-xs"
              :class="isColunaAtual(col) ? 'bg-teal-100 text-teal-800' : ''"
            >
              <div>{{ col }}</div>
              <span
                v-if="isColunaAtual(col)"
                class="inline-block text-[10px] bg-teal-200 text-teal-800 px-1 rounded mt-0.5"
              >
                Hoje
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="marco in grupoAtivo.marcos"
            :key="marco.id"
            class="border-b last:border-b-0"
            :class="marcoTemAlerta(marco) ? 'bg-red-50/40' : ''"
          >
            <!-- Nome + indicador de alerta + observação -->
            <td class="p-3 border-r align-top">
              <div class="flex items-start gap-1">
                <span class="font-medium leading-snug">{{ marco.nome }}</span>
                <ExclamationTriangleIcon
                  v-if="marcoTemAlerta(marco)"
                  class="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0"
                />
              </div>
              <textarea
                v-if="marcoTemQualquerStatus(marco)"
                :value="consultaStore.getObservacaoMarco(marco.id)"
                @input="(e) => consultaStore.setObservacaoMarco(marco.id, (e.target as HTMLTextAreaElement).value)"
                rows="1"
                placeholder="Observação (opcional)"
                class="mt-1.5 w-full text-xs text-slate-600 placeholder-slate-300 border border-slate-200 rounded px-2 py-1 resize-none focus:outline-none focus:ring-1 focus:ring-teal-400 focus:border-teal-400"
              />
            </td>

            <!-- Instrução clínica -->
            <td class="p-3 text-xs text-slate-500 border-r align-top leading-relaxed">
              {{ marco.instrucao }}
            </td>

            <!-- Células por coluna de idade -->
            <td
              v-for="col in grupoAtivo.colunas"
              :key="col"
              class="p-2 text-center border-r last:border-r-0 align-middle"
              :class="{
                'bg-teal-50': isEditable(marco.faixaEtariaMeses, col),
                'bg-slate-100 opacity-40': isFuture(col),
                'bg-slate-50': !isEditable(marco.faixaEtariaMeses, col) && !isFuture(col),
              }"
            >
              <!-- Célula editável: botões de toggle -->
              <div
                v-if="isEditable(marco.faixaEtariaMeses, col)"
                class="flex justify-center gap-1"
              >
                <button
                  @click="toggleStatus(marco.id, col, 'confirmed')"
                  title="Confirmado"
                  class="w-6 h-6 rounded border flex items-center justify-center transition-colors"
                  :class="getStatus(marco.id, col) === 'confirmed'
                    ? 'bg-green-100 border-green-500 text-green-600'
                    : 'border-teal-200 hover:bg-slate-100'"
                >
                  <CheckIcon class="h-3 w-3" />
                </button>
                <button
                  @click="toggleStatus(marco.id, col, 'not-achieved')"
                  title="Não atingido"
                  class="w-6 h-6 rounded border flex items-center justify-center transition-colors"
                  :class="getStatus(marco.id, col) === 'not-achieved'
                    ? 'bg-red-100 border-red-500 text-red-600'
                    : 'border-teal-200 hover:bg-slate-100'"
                >
                  <XMarkIcon class="h-3 w-3" />
                </button>
              </div>

              <!-- Célula futura -->
              <span v-else-if="isFuture(col)" class="text-slate-300 text-xs">—</span>

              <!-- Célula fora da janela do marco -->
              <MinusIcon v-else class="h-4 w-4 text-slate-200 mx-auto" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Classificação do Desenvolvimento -->
    <hr class="border-slate-200" />
    <div class="space-y-3">
      <div>
        <h3 class="text-sm font-semibold text-slate-700">Classificação do Desenvolvimento</h3>
        <p class="text-xs text-slate-500 mt-0.5">
          Baseado na avaliação dos marcos, classifique o desenvolvimento neuropsicomotor da criança:
        </p>
      </div>

      <div class="space-y-2">
        <div
          v-for="opt in classificacaoOpcoes"
          :key="opt.value"
          @click="consultaStore.setClassificacao(opt.value)"
          class="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
          :class="consultaStore.classificacaoDesenvolvimento === opt.value
            ? 'border-slate-400 bg-slate-50'
            : 'border-slate-200'"
        >
          <div
            class="mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
            :class="consultaStore.classificacaoDesenvolvimento === opt.value
              ? opt.radioClass
              : 'border-slate-300'"
          >
            <div
              v-if="consultaStore.classificacaoDesenvolvimento === opt.value"
              class="w-2 h-2 rounded-full"
              :class="opt.radioDotClass"
            />
          </div>
          <div>
            <p class="text-sm font-medium" :class="opt.labelClass">{{ opt.label }}</p>
            <p class="text-xs text-slate-500 mt-0.5">{{ opt.description }}</p>
          </div>
        </div>
      </div>

      <!-- Alerta para provável atraso -->
      <div
        v-if="consultaStore.classificacaoDesenvolvimento === 'provavel-atraso'"
        class="flex items-start gap-2 p-3 bg-red-50 border border-red-300 rounded-lg text-sm text-red-800"
      >
        <ExclamationTriangleIcon class="h-4 w-4 mt-0.5 shrink-0 text-red-600" />
        <p>
          Considere encaminhamento para neuropediatra, fonoaudiologia e/ou estimulação precoce
          conforme a área de atraso identificada.
        </p>
      </div>
    </div>


    <div class="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <p class="text-sm font-medium text-slate-800">Salvar marcos do desenvolvimento</p>
        <p class="text-xs text-slate-500">Os registros salvos aparecem na Caderneta Digital do paciente.</p>
        <p v-if="consultaStore.erroSalvamentoMarcos" class="mt-1 text-xs text-red-600">{{ consultaStore.erroSalvamentoMarcos }}</p>
      </div>
      <button
        v-if="false"
        type="button"
        @click="salvarSecao"
        :disabled="consultaStore.salvandoMarcos"
        class="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {{ consultaStore.salvandoMarcos ? 'Salvando...' : 'Salvar seção' }}
      </button>
    </div>


  </div>
</template>
