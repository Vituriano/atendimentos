"""add consulta encaminhamentos

Revision ID: f6a7b8c9d0e1
Revises: e5f6a7b8c9d0
Create Date: 2026-06-26 07:20:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = "f6a7b8c9d0e1"
down_revision = "e5f6a7b8c9d0"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "consulta_encaminhamentos",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("consulta_id", sa.Integer(), nullable=False),
        sa.Column("ordem", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("especialidade", sa.Text(), nullable=True),
        sa.Column("prioridade", sa.String(length=32), nullable=False, server_default="Eletivo"),
        sa.Column("procedimento_motivo", sa.Text(), nullable=True),
        sa.Column("justificativa_clinica", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["consulta_id"], ["consultas.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_consulta_encaminhamentos_consulta_id"), "consulta_encaminhamentos", ["consulta_id"], unique=False)
    op.create_index(op.f("ix_consulta_encaminhamentos_id"), "consulta_encaminhamentos", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_consulta_encaminhamentos_id"), table_name="consulta_encaminhamentos")
    op.drop_index(op.f("ix_consulta_encaminhamentos_consulta_id"), table_name="consulta_encaminhamentos")
    op.drop_table("consulta_encaminhamentos")
