"""add consulta marcos desenvolvimento

Revision ID: i5j6k7l8m9n0
Revises: h4i5j6k7l8m9
Create Date: 2026-06-27 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = 'i5j6k7l8m9n0'
down_revision = 'h4i5j6k7l8m9'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'consulta_marcos_desenvolvimento',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('consulta_id', sa.Integer(), nullable=False),
        sa.Column('marco_id', sa.Text(), nullable=False),
        sa.Column('idade_coluna_meses', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False),
        sa.Column('observacao', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['consulta_id'], ['consultas.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('consulta_id', 'marco_id', 'idade_coluna_meses', name='uq_consulta_marco_idade'),
    )
    op.create_index(op.f('ix_consulta_marcos_desenvolvimento_id'), 'consulta_marcos_desenvolvimento', ['id'], unique=False)
    op.create_index(op.f('ix_consulta_marcos_desenvolvimento_consulta_id'), 'consulta_marcos_desenvolvimento', ['consulta_id'], unique=False)
    op.create_index(op.f('ix_consulta_marcos_desenvolvimento_marco_id'), 'consulta_marcos_desenvolvimento', ['marco_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_consulta_marcos_desenvolvimento_marco_id'), table_name='consulta_marcos_desenvolvimento')
    op.drop_index(op.f('ix_consulta_marcos_desenvolvimento_consulta_id'), table_name='consulta_marcos_desenvolvimento')
    op.drop_index(op.f('ix_consulta_marcos_desenvolvimento_id'), table_name='consulta_marcos_desenvolvimento')
    op.drop_table('consulta_marcos_desenvolvimento')
