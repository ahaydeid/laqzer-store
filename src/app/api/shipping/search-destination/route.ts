import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const apiKey = process.env.RAJAONGKIR_API_KEY

  if (!query || query.length < 3) {
    return NextResponse.json({ results: [] })
  }

  if (!apiKey) {
    return NextResponse.json(
      { error: 'RAJAONGKIR_API_KEY belum dikonfigurasi di server' },
      { status: 500 }
    )
  }

  try {
    const res = await fetch(`https://rajaongkir.komerce.id/api/v1/destination/domestic-destination?search=${encodeURIComponent(query)}`, {
      headers: {
        key: apiKey
      },
      signal: AbortSignal.timeout(6000), // Batas waktu 6 detik
      cache: 'no-store' // Hindari bug caching
    })

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

    return NextResponse.json({ results })
  } catch (error: any) {
    console.error('[Komerce Search API Error] Gagal mencari lokasi:', error)
    return NextResponse.json(
      { error: error?.message || 'Gagal terhubung ke Komerce RajaOngkir API' },
      { status: 520 }
    )
  }
}
