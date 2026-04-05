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

    // Extract cookies to maintain session
    const moodleCookies = loginPageRes.headers.getSetCookie()
      .map(c => c.split(';')[0])
      .join('; ');

    // 2. Perform login
    const loginRes = await fetch(`${AULAS_URL}/login/index.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
        "Referer": `${AULAS_URL}/login/index.php`,
        "Host": new URL(AULAS_URL).host,
        "Cookie": moodleCookies,
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
      const location = loginRes.headers.get("location") || "";
      const isHome = location.includes("testsession");

      if (isHome) {
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
          // No maxAge/expires makes it a session cookie
        });

        // Store Moodle cookies for scraping and downloads
        const finalCookies = loginRes.headers.getSetCookie();
        for (const cookie of finalCookies) {
          const parts = cookie.split(';');
          const nameValue = parts[0];
          const [name, value] = nameValue.split('=');
          const trimmedName = name.trim();
          
          if (trimmedName.startsWith('MoodleSession') || trimmedName.startsWith('MOODLEID')) {
             // 1. Store as original name for proxy reference
             cookieStore.set(`moodle_c_${trimmedName}`, value, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
            });

            // 2. Also keep our standardized 'moodle_session' for verifyAuth logic
            if (trimmedName.startsWith('MoodleSession')) {
              cookieStore.set('moodle_session', value, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
              });
            }
          }
        }

        return { success: true };
      }
    }

    // If we land here, it's a failure. Always clear the cookies.
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
    cookieStore.delete('moodle_session');

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

    // Clear cookie on any exception as well
    try {
      const cookieStore = await cookies();
      cookieStore.delete('auth_token');
    } catch (e) {
      // Ignore errors deleting cookies in edge-case catch blocks
    }

    if (error.message.includes('fetch failed')) {
      return { success: false, error: `Error de conexión: No se pudo alcanzar Aulas CPI (${AULAS_URL}). Verifica la URL y que el servidor sea accesible.` };
    }
    return { success: false, error: error.message };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  cookieStore.delete('moodle_session');
  
  // Clear all other moodle cookies
  const allCookies = cookieStore.getAll();
  allCookies.forEach(c => {
    if (c.name.startsWith('moodle_c_')) {
      cookieStore.delete(c.name);
    }
  });
}

export async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const moodleSession = cookieStore.get('moodle_session')?.value;

  // We require BOTH a valid JWT AND a Moodle session cookie to be considered "logged in"
  if (!token || !moodleSession) return null;

  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload as unknown as { username: string };
  } catch {
    return null;
  }
}

/**
 * Returns true if the current Moodle session belongs to the admin user.
 * Fetches /user/profile.php and compares the h1 against ADMIN_MOODLE_NAME env var.
 */
export async function checkIsAdmin(): Promise<boolean> {
  const adminName = ENV.ADMIN_MOODLE_NAME;
  if (!adminName) return false;

  try {
    const cookieStore = await cookies();
    const moodleSession = cookieStore.get('moodle_session')?.value;
    if (!moodleSession) return false;

    const res = await fetch(`${AULAS_URL}/user/profile.php`, {
      headers: {
        Cookie: `MoodleSession=${moodleSession}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      // Cache for 60s to avoid re-fetching on fast navigations
      next: { revalidate: 60 },
    });

    if (!res.ok) return false;

    const html = await res.text();
    const $ = cheerio.load(html);
    const h1Text = $('h1').first().text().trim();

    return h1Text === adminName;
  } catch {
    return false;
  }
}

