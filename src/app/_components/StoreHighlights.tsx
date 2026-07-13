import { FiTruck, FiShield, FiCheckCircle, FiAward } from 'react-icons/fi'

const HIGHLIGHTS = [
  {
    id: 1,
    icon: <FiTruck className="h-6 w-6 text-zinc-950 dark:text-white" />,
    title: 'Bebas Ongkir',
    desc: 'Gratis biaya pengiriman ke seluruh wilayah Indonesia dengan minimal belanja tertentu.',
  },
  {
    id: 2,
    icon: <FiShield className="h-6 w-6 text-zinc-950 dark:text-white" />,
    title: 'Bayar di Tempat (COD)',
    desc: 'Nikmati kemudahan bertransaksi langsung di depan pintu rumah Kamu secara aman.',
  },
  {
    id: 3,
    icon: <FiCheckCircle className="h-6 w-6 text-zinc-950 dark:text-white" />,
    title: 'Kualitas Premium',
    desc: 'Semua barang melewati kendali mutu ketat untuk memastikan standar kepuasan Kamu.',
  },
  {
    id: 4,
    icon: <FiAward className="h-6 w-6 text-zinc-950 dark:text-white" />,
    title: 'Garansi Retur 100%',
    desc: 'Barang rusak atau ukuran salah? Tenang, kami menyediakan penukaran mudah dalam 7 hari.',
  },
]

export function StoreHighlights() {
  return (
    <section className="w-full py-12 border-t border-zinc-100 dark:border-zinc-900">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="text-center max-w-lg mx-auto space-y-2">
          <h3 className="text-xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Mengapa Memilih Kami?
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Komitmen kami untuk memberikan pengalaman belanja digital terbaik dan terpercaya bagi Kamu.
          </p>
        </div>

        {/* Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HIGHLIGHTS.map((item) => (
            <div 
              key={item.id} 
              className="flex flex-col gap-4 rounded-2xl border border-zinc-100 bg-white p-6 hover:shadow-md transition-shadow duration-300 dark:border-zinc-800/60 dark:bg-zinc-900/30"
            >
              {/* Icon Container */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
                {item.icon}
              </div>
              
              {/* Text metadata */}
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-zinc-950 dark:text-white">
                  {item.title}
                </h4>
                <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
