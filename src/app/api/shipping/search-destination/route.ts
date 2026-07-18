import { NextRequest, NextResponse } from 'next/server'

// =====================================================================
// Server-side In-Memory Cache
// Cache ini dibagikan antar semua user di server yang sama.
// Jika "Balaraja" sudah dicari user A, user B tidak akan memakan kuota.
// TTL: 24 jam (86400 detik)
// =====================================================================
const serverCache = new Map<string, { results: any[]; expiresAt: number }>()
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 jam

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.toLowerCase().trim() ?? ''
  const apiKey = process.env.RAJAONGKIR_API_KEY

  if (query.length < 3) {
    return NextResponse.json({ results: [] })
  }

  if (!apiKey) {
    return NextResponse.json(
      { error: 'RAJAONGKIR_API_KEY belum dikonfigurasi di server' },
      { status: 500 }
    )
  }

  // ── Cek server cache ──────────────────────────────────────────────
  const cached = serverCache.get(query)
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json({ results: cached.results, cached: true }, {
      headers: { 'Cache-Control': 'public, max-age=86400' }
    })
  }

  // ── Hit Komerce API (hanya jika cache miss atau expired) ──────────
  try {
    const res = await fetch(
      `https://rajaongkir.komerce.id/api/v1/destination/domestic-destination?search=${encodeURIComponent(query)}`,
      {
        headers: { key: apiKey },
        signal: AbortSignal.timeout(6000),
        cache: 'no-store'
      }
    )

    if (!res.ok) {
      throw new Error(`Komerce RajaOngkir returned status ${res.status}`)
    }

    const data = await res.json()
    const results = (data.data || []).map((item: any) => ({
      id: item.id.toString(),
      label: item.label,
      province_name: item.province_name,
      city_name: item.city_name,
      district_name: item.district_name,
      subdistrict_name: item.subdistrict_name,
      zip_code: item.zip_code || ''
    }))

    // Simpan ke server cache
    serverCache.set(query, { results, expiresAt: Date.now() + CACHE_TTL_MS })

    return NextResponse.json({ results }, {
      headers: { 'Cache-Control': 'public, max-age=86400' }
    })
  } catch (error: any) {
    console.error('[Komerce Search API Error] Gagal mencari lokasi:', error)
    return NextResponse.json(
      { error: error?.message || 'Gagal terhubung ke Komerce RajaOngkir API' },
      { status: 520 }
    )
  }
}
