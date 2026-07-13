'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Category } from '@/core/types/category'
import { Product } from '@/core/types/product'
import { FiArrowLeft, FiSave, FiAlertCircle } from 'react-icons/fi'

interface ProductFormProps {
  categories: Category[]
  initialData?: Product | null
  type: 'create' | 'edit'
}

export function ProductForm({ categories, initialData, type }: ProductFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    category: initialData?.category || categories[0]?.name || '',
    price: initialData?.price?.toString() || '',
    stock: initialData?.stock?.toString() || '',
    imageUrl: initialData?.imageUrl || '',
    description: initialData?.description || '',
  })
  
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validasi sederhana
    if (!formData.name.trim() || !formData.price || !formData.stock || !formData.description.trim()) {
      setError('Harap lengkapi semua field utama yang berbintang (*).')
      return
    }

    if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      setError('Harga harus berupa angka positif.')
      return
    }

    if (isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      setError('Stok harus berupa angka bulat positif.')
      return
    }

    setIsSubmitting(true)

    // Simulasi respons API
    setTimeout(() => {
      setIsSubmitting(false)
      alert(
        type === 'create' 
          ? 'Produk berhasil ditambahkan! (Simulasi)' 
          : 'Perubahan produk berhasil disimpan! (Simulasi)'
      )
      router.push('/admin/products')
      router.refresh()
    }, 800)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Form */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="rounded-lg p-2 border border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-800 transition-colors"
        >
          <FiArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            {type === 'create' ? 'Tambah Produk Baru' : 'Edit Detail Produk'}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {type === 'create' 
              ? 'Lengkapi form di bawah untuk mendaftarkan produk baru ke katalog.' 
              : 'Perbarui informasi detail produk terpilih.'}
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-400">
          <FiAlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Layout */}
      <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-3">
        {/* Kolom Kiri: Detail Utama */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">
              Informasi Produk
            </h2>

            <div className="space-y-4">
              {/* Nama Produk */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                  Nama Produk <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Contoh: Jaket Denim Kasual"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-4 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/60"
                  required
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                  Deskripsi Lengkap <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Jelaskan spesifikasi, keunggulan, ukuran, dll..."
                  rows={6}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-4 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/60 resize-none"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Pengaturan & Media */}
        <div className="space-y-6">
          {/* Harga & Inventaris */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">
              Harga & Inventaris
            </h2>

            <div className="space-y-4">
              {/* Kategori */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                  Kategori
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-4 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/60"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Harga */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                  Harga Satuan (Rp) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Contoh: 150000"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-4 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/60"
                  required
                />
              </div>

              {/* Stok */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                  Stok Produk <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="Contoh: 50"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-4 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/60"
                  required
                />
              </div>
            </div>
          </div>

          {/* Media Gambar */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">
              Gambar Produk
            </h2>

            <div className="space-y-4">
              {/* URL Gambar */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                  URL Gambar
                </label>
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/gambar.jpg"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-4 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/60"
                />
              </div>

              {/* Preview Gambar */}
              {formData.imageUrl && (
                <div className="mt-2 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 aspect-video flex items-center justify-center relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      // Prevent loop
                      ;(e.target as HTMLImageElement).src = '/img/placeholder.jpg'
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Tombol Simpan / Batal */}
          <div className="flex gap-3">
            <Link
              href="/admin/products"
              className="flex-1 text-center py-3 rounded-xl border border-zinc-200 text-sm font-semibold hover:bg-zinc-50 transition-colors dark:border-zinc-800 dark:hover:bg-zinc-900/60"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50"
            >
              <FiSave className="h-4 w-4" />
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
