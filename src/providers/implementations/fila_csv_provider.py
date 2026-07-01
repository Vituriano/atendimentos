import csv
from datetime import datetime, timedelta
from typing import Any

from ..interfaces.fila_provider_interface import FilaProviderInterface

_ORIGEM = "AGHU-CSV"

# Mapeia o status AGHU do paciente (data/pacientes.csv) para o status da fila.
_STATUS_MAP = {
    "PACIENTE AGENDADO": "Aguardando",
    "EM ATENDIMENTO": "Em Atendimento",
    "ATENDIDO": "Finalizado",
    "FALTA": "Pendente",
}

# Mapeia o código de origem do paciente (ind_origem) para o tipo de entrada da fila.
_TIPO_ENTRADA_MAP = {
    "R": "Retorno",
    "EC": "Encaminhamento Externo",
    "E": "Egresso",
    "I": "Internacao",
}


def _parse_data_nascimento(dt_nascimento: str) -> datetime:
    valor = (dt_nascimento or "").strip()
    for formato in ("%d/%m/%Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(valor, formato)
        except ValueError:
            continue
    raise ValueError(f"Data de nascimento inválida no CSV: {dt_nascimento!r}")


def _pluralizar(valor: int, singular: str, plural: str) -> str:
    return f"{valor} {singular if valor == 1 else plural}"


def _calcular_idade_detalhada(dt_nascimento: str) -> dict[str, int | str]:
    nascimento = _parse_data_nascimento(dt_nascimento).date()
    hoje = datetime.now().date()

    if nascimento > hoje:
        return {
            "anos": 0,
            "meses": 0,
            "dias": 0,
            "texto": "0 dias",
        }

    meses = (hoje.year - nascimento.year) * 12 + (hoje.month - nascimento.month)
    if hoje.day < nascimento.day:
        meses -= 1
    meses = max(meses, 0)

    anos = meses // 12
    meses_restantes = meses % 12
    dias = max((hoje - nascimento).days, 0)

    if anos > 0:
        texto = _pluralizar(anos, "ano", "anos")
        if meses_restantes > 0:
            texto = f"{texto} e {_pluralizar(meses_restantes, 'mês', 'meses')}"
    elif meses > 0:
        texto = _pluralizar(meses, "mês", "meses")
    elif dias >= 7:
        semanas = dias // 7
        dias_restantes = dias % 7
        texto = _pluralizar(semanas, "semana", "semanas")
        if dias_restantes > 0:
            texto = f"{texto} e {_pluralizar(dias_restantes, 'dia', 'dias')}"
    else:
        texto = _pluralizar(dias, "dia", "dias")

    return {
        "anos": anos,
        "meses": meses,
        "dias": dias,
        "texto": texto,
    }


def _calcular_idade_anos(dt_nascimento: str) -> int:
    return int(_calcular_idade_detalhada(dt_nascimento)["anos"])


class FilaCsvProvider(FilaProviderInterface):
    """Provedor da fila de atendimento (ambiente de desenvolvimento).

    data/fila.csv lista os prontuários dos pacientes agendados para hoje
    (um dia típico tem ~10 atendimentos). data/pacientes.csv é a base
    completa de pacientes — a fila é só um subconjunto dela, não todos os
    pacientes cadastrados aparecem na fila do dia.

    tipo_entrada é derivado de ind_origem e status da fila é derivado do
    status AGHU do paciente. A fila é construída em memória na
    inicialização do provider; atualizações de status (PATCH /status) não
    persistem de volta nos CSVs — mesma limitação do FilaMockProvider,
    aceitável para dev local.
    """

    def __init__(self, fila_csv_path: str = "data/fila.csv", pacientes_csv_path: str = "data/pacientes.csv"):
        self.fila_csv_path = fila_csv_path
        self.pacientes_csv_path = pacientes_csv_path
        self._fila = self._carregar_fila()

    def _carregar_fila(self) -> list[dict[str, Any]]:
        with open(self.fila_csv_path, mode="r", encoding="utf-8") as f:
            prontuarios_hoje = [row["prontuario"] for row in csv.DictReader(f)]

        with open(self.pacientes_csv_path, mode="r", encoding="utf-8") as f:
            pacientes_por_prontuario = {row["prontuario"]: row for row in csv.DictReader(f)}

        base_hora = datetime.now().replace(hour=7, minute=30, second=0, microsecond=0)
        fila: list[dict[str, Any]] = []
        for idx, prontuario in enumerate(prontuarios_hoje, start=1):
            paciente = pacientes_por_prontuario.get(prontuario)
            if paciente is None:
                continue
            idade = _calcular_idade_detalhada(paciente["dt_nascimento"])
            fila.append({
                "id": idx,
                "paciente_id": paciente["prontuario"],
                "paciente_nome": paciente["nome"],
                "paciente_data_nascimento": paciente.get("dt_nascimento", ""),
                # Mantém o campo antigo para compatibilidade com telas já existentes.
                "paciente_idade": idade["anos"],
                # Novos campos usados pela fila para exibir neonatos/lactentes corretamente.
                "paciente_idade_meses": idade["meses"],
                "paciente_idade_dias": idade["dias"],
                "paciente_idade_texto": idade["texto"],
                "tipo_entrada": _TIPO_ENTRADA_MAP.get(paciente.get("ind_origem", ""), "Retorno"),
                "status": _STATUS_MAP.get(paciente.get("status", ""), "Aguardando"),
                "faltas": int(paciente.get("faltas") or 0),
                "data_entrada": (base_hora + timedelta(minutes=15 * idx)).isoformat(),
            })
        return fila

    async def listar_fila(self) -> list[dict[str, Any]]:
        return [{**item, "origemDescricao": _ORIGEM} for item in self._fila]

    async def stats_fila(self) -> dict[str, int]:
        total = len(self._fila)
        aguardando = sum(1 for p in self._fila if p["status"] == "Aguardando")
        em_atendimento = sum(1 for p in self._fila if p["status"] == "Em Atendimento")
        finalizado = sum(1 for p in self._fila if p["status"] == "Finalizado")
        return {
            "total": total,
            "aguardando": aguardando,
            "em_atendimento": em_atendimento,
            "finalizado": finalizado,
        }

    async def atualizar_status(self, id: int, status: str) -> dict[str, Any]:
        for item in self._fila:
            if item["id"] == id:
                item["status"] = status
                return {**item, "origemDescricao": _ORIGEM}
        raise ValueError(f"Entrada com id={id} não encontrada na fila.")
