// Subconjunto inicial (starter) do CID-10, curado para consultas pediátricas.
// NÃO é a tabela oficial completa — reúne apenas códigos comuns na puericultura
// e no atendimento pediátrico ambulatorial, para alimentar o typeahead do
// diagnóstico. Expandir conforme a necessidade (idealmente importando a tabela
// oficial do DATASUS/OMS). Cada item segue o formato { codigo, descricao }.
import type { CodigoCID } from '../types/clinica'

export type ItemCID10 = Pick<CodigoCID, 'codigo' | 'descricao'>

export const cid10Starter: ItemCID10[] = [
  // Puericultura / exames e acompanhamento de rotina
  { codigo: 'Z00.0', descricao: 'Exame médico geral' },
  { codigo: 'Z00.1', descricao: 'Exame de rotina de saúde da criança' },
  { codigo: 'Z00.2', descricao: 'Exame no período de crescimento rápido na infância' },
  { codigo: 'Z00.3', descricao: 'Exame do estado de desenvolvimento do adolescente' },
  { codigo: 'Z23', descricao: 'Necessidade de imunização contra doença bacteriana única' },
  { codigo: 'Z27.3', descricao: 'Necessidade de imunização contra difteria-tétano-coqueluche e poliomielite' },
  { codigo: 'Z76.2', descricao: 'Supervisão de saúde e assistência a outras crianças e lactentes sadios' },

  // Recém-nascido / perinatal
  { codigo: 'P07.1', descricao: 'Outros recém-nascidos de baixo peso' },
  { codigo: 'P07.3', descricao: 'Outros recém-nascidos de pré-termo' },
  { codigo: 'P59.9', descricao: 'Icterícia neonatal não especificada' },
  { codigo: 'P92.5', descricao: 'Dificuldade neonatal na amamentação ao seio' },

  // Crescimento e nutrição
  { codigo: 'E66.9', descricao: 'Obesidade não especificada' },
  { codigo: 'E44.0', descricao: 'Desnutrição proteico-calórica moderada' },
  { codigo: 'E45', descricao: 'Atraso do desenvolvimento devido à desnutrição proteico-calórica' },
  { codigo: 'E55.0', descricao: 'Raquitismo ativo' },
  { codigo: 'D50.9', descricao: 'Anemia por deficiência de ferro não especificada' },
  { codigo: 'R62.8', descricao: 'Outras faltas de desenvolvimento fisiológico normal esperado' },
  { codigo: 'R63.3', descricao: 'Dificuldades de alimentação e erros na administração de alimentos' },

  // Infecções respiratórias (muito comuns na pediatria)
  { codigo: 'J00', descricao: 'Nasofaringite aguda (resfriado comum)' },
  { codigo: 'J02.9', descricao: 'Faringite aguda não especificada' },
  { codigo: 'J03.9', descricao: 'Amigdalite aguda não especificada' },
  { codigo: 'J04.0', descricao: 'Laringite aguda' },
  { codigo: 'J05.0', descricao: 'Laringite obstrutiva aguda (crupe)' },
  { codigo: 'J06.9', descricao: 'Infecção aguda das vias aéreas superiores não especificada' },
  { codigo: 'J11.1', descricao: 'Influenza com outras manifestações respiratórias, vírus não identificado' },
  { codigo: 'J18.9', descricao: 'Pneumonia não especificada' },
  { codigo: 'J20.9', descricao: 'Bronquite aguda não especificada' },
  { codigo: 'J21.0', descricao: 'Bronquiolite aguda devida a vírus sincicial respiratório' },
  { codigo: 'J45.0', descricao: 'Asma predominantemente alérgica' },
  { codigo: 'J45.9', descricao: 'Asma não especificada' },

  // Otorrino / oftalmo
  { codigo: 'H65.9', descricao: 'Otite média não supurativa não especificada' },
  { codigo: 'H66.9', descricao: 'Otite média não especificada' },
  { codigo: 'H10.9', descricao: 'Conjuntivite não especificada' },

  // Digestivo / gastrointestinal
  { codigo: 'A08.4', descricao: 'Infecção intestinal viral não especificada' },
  { codigo: 'A09', descricao: 'Diarreia e gastroenterite de origem infecciosa presumível' },
  { codigo: 'K52.9', descricao: 'Gastroenterite e colite não infecciosas não especificadas' },
  { codigo: 'K59.0', descricao: 'Constipação' },
  { codigo: 'R11', descricao: 'Náusea e vômitos' },
  { codigo: 'P92.1', descricao: 'Regurgitação e ruminação do recém-nascido' },
  { codigo: 'R10.4', descricao: 'Outras dores abdominais e as não especificadas' },

  // Pele
  { codigo: 'L20.9', descricao: 'Dermatite atópica não especificada' },
  { codigo: 'L22', descricao: 'Dermatite das fraldas' },
  { codigo: 'L23.9', descricao: 'Dermatite alérgica de contato de causa não especificada' },
  { codigo: 'B07', descricao: 'Verrugas de origem viral' },
  { codigo: 'B08.4', descricao: 'Estomatite vesicular com exantema (mão-pé-boca)' },
  { codigo: 'L01.0', descricao: 'Impetigo' },

  // Doenças exantemáticas / infecciosas comuns
  { codigo: 'B01.9', descricao: 'Varicela sem complicações' },
  { codigo: 'B08.5', descricao: 'Faringite vesicular por enterovírus (herpangina)' },
  { codigo: 'B34.9', descricao: 'Infecção viral não especificada' },

  // Sintomas e sinais gerais
  { codigo: 'R50.9', descricao: 'Febre não especificada' },
  { codigo: 'R05', descricao: 'Tosse' },
  { codigo: 'R21', descricao: 'Exantema e outras erupções cutâneas não especificadas' },
  { codigo: 'R51', descricao: 'Cefaleia' },
  { codigo: 'R56.0', descricao: 'Convulsões febris' },

  // Geniturinário
  { codigo: 'N39.0', descricao: 'Infecção do trato urinário de localização não especificada' },
  { codigo: 'R32', descricao: 'Incontinência urinária não especificada' },
  { codigo: 'F98.0', descricao: 'Enurese não orgânica' },

  // Desenvolvimento / neuro / comportamento
  { codigo: 'F80.9', descricao: 'Transtorno do desenvolvimento da fala e da linguagem não especificado' },
  { codigo: 'F84.0', descricao: 'Autismo infantil' },
  { codigo: 'F90.0', descricao: 'Distúrbios da atividade e da atenção' },
  { codigo: 'F98.5', descricao: 'Gagueira (tartamudez)' },
  { codigo: 'R62.0', descricao: 'Atraso do desenvolvimento (marco fisiológico não alcançado)' },

  // Ortopedia / diversos
  { codigo: 'Q66.0', descricao: 'Pé torto congênito equinovaro' },
  { codigo: 'Q65.9', descricao: 'Deformidade congênita não especificada do quadril' },
  { codigo: 'T78.4', descricao: 'Alergia não especificada' },
  { codigo: 'W57', descricao: 'Mordedura ou picada de inseto (não venenoso)' },
]
