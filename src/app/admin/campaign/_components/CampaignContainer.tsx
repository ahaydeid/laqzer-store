'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { FiPercent, FiTag, FiEye, FiX } from 'react-icons/fi'
import Swal from 'sweetalert2'
import { playSwalSound } from '@/utils/sound'
import { getServices } from '@/services'
import { CampaignItem } from '@/core/types/campaign'
import { PopupAdConfig } from '@/core/types/popup'
import { SupabasePopupService } from '@/services/supabase/popup.service'
import useSWR from 'swr'

import { VoucherItem } from './types'
import DiscountTab from './DiscountTab'
import DiscountModal from './DiscountModal'
import VoucherTab from './VoucherTab'
import PopupTab from './PopupTab'

const INITIAL_VOUCHERS: VoucherItem[] = [
  { code: 'LAQZERBARU', campaignName: 'Promo Pelanggan Baru', type: 'percent', value: 10, minPurchase: 150000, quota: 100, expiryDate: '2026-08-31', status: 'active' },
  { code: 'HEMAT50K', campaignName: 'Promo Gajian Akhir Bulan', type: 'nominal', value: 50000, minPurchase: 300000, quota: 50, expiryDate: '2026-07-31', status: 'active' },
  { code: 'FREEONGKIR', campaignName: 'Gratis Ongkos Kirim', type: 'nominal', value: 20000, minPurchase: 100000, quota: 200, expiryDate: '2026-12-31', status: 'active' },
]

