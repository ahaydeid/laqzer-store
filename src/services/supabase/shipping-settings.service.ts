import { createClient } from './client'
import { ShippingTierConfig, DEFAULT_SHIPPING_TIER_CONFIG } from '@/core/types/shipping-tier'

const SHIPPING_COURIERS_KEY = 'shipping_couriers'
const SHIPPING_TIERS_KEY = 'shipping_tiers'
const STORE_ORIGIN_KEY = 'store_origin'

export interface StoreOriginLocation {
  id: string
  label: string
  subdistrictName: string
  cityName: string
  provinceName: string
  postalCode?: string
}

export const DEFAULT_STORE_ORIGIN: StoreOriginLocation = {
  id: '73361',
  label: 'SAGA, BALARAJA, TANGERANG, BANTEN, 15610',
  subdistrictName: 'BALARAJA, SAGA',
  cityName: 'TANGERANG',
  provinceName: 'BANTEN',
  postalCode: '15610'
}

export interface CourierConfig {
  id: string
  name: string
  desc: string
  isActive: boolean
}

export const ALL_COURIERS: Omit<CourierConfig, 'isActive'>[] = [
  { id: 'jne', name: 'JNE', desc: 'Jalur Nugraha Ekakurir (Reguler, Oke, YES, JTR)' },
  { id: 'sicepat', name: 'SiCepat', desc: 'SiCepat Ekspres (SiUntung, REG, Cargo, H3LO)' },
  { id: 'jnt', name: 'J&T', desc: 'J&T Express (EZ, J&T Super, J&T Eco)' },
  { id: 'tiki', name: 'TIKI', desc: 'Titipan Kilat (REG, ECO, ONS, TDS)' },
  { id: 'pos', name: 'POS Indonesia', desc: 'Pos Indonesia (Pos Reguler, Pos Nextday)' },
  { id: 'anteraja', name: 'Anteraja', desc: 'Anteraja (Regular, Nextday, Cargo)' },
  { id: 'lion', name: 'Lion Parcel', desc: 'Lion Parcel (REGPACK, ONEPACK, JAGOPACK)' },
  { id: 'ninja', name: 'Ninja Xpress', desc: 'Ninja Xpress (Standard Delivery)' },
  { id: 'ide', name: 'ID Express', desc: 'ID Express (Lite, Reguler, Cargo)' },
  { id: 'sap', name: 'SAP Express', desc: 'SAP Express Courier' },
  { id: 'ncs', name: 'NCS', desc: 'Nusantara Card Semesta' },
  { id: 'rex', name: 'REX', desc: 'Royal Express Indonesia' },
  { id: 'rpx', name: 'RPX', desc: 'RPX Holding Delivery' },
  { id: 'sentral', name: 'Sentral Cargo', desc: 'Sentral Cargo Logistik / Kargo' },
  { id: 'star', name: 'Star Cargo', desc: 'Star Cargo Logistik' },
  { id: 'wahana', name: 'Wahana', desc: 'Wahana Prestasi Logistik' },
  { id: 'dse', name: '21 Express', desc: '21 Express (DSE)' },
]

export class SupabaseShippingSettingsService {
  private getClient() {
    return createClient()
  }

  async getCouriersConfig(): Promise<Record<string, boolean>> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', SHIPPING_COURIERS_KEY)
      .maybeSingle()

    // Default configuration (6 kurir utama aktif, sisanya nonaktif)
    const defaultConfig: Record<string, boolean> = {
      jne: true,
      sicepat: true,
      jnt: true,
      tiki: true,
      pos: true,
      anteraja: true,
      lion: false,
      ninja: false,
      ide: false,
      sap: false,
      ncs: false,
      rex: false,
      rpx: false,
      sentral: false,
      star: false,
      wahana: false,
      dse: false,
    }

    if (error || !data?.value) {
      return defaultConfig
    }

    // Gabungkan dengan default untuk mengantisipasi jika ada kurir baru
    return {
      ...defaultConfig,
      ...(data.value as Record<string, boolean>),
    }
  }

  async saveCouriersConfig(config: Record<string, boolean>): Promise<void> {
    const supabase = this.getClient()
    const { error } = await supabase
      .from('store_settings')
      .upsert(
        { key: SHIPPING_COURIERS_KEY, value: config },
        { onConflict: 'key' }
      )

    if (error) {
      throw new Error(`Gagal menyimpan konfigurasi ekspedisi: ${error.message}`)
    }
  }

  async getShippingTierConfig(): Promise<ShippingTierConfig> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', SHIPPING_TIERS_KEY)
      .maybeSingle()

    if (error || !data?.value) {
      return DEFAULT_SHIPPING_TIER_CONFIG
    }

    return {
      ...DEFAULT_SHIPPING_TIER_CONFIG,
      ...(data.value as Partial<ShippingTierConfig>),
    }
  }

  async saveShippingTierConfig(config: ShippingTierConfig): Promise<void> {
    const supabase = this.getClient()
    const { error } = await supabase
      .from('store_settings')
      .upsert(
        { key: SHIPPING_TIERS_KEY, value: config },
        { onConflict: 'key' }
      )

    if (error) {
      throw new Error(`Gagal menyimpan konfigurasi tier pengiriman: ${error.message}`)
    }
  }

  async getStoreOrigin(): Promise<StoreOriginLocation> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', STORE_ORIGIN_KEY)
      .maybeSingle()

    if (error || !data?.value) {
      return DEFAULT_STORE_ORIGIN
    }

    return {
      ...DEFAULT_STORE_ORIGIN,
      ...(data.value as Partial<StoreOriginLocation>),
    }
  }

  async saveStoreOrigin(location: StoreOriginLocation): Promise<void> {
    const supabase = this.getClient()
    const { error } = await supabase
      .from('store_settings')
      .upsert(
        { key: STORE_ORIGIN_KEY, value: location },
        { onConflict: 'key' }
      )

    if (error) {
      throw new Error(`Gagal menyimpan lokasi asal pengiriman toko: ${error.message}`)
    }
  }
}

