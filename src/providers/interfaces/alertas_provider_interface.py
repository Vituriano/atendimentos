from abc import ABC, abstractmethod
from typing import Any


class AlertaProviderInterface(ABC):

    @abstractmethod
    async def listar_alertas(
        self, paciente_id: str | None = None, categoria: str | None = None
    ) -> list[dict[str, Any]]:
        """Lista alertas ativos (deleted_at IS NULL), com filtro opcional por paciente_id e/ou categoria."""

    @abstractmethod
    async def criar_alerta(
        self, paciente_id: str, tipo: str, categoria: str, mensagem: str
    ) -> dict[str, Any]:
        """Cria um alerta manualmente e retorna o registro criado."""

    @abstractmethod
    async def resolver_alerta(self, alerta_id: int) -> dict[str, Any] | None:
        """Marca o alerta como resolvido (soft delete). Retorna None se não existir ou já estava resolvido."""
