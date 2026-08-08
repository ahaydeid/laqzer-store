-- Migration: Convert products.id column from TEXT to UUID for type safety & performance
ALTER TABLE public.products 
ALTER COLUMN id TYPE UUID USING id::uuid;
