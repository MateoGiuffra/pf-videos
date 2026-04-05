import JSZip from 'jszip';

/**
 * Downloads a flat list of files as a single ZIP.
 * All files land in the root of the ZIP (legacy use).
 */
export async function downloadAllAsZip(files: { name: string, url: string }[], zipName: string) {
  const zip = new JSZip();
  const root = zip.folder(zipName);
  if (!root) throw new Error('Could not create root folder in ZIP');

  console.log(`[ZIP] Descargando ${files.length} archivos (plano)...`);

  await Promise.all(
    files.map(async (file) => {
      try {
        const response = await fetch(file.url);
        const blob = await response.blob();
        root.file(file.name, blob);
      } catch (error) {
        console.error(`[ZIP] Error al descargar ${file.name}:`, error);
      }
    })
  );

  await triggerZipDownload(zip, zipName);
}

/**
 * Downloads files grouped by unit folder — mirrors the Drive folder structure.
 * Each unit becomes a subfolder inside the ZIP.
 */
export async function downloadAllAsZipWithFolders(
  units: Record<string, { name: string; url: string }[]>,
  zipName: string
) {
  const zip = new JSZip();
  const root = zip.folder(zipName);
  if (!root) throw new Error('Could not create root folder in ZIP');

  const totalFiles = Object.values(units).flat().length;
  console.log(`[ZIP] Descargando ${totalFiles} archivos en ${Object.keys(units).length} carpetas...`);

  // Process all folders in parallel, files within each folder also in parallel
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
          }
        })
      );
    })
  );

  await triggerZipDownload(zip, zipName);
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
