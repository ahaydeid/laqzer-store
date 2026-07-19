import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getServices } from '@/services'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ProductDetailContainer } from './_components/ProductDetailContainer'

interface ProductPageProps {
  params: Promise<{ id: string }>
}

/**
 * Generate metadata dynamically for the product page (SEO Optimization)
 */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  const services = getServices()
  const product = await services.products.getProductById(id)

  if (!product) {
    return {
      title: 'Produk Tidak Ditemukan | Laqzer Indonesia',
    }
  }

  const hasDiscount = product.isCampaign && product.originalPrice && product.originalPrice > product.price
  const discountPct = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0

  const formattedPrice = `Rp ${product.price.toLocaleString('id-ID')}`
  const promoPrefix = hasDiscount ? `[Diskon ${discountPct}%] ` : ''
  const trimmedName = product.name.length > 35 ? `${product.name.slice(0, 35)}...` : product.name
  const pageTitle = `${promoPrefix}${trimmedName} - ${formattedPrice} | Laqzer Indonesia`
  
  const pageDescription = `Dapatkan produk berkualitas premium hanya di Laqzer Indonesia!`

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      images: [
        {
          url: product.imageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [product.imageUrl],
    },
  }
}

/**
 * Server Page Component for Product Details (Next.js 16 App Router)
 */
export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params
  const services = getServices()

  // Fetch product data, store settings, categories, and all products concurrently
  const [product, storeSettings, categories, allProducts] = await Promise.all([
    services.products.getProductById(id),
    services.store.getSettings(),
    services.categories.getCategories(),
    services.products.getProducts(),
  ])

  // If the product does not exist, trigger the 404 page
  if (!product) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans">
      {/* Navigation bar */}
      <Navbar settings={storeSettings} categories={categories} products={allProducts} />

      {/* Main product detail workspace */}
      <div className="flex-1 w-full bg-white dark:bg-zinc-950">
        <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-3 md:py-8 pb-16">
          <ProductDetailContainer
            product={product}
            settings={storeSettings}
            relatedProducts={allProducts.filter((p) => p.id !== product!.id).slice(0, 8)}
          />
        </main>
      </div>

      {/* Footer layout */}
      <Footer settings={storeSettings} />
    </div>
  )
}
