'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Product } from '@/core/types/product'
import { FiHeart, FiStar } from 'react-icons/fi'

interface ProductSectionProps {
  products: Product[]
}

const TABS = [
  { id: 'all', name: 'Rekomendasi' },
  { id: 'best-seller', name: 'Terlaris' },
  { id: 'promo', name: 'Diskon Spesial' },
  { id: 'new', name: 'Terbaru' },
]

export function ProductSection({ products }: ProductSectionProps) {
  const [activeTab, setActiveTab] = useState('all')

  const getFilteredProducts = () => {
    switch (activeTab) {
      case 'best-seller':
        return products.filter((p) => p.soldCount >= 500)
      case 'promo':
        return products.filter((p) => p.originalPrice && p.originalPrice > p.price)
      case 'new':
        return products.slice(0, 4) // simulate new items
      default:
        return products
    }
  }

  const filteredProducts = getFilteredProducts()

  return (
    <section id="catalog" className="w-full bg-slate-50 dark:bg-zinc-900/30 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Section Header & Tabs */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
          Rekomendasi Hari Ini
        </h3>

        {/* Tab Buttons bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide whitespace-nowrap transition-all border outline-none ${
                activeTab === tab.id
                  ? 'bg-zinc-950 text-white border-zinc-950 dark:bg-white dark:text-zinc-950 dark:border-white shadow-sm'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-700'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
        {filteredProducts.map((product) => {
          const hasDiscount = product.originalPrice && product.originalPrice > product.price
          const discountPercentage = hasDiscount 
            ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
            : 0

          return (
            <div 
              key={product.id} 
              className="group relative flex flex-col rounded-xl bg-white overflow-hidden hover:shadow-md transition-all duration-300 dark:border-zinc-800/60 dark:bg-zinc-900/40"
            >
              {/* Product link wrapper */}
              <Link href={`/product/${product.id}`} className="flex flex-col flex-1">
                {/* Product Image */}
                <div className="relative aspect-square w-full overflow-hidden bg-zinc-50 dark:bg-zinc-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Slashed discount badge */}
                  {hasDiscount && (
                    <span className="absolute top-0 left-0 rounded-br-xl bg-red-500 px-2.5 py-1 text-xs font-semibold text-white uppercase tracking-wider">
                      -{discountPercentage}%
                    </span>
                  )}
                </div>

                {/* Product Metadata & Info */}
                <div className="flex flex-1 flex-col p-3.5 gap-2 justify-between">
                  <div className="space-y-1">
                    <h4 className="line-clamp-2 text-xs font-semibold leading-relaxed text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                      {product.name}
                    </h4>

                    {/* Rating and Sold Count */}
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                      <div className="flex items-center gap-0.5 text-yellow-500">
                        <FiStar className="h-3 w-3 fill-current" />
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">{product.rating}</span>
                      </div>
                      <span className="text-zinc-300 dark:text-zinc-700">|</span>
                      <span>{product.soldCount.toLocaleString('id-ID')}+ Terjual</span>
                    </div>
                  </div>

                  {/* Price block */}
                  <div className="flex flex-wrap items-baseline gap-1.5 pt-1">
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">
                      Rp{product.price.toLocaleString('id-ID')}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-zinc-400 line-through">
                        Rp{product.originalPrice!.toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              {/* Favorite toggle icon (outside the Link wrapper to avoid nested anchor warning) */}
              <button 
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  alert('Disukai!')
                }}
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-zinc-500 hover:text-red-500 shadow-sm transition-colors hover:scale-105 active:scale-95 z-10"
              >
                <FiHeart className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
      </div>
    </section>
  )
}
