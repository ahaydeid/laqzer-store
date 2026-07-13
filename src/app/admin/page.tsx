import { getServices } from '@/services'
import React from 'react'

export const metadata = {
  title: 'Dashboard Admin | Laqzer Store',
  description: 'Ringkasan data dan aktivitas toko online Anda',
}

interface DonutChartProps {
  percentage: number;
  color: string;
}

const DonutChart: React.FC<DonutChartProps> = ({ percentage, color }) => {
  const r = 100;
  const cx = 120;
  const cy = 120;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - percentage / 100);

  return (
    <div className="relative mx-auto mt-3 group w-[240px] h-[240px]">
      <svg
        width="240" height="240" viewBox="0 0 240 240"
        className="transition-all duration-300 group-hover:-translate-y-1 group-hover:[filter:drop-shadow(0_4px_12px_rgba(0,0,0,0.14))_drop-shadow(0_-2px_6px_rgba(0,0,0,0.06))_drop-shadow(4px_0_6px_rgba(0,0,0,0.06))_drop-shadow(-4px_0_6px_rgba(0,0,0,0.06))]"
      >
        {/* Background disc for hover shadow outline */}
        <circle cx={cx} cy={cy} r={r + 8} fill="white" className="dark:fill-zinc-900" />
        {/* Track */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="#f4f4f5"
          className="dark:stroke-zinc-800"
          strokeWidth="16"
        />
        {/* Progress */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth="16"
          className="donut-progress"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>

      {/* Center hole overlay */}
      <div 
        className="absolute inset-0 m-auto w-[184px] h-[184px] rounded-full bg-white dark:bg-zinc-900 flex flex-col items-center justify-center pointer-events-none transition-all duration-300 group-hover:-translate-y-1 donut-inner-shadow"
      >
        <span 
          className="text-[28px] font-bold text-zinc-900 dark:text-zinc-50"
        >
          {percentage}%
        </span>
      </div>
    </div>
  );
};

export default async function AdminDashboardPage() {
  const services = getServices()

  // Ambil data produk secara concurrent
  const products = await services.products.getProducts()

  // Perhitungan statistik personal store
  const totalProducts = products.length;
  const inStockProducts = products.filter(p => p.stock > 0).length;
  const outOfStockProducts = totalProducts - inStockProducts;
  
  const stockPercentage = totalProducts > 0 
    ? Math.round((inStockProducts / totalProducts) * 100) 
    : 0;

  // Simulasi Target Penjualan Bulanan Toko Pribadi
  const monthlySalesTarget = 20000000; // Rp 20 Juta
  const currentSales = 12450000; // Rp 12.45 Juta
  const salesPercentage = Math.min(100, Math.round((currentSales / monthlySalesTarget) * 100));

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
          <div className="bg-zinc-950 dark:bg-zinc-900 p-5 rounded border border-zinc-900 dark:border-zinc-800 text-white shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-300 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Pendapatan</span>
            </div>
            <div className="space-y-4 relative z-10">
              <div>
                <span className="text-2xl font-extrabold">Rp 12.450.000</span>
                <p className="text-[11px] text-zinc-400 mt-1">Periode: Juli 2026</p>
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
                  <span className="font-bold text-zinc-700 dark:text-zinc-300 text-right">78 Transaksi</span>
                  <span className="text-zinc-400">Pesanan Diproses:</span>
                  <span className="font-bold text-zinc-700 dark:text-zinc-300 text-right">5 Transaksi</span>
                  <span className="text-zinc-400">Pengunjung Unik:</span>
                  <span className="font-bold text-sky-600 dark:text-sky-400 text-right text-sm">1.248 Pengunjung</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Dua Donut Chart — 60% */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Card 2: Ketersediaan Stok */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider ml-1">Ketersediaan Stok</span>
            <div className="flex items-center justify-center py-2 dark:bg-zinc-900/10 rounded dark:border-zinc-900/30">
              <DonutChart percentage={stockPercentage} color="#10b981" />
            </div>
            
            {/* Bottom info card */}
            <div className="bg-white/80 dark:bg-zinc-900/40 dark:border-zinc-800 p-4 rounded flex flex-col mt-auto shadow-xs">
              <p className="text-2xl font-extrabold leading-none text-zinc-800 dark:text-zinc-200">{inStockProducts}</p>
              <p className="text-xs text-zinc-400 mt-1">/ {totalProducts} Produk Tersedia</p>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 border-t border-zinc-100 dark:border-zinc-800/60 pt-2 mt-2">
                {outOfStockProducts > 0 ? `Terdapat ${outOfStockProducts} produk kehabisan stok.` : 'Semua produk memiliki stok aktif.'}
              </p>
            </div>
          </div>

          {/* Card 3: Target Penjualan */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider ml-1">Target Penjualan</span>
            <div className="flex items-center justify-center py-2 dark:bg-zinc-900/10 rounded dark:border-zinc-900/30">
              <DonutChart percentage={salesPercentage} color="#3b82f6" />
            </div>

            {/* Bottom info card */}
            <div className="bg-white/80 dark:bg-zinc-900/40 dark:border-zinc-800 p-4 rounded flex flex-col mt-auto shadow-xs">
              <p className="text-2xl font-extrabold leading-none text-zinc-800 dark:text-zinc-200">{salesPercentage}%</p>
              <p className="text-xs text-zinc-400 mt-1">Terpenuhi dari Target Rp 20.000.000</p>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 border-t border-zinc-100 dark:border-zinc-800/60 pt-2 mt-2">
                Kekurangan target: Rp {(monthlySalesTarget - currentSales).toLocaleString('id-ID')}.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Recent Orders History */}
      <div className="space-y-2 pt-4">
        <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block ml-1">Pesanan Terbaru</span>
        <div className="bg-white/80 dark:bg-zinc-900/40 p-5 rounded border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
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
                  <td className="py-3 font-semibold text-sky-600 dark:text-sky-400">#ORD-2026-003</td>
                  <td className="py-3 text-zinc-800 dark:text-zinc-200 font-medium">Budi Santoso</td>
                  <td className="py-3 text-zinc-800 dark:text-zinc-200 font-medium">Rp 179.000</td>
                  <td className="py-3 text-zinc-500">Transfer Bank Mandiri</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30">
                      Selesai
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button className="text-sky-600 dark:text-sky-400 hover:underline font-semibold cursor-pointer">Detail</button>
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                  <td className="py-3 font-semibold text-sky-600 dark:text-sky-400">#ORD-2026-002</td>
                  <td className="py-3 text-zinc-800 dark:text-zinc-200 font-medium">Siti Rahma</td>
                  <td className="py-3 text-zinc-800 dark:text-zinc-200 font-medium">Rp 198.000</td>
                  <td className="py-3 text-zinc-500">GoPay</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30">
                      Diproses
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button className="text-sky-600 dark:text-sky-400 hover:underline font-semibold cursor-pointer">Detail</button>
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                  <td className="py-3 font-semibold text-sky-600 dark:text-sky-400">#ORD-2026-001</td>
                  <td className="py-3 text-zinc-800 dark:text-zinc-200 font-medium">Andi Wijaya</td>
                  <td className="py-3 text-zinc-800 dark:text-zinc-200 font-medium">Rp 650.000</td>
                  <td className="py-3 text-zinc-500">ShopeePay</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30">
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
