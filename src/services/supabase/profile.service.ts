import { UserProfile } from '@/core/types/profile'
import { createClient } from './client'

export class SupabaseProfileService {
  private getClient() {
    return createClient()
  }

  private mapToUserProfile(row: any): UserProfile {
    return {
      id: row.id,
      email: row.email,
      fullName: row.full_name || undefined,
      avatarUrl: row.avatar_url || undefined,
      phone: row.phone || undefined,
      gender: row.gender || undefined,
      birthDate: row.birth_date || undefined,
      address: row.address || undefined,
      province: row.province || undefined,
      provinceId: row.province_id || undefined,
      city: row.city || undefined,
      cityId: row.city_id || undefined,
      postalCode: row.postal_code || undefined,
      createdAt: row.created_at,
    }
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching profile from Supabase:', error)
      return null
    }

    if (!data) return null
    return this.mapToUserProfile(data)
  }

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    const supabase = this.getClient()
    
    // Siapkan payload dengan penamaan database (snake_case)
    const payload: any = { id: userId }
    if (data.email !== undefined) payload.email = data.email
    if (data.fullName !== undefined) payload.full_name = data.fullName
    if (data.avatarUrl !== undefined) payload.avatar_url = data.avatarUrl
    if (data.phone !== undefined) payload.phone = data.phone
    if (data.gender !== undefined) payload.gender = data.gender
    if (data.birthDate !== undefined) payload.birth_date = data.birthDate
    if (data.address !== undefined) payload.address = data.address
    if (data.province !== undefined) payload.province = data.province
    if (data.provinceId !== undefined) payload.province_id = data.provinceId
    if (data.city !== undefined) payload.city = data.city
    if (data.cityId !== undefined) payload.city_id = data.cityId
    if (data.postalCode !== undefined) payload.postal_code = data.postalCode

    payload.updated_at = new Date().toISOString()

    const { error } = await supabase
      .from('profiles')
      .upsert(payload)

    if (error) {
      throw new Error(`Gagal memperbarui profil: ${error.message}`)
    }
  }
}
