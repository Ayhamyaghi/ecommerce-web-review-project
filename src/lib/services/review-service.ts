import { loadDb, saveDb, generateId, type DbReview } from '../db/store';
import { NotFoundError, ConflictError, AuthorizationError } from '../errors';
import type { CreateReviewInput, UpdateReviewInput, ReviewQuery } from '../schemas/review';

export interface ReviewStats { averageRating: number; totalReviews: number; distribution: Record<number, number>; }

function calcStats(reviews: DbReview[]): ReviewStats {
  const approved = reviews.filter(r => r.status === 'approved');
  if (!approved.length) return { averageRating: 0, totalReviews: 0, distribution: { 1:0,2:0,3:0,4:0,5:0 } };
  const dist: Record<number,number> = { 1:0,2:0,3:0,4:0,5:0 };
  let sum = 0;
  for (const r of approved) { dist[r.rating] = (dist[r.rating]||0)+1; sum += r.rating; }
  return { averageRating: Math.round((sum/approved.length)*10)/10, totalReviews: approved.length, distribution: dist };
}

export function getProductReviews(productId: string, query: ReviewQuery, currentUserId?: string) {
  const db = loadDb();
  const reviews = db.reviews.filter(r => r.productId === productId && r.status === 'approved');
  switch (query.sort) {
    case 'oldest': reviews.sort((a,b) => a.createdAt.localeCompare(b.createdAt)); break;
    case 'highest': reviews.sort((a,b) => b.rating - a.rating); break;
    case 'lowest': reviews.sort((a,b) => a.rating - b.rating); break;
    case 'most-helpful': reviews.sort((a,b) => b.helpfulVotes - a.helpfulVotes); break;
    default: reviews.sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  }
  const total = reviews.length;
  const start = (query.page - 1) * query.pageSize;
  return { reviews: reviews.slice(start, start + query.pageSize).map(r => ({ ...r, canEdit: r.userId === currentUserId })), total, stats: calcStats(db.reviews.filter(r => r.productId === productId)) };
}

export function createReview(userId: string, authorName: string, input: CreateReviewInput): DbReview {
  const db = loadDb();
  if (!db.products.find(p => p.id === input.productId)) throw new NotFoundError('Product', input.productId);
  if (db.reviews.find(r => r.userId === userId && r.productId === input.productId)) throw new ConflictError('You have already reviewed this product');
  const hasOrdered = db.orderItems.some(oi => oi.productId === input.productId && db.orders.some(o => o.id === oi.orderId && o.userId === userId && o.status !== 'cancelled'));
  const now = new Date().toISOString();
  const review: DbReview = { id: generateId(), productId: input.productId, userId, authorName, rating: input.rating, title: input.title, body: input.body, verified: hasOrdered, status: 'approved', helpfulVotes: 0, createdAt: now, updatedAt: now };
  db.reviews.push(review);
  saveDb(db);
  return review;
}

export function updateReview(reviewId: string, userId: string, input: UpdateReviewInput, isAdmin = false): DbReview {
  const db = loadDb();
  const r = db.reviews.find(r => r.id === reviewId);
  if (!r) throw new NotFoundError('Review', reviewId);
  if (!isAdmin && r.userId !== userId) throw new AuthorizationError('You can only edit your own reviews');
  if (input.rating !== undefined) r.rating = input.rating;
  if (input.title !== undefined) r.title = input.title;
  if (input.body !== undefined) r.body = input.body;
  if (input.status !== undefined && isAdmin) r.status = input.status;
  r.updatedAt = new Date().toISOString();
  saveDb(db);
  return r;
}

export function deleteReview(reviewId: string, userId: string, isAdmin: boolean): void {
  const db = loadDb();
  const r = db.reviews.find(r => r.id === reviewId);
  if (!r) throw new NotFoundError('Review', reviewId);
  if (!isAdmin && r.userId !== userId) throw new AuthorizationError('You can only delete your own reviews');
  db.reviews = db.reviews.filter(r => r.id !== reviewId);
  saveDb(db);
}

export function voteHelpful(reviewId: string): DbReview {
  const db = loadDb();
  const r = db.reviews.find(r => r.id === reviewId);
  if (!r) throw new NotFoundError('Review', reviewId);
  r.helpfulVotes++;
  saveDb(db);
  return r;
}

export function listAllReviews(query: ReviewQuery) {
  const db = loadDb();
  let reviews = [...db.reviews];
  if (query.status) reviews = reviews.filter(r => r.status === query.status);
  if (query.productId) reviews = reviews.filter(r => r.productId === query.productId);
  reviews.sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  const total = reviews.length;
  const start = (query.page - 1) * query.pageSize;
  return { reviews: reviews.slice(start, start + query.pageSize), total };
}
