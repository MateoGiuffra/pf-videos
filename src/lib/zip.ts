import JSZip from 'jszip';

interface ZipProgress {
  onStart?: (totalFiles: number) => void;
  onProgress?: (completed: number, total: number) => void;
  onError?: (message: string) => void;
  onDone?: () => void;
}

/**
 * Downloads a flat list of files as a single ZIP.
 */
export async function downloadAllAsZip(
  files: { name: string; url: string }[],
  zipName: string,
  hooks?: ZipProgress,
) {
  const zip = new JSZip();
  const root = zip.folder(zipName);
  if (!root) {
    hooks?.onError?.('No se pudo crear el ZIP');
    return;
  }

  hooks?.onStart?.(files.length);

  let completed = 0;
  await Promise.all(
    files.map(async (file) => {
      try {
        const response = await fetch(file.url);
        const blob = await response.blob();
        root.file(file.name, blob);
      } catch (error) {
        console.error(`[ZIP] Error al descargar ${file.name}:`, error);
      } finally {
        completed++;
        hooks?.onProgress?.(completed, files.length);
      }
    }),
  );

  try {
    await triggerZipDownload(zip, zipName);
    hooks?.onDone?.();
  } catch (e) {
    hooks?.onError?.('No se pudo generar el archivo ZIP');
  }
}

/**
 * Downloads files grouped by unit folder.
 */
export async function downloadAllAsZipWithFolders(
  units: Record<string, { name: string; url: string }[]>,
  zipName: string,
  hooks?: ZipProgress,
) {
  const zip = new JSZip();
  const root = zip.folder(zipName);
  if (!root) {
    hooks?.onError?.('No se pudo crear el ZIP');
    return;
  }

  const totalFiles = Object.values(units).flat().length;
  hooks?.onStart?.(totalFiles);

  let completed = 0;
  await Promise.all(
    Object.entries(units).map(async ([unitName, files]) => {
      const unitFolder = root.folder(unitName);
      if (!unitFolder) return;

      await Promise.all(
        files.map(async (file) => {
          try {
            const response = await fetch(file.url);
            const blob = await response.blob();
            unitFolder.file(file.name, blob);
          } catch (error) {
            console.error(`[ZIP] Error al descargar ${unitName}/${file.name}:`, error);
          } finally {
            completed++;
            hooks?.onProgress?.(completed, totalFiles);
          }
        }),
      );
    }),
  );

  try {
    await triggerZipDownload(zip, zipName);
    hooks?.onDone?.();
  } catch (e) {
    hooks?.onError?.('No se pudo generar el archivo ZIP');
  }
}

function triggerZipDownload(zip: JSZip, zipName: string) {
  return zip.generateAsync({ type: 'blob' }).then((content) => {
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${zipName}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
}
