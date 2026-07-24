"""add consulta anamnese exames trazidos

Revision ID: z7a8b9c0d1e2
Revises: t1u2v3w4x5y6
Create Date: 2026-07-23 00:00:01.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "z7a8b9c0d1e2"
down_revision: Union[str, Sequence[str], None] = "t1u2v3w4x5y6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "consulta_anamnese",
        sa.Column("clinica_exames_trazidos", sa.Text(), nullable=False, server_default="[]"),
    )


def downgrade() -> None:
    op.drop_column("consulta_anamnese", "clinica_exames_trazidos")
