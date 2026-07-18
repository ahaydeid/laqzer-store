'use client'

import React, { useState, useEffect, useRef } from 'react'
import Swal from 'sweetalert2'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { CategoryCombobox } from '@/components/ui/CategoryCombobox'
import { Category } from '@/core/types/category'
import { Product } from '@/core/types/product'
import { playSwalSound } from '@/utils/sound'
import { FiSave, FiAlertCircle, FiPlus, FiX } from 'react-icons/fi'

import { compressImage, readFileAsDataURL } from '@/utils/imageCompression'

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
  categories: initialCategories,
  initialData,
  onSave,
}: ProductFormModalProps) {
  const isEdit = !!initialData
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [categoryList, setCategoryList] = useState<Category[]>(initialCategories)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
  })

  const [images, setImages] = useState<string[]>([])
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync form data & categoryList when initialData or initialCategories change / modal opens
  useEffect(() => {
    if (isOpen) {
      setError('')
      setCategoryList(initialCategories)
      setFormData({
        name: initialData?.name || '',
        category: initialData?.category || initialCategories[0]?.id || '',
        price: initialData?.price?.toString() || '',
        stock: initialData?.stock?.toString() || '',
        description: initialData?.description || '',
      })

      if (initialData?.images && initialData.images.length > 0) {
        setImages(initialData.images)
      } else if (initialData?.imageUrl) {
        setImages([initialData.imageUrl])
      } else {
        setImages([])
      }
    }
  }, [isOpen, initialData, initialCategories])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle Multi-file Upload (Up to 10 photos total) with Automatic Image Compression
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    if (images.length + files.length > 10) {
      setError(`Maksimal foto yang dapat diunggah adalah 10 (saat ini ${images.length} foto).`)
      return
    }

    setError('')

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('File yang diunggah harus berupa gambar (JPEG, PNG, WEBP, dll).')
        continue
      }
      if (file.size > 15 * 1024 * 1024) {
        setError('Ukuran gambar tidak boleh melebihi 15MB per file.')
        continue
      }

      try {
        // Compress image client-side before reading
        const compressedFile = await compressImage(file, {
          maxWidth: 900,
          maxHeight: 900,
          maxSizeKB: 180,
        })
        const resultDataUrl = await readFileAsDataURL(compressedFile)

        setImages((prev) => {
          if (prev.length < 10) {
            return [...prev, resultDataUrl]
          }
          return prev
        })
      } catch (err) {
        console.error('Failed to compress image:', err)
      }
    }

    // Reset file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove))
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

    const mainImageUrl = images[0] || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600'

    setIsSubmitting(true)

    setTimeout(() => {
      setIsSubmitting(false)
      onSave({
        ...(initialData ? { id: initialData.id } : {}),
        name: formData.name.trim(),
        category: formData.category,
        price: priceNum,
        stock: stockNum,
        imageUrl: mainImageUrl,
        images: images.length > 0 ? images : [mainImageUrl],
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

  const isFormDirty = () => {
    const initName = initialData?.name || ''
    const initCategory = initialData?.category || initialCategories[0]?.id || ''
    const initPrice = initialData?.price?.toString() || ''
    const initStock = initialData?.stock?.toString() || ''
    const initDesc = initialData?.description || ''

    const initImgs = initialData?.images && initialData.images.length > 0
      ? initialData.images
      : initialData?.imageUrl
      ? [initialData.imageUrl]
      : []

    if (formData.name.trim() !== initName) return true
    if (formData.category !== initCategory) return true
    if (formData.price !== initPrice) return true
    if (formData.stock !== initStock) return true
    if (formData.description.trim() !== initDesc) return true
    if (JSON.stringify(images) !== JSON.stringify(initImgs)) return true

    return false
  }

  const handleClose = () => {
    if (isFormDirty() && !isSubmitting) {
      playSwalSound('confirm')
      Swal.fire({
        title: 'Batalkan Pengisian?',
        text: 'Perubahan atau data yang telah Anda masukkan akan hilang.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Batalkan',
        cancelButtonText: 'Lanjutkan Mengisi',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#71717a',
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          onClose()
        }
      })
    } else {
      onClose()
    }
  }

  const footer = (
    <div className="flex justify-end gap-3">
      <Button variant="secondary" size="sm" onClick={handleClose} disabled={isSubmitting}>
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
      onClose={handleClose}
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
              <CategoryCombobox
                categories={categoryList}
                value={formData.category}
                onChange={(catId) => setFormData((prev) => ({ ...prev, category: catId }))}
                onAddNewCategory={(newCat) => setCategoryList((prev) => [...prev, newCat])}
              />
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

          {/* Upload Gambar Galeri Produk (Maksimal 10) */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-zinc-700 dark:text-zinc-300">
              Upload Foto Galeri Produk
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="product-image-upload"
            />

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Tombol Unggah Tambahan */}
              {images.length < 10 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-16 w-16 rounded border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/40 flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer flex-shrink-0"
                  title="Tambah Foto Produk"
                >
                  <FiPlus className="h-4 w-4" />
                  <span className="text-[9px] font-semibold">Tambah</span>
                </button>
              )}

              {/* Grid Preview Foto Terunggah */}
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`relative h-16 w-16 rounded overflow-hidden bg-zinc-100 dark:bg-zinc-900 group flex-shrink-0 ${
                    idx === 0
                      ? 'ring-2 ring-sky-500 dark:ring-sky-400 border-transparent'
                      : 'border border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`Preview ${idx + 1}`}
                    className="object-cover w-full h-full"
                  />

                  {/* Tombol Hapus */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                    title="Hapus foto ini"
                  >
                    <FiX className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Deskripsi (Tiptap Rich Text Editor) */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-zinc-700 dark:text-zinc-300">
              Deskripsi Produk <span className="text-rose-500">*</span>
            </label>
            <RichTextEditor
              value={formData.description}
              onChange={(val) => setFormData((prev) => ({ ...prev, description: val }))}
            />
          </div>
        </form>
      </div>
    </Modal>
  )
}
