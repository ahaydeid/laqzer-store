import { notFound } from 'next/navigation'
import { getServices } from '@/services'
import { ProductForm } from '../../_components/ProductForm'

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: EditProductPageProps) {
  const { id } = await params
  const services = getServices()
  const product = await services.products.getProductById(id)

  if (!product) {
    return {
      title: 'Produk Tidak Ditemukan | Laqzer Admin',
    }
  }

  return {
    title: `Edit ${product.name} | Laqzer Admin`,
    description: `Halaman edit detail untuk produk ${product.name}`,
  }
}

export default async function AdminEditProductPage({ params }: EditProductPageProps) {
  const { id } = await params
  const services = getServices()

  // Ambil data produk dan kategori secara concurrent
  const [product, categories] = await Promise.all([
    services.products.getProductById(id),
    services.categories.getCategories(),
  ])

  // Jika produk tidak ditemukan, arahkan ke 404
  if (!product) {
    notFound()
  }

  return (
    <ProductForm 
      categories={categories} 
      initialData={product} 
      type="edit" 
    />
  )
}
