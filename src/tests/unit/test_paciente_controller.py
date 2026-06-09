import pytest

from src.controllers import paciente_controller
from src.providers.interfaces.paciente_provider_interface import PacienteProviderInterface


@pytest.mark.asyncio
async def test_listar_pacientes_retorna_lista(mocker):
    mock_provider = mocker.AsyncMock(spec=PacienteProviderInterface)
    mock_provider.listar_pacientes.return_value = [{"codigo": 1, "nome": "Test"}]

    result = await paciente_controller.listar_pacientes(mock_provider)

    assert result == [{"codigo": 1, "nome": "Test"}]
    mock_provider.listar_pacientes.assert_called_once()


@pytest.mark.asyncio
async def test_obter_paciente_por_codigo_retorna_paciente(mocker):
    mock_provider = mocker.AsyncMock(spec=PacienteProviderInterface)
    mock_provider.obter_paciente_por_codigo.return_value = {"codigo": 42, "nome": "João"}

    result = await paciente_controller.obter_paciente_por_codigo(42, mock_provider)

    assert result == {"codigo": 42, "nome": "João"}
    mock_provider.obter_paciente_por_codigo.assert_called_once_with(42)
