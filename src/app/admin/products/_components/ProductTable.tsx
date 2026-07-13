'use client'

import { FiEdit3, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { Product } from '@/core/types/product'
import Swal from 'sweetalert2'
import { playSwalSound } from '@/utils/sound'
import { ActionButton } from '@/components/ui/ActionButton'
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '@/components/ui/Table'

interface ProductTableProps {
  products: Product[]
  onDelete?: (id: string) => void
}

export function ProductTable({ products, onDelete }: ProductTableProps) {
  const handleDeleteClick = (id: string, name: string) => {
    playSwalSound("confirm");
    Swal.fire({
      title: 'Hapus Produk?',
      text: `Apakah Anda yakin ingin menghapus produk "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#71717a',
    }).then((result) => {
      if (result.isConfirmed) {
        if (onDelete) {
          onDelete(id)
        } else {
          playSwalSound("success");
          Swal.fire({
            title: 'Berhasil!',
            text: `Produk "${name}" berhasil dihapus! (Simulasi)`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
          })
        }
      }
    })
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell scope="col" className="text-center w-12">No</TableHeaderCell>
            <TableHeaderCell scope="col">Produk</TableHeaderCell>
            <TableHeaderCell scope="col">Kategori</TableHeaderCell>
            <TableHeaderCell scope="col">Harga</TableHeaderCell>
            <TableHeaderCell scope="col">Stok</TableHeaderCell>
            <TableHeaderCell scope="col" className="text-center">Aksi</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {products.map((product, index) => (
            <TableRow 
              key={product.id} 
            >
              {/* No */}
              <TableCell className="text-zinc-500 dark:text-zinc-400 text-xs w-12 font-medium text-center">
                {index + 1}
              </TableCell>

              {/* Info Produk (Gambar + Nama) */}
              <TableCell>
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
              </TableCell>
              
              {/* Kategori */}
              <TableCell className="text-zinc-500 dark:text-zinc-400 text-xs">
                {product.category}
              </TableCell>

              {/* Harga */}
              <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  maximumFractionDigits: 0,
                }).format(product.price)}
              </TableCell>

              {/* Stok */}
              <TableCell className="text-xs">
                {product.stock > 0 ? (
                  <span className="text-zinc-600 dark:text-zinc-400">{product.stock} pcs</span>
                ) : (
                  <span className="text-rose-500 font-semibold">Habis</span>
                )}
              </TableCell>

              {/* Aksi */}
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <ActionButton
                    variant="edit"
                    href={`/admin/products/${product.id}/edit`}
                    title="Edit Produk"
                  >
                    <FiEdit3 className="h-4 w-4 text-white" />
                  </ActionButton>
                  <ActionButton
                    variant="delete"
                    onClick={() => handleDeleteClick(product.id, product.name)}
                    title="Hapus Produk"
                  >
                    <FiTrash2 className="h-4 w-4 text-white" />
                  </ActionButton>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {products.length === 0 && (
        <div className="p-8 text-center text-zinc-400 text-sm bg-white dark:bg-zinc-900/40 rounded border border-zinc-200/80 dark:border-zinc-800">
          Belum ada data produk di katalog.
        </div>
      )}

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
