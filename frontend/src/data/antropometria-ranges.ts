export type SexoAntropometria = 'M' | 'F'

export type ClassificacaoImc = 'abaixo' | 'normal' | 'sobrepeso'

export interface RangeNumerico {
  min: number
  max: number
}

export interface AntropometriaFaixaReferencia {
  idadeEmMeses: number
  pesoKg: RangeNumerico
  alturaCm: RangeNumerico
  perimetroCefalicoCm: RangeNumerico | null
  imcNormal: RangeNumerico
}

export interface AntropometriaRangePaciente {
  idadeEmMeses: number
  sexo: SexoAntropometria
  pesoKg: RangeNumerico
  alturaCm: RangeNumerico
  perimetroCefalicoCm: RangeNumerico | null
  pressaoSistolicaMmHg: RangeNumerico
  pressaoDiastolicaMmHg: RangeNumerico
  imcNormal: RangeNumerico
  observacao: string
}

const referenciasPorSexo: Record<SexoAntropometria, AntropometriaFaixaReferencia[]> = {
  F: [
    { idadeEmMeses: 0, pesoKg: { min: 2.4, max: 4.6 }, alturaCm: { min: 45, max: 54 }, perimetroCefalicoCm: { min: 32, max: 37 }, imcNormal: { min: 11.5, max: 16.9 } },
    { idadeEmMeses: 1, pesoKg: { min: 3.2, max: 5.8 }, alturaCm: { min: 49, max: 58 }, perimetroCefalicoCm: { min: 34, max: 39 }, imcNormal: { min: 12.6, max: 18.5 } },
    { idadeEmMeses: 3, pesoKg: { min: 4.5, max: 7.8 }, alturaCm: { min: 56, max: 66 }, perimetroCefalicoCm: { min: 38, max: 43 }, imcNormal: { min: 13.8, max: 19.8 } },
    { idadeEmMeses: 6, pesoKg: { min: 5.8, max: 10.0 }, alturaCm: { min: 62, max: 72 }, perimetroCefalicoCm: { min: 40, max: 45 }, imcNormal: { min: 14.1, max: 20.8 } },
    { idadeEmMeses: 9, pesoKg: { min: 6.5, max: 11.3 }, alturaCm: { min: 66, max: 77 }, perimetroCefalicoCm: { min: 42, max: 47 }, imcNormal: { min: 14.0, max: 20.5 } },
    { idadeEmMeses: 12, pesoKg: { min: 7.0, max: 12.2 }, alturaCm: { min: 69, max: 81 }, perimetroCefalicoCm: { min: 43, max: 48 }, imcNormal: { min: 13.9, max: 20.0 } },
    { idadeEmMeses: 18, pesoKg: { min: 8.1, max: 14.0 }, alturaCm: { min: 74, max: 88 }, perimetroCefalicoCm: { min: 44, max: 50 }, imcNormal: { min: 13.9, max: 19.2 } },
    { idadeEmMeses: 24, pesoKg: { min: 9.0, max: 15.5 }, alturaCm: { min: 79, max: 94 }, perimetroCefalicoCm: { min: 45, max: 51 }, imcNormal: { min: 13.8, max: 18.8 } },
    { idadeEmMeses: 30, pesoKg: { min: 9.7, max: 17.1 }, alturaCm: { min: 82, max: 99 }, perimetroCefalicoCm: { min: 45, max: 52 }, imcNormal: { min: 13.6, max: 18.3 } },
    { idadeEmMeses: 36, pesoKg: { min: 10.5, max: 18.8 }, alturaCm: { min: 86, max: 103 }, perimetroCefalicoCm: { min: 46, max: 53 }, imcNormal: { min: 13.4, max: 17.9 } },
    { idadeEmMeses: 48, pesoKg: { min: 12.0, max: 22.0 }, alturaCm: { min: 93, max: 112 }, perimetroCefalicoCm: { min: 47, max: 54 }, imcNormal: { min: 13.1, max: 17.5 } },
    { idadeEmMeses: 60, pesoKg: { min: 13.5, max: 27.0 }, alturaCm: { min: 99, max: 120 }, perimetroCefalicoCm: null, imcNormal: { min: 12.9, max: 17.4 } },
    { idadeEmMeses: 72, pesoKg: { min: 15.0, max: 31.0 }, alturaCm: { min: 105, max: 128 }, perimetroCefalicoCm: null, imcNormal: { min: 12.9, max: 17.8 } },
    { idadeEmMeses: 84, pesoKg: { min: 16.5, max: 36.0 }, alturaCm: { min: 110, max: 135 }, perimetroCefalicoCm: null, imcNormal: { min: 13.0, max: 18.6 } },
    { idadeEmMeses: 96, pesoKg: { min: 18.0, max: 42.0 }, alturaCm: { min: 115, max: 142 }, perimetroCefalicoCm: null, imcNormal: { min: 13.1, max: 19.8 } },
    { idadeEmMeses: 108, pesoKg: { min: 20.0, max: 49.0 }, alturaCm: { min: 120, max: 149 }, perimetroCefalicoCm: null, imcNormal: { min: 13.4, max: 21.2 } },
    { idadeEmMeses: 120, pesoKg: { min: 23.0, max: 58.0 }, alturaCm: { min: 125, max: 157 }, perimetroCefalicoCm: null, imcNormal: { min: 13.8, max: 22.6 } },
    { idadeEmMeses: 144, pesoKg: { min: 30.0, max: 78.0 }, alturaCm: { min: 137, max: 171 }, perimetroCefalicoCm: null, imcNormal: { min: 15.0, max: 25.0 } },
    { idadeEmMeses: 180, pesoKg: { min: 41.0, max: 105.0 }, alturaCm: { min: 149, max: 181 }, perimetroCefalicoCm: null, imcNormal: { min: 17.0, max: 27.0 } },
  ],
  M: [
    { idadeEmMeses: 0, pesoKg: { min: 2.5, max: 4.8 }, alturaCm: { min: 46, max: 55 }, perimetroCefalicoCm: { min: 33, max: 38 }, imcNormal: { min: 11.8, max: 17.3 } },
    { idadeEmMeses: 1, pesoKg: { min: 3.4, max: 6.1 }, alturaCm: { min: 50, max: 59 }, perimetroCefalicoCm: { min: 35, max: 40 }, imcNormal: { min: 12.9, max: 18.9 } },
    { idadeEmMeses: 3, pesoKg: { min: 5.0, max: 8.4 }, alturaCm: { min: 57, max: 67 }, perimetroCefalicoCm: { min: 39, max: 44 }, imcNormal: { min: 14.1, max: 20.2 } },
    { idadeEmMeses: 6, pesoKg: { min: 6.4, max: 10.8 }, alturaCm: { min: 63, max: 74 }, perimetroCefalicoCm: { min: 41, max: 46 }, imcNormal: { min: 14.4, max: 21.0 } },
    { idadeEmMeses: 9, pesoKg: { min: 7.1, max: 12.0 }, alturaCm: { min: 67, max: 79 }, perimetroCefalicoCm: { min: 43, max: 48 }, imcNormal: { min: 14.3, max: 20.7 } },
    { idadeEmMeses: 12, pesoKg: { min: 7.7, max: 12.9 }, alturaCm: { min: 71, max: 83 }, perimetroCefalicoCm: { min: 44, max: 49 }, imcNormal: { min: 14.1, max: 20.2 } },
    { idadeEmMeses: 18, pesoKg: { min: 8.8, max: 14.8 }, alturaCm: { min: 76, max: 90 }, perimetroCefalicoCm: { min: 45, max: 51 }, imcNormal: { min: 14.0, max: 19.5 } },
    { idadeEmMeses: 24, pesoKg: { min: 9.7, max: 16.5 }, alturaCm: { min: 81, max: 96 }, perimetroCefalicoCm: { min: 46, max: 52 }, imcNormal: { min: 13.9, max: 19.1 } },
    { idadeEmMeses: 30, pesoKg: { min: 10.5, max: 18.0 }, alturaCm: { min: 84, max: 101 }, perimetroCefalicoCm: { min: 47, max: 53 }, imcNormal: { min: 13.7, max: 18.7 } },
    { idadeEmMeses: 36, pesoKg: { min: 11.3, max: 19.5 }, alturaCm: { min: 88, max: 105 }, perimetroCefalicoCm: { min: 47, max: 53 }, imcNormal: { min: 13.5, max: 18.3 } },
    { idadeEmMeses: 48, pesoKg: { min: 12.7, max: 23.0 }, alturaCm: { min: 94, max: 113 }, perimetroCefalicoCm: { min: 48, max: 54 }, imcNormal: { min: 13.2, max: 17.9 } },
    { idadeEmMeses: 60, pesoKg: { min: 14.0, max: 27.5 }, alturaCm: { min: 100, max: 121 }, perimetroCefalicoCm: null, imcNormal: { min: 13.0, max: 17.8 } },
    { idadeEmMeses: 72, pesoKg: { min: 15.5, max: 32.0 }, alturaCm: { min: 106, max: 129 }, perimetroCefalicoCm: null, imcNormal: { min: 13.0, max: 18.2 } },
    { idadeEmMeses: 84, pesoKg: { min: 17.0, max: 37.0 }, alturaCm: { min: 111, max: 136 }, perimetroCefalicoCm: null, imcNormal: { min: 13.1, max: 19.0 } },
    { idadeEmMeses: 96, pesoKg: { min: 18.5, max: 43.0 }, alturaCm: { min: 116, max: 143 }, perimetroCefalicoCm: null, imcNormal: { min: 13.2, max: 20.1 } },
    { idadeEmMeses: 108, pesoKg: { min: 20.5, max: 50.0 }, alturaCm: { min: 121, max: 150 }, perimetroCefalicoCm: null, imcNormal: { min: 13.5, max: 21.4 } },
    { idadeEmMeses: 120, pesoKg: { min: 23.0, max: 58.0 }, alturaCm: { min: 126, max: 157 }, perimetroCefalicoCm: null, imcNormal: { min: 14.0, max: 22.7 } },
    { idadeEmMeses: 144, pesoKg: { min: 29.0, max: 78.0 }, alturaCm: { min: 137, max: 172 }, perimetroCefalicoCm: null, imcNormal: { min: 15.0, max: 25.2 } },
    { idadeEmMeses: 180, pesoKg: { min: 43.0, max: 115.0 }, alturaCm: { min: 154, max: 190 }, perimetroCefalicoCm: null, imcNormal: { min: 17.0, max: 27.5 } },
  ],
}

