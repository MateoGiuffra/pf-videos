/**
 * Sincronización de videos desde Discord API
 * Módulo que obtiene videos desde la API de Discord y los mergea con los datos existentes.
 *
 * Uso:
 *   const sync = new VideoSync(config);
 *   const results = await sync.fetchAllVideos();
 *   const merged = await sync.mergeWithExisting(results);
 *   sync.downloadJSON(merged, 'youtube_links.json');
 */

class VideoSync {
    constructor(config = {}) {
        this.guildId = config.guildId || "746799942168870912";
        this.authorId = config.authorId || "518498004584497183";
        this.auth = config.authorization || "";
        this.cookies = config.cookies || "";
        this.offsetStep = config.offsetStep || 25;
        this.timeout = config.timeout || 30000;
        this.youtubeRegex = /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?[^\s]+|youtu\.be\/[^\s]+)/g;
    }

    getHeaders() {
        return {
            accept: "*/*",
            "accept-language": "en-US,en;q=0.9,es-AR;q=0.8,es-419;q=0.7,es;q=0.6",
            "cache-control": "no-cache",
            "content-type": "application/json",
            pragma: "no-cache",
            "sec-ch-ua": '"Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "user-agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
        };
    }

    getEndpoint(offset) {
        return (
            `https://discord.com/api/v9/guilds/${this.guildId}/messages/search` +
            `?has=link&author_id=${this.authorId}&sort_by=timestamp&sort_order=desc` +
            `&offset=${offset}`
        );
    }

    extractYoutubeLinksFromMessage(message, offset) {
        const links = [];

        // Extraer de embeds con videos de YouTube
        for (const embed of message.embeds || []) {
            const url = embed.url;
            const provider = embed.provider || {};

            if (!url) continue;

            if (provider.name === "YouTube" || this.isYoutubeUrl(url)) {
                links.push({
                    url,
                    title: embed.title || null,
                    timestamp: message.timestamp,
                    offset,
                });
            }
        }

        // Extraer URLs de YouTube del contenido del mensaje
        const content = message.content || "";
        const matches = content.match(this.youtubeRegex) || [];
        for (const url of matches) {
            links.push({
                url,
                title: null,
                timestamp: message.timestamp,
                offset,
            });
        }

        return links;
    }

    isYoutubeUrl(url) {
        return url.includes("youtube.com") || url.includes("youtu.be");
    }

    /**
     * Obtiene todos los videos de Discord paginando
     */
    async fetchAllVideos(onProgress) {
        const allLinks = [];
        let offset = 0;
        let hasMore = true;
        let pageCount = 0;

        while (hasMore) {
            const endpoint = this.getEndpoint(offset);

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);

                const response = await fetch(endpoint, {
                    headers: this.getHeaders(),
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const payload = response.json && (await response.json());
                const messageGroups = payload?.messages || [];

                if (messageGroups.length === 0) {
                    hasMore = false;
                    break;
                }

                // Procesar los mensajes de esta página
                for (const messageGroup of messageGroups) {
                    for (const message of messageGroup) {
                        const links = this.extractYoutubeLinksFromMessage(message, offset);
                        allLinks.push(...links);
                    }
                }

                pageCount++;
                offset += this.offsetStep;

                if (onProgress) {
                    onProgress({
                        offset,
                        pageCount,
                        linkCount: allLinks.length,
                        hasMore,
                    });
                }

                // Pequeño delay para no saturar la API
                await new Promise((resolve) => setTimeout(resolve, 500));
            } catch (error) {
                console.error(`Error fetcheando offset=${offset}:`, error);
                throw error;
            }
        }

        return allLinks;
    }

    /**
     * Deduplicar URLs iguales, mantener el de menor offset
     */
    deduplicateLinks(links) {
        const byUrl = new Map();

        for (const item of links) {
            const url = item.url;

            if (!byUrl.has(url)) {
                byUrl.set(url, item);
                continue;
            }

            const existing = byUrl.get(url);
            const shouldReplace =
                item.offset < existing.offset ||
                (item.offset === existing.offset && new Date(item.timestamp) > new Date(existing.timestamp));

            if (shouldReplace) {
                byUrl.set(url, item);
            }
        }

        return [...byUrl.values()];
    }

    /**
     * Mergea nuevos links con datos existentes
     */
    async mergeWithExisting(newLinks) {
        try {
            const response = await fetch("data/youtube_links.json");
            if (!response.ok) {
                console.warn("No se encontró archivo existente, usando solo nuevos links");
                return this.deduplicateLinks(newLinks);
            }

            const existingData = await response.json();
            const combined = [...existingData, ...newLinks];
            const deduplicated = this.deduplicateLinks(combined);

            return deduplicated.sort((a, b) => {
                if (a.offset !== b.offset) {
                    return a.offset - b.offset;
                }
                return new Date(b.timestamp) - new Date(a.timestamp);
            });
        } catch (error) {
            console.error("Error mergeando datos:", error);
            return this.deduplicateLinks(newLinks);
        }
    }

    /**
     * Descarga el JSON como archivo
     */
    downloadJSON(data, filename = "youtube_links.json") {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Copia al portapapeles (útil para GitHub)
     */
    async copyToClipboard(data) {
        const json = JSON.stringify(data, null, 2);
        try {
            await navigator.clipboard.writeText(json);
            return true;
        } catch (error) {
            console.error("Error copiando al clipboard:", error);
            return false;
        }
    }

    /**
     * Proceso completo de sincronización
     */
    async syncComplete(onProgress) {
        try {
            console.log("Iniciando sincronización de videos...");

            const newLinks = await this.fetchAllVideos(onProgress);
            console.log(`Se obtuvieron ${newLinks.length} links nuevos`);

            const merged = await this.mergeWithExisting(newLinks);
            console.log(`Total de videos únicos: ${merged.length}`);

            return {
                success: true,
                newLinksCount: newLinks.length,
                totalCount: merged.length,
                data: merged,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
}

// Exportar para uso global
window.VideoSync = VideoSync;
