-- Migration 12: Create vouchers table for shopping discount vouchers
CREATE TABLE IF NOT EXISTS public.vouchers (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code           TEXT NOT NULL UNIQUE,
  campaign_name  TEXT NOT NULL,
  type           TEXT NOT NULL CHECK (type IN ('percent', 'nominal')),
  value          NUMERIC(12, 2) NOT NULL,
  min_purchase   NUMERIC(12, 2) NOT NULL DEFAULT 0,
  max_discount   NUMERIC(12, 2) NULL,
  quota          INT NOT NULL DEFAULT 100,
  used_count     INT NOT NULL DEFAULT 0,
  expiry_date    DATE NOT NULL,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for checking and validating vouchers)
CREATE POLICY "Allow public read access on vouchers"
  ON public.vouchers FOR SELECT
  USING (true);

-- Allow authenticated users (admin) to manage vouchers
CREATE POLICY "Allow admin full access on vouchers"
  ON public.vouchers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Seed initial voucher data
INSERT INTO public.vouchers (code, campaign_name, type, value, min_purchase, quota, expiry_date, is_active)
VALUES 
  ('LAQZERBARU', 'Promo Pelanggan Baru', 'percent', 10, 150000, 100, '2026-12-31', true),
  ('HEMAT50K', 'Promo Gajian Akhir Bulan', 'nominal', 50000, 300000, 50, '2026-12-31', true),
  ('FREEONGKIR', 'Gratis Ongkos Kirim', 'nominal', 20000, 100000, 200, '2026-12-31', true)
ON CONFLICT (code) DO NOTHING;
