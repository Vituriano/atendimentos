"""add consulta hipoteses condutas

Revision ID: e1f2a3b4c5d6
Revises: d0e1f2a3b4c5
Create Date: 2026-06-26 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e1f2a3b4c5d6"
down_revision: Union[str, None] = "d0e1f2a3b4c5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "consulta_hipoteses_condutas",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("consulta_id", sa.Integer(), nullable=False),
        sa.Column("hipoteses_diagnosticas", sa.Text(), nullable=True),
        sa.Column("condutas_plano_cuidado", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["consulta_id"], ["consultas.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("consulta_id", name="uq_consulta_hipoteses_condutas_consulta_id"),
    )
    op.create_index(op.f("ix_consulta_hipoteses_condutas_id"), "consulta_hipoteses_condutas", ["id"], unique=False)
    op.create_index(op.f("ix_consulta_hipoteses_condutas_consulta_id"), "consulta_hipoteses_condutas", ["consulta_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_consulta_hipoteses_condutas_consulta_id"), table_name="consulta_hipoteses_condutas")
    op.drop_index(op.f("ix_consulta_hipoteses_condutas_id"), table_name="consulta_hipoteses_condutas")
    op.drop_table("consulta_hipoteses_condutas")
