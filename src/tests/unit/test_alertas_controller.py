import pytest

from src.controllers import alertas_controller
from src.providers.interfaces.alertas_provider_interface import AlertaProviderInterface


@pytest.mark.asyncio
async def test_listar_alertas_sem_filtros(mocker):
    mock_provider = mocker.AsyncMock(spec=AlertaProviderInterface)
    mock_provider.listar_alertas.return_value = [
        {"id": 1, "paciente_id": "p-001", "tipo": "critico", "categoria": "peso", "mensagem": "Teste"}
    ]

    result = await alertas_controller.listar_alertas(mock_provider)

    assert result == [
        {"id": 1, "paciente_id": "p-001", "tipo": "critico", "categoria": "peso", "mensagem": "Teste"}
    ]
    mock_provider.listar_alertas.assert_called_once_with(paciente_id=None, categoria=None)


@pytest.mark.asyncio
async def test_listar_alertas_por_paciente_id(mocker):
    mock_provider = mocker.AsyncMock(spec=AlertaProviderInterface)
    mock_provider.listar_alertas.return_value = []

    await alertas_controller.listar_alertas(mock_provider, paciente_id="p-001")

    mock_provider.listar_alertas.assert_called_once_with(paciente_id="p-001", categoria=None)


@pytest.mark.asyncio
async def test_listar_alertas_por_categoria(mocker):
    mock_provider = mocker.AsyncMock(spec=AlertaProviderInterface)
    mock_provider.listar_alertas.return_value = []

    await alertas_controller.listar_alertas(mock_provider, categoria="peso")

    mock_provider.listar_alertas.assert_called_once_with(paciente_id=None, categoria="peso")


@pytest.mark.asyncio
async def test_criar_alerta_retorna_alerta_criado(mocker):
    mock_provider = mocker.AsyncMock(spec=AlertaProviderInterface)
    criado = {"id": 1, "paciente_id": "p-001", "tipo": "atencao", "categoria": "marco", "mensagem": "Marco não atingido"}
    mock_provider.criar_alerta.return_value = criado

    result = await alertas_controller.criar_alerta(
        mock_provider, paciente_id="p-001", tipo="atencao", categoria="marco", mensagem="Marco não atingido"
    )

    assert result == criado
    mock_provider.criar_alerta.assert_called_once_with(
        paciente_id="p-001", tipo="atencao", categoria="marco", mensagem="Marco não atingido"
    )


@pytest.mark.asyncio
async def test_resolver_alerta_encontrado(mocker):
    mock_provider = mocker.AsyncMock(spec=AlertaProviderInterface)
    resolvido = {"id": 1, "paciente_id": "p-001", "deleted_at": "2026-06-30T00:00:00"}
    mock_provider.resolver_alerta.return_value = resolvido

    result = await alertas_controller.resolver_alerta(mock_provider, 1)

    assert result == resolvido
    mock_provider.resolver_alerta.assert_called_once_with(1)


@pytest.mark.asyncio
async def test_resolver_alerta_nao_encontrado(mocker):
    mock_provider = mocker.AsyncMock(spec=AlertaProviderInterface)
    mock_provider.resolver_alerta.return_value = None

    result = await alertas_controller.resolver_alerta(mock_provider, 999)

    assert result is None
    mock_provider.resolver_alerta.assert_called_once_with(999)
