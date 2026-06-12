import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Paciente, Consulta, AlertaClinico, DadosAntropometricos } from '../types/clinica'

export const mockPacientes: Paciente[] = [
  {
    id: '1',
    nome: 'Ana Clara Souza',
    dataNascimento: '10/01/2024',
    idade: '2 anos e 3 meses',
    idadeEmMeses: 27,
    prontuario: 'HC-2024-00847',
    prontuarioPrimario: 'HC-2024-00847',
    cpf: '123.456.789-10',
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
    dataNascimento: '15/07/2025',
    idade: '8 meses',
    idadeEmMeses: 8,
    prontuario: 'HC-2025-01234',
    prontuarioPrimario: 'HC-2025-01234',
    cpf: '234.567.890-21',
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
    dataNascimento: '20/04/2022',
    idade: '4 anos',
    idadeEmMeses: 48,
    prontuario: 'HC-2022-00567',
    prontuarioPrimario: 'HC-2022-00567',
    cpf: '345.678.901-32',
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
    nome: 'Miguel Santos',
    dataNascimento: '10/04/2025',
    idade: '1 ano',
    idadeEmMeses: 12,
    prontuario: 'HC-2025-00890',
    prontuarioPrimario: 'HC-2025-00890',
    cpf: '456.789.012-43',
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
    dataNascimento: '24/04/2023',
    idade: '3 anos',
    idadeEmMeses: 36,
    prontuario: 'HC-2023-00445',
    prontuarioPrimario: 'HC-2023-00445',
    cpf: '567.890.123-54',
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
