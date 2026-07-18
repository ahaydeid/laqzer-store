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

    const { data, error } = await supabase
      .from('wishlists')
      .select('created_at, products (*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error getting favorite products:', error)
      return []
    }

    if (!data) return []

    return data
      .map((row: any) => {
        const prod = row.products
        if (!prod) return null
        return {
          id: prod.id,
          name: prod.name,
          description: prod.description || '',
          price: Number(prod.price),
          originalPrice: prod.original_price ? Number(prod.original_price) : undefined,
          imageUrl: prod.image_url,
          images: Array.isArray(prod.images) ? prod.images : [],
          category: prod.category,
          rating: prod.rating !== null && prod.rating !== undefined ? Number(prod.rating) : 5.0,
          soldCount: prod.sold_count ? Number(prod.sold_count) : 0,
          stock: Number(prod.stock || 0),
          soldProgress: prod.sold_progress ? Number(prod.sold_progress) : 0,
          isCampaign: Boolean(prod.is_campaign),
          variants: Array.isArray(prod.variants) ? prod.variants : [],
          weight: prod.weight !== null && prod.weight !== undefined ? Number(prod.weight) : 500,
        }
      })
      .filter(Boolean) as Product[]
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

  async getFavoriteStatus(productId: string, userId?: string): Promise<{ count: number; isFavorited: boolean }> {
    const supabase = this.getClient()
    
    const countPromise = supabase
      .from('wishlists')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId)

    const favPromise = userId 
      ? supabase
          .from('wishlists')
          .select('id')
          .eq('user_id', userId)
          .eq('product_id', productId)
          .maybeSingle()
      : Promise.resolve({ data: null })

    const [countRes, favRes] = await Promise.all([countPromise, favPromise])

    return {
      count: countRes.count || 0,
      isFavorited: !!favRes.data
    }
  }
}
