'use client'

import { useState, useMemo } from 'react'
import { FiSearch, FiShoppingBag, FiX, FiLoader, FiCheckCircle, FiPackage, FiTruck, FiCreditCard } from 'react-icons/fi'
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
  const [isFocused, setIsFocused] = useState(false)

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

  const getTabClass = (tabId: TabType, isActive: boolean) => {
    if (isActive) {
      if (tabId === 'completed') {
        return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
      }
      if (tabId === 'cancelled') {
        return 'border-rose-500 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400'
      }
      return 'border-sky-500 bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-400'
    } else {
      return 'border-transparent text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/20'
    }
  }

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'unpaid':
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40">Belum Bayar</span>
      case 'processing':
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900/40">Sedang Diproses</span>
      case 'shipped':
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/40">Dikirim</span>
      case 'completed':
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40">Selesai</span>
      case 'cancelled':
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40">Dibatalkan</span>
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
    } catch (err: any) {
      Swal.fire({
        title: 'Gagal',
        text: err?.message || 'Gagal mengubah status pesanan.',
        icon: 'error',
        confirmButtonColor: '#e11d48',
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-zinc-900 dark:text-white">Pembelian Saya</h1>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
          Kelola dan pantau seluruh status pesanan Anda.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-zinc-200 dark:border-zinc-800 gap-1 pb-px thin-scroll">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          const count = getTabCount(tab.id)
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-t border-b-2 transition-all cursor-pointer whitespace-nowrap ${getTabClass(
                tab.id,
                isActive
              )}`}
            >
              <span>{tab.label}</span>
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                }`}>
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
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Cari berdasarkan No. Invoice atau Nama Produk..."
          className="w-full rounded border border-zinc-200 pl-10 pr-10 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-rose-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
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
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Tidak ada pesanan ditemukan</h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-sm">
              {searchQuery
                ? `Tidak ada hasil untuk kata kunci "${searchQuery}".`
                : 'Belum ada pesanan pada kategori ini.'}
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded transition-all"
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
                  <span className="font-mono text-xs font-bold text-zinc-900 dark:text-white">
                    {order.orderNumber}
                  </span>
                  <span className="text-zinc-300 dark:text-zinc-700">•</span>
                  <span className="text-[11px] text-zinc-400">
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
                      <h4 className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                        {item.productName}
                      </h4>
                      {item.variantLabel && (
                        <p className="text-[11px] text-zinc-400 mt-0.5">{item.variantLabel}</p>
                      )}
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-zinc-500 font-medium">x{item.quantity}</span>
                        <span className="text-xs font-bold text-zinc-900 dark:text-white">
                          Rp {item.price.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Info & Totals */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <p className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <FiTruck className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Kurir: <strong className="text-zinc-800 dark:text-zinc-200">{order.shippingCourier}</strong></span>
                  </p>
                  <p className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <FiCreditCard className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Metode Pembayaran: <strong className="text-zinc-800 dark:text-zinc-200">{order.paymentMethod}</strong></span>
                  </p>
                </div>

                <div className="flex items-center gap-4 ml-auto">
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 block uppercase font-medium">Total Pembayaran</span>
                    <span className="text-sm font-extrabold text-rose-500">
                      Rp {order.totalAmount.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Actions */}
                  {order.status === 'shipped' && (
                    <button
                      onClick={() => handleMarkAsCompleted(order.id, order.orderNumber)}
                      className="px-3.5 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <FiCheckCircle className="w-4 h-4" />
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
