-- Migration 27: Allow public read on order_items
-- order_items tidak mengandung PII langsung (tidak ada user_id).
-- Policy ini diperlukan agar server-side (anon key) dapat membaca
-- agregasi sold_count per produk tanpa terblokir RLS.

CREATE POLICY "Allow public read on order_items"
  ON public.order_items FOR SELECT
  USING (true);
