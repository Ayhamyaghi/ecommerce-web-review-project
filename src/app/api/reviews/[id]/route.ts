import { NextRequest } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';
import { handleApiRoute, getSessionToken } from '@/lib/api-utils';
import { getSessionUser, requireAuth } from '@/lib/auth/session';
import { updateReviewSchema } from '@/lib/schemas/review';
import { updateReview, deleteReview } from '@/lib/services/review-service';
import type { SessionUser } from '@/lib/auth/session';

/**
 * Resolve the acting user and their admin status from the request.
 *
 * - Admins can act without a cookie-based session (they are already identified
 *   by the session token in the Authorization flow).
 * - Non-admin callers must have a valid session; `requireAuth` throws if not.
 *
 * Returns `{ user, isAdmin }` — the caller uses `isAdmin` to gate admin-only
 * operations in the service layer.
 */
async function resolveReviewActor(
  request: NextRequest,
): Promise<{ user: SessionUser; isAdmin: boolean }> {
  const token = getSessionToken(request);
  const sessionUser = getSessionUser(token);
  if (sessionUser?.role === 'ADMIN') {
    return { user: sessionUser, isAdmin: true };
  }
  // Not an admin — require authentication, which throws AuthenticationError
  // if no valid session exists.
  const authedUser = await requireAuth();
  return { user: authedUser, isAdmin: false };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  seedDatabase();
  const { id } = await params;
  return handleApiRoute(async () => {
    const { user, isAdmin } = await resolveReviewActor(request);
    const body = await request.json();
    const input = updateReviewSchema.parse(body);
    return updateReview(id, user.id, input, isAdmin);
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  seedDatabase();
  const { id } = await params;
  return handleApiRoute(async () => {
    const { user, isAdmin } = await resolveReviewActor(request);
    deleteReview(id, user.id, isAdmin);
    return { message: 'Review deleted' };
  });
}
