"""
Popula o app.db local (SQLite) com histórico clínico de exemplo para TODOS os
pacientes de data/pacientes.csv, para permitir testar em desenvolvimento:
- Briefing Clínico (GET /api/briefing/{paciente_id}) com consultas, antropometria
  e padrões de conduta reais
- Endpoints de Alertas (GET/POST/PATCH /api/alertas) com registros já existentes
- Paginação da Base de Pacientes com histórico real em qualquer página

Os dados são gerados a partir de sinais reais do CSV (dt_nascimento, faltas,
nome_especialidade) — não são hardcoded por paciente — então qualquer paciente
adicionado ao CSV automaticamente ganha histórico ao rodar o script de novo.

Uso:
    uv run python scripts/seed_dev_data.py
    uv run python scripts/seed_dev_data.py --reset   # recria os dados seedados

Idempotente: para cada paciente, se já existir alguma Consulta ativa
(deleted_at IS NULL), o paciente é pulado — seguro rodar mais de uma vez.

Este script NÃO faz parte do runtime da aplicação (não é importado por
main.py/routers) — é uma ferramenta de desenvolvimento local, por isso usa
DELETE apenas com --reset (nunca em código de produção/runtime).
"""

import argparse
import asyncio
import csv
import os
import random
import sys
from datetime import datetime, timedelta

from dotenv import load_dotenv
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.resources.database import Base  # noqa: E402
from src.resources.schema import ensure_local_dev_schema  # noqa: E402
from src.models.consulta import (  # noqa: E402
    Alerta,
    Consulta,
    ConsultaAntropometria,
    ConsultaDiagnostico,
    ConsultaEncaminhamento,
)

MEDICO_USERNAME = "admin"
CSV_PATH = os.getenv("PACIENTE_CSV_PATH", "data/pacientes.csv")

# Cada consulta é gerada há N dias, da mais antiga para a mais recente.
_DIAS_ATRAS_CONSULTAS = [150, 60, 10]

# Tabela de referência aproximada peso/altura por idade em meses (não é
# protocolo clínico — só para gerar uma tendência de crescimento plausível
# nos dados de exemplo). Interpolação linear entre pontos.
_REFERENCIA_CRESCIMENTO = [
    (0, 3.3, 50.0), (3, 6.0, 60.0), (6, 7.9, 67.0), (9, 9.0, 71.0),
    (12, 9.9, 75.0), (18, 11.0, 82.0), (24, 12.2, 87.0), (36, 14.3, 96.0),
    (48, 16.3, 103.0), (60, 18.3, 110.0), (72, 20.5, 116.0), (84, 22.5, 121.0),
    (96, 24.8, 127.0), (108, 27.2, 132.0), (120, 30.0, 137.0), (144, 35.0, 148.0),
]

_CIDS_ROTINA = ["Z00.1"]
_CIDS_QUEIXA = ["J06.9", "K59.0", "H65.9", "J20.9", "L20.9"]

# Janela de aplicação do M-CHAT-R (04-modelo-dados.md) — usada só para sinalizar
# alerta de marco pendente, não para de fato aplicar o protocolo clínico.
_JANELA_MCHAT_MESES = (16, 30)


def _idade_em_meses(dt_nascimento: str, referencia: datetime) -> int:
    nascimento = datetime.strptime(dt_nascimento, "%Y-%m-%d")
    meses = (referencia.year - nascimento.year) * 12 + (referencia.month - nascimento.month)
    if referencia.day < nascimento.day:
        meses -= 1
    return max(meses, 0)


def _peso_altura_esperados(idade_meses: int) -> tuple[float, float]:
    pontos = _REFERENCIA_CRESCIMENTO
    if idade_meses <= pontos[0][0]:
        return pontos[0][1], pontos[0][2]
    if idade_meses >= pontos[-1][0]:
        return pontos[-1][1], pontos[-1][2]
    for (m0, p0, a0), (m1, p1, a1) in zip(pontos, pontos[1:]):
        if m0 <= idade_meses <= m1:
            fracao = (idade_meses - m0) / (m1 - m0)
            peso = p0 + (p1 - p0) * fracao
            altura = a0 + (a1 - a0) * fracao
            return round(peso, 1), round(altura, 1)
    return pontos[-1][1], pontos[-1][2]


def _ler_pacientes_csv() -> list[dict[str, str]]:
    with open(CSV_PATH, mode="r", encoding="utf-8") as f:
        return list(csv.DictReader(f))


async def _paciente_ja_seedado(session: AsyncSession, paciente_id: str) -> bool:
    stmt = select(Consulta.id).where(
        Consulta.paciente_id == paciente_id,
        Consulta.deleted_at.is_(None),
    ).limit(1)
    result = await session.execute(stmt)
    return result.scalar_one_or_none() is not None


