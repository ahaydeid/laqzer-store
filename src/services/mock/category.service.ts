import { ICategoryService } from '@/core/interfaces/category.interface'
import { Category } from '@/core/types/category'

const MOCK_CATEGORIES: Category[] = [
  { id: 't-shirt', name: 'T-Shirt', iconName: 'tshirt' },
  { id: 'jacket', name: 'Jacket', iconName: 'jacket' },
  { id: 'shirt', name: 'Shirt', iconName: 'shirt' },
  { id: 'jeans', name: 'Jeans', iconName: 'jeans' },
  { id: 'bag', name: 'Bag', iconName: 'bag' },
  { id: 'shoes', name: 'Shoes', iconName: 'shoes' },
  { id: 'watches', name: 'Watches', iconName: 'watches' },
  { id: 'cap', name: 'Cap', iconName: 'cap' },
]

export class MockCategoryService implements ICategoryService {
  async getCategories(): Promise<Category[]> {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return MOCK_CATEGORIES
  }
}
