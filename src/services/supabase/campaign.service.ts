import { ICampaignService } from '@/core/interfaces/campaign.interface'
import { CampaignItem } from '@/core/types/campaign'
import { createClient as createBrowserClient } from './client'

export class SupabaseCampaignService implements ICampaignService {
  private getClient() {
    return createBrowserClient()
  }

  private mapToCampaignItem(row: any): CampaignItem {
    return {
      id: row.id,
      campaignName: row.campaign_name,
      productId: row.product_id,
      productName: row.products?.name ?? '',
      productImageUrl: row.products?.image_url ?? '',
      originalPrice: Number(row.original_price),
      priceAfterDiscount: Number(row.price_after_discount),
      discountPercent: Number(row.discount_percent),
      isActive: Boolean(row.is_active),
      startDate: row.start_date,
      endDate: row.end_date,
      createdAt: row.created_at,
    }
  }

  async getCampaigns(): Promise<CampaignItem[]> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        products (
          name,
          image_url
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching campaigns:', error)
      return []
    }

    return (data || []).map((row: any) => this.mapToCampaignItem(row))
  }

  async createCampaign(data: Omit<CampaignItem, 'id' | 'createdAt'>): Promise<CampaignItem> {
    const supabase = this.getClient()

    // 1. Insert campaign record
    const { data: inserted, error } = await supabase
      .from('campaigns')
      .insert({
        campaign_name: data.campaignName,
        product_id: data.productId,
        original_price: data.originalPrice,
        price_after_discount: data.priceAfterDiscount,
        discount_percent: data.discountPercent,
        is_active: data.isActive,
        start_date: data.startDate,
        end_date: data.endDate,
      })
      .select(`*, products (name, image_url)`)
      .single()

    if (error || !inserted) {
      throw new Error(`Gagal membuat campaign: ${error?.message}`)
    }

    // 2. Sync products table: set is_campaign=true, update price & original_price
    if (data.isActive) {
      await supabase
        .from('products')
        .update({
          is_campaign: true,
          original_price: data.originalPrice,
          price: data.priceAfterDiscount,
        })
        .eq('id', data.productId)
    }

    return this.mapToCampaignItem(inserted)
  }

  async toggleCampaignStatus(id: string, isActive: boolean): Promise<void> {
    const supabase = this.getClient()

    // Get campaign to find product_id and prices
    const { data: campaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !campaign) throw new Error('Campaign tidak ditemukan')

    // Update campaign status
    const { error } = await supabase
      .from('campaigns')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw new Error(`Gagal mengubah status campaign: ${error.message}`)

    // Sync product
    if (isActive) {
      await supabase
        .from('products')
        .update({
          is_campaign: true,
          original_price: campaign.original_price,
          price: campaign.price_after_discount,
        })
        .eq('id', campaign.product_id)
    } else {
      // Restore original price
      await supabase
        .from('products')
        .update({
          is_campaign: false,
          price: campaign.original_price,
          original_price: null,
        })
        .eq('id', campaign.product_id)
    }
  }

  async deleteCampaign(id: string): Promise<void> {
    const supabase = this.getClient()

    // Get campaign first to restore product price
    const { data: campaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !campaign) throw new Error('Campaign tidak ditemukan')

    // Delete campaign
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Gagal menghapus campaign: ${error.message}`)

    // Restore product price
    await supabase
      .from('products')
      .update({
        is_campaign: false,
        price: campaign.original_price,
        original_price: null,
      })
      .eq('id', campaign.product_id)
  }
}
