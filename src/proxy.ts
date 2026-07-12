import { type NextRequest } from 'next/server'
import { updateSession } from '@/services/supabase/middleware'

/**
 * Root Proxy for Next.js 16+ app.
 * Replaces the deprecated middleware convention.
 * Automatically runs updateSession on all eligible routes to ensure Supabase auth sessions are kept fresh.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Images / public assets (svg, png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
