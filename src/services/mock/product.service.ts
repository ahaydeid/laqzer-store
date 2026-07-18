import { IProductService } from '@/core/interfaces/product.interface'
import { Product } from '@/core/types/product'

const MOCK_PRODUCTS: Product[] = [
  // Flash Sale Items
  {
    id: 'fs-1',
    name: 'EliteShield Performance Men\'s Jacket',
    description: 'Jaket windbreaker premium tahan air untuk perlindungan maksimal aktivitas outdoor.',
    price: 255000,
    originalPrice: 526000,
    imageUrl: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=600',
    category: 'jacket',
    rating: 4.9,
    soldCount: 90,
    stock: 100,
    soldProgress: 90, // 90%
    isCampaign: true,
  },
  {
    id: 'fs-2',
    name: 'Gentlemen\'s Summer Gray Hat - Premium Blend',
    description: 'Topi kasual bernuansa musim panas dengan bahan katun premium berongga udara.',
    price: 99000,
    originalPrice: 150000,
    imageUrl: 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&q=80&w=600',
    category: 'cap',
    rating: 4.8,
    soldCount: 18,
    stock: 20,
    soldProgress: 90, // 90%
    isCampaign: true,
  },
  {
    id: 'fs-3',
    name: 'OptiZoom Camera Shoulder Bag',
    description: 'Tas selempang kamera dengan bantalan busa tebal pelindung lensa dan bodi DSLR.',
    price: 250000,
    originalPrice: 425000,
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600',
    category: 'bag',
    rating: 4.7,
    soldCount: 15,
    stock: 30,
    soldProgress: 50, // 50%
    isCampaign: true,
  },
  {
    id: 'fs-4',
    name: 'Cloudy Chic - Grey Peep Toe Heeled Sandals',
    description: 'Sandal hak tinggi wanita dengan desain peep-toe abu-abu elegan untuk acara pesta.',
    price: 270000,
    originalPrice: 580000,
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600',
    category: 'shoes',
    rating: 4.9,
    soldCount: 25,
    stock: 50,
    soldProgress: 50, // 50%
    isCampaign: true,
  },

  // Standard Catalog Items (for 'Todays For You')
  {
    id: 'p-1',
    name: 'Essentials Men\'s Oxford Long Sleeve Shirt',
    description: `Kemeja oxford lengan panjang pria klasik berbahan 100% Fine Cotton Oxford berkualitas tinggi. Dirancang dengan potongan Regular Fit modern yang fleksibel untuk tampilan profesional kerja kantor maupun gaya kasual harian yang rapi dan nyaman sepanjang hari.

DETAIL FITUR:
• Bahan 100% Katun Oxford premium (adem, lembut, dan menyerap keringat)
• Kerah Button-Down Collar yang kokoh dan tidak mudah melengkung
• Jahitan Double-Needle presisi tinggi untuk durabilitas jangka panjang
• Saku dada fungsional dengan aksen jahitan rapi

PANDUAN UKURAN (SIZE CHART):
• S  : Lebar Dada 50 cm | Panjang Baju 70 cm
• M  : Lebar Dada 53 cm | Panjang Baju 72 cm
• L  : Lebar Dada 56 cm | Panjang Baju 74 cm
• XL : Lebar Dada 59 cm | Panjang Baju 76 cm

Petunjuk Perawatan: Cuci mesin air dingin, jemur gantung di tempat teduh, setrika suhu sedang.`,
    price: 179000,
    originalPrice: 299000,
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600',
    category: 'shirt',
    rating: 4.9,
    soldCount: 1250,
    stock: 120,
    isCampaign: false,
  },
  {
    id: 'p-2',
    name: 'StyleHaven Men\'s Fashionable Brogues',
    description: 'Sepatu kulit oxford dengan pola brogue klasik bertekstur premium untuk acara formal.',
    price: 198000,
    originalPrice: 325000,
    imageUrl: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=600',
    category: 'shoes',
    rating: 4.8,
    soldCount: 840,
    stock: 95,
    isCampaign: false,
  },
  {
    id: 'p-3',
    name: 'Essential Long-Sleeve Crewneck Shirt',
    description: 'Kaos lengan panjang kasual pria dengan bahan rajut katun combed yang sejuk.',
    price: 120000,
    originalPrice: 199000,
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600',
    category: 't-shirt',
    rating: 4.7,
    soldCount: 560,
    stock: 200,
    isCampaign: false,
  },
  {
    id: 'p-4',
    name: 'UrbanFlex Men\'s Short Pants Collection',
    description: 'Celana pendek chino pria berpotongan ramping dan elastis untuk aktivitas santai.',
    price: 162000,
    originalPrice: 245000,
    imageUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&q=80&w=600',
    category: 'jeans',
    rating: 4.9,
    soldCount: 2100,
    stock: 150,
    isCampaign: false,
  },
  {
    id: 'p-5',
    name: 'ChicCarry - Elegant Leather Tote Bag',
    description: 'Tas jinjing wanita berbahan kulit sintetis premium dengan kapasitas besar.',
    price: 650000,
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600',
    category: 'bag',
    rating: 4.9,
    soldCount: 520,
    stock: 45,
    isCampaign: false,
  },
  {
    id: 'p-6',
    name: 'Sophisticated Women\'s Parka Trench Line',
    description: 'Mantel parka wanita dengan tali pinggang serut tahan angin untuk cuaca dingin.',
    price: 324000,
    originalPrice: 650000,
    imageUrl: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=600',
    category: 'jacket',
    rating: 4.9,
    soldCount: 180,
    stock: 35,
    isCampaign: false,
  },
  {
    id: 'p-7',
    name: 'AeroCraft Men\'s Vintage Denim Jeans',
    description: 'Celana jeans denim kasual dengan aksen washed dan durabilitas tinggi.',
    price: 289000,
    originalPrice: 450000,
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=600',
    category: 'jeans',
    rating: 4.8,
    soldCount: 1420,
    stock: 80,
    isCampaign: false,
  },
  {
    id: 'p-8',
    name: 'ChronoClassic Black Leather Watch',
    description: 'Jam tangan analog pria dengan tali kulit hitam asli dan jarum kronograf.',
    price: 499000,
    originalPrice: 850000,
    imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=600',
    category: 'watches',
    rating: 4.7,
    soldCount: 310,
    stock: 25,
    isCampaign: false,
  }
]

export class MockProductService implements IProductService {
  async getCampaignProducts(): Promise<Product[]> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return MOCK_PRODUCTS.filter((p) => p.isCampaign)
  }

  async getProducts(category?: string): Promise<Product[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    if (!category || category === 'all') {
      return MOCK_PRODUCTS.filter((p) => !p.isCampaign)
    }
    return MOCK_PRODUCTS.filter((p) => !p.isCampaign && p.category === category)
  }

  async getProductById(id: string): Promise<Product | null> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const product = MOCK_PRODUCTS.find((p) => p.id === id)
    return product || null
  }
}
