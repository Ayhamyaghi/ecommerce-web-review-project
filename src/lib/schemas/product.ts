import { z } from 'zod';

export const productQuerySchema = z.object({
  search: z.string().optional().default(''),
  category: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(['relevance','price-asc','price-desc','name-asc','name-desc','newest']).optional().default('relevance'),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(12),
  featured: z.coerce.boolean().optional(),
  status: z.enum(['active','draft','archived']).optional(),
});

export const createProductSchema = z.object({
  name: z
    .string({ error: 'name is required' })
    .min(2, 'name must be at least 2 characters')
    .max(200, 'name must be at most 200 characters'),
  slug: z
    .string({ error: 'slug is required' })
    .min(2, 'slug must be at least 2 characters')
    .max(200, 'slug must be at most 200 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens only'),
  description: z
    .string({ error: 'description is required' })
    .min(10, 'description must be at least 10 characters')
    .max(5000, 'description must be at most 5000 characters'),
  price: z
    .number({ error: 'price must be a number' })
    .int('price must be an integer (cents)')
    .min(1, 'price must be at least 1 cent'),
  compareAtPrice: z
    .number({ error: 'compareAtPrice must be a number' })
    .int('compareAtPrice must be an integer (cents)')
    .min(1, 'compareAtPrice must be at least 1 cent')
    .nullable()
    .optional(),
  category: z
    .string({ error: 'category is required' })
    .min(1, 'category must not be empty'),
  images: z
    .array(z.string().url('Each image must be a valid URL'), { error: 'images is required' })
    .min(1, 'At least one image is required'),
  specifications: z.record(z.string(), z.string()).optional().default({}),
  tags: z.array(z.string()).optional().default([]),
  featured: z.boolean().optional().default(false),
  status: z.enum(['active', 'draft', 'archived']).optional().default('active'),
  stock: z
    .number({ error: 'stock must be a number' })
    .int('stock must be an integer')
    .min(0, 'stock cannot be negative')
    .optional()
    .default(0),
  lowStockThreshold: z
    .number({ error: 'lowStockThreshold must be a number' })
    .int('lowStockThreshold must be an integer')
    .min(0, 'lowStockThreshold cannot be negative')
    .optional()
    .default(5),
});

export const updateProductSchema = createProductSchema.partial();
export type ProductQuery = z.infer<typeof productQuerySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
