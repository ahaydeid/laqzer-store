import React, { useState } from 'react'
import { FiPlus } from 'react-icons/fi'
import Swal from 'sweetalert2'
import { VoucherItem } from './types'

interface VoucherTabProps {
  vouchers: VoucherItem[]
  onAddVoucher: (newVoucher: VoucherItem) => void
  onToggleVoucher: (code: string) => void
  formatRupiah: (num: number) => string
}

export default function VoucherTab({
  vouchers,
  onAddVoucher,
  onToggleVoucher,
  formatRupiah
}: VoucherTabProps) {
  const [voucherCode, setVoucherCode] = useState('')
  const [voucherType, setVoucherType] = useState<'percent' | 'nominal'>('percent')
  const [voucherValue, setVoucherValue] = useState(10)
  const [voucherMinPurchase, setVoucherMinPurchase] = useState(0)
  const [voucherQuota, setVoucherQuota] = useState(10)
  const [voucherExpiry, setVoucherExpiry] = useState('2026-08-01')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!voucherCode.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Silakan isi kode voucher.',
        confirmButtonColor: '#0369a1'
      })
      return
    }

    const cleanCode = voucherCode.toUpperCase().replace(/\s+/g, '')

    // Check if code exists
    if (vouchers.some(v => v.code === cleanCode)) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Kode voucher sudah terdaftar.',
        confirmButtonColor: '#0369a1'
      })
      return
    }

    onAddVoucher({
      code: cleanCode,
      type: voucherType,
      value: voucherValue,
      minPurchase: voucherMinPurchase,
      quota: voucherQuota,
      expiryDate: voucherExpiry,
      status: 'active'
    })

    // Reset Form
    setVoucherCode('')
    setVoucherValue(voucherType === 'percent' ? 10 : 50000)
    setVoucherMinPurchase(0)
    setVoucherQuota(10)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Form Buat Voucher */}
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded space-y-4">
          <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-bold border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <FiPlus className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            <span>Buat Voucher Baru</span>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                Kode Voucher
              </label>
              <input
                type="text"
                placeholder="Contoh: LAQZERHEBOH"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                className="w-full rounded border border-zinc-200 dark:border-zinc-800 bg-transparent px-3.5 py-2.5 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-mono placeholder:font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Tipe Potongan
                </label>
                <select
                  value={voucherType}
                  onChange={(e) => {
                    setVoucherType(e.target.value as 'percent' | 'nominal')
                    setVoucherValue(e.target.value === 'percent' ? 10 : 50000)
                  }}
                  className="w-full rounded border border-zinc-200 dark:border-zinc-800 bg-transparent px-3.5 py-2.5 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                >
                  <option value="percent" className="dark:bg-zinc-900">Persentase (%)</option>
                  <option value="nominal" className="dark:bg-zinc-900">Nominal Rupiah</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Nilai Potongan
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={voucherValue}
                    onChange={(e) => setVoucherValue(Number(e.target.value))}
                    className="w-full rounded border border-zinc-200 dark:border-zinc-800 bg-transparent pl-3.5 pr-8 py-2.5 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-medium"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">
                    {voucherType === 'percent' ? '%' : 'Rp'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Min. Belanja (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  value={voucherMinPurchase}
                  onChange={(e) => setVoucherMinPurchase(Number(e.target.value))}
                  className="w-full rounded border border-zinc-200 dark:border-zinc-800 bg-transparent px-3.5 py-2.5 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>
              <div>
                <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Kuota Voucher
                </label>
                <input
                  type="number"
                  min="1"
                  value={voucherQuota}
                  onChange={(e) => setVoucherQuota(Number(e.target.value))}
                  className="w-full rounded border border-zinc-200 dark:border-zinc-800 bg-transparent px-3.5 py-2.5 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                Tanggal Kadaluarsa
              </label>
              <input
                type="date"
                value={voucherExpiry}
                onChange={(e) => setVoucherExpiry(e.target.value)}
                className="w-full rounded border border-zinc-200 dark:border-zinc-800 bg-transparent px-3.5 py-2 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-sky-700 hover:bg-sky-800 text-white font-semibold py-2.5 rounded transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2 shadow-xs"
            >
              <FiPlus className="h-4 w-4" />
              <span>Aktifkan Voucher</span>
            </button>
          </form>
        </div>
      </div>

      {/* List Voucher */}
      <div className="lg:col-span-3">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <span className="font-bold text-zinc-800 dark:text-zinc-200">Daftar Voucher Toko</span>
            <span className="text-xs bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-2.5 py-1 rounded-full font-bold">
              {vouchers.length} Voucher
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-1">
            {vouchers.map((item) => (
              <div 
                key={item.code} 
                className={`p-4 rounded flex flex-col justify-between gap-4 transition-all relative overflow-hidden ${
                  item.status === 'active' 
                    ? 'bg-zinc-50/50 dark:bg-zinc-950/30 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/20' 
                    : 'bg-zinc-100/50 dark:bg-zinc-900/10 opacity-60'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-lg border border-indigo-100/50 dark:border-indigo-900/30">
                      {item.code}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      item.status === 'active' 
                        ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' 
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                    }`}>
                      {item.status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>

                  <div className="pt-2">
                    <p className="text-lg font-extrabold text-zinc-900 dark:text-white">
                      {item.type === 'percent' ? `Diskon ${item.value}%` : `Diskon ${formatRupiah(item.value)}`}
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                      Min. Belanja: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{formatRupiah(item.minPurchase)}</span>
                    </p>
                  </div>
                </div>

                <div className="border-t border-zinc-200/50 dark:border-zinc-800/50 pt-2.5 mt-1 flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500">
                  <div className="space-y-0.5">
                    <p>Kuota: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{item.quota} klaim</span></p>
                    <p>Kadaluarsa: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{item.expiryDate}</span></p>
                  </div>

                  <button
                    onClick={() => onToggleVoucher(item.code)}
                    className={`text-xs px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer border ${
                      item.status === 'active'
                        ? 'border-zinc-300 hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-zinc-800 dark:hover:border-red-900/30 dark:hover:bg-red-950/20 dark:hover:text-red-400 text-zinc-600 dark:text-zinc-400'
                        : 'border-zinc-300 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {item.status === 'active' ? 'Matikan' : 'Aktifkan'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
