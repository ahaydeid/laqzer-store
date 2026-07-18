-- Seed initial new products to Supabase products table
INSERT INTO public.products (
  id,
  name,
  description,
  price,
  original_price,
  image_url,
  images,
  category,
  rating,
  sold_count,
  stock,
  is_campaign
) VALUES 
(
  'prod-sb-1',
  'Urban Waterproof Roll-top Backpack',
  'Tas punggung roll-top berkapasitas 25L dengan bahan TPU waterproof tahan hujan ekstrem. Dilengkapi kompartemen laptop 15.6 inci terpisah dan tali bahu ergonomis.',
  489000,
  699000,
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600',
  ARRAY[
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&q=80&w=600'
  ],
  'bag',
  4.9,
  142,
  85,
  false
),
(
  'prod-sb-2',
  'Oversized Fleece Hoodie - Midnight Black',
  'Sweater hoodie pria potongan oversized berbahan Heavyweight Cotton Fleece 330 Gsm. Sangat hangat, lembut di kulit, dan cocok untuk gaya streetwear modern.',
  359000,
  499000,
  'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=600',
  ARRAY[
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&q=80&w=600'
  ],
  'jacket',
  4.8,
  88,
  60,
  false
),
(
  'prod-sb-3',
  'Minimalist Chronograph Leather Watch',
  'Jam tangan analog pria dengan bezel stainless steel 316L presisi dan strap kulit asli Italia warna cokelat tan. Dilengkapi ketahanan air 5 ATM.',
  899000,
  1250000,
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600',
  ARRAY[
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=600'
  ],
  'watches',
  4.95,
  56,
  30,
  false
),
(
  'prod-sb-4',
  'AirFlex Breathable Running Sneakers',
  'Sepatu lari kasual pria dengan upper knit bernapas dan outsole phylon super empuk. Memberikan fleksibilitas tinggi dan kenyamanan maksimal saat berolahraga.',
  520000,
  750000,
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
  ARRAY[
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600'
  ],
  'shoes',
  4.85,
  210,
  110,
  false
),
(
  'prod-sb-5',
  'Slim Fit Stretch Chino Trousers',
  'Celana panjang chino pria berbahan katun twill stretch premium. Fleksibel, tahan lama, dan cocok untuk padu padan gaya kemeja maupun kaos.',
  275000,
  399000,
  'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=600',
  ARRAY[
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=600'
  ],
  'jeans',
  4.78,
  315,
  95,
  false
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  images = EXCLUDED.images,
  category = EXCLUDED.category,
  stock = EXCLUDED.stock;
