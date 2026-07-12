import { StoreSettings } from '@/core/types/store'
import { FaWhatsapp, FaInstagram, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa'

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
              src="/img/logo-laqzer.jpg" 
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
            className="inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors shadow-lg shadow-green-900/10"
          >
            <FaWhatsapp className="h-5 w-5" />
            <span>Chat WhatsApp Sekarang</span>
          </a>
          <div className="flex gap-4 pt-2">
            <a href="#" className="text-zinc-500 hover:text-white transition-colors">
              <FaInstagram className="h-5 w-5" />
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
