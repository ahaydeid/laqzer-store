import { type NextRequest } from 'next/server'
import { updateSession } from '@/services/supabase/middleware'

/**
 * Next.js Middleware entry point.
 * Executes updateSession on all eligible routes to ensure Supabase auth sessions
 * are kept fresh and protected routes are strictly guarded from unauthorized access.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Public static assets / images (.svg, .png, .jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
