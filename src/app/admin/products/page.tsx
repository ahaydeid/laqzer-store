import { getServices } from '@/services'
import { ProductManagement } from './_components/ProductManagement'

export const metadata = {
  title: 'Kelola Produk | Laqzer Admin',
  description: 'Daftar produk dan opsi manajemen katalog',
}

export default async function AdminProductsPage() {
  const services = getServices()
  const products = await services.products.getProducts()

  return <ProductManagement initialProducts={products} />
}