def _gerar_consultas_paciente(row: dict[str, str], rng: random.Random) -> list[dict]:
    hoje = datetime.now()
    especialidade = row.get("nome_especialidade", "").strip()
    tem_encaminhamento = especialidade and especialidade != "PEDIATRIA GERAL"

    consultas = []
    for i, dias_atras in enumerate(_DIAS_ATRAS_CONSULTAS):
        data_consulta = hoje - timedelta(days=dias_atras)
        idade_meses = _idade_em_meses(row["dt_nascimento"], data_consulta)
        peso, altura = _peso_altura_esperados(idade_meses)
        # pequena variação determinística por paciente para não ficar tudo idêntico
        peso = round(peso * rng.uniform(0.92, 1.08), 1)
        altura = round(altura * rng.uniform(0.97, 1.03), 1)
        imc = round(peso / ((altura / 100) ** 2), 1) if altura else None

        cid = rng.choice(_CIDS_QUEIXA) if rng.random() < 0.25 else rng.choice(_CIDS_ROTINA)
        eh_ultima_consulta = i == len(_DIAS_ATRAS_CONSULTAS) - 1

        consultas.append({
            "data": data_consulta,
            "peso": peso,
            "altura": altura,
            "imc": imc,
            "cid": cid,
            "encaminhamento": especialidade if (tem_encaminhamento and eh_ultima_consulta) else None,
        })
    return consultas


def _gerar_alertas_paciente(row: dict[str, str], paciente_id: str) -> list[tuple[str, str, str]]:
    """Retorna [(tipo, categoria, mensagem), ...] derivado de sinais reais do CSV."""
    alertas: list[tuple[str, str, str]] = []
    faltas = int(row.get("faltas") or 0)
    especialidade = row.get("nome_especialidade", "").strip()
    idade_meses = _idade_em_meses(row["dt_nascimento"], datetime.now())

    if faltas >= 3:
        alertas.append((
            "critico", "negligencia",
            f"{faltas} faltas consecutivas sem justificativa — caso encaminhado ao Serviço Social",
        ))
    elif faltas >= 1:
        alertas.append((
            "atencao", "falta",
            f"{faltas} falta(s) registrada(s) sem reagendamento",
        ))

    if especialidade and especialidade != "PEDIATRIA GERAL":
        alertas.append((
            "atencao", "encaminhamento",
            f"Encaminhamento para {especialidade} sem retorno confirmado",
        ))

    if _JANELA_MCHAT_MESES[0] <= idade_meses <= _JANELA_MCHAT_MESES[1]:
        alertas.append((
            "atencao", "marco",
            "Marco do desenvolvimento pendente de avaliação (janela M-CHAT-R 16–30 meses)",
        ))

    return alertas


async def _seed_paciente(session: AsyncSession, row: dict[str, str], reset: bool) -> bool:
    paciente_id = row["prontuario"]
    rng = random.Random(paciente_id)

    if reset:
        await session.execute(delete(Consulta).where(Consulta.paciente_id == paciente_id))
        await session.execute(delete(Alerta).where(Alerta.paciente_id == paciente_id))
    elif await _paciente_ja_seedado(session, paciente_id):
        return False

    for dados in _gerar_consultas_paciente(row, rng):
        consulta = Consulta(
            paciente_id=paciente_id,
            medico_username=MEDICO_USERNAME,
            data=dados["data"],
            status="finalizada",
        )
        session.add(consulta)
        await session.flush()

        session.add(ConsultaAntropometria(
            consulta_id=consulta.id,
            peso=dados["peso"],
            altura=dados["altura"],
            imc=dados["imc"],
        ))
        session.add(ConsultaDiagnostico(
            consulta_id=consulta.id,
            cid10_principal=dados["cid"],
            cids_secundarios="[]",
        ))
        if dados["encaminhamento"]:
            session.add(ConsultaEncaminhamento(
                consulta_id=consulta.id,
                ordem=0,
                especialidade=dados["encaminhamento"],
                prioridade="Eletivo",
                procedimento_motivo="Avaliação especializada",
                justificativa_clinica="Encaminhamento gerado via seed de desenvolvimento.",
            ))

    for tipo, categoria, mensagem in _gerar_alertas_paciente(row, paciente_id):
        session.add(Alerta(paciente_id=paciente_id, tipo=tipo, categoria=categoria, mensagem=mensagem))

    return True


async def main(reset: bool) -> None:
    load_dotenv()
    dsn = os.getenv("SQLITE_DSN", "sqlite+aiosqlite:///app.db")

    engine = create_async_engine(dsn, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await ensure_local_dev_schema(engine)

    pacientes = _ler_pacientes_csv()
    print(f"Lidos {len(pacientes)} pacientes de {CSV_PATH}")

    session_maker = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    seedados, pulados = 0, 0
    async with session_maker() as session:
        for row in pacientes:
            criado = await _seed_paciente(session, row, reset)
            if criado:
                seedados += 1
                print(f"  [ok] {row['prontuario']} ({row['nome']})")
            else:
                pulados += 1
                print(f"  [skip] {row['prontuario']} já tem consultas — use --reset para recriar")
        await session.commit()

    await engine.dispose()
    print(f"Concluído. {seedados} pacientes seedados, {pulados} pulados.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--reset", action="store_true",
        help="Remove os dados seedados de todos os pacientes do CSV antes de recriar."
    )
    args = parser.parse_args()
    asyncio.run(main(reset=args.reset))
