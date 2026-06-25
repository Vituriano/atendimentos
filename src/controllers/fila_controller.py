from typing import List, Dict, Any

from ..providers.interfaces.fila_provider_interface import FilaProviderInterface


async def listar_fila(provider: FilaProviderInterface) -> List[Dict[str, Any]]:
    """Retorna a lista completa da fila de atendimento."""
    return await provider.listar_fila()


async def stats_fila(provider: FilaProviderInterface) -> Dict[str, int]:
    """Retorna os contadores de status da fila."""
    return await provider.stats_fila()


async def atualizar_status(
    id: int, status: str, provider: FilaProviderInterface
) -> Dict[str, Any]:
    """Atualiza o status de uma entrada na fila e retorna o item atualizado."""
    return await provider.atualizar_status(id, status)
