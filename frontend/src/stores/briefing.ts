import { computed } from 'vue'
import { defineStore } from 'pinia'
import { usePacienteStore } from './paciente'

export const useBriefingStore = defineStore('briefing', () => {
  const pacienteStore = usePacienteStore()

  const pacienteAtivo = computed(() => pacienteStore.pacienteAtivo)
  const historico = computed(() => pacienteStore.historico)
  const alertas = computed(() => pacienteStore.alertas)
  const antropometria = computed(() => pacienteStore.antropometria)
  const modoLeitura = computed(() => pacienteStore.modoLeitura)

  return { pacienteAtivo, historico, alertas, antropometria, modoLeitura }
})
