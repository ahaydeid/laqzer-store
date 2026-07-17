import React from 'react'
import { FiPlus, FiPercent, FiCalendar, FiTrash2 } from 'react-icons/fi'
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '@/components/ui/Table'
import { DiscountItem } from './types'

const MOCK_PRODUCTS = [
  { id: 'mock-1', name: 'Laptop Asus ROG Strix G15', imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=120' },
  { id: 'mock-2', name: 'Keyboard Mechanical Laqzer RGB', imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=120' },
  { id: 'mock-3', name: 'Mouse Wireless Gaming Superlight', imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=120' },
  { id: 'mock-4', name: 'Headset Stereo Pro Bass', imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=120' },
  { id: 'mock-5', name: 'Monitor Curved Gaming 27 Inch', imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=120' }
]

interface DiscountTabProps {
  discounts: DiscountItem[]
  onToggleStatus: (id: string) => void
  onDeleteDiscount: (id: string, name: string) => void
  onOpenModal: () => void
  formatRupiah: (num: number) => string
}

export default function DiscountTab({
  discounts,
  onToggleStatus,
  onDeleteDiscount,
  onOpenModal,
  formatRupiah
}: DiscountTabProps) {
  return (
    <div className="space-y-4 w-full max-w-full min-w-0">
      <div className="flex items-center justify-between">
        <span className="font-bold text-zinc-800 dark:text-zinc-205 text-base">Daftar Diskon Berjalan</span>
        <button
          onClick={onOpenModal}
          className="inline-flex items-center gap-2 rounded bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 cursor-pointer"
        >
          <FiPlus className="h-4 w-4" />
          Buat Diskon Baru
        </button>
      </div>

      {discounts.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded p-8 text-center text-zinc-400 dark:text-zinc-500 space-y-2">
          <FiPercent className="h-10 w-10 mx-auto opacity-40" />
          <p className="font-medium text-sm">Belum ada promo diskon produk aktif.</p>
        </div>
      ) : (
        <div className="w-full min-w-0 overflow-hidden">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell className="w-12 text-center whitespace-nowrap">No</TableHeaderCell>
                <TableHeaderCell className="whitespace-nowrap">Nama Event / Campaign</TableHeaderCell>
                <TableHeaderCell className="whitespace-nowrap">Produk</TableHeaderCell>
                <TableHeaderCell className="whitespace-nowrap">Diskon</TableHeaderCell>
                <TableHeaderCell className="whitespace-nowrap">Harga Akhir</TableHeaderCell>
                <TableHeaderCell className="whitespace-nowrap">Durasi</TableHeaderCell>
                <TableHeaderCell className="text-center w-28 whitespace-nowrap">Status</TableHeaderCell>
                <TableHeaderCell className="text-center w-20 whitespace-nowrap sticky right-0 bg-white dark:bg-zinc-900 z-10 border-l border-zinc-200/50 dark:border-zinc-800/80">Aksi</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {discounts.map((item, index) => {
                const mockProduct = MOCK_PRODUCTS.find(p => p.id === item.productId || p.name === item.productName);
                const finalPrice = item.priceAfterDiscount ?? (item.originalPrice * (1 - item.discountPercent / 100));
                return (
                  <TableRow key={item.id} className="group">
                    <TableCell className="text-center font-medium whitespace-nowrap">{index + 1}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span className="font-semibold text-zinc-855 dark:text-zinc-200 block">{item.campaignName || "Promo Gajian"}</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={mockProduct?.imageUrl || "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=120"}
                          alt={item.productName}
                          className="w-10 h-10 rounded object-cover bg-zinc-100 dark:bg-zinc-850"
                        />
                        <div className="min-w-0">
                          <span className="font-semibold text-zinc-850 dark:text-zinc-205 block max-w-xs truncate" title={item.productName}>
                            {item.productName}
                          </span>
                          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                            Base: {formatRupiah(item.originalPrice)}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded w-max">
                          -{item.discountPercent}%
                        </span>
                        <span className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                          Hemat {formatRupiah(item.originalPrice - finalPrice)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {formatRupiah(finalPrice)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        <FiCalendar className="h-3.5 w-3.5 text-zinc-400" />
                        <span>{item.startDate} s/d {item.endDate}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onToggleStatus(item.id)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-hidden ${
                          item.isActive ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            item.isActive ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap sticky right-0 bg-white dark:bg-zinc-900 group-even:bg-zinc-50 dark:group-even:bg-zinc-900/30 group-hover:bg-zinc-50/50 dark:group-hover:bg-zinc-800/10 border-l border-zinc-200/50 dark:border-zinc-800/80 shadow-[-8px_0_8px_-4px_rgba(0,0,0,0.05)] transition-colors duration-200 z-10">
                      <button
                        onClick={() => onDeleteDiscount(item.id, item.productName)}
                        className="p-2 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                        title="Hapus diskon"
                      >
                        <FiTrash2 className="h-4.5 w-4.5" />
                      </button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
