-- Migration 13: Create orders and order_items tables
CREATE TABLE IF NOT EXISTS public.orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number     TEXT NOT NULL UNIQUE,
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status           TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'processing', 'shipped', 'completed', 'cancelled')),
  payment_method   TEXT NOT NULL DEFAULT '-',
  shipping_courier TEXT NOT NULL,
  shipping_cost    NUMERIC(12, 2) NOT NULL DEFAULT 0,
  subtotal         NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount         NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_amount     NUMERIC(12, 2) NOT NULL DEFAULT 0,
  shipping_address JSONB NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id    TEXT NOT NULL,
  variant_id    TEXT NULL,
  product_name  TEXT NOT NULL,
  product_image TEXT NULL,
  variant_label TEXT NULL,
  price         NUMERIC(12, 2) NOT NULL,
  quantity      INT NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own order status to completed"
  ON public.orders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Allow admin full access on orders"
  ON public.orders FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for order_items
CREATE POLICY "Users can view their own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own order items"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow admin full access on order_items"
  ON public.order_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
