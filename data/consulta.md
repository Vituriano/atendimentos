select pac.prontuario 
,case 
	when pac.nome_social is not null then pac.nome_social
	else pac.nome
end as nome
,pac.nome
,pac.nome_mae
,pac.nome_pai 
,pac.dt_nascimento
,pac.sexo 
,pac.sexo_biologico 
,pac.cor
,ar.descricao  as status
,esp.nome_especialidade
,con.ind_origem 
from agh.aip_pacientes pac
left join agh.aac_consultas con
on con.pac_codigo = pac.codigo
left join agh.aac_retornos ar
on ar.seq = con.ret_seq
left join agh.agh_atendimentos atd
on atd.con_numero = con.numero 
left join agh.agh_especialidades esp
on atd.esp_seq = esp.seq
where esp.nome_especialidade like '%PEDI%'