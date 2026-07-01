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


def _calcular_idade_anos(dt_nascimento: str) -> int:
    nascimento = datetime.strptime(dt_nascimento, "%Y-%m-%d")
    hoje = datetime.now()
    idade = hoje.year - nascimento.year - ((hoje.month, hoje.day) < (nascimento.month, nascimento.day))
    return max(idade, 0)


class FilaCsvProvider(FilaProviderInterface):
    """Provedor da fila a partir do CSV de pacientes (ambiente de desenvolvimento).

    tipo_entrada é derivado de ind_origem e status da fila é derivado do status
    AGHU do paciente. A fila é construída em memória na inicialização do
    provider; atualizações de status (PATCH /status) não persistem de volta
    no CSV — mesma limitação do FilaMockProvider, aceitável para dev local.
    """

    def __init__(self, csv_path: str = "data/pacientes.csv"):
        self.csv_path = csv_path
        self._fila = self._carregar_fila()

    def _carregar_fila(self) -> list[dict[str, Any]]:
        with open(self.csv_path, mode="r", encoding="utf-8") as f:
            rows = list(csv.DictReader(f))

        base_hora = datetime.now().replace(hour=7, minute=30, second=0, microsecond=0)
        fila: list[dict[str, Any]] = []
        for idx, row in enumerate(rows, start=1):
            fila.append({
                "id": idx,
                "paciente_id": row["prontuario"],
                "paciente_nome": row["nome"],
                "paciente_idade": _calcular_idade_anos(row["dt_nascimento"]),
                "tipo_entrada": _TIPO_ENTRADA_MAP.get(row.get("ind_origem", ""), "Retorno"),
                "status": _STATUS_MAP.get(row.get("status", ""), "Aguardando"),
                "faltas": int(row.get("faltas") or 0),
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
