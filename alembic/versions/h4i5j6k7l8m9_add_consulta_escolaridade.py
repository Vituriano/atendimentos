"""add consulta escolaridade

Revision ID: h4i5j6k7l8m9
Revises: g3h4i5j6k7l8
Create Date: 2026-06-26 08:40:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "h4i5j6k7l8m9"
down_revision: Union[str, None] = "g3h4i5j6k7l8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "consulta_escolaridade",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("consulta_id", sa.Integer(), nullable=False),
        sa.Column("frequenta_escola_creche", sa.Boolean(), nullable=True),
        sa.Column("ano_serie", sa.Text(), nullable=True),
        sa.Column("houve_reprovacao", sa.Boolean(), nullable=True),
        sa.Column("rendimento_relacionamento", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["consulta_id"], ["consultas.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("consulta_id", name="uq_consulta_escolaridade_consulta_id"),
    )
    op.create_index(op.f("ix_consulta_escolaridade_id"), "consulta_escolaridade", ["id"], unique=False)
    op.create_index(op.f("ix_consulta_escolaridade_consulta_id"), "consulta_escolaridade", ["consulta_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_consulta_escolaridade_consulta_id"), table_name="consulta_escolaridade")
    op.drop_index(op.f("ix_consulta_escolaridade_id"), table_name="consulta_escolaridade")
    op.drop_table("consulta_escolaridade")
