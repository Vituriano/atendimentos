<script setup lang="ts">
import { ref } from 'vue'
import {
  ClipboardDocumentIcon,
  CheckIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'
import type { EncaminhamentoConsulta } from '../../stores/consulta'

const props = defineProps<{
  textoAGHU: string
  encaminhamentos: EncaminhamentoConsulta[]
  textosEncaminhamento: string[]
}>()

const emit = defineEmits<{
  (e: 'nova-consulta'): void
}>()

const copiadoAGHU = ref(false)
const copiadoEnc = ref<number | null>(null)

async function copiarAGHU() {
  await navigator.clipboard.writeText(props.textoAGHU)
  copiadoAGHU.value = true
  setTimeout(() => { copiadoAGHU.value = false }, 2000)
}

async function copiarEncaminhamento(index: number) {
  await navigator.clipboard.writeText(props.textosEncaminhamento[index])
  copiadoEnc.value = index
  setTimeout(() => { copiadoEnc.value = null }, 2000)
}
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden bg-slate-50">
    <!-- Header -->
    <header class="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 shrink-0">
      <div>
        <p class="text-xs text-slate-400">Atendimento concluído</p>
        <p class="text-sm font-medium text-slate-800">Resumo e exportação para o AGHU</p>
      </div>
      <button
        class="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
        @click="emit('nova-consulta')"
      >
        <ArrowLeftIcon class="h-4 w-4" />
        Nova Consulta
      </button>
    </header>

    <!-- Aviso fixo abaixo do header -->
    <div class="px-6 pt-4 shrink-0">
      <div class="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
        <ExclamationTriangleIcon class="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
        <span>
          Após colar no AGHU, assine digitalmente com seu certificado Certbr. A assinatura não é feita neste sistema.
        </span>
      </div>
    </div>

    <!-- Texto AGHU — ocupa todo o espaço restante -->
    <div class="flex flex-col flex-1 min-h-0 px-6 py-4 gap-4">
      <div class="flex items-center justify-between shrink-0">
        <h3 class="text-sm font-semibold text-slate-700">Evolução para o AGHU</h3>
        <button
          class="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
          @click="copiarAGHU"
        >
          <CheckIcon v-if="copiadoAGHU" class="h-3.5 w-3.5 text-green-600" />
          <ClipboardDocumentIcon v-else class="h-3.5 w-3.5" />
          {{ copiadoAGHU ? 'Copiado!' : 'Copiar texto' }}
        </button>
      </div>

      <textarea
        :value="textoAGHU"
        readonly
        class="flex-1 w-full font-mono text-xs text-slate-700 border border-slate-200 rounded-xl px-4 py-3 resize-none focus:outline-none bg-white shadow-sm overflow-y-auto"
      />

      <!-- Encaminhamentos (se houver, abaixo do textarea com scroll próprio) -->
      <div v-if="encaminhamentos.length > 0" class="shrink-0 space-y-3">
        <h3 class="text-sm font-semibold text-slate-700">
          Encaminhamentos ({{ encaminhamentos.length }})
        </h3>
        <div
          v-for="(enc, i) in encaminhamentos"
          :key="enc.localId"
          class="rounded-xl border border-slate-200 bg-white shadow-sm p-4 space-y-3"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-slate-800">{{ enc.especialidade }}</p>
              <p class="text-xs text-slate-500 mt-0.5">{{ enc.procedimentoMotivo }} · {{ enc.prioridade }}</p>
            </div>
            <button
              class="flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors shrink-0"
              @click="copiarEncaminhamento(i)"
            >
              <CheckIcon v-if="copiadoEnc === i" class="h-3.5 w-3.5 text-green-600" />
              <ClipboardDocumentIcon v-else class="h-3.5 w-3.5" />
              {{ copiadoEnc === i ? 'Copiado!' : 'Copiar' }}
            </button>
          </div>
          <textarea
            :value="textosEncaminhamento[i]"
            readonly
            rows="8"
            class="w-full font-mono text-xs text-slate-600 border border-slate-200 rounded-lg px-3 py-2.5 resize-none focus:outline-none bg-slate-50"
          />
        </div>
      </div>
    </div>
  </div>
</template>
