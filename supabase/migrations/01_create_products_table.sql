-- Create UUID v7 generator function (Time-Ordered UUID for optimal B-Tree index performance)
CREATE OR REPLACE FUNCTION generate_uuid_v7()
RETURNS uuid AS $$
DECLARE
  v_time double precision;
  v_sec bigint;
  v_msec bigint;
  v_timestamp bigint;
  v_timestamp_hex text;
  v_random_hex text;
BEGIN
  v_time := extract(epoch from clock_timestamp());
  v_sec := floor(v_time);
  v_msec := floor((v_time - v_sec) * 1000);
  v_timestamp := (v_sec * 1000) + v_msec;
  v_timestamp_hex := lpad(to_hex(v_timestamp), 12, '0');
  v_random_hex := encode(gen_random_bytes(10), 'hex');
  RETURN (
    substr(v_timestamp_hex, 1, 8) || '-' ||
    substr(v_timestamp_hex, 9, 4) || '-' ||
    '7' || substr(v_random_hex, 1, 3) || '-' ||
    to_hex((floor(random() * 4)::int + 8)) || substr(v_random_hex, 4, 3) || '-' ||
    substr(v_random_hex, 7, 12)
  )::uuid;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Create products table with UUID v7 as primary key default
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY DEFAULT generate_uuid_v7()::text,
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

-- Drop existing policies if any to prevent duplicate policy errors
DROP POLICY IF EXISTS "Allow public read access" ON public.products;
DROP POLICY IF EXISTS "Allow full access for all" ON public.products;

-- Allow public read access
CREATE POLICY "Allow public read access" ON public.products
  FOR SELECT USING (true);

-- Allow full access for all (Dev / Admin)
CREATE POLICY "Allow full access for all" ON public.products
  FOR ALL USING (true) WITH CHECK (true);
