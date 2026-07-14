export interface Product {
  id: string;
  name: string;
  description: string;
  /** Price in cents (integer) to avoid floating-point issues */
  price: number;
  category: string;
  image: string;
  stock: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export type SortOption =
  | 'relevance'
  | 'price-asc'
  | 'price-desc'
  | 'name-asc'
  | 'name-desc';

export interface FilterState {
  search: string;
  category: string | null;
  priceRange: { min: number; max: number } | null;
  sort: SortOption;
}
