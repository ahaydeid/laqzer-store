-- Migration 05: Add variants column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS variants TEXT[] DEFAULT '{}';
