-- Migration 06: Update existing seed products with variants
UPDATE public.products SET variants = ARRAY['S', 'M', 'L', 'XL', 'XXL']
  WHERE id = '0190cf6e-7b80-71e1-b1d5-98305c4897f2'; -- Hoodie

UPDATE public.products SET variants = ARRAY['Coklat Tan', 'Hitam', 'Navy']
  WHERE id = '0190cf6e-7b80-71e1-b1d5-98305c4897f3'; -- Jam Tangan

UPDATE public.products SET variants = ARRAY['39', '40', '41', '42', '43', '44']
  WHERE id = '0190cf6e-7b80-71e1-b1d5-98305c4897f4'; -- Sneakers

UPDATE public.products SET variants = ARRAY['28', '30', '32', '34', '36']
  WHERE id = '0190cf6e-7b80-71e1-b1d5-98305c4897f5'; -- Chino
