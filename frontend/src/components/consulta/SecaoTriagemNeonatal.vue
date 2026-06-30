<template>
  <div class="space-y-6">
    <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Identificação Estendida</h3>
          <p class="mt-1 text-sm text-slate-500">Registre dados do nascimento e condições prévias relevantes.</p>
        </div>
        <span
          v-if="idadeCorrigidaTexto"
          class="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700"
        >
          Idade corrigida: {{ idadeCorrigidaTexto }}
        </span>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-700" for="idade-gestacional">Idade gestacional ao nascer (semanas)</label>
          <input
            id="idade-gestacional"
            :value="camposNumericos.idadeGestacionalSemanas"
            type="text"
            inputmode="decimal"
            placeholder="Ex: 34"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            @input="atualizarNumero('idadeGestacionalSemanas', ($event.target as HTMLInputElement).value)"
          />
          <p v-if="idadeGestacionalInvalida" class="text-xs text-amber-700">Faixa esperada para triagem: 20 a 45 semanas.</p>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-700" for="peso-nascimento">Peso ao nascimento (gramas)</label>
          <input
            id="peso-nascimento"
            :value="camposNumericos.pesoNascimentoGramas"
            type="text"
            inputmode="numeric"
            placeholder="Ex: 2450"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            @input="atualizarNumero('pesoNascimentoGramas', ($event.target as HTMLInputElement).value)"
          />
          <p v-if="pesoNascimentoInvalido" class="text-xs text-amber-700">Faixa esperada para triagem: 300 a 7000 gramas.</p>
        </div>
      </div>

      <div class="mt-4 space-y-2">
        <label class="text-sm font-medium text-slate-700" for="hipoteses-diagnosticas">Hipóteses diagnósticas anteriores</label>
        <textarea
          id="hipoteses-diagnosticas"
          :value="triagem.hipotesesDiagnosticasAnteriores"
          rows="3"
          placeholder="Liste diagnósticos prévios relevantes..."
          class="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          @input="atualizarTexto('hipotesesDiagnosticasAnteriores', ($event.target as HTMLTextAreaElement).value)"
        />
      </div>
    </section>

    <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Testes de Triagem Neonatal</h3>
          <p class="mt-1 text-sm text-slate-500">Registre o resultado de cada teste conforme caderneta ou informação trazida pela família.</p>
        </div>
        <span
          class="rounded-full px-3 py-1 text-xs font-medium"
          :class="triagemCompleta ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'"
        >
          {{ totalResultados }}/4 testes registrados
        </span>
      </div>

      <p
        v-if="totalResultados === 0"
        class="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500"
      >
        Registre o resultado de cada teste de triagem. Se não realizado, selecione “Não realizado”.
      </p>

      <div class="grid gap-4 md:grid-cols-2">
        <article
          v-for="teste in testes"
          :key="teste.key"
          class="rounded-lg border p-4 transition-colors"
          :class="classeCard(teste.valor.resultado)"
        >
          <div class="mb-3 flex items-center justify-between gap-3">
            <h4 class="text-sm font-semibold text-slate-800">{{ teste.titulo }}</h4>
            <span
              v-if="teste.valor.resultado"
              class="rounded-full px-2.5 py-1 text-xs font-medium"
              :class="classeBadge(teste.valor.resultado)"
            >
              {{ labelResultado(teste.valor.resultado) }}
            </span>
          </div>

          <div class="space-y-3">
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-slate-700">Resultado</label>
              <select
                :value="teste.valor.resultado"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                @change="atualizarTeste(teste.key, 'resultado', ($event.target as HTMLSelectElement).value as ResultadoTriagemNeonatal)"
              >
                <option value="">Selecione</option>
                <option value="normal">Normal</option>
                <option value="alterado">Alterado</option>
                <option value="nao-realizado">Não realizado</option>
                <option value="pendente">Pendente</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-medium text-slate-700">Data</label>
              <input
                :value="teste.valor.data"
                type="date"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                @input="atualizarTeste(teste.key, 'data', ($event.target as HTMLInputElement).value)"
              />
            </div>

            <div v-if="teste.valor.resultado === 'alterado'" class="space-y-1.5">
              <label class="text-xs font-medium text-slate-700">Descrição do resultado / conduta</label>
              <textarea
                :value="teste.valor.descricao"
                rows="2"
                placeholder="Descreva a alteração, encaminhamento ou orientação..."
                class="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                @input="atualizarTeste(teste.key, 'descricao', ($event.target as HTMLTextAreaElement).value)"
              />
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <p v-if="triagemCompleta" class="text-sm font-medium text-teal-700">Campos obrigatórios preenchidos. A seção está completa.</p>
        <p v-else-if="triagemIniciada" class="text-sm font-medium text-amber-700">Triagem iniciada. Informe o resultado dos quatro testes para completar a seção.</p>
        <p v-else class="text-sm font-medium text-slate-500">Preencha os dados de triagem neonatal conforme caderneta física.</p>
        <p v-if="consulta.erroSalvamentoTriagemNeonatal" class="mt-1 text-sm text-red-600">{{ consulta.erroSalvamentoTriagemNeonatal }}</p>
        <p v-if="mensagemSucesso" class="mt-1 text-sm text-teal-700">{{ mensagemSucesso }}</p>
      </div>
      <button
        v-if="false"
        class="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="consulta.salvandoTriagemNeonatal"
        @click="salvar"
      >
        {{ consulta.salvandoTriagemNeonatal ? 'Salvando...' : 'Salvar seção' }}
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { usePacienteStore } from '../../stores/paciente'
import {
  useConsultaStore,
  type DadosTriagemNeonatalConsulta,
  type ResultadoTriagemNeonatal,
  type TesteTriagemNeonatal,
} from '../../stores/consulta'

