from abc import ABC, abstractmethod
from typing import Any

class PacienteProviderInterface(ABC):

    @abstractmethod
    async def listar_pacientes(
        self, page: int = 1, limit: int = 20, nome: str | None = None
    ) -> dict[str, Any]:
        """Retorna {"items": [...], "total": N, "page": N, "limit": N}."""

    @abstractmethod
    async def obter_paciente_por_prontuario(self, prontuario: str) -> dict[str, Any] | None:
        """Retorna um paciente pelo número de prontuário ou None se não encontrado."""
