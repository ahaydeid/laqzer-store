-- Add weight column (in grams) with default value of 500g to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS weight INT NOT NULL DEFAULT 500;
