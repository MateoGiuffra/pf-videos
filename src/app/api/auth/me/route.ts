import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

/**
 * GET /api/auth/me
 * Endpoint to verify current session.
 */
export async function GET() {
  const user = await verifyAuth();
  
  if (user) {
    return NextResponse.json({ authenticated: true, user });
  } else {
    return NextResponse.json({ authenticated: false, error: 'No autenticado' }, { status: 401 });
  }
}
