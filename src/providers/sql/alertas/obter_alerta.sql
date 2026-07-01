SELECT id, paciente_id, tipo, categoria, mensagem, created_at, updated_at, deleted_at
FROM alertas
WHERE id = :id
