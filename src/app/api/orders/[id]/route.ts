import { NextRequest } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';
import { handleApiRoute, getSessionToken } from '@/lib/api-utils';
import { getSessionUser, requireAdmin } from '@/lib/auth/session';
import { orderStatusUpdateSchema } from '@/lib/schemas/order';
import { getOrder, getOrderForAdmin, updateOrderStatus } from '@/lib/services/order-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  seedDatabase();
  const { id } = await params;
  return handleApiRoute(async () => {
    const token = getSessionToken(request);
    const user = getSessionUser(token);
    if (user?.role === 'ADMIN') {
      return getOrderForAdmin(id);
    }
    return getOrder(id, user?.id ?? null);
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  seedDatabase();
  const { id } = await params;
  return handleApiRoute(async () => {
    await requireAdmin();
    const body = await request.json();
    const input = orderStatusUpdateSchema.parse(body);
    return updateOrderStatus(id, input.status);
  });
}
