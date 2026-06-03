-- Add FK from mensajes_chat.autor_id to profiles.id so PostgREST can join them
ALTER TABLE mensajes_chat
  ADD CONSTRAINT mensajes_chat_autor_profile_fkey
  FOREIGN KEY (autor_id) REFERENCES profiles(id) ON DELETE CASCADE;
