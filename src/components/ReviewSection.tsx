'use client';

import { useReviews } from '../hooks/useReviews';
import { StarDisplay } from './StarDisplay';
import { ReviewForm } from './ReviewForm';
import type { ReviewSortOption } from '../lib/types';

interface ReviewSectionProps {
  productId: string;
}

const SORT_LABELS: Record<ReviewSortOption, string> = {
  newest: 'Newest First',
  oldest: 'Oldest First',
  highest: 'Highest Rated',
  lowest: 'Lowest Rated',
  'most-helpful': 'Most Helpful',
};

export function ReviewSection({ productId }: ReviewSectionProps) {
  const { reviews, stats, isHydrated, sortOption, setSortOption, submitReview, voteHelpful } =
    useReviews(productId);

  if (!isHydrated) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-48" />
        <div className="h-4 bg-gray-200 rounded w-32" />
        <div className="h-32 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Review Summary */}
      <div>
        <h2 className="text-xl font-bold mb-3">Customer Reviews</h2>
        {stats.totalReviews > 0 ? (
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.averageRating}</div>
              <StarDisplay rating={stats.averageRating} />
              <div className="text-sm text-gray-500">{stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}</div>
            </div>
            <div className="flex-1 max-w-xs space-y-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.distribution[star] || 0;
                const pct = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-8 text-right">{star}★</span>
                    <div className="flex-1 bg-gray-200 rounded h-2">
                      <div
                        className="bg-yellow-400 rounded h-2 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-gray-500">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 mb-4">No reviews yet. Be the first to review this product!</p>
        )}
      </div>

      {/* Review Form */}
      <ReviewForm onSubmit={submitReview} />

      {/* Review List */}
      {reviews.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">All Reviews</h3>
            <label className="flex items-center gap-2 text-sm">
              Sort by:
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as ReviewSortOption)}
                className="border rounded px-2 py-1 text-sm"
              >
                {(Object.keys(SORT_LABELS) as ReviewSortOption[]).map((key) => (
                  <option key={key} value={key}>{SORT_LABELS[key]}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="space-y-4">
            {reviews.map((review) => (
              <article key={review.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <StarDisplay rating={review.rating} size="sm" />
                    <span className="ml-2 font-medium">{review.title}</span>
                  </div>
                  <time className="text-sm text-gray-500" dateTime={review.createdAt}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </time>
                </div>
                <p className="text-sm text-gray-600 mb-2">By {review.authorName}</p>
                <p className="text-sm mb-3 whitespace-pre-line">{review.body}</p>
                <button
                  type="button"
                  onClick={() => voteHelpful(review.id)}
                  className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                >
                  👍 Helpful ({review.helpfulVotes})
                </button>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
