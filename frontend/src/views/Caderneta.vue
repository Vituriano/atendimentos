<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  BookOpenIcon,
  CheckIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  MinusIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { usePacienteStore } from '../stores/paciente'
import { useConsultaStore, type CadernetaAntropometriaItem, type CadernetaMarcoHistoricoItem } from '../stores/consulta'
import { gruposMarcos } from '../data/marcos-desenvolvimento'
import {
  classificarValorPorZ,
  obterReferenciaCrescimento,
  obterSerieReferenciaPorSexo,
  type MetricaCrescimento,
  type SexoReferencia,
} from '../data/caderneta-growth-references'
import type { Paciente, StatusMarco } from '../types/clinica'

const pacienteStore = usePacienteStore()
const consultaStore = useConsultaStore()

const abaAtiva = ref<MetricaCrescimento | 'marcos'>('estatura')
const zoomAutomatico = ref(true)
const gruposAbertos = ref<Set<string>>(new Set(['3-5a']))

const paciente = computed(() => pacienteStore.pacienteAtivo)
const sexoReferencia = computed<SexoReferencia>(() => (paciente.value?.sexoBiologico ?? paciente.value?.sexo ?? 'F') === 'M' ? 'M' : 'F')

const metricas: Array<{ id: MetricaCrescimento | 'marcos'; label: string }> = [
  { id: 'pc', label: 'Curva de PC' },
  { id: 'estatura', label: 'Comprimento/Altura/Estatura' },
  { id: 'peso', label: 'Curva de Peso' },
  { id: 'imc', label: 'Curva de IMC' },
  { id: 'marcos', label: 'Marcos do Desenvolvimento' },
]

function parseDataPaciente(data: string | null | undefined): Date | null {
  const valor = (data ?? '').trim()
  if (!valor) return null

  // Pacientes vindos do CSV/AGHU chegam no formato ISO: yyyy-mm-dd.
  // Algumas telas antigas/mockavam no formato brasileiro: dd/mm/yyyy.
  // A Caderneta depende da data de nascimento para calcular a idade em meses;
  // se não aceitarmos os dois formatos, os pontos históricos existem na API,
  // mas não aparecem no gráfico.
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor)
  if (iso) {
    const [, ano, mes, dia] = iso.map(Number)
    return new Date(ano, mes - 1, dia)
  }

  const br = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor)
  if (br) {
    const [, dia, mes, ano] = br.map(Number)
    return new Date(ano, mes - 1, dia)
  }

  const dataParseada = new Date(valor)
  return Number.isNaN(dataParseada.getTime()) ? null : dataParseada
}

function parseBackendDate(data: string): Date {
  return new Date(data.endsWith('Z') || data.includes('+') ? data : `${data}Z`)
}

function diffMeses(inicio: Date, fim: Date): number {
  const msPorDia = 1000 * 60 * 60 * 24
  const dias = Math.max(0, (fim.getTime() - inicio.getTime()) / msPorDia)

  // A caderneta precisa representar recém-nascidos por dias/semanas.
  // Se usarmos apenas mês inteiro, todas as consultas neonatais caem no eixo 0.
  return Number((dias / 30.4375).toFixed(2))
}

function formatarData(data: Date): string {
  return data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '')
}

function obterProntuarioPrincipal(p: Paciente): string {
  return p.prontuarioPrimario ?? p.prontuario ?? p.prontuarios?.[0]?.numero ?? '—'
}

function imc(pesoKg: number | null | undefined, alturaCm: number | null | undefined): number | null {
  if (!pesoKg || !alturaCm) return null
  const alturaM = alturaCm / 100
  return Number((pesoKg / (alturaM * alturaM)).toFixed(1))
}

interface PontoCaderneta {
  id: string
  idadeMeses: number
  valor: number
  dataLabel: string
  origem: string
  observacao: string
}

type ChaveCurvaZ = 'zNeg3' | 'zNeg2' | 'zNeg1' | 'z0' | 'z1' | 'z2' | 'z3'

interface TooltipCurvaReferencia {
  label: string
  chave: ChaveCurvaZ
  valor: number
}

interface TooltipPaciente {
  valor: number
  idadeMeses: number
  idadeLabel: string
  dataLabel: string
  origem: string
  deltaLabel: string
}

interface TooltipCaderneta {
  idadeMeses: number
  idadeLabel: string
  svgX: number
  svgY: number
  referencias: TooltipCurvaReferencia[]
  paciente: TooltipPaciente | null
}

const tooltipCaderneta = ref<{ idadeMeses: number; svgX: number; svgY: number } | null>(null)

