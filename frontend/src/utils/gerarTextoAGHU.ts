import type { Paciente } from '../types/clinica'
import type {
  DadosAntropometricosConsulta,
  DadosAnamneseConsulta,
  DadosImunizacoesConsulta,
  DadosTriagemNeonatalConsulta,
  DadosEscolaridadeConsulta,
  EncaminhamentoConsulta,
  DadosHistoriaFamiliarConsulta,
  DadosDinamicaFamiliarConsulta,
  DadosCondicoesSocioeconomicasConsulta,
  DadosDiagnosticoConsulta,
  DadosHipotesesCondutasConsulta,
  DadosProcedimentosConsulta,
  ClassificacaoDesenvolvimento,
  TesteTriagemNeonatal,
} from '../stores/consulta'
import type { StatusMarco, ExameFisico } from '../types/clinica'

const SISTEMAS_LABELS: Record<keyof ExameFisico, string> = {
  geral: 'Geral',
  pele: 'Pele',
  olhos: 'Olhos',
  ouvidos: 'Ouvidos',
  bocaDentes: 'Boca e Dentes',
  cabeca: 'Cabeça',
  ganglios: 'Gânglios Linfáticos',
  pescoco: 'Pescoço',
  cardiovascular: 'Cardiovascular',
  respiratorio: 'Respiratório',
  gastrointestinal: 'Gastrointestinal',
  genitourinario: 'Genitourinário',
  musculoesqueletico: 'Musculoesquelético',
  nervoso: 'Sistema Nervoso'
}

type ExameFisicoForm = {
  [K in keyof ExameFisico]: { status: string; descricao: string }
}

function pad(label: string): string {
  return label.padEnd(14)
}

function v(val: string | null | undefined, fallback = '—'): string {
  return val && val.trim() ? val.trim() : fallback
}

function coletasTexto(label: string, coletas: TesteTriagemNeonatal[]): string {
  const preenchidas = coletas.filter(c => c.resultado || c.data || c.descricao.trim())
  const lista = preenchidas.length > 0 ? preenchidas : coletas.slice(0, 1)
  return lista
    .map((coleta, index) => {
      const nome = lista.length > 1 ? `${label} (${index + 1})` : label
      return `${nome.padEnd(21)}: ${v(coleta.resultado)} ${coleta.data ? `(${coleta.data})` : ''} ${v(coleta.descricao, '')}\n`
    })
    .join('')
}

function bool(val: boolean | null | undefined): string {
  return val === null || val === undefined ? '—' : val ? 'Sim' : 'Nao'
}

function classificacaoLabel(val: ClassificacaoDesenvolvimento | null): string {
  const map: Record<ClassificacaoDesenvolvimento, string> = {
    adequado: 'Adequado para a idade',
    alerta: 'Alerta para o desenvolvimento',
    'provavel-atraso': 'Provavel atraso no desenvolvimento',
  }
  return val ? map[val] : 'Nao classificado'
}

export interface ParamsGerarTextoAGHU {
  paciente: Paciente
  tipoEntrada: string
  duracaoMinutos: number
  is0to2: boolean
  is3to9: boolean
  antropometria: DadosAntropometricosConsulta
  anamnese: DadosAnamneseConsulta
  imunizacoes: DadosImunizacoesConsulta
  triagemNeonatal: DadosTriagemNeonatalConsulta
  escolaridade: DadosEscolaridadeConsulta
  encaminhamentos: EncaminhamentoConsulta[]
  historiaFamiliar: DadosHistoriaFamiliarConsulta
  dinamicaFamiliar: DadosDinamicaFamiliarConsulta
  condicoesSocioeconomicas: DadosCondicoesSocioeconomicasConsulta
  diagnostico: DadosDiagnosticoConsulta
  hipotesesCondutas: DadosHipotesesCondutasConsulta
  procedimentos: DadosProcedimentosConsulta
  statusMarcos: Record<string, StatusMarco | null>
  marcosDoGrupo: { id: string; nome: string }[]
  idadeEmMeses: number
  classificacaoDesenvolvimento: ClassificacaoDesenvolvimento | null
  exameFisico: ExameFisicoForm
}

