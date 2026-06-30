import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { usePacienteStore } from './paciente'
import api from '../services/api'
import type { StatusMarco, ExameFisico, SistemaStatus } from '../types/clinica'
import type { ClassificacaoImc } from '../data/antropometria-ranges'

export type ClassificacaoDesenvolvimento = 'adequado' | 'alerta' | 'provavel-atraso'

export type SecaoId =
  | 'anthropometric' | 'anamnesis' | 'imunizacoes' | 'triagemNeonatal'
  | 'escolaridade' | 'clinical' | 'milestones' | 'mchat'
  | 'historiaFamiliar' | 'dinamicaFamiliar' | 'socioeconomico'
  | 'referral' | 'diagnostico' | 'condutasHipoteses' | 'procedimentos' | 'externo'

export interface Secao {
  id: SecaoId
  label: string
  group: 'formulario' | 'registro'
}

export type AbaAnamnese = 'clinica' | 'alimentacao' | 'habitos'

export type ValorCampoAnamnese = string | boolean | string[]

export interface AnamneseClinica {
  queixaPrincipal: string
  historiaDoencaAtual: string
  interrogatorioGeral: string
  interrogatorioPeleMucosas: string
  interrogatorioOlhos: string
  interrogatorioOuvidos: string
  interrogatorioBoca: string
  interrogatorioRespiratorio: string
  interrogatorioCardiovascular: string
  interrogatorioGastrointestinal: string
  interrogatorioGeniturinario: string
  interrogatorioMusculoEsqueletico: string
  interrogatorioSistemaNervoso: string
  sistemasInterrogatorioAlterados: string[]
  medicacoesRotina: string
  examesComplementares: string
  antecedentesDoencas: string
}

export interface AnamneseAlimentacao {
  tipoAleitamento: string
  cardapioCafe: string
  cardapioLancheManha: string
  cardapioAlmoco: string
  cardapioLancheTarde: string
  cardapioJantar: string
  cardapioCeia: string
  localRefeicoes: string
  usoTelaRefeicoes: boolean
}

export interface AnamneseHabitos {
  sonoHorario: string
  sonoLocal: string
  sonoHigiene: string
  sonoAlteracoes: string
  telasDispositivos: string[]
  telasTempoDiario: string
  telasFrequencia: string
  chupetaChupaDedo: string
  higieneDentaria: string
  atividadesRecreativas: string
}

export interface DadosAnamneseConsulta {
  clinica: AnamneseClinica
  alimentacao: AnamneseAlimentacao
  habitos: AnamneseHabitos
  atualizadoEm: string | null
}

export type DadosAnamnesePayload = Omit<DadosAnamneseConsulta, 'atualizadoEm'>

interface AnamneseClinicaApiPayload {
  queixa_principal: string
  historia_doenca_atual: string
  interrogatorio_geral: string
  interrogatorio_pele_mucosas: string
  interrogatorio_olhos: string
  interrogatorio_ouvidos: string
  interrogatorio_boca: string
  interrogatorio_respiratorio: string
  interrogatorio_cardiovascular: string
  interrogatorio_gastrointestinal: string
  interrogatorio_geniturinario: string
  interrogatorio_musculo_esqueletico: string
  interrogatorio_sistema_nervoso: string
  sistemas_interrogatorio_alterados: string[]
  medicacoes_rotina: string
  exames_complementares: string
  antecedentes_doencas: string
}

interface AnamneseAlimentacaoApiPayload {
  tipo_aleitamento: string
  cardapio_cafe: string
  cardapio_lanche_manha: string
  cardapio_almoco: string
  cardapio_lanche_tarde: string
  cardapio_jantar: string
  cardapio_ceia: string
  local_refeicoes: string
  uso_tela_refeicoes: boolean
}

interface AnamneseHabitosApiPayload {
  sono_horario: string
  sono_local: string
  sono_higiene: string
  sono_alteracoes: string
  telas_dispositivos: string[]
  telas_tempo_diario: string
  telas_frequencia: string
  chupeta_chupa_dedo: string
  higiene_dentaria: string
  atividades_recreativas: string
}

interface AnamneseApiResponse {
  id: number
  consulta_id: number
  clinica: AnamneseClinicaApiPayload
  alimentacao: AnamneseAlimentacaoApiPayload
  habitos: AnamneseHabitosApiPayload
  atualizado_em: string | null
}

export interface DadosImunizacoesConsulta {
  statusVacinal: string
  atualizadoEm: string | null
}

export interface HistoricoImunizacoesItem {
  consultaId: number
  dataConsulta: string
  statusVacinal: string
  atualizadoEm: string | null
}

interface ImunizacoesApiResponse {
  id: number
  consulta_id: number
  status_vacinal: string
  atualizado_em: string | null
}

interface HistoricoImunizacoesApiResponse {
  consulta_id: number
  data_consulta: string
  status_vacinal: string
  atualizado_em: string | null
}

export interface DadosEscolaridadeConsulta {
  frequentaEscolaCreche: boolean | null
  anoSerie: string
  houveReprovacao: boolean | null
  rendimentoRelacionamento: string
  atualizadoEm: string | null
}

interface EscolaridadeApiResponse {
  id: number
  consulta_id: number
  frequenta_escola_creche: boolean | null
  ano_serie: string
  houve_reprovacao: boolean | null
  rendimento_relacionamento: string
  atualizado_em: string | null
}

export type ResultadoTriagemNeonatal = '' | 'normal' | 'alterado' | 'nao-realizado' | 'pendente'

export interface TesteTriagemNeonatal {
  resultado: ResultadoTriagemNeonatal
  data: string
  descricao: string
}

export interface DadosTriagemNeonatalConsulta {
  idadeGestacionalSemanas: number | null
  pesoNascimentoGramas: number | null
  hipotesesDiagnosticasAnteriores: string
  testePezinho: TesteTriagemNeonatal
  testeOrelhinha: TesteTriagemNeonatal
  testeOlhinho: TesteTriagemNeonatal
  testeCoracaozinho: TesteTriagemNeonatal
  atualizadoEm: string | null
}

interface TesteTriagemNeonatalApiPayload {
  resultado: ResultadoTriagemNeonatal
  data: string | null
  descricao: string
}

interface TriagemNeonatalApiResponse {
  id: number
  consulta_id: number
  idade_gestacional_semanas: number | null
  peso_nascimento_gramas: number | null
  hipoteses_diagnosticas_anteriores: string
  teste_pezinho: TesteTriagemNeonatalApiPayload
  teste_orelhinha: TesteTriagemNeonatalApiPayload
  teste_olhinho: TesteTriagemNeonatalApiPayload
  teste_coracaozinho: TesteTriagemNeonatalApiPayload
  atualizado_em: string | null
}

export type PrioridadeEncaminhamento = 'Eletivo' | 'Prioritário' | 'Urgente'

export interface EncaminhamentoConsulta {
  id: number | null
  localId: string
  especialidade: string
  prioridade: PrioridadeEncaminhamento
  procedimentoMotivo: string
  justificativaClinica: string
  atualizadoEm: string | null
}

interface EncaminhamentoApiResponse {
  id: number
  consulta_id: number
  ordem: number
  especialidade: string
  prioridade: PrioridadeEncaminhamento | string
  procedimento_motivo: string
  justificativa_clinica: string
  atualizado_em: string | null
}

export interface DadosHistoriaFamiliarConsulta {
  houveMudanca: boolean | null
  maternalIdade: string
  maternalSaude: string
  maternalOcupacao: string
  paternalIdade: string
  paternalSaude: string
  paternalOcupacao: string
  coabitacaoPais: string
  irmaosSaude: string
  atualizadoEm: string | null
}

interface HistoriaFamiliarApiResponse {
  id: number
  consulta_id: number
  houve_mudanca: boolean | null
  maternal_idade: string
  maternal_saude: string
  maternal_ocupacao: string
  paternal_idade: string
  paternal_saude: string
  paternal_ocupacao: string
  coabitacao_pais: string
  irmaos_saude: string
  atualizado_em: string | null
}


export interface DadosDinamicaFamiliarConsulta {
  houveMudanca: boolean | null
  relacionamentoCompanheiro: string
  resolucaoDesentendimentos: string
  fumanteDomicilio: boolean | null
  usoAlcoolDrogas: boolean | null
  insegurancaAlimentar: boolean | null
  familiarPreso: boolean | null
  preocupacaoComportamento: boolean | null
  disciplinaOpcoes: string[]
  atualizadoEm: string | null
}

interface DinamicaFamiliarApiResponse {
  id: number
  consulta_id: number
  houve_mudanca: boolean | null
  relacionamento_companheiro: string
  resolucao_desentendimentos: string
  fumante_domicilio: boolean | null
  uso_alcool_drogas: boolean | null
  inseguranca_alimentar: boolean | null
  familiar_preso: boolean | null
  preocupacao_comportamento: boolean | null
  disciplina_opcoes: string[]
  atualizado_em: string | null
}

export interface DadosCondicoesSocioeconomicasConsulta {
  rendaFamiliar: string
  rendaNaoInformada: boolean
  tipoCasa: string
  numeroComodos: number | null
  banheiro: string
  quartoCrianca: string
  presencaAnimais: string
  aguaEncanada: boolean | null
  energiaEletrica: boolean | null
  esgoto: string
  coletaLixo: boolean | null
  areaViolencia: boolean | null
  atualizadoEm: string | null
}

interface CondicoesSocioeconomicasApiResponse {
  id: number
  consulta_id: number
  renda_familiar: string
  renda_nao_informada: boolean
  tipo_casa: string
  numero_comodos: number | null
  banheiro: string
  quarto_crianca: string
  presenca_animais: string
  agua_encanada: boolean | null
  energia_eletrica: boolean | null
  esgoto: string
  coleta_lixo: boolean | null
  area_violencia: boolean | null
  atualizado_em: string | null
}


export interface CidSecundarioConsulta {
  localId: string
  codigo: string
  descricao: string
}

export interface DadosDiagnosticoConsulta {
  cid10Principal: string
  cidsSecundarios: CidSecundarioConsulta[]
  sid: string
  atualizadoEm: string | null
}

interface DiagnosticoSecundarioApiPayload {
  codigo: string
  descricao: string
}

interface DiagnosticoApiResponse {
  id: number
  consulta_id: number
  cid10_principal: string
  cids_secundarios: DiagnosticoSecundarioApiPayload[]
  sid: string
  atualizado_em: string | null
}

export interface DadosHipotesesCondutasConsulta {
  hipotesesDiagnosticas: string
  condutasPlanoCuidado: string
  atualizadoEm: string | null
}

interface HipotesesCondutasApiResponse {
  id: number
  consulta_id: number
  hipoteses_diagnosticas: string
  condutas_plano_cuidado: string
  atualizado_em: string | null
}

export interface ProcedimentoConsulta {
  localId: string
  procedimento: string
  quantidade: number | null
  cidVinculado: string
  observacoes: string
}

export interface DadosProcedimentosConsulta {
  realizados: boolean | null
  procedimentos: ProcedimentoConsulta[]
  atualizadoEm: string | null
}

interface ProcedimentoApiPayload {
  procedimento: string
  quantidade: number | null
  cid_vinculado: string
  observacoes: string
}

interface ProcedimentosApiResponse {
  id: number
  consulta_id: number
  realizados: boolean | null
  procedimentos: ProcedimentoApiPayload[]
  atualizado_em: string | null
}

export interface DadoExternoConsulta {
  id: number | null
  localId: string
  dataConsultaExterna: string
  servicoOrigem: string
  pesoKg: number | null
  alturaCm: number | null
  observacoesClinicas: string
  comoDadosObtidos: string
  atualizadoEm: string | null
}

interface DadoExternoApiResponse {
  id: number
  consulta_id: number
  ordem: number
  data_consulta_externa: string | null
  servico_origem: string
  peso: number | null
  altura: number | null
  observacoes_clinicas: string
  como_dados_obtidos: string
  atualizado_em: string | null
}

function criarTesteTriagemNeonatalVazio(): TesteTriagemNeonatal {
  return {
    resultado: '',
    data: '',
    descricao: '',
  }
}

function criarTriagemNeonatalVazia(): DadosTriagemNeonatalConsulta {
  return {
    idadeGestacionalSemanas: null,
    pesoNascimentoGramas: null,
    hipotesesDiagnosticasAnteriores: '',
    testePezinho: criarTesteTriagemNeonatalVazio(),
    testeOrelhinha: criarTesteTriagemNeonatalVazio(),
    testeOlhinho: criarTesteTriagemNeonatalVazio(),
    testeCoracaozinho: criarTesteTriagemNeonatalVazio(),
    atualizadoEm: null,
  }
}

function testeTriagemApiParaStore(apiData: TesteTriagemNeonatalApiPayload): TesteTriagemNeonatal {
  return {
    resultado: apiData.resultado ?? '',
    data: apiData.data ?? '',
    descricao: apiData.descricao ?? '',
  }
}

function triagemNeonatalApiParaStore(apiData: TriagemNeonatalApiResponse): DadosTriagemNeonatalConsulta {
  return {
    idadeGestacionalSemanas: apiData.idade_gestacional_semanas,
    pesoNascimentoGramas: apiData.peso_nascimento_gramas,
    hipotesesDiagnosticasAnteriores: apiData.hipoteses_diagnosticas_anteriores ?? '',
    testePezinho: testeTriagemApiParaStore(apiData.teste_pezinho),
    testeOrelhinha: testeTriagemApiParaStore(apiData.teste_orelhinha),
    testeOlhinho: testeTriagemApiParaStore(apiData.teste_olhinho),
    testeCoracaozinho: testeTriagemApiParaStore(apiData.teste_coracaozinho),
    atualizadoEm: apiData.atualizado_em,
  }
}

