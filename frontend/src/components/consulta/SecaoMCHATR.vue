<template>
  <section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 class="text-xl font-semibold text-slate-900">M-CHAT-R</h2>
        <p class="mt-1 text-sm text-paper-text">Triagem de risco para Transtorno do Espectro Autista para pacientes entre 16 e 30 meses.</p>
      </div>
      <div class="rounded-full bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
        {{ answeredCount }} de {{ totalQuestions }} perguntas respondidas
      </div>
    </div>

    <div class="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <p class="font-semibold">Protocolo M-CHAT-R</p>
      <p class="mt-2">Responda todas as perguntas com Sim ou Não. O score é calculado automaticamente e indica o nível de risco de TEA.</p>
    </div>

    <div class="grid gap-4">
      <div v-for="question in questions" :key="question.id" class="rounded-xl border border-slate-200 p-4">
        <p class="text-sm font-medium text-slate-900">{{ question.id }}. {{ question.pergunta }}</p>
        <div class="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            class="rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none"
            :class="selectedAnswer(question.id) === 'yes' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-900'"
            @click="updateAnswer(question.id, 'yes')"
          >
            Sim
          </button>
          <button
            type="button"
            class="rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none"
            :class="selectedAnswer(question.id) === 'no' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-900'"
            @click="updateAnswer(question.id, 'no')"
          >
            Não
          </button>
        </div>
      </div>
    </div>

    <div v-if="allAnswered" class="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm font-semibold">Score atual:</p>
        <span class="rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white">{{ score }} pontos</span>
      </div>
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm font-semibold">Classificação de risco:</p>
        <span :class="riskBadgeClass" class="rounded-full px-3 py-1 text-sm font-semibold">{{ riskLabel }}</span>
      </div>
      <p class="text-sm text-slate-700">{{ riskDescription }}</p>
    </div>

    <div v-if="allAnswered && riskLevel !== 'low'" class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
      <p class="font-semibold">Encaminhamento automático gerado</p>
      <p>Um encaminhamento de Neurologia foi adicionado na seção de Encaminhamentos.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConsultaStore } from '../../stores/consulta'
import { mchatPerguntas } from '../../data/mchat-perguntas'

const consultaStore = useConsultaStore()
const questions = mchatPerguntas
const totalQuestions = questions.length

const answeredCount = computed(() => consultaStore.mchatAnsweredCount)
const allAnswered = computed(() => answeredCount.value === totalQuestions)
const score = computed(() => consultaStore.mchatScore)
const riskLevel = computed(() => consultaStore.mchatRiskLevel)

const riskLabel = computed(() => {
  if (riskLevel.value === 'pending') return 'Aguardando respostas completas'
  if (riskLevel.value === 'low') return 'Baixo risco'
  if (riskLevel.value === 'medium') return 'Risco médio'
  return 'Alto risco'
})

const riskDescription = computed(() => {
  if (riskLevel.value === 'pending') {
    return 'Responda todas as perguntas para calcular o risco.'
  }
  if (riskLevel.value === 'low') {
    return 'Baixo risco de TEA. Acompanhamento clínico rotineiro é indicado.'
  }
  if (riskLevel.value === 'medium') {
    return 'Risco médio de TEA. Encaminhamento automático para avaliação complementar foi gerado.'
  }
  return 'Alto risco de TEA. Encaminhamento automático para avaliação urgente foi gerado.'
})

const riskBadgeClass = computed(() => {
  if (riskLevel.value === 'pending') return 'bg-slate-200 text-slate-800'
  if (riskLevel.value === 'low') return 'bg-emerald-100 text-emerald-700'
  if (riskLevel.value === 'medium') return 'bg-amber-100 text-amber-700'
  return 'bg-rose-100 text-rose-700'
})

function selectedAnswer(questionId: number) {
  return consultaStore.mchatAnswers[questionId]
}

function updateAnswer(questionId: number, answer: 'yes' | 'no') {
  consultaStore.updateMchatAnswer(questionId, answer)
}
</script>
