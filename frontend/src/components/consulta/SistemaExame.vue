<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 class="text-base font-semibold text-slate-900">{{ label }}</h3>
        <p class="text-sm text-paper-text">Selecione o status e registre observações.</p>
      </div>

      <div class="w-full max-w-xs">
        <label class="form-label" :for="`${id}-status`">Status</label>
        <select
          :id="`${id}-status`"
          class="form-control"
          :value="system.status"
          @change="onStatusChange"
        >
          <option value="" disabled>Selecione um status</option>
          <option value="normal">Normal</option>
          <option value="alterado">Alterado</option>
          <option value="nao-avaliado">Não Avaliado</option>
        </select>
      </div>
    </div>

    <div class="mt-4">
      <label class="form-label" :for="`${id}-descricao`">Descrição</label>
      <textarea
        :id="`${id}-descricao`"
        class="form-control min-h-[100px]"
        rows="4"
        :value="system.descricao"
        @input="onDescricaoInput"
        :aria-invalid="hasError ? 'true' : 'false'"
        :required="isRequired"
        placeholder="Descreva o achado clínico..."
      />
      <p v-if="hasError" class="mt-2 text-sm font-medium text-rose-600">
        Descrição obrigatória quando o sistema está alterado.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SistemaExame, SistemaStatus } from '../../types/clinica'

type SistemaStatusSelection = SistemaStatus | ''

const props = defineProps<{
  id: string
  label: string
  system: Omit<SistemaExame, 'status'> & { status: SistemaStatusSelection }
}>()

const emit = defineEmits<{
  (e: 'update-status', payload: { id: string; status: SistemaStatusSelection }): void
  (e: 'update-descricao', payload: { id: string; descricao: string }): void
}>()

const isRequired = computed(() => props.system.status === 'alterado')
const hasError = computed(
  () => props.system.status === 'alterado' && !props.system.descricao.trim(),
)

function onStatusChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update-status', { id: props.id, status: target.value as SistemaStatusSelection })
}

function onDescricaoInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  emit('update-descricao', { id: props.id, descricao: target.value })
}
</script>
