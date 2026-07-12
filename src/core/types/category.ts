/**
 * Represents a product category.
 */
export interface Category {
  id: string // slug or unique identifier (e.g., 't-shirt', 'jacket')
  name: string // Display name (e.g., 'T-Shirt', 'Jacket')
  iconName: string // Key of the React Icons component to render
}
