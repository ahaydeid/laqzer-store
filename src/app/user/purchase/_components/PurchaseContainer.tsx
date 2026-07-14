'use client'

import { useState } from 'react'
import { FiSearch, FiTruck, FiX } from 'react-icons/fi'
import Swal from 'sweetalert2'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  imageUrl: string
  variant: string
}

interface Order {
  id: string
  date: string
  storeName: string
  shippingStatus: string
  status: 'Belum Dibayar' | 'Sedang Diproses' | 'Dikirim' | 'Selesai' | 'Dibatalkan'
  items: OrderItem[]
  shippingCost: number
  total: number
}

const INITIAL_ORDERS: Order[] = [
  {
    id: '20260003',
    date: '13 Jul 2026',
    storeName: 'Laqzer Official Store',
    shippingStatus: 'Pesanan telah selesai dikirim dan diterima oleh pembeli.',
    status: 'Selesai',
    shippingCost: 15000,
    total: 369000,
    items: [
      {
        id: 'item-1',
        name: "EliteShield Performance Men's Jacket",
        price: 255000,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=600',
        variant: 'M, Hitam',
      },
      {
        id: 'item-2',
        name: "Gentlemen's Summer Gray Hat - Premium Blend",
        price: 99000,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&q=80&w=600',
        variant: 'Abu-abu',
      },
    ],
  },
  {
    id: '20260002',
    date: '12 Jul 2026',
    storeName: 'Laqzer Official Store',
    shippingStatus: 'Penjual sedang mempersiapkan pesanan Anda.',
    status: 'Sedang Diproses',
    shippingCost: 20000,
    total: 270000,
    items: [
      {
        id: 'item-3',
        name: 'OptiZoom Camera Shoulder Bag',
        price: 250000,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600',
        variant: 'Standard Black',
      },
    ],
  },
  {
    id: '20260005',
    date: '11 Jul 2026',
    storeName: 'Laqzer Official Store',
    shippingStatus: 'Pesanan sedang dalam perjalanan ke kota tujuan Anda.',
    status: 'Dikirim',
    shippingCost: 15000,
    total: 270000,
    items: [
      {
        id: 'item-4',
        name: "EliteShield Performance Men's Jacket",
        price: 255000,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=600',
        variant: 'L, Navy',
      },
    ],
  },
  {
    id: '20260004',
    date: '10 Jul 2026',
    storeName: 'Laqzer Official Store',
    shippingStatus: 'Menunggu pembayaran diselesaikan oleh pembeli.',
    status: 'Belum Dibayar',
    shippingCost: 10000,
    total: 109000,
    items: [
      {
        id: 'item-5',
        name: "Gentlemen's Summer Gray Hat - Premium Blend",
        price: 99000,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&q=80&w=600',
        variant: 'Abu-abu',
      },
    ],
  },
  {
    id: '20260001',
    date: '09 Jul 2026',
    storeName: 'Laqzer Official Store',
    shippingStatus: 'Pesanan telah selesai dikirim dan diterima oleh pembeli.',
    status: 'Selesai',
    shippingCost: 15000,
    total: 313000,
    items: [
      {
        id: 'item-6',
        name: 'Cloudy Chic - Grey Peep Toe Heeled Sandals',
        price: 149000,
        quantity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600',
        variant: 'Size 38, Gray',
      },
    ],
  },
  {
    id: '20260006',
    date: '08 Jul 2026',
    storeName: 'Laqzer Official Store',
    shippingStatus: 'Pesanan telah dibatalkan.',
    status: 'Dibatalkan',
    shippingCost: 20000,
    total: 270000,
    items: [
      {
        id: 'item-7',
        name: 'OptiZoom Camera Shoulder Bag',
        price: 250000,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600',
        variant: 'Standard Black',
      },
    ],
  },
]

type TabType = 'semua' | 'belum-bayar' | 'sedang-dikemas' | 'dikirim' | 'selesai' | 'dibatalkan' | 'pengembalian'

const TABS: { id: TabType; label: string }[] = [
  { id: 'semua', label: 'Semua' },
  { id: 'belum-bayar', label: 'Belum Bayar' },
  { id: 'sedang-dikemas', label: 'Sedang Dikemas' },
  { id: 'dikirim', label: 'Dikirim' },
  { id: 'selesai', label: 'Selesai' },
  { id: 'dibatalkan', label: 'Dibatalkan' },
  { id: 'pengembalian', label: 'Pengembalian' },
]

