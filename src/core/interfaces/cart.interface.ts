import { CartItem } from '../types/cart'

/**
 * Service contract for managing shopping cart operations.
 */
export interface ICartService {
  /**
   * Fetches all items currently in the cart.
   */
  getCartItems(): Promise<CartItem[]>

  /**
   * Adds a product to the cart with a specific variant and quantity.
   */
  addToCart(productId: string, variant: string, quantity: number): Promise<void>

  /**
   * Removes an item from the cart.
   */
  removeFromCart(id: string): Promise<void>

  /**
   * Updates the quantity of a specific cart item.
   */
  updateQuantity(id: string, quantity: number): Promise<void>

  /**
   * Toggles the selection/checked status of a specific cart item.
   */
  toggleCheckItem(id: string): Promise<void>

  /**
   * Toggles the selection/checked status of all cart items.
   */
  toggleAllCheck(checked: boolean): Promise<void>
}
