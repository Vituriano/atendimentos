<template>
  <nav class="flex flex-col gap-1 py-2">
    <template v-for="group in groups" :key="group.label">
      <p class="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        {{ group.label }}
      </p>
      <button
        v-for="secao in group.items"
        :key="secao.id"
        class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors text-left"
        :class="secao.id === activeSection
          ? 'bg-teal-50 text-teal-700 font-medium'
          : 'text-slate-600 hover:bg-slate-100'"
        @click="$emit('select-section', secao.id)"
      >
        <CheckCircleIcon
          v-if="completedSections.has(secao.id)"
          class="h-4 w-4 shrink-0 text-teal-500"
        />
        <div
          v-else-if="isStarted(secao.id)"
          class="h-4 w-4 shrink-0 rounded-full border-2 border-amber-300 bg-amber-100"
        />
        <div
          v-else
          class="h-4 w-4 shrink-0 rounded-full border-2"
          :class="secao.id === activeSection ? 'border-teal-500' : 'border-slate-300'"
        />
        <span>{{ secao.label }}</span>
      </button>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircleIcon } from '@heroicons/vue/24/solid'
import type { Secao, SecaoId } from '../../stores/consulta'

const props = defineProps<{
  secoes: Secao[]
  activeSection: SecaoId
  completedSections: Set<SecaoId>
  startedSections?: Set<SecaoId>
}>()

defineEmits<{ 'select-section': [id: SecaoId] }>()

function isStarted(id: SecaoId): boolean {
  return props.startedSections?.has(id) ?? false
}

const groups = computed(() => [
  { label: 'Formulário', items: props.secoes.filter(s => s.group === 'formulario') },
  { label: 'Registro', items: props.secoes.filter(s => s.group === 'registro') },
].filter(g => g.items.length > 0))
</script>
