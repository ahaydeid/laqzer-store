import { getServices } from '@/services'
import { ProductForm } from '../_components/ProductForm'

export const metadata = {
  title: 'Tambah Produk | Laqzer Admin',
  description: 'Tambah produk baru ke katalog online Anda',
}

export default async function AdminNewProductPage() {
  const services = getServices()
  const categories = await services.categories.getCategories()

  return <ProductForm categories={categories} type="create" />
}
