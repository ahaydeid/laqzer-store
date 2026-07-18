export interface UserProfile {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
  phone?: string
  gender?: string
  birthDate?: string // YYYY-MM-DD
  address?: string
  province?: string
  provinceId?: string
  city?: string
  cityId?: string
  subdistrict?: string
  subdistrictId?: string
  postalCode?: string
  createdAt?: string
}
