import pytest

from src.controllers import fila_controller
from src.providers.interfaces.fila_provider_interface import FilaProviderInterface


@pytest.mark.asyncio
async def test_listar_fila_retorna_lista(mocker):
    mock_provider = mocker.AsyncMock(spec=FilaProviderInterface)
    mock_provider.listar_fila.return_value = [{"id": 1, "paciente_nome": "Test"}]

    result = await fila_controller.listar_fila(mock_provider)

    assert result == [{"id": 1, "paciente_nome": "Test"}]
    mock_provider.listar_fila.assert_called_once()


@pytest.mark.asyncio
async def test_stats_fila_retorna_contadores(mocker):
    mock_provider = mocker.AsyncMock(spec=FilaProviderInterface)
    mock_provider.stats_fila.return_value = {
        "total": 5,
        "aguardando": 3,
        "em_atendimento": 1,
        "finalizado": 1,
    }

    result = await fila_controller.stats_fila(mock_provider)

    assert result == {
        "total": 5,
        "aguardando": 3,
        "em_atendimento": 1,
        "finalizado": 1,
    }
    mock_provider.stats_fila.assert_called_once()


@pytest.mark.asyncio
async def test_atualizar_status_retorna_item_atualizado(mocker):
    mock_provider = mocker.AsyncMock(spec=FilaProviderInterface)
    updated = {"id": 2, "paciente_nome": "Bruno", "status": "Em Atendimento"}
    mock_provider.atualizar_status.return_value = updated

    result = await fila_controller.atualizar_status(2, "Em Atendimento", mock_provider)

    assert result == updated
    mock_provider.atualizar_status.assert_called_once_with(2, "Em Atendimento")
