import os
from typing import Any
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from ..interfaces.alertas_provider_interface import AlertaProviderInterface

# TODO: quando existir geração de alerta a partir de dado externo (AGHU), adicionar
# coluna origem_descricao ao modelo Alerta e validar como obrigatória nesse cenário.


def _get_sql(file_path: str) -> str:
    base_dir = os.path.dirname(os.path.abspath(__file__))
    sql_path = os.path.join(base_dir, '..', 'sql', file_path)
    with open(sql_path, 'r') as f:
        return f.read()


class AlertaSqliteProvider(AlertaProviderInterface):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def listar_alertas(
        self, paciente_id: str | None = None, categoria: str | None = None
    ) -> list[dict[str, Any]]:
        query = text(_get_sql("alertas/listar_alertas.sql"))
        result = await self.session.execute(query, {"paciente_id": paciente_id, "categoria": categoria})
        return [dict(r) for r in result.mappings().all()]

    async def criar_alerta(
        self, paciente_id: str, tipo: str, categoria: str, mensagem: str
    ) -> dict[str, Any]:
        query = text(_get_sql("alertas/criar_alerta.sql"))
        result = await self.session.execute(
            query, {"paciente_id": paciente_id, "tipo": tipo, "categoria": categoria, "mensagem": mensagem}
        )
        alerta_id = result.lastrowid
        await self.session.commit()
        return await self._obter_alerta(alerta_id)

    async def resolver_alerta(self, alerta_id: int) -> dict[str, Any] | None:
        query = text(_get_sql("alertas/resolver_alerta.sql"))
        result = await self.session.execute(query, {"id": alerta_id})
        if result.rowcount == 0:
            return None
        await self.session.commit()
        return await self._obter_alerta(alerta_id)

    async def _obter_alerta(self, alerta_id: int) -> dict[str, Any] | None:
        query = text(_get_sql("alertas/obter_alerta.sql"))
        result = await self.session.execute(query, {"id": alerta_id})
        row = result.mappings().first()
        return dict(row) if row else None
