import { getServices } from '@/services'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CartContainer } from './_components/CartContainer'

export const metadata = {
  title: 'Keranjang Belanja | Laqzer Indonesia',
  description: 'Kelola produk pilihan Anda di keranjang belanja Laqzer Indonesia.',
}

/**
 * Server Page Component for Cart Halaman (Next.js App Router)
 * 
 * Fetches necessary store data on the server side and renders the interactive CartContainer.
 */
export default async function CartPage() {
  const services = getServices()

  // Concurrently fetch store settings and categories for header and footer layout
  const [storeSettings, categories] = await Promise.all([
    services.store.getSettings(),
    services.categories.getCategories(),
  ])

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans pb-16 md:pb-0">
      {/* Navigation header */}
      <Navbar settings={storeSettings} categories={categories} />

      {/* Main interactive shopping cart area */}
      <main className="flex-1 w-full bg-slate-50/50 dark:bg-zinc-900/10">
        <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
          <CartContainer />
        </div>
      </main>

      {/* Footer layout */}
      <Footer settings={storeSettings} />
    </div>
  )
}
