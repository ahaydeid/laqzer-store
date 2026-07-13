import { getServices } from '@/services'
import Link from 'next/link'
import { FiPlus, FiEdit3, FiTrash2, FiSearch } from 'react-icons/fi'

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

      {/* Tabel Konten */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-zinc-500 dark:text-zinc-400">
            <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-300">
              <tr>
                <th scope="col" className="px-6 py-4">Produk</th>
                <th scope="col" className="px-6 py-4">Kategori</th>
                <th scope="col" className="px-6 py-4">Harga</th>
                <th scope="col" className="px-6 py-4">Stok</th>
                <th scope="col" className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-zinc-50/55 dark:hover:bg-zinc-900/20 transition-colors">
                  {/* Info Produk (Gambar + Nama) */}
                  <td className="flex items-center gap-4 px-6 py-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.imageUrl || '/img/placeholder.jpg'}
                      alt={product.name}
                      className="h-10 w-10 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-800"
                    />
                    <div>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">{product.name}</div>
                      <div className="text-xs text-zinc-400 dark:text-zinc-500 truncate max-w-xs">{product.description}</div>
                    </div>
                  </td>
                  
                  {/* Kategori */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                      {product.category}
                    </span>
                  </td>

                  {/* Harga */}
                  <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      maximumFractionDigits: 0,
                    }).format(product.price)}
                  </td>

                  {/* Stok */}
                  <td className="px-6 py-4">
                    <span className={product.stock > 0 ? 'text-zinc-900 dark:text-zinc-100' : 'text-rose-600 font-semibold'}>
                      {product.stock > 0 ? `${product.stock} pcs` : 'Habis'}
                    </span>
                  </td>

                  {/* Aksi */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors"
                        title="Edit Produk"
                      >
                        <FiEdit3 className="h-4 w-4" />
                      </Link>
                      <button
                        className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Hapus Produk"
                        disabled
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <div className="p-8 text-center text-zinc-400">
            Belum ada data produk di katalog.
          </div>
        )}
      </div>
    </div>
  )
}
