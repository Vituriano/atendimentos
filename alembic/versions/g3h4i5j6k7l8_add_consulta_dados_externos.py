"""add consulta dados externos

Revision ID: g3h4i5j6k7l8
Revises: f2a3b4c5d6e7
Create Date: 2026-06-26 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "g3h4i5j6k7l8"
down_revision: Union[str, None] = "f2a3b4c5d6e7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "consulta_dados_externos",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("consulta_id", sa.Integer(), nullable=False),
        sa.Column("ordem", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("data_consulta_externa", sa.Date(), nullable=True),
        sa.Column("servico_origem", sa.Text(), nullable=True),
        sa.Column("peso", sa.Numeric(7, 2), nullable=True),
        sa.Column("altura", sa.Numeric(7, 2), nullable=True),
        sa.Column("observacoes_clinicas", sa.Text(), nullable=True),
        sa.Column("como_dados_obtidos", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["consulta_id"], ["consultas.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_consulta_dados_externos_id", "consulta_dados_externos", ["id"])
    op.create_index("ix_consulta_dados_externos_consulta_id", "consulta_dados_externos", ["consulta_id"])


def downgrade() -> None:
    op.drop_index("ix_consulta_dados_externos_consulta_id", table_name="consulta_dados_externos")
    op.drop_index("ix_consulta_dados_externos_id", table_name="consulta_dados_externos")
    op.drop_table("consulta_dados_externos")