function round(value: number, decimals = 1): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

function interpolar(min: number, max: number, fator: number): number {
  return min + (max - min) * fator
}

function interpolarRange(a: RangeNumerico, b: RangeNumerico, fator: number): RangeNumerico {
  return {
    min: round(interpolar(a.min, b.min, fator)),
    max: round(interpolar(a.max, b.max, fator)),
  }
}

function interpolarRangeOpcional(
  a: RangeNumerico | null,
  b: RangeNumerico | null,
  fator: number,
): RangeNumerico | null {
  if (!a || !b) return a ?? b
  return interpolarRange(a, b, fator)
}

function encontrarReferencia(sexo: SexoAntropometria, idadeEmMeses: number): AntropometriaFaixaReferencia {
  const tabela = referenciasPorSexo[sexo]
  if (idadeEmMeses <= tabela[0].idadeEmMeses) return tabela[0]
  if (idadeEmMeses >= tabela[tabela.length - 1].idadeEmMeses) return tabela[tabela.length - 1]

  const superiorIndex = tabela.findIndex(item => item.idadeEmMeses >= idadeEmMeses)
  const superior = tabela[superiorIndex]
  const inferior = tabela[superiorIndex - 1]

  if (superior.idadeEmMeses === idadeEmMeses) return superior

  const fator = (idadeEmMeses - inferior.idadeEmMeses) / (superior.idadeEmMeses - inferior.idadeEmMeses)
  return {
    idadeEmMeses,
    pesoKg: interpolarRange(inferior.pesoKg, superior.pesoKg, fator),
    alturaCm: interpolarRange(inferior.alturaCm, superior.alturaCm, fator),
    perimetroCefalicoCm: interpolarRangeOpcional(inferior.perimetroCefalicoCm, superior.perimetroCefalicoCm, fator),
    imcNormal: interpolarRange(inferior.imcNormal, superior.imcNormal, fator),
  }
}

