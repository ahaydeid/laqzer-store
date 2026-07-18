'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiStar, FiMessageSquare, FiShoppingCart, FiHeart, FiCheck } from 'react-icons/fi'
import { FaWhatsapp, FaFacebook, FaInstagram, FaTiktok, FaLink, FaHeart } from 'react-icons/fa'
import { Product } from '@/core/types/product'
import { StoreSettings } from '@/core/types/store'
import { useCart } from '@/context/CartContext'
import Swal from 'sweetalert2'

interface ProductDetailContainerProps {
  product: Product
  settings: StoreSettings
  relatedProducts?: Product[]
}

export function ProductDetailContainer({ product, settings, relatedProducts = [] }: ProductDetailContainerProps) {
  const router = useRouter()
  const { addToCart, toggleAllCheck } = useCart()
  
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
  const [quantity] = useState(1)
  const [activeTab, setActiveTab] = useState('desc') // 'desc' | 'reviews'
  const [isFavorited, setIsFavorited] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [showAddSuccess, setShowAddSuccess] = useState(false)
  const [animateAddSuccess, setAnimateAddSuccess] = useState(false)

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

  // Handle copy timer reset
  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isCopied])



  const getWhatsAppLink = (messageText: string) => {
    const rawPhone = settings.phone || '081234567890'
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '')
    // Indonesian prefix fix (convert 08 to 628)
    const formattedPhone = cleanPhone.startsWith('0') 
      ? '62' + cleanPhone.slice(1) 
      : cleanPhone
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(messageText)}`
  }

  const handleChatWA = () => {
    const text = `Halo ${settings.name}, saya ingin bertanya mengenai produk "${product.name}" (Varian: ${selectedVariant}). Apakah produk ini ready stok?`
    window.open(getWhatsAppLink(text), '_blank')
  }

  const handleBuyNow = async () => {
    try {
      // 1. Uncheck all other items in the cart to isolate this purchase
      await toggleAllCheck(false)
      // 2. Add the current product to the cart (always sets checked = true)
      await addToCart(product.id, selectedVariant, quantity)
      // 3. Redirect directly to the checkout page with only this item
      router.push('/checkout')
    } catch (error) {
      console.error('Failed to process Buy Now:', error)
      Swal.fire({
        title: 'Gagal!',
        text: 'Gagal memproses pesanan langsung.',
        icon: 'error',
        confirmButtonColor: '#18181b',
        confirmButtonText: 'Oke',
      })
    }
  }

  const handleChatAdmin = () => {
    const event = new CustomEvent('open-chat-widget', {
      detail: {
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          variant: selectedVariant,
        }
      }
    })
    window.dispatchEvent(event)
  }



  const handleShare = (platform: 'wa' | 'fb' | 'ig' | 'tiktok' | 'link') => {
    if (typeof window === 'undefined') return
    const url = window.location.href
    const text = `Lihat produk menarik ini: ${product.name} di Laqzer Store!`

    if (platform === 'wa') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`, '_blank')
    } else if (platform === 'fb') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
    } else if (platform === 'ig') {
      navigator.clipboard.writeText(url)
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Tautan disalin! Silakan bagikan di Instagram.',
        showConfirmButton: false,
        timer: 2000
      })
      window.open('https://instagram.com', '_blank')
    } else if (platform === 'tiktok') {
      navigator.clipboard.writeText(url)
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Tautan disalin! Silakan bagikan di TikTok.',
        showConfirmButton: false,
        timer: 2000
      })
      window.open('https://tiktok.com', '_blank')
    } else if (platform === 'link') {
      navigator.clipboard.writeText(url)
      setIsCopied(true)
    }
  }

  const handleToggleFavorite = () => {
    setIsFavorited((prev) => {
      const next = !prev
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: next ? 'Produk dimasukkan ke Favorit Saya' : 'Produk dihapus dari Favorit Saya',
        showConfirmButton: false,
        timer: 2000
      })
      return next
    })
  }

  const handleAddToCart = async () => {
    let flyImgEl: HTMLImageElement | null = null
    const activeTimeouts: NodeJS.Timeout[] = []

    const cleanupUI = () => {
      if (flyImgEl) {
        flyImgEl.remove()
      }
      activeTimeouts.forEach(clearTimeout)
      setAnimateAddSuccess(false)
      setShowAddSuccess(false)
    }

    try {
      // 1. Show modal instantly
      setShowAddSuccess(true)
      const t1 = setTimeout(() => {
        setAnimateAddSuccess(true)
      }, 10)
      activeTimeouts.push(t1)

      // 2. Fly to Cart Animation
      const t2 = setTimeout(() => {
        const modalImg = document.getElementById('modal-success-image')
        const cartBtn = document.getElementById('navbar-cart-button')
        if (modalImg && cartBtn) {
          const startRect = modalImg.getBoundingClientRect()
          const endRect = cartBtn.getBoundingClientRect()

          const flyImg = document.createElement('img')
          flyImg.src = product.imageUrl
          flyImg.style.position = 'fixed'
          flyImg.style.left = `${startRect.left}px`
          flyImg.style.top = `${startRect.top}px`
          flyImg.style.width = `${startRect.width}px`
          flyImg.style.height = `${startRect.height}px`
          flyImg.style.objectFit = 'cover'
          flyImg.style.borderRadius = '4px'
          flyImg.style.zIndex = '9999'
          flyImg.style.pointerEvents = 'none'
          flyImg.style.transition = 'all 0.7s cubic-bezier(0.42, 0, 0.58, 1)'
          document.body.appendChild(flyImg)
          flyImgEl = flyImg

          const tFly = setTimeout(() => {
            flyImg.style.left = `${endRect.left + endRect.width / 2 - 12}px`
            flyImg.style.top = `${endRect.top + endRect.height / 2 - 12}px`
            flyImg.style.width = '24px'
            flyImg.style.height = '24px'
            flyImg.style.opacity = '0.3'
          }, 50)
          activeTimeouts.push(tFly)

          const tClean = setTimeout(() => {
            flyImg.remove()
            flyImgEl = null
            cartBtn.classList.add('scale-125')
            const tPop = setTimeout(() => {
              cartBtn.classList.remove('scale-125')
            }, 200)
            activeTimeouts.push(tPop)
          }, 750)
          activeTimeouts.push(tClean)
        }
      }, 400)
      activeTimeouts.push(t2)

      // 3. Close modal animation start
      const t3 = setTimeout(() => {
        setAnimateAddSuccess(false)
      }, 400)
      activeTimeouts.push(t3)

      // 4. Unmount modal
      const t4 = setTimeout(() => {
        setShowAddSuccess(false)
      }, 700)
      activeTimeouts.push(t4)

      // 5. Run async service addition in background (non-blocking)
      addToCart(product.id, selectedVariant, quantity).catch((error) => {
        console.error('Failed to add to cart in background:', error)
        cleanupUI()
        Swal.fire({
          title: 'Gagal!',
          text: 'Gagal menambahkan produk ke keranjang.',
          icon: 'error',
          confirmButtonColor: '#18181b',
          confirmButtonText: 'Oke',
        })
      })

    } catch (error) {
      console.error('Error in handleAddToCart:', error)
      cleanupUI()
      Swal.fire({
        title: 'Gagal!',
        text: 'Gagal menambahkan produk ke keranjang.',
        icon: 'error',
        confirmButtonColor: '#18181b',
        confirmButtonText: 'Oke',
      })
    }
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

      {/* Main product presentation grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-3 items-stretch">
        
        {/* Row 1, Col 1: Main Display Image */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 md:col-start-1 md:row-start-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={galleryImages[activeImageIdx]} 
            alt={product.name} 
            className="h-full w-full object-cover transition-all duration-300"
          />
        </div>

        {/* Row 2, Col 1: Gallery Thumbnails, Share Section & External CTAs */}
        <div className="flex flex-col gap-3 md:col-start-1 md:row-start-2 mt-2 md:mt-0">
          {/* Gallery Thumbnail Carousel (Centered Sliding Track with Gradient Overlays) */}
          <div className="flex-shrink-0 relative w-full max-w-[280px] sm:max-w-[380px] mx-auto px-8">
            {/* Left Chevron Button */}
            <button
              onClick={handlePrevImage}
              disabled={virtualIdx === 0}
              className="absolute left-1 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-100 bg-white/90 text-zinc-600 hover:text-zinc-900 z-20 transition-all active:scale-90 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none"
            >
              <FiChevronLeft className="h-6 w-6" />
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
                          ? 'border-sky-500 ring-1 ring-sky-500/30 scale-110' 
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
              className="absolute right-1 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-100 bg-white/90 text-zinc-600 hover:text-zinc-900 shadow-xs z-20 transition-all active:scale-90 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              <FiChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Share Section */}
          <div className="flex items-center gap-3 py-3 border-t border-zinc-100 dark:border-zinc-900 justify-start">
            <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Bagikan:</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleShare('wa')}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors cursor-pointer dark:bg-green-950/20 dark:text-green-400"
                title="Bagikan ke WhatsApp"
              >
                <FaWhatsapp className="h-5.5 w-5.5" />
              </button>
              <button
                onClick={() => handleShare('fb')}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer dark:bg-blue-950/20 dark:text-blue-400"
                title="Bagikan ke Facebook"
              >
                <FaFacebook className="h-5.5 w-5.5" />
              </button>
              <button
                onClick={() => handleShare('ig')}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors cursor-pointer dark:bg-pink-950/20 dark:text-pink-400"
                title="Bagikan ke Instagram"
              >
                <FaInstagram className="h-5.5 w-5.5" />
              </button>
              <button
                onClick={() => handleShare('tiktok')}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-800 hover:bg-zinc-200 transition-colors cursor-pointer dark:bg-zinc-800/40 dark:text-zinc-200"
                title="Bagikan ke TikTok"
              >
                <FaTiktok className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleShare('link')}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors cursor-pointer ${
                  isCopied
                    ? 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                }`}
                title="Salin Tautan"
              >
                {isCopied ? <FiCheck className="h-5.5 w-5.5" /> : <FaLink className="h-5 w-5" />}
              </button>
            </div>

            {/* Vertical Separator */}
            <div className="ml-auto h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1.5" />

            {/* Favorite Button */}
            <button
              onClick={handleToggleFavorite}
              className="flex items-center gap-1.5 text-sm font-semibold text-zinc-600 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 transition-colors cursor-pointer outline-none"
              title={isFavorited ? "Hapus dari Favorit Saya" : "Masukkan ke Favorit Saya"}
            >
              {isFavorited ? (
                <FaHeart className="h-5.5 w-5.5 text-rose-500 fill-rose-500" />
              ) : (
                <FiHeart className="h-5.5 w-5.5 text-rose-500" />
              )}
              <span>Favorit ({isFavorited ? '10,9RB' : '10,8RB'})</span>
            </button>
          </div>

          {/* External Contact Buttons */}
          <div className="flex-shrink-0 grid grid-cols-2 gap-3 pt-1">
            <button 
              onClick={handleChatAdmin}
              className="flex items-center justify-center gap-2 border border-zinc-200 py-2.5 px-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-all bg-white dark:bg-zinc-950"
            >
              <FiMessageSquare className="h-4 w-4" />
              <span>Chat Admin</span>
            </button>

            <button 
              onClick={handleChatWA}
              className="flex items-center justify-center gap-2 border border-zinc-200 py-2.5 px-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-all bg-white dark:bg-zinc-950"
            >
              <FaWhatsapp className="h-4 w-4 text-green-500" />
              <span>Chat lewat WA</span>
            </button>
          </div>
        </div>

        {/* Row 1, Col 2: Metadata, Pricing, Variant Actions & Checkout Buttons */}
        <div className="flex flex-col justify-between md:col-start-2 md:row-start-1 md:h-full gap-6">
          <div className="space-y-6">
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
                    <span className="rounded-md bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400">
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
                <div className="flex-1 flex items-center gap-1.5 text-emerald-500 dark:text-zinc-200 font-semibold">
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
          <div className="grid grid-cols-2 gap-3 border-t border-zinc-100 dark:border-zinc-900 pt-5">
            <button 
              onClick={handleAddToCart}
              className="flex items-center justify-center cursor-pointer gap-2 rounded border border-zinc-200 py-3 px-4 text-xs font-semibold tracking-wide hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 transition-all text-zinc-900 dark:text-white"
            >
              <FiShoppingCart className="h-4 w-4" />
              <span>Masukkan Keranjang</span>
            </button>

            <button 
              onClick={handleBuyNow}
              className="flex items-center justify-center cursor-pointer rounded bg-zinc-950 dark:bg-white dark:text-zinc-950 text-white py-3 px-4 text-xs font-semibold tracking-wide hover:bg-zinc-900 dark:hover:bg-zinc-100 transition-all active:scale-[0.99]"
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
            className={`pb-2 text-sm font-semibold cursor-pointer tracking-tight border-b-2 transition-all outline-none ${
              activeTab === 'desc' 
                ? 'border-zinc-950 text-zinc-950 dark:border-white dark:text-white' 
                : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
          >
            Deskripsi Produk
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`pb-2 text-sm font-semibold cursor-pointer tracking-tight border-b-2 transition-all outline-none ${
              activeTab === 'reviews' 
                ? 'border-zinc-950 text-zinc-950 dark:border-white dark:text-white' 
                : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
          >
            Penilaian (3)
          </button>
        </div>

        <div className="bg-slate-100/60 dark:bg-zinc-900 rounded-lg dark:border-zinc-800 px-6 pt-6 pb-10">
          {activeTab === 'desc' ? (
            <div className="prose dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-line space-y-4">
              <h3 className="text-zinc-900 dark:text-white font-extrabold text-base">
                {product.name} - Premium Quality Product
              </h3>
              <p>{product.description}</p>
              
              <h4 className="text-zinc-900 dark:text-white font-bold text-sm pt-2">Kenapa Harus Membeli di Toko Kami:</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Layanan Pelanggan responsif dan terpercaya via WhatsApp</li>
                <li>Jaminan kualitas barang lokal premium buatan anak bangsa</li>
              </ul>
            </div>
          ) : (
            <div className="py-2 space-y-6">
              {/* Overall Rating Score Card */}
              <div className="flex items-center gap-6 bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-100 dark:border-zinc-850/80">
                <div className="text-center shrink-0">
                  <span className="text-5xl font-extrabold text-zinc-950 dark:text-white">
                    {product.rating ? product.rating.toFixed(1) : "4.9"}
                  </span>
                  <span className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mt-1.5">
                    dari 5
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <FiStar key={s} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                    Dari 3 ulasan
                  </p>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-6 divide-y divide-zinc-200/65 dark:divide-zinc-850">
                {/* Review 1 */}
                <div className="pt-5 first:pt-0 flex gap-4">
                  {/* Avatar */}
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200/50 dark:border-zinc-700/50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent("Budi S.")}`} 
                      alt="Budi S." 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h5 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Budi S.</h5>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Varian: Hitam • 2 minggu lalu</p>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <FiStar key={s} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                      Kualitas produk sangat bagus, bahan tebal dan halus. Pengemasan rapi dan pengiriman super cepat. Terima kasih!
                    </p>
                  </div>
                </div>

                {/* Review 2 */}
                <div className="pt-5 flex gap-4">
                  {/* Avatar */}
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200/50 dark:border-zinc-700/50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent("Dewi K.")}`} 
                      alt="Dewi K." 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h5 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Dewi K.</h5>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Varian: Putih • 1 bulan lalu</p>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <FiStar key={s} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                      Bagus sekali kemejanya, pas di badan. Jahitannya rapi dan bahannya dingin saat dipakai. Recommended seller!
                    </p>
                  </div>
                </div>

                {/* Review 3 */}
                <div className="pt-5 flex gap-4">
                  {/* Avatar */}
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200/50 dark:border-zinc-700/50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent("Ahmad F.")}`} 
                      alt="Ahmad F." 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h5 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Ahmad F.</h5>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Varian: Hitam • 1 bulan lalu</p>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {[1, 2, 3, 4].map((s) => (
                          <FiStar key={s} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        ))}
                        <FiStar className="h-4 w-4 text-zinc-200 dark:text-zinc-800" />
                      </div>
                    </div>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                      Bahan adem, ukuran pas sesuai deskripsi. Cuma pengiriman kurir JNE agak telat sehari dari biasanya, tapi overall oke banget.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-12 space-y-6">
          <h3 className="text-xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Produk Lainnya
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => {
              const pHasDiscount = p.originalPrice && p.originalPrice > p.price
              const pDiscountPct = pHasDiscount
                ? Math.round(((p.originalPrice! - p.price) / p.originalPrice!) * 100)
                : 0
              return (
                <Link
                  key={p.id}
                  href={`/product/${p.id}`}
                  className="group flex flex-col rounded-xl bg-white overflow-hidden hover:shadow-md transition-all duration-300 border border-zinc-100 dark:border-zinc-800/60 dark:bg-zinc-900/40"
                >
                  {/* Image */}
                  <div className="relative aspect-square w-full overflow-hidden bg-zinc-50 dark:bg-zinc-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {pHasDiscount && (
                      <span className="absolute top-0 left-0 rounded-br-lg bg-red-500 px-2.5 py-1 text-xs font-semibold text-white uppercase tracking-wider">
                        -{pDiscountPct}%
                      </span>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex flex-col p-3.5 gap-1.5">
                    <h4 className="line-clamp-2 text-xs font-semibold leading-relaxed text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                      {p.name}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                      <div className="flex items-center gap-0.5 text-yellow-500">
                        <FiStar className="h-3 w-3 fill-current" />
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">{p.rating}</span>
                      </div>
                      <span className="text-zinc-300 dark:text-zinc-700">|</span>
                      <span>{p.soldCount.toLocaleString('id-ID')}+ Terjual</span>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-1.5 pt-0.5">
                      <span className="text-sm font-bold text-zinc-900 dark:text-white">
                        Rp{p.price.toLocaleString('id-ID')}
                      </span>
                      {pHasDiscount && (
                        <span className="text-xs text-zinc-400 line-through">
                          Rp{p.originalPrice!.toLocaleString('id-ID')}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Native React Toast/Modal overlay for Cart Success Notification */}
      {showAddSuccess && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-transparent transition-opacity duration-300 ${animateAddSuccess ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`bg-white dark:bg-zinc-950 shadow-xl rounded w-[280px] p-4 text-center font-sans transition-all duration-300 transform ${animateAddSuccess ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img id="modal-success-image" src={product.imageUrl} className="w-48 h-48 object-cover rounded mx-auto mb-3" alt={product.name} />
            <div>
              <h4 className="text-base font-bold text-zinc-900 dark:text-white leading-tight">{product.name}</h4>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Varian: {selectedVariant} | Jumlah: {quantity}x</p>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
