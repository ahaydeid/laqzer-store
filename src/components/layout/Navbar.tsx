'use client'

import { useState, useEffect, useRef } from 'react'
import { FiSearch, FiShoppingCart, FiChevronDown, FiMenu, FiX } from 'react-icons/fi'
import Link from 'next/link'
import { FaRegUserCircle } from 'react-icons/fa'
import { StoreSettings } from '@/core/types/store'
import { Category } from '@/core/types/category'
import { useCart } from '@/context/CartContext'
import { usePathname } from 'next/navigation'

interface NavbarProps {
  settings: StoreSettings
  categories: Category[]
}

export function Navbar({ settings, categories }: NavbarProps) {
  const { cartCount, items } = useCart()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori')
  const [showDropdown, setShowDropdown] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])


  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/img/logo-laqzer.jpg" 
                alt="Logo" 
                className="h-8 w-8 rounded-lg object-cover" 
              />
              <span className="hidden sm:inline">{settings.name}</span>
            </Link>
          </div>

          {/* Search bar & Category Dropdown (Desktop) */}
          <div className="hidden flex-1 max-w-xl md:flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 py-1.5 px-3 dark:border-zinc-800 dark:bg-zinc-900">
            {/* Category Select Dropdown */}
            <div className="relative border-r border-zinc-200 pr-2 dark:border-zinc-800">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-1 text-xs font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
              >
                <span>{selectedCategory}</span>
                <FiChevronDown className="h-3.5 w-3.5" />
              </button>

              {showDropdown && (
                <div className="absolute left-0 mt-2.5 w-48 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
                  <button
                    onClick={() => {
                      setSelectedCategory('Semua Kategori')
                      setShowDropdown(false)
                    }}
                    className="w-full rounded-lg px-3 py-1.5 text-left text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  >
                    Semua Kategori
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.name)
                        setShowDropdown(false)
                      }}
                      className="w-full rounded-lg px-3 py-1.5 text-left text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input Search */}
            <div className="flex flex-1 items-center gap-1.5">
              <FiSearch className="h-4 w-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Cari barang atau kategori di sini..."
                className="w-full bg-transparent text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none dark:text-white"
              />
            </div>
          </div>

          {/* Quick Actions (Cart, Notifications, Mobile Menu) */}
          <div className="flex items-center gap-4">
            {/* Cart Icon with Hover Dropdown */}
            {pathname !== '/cart' && (
              <div className="relative group">
                <Link 
                  id="navbar-cart-button"
                  href="/cart" 
                  className="relative p-2 text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition-all transform duration-200 block"
                >
                  <FiShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute top-0.5 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                </Link>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full pt-2 w-96 z-50 pointer-events-none opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto group-hover:visible transition-all duration-200 ease-out origin-top-right transform">
                  <div className="absolute right-4 top-0 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-zinc-200 dark:border-b-zinc-800" />
                  <div className="absolute right-4 top-1 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white dark:border-b-zinc-950" />
                  
                  <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded overflow-hidden mt-1.5 shadow-lg">
                    {items.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                        <FiShoppingCart className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mb-2" />
                        <span className="text-xs text-zinc-500 font-medium">Belum ada produk di keranjang</span>
                      </div>
                    ) : (
                      <>
                        <div className="p-3 border-b border-zinc-100 dark:border-zinc-900">
                          <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">Baru Ditambahkan</span>
                        </div>
                        
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-900 max-h-72 overflow-y-auto">
                          {[...items].reverse().slice(0, 5).map((item) => (
                            <div key={item.id} className="p-3 flex gap-3 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="h-10 w-10 rounded object-cover bg-zinc-100 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shrink-0"
                              />
                              <div className="flex-1 min-w-0 flex items-center">
                                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate block">{item.name}</span>
                              </div>
                              <span className="text-xs font-bold text-rose-500 shrink-0 self-center">
                                Rp {item.price.toLocaleString('id-ID')}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 flex items-center justify-between gap-4 border-t border-zinc-200 dark:border-zinc-800">
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold">
                            {items.length > 5 ? `${items.length - 5} Produk Lainnya` : ''}
                          </span>
                          <Link
                            href="/cart"
                            className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded transition-all cursor-pointer"
                          >
                            Tampilkan Keranjang Belanja
                        </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}



            {/* User Account Icon with Dropdown */}
            <div 
              className="relative group" 
              ref={profileRef}
              onMouseEnter={() => setIsProfileOpen(true)}
              onMouseLeave={() => setIsProfileOpen(false)}
            >
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="p-2 text-zinc-700 cursor-pointer hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition-colors block"
                aria-label="Menu Profil"
              >
                <FaRegUserCircle className="h-5 w-5" />
              </button>

              {/* Dropdown Menu */}
              <div 
                className={`absolute right-0 top-full pt-2 w-44 z-50 transition-all duration-200 ease-out origin-top-right transform ${
                  isProfileOpen 
                    ? 'opacity-100 scale-100 pointer-events-auto visible' 
                    : 'pointer-events-none opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto group-hover:visible'
                }`}
              >
                <div className="absolute right-4 top-0 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-zinc-200 dark:border-b-zinc-800" />
                <div className="absolute right-4 top-1 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white dark:border-b-zinc-950" />
                
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded mt-1.5 shadow-lg overflow-hidden">
                  <button
                    onClick={() => setIsProfileOpen(false)}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900 transition-colors"
                  >
                    Profil Saya
                  </button>
                  <Link
                    href="/user/purchase"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900 transition-colors"
                  >
                    Pesanan Saya
                  </Link>
                  <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
                  <button
                    onClick={() => setIsProfileOpen(false)}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    Keluar
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Menu button */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
            >
              {isOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {isOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950 space-y-3">
          {/* Mobile Search */}
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 py-1.5 px-3 dark:border-zinc-800 dark:bg-zinc-900">
            <FiSearch className="h-4 w-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Cari barang..." 
              className="w-full bg-transparent text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none dark:text-white"
            />
          </div>

          {/* Mobile Categories list */}
          <div className="space-y-1">
            <span className="block px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Kategori</span>
            {categories.map((cat) => (
              <a 
                key={cat.id} 
                href={`#cat-${cat.id}`}
                onClick={() => setIsOpen(false)}
                className="block rounded-lg px-2 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                {cat.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