export function gerarTextoAGHU(p: ParamsGerarTextoAGHU): string {
  const hoje = new Date().toLocaleDateString('pt-BR')
  const duracao = `${p.duracaoMinutos} min`

  const pa = p.antropometria.pressaoSistolicaMmHg && p.antropometria.pressaoDiastolicaMmHg
    ? `${p.antropometria.pressaoSistolicaMmHg}/${p.antropometria.pressaoDiastolicaMmHg} mmHg`
    : 'nao aferida'

  const examesTrazidosTexto = p.anamnese.clinica.examesTrazidos.length > 0
    ? `Exames trazidos pelo paciente:\n${p.anamnese.clinica.examesTrazidos.map(item => `  - ${v(item.exame)}: ${v(item.analise)}`).join('\n')}`
    : ''

  let texto = `================================================
   ATENDIMENTO PEDIATRICO - HC/UFPE
================================================

${pad('Paciente')}  : ${p.paciente.nome}
${pad('Prontuario')}  : ${p.paciente.prontuario}
${pad('Data Nasc.')}  : ${p.paciente.dataNascimento}
${pad('Idade')}  : ${p.paciente.idade}
${pad('Data')}  : ${hoje}
${pad('Tipo')}  : ${p.tipoEntrada}
${pad('Duracao')}  : ${duracao}

--- ANTROPOMETRIA -----------------------------------
${pad('Peso')}  : ${p.antropometria.pesoKg ?? '—'} kg
${pad('Altura')}  : ${p.antropometria.alturaCm ?? '—'} cm
${pad('PC')}  : ${p.antropometria.perimetroCefalicoCm ? `${p.antropometria.perimetroCefalicoCm} cm` : 'nao aferido'}
${pad('PA')}  : ${pa}
${pad('IMC')}  : ${p.antropometria.imc ? `${p.antropometria.imc} kg/m2` : '—'}${p.antropometria.classificacaoImc ? ` (${p.antropometria.classificacaoImc})` : ''}

--- ANAMNESE ----------------------------------------
Queixa principal: ${v(p.anamnese.clinica.queixaPrincipal)}
${p.anamnese.clinica.historiaDoencaAtual ? `\nHDA:\n${p.anamnese.clinica.historiaDoencaAtual}\n` : ''}
${p.anamnese.clinica.medicacoesRotina ? `Medicacoes de rotina: ${p.anamnese.clinica.medicacoesRotina}` : ''}
${examesTrazidosTexto}
${p.anamnese.clinica.antecedentesDoencas ? `Antecedentes pessoais: ${p.anamnese.clinica.antecedentesDoencas}` : ''}

--- ANTECEDENTES GESTACIONAIS E PERINATAIS ----------
${pad('IG ao nascer')}  : ${p.anamnese.clinica.antecedentesPerinatais.periNeonatal.idadeGestacionalSemanas ? `${p.anamnese.clinica.antecedentesPerinatais.periNeonatal.idadeGestacionalSemanas} semanas` : '—'}
${pad('Tipo de parto')}  : ${v(p.anamnese.clinica.antecedentesPerinatais.periNeonatal.tipoParto)}
${pad('Apgar')}  : ${v(p.anamnese.clinica.antecedentesPerinatais.periNeonatal.apgar)}
${pad('Peso nasc.')}  : ${p.anamnese.clinica.antecedentesPerinatais.periNeonatal.pesoNascimentoGramas ? `${p.anamnese.clinica.antecedentesPerinatais.periNeonatal.pesoNascimentoGramas} g` : '—'}
${pad('Classificacao')}  : ${v(p.anamnese.clinica.antecedentesPerinatais.periNeonatal.classificacaoPesoNascimento.toUpperCase(), 'Nao classificado')}

--- ALIMENTACAO -------------------------------------
Tipo: ${v(p.anamnese.alimentacao.tipoAleitamento)}
${p.anamnese.alimentacao.cardapioCafe ? `Cafe da manha: ${p.anamnese.alimentacao.cardapioCafe}` : ''}
${p.anamnese.alimentacao.cardapioLancheManha ? `Lanche da manha: ${p.anamnese.alimentacao.cardapioLancheManha}` : ''}
${p.anamnese.alimentacao.cardapioAlmoco ? `Almoco: ${p.anamnese.alimentacao.cardapioAlmoco}` : ''}
${p.anamnese.alimentacao.cardapioLancheTarde ? `Lanche da tarde: ${p.anamnese.alimentacao.cardapioLancheTarde}` : ''}
${p.anamnese.alimentacao.cardapioJantar ? `Jantar: ${p.anamnese.alimentacao.cardapioJantar}` : ''}
${p.anamnese.alimentacao.cardapioCeia ? `Ceia: ${p.anamnese.alimentacao.cardapioCeia}` : ''}
Local das refeicoes: ${v(p.anamnese.alimentacao.localRefeicoes)}
Tela durante refeicoes: ${bool(p.anamnese.alimentacao.usoTelaRefeicoes)}

--- HABITOS -----------------------------------------
Sono:
  Horario: ${v(p.anamnese.habitos.sonoHorario)}
  Local: ${v(p.anamnese.habitos.sonoLocal)}
  Higiene: ${v(p.anamnese.habitos.sonoHigiene)}
  Alteracoes: ${v(p.anamnese.habitos.sonoAlteracoes, 'Nenhuma relatada')}

Telas:
  Dispositivos: ${p.anamnese.habitos.telasDispositivos.length > 0 ? p.anamnese.habitos.telasDispositivos.join(', ') : '—'}
  Tempo diario: ${v(p.anamnese.habitos.telasTempoDiario)}

Outros:
  Chupeta/chupa-dedo: ${v(p.anamnese.habitos.chupetaChupaDedo)}
  Higiene dentaria: ${v(p.anamnese.habitos.higieneDentaria)}
  Atividades recreativas: ${v(p.anamnese.habitos.atividadesRecreativas)}

--- IMUNIZACOES -------------------------------------
${v(p.imunizacoes.statusVacinal, 'Nao informado')}
`

  if (p.is0to2) {
    const tn = p.triagemNeonatal
    texto += `
--- TRIAGEM NEONATAL --------------------------------
${tn.hipotesesDiagnosticasAnteriores ? `Hipoteses diagnosticas anteriores: ${tn.hipotesesDiagnosticasAnteriores}\n` : ''}${coletasTexto('Teste do Pezinho', tn.testePezinho)}${coletasTexto('Teste da Orelhinha', tn.testeOrelhinha)}${coletasTexto('Teste do Olhinho', tn.testeOlhinho)}${coletasTexto('Fundo de olho', tn.testeFundoDeOlho)}${coletasTexto('Teste do Coracaozinho', tn.testeCoracaozinho)}`
  }

  if (p.is3to9) {
    const esc = p.escolaridade
    if (esc.frequentaEscolaCreche !== null) {
      texto += `
--- ESCOLARIDADE ------------------------------------
Frequenta escola/creche: ${bool(esc.frequentaEscolaCreche)}
${esc.frequentaEscolaCreche ? `Ano/serie: ${v(esc.anoSerie)}` : ''}
Reprovacao: ${bool(esc.houveReprovacao)}
Rendimento/relacionamento: ${v(esc.rendimentoRelacionamento)}
`
    }
  }

  texto += `
--- EXAME FISICO ------------------------------------
`
  for (const [key, label] of Object.entries(SISTEMAS_LABELS)) {
    const sistema = p.exameFisico[key as keyof ExameFisico]
    if (!sistema || sistema.status === '') {
      texto += `${label.padEnd(22)}: Nao avaliado\n`
    } else if (sistema.status === 'normal') {
      texto += `${label.padEnd(22)}: Normal\n`
    } else {
      texto += `${label.padEnd(22)}: Alterado - ${sistema.descricao || '(sem descricao)'}\n`
    }
  }

  texto += `
--- MARCOS DO DESENVOLVIMENTO -----------------------
Faixa etaria: ${p.idadeEmMeses} meses
Avaliados nesta consulta:
`
  for (const marco of p.marcosDoGrupo) {
    const colAtual = p.idadeEmMeses
    const key = `${marco.id}-${colAtual}`
    const status = p.statusMarcos[key]
    if (status === 'confirmed') texto += `  [OK] ${marco.nome}\n`
    else if (status === 'not-achieved') texto += `  [X]  ${marco.nome}\n`
    else if (status === 'not-verified') texto += `  [NV] ${marco.nome} (nao verificado)\n`
    else texto += `  [-]  ${marco.nome} (nao avaliado)\n`
  }
  texto += `\nClassificacao do desenvolvimento: ${classificacaoLabel(p.classificacaoDesenvolvimento)}\n`

  if (p.encaminhamentos.length > 0) {
    texto += `
--- ENCAMINHAMENTOS ---------------------------------
`
    p.encaminhamentos.forEach((enc, i) => {
      texto += `${i + 1}. ${enc.especialidade} - ${enc.procedimentoMotivo}
     Prioridade: ${enc.prioridade}
     Justificativa: ${enc.justificativaClinica}
`
    })
  }

  texto += `
--- DIAGNOSTICO -------------------------------------
${pad('CID-10 princ.')}  : ${v(p.diagnostico.cid10Principal)}

--- HIPOTESES E CONDUTAS ----------------------------
${p.hipotesesCondutas.hipotesesDiagnosticas ? `Hipoteses diagnosticas:\n${p.hipotesesCondutas.hipotesesDiagnosticas}\n` : ''}${p.hipotesesCondutas.condutasPlanoCuidado ? `Condutas:\n${p.hipotesesCondutas.condutasPlanoCuidado}` : 'Nenhuma conduta registrada.'}
`

  if (p.procedimentos.realizados && p.procedimentos.procedimentos.length > 0) {
    texto += `
--- PROCEDIMENTOS REALIZADOS ------------------------
`
    p.procedimentos.procedimentos.forEach((proc, i) => {
      texto += `${i + 1}. ${proc.procedimento}  Qtd: ${proc.quantidade ?? '—'}  CID: ${v(proc.cidVinculado)}\n`
      if (proc.observacoes) texto += `     ${proc.observacoes}\n`
    })
  }

  if (p.is3to9) {
    const hf = p.historiaFamiliar
    if (hf.maternalIdade || hf.paternalIdade || hf.irmaosSaude) {
      texto += `
--- HISTORIA FAMILIAR -------------------------------
Mae: ${v(hf.maternalIdade)} anos | ${v(hf.maternalSaude)} | ${v(hf.maternalOcupacao)}
Pai: ${v(hf.paternalIdade)} anos | ${v(hf.paternalSaude)} | ${v(hf.paternalOcupacao)}
Coabitacao dos pais: ${v(hf.coabitacaoPais)}
Irmaos: ${v(hf.irmaosSaude)}
`
    }

    const df = p.dinamicaFamiliar
    if (df.relacionamentoCompanheiro || df.fumanteDomicilio !== null) {
      texto += `
--- DINAMICA FAMILIAR -------------------------------
Relacionamento conjugal: ${v(df.relacionamentoCompanheiro)}
Resolucao de desentendimentos: ${v(df.resolucaoDesentendimentos)}
Fumante no domicilio: ${bool(df.fumanteDomicilio)}
Uso de alcool/drogas: ${bool(df.usoAlcoolDrogas)}
Inseguranca alimentar: ${bool(df.insegurancaAlimentar)}
Familiar preso: ${bool(df.familiarPreso)}
Preocupacao com comportamento: ${bool(df.preocupacaoComportamento)}
Disciplina: ${df.disciplinaOpcoes.length > 0 ? df.disciplinaOpcoes.join(', ') : '—'}
`
    }

    const se = p.condicoesSocioeconomicas
    if (se.tipoCasa || se.atualizadoEm) {
      texto += `
--- CONDICOES SOCIOECONOMICAS -----------------------
Renda familiar: ${se.rendaNaoInformada ? 'Nao informado' : v(se.rendaFamiliar)}
Tipo de casa: ${v(se.tipoCasa)}
Comodos: ${se.numeroComodos ?? '—'}
Banheiro: ${v(se.banheiro)}
Quarto da crianca: ${v(se.quartoCrianca)}
Animais domesticos: ${v(se.presencaAnimais)}
Agua encanada: ${bool(se.aguaEncanada)}
Energia eletrica: ${bool(se.energiaEletrica)}
Esgoto: ${v(se.esgoto)}
Coleta de lixo: ${bool(se.coletaLixo)}
Area de violencia: ${bool(se.areaViolencia)}
`
    }
  }

  return texto
}

