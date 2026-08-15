'use client'

import { useState, useEffect, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar from './products/_components/Sidebar'
import { createClient } from '@/services/supabase/client'
import Swal from 'sweetalert2'

// Daftar email admin yang diizinkan
const ADMIN_EMAILS = [
  'adi.hadi270@gmail.com',
  'adihadi270@gmail.com',
  'laqzerindonesia@gmail.com'
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const supabase = useMemo(() => createClient(), [])

  // 1. Verifikasi Autentikasi dan Role Email Admin
  useEffect(() => {
    // Abaikan check jika sedang berada di halaman /admin/login
    if (pathname === '/admin/login') {
      setCheckingAuth(false)
      return
    }

    const checkAdminAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        // Belum login -> lempar ke login admin
        router.replace('/admin/login')
        return
      }

      const userEmail = session.user?.email
      if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
        // Bukan admin -> paksa logout dan kembalikan ke homepage dengan notifikasi
        await supabase.auth.signOut()
        Swal.fire({
          icon: 'error',
          title: 'Akses Ditolak',
          text: 'Email Anda tidak terdaftar sebagai administrator.',
          confirmButtonColor: '#0369a1'
        }).then(() => {
          router.replace('/')
        })
        return
      }

      // Berhasil diverifikasi sebagai admin
      setIsAuthorized(true)
      setCheckingAuth(false)
    }

    checkAdminAuth()
  }, [pathname, router, supabase])

  // Sinkronisasi status collapse sidebar
  useEffect(() => {
    const stored = localStorage.getItem('left-sidebar-collapsed') === 'true'
    const timer = setTimeout(() => setIsCollapsed(stored), 0)
    return () => clearTimeout(timer)
  }, [])

  // Jika sedang memverifikasi, tampilkan loading layar penuh
  if (checkingAuth && pathname !== '/admin/login') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-sm text-zinc-500 animate-pulse font-medium">Memverifikasi Otoritas Admin...</p>
      </div>
    )
  }

  // Jika di halaman login admin, render tanpa Sidebar / Layout Admin
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // Hanya render layout jika terotorisasi
  if (!isAuthorized) return null

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans">
      {/* Sidebar - Desktop */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <main className="flex-1 p-6 md:p-8 w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}

