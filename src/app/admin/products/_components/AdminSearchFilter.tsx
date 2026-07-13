'use client'

import { useState } from 'react'
import { FiSearch, FiX } from 'react-icons/fi'

export function AdminSearchFilter() {
  const [isFocused, setIsFocused] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  const handleClear = () => {
    setSearchValue('')
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
      <div className="relative">
        <FiSearch className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={isFocused ? 'Cari berdasarkan nama produk...' : 'Cari'}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`transition-all duration-300 ease-in-out rounded-full border border-zinc-200 bg-white py-2 pl-10 text-sm outline-none focus:border-sky-500 dark:border-zinc-800 dark:bg-zinc-900/50 ${
            isFocused ? 'w-64 sm:w-96 pr-10' : 'w-24 pr-4'
          }`}
        />
        {searchValue && (
          <button
            onMouseDown={(e) => e.preventDefault()} // Mencegah input kehilangan fokus saat diklik
            onClick={handleClear}
            className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors flex items-center justify-center"
            title="Bersihkan Pencarian"
          >
            <FiX className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div>
        <select 
          className="py-2 px-3 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900/50 bg-transparent cursor-pointer"
          defaultValue="10"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
        <select 
          className="py-2 px-3 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900/50 bg-transparent"
          disabled
        >
          <option>Semua</option>
        </select>
      </div>
    </div>
  )
}
