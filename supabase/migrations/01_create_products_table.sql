-- Create products table for Supabase
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  image_url TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  category TEXT NOT NULL,
  rating NUMERIC DEFAULT 5.0,
  sold_count INT DEFAULT 0,
  stock INT NOT NULL DEFAULT 0,
  sold_progress INT DEFAULT 0,
  is_campaign BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (prevents 42710 policy already exists error)
DROP POLICY IF EXISTS "Allow public read access" ON public.products;
DROP POLICY IF EXISTS "Allow full access for all" ON public.products;

-- Allow public read access
CREATE POLICY "Allow public read access" ON public.products
  FOR SELECT USING (true);

-- Allow full access for all (Dev / Admin)
CREATE POLICY "Allow full access for all" ON public.products
  FOR ALL USING (true) WITH CHECK (true);
