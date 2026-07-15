'use client';

import { useState } from 'react';
import type { ReviewFormData, ValidationError } from '../lib/types';
import { StarRating } from './StarRating';

interface ReviewFormProps {
  onSubmit: (data: ReviewFormData) => ValidationError[];
}

const INITIAL_FORM: ReviewFormData = {
  authorName: '',
  authorEmail: '',
  rating: 0,
  title: '',
  body: '',
};

export function ReviewForm({ onSubmit }: ReviewFormProps) {
  const [formData, setFormData] = useState<ReviewFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [success, setSuccess] = useState(false);

  function getError(field: keyof ReviewFormData): string | undefined {
    return errors.find((e) => e.field === field)?.message;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(false);

    const validationErrors = onSubmit(formData);
    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      setFormData(INITIAL_FORM);
      setSuccess(true);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <h3 className="text-lg font-semibold">Write a Review</h3>

      {success && (
        <p className="text-green-700 bg-green-50 px-3 py-2 rounded text-sm" role="status">
          Review submitted successfully!
        </p>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Rating</label>
        <StarRating
          value={formData.rating}
          onChange={(rating) => setFormData((prev) => ({ ...prev, rating }))}
        />
        {getError('rating') && (
          <p className="text-red-600 text-sm mt-1" role="alert">{getError('rating')}</p>
        )}
      </div>

      <div>
        <label htmlFor="authorName" className="block text-sm font-medium mb-1">Name</label>
        <input
          id="authorName"
          type="text"
          value={formData.authorName}
          onChange={(e) => setFormData((prev) => ({ ...prev, authorName: e.target.value }))}
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Your name"
        />
        {getError('authorName') && (
          <p className="text-red-600 text-sm mt-1" role="alert">{getError('authorName')}</p>
        )}
      </div>

      <div>
        <label htmlFor="authorEmail" className="block text-sm font-medium mb-1">Email</label>
        <input
          id="authorEmail"
          type="email"
          value={formData.authorEmail}
          onChange={(e) => setFormData((prev) => ({ ...prev, authorEmail: e.target.value }))}
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="your@email.com"
        />
        {getError('authorEmail') && (
          <p className="text-red-600 text-sm mt-1" role="alert">{getError('authorEmail')}</p>
        )}
      </div>

      <div>
        <label htmlFor="reviewTitle" className="block text-sm font-medium mb-1">Title</label>
        <input
          id="reviewTitle"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Review title"
        />
        {getError('title') && (
          <p className="text-red-600 text-sm mt-1" role="alert">{getError('title')}</p>
        )}
      </div>

      <div>
        <label htmlFor="reviewBody" className="block text-sm font-medium mb-1">Review</label>
        <textarea
          id="reviewBody"
          value={formData.body}
          onChange={(e) => setFormData((prev) => ({ ...prev, body: e.target.value }))}
          className="w-full border rounded px-3 py-2 text-sm min-h-[100px]"
          placeholder="Write your review (at least 10 characters)"
        />
        {getError('body') && (
          <p className="text-red-600 text-sm mt-1" role="alert">{getError('body')}</p>
        )}
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 transition-colors"
      >
        Submit Review
      </button>
    </form>
  );
}
