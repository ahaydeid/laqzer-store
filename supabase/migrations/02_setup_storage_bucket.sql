-- Create public storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if any to prevent duplicate policy errors
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert Access" ON storage.objects;

-- Allow public read access
CREATE POLICY "Public Read Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

-- Allow public insert access for uploading product images
CREATE POLICY "Public Insert Access" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'products');
