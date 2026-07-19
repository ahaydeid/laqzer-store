import { getServices } from '@/services'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PurchaseContainer } from './_components/PurchaseContainer'
import { UserSidebar } from '../_components/UserSidebar'

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
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans pb-16 md:pb-0">
      {/* Navigation header */}
      <Navbar settings={storeSettings} categories={categories} />

      {/* Main interactive area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-4 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Kiri */}
          <UserSidebar />


          {/* Konten Kanan */}
          <div className="md:col-span-3">
            <PurchaseContainer />
          </div>
        </div>
      </main>

      {/* Footer layout */}
      <Footer settings={storeSettings} />
    </div>
  )
}
