import type { Marco } from '../types/clinica'

// ADR-004: marcos são definidos estaticamente em código como protocolo clínico versionado.
// Fonte de verdade: Caderneta da Criança (MS). Alterações exigem instrução clínica explícita.

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
    id: '0-6m',
    label: 'Nascimento aos 6 meses',
    minIdadeEmMeses: 0,
    maxIdadeEmMeses: 6,
    colunas: [0, 1, 2, 3, 4, 5, 6],
    marcos: [
      {
        id: 'n0-1',
        nome: 'Postura: pernas e braços fletidos, cabeça lateralizada',
        instrucao: 'Deite a criança em superfície plana, de costas, com a barriga para cima; observe se seus braços e pernas ficam flexionados e sua cabeça lateralizada.',
        faixaEtariaMeses: [0, 6],
      },
      {
        id: 'n0-2',
        nome: 'Observa um rosto',
        instrucao: 'Posicione seu rosto a aproximadamente 30 cm do rosto da criança. Observe se a criança olha para você, de forma evidente.',
        faixaEtariaMeses: [0, 6],
      },
      {
        id: 'n0-3',
        nome: 'Reage ao som',
        instrucao: 'Fique atrás da criança e bata palmas ou balance um chocalho a cerca de 30 cm de cada orelha da criança e observe se ela reage ao estímulo sonoro com movimentos nos olhos ou mudança de expressão facial.',
        faixaEtariaMeses: [0, 6],
      },
      {
        id: 'n0-4',
        nome: 'Eleva a cabeça',
        instrucao: 'Coloque a criança de bruços (barriga para baixo) e observe se ela levanta a cabeça, desencosta o queixo da superfície, sem virar para um dos lados.',
        faixaEtariaMeses: [0, 6],
      },
      {
        id: 'n0-5',
        nome: 'Sorri quando estimulada',
        instrucao: 'Sorria e converse com a criança; observe se ela responde com um sorriso. Caso não seja observado, pergunte ao acompanhante se faz em casa.',
        faixaEtariaMeses: [0, 6],
      },
      {
        id: 'n0-6',
        nome: 'Abre as mãos',
        instrucao: 'Observe se a criança abre as mãos espontaneamente ou ao ser estimulada com toque na palma.',
        faixaEtariaMeses: [0, 6],
      },
      {
        id: 'n0-7',
        nome: 'Emite sons',
        instrucao: 'Observe se a criança emite algum som (gorgolejos). Caso não seja observado durante a consulta, pergunte ao acompanhante se faz em casa.',
        faixaEtariaMeses: [0, 6],
      },
      {
        id: 'n0-8',
        nome: 'Movimenta os membros',
        instrucao: 'Observe se a criança movimenta ativamente os membros superiores e inferiores.',
        faixaEtariaMeses: [0, 6],
      },
      {
        id: 'n0-9',
        nome: 'Responde ativamente ao contato social',
        instrucao: 'Fique à frente do bebê e converse com ele. Observe se ele responde com sorriso e emissão de sons, como se estivesse "conversando" com você.',
        faixaEtariaMeses: [0, 6],
      },
      {
        id: 'n0-10',
        nome: 'Segura objetos',
        instrucao: 'Ofereça um objeto tocando no dorso da mão da criança; observe se ela abre as mãos e segura o objeto pelo menos por alguns segundos.',
        faixaEtariaMeses: [0, 6],
      },
      {
        id: 'n0-11',
        nome: 'Emite sons, ri alto',
        instrucao: 'Coloque-se à frente da criança e converse com ela. Observe se ela emite sons (gugu, eeee etc.) e veja se ri emitindo sons.',
        faixaEtariaMeses: [0, 6],
      },
      {
        id: 'n0-12',
        nome: 'Levanta a cabeça e apoia-se nos antebraços, de bruços',
        instrucao: 'Coloque a criança de bruços numa superfície firme. Chame sua atenção com objetos ou com o rosto e observe se ela levanta a cabeça e apoia-se nos antebraços.',
        faixaEtariaMeses: [0, 6],
      },
      {
        id: 'n0-13',
        nome: 'Busca ativa de objetos',
        instrucao: 'Coloque um baralho suave (sino, chocalho) próximo à orelha da criança e observe se ela vira a cabeça em direção ao objeto que produz o som. Repita no lado oposto.',
        faixaEtariaMeses: [0, 6],
      },
      {
        id: 'n0-14',
        nome: 'Leva objetos à boca',
        instrucao: 'Ofereça um objeto na mão da criança e observe se ela o leva à boca.',
        faixaEtariaMeses: [0, 6],
      },
      {
        id: 'n0-15',
        nome: 'Localiza o som',
        instrucao: 'Coloque um baralho suave (sino, chocalho) próximo à orelha da criança e observe se ela o alcança.',
        faixaEtariaMeses: [0, 6],
      },
      {
        id: 'n0-16',
        nome: 'Muda de posição (rola)',
        instrucao: 'Coloque a criança em superfície plana de barriga para cima. Incentive-a a virar para a posição de bruços.',
        faixaEtariaMeses: [0, 6],
      },
    ],
  },
  {
    id: '6m-18m',
    label: '6 meses a 1 ano e meio',
    minIdadeEmMeses: 6,
    maxIdadeEmMeses: 18,
    colunas: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
    marcos: [
      {
        id: 'n6-1',
        nome: 'Brinca de esconde-achou',
        instrucao: 'Coloque-se à frente da criança e brinque de aparecer e desaparecer, atrás de um pano ou de outra pessoa. Observe se a criança faz movimentos para procurá-lo quando desaparece.',
        faixaEtariaMeses: [6, 18],
      },
      {
        id: 'n6-2',
        nome: 'Transfere objetos de uma mão para outra',
        instrucao: 'Ofereça um objeto para a criança e observe se ela o transfere de uma mão para a outra.',
        faixaEtariaMeses: [6, 18],
      },
      {
        id: 'n6-3',
        nome: 'Senta-se sem apoio',
        instrucao: 'Observe se a criança consegue sentar-se sem apoio. Considere a informação do acompanhante.',
        faixaEtariaMeses: [6, 18],
      },
      {
        id: 'n6-4',
        nome: 'Imita gestos',
        instrucao: 'Faça algum gesto conhecido pela criança como bater palmas ou dar tchau e observe se ela o imita. Caso ela não o faça, pergunte à mãe se o faz em casa.',
        faixaEtariaMeses: [6, 18],
      },
      {
        id: 'n6-5',
        nome: 'Faz pinça',
        instrucao: 'Coloque a criança numa superfície firme, ofereça-lhe um objeto pequeno ou uma bolinha de papel. Chame atenção da criança para que ela o pegue. Observe se ao pegar parte do objeto associado ao indicador.',
        faixaEtariaMeses: [6, 18],
      },
      {
        id: 'n6-6',
        nome: 'Duplica sílabas',
        instrucao: 'Observe se a criança fala sílabas duplicadas como "mama", "papa", "dada". Considere a informação do acompanhante.',
        faixaEtariaMeses: [6, 18],
      },
      {
        id: 'n6-7',
        nome: 'Anda com apoio',
        instrucao: 'Observe se a criança consegue dar alguns passos com apoio. Caso não seja possível observar, pergunte se ela o faz em casa.',
        faixaEtariaMeses: [6, 18],
      },
      {
        id: 'n6-8',
        nome: 'Mostra o que quer',
        instrucao: 'A criança indica o que quer sem que seja por meio do choro, podendo ser por meio de palavras ou sons, apontando ou estendendo a mão para alcançar.',
        faixaEtariaMeses: [6, 18],
      },
      {
        id: 'n6-9',
        nome: 'Coloca blocos na caneca',
        instrucao: 'Coloque três blocos e a caneca sobre a mesa, em frente à criança. Observe se a criança é capaz de colocar um bloco dentro da caneca e soltá-lo. Considere a informação do acompanhante.',
        faixaEtariaMeses: [6, 18],
      },
      {
        id: 'n6-10',
        nome: 'Diz uma palavra',
        instrucao: 'Observe se a criança fala pelo menos uma palavra com significado (além de mama/papa). Considere a informação do acompanhante.',
        faixaEtariaMeses: [6, 18],
      },
      {
        id: 'n6-11',
        nome: 'Anda sem apoio',
        instrucao: 'Observe se a criança já anda bem, com bom equilíbrio, sem se apoiar. Considere a informação do acompanhante.',
        faixaEtariaMeses: [6, 18],
      },
      {
        id: 'n6-12',
        nome: 'Usa colher ou garfo',
        instrucao: 'A criança usa colher ou garfo, derramando pouca fora da boca. Considere a informação do acompanhante.',
        faixaEtariaMeses: [6, 18],
      },
      {
        id: 'n6-13',
        nome: 'Constrói torre de 2 cubos',
        instrucao: 'Observe se a criança consegue colocar um cubo sobre o outro sem que ele caia ao retirar sua mão.',
        faixaEtariaMeses: [6, 18],
      },
      {
        id: 'n6-14',
        nome: 'Fala 3 palavras',
        instrucao: 'Observe se a criança diz três palavras que não sejam nome de membros da família ou de animais de estimação. Considere a informação do acompanhante.',
        faixaEtariaMeses: [6, 18],
      },
      {
        id: 'n6-15',
        nome: 'Anda para trás',
        instrucao: 'Peça à criança para abrir uma porta ou gaveta e observe se ela dá dois passos para trás sem cair.',
        faixaEtariaMeses: [6, 18],
      },
    ],
  },
  {
    id: '18m-3a',
    label: '1 ano e meio a 3 anos',
    minIdadeEmMeses: 18,
    maxIdadeEmMeses: 42,
    colunas: [18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42],
    marcos: [
      {
        id: 'n18-1',
        nome: 'Tira roupa',
        instrucao: 'Observe se a criança é capaz de remover alguma peça de roupa, tais como: sapatos que exijam esforço para sua remoção, casacos, calças ou camisetas. Considerar informação do acompanhante.',
        faixaEtariaMeses: [18, 42],
      },
      {
        id: 'n18-2',
        nome: 'Constrói torre de 3 cubos',
        instrucao: 'Observe se a criança consegue empilhar três cubos sem que eles caiam ao retirar sua mão.',
        faixaEtariaMeses: [18, 42],
      },
      {
        id: 'n18-3',
        nome: 'Aponta 2 figuras',
        instrucao: 'Observe se a criança é capaz de apontar duas de um grupo de cinco figuras.',
        faixaEtariaMeses: [18, 42],
      },
      {
        id: 'n18-4',
        nome: 'Chuta bola',
        instrucao: 'Observe se a criança chuta a bola sem apoiar-se em objeto algum.',
        faixaEtariaMeses: [18, 42],
      },
      {
        id: 'n18-5',
        nome: 'Veste-se com supervisão',
        instrucao: 'Pergunte aos cuidadores se a criança consegue se vestir alguma peça de roupa tais como: calcinha, cueca, meias, sapatos etc.',
        faixaEtariaMeses: [18, 42],
      },
      {
        id: 'n18-6',
        nome: 'Constrói torre de 6 cubos',
        instrucao: 'Observe se a criança consegue empilhar seis cubos sem que eles caiam ao retirar sua mão.',
        faixaEtariaMeses: [18, 42],
      },
      {
        id: 'n18-7',
        nome: 'Frases com 2 palavras',
        instrucao: 'Observe se a criança combina pelo menos duas palavras formando uma frase com significado, tais como: "quer água", "quer papar", "chuta bola". Considere a informação do acompanhante.',
        faixaEtariaMeses: [18, 42],
      },
      {
        id: 'n18-8',
        nome: 'Pula com ambos os pés',
        instrucao: 'Observe se a criança se pula com os dois pés, atingindo o chão ao mesmo tempo, mas não necessariamente no mesmo lugar.',
        faixaEtariaMeses: [18, 42],
      },
      {
        id: 'n18-9',
        nome: 'Brinca com outras crianças',
        instrucao: 'Pergunte ao acompanhante se a criança participa de brincadeiras com outras crianças de sua idade.',
        faixaEtariaMeses: [18, 42],
      },
      {
        id: 'n18-10',
        nome: 'Imita o desenho de uma linha',
        instrucao: 'Observe, após demonstração, se a criança faz uma linha ou mais (no papel), de pelo menos 5 cm de comprimento.',
        faixaEtariaMeses: [18, 42],
      },
      {
        id: 'n18-11',
        nome: 'Reconhece 2 ações',
        instrucao: 'Observe se a criança é capaz de reconhecer a figura de acordo com a ação, tais como: "quem mia?", "quem late?", "quem fala?".',
        faixaEtariaMeses: [18, 42],
      },
      {
        id: 'n18-12',
        nome: 'Arremessa bola',
        instrucao: 'Observe se a criança arremessa a bola acima do braço.',
        faixaEtariaMeses: [18, 42],
      },
      {
        id: 'n18-13',
        nome: 'Veste uma camiseta',
        instrucao: 'Pergunte aos cuidadores se a criança é capaz de vestir sua camiseta e/ou casaco sem botão ou zíper, sem ajuda.',
        faixaEtariaMeses: [18, 42],
      },
      {
        id: 'n18-14',
        nome: 'Move o polegar com a mão fechada',
        instrucao: 'Demonstre para a criança e observe se ela é capaz de mover o polegar para cima em sinal de "OK" ou "legal" ou "tudo bem", com uma ou ambas as mãos.',
        faixaEtariaMeses: [18, 42],
      },
      {
        id: 'n18-15',
        nome: 'Compreende 2 adjetivos',
        instrucao: 'Verifique se a criança é capaz de compreender dois adjetivos. Pergunte: "O que você faz quando está com frio?", "O que você faz quando está cansado?". Verifique se suas respostas são coerentes.',
        faixaEtariaMeses: [18, 42],
      },
      {
        id: 'n18-16',
        nome: 'Equilibra-se em cada pé 1 segundo',
        instrucao: 'Após demonstração, verifique se a criança consegue equilibrar-se em um pé só, sem apoiar-se em nenhum objeto, pelo menos um segundo.',
        faixaEtariaMeses: [18, 42],
      },
    ],
  },
  {
    id: '3a-5a',
    label: '3 anos e meio a 5 anos',
    minIdadeEmMeses: 42,
    maxIdadeEmMeses: 60,
    colunas: [42, 44, 46, 48, 50, 52, 54, 56, 58, 60],
    marcos: [
      {
        id: 'n42-1',
        nome: 'Emparelha cores',
        instrucao: 'Observe se a criança é capaz de emparelhar objetos da mesma cor, por exemplo cubos.',
        faixaEtariaMeses: [42, 60],
      },
      {
        id: 'n42-2',
        nome: 'Copia círculos',
        instrucao: 'Forneça à criança um lápis e uma folha de papel. Mostre-lhe a figura de um círculo e verifique se ela é capaz de desenhá-lo (forma fechada ou quase fechada).',
        faixaEtariaMeses: [42, 60],
      },
      {
        id: 'n42-3',
        nome: 'Fala clara e compreensível',
        instrucao: 'Durante a avaliação observe a inteligibilidade da fala da criança (articulação e verbalização de ideias em sequência).',
        faixaEtariaMeses: [42, 60],
      },
      {
        id: 'n42-4',
        nome: 'Pula em um pé só',
        instrucao: 'Demonstre e verifique se a criança consegue pular em um pé só, duas ou mais vezes, sem apoio.',
        faixaEtariaMeses: [42, 60],
      },
      {
        id: 'n42-5',
        nome: 'Veste-se sem ajuda',
        instrucao: 'Pergunte aos cuidadores se a criança é capaz de se vestir sem alguma ajuda.',
        faixaEtariaMeses: [42, 60],
      },
      {
        id: 'n42-6',
        nome: 'Copia cruz',
        instrucao: 'Forneça à criança um lápis e uma folha de papel. Mostre-lhe a figura de uma cruz e verifique se ela é capaz de desenhá-la.',
        faixaEtariaMeses: [42, 60],
      },
      {
        id: 'n42-7',
        nome: 'Compreende 4 preposições',
        instrucao: 'Dê à criança um bloco e peça: "Coloque o bloco em cima da mesa", "Coloque um bloco na frente", "Coloque um bloco atrás de mim". Observe se ela cumpre adequadamente os quatro comandos.',
        faixaEtariaMeses: [42, 60],
      },
      {
        id: 'n42-8',
        nome: 'Equilibra-se em cada pé 3 segundos',
        instrucao: 'Procedimento semelhante a "Equilibra-se em cada pé 1 segundo", com o tempo de 3 segundos ou mais.',
        faixaEtariaMeses: [42, 60],
      },
      {
        id: 'n42-9',
        nome: 'Escova dentes sem ajuda',
        instrucao: 'Pergunte aos cuidadores se a criança é capaz de escovar os dentes, sem ajuda ou supervisão, inclusive na colocação da pasta de dentes. Verifique se a criança recebeu treino para isso.',
        faixaEtariaMeses: [42, 60],
      },
      {
        id: 'n42-10',
        nome: 'Aponta a linha mais comprida',
        instrucao: 'Mostre para a criança uma ficha contendo o desenho de duas linhas paralelas em posição vertical. Verifique se ela é capaz de apontar a linha mais comprida, mesmo mudando a posição do papel, em três tentativas.',
        faixaEtariaMeses: [42, 60],
      },
      {
        id: 'n42-11',
        nome: 'Define 5 palavras',
        instrucao: 'Verifique se a criança é capaz de definir cinco de seis palavras. Faça perguntas do tipo "O que é uma bola?" ou "O que você faz quando está com fome?". Exemplos: Rio = tem peixe, água...',
        faixaEtariaMeses: [42, 60],
      },
      {
        id: 'n42-12',
        nome: 'Equilibra-se em um pé 5 segundos',
        instrucao: 'Procedimento semelhante a "Equilibra-se em cada pé 1 segundo", com o tempo de 5 segundos ou mais.',
        faixaEtariaMeses: [42, 60],
      },
    ],
  },
  {
    id: '5a-6a',
    label: '5 a 6 anos',
    minIdadeEmMeses: 60,
    maxIdadeEmMeses: 72,
    colunas: [60, 62, 64, 66, 68, 70, 72],
    marcos: [
      {
        id: 'n60-1',
        nome: 'Brinca de fazer de conta com outras crianças',
        instrucao: 'Pergunte aos cuidadores se a criança participa de brincadeiras de fazer de conta (ex.: casinha, escola), tanto no contexto familiar quanto no escolar.',
        faixaEtariaMeses: [60, 72],
      },
      {
        id: 'n60-2',
        nome: 'Desenha pessoa com 6 partes',
        instrucao: 'Forneça à criança um lápis e uma folha de papel (sem pauta). Peça a ela para que desenhe uma pessoa. As partes do corpo presentes em pares (orelhas, olhos, braços, mãos, pernas e pés) contam como uma parte cada par.',
        faixaEtariaMeses: [60, 72],
      },
      {
        id: 'n60-3',
        nome: 'Faz analogia',
        instrucao: 'Pergunte à criança, devagar e distintamente, uma questão de cada vez: "Se o cavalo é grande, o rato é...", "Se o fogo é quente, o gelo é...". A criança deverá completar corretamente duas das três frases.',
        faixaEtariaMeses: [60, 72],
      },
      {
        id: 'n60-4',
        nome: 'Marcha ponta-calcanhar',
        instrucao: 'Demonstre como andar em linha reta, encostando a ponta de um pé no calcanhar do outro. Ande aproximadamente oito passos desta forma, e então peça para que a criança o imite. Até três tentativas da ponta do pé, sem apoiar-se, terá alcançado este marco.',
        faixaEtariaMeses: [60, 72],
      },
      {
        id: 'n60-5',
        nome: 'Aceita e segue regras nos jogos de mesa',
        instrucao: 'Pergunte aos cuidadores se a criança é capaz de aceitar e seguir regras dos jogos de mesa.',
        faixaEtariaMeses: [60, 72],
      },
      {
        id: 'n60-6',
        nome: 'Copia um quadrado',
        instrucao: 'Forneça à criança um lápis e uma folha de papel (sem pauta). Não nomear como fazê-lo; desenhe dois lados opostos (paralelos) e depois os outros dois lados opostos. Três demonstrações e tentativas podem ser fornecidas.',
        faixaEtariaMeses: [60, 72],
      },
      {
        id: 'n60-7',
        nome: 'Define 7 palavras',
        instrucao: 'Procedimento semelhante a "Define cinco palavras". Agora deve definir 7 palavras, com o tempo de 7 segundos ou mais.',
        faixaEtariaMeses: [60, 72],
      },
      {
        id: 'n60-8',
        nome: 'Equilibra-se em cada pé por 7 segundos',
        instrucao: 'Procedimento semelhante a "Equilibra-se em cada pé 1 segundo", com o tempo de 7 segundos ou mais.',
        faixaEtariaMeses: [60, 72],
      },
    ],
  },
]

export function getGrupoAtivo(idadeEmMeses: number): GrupoMarcos {
  const reversed = [...gruposMarcos].reverse()
  return reversed.find(g => idadeEmMeses >= g.minIdadeEmMeses) ?? gruposMarcos[0]
}
