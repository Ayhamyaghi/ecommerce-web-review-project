import { NextRequest } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';
import { handleApiRoute, successResponse, zodErrorResponse } from '@/lib/api-utils';
import { requireAdmin } from '@/lib/auth/session';
import { productQuerySchema, createProductSchema } from '@/lib/schemas/product';
import { listProducts, createProduct } from '@/lib/services/product-service';

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
  return handleApiRoute(async () => {
    await requireAdmin();
    const body = await request.json();
    const input = createProductSchema.parse(body);
    const product = createProduct(input);
    return product;
  });
}
