import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

/**
 * API Route to revalidate Next.js Data Cache path from client components safely.
 */
export async function GET(request: NextRequest) {
  try {
    const path = request.nextUrl.searchParams.get('path') || '/'

    // Revalidate Next.js path cache
    revalidatePath(path)
    console.log(`[Next.js Cache Revalidation] Revalidated path: ${path} at ${new Date().toISOString()}`)

    return NextResponse.json({ revalidated: true, path, now: Date.now() })
  } catch (err: any) {
    console.error('Failed to revalidate cache path:', err)
    return NextResponse.json({ error: 'Gagal melakukan revalidasi cache' }, { status: 500 })
  }
}
