"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/components/providers/AuthProvider'
import { StoreSettings } from '@/core/types/store'
import { SupabaseProfileService } from '@/services/supabase/profile.service'
import { UserProfile } from '@/core/types/profile'
import { FiChevronLeft, FiTag, FiLoader } from 'react-icons/fi'
import Swal from 'sweetalert2'
import { Modal } from '@/components/ui/Modal'

interface CheckoutContainerProps {
  settings: StoreSettings
}

interface CourierOption {
  id: string
  name: string
  service: string
  cost: number
  etd: string
}

export function CheckoutContainer({ settings }: CheckoutContainerProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { items, clearCheckedItems } = useCart()
  
  const profileService = useMemo(() => new SupabaseProfileService(), [])

  // 1. Get checked items from cart
  const checkedItems = items.filter((item) => item.checked)

  const [isOrderPlaced, setIsOrderPlaced] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [couriers, setCouriers] = useState<CourierOption[]>([])
  const [selectedCourier, setSelectedCourier] = useState<CourierOption | null>(null)
  const [loadingShipping, setLoadingShipping] = useState(false)
  const [shippingError, setShippingError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Memoize checkedItems to prevent redundant re-renders
  const checkedItemsHash = useMemo(() => {
    return JSON.stringify(checkedItems.map(i => `${i.id}-${i.quantity}`))
  }, [checkedItems])

  // Redirect to cart if no items checked
  useEffect(() => {
    if (checkedItems.length === 0 && !isOrderPlaced) {
      Swal.fire({
        title: 'Akses Ditolak',
        text: 'Anda tidak memiliki produk untuk di-checkout. Silakan pilih produk terlebih dahulu.',
        icon: 'warning',
        confirmButtonColor: '#18181b',
        confirmButtonText: 'Kembali ke Keranjang',
      }).then(() => {
        router.push('/cart')
      })
    }
  }, [checkedItems.length, router, isOrderPlaced])

  // 2. Fetch User Profile
  useEffect(() => {
    if (!user) {
      setLoadingProfile(false)
      return
    }

    setLoadingProfile(true)
    profileService.getProfile(user.id).then((prof) => {
      setProfile(prof)
      setLoadingProfile(false)
    }).catch(err => {
      console.error('Error memuat profil di checkout:', err)
      setLoadingProfile(false)
    })
  }, [user, profileService])

  // 3. Fetch Shipping Cost from RajaOngkir
  useEffect(() => {
    if (!profile || !profile.cityId || checkedItems.length === 0) return

    // Hitung total berat belanjaan berdasarkan berat produk asli
    const totalWeight = checkedItems.reduce((acc, item) => acc + ((item.weight || 500) * item.quantity), 0)
    setLoadingShipping(true)
    setShippingError(null)

    fetch('/api/shipping/cost', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        destinationCityId: profile.cityId,
        weightInGrams: totalWeight
      })
    })
    .then(async (res) => {
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Gagal memuat tarif ongkir')
      }
      return data
    })
    .then(data => {
      const list = data?.rajaongkir?.results || []
      setCouriers(list)
      if (list.length > 0) {
        setSelectedCourier(list[0])
      } else {
        setSelectedCourier(null)
      }
      setLoadingShipping(false)
    })
    .catch(err => {
      console.error('Gagal fetch shipping cost:', err)
      setShippingError(err?.message || 'Gagal terhubung ke RajaOngkir API')
      setCouriers([])
      setSelectedCourier(null)
      setLoadingShipping(false)
    })
  }, [profile?.cityId, checkedItemsHash])

  // Delivery Estimate formatter
  const getDeliveryEstimate = (courier: CourierOption | null) => {
    if (!courier) return { single: '-', range: '-' }
    const etd = courier.etd || '2-3'
    // Bersihkan non-numeric
    const cleanEtd = etd.replace(/[^0-9\-]/g, '')
    if (!cleanEtd) {
      return { single: etd, range: etd }
    }
    return {
      single: `${cleanEtd} Hari`,
      range: `${cleanEtd} Hari`
    }
  }


  const deliveryEstimate = getDeliveryEstimate(selectedCourier)

  // Voucher State
  const [voucherInput, setVoucherInput] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string
    type: 'percent' | 'fixed'
    value: number
    maxDiscount?: number
  } | null>(null)

  // Calculations
  const productSubtotal = checkedItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  )

  let discount = 0
  if (appliedVoucher && productSubtotal > 0) {
    if (appliedVoucher.type === 'percent') {
      const calculated = productSubtotal * (appliedVoucher.value / 100)
      discount = appliedVoucher.maxDiscount
        ? Math.min(calculated, appliedVoucher.maxDiscount)
        : calculated
    } else {
      discount = Math.min(appliedVoucher.value, productSubtotal)
    }
  }

  const shippingCost = selectedCourier ? selectedCourier.cost : 0
  const grandTotal = Math.max(0, productSubtotal + shippingCost - discount)

  // Voucher Handler
  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanCode = voucherInput.trim().toUpperCase()
    if (!cleanCode) return

    if (cleanCode === 'LAQZERNEW') {
      setAppliedVoucher({
        code: 'LAQZERNEW',
        type: 'percent',
        value: 10,
      })
      Swal.fire({
        title: 'Voucher Berhasil!',
        text: 'Diskon 10% telah diterapkan pada pesanan Anda.',
        icon: 'success',
        confirmButtonColor: '#e11d48',
        confirmButtonText: 'Oke',
      })
    } else if (cleanCode === 'DISKON50') {
      setAppliedVoucher({
        code: 'DISKON50',
        type: 'percent',
        value: 50,
        maxDiscount: 50000,
      })
      Swal.fire({
        title: 'Voucher Berhasil!',
        text: 'Diskon 50% (Maks. Rp50.000) telah diterapkan.',
        icon: 'success',
        confirmButtonColor: '#e11d48',
        confirmButtonText: 'Oke',
      })
    } else {
      Swal.fire({
        title: 'Voucher Tidak Valid',
        text: 'Kode voucher salah atau tidak berlaku.',
        icon: 'error',
        confirmButtonColor: '#e11d48',
        confirmButtonText: 'Oke',
      })
    }
  }

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null)
    setVoucherInput('')
  }

  // Submit Order via WhatsApp
  const getWhatsAppLink = (messageText: string) => {
    const storePhone = settings.phone || ''
    const cleanPhone = storePhone.replace(/[^0-9]/g, '')
    const formattedPhone = cleanPhone.startsWith('0')
      ? '62' + cleanPhone.slice(1)
      : cleanPhone
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(messageText)}`
  }

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCourier) {
      Swal.fire({
        title: 'Kurir Belum Dipilih',
        text: 'Silakan pilih opsi pengiriman terlebih dahulu.',
        icon: 'warning',
        confirmButtonColor: '#e11d48',
      })
      return
    }

    Swal.fire({
      title: 'Memproses Pesanan...',
      html: 'Sedang membuat pesanan Anda, mohon tunggu sebentar.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading()
      }
    })

    setTimeout(() => {
      let confirmMessage = `Halo *${settings.name}*, saya ingin melakukan konfirmasi pembayaran untuk pesanan saya:\n\n`
      confirmMessage += `*Rincian Pesanan:*\n`
      checkedItems.forEach((item, index) => {
        confirmMessage += `${index + 1}. ${item.name} (${item.variant}) x${item.quantity}\n`
      })
      confirmMessage += `\n`
      confirmMessage += `- *Kurir*: ${selectedCourier.name} (${selectedCourier.service})\n`
      confirmMessage += `- *Alamat*: ${profile?.address || ''}, ${profile?.city || ''}, ${profile?.province || ''}\n`
      confirmMessage += `- *Total Pembayaran: Rp ${grandTotal.toLocaleString('id-ID')}*\n\n`
      confirmMessage += `Berikut bukti transfer pembayaran akan saya lampirkan setelah pesan ini. Mohon segera diproses, terima kasih!`

      const waLink = getWhatsAppLink(confirmMessage)

      setIsOrderPlaced(true)
      clearCheckedItems()

      Swal.fire({
        icon: 'success',
        title: 'Pemesanan Berhasil!',
        html: `
          <div class="text-center font-sans">
            <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Silakan lakukan pembayaran transfer bank sesuai instruksi, kemudian kirim bukti pembayaran Anda melalui WhatsApp.
            </p>
            <div class="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-left text-xs space-y-1 mb-4">
              <p class="font-bold text-zinc-800 dark:text-zinc-200">Rincian Pembayaran:</p>
              <p class="text-zinc-600 dark:text-zinc-400">Total Tagihan: <span class="font-bold text-rose-500">Rp ${grandTotal.toLocaleString('id-ID')}</span></p>
              <p class="text-zinc-600 dark:text-zinc-400">Transfer BCA: <span class="font-bold">8415-1290-88</span> (a.n. Puspa Meylinia Inakhota)</p>
              <p class="text-zinc-600 dark:text-zinc-400">Transfer Mandiri: <span class="font-bold">137-002-199-2831</span> (a.n. Puspa Meylinia Inakhota)</p>
            </div>
          </div>
        `,
        confirmButtonColor: '#10b981',
        confirmButtonText: 'Konfirmasi Pembayaran (WA)',
        allowOutsideClick: false,
        allowEscapeKey: false,
      }).then((result) => {
        if (result.isConfirmed) {
          window.open(waLink, '_blank')
          router.push('/user/purchase')
        }
      })
    }, 1500)
  }

  if (checkedItems.length === 0 && !isOrderPlaced) {
    return null
  }

  if (!user) {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded p-8 text-center max-w-md mx-auto space-y-4">
        <p className="text-zinc-600 dark:text-zinc-400">Silakan login untuk melanjutkan checkout pesanan Anda.</p>
        <Link href="/login?next=/checkout" className="inline-block bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-6 rounded text-xs tracking-wider uppercase">
          Masuk ke Akun
        </Link>
      </div>
    )
  }

  if (loadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
        <FiLoader className="h-8 w-8 animate-spin mb-3 opacity-60" />
        <p className="text-sm">Memuat profil dan ongkir...</p>
      </div>
    )
  }

  const isAddressIncomplete = !profile || !profile.address || !profile.cityId

  if (isAddressIncomplete) {
    return (
      <div className="space-y-6 max-w-xl mx-auto">
        <div className="rounded bg-white dark:bg-zinc-950 p-8 border border-zinc-200 dark:border-zinc-900 text-center space-y-4">
          <div className="text-rose-500 text-4xl flex justify-center">⚠️</div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Alamat Pengiriman Belum Lengkap</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Anda harus mengisi alamat lengkap, provinsi, dan kota/kabupaten di profil Anda terlebih dahulu untuk menghitung ongkos kirim.
          </p>
          <Link 
            href="/user/profile"
            className="inline-block bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-6 rounded text-xs tracking-wider uppercase cursor-pointer"
          >
            Lengkapi Alamat Profil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-2.5 border-b border-zinc-100 dark:border-zinc-900 pb-5">
        <Link
          href="/cart"
          className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          aria-label="Kembali ke Keranjang"
        >
          <FiChevronLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
          Penyelesaian Pesanan
        </h2>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Address form, Products, Couriers */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Address Form Card */}
          <div className="rounded bg-white dark:bg-zinc-950 p-5 space-y-3">
            <div className="flex items-baseline border-b border-zinc-100 dark:border-zinc-900 pb-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Alamat Pengiriman
              </h3>
              <Link 
                href="/user/profile"
                className="ml-3 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer outline-none"
              >
                Ubah Alamat
              </Link>
            </div>
            
            <div className="space-y-1 text-sm text-zinc-800 dark:text-zinc-200">
              <div className="flex items-center gap-2">
                <span className="font-bold">{profile.fullName || user.user_metadata?.full_name}</span>
                <span className="text-zinc-400 dark:text-zinc-600">|</span>
                <span className="text-zinc-650 dark:text-zinc-400 font-medium">{profile.phone || '-'}</span>
                <span className="ml-auto text-[10px] font-bold text-rose-500 tracking-wide px-1.5 py-0.5 border border-rose-500 rounded-sm scale-90">Utama</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                {profile.address}
              </p>
              <p className="text-zinc-500 dark:text-zinc-550 text-xs">
                {profile.city}, {profile.province}, {profile.postalCode}
              </p>
            </div>
          </div>

          {/* Product Items Summary List */}
          <div className="rounded bg-white dark:bg-zinc-950 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Rincian Produk Dipesan
              </h3>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {checkedItems.map((item) => (
                <div key={item.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-16 w-16 rounded object-cover bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                        {item.name}
                      </h4>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        Varian: {item.variant} • QTY: {item.quantity} pcs
                      </span>
                    </div>
                    <div className="flex justify-between items-end mt-1">
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        Rp {item.price.toLocaleString('id-ID')} / pcs
                      </span>
                      <span className="text-sm font-bold text-rose-500">
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Opsi Pengiriman Block */}
          <div className="rounded bg-white dark:bg-zinc-950 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-y border-dashed border-zinc-200 dark:border-zinc-800 py-4">
              <div className="text-sm">
                <span className="font-bold text-zinc-900 dark:text-white">Opsi Pengiriman:</span>
                {loadingShipping ? (
                  <span className="ml-2 text-xs text-rose-500 animate-pulse">Menghitung tarif ongkos kirim...</span>
                ) : shippingError ? (
                  <span className="ml-2 text-xs text-red-500 font-medium">Gagal memuat tarif: {shippingError}</span>
                ) : selectedCourier ? (
                  <>
                    <span className="ml-2 font-medium text-rose-500 dark:text-zinc-200">{selectedCourier.name} ({selectedCourier.service})</span>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="ml-4 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Ubah
                    </button>
                  </>
                ) : (
                  <span className="ml-2 text-xs text-rose-500">Opsi pengiriman tidak tersedia.</span>
                )}
              </div>
              <div className="text-right sm:text-right shrink-0">
                <span className="text-sm font-bold text-zinc-900 dark:text-white">
                  {loadingShipping ? '...' : selectedCourier ? `Rp ${selectedCourier.cost.toLocaleString('id-ID')}` : 'Rp 0'}
                </span>
              </div>
            </div>

            {/* Sub-bar below it */}
            {!loadingShipping && selectedCourier && (
              <div
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 cursor-pointer hover:underline py-1"
              >
                <svg className="h-4 w-4 shrink-0 fill-current" viewBox="0 0 24 24">
                  <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm12 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm2-7.5h-3V9h3v2z" />
                </svg>
                <span>Garansi tiba {deliveryEstimate.range} dengan {selectedCourier.name}</span>
                <span className="ml-auto text-zinc-400 dark:text-zinc-500 font-bold">›</span>
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Payment Methods, Voucher, Billing details */}
        <div className="space-y-4">

          {/* Billing & Order Total Card */}
          <div className="rounded bg-white dark:bg-zinc-950 p-5 space-y-4">
            <h3 className="text-sm font-extrabold tracking-tight text-zinc-950 dark:text-white uppercase">
              Rincian Pembayaran
            </h3>

            {/* Voucher Section inside right panel */}
            <div className="pt-1">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">
                Voucher Toko
              </label>
              {appliedVoucher ? (
                <div className="flex items-center justify-between gap-2 p-2 bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <FiTag className="h-4 w-4 text-emerald-600 dark:text-emerald-455 shrink-0" />
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 truncate">
                      {appliedVoucher.code}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveVoucher}
                    className="text-[10px] font-medium text-rose-500 hover:text-rose-700 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value)}
                    placeholder="Masukkan voucher di sini..."
                    className="flex-1 rounded border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-white"
                  />
                  <button
                    type="button"
                    onClick={handleApplyVoucher}
                    className="rounded bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition-all cursor-pointer"
                  >
                    Pakai
                  </button>
                </div>
              )}
            </div>

            <hr className="border-zinc-100 dark:border-zinc-900" />

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                <span>Subtotal Produk</span>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  Rp {productSubtotal.toLocaleString('id-ID')}
                </span>
              </div>
              
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                <span>Subtotal Pengiriman (Ongkir)</span>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {loadingShipping ? '...' : `Rp ${shippingCost.toLocaleString('id-ID')}`}
                </span>
              </div>

              {appliedVoucher && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Diskon Voucher ({appliedVoucher.code})</span>
                  <span>-Rp {discount.toLocaleString('id-ID')}</span>
                </div>
              )}

              <hr className="border-zinc-100 dark:border-zinc-900 pt-1" />

              <div className="flex justify-between text-sm font-bold text-zinc-950 dark:text-white">
                <span>Total Pembayaran</span>
                <span className="text-lg text-rose-500">
                  Rp {grandTotal.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Submit Order Button */}
            <button
              type="submit"
              disabled={loadingShipping || !selectedCourier}
              className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white py-3 px-4 text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>Buat Pesanan</span>
            </button>
          </div>
        </div>

      </form>

      {/* Shipping List Selection Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Pilih Opsi Pengiriman"
        size="md"
      >
        <div className="space-y-3 px-6 pb-6 pt-2">
          {couriers.map((option) => {
            const est = getDeliveryEstimate(option)
            const isSelected = selectedCourier ? selectedCourier.id === option.id : false
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setSelectedCourier(option)
                  setIsModalOpen(false)
                }}
                className={`w-full flex items-center justify-between p-4 rounded text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-rose-600 bg-white border-2 dark:border-white dark:bg-zinc-900'
                    : 'bg-slate-50 border-none focus:border-slate-300 hover:border-slate-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                    {option.name} ({option.service})
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
                    Estimasi tiba: {est.range}
                  </span>
                </div>
                <span className="text-xs font-bold text-rose-500">
                  Rp {option.cost.toLocaleString('id-ID')}
                </span>
              </button>
            )
          })}
        </div>
      </Modal>

    </div>
  )
}
