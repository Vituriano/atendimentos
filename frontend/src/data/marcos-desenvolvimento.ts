import type { Marco } from '../types/clinica'

// ADR-004: marcos são definidos estaticamente em código como protocolo clínico versionado.
// Qualquer alteração exige instrução clínica explícita — não criar CRUD para esta lista.

export interface GrupoMarcos {
  id: string
  label: string
  minIdadeEmMeses: number
  maxIdadeEmMeses: number
  colunas: number[]
  marcos: Marco[]
}

export const gruposMarcos: GrupoMarcos[] = [
  {
    id: '0-3m',
    label: '0 a 3 meses',
    minIdadeEmMeses: 0,
    maxIdadeEmMeses: 3,
    colunas: [0, 1, 2, 3],
    marcos: [
      {
        id: 'm-0-3-1',
        nome: 'Fixa olhar no rosto',
        instrucao: 'Apresente seu rosto a ~30 cm. Observe se o bebê foca e segue com os olhos.',
        faixaEtariaMeses: [0, 2],
      },
      {
        id: 'm-0-3-2',
        nome: 'Reage a sons altos',
        instrucao: 'Produza um som abrupto fora do campo visual. Observe piscada, susto ou choro.',
        faixaEtariaMeses: [0, 2],
      },
      {
        id: 'm-0-3-3',
        nome: 'Sorriso social',
        instrucao: 'Converse suavemente com o bebê. O sorriso deve ocorrer em resposta à voz/face, não apenas ao gás.',
        faixaEtariaMeses: [1, 3],
      },
      {
        id: 'm-0-3-4',
        nome: 'Sustenta a cabeça brevemente (prono)',
        instrucao: 'Coloque o bebê de bruços. Observe se levanta a cabeça por alguns segundos.',
        faixaEtariaMeses: [1, 3],
      },
    ],
  },
  {
    id: '3-6m',
    label: '3 a 6 meses',
    minIdadeEmMeses: 3,
    maxIdadeEmMeses: 6,
    colunas: [3, 4, 5, 6],
    marcos: [
      {
        id: 'm-3-6-1',
        nome: 'Sustenta a cabeça firmemente',
        instrucao: 'Segure o bebê sentado apoiado. A cabeça deve permanecer estável sem vacilação.',
        faixaEtariaMeses: [3, 5],
      },
      {
        id: 'm-3-6-2',
        nome: 'Lalação (emite vogais e consoantes)',
        instrucao: 'Observe espontaneamente ou após estímulo vocal. Esperam-se sons como "aah", "ooh", "baba".',
        faixaEtariaMeses: [3, 6],
      },
      {
        id: 'm-3-6-3',
        nome: 'Alcança e tenta agarrar objetos',
        instrucao: 'Ofereça um chocalho colorido. Observe se o bebê estende o braço em direção ao objeto.',
        faixaEtariaMeses: [3, 6],
      },
      {
        id: 'm-3-6-4',
        nome: 'Reconhece o cuidador principal',
        instrucao: 'Observe reação diferenciada (sorriso, agitação) ao ver/ouvir o cuidador vs. estranhos.',
        faixaEtariaMeses: [3, 5],
      },
      {
        id: 'm-3-6-5',
        nome: 'Rola de supino para prono',
        instrucao: 'Observe ou pergunte ao cuidador. O bebê deve conseguir virar de costas para barriga.',
        faixaEtariaMeses: [4, 6],
      },
    ],
  },
  {
    id: '6-12m',
    label: '6 a 12 meses',
    minIdadeEmMeses: 6,
    maxIdadeEmMeses: 12,
    colunas: [6, 7, 8, 9, 10, 11, 12],
    marcos: [
      {
        id: 'm-6-12-1',
        nome: 'Senta sem apoio',
        instrucao: 'Sente o bebê sem apoio e observe equilíbrio por pelo menos 5 segundos.',
        faixaEtariaMeses: [6, 9],
      },
      {
        id: 'm-6-12-2',
        nome: 'Engatinha',
        instrucao: 'Pergunte ao cuidador ou coloque o bebê no chão. Observe deslocamento em 4 apoios.',
        faixaEtariaMeses: [7, 10],
      },
      {
        id: 'm-6-12-3',
        nome: 'Localiza fonte sonora',
        instrucao: 'Produza um som fora do campo visual. O bebê deve virar a cabeça na direção correta.',
        faixaEtariaMeses: [6, 9],
      },
      {
        id: 'm-6-12-4',
        nome: 'Bate palmas / dá tchauzinho',
        instrucao: 'Demonstre o gesto e peça para repetir, ou pergunte ao cuidador se faz espontaneamente.',
        faixaEtariaMeses: [8, 12],
      },
      {
        id: 'm-6-12-5',
        nome: 'Fala "mamá/papá" com significado',
        instrucao: 'Pergunte ao cuidador se usa "mamá" ou "papá" para chamar os pais especificamente.',
        faixaEtariaMeses: [9, 12],
      },
      {
        id: 'm-6-12-6',
        nome: 'Pinça (polegar e indicador)',
        instrucao: 'Ofereça um objeto pequeno. Observe se pega com polegar e indicador (pinça superior).',
        faixaEtariaMeses: [9, 12],
      },
      {
        id: 'm-6-12-7',
        nome: 'Fica em pé com apoio',
        instrucao: 'Observe se a criança se coloca de pé segurando em móvel ou nas mãos do examinador.',
        faixaEtariaMeses: [8, 12],
      },
    ],
  },
  {
    id: '1-2a',
    label: '1 a 2 anos',
    minIdadeEmMeses: 12,
    maxIdadeEmMeses: 24,
    colunas: [12, 15, 18, 21, 24],
    marcos: [
      {
        id: 'm-1-2-1',
        nome: 'Anda com independência',
        instrucao: 'Observe ou pergunte ao cuidador. Deve andar sem apoio por pelo menos alguns passos.',
        faixaEtariaMeses: [12, 18],
      },
      {
        id: 'm-1-2-2',
        nome: 'Aponta para objetos de interesse',
        instrucao: 'Observe se aponta com o dedo indicador para compartilhar interesse (atenção conjunta).',
        faixaEtariaMeses: [12, 15],
      },
      {
        id: 'm-1-2-3',
        nome: 'Faz torre de 2 cubos',
        instrucao: 'Ofereça cubos e demonstre. Observe se empilha pelo menos 2 cubos.',
        faixaEtariaMeses: [15, 18],
      },
      {
        id: 'm-1-2-4',
        nome: 'Vocabulário de 10 palavras simples',
        instrucao: 'Pergunte ao cuidador quantas palavras (além de mamá/papá) a criança usa com significado consistente.',
        faixaEtariaMeses: [15, 21],
      },
      {
        id: 'm-1-2-5',
        nome: 'Alimenta-se com colher',
        instrucao: 'Pergunte ao cuidador. A criança deve levar a colher à boca, mesmo com algum derramamento.',
        faixaEtariaMeses: [15, 21],
      },
      {
        id: 'm-1-2-6',
        nome: 'Combina 2 palavras em frases',
        instrucao: 'Pergunte exemplos ao cuidador (ex: "mamá água", "mais bolo"). Deve ocorrer espontaneamente.',
        faixaEtariaMeses: [18, 24],
      },
      {
        id: 'm-1-2-7',
        nome: 'Jogo simbólico (faz-de-conta)',
        instrucao: 'Ofereça um telefone de brinquedo ou boneca. Observe se simula ações (falar ao telefone, alimentar a boneca).',
        faixaEtariaMeses: [18, 24],
      },
    ],
  },
  {
    id: '3-5a',
    label: '3 anos e meio a 5 anos',
    minIdadeEmMeses: 42,
    maxIdadeEmMeses: 60,
    colunas: [42, 44, 46, 48, 50, 52, 54, 56, 58, 60],
    marcos: [
      {
        id: 'm-3-5-1',
        nome: 'Corre e pula com os dois pés',
        instrucao: 'Observe diretamente ou pergunte ao cuidador. Deve saltar com ambos os pés simultaneamente.',
        faixaEtariaMeses: [42, 48],
      },
      {
        id: 'm-3-5-2',
        nome: 'Usa frases completas (4+ palavras)',
        instrucao: 'Converse com a criança. As frases devem ser compreensíveis por estranhos na maior parte do tempo.',
        faixaEtariaMeses: [42, 48],
      },
      {
        id: 'm-3-5-3',
        nome: 'Copia círculo',
        instrucao: 'Desenhe um círculo e peça para copiar. Não precisa ser perfeito, apenas forma fechada.',
        faixaEtariaMeses: [42, 48],
      },
      {
        id: 'm-3-5-4',
        nome: 'Pula em um pé só',
        instrucao: 'Peça para a criança pular em um pé. Deve conseguir pelo menos 2 pulos consecutivos.',
        faixaEtariaMeses: [48, 60],
      },
      {
        id: 'm-3-5-5',
        nome: 'Copia quadrado',
        instrucao: 'Desenhe um quadrado e peça para copiar. Esperado a partir dos 4 anos e meio.',
        faixaEtariaMeses: [54, 60],
      },
      {
        id: 'm-3-5-6',
        nome: 'Brinca cooperativamente com pares',
        instrucao: 'Pergunte ao cuidador. Deve compartilhar, negociar e jogar com regras simples com outras crianças.',
        faixaEtariaMeses: [48, 60],
      },
      {
        id: 'm-3-5-7',
        nome: 'Se veste com pouca ajuda',
        instrucao: 'Pergunte ao cuidador. Deve vestir roupas simples, podendo precisar de ajuda com botões/zíper.',
        faixaEtariaMeses: [48, 60],
      },
      {
        id: 'm-3-5-8',
        nome: 'Conta 5 objetos',
        instrucao: 'Coloque 5 objetos e peça para contar. A correspondência um-a-um (apontar enquanto conta) é o esperado.',
        faixaEtariaMeses: [54, 60],
      },
    ],
  },
]

export function getGrupoAtivo(idadeEmMeses: number): GrupoMarcos {
  const reversed = [...gruposMarcos].reverse()
  return reversed.find(g => idadeEmMeses >= g.minIdadeEmMeses) ?? gruposMarcos[0]
}
