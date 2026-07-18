'use client'

import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Product } from '@/core/types/product'

interface ProductDetailModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  categoryName?: string
}

export function ProductDetailModal({
  isOpen,
  onClose,
  product,
  categoryName,
}: ProductDetailModalProps) {
  const [activeImage, setActiveImage] = useState<string>('')

  useEffect(() => {
    if (product) {
      const firstImage = product.images?.[0] || product.imageUrl || ''
      setActiveImage(firstImage)
    }
  }, [product])

  if (!product) return null

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num)
  }

  const galleryImages = product.images && product.images.length > 0
    ? product.images
    : [product.imageUrl]

  const footer = (
    <div className="flex justify-end">
      <Button variant="secondary" size="sm" onClick={onClose}>
        Tutup
      </Button>
    </div>
  )

  const formatDescriptionHtml = (desc?: string) => {
    if (!desc) return 'Tidak ada deskripsi rinci untuk produk ini.'
    // If description already contains HTML tags, return as is
    if (/<[a-z][\s\S]*>/i.test(desc)) {
      return desc
    }
    // Otherwise, convert plain text newlines to <br />
    return desc.replace(/\n/g, '<br />')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Rincian Produk"
      size="2xl"
      footer={footer}
    >
      <div className="p-5 space-y-6">
        {/* Header Produk & Media Gallery Preview */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {/* Main Image Container */}
            <div className="w-full sm:w-52 h-52 rounded overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex-shrink-0 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImage || product.imageUrl}
                alt={product.name}
                className="object-cover w-full h-full"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = '/img/placeholder.jpg'
                }}
              />
            </div>

            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {product.stock === 0 && (
                  <Badge variant="destructive">Stok Habis</Badge>
                )}
                {product.stock > 0 && product.stock <= 5 && (
                  <Badge variant="warning">Stok Menipis</Badge>
                )}
                {product.isCampaign && (
                  <Badge variant="info">Campaign Promo</Badge>
                )}
                {categoryName && (
                  <span className="text-xs text-zinc-500 font-medium">
                    {categoryName}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                {product.name}
              </h3>

              {/* Pricing Section */}
              <div className="flex items-baseline gap-2.5">
                <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatRupiah(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xs text-zinc-400 line-through">
                    {formatRupiah(product.originalPrice)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Deretan Foto Galeri di Baris Baru Memanfaatkan Ruang Luas ke Kanan */}
          {galleryImages.length > 1 && (
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {galleryImages.map((img, idx) => {
                const isActive = activeImage === img
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`h-12 w-12 rounded overflow-hidden transition-all flex-shrink-0 cursor-pointer ${
                      isActive
                        ? 'ring-2 ring-sky-500 dark:ring-sky-400 border-transparent'
                        : 'border border-zinc-200 dark:border-zinc-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={`Galeri ${idx + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Info Grid (5 Cards tanpa border dan tanpa icon) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="rounded bg-zinc-50 dark:bg-zinc-900/50 p-3.5">
            <div className="text-zinc-400 text-xs mb-1">
              Stok Tersedia
            </div>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              {product.stock} pcs
            </p>
          </div>

          <div className="rounded bg-zinc-50 dark:bg-zinc-900/50 p-3.5">
            <div className="text-zinc-400 text-xs mb-1">
              Total Terjual
            </div>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              {product.soldCount || 0} unit
            </p>
          </div>

          <div className="rounded bg-zinc-50 dark:bg-zinc-900/50 p-3.5">
            <div className="text-amber-500 text-xs mb-1 font-medium">
              Rating Produk
            </div>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              {product.rating || 5.0} / 5.0
            </p>
          </div>

          <div className="rounded bg-zinc-50 dark:bg-zinc-900/50 p-3.5">
            <div className="text-zinc-400 text-xs mb-1">
              Berat Produk
            </div>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              {product.weight || 500} gram
            </p>
          </div>

          <div className="rounded bg-zinc-50 dark:bg-zinc-900/50 p-3.5">
            <div className="text-zinc-400 text-xs mb-1">
              Progress Campaign
            </div>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              {product.soldProgress ? `${product.soldProgress}%` : '-'}
            </p>
          </div>
        </div>

        {/* Varian Produk */}
        {product.variants && product.variants.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Varian Produk
            </h4>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 px-3 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300"
                >
                  {variant}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Deskripsi Lengkap (Rich Text / Plain Text HTML Renderer) */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Deskripsi Produk
          </h4>
          <div
            className="rounded bg-zinc-50/60 dark:bg-zinc-900/30 p-4 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 whitespace-pre-line prose dark:prose-invert max-w-none [&_h1]:text-sm [&_h1]:font-bold [&_h2]:text-xs [&_h2]:font-bold [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:mb-2"
            dangerouslySetInnerHTML={{
              __html: formatDescriptionHtml(product.description),
            }}
          />
        </div>
      </div>
    </Modal>
  )
}
