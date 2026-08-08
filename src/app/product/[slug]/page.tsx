import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getServices } from '@/services'
import { unstable_cache } from 'next/cache'
import { SupabaseReviewsService } from '@/services/supabase/reviews.service'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ProductDetailContainer } from './_components/ProductDetailContainer'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

const services = getServices()

// Cache settings & categories lama — jarang berubah (sinkron dengan homepage)
const getCachedSettings = unstable_cache(
  () => services.store.getSettings(),
  ['store-settings'],
  { revalidate: 3600 }
)

const getCachedCategories = unstable_cache(
  () => services.categories.getCategories(),
  ['categories'],
  { revalidate: 3600 }
)

// Cache semua produk selama 60 detik — sinkron dengan homepage (tag: 'products')
const getCachedProducts = unstable_cache(
  () => services.products.getProducts(),
  ['products'],
  { revalidate: 60, tags: ['products'] }
)

// Cache detail produk per slug selama 60 detik
// Tag 'products' agar ikut di-revalidate saat admin update produk
const getCachedProductBySlug = (slug: string) =>
  unstable_cache(
    () => services.products.getProductBySlug(slug),
    ['product', slug],
    { revalidate: 60, tags: ['products', `product-${slug}`] }
  )()

// Cache ulasan produk per product ID selama 60 detik
// Client component tetap re-fetch setelah user submit ulasan (reloadKey)
const getCachedProductReviews = (productId: string) =>
  unstable_cache(
    () => new SupabaseReviewsService().getProductReviews(productId),
    ['product-reviews', productId],
    { revalidate: 60, tags: [`product-reviews-${productId}`] }
  )()

/**
 * Generate metadata dynamically for the product page (SEO Optimization)
 */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getCachedProductBySlug(slug)

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
 * Semua fetch menggunakan unstable_cache — tidak hit Supabase setiap request.
 */
export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params

  // Fetch semua data dari cache secara paralel
  const [product, storeSettings, categories, allProducts] = await Promise.all([
    getCachedProductBySlug(slug),
    getCachedSettings(),
    getCachedCategories(),
    getCachedProducts(),
  ])

  // Fetch ulasan awal server-side agar tidak flash dari 0 di client
  const initialReviews = product
    ? await getCachedProductReviews(product.id)
    : []

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
            initialReviews={initialReviews}
          />
        </main>
      </div>

      {/* Footer layout */}
      <Footer settings={storeSettings} />
    </div>
  )
}
