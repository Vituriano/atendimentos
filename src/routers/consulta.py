from datetime import date, datetime
from decimal import Decimal
import json
from typing import Any, Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..auth.auth import auth_handler
from ..models.consulta import (
    Consulta,
    ConsultaAnamnese,
    ConsultaAntropometria,
    ConsultaEncaminhamento,
    ConsultaDinamicaFamiliar,
    ConsultaCondicoesSocioeconomicas,
    ConsultaDiagnostico,
    ConsultaHipotesesCondutas,
    ConsultaProcedimentos,
    ConsultaDadosExternos,
    ConsultaHistoriaFamiliar,
    ConsultaImunizacoes,
    ConsultaEscolaridade,
    ConsultaTriagemNeonatal,
)
from ..resources.database import get_app_db_session

router = APIRouter(
    prefix="/api/consultas",
    tags=["Consultas"],
    dependencies=[Depends(auth_handler.decode_token)],
)


ClassificacaoImc = Literal["abaixo", "normal", "sobrepeso"]


class AntropometriaSalvarRequest(BaseModel):
    paciente_id: str = Field(..., min_length=1)
    peso_kg: float = Field(..., gt=0)
    altura_cm: float = Field(..., gt=0)
    perimetro_cefalico_cm: float | None = Field(default=None, gt=0)
    pressao_sistolica_mmhg: int | None = Field(default=None, gt=0)
    pressao_diastolica_mmhg: int | None = Field(default=None, gt=0)
    imc: float | None = Field(default=None, gt=0)
    classificacao_imc: ClassificacaoImc | None = None


class AntropometriaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    consulta_id: int
    peso_kg: float | None
    altura_cm: float | None
    perimetro_cefalico_cm: float | None
    pressao_sistolica_mmhg: int | None
    pressao_diastolica_mmhg: int | None
    imc: float | None
    classificacao_imc: ClassificacaoImc | None
    atualizado_em: datetime | None


class AnamneseClinicaPayload(BaseModel):
    queixa_principal: str = ""
    historia_doenca_atual: str = ""
    interrogatorio_geral: str = ""
    interrogatorio_pele_mucosas: str = ""
    interrogatorio_olhos: str = ""
    interrogatorio_ouvidos: str = ""
    interrogatorio_boca: str = ""
    interrogatorio_respiratorio: str = ""
    interrogatorio_cardiovascular: str = ""
    interrogatorio_gastrointestinal: str = ""
    interrogatorio_geniturinario: str = ""
    interrogatorio_musculo_esqueletico: str = ""
    interrogatorio_sistema_nervoso: str = ""
    sistemas_interrogatorio_alterados: list[str] = Field(default_factory=list)
    medicacoes_rotina: str = ""
    exames_complementares: str = ""
    antecedentes_doencas: str = ""


class AnamneseAlimentacaoPayload(BaseModel):
    tipo_aleitamento: str = ""
    cardapio_cafe: str = ""
    cardapio_lanche_manha: str = ""
    cardapio_almoco: str = ""
    cardapio_lanche_tarde: str = ""
    cardapio_jantar: str = ""
    cardapio_ceia: str = ""
    local_refeicoes: str = ""
    uso_tela_refeicoes: bool = False


class AnamneseHabitosPayload(BaseModel):
    sono_horario: str = ""
    sono_local: str = ""
    sono_higiene: str = ""
    sono_alteracoes: str = ""
    telas_dispositivos: list[str] = Field(default_factory=list)
    telas_tempo_diario: str = ""
    telas_frequencia: str = ""
    chupeta_chupa_dedo: str = ""
    higiene_dentaria: str = ""
    atividades_recreativas: str = ""


class AnamneseSalvarRequest(BaseModel):
    paciente_id: str = Field(..., min_length=1)
    clinica: AnamneseClinicaPayload = Field(default_factory=AnamneseClinicaPayload)
    alimentacao: AnamneseAlimentacaoPayload = Field(default_factory=AnamneseAlimentacaoPayload)
    habitos: AnamneseHabitosPayload = Field(default_factory=AnamneseHabitosPayload)


class AnamneseResponse(BaseModel):
    id: int
    consulta_id: int
    clinica: AnamneseClinicaPayload
    alimentacao: AnamneseAlimentacaoPayload
    habitos: AnamneseHabitosPayload
    atualizado_em: datetime | None


class ImunizacoesSalvarRequest(BaseModel):
    paciente_id: str = Field(..., min_length=1)
    status_vacinal: str = ""


class ImunizacoesResponse(BaseModel):
    id: int
    consulta_id: int
    status_vacinal: str
    atualizado_em: datetime | None


class ImunizacoesHistoricoResponse(BaseModel):
    consulta_id: int
    data_consulta: datetime
    status_vacinal: str
    atualizado_em: datetime | None


class EscolaridadeSalvarRequest(BaseModel):
    paciente_id: str = Field(..., min_length=1)
    frequenta_escola_creche: bool | None = None
    ano_serie: str = ""
    houve_reprovacao: bool | None = None
    rendimento_relacionamento: str = ""


class EscolaridadeResponse(BaseModel):
    id: int
    consulta_id: int
    frequenta_escola_creche: bool | None
    ano_serie: str
    houve_reprovacao: bool | None
    rendimento_relacionamento: str
    atualizado_em: datetime | None


class TesteTriagemNeonatalPayload(BaseModel):
    resultado: str = ""
    data: date | None = None
    descricao: str = ""


class TriagemNeonatalSalvarRequest(BaseModel):
    paciente_id: str = Field(..., min_length=1)
    idade_gestacional_semanas: int | None = Field(default=None, ge=20, le=45)
    peso_nascimento_gramas: int | None = Field(default=None, ge=300, le=7000)
    hipoteses_diagnosticas_anteriores: str = ""
    teste_pezinho: TesteTriagemNeonatalPayload = Field(default_factory=TesteTriagemNeonatalPayload)
    teste_orelhinha: TesteTriagemNeonatalPayload = Field(default_factory=TesteTriagemNeonatalPayload)
    teste_olhinho: TesteTriagemNeonatalPayload = Field(default_factory=TesteTriagemNeonatalPayload)
    teste_coracaozinho: TesteTriagemNeonatalPayload = Field(default_factory=TesteTriagemNeonatalPayload)


class TriagemNeonatalResponse(BaseModel):
    id: int
    consulta_id: int
    idade_gestacional_semanas: int | None
    peso_nascimento_gramas: int | None
    hipoteses_diagnosticas_anteriores: str
    teste_pezinho: TesteTriagemNeonatalPayload
    teste_orelhinha: TesteTriagemNeonatalPayload
    teste_olhinho: TesteTriagemNeonatalPayload
    teste_coracaozinho: TesteTriagemNeonatalPayload
    atualizado_em: datetime | None


class EncaminhamentoPayload(BaseModel):
    id: int | None = None
    especialidade: str = ""
    prioridade: str = "Eletivo"
    procedimento_motivo: str = ""
    justificativa_clinica: str = ""


class EncaminhamentosSalvarRequest(BaseModel):
    paciente_id: str = Field(..., min_length=1)
    encaminhamentos: list[EncaminhamentoPayload] = Field(default_factory=list)


class EncaminhamentoResponse(BaseModel):
    id: int
    consulta_id: int
    ordem: int
    especialidade: str
    prioridade: str
    procedimento_motivo: str
    justificativa_clinica: str
    atualizado_em: datetime | None


class HistoriaFamiliarSalvarRequest(BaseModel):
    paciente_id: str = Field(..., min_length=1)
    houve_mudanca: bool | None = None
    maternal_idade: str = ""
    maternal_saude: str = ""
    maternal_ocupacao: str = ""
    paternal_idade: str = ""
    paternal_saude: str = ""
    paternal_ocupacao: str = ""
    coabitacao_pais: str = ""
    irmaos_saude: str = ""


class HistoriaFamiliarResponse(BaseModel):
    id: int
    consulta_id: int
    houve_mudanca: bool | None
    maternal_idade: str
    maternal_saude: str
    maternal_ocupacao: str
    paternal_idade: str
    paternal_saude: str
    paternal_ocupacao: str
    coabitacao_pais: str
    irmaos_saude: str
    atualizado_em: datetime | None


class DinamicaFamiliarSalvarRequest(BaseModel):
    paciente_id: str = Field(..., min_length=1)
    houve_mudanca: bool | None = None
    relacionamento_companheiro: str = ""
    resolucao_desentendimentos: str = ""
    fumante_domicilio: bool | None = None
    uso_alcool_drogas: bool | None = None
    inseguranca_alimentar: bool | None = None
    familiar_preso: bool | None = None
    preocupacao_comportamento: bool | None = None
    disciplina_opcoes: list[str] = Field(default_factory=list)


class DinamicaFamiliarResponse(BaseModel):
    id: int
    consulta_id: int
    houve_mudanca: bool | None
    relacionamento_companheiro: str
    resolucao_desentendimentos: str
    fumante_domicilio: bool | None
    uso_alcool_drogas: bool | None
    inseguranca_alimentar: bool | None
    familiar_preso: bool | None
    preocupacao_comportamento: bool | None
    disciplina_opcoes: list[str]
    atualizado_em: datetime | None


class CondicoesSocioeconomicasSalvarRequest(BaseModel):
    paciente_id: str = Field(..., min_length=1)
    renda_familiar: str = ""
    renda_nao_informada: bool = False
    tipo_casa: str = ""
    numero_comodos: int | None = Field(default=None, ge=0, le=99)
    banheiro: str = ""
    quarto_crianca: str = ""
    presenca_animais: str = ""
    agua_encanada: bool | None = None
    energia_eletrica: bool | None = None
    esgoto: str = ""
    coleta_lixo: bool | None = None
    area_violencia: bool | None = None


