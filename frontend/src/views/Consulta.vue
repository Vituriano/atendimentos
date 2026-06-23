<template>
  <div class="space-y-6">
    <div class="mb-4">
      <h1 class="text-3xl font-bold">Consulta</h1>
      <p class="text-sm text-paper-text">Registre o exame físico do paciente e acompanhe o progresso da avaliação.</p>
    </div>

    <SecaoExameFisico />
    <SecaoMCHATR v-if="showMchat" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePacienteStore } from '../stores/paciente'
import SecaoExameFisico from '../components/consulta/SecaoExameFisico.vue'
import SecaoMCHATR from '../components/consulta/SecaoMCHATR.vue'

const pacienteStore = usePacienteStore()
const showMchat = computed(() => pacienteStore.idadeEmMeses >= 16 && pacienteStore.idadeEmMeses <= 30)
</script>
