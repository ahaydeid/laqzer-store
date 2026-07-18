import { getServices } from '@/services'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { UserProfileContainer } from './_components/UserProfileContainer'
import Link from 'next/link'

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
          <div className="md:col-span-1 flex flex-col gap-1 text-sm">
            <Link 
              href="/user/profile" 
              className="px-4 py-2.5 font-bold text-rose-600 rounded cursor-pointer transition-colors"
            >
              Profil Saya
            </Link>
            <Link 
              href="/user/purchase" 
              className="px-4 py-2.5 font-medium text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-500 rounded cursor-pointer transition-colors"
            >
              Pesanan Saya
            </Link>
          </div>

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
