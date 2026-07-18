-- Migration 07: Create campaigns table for product discount campaigns
CREATE TABLE IF NOT EXISTS public.campaigns (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name        TEXT NOT NULL,
  product_id           TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  original_price       NUMERIC(12, 2) NOT NULL,
  price_after_discount NUMERIC(12, 2) NOT NULL,
  discount_percent     NUMERIC(5, 2) NOT NULL,
  is_active            BOOLEAN NOT NULL DEFAULT true,
  start_date           DATE NOT NULL,
  end_date             DATE NOT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Allow public read access (to display active campaigns)
CREATE POLICY "Allow public read access on campaigns"
  ON public.campaigns FOR SELECT
  USING (true);

-- Allow authenticated users (admin) to manage campaigns
CREATE POLICY "Allow admin full access on campaigns"
  ON public.campaigns FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
