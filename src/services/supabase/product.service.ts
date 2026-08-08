import { SupabaseClient } from '@supabase/supabase-js'
import { IProductService } from '@/core/interfaces/product.interface'
import { Product, slugifyProductName } from '@/core/types/product'
import { createClient as createBrowserClient } from './client'
import { uploadBase64ToProductStorage } from './storage.service'

/**
 * Supabase-backed implementation of IProductService.
 * Connects directly to the 'products' table in Supabase PostgreSQL.
 */
export class SupabaseProductService implements IProductService {
  private supabaseClient?: SupabaseClient

  constructor(supabaseClient?: SupabaseClient) {
    this.supabaseClient = supabaseClient
  }

  private getClient() {
    if (this.supabaseClient) return this.supabaseClient
    return createBrowserClient()
  }

  private async processImagesUpload(productData: Partial<Product>): Promise<Partial<Product>> {
    const updatedData = { ...productData }

    if (updatedData.images && updatedData.images.length > 0) {
      const uploadedImages = await Promise.all(
        updatedData.images.map((img: string) => uploadBase64ToProductStorage(img))
      )
      updatedData.images = uploadedImages
      updatedData.imageUrl = uploadedImages[0]
    } else if (updatedData.imageUrl && updatedData.imageUrl.startsWith('data:image/')) {
      const uploadedUrl = await uploadBase64ToProductStorage(updatedData.imageUrl)
      updatedData.imageUrl = uploadedUrl
      updatedData.images = [uploadedUrl]
    }

    return updatedData
  }

  private mapToProduct(data: Record<string, unknown>): Product {
    const defaultSlug = (data.slug as string) || slugifyProductName(data.name as string, data.id as string)
    return {
      id: data.id as string,
      name: data.name as string,
      description: (data.description as string) || '',
      price: Number(data.price),
      originalPrice: data.original_price ? Number(data.original_price) : undefined,
      imageUrl: data.image_url as string,
      images: Array.isArray(data.images) ? (data.images as string[]) : [],
      category: data.category as string,
      rating: data.rating !== null && data.rating !== undefined ? Number(data.rating) : 5.0,
      soldCount: data.sold_count ? Number(data.sold_count) : 0,
      stock: Number(data.stock || 0),
      soldProgress: data.sold_progress ? Number(data.sold_progress) : 0,
      isCampaign: Boolean(data.is_campaign),
      variants: Array.isArray(data.variants) ? (data.variants as string[]) : [],
      weight: data.weight !== null && data.weight !== undefined ? Number(data.weight) : 500,
      slug: defaultSlug,
    }
  }

  private mapToDbPayload(product: Partial<Product>): Record<string, unknown> {
    const payload: Record<string, unknown> = {}
    if (product.name !== undefined) payload.name = product.name
    if (product.description !== undefined) payload.description = product.description
    if (product.price !== undefined) payload.price = product.price
    if (product.originalPrice !== undefined) payload.original_price = product.originalPrice
    if (product.imageUrl !== undefined) payload.image_url = product.imageUrl
    if (product.images !== undefined) payload.images = product.images
    if (product.category !== undefined) payload.category = product.category
    if (product.rating !== undefined) payload.rating = product.rating
    if (product.soldCount !== undefined) payload.sold_count = product.soldCount
    if (product.stock !== undefined) payload.stock = product.stock
    if (product.soldProgress !== undefined) payload.sold_progress = product.soldProgress
    if (product.isCampaign !== undefined) payload.is_campaign = product.isCampaign
    if (product.variants !== undefined) payload.variants = product.variants
    if (product.weight !== undefined) payload.weight = product.weight
    if (product.slug !== undefined) payload.slug = product.slug
    else if (product.name) payload.slug = slugifyProductName(product.name, product.id)
    return payload
  }

