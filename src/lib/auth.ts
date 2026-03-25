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
        "Referer": `${AULAS_URL}/login/index.php`,
        "Host": new URL(AULAS_URL).host,
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
        "Referer": `${AULAS_URL}/login/index.php`,
        "Host": new URL(AULAS_URL).host,
      },
      body: new URLSearchParams({
        logintoken: logintoken as string,
        username,
        password,
      }),
      redirect: "manual",
    });

    // Check for success (redirect to dashboard)
    if (loginRes.status === 303 || loginRes.status === 302) {
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
    }

    // If we land back on 200, it's likely a login error
    const errorHtml = await loginRes.text();
    const $err = cheerio.load(errorHtml);
    const serverError = $err('.alert-danger, #loginerrormessage').text().trim();
    
    if (serverError) {
      throw new Error(`Aulas CPI dice: ${serverError}`);
    }

    throw new Error("No se pudo iniciar sesión. Verifica el usuario/contraseña o la conexión.");
  } catch (error: any) {
    console.error(`[Auth Detail] Fetch error for ${AULAS_URL}:`, error);
    if (error.message.includes('fetch failed')) {
      return { success: false, error: `Error de conexión: No se pudo alcanzar Aulas CPI (${AULAS_URL}). Verifica la URL y que el servidor sea accesible.` };
    }
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
