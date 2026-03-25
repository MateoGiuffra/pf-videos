import { ENV } from '@/config/env';
import * as cheerio from 'cheerio';
import * as jose from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(ENV.JWT_SECRET);
const AULAS_URL = ENV.AULAS_URL;

export interface User {
  username: string;
  authenticatedAt: string;
}

export async function login(username: string, password: string) {
  try {
    // 1. Get logintoken
    const loginPageRes = await fetch(`${AULAS_URL}/login/index.php`, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
      },
    });

    if (!loginPageRes.ok) throw new Error("No se pudo acceder a Aulas CPI.");

    const html = await loginPageRes.text();
    const $ = cheerio.load(html);
    const logintoken = $('input[name="logintoken"]').val();

    if (!logintoken) throw new Error("No se pudo obtener el token de sesión.");

    // 2. Perform login
    const loginRes = await fetch(`${AULAS_URL}/login/index.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
      },
      body: new URLSearchParams({
        logintoken: logintoken as string,
        username,
        password,
      }),
      redirect: "manual",
    });

    // Check cookies
    const setCookie = loginRes.headers.get("set-cookie");
    if (!setCookie) throw new Error("Credenciales inválidas.");

    // Simple check: Moodle sessions are established if we get a MoodleSession cookie
    if (loginRes.status !== 303 && loginRes.status !== 302) {
       throw new Error("Credenciales inválidas.");
    }

    // 3. Generate JWT
    const token = await new jose.SignJWT({ username })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
}

export async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return null;

  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload as unknown as { username: string };
  } catch {
    return null;
  }
}
