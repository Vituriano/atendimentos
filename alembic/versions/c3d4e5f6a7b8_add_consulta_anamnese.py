"""add consulta anamnese

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-06-26 05:40:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = "c3d4e5f6a7b8"
down_revision = "b2c3d4e5f6a7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "consulta_anamnese",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("consulta_id", sa.Integer(), nullable=False),
        sa.Column("clinica_queixa_principal", sa.Text(), nullable=True),
        sa.Column("clinica_historia_doenca_atual", sa.Text(), nullable=True),
        sa.Column("clinica_interrogatorio_geral", sa.Text(), nullable=True),
        sa.Column("clinica_interrogatorio_pele_mucosas", sa.Text(), nullable=True),
        sa.Column("clinica_interrogatorio_olhos", sa.Text(), nullable=True),
        sa.Column("clinica_interrogatorio_ouvidos", sa.Text(), nullable=True),
        sa.Column("clinica_interrogatorio_boca", sa.Text(), nullable=True),
        sa.Column("clinica_interrogatorio_respiratorio", sa.Text(), nullable=True),
        sa.Column("clinica_interrogatorio_cardiovascular", sa.Text(), nullable=True),
        sa.Column("clinica_interrogatorio_gastrointestinal", sa.Text(), nullable=True),
        sa.Column("clinica_interrogatorio_geniturinario", sa.Text(), nullable=True),
        sa.Column("clinica_interrogatorio_musculo_esqueletico", sa.Text(), nullable=True),
        sa.Column("clinica_interrogatorio_sistema_nervoso", sa.Text(), nullable=True),
        sa.Column("clinica_sistemas_interrogatorio_alterados", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("clinica_medicacoes_rotina", sa.Text(), nullable=True),
        sa.Column("clinica_exames_complementares", sa.Text(), nullable=True),
        sa.Column("clinica_antecedentes_doencas", sa.Text(), nullable=True),
        sa.Column("alimentacao_tipo_aleitamento", sa.Text(), nullable=True),
        sa.Column("alimentacao_cardapio_cafe", sa.Text(), nullable=True),
        sa.Column("alimentacao_cardapio_lanche_manha", sa.Text(), nullable=True),
        sa.Column("alimentacao_cardapio_almoco", sa.Text(), nullable=True),
        sa.Column("alimentacao_cardapio_lanche_tarde", sa.Text(), nullable=True),
        sa.Column("alimentacao_cardapio_jantar", sa.Text(), nullable=True),
        sa.Column("alimentacao_cardapio_ceia", sa.Text(), nullable=True),
        sa.Column("alimentacao_local_refeicoes", sa.Text(), nullable=True),
        sa.Column("alimentacao_uso_tela_refeicoes", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("habitos_sono_horario", sa.Text(), nullable=True),
        sa.Column("habitos_sono_local", sa.Text(), nullable=True),
        sa.Column("habitos_sono_higiene", sa.Text(), nullable=True),
        sa.Column("habitos_sono_alteracoes", sa.Text(), nullable=True),
        sa.Column("habitos_telas_dispositivos", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("habitos_telas_tempo_diario", sa.Text(), nullable=True),
        sa.Column("habitos_telas_frequencia", sa.Text(), nullable=True),
        sa.Column("habitos_chupeta_chupa_dedo", sa.Text(), nullable=True),
        sa.Column("habitos_higiene_dentaria", sa.Text(), nullable=True),
        sa.Column("habitos_atividades_recreativas", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["consulta_id"], ["consultas.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("consulta_id", name="uq_consulta_anamnese_consulta_id"),
    )
    op.create_index(op.f("ix_consulta_anamnese_consulta_id"), "consulta_anamnese", ["consulta_id"], unique=False)
    op.create_index(op.f("ix_consulta_anamnese_id"), "consulta_anamnese", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_consulta_anamnese_id"), table_name="consulta_anamnese")
    op.drop_index(op.f("ix_consulta_anamnese_consulta_id"), table_name="consulta_anamnese")
    op.drop_table("consulta_anamnese")
