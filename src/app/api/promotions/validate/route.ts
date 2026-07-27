import { NextRequest } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';
import { handleApiRoute, errorResponse } from '@/lib/api-utils';
import { validatePromotionSchema } from '@/lib/schemas/promotion';
import { validatePromotionCode } from '@/lib/services/promotion-service';
import { ValidationError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  seedDatabase();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(new ValidationError('Request body must be valid JSON'));
  }

  return handleApiRoute(async () => {
    const input = validatePromotionSchema.parse(body);
    return validatePromotionCode(input.code, input.subtotal);
  });
}
