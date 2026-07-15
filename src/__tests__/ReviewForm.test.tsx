import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReviewForm } from '../components/ReviewForm';
import type { ValidationError } from '../lib/types';

function fillForm(overrides: Record<string, string> = {}) {
  const defaults: Record<string, string> = {
    authorName: 'Alice',
    authorEmail: 'alice@example.com',
    reviewTitle: 'Great product',
    reviewBody: 'I really enjoyed using this product, highly recommend it.',
  };
  const values = { ...defaults, ...overrides };

  fireEvent.change(screen.getByLabelText('Name'), { target: { value: values.authorName } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: values.authorEmail } });
  fireEvent.change(screen.getByLabelText('Title'), { target: { value: values.reviewTitle } });
  fireEvent.change(screen.getByLabelText('Review'), { target: { value: values.reviewBody } });

  // Click 4th star for rating
  const stars = screen.getAllByRole('radio');
  fireEvent.click(stars[3]);
}

describe('ReviewForm', () => {
  it('renders all form fields', () => {
    render(<ReviewForm onSubmit={() => []} />);

    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Review')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit Review' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(5);
  });

  it('calls onSubmit with form data when submitted', () => {
    const onSubmit = vi.fn<(data: unknown) => ValidationError[]>().mockReturnValue([]);
    render(<ReviewForm onSubmit={onSubmit} />);

    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Submit Review' }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        authorName: 'Alice',
        authorEmail: 'alice@example.com',
        rating: 4,
        title: 'Great product',
      })
    );
  });

  it('displays validation errors when onSubmit returns errors', () => {
    const errors: ValidationError[] = [
      { field: 'rating', message: 'Rating is required' },
      { field: 'body', message: 'Review must be at least 10 characters' },
    ];
    const onSubmit = vi.fn().mockReturnValue(errors);
    render(<ReviewForm onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: 'Submit Review' }));

    expect(screen.getByText('Rating is required')).toBeInTheDocument();
    expect(screen.getByText('Review must be at least 10 characters')).toBeInTheDocument();
  });

  it('does not show success message when validation fails', () => {
    const onSubmit = vi.fn().mockReturnValue([
      { field: 'rating', message: 'Rating is required' },
    ]);
    render(<ReviewForm onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: 'Submit Review' }));

    expect(screen.queryByText('Review submitted successfully!')).not.toBeInTheDocument();
  });

  it('shows success message and resets form on valid submission', () => {
    const onSubmit = vi.fn().mockReturnValue([]);
    render(<ReviewForm onSubmit={onSubmit} />);

    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Submit Review' }));

    expect(screen.getByText('Review submitted successfully!')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('');
    expect(screen.getByLabelText('Email')).toHaveValue('');
  });
});
