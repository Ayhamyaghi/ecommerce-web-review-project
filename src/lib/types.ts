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

export interface Promotion {
  code: string;
  type: 'percentage' | 'fixed' | 'free-shipping';
  /** For percentage: discount rate (e.g. 10 = 10%). For fixed: amount in cents. */
  value: number;
  /** Minimum cart subtotal in cents required to use this promotion */
  minSubtotal: number;
  /** Maximum discount in cents (only applies to percentage type) */
  maxDiscount: number | null;
  description: string;
}

export interface AppliedPromotion {
  code: string;
  /** The actual discount amount applied, in cents */
  discountAmount: number;
  /** Whether this promotion grants free shipping */
  freeShipping: boolean;
}

export interface PricingBreakdown {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

export interface PromotionValidationResult {
  valid: boolean;
  message: string;
  promotion?: Promotion;
}

export interface Review {
  id: string;
  productId: string;
  authorName: string;
  authorEmail: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  helpfulVotes: number;
}

export interface ReviewFormData {
  authorName: string;
  authorEmail: string;
  rating: number;
  title: string;
  body: string;
}

export interface ValidationError {
  field: keyof ReviewFormData;
  message: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
}

export type ReviewSortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'most-helpful';
