import { Product } from '../types/product'

/**
 * Service contract for managing and fetching products.
 */
export interface IProductService {
  /**
   * Fetches products designated for the Flash Sale banner.
   */
  getFlashSaleProducts(): Promise<Product[]>

  /**
   * Fetches catalog products, optionally filtered by category.
   * Useful for the tabs filter on the home screen.
   */
  getProducts(category?: string): Promise<Product[]>
}
