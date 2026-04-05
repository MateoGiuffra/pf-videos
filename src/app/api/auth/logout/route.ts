import { NextRequest, NextResponse } from 'next/server';
import { logout } from '@/lib/auth';

/**
 * POST /api/auth/logout
 * Standard logout endpoint for API clients.
 */
export async function POST() {
  await logout();
  return NextResponse.json({ message: 'Sesión cerrada con éxito' });
}
