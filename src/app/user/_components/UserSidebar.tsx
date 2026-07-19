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
    { href: '/user/profile', label: 'Profil Saya' },
    { href: '/user/purchase', label: 'Pesanan Saya' },
    {
      href: '/user/favorit',
      label: 'Favorit Saya',
      badge: favCount > 0 ? favCount : null,
    },
  ]

  return (
    <div className="md:col-span-1 flex flex-col gap-1 text-sm">
      {links.map((link) => {
        const isActive = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center justify-between px-4 py-2.5 rounded cursor-pointer transition-colors font-medium ${
              isActive
                ? 'font-bold text-rose-600'
                : 'text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-500'
            }`}
          >
            <span>{link.label}</span>
            {link.badge !== null && link.badge !== undefined && (
              <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                {link.badge}
              </span>
            )}
          </Link>
        )
      })}
    </div>
  )
}