class CondicoesSocioeconomicasResponse(BaseModel):
    id: int
    consulta_id: int
    renda_familiar: str
    renda_nao_informada: bool
    tipo_casa: str
    numero_comodos: int | None
    banheiro: str
    quarto_crianca: str
    presenca_animais: str
    agua_encanada: bool | None
    energia_eletrica: bool | None
    esgoto: str
    coleta_lixo: bool | None
    area_violencia: bool | None
    atualizado_em: datetime | None


class DiagnosticoSecundarioPayload(BaseModel):
    codigo: str = ""
    descricao: str = ""


class DiagnosticoSalvarRequest(BaseModel):
    paciente_id: str = Field(..., min_length=1)
    cid10_principal: str = ""
    cids_secundarios: list[DiagnosticoSecundarioPayload] = Field(default_factory=list)
    sid: str = ""


class DiagnosticoResponse(BaseModel):
    id: int
    consulta_id: int
    cid10_principal: str
    cids_secundarios: list[DiagnosticoSecundarioPayload]
    sid: str
    atualizado_em: datetime | None


class HipotesesCondutasSalvarRequest(BaseModel):
    paciente_id: str = Field(..., min_length=1)
    hipoteses_diagnosticas: str = ""
    condutas_plano_cuidado: str = ""


class HipotesesCondutasResponse(BaseModel):
    id: int
    consulta_id: int
    hipoteses_diagnosticas: str
    condutas_plano_cuidado: str
    atualizado_em: datetime | None


class ProcedimentoPayload(BaseModel):
    procedimento: str = ""
    quantidade: int | None = Field(default=None, ge=1, le=999)
    cid_vinculado: str = ""
    observacoes: str = ""


class ProcedimentosSalvarRequest(BaseModel):
    paciente_id: str = Field(..., min_length=1)
    realizados: bool | None = None
    procedimentos: list[ProcedimentoPayload] = Field(default_factory=list)


class ProcedimentosResponse(BaseModel):
    id: int
    consulta_id: int
    realizados: bool | None
    procedimentos: list[ProcedimentoPayload]
    atualizado_em: datetime | None


class DadoExternoPayload(BaseModel):
    id: int | None = None
    data_consulta_externa: date | None = None
    servico_origem: str = ""
    peso: float | None = Field(default=None, ge=0)
    altura: float | None = Field(default=None, ge=0)
    observacoes_clinicas: str = ""
    como_dados_obtidos: str = ""


class DadosExternosSalvarRequest(BaseModel):
    paciente_id: str = Field(..., min_length=1)
    registros: list[DadoExternoPayload] = Field(default_factory=list)


class DadoExternoResponse(BaseModel):
    id: int
    consulta_id: int
    ordem: int
    data_consulta_externa: date | None
    servico_origem: str
    peso: float | None
    altura: float | None
    observacoes_clinicas: str
    como_dados_obtidos: str
    atualizado_em: datetime | None


class ConsultaAtivaResponse(BaseModel):
    id: int
    paciente_id: str
    medico_username: str
    data: datetime
    status: str
    completed_sections: list[str]
    started_sections: list[str]
    antropometria: AntropometriaResponse | None = None
    anamnese: AnamneseResponse | None = None
    imunizacoes: ImunizacoesResponse | None = None
    escolaridade: EscolaridadeResponse | None = None
    triagem_neonatal: TriagemNeonatalResponse | None = None
    encaminhamentos: list[EncaminhamentoResponse] = Field(default_factory=list)
    historia_familiar: HistoriaFamiliarResponse | None = None
    dinamica_familiar: DinamicaFamiliarResponse | None = None
    condicoes_socioeconomicas: CondicoesSocioeconomicasResponse | None = None
    diagnostico: DiagnosticoResponse | None = None
    hipoteses_condutas: HipotesesCondutasResponse | None = None
    procedimentos: ProcedimentosResponse | None = None
    dados_externos: list[DadoExternoResponse] = Field(default_factory=list)
    imunizacoes_historico: list[ImunizacoesHistoricoResponse] = Field(default_factory=list)


class ConsultaFinalizarRequest(BaseModel):
    paciente_id: str = Field(..., min_length=1)


class ConsultaFinalizarResponse(BaseModel):
    id: int
    paciente_id: str
    medico_username: str
    data: datetime
    status: str
    completed_sections: list[str]
    started_sections: list[str]
    finalizada_em: datetime | None


def _to_float(value: Any) -> float | None:
    if value is None:
        return None
    return float(value)


def _texto(value: Any) -> str:
    if value is None:
        return ""
    return str(value)


def _carregar_lista_json(value: Any) -> list[str]:
    if value is None or value == "":
        return []
    if isinstance(value, list):
        return [str(item) for item in value]
    try:
        loaded = json.loads(str(value))
    except (TypeError, ValueError, json.JSONDecodeError):
        return []
    if not isinstance(loaded, list):
        return []
    return [str(item) for item in loaded]


def _salvar_lista_json(value: list[str]) -> str:
    return json.dumps(value, ensure_ascii=False)


def _possui_conteudo(valor: Any) -> bool:
    if isinstance(valor, str):
        return len(valor.strip()) > 0
    if isinstance(valor, bool):
        return valor
    if isinstance(valor, list):
        return len(valor) > 0
    if isinstance(valor, BaseModel):
        return any(_possui_conteudo(v) for v in valor.model_dump().values())
    if isinstance(valor, dict):
        return any(_possui_conteudo(v) for v in valor.values())
    return False


def _antropometria_response(registro: ConsultaAntropometria | None) -> AntropometriaResponse | None:
    if registro is None:
        return None

    return AntropometriaResponse(
        id=registro.id,
        consulta_id=registro.consulta_id,
        peso_kg=_to_float(registro.peso),
        altura_cm=_to_float(registro.altura),
        perimetro_cefalico_cm=_to_float(registro.perimetro_cefalico),
        pressao_sistolica_mmhg=registro.pressao_sistolica,
        pressao_diastolica_mmhg=registro.pressao_diastolica,
        imc=_to_float(registro.imc),
        classificacao_imc=registro.classificacao_imc,
        atualizado_em=registro.updated_at,
    )


def _anamnese_payload(registro: ConsultaAnamnese) -> tuple[AnamneseClinicaPayload, AnamneseAlimentacaoPayload, AnamneseHabitosPayload]:
    clinica = AnamneseClinicaPayload(
        queixa_principal=_texto(registro.clinica_queixa_principal),
        historia_doenca_atual=_texto(registro.clinica_historia_doenca_atual),
        interrogatorio_geral=_texto(registro.clinica_interrogatorio_geral),
        interrogatorio_pele_mucosas=_texto(registro.clinica_interrogatorio_pele_mucosas),
        interrogatorio_olhos=_texto(registro.clinica_interrogatorio_olhos),
        interrogatorio_ouvidos=_texto(registro.clinica_interrogatorio_ouvidos),
        interrogatorio_boca=_texto(registro.clinica_interrogatorio_boca),
        interrogatorio_respiratorio=_texto(registro.clinica_interrogatorio_respiratorio),
        interrogatorio_cardiovascular=_texto(registro.clinica_interrogatorio_cardiovascular),
        interrogatorio_gastrointestinal=_texto(registro.clinica_interrogatorio_gastrointestinal),
        interrogatorio_geniturinario=_texto(registro.clinica_interrogatorio_geniturinario),
        interrogatorio_musculo_esqueletico=_texto(registro.clinica_interrogatorio_musculo_esqueletico),
        interrogatorio_sistema_nervoso=_texto(registro.clinica_interrogatorio_sistema_nervoso),
        sistemas_interrogatorio_alterados=_carregar_lista_json(registro.clinica_sistemas_interrogatorio_alterados),
        medicacoes_rotina=_texto(registro.clinica_medicacoes_rotina),
        exames_complementares=_texto(registro.clinica_exames_complementares),
        antecedentes_doencas=_texto(registro.clinica_antecedentes_doencas),
    )
    alimentacao = AnamneseAlimentacaoPayload(
        tipo_aleitamento=_texto(registro.alimentacao_tipo_aleitamento),
        cardapio_cafe=_texto(registro.alimentacao_cardapio_cafe),
        cardapio_lanche_manha=_texto(registro.alimentacao_cardapio_lanche_manha),
        cardapio_almoco=_texto(registro.alimentacao_cardapio_almoco),
        cardapio_lanche_tarde=_texto(registro.alimentacao_cardapio_lanche_tarde),
        cardapio_jantar=_texto(registro.alimentacao_cardapio_jantar),
        cardapio_ceia=_texto(registro.alimentacao_cardapio_ceia),
        local_refeicoes=_texto(registro.alimentacao_local_refeicoes),
        uso_tela_refeicoes=bool(registro.alimentacao_uso_tela_refeicoes),
    )
    habitos = AnamneseHabitosPayload(
        sono_horario=_texto(registro.habitos_sono_horario),
        sono_local=_texto(registro.habitos_sono_local),
        sono_higiene=_texto(registro.habitos_sono_higiene),
        sono_alteracoes=_texto(registro.habitos_sono_alteracoes),
        telas_dispositivos=_carregar_lista_json(registro.habitos_telas_dispositivos),
        telas_tempo_diario=_texto(registro.habitos_telas_tempo_diario),
        telas_frequencia=_texto(registro.habitos_telas_frequencia),
        chupeta_chupa_dedo=_texto(registro.habitos_chupeta_chupa_dedo),
        higiene_dentaria=_texto(registro.habitos_higiene_dentaria),
        atividades_recreativas=_texto(registro.habitos_atividades_recreativas),
    )
    return clinica, alimentacao, habitos


