import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Paciente, Consulta, AlertaClinico, DadosAntropometricos } from '../types/clinica'

export const mockPacientes: Paciente[] = [
  {
    id: '1',
    nome: 'Ana Clara Souza',
    nomeMae: 'Sandra Souza',
    nomePai: 'Roberto Souza',
    dataNascimento: '10/01/2024',
    idade: '2 anos e 5 meses',
    idadeEmMeses: 29,
    sexo: 'F',
    sexoBiologico: 'F',
    cor: 'PARDA',
    prontuario: '10000016',
    prontuarioPrimario: '10000016',

    especialidade: 'PEDIATRIA GERAL',
    indOrigem: 'R',
    prontuarios: [
      {
        numero: 'HC-2024-00847',
        dataAbertura: '10/01/2024',
        consultas: [
          { id: 'c1-1', data: 'Mar/2025', tipo: 'Retorno', peso: 11.2, tendenciaPeso: 'down', cid: 'Z00.1', encaminhamento: 'Gastroenterologia' },
          { id: 'c1-2', data: 'Fev/2025', tipo: 'externo', servicoOrigem: 'UBS Mangueira', peso: 10.9, tendenciaPeso: 'down', cid: null, encaminhamento: null, isExterno: true },
          { id: 'c1-3', data: 'Jan/2025', tipo: 'Egresso', peso: 11.5, tendenciaPeso: 'stable', cid: null, encaminhamento: null },
          { id: 'c1-4', data: 'Out/2024', tipo: 'Retorno', peso: 10.8, tendenciaPeso: 'up', cid: 'J06.9', encaminhamento: null },
          { id: 'c1-5', data: 'Jul/2024', tipo: 'Retorno', peso: 10.2, tendenciaPeso: 'up', cid: 'Z00.1', encaminhamento: null },
        ],
      },
      {
        numero: 'HC-2022-00231',
        dataAbertura: '05/03/2022',
        consultas: [
          { id: 'c1-6', data: 'Dez/2023', tipo: 'Retorno', peso: 9.5, tendenciaPeso: 'up', cid: 'Z00.1', encaminhamento: null },
        ],
      },
    ],
  },
  {
    id: '2',
    nome: 'Pedro Henrique Lima',
    nomeMae: 'Fatima Lima',
    nomePai: 'Jorge Lima',
    dataNascimento: '15/07/2025',
    idade: '11 meses',
    idadeEmMeses: 11,
    sexo: 'M',
    sexoBiologico: 'M',
    cor: 'BRANCA',
    prontuario: '10000217',
    prontuarioPrimario: '10000217',
    especialidade: 'NEUROPEDIATRIA',
    indOrigem: 'EC',
    prontuarios: [
      {
        numero: 'HC-2025-01234',
        dataAbertura: '15/07/2025',
        consultas: [
          { id: 'c2-1', data: 'Mai/2026', tipo: 'Retorno', peso: 8.5, tendenciaPeso: 'up', cid: 'Z00.1', encaminhamento: null },
          { id: 'c2-2', data: 'Mar/2026', tipo: 'Retorno', peso: 7.8, tendenciaPeso: 'up', cid: 'Z00.1', encaminhamento: null },
        ],
      },
    ],
  },
  {
    id: '3',
    nome: 'Isabela Ferreira',
    nomeMae: 'Lucia Ferreira',
    nomePai: 'Carlos Ferreira',
    dataNascimento: '20/04/2022',
    idade: '4 anos e 2 meses',
    idadeEmMeses: 50,
    sexo: 'F',
    sexoBiologico: 'F',
    cor: 'PRETA',
    prontuario: '10000334',
    prontuarioPrimario: '10000334',
    especialidade: 'PEDIATRIA GERAL',
    indOrigem: 'R',
    prontuarios: [
      {
        numero: 'HC-2022-00567',
        dataAbertura: '20/04/2022',
        consultas: [
          { id: 'c3-1', data: 'Abr/2026', tipo: 'Retorno', peso: 16.2, tendenciaPeso: 'stable', cid: 'Z00.1', encaminhamento: null },
          { id: 'c3-2', data: 'Jan/2026', tipo: 'Retorno', peso: 15.8, tendenciaPeso: 'up', cid: 'J06.9', encaminhamento: 'Otorrinolaringologia' },
          { id: 'c3-3', data: 'Out/2025', tipo: 'Retorno', peso: 15.3, tendenciaPeso: 'up', cid: 'Z00.1', encaminhamento: null },
        ],
      },
    ],
  },
  {
    id: '4',
    nome: 'Miguel dos Santos',
    nomeMae: 'Maria Santos',
    nomePai: 'Paulo Santos',
    dataNascimento: '10/04/2025',
    idade: '1 ano e 2 meses',
    idadeEmMeses: 14,
    sexo: 'M',
    sexoBiologico: 'M',
    cor: 'PARDA',
    prontuario: '10000445',
    prontuarioPrimario: '10000445',
    especialidade: 'CARDIOLOGIA PEDIATRICA',
    indOrigem: 'E',
    prontuarios: [
      {
        numero: 'HC-2025-00890',
        dataAbertura: '10/04/2025',
        consultas: [
          { id: 'c4-1', data: 'Abr/2026', tipo: 'Retorno', peso: 10.1, tendenciaPeso: 'up', cid: 'Z00.1', encaminhamento: null },
          { id: 'c4-2', data: 'Jan/2026', tipo: 'Retorno', peso: 9.2, tendenciaPeso: 'up', cid: 'Z00.1', encaminhamento: null },
        ],
      },
    ],
  },
  {
    id: '5',
    nome: 'Sophia Oliveira',
    nomeMae: 'Claudia Oliveira',
    nomePai: 'Marcelo Oliveira',
    dataNascimento: '24/04/2023',
    idade: '3 anos',
    idadeEmMeses: 36,
    sexo: 'F',
    sexoBiologico: 'F',
    cor: 'BRANCA',
    prontuario: 'HC-2023-00445',
    prontuarioPrimario: 'HC-2023-00445',
    cpf: '567.890.123-54',
    especialidade: 'PNEUMOLOGIA PEDIATRICA',
    indOrigem: 'R',
    prontuarios: [
      {
        numero: 'HC-2023-00445',
        dataAbertura: '24/04/2023',
        consultas: [
          { id: 'c5-1', data: 'Mai/2026', tipo: 'Retorno', peso: 14.5, tendenciaPeso: 'stable', cid: 'Z00.1', encaminhamento: null },
          { id: 'c5-2', data: 'Fev/2026', tipo: 'Retorno', peso: 14.2, tendenciaPeso: 'up', cid: 'Z00.1', encaminhamento: null },
          { id: 'c5-3', data: 'Nov/2025', tipo: 'Retorno', peso: 13.8, tendenciaPeso: 'up', cid: 'J20.9', encaminhamento: 'Pneumologia' },
        ],
      },
      {
        numero: 'HC-2021-00789',
        dataAbertura: '15/06/2021',
        consultas: [
          { id: 'c5-4', data: 'Abr/2023', tipo: 'Retorno', peso: 11.5, tendenciaPeso: 'up', cid: 'Z00.1', encaminhamento: null },
          { id: 'c5-5', data: 'Jan/2023', tipo: 'Retorno', peso: 10.8, tendenciaPeso: 'up', cid: 'Z00.1', encaminhamento: null },
        ],
      },
    ],
  },
  {
    id: '6',
    nome: 'Bernardo Costa',
    dataNascimento: '05/08/2024',
    idade: '1 ano e 9 meses',
    idadeEmMeses: 21,
    prontuario: 'HC-2024-01123',
    prontuarioPrimario: 'HC-2024-01123',
    cpf: '678.901.234-65',
    prontuarios: [
      {
        numero: 'HC-2024-01123',
        dataAbertura: '05/08/2024',
        consultas: [
          { id: 'c6-1', data: 'Mai/2026', tipo: 'Retorno', peso: 12.0, tendenciaPeso: 'up', cid: 'Z00.1', encaminhamento: null },
          { id: 'c6-2', data: 'Fev/2026', tipo: 'Retorno', peso: 11.5, tendenciaPeso: 'up', cid: 'Z00.1', encaminhamento: null },
        ],
      },
    ],
  },
  {
    id: '7',
    nome: 'Camila Rodrigues',
    dataNascimento: '18/12/2021',
    idade: '4 anos e 5 meses',
    idadeEmMeses: 53,
    prontuario: 'HC-2021-00892',
    prontuarioPrimario: 'HC-2021-00892',
    cpf: '789.012.345-76',
    prontuarios: [
      {
        numero: 'HC-2021-00892',
        dataAbertura: '18/12/2021',
        consultas: [
          { id: 'c7-1', data: 'Mai/2026', tipo: 'Retorno', peso: 17.5, tendenciaPeso: 'stable', cid: 'Z00.1', encaminhamento: null },
          { id: 'c7-2', data: 'Fev/2026', tipo: 'Retorno', peso: 17.2, tendenciaPeso: 'up', cid: 'Z00.1', encaminhamento: null },
        ],
      },
    ],
  },
  {
    id: '8',
    nome: 'Davi Almeida',
    dataNascimento: '30/03/2025',
    idade: '1 ano e 2 meses',
    idadeEmMeses: 14,
    prontuario: 'HC-2025-00234',
    prontuarioPrimario: 'HC-2025-00234',
    cpf: '890.123.456-87',
    prontuarios: [
      {
        numero: 'HC-2025-00234',
        dataAbertura: '30/03/2025',
        consultas: [
          { id: 'c8-1', data: 'Mai/2026', tipo: 'Retorno', peso: 10.8, tendenciaPeso: 'up', cid: 'Z00.1', encaminhamento: null },
        ],
      },
    ],
  },
  {
    id: '9',
    nome: 'Eduarda Martins',
    dataNascimento: '12/06/2023',
    idade: '2 anos e 11 meses',
    idadeEmMeses: 35,
    prontuario: 'HC-2023-00678',
    prontuarioPrimario: 'HC-2023-00678',
    cpf: '901.234.567-98',
    prontuarios: [
      {
        numero: 'HC-2023-00678',
        dataAbertura: '12/06/2023',
        consultas: [
          { id: 'c9-1', data: 'Mai/2026', tipo: 'Retorno', peso: 13.5, tendenciaPeso: 'stable', cid: 'Z00.1', encaminhamento: null },
          { id: 'c9-2', data: 'Fev/2026', tipo: 'Retorno', peso: 13.2, tendenciaPeso: 'up', cid: 'K59.0', encaminhamento: 'Gastroenterologia' },
        ],
      },
    ],
  },
  {
    id: '10',
    nome: 'Felipe Nascimento',
    dataNascimento: '25/09/2022',
    idade: '3 anos e 8 meses',
    idadeEmMeses: 44,
    prontuario: 'HC-2022-01345',
    prontuarioPrimario: 'HC-2022-01345',
    cpf: '012.345.678-09',
    prontuarios: [
      {
        numero: 'HC-2022-01345',
        dataAbertura: '25/09/2022',
        consultas: [
          { id: 'c10-1', data: 'Abr/2026', tipo: 'Retorno', peso: 15.8, tendenciaPeso: 'up', cid: 'Z00.1', encaminhamento: null },
        ],
      },
    ],
  },
  {
    id: '11',
    nome: 'Giovanna Pereira',
    dataNascimento: '08/02/2024',
    idade: '2 anos e 3 meses',
    idadeEmMeses: 27,
    prontuario: 'HC-2024-00456',
    prontuarioPrimario: 'HC-2024-00456',
    cpf: '111.222.333-44',
    prontuarios: [
      {
        numero: 'HC-2024-00456',
        dataAbertura: '08/02/2024',
        consultas: [
          { id: 'c11-1', data: 'Mai/2026', tipo: 'Retorno', peso: 12.3, tendenciaPeso: 'up', cid: 'Z00.1', encaminhamento: null },
          { id: 'c11-2', data: 'Fev/2026', tipo: 'Retorno', peso: 11.8, tendenciaPeso: 'up', cid: 'Z00.1', encaminhamento: null },
        ],
      },
    ],
  },
  {
    id: '12',
    nome: 'Henrique Barbosa',
    dataNascimento: '14/11/2023',
    idade: '2 anos e 6 meses',
    idadeEmMeses: 30,
    prontuario: 'HC-2023-01567',
    prontuarioPrimario: 'HC-2023-01567',
    cpf: '222.333.444-55',
    prontuarios: [
      {
        numero: 'HC-2023-01567',
        dataAbertura: '14/11/2023',
        consultas: [
          { id: 'c12-1', data: 'Mai/2026', tipo: 'Retorno', peso: 13.1, tendenciaPeso: 'stable', cid: 'Z00.1', encaminhamento: null },
        ],
      },
    ],
  },
  {
    id: '13',
    nome: 'Isadora Ramos',
    dataNascimento: '03/07/2025',
    idade: '10 meses',
    idadeEmMeses: 10,
    prontuario: 'HC-2025-00789',
    prontuarioPrimario: 'HC-2025-00789',
    cpf: '333.444.555-66',
    prontuarios: [
      {
        numero: 'HC-2025-00789',
        dataAbertura: '03/07/2025',
        consultas: [
          { id: 'c13-1', data: 'Mai/2026', tipo: 'Retorno', peso: 9.2, tendenciaPeso: 'up', cid: 'Z00.1', encaminhamento: null },
        ],
      },
    ],
  },
  {
    id: '14',
    nome: 'João Gabriel Teixeira',
    dataNascimento: '21/01/2022',
    idade: '4 anos e 4 meses',
    idadeEmMeses: 52,
    prontuario: 'HC-2022-00234',
    prontuarioPrimario: 'HC-2022-00234',
    cpf: '444.555.666-77',
    prontuarios: [
      {
        numero: 'HC-2022-00234',
        dataAbertura: '21/01/2022',
        consultas: [
          { id: 'c14-1', data: 'Mai/2026', tipo: 'Retorno', peso: 18.0, tendenciaPeso: 'stable', cid: 'Z00.1', encaminhamento: null },
          { id: 'c14-2', data: 'Fev/2026', tipo: 'Retorno', peso: 17.5, tendenciaPeso: 'up', cid: 'H65.9', encaminhamento: 'Otorrinolaringologia' },
        ],
      },
    ],
  },
  {
    id: '15',
    nome: 'Larissa Fernandes',
    dataNascimento: '09/05/2024',
    idade: '2 anos',
    idadeEmMeses: 24,
    prontuario: 'HC-2024-01890',
    prontuarioPrimario: 'HC-2024-01890',
    cpf: '555.666.777-88',
    prontuarios: [
      {
        numero: 'HC-2024-01890',
        dataAbertura: '09/05/2024',
        consultas: [
          { id: 'c15-1', data: 'Mai/2026', tipo: 'Retorno', peso: 11.5, tendenciaPeso: 'up', cid: 'Z00.1', encaminhamento: null },
        ],
      },
    ],
  },
  {
    id: '16',
    nome: 'Matheus Gonçalves',
    dataNascimento: '16/10/2023',
    idade: '2 anos e 7 meses',
    idadeEmMeses: 31,
    prontuario: 'HC-2023-00912',
    prontuarioPrimario: 'HC-2023-00912',
    cpf: '666.777.888-99',
    prontuarios: [
      {
        numero: 'HC-2023-00912',
        dataAbertura: '16/10/2023',
        consultas: [
          { id: 'c16-1', data: 'Mai/2026', tipo: 'Retorno', peso: 13.8, tendenciaPeso: 'up', cid: 'Z00.1', encaminhamento: null },
        ],
      },
    ],
  },
  {
    id: '17',
    nome: 'Natália Cardoso',
    dataNascimento: '28/04/2025',
    idade: '1 ano e 1 mês',
    idadeEmMeses: 13,
    prontuario: 'HC-2025-01456',
    prontuarioPrimario: 'HC-2025-01456',
    cpf: '777.888.999-00',
    prontuarios: [
      {
        numero: 'HC-2025-01456',
        dataAbertura: '28/04/2025',
        consultas: [
          { id: 'c17-1', data: 'Mai/2026', tipo: 'Retorno', peso: 9.8, tendenciaPeso: 'up', cid: 'Z00.1', encaminhamento: null },
        ],
      },
    ],
  },
  {
    id: '18',
    nome: 'Otávio Ribeiro',
    dataNascimento: '07/08/2022',
    idade: '3 anos e 9 meses',
    idadeEmMeses: 45,
    prontuario: 'HC-2022-01678',
    prontuarioPrimario: 'HC-2022-01678',
    cpf: '888.999.000-11',
    prontuarios: [
      {
        numero: 'HC-2022-01678',
        dataAbertura: '07/08/2022',
        consultas: [
          { id: 'c18-1', data: 'Mai/2026', tipo: 'Retorno', peso: 16.2, tendenciaPeso: 'stable', cid: 'Z00.1', encaminhamento: null },
        ],
      },
    ],
  },
  {
    id: '19',
    nome: 'Patrícia Mendes',
    dataNascimento: '19/12/2024',
    idade: '1 ano e 5 meses',
    idadeEmMeses: 17,
    prontuario: 'HC-2024-02345',
    prontuarioPrimario: 'HC-2024-02345',
    cpf: '999.000.111-22',
    prontuarios: [
      {
        numero: 'HC-2024-02345',
        dataAbertura: '19/12/2024',
        consultas: [
          { id: 'c19-1', data: 'Mai/2026', tipo: 'Retorno', peso: 10.5, tendenciaPeso: 'up', cid: 'Z00.1', encaminhamento: null },
        ],
      },
    ],
  },
  {
    id: '20',
    nome: 'Rafael Carvalho',
    dataNascimento: '02/03/2023',
    idade: '3 anos e 2 meses',
    idadeEmMeses: 38,
    prontuario: 'HC-2023-01234',
    prontuarioPrimario: 'HC-2023-01234',
    cpf: '100.200.300-40',
    prontuarios: [
      {
        numero: 'HC-2023-01234',
        dataAbertura: '02/03/2023',
        consultas: [
          { id: 'c20-1', data: 'Mai/2026', tipo: 'Retorno', peso: 14.8, tendenciaPeso: 'up', cid: 'Z00.1', encaminhamento: null },
        ],
      },
    ],
  },
]

