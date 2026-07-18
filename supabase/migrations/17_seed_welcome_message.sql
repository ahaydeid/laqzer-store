-- Migration 17: Seed default welcome_message into store_settings
INSERT INTO public.store_settings (key, value)
VALUES (
  'welcome_message',
  '{
    "enabled": true,
    "text": "Halo! Selamat datang di Laqzer Indonesia. Ada yang bisa kami bantu hari ini?"
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;
