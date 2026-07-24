"""add consulta anamnese antecedentes perinatais

Revision ID: t1u2v3w4x5y6
Revises: n5o6p7q8r9s0
Create Date: 2026-07-23 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "t1u2v3w4x5y6"
down_revision: Union[str, Sequence[str], None] = "n5o6p7q8r9s0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("consulta_anamnese", sa.Column("clinica_antecedentes_perinatais", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("consulta_anamnese", "clinica_antecedentes_perinatais")
