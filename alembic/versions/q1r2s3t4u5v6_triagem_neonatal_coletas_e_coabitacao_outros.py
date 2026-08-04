"""triagem neonatal olhinho/fundo de olho/coracaozinho com coletas e coabitacao outros

Revision ID: q1r2s3t4u5v6
Revises: z7a8b9c0d1e2
Create Date: 2026-07-29 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "q1r2s3t4u5v6"
down_revision: Union[str, Sequence[str], None] = "z7a8b9c0d1e2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("consulta_triagem_neonatal") as batch_op:
        # Olhinho, fundo de olho e coraçãozinho passam a aceitar múltiplas
        # coletas, mesmo padrão (array JSON) já usado por pezinho/orelhinha.
        batch_op.add_column(
            sa.Column("teste_olhinho_coletas", sa.Text(), nullable=False, server_default="[]")
        )
        batch_op.add_column(
            sa.Column("teste_fundo_olho_coletas", sa.Text(), nullable=False, server_default="[]")
        )
        batch_op.add_column(
            sa.Column("teste_coracaozinho_coletas", sa.Text(), nullable=False, server_default="[]")
        )

    op.add_column(
        "consulta_historia_familiar",
        sa.Column("coabitacao_pais_outros", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("consulta_historia_familiar", "coabitacao_pais_outros")

    with op.batch_alter_table("consulta_triagem_neonatal") as batch_op:
        batch_op.drop_column("teste_coracaozinho_coletas")
        batch_op.drop_column("teste_fundo_olho_coletas")
        batch_op.drop_column("teste_olhinho_coletas")
