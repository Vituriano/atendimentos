import type { PerguntaMCHAT } from '../types/clinica'

export type MchatPergunta = PerguntaMCHAT & {
  riskAnswer: 'yes' | 'no'
}

export const mchatPerguntas: MchatPergunta[] = [
  { id: 1, pergunta: 'Seu filho gosta de ser balançado no colo, brincar de cama elástica ou de “cavalinho”?', riskAnswer: 'no' },
  { id: 2, pergunta: 'Seu filho costuma chamar a atenção de outras pessoas para coisas interessantes?', riskAnswer: 'no' },
  { id: 3, pergunta: 'Seu filho usa o dedo indicador para apontar para mostrar interesse em algo?', riskAnswer: 'no' },
  { id: 4, pergunta: 'Seu filho consegue seguir o seu olhar ou o seu dedo quando você aponta para algo?', riskAnswer: 'no' },
  { id: 5, pergunta: 'Seu filho responde ao nome quando você chama?', riskAnswer: 'no' },
  { id: 6, pergunta: 'Seu filho gosta de brincar de esconde-esconde ou de “palhacinhos”?', riskAnswer: 'no' },
  { id: 7, pergunta: 'Seu filho gosta de brincar com brinquedinhos de forma apropriada?', riskAnswer: 'no' },
  { id: 8, pergunta: 'Seu filho observa seus olhos quando você está falando com ele?', riskAnswer: 'no' },
  { id: 9, pergunta: 'Seu filho traz objetos para você mostrar?', riskAnswer: 'no' },
  { id: 10, pergunta: 'Seu filho usa palavras ou gestos para pedir algo?', riskAnswer: 'no' },
  { id: 11, pergunta: 'Seu filho tenta imitar seus gestos ou expressões quando você faz algo?', riskAnswer: 'no' },
  { id: 12, pergunta: 'Seu filho demonstra interesse em outras crianças?', riskAnswer: 'no' },
  { id: 13, pergunta: 'Seu filho se assusta quando faz contato físico leve, como um abraço carinhoso?', riskAnswer: 'yes' },
  { id: 14, pergunta: 'Seu filho evita fazer contato visual com você?', riskAnswer: 'yes' },
  { id: 15, pergunta: 'Seu filho responde quando você diz “não”?', riskAnswer: 'no' },
  { id: 16, pergunta: 'Seu filho ri ou sorri quando você sorri para ele?', riskAnswer: 'no' },
  { id: 17, pergunta: 'Seu filho presta atenção ao que você está fazendo ou olhando?', riskAnswer: 'no' },
  { id: 18, pergunta: 'Seu filho costuma brincar simulando ações, como dar comida a uma boneca ou fingir que está falando ao telefone?', riskAnswer: 'no' },
  { id: 19, pergunta: 'Seu filho se mostra sensível a sons, texturas ou cheiros ao ponto de ficar irritado?', riskAnswer: 'yes' },
  { id: 20, pergunta: 'Seu filho se interessa por brinquedos e atividades diferentes?', riskAnswer: 'no' },
]
