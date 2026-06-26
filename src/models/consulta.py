from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..resources.database import Base


class Consulta(Base):
    __tablename__ = "consultas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    paciente_id = Column(Text, nullable=False, index=True)
    medico_username = Column(Text, nullable=False, index=True)
    data = Column(DateTime, nullable=False, server_default=func.now())
    status = Column(Text, nullable=False, server_default="em_andamento", index=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime, nullable=True)

    antropometria = relationship(
        "ConsultaAntropometria",
        back_populates="consulta",
        uselist=False,
        cascade="all, delete-orphan",
    )
    anamnese = relationship(
        "ConsultaAnamnese",
        back_populates="consulta",
        uselist=False,
        cascade="all, delete-orphan",
    )
    imunizacoes = relationship(
        "ConsultaImunizacoes",
        back_populates="consulta",
        uselist=False,
        cascade="all, delete-orphan",
    )
    escolaridade = relationship(
        "ConsultaEscolaridade",
        back_populates="consulta",
        uselist=False,
        cascade="all, delete-orphan",
    )
    triagem_neonatal = relationship(
        "ConsultaTriagemNeonatal",
        back_populates="consulta",
        uselist=False,
        cascade="all, delete-orphan",
    )
    encaminhamentos = relationship(
        "ConsultaEncaminhamento",
        back_populates="consulta",
        cascade="all, delete-orphan",
        order_by="ConsultaEncaminhamento.ordem",
    )
    historia_familiar = relationship(
        "ConsultaHistoriaFamiliar",
        back_populates="consulta",
        uselist=False,
        cascade="all, delete-orphan",
    )
    dinamica_familiar = relationship(
        "ConsultaDinamicaFamiliar",
        back_populates="consulta",
        uselist=False,
        cascade="all, delete-orphan",
    )
    condicoes_socioeconomicas = relationship(
        "ConsultaCondicoesSocioeconomicas",
        back_populates="consulta",
        uselist=False,
        cascade="all, delete-orphan",
    )
    diagnostico = relationship(
        "ConsultaDiagnostico",
        back_populates="consulta",
        uselist=False,
        cascade="all, delete-orphan",
    )
    hipoteses_condutas = relationship(
        "ConsultaHipotesesCondutas",
        back_populates="consulta",
        uselist=False,
        cascade="all, delete-orphan",
    )
    procedimentos = relationship(
        "ConsultaProcedimentos",
        back_populates="consulta",
        uselist=False,
        cascade="all, delete-orphan",
    )
    dados_externos = relationship(
        "ConsultaDadosExternos",
        back_populates="consulta",
        cascade="all, delete-orphan",
        order_by="ConsultaDadosExternos.ordem",
    )


