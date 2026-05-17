import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, requireAdmin, getMoodleCookieHeader } from '@/lib/auth';
import { scrapeResources } from '@/lib/resources';
import { UploadFilesDrive } from '@/lib/upload';

/**
 * GET /api/admin/resources
 * Lists all PDF resources stored in Google Drive.
 */
export async function GET(req: NextRequest) {
  try {
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

      const lowerName = file.name.toLowerCase();
      const isMd = lowerName.endsWith('.md') || file.mimeType === 'text/markdown';
      const isPdf = lowerName.endsWith('.pdf') || file.mimeType === 'application/pdf';
      const kind: 'md' | 'pdf' = isMd ? 'md' : 'pdf';

      const nameWithExt = isPdf || isMd
        ? file.name
        : `${file.name}.pdf`;

      units[unitName].push({
        id: file.id,
        title: nameWithExt,
        kind,
        // Drive file ID used by the view proxy
        driveId: file.id,
        // webContentLink can serve as a fallback direct link (requires auth)
        url: file.webContentLink || file.webViewLink,
        bytes: file.size || 0,
        created_at: file.createdTime,
        type: lowerName.includes('practica')
          ? 'practice'
          : lowerName.includes('teorica')
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
    const auth = await requireAdmin();
    if ('error' in auth) return auth.error;

    const cookieHeader = await getMoodleCookieHeader();
    if (!cookieHeader.includes('MoodleSession')) {
      return NextResponse.json(
        { error: 'No se encontró la sesión de Moodle. Por favor, inicia sesión.' },
        { status: 400 }
      );
    }

    const sections = await scrapeResources(cookieHeader);
    const allResources = sections.flatMap((s) => s.resources);

    console.log(`[Admin Resources Sync] Starting sync for ${allResources.length} resources...`);

    const uploader = new UploadFilesDrive(cookieHeader);

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
    const auth = await requireAdmin();
    if ('error' in auth) return auth.error;

    const uploader = new UploadFilesDrive('');
    await uploader.clearAll();

    return NextResponse.json({ message: 'Almacenamiento de Google Drive limpiado con éxito' });
  } catch (error: any) {
    console.error('[Admin Resources DELETE Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to clear resources' }, { status: 500 });
  }
}
