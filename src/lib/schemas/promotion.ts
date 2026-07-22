import { z } from 'zod';

export const createPromotionSchema = z.object({
  code: z.string().min(2).max(20).transform(v => v.toUpperCase().replace(/[^A-Z0-9]/g, '')),
  type: z.enum(['percentage','fixed','free_shipping']),
  value: z.number().min(0),
  minOrderAmount: z.number().int().min(0).default(0),
  maxDiscount: z.number().int().min(1).nullable().optional(),
  usageLimit: z.number().int().min(1).nullable().optional(),
  description: z.string().min(1).max(500),
  active: z.boolean().default(true),
  startsAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
});

export const validatePromotionSchema = z.object({
  code: z.string().min(1),
  subtotal: z.number().int().min(0),
});

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
export type ValidatePromotionInput = z.infer<typeof validatePromotionSchema>;
