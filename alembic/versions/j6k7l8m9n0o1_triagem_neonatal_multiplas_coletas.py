"""triagem neonatal multiplas coletas e separacao fundo de olho

Revision ID: j6k7l8m9n0o1
Revises: i5j6k7l8m9n0
Create Date: 2026-07-21 09:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = "j6k7l8m9n0o1"
down_revision = "i5j6k7l8m9n0"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("consulta_triagem_neonatal") as batch_op:
        # Coletas múltiplas (pezinho até 4, orelhinha ilimitada) num array JSON,
        # mesmo padrão de cids_secundarios — evita tabela filha.
        batch_op.add_column(
            sa.Column(
                "teste_pezinho_coletas",
                sa.Text(),
                nullable=False,
                server_default="[]",
            )
        )
        batch_op.add_column(
            sa.Column(
                "teste_orelhinha_coletas",
                sa.Text(),
                nullable=False,
                server_default="[]",
            )
        )
        # Fundo de olho separado do teste do olhinho.
        batch_op.add_column(sa.Column("teste_fundo_olho_resultado", sa.String(length=32), nullable=True))
        batch_op.add_column(sa.Column("teste_fundo_olho_data", sa.Date(), nullable=True))
        batch_op.add_column(sa.Column("teste_fundo_olho_descricao", sa.Text(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("consulta_triagem_neonatal") as batch_op:
        batch_op.drop_column("teste_fundo_olho_descricao")
        batch_op.drop_column("teste_fundo_olho_data")
        batch_op.drop_column("teste_fundo_olho_resultado")
        batch_op.drop_column("teste_orelhinha_coletas")
        batch_op.drop_column("teste_pezinho_coletas")
