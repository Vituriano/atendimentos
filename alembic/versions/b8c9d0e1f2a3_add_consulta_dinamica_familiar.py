"""add consulta dinamica familiar

Revision ID: b8c9d0e1f2a3
Revises: a7b8c9d0e1f2
Create Date: 2026-06-26 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "b8c9d0e1f2a3"
down_revision = "a7b8c9d0e1f2"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "consulta_dinamica_familiar",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("consulta_id", sa.Integer(), nullable=False),
        sa.Column("houve_mudanca", sa.Boolean(), nullable=True),
        sa.Column("relacionamento_companheiro", sa.Text(), nullable=True),
        sa.Column("resolucao_desentendimentos", sa.Text(), nullable=True),
        sa.Column("fumante_domicilio", sa.Boolean(), nullable=True),
        sa.Column("uso_alcool_drogas", sa.Boolean(), nullable=True),
        sa.Column("inseguranca_alimentar", sa.Boolean(), nullable=True),
        sa.Column("familiar_preso", sa.Boolean(), nullable=True),
        sa.Column("preocupacao_comportamento", sa.Boolean(), nullable=True),
        sa.Column("disciplina_opcoes", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["consulta_id"], ["consultas.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("consulta_id", name="uq_consulta_dinamica_familiar_consulta_id"),
    )
    op.create_index(op.f("ix_consulta_dinamica_familiar_id"), "consulta_dinamica_familiar", ["id"], unique=False)
    op.create_index(op.f("ix_consulta_dinamica_familiar_consulta_id"), "consulta_dinamica_familiar", ["consulta_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_consulta_dinamica_familiar_consulta_id"), table_name="consulta_dinamica_familiar")
    op.drop_index(op.f("ix_consulta_dinamica_familiar_id"), table_name="consulta_dinamica_familiar")
    op.drop_table("consulta_dinamica_familiar")
