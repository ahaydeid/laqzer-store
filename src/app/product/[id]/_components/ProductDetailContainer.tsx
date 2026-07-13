'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiStar, FiMessageSquare, FiGlobe, FiShoppingCart, FiCheckCircle } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { Product } from '@/core/types/product'
import { StoreSettings } from '@/core/types/store'

interface ProductDetailContainerProps {
  product: Product
  settings: StoreSettings
}

export function ProductDetailContainer({ product, settings }: ProductDetailContainerProps) {
  const router = useRouter()
  
  // Generate 6 distinct simulated images representing fashion/subscription mocks
  const galleryImages = [
    product.imageUrl,
    'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600',
  ]

  const [virtualIdx, setVirtualIdx] = useState(0) // start at index 0 (first copy)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState('Hitam')
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('desc') // 'desc' | 'reviews'

  const activeImageIdx = (virtualIdx % galleryImages.length + galleryImages.length) % galleryImages.length

  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  const discountPercentage = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0

  const handlePrevImage = () => {
    if (virtualIdx > 0) {
      setIsTransitioning(true)
      setVirtualIdx((prev) => prev - 1)
    }
  }

  const handleNextImage = () => {
    setIsTransitioning(true)
    setVirtualIdx((prev) => prev + 1)
  }

  // Handle seamless index wrap-around at the end of the sliding transition (right end only)
  useEffect(() => {
    const len = galleryImages.length
    if (virtualIdx >= len * 2) {
      const timer = setTimeout(() => {
        setIsTransitioning(false)
        setVirtualIdx(virtualIdx - len)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [virtualIdx, galleryImages.length])

  const getWhatsAppLink = (messageText: string) => {
    const rawPhone = settings.phone || '081234567890'
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '')
    // Indonesian prefix fix (convert 08 to 628)
    const formattedPhone = cleanPhone.startsWith('0') 
      ? '62' + cleanPhone.slice(1) 
      : cleanPhone
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(messageText)}`
  }

  const handleBuyNow = () => {
    const text = `Halo ${settings.name}, saya ingin memesan produk berikut:
- Nama Produk: ${product.name}
- Varian: ${selectedVariant}
- Jumlah: ${quantity} pcs
- Total Harga: Rp ${(product.price * quantity).toLocaleString('id-ID')}

Mohon informasi selanjutnya untuk proses pembayaran. Terima kasih!`
    window.open(getWhatsAppLink(text), '_blank')
  }

  const handleChatWA = () => {
    const text = `Halo ${settings.name}, saya ingin bertanya mengenai produk "${product.name}" (Varian: ${selectedVariant}). Apakah produk ini ready stok?`
    window.open(getWhatsAppLink(text), '_blank')
  }

  return (
    <div className="w-full space-y-6 font-sans">
      {/* Back Button Navigation */}
      <button 
        onClick={() => router.push('/')}
        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors"
      >
        <FiArrowLeft className="h-4 w-4" />
        <span className="text-xs font-medium cursor-pointer tracking-tight">Kembali</span>
      </button>

      {/* Main product presentation grid (constrained to 1 screen height on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 md:h-[calc(100vh-180px)] md:max-h-[560px] md:min-h-[460px]">
        
        {/* Left Column: Image Gallery & External CTAs */}
        <div className="h-full flex flex-col justify-between gap-4 min-h-0">
          {/* Main Display Image */}
          <div className="relative flex-1 min-h-0 w-full rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={galleryImages[activeImageIdx]} 
              alt={product.name} 
              className="h-full w-full object-cover transition-all duration-300"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 rounded-lg bg-red-500 px-2.5 py-1 text-xs font-bold text-white uppercase tracking-wider">
                -{discountPercentage}%
              </span>
            )}
          </div>

          {/* Gallery Thumbnail Carousel (Centered Sliding Track with Gradient Overlays) */}
          <div className="flex-shrink-0 relative w-full max-w-[280px] sm:max-w-[320px] mx-auto px-8">
            {/* Left Chevron Button */}
            <button
              onClick={handlePrevImage}
              disabled={virtualIdx === 0}
              className="absolute left-1 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-zinc-600 hover:text-zinc-900 shadow-xs z-20 transition-all active:scale-90 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none"
            >
              <FiChevronLeft className="h-4 w-4" />
            </button>

            {/* Sliding Track Viewport with boundary-aligned gradient overlays */}
            <div className="relative overflow-hidden py-1">
              {/* Left Gradient Overlay */}
              <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent dark:from-zinc-950 pointer-events-none z-10" />

              {/* Translating Track */}
              <div 
                className={`flex items-center gap-3 ${isTransitioning ? 'transition-transform duration-300 ease-out' : ''}`}
                style={{ 
                  // Dynamically centers the active thumbnail using the virtual index
                  // Item width is 56px (w-14) + gap-3 is 12px = 68px.
                  transform: `translateX(calc(50% - 28px - ${virtualIdx * 68}px))` 
                }}
              >
                {[...galleryImages, ...galleryImages, ...galleryImages].map((img, idx) => {
                  const actualIdx = idx % galleryImages.length
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setIsTransitioning(true)
                        setVirtualIdx(idx)
                      }}
                      className={`relative aspect-square w-14 rounded-lg overflow-hidden bg-zinc-50 border transition-all flex-shrink-0 ${
                        activeImageIdx === actualIdx 
                          ? 'border-blue-500 ring-1 ring-blue-500/30 scale-105' 
                          : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  )
                })}
              </div>

              {/* Right Gradient Overlay */}
              <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent dark:from-zinc-950 pointer-events-none z-10" />
            </div>

            {/* Right Chevron Button */}
            <button
              onClick={handleNextImage}
              className="absolute right-1 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-zinc-600 hover:text-zinc-900 shadow-xs z-20 transition-all active:scale-90 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              <FiChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* External Contact Buttons */}
          <div className="flex-shrink-0 grid grid-cols-2 gap-3 pt-1">
            <button 
              onClick={handleChatWA}
              className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 py-2.5 px-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-all bg-white dark:bg-zinc-950"
            >
              <FiMessageSquare className="h-4 w-4" />
              <span>Chat Admin</span>
            </button>

            <button 
              onClick={handleChatWA}
              className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 py-2.5 px-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-all bg-white dark:bg-zinc-950"
            >
              <FaWhatsapp className="h-4 w-4 text-green-500" />
              <span>Chat lewat WA</span>
            </button>
          </div>
        </div>

        {/* Right Column: Metadata, Pricing & Variant Actions */}
        <div className="h-full flex flex-col justify-between py-1 gap-6 min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 scrollbar-thin space-y-4">
            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white leading-tight">
              {product.name}
            </h1>

            {/* Rating Stats Box */}
            <div className="grid grid-cols-3 divide-x divide-zinc-100 dark:divide-zinc-900 border-y border-zinc-100 dark:border-zinc-900 py-3 text-center bg-transparent">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-center gap-1 text-sm font-bold text-zinc-900 dark:text-white">
                  <FiStar className="h-4 w-4 text-yellow-500 fill-current" />
                  <span>{product.rating}</span>
                </div>
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">rating</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-zinc-900 dark:text-white">0</span>
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">penilaian</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-zinc-900 dark:text-white">{product.soldCount}</span>
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">terjual</span>
              </div>
            </div>

            {/* Price display Section Wrapper */}
            <div className="rounded-lg bg-slate-100/60 dark:bg-zinc-900 p-4 space-y-1.5">
              <span className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Harga Produk
              </span>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-semibold text-red-500 dark:text-rose-500">
                  Rp{product.price.toLocaleString('id-ID')}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-base text-zinc-400 line-through">
                      Rp{product.originalPrice!.toLocaleString('id-ID')}
                    </span>
                    <span className="rounded-md bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 text-xs font-bold text-red-600 dark:text-red-400">
                      -{discountPercentage}%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* 2-Column Product Attributes Section */}
            <div className="space-y-4 pt-3 border-t border-zinc-100 dark:border-zinc-900/50 mt-1">
              {/* Stok Row */}
              <div className="flex items-center gap-4">
                <span className="w-20 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Stok
                </span>
                <div className="flex-1 flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200 font-semibold">
                  <FiCheckCircle className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm">
                    {product.stock}
                  </span>
                </div>
              </div>

              {/* Varian Row */}
              <div className="flex items-center gap-4">
                <span className="w-20 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Varian
                </span>
                <div className="flex-1 flex items-center gap-2.5 flex-wrap">
                  {['Hitam', 'Merah'].map((v) => (
                    <button
                      key={v}
                      onClick={() => setSelectedVariant(v)}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-all border outline-none ${
                        selectedVariant === v
                          ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white'
                          : 'bg-white text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row Actions: Checkout Buttons */}
          <div className="flex-shrink-0 grid grid-cols-2 gap-3 border-t border-zinc-100 dark:border-zinc-900 pt-5">
            <button 
              onClick={() => alert(`Sukses! ${product.name} (Varian: ${selectedVariant}) ditambahkan ke keranjang.`)}
              className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 py-3 px-4 text-xs font-extrabold tracking-wide hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 transition-all text-zinc-900 dark:text-white"
            >
              <FiShoppingCart className="h-4 w-4" />
              <span>Masukkan Keranjang</span>
            </button>

            <button 
              onClick={handleBuyNow}
              className="flex items-center justify-center rounded-xl bg-zinc-950 dark:bg-white dark:text-zinc-950 text-white py-3 px-4 text-xs font-extrabold tracking-wide hover:bg-zinc-900 dark:hover:bg-zinc-100 transition-all active:scale-[0.99]"
            >
              Beli Sekarang
            </button>
          </div>
        </div>

      </div>

      {/* Tabs Section: Description & Reviews */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-8 space-y-6">
        <div className="flex items-center gap-6 border-b border-zinc-100 dark:border-zinc-900 pb-3">
          <button 
            onClick={() => setActiveTab('desc')}
            className={`pb-2 text-sm font-bold tracking-tight border-b-2 transition-all outline-none ${
              activeTab === 'desc' 
                ? 'border-zinc-950 text-zinc-950 dark:border-white dark:text-white' 
                : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
          >
            Deskripsi Produk
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`pb-2 text-sm font-bold tracking-tight border-b-2 transition-all outline-none ${
              activeTab === 'reviews' 
                ? 'border-zinc-950 text-zinc-950 dark:border-white dark:text-white' 
                : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
          >
            Penilaian (0)
          </button>
        </div>

        {activeTab === 'desc' ? (
          <div className="prose dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-line space-y-4">
            <h3 className="text-zinc-900 dark:text-white font-extrabold text-base">
              {product.name} - Premium Local Quality Product
            </h3>
            <p>{product.description}</p>
            
            <h4 className="text-zinc-900 dark:text-white font-bold text-sm pt-2">Kenapa Harus Membeli di Toko Kami:</h4>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>Layanan Pelanggan responsif dan terpercaya via WhatsApp</li>
              <li>Jaminan kualitas barang lokal premium buatan anak bangsa</li>
              <li>Sistem pengiriman bebas biaya & dukungan pembayaran COD</li>
              <li>Garansi retur gratis jika produk tidak sesuai deskripsi</li>
            </ul>
          </div>
        ) : (
          <div className="py-4 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 bg-zinc-50/50 dark:bg-zinc-900/10 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-900/60 max-w-md">
              <div className="text-center">
                <span className="text-4xl font-extrabold text-zinc-950 dark:text-white">
                  0.0
                </span>
                <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-1">
                  dari 5
                </span>
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <FiStar key={s} className="h-4 w-4 text-zinc-200 dark:text-zinc-800" />
                  ))}
                </div>
                <p className="text-xs text-zinc-500 font-medium">
                  Belum ada ulasan tertulis untuk produk ini.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
