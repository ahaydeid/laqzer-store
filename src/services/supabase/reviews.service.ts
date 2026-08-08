import { SupabaseClient } from '@supabase/supabase-js'
import { createClient as createBrowserClient } from './client'
import { ProductReview, ReviewEligibility, EligibleOrderForReview } from '@/core/types/review'

export class SupabaseReviewsService {
  private supabaseClient?: SupabaseClient

  constructor(supabaseClient?: SupabaseClient) {
    this.supabaseClient = supabaseClient
  }

  private getClient() {
    if (this.supabaseClient) return this.supabaseClient
    return createBrowserClient()
  }

  /**
   * Fetch all real reviews for a product with user profile info.
   */
  async getProductReviews(productId: string): Promise<ProductReview[]> {
    const supabase = this.getClient()

    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          id,
          order_id,
          order_number,
          product_id,
          user_id,
          rating,
          comment,
          variant_label,
          created_at,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching product reviews:', error)
        return []
      }

      return (data || []).map((row: Record<string, unknown>) => {
        const profile = row.profiles as { full_name?: string; avatar_url?: string } | null
        return {
          id: row.id as string,
          orderId: row.order_id as string,
          orderNumber: row.order_number as string,
          productId: row.product_id as string,
          userId: row.user_id as string,
          userName: profile?.full_name || 'Pembeli Terverifikasi',
          userAvatarUrl: profile?.avatar_url || undefined,
          rating: Number(row.rating),
          comment: row.comment ? (row.comment as string) : undefined,
          variantLabel: row.variant_label ? (row.variant_label as string) : undefined,
          createdAt: row.created_at as string,
        }
      })
    } catch {
      return []
    }
  }

  /**
   * Check if a logged-in user has any completed orders for this product that haven't been reviewed yet.
   */
  async checkEligibility(userId: string, productId: string): Promise<ReviewEligibility> {
    const supabase = this.getClient()

    try {
      // 1. Fetch completed orders for this user
      const { data: completedOrders, error: orderErr } = await supabase
        .from('orders')
        .select('id, order_number, created_at')
        .eq('user_id', userId)
        .eq('status', 'completed')

      if (orderErr || !completedOrders || completedOrders.length === 0) {
        return { isEligible: false, eligibleOrders: [] }
      }

      const completedOrderIds = completedOrders.map((o) => o.id)
      const orderMap = new Map(completedOrders.map((o) => [o.id, o]))

      // 2. Query order_items table for items matching this productId
      const { data: orderItems, error: itemsErr } = await supabase
        .from('order_items')
        .select('order_id, product_id, variant_label')
        .in('order_id', completedOrderIds)
        .eq('product_id', productId)

      if (itemsErr || !orderItems || orderItems.length === 0) {
        return { isEligible: false, eligibleOrders: [] }
      }

      // 3. Fetch existing reviews by this user for this product
      const { data: existingReviews } = await supabase
        .from('product_reviews')
        .select('order_id')
        .eq('user_id', userId)
        .eq('product_id', productId)

      const reviewedOrderIds = new Set((existingReviews || []).map((r) => r.order_id))

      // 4. Build list of eligible orders (order_items not yet reviewed)
      const eligibleOrders: EligibleOrderForReview[] = []

      for (const item of orderItems) {
        if (reviewedOrderIds.has(item.order_id)) continue

        const orderInfo = orderMap.get(item.order_id)
        if (orderInfo) {
          eligibleOrders.push({
            orderId: orderInfo.id,
            orderNumber: orderInfo.order_number,
            variantLabel: item.variant_label || undefined,
            completedAt: orderInfo.created_at,
          })
        }
      }

      return {
        isEligible: eligibleOrders.length > 0,
        eligibleOrders,
      }
    } catch {
      return { isEligible: false, eligibleOrders: [] }
    }
  }

  /**
   * Submit a new real product review tied to a specific completed order.
   */
  async createReview(params: {
    orderId: string
    orderNumber: string
    productId: string
    userId: string
    rating: number
    comment?: string
    variantLabel?: string
  }): Promise<ProductReview> {
    const supabase = this.getClient()

    const payload = {
      order_id: params.orderId,
      order_number: params.orderNumber,
      product_id: params.productId,
      user_id: params.userId,
      rating: params.rating,
      comment: params.comment ? params.comment.trim() : null,
      variant_label: params.variantLabel || null,
    }

    const { data, error } = await supabase
      .from('product_reviews')
      .insert(payload)
      .select(`
        id,
        order_id,
        order_number,
        product_id,
        user_id,
        rating,
        comment,
        variant_label,
        created_at,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      throw new Error(error.message || 'Gagal menyimpan ulasan')
    }

    const profile = data.profiles as { full_name?: string; avatar_url?: string } | null
    return {
      id: data.id,
      orderId: data.order_id,
      orderNumber: data.order_number,
      productId: data.product_id,
      userId: data.user_id,
      userName: profile?.full_name || 'Pembeli Terverifikasi',
      userAvatarUrl: profile?.avatar_url || undefined,
      rating: Number(data.rating),
      comment: data.comment || undefined,
      variantLabel: data.variant_label || undefined,
      createdAt: data.created_at,
    }
  }

  /**
   * Update an existing product review submitted by the user.
   */
  async updateReview(params: {
    reviewId: string
    rating: number
    comment?: string
  }): Promise<void> {
    const supabase = this.getClient()

    const { data, error } = await supabase
      .from('product_reviews')
      .update({
        rating: params.rating,
        comment: params.comment ? params.comment.trim() : null,
      })
      .eq('id', params.reviewId)
      .select()

    if (error) {
      console.error('Error updating review:', error)
      throw new Error(error.message || 'Gagal memperbarui ulasan')
    }

    if (!data || data.length === 0) {
      throw new Error('Gagal memperbarui ulasan. Pastikan Anda telah menjalankan query SQL RLS Update (Migration 24) di Supabase.')
    }
  }
}
