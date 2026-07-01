"""
Popula o app.db local (SQLite) com histórico clínico completo para TODOS os
pacientes de data/pacientes.csv (a base de pacientes — não confundir com
data/fila.csv, que é só o subconjunto agendado para "hoje").

Gera, por paciente, pelo menos 6 meses de histórico (6 consultas ao longo de
~7 meses) cobrindo todas as seções do formulário de consulta que já têm
tabela no banco: antropometria, anamnese, triagem neonatal, diagnóstico,
hipóteses/condutas, imunizações, escolaridade, procedimentos, dados externos,
história familiar, dinâmica familiar, condições socioeconômicas,
encaminhamentos e marcos do desenvolvimento — além de alertas clínicos
derivados dos próprios dados gerados (faltas, encaminhamentos, tendência de
peso, marcos não atingidos).

NÃO cobre Exame Físico nem M-CHAT-R: essas duas seções do formulário ainda
não têm tabela no banco (só existem no Pinia do frontend, nunca foram
persistidas) — fora de escopo deste script.

Os dados são gerados a partir de sinais reais do CSV (dt_nascimento, faltas,
nome_especialidade) com variação determinística por paciente (seed = número
do prontuário) — reproduzível, mas não hardcoded por paciente. Qualquer
paciente novo no CSV ganha histórico completo ao rodar o script de novo.

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
import json
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
    ConsultaAnamnese,
    ConsultaTriagemNeonatal,
    ConsultaDiagnostico,
    ConsultaHipotesesCondutas,
    ConsultaImunizacoes,
    ConsultaEscolaridade,
    ConsultaProcedimentos,
    ConsultaDadosExternos,
    ConsultaHistoriaFamiliar,
    ConsultaDinamicaFamiliar,
    ConsultaCondicoesSocioeconomicas,
    ConsultaEncaminhamento,
    ConsultaMarcoDesenvolvimento,
)

MEDICO_USERNAME = "admin"
CSV_PATH = os.getenv("PACIENTE_CSV_PATH", "data/pacientes.csv")

# 6 consultas ao longo de ~7,3 meses — garante pelo menos 6 meses de histórico.
_DIAS_ATRAS_CONSULTAS = [220, 180, 140, 95, 50, 15]

# Tabela de referência aproximada peso/altura por idade em meses (não é
# protocolo clínico — só para gerar uma tendência de crescimento plausível
# nos dados de exemplo). Interpolação linear entre pontos.
_REFERENCIA_CRESCIMENTO = [
    (0, 3.3, 50.0), (3, 6.0, 60.0), (6, 7.9, 67.0), (9, 9.0, 71.0),
    (12, 9.9, 75.0), (18, 11.0, 82.0), (24, 12.2, 87.0), (36, 14.3, 96.0),
    (48, 16.3, 103.0), (60, 18.3, 110.0), (72, 20.5, 116.0), (84, 22.5, 121.0),
    (96, 24.8, 127.0), (108, 27.2, 132.0), (120, 30.0, 137.0), (144, 35.0, 148.0),
]

# Perímetro cefálico só é aferido rotineiramente até os 24 meses.
_REFERENCIA_PERIMETRO_CEFALICO = [(0, 34.5), (6, 43.5), (12, 46.5), (18, 47.8), (24, 48.5)]

_CIDS_ROTINA = ["Z00.1"]
_CIDS_QUEIXA = ["J06.9", "K59.0", "H65.9", "J20.9", "L20.9"]

_QUEIXAS_PRINCIPAIS = [
    "Consulta de rotina, sem queixas.",
    "Mãe relata tosse e coriza há 3 dias.",
    "Retorno para reavaliação de crescimento.",
    "Episódios de constipação nas últimas semanas.",
    "Acompanhamento de rotina do desenvolvimento.",
]
_ALIMENTACAO_TIPOS = ["Aleitamento materno exclusivo", "Aleitamento materno + fórmula", "Alimentação complementar", "Alimentação familiar"]
_SONO_HORARIOS = ["Dorme por volta das 20h, acorda 1x à noite", "Sono irregular, sem rotina fixa", "Dorme 10h por noite, sem despertares"]
_STATUS_VACINAL_TEXTOS = [
    "Esquema vacinal em dia conforme calendário PNI 2024.",
    "Aguardando 1 dose pendente — orientado retorno à UBS.",
    "Cartão de vacina desatualizado, orientado regularização.",
]
_HIPOTESES_TEXTOS = [
    "Desenvolvimento adequado para a idade. Manter acompanhamento de rotina.",
    "Quadro compatível com infecção de vias aéreas superiores, tratamento sintomático.",
    "Sem alterações significativas. Reforçadas orientações de puericultura.",
]
_PROCEDIMENTOS_POOL = ["Curativo simples", "Nebulização", "Coleta de exame laboratorial", "Administração de medicação"]

# grupo_id, min_meses, max_meses, colunas, marco_ids
_GRUPOS_MARCOS = [
    ("0-6m", 0, 6, [0, 1, 2, 3, 4, 5, 6], [f"n0-{i}" for i in range(1, 17)]),
    ("6m-18m", 6, 18, [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], [f"n6-{i}" for i in range(1, 16)]),
    ("18m-3a", 18, 42, [18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42], [f"n18-{i}" for i in range(1, 17)]),
    ("3a-5a", 42, 60, [42, 44, 46, 48, 50, 52, 54, 56, 58, 60], [f"n42-{i}" for i in range(1, 13)]),
    ("5a-6a", 60, 72, [60, 62, 64, 66, 68, 70, 72], [f"n60-{i}" for i in range(1, 9)]),
]


def _idade_em_meses(dt_nascimento: str, referencia: datetime) -> int:
    nascimento = datetime.strptime(dt_nascimento, "%Y-%m-%d")
    meses = (referencia.year - nascimento.year) * 12 + (referencia.month - nascimento.month)
    if referencia.day < nascimento.day:
        meses -= 1
    return max(meses, 0)


def _interpolar(tabela: list[tuple], idade_meses: int, indice_valor: int = 1) -> float:
    if idade_meses <= tabela[0][0]:
        return tabela[0][indice_valor]
    if idade_meses >= tabela[-1][0]:
        return tabela[-1][indice_valor]
    for p0, p1 in zip(tabela, tabela[1:]):
        if p0[0] <= idade_meses <= p1[0]:
            fracao = (idade_meses - p0[0]) / (p1[0] - p0[0])
            return p0[indice_valor] + (p1[indice_valor] - p0[indice_valor]) * fracao
    return tabela[-1][indice_valor]


def _peso_altura_esperados(idade_meses: int) -> tuple[float, float]:
    peso = _interpolar([(m, p) for m, p, _ in _REFERENCIA_CRESCIMENTO], idade_meses)
    altura = _interpolar([(m, a) for m, _, a in _REFERENCIA_CRESCIMENTO], idade_meses)
    return round(peso, 1), round(altura, 1)


def _classificar_imc(imc: float) -> str:
    if imc < 14:
        return "abaixo"
    if imc > 18:
        return "sobrepeso"
    return "normal"


def _grupo_marco_para_idade(idade_meses: int):
    for grupo in _GRUPOS_MARCOS:
        _, minimo, maximo, _, _ = grupo
        if minimo <= idade_meses <= maximo:
            return grupo
    return None


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


def _gerar_dados_consulta(row: dict[str, str], dias_atras: int, rng: random.Random) -> dict:
    hoje = datetime.now()
    data_consulta = hoje - timedelta(days=dias_atras)
    idade_meses = _idade_em_meses(row["dt_nascimento"], data_consulta)

    peso, altura = _peso_altura_esperados(idade_meses)
    peso = round(peso * rng.uniform(0.94, 1.06), 1)
    altura = round(altura * rng.uniform(0.98, 1.02), 1)
    imc = round(peso / ((altura / 100) ** 2), 1) if altura else None
    perimetro = None
    if idade_meses <= 24:
        perimetro = round(_interpolar(_REFERENCIA_PERIMETRO_CEFALICO, idade_meses) * rng.uniform(0.98, 1.02), 1)
    pressao_sistolica = pressao_diastolica = None
    if idade_meses >= 36:
        pressao_sistolica = rng.randint(90, 110)
        pressao_diastolica = rng.randint(55, 70)

    cid = rng.choice(_CIDS_QUEIXA) if rng.random() < 0.25 else rng.choice(_CIDS_ROTINA)
    cids_secundarios = "[]"
    if rng.random() < 0.15:
        cids_secundarios = json.dumps([{"cid": rng.choice(_CIDS_QUEIXA), "descricao": ""}])

    return {
        "data": data_consulta,
        "idade_meses": idade_meses,
        "peso": peso,
        "altura": altura,
        "imc": imc,
        "classificacao_imc": _classificar_imc(imc) if imc else None,
        "perimetro_cefalico": perimetro,
        "pressao_sistolica": pressao_sistolica,
        "pressao_diastolica": pressao_diastolica,
        "cid": cid,
        "cids_secundarios": cids_secundarios,
    }


async def _seed_consulta(
    session: AsyncSession, paciente_id: str, row: dict[str, str], dados: dict,
    rng: random.Random, eh_primeira: bool, eh_ultima: bool,
) -> tuple[Consulta, bool]:
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
        classificacao_imc=dados["classificacao_imc"],
        perimetro_cefalico=dados["perimetro_cefalico"],
        pressao_sistolica=dados["pressao_sistolica"],
        pressao_diastolica=dados["pressao_diastolica"],
    ))
    session.add(ConsultaDiagnostico(
        consulta_id=consulta.id,
        cid10_principal=dados["cid"],
        cids_secundarios=dados["cids_secundarios"],
    ))
    session.add(ConsultaAnamnese(
        consulta_id=consulta.id,
        clinica_queixa_principal=rng.choice(_QUEIXAS_PRINCIPAIS),
        alimentacao_tipo_aleitamento=rng.choice(_ALIMENTACAO_TIPOS),
        habitos_sono_horario=rng.choice(_SONO_HORARIOS),
        clinica_sistemas_interrogatorio_alterados="[]",
        habitos_telas_dispositivos="[]",
    ))
    session.add(ConsultaHipotesesCondutas(
        consulta_id=consulta.id,
        hipoteses_diagnosticas=rng.choice(_HIPOTESES_TEXTOS),
        condutas_plano_cuidado="Manter acompanhamento conforme calendário de puericultura.",
    ))
    session.add(ConsultaImunizacoes(
        consulta_id=consulta.id,
        status_vacinal=rng.choice(_STATUS_VACINAL_TEXTOS),
    ))

    if dados["idade_meses"] >= 24:
        session.add(ConsultaEscolaridade(
            consulta_id=consulta.id,
            frequenta_escola_creche=rng.random() < 0.7,
            ano_serie="Educação Infantil" if dados["idade_meses"] < 72 else "Fundamental I",
            houve_reprovacao=False,
        ))

    if rng.random() < 0.2:
        session.add(ConsultaProcedimentos(
            consulta_id=consulta.id,
            realizados=True,
            procedimentos_json=json.dumps([{"nome": rng.choice(_PROCEDIMENTOS_POOL), "quantidade": 1}]),
        ))

    if eh_primeira and rng.random() < 0.4:
        session.add(ConsultaDadosExternos(
            consulta_id=consulta.id,
            ordem=0,
            data_consulta_externa=(dados["data"] - timedelta(days=30)).date(),
            servico_origem=f"UBS {rng.choice(['Alto do Céu', 'Ibura', 'Casa Amarela', 'Boa Viagem'])}",
            peso=round(dados["peso"] * 0.92, 1),
            altura=round(dados["altura"] * 0.97, 1),
            observacoes_clinicas="Atendimento inicial na atenção básica antes do encaminhamento ao HC.",
            como_dados_obtidos="Dados fornecidos pela mãe a partir de caderneta física.",
        ))

    especialidade = row.get("nome_especialidade", "").strip()
    if eh_ultima and especialidade and especialidade != "PEDIATRIA GERAL":
        session.add(ConsultaEncaminhamento(
            consulta_id=consulta.id,
            ordem=0,
            especialidade=especialidade,
            prioridade="Eletivo",
            procedimento_motivo="Avaliação especializada",
            justificativa_clinica="Encaminhamento gerado via seed de desenvolvimento.",
        ))

    if eh_primeira:
        session.add(ConsultaTriagemNeonatal(
            consulta_id=consulta.id,
            idade_gestacional_semanas=rng.randint(37, 40),
            peso_nascimento_gramas=rng.randint(2800, 3800),
            teste_pezinho_resultado="Normal", teste_pezinho_data=dados["data"].date(),
            teste_orelhinha_resultado="Normal", teste_orelhinha_data=dados["data"].date(),
            teste_olhinho_resultado="Normal", teste_olhinho_data=dados["data"].date(),
            teste_coracaozinho_resultado="Normal", teste_coracaozinho_data=dados["data"].date(),
        ))
        session.add(ConsultaHistoriaFamiliar(
            consulta_id=consulta.id,
            houve_mudanca=False,
            maternal_idade=str(rng.randint(20, 38)),
            maternal_saude="Saudável",
            paternal_idade=str(rng.randint(22, 42)),
            paternal_saude="Saudável",
            coabitacao_pais="Sim" if rng.random() < 0.75 else "Não",
            irmaos_saude="Sem irmãos" if rng.random() < 0.4 else "Irmãos saudáveis",
        ))
        session.add(ConsultaDinamicaFamiliar(
            consulta_id=consulta.id,
            houve_mudanca=False,
            relacionamento_companheiro="Estável",
            fumante_domicilio=rng.random() < 0.1,
            uso_alcool_drogas=False,
            inseguranca_alimentar=rng.random() < 0.1,
            familiar_preso=False,
            preocupacao_comportamento=rng.random() < 0.1,
            disciplina_opcoes=json.dumps(["conversa"]),
        ))
        session.add(ConsultaCondicoesSocioeconomicas(
            consulta_id=consulta.id,
            renda_familiar=rng.choice(["Até 1 salário mínimo", "1 a 2 salários mínimos", "2 a 3 salários mínimos"]),
            tipo_casa="Alvenaria",
            numero_comodos=rng.randint(3, 6),
            banheiro="Interno",
            agua_encanada=True,
            energia_eletrica=True,
            esgoto="Rede pública",
            coleta_lixo=True,
            area_violencia=rng.random() < 0.15,
        ))

    tem_marco_nao_atingido = False
    grupo = _grupo_marco_para_idade(dados["idade_meses"])
    if grupo:
        _, minimo, _, colunas, marco_ids = grupo
        coluna_atual = max((c for c in colunas if c <= dados["idade_meses"]), default=minimo)
        for marco_id in marco_ids:
            sorteio = rng.random()
            status_marco = "not-achieved" if sorteio < 0.08 else ("not-evaluated" if sorteio < 0.15 else "confirmed")
            if status_marco == "not-achieved":
                tem_marco_nao_atingido = True
            session.add(ConsultaMarcoDesenvolvimento(
                consulta_id=consulta.id,
                marco_id=marco_id,
                idade_coluna_meses=coluna_atual,
                status=status_marco,
                observacao=None,
            ))

    return consulta, tem_marco_nao_atingido


def _gerar_alertas(row: dict[str, str], paciente_id: str, tendencia_peso_baixa: bool, algum_marco_nao_atingido: bool) -> list[tuple[str, str, str]]:
    """Deriva alertas de sinais reais: faltas do CSV, especialidade, tendência de
    peso e marcos não atingidos observados nos próprios dados gerados."""
    alertas: list[tuple[str, str, str]] = []
    faltas = int(row.get("faltas") or 0)
    especialidade = row.get("nome_especialidade", "").strip()

    if faltas >= 3:
        alertas.append((
            "critico", "negligencia",
            f"{faltas} faltas consecutivas sem justificativa — caso encaminhado ao Serviço Social",
        ))
    elif faltas >= 1:
        alertas.append(("atencao", "falta", f"{faltas} falta(s) registrada(s) sem reagendamento"))

    if especialidade and especialidade != "PEDIATRIA GERAL":
        alertas.append((
            "atencao", "encaminhamento",
            f"Encaminhamento para {especialidade} sem retorno confirmado",
        ))

    if tendencia_peso_baixa:
        alertas.append(("critico", "peso", "Peso abaixo da tendência esperada nas últimas 2 consultas"))

    if algum_marco_nao_atingido:
        alertas.append(("atencao", "marco", "Marco do desenvolvimento não confirmado na última consulta"))

    return alertas


async def _seed_paciente(session: AsyncSession, row: dict[str, str], reset: bool) -> bool:
    paciente_id = row["prontuario"]
    rng = random.Random(paciente_id)

    if reset:
        await session.execute(delete(Consulta).where(Consulta.paciente_id == paciente_id))
        await session.execute(delete(Alerta).where(Alerta.paciente_id == paciente_id))
    elif await _paciente_ja_seedado(session, paciente_id):
        return False

    n = len(_DIAS_ATRAS_CONSULTAS)
    tendencia_peso_baixa = rng.random() < 0.25
    algum_marco_nao_atingido = False
    pesos_gerados: list[float] = []

    for i, dias_atras in enumerate(_DIAS_ATRAS_CONSULTAS):
        dados = _gerar_dados_consulta(row, dias_atras, rng)
        if tendencia_peso_baixa and i == n - 1 and pesos_gerados:
            dados["peso"] = round(pesos_gerados[-1] * rng.uniform(0.95, 0.99), 1)
            dados["imc"] = round(dados["peso"] / ((dados["altura"] / 100) ** 2), 1)
        pesos_gerados.append(dados["peso"])

        _, tem_marco_nao_atingido = await _seed_consulta(
            session, paciente_id, row, dados, rng, eh_primeira=(i == 0), eh_ultima=(i == n - 1)
        )
        if tem_marco_nao_atingido:
            algum_marco_nao_atingido = True

    for tipo, categoria, mensagem in _gerar_alertas(row, paciente_id, tendencia_peso_baixa, algum_marco_nao_atingido):
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
                print(f"  [ok] {row['prontuario']} ({row['nome']}) — {len(_DIAS_ATRAS_CONSULTAS)} consultas")
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
