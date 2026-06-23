"""create clinical tables

Revision ID: a1b2c3d4e5f6
Revises: 8a2efbe37bb6
Create Date: 2026-06-08 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '8a2efbe37bb6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'fila_atendimento',
        sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('paciente_id', sa.TEXT(), nullable=False),
        sa.Column('paciente_nome', sa.TEXT(), nullable=False),
        sa.Column('tipo_entrada', sa.TEXT(), nullable=False),
        sa.Column('status', sa.TEXT(), nullable=False, server_default='Aguardando'),
        sa.Column('tempo_espera', sa.INTEGER(), nullable=True, server_default='0'),
        sa.Column('faltas', sa.INTEGER(), nullable=True, server_default='0'),
        sa.Column('data_entrada', sa.TIMESTAMP(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('deleted_at', sa.TIMESTAMP(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'consultas',
        sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('paciente_id', sa.TEXT(), nullable=False),
        sa.Column('medico_username', sa.TEXT(), nullable=False),
        sa.Column('data', sa.TIMESTAMP(), nullable=False),
        sa.Column('status', sa.TEXT(), nullable=False, server_default='em_andamento'),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('deleted_at', sa.TIMESTAMP(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'consulta_antropometria',
        sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('consulta_id', sa.INTEGER(), nullable=False),
        sa.Column('peso', sa.REAL(), nullable=True),
        sa.Column('altura', sa.REAL(), nullable=True),
        sa.Column('perimetro_cefalico', sa.REAL(), nullable=True),
        sa.Column('imc', sa.REAL(), nullable=True),
        sa.Column('pressao_arterial', sa.TEXT(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('deleted_at', sa.TIMESTAMP(), nullable=True),
        sa.ForeignKeyConstraint(['consulta_id'], ['consultas.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'consulta_anamnese',
        sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('consulta_id', sa.INTEGER(), nullable=False),
        sa.Column('motivo_consulta', sa.TEXT(), nullable=True),
        sa.Column('historia_pregressa', sa.TEXT(), nullable=True),
        sa.Column('alimentacao', sa.TEXT(), nullable=True),
        sa.Column('habitos', sa.TEXT(), nullable=True),
        sa.Column('texto_livre', sa.TEXT(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('deleted_at', sa.TIMESTAMP(), nullable=True),
        sa.ForeignKeyConstraint(['consulta_id'], ['consultas.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'consulta_exame_fisico',
        sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('consulta_id', sa.INTEGER(), nullable=False),
        sa.Column('sistema', sa.TEXT(), nullable=False),
        sa.Column('status', sa.TEXT(), nullable=False, server_default='nao-avaliado'),
        sa.Column('descricao', sa.TEXT(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('deleted_at', sa.TIMESTAMP(), nullable=True),
        sa.ForeignKeyConstraint(['consulta_id'], ['consultas.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'consulta_marcos',
        sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('consulta_id', sa.INTEGER(), nullable=False),
        sa.Column('marco_id', sa.TEXT(), nullable=False),
        sa.Column('status', sa.TEXT(), nullable=False, server_default='not-evaluated'),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('deleted_at', sa.TIMESTAMP(), nullable=True),
        sa.ForeignKeyConstraint(['consulta_id'], ['consultas.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'consulta_mchat',
        sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('consulta_id', sa.INTEGER(), nullable=False),
        sa.Column('pergunta_id', sa.TEXT(), nullable=False),
        sa.Column('resposta', sa.BOOLEAN(), nullable=True),
        sa.Column('score_total', sa.INTEGER(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('deleted_at', sa.TIMESTAMP(), nullable=True),
        sa.ForeignKeyConstraint(['consulta_id'], ['consultas.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'consulta_diagnosticos',
        sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('consulta_id', sa.INTEGER(), nullable=False),
        sa.Column('cid', sa.TEXT(), nullable=False),
        sa.Column('descricao', sa.TEXT(), nullable=True),
        sa.Column('eh_principal', sa.BOOLEAN(), nullable=True, server_default='0'),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('deleted_at', sa.TIMESTAMP(), nullable=True),
        sa.ForeignKeyConstraint(['consulta_id'], ['consultas.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'consulta_encaminhamentos',
        sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('consulta_id', sa.INTEGER(), nullable=False),
        sa.Column('especialidade', sa.TEXT(), nullable=False),
        sa.Column('procedimento', sa.TEXT(), nullable=True),
        sa.Column('justificativa', sa.TEXT(), nullable=True),
        sa.Column('prioridade', sa.TEXT(), nullable=True, server_default='Eletivo'),
        sa.Column('confirmado_retorno', sa.BOOLEAN(), nullable=True, server_default='0'),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('deleted_at', sa.TIMESTAMP(), nullable=True),
        sa.ForeignKeyConstraint(['consulta_id'], ['consultas.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'alertas',
        sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('paciente_id', sa.TEXT(), nullable=False),
        sa.Column('tipo', sa.TEXT(), nullable=False),
        sa.Column('categoria', sa.TEXT(), nullable=False),
        sa.Column('mensagem', sa.TEXT(), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('deleted_at', sa.TIMESTAMP(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('alertas')
    op.drop_table('consulta_encaminhamentos')
    op.drop_table('consulta_diagnosticos')
    op.drop_table('consulta_mchat')
    op.drop_table('consulta_marcos')
    op.drop_table('consulta_exame_fisico')
    op.drop_table('consulta_anamnese')
    op.drop_table('consulta_antropometria')
    op.drop_table('consultas')
    op.drop_table('fila_atendimento')
