import Link from 'next/link'
import { getServices } from '@/services'
import { unstable_cache } from 'next/cache'
import {
  FaWhatsapp,
  FaInstagram,
  FaTiktok,
  FaEnvelope,
  FaGlobe,
} from 'react-icons/fa'
import { SiShopee } from 'react-icons/si'
import { FiArrowUpRight } from 'react-icons/fi'

export const metadata = {
  title: 'Links | Laqzer Indonesia',
  description: 'Temukan semua tautan resmi Laqzer Indonesia: WhatsApp, Toko Online, Instagram, TikTok, & Shopee.',
}

const getCachedSettings = unstable_cache(
  async () => {
    try {
      return await getServices().store.getSettings()
    } catch {
      return {
        name: 'Laqzer Indonesia',
        description: 'Katalog fashion lokal premium buatan anak bangsa dengan harga bersahabat.',
        phone: '085175235717',
      }
    }
  },
  ['store-settings'],
  { revalidate: 3600 }
)

export default async function LinksPage() {
  const settings = await getCachedSettings()

  // Format phone number for WhatsApp
  const rawPhone = settings?.phone || '085175235717'
  const cleanPhone = rawPhone.replace(/\D/g, '').replace(/^0/, '62')
  const waUrl = `https://wa.me/${cleanPhone}`
  const waSubtitle = `wa.me/${cleanPhone}`

  const linkItems = [
    {
      id: 'ecommerce',
      title: 'E-commerce Official',
      subtitle: 'laqzer-store-one.vercel.app',
      href: 'https://laqzer-store-one.vercel.app',
      icon: FaGlobe,
      isExternal: true,
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      subtitle: waSubtitle,
      href: waUrl,
      icon: FaWhatsapp,
      isExternal: true,
    },
    {
      id: 'email',
      title: 'Email',
      subtitle: 'laqzerindonesia@gmail.com',
      href: 'mailto:laqzerindonesia@gmail.com',
      icon: FaEnvelope,
      isExternal: true,
    },
    {
      id: 'instagram',
      title: 'Instagram',
      subtitle: '@laqzer.indonesia',
      href: 'https://www.instagram.com/laqzer.indonesia/',
      icon: FaInstagram,
      isExternal: true,
    },
    {
      id: 'tiktok',
      title: 'TikTok',
      subtitle: '@laqzer.indonesia',
      href: 'https://www.tiktok.com/@laqzer.indonesia',
      icon: FaTiktok,
      isExternal: true,
    },
    {
      id: 'shopee',
      title: 'Shopee Official',
      subtitle: 'shopee.co.id/laqzer.indonesia',
      href: 'https://shopee.co.id/laqzer.indonesia',
      icon: SiShopee,
      isExternal: true,
    },
  ]

  return (
    <div className="relative min-h-screen bg-slate-200 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-slate-300 dark:selection:bg-slate-800 overflow-hidden">
      {/* Background Logo */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/img/logo-laqzer-hitam-trans.png"
          alt="Laqzer Logo"
          className="w-full max-w-2xl md:max-w-3xl object-contain select-none"
        />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Links Stack */}
        <div className="w-full space-y-3.5">
          {linkItems.map((item) => {
            const Icon = item.icon
            const Content = (
              <>
                <div className="flex items-start space-x-4 min-w-0">
                  <Icon className="w-6 h-6 text-zinc-700 dark:text-zinc-300 shrink-0 group-hover:scale-110 transition-transform duration-200 mt-0.5" />
                  <div className="min-w-0 text-left">
                    <div className="font-bold text-zinc-900 dark:text-zinc-100 text-base leading-snug group-hover:text-zinc-950 dark:group-hover:text-white">
                      {item.title}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate font-normal">
                      {item.subtitle}
                    </div>
                  </div>
                </div>
                <div className="pl-3 shrink-0 mt-0.5">
                  <FiArrowUpRight className="w-5 h-5 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </>
            )

            const className =
              'w-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 flex items-start justify-between hover:shadow-md transition-all duration-200 group active:scale-[0.99] cursor-pointer'

            if (item.isExternal) {
              return (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {Content}
                </a>
              )
            }

            return (
              <Link key={item.id} href={item.href} className={className}>
                {Content}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}




