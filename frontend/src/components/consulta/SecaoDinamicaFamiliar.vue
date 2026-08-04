<template>
  <div class="space-y-5">
    <section class="rounded-xl bg-slate-50 p-4">
      <div class="space-y-3">
        <p class="text-sm font-medium text-slate-900">
          Houve mudança na dinâmica familiar desde a última consulta?
        </p>
        <div class="flex flex-wrap gap-5">
          <label class="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="dinamica-familiar-mudou"
              class="h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500"
              :checked="dinamica.houveMudanca === true"
              @change="atualizarCampo('houveMudanca', true)"
            />
            Sim
          </label>
          <label class="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="dinamica-familiar-mudou"
              class="h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500"
              :checked="dinamica.houveMudanca === false"
              @change="atualizarCampo('houveMudanca', false)"
            />
            Não
          </label>
        </div>
      </div>
    </section>

    <section
      v-if="dinamica.houveMudanca === false"
      class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <p class="text-sm text-slate-600">Sem mudanças registradas na dinâmica familiar desde a última consulta.</p>
      <button
        type="button"
        class="mt-3 text-sm font-medium text-teal-700 hover:text-teal-800"
        @click="atualizarCampo('houveMudanca', true)"
      >
        Registrar mudança
      </button>
    </section>

    <template v-else>
      <section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div
          v-for="(pergunta, index) in perguntas"
          :key="pergunta.campo"
          class="grid gap-4 border-b border-slate-100 px-4 py-3 last:border-b-0 md:grid-cols-[1fr_220px] md:items-center"
        >
          <p class="text-sm font-medium text-slate-900">
            <span class="mr-2 text-slate-400">{{ index + 1 }}.</span>
            {{ pergunta.label }}
          </p>

          <select
            v-if="pergunta.tipo === 'select'"
            class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            :value="dinamica[pergunta.campo as SelectCampo]"
            @change="atualizarCampo(pergunta.campo as SelectCampo, ($event.target as HTMLSelectElement).value)"
          >
            <option value="">Selecione</option>
            <option v-for="opcao in pergunta.opcoes" :key="opcao" :value="opcao">
              {{ opcao }}
            </option>
          </select>

          <div v-else class="flex justify-start gap-5 md:justify-end">
            <label class="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                :name="`dinamica-${pergunta.campo}`"
                class="h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500"
                :checked="dinamica[pergunta.campo as BooleanCampo] === true"
                @change="atualizarCampo(pergunta.campo as BooleanCampo, true)"
              />
              Sim
            </label>
            <label class="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                :name="`dinamica-${pergunta.campo}`"
                class="h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500"
                :checked="dinamica[pergunta.campo as BooleanCampo] === false"
                @change="atualizarCampo(pergunta.campo as BooleanCampo, false)"
              />
              Não
            </label>
          </div>

          <textarea
            rows="1"
            class="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 md:col-span-2"
            placeholder="Observação (opcional)"
            :value="dinamica.observacoes[pergunta.campo] ?? ''"
            @input="consulta.atualizarObservacaoDinamica(pergunta.campo, ($event.target as HTMLTextAreaElement).value)"
          />
        </div>
      </section>

      <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Disciplina</p>
        <p class="mb-4 text-sm font-medium text-slate-900">
          Como a criança é disciplinada em casa? <span class="font-normal text-slate-500">(múltipla escolha)</span>
        </p>

        <div class="grid gap-3 md:grid-cols-2">
          <label
            v-for="opcao in opcoesDisciplina"
            :key="opcao"
            class="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700"
          >
            <input
              type="checkbox"
              class="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              :checked="dinamica.disciplinaOpcoes.includes(opcao)"
              @change="consulta.alternarOpcaoDisciplina(opcao)"
            />
            {{ opcao }}
          </label>
        </div>

        <label v-if="dinamica.disciplinaOpcoes.includes('Outros')" class="mt-4 block space-y-2">
          <span class="text-sm font-medium text-slate-900">Descreva "Outros"</span>
          <input
            type="text"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            placeholder="Descreva a forma de disciplina"
            :value="dinamica.disciplinaOutros"
            @input="atualizarCampo('disciplinaOutros', ($event.target as HTMLInputElement).value)"
          />
        </label>
      </section>
    </template>

    <section class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <p v-if="secaoCompleta" class="text-sm font-medium text-teal-700">
          <CheckCircleIcon class="mr-1 inline h-4 w-4" />
          Dinâmica familiar registrada. A seção está completa.
        </p>
        <p v-else-if="secaoIniciada" class="text-sm font-medium text-amber-700">
          Dinâmica familiar iniciada. Salve a seção após revisar os dados.
        </p>
        <p v-else class="text-sm font-medium text-slate-500">
          Registre o contexto psicossocial e familiar quando houver informação relevante.
        </p>
        <p v-if="consulta.erroSalvamentoDinamicaFamiliar" class="mt-1 text-sm text-red-600">
          {{ consulta.erroSalvamentoDinamicaFamiliar }}
        </p>
        <p v-if="mensagemSucesso" class="mt-1 text-sm text-teal-700">{{ mensagemSucesso }}</p>
      </div>
      <button
        v-if="false"
        type="button"
        class="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="consulta.salvandoDinamicaFamiliar"
        @click="salvar"
      >
        {{ consulta.salvandoDinamicaFamiliar ? 'Salvando...' : 'Salvar seção' }}
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { CheckCircleIcon } from '@heroicons/vue/24/outline'
import { useConsultaStore, type DadosDinamicaFamiliarConsulta } from '../../stores/consulta'