  private async enrichProductsWithRealStats(products: Product[]): Promise<Product[]> {
    if (!products || products.length === 0) return []

    const supabase = this.getClient()
    const productIds = products.map((p) => p.id)

    try {
      // 1. Fetch sold counts from order_items
      const { data: orderItemsData } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .in('product_id', productIds)

      const soldMap = new Map<string, number>()
      if (orderItemsData) {
        for (const item of orderItemsData) {
          const current = soldMap.get(item.product_id) || 0
          soldMap.set(item.product_id, current + Number(item.quantity || 0))
        }
      }

      // 2. Fetch ratings from product_reviews
      const { data: reviewsData } = await supabase
        .from('product_reviews')
        .select('product_id, rating')
        .in('product_id', productIds)

      const ratingMap = new Map<string, { total: number; count: number }>()
      if (reviewsData) {
        for (const rev of reviewsData) {
          const current = ratingMap.get(rev.product_id) || { total: 0, count: 0 }
          ratingMap.set(rev.product_id, {
            total: current.total + Number(rev.rating || 0),
            count: current.count + 1,
          })
        }
      }

      return products.map((p) => {
        const realSold = soldMap.get(p.id) || 0
        const ratingInfo = ratingMap.get(p.id)
        const realRating = ratingInfo && ratingInfo.count > 0
          ? Number((ratingInfo.total / ratingInfo.count).toFixed(1))
          : 0.0

        return {
          ...p,
          soldCount: realSold,
          rating: realRating,
        }
      })
    } catch {
      return products
    }
  }

  async getCampaignProducts(): Promise<Product[]> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_campaign', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching campaign products from Supabase:', error)
      return []
    }

    const raw = (data || []).map((row: Record<string, unknown>) => this.mapToProduct(row))
    return this.enrichProductsWithRealStats(raw)
  }

  async getAllProducts(): Promise<Product[]> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching all products from Supabase:', error)
      return []
    }

    const raw = (data || []).map((row: Record<string, unknown>) => this.mapToProduct(row))
    return this.enrichProductsWithRealStats(raw)
  }

  async getProducts(category?: string): Promise<Product[]> {
    const supabase = this.getClient()
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching catalog products from Supabase:', error)
      return []
    }

    const raw = (data || []).map((row: Record<string, unknown>) => this.mapToProduct(row))
    return this.enrichProductsWithRealStats(raw)
  }

  async getProductById(id: string): Promise<Product | null> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error || !data) {
      if (error) console.error('Error fetching product by ID from Supabase:', error)
      return null
    }

    const raw = this.mapToProduct(data)
    const [enriched] = await this.enrichProductsWithRealStats([raw])
    return enriched || raw
  }

  async getProductBySlug(slugInput: string): Promise<Product | null> {
    const slug = decodeURIComponent(slugInput).trim()
    
    // Fetch catalog products from Supabase
    const allProducts = await this.getAllProducts()
    if (!allProducts || allProducts.length === 0) return null

    // 1. Direct match by ID, custom slug, or slugifyProductName(name, id)
    const exactMatch = allProducts.find(
      (p) =>
        p.id === slug ||
        p.slug === slug ||
        slugifyProductName(p.name, p.id) === slug ||
        slugifyProductName(p.name) === slug
    )
    if (exactMatch) return exactMatch

    // 2. Match by short ID prefix at the end of the slug (e.g., '0190cf6e')
    const parts = slug.split('-')
    const lastPart = parts[parts.length - 1]
    if (lastPart && lastPart.length >= 8) {
      const shortIdMatch = allProducts.find((p) => p.id.startsWith(lastPart))
      if (shortIdMatch) return shortIdMatch
    }

    return null
  }

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const supabase = this.getClient()
    const processedData = await this.processImagesUpload(productData)
    const dbPayload = this.mapToDbPayload(processedData)

    const { data, error } = await supabase
      .from('products')
      .insert(dbPayload)
      .select('*')
      .single()

    if (error) {
      console.error('Error creating product in Supabase:', error)
      throw new Error(`Gagal membuat produk di Supabase: ${error.message}`)
    }

    return this.mapToProduct(data)
  }

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    const supabase = this.getClient()
    const processedData = await this.processImagesUpload(productData)
    const dbPayload = this.mapToDbPayload(processedData)
    dbPayload.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('products')
      .update(dbPayload)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating product in Supabase:', error)
      throw new Error(`Gagal memperbarui produk di Supabase: ${error.message}`)
    }

    return this.mapToProduct(data)
  }

  async deleteProduct(id: string): Promise<boolean> {
    const supabase = this.getClient()
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting product from Supabase:', error)
      throw new Error(`Gagal menghapus produk di Supabase: ${error.message}`)
    }

    return true
  }

  /**
   * Hitung total kuantitas unit produk yang terjual dari tabel order_items (bukan jumlah transaksi).
   */
  async getProductSoldCount(productId: string): Promise<number> {
    const supabase = this.getClient()
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('quantity')
        .eq('product_id', productId)

      if (error || !data) return 0

      return data.reduce((total: number, row: { quantity?: number }) => {
        return total + Number(row.quantity || 0)
      }, 0)
    } catch {
      return 0
    }
  }
}
