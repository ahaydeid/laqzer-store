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
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="border-b border-zinc-100 text-xs font-medium uppercase tracking-wider text-zinc-400 dark:border-zinc-800/60 dark:text-zinc-500">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">Produk</th>
            <th scope="col" className="px-4 py-3 font-semibold">Kategori</th>
            <th scope="col" className="px-4 py-3 font-semibold">Harga</th>
            <th scope="col" className="px-4 py-3 font-semibold">Stok</th>
            <th scope="col" className="px-4 py-3 font-semibold text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900/40">
          {products.map((product) => (
            <tr 
              key={product.id} 
              className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors"
            >
              {/* Info Produk (Gambar + Nama) */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.imageUrl || '/img/placeholder.jpg'}
                    alt={product.name}
                    className="h-9 w-9 rounded-lg object-cover bg-zinc-50 dark:bg-zinc-900"
                  />
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {product.name}
                  </span>
                </div>
              </td>
              
              {/* Kategori */}
              <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 text-xs">
                {product.category}
              </td>

              {/* Harga */}
              <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  maximumFractionDigits: 0,
                }).format(product.price)}
              </td>

              {/* Stok */}
              <td className="px-4 py-3 text-xs">
                {product.stock > 0 ? (
                  <span className="text-zinc-600 dark:text-zinc-400">{product.stock} pcs</span>
                ) : (
                  <span className="text-rose-500 font-semibold">Habis</span>
                )}
              </td>

              {/* Aksi */}
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-all duration-150"
                    title="Edit Produk"
                  >
                    <FiEdit3 className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(product.id, product.name)}
                    className={`rounded-lg p-1.5 transition-all duration-150 ${
                      onDelete
                        ? 'text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30'
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
      {products.length === 0 && (
        <div className="p-8 text-center text-zinc-400 text-sm">
          Belum ada data produk di katalog.
        </div>
      )}
    </div>
  )
}
