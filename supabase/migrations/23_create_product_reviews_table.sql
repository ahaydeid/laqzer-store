-- Migration: Create Product Reviews Table with Order ID uniqueness constraint
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    variant_label TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_order_product UNIQUE (order_id, product_id)
);

-- Index for high-performance lookup
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON public.product_reviews(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to ensure idempotent migration
DROP POLICY IF EXISTS "Allow public read access to product_reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Allow users to insert reviews for completed orders" ON public.product_reviews;

-- Allow public read access for all product reviews
CREATE POLICY "Allow public read access to product_reviews"
    ON public.product_reviews
    FOR SELECT
    USING (true);

-- Allow authenticated users to insert reviews for their own completed orders
CREATE POLICY "Allow users to insert reviews for completed orders"
    ON public.product_reviews
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
    );
