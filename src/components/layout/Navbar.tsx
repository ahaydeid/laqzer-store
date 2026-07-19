'use client'

import { useState, useEffect, useRef } from 'react'
import { FiSearch, FiShoppingCart, FiChevronDown, FiMenu, FiX } from 'react-icons/fi'
import Link from 'next/link'
import Avatar from '@/components/ui/Avatar'
import { StoreSettings } from '@/core/types/store'
import { Category } from '@/core/types/category'
import { Product } from '@/core/types/product'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/components/providers/AuthProvider'
import { usePathname } from 'next/navigation'

interface NavbarProps {
  settings: StoreSettings
  categories: Category[]
  products?: Product[]
}

export function Navbar({ settings, categories, products = [] }: NavbarProps) {
  const { cartCount, items } = useCart()
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori')
  const [showDropdown, setShowDropdown] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  // Search state
  const [searchInput, setSearchInput] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Mobile search state
  const [mobileSearchInput, setMobileSearchInput] = useState('')
  const [mobileDebouncedQuery, setMobileDebouncedQuery] = useState('')
  const [showMobileResults, setShowMobileResults] = useState(false)
  const mobileSearchRef = useRef<HTMLDivElement>(null)

  // Debounce desktop search — 400ms agar tidak membebani render setiap keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput)
      setShowResults(searchInput.trim().length > 0)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Debounce mobile search — 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setMobileDebouncedQuery(mobileSearchInput)
      setShowMobileResults(mobileSearchInput.trim().length > 0)
    }, 400)
    return () => clearTimeout(timer)
  }, [mobileSearchInput])

  // Close dropdown on outside click (desktop)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdown on outside click (mobile)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)) {
        setShowMobileResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowResults(false)
        setShowMobileResults(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Filter produk berdasarkan query dan kategori
  const getSearchResults = (query: string) => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return products
      .filter((p) => {
        const matchesQuery = p.name.toLowerCase().includes(q)
        const matchesCategory =
          selectedCategory === 'Semua Kategori' || p.category === selectedCategory
        return matchesQuery && matchesCategory
      })
      .slice(0, 6) // Tampilkan maksimal 6 hasil
  }

  const desktopResults = getSearchResults(debouncedQuery)
  const mobileResults = getSearchResults(mobileDebouncedQuery)

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
          <div ref={searchRef} className="hidden flex-1 max-w-xl md:flex flex-col relative">
            <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 py-1.5 px-3 dark:border-zinc-800 dark:bg-zinc-900">
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
                <FiSearch className="h-4 w-4 text-zinc-400 shrink-0" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onFocus={() => {
                    if (debouncedQuery.trim().length > 0) setShowResults(true)
                  }}
                  placeholder="Cari barang atau kategori di sini..."
                  className="w-full bg-transparent text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none dark:text-white"
                />
                {searchInput && (
                  <button
                    onClick={() => {
                      setSearchInput('')
                      setDebouncedQuery('')
                      setShowResults(false)
                    }}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                  >
                    <FiX className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Search Results Dropdown */}
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden z-50">
                {desktopResults.length > 0 ? (
                  <>
                    <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-900">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        Hasil Pencarian
                        {selectedCategory !== 'Semua Kategori' && (
                          <span className="ml-1 text-rose-400">· {selectedCategory}</span>
                        )}
                      </span>
                    </div>
                    <div className="divide-y divide-zinc-50 dark:divide-zinc-900">
                      {desktopResults.map((product) => (
                        <Link
                          key={product.id}
                          href={`/product/${product.id}`}
                          onClick={() => {
                            setShowResults(false)
                            setSearchInput('')
                          }}
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-10 w-10 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                              {product.name}
                            </span>
                            <span className="block text-[10px] text-zinc-400 dark:text-zinc-500">
                              {product.category}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-rose-500 shrink-0">
                            Rp{product.price.toLocaleString('id-ID')}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center gap-1">
                    <FiSearch className="h-6 w-6 text-zinc-300 dark:text-zinc-700 mb-1" />
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Tidak ada produk ditemukan
                    </span>
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                      untuk &ldquo;{debouncedQuery}&rdquo;
                      {selectedCategory !== 'Semua Kategori' && ` di ${selectedCategory}`}
                    </span>
                  </div>
                )}
              </div>
            )}
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
                
                {/* Dropdown Menu (Only shown when user is logged in) */}
                {user && (
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
                )}
              </div>
            )}



            {/* User Account Icon / Login Button */}
            {user ? (
              <div 
                className="relative group" 
                ref={profileRef}
                onMouseEnter={() => setIsProfileOpen(true)}
                onMouseLeave={() => setIsProfileOpen(false)}
              >
                <Link
                  href="/user/profile"
                  onClick={(e) => {
                    if (typeof window !== 'undefined' && window.innerWidth < 768) {
                      e.preventDefault()
                      setIsProfileOpen(!isProfileOpen)
                    }
                  }}
                  className="flex items-center gap-2 p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  aria-label="Menu Profil"
                >
                  <Avatar
                    photo={user.user_metadata?.avatar_url}
                    name={user.user_metadata?.full_name}
                    size="small"
                    className="border border-zinc-200 dark:border-zinc-700"
                  />
                </Link>

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
                    <Link
                      href="/user/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-4 py-2 border-b border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer text-left"
                    >
                      <span className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                      </span>
                      <span className="block text-[10px] text-zinc-400 truncate">
                        {user.email}
                      </span>
                    </Link>

                    <Link
                      href="/user/purchase"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900 transition-colors"
                    >
                      Pesanan Saya
                    </Link>
                    <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
                    <button
                      onClick={() => {
                        setIsProfileOpen(false)
                        signOut()
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                    >
                      Keluar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs transition-colors"
              >
                Masuk
              </Link>
            )}

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
          <div ref={mobileSearchRef} className="relative">
            <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 py-1.5 px-3 dark:border-zinc-800 dark:bg-zinc-900">
              <FiSearch className="h-4 w-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                value={mobileSearchInput}
                onChange={(e) => setMobileSearchInput(e.target.value)}
                onFocus={() => {
                  if (mobileDebouncedQuery.trim().length > 0) setShowMobileResults(true)
                }}
                placeholder="Cari barang..."
                className="w-full bg-transparent text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none dark:text-white"
              />
              {mobileSearchInput && (
                <button
                  onClick={() => {
                    setMobileSearchInput('')
                    setMobileDebouncedQuery('')
                    setShowMobileResults(false)
                  }}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  <FiX className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Search Results */}
            {showMobileResults && (
              <div className="mt-1.5 rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
                {mobileResults.length > 0 ? (
                  <div className="divide-y divide-zinc-50 dark:divide-zinc-900">
                    {mobileResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        onClick={() => {
                          setShowMobileResults(false)
                          setMobileSearchInput('')
                          setIsOpen(false)
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-9 w-9 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                            {product.name}
                          </span>
                          <span className="block text-[10px] text-zinc-400">
                            {product.category}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-rose-500 shrink-0">
                          Rp{product.price.toLocaleString('id-ID')}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 px-4 text-center gap-1">
                    <FiSearch className="h-5 w-5 text-zinc-300 dark:text-zinc-700 mb-0.5" />
                    <span className="text-xs font-semibold text-zinc-500">Tidak ada produk ditemukan</span>
                    <span className="text-[11px] text-zinc-400">untuk &ldquo;{mobileDebouncedQuery}&rdquo;</span>
                  </div>
                )}
              </div>
            )}
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
