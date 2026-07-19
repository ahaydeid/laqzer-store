"use client"

import React, { useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { FiPlus, FiMinus, FiShoppingBag, FiArrowLeft, FiChevronDown } from 'react-icons/fi'
import Swal from 'sweetalert2'

export function CartContainer() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const {
    items,
    loading,
    removeFromCart,
    updateQuantity,
    toggleCheckItem,
    toggleAllCheck,
    updateVariant,
  } = useCart()

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?next=/cart')
    }
  }, [user, authLoading, router])

  if (authLoading || !user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-xs text-zinc-400 font-medium">Memeriksa status login...</p>
      </div>
    )
  }



  // 1. Calculate checked items and subtotal
  const checkedItems = items.filter((item) => item.checked)
  const isAllChecked = items.length > 0 && items.every((item) => item.checked)
  const checkedCount = checkedItems.reduce((acc, item) => acc + item.quantity, 0)
  
  const subtotal = checkedItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  )




  const handleCheckout = () => {
    if (checkedItems.length === 0) {
      Swal.fire({
        title: 'Keranjang Kosong',
        text: 'Pilih minimal 1 produk untuk melakukan checkout.',
        icon: 'warning',
        confirmButtonColor: '#18181b',
        confirmButtonText: 'Paham',
      })
      return
    }

    router.push('/checkout')
  }

  const handleRemoveSelected = () => {
    if (checkedItems.length === 0) return
    Swal.fire({
      title: 'Hapus Produk?',
      text: `Apakah Anda yakin ingin menghapus ${checkedItems.length} produk terpilih dari keranjang?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#18181b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        checkedItems.forEach((item) => removeFromCart(item.id))
        Swal.fire({
          title: 'Berhasil!',
          text: 'Produk terpilih telah dihapus.',
          icon: 'success',
          confirmButtonColor: '#18181b',
        })
      }
    })
  }

  if (loading && items.length === 0) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white" />
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Memuat keranjang...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600 mb-6">
          <FiShoppingBag className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">
          Keranjang Belanja Anda Kosong
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-8">
          Sepertinya Anda belum menambahkan produk apa pun ke dalam keranjang belanja. Yuk cari produk menarik sekarang!
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 text-white px-6 py-3 text-sm font-semibold tracking-wide hover:bg-zinc-900 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 transition-colors"
        >
          <FiArrowLeft className="h-4 w-4" />
          <span>Kembali Belanja</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-32">
      {/* Page Header */}
      <div className="flex flex-col gap-3 border-b border-zinc-100 dark:border-zinc-900 pb-5">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
        >
          <FiArrowLeft className="h-3.5 w-3.5" />
          <span>Lanjutkan Belanja</span>
        </Link>
        <h2 className="text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
          Keranjang Saya
        </h2>
      </div>

      {/* Main Full-Width Card (Shopee Reference Table Layout) */}
      <div className="overflow-hidden rounded bg-white dark:bg-zinc-950">
        
        {/* Desktop Table View */}
        <table className="hidden md:table w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              <th className="py-4 px-6 w-12 text-center" />
              <th className="py-4 px-4">Produk</th>
              <th className="py-4 px-4 whitespace-nowrap">Variasi</th>
              <th className="py-4 px-4 whitespace-nowrap">Harga Satuan</th>
              <th className="py-4 px-4 text-center whitespace-nowrap">Kuantitas</th>
              <th className="py-4 px-6 text-center whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
            {items.map((item) => (
              <tr
                key={item.id}
                className={`transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 ${
                  item.checked ? 'bg-zinc-50/10 dark:bg-zinc-900/5' : ''
                }`}
              >
                <td className="py-5 px-6 text-center align-middle">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleCheckItem(item.id)}
                    className="h-4.5 w-4.5 rounded border-zinc-300 text-rose-500 accent-rose-500 focus:ring-rose-500 dark:border-zinc-800 dark:bg-zinc-950 cursor-pointer"
                  />
                </td>
                <td className="py-5 px-4 align-middle">
                  <div className="flex gap-4">
                    <Link
                      href={`/product/${item.productId}`}
                      className="block shrink-0 transition-opacity hover:opacity-90"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-20 w-20 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                      />
                    </Link>
                    <div className="flex flex-col justify-center min-w-0 max-w-[200px] lg:max-w-[400px]">
                      <Link
                        href={`/product/${item.productId}`}
                        className="text-sm font-semibold text-zinc-900 hover:text-zinc-600 dark:text-white dark:hover:text-zinc-300 truncate transition-colors"
                      >
                        {item.name}
                      </Link>
                    </div>
                  </div>
                </td>
                {/* Variasi Column with Shopee Bordered Dropdown Style */}
                <td className="py-5 px-4 align-middle whitespace-nowrap">
                  <div className="relative inline-block">
                    <select
                      value={item.variant}
                      onChange={(e) => updateVariant(item.id, e.target.value)}
                      style={{ width: `${(8 + item.variant.length) * 6.8 + 36}px` }}
                      className="appearance-none pr-8 pl-2.5 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
                    >
                      {item.variants && item.variants.length > 0 ? (
                        item.variants.map((v) => (
                          <option key={v} value={v}>
                            Varian: {v}
                          </option>
                        ))
                      ) : (
                        <option value={item.variant}>
                          Varian: {item.variant}
                        </option>
                      )}
                    </select>
                    <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400 pointer-events-none" />
                  </div>
                </td>
                <td className="py-5 px-4 align-middle text-sm font-semibold text-rose-500 whitespace-nowrap">
                  Rp {item.price.toLocaleString('id-ID')}
                </td>
                <td className="py-5 px-4 align-middle whitespace-nowrap">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="flex items-center rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                      >
                        <FiMinus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-10 text-center text-xs font-bold text-zinc-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="p-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors disabled:opacity-30"
                      >
                        <FiPlus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {item.stock - item.quantity <= 5 ? (
                      <span className="text-[10px] text-rose-500 font-semibold">
                        tersisa {item.stock - item.quantity} buah
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                        stok: {item.stock}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-5 px-6 align-middle text-center whitespace-nowrap">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-xs font-semibold text-zinc-600 hover:text-rose-500 dark:text-zinc-400 dark:hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile View (Stacked List Cards) */}
        <div className="block md:hidden divide-y divide-zinc-100 dark:divide-zinc-900">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex gap-3 p-4 bg-white transition-all dark:bg-zinc-950 ${
                item.checked ? 'bg-zinc-50/5 dark:bg-zinc-900/5' : ''
              }`}
            >
              {/* Checkbox */}
              <div className="flex items-start pt-1.5">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleCheckItem(item.id)}
                  className="h-4.5 w-4.5 rounded border-zinc-300 text-rose-500 accent-rose-500 focus:ring-rose-500 dark:border-zinc-800 dark:bg-zinc-950 cursor-pointer"
                />
              </div>

              {/* Product Image */}
              <Link
                href={`/product/${item.productId}`}
                className="block shrink-0 transition-opacity hover:opacity-90"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-20 w-20 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                />
              </Link>

              {/* Product details */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <Link
                      href={`/product/${item.productId}`}
                      className="text-xs font-bold text-zinc-900 hover:text-zinc-600 dark:text-white dark:hover:text-zinc-300 truncate transition-colors"
                    >
                      {item.name}
                    </Link>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[11px] font-semibold text-zinc-400 hover:text-rose-500 dark:text-zinc-500 transition-colors shrink-0"
                    >
                      Hapus
                    </button>
                  </div>
                  <div className="relative inline-block mt-1.5">
                    <select
                      value={item.variant}
                      onChange={(e) => updateVariant(item.id, e.target.value)}
                      style={{ width: `${(8 + item.variant.length) * 5.8 + 28}px` }}
                      className="appearance-none pr-6 pl-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
                    >
                      {item.variants && item.variants.length > 0 ? (
                        item.variants.map((v) => (
                          <option key={v} value={v}>
                            Varian: {v}
                          </option>
                        ))
                      ) : (
                        <option value={item.variant}>
                          Varian: {item.variant}
                        </option>
                      )}
                    </select>
                    <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-2.5 w-2.5 text-zinc-400 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-end justify-between mt-3">
                  <span className="text-xs font-bold text-rose-500">
                    Rp {item.price.toLocaleString('id-ID')}
                  </span>
                  
                  {/* Quantity Counter */}
                  <div className="flex flex-col items-end gap-1 scale-90 origin-bottom-right">
                    <div className="flex items-center rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                      >
                        <FiMinus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-[11px] font-bold text-zinc-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="p-1 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 disabled:opacity-30"
                      >
                        <FiPlus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>



      </div>

      {/* Sticky Bottom Full-Width Checkout Bar (Shopee Pinned Style) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 w-full bg-transparent pointer-events-none">
        <div className="mx-auto max-w-7xl px-0 md:px-6 lg:px-8">
          <div className="bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 rounded-none md:rounded-t py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-auto">
            
            {/* Left Actions */}
            <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="select-all-bottom"
                  checked={isAllChecked}
                  onChange={(e) => toggleAllCheck(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-zinc-300 text-rose-500 accent-rose-500 focus:ring-rose-500 dark:border-zinc-800 dark:bg-zinc-950 cursor-pointer"
                />
                <label htmlFor="select-all-bottom" className="text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  Pilih Semua ({items.length})
                </label>
              </div>
              
              <button
                onClick={handleRemoveSelected}
                disabled={checkedItems.length === 0}
                className="text-xs font-medium text-zinc-500 hover:text-rose-500 disabled:text-zinc-300 dark:disabled:text-zinc-700 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Hapus Terpilih
              </button>
            </div>

            {/* Right Summary & Checkout Button */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto justify-end">
              
              {/* Total summary calculations */}
              <div className="text-center sm:text-right w-full sm:w-auto flex justify-between sm:block gap-4 items-center">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 sm:block">
                  Total ({checkedCount} produk):
                </span>
                <span className="text-lg sm:text-xl font-bold text-rose-500 sm:block sm:mt-0.5">
                  Rp {subtotal.toLocaleString('id-ID')}
                </span>
              </div>

              {/* Checkout button */}
              <button
                onClick={handleCheckout}
                disabled={checkedItems.length === 0}
                className="w-full sm:w-56 flex items-center justify-center rounded bg-rose-500 hover:bg-rose-600 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 text-white font-bold text-sm py-3 px-6 transition-all shadow disabled:text-zinc-400 dark:disabled:text-zinc-500 cursor-pointer active:scale-[0.98]"
              >
                Checkout ({checkedCount})
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
