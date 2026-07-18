'use client'

import React, { useState, Suspense } from 'react'
import { createClient } from '@/services/supabase/client'
import { FcGoogle } from 'react-icons/fc'
import { FiArrowLeft } from 'react-icons/fi'
import Link from 'next/link'

function AdminLoginContent() {
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      // Setelah login Google, kirim ke auth callback dengan target redirect ke /admin
      const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent('/admin')}`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      })
      if (error) throw error
    } catch (err: any) {
      console.error('Admin login failed:', err)
      alert(err.message || 'Gagal masuk sebagai admin')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-sm flex flex-col gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors self-start"
        >
          <FiArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Toko</span>
        </Link>

        <div className="w-full aspect-square bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-8 flex flex-col justify-between shadow-sm">
          <div className="space-y-1.5 text-center pt-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Laqzer Admin Portal
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Khusus pengelola toko. Silakan masuk dengan Google.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            <FcGoogle className="h-4 w-4 shrink-0" />
            <span>{loading ? 'Menghubungkan...' : 'Masuk dengan Google'}</span>
          </button>

          <p className="text-[10px] text-center text-zinc-400 dark:text-zinc-500 leading-tight pb-1">
            Hanya email administrator terdaftar yang dapat mengakses dashboard ini.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-xs text-zinc-400">Memuat...</p>
      </div>
    }>
      <AdminLoginContent />
    </Suspense>
  )
}
