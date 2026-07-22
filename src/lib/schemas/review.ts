import { z } from 'zod';

export const createReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(3).max(100),
  body: z.string().min(10).max(2000),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().min(3).max(100).optional(),
  body: z.string().min(10).max(2000).optional(),
  status: z.enum(['pending','approved','rejected']).optional(),
});

export const reviewQuerySchema = z.object({
  productId: z.string().optional(),
  sort: z.enum(['newest','oldest','highest','lowest','most-helpful']).optional().default('newest'),
  status: z.enum(['pending','approved','rejected']).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ReviewQuery = z.infer<typeof reviewQuerySchema>;
