"""add consulta anamnese antecedentes perinatais

Revision ID: k7l8m9n0o1p2
Revises: j6k7l8m9n0o1
Create Date: 2026-07-23 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "k7l8m9n0o1p2"
down_revision: Union[str, Sequence[str], None] = "j6k7l8m9n0o1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("consulta_anamnese", sa.Column("clinica_antecedentes_perinatais", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("consulta_anamnese", "clinica_antecedentes_perinatais")
