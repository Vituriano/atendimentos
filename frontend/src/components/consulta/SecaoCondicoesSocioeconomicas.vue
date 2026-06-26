<template>
  <div class="space-y-5">
    <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="mb-5 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Dados socioeconômicos</p>
          <p class="mt-1 text-sm text-slate-500">
            Registre renda, moradia, saneamento e fatores de vulnerabilidade do ambiente familiar.
          </p>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div class="space-y-1.5 md:col-span-1">
          <label class="text-sm font-medium text-slate-900">Renda familiar</label>
          <input
            type="text"
            class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100 disabled:text-slate-400"
            placeholder="Ex: 2 salários mínimos"
            :value="dados.rendaFamiliar"
            :disabled="dados.rendaNaoInformada"
            @input="atualizarCampo('rendaFamiliar', ($event.target as HTMLInputElement).value)"
          />
          <label class="inline-flex cursor-pointer items-center gap-2 pt-1 text-xs text-slate-600">
            <input
              type="checkbox"
              class="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              :checked="dados.rendaNaoInformada"
              @change="atualizarCampo('rendaNaoInformada', ($event.target as HTMLInputElement).checked)"
            />
            Não sabe ou não quer informar
          </label>
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-medium text-slate-900">Tipo de casa</label>
          <select
            class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            :value="dados.tipoCasa"
            @change="atualizarCampo('tipoCasa', ($event.target as HTMLSelectElement).value)"
          >
            <option value="">Selecione</option>
            <option v-for="opcao in tiposCasa" :key="opcao" :value="opcao">{{ opcao }}</option>
          </select>
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-medium text-slate-900">Número de cômodos</label>
          <input
            type="number"
            min="0"
            max="99"
            class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            placeholder="Ex: 4"
            :value="dados.numeroComodos ?? ''"
            @input="atualizarNumeroComodos(($event.target as HTMLInputElement).value)"
          />
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-medium text-slate-900">Banheiro</label>
          <select
            class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            :value="dados.banheiro"
            @change="atualizarCampo('banheiro', ($event.target as HTMLSelectElement).value)"
          >
            <option value="">Selecione</option>
            <option v-for="opcao in opcoesBanheiro" :key="opcao" :value="opcao">{{ opcao }}</option>
          </select>
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-medium text-slate-900">Quarto da criança</label>
          <select
            class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            :value="dados.quartoCrianca"
            @change="atualizarCampo('quartoCrianca', ($event.target as HTMLSelectElement).value)"
          >
            <option value="">Selecione</option>
            <option v-for="opcao in opcoesQuarto" :key="opcao" :value="opcao">{{ opcao }}</option>
          </select>
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-medium text-slate-900">Presença de animais</label>
          <input
            type="text"
            class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            placeholder="Ex: Cachorro e gato / Não possui"
            :value="dados.presencaAnimais"
            @input="atualizarCampo('presencaAnimais', ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>
    </section>

    <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p class="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Infraestrutura e saneamento</p>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <RadioBoolean
          label="Água encanada"
          name="agua-encanada"
          :value="dados.aguaEncanada"
          @change="atualizarCampo('aguaEncanada', $event)"
        />
        <RadioBoolean
          label="Energia elétrica"
          name="energia-eletrica"
          :value="dados.energiaEletrica"
          @change="atualizarCampo('energiaEletrica', $event)"
        />
        <RadioBoolean
          label="Coleta de lixo"
          name="coleta-lixo"
          :value="dados.coletaLixo"
          @change="atualizarCampo('coletaLixo', $event)"
        />

        <div class="space-y-1.5 md:col-span-2 xl:col-span-1">
          <label class="text-sm font-medium text-slate-900">Esgoto</label>
          <select
            class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            :value="dados.esgoto"
            @change="atualizarCampo('esgoto', ($event.target as HTMLSelectElement).value)"
          >
            <option value="">Selecione</option>
            <option v-for="opcao in opcoesEsgoto" :key="opcao" :value="opcao">{{ opcao }}</option>
          </select>
        </div>
      </div>
    </section>

    <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p class="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Vulnerabilidade territorial</p>
      <RadioBoolean
        label="A família reside em área com violência frequente?"
        name="area-violencia"
        :value="dados.areaViolencia"
        @change="atualizarCampo('areaViolencia', $event)"
      />
    </section>

    <section class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <p v-if="secaoCompleta" class="text-sm font-medium text-teal-700">
          <CheckCircleIcon class="mr-1 inline h-4 w-4" />
          Condições socioeconômicas registradas. A seção está completa.
        </p>
        <p v-else-if="secaoIniciada" class="text-sm font-medium text-amber-700">
          Condições socioeconômicas iniciadas. Salve a seção após revisar os dados.
        </p>
        <p v-else class="text-sm font-medium text-slate-500">
          Registre as condições de moradia e contexto socioeconômico quando houver informação disponível.
        </p>
        <p v-if="consulta.erroSalvamentoCondicoesSocioeconomicas" class="mt-1 text-sm text-red-600">
          {{ consulta.erroSalvamentoCondicoesSocioeconomicas }}
        </p>
        <p v-if="mensagemSucesso" class="mt-1 text-sm text-teal-700">{{ mensagemSucesso }}</p>
      </div>
      <button
        type="button"
        class="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="consulta.salvandoCondicoesSocioeconomicas"
        @click="salvar"
      >
        {{ consulta.salvandoCondicoesSocioeconomicas ? 'Salvando...' : 'Salvar seção' }}
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, ref, type PropType } from 'vue'
import { CheckCircleIcon } from '@heroicons/vue/24/outline'
import { useConsultaStore, type DadosCondicoesSocioeconomicasConsulta } from '../../stores/consulta'

