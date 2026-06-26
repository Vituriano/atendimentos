import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import type { Paciente, Consulta, AlertaClinico, DadosAntropometricos } from '../types/clinica'
import { getAntropometriaRangePaciente } from '../data/antropometria-ranges'
import api from '../services/api'

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function formatarDataConsulta(isoDate: string): string {
  const d = new Date(isoDate)
  return `${MESES[d.getMonth()]}/${d.getFullYear()}`
}

function classificarFaixa(valor: number, min: number, max: number): string {
  if (valor < min) return 'abaixo'
  if (valor > max) return 'acima'
  return 'normal'
}

export const usePacienteStore = defineStore('paciente', () => {
  const toast = useToast()

  const pacienteAtivo = ref<Paciente | null>(null)
  const historico = ref<Consulta[]>([])
  const alertas = ref<AlertaClinico[]>([])
  const antropometria = ref<DadosAntropometricos | null>(null)
  const modoLeitura = ref(false)
  const pacientes = ref<Paciente[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const temPacienteAtivo = computed(() => !!pacienteAtivo.value)
  const idadeEmMeses = computed(() => pacienteAtivo.value?.idadeEmMeses ?? 0)

  function selecionarPaciente(paciente: Paciente, modo: 'consulta' | 'leitura') {
    pacienteAtivo.value = paciente
    modoLeitura.value = modo === 'leitura'
    historico.value = []
    alertas.value = []
    antropometria.value = null
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

  async function carregarBriefing(pacienteId: string) {
    isLoading.value = true
    error.value = null
    try {
      type BriefingConsulta = { id: number; data: string; peso: number | null; cids: string[]; encaminhamentos: string[] }
      type BriefingAlerta = { id: number; tipo: string; categoria: string; mensagem: string }
      type BriefingAntropometria = { peso: number | null; altura: number | null; perimetro_cefalico: number | null; imc: number | null }
      type BriefingResponse = {
        consultas: BriefingConsulta[]
        alertas: BriefingAlerta[]
        antropometria: BriefingAntropometria | null
      }

      const { data } = await api.get<BriefingResponse>(`/api/briefing/${pacienteId}`)

      historico.value = data.consultas.map((c, idx) => {
        const anterior = data.consultas[idx + 1]
        let tendenciaPeso: 'up' | 'down' | 'stable' = 'stable'
        if (c.peso != null && anterior?.peso != null) {
          tendenciaPeso = c.peso > anterior.peso ? 'up' : c.peso < anterior.peso ? 'down' : 'stable'
        }
        return {
          id: String(c.id),
          data: c.data ? formatarDataConsulta(c.data) : '—',
          tipo: 'Retorno' as const,
          peso: c.peso ?? 0,
          tendenciaPeso,
          cid: c.cids[0] ?? null,
          encaminhamento: c.encaminhamentos[0] ?? null,
        }
      })

      alertas.value = data.alertas.map(a => ({
        id: String(a.id),
        tipo: a.tipo as AlertaClinico['tipo'],
        categoria: a.categoria as AlertaClinico['categoria'],
        mensagem: a.mensagem,
      }))

      if (data.antropometria) {
        const idadeMs = pacienteAtivo.value?.idadeEmMeses ?? 0
        const sexo = pacienteAtivo.value?.sexo ?? undefined
        const ranges = getAntropometriaRangePaciente(idadeMs, sexo)

        const peso = data.antropometria.peso ?? 0
        const altura = data.antropometria.altura ?? 0

        antropometria.value = {
          peso,
          percentilPeso: peso > 0 ? classificarFaixa(peso, ranges.pesoKg.min, ranges.pesoKg.max) : 'normal',
          altura,
          percentilAltura: altura > 0 ? classificarFaixa(altura, ranges.alturaCm.min, ranges.alturaCm.max) : 'normal',
          perimetroCefalico: data.antropometria.perimetro_cefalico,
          imc: data.antropometria.imc ?? 0,
        }
      } else {
        antropometria.value = null
      }
    } catch {
      error.value = 'Erro ao carregar briefing clínico.'
      toast.error(error.value)
    } finally {
      isLoading.value = false
    }
  }

  async function carregarPacientes(page = 1, nome?: string) {
    isLoading.value = true
    error.value = null
    try {
      const params: Record<string, string | number> = { page }
      if (nome) params.nome = nome
      const { data } = await api.get<{ items: Record<string, unknown>[] } | Record<string, unknown>[]>('/api/pacientes', { params })
      const items: Record<string, unknown>[] = Array.isArray(data) ? data : ((data as { items: Record<string, unknown>[] }).items ?? [])
      const hoje = new Date()
      pacientes.value = items.map(p => {
        const dtNasc = p.dt_nascimento ?? p.data_nascimento
        const dataNascimento = dtNasc ? String(dtNasc) : ''
        let idadeEmMeses = 0
        if (dataNascimento) {
          const nasc = new Date(dataNascimento)
          idadeEmMeses = (hoje.getFullYear() - nasc.getFullYear()) * 12 + (hoje.getMonth() - nasc.getMonth())
        }
        const anos = Math.floor(idadeEmMeses / 12)
        const mesesRest = idadeEmMeses % 12
        const idade = anos > 0
          ? mesesRest > 0 ? `${anos} anos e ${mesesRest} meses` : `${anos} anos`
          : `${idadeEmMeses} meses`
        return {
          id: String(p.prontuario ?? p.id ?? ''),
          nome: String(p.nome ?? ''),
          nomeMae: p.nome_mae ? String(p.nome_mae) : undefined,
          nomePai: p.nome_pai ? String(p.nome_pai) : undefined,
          dataNascimento,
          idade,
          idadeEmMeses,
          sexo: (p.sexo === 'M' || p.sexo === 'F') ? p.sexo : undefined,
          sexoBiologico: (p.sexo_biologico === 'M' || p.sexo_biologico === 'F') ? p.sexo_biologico : undefined,
          cor: p.cor ? String(p.cor) : undefined,
          prontuario: String(p.prontuario ?? ''),
          prontuarioPrimario: String(p.prontuario_primario ?? p.prontuario ?? ''),
          especialidade: p.nome_especialidade ? String(p.nome_especialidade) : (p.especialidade ? String(p.especialidade) : undefined),
          indOrigem: (['R', 'EC', 'E', 'I'] as const).find(v => v === p.ind_origem),
        }
      })
    } catch {
      error.value = 'Erro ao carregar lista de pacientes.'
      toast.error(error.value)
    } finally {
      isLoading.value = false
    }
  }

  return {
    pacienteAtivo,
    historico,
    alertas,
    antropometria,
    modoLeitura,
    temPacienteAtivo,
    idadeEmMeses,
    pacientes,
    isLoading,
    error,
    selecionarPaciente,
    limparPaciente,
    setHistorico,
    setAlertas,
    carregarBriefing,
    carregarPacientes,
  }
})
