import { createClient } from './client'
import { ChatRoomRecord, ChatMessageRecord, ProductAttachment } from '@/core/types/chat'

export class SupabaseChatService {
  private supabase = createClient()

  /**
   * Dapatkan atau buat room chat unik untuk pembeli (User Auth atau Guest)
   */
  async getOrCreateRoom(userId?: string | null, guestInfo?: { name: string; email?: string; avatarUrl?: string }): Promise<ChatRoomRecord> {
    if (userId) {
      // Cek room yang terhubung ke user id ini
      const { data } = await this.supabase
        .from('chat_rooms')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)

      if (data && data.length > 0) {
        // Update user_name / avatar_url jika ada data baru dari profil auth
        const updatePayload: any = {}
        if (guestInfo?.name && guestInfo.name !== data[0].user_name) {
          updatePayload.user_name = guestInfo.name
          data[0].user_name = guestInfo.name
        }
        if (guestInfo?.avatarUrl && guestInfo.avatarUrl !== data[0].user_avatar_url) {
          updatePayload.user_avatar_url = guestInfo.avatarUrl
          data[0].user_avatar_url = guestInfo.avatarUrl
        }
        if (Object.keys(updatePayload).length > 0) {
          await this.supabase
            .from('chat_rooms')
            .update(updatePayload)
            .eq('id', data[0].id)
        }
        return this.mapRoomRecord(data[0])
      }
    }

    // Ambil/Buat Guest Session Token dari localStorage jika user belum login
    let guestSessionId: string | null = null
    if (!userId && typeof window !== 'undefined') {
      guestSessionId = localStorage.getItem('guest_chat_session_id')
      if (!guestSessionId) {
        guestSessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        localStorage.setItem('guest_chat_session_id', guestSessionId)
      }

      const { data } = await this.supabase
        .from('chat_rooms')
        .select('*')
        .eq('guest_session_id', guestSessionId)
        .limit(1)

      if (data && data.length > 0) {
        return this.mapRoomRecord(data[0])
      }
    }

    // Buat Room Baru di Supabase Database
    const newRoomPayload = {
      user_id: userId || null,
      guest_session_id: guestSessionId,
      user_name: guestInfo?.name || (userId ? 'Pembeli' : 'Pengunjung Toko'),
      user_email: guestInfo?.email || null,
      user_avatar_url: guestInfo?.avatarUrl || null,
      unread_count_admin: 0,
      unread_count_user: 0,
      last_message: 'Memulai percakapan',
    }

    const { data: created, error } = await this.supabase
      .from('chat_rooms')
      .insert(newRoomPayload)
      .select('*')
      .single()

    if (error) {
      console.error('Error creating chat room:', error)
      throw error
    }

