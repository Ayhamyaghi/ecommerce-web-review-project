import { z } from 'zod';

export const checkoutSchema = z.object({
  shippingAddress: z.object(
    {
      firstName: z
        .string({ error: 'First name is required' })
        .trim()
        .min(1, 'First name is required')
        .max(100, 'First name must be at most 100 characters'),
      lastName: z
        .string({ error: 'Last name is required' })
        .trim()
        .min(1, 'Last name is required')
        .max(100, 'Last name must be at most 100 characters'),
      address: z
        .string({ error: 'Address is required' })
        .trim()
        .min(5, 'Address must be at least 5 characters')
        .max(200, 'Address must be at most 200 characters'),
      city: z
        .string({ error: 'City is required' })
        .trim()
        .min(1, 'City is required')
        .max(100, 'City must be at most 100 characters'),
      state: z
        .string({ error: 'State is required' })
        .trim()
        .min(1, 'State is required')
        .max(100, 'State must be at most 100 characters'),
      postalCode: z
        .string({ error: 'Postal code is required' })
        .trim()
        .min(1, 'Postal code is required')
        .max(20, 'Postal code must be at most 20 characters'),
      country: z
        .string({ error: 'Country is required' })
        .trim()
        .min(1, 'Country is required')
        .max(100, 'Country must be at most 100 characters'),
    },
  ),
  email: z
    .string({ error: 'email is required' })
    .trim()
    .toLowerCase()
    .email('email must be a valid email address'),
  phone: z
    .string({ error: 'phone is required' })
    .trim()
    .min(7, 'phone must be at least 7 characters')
    .max(20, 'phone must be at most 20 characters'),
  paymentMethod: z.enum(['credit_card', 'debit_card', 'paypal'], {
    error: "paymentMethod must be 'credit_card', 'debit_card', or 'paypal'",
  }),
  promotionCode: z.string().trim().optional(),
});

export const orderStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'], {
    error: 'status must be one of: pending, processing, shipped, delivered, cancelled',
  }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type OrderStatusUpdate = z.infer<typeof orderStatusUpdateSchema>;
