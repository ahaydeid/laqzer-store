import { SupabaseClient } from '@supabase/supabase-js'
import { IStoreService } from '@/core/interfaces/store.interface'
import { IProductService } from '@/core/interfaces/product.interface'
import { ICategoryService } from '@/core/interfaces/category.interface'
import { ICartService } from '@/core/interfaces/cart.interface'

// Mock Implementations
import { MockStoreService } from './mock/store.service'
import { MockProductService } from './mock/product.service'
import { MockCategoryService } from './mock/category.service'
import { MockCartService } from './mock/cart.service'

// Supabase Implementations
import { SupabaseStoreService } from './supabase/store.service'
import { SupabaseProductService } from './supabase/product.service'
import { SupabaseCategoryService } from './supabase/category.service'

type ProviderType = 'mock' | 'supabase'

/**
 * Service Providers Configuration
 * 
 * Controls which data source is used for each individual service.
 * Change 'mock' to 'supabase' for a service once its backend database/APIs are ready.
 */
export const SERVICE_PROVIDERS: {
  store: ProviderType
  products: ProviderType
  categories: ProviderType
  cart: ProviderType
} = {
  store: 'mock',
  products: 'supabase',
  categories: 'mock',
  cart: 'mock',
}

export interface AppServices {
  store: IStoreService
  products: IProductService
  categories: ICategoryService
  cart: ICartService
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
    products:
      SERVICE_PROVIDERS.products === 'supabase'
        ? new SupabaseProductService(supabaseClient)
        : new MockProductService(),
    categories:
      SERVICE_PROVIDERS.categories === 'supabase'
        ? new SupabaseCategoryService(supabaseClient)
        : new MockCategoryService(),
    cart: new MockCartService(), // Always use MockCartService for now as per user instruction
  }
}

