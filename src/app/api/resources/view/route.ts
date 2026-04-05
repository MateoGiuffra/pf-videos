import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { getDriveClientOAuth } from '@/lib/drive';

/**
 * GET /api/resources/view?id=<driveFileId>&filename=<name>&download=true
 *
 * Proxies a Google Drive file through the server so that only authenticated
 * users can access it (the file itself is private, owned by the service account).
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Verify Authentication
    const user = await verifyAuth();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get('id');
    const filename = searchParams.get('filename') || 'recurso.pdf';
    const isDownload = searchParams.get('download') === 'true';

    if (!fileId) {
      return new NextResponse('Missing file id', { status: 400 });
    }

    // 2. Fetch from Google Drive using service account
    const drive = getDriveClientOAuth();

    const response = await drive.files.get(
      { fileId, alt: 'media', supportsAllDrives: true },
      { responseType: 'arraybuffer' }
    );

    const buffer = Buffer.from(response.data as ArrayBuffer);

    // 3. Stream back to the client
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': isDownload
          ? `attachment; filename="${encodeURIComponent(filename)}"`
          : `inline; filename="${encodeURIComponent(filename)}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('[Drive Proxy Error]:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}
