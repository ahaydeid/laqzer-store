'use client'

import React, { useState } from 'react'
import { 
  FiPercent, 
  FiTag, 
  FiEye, 
  FiX 
} from 'react-icons/fi'
import Swal from 'sweetalert2'
import { playSwalSound } from '@/utils/sound'

import { DiscountItem, VoucherItem, PopupAdConfig } from './types'
import DiscountTab from './DiscountTab'
import DiscountModal from './DiscountModal'
import VoucherTab from './VoucherTab'
import PopupTab from './PopupTab'

const INITIAL_DISCOUNTS: DiscountItem[] = [
  {
    id: '1',
    campaignName: 'Promo Gajian Juli',
    productId: 'mock-2',
    productName: 'Keyboard Mechanical Laqzer RGB',
    originalPrice: 850000,
    priceAfterDiscount: 722500,
    discountPercent: 15,
    isActive: true,
    startDate: '2026-07-10',
    endDate: '2026-07-25',
  },
  {
    id: '2',
    campaignName: 'Flash Sale Gaming',
    productId: 'mock-3',
    productName: 'Mouse Wireless Gaming Superlight',
    originalPrice: 450000,
    priceAfterDiscount: 405000,
    discountPercent: 10,
    isActive: true,
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
  const [discountCounter, setDiscountCounter] = useState(3)
  const [showDiscountModal, setShowDiscountModal] = useState(false)

  // State for Vouchers
  const [vouchers, setVouchers] = useState<VoucherItem[]>(INITIAL_VOUCHERS)

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

  // Add discount handler
  const handleAddDiscount = (newDiscountData: Omit<DiscountItem, 'id'>) => {
    const newDiscount: DiscountItem = {
      id: `discount-${discountCounter}`,
      ...newDiscountData
    }

    setDiscounts([newDiscount, ...discounts])
    setDiscountCounter(prev => prev + 1)
    setShowDiscountModal(false)

    Swal.fire({
      icon: 'success',
      title: 'Diskon Berhasil Dibuat',
      text: `Diskon untuk event "${newDiscountData.campaignName}" telah berhasil dibuat.`,
      confirmButtonColor: '#0369a1'
    })
  }

  // Toggle active status in table
  const handleToggleDiscountStatus = (id: string) => {
    const item = discounts.find(d => d.id === id)
    if (!item) return

    const actionText = item.isActive ? 'menonaktifkan' : 'mengaktifkan'

    playSwalSound('confirm')
    Swal.fire({
      title: 'Ubah Status Diskon?',
      text: `Apakah Anda yakin ingin ${actionText} diskon untuk ${item.productName}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0369a1',
      cancelButtonColor: '#71717a',
      confirmButtonText: 'Ya, Ubah!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        setDiscounts(prev => prev.map(d => {
          if (d.id === id) {
            return { ...d, isActive: !d.isActive }
          }
          return d
        }))

        playSwalSound('success')
        Swal.fire({
          title: 'Berhasil!',
          text: `Status diskon untuk ${item.productName} berhasil diperbarui.`,
          icon: 'success',
          confirmButtonColor: '#0369a1'
        })
      }
    })
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
  const handleAddVoucher = (newVoucher: VoucherItem) => {
    setVouchers([newVoucher, ...vouchers])

    Swal.fire({
      icon: 'success',
      title: 'Voucher Berhasil Dibuat',
      text: `Voucher ${newVoucher.code} siap digunakan oleh pembeli.`,
      confirmButtonColor: '#0369a1'
    })
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
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Discounts Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800/80 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 p-5 flex flex-col justify-end relative overflow-hidden h-28">
          {/* Background Icon Circle in Top-Left */}
          <div className="absolute -top-24 -left-24 w-56 h-56 rounded-full bg-emerald-100/80 dark:bg-emerald-900/30 flex items-center justify-center text-white pointer-events-none">
            <FiPercent className="w-14 h-14 translate-x-10 translate-y-10" />
          </div>

          <div className="space-y-1 relative z-10">
            <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Diskon Produk
            </h3>
            <span className="text-2xl font-extrabold text-zinc-800 dark:text-zinc-100 block">
              {discounts.length}{" "}
              <span className="text-sm font-normal text-zinc-400 dark:text-zinc-500">
                produk
              </span>
            </span>
          </div>
        </div>

        {/* Vouchers Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800/80 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 p-5 flex flex-col justify-end relative overflow-hidden h-28">
          {/* Background Icon Circle in Top-Left */}
          <div className="absolute -top-24 -left-24 w-56 h-56 rounded-full bg-indigo-100/80 dark:bg-indigo-900/30 flex items-center justify-center text-white pointer-events-none">
            <FiTag className="w-14 h-14 translate-x-10 translate-y-10" />
          </div>

          <div className="space-y-1 relative z-10">
            <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Voucher
            </h3>
            <span className="text-2xl font-extrabold text-zinc-800 dark:text-zinc-100 block">
              {vouchers.filter(v => v.status === 'active').length}{" "}
              <span className="text-sm font-normal text-zinc-400 dark:text-zinc-500">
                aktif
              </span>
            </span>
          </div>
        </div>

        {/* Popup Status Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800/80 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 p-5 flex flex-col justify-end relative overflow-hidden h-28">
          {/* Background Icon Circle in Top-Left */}
          <div className="absolute -top-24 -left-24 w-56 h-56 rounded-full bg-sky-100/80 dark:bg-sky-900/30 flex items-center justify-center text-white pointer-events-none">
            <FiEye className="w-14 h-14 translate-x-10 translate-y-10" />
          </div>

          <div className="space-y-1 relative z-10">
            <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Iklan Popup Promo
            </h3>
            <div className="flex items-center gap-2 relative z-10">
              <span className={`text-2xl font-extrabold block ${popupConfig.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-800 dark:text-zinc-100'}`}>
                {popupConfig.isActive ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
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
          <FiTag className="h-4 w-4" />
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
        {activeTab === 'discount' && (
          <DiscountTab 
            discounts={discounts} 
            onToggleStatus={handleToggleDiscountStatus} 
            onDeleteDiscount={handleDeleteDiscount} 
            onOpenModal={() => setShowDiscountModal(true)} 
            formatRupiah={formatRupiah} 
          />
        )}

        {activeTab === 'voucher' && (
          <VoucherTab 
            vouchers={vouchers} 
            onAddVoucher={handleAddVoucher} 
            onToggleVoucher={handleToggleVoucher} 
            formatRupiah={formatRupiah} 
          />
        )}

        {activeTab === 'popup' && (
          <PopupTab 
            popupConfig={popupConfig} 
            onChangePopupConfig={setPopupConfig} 
            onSaveConfig={handleSavePopupConfig} 
            onTestShowPreview={() => setShowPopupPreview(true)} 
          />
        )}
      </div>

      {/* Modal Buat Diskon Baru */}
      <DiscountModal 
        isOpen={showDiscountModal} 
        onClose={() => setShowDiscountModal(false)} 
        onAddDiscount={handleAddDiscount} 
        formatRupiah={formatRupiah} 
      />

      {/* Live Preview Modal Overlay */}
      {showPopupPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-zinc-200 dark:border-zinc-800/80 max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-y-visible">
            {/* Close Button overlay */}
            <button 
              onClick={() => setShowPopupPreview(false)}
              className="absolute right-4 top-4 z-[110] rounded-full p-2 bg-white/80 hover:bg-white dark:bg-zinc-800/80 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-all shadow-md cursor-pointer"
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
            <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center space-y-6">
              <div className="space-y-3">
                <span className="inline-block text-[10px] uppercase tracking-widest font-extrabold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-2.5 py-1 rounded">
                  Pemberitahuan Khusus
                </span>
                <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white leading-tight">
                  {popupConfig.title}
                </h2>
                <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                  {popupConfig.description}
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <a 
                  href={popupConfig.targetUrl}
                  onClick={(e) => {
                    e.preventDefault()
                    setShowPopupPreview(false)
                    Swal.fire({
                      icon: 'info',
                      title: 'Navigasi Sukses',
                      text: `Membuka halaman tujuan: ${popupConfig.targetUrl}`,
                      confirmButtonColor: '#0369a1'
                    })
                  }}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-3.5 rounded-xl text-center transition-colors dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-xs md:text-sm shadow-md cursor-pointer block"
                >
                  {popupConfig.buttonText}
                </a>
                <button
                  onClick={() => setShowPopupPreview(false)}
                  className="w-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 font-semibold py-3 rounded-xl text-center transition-colors text-xs md:text-sm cursor-pointer"
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
