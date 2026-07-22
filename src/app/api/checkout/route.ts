import { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';
import type { ApiResponse, OrderItem } from '@/lib/types';

interface CheckoutRequestBody {
  orderId?: string;
  items?: OrderItem[];
  paymentMethod?: string;
  email?: string;
}

function isValidOrderItem(item: unknown): item is OrderItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof (item as OrderItem).productId === 'string' &&
    typeof (item as OrderItem).name === 'string' &&
    typeof (item as OrderItem).price === 'number' &&
    (item as OrderItem).price >= 0 &&
    typeof (item as OrderItem).quantity === 'number' &&
    (item as OrderItem).quantity >= 1 &&
    Number.isInteger((item as OrderItem).quantity)
  );
}

export async function POST(request: NextRequest) {
  let body: CheckoutRequestBody;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, error: 'Invalid JSON body.', code: 'INVALID_JSON' } satisfies ApiResponse<never>,
      { status: 400 },
    );
  }

  const { orderId, items, paymentMethod, email } = body;

  if (!orderId || typeof orderId !== 'string') {
    return Response.json(
      { success: false, error: 'orderId is required.', code: 'MISSING_ORDER_ID' } satisfies ApiResponse<never>,
      { status: 400 },
    );
  }

  if (!Array.isArray(items) || items.length === 0) {
    return Response.json(
      { success: false, error: 'items must be a non-empty array.', code: 'MISSING_ITEMS' } satisfies ApiResponse<never>,
      { status: 400 },
    );
  }

  for (const item of items) {
    if (!isValidOrderItem(item)) {
      return Response.json(
        {
          success: false,
          error: 'Each item must have productId (string), name (string), price (number ≥ 0), quantity (integer ≥ 1).',
          code: 'INVALID_ITEM',
        } satisfies ApiResponse<never>,
        { status: 400 },
      );
    }
  }

  const validPaymentMethods = ['credit_card', 'debit_card', 'paypal'];
  if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
    return Response.json(
      {
        success: false,
        error: `paymentMethod must be one of: ${validPaymentMethods.join(', ')}`,
        code: 'INVALID_PAYMENT_METHOD',
      } satisfies ApiResponse<never>,
      { status: 400 },
    );
  }

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
          { success: false, error: 'Payment processing failed.', code: 'PAYMENT_FAILED' } satisfies ApiResponse<never>,
          { status: 502 },
        );
      }

      const result = await checkoutResponse.json();
      logger.info('Checkout processed via payment API', { orderId });
      return Response.json({ success: true, data: result } satisfies ApiResponse<unknown>);
    } catch (err) {
      logger.error('Payment API request failed', { error: String(err), orderId });
      return Response.json(
        { success: false, error: 'Payment gateway unreachable.', code: 'GATEWAY_UNREACHABLE' } satisfies ApiResponse<never>,
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
  } satisfies ApiResponse<unknown>);
}
