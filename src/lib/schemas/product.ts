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
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  description: z.string().min(10).max(5000),
  price: z.number().int().min(1),
  compareAtPrice: z.number().int().min(1).nullable().optional(),
  category: z.string().min(1),
  images: z.array(z.string().url()).min(1),
  specifications: z.record(z.string(), z.string()).optional().default({}),
  tags: z.array(z.string()).optional().default([]),
  featured: z.boolean().optional().default(false),
  status: z.enum(['active','draft','archived']).optional().default('active'),
  stock: z.number().int().min(0).optional().default(0),
  lowStockThreshold: z.number().int().min(0).optional().default(5),
});

export const updateProductSchema = createProductSchema.partial();
export type ProductQuery = z.infer<typeof productQuerySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
