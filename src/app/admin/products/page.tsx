import { getServices } from '@/services'
import { ProductManagement } from './_components/ProductManagement'

export const metadata = {
  title: 'Kelola Produk | Laqzer Admin',
  description: 'Daftar produk dan opsi manajemen katalog',
}

export default async function AdminProductsPage() {
  const services = getServices()
  const [products, categories] = await Promise.all([
    services.products.getProducts(),
    services.categories.getCategories(),
  ])

  return <ProductManagement initialProducts={products} categories={categories} />
}
