import { createClient } from './client'
import { OrderRecord, OrderItemRecord, CreateOrderPayload, OrderStatus } from '@/core/types/order'

export class SupabaseOrderService {
  private getClient() {
    return createClient()
  }

  private mapToOrderRecord(row: any, items: OrderItemRecord[] = []): OrderRecord {
    return {
      id: row.id,
      orderNumber: row.order_number,
      userId: row.user_id,
      status: row.status as OrderStatus,
      paymentMethod: row.payment_method || '-',
      shippingCourier: row.shipping_courier,
      shippingCost: Number(row.shipping_cost || 0),
      subtotal: Number(row.subtotal || 0),
      discount: Number(row.discount || 0),
      totalAmount: Number(row.total_amount || 0),
      shippingAddress: typeof row.shipping_address === 'string' ? JSON.parse(row.shipping_address) : row.shipping_address,
      items,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  private mapToOrderItemRecord(row: any): OrderItemRecord {
    return {
      id: row.id,
      orderId: row.order_id,
      productId: row.product_id,
      variantId: row.variant_id || undefined,
      productName: row.product_name,
      productImage: row.product_image || undefined,
      variantLabel: row.variant_label || undefined,
      price: Number(row.price),
      quantity: Number(row.quantity),
    }
  }

  /**
   * Membuat Pesanan Baru dari Checkout
   */
  async createOrder(payload: CreateOrderPayload): Promise<OrderRecord> {
    const supabase = this.getClient()
    
    // Generasi Nomor Order unik: ORD-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const randomHex = Math.floor(1000 + Math.random() * 9000)
    const orderNumber = `ORD-${dateStr}-${randomHex}`

    const orderPayload = {
      order_number: orderNumber,
      user_id: payload.userId,
      status: 'unpaid',
      payment_method: '-', // Default belum diatur
      shipping_courier: payload.shippingCourier,
      shipping_cost: payload.shippingCost,
      subtotal: payload.subtotal,
      discount: payload.discount,
      total_amount: payload.totalAmount,
      shipping_address: payload.shippingAddress,
    }

    // Insert ke tabel orders
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select()
      .single()

    if (orderError || !orderData) {
      console.error('Gagal membuat pesanan:', orderError)
      throw new Error(`Gagal membuat pesanan: ${orderError?.message || 'Terjadi kesalahan'}`)
    }

    // Insert items ke tabel order_items
    const itemsPayload = payload.items.map(item => ({
      order_id: orderData.id,
      product_id: item.productId,
      variant_id: item.variantId || null,
      product_name: item.productName,
      product_image: item.productImage || null,
      variant_label: item.variantLabel || null,
      price: item.price,
      quantity: item.quantity,
    }))

    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsPayload)
      .select()

    if (itemsError) {
      console.error('Gagal menyimpan detail produk pesanan:', itemsError)
    }

    const insertedItems = (itemsData || []).map(row => this.mapToOrderItemRecord(row))
    return this.mapToOrderRecord(orderData, insertedItems)
  }

  /**
   * Mengambil daftar pesanan milik pengguna tertentu
   */
  async getUserOrders(userId: string): Promise<OrderRecord[]> {
    const supabase = this.getClient()

    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (ordersError || !ordersData) {
      console.error('Gagal mengambil pesanan user:', ordersError)
      return []
    }

    if (ordersData.length === 0) return []

    const orderIds = ordersData.map(o => o.id)

    const { data: itemsData } = await supabase
      .from('order_items')
      .select('*')
      .in('order_id', orderIds)

    const itemsMap = new Map<string, OrderItemRecord[]>()
    ;(itemsData || []).forEach(row => {
      const item = this.mapToOrderItemRecord(row)
      const list = itemsMap.get(item.orderId) || []
      list.push(item)
      itemsMap.set(item.orderId, list)
    })

    return ordersData.map(orderRow => this.mapToOrderRecord(orderRow, itemsMap.get(orderRow.id) || []))
  }

  /**
   * Mengambil semua pesanan untuk Admin Panel
   */
  async getAllOrdersAdmin(): Promise<OrderRecord[]> {
    const supabase = this.getClient()

    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (ordersError || !ordersData) {
      console.error('Gagal mengambil daftar pesanan admin:', ordersError)
      return []
    }

    if (ordersData.length === 0) return []

    const orderIds = ordersData.map(o => o.id)

    const { data: itemsData } = await supabase
      .from('order_items')
      .select('*')
      .in('order_id', orderIds)

    const itemsMap = new Map<string, OrderItemRecord[]>()
    ;(itemsData || []).forEach(row => {
      const item = this.mapToOrderItemRecord(row)
      const list = itemsMap.get(item.orderId) || []
      list.push(item)
      itemsMap.set(item.orderId, list)
    })

    return ordersData.map(orderRow => this.mapToOrderRecord(orderRow, itemsMap.get(orderRow.id) || []))
  }

  /**
   * Memperbarui Status Pesanan (Dapat diubah Admin atau Pembeli untuk status 'completed')
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    const supabase = this.getClient()
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    if (error) {
      throw new Error(`Gagal memperbarui status pesanan: ${error.message}`)
    }
  }

  /**
   * Memperbarui Metode Pembayaran Pesanan (Hanya Admin)
   */
  async updatePaymentMethod(orderId: string, paymentMethod: string): Promise<void> {
    const supabase = this.getClient()
    const { error } = await supabase
      .from('orders')
      .update({ payment_method: paymentMethod, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    if (error) {
      throw new Error(`Gagal memperbarui metode pembayaran: ${error.message}`)
    }
  }
}
