import { NextRequest } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';
import { handleApiRoute } from '@/lib/api-utils';
import { requireAdmin } from '@/lib/auth/session';
import { getDashboardStats } from '@/lib/services/admin-service';

export async function GET(request: NextRequest) {
  seedDatabase();
  return handleApiRoute(async () => {
    await requireAdmin();
    return getDashboardStats();
  });
}
