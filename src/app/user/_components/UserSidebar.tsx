'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { SupabaseWishlistService } from '@/services/supabase/wishlist.service'
import useSWR from 'swr'

export function UserSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const wishlistService = useMemo(() => new SupabaseWishlistService(), [])

  const { data: favorites = [] } = useSWR(
    user?.id ? `user-wishlist-${user.id}` : null,
    () => wishlistService.getFavoriteProducts(user!.id),
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  )

  const favCount = favorites.length

  const links = [
    { href: '/user/profile', labelDesktop: 'Profil Saya', labelMobile: 'Profil' },
    { href: '/user/purchase', labelDesktop: 'Pesanan Saya', labelMobile: 'Pesanan' },
    {
      href: '/user/favorit',
      labelDesktop: 'Favorit Saya',
      labelMobile: 'Favorit',
      badge: favCount > 0 ? favCount : null,
    },
  ]

  return (
    <div className="md:col-span-1 flex flex-row md:flex-col gap-2 md:gap-1 text-sm overflow-x-auto scrollbar-none pb-3 md:pb-0 border-b border-zinc-100 dark:border-zinc-800 md:border-none">
      {links.map((link) => {
        const isActive = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center justify-start md:justify-between gap-1.5 md:gap-0 px-3 py-1.5 md:px-4 md:py-2.5 rounded cursor-pointer transition-colors font-medium ${
              isActive
                ? 'font-bold text-rose-600 bg-rose-50/50 dark:bg-rose-950/10 md:bg-transparent md:dark:bg-transparent'
                : 'text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-500 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 md:hover:bg-transparent md:dark:hover:bg-transparent'
            }`}
          >
            <span>
              <span className="md:hidden">{link.labelMobile}</span>
              <span className="hidden md:inline">{link.labelDesktop}</span>
            </span>
            {link.badge !== null && link.badge !== undefined && (
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                {link.badge}
              </span>
            )}
          </Link>
        )
      })}
    </div>
  )
}

