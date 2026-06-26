"""add antropometria detail columns

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-06-26 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, Sequence[str], None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("consulta_antropometria", sa.Column("classificacao_imc", sa.String(length=32), nullable=True))
    op.add_column("consulta_antropometria", sa.Column("pressao_sistolica", sa.Integer(), nullable=True))
    op.add_column("consulta_antropometria", sa.Column("pressao_diastolica", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("consulta_antropometria", "pressao_diastolica")
    op.drop_column("consulta_antropometria", "pressao_sistolica")
    op.drop_column("consulta_antropometria", "classificacao_imc")
