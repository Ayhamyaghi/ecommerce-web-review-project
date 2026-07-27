import { NextRequest } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';
import { handleApiRoute, errorResponse } from '@/lib/api-utils';
import { requireAdmin } from '@/lib/auth/session';
import { createPromotionSchema } from '@/lib/schemas/promotion';
import { updatePromotion, deletePromotion } from '@/lib/services/promotion-service';
import { ValidationError } from '@/lib/errors';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  seedDatabase();
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(new ValidationError('Request body must be valid JSON'));
  }

  return handleApiRoute(async () => {
    await requireAdmin();
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