const curvasTooltip: Array<{ label: string; chave: ChaveCurvaZ }> = [
  { label: 'Z +3', chave: 'z3' },
  { label: 'Z +2', chave: 'z2' },
  { label: 'Z +1', chave: 'z1' },
  { label: 'Mediana', chave: 'z0' },
  { label: 'Z -1', chave: 'zNeg1' },
  { label: 'Z -2', chave: 'zNeg2' },
  { label: 'Z -3', chave: 'zNeg3' },
]

const nascimento = computed(() => paciente.value ? parseDataPaciente(paciente.value.dataNascimento) : null)

function pontosBanco(metric: MetricaCrescimento): PontoCaderneta[] {
  if (!nascimento.value) return []
  return (consultaStore.cadernetaDigital?.antropometria ?? [])
    .map((item: CadernetaAntropometriaItem) => {
      const data = parseBackendDate(item.dataConsulta)
      const idadeMeses = diffMeses(nascimento.value!, data)
      const valor = metric === 'peso'
        ? item.pesoKg
        : metric === 'estatura'
          ? item.alturaCm
          : metric === 'pc'
            ? item.perimetroCefalicoCm
            : item.imc ?? imc(item.pesoKg, item.alturaCm)

      if (valor === null || valor === undefined || Number.isNaN(valor)) return null
      return {
        id: `db-${metric}-${item.consultaId}-${item.origem}-${item.dataConsulta}`,
        idadeMeses,
        valor: Number(valor),
        dataLabel: formatarData(data),
        origem: item.origem,
        observacao: item.observacao,
      }
    })
    .filter((item): item is PontoCaderneta => Boolean(item))
}

const pontosPaciente = computed(() => {
  if (abaAtiva.value === 'marcos') return []
  return pontosBanco(abaAtiva.value).sort((a, b) => a.idadeMeses - b.idadeMeses)
})

const mensagemSemPontos = computed(() => {
  if (!nascimento.value) {
    return 'Não foi possível calcular a idade do paciente porque a data de nascimento não foi reconhecida.'
  }
  if ((consultaStore.cadernetaDigital?.antropometria ?? []).length === 0) {
    return 'A API da caderneta não retornou medidas históricas para este paciente.'
  }
  return 'Ainda não há medidas históricas registradas para esta curva.'
})

const referenciaAtual = computed(() => abaAtiva.value === 'marcos' ? null : obterReferenciaCrescimento(abaAtiva.value, sexoReferencia.value))
const linhasReferencia = computed(() => abaAtiva.value === 'marcos' ? [] : obterSerieReferenciaPorSexo(abaAtiva.value, sexoReferencia.value))

const ultimoPonto = computed(() => pontosPaciente.value[pontosPaciente.value.length - 1] ?? null)
const classificacaoAtual = computed(() => {
  if (abaAtiva.value === 'marcos' || !ultimoPonto.value) return ''
  return classificarValorPorZ(abaAtiva.value, sexoReferencia.value, ultimoPonto.value.idadeMeses, ultimoPonto.value.valor)
})

function arredondarParaCima(valor: number, passo: number): number {
  return Number((Math.ceil(valor / passo) * passo).toFixed(2))
}

function arredondarParaBaixo(valor: number, passo: number): number {
  return Number((Math.floor(valor / passo) * passo).toFixed(2))
}

function calcularDominioX(): [number, number] {
  const limiteCompleto = Math.max(60, paciente.value?.idadeEmMeses ?? 60)

  if (!zoomAutomatico.value || pontosPaciente.value.length === 0) return [0, limiteCompleto]

  const idades = pontosPaciente.value.map(ponto => ponto.idadeMeses)
  const menor = Math.min(...idades)
  const maior = Math.max(...idades)
  const amplitude = Math.max(0.1, maior - menor)

  let margem = amplitude * 0.25
  let intervaloMinimo = 6
  let passoArredondamento = 1

  if (maior <= 1.5) {
    margem = 0.15
    intervaloMinimo = 1
    passoArredondamento = 0.25
  } else if (maior <= 6) {
    margem = 0.5
    intervaloMinimo = 2
    passoArredondamento = 0.5
  } else if (maior <= 24) {
    margem = 1.5
    intervaloMinimo = 6
    passoArredondamento = 1
  } else {
    margem = Math.max(3, margem)
    intervaloMinimo = 12
    passoArredondamento = 3
  }

  let inicio = Math.max(0, arredondarParaBaixo(menor - margem, passoArredondamento))
  let fim = Math.min(limiteCompleto, arredondarParaCima(maior + margem, passoArredondamento))

  if (fim - inicio < intervaloMinimo) {
    const centro = (menor + maior) / 2
    inicio = Math.max(0, arredondarParaBaixo(centro - intervaloMinimo / 2, passoArredondamento))
    fim = Math.min(limiteCompleto, arredondarParaCima(inicio + intervaloMinimo, passoArredondamento))
    if (fim - inicio < intervaloMinimo) inicio = Math.max(0, arredondarParaBaixo(fim - intervaloMinimo, passoArredondamento))
  }

  return [inicio, Math.max(fim, inicio + 0.25)]
}

