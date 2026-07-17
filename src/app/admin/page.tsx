import React from 'react'
import Link from 'next/link'
import { FiArrowRight, FiClock } from 'react-icons/fi'
import { Badge } from '@/components/ui/Badge'

export const metadata = {
  title: 'Dashboard Admin | Laqzer Store',
  description: 'Ringkasan data dan aktivitas toko online Anda',
}

interface TrendItem {
  label: string
  value: number
}

const salesTrendData: TrendItem[] = [
  { label: 'Okt', value: 42 },
  { label: 'Nov', value: 54 },
  { label: 'Des', value: 65 },
  { label: 'Jan', value: 72 },
  { label: 'Feb', value: 83 },
  { label: 'Mar', value: 88 },
]

function LineTrendChart({ data, height = 220 }: { data: TrendItem[]; height?: number }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  const width = 640
  const paddingY = 12

  const coordinates = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((d.value / max) * (height - paddingY * 2) + paddingY)
    return { x, y }
  })
  const points = coordinates.map(({ x, y }) => `${x},${y}`).join(' ')
  const areaPoints = [
    `0,${height}`,
    ...coordinates.map(({ x, y }) => `${x},${y}`),
    `${width},${height}`,
  ].join(' ')

  return (
    <div className="h-full w-full flex flex-col justify-between">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id="student-trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 25, 50, 75, 100].map((v) => (
          <line
            key={v}
            x1="0"
            y1={height - ((v / 100) * (height - paddingY * 2) + paddingY)}
            x2={width}
            y2={height - ((v / 100) * (height - paddingY * 2) + paddingY)}
            stroke="#e2e8f0"
            strokeDasharray="4 4"
            className="dark:stroke-zinc-800/80"
          />
        ))}

        <polygon points={areaPoints} fill="url(#student-trend-fill)" />

        <polyline
          fill="none"
          stroke="#0284c7"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />

        {coordinates.map(({ x, y }, i) => (
          <circle key={i} cx={x} cy={y} r="1.75" fill="#0284c7" />
        ))}
      </svg>
      <div className="mt-2 flex justify-between">
        {data.map((item) => (
          <span key={item.label} className="text-xs font-medium text-zinc-400">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Selamat Datang, Admin</h1>
      </div>

      {/* Dashboard Grid — 40:60 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Kolom Kiri: Total Pendapatan & Ringkasan Transaksi — 40% */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Card 1: Total Pendapatan */}
          <div className="bg-sky-700 dark:bg-zinc-900 p-5 rounded-lg text-white shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-300 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Total Pendapatan</span>
            </div>
            <div className="space-y-1 relative z-10">
              <span className="text-2xl font-extrabold">Rp 12.450.000</span>
              <p className="text-[11px] text-white/60">Periode: Juli 2026</p>
            </div>
          </div>

          {/* Card: Statistik Transaksi */}
          <div className="space-y-2 flex-1 flex flex-col">
            <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block ml-1">Ringkasan Aktivitas</span>
            <div className="bg-white/80 dark:bg-zinc-900/40 p-5 rounded flex-1 flex flex-col">
              <div className="w-full">
                <div className="grid grid-cols-2 text-xs gap-y-3">
                  <span className="text-zinc-400">Pesanan Selesai:</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-right">78 Transaksi</span>
                  <span className="text-zinc-400">Pesanan Diproses:</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-right">5 Transaksi</span>
                  <span className="text-zinc-400">Pengunjung Unik:</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-right">1.248 Pengunjung</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: 4 Widgets Ringkas — 60% */}
        <div className="lg:col-span-3 flex flex-col gap-2">
          <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider ml-1">Ketersediaan Stok & Target Penjualan</span>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">

            {/* 1. Event Berlangsung */}
            <div className="bg-white/80 dark:bg-zinc-900/40 p-4 rounded flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Event Berlangsung
                </span>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  Aktif
                </span>
              </div>
              
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">Promo Gajian Akhir Bulan</p>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 line-clamp-1">Diskon s/d 50% & Voucher HEMAT50K</p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                <span className="flex items-center gap-1">
                  <FiClock className="h-3 w-3" /> s/d 31 Jul 2026
                </span>
                <Link href="/admin/campaign" className="text-sky-600 dark:text-sky-400 font-medium hover:underline flex items-center gap-0.5">
                  Detail <FiArrowRight className="h-2.5 w-2.5" />
                </Link>
              </div>
            </div>

            {/* 2. Pesan & Chat Terbaru */}
            <div className="bg-white/80 dark:bg-zinc-900/40 p-4 rounded flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Pesan Terbaru
                </span>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  2 Baru
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="text-[11px] bg-zinc-50 dark:bg-zinc-950/40 p-2 rounded border border-zinc-100 dark:border-zinc-800/40 space-y-0.5">
                  <div className="flex justify-between font-medium text-zinc-800 dark:text-zinc-200">
                    <span className="truncate max-w-[110px]">Farhan M.</span>
                    <span className="text-[9px] text-zinc-400 font-normal">10 mnt</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">&quot;Halo min, paket sy sudah dikirim?&quot;</p>
                </div>
                <div className="text-[11px] bg-zinc-50 dark:bg-zinc-950/40 p-2 rounded border border-zinc-100 dark:border-zinc-800/40 space-y-0.5">
                  <div className="flex justify-between font-medium text-zinc-800 dark:text-zinc-200">
                    <span className="truncate max-w-[110px]">Siti Rahma</span>
                    <span className="text-[9px] text-zinc-400 font-normal">1 jam</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">&quot;Voucher promo bisa dipakai hari ini?&quot;</p>
                </div>
              </div>
            </div>

            {/* 3. Stok Menipis & Habis */}
            <div className="bg-white/80 dark:bg-zinc-900/40 p-4 rounded flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Stok Menipis / Habis
                </span>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  2 Produk
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] bg-zinc-50 dark:bg-zinc-950/40 p-2 rounded border border-zinc-100 dark:border-zinc-800/40">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[120px]">Oxford Shirt</span>
                  <Badge variant="warning" className="text-[10px] px-1.5 py-0.5 font-medium">Sisa 2</Badge>
                </div>
                <div className="flex items-center justify-between text-[11px] bg-zinc-50 dark:bg-zinc-950/40 p-2 rounded border border-zinc-100 dark:border-zinc-800/40">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[120px]">Wool Knit Sweater</span>
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5 font-medium">Habis</Badge>
                </div>
              </div>

              <div className="text-right pt-1">
                <Link href="/admin/products" className="text-[10px] text-sky-600 dark:text-sky-400 font-medium hover:underline inline-flex items-center gap-0.5">
                  Kelola Stok <FiArrowRight className="h-2.5 w-2.5" />
                </Link>
              </div>
            </div>

            {/* 4. Pesanan Terbaru */}
            <div className="bg-white/80 dark:bg-zinc-900/40 p-4 rounded flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Pesanan Terbaru
                </span>
                <Link href="/admin/order" className="text-[10px] text-sky-600 dark:text-sky-400 font-medium hover:underline inline-flex items-center gap-0.5">
                  Lihat Semua <FiArrowRight className="h-2.5 w-2.5" />
                </Link>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] bg-zinc-50 dark:bg-zinc-950/40 p-2 rounded border border-zinc-100 dark:border-zinc-800/40">
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-800 dark:text-zinc-200 truncate">#20260003 - Farhan M.</p>
                    <p className="text-[9px] text-zinc-400">Rp 179.000</p>
                  </div>
                  <Badge variant="success" className="text-[9px] px-1.5 py-0.5 font-medium">Selesai</Badge>
                </div>
                <div className="flex items-center justify-between text-[11px] bg-zinc-50 dark:bg-zinc-950/40 p-2 rounded border border-zinc-100 dark:border-zinc-800/40">
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">#20260002 - Siti R.</p>
                    <p className="text-[9px] text-zinc-400">Rp 198.000</p>
                  </div>
                  <Badge variant="info" className="text-[9px] px-1.5 py-0.5 font-medium">Diproses</Badge>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* STATISTIK Pertumbuhan Transaksi Chart (Presisi 1:1 Edge-to-Edge) */}
      <div className="pt-2">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded">
          <h3 className="mb-6 text-sm font-bold text-slate-700 dark:text-zinc-200">
            Pertumbuhan Transaksi
          </h3>
          <div className="h-64">
            <LineTrendChart data={salesTrendData} />
          </div>
        </div>
      </div>
    </div>
  )
}
