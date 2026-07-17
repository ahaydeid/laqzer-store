import React, { useState } from 'react'
import { FiEye, FiEdit2, FiCheck } from 'react-icons/fi'
import { PopupAdConfig } from './types'
import Toggle from '@/components/ui/Toggle'
import { Button } from '@/components/ui/Button'

interface PopupTabProps {
  popupConfig: PopupAdConfig
  onChangePopupConfig: (config: PopupAdConfig) => void
  onSaveConfig: () => void
  onTestShowPreview: () => void
}

export default function PopupTab({
  popupConfig,
  onChangePopupConfig,
  onSaveConfig,
  onTestShowPreview
}: PopupTabProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState<PopupAdConfig>(popupConfig)

  const handleEnterEdit = () => {
    setDraft(popupConfig)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onChangePopupConfig(draft)
    onSaveConfig()
    setIsEditing(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Form Settings Iklan */}
      <div className="lg:col-span-3">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <span className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">Konfigurasi Iklan Popup</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold">Status:</span>
              <Toggle
                leftLabel="Nonaktif"
                rightLabel="Aktif"
                checked={!popupConfig.isActive}
                onChange={(checked) => onChangePopupConfig({ ...popupConfig, isActive: !checked })}
                activeColorClass={popupConfig.isActive ? 'bg-emerald-500' : 'bg-zinc-400 dark:bg-zinc-500'}
                className="w-36"
              />
            </div>
          </div>

          {/* Read Mode */}
          {!isEditing && (
            <div className="space-y-4 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Judul Promo</span>
                <span className="text-zinc-800 dark:text-zinc-200 font-medium">
                  {popupConfig.title || <span className="text-zinc-400 dark:text-zinc-600 italic font-normal">Belum diisi</span>}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Deskripsi</span>
                <span className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {popupConfig.description || <span className="text-zinc-400 dark:text-zinc-600 italic font-normal">Belum diisi</span>}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Teks Tombol CTA</span>
                  <span className="text-zinc-800 dark:text-zinc-200 font-medium">
                    {popupConfig.buttonText || <span className="text-zinc-400 dark:text-zinc-600 italic font-normal">Belum diisi</span>}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Link Tujuan</span>
                  <span className="text-zinc-800 dark:text-zinc-200 font-medium break-all">
                    {popupConfig.targetUrl || <span className="text-zinc-400 dark:text-zinc-600 italic font-normal">Belum diisi</span>}
                  </span>
                </div>
              </div>
              <div className="flex gap-2.5 pt-1">
                <Button variant="secondary" size="sm" onClick={handleEnterEdit} className="rounded">
                  <FiEdit2 className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={onTestShowPreview} className="rounded">
                  <FiEye className="h-3.5 w-3.5" />
                  Uji Coba Tampilan
                </Button>
              </div>
            </div>
          )}

          {/* Edit Mode */}
          {isEditing && (
            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Judul Iklan Promo
                </label>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Masukkan Judul Promo"
                  className="w-full rounded border border-zinc-200 dark:border-zinc-800 bg-transparent px-3.5 py-2.5 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Deskripsi Singkat Promo
                </label>
                <textarea
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  placeholder="Masukkan penjelasan promo..."
                  className="w-full rounded border border-zinc-200 dark:border-zinc-800 bg-transparent px-3.5 py-2 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 resize-none font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Teks Tombol Aksi (CTA)
                  </label>
                  <input
                    type="text"
                    value={draft.buttonText}
                    onChange={(e) => setDraft({ ...draft, buttonText: e.target.value })}
                    placeholder="Contoh: Belanja Sekarang"
                    className="w-full rounded border border-zinc-200 dark:border-zinc-800 bg-transparent px-3.5 py-2.5 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Link Tujuan Redirect
                  </label>
                  <input
                    type="text"
                    value={draft.targetUrl}
                    onChange={(e) => setDraft({ ...draft, targetUrl: e.target.value })}
                    placeholder="Contoh: /product/id"
                    className="w-full rounded border border-zinc-200 dark:border-zinc-800 bg-transparent px-3.5 py-2.5 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-1">
                <Button type="button" variant="secondary" size="sm" onClick={handleCancel} className="rounded">
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" className="rounded">
                  <FiCheck className="h-3.5 w-3.5" />
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Panduan & Preview Asset Banner */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded">
          <h3 className="font-bold text-zinc-800 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-800 pb-3 text-sm">
            Preview Asset Banner
          </h3>
          <div className="mt-4 space-y-3.5">
            <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-inner group">
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
                <li>Disarankan rasio <b>persegi (1:1)</b> — tampil optimal di semua perangkat termasuk HP</li>
                <li>Ekstensi: PNG, JPEG, atau WebP</li>
                <li>Ukuran file maksimum: 1.5MB</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Penjelasan Ringkas Fitur */}
        <div className="bg-sky-50/50 dark:bg-zinc-900/30 p-5 rounded">
          <h4 className="font-bold text-sky-900 dark:text-sky-400 text-sm mb-2">💡 Tentang Iklan Popup</h4>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Iklan popup akan muncul satu kali setiap pengunjung pertama kali membuka web toko (homepage). Sangat efektif untuk mempromosikan diskon besar, voucher baru, atau perilisan produk eksklusif.
          </p>
        </div>
      </div>
    </div>
  )
}
