import { SupabaseClient } from '@supabase/supabase-js'
import { IStoreService } from '@/core/interfaces/store.interface'
import { MockStoreService } from './mock/store.service'
import { SupabaseStoreService } from './supabase/store.service'

type ProviderType = 'mock' | 'supabase'

/**
 * Service Providers Configuration
 * 
 * Controls which data source is used for each individual service.
 * This supports your incremental workflow (feature-by-feature, page-by-page migration).
 * Change 'mock' to 'supabase' for a service once its backend database/APIs are ready.
 */
export const SERVICE_PROVIDERS: {
  store: ProviderType
} = {
  store: 'mock',
}


export interface AppServices {
  store: IStoreService
}

/**
 * Service Factory
 * 
 * Returns active service implementations based on the SERVICE_PROVIDERS map.
 * - In Client Components: Call `getServices()`
 * - In Server Components / Actions: Call `getServices(supabaseClient)`
 */
export function getServices(supabaseClient?: SupabaseClient): AppServices {
  return {
    store:
      SERVICE_PROVIDERS.store === 'supabase'
        ? new SupabaseStoreService(supabaseClient)
        : new MockStoreService(),
  }
}

