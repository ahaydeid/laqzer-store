import { SupabaseClient } from '@supabase/supabase-js'
import { IStoreService } from '@/core/interfaces/store.interface'
import { StoreSettings } from '@/core/types/store'
import { createClient as createBrowserClient } from './client'

/**
 * Supabase implementation of IStoreService.
 * Can be instantiated with an injected Supabase client (e.g. for Server Components),
 * or will fallback to the Browser Client for Client Components.
 */
export class SupabaseStoreService implements IStoreService {
  private supabaseClient?: SupabaseClient

  constructor(supabaseClient?: SupabaseClient) {
    this.supabaseClient = supabaseClient
  }

  private getClient() {
    if (this.supabaseClient) return this.supabaseClient
    return createBrowserClient()
  }

  async getSettings(): Promise<StoreSettings> {
    // const supabase = this.getClient()

    // Example implementation structure (commented out until database schema is created):
    /*
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .single()

    if (error) {
      console.error('Error fetching store settings:', error)
      throw new Error('Failed to fetch store settings')
    }

    return {
      name: data.name,
      description: data.description,
      logoUrl: data.logo_url,
      currency: data.currency,
      address: data.address,
      phone: data.phone,
    }
    */

    throw new Error(
      'SupabaseStoreService.getSettings() is not implemented yet. Please use NEXT_PUBLIC_SERVICE_PROVIDER=mock for prototyping.'
    )
  }
}
