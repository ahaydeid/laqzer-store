'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/core/types/product'
import { FiHeart, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

interface FlashSaleSectionProps {
  products: Product[]
}

export function FlashSaleSection({ products }: FlashSaleSectionProps) {
  // Real-time ticking countdown timer (starting at 8h 17m 56s)
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 17, seconds: 56 })

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num: number) => String(num).padStart(2, '0')

  return (
    <section className="w-full py-8 border-b border-zinc-100 dark:border-zinc-900">
      <div className="space-y-6">
        
        {/* Flash Sale Header & Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-extrabold tracking-tight text-zinc-950 dark:text-white flex items-center gap-1.5">
              <span>⚡</span> Flash Sale
            </h3>
            
            {/* Countdown timer UI */}
            <div className="flex items-center gap-1">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500 font-bold text-sm text-white">
                {formatNumber(timeLeft.hours)}
              </span>
              <span className="text-red-500 font-bold">:</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500 font-bold text-sm text-white">
                {formatNumber(timeLeft.minutes)}
              </span>
              <span className="text-red-500 font-bold">:</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500 font-bold text-sm text-white">
                {formatNumber(timeLeft.seconds)}
              </span>
            </div>
          </div>

          {/* Nav arrows */}
          <div className="flex gap-2">
            <button className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-300">
              <FiChevronLeft className="h-4 w-4" />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-zinc-950 hover:bg-zinc-900 text-white dark:border-zinc-800 dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950">
              <FiChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Grid of Flash Sale products */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => {
            const hasDiscount = product.originalPrice && product.originalPrice > product.price
            const discountPercentage = hasDiscount 
              ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
              : 0

            return (
              <div 
                key={product.id} 
                className="group relative flex flex-col rounded-2xl border border-zinc-100 bg-white p-3 shadow-sm hover:shadow-md transition-all duration-300 dark:border-zinc-800/60 dark:bg-zinc-900/40"
              >
                {/* Product image container */}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Discount label */}
                  {hasDiscount && (
                    <span className="absolute top-2 left-2 rounded-lg bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                      -{discountPercentage}%
                    </span>
                  )}

                  {/* Favorite button */}
                  <button className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-zinc-500 hover:text-red-500 shadow-sm transition-colors hover:scale-105 active:scale-95">
                    <FiHeart className="h-4 w-4" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="flex flex-1 flex-col pt-3 gap-2 justify-between">
                  <div className="space-y-1">
                    <h4 className="line-clamp-2 text-xs font-semibold leading-relaxed text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                      {product.name}
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {/* Pricing */}
                    <div className="flex flex-wrap items-baseline gap-1.5">
                      <span className="text-sm font-extrabold text-zinc-950 dark:text-white">
                        Rp{product.price.toLocaleString('id-ID')}
                      </span>
                      {hasDiscount && (
                        <span className="text-[10px] text-zinc-400 line-through">
                          Rp{product.originalPrice!.toLocaleString('id-ID')}
                        </span>
                      )}
                    </div>

                    {/* Stock status progress bar */}
                    {product.soldProgress !== undefined && (
                      <div className="space-y-1.5">
                        <div className="relative h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-red-500 transition-all duration-500" 
                            style={{ width: `${product.soldProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold text-red-500">
                          <span>{product.soldProgress}% Terjual</span>
                          <span>Segera Habis</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
