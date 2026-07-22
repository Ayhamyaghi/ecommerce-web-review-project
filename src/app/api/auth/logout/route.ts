import { NextRequest, NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';
import { getSessionToken } from '@/lib/api-utils';
import { logoutUser } from '@/lib/services/auth-service';

export async function POST(request: NextRequest) {
  seedDatabase();
  const token = getSessionToken(request);
  if (token) logoutUser(token);
  const response = NextResponse.json({ success: true, data: { message: 'Logged out' } });
  response.cookies.delete('session');
  return response;
}
