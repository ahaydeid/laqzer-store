import { StoreSettings } from '@/core/types/store'
import { FaWhatsapp, FaInstagram, FaMapMarkerAlt, FaPhoneAlt, FaTiktok } from 'react-icons/fa'
import { SiShopee } from 'react-icons/si'

interface FooterProps {
  settings: StoreSettings
}

export function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full bg-zinc-900 border-t border-zinc-800 text-zinc-400 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left column: Brand Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/img/logo-laqzer-transparan.png" 
              alt="Logo" 
              className="h-8 w-8 rounded-lg object-cover" 
            />
            <span className="text-xl font-bold tracking-tight">{settings.name}</span>
          </div>
          <p className="text-sm leading-relaxed text-zinc-400">
            {settings.description}
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-zinc-500 shrink-0" />
              <span>{settings.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaPhoneAlt className="text-zinc-500 shrink-0" />
              <span>{settings.phone}</span>
            </div>
          </div>
        </div>

        {/* Center column: Quick Navigation */}
        <div className="space-y-4">
          <h3 className="text-white text-sm font-semibold uppercase tracking-wider">Navigasi</h3>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">Halaman Depan</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Semua Produk</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Promo Terkini</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Cara Belanja</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Kebijakan Retur</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Tentang Kami</a></li>
          </ul>
        </div>

        {/* Right column: WhatsApp Customer Service CTA */}
        <div className="space-y-4">
          <h3 className="text-white text-sm font-semibold uppercase tracking-wider">Layanan Pelanggan</h3>
          <p className="text-sm text-zinc-400">
            Ada pertanyaan atau ingin memesan langsung lewat chat? CS kami siap membantu Anda dengan ramah.
          </p>
          <a
            href={`https://wa.me/${settings.phone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors shadow-lg shadow-green-900/10"
          >
            <FaWhatsapp className="h-5 w-5" />
            <span>Chat WhatsApp Sekarang</span>
          </a>
          <div className="flex gap-4 pt-2">
            <a 
              href="https://www.instagram.com/laqzer.indonesia/" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-white transition-colors"
              title="Instagram"
            >
              <FaInstagram className="h-5 w-5" />
            </a>
            <a 
              href="https://www.tiktok.com/@laqzer.indonesia" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-white transition-colors"
              title="TikTok"
            >
              <FaTiktok className="h-5 w-5" />
            </a>
            <a 
              href="https://shopee.co.id/laqzer.indonesia" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-white transition-colors"
              title="Shopee"
            >
              <SiShopee className="h-5 w-5" />
            </a>
            <a 
              href="#" 
              className="text-zinc-500 hover:text-white transition-colors flex items-center justify-center"
              title="Lazada (Link Menyusul)"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 transform -rotate-12 scale-90" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </a>
          </div>
        </div>

      </div>

      {/* Footer Bottom bar */}
      <div className="mx-auto max-w-7xl border-t border-zinc-800 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
        <p>&copy; {currentYear} {settings.name}. Hak Cipta Dilindungi.</p>
        <div className="flex gap-4 text-zinc-500">
          <a href="#" className="hover:underline">Syarat & Ketentuan</a>
          <a href="#" className="hover:underline">Kebijakan Privasi</a>
        </div>
      </div>
    </footer>
  )
}
