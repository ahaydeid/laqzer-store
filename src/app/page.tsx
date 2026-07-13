import { getServices } from '@/services'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HeroCarousel } from './_components/HeroCarousel'
import { CatalogContainer } from './_components/CatalogContainer'
import { StoreHighlights } from './_components/StoreHighlights'

/**
 * Main E-commerce Home Page (Server Component)
 * 
 * Fetches all necessary data on the server side using the Service Factory
 * and renders a high-performance, SEO-friendly, cost-optimized homepage.
 */
export default async function Home() {
  const services = getServices()

  // Load all initial store, category, and product data concurrently on the server
  const [storeSettings, categories, initialProducts] = await Promise.all([
    services.store.getSettings(),
    services.categories.getCategories(),
    services.products.getProducts(),
  ])

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans">
      {/* Navigation bar */}
      <Navbar settings={storeSettings} categories={categories} />

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
    </div>
  )
}