const consulta = useConsultaStore()
const mensagemSucesso = ref('')

const dados = computed(() => consulta.condicoesSocioeconomicas)
const secaoCompleta = computed(() => consulta.completedSections.has('socioeconomico'))
const secaoIniciada = computed(() => consulta.startedSections.has('socioeconomico'))

const tiposCasa = ['Alvenaria', 'Madeira', 'Mista', 'Apartamento', 'Ocupação/abrigo', 'Outro']
const opcoesBanheiro = ['Exclusivo da residência', 'Compartilhado', 'Não possui']
const opcoesQuarto = ['Individual', 'Compartilhado com irmãos', 'Compartilhado com pais/responsáveis', 'Não possui quarto próprio']
const opcoesEsgoto = ['Rede pública', 'Fossa séptica', 'Fossa rudimentar', 'Céu aberto', 'Não sabe informar']

const RadioBoolean = defineComponent({
  name: 'RadioBoolean',
  props: {
    label: { type: String, required: true },
    name: { type: String, required: true },
    value: { type: Boolean as PropType<boolean | null>, default: null },
  },
  emits: ['change'],
  setup(props, { emit }) {
    return () => h('div', { class: 'space-y-2' }, [
      h('p', { class: 'text-sm font-medium text-slate-900' }, props.label),
      h('div', { class: 'flex gap-5' }, [
        h('label', { class: 'inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700' }, [
          h('input', {
            type: 'radio',
            name: props.name,
            class: 'h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500',
            checked: props.value === true,
            onChange: () => emit('change', true),
          }),
          'Sim',
        ]),
        h('label', { class: 'inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700' }, [
          h('input', {
            type: 'radio',
            name: props.name,
            class: 'h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500',
            checked: props.value === false,
            onChange: () => emit('change', false),
          }),
          'Não',
        ]),
      ]),
    ])
  },
})

function atualizarCampo<K extends keyof DadosCondicoesSocioeconomicasConsulta>(
  campo: K,
  valor: DadosCondicoesSocioeconomicasConsulta[K],
) {
  mensagemSucesso.value = ''
  consulta.atualizarCampoCondicoesSocioeconomicas(campo, valor)
}

function atualizarNumeroComodos(valor: string) {
  mensagemSucesso.value = ''
  const numero = valor.trim() === '' ? null : Number(valor)
  consulta.atualizarCampoCondicoesSocioeconomicas('numeroComodos', Number.isFinite(numero) ? numero : null)
}

async function salvar() {
  mensagemSucesso.value = ''
  await consulta.salvarCondicoesSocioeconomicas()
  mensagemSucesso.value = 'Condições socioeconômicas salvas no banco.'
}
</script>
