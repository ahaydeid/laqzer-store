"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { StoreSettings } from '@/core/types/store'
import { FiChevronLeft, FiTag } from 'react-icons/fi'
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

const COURIER_OPTIONS: CourierOption[] = [
  { id: 'jne-reg', name: 'JNE', service: 'Reguler', cost: 15000, etd: '2-3 Hari' },
  { id: 'jnt-reg', name: 'J&T', service: 'Express', cost: 16000, etd: '1-2 Hari' },
  { id: 'sicepat-reg', name: 'SiCepat', service: 'Reguler', cost: 14000, etd: '2-3 Hari' },
  { id: 'gosend-instant', name: 'GoSend', service: 'Instant (Sameday)', cost: 25000, etd: '3-6 Jam' },
]

export function CheckoutContainer({ settings }: CheckoutContainerProps) {
  const router = useRouter()
  const { items, clearCheckedItems } = useCart()

  // 1. Get checked items from cart
  const checkedItems = items.filter((item) => item.checked)

  // Redirect to cart if no items checked
  useEffect(() => {
    if (checkedItems.length === 0) {
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
  }, [checkedItems.length, router])



  // Shipping State
  const [selectedCourier, setSelectedCourier] = useState<CourierOption>(COURIER_OPTIONS[0])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const getDeliveryEstimate = (courierId: string) => {
    const today = new Date(2026, 6, 14) // July 14, 2026
    if (courierId.includes('instant')) {
      return {
        single: 'Hari Ini',
        range: 'Hari Ini (3-6 Jam)'
      }
    }
    const minDays = courierId === 'jnt-reg' ? 1 : 2
    const maxDays = courierId === 'jnt-reg' ? 2 : 3
    const minDate = new Date(today)
    minDate.setDate(today.getDate() + minDays)
    const maxDate = new Date(today)
    maxDate.setDate(today.getDate() + maxDays)
    const formatDayMonth = (d: Date) => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des']
      return `${d.getDate()} ${monthNames[d.getMonth()]}`
    }
    return {
      single: formatDayMonth(maxDate),
      range: `${formatDayMonth(minDate)} - ${formatDayMonth(maxDate)}`
    }
  }

  const deliveryEstimate = getDeliveryEstimate(selectedCourier.id)

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

  const shippingCost = selectedCourier.cost
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
        confirmButtonColor: '#18181b',
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
        confirmButtonColor: '#18181b',
        confirmButtonText: 'Oke',
      })
    } else {
      Swal.fire({
        title: 'Voucher Tidak Valid',
        text: 'Kode voucher salah atau tidak berlaku.',
        icon: 'error',
        confirmButtonColor: '#18181b',
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

    // Build message
    let message = `Halo *${settings.name}*, saya ingin melakukan pemesanan baru dengan detail berikut:\n\n`
    
    message += `*Daftar Produk:*\n`
    checkedItems.forEach((item, index) => {
      message += `${index + 1}. ${item.name} (${item.variant}) x${item.quantity} - Rp ${(item.price * item.quantity).toLocaleString('id-ID')}\n`
    })
    message += `\n`

    message += `*Detail Alamat Pengiriman:*\n`
    message += `- Penerima: Budi Santoso\n`
    message += `- Telepon: 081234567890\n`
    message += `- Alamat: Jl. Kemang Raya No. 10, RT 02 / RW 05\n`
    message += `- Wilayah: Kec. Cilandak, Kota Jakarta Selatan, DKI Jakarta (12430)\n\n`

    message += `*Kurir & Ekspedisi:*\n`
    message += `- ${selectedCourier.name} (${selectedCourier.service}) - ${selectedCourier.etd}\n`
    message += `- Biaya Kirim: Rp ${shippingCost.toLocaleString('id-ID')}\n\n`


    message += `*Rincian Pembayaran:*\n`
    message += `- Subtotal Produk: Rp ${productSubtotal.toLocaleString('id-ID')}\n`
    message += `- Ongkos Kirim: Rp ${shippingCost.toLocaleString('id-ID')}\n`
    if (appliedVoucher) {
      message += `- Voucher: ${appliedVoucher.code} (-Rp ${discount.toLocaleString('id-ID')})\n`
    }
    message += `- *Total Pembayaran: Rp ${grandTotal.toLocaleString('id-ID')}*\n\n`
    message += `Mohon segera konfirmasi pesanan dan instruksi pembayaran saya. Terima kasih!`

    // Open WhatsApp
    window.open(getWhatsAppLink(message), '_blank')

    // Clear items from cart and redirect to home with success message
    clearCheckedItems()
    Swal.fire({
      title: 'Pemesanan Berhasil!',
      text: 'Anda akan dialihkan ke WhatsApp untuk menyelesaikan pembayaran.',
      icon: 'success',
      confirmButtonColor: '#18181b',
      confirmButtonText: 'Kembali ke Toko',
    }).then(() => {
      router.push('/')
    })
  }

  if (checkedItems.length === 0) {
    return null // Will redirect via useEffect
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
          
          {/* Address Form Card (Static Hasil) */}
          <div className="rounded bg-white dark:bg-zinc-950 p-5 space-y-3">
            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Alamat Pengiriman
              </h3>
            </div>
            
            <div className="space-y-1 text-sm text-zinc-800 dark:text-zinc-200">
              <div className="flex items-center gap-2">
                <span className="font-bold">Budi Santoso</span>
                <span className="text-zinc-400 dark:text-zinc-600">|</span>
                <span className="text-zinc-600 dark:text-zinc-400 font-medium">081234567890</span>
                <span className="ml-auto text-[10px] font-bold text-rose-500 uppercase tracking-wide px-1.5 py-0.5 border border-rose-500 rounded-sm scale-90">Utama</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                Jl. Kemang Raya No. 10, RT 02 / RW 05
              </p>
              <p className="text-zinc-500 dark:text-zinc-500 text-xs">
                Kec. Cilandak, Kota Jakarta Selatan, DKI Jakarta, 12430
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
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                        {item.name}
                      </h4>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                        Varian: {item.variant} • Kuantitas: {item.quantity} pcs
                      </span>
                    </div>
                    <div className="flex justify-between items-end mt-1">
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                        Rp {item.price.toLocaleString('id-ID')} / pcs
                      </span>
                      <span className="text-xs font-bold text-rose-500">
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
                <span className="ml-2 font-medium text-zinc-800 dark:text-zinc-200">{selectedCourier.name} ({selectedCourier.service})</span>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="ml-4 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Ubah
                </button>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  Garansi tiba {deliveryEstimate.single}
                </p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                  Voucher s/d Rp10.000 jika pesanan terlambat. <span className="cursor-help font-mono border border-zinc-300 dark:border-zinc-700 rounded-full px-1 py-0.5 text-[8px]">?</span>
                </p>
              </div>
              <div className="text-right sm:text-right shrink-0">
                <span className="text-sm font-bold text-zinc-900 dark:text-white">
                  Rp {selectedCourier.cost.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Sub-bar below it */}
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
                <div className="flex items-center justify-between gap-2 p-2 rounded bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <FiTag className="h-4 w-4 text-emerald-600 dark:text-emerald-455 shrink-0" />
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 truncate">
                      {appliedVoucher.code} Aktif
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveVoucher}
                    className="text-[10px] font-bold text-rose-500 hover:text-rose-700 transition-colors"
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
                    placeholder="LAQZERNEW / DISKON50"
                    className="flex-1 rounded border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-white"
                  />
                  <button
                    type="button"
                    onClick={handleApplyVoucher}
                    className="rounded bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-900 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 transition-all cursor-pointer"
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
                  Rp {shippingCost.toLocaleString('id-ID')}
                </span>
              </div>

              {appliedVoucher && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Diskon Voucher ({appliedVoucher.code})</span>
                  <span>-Rp {discount.toLocaleString('id-ID')}</span>
                </div>
              )}

              <hr className="border-zinc-100 dark:border-zinc-900 pt-1" />

              <div className="flex justify-between text-sm font-extrabold text-zinc-950 dark:text-white">
                <span>Total Pembayaran</span>
                <span className="text-base text-rose-500">
                  Rp {grandTotal.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Submit Order Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 text-sm font-bold tracking-wide transition-all active:scale-[0.99] cursor-pointer"
            >
              <span>Buat Pesanan via WhatsApp</span>
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
          {COURIER_OPTIONS.map((option) => {
            const est = getDeliveryEstimate(option.id)
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setSelectedCourier(option)
                  setIsModalOpen(false)
                }}
                className={`w-full flex items-center justify-between p-4 rounded text-left border transition-all cursor-pointer ${
                  selectedCourier.id === option.id
                    ? 'border-zinc-950 bg-zinc-50 dark:border-white dark:bg-zinc-900'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700'
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
