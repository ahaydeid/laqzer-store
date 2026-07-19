import { getServices } from '@/services'
import { unstable_cache } from 'next/cache'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HeroCarousel } from './_components/HeroCarousel'
import { CatalogContainer } from './_components/CatalogContainer'
import { StoreHighlights } from './_components/StoreHighlights'
import { PopupAd } from './_components/PopupAd'

const services = getServices()

// Cache store settings selama 1 jam — jarang berubah
const getCachedSettings = unstable_cache(
  () => services.store.getSettings(),
  ['store-settings'],
  { revalidate: 3600 }
)

// Cache categories selama 1 jam
const getCachedCategories = unstable_cache(
  () => services.categories.getCategories(),
  ['categories'],
  { revalidate: 3600 }
)

// Cache products selama 60 detik — bisa berubah saat admin update
const getCachedProducts = unstable_cache(
  () => services.products.getProducts(),
  ['products'],
  { revalidate: 60, tags: ['products'] }
)

/**
 * Main E-commerce Home Page (Server Component)
 *
 * Fetches all necessary data on the server side using the Service Factory
 * and renders a high-performance, SEO-friendly, cost-optimized homepage.
 * Data di-cache oleh Next.js Data Cache agar tidak hit Supabase setiap request.
 */
export default async function Home() {
  // Load all initial store, category, and product data concurrently (from cache)
  const [storeSettings, categories, initialProducts] = await Promise.all([
    getCachedSettings(),
    getCachedCategories(),
    getCachedProducts(),
  ])

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans">
      {/* Navigation bar */}
      <Navbar settings={storeSettings} categories={categories} products={initialProducts} />

      {/* Hero Slider Promotion (Full Width) */}
      <HeroCarousel />

      <main className="flex-1 w-full">
        {/* Interactive Product Catalog (Category filters & search results) */}
        <CatalogContainer 
          categories={categories} 
          initialProducts={initialProducts} 
        />

        {/* Store Trust Value / Highlights */}
        <StoreHighlights />
      </main>

      {/* Footer layout */}
      <Footer settings={storeSettings} />

      {/* Popup Iklan — muncul sekali per sesi, hanya di halaman ini */}
      <PopupAd />
    </div>
  )
}
