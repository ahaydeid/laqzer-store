import { getServices } from '@/services'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { UserProfileContainer } from './_components/UserProfileContainer'
import Link from 'next/link'
import { UserSidebar } from '../_components/UserSidebar'


export default async function UserProfilePage() {
  const services = getServices()

  // Load toko dan kategori metadata
  const [storeSettings, categories] = await Promise.all([
    services.store.getSettings(),
    services.categories.getCategories(),
  ])

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans">
      {/* Navigation bar */}
      <Navbar settings={storeSettings} categories={categories} />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Kiri */}
          <UserSidebar />


          {/* Konten Kanan */}
          <div className="md:col-span-3">
            <h1 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-6">
              Pengaturan Akun & Alamat
            </h1>
            
            {/* User profile form container */}
            <UserProfileContainer />
          </div>
        </div>
      </main>

      {/* Footer layout */}
      <Footer settings={storeSettings} />
    </div>
  )
}
