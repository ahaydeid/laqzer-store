import React from 'react'

export const metadata = {
  title: 'Dashboard Admin | Laqzer Store',
  description: 'Ringkasan data dan aktivitas toko online Anda',
}

export default async function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Selamat Datang, Admin</h1>
      </div>

      {/* Dashboard Grid — kolom 40:60 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Kolom Kiri: Total Pendapatan & Ringkasan Transaksi — 40% */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Card 1: Total Pendapatan */}
          <div className="bg-sky-700 dark:bg-zinc-900 p-5 rounded-lg text-white shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-300 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Total Pendapatan</span>
            </div>
            <div className="space-y-4 relative z-10">
              <div>
                <span className="text-2xl font-extrabold">Rp 12.450.000</span>
                <p className="text-[11px] text-white/60 mt-1">Periode: Juli 2026</p>
              </div>
            </div>
          </div>

          {/* Card: Statistik Transaksi */}
          <div className="space-y-2 flex-1 flex flex-col">
            <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block ml-1">Ringkasan Aktivitas</span>
            <div className="bg-white/80 dark:bg-zinc-900/40 dark:border-zinc-800 p-5 rounded flex flex-col flex-1 justify-center">
              <div className="w-full">
                <div className="grid grid-cols-2 text-xs gap-y-3">
                  <span className="text-zinc-400">Pesanan Selesai:</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-right">78 Transaksi</span>
                  <span className="text-zinc-400">Pesanan Diproses:</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-right">5 Transaksi</span>
                  <span className="text-zinc-400">Pengunjung Unik:</span>
                  <span className="font-semibold text-sky-600 dark:text-sky-400 text-right">1.248 Pengunjung</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Tempat Dibiarkan Kosong — 60% */}
        <div className="lg:col-span-3 flex flex-col gap-2 min-h-[380px]">
          <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider ml-1">Ketersediaan Stok & Target Penjualan</span>
          <div className="flex-1 flex items-center justify-center dark:bg-zinc-900/10 rounded dark:border-zinc-900/30 border border-zinc-100 dark:border-zinc-800/40 bg-white/40">
            {/* Tempat chart donat dan info card dibiarkan kosong */}
          </div>
        </div>
      </div>

      {/* Recent Orders History */}
      <div className="space-y-2 pt-4">
        <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block ml-1">Pesanan Terbaru</span>
        <div className="bg-white/80 dark:bg-zinc-900/40 p-5 rounded border border-zinc-100 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  <th className="py-2.5 font-semibold">Order ID</th>
                  <th className="py-2.5 font-semibold">Pelanggan</th>
                  <th className="py-2.5 font-semibold">Total Pembayaran</th>
                  <th className="py-2.5 font-semibold">Metode</th>
                  <th className="py-2.5 font-semibold">Status</th>
                  <th className="py-2.5 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                  <td className="py-3 font-semibold text-sky-600 dark:text-sky-400">20260003</td>
                  <td className="py-3 text-zinc-800 dark:text-zinc-200 font-medium">Farhan Maulana</td>
                  <td className="py-3 text-zinc-800 dark:text-zinc-200 font-medium">Rp 179.000</td>
                  <td className="py-3 text-zinc-500">Transfer Bank Mandiri</td>
                  <td className="py-3">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                      Selesai
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button className="text-sky-600 dark:text-sky-400 hover:underline font-semibold cursor-pointer">Detail</button>
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                  <td className="py-3 font-semibold text-sky-600 dark:text-sky-400">20260002</td>
                  <td className="py-3 text-zinc-800 dark:text-zinc-200 font-medium">Siti Rahma</td>
                  <td className="py-3 text-zinc-800 dark:text-zinc-200 font-medium">Rp 198.000</td>
                  <td className="py-3 text-zinc-500">GoPay</td>
                  <td className="py-3">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400">
                      Sedang Diproses
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button className="text-sky-600 dark:text-sky-400 hover:underline font-semibold cursor-pointer">Detail</button>
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                  <td className="py-3 font-semibold text-sky-600 dark:text-sky-400">20260001</td>
                  <td className="py-3 text-zinc-800 dark:text-zinc-200 font-medium">Andi Wijaya</td>
                  <td className="py-3 text-zinc-800 dark:text-zinc-200 font-medium">Rp 650.000</td>
                  <td className="py-3 text-zinc-500">ShopeePay</td>
                  <td className="py-3">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                      Selesai
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button className="text-sky-600 dark:text-sky-400 hover:underline font-semibold cursor-pointer">Detail</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
