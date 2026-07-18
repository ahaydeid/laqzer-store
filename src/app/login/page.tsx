'use client'

import React, { useState } from 'react'
import { createClient } from '@/services/supabase/client'
import { FcGoogle } from 'react-icons/fc'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      console.error('Login failed:', err)
      alert(err.message || 'Gagal masuk dengan Google')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-6 shadow-xs space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Masuk ke Laqzer Store
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Gunakan akun Google kamu untuk melanjutkan
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
        >
          <FcGoogle className="h-4 w-4 shrink-0" />
          <span>{loading ? 'Menghubungkan...' : 'Lanjutkan dengan Google'}</span>
        </button>

        <p className="text-[11px] text-center text-zinc-400 dark:text-zinc-500 leading-tight">
          Dengan melanjutkan, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi toko kami.
        </p>
      </div>
    </div>
  )
}
