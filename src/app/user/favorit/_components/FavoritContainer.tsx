'use client'

import { useState, useMemo } from 'react'
import { FiHeart, FiShoppingBag, FiTrash2, FiChevronDown } from 'react-icons/fi'
import { FaHeart } from 'react-icons/fa'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { SupabaseWishlistService } from '@/services/supabase/wishlist.service'
import { Product } from '@/core/types/product'
import Swal from 'sweetalert2'
import { playSwalSound } from '@/utils/sound'
import useSWR from 'swr'


export function FavoritContainer() {
  const { user } = useAuth()
  const wishlistService = useMemo(() => new SupabaseWishlistService(), [])
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const { data: products = [], isLoading, mutate } = useSWR(
    user?.id ? `user-wishlist-${user.id}` : null,
    () => wishlistService.getFavoriteProducts(user!.id),
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  )

  const handleRemove = async (product: Product) => {
    if (!user?.id) return
    playSwalSound('confirm')
    const res = await Swal.fire({
      title: 'Hapus dari Favorit?',
      text: `"${product.name}" akan dihapus dari daftar favorit Anda.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#71717a',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    })
    if (!res.isConfirmed) return

    setRemovingId(String(product.id))
    try {
      await wishlistService.toggle(user.id, String(product.id))
      // Update cache lokal secara optimis
      mutate(products.filter((p) => String(p.id) !== String(product.id)), { revalidate: false })
    } catch {
      // silent
    } finally {
      setRemovingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-zinc-400 gap-3">
        <FaHeart className="w-8 h-8 text-rose-300 animate-pulse" />
        <p className="text-sm font-medium">Memuat favorit Anda...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative">
          {/* Desktop Title */}
          <h1 className="hidden md:block text-xl font-extrabold text-zinc-900 dark:text-white">
            Favorit Saya
          </h1>

          {/* Mobile Title with Dropdown */}
          <div className="md:hidden relative inline-block text-left">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 text-xl font-extrabold text-zinc-900 dark:text-white focus:outline-none cursor-pointer"
            >
              <span>Favorit Saya</span>
              <FiChevronDown className={`w-5 h-5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-48 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg focus:outline-none z-50">
                  <div className="py-1">
                    <Link
                      href="/user/profile"
                      className="block px-4 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Profil Saya
                    </Link>
                    <Link
                      href="/user/purchase"
                      className="block px-4 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Pesanan Saya
                    </Link>
                    <Link
                      href="/user/favorit"
                      className="block px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Favorit Saya
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {products.length > 0 && (
          <span className="text-xs text-zinc-400">{products.length} produk</span>
        )}
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-950 rounded border border-zinc-100 dark:border-zinc-900 text-center p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center">
            <FiHeart className="w-8 h-8 text-rose-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Belum ada produk favorit</h3>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded transition-all"
          >
            <FiShoppingBag className="w-4 h-4" />
            Jelajahi Produk
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {products.map((product) => {
            const hasDiscount = product.isCampaign && product.originalPrice && product.originalPrice > product.price
            const discountPct = hasDiscount
              ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
              : 0

            return (
              <div
                key={product.id}
                className={`relative bg-white dark:bg-zinc-950 rounded border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden group transition-all hover:shadow-md ${
                  removingId === String(product.id) ? 'opacity-40 pointer-events-none scale-95' : ''
                }`}
              >
                {/* Remove button */}
                <button
                  onClick={() => handleRemove(product)}
                  className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white/90 dark:bg-zinc-900/90 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100"
                  title="Hapus dari Favorit"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                </button>

                {/* Discount badge */}
                {hasDiscount && (
                  <div className="absolute top-2 left-2 z-10 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    -{discountPct}%
                  </div>
                )}

                {/* Image */}
                <Link href={`/product/${product.id}`}>
                  <div className="aspect-square bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
                    />
                  </div>
                </Link>

                {/* Info */}
                <div className="p-3 space-y-1">
                  <Link href={`/product/${product.id}`}>
                    <h3 className="text-xs font-semibold text-zinc-900 dark:text-white line-clamp-2 hover:text-rose-600 dark:hover:text-rose-400 transition-colors leading-snug">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400">
                      Rp {product.price.toLocaleString('id-ID')}
                    </span>
                    {hasDiscount && (
                      <span className="text-[10px] text-zinc-400 line-through">
                        Rp {product.originalPrice!.toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-zinc-400">{product.soldCount} terjual</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
