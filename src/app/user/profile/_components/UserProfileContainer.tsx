'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { SupabaseProfileService } from '@/services/supabase/profile.service'
import { UserProfile } from '@/core/types/profile'
import { FiLoader, FiSearch, FiMapPin } from 'react-icons/fi'
import Swal from 'sweetalert2'
import { playSwalSound } from '@/utils/sound'

interface SearchResult {
  id: string
  label: string
  province_name: string
  city_name: string
  district_name: string
  subdistrict_name: string
  zip_code: string
}

export function UserProfileContainer() {
  const { user } = useAuth()
  const profileService = useMemo(() => new SupabaseProfileService(), [])
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Mode Edit / View
  const [isEditing, setIsEditing] = useState(false)
  const [initialProfile, setInitialProfile] = useState<UserProfile | null>(null)

  // Form states
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [address, setAddress] = useState('')

  // Alamat states (diset lewat autocomplete search)
  const [province, setProvince] = useState('')
  const [provinceId, setProvinceId] = useState('')
  const [city, setCity] = useState('')
  const [cityId, setCityId] = useState('')
  const [subdistrict, setSubdistrict] = useState('')
  const [subdistrictId, setSubdistrictId] = useState('')
  const [postalCode, setPostalCode] = useState('')

  // Autocomplete search states
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isLocationSelected, setIsLocationSelected] = useState(false) // Blokir fetch setelah pilih lokasi

  // 1. Fetch user profile from Supabase profiles table on mount
  useEffect(() => {
    if (!user) return

    setLoading(true)
    profileService.getProfile(user.id).then(prof => {
      const defaultProf: UserProfile = prof || {
        id: user.id,
        email: user.email || '',
        fullName: user.user_metadata?.full_name || '',
      }
      setInitialProfile(defaultProf)
      
      setFullName(defaultProf.fullName || '')
      setEmail(defaultProf.email || '')
      setPhone(defaultProf.phone || '')
      setGender(defaultProf.gender || '')
      setBirthDate(defaultProf.birthDate || '')
      setAddress(defaultProf.address || '')
      
      setProvince(defaultProf.province || '')
      setProvinceId(defaultProf.provinceId || '')
      setCity(defaultProf.city || '')
      setCityId(defaultProf.cityId || '')
      setSubdistrict(defaultProf.subdistrict || '')
      setSubdistrictId(defaultProf.subdistrictId || '')
      setPostalCode(defaultProf.postalCode || '')

      if (defaultProf.subdistrict) {
        setSearchQuery(`${defaultProf.subdistrict}, ${defaultProf.city}, ${defaultProf.province}`)
      } else {
        setSearchQuery('')
      }
      
      setLoading(false)
    }).catch(err => {
      console.error('Gagal memuat profil user:', err)
      setLoading(false)
    })
  }, [user, profileService])

  // 2. Autocomplete search logic (debounced)
  useEffect(() => {
    // Jangan fetch jika lokasi sudah dipilih — tunggu user mengetik lagi
    if (isLocationSelected) return

    if (!isEditing || searchQuery.length < 3) {
      setSearchResults([])
      return
    }

    const delayDebounceFn = setTimeout(() => {
      setSearching(true)
      fetch(`/api/shipping/search-destination?q=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => {
          setSearchResults(data.results || [])
          setShowDropdown(true)
          setSearching(false)
        })
        .catch(err => {
          console.error("Gagal mencari lokasi:", err)
          setSearching(false)
        })
    }, 700) // Debounce 700ms untuk hemat kuota API

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery, isEditing, isLocationSelected])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Select location from search recommendations
  const handleSelectLocation = (loc: SearchResult) => {
    setIsLocationSelected(true) // Kunci agar useEffect tidak re-fetch setelah memilih
    setProvince(loc.province_name)
    setProvinceId('') // Tidak wajib di-set karena ongkir menggunakan subdistrictId
    setCity(loc.city_name)
    setCityId(loc.id) // Map ke ID Komerce yang valid

    // Gabungkan Kecamatan dan Desa agar sangat spesifik (cth: BALARAJA, SAGA)
    const subdistrictLabel = loc.district_name === loc.subdistrict_name
      ? loc.district_name
      : `${loc.district_name}, ${loc.subdistrict_name}`
    setSubdistrict(subdistrictLabel)
    
    setSubdistrictId(loc.id) // Map ke ID destinasi Komerce yang valid
    setPostalCode(loc.zip_code)
    
    setSearchQuery(loc.label) // Gunakan label bawaan Komerce yang lengkap
    setSearchResults([])
    setShowDropdown(false)
  }

  // Reset Form to initial data (Batal)
  const handleCancel = () => {
    if (initialProfile) {
      setFullName(initialProfile.fullName || '')
      setEmail(initialProfile.email || '')
      setPhone(initialProfile.phone || '')
      setGender(initialProfile.gender || '')
      setBirthDate(initialProfile.birthDate || '')
      setAddress(initialProfile.address || '')
      setProvince(initialProfile.province || '')
      setProvinceId(initialProfile.provinceId || '')
      setCity(initialProfile.city || '')
      setCityId(initialProfile.cityId || '')
      setSubdistrict(initialProfile.subdistrict || '')
      setSubdistrictId(initialProfile.subdistrictId || '')
      setPostalCode(initialProfile.postalCode || '')

      if (initialProfile.subdistrict) {
        setSearchQuery(`${initialProfile.subdistrict}, ${initialProfile.city}, ${initialProfile.province}`)
      } else {
        setSearchQuery('')
      }
    }
    setIsEditing(false)
  }

  // Handle Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Validasi: Lokasi harus dipilih via autocomplete
    if (!subdistrictId || !city || !province) {
      playSwalSound('confirm')
      Swal.fire({
        title: 'Lokasi Belum Valid',
        text: 'Silakan cari dan pilih Kecamatan / Kota Anda dari daftar hasil pencarian.',
        icon: 'warning',
        confirmButtonColor: '#e11d48',
      })
      return
    }

    // Konfirmasi dialog sebelum menyimpan
    playSwalSound('confirm')
    const confirmResult = await Swal.fire({
      title: 'Simpan Perubahan?',
      text: 'Apakah Anda yakin ingin menyimpan perubahan pada profil Anda?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Simpan!',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#71717a',
    })

    if (!confirmResult.isConfirmed) return

    setSaving(true)

    const payload: Partial<UserProfile> = {
      fullName,
      email: user.email || '',
      phone,
      gender,
      birthDate: birthDate || undefined,
      address,
      province,
      provinceId,
      city,
      cityId,
      subdistrict,
      subdistrictId,
      postalCode,
    }

    try {
      await profileService.updateProfile(user.id, payload)
      // Update data awal agar mode view membaca data yang baru disimpan
      const updatedProfile: UserProfile = {
        id: user.id,
        email: user.email || '',
        ...payload
      }
      setInitialProfile(updatedProfile)
      setIsEditing(false)

      playSwalSound('success')
      Swal.fire({
        icon: 'success',
        title: 'Profil Diperbarui',
        text: 'Data profil dan alamat pengiriman Anda berhasil disimpan.',
        confirmButtonColor: '#e11d48',
      })
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: err?.message || 'Terjadi kesalahan.',
        confirmButtonColor: '#e11d48',
      })
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-8 text-center">
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">Silakan masuk/login terlebih dahulu untuk mengelola profil.</p>
        <a href="/login?next=/user/profile" className="inline-block bg-rose-500 hover:bg-rose-600 text-white font-bold py-2.5 px-6 rounded transition-colors">
          Masuk ke Akun
        </a>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
        <FiLoader className="h-8 w-8 animate-spin mb-3 opacity-60" />
        <p className="text-sm">Memuat informasi profil...</p>
      </div>
    )
  }

  // Helper styling dinamis untuk input
  const getInputClass = (active: boolean, isEmail = false) => {
    const base = 'w-full rounded border px-3 py-2 text-zinc-800 dark:text-zinc-200 font-medium transition-all duration-200'
    if (isEmail) {
      return `${base} border-transparent bg-zinc-100/60 dark:bg-zinc-950/40 text-zinc-400 cursor-not-allowed`
    }
    return active 
      ? `${base} border-zinc-200 dark:border-zinc-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500` 
      : `${base} border-transparent bg-zinc-100/40 dark:bg-zinc-900/20 cursor-default select-none`
  }

  const getTextareaClass = (active: boolean) => {
    const base = 'w-full rounded border px-3 py-2 text-zinc-800 dark:text-zinc-200 font-medium transition-all duration-200 resize-none'
    return active
      ? `${base} border-zinc-200 dark:border-zinc-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500`
      : `${base} border-transparent bg-zinc-100/40 dark:bg-zinc-900/20 cursor-default select-none`
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start select-none">
      {/* Kolom 1: Data Pribadi */}
      <div className="bg-white dark:bg-zinc-900 rounded p-6 space-y-4">
        <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <h2 className="font-bold text-zinc-900 dark:text-white">Data Pribadi</h2>
        </div>

        {/* Nama Lengkap */}
        <div>
          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">Nama Lengkap</label>
          <input 
            type="text" 
            value={fullName} 
            onChange={e => setFullName(e.target.value)} 
            placeholder={isEditing ? "Nama Lengkap Anda" : "-"}
            required
            className={getInputClass(isEditing)}
            disabled={!isEditing}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">Email</label>
          <input 
            type="email" 
            value={email} 
            className={getInputClass(false, true)}
            disabled
          />
        </div>

        {/* No Telepon */}
        <div>
          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">No. Telepon / WhatsApp</label>
          <input 
            type="tel" 
            value={phone} 
            onChange={e => setPhone(e.target.value)} 
            placeholder={isEditing ? "Contoh: 08123456789" : "-"}
            className={getInputClass(isEditing)}
            disabled={!isEditing}
          />
        </div>

        {/* Jenis Kelamin */}
        <div>
          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">Jenis Kelamin</label>
          {!isEditing ? (
            <input 
              type="text" 
              value={gender || '-'} 
              className={getInputClass(false)} 
              disabled 
            />
          ) : (
            <select 
              value={gender} 
              onChange={e => setGender(e.target.value)}
              className="w-full rounded border px-3 py-2.5 text-zinc-800 dark:text-zinc-200 font-medium transition-all duration-200 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            >
              <option value="">Pilih Jenis Kelamin</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          )}
        </div>

        {/* Tanggal Lahir */}
        <div>
          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">Tanggal Lahir</label>
          <input 
            type="date" 
            value={birthDate} 
            onChange={e => setBirthDate(e.target.value)}
            className={getInputClass(isEditing)}
            disabled={!isEditing}
          />
        </div>
      </div>

      {/* Kolom 2: Alamat Pengiriman */}
      <div className="md:col-span-2 bg-white dark:bg-zinc-900 rounded p-6 space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h2 className="font-bold text-zinc-900 dark:text-white">
              Alamat Pengiriman (Siap RajaOngkir)
            </h2>
          </div>

          {/* Alamat Jalan Lengkap */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">Alamat Lengkap</label>
            <textarea 
              rows={3}
              value={address} 
              onChange={e => setAddress(e.target.value)} 
              placeholder={isEditing ? "Nama Jalan, RT/RW, Blok, No Rumah, Kelurahan" : "-"}
              required
              className={getTextareaClass(isEditing)}
              disabled={!isEditing}
            />
          </div>

          {/* Search Autocomplete / Readonly view */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {isEditing ? (
              /* INPUT SEARCH AUTOCOMPLETE (Saat Edit) */
              <div className="md:col-span-2 relative" ref={dropdownRef}>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Cari Kecamatan / Kota (RajaOngkir)
                </label>
                <div className="relative flex items-center">
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={e => {
                      setSearchQuery(e.target.value)
                      // Jika user mengetik ulang setelah memilih lokasi, buka kembali pencarian
                      if (isLocationSelected) setIsLocationSelected(false)
                    }}
                    placeholder="Masukkan nama Kelurahan atau Kecamatan"
                    required
                    className="w-full rounded border pl-10 pr-4 py-2.5 text-zinc-800 dark:text-zinc-200 font-medium transition-all duration-200 border-zinc-200 dark:border-zinc-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                  <FiSearch className="absolute left-3.5 w-4.5 h-4.5 text-zinc-400" />
                  {searching && (
                    <FiLoader className="absolute right-3.5 w-4.5 h-4.5 animate-spin text-rose-500" />
                  )}
                </div>

                {/* Dropdown Hasil Pencarian Autocomplete */}
                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-lg shadow-xl z-50 divide-y divide-zinc-100 dark:divide-zinc-900">
                    {searchResults.map(loc => (
                      <button
                        key={loc.id + '-' + loc.zip_code}
                        type="button"
                        onClick={() => handleSelectLocation(loc)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer"
                      >
                        <FiMapPin className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>{loc.label}</span>
                      </button>
                    ))}
                  </div>
                )}
                
                {showDropdown && searchResults.length === 0 && searchQuery.length >= 3 && !searching && (
                  <div className="absolute left-0 right-0 mt-1.5 p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl z-50 text-center text-xs text-zinc-400">
                    Lokasi tidak ditemukan. Coba ketik kata kunci lain.
                  </div>
                )}
              </div>
            ) : null}

            {/* Readonly Alamat Info (Muncul di mode view & edit sebagai info visual) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">Provinsi</label>
              <input 
                type="text" 
                value={province || '-'} 
                className={getInputClass(false)} 
                disabled 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">Kota / Kabupaten</label>
              <input 
                type="text" 
                value={city || '-'} 
                className={getInputClass(false)} 
                disabled 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">Kecamatan</label>
              <input 
                type="text" 
                value={subdistrict || '-'} 
                className={getInputClass(false)} 
                disabled 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">Kode Pos</label>
              <input 
                type="text" 
                value={postalCode || '-'} 
                className={getInputClass(false)} 
                disabled 
              />
            </div>

          </div>
        </div>

        {/* Action Button */}
        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 mt-6 flex justify-end">
          {!isEditing ? (
            <button 
              type="button"
              onClick={() => setIsEditing(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-8 rounded transition-colors cursor-pointer text-xs tracking-wider uppercase"
            >
              Perbarui Profil
            </button>
          ) : (
            <div className="flex gap-3">
              <button 
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold py-3 px-6 rounded transition-colors cursor-pointer text-xs tracking-wider uppercase disabled:opacity-60"
              >
                Batal
              </button>
              <button 
                type="submit"
                disabled={saving}
                className="bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-bold py-3 px-8 rounded transition-colors cursor-pointer text-xs tracking-wider uppercase"
              >
                {saving ? 'Menyimpan...' : 'Simpan Profil'}
              </button>
            </div>
          )}
        </div>
      </div>
    </form>
  )
}
