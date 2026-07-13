'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { FiGrid, FiShoppingBag, FiHome, FiMenu, FiX, FiUser } from 'react-icons/fi'

interface SidebarItemProps {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  active: boolean
  onClick?: () => void
}

function SidebarItem({ href, icon: Icon, label, active, onClick }: SidebarItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
          : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
      }`}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span>{label}</span>
    </Link>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: '/admin', icon: FiGrid, label: 'Dashboard' },
    { href: '/admin/products', icon: FiShoppingBag, label: 'Kelola Produk' },
  ]

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50 backdrop-blur-md z-40">
        {/* Brand/Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-zinc-200 px-6 dark:border-zinc-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold text-lg">
            L
          </div>
          <span className="text-lg font-bold tracking-tight">Laqzer Admin</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 px-4 py-6">
          <span className="block px-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
            Menu Utama
          </span>
          {navItems.map((item) => (
            <SidebarItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))}
            />
          ))}

          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/60 mt-6">
            <span className="block px-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
              Toko
            </span>
            <SidebarItem
              href="/"
              icon={FiHome}
              label="Lihat Toko"
              active={false}
            />
          </div>
        </nav>

        {/* Admin User Profile Section */}
        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex items-center gap-3 rounded-xl p-2 bg-zinc-50 dark:bg-zinc-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
              <FiUser className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate">Admin Utama</p>
              <p className="text-[10px] text-zinc-400 truncate">admin@laqzer.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex md:hidden flex-col w-full">
        <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950 sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold">
              L
            </div>
            <span className="font-bold tracking-tight">Laqzer Admin</span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            {mobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
          </button>
        </header>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-zinc-900/40 backdrop-blur-sm md:hidden" onClick={() => setMobileMenuOpen(false)}>
            <nav 
              className="fixed bottom-0 top-16 left-0 w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 p-4 space-y-1.5 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="block px-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
                Menu Utama
              </span>
              {navItems.map((item) => (
                <SidebarItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  active={pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))}
                  onClick={() => setMobileMenuOpen(false)}
                />
              ))}

              <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 mt-6">
                <span className="block px-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
                  Toko
                </span>
                <SidebarItem
                  href="/"
                  icon={FiHome}
                  label="Lihat Toko"
                  active={false}
                  onClick={() => setMobileMenuOpen(false)}
                />
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
