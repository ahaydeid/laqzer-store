-- Migration 16: Add user_avatar_url column to chat_rooms table
ALTER TABLE public.chat_rooms ADD COLUMN IF NOT EXISTS user_avatar_url TEXT NULL;
