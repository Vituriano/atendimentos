export type SexoReferencia = 'M' | 'F'
export type MetricaCrescimento = 'peso' | 'estatura' | 'pc' | 'imc'

export interface LinhaReferenciaCrescimento {
  idadeMeses: number
  zNeg3: number
  zNeg2: number
  zNeg1: number
  z0: number
  z1: number
  z2: number
  z3: number
}

export interface SerieReferenciaCrescimento {
  metrica: MetricaCrescimento
  titulo: string
  unidade: string
  eixoY: [number, number]
  fonte: string
  observacao: string
  masculino: LinhaReferenciaCrescimento[]
  feminino: LinhaReferenciaCrescimento[]
}

const mesesBase = [0, 3, 6, 9, 12, 18, 24, 36, 48, 60]

function montarSerie(
  z0: number[],
  passoInferior: number[],
  passoSuperior: number[],
): LinhaReferenciaCrescimento[] {
  return mesesBase.map((idadeMeses, index) => {
    const mediana = z0[index]
    const baixo = passoInferior[index]
    const alto = passoSuperior[index]
    return {
      idadeMeses,
      zNeg3: Number((mediana - baixo * 3).toFixed(1)),
      zNeg2: Number((mediana - baixo * 2).toFixed(1)),
      zNeg1: Number((mediana - baixo).toFixed(1)),
      z0: Number(mediana.toFixed(1)),
      z1: Number((mediana + alto).toFixed(1)),
      z2: Number((mediana + alto * 2).toFixed(1)),
      z3: Number((mediana + alto * 3).toFixed(1)),
    }
  })
}

// Tabelas operacionais iniciais para visualização e teste da caderneta.
// Devem ser substituídas pelas tabelas clínicas oficiais validadas pela equipe assistencial
// quando forem importados os arquivos de referência definitivos do projeto.
const referencias: Record<MetricaCrescimento, SerieReferenciaCrescimento> = {
  peso: {
    metrica: 'peso',
    titulo: 'Curva de Peso por Idade',
    unidade: 'kg',
    eixoY: [0, 28],
    fonte: 'Referência clínica parametrizável: OMS 0–5 anos / INTERGROWTH-21st para contexto neonatal.',
    observacao: 'Curva de apoio para acompanhamento longitudinal. Não substitui interpretação clínica por percentil/escore-z validado.',
    feminino: montarSerie(
      [3.2, 5.8, 7.3, 8.2, 8.9, 10.2, 11.5, 13.9, 16.1, 18.2],
      [0.45, 0.75, 0.85, 0.95, 1.05, 1.15, 1.30, 1.65, 2.05, 2.45],
      [0.55, 0.90, 1.05, 1.20, 1.35, 1.60, 1.90, 2.55, 3.25, 4.05],
    ),
    masculino: montarSerie(
      [3.3, 6.4, 7.9, 8.9, 9.6, 10.9, 12.2, 14.3, 16.3, 18.3],
      [0.45, 0.80, 0.90, 1.00, 1.10, 1.25, 1.45, 1.85, 2.20, 2.60],
      [0.60, 1.00, 1.20, 1.35, 1.50, 1.75, 2.10, 2.75, 3.45, 4.25],
    ),
  },
  estatura: {
    metrica: 'estatura',
    titulo: 'Curva de Comprimento/Altura/Estatura por Idade',
    unidade: 'cm',
    eixoY: [40, 125],
    fonte: 'Referência clínica parametrizável: OMS 0–5 anos / INTERGROWTH-21st para contexto neonatal.',
    observacao: 'Até 2 anos, usualmente comprimento deitado; depois, altura/estatura em pé.',
    feminino: montarSerie(
      [49.1, 58.5, 64.0, 68.5, 72.0, 77.5, 82.5, 90.5, 97.5, 104.0],
      [1.85, 2.00, 2.00, 2.00, 2.00, 2.00, 2.00, 2.50, 3.00, 3.50],
      [1.90, 2.10, 2.35, 2.35, 2.40, 2.50, 2.55, 3.00, 3.50, 4.00],
    ),
    masculino: montarSerie(
      [49.9, 61.4, 67.6, 72.0, 75.7, 82.3, 87.1, 96.1, 103.3, 110.0],
      [1.90, 2.20, 2.35, 2.40, 2.50, 2.60, 2.70, 3.00, 3.45, 3.90],
      [1.95, 2.30, 2.55, 2.60, 2.70, 2.80, 2.95, 3.30, 3.75, 4.20],
    ),
  },
  pc: {
    metrica: 'pc',
    titulo: 'Curva de Perímetro Cefálico por Idade',
    unidade: 'cm',
    eixoY: [30, 56],
    fonte: 'Referência clínica parametrizável: OMS 0–5 anos / INTERGROWTH-21st para contexto neonatal.',
    observacao: 'Perímetro cefálico com maior utilidade clínica nos primeiros anos de vida.',
    feminino: montarSerie(
      [34.0, 39.5, 42.2, 43.8, 45.0, 46.2, 47.2, 48.5, 49.5, 50.2],
      [1.20, 1.10, 1.05, 1.00, 1.00, 0.95, 0.95, 0.90, 0.85, 0.85],
      [1.20, 1.10, 1.05, 1.00, 1.00, 0.95, 0.95, 0.90, 0.85, 0.85],
    ),
    masculino: montarSerie(
      [34.5, 40.5, 43.3, 45.0, 46.1, 47.4, 48.3, 49.6, 50.5, 51.1],
      [1.20, 1.10, 1.05, 1.00, 1.00, 0.95, 0.95, 0.90, 0.85, 0.85],
      [1.20, 1.10, 1.05, 1.00, 1.00, 0.95, 0.95, 0.90, 0.85, 0.85],
    ),
  },
  imc: {
    metrica: 'imc',
    titulo: 'Curva de IMC por Idade',
    unidade: 'kg/m²',
    eixoY: [9, 23],
    fonte: 'Referência clínica parametrizável: OMS 0–5 anos / INTERGROWTH-21st para contexto neonatal.',
    observacao: 'Classificação nutricional deve considerar idade, sexo, evolução longitudinal e contexto clínico.',
    feminino: montarSerie(
      [13.0, 15.8, 15.5, 15.2, 15.0, 14.8, 14.6, 14.3, 14.0, 14.0],
      [1.00, 1.50, 1.45, 1.40, 1.35, 1.30, 1.25, 1.20, 1.15, 1.15],
      [1.35, 1.60, 1.50, 1.45, 1.40, 1.35, 1.30, 1.25, 1.20, 1.20],
    ),
    masculino: montarSerie(
      [13.4, 16.0, 15.9, 15.7, 15.5, 15.2, 15.0, 14.8, 14.5, 14.4],
      [1.00, 1.45, 1.40, 1.35, 1.30, 1.25, 1.20, 1.15, 1.10, 1.10],
      [1.35, 1.65, 1.55, 1.50, 1.45, 1.40, 1.35, 1.30, 1.25, 1.25],
    ),
  },
}

