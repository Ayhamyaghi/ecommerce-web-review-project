import { NextRequest } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';
import { handleApiRoute, errorResponse } from '@/lib/api-utils';
import { requireAdmin } from '@/lib/auth/session';
import { getInventory, adjustStock } from '@/lib/services/inventory-service';
import { adjustStockSchema } from '@/lib/schemas/inventory';
import { ValidationError } from '@/lib/errors';

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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(new ValidationError('Request body must be valid JSON'));
  }

  return handleApiRoute(async () => {
    await requireAdmin();
    const { stock, reason } = adjustStockSchema.parse(body);
    return adjustStock(id, stock, reason);
  });
}
