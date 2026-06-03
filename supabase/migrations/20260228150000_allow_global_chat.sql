-- Allow global chat messages (provincia_id = NULL)
ALTER TABLE mensajes_chat ALTER COLUMN provincia_id DROP NOT NULL;

-- Index for global chat queries
CREATE INDEX idx_mensajes_chat_global ON mensajes_chat (created_at DESC) WHERE provincia_id IS NULL;
