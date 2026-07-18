import { ICartService } from '@/core/interfaces/cart.interface'
import { CartItem } from '@/core/types/cart'
import { SupabaseProductService } from '../supabase/product.service'

// Shared in-memory state so it persists across different page loads in the same dev session
let MOCK_CART_ITEMS: CartItem[] = [
  {
    id: 'cart-fs-1-L',
    productId: 'fs-1',
    name: 'EliteShield Performance Men\'s Jacket',
    price: 255000,
    imageUrl: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=600',
    variant: 'L',
    quantity: 1,
    stock: 100,
    checked: false,
  },
  {
    id: 'cart-fs-3-Default',
    productId: 'fs-3',
    name: 'OptiZoom Camera Shoulder Bag',
    price: 250000,
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600',
    variant: 'Default',
    quantity: 2,
    stock: 30,
    checked: false,
  }
]

/**
 * Mock implementation of ICartService.
 * Manages shopping cart operations in-memory for testing and rapid development.
 */
export class MockCartService implements ICartService {
  private productService = new SupabaseProductService()

  async getCartItems(): Promise<CartItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    return [...MOCK_CART_ITEMS]
  }

  async addToCart(productId: string, variant: string, quantity: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    
    // Fetch product details from product mock service to ensure correct data
    const product = await this.productService.getProductById(productId)
    if (!product) {
      throw new Error('Produk tidak ditemukan')
    }

    const id = `cart-${productId}-${variant}`
    const existingIndex = MOCK_CART_ITEMS.findIndex((item) => item.id === id)

    if (existingIndex > -1) {
      const newQty = MOCK_CART_ITEMS[existingIndex].quantity + quantity
      if (newQty > product.stock) {
        MOCK_CART_ITEMS[existingIndex].quantity = product.stock
      } else {
        MOCK_CART_ITEMS[existingIndex].quantity = newQty
      }
      MOCK_CART_ITEMS[existingIndex].checked = true
    } else {
      MOCK_CART_ITEMS.push({
        id,
        productId,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        variant: variant || 'Default',
        quantity: quantity > product.stock ? product.stock : quantity,
        stock: product.stock,
        checked: true,
      })
    }
  }

  async removeFromCart(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100))
    MOCK_CART_ITEMS = MOCK_CART_ITEMS.filter((item) => item.id !== id)
  }

  async updateQuantity(id: string, quantity: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100))
    const index = MOCK_CART_ITEMS.findIndex((item) => item.id === id)
    if (index > -1) {
      const item = MOCK_CART_ITEMS[index]
      if (quantity < 1) {
        MOCK_CART_ITEMS[index].quantity = 1
      } else if (quantity > item.stock) {
        MOCK_CART_ITEMS[index].quantity = item.stock
      } else {
        MOCK_CART_ITEMS[index].quantity = quantity
      }
    }
  }

  async toggleCheckItem(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 50))
    const index = MOCK_CART_ITEMS.findIndex((item) => item.id === id)
    if (index > -1) {
      MOCK_CART_ITEMS[index].checked = !MOCK_CART_ITEMS[index].checked
    }
  }

  async toggleAllCheck(checked: boolean): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 50))
    MOCK_CART_ITEMS = MOCK_CART_ITEMS.map((item) => ({
      ...item,
      checked,
    }))
  }
}
