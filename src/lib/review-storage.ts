import type { Review } from './types';

const STORAGE_KEY = 'ecommerce-reviews';

export function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function isValidReview(item: unknown): item is Review {
  if (typeof item !== 'object' || item === null) return false;
  const obj = item as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.productId === 'string' &&
    typeof obj.authorName === 'string' &&
    typeof obj.authorEmail === 'string' &&
    typeof obj.rating === 'number' &&
    Number.isInteger(obj.rating) &&
    obj.rating >= 1 &&
    obj.rating <= 5 &&
    typeof obj.title === 'string' &&
    typeof obj.body === 'string' &&
    typeof obj.createdAt === 'string' &&
    typeof obj.helpfulVotes === 'number'
  );
}

export function validateStoredReviews(data: unknown): Review[] | null {
  if (!Array.isArray(data)) return null;
  const valid = data.filter(isValidReview);
  return valid.length > 0 || data.length === 0 ? valid : null;
}

export function loadReviews(): Review[] {
  if (!isStorageAvailable()) return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    return validateStoredReviews(parsed) ?? [];
  } catch {
    return [];
  }
}

export function saveReviews(reviews: Review[]): void {
  if (!isStorageAvailable()) return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  } catch {
    // Silent failure — quota exceeded or storage unavailable
  }
}
