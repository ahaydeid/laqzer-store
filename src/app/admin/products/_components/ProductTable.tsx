'use client'

import { FiEdit3, FiTrash2 } from 'react-icons/fi'
import { Product } from '@/core/types/product'
import { Button } from '@/components/ui/Button'

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
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="border-b border-zinc-100 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:border-zinc-800/60 dark:text-zinc-500">
            <tr>
              <th scope="col" className="px-6 py-4">Produk</th>
              <th scope="col" className="px-6 py-4">Kategori</th>
              <th scope="col" className="px-6 py-4">Harga</th>
              <th scope="col" className="px-6 py-4">Stok</th>
              <th scope="col" className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900/40">
            {products.map((product) => (
              <tr 
                key={product.id} 
                className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors"
              >
                {/* Info Produk (Gambar + Nama) */}
                <td className="px-6 py-4">
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
                <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 text-xs">
                  {product.category}
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
                <td className="px-6 py-4 text-xs">
                  {product.stock > 0 ? (
                    <span className="text-zinc-600 dark:text-zinc-400">{product.stock} pcs</span>
                  ) : (
                    <span className="text-rose-500 font-semibold">Habis</span>
                  )}
                </td>

                {/* Aksi */}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      href={`/admin/products/${product.id}/edit`}
                      variant="outline"
                      size="xs"
                      title="Edit Produk"
                    >
                      <FiEdit3 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      onClick={() => handleDeleteClick(product.id, product.name)}
                      variant="outline"
                      size="xs"
                      className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 dark:border-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-950/20"
                      title="Hapus Produk"
                      disabled={!onDelete}
                    >
                      <FiTrash2 className="h-3.5 w-3.5" />
                      <span>Hapus</span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {products.length === 0 && (
        <div className="p-8 text-center text-zinc-400 text-sm">
          Belum ada data produk di katalog.
        </div>
      )}
    </div>
  )
}
