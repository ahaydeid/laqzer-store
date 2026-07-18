import { createClient } from './client'
import { VoucherRecord, VoucherValidationResult } from '@/core/types/voucher'

export class SupabaseVoucherService {
  private getClient() {
    return createClient()
  }

  private mapToVoucherRecord(row: any): VoucherRecord {
    return {
      id: row.id,
      code: row.code,
      campaignName: row.campaign_name,
      type: row.type as 'percent' | 'nominal',
      value: Number(row.value),
      minPurchase: Number(row.min_purchase || 0),
      maxDiscount: row.max_discount ? Number(row.max_discount) : undefined,
      quota: Number(row.quota || 0),
      usedCount: Number(row.used_count || 0),
      expiryDate: row.expiry_date,
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
    }
  }

  async getVouchers(): Promise<VoucherRecord[]> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('vouchers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching vouchers from Supabase:', error)
      return []
    }

    return (data || []).map(row => this.mapToVoucherRecord(row))
  }

  async createVoucher(voucher: Omit<VoucherRecord, 'id' | 'usedCount' | 'createdAt'>): Promise<VoucherRecord> {
    const supabase = this.getClient()
    const payload = {
      code: voucher.code.toUpperCase().replace(/\s+/g, ''),
      campaign_name: voucher.campaignName,
      type: voucher.type,
      value: voucher.value,
      min_purchase: voucher.minPurchase,
      max_discount: voucher.maxDiscount || null,
      quota: voucher.quota,
      expiry_date: voucher.expiryDate,
      is_active: voucher.isActive,
    }

    const { data, error } = await supabase
      .from('vouchers')
      .insert(payload)
      .select()
      .single()

    if (error) {
      throw new Error(error.message.includes('unique') ? 'Kode voucher sudah terdaftar' : error.message)
    }

    return this.mapToVoucherRecord(data)
  }

  async toggleVoucherStatus(id: string, isActive: boolean): Promise<void> {
    const supabase = this.getClient()
    const { error } = await supabase
      .from('vouchers')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      throw new Error(`Gagal mengubah status voucher: ${error.message}`)
    }
  }

  async deleteVoucher(id: string): Promise<void> {
    const supabase = this.getClient()
    const { error } = await supabase
      .from('vouchers')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Gagal menghapus voucher: ${error.message}`)
    }
  }

  /**
   * Validasi keabsahan voucher secara real-time dari database Supabase saat checkout pembeli.
   */
  async validateVoucher(code: string, subtotal: number): Promise<VoucherValidationResult> {
    const cleanCode = code.toUpperCase().trim()
    const supabase = this.getClient()

    const { data, error } = await supabase
      .from('vouchers')
      .select('*')
      .eq('code', cleanCode)
      .maybeSingle()

    if (error || !data) {
      return { valid: false, message: 'Kode voucher tidak ditemukan.' }
    }

    const voucher = this.mapToVoucherRecord(data)

    if (!voucher.isActive) {
      return { valid: false, message: 'Voucher ini sedang tidak aktif.' }
    }

    // Cek Tanggal Kedaluwarsa
    const today = new Date().toISOString().split('T')[0]
    if (voucher.expiryDate < today) {
      return { valid: false, message: 'Masa berlaku voucher ini telah berakhir.' }
    }

    // Cek Kuota Tersisa
    if (voucher.quota > 0 && voucher.usedCount >= voucher.quota) {
      return { valid: false, message: 'Kuota penggunaan voucher ini sudah habis.' }
    }

    // Cek Minimal Pembelian Subtotal
    if (subtotal < voucher.minPurchase) {
      return {
        valid: false,
        message: `Minimal pembelian Rp ${voucher.minPurchase.toLocaleString('id-ID')} untuk menggunakan voucher ini.`,
      }
    }

    // Hitung Nominal Potongan Diskon
    let discountAmount = 0
    if (voucher.type === 'percent') {
      const calculated = subtotal * (voucher.value / 100)
      discountAmount = voucher.maxDiscount ? Math.min(calculated, voucher.maxDiscount) : calculated
    } else {
      discountAmount = Math.min(voucher.value, subtotal)
    }

    return {
      valid: true,
      voucher,
      discountAmount,
      message: `Voucher "${voucher.campaignName}" berhasil digunakan!`,
    }
  }
}
