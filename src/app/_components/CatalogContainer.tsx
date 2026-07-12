'use client'

import { useState } from 'react'
import { Category } from '@/core/types/category'
import { Product } from '@/core/types/product'
import { CategorySection } from './CategorySection'
import { ProductSection } from './ProductSection'

interface CatalogContainerProps {
  categories: Category[]
  initialProducts: Product[]
}

export function CatalogContainer({ categories, initialProducts }: CatalogContainerProps) {
  const [activeCategory, setActiveCategory] = useState('all')

  // Filter products by selected category
  const filteredProducts = activeCategory === 'all'
    ? initialProducts
    : initialProducts.filter((p) => p.category === activeCategory)

  return (
    <div className="space-y-4">
      {/* Category selector */}
      <CategorySection
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      {/* Catalog items display */}
      <ProductSection products={filteredProducts} />
    </div>
  )
}
