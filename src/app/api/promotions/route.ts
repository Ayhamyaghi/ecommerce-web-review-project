import { NextRequest } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';
import { handleApiRoute } from '@/lib/api-utils';
import { requireAdmin } from '@/lib/auth/session';
import { createPromotionSchema } from '@/lib/schemas/promotion';
import { listPromotions, createPromotion } from '@/lib/services/promotion-service';

export async function GET(request: NextRequest) {
  seedDatabase();
  return handleApiRoute(async () => {
    await requireAdmin();
    return listPromotions();
  });
}

export async function POST(request: NextRequest) {
  seedDatabase();
  return handleApiRoute(async () => {
    await requireAdmin();
    const body = await request.json();
    const input = createPromotionSchema.parse(body);
    return createPromotion(input);
  });
}
