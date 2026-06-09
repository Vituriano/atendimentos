<template>
  <div :class="[borderColor, bgColor, 'border-l-4 rounded-lg p-3 relative']">
    <div class="flex justify-between items-start gap-2">
      <span :class="[textColor, 'text-sm font-medium']">{{ categoriaLabel }}</span>
      <span :class="[tipoBadgeClass, 'text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0']">
        {{ alerta.tipo === 'critico' ? 'Crítico' : 'Atenção' }}
      </span>
    </div>
    <p :class="[textColor, 'text-sm mt-1 opacity-90']">{{ alerta.mensagem }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AlertaClinico } from '../types/clinica'

const props = defineProps<{ alerta: AlertaClinico }>()

const categoriaLabels: Record<string, string> = {
  peso: 'Peso',
  marco: 'Marco de Desenvolvimento',
  encaminhamento: 'Encaminhamento',
  falta: 'Falta',
  negligencia: 'Negligência',
}

const categoriaLabel = computed(() => categoriaLabels[props.alerta.categoria] ?? props.alerta.categoria)

const borderColor = computed(() => {
  const map: Record<string, string> = {
    peso: 'border-amber-400',
    marco: 'border-blue-400',
    encaminhamento: 'border-purple-400',
    falta: 'border-orange-400',
    negligencia: 'border-red-400',
  }
  return map[props.alerta.categoria] ?? 'border-gray-400'
})

const bgColor = computed(() => {
  const map: Record<string, string> = {
    peso: 'bg-amber-50',
    marco: 'bg-blue-50',
    encaminhamento: 'bg-purple-50',
    falta: 'bg-orange-50',
    negligencia: 'bg-red-50',
  }
  return map[props.alerta.categoria] ?? 'bg-gray-50'
})

const textColor = computed(() => {
  const map: Record<string, string> = {
    peso: 'text-amber-800',
    marco: 'text-blue-800',
    encaminhamento: 'text-purple-800',
    falta: 'text-orange-800',
    negligencia: 'text-red-800',
  }
  return map[props.alerta.categoria] ?? 'text-gray-800'
})

const tipoBadgeClass = computed(() =>
  props.alerta.tipo === 'critico'
    ? 'bg-red-100 text-red-700'
    : 'bg-yellow-100 text-yellow-700'
)
</script>
