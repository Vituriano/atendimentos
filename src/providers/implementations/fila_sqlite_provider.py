from typing import List, Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession

from ..interfaces.fila_provider_interface import FilaProviderInterface

_NOT_IMPLEMENTED_MSG = "SqliteFilaProvider não implementado ainda — use STRATEGY='mock'"


class FilaSqliteProvider(FilaProviderInterface):
    """Stub SQLite do provider de fila. Implementação futura — STRATEGY='mock' por ora."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def listar_fila(self) -> List[Dict[str, Any]]:
        raise NotImplementedError(_NOT_IMPLEMENTED_MSG)

    async def stats_fila(self) -> Dict[str, int]:
        raise NotImplementedError(_NOT_IMPLEMENTED_MSG)

    async def atualizar_status(self, id: int, status: str) -> Dict[str, Any]:
        raise NotImplementedError(_NOT_IMPLEMENTED_MSG)
