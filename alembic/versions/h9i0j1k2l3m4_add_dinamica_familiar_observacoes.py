"""add dinamica familiar observacoes

Revision ID: h9i0j1k2l3m4
Revises: b3c4d5e6f7g8
Create Date: 2026-07-21 00:00:01.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "h9i0j1k2l3m4"
down_revision: Union[str, Sequence[str], None] = "b3c4d5e6f7g8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "consulta_dinamica_familiar",
        sa.Column("observacoes", sa.Text(), nullable=False, server_default="{}"),
    )


def downgrade() -> None:
    op.drop_column("consulta_dinamica_familiar", "observacoes")
