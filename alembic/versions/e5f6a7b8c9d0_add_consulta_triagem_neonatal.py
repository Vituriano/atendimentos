"""add consulta triagem neonatal

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2026-06-26 06:40:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = "e5f6a7b8c9d0"
down_revision = "d4e5f6a7b8c9"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "consulta_triagem_neonatal",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("consulta_id", sa.Integer(), nullable=False),
        sa.Column("idade_gestacional_semanas", sa.Integer(), nullable=True),
        sa.Column("peso_nascimento_gramas", sa.Integer(), nullable=True),
        sa.Column("hipoteses_diagnosticas_anteriores", sa.Text(), nullable=True),
        sa.Column("teste_pezinho_resultado", sa.String(length=32), nullable=True),
        sa.Column("teste_pezinho_data", sa.Date(), nullable=True),
        sa.Column("teste_pezinho_descricao", sa.Text(), nullable=True),
        sa.Column("teste_orelhinha_resultado", sa.String(length=32), nullable=True),
        sa.Column("teste_orelhinha_data", sa.Date(), nullable=True),
        sa.Column("teste_orelhinha_descricao", sa.Text(), nullable=True),
        sa.Column("teste_olhinho_resultado", sa.String(length=32), nullable=True),
        sa.Column("teste_olhinho_data", sa.Date(), nullable=True),
        sa.Column("teste_olhinho_descricao", sa.Text(), nullable=True),
        sa.Column("teste_coracaozinho_resultado", sa.String(length=32), nullable=True),
        sa.Column("teste_coracaozinho_data", sa.Date(), nullable=True),
        sa.Column("teste_coracaozinho_descricao", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["consulta_id"], ["consultas.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("consulta_id", name="uq_consulta_triagem_neonatal_consulta_id"),
    )
    op.create_index(op.f("ix_consulta_triagem_neonatal_consulta_id"), "consulta_triagem_neonatal", ["consulta_id"], unique=False)
    op.create_index(op.f("ix_consulta_triagem_neonatal_id"), "consulta_triagem_neonatal", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_consulta_triagem_neonatal_id"), table_name="consulta_triagem_neonatal")
    op.drop_index(op.f("ix_consulta_triagem_neonatal_consulta_id"), table_name="consulta_triagem_neonatal")
    op.drop_table("consulta_triagem_neonatal")
