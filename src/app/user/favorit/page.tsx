import { getServices } from '@/services'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { FavoritContainer } from './_components/FavoritContainer'
import { UserSidebar } from '../_components/UserSidebar'

export const metadata = {
  title: 'Favorit Saya | Laqzer Indonesia',
  description: 'Daftar produk yang Anda favoritkan di Laqzer Indonesia.',
}

export default async function FavoritPage() {
  const services = getServices()

  const [storeSettings, categories, products] = await Promise.all([
    services.store.getSettings(),
    services.categories.getCategories(),
    services.products.getProducts(),
  ])

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans pb-16 md:pb-0">
      <Navbar settings={storeSettings} categories={categories} products={products} />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-4 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Kiri */}
          <UserSidebar />

          {/* Konten Kanan */}
          <div className="md:col-span-3">
            <FavoritContainer />
          </div>
        </div>
      </main>

      <Footer settings={storeSettings} />
    </div>
  )
}
