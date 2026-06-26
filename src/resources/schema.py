from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine


async def ensure_local_dev_schema(engine: AsyncEngine) -> None:
    """
    Garante pequenas compatibilizações de schema para o SQLite local.

    O projeto ainda está em fase inicial e alguns ambientes locais podem ter um
    app.db criado antes das colunas novas da antropometria. O create_all cria
    tabelas novas, mas não altera tabelas já existentes; por isso este ajuste
    evita que o desenvolvedor precise apagar manualmente o banco local a cada
    patch funcional.
    """
    async with engine.begin() as conn:
        result = await conn.execute(text("PRAGMA table_info(consulta_antropometria)"))
        columns = {row[1] for row in result.fetchall()}

        if not columns:
            return

        migrations = {
            "classificacao_imc": "ALTER TABLE consulta_antropometria ADD COLUMN classificacao_imc VARCHAR(32)",
            "pressao_sistolica": "ALTER TABLE consulta_antropometria ADD COLUMN pressao_sistolica INTEGER",
            "pressao_diastolica": "ALTER TABLE consulta_antropometria ADD COLUMN pressao_diastolica INTEGER",
        }

        for column, statement in migrations.items():
            if column not in columns:
                await conn.execute(text(statement))
