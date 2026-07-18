'use client'

import React, { useState, useEffect, useRef } from 'react'
import Swal from 'sweetalert2'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Category } from '@/core/types/category'
import { Product } from '@/core/types/product'
import { playSwalSound } from '@/utils/sound'
import { FiSave, FiAlertCircle, FiUploadCloud, FiX } from 'react-icons/fi'

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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    imageUrl: '',
    description: '',
  })

  const [imagePreview, setImagePreview] = useState<string>('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync form data when initialData or categories change / modal opens
  useEffect(() => {
    if (isOpen) {
      setError('')
      const initialImg = initialData?.imageUrl || ''
      setFormData({
        name: initialData?.name || '',
        category: initialData?.category || categories[0]?.id || '',
        price: initialData?.price?.toString() || '',
        stock: initialData?.stock?.toString() || '',
        imageUrl: initialImg,
        description: initialData?.description || '',
      })
      setImagePreview(initialImg)
    }
  }, [isOpen, initialData, categories])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle Image File Upload via FileReader
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('File yang diunggah harus berupa gambar (JPEG, PNG, WEBP, dll).')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran gambar tidak boleh melebihi 5MB.')
        return
      }

      setError('')
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setImagePreview(result)
        setFormData((prev) => ({ ...prev, imageUrl: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImagePreview('')
    setFormData((prev) => ({ ...prev, imageUrl: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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

    setIsSubmitting(true)

    setTimeout(() => {
      setIsSubmitting(false)
      onSave({
        ...(initialData ? { id: initialData.id } : {}),
        name: formData.name.trim(),
        category: formData.category,
        price: priceNum,
        stock: stockNum,
        imageUrl: formData.imageUrl.trim() || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600',
        description: formData.description.trim(),
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
          <div className="flex items-center gap-2 rounded bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-400">
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
              className="w-full rounded border border-zinc-200 bg-zinc-50/50 py-2 px-3.5 text-xs outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/60"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Kategori */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-zinc-700 dark:text-zinc-300">
                Kategori <span className="text-rose-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded border border-zinc-200 bg-zinc-50/50 py-2 px-3.5 text-xs outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/60"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

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
                className="w-full rounded border border-zinc-200 bg-zinc-50/50 py-2 px-3.5 text-xs outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/60"
                required
              />
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
                className="w-full rounded border border-zinc-200 bg-zinc-50/50 py-2 px-3.5 text-xs outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/60"
                required
              />
            </div>
          </div>

          {/* Upload Gambar Produk */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-zinc-700 dark:text-zinc-300">
              Upload Gambar Produk
            </label>
            
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="product-image-upload"
            />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-3 py-2 rounded border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <FiUploadCloud className="h-4 w-4 text-zinc-400" />
                <span>{imagePreview ? 'Ganti Gambar' : 'Pilih Gambar'}</span>
              </button>

              {imagePreview ? (
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-1 text-rose-500 hover:text-rose-700 transition-colors cursor-pointer text-xs"
                    title="Hapus Gambar"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <span className="text-xs text-zinc-400">Belum ada file dipilih</span>
              )}
            </div>
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
              className="w-full rounded border border-zinc-200 bg-zinc-50/50 py-2 px-3.5 text-xs outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/60 resize-none"
              required
            />
          </div>
        </form>
      </div>
    </Modal>
  )
}
