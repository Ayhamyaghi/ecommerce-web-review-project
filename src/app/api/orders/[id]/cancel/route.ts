import { NextRequest } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';
import { handleApiRoute } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth/session';
import { getOrder, updateOrderStatus } from '@/lib/services/order-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  seedDatabase();
  const { id } = await params;
  return handleApiRoute(async () => {
    const user = await requireAuth();
    // Verify the user owns this order
    getOrder(id, user.id);
    return updateOrderStatus(id, 'cancelled');
  });
}
