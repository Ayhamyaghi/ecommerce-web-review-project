import { z } from 'zod';

export const createReviewSchema = z.object({
  productId: z
    .string({ error: 'productId is required' })
    .min(1, 'productId must not be empty'),
  rating: z
    .number({ error: 'rating must be a number' })
    .int('rating must be an integer')
    .min(1, 'rating must be at least 1')
    .max(5, 'rating must be at most 5'),
  title: z
    .string({ error: 'title is required' })
    .trim()
    .min(3, 'title must be at least 3 characters')
    .max(100, 'title must be at most 100 characters'),
  body: z
    .string({ error: 'body is required' })
    .trim()
    .min(10, 'body must be at least 10 characters')
    .max(2000, 'body must be at most 2000 characters'),
});

export const updateReviewSchema = z
  .object({
    rating: z
      .number({ error: 'rating must be a number' })
      .int('rating must be an integer')
      .min(1, 'rating must be at least 1')
      .max(5, 'rating must be at most 5')
      .optional(),
    title: z
      .string()
      .trim()
      .min(3, 'title must be at least 3 characters')
      .max(100, 'title must be at most 100 characters')
      .optional(),
    body: z
      .string()
      .trim()
      .min(10, 'body must be at least 10 characters')
      .max(2000, 'body must be at most 2000 characters')
      .optional(),
    status: z.enum(['pending', 'approved', 'rejected']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const reviewQuerySchema = z.object({
  productId: z.string().optional(),
  sort: z.enum(['newest', 'oldest', 'highest', 'lowest', 'most-helpful']).optional().default('newest'),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ReviewQuery = z.infer<typeof reviewQuerySchema>;
