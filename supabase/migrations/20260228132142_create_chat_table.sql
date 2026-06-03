-- Chat messages per province
CREATE TABLE mensajes_chat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contenido TEXT NOT NULL CHECK (char_length(contenido) <= 500),
    autor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    provincia_id INT REFERENCES provincias(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast per-province queries
CREATE INDEX idx_mensajes_chat_provincia ON mensajes_chat (provincia_id, created_at DESC);

-- RLS
ALTER TABLE mensajes_chat ENABLE ROW LEVEL SECURITY;

-- Anyone can read
CREATE POLICY "Lectura pública de mensajes"
  ON mensajes_chat FOR SELECT
  USING (true);

-- Authenticated users can insert their own messages
CREATE POLICY "Usuarios pueden enviar mensajes"
  ON mensajes_chat FOR INSERT
  WITH CHECK (auth.uid() = autor_id);

-- Users can delete their own messages
CREATE POLICY "Usuarios pueden borrar sus mensajes"
  ON mensajes_chat FOR DELETE
  USING (auth.uid() = autor_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE mensajes_chat;
