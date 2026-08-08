import { NextResponse } from 'next/server'
import { createClient } from '@/services/supabase/server'

// Harus sinkron dengan daftar di src/app/admin/layout.tsx
const ADMIN_EMAILS = [
  'adi.hadi270@gmail.com',
  'adihadi270@gmail.com',
  'laqzerindonesia@gmail.com',
]

/**
 * Validasi URL redirect agar tidak bisa diarahkan ke luar domain.
 */
function getSafeRedirect(next?: string | null): string {
  if (!next) return '/'
  // Harus diawali '/' tapi bukan '//' (protocol-relative URL)
  if (!next.startsWith('/') || next.startsWith('//')) return '/'
  return next
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = getSafeRedirect(searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const userEmail = data.user?.email ?? ''
      // Jika admin, selalu redirect ke /admin
      const redirectTo = ADMIN_EMAILS.includes(userEmail) ? '/admin' : next
      return NextResponse.redirect(`${origin}${redirectTo}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-failed`)
}
