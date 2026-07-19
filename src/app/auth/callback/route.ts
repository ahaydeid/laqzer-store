import { NextResponse } from 'next/server'
import { createClient } from '@/services/supabase/server'

/**
 * Validasi URL redirect agar tidak bisa diarahkan ke luar domain
 * atau ke halaman admin oleh pengguna biasa.
 */
function getSafeRedirect(next?: string | null): string {
  if (!next) return '/'
  // Harus diawali '/' tapi bukan '//' (protocol-relative URL)
  if (!next.startsWith('/') || next.startsWith('//')) return '/'
  // Blokir redirect ke halaman admin
  if (next.startsWith('/admin')) return '/'
  return next
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = getSafeRedirect(searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-failed`)
}

