import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { scrapeResources } from '@/lib/resources';
import { UploadFilesDrive } from '@/lib/upload';
import { cookies } from 'next/headers';

/**
 * GET /api/admin/resources
 * Lists all PDF resources stored in Google Drive.
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Verify Authentication
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const uploader = new UploadFilesDrive('');
    const rawFiles = await uploader.listAll();

    console.log(`[Admin Resources GET] Found ${rawFiles.length} files in Drive.`);

    // Group by unit (subfolder name)
    const units: Record<string, any[]> = {};

    for (const file of rawFiles) {
      const unitName = file.folderName || 'Otros';
      if (!units[unitName]) units[unitName] = [];

      const nameWithExt = file.name.toLowerCase().endsWith('.pdf')
        ? file.name
        : `${file.name}.pdf`;

      units[unitName].push({
        id: file.id,
        title: nameWithExt,
        // Drive file ID used by the view proxy
        driveId: file.id,
        // webContentLink can serve as a fallback direct link (requires auth)
        url: file.webContentLink || file.webViewLink,
        bytes: file.size || 0,
        created_at: file.createdTime,
        type: file.name.toLowerCase().includes('practica')
          ? 'practice'
          : file.name.toLowerCase().includes('teorica')
          ? 'theory'
          : 'other',
      });
    }

    return NextResponse.json(units);
  } catch (error: any) {
    console.error('[Admin Resources GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to list resources' }, { status: 500 });
  }
}

/**
 * POST /api/admin/resources
 * Scrapes Moodle and syncs PDFs to Google Drive.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Verify Authentication
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get Moodle Session
    const cookieStore = await cookies();
    const moodleSession = cookieStore.get('moodle_session')?.value;
    console.log(
      `[Admin Resources API] Session found: ${moodleSession ? 'YES (' + moodleSession.substring(0, 8) + '...)' : 'NO'}`
    );

    if (!moodleSession) {
      return NextResponse.json(
        { error: 'No se encontró la sesión de Moodle. Por favor, inicia sesión.' },
        { status: 400 }
      );
    }

    // 3. Scrape Resources from Moodle
    const sections = await scrapeResources(moodleSession);
    const allResources = sections.flatMap((s) => s.resources);

    console.log(`[Admin Resources Sync] Starting sync for ${allResources.length} resources...`);

    // 4. Initialize Drive Uploader
    const uploader = new UploadFilesDrive(moodleSession);

    // 5. Sync each resource sequentially (avoids rate-limit issues)
    const results = [];
    for (const resource of allResources) {
      try {
        await uploader.process(resource);
        results.push({ id: resource.id, status: 'synced' });
      } catch (err: any) {
        console.error(`[Admin Resources Sync] Error on ${resource.title}:`, err.message);
        results.push({ id: resource.id, status: 'error', message: err.message });
      }
    }

    return NextResponse.json({
      message: 'Sync process completed',
      total: allResources.length,
      results,
    });
  } catch (error: any) {
    console.error('[Admin Resources POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to sync resources' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/resources
 * Removes all files from the Google Drive folder.
 */
export async function DELETE(req: NextRequest) {
  try {
    // 1. Verify Authentication
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const uploader = new UploadFilesDrive('');
    await uploader.clearAll();

    return NextResponse.json({ message: 'Almacenamiento de Google Drive limpiado con éxito' });
  } catch (error: any) {
    console.error('[Admin Resources DELETE Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to clear resources' }, { status: 500 });
  }
}
