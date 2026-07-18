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
  city?: string
  subdistrict?: string
  subdistrictId?: string // ID destinasi Komerce — satu-satunya ID yang digunakan untuk ongkir
  postalCode?: string
  createdAt?: string
}
