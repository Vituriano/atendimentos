import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import type { EntradaFila } from '../types/clinica'
import { usePacienteStore, mockPacientes } from './paciente'

const mockEntradas: EntradaFila[] = [
  { id: 'fila-001', horario: '08:15', paciente: mockPacientes[0], tipoEntrada: 'Retorno', status: 'Em Atendimento', tempoEspera: '45 min' },
  { id: 'fila-002', horario: '08:30', paciente: mockPacientes[1], tipoEntrada: 'Egresso', status: 'Aguardando', tempoEspera: '28 min', faltas: 2 },
  { id: 'fila-003', horario: '09:00', paciente: mockPacientes[2], tipoEntrada: 'Encaminhamento Externo', status: 'Aguardando', tempoEspera: '12 min' },
  { id: 'fila-004', horario: '09:20', paciente: mockPacientes[3], tipoEntrada: 'Retorno', status: 'Agendado', tempoEspera: null },
  { id: 'fila-005', horario: '09:45', paciente: mockPacientes[4], tipoEntrada: 'Internacao', status: 'Pendente', tempoEspera: '67 min', faltas: 1 },
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
    router.push(`/briefing?source=fila&patientId=${entrada.paciente.id}`)
  }

  function iniciarConsulta(entrada: EntradaFila) {
    pacienteStore.selecionarPaciente({ ...entrada.paciente, tipoEntrada: entrada.tipoEntrada }, 'consulta')
    router.push('/consulta')
  }

  function concluirConsulta(pacienteId: string) {
    const entrada = entradas.value.find(e => e.paciente.id === pacienteId)
    if (entrada) entrada.status = 'Finalizado'
  }

  return { entradas, stats, verBriefing, iniciarConsulta, concluirConsulta }
})
