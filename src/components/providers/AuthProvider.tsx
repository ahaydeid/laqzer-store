'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/services/supabase/client'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  requireAuth: (actionName?: string) => boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  requireAuth: () => false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    router.push('/')
  }

  /**
   * Helper to guard actions.
   * If logged in -> returns true.
   * If guest -> prompts user to login and returns false.
   */
  const requireAuth = (actionName = 'melanjutkan aksi ini'): boolean => {
    if (user) return true

    Swal.fire({
      title: 'Perlu Masuk Akun',
      text: `Silakan masuk dengan akun Google kamu untuk ${actionName}.`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Masuk Sekarang',
      cancelButtonText: 'Nanti Saja',
      confirmButtonColor: '#0ea5e9',
      cancelButtonColor: '#71717a',
    }).then((result) => {
      if (result.isConfirmed) {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`)
      }
    })

    return false
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, requireAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