def _anamnese_response(registro: ConsultaAnamnese | None) -> AnamneseResponse | None:
    if registro is None:
        return None

    clinica, alimentacao, habitos = _anamnese_payload(registro)
    return AnamneseResponse(
        id=registro.id,
        consulta_id=registro.consulta_id,
        clinica=clinica,
        alimentacao=alimentacao,
        habitos=habitos,
        atualizado_em=registro.updated_at,
    )


def _anamnese_possui_conteudo(registro: ConsultaAnamnese | None) -> bool:
    if registro is None:
        return False
    clinica, alimentacao, habitos = _anamnese_payload(registro)
    return any(_possui_conteudo(payload) for payload in [clinica, alimentacao, habitos])


def _imunizacoes_response(registro: ConsultaImunizacoes | None) -> ImunizacoesResponse | None:
    if registro is None:
        return None
    return ImunizacoesResponse(
        id=registro.id,
        consulta_id=registro.consulta_id,
        status_vacinal=_texto(registro.status_vacinal),
        atualizado_em=registro.updated_at,
    )


def _imunizacoes_possui_conteudo(registro: ConsultaImunizacoes | None) -> bool:
    return bool(registro and _texto(registro.status_vacinal).strip())


def _escolaridade_response(registro: ConsultaEscolaridade | None) -> EscolaridadeResponse | None:
    if registro is None:
        return None
    return EscolaridadeResponse(
        id=registro.id,
        consulta_id=registro.consulta_id,
        frequenta_escola_creche=registro.frequenta_escola_creche,
        ano_serie=_texto(registro.ano_serie),
        houve_reprovacao=registro.houve_reprovacao,
        rendimento_relacionamento=_texto(registro.rendimento_relacionamento),
        atualizado_em=registro.updated_at,
    )


def _escolaridade_possui_conteudo(registro: ConsultaEscolaridade | None) -> bool:
    if registro is None:
        return False
    return any(
        _possui_conteudo(valor)
        for valor in [
            registro.frequenta_escola_creche,
            registro.ano_serie,
            registro.houve_reprovacao,
            registro.rendimento_relacionamento,
        ]
    )


def _escolaridade_completa(registro: ConsultaEscolaridade | None) -> bool:
    if registro is None:
        return False
    return registro.frequenta_escola_creche is not None


def _teste_triagem_payload(resultado: Any, data: Any, descricao: Any) -> TesteTriagemNeonatalPayload:
    return TesteTriagemNeonatalPayload(
        resultado=_texto(resultado),
        data=data,
        descricao=_texto(descricao),
    )


def _triagem_neonatal_response(registro: ConsultaTriagemNeonatal | None) -> TriagemNeonatalResponse | None:
    if registro is None:
        return None

    return TriagemNeonatalResponse(
        id=registro.id,
        consulta_id=registro.consulta_id,
        idade_gestacional_semanas=registro.idade_gestacional_semanas,
        peso_nascimento_gramas=registro.peso_nascimento_gramas,
        hipoteses_diagnosticas_anteriores=_texto(registro.hipoteses_diagnosticas_anteriores),
        teste_pezinho=_teste_triagem_payload(
            registro.teste_pezinho_resultado,
            registro.teste_pezinho_data,
            registro.teste_pezinho_descricao,
        ),
        teste_orelhinha=_teste_triagem_payload(
            registro.teste_orelhinha_resultado,
            registro.teste_orelhinha_data,
            registro.teste_orelhinha_descricao,
        ),
        teste_olhinho=_teste_triagem_payload(
            registro.teste_olhinho_resultado,
            registro.teste_olhinho_data,
            registro.teste_olhinho_descricao,
        ),
        teste_coracaozinho=_teste_triagem_payload(
            registro.teste_coracaozinho_resultado,
            registro.teste_coracaozinho_data,
            registro.teste_coracaozinho_descricao,
        ),
        atualizado_em=registro.updated_at,
    )


def _triagem_neonatal_possui_conteudo(registro: ConsultaTriagemNeonatal | None) -> bool:
    if registro is None:
        return False
    return any(
        _possui_conteudo(valor)
        for valor in [
            registro.idade_gestacional_semanas,
            registro.peso_nascimento_gramas,
            registro.hipoteses_diagnosticas_anteriores,
            registro.teste_pezinho_resultado,
            registro.teste_pezinho_data,
            registro.teste_pezinho_descricao,
            registro.teste_orelhinha_resultado,
            registro.teste_orelhinha_data,
            registro.teste_orelhinha_descricao,
            registro.teste_olhinho_resultado,
            registro.teste_olhinho_data,
            registro.teste_olhinho_descricao,
            registro.teste_coracaozinho_resultado,
            registro.teste_coracaozinho_data,
            registro.teste_coracaozinho_descricao,
        ]
    )


def _triagem_neonatal_completa(registro: ConsultaTriagemNeonatal | None) -> bool:
    if registro is None:
        return False
    return all(
        bool(_texto(resultado).strip())
        for resultado in [
            registro.teste_pezinho_resultado,
            registro.teste_orelhinha_resultado,
            registro.teste_olhinho_resultado,
            registro.teste_coracaozinho_resultado,
        ]
    )


def _encaminhamento_response(registro: ConsultaEncaminhamento) -> EncaminhamentoResponse:
    return EncaminhamentoResponse(
        id=registro.id,
        consulta_id=registro.consulta_id,
        ordem=registro.ordem or 0,
        especialidade=_texto(registro.especialidade),
        prioridade=_texto(registro.prioridade) or "Eletivo",
        procedimento_motivo=_texto(registro.procedimento_motivo),
        justificativa_clinica=_texto(registro.justificativa_clinica),
        atualizado_em=registro.updated_at,
    )


def _encaminhamentos_ativos(consulta: Consulta) -> list[ConsultaEncaminhamento]:
    return sorted(
        [registro for registro in (consulta.encaminhamentos or []) if registro.deleted_at is None],
        key=lambda registro: registro.ordem or 0,
    )


def _encaminhamento_possui_conteudo(registro: ConsultaEncaminhamento) -> bool:
    return any(
        _possui_conteudo(valor)
        for valor in [
            registro.especialidade,
            registro.prioridade,
            registro.procedimento_motivo,
            registro.justificativa_clinica,
        ]
    )


def _encaminhamentos_possuem_conteudo(consulta: Consulta) -> bool:
    return any(_encaminhamento_possui_conteudo(registro) for registro in _encaminhamentos_ativos(consulta))


def _encaminhamentos_completos(consulta: Consulta) -> bool:
    return any(
        _texto(registro.especialidade).strip() and _texto(registro.procedimento_motivo).strip()
        for registro in _encaminhamentos_ativos(consulta)
    )


def _historia_familiar_response(registro: ConsultaHistoriaFamiliar | None) -> HistoriaFamiliarResponse | None:
    if registro is None:
        return None

    return HistoriaFamiliarResponse(
        id=registro.id,
        consulta_id=registro.consulta_id,
        houve_mudanca=registro.houve_mudanca,
        maternal_idade=_texto(registro.maternal_idade),
        maternal_saude=_texto(registro.maternal_saude),
        maternal_ocupacao=_texto(registro.maternal_ocupacao),
        paternal_idade=_texto(registro.paternal_idade),
        paternal_saude=_texto(registro.paternal_saude),
        paternal_ocupacao=_texto(registro.paternal_ocupacao),
        coabitacao_pais=_texto(registro.coabitacao_pais),
        irmaos_saude=_texto(registro.irmaos_saude),
        atualizado_em=registro.updated_at,
    )


def _historia_familiar_possui_conteudo(registro: ConsultaHistoriaFamiliar | None) -> bool:
    if registro is None:
        return False
    return any(
        _possui_conteudo(valor)
        for valor in [
            registro.houve_mudanca,
            registro.maternal_idade,
            registro.maternal_saude,
            registro.maternal_ocupacao,
            registro.paternal_idade,
            registro.paternal_saude,
            registro.paternal_ocupacao,
            registro.coabitacao_pais,
            registro.irmaos_saude,
        ]
    )


def _historia_familiar_completa(registro: ConsultaHistoriaFamiliar | None) -> bool:
    if registro is None:
        return False
    if registro.houve_mudanca is not None:
        return True
    return bool(_texto(registro.maternal_saude).strip())


def _dinamica_familiar_response(registro: ConsultaDinamicaFamiliar | None) -> DinamicaFamiliarResponse | None:
    if registro is None:
        return None

    return DinamicaFamiliarResponse(
        id=registro.id,
        consulta_id=registro.consulta_id,
        houve_mudanca=registro.houve_mudanca,
        relacionamento_companheiro=_texto(registro.relacionamento_companheiro),
        resolucao_desentendimentos=_texto(registro.resolucao_desentendimentos),
        fumante_domicilio=registro.fumante_domicilio,
        uso_alcool_drogas=registro.uso_alcool_drogas,
        inseguranca_alimentar=registro.inseguranca_alimentar,
        familiar_preso=registro.familiar_preso,
        preocupacao_comportamento=registro.preocupacao_comportamento,
        disciplina_opcoes=_carregar_lista_json(registro.disciplina_opcoes),
        atualizado_em=registro.updated_at,
    )


def _dinamica_familiar_possui_conteudo(registro: ConsultaDinamicaFamiliar | None) -> bool:
    if registro is None:
        return False
    return any(
        _possui_conteudo(valor)
        for valor in [
            registro.houve_mudanca,
            registro.relacionamento_companheiro,
            registro.resolucao_desentendimentos,
            registro.fumante_domicilio,
            registro.uso_alcool_drogas,
            registro.inseguranca_alimentar,
            registro.familiar_preso,
            registro.preocupacao_comportamento,
            _carregar_lista_json(registro.disciplina_opcoes),
        ]
    )


