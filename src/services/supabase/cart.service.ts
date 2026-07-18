import { ICartService } from '@/core/interfaces/cart.interface'
import { CartItem } from '@/core/types/cart'
import { createClient } from '@/services/supabase/client'

export class SupabaseCartService implements ICartService {
  private getClient() {
    return createClient()
  }

  async getCartItems(): Promise<CartItem[]> {
    const supabase = this.getClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return []

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        product_id,
        variant,
        quantity,
        checked,
        created_at,
        products (
          id,
          name,
          price,
          image_url,
          stock,
          variants
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching cart items:', error)
      return []
    }

    if (!data) return []

    return data
      .filter((item: any) => item.products)
      .map((item: any) => {
        const p = item.products
        return {
          id: item.id,
          productId: item.product_id,
          name: p.name,
          price: p.price,
          imageUrl: p.image_url,
          variant: item.variant,
          quantity: item.quantity,
          checked: item.checked,
          stock: p.stock || 99,
        }
      })
  }

  async addToCart(productId: string, variant: string, quantity: number): Promise<void> {
    const supabase = this.getClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return

    const userId = session.user.id

    // Check if the item variant already exists in user's cart
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('variant', variant)
      .maybeSingle()

    if (existing) {
      // Update quantity
      const { error } = await supabase
        .from('cart_items')
        .update({
          quantity: existing.quantity + quantity,
          checked: true,
        })
        .eq('id', existing.id)

      if (error) throw error
    } else {
      // Insert new cart item
      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id: productId,
          variant: variant,
          quantity: quantity,
          checked: true,
        })

      if (error) throw error
    }
  }

  async removeFromCart(id: string): Promise<void> {
    const supabase = this.getClient()
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id)

    if (error) console.error('Error removing cart item:', error)
  }

  async updateQuantity(id: string, quantity: number): Promise<void> {
    const supabase = this.getClient()
    const newQty = Math.max(1, quantity)
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: newQty })
      .eq('id', id)

    if (error) console.error('Error updating cart quantity:', error)
  }

  async toggleCheckItem(id: string): Promise<void> {
    const supabase = this.getClient()
    const { data: current } = await supabase
      .from('cart_items')
      .select('checked')
      .eq('id', id)
      .single()

    if (current) {
      const { error } = await supabase
        .from('cart_items')
        .update({ checked: !current.checked })
        .eq('id', id)

      if (error) console.error('Error toggling cart check:', error)
    }
  }

  async toggleAllCheck(checked: boolean): Promise<void> {
    const supabase = this.getClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return

    const { error } = await supabase
      .from('cart_items')
      .update({ checked })
      .eq('user_id', session.user.id)

    if (error) console.error('Error toggling all cart checks:', error)
  }
}
