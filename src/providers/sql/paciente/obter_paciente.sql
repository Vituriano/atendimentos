-- Retorna dados completos de um paciente pelo prontuário
SELECT
    pac.prontuario,
    CASE WHEN pac.nome_social IS NOT NULL THEN pac.nome_social ELSE pac.nome END AS nome,
    pac.nome                    AS nome_completo,
    pac.nome_mae,
    pac.nome_pai,
    pac.dt_nascimento,
    pac.sexo,
    pac.sexo_biologico,
    pac.cor,
    ar.descricao                AS status,
    esp.nome_especialidade,
    con.ind_origem,
    -- TODO: confirmar coluna de faltas no AGHU com o DBA (ex: COUNT de aac_consultas com ind_falta = 'S')
    0                            AS faltas
FROM agh.aip_pacientes pac
LEFT JOIN agh.aac_consultas con ON con.pac_codigo = pac.codigo
LEFT JOIN agh.aac_retornos ar ON ar.seq = con.ret_seq
LEFT JOIN agh.agh_atendimentos atd ON atd.con_numero = con.numero
LEFT JOIN agh.agh_especialidades esp ON atd.esp_seq = esp.seq
WHERE pac.prontuario = :prontuario;