export default function CampaignContainer() {
  const [activeTab, setActiveTab] = useState<'discount' | 'voucher' | 'popup'>('discount')
  const campaignService = useMemo(() => getServices().campaigns, [])
  const productService = useMemo(() => getServices().products, [])

  // === Discount / Campaign state (SWR Caching) ===
  const { data: campaigns = [], isLoading: isLoadingCampaigns, mutate: mutateCampaigns } = useSWR<CampaignItem[]>(
    'campaigns-list',
    () => campaignService.getCampaigns(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 15000, // cache selama 15 detik
    }
  )
  const [showDiscountModal, setShowDiscountModal] = useState(false)

  // === Popup config — untuk stats card dengan useSWR ===
  const popupService = useMemo(() => new SupabasePopupService(), [])
  const { data: popupConfig } = useSWR<PopupAdConfig>(
    'popup-config',
    () => popupService.getPopupConfig(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )

  const handleAddDiscount = async (data: Omit<CampaignItem, 'id' | 'createdAt'>) => {
    try {
      await campaignService.createCampaign(data)
      playSwalSound('success')
      Swal.fire({ icon: 'success', title: 'Campaign Berhasil Dibuat', text: `Campaign "${data.campaignName}" telah aktif.`, confirmButtonColor: '#0369a1' })
      setShowDiscountModal(false)
      mutateCampaigns()
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: err?.message || 'Terjadi kesalahan.' })
    }
  }

  const handleToggleStatus = async (id: string) => {
    const item = campaigns.find(c => c.id === id)
    if (!item) return
    const actionText = item.isActive ? 'menonaktifkan' : 'mengaktifkan'
    playSwalSound('confirm')
    const result = await Swal.fire({
      title: 'Ubah Status Campaign?',
      text: `Apakah Anda yakin ingin ${actionText} campaign "${item.campaignName}"?`,
      icon: 'question', showCancelButton: true,
      confirmButtonColor: '#0369a1', cancelButtonColor: '#71717a',
      confirmButtonText: 'Ya, Ubah!', cancelButtonText: 'Batal'
    })
    if (!result.isConfirmed) return
    try {
      await campaignService.toggleCampaignStatus(id, !item.isActive)
      playSwalSound('success')
      Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Status campaign diperbarui.', confirmButtonColor: '#0369a1' })
      mutateCampaigns()
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: err?.message })
    }
  }

  const handleDeleteDiscount = async (id: string, campaignName: string) => {
    const result = await Swal.fire({
      title: 'Hapus Campaign?',
      text: `Campaign "${campaignName}" akan dihapus dan harga produk dikembalikan ke semula.`,
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal'
    })
    if (!result.isConfirmed) return
    try {
      await campaignService.deleteCampaign(id)
      playSwalSound('success')
      Swal.fire({ icon: 'success', title: 'Dihapus!', text: 'Campaign berhasil dihapus dan harga dikembalikan.', confirmButtonColor: '#0369a1' })
      mutateCampaigns()
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: err?.message })
    }
  }

  // === Voucher (masih local) ===
  const [vouchers, setVouchers] = useState<VoucherItem[]>(INITIAL_VOUCHERS)
  const handleAddVoucher = (v: VoucherItem) => {
    setVouchers([v, ...vouchers])
    Swal.fire({ icon: 'success', title: 'Voucher Berhasil Dibuat', text: `Voucher ${v.code} siap digunakan.`, confirmButtonColor: '#0369a1' })
  }
  const handleToggleVoucher = (code: string) => {
    setVouchers(vouchers.map(v => v.code === code ? { ...v, status: v.status === 'active' ? 'inactive' : 'active' } : v))
  }

  // === Popup preview state ===
  const [showPopupPreview, setShowPopupPreview] = useState(false)
  const [previewConfig, setPreviewConfig] = useState<PopupAdConfig | null>(null)
  const handleShowPreview = (config: PopupAdConfig) => {
    setPreviewConfig(config)
    setShowPopupPreview(true)
  }

  const formatRupiah = (num: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800/80 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 p-5 flex flex-col justify-end relative overflow-hidden h-28">
          <div className="absolute -top-24 -left-24 w-56 h-56 rounded-full bg-emerald-100/80 dark:bg-emerald-900/30 pointer-events-none" />
          <FiPercent className="absolute top-6 left-6 w-10 h-10 text-emerald-400/50" />
          <div className="space-y-1 relative z-10">
            <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Diskon Produk</h3>
            <span className="text-2xl font-extrabold text-zinc-800 dark:text-zinc-100 block">
              {isLoadingCampaigns ? '...' : campaigns.filter(c => c.isActive).length}{' '}
              <span className="text-sm font-normal text-zinc-400 dark:text-zinc-500">aktif</span>
            </span>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800/80 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 p-5 flex flex-col justify-end relative overflow-hidden h-28">
          <div className="absolute -top-24 -left-24 w-56 h-56 rounded-full bg-indigo-100/80 dark:bg-indigo-900/30 pointer-events-none" />
          <FiTag className="absolute top-6 left-6 w-10 h-10 text-indigo-400/50" />
          <div className="space-y-1 relative z-10">
            <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Voucher</h3>
            <span className="text-2xl font-extrabold text-zinc-800 dark:text-zinc-100 block">
              {vouchers.filter(v => v.status === 'active').length}{' '}
              <span className="text-sm font-normal text-zinc-400 dark:text-zinc-500">aktif</span>
            </span>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800/80 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 p-5 flex flex-col justify-end relative overflow-hidden h-28">
          <div className="absolute -top-24 -left-24 w-56 h-56 rounded-full bg-sky-100/80 dark:bg-sky-900/30 pointer-events-none" />
          <FiEye className="absolute top-6 left-6 w-10 h-10 text-sky-400/50" />
          <div className="space-y-1 relative z-10">
            <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Iklan Popup Promo</h3>
            <span className={`text-2xl font-extrabold block ${popupConfig?.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-800 dark:text-zinc-100'}`}>
              {popupConfig?.isActive ? 'Aktif' : 'Nonaktif'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        {([
          { key: 'discount', icon: FiPercent, label: 'Diskon Produk' },
          { key: 'voucher', icon: FiTag, label: 'Voucher Belanja' },
          { key: 'popup', icon: FiEye, label: 'Iklan Popup' },
        ] as const).map(({ key, icon: Icon, label }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold border-b-2 transition-all duration-200 cursor-pointer ${
              activeTab === key
                ? 'border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400 bg-sky-50/20 dark:bg-zinc-900/40'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/10'
            }`}>
            <Icon className="h-4 w-4" /><span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="mt-2">
        {activeTab === 'discount' && (
          <DiscountTab
            campaigns={campaigns}
            isLoading={isLoadingCampaigns}
            onToggleStatus={handleToggleStatus}
            onDeleteDiscount={handleDeleteDiscount}
            onOpenModal={() => setShowDiscountModal(true)}
            formatRupiah={formatRupiah}
          />
        )}
        {activeTab === 'voucher' && (
          <VoucherTab vouchers={vouchers} onAddVoucher={handleAddVoucher} onToggleVoucher={handleToggleVoucher} formatRupiah={formatRupiah} />
        )}
        {activeTab === 'popup' && (
          <PopupTab onTestShowPreview={handleShowPreview} />
        )}
      </div>

      {/* Modal Diskon */}
      <DiscountModal
        isOpen={showDiscountModal}
        onClose={() => setShowDiscountModal(false)}
        onAddDiscount={handleAddDiscount}
        productService={productService}
        formatRupiah={formatRupiah}
      />

      {/* Popup Preview */}
      {showPopupPreview && previewConfig && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4" onClick={() => setShowPopupPreview(false)}>
          <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-lg overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowPopupPreview(false)} className="absolute right-3 top-3 z-[110] rounded-full p-1.5 bg-black/40 hover:bg-black/60 text-white transition-all cursor-pointer">
              <FiX className="h-4 w-4" />
            </button>
            <div className="w-full aspect-square bg-zinc-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewConfig.imageUrl} alt="Popup Banner" className="w-full h-full object-cover" />
            </div>
            <div className="p-4 flex flex-col gap-2.5">
              <a href={previewConfig.targetUrl} onClick={e => { e.preventDefault(); setShowPopupPreview(false) }}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-3 rounded-lg text-center text-sm cursor-pointer block dark:bg-zinc-100 dark:text-zinc-900">
                {previewConfig.buttonText}
              </a>
              <button onClick={() => setShowPopupPreview(false)}
                className="w-full border border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold py-2.5 rounded-lg text-sm cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900">
                Nanti Saja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
