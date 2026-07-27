import { NextRequest } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';
import { handleApiRoute, errorResponse } from '@/lib/api-utils';
import { requireAdmin } from '@/lib/auth/session';
import { productQuerySchema, createProductSchema } from '@/lib/schemas/product';
import { listProducts, createProduct } from '@/lib/services/product-service';
import { ValidationError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  seedDatabase();
  return handleApiRoute(async () => {
    const params: Record<string, string> = {};
    request.nextUrl.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    const query = productQuerySchema.parse(params);
    return listProducts(query);
  });
}

export async function POST(request: NextRequest) {
  seedDatabase();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(new ValidationError('Request body must be valid JSON'));
  }

  return handleApiRoute(async () => {
    await requireAdmin();
    const input = createProductSchema.parse(body);
    const product = createProduct(input);
    return product;
  });
}
