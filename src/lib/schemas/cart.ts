import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z
    .string({ error: 'productId is required' })
    .min(1, 'productId must not be empty'),
  quantity: z
    .number({ error: 'quantity must be a number' })
    .int('quantity must be an integer')
    .min(1, 'quantity must be at least 1')
    .max(99, 'quantity must be at most 99'),
});

export const updateCartItemSchema = z.object({
  productId: z
    .string({ error: 'productId is required' })
    .min(1, 'productId must not be empty'),
  quantity: z
    .number({ error: 'quantity must be a number' })
    .int('quantity must be an integer')
    .min(0, 'quantity cannot be negative')
    .max(99, 'quantity must be at most 99'),
});

export const removeCartItemSchema = z.object({
  productId: z
    .string({ error: 'productId is required' })
    .min(1, 'productId must not be empty'),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type RemoveCartItemInput = z.infer<typeof removeCartItemSchema>;
