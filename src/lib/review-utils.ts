import type { Review, ReviewFormData, ReviewStats, ReviewSortOption } from './types';

export function calculateReviewStats(reviews: Review[]): ReviewStats {
  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;

  for (const review of reviews) {
    sum += review.rating;
    distribution[review.rating] = (distribution[review.rating] || 0) + 1;
  }

  const averageRating = Math.round((sum / reviews.length) * 10) / 10;

  return { averageRating, totalReviews: reviews.length, distribution };
}

export function sortReviews(reviews: Review[], sort: ReviewSortOption): Review[] {
  const sorted = [...reviews];

  sorted.sort((a, b) => {
    switch (sort) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'highest':
        return b.rating - a.rating || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'lowest':
        return a.rating - b.rating || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'most-helpful':
        return b.helpfulVotes - a.helpfulVotes || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  return sorted;
}

let idCounter = 0;

export function createReview(formData: ReviewFormData, productId: string): Review {
  idCounter += 1;
  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `review-${Date.now()}-${idCounter}`;

  return {
    id,
    productId,
    authorName: formData.authorName.trim(),
    authorEmail: formData.authorEmail.trim().toLowerCase(),
    rating: formData.rating,
    title: formData.title.trim(),
    body: formData.body.trim(),
    createdAt: new Date().toISOString(),
    helpfulVotes: 0,
  };
}

export function incrementHelpfulVote(review: Review): Review {
  return { ...review, helpfulVotes: review.helpfulVotes + 1 };
}
