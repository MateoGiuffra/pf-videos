import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { scrapeResources } from '@/lib/resources';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    // 1. Verify local authentication
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get Moodle session cookie
    const cookieStore = await cookies();
    const moodleSession = cookieStore.get('moodle_session')?.value;
    
    if (!moodleSession) {
      console.warn('[Resources API] No moodle_session cookie found.');
    } else {
      console.log('[Resources API] Using existing moodle_session cookie.');
    }

    // 3. Scrape resources
    const resources = await scrapeResources(moodleSession);

    return NextResponse.json(resources);
  } catch (error: any) {
    console.error('[Resources API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}
