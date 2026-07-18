import { Product } from '../types/product'

/**
 * Service contract for managing and fetching products.
 */
export interface IProductService {
  /**
   * Fetches products designated for the active Campaign banner.
   */
  getCampaignProducts(): Promise<Product[]>

  /**
   * Fetches catalog products, optionally filtered by category.
   * Useful for the tabs filter on the home screen.
   */
  getProducts(category?: string): Promise<Product[]>

  /**
   * Fetches a single product by its unique identifier.
   */
  getProductById(id: string): Promise<Product | null>

  /**
   * Fetches ALL products regardless of is_campaign flag. Used in admin selectors.
   */
  getAllProducts(): Promise<Product[]>

  /**
   * Creates a new product.
   */
  createProduct(product: Partial<Product>): Promise<Product>

  /**
   * Updates an existing product by ID.
   */
  updateProduct(id: string, product: Partial<Product>): Promise<Product>

  /**
   * Deletes a product by ID.
   */
  deleteProduct(id: string): Promise<boolean>
}
