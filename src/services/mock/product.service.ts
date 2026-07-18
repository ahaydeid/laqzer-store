import { IProductService } from '@/core/interfaces/product.interface'
import { Product } from '@/core/types/product'

const MOCK_PRODUCTS: Product[] = []

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

  async createProduct(productData: Partial<Product>): Promise<Product> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const newProduct: Product = {
      id: `p-${Date.now()}`,
      name: productData.name || 'Produk Baru',
      description: productData.description || '',
      price: productData.price || 0,
      originalPrice: productData.originalPrice,
      imageUrl: productData.imageUrl || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600',
      images: productData.images || [],
      category: productData.category || 'shirt',
      rating: productData.rating || 5.0,
      soldCount: productData.soldCount || 0,
      stock: productData.stock || 0,
      soldProgress: productData.soldProgress || 0,
      isCampaign: productData.isCampaign || false,
    }
    MOCK_PRODUCTS.unshift(newProduct)
    return newProduct
  }

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const index = MOCK_PRODUCTS.findIndex((p) => p.id === id)
    if (index === -1) {
      throw new Error(`Produk dengan ID ${id} tidak ditemukan.`)
    }
    MOCK_PRODUCTS[index] = {
      ...MOCK_PRODUCTS[index],
      ...productData,
    }
    return MOCK_PRODUCTS[index]
  }

  async deleteProduct(id: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const index = MOCK_PRODUCTS.findIndex((p) => p.id === id)
    if (index === -1) return false
    MOCK_PRODUCTS.splice(index, 1)
    return true
  }
}
