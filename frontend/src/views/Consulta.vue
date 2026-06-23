<template>
  <div class="space-y-6">
    <div class="mb-4">
      <h1 class="text-3xl font-bold">Consulta</h1>
      <p class="text-sm text-paper-text">Registre o exame físico do paciente e acompanhe o progresso da avaliação.</p>
    </div>

    <SecaoExameFisico />
  </div>
</template>

<script setup lang="ts">
import SecaoExameFisico from '../components/consulta/SecaoExameFisico.vue'
</script>
