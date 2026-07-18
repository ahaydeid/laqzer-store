import { ShippingTier } from '@/core/types/shipping-tier'

/**
 * Mengklasifikasikan nama/kode sub-layanan kurir ke dalam ShippingTier internal.
 * @param courierCode Kode ekspedisi (jne, sicepat, jnt, anteraja, dll.)
 * @param serviceName Nama/kode sub-layanan dari API Komerce (cth: JTR, YES, REG, CTC, OKE, GOKIL)
 */
export function classifyShippingService(courierCode: string, serviceName: string): ShippingTier {
  const code = (courierCode || '').toLowerCase()
  const service = (serviceName || '').toUpperCase()

  // 1. KARGO / HEAVY PARCEL
  if (
    service.includes('JTR') ||
    service.includes('CARGO') ||
    service.includes('GOKIL') ||
    service.includes('TRUCKING') ||
    service.includes('HEAVY') ||
    service.includes('H3LO')
  ) {
    return 'cargo'
  }

  // 2. EXPRESS / NEXT DAY / SAME DAY
  if (
    service.includes('YES') ||
    service.includes('BEST') ||
    service.includes('ND') ||
    service.includes('NEXTDAY') ||
    service.includes('SAMEDAY') ||
    service.includes('ONEPACK') ||
    service.includes('SUPER') ||
    service.includes('ONS') ||
    service.includes('CTCYES')
  ) {
    return 'express'
  }

  // 3. ECONOMY / HEMAT
  if (
    service.includes('OKE') ||
    service.includes('HALU') ||
    service.includes('ECO') ||
    service.includes('ECONOMY') ||
    service.includes('JAGOPACK') ||
    service.includes('SIUNTUNG')
  ) {
    return 'economy'
  }

  // 4. DEFAULT: REGULER (termasuk REG, EZ, CTC, Standard, REGPACK, dll.)
  return 'regular'
}
