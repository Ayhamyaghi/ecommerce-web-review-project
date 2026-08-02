import { z } from 'zod';

export const adjustStockSchema = z.object({
  stock: z
    .number({ error: 'stock must be a number' })
    .int('stock must be an integer')
    .min(0, 'stock cannot be negative'),
  reason: z
    .enum(['manual_adjustment', 'restock'], {
      error: "reason must be 'manual_adjustment' or 'restock'",
    })
    .optional()
    .default('manual_adjustment'),
});

export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
