import { SupabaseClient } from '@supabase/supabase-js'
import { IProductService } from '@/core/interfaces/product.interface'
import { Product } from '@/core/types/product'
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

  private mapToProduct(data: any): Product {
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      price: Number(data.price),
      originalPrice: data.original_price ? Number(data.original_price) : undefined,
      imageUrl: data.image_url,
      images: Array.isArray(data.images) ? data.images : [],
      category: data.category,
      rating: data.rating !== null && data.rating !== undefined ? Number(data.rating) : 5.0,
      soldCount: data.sold_count ? Number(data.sold_count) : 0,
      stock: Number(data.stock || 0),
      soldProgress: data.sold_progress ? Number(data.sold_progress) : 0,
      isCampaign: Boolean(data.is_campaign),
    }
  }

  private mapToDbPayload(product: Partial<Product>): any {
    const payload: any = {}
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
    return payload
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

    return (data || []).map((row: any) => this.mapToProduct(row))
  }

  async getProducts(category?: string): Promise<Product[]> {
    const supabase = this.getClient()
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_campaign', false)
      .order('created_at', { ascending: false })

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching catalog products from Supabase:', error)
      return []
    }

    return (data || []).map((row: any) => this.mapToProduct(row))
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

    return this.mapToProduct(data)
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
}
