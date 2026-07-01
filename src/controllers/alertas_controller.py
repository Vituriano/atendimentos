from typing import Any

from ..providers.interfaces.alertas_provider_interface import AlertaProviderInterface


async def listar_alertas(
    provider: AlertaProviderInterface,
    paciente_id: str | None = None,
    categoria: str | None = None,
) -> list[dict[str, Any]]:
    return await provider.listar_alertas(paciente_id=paciente_id, categoria=categoria)


async def criar_alerta(
    provider: AlertaProviderInterface,
    paciente_id: str,
    tipo: str,
    categoria: str,
    mensagem: str,
) -> dict[str, Any]:
    return await provider.criar_alerta(
        paciente_id=paciente_id, tipo=tipo, categoria=categoria, mensagem=mensagem
    )


async def resolver_alerta(
    provider: AlertaProviderInterface,
    alerta_id: int,
) -> dict[str, Any] | None:
    return await provider.resolver_alerta(alerta_id)
