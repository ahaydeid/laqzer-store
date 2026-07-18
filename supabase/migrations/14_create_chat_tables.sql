-- Migration 14: Create chat_rooms and chat_messages tables for Realtime Chat
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_session_id   TEXT NULL,
  user_name          TEXT NOT NULL DEFAULT 'Pengunjung',
  user_email         TEXT NULL,
  unread_count_admin INT NOT NULL DEFAULT 0,
  unread_count_user  INT NOT NULL DEFAULT 0,
  last_message       TEXT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id          UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_type      TEXT NOT NULL CHECK (sender_type IN ('user', 'admin')),
  sender_id        UUID NULL,
  text             TEXT NOT NULL DEFAULT '',
  product_metadata JSONB NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS & Policies
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Open RLS policies to support guest buyers & authenticated users/admins
CREATE POLICY "Allow public read chat_rooms" ON public.chat_rooms FOR SELECT USING (true);
CREATE POLICY "Allow public insert chat_rooms" ON public.chat_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update chat_rooms" ON public.chat_rooms FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read chat_messages" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert chat_messages" ON public.chat_messages FOR INSERT WITH CHECK (true);

-- Enable Supabase Realtime for chat tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