class ConsultaAntropometria(Base):
    __tablename__ = "consulta_antropometria"
    __table_args__ = (
        UniqueConstraint("consulta_id", name="uq_consulta_antropometria_consulta_id"),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    consulta_id = Column(Integer, ForeignKey("consultas.id"), nullable=False, index=True)
    peso = Column(Numeric(7, 2), nullable=True)
    altura = Column(Numeric(7, 2), nullable=True)
    perimetro_cefalico = Column(Numeric(7, 2), nullable=True)
    imc = Column(Numeric(7, 2), nullable=True)
    classificacao_imc = Column(String(32), nullable=True)
    pressao_sistolica = Column(Integer, nullable=True)
    pressao_diastolica = Column(Integer, nullable=True)
    pressao_arterial = Column(String(32), nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime, nullable=True)

    consulta = relationship("Consulta", back_populates="antropometria")


class ConsultaAnamnese(Base):
    __tablename__ = "consulta_anamnese"
    __table_args__ = (
        UniqueConstraint("consulta_id", name="uq_consulta_anamnese_consulta_id"),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    consulta_id = Column(Integer, ForeignKey("consultas.id"), nullable=False, index=True)

    clinica_queixa_principal = Column(Text, nullable=True)
    clinica_historia_doenca_atual = Column(Text, nullable=True)
    clinica_interrogatorio_geral = Column(Text, nullable=True)
    clinica_interrogatorio_pele_mucosas = Column(Text, nullable=True)
    clinica_interrogatorio_olhos = Column(Text, nullable=True)
    clinica_interrogatorio_ouvidos = Column(Text, nullable=True)
    clinica_interrogatorio_boca = Column(Text, nullable=True)
    clinica_interrogatorio_respiratorio = Column(Text, nullable=True)
    clinica_interrogatorio_cardiovascular = Column(Text, nullable=True)
    clinica_interrogatorio_gastrointestinal = Column(Text, nullable=True)
    clinica_interrogatorio_geniturinario = Column(Text, nullable=True)
    clinica_interrogatorio_musculo_esqueletico = Column(Text, nullable=True)
    clinica_interrogatorio_sistema_nervoso = Column(Text, nullable=True)
    clinica_sistemas_interrogatorio_alterados = Column(Text, nullable=False, default="[]")
    clinica_medicacoes_rotina = Column(Text, nullable=True)
    clinica_exames_complementares = Column(Text, nullable=True)
    clinica_antecedentes_doencas = Column(Text, nullable=True)

    alimentacao_tipo_aleitamento = Column(Text, nullable=True)
    alimentacao_cardapio_cafe = Column(Text, nullable=True)
    alimentacao_cardapio_lanche_manha = Column(Text, nullable=True)
    alimentacao_cardapio_almoco = Column(Text, nullable=True)
    alimentacao_cardapio_lanche_tarde = Column(Text, nullable=True)
    alimentacao_cardapio_jantar = Column(Text, nullable=True)
    alimentacao_cardapio_ceia = Column(Text, nullable=True)
    alimentacao_local_refeicoes = Column(Text, nullable=True)
    alimentacao_uso_tela_refeicoes = Column(Boolean, nullable=False, default=False)

    habitos_sono_horario = Column(Text, nullable=True)
    habitos_sono_local = Column(Text, nullable=True)
    habitos_sono_higiene = Column(Text, nullable=True)
    habitos_sono_alteracoes = Column(Text, nullable=True)
    habitos_telas_dispositivos = Column(Text, nullable=False, default="[]")
    habitos_telas_tempo_diario = Column(Text, nullable=True)
    habitos_telas_frequencia = Column(Text, nullable=True)
    habitos_chupeta_chupa_dedo = Column(Text, nullable=True)
    habitos_higiene_dentaria = Column(Text, nullable=True)
    habitos_atividades_recreativas = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime, nullable=True)

    consulta = relationship("Consulta", back_populates="anamnese")


class ConsultaTriagemNeonatal(Base):
    __tablename__ = "consulta_triagem_neonatal"
    __table_args__ = (
        UniqueConstraint("consulta_id", name="uq_consulta_triagem_neonatal_consulta_id"),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    consulta_id = Column(Integer, ForeignKey("consultas.id"), nullable=False, index=True)

    idade_gestacional_semanas = Column(Integer, nullable=True)
    peso_nascimento_gramas = Column(Integer, nullable=True)
    hipoteses_diagnosticas_anteriores = Column(Text, nullable=True)

    teste_pezinho_resultado = Column(String(32), nullable=True)
    teste_pezinho_data = Column(Date, nullable=True)
    teste_pezinho_descricao = Column(Text, nullable=True)

    teste_orelhinha_resultado = Column(String(32), nullable=True)
    teste_orelhinha_data = Column(Date, nullable=True)
    teste_orelhinha_descricao = Column(Text, nullable=True)

    teste_olhinho_resultado = Column(String(32), nullable=True)
    teste_olhinho_data = Column(Date, nullable=True)
    teste_olhinho_descricao = Column(Text, nullable=True)

    teste_coracaozinho_resultado = Column(String(32), nullable=True)
    teste_coracaozinho_data = Column(Date, nullable=True)
    teste_coracaozinho_descricao = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime, nullable=True)

    consulta = relationship("Consulta", back_populates="triagem_neonatal")


class ConsultaEncaminhamento(Base):
    __tablename__ = "consulta_encaminhamentos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    consulta_id = Column(Integer, ForeignKey("consultas.id"), nullable=False, index=True)
    ordem = Column(Integer, nullable=False, default=0)
    especialidade = Column(Text, nullable=True)
    prioridade = Column(String(32), nullable=False, default="Eletivo")
    procedimento_motivo = Column(Text, nullable=True)
    justificativa_clinica = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime, nullable=True)

    consulta = relationship("Consulta", back_populates="encaminhamentos")


class ConsultaHistoriaFamiliar(Base):
    __tablename__ = "consulta_historia_familiar"
    __table_args__ = (
        UniqueConstraint("consulta_id", name="uq_consulta_historia_familiar_consulta_id"),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    consulta_id = Column(Integer, ForeignKey("consultas.id"), nullable=False, index=True)

    houve_mudanca = Column(Boolean, nullable=True)
    maternal_idade = Column(Text, nullable=True)
    maternal_saude = Column(Text, nullable=True)
    maternal_ocupacao = Column(Text, nullable=True)
    paternal_idade = Column(Text, nullable=True)
    paternal_saude = Column(Text, nullable=True)
    paternal_ocupacao = Column(Text, nullable=True)
    coabitacao_pais = Column(Text, nullable=True)
    irmaos_saude = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime, nullable=True)

    consulta = relationship("Consulta", back_populates="historia_familiar")


class ConsultaDinamicaFamiliar(Base):
    __tablename__ = "consulta_dinamica_familiar"
    __table_args__ = (
        UniqueConstraint("consulta_id", name="uq_consulta_dinamica_familiar_consulta_id"),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    consulta_id = Column(Integer, ForeignKey("consultas.id"), nullable=False, index=True)

    houve_mudanca = Column(Boolean, nullable=True)
    relacionamento_companheiro = Column(Text, nullable=True)
    resolucao_desentendimentos = Column(Text, nullable=True)
    fumante_domicilio = Column(Boolean, nullable=True)
    uso_alcool_drogas = Column(Boolean, nullable=True)
    inseguranca_alimentar = Column(Boolean, nullable=True)
    familiar_preso = Column(Boolean, nullable=True)
    preocupacao_comportamento = Column(Boolean, nullable=True)
    disciplina_opcoes = Column(Text, nullable=False, default="[]")

    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime, nullable=True)

    consulta = relationship("Consulta", back_populates="dinamica_familiar")


