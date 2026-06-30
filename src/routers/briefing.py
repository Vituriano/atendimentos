import json
from collections import Counter
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..auth.auth import auth_handler
from ..models.consulta import (
    Alerta,
    Consulta,
    ConsultaAntropometria,
)
from ..resources.database import get_app_db_session

router = APIRouter(
    prefix="/api/briefing",
    tags=["Briefing"],
    dependencies=[Depends(auth_handler.decode_token)],
)


@router.get("/{paciente_id}", response_model=dict)
async def obter_briefing(
    paciente_id: str,
    db: AsyncSession = Depends(get_app_db_session),
) -> dict[str, Any]:
    """Retorna o briefing clínico agregado de um paciente (somente leitura)."""

    # Últimas 5 consultas com antropometria, diagnóstico e encaminhamentos
    stmt_consultas = (
        select(Consulta)
        .options(
            selectinload(Consulta.antropometria),
            selectinload(Consulta.diagnostico),
            selectinload(Consulta.encaminhamentos),
        )
        .where(
            Consulta.paciente_id == paciente_id,
            Consulta.deleted_at.is_(None),
        )
        .order_by(Consulta.data.desc())
        .limit(5)
    )
    result = await db.execute(stmt_consultas)
    consultas = result.scalars().all()

    consultas_response = []
    for c in consultas:
        antro = c.antropometria
        diag = c.diagnostico
        encs = [e for e in (c.encaminhamentos or []) if e.deleted_at is None]

        cids: list[str] = []
        if diag and diag.deleted_at is None:
            if diag.cid10_principal:
                cids.append(diag.cid10_principal)
            try:
                secundarios = json.loads(diag.cids_secundarios or "[]")
                cids.extend(s.get("cid", "") for s in secundarios if s.get("cid"))
            except (json.JSONDecodeError, AttributeError):
                pass

        consultas_response.append({
            "id": c.id,
            "data": c.data.isoformat() if c.data else None,
            "peso": float(antro.peso) if antro and antro.peso else None,
            "cids": cids,
            "encaminhamentos": [e.especialidade for e in encs if e.especialidade],
        })

    # Alertas ativos
    stmt_alertas = (
        select(Alerta)
        .where(
            Alerta.paciente_id == paciente_id,
            Alerta.deleted_at.is_(None),
        )
        .order_by(Alerta.created_at.desc())
    )
    result_alertas = await db.execute(stmt_alertas)
    alertas_response = [
        {"id": a.id, "tipo": a.tipo, "categoria": a.categoria, "mensagem": a.mensagem}
        for a in result_alertas.scalars().all()
    ]

    # Último dado antropométrico
    stmt_antro = (
        select(ConsultaAntropometria)
        .join(Consulta, Consulta.id == ConsultaAntropometria.consulta_id)
        .where(
            Consulta.paciente_id == paciente_id,
            Consulta.deleted_at.is_(None),
            ConsultaAntropometria.deleted_at.is_(None),
        )
        .order_by(Consulta.data.desc())
        .limit(1)
    )
    result_antro = await db.execute(stmt_antro)
    ultima_antro = result_antro.scalar_one_or_none()

    antropometria_response = None
    if ultima_antro:
        antropometria_response = {
            "peso": float(ultima_antro.peso) if ultima_antro.peso else None,
            "altura": float(ultima_antro.altura) if ultima_antro.altura else None,
            "perimetro_cefalico": float(ultima_antro.perimetro_cefalico) if ultima_antro.perimetro_cefalico else None,
            "imc": float(ultima_antro.imc) if ultima_antro.imc else None,
        }

    # Padrões: CIDs mais frequentes e encaminhamentos únicos de todas as consultas
    stmt_todas = (
        select(Consulta)
        .options(
            selectinload(Consulta.diagnostico),
            selectinload(Consulta.encaminhamentos),
        )
        .where(
            Consulta.paciente_id == paciente_id,
            Consulta.deleted_at.is_(None),
        )
    )
    result_todas = await db.execute(stmt_todas)
    todas_consultas = result_todas.scalars().all()

    todos_cids: list[str] = []
    todos_encs: list[str] = []
    for c in todas_consultas:
        if c.diagnostico and c.diagnostico.deleted_at is None:
            if c.diagnostico.cid10_principal:
                todos_cids.append(c.diagnostico.cid10_principal)
            try:
                secundarios = json.loads(c.diagnostico.cids_secundarios or "[]")
                todos_cids.extend(s.get("cid", "") for s in secundarios if s.get("cid"))
            except (json.JSONDecodeError, AttributeError):
                pass
        for e in (c.encaminhamentos or []):
            if e.deleted_at is None and e.especialidade:
                todos_encs.append(e.especialidade)

    cids_freq = [
        {"cid": cid, "freq": freq}
        for cid, freq in Counter(todos_cids).most_common(5)
    ]

    return {
        "consultas": consultas_response,
        "alertas": alertas_response,
        "antropometria": antropometria_response,
        "padroes": {
            "cids": cids_freq,
            "encaminhamentos": list(dict.fromkeys(todos_encs)),
        },
        "origemDescricao": "local-sqlite",
    }
