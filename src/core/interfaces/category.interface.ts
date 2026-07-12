import { Category } from '../types/category'

/**
 * Service contract for managing and fetching product categories.
 */
export interface ICategoryService {
  /**
   * Fetches all active categories for display.
   */
  getCategories(): Promise<Category[]>
}