def _dinamica_familiar_completa(registro: ConsultaDinamicaFamiliar | None) -> bool:
    if registro is None:
        return False
    if registro.houve_mudanca is not None:
        return True
    return any(
        valor is not None
        for valor in [
            registro.fumante_domicilio,
            registro.uso_alcool_drogas,
            registro.inseguranca_alimentar,
            registro.familiar_preso,
            registro.preocupacao_comportamento,
        ]
    ) or bool(_texto(registro.relacionamento_companheiro).strip() or _texto(registro.resolucao_desentendimentos).strip())


def _condicoes_socioeconomicas_response(registro: ConsultaCondicoesSocioeconomicas | None) -> CondicoesSocioeconomicasResponse | None:
    if registro is None:
        return None

    return CondicoesSocioeconomicasResponse(
        id=registro.id,
        consulta_id=registro.consulta_id,
        renda_familiar=_texto(registro.renda_familiar),
        renda_nao_informada=bool(registro.renda_nao_informada),
        tipo_casa=_texto(registro.tipo_casa),
        numero_comodos=registro.numero_comodos,
        banheiro=_texto(registro.banheiro),
        quarto_crianca=_texto(registro.quarto_crianca),
        presenca_animais=_texto(registro.presenca_animais),
        agua_encanada=registro.agua_encanada,
        energia_eletrica=registro.energia_eletrica,
        esgoto=_texto(registro.esgoto),
        coleta_lixo=registro.coleta_lixo,
        area_violencia=registro.area_violencia,
        atualizado_em=registro.updated_at,
    )


def _condicoes_socioeconomicas_possui_conteudo(registro: ConsultaCondicoesSocioeconomicas | None) -> bool:
    if registro is None:
        return False
    return any(
        _possui_conteudo(valor)
        for valor in [
            registro.renda_familiar,
            registro.renda_nao_informada,
            registro.tipo_casa,
            registro.numero_comodos,
            registro.banheiro,
            registro.quarto_crianca,
            registro.presenca_animais,
            registro.agua_encanada,
            registro.energia_eletrica,
            registro.esgoto,
            registro.coleta_lixo,
            registro.area_violencia,
        ]
    )


def _condicoes_socioeconomicas_completa(registro: ConsultaCondicoesSocioeconomicas | None) -> bool:
    if registro is None:
        return False
    if registro.renda_nao_informada or _texto(registro.renda_familiar).strip():
        return True
    return any(
        valor is not None
        for valor in [
            registro.agua_encanada,
            registro.energia_eletrica,
            registro.coleta_lixo,
            registro.area_violencia,
        ]
    ) or bool(
        _texto(registro.tipo_casa).strip()
        or registro.numero_comodos is not None
        or _texto(registro.banheiro).strip()
        or _texto(registro.quarto_crianca).strip()
        or _texto(registro.presenca_animais).strip()
        or _texto(registro.esgoto).strip()
    )


def _diagnostico_response(registro: ConsultaDiagnostico | None) -> DiagnosticoResponse | None:
    if registro is None:
        return None

    secundarios = []
    for item in _carregar_lista_json(registro.cids_secundarios):
        if isinstance(item, str):
            # Compatibilidade caso algum ambiente antigo salve apenas o código.
            secundarios.append(DiagnosticoSecundarioPayload(codigo=item, descricao=""))

    try:
        loaded = json.loads(registro.cids_secundarios or "[]")
    except (TypeError, ValueError, json.JSONDecodeError):
        loaded = []

    if isinstance(loaded, list):
        secundarios = [
            DiagnosticoSecundarioPayload(
                codigo=_texto(item.get("codigo") if isinstance(item, dict) else item),
                descricao=_texto(item.get("descricao") if isinstance(item, dict) else ""),
            )
            for item in loaded
            if _possui_conteudo(item)
        ]

    return DiagnosticoResponse(
        id=registro.id,
        consulta_id=registro.consulta_id,
        cid10_principal=_texto(registro.cid10_principal),
        cids_secundarios=secundarios,
        sid=_texto(registro.sid),
        atualizado_em=registro.updated_at,
    )


def _hipoteses_condutas_response(registro: ConsultaHipotesesCondutas | None) -> HipotesesCondutasResponse | None:
    if registro is None:
        return None
    return HipotesesCondutasResponse(
        id=registro.id,
        consulta_id=registro.consulta_id,
        hipoteses_diagnosticas=_texto(registro.hipoteses_diagnosticas),
        condutas_plano_cuidado=_texto(registro.condutas_plano_cuidado),
        atualizado_em=registro.updated_at,
    )


def _procedimentos_json(registro: ConsultaProcedimentos | None) -> list[ProcedimentoPayload]:
    if registro is None:
        return []
    try:
        payload = json.loads(registro.procedimentos_json or "[]")
    except (json.JSONDecodeError, TypeError):
        payload = []

    if not isinstance(payload, list):
        return []

    procedimentos: list[ProcedimentoPayload] = []
    for item in payload:
        if not isinstance(item, dict):
            continue
        procedimentos.append(
            ProcedimentoPayload(
                procedimento=_texto(item.get("procedimento")),
                quantidade=item.get("quantidade") if isinstance(item.get("quantidade"), int) else None,
                cid_vinculado=_texto(item.get("cid_vinculado")),
                observacoes=_texto(item.get("observacoes")),
            )
        )
    return procedimentos


def _procedimentos_response(registro: ConsultaProcedimentos | None) -> ProcedimentosResponse | None:
    if registro is None:
        return None
    return ProcedimentosResponse(
        id=registro.id,
        consulta_id=registro.consulta_id,
        realizados=registro.realizados,
        procedimentos=_procedimentos_json(registro),
        atualizado_em=registro.updated_at,
    )


def _procedimento_possui_conteudo(item: ProcedimentoPayload) -> bool:
    return bool(
        item.procedimento.strip()
        or item.cid_vinculado.strip()
        or item.observacoes.strip()
        or item.quantidade is not None
    )


def _procedimentos_possuem_conteudo(registro: ConsultaProcedimentos | None) -> bool:
    if registro is None:
        return False
    return bool(
        registro.realizados is not None
        or any(_procedimento_possui_conteudo(item) for item in _procedimentos_json(registro))
    )


def _procedimentos_completos(registro: ConsultaProcedimentos | None) -> bool:
    if registro is None:
        return False
    if registro.realizados is False:
        return True
    if registro.realizados is not True:
        return False
    return any(
        item.procedimento.strip() and item.quantidade is not None and item.quantidade > 0
        for item in _procedimentos_json(registro)
    )


def _dados_externos_ativos(consulta: Consulta) -> list[ConsultaDadosExternos]:
    return [
        registro
        for registro in (consulta.dados_externos or [])
        if registro.deleted_at is None
    ]


def _dado_externo_response(registro: ConsultaDadosExternos) -> DadoExternoResponse:
    return DadoExternoResponse(
        id=registro.id,
        consulta_id=registro.consulta_id,
        ordem=registro.ordem,
        data_consulta_externa=registro.data_consulta_externa,
        servico_origem=_texto(registro.servico_origem),
        peso=float(registro.peso) if registro.peso is not None else None,
        altura=float(registro.altura) if registro.altura is not None else None,
        observacoes_clinicas=_texto(registro.observacoes_clinicas),
        como_dados_obtidos=_texto(registro.como_dados_obtidos),
        atualizado_em=registro.updated_at,
    )


def _dado_externo_possui_conteudo(registro: ConsultaDadosExternos | DadoExternoPayload) -> bool:
    if isinstance(registro, ConsultaDadosExternos):
        return bool(
            registro.data_consulta_externa is not None
            or _texto(registro.servico_origem).strip()
            or registro.peso is not None
            or registro.altura is not None
            or _texto(registro.observacoes_clinicas).strip()
            or _texto(registro.como_dados_obtidos).strip()
        )

    return bool(
        registro.data_consulta_externa is not None
        or registro.servico_origem.strip()
        or registro.peso is not None
        or registro.altura is not None
        or registro.observacoes_clinicas.strip()
        or registro.como_dados_obtidos.strip()
    )


def _dado_externo_completo(registro: ConsultaDadosExternos | DadoExternoPayload) -> bool:
    if isinstance(registro, ConsultaDadosExternos):
        return bool(
            _texto(registro.como_dados_obtidos).strip()
            and (
                registro.data_consulta_externa is not None
                or _texto(registro.servico_origem).strip()
                or registro.peso is not None
                or registro.altura is not None
                or _texto(registro.observacoes_clinicas).strip()
            )
        )

    return bool(
        registro.como_dados_obtidos.strip()
        and (
            registro.data_consulta_externa is not None
            or registro.servico_origem.strip()
            or registro.peso is not None
            or registro.altura is not None
            or registro.observacoes_clinicas.strip()
        )
    )


def _dados_externos_possuem_conteudo(consulta: Consulta) -> bool:
    return any(_dado_externo_possui_conteudo(registro) for registro in _dados_externos_ativos(consulta))


def _dados_externos_completos(consulta: Consulta) -> bool:
    return any(_dado_externo_completo(registro) for registro in _dados_externos_ativos(consulta))


def _hipoteses_condutas_possui_conteudo(registro: ConsultaHipotesesCondutas | None) -> bool:
    if registro is None:
        return False
    return bool(
        _texto(registro.hipoteses_diagnosticas).strip()
        or _texto(registro.condutas_plano_cuidado).strip()
    )


def _hipoteses_condutas_completa(registro: ConsultaHipotesesCondutas | None) -> bool:
    if registro is None:
        return False
    return bool(
        _texto(registro.hipoteses_diagnosticas).strip()
        and _texto(registro.condutas_plano_cuidado).strip()
    )