function triagemNeonatalStoreParaApi(dados: DadosTriagemNeonatalConsulta) {
  return {
    idade_gestacional_semanas: dados.idadeGestacionalSemanas,
    peso_nascimento_gramas: dados.pesoNascimentoGramas,
    hipoteses_diagnosticas_anteriores: dados.hipotesesDiagnosticasAnteriores,
    teste_pezinho: { ...dados.testePezinho, data: dados.testePezinho.data || null },
    teste_orelhinha: { ...dados.testeOrelhinha, data: dados.testeOrelhinha.data || null },
    teste_olhinho: { ...dados.testeOlhinho, data: dados.testeOlhinho.data || null },
    teste_coracaozinho: { ...dados.testeCoracaozinho, data: dados.testeCoracaozinho.data || null },
  }
}

function clonarTriagemNeonatal(dados: DadosTriagemNeonatalConsulta): DadosTriagemNeonatalConsulta {
  return {
    idadeGestacionalSemanas: dados.idadeGestacionalSemanas,
    pesoNascimentoGramas: dados.pesoNascimentoGramas,
    hipotesesDiagnosticasAnteriores: dados.hipotesesDiagnosticasAnteriores,
    testePezinho: { ...dados.testePezinho },
    testeOrelhinha: { ...dados.testeOrelhinha },
    testeOlhinho: { ...dados.testeOlhinho },
    testeCoracaozinho: { ...dados.testeCoracaozinho },
    atualizadoEm: dados.atualizadoEm,
  }
}

function criarEncaminhamentoVazio(): EncaminhamentoConsulta {
  return {
    id: null,
    localId: `enc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    especialidade: '',
    prioridade: 'Eletivo',
    procedimentoMotivo: '',
    justificativaClinica: '',
    atualizadoEm: null,
  }
}

function encaminhamentoApiParaStore(apiData: EncaminhamentoApiResponse): EncaminhamentoConsulta {
  const prioridade = ['Eletivo', 'Prioritário', 'Urgente'].includes(apiData.prioridade)
    ? apiData.prioridade as PrioridadeEncaminhamento
    : 'Eletivo'

  return {
    id: apiData.id,
    localId: `enc-db-${apiData.id}`,
    especialidade: apiData.especialidade ?? '',
    prioridade,
    procedimentoMotivo: apiData.procedimento_motivo ?? '',
    justificativaClinica: apiData.justificativa_clinica ?? '',
    atualizadoEm: apiData.atualizado_em,
  }
}

function encaminhamentoStoreParaApi(item: EncaminhamentoConsulta) {
  return {
    id: item.id,
    especialidade: item.especialidade,
    prioridade: item.prioridade,
    procedimento_motivo: item.procedimentoMotivo,
    justificativa_clinica: item.justificativaClinica,
  }
}

function clonarEncaminhamentos(dados: EncaminhamentoConsulta[]): EncaminhamentoConsulta[] {
  return dados.map(item => ({ ...item }))
}

function criarHistoriaFamiliarVazia(): DadosHistoriaFamiliarConsulta {
  return {
    houveMudanca: null,
    maternalIdade: '',
    maternalSaude: '',
    maternalOcupacao: '',
    paternalIdade: '',
    paternalSaude: '',
    paternalOcupacao: '',
    coabitacaoPais: '',
    irmaosSaude: '',
    atualizadoEm: null,
  }
}

function historiaFamiliarApiParaStore(apiData: HistoriaFamiliarApiResponse): DadosHistoriaFamiliarConsulta {
  return {
    houveMudanca: apiData.houve_mudanca,
    maternalIdade: apiData.maternal_idade ?? '',
    maternalSaude: apiData.maternal_saude ?? '',
    maternalOcupacao: apiData.maternal_ocupacao ?? '',
    paternalIdade: apiData.paternal_idade ?? '',
    paternalSaude: apiData.paternal_saude ?? '',
    paternalOcupacao: apiData.paternal_ocupacao ?? '',
    coabitacaoPais: apiData.coabitacao_pais ?? '',
    irmaosSaude: apiData.irmaos_saude ?? '',
    atualizadoEm: apiData.atualizado_em,
  }
}

function historiaFamiliarStoreParaApi(dados: DadosHistoriaFamiliarConsulta) {
  return {
    houve_mudanca: dados.houveMudanca,
    maternal_idade: dados.maternalIdade,
    maternal_saude: dados.maternalSaude,
    maternal_ocupacao: dados.maternalOcupacao,
    paternal_idade: dados.paternalIdade,
    paternal_saude: dados.paternalSaude,
    paternal_ocupacao: dados.paternalOcupacao,
    coabitacao_pais: dados.coabitacaoPais,
    irmaos_saude: dados.irmaosSaude,
  }
}

function clonarHistoriaFamiliar(dados: DadosHistoriaFamiliarConsulta): DadosHistoriaFamiliarConsulta {
  return { ...dados }
}


function criarDinamicaFamiliarVazia(): DadosDinamicaFamiliarConsulta {
  return {
    houveMudanca: null,
    relacionamentoCompanheiro: '',
    resolucaoDesentendimentos: '',
    fumanteDomicilio: null,
    usoAlcoolDrogas: null,
    insegurancaAlimentar: null,
    familiarPreso: null,
    preocupacaoComportamento: null,
    disciplinaOpcoes: [],
    atualizadoEm: null,
  }
}

function dinamicaFamiliarApiParaStore(apiData: DinamicaFamiliarApiResponse): DadosDinamicaFamiliarConsulta {
  return {
    houveMudanca: apiData.houve_mudanca,
    relacionamentoCompanheiro: apiData.relacionamento_companheiro ?? '',
    resolucaoDesentendimentos: apiData.resolucao_desentendimentos ?? '',
    fumanteDomicilio: apiData.fumante_domicilio,
    usoAlcoolDrogas: apiData.uso_alcool_drogas,
    insegurancaAlimentar: apiData.inseguranca_alimentar,
    familiarPreso: apiData.familiar_preso,
    preocupacaoComportamento: apiData.preocupacao_comportamento,
    disciplinaOpcoes: [...(apiData.disciplina_opcoes ?? [])],
    atualizadoEm: apiData.atualizado_em,
  }
}

function dinamicaFamiliarStoreParaApi(dados: DadosDinamicaFamiliarConsulta) {
  return {
    houve_mudanca: dados.houveMudanca,
    relacionamento_companheiro: dados.relacionamentoCompanheiro,
    resolucao_desentendimentos: dados.resolucaoDesentendimentos,
    fumante_domicilio: dados.fumanteDomicilio,
    uso_alcool_drogas: dados.usoAlcoolDrogas,
    inseguranca_alimentar: dados.insegurancaAlimentar,
    familiar_preso: dados.familiarPreso,
    preocupacao_comportamento: dados.preocupacaoComportamento,
    disciplina_opcoes: [...dados.disciplinaOpcoes],
  }
}

function clonarDinamicaFamiliar(dados: DadosDinamicaFamiliarConsulta): DadosDinamicaFamiliarConsulta {
  return {
    ...dados,
    disciplinaOpcoes: [...dados.disciplinaOpcoes],
  }
}

function criarCondicoesSocioeconomicasVazia(): DadosCondicoesSocioeconomicasConsulta {
  return {
    rendaFamiliar: '',
    rendaNaoInformada: false,
    tipoCasa: '',
    numeroComodos: null,
    banheiro: '',
    quartoCrianca: '',
    presencaAnimais: '',
    aguaEncanada: null,
    energiaEletrica: null,
    esgoto: '',
    coletaLixo: null,
    areaViolencia: null,
    atualizadoEm: null,
  }
}

function condicoesSocioeconomicasApiParaStore(apiData: CondicoesSocioeconomicasApiResponse): DadosCondicoesSocioeconomicasConsulta {
  return {
    rendaFamiliar: apiData.renda_familiar ?? '',
    rendaNaoInformada: Boolean(apiData.renda_nao_informada),
    tipoCasa: apiData.tipo_casa ?? '',
    numeroComodos: apiData.numero_comodos,
    banheiro: apiData.banheiro ?? '',
    quartoCrianca: apiData.quarto_crianca ?? '',
    presencaAnimais: apiData.presenca_animais ?? '',
    aguaEncanada: apiData.agua_encanada,
    energiaEletrica: apiData.energia_eletrica,
    esgoto: apiData.esgoto ?? '',
    coletaLixo: apiData.coleta_lixo,
    areaViolencia: apiData.area_violencia,
    atualizadoEm: apiData.atualizado_em,
  }
}

function condicoesSocioeconomicasStoreParaApi(dados: DadosCondicoesSocioeconomicasConsulta) {
  return {
    renda_familiar: dados.rendaFamiliar,
    renda_nao_informada: dados.rendaNaoInformada,
    tipo_casa: dados.tipoCasa,
    numero_comodos: dados.numeroComodos,
    banheiro: dados.banheiro,
    quarto_crianca: dados.quartoCrianca,
    presenca_animais: dados.presencaAnimais,
    agua_encanada: dados.aguaEncanada,
    energia_eletrica: dados.energiaEletrica,
    esgoto: dados.esgoto,
    coleta_lixo: dados.coletaLixo,
    area_violencia: dados.areaViolencia,
  }
}

function clonarCondicoesSocioeconomicas(dados: DadosCondicoesSocioeconomicasConsulta): DadosCondicoesSocioeconomicasConsulta {
  return { ...dados }
}


function criarCidSecundarioVazio(): CidSecundarioConsulta {
  return {
    localId: `cid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    codigo: '',
    descricao: '',
  }
}

function criarDiagnosticoVazio(): DadosDiagnosticoConsulta {
  return {
    cid10Principal: '',
    cidsSecundarios: [],
    sid: '',
    atualizadoEm: null,
  }
}

function diagnosticoApiParaStore(apiData: DiagnosticoApiResponse): DadosDiagnosticoConsulta {
  return {
    cid10Principal: apiData.cid10_principal ?? '',
    cidsSecundarios: (apiData.cids_secundarios ?? []).map((item, index) => ({
      localId: `cid-db-${index}-${item.codigo || 'sem-codigo'}`,
      codigo: item.codigo ?? '',
      descricao: item.descricao ?? '',
    })),
    sid: apiData.sid ?? '',
    atualizadoEm: apiData.atualizado_em,
  }
}

function diagnosticoStoreParaApi(dados: DadosDiagnosticoConsulta) {
  return {
    cid10_principal: dados.cid10Principal,
    cids_secundarios: dados.cidsSecundarios
      .filter(item => item.codigo.trim() || item.descricao.trim())
      .map(item => ({
        codigo: item.codigo,
        descricao: item.descricao,
      })),
    sid: dados.sid,
  }
}

function clonarDiagnostico(dados: DadosDiagnosticoConsulta): DadosDiagnosticoConsulta {
  return {
    cid10Principal: dados.cid10Principal,
    cidsSecundarios: dados.cidsSecundarios.map(item => ({ ...item })),
    sid: dados.sid,
    atualizadoEm: dados.atualizadoEm,
  }
}

function criarHipotesesCondutasVazia(): DadosHipotesesCondutasConsulta {
  return {
    hipotesesDiagnosticas: '',
    condutasPlanoCuidado: '',
    atualizadoEm: null,
  }
}

function hipotesesCondutasApiParaStore(apiData: HipotesesCondutasApiResponse): DadosHipotesesCondutasConsulta {
  return {
    hipotesesDiagnosticas: apiData.hipoteses_diagnosticas ?? '',
    condutasPlanoCuidado: apiData.condutas_plano_cuidado ?? '',
    atualizadoEm: apiData.atualizado_em,
  }
}

function hipotesesCondutasStoreParaApi(dados: DadosHipotesesCondutasConsulta) {
  return {
    hipoteses_diagnosticas: dados.hipotesesDiagnosticas,
    condutas_plano_cuidado: dados.condutasPlanoCuidado,
  }
}

function clonarHipotesesCondutas(dados: DadosHipotesesCondutasConsulta): DadosHipotesesCondutasConsulta {
  return { ...dados }
}

function criarProcedimentoVazio(): ProcedimentoConsulta {
  return {
    localId: `proc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    procedimento: '',
    quantidade: 1,
    cidVinculado: '',
    observacoes: '',
  }
}

function criarProcedimentosVazio(): DadosProcedimentosConsulta {
  return {
    realizados: null,
    procedimentos: [],
    atualizadoEm: null,
  }
}

function procedimentoApiParaStore(apiData: ProcedimentoApiPayload): ProcedimentoConsulta {
  return {
    localId: `proc-api-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    procedimento: apiData.procedimento ?? '',
    quantidade: apiData.quantidade,
    cidVinculado: apiData.cid_vinculado ?? '',
    observacoes: apiData.observacoes ?? '',
  }
}

function procedimentosApiParaStore(apiData: ProcedimentosApiResponse): DadosProcedimentosConsulta {
  return {
    realizados: apiData.realizados,
    procedimentos: (apiData.procedimentos ?? []).map(procedimentoApiParaStore),
    atualizadoEm: apiData.atualizado_em,
  }
}

function procedimentosStoreParaApi(dados: DadosProcedimentosConsulta) {
  return {
    realizados: dados.realizados,
    procedimentos: dados.procedimentos.map(item => ({
      procedimento: item.procedimento,
      quantidade: item.quantidade,
      cid_vinculado: item.cidVinculado,
      observacoes: item.observacoes,
    })),
  }
}