function passoTicksX(inicio: number, fim: number): number {
  const amplitude = fim - inicio
  if (amplitude <= 1.25) return 0.25
  if (amplitude <= 3) return 0.5
  if (amplitude <= 6) return 1
  if (amplitude <= 12) return 2
  if (amplitude <= 24) return 3
  return 12
}

function gerarTicksX(inicio: number, fim: number): number[] {
  const passo = passoTicksX(inicio, fim)
  const ticks = new Set<number>([Number(inicio.toFixed(2)), Number(fim.toFixed(2))])
  const primeiro = arredondarParaCima(inicio, passo)

  for (let valor = primeiro; valor <= fim + 0.0001; valor = Number((valor + passo).toFixed(2))) {
    ticks.add(Number(valor.toFixed(2)))
  }

  return [...ticks].sort((a, b) => a - b)
}

function montarSerieReferenciaVisivel(inicio: number, fim: number) {
  const idades = new Set<number>([Number(inicio.toFixed(2)), Number(fim.toFixed(2))])

  for (const ponto of linhasReferencia.value) {
    if (ponto.idadeMeses > inicio && ponto.idadeMeses < fim) idades.add(ponto.idadeMeses)
  }

  return [...idades]
    .sort((a, b) => a - b)
    .map(idadeMeses => ({
      idadeMeses,
      zNeg3: interpolarReferencia('zNeg3', idadeMeses) ?? 0,
      zNeg2: interpolarReferencia('zNeg2', idadeMeses) ?? 0,
      zNeg1: interpolarReferencia('zNeg1', idadeMeses) ?? 0,
      z0: interpolarReferencia('z0', idadeMeses) ?? 0,
      z1: interpolarReferencia('z1', idadeMeses) ?? 0,
      z2: interpolarReferencia('z2', idadeMeses) ?? 0,
      z3: interpolarReferencia('z3', idadeMeses) ?? 0,
    }))
}

const periodoVisualizado = computed(() => {
  if (abaAtiva.value === 'marcos') return ''
  const [inicio, fim] = calcularDominioX()
  const label = `${formatarIdadeDetalhada(inicio)} a ${formatarIdadeDetalhada(fim)}`
  return zoomAutomatico.value ? `Zoom no histórico: ${label}` : `Curva completa: ${label}`
})

const chart = computed(() => {
  const referencia = referenciaAtual.value
  const width = 1000
  const height = 360
  const padding = { left: 55, right: 20, top: 20, bottom: 45 }
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom
  const yDomain = referencia?.eixoY ?? [0, 100]
  const [xMin, xMax] = calcularDominioX()
  const serieReferenciaVisivel = montarSerieReferenciaVisivel(xMin, xMax)

  function x(idadeMeses: number): number {
    return padding.left + ((idadeMeses - xMin) / (xMax - xMin)) * plotWidth
  }

  function y(valor: number): number {
    return padding.top + (1 - ((valor - yDomain[0]) / (yDomain[1] - yDomain[0]))) * plotHeight
  }

  function path(chave: 'zNeg3' | 'zNeg2' | 'zNeg1' | 'z0' | 'z1' | 'z2' | 'z3'): string {
    return serieReferenciaVisivel
      .map((ponto, index) => `${index === 0 ? 'M' : 'L'} ${x(ponto.idadeMeses).toFixed(1)} ${y(ponto[chave]).toFixed(1)}`)
      .join(' ')
  }

  function patientPath(): string {
    return pontosPaciente.value
      .map((ponto, index) => `${index === 0 ? 'M' : 'L'} ${x(ponto.idadeMeses).toFixed(1)} ${y(ponto.valor).toFixed(1)}`)
      .join(' ')
  }

  const yTicks = Array.from({ length: 6 }, (_, i) => Number((yDomain[0] + ((yDomain[1] - yDomain[0]) / 5) * i).toFixed(1)))
  const xTicks = gerarTicksX(xMin, xMax)

  return { width, height, padding, plotWidth, plotHeight, xMin, xMax, x, y, path, patientPath, yTicks, xTicks, yDomain }
})

function limitarNumero(valor: number, minimo: number, maximo: number): number {
  return Math.min(maximo, Math.max(minimo, valor))
}

