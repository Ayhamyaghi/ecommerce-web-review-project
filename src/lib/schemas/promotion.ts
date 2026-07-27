import { z } from 'zod';

export const createPromotionSchema = z
  .object({
    code: z
      .string({ error: 'code is required' })
      .min(2, 'code must be at least 2 characters')
      .max(20, 'code must be at most 20 characters')
      .transform((v) => v.toUpperCase().replace(/[^A-Z0-9]/g, '')),
    type: z.enum(['percentage', 'fixed', 'free_shipping'], {
      error: "type must be 'percentage', 'fixed', or 'free_shipping'",
    }),
    value: z
      .number({ error: 'value must be a number' })
      .min(0, 'value must be non-negative'),
    minOrderAmount: z
      .number({ error: 'minOrderAmount must be a number' })
      .int('minOrderAmount must be an integer')
      .min(0, 'minOrderAmount cannot be negative')
      .default(0),
    maxDiscount: z
      .number({ error: 'maxDiscount must be a number' })
      .int('maxDiscount must be an integer')
      .min(1, 'maxDiscount must be at least 1')
      .nullable()
      .optional(),
    usageLimit: z
      .number({ error: 'usageLimit must be a number' })
      .int('usageLimit must be an integer')
      .min(1, 'usageLimit must be at least 1')
      .nullable()
      .optional(),
    description: z
      .string({ error: 'description is required' })
      .min(1, 'description must not be empty')
      .max(500, 'description must be at most 500 characters'),
    active: z.boolean().default(true),
    startsAt: z.string({ error: 'startsAt is required' }).datetime('startsAt must be a valid ISO datetime'),
    expiresAt: z.string({ error: 'expiresAt is required' }).datetime('expiresAt must be a valid ISO datetime'),
  })
  .refine((data) => data.expiresAt > data.startsAt, {
    message: 'expiresAt must be after startsAt',
    path: ['expiresAt'],
  })
  .refine(
    (data) => data.type !== 'percentage' || data.value <= 100,
    {
      message: 'Percentage discount value must be between 0 and 100',
      path: ['value'],
    },
  );

export const validatePromotionSchema = z.object({
  code: z
    .string({ error: 'code is required' })
    .min(1, 'code must not be empty'),
  subtotal: z
    .number({ error: 'subtotal must be a number' })
    .int('subtotal must be an integer')
    .min(0, 'subtotal cannot be negative'),
});

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
export type ValidatePromotionInput = z.infer<typeof validatePromotionSchema>;
