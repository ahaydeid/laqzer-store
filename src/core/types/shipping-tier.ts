export type ShippingTier = 'regular' | 'express' | 'cargo' | 'economy'

export interface ShippingTierConfig {
  regular: boolean
  express: boolean
  cargo: boolean
  economy: boolean
  minCargoWeightGrams: number // Minimal berat (gram) untuk mengaktifkan opsi Kargo jika tier cargo aktif
}

export const DEFAULT_SHIPPING_TIER_CONFIG: ShippingTierConfig = {
  regular: true,
  express: true,
  cargo: false, // Default mati agar pembeli barang kecil tidak pilih kargo
  economy: true,
  minCargoWeightGrams: 5000, // 5 KG
}
