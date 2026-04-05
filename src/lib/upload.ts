import { getDriveClientOAuth } from '@/lib/drive';
import { ENV } from '@/config/env';
import { Readable } from 'stream';
import { Resource } from './resources';

// ─────────────────────────────────────────────────────────────
// Base class — download from Moodle + filename/folder helpers
// ─────────────────────────────────────────────────────────────
export class UploadFiles {
  protected moodleSession: string;

  constructor(moodleSession: string) {
    this.moodleSession = moodleSession;
  }

  protected getFilename(resource: Resource): string {
    const typeMap = {
      practice: 'practica',
      theory: 'teorica',
      other: 'recurso',
    };

    const baseName = typeMap[resource.type] || 'recurso';
    if (resource.type === 'other') {
      const safeTitle = resource.title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .substring(0, 30);
      return `${baseName}-${safeTitle}.pdf`;
    }

    return `${baseName}.pdf`;
  }

  protected normalizeFolderName(unitTitle: string): string {
    let name = unitTitle.replace(/:/g, ' - ');
    name = name.replace(/\s*-\s*Parte (práctica|teórica|teorica)\s*$/i, '');
    return name.replace(/\s\s+/g, ' ').trim();
  }

  async download(url: string): Promise<Buffer> {
    console.log(`[UploadFiles] Downloading from: ${url}`);
    const res = await fetch(url, {
      headers: {
        Cookie: `MoodleSession=${this.moodleSession}`,
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
      },
    });

    if (!res.ok) {
      console.error(`[UploadFiles] Download failed: ${res.status} ${res.statusText}`);
      throw new Error(`Failed to download from Moodle: ${res.statusText}`);
    }
    return Buffer.from(await res.arrayBuffer());
  }

  async process(_resource: Resource): Promise<void> {
    // Override in subclasses
  }
}

// ─────────────────────────────────────────────────────────────
// Google Drive uploader
// ─────────────────────────────────────────────────────────────
export class UploadFilesDrive extends UploadFiles {
  private rootFolderId: string;

  constructor(moodleSession: string) {
    super(moodleSession);
    if (!ENV.GOOGLE.DRIVE_FOLDER_ID) {
      throw new Error('GOOGLE_DRIVE_FOLDER_ID is not set.');
    }
    this.rootFolderId = ENV.GOOGLE.DRIVE_FOLDER_ID;
  }

  /**
   * Returns the Drive folder ID for `name` inside `parentId`.
   * Creates the folder if it doesn't exist.
   */
  async getOrCreateFolder(name: string, parentId: string): Promise<string> {
    const drive = getDriveClientOAuth();
    const escaped = name.replace(/'/g, "\\'");

    const list = await drive.files.list({
      q: `name='${escaped}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      spaces: 'drive',
    });

    if (list.data.files && list.data.files.length > 0) {
      return list.data.files[0].id!;
    }

    const created = await drive.files.create({
      requestBody: {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId],
      },
      fields: 'id',
      supportsAllDrives: true,
    });

    console.log(`[Drive] Carpeta creada: ${name} (${created.data.id})`);
    return created.data.id!;
  }

  /**
   * Returns the Drive file ID if `filename` already exists in `folderId`,
   * otherwise returns null.
   */
  async findFile(folderId: string, filename: string): Promise<string | null> {
    const drive = getDriveClientOAuth();
    const escaped = filename.replace(/'/g, "\\'");

    const list = await drive.files.list({
      q: `name='${escaped}' and '${folderId}' in parents and trashed=false`,
      fields: 'files(id, name)',
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      spaces: 'drive',
    });

    if (list.data.files && list.data.files.length > 0) {
      return list.data.files[0].id!;
    }
    return null;
  }

  /**
   * Uploads a Buffer to Drive as application/pdf inside `folderId`.
   * Returns the new file's Drive ID.
   */
  async uploadToDrive(buffer: Buffer, folderId: string, filename: string): Promise<string> {
    const drive = getDriveClientOAuth();

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);

    const res = await drive.files.create({
      requestBody: {
        name: filename,
        mimeType: 'application/pdf',
        parents: [folderId],
      },
      media: {
        mimeType: 'application/pdf',
        body: readable,
      },
      fields: 'id, name, webViewLink, webContentLink',
      supportsAllDrives: true,
    });

    console.log(`[Drive] Subido: ${filename} (${res.data.id}) → ${res.data.webViewLink}`);
    return res.data.id!;
  }

  /** Full pipeline: folder → dedup check → download → upload */
  async process(resource: Resource): Promise<void> {
    const filename = this.getFilename(resource);
    const folderName = this.normalizeFolderName(resource.unit);

    // 1. Get or create the unit subfolder
    const folderId = await this.getOrCreateFolder(folderName, this.rootFolderId);

    // 2. Check if the file already exists
    const existing = await this.findFile(folderId, filename);
    if (existing) {
      console.log(`[Drive] Ya existe: ${folderName}/${filename}`);
      return;
    }

    // 3. Download from Moodle
    console.log(`[Drive] Sincronizando: ${folderName}/${filename}`);
    const buffer = await this.download(resource.url);

    // 4. Upload to Drive
    await this.uploadToDrive(buffer, folderId, filename);
  }

  /**
   * Lists all PDF files under the root Drive folder (recursively by subfolder).
   * Returns an array of { id, name, folderId, folderName, size, createdTime, webViewLink, webContentLink }.
   */
  async listAll(): Promise<any[]> {
    const drive = getDriveClientOAuth();

    // 1. List direct subfolders of root
    const foldersRes = await drive.files.list({
      q: `'${this.rootFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      spaces: 'drive',
      pageSize: 200,
    });

    const folders = foldersRes.data.files || [];
    const results: any[] = [];

    // 2. For each subfolder list its files
    for (const folder of folders) {
      const filesRes = await drive.files.list({
        q: `'${folder.id}' in parents and trashed=false and mimeType='application/pdf'`,
        fields: 'files(id, name, size, createdTime, webViewLink, webContentLink)',
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
        spaces: 'drive',
        pageSize: 200,
      });

      const files = filesRes.data.files || [];
      for (const file of files) {
        results.push({
          id: file.id,
          name: file.name,
          folderId: folder.id,
          folderName: folder.name,
          size: file.size ? parseInt(file.size) : 0,
          createdTime: file.createdTime,
          webViewLink: file.webViewLink,
          webContentLink: file.webContentLink,
        });
      }
    }

    return results;
  }

  /**
   * Deletes all files in every subfolder of the root.
   * Does NOT delete the subfolders themselves, nor the root folder.
   */
  async clearAll(): Promise<void> {
    const drive = getDriveClientOAuth();
    console.log(`[Drive] Borrando todos los archivos bajo: ${this.rootFolderId}`);

    const all = await this.listAll();

    for (const file of all) {
      await drive.files.delete({ fileId: file.id });
      console.log(`[Drive] Borrado: ${file.folderName}/${file.name}`);
    }

    console.log(`[Drive] Limpieza completada. ${all.length} archivos borrados.`);
  }
}