function formatarNumero(valor: number, casas = 1): string {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })
}

function formatarIdadeDetalhada(meses: number): string {
  const mesesPositivos = Math.max(0, meses)

  if (mesesPositivos < 1) {
    const dias = Math.max(0, Math.round(mesesPositivos * 30.4375))
    if (dias < 7) return `${dias} ${dias === 1 ? 'dia' : 'dias'}`

    const semanas = Math.floor(dias / 7)
    const restoDias = dias % 7
    if (restoDias === 0) return `${semanas} ${semanas === 1 ? 'semana' : 'semanas'}`
    return `${semanas} ${semanas === 1 ? 'semana' : 'semanas'} e ${restoDias} ${restoDias === 1 ? 'dia' : 'dias'}`
  }

  const mesesArredondados = Number(mesesPositivos.toFixed(1))
  const anos = Math.floor(mesesArredondados / 12)
  const restoMeses = Number((mesesArredondados - anos * 12).toFixed(1))

  if (anos <= 0) return `${formatarNumero(mesesArredondados, mesesArredondados % 1 === 0 ? 0 : 1)} ${mesesArredondados === 1 ? 'mês' : 'meses'}`
  if (restoMeses <= 0) return `${anos} ${anos === 1 ? 'ano' : 'anos'}`
  return `${anos} ${anos === 1 ? 'ano' : 'anos'} e ${formatarNumero(restoMeses, restoMeses % 1 === 0 ? 0 : 1)} meses`
}

function formatarDeltaMeses(delta: number): string {
  const absoluto = Math.abs(delta)
  if (absoluto < 0.05) return 'mesma idade do eixo'
  return `${formatarIdadeDetalhada(absoluto)} ${delta > 0 ? 'depois' : 'antes'} do ponto do eixo`
}

function interpolarReferencia(chave: ChaveCurvaZ, idadeMeses: number): number | null {
  const serie = linhasReferencia.value
  if (serie.length === 0) return null

  const idade = limitarNumero(idadeMeses, serie[0].idadeMeses, serie[serie.length - 1].idadeMeses)
  const anteriorExato = serie.find(ponto => ponto.idadeMeses === idade)
  if (anteriorExato) return Number(anteriorExato[chave])

  const anterior = [...serie].reverse().find(ponto => ponto.idadeMeses <= idade) ?? serie[0]
  const proximo = serie.find(ponto => ponto.idadeMeses >= idade) ?? serie[serie.length - 1]
  if (anterior.idadeMeses === proximo.idadeMeses) return Number(anterior[chave])

  const proporcao = (idade - anterior.idadeMeses) / (proximo.idadeMeses - anterior.idadeMeses)
  return Number((Number(anterior[chave]) + (Number(proximo[chave]) - Number(anterior[chave])) * proporcao).toFixed(2))
}

function pacienteMaisProximo(idadeMeses: number): TooltipPaciente | null {
  if (pontosPaciente.value.length === 0) return null

  const ponto = pontosPaciente.value.reduce((maisProximo, atual) => {
    const distanciaAtual = Math.abs(atual.idadeMeses - idadeMeses)
    const distanciaAnterior = Math.abs(maisProximo.idadeMeses - idadeMeses)
    return distanciaAtual < distanciaAnterior ? atual : maisProximo
  }, pontosPaciente.value[0])

  return {
    valor: ponto.valor,
    idadeMeses: ponto.idadeMeses,
    idadeLabel: formatarIdadeDetalhada(ponto.idadeMeses),
    dataLabel: ponto.dataLabel,
    origem: ponto.origem,
    deltaLabel: formatarDeltaMeses(ponto.idadeMeses - idadeMeses),
  }
}

const tooltipInfo = computed<TooltipCaderneta | null>(() => {
  if (abaAtiva.value === 'marcos' || !tooltipCaderneta.value) return null

  const referencias = curvasTooltip
    .map(curva => {
      const valor = interpolarReferencia(curva.chave, tooltipCaderneta.value!.idadeMeses)
      return valor === null ? null : { ...curva, valor }
    })
    .filter((item): item is TooltipCurvaReferencia => Boolean(item))

  return {
    idadeMeses: tooltipCaderneta.value.idadeMeses,
    idadeLabel: formatarIdadeDetalhada(tooltipCaderneta.value.idadeMeses),
    svgX: tooltipCaderneta.value.svgX,
    svgY: tooltipCaderneta.value.svgY,
    referencias,
    paciente: pacienteMaisProximo(tooltipCaderneta.value.idadeMeses),
  }
})

