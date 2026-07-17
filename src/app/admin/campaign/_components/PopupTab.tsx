import React from 'react'
import { FiSettings, FiImage, FiEye } from 'react-icons/fi'
import { PopupAdConfig } from './types'

interface PopupTabProps {
  popupConfig: PopupAdConfig
  onChangePopupConfig: (config: PopupAdConfig) => void
  onSaveConfig: (e: React.FormEvent) => void
  onTestShowPreview: () => void
}

export default function PopupTab({
  popupConfig,
  onChangePopupConfig,
  onSaveConfig,
  onTestShowPreview
}: PopupTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Form Settings Iklan */}
      <div className="lg:col-span-3">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-200">
              <FiSettings className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              <span>Konfigurasi Iklan Popup</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold">Status:</span>
              <button
                type="button"
                onClick={() => onChangePopupConfig({ ...popupConfig, isActive: !popupConfig.isActive })}
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

          <form onSubmit={onSaveConfig} className="space-y-4 text-sm">
            <div>
              <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                Judul Iklan Promo
              </label>
              <input
                type="text"
                value={popupConfig.title}
                onChange={(e) => onChangePopupConfig({ ...popupConfig, title: e.target.value })}
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
                value={popupConfig.description}
                onChange={(e) => onChangePopupConfig({ ...popupConfig, description: e.target.value })}
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
                  value={popupConfig.buttonText}
                  onChange={(e) => onChangePopupConfig({ ...popupConfig, buttonText: e.target.value })}
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
                  value={popupConfig.targetUrl}
                  onChange={(e) => onChangePopupConfig({ ...popupConfig, targetUrl: e.target.value })}
                  placeholder="Contoh: /product/id"
                  className="w-full rounded border border-zinc-200 dark:border-zinc-800 bg-transparent px-3.5 py-2.5 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                className="flex-1 bg-sky-700 hover:bg-sky-800 text-white font-semibold py-2.5 rounded transition-colors cursor-pointer text-center"
              >
                Simpan Pengaturan
              </button>
              <button
                type="button"
                onClick={onTestShowPreview}
                className="flex-1 border border-sky-600 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 text-sky-600 dark:text-sky-400 font-semibold py-2.5 rounded transition-all cursor-pointer flex items-center justify-center gap-2"
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
        <div className="bg-white dark:bg-zinc-900 p-5 rounded">
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
