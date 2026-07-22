import { NextRequest } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';
import { successResponse, getSessionToken } from '@/lib/api-utils';
import { getSessionUser } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  seedDatabase();
  const token = getSessionToken(request);
  const user = getSessionUser(token);
  return successResponse(user);
}
