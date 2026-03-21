# Sincronización de Videos

La aplicación incluye un módulo JavaScript (`sync.js`) que permite sincronizar nuevos videos desde Discord API y actualizar el archivo `data/youtube_links.json`.

## Uso desde Consola

Abre la consola del navegador (F12 → Console) y ejecuta:

```javascript
// Crear instancia de sincronización
const sync = new VideoSync({
  authorization: "tu-token-discord",
  guildId: "746799942168870912",
  authorId: "518498004584497183"
});

// Opción 1: Sincronización completa (descarga directa)
sync.syncComplete((progress) => {
  console.log(`Página ${progress.pageCount}, offset ${progress.offset}, ${progress.linkCount} links encontrados`);
}).then((result) => {
  if (result.success) {
    console.log(`✅ ${result.totalCount} videos totales`);
    // Descargar directamente
    sync.downloadJSON(result.data, 'youtube_links.json');
  } else {
    console.error("❌ Error:", result.error);
  }
});

// Opción 2: Solo obtener nuevos videos
sync.fetchAllVideos().then((newLinks) => {
  console.log(`${newLinks.length} nuevos links encontrados`);
});

// Opción 3: Copiar al clipboard
sync.syncComplete().then((result) => {
  if (result.success) {
    sync.copyToClipboard(result.data).then((ok) => {
      console.log(ok ? "✅ Copiado al clipboard" : "❌ Error copiando");
    });
  }
});
```

## Flujo de Actualización

1. **Ejecutar sincronización** — obtiene todos los videos desde Discord
2. **Deduplicación** — elimina duplicados, mantiene el más antiguo (menor offset)
3. **Mergeo** — combina con datos existentes
4. **Ordenamiento** — por offset ascendente, luego por fecha descendente
5. **Descarga** — guarda como `youtube_links.json`

## Configuración

```javascript
{
  guildId: "746799942168870912",      // ID del servidor Discord
  authorId: "518498004584497183",     // ID del usuario (emisor de videos)
  authorization: "tu-token-aqui",     // Token Discord (opcional si usas cookies)
  cookies: "cookies...set...",        // Cookies del navegador (opcional)
  offsetStep: 25,                      // Tamaño de página en la API
  timeout: 30000                       // Timeout en ms
}
```

## Integración con Botón UI

Para conectar el sync a un botón de la UI (próximo paso):

```html
<button id="syncButton">Sincronizar Videos</button>

<script src="sync.js"></script>
<script>
  document.getElementById('syncButton').addEventListener('click', async () => {
    const sync = new VideoSync({
      authorization: "tu-token-aqui"
    });
    
    const result = await sync.syncComplete((progress) => {
      console.log(`Progreso: ${progress.linkCount} links encontrados`);
      // Aquí actualizar UI con progreso
    });
    
    if (result.success) {
      sync.downloadJSON(result.data);
      // Recargar app.js datos
      location.reload();
    }
  });
</script>
```

## Notas de Seguridad

- El token de Discord NO debe estar hardcodeado en el código público
- Usualmente se pasa desde una variable de entorno (`process.env`)
- Para GitHub Pages, se puede usar un servidor backend que maneje la autenticación
- Alternativamente, el usuario puede obtener el token desde DevTools → Storage → Cookies

## Cambios Realizados

✅ Eliminadas referencias a `offset` del HTML/JS
✅ "anio" → "año" en toda la interfaz
✅ Dark mode alternable (botón discreto en esquina superior derecha)
✅ Script `sync.js` listo para conectar a UI
