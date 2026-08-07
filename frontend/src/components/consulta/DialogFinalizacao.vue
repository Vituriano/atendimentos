<script setup lang="ts">
import { computed } from 'vue'
import { ExclamationTriangleIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { useConsultaStore } from '../../stores/consulta'
import { usePacienteStore } from '../../stores/paciente'

const emit = defineEmits<{
  (e: 'confirm-with-aghu'): void
  (e: 'confirm-without-aghu'): void
  (e: 'cancel'): void
}>()

const consulta = useConsultaStore()
const pacienteStore = usePacienteStore()

interface SecaoValidacao {
  label: string
  preenchida: boolean
  obrigatoria: boolean
}

const secoes = computed((): SecaoValidacao[] => {
  const idadeEmMeses = pacienteStore.pacienteAtivo?.idadeEmMeses ?? 0
  const is0to2 = idadeEmMeses <= 24
  const is3to9 = idadeEmMeses >= 36 && idadeEmMeses <= 108

  const lista: SecaoValidacao[] = [
    {
      label: 'Antropometria',
      preenchida: consulta.antropometria.pesoKg !== null,
      obrigatoria: true,
    },
    {
      label: 'Anamnese',
      preenchida: consulta.anamnese.clinica.queixaPrincipal.trim() !== '',
      obrigatoria: true,
    },
    {
      label: 'Imunizações',
      preenchida: consulta.imunizacoes.statusVacinal.trim() !== '',
      obrigatoria: false,
    },
  ]

  if (is0to2) {
    lista.push({
      label: 'Triagem Neonatal',
      preenchida: consulta.triagemNeonatal.atualizadoEm !== null,
      obrigatoria: false,
    })
  }
  if (is3to9) {
    lista.push({
      label: 'Escolaridade',
      preenchida: consulta.escolaridade.atualizadoEm !== null,
      obrigatoria: false,
    })
  }

  lista.push(
    {
      label: 'Exame Físico',
      preenchida: consulta.avaliadosCount > 0,
      obrigatoria: false,
    },
    {
      label: 'Marcos do Desenvolvimento',
      preenchida: consulta.totalMarcosRegistrados > 0,
      obrigatoria: false,
    },
    {
      label: 'Diagnóstico (CID-10)',
      preenchida: consulta.diagnostico.cid10Principal.trim() !== '',
      obrigatoria: true,
    },
    {
      label: 'Hipóteses e Condutas',
      preenchida: consulta.hipotesesCondutas.condutasPlanoCuidado.trim() !== '',
      obrigatoria: false,
    },
  )

  return lista
})

const secoesObrigatoriasVazias = computed(() =>
  secoes.value.filter(s => s.obrigatoria && !s.preenchida)
)

const podeConfirmar = computed(() => secoesObrigatoriasVazias.value.length === 0)
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    @click.self="emit('cancel')"
  >
    <div class="w-full max-w-lg rounded-xl bg-white shadow-xl flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-start justify-between p-5 border-b border-slate-200">
        <div>
          <h3 class="text-base font-semibold text-slate-900">Finalizar Atendimento</h3>
          <p class="text-sm text-slate-500 mt-0.5">
            Encerrando o atendimento de
            <span class="font-medium text-slate-700">{{ pacienteStore.pacienteAtivo?.nome }}</span>
          </p>
        </div>
        <button class="text-slate-400 hover:text-slate-600 ml-4 shrink-0" @click="emit('cancel')">
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>

      <!-- Seções preenchidas -->
      <div class="p-5 overflow-y-auto flex-1">
        <p class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
          Resumo do preenchimento
        </p>
        <ul class="space-y-2">
          <li
            v-for="secao in secoes"
            :key="secao.label"
            class="flex items-center gap-2.5 text-sm"
          >
            <CheckCircleIcon
              v-if="secao.preenchida"
              class="h-4 w-4 text-green-500 shrink-0"
            />
            <ExclamationTriangleIcon
              v-else-if="secao.obrigatoria"
              class="h-4 w-4 text-red-500 shrink-0"
            />
            <div
              v-else
              class="h-4 w-4 rounded-full border-2 border-slate-300 shrink-0"
            />
            <span
              :class="[
                secao.preenchida ? 'text-slate-700' : secao.obrigatoria ? 'text-red-700 font-medium' : 'text-slate-400'
              ]"
            >
              {{ secao.label }}
              <span v-if="secao.obrigatoria && !secao.preenchida" class="text-xs font-normal">(obrigatório)</span>
            </span>
          </li>
        </ul>

        <!-- Aviso de bloqueio -->
        <div
          v-if="!podeConfirmar"
          class="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <ExclamationTriangleIcon class="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <p class="text-xs text-red-700">
            Preencha os campos obrigatórios antes de finalizar:
            <strong>{{ secoesObrigatoriasVazias.map(s => s.label).join(', ') }}</strong>
          </p>
        </div>
      </div>

      <!-- Ações -->
      <div class="p-5 border-t border-slate-200 space-y-2">
        <p v-if="consulta.erroFinalizarConsulta" class="text-xs text-red-600">
          {{ consulta.erroFinalizarConsulta }}
        </p>
        <button
          class="w-full rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="!podeConfirmar || consulta.finalizandoConsulta"
          @click="emit('confirm-with-aghu')"
        >
          {{ consulta.finalizandoConsulta ? 'Finalizando...' : 'Copiar para AGHU e Finalizar' }}
        </button>
        <button
          class="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="!podeConfirmar || consulta.finalizandoConsulta"
          @click="emit('confirm-without-aghu')"
        >
          {{ consulta.finalizandoConsulta ? 'Finalizando...' : 'Finalizar sem copiar para AGHU' }}
        </button>
        <button
          class="w-full rounded-lg px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          :disabled="consulta.finalizandoConsulta"
          @click="emit('cancel')"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>