export function getPacienteById(id: string): Paciente | undefined {
  return mockPacientes.find(p => p.id === id)
}

const mockAlertas: Record<string, AlertaClinico[]> = {
  '1': [
    { id: 'a1', tipo: 'critico', categoria: 'peso', mensagem: 'Perda de peso nas últimas 2 consultas' },
    { id: 'a2', tipo: 'atencao', categoria: 'marco', mensagem: 'Marco de linguagem não avaliado na última consulta' },
  ],
  '2': [
    { id: 'a3', tipo: 'atencao', categoria: 'encaminhamento', mensagem: 'Retorno de Neurologia pendente há 3 meses' },
  ],
  '3': [],
  '4': [],
  '5': [
    { id: 'a4', tipo: 'atencao', categoria: 'encaminhamento', mensagem: 'Retorno de Pneumologia pendente há 45 dias' },
  ],
}

const mockAntropometria: Record<string, DadosAntropometricos> = {
  '1': { peso: 11.2, percentilPeso: 'p15', altura: 85.0, percentilAltura: 'p25', perimetroCefalico: null, imc: 15.5 },
  '2': { peso: 8.5, percentilPeso: 'p50', altura: 70.0, percentilAltura: 'p50', perimetroCefalico: 44.0, imc: 17.3 },
  '3': { peso: 16.2, percentilPeso: 'p50', altura: 102.0, percentilAltura: 'p50', perimetroCefalico: null, imc: 15.6 },
  '4': { peso: 10.1, percentilPeso: 'p50', altura: 76.0, percentilAltura: 'p50', perimetroCefalico: 46.0, imc: 17.5 },
  '5': { peso: 14.5, percentilPeso: 'p50', altura: 96.0, percentilAltura: 'p50', perimetroCefalico: null, imc: 15.7 },
}