def _diagnostico_secundarios_possuem_conteudo(registro: ConsultaDiagnostico | None) -> bool:
    if registro is None:
        return False
    response = _diagnostico_response(registro)
    if response is None:
        return False
    return any(_possui_conteudo(item) for item in response.cids_secundarios)


def _diagnostico_possui_conteudo(registro: ConsultaDiagnostico | None) -> bool:
    if registro is None:
        return False
    return bool(
        _texto(registro.cid10_principal).strip()
        or _texto(registro.sid).strip()
        or _diagnostico_secundarios_possuem_conteudo(registro)
    )


def _diagnostico_completo(registro: ConsultaDiagnostico | None) -> bool:
    if registro is None:
        return False
    return bool(_texto(registro.cid10_principal).strip())


def _completed_sections(consulta: Consulta) -> list[str]:
    secoes: list[str] = []
    antropometria = consulta.antropometria
    if antropometria and antropometria.peso is not None and antropometria.altura is not None:
        secoes.append("anthropometric")
    if consulta.anamnese and _texto(consulta.anamnese.clinica_queixa_principal).strip():
        secoes.append("anamnesis")
    if _imunizacoes_possui_conteudo(consulta.imunizacoes):
        secoes.append("imunizacoes")
    if _escolaridade_completa(consulta.escolaridade):
        secoes.append("escolaridade")
    if _triagem_neonatal_completa(consulta.triagem_neonatal):
        secoes.append("triagemNeonatal")
    if _historia_familiar_completa(consulta.historia_familiar):
        secoes.append("historiaFamiliar")
    if _dinamica_familiar_completa(consulta.dinamica_familiar):
        secoes.append("dinamicaFamiliar")
    if _condicoes_socioeconomicas_completa(consulta.condicoes_socioeconomicas):
        secoes.append("socioeconomico")
    if _encaminhamentos_completos(consulta):
        secoes.append("referral")
    if _diagnostico_completo(consulta.diagnostico):
        secoes.append("diagnostico")
    if _hipoteses_condutas_completa(consulta.hipoteses_condutas):
        secoes.append("condutasHipoteses")
    if _procedimentos_completos(consulta.procedimentos):
        secoes.append("procedimentos")
    if _dados_externos_completos(consulta):
        secoes.append("externo")
    return secoes


def _started_sections(consulta: Consulta) -> list[str]:
    secoes: list[str] = []
    antropometria = consulta.antropometria
    if antropometria and any(
        value is not None
        for value in [
            antropometria.peso,
            antropometria.altura,
            antropometria.perimetro_cefalico,
            antropometria.pressao_sistolica,
            antropometria.pressao_diastolica,
            antropometria.imc,
        ]
    ):
        secoes.append("anthropometric")
    if _anamnese_possui_conteudo(consulta.anamnese):
        secoes.append("anamnesis")
    if _imunizacoes_possui_conteudo(consulta.imunizacoes):
        secoes.append("imunizacoes")
    if _escolaridade_possui_conteudo(consulta.escolaridade):
        secoes.append("escolaridade")
    if _triagem_neonatal_possui_conteudo(consulta.triagem_neonatal):
        secoes.append("triagemNeonatal")
    if _historia_familiar_possui_conteudo(consulta.historia_familiar):
        secoes.append("historiaFamiliar")
    if _dinamica_familiar_possui_conteudo(consulta.dinamica_familiar):
        secoes.append("dinamicaFamiliar")
    if _condicoes_socioeconomicas_possui_conteudo(consulta.condicoes_socioeconomicas):
        secoes.append("socioeconomico")
    if _encaminhamentos_possuem_conteudo(consulta):
        secoes.append("referral")
    if _diagnostico_possui_conteudo(consulta.diagnostico):
        secoes.append("diagnostico")
    if _hipoteses_condutas_possui_conteudo(consulta.hipoteses_condutas):
        secoes.append("condutasHipoteses")
    if _procedimentos_possuem_conteudo(consulta.procedimentos):
        secoes.append("procedimentos")
    if _dados_externos_possuem_conteudo(consulta):
        secoes.append("externo")
    return sorted(set([*secoes, *_completed_sections(consulta)]))


async def _obter_consulta_ativa(
    db: AsyncSession,
    paciente_id: str,
    medico_username: str,
) -> Consulta | None:
    stmt = (
        select(Consulta)
        .options(
            selectinload(Consulta.antropometria),
            selectinload(Consulta.anamnese),
            selectinload(Consulta.imunizacoes),
            selectinload(Consulta.escolaridade),
            selectinload(Consulta.triagem_neonatal),
            selectinload(Consulta.encaminhamentos),
            selectinload(Consulta.historia_familiar),
            selectinload(Consulta.dinamica_familiar),
            selectinload(Consulta.condicoes_socioeconomicas),
            selectinload(Consulta.diagnostico),
            selectinload(Consulta.hipoteses_condutas),
            selectinload(Consulta.procedimentos),
            selectinload(Consulta.dados_externos),
        )
        .where(
            Consulta.paciente_id == paciente_id,
            Consulta.medico_username == medico_username,
            Consulta.status == "em_andamento",
            Consulta.deleted_at.is_(None),
        )
        .order_by(Consulta.id.desc())
        .limit(1)
        .execution_options(populate_existing=True)
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def _obter_ou_criar_consulta_ativa(
    db: AsyncSession,
    paciente_id: str,
    medico_username: str,
) -> Consulta:
    consulta = await _obter_consulta_ativa(db, paciente_id, medico_username)
    if consulta:
        return consulta

    consulta = Consulta(
        paciente_id=paciente_id,
        medico_username=medico_username,
        data=datetime.utcnow(),
        status="em_andamento",
    )
    db.add(consulta)
    await db.flush()
    await db.refresh(consulta)
    return consulta


async def _obter_historico_imunizacoes(
    db: AsyncSession,
    paciente_id: str,
    medico_username: str,
    consulta_atual_id: int | None = None,
) -> list[ImunizacoesHistoricoResponse]:
    filtros = [
        Consulta.paciente_id == paciente_id,
        Consulta.medico_username == medico_username,
        Consulta.deleted_at.is_(None),
        ConsultaImunizacoes.deleted_at.is_(None),
        ConsultaImunizacoes.status_vacinal.is_not(None),
        func.trim(ConsultaImunizacoes.status_vacinal) != "",
    ]

    if consulta_atual_id is not None:
        filtros.append(Consulta.id != consulta_atual_id)

    stmt = (
        select(Consulta, ConsultaImunizacoes)
        .join(ConsultaImunizacoes, ConsultaImunizacoes.consulta_id == Consulta.id)
        .where(*filtros)
        .order_by(Consulta.data.desc(), Consulta.id.desc())
        .limit(5)
    )
    result = await db.execute(stmt)

    historico: list[ImunizacoesHistoricoResponse] = []
    for consulta, registro in result.all():
        historico.append(
            ImunizacoesHistoricoResponse(
                consulta_id=consulta.id,
                data_consulta=consulta.data,
                status_vacinal=_texto(registro.status_vacinal),
                atualizado_em=registro.updated_at,
            )
        )
    return historico


async def _montar_response(db: AsyncSession, consulta: Consulta) -> ConsultaAtivaResponse:
    return ConsultaAtivaResponse(
        id=consulta.id,
        paciente_id=consulta.paciente_id,
        medico_username=consulta.medico_username,
        data=consulta.data,
        status=consulta.status,
        completed_sections=_completed_sections(consulta),
        started_sections=_started_sections(consulta),
        antropometria=_antropometria_response(consulta.antropometria),
        anamnese=_anamnese_response(consulta.anamnese),
        imunizacoes=_imunizacoes_response(consulta.imunizacoes),
        escolaridade=_escolaridade_response(consulta.escolaridade),
        triagem_neonatal=_triagem_neonatal_response(consulta.triagem_neonatal),
        encaminhamentos=[_encaminhamento_response(registro) for registro in _encaminhamentos_ativos(consulta)],
        historia_familiar=_historia_familiar_response(consulta.historia_familiar),
        dinamica_familiar=_dinamica_familiar_response(consulta.dinamica_familiar),
        condicoes_socioeconomicas=_condicoes_socioeconomicas_response(consulta.condicoes_socioeconomicas),
        diagnostico=_diagnostico_response(consulta.diagnostico),
        hipoteses_condutas=_hipoteses_condutas_response(consulta.hipoteses_condutas),
        procedimentos=_procedimentos_response(consulta.procedimentos),
        dados_externos=[_dado_externo_response(registro) for registro in _dados_externos_ativos(consulta)],
        imunizacoes_historico=await _obter_historico_imunizacoes(
            db,
            consulta.paciente_id,
            consulta.medico_username,
            consulta.id,
        ),
    )


@router.get("/ativas/{paciente_id}", response_model=ConsultaAtivaResponse | None)
async def obter_consulta_ativa(
    paciente_id: str,
    db: AsyncSession = Depends(get_app_db_session),
    current_user: dict = Depends(auth_handler.decode_token),
) -> ConsultaAtivaResponse | None:
    """Retorna a consulta em andamento do usuário logado para o paciente informado."""
    medico_username = current_user.get("username") or current_user.get("sub") or "usuario"
    consulta = await _obter_consulta_ativa(db, paciente_id, medico_username)
    if consulta is None:
        return None
    return await _montar_response(db, consulta)


@router.get("/imunizacoes/historico/{paciente_id}", response_model=list[ImunizacoesHistoricoResponse])
async def obter_historico_imunizacoes(
    paciente_id: str,
    db: AsyncSession = Depends(get_app_db_session),
    current_user: dict = Depends(auth_handler.decode_token),
) -> list[ImunizacoesHistoricoResponse]:
    """Retorna os registros de status vacinal das últimas 5 consultas anteriores do paciente."""
    medico_username = current_user.get("username") or current_user.get("sub") or "usuario"
    consulta_atual = await _obter_consulta_ativa(db, paciente_id, medico_username)
    consulta_atual_id = consulta_atual.id if consulta_atual is not None else None
    return await _obter_historico_imunizacoes(db, paciente_id, medico_username, consulta_atual_id)


@router.post("/finalizar", response_model=ConsultaFinalizarResponse, status_code=status.HTTP_200_OK)
async def finalizar_consulta(
    body: ConsultaFinalizarRequest,
    db: AsyncSession = Depends(get_app_db_session),
    current_user: dict = Depends(auth_handler.decode_token),
) -> ConsultaFinalizarResponse:
    """Finaliza a consulta em andamento do paciente para o usuário logado."""
    medico_username = current_user.get("username") or current_user.get("sub") or "usuario"
    consulta = await _obter_consulta_ativa(db, body.paciente_id, medico_username)

    if consulta is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Não há consulta em andamento para finalizar este paciente.",
        )

    finalizada_em = datetime.utcnow()
    consulta.status = "finalizada"
    consulta.updated_at = finalizada_em

    await db.flush()
    response = ConsultaFinalizarResponse(
        id=consulta.id,
        paciente_id=consulta.paciente_id,
        medico_username=consulta.medico_username,
        data=consulta.data,
        status=consulta.status,
        completed_sections=_completed_sections(consulta),
        started_sections=_started_sections(consulta),
        finalizada_em=finalizada_em,
    )
    await db.commit()

    return response


