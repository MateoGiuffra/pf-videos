import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, getMoodleCookieHeader } from '@/lib/auth';
import { scrapeResources } from '@/lib/resources';

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cookieHeader = await getMoodleCookieHeader();
    if (!cookieHeader.includes('MoodleSession')) {
      return NextResponse.json(
        { error: 'No se encontró la sesión de Moodle. Por favor, inicia sesión.' },
        { status: 400 }
      );
    }

    const resources = await scrapeResources(cookieHeader);

    return NextResponse.json(resources);
  } catch (error: any) {
    console.error('[Resources API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}