export const usePacienteStore = defineStore('paciente', () => {
  const pacienteAtivo = ref<Paciente | null>(null)
  const historico = ref<Consulta[]>([])
  const alertas = ref<AlertaClinico[]>([])
  const antropometria = ref<DadosAntropometricos | null>(null)
  const modoLeitura = ref(false)

  const temPacienteAtivo = computed(() => !!pacienteAtivo.value)
  const idadeEmMeses = computed(() => pacienteAtivo.value?.idadeEmMeses ?? 0)

  function selecionarPaciente(paciente: Paciente, modo: 'consulta' | 'leitura') {
    pacienteAtivo.value = paciente
    modoLeitura.value = modo === 'leitura'
    historico.value = paciente.prontuarios?.flatMap(p => p.consultas) ?? []
    alertas.value = mockAlertas[paciente.id] ?? []
    antropometria.value = mockAntropometria[paciente.id] ?? null
  }

  function limparPaciente() {
    pacienteAtivo.value = null
    historico.value = []
    alertas.value = []
    antropometria.value = null
    modoLeitura.value = false
  }

  function setHistorico(consultas: Consulta[]) {
    historico.value = consultas
  }

  function setAlertas(novosAlertas: AlertaClinico[]) {
    alertas.value = novosAlertas
  }

  return {
    pacienteAtivo,
    historico,
    alertas,
    antropometria,
    modoLeitura,
    temPacienteAtivo,
    idadeEmMeses,
    mockPacientes,
    selecionarPaciente,
    limparPaciente,
    setHistorico,
    setAlertas,
  }
})
