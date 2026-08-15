'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiStar, FiMessageSquare, FiShoppingCart, FiHeart, FiCheck, FiLoader, FiEdit2 } from 'react-icons/fi'
import { FaWhatsapp, FaFacebook, FaInstagram, FaTiktok, FaLink, FaHeart, FaStar } from 'react-icons/fa'
import { Product, getProductSlug } from '@/core/types/product'
import { StoreSettings } from '@/core/types/store'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/components/providers/AuthProvider'
import { SupabaseWishlistService } from '@/services/supabase/wishlist.service'
import { SupabaseReviewsService } from '@/services/supabase/reviews.service'
import { SupabaseProductService } from '@/services/supabase/product.service'
import { ProductReview, ReviewEligibility } from '@/core/types/review'
import { ReviewFormModal } from './ReviewFormModal'
import Swal from 'sweetalert2'

interface ProductDetailContainerProps {
  product: Product
  settings: StoreSettings
  relatedProducts?: Product[]
  initialReviews?: ProductReview[]
}

export function ProductDetailContainer({ product, settings, relatedProducts = [], initialReviews = [] }: ProductDetailContainerProps) {
  const router = useRouter()
  const { addToCart, toggleAllCheck } = useCart()
  const { requireAuth, user } = useAuth()
  const wishlistService = useMemo(() => new SupabaseWishlistService(), [])
  const reviewsService = useMemo(() => new SupabaseReviewsService(), [])
  const productService = useMemo(() => new SupabaseProductService(), [])

  // State untuk Ulasan Real & Kelayakan Beri Ulasan & Total Unit Terjual
  const [reviews, setReviews] = useState<ProductReview[]>(initialReviews)
  const [loadingReviews, setLoadingReviews] = useState<boolean>(true)
  const [eligibility, setEligibility] = useState<ReviewEligibility>({ isEligible: false, eligibleOrders: [] })
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false)
  const [editingReview, setEditingReview] = useState<ProductReview | null>(null)
  const [soldCount, setSoldCount] = useState<number>(product.soldCount || 0)

  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isMounted = true
    const productId = product.id
    const userId = user?.id

    Promise.all([
      reviewsService.getProductReviews(productId),
      userId
        ? reviewsService.checkEligibility(userId, productId)
        : Promise.resolve({ isEligible: false, eligibleOrders: [] }),
      productService.getProductSoldCount(productId),
    ])
      .then(([fetchedReviews, userEligibility, count]) => {
        if (!isMounted) return
        setReviews(fetchedReviews)
        setEligibility(userEligibility)
        setSoldCount(count)
        setLoadingReviews(false)
      })
      .catch(() => {
        if (!isMounted) return
        setLoadingReviews(false)
      })

    return () => {
      isMounted = false
    }
  }, [product.id, user?.id, reviewsService, productService, reloadKey])

  const handleReviewSubmitted = () => {
    setReloadKey((prev) => prev + 1)
  }

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0
    const total = reviews.reduce((sum, r) => sum + r.rating, 0)
    return Number((total / reviews.length).toFixed(1))
  }, [reviews])
  
  // Use real product images, falling back to single imageUrl
  const galleryImages = product.images && product.images.length > 0
    ? product.images
    : [product.imageUrl]

  const productVariants = product.variants && product.variants.length > 0 ? product.variants : []

  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(productVariants[0] ?? '')
  const [quantity] = useState(1)
  const [activeTab, setActiveTab] = useState('desc') // 'desc' | 'reviews'
  const [isFavorited, setIsFavorited] = useState(false)
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false)
  const [favoriteCount, setFavoriteCount] = useState<number>(0)
  const [isCopied, setIsCopied] = useState(false)
  const [showAddSuccess, setShowAddSuccess] = useState(false)
  const [animateAddSuccess, setAnimateAddSuccess] = useState(false)

  const hasDiscount = product.isCampaign && product.originalPrice && product.originalPrice > product.price
  const discountPercentage = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0

  const handlePrevImage = () => {
    setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1))
  }

  const handleNextImage = () => {
    setActiveImageIdx((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0))
  }

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
    const rawPhone = settings.phone || '085175235717'
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '')
    // Indonesian prefix fix (convert 08 to 628)
    const formattedPhone = cleanPhone.startsWith('0') 
      ? '62' + cleanPhone.slice(1) 
      : cleanPhone
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(messageText)}`
  }

  const handleChatWA = () => {
    if (!requireAuth('menghubungi penjual via WhatsApp')) return
    const text = `Halo ${settings.name}, saya ingin bertanya mengenai produk "${product.name}" (Varian: ${selectedVariant}). Apakah produk ini ready stok?`
    window.open(getWhatsAppLink(text), '_blank')
  }

  const handleBuyNow = async () => {
    if (!requireAuth('melakukan pembelian langsung')) return
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
    if (!requireAuth('memulai percakapan chat')) return
    const event = new CustomEvent('open-chat-widget', {
      detail: {
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          variant: selectedVariant,
        },
      },
    })
    window.dispatchEvent(event)
  }



  const handleShare = (platform: 'wa' | 'fb' | 'ig' | 'tiktok' | 'link') => {
    if (typeof window === 'undefined') return
    const url = window.location.href
    const hasDiscount = product.isCampaign && product.originalPrice && product.originalPrice > product.price
    const discountPct = hasDiscount
      ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
      : 0
    const promoPrefix = hasDiscount ? `[Diskon ${discountPct}%] ` : ''
    const text = `${promoPrefix}${product.name} - Rp ${product.price.toLocaleString('id-ID')}`

    if (platform === 'wa') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + '\n\n' + url)}`, '_blank')
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

  // Load status favorit dan jumlah favorit dari Supabase saat mount
  useEffect(() => {
    wishlistService.getFavoriteStatus(String(product.id), user?.id).then((res) => {
      setFavoriteCount(res.count)
      setIsFavorited(res.isFavorited)
    }).catch(() => {})
  }, [user?.id, product.id, wishlistService])

  const handleToggleFavorite = async () => {
    if (!requireAuth('menambahkan produk ke favorit')) return
    if (isFavoriteLoading || !user?.id) return

    setIsFavoriteLoading(true)
    try {
      const nowFav = await wishlistService.toggle(user.id, String(product.id))
      setIsFavorited(nowFav)
      setFavoriteCount((prev) => Math.max(0, nowFav ? prev + 1 : prev - 1))
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: nowFav ? 'Produk dimasukkan ke Favorit Saya' : 'Produk dihapus dari Favorit Saya',
        showConfirmButton: false,
        timer: 2000
      })
    } catch {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Gagal mengubah status favorit',
        showConfirmButton: false,
        timer: 2000
      })
    } finally {
      setIsFavoriteLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!requireAuth('menambahkan produk ke keranjang')) return

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
    <div className="w-full space-y-3 md:space-y-6 font-sans">
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
        <div className="relative w-[calc(100%+2rem)] -mx-4 md:mx-0 md:w-full aspect-square rounded-none md:rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-900/40 border-y border-x-0 md:border border-zinc-100 dark:border-zinc-800 md:col-start-1 md:row-start-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={galleryImages[activeImageIdx]} 
            alt={product.name} 
            className="h-full w-full object-cover transition-all duration-300"
          />
        </div>

        {/* Row 2, Col 1: Gallery Thumbnails, Share Section & External CTAs */}
        <div className="flex flex-col gap-3 md:col-start-1 md:row-start-2 mt-2 md:mt-0">
          {/* Gallery Thumbnail Carousel */}
          {galleryImages.length > 1 && (
            <div className="flex-shrink-0 relative w-full max-w-[280px] sm:max-w-[380px] mx-auto px-8">
              {/* Left Chevron Button */}
              <button
                onClick={handlePrevImage}
                className="absolute left-1 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-100 bg-white/90 text-zinc-600 hover:text-zinc-900 z-20 transition-all active:scale-90 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-white cursor-pointer"
                title="Gambar sebelumnya"
              >
                <FiChevronLeft className="h-6 w-6" />
              </button>

              {/* Thumbnails Container */}
              <div className="relative overflow-hidden py-1">
                <div className="flex items-center justify-center gap-3 overflow-x-auto no-scrollbar">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative aspect-square w-14 rounded-lg overflow-hidden bg-zinc-50 border transition-all flex-shrink-0 cursor-pointer ${
                        activeImageIdx === idx 
                          ? 'border-sky-500 ring-2 ring-sky-500/30 scale-105' 
                          : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Chevron Button */}
              <button
                onClick={handleNextImage}
                className="absolute right-1 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-100 bg-white/90 text-zinc-600 hover:text-zinc-900 shadow-xs z-20 transition-all active:scale-90 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-white cursor-pointer"
                title="Gambar berikutnya"
              >
                <FiChevronRight className="h-6 w-6" />
              </button>
            </div>
          )}

          {/* Share Section (Desktop Only) */}
          <div className="hidden md:flex md:flex-row md:items-center gap-3 py-3 border-t border-zinc-100 dark:border-zinc-900 justify-start w-full">
            <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 block">Bagikan:</span>
            <div className="flex items-center justify-between md:justify-start gap-3 w-full md:w-auto">
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
            </div>
          </div>

          {/* External Contact Buttons (Desktop Only) */}
          <div className="hidden md:grid flex-shrink-0 grid-cols-2 gap-3 pt-1">
            <button 
              onClick={handleChatAdmin}
              className="flex items-center justify-center gap-2 rounded bg-zinc-100 dark:bg-zinc-800 py-2.5 px-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-[0.99]"
            >
              <FiMessageSquare className="h-4 w-4" />
              <span>Chat Admin</span>
            </button>

            <button 
              onClick={handleChatWA}
              className="flex items-center justify-center gap-2 rounded bg-zinc-100 dark:bg-zinc-800 py-2.5 px-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-[0.99]"
            >
              <FaWhatsapp className="h-4 w-4 text-green-500" />
              <span>Chat lewat WA</span>
            </button>
          </div>

          {/* Mobile-Only Product Details & Actions Section (md:hidden) */}
          <div className="block md:hidden space-y-5 pt-3 border-t border-zinc-100 dark:border-zinc-900/50">
            {/* 1. Title/Name */}
            <h1 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white leading-tight">
              {product.name}
            </h1>

            {/* 2. Price Display (Moved below Title) */}
            <div className="rounded-lg bg-slate-100/60 dark:bg-zinc-900 p-3.5 space-y-1">
              <span className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Harga Produk
              </span>
              <div className="flex items-center gap-2.5">
                <span className="text-xl font-bold text-red-500 dark:text-rose-500">
                  Rp{product.price.toLocaleString('id-ID')}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-xs text-zinc-400 line-through">
                      Rp{product.originalPrice!.toLocaleString('id-ID')}
                    </span>
                    <span className="rounded bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 text-[10px] font-semibold text-red-600 dark:text-red-400">
                      -{discountPercentage}%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* 3. Rating Box (4 Columns: Rating, Penilaian, Terjual, Favorit) */}
            <div className="grid grid-cols-4 divide-x divide-zinc-100 dark:divide-zinc-900 border-y border-zinc-100 dark:border-zinc-900 py-2 text-center bg-transparent">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-center gap-1 text-xs font-bold text-zinc-900 dark:text-white">
                  <FiStar
                    className={`h-3.5 w-3.5 shrink-0 fill-current -translate-y-[0.5px] ${
                      reviews.length > 0 && avgRating > 0
                        ? 'text-yellow-500'
                        : 'text-zinc-300 dark:text-zinc-600'
                    }`}
                  />
                  <span>{reviews.length > 0 ? avgRating.toFixed(1) : '0.0'}</span>
                </div>
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">rating</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-zinc-900 dark:text-white">{reviews.length}</span>
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">penilaian</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-zinc-900 dark:text-white">{soldCount}</span>
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">terjual</span>
              </div>
              <button
                onClick={handleToggleFavorite}
                disabled={isFavoriteLoading}
                className="flex flex-col items-center justify-center gap-0.5 hover:text-rose-500 transition-colors cursor-pointer outline-none disabled:opacity-50 disabled:cursor-wait"
              >
                <div className="flex items-center justify-center gap-1 text-xs font-bold text-zinc-900 dark:text-white">
                  {isFavorited ? (
                    <FaHeart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
                  ) : (
                    <FiHeart className="h-3.5 w-3.5 text-rose-500" />
                  )}
                  <span>{favoriteCount}</span>
                </div>
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">favorit</span>
              </button>
            </div>

            {/* 4. Share Section (Mobile-only copy, moved below Rating Box) */}
            <div className="flex flex-col gap-3 py-3 border-t border-zinc-100 dark:border-zinc-900 justify-start w-full">
              <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 block">Bagikan:</span>
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
            </div>

            {/* 4. Stock and Variant */}
            <div className="space-y-4 pt-1">
              {/* Stok Row (2 Columns) */}
              <div className="flex items-center gap-4">
                <span className="w-16 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Stok
                </span>
                <div className="flex-1 text-zinc-800 dark:text-zinc-200 font-semibold text-xs">
                  {product.stock}
                </div>
              </div>

              {/* Varian Row (New Row/Line for options in Mobile) */}
              {productVariants.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block">
                    Varian
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {productVariants.map((v) => (
                      <button
                        key={v}
                        onClick={() => setSelectedVariant(v)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide transition-all border outline-none ${
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
              )}
            </div>

            {/* 5. Checkout Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={handleAddToCart}
                className="flex items-center justify-center cursor-pointer gap-1.5 rounded bg-zinc-100 dark:bg-zinc-800 py-2.5 px-2 text-xs font-semibold tracking-wide hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all text-zinc-700 dark:text-zinc-200 active:scale-[0.99]"
              >
                <FiShoppingCart className="h-4 w-4" />
                <span>+Keranjang</span>
              </button>

              <button 
                onClick={handleBuyNow}
                className="flex items-center justify-center cursor-pointer rounded bg-zinc-950 dark:bg-white dark:text-zinc-950 text-white py-2.5 px-2 text-xs font-semibold tracking-wide hover:bg-zinc-900 dark:hover:bg-zinc-100 transition-all active:scale-[0.99]"
              >
                Beli Sekarang
              </button>
            </div>

            {/* 6. Contact Buttons (Chat Admin & WA) */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={handleChatAdmin}
                className="flex items-center justify-center gap-1.5 rounded bg-zinc-100 dark:bg-zinc-800 py-2.5 px-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-[0.99]"
              >
                <FiMessageSquare className="h-4 w-4" />
                <span>Chat Admin</span>
              </button>

              <button 
                onClick={handleChatWA}
                className="flex items-center justify-center gap-1.5 rounded bg-zinc-100 dark:bg-zinc-800 py-2.5 px-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-[0.99]"
              >
                <FaWhatsapp className="h-4 w-4 text-green-500" />
                <span>Chat lewat WA</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 1, Col 2: Metadata, Pricing, Variant Actions & Checkout Buttons (Desktop Only) */}
        <div className="hidden md:flex flex-col justify-between md:col-start-2 md:row-start-1 md:h-full gap-6">
          <div className="space-y-6">
            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white leading-tight">
              {product.name}
            </h1>

            {/* Rating Stats Box (4 Columns: Rating, Penilaian, Terjual, Favorit) */}
            <div className="grid grid-cols-4 divide-x divide-zinc-100 dark:divide-zinc-900 border-y border-zinc-100 dark:border-zinc-900 py-3 text-center bg-transparent">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-center gap-1 text-sm font-bold text-zinc-900 dark:text-white">
                  <FiStar
                    className={`h-4 w-4 shrink-0 fill-current -translate-y-[0.5px] ${
                      reviews.length > 0 && avgRating > 0
                        ? 'text-yellow-500'
                        : 'text-zinc-300 dark:text-zinc-600'
                    }`}
                  />
                  <span>{reviews.length > 0 ? avgRating.toFixed(1) : '0.0'}</span>
                </div>
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">rating</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-zinc-900 dark:text-white">{reviews.length}</span>
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">penilaian</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-zinc-900 dark:text-white">{soldCount}</span>
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">terjual</span>
              </div>
              <button
                onClick={handleToggleFavorite}
                disabled={isFavoriteLoading}
                className="flex flex-col items-center justify-center gap-0.5 hover:text-rose-500 transition-colors cursor-pointer outline-none disabled:opacity-50 disabled:cursor-wait"
              >
                <div className="flex items-center justify-center gap-1 text-sm font-bold text-zinc-900 dark:text-white">
                  {isFavorited ? (
                    <FaHeart className="h-4 w-4 text-rose-500 fill-rose-500" />
                  ) : (
                    <FiHeart className="h-4 w-4 text-rose-500" />
                  )}
                  <span>{favoriteCount}</span>
                </div>
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">favorit</span>
              </button>
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
              {productVariants.length > 0 && (
                <div className="flex items-center gap-4">
                  <span className="w-20 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Varian
                  </span>
                  <div className="flex-1 flex items-center gap-2.5 flex-wrap">
                    {productVariants.map((v) => (
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
              )}
            </div>
          </div>

          {/* Bottom Row Actions: Checkout Buttons */}
          <div className="grid grid-cols-2 gap-3 border-t border-zinc-100 dark:border-zinc-900 pt-5">
            <button 
              onClick={handleAddToCart}
              className="flex items-center justify-center cursor-pointer gap-2 rounded bg-zinc-100 dark:bg-zinc-800 py-3 px-4 text-xs font-semibold tracking-wide hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all text-zinc-700 dark:text-zinc-200 active:scale-[0.99]"
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
            Penilaian ({reviews.length})
          </button>
        </div>

        <div className="bg-slate-100/60 dark:bg-zinc-900 -mx-4 md:mx-0 rounded-none md:rounded-lg dark:border-zinc-800 px-6 pt-6 pb-10">
          {activeTab === 'desc' ? (
            <div className="prose dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-line space-y-4">
              <h3 className="text-zinc-900 dark:text-white font-extrabold text-base">
                {product.name}
              </h3>
              <div dangerouslySetInnerHTML={{ __html: product.description }} className="text-zinc-600 dark:text-zinc-300" />
              
              <h4 className="text-zinc-900 dark:text-white font-bold text-sm pt-2">Kenapa Harus Membeli di Toko Kami:</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Layanan Pelanggan responsif dan terpercaya via WhatsApp</li>
                <li>Jaminan kualitas barang lokal premium buatan anak bangsa</li>
              </ul>
            </div>
          ) : (
            <div className="py-2 space-y-6">
              {/* Overall Rating Score Card & Write Review Action */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-zinc-950 p-6 rounded-xl dark:border-zinc-850/80">
                <div className="flex items-center gap-6">
                  <div className="text-center shrink-0">
                    <span className="text-5xl font-extrabold text-zinc-950 dark:text-white">
                      {avgRating.toFixed(1)}
                    </span>
                    <span className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mt-1.5">
                      dari 5
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <FaStar
                          key={s}
                          className={`h-5 w-5 ${
                            s <= Math.round(avgRating)
                              ? 'text-yellow-400'
                              : 'text-zinc-200 dark:text-zinc-700'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                      Dari {reviews.length} ulasan pembeli
                    </p>
                  </div>
                </div>

                {/* Write Review Button (Shown if Eligible) */}
                {eligibility.isEligible && (
                  <button
                    onClick={() => setIsReviewModalOpen(true)}
                    className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 self-start md:self-auto"
                  >
                    <FiMessageSquare className="h-4 w-4" />
                    <span>Tulis Ulasan</span>
                  </button>
                )}
              </div>

              {/* Real Reviews List */}
              {loadingReviews ? (
                <div className="flex items-center justify-center py-12 text-zinc-400 gap-2 text-xs font-semibold">
                  <FiLoader className="h-5 w-5 animate-spin" /> Memuat ulasan...
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <FiStar className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Belum ada ulasan untuk produk ini
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                    Jadilah pembeli pertama yang memberikan ulasan setelah menyelesaikan pembelian.
                  </p>
                </div>
              ) : (
                <div className="space-y-6 divide-y divide-zinc-200/65 dark:divide-zinc-850">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="pt-5 first:pt-0 flex gap-4">
                      {/* Avatar */}
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200/50 dark:border-zinc-700/50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={rev.userAvatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(rev.userName)}`} 
                          alt={rev.userName} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      {/* Content */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{rev.userName}</h5>
                              {user?.id === rev.userId && (
                                <button
                                  onClick={() => {
                                    setEditingReview(rev)
                                    setIsReviewModalOpen(true)
                                  }}
                                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <FiEdit2 className="h-3 w-3" /> Edit Ulasan
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                              {new Date(rev.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                              {rev.variantLabel ? ` | Varian: ${rev.variantLabel}` : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <FaStar
                                key={s}
                                className={`h-4 w-4 ${
                                  s <= rev.rating ? 'text-yellow-400' : 'text-zinc-200 dark:text-zinc-700'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Comment text (Optional) */}
                        {rev.comment ? (
                          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                            {rev.comment}
                          </p>
                        ) : (
                          <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">
                            (Pengguna memberikan penilaian bintang tanpa menulis komentar)
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-6">
            {relatedProducts.map((p) => {
              const pHasDiscount = p.isCampaign && p.originalPrice && p.originalPrice > p.price
              const pDiscountPct = pHasDiscount
                ? Math.round(((p.originalPrice! - p.price) / p.originalPrice!) * 100)
                : 0
              return (
                <Link
                  key={p.id}
                  href={`/product/${getProductSlug(p)}`}
                  className="group flex flex-col rounded md:rounded-xl bg-white overflow-hidden hover:shadow-md transition-all duration-300 border border-zinc-100 dark:border-zinc-800/60 dark:bg-zinc-900/40"
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
                      <div className="flex items-center gap-1">
                        <FiStar
                          className={`h-3 w-3 shrink-0 fill-current -translate-y-[0.5px] ${
                            p.rating > 0
                              ? 'text-yellow-500'
                              : 'text-zinc-300 dark:text-zinc-600'
                          }`}
                        />
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                          {p.rating > 0 ? p.rating.toFixed(1) : '0.0'}
                        </span>
                      </div>
                      <span className="text-zinc-300 dark:text-zinc-700">|</span>
                      <span>{p.soldCount.toLocaleString('id-ID')} Terjual</span>
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

      {/* Form Modal untuk Tulis / Edit Ulasan Real */}
      <ReviewFormModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false)
          setEditingReview(null)
        }}
        productId={product.id}
        productName={product.name}
        productImageUrl={product.imageUrl}
        eligibleOrders={eligibility.eligibleOrders}
        initialReview={editingReview}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  )
}
