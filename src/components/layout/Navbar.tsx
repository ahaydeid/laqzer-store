'use client'

import { useState } from 'react'
import { FiSearch, FiShoppingBag, FiBell, FiChevronDown, FiMenu, FiX } from 'react-icons/fi'
import { StoreSettings } from '@/core/types/store'
import { Category } from '@/core/types/category'

interface NavbarProps {
  settings: StoreSettings
  categories: Category[]
}

export function Navbar({ settings, categories }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori')
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-2">
            <a href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/img/logo-laqzer.jpg" 
                alt="Logo" 
                className="h-8 w-8 rounded-lg object-cover" 
              />
              <span>{settings.name}</span>
            </a>
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
            {/* Cart Icon */}
            <button className="relative p-2 text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition-colors">
              <FiShoppingBag className="h-5 w-5" />
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white dark:bg-white dark:text-zinc-950">
                0
              </span>
            </button>

            {/* Notification Icon */}
            <button className="hidden sm:block p-2 text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition-colors">
              <FiBell className="h-5 w-5" />
            </button>

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
