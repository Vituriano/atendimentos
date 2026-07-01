UPDATE alertas
SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
WHERE id = :id AND deleted_at IS NULL
