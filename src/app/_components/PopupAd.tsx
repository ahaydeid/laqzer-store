'use client'

import { useEffect, useState, useMemo } from 'react'
import { FiX } from 'react-icons/fi'
import { PopupAdConfig } from '@/core/types/popup'
import { SupabasePopupService } from '@/services/supabase/popup.service'
import useSWR from 'swr'

const SESSION_KEY = 'laqzer_popup_shown'

export function PopupAd() {
  const popupService = useMemo(() => new SupabasePopupService(), [])
  
  const { data: config } = useSWR<PopupAdConfig>(
    'popup-config',
    () => popupService.getPopupConfig(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // cache 60 detik
    }
  )

  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Jangan tampilkan jika sudah pernah muncul di sesi ini
    if (sessionStorage.getItem(SESSION_KEY)) return

    if (config && config.isActive && config.imageUrl) {
      setVisible(true)
      sessionStorage.setItem(SESSION_KEY, '1')
    }
  }, [config])

  const handleClose = () => setVisible(false)

  if (!visible || !config) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4 animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 z-10 rounded-full p-1.5 bg-black/40 hover:bg-black/60 text-white transition-all cursor-pointer"
          aria-label="Tutup popup"
        >
          <FiX className="h-4 w-4" />
        </button>

        {/* Banner Image */}
        <div className="w-full aspect-square bg-zinc-950 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={config.imageUrl}
            alt={config.title || 'Promo Banner'}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Actions */}
        <div className="p-4 flex flex-col gap-2.5">
          <a
            href={config.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-3 rounded-lg text-center transition-colors dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-sm shadow-md cursor-pointer block"
          >
            {config.buttonText || 'Belanja Sekarang'}
          </a>
          <button
            onClick={handleClose}
            className="w-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 font-semibold py-2.5 rounded-lg text-sm cursor-pointer transition-colors"
          >
            Nanti Saja
          </button>
        </div>
      </div>
    </div>
  )
}