export function obterReferenciaCrescimento(metrica: MetricaCrescimento, _sexo: SexoReferencia): SerieReferenciaCrescimento {
  return referencias[metrica]
}

export function obterSerieReferenciaPorSexo(metrica: MetricaCrescimento, sexo: SexoReferencia): LinhaReferenciaCrescimento[] {
  const referencia = referencias[metrica]
  return sexo === 'M' ? referencia.masculino : referencia.feminino
}

export function interpolarReferencia(metrica: MetricaCrescimento, sexo: SexoReferencia, idadeMeses: number, chave: keyof Omit<LinhaReferenciaCrescimento, 'idadeMeses'>): number | null {
  const serie = obterSerieReferenciaPorSexo(metrica, sexo)
  if (serie.length === 0) return null
  const ordenada = [...serie].sort((a, b) => a.idadeMeses - b.idadeMeses)
  if (idadeMeses <= ordenada[0].idadeMeses) return ordenada[0][chave]
  if (idadeMeses >= ordenada[ordenada.length - 1].idadeMeses) return ordenada[ordenada.length - 1][chave]

  for (let i = 0; i < ordenada.length - 1; i += 1) {
    const atual = ordenada[i]
    const proximo = ordenada[i + 1]
    if (idadeMeses >= atual.idadeMeses && idadeMeses <= proximo.idadeMeses) {
      const fator = (idadeMeses - atual.idadeMeses) / (proximo.idadeMeses - atual.idadeMeses)
      return Number((atual[chave] + (proximo[chave] - atual[chave]) * fator).toFixed(2))
    }
  }
  return null
}

export function classificarValorPorZ(metrica: MetricaCrescimento, sexo: SexoReferencia, idadeMeses: number, valor: number): string {
  const zNeg3 = interpolarReferencia(metrica, sexo, idadeMeses, 'zNeg3')
  const zNeg2 = interpolarReferencia(metrica, sexo, idadeMeses, 'zNeg2')
  const zNeg1 = interpolarReferencia(metrica, sexo, idadeMeses, 'zNeg1')
  const z1 = interpolarReferencia(metrica, sexo, idadeMeses, 'z1')
  const z2 = interpolarReferencia(metrica, sexo, idadeMeses, 'z2')
  const z3 = interpolarReferencia(metrica, sexo, idadeMeses, 'z3')

  if ([zNeg3, zNeg2, zNeg1, z1, z2, z3].some(v => v === null)) return 'Sem referência disponível para esta idade.'
  if (valor < zNeg3!) return 'Abaixo de -3 escore-z.'
  if (valor < zNeg2!) return 'Entre -3 e -2 escore-z.'
  if (valor < zNeg1!) return 'Entre -2 e -1 escore-z.'
  if (valor <= z1!) return metrica === 'imc' ? 'Eutrofia / faixa central esperada.' : 'Faixa central esperada.'
  if (valor <= z2!) return 'Entre +1 e +2 escore-z.'
  if (valor <= z3!) return 'Entre +2 e +3 escore-z.'
  return 'Acima de +3 escore-z.'
}
