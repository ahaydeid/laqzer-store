import { getServices } from '@/services'
import Link from 'next/link'
import { FiPlus, FiSearch } from 'react-icons/fi'
import { ProductTable } from './_components/ProductTable'

export const metadata = {
  title: 'Kelola Produk | Laqzer Admin',
  description: 'Daftar produk dan opsi manajemen katalog',
}

export default async function AdminProductsPage() {
  const services = getServices()
  const products = await services.products.getProducts()

  return (
    <div className="space-y-6">
      {/* Header & Aksi */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kelola Produk</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Lihat, tambah, edit, atau hapus produk dari katalog toko online Anda.
          </p>
        </div>
        <div>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <FiPlus className="h-4 w-4" />
            Tambah Produk
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar UI Placeholder */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama produk..."
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-1.5 pl-9 pr-4 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/60"
            disabled
          />
        </div>
        <div className="flex items-center gap-2">
          <select 
            className="rounded-lg border border-zinc-200 bg-zinc-50 py-1.5 px-3 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900/60"
            disabled
          >
            <option>Semua Kategori</option>
          </select>
        </div>
      </div>

      {/* Tabel Konten Reusable */}
      <ProductTable products={products} />
    </div>
  )
}