class ConsultaCondicoesSocioeconomicas(Base):
    __tablename__ = "consulta_condicoes_socioeconomicas"
    __table_args__ = (
        UniqueConstraint("consulta_id", name="uq_consulta_condicoes_socioeconomicas_consulta_id"),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    consulta_id = Column(Integer, ForeignKey("consultas.id"), nullable=False, index=True)

    renda_familiar = Column(Text, nullable=True)
    renda_nao_informada = Column(Boolean, nullable=False, default=False)
    tipo_casa = Column(Text, nullable=True)
    numero_comodos = Column(Integer, nullable=True)
    banheiro = Column(Text, nullable=True)
    quarto_crianca = Column(Text, nullable=True)
    presenca_animais = Column(Text, nullable=True)
    agua_encanada = Column(Boolean, nullable=True)
    energia_eletrica = Column(Boolean, nullable=True)
    esgoto = Column(Text, nullable=True)
    coleta_lixo = Column(Boolean, nullable=True)
    area_violencia = Column(Boolean, nullable=True)

    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime, nullable=True)

    consulta = relationship("Consulta", back_populates="condicoes_socioeconomicas")


class ConsultaDiagnostico(Base):
    __tablename__ = "consulta_diagnostico"
    __table_args__ = (
        UniqueConstraint("consulta_id", name="uq_consulta_diagnostico_consulta_id"),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    consulta_id = Column(Integer, ForeignKey("consultas.id"), nullable=False, index=True)

    cid10_principal = Column(Text, nullable=True)
    cids_secundarios = Column(Text, nullable=False, default="[]")
    sid = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime, nullable=True)

    consulta = relationship("Consulta", back_populates="diagnostico")


class ConsultaHipotesesCondutas(Base):
    __tablename__ = "consulta_hipoteses_condutas"
    __table_args__ = (
        UniqueConstraint("consulta_id", name="uq_consulta_hipoteses_condutas_consulta_id"),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    consulta_id = Column(Integer, ForeignKey("consultas.id"), nullable=False, index=True)

    hipoteses_diagnosticas = Column(Text, nullable=True)
    condutas_plano_cuidado = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime, nullable=True)

    consulta = relationship("Consulta", back_populates="hipoteses_condutas")


class ConsultaImunizacoes(Base):
    __tablename__ = "consulta_imunizacoes"
    __table_args__ = (
        UniqueConstraint("consulta_id", name="uq_consulta_imunizacoes_consulta_id"),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    consulta_id = Column(Integer, ForeignKey("consultas.id"), nullable=False, index=True)
    status_vacinal = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime, nullable=True)

    consulta = relationship("Consulta", back_populates="imunizacoes")


class ConsultaEscolaridade(Base):
    __tablename__ = "consulta_escolaridade"
    __table_args__ = (
        UniqueConstraint("consulta_id", name="uq_consulta_escolaridade_consulta_id"),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    consulta_id = Column(Integer, ForeignKey("consultas.id"), nullable=False, index=True)
    frequenta_escola_creche = Column(Boolean, nullable=True)
    ano_serie = Column(Text, nullable=True)
    houve_reprovacao = Column(Boolean, nullable=True)
    rendimento_relacionamento = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime, nullable=True)

    consulta = relationship("Consulta", back_populates="escolaridade")


class ConsultaProcedimentos(Base):
    __tablename__ = "consulta_procedimentos"
    __table_args__ = (
        UniqueConstraint("consulta_id", name="uq_consulta_procedimentos_consulta_id"),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    consulta_id = Column(Integer, ForeignKey("consultas.id"), nullable=False, index=True)
    realizados = Column(Boolean, nullable=True)
    procedimentos_json = Column(Text, nullable=False, default="[]")
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime, nullable=True)

    consulta = relationship("Consulta", back_populates="procedimentos")


class ConsultaDadosExternos(Base):
    __tablename__ = "consulta_dados_externos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    consulta_id = Column(Integer, ForeignKey("consultas.id"), nullable=False, index=True)
    ordem = Column(Integer, nullable=False, default=0)
    data_consulta_externa = Column(Date, nullable=True)
    servico_origem = Column(Text, nullable=True)
    peso = Column(Numeric(7, 2), nullable=True)
    altura = Column(Numeric(7, 2), nullable=True)
    observacoes_clinicas = Column(Text, nullable=True)
    como_dados_obtidos = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime, nullable=True)

    consulta = relationship("Consulta", back_populates="dados_externos")


class Alerta(Base):
    __tablename__ = "alertas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    paciente_id = Column(Text, nullable=False, index=True)
    tipo = Column(Text, nullable=False)
    categoria = Column(Text, nullable=False)
    mensagem = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime, nullable=True)
