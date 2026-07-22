import { z } from 'zod';

export const checkoutSchema = z.object({
  shippingAddress: z.object({
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
    address: z.string().min(5, 'Address must be at least 5 characters').max(200),
    city: z.string().min(1, 'City is required').max(100),
    state: z.string().min(1, 'State is required').max(100),
    postalCode: z.string().min(1, 'Postal code is required').max(20),
    country: z.string().min(1, 'Country is required').max(100),
  }),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  paymentMethod: z.enum(['credit_card','debit_card','paypal']),
  promotionCode: z.string().optional(),
});

export const orderStatusUpdateSchema = z.object({
  status: z.enum(['pending','processing','shipped','delivered','cancelled']),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type OrderStatusUpdate = z.infer<typeof orderStatusUpdateSchema>;
