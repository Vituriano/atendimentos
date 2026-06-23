import csv
import re
from typing import Any

from ..interfaces.paciente_provider_interface import PacienteProviderInterface

_ORIGEM = "AGHU-CSV"


def _cpf_digits(cpf: str) -> str:
    return re.sub(r"\D", "", cpf)


class PacienteCsvProvider(PacienteProviderInterface):
    def __init__(self, csv_path: str = "data/pacientes.csv"):
        self.csv_path = csv_path
        try:
            open(self.csv_path, mode="r", encoding="utf-8").close()
        except FileNotFoundError:
            raise RuntimeError(f"Arquivo CSV de pacientes não encontrado em: {self.csv_path}")

    def _read_all(self) -> list[dict[str, Any]]:
        with open(self.csv_path, mode="r", encoding="utf-8") as f:
            rows = list(csv.DictReader(f))
        for row in rows:
            row["origemDescricao"] = _ORIGEM
        return rows

    async def listar_pacientes(
        self, page: int = 1, limit: int = 20, nome: str | None = None
    ) -> dict[str, Any]:
        rows = self._read_all()
        if nome:
            nome_lower = nome.lower()
            rows = [r for r in rows if nome_lower in r.get("nome", "").lower()]
        total = len(rows)
        start = (page - 1) * limit
        items = rows[start : start + limit]
        return {"items": items, "total": total, "page": page, "limit": limit}

    async def buscar_por_cpf(self, cpf: str) -> dict[str, Any] | None:
        # Nunca aceitar CPF parcial — LGPD
        if len(_cpf_digits(cpf)) != 11:
            return None
        rows = self._read_all()
        for row in rows:
            if _cpf_digits(row.get("cpf", "")) == _cpf_digits(cpf):
                return row
        return None

    async def obter_paciente_por_prontuario(self, prontuario: str) -> dict[str, Any] | None:
        rows = self._read_all()
        for row in rows:
            if str(row.get("prontuario", "")) == str(prontuario):
                return row
        return None
