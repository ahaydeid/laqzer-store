-- Migration 22: Convert products.id and all dependent foreign keys (wishlists, cart_items) from TEXT to UUID
-- 1. Drop existing FK constraints on dependent tables
ALTER TABLE public.wishlists DROP CONSTRAINT IF EXISTS fk_wishlists_products;
ALTER TABLE public.cart_items DROP CONSTRAINT IF EXISTS cart_items_product_id_fkey;

-- 2. Convert dependent product_id columns to UUID
ALTER TABLE public.wishlists ALTER COLUMN product_id TYPE UUID USING product_id::uuid;
ALTER TABLE public.cart_items ALTER COLUMN product_id TYPE UUID USING product_id::uuid;

-- 3. Convert primary products.id column to UUID
ALTER TABLE public.products ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.products ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE public.products ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 4. Re-add FK constraints with UUID type
ALTER TABLE public.wishlists 
  ADD CONSTRAINT fk_wishlists_products 
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.cart_items 
  ADD CONSTRAINT cart_items_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
