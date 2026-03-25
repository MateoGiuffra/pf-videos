'use server';

import { login as authLogin, logout as authLogout } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Usuario y contraseña son requeridos' };
  }

  const result = await authLogin(username, password);

  if (result.success) {
    redirect('/');
  }

  return { error: result.error || 'Error en la autenticación' };
}

export async function logoutAction() {
  await authLogout();
  redirect('/login');
}
