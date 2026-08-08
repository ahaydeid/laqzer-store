-- Migration: Convert products.id column from TEXT to UUID
ALTER TABLE public.products ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.products ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE public.products ALTER COLUMN id SET DEFAULT gen_random_uuid();
