import { NextRequest } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';
import { handleApiRoute, errorResponse } from '@/lib/api-utils';
import { requireAdmin } from '@/lib/auth/session';
import { updateProductSchema } from '@/lib/schemas/product';
import { getProduct, getRelatedProducts, updateProduct, deleteProduct } from '@/lib/services/product-service';
import { ValidationError } from '@/lib/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  seedDatabase();
  const { id } = await params;
  return handleApiRoute(async () => {
    const product = getProduct(id);
    const relatedProducts = getRelatedProducts(product.id);
    return { product, relatedProducts };
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
    const input = updateProductSchema.parse(body);
    return updateProduct(id, input);
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  seedDatabase();
  const { id } = await params;
  return handleApiRoute(async () => {
    await requireAdmin();
    deleteProduct(id);
    return { message: 'Product deleted' };
  });
}
