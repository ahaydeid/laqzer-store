-- Migration 25: Reset initial rating and sold_count in products table to pure 0
UPDATE public.products
SET rating = 0.0,
    sold_count = 0;
