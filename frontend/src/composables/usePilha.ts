import { computed, ref, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'

/**
 * Comportamento de "pilha" (stack UX) reutilizável para listas de itens em que o
 * usuário preenche um item por vez:
 *
 * - o item promovido (selecionado/preenchido agora) sobe para o TOPO da lista;
 * - itens já preenchidos podem ser minimizados/colapsados para não ocupar espaço;
 * - ao promover um item, os demais itens já preenchidos podem ser colapsados
 *   automaticamente (`colapsarAoPromover`), deixando só o item ativo expandido.
 *
 * O composable NÃO controla quais itens existem — isso continua sendo do consumidor
 * (ex.: a lista de sistemas selecionados). Ele controla apenas a ORDEM de exibição
 * e o estado de minimizado de cada item. É genérico: funciona sobre qualquer lista
 * de itens `T`, desde que se saiba extrair um id estável (`getId`) e dizer se o item
 * está preenchido (`estaPreenchido`). Assim, Exame Físico, Encaminhamentos e
 * Procedimentos podem reaproveitá-lo.
 */
export interface UsePilhaOptions<T> {
  /** Itens de origem. A pilha só reordena/minimiza; a associação (quais existem) é externa. */
  itens: MaybeRefOrGetter<readonly T[]>
  /** Extrai um id único e estável de cada item. */
  getId: (item: T) => string
  /** Retorna `true` quando o item é considerado preenchido/avaliado. */
  estaPreenchido: (item: T) => boolean
  /**
   * Ao promover um item, colapsa os demais itens que já estão preenchidos,
   * mantendo apenas o item ativo expandido. Padrão: `true` (comportamento de pilha).
   */
  colapsarAoPromover?: boolean
}

export interface UsePilha<T> {
  /** Itens em ordem de pilha (o promovido mais recentemente vem primeiro). */
  pilha: ComputedRef<T[]>
  /** Itens de origem que estão preenchidos, na ordem da pilha. */
  preenchidos: ComputedRef<T[]>
  /** Move um item para o topo da pilha e o expande. */
  promover: (id: string) => void
  /** Indica se o item está minimizado/colapsado. */
  estaMinimizado: (id: string) => boolean
  /** Alterna o estado minimizado do item. */
  alternarMinimizado: (id: string) => void
  /** Minimiza (colapsa) o item. */
  minimizar: (id: string) => void
  /** Expande o item. */
  expandir: (id: string) => void
}

export function usePilha<T>(options: UsePilhaOptions<T>): UsePilha<T> {
  const { itens, getId, estaPreenchido, colapsarAoPromover = true } = options

  // Ordem de prioridade (topo primeiro). Ids não listados aqui mantêm a ordem de origem.
  const ordem = ref<string[]>([])
  // Ids atualmente minimizados/colapsados.
  const minimizados = ref<Set<string>>(new Set())

  const pilha = computed<T[]>(() => {
    const itensAtuais = toValue(itens)
    const porId = new Map(itensAtuais.map(item => [getId(item), item]))

    // Só ids que ainda existem na origem, na ordem de promoção.
    const promovidos = ordem.value.filter(id => porId.has(id))
    const promovidosSet = new Set(promovidos)
    // Itens nunca promovidos mantêm a ordem original de origem, logo abaixo.
    const restantes = itensAtuais.filter(item => !promovidosSet.has(getId(item)))

    return [
      ...promovidos.map(id => porId.get(id) as T),
      ...restantes,
    ]
  })

  const preenchidos = computed<T[]>(() => pilha.value.filter(estaPreenchido))

  function promover(id: string): void {
    ordem.value = [id, ...ordem.value.filter(outro => outro !== id)]

    const proximosMinimizados = new Set(minimizados.value)
    // O item promovido sempre fica expandido.
    proximosMinimizados.delete(id)

    if (colapsarAoPromover) {
      // Colapsa os demais itens já preenchidos, deixando só o ativo aberto.
      for (const item of toValue(itens)) {
        const outroId = getId(item)
        if (outroId !== id && estaPreenchido(item)) {
          proximosMinimizados.add(outroId)
        }
      }
    }

    minimizados.value = proximosMinimizados
  }

  function estaMinimizado(id: string): boolean {
    return minimizados.value.has(id)
  }

  function definirMinimizado(id: string, valor: boolean): void {
    const proximos = new Set(minimizados.value)
    if (valor) {
      proximos.add(id)
    } else {
      proximos.delete(id)
    }
    minimizados.value = proximos
  }

  function alternarMinimizado(id: string): void {
    definirMinimizado(id, !minimizados.value.has(id))
  }

  function minimizar(id: string): void {
    definirMinimizado(id, true)
  }

  function expandir(id: string): void {
    definirMinimizado(id, false)
  }

  return {
    pilha,
    preenchidos,
    promover,
    estaMinimizado,
    alternarMinimizado,
    minimizar,
    expandir,
  }
}
