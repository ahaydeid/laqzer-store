import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.RAJAONGKIR_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'RAJAONGKIR_API_KEY belum dikonfigurasi di server' },
      { status: 500 }
    )
  }

  try {
    const res = await fetch('https://rajaongkir.komerce.id/api/v1/destination/province', {
      headers: {
        key: apiKey
      },
      signal: AbortSignal.timeout(6000), // Batas waktu 6 detik
      next: { revalidate: 86400 } // Cache selama 24 jam
    })

    if (!res.ok) {
      throw new Error(`Komerce RajaOngkir returned status ${res.status}`)
    }

    const data = await res.json()
    
    // Map respon Komerce ke format RajaOngkir asli agar kompatibel dengan frontend
    const results = (data.data || []).map((p: any) => ({
      province_id: p.id.toString(),
      province: p.name
    }))

    return NextResponse.json({
      rajaongkir: {
        status: { code: 200, description: 'OK' },
        results
      }
    }, {
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=600'
      }
    })
  } catch (error: any) {
    console.error('[Komerce API Error] Gagal fetch provinsi:', error)
    return NextResponse.json(
      { error: error?.message || 'Gagal terhubung ke Komerce RajaOngkir API' },
      { status: 520 }
    )
  }
}
