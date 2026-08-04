from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine


async def ensure_local_dev_schema(engine: AsyncEngine) -> None:
    """
    Garante pequenas compatibilizações de schema para o SQLite local.

    O projeto ainda está em fase inicial e alguns ambientes locais podem ter um
    app.db criado antes de colunas novas adicionadas depois em várias tabelas.
    O create_all cria tabelas novas, mas não altera tabelas já existentes; por
    isso este ajuste evita que o desenvolvedor precise apagar manualmente o
    banco local a cada patch funcional. Alembic cobre o mesmo ajuste pra quem
    já bootstrapou migrações (ver alembic/versions/) — este patch cobre só o
    caminho local que nunca rodou Alembic (só create_all).
    """
    tabelas_migrations = {
        "consulta_antropometria": {
            "classificacao_imc": "ALTER TABLE consulta_antropometria ADD COLUMN classificacao_imc VARCHAR(32)",
            "pressao_sistolica": "ALTER TABLE consulta_antropometria ADD COLUMN pressao_sistolica INTEGER",
            "pressao_diastolica": "ALTER TABLE consulta_antropometria ADD COLUMN pressao_diastolica INTEGER",
        },
        "consulta_triagem_neonatal": {
            "teste_olhinho_coletas": (
                "ALTER TABLE consulta_triagem_neonatal ADD COLUMN teste_olhinho_coletas TEXT NOT NULL DEFAULT '[]'"
            ),
            "teste_fundo_olho_coletas": (
                "ALTER TABLE consulta_triagem_neonatal ADD COLUMN teste_fundo_olho_coletas TEXT NOT NULL DEFAULT '[]'"
            ),
            "teste_coracaozinho_coletas": (
                "ALTER TABLE consulta_triagem_neonatal ADD COLUMN teste_coracaozinho_coletas TEXT NOT NULL DEFAULT '[]'"
            ),
        },
        "consulta_historia_familiar": {
            "coabitacao_pais_outros": "ALTER TABLE consulta_historia_familiar ADD COLUMN coabitacao_pais_outros TEXT",
        },
        "consulta_marcos_desenvolvimento": {
            "alterado_apos_registro_original": (
                "ALTER TABLE consulta_marcos_desenvolvimento "
                "ADD COLUMN alterado_apos_registro_original BOOLEAN NOT NULL DEFAULT 0"
            ),
        },
    }

    async with engine.begin() as conn:
        for tabela, migrations in tabelas_migrations.items():
            result = await conn.execute(text(f"PRAGMA table_info({tabela})"))
            columns = {row[1] for row in result.fetchall()}
            if not columns:
                continue

            for column, statement in migrations.items():
                if column not in columns:
                    await conn.execute(text(statement))
