import { NextRequest } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';
import { handleApiRoute } from '@/lib/api-utils';
import { validatePromotionSchema } from '@/lib/schemas/promotion';
import { validatePromotionCode } from '@/lib/services/promotion-service';

export async function POST(request: NextRequest) {
  seedDatabase();
  return handleApiRoute(async () => {
    const body = await request.json();
    const input = validatePromotionSchema.parse(body);
    return validatePromotionCode(input.code, input.subtotal);
  });
}
