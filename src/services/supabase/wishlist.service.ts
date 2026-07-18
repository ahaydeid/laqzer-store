import { createClient } from './client'
import { Product } from '@/core/types/product'

export class SupabaseWishlistService {
  private getClient() {
    return createClient()
  }

  async isFavorited(userId: string, productId: string): Promise<boolean> {
    const supabase = this.getClient()
    const { data } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle()

    return !!data
  }

  async toggle(userId: string, productId: string): Promise<boolean> {
    const supabase = this.getClient()
    const alreadyFav = await this.isFavorited(userId, productId)

    if (alreadyFav) {
      await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId)
      return false
    } else {
      await supabase
        .from('wishlists')
        .insert({ user_id: userId, product_id: productId })
      return true
    }
  }

  async getFavoriteProductIds(userId: string): Promise<string[]> {
    const supabase = this.getClient()
    const { data } = await supabase
      .from('wishlists')
      .select('product_id')
      .eq('user_id', userId)

    return (data || []).map((row) => row.product_id)
  }

  async getFavoriteProducts(userId: string): Promise<Product[]> {
    const supabase = this.getClient()

    // Ambil semua product_id dari wishlist user, urut terbaru
    const { data: wishlistRows } = await supabase
      .from('wishlists')
      .select('product_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (!wishlistRows || wishlistRows.length === 0) return []

    const productIds = wishlistRows.map((r) => r.product_id)

    const { data: products } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)

    if (!products) return []

    // Urutkan sesuai urutan wishlist (terbaru = pertama)
    const ordered = productIds
      .map((id) => products.find((p) => String(p.id) === String(id)))
      .filter(Boolean) as any[]

    return ordered.map((data) => ({
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
      variants: Array.isArray(data.variants) ? data.variants : [],
      weight: data.weight !== null && data.weight !== undefined ? Number(data.weight) : 500,
    }))
  }

  async getWishlistCount(productId: string): Promise<number> {
    const supabase = this.getClient()
    const { count, error } = await supabase
      .from('wishlists')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId)

    if (error) {
      console.error('Error getting wishlist count:', error)
      return 0
    }
    return count || 0
  }
}
