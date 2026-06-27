import os
from typing import Any
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from ..interfaces.paciente_provider_interface import PacienteProviderInterface

_ORIGEM = "AGHU-PostgreSQL"


def _get_sql(file_path: str) -> str:
    base_dir = os.path.dirname(os.path.abspath(__file__))
    sql_path = os.path.join(base_dir, '..', 'sql', file_path)
    with open(sql_path, 'r') as f:
        return f.read()


class PacientePostgresProvider(PacienteProviderInterface):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def listar_pacientes(
        self, page: int = 1, limit: int = 20, nome: str | None = None
    ) -> dict[str, Any]:
        query = text(_get_sql("paciente/listar_pacientes.sql"))
        offset = (page - 1) * limit
        result = await self.session.execute(query, {"nome": nome, "limit": limit, "offset": offset})
        items = [dict(r) | {"origemDescricao": _ORIGEM} for r in result.mappings().all()]
        # TODO: adicionar COUNT(*) separado para retornar total real (não apenas total da página)
        return {"items": items, "total": len(items), "page": page, "limit": limit}

    async def obter_paciente_por_prontuario(self, prontuario: str) -> dict[str, Any] | None:
        query = text(_get_sql("paciente/obter_paciente.sql"))
        result = await self.session.execute(query, {"prontuario": prontuario})
        row = result.mappings().first()
        return (dict(row) | {"origemDescricao": _ORIGEM}) if row else None
