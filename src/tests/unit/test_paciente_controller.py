import pytest

from src.controllers import paciente_controller
from src.providers.interfaces.paciente_provider_interface import PacienteProviderInterface


@pytest.mark.asyncio
async def test_listar_pacientes_retorna_paginado(mocker):
    mock_provider = mocker.AsyncMock(spec=PacienteProviderInterface)
    mock_provider.listar_pacientes.return_value = {
        "items": [{"prontuario": "10000016", "nome": "ANA CLARA"}],
        "total": 1,
        "page": 1,
        "limit": 20,
    }

    result = await paciente_controller.listar_pacientes(mock_provider, page=1, limit=20, nome=None)

    assert result["total"] == 1
    assert len(result["items"]) == 1
    mock_provider.listar_pacientes.assert_called_once_with(page=1, limit=20, nome=None)


@pytest.mark.asyncio
async def test_listar_pacientes_com_filtro_nome(mocker):
    mock_provider = mocker.AsyncMock(spec=PacienteProviderInterface)
    mock_provider.listar_pacientes.return_value = {"items": [], "total": 0, "page": 1, "limit": 20}

    await paciente_controller.listar_pacientes(mock_provider, page=1, limit=20, nome="ana")

    mock_provider.listar_pacientes.assert_called_once_with(page=1, limit=20, nome="ana")


@pytest.mark.asyncio
async def test_buscar_por_cpf_retorna_paciente(mocker):
    mock_provider = mocker.AsyncMock(spec=PacienteProviderInterface)
    mock_provider.buscar_por_cpf.return_value = {"prontuario": "10000016", "nome": "ANA CLARA"}

    result = await paciente_controller.buscar_por_cpf(mock_provider, "123.456.789-10")

    assert result["prontuario"] == "10000016"
    mock_provider.buscar_por_cpf.assert_called_once_with("123.456.789-10")


@pytest.mark.asyncio
async def test_buscar_por_cpf_retorna_none_quando_nao_encontrado(mocker):
    mock_provider = mocker.AsyncMock(spec=PacienteProviderInterface)
    mock_provider.buscar_por_cpf.return_value = None

    result = await paciente_controller.buscar_por_cpf(mock_provider, "000.000.000-00")

    assert result is None


@pytest.mark.asyncio
async def test_obter_paciente_por_prontuario_retorna_paciente(mocker):
    mock_provider = mocker.AsyncMock(spec=PacienteProviderInterface)
    mock_provider.obter_paciente_por_prontuario.return_value = {"prontuario": "10000016", "nome": "ANA CLARA"}

    result = await paciente_controller.obter_paciente_por_prontuario(mock_provider, "10000016")

    assert result["nome"] == "ANA CLARA"
    mock_provider.obter_paciente_por_prontuario.assert_called_once_with("10000016")


@pytest.mark.asyncio
async def test_obter_paciente_por_prontuario_retorna_none(mocker):
    mock_provider = mocker.AsyncMock(spec=PacienteProviderInterface)
    mock_provider.obter_paciente_por_prontuario.return_value = None

    result = await paciente_controller.obter_paciente_por_prontuario(mock_provider, "99999999")

    assert result is None
