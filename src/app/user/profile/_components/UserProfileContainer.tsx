'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { SupabaseProfileService } from '@/services/supabase/profile.service'
import { UserProfile } from '@/core/types/profile'
import { FiLoader } from 'react-icons/fi'
import Swal from 'sweetalert2'
import { playSwalSound } from '@/utils/sound'

interface ProvinceOption {
  province_id: string
  province: string
}

interface CityOption {
  city_id: string
  province_id: string
  province: string
  type: string
  city_name: string
  postal_code: string
}

interface SubdistrictOption {
  subdistrict_id: string
  city_id: string
  subdistrict_name: string
  postal_code: string
}

export function UserProfileContainer() {
  const { user } = useAuth()
  const profileService = useMemo(() => new SupabaseProfileService(), [])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [provinces, setProvinces] = useState<ProvinceOption[]>([])
  const [cities, setCities] = useState<CityOption[]>([])
  const [loadingCities, setLoadingCities] = useState(false)
  const [subdistricts, setSubdistricts] = useState<SubdistrictOption[]>([])
  const [loadingSubdistricts, setLoadingSubdistricts] = useState(false)

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
  const [provinceId, setProvinceId] = useState('')
  const [tempCityId, setTempCityId] = useState('') // Kota/Kabupaten terpilih sementara
  const [cityId, setCityId] = useState('') // Menyimpan ID Kota aslinya
  const [subdistrictId, setSubdistrictId] = useState('') // Menyimpan ID Kecamatan terpilih
  const [postalCode, setPostalCode] = useState('')

  // 1. Fetch Provinces list
  useEffect(() => {
    const cachedProvinces = sessionStorage.getItem('cached_provinces')
    if (cachedProvinces) {
      try {
        setProvinces(JSON.parse(cachedProvinces))
        return
      } catch (e) {
        console.warn('Gagal mem-parse cache provinsi:', e)
      }
    }

    fetch('/api/shipping/provinces')
      .then(res => res.json())
      .then(data => {
        const list = data?.rajaongkir?.results || []
        setProvinces(list)
        if (list.length > 0) {
          sessionStorage.setItem('cached_provinces', JSON.stringify(list))
        }
      })
      .catch(err => console.error('Gagal memuat provinsi:', err))
  }, [])

  // 2. Fetch Cities list when provinceId changes
  const fetchCities = useCallback((provId: string) => {
    if (!provId) {
      setCities([])
      return
    }

    const cacheKey = `cached_cities_${provId}`
    const cachedCities = sessionStorage.getItem(cacheKey)
    if (cachedCities) {
      try {
        setCities(JSON.parse(cachedCities))
        return
      } catch (e) {
        console.warn('Gagal mem-parse cache kota:', e)
      }
    }

    setLoadingCities(true)
    fetch(`/api/shipping/cities?provinceId=${provId}`)
      .then(res => res.json())
      .then(data => {
        const list = data?.rajaongkir?.results || []
        setCities(list)
        if (list.length > 0) {
          sessionStorage.setItem(cacheKey, JSON.stringify(list))
        }
        setLoadingCities(false)
      })
      .catch(err => {
        console.error('Gagal memuat kota:', err)
        setLoadingCities(false)
      })
  }, [])

  useEffect(() => {
    if (provinceId) {
      fetchCities(provinceId)
    }
  }, [provinceId, fetchCities])

  // 3. Fetch Subdistricts list when tempCityId changes
  const fetchSubdistricts = useCallback((cId: string) => {
    if (!cId) {
      setSubdistricts([])
      return
    }

    const cacheKey = `cached_districts_v2_${cId}`
    const cachedSubs = sessionStorage.getItem(cacheKey)
    if (cachedSubs) {
      try {
        setSubdistricts(JSON.parse(cachedSubs))
        return
      } catch (e) {
        console.warn('Gagal mem-parse cache kecamatan:', e)
      }
    }

    setLoadingSubdistricts(true)
    fetch(`/api/shipping/subdistricts?cityId=${cId}`)
      .then(res => res.json())
      .then(data => {
        const list = data?.rajaongkir?.results || []
        setSubdistricts(list)
        if (list.length > 0) {
          sessionStorage.setItem(cacheKey, JSON.stringify(list))
        }
        setLoadingSubdistricts(false)
      })
      .catch(err => {
        console.error('Gagal memuat kecamatan:', err)
        setLoadingSubdistricts(false)
      })
  }, [])

  useEffect(() => {
    if (tempCityId) {
      fetchSubdistricts(tempCityId)
    }
  }, [tempCityId, fetchSubdistricts])

  // 4. Fetch user profile from Supabase profiles table
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
      setProvinceId(defaultProf.provinceId || '')
      setTempCityId(defaultProf.cityId || '')
      setCityId(defaultProf.cityId || '')
      setSubdistrictId(defaultProf.subdistrictId || '')
      setPostalCode(defaultProf.postalCode || '')
      
      setLoading(false)
    }).catch(err => {
      console.error('Gagal memuat profil user:', err)
      setLoading(false)
    })
  }, [user, profileService])

  // 5. Reset Form to initial data (Batal)
  const handleCancel = () => {
    if (initialProfile) {
      setFullName(initialProfile.fullName || '')
      setEmail(initialProfile.email || '')
      setPhone(initialProfile.phone || '')
      setGender(initialProfile.gender || '')
      setBirthDate(initialProfile.birthDate || '')
      setAddress(initialProfile.address || '')
      setProvinceId(initialProfile.provinceId || '')
      setTempCityId(initialProfile.cityId || '')
      setCityId(initialProfile.cityId || '')
      setSubdistrictId(initialProfile.subdistrictId || '')
      setPostalCode(initialProfile.postalCode || '')
    }
    setIsEditing(false)
  }

  // 6. Handle Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

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

    // Cari nama provinsi, nama kota, dan nama kecamatan terpilih untuk disimpan
    const selectedProv = provinces.find(p => p.province_id === provinceId)?.province || ''
    const selectedCityObj = cities.find(c => c.city_id === tempCityId)
    const selectedCity = selectedCityObj 
      ? `${selectedCityObj.type} ${selectedCityObj.city_name}`
      : ''
    const selectedSubObj = subdistricts.find(s => s.subdistrict_id === subdistrictId)
    const selectedSub = selectedSubObj ? selectedSubObj.subdistrict_name : ''

    const payload: Partial<UserProfile> = {
      fullName,
      email: user.email || '',
      phone,
      gender,
      birthDate: birthDate || undefined,
      address,
      province: selectedProv,
      provinceId,
      city: selectedCity,
      cityId: tempCityId,
      subdistrict: selectedSub,
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

  const getSelectClass = (active: boolean) => {
    const base = 'w-full rounded border px-3 py-2.5 text-zinc-800 dark:text-zinc-200 font-medium transition-all duration-200'
    return active
      ? `${base} border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500`
      : `${base} border-transparent bg-zinc-100/40 dark:bg-zinc-900/20 cursor-default pointer-events-none appearance-none`
  }

  const getTextareaClass = (active: boolean) => {
    const base = 'w-full rounded border px-3.5 py-2.5 text-zinc-800 dark:text-zinc-200 font-medium resize-none transition-all duration-200'
    return active
      ? `${base} border-zinc-200 dark:border-zinc-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500`
      : `${base} border-transparent bg-zinc-100/40 dark:bg-zinc-900/20 cursor-default select-none`
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
      {/* Kolom 1: Data Diri */}
      <div className="md:col-span-1 bg-white dark:bg-zinc-900 rounded p-6 h-fit space-y-4">
        <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <h2 className="font-bold text-zinc-900 dark:text-white">
            Data Pribadi
          </h2>
        </div>

        {/* Nama Lengkap */}
        <div>
          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">Nama Lengkap</label>
          <input 
            type="text" 
            value={fullName} 
            onChange={e => setFullName(e.target.value)} 
            required
            className={getInputClass(isEditing)}
            disabled={!isEditing}
          />
        </div>

        {/* Email (Read Only) */}
        <div>
          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">Email</label>
          <input 
            type="email" 
            value={email} 
            disabled
            className={getInputClass(false, true)}
          />
        </div>

        {/* Telepon */}
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
          <select 
            value={gender} 
            onChange={e => setGender(e.target.value)}
            className={getSelectClass(isEditing)}
            disabled={!isEditing}
          >
            <option value="">{isEditing ? "Pilih Jenis Kelamin" : "-"}</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
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
              placeholder={isEditing ? "Nama Jalan, RT/RW, Blok, No Rumah, Kecamatan, Kelurahan" : "-"}
              required
              className={getTextareaClass(isEditing)}
              disabled={!isEditing}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Provinsi */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">Provinsi</label>
              <select 
                value={provinceId}
                onChange={e => {
                  setProvinceId(e.target.value)
                  setTempCityId('')
                  setSubdistrictId('')
                }}
                required
                className={getSelectClass(isEditing)}
                disabled={!isEditing}
              >
                <option value="">{isEditing ? "Pilih Provinsi" : "-"}</option>
                {provinces.map(p => (
                  <option key={p.province_id} value={p.province_id}>
                    {p.province}
                  </option>
                ))}
              </select>
            </div>

            {/* Kota / Kabupaten */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                Kota / Kabupaten {loadingCities && <span className="text-[10px] text-rose-500 animate-pulse">(Memuat...)</span>}
              </label>
              <select 
                value={tempCityId}
                onChange={e => {
                  setTempCityId(e.target.value)
                  setSubdistrictId('')
                }}
                required
                disabled={!provinceId || loadingCities || !isEditing}
                className={getSelectClass(isEditing)}
              >
                <option value="">{isEditing ? "Pilih Kota/Kabupaten" : "-"}</option>
                {cities.map(c => (
                  <option key={c.city_id} value={c.city_id}>
                    {c.type} {c.city_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Kecamatan */}
            <div className={tempCityId || !isEditing ? "md:col-span-2" : "hidden"}>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                Kecamatan {loadingSubdistricts && <span className="text-[10px] text-rose-500 animate-pulse">(Memuat...)</span>}
              </label>
              <select 
                value={subdistrictId}
                onChange={e => {
                  setSubdistrictId(e.target.value)
                  const selectedSub = subdistricts.find(s => s.subdistrict_id === e.target.value)
                  if (selectedSub?.postal_code) {
                    setPostalCode(selectedSub.postal_code)
                  }
                }}
                required={!!tempCityId}
                disabled={!tempCityId || loadingSubdistricts || !isEditing}
                className={getSelectClass(isEditing)}
              >
                <option value="">{isEditing ? "Pilih Kecamatan" : "-"}</option>
                {subdistricts.map(s => (
                  <option key={s.subdistrict_id} value={s.subdistrict_id}>
                    {s.subdistrict_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Kode Pos */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">Kode Pos</label>
              <input 
                type="text" 
                value={postalCode} 
                onChange={e => setPostalCode(e.target.value)} 
                required
                className={getInputClass(isEditing)}
                disabled={!isEditing}
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
