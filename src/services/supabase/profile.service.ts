import { UserProfile } from '@/core/types/profile'
import { createClient } from './client'

export class SupabaseProfileService {
  private getClient() {
    return createClient()
  }

  private mapToUserProfile(row: Record<string, unknown>): UserProfile {
    return {
      id: row.id as string,
      email: row.email as string,
      fullName: (row.full_name as string) || undefined,
      avatarUrl: (row.avatar_url as string) || undefined,
      phone: (row.phone as string) || undefined,
      gender: (row.gender as string) || undefined,
      birthDate: (row.birth_date as string) || undefined,
      address: (row.address as string) || undefined,
      province: (row.province as string) || undefined,
      city: (row.city as string) || undefined,
      subdistrict: (row.subdistrict as string) || undefined,
      subdistrictId: (row.subdistrict_id as string) || undefined,
      postalCode: (row.postal_code as string) || undefined,
      createdAt: row.created_at as string,
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
    return this.mapToUserProfile(data as Record<string, unknown>)
  }

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    const supabase = this.getClient()
    
    // Siapkan payload dengan penamaan database (snake_case)
    const payload: Record<string, unknown> = { id: userId }
    if (data.email !== undefined) payload.email = data.email
    if (data.fullName !== undefined) payload.full_name = data.fullName
    if (data.avatarUrl !== undefined) payload.avatar_url = data.avatarUrl || null
    if (data.phone !== undefined) payload.phone = data.phone || null
    if (data.gender !== undefined) payload.gender = data.gender || null
    if (data.birthDate !== undefined) payload.birth_date = data.birthDate || null
    if (data.address !== undefined) payload.address = data.address || null
    if (data.province !== undefined) payload.province = data.province || null
    if (data.city !== undefined) payload.city = data.city || null
    if (data.subdistrict !== undefined) payload.subdistrict = data.subdistrict || null
    if (data.subdistrictId !== undefined) payload.subdistrict_id = data.subdistrictId || null
    if (data.postalCode !== undefined) payload.postal_code = data.postalCode || null

    payload.updated_at = new Date().toISOString()

    const { error } = await supabase
      .from('profiles')
      .upsert(payload)

    if (error) {
      throw new Error(`Gagal memperbarui profil: ${error.message}`)
    }
  }
}
