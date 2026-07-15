'use client';

import { useReducer, useEffect, useCallback, useRef } from 'react';
import type { Review, ReviewFormData, ValidationError, ReviewSortOption } from '../lib/types';
import { validateReviewForm, isDuplicateReview, sanitizeText } from '../lib/review-validation';
import { createReview, sortReviews, incrementHelpfulVote, calculateReviewStats } from '../lib/review-utils';
import { loadReviews, saveReviews } from '../lib/review-storage';

interface ReviewState {
  reviews: Review[];
  isHydrated: boolean;
  sortOption: ReviewSortOption;
}

type ReviewAction =
  | { type: 'HYDRATE'; reviews: Review[] }
  | { type: 'ADD_REVIEW'; review: Review }
  | { type: 'VOTE_HELPFUL'; reviewId: string }
  | { type: 'SET_SORT'; sort: ReviewSortOption };

function reviewReducer(state: ReviewState, action: ReviewAction): ReviewState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, reviews: action.reviews, isHydrated: true };
    case 'ADD_REVIEW':
      return { ...state, reviews: [action.review, ...state.reviews] };
    case 'VOTE_HELPFUL':
      return {
        ...state,
        reviews: state.reviews.map((r) =>
          r.id === action.reviewId ? incrementHelpfulVote(r) : r
        ),
      };
    case 'SET_SORT':
      return { ...state, sortOption: action.sort };
    default:
      return state;
  }
}

const initialState: ReviewState = {
  reviews: [],
  isHydrated: false,
  sortOption: 'newest',
};

export function useReviews(productId: string) {
  const [state, dispatch] = useReducer(reviewReducer, initialState);
  const isHydratedRef = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = loadReviews();
    dispatch({ type: 'HYDRATE', reviews: stored });
    isHydratedRef.current = true;
  }, []);

  // Save to localStorage when reviews change (only after hydration)
  useEffect(() => {
    if (isHydratedRef.current) {
      saveReviews(state.reviews);
    }
  }, [state.reviews]);

  const productReviews = state.reviews.filter((r) => r.productId === productId);
  const sortedReviews = sortReviews(productReviews, state.sortOption);
  const stats = calculateReviewStats(productReviews);

  const submitReview = useCallback(
    (formData: ReviewFormData): ValidationError[] => {
      const sanitizedData: ReviewFormData = {
        ...formData,
        authorName: sanitizeText(formData.authorName),
        title: sanitizeText(formData.title),
        body: sanitizeText(formData.body),
      };

      const errors = validateReviewForm(sanitizedData);
      if (errors.length > 0) return errors;

      if (isDuplicateReview(state.reviews, sanitizedData.authorEmail, productId)) {
        return [{ field: 'authorEmail', message: 'You have already reviewed this product' }];
      }

      const review = createReview(sanitizedData, productId);
      dispatch({ type: 'ADD_REVIEW', review });
      return [];
    },
    [state.reviews, productId]
  );

  const voteHelpful = useCallback((reviewId: string) => {
    dispatch({ type: 'VOTE_HELPFUL', reviewId });
  }, []);

  const setSortOption = useCallback((sort: ReviewSortOption) => {
    dispatch({ type: 'SET_SORT', sort });
  }, []);

  return {
    reviews: sortedReviews,
    stats,
    isHydrated: state.isHydrated,
    sortOption: state.sortOption,
    setSortOption,
    submitReview,
    voteHelpful,
  };
}
