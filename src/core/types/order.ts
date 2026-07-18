export type OrderStatus = 'unpaid' | 'processing' | 'shipped' | 'completed' | 'cancelled'

export interface OrderItemRecord {
  id: string
  orderId: string
  productId: string
  variantId?: string
  productName: string
  productImage?: string
  variantLabel?: string
  price: number
  quantity: number
}

export interface ShippingAddressData {
  recipientName: string
  phone: string
  fullAddress: string
  province: string
  city: string
  subdistrict: string
  postalCode: string
}

export interface OrderRecord {
  id: string
  orderNumber: string
  userId: string
  status: OrderStatus
  paymentMethod: string
  shippingCourier: string
  shippingCost: number
  subtotal: number
  discount: number
  totalAmount: number
  shippingAddress: ShippingAddressData
  items?: OrderItemRecord[]
  createdAt: string
  updatedAt: string
}

export interface CreateOrderPayload {
  userId: string
  shippingCourier: string
  shippingCost: number
  subtotal: number
  discount: number
  totalAmount: number
  shippingAddress: ShippingAddressData
  items: Array<{
    productId: string
    variantId?: string
    productName: string
    productImage?: string
    variantLabel?: string
    price: number
    quantity: number
  }>
}
