import type { QueueEntry, Patient, Consultation, Alert, AnthropometricData, GrowthDataPoint, Milestone, MilestoneRecord, MChatQuestion, AlertaExpandido, Prontuario } from "./types"

// All patients in the system (base de pacientes)
export const allPatients: Patient[] = [
  {
    id: "1",
    name: "Ana Clara Souza",
    birthDate: "10/01/2024",
    age: "2 anos e 3 meses",
    ageInMonths: 27,
    record: "HC-2024-00847",
    primaryRecord: "HC-2024-00847",
    cpf: "123.456.789-10",
    prontuarios: [
      {
        number: "HC-2024-00847",
        openedDate: "10/01/2024",
        consultations: [
          { id: "c1-1", date: "Mar/2025", type: "Retorno", weight: 11.2, weightTrend: "down", cid: "Z00.1", referral: "Gastroenterologia", editedAt: "2026-03-15T10:30:00Z", editedFields: ["weight", "cid"] },
          { id: "c1-2", date: "Fev/2025", type: "externo", servicoOrigem: "UBS Mangueira", weight: 10.9, weightTrend: "down", cid: null, referral: null, observacoes: "Dados da caderneta fisica trazida pela mae na consulta de Mar/2025", isExterno: true },
          { id: "c1-3", date: "Jan/2025", type: "Egresso", weight: 11.5, weightTrend: "stable", cid: null, referral: null },
          { id: "c1-4", date: "Out/2024", type: "Retorno", weight: 10.8, weightTrend: "up", cid: "J06.9", referral: null },
          { id: "c1-5", date: "Jul/2024", type: "Retorno", weight: 10.2, weightTrend: "up", cid: "Z00.1", referral: null },
        ],
      },
      {
        number: "HC-2022-00231",
        openedDate: "05/03/2022",
        consultations: [
          { id: "c1-6", date: "Dez/2023", type: "Retorno", weight: 9.5, weightTrend: "up", cid: "Z00.1", referral: null },
          { id: "c1-7", date: "Set/2023", type: "Retorno", weight: 9.0, weightTrend: "up", cid: "Z00.1", referral: null },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Pedro Henrique Lima",
    birthDate: "15/07/2025",
    age: "8 meses",
    ageInMonths: 8,
    record: "HC-2025-01234",
    primaryRecord: "HC-2025-01234",
    cpf: "234.567.890-21",
    prontuarios: [
      {
        number: "HC-2025-01234",
        openedDate: "15/07/2025",
        consultations: [
          { id: "c2-1", date: "Mai/2026", type: "Retorno", weight: 8.5, weightTrend: "up", cid: "Z00.1", referral: null },
          { id: "c2-2", date: "Mar/2026", type: "Retorno", weight: 7.8, weightTrend: "up", cid: "Z00.1", referral: null },
        ],
      },
    ],
  },
  {
    id: "3",
    name: "Isabela Ferreira",
    birthDate: "20/04/2022",
    age: "4 anos",
    ageInMonths: 48,
    record: "HC-2022-00567",
    primaryRecord: "HC-2022-00567",
    cpf: "345.678.901-32",
    prontuarios: [
      {
        number: "HC-2022-00567",
        openedDate: "20/04/2022",
        consultations: [
          { id: "c3-1", date: "Abr/2026", type: "Retorno", weight: 16.2, weightTrend: "stable", cid: "Z00.1", referral: null, editedAt: "2026-04-20T14:15:00Z", editedFields: ["observacoes"] },
          { id: "c3-2", date: "Jan/2026", type: "Retorno", weight: 15.8, weightTrend: "up", cid: "J06.9", referral: "Otorrinolaringologia" },
          { id: "c3-3", date: "Out/2025", type: "Retorno", weight: 15.3, weightTrend: "up", cid: "Z00.1", referral: null },
        ],
      },
      {
        number: "HC-2020-00112",
        openedDate: "10/08/2020",
        consultations: [
          { id: "c3-4", date: "Mar/2022", type: "Retorno", weight: 12.5, weightTrend: "up", cid: "Z00.1", referral: null },
        ],
      },
    ],
  },
  {
    id: "4",
    name: "Miguel Santos",
    birthDate: "10/04/2025",
    age: "1 ano",
    ageInMonths: 12,
    record: "HC-2025-00890",
    primaryRecord: "HC-2025-00890",
    cpf: "456.789.012-43",
    prontuarios: [
      {
        number: "HC-2025-00890",
        openedDate: "10/04/2025",
        consultations: [
          { id: "c4-1", date: "Abr/2026", type: "Retorno", weight: 10.1, weightTrend: "up", cid: "Z00.1", referral: null },
          { id: "c4-2", date: "Jan/2026", type: "Retorno", weight: 9.2, weightTrend: "up", cid: "Z00.1", referral: null },
        ],
      },
    ],
  },
  {
    id: "5",
    name: "Sophia Oliveira",
    birthDate: "24/04/2023",
    age: "3 anos",
    ageInMonths: 36,
    record: "HC-2023-00445",
    primaryRecord: "HC-2023-00445",
    cpf: "567.890.123-54",
    prontuarios: [
      {
        number: "HC-2023-00445",
        openedDate: "24/04/2023",
        consultations: [
          { id: "c5-1", date: "Mai/2026", type: "Retorno", weight: 14.5, weightTrend: "stable", cid: "Z00.1", referral: null },
          { id: "c5-2", date: "Fev/2026", type: "Retorno", weight: 14.2, weightTrend: "up", cid: "Z00.1", referral: null },
          { id: "c5-3", date: "Nov/2025", type: "Retorno", weight: 13.8, weightTrend: "up", cid: "J20.9", referral: "Pneumologia" },
        ],
      },
      {
        number: "HC-2021-00789",
        openedDate: "15/06/2021",
        consultations: [
          { id: "c5-4", date: "Abr/2023", type: "Retorno", weight: 11.5, weightTrend: "up", cid: "Z00.1", referral: null },
          { id: "c5-5", date: "Jan/2023", type: "Retorno", weight: 10.8, weightTrend: "up", cid: "Z00.1", referral: null },
        ],
      },
    ],
  },
  {
    id: "6",
    name: "Bernardo Costa",
    birthDate: "05/08/2024",
    age: "1 ano e 9 meses",
    ageInMonths: 21,
    record: "HC-2024-01123",
    primaryRecord: "HC-2024-01123",
    cpf: "678.901.234-65",
    prontuarios: [
      {
        number: "HC-2024-01123",
        openedDate: "05/08/2024",
        consultations: [
          { id: "c6-1", date: "Mai/2026", type: "Retorno", weight: 12.0, weightTrend: "up", cid: "Z00.1", referral: null },
          { id: "c6-2", date: "Fev/2026", type: "Retorno", weight: 11.5, weightTrend: "up", cid: "Z00.1", referral: null },
        ],
      },
    ],
  },
  {
    id: "7",
    name: "Camila Rodrigues",
    birthDate: "18/12/2021",
    age: "4 anos e 5 meses",
    ageInMonths: 53,
    record: "HC-2021-00892",
    primaryRecord: "HC-2021-00892",
    cpf: "789.012.345-76",
    prontuarios: [
      {
        number: "HC-2021-00892",
        openedDate: "18/12/2021",
        consultations: [
          { id: "c7-1", date: "Mai/2026", type: "Retorno", weight: 17.5, weightTrend: "stable", cid: "Z00.1", referral: null },
          { id: "c7-2", date: "Fev/2026", type: "Retorno", weight: 17.2, weightTrend: "up", cid: "Z00.1", referral: null },
        ],
      },
    ],
  },
  {
    id: "8",
    name: "Davi Almeida",
    birthDate: "30/03/2025",
    age: "1 ano e 2 meses",
    ageInMonths: 14,
    record: "HC-2025-00234",
    primaryRecord: "HC-2025-00234",
    cpf: "890.123.456-87",
    prontuarios: [
      {
        number: "HC-2025-00234",
        openedDate: "30/03/2025",
        consultations: [
          { id: "c8-1", date: "Mai/2026", type: "Retorno", weight: 10.8, weightTrend: "up", cid: "Z00.1", referral: null },
        ],
      },
    ],
  },
  {
    id: "9",
    name: "Eduarda Martins",
    birthDate: "12/06/2023",
    age: "2 anos e 11 meses",
    ageInMonths: 35,
    record: "HC-2023-00678",
    primaryRecord: "HC-2023-00678",
    cpf: "901.234.567-98",
    prontuarios: [
      {
        number: "HC-2023-00678",
        openedDate: "12/06/2023",
        consultations: [
          { id: "c9-1", date: "Mai/2026", type: "Retorno", weight: 13.5, weightTrend: "stable", cid: "Z00.1", referral: null },
          { id: "c9-2", date: "Fev/2026", type: "Retorno", weight: 13.2, weightTrend: "up", cid: "K59.0", referral: "Gastroenterologia" },
        ],
      },
    ],
  },
  {
    id: "10",
    name: "Felipe Nascimento",
    birthDate: "25/09/2022",
    age: "3 anos e 8 meses",
    ageInMonths: 44,
    record: "HC-2022-01345",
    primaryRecord: "HC-2022-01345",
    cpf: "012.345.678-09",
    prontuarios: [
      {
        number: "HC-2022-01345",
        openedDate: "25/09/2022",
        consultations: [
          { id: "c10-1", date: "Abr/2026", type: "Retorno", weight: 15.8, weightTrend: "up", cid: "Z00.1", referral: null },
        ],
      },
    ],
  },
  {
    id: "11",
    name: "Giovanna Pereira",
    birthDate: "08/02/2024",
    age: "2 anos e 3 meses",
    ageInMonths: 27,
    record: "HC-2024-00456",
    primaryRecord: "HC-2024-00456",
    cpf: "111.222.333-44",
    prontuarios: [
      {
        number: "HC-2024-00456",
        openedDate: "08/02/2024",
        consultations: [
          { id: "c11-1", date: "Mai/2026", type: "Retorno", weight: 12.3, weightTrend: "up", cid: "Z00.1", referral: null },
          { id: "c11-2", date: "Fev/2026", type: "Retorno", weight: 11.8, weightTrend: "up", cid: "Z00.1", referral: null },
        ],
      },
    ],
  },
  {
    id: "12",
    name: "Henrique Barbosa",
    birthDate: "14/11/2023",
    age: "2 anos e 6 meses",
    ageInMonths: 30,
    record: "HC-2023-01567",
    primaryRecord: "HC-2023-01567",
    cpf: "222.333.444-55",
    prontuarios: [
      {
        number: "HC-2023-01567",
        openedDate: "14/11/2023",
        consultations: [
          { id: "c12-1", date: "Mai/2026", type: "Retorno", weight: 13.1, weightTrend: "stable", cid: "Z00.1", referral: null },
        ],
      },
    ],
  },
  {
    id: "13",
    name: "Isadora Ramos",
    birthDate: "03/07/2025",
    age: "10 meses",
    ageInMonths: 10,
    record: "HC-2025-00789",
    primaryRecord: "HC-2025-00789",
    cpf: "333.444.555-66",
    prontuarios: [
      {
        number: "HC-2025-00789",
        openedDate: "03/07/2025",
        consultations: [
          { id: "c13-1", date: "Mai/2026", type: "Retorno", weight: 9.2, weightTrend: "up", cid: "Z00.1", referral: null },
        ],
      },
    ],
  },
  {
    id: "14",
    name: "Joao Gabriel Teixeira",
    birthDate: "21/01/2022",
    age: "4 anos e 4 meses",
    ageInMonths: 52,
    record: "HC-2022-00234",
    primaryRecord: "HC-2022-00234",
    cpf: "444.555.666-77",
    prontuarios: [
      {
        number: "HC-2022-00234",
        openedDate: "21/01/2022",
        consultations: [
          { id: "c14-1", date: "Mai/2026", type: "Retorno", weight: 18.0, weightTrend: "stable", cid: "Z00.1", referral: null },
          { id: "c14-2", date: "Fev/2026", type: "Retorno", weight: 17.5, weightTrend: "up", cid: "H65.9", referral: "Otorrinolaringologia" },
        ],
      },
    ],
  },
  {
    id: "15",
    name: "Larissa Fernandes",
    birthDate: "09/05/2024",
    age: "2 anos",
    ageInMonths: 24,
    record: "HC-2024-01890",
    primaryRecord: "HC-2024-01890",
    cpf: "555.666.777-88",
    prontuarios: [
      {
        number: "HC-2024-01890",
        openedDate: "09/05/2024",
        consultations: [
          { id: "c15-1", date: "Mai/2026", type: "Retorno", weight: 11.5, weightTrend: "up", cid: "Z00.1", referral: null },
        ],
      },
    ],
  },
  {
    id: "16",
    name: "Matheus Goncalves",
    birthDate: "16/10/2023",
    age: "2 anos e 7 meses",
    ageInMonths: 31,
    record: "HC-2023-00912",
    primaryRecord: "HC-2023-00912",
    cpf: "666.777.888-99",
    prontuarios: [
      {
        number: "HC-2023-00912",
        openedDate: "16/10/2023",
        consultations: [
          { id: "c16-1", date: "Mai/2026", type: "Retorno", weight: 13.8, weightTrend: "up", cid: "Z00.1", referral: null },
        ],
      },
    ],
  },
  {
    id: "17",
    name: "Natalia Cardoso",
    birthDate: "28/04/2025",
    age: "1 ano e 1 mes",
    ageInMonths: 13,
    record: "HC-2025-01456",
    primaryRecord: "HC-2025-01456",
    cpf: "777.888.999-00",
    prontuarios: [
      {
        number: "HC-2025-01456",
        openedDate: "28/04/2025",
        consultations: [
          { id: "c17-1", date: "Mai/2026", type: "Retorno", weight: 9.8, weightTrend: "up", cid: "Z00.1", referral: null },
        ],
      },
    ],
  },
  {
    id: "18",
    name: "Otavio Ribeiro",
    birthDate: "07/08/2022",
    age: "3 anos e 9 meses",
    ageInMonths: 45,
    record: "HC-2022-01678",
    primaryRecord: "HC-2022-01678",
    cpf: "888.999.000-11",
    prontuarios: [
      {
        number: "HC-2022-01678",
        openedDate: "07/08/2022",
        consultations: [
          { id: "c18-1", date: "Mai/2026", type: "Retorno", weight: 16.2, weightTrend: "stable", cid: "Z00.1", referral: null },
        ],
      },
    ],
  },
  {
    id: "19",
    name: "Patricia Mendes",
    birthDate: "19/12/2024",
    age: "1 ano e 5 meses",
    ageInMonths: 17,
    record: "HC-2024-02345",
    primaryRecord: "HC-2024-02345",
    cpf: "999.000.111-22",
    prontuarios: [
      {
        number: "HC-2024-02345",
        openedDate: "19/12/2024",
        consultations: [
          { id: "c19-1", date: "Mai/2026", type: "Retorno", weight: 10.5, weightTrend: "up", cid: "Z00.1", referral: null },
        ],
      },
    ],
  },
  {
    id: "20",
    name: "Rafael Carvalho",
    birthDate: "02/03/2023",
    age: "3 anos e 2 meses",
    ageInMonths: 38,
    record: "HC-2023-01234",
    primaryRecord: "HC-2023-01234",
    cpf: "100.200.300-40",
    prontuarios: [
      {
        number: "HC-2023-01234",
        openedDate: "02/03/2023",
        consultations: [
          { id: "c20-1", date: "Mai/2026", type: "Retorno", weight: 14.8, weightTrend: "up", cid: "Z00.1", referral: null },
        ],
      },
    ],
  },
]

// Current patient for briefing and consultation
export const currentPatient: Patient = allPatients[0]

// Helper to get patient by ID
export function getPatientById(id: string): Patient | undefined {
  return allPatients.find(p => p.id === id)
}

// Queue data
export const queueData: QueueEntry[] = [
  {
    id: "1",
    time: "08:15",
    patient: allPatients[0],
    entryType: "Retorno",
    status: "Em Atendimento",
    waitTime: "45 min",
  },
  {
    id: "2",
    time: "08:30",
    patient: allPatients[1],
    entryType: "Egresso",
    status: "Aguardando",
    waitTime: "28 min",
    faltas: 2,
  },
  {
    id: "3",
    time: "09:00",
    patient: allPatients[2],
    entryType: "Encaminhamento Externo",
    status: "Aguardando",
    waitTime: "12 min",
  },
  {
    id: "4",
    time: "09:20",
    patient: allPatients[3],
    entryType: "Retorno",
    status: "Agendado",
    waitTime: null,
  },
  {
    id: "5",
    time: "09:45",
    patient: allPatients[4],
    entryType: "Internacao",
    status: "Pendente",
    waitTime: "67 min",
    faltas: 1,
  },
]

// Consultation history (derived from first patient's primary prontuario for backward compatibility)
export const consultationHistory: Consultation[] = allPatients[0].prontuarios?.[0]?.consultations || []

// Alerts (legacy)
export const alerts: Alert[] = [
  {
    type: "critical",
    message: "Peso abaixo do percentil 10 por 2 consultas consecutivas",
  },
  {
    type: "warning",
    message: "Encaminhamento para Gastroenterologia sem retorno (45 dias)",
  },
  {
    type: "warning",
    message: 'Marco "Fala clara e compreensível" não confirmado na última consulta',
  },
]

// Alertas expandidos com categoria
export const alertasExpandidos: AlertaExpandido[] = [
  {
    id: "a1",
    tipo: "critico",
    categoria: "peso",
    mensagem: "Peso abaixo do percentil 10 por 2 consultas consecutivas",
  },
  {
    id: "a2",
    tipo: "atencao",
    categoria: "encaminhamento",
    mensagem: "Encaminhamento para Gastroenterologia sem retorno (45 dias)",
  },
  {
    id: "a3",
    tipo: "atencao",
    categoria: "falta",
    mensagem: "Falta sem reagendamento registrada em 20/02/2025",
  },
  {
    id: "a4",
    tipo: "critico",
    categoria: "negligencia",
    mensagem: "2 faltas consecutivas sem justificativa — caso encaminhado ao Serviço Social",
  },
  {
    id: "a5",
    tipo: "atencao",
    categoria: "marco",
    mensagem: 'Marco "Fala clara e compreensível" não confirmado na última consulta',
  },
]

// Anthropometric data
export const anthropometricData: AnthropometricData = {
  weight: 11.2,
  weightPercentile: "P10",
  height: 82,
  heightPercentile: "P25",
  headCircumference: null,
  bmi: 16.6,
}

// Growth data for charts
export const heightData: GrowthDataPoint[] = [
  { ageInMonths: 21, value: 80 },
  { ageInMonths: 24, value: 82 },
  { ageInMonths: 27, value: 84.5 },
]

export const weightData: GrowthDataPoint[] = [
  { ageInMonths: 21, value: 10.2 },
  { ageInMonths: 24, value: 10.8 },
  { ageInMonths: 27, value: 11.2 },
]

export const bmiData: GrowthDataPoint[] = [
  { ageInMonths: 21, value: 16.9 },
  { ageInMonths: 24, value: 16.6 },
  { ageInMonths: 27, value: 16.4 },
]

// WHO Height-for-age reference data (Girls 0-5 years, simplified)
export const whoHeightReference = {
  zScore3: [
    { age: 0, value: 54.7 }, { age: 3, value: 65.0 }, { age: 6, value: 71.0 },
    { age: 9, value: 75.5 }, { age: 12, value: 79.2 }, { age: 18, value: 85.0 },
    { age: 24, value: 90.2 }, { age: 30, value: 95.0 }, { age: 36, value: 99.5 },
    { age: 48, value: 108.0 }, { age: 60, value: 116.0 },
  ],
  zScore2: [
    { age: 0, value: 52.9 }, { age: 3, value: 62.5 }, { age: 6, value: 68.0 },
    { age: 9, value: 72.5 }, { age: 12, value: 76.0 }, { age: 18, value: 81.5 },
    { age: 24, value: 86.5 }, { age: 30, value: 91.0 }, { age: 36, value: 95.5 },
    { age: 48, value: 103.5 }, { age: 60, value: 111.0 },
  ],
  zScore1: [
    { age: 0, value: 51.0 }, { age: 3, value: 60.5 }, { age: 6, value: 66.0 },
    { age: 9, value: 70.5 }, { age: 12, value: 74.0 }, { age: 18, value: 79.5 },
    { age: 24, value: 84.5 }, { age: 30, value: 88.5 }, { age: 36, value: 93.0 },
    { age: 48, value: 100.5 }, { age: 60, value: 107.5 },
  ],
  zScore0: [
    { age: 0, value: 49.1 }, { age: 3, value: 58.5 }, { age: 6, value: 64.0 },
    { age: 9, value: 68.5 }, { age: 12, value: 72.0 }, { age: 18, value: 77.5 },
    { age: 24, value: 82.5 }, { age: 30, value: 86.5 }, { age: 36, value: 90.5 },
    { age: 48, value: 97.5 }, { age: 60, value: 104.0 },
  ],
  zScoreNeg1: [
    { age: 0, value: 47.3 }, { age: 3, value: 56.5 }, { age: 6, value: 62.0 },
    { age: 9, value: 66.5 }, { age: 12, value: 70.0 }, { age: 18, value: 75.5 },
    { age: 24, value: 80.5 }, { age: 30, value: 84.5 }, { age: 36, value: 88.0 },
    { age: 48, value: 94.5 }, { age: 60, value: 100.5 },
  ],
  zScoreNeg2: [
    { age: 0, value: 45.4 }, { age: 3, value: 54.5 }, { age: 6, value: 60.0 },
    { age: 9, value: 64.5 }, { age: 12, value: 68.0 }, { age: 18, value: 73.5 },
    { age: 24, value: 78.5 }, { age: 30, value: 82.5 }, { age: 36, value: 85.5 },
    { age: 48, value: 91.5 }, { age: 60, value: 97.0 },
  ],
  zScoreNeg3: [
    { age: 0, value: 43.6 }, { age: 3, value: 52.5 }, { age: 6, value: 58.0 },
    { age: 9, value: 62.5 }, { age: 12, value: 66.0 }, { age: 18, value: 71.5 },
    { age: 24, value: 76.5 }, { age: 30, value: 80.0 }, { age: 36, value: 83.0 },
    { age: 48, value: 88.5 }, { age: 60, value: 93.5 },
  ],
}

// WHO BMI-for-age reference data (Girls 0-5 years, simplified)
export const whoBmiReference = {
  zScore3: [
    { age: 0, value: 17.0 }, { age: 6, value: 20.5 }, { age: 12, value: 20.0 },
    { age: 18, value: 19.5 }, { age: 24, value: 19.3 }, { age: 30, value: 19.0 },
    { age: 36, value: 18.8 }, { age: 48, value: 18.5 }, { age: 60, value: 18.5 },
  ],
  zScore2: [
    { age: 0, value: 15.5 }, { age: 6, value: 18.8 }, { age: 12, value: 18.5 },
    { age: 18, value: 18.0 }, { age: 24, value: 17.8 }, { age: 30, value: 17.5 },
    { age: 36, value: 17.3 }, { age: 48, value: 17.0 }, { age: 60, value: 17.0 },
  ],
  zScore1: [
    { age: 0, value: 14.0 }, { age: 6, value: 17.3 }, { age: 12, value: 17.0 },
    { age: 18, value: 16.5 }, { age: 24, value: 16.3 }, { age: 30, value: 16.0 },
    { age: 36, value: 15.8 }, { age: 48, value: 15.5 }, { age: 60, value: 15.5 },
  ],
  zScore0: [
    { age: 0, value: 13.0 }, { age: 6, value: 15.8 }, { age: 12, value: 15.5 },
    { age: 18, value: 15.0 }, { age: 24, value: 14.8 }, { age: 30, value: 14.5 },
    { age: 36, value: 14.3 }, { age: 48, value: 14.0 }, { age: 60, value: 14.0 },
  ],
  zScoreNeg1: [
    { age: 0, value: 12.0 }, { age: 6, value: 14.3 }, { age: 12, value: 14.0 },
    { age: 18, value: 13.5 }, { age: 24, value: 13.3 }, { age: 30, value: 13.0 },
    { age: 36, value: 12.8 }, { age: 48, value: 12.5 }, { age: 60, value: 12.5 },
  ],
  zScoreNeg2: [
    { age: 0, value: 11.0 }, { age: 6, value: 13.0 }, { age: 12, value: 12.8 },
    { age: 18, value: 12.3 }, { age: 24, value: 12.0 }, { age: 30, value: 11.8 },
    { age: 36, value: 11.5 }, { age: 48, value: 11.3 }, { age: 60, value: 11.3 },
  ],
  zScoreNeg3: [
    { age: 0, value: 10.0 }, { age: 6, value: 11.8 }, { age: 12, value: 11.5 },
    { age: 18, value: 11.0 }, { age: 24, value: 10.8 }, { age: 30, value: 10.5 },
    { age: 36, value: 10.3 }, { age: 48, value: 10.0 }, { age: 60, value: 10.0 },
  ],
}

// Development milestones for 3.5-5 years
export const milestones35to5: Milestone[] = [
  {
    id: "m1",
    name: "Emparelha cores",
    instruction: "Observe se a criança é capaz de emparelhar objetos da mesma cor, por exemplo cubos.",
    ageRangeMonths: [42, 60],
  },
  {
    id: "m2",
    name: "Copia círculos",
    instruction: "Forneça à criança um lápis e papel. Mostre a figura de um círculo e verifique se ela consegue desenhá-lo.",
    ageRangeMonths: [42, 60],
  },
  {
    id: "m3",
    name: "Fala clara e compreensível",
    instruction: "Durante a avaliação observe a inteligibilidade da fala (articulação e verbalização em sequência).",
    ageRangeMonths: [42, 60],
  },
  {
    id: "m4",
    name: "Pula em um pé só",
    instruction: "Demonstre e verifique se a criança consegue pular em um pé só, duas ou mais vezes, sem apoio.",
    ageRangeMonths: [42, 60],
  },
  {
    id: "m5",
    name: "Veste-se sem ajuda",
    instruction: "Pergunte aos cuidadores se a criança é capaz de se vestir sem alguma ajuda.",
    ageRangeMonths: [42, 60],
  },
  {
    id: "m6",
    name: "Escova dentes sem ajuda",
    instruction: "Pergunte se a criança escova os dentes sem ajuda, inclusive colocando pasta e usando fio dental.",
    ageRangeMonths: [42, 60],
  },
  {
    id: "m7",
    name: "Define 5 palavras",
    instruction: 'Verifique se a criança define cinco palavras. Faça perguntas tipo "O que é uma bola?".',
    ageRangeMonths: [42, 60],
  },
]

// Milestones for 0-3 months
export const milestones0to3: Milestone[] = [
  {
    id: "m0-1",
    name: "Fixa e acompanha objetos",
    instruction: "Observe se a criança fixa os olhos em um objeto e o acompanha com o olhar.",
    ageRangeMonths: [0, 3],
  },
  {
    id: "m0-2",
    name: "Reage ao som",
    instruction: "Observe se a criança reage a sons, virando a cabeça ou piscando os olhos.",
    ageRangeMonths: [0, 3],
  },
  {
    id: "m0-3",
    name: "Eleva a cabeça",
    instruction: "Observe se a criança consegue elevar a cabeça quando colocada de bruços.",
    ageRangeMonths: [0, 3],
  },
]

// Milestones for 3-6 months
export const milestones3to6: Milestone[] = [
  {
    id: "m3-1",
    name: "Responde ao carinho",
    instruction: "Observe se a criança sorri ou reage positivamente ao carinho.",
    ageRangeMonths: [3, 6],
  },
  {
    id: "m3-2",
    name: "Segura objetos",
    instruction: "Observe se a criança consegue segurar objetos com as mãos.",
    ageRangeMonths: [3, 6],
  },
  {
    id: "m3-3",
    name: "Emite sons",
    instruction: "Observe se a criança emite sons vocais como balbucios.",
    ageRangeMonths: [3, 6],
  },
]

// Milestones for 6-12 months
export const milestones6to12: Milestone[] = [
  {
    id: "m6-1",
    name: "Senta sem apoio",
    instruction: "Observe se a criança consegue sentar-se sem apoio por alguns segundos.",
    ageRangeMonths: [6, 12],
  },
  {
    id: "m6-2",
    name: "Transfere objetos entre mãos",
    instruction: "Observe se a criança consegue passar objetos de uma mão para a outra.",
    ageRangeMonths: [6, 12],
  },
  {
    id: "m6-3",
    name: "Duplica sílabas",
    instruction: "Observe se a criança fala sílabas duplicadas como 'mama' ou 'papa'.",
    ageRangeMonths: [6, 12],
  },
]

// Milestones for 1-2 years
export const milestones1to2: Milestone[] = [
  {
    id: "m12-1",
    name: "Anda sem apoio",
    instruction: "Observe se a criança consegue caminhar sozinha sem apoio.",
    ageRangeMonths: [12, 24],
  },
  {
    id: "m12-2",
    name: "Fala 3 palavras",
    instruction: "Pergunte aos cuidadores quantas palavras a criança fala com significado.",
    ageRangeMonths: [12, 24],
  },
  {
    id: "m12-3",
    name: "Identifica 2 objetos",
    instruction: "Peça à criança para apontar objetos conhecidos como bola, boneca, etc.",
    ageRangeMonths: [12, 24],
  },
]

// Milestone records (historical)
export const milestoneRecords: MilestoneRecord[] = [
  { milestoneId: "m1", consultationDate: "Out/2024", status: "confirmed" },
  { milestoneId: "m2", consultationDate: "Out/2024", status: "confirmed" },
  { milestoneId: "m3", consultationDate: "Mar/2025", status: "not-evaluated" },
  { milestoneId: "m4", consultationDate: "Jan/2025", status: "confirmed" },
  { milestoneId: "m5", consultationDate: "Jan/2025", status: "not-achieved" },
]

// M-CHAT-R questions
export const mchatQuestions: MChatQuestion[] = [
  { id: 1, question: "Se você apontar para algum objeto no quarto, o seu filho olha para este objeto?", inverted: false },
  { id: 2, question: "Alguma vez você se perguntou se o seu filho pode ser surdo?", inverted: true },
  { id: 3, question: "O seu filho brinca de faz de contas?", inverted: false },
  { id: 4, question: "O seu filho gosta de subir nas coisas?", inverted: false },
  { id: 5, question: "O seu filho faz movimentos estranhos com os dedos perto dos olhos?", inverted: true },
  { id: 6, question: "O seu filho aponta com o dedo para pedir algo ou para conseguir ajuda?", inverted: false },
  { id: 7, question: "O seu filho aponta com o dedo para mostrar algo interessante para você?", inverted: false },
  { id: 8, question: "O seu filho se interessa por outras crianças?", inverted: false },
  { id: 9, question: "O seu filho traz coisas para mostrar para você ou as segura para que você as veja — não para conseguir ajuda, mas apenas para compartilhar?", inverted: false },
  { id: 10, question: "O seu filho responde quando o chama pelo nome?", inverted: false },
  { id: 11, question: "Quando você sorri para o seu filho, ele sorri de volta para você?", inverted: false },
  { id: 12, question: "O seu filho fica muito incomodado com barulhos do dia a dia?", inverted: true },
  { id: 13, question: "O seu filho anda?", inverted: false },
  { id: 14, question: "O seu filho olha nos seus olhos quando você está falando ou brincando com ele?", inverted: false },
  { id: 15, question: "O seu filho tenta imitar o que você faz?", inverted: false },
  { id: 16, question: "Quando você vira a cabeça para olhar para alguma coisa, o seu filho olha ao redor para ver o que você está olhando?", inverted: false },
  { id: 17, question: "O seu filho tenta fazer você olhar para ele?", inverted: false },
  { id: 18, question: "O seu filho compreende quando você pede para ele fazer alguma coisa?", inverted: false },
  { id: 19, question: "Quando acontece algo novo, o seu filho olha para o seu rosto para ver como você se sente sobre o que aconteceu?", inverted: false },
  { id: 20, question: "O seu filho gosta de atividades de movimento?", inverted: false },
]

// Dashboard data
export const dashboardStats = {
  totalConsultations: 312,
  avgConsultationTime: 48,
  targetTime: 45,
  referralRate: 34,
  incompleteFormRate: 8,
}

export const consultationsByType = [
  { week: "Semana 1", retorno: 25, egresso: 12, internacao: 5, encaminhamento: 8 },
  { week: "Semana 2", retorno: 28, egresso: 10, internacao: 7, encaminhamento: 10 },
  { week: "Semana 3", retorno: 22, egresso: 15, internacao: 4, encaminhamento: 12 },
  { week: "Semana 4", retorno: 30, egresso: 11, internacao: 6, encaminhamento: 9 },
]

export const avgTimeByWeek = [
  { week: "Semana 1", avgTime: 45 },
  { week: "Semana 2", avgTime: 52 },
  { week: "Semana 3", avgTime: 47 },
  { week: "Semana 4", avgTime: 48 },
]

export const populationAlerts = [
  { patientId: "1", patient: "Ana Clara Souza", alert: "Peso abaixo P10 por 2 consultas", lastConsultation: "15/03/2025", categoria: "peso" as const },
  { patientId: "2", patient: "Pedro H. Lima", alert: "Marco motor nao confirmado (8m)", lastConsultation: "10/03/2025", categoria: "marco" as const },
  { patientId: "5", patient: "Sophia Oliveira", alert: "Encaminhamento sem retorno (67d)", lastConsultation: "01/03/2025", categoria: "encaminhamento" as const },
  { patientId: "6", patient: "Bernardo Costa", alert: "2 faltas consecutivas — Servico Social acionado", lastConsultation: "05/02/2025", categoria: "negligencia" as const },
  { patientId: "10", patient: "Felipe Nascimento", alert: "Falta sem reagendamento (30/03/2025)", lastConsultation: "15/02/2025", categoria: "falta" as const },
]

// Encaminhamentos por especialidade (Dashboard)
export const encaminhamentosPorEspecialidade = [
  { especialidade: "Gastroenterologia", encaminhados: 28, retornoConfirmado: 16, pendentes: 12 },
  { especialidade: "Neurologia",        encaminhados: 19, retornoConfirmado: 8,  pendentes: 11 },
  { especialidade: "Fonoaudiologia",    encaminhados: 15, retornoConfirmado: 11, pendentes: 4  },
  { especialidade: "Fisioterapia",      encaminhados: 12, retornoConfirmado: 9,  pendentes: 3  },
  { especialidade: "Psicologia",        encaminhados: 8,  retornoConfirmado: 3,  pendentes: 5  },
]

// CIDs mais frequentes (Dashboard)
export const cidsMaisFrequentes = [
  { codigo: "Z00.1", descricao: "Exame médico geral do lactente",        freq: 89 },
  { codigo: "J06.9", descricao: "Infecção aguda das vias aéreas sup.",   freq: 34 },
  { codigo: "J45",   descricao: "Asma",                                  freq: 28 },
  { codigo: "K59.0", descricao: "Obstipação",                            freq: 18 },
  { codigo: "F80",   descricao: "Transtornos do desenvolvimento da fala", freq: 12 },
]

// Consultation details for history view (indexed by date)
export interface ConsultationDetails {
  date: string
  type: EntryType
  patientId: string
  duration: string
  anthropometric?: {
    weight: number
    height: number
    headCircumference?: number
    bloodPressure?: string
    bmi?: number
  }
  anamnesis?: {
    queixaPrincipal?: string
    hda?: string
    alimentacao?: string
    habitos?: {
      sonoHoras?: number
      telaHoras?: number
      atividadeFisica?: string
    }
  }
  interrogatorioSintomatologico?: Array<{
    sistema: string
    alteracao: string
  }>
  imunizacoes?: {
    status: "completo" | "incompleto" | "atrasado"
    observacoes?: string
  }
  triagemNeonatal?: {
    idadeGestacional: number
    pesoNascimento: number
    testePezinho?: string
    testeOrelhinha?: string
    testeOlhinho?: string
    testeCoracaozinho?: string
  }
  escolaridade?: {
    frequentaEscola: boolean
    tipo?: string
    desempenho?: string
    observacoes?: string
  }
  exameFisico?: Array<{
    sistema: string
    status: "normal" | "alterado"
    descricao?: string
  }>
  marcos?: Array<{
    nome: string
    status: "confirmado" | "nao-confirmado" | "nao-avaliado"
  }>
  mchat?: {
    pontuacao: number
    risco: "baixo" | "medio" | "alto"
  }
  historiaFamiliar?: {
    antecedentes?: string[]
    observacoes?: string
  }
  dinamicaFamiliar?: {
    composicao?: string
    observacoes?: string
  }
  encaminhamentos?: Array<{
    especialidade: string
    prioridade: PrioridadeEncaminhamento
    justificativa: string
  }>
  diagnostico?: {
    cidPrincipal: string
    cidPrincipalDescricao: string
    cidsSecundarios?: Array<{ codigo: string; descricao: string }>
  }
  condutasHipoteses?: {
    hipoteses?: string
    condutas?: string
  }
  procedimentos?: Array<{
    nome: string
    quantidade: number
  }>
}

export const consultationDetailsMap: Record<string, ConsultationDetails> = {
  "Mar/2025": {
    date: "Mar/2025",
    type: "Retorno",
    patientId: "1",
    duration: "00:32",
    anthropometric: {
      weight: 11.2,
      height: 85,
      headCircumference: 47.5,
      bloodPressure: "90/60",
      bmi: 15.5,
    },
    anamnesis: {
      queixaPrincipal: "Mae refere que a crianca esta com dificuldade para ganhar peso",
      hda: "Ha cerca de 3 meses a mae percebeu que a crianca parou de ganhar peso. Nega vomitos, diarreia ou febre. Aceita bem a alimentacao oferecida. Sono e disposicao preservados.",
      alimentacao: "aleitamento-misto",
      habitos: {
        sonoHoras: 10,
        telaHoras: 2,
        atividadeFisica: "Brinca no parquinho 1x por semana",
      },
    },
    interrogatorioSintomatologico: [
      { sistema: "Gastrointestinal", alteracao: "Evacuacoes endurecidas 2x/semana" },
    ],
    imunizacoes: {
      status: "completo",
      observacoes: "Calendario PNI em dia",
    },
    exameFisico: [
      { sistema: "Cabeca e Pescoco", status: "normal" },
      { sistema: "Olhos", status: "normal" },
      { sistema: "Cardiovascular", status: "normal" },
      { sistema: "Respiratorio", status: "normal" },
      { sistema: "Abdomen", status: "alterado", descricao: "Distensao leve, RHA presentes" },
      { sistema: "Pele", status: "normal" },
      { sistema: "Neurologico", status: "normal" },
    ],
    marcos: [
      { nome: "Corre bem", status: "confirmado" },
      { nome: "Sobe escadas alternando pes", status: "confirmado" },
      { nome: "Fala frases de 3 palavras", status: "confirmado" },
    ],
    encaminhamentos: [
      {
        especialidade: "Gastroenterologia",
        prioridade: "Eletivo",
        justificativa: "Investigacao de baixo ganho ponderal e constipacao",
      },
    ],
    diagnostico: {
      cidPrincipal: "Z00.1",
      cidPrincipalDescricao: "Exame medico geral do lactente",
      cidsSecundarios: [
        { codigo: "K59.0", descricao: "Obstipacao" },
      ],
    },
    condutasHipoteses: {
      hipoteses: "Baixo ganho ponderal a esclarecer. Constipacao funcional.",
      condutas: "Orientacao alimentar com aumento de fibras e hidratacao. Retorno em 30 dias com exames laboratoriais.",
    },
    procedimentos: [
      { nome: "Consulta de puericultura", quantidade: 1 },
    ],
  },
  "Jan/2025": {
    date: "Jan/2025",
    type: "Egresso",
    patientId: "1",
    duration: "00:45",
    anthropometric: {
      weight: 11.5,
      height: 84,
      bmi: 16.3,
    },
    anamnesis: {
      queixaPrincipal: "Retorno pos-alta hospitalar",
      hda: "Crianca foi internada por 5 dias devido a pneumonia. Recebeu alta com prescricao de amoxicilina por mais 5 dias. Mae refere que a crianca esta bem, sem febre, tosse residual leve.",
      alimentacao: "dieta-familia",
    },
    imunizacoes: {
      status: "completo",
    },
    exameFisico: [
      { sistema: "Respiratorio", status: "alterado", descricao: "MV presente bilateralmente, estertores finos em base D em resolucao" },
      { sistema: "Cardiovascular", status: "normal" },
    ],
    diagnostico: {
      cidPrincipal: "J18.9",
      cidPrincipalDescricao: "Pneumonia nao especificada (em resolucao)",
    },
    condutasHipoteses: {
      condutas: "Manter antibiotico ate completar 10 dias. Retorno em 15 dias para reavaliacao.",
    },
  },
  "Out/2024": {
    date: "Out/2024",
    type: "Retorno",
    patientId: "1",
    duration: "00:28",
    anthropometric: {
      weight: 10.8,
      height: 82,
      bmi: 16.1,
    },
    anamnesis: {
      queixaPrincipal: "Consulta de rotina",
      alimentacao: "introducao-alimentar",
    },
    imunizacoes: {
      status: "completo",
    },
    exameFisico: [
      { sistema: "Cabeca e Pescoco", status: "normal" },
      { sistema: "Cardiovascular", status: "normal" },
      { sistema: "Respiratorio", status: "normal" },
      { sistema: "Abdomen", status: "normal" },
      { sistema: "Neurologico", status: "normal" },
    ],
    marcos: [
      { nome: "Anda sozinho", status: "confirmado" },
      { nome: "Fala 5-10 palavras", status: "confirmado" },
    ],
    diagnostico: {
      cidPrincipal: "Z00.1",
      cidPrincipalDescricao: "Exame medico geral do lactente",
    },
    condutasHipoteses: {
      condutas: "Desenvolvimento adequado para idade. Retorno em 3 meses.",
    },
  },
}

export function getConsultationDetails(date: string): ConsultationDetails | undefined {
  return consultationDetailsMap[date]
}
