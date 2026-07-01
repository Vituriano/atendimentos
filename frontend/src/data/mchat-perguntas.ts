export interface MchatPergunta {
  id: number;
  pergunta: string;
  riskAnswer: 'yes' | 'no';
}

export const mchatPerguntas: MchatPergunta[] = [
  { id: 1, pergunta: 'Se você aponta para algo do outro lado do cômodo, o seu filho olha para o que você está apontando? (Por exemplo, se você apontar para um brinquedo ou um animal, o seu filho olha para o brinquedo ou para o animal?)', riskAnswer: 'no' },
  { id: 2, pergunta: 'Alguma vez você já se perguntou se o seu filho é surdo?', riskAnswer: 'yes' },
  { id: 3, pergunta: 'O seu filho brinca de faz-de-conta? (Por exemplo, finge que está bebendo num copo vazio, finge que está falando ao telefone, finge que está dando de comer a uma boneca ou a um bicho de pelúcia?)', riskAnswer: 'no' },
  { id: 4, pergunta: 'O seu filho gosta de subir nas coisas? (Por exemplo, móveis, brinquedos do parque ou escadas?)', riskAnswer: 'no' },
  { id: 5, pergunta: 'O seu filho faz movimentos invulgares com os dedos perto dos olhos? (Por exemplo, o seu filho abana os dedos perto dos olhos?)', riskAnswer: 'yes' },
  { id: 6, pergunta: 'O seu filho aponta com um dedo para pedir alguma coisa ou para pedir ajuda? (Por exemplo, apontar para um brinquedo ou comida que está fora do seu alcance?)', riskAnswer: 'no' },
  { id: 7, pergunta: 'O seu filho aponta com um dedo para lhe mostrar algo interessante? (Por exemplo, apontar para um avião no céu ou para um camião grande na estrada?)', riskAnswer: 'no' },
  { id: 8, pergunta: 'O seu filho interessa-se por outras crianças? (Por exemplo, o seu filho olha para outras crianças, sorri para elas ou vai para perto delas?)', riskAnswer: 'no' },
  { id: 9, pergunta: 'O seu filho mostra-lhe coisas, trazendo-as até si ou segurando-as no ar para que as veja? (Não para pedir ajuda, mas apenas para partilhar consigo; por exemplo, mostrar-lhe uma flor, um bicho de pelúcia ou um desenho?)', riskAnswer: 'no' },
  { id: 10, pergunta: 'O seu filho responde quando o chamam pelo nome? (Por exemplo, o seu filho olha para si, fala ou balbucia, ou para o que está a fazer quando o chama pelo nome?)', riskAnswer: 'no' },
  { id: 11, pergunta: 'Quando você sorri para o seu filho, ele sorri de volta?', riskAnswer: 'no' },
  { id: 12, pergunta: 'O seu filho fica incomodado com ruídos diários? (Por exemplo, o seu filho grita ou chora com ruídos como o do aspirador ou de música alta?)', riskAnswer: 'yes' },
  { id: 13, pergunta: 'O seu filho anda?', riskAnswer: 'no' },
  { id: 14, pergunta: 'O seu filho olha nos seus olhos quando você está a falar com ele, a brincar com ele ou a vesti-lo?', riskAnswer: 'no' },
  { id: 15, pergunta: 'O seu filho tenta imitar o que você faz? (Por exemplo, dar tchau, bater palmas ou fazer um som engraçado quando você faz?)', riskAnswer: 'no' },
  { id: 16, pergunta: 'Se você voltar a cabeça para olhar para algo, o seu filho volta a cabeça para ver o que você está a olhar?', riskAnswer: 'no' },
  { id: 17, pergunta: 'O seu filho tenta fazer com que você olhe para ele? (Por exemplo, o seu filho olha para si à espera de um elogio, ou diz "olha" ou "vê me"?)', riskAnswer: 'no' },
  { id: 18, pergunta: 'O seu filho percebe o que você lhe diz para fazer? (Por exemplo, se você não fizer gestos, o seu filho percebe quando você diz "põe o livro na mesa" ou "traz-me os sapatos"?)', riskAnswer: 'no' },
  { id: 19, pergunta: 'Se acontecer algo invulgar, o seu filho olha para a sua cara para ver como você reage? (Por exemplo, se ele ouvir um barulho estranho ou engraçado, ou se aparecer um brinquedo novo, ele olha para a sua cara?)', riskAnswer: 'no' },
  { id: 20, pergunta: 'O seu filho gosta de atividades de movimento? (Por exemplo, ser balançado ou andar às cavalitas?)', riskAnswer: 'no' },
]