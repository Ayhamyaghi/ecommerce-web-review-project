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
