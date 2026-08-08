-- Migration 22: Convert products.id and ALL dependent foreign keys from TEXT to UUID

-- 1. Automatically detect and drop ALL foreign key constraints pointing to public.products(id)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tc.table_schema, tc.table_name, tc.constraint_name 
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND ccu.table_name = 'products'
          AND ccu.column_name = 'id'
    ) LOOP
        EXECUTE 'ALTER TABLE ' || quote_ident(r.table_schema) || '.' || quote_ident(r.table_name) || ' DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

-- 2. Convert ALL dependent product_id columns from TEXT to UUID
ALTER TABLE public.wishlists ALTER COLUMN product_id TYPE UUID USING product_id::uuid;
ALTER TABLE public.cart_items ALTER COLUMN product_id TYPE UUID USING product_id::uuid;
ALTER TABLE public.campaigns ALTER COLUMN product_id TYPE UUID USING product_id::uuid;
ALTER TABLE public.order_items ALTER COLUMN product_id TYPE UUID USING product_id::uuid;

-- 3. Drop default and convert primary products.id column to UUID
ALTER TABLE public.products ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.products ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE public.products ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 4. Re-add ALL foreign key constraints referencing public.products(id) with UUID type
ALTER TABLE public.wishlists 
  ADD CONSTRAINT fk_wishlists_products 
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.cart_items 
  ADD CONSTRAINT cart_items_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.campaigns 
  ADD CONSTRAINT campaigns_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
