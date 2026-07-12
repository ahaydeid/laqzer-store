'use client'

import { Category } from '@/core/types/category'
import { FaTshirt, FaShoppingBag, FaClock, FaTags } from 'react-icons/fa'
import { GiSleevelessJacket, GiBilledCap, GiRunningShoe, GiTrousers } from 'react-icons/gi'
import { IoShirtOutline } from 'react-icons/io5'

interface CategorySectionProps {
  categories: Category[]
  activeCategory: string
  onSelectCategory: (id: string) => void
}

export function CategorySection({ categories, activeCategory, onSelectCategory }: CategorySectionProps) {
  // Mapper from iconName string to React Icons
  const renderIcon = (name: string) => {
    const props = { className: 'h-6 w-6 transition-transform duration-300 group-hover:scale-110' }
    switch (name) {
      case 'tshirt':
        return <FaTshirt {...props} />
      case 'jacket':
        return <GiSleevelessJacket {...props} />
      case 'shirt':
        return <IoShirtOutline {...props} />
      case 'jeans':
        return <GiTrousers {...props} />
      case 'bag':
        return <FaShoppingBag {...props} />
      case 'shoes':
        return <GiRunningShoe {...props} />
      case 'watches':
        return <FaClock {...props} />
      case 'cap':
        return <GiBilledCap {...props} />
      default:
        return <FaTags {...props} />
    }
  }

  return (
    <section className="w-full py-8">
      <div className="flex flex-col gap-6">
        <h3 className="text-lg font-bold tracking-tight text-zinc-950 dark:text-white">
          Kategori Pilihan
        </h3>
        
        {/* Horizontal scrollable categories grid */}
        <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
          {/* "Semua Produk" button */}
          <button
            onClick={() => onSelectCategory('all')}
            className={`group flex flex-col items-center gap-3 min-w-[80px] shrink-0 outline-none`}
          >
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 border ${
              activeCategory === 'all'
                ? 'bg-zinc-950 text-white border-zinc-950 dark:bg-white dark:text-zinc-950 dark:border-white shadow-md'
                : 'bg-zinc-50 text-zinc-700 border-zinc-100 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800'
            }`}>
              <FaTags className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
            </div>
            <span className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
              Semua
            </span>
          </button>

          {/* Dynamic categories */}
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`group flex flex-col items-center gap-3 min-w-[80px] shrink-0 outline-none`}
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 border ${
                activeCategory === cat.id
                  ? 'bg-zinc-950 text-white border-zinc-950 dark:bg-white dark:text-zinc-950 dark:border-white shadow-md'
                  : 'bg-zinc-50 text-zinc-700 border-zinc-100 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800'
              }`}>
                {renderIcon(cat.iconName)}
              </div>
              <span className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
