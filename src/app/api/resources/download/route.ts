import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    // 1. Verify local authentication
    const user = await verifyAuth();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Get the URL and Filename from search params
    const { searchParams } = new URL(req.url);
    const downloadUrl = searchParams.get('url');
    const fileName = searchParams.get('filename') || 'recurso.pdf';

    if (!downloadUrl) {
      return new NextResponse('Missing URL', { status: 400 });
    }

    // 3. Reconstruct all Moodle cookies from our prefixed storage
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    const moodleCookieStrings = allCookies
      .filter(c => c.name.startsWith('moodle_c_'))
      .map(c => `${c.name.replace('moodle_c_', '')}=${c.value}`);
    
    const cookieHeaderValue = moodleCookieStrings.join('; ');

    if (!cookieHeaderValue.includes('MoodleSession')) {
      return new NextResponse('No Moodle session found. Please log in again.', { status: 401 });
    }

    // 4. Fetch the file from Moodle
    const response = await fetch(downloadUrl, {
      headers: {
        'Cookie': cookieHeaderValue,
        'User-Agent': req.headers.get('user-agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
        'Referer': 'https://aulas.gobstones.org/',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      },
    });

    if (!response.ok) {
      console.error(`[Download Proxy] Failed to fetch from Moodle: ${response.status} ${response.statusText}`);
      return new NextResponse(`Failed to fetch file from Moodle: ${response.statusText}`, { status: response.status });
    }

    // 5. Stream the response back with attachment headers
    const contentType = response.headers.get('Content-Type') || 'application/pdf';
    
    // Create the response with the stream
    const proxyResponse = new NextResponse(response.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
        'Cache-Control': 'no-cache',
      },
    });

    return proxyResponse;
  } catch (error: any) {
    console.error('[Download Proxy Error]:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}
