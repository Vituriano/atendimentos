"""add dinamica familiar disciplina outros

Revision ID: j6k7l8m9n0o1
Revises: i5j6k7l8m9n0
Create Date: 2026-07-21 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "j6k7l8m9n0o1"
down_revision: Union[str, Sequence[str], None] = "i5j6k7l8m9n0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("consulta_dinamica_familiar", sa.Column("disciplina_outros", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("consulta_dinamica_familiar", "disciplina_outros")
