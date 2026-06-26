"""add consulta procedimentos

Revision ID: f2a3b4c5d6e7
Revises: e1f2a3b4c5d6
Create Date: 2026-06-26 08:08:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f2a3b4c5d6e7"
down_revision: Union[str, None] = "e1f2a3b4c5d6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "consulta_procedimentos",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("consulta_id", sa.Integer(), nullable=False),
        sa.Column("realizados", sa.Boolean(), nullable=True),
        sa.Column("procedimentos_json", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["consulta_id"], ["consultas.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("consulta_id", name="uq_consulta_procedimentos_consulta_id"),
    )
    op.create_index(op.f("ix_consulta_procedimentos_id"), "consulta_procedimentos", ["id"], unique=False)
    op.create_index(op.f("ix_consulta_procedimentos_consulta_id"), "consulta_procedimentos", ["consulta_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_consulta_procedimentos_consulta_id"), table_name="consulta_procedimentos")
    op.drop_index(op.f("ix_consulta_procedimentos_id"), table_name="consulta_procedimentos")
    op.drop_table("consulta_procedimentos")
