import { NextRequest, NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';
import { zodErrorResponse } from '@/lib/api-utils';
import { loginSchema } from '@/lib/schemas/auth';
import { loginUser } from '@/lib/services/auth-service';
import { AppError } from '@/lib/errors';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  seedDatabase();
  try {
    const body = await request.json();
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
    if (err instanceof AppError)
      return Response.json(
        { success: false, error: { code: err.code, message: err.message } },
        { status: err.statusCode },
      );
    return Response.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An error occurred' } },
      { status: 500 },
    );
  }
}