const consulta = useConsultaStore()
const pacienteStore = usePacienteStore()
const { pacienteAtivo } = storeToRefs(pacienteStore)
const mensagemSucesso = ref('')

type CampoNumero = 'idadeGestacionalSemanas' | 'pesoNascimentoGramas'
type CampoTexto = 'hipotesesDiagnosticasAnteriores'
type ChaveTeste = 'testePezinho' | 'testeOrelhinha' | 'testeOlhinho' | 'testeCoracaozinho'
type CampoTeste = keyof TesteTriagemNeonatal

const triagem = computed(() => consulta.triagemNeonatal)
let atualizandoNumeroPelaTela = false

const camposNumericos = reactive({
  idadeGestacionalSemanas: valorInicialNumero(triagem.value.idadeGestacionalSemanas),
  pesoNascimentoGramas: valorInicialNumero(triagem.value.pesoNascimentoGramas),
})

watch(
  () => [triagem.value.idadeGestacionalSemanas, triagem.value.pesoNascimentoGramas],
  () => {
    if (atualizandoNumeroPelaTela) return

    camposNumericos.idadeGestacionalSemanas = valorInicialNumero(triagem.value.idadeGestacionalSemanas)
    camposNumericos.pesoNascimentoGramas = valorInicialNumero(triagem.value.pesoNascimentoGramas)
  }
)

const testes = computed(() => [
  { key: 'testePezinho' as const, titulo: 'Teste do Pezinho', valor: triagem.value.testePezinho },
  { key: 'testeOrelhinha' as const, titulo: 'Teste da Orelhinha (PEATE)', valor: triagem.value.testeOrelhinha },
  { key: 'testeOlhinho' as const, titulo: 'Teste do Olhinho / Fundo de olho', valor: triagem.value.testeOlhinho },
  { key: 'testeCoracaozinho' as const, titulo: 'Teste do Coraçãozinho (Oximetria)', valor: triagem.value.testeCoracaozinho },
])

const totalResultados = computed(() => testes.value.filter(t => Boolean(t.valor.resultado)).length)
const triagemCompleta = computed(() => totalResultados.value === 4)
const triagemIniciada = computed(() => {
  const dados = triagem.value
  return Boolean(
    dados.idadeGestacionalSemanas !== null ||
    dados.pesoNascimentoGramas !== null ||
    dados.hipotesesDiagnosticasAnteriores.trim() ||
    totalResultados.value > 0 ||
    testes.value.some(t => Boolean(t.valor.data || t.valor.descricao.trim()))
  )
})

const idadeGestacionalInvalida = computed(() => {
  const valor = triagem.value.idadeGestacionalSemanas
  return valor !== null && (valor < 20 || valor > 45)
})