const tooltipBox = computed(() => {
  const info = tooltipInfo.value
  if (!info) return null

  const largura = 285
  const altura = info.paciente ? 225 : 188
  const margem = 10
  let x = info.svgX + 14
  let y = info.svgY + 14

  if (x + largura > chart.value.width - margem) x = info.svgX - largura - 14
  if (y + altura > chart.value.height - chart.value.padding.bottom) y = chart.value.height - chart.value.padding.bottom - altura

  return {
    x: limitarNumero(x, chart.value.padding.left + 4, chart.value.width - largura - margem),
    y: limitarNumero(y, chart.value.padding.top + 4, chart.value.height - chart.value.padding.bottom - altura),
    largura,
    altura,
  }
})

function atualizarTooltipCaderneta(event: MouseEvent) {
  if (abaAtiva.value === 'marcos') return

  const alvo = event.currentTarget as SVGGraphicsElement
  const svg = alvo.ownerSVGElement
  const matriz = svg?.getScreenCTM()
  if (!svg || !matriz) return

  const ponto = svg.createSVGPoint()
  ponto.x = event.clientX
  ponto.y = event.clientY
  const local = ponto.matrixTransform(matriz.inverse())

  const svgX = limitarNumero(local.x, chart.value.padding.left, chart.value.width - chart.value.padding.right)
  const svgY = limitarNumero(local.y, chart.value.padding.top, chart.value.height - chart.value.padding.bottom)
  const proporcaoX = (svgX - chart.value.padding.left) / chart.value.plotWidth
  const idadeMeses = chart.value.xMin + proporcaoX * (chart.value.xMax - chart.value.xMin)

  tooltipCaderneta.value = { idadeMeses, svgX, svgY }
}

function limparTooltipCaderneta() {
  tooltipCaderneta.value = null
}

function xLabel(meses: number): string {
  if (meses === 0) return '0'
  if (meses < 1) {
    const semanas = Math.round(meses * 4.345)
    return semanas <= 0 ? '0' : `${semanas} sem`
  }
  if (meses < 12) return `${formatarNumero(meses, meses % 1 === 0 ? 0 : 1)}m`
  const anos = meses / 12
  if (meses % 12 === 0) return `${formatarNumero(anos, anos % 1 === 0 ? 0 : 1)} ${anos === 1 ? 'ano' : 'anos'}`
  return `${formatarNumero(meses, meses % 1 === 0 ? 0 : 1)}m`
}

function statusIcone(status: StatusMarco): string {
  if (status === 'confirmed') return '✓'
  if (status === 'not-achieved') return '×'
  if (status === 'not-verified') return 'NV'
  return '—'
}

function statusClasse(status: StatusMarco): string {
  if (status === 'confirmed') return 'text-green-600'
  if (status === 'not-achieved') return 'text-red-600'
  if (status === 'not-verified') return 'text-slate-600'
  return 'text-slate-400'
}

function agruparMarcosPorConsulta() {
  const porConsulta = new Map<number, CadernetaMarcoHistoricoItem[]>()
  for (const registro of consultaStore.cadernetaDigital?.marcos ?? []) {
    if (!porConsulta.has(registro.consultaId)) porConsulta.set(registro.consultaId, [])
    porConsulta.get(registro.consultaId)!.push(registro)
  }
  return porConsulta
}

const datasMarcos = computed(() => {
  const porConsulta = agruparMarcosPorConsulta()
  return [...porConsulta.entries()]
    .map(([consultaId, registros]) => ({
      consultaId,
      dataConsulta: registros[0]?.dataConsulta ?? '',
      label: registros[0]?.dataConsulta ? formatarData(parseBackendDate(registros[0].dataConsulta)) : `Consulta ${consultaId}`,
    }))
    .sort((a, b) => parseBackendDate(a.dataConsulta).getTime() - parseBackendDate(b.dataConsulta).getTime())
})

function statusMarco(marcoId: string, consultaId: number): StatusMarco | 'not-evaluated' {
  const registro = consultaStore.cadernetaDigital?.marcos.find(item => item.consultaId === consultaId && item.marcoId === marcoId)
  return registro?.status ?? 'not-evaluated'
}

function toggleGrupoMarcos(id: string) {
  const novo = new Set(gruposAbertos.value)
  if (novo.has(id)) novo.delete(id)
  else novo.add(id)
  gruposAbertos.value = novo
}

async function carregar() {
  await consultaStore.carregarCadernetaDigital()
}

watch(() => paciente.value?.id, () => carregar(), { immediate: true })
watch(() => abaAtiva.value, () => limparTooltipCaderneta())
onMounted(() => carregar())
</script>

