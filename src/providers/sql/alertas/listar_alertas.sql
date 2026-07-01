SELECT id, paciente_id, tipo, categoria, mensagem, created_at, updated_at
FROM alertas
WHERE deleted_at IS NULL
  AND (:paciente_id IS NULL OR paciente_id = :paciente_id)
  AND (:categoria IS NULL OR categoria = :categoria)
ORDER BY created_at DESC
