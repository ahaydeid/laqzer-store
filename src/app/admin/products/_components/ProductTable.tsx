'use client'

import { FiEdit3, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { Product } from '@/core/types/product'
import { Button } from '@/components/ui/Button'

interface ProductTableProps {
  products: Product[]
  onDelete?: (id: string) => void
}

export function ProductTable({ products, onDelete }: ProductTableProps) {
  const handleDeleteClick = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk "${name}"?`)) {
      if (onDelete) {
        onDelete(id)
      } else {
        alert(`Produk "${name}" berhasil dihapus! (Simulasi)`)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-zinc-100 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:border-zinc-800/60 dark:text-zinc-500">
              <tr>
                <th scope="col" className="px-6 py-4 text-center">No</th>
                <th scope="col" className="px-6 py-4">Produk</th>
                <th scope="col" className="px-6 py-4">Kategori</th>
                <th scope="col" className="px-6 py-4">Harga</th>
                <th scope="col" className="px-6 py-4">Stok</th>
                <th scope="col" className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr 
                  key={product.id} 
                  className="even:bg-zinc-50 dark:even:bg-zinc-900/30 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/50 transition-colors"
                >
                  {/* No */}
                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 text-xs w-12 font-medium text-center">
                    {index + 1}
                  </td>

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
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        href={`/admin/products/${product.id}/edit`}
                        variant="ghost"
                        size="xs"
                        className="w-9 h-9 p-0 rounded-lg flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white border-none"
                        title="Edit Produk"
                      >
                        <FiEdit3 className="h-4 w-4 text-white" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteClick(product.id, product.name)}
                        variant="ghost"
                        size="xs"
                        className="w-9 h-9 p-0 rounded-lg flex items-center justify-center bg-rose-500 hover:bg-rose-600 text-white border-none"
                        title="Hapus Produk"
                      >
                        <FiTrash2 className="h-4 w-4 text-white" />
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

      {/* Pagination Controls (Outside Table Card) */}
      <div className="flex items-center justify-end gap-2 pr-1">
        <button
          className="flex h-8 w-8 items-center justify-center rounded border border-zinc-200/80 bg-white text-zinc-600 hover:bg-zinc-50 active:scale-95 transition-all dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:bg-zinc-800/80 cursor-pointer"
          title="Sebelumnya"
        >
          <FiChevronLeft className="h-4 w-4" />
        </button>
        <button
          className="flex h-8 w-8 items-center justify-center rounded border border-zinc-200/80 bg-white text-zinc-600 hover:bg-zinc-50 active:scale-95 transition-all dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:bg-zinc-800/80 cursor-pointer"
          title="Selanjutnya"
        >
          <FiChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
