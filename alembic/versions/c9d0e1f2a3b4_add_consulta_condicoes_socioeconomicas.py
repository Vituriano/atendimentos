"""add consulta condicoes socioeconomicas

Revision ID: c9d0e1f2a3b4
Revises: b8c9d0e1f2a3
Create Date: 2026-06-26 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "c9d0e1f2a3b4"
down_revision = "b8c9d0e1f2a3"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "consulta_condicoes_socioeconomicas",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("consulta_id", sa.Integer(), nullable=False),
        sa.Column("renda_familiar", sa.Text(), nullable=True),
        sa.Column("renda_nao_informada", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("tipo_casa", sa.Text(), nullable=True),
        sa.Column("numero_comodos", sa.Integer(), nullable=True),
        sa.Column("banheiro", sa.Text(), nullable=True),
        sa.Column("quarto_crianca", sa.Text(), nullable=True),
        sa.Column("presenca_animais", sa.Text(), nullable=True),
        sa.Column("agua_encanada", sa.Boolean(), nullable=True),
        sa.Column("energia_eletrica", sa.Boolean(), nullable=True),
        sa.Column("esgoto", sa.Text(), nullable=True),
        sa.Column("coleta_lixo", sa.Boolean(), nullable=True),
        sa.Column("area_violencia", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["consulta_id"], ["consultas.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("consulta_id", name="uq_consulta_condicoes_socioeconomicas_consulta_id"),
    )
    op.create_index(op.f("ix_consulta_condicoes_socioeconomicas_id"), "consulta_condicoes_socioeconomicas", ["id"], unique=False)
    op.create_index(op.f("ix_consulta_condicoes_socioeconomicas_consulta_id"), "consulta_condicoes_socioeconomicas", ["consulta_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_consulta_condicoes_socioeconomicas_consulta_id"), table_name="consulta_condicoes_socioeconomicas")
    op.drop_index(op.f("ix_consulta_condicoes_socioeconomicas_id"), table_name="consulta_condicoes_socioeconomicas")
    op.drop_table("consulta_condicoes_socioeconomicas")
