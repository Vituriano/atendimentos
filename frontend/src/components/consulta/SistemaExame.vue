<template>
  <div
    class="relative flex flex-col gap-4 rounded-xl border p-4 transition-all duration-200"
    :class="{
      'bg-emerald-50/40 border-emerald-200': system.status === 'normal',
      'bg-red-50/40 border-red-200': system.status === 'alterado',
      'bg-white border-slate-200': !system.status
    }"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <component :is="icon" v-if="icon" class="h-5 w-5 text-slate-700" />
        <h3 class="font-semibold text-slate-900">{{ label }}</h3>
        
        <Check v-if="system.status === 'normal'" class="h-4 w-4 text-emerald-500" />
        <TriangleAlert v-if="system.status === 'alterado'" class="h-4 w-4 text-red-500" />
      </div>

      <button @click="$emit('remove')" class="text-slate-400 transition-colors hover:text-slate-600">
        <X class="h-4 w-4" />
      </button>
    </div>

    <div class="flex items-center gap-4">
      <span class="text-sm text-slate-600">Como está?</span>
      
      <div class="flex overflow-hidden rounded-md border border-slate-200 bg-white">
        <button
          @click="$emit('update-status', { id, status: 'normal' })"
          class="border-r border-slate-200 px-4 py-1.5 text-sm font-medium transition-colors"
          :class="system.status === 'normal' ? 'bg-emerald-100/50 text-emerald-700 border-emerald-300' : 'text-slate-600 hover:bg-slate-50'"
        >
          Normal
        </button>
        <button
          @click="$emit('update-status', { id, status: 'alterado' })"
          class="px-4 py-1.5 text-sm font-medium transition-colors"
          :class="system.status === 'alterado' ? 'bg-red-100/50 text-red-700 border-red-300' : 'text-slate-600 hover:bg-slate-50'"
        >
          Alterado
        </button>
      </div>
    </div>

    <div v-if="system.status === 'alterado'" class="mt-1">
      <textarea
        :value="system.descricao"
        @input="$emit('update-descricao', { id, descricao: ($event.target as HTMLTextAreaElement).value })"
        rows="3"
        class="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm placeholder:text-slate-500 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
        placeholder="Desenvolvimento adequado para a idade, alterações observadas..."
      ></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SistemaStatus } from '../../types/clinica'
import { XMarkIcon as X, CheckIcon as Check, ExclamationTriangleIcon as TriangleAlert } from '@heroicons/vue/24/solid'

// Definimos o type para aceitar vazio ('') caso não tenha sido avaliado ainda
type SistemaStatusSelection = SistemaStatus | ''

defineProps<{
  id: string
  label: string
  icon?: any
  system: {
    status: SistemaStatusSelection
    descricao: string
  }
}>()

defineEmits<{
  (e: 'update-status', payload: { id: string; status: SistemaStatusSelection }): void
  (e: 'update-descricao', payload: { id: string; descricao: string }): void
  (e: 'remove'): void
}>()
</script>