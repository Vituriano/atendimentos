from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Any

from ..controllers import paciente_controller
from ..dependencies import get_paciente_provider
from ..providers.interfaces.paciente_provider_interface import PacienteProviderInterface
from ..auth.auth import auth_handler

STRATEGY = "csv"

router = APIRouter(
    prefix="/api/pacientes",
    tags=["Pacientes"],
    dependencies=[Depends(auth_handler.decode_token)],
)


@router.get("", response_model=dict)
async def listar_pacientes(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    nome: str | None = Query(None),
    provider: PacienteProviderInterface = Depends(get_paciente_provider(STRATEGY)),
) -> dict[str, Any]:
    """Lista pacientes com paginação e busca opcional por nome parcial."""
    return await paciente_controller.listar_pacientes(provider, page=page, limit=limit, nome=nome)


# /busca deve vir antes de /{prontuario} para não ser capturado como parâmetro
@router.get("/busca", response_model=dict | None)
async def buscar_por_cpf(
    cpf: str = Query(..., description="CPF completo no formato XXX.XXX.XXX-XX"),
    provider: PacienteProviderInterface = Depends(get_paciente_provider(STRATEGY)),
) -> dict[str, Any] | None:
    """Busca paciente por CPF completo. CPF parcial retorna 422."""
    from re import sub
    if len(sub(r"\D", "", cpf)) != 11:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="CPF deve ser informado completo (11 dígitos).",
        )
    return await paciente_controller.buscar_por_cpf(provider, cpf)


@router.get("/{prontuario}", response_model=dict | None)
async def obter_paciente(
    prontuario: str,
    provider: PacienteProviderInterface = Depends(get_paciente_provider(STRATEGY)),
) -> dict[str, Any] | None:
    """Retorna dados completos de um paciente pelo número de prontuário."""
    paciente = await paciente_controller.obter_paciente_por_prontuario(provider, prontuario)
    if paciente is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paciente não encontrado.")
    return paciente
