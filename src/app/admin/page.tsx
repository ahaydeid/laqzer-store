import { getServices } from '@/services'
import Link from 'next/link'
import { FiShoppingBag, FiLayers, FiDollarSign, FiUsers, FiArrowRight } from 'react-icons/fi'

export const metadata = {
  title: 'Dashboard Admin | Laqzer Store',
  description: 'Ringkasan data dan aktivitas toko online Anda',
}

export default async function AdminDashboardPage() {
  const services = getServices()

  // Ambil data produk dan kategori secara concurrent
  const [products, categories] = await Promise.all([
    services.products.getProducts(),
    services.categories.getCategories(),
  ])

  // Placeholder data transaksi dan pengunjung
  const totalSales = 'Rp 12.450.000'
  const totalVisitors = '1,248'

  const stats = [
    {
      label: 'Total Produk',
      value: products.length,
      icon: FiShoppingBag,
      color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30',
      description: 'Produk aktif di katalog',
    },
    {
      label: 'Total Kategori',
      value: categories.length,
      icon: FiLayers,
      color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30',
      description: 'Kategori produk terdaftar',
    },
    {
      label: 'Estimasi Penjualan',
      value: totalSales,
      icon: FiDollarSign,
      color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30',
      description: 'Penjualan bulan ini (Simulasi)',
    },
    {
      label: 'Pengunjung Hari Ini',
      value: totalVisitors,
      icon: FiUsers,
      color: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/30',
      description: 'Pengunjung unik (Simulasi)',
    },
  ]

  // Ambil 3 produk terakhir ditambahkan untuk aktivitas terbaru
  const recentProducts = [...products]
    .slice(-3)
    .reverse()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Selamat Datang di Dasbor</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Berikut adalah ringkasan performa dan katalog toko Anda saat ini.
        </p>
      </div>

      {/* Grid Statistik */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/40 dark:backdrop-blur-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.label}</span>
              <div className={`rounded-xl p-2.5 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-bold tracking-tight">{stat.value}</span>
              <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Konten Tambahan */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Aktivitas Produk Terbaru */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40 dark:backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold tracking-tight">Produk Terbaru</h2>
            <Link
              href="/admin/products"
              className="flex items-center gap-1 text-xs font-semibold text-zinc-900 hover:underline dark:text-zinc-100"
            >
              Lihat semua <FiArrowRight />
            </Link>
          </div>
          {recentProducts.length > 0 ? (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {recentProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.imageUrl || '/img/placeholder.jpg'}
                    alt={product.name}
                    className="h-12 w-12 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-800"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{product.name}</p>
                    <p className="text-xs text-zinc-400 truncate">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        maximumFractionDigits: 0,
                      }).format(product.price)}
                    </p>
                    <p className="text-xs text-zinc-400">Stok: {product.stock}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-400 py-4 text-center">Belum ada produk terdaftar.</p>
          )}
        </div>

        {/* Pintasan Aksi & Informasi Sistem */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40 dark:backdrop-blur-md flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight mb-4">Aksi Cepat</h2>
            <div className="grid gap-3">
              <Link
                href="/admin/products/new"
                className="flex items-center justify-between rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 transition-colors dark:border-zinc-800 dark:hover:bg-zinc-900/60"
              >
                <div>
                  <p className="text-sm font-semibold">Tambah Produk Baru</p>
                  <p className="text-xs text-zinc-400">Buat item katalog produk baru</p>
                </div>
                <FiArrowRight className="text-zinc-400" />
              </Link>

              <Link
                href="/admin/products"
                className="flex items-center justify-between rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 transition-colors dark:border-zinc-800 dark:hover:bg-zinc-900/60"
              >
                <div>
                  <p className="text-sm font-semibold">Kelola Produk</p>
                  <p className="text-xs text-zinc-400">Update harga, stok, atau info produk</p>
                </div>
                <FiArrowRight className="text-zinc-400" />
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 text-xs text-zinc-400">
            Sistem: <span className="font-semibold text-zinc-600 dark:text-zinc-300">Laqzer Store v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  )
}
