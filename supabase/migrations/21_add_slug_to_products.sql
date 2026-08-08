-- Migration 21: Add slug column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create function to slugify text in PostgreSQL
CREATE OR REPLACE FUNCTION slugify(v_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        trim(v_text),
        '[^a-zA-Z0-9\s-]', '', 'g'
      ),
      '[\s-]+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Populate initial slug values for existing products if slug is null
UPDATE public.products
SET slug = lower(regexp_replace(regexp_replace(trim(name), '[^a-zA-Z0-9\s-]', '', 'g'), '[\s-]+', '-', 'g')) || '-' || substr(id, 1, 8)
WHERE slug IS NULL OR slug = '';

-- Make slug column NOT NULL and UNIQUE after populating
ALTER TABLE public.products ALTER COLUMN slug SET NOT NULL;
ALTER TABLE public.products ADD CONSTRAINT products_slug_key UNIQUE (slug);
