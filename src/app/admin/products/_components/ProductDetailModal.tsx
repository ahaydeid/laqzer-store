'use client'

import React from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Product } from '@/core/types/product'
import { FiBox, FiStar, FiShoppingBag, FiTag, FiTrendingUp } from 'react-icons/fi'

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
  if (!product) return null

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num)
  }

  const stockStatus =
    product.stock === 0
      ? { label: 'Stok Habis', variant: 'destructive' as const }
      : product.stock <= 5
      ? { label: 'Stok Menipis', variant: 'warning' as const }
      : { label: 'Tersedia', variant: 'success' as const }

  const footer = (
    <div className="flex justify-end">
      <Button variant="outline" size="sm" onClick={onClose}>
        Tutup
      </Button>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Rincian Produk"
      size="2xl"
      footer={footer}
    >
      <div className="p-5 space-y-6">
        {/* Header Produk & Media Preview */}
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <div className="w-full sm:w-44 h-44 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex-shrink-0 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl}
              alt={product.name}
              className="object-cover w-full h-full"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = '/img/placeholder.jpg'
              }}
            />
          </div>

          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
              {product.isCampaign && (
                <Badge variant="info">Campaign Promo</Badge>
              )}
              {categoryName && (
                <Badge variant="info">{categoryName}</Badge>
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

        {/* Info Grid (Stats) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 p-3">
            <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
              <FiBox className="h-3.5 w-3.5" />
              <span>Stok Tersedia</span>
            </div>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              {product.stock} pcs
            </p>
          </div>

          <div className="rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 p-3">
            <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
              <FiShoppingBag className="h-3.5 w-3.5" />
              <span>Total Terjual</span>
            </div>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              {product.soldCount || 0} unit
            </p>
          </div>

          <div className="rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 p-3">
            <div className="flex items-center gap-2 text-amber-500 text-xs mb-1">
              <FiStar className="h-3.5 w-3.5 fill-amber-400" />
              <span>Rating Produk</span>
            </div>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              {product.rating || 5.0} / 5.0
            </p>
          </div>

          <div className="rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 p-3">
            <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
              <FiTrendingUp className="h-3.5 w-3.5" />
              <span>Progress Campaign</span>
            </div>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              {product.soldProgress ? `${product.soldProgress}%` : '-'}
            </p>
          </div>
        </div>

        {/* Deskripsi Lengkap */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Deskripsi Produk
          </h4>
          <div className="rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/30 dark:bg-zinc-900/30 p-4 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 whitespace-pre-line">
            {product.description || 'Tidak ada deskripsi rinci untuk produk ini.'}
          </div>
        </div>
      </div>
    </Modal>
  )
}
