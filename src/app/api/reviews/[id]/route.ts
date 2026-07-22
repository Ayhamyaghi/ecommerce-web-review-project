import { NextRequest } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';
import { handleApiRoute, getSessionToken } from '@/lib/api-utils';
import { getSessionUser, requireAuth } from '@/lib/auth/session';
import { updateReviewSchema } from '@/lib/schemas/review';
import { updateReview, deleteReview } from '@/lib/services/review-service';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  seedDatabase();
  const { id } = await params;
  return handleApiRoute(async () => {
    const token = getSessionToken(request);
    const user = getSessionUser(token);
    const isAdmin = user?.role === 'ADMIN';
    if (!isAdmin) {
      const authedUser = await requireAuth();
      const body = await request.json();
      const input = updateReviewSchema.parse(body);
      return updateReview(id, authedUser.id, input, false);
    }
    const body = await request.json();
    const input = updateReviewSchema.parse(body);
    return updateReview(id, user!.id, input, true);
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  seedDatabase();
  const { id } = await params;
  return handleApiRoute(async () => {
    const token = getSessionToken(request);
    const user = getSessionUser(token);
    const isAdmin = user?.role === 'ADMIN';
    if (!isAdmin) {
      const authedUser = await requireAuth();
      deleteReview(id, authedUser.id, false);
      return { message: 'Review deleted' };
    }
    deleteReview(id, user!.id, true);
    return { message: 'Review deleted' };
  });
}