function clonarProcedimentos(dados: DadosProcedimentosConsulta): DadosProcedimentosConsulta {
  return {
    realizados: dados.realizados,
    procedimentos: dados.procedimentos.map(item => ({ ...item })),
    atualizadoEm: dados.atualizadoEm,
  }
}


function criarDadoExternoVazio(): DadoExternoConsulta {
  return {
    id: null,
    localId: `externo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    dataConsultaExterna: '',
    servicoOrigem: '',
    pesoKg: null,
    alturaCm: null,
    observacoesClinicas: '',
    comoDadosObtidos: '',
    atualizadoEm: null,
  }
}

function dadoExternoApiParaStore(apiData: DadoExternoApiResponse): DadoExternoConsulta {
  return {
    id: apiData.id,
    localId: `externo-api-${apiData.id}`,
    dataConsultaExterna: apiData.data_consulta_externa ?? '',
    servicoOrigem: apiData.servico_origem ?? '',
    pesoKg: apiData.peso,
    alturaCm: apiData.altura,
    observacoesClinicas: apiData.observacoes_clinicas ?? '',
    comoDadosObtidos: apiData.como_dados_obtidos ?? '',
    atualizadoEm: apiData.atualizado_em,
  }
}

function dadoExternoStoreParaApi(item: DadoExternoConsulta) {
  return {
    id: item.id,
    data_consulta_externa: item.dataConsultaExterna || null,
    servico_origem: item.servicoOrigem,
    peso: item.pesoKg,
    altura: item.alturaCm,
    observacoes_clinicas: item.observacoesClinicas,
    como_dados_obtidos: item.comoDadosObtidos,
  }
}

function clonarDadosExternos(dados: DadoExternoConsulta[]): DadoExternoConsulta[] {
  return dados.map(item => ({ ...item }))
}

function criarEscolaridadeVazia(): DadosEscolaridadeConsulta {
  return {
    frequentaEscolaCreche: null,
    anoSerie: '',
    houveReprovacao: null,
    rendimentoRelacionamento: '',
    atualizadoEm: null,
  }
}

function escolaridadeApiParaStore(apiData: EscolaridadeApiResponse): DadosEscolaridadeConsulta {
  return {
    frequentaEscolaCreche: apiData.frequenta_escola_creche,
    anoSerie: apiData.ano_serie ?? '',
    houveReprovacao: apiData.houve_reprovacao,
    rendimentoRelacionamento: apiData.rendimento_relacionamento ?? '',
    atualizadoEm: apiData.atualizado_em,
  }
}

function escolaridadeStoreParaApi(dados: DadosEscolaridadeConsulta) {
  return {
    frequenta_escola_creche: dados.frequentaEscolaCreche,
    ano_serie: dados.anoSerie,
    houve_reprovacao: dados.houveReprovacao,
    rendimento_relacionamento: dados.rendimentoRelacionamento,
  }
}

function clonarEscolaridade(dados: DadosEscolaridadeConsulta): DadosEscolaridadeConsulta {
  return { ...dados }
}

function criarImunizacoesVazia(): DadosImunizacoesConsulta {
  return {
    statusVacinal: '',
    atualizadoEm: null,
  }
}

function imunizacoesApiParaStore(apiData: ImunizacoesApiResponse): DadosImunizacoesConsulta {
  return {
    statusVacinal: apiData.status_vacinal ?? '',
    atualizadoEm: apiData.atualizado_em,
  }
}

function historicoImunizacoesApiParaStore(apiData: HistoricoImunizacoesApiResponse): HistoricoImunizacoesItem {
  return {
    consultaId: apiData.consulta_id,
    dataConsulta: apiData.data_consulta,
    statusVacinal: apiData.status_vacinal ?? '',
    atualizadoEm: apiData.atualizado_em,
  }
}

function criarAnamneseVazia(): DadosAnamneseConsulta {
  return {
    clinica: {
      queixaPrincipal: '',
      historiaDoencaAtual: '',
      interrogatorioGeral: '',
      interrogatorioPeleMucosas: '',
      interrogatorioOlhos: '',
      interrogatorioOuvidos: '',
      interrogatorioBoca: '',
      interrogatorioRespiratorio: '',
      interrogatorioCardiovascular: '',
      interrogatorioGastrointestinal: '',
      interrogatorioGeniturinario: '',
      interrogatorioMusculoEsqueletico: '',
      interrogatorioSistemaNervoso: '',
      sistemasInterrogatorioAlterados: [],
      medicacoesRotina: '',
      examesComplementares: '',
      antecedentesDoencas: '',
    },
    alimentacao: {
      tipoAleitamento: '',
      cardapioCafe: '',
      cardapioLancheManha: '',
      cardapioAlmoco: '',
      cardapioLancheTarde: '',
      cardapioJantar: '',
      cardapioCeia: '',
      localRefeicoes: '',
      usoTelaRefeicoes: false,
    },
    habitos: {
      sonoHorario: '',
      sonoLocal: '',
      sonoHigiene: '',
      sonoAlteracoes: '',
      telasDispositivos: [],
      telasTempoDiario: '',
      telasFrequencia: '',
      chupetaChupaDedo: '',
      higieneDentaria: '',
      atividadesRecreativas: '',
    },
    atualizadoEm: null,
  }
}


function clonarAnamnese(dados: DadosAnamneseConsulta): DadosAnamneseConsulta {
  return {
    clinica: {
      ...dados.clinica,
      sistemasInterrogatorioAlterados: [...dados.clinica.sistemasInterrogatorioAlterados],
    },
    alimentacao: { ...dados.alimentacao },
    habitos: {
      ...dados.habitos,
      telasDispositivos: [...dados.habitos.telasDispositivos],
    },
    atualizadoEm: dados.atualizadoEm,
  }
}

function valorPossuiConteudo(valor: unknown): boolean {
  if (typeof valor === 'string') return valor.trim().length > 0
  if (typeof valor === 'boolean') return valor
  if (Array.isArray(valor)) return valor.length > 0
  if (valor && typeof valor === 'object') return Object.values(valor).some(valorPossuiConteudo)
  return false
}

function possuiConteudoAnamnese(dados: DadosAnamneseConsulta | DadosAnamnesePayload): boolean {
  return [dados.clinica, dados.alimentacao, dados.habitos].some(valorPossuiConteudo)
}


interface AntropometriaApiResponse {
  id: number
  consulta_id: number
  peso_kg: number | null
  altura_cm: number | null
  perimetro_cefalico_cm: number | null
  pressao_sistolica_mmhg: number | null
  pressao_diastolica_mmhg: number | null
  imc: number | null
  classificacao_imc: ClassificacaoImc | null
  atualizado_em: string | null
}

interface ConsultaAtivaApiResponse {
  id: number
  paciente_id: string
  medico_username: string
  data: string
  status: string
  completed_sections: string[]
  started_sections?: string[]
  antropometria: AntropometriaApiResponse | null
  anamnese?: AnamneseApiResponse | null
  imunizacoes?: ImunizacoesApiResponse | null
  escolaridade?: EscolaridadeApiResponse | null
  triagem_neonatal?: TriagemNeonatalApiResponse | null
  encaminhamentos?: EncaminhamentoApiResponse[]
  historia_familiar?: HistoriaFamiliarApiResponse | null
  dinamica_familiar?: DinamicaFamiliarApiResponse | null
  condicoes_socioeconomicas?: CondicoesSocioeconomicasApiResponse | null
  diagnostico?: DiagnosticoApiResponse | null
  hipoteses_condutas?: HipotesesCondutasApiResponse | null
  procedimentos?: ProcedimentosApiResponse | null
  dados_externos?: DadoExternoApiResponse[]
  imunizacoes_historico?: HistoricoImunizacoesApiResponse[]
}

interface ConsultaFinalizarApiResponse {
  id: number
  paciente_id: string
  medico_username: string
  data: string
  status: string
  completed_sections: string[]
  started_sections: string[]
  finalizada_em: string | null
}

export interface DadosAntropometricosConsulta {
  pesoKg: number | null
  alturaCm: number | null
  perimetroCefalicoCm: number | null
  pressaoSistolicaMmHg: number | null
  pressaoDiastolicaMmHg: number | null
  imc: number | null
  classificacaoImc: ClassificacaoImc | null
  atualizadoEm: string | null
}

function criarAntropometriaVazia(): DadosAntropometricosConsulta {
  return {
    pesoKg: null,
    alturaCm: null,
    perimetroCefalicoCm: null,
    pressaoSistolicaMmHg: null,
    pressaoDiastolicaMmHg: null,
    imc: null,
    classificacaoImc: null,
    atualizadoEm: null,
  }
}

function dataBackendParaDate(data: string): Date {
  return new Date(data.endsWith('Z') || data.includes('+') ? data : `${data}Z`)
}

function anamneseApiParaStore(apiData: AnamneseApiResponse): DadosAnamneseConsulta {
  return {
    clinica: {
      queixaPrincipal: apiData.clinica.queixa_principal ?? '',
      historiaDoencaAtual: apiData.clinica.historia_doenca_atual ?? '',
      interrogatorioGeral: apiData.clinica.interrogatorio_geral ?? '',
      interrogatorioPeleMucosas: apiData.clinica.interrogatorio_pele_mucosas ?? '',
      interrogatorioOlhos: apiData.clinica.interrogatorio_olhos ?? '',
      interrogatorioOuvidos: apiData.clinica.interrogatorio_ouvidos ?? '',
      interrogatorioBoca: apiData.clinica.interrogatorio_boca ?? '',
      interrogatorioRespiratorio: apiData.clinica.interrogatorio_respiratorio ?? '',
      interrogatorioCardiovascular: apiData.clinica.interrogatorio_cardiovascular ?? '',
      interrogatorioGastrointestinal: apiData.clinica.interrogatorio_gastrointestinal ?? '',
      interrogatorioGeniturinario: apiData.clinica.interrogatorio_geniturinario ?? '',
      interrogatorioMusculoEsqueletico: apiData.clinica.interrogatorio_musculo_esqueletico ?? '',
      interrogatorioSistemaNervoso: apiData.clinica.interrogatorio_sistema_nervoso ?? '',
      sistemasInterrogatorioAlterados: [...(apiData.clinica.sistemas_interrogatorio_alterados ?? [])],
      medicacoesRotina: apiData.clinica.medicacoes_rotina ?? '',
      examesComplementares: apiData.clinica.exames_complementares ?? '',
      antecedentesDoencas: apiData.clinica.antecedentes_doencas ?? '',
    },
    alimentacao: {
      tipoAleitamento: apiData.alimentacao.tipo_aleitamento ?? '',
      cardapioCafe: apiData.alimentacao.cardapio_cafe ?? '',
      cardapioLancheManha: apiData.alimentacao.cardapio_lanche_manha ?? '',
      cardapioAlmoco: apiData.alimentacao.cardapio_almoco ?? '',
      cardapioLancheTarde: apiData.alimentacao.cardapio_lanche_tarde ?? '',
      cardapioJantar: apiData.alimentacao.cardapio_jantar ?? '',
      cardapioCeia: apiData.alimentacao.cardapio_ceia ?? '',
      localRefeicoes: apiData.alimentacao.local_refeicoes ?? '',
      usoTelaRefeicoes: Boolean(apiData.alimentacao.uso_tela_refeicoes),
    },
    habitos: {
      sonoHorario: apiData.habitos.sono_horario ?? '',
      sonoLocal: apiData.habitos.sono_local ?? '',
      sonoHigiene: apiData.habitos.sono_higiene ?? '',
      sonoAlteracoes: apiData.habitos.sono_alteracoes ?? '',
      telasDispositivos: [...(apiData.habitos.telas_dispositivos ?? [])],
      telasTempoDiario: apiData.habitos.telas_tempo_diario ?? '',
      telasFrequencia: apiData.habitos.telas_frequencia ?? '',
      chupetaChupaDedo: apiData.habitos.chupeta_chupa_dedo ?? '',
      higieneDentaria: apiData.habitos.higiene_dentaria ?? '',
      atividadesRecreativas: apiData.habitos.atividades_recreativas ?? '',
    },
    atualizadoEm: apiData.atualizado_em,
  }
}

function anamneseStoreParaApi(dados: DadosAnamneseConsulta | DadosAnamnesePayload) {
  return {
    clinica: {
      queixa_principal: dados.clinica.queixaPrincipal,
      historia_doenca_atual: dados.clinica.historiaDoencaAtual,
      interrogatorio_geral: dados.clinica.interrogatorioGeral,
      interrogatorio_pele_mucosas: dados.clinica.interrogatorioPeleMucosas,
      interrogatorio_olhos: dados.clinica.interrogatorioOlhos,
      interrogatorio_ouvidos: dados.clinica.interrogatorioOuvidos,
      interrogatorio_boca: dados.clinica.interrogatorioBoca,
      interrogatorio_respiratorio: dados.clinica.interrogatorioRespiratorio,
      interrogatorio_cardiovascular: dados.clinica.interrogatorioCardiovascular,
      interrogatorio_gastrointestinal: dados.clinica.interrogatorioGastrointestinal,
      interrogatorio_geniturinario: dados.clinica.interrogatorioGeniturinario,
      interrogatorio_musculo_esqueletico: dados.clinica.interrogatorioMusculoEsqueletico,
      interrogatorio_sistema_nervoso: dados.clinica.interrogatorioSistemaNervoso,
      sistemas_interrogatorio_alterados: [...dados.clinica.sistemasInterrogatorioAlterados],
      medicacoes_rotina: dados.clinica.medicacoesRotina,
      exames_complementares: dados.clinica.examesComplementares,
      antecedentes_doencas: dados.clinica.antecedentesDoencas,
    },
    alimentacao: {
      tipo_aleitamento: dados.alimentacao.tipoAleitamento,
      cardapio_cafe: dados.alimentacao.cardapioCafe,
      cardapio_lanche_manha: dados.alimentacao.cardapioLancheManha,
      cardapio_almoco: dados.alimentacao.cardapioAlmoco,
      cardapio_lanche_tarde: dados.alimentacao.cardapioLancheTarde,
      cardapio_jantar: dados.alimentacao.cardapioJantar,
      cardapio_ceia: dados.alimentacao.cardapioCeia,
      local_refeicoes: dados.alimentacao.localRefeicoes,
      uso_tela_refeicoes: dados.alimentacao.usoTelaRefeicoes,
    },
    habitos: {
      sono_horario: dados.habitos.sonoHorario,
      sono_local: dados.habitos.sonoLocal,
      sono_higiene: dados.habitos.sonoHigiene,
      sono_alteracoes: dados.habitos.sonoAlteracoes,
      telas_dispositivos: [...dados.habitos.telasDispositivos],
      telas_tempo_diario: dados.habitos.telasTempoDiario,
      telas_frequencia: dados.habitos.telasFrequencia,
      chupeta_chupa_dedo: dados.habitos.chupetaChupaDedo,
      higiene_dentaria: dados.habitos.higieneDentaria,
      atividades_recreativas: dados.habitos.atividadesRecreativas,
    },
  }
}


export const useConsultaStore = defineStore('consulta', () => {
  const pacienteStore = usePacienteStore()

  // Navegação entre seções
  const activeSection = ref<SecaoId>('anthropometric')
  const completedSections = ref(new Set<SecaoId>())
  const startedSections = ref(new Set<SecaoId>())
  const consultaIniciada = ref<Date | null>(null)
  const consultaAtivaId = ref<number | null>(null)
  const currentPacienteId = ref<string | null>(null)
  const salvandoAntropometria = ref(false)
  const erroSalvamentoAntropometria = ref<string | null>(null)
  const salvandoAnamnese = ref(false)
  const erroSalvamentoAnamnese = ref<string | null>(null)
  const salvandoImunizacoes = ref(false)
  const erroSalvamentoImunizacoes = ref<string | null>(null)
  const salvandoEscolaridade = ref(false)
  const erroSalvamentoEscolaridade = ref<string | null>(null)
  const salvandoTriagemNeonatal = ref(false)
  const erroSalvamentoTriagemNeonatal = ref<string | null>(null)
  const salvandoEncaminhamentos = ref(false)
  const erroSalvamentoEncaminhamentos = ref<string | null>(null)
  const salvandoHistoriaFamiliar = ref(false)
  const erroSalvamentoHistoriaFamiliar = ref<string | null>(null)
  const salvandoDinamicaFamiliar = ref(false)
  const erroSalvamentoDinamicaFamiliar = ref<string | null>(null)
  const salvandoCondicoesSocioeconomicas = ref(false)
  const erroSalvamentoCondicoesSocioeconomicas = ref<string | null>(null)
  const salvandoDiagnostico = ref(false)
  const erroSalvamentoDiagnostico = ref<string | null>(null)
  const salvandoHipotesesCondutas = ref(false)
  const erroSalvamentoHipotesesCondutas = ref<string | null>(null)
  const salvandoProcedimentos = ref(false)
  const erroSalvamentoProcedimentos = ref<string | null>(null)
  const salvandoDadosExternos = ref(false)
  const erroSalvamentoDadosExternos = ref<string | null>(null)
  const finalizandoConsulta = ref(false)
  const erroFinalizarConsulta = ref<string | null>(null)
  const antropometria = ref<DadosAntropometricosConsulta>(criarAntropometriaVazia())
  const anamnese = ref<DadosAnamneseConsulta>(criarAnamneseVazia())
  const imunizacoes = ref<DadosImunizacoesConsulta>(criarImunizacoesVazia())
  const escolaridade = ref<DadosEscolaridadeConsulta>(criarEscolaridadeVazia())
  const triagemNeonatal = ref<DadosTriagemNeonatalConsulta>(criarTriagemNeonatalVazia())
  const encaminhamentos = ref<EncaminhamentoConsulta[]>([])
  const historiaFamiliar = ref<DadosHistoriaFamiliarConsulta>(criarHistoriaFamiliarVazia())
  const dinamicaFamiliar = ref<DadosDinamicaFamiliarConsulta>(criarDinamicaFamiliarVazia())
  const condicoesSocioeconomicas = ref<DadosCondicoesSocioeconomicasConsulta>(criarCondicoesSocioeconomicasVazia())
  const diagnostico = ref<DadosDiagnosticoConsulta>(criarDiagnosticoVazio())
  const hipotesesCondutas = ref<DadosHipotesesCondutasConsulta>(criarHipotesesCondutasVazia())
  const procedimentos = ref<DadosProcedimentosConsulta>(criarProcedimentosVazio())
  const dadosExternos = ref<DadoExternoConsulta[]>([])
  const historicoImunizacoes = ref<HistoricoImunizacoesItem[]>([])

  const idadeEmMeses = computed(() => pacienteStore.pacienteAtivo?.idadeEmMeses ?? 0)
  const is0to2 = computed(() => idadeEmMeses.value <= 24)
  const is3to9 = computed(() => idadeEmMeses.value >= 36 && idadeEmMeses.value <= 108)
  const showMchat = computed(() => idadeEmMeses.value >= 16 && idadeEmMeses.value <= 30)

  const secoes = computed((): Secao[] => {
    const base: Secao[] = [
      { id: 'anthropometric', label: 'Antropometria', group: 'formulario' },
      { id: 'anamnesis', label: 'Anamnese', group: 'formulario' },
      { id: 'imunizacoes', label: 'Imunizações', group: 'formulario' },
    ]

    if (is0to2.value) {
      base.push({ id: 'triagemNeonatal', label: 'Triagem Neonatal', group: 'formulario' })
    }
    if (is3to9.value) {
      base.push({ id: 'escolaridade', label: 'Escolaridade', group: 'formulario' })
    }

    base.push(
      { id: 'clinical', label: 'Exame Físico', group: 'formulario' },
      { id: 'milestones', label: 'Marcos do Desenvolvimento', group: 'formulario' },
    )

    if (showMchat.value) {
      base.push({ id: 'mchat', label: 'M-CHAT-R', group: 'formulario' })
    }
    base.push({ id: 'historiaFamiliar', label: 'História Familiar', group: 'formulario' })

    base.push({ id: 'dinamicaFamiliar', label: 'Dinâmica Familiar', group: 'formulario' })

    if (is3to9.value) {
      base.push({ id: 'socioeconomico', label: 'Condições Socioeconômicas', group: 'formulario' })
    }

    base.push(
      { id: 'referral', label: 'Encaminhamentos', group: 'formulario' },
      { id: 'diagnostico', label: 'Diagnóstico', group: 'registro' },
      { id: 'condutasHipoteses', label: 'Hipóteses e Condutas', group: 'registro' },
      { id: 'procedimentos', label: 'Procedimentos', group: 'registro' },
      { id: 'externo', label: 'Dados Externos', group: 'registro' },
    )

    return base
  })

  const currentIndex = computed(() => secoes.value.findIndex(s => s.id === activeSection.value))
  const canGoPrev = computed(() => currentIndex.value > 0)
  const canGoNext = computed(() => currentIndex.value < secoes.value.length - 1)

  // Marcos do desenvolvimento — chave composta: `${marcoId}-${idadeColuna}`
  const statusMarcos = ref<Record<string, StatusMarco | null>>({})
  const observacoesMarcos = ref<Record<string, string>>({})
  const classificacaoDesenvolvimento = ref<ClassificacaoDesenvolvimento | null>(null)

  type SistemaStatusSelection = SistemaStatus | ''
  type ExameFisicoForm = {
    [K in keyof ExameFisico]: { status: SistemaStatusSelection; descricao: string }
  }
  function criarSistemaVazio(): { status: SistemaStatusSelection; descricao: string } {
    return { status: '', descricao: '' }
  }
  const exameFisico = ref<ExameFisicoForm>({
    geral: criarSistemaVazio(),
    pele: criarSistemaVazio(),
    cabecaPescoco: criarSistemaVazio(),
    olhos: criarSistemaVazio(),
    ouvidos: criarSistemaVazio(),
    nariz: criarSistemaVazio(),
    bocaGarganta: criarSistemaVazio(),
    cardiovascular: criarSistemaVazio(),
    respiratorio: criarSistemaVazio(),
    abdome: criarSistemaVazio(),
    genitourinario: criarSistemaVazio(),
    extremidades: criarSistemaVazio(),
    neurologico: criarSistemaVazio(),
    musculoesqueletico: criarSistemaVazio(),
  })
  const avaliadosCount = computed(
    () => Object.values(exameFisico.value).filter(s => s.status !== '').length
  )
  const allStatusesSelected = computed(
    () => Object.values(exameFisico.value).every(s => s.status !== '')
  )
  function updateSistemaStatus(id: keyof ExameFisico, status: SistemaStatusSelection) {
    exameFisico.value[id].status = status
  }
  function updateSistemaDescricao(id: keyof ExameFisico, descricao: string) {
    exameFisico.value[id].descricao = descricao
  }

  const totalMarcosRegistrados = computed(
    () => Object.values(statusMarcos.value).filter(v => v !== null).length
  )

  function toggleStatusMarco(marcoId: string, idadeColuna: number, status: StatusMarco) {
    const key = `${marcoId}-${idadeColuna}`
    const atual = statusMarcos.value[key]
    statusMarcos.value = {
      ...statusMarcos.value,
      [key]: atual === status ? null : status,
    }
  }

  function getStatusMarco(marcoId: string, idadeColuna: number): StatusMarco | null {
    return statusMarcos.value[`${marcoId}-${idadeColuna}`] ?? null
  }

  function setObservacaoMarco(marcoId: string, obs: string) {
    observacoesMarcos.value = { ...observacoesMarcos.value, [marcoId]: obs }
  }

  function getObservacaoMarco(marcoId: string): string {
    return observacoesMarcos.value[marcoId] ?? ''
  }

  function setClassificacao(classificacao: ClassificacaoDesenvolvimento | null) {
    classificacaoDesenvolvimento.value = classificacao
  }

  // Exame físico
  const SISTEMAS_KEYS = [
    'geral', 'pele', 'cabecaPescoco', 'olhos', 'ouvidos', 'nariz', 'bocaGarganta',
    'cardiovascular', 'respiratorio', 'abdome', 'genitourinario', 'extremidades',
    'neurologico', 'musculoesqueletico',
  ] as const

  function criarExameFisicoVazio(): ExameFisico {
    const vazio = { status: 'nao-avaliado' as SistemaStatus, descricao: '' }
    return {
      geral: { ...vazio }, pele: { ...vazio }, cabecaPescoco: { ...vazio },
      olhos: { ...vazio }, ouvidos: { ...vazio }, nariz: { ...vazio },
      bocaGarganta: { ...vazio }, cardiovascular: { ...vazio }, respiratorio: { ...vazio },
      abdome: { ...vazio }, genitourinario: { ...vazio }, extremidades: { ...vazio },
      neurologico: { ...vazio }, musculoesqueletico: { ...vazio },
    }
  }

  const exameFisico = ref<ExameFisico>(criarExameFisicoVazio())

  const avaliadosCount = computed(
    () => SISTEMAS_KEYS.filter(k => exameFisico.value[k].status !== 'nao-avaliado').length
  )

  const allStatusesSelected = computed(
    () => SISTEMAS_KEYS.every(k => exameFisico.value[k].status !== 'nao-avaliado')
  )

  function updateSistemaStatus(id: keyof ExameFisico, status: SistemaStatus | '') {
    exameFisico.value = {
      ...exameFisico.value,
      [id]: { ...exameFisico.value[id], status: status || 'nao-avaliado' },
    }
  }

  function updateSistemaDescricao(id: keyof ExameFisico, descricao: string) {
    exameFisico.value = {
      ...exameFisico.value,
      [id]: { ...exameFisico.value[id], descricao },
    }
  }

  function limparDadosDaConsultaAtual() {
    consultaAtivaId.value = null
    completedSections.value = new Set()
    startedSections.value = new Set()
    salvandoAntropometria.value = false
    erroSalvamentoAntropometria.value = null
    salvandoAnamnese.value = false
    erroSalvamentoAnamnese.value = null
    salvandoImunizacoes.value = false
    erroSalvamentoImunizacoes.value = null
    salvandoEscolaridade.value = false
    erroSalvamentoEscolaridade.value = null
    salvandoTriagemNeonatal.value = false
    erroSalvamentoTriagemNeonatal.value = null
    salvandoEncaminhamentos.value = false
    erroSalvamentoEncaminhamentos.value = null
    salvandoHistoriaFamiliar.value = false
    erroSalvamentoHistoriaFamiliar.value = null
    salvandoDinamicaFamiliar.value = false
    erroSalvamentoDinamicaFamiliar.value = null
    salvandoCondicoesSocioeconomicas.value = false
    erroSalvamentoCondicoesSocioeconomicas.value = null
    salvandoDiagnostico.value = false
    erroSalvamentoDiagnostico.value = null
    salvandoHipotesesCondutas.value = false
    erroSalvamentoHipotesesCondutas.value = null
    salvandoProcedimentos.value = false
    erroSalvamentoProcedimentos.value = null
    salvandoDadosExternos.value = false
    erroSalvamentoDadosExternos.value = null
    finalizandoConsulta.value = false
    erroFinalizarConsulta.value = null
    statusMarcos.value = {}
    observacoesMarcos.value = {}
    classificacaoDesenvolvimento.value = null
    antropometria.value = criarAntropometriaVazia()
    anamnese.value = criarAnamneseVazia()
    imunizacoes.value = criarImunizacoesVazia()
    escolaridade.value = criarEscolaridadeVazia()
    triagemNeonatal.value = criarTriagemNeonatalVazia()
    encaminhamentos.value = []
    historiaFamiliar.value = criarHistoriaFamiliarVazia()
    dinamicaFamiliar.value = criarDinamicaFamiliarVazia()
    condicoesSocioeconomicas.value = criarCondicoesSocioeconomicasVazia()
    diagnostico.value = criarDiagnosticoVazio()
    hipotesesCondutas.value = criarHipotesesCondutasVazia()
    procedimentos.value = criarProcedimentosVazio()
    dadosExternos.value = []
    historicoImunizacoes.value = []
  }

  // Funções de navegação
  function iniciarConsulta(pacienteId?: string) {
    currentPacienteId.value = pacienteId ?? pacienteStore.pacienteAtivo?.id ?? null
    consultaIniciada.value = new Date()
    activeSection.value = 'anthropometric'
    limparDadosDaConsultaAtual()
  }

  function prepararConsultaPaciente(pacienteId: string) {
    if (currentPacienteId.value !== pacienteId) {
      currentPacienteId.value = pacienteId
      consultaIniciada.value = new Date()
      activeSection.value = 'anthropometric'
      limparDadosDaConsultaAtual()
      return
    }

    if (!consultaIniciada.value) {
      consultaIniciada.value = new Date()
    }
  }

  function setActiveSection(id: SecaoId) {
    activeSection.value = id
  }

  function markSectionStarted(id: SecaoId) {
    startedSections.value = new Set([...startedSections.value, id])
  }

  function markSectionComplete(id: SecaoId) {
    completedSections.value = new Set([...completedSections.value, id])
    markSectionStarted(id)
  }

  function setSectionComplete(id: SecaoId, completo: boolean) {
    const secoes = new Set(completedSections.value)
    if (completo) {
      secoes.add(id)
      markSectionStarted(id)
    } else {
      secoes.delete(id)
    }
    completedSections.value = secoes
  }

  function aplicarConsultaAtiva(response: ConsultaAtivaApiResponse | null, pacienteIdFallback?: string) {
    if (!response) {
      consultaAtivaId.value = null
      completedSections.value = new Set()
      startedSections.value = new Set()
      antropometria.value = criarAntropometriaVazia()
      anamnese.value = criarAnamneseVazia()
      imunizacoes.value = criarImunizacoesVazia()
      escolaridade.value = criarEscolaridadeVazia()
      triagemNeonatal.value = criarTriagemNeonatalVazia()
      encaminhamentos.value = []
      historiaFamiliar.value = criarHistoriaFamiliarVazia()
      dinamicaFamiliar.value = criarDinamicaFamiliarVazia()
      condicoesSocioeconomicas.value = criarCondicoesSocioeconomicasVazia()
      diagnostico.value = criarDiagnosticoVazio()
      hipotesesCondutas.value = criarHipotesesCondutasVazia()
      procedimentos.value = criarProcedimentosVazio()
      dadosExternos.value = []
      historicoImunizacoes.value = []
      if (pacienteIdFallback) currentPacienteId.value = pacienteIdFallback
      return
    }

    currentPacienteId.value = response.paciente_id
    consultaAtivaId.value = response.id
    consultaIniciada.value = dataBackendParaDate(response.data)
    completedSections.value = new Set(response.completed_sections as SecaoId[])
    startedSections.value = new Set((response.started_sections ?? response.completed_sections) as SecaoId[])

    if (response.antropometria) {
      antropometria.value = {
        pesoKg: response.antropometria.peso_kg,
        alturaCm: response.antropometria.altura_cm,
        perimetroCefalicoCm: response.antropometria.perimetro_cefalico_cm,
        pressaoSistolicaMmHg: response.antropometria.pressao_sistolica_mmhg,
        pressaoDiastolicaMmHg: response.antropometria.pressao_diastolica_mmhg,
        imc: response.antropometria.imc,
        classificacaoImc: response.antropometria.classificacao_imc,
        atualizadoEm: response.antropometria.atualizado_em,
      }
    } else {
      antropometria.value = criarAntropometriaVazia()
    }

    anamnese.value = response.anamnese ? anamneseApiParaStore(response.anamnese) : criarAnamneseVazia()
    imunizacoes.value = response.imunizacoes ? imunizacoesApiParaStore(response.imunizacoes) : criarImunizacoesVazia()
    escolaridade.value = response.escolaridade ? escolaridadeApiParaStore(response.escolaridade) : criarEscolaridadeVazia()
    triagemNeonatal.value = response.triagem_neonatal ? triagemNeonatalApiParaStore(response.triagem_neonatal) : criarTriagemNeonatalVazia()
    encaminhamentos.value = (response.encaminhamentos ?? []).map(encaminhamentoApiParaStore)
    historiaFamiliar.value = response.historia_familiar ? historiaFamiliarApiParaStore(response.historia_familiar) : criarHistoriaFamiliarVazia()
    dinamicaFamiliar.value = response.dinamica_familiar ? dinamicaFamiliarApiParaStore(response.dinamica_familiar) : criarDinamicaFamiliarVazia()
    condicoesSocioeconomicas.value = response.condicoes_socioeconomicas ? condicoesSocioeconomicasApiParaStore(response.condicoes_socioeconomicas) : criarCondicoesSocioeconomicasVazia()
    diagnostico.value = response.diagnostico ? diagnosticoApiParaStore(response.diagnostico) : criarDiagnosticoVazio()
    hipotesesCondutas.value = response.hipoteses_condutas ? hipotesesCondutasApiParaStore(response.hipoteses_condutas) : criarHipotesesCondutasVazia()
    procedimentos.value = response.procedimentos ? procedimentosApiParaStore(response.procedimentos) : criarProcedimentosVazio()
    dadosExternos.value = (response.dados_externos ?? []).map(dadoExternoApiParaStore)
    historicoImunizacoes.value = (response.imunizacoes_historico ?? []).map(historicoImunizacoesApiParaStore)
    atualizarStatusAnamnese()
    atualizarStatusImunizacoes()
    atualizarStatusEscolaridade()
    atualizarStatusTriagemNeonatal()
    atualizarStatusEncaminhamentos()
    atualizarStatusHistoriaFamiliar()
    atualizarStatusDinamicaFamiliar()
    atualizarStatusCondicoesSocioeconomicas()
    atualizarStatusDiagnostico()
    atualizarStatusHipotesesCondutas()
    atualizarStatusProcedimentos()
    atualizarStatusDadosExternos()
  }

  async function carregarHistoricoImunizacoes(pacienteIdInformado?: string) {
    const pacienteId = pacienteIdInformado ?? pacienteStore.pacienteAtivo?.id
    if (!pacienteId) {
      historicoImunizacoes.value = []
      return []
    }

    try {
      const { data } = await api.get<HistoricoImunizacoesApiResponse[]>(`/api/consultas/imunizacoes/historico/${pacienteId}`)
      historicoImunizacoes.value = data.map(historicoImunizacoesApiParaStore)
      return historicoImunizacoes.value
    } catch (error) {
      console.error('Erro ao carregar histórico de imunizações:', error)
      historicoImunizacoes.value = []
      return []
    }
  }

  async function carregarConsultaAtiva() {
    const pacienteId = pacienteStore.pacienteAtivo?.id
    if (!pacienteId) return null

    prepararConsultaPaciente(pacienteId)

    try {
      const { data } = await api.get<ConsultaAtivaApiResponse | null>(`/api/consultas/ativas/${pacienteId}`)
      aplicarConsultaAtiva(data, pacienteId)
      await carregarHistoricoImunizacoes(pacienteId)
      return data
    } catch (error) {
      console.error('Erro ao carregar consulta ativa:', error)
      return null
    }
  }

  async function salvarAntropometria(dados: Omit<DadosAntropometricosConsulta, 'atualizadoEm'>) {
    const pacienteId = pacienteStore.pacienteAtivo?.id
    if (!pacienteId) {
      throw new Error('Nenhum paciente ativo para salvar a antropometria.')
    }

    salvandoAntropometria.value = true
    erroSalvamentoAntropometria.value = null

    try {
      const { data } = await api.post<ConsultaAtivaApiResponse>('/api/consultas/antropometria', {
        paciente_id: pacienteId,
        peso_kg: dados.pesoKg,
        altura_cm: dados.alturaCm,
        perimetro_cefalico_cm: dados.perimetroCefalicoCm,
        pressao_sistolica_mmhg: dados.pressaoSistolicaMmHg,
        pressao_diastolica_mmhg: dados.pressaoDiastolicaMmHg,
        imc: dados.imc,
        classificacao_imc: dados.classificacaoImc,
      })

      aplicarConsultaAtiva(data)
      return data
    } catch (error) {
      erroSalvamentoAntropometria.value = 'Não foi possível salvar a antropometria no banco.'
      console.error('Erro ao salvar antropometria:', error)
      throw error
    } finally {
      salvandoAntropometria.value = false
    }
  }

  async function salvarAnamnese() {
    const pacienteId = pacienteStore.pacienteAtivo?.id
    if (!pacienteId) {
      throw new Error('Nenhum paciente ativo para salvar a anamnese.')
    }

    const anamneseAntesDoEnvio = clonarAnamnese(anamnese.value)
    salvandoAnamnese.value = true
    erroSalvamentoAnamnese.value = null

    try {
      const { data } = await api.post<ConsultaAtivaApiResponse>('/api/consultas/anamnese', {
        paciente_id: pacienteId,
        ...anamneseStoreParaApi(anamneseAntesDoEnvio),
      })

      aplicarConsultaAtiva(data, pacienteId)

      // Proteção contra resposta recém-salva sem a relação de anamnese carregada.
      // O backend também foi ajustado, mas manter o snapshot evita zerar a tela
      // caso a API retorne a consulta sem o detalhe logo após o POST.
      if (!data.anamnese) {
        anamnese.value = {
          ...anamneseAntesDoEnvio,
          atualizadoEm: new Date().toISOString(),
        }
        atualizarStatusAnamnese()
      }

      return data
    } catch (error) {
      erroSalvamentoAnamnese.value = 'Não foi possível salvar a anamnese no banco.'
      console.error('Erro ao salvar anamnese:', error)
      throw error
    } finally {
      salvandoAnamnese.value = false
    }
  }

  async function salvarImunizacoes() {
    const pacienteId = pacienteStore.pacienteAtivo?.id
    if (!pacienteId) {
      throw new Error('Nenhum paciente ativo para salvar as imunizações.')
    }

    const statusVacinalAntesDoEnvio = imunizacoes.value.statusVacinal
    salvandoImunizacoes.value = true
    erroSalvamentoImunizacoes.value = null

    try {
      const { data } = await api.post<ConsultaAtivaApiResponse>('/api/consultas/imunizacoes', {
        paciente_id: pacienteId,
        status_vacinal: statusVacinalAntesDoEnvio,
      })

      aplicarConsultaAtiva(data, pacienteId)

      if (!data.imunizacoes) {
        imunizacoes.value = {
          statusVacinal: statusVacinalAntesDoEnvio,
          atualizadoEm: new Date().toISOString(),
        }
        atualizarStatusImunizacoes()
      }

      await carregarHistoricoImunizacoes(pacienteId)
      return data
    } catch (error) {
      erroSalvamentoImunizacoes.value = 'Não foi possível salvar as imunizações no banco.'
      console.error('Erro ao salvar imunizações:', error)
      throw error
    } finally {
      salvandoImunizacoes.value = false
    }
  }

  async function salvarEscolaridade() {
    const pacienteId = pacienteStore.pacienteAtivo?.id
    if (!pacienteId) {
      throw new Error('Nenhum paciente ativo para salvar a escolaridade.')
    }

    const escolaridadeAntesDoEnvio = clonarEscolaridade(escolaridade.value)
    salvandoEscolaridade.value = true
    erroSalvamentoEscolaridade.value = null

    try {
      const { data } = await api.post<ConsultaAtivaApiResponse>('/api/consultas/escolaridade', {
        paciente_id: pacienteId,
        ...escolaridadeStoreParaApi(escolaridadeAntesDoEnvio),
      })

      aplicarConsultaAtiva(data, pacienteId)

      if (!data.escolaridade) {
        escolaridade.value = {
          ...escolaridadeAntesDoEnvio,
          atualizadoEm: new Date().toISOString(),
        }
        atualizarStatusEscolaridade()
      }

      return data
    } catch (error) {
      erroSalvamentoEscolaridade.value = 'Não foi possível salvar a escolaridade no banco.'
      console.error('Erro ao salvar escolaridade:', error)
      throw error
    } finally {
      salvandoEscolaridade.value = false
    }
  }

  async function salvarTriagemNeonatal() {
    const pacienteId = pacienteStore.pacienteAtivo?.id
    if (!pacienteId) {
      throw new Error('Nenhum paciente ativo para salvar a triagem neonatal.')
    }

    const triagemAntesDoEnvio = clonarTriagemNeonatal(triagemNeonatal.value)
    salvandoTriagemNeonatal.value = true
    erroSalvamentoTriagemNeonatal.value = null

    try {
      const { data } = await api.post<ConsultaAtivaApiResponse>('/api/consultas/triagem-neonatal', {
        paciente_id: pacienteId,
        ...triagemNeonatalStoreParaApi(triagemAntesDoEnvio),
      })

      aplicarConsultaAtiva(data, pacienteId)

      if (!data.triagem_neonatal) {
        triagemNeonatal.value = {
          ...triagemAntesDoEnvio,
          atualizadoEm: new Date().toISOString(),
        }
        atualizarStatusTriagemNeonatal()
      }

      return data
    } catch (error) {
      erroSalvamentoTriagemNeonatal.value = 'Não foi possível salvar a triagem neonatal no banco.'
      console.error('Erro ao salvar triagem neonatal:', error)
      throw error
    } finally {
      salvandoTriagemNeonatal.value = false
    }
  }

  async function salvarEncaminhamentos() {
    const pacienteId = pacienteStore.pacienteAtivo?.id
    if (!pacienteId) {
      throw new Error('Nenhum paciente ativo para salvar os encaminhamentos.')
    }

    const encaminhamentosAntesDoEnvio = clonarEncaminhamentos(encaminhamentos.value)
    salvandoEncaminhamentos.value = true
    erroSalvamentoEncaminhamentos.value = null

    try {
      const { data } = await api.post<ConsultaAtivaApiResponse>('/api/consultas/encaminhamentos', {
        paciente_id: pacienteId,
        encaminhamentos: encaminhamentosAntesDoEnvio.map(encaminhamentoStoreParaApi),
      })

      aplicarConsultaAtiva(data, pacienteId)

      if (!data.encaminhamentos) {
        encaminhamentos.value = encaminhamentosAntesDoEnvio.map(item => ({
          ...item,
          atualizadoEm: new Date().toISOString(),
        }))
        atualizarStatusEncaminhamentos()
      }

      return data
    } catch (error) {
      erroSalvamentoEncaminhamentos.value = 'Não foi possível salvar os encaminhamentos no banco.'
      console.error('Erro ao salvar encaminhamentos:', error)
      throw error
    } finally {
      salvandoEncaminhamentos.value = false
    }
  }

  async function salvarHistoriaFamiliar() {
    const pacienteId = pacienteStore.pacienteAtivo?.id
    if (!pacienteId) {
      throw new Error('Nenhum paciente ativo para salvar a história familiar.')
    }

    const historiaAntesDoEnvio = clonarHistoriaFamiliar(historiaFamiliar.value)
    salvandoHistoriaFamiliar.value = true
    erroSalvamentoHistoriaFamiliar.value = null

    try {
      const { data } = await api.post<ConsultaAtivaApiResponse>('/api/consultas/historia-familiar', {
        paciente_id: pacienteId,
        ...historiaFamiliarStoreParaApi(historiaAntesDoEnvio),
      })

      aplicarConsultaAtiva(data, pacienteId)

      if (!data.historia_familiar) {
        historiaFamiliar.value = {
          ...historiaAntesDoEnvio,
          atualizadoEm: new Date().toISOString(),
        }
        atualizarStatusHistoriaFamiliar()
      }

      return data
    } catch (error) {
      erroSalvamentoHistoriaFamiliar.value = 'Não foi possível salvar a história familiar no banco.'
      console.error('Erro ao salvar história familiar:', error)
      throw error
    } finally {
      salvandoHistoriaFamiliar.value = false
    }
  }


  async function salvarDinamicaFamiliar() {
    const pacienteId = pacienteStore.pacienteAtivo?.id
    if (!pacienteId) {
      throw new Error('Nenhum paciente ativo para salvar a dinâmica familiar.')
    }

    const dinamicaAntesDoEnvio = clonarDinamicaFamiliar(dinamicaFamiliar.value)
    salvandoDinamicaFamiliar.value = true
    erroSalvamentoDinamicaFamiliar.value = null

    try {
      const { data } = await api.post<ConsultaAtivaApiResponse>('/api/consultas/dinamica-familiar', {
        paciente_id: pacienteId,
        ...dinamicaFamiliarStoreParaApi(dinamicaAntesDoEnvio),
      })

      aplicarConsultaAtiva(data, pacienteId)

      if (!data.dinamica_familiar) {
        dinamicaFamiliar.value = {
          ...dinamicaAntesDoEnvio,
          atualizadoEm: new Date().toISOString(),
        }
        atualizarStatusDinamicaFamiliar()
      }

      return data
    } catch (error) {
      erroSalvamentoDinamicaFamiliar.value = 'Não foi possível salvar a dinâmica familiar no banco.'
      console.error('Erro ao salvar dinâmica familiar:', error)
      throw error
    } finally {
      salvandoDinamicaFamiliar.value = false
    }
  }


  async function salvarCondicoesSocioeconomicas() {
    const pacienteId = pacienteStore.pacienteAtivo?.id
    if (!pacienteId) {
      throw new Error('Nenhum paciente ativo para salvar as condições socioeconômicas.')
    }

    const condicoesAntesDoEnvio = clonarCondicoesSocioeconomicas(condicoesSocioeconomicas.value)
    salvandoCondicoesSocioeconomicas.value = true
    erroSalvamentoCondicoesSocioeconomicas.value = null

    try {
      const { data } = await api.post<ConsultaAtivaApiResponse>('/api/consultas/condicoes-socioeconomicas', {
        paciente_id: pacienteId,
        ...condicoesSocioeconomicasStoreParaApi(condicoesAntesDoEnvio),
      })

      aplicarConsultaAtiva(data, pacienteId)

      if (!data.condicoes_socioeconomicas) {
        condicoesSocioeconomicas.value = {
          ...condicoesAntesDoEnvio,
          atualizadoEm: new Date().toISOString(),
        }
        atualizarStatusCondicoesSocioeconomicas()
      }

      return data
    } catch (error) {
      erroSalvamentoCondicoesSocioeconomicas.value = 'Não foi possível salvar as condições socioeconômicas no banco.'
      console.error('Erro ao salvar condições socioeconômicas:', error)
      throw error
    } finally {
      salvandoCondicoesSocioeconomicas.value = false
    }
  }


  async function salvarDiagnostico() {
    const pacienteId = pacienteStore.pacienteAtivo?.id
    if (!pacienteId) {
      throw new Error('Nenhum paciente ativo para salvar o diagnóstico.')
    }

    const diagnosticoAntesDoEnvio = clonarDiagnostico(diagnostico.value)
    salvandoDiagnostico.value = true
    erroSalvamentoDiagnostico.value = null

    try {
      const { data } = await api.post<ConsultaAtivaApiResponse>('/api/consultas/diagnostico', {
        paciente_id: pacienteId,
        ...diagnosticoStoreParaApi(diagnosticoAntesDoEnvio),
      })

      aplicarConsultaAtiva(data, pacienteId)

      if (!data.diagnostico) {
        diagnostico.value = {
          ...diagnosticoAntesDoEnvio,
          cidsSecundarios: diagnosticoAntesDoEnvio.cidsSecundarios.map(item => ({ ...item })),
          atualizadoEm: new Date().toISOString(),
        }
        atualizarStatusDiagnostico()
      }

      return data
    } catch (error) {
      erroSalvamentoDiagnostico.value = 'Não foi possível salvar o diagnóstico no banco.'
      console.error('Erro ao salvar diagnóstico:', error)
      throw error
    } finally {
      salvandoDiagnostico.value = false
    }
  }


  async function salvarHipotesesCondutas() {
    const pacienteId = pacienteStore.pacienteAtivo?.id
    if (!pacienteId) {
      throw new Error('Nenhum paciente ativo para salvar hipóteses e condutas.')
    }

    const dadosAntesDoEnvio = clonarHipotesesCondutas(hipotesesCondutas.value)
    salvandoHipotesesCondutas.value = true
    erroSalvamentoHipotesesCondutas.value = null

    try {
      const { data } = await api.post<ConsultaAtivaApiResponse>('/api/consultas/hipoteses-condutas', {
        paciente_id: pacienteId,
        ...hipotesesCondutasStoreParaApi(dadosAntesDoEnvio),
      })

      aplicarConsultaAtiva(data, pacienteId)

      if (!data.hipoteses_condutas) {
        hipotesesCondutas.value = {
          ...dadosAntesDoEnvio,
          atualizadoEm: new Date().toISOString(),
        }
        atualizarStatusHipotesesCondutas()
      }

      return data
    } catch (error) {
      erroSalvamentoHipotesesCondutas.value = 'Não foi possível salvar hipóteses e condutas no banco.'
      console.error('Erro ao salvar hipóteses e condutas:', error)
      throw error
    } finally {
      salvandoHipotesesCondutas.value = false
    }
  }


  async function salvarProcedimentos() {
    const pacienteId = pacienteStore.pacienteAtivo?.id
    if (!pacienteId) {
      throw new Error('Nenhum paciente ativo para salvar procedimentos.')
    }

    const dadosAntesDoEnvio = clonarProcedimentos(procedimentos.value)
    salvandoProcedimentos.value = true
    erroSalvamentoProcedimentos.value = null

    try {
      const { data } = await api.post<ConsultaAtivaApiResponse>('/api/consultas/procedimentos', {
        paciente_id: pacienteId,
        ...procedimentosStoreParaApi(dadosAntesDoEnvio),
      })

      aplicarConsultaAtiva(data, pacienteId)

      if (!data.procedimentos) {
        procedimentos.value = {
          ...clonarProcedimentos(dadosAntesDoEnvio),
          atualizadoEm: new Date().toISOString(),
        }
        atualizarStatusProcedimentos()
      }

      return data
    } catch (error) {
      erroSalvamentoProcedimentos.value = 'Não foi possível salvar os procedimentos no banco.'
      console.error('Erro ao salvar procedimentos:', error)
      throw error
    } finally {
      salvandoProcedimentos.value = false
    }
  }


  async function salvarDadosExternos() {
    const pacienteId = pacienteStore.pacienteAtivo?.id
    if (!pacienteId) {
      throw new Error('Nenhum paciente ativo para salvar dados externos.')
    }

    const dadosAntesDoEnvio = clonarDadosExternos(dadosExternos.value)
    salvandoDadosExternos.value = true
    erroSalvamentoDadosExternos.value = null

    try {
      const { data } = await api.post<ConsultaAtivaApiResponse>('/api/consultas/dados-externos', {
        paciente_id: pacienteId,
        registros: dadosAntesDoEnvio.map(dadoExternoStoreParaApi),
      })

      aplicarConsultaAtiva(data, pacienteId)

      if (!data.dados_externos) {
        dadosExternos.value = dadosAntesDoEnvio.map(item => ({
          ...item,
          atualizadoEm: new Date().toISOString(),
        }))
        atualizarStatusDadosExternos()
      }

      return data
    } catch (error) {
      erroSalvamentoDadosExternos.value = 'Não foi possível salvar os dados externos no banco.'
      console.error('Erro ao salvar dados externos:', error)
      throw error
    } finally {
      salvandoDadosExternos.value = false
    }
  }


  async function finalizarConsulta() {
    const pacienteId = pacienteStore.pacienteAtivo?.id
    if (!pacienteId) {
      throw new Error('Nenhum paciente ativo para finalizar a consulta.')
    }

    finalizandoConsulta.value = true
    erroFinalizarConsulta.value = null

    try {
      const { data } = await api.post<ConsultaFinalizarApiResponse>('/api/consultas/finalizar', {
        paciente_id: pacienteId,
      })

      resetConsulta()
      return data
    } catch (error) {
      erroFinalizarConsulta.value = 'Não foi possível finalizar a consulta no banco.'
      console.error('Erro ao finalizar consulta:', error)
      throw error
    } finally {
      finalizandoConsulta.value = false
    }
  }

  function atualizarStatusImunizacoes() {
    const possuiStatusVacinal = imunizacoes.value.statusVacinal.trim().length > 0
    if (possuiStatusVacinal) {
      markSectionStarted('imunizacoes')
    }
    setSectionComplete('imunizacoes', possuiStatusVacinal)
  }

  function atualizarStatusVacinal(valor: string) {
    imunizacoes.value = {
      statusVacinal: valor,
      atualizadoEm: new Date().toISOString(),
    }
    atualizarStatusImunizacoes()
  }

  function atualizarStatusAnamnese() {
    const possuiConteudo = possuiConteudoAnamnese(anamnese.value)
    const possuiQueixaPrincipal = anamnese.value.clinica.queixaPrincipal.trim().length > 0

    if (possuiConteudo) {
      markSectionStarted('anamnesis')
    }

    setSectionComplete('anamnesis', possuiQueixaPrincipal)
  }

  function atualizarAnamnese(dados: DadosAnamnesePayload) {
    anamnese.value = {
      clinica: { ...dados.clinica },
      alimentacao: { ...dados.alimentacao },
      habitos: { ...dados.habitos },
      atualizadoEm: new Date().toISOString(),
    }
    atualizarStatusAnamnese()
  }

  function atualizarCampoAnamnese(aba: 'clinica', campo: keyof AnamneseClinica, valor: AnamneseClinica[keyof AnamneseClinica]): void
  function atualizarCampoAnamnese(aba: 'alimentacao', campo: keyof AnamneseAlimentacao, valor: AnamneseAlimentacao[keyof AnamneseAlimentacao]): void
  function atualizarCampoAnamnese(aba: 'habitos', campo: keyof AnamneseHabitos, valor: AnamneseHabitos[keyof AnamneseHabitos]): void
  function atualizarCampoAnamnese(aba: AbaAnamnese, campo: string, valor: ValorCampoAnamnese) {
    const dados: DadosAnamnesePayload = {
      clinica: {
        ...anamnese.value.clinica,
        sistemasInterrogatorioAlterados: [...anamnese.value.clinica.sistemasInterrogatorioAlterados],
      },
      alimentacao: { ...anamnese.value.alimentacao },
      habitos: {
        ...anamnese.value.habitos,
        telasDispositivos: [...anamnese.value.habitos.telasDispositivos],
      },
    }

    ;(dados[aba] as unknown as Record<string, ValorCampoAnamnese>)[campo] = valor
    atualizarAnamnese(dados)
  }


  function triagemNeonatalPossuiConteudo(dados: DadosTriagemNeonatalConsulta): boolean {
    return Boolean(
      dados.idadeGestacionalSemanas !== null ||
      dados.pesoNascimentoGramas !== null ||
      dados.hipotesesDiagnosticasAnteriores.trim() ||
      dados.testePezinho.resultado ||
      dados.testePezinho.data ||
      dados.testePezinho.descricao.trim() ||
      dados.testeOrelhinha.resultado ||
      dados.testeOrelhinha.data ||
      dados.testeOrelhinha.descricao.trim() ||
      dados.testeOlhinho.resultado ||
      dados.testeOlhinho.data ||
      dados.testeOlhinho.descricao.trim() ||
      dados.testeCoracaozinho.resultado ||
      dados.testeCoracaozinho.data ||
      dados.testeCoracaozinho.descricao.trim()
    )
  }

  function triagemNeonatalCompleta(dados: DadosTriagemNeonatalConsulta): boolean {
    return Boolean(
      dados.testePezinho.resultado &&
      dados.testeOrelhinha.resultado &&
      dados.testeOlhinho.resultado &&
      dados.testeCoracaozinho.resultado
    )
  }

  function atualizarStatusTriagemNeonatal() {
    if (triagemNeonatalPossuiConteudo(triagemNeonatal.value)) {
      markSectionStarted('triagemNeonatal')
    }
    setSectionComplete('triagemNeonatal', triagemNeonatalCompleta(triagemNeonatal.value))
  }

  function atualizarTriagemNeonatal(dados: DadosTriagemNeonatalConsulta) {
    triagemNeonatal.value = {
      ...clonarTriagemNeonatal(dados),
      atualizadoEm: new Date().toISOString(),
    }
    atualizarStatusTriagemNeonatal()
  }

  function encaminhamentoPossuiConteudo(item: EncaminhamentoConsulta): boolean {
    return Boolean(
      item.especialidade.trim() ||
      item.procedimentoMotivo.trim() ||
      item.justificativaClinica.trim()
    )
  }

  function encaminhamentoCompleto(item: EncaminhamentoConsulta): boolean {
    return Boolean(item.especialidade.trim() && item.procedimentoMotivo.trim())
  }

  function atualizarStatusEncaminhamentos() {
    const possuiConteudo = encaminhamentos.value.length > 0 && encaminhamentos.value.some(encaminhamentoPossuiConteudo)
    const possuiCompleto = encaminhamentos.value.some(encaminhamentoCompleto)

    if (possuiConteudo || encaminhamentos.value.length > 0) {
      markSectionStarted('referral')
    }

    setSectionComplete('referral', possuiCompleto)
  }

  function adicionarEncaminhamento() {
    encaminhamentos.value = [...encaminhamentos.value, criarEncaminhamentoVazio()]
    atualizarStatusEncaminhamentos()
  }

  function removerEncaminhamento(localId: string) {
    encaminhamentos.value = encaminhamentos.value.filter(item => item.localId !== localId)
    atualizarStatusEncaminhamentos()
  }

  function atualizarCampoEncaminhamento<K extends keyof EncaminhamentoConsulta>(
    localId: string,
    campo: K,
    valor: EncaminhamentoConsulta[K],
  ) {
    encaminhamentos.value = encaminhamentos.value.map(item => (
      item.localId === localId
        ? { ...item, [campo]: valor, atualizadoEm: new Date().toISOString() }
        : item
    ))
    atualizarStatusEncaminhamentos()
  }


  function historiaFamiliarPossuiConteudo(dados: DadosHistoriaFamiliarConsulta): boolean {
    return Boolean(
      dados.houveMudanca !== null ||
      dados.maternalIdade.trim() ||
      dados.maternalSaude.trim() ||
      dados.maternalOcupacao.trim() ||
      dados.paternalIdade.trim() ||
      dados.paternalSaude.trim() ||
      dados.paternalOcupacao.trim() ||
      dados.coabitacaoPais.trim() ||
      dados.irmaosSaude.trim()
    )
  }

  function historiaFamiliarCompleta(dados: DadosHistoriaFamiliarConsulta): boolean {
    return dados.houveMudanca !== null || dados.maternalSaude.trim().length > 0
  }

  function atualizarStatusHistoriaFamiliar() {
    if (historiaFamiliarPossuiConteudo(historiaFamiliar.value)) {
      markSectionStarted('historiaFamiliar')
    }
    setSectionComplete('historiaFamiliar', historiaFamiliarCompleta(historiaFamiliar.value))
  }

  function atualizarHistoriaFamiliar(dados: DadosHistoriaFamiliarConsulta) {
    historiaFamiliar.value = {
      ...clonarHistoriaFamiliar(dados),
      atualizadoEm: new Date().toISOString(),
    }
    atualizarStatusHistoriaFamiliar()
  }

  function atualizarCampoHistoriaFamiliar<K extends keyof DadosHistoriaFamiliarConsulta>(
    campo: K,
    valor: DadosHistoriaFamiliarConsulta[K],
  ) {
    historiaFamiliar.value = {
      ...historiaFamiliar.value,
      [campo]: valor,
      atualizadoEm: new Date().toISOString(),
    }
    atualizarStatusHistoriaFamiliar()
  }


  function dinamicaFamiliarPossuiConteudo(dados: DadosDinamicaFamiliarConsulta): boolean {
    return Boolean(
      dados.houveMudanca !== null ||
      dados.relacionamentoCompanheiro.trim() ||
      dados.resolucaoDesentendimentos.trim() ||
      dados.fumanteDomicilio !== null ||
      dados.usoAlcoolDrogas !== null ||
      dados.insegurancaAlimentar !== null ||
      dados.familiarPreso !== null ||
      dados.preocupacaoComportamento !== null ||
      dados.disciplinaOpcoes.length > 0
    )
  }

  function dinamicaFamiliarCompleta(dados: DadosDinamicaFamiliarConsulta): boolean {
    return dados.houveMudanca !== null || Boolean(
      dados.relacionamentoCompanheiro.trim() ||
      dados.resolucaoDesentendimentos.trim() ||
      dados.fumanteDomicilio !== null ||
      dados.usoAlcoolDrogas !== null ||
      dados.insegurancaAlimentar !== null ||
      dados.familiarPreso !== null ||
      dados.preocupacaoComportamento !== null
    )
  }

  function atualizarStatusDinamicaFamiliar() {
    if (dinamicaFamiliarPossuiConteudo(dinamicaFamiliar.value)) {
      markSectionStarted('dinamicaFamiliar')
    }
    setSectionComplete('dinamicaFamiliar', dinamicaFamiliarCompleta(dinamicaFamiliar.value))
  }

  function atualizarDinamicaFamiliar(dados: DadosDinamicaFamiliarConsulta) {
    dinamicaFamiliar.value = {
      ...clonarDinamicaFamiliar(dados),
      atualizadoEm: new Date().toISOString(),
    }
    atualizarStatusDinamicaFamiliar()
  }

  function atualizarCampoDinamicaFamiliar<K extends keyof DadosDinamicaFamiliarConsulta>(
    campo: K,
    valor: DadosDinamicaFamiliarConsulta[K],
  ) {
    dinamicaFamiliar.value = {
      ...dinamicaFamiliar.value,
      [campo]: valor,
      disciplinaOpcoes: [...dinamicaFamiliar.value.disciplinaOpcoes],
      atualizadoEm: new Date().toISOString(),
    }
    atualizarStatusDinamicaFamiliar()
  }

  function alternarOpcaoDisciplina(opcao: string) {
    const opcoes = new Set(dinamicaFamiliar.value.disciplinaOpcoes)
    if (opcoes.has(opcao)) {
      opcoes.delete(opcao)
    } else {
      opcoes.add(opcao)
    }
    atualizarCampoDinamicaFamiliar('disciplinaOpcoes', Array.from(opcoes))
  }


  function condicoesSocioeconomicasPossuiConteudo(dados: DadosCondicoesSocioeconomicasConsulta): boolean {
    return Boolean(
      dados.rendaFamiliar.trim() ||
      dados.rendaNaoInformada ||
      dados.tipoCasa.trim() ||
      dados.numeroComodos !== null ||
      dados.banheiro.trim() ||
      dados.quartoCrianca.trim() ||
      dados.presencaAnimais.trim() ||
      dados.aguaEncanada !== null ||
      dados.energiaEletrica !== null ||
      dados.esgoto.trim() ||
      dados.coletaLixo !== null ||
      dados.areaViolencia !== null
    )
  }

  function condicoesSocioeconomicasCompleta(dados: DadosCondicoesSocioeconomicasConsulta): boolean {
    return condicoesSocioeconomicasPossuiConteudo(dados)
  }

  function atualizarStatusCondicoesSocioeconomicas() {
    if (condicoesSocioeconomicasPossuiConteudo(condicoesSocioeconomicas.value)) {
      markSectionStarted('socioeconomico')
    }
    setSectionComplete('socioeconomico', condicoesSocioeconomicasCompleta(condicoesSocioeconomicas.value))
  }

  function atualizarCondicoesSocioeconomicas(dados: DadosCondicoesSocioeconomicasConsulta) {
    condicoesSocioeconomicas.value = {
      ...clonarCondicoesSocioeconomicas(dados),
      atualizadoEm: new Date().toISOString(),
    }
    atualizarStatusCondicoesSocioeconomicas()
  }

  function atualizarCampoCondicoesSocioeconomicas<K extends keyof DadosCondicoesSocioeconomicasConsulta>(
    campo: K,
    valor: DadosCondicoesSocioeconomicasConsulta[K],
  ) {
    condicoesSocioeconomicas.value = {
      ...condicoesSocioeconomicas.value,
      [campo]: valor,
      atualizadoEm: new Date().toISOString(),
    }

    if (campo === 'rendaNaoInformada' && valor === true) {
      condicoesSocioeconomicas.value.rendaFamiliar = ''
    }

    atualizarStatusCondicoesSocioeconomicas()
  }


  function diagnosticoPossuiConteudo(dados: DadosDiagnosticoConsulta): boolean {
    return Boolean(
      dados.cid10Principal.trim() ||
      dados.sid.trim() ||
      dados.cidsSecundarios.some(item => item.codigo.trim() || item.descricao.trim())
    )
  }

  function diagnosticoCompleto(dados: DadosDiagnosticoConsulta): boolean {
    return dados.cid10Principal.trim().length > 0
  }

  function atualizarStatusDiagnostico() {
    if (diagnosticoPossuiConteudo(diagnostico.value)) {
      markSectionStarted('diagnostico')
    }
    setSectionComplete('diagnostico', diagnosticoCompleto(diagnostico.value))
  }

  function atualizarCampoDiagnostico<K extends keyof DadosDiagnosticoConsulta>(
    campo: K,
    valor: DadosDiagnosticoConsulta[K],
  ) {
    diagnostico.value = {
      ...diagnostico.value,
      cidsSecundarios: diagnostico.value.cidsSecundarios.map(item => ({ ...item })),
      [campo]: valor,
      atualizadoEm: new Date().toISOString(),
    }
    atualizarStatusDiagnostico()
  }

  function adicionarCidSecundario() {
    diagnostico.value = {
      ...diagnostico.value,
      cidsSecundarios: [...diagnostico.value.cidsSecundarios, criarCidSecundarioVazio()],
      atualizadoEm: new Date().toISOString(),
    }
    atualizarStatusDiagnostico()
  }

  function removerCidSecundario(localId: string) {
    diagnostico.value = {
      ...diagnostico.value,
      cidsSecundarios: diagnostico.value.cidsSecundarios.filter(item => item.localId !== localId),
      atualizadoEm: new Date().toISOString(),
    }
    atualizarStatusDiagnostico()
  }

  function atualizarCampoCidSecundario<K extends keyof CidSecundarioConsulta>(
    localId: string,
    campo: K,
    valor: CidSecundarioConsulta[K],
  ) {
    diagnostico.value = {
      ...diagnostico.value,
      cidsSecundarios: diagnostico.value.cidsSecundarios.map(item => (
        item.localId === localId ? { ...item, [campo]: valor } : item
      )),
      atualizadoEm: new Date().toISOString(),
    }
    atualizarStatusDiagnostico()
  }


  function hipotesesCondutasPossuiConteudo(dados: DadosHipotesesCondutasConsulta): boolean {
    return Boolean(
      dados.hipotesesDiagnosticas.trim() ||
      dados.condutasPlanoCuidado.trim()
    )
  }

  function hipotesesCondutasCompleta(dados: DadosHipotesesCondutasConsulta): boolean {
    return Boolean(
      dados.hipotesesDiagnosticas.trim() &&
      dados.condutasPlanoCuidado.trim()
    )
  }

  function atualizarStatusHipotesesCondutas() {
    if (hipotesesCondutasPossuiConteudo(hipotesesCondutas.value)) {
      markSectionStarted('condutasHipoteses')
    }
    setSectionComplete('condutasHipoteses', hipotesesCondutasCompleta(hipotesesCondutas.value))
  }

  function atualizarHipotesesCondutas(dados: DadosHipotesesCondutasConsulta) {
    hipotesesCondutas.value = {
      ...clonarHipotesesCondutas(dados),
      atualizadoEm: new Date().toISOString(),
    }
    atualizarStatusHipotesesCondutas()
  }

  function atualizarCampoHipotesesCondutas<K extends keyof DadosHipotesesCondutasConsulta>(
    campo: K,
    valor: DadosHipotesesCondutasConsulta[K],
  ) {
    hipotesesCondutas.value = {
      ...hipotesesCondutas.value,
      [campo]: valor,
      atualizadoEm: new Date().toISOString(),
    }
    atualizarStatusHipotesesCondutas()
  }


  function procedimentoPossuiConteudo(item: ProcedimentoConsulta): boolean {
    return Boolean(
      item.procedimento.trim() ||
      item.cidVinculado.trim() ||
      item.observacoes.trim() ||
      item.quantidade !== null
    )
  }

  function procedimentosPossuemConteudo(dados: DadosProcedimentosConsulta): boolean {
    return Boolean(
      dados.realizados !== null ||
      dados.procedimentos.some(procedimentoPossuiConteudo)
    )
  }

  function procedimentosCompletos(dados: DadosProcedimentosConsulta): boolean {
    if (dados.realizados === false) return true
    if (dados.realizados !== true) return false
    return dados.procedimentos.some(item => item.procedimento.trim() && item.quantidade !== null && item.quantidade > 0)
  }

  function atualizarStatusProcedimentos() {
    if (procedimentosPossuemConteudo(procedimentos.value)) {
      markSectionStarted('procedimentos')
    }
    setSectionComplete('procedimentos', procedimentosCompletos(procedimentos.value))
  }

  function atualizarProcedimentos(dados: DadosProcedimentosConsulta) {
    procedimentos.value = {
      ...clonarProcedimentos(dados),
      atualizadoEm: new Date().toISOString(),
    }
    atualizarStatusProcedimentos()
  }

  function atualizarRealizadosProcedimentos(valor: boolean) {
    procedimentos.value = {
      ...procedimentos.value,
      realizados: valor,
      procedimentos: valor
        ? (procedimentos.value.procedimentos.length ? procedimentos.value.procedimentos.map(item => ({ ...item })) : [criarProcedimentoVazio()])
        : [],
      atualizadoEm: new Date().toISOString(),
    }
    atualizarStatusProcedimentos()
  }

  function adicionarProcedimento() {
    procedimentos.value = {
      ...procedimentos.value,
      realizados: true,
      procedimentos: [...procedimentos.value.procedimentos, criarProcedimentoVazio()],
      atualizadoEm: new Date().toISOString(),
    }
    atualizarStatusProcedimentos()
  }

  function removerProcedimento(localId: string) {
    const itens = procedimentos.value.procedimentos.filter(item => item.localId !== localId)
    procedimentos.value = {
      ...procedimentos.value,
      procedimentos: itens,
      realizados: itens.length ? procedimentos.value.realizados : true,
      atualizadoEm: new Date().toISOString(),
    }
    atualizarStatusProcedimentos()
  }

  function atualizarCampoProcedimento<K extends keyof ProcedimentoConsulta>(
    localId: string,
    campo: K,
    valor: ProcedimentoConsulta[K],
  ) {
    procedimentos.value = {
      ...procedimentos.value,
      realizados: true,
      procedimentos: procedimentos.value.procedimentos.map(item => (
        item.localId === localId ? { ...item, [campo]: valor } : item
      )),
      atualizadoEm: new Date().toISOString(),
    }
    atualizarStatusProcedimentos()
  }


  function dadoExternoPossuiConteudo(item: DadoExternoConsulta): boolean {
    return Boolean(
      item.dataConsultaExterna ||
      item.servicoOrigem.trim() ||
      item.pesoKg !== null ||
      item.alturaCm !== null ||
      item.observacoesClinicas.trim() ||
      item.comoDadosObtidos.trim()
    )
  }

  function dadoExternoCompleto(item: DadoExternoConsulta): boolean {
    return Boolean(
      item.comoDadosObtidos.trim() &&
      (
        item.dataConsultaExterna ||
        item.servicoOrigem.trim() ||
        item.pesoKg !== null ||
        item.alturaCm !== null ||
        item.observacoesClinicas.trim()
      )
    )
  }

  function atualizarStatusDadosExternos() {
    if (dadosExternos.value.some(dadoExternoPossuiConteudo)) {
      markSectionStarted('externo')
    }
    setSectionComplete('externo', dadosExternos.value.some(dadoExternoCompleto))
  }

  function adicionarDadoExterno(dado?: DadoExternoConsulta) {
    dadosExternos.value = [
      ...dadosExternos.value,
      dado ? { ...dado, localId: dado.localId || criarDadoExternoVazio().localId } : criarDadoExternoVazio(),
    ]
    atualizarStatusDadosExternos()
  }

  function removerDadoExterno(localId: string) {
    dadosExternos.value = dadosExternos.value.filter(item => item.localId !== localId)
    atualizarStatusDadosExternos()
  }

  function atualizarCampoDadoExterno<K extends keyof DadoExternoConsulta>(
    localId: string,
    campo: K,
    valor: DadoExternoConsulta[K],
  ) {
    dadosExternos.value = dadosExternos.value.map(item => (
      item.localId === localId ? { ...item, [campo]: valor, atualizadoEm: new Date().toISOString() } : item
    ))
    atualizarStatusDadosExternos()
  }


  function escolaridadePossuiConteudo(dados: DadosEscolaridadeConsulta): boolean {
    return Boolean(
      dados.frequentaEscolaCreche !== null ||
      dados.anoSerie.trim() ||
      dados.houveReprovacao !== null ||
      dados.rendimentoRelacionamento.trim()
    )
  }

  function escolaridadeCompleta(dados: DadosEscolaridadeConsulta): boolean {
    return dados.frequentaEscolaCreche !== null
  }

  function atualizarStatusEscolaridade() {
    if (escolaridadePossuiConteudo(escolaridade.value)) {
      markSectionStarted('escolaridade')
    }
    setSectionComplete('escolaridade', escolaridadeCompleta(escolaridade.value))
  }

  function atualizarEscolaridade(dados: DadosEscolaridadeConsulta) {
    escolaridade.value = {
      ...clonarEscolaridade(dados),
      atualizadoEm: new Date().toISOString(),
    }
    atualizarStatusEscolaridade()
  }

  function atualizarCampoEscolaridade<K extends keyof DadosEscolaridadeConsulta>(
    campo: K,
    valor: DadosEscolaridadeConsulta[K],
  ) {
    escolaridade.value = {
      ...escolaridade.value,
      [campo]: valor,
      atualizadoEm: new Date().toISOString(),
    }
    atualizarStatusEscolaridade()
  }

  function goNext() {
    if (canGoNext.value) {
      activeSection.value = secoes.value[currentIndex.value + 1].id
    }
  }

  function goPrev() {
    if (canGoPrev.value) {
      activeSection.value = secoes.value[currentIndex.value - 1].id
    }
  }

  function resetConsulta() {
    consultaIniciada.value = null
    consultaAtivaId.value = null
    currentPacienteId.value = null
    salvandoAntropometria.value = false
    erroSalvamentoAntropometria.value = null
    salvandoAnamnese.value = false
    erroSalvamentoAnamnese.value = null
    salvandoImunizacoes.value = false
    erroSalvamentoImunizacoes.value = null
    salvandoEscolaridade.value = false
    erroSalvamentoEscolaridade.value = null
    salvandoTriagemNeonatal.value = false
    erroSalvamentoTriagemNeonatal.value = null
    salvandoEncaminhamentos.value = false
    erroSalvamentoEncaminhamentos.value = null
    salvandoHistoriaFamiliar.value = false
    erroSalvamentoHistoriaFamiliar.value = null
    salvandoDinamicaFamiliar.value = false
    erroSalvamentoDinamicaFamiliar.value = null
    salvandoCondicoesSocioeconomicas.value = false
    erroSalvamentoCondicoesSocioeconomicas.value = null
    salvandoDiagnostico.value = false
    erroSalvamentoDiagnostico.value = null
    salvandoHipotesesCondutas.value = false
    erroSalvamentoHipotesesCondutas.value = null
    salvandoProcedimentos.value = false
    erroSalvamentoProcedimentos.value = null
    salvandoDadosExternos.value = false
    erroSalvamentoDadosExternos.value = null
    finalizandoConsulta.value = false
    erroFinalizarConsulta.value = null
    activeSection.value = 'anthropometric'
    completedSections.value = new Set()
    startedSections.value = new Set()
    statusMarcos.value = {}
    observacoesMarcos.value = {}
    classificacaoDesenvolvimento.value = null
    antropometria.value = criarAntropometriaVazia()
    anamnese.value = criarAnamneseVazia()
    imunizacoes.value = criarImunizacoesVazia()
    escolaridade.value = criarEscolaridadeVazia()
    triagemNeonatal.value = criarTriagemNeonatalVazia()
    encaminhamentos.value = []
    historiaFamiliar.value = criarHistoriaFamiliarVazia()
    dinamicaFamiliar.value = criarDinamicaFamiliarVazia()
    condicoesSocioeconomicas.value = criarCondicoesSocioeconomicasVazia()
    diagnostico.value = criarDiagnosticoVazio()
    hipotesesCondutas.value = criarHipotesesCondutasVazia()
    procedimentos.value = criarProcedimentosVazio()
    dadosExternos.value = []
    historicoImunizacoes.value = []
  }

  return {
    activeSection,
    completedSections,
    startedSections,
    consultaIniciada,
    consultaAtivaId,
    currentPacienteId,
    antropometria,
    anamnese,
    imunizacoes,
    escolaridade,
    triagemNeonatal,
    encaminhamentos,
    historiaFamiliar,
    dinamicaFamiliar,
    condicoesSocioeconomicas,
    diagnostico,
    hipotesesCondutas,
    procedimentos,
    dadosExternos,
    historicoImunizacoes,
    salvandoAntropometria,
    erroSalvamentoAntropometria,
    salvandoAnamnese,
    erroSalvamentoAnamnese,
    salvandoImunizacoes,
    erroSalvamentoImunizacoes,
    salvandoEscolaridade,
    erroSalvamentoEscolaridade,
    salvandoTriagemNeonatal,
    erroSalvamentoTriagemNeonatal,
    salvandoEncaminhamentos,
    erroSalvamentoEncaminhamentos,
    salvandoHistoriaFamiliar,
    erroSalvamentoHistoriaFamiliar,
    salvandoDinamicaFamiliar,
    erroSalvamentoDinamicaFamiliar,
    salvandoCondicoesSocioeconomicas,
    erroSalvamentoCondicoesSocioeconomicas,
    salvandoDiagnostico,
    erroSalvamentoDiagnostico,
    salvandoHipotesesCondutas,
    erroSalvamentoHipotesesCondutas,
    salvandoProcedimentos,
    erroSalvamentoProcedimentos,
    salvandoDadosExternos,
    erroSalvamentoDadosExternos,
    finalizandoConsulta,
    erroFinalizarConsulta,
    secoes,
    currentIndex,
    canGoPrev,
    canGoNext,
    statusMarcos,
    observacoesMarcos,
    classificacaoDesenvolvimento,
    totalMarcosRegistrados,
    iniciarConsulta,
    prepararConsultaPaciente,
    setActiveSection,
    markSectionStarted,
    markSectionComplete,
    setSectionComplete,
    carregarConsultaAtiva,
    carregarHistoricoImunizacoes,
    salvarAntropometria,
    salvarAnamnese,
    salvarImunizacoes,
    salvarEscolaridade,
    salvarTriagemNeonatal,
    salvarEncaminhamentos,
    salvarHistoriaFamiliar,
    salvarDinamicaFamiliar,
    salvarCondicoesSocioeconomicas,
    salvarDiagnostico,
    salvarHipotesesCondutas,
    salvarProcedimentos,
    salvarDadosExternos,
    finalizarConsulta,
    atualizarAnamnese,
    atualizarCampoAnamnese,
    atualizarStatusVacinal,
    atualizarEscolaridade,
    atualizarCampoEscolaridade,
    atualizarTriagemNeonatal,
    atualizarHistoriaFamiliar,
    atualizarCampoHistoriaFamiliar,
    atualizarDinamicaFamiliar,
    atualizarCampoDinamicaFamiliar,
    atualizarCondicoesSocioeconomicas,
    atualizarCampoCondicoesSocioeconomicas,
    atualizarCampoDiagnostico,
    atualizarHipotesesCondutas,
    atualizarCampoHipotesesCondutas,
    atualizarProcedimentos,
    atualizarRealizadosProcedimentos,
    adicionarProcedimento,
    removerProcedimento,
    atualizarCampoProcedimento,
    adicionarDadoExterno,
    removerDadoExterno,
    atualizarCampoDadoExterno,
    adicionarCidSecundario,
    removerCidSecundario,
    atualizarCampoCidSecundario,
    alternarOpcaoDisciplina,
    adicionarEncaminhamento,
    removerEncaminhamento,
    atualizarCampoEncaminhamento,
    goNext,
    goPrev,
    resetConsulta,
    toggleStatusMarco,
    getStatusMarco,
    setObservacaoMarco,
    getObservacaoMarco,
    setClassificacao,
    exameFisico,
    avaliadosCount,
    allStatusesSelected,
    updateSistemaStatus,
    updateSistemaDescricao,
  }
})
