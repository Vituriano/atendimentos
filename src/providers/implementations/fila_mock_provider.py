from typing import List, Dict, Any

from ..interfaces.fila_provider_interface import FilaProviderInterface

_ORIGEM = "AGHU-Mock"

_FILA_INICIAL: List[Dict[str, Any]] = [
    {
        "id": 1,
        "paciente_id": "p-001",
        "paciente_nome": "Ana Clara Souza",
        "paciente_idade": 4,
        "tipo_entrada": "Retorno",
        "status": "Aguardando",
        "tempo_espera": 45,
        "faltas": 0,
        "data_entrada": "2025-01-15T08:00:00",
    },
    {
        "id": 2,
        "paciente_id": "p-002",
        "paciente_nome": "Bruno Henrique Lima",
        "paciente_idade": 7,
        "tipo_entrada": "Primeira Vez",
        "status": "Em Atendimento",
        "tempo_espera": 30,
        "faltas": 1,
        "data_entrada": "2025-01-15T08:15:00",
    },
    {
        "id": 3,
        "paciente_id": "p-003",
        "paciente_nome": "Carla Beatriz Ferreira",
        "paciente_idade": 2,
        "tipo_entrada": "Retorno",
        "status": "Finalizado",
        "tempo_espera": 0,
        "faltas": 0,
        "data_entrada": "2025-01-15T07:30:00",
    },
    {
        "id": 4,
        "paciente_id": "p-004",
        "paciente_nome": "Diego Augusto Mendes",
        "paciente_idade": 5,
        "tipo_entrada": "Primeira Vez",
        "status": "Aguardando",
        "tempo_espera": 60,
        "faltas": 2,
        "data_entrada": "2025-01-15T08:30:00",
    },
    {
        "id": 5,
        "paciente_id": "p-005",
        "paciente_nome": "Emilly Vitoria Santos",
        "paciente_idade": 3,
        "tipo_entrada": "Retorno",
        "status": "Aguardando",
        "tempo_espera": 15,
        "faltas": 0,
        "data_entrada": "2025-01-15T08:45:00",
    },
]


class FilaMockProvider(FilaProviderInterface):
    """Provedor mock da fila com dados hardcoded para desenvolvimento offline."""

    def __init__(self) -> None:
        import copy

        self._fila: List[Dict[str, Any]] = copy.deepcopy(_FILA_INICIAL)

    async def listar_fila(self) -> List[Dict[str, Any]]:
        return [{**item, "origemDescricao": _ORIGEM} for item in self._fila]

    async def stats_fila(self) -> Dict[str, int]:
        total = len(self._fila)
        aguardando = sum(1 for p in self._fila if p["status"] == "Aguardando")
        em_atendimento = sum(
            1 for p in self._fila if p["status"] == "Em Atendimento"
        )
        finalizado = sum(1 for p in self._fila if p["status"] == "Finalizado")
        return {
            "total": total,
            "aguardando": aguardando,
            "em_atendimento": em_atendimento,
            "finalizado": finalizado,
        }

    async def atualizar_status(self, id: int, status: str) -> Dict[str, Any]:
        for item in self._fila:
            if item["id"] == id:
                item["status"] = status
                return {**item, "origemDescricao": _ORIGEM}
        raise ValueError(f"Entrada com id={id} não encontrada na fila.")
