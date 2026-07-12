import { SupabaseClient } from '@supabase/supabase-js'
import { IStoreService } from '@/core/interfaces/store.interface'
import { MockStoreService } from './mock/store.service'
import { SupabaseStoreService } from './supabase/store.service'

const provider = process.env.NEXT_PUBLIC_SERVICE_PROVIDER || 'mock'

export interface AppServices {
  store: IStoreService
}

/**
 * Service Factory
 * 
 * Returns the active implementation of application services based on the environment configuration.
 * - In Client Components: Call `getServices()` (uses browser-safe clients).
 * - In Server Components / Actions: Call `getServices(supabaseClient)` passing the server client.
 * 
 * This enables rapid frontend prototyping with mock data and zero-effort migration
 * to Supabase or any custom API in the future.
 */
export function getServices(supabaseClient?: SupabaseClient): AppServices {
  if (provider === 'supabase') {
    return {
      store: new SupabaseStoreService(supabaseClient),
    }
  }

  // Default to mock services for prototyping
  return {
    store: new MockStoreService(),
  }
}
