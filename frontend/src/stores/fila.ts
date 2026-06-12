import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import type { EntradaFila } from '../types/clinica'
import { usePacienteStore } from './paciente'

const mockEntradas: EntradaFila[] = [
  {
    id: 'fila-001',
    horario: '08:00',
    paciente: {
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
          ],
        },
      ],
    },
    tipoEntrada: 'Retorno',
    status: 'Aguardando',
    tempoEspera: '45 min',
    faltas: 0,
  },
  {
    id: 'fila-002',
    horario: '08:30',
    paciente: {
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
          ],
        },
      ],
    },
    tipoEntrada: 'Encaminhamento Externo',
    status: 'Em Atendimento',
    tempoEspera: '12 min',
    faltas: 1,
  },
  {
    id: 'fila-003',
    horario: '09:00',
    paciente: {
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
          ],
        },
      ],
    },
    tipoEntrada: 'Retorno',
    status: 'Finalizado',
    tempoEspera: null,
    faltas: 0,
  },
  {
    id: 'fila-004',
    horario: '09:30',
    paciente: {
      id: '4',
      nome: 'Lucas Oliveira Santos',
      dataNascimento: '05/09/2021',
      idade: '4 anos e 8 meses',
      idadeEmMeses: 56,
      prontuario: 'HC-2021-00389',
      prontuarioPrimario: 'HC-2021-00389',
      cpf: '456.789.012-43',
      prontuarios: [
        {
          numero: 'HC-2021-00389',
          dataAbertura: '05/09/2021',
          consultas: [],
        },
      ],
    },
    tipoEntrada: 'Retorno',
    status: 'Aguardando',
    tempoEspera: '30 min',
    faltas: 2,
  },
  {
    id: 'fila-005',
    horario: '10:00',
    paciente: {
      id: '5',
      nome: 'Sofia Mendes Costa',
      dataNascimento: '12/11/2023',
      idade: '2 anos e 6 meses',
      idadeEmMeses: 30,
      prontuario: 'HC-2023-00912',
      prontuarioPrimario: 'HC-2023-00912',
      cpf: '567.890.123-54',
      prontuarios: [
        {
          numero: 'HC-2023-00912',
          dataAbertura: '12/11/2023',
          consultas: [],
        },
      ],
    },
    tipoEntrada: 'Egresso',
    status: 'Aguardando',
    tempoEspera: '10 min',
    faltas: 0,
  },
]

export const useFilaStore = defineStore('fila', () => {
  const router = useRouter()
  const pacienteStore = usePacienteStore()

  const entradas = ref<EntradaFila[]>(mockEntradas)

  const stats = computed(() => ({
    total: entradas.value.length,
    aguardando: entradas.value.filter(e => e.status === 'Aguardando').length,
    emAtendimento: entradas.value.filter(e => e.status === 'Em Atendimento').length,
    concluidos: entradas.value.filter(e => e.status === 'Finalizado').length,
  }))

  function verBriefing(entrada: EntradaFila) {
    pacienteStore.selecionarPaciente(entrada.paciente, 'leitura')
    router.push('/briefing')
  }

  function iniciarConsulta(entrada: EntradaFila) {
    pacienteStore.selecionarPaciente(entrada.paciente, 'consulta')
    router.push('/consulta')
  }

  return { entradas, stats, verBriefing, iniciarConsulta }
})