@router.post("/antropometria", response_model=ConsultaAtivaResponse, status_code=status.HTTP_200_OK)
async def salvar_antropometria(
    body: AntropometriaSalvarRequest,
    db: AsyncSession = Depends(get_app_db_session),
    current_user: dict = Depends(auth_handler.decode_token),
) -> ConsultaAtivaResponse:
    """
    Salva os dados antropométricos da consulta atual.

    Se ainda não existir consulta em andamento para este paciente e usuário,
    a consulta é criada automaticamente antes de gravar a seção.
    """
    medico_username = current_user.get("username") or current_user.get("sub") or "usuario"
    consulta = await _obter_ou_criar_consulta_ativa(db, body.paciente_id, medico_username)

    pressao_arterial = None
    if body.pressao_sistolica_mmhg is not None or body.pressao_diastolica_mmhg is not None:
        sistolica = body.pressao_sistolica_mmhg if body.pressao_sistolica_mmhg is not None else ""
        diastolica = body.pressao_diastolica_mmhg if body.pressao_diastolica_mmhg is not None else ""
        pressao_arterial = f"{sistolica}/{diastolica}"

    result = await db.execute(
        select(ConsultaAntropometria).where(
            ConsultaAntropometria.consulta_id == consulta.id,
            ConsultaAntropometria.deleted_at.is_(None),
        )
    )
    registro = result.scalar_one_or_none()
    if registro is None:
        registro = ConsultaAntropometria(consulta_id=consulta.id)
        db.add(registro)

    registro.peso = Decimal(str(body.peso_kg))
    registro.altura = Decimal(str(body.altura_cm))
    registro.perimetro_cefalico = Decimal(str(body.perimetro_cefalico_cm)) if body.perimetro_cefalico_cm is not None else None
    registro.pressao_sistolica = body.pressao_sistolica_mmhg
    registro.pressao_diastolica = body.pressao_diastolica_mmhg
    registro.pressao_arterial = pressao_arterial
    registro.imc = Decimal(str(body.imc)) if body.imc is not None else None
    registro.classificacao_imc = body.classificacao_imc
    registro.updated_at = datetime.utcnow()

    await db.flush()
    await db.commit()

    consulta_atualizada = await _obter_consulta_ativa(db, body.paciente_id, medico_username)
    if consulta_atualizada is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Consulta não encontrada após salvar.")

    return await _montar_response(db, consulta_atualizada)


@router.post("/anamnese", response_model=ConsultaAtivaResponse, status_code=status.HTTP_200_OK)
async def salvar_anamnese(
    body: AnamneseSalvarRequest,
    db: AsyncSession = Depends(get_app_db_session),
    current_user: dict = Depends(auth_handler.decode_token),
) -> ConsultaAtivaResponse:
    """
    Salva os dados da anamnese na consulta atual do paciente informado.

    A consulta é sempre localizada por paciente + usuário logado + status em andamento,
    evitando compartilhar a mesma seção entre pacientes diferentes.
    """
    medico_username = current_user.get("username") or current_user.get("sub") or "usuario"
    consulta = await _obter_ou_criar_consulta_ativa(db, body.paciente_id, medico_username)

    result = await db.execute(
        select(ConsultaAnamnese).where(
            ConsultaAnamnese.consulta_id == consulta.id,
            ConsultaAnamnese.deleted_at.is_(None),
        )
    )
    registro = result.scalar_one_or_none()
    if registro is None:
        registro = ConsultaAnamnese(consulta_id=consulta.id)
        db.add(registro)

    clinica = body.clinica
    registro.clinica_queixa_principal = clinica.queixa_principal.strip()
    registro.clinica_historia_doenca_atual = clinica.historia_doenca_atual.strip()
    registro.clinica_interrogatorio_geral = clinica.interrogatorio_geral.strip()
    registro.clinica_interrogatorio_pele_mucosas = clinica.interrogatorio_pele_mucosas.strip()
    registro.clinica_interrogatorio_olhos = clinica.interrogatorio_olhos.strip()
    registro.clinica_interrogatorio_ouvidos = clinica.interrogatorio_ouvidos.strip()
    registro.clinica_interrogatorio_boca = clinica.interrogatorio_boca.strip()
    registro.clinica_interrogatorio_respiratorio = clinica.interrogatorio_respiratorio.strip()
    registro.clinica_interrogatorio_cardiovascular = clinica.interrogatorio_cardiovascular.strip()
    registro.clinica_interrogatorio_gastrointestinal = clinica.interrogatorio_gastrointestinal.strip()
    registro.clinica_interrogatorio_geniturinario = clinica.interrogatorio_geniturinario.strip()
    registro.clinica_interrogatorio_musculo_esqueletico = clinica.interrogatorio_musculo_esqueletico.strip()
    registro.clinica_interrogatorio_sistema_nervoso = clinica.interrogatorio_sistema_nervoso.strip()
    registro.clinica_sistemas_interrogatorio_alterados = _salvar_lista_json(clinica.sistemas_interrogatorio_alterados)
    registro.clinica_medicacoes_rotina = clinica.medicacoes_rotina.strip()
    registro.clinica_exames_complementares = clinica.exames_complementares.strip()
    registro.clinica_antecedentes_doencas = clinica.antecedentes_doencas.strip()

    alimentacao = body.alimentacao
    registro.alimentacao_tipo_aleitamento = alimentacao.tipo_aleitamento.strip()
    registro.alimentacao_cardapio_cafe = alimentacao.cardapio_cafe.strip()
    registro.alimentacao_cardapio_lanche_manha = alimentacao.cardapio_lanche_manha.strip()
    registro.alimentacao_cardapio_almoco = alimentacao.cardapio_almoco.strip()
    registro.alimentacao_cardapio_lanche_tarde = alimentacao.cardapio_lanche_tarde.strip()
    registro.alimentacao_cardapio_jantar = alimentacao.cardapio_jantar.strip()
    registro.alimentacao_cardapio_ceia = alimentacao.cardapio_ceia.strip()
    registro.alimentacao_local_refeicoes = alimentacao.local_refeicoes.strip()
    registro.alimentacao_uso_tela_refeicoes = alimentacao.uso_tela_refeicoes

    habitos = body.habitos
    registro.habitos_sono_horario = habitos.sono_horario.strip()
    registro.habitos_sono_local = habitos.sono_local.strip()
    registro.habitos_sono_higiene = habitos.sono_higiene.strip()
    registro.habitos_sono_alteracoes = habitos.sono_alteracoes.strip()
    registro.habitos_telas_dispositivos = _salvar_lista_json(habitos.telas_dispositivos)
    registro.habitos_telas_tempo_diario = habitos.telas_tempo_diario.strip()
    registro.habitos_telas_frequencia = habitos.telas_frequencia.strip()
    registro.habitos_chupeta_chupa_dedo = habitos.chupeta_chupa_dedo.strip()
    registro.habitos_higiene_dentaria = habitos.higiene_dentaria.strip()
    registro.habitos_atividades_recreativas = habitos.atividades_recreativas.strip()
    registro.updated_at = datetime.utcnow()

    await db.flush()
    await db.commit()

    consulta_atualizada = await _obter_consulta_ativa(db, body.paciente_id, medico_username)
    if consulta_atualizada is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Consulta não encontrada após salvar.")

    return await _montar_response(db, consulta_atualizada)


