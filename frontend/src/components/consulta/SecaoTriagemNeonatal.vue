<template>
  <div class="space-y-6">
    <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Identificação Estendida</h3>
          <p class="mt-1 text-sm text-slate-500">Registre dados do nascimento e condições prévias relevantes.</p>
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
          {{ totalResultados }}/{{ totalTestes }} testes registrados
        </span>
      </div>

      <p
        v-if="totalResultados === 0"
        class="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500"
      >
        Registre o resultado de cada teste de triagem. Se não realizado, selecione “Não realizado”.
      </p>

      <div class="grid gap-4 md:grid-cols-2">
        <!-- Todos os testes aceitam múltiplas coletas, sem limite. -->
        <article
          v-for="teste in testesColecao"
          :key="teste.key"
          class="rounded-lg border border-slate-200 bg-white p-4"
        >
          <div class="mb-3 flex items-center justify-between gap-3">
            <h4 class="text-sm font-semibold text-slate-800">{{ teste.titulo }}</h4>
            <button
              type="button"
              class="rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700 transition hover:bg-teal-100"
              @click="adicionarColeta(teste.key)"
            >
              + Adicionar coleta
            </button>
          </div>

          <div class="space-y-3">
            <div
              v-for="(coleta, index) in teste.coletas"
              :key="index"
              class="rounded-lg border p-3 transition-colors"
              :class="classeCard(coleta.resultado)"
            >
              <div class="mb-2 flex items-center justify-between gap-2">
                <span class="text-xs font-medium text-slate-600">Coleta {{ index + 1 }}</span>
                <div class="flex items-center gap-2">
                  <span
                    v-if="coleta.resultado"
                    class="rounded-full px-2.5 py-1 text-xs font-medium"
                    :class="classeBadge(coleta.resultado)"
                  >
                    {{ labelResultado(coleta.resultado) }}
                  </span>
                  <button
                    v-if="teste.coletas.length > 1"
                    type="button"
                    class="rounded-md px-1.5 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                    @click="removerColeta(teste.key, index)"
                  >
                    Remover
                  </button>
                </div>
              </div>

              <div class="space-y-3">
                <div class="space-y-1.5">
                  <label class="text-xs font-medium text-slate-700">Resultado</label>
                  <select
                    :value="coleta.resultado"
                    class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    @change="atualizarColeta(teste.key, index, 'resultado', ($event.target as HTMLSelectElement).value as ResultadoTriagemNeonatal)"
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
                    :value="coleta.data"
                    type="date"
                    class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    @input="atualizarColeta(teste.key, index, 'data', ($event.target as HTMLInputElement).value)"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-medium text-slate-700">Observação / conduta</label>
                  <textarea
                    :value="coleta.descricao"
                    rows="2"
                    placeholder="Descreva o resultado, encaminhamento ou orientação..."
                    class="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    @input="atualizarColeta(teste.key, index, 'descricao', ($event.target as HTMLTextAreaElement).value)"
                  />
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <p v-if="triagemCompleta" class="text-sm font-medium text-teal-700">Campos obrigatórios preenchidos. A seção está completa.</p>
        <p v-else-if="triagemIniciada" class="text-sm font-medium text-amber-700">Triagem iniciada. Informe o resultado de todos os testes para completar a seção.</p>
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
import { computed, ref } from 'vue'
import {
  useConsultaStore,
  type DadosTriagemNeonatalConsulta,
  type ResultadoTriagemNeonatal,
  type TesteTriagemNeonatal,
} from '../../stores/consulta'

const consulta = useConsultaStore()
const mensagemSucesso = ref('')

type CampoTexto = 'hipotesesDiagnosticasAnteriores'
type ChaveColecao = 'testePezinho' | 'testeOrelhinha' | 'testeOlhinho' | 'testeFundoDeOlho' | 'testeCoracaozinho'
type CampoTeste = keyof TesteTriagemNeonatal

const triagem = computed(() => consulta.triagemNeonatal)

const testesColecao = computed(() => [
  { key: 'testePezinho' as const, titulo: 'Teste do Pezinho', coletas: triagem.value.testePezinho },
  { key: 'testeOrelhinha' as const, titulo: 'Teste da Orelhinha', coletas: triagem.value.testeOrelhinha },
  { key: 'testeOlhinho' as const, titulo: 'Teste do Olhinho', coletas: triagem.value.testeOlhinho },
  { key: 'testeFundoDeOlho' as const, titulo: 'Fundo de olho', coletas: triagem.value.testeFundoDeOlho },
  { key: 'testeCoracaozinho' as const, titulo: 'Teste do Coraçãozinho (Oximetria)', coletas: triagem.value.testeCoracaozinho },
])

const totalTestes = computed(() => testesColecao.value.length)

const totalResultados = computed(() => testesColecao.value.filter(t => t.coletas.some(c => Boolean(c.resultado))).length)

const triagemCompleta = computed(() => totalResultados.value === totalTestes.value)

const triagemIniciada = computed(() => {
  const dados = triagem.value
  return Boolean(
    dados.hipotesesDiagnosticasAnteriores.trim() ||
    totalResultados.value > 0 ||
    testesColecao.value.some(t => t.coletas.some(c => Boolean(c.data || c.descricao.trim())))
  )
})

function criarColetaVazia(): TesteTriagemNeonatal {
  return { resultado: '', data: '', descricao: '' }
}

function clonarDados(): DadosTriagemNeonatalConsulta {
  return {
    hipotesesDiagnosticasAnteriores: triagem.value.hipotesesDiagnosticasAnteriores,
    testePezinho: triagem.value.testePezinho.map(coleta => ({ ...coleta })),
    testeOrelhinha: triagem.value.testeOrelhinha.map(coleta => ({ ...coleta })),
    testeOlhinho: triagem.value.testeOlhinho.map(coleta => ({ ...coleta })),
    testeFundoDeOlho: triagem.value.testeFundoDeOlho.map(coleta => ({ ...coleta })),
    testeCoracaozinho: triagem.value.testeCoracaozinho.map(coleta => ({ ...coleta })),
    atualizadoEm: triagem.value.atualizadoEm,
  }
}

function atualizarTexto(campo: CampoTexto, valor: string) {
  mensagemSucesso.value = ''
  const dados = clonarDados()
  dados[campo] = valor
  consulta.atualizarTriagemNeonatal(dados)
}

function atualizarColeta(chave: ChaveColecao, index: number, campo: CampoTeste, valor: string | ResultadoTriagemNeonatal) {
  mensagemSucesso.value = ''
  const dados = clonarDados()
  const coleta = dados[chave][index]
  if (!coleta) return
  dados[chave][index] = { ...coleta, [campo]: valor }
  consulta.atualizarTriagemNeonatal(dados)
}

function adicionarColeta(chave: ChaveColecao) {
  mensagemSucesso.value = ''
  const dados = clonarDados()
  // Nova coleta entra no topo da lista (fica como "Coleta 1"), conforme
  // diretriz de trazer o item recém-adicionado pra cima em vez de pra baixo.
  dados[chave] = [criarColetaVazia(), ...dados[chave]]
  consulta.atualizarTriagemNeonatal(dados)
}

function removerColeta(chave: ChaveColecao, index: number) {
  mensagemSucesso.value = ''
  const dados = clonarDados()
  if (dados[chave].length <= 1) return
  dados[chave] = dados[chave].filter((_, i) => i !== index)
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
