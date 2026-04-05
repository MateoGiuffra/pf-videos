import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/lib/auth';

/**
 * POST /api/auth/login
 * Standard login endpoint for API clients (Postman).
 */
export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    
    if (!username || !password) {
      return NextResponse.json({ error: 'Usuario y contraseña son requeridos' }, { status: 400 });
    }

    const result = await login(username, password);

    if (result.success) {
      return NextResponse.json({ message: 'Sesión iniciada con éxito' });
    } else {
      return NextResponse.json({ error: result.error || 'Credenciales inválidas' }, { status: 401 });
    }
  } catch (error: any) {
    console.error('[API Auth Login Error]:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}