@router.post("/escolaridade", response_model=ConsultaAtivaResponse, status_code=status.HTTP_200_OK)
async def salvar_escolaridade(
    body: EscolaridadeSalvarRequest,
    db: AsyncSession = Depends(get_app_db_session),
    current_user: dict = Depends(auth_handler.decode_token),
) -> ConsultaAtivaResponse:
    """Salva dados de escolaridade e relacionamento escolar da consulta atual."""
    medico_username = current_user.get("username") or current_user.get("sub") or "usuario"
    consulta = await _obter_ou_criar_consulta_ativa(db, body.paciente_id, medico_username)

    result = await db.execute(
        select(ConsultaEscolaridade).where(
            ConsultaEscolaridade.consulta_id == consulta.id,
            ConsultaEscolaridade.deleted_at.is_(None),
        )
    )
    registro = result.scalar_one_or_none()
    if registro is None:
        registro = ConsultaEscolaridade(consulta_id=consulta.id)
        db.add(registro)

    registro.frequenta_escola_creche = body.frequenta_escola_creche
    registro.ano_serie = body.ano_serie.strip()
    registro.houve_reprovacao = body.houve_reprovacao
    registro.rendimento_relacionamento = body.rendimento_relacionamento.strip()
    registro.updated_at = datetime.utcnow()

    await db.flush()
    await db.commit()

    consulta_atualizada = await _obter_consulta_ativa(db, body.paciente_id, medico_username)
    if consulta_atualizada is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Consulta não encontrada após salvar.")

    return await _montar_response(db, consulta_atualizada)


@router.post("/triagem-neonatal", response_model=ConsultaAtivaResponse, status_code=status.HTTP_200_OK)
async def salvar_triagem_neonatal(
    body: TriagemNeonatalSalvarRequest,
    db: AsyncSession = Depends(get_app_db_session),
    current_user: dict = Depends(auth_handler.decode_token),
) -> ConsultaAtivaResponse:
    """Salva os dados de triagem neonatal na consulta atual do paciente informado."""
    medico_username = current_user.get("username") or current_user.get("sub") or "usuario"
    consulta = await _obter_ou_criar_consulta_ativa(db, body.paciente_id, medico_username)

    result = await db.execute(
        select(ConsultaTriagemNeonatal).where(
            ConsultaTriagemNeonatal.consulta_id == consulta.id,
            ConsultaTriagemNeonatal.deleted_at.is_(None),
        )
    )
    registro = result.scalar_one_or_none()
    if registro is None:
        registro = ConsultaTriagemNeonatal(consulta_id=consulta.id)
        db.add(registro)

    registro.idade_gestacional_semanas = body.idade_gestacional_semanas
    registro.peso_nascimento_gramas = body.peso_nascimento_gramas
    registro.hipoteses_diagnosticas_anteriores = body.hipoteses_diagnosticas_anteriores.strip()

    registro.teste_pezinho_resultado = body.teste_pezinho.resultado.strip()
    registro.teste_pezinho_data = body.teste_pezinho.data
    registro.teste_pezinho_descricao = body.teste_pezinho.descricao.strip()

    registro.teste_orelhinha_resultado = body.teste_orelhinha.resultado.strip()
    registro.teste_orelhinha_data = body.teste_orelhinha.data
    registro.teste_orelhinha_descricao = body.teste_orelhinha.descricao.strip()

    registro.teste_olhinho_resultado = body.teste_olhinho.resultado.strip()
    registro.teste_olhinho_data = body.teste_olhinho.data
    registro.teste_olhinho_descricao = body.teste_olhinho.descricao.strip()

    registro.teste_coracaozinho_resultado = body.teste_coracaozinho.resultado.strip()
    registro.teste_coracaozinho_data = body.teste_coracaozinho.data
    registro.teste_coracaozinho_descricao = body.teste_coracaozinho.descricao.strip()
    registro.updated_at = datetime.utcnow()

    await db.flush()
    await db.commit()

    consulta_atualizada = await _obter_consulta_ativa(db, body.paciente_id, medico_username)
    if consulta_atualizada is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Consulta não encontrada após salvar.")

    return await _montar_response(db, consulta_atualizada)


@router.post("/encaminhamentos", response_model=ConsultaAtivaResponse, status_code=status.HTTP_200_OK)
async def salvar_encaminhamentos(
    body: EncaminhamentosSalvarRequest,
    db: AsyncSession = Depends(get_app_db_session),
    current_user: dict = Depends(auth_handler.decode_token),
) -> ConsultaAtivaResponse:
    """Salva a lista de encaminhamentos da consulta atual do paciente informado."""
    medico_username = current_user.get("username") or current_user.get("sub") or "usuario"
    consulta = await _obter_ou_criar_consulta_ativa(db, body.paciente_id, medico_username)

    result = await db.execute(
        select(ConsultaEncaminhamento).where(
            ConsultaEncaminhamento.consulta_id == consulta.id,
            ConsultaEncaminhamento.deleted_at.is_(None),
        )
    )
    existentes = list(result.scalars().all())
    agora = datetime.utcnow()

    # Mantém histórico lógico por soft delete e recria a lista enviada pela tela.
    # Isso evita reaproveitar um encaminhamento removido em outro índice/cartão.
    for registro in existentes:
        registro.deleted_at = agora
        registro.updated_at = agora

    for ordem, item in enumerate(body.encaminhamentos):
        if not _possui_conteudo(item):
            continue

        registro = ConsultaEncaminhamento(
            consulta_id=consulta.id,
            ordem=ordem,
            especialidade=item.especialidade.strip(),
            prioridade=item.prioridade.strip() or "Eletivo",
            procedimento_motivo=item.procedimento_motivo.strip(),
            justificativa_clinica=item.justificativa_clinica.strip(),
            updated_at=agora,
        )
        db.add(registro)

    await db.flush()
    await db.commit()

    consulta_atualizada = await _obter_consulta_ativa(db, body.paciente_id, medico_username)
    if consulta_atualizada is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Consulta não encontrada após salvar.")

    return await _montar_response(db, consulta_atualizada)


@router.post("/historia-familiar", response_model=ConsultaAtivaResponse, status_code=status.HTTP_200_OK)
async def salvar_historia_familiar(
    body: HistoriaFamiliarSalvarRequest,
    db: AsyncSession = Depends(get_app_db_session),
    current_user: dict = Depends(auth_handler.decode_token),
) -> ConsultaAtivaResponse:
    """Salva a história familiar da consulta atual do paciente informado."""
    medico_username = current_user.get("username") or current_user.get("sub") or "usuario"
    consulta = await _obter_ou_criar_consulta_ativa(db, body.paciente_id, medico_username)

    result = await db.execute(
        select(ConsultaHistoriaFamiliar).where(
            ConsultaHistoriaFamiliar.consulta_id == consulta.id,
            ConsultaHistoriaFamiliar.deleted_at.is_(None),
        )
    )
    registro = result.scalar_one_or_none()
    if registro is None:
        registro = ConsultaHistoriaFamiliar(consulta_id=consulta.id)
        db.add(registro)

    registro.houve_mudanca = body.houve_mudanca
    registro.maternal_idade = body.maternal_idade.strip()
    registro.maternal_saude = body.maternal_saude.strip()
    registro.maternal_ocupacao = body.maternal_ocupacao.strip()
    registro.paternal_idade = body.paternal_idade.strip()
    registro.paternal_saude = body.paternal_saude.strip()
    registro.paternal_ocupacao = body.paternal_ocupacao.strip()
    registro.coabitacao_pais = body.coabitacao_pais.strip()
    registro.irmaos_saude = body.irmaos_saude.strip()
    registro.updated_at = datetime.utcnow()

    await db.flush()
    await db.commit()

    consulta_atualizada = await _obter_consulta_ativa(db, body.paciente_id, medico_username)
    if consulta_atualizada is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Consulta não encontrada após salvar.")

    return await _montar_response(db, consulta_atualizada)


@router.post("/dinamica-familiar", response_model=ConsultaAtivaResponse, status_code=status.HTTP_200_OK)
async def salvar_dinamica_familiar(
    body: DinamicaFamiliarSalvarRequest,
    db: AsyncSession = Depends(get_app_db_session),
    current_user: dict = Depends(auth_handler.decode_token),
) -> ConsultaAtivaResponse:
    """Salva a dinâmica familiar da consulta atual do paciente informado."""
    medico_username = current_user.get("username") or current_user.get("sub") or "usuario"
    consulta = await _obter_ou_criar_consulta_ativa(db, body.paciente_id, medico_username)

    result = await db.execute(
        select(ConsultaDinamicaFamiliar).where(
            ConsultaDinamicaFamiliar.consulta_id == consulta.id,
            ConsultaDinamicaFamiliar.deleted_at.is_(None),
        )
    )
    registro = result.scalar_one_or_none()
    if registro is None:
        registro = ConsultaDinamicaFamiliar(consulta_id=consulta.id)
        db.add(registro)

    registro.houve_mudanca = body.houve_mudanca
    registro.relacionamento_companheiro = body.relacionamento_companheiro.strip()
    registro.resolucao_desentendimentos = body.resolucao_desentendimentos.strip()
    registro.fumante_domicilio = body.fumante_domicilio
    registro.uso_alcool_drogas = body.uso_alcool_drogas
    registro.inseguranca_alimentar = body.inseguranca_alimentar
    registro.familiar_preso = body.familiar_preso
    registro.preocupacao_comportamento = body.preocupacao_comportamento
    registro.disciplina_opcoes = _salvar_lista_json(body.disciplina_opcoes)
    registro.updated_at = datetime.utcnow()

    await db.flush()
    await db.commit()

    consulta_atualizada = await _obter_consulta_ativa(db, body.paciente_id, medico_username)
    if consulta_atualizada is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Consulta não encontrada após salvar.")

    return await _montar_response(db, consulta_atualizada)


