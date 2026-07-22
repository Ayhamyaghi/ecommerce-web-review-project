import { NextRequest } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';
import { handleApiRoute } from '@/lib/api-utils';
import { requireAdmin } from '@/lib/auth/session';
import { createPromotionSchema } from '@/lib/schemas/promotion';
import { updatePromotion, deletePromotion } from '@/lib/services/promotion-service';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  seedDatabase();
  const { id } = await params;
  return handleApiRoute(async () => {
    await requireAdmin();
    const body = await request.json();
    const input = createPromotionSchema.partial().parse(body);
    return updatePromotion(id, input);
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  seedDatabase();
  const { id } = await params;
  return handleApiRoute(async () => {
    await requireAdmin();
    deletePromotion(id);
    return { message: 'Promotion deleted' };
  });
}
