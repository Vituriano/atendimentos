from typing import Any, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from ..auth.auth import auth_handler
from ..controllers import alertas_controller
from ..dependencies import get_alertas_provider
from ..providers.interfaces.alertas_provider_interface import AlertaProviderInterface

# --- PONTO ÚNICO DE CONFIGURAÇÃO PARA ESTE ROTEADOR ---
STRATEGY = "sqlite"
# -------------------------------------------------------

TipoAlerta = Literal["critico", "atencao"]
CategoriaAlerta = Literal["peso", "marco", "encaminhamento", "falta", "negligencia"]

router = APIRouter(
    prefix="/api/alertas",
    tags=["Alertas"],
    dependencies=[Depends(auth_handler.decode_token)],
)


class CriarAlertaBody(BaseModel):
    paciente_id: str
    tipo: TipoAlerta
    categoria: CategoriaAlerta
    mensagem: str


@router.get("", response_model=list[dict])
async def listar_alertas(
    paciente_id: str | None = Query(None),
    categoria: CategoriaAlerta | None = Query(None),
    provider: AlertaProviderInterface = Depends(get_alertas_provider(STRATEGY)),
) -> list[dict[str, Any]]:
    """Lista alertas ativos, com filtro opcional por paciente_id e/ou categoria."""
    return await alertas_controller.listar_alertas(provider, paciente_id=paciente_id, categoria=categoria)


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def criar_alerta(
    body: CriarAlertaBody,
    provider: AlertaProviderInterface = Depends(get_alertas_provider(STRATEGY)),
) -> dict[str, Any]:
    """Cria um alerta manualmente."""
    return await alertas_controller.criar_alerta(
        provider,
        paciente_id=body.paciente_id,
        tipo=body.tipo,
        categoria=body.categoria,
        mensagem=body.mensagem,
    )


@router.patch("/{id}/resolver", response_model=dict)
async def resolver_alerta(
    id: int,
    provider: AlertaProviderInterface = Depends(get_alertas_provider(STRATEGY)),
) -> dict[str, Any]:
    """Marca um alerta como resolvido (soft delete)."""
    resultado = await alertas_controller.resolver_alerta(provider, id)
    if resultado is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alerta não encontrado ou já resolvido.")
    return resultado
