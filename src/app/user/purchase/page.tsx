import { getServices } from '@/services'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PurchaseContainer } from './_components/PurchaseContainer'

export const metadata = {
  title: 'Pesanan Saya | Laqzer Indonesia',
  description: 'Pantau status dan riwayat pembelian Anda di Laqzer Indonesia.',
}

export default async function PurchasePage() {
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

      {/* Main interactive area */}
      <main className="flex-1 w-full bg-slate-50/50 dark:bg-zinc-900/10">
        <div className="mx-auto max-w-3xl w-full px-0 sm:px-6 lg:px-8 py-8">
          <PurchaseContainer />
        </div>
      </main>

      {/* Footer layout */}
      <Footer settings={storeSettings} />
    </div>
  )
}
