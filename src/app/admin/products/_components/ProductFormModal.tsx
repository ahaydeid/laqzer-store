'use client'

import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import Toggle from '@/components/ui/Toggle'
import { Category } from '@/core/types/category'
import { Product } from '@/core/types/product'
import { playSwalSound } from '@/utils/sound'
import { FiSave, FiAlertCircle } from 'react-icons/fi'

interface ProductFormModalProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  initialData?: Product | null
  onSave: (productData: Partial<Product>) => void
}

export function ProductFormModal({
  isOpen,
  onClose,
  categories,
  initialData,
  onSave,
}: ProductFormModalProps) {
  const isEdit = !!initialData

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    originalPrice: '',
    stock: '',
    imageUrl: '',
    description: '',
    isCampaign: false,
  })

  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync form data when initialData or categories change / modal opens
  useEffect(() => {
    if (isOpen) {
      setError('')
      setFormData({
        name: initialData?.name || '',
        category: initialData?.category || categories[0]?.id || '',
        price: initialData?.price?.toString() || '',
        originalPrice: initialData?.originalPrice?.toString() || '',
        stock: initialData?.stock?.toString() || '',
        imageUrl: initialData?.imageUrl || '',
        description: initialData?.description || '',
        isCampaign: initialData?.isCampaign || false,
      })
    }
  }, [isOpen, initialData, categories])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim() || !formData.price || !formData.stock || !formData.description.trim()) {
      setError('Harap lengkapi semua field utama yang berbintang (*).')
      return
    }

    const priceNum = Number(formData.price)
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Harga harus berupa angka positif.')
      return
    }

    const stockNum = Number(formData.stock)
    if (isNaN(stockNum) || stockNum < 0) {
      setError('Stok harus berupa angka bulat positif.')
      return
    }

    const origPriceNum = formData.originalPrice ? Number(formData.originalPrice) : undefined
    if (origPriceNum !== undefined && (isNaN(origPriceNum) || origPriceNum < 0)) {
      setError('Harga asli/coret harus berupa angka positif.')
      return
    }

    setIsSubmitting(true)

    setTimeout(() => {
      setIsSubmitting(false)
      onSave({
        ...(initialData ? { id: initialData.id } : {}),
        name: formData.name.trim(),
        category: formData.category,
        price: priceNum,
        originalPrice: origPriceNum,
        stock: stockNum,
        imageUrl: formData.imageUrl.trim() || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600',
        description: formData.description.trim(),
        isCampaign: formData.isCampaign,
      })

      playSwalSound('success')
      Swal.fire({
        title: 'Berhasil!',
        text: isEdit
          ? `Produk "${formData.name}" berhasil diperbarui!`
          : `Produk baru "${formData.name}" berhasil ditambahkan!`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      })

      onClose()
    }, 500)
  }

  const footer = (
    <div className="flex justify-end gap-3">
      <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
        Batal
      </Button>
      <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isSubmitting}>
        <FiSave className="h-4 w-4" />
        {isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
      </Button>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Detail Produk' : 'Tambah Produk Baru'}
      size="2xl"
      footer={footer}
    >
      <div className="p-5 space-y-5">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-400">
            <FiAlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Produk */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-zinc-700 dark:text-zinc-300">
              Nama Produk <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: Jaket Denim Kasual"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 px-3.5 text-xs outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/60"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kategori */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-zinc-700 dark:text-zinc-300">
                Kategori <span className="text-rose-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 px-3.5 text-xs outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/60"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Stok Produk */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-zinc-700 dark:text-zinc-300">
                Stok Produk <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="Contoh: 50"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 px-3.5 text-xs outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/60"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Harga Satuan */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-zinc-700 dark:text-zinc-300">
                Harga Satuan (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Contoh: 150000"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 px-3.5 text-xs outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/60"
                required
              />
            </div>

            {/* Harga Asli / Coret */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-zinc-700 dark:text-zinc-300">
                Harga Coret / Diskon (Rp) <span className="text-zinc-400 font-normal">(Opsional)</span>
              </label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                placeholder="Contoh: 200000"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 px-3.5 text-xs outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/60"
              />
            </div>
          </div>

          {/* Status Campaign Promo */}
          <div className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/40 p-3">
            <div>
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Status Campaign Promo
              </p>
              <p className="text-[11px] text-zinc-400">
                Aktifkan jika produk ini masuk dalam program promo campaign
              </p>
            </div>
            <Toggle
              leftLabel="Aktif"
              rightLabel="Nonaktif"
              checked={formData.isCampaign}
              onChange={(val) => setFormData((prev) => ({ ...prev, isCampaign: val }))}
              activeColorClass="bg-emerald-600"
              className="w-36"
            />
          </div>

          {/* URL Gambar */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-zinc-700 dark:text-zinc-300">
              URL Gambar Produk
            </label>
            <input
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 px-3.5 text-xs outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/60"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-zinc-700 dark:text-zinc-300">
              Deskripsi Produk <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Jelaskan detail spesifikasi produk..."
              rows={4}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 px-3.5 text-xs outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/60 resize-none"
              required
            />
          </div>
        </form>
      </div>
    </Modal>
  )
}
