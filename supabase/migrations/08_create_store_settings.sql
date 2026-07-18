-- Migration 08: Add popup ad config columns to store_settings
-- Create store_settings table if not exists
CREATE TABLE IF NOT EXISTS public.store_settings (
  id          SERIAL PRIMARY KEY,
  key         TEXT NOT NULL UNIQUE,
  value       JSONB
);

-- Enable RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on store_settings" ON public.store_settings;
DROP POLICY IF EXISTS "Allow full access on store_settings" ON public.store_settings;

CREATE POLICY "Allow public read on store_settings"
  ON public.store_settings FOR SELECT USING (true);

CREATE POLICY "Allow full access on store_settings"
  ON public.store_settings FOR ALL USING (true) WITH CHECK (true);

-- Insert default popup config
INSERT INTO public.store_settings (key, value)
VALUES (
  'popup_ad',
  '{
    "isActive": false,
    "title": "MEGA SUMMER SALE!",
    "description": "Dapatkan diskon hingga 60% untuk semua kategori. Penawaran terbatas hanya minggu ini!",
    "imageUrl": "",
    "buttonText": "Belanja Sekarang",
    "targetUrl": "/"
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- Insert default shipping couriers configuration (6 main couriers enabled by default)
INSERT INTO public.store_settings (key, value)
VALUES (
  'shipping_couriers',
  '{"jne": true, "sicepat": true, "jnt": true, "tiki": true, "pos": true, "anteraja": true}'::jsonb
)
ON CONFLICT (key) DO NOTHING;
