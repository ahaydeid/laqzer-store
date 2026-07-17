export interface DiscountItem {
  id: string
  campaignName: string
  productId: string
  productName: string
  originalPrice: number
  priceAfterDiscount: number
  discountPercent: number
  isActive: boolean
  startDate: string
  endDate: string
}

export interface VoucherItem {
  code: string
  campaignName: string
  type: 'percent' | 'nominal'
  value: number
  minPurchase: number
  quota: number
  expiryDate: string
  status: 'active' | 'inactive'
}

export interface PopupAdConfig {
  isActive: boolean
  title: string
  description: string
  imageUrl: string
  buttonText: string
  targetUrl: string
}

export interface MockProduct {
  id: string
  name: string
  price: number
  imageUrl: string
}
