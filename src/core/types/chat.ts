export interface ProductAttachment {
  id: string
  name: string
  price: number
  imageUrl: string
  variant?: string
}

export interface ChatRoomRecord {
  id: string
  userId?: string | null
  guestSessionId?: string | null
  userName: string
  userEmail?: string | null
  unreadCountAdmin: number
  unreadCountUser: number
  lastMessage?: string | null
  createdAt: string
  updatedAt: string
}

export interface ChatMessageRecord {
  id: string
  roomId: string
  senderType: 'user' | 'admin'
  senderId?: string | null
  text: string
  productMetadata?: ProductAttachment | null
  createdAt: string
}