export function gerarTextoEncaminhamento(
  enc: EncaminhamentoConsulta,
  paciente: Paciente,
  diagnostico: DadosDiagnosticoConsulta,
  antropometria: DadosAntropometricosConsulta,
): string {
  const hoje = new Date().toLocaleDateString('pt-BR')
  return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOSPITAL DAS CLINICAS — UFPE
AMBULATORIO DE PEDIATRIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ENCAMINHAMENTO

Paciente  : ${paciente.nome}
Prontuario: ${paciente.prontuario}
Data Nasc.: ${paciente.dataNascimento}   Idade: ${paciente.idade}
Data      : ${hoje}

Encaminhar para: ${enc.especialidade.toUpperCase()}
Procedimento   : ${enc.procedimentoMotivo}
Prioridade     : ${enc.prioridade}

Justificativa clinica:
${enc.justificativaClinica}

Dados clinicos relevantes:
  Peso  : ${antropometria.pesoKg ?? '—'} kg
  Altura: ${antropometria.alturaCm ?? '—'} cm
  IMC   : ${antropometria.imc ?? '—'} kg/m2
  CID-10: ${diagnostico.cid10Principal || '—'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Medico / Enfermeiro responsavel:

_____________________________________________
Nome: ______________________   CRM/COREN: ___
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
}