function getRangePressao(idadeEmMeses: number, sexo: SexoAntropometria): Pick<AntropometriaRangePaciente, 'pressaoSistolicaMmHg' | 'pressaoDiastolicaMmHg'> {
  const ajusteSexo = sexo === 'M' && idadeEmMeses >= 120 ? 2 : 0

  if (idadeEmMeses < 1) {
    return { pressaoSistolicaMmHg: { min: 50, max: 90 }, pressaoDiastolicaMmHg: { min: 30, max: 60 } }
  }
  if (idadeEmMeses < 12) {
    return { pressaoSistolicaMmHg: { min: 65, max: 105 }, pressaoDiastolicaMmHg: { min: 35, max: 70 } }
  }
  if (idadeEmMeses < 36) {
    return { pressaoSistolicaMmHg: { min: 75, max: 115 }, pressaoDiastolicaMmHg: { min: 40, max: 75 } }
  }
  if (idadeEmMeses < 72) {
    return { pressaoSistolicaMmHg: { min: 80, max: 120 }, pressaoDiastolicaMmHg: { min: 45, max: 80 } }
  }
  if (idadeEmMeses < 144) {
    return { pressaoSistolicaMmHg: { min: 85, max: 130 + ajusteSexo }, pressaoDiastolicaMmHg: { min: 50, max: 85 } }
  }
  return { pressaoSistolicaMmHg: { min: 90, max: 140 + ajusteSexo }, pressaoDiastolicaMmHg: { min: 55, max: 90 } }
}

export function getAntropometriaRangePaciente(idadeEmMeses: number, sexoInformado?: string | null): AntropometriaRangePaciente {
  const sexo: SexoAntropometria = sexoInformado === 'M' ? 'M' : 'F'
  const referencia = encontrarReferencia(sexo, Math.max(0, idadeEmMeses))
  const pressao = getRangePressao(Math.max(0, idadeEmMeses), sexo)

  return {
    idadeEmMeses: referencia.idadeEmMeses,
    sexo,
    pesoKg: referencia.pesoKg,
    alturaCm: referencia.alturaCm,
    perimetroCefalicoCm: referencia.perimetroCefalicoCm,
    ...pressao,
    imcNormal: referencia.imcNormal,
    observacao: 'Faixa de aviso para reduzir erro de digitação. A interpretação clínica deve usar as curvas oficiais por idade, sexo e estatura.',
  }
}

export function classificarImcPorIdade(imc: number, range: AntropometriaRangePaciente): ClassificacaoImc {
  if (imc < range.imcNormal.min) return 'abaixo'
  if (imc > range.imcNormal.max) return 'sobrepeso'
  return 'normal'
}
