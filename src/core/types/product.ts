/**
 * Represents a product in the single-store e-commerce system.
 */
export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number // Slashed price to indicate discount
  imageUrl: string
  category: string // Matches the Category ID
  rating: number // e.g., 4.9
  soldCount: number // e.g., 102
  stock: number // Current available stock
  soldProgress?: number // Percentage of stock sold (used for Flash Sale progress bars, e.g., 85 for 85%)
  isFlashSale: boolean
}
