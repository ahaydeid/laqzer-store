/**
 * Represents an item in the shopping cart.
 */
export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  imageUrl: string
  variant: string
  variants?: string[]
  quantity: number
  stock: number
  checked: boolean
  weight: number
}
