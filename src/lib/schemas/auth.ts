import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string({ error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Invalid email address')
    .max(254, 'Email must be at most 254 characters'),
  password: z
    .string({ error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be at most 100 characters'),
});

export const loginSchema = z.object({
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Invalid email address'),
  password: z
    .string({ error: 'Password is required' })
    .min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
