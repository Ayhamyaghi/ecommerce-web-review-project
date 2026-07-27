import { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';
import { zodErrorResponse, errorResponse } from '@/lib/api-utils';
import { ValidationError } from '@/lib/errors';
import { ZodError } from 'zod';
import { z } from 'zod';

// Checkout-specific schema for direct payment-gateway integration
const checkoutRequestSchema = z.object({
  orderId: z
    .string({ error: 'orderId is required' })
    .min(1, 'orderId must not be empty'),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'item productId must not be empty'),
        name: z.string().min(1, 'item name must not be empty'),
        price: z
          .number({ error: 'item price must be a number' })
          .min(0, 'item price cannot be negative'),
        quantity: z
          .number({ error: 'item quantity must be a number' })
          .int('item quantity must be an integer')
          .min(1, 'item quantity must be at least 1'),
      }),
      { error: 'items is required' },
    )
    .min(1, 'items must contain at least one item'),
  paymentMethod: z.enum(['credit_card', 'debit_card', 'paypal'], {
    error: "paymentMethod must be 'credit_card', 'debit_card', or 'paypal'",
  }),
  email: z.string().trim().email('email must be a valid email address').optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(new ValidationError('Request body must be valid JSON'));
  }

  let parsed: z.infer<typeof checkoutRequestSchema>;
  try {
    parsed = checkoutRequestSchema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    throw err;
  }

  const { orderId, items, paymentMethod, email } = parsed;

  logger.info('Processing checkout', { orderId, itemCount: items.length, paymentMethod });

  const paymentApiUrl = process.env.PAYMENT_API_URL;

  if (paymentApiUrl) {
    try {
      const checkoutResponse = await fetch(`${paymentApiUrl}/api/process-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, items, paymentMethod, email }),
      });

      if (!checkoutResponse.ok) {
        logger.error('Payment API returned non-OK status', {
          status: checkoutResponse.status,
          orderId,
        });
        return Response.json(
          {
            success: false,
            error: { code: 'PAYMENT_FAILED', message: 'Payment processing failed' },
          },
          { status: 502 },
        );
      }

      const result = await checkoutResponse.json();
      logger.info('Checkout processed via payment API', { orderId });
      return Response.json({ success: true, data: result });
    } catch (err) {
      logger.error('Payment API request failed', { error: String(err), orderId });
      return Response.json(
        {
          success: false,
          error: { code: 'INTERNAL_ERROR', message: 'Payment gateway unreachable' },
        },
        { status: 503 },
      );
    }
  }

  // No payment API configured — simulate success
  logger.info('Simulating checkout (PAYMENT_API_URL not set)', { orderId });
  return Response.json({
    success: true,
    data: {
      orderId,
      status: 'processing',
      message: 'Order received (simulated).',
      processedAt: new Date().toISOString(),
    },
  });
}