const pesoNascimentoInvalido = computed(() => {
  const valor = triagem.value.pesoNascimentoGramas
  return valor !== null && (valor < 300 || valor > 7000)
})

const idadeCorrigidaTexto = computed(() => {
  const idadeGestacional = triagem.value.idadeGestacionalSemanas
  const idadeEmMeses = pacienteAtivo.value?.idadeEmMeses ?? 0
  if (!idadeGestacional || idadeGestacional >= 37) return ''

  const mesesParaCorrigir = Math.max(0, (40 - idadeGestacional) / 4.33)
  const idadeCorrigida = Math.max(0, idadeEmMeses - mesesParaCorrigir)
  return `${idadeCorrigida.toFixed(1).replace('.', ',')} meses`
})

function valorInicialNumero(valor: number | null | undefined): string {
  return valor === null || valor === undefined ? '' : String(valor).replace('.', ',')
}

function parseNumeroPtBr(valor: string): number | null {
  const normalizado = valor.trim().replace(',', '.')
  if (!normalizado) return null
  const numero = Number(normalizado)
  return Number.isFinite(numero) ? numero : null
}

function clonarDados(): DadosTriagemNeonatalConsulta {
  return {
    idadeGestacionalSemanas: triagem.value.idadeGestacionalSemanas,
    pesoNascimentoGramas: triagem.value.pesoNascimentoGramas,
    hipotesesDiagnosticasAnteriores: triagem.value.hipotesesDiagnosticasAnteriores,
    testePezinho: { ...triagem.value.testePezinho },
    testeOrelhinha: { ...triagem.value.testeOrelhinha },
    testeOlhinho: { ...triagem.value.testeOlhinho },
    testeCoracaozinho: { ...triagem.value.testeCoracaozinho },
    atualizadoEm: triagem.value.atualizadoEm,
  }
}

function atualizarNumero(campo: CampoNumero, valor: string) {
  mensagemSucesso.value = ''
  camposNumericos[campo] = valor

  const dados = clonarDados()
  dados[campo] = parseNumeroPtBr(valor)

  atualizandoNumeroPelaTela = true
  consulta.atualizarTriagemNeonatal(dados)
  queueMicrotask(() => {
    atualizandoNumeroPelaTela = false
  })
}

function atualizarTexto(campo: CampoTexto, valor: string) {
  mensagemSucesso.value = ''
  const dados = clonarDados()
  dados[campo] = valor
  consulta.atualizarTriagemNeonatal(dados)
}

function atualizarTeste(chave: ChaveTeste, campo: CampoTeste, valor: string | ResultadoTriagemNeonatal) {
  mensagemSucesso.value = ''
  const dados = clonarDados()
  dados[chave] = {
    ...dados[chave],
    [campo]: valor,
  }
  consulta.atualizarTriagemNeonatal(dados)
}

function labelResultado(resultado: ResultadoTriagemNeonatal): string {
  const labels: Record<Exclude<ResultadoTriagemNeonatal, ''>, string> = {
    normal: 'Normal',
    alterado: 'Alterado',
    pendente: 'Pendente',
    'nao-realizado': 'Não realizado',
  }
  return resultado ? labels[resultado] : ''
}

function classeCard(resultado: ResultadoTriagemNeonatal): string {
  if (resultado === 'normal') return 'border-green-300 bg-green-50'
  if (resultado === 'alterado') return 'border-red-300 bg-red-50'
  if (resultado === 'pendente') return 'border-amber-300 bg-amber-50'
  if (resultado === 'nao-realizado') return 'border-slate-300 bg-slate-50'
  return 'border-slate-200 bg-white'
}

function classeBadge(resultado: ResultadoTriagemNeonatal): string {
  if (resultado === 'normal') return 'bg-green-100 text-green-700'
  if (resultado === 'alterado') return 'bg-red-100 text-red-700'
  if (resultado === 'pendente') return 'bg-amber-100 text-amber-700'
  if (resultado === 'nao-realizado') return 'bg-slate-100 text-slate-600'
  return 'bg-slate-100 text-slate-600'
}

async function salvar() {
  mensagemSucesso.value = ''
  await consulta.salvarTriagemNeonatal()
  mensagemSucesso.value = 'Triagem neonatal salva no banco.'
}
</script>
