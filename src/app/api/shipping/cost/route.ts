import { NextRequest, NextResponse } from 'next/server'

// Cache memori server-side untuk ongkos kirim (TTL 3 jam)
const costCache = new Map<string, { data: any; expiry: number }>()
const CACHE_TTL = 3 * 60 * 60 * 1000 // 3 jam dalam milidetik

export async function POST(request: NextRequest) {
  try {
    const { destinationCityId, weightInGrams } = await request.json()
    const apiKey = process.env.RAJAONGKIR_API_KEY

    if (!destinationCityId) {
      return NextResponse.json({ error: 'Parameter destinationCityId diperlukan' }, { status: 400 })
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'RAJAONGKIR_API_KEY belum dikonfigurasi di server' },
        { status: 500 }
      )
    }

    // Terapkan toleransi pembulatan kilogram kurir Indonesia (toleransi 300 gram)
    // 0 - 1000g -> 1kg (1000g)
    // > 1000g -> jika kelebihan <= 300g bulatkan ke bawah, jika > 300g bulatkan ke atas
    const rawWeight = weightInGrams || 1000
    let roundedWeightKg = 1
    if (rawWeight > 1000) {
      const baseKg = Math.floor(rawWeight / 1000)
      const remainder = rawWeight % 1000
      roundedWeightKg = remainder <= 300 ? baseKg : baseKg + 1
    }
    const weight = roundedWeightKg * 1000

    // Kota asal default toko (Saga, Balaraja, Kab. Tangerang: ID 73361)
    const originCityId = '73361'
    const courierList = 'jne:sicepat:jnt:tiki:pos:anteraja:lion:ninja:ide:sap:ncs:rex:rpx:sentral:star:wahana:dse'

    // Check Cache Terlebih Dahulu
    const cacheKey = `${originCityId}-${destinationCityId}-${weight}`
    const cachedItem = costCache.get(cacheKey)
    if (cachedItem && cachedItem.expiry > Date.now()) {
      console.log(`[Komerce Cost Cache HIT] Mengembalikan cache untuk key: ${cacheKey}`)
      return NextResponse.json(cachedItem.data)
    }

    // Parameter URL encoded
    const bodyParams = new URLSearchParams()
    bodyParams.append('origin', originCityId)
    bodyParams.append('destination', destinationCityId)
    bodyParams.append('weight', weight.toString())
    bodyParams.append('courier', courierList)

    const res = await fetch('https://rajaongkir.komerce.id/api/v1/calculate/domestic-cost', {
      method: 'POST',
      headers: {
        key: apiKey,
        'content-type': 'application/x-www-form-urlencoded'
      },
      body: bodyParams,
      signal: AbortSignal.timeout(8000), // Batas waktu 8 detik
      next: { revalidate: 3600 } // Cache per jam
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Komerce RajaOngkir cost returned status ${res.status}: ${errorText}`)
    }

    const data = await res.json()
    const results = data?.data || []

    if (results.length === 0) {
      return NextResponse.json(
        { error: 'Gagal mendapatkan tarif pengiriman dari RajaOngkir Komerce' },
        { status: 520 }
      )
    }

    // Map respon Komerce ke format kurir di frontend
    const formattedResults = results.map((c: any) => {
      // Dapatkan kode kurir singkat untuk label
      const courierCode = c.code || 'jne'
      return {
        id: `${courierCode}-${c.service.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        name: courierCode.toUpperCase(),
        service: c.service,
        cost: c.cost || 0,
        etd: c.etd 
          ? c.etd.toLowerCase().includes('day') 
            ? c.etd.toLowerCase().replace('day', 'Hari').trim()
            : `${c.etd} Hari`
          : '2-3 Hari'
      }
    })

    const responsePayload = {
      rajaongkir: {
        status: { code: 200, description: 'OK' },
        results: formattedResults
      }
    }

    // Simpan ke Cache
    costCache.set(cacheKey, {
      data: responsePayload,
      expiry: Date.now() + CACHE_TTL
    })

    return NextResponse.json(responsePayload)

  } catch (error: any) {
    console.error('[Komerce Cost Route Error] Terjadi kesalahan:', error)
    return NextResponse.json(
      { error: error?.message || 'Gagal menghitung ongkos kirim' },
      { status: 500 }
    )
  }
}
