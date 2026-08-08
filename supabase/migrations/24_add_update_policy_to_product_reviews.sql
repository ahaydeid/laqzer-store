-- Migration 24: Add UPDATE RLS policy for product_reviews table
DROP POLICY IF EXISTS "Allow users to update their own reviews" ON public.product_reviews;

CREATE POLICY "Allow users to update their own reviews"
  ON public.product_reviews
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
