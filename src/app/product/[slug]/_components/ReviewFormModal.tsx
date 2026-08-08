'use client'

import { useState, useMemo } from 'react'
import { FiX, FiStar, FiLoader, FiCheckCircle } from 'react-icons/fi'
import { FaStar } from 'react-icons/fa'
import { EligibleOrderForReview } from '@/core/types/review'
import { SupabaseReviewsService } from '@/services/supabase/reviews.service'
import { useAuth } from '@/components/providers/AuthProvider'
import Swal from 'sweetalert2'

interface ReviewFormModalProps {
  isOpen: boolean
  onClose: () => void
  productId: string
  productName: string
  productImageUrl: string
  eligibleOrders: EligibleOrderForReview[]
  onReviewSubmitted: () => void
}

export function ReviewFormModal({
  isOpen,
  onClose,
  productId,
  productName,
  productImageUrl,
  eligibleOrders,
  onReviewSubmitted,
}: ReviewFormModalProps) {
  const { user } = useAuth()
  const reviewsService = useMemo(() => new SupabaseReviewsService(), [])

  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    eligibleOrders[0]?.orderId || ''
  )
  const [rating, setRating] = useState<number>(0)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [comment, setComment] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  if (!isOpen) return null

  const selectedOrder = eligibleOrders.find((o) => o.orderId === selectedOrderId) || eligibleOrders[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Diperlukan',
        text: 'Silakan login terlebih dahulu untuk memberikan ulasan.',
        confirmButtonColor: '#e11d48',
      })
      return
    }

    if (rating < 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Pilih Rating Bintang',
        text: 'Wajib memberikan rating bintang (1 hingga 5) terlebih dahulu.',
        confirmButtonColor: '#e11d48',
      })
      return
    }

    if (!selectedOrder) {
      Swal.fire({
        icon: 'error',
        title: 'Transaksi Tidak Ditemukan',
        text: 'Tidak ada transaksi selesai yang valid untuk produk ini.',
        confirmButtonColor: '#e11d48',
      })
      return
    }

    setIsSubmitting(true)

    try {
      await reviewsService.createReview({
        orderId: selectedOrder.orderId,
        orderNumber: selectedOrder.orderNumber,
        productId,
        userId: user.id,
        rating,
        comment: comment.trim() ? comment.trim() : undefined,
        variantLabel: selectedOrder.variantLabel,
      })

      Swal.fire({
        icon: 'success',
        title: 'Ulasan Berhasil Dikirim!',
        text: 'Terima kasih atas ulasan dan penilaian Anda.',
        confirmButtonColor: '#e11d48',
        timer: 2000,
      })

      onReviewSubmitted()
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      Swal.fire({
        icon: 'error',
        title: 'Gagal Kirim Ulasan',
        text: msg || 'Terjadi kesalahan saat menyimpan ulasan.',
        confirmButtonColor: '#e11d48',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            Beri Penilaian & Ulasan
          </h3>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Summary */}
          <div className="flex gap-4 p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={productImageUrl}
              alt={productName}
              className="h-16 w-16 rounded-lg object-cover bg-white dark:bg-zinc-900 shrink-0 border border-zinc-200/60 dark:border-zinc-700"
            />
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                {productName}
              </h4>
              {selectedOrder?.variantLabel && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Varian: {selectedOrder.variantLabel}
                </p>
              )}
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                <FiCheckCircle className="h-3 w-3" /> Transaksi Terverifikasi #{selectedOrder?.orderNumber || ''}
              </span>
            </div>
          </div>

          {/* Select Order ID (If multiple eligible orders exist) */}
          {eligibleOrders.length > 1 && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Pilih Nomor Transaksi
              </label>
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {eligibleOrders.map((ord) => (
                  <option key={ord.orderId} value={ord.orderId}>
                    No. Pesanan #{ord.orderNumber} {ord.variantLabel ? `(${ord.variantLabel})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Star Rating Selection (REQUIRED) */}
          <div className="text-center space-y-2 py-2">
            <label className="block text-sm font-bold text-zinc-800 dark:text-zinc-200">
              Kualitas Produk <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const activeStar = (hoverRating || rating) >= star
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                  >
                    {activeStar ? (
                      <FaStar className="h-8 w-8 text-yellow-400" />
                    ) : (
                      <FiStar className="h-8 w-8 text-zinc-300 dark:text-zinc-600 hover:text-yellow-400" />
                    )}
                  </button>
                )
              })}
            </div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 h-4">
              {rating === 1 && 'Sangat Buruk'}
              {rating === 2 && 'Buruk'}
              {rating === 3 && 'Cukup'}
              {rating === 4 && 'Bagus'}
              {rating === 5 && 'Sangat Memuaskan!'}
            </p>
          </div>

          {/* Optional Review Comment Text */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Ulasan Tulis <span className="text-zinc-400 font-normal">(Opsional)</span>
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Bagikan pengalaman penggunaan produk ini (opsional)..."
              className="w-full text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 text-xs font-semibold text-zinc-600 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="h-4 w-4 animate-spin" /> Mengirim...
                </>
              ) : (
                'Kirim Penilaian'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
