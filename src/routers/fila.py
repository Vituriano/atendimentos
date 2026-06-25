from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any

from ..controllers import fila_controller
from ..dependencies import get_fila_provider
from ..providers.interfaces.fila_provider_interface import FilaProviderInterface
from ..auth.auth import auth_handler

# --- PONTO ÚNICO DE CONFIGURAÇÃO PARA ESTE ROTEADOR ---
# Para usar banco SQLite, altere esta linha para "sqlite"
STRATEGY = "mock"
# -------------------------------------------------------

router = APIRouter(
    prefix="/api/fila",
    tags=["Fila"],
    dependencies=[Depends(auth_handler.decode_token)],
)


class AtualizarStatusBody(BaseModel):
    status: str


@router.get("", response_model=List[dict])
async def listar_fila(
    provider: FilaProviderInterface = Depends(get_fila_provider(STRATEGY)),
) -> List[Dict[str, Any]]:
    """Lista todos os pacientes na fila de atendimento."""
    return await fila_controller.listar_fila(provider)


@router.get("/stats", response_model=dict)
async def stats_fila(
    provider: FilaProviderInterface = Depends(get_fila_provider(STRATEGY)),
) -> Dict[str, int]:
    """Retorna os contadores de status da fila (total, aguardando, em_atendimento, finalizado)."""
    return await fila_controller.stats_fila(provider)


@router.patch("/{id}/status", response_model=dict)
async def atualizar_status(
    id: int,
    body: AtualizarStatusBody,
    provider: FilaProviderInterface = Depends(get_fila_provider(STRATEGY)),
) -> Dict[str, Any]:
    """Atualiza o status de um paciente na fila."""
    try:
        return await fila_controller.atualizar_status(id, body.status, provider)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
