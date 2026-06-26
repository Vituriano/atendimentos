"""add consulta diagnostico

Revision ID: d0e1f2a3b4c5
Revises: c9d0e1f2a3b4
Create Date: 2026-06-26 07:45:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "d0e1f2a3b4c5"
down_revision = "c9d0e1f2a3b4"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "consulta_diagnostico",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("consulta_id", sa.Integer(), nullable=False),
        sa.Column("cid10_principal", sa.Text(), nullable=True),
        sa.Column("cids_secundarios", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("sid", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["consulta_id"], ["consultas.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("consulta_id", name="uq_consulta_diagnostico_consulta_id"),
    )
    op.create_index(op.f("ix_consulta_diagnostico_consulta_id"), "consulta_diagnostico", ["consulta_id"], unique=False)
    op.create_index(op.f("ix_consulta_diagnostico_id"), "consulta_diagnostico", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_consulta_diagnostico_id"), table_name="consulta_diagnostico")
    op.drop_index(op.f("ix_consulta_diagnostico_consulta_id"), table_name="consulta_diagnostico")
    op.drop_table("consulta_diagnostico")