export function PurchaseContainer() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS)
  const [activeTab, setActiveTab] = useState<TabType>('semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleClearSearch = () => {
    setSearchQuery('')
  }

  const getTabCount = (tabId: TabType) => {
    if (tabId === 'semua') return orders.length
    if (tabId === 'belum-bayar') return orders.filter((o) => o.status === 'Belum Dibayar').length
    if (tabId === 'sedang-dikemas') return orders.filter((o) => o.status === 'Sedang Diproses').length
    if (tabId === 'dikirim') return orders.filter((o) => o.status === 'Dikirim').length
    if (tabId === 'selesai') return orders.filter((o) => o.status === 'Selesai').length
    if (tabId === 'dibatalkan') return orders.filter((o) => o.status === 'Dibatalkan').length
    return 0
  }

  const getTabClass = (tabId: TabType, isActive: boolean) => {
    if (isActive) {
      if (tabId === 'selesai') {
        return 'border-emerald-500 bg-emerald-100/70 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-950/20 dark:text-emerald-400'
      }
      if (tabId === 'dibatalkan') {
        return 'border-rose-500 bg-rose-100/70 text-rose-700 dark:border-rose-400 dark:bg-rose-950/20 dark:text-rose-400'
      }
      return 'border-sky-500 bg-sky-100/70 text-sky-700 dark:border-sky-400 dark:bg-sky-950/20 dark:text-sky-400'
    } else {
      if (tabId === 'selesai') {
        return 'border-transparent text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50/30 dark:text-emerald-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-950/10'
      }
      if (tabId === 'dibatalkan') {
        return 'border-transparent text-rose-600 hover:text-rose-800 hover:bg-rose-50/30 dark:text-rose-400 dark:hover:text-rose-300 dark:hover:bg-rose-950/10'
      }
      return 'border-transparent text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/20'
    }
  }

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    // 1. Tab Status Filter
    if (activeTab === 'belum-bayar' && order.status !== 'Belum Dibayar') return false
    if (activeTab === 'sedang-dikemas' && order.status !== 'Sedang Diproses') return false
    if (activeTab === 'dikirim' && order.status !== 'Dikirim') return false
    if (activeTab === 'selesai' && order.status !== 'Selesai') return false
    if (activeTab === 'dibatalkan' && order.status !== 'Dibatalkan') return false
    if (activeTab === 'pengembalian') return false // Mock: no returns yet

    // 2. Search Query Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      const matchId = order.id.toLowerCase().includes(query)
      const matchItem = order.items.some((item) => item.name.toLowerCase().includes(query))
      return matchId || matchItem
    }

    return true
  })

  // Action methods
  const handlePayOrder = (orderId: string) => {
    Swal.fire({
      title: 'Selesaikan Pembayaran',
      text: 'Simulasi proses transfer bank mandiri atau e-wallet.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Bayar Sekarang',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#e11d48', // rose-600
      cancelButtonColor: '#71717a', // zinc-500
    }).then((result) => {
      if (result.isConfirmed) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: 'Sedang Diproses' as const,
                  shippingStatus: 'Penjual sedang mempersiapkan pesanan Anda.',
                }
              : o
          )
        )
        Swal.fire({
          title: 'Pembayaran Sukses!',
          text: 'Status pesanan Anda telah berubah menjadi Sedang Dikemas.',
          icon: 'success',
          confirmButtonColor: '#e11d48',
        })
      }
    })
  }

  const handleCancelOrder = (orderId: string) => {
    Swal.fire({
      title: 'Batalkan Pesanan?',
      text: 'Apakah Anda yakin ingin membatalkan pesanan ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Batalkan',
      cancelButtonText: 'Tidak',
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#71717a',
    }).then((result) => {
      if (result.isConfirmed) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: 'Dibatalkan' as const,
                  shippingStatus: 'Pesanan telah dibatalkan.',
                }
              : o
          )
        )
        Swal.fire({
          title: 'Pesanan Dibatalkan',
          text: 'Pesanan Anda telah resmi dibatalkan.',
          icon: 'success',
          confirmButtonColor: '#e11d48',
        })
      }
    })
  }

  const handleConfirmReceived = (orderId: string) => {
    Swal.fire({
      title: 'Konfirmasi Diterima?',
      text: 'Konfirmasi bahwa Anda telah menerima barang dengan baik.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Selesai',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#71717a',
    }).then((result) => {
      if (result.isConfirmed) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: 'Selesai' as const,
                  shippingStatus: 'Pesanan telah selesai dikirim dan diterima oleh pembeli.',
                }
              : o
          )
        )
        Swal.fire({
          title: 'Pesanan Selesai!',
          text: 'Terima kasih telah berbelanja di Laqzer Store.',
          icon: 'success',
          confirmButtonColor: '#e11d48',
        })
      }
    })
  }

  const handleTrackShipping = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId)
    Swal.fire({
      title: 'Lacak Pengiriman',
      html: `
        <div class="text-left text-sm space-y-4 font-sans px-2">
          <div class="flex gap-3">
            <span class="text-emerald-500 font-bold shrink-0">14 Jul, 08:30</span>
            <div>
              <p class="font-semibold text-emerald-600">Paket sedang diantar kurir ke alamat</p>
              <p class="text-xs text-zinc-500">${order?.shippingStatus || ''}</p>
            </div>
          </div>
          <div class="flex gap-3 border-l-2 border-zinc-200 pl-4 py-2 ml-4">
            <span class="text-zinc-500 shrink-0">13 Jul, 14:15</span>
            <div>
              <p class="font-medium text-zinc-700">Paket telah transit di hub Jakarta Selatan</p>
              <p class="text-xs text-zinc-500">Pemberangkatan menuju hub terdekat pembeli.</p>
            </div>
          </div>
          <div class="flex gap-3 border-l-2 border-zinc-200 pl-4 py-2 ml-4">
            <span class="text-zinc-500 shrink-0">12 Jul, 10:00</span>
            <div>
              <p class="font-medium text-zinc-700">Paket diserahkan kurir logistik</p>
              <p class="text-xs text-zinc-500">Penjemputan paket dari gudang penjual selesai.</p>
            </div>
          </div>
        </div>
      `,
      confirmButtonColor: '#18181b',
      confirmButtonText: 'Tutup',
    })
  }

  const handleRateProduct = () => {
    Swal.fire({
      title: 'Beri Penilaian Produk',
      html: `
        <div class="space-y-4 font-sans text-left">
          <div>
            <label class="block text-xs font-bold text-zinc-500 mb-1">Skor Bintang (1-5)</label>
            <select id="rating-stars" class="w-full border border-zinc-200 rounded p-2 text-sm">
              <option value="5">5 Bintang (Sangat Puas)</option>
              <option value="4">4 Bintang (Puas)</option>
              <option value="3">3 Bintang (Cukup)</option>
              <option value="2">2 Bintang (Kurang)</option>
              <option value="1">1 Bintang (Sangat Kecewa)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-zinc-500 mb-1">Ulasan Anda</label>
            <textarea id="rating-comment" placeholder="Tulis masukan tentang kualitas produk..." class="w-full border border-zinc-200 rounded p-2 text-sm h-20 outline-none focus:border-rose-500"></textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Kirim Ulasan',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#71717a',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Terima Kasih!',
          text: 'Ulasan dan penilaian Anda berhasil disimpan.',
          icon: 'success',
          confirmButtonColor: '#e11d48',
        })
      }
    })
  }

  const handleBuyAgain = () => {
    Swal.fire({
      title: 'Tambah ke Keranjang',
      text: 'Semua produk di pesanan ini berhasil dimasukkan kembali ke keranjang belanja Anda.',
      icon: 'success',
      confirmButtonColor: '#e11d48',
    })
  }

  const handleContactSeller = () => {
    Swal.fire({
      title: 'Hubungi Penjual',
      text: 'Fitur chat langsung dengan admin toko sedang dipersiapkan.',
      icon: 'info',
      confirmButtonColor: '#18181b',
    })
  }

  return (
    <div className="space-y-6">
      {/* Title Header (Sesuai aturan-utama.md: tanpa sub-judul/deskripsi) */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
          Pesanan Saya
        </h2>
      </div>

      {/* Tab Filter (Rata Tengah X, seperti /admin/order) */}
      <div className="flex justify-center border-b border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none -mb-px pb-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            const count = getTabCount(tab.id)
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs whitespace-nowrap cursor-pointer transition-all duration-200 outline-none border-b-2 ${getTabClass(tab.id, isActive)}`}
              >
                {tab.label}
                {['belum-bayar', 'sedang-dikemas', 'dikirim'].includes(tab.id) && count > 0 && " (" + count + ")"}
              </button>
            )
          })}
        </div>
      </div>

      {/* Search Bar (Expandable, seperti /admin/order) */}
      <div className="flex items-center justify-start">
        <div className="relative shrink-0">
          <FiSearch className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isFocused ? "Cari No. Pesanan atau nama produk..." : "Cari"}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`transition-all duration-300 ease-in-out rounded-full border border-zinc-200 bg-white py-2 pl-10 text-sm outline-none focus:border-sky-500 dark:border-zinc-800 dark:bg-zinc-900/50 ${
              isFocused ? "w-64 sm:w-80 pr-10" : "w-32 pr-4"
            }`}
          />
          {searchQuery && (
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleClearSearch}
              className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors flex items-center justify-center cursor-pointer"
              title="Bersihkan Pencarian"
            >
              <FiX className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Orders List Container */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-zinc-950 rounded border border-zinc-200 dark:border-zinc-800 text-center">
            <FiTruck className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-3" />
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Belum ada pesanan</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
              Pesanan Anda yang cocok dengan filter atau kata kunci pencarian akan tampil di sini.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded p-5 space-y-4"
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-900 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">
                    No. Pesanan: {order.id}
                  </span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                    ({order.date})
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <FiTruck className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-zinc-600 dark:text-zinc-400 font-medium truncate max-w-[200px] sm:max-w-xs">
                    {order.shippingStatus}
                  </span>
                  <span className="text-zinc-400 dark:text-zinc-650">|</span>
                  <span className="font-extrabold uppercase text-rose-500 tracking-wide text-[11px]">
                    {order.status === 'Sedang Diproses' ? 'SEDANG DIKEMAS' : order.status}
                  </span>
                </div>
              </div>

              {/* Card Body (Products) */}
              <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {order.items.map((item) => (
                  <div key={item.id} className="py-3 flex gap-4 first:pt-0 last:pb-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-16 w-16 rounded object-cover bg-zinc-100 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                          {item.name}
                        </h4>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
                          Varian: {item.variant}
                        </span>
                        <span className="text-[10px] text-zinc-600 dark:text-zinc-400 block mt-0.5 font-semibold">
                          x{item.quantity}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-rose-500">
                          Rp {item.price.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Card Footer Divider */}
              <div className="border-t border-zinc-100 dark:border-zinc-900 pt-4 flex flex-col gap-4">
                {/* Total Billing */}
                <div className="flex items-center justify-end">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">Total Pesanan:</span>
                    <span className="text-base font-black text-rose-500">
                      Rp {order.total.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Bottom Action buttons row */}
                <div className="flex items-center justify-end gap-2.5">
                  {order.status === 'Belum Dibayar' && (
                    <>
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="rounded border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                      >
                        Batalkan Pesanan
                      </button>
                      <button
                        onClick={() => handlePayOrder(order.id)}
                        className="rounded bg-rose-500 hover:bg-rose-600 text-white px-5 py-2 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Bayar Sekarang
                      </button>
                    </>
                  )}

                  {order.status === 'Sedang Diproses' && (
                    <button
                      onClick={handleContactSeller}
                      className="rounded border border-zinc-200 dark:border-zinc-800 px-5 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                    >
                      Hubungi Penjual
                    </button>
                  )}

                  {order.status === 'Dikirim' && (
                    <>
                      <button
                        onClick={() => handleTrackShipping(order.id)}
                        className="rounded border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                      >
                        Lacak
                      </button>
                      <button
                        onClick={() => handleConfirmReceived(order.id)}
                        className="rounded bg-rose-500 hover:bg-rose-600 text-white px-5 py-2 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Pesanan Diterima
                      </button>
                    </>
                  )}

                  {order.status === 'Selesai' && (
                    <>
                      <button
                        onClick={handleRateProduct}
                        className="rounded bg-rose-500 hover:bg-rose-600 text-white px-5 py-2 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Nilai
                      </button>
                      <button
                        onClick={handleBuyAgain}
                        className="rounded border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                      >
                        Beli Lagi
                      </button>
                      <button
                        onClick={() =>
                          Swal.fire({
                            title: 'Ajukan Pengembalian',
                            text: 'Formulir pengembalian barang/dana sedang disiapkan.',
                            icon: 'info',
                            confirmButtonColor: '#18181b',
                          })
                        }
                        className="rounded border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                      >
                        Ajukan Pengembalian
                      </button>
                    </>
                  )}

                  {order.status === 'Dibatalkan' && (
                    <>
                      <button
                        onClick={handleBuyAgain}
                        className="rounded bg-rose-500 hover:bg-rose-600 text-white px-5 py-2 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Beli Lagi
                      </button>
                      <button
                        onClick={() =>
                          Swal.fire({
                            title: 'Rincian Pembatalan',
                            text: 'Pesanan ini dibatalkan karena tidak diselesaikan dalam batas waktu.',
                            icon: 'info',
                            confirmButtonColor: '#18181b',
                          })
                        }
                        className="rounded border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                      >
                        Rincian Pembatalan
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
