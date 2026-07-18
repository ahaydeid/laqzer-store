-- Migration 19: Add foreign key constraint and indexes to wishlists
ALTER TABLE public.wishlists
  ADD CONSTRAINT fk_wishlists_products
  FOREIGN KEY (product_id) REFERENCES public.products(id)
  ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON public.wishlists(product_id);
