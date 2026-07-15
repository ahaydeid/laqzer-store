'use client'

import React, { useState } from 'react'
import { 
  FiPercent, 
  FiTicket, 
  FiPlus, 
  FiEye, 
  FiTrash2, 
  FiCalendar, 
  FiActivity, 
  FiSettings, 
  FiImage, 
  FiX 
} from 'react-icons/fi'
import Swal from 'sweetalert2'

interface DiscountItem {
  id: string
  productName: string
  originalPrice: number
  discountPercent: number
  startDate: string
  endDate: string
}

interface VoucherItem {
  code: string
  type: 'percent' | 'nominal'
  value: number
  minPurchase: number
  quota: number
  expiryDate: string
  status: 'active' | 'inactive'
}

interface PopupAdConfig {
  isActive: boolean
  title: string
  description: string
  imageUrl: string
  buttonText: string
  targetUrl: string
}

const INITIAL_DISCOUNTS: DiscountItem[] = [
  {
    id: '1',
    productName: 'Keyboard Mechanical Laqzer RGB',
    originalPrice: 850000,
    discountPercent: 15,
    startDate: '2026-07-10',
    endDate: '2026-07-25',
  },
  {
    id: '2',
    productName: 'Mouse Wireless Gaming Superlight',
    originalPrice: 450000,
    discountPercent: 10,
    startDate: '2026-07-12',
    endDate: '2026-07-20',
  }
]

const INITIAL_VOUCHERS: VoucherItem[] = [
  {
    code: 'LAQZERBARU',
    type: 'percent',
    value: 10,
    minPurchase: 150000,
    quota: 100,
    expiryDate: '2026-08-31',
    status: 'active'
  },
  {
    code: 'HEMAT50K',
    type: 'nominal',
    value: 50000,
    minPurchase: 300000,
    quota: 50,
    expiryDate: '2026-07-31',
    status: 'active'
  },
  {
    code: 'FREEONGKIR',
    type: 'nominal',
    value: 20000,
    minPurchase: 100000,
    quota: 200,
    expiryDate: '2026-12-31',
    status: 'active'
  }
]

