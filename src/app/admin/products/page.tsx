import { getServices } from '@/services'
import Link from 'next/link'
import { FiPlus } from 'react-icons/fi'
import { ProductTable } from './_components/ProductTable'
import { AdminSearchFilter } from './_components/AdminSearchFilter'

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
        </div>
        <div>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <FiPlus className="h-4 w-4" />
            Tambah Produk
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar UI Placeholder */}
      <AdminSearchFilter />

      {/* Tabel Konten Reusable */}
      <ProductTable products={products} />
    </div>
  )
}
