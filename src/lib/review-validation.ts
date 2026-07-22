import type { ReviewFormData, ValidationError, Review } from './types';

export function validateRating(rating: number): string | null {
  if (typeof rating !== 'number' || isNaN(rating)) {
    return 'Rating is required';
  }
  if (!Number.isInteger(rating)) {
    return 'Rating must be a whole number';
  }
  if (rating < 1 || rating > 5) {
    return 'Rating must be between 1 and 5';
  }
  return null;
}

export function validateAuthorName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return 'Name is required';
  }
  if (trimmed.length < 2) {
    return 'Name must be at least 2 characters';
  }
  if (trimmed.length > 50) {
    return 'Name must be 50 characters or fewer';
  }
  if (!/[a-zA-Z]/.test(trimmed)) {
    return 'Name must contain at least one letter';
  }
  return null;
}

export function validateAuthorEmail(email: string): string | null {
  const trimmed = email.trim();
  if (trimmed.length === 0) {
    return 'Email is required';
  }
  if (trimmed.length > 254) {
    return 'Email is too long';
  }
  const atIndex = trimmed.indexOf('@');
  if (atIndex < 1) {
    return 'Email must contain a valid @ symbol';
  }
  const domain = trimmed.slice(atIndex + 1);
  if (!domain.includes('.') || domain.endsWith('.') || domain.startsWith('.')) {
    return 'Email must have a valid domain';
  }
  return null;
}

export function validateTitle(title: string): string | null {
  const trimmed = title.trim();
  if (trimmed.length === 0) {
    return 'Title is required';
  }
  if (trimmed.length < 3) {
    return 'Title must be at least 3 characters';
  }
  if (trimmed.length > 100) {
    return 'Title must be 100 characters or fewer';
  }
  return null;
}

export function validateBody(body: string): string | null {
  const trimmed = body.trim();
  if (trimmed.length === 0) {
    return 'Review body is required';
  }
  if (trimmed.length < 10) {
    return 'Review must be at least 10 characters';
  }
  if (trimmed.length > 2000) {
    return 'Review must be 2000 characters or fewer';
  }
  return null;
}

export function sanitizeText(text: string): string {
  return text
    .trim()
    .replace(/<[^>]*>/g, '')
    .replace(/\n{3,}/g, '\n\n');
}

export function isDuplicateReview(
  existingReviews: Review[],
  authorEmail: string,
  productId: string
): boolean {
  const normalizedEmail = authorEmail.trim().toLowerCase();
  return existingReviews.some(
    (r) =>
      r.productId === productId &&
      r.authorEmail.toLowerCase() === normalizedEmail
  );
}

export function validateReviewForm(data: ReviewFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  const ratingError = validateRating(data.rating);
  if (ratingError) errors.push({ field: 'rating', message: ratingError });

  const nameError = validateAuthorName(data.authorName);
  if (nameError) errors.push({ field: 'authorName', message: nameError });

  const emailError = validateAuthorEmail(data.authorEmail);
  if (emailError) errors.push({ field: 'authorEmail', message: emailError });

  const titleError = validateTitle(data.title);
  if (titleError) errors.push({ field: 'title', message: titleError });

  const bodyError = validateBody(data.body);
  if (bodyError) errors.push({ field: 'body', message: bodyError });

  return errors;
}
