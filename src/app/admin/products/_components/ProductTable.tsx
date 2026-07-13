'use client'

import Link from 'next/link'
import { FiEdit3, FiTrash2 } from 'react-icons/fi'
import { Product } from '@/core/types/product'

interface ProductTableProps {
  products: Product[]
  onDelete?: (id: string) => void
}

export function ProductTable({ products, onDelete }: ProductTableProps) {
  const handleDeleteClick = (id: string, name: string) => {
    if (onDelete && confirm(`Apakah Anda yakin ingin menghapus produk "${name}"?`)) {
      onDelete(id)
    }
  }

  return (
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
                      onClick={() => handleDeleteClick(product.id, product.name)}
                      className={`rounded-lg p-2 transition-colors ${
                        onDelete
                          ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                          : 'text-zinc-300 dark:text-zinc-700 cursor-not-allowed'
                      }`}
                      title="Hapus Produk"
                      disabled={!onDelete}
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
  )
}
