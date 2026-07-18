import { NextRequest } from 'next/server'

interface RateLimitRecord {
  count: number
  resetTime: number
}

// In-memory store untuk melacak hit IP
const ipMap = new Map<string, RateLimitRecord>()

/**
 * Memeriksa apakah IP request melebihi batas rate limit.
 * @param request NextRequest
 * @param limit Jumlah maksimal request dalam 1 window (default: 15)
 * @param windowMs Durasi window dalam milidetik (default: 60000ms / 1 menit)
 */
export function checkRateLimit(
  request: NextRequest,
  limit = 15,
  windowMs = 60 * 1000
): { allowed: boolean; remaining: number; resetTime: number } {
  // Ambil IP address pengguna dari header proxy/forwarded
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const clientIp = (forwardedFor ? forwardedFor.split(',')[0] : realIp) || '127.0.0.1'

  const now = Date.now()
  const record = ipMap.get(clientIp)

  // Bersihkan record usang untuk menghemat memori
  if (record && now > record.resetTime) {
    ipMap.delete(clientIp)
  }

  const currentRecord = ipMap.get(clientIp)

  if (!currentRecord) {
    // Window baru untuk IP ini
    const resetTime = now + windowMs
    ipMap.set(clientIp, { count: 1, resetTime })
    return { allowed: true, remaining: limit - 1, resetTime }
  }

  if (currentRecord.count >= limit) {
    // Melebihi batas rate limit
    return { allowed: false, remaining: 0, resetTime: currentRecord.resetTime }
  }

  // Tambah hit count
  currentRecord.count += 1
  return { allowed: true, remaining: limit - currentRecord.count, resetTime: currentRecord.resetTime }
}
