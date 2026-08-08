/**
 * Represents a verified real product review submitted by a buyer.
 */
export interface ProductReview {
  id: string
  orderId: string
  orderNumber: string
  productId: string
  userId: string
  userName: string
  userAvatarUrl?: string
  rating: number // 1 to 5
  comment?: string
  variantLabel?: string
  createdAt: string
}

/**
 * Represents a completed order item that is eligible for review.
 */
export interface EligibleOrderForReview {
  orderId: string
  orderNumber: string
  variantLabel?: string
  completedAt: string
}

/**
 * Buyer eligibility status for reviewing a specific product.
 */
export interface ReviewEligibility {
  isEligible: boolean
  eligibleOrders: EligibleOrderForReview[]
}
