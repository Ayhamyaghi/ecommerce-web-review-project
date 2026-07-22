import { NextRequest } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';
import { handleApiRoute } from '@/lib/api-utils';
import { requireAdmin } from '@/lib/auth/session';
import { getInventory, adjustStock } from '@/lib/services/inventory-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  seedDatabase();
  const { id } = await params;
  return handleApiRoute(async () => {
    await requireAdmin();
    return getInventory(id);
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
    const { stock, reason } = body;
    return adjustStock(id, stock, reason ?? 'manual_adjustment');
  });
}