const consulta = useConsultaStore()
const mensagemSucesso = ref('')

const dinamica = computed(() => consulta.dinamicaFamiliar)

const secaoCompleta = computed(() => consulta.completedSections.has('dinamicaFamiliar'))
const secaoIniciada = computed(() => consulta.startedSections.has('dinamicaFamiliar'))

type SelectCampo = 'relacionamentoCompanheiro' | 'resolucaoDesentendimentos'
type BooleanCampo =
  | 'fumanteDomicilio'
  | 'usoAlcoolDrogas'
  | 'insegurancaAlimentar'
  | 'familiarPreso'
  | 'preocupacaoComportamento'

const perguntas: Array<{
  campo: SelectCampo | BooleanCampo
  label: string
  tipo: 'select' | 'boolean'
  opcoes?: string[]
}> = [
  {
    campo: 'relacionamentoCompanheiro',
    label: 'Relacionamento com companheiro(a)',
    tipo: 'select',
    opcoes: ['Bom', 'Regular', 'Conflituoso', 'Não se aplica'],
  },
  {
    campo: 'resolucaoDesentendimentos',
    label: 'Vocês resolvem desentendimentos',
    tipo: 'select',
    opcoes: ['Conversando', 'Com dificuldade', 'Com agressividade', 'Não se aplica'],
  },
  { campo: 'fumanteDomicilio', label: 'Há fumante no domicílio?', tipo: 'boolean' },
  { campo: 'usoAlcoolDrogas', label: 'Há uso de álcool ou drogas por familiar na residência?', tipo: 'boolean' },
  { campo: 'insegurancaAlimentar', label: 'Há insegurança alimentar em casa (falta de comida)?', tipo: 'boolean' },
  { campo: 'familiarPreso', label: 'Há familiar próximo que está ou esteve preso?', tipo: 'boolean' },
  { campo: 'preocupacaoComportamento', label: 'Há preocupação com o comportamento da criança?', tipo: 'boolean' },
]

const opcoesDisciplina = [
  'Conversa',
  'Gritos',
  'Agressão física',
  'Castigo (tempo, privilégios)',
  'Palmadas',
  'Outros',
]

function atualizarCampo<K extends keyof DadosDinamicaFamiliarConsulta>(
  campo: K,
  valor: DadosDinamicaFamiliarConsulta[K],
) {
  mensagemSucesso.value = ''
  consulta.atualizarCampoDinamicaFamiliar(campo, valor)
}

async function salvar() {
  mensagemSucesso.value = ''
  await consulta.salvarDinamicaFamiliar()
  mensagemSucesso.value = 'Dinâmica familiar salva no banco.'
}
</script>
