import { NextRequest } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';
import { successResponse, errorResponse, getSessionToken } from '@/lib/api-utils';
import { getSessionUser } from '@/lib/auth/session';
import { AuthenticationError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  seedDatabase();
  const token = getSessionToken(request);
  const user = getSessionUser(token);
  if (!user) return errorResponse(new AuthenticationError());
  return successResponse(user);
}
