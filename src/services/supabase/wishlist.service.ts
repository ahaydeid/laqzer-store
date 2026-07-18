import { createClient } from './client'

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
}