<template>
  <div class="p-6 space-y-5 bg-slate-50 min-h-full">
    <div v-if="!paciente" class="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
      Selecione um paciente na fila para abrir a Caderneta Digital.
    </div>

    <template v-else>
      <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div class="flex items-center gap-2">
              <BookOpenIcon class="h-5 w-5 text-teal-700" />
              <h1 class="text-xl font-bold text-slate-900">Caderneta Digital</h1>
            </div>
            <p class="mt-2 text-sm text-slate-600">
              {{ paciente.nome }} — Prontuário: {{ obterProntuarioPrincipal(paciente) }} |
              Nascimento: {{ paciente.dataNascimento }} | Idade: {{ paciente.idade }}
            </p>
          </div>
          <span class="self-start rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800 md:self-center">
            Paciente selecionado
          </span>
        </div>
      </section>

      <div class="grid grid-cols-1 gap-2 rounded-xl bg-slate-100 p-1 md:grid-cols-5">
        <button
          v-for="metrica in metricas"
          :key="metrica.id"
          type="button"
          @click="abaAtiva = metrica.id"
          class="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          :class="abaAtiva === metrica.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:bg-white/70'"
        >
          {{ metrica.label }}
        </button>
      </div>

      <section v-if="abaAtiva !== 'marcos'" class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">{{ referenciaAtual?.titulo }}</h2>
            <p class="text-sm text-slate-500">{{ referenciaAtual?.observacao }}</p>
            <p class="mt-1 text-xs text-slate-400">{{ referenciaAtual?.fonte }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              @click="zoomAutomatico = !zoomAutomatico; limparTooltipCaderneta()"
              class="rounded-lg border border-teal-200 px-3 py-2 text-xs font-medium text-teal-700 hover:bg-teal-50"
            >
              {{ zoomAutomatico ? 'Ver curva completa' : 'Aplicar zoom no histórico' }}
            </button>
            <button
              type="button"
              @click="carregar"
              class="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Atualizar histórico
            </button>
          </div>
        </div>

        <div v-if="consultaStore.carregandoCaderneta" class="mt-8 rounded-lg border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          Carregando dados históricos...
        </div>

        <div v-else-if="pontosPaciente.length === 0" class="mt-8 rounded-lg border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          {{ mensagemSemPontos }}
        </div>

        <div v-else class="mt-6 overflow-x-auto">
          <div class="mb-3 flex flex-col gap-2 rounded-lg border border-teal-100 bg-teal-50 px-3 py-2 text-xs text-teal-800 md:flex-row md:items-center md:justify-between">
            <span class="font-medium">{{ periodoVisualizado }}</span>
            <span>
              {{ zoomAutomatico
                ? 'A visualização abre focada nas idades em que há medidas do paciente.'
                : 'A visualização mostra a curva completa de referência.' }}
            </span>
          </div>
          <svg :viewBox="`0 0 ${chart.width} ${chart.height}`" class="min-w-[900px] w-full rounded-lg bg-white">
            <g>
              <line
                v-for="tick in chart.yTicks"
                :key="`y-${tick}`"
                :x1="chart.padding.left"
                :x2="chart.width - chart.padding.right"
                :y1="chart.y(tick)"
                :y2="chart.y(tick)"
                stroke="#e2e8f0"
                stroke-dasharray="4 4"
              />
              <line
                v-for="tick in chart.xTicks"
                :key="`x-${tick}`"
                :x1="chart.x(tick)"
                :x2="chart.x(tick)"
                :y1="chart.padding.top"
                :y2="chart.height - chart.padding.bottom"
                stroke="#e2e8f0"
                stroke-dasharray="4 4"
              />
            </g>

            <g fill="#475569" font-size="11">
              <text
                v-for="tick in chart.yTicks"
                :key="`yl-${tick}`"
                :x="chart.padding.left - 8"
                :y="chart.y(tick) + 4"
                text-anchor="end"
              >{{ tick }}</text>
              <text
                v-for="tick in chart.xTicks"
                :key="`xl-${tick}`"
                :x="chart.x(tick)"
                :y="chart.height - 15"
                text-anchor="middle"
              >{{ xLabel(tick) }}</text>
            </g>

            <text :x="18" :y="chart.height / 2" transform="rotate(-90, 18, 180)" fill="#475569" font-size="12">
              {{ referenciaAtual?.unidade }}
            </text>

            <path :d="chart.path('z3')" fill="none" stroke="#ef4444" stroke-width="1" stroke-dasharray="5 5" opacity="0.7" />
            <path :d="chart.path('z2')" fill="none" stroke="#f97316" stroke-width="1" opacity="0.75" />
            <path :d="chart.path('z1')" fill="none" stroke="#16a34a" stroke-width="1" opacity="0.75" />
            <path :d="chart.path('z0')" fill="none" stroke="#0f172a" stroke-width="2" opacity="0.75" />
            <path :d="chart.path('zNeg1')" fill="none" stroke="#16a34a" stroke-width="1" opacity="0.75" />
            <path :d="chart.path('zNeg2')" fill="none" stroke="#f97316" stroke-width="1" opacity="0.75" />
            <path :d="chart.path('zNeg3')" fill="none" stroke="#ef4444" stroke-width="1" stroke-dasharray="5 5" opacity="0.7" />

            <path :d="chart.patientPath()" fill="none" stroke="#0f766e" stroke-width="3" />
            <g v-for="ponto in pontosPaciente" :key="ponto.id">
              <circle :cx="chart.x(ponto.idadeMeses)" :cy="chart.y(ponto.valor)" r="5" fill="#0f766e" />
              <title>{{ ponto.dataLabel }} — {{ ponto.valor }} {{ referenciaAtual?.unidade }} — {{ ponto.origem }}</title>
            </g>

            <g v-if="tooltipInfo" pointer-events="none">
              <line
                :x1="chart.x(tooltipInfo.idadeMeses)"
                :x2="chart.x(tooltipInfo.idadeMeses)"
                :y1="chart.padding.top"
                :y2="chart.height - chart.padding.bottom"
                stroke="#0f766e"
                stroke-width="1.2"
                stroke-dasharray="4 4"
                opacity="0.75"
              />
              <circle
                v-for="ref in tooltipInfo.referencias"
                :key="`tooltip-ref-${ref.chave}`"
                :cx="chart.x(tooltipInfo.idadeMeses)"
                :cy="chart.y(ref.valor)"
                r="2.4"
                fill="#ffffff"
                stroke="#334155"
                stroke-width="1"
                opacity="0.9"
              />
            </g>

            <g v-if="tooltipInfo && tooltipBox" pointer-events="none">
              <rect
                :x="tooltipBox.x"
                :y="tooltipBox.y"
                :width="tooltipBox.largura"
                :height="tooltipBox.altura"
                rx="8"
                fill="#ffffff"
                stroke="#cbd5e1"
                stroke-width="1"
                opacity="0.98"
              />
              <text :x="tooltipBox.x + 12" :y="tooltipBox.y + 20" fill="#0f172a" font-size="12">
                <tspan :x="tooltipBox.x + 12" font-weight="700">Idade no eixo X: {{ tooltipInfo.idadeLabel }}</tspan>
                <tspan :x="tooltipBox.x + 12" dy="16" fill="#475569">{{ formatarNumero(tooltipInfo.idadeMeses, 1) }} meses</tspan>
                <tspan :x="tooltipBox.x + 12" dy="18" font-weight="700" fill="#334155">Curvas de referência</tspan>
                <tspan
                  v-for="ref in tooltipInfo.referencias"
                  :key="`tooltip-text-${ref.chave}`"
                  :x="tooltipBox.x + 12"
                  dy="15"
                  fill="#475569"
                >
                  {{ ref.label }}: {{ formatarNumero(ref.valor, 1) }} {{ referenciaAtual?.unidade }}
                </tspan>
                <tspan :x="tooltipBox.x + 12" dy="18" font-weight="700" fill="#0f766e">Paciente</tspan>
                <template v-if="tooltipInfo.paciente">
                  <tspan :x="tooltipBox.x + 12" dy="15" fill="#0f766e">
                    {{ formatarNumero(tooltipInfo.paciente.valor, 1) }} {{ referenciaAtual?.unidade }} — {{ tooltipInfo.paciente.idadeLabel }}
                  </tspan>
                  <tspan :x="tooltipBox.x + 12" dy="15" fill="#64748b">
                    {{ tooltipInfo.paciente.dataLabel }} | {{ tooltipInfo.paciente.origem }}
                  </tspan>
                  <tspan :x="tooltipBox.x + 12" dy="15" fill="#64748b">
                    {{ tooltipInfo.paciente.deltaLabel }}
                  </tspan>
                </template>
                <tspan v-else :x="tooltipBox.x + 12" dy="15" fill="#64748b">Sem ponto do paciente nesta curva.</tspan>
              </text>
            </g>

            <rect
              :x="chart.padding.left"
              :y="chart.padding.top"
              :width="chart.plotWidth"
              :height="chart.plotHeight"
              fill="transparent"
              class="cursor-crosshair"
              @mousemove="atualizarTooltipCaderneta"
              @mouseleave="limparTooltipCaderneta"
            />
          </svg>

          <p class="mt-2 text-xs text-slate-500">
            Passe o mouse sobre a área do gráfico para ver a idade no eixo X, o ponto do paciente e os valores das sete curvas de referência naquele ponto. Use “Ver curva completa” para retirar o zoom temporal.
          </p>

          <div class="mt-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div class="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
              <span class="inline-flex items-center gap-1"><span class="h-0.5 w-5 border-t border-dashed border-red-500"></span>+3 / -3</span>
              <span class="inline-flex items-center gap-1"><span class="h-0.5 w-5 bg-orange-500"></span>+2 / -2</span>
              <span class="inline-flex items-center gap-1"><span class="h-0.5 w-5 bg-green-600"></span>+1 / -1</span>
              <span class="inline-flex items-center gap-1"><span class="h-1 w-5 bg-slate-900"></span>Mediana</span>
              <span class="inline-flex items-center gap-1"><span class="h-3 w-3 rounded-full bg-teal-700"></span>Paciente</span>
            </div>
            <div class="text-xs text-slate-500 md:text-right">
              <p v-if="ultimoPonto" class="font-medium text-slate-700">
                Último ponto: {{ ultimoPonto.valor }} {{ referenciaAtual?.unidade }} aos {{ formatarIdadeDetalhada(ultimoPonto.idadeMeses) }}.
              </p>
              <p>{{ classificacaoAtual }}</p>
            </div>
          </div>

          <div class="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-800">
            {{ classificacaoAtual || 'Curva carregada para acompanhamento longitudinal.' }}
          </div>
        </div>
      </section>

      <section v-else class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">Marcos do Desenvolvimento</h2>
            <p class="text-sm text-slate-500">
              Histórico das avaliações registradas na seção Marcos do Desenvolvimento das consultas.
            </p>
          </div>
          <button
            type="button"
            @click="carregar"
            class="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Atualizar histórico
          </button>
        </div>

        <div v-if="consultaStore.carregandoCaderneta" class="mt-8 rounded-lg border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          Carregando histórico de marcos...
        </div>

        <div v-else-if="datasMarcos.length === 0" class="mt-8 rounded-lg border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          Nenhum marco do desenvolvimento foi salvo para este paciente ainda.
          <br />Preencha e salve a seção “Marcos do Desenvolvimento” em uma consulta para alimentar esta caderneta.
        </div>

        <div v-else class="mt-5 space-y-2">
          <div
            v-for="grupo in gruposMarcos"
            :key="grupo.id"
            class="overflow-hidden rounded-lg border border-slate-200"
          >
            <button
              type="button"
              @click="toggleGrupoMarcos(grupo.id)"
              class="flex w-full items-center justify-between bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-800 hover:bg-slate-100"
            >
              <span>{{ grupo.label }}</span>
              <ChevronDownIcon class="h-4 w-4 transition-transform" :class="gruposAbertos.has(grupo.id) ? 'rotate-180' : ''" />
            </button>

            <div v-if="gruposAbertos.has(grupo.id)" class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-t border-slate-200 bg-white">
                    <th class="min-w-[220px] p-3 text-left font-medium text-slate-700">Marco</th>
                    <th class="min-w-[320px] p-3 text-left font-medium text-slate-500">Como pesquisar</th>
                    <th
                      v-for="data in datasMarcos"
                      :key="data.consultaId"
                      class="min-w-[95px] p-3 text-center font-medium text-slate-700"
                    >
                      {{ data.label }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="marco in grupo.marcos" :key="marco.id" class="border-t border-slate-100">
                    <td class="p-3 font-medium text-slate-800">{{ marco.nome }}</td>
                    <td class="p-3 text-xs leading-relaxed text-slate-500">{{ marco.instrucao }}</td>
                    <td
                      v-for="data in datasMarcos"
                      :key="`${marco.id}-${data.consultaId}`"
                      class="p-3 text-center text-lg font-bold"
                      :class="statusClasse(statusMarco(marco.id, data.consultaId) as StatusMarco)"
                    >
                      {{ statusIcone(statusMarco(marco.id, data.consultaId) as StatusMarco) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-5 border-t border-slate-100 pt-4 text-xs text-slate-500">
            <span class="inline-flex items-center gap-1"><CheckIcon class="h-4 w-4 text-green-600" /> Confirmado</span>
            <span class="inline-flex items-center gap-1"><MinusIcon class="h-4 w-4 text-slate-400" /> Não avaliado</span>
            <span class="inline-flex items-center gap-1"><XMarkIcon class="h-4 w-4 text-red-600" /> Não atingido</span>
            <span class="inline-flex items-center gap-1"><ExclamationTriangleIcon class="h-4 w-4 text-amber-600" /> Avaliar evolução longitudinal</span>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
