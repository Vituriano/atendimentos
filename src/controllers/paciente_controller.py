from typing import Any

from ..providers.interfaces.paciente_provider_interface import PacienteProviderInterface


async def listar_pacientes(
    provider: PacienteProviderInterface,
    page: int = 1,
    limit: int = 20,
    nome: str | None = None,
) -> dict[str, Any]:
    return await provider.listar_pacientes(page=page, limit=limit, nome=nome)


async def obter_paciente_por_prontuario(
    provider: PacienteProviderInterface,
    prontuario: str,
) -> dict[str, Any] | None:
    return await provider.obter_paciente_por_prontuario(prontuario)
