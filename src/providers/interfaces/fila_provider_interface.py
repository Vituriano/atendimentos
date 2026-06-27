from abc import ABC, abstractmethod
from typing import List, Dict, Any


class FilaProviderInterface(ABC):
    """Interface (contrato) para provedores de dados da fila de atendimento."""

    @abstractmethod
    async def listar_fila(self) -> List[Dict[str, Any]]:
        """Deve retornar a lista de entradas na fila de atendimento."""
        pass

    @abstractmethod
    async def stats_fila(self) -> Dict[str, int]:
        """Deve retornar contadores de status da fila."""
        pass

    @abstractmethod
    async def atualizar_status(self, id: int, status: str) -> Dict[str, Any]:
        """Deve atualizar o status de uma entrada na fila e retorná-la."""
        pass
