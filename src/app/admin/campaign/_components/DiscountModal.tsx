import React, { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import Toggle from '@/components/ui/Toggle'
import { FiSearch, FiChevronDown, FiCheck } from 'react-icons/fi'
import { MockProduct } from './types'

const MOCK_PRODUCTS: MockProduct[] = [
  { id: 'mock-1', name: 'Laptop Asus ROG Strix G15', price: 18500000, imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=120' },
  { id: 'mock-2', name: 'Keyboard Mechanical Laqzer RGB', price: 850000, imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=120' },
  { id: 'mock-3', name: 'Mouse Wireless Gaming Superlight', price: 450000, imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=120' },
  { id: 'mock-4', name: 'Headset Stereo Pro Bass', price: 650000, imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=120' },
  { id: 'mock-5', name: 'Monitor Curved Gaming 27 Inch', price: 3200000, imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=120' }
]

interface DiscountModalProps {
  isOpen: boolean
  onClose: () => void
  onAddDiscount: (newDiscount: {
    campaignName: string
    productId: string
    productName: string
    originalPrice: number
    priceAfterDiscount: number
    discountPercent: number
    isActive: boolean
    startDate: string
    endDate: string
  }) => void
  formatRupiah: (num: number) => string
}

export default function DiscountModal({ isOpen, onClose, onAddDiscount, formatRupiah }: DiscountModalProps) {
  // Form State inside Modal
  const [campaignName, setCampaignName] = useState('')
  const [selectedProductObj, setSelectedProductObj] = useState<MockProduct | null>(null)
  const [discountPercent, setDiscountPercent] = useState<number>(0)
  const [priceAfterDiscount, setPriceAfterDiscount] = useState<number>(0)
  const [discountIsActive, setDiscountIsActive] = useState(true)

  // Date helpers
  const getTodayString = () => {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const getFutureDateString = (daysAhead: number) => {
    const date = new Date()
    date.setDate(date.getDate() + daysAhead)
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const [discountStart, setDiscountStart] = useState(getTodayString())
  const [discountEnd, setDiscountEnd] = useState(getFutureDateString(7))

  // Combobox Search State
  const [productSearchQuery, setProductSearchQuery] = useState('')
  const [isComboboxOpen, setIsComboboxOpen] = useState(false)

  // Synchronized inputs handlers
  const handlePercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value
    if (rawVal === '') {
      setDiscountPercent(0)
      if (selectedProductObj) setPriceAfterDiscount(selectedProductObj.price)
      return
    }
    const val = Number(rawVal)
    if (val < 0 || val > 100) return
    setDiscountPercent(val)
    if (selectedProductObj) {
      const discountVal = (selectedProductObj.price * val) / 100
      setPriceAfterDiscount(Math.max(0, Math.round(selectedProductObj.price - discountVal)))
    }
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value
    if (rawVal === '') {
      setPriceAfterDiscount(0)
      setDiscountPercent(100)
      return
    }
    const val = Number(rawVal)
    if (selectedProductObj) {
      if (val < 0 || val > selectedProductObj.price) return
      setPriceAfterDiscount(val)
      const diff = selectedProductObj.price - val
      const calculatedPercent = Math.max(0, Math.min(100, Math.round((diff / selectedProductObj.price) * 100)))
      setDiscountPercent(calculatedPercent)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!campaignName.trim() || !selectedProductObj) return

    onAddDiscount({
      campaignName: campaignName.trim(),
      productId: selectedProductObj.id,
      productName: selectedProductObj.name,
      originalPrice: selectedProductObj.price,
      priceAfterDiscount,
      discountPercent,
      isActive: discountIsActive,
      startDate: discountStart,
      endDate: discountEnd
    })

    // Reset Form
    setCampaignName('')
    setSelectedProductObj(null)
    setProductSearchQuery('')
    setDiscountPercent(0)
    setPriceAfterDiscount(0)
    setDiscountIsActive(true)
    setDiscountStart(getTodayString())
    setDiscountEnd(getFutureDateString(7))
  }

  const handleModalClose = () => {
    onClose()
    setCampaignName('')
    setSelectedProductObj(null)
    setProductSearchQuery('')
    setDiscountPercent(0)
    setPriceAfterDiscount(0)
    setDiscountIsActive(true)
    setDiscountStart(getTodayString())
    setDiscountEnd(getFutureDateString(7))
  }

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose} title="Buat Diskon Produk Baru" size="lg" bodyClassName="!overflow-visible">
      <form onSubmit={handleSubmit} className="p-6 space-y-5 text-sm">
        {/* Nama Event/Campaign */}
        <div>
          <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Nama Event / Campaign
          </label>
          <input
            type="text"
            placeholder="Contoh: Promo Gajian Akhir Bulan"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            className="w-full rounded border border-zinc-200 dark:border-zinc-800 bg-transparent px-3.5 py-2.5 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            required
          />
        </div>

        {/* Searchable Combobox Produk */}
        <div className="relative">
          <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Pilih Produk
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder={selectedProductObj ? selectedProductObj.name : "Ketik untuk mencari produk..."}
              value={productSearchQuery}
              onChange={(e) => {
                setProductSearchQuery(e.target.value)
                setIsComboboxOpen(true)
                if (selectedProductObj && e.target.value !== selectedProductObj.name) {
                  setSelectedProductObj(null)
                  setDiscountPercent(0)
                  setPriceAfterDiscount(0)
                }
              }}
              onFocus={() => setIsComboboxOpen(true)}
              className="w-full rounded border border-zinc-200 dark:border-zinc-800 bg-transparent pl-10 pr-10 py-2.5 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-medium"
            />
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <button
              type="button"
              onClick={() => setIsComboboxOpen(!isComboboxOpen)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <FiChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Combobox Dropdown */}
          {isComboboxOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsComboboxOpen(false)} />
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded shadow-lg max-h-60 overflow-y-auto">
                {MOCK_PRODUCTS.filter((p) =>
                  p.name.toLowerCase().includes(productSearchQuery.toLowerCase())
                ).length === 0 ? (
                  <div className="p-3 text-xs text-zinc-400 dark:text-zinc-500 text-center">
                    Tidak ada produk ditemukan
                  </div>
                ) : (
                  MOCK_PRODUCTS.filter((p) =>
                    p.name.toLowerCase().includes(productSearchQuery.toLowerCase())
                  ).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedProductObj(p)
                        setProductSearchQuery(p.name)
                        setPriceAfterDiscount(p.price)
                        setDiscountPercent(0)
                        setIsComboboxOpen(false)
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center gap-3 transition-colors cursor-pointer border-b border-zinc-100/50 dark:border-zinc-900/50 last:border-b-0"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-8 h-8 rounded object-cover shrink-0 bg-zinc-100 dark:bg-zinc-800"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                          {p.name}
                        </p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                          {formatRupiah(p.price)}
                        </p>
                      </div>
                      {selectedProductObj?.id === p.id && (
                        <FiCheck className="text-sky-600 dark:text-sky-400 w-4 h-4 shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Sinkronisasi Potongan / Diskon */}
        {selectedProductObj && (
          <div className="grid grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded border border-zinc-200 dark:border-zinc-800/80">
            <div className="col-span-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              Kalkulator Diskon ({formatRupiah(selectedProductObj.price)})
            </div>

            <div>
              <label className="block font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Diskon (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent || ''}
                  onChange={handlePercentChange}
                  className="w-full rounded border border-zinc-200 dark:border-zinc-800 bg-transparent pl-3 pr-8 py-2 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-medium"
                  placeholder="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">%</span>
              </div>
            </div>

            <div>
              <label className="block font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Harga Setelah Diskon (Rp)
              </label>
              <input
                type="number"
                min="0"
                max={selectedProductObj.price}
                value={priceAfterDiscount || ''}
                onChange={handlePriceChange}
                className="w-full rounded border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-zinc-900 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-semibold text-emerald-600 dark:text-emerald-400"
                placeholder="Rp 0"
              />
            </div>
          </div>
        )}

        {/* Durasi */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Mulai Berlaku
            </label>
            <input
              type="date"
              value={discountStart}
              onChange={(e) => setDiscountStart(e.target.value)}
              className="w-full rounded border border-zinc-200 dark:border-zinc-800 bg-transparent px-3.5 py-2 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-medium"
            />
          </div>
          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Berakhir Pada
            </label>
            <input
              type="date"
              value={discountEnd}
              onChange={(e) => setDiscountEnd(e.target.value)}
              className="w-full rounded border border-zinc-200 dark:border-zinc-800 bg-transparent px-3.5 py-2 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-medium"
            />
          </div>
        </div>

        {/* Toggle Aktif / Nonaktif */}
        <div className="flex items-center justify-between pt-2">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">Status Awal Diskon</span>
          <Toggle
            leftLabel="Aktif"
            rightLabel="Nonaktif"
            checked={discountIsActive}
            onChange={(checked) => setDiscountIsActive(checked)}
            activeColorClass="bg-sky-600"
            className="w-40"
          />
        </div>

        {/* Footer Aksi */}
        <div className="flex gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={handleModalClose}
            className="flex-1 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-semibold py-2.5 rounded transition-colors cursor-pointer text-center"
          >
            Batal
          </button>
          <button
            type="submit"
            className="flex-1 bg-sky-700 hover:bg-sky-800 text-white font-semibold py-2.5 rounded transition-colors cursor-pointer text-center"
          >
            Selesaikan
          </button>
        </div>
      </form>
    </Modal>
  )
}
