import { z } from 'zod';

export const wishlistProductSchema = z.object({
  productId: z
    .string({ error: 'productId is required' })
    .min(1, 'productId must not be empty'),
});

export type WishlistProductInput = z.infer<typeof wishlistProductSchema>;