export default function CampaignContainer() {
  const [activeTab, setActiveTab] = useState<'discount' | 'voucher' | 'popup'>('discount')
  
  // State for Discounts
  const [discounts, setDiscounts] = useState<DiscountItem[]>(INITIAL_DISCOUNTS)
  const [selectedProduct, setSelectedProduct] = useState('')
  const [discountPercent, setDiscountPercent] = useState(5)
  const [discountStart, setDiscountStart] = useState('2026-07-15')
  const [discountEnd, setDiscountEnd] = useState('2026-07-30')
  const [discountCounter, setDiscountCounter] = useState(3)

  // State for Vouchers
  const [vouchers, setVouchers] = useState<VoucherItem[]>(INITIAL_VOUCHERS)
  const [voucherCode, setVoucherCode] = useState('')
  const [voucherType, setVoucherType] = useState<'percent' | 'nominal'>('percent')
  const [voucherValue, setVoucherValue] = useState(10)
  const [voucherMinPurchase, setVoucherMinPurchase] = useState(0)
  const [voucherQuota, setVoucherQuota] = useState(10)
  const [voucherExpiry, setVoucherExpiry] = useState('2026-08-01')

  // State for Popup Ad
  const [popupConfig, setPopupConfig] = useState<PopupAdConfig>({
    isActive: true,
    title: 'MEGA SUMMER SALE!',
    description: 'Dapatkan diskon hingga 60% untuk semua kategori aksesoris gaming. Penawaran terbatas hanya minggu ini!',
    imageUrl: '/img/promo-banner-popup.png',
    buttonText: 'Belanja Sekarang',
    targetUrl: '/product/1'
  })
  
  const [showPopupPreview, setShowPopupPreview] = useState(false)

  // Products available for discount creation
  const MOCK_PRODUCTS = [
    { name: 'Laptop Asus ROG Strix G15', price: 18500000 },
    { name: 'Keyboard Mechanical Laqzer RGB', price: 850000 },
    { name: 'Mouse Wireless Gaming Superlight', price: 450000 },
    { name: 'Headset Stereo Pro Bass', price: 650000 },
    { name: 'Monitor Curved Gaming 27 Inch', price: 3200000 }
  ]

  // Add discount handler
  const handleAddDiscount = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Silakan pilih produk terlebih dahulu.',
        confirmButtonColor: '#0369a1'
      })
      return
    }

    const prod = MOCK_PRODUCTS.find(p => p.name === selectedProduct)
    const newDiscount: DiscountItem = {
      id: `discount-${discountCounter}`,
      productName: selectedProduct,
      originalPrice: prod ? prod.price : 500000,
      discountPercent: discountPercent,
      startDate: discountStart,
      endDate: discountEnd
    }

    setDiscounts([newDiscount, ...discounts])
    setDiscountCounter(prev => prev + 1)
    
    Swal.fire({
      icon: 'success',
      title: 'Diskon Berhasil Dibuat',
      text: `Diskon sebesar ${discountPercent}% untuk ${selectedProduct} telah aktif.`,
      confirmButtonColor: '#0369a1'
    })
    
    // Reset Form
    setSelectedProduct('')
    setDiscountPercent(5)
  }

  // Delete discount handler
  const handleDeleteDiscount = (id: string, productName: string) => {
    Swal.fire({
      title: 'Hapus Diskon?',
      text: `Apakah Anda yakin ingin menonaktifkan diskon untuk ${productName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        setDiscounts(discounts.filter(item => item.id !== id))
        Swal.fire({
          title: 'Dihapus!',
          text: 'Diskon berhasil dinonaktifkan.',
          icon: 'success',
          confirmButtonColor: '#0369a1'
        })
      }
    })
  }

  // Add voucher handler
  const handleAddVoucher = (e: React.FormEvent) => {
    e.preventDefault()
    if (!voucherCode.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Silakan isi kode voucher.',
        confirmButtonColor: '#0369a1'
      })
      return
    }

    const cleanCode = voucherCode.toUpperCase().replace(/\s+/g, '')
    
    // Check if code exists
    if (vouchers.some(v => v.code === cleanCode)) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Kode voucher sudah terdaftar.',
        confirmButtonColor: '#0369a1'
      })
      return
    }

    const newVoucher: VoucherItem = {
      code: cleanCode,
      type: voucherType,
      value: voucherValue,
      minPurchase: voucherMinPurchase,
      quota: voucherQuota,
      expiryDate: voucherExpiry,
      status: 'active'
    }

    setVouchers([newVoucher, ...vouchers])

    Swal.fire({
      icon: 'success',
      title: 'Voucher Berhasil Dibuat',
      text: `Voucher ${cleanCode} siap digunakan oleh pembeli.`,
      confirmButtonColor: '#0369a1'
    })

    // Reset Form
    setVoucherCode('')
    setVoucherValue(10)
    setVoucherMinPurchase(0)
    setVoucherQuota(10)
  }

  // Delete/Toggle voucher handler
  const handleToggleVoucher = (code: string) => {
    setVouchers(vouchers.map(v => {
      if (v.code === code) {
        const nextStatus = v.status === 'active' ? 'inactive' : 'active'
        return { ...v, status: nextStatus }
      }
      return v
    }))
  }

  // Save popup ad settings
  const handleSavePopupConfig = (e: React.FormEvent) => {
    e.preventDefault()
    Swal.fire({
      icon: 'success',
      title: 'Pengaturan Disimpan',
      text: 'Konfigurasi iklan popup promo berhasil diperbarui.',
      confirmButtonColor: '#0369a1'
    })
  }

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Kelola Campaign
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Campaigns */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Total Campaign</span>
            <div className="p-2 bg-sky-50 dark:bg-sky-950/40 rounded-lg">
              <FiActivity className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">
              {discounts.length + vouchers.filter(v => v.status === 'active').length + (popupConfig.isActive ? 1 : 0)}
            </span>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">Aktif di toko saat ini</p>
          </div>
        </div>

        {/* Discounts Card */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Diskon Produk</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg">
              <FiPercent className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">{discounts.length}</span>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Sedang dipotong harga</p>
          </div>
        </div>

        {/* Vouchers Card */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Voucher Aktif</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg">
              <FiTicket className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">
              {vouchers.filter(v => v.status === 'active').length}
            </span>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">Dari total {vouchers.length} voucher</p>
          </div>
        </div>

        {/* Popup Ads Card */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Iklan Popup</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/40 rounded-lg">
              <FiEye className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                {popupConfig.isActive ? 'Aktif' : 'Nonaktif'}
              </span>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">Awal muat halaman</p>
            </div>
            <span className={`h-2.5 w-2.5 rounded-full ${popupConfig.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('discount')}
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold border-b-2 transition-all duration-200 cursor-pointer ${
            activeTab === 'discount'
              ? 'border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400 bg-sky-50/20 dark:bg-zinc-900/40'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/10'
          }`}
        >
          <FiPercent className="h-4 w-4" />
          <span>Diskon Produk</span>
        </button>
        <button
          onClick={() => setActiveTab('voucher')}
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold border-b-2 transition-all duration-200 cursor-pointer ${
            activeTab === 'voucher'
              ? 'border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400 bg-sky-50/20 dark:bg-zinc-900/40'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/10'
          }`}
        >
          <FiTicket className="h-4 w-4" />
          <span>Voucher Belanja</span>
        </button>
        <button
          onClick={() => setActiveTab('popup')}
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold border-b-2 transition-all duration-200 cursor-pointer ${
            activeTab === 'popup'
              ? 'border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400 bg-sky-50/20 dark:bg-zinc-900/40'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/10'
          }`}
        >
          <FiEye className="h-4 w-4" />
          <span>Iklan Popup</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="mt-2">
        {/* Tab 1: Diskon Produk */}
        {activeTab === 'discount' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Form Buat Diskon */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 space-y-4">
                <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-bold border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <FiPlus className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                  <span>Buat Diskon Baru</span>
                </div>
                <form onSubmit={handleAddDiscount} className="space-y-4 text-sm">
                  <div>
                    <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Pilih Produk
                    </label>
                    <select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent px-3.5 py-2.5 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="" className="text-zinc-500 dark:bg-zinc-900">-- Pilih Produk --</option>
                      {MOCK_PRODUCTS.map((p, idx) => (
                        <option key={idx} value={p.name} className="dark:bg-zinc-900">
                          {p.name} ({formatRupiah(p.price)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Persentase Diskon (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(Number(e.target.value))}
                        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent pl-3.5 pr-10 py-2.5 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                        Mulai Berlaku
                      </label>
                      <input
                        type="date"
                        value={discountStart}
                        onChange={(e) => setDiscountStart(e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent px-3.5 py-2 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                        Berakhir Pada
                      </label>
                      <input
                        type="date"
                        value={discountEnd}
                        onChange={(e) => setDiscountEnd(e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent px-3.5 py-2 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-sky-700 hover:bg-sky-800 text-white font-semibold py-2.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2 shadow-xs"
                  >
                    <FiPlus className="h-4 w-4" />
                    <span>Terapkan Diskon</span>
                  </button>
                </form>
              </div>
            </div>

            {/* List Diskon */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">Daftar Diskon Berjalan</span>
                  <span className="text-xs bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 px-2.5 py-1 rounded-full font-bold">
                    {discounts.length} Produk
                  </span>
                </div>

                {discounts.length === 0 ? (
                  <div className="text-center py-12 text-zinc-400 dark:text-zinc-500 space-y-2">
                    <FiPercent className="h-10 w-10 mx-auto opacity-40" />
                    <p className="font-medium text-sm">Belum ada promo diskon produk aktif.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-[380px] overflow-y-auto pr-1">
                    {discounts.map((item) => {
                      const finalPrice = item.originalPrice * (1 - item.discountPercent / 100)
                      return (
                        <div key={item.id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 px-2 rounded-lg transition-colors">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate" title={item.productName}>
                              {item.productName}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-[11px] bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded font-bold">
                                -{item.discountPercent}%
                              </span>
                              <span className="text-xs line-through text-zinc-400 font-medium">
                                {formatRupiah(item.originalPrice)}
                              </span>
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                {formatRupiah(finalPrice)}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 flex items-center gap-1">
                              <FiCalendar className="h-3 w-3 shrink-0" />
                              <span>{item.startDate} s/d {item.endDate}</span>
                            </p>
                          </div>
                          
                          <button
                            onClick={() => handleDeleteDiscount(item.id, item.productName)}
                            className="p-2 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                            title="Hapus diskon"
                          >
                            <FiTrash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Voucher Belanja */}
        {activeTab === 'voucher' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Form Buat Voucher */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 space-y-4">
                <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-bold border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <FiPlus className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                  <span>Buat Voucher Baru</span>
                </div>
                <form onSubmit={handleAddVoucher} className="space-y-4 text-sm">
                  <div>
                    <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Kode Voucher
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: LAQZERHEBOH"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent px-3.5 py-2.5 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-mono placeholder:font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                        Tipe Potongan
                      </label>
                      <select
                        value={voucherType}
                        onChange={(e) => {
                          setVoucherType(e.target.value as 'percent' | 'nominal')
                          setVoucherValue(e.target.value === 'percent' ? 10 : 50000)
                        }}
                        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent px-3.5 py-2.5 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="percent" className="dark:bg-zinc-900">Persentase (%)</option>
                        <option value="nominal" className="dark:bg-zinc-900">Nominal Rupiah</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                        Nilai Potongan
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          value={voucherValue}
                          onChange={(e) => setVoucherValue(Number(e.target.value))}
                          className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent pl-3.5 pr-8 py-2.5 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">
                          {voucherType === 'percent' ? '%' : 'Rp'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                        Min. Belanja (Rp)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={voucherMinPurchase}
                        onChange={(e) => setVoucherMinPurchase(Number(e.target.value))}
                        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent px-3.5 py-2.5 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                        Kuota Voucher
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={voucherQuota}
                        onChange={(e) => setVoucherQuota(Number(e.target.value))}
                        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent px-3.5 py-2.5 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Tanggal Kadaluarsa
                    </label>
                    <input
                      type="date"
                      value={voucherExpiry}
                      onChange={(e) => setVoucherExpiry(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent px-3.5 py-2 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-sky-700 hover:bg-sky-800 text-white font-semibold py-2.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2 shadow-xs"
                  >
                    <FiPlus className="h-4 w-4" />
                    <span>Aktifkan Voucher</span>
                  </button>
                </form>
              </div>
            </div>

            {/* List Voucher */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">Daftar Voucher Toko</span>
                  <span className="text-xs bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-2.5 py-1 rounded-full font-bold">
                    {vouchers.length} Voucher
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-1">
                  {vouchers.map((item) => (
                    <div 
                      key={item.code} 
                      className={`p-4 rounded-xl border flex flex-col justify-between gap-4 transition-all relative overflow-hidden ${
                        item.status === 'active' 
                          ? 'bg-zinc-50/50 dark:bg-zinc-950/30 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700' 
                          : 'bg-zinc-100/50 dark:bg-zinc-900/10 border-zinc-200 dark:border-zinc-900/40 opacity-60'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-lg border border-indigo-100/50 dark:border-indigo-900/30">
                            {item.code}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                            item.status === 'active' 
                              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' 
                              : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                          }`}>
                            {item.status === 'active' ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </div>
                        
                        <div className="pt-2">
                          <p className="text-lg font-extrabold text-zinc-900 dark:text-white">
                            {item.type === 'percent' ? `Diskon ${item.value}%` : `Diskon ${formatRupiah(item.value)}`}
                          </p>
                          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                            Min. Belanja: <span className="font-semibold text-zinc-600 dark:text-zinc-300">{formatRupiah(item.minPurchase)}</span>
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-zinc-200/50 dark:border-zinc-850/50 pt-2.5 mt-1 flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500">
                        <div className="space-y-0.5">
                          <p>Kuota: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{item.quota} klaim</span></p>
                          <p>Kadaluarsa: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{item.expiryDate}</span></p>
                        </div>
                        
                        <button
                          onClick={() => handleToggleVoucher(item.code)}
                          className={`text-xs px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer border ${
                            item.status === 'active'
                              ? 'border-zinc-300 hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-zinc-800 dark:hover:border-red-900/30 dark:hover:bg-red-950/20 dark:hover:text-red-400 text-zinc-600 dark:text-zinc-400'
                              : 'border-zinc-300 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-750 dark:text-zinc-300'
                          }`}
                        >
                          {item.status === 'active' ? 'Matikan' : 'Aktifkan'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Iklan Popup */}
        {activeTab === 'popup' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Form Settings Iklan */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-200">
                    <FiSettings className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                    <span>Konfigurasi Iklan Popup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold">Status:</span>
                    <button
                      type="button"
                      onClick={() => setPopupConfig({ ...popupConfig, isActive: !popupConfig.isActive })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-hidden ${
                        popupConfig.isActive ? 'bg-sky-600' : 'bg-zinc-200 dark:bg-zinc-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          popupConfig.isActive ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSavePopupConfig} className="space-y-4 text-sm">
                  <div>
                    <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Judul Iklan Promo
                    </label>
                    <input
                      type="text"
                      value={popupConfig.title}
                      onChange={(e) => setPopupConfig({ ...popupConfig, title: e.target.value })}
                      placeholder="Masukkan Judul Promo"
                      className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent px-3.5 py-2.5 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Deskripsi Singkat Promo
                    </label>
                    <textarea
                      rows={3}
                      value={popupConfig.description}
                      onChange={(e) => setPopupConfig({ ...popupConfig, description: e.target.value })}
                      placeholder="Masukkan penjelasan promo..."
                      className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent px-3.5 py-2 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                        Teks Tombol Aksi (CTA)
                      </label>
                      <input
                        type="text"
                        value={popupConfig.buttonText}
                        onChange={(e) => setPopupConfig({ ...popupConfig, buttonText: e.target.value })}
                        placeholder="Contoh: Belanja Sekarang"
                        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent px-3.5 py-2.5 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                        Link Tujuan Redirect
                      </label>
                      <input
                        type="text"
                        value={popupConfig.targetUrl}
                        onChange={(e) => setPopupConfig({ ...popupConfig, targetUrl: e.target.value })}
                        placeholder="Contoh: /product/id"
                        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent px-3.5 py-2.5 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-sky-700 hover:bg-sky-800 text-white font-semibold py-2.5 rounded-lg transition-colors cursor-pointer text-center"
                    >
                      Simpan Pengaturan
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPopupPreview(true)}
                      className="flex-1 border border-sky-600 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 text-sky-600 dark:text-sky-400 font-semibold py-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <FiEye className="h-4 w-4" />
                      <span>Uji Coba Tampilan</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Panduan & Preview Asset Banner */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
                <h3 className="font-bold text-zinc-800 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center gap-2">
                  <FiImage className="h-4.5 w-4.5 text-sky-600 dark:text-sky-400" />
                  <span>Preview Asset Banner</span>
                </h3>
                <div className="mt-4 space-y-3.5">
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-inner group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={popupConfig.imageUrl} 
                      alt="Banner Preview" 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="text-xs text-zinc-400 dark:text-zinc-500 space-y-1">
                    <p className="font-semibold text-zinc-500 dark:text-zinc-400">Rekomendasi Format Gambar:</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>Ukuran ideal: 1080 x 1080 px (persegi) atau 1200 x 630 px (landscape)</li>
                      <li>Ekstensi: PNG, JPEG, atau WebP</li>
                      <li>Ukuran file maksimum: 1.5MB</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Penjelasan Ringkas Fitur */}
              <div className="bg-sky-50/50 dark:bg-zinc-900/30 p-5 rounded-xl border border-sky-100/50 dark:border-zinc-800/80">
                <h4 className="font-bold text-sky-850 dark:text-sky-400 text-sm mb-2">💡 Tentang Iklan Popup</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Iklan popup akan muncul satu kali setiap pengunjung pertama kali membuka web toko (homepage). Sangat efektif untuk mempromosikan diskon besar, voucher baru, atau perilisan produk eksklusif.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Preview Modal Overlay */}
      {showPopupPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-md p-4">
          <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-zinc-200/80 dark:border-zinc-800 max-h-[90vh] flex flex-col md:flex-row transition-all scale-100">
            {/* Close Button */}
            <button
              onClick={() => setShowPopupPreview(false)}
              className="absolute top-4 right-4 z-10 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xs cursor-pointer transition-colors shadow-sm"
              title="Tutup"
            >
              <FiX className="h-5 w-5" />
            </button>

            {/* Banner Side */}
            <div className="w-full md:w-1/2 aspect-square md:aspect-auto md:min-h-[420px] bg-zinc-950 flex items-center justify-center relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={popupConfig.imageUrl} 
                alt="Popup Promotional Banner" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content Side */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center space-y-5">
              <div className="space-y-2">
                <span className="inline-block text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest bg-sky-50 dark:bg-sky-950/40 px-2.5 py-1 rounded-full border border-sky-100/50 dark:border-sky-900/30">
                  Promo Terkini
                </span>
                <h3 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white leading-tight">
                  {popupConfig.title}
                </h3>
                <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                  {popupConfig.description}
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setShowPopupPreview(false)
                    Swal.fire({
                      icon: 'info',
                      title: 'CTA Dipicu',
                      text: `Pembeli akan diarahkan ke tujuan: ${popupConfig.targetUrl}`,
                      confirmButtonColor: '#0369a1'
                    })
                  }}
                  className="w-full bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-extrabold py-3.5 px-6 rounded-xl transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg text-sm text-center flex items-center justify-center gap-2"
                >
                  <span>{popupConfig.buttonText}</span>
                </button>
                <button
                  onClick={() => setShowPopupPreview(false)}
                  className="w-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-semibold py-2.5 transition-colors cursor-pointer text-center mt-1"
                >
                  Nanti Saja
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
