import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import type { EntradaFila, Paciente, TipoEntrada, StatusFila } from '../types/clinica'
import { usePacienteStore } from './paciente'
import api from '../services/api'

const TIPOS_ENTRADA_VALIDOS = new Set<TipoEntrada>(['Retorno', 'Egresso', 'Encaminhamento Externo', 'Internacao'])

function mapTipoEntrada(valor: string): TipoEntrada {
  return TIPOS_ENTRADA_VALIDOS.has(valor as TipoEntrada) ? (valor as TipoEntrada) : 'Retorno'
}

function mapEntrada(item: Record<string, unknown>): EntradaFila {
  const dataEntrada = item.data_entrada ? new Date(item.data_entrada as string) : null
  const horario = dataEntrada
    ? dataEntrada.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : '--:--'

  const paciente: Paciente = {
    id: String(item.paciente_id ?? ''),
    nome: String(item.paciente_nome ?? ''),
    dataNascimento: '',
    idade: item.paciente_idade ? `${item.paciente_idade} anos` : '',
    idadeEmMeses: typeof item.paciente_idade === 'number' ? item.paciente_idade * 12 : 0,
    prontuario: String(item.paciente_id ?? ''),
  }

  return {
    id: String(item.id ?? ''),
    horario,
    paciente,
    tipoEntrada: mapTipoEntrada(String(item.tipo_entrada ?? '')),
    status: (item.status as StatusFila) ?? 'Aguardando',
    faltas: typeof item.faltas === 'number' ? item.faltas : 0,
    tempoEspera: item.tempo_espera ? String(item.tempo_espera) : null,
  }
}

export const useFilaStore = defineStore('fila', () => {
  const router = useRouter()
  const pacienteStore = usePacienteStore()
  const toast = useToast()

  const entradas = ref<EntradaFila[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const stats = computed(() => ({
    total: entradas.value.length,
    aguardando: entradas.value.filter(e => e.status === 'Aguardando').length,
    emAtendimento: entradas.value.filter(e => e.status === 'Em Atendimento').length,
    concluidos: entradas.value.filter(e => e.status === 'Finalizado').length,
  }))

  async function carregarFila() {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await api.get<Record<string, unknown>[]>('/api/fila')
      entradas.value = data.map(mapEntrada)
    } catch {
      error.value = 'Erro ao carregar a fila de atendimento.'
      toast.error(error.value)
    } finally {
      isLoading.value = false
    }
  }

  async function atualizarStatus(id: string, status: string) {
    try {
      await api.patch(`/api/fila/${id}/status`, { status })
      await carregarFila()
    } catch {
      toast.error('Erro ao atualizar status do paciente.')
    }
  }

  function verBriefing(entrada: EntradaFila) {
    pacienteStore.selecionarPaciente(entrada.paciente, 'leitura')
    router.push(`/briefing?source=fila&patientId=${entrada.paciente.id}`)
  }

  function iniciarConsulta(entrada: EntradaFila) {
    pacienteStore.selecionarPaciente({ ...entrada.paciente, tipoEntrada: entrada.tipoEntrada }, 'consulta')
    router.push('/consulta')
  }

  return { entradas, stats, isLoading, error, carregarFila, atualizarStatus, verBriefing, iniciarConsulta }
})
