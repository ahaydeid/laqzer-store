-- Migration 26: Drop kolom rating dan sold_count dari tabel products
-- Kedua kolom ini sudah tidak dipakai — rating dan sold count dihitung
-- secara riil dari tabel product_reviews dan order_items

ALTER TABLE public.products
  DROP COLUMN IF EXISTS rating,
  DROP COLUMN IF EXISTS sold_count;
