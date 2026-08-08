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
  images?: string[] // Additional product gallery photos (up to 10)
  category: string // Matches the Category ID
  rating: number // e.g., 4.9
  soldCount: number // e.g., 102
  stock: number // Current available stock
  soldProgress?: number // Percentage of stock sold (used for Campaign progress bars, e.g., 85 for 85%)
  isCampaign: boolean
  variants?: string[] // Product variants e.g., ['S', 'M', 'L'] or ['Merah', 'Hitam']
  weight: number // Weight in grams (default 500)
  slug?: string // URL-friendly product slug
}

/**
 * Utility function to convert a product name into a URL slug.
 */
export function slugifyProductName(name: string, id?: string): string {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
  
  if (id) {
    const shortId = id.split('-')[0]
    return `${baseSlug}-${shortId}`
  }
  return baseSlug
}

/**
 * Helper function to retrieve the pure URL slug for a product object.
 */
export function getProductSlug(product: { name: string; id: string; slug?: string }): string {
  if (product.slug && product.slug.trim()) return product.slug
  return slugifyProductName(product.name, product.id)
}