    return this.mapRoomRecord(created)
  }

  /**
   * Ambil seluruh riwayat pesan dalam room tertentu
   */
  async getRoomMessages(roomId: string): Promise<ChatMessageRecord[]> {
    const { data, error } = await this.supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
      return []
    }

    return (data || []).map(this.mapMessageRecord)
  }

  /**
   * Kirim pesan baru ke Supabase
   */
  async sendMessage(
    roomId: string,
    senderType: 'user' | 'admin',
    text: string,
    product?: ProductAttachment | null,
    senderId?: string | null
  ): Promise<ChatMessageRecord> {
    const isUUID = (str?: string | null) =>
      Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str))

    const messagePayload = {
      room_id: roomId,
      sender_type: senderType,
      sender_id: isUUID(senderId) ? senderId : null,
      text: text.trim(),
      product_metadata: product || null,
    }

    const { data, error } = await this.supabase
      .from('chat_messages')
      .insert(messagePayload)
      .select('*')
      .single()

    if (error) {
      console.error('Error sending message:', error)
      throw error
    }

    // Update `last_message` dan `updated_at` di `chat_rooms`
    const lastMsgText = text.trim() || (product ? `[Lampiran Produk: ${product.name}]` : 'Pesan baru')
    
    // Increment unread counter sesuai tipe pengirim
    const updatePayload: any = {
      last_message: lastMsgText,
      updated_at: new Date().toISOString(),
    }

    if (senderType === 'user') {
      // Pembeli mengirim pesan -> increment unread admin
      const { data: currentRoom } = await this.supabase
        .from('chat_rooms')
        .select('unread_count_admin')
        .eq('id', roomId)
        .single()

      updatePayload.unread_count_admin = (currentRoom?.unread_count_admin || 0) + 1
    } else {
      // Admin mengirim pesan -> reset unread admin & increment unread user
      const { data: currentRoom } = await this.supabase
        .from('chat_rooms')
        .select('unread_count_user')
        .eq('id', roomId)
        .single()

      updatePayload.unread_count_admin = 0
      updatePayload.unread_count_user = (currentRoom?.unread_count_user || 0) + 1
    }

    await this.supabase
      .from('chat_rooms')
      .update(updatePayload)
      .eq('id', roomId)

    return this.mapMessageRecord(data)
  }

  /**
   * Mengambil detail room berdasarkan ID
   */
  async getRoomById(roomId: string): Promise<ChatRoomRecord | null> {
    const { data, error } = await this.supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', roomId)
      .single()

    if (error || !data) return null

    // Jika room terhubung ke registered user, enrich data dari tabel profiles
    if (data.user_id) {
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', data.user_id)
        .maybeSingle()

      if (profile) {
        if (profile.avatar_url) data.user_avatar_url = profile.avatar_url
        if (profile.full_name) data.user_name = profile.full_name
      }
    }

    return this.mapRoomRecord(data)
  }

  /**
   * Mengambil daftar seluruh room untuk Admin Panel
   */
  async getAdminRooms(): Promise<ChatRoomRecord[]> {
    const { data, error } = await this.supabase
      .from('chat_rooms')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching admin rooms:', error)
      return []
    }

    const rooms = data || []
    
    // Collect all unique user_ids
    const userIds = rooms.map(r => r.user_id).filter(Boolean) as string[]

    if (userIds.length > 0) {
      const { data: profiles } = await this.supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds)

      if (profiles && profiles.length > 0) {
        const profileMap = new Map(profiles.map(p => [p.id, p]))
        for (const room of rooms) {
          if (room.user_id && profileMap.has(room.user_id)) {
            const p = profileMap.get(room.user_id)!
            if (p.avatar_url) room.user_avatar_url = p.avatar_url
            if (p.full_name) room.user_name = p.full_name
          }
        }
      }
    }

    return rooms.map(this.mapRoomRecord)
  }

  /**
   * Reset unread count admin saat room dibuka di admin panel
   */
  async clearAdminUnread(roomId: string): Promise<void> {
    await this.supabase
      .from('chat_rooms')
      .update({ unread_count_admin: 0 })
      .eq('id', roomId)
  }

  /**
   * Realtime Listener untuk Pesan Baru di Room Spesifik
   */
  subscribeToRoomMessages(roomId: string, onMessageReceived: (message: ChatMessageRecord) => void) {
    return this.supabase
      .channel(`chat_messages_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          if (payload.new) {
            onMessageReceived(this.mapMessageRecord(payload.new))
          }
        }
      )
      .subscribe()
  }

  /**
   * Realtime Listener untuk Perubahan Room Admin
   */
  subscribeToAdminRooms(onRoomsChanged: () => void) {
    return this.supabase
      .channel('admin_chat_rooms_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms',
        },
        () => {
          onRoomsChanged()
        }
      )
      .subscribe()
  }

  private mapRoomRecord(row: any): ChatRoomRecord {
    return {
      id: row.id,
      userId: row.user_id,
      guestSessionId: row.guest_session_id,
      userName: row.user_name || 'Pembeli',
      userEmail: row.user_email,
      userAvatarUrl: row.user_avatar_url,
      unreadCountAdmin: row.unread_count_admin || 0,
      unreadCountUser: row.unread_count_user || 0,
      lastMessage: row.last_message,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  private mapMessageRecord(row: any): ChatMessageRecord {
    return {
      id: row.id,
      roomId: row.room_id,
      senderType: row.sender_type,
      senderId: row.sender_id,
      text: row.text,
      productMetadata: row.product_metadata,
      createdAt: row.created_at,
    }
  }
}
