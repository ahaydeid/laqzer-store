import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Refreshes the user's Supabase session automatically and enforces route protection.
 * This is essential for keeping the user logged in, refreshing tokens, updating cookies,
 * and preventing unauthorized access to protected routes.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Validate that the Supabase URL is a valid HTTP/HTTPS endpoint
  // and the anon key is not the default environment placeholder.
  const isUrlValid = supabaseUrl && (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'))
  const isKeyValid = supabaseAnonKey && supabaseAnonKey !== 'your-supabase-anon-key'

  if (!isUrlValid || !isKeyValid) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Update the request cookies so subsequent handlers/routes can read the new cookies
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          
          // Re-instantiate response with updated request headers
          supabaseResponse = NextResponse.next({
            request,
          })

          // Set the cookies on the response headers so they get saved in the browser
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user || null
  } catch (err) {
    console.warn('[Supabase Middleware] Connection timeout or offline during session refresh:', err)
  }

  const pathname = request.nextUrl.pathname

  // Protected buyer routes that require authentication
  const isProtectedRoute = pathname.startsWith('/user') || pathname.startsWith('/checkout') || pathname.startsWith('/cart')

  if (isProtectedRoute && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', pathname + request.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect logged in users away from login page to home or next target
  if (user && pathname === '/login') {
    const nextParam = request.nextUrl.searchParams.get('next')
    const safeNext = (nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//') && !nextParam.startsWith('/admin'))
      ? nextParam
      : '/'
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = safeNext
    redirectUrl.search = ''
    return NextResponse.redirect(redirectUrl)
  }

  // Protected admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!user) {
      const adminLoginUrl = request.nextUrl.clone()
      adminLoginUrl.pathname = '/admin/login'
      return NextResponse.redirect(adminLoginUrl)
    }
  }

  return supabaseResponse
}
