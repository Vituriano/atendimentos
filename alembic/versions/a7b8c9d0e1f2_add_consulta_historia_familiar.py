"""add consulta historia familiar

Revision ID: a7b8c9d0e1f2
Revises: f6a7b8c9d0e1
Create Date: 2026-06-26 07:10:00.000000
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "a7b8c9d0e1f2"
down_revision: Union[str, None] = "f6a7b8c9d0e1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "consulta_historia_familiar",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("consulta_id", sa.Integer(), nullable=False),
        sa.Column("houve_mudanca", sa.Boolean(), nullable=True),
        sa.Column("maternal_idade", sa.Text(), nullable=True),
        sa.Column("maternal_saude", sa.Text(), nullable=True),
        sa.Column("maternal_ocupacao", sa.Text(), nullable=True),
        sa.Column("paternal_idade", sa.Text(), nullable=True),
        sa.Column("paternal_saude", sa.Text(), nullable=True),
        sa.Column("paternal_ocupacao", sa.Text(), nullable=True),
        sa.Column("coabitacao_pais", sa.Text(), nullable=True),
        sa.Column("irmaos_saude", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["consulta_id"], ["consultas.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("consulta_id", name="uq_consulta_historia_familiar_consulta_id"),
    )
    op.create_index(op.f("ix_consulta_historia_familiar_id"), "consulta_historia_familiar", ["id"], unique=False)
    op.create_index(op.f("ix_consulta_historia_familiar_consulta_id"), "consulta_historia_familiar", ["consulta_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_consulta_historia_familiar_consulta_id"), table_name="consulta_historia_familiar")
    op.drop_index(op.f("ix_consulta_historia_familiar_id"), table_name="consulta_historia_familiar")
    op.drop_table("consulta_historia_familiar")
