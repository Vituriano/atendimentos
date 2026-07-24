"""add consulta anamnese acompanhamentos

Revision ID: n5o6p7q8r9s0
Revises: h9i0j1k2l3m4
Create Date: 2026-07-21 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "n5o6p7q8r9s0"
down_revision: Union[str, Sequence[str], None] = "h9i0j1k2l3m4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("consulta_anamnese", sa.Column("clinica_acompanhamentos", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("consulta_anamnese", "clinica_acompanhamentos")