@router.post("/condicoes-socioeconomicas", response_model=ConsultaAtivaResponse, status_code=status.HTTP_200_OK)
async def salvar_condicoes_socioeconomicas(
    body: CondicoesSocioeconomicasSalvarRequest,
    db: AsyncSession = Depends(get_app_db_session),
    current_user: dict = Depends(auth_handler.decode_token),
) -> ConsultaAtivaResponse:
    """Salva as condições socioeconômicas da consulta atual do paciente informado."""
    medico_username = current_user.get("username") or current_user.get("sub") or "usuario"
    consulta = await _obter_ou_criar_consulta_ativa(db, body.paciente_id, medico_username)

    result = await db.execute(
        select(ConsultaCondicoesSocioeconomicas).where(
            ConsultaCondicoesSocioeconomicas.consulta_id == consulta.id,
            ConsultaCondicoesSocioeconomicas.deleted_at.is_(None),
        )
    )
    registro = result.scalar_one_or_none()
    if registro is None:
        registro = ConsultaCondicoesSocioeconomicas(consulta_id=consulta.id)
        db.add(registro)

    registro.renda_familiar = body.renda_familiar.strip()
    registro.renda_nao_informada = body.renda_nao_informada
    registro.tipo_casa = body.tipo_casa.strip()
    registro.numero_comodos = body.numero_comodos
    registro.banheiro = body.banheiro.strip()
    registro.quarto_crianca = body.quarto_crianca.strip()
    registro.presenca_animais = body.presenca_animais.strip()
    registro.agua_encanada = body.agua_encanada
    registro.energia_eletrica = body.energia_eletrica
    registro.esgoto = body.esgoto.strip()
    registro.coleta_lixo = body.coleta_lixo
    registro.area_violencia = body.area_violencia
    registro.updated_at = datetime.utcnow()

    await db.flush()
    await db.commit()

    consulta_atualizada = await _obter_consulta_ativa(db, body.paciente_id, medico_username)
    if consulta_atualizada is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Consulta não encontrada após salvar.")

    return await _montar_response(db, consulta_atualizada)


@router.post("/diagnostico", response_model=ConsultaAtivaResponse, status_code=status.HTTP_200_OK)
async def salvar_diagnostico(
    body: DiagnosticoSalvarRequest,
    db: AsyncSession = Depends(get_app_db_session),
    current_user: dict = Depends(auth_handler.decode_token),
) -> ConsultaAtivaResponse:
    """Salva o diagnóstico principal, CIDs secundários e SID da consulta atual."""
    medico_username = current_user.get("username") or current_user.get("sub") or "usuario"
    consulta = await _obter_ou_criar_consulta_ativa(db, body.paciente_id, medico_username)

    result = await db.execute(
        select(ConsultaDiagnostico).where(
            ConsultaDiagnostico.consulta_id == consulta.id,
            ConsultaDiagnostico.deleted_at.is_(None),
        )
    )
    registro = result.scalar_one_or_none()
    if registro is None:
        registro = ConsultaDiagnostico(consulta_id=consulta.id)
        db.add(registro)

    secundarios = [
        {
            "codigo": item.codigo.strip(),
            "descricao": item.descricao.strip(),
        }
        for item in body.cids_secundarios
        if item.codigo.strip() or item.descricao.strip()
    ]

    registro.cid10_principal = body.cid10_principal.strip()
    registro.cids_secundarios = json.dumps(secundarios, ensure_ascii=False)
    registro.sid = body.sid.strip()
    registro.updated_at = datetime.utcnow()

    await db.flush()
    await db.commit()

    consulta_atualizada = await _obter_consulta_ativa(db, body.paciente_id, medico_username)
    if consulta_atualizada is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Consulta não encontrada após salvar.")

    return await _montar_response(db, consulta_atualizada)


@router.post("/hipoteses-condutas", response_model=ConsultaAtivaResponse, status_code=status.HTTP_200_OK)
async def salvar_hipoteses_condutas(
    body: HipotesesCondutasSalvarRequest,
    db: AsyncSession = Depends(get_app_db_session),
    current_user: dict = Depends(auth_handler.decode_token),
) -> ConsultaAtivaResponse:
    """Salva hipóteses diagnósticas e condutas/plano de cuidado da consulta atual."""
    medico_username = current_user.get("username") or current_user.get("sub") or "usuario"
    consulta = await _obter_ou_criar_consulta_ativa(db, body.paciente_id, medico_username)

    result = await db.execute(
        select(ConsultaHipotesesCondutas).where(
            ConsultaHipotesesCondutas.consulta_id == consulta.id,
            ConsultaHipotesesCondutas.deleted_at.is_(None),
        )
    )
    registro = result.scalar_one_or_none()
    if registro is None:
        registro = ConsultaHipotesesCondutas(consulta_id=consulta.id)
        db.add(registro)

    registro.hipoteses_diagnosticas = body.hipoteses_diagnosticas.strip()
    registro.condutas_plano_cuidado = body.condutas_plano_cuidado.strip()
    registro.updated_at = datetime.utcnow()

    await db.flush()
    await db.commit()

    consulta_atualizada = await _obter_consulta_ativa(db, body.paciente_id, medico_username)
    if consulta_atualizada is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Consulta não encontrada após salvar.")

    return await _montar_response(db, consulta_atualizada)


@router.post("/procedimentos", response_model=ConsultaAtivaResponse, status_code=status.HTTP_200_OK)
async def salvar_procedimentos(
    body: ProcedimentosSalvarRequest,
    db: AsyncSession = Depends(get_app_db_session),
    current_user: dict = Depends(auth_handler.decode_token),
) -> ConsultaAtivaResponse:
    """Salva os procedimentos realizados durante a consulta atual."""
    medico_username = current_user.get("username") or current_user.get("sub") or "usuario"
    consulta = await _obter_ou_criar_consulta_ativa(db, body.paciente_id, medico_username)

    result = await db.execute(
        select(ConsultaProcedimentos).where(
            ConsultaProcedimentos.consulta_id == consulta.id,
            ConsultaProcedimentos.deleted_at.is_(None),
        )
    )
    registro = result.scalar_one_or_none()
    if registro is None:
        registro = ConsultaProcedimentos(consulta_id=consulta.id)
        db.add(registro)

    procedimentos = [
        {
            "procedimento": item.procedimento.strip(),
            "quantidade": item.quantidade,
            "cid_vinculado": item.cid_vinculado.strip(),
            "observacoes": item.observacoes.strip(),
        }
        for item in body.procedimentos
        if item.procedimento.strip() or item.quantidade is not None or item.cid_vinculado.strip() or item.observacoes.strip()
    ]

    registro.realizados = body.realizados
    registro.procedimentos_json = json.dumps(procedimentos, ensure_ascii=False)
    registro.updated_at = datetime.utcnow()

    await db.flush()
    await db.commit()

    consulta_atualizada = await _obter_consulta_ativa(db, body.paciente_id, medico_username)
    if consulta_atualizada is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Consulta não encontrada após salvar.")

    return await _montar_response(db, consulta_atualizada)


@router.post("/dados-externos", response_model=ConsultaAtivaResponse, status_code=status.HTTP_200_OK)
async def salvar_dados_externos(
    body: DadosExternosSalvarRequest,
    db: AsyncSession = Depends(get_app_db_session),
    current_user: dict = Depends(auth_handler.decode_token),
) -> ConsultaAtivaResponse:
    """Salva registros de dados externos fornecidos pela família para a consulta atual."""
    medico_username = current_user.get("username") or current_user.get("sub") or "usuario"
    consulta = await _obter_ou_criar_consulta_ativa(db, body.paciente_id, medico_username)

    existentes_result = await db.execute(
        select(ConsultaDadosExternos).where(
            ConsultaDadosExternos.consulta_id == consulta.id,
            ConsultaDadosExternos.deleted_at.is_(None),
        )
    )
    existentes = list(existentes_result.scalars().all())

    for registro in existentes:
        await db.delete(registro)

    registros_validos = [item for item in body.registros if _dado_externo_possui_conteudo(item)]
    for indice, item in enumerate(registros_validos):
        db.add(
            ConsultaDadosExternos(
                consulta_id=consulta.id,
                ordem=indice,
                data_consulta_externa=item.data_consulta_externa,
                servico_origem=item.servico_origem.strip(),
                peso=item.peso,
                altura=item.altura,
                observacoes_clinicas=item.observacoes_clinicas.strip(),
                como_dados_obtidos=item.como_dados_obtidos.strip(),
            )
        )

    await db.flush()
    await db.commit()

    consulta_atualizada = await _obter_consulta_ativa(db, body.paciente_id, medico_username)
    if consulta_atualizada is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Consulta não encontrada após salvar.")

    return await _montar_response(db, consulta_atualizada)


@router.post("/imunizacoes", response_model=ConsultaAtivaResponse, status_code=status.HTTP_200_OK)
async def salvar_imunizacoes(
    body: ImunizacoesSalvarRequest,
    db: AsyncSession = Depends(get_app_db_session),
    current_user: dict = Depends(auth_handler.decode_token),
) -> ConsultaAtivaResponse:
    """
    Salva o status vacinal da consulta atual do paciente informado.

    A consulta é localizada por paciente + usuário logado + status em andamento,
    mantendo os dados isolados por paciente/consulta.
    """
    medico_username = current_user.get("username") or current_user.get("sub") or "usuario"
    consulta = await _obter_ou_criar_consulta_ativa(db, body.paciente_id, medico_username)

    result = await db.execute(
        select(ConsultaImunizacoes).where(
            ConsultaImunizacoes.consulta_id == consulta.id,
            ConsultaImunizacoes.deleted_at.is_(None),
        )
    )
    registro = result.scalar_one_or_none()
    if registro is None:
        registro = ConsultaImunizacoes(consulta_id=consulta.id)
        db.add(registro)

    registro.status_vacinal = body.status_vacinal.strip()
    registro.updated_at = datetime.utcnow()

    await db.flush()
    await db.commit()

    consulta_atualizada = await _obter_consulta_ativa(db, body.paciente_id, medico_username)
    if consulta_atualizada is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Consulta não encontrada após salvar.")

    return await _montar_response(db, consulta_atualizada)
