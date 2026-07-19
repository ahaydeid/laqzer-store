'use client'

import { useState, useMemo } from 'react'
import { FiSearch, FiShoppingBag, FiX, FiLoader, FiCheckCircle, FiPackage, FiTruck, FiCreditCard, FiXCircle, FiChevronDown } from 'react-icons/fi'
import Swal from 'sweetalert2'
import { useAuth } from '@/components/providers/AuthProvider'
import { SupabaseOrderService } from '@/services/supabase/order.service'
import { OrderRecord, OrderStatus } from '@/core/types/order'
import useSWR from 'swr'
import { playSwalSound } from '@/utils/sound'
import Link from 'next/link'

type TabType = 'semua' | 'unpaid' | 'processing' | 'shipped' | 'completed' | 'cancelled'

const TABS: { id: TabType; label: string }[] = [
  { id: 'semua', label: 'Semua' },
  { id: 'unpaid', label: 'Belum Bayar' },
  { id: 'processing', label: 'Sedang Diproses' },
  { id: 'shipped', label: 'Dikirim' },
  { id: 'completed', label: 'Selesai' },
  { id: 'cancelled', label: 'Dibatalkan' },
]

export function PurchaseContainer() {
  const { user } = useAuth()
  const orderService = useMemo(() => new SupabaseOrderService(), [])
  const [activeTab, setActiveTab] = useState<TabType>('semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Fetch real orders from Supabase using useSWR
  const { data: orders = [], isLoading, mutate } = useSWR<OrderRecord[]>(
    user?.id ? `user-orders-${user.id}` : null,
    () => orderService.getUserOrders(user!.id),
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  )

  const handleClearSearch = () => {
    setSearchQuery('')
  }

  const getTabCount = (tabId: TabType) => {
    if (tabId === 'semua') return orders.length
    return orders.filter((o) => o.status === tabId).length
  }


  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'unpaid':
        return <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">Belum Bayar</span>
      case 'processing':
        return <span className="text-sm text-sky-600 dark:text-sky-400 font-medium">Sedang Diproses</span>
      case 'shipped':
        return <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Dikirim</span>
      case 'completed':
        return <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Selesai</span>
      case 'cancelled':
        return <span className="text-sm text-rose-600 dark:text-rose-400 font-medium">Dibatalkan</span>
    }
  }

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    // 1. Tab Status Filter
    if (activeTab !== 'semua' && order.status !== activeTab) return false

    // 2. Search Query Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      const matchId = order.orderNumber.toLowerCase().includes(query)
      const matchItem = (order.items || []).some((item) => item.productName.toLowerCase().includes(query))
      return matchId || matchItem
    }

    return true
  })

  const handleMarkAsCompleted = async (orderId: string, orderNumber: string) => {
    playSwalSound('confirm')
    const res = await Swal.fire({
      title: 'Selesaikan Pesanan?',
      text: `Apakah Anda sudah menerima seluruh barang dalam pesanan ${orderNumber}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#71717a',
      confirmButtonText: 'Ya, Sudah Diterima!',
      cancelButtonText: 'Batal',
    })

    if (!res.isConfirmed) return

    try {
      await orderService.updateOrderStatus(orderId, 'completed')
      playSwalSound('success')
      Swal.fire({
        title: 'Pesanan Selesai!',
        text: 'Terima kasih telah berbelanja di toko kami.',
        icon: 'success',
        confirmButtonColor: '#10b981',
      })
      mutate()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal mengubah status pesanan.'
      Swal.fire({
        title: 'Gagal',
        text: errorMsg,
        icon: 'error',
        confirmButtonColor: '#e11d48',
      })
    }
  }

  const handleCancelOrder = async (orderId: string, orderNumber: string) => {
    playSwalSound('confirm')
    const res = await Swal.fire({
      title: 'Batalkan Pesanan?',
      text: `Pesanan ${orderNumber} akan dibatalkan. Tindakan ini tidak dapat diurungkan.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#71717a',
      confirmButtonText: 'Ya, Batalkan',
      cancelButtonText: 'Tidak',
    })

    if (!res.isConfirmed) return

    try {
      await orderService.updateOrderStatus(orderId, 'cancelled')
      playSwalSound('success')
      Swal.fire({
        title: 'Pesanan Dibatalkan',
        text: 'Pesanan Anda telah berhasil dibatalkan.',
        icon: 'success',
        confirmButtonColor: '#10b981',
      })
      mutate()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal membatalkan pesanan.'
      Swal.fire({
        title: 'Gagal',
        text: errorMsg,
        icon: 'error',
        confirmButtonColor: '#e11d48',
      })
    }
  }

  const handleConfirmPaymentWA = async (order: OrderRecord) => {
    let confirmMessage = `Halo Admin Laqzer, saya ingin konfirmasi pembayaran untuk pesanan saya:\n\n`
    confirmMessage += `*Nomor Invoice:* ${order.orderNumber}\n`
    confirmMessage += `*Total Pembayaran: Rp ${order.totalAmount.toLocaleString('id-ID')}*\n`
    confirmMessage += `- *Kurir*: ${order.shippingCourier}\n\n`
    confirmMessage += `Berikut bukti transfer pembayaran akan saya lampirkan setelah pesan ini. Mohon segera diperiksa, terima kasih!`

    const waLink = `https://wa.me/6285175235717?text=${encodeURIComponent(confirmMessage)}`

    playSwalSound('confirm')
    Swal.fire({
      icon: 'info',
      title: 'Instruksi Pembayaran',
      html: `
        <div class="text-center font-sans">
          <p class="text-xs text-zinc-600 dark:text-zinc-400 mb-3">
            Nomor Invoice: <strong class="text-zinc-900 dark:text-white font-mono">${order.orderNumber}</strong><br/>
            Silakan lakukan transfer bank sebesar <strong class="text-rose-500">Rp ${order.totalAmount.toLocaleString('id-ID')}</strong>:
          </p>
          <div class="bg-zinc-50 dark:bg-zinc-900/80 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-left text-xs space-y-1 mb-2">
            <p class="text-zinc-600 dark:text-zinc-400">BCA: <span class="font-bold font-mono">8415-1290-88</span> (a.n. Puspa Meylinia Inakhota)</p>
            <p class="text-zinc-600 dark:text-zinc-400">Mandiri: <span class="font-bold font-mono">137-002-199-2831</span> (a.n. Puspa Meylinia Inakhota)</p>
          </div>
          <p class="text-[11px] text-zinc-400">Tekan tombol di bawah untuk mengirimkan bukti transfer via WhatsApp.</p>
        </div>
      `,
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Konfirmasi Pembayaran (WA)',
      showCancelButton: true,
      cancelButtonText: 'Tutup',
      cancelButtonColor: '#6b7280',
    }).then((result) => {
      if (result.isConfirmed) {
        window.open(waLink, '_blank')
      }
    })
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="relative">
        {/* Desktop Title */}
        <h1 className="hidden md:block text-xl font-extrabold text-zinc-900 dark:text-white">
          Pembelian Saya
        </h1>

        {/* Mobile Title with Dropdown */}
        <div className="md:hidden relative inline-block text-left">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 text-xl font-extrabold text-zinc-900 dark:text-white focus:outline-none cursor-pointer"
          >
            <span>Pembelian Saya</span>
            <FiChevronDown className={`w-5 h-5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-48 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg focus:outline-none z-50">
                <div className="py-1">
                  <Link
                    href="/user/profile"
                    className="block px-4 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profil Saya
                  </Link>
                  <Link
                    href="/user/purchase"
                    className="block px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Pesanan Saya
                  </Link>
                  <Link
                    href="/user/favorit"
                    className="block px-4 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Favorit Saya
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto scrollbar-none gap-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          const count = getTabCount(tab.id)
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-rose-600 text-rose-600 dark:border-rose-500 dark:text-rose-400 font-semibold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <span>{tab.label}</span>
              {['unpaid', 'processing', 'shipped'].includes(tab.id) && count > 0 && (
                <span
                  className={`w-5 h-5 text-xs font-medium rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? 'bg-rose-600 text-white dark:bg-rose-500 dark:text-zinc-950'
                      : 'bg-slate-200 text-zinc-600 dark:bg-slate-800 dark:text-zinc-400'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari berdasarkan No. Invoice atau Nama Produk..."
          className="w-full rounded border border-zinc-200 pl-10 pr-10 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-rose-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
        />
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <FiX className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Content Section */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
          <FiLoader className="h-8 w-8 animate-spin mb-3 opacity-60" />
          <p className="text-sm font-medium">Memuat pesanan Anda...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-zinc-950 rounded border border-zinc-100 dark:border-zinc-900 text-center p-6 space-y-3">
          <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400">
            <FiShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Belum ada pesanan ditemukan</h3>
            {searchQuery && (
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-sm">
                Tidak ada hasil untuk kata kunci &ldquo;{searchQuery}&rdquo;.
              </p>
            )}
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded transition-all"
          >
            Mulai Belanja Sekarang
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-zinc-950 rounded border border-zinc-200/80 dark:border-zinc-800/80 p-5 space-y-4 transition-all hover:shadow-sm"
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-zinc-900 dark:text-white">
                    {order.orderNumber}
                  </span>
                  <span className="text-zinc-300 dark:text-zinc-700">•</span>
                  <span className="text-xs text-zinc-400">
                    {new Date(order.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div>{getStatusBadge(order.status)}</div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {(order.items || []).map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-14 h-14 rounded bg-zinc-100 dark:bg-zinc-900 overflow-hidden shrink-0 border border-zinc-200/50 dark:border-zinc-800">
                      {item.productImage ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          <FiPackage className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                        {item.productName}
                      </h4>
                      {item.variantLabel && (
                        <p className="text-xs text-zinc-400 mt-0.5">{item.variantLabel}</p>
                      )}
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-zinc-500 font-medium">x{item.quantity}</span>
                        <span className="text-sm font-bold text-zinc-900 dark:text-white">
                          Rp {item.price.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Info & Totals */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 space-y-3">
                {/* Kurir & Metode Pembayaran */}
                <div className="space-y-1 text-sm">
                  <p className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <FiTruck className="w-4 h-4 text-zinc-400 shrink-0" />
                    <span>Kurir: <strong className="text-zinc-800 dark:text-zinc-200">{order.shippingCourier}</strong></span>
                  </p>
                  <p className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <FiCreditCard className="w-4 h-4 text-zinc-400 shrink-0" />
                    <span>Metode Pembayaran: <strong className="text-zinc-800 dark:text-zinc-200">{order.paymentMethod}</strong></span>
                  </p>
                </div>

                {/* Total + Tombol Aksi */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[11px] text-zinc-400 uppercase font-medium whitespace-nowrap">Total Pembayaran</span>
                    <span className="text-base font-extrabold text-rose-500 whitespace-nowrap">
                      Rp {order.totalAmount.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Actions */}
                  {order.status === 'unpaid' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCancelOrder(order.id, order.orderNumber)}
                        className="px-2.5 py-1.5 rounded border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-normal sm:font-medium text-xs transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        <FiXCircle className="hidden sm:inline-flex w-3.5 h-3.5 shrink-0" />
                        <span>Batalkan</span>
                      </button>
                      <button
                        onClick={() => handleConfirmPaymentWA(order)}
                        className="px-2.5 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-normal sm:font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs whitespace-nowrap"
                      >
                        <FiCreditCard className="hidden sm:inline-flex w-3.5 h-3.5 shrink-0" />
                        <span>Konfirmasi Pembayaran (WA)</span>
                      </button>
                    </div>
                  )}

                  {order.status === 'shipped' && (
                    <button
                      onClick={() => handleMarkAsCompleted(order.id, order.orderNumber)}
                      className="px-3.5 py-2 rounded bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FiCheckCircle className="w-4 h-4 shrink-0" />
                      <span>Pesanan Diterima</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
export default PurchaseContainer
