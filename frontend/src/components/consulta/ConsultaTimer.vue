<template>
  <div class="flex items-center gap-1.5 tabular-nums text-sm font-medium text-slate-600">
    <ClockIcon class="h-4 w-4 text-slate-400" />
    <span>{{ display }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ClockIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{ startTime: Date }>()

const display = ref('00:00:00')
let intervalId: ReturnType<typeof setInterval> | null = null

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

function tick() {
  display.value = formatDuration(Date.now() - props.startTime.getTime())
}

onMounted(() => {
  tick()
  intervalId = setInterval(tick, 1000)
})

onUnmounted(() => {
  if (intervalId !== null) clearInterval(intervalId)
})
</script>
