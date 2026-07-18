'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Category } from '@/core/types/category'
import { FiChevronDown, FiPlus, FiCheck, FiSearch } from 'react-icons/fi'

interface CategoryComboboxProps {
  categories: Category[]
  value: string
  onChange: (categoryId: string) => void
  onAddNewCategory?: (newCategory: Category) => void
}

export function CategoryCombobox({
  categories,
  value,
  onChange,
  onAddNewCategory,
}: CategoryComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Find currently selected category
  const selectedCategory = categories.find((c) => c.id === value || c.name === value)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter categories by query
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(query.toLowerCase()) ||
    cat.id.toLowerCase().includes(query.toLowerCase())
  )

  const isExactMatch = categories.some(
    (cat) => cat.name.toLowerCase() === query.trim().toLowerCase()
  )

  const handleSelect = (catId: string) => {
    onChange(catId)
    setQuery('')
    setIsOpen(false)
  }

  const handleCreateCategory = () => {
    const trimmed = query.trim()
    if (!trimmed) return

    const newId = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const newCategory: Category = {
      id: newId,
      name: trimmed,
      iconName: 'Tag',
    }

    if (onAddNewCategory) {
      onAddNewCategory(newCategory)
    }

    onChange(newId)
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input Field / Trigger */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-between w-full rounded border border-zinc-200 bg-zinc-50/50 py-2 px-3.5 text-xs outline-none focus-within:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/60 cursor-pointer select-none"
      >
        <span className={selectedCategory ? 'text-zinc-900 dark:text-zinc-100 font-medium' : 'text-zinc-400'}>
          {selectedCategory ? selectedCategory.name : 'Pilih Kategori...'}
        </span>
        <FiChevronDown className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown Popup */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden text-xs max-h-60 flex flex-col">
          {/* Search Bar inside Combobox */}
          <div className="p-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2 bg-zinc-50/50 dark:bg-zinc-900/50">
            <FiSearch className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Cari atau ketik kategori baru..."
              className="w-full bg-transparent text-xs outline-none text-zinc-800 dark:text-zinc-200"
              autoFocus
            />
          </div>

          <div className="overflow-y-auto max-h-48 p-1">
            {/* Option to create new category if query is typed and no exact match */}
            {query.trim() && !isExactMatch && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCreateCategory()
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded text-left text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 font-semibold transition-colors cursor-pointer mb-1"
              >
                <FiPlus className="h-3.5 w-3.5 flex-shrink-0" />
                <span>&quot;{query.trim()}&quot;</span>
              </button>
            )}

            {/* List of existing categories */}
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => {
                const isSelected = value === cat.id || value === cat.name
                return (
                  <div
                    key={cat.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelect(cat.id)
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-zinc-100 font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {isSelected && <FiCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
                  </div>
                )
              })
            ) : (
              !query.trim() && (
                <div className="p-3 text-center text-zinc-400 text-[11px]">
                  Tidak ada kategori ditemukan.
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}
