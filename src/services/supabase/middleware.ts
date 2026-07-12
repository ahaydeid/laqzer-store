import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Refreshes the user's Supabase session automatically.
 * This is essential for keeping the user logged in, refreshing tokens, and updating cookies.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
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

  // This will refresh the session if it is expired
  // IMPORTANT: Do not remove or change this call.
  await supabase.auth.getUser()

  return supabaseResponse
}
