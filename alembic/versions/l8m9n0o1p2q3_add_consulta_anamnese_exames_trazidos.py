"""add consulta anamnese exames trazidos

Revision ID: l8m9n0o1p2q3
Revises: k7l8m9n0o1p2
Create Date: 2026-07-23 00:00:01.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "l8m9n0o1p2q3"
down_revision: Union[str, Sequence[str], None] = "k7l8m9n0o1p2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "consulta_anamnese",
        sa.Column("clinica_exames_trazidos", sa.Text(), nullable=False, server_default="[]"),
    )


def downgrade() -> None:
    op.drop_column("consulta_anamnese", "clinica_exames_trazidos")
