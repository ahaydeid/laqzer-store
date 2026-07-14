import { SupabaseClient } from '@supabase/supabase-js'
import { ICategoryService } from '@/core/interfaces/category.interface'
import { Category } from '@/core/types/category'
import { createClient as createBrowserClient } from './client'

/**
 * Supabase-backed implementation of ICategoryService.
 * Ready for future production deployment and database integration.
 */
export class SupabaseCategoryService implements ICategoryService {
  private supabaseClient?: SupabaseClient

  constructor(supabaseClient?: SupabaseClient) {
    this.supabaseClient = supabaseClient
  }

  private getClient() {
    if (this.supabaseClient) return this.supabaseClient
    return createBrowserClient()
  }

  async getCategories(): Promise<Category[]> {
    // const supabase = this.getClient()

    // Example of fetching categories from Supabase
    /*
    const { data, error } = await supabase.from('categories').select('*')
    if (error) throw error
    return data
    */

    throw new Error('SupabaseCategoryService.getCategories() is not implemented yet.')
  }
}
