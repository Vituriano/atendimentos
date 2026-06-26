"""add consulta imunizacoes

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-06-26 06:10:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d4e5f6a7b8c9"
down_revision: Union[str, None] = "c3d4e5f6a7b8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "consulta_imunizacoes",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("consulta_id", sa.Integer(), nullable=False),
        sa.Column("status_vacinal", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["consulta_id"], ["consultas.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("consulta_id", name="uq_consulta_imunizacoes_consulta_id"),
    )
    op.create_index(op.f("ix_consulta_imunizacoes_id"), "consulta_imunizacoes", ["id"], unique=False)
    op.create_index(op.f("ix_consulta_imunizacoes_consulta_id"), "consulta_imunizacoes", ["consulta_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_consulta_imunizacoes_consulta_id"), table_name="consulta_imunizacoes")
    op.drop_index(op.f("ix_consulta_imunizacoes_id"), table_name="consulta_imunizacoes")
    op.drop_table("consulta_imunizacoes")
