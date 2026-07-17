'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { FiGrid, FiShoppingBag, FiMenu, FiX, FiExternalLink, FiSettings } from 'react-icons/fi'
import Sidebar from './products/_components/Sidebar'

interface SidebarItemProps {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  active: boolean
  onClick?: () => void
  target?: string
}

function SidebarItem({ href, icon: Icon, label, active, onClick, target }: SidebarItemProps) {
  const isExternal = target === '_blank';
  return (
    <Link
      href={href}
      onClick={onClick}
      target={target}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
          : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
      }`}
    >
      {isExternal ? (
        <div className="flex items-center gap-1.5">
          <span>{label}</span>
          <Icon className="h-4 w-4 flex-shrink-0 opacity-80" />
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 flex-shrink-0" />
          <span>{label}</span>
        </div>
      )}
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
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Sinkronisasi status collapse untuk mencegah hydration mismatch
  useEffect(() => {
    const stored = localStorage.getItem('left-sidebar-collapsed') === 'true'
    const timer = setTimeout(() => setIsCollapsed(stored), 0)
    return () => clearTimeout(timer)
  }, [])

  const navItems = [
    { href: '/admin', icon: FiGrid, label: 'Dashboard' },
    { href: '/admin/products', icon: FiShoppingBag, label: 'Kelola Produk' },
    { href: '/admin/settings', icon: FiSettings, label: 'Pengaturan' },
  ]

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans">
      {/* Sidebar - Desktop */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

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
                  icon={FiExternalLink}
                  label="Lihat Toko"
                  active={false}
                  target="_blank"
                  onClick={() => setMobileMenuOpen(false)}
                />
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <main className="flex-1 p-6 md:p-8 w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
