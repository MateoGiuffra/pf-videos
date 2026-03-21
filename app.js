const videoListEl = document.getElementById("videoList");
const resultsCountEl = document.getElementById("resultsCount");
const playerWrapEl = document.getElementById("playerWrap");
const playerMetaEl = document.getElementById("playerMeta");
const searchInputEl = document.getElementById("searchInput");
const yearFilterEl = document.getElementById("yearFilter");
const cuatriFilterEl = document.getElementById("cuatriFilter");

const state = {
    videos: [],
    filtered: [],
    selectedVideoId: null,
};

function getVideoId(url) {
    try {
        const parsed = new URL(url);
        if (parsed.hostname.includes("youtu.be")) {
            return parsed.pathname.slice(1) || null;
        }
        if (parsed.hostname.includes("youtube.com")) {
            return parsed.searchParams.get("v");
        }
    } catch {
        return null;
    }
    return null;
}

function toEmbedUrl(videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
}

function classifyCuatri(dateObj) {
    const month = dateObj.getUTCMonth() + 1;
    const cuatris = [];
    if (month >= 3 && month <= 6) {
        cuatris.push(1);
    }
    if (month >= 5 && month <= 12) {
        cuatris.push(2);
    }
    return cuatris;
}

function parseDateInfo(timestamp) {
    const dateObj = new Date(timestamp);
    const yyyy = dateObj.getUTCFullYear();
    const mm = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(dateObj.getUTCDate()).padStart(2, "0");
    return {
        dateObj,
        year: yyyy,
        dateText: `${yyyy}-${mm}-${dd}`,
        cuatris: classifyCuatri(dateObj),
    };
}

function normalizeVideos(rawData) {
    const byVideoId = new Map();

    for (const item of rawData) {
        const videoId = getVideoId(item.url);
        if (!videoId) {
            continue;
        }

        const dateInfo = parseDateInfo(item.timestamp);
        const normalized = {
            videoId,
            youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
            title: item.title || `Video ${videoId}`,
            timestamp: item.timestamp,
            offset: Number(item.offset ?? 0),
            ...dateInfo,
        };

        if (!byVideoId.has(videoId)) {
            byVideoId.set(videoId, normalized);
            continue;
        }

        const existing = byVideoId.get(videoId);
        const shouldReplace =
            normalized.offset < existing.offset ||
            (normalized.offset === existing.offset && new Date(normalized.timestamp) > new Date(existing.timestamp));

        if (shouldReplace) {
            byVideoId.set(videoId, normalized);
        }
    }

    return [...byVideoId.values()].sort((a, b) => {
        if (a.offset !== b.offset) {
            return a.offset - b.offset;
        }
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
}

function renderYearOptions(videos) {
    const years = [...new Set(videos.map((v) => v.year))].sort((a, b) => b - a);

    yearFilterEl.innerHTML = '<option value="all">Todos</option>';
    for (const year of years) {
        const option = document.createElement("option");
        option.value = String(year);
        option.textContent = String(year);
        yearFilterEl.append(option);
    }
}

function getSearchMode() {
    const selected = document.querySelector('input[name="searchMode"]:checked');
    return selected ? selected.value : "title";
}

function applyFilters() {
    const searchText = searchInputEl.value.trim().toLowerCase();
    const selectedYear = yearFilterEl.value;
    const selectedCuatri = cuatriFilterEl.value;
    const searchMode = getSearchMode();

    state.filtered = state.videos.filter((video) => {
        const yearOk = selectedYear === "all" || String(video.year) === selectedYear;

        const cuatriOk =
            selectedCuatri === "all" ||
            video.cuatris.includes(Number(selectedCuatri));

        const searchable = searchMode === "date" ? video.dateText : video.title.toLowerCase();
        const searchOk = searchText === "" || searchable.includes(searchText);

        return yearOk && cuatriOk && searchOk;
    });

    renderList();
    ensureSelection();
}

function renderList() {
    resultsCountEl.textContent = `${state.filtered.length} videos`;
    videoListEl.innerHTML = "";

    if (state.filtered.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = "No hay resultados con esos filtros.";
        videoListEl.append(empty);
        return;
    }

    for (const video of state.filtered) {
        const li = document.createElement("li");
        li.className = "video-item";
        if (video.videoId === state.selectedVideoId) {
            li.classList.add("active");
        }

        li.innerHTML = `
      <p class="video-title">${escapeHtml(video.title)}</p>
      <p class="video-meta">${video.dateText}${video.cuatris.length > 0 ? ` | cuatri ${video.cuatris.join("/")}` : ""}</p>
    `;

        li.addEventListener("click", () => {
            state.selectedVideoId = video.videoId;
            renderPlayer(video);
            renderList();
        });

        videoListEl.append(li);
    }
}

function renderPlayer(video) {
    playerWrapEl.innerHTML = `
    <iframe
      title="Reproductor de YouTube"
      src="${toEmbedUrl(video.videoId)}"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
    ></iframe>
  `;

    playerMetaEl.innerHTML = `
    <h3>${escapeHtml(video.title)}</h3>
    <p>Fecha: ${video.dateText}${video.cuatris.length > 0 ? ` | cuatri ${video.cuatris.join("/")}` : ""}</p>
    <div class="player-actions">
      <a class="button primary" href="${video.youtubeUrl}" target="_blank" rel="noopener noreferrer">Ver en YouTube</a>
      <a class="button ghost" href="${toEmbedUrl(video.videoId)}" target="_blank" rel="noopener noreferrer">Abrir embed</a>
    </div>
  `;
}

function ensureSelection() {
    if (state.filtered.length === 0) {
        state.selectedVideoId = null;
        playerWrapEl.innerHTML = '<p class="player-placeholder">No hay videos para mostrar.</p>';
        playerMetaEl.innerHTML = "";
        return;
    }

    const stillExists = state.filtered.some((v) => v.videoId === state.selectedVideoId);
    if (!stillExists) {
        state.selectedVideoId = state.filtered[0].videoId;
    }

    const selected = state.filtered.find((v) => v.videoId === state.selectedVideoId) || state.filtered[0];
    renderPlayer(selected);
}

function escapeHtml(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

async function boot() {
    try {
        const res = await fetch("data/youtube_links.json", { cache: "no-store" });
        if (!res.ok) {
            throw new Error(`No se pudo leer data/youtube_links.json (${res.status})`);
        }

        const data = await res.json();
        state.videos = normalizeVideos(data);
        renderYearOptions(state.videos);
        applyFilters();
    } catch (err) {
        videoListEl.innerHTML = `<p class="empty-state">Error cargando datos: ${escapeHtml(err.message)}</p>`;
    }
}

function initTheme() {
    const saved = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", saved);
    updateThemeIcon(saved);
}

function updateThemeIcon(theme) {
    const toggle = document.getElementById("themeToggle");
    toggle.textContent = theme === "dark" ? "☀️" : "🌙";
}

function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    updateThemeIcon(next);
}

searchInputEl.addEventListener("input", applyFilters);
yearFilterEl.addEventListener("change", applyFilters);
cuatriFilterEl.addEventListener("change", applyFilters);
document.querySelectorAll('input[name="searchMode"]').forEach((el) => {
    el.addEventListener("change", applyFilters);
});
document.getElementById("themeToggle").addEventListener("click", toggleTheme);

initTheme();
boot();
