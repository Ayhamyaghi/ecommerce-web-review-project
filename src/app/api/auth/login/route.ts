import { NextRequest, NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';
import { zodErrorResponse, errorResponse } from '@/lib/api-utils';
import { loginSchema } from '@/lib/schemas/auth';
import { loginUser } from '@/lib/services/auth-service';
import { AppError, ValidationError } from '@/lib/errors';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  seedDatabase();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(new ValidationError('Request body must be valid JSON'));
  }

  try {
    const input = loginSchema.parse(body);
    const result = loginUser(input);
    const response = NextResponse.json({ success: true, data: result.user });
    response.cookies.set('session', result.token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 604800,
    });
    return response;
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    if (err instanceof AppError) return errorResponse(err);
    console.error('Unhandled login error:', err);
    return Response.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 },
    );
  }
}
