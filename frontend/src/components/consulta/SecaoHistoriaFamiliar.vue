<template>
  <div class="space-y-5">
    <section class="rounded-xl bg-slate-50 p-4">
      <div class="space-y-3">
        <p class="text-sm font-medium text-slate-900">
          Houve mudança na história familiar desde a última consulta?
        </p>
        <div class="flex flex-wrap gap-5">
          <label class="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="historia-familiar-mudou"
              class="h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500"
              :checked="historia.houveMudanca === true"
              @change="atualizarCampo('houveMudanca', true)"
            />
            Sim
          </label>
          <label class="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="historia-familiar-mudou"
              class="h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500"
              :checked="historia.houveMudanca === false"
              @change="atualizarCampo('houveMudanca', false)"
            />
            Não
          </label>
        </div>
      </div>
    </section>

    <section
      v-if="historia.houveMudanca === false"
      class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <p class="text-sm text-slate-600">Sem mudanças registradas desde a última consulta.</p>
      <button
        type="button"
        class="mt-3 text-sm font-medium text-teal-700 hover:text-teal-800"
        @click="atualizarCampo('houveMudanca', true)"
      >
        Registrar mudança
      </button>
    </section>

    <section v-else class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="space-y-6">
        <div class="space-y-4 rounded-lg border border-slate-200 p-4">
          <h3 class="text-sm font-semibold text-slate-700">Dados Maternos</h3>
          <div class="grid gap-4 md:grid-cols-3">
            <label class="space-y-2">
              <span class="text-sm font-medium text-slate-900">Idade</span>
              <input
                type="text"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                placeholder="Ex: 32 anos"
                :value="historia.maternalIdade"
                @input="atualizarCampo('maternalIdade', ($event.target as HTMLInputElement).value)"
              />
            </label>
            <label class="space-y-2">
              <span class="text-sm font-medium text-slate-900">Estado de saúde</span>
              <input
                type="text"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                placeholder="Ex: Saudável, HAS controlada"
                :value="historia.maternalSaude"
                @input="atualizarCampo('maternalSaude', ($event.target as HTMLInputElement).value)"
              />
            </label>
            <label class="space-y-2">
              <span class="text-sm font-medium text-slate-900">Ocupação</span>
              <input
                type="text"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                placeholder="Ex: Professora"
                :value="historia.maternalOcupacao"
                @input="atualizarCampo('maternalOcupacao', ($event.target as HTMLInputElement).value)"
              />
            </label>
          </div>
        </div>

        <div class="space-y-4 rounded-lg border border-slate-200 p-4">
          <h3 class="text-sm font-semibold text-slate-700">Dados Paternos</h3>
          <div class="grid gap-4 md:grid-cols-3">
            <label class="space-y-2">
              <span class="text-sm font-medium text-slate-900">Idade</span>
              <input
                type="text"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                placeholder="Ex: 35 anos"
                :value="historia.paternalIdade"
                @input="atualizarCampo('paternalIdade', ($event.target as HTMLInputElement).value)"
              />
            </label>
            <label class="space-y-2">
              <span class="text-sm font-medium text-slate-900">Estado de saúde</span>
              <input
                type="text"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                placeholder="Ex: Saudável, DM2"
                :value="historia.paternalSaude"
                @input="atualizarCampo('paternalSaude', ($event.target as HTMLInputElement).value)"
              />
            </label>
            <label class="space-y-2">
              <span class="text-sm font-medium text-slate-900">Ocupação</span>
              <input
                type="text"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                placeholder="Ex: Motorista"
                :value="historia.paternalOcupacao"
                @input="atualizarCampo('paternalOcupacao', ($event.target as HTMLInputElement).value)"
              />
            </label>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <label class="space-y-2">
            <span class="text-sm font-medium text-slate-900">Condição de coabitação dos pais</span>
            <select
              class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              :value="historia.coabitacaoPais"
              @change="atualizarCampo('coabitacaoPais', ($event.target as HTMLSelectElement).value)"
            >
              <option value="">Selecione</option>
              <option value="juntos">Moram juntos</option>
              <option value="separados">Separados</option>
              <option value="falecido-mae">Mãe falecida</option>
              <option value="falecido-pai">Pai falecido</option>
              <option value="desconhecido">Pai desconhecido</option>
              <option value="outros">Outros</option>
            </select>
            <label v-if="historia.coabitacaoPais === 'outros'" class="block space-y-2">
              <span class="text-sm font-medium text-slate-900">Descreva "Outros"</span>
              <input
                type="text"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                placeholder="Descreva a condição de coabitação dos pais"
                :value="historia.coabitacaoPaisOutros"
                @input="atualizarCampo('coabitacaoPaisOutros', ($event.target as HTMLInputElement).value)"
              />
            </label>
          </label>

          <label class="space-y-2">
            <span class="text-sm font-medium text-slate-900">Irmãos — idades e saúde</span>
            <textarea
              rows="3"
              class="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              placeholder="Ex: 2 irmãos (8a e 5a), todos saudáveis"
              :value="historia.irmaosSaude"
              @input="atualizarCampo('irmaosSaude', ($event.target as HTMLTextAreaElement).value)"
            />
          </label>
        </div>
      </div>
    </section>

    <section class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <p v-if="secaoCompleta" class="text-sm font-medium text-teal-700">
          <CheckCircleIcon class="mr-1 inline h-4 w-4" />
          História familiar registrada. A seção está completa.
        </p>
        <p v-else-if="secaoIniciada" class="text-sm font-medium text-amber-700">
          História familiar iniciada. Salve a seção após revisar os dados.
        </p>
        <p v-else class="text-sm font-medium text-slate-500">
          Registre as condições de saúde dos familiares próximos.
        </p>
        <p v-if="consulta.erroSalvamentoHistoriaFamiliar" class="mt-1 text-sm text-red-600">
          {{ consulta.erroSalvamentoHistoriaFamiliar }}
        </p>
        <p v-if="mensagemSucesso" class="mt-1 text-sm text-teal-700">{{ mensagemSucesso }}</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { CheckCircleIcon } from '@heroicons/vue/24/outline'
import { useConsultaStore, type DadosHistoriaFamiliarConsulta } from '../../stores/consulta'

const consulta = useConsultaStore()
const mensagemSucesso = ref('')

const historia = computed(() => consulta.historiaFamiliar)

const secaoCompleta = computed(() => consulta.completedSections.has('historiaFamiliar'))
const secaoIniciada = computed(() => consulta.startedSections.has('historiaFamiliar'))

function atualizarCampo<K extends keyof DadosHistoriaFamiliarConsulta>(
  campo: K,
  valor: DadosHistoriaFamiliarConsulta[K],
) {
  mensagemSucesso.value = ''
  consulta.atualizarCampoHistoriaFamiliar(campo, valor)
}

</script>
