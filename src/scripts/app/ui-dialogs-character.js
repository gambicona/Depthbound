function updateSaveStatus(message = "") {
  renderSaveSlots();
  if (message) {
    els.saveStatus.textContent = message;
  } else {
    const saveSystem = window.DungeonSave?.getStatus?.() ?? {};
    const savedCount = getSlots().filter((slot) => slot.hasSave).length;
    const folderText =
      saveSystem.mode === "file"
        ? `Save folder: ${saveSystem.directoryName}.`
        : saveSystem.mode === "unsupported"
          ? "Browser saves are ready. Folder saves work in Chrome or another Chromium browser."
          : saveSystem.mode === "disconnected"
            ? `Reconnect${saveSystem.directoryName ? ` "${saveSystem.directoryName}"` : " your save folder"} to keep folder saves active.`
            : "Ready to start. Browser saves work now; a save folder is optional.";
    const slotText = savedCount > 0 ? `${savedCount} save slot${savedCount === 1 ? "" : "s"} ready.` : "No adventures saved yet.";
    els.saveStatus.textContent = `${folderText} ${slotText}`;
  }
}

function selectSaveSlot(slotId) {
  if (!Number.isInteger(slotId) || slotId < 1 || slotId > slotCount) return;
  if (activeSaveSlot === slotId) return;
  activeSaveSlot = slotId;
  renderSaveSlots();
  const input = els.saveSlots.querySelector(`#save-slot-name-${slotId}`);
  input?.focus();
  input?.setSelectionRange(input.value.length, input.value.length);
}

async function confirmSaveSlotOverwrite(slotId, context = "save") {
  const slot = getSlots().find((entry) => entry.id === slotId);
  if (!slot?.hasSave) return true;
  const ownsSlot = state?.saveSlotId === slotId;
  if (ownsSlot) return true;
  const choice = await showGameDialog({
    title: "Overwrite Save Slot?",
    message:
      context === "new"
        ? `Slot ${slotId} already contains "${slot.name}". Starting this adventure here will overwrite that game.`
        : `Slot ${slotId} contains "${slot.name}", which is not the selected slot for this game. Overwrite it?`,
    confirmText: "Overwrite",
    cancelText: "Choose Another",
  });
  return Boolean(choice);
}

async function chooseSaveSlotForAdventure() {
  const slots = getSlots();
  while (true) {
    const selected = await showChoiceDialog({
      title: "Choose Save Slot",
      message: "Pick where this adventure should live. You can rename the slot next.",
      progress: heroCreationProgress.save,
      choices: slots.map((slot) => ({
        value: String(slot.id),
        label: `Slot ${slot.id}: ${slot.hasSave ? slot.name : "Empty"}`,
      })),
    });
    if (!selected) return null;
    const slotId = Number(selected);
    if (!(await confirmSaveSlotOverwrite(slotId, "new"))) continue;
    const slot = slots.find((entry) => entry.id === slotId);
    const defaultName = slot?.hasSave ? slot.name : `Save Slot ${slotId}`;
    const slotName = await showGameDialog({
      title: "Name Save File",
      message: `Name Slot ${slotId} so it is easy to recognize later.`,
      progress: heroCreationProgress.save,
      input: { label: "Save name", value: defaultName, maxLength: 32 },
      confirmText: "Use Name",
      cancelText: "Back",
    });
    if (slotName === null) continue;
    return { slotId, slotName: slotName || defaultName };
  }
}

function showLoadingScreen(title = "Loading", message = "Preparing the adventure.", detail = "") {
  if (!els.loadingScreen) return;
  if (els.loadingTitle) els.loadingTitle.textContent = title;
  if (els.loadingMessage) els.loadingMessage.textContent = message;
  if (els.loadingDetail) els.loadingDetail.textContent = detail;
  els.loadingScreen.classList.remove("hidden");
}

function updateLoadingScreen(title = "", message = "", detail = "") {
  if (!els.loadingScreen) return;
  if (title && els.loadingTitle) els.loadingTitle.textContent = title;
  if (message && els.loadingMessage) els.loadingMessage.textContent = message;
  if (els.loadingDetail) els.loadingDetail.textContent = detail;
}

function hideLoadingScreen() {
  els.loadingScreen?.classList.add("hidden");
}

function escapeAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

const heroCreationProgress = {
  save: { current: 1, total: 10, label: "Save" },
  identity: { current: 2, total: 10, label: "Hero" },
  class: { current: 3, total: 10, label: "Class" },
  race: { current: 4, total: 10, label: "Ancestry" },
  abilities: { current: 5, total: 10, label: "Abilities" },
  gear: { current: 6, total: 10, label: "Gear" },
  training: { current: 7, total: 10, label: "Training" },
  magic: { current: 8, total: 10, label: "Magic" },
  faith: { current: 9, total: 10, label: "Faith" },
  luck: { current: 10, total: 10, label: "Luck" },
};

function dialogProgressMarkup(progress = null) {
  if (!progress) return "";
  const current = Math.max(1, Number(progress.current) || 1);
  const total = Math.max(current, Number(progress.total) || current);
  const label = progress.label ? escapeHtml(progress.label) : "";
  return `<div class="dialog-progress"><span>Create Hero ${current}/${total}</span>${label ? `<b>${label}</b>` : ""}</div>`;
}

function dialogPlainMessageMarkup(message = "", progress = null) {
  return `${dialogProgressMarkup(progress)}${message ? `<p>${escapeHtml(message)}</p>` : ""}`;
}

function safeExportFilename(name, slotId) {
  const base = String(name ?? "")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${base || `save-slot-${slotId}`}-complete-save.json`;
}

function downloadJsonFile(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function readJsonFileFromUser() {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => {
        try {
          resolve(JSON.parse(String(reader.result ?? "")));
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    }, { once: true });
    input.click();
  });
}

function renderSaveSlots() {
  if (els.loadMenu) {
    els.loadMenu.setAttribute("aria-expanded", String(!els.saveSlots.classList.contains("hidden")));
  }
  if (els.settingsMenu) {
    els.settingsMenu.setAttribute("aria-expanded", String(!els.mainSettings?.classList.contains("hidden")));
  }
  if (els.chooseSaveFolder) {
    const status = window.DungeonSave?.getStatus?.() ?? {};
    els.chooseSaveFolder.textContent = status.mode === "file" ? "Change Save Folder" : status.mode === "unsupported" ? "Try Chrome for Save Folder" : "Choose Save Folder";
    els.chooseSaveFolder.disabled = false;
  }
  els.saveSlots.innerHTML = getSlots()
    .map((slot) => {
      const savedAt = slot.savedAt ? new Date(slot.savedAt).toLocaleString() : "Empty";
      const activeClass = slot.id === activeSaveSlot ? " active" : "";
      const canSaveCurrentGame = Boolean(state?.saveSlotId);
      return `
        <div class="save-slot${activeClass}" data-slot="${slot.id}">
          <div class="save-slot-main">
            <label for="save-slot-name-${slot.id}">Slot ${slot.id}</label>
            <input id="save-slot-name-${slot.id}" type="text" value="${escapeAttribute(slot.name)}" maxlength="32" />
            <span>${savedAt}</span>
          </div>
          <div class="save-slot-actions">
            <button type="button" data-action="save-slot" data-slot="${slot.id}" ${canSaveCurrentGame ? "" : "disabled"}>Save</button>
            <button type="button" data-action="load-slot" data-slot="${slot.id}" ${slot.hasSave ? "" : "disabled"}>Load</button>
            <button type="button" data-action="${slot.hasSave ? "export-slot" : "import-slot"}" data-slot="${slot.id}">${slot.hasSave ? "Export" : "Import"}</button>
            <button class="delete-save" type="button" data-action="delete-slot" data-slot="${slot.id}" ${slot.hasSave ? "" : "disabled"}>Delete</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function applyButtonTheme(theme = buttonTheme) {
  buttonTheme = buttonThemes.has(theme) ? theme : "verdigris";
  document.body.dataset.buttonTheme = buttonTheme;
  window.localStorage.setItem("dungeonCrawler.buttonTheme.v1", buttonTheme);
  if (els.buttonThemeSelect) els.buttonThemeSelect.value = buttonTheme;
}

function normalizeSaveRollMode(mode = saveRollMode) {
  return saveRollModes.has(mode) ? mode : "manual";
}

function saveRollModeOptionsMarkup(selectedMode = saveRollMode) {
  const selected = normalizeSaveRollMode(selectedMode);
  return Object.entries(saveRollModeLabels)
    .map(([value, label]) => `<option value="${value}" ${value === selected ? "selected" : ""}>${escapeHtml(label)}</option>`)
    .join("");
}

function applySaveRollMode(mode = saveRollMode) {
  saveRollMode = normalizeSaveRollMode(mode);
  if (state) state.saveRollMode = saveRollMode;
  window.localStorage.removeItem("dungeonCrawler.saveRollMode.v1");
  if (els.saveRollModeSelect) els.saveRollModeSelect.value = saveRollMode;
}

const comicReaderState = {
  comic: null,
  chapter: null,
  page: 1,
  zoom: 1,
};
let comicPageDrag = null;
const comicMagnifierZoom = 2.8;

function comicLibrary() {
  return Array.isArray(window.DepthboundComics) ? window.DepthboundComics : [];
}

function findComic(comicId) {
  return comicLibrary().find((comic) => comic.id === comicId) ?? null;
}

function findComicChapter(comic, chapterId) {
  return comic?.chapters?.find((chapter) => chapter.id === chapterId) ?? null;
}

function comicChapterPageCount(chapter) {
  if (Array.isArray(chapter?.pages) && chapter.pages.length) return chapter.pages.length;
  return Math.max(1, Math.floor(Number(chapter?.pageCount) || 1));
}

function comicChapterPagePath(comic, chapter, page) {
  if (Array.isArray(chapter?.pages) && chapter.pages[page - 1]) {
    return `${String(comic.root ?? "").replace(/\/$/, "")}/${chapter.pages[page - 1]}`;
  }
  const pageFile = chapter.pageFilePattern ? chapter.pageFilePattern.replace("{page}", String(page)) : `page-${page}.png`;
  return `${String(comic.root ?? "").replace(/\/$/, "")}/${chapter.id}/${pageFile}`;
}

function comicCoverChapter(comic) {
  return comic?.coverPage ? { id: "title-page", title: "Title Page", pages: [comic.coverPage] } : null;
}

function comicChapterSequence(comic) {
  return [comicCoverChapter(comic), ...(comic?.chapters ?? [])].filter(Boolean);
}

function comicChapterIndex(comic, chapter) {
  return comicChapterSequence(comic).findIndex((entry) => entry.id === chapter?.id);
}

function adjacentComicChapter(delta) {
  const { comic, chapter } = comicReaderState;
  const chapters = comicChapterSequence(comic);
  const index = comicChapterIndex(comic, chapter);
  if (index < 0) return null;
  return chapters[index + delta] ?? null;
}

function resetComicPageScroll() {
  els.comicPageStage?.scrollTo?.({ top: 0, left: 0, behavior: "auto" });
}

function renderComicMenu() {
  if (!els.comicsPanel) return;
  const comics = comicLibrary();
  els.comicsPanel.innerHTML = comics.length
    ? `
      <div class="comic-menu-list">
        ${comics
          .map(
            (comic) => `
              <button type="button" data-comic-id="${escapeAttribute(comic.id)}">
                <b>${escapeHtml(comic.title)}</b>
                <small>${comic.coverPage ? "Title page + " : ""}${escapeHtml(comic.chapters?.length ?? 0)} chapter${comic.chapters?.length === 1 ? "" : "s"}</small>
              </button>
            `,
          )
          .join("")}
      </div>
    `
    : `<p class="empty-note">No comics are available yet.</p>`;
}

function renderComicChapterMenu(comicId) {
  if (!els.comicsPanel) return;
  const comic = findComic(comicId);
  if (!comic) {
    renderComicMenu();
    return;
  }
  els.comicsPanel.innerHTML = `
    <div class="comic-submenu-heading">
      <p class="eyebrow">Comic</p>
      <h3>${escapeHtml(comic.title)}</h3>
    </div>
    <div class="comic-menu-list">
      ${
        comic.coverPage
          ? `
            <button type="button" data-comic-id="${escapeAttribute(comic.id)}" data-comic-cover-page="true">
              <b>Title Page</b>
              <small>Cover</small>
            </button>
          `
          : ""
      }
      ${(comic.chapters ?? [])
        .map(
          (chapter) => `
            <button type="button" data-comic-id="${escapeAttribute(comic.id)}" data-comic-chapter-id="${escapeAttribute(chapter.id)}">
              <b>${escapeHtml(chapter.title)}</b>
              <small>${escapeHtml(comicChapterPageCount(chapter))} page${comicChapterPageCount(chapter) === 1 ? "" : "s"}</small>
            </button>
          `,
        )
        .join("")}
    </div>
    <button type="button" class="ghost-button" data-comic-back-list>All Comics</button>
  `;
}

function setComicReaderZoom(zoom) {
  comicReaderState.zoom = clamp(Number(zoom) || 1, 0.5, 2.2);
  const percent = Math.round(comicReaderState.zoom * 100);
  if (els.comicZoomLabel) els.comicZoomLabel.textContent = `${percent}%`;
  if (els.comicZoomSlider) els.comicZoomSlider.value = String(percent);
  if (els.comicPageImage) els.comicPageImage.style.width = `${percent}%`;
  updateComicMagnifier();
}

function renderComicReader() {
  const { comic, chapter, page } = comicReaderState;
  if (!comic || !chapter) return;
  const pageCount = comicChapterPageCount(chapter);
  comicReaderState.page = clamp(Math.floor(Number(page) || 1), 1, pageCount);
  const currentPage = comicReaderState.page;
  if (els.comicReaderKicker) els.comicReaderKicker.textContent = comic.title;
  if (els.comicReaderTitle) els.comicReaderTitle.textContent = chapter.title;
  if (els.comicPageLabel) els.comicPageLabel.textContent = `Page ${currentPage} / ${pageCount}`;
  if (els.comicPrevPage) els.comicPrevPage.disabled = currentPage <= 1 && !adjacentComicChapter(-1);
  if (els.comicNextPage) els.comicNextPage.disabled = currentPage >= pageCount && !adjacentComicChapter(1);
  if (els.comicPageImage) {
    els.comicPageImage.classList.remove("hidden");
    els.comicPageImage.src = comicChapterPagePath(comic, chapter, currentPage);
    els.comicPageImage.alt = `${comic.title} ${chapter.title} page ${currentPage}`;
  }
  els.comicPageEmpty?.classList.add("hidden");
  setComicReaderZoom(comicReaderState.zoom);
}

function openComicReader(comicId, chapterId) {
  const comic = findComic(comicId);
  const chapter = findComicChapter(comic, chapterId);
  if (!comic || !chapter) return;
  comicReaderState.comic = comic;
  comicReaderState.chapter = chapter;
  comicReaderState.page = 1;
  comicReaderState.zoom = 1;
  renderComicReader();
  resetComicPageScroll();
  els.comicReader?.classList.remove("hidden");
}

function openComicCoverPage(comicId) {
  const comic = findComic(comicId);
  const chapter = comicCoverChapter(comic);
  if (!comic || !chapter) return;
  comicReaderState.comic = comic;
  comicReaderState.chapter = chapter;
  comicReaderState.page = 1;
  comicReaderState.zoom = 1;
  renderComicReader();
  resetComicPageScroll();
  els.comicReader?.classList.remove("hidden");
}

function closeComicReader() {
  hideComicMagnifier();
  endComicPageDrag();
  els.comicReader?.classList.add("hidden");
  if (els.comicPageImage) els.comicPageImage.removeAttribute("src");
}

function turnComicPage(delta) {
  const pageCount = comicChapterPageCount(comicReaderState.chapter);
  const nextPage = comicReaderState.page + delta;
  if (nextPage > pageCount) {
    const nextChapter = adjacentComicChapter(1);
    if (!nextChapter) return;
    comicReaderState.chapter = nextChapter;
    comicReaderState.page = 1;
    renderComicReader();
    resetComicPageScroll();
    return;
  }
  if (nextPage < 1) {
    const previousChapter = adjacentComicChapter(-1);
    if (!previousChapter) return;
    comicReaderState.chapter = previousChapter;
    comicReaderState.page = comicChapterPageCount(previousChapter);
    renderComicReader();
    resetComicPageScroll();
    return;
  }
  comicReaderState.page = nextPage;
  renderComicReader();
  resetComicPageScroll();
}

function comicImageReadyForInteraction() {
  return Boolean(els.comicPageImage && !els.comicPageImage.classList.contains("hidden") && els.comicPageImage.complete && els.comicPageImage.naturalWidth);
}

function beginComicPageDrag(event) {
  if (event.button !== 0 || !els.comicPageStage || !comicImageReadyForInteraction()) return;
  if (event.target?.closest?.("button, input, .comic-reader-toolbar, .comic-reader-header")) return;
  comicPageDrag = {
    startX: event.clientX,
    startY: event.clientY,
    scrollLeft: els.comicPageStage.scrollLeft,
    scrollTop: els.comicPageStage.scrollTop,
  };
  els.comicPageStage.classList.add("dragging");
  event.preventDefault();
}

function updateComicPageDrag(event) {
  if (!comicPageDrag || !els.comicPageStage) return;
  els.comicPageStage.scrollLeft = comicPageDrag.scrollLeft - (event.clientX - comicPageDrag.startX);
  els.comicPageStage.scrollTop = comicPageDrag.scrollTop - (event.clientY - comicPageDrag.startY);
  event.preventDefault();
}

function endComicPageDrag() {
  comicPageDrag = null;
  els.comicPageStage?.classList.remove("dragging");
}

function comicMagnifierGeometry(event) {
  if (!comicImageReadyForInteraction() || !els.comicMagnifier) return null;
  const imageRect = els.comicPageImage.getBoundingClientRect();
  const inside =
    event.clientX >= imageRect.left &&
    event.clientX <= imageRect.right &&
    event.clientY >= imageRect.top &&
    event.clientY <= imageRect.bottom;
  if (!inside) return null;
  const lensRect = els.comicMagnifier.getBoundingClientRect();
  const lensWidth = lensRect.width || 280;
  const lensHeight = lensRect.height || 280;
  const imageX = event.clientX - imageRect.left;
  const imageY = event.clientY - imageRect.top;
  return { imageRect, imageX, imageY, lensWidth, lensHeight };
}

function updateComicMagnifier(event = null) {
  if (!els.comicMagnifier || els.comicMagnifier.classList.contains("hidden")) return;
  const sourceEvent = event ?? comicReaderState.magnifierEvent;
  if (!sourceEvent) return;
  const geometry = comicMagnifierGeometry(sourceEvent);
  if (!geometry) {
    els.comicMagnifier.classList.add("hidden");
    return;
  }
  const { imageRect, imageX, imageY, lensWidth, lensHeight } = geometry;
  const zoom = comicMagnifierZoom;
  els.comicMagnifier.style.left = `${sourceEvent.clientX - lensWidth / 2}px`;
  els.comicMagnifier.style.top = `${sourceEvent.clientY - lensHeight / 2}px`;
  els.comicMagnifier.style.backgroundImage = `url("${els.comicPageImage.currentSrc || els.comicPageImage.src}")`;
  els.comicMagnifier.style.backgroundSize = `${imageRect.width * zoom}px ${imageRect.height * zoom}px`;
  els.comicMagnifier.style.backgroundPosition = `${lensWidth / 2 - imageX * zoom}px ${lensHeight / 2 - imageY * zoom}px`;
  comicReaderState.magnifierEvent = { clientX: sourceEvent.clientX, clientY: sourceEvent.clientY };
}

function showComicMagnifier(event) {
  if (event.button !== 2 || !els.comicMagnifier || !comicImageReadyForInteraction()) return;
  event.preventDefault();
  event.stopPropagation();
  els.comicMagnifier.classList.remove("hidden");
  updateComicMagnifier(event);
}

function moveComicMagnifier(event) {
  if (!els.comicMagnifier || els.comicMagnifier.classList.contains("hidden")) return;
  updateComicMagnifier(event);
  event.preventDefault();
}

function hideComicMagnifier() {
  if (!els.comicMagnifier) return;
  els.comicMagnifier.classList.add("hidden");
  comicReaderState.magnifierEvent = null;
}

function showMainMenuRoot() {
  els.menuActions?.classList.remove("hidden");
  els.mainMenuBack?.classList.add("hidden");
  els.comicsPanel?.classList.add("hidden");
  els.saveSlots?.classList.add("hidden");
  els.mainSettings?.classList.add("hidden");
  els.achievementsPanel?.classList.add("hidden");
  renderSaveSlots();
}

function showMainMenuSubmenu(section) {
  els.menuActions?.classList.add("hidden");
  els.mainMenuBack?.classList.remove("hidden");
  els.comicsPanel?.classList.toggle("hidden", section !== "comics");
  els.saveSlots?.classList.toggle("hidden", section !== "load");
  els.mainSettings?.classList.toggle("hidden", section !== "settings");
  els.achievementsPanel?.classList.toggle("hidden", section !== "achievements");
  if (section === "comics") renderComicMenu();
  renderSaveSlots();
}

function randomizeMainMenuBackground() {
  if (!els.mainMenu || !mainMenuBackgrounds?.length) return;
  const background = chooseMainMenuBackground();
  const backgroundUrl = new URL(background, window.location.href).href;
  const layers = els.mainMenuBackgroundLayers ?? [];
  if (!layers.length) {
    els.mainMenu.style.setProperty("--main-menu-bg", `url("${backgroundUrl}")`);
    return;
  }
  mainMenuBackgroundLayerIndex = (mainMenuBackgroundLayerIndex + 1) % layers.length;
  const activeLayer = layers[mainMenuBackgroundLayerIndex];
  activeLayer.style.setProperty("--main-menu-bg", `url("${backgroundUrl}")`);
  layers.forEach((layer) => layer.classList.toggle("active", layer === activeLayer));
}

function chooseMainMenuBackground() {
  if (mainMenuBackgrounds.length <= 1) {
    mainMenuBackgroundIndex = 0;
    return mainMenuBackgrounds[0];
  }
  let index = Math.floor(Math.random() * mainMenuBackgrounds.length);
  if (index === mainMenuBackgroundIndex) index = (index + 1) % mainMenuBackgrounds.length;
  mainMenuBackgroundIndex = index;
  return mainMenuBackgrounds[index];
}

function startMainMenuBackgroundRotation() {
  randomizeMainMenuBackground();
  window.clearInterval(mainMenuBackgroundTimer);
  mainMenuBackgroundTimer = window.setInterval(randomizeMainMenuBackground, 10000);
}

function stopMainMenuBackgroundRotation() {
  window.clearInterval(mainMenuBackgroundTimer);
  mainMenuBackgroundTimer = null;
}

async function chooseSaveFolderFromMenu() {
  try {
    const status = window.DungeonSave?.getStatus?.() ?? {};
    if (status.mode === "unsupported") {
      updateSaveStatus("Folder-backed saves do not work in Firefox yet. Try Chrome or another Chromium browser on localhost/HTTPS. Legacy browser saves are still available.");
      return false;
    }
    const connected = await window.DungeonSave.chooseSaveFolder();
    updateSaveStatus(connected ? "Save folder connected. Future saves will be written there." : "Could not connect the save folder.");
    return connected;
  } catch (error) {
    updateSaveStatus(error?.message ?? "Could not choose a save folder.");
    return false;
  }
}

function tokenArtEntryPreviewUrl(entry) {
  if (entry?.dataUrl) return entry.dataUrl;
  const art = entry?.tokenArt;
  if (!art?.path) return "";
  return art.runtimeUrl ?? window.DungeonSave?.cachedTokenUrl?.(art.path) ?? "";
}

function tokenArtStorageLabel(entry) {
  if (entry?.tokenArt?.path) return `Save folder: ${entry.tokenArt.path}`;
  if (entry?.dataUrl) return "localStorage embedded image";
  return "No image data";
}

function clearTokenArtReferences(entry) {
  if (!entry || !state?.fighters) return;
  const ids = new Set([entry.id, entry.tokenArt?.id].filter(Boolean));
  for (const fighter of Object.values(state.fighters)) {
    const art = fighter?.tokenArt;
    const artId = art?.id ?? "";
    const sameString = typeof art === "string" && entry.dataUrl && art === entry.dataUrl;
    if (ids.has(artId) || sameString) fighter.tokenArt = "";
  }
}

async function deleteCustomHeroTokenArtEntry(entry) {
  if (!entry?.id) return false;
  if (entry.tokenArt?.path) await window.DungeonSave?.deleteTokenFile?.(entry.tokenArt.path);
  const entries = loadCustomHeroTokenArt().filter((candidate) => candidate.id !== entry.id);
  saveCustomHeroTokenArt(entries);
  clearTokenArtReferences(entry);
  return true;
}

function showTokenArtManager() {
  const renderManager = () => {
    const entries = loadCustomHeroTokenArt();
    els.gameDialogForm.classList.add("wide-dialog");
    els.gameDialogTitle.textContent = "Token Pictures";
    els.gameDialogField.classList.add("hidden");
    els.gameDialogMessage.innerHTML = entries.length
      ? `
        <div class="token-manager-list">
          ${entries
            .map((entry) => {
              const preview = tokenArtEntryPreviewUrl(entry);
              return `
                <div class="token-manager-row" data-token-entry="${escapeAttribute(entry.id)}">
                  <div class="hero-token-preview ${preview ? "" : "empty"}">
                    ${preview ? `<img src="${escapeAttribute(preview)}" alt="${escapeAttribute(entry.tokenName ?? entry.name ?? "Token picture")}" />` : `<span>?</span>`}
                  </div>
                  <div>
                    <b>${escapeHtml(entry.tokenName ?? entry.name ?? "Custom token")}</b>
                    <span>${escapeHtml(tokenArtStorageLabel(entry))}</span>
                  </div>
                  <button type="button" class="delete-save" data-delete-token-art="${escapeAttribute(entry.id)}">Delete</button>
                </div>
              `;
            })
            .join("")}
        </div>
      `
      : `<p class="empty-note">No custom token pictures are stored in localStorage.</p>`;
    els.gameDialogActions.innerHTML = `<button type="button" data-token-manager-close>Close</button>`;
    for (const entry of entries) {
      if (!entry.tokenArt?.path || tokenArtEntryPreviewUrl(entry)) continue;
      window.DungeonSave?.resolveTokenPath?.(entry.tokenArt.path).then((url) => {
        if (url && !els.gameDialog.classList.contains("hidden")) renderManager();
      });
    }
  };

  const cleanup = () => {
    els.gameDialogActions.removeEventListener("click", handleActions);
    els.gameDialogMessage.removeEventListener("click", handleMessageClick);
    els.gameDialogForm.classList.remove("wide-dialog");
    els.gameDialog.classList.add("hidden");
    activeDialogCancel = null;
  };

  const handleActions = (event) => {
    if (!event.target.closest("[data-token-manager-close]")) return;
    cleanup();
  };

  const handleMessageClick = async (event) => {
    const button = event.target.closest("[data-delete-token-art]");
    if (!button) return;
    const entry = loadCustomHeroTokenArt().find((candidate) => candidate.id === button.dataset.deleteTokenArt);
    if (!entry) return;
    await deleteCustomHeroTokenArtEntry(entry);
    renderManager();
    render?.();
  };

  els.gameDialogActions.addEventListener("click", handleActions);
  els.gameDialogMessage.addEventListener("click", handleMessageClick);
  activeDialogCancel = cleanup;
  renderManager();
  els.gameDialog.classList.remove("hidden");
}

async function promptForSaveFolderIfNeeded() {
  const status = window.DungeonSave?.getStatus?.() ?? {};
  if (status.mode === "file" || status.mode === "unsupported") return true;
  const choice = await showTwoChoiceDialog({
    title: status.mode === "disconnected" ? "Reconnect Save Folder" : "Choose Save Folder",
    message:
      status.mode === "disconnected"
        ? `Depthbound needs permission for${status.directoryName ? ` "${status.directoryName}"` : " your save folder"} again before it can keep saving there.`
        : "Folder saves are portable and easy to back up. Browser storage is fine if you just want to start.",
    progress: heroCreationProgress.save,
    primaryText: status.mode === "disconnected" ? "Reconnect Folder" : "Choose Folder",
    secondaryText: "Start With Browser Storage",
  });
  if (choice !== "primary") return true;
  return chooseSaveFolderFromMenu();
}

function restoreDialogInputField() {
  els.gameDialogField.className = "dialog-field hidden";
  els.gameDialogField.innerHTML = `
    <span id="game-dialog-label">Name</span>
    <input id="game-dialog-input" type="text" autocomplete="off" />
  `;
  els.gameDialogLabel = els.gameDialogField.querySelector("#game-dialog-label");
  els.gameDialogInput = els.gameDialogField.querySelector("#game-dialog-input");
}

function showMainMenu(message = "") {
  interactiveTutorialActive = false;
  els.tutorialTour?.classList.add("hidden");
  els.tutorialHighlight?.classList.add("hidden");
  gameHasStarted = false;
  adminMode = false;
  disableAdminModeOptions();
  clearHeldMovementKeys();
  window.clearTimeout(monsterTurnTimer);
  hideFighterInfo();
  hideInventoryMenu();
  hideUseItemMenu();
  hideAbilitiesMenu();
  hideHomeMenu();
  hideStoreMenu();
  closeComicReader();
  startMainMenuBackgroundRotation();
  document.body.classList.add("menu-active");
  els.mainMenu.classList.remove("hidden");
  showMainMenuRoot();
  updateSaveStatus(message);
  renderControls();
}

function hideMainMenu() {
  gameHasStarted = true;
  stopMainMenuBackgroundRotation();
  document.body.classList.remove("menu-active");
  els.mainMenu.classList.add("hidden");
  showMainMenuRoot();
  renderControls();
}

function showGameDialog({ title, message = "", input = null, confirmText = "OK", cancelText = "Cancel", progress = null }) {
  return new Promise((resolve) => {
    restoreDialogInputField();
    els.gameDialogTitle.textContent = title;
    els.gameDialogMessage.innerHTML = dialogPlainMessageMarkup(message, progress);
    els.gameDialogField.classList.toggle("hidden", !input);
    els.gameDialogActions.innerHTML = `
      <button type="submit" data-dialog-action="confirm">${escapeHtml(confirmText)}</button>
      <button type="button" class="ghost-button" data-dialog-action="cancel">${escapeHtml(cancelText)}</button>
    `;

    if (input) {
      els.gameDialogLabel.textContent = input.label;
      els.gameDialogInput.value = input.value ?? "";
      els.gameDialogInput.maxLength = input.maxLength ?? 32;
    }

    const cleanup = (value) => {
      els.gameDialogForm.removeEventListener("submit", handleSubmit);
      els.gameDialogActions.removeEventListener("click", handleActionClick);
      els.gameDialog.classList.add("hidden");
      activeDialogCancel = null;
      resolve(value);
    };

    const handleSubmit = (event) => {
      event.preventDefault();
      cleanup(input ? els.gameDialogInput.value.trim() : true);
    };

    const handleActionClick = (event) => {
      const button = event.target.closest("[data-dialog-action]");
      if (!button || button.dataset.dialogAction !== "cancel") return;
      cleanup(input ? null : false);
    };

    els.gameDialogForm.addEventListener("submit", handleSubmit);
    els.gameDialogActions.addEventListener("click", handleActionClick);
    activeDialogCancel = () => cleanup(input ? null : false);
    els.gameDialog.classList.remove("hidden");
    if (input) {
      els.gameDialogInput.focus();
      els.gameDialogInput.select();
    } else {
      els.gameDialogActions.querySelector("[data-dialog-action='confirm']")?.focus();
    }
  });
}

function showTwoChoiceDialog({ title, message, primaryText, secondaryText, progress = null }) {
  return new Promise((resolve) => {
    els.gameDialogTitle.textContent = title;
    els.gameDialogMessage.innerHTML = dialogPlainMessageMarkup(message, progress);
    els.gameDialogField.classList.add("hidden");
    els.gameDialogActions.innerHTML = `
      <button type="button" data-choice="primary">${escapeHtml(primaryText)}</button>
      <button type="button" class="ghost-button" data-choice="secondary">${escapeHtml(secondaryText)}</button>
    `;

    const cleanup = (value) => {
      els.gameDialogActions.removeEventListener("click", handleClick);
      els.gameDialog.classList.add("hidden");
      activeDialogCancel = null;
      resolve(value);
    };

    const handleClick = (event) => {
      const button = event.target.closest("[data-choice]");
      if (!button) return;
      cleanup(button.dataset.choice);
    };

    els.gameDialogActions.addEventListener("click", handleClick);
    activeDialogCancel = () => cleanup("primary");
    els.gameDialog.classList.remove("hidden");
    els.gameDialogActions.querySelector("[data-choice='primary']")?.focus();
  });
}

function showHeroIdentityDialog({ title, message, nameValue, tokenArt = "", confirmText = "OK", cancelText = "Cancel", backText = "", progress = null }) {
  return new Promise((resolve) => {
    els.gameDialogTitle.textContent = title;
    els.gameDialogMessage.innerHTML = dialogPlainMessageMarkup(message, progress);
    els.gameDialogField.classList.remove("hidden");
    els.gameDialogActions.innerHTML = `
      <button type="submit" data-dialog-action="confirm">${escapeHtml(confirmText)}</button>
      ${backText ? `<button type="button" class="ghost-button" data-dialog-action="back">${escapeHtml(backText)}</button>` : ""}
      <button type="button" class="ghost-button" data-dialog-action="cancel">${escapeHtml(cancelText)}</button>
    `;

    let selectedValue = selectionValueForHeroTokenArt(tokenArt);
    let errorText = "";
    let pendingFullDataUrl = "";
    let pendingImageSize = null;
    let pendingCrop = { x: 0.5, y: 0.5, zoom: 1 };
    let cropDrag = null;

    const currentName = () => els.gameDialogField.querySelector("[data-hero-identity-name]")?.value ?? nameValue ?? "";
    const heroNameSuggestions = window.DepthboundHeroNames?.randomOptions?.(350) ?? window.DepthboundHeroNames?.names ?? [];
    const suggestedNames = () => {
      const names = heroNameSuggestions;
      return nameValue && !names.includes(nameValue) ? [nameValue, ...names] : names;
    };
    const updateCropPreviewTransform = () => {
      const image = els.gameDialogField.querySelector("[data-token-crop-preview] img");
      if (image) {
        const metrics = tokenCropDrawMetrics(pendingImageSize, heroTokenPreviewSize, pendingCrop);
        image.style.width = `${metrics.drawWidth}px`;
        image.style.height = `${metrics.drawHeight}px`;
        image.style.left = `${metrics.left}px`;
        image.style.top = `${metrics.top}px`;
      }
    };

    const renderField = () => {
      const options = heroTokenArtOptions();
      if (tokenArt && !tokenArt?.type && !options.some((option) => option.value === tokenArt)) {
        options.splice(1, 0, { label: "Default picture", value: tokenArt, custom: false });
      }
      const names = suggestedNames();
      if (!options.some((option) => option.value === selectedValue)) selectedValue = noHeroTokenArtValue;
      const resolvedArt = resolveHeroTokenArtSelection(selectedValue);
      let resolvedPreviewArt =
        typeof resolvedArt === "string"
          ? resolvedArt
          : resolvedArt?.runtimeUrl ?? window.DungeonSave?.cachedTokenUrl?.(resolvedArt?.path) ?? "";
      if (!resolvedPreviewArt && resolvedArt?.type === "custom-file" && window.DungeonSave?.resolveTokenPath) {
        window.DungeonSave.resolveTokenPath(resolvedArt.path).then((url) => {
          if (url) {
            renderField();
          }
        });
      }
      const previewArt = pendingFullDataUrl || resolvedPreviewArt;
      const previewMetrics = pendingFullDataUrl ? tokenCropDrawMetrics(pendingImageSize, heroTokenPreviewSize, pendingCrop) : null;
      const previewStyle = previewMetrics
        ? `width:${previewMetrics.drawWidth}px;height:${previewMetrics.drawHeight}px;left:${previewMetrics.left}px;top:${previewMetrics.top}px;`
        : "";
      els.gameDialogField.innerHTML = `
        <label>
          <span>Suggested name</span>
          <select data-hero-name-suggestion>
            <option value="">Choose a name...</option>
            ${names.map((name) => `<option value="${escapeAttribute(name)}" ${name === nameValue ? "selected" : ""}>${escapeHtml(name)}</option>`).join("")}
          </select>
        </label>
        <label>
          <span>Character name</span>
          <input data-hero-identity-name type="text" maxlength="32" value="${escapeAttribute(nameValue ?? "")}" />
        </label>
        <label>
          <span>Token picture</span>
          <select data-hero-token-select>
            ${options.map((option) => `<option value="${escapeAttribute(option.value)}" ${option.value === selectedValue ? "selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}
          </select>
        </label>
        <div class="hero-token-tools">
          <div class="hero-token-preview ${previewArt ? "editable" : "empty"}" data-token-crop-preview>
            ${previewArt ? `<img src="${escapeAttribute(previewArt)}" alt="Selected token picture" style="${escapeAttribute(previewStyle)}" />` : `<span>${escapeHtml(tokenFromName(nameValue ?? "H", "H"))}</span>`}
          </div>
          <div class="hero-token-actions">
            <input data-hero-token-file type="file" accept="image/*" />
            ${
              pendingFullDataUrl
                ? `<label class="token-zoom">
                    <span>Zoom</span>
                    <input data-token-zoom type="range" min="1" max="4" step="0.05" value="${pendingCrop.zoom}" />
                  </label>
                  <button type="button" data-action="save-token-crop">Save Token Crop</button>`
                : ""
            }
            <button type="button" class="ghost-button" data-action="delete-custom-token" ${selectedValue.startsWith(customHeroTokenArtPrefix) ? "" : "disabled"}>Delete Custom Picture</button>
            <p class="empty-note">Paste an image while this window is open, or choose an image file. Drag and zoom the picture inside the circle. The crop is saved automatically when you confirm this hero.</p>
            <p class="ability-assignment-error" aria-live="polite">${escapeHtml(errorText)}</p>
          </div>
        </div>
      `;
    };

    const cleanup = (value) => {
      els.gameDialogForm.removeEventListener("submit", handleSubmit);
      els.gameDialogActions.removeEventListener("click", handleActionClick);
      els.gameDialogField.removeEventListener("change", handleFieldChange);
      els.gameDialogField.removeEventListener("click", handleFieldClick);
      els.gameDialogField.removeEventListener("input", handleFieldInput);
      els.gameDialogField.removeEventListener("pointerdown", handleCropPointerDown);
      window.removeEventListener("pointermove", handleCropPointerMove);
      window.removeEventListener("pointerup", handleCropPointerUp);
      window.removeEventListener("paste", handlePaste);
      els.gameDialog.classList.add("hidden");
      activeDialogCancel = null;
      resolve(value);
    };

    const addCustomToken = async (file) => {
      try {
        pendingFullDataUrl = await imageFileToDataUrl(file);
        const image = await loadImageElement(pendingFullDataUrl);
        pendingImageSize = { width: image.width, height: image.height };
        pendingCrop = { x: 0.5, y: 0.5, zoom: 1 };
        errorText = "";
        nameValue = currentName();
        renderField();
      } catch (error) {
        errorText = error?.message ?? "Could not add that image.";
        renderField();
      }
    };

    const savePendingCrop = async () => {
      if (!pendingFullDataUrl) return true;
      try {
        const heroName = currentName();
        const dataUrl = await cropTokenDataUrl(pendingFullDataUrl, pendingCrop);
        const entries = loadCustomHeroTokenArt();
        const id = `${safeTokenArtName(heroName, "token")}-${Date.now()}`;
        let tokenArt = null;
        let persistedDataUrl = dataUrl;
        if (window.DungeonSave?.writeTokenFile) {
          try {
            const blob = await dataUrlToBlob(dataUrl);
            const path = await window.DungeonSave.writeTokenFile(id, blob);
            if (path) {
              const runtimeUrl = URL.createObjectURL(blob);
              window.DungeonSave.rememberTokenUrl?.(path, runtimeUrl);
              tokenArt = { type: "custom-file", id, path, name: safeTokenArtName(heroName, "token"), crop: { ...pendingCrop } };
              persistedDataUrl = "";
            }
          } catch (error) {
            console.warn("Could not write token image file; using cropped legacy token data.", error);
          }
        }
        entries.push({
          id,
          name: safeTokenArtName(heroName, "token"),
          tokenName: safeTokenArtName(heroName, "token"),
          dataUrl: persistedDataUrl,
          tokenArt,
          crop: { ...pendingCrop },
        });
        saveCustomHeroTokenArt(entries);
        selectedValue = `${customHeroTokenArtPrefix}${id}`;
        pendingFullDataUrl = "";
        pendingImageSize = null;
        errorText = "";
        nameValue = heroName;
        renderField();
        return true;
      } catch (error) {
        errorText = error?.message ?? "Could not save that token crop.";
        renderField();
        return false;
      }
    };

    const handleSubmit = async (event) => {
      event.preventDefault();
      if (pendingFullDataUrl && !(await savePendingCrop())) return;
      const name = currentName().trim();
      renameCustomHeroTokenArt(selectedValue, name);
      cleanup({ name, tokenArt: resolveHeroTokenArtSelection(selectedValue) });
    };

    const handleActionClick = (event) => {
      const button = event.target.closest("[data-dialog-action]");
      if (!button) return;
      if (button.dataset.dialogAction === "cancel") cleanup(null);
      if (button.dataset.dialogAction === "back") cleanup(dialogBackValue);
    };

    const handleFieldChange = (event) => {
      if (event.target.matches("[data-hero-name-suggestion]")) {
        const suggestion = event.target.value;
        if (!suggestion) return;
        nameValue = suggestion;
        renderField();
        const input = els.gameDialogField.querySelector("[data-hero-identity-name]");
        input?.focus();
        input?.setSelectionRange(input.value.length, input.value.length);
        return;
      }
      if (event.target.matches("[data-hero-token-select]")) {
        selectedValue = event.target.value;
        pendingFullDataUrl = "";
        pendingImageSize = null;
        nameValue = currentName();
        errorText = "";
        renderField();
      }
      if (event.target.matches("[data-hero-token-file]")) {
        const file = event.target.files?.[0];
        if (file) addCustomToken(file);
      }
      if (event.target.matches("[data-hero-identity-name]")) {
        nameValue = event.target.value;
      }
    };

    const handleFieldInput = (event) => {
      if (event.target.matches("[data-token-zoom]")) {
        pendingCrop.zoom = Number(event.target.value);
        nameValue = currentName();
        updateCropPreviewTransform();
      }
      if (event.target.matches("[data-hero-identity-name]")) nameValue = event.target.value;
    };

    const handleFieldClick = async (event) => {
      const saveButton = event.target.closest("[data-action='save-token-crop']");
      if (saveButton) {
        await savePendingCrop();
        return;
      }
      const button = event.target.closest("[data-action='delete-custom-token']");
      if (!button) return;
      const entry = loadCustomHeroTokenArt().find((candidate) => `${customHeroTokenArtPrefix}${candidate.id}` === selectedValue);
      if (entry ? await deleteCustomHeroTokenArtEntry(entry) : deleteCustomHeroTokenArt(selectedValue)) {
        selectedValue = noHeroTokenArtValue;
        errorText = "";
        nameValue = currentName();
        renderField();
      }
    };

    const handleCropPointerDown = (event) => {
      if (!pendingFullDataUrl || !event.target.closest("[data-token-crop-preview]")) return;
      cropDrag = {
        startX: event.clientX,
        startY: event.clientY,
        cropX: pendingCrop.x,
        cropY: pendingCrop.y,
      };
      event.preventDefault();
    };

    const handleCropPointerMove = (event) => {
      if (!cropDrag) return;
      const preview = els.gameDialogField.querySelector("[data-token-crop-preview]");
      const size = preview?.getBoundingClientRect().width || 1;
      const metrics = tokenCropDrawMetrics(pendingImageSize, size, pendingCrop);
      pendingCrop.x = clamp(cropDrag.cropX - (event.clientX - cropDrag.startX) / metrics.drawWidth, 0, 1);
      pendingCrop.y = clamp(cropDrag.cropY - (event.clientY - cropDrag.startY) / metrics.drawHeight, 0, 1);
      nameValue = currentName();
      updateCropPreviewTransform();
    };

    const handleCropPointerUp = () => {
      cropDrag = null;
    };

    const handlePaste = (event) => {
      if (els.gameDialog.classList.contains("hidden")) return;
      const file = Array.from(event.clipboardData?.items ?? [])
        .find((item) => item.type.startsWith("image/"))
        ?.getAsFile();
      if (!file) return;
      event.preventDefault();
      addCustomToken(file);
    };

    els.gameDialogForm.addEventListener("submit", handleSubmit);
    els.gameDialogActions.addEventListener("click", handleActionClick);
    els.gameDialogField.addEventListener("change", handleFieldChange);
    els.gameDialogField.addEventListener("click", handleFieldClick);
    els.gameDialogField.addEventListener("input", handleFieldInput);
    els.gameDialogField.addEventListener("pointerdown", handleCropPointerDown);
    window.addEventListener("pointermove", handleCropPointerMove);
    window.addEventListener("pointerup", handleCropPointerUp);
    window.addEventListener("paste", handlePaste);
    activeDialogCancel = () => cleanup(null);
    renderField();
    els.gameDialog.classList.remove("hidden");
    els.gameDialogField.querySelector("[data-hero-identity-name]")?.focus();
  });
}

function dialogActorMarkup(actor) {
  if (!actor) return "";
  const artMarkup =
    typeof combatantArtworkMarkup === "function"
      ? combatantArtworkMarkup(actor, "dialog-actor-art")
      : `<div class="dialog-actor-art empty"><span>${escapeHtml(actor.token ?? tokenFromName(actor.name, "H"))}</span></div>`;
  return `
    <div class="dialog-actor">
      ${artMarkup}
      <div>
        <b>${escapeHtml(actor.name ?? "Hero")}</b>
        <span>${escapeHtml(combatantRoleLabel(actor))}</span>
      </div>
    </div>
  `;
}

function dialogMessageMarkup(message, actor = null, progress = null) {
  return `${dialogProgressMarkup(progress)}${dialogActorMarkup(actor)}<p>${escapeHtml(message ?? "")}</p>`;
}

function showChoiceDialog({ title, message, messageHtml = null, choices, actor = null, progress = null, dialogClass = "" }) {
  return new Promise((resolve) => {
    const dialogClasses = String(dialogClass ?? "")
      .split(/\s+/)
      .map((entry) => entry.trim())
      .filter(Boolean);
    els.gameDialogTitle.textContent = title;
    els.gameDialogMessage.innerHTML = messageHtml ?? (actor ? dialogMessageMarkup(message, actor, progress) : dialogPlainMessageMarkup(message, progress));
    els.gameDialogField.classList.add("hidden");
    dialogClasses.forEach((className) => els.gameDialogForm.classList.add(className));
    els.gameDialogActions.innerHTML = choices
      .map(
        (choice) =>
          `<button type="button" class="${choice.value === dialogBackValue ? "ghost-button" : ""} ${choice.description || choice.info ? "choice-with-description" : ""}" data-choice="${escapeAttribute(choice.value)}" ${
            choice.disabled ? "disabled" : ""
          } ${
            choice.description ? `title="${escapeAttribute(choice.description)}"` : ""
          }>
            <b>${escapeHtml(choice.label)}${choice.info ? ` <span class="choice-info-glyph" title="${escapeAttribute(choice.info)}" aria-label="More information">i</span>` : ""}</b>
            ${choice.description ? `<span class="choice-description">${escapeHtml(choice.description)}</span>` : ""}
            ${choice.info ? `<span class="choice-info-text">${escapeHtml(choice.info)}</span>` : ""}
          </button>`,
      )
      .join("");

    const cleanup = (value) => {
      els.gameDialogActions.removeEventListener("click", handleClick);
      dialogClasses.forEach((className) => els.gameDialogForm.classList.remove(className));
      els.gameDialog.classList.add("hidden");
      activeDialogCancel = null;
      resolve(value);
    };

    const handleClick = (event) => {
      const button = event.target.closest("[data-choice]");
      if (!button || button.disabled) return;
      cleanup(button.dataset.choice);
    };

    els.gameDialogActions.addEventListener("click", handleClick);
    activeDialogCancel = () => cleanup(null);
    els.gameDialog.classList.remove("hidden");
    els.gameDialogActions.querySelector("[data-choice]:not(:disabled)")?.focus();
  });
}

function selectChoiceDetailMarkup(choice) {
  if (!choice) return `<p class="choice-description">No choice selected.</p>`;
  return `
    ${choice.label ? `<b>${escapeHtml(choice.label)}${choice.info ? ` <span class="choice-info-glyph" title="${escapeAttribute(choice.info)}" aria-label="More information">i</span>` : ""}</b>` : ""}
    ${choice.description ? `<p>${escapeHtml(choice.description)}</p>` : ""}
    ${choice.info ? `<p class="choice-info-text">${escapeHtml(choice.info)}</p>` : ""}
  `;
}

function showSelectChoiceDialog({
  title,
  message,
  choices,
  actor = null,
  label = "Choose:",
  defaultValue = null,
  confirmText = "Choose",
  cancelText = "Cancel",
  cancelValue = null,
  progress = null,
}) {
  return new Promise((resolve) => {
    const initialValue = defaultValue ?? choices[0]?.value ?? "";
    els.gameDialogTitle.textContent = title;
    els.gameDialogMessage.innerHTML = actor ? dialogMessageMarkup(message, actor, progress) : dialogPlainMessageMarkup(message, progress);
    els.gameDialogField.classList.remove("hidden");
    els.gameDialogField.innerHTML = `
      <span class="select-choice-field">
        <span>${escapeHtml(label)}</span>
        <select data-select-choice>
          ${choices
            .map(
              (choice) =>
                `<option value="${escapeAttribute(choice.value)}" ${choice.optionClass ? `class="${escapeAttribute(choice.optionClass)}"` : ""} ${String(choice.value) === String(initialValue) ? "selected" : ""}>${escapeHtml(choice.label)}</option>`,
            )
            .join("")}
        </select>
      </span>
      <div class="select-choice-details" data-select-choice-details></div>
    `;
    els.gameDialogActions.innerHTML = `
      <button type="button" data-select-confirm>${escapeHtml(confirmText)}</button>
      <button type="button" class="ghost-button" data-select-cancel>${escapeHtml(cancelText)}</button>
    `;

    const select = els.gameDialogField.querySelector("[data-select-choice]");
    const details = els.gameDialogField.querySelector("[data-select-choice-details]");
    const selectedChoice = () => choices.find((choice) => String(choice.value) === String(select?.value)) ?? choices[0] ?? null;
    const renderDetails = () => {
      const choice = selectedChoice();
      details.className = ["select-choice-details", choice?.detailClass].filter(Boolean).join(" ");
      details.innerHTML = selectChoiceDetailMarkup(choice);
    };

    const cleanup = (value) => {
      els.gameDialogActions.removeEventListener("click", handleClick);
      els.gameDialogField.removeEventListener("change", handleChange);
      els.gameDialog.classList.add("hidden");
      els.gameDialogField.innerHTML = "";
      els.gameDialogField.classList.add("hidden");
      activeDialogCancel = null;
      resolve(value);
    };

    const handleClick = (event) => {
      if (event.target.closest("[data-select-cancel]")) cleanup(cancelValue);
      if (event.target.closest("[data-select-confirm]")) cleanup(select?.value ?? null);
    };
    const handleChange = (event) => {
      if (event.target.closest("[data-select-choice]")) renderDetails();
    };

    renderDetails();
    els.gameDialogActions.addEventListener("click", handleClick);
    els.gameDialogField.addEventListener("change", handleChange);
    activeDialogCancel = () => cleanup(cancelValue);
    els.gameDialog.classList.remove("hidden");
    select?.focus();
  });
}

function storyImageMarkup(images = []) {
  return images
    .slice(0, 2)
    .map((image) => `<img class="story-image" src="${escapeAttribute(image)}" alt="" />`)
    .join("");
}

const narrativeHighlightTerms = [
  "Goal",
  "Reward",
  "Rank",
  "Renown",
  "Reputation",
  "Equipment",
  "Contracts",
  "Contract",
  "Quest",
  "Quests",
  "Boons",
  "Boon",
  "Recruits",
  "Recruit",
  "Clerics",
  "Cleric",
  "Paladins",
  "Paladin",
  "Dungeon",
  "Dungeons",
  "Delve",
  "Delves",
  "Boss",
  "Exit",
  "Village",
  "City",
  "Home Village",
  "Road",
  "Roads",
  "Road Kits",
  "Milepost",
  "Teleportation Circle",
  "Teleportation Circles",
  "Undead",
  "Elemental",
  "Planar",
  "Shrine",
  "Shrines",
  "Mine",
  "Mines",
  "Burrow",
  "Burrows",
  "Crypt",
  "Crypts",
  "Ruin",
  "Ruins",
  "Trophy Lodge",
  "Gravebinders",
  "Crucible Collegium",
  "Antiquarian Society",
  "Expedition Board",
  "Fighting Pit",
  "Fizzywick's Fireworks Club",
  "Barrow Crown",
  "Thornwood Pact",
  "First Claim",
  "Embervein",
];

function narrativeHighlightMarkup(text = "") {
  let markup = escapeHtml(text ?? "");
  const terms = narrativeHighlightTerms
    .slice()
    .sort((a, b) => b.length - a.length)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!terms.length) return markup;
  const pattern = new RegExp(`\\b(${terms.join("|")})\\b`, "gi");
  return markup.replace(pattern, `<mark class="narrative-highlight">$1</mark>`);
}

function storyTextMarkup(text = "") {
  return String(text)
    .trim()
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map((paragraph) => `<p>${narrativeHighlightMarkup(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function customGoalStatusForTemplate(template) {
  const goal = template?.goal;
  if (!goal || goal.type === "reachExit") return { text: "Reach the exit." };
  if (goal.type === "collectItem") return { text: `Collect ${getItemTemplate(goal.itemId)?.name ?? goal.itemId ?? "the required object"}.` };
  if (goal.type === "collectItemCount") {
    const target = Math.max(1, Number(goal.count) || 1);
    const item = getItemTemplate(goal.itemId);
    return { text: `Collect ${target} ${item?.name ?? goal.itemId ?? "required item"}${target === 1 ? "" : "s"} (0/${target}).` };
  }
  if (goal.type === "killBoss") return { text: "Kill the boss." };
  if (goal.type === "killMonsterType") {
    const target = Math.max(1, Number(goal.count) || 1);
    const monster = getMonsterTemplate(goal.monsterId);
    return { text: `Defeat ${target} ${monster?.name ?? goal.monsterId ?? "chosen monster"}${target === 1 ? "" : "s"} (0/${target}).` };
  }
  if (goal.type === "interactObject") return { text: goal.text ?? "Use the marked object before leaving." };
  return { text: "Complete the dungeon goal." };
}

async function showDungeonStoryDialog({ title, text = "", images = [], actionLabel = "Continue", goalText = "", voiceIds = [] }) {
  const displayText = voiceIds.length && typeof dungeonVoiceTextForLineIds === "function"
    ? await dungeonVoiceTextForLineIds(voiceIds, text)
    : text;
  return new Promise((resolve) => {
    els.gameDialogTitle.textContent = title;
    els.gameDialogForm.classList.add("wide-dialog", "story-dialog-panel");
    els.gameDialogMessage.innerHTML = `
      <div class="story-dialog-content">
        ${storyImageMarkup(images)}
        ${displayText ? storyTextMarkup(displayText) : ""}
        ${goalText ? `<p class="story-goal"><b>Goal:</b> ${narrativeHighlightMarkup(goalText)}</p>` : ""}
      </div>
    `;
    els.gameDialogField.classList.add("hidden");
    els.gameDialogActions.innerHTML = `<button type="button" data-story-continue>${escapeHtml(actionLabel)}</button>`;
    const button = els.gameDialogActions.querySelector("[data-story-continue]");
    const cleanup = () => {
      button.removeEventListener("click", cleanup);
      if (typeof stopDungeonVoiceLine === "function") stopDungeonVoiceLine();
      els.gameDialogForm.classList.remove("wide-dialog", "story-dialog-panel");
      els.gameDialog.classList.add("hidden");
      activeDialogCancel = null;
      resolve(true);
    };
    button.addEventListener("click", cleanup);
    activeDialogCancel = cleanup;
    els.gameDialog.classList.remove("hidden");
    button.focus();
    if (voiceIds.length && typeof playDungeonVoiceLineSequence === "function") void playDungeonVoiceLineSequence(voiceIds);
  });
}

function showReactionPrompt({ actor = null, title = "Reaction", message = "", acceptLabel = "Use Reaction", declineLabel = "Skip" } = {}) {
  const showLocalReactionPrompt = () => new Promise((resolve) => {
    const existing = document.querySelector(".reaction-prompt");
    existing?.remove();
    const prompt = document.createElement("div");
    prompt.className = "reaction-prompt";
    prompt.innerHTML = `
      <div class="reaction-prompt-title">${escapeHtml(title)}</div>
      ${dialogActorMarkup(actor)}
      <p>${escapeHtml(message)}</p>
      <div class="reaction-prompt-actions">
        <button type="button" data-reaction-accept>${escapeHtml(acceptLabel)}</button>
        <button type="button" class="ghost-button" data-reaction-decline>${escapeHtml(declineLabel)}</button>
      </div>
    `;

    const cleanup = (value) => {
      prompt.removeEventListener("click", handleClick);
      prompt.remove();
      resolve(value);
    };

    const handleClick = (event) => {
      if (event.target.closest("[data-reaction-accept]")) cleanup(true);
      if (event.target.closest("[data-reaction-decline]")) cleanup(false);
    };

    prompt.addEventListener("click", handleClick);
    document.body.appendChild(prompt);
    prompt.querySelector("[data-reaction-accept]")?.focus();
  });

  const remoteController = window.DepthboundPlaytest?.guestControllerForHero?.(actor?.id);
  if (remoteController && window.DepthboundPlaytest?.requestReaction) {
    const localPrompt = showLocalReactionPrompt();
    const remotePrompt = window.DepthboundPlaytest.requestReaction(remoteController.id, { title, message, acceptLabel, declineLabel });
    return Promise.race([localPrompt, remotePrompt]).finally(() => document.querySelector(".reaction-prompt")?.remove());
  }

  return showLocalReactionPrompt();
}

function showInitiativeDialog(entries) {
  return new Promise((resolve) => {
    restoreDialogInputField();
    els.gameDialogForm.classList.add("wide-dialog");
    els.gameDialogTitle.textContent = "Roll Initiative";
    els.gameDialogMessage.textContent = "Combatants roll one at a time.";
    els.gameDialogField.classList.add("hidden");
    els.gameDialogField.innerHTML = `
      <div class="initiative-roll-list">
        ${entries
          .map(
            (entry, index) => `
              <div class="initiative-roll-row" data-initiative-roll-row="${index}">
                ${combatantArtworkMarkup(entry.fighter, "initiative-art")}
                <span>${escapeHtml(entry.fighter.name)}</span>
                <strong data-initiative-roll-result>${entry.side === "hero" ? "Hero" : "Monster"}</strong>
              </div>
            `,
          )
          .join("")}
      </div>
    `;
    els.gameDialogField.classList.remove("hidden");
    els.gameDialogActions.innerHTML = `
      <button type="button" data-initiative-roll-start>Roll Initiative</button>
      <button type="button" class="ghost-button" data-initiative-roll-cancel>Cancel</button>
    `;

    let rolling = false;

    const cleanup = (value) => {
      els.gameDialogActions.removeEventListener("click", handleClick);
      els.gameDialog.classList.add("hidden");
      els.gameDialogForm.classList.remove("wide-dialog");
      restoreDialogInputField();
      activeDialogCancel = null;
      resolve(value);
    };

    const revealRolls = async () => {
      rolling = true;
      els.gameDialogActions.innerHTML = `<button type="button" disabled>Rolling...</button>`;
      for (let index = 0; index < entries.length; index += 1) {
        const entry = entries[index];
        const row = els.gameDialogField.querySelector(`[data-initiative-roll-row="${index}"]`);
        const result = row?.querySelector("[data-initiative-roll-result]");
        row?.classList.add("rolling");
        if (result) result.textContent = "Rolling...";
        await sleep(260);
        row?.classList.remove("rolling");
        row?.classList.add("rolled");
        if (result) result.textContent = `${entry.roll} ${abilityLabel(entry.fighter.initiativeBonus)} = ${entry.total}`;
      }
      els.gameDialogActions.innerHTML = `<button type="button" data-initiative-roll-continue>Start Combat</button>`;
      els.gameDialogActions.querySelector("[data-initiative-roll-continue]")?.focus();
    };

    const handleClick = (event) => {
      const start = event.target.closest("[data-initiative-roll-start]");
      const cancel = event.target.closest("[data-initiative-roll-cancel]");
      const proceed = event.target.closest("[data-initiative-roll-continue]");
      if (start && !rolling) {
        revealRolls();
        return;
      }
      if (cancel && !rolling) cleanup(false);
      if (proceed) cleanup(true);
    };

    els.gameDialogActions.addEventListener("click", handleClick);
    activeDialogCancel = () => {
      if (!rolling) cleanup(false);
    };
    els.gameDialog.classList.remove("hidden");
    els.gameDialogActions.querySelector("[data-initiative-roll-start]")?.focus();
  });
}

function withBackChoice(choices) {
  return [...choices, { value: dialogBackValue, label: "Back" }];
}

function renderSelectionOptions(items) {
  return items
    .map((item) => `<option value="${escapeAttribute(item.id)}">${escapeHtml(item.name)}</option>`)
    .join("");
}

function showSelectionDialog({ title, message, items, label, confirmText = "Select", cancelText = "Cancel" }) {
  return new Promise((resolve) => {
    els.gameDialogTitle.textContent = title;
    els.gameDialogMessage.textContent = message;
    els.gameDialogField.classList.remove("hidden");
    els.gameDialogField.innerHTML = `
      <label>
        <span>${escapeHtml(label)}</span>
        <select data-selection>${renderSelectionOptions(items)}</select>
      </label>
    `;
    els.gameDialogActions.innerHTML = `
      <button type="submit" data-dialog-action="confirm">${escapeHtml(confirmText)}</button>
      <button type="button" class="ghost-button" data-dialog-action="cancel">${escapeHtml(cancelText)}</button>
    `;

    const cleanup = (value) => {
      els.gameDialogForm.removeEventListener("submit", handleSubmit);
      els.gameDialogActions.removeEventListener("click", handleActionClick);
      els.gameDialog.classList.add("hidden");
      activeDialogCancel = null;
      resolve(value);
    };

    const handleSubmit = (event) => {
      event.preventDefault();
      const select = els.gameDialogField.querySelector("[data-selection]");
      cleanup(select?.value || null);
    };

    const handleActionClick = (event) => {
      const button = event.target.closest("[data-dialog-action]");
      if (!button || button.dataset.dialogAction !== "cancel") return;
      cleanup(null);
    };

    els.gameDialogForm.addEventListener("submit", handleSubmit);
    els.gameDialogActions.addEventListener("click", handleActionClick);
    activeDialogCancel = () => cleanup(null);
    els.gameDialog.classList.remove("hidden");
    els.gameDialogField.querySelector("select")?.focus();
  });
}

function showTwoSelectionDialog({ title, message, items, labels, confirmText = "Select", cancelText = "Cancel", allowSame = false }) {
  return new Promise((resolve) => {
    const options = renderSelectionOptions(items);
    els.gameDialogTitle.textContent = title;
    els.gameDialogMessage.textContent = message;
    els.gameDialogField.classList.remove("hidden");
    els.gameDialogField.innerHTML = `
      <label>
        <span>${escapeHtml(labels[0])}</span>
        <select data-selection="first">${options}</select>
      </label>
      <label>
        <span>${escapeHtml(labels[1])}</span>
        <select data-selection="second">${options}</select>
      </label>
      <p class="ability-assignment-error" aria-live="polite"></p>
    `;
    els.gameDialogActions.innerHTML = `
      <button type="submit" data-dialog-action="confirm">${escapeHtml(confirmText)}</button>
      <button type="button" class="ghost-button" data-dialog-action="cancel">${escapeHtml(cancelText)}</button>
    `;

    const cleanup = (value) => {
      els.gameDialogForm.removeEventListener("submit", handleSubmit);
      els.gameDialogActions.removeEventListener("click", handleActionClick);
      els.gameDialogField.removeEventListener("change", handleChange);
      els.gameDialog.classList.add("hidden");
      activeDialogCancel = null;
      resolve(value);
    };

    const updateOptions = () => {
      const first = els.gameDialogField.querySelector("[data-selection='first']");
      const second = els.gameDialogField.querySelector("[data-selection='second']");
      const selected = new Set([first.value, second.value]);
      for (const select of [first, second]) {
        const current = select.value;
        select.innerHTML = `
          <option value="">-</option>
          ${items
            .map((item) => {
              const disabled = !allowSame && selected.has(item.id) && item.id !== current ? "disabled" : "";
              return `<option value="${escapeAttribute(item.id)}" ${disabled}>${escapeHtml(item.name)}</option>`;
            })
            .join("")}
        `;
        select.value = current;
      }
    };

    const handleSubmit = (event) => {
      event.preventDefault();
      const first = els.gameDialogField.querySelector("[data-selection='first']");
      const second = els.gameDialogField.querySelector("[data-selection='second']");
      const error = els.gameDialogField.querySelector(".ability-assignment-error");
      if (!first.value || !second.value || (!allowSame && first.value === second.value)) {
        if (error) error.textContent = allowSame ? "Choose two items." : "Choose two different items.";
        return;
      }
      cleanup([first.value, second.value]);
    };

    const handleChange = (event) => {
      if (!event.target.matches("[data-selection='first'], [data-selection='second']")) return;
      if (els.gameDialogField.querySelector(".ability-assignment-error")) {
        els.gameDialogField.querySelector(".ability-assignment-error").textContent = "";
      }
      updateOptions();
    };

    const handleActionClick = (event) => {
      const button = event.target.closest("[data-dialog-action]");
      if (!button || button.dataset.dialogAction !== "cancel") return;
      cleanup(null);
    };

    els.gameDialogForm.addEventListener("submit", handleSubmit);
    els.gameDialogActions.addEventListener("click", handleActionClick);
    els.gameDialogField.addEventListener("change", handleChange);
    activeDialogCancel = () => cleanup(null);
    els.gameDialog.classList.remove("hidden");
    updateOptions();
    els.gameDialogField.querySelector("select")?.focus();
  });
}

async function createHeroGearOptions(classId = defaultContent.heroClass, raceSelection = defaultRaceSelection) {
  const heroTemplate = getHeroTemplate(classId);
  const startingGear = heroTemplate.startingGear;
  if (startingGear?.fixed) {
    return {
      equipment: { ...(startingGear.equipment ?? heroTemplate.equipment ?? {}) },
      inventory: { money: { cp: 0, sp: 0, gp: 0 }, items: starterEquipmentItems(startingGear.inventory ?? heroTemplate.inventory?.items ?? []) },
    };
  }
  if (!startingGear) {
    return {
      equipment: { mainHand: "longsword", torso: "chain-mail" },
      inventory: { money: { cp: 0, sp: 0, gp: 0 }, items: starterEquipmentItems(["chain-mail", "longsword"]) },
    };
  }

  if (Array.isArray(startingGear.steps)) {
    return createHeroGearOptionsFromSteps(classId, startingGear, raceSelection);
  }

  const martialWeaponOptions = (startingGear.martialWeapons ?? [])
    .map((id) => getItemTemplate(id))
    .filter(Boolean);
  const handFriendlyWeapons = martialWeaponOptions.filter((item) => !item.properties?.includes("two-handed"));

  let step = 0;
  let armorChoice = null;
  let weaponChoice = null;
  let weaponIds = null;
  let extraChoice = null;
  while (step >= 0 && step < 4) {
    if (step === 0) {
      armorChoice = await showChoiceDialog({
        title: "Starting Armor",
        message: "Choose your starting armor package.",
        choices: withBackChoice(startingGear.armorChoices.map((choice) => ({ value: choice.value, label: choice.label }))),
      });
      if (armorChoice === dialogBackValue) return dialogBackValue;
      if (!armorChoice) return null;
      step += 1;
    } else if (step === 1) {
      weaponChoice = await showChoiceDialog({
        title: "Primary Weapon Loadout",
        message: "Choose whether your fighter starts with a weapon and shield or two weapons.",
        choices: withBackChoice(startingGear.weaponChoices.map((choice) => ({ value: choice.value, label: choice.label }))),
      });
      if (weaponChoice === dialogBackValue) step -= 1;
      else if (!weaponChoice) return null;
      else step += 1;
    } else if (step === 2) {
      weaponIds =
        weaponChoice === "weapon-shield"
          ? await showSelectionDialog({
              title: "Choose Martial Weapon",
              message: "Select a martial weapon for your fighter.",
              items: handFriendlyWeapons,
              label: "Weapon",
              confirmText: "Choose Weapon",
              cancelText: "Back",
            })
          : await showTwoSelectionDialog({
              title: "Choose Two Martial Weapons",
              message: "Select two different martial weapons for your fighter.",
              items: handFriendlyWeapons,
              labels: ["First Weapon", "Second Weapon"],
              confirmText: "Choose Weapons",
              cancelText: "Back",
            });
      if (!weaponIds) step -= 1;
      else step += 1;
    } else if (step === 3) {
      extraChoice = await showChoiceDialog({
        title: "Secondary Gear",
        message: "Choose additional starting ranged gear.",
        choices: withBackChoice(startingGear.secondaryChoices.map((choice) => ({ value: choice.value, label: choice.label }))),
      });
      if (extraChoice === dialogBackValue) step -= 1;
      else if (!extraChoice) return null;
      else step += 1;
    }
  }
  if (step < 4) return null;

  const equipment = {};
  const items = [];
  let quiver = null;
  const selectedArmor = startingGear.armorChoices.find((choice) => choice.value === armorChoice);
  const selectedWeaponChoice = startingGear.weaponChoices.find((choice) => choice.value === weaponChoice);
  const selectedExtra = startingGear.secondaryChoices.find((choice) => choice.value === extraChoice);
  if (!selectedArmor || !selectedWeaponChoice || !selectedExtra) return null;

  Object.assign(equipment, selectedArmor.equipment ?? {}, selectedWeaponChoice.equipment ?? {});
  if (Array.isArray(selectedArmor.inventory)) items.push(...selectedArmor.inventory);
  if (selectedArmor.quiver) quiver = selectedArmor.quiver;

  if (weaponChoice === "weapon-shield") {
    equipment.mainHand = weaponIds;
    items.push(weaponIds, "shield");
  } else {
    equipment.mainHand = weaponIds[0];
    equipment.offHand = weaponIds[1];
    items.push(weaponIds[0], weaponIds[1]);
  }

  if (Array.isArray(selectedExtra.inventory)) items.push(...selectedExtra.inventory);
  if (selectedExtra.quiver) quiver = selectedExtra.quiver;
  if (quiver) equipment.quiver = quiver;

  return {
    equipment,
    inventory: {
      money: { cp: 0, sp: 0, gp: 0 },
      items: starterEquipmentItems(items),
    },
  };
}

function startingGearCandidateHero(classId, raceSelection = defaultRaceSelection) {
  const classTemplate = getHeroTemplate(classId);
  const raceTraits = raceTraitsForSelection(raceSelection);
  return {
    id: "hero",
    classId,
    weaponProficiencies: proficiencyEntries([...classWeaponProficiencies(classTemplate), ...raceTraits.weaponProficiencies]),
    armorProficiencies: proficiencyEntries([...classArmorProficiencies(classTemplate), ...raceTraits.armorProficiencies]),
  };
}

function startingGearChoiceAvailable(choice, candidateHero) {
  if (choice.requiresWeaponProficiency && !heroHasWeaponProficiency(candidateHero, getItemTemplate(choice.requiresWeaponProficiency))) return false;
  if (choice.requiresArmorProficiency && !heroHasArmorProficiency(candidateHero, getItemTemplate(choice.requiresArmorProficiency))) return false;
  return true;
}

const baseStartingGearWeaponIds = new Set([
  "club",
  "dagger",
  "greatclub",
  "handaxe",
  "javelin",
  "light-hammer",
  "mace",
  "quarterstaff",
  "sickle",
  "spear",
  "crossbow-light",
  "dart",
  "shortbow",
  "sling",
  "battleaxe",
  "flail",
  "glaive",
  "greataxe",
  "greatsword",
  "halberd",
  "lance",
  "longsword",
  "maul",
  "morningstar",
  "pike",
  "rapier",
  "scimitar",
  "shortsword",
  "trident",
  "war-pick",
  "warhammer",
  "whip",
  "blowgun",
  "crossbow-hand",
  "crossbow-heavy",
  "longbow",
]);

function startingGearItemPool(pool) {
  const items = window.DungeonContent.list("items");
  if (pool === "musicalInstruments") {
    return items
      .filter((item) => item.type === "tool" && item.category === "instrument")
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  return items
    .filter((item) => item.type === "weapon")
    .filter((item) => baseStartingGearWeaponIds.has(item.id))
    .filter((item) => {
      if (pool === "simpleWeapons") return item.category?.startsWith("simple");
      if (pool === "simpleMeleeWeapons") return item.category === "simple melee";
      if (pool === "martialWeapons") return item.category?.startsWith("martial");
      if (pool === "martialMeleeWeapons") return item.category === "martial melee";
      if (pool === "oneHandedMartialWeapons") return item.category?.startsWith("martial") && !item.properties?.includes("two-handed");
      if (pool === "oneHandedMartialMeleeWeapons") return item.category === "martial melee" && !item.properties?.includes("two-handed");
      return false;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function addStartingGearItem(result, itemId, slotId = "") {
  if (!itemId) return;
  result.items.push(itemId);
  if (slotId) result.equipment[slotId] = itemId;
}

async function resolveStartingGearChoice(choice) {
  const result = {
    equipment: { ...(choice.equipment ?? {}) },
    items: [...(choice.inventory ?? [])],
    quiver: choice.quiver ?? "",
  };

  if (choice.select) {
    const selected = await showSelectionDialog({
      title: choice.select.title ?? "Choose Item",
      message: choice.select.message ?? "Choose an item.",
      items: startingGearItemPool(choice.select.pool),
      label: choice.select.label ?? "Item",
      confirmText: choice.select.confirmText ?? "Choose",
      cancelText: "Back",
    });
    if (!selected) return null;
    addStartingGearItem(result, selected, choice.select.slot ?? "mainHand");
  }

  if (choice.selectTwo) {
    const selected = await showTwoSelectionDialog({
      title: choice.selectTwo.title ?? "Choose Two Items",
      message: choice.selectTwo.message ?? "Choose two items.",
      items: startingGearItemPool(choice.selectTwo.pool),
      labels: choice.selectTwo.labels ?? ["First Item", "Second Item"],
      confirmText: choice.selectTwo.confirmText ?? "Choose",
      cancelText: "Back",
      allowSame: Boolean(choice.selectTwo.allowSame),
    });
    if (!selected) return null;
    addStartingGearItem(result, selected[0], choice.selectTwo.slots?.[0] ?? "mainHand");
    addStartingGearItem(result, selected[1], choice.selectTwo.slots?.[1] ?? "offHand");
  }

  return result;
}

async function createHeroGearOptionsFromSteps(classId, startingGear, raceSelection = defaultRaceSelection) {
  const candidateHero = startingGearCandidateHero(classId, raceSelection);
  const equipment = { ...(startingGear.equipment ?? {}) };
  const items = [...(startingGear.inventory ?? [])];
  let quiver = startingGear.quiver ?? null;
  let step = 0;
  const selected = [];

  while (step >= 0 && step < startingGear.steps.length) {
    const gearStep = startingGear.steps[step];
    const availableChoices = (gearStep.choices ?? []).filter((choice) => startingGearChoiceAvailable(choice, candidateHero));
    const choiceValue = await showChoiceDialog({
      title: gearStep.title ?? "Starting Gear",
      message: gearStep.message ?? "Choose starting gear.",
      progress: heroCreationProgress.gear,
      choices: withBackChoice(availableChoices.map((choice) => ({ value: choice.value, label: choice.label }))),
    });
    if (choiceValue === dialogBackValue) {
      if (step === 0) return dialogBackValue;
      step -= 1;
      selected.pop();
      continue;
    }
    if (!choiceValue) return null;
    const choice = availableChoices.find((entry) => entry.value === choiceValue);
    if (!choice) return null;
    const resolved = await resolveStartingGearChoice(choice);
    if (!resolved) continue;
    selected[step] = resolved;
    step += 1;
  }

  for (const entry of selected) {
    Object.assign(equipment, entry.equipment);
    items.push(...entry.items);
    if (entry.quiver) quiver = entry.quiver;
  }
  if (quiver) equipment.quiver = quiver;

  return {
    equipment,
    inventory: {
      money: { cp: 0, sp: 0, gp: 0 },
      items: starterEquipmentItems(items),
    },
  };
}

function resolveQuickStartGearChoice(choice) {
  const result = {
    equipment: { ...(choice.equipment ?? {}) },
    items: [...(choice.inventory ?? [])],
    quiver: choice.quiver ?? "",
  };
  if (choice.select) {
    const selected = startingGearItemPool(choice.select.pool)[0]?.id;
    addStartingGearItem(result, selected, choice.select.slot ?? "mainHand");
  }
  if (choice.selectTwo) {
    const options = startingGearItemPool(choice.selectTwo.pool);
    const first = options[0]?.id;
    const second = (choice.selectTwo.allowSame ? options[0] : options[1])?.id ?? first;
    addStartingGearItem(result, first, choice.selectTwo.slots?.[0] ?? "mainHand");
    addStartingGearItem(result, second, choice.selectTwo.slots?.[1] ?? "offHand");
  }
  return result;
}

function createQuickStartGearOptions(classId = defaultContent.heroClass, raceSelection = defaultRaceSelection) {
  const heroTemplate = getHeroTemplate(classId);
  const startingGear = heroTemplate.startingGear;
  if (startingGear?.fixed || !startingGear?.steps?.length) {
    if (startingGear?.fixed) {
      return {
        equipment: { ...(startingGear.equipment ?? heroTemplate.equipment ?? {}) },
        inventory: { money: { cp: 0, sp: 0, gp: 0 }, items: starterEquipmentItems(startingGear.inventory ?? heroTemplate.inventory?.items ?? []) },
      };
    }
    return {
      equipment: { mainHand: "longsword", torso: "chain-mail" },
      inventory: { money: { cp: 0, sp: 0, gp: 0 }, items: starterEquipmentItems(["chain-mail", "longsword"]) },
    };
  }

  const candidateHero = startingGearCandidateHero(classId, raceSelection);
  const equipment = { ...(startingGear.equipment ?? {}) };
  const items = [...(startingGear.inventory ?? [])];
  let quiver = startingGear.quiver ?? null;
  for (const gearStep of startingGear.steps) {
    const choice = (gearStep.choices ?? []).find((entry) => startingGearChoiceAvailable(entry, candidateHero));
    if (!choice) continue;
    const resolved = resolveQuickStartGearChoice(choice);
    Object.assign(equipment, resolved.equipment);
    items.push(...resolved.items);
    if (resolved.quiver) quiver = resolved.quiver;
  }
  if (quiver) equipment.quiver = quiver;
  return {
    equipment,
    inventory: { money: { cp: 0, sp: 0, gp: 0 }, items: starterEquipmentItems(items) },
  };
}

function showTutorial() {
  els.gameDialogTitle.textContent = "Tutorial";
  els.gameDialogField.classList.add("hidden");
  els.gameDialogMessage.innerHTML = `
    <ul class="tutorial-list">
      <li>After making your first hero, use the Planning Table to add more heroes or go out solo. Newly created heroes join the active party automatically while there is room.</li>
      <li>Drag hero tokens to move. Grab empty dungeon space to pan, and use the top-bar zoom controls to change the view.</li>
      <li>Use Stealth on a hero card before opening dangerous doors. Search checks the current room for hidden doors and secrets.</li>
      <li>The bottom action bar changes by context. Outside combat it handles rest, return home, items, abilities, and grabbing. In combat it adds attacks, Tactics, and End Turn.</li>
      <li>Open Tactics in combat for Dash, Dodge, Disengage, Off-Hand Attack, Grapple/Shove, Medicine, and Get Behind. Get Behind is a special Depthbound bonus action that can let a hero move through monster spaces for one turn.</li>
      <li>Inventory is the I button on the hero card. Abilities and spells are on the bottom Abilities button when the selected hero has something usable.</li>
      <li>At home, the door menu opens Village, Build Your Home, Adventure, and Party Inventory. Village is for shops, NPCs, inns, and buying road supplies.</li>
      <li>Adventure contains Travel plus the dungeon lists. Travel opens the world map. The party starts at its home village; colored hexes show biomes, structure icons show sites and settlements, and the current/home labels tell you where you are.</li>
      <li>To travel, click neighboring hexes to draw a route, Confirm Route, then Start Travel. Each travel day can lead to events, camp, an inn, a new settlement, or a dungeon entrance.</li>
      <li>Pack enough rations before leaving. Each camp meal can spend rations, and hungry rests are risky; buy Trail Rations from village stores or gather more through travel events.</li>
      <li>For a first world-map goal, route to the nearest visible village or city. Settlements are safer than wandering deep into wild hexes, often offer stores or inns, and make a good first supply loop.</li>
      <li>For a first dungeon run, try The Barrow Crown under Main Story Dungeons. Or travel to a nearby village or other structure to explore the world.</li>
    </ul>
  `;
  els.gameDialogActions.innerHTML = `<button type="button" data-tutorial-close>Close</button>`;

  const cleanup = () => {
    els.gameDialogActions.removeEventListener("click", handleClick);
    els.gameDialog.classList.add("hidden");
    activeDialogCancel = null;
  };

  const handleClick = (event) => {
    if (event.target.closest("[data-tutorial-close]")) cleanup();
  };

  els.gameDialogActions.addEventListener("click", handleClick);
  activeDialogCancel = cleanup;
  els.gameDialog.classList.remove("hidden");
  els.gameDialogActions.querySelector("[data-tutorial-close]")?.focus();
}

function showD20ModeDialog({ allowBack = true } = {}) {
  return showChoiceDialog({
    title: "Dice Feel",
    message: "Choose how your heroes' d20 rolls should feel. You can change this later at the Planning Table.",
    progress: heroCreationProgress.luck,
    choices: [
      { value: "karmic", label: d20ModeLabels.karmic, description: d20ModeDescriptions.karmic },
      { value: "random", label: d20ModeLabels.random, description: d20ModeDescriptions.random },
      { value: "tymora", label: d20ModeLabels.tymora, description: d20ModeDescriptions.tymora },
      ...(allowBack ? [{ value: dialogBackValue, label: "Back" }] : []),
    ],
  });
}

function campaignDescriptionMarkup(description = "") {
  return `
    <div class="campaign-description-content">
      ${storyTextMarkup(description)}
    </div>
  `;
}

function raceSelectOptions(selectedRaceId) {
  return Object.entries(speciesDefinitions)
    .map(([raceId, race]) => `<option value="${escapeAttribute(raceId)}" ${raceId === selectedRaceId ? "selected" : ""}>${escapeHtml(race.name)}</option>`)
    .join("");
}

function subraceSelectOptions(raceId, selectedSubraceId) {
  return Object.entries(speciesDefinitions[raceId]?.subraces ?? {})
    .map(([subraceId, subrace]) => `<option value="${escapeAttribute(subraceId)}" ${subraceId === selectedSubraceId ? "selected" : ""}>${escapeHtml(subrace.name)}</option>`)
    .join("");
}

function dragonAncestrySelectOptions(category, selectedAncestryId) {
  return Object.entries(dragonAncestries[category] ?? {})
    .map(([ancestryId, ancestry]) => `<option value="${escapeAttribute(ancestryId)}" ${ancestryId === selectedAncestryId ? "selected" : ""}>${escapeHtml(ancestry.name)} (${escapeHtml(ancestry.damageType)})</option>`)
    .join("");
}

function raceFeatureSummaryMarkup(selection) {
  const traits = raceTraitsForSelection(selection);
  const details = activeRaceFeatureLines(traits, selection);
  return `<p class="empty-note">${details.map(escapeHtml).join("<br>")}</p>`;
}

function senseSummary(senses = {}) {
  return Object.entries(senses)
    .filter(([, value]) => value || value === true)
    .map(([sense, value]) => `${String(sense).replace(/-/g, " ")}${value === true ? "" : ` ${value} ft`}`)
    .join(", ");
}

function activeRaceFeatureLines(traits, selection = null) {
  const lines = [
    `Ability bonuses: ${abilityBonusSummary(traits.abilityBonuses)}`,
    `Speed: ${traits.speedFeet} ft`,
  ];
  const sensesText = senseSummary(traits.senses);
  if (sensesText) lines.push(`Senses: ${sensesText}`);
  if (traits.damageResistances?.length) lines.push(`Resistances: ${traits.damageResistances.join(", ")}`);
  if (traits.damageImmunities?.length) lines.push(`Immunities: ${traits.damageImmunities.join(", ")}`);
  if (traits.hpPerLevel) lines.push(`Dwarven Toughness: +${traits.hpPerLevel} max HP per level`);
  if (traits.halflingLucky) lines.push("Lucky: reroll d20 natural 1s once");
  if (traits.relentlessEndurance) lines.push("Relentless Endurance: drop to 1 HP once per long rest");
  if (traits.savageAttacks) lines.push("Savage Attacks: extra weapon damage die on melee critical hits");
  const previewFighter = selection
    ? { raceSelection: normalizeRaceSelection(selection), race: traits.raceId, subrace: traits.subraceId, level: 20, racialTraits: { dragonDamageType: traits.dragonDamageType } }
    : null;
  const racialAbilities = previewFighter ? racialSpellAbilityDefinitions(previewFighter) : [];
  const racialCantrips = previewFighter ? racialCantripSpellIdsForFighter(previewFighter).map((spellId) => getContentDefinition("spells", canonicalSpellId(spellId))?.name ?? spellId) : [];
  if (traits.traits?.length) lines.push(...traits.traits);
  if (traits.spellTraits?.length) lines.push(`Innate magic/features: ${traits.spellTraits.join(", ")}`);
  if (racialAbilities.length) lines.push(`Usable racial abilities: ${racialAbilities.map((ability) => `${ability.name}${ability.level > 1 ? ` (level ${ability.level}+)` : ""}`).join(", ")}`);
  if (racialCantrips.length) lines.push(`Racial cantrips: ${uniqueValues(racialCantrips).join(", ")}`);
  if (traits.skillProficiencies?.length) lines.push(`Skill proficiencies: ${traits.skillProficiencies.map(skillName).join(", ")}`);
  if (traits.skillChoiceCount) lines.push(`Skill choices: choose ${traits.skillChoiceCount}`);
  if (traits.startingFeatChoiceCount) lines.push(`Feat choices: choose ${traits.startingFeatChoiceCount}`);
  if (traits.toolProficiencies?.length) lines.push(`Tool proficiencies: ${traits.toolProficiencies.map(toolName).join(", ")}`);
  if (traits.toolChoiceCount) lines.push(`Tool choices: choose ${traits.toolChoiceCount} from ${(traits.toolChoices ?? []).map(toolName).join(", ")}`);
  if (traits.weaponProficiencies?.length) lines.push(`Weapon proficiencies: ${traits.weaponProficiencies.join(", ")}`);
  if (traits.armorProficiencies?.length) lines.push(`Armor proficiencies: ${traits.armorProficiencies.join(", ")}`);
  return lines;
}

function activeRaceFeatureLinesForFighter(fighter) {
  const traits = raceTraitsForSelection(fighter?.raceSelection);
  return activeRaceFeatureLines({
    ...traits,
    damageResistances: uniqueValues(fighter?.damageResistances ?? traits.damageResistances),
    damageImmunities: uniqueValues(fighter?.damageImmunities ?? traits.damageImmunities),
    weaponProficiencies: uniqueValues(fighter?.weaponProficiencies ?? traits.weaponProficiencies),
    armorProficiencies: uniqueValues(fighter?.armorProficiencies ?? traits.armorProficiencies),
    skillProficiencies: uniqueValues(fighter?.skillProficiencies ?? traits.skillProficiencies),
    toolProficiencies: uniqueValues(fighter?.toolProficiencies ?? traits.toolProficiencies),
    skillChoiceCount: traits.skillChoiceCount,
    toolChoiceCount: traits.toolChoiceCount,
    toolChoices: traits.toolChoices,
    senses: typeof fighterEffectiveSenses === "function" ? fighterEffectiveSenses(fighter) : fighter?.senses ?? traits.senses,
    startingFeatChoiceCount: traits.startingFeatChoiceCount,
    hpPerLevel: fighter?.racialHpPerLevel ?? traits.hpPerLevel,
    halflingLucky: Boolean(fighter?.racialTraits?.halflingLucky),
    relentlessEndurance: Boolean(fighter?.racialTraits?.relentlessEndurance),
    savageAttacks: Boolean(fighter?.racialTraits?.savageAttacks),
  });
}

function showHeroRaceDialog({ selection = defaultRaceSelection, allowBack = true } = {}) {
  return new Promise((resolve) => {
    let current = normalizeRaceSelection(selection);

    const renderField = (errorText = "") => {
      current = normalizeRaceSelection(current);
      const subrace = speciesDefinitions[current.raceId]?.subraces?.[current.subraceId] ?? {};
      const dragonCategory = subrace.dragonCategory;
      const abilityChoiceCount = speciesDefinitions[current.raceId]?.base?.abilityChoiceCount ?? subrace.abilityChoiceCount ?? 0;
      const abilityChoiceSource = subrace.abilityChoiceCount ? subrace.name : speciesDefinitions[current.raceId]?.name ?? "Race";
      const choiceSelects = Array.from({ length: abilityChoiceCount }, (_, index) => {
        const selectedAbility = current.abilityChoices[index] ?? "";
        return `
          <label>
            <span>${escapeHtml(abilityChoiceSource)} +1 Ability ${index + 1}</span>
            <select data-race-ability-choice="${index}">
              <option value="">-</option>
              ${abilities
                .map((ability) => `<option value="${ability}" ${ability === selectedAbility ? "selected" : ""}>${ability.toUpperCase()}</option>`)
                .join("")}
            </select>
          </label>
        `;
      }).join("");

      els.gameDialogField.innerHTML = `
        <label>
          <span>Race / Species</span>
          <select data-race-select>${raceSelectOptions(current.raceId)}</select>
        </label>
        <label>
          <span>Subrace</span>
          <select data-subrace-select>${subraceSelectOptions(current.raceId, current.subraceId)}</select>
        </label>
        ${
          dragonCategory
            ? `<label>
                <span>Draconic Ancestry</span>
                <select data-dragon-ancestry-select>${dragonAncestrySelectOptions(dragonCategory, current.dragonAncestryId)}</select>
              </label>`
            : ""
        }
        ${choiceSelects}
        ${raceFeatureSummaryMarkup(current)}
        <p class="ability-assignment-error" aria-live="polite">${escapeHtml(errorText)}</p>
      `;
    };

    const cleanup = (value) => {
      els.gameDialogForm.removeEventListener("submit", handleSubmit);
      els.gameDialogActions.removeEventListener("click", handleClick);
      els.gameDialogField.removeEventListener("change", handleChange);
      els.gameDialog.classList.add("hidden");
      activeDialogCancel = null;
      resolve(value);
    };

    const handleSubmit = (event) => {
      event.preventDefault();
      const abilityChoiceCount = speciesDefinitions[current.raceId]?.base?.abilityChoiceCount ?? speciesDefinitions[current.raceId]?.subraces?.[current.subraceId]?.abilityChoiceCount ?? 0;
      if (abilityChoiceCount) {
        const selected = current.abilityChoices.slice(0, abilityChoiceCount);
        if (selected.length !== abilityChoiceCount || selected.some((ability) => !ability) || new Set(selected).size !== selected.length) {
          renderField(`Choose ${abilityChoiceCount} different ${speciesDefinitions[current.raceId]?.name ?? "race"} ability bonuses.`);
          return;
        }
      }
      cleanup(normalizeRaceSelection(current));
    };

    const handleClick = (event) => {
      const button = event.target.closest("[data-dialog-action]");
      if (!button) return;
      if (button.dataset.dialogAction === "confirm") return;
      cleanup(button.dataset.dialogAction === "back" ? dialogBackValue : null);
    };

    const handleChange = (event) => {
      if (event.target.matches("[data-race-select]")) {
        current = { raceId: event.target.value, subraceId: firstSubraceId(event.target.value), dragonAncestryId: "", abilityChoices: [] };
        renderField();
        return;
      }
      if (event.target.matches("[data-subrace-select]")) {
        current = { ...current, subraceId: event.target.value, dragonAncestryId: "", abilityChoices: [] };
        renderField();
        return;
      }
      if (event.target.matches("[data-dragon-ancestry-select]")) {
        current = { ...current, dragonAncestryId: event.target.value };
        renderField();
        return;
      }
      if (event.target.matches("[data-race-ability-choice]")) {
        const index = Number(event.target.dataset.raceAbilityChoice);
        const abilityChoices = [...(current.abilityChoices ?? [])];
        abilityChoices[index] = event.target.value;
        current = { ...current, abilityChoices };
        renderField();
      }
    };

    els.gameDialogTitle.textContent = "Choose Race / Species";
    els.gameDialogMessage.innerHTML = dialogPlainMessageMarkup(
      "Choose the ancestry traits for this hero. The summary only lists mechanics currently active in this game.",
      heroCreationProgress.race,
    );
    els.gameDialogField.classList.remove("hidden");
    els.gameDialogActions.innerHTML = `
      <button type="submit" data-dialog-action="confirm">Choose Race</button>
      ${allowBack ? `<button type="button" class="ghost-button" data-dialog-action="back">Back</button>` : ""}
      <button type="button" class="ghost-button" data-dialog-action="cancel">Cancel</button>
    `;
    els.gameDialogForm.addEventListener("submit", handleSubmit);
    els.gameDialogActions.addEventListener("click", handleClick);
    els.gameDialogField.addEventListener("change", handleChange);
    activeDialogCancel = () => cleanup(null);
    renderField();
    els.gameDialog.classList.remove("hidden");
    els.gameDialogField.querySelector("select")?.focus();
  });
}

function availableHeroClasses() {
  return window.DungeonContent
    .list("classes")
    .filter((entry) => !entry.hidden)
    .sort((a, b) => (a.className ?? a.name).localeCompare(b.className ?? b.name));
}

async function showHeroClassDialog({ allowBack = true } = {}) {
  const choices = availableHeroClasses().map((entry) => ({
    value: entry.id,
    label: `${entry.className ?? entry.name}${entry.spells?.length ? " (spellcaster)" : ""}`,
  }));
  return showChoiceDialog({
    title: "Choose Class",
    message: "Choose this hero's class.",
    progress: heroCreationProgress.class,
    choices: allowBack ? withBackChoice(choices) : choices,
  });
}

const interactiveTutorialSteps = [
  {
    title: "Start A Real Adventure",
    body: "In a real game, press Start New Adventure, make your first hero, then choose a save slot. Your first hero is enough to play, but a party of two to four is easier.",
    selector: ".arena",
    enter: () => enterTutorialDungeon(),
  },
  {
    title: "After Your First Hero",
    body: "At home, use the Planning Table to create more heroes, change the active party, or set party roles. New heroes automatically join the active party while there is space.",
    selector: ".planning-table-token",
    enter: () => enterTutorialHome(),
  },
  {
    title: "Move A Hero",
    body: "Drag a hero token through adjacent squares to move. Select several heroes with Shift, Ctrl, or Cmd, then drag one selected token to move the group.",
    selector: ".token.hero",
    enter: () => enterTutorialDungeon(),
  },
  {
    title: "Move The Map",
    body: "Grab empty map space and drag to pan. The zoom controls in the top bar change how much of the dungeon you can see.",
    selector: ".room-scroll",
    enter: () => enterTutorialDungeon(),
  },
  {
    title: "Hero Card Tools",
    body: "Each hero card has quick buttons in order: Inventory opens gear and items, and can also be opened by pressing I; Rename changes the character name; Stealth rolls Dexterity Stealth; Search checks the current room.",
    selector: ".card-actions",
    enter: () => enterTutorialDungeon(),
  },
  {
    title: "Stealth",
    body: "Use Stealth before opening suspicious doors. Monsters compare your Stealth total to Perception; if you stay hidden, you can avoid starting combat immediately.",
    selector: ".stealth-hero-button",
    enter: () => enterTutorialDungeon(),
  },
  {
    title: "Search",
    body: "Use Search once per hero per room to look for hidden doors and room secrets. Searching near monsters can force a fresh Stealth check.",
    selector: ".search-room-button",
    enter: () => enterTutorialDungeon(),
  },
  {
    title: "Open Inventory",
    body: "Use the I button on the hero card, or press I, to open inventory and equipment.",
    selector: ".open-inventory",
    enter: () => enterTutorialDungeon(),
  },
  {
    title: "Inventory And Equipment",
    body: "Inventory shows carried items, equipped gear, money, and home chest storage. Items can be inspected, equipped, moved, or stored from here.",
    selector: "#inventory-menu .inventory-panel",
    enter: () => {
      enterTutorialDungeon();
      showInventoryMenu();
    },
  },
  {
    title: "Action Bar: Exploring",
    body: "Outside combat, the bottom bar is for exploration: use items, abilities or spells, short rest, return home, and grab or release allies and objects.",
    selector: ".action-dock",
    placement: "above-target",
    enter: () => enterTutorialDungeon(),
  },
  {
    title: "Abilities And Spells",
    body: "The Abilities button opens class features, racial powers, feats, and spells for the selected hero. It is enabled when that hero has something usable.",
    selector: "#abilities",
    placement: "above-target",
    enter: () => enterTutorialDungeon(),
  },
  {
    title: "Action Bar: Combat",
    body: "In combat, the bar adds Attack, Other, and End Turn. Select a hero, choose a target, spend movement and actions, then end that hero's turn.",
    selector: ".action-dock",
    placement: "above-target",
    enter: () => enterTutorialDungeon(),
  },
  {
    title: "Get Behind",
    body: "Tactics [X] holds Dash, Dodge, Disengage, Off-Hand Attack, Medicine, Grapple/Shove, and Get Behind. Get Behind is not normal DnD: it is a Depthbound bonus action, DEX DC 12, to move through monster spaces this turn.",
    selector: "#action-button",
    placement: "above-target",
    enter: () => enterTutorialDungeon(),
  },
  {
    title: "Home Door",
    body: "At home, click Adventure beside the door or walk onto the door space. This opens the home hub to leave your home.",
    selector: ".exit-token, .home-move-out-button",
    enter: () => enterTutorialHome(),
  },
  {
    title: "Home Menu",
    body: "The Home Door menu starts with Village, Build Your Home, Adventure, and Party Inventory. Village is for NPCs, shops, inns, and supplies; Build Your Home opens the house editor.",
    selector: "#home-main-actions",
    enter: () => openTutorialHomeMenu("main"),
  },
  {
    title: "Pack Before Travel",
    body: "Before a road trip, buy enough Trail Rations in Village shops. Camp meals spend rations, and resting hungry is a bad habit with teeth.",
    selector: "#go-village",
    enter: () => openTutorialHomeMenu("main"),
  },
  {
    title: "World Map",
    body: "Adventure contains Travel. Travel opens the world map: you start at your home village, colored hexes are biomes, structure icons mark sites and settlements, and the labels show current location, home, and route state.",
    selector: "#travel-map-menu .travel-map-panel",
    enter: () => openTutorialTravelMap(),
  },
  {
    title: "How To Travel",
    body: "On the world map, click adjacent hexes to build a route, Confirm Route, then Start Travel. Aim first for the nearest visible village or city so the party can learn the road and resupply.",
    selector: ".travel-map-route-actions",
    enter: () => openTutorialTravelMap(),
  },
  {
    title: "Adventure Choices",
    body: "Adventure opens Travel and the dungeon lists. Main Story dungeons are authored chapters, One-Shot Dungeons are standalone adventures, and Custom Dungeons appear when local custom maps exist.",
    selector: "#home-adventure-actions",
    enter: () => openTutorialHomeMenu("adventure"),
  },
  {
    title: "First Dungeon Pick",
    body: "For your first real outing, choose Main Story Dungeons and start The Barrow Crown. Or travel to any nearby village or other structure to explore the world.",
    selector: "#home-adventure-actions",
    enter: () => openTutorialHomeMenu("adventure"),
  },
  {
    title: "Home Objects",
    body: "Left-click or right-click home objects to inspect them. The chest stores shared items; the bookshelf has the Monster Compendium and guides for stealth, comfort, home expansion, travel, factions, and roadbuilding.",
    selector: ".chest-token, .dungeon-object.home-bookshelf, .planning-table-token",
    enter: () => enterTutorialHome(),
  },
  {
    title: "Menus And Controls",
    body: "The top bar has save, main menu, zoom, admin tools, and the text tutorial. Main Menu exits this temporary tour and returns you to normal play setup.",
    selector: ".top-actions",
    enter: () => enterTutorialDungeon(),
  },
];

function enterTutorialDungeon() {
  hideInventoryMenu();
  hideAbilitiesMenu();
  hideHomeMenu();
  if (typeof hideTravelMapMenu === "function") hideTravelMapMenu();
  switchInteractiveTutorialScene("dungeon");
}

function enterTutorialHome() {
  hideInventoryMenu();
  hideAbilitiesMenu();
  hideHomeMenu();
  if (typeof hideTravelMapMenu === "function") hideTravelMapMenu();
  switchInteractiveTutorialScene("home");
}

function openTutorialHomeMenu(panel = "main") {
  enterTutorialHome();
  window.requestAnimationFrame(() => {
    if (!interactiveTutorialActive || state?.tutorialScene !== "home") return;
    showHomeMenu();
    setHomeMenuPanel(panel);
  });
}

function openTutorialTravelMap() {
  const expectedStep = interactiveTutorialStep;
  enterTutorialHome();
  window.requestAnimationFrame(async () => {
    if (!interactiveTutorialActive || interactiveTutorialStep !== expectedStep || state?.tutorialScene !== "home") return;
    showHomeMenu();
    setHomeMenuPanel("adventure");
    if (!state.world && window.DepthboundWorldTravel?.createInitialWorldState) {
      try {
        state.world = await window.DepthboundWorldTravel.createInitialWorldState({
          seed: "depthbound-interactive-tutorial-world",
        });
      } catch (error) {
        console.warn("Could not create tutorial travel map.", error);
      }
    }
    if (!interactiveTutorialActive || interactiveTutorialStep !== expectedStep || state?.tutorialScene !== "home" || !state.world) return;
    showTravelMapMenu();
    updateInteractiveTutorial();
  });
}

function createTutorialHero(id, name, token, role, equipment, items, position) {
  const template = getHeroTemplate();
  return createCombatant({
    ...cloneData(template),
    id,
    name,
    token,
    partyRole: role,
    position,
    equipment,
    inventory: {
      money: { gp: id === "hero" ? 18 : 9 },
      heroTokens: 2,
      items,
    },
  });
}

function createInteractiveTutorialState() {
  const tutorialState = createInteractiveTutorialDungeonState();
  tutorialState.log = [
    {
      text: "Interactive tutorial started. This temporary party is separate from your save slots.",
      type: "important",
    },
  ];
  return tutorialState;
}

function createInteractiveTutorialDungeonState() {
  const tutorialState = createInitialState("Tutorial Guard");
  const blockedKeys = new Set((tutorialState.dungeonObjects ?? []).filter(objectBlocksMovement).flatMap(objectCells).map(positionKey));
  const positions = dungeonStartPositions(tutorialState.dungeon, 2, blockedKeys);
  const guard = createTutorialHero(
    "hero",
    "Tutorial Guard",
    "G",
    "tank",
    { mainHand: "longsword", offHand: "shield", torso: "chain-mail" },
    ["longsword", "shield", "chain-mail", "potion-healing"],
    positions[0] ?? tutorialState.dungeon.startPosition,
  );
  const scout = createTutorialHero(
    "tutorial-scout",
    "Tutorial Scout",
    "S",
    "dd",
    { mainHand: "shortbow", torso: "leather", quiver: "arrows-20" },
    ["shortbow", "leather", "arrows-20", "dagger"],
    positions[1] ?? { x: tutorialState.dungeon.startPosition.x + 1, y: tutorialState.dungeon.startPosition.y },
  );
  tutorialState.fighters = { hero: guard, "tutorial-scout": scout };
  tutorialState.party = {
    activeHeroId: "hero",
    heroIds: ["hero", "tutorial-scout"],
    rosterIds: ["hero", "tutorial-scout"],
  };
  Object.values(tutorialState.fighters).forEach(refreshDerivedStats);
  tutorialState.isTutorial = true;
  tutorialState.tutorialScene = "dungeon";
  tutorialState.saveSlotId = null;
  tutorialState.combatStarted = false;
  tutorialState.initiative = [];
  tutorialState.chest = [createItemInstance("potion-healing", "tutorial-chest")];
  tutorialState.chestMoney = normalizeMoney({ gp: 25 });
  tutorialState.lootPiles = [];
  return tutorialState;
}

function switchInteractiveTutorialScene(scene) {
  if (!interactiveTutorialActive || state?.tutorialScene === scene) return;
  const heroes = rosterHeroes();
  const chest = state.chest ?? [];
  const chestMoney = state.chestMoney ?? {};
  const party = state.party;
  if (scene === "home") {
    state = createHomeState(heroes, chest, chestMoney, {
      ...party,
      campaignProgress: state.campaignProgress ?? {},
      questFlags: state.questFlags ?? {},
      partyResources: state.partyResources ?? {},
      partyTomes: state.partyTomes ?? [],
    });
    state.isTutorial = true;
    state.tutorialScene = "home";
    selectedHeroIds = new Set([state.party.activeHeroId]);
    roomIsBuilt = false;
    render();
    centerViewOnHero();
  } else if (scene === "dungeon") {
    state = createInteractiveTutorialDungeonState();
    state.log = [
      {
        text: "Interactive tutorial dungeon loaded. This temporary party is separate from your save slots.",
        type: "important",
      },
    ];
    selectedHeroIds = new Set([state.party.activeHeroId]);
    roomIsBuilt = false;
    render();
    centerViewOnHero();
  }
}

function tutorialTargetRect(selector) {
  if (!selector) return null;
  const elements = Array.from(document.querySelectorAll(selector)).filter((element) => {
    if (element.classList.contains("hidden")) return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });
  if (!elements.length) return null;
  return elements
    .map((element) => element.getBoundingClientRect())
    .reduce((bounds, rect) => ({
      left: Math.min(bounds.left, rect.left),
      top: Math.min(bounds.top, rect.top),
      right: Math.max(bounds.right, rect.right),
      bottom: Math.max(bounds.bottom, rect.bottom),
      width: Math.max(bounds.right, rect.right) - Math.min(bounds.left, rect.left),
      height: Math.max(bounds.bottom, rect.bottom) - Math.min(bounds.top, rect.top),
    }));
}

function updateInteractiveTutorial() {
  if (!interactiveTutorialActive || !els.tutorialTour) return;
  if (interactiveTutorialUpdating) return;
  interactiveTutorialUpdating = true;
  const stepIndex = interactiveTutorialStep;
  const step = interactiveTutorialSteps[stepIndex];
  if (!step) {
    interactiveTutorialUpdating = false;
    return;
  }

  els.tutorialTourStep.textContent = `Tutorial ${stepIndex + 1} / ${interactiveTutorialSteps.length}`;
  els.tutorialTourTitle.textContent = step.title;
  els.tutorialTourBody.textContent = step.body;
  els.tutorialTourCard?.removeAttribute("style");
  els.tutorialTourBack.disabled = stepIndex === 0;
  els.tutorialTourNext.textContent = stepIndex === interactiveTutorialSteps.length - 1 ? "Done" : "Next";

  const updateHighlight = () => {
    if (!interactiveTutorialActive || stepIndex !== interactiveTutorialStep) return;
    const rect = tutorialTargetRect(step.selector);
    if (!rect) {
      els.tutorialHighlight.classList.add("hidden");
      return;
    }
    els.tutorialHighlight.classList.remove("hidden");
    els.tutorialHighlight.style.left = `${Math.max(8, rect.left - 8)}px`;
    els.tutorialHighlight.style.top = `${Math.max(8, rect.top - 8)}px`;
    els.tutorialHighlight.style.width = `${rect.width + 16}px`;
    els.tutorialHighlight.style.height = `${rect.height + 16}px`;
    if (step.placement === "above-target" && els.tutorialTourCard) {
      const cardRect = els.tutorialTourCard.getBoundingClientRect();
      els.tutorialTourCard.style.bottom = "auto";
      els.tutorialTourCard.style.top = `${Math.max(12, rect.top - cardRect.height - 18)}px`;
    }
  };

  if (interactiveTutorialEnteredStep !== stepIndex) {
    interactiveTutorialEnteredStep = stepIndex;
    window.requestAnimationFrame(() => {
      if (!interactiveTutorialActive || stepIndex !== interactiveTutorialStep) return;
      step.enter?.();
      window.requestAnimationFrame(updateHighlight);
    });
  } else {
    window.requestAnimationFrame(updateHighlight);
  }
  interactiveTutorialUpdating = false;
}

function startInteractiveTutorial() {
  window.clearTimeout(monsterTurnTimer);
  activeSaveSlot = null;
  state = createInteractiveTutorialState();
  selectedHeroIds = new Set([state.party.activeHeroId]);
  showDungeonLayout = false;
  roomIsBuilt = false;
  interactiveTutorialActive = true;
  interactiveTutorialStep = 0;
  interactiveTutorialEnteredStep = -1;
  interactiveTutorialUpdating = false;
  hideMainMenu();
  hideFighterInfo();
  hideInventoryMenu();
  hideUseItemMenu();
  hideAbilitiesMenu();
  hideHomeMenu();
  hideStoreMenu();
  render();
  centerViewOnHero();
  els.tutorialTour.classList.remove("hidden");
  updateInteractiveTutorial();
}

function finishInteractiveTutorial() {
  interactiveTutorialActive = false;
  interactiveTutorialEnteredStep = -1;
  interactiveTutorialUpdating = false;
  els.tutorialTour?.classList.add("hidden");
  els.tutorialHighlight?.classList.add("hidden");
  hideInventoryMenu();
  if (state?.isTutorial) showMainMenu("Tutorial ended. Start a new adventure when you are ready.");
}

function rollAbilityScore() {
  const rolls = [rollDie(6), rollDie(6), rollDie(6), rollDie(6)].sort((a, b) => a - b);
  return rolls.slice(1).reduce((sum, roll) => sum + roll, 0);
}

function rollAbilityScoresMinimum(totalMinimum = 72) {
  let scores = [];
  do {
    scores = abilities.map(rollAbilityScore);
  } while (scores.reduce((sum, score) => sum + score, 0) < totalMinimum);
  return scores;
}

function renderAbilityAssignmentFields(scores, raceSelection = defaultRaceSelection) {
  const bonuses = raceAbilityBonuses(raceSelection);
  return abilities
    .map(
      (ability) => `
        <label>
          <span>${ability.toUpperCase()}${bonuses[ability] ? ` ${abilityLabel(bonuses[ability])}` : ""}</span>
          <select data-ability-select="${ability}"></select>
        </label>
      `,
    )
    .join("");
}

function updateAbilityAssignmentOptions(container, scores, raceSelection = defaultRaceSelection) {
  const bonuses = raceAbilityBonuses(raceSelection);
  const selects = Array.from(container.querySelectorAll("[data-ability-select]"));
  const selected = new Map(selects.map((select) => [select.dataset.abilitySelect, select.value]));
  const used = new Set(Array.from(selected.values()).filter((value) => value !== ""));

  for (const select of selects) {
    const current = selected.get(select.dataset.abilitySelect) ?? "";
    const bonus = bonuses[select.dataset.abilitySelect] ?? 0;
    const options = [`<option value="">-</option>`];
    scores.forEach((score, index) => {
      const value = String(index);
      if (value === current || !used.has(value)) {
        const label = bonus ? `${score} ${abilityLabel(bonus)} = ${score + bonus}` : `${score}`;
        options.push(`<option value="${value}" ${value === current ? "selected" : ""}>${label}</option>`);
      }
    });
    select.innerHTML = options.join("");
  }
}

function showAbilityAssignmentDialog(scores, raceSelection = defaultRaceSelection) {
  return new Promise((resolve) => {
    const sortedScores = [...scores].sort((a, b) => b - a);
    els.gameDialogTitle.textContent = "Assign Ability Scores";
    els.gameDialogMessage.innerHTML = `
      ${dialogProgressMarkup(heroCreationProgress.abilities)}
      Scores: ${sortedScores.map(escapeHtml).join(", ")}
      <br><span class="empty-note">${escapeHtml(raceDisplayName(raceSelection))}: ${escapeHtml(abilityBonusSummary(raceAbilityBonuses(raceSelection)))}</span>
    `;
    els.gameDialogField.classList.add("hidden");
    els.gameDialogActions.innerHTML = `
      <div class="ability-assignment">
        ${renderAbilityAssignmentFields(sortedScores, raceSelection)}
        <p class="ability-assignment-error" aria-live="polite"></p>
      </div>
      <button type="submit" data-dialog-action="confirm">Continue</button>
      <button type="button" class="ghost-button" data-dialog-action="back">Back</button>
    `;

    const cleanup = (value) => {
      els.gameDialogForm.removeEventListener("submit", handleSubmit);
      els.gameDialogActions.removeEventListener("click", handleClick);
      els.gameDialogActions.removeEventListener("change", handleChange);
      els.gameDialog.classList.add("hidden");
      activeDialogCancel = null;
      resolve(value);
    };

    const handleSubmit = (event) => {
      event.preventDefault();
      const selects = Array.from(els.gameDialogActions.querySelectorAll("[data-ability-select]"));
      const selectedIndexes = selects.map((select) => select.value);
      const error = els.gameDialogActions.querySelector(".ability-assignment-error");
      if (selectedIndexes.some((value) => value === "") || new Set(selectedIndexes).size !== abilities.length) {
        if (error) error.textContent = "Assign each ability one score.";
        return;
      }

      cleanup(
        Object.fromEntries(
          selects.map((select) => [select.dataset.abilitySelect, sortedScores[Number(select.value)]]),
        ),
      );
    };

    const handleClick = (event) => {
      const button = event.target.closest("[data-dialog-action='back']");
      if (button) cleanup(dialogBackValue);
    };

    const handleChange = (event) => {
      if (!event.target.matches("[data-ability-select]")) return;
      updateAbilityAssignmentOptions(els.gameDialogActions, sortedScores, raceSelection);
      const error = els.gameDialogActions.querySelector(".ability-assignment-error");
      if (error) error.textContent = "";
    };

    els.gameDialogForm.addEventListener("submit", handleSubmit);
    els.gameDialogActions.addEventListener("click", handleClick);
    els.gameDialogActions.addEventListener("change", handleChange);
    activeDialogCancel = () => cleanup(null);
    els.gameDialog.classList.remove("hidden");
    updateAbilityAssignmentOptions(els.gameDialogActions, sortedScores, raceSelection);
    els.gameDialogActions.querySelector("select")?.focus();
  });
}

function spellChoiceCountForClassLevel(classId, level) {
  const template = getHeroTemplate(classId);
  const casterType = template.casterType ?? "none";
  if (casterType === "none") return 0;
  if (classId === "wizard") return level === 1 ? 4 : 2;
  if (casterType === "full") return level === 1 ? 2 : 1;
  if (casterType === "half") return level === 1 || (level > 1 && level % 2 === 1) ? 1 : 0;
  if (casterType === "pact") return level === 1 ? 2 : level >= 3 && level <= 17 && level % 2 === 1 ? 1 : 0;
  return 0;
}

function cantripChoiceCountForClassLevel(classId, level) {
  const template = getHeroTemplate(classId);
  if (!(template.cantripList ?? []).length) return 0;
  if (classId === "wizard" && level === 1) return 4;
  if (level === 1) return 3;
  if (level === 4 || level === 10) return 1;
  return 0;
}

function eligibleSpellChoicesFor(classSource, chosenSpellIds = []) {
  const chosen = new Set(chosenSpellIds);
  const maxLevel = maxSpellLevelForFighter(classSource);
  return classSpellListForFighter(classSource)
    .map((spellId) => getContentDefinition("spells", spellId))
    .filter((spell) => spell && !chosen.has(spell.id) && spellBaseLevel(spell) > 0 && spellBaseLevel(spell) <= maxLevel);
}

function subclassSpellSourceDefinition(classSource) {
  if (!classSource?.classId || !classSource?.subclassId) return null;
  const template = getHeroTemplate(classSource.classId);
  const normal = (template.subclasses ?? []).find((subclass) => subclass.id === classSource.subclassId) ?? null;
  const admin = (template.adminSubclasses ?? []).find((subclass) => subclass.id === classSource.subclassId) ?? null;
  return classSource.subclassVariant === "full" ? admin ?? normal : normal ?? admin;
}

function canonicalSpellIdSet(spellIds = []) {
  return new Set(spellIds.map((spellId) => canonicalSpellId(spellId)));
}

function subclassOnlyChoiceSpellIds(classSource, kind = "spell") {
  const subclass = subclassSpellSourceDefinition(classSource);
  if (!subclass) return new Set();
  const template = getHeroTemplate(classSource.classId);
  const baseIds = kind === "cantrip"
    ? (template.classCantripList ?? template.cantripList ?? [])
    : (template.classSpellList ?? template.spellList ?? template.spells ?? []);
  const sourceIds = kind === "cantrip"
    ? [...(subclass.cantripList ?? []), ...(subclass.expandedCantripList ?? [])]
    : [...(subclass.spellList ?? []), ...(subclass.expandedSpellList ?? [])];
  const base = canonicalSpellIdSet(baseIds);
  return new Set(sourceIds.map((spellId) => canonicalSpellId(spellId)).filter((spellId) => !base.has(spellId)));
}

function spellChoiceDescription(spell) {
  const parts = [];
  if (spell.description) parts.push(spell.description);
  const range = spell.range?.kind === "self" ? "Self" : spell.range?.feet ? `${spell.range.feet} ft` : "";
  const target = spell.target ? spell.target.replace(/([A-Z])/g, " $1").toLowerCase() : "";
  const damage = spell.effect?.dice ? `${spell.effect.dice.count ?? 1}d${spell.effect.dice.sides ?? 6} ${spell.effect?.type ?? ""}`.trim() : "";
  const save = spell.save?.ability ? `${spell.save.ability.toUpperCase()} save${spell.save.halfDamage ? " half" : ""}` : "";
  const tags = [range && `Range: ${range}`, target && `Target: ${target}`, damage && `Damage: ${damage}`, save].filter(Boolean);
  if (tags.length) parts.push(tags.join(" • "));
  return parts.join(" ");
}

async function chooseClassSpells(classSource, count, chosenSpellIds = [], { cancelAborts = false } = {}) {
  const chosen = [...chosenSpellIds];
  let unusedCredits = 0;
  for (let index = 0; index < count; index += 1) {
    const eligible = eligibleSpellChoicesFor(classSource, chosen);
    const subclassOnlySpellIds = subclassOnlyChoiceSpellIds(classSource, "spell");
    if (!eligible.length) {
      unusedCredits += 1;
      continue;
    }
    const choice = await showSelectChoiceDialog({
      title: "Choose Spell",
      message: `Choose a ${classSource.className ?? "class"} spell (${index + 1}/${count}).`,
      progress: heroCreationProgress.magic,
      label: "Choose a spell:",
      cancelText: "Back",
      cancelValue: dialogBackValue,
      choices: eligible.map((spell) => {
        const subclassOnly = subclassOnlySpellIds.has(canonicalSpellId(spell.id));
        return {
          value: spell.id,
          label: `${spell.name} (L${spellBaseLevel(spell)})${subclassOnly ? " - subclass" : ""}`,
          description: spellChoiceDescription(spell),
          detailClass: subclassOnly ? "subclass-only-spell-choice" : "",
          optionClass: subclassOnly ? "subclass-only-spell-option" : "",
        };
      }),
    });
    if (choice === dialogBackValue) {
      if (index === 0) {
        if (cancelAborts) return { spells: chosen, unusedCredits, cancelled: true };
        return dialogBackValue;
      }
      chosen.pop();
      index -= 2;
      continue;
    }
    if (!choice) {
      if (cancelAborts) return { spells: chosen, unusedCredits, cancelled: true };
      unusedCredits += count - index;
      break;
    }
    chosen.push(choice);
  }
  return { spells: chosen, unusedCredits };
}

function eligibleCantripChoicesFor(classSource, chosenSpellIds = []) {
  const chosen = new Set(chosenSpellIds);
  return classCantripListForFighter(classSource)
    .map((spellId) => getContentDefinition("spells", spellId))
    .filter((spell) => spell && !chosen.has(spell.id) && spellBaseLevel(spell) === 0);
}

async function chooseClassCantrips(classSource, count, chosenSpellIds = [], { cancelAborts = false } = {}) {
  const chosen = [...chosenSpellIds];
  let unusedCredits = 0;
  for (let index = 0; index < count; index += 1) {
    const eligible = eligibleCantripChoicesFor(classSource, chosen);
    const subclassOnlyCantripIds = subclassOnlyChoiceSpellIds(classSource, "cantrip");
    if (!eligible.length) {
      unusedCredits += 1;
      continue;
    }
    const choice = await showSelectChoiceDialog({
      title: "Choose Cantrip",
      message: `Choose a ${classSource.className ?? "class"} cantrip (${index + 1}/${count}).`,
      progress: heroCreationProgress.magic,
      label: "Choose a cantrip:",
      cancelText: "Back",
      cancelValue: dialogBackValue,
      choices: eligible.map((spell) => {
        const subclassOnly = subclassOnlyCantripIds.has(canonicalSpellId(spell.id));
        return {
          value: spell.id,
          label: `${spell.name}${subclassOnly ? " - subclass" : ""}`,
          description: spellChoiceDescription(spell),
          detailClass: subclassOnly ? "subclass-only-spell-choice" : "",
          optionClass: subclassOnly ? "subclass-only-spell-option" : "",
        };
      }),
    });
    if (choice === dialogBackValue) {
      if (index === 0) {
        if (cancelAborts) return { spells: chosen, unusedCredits, cancelled: true };
        return dialogBackValue;
      }
      chosen.pop();
      index -= 2;
      continue;
    }
    if (!choice) {
      if (cancelAborts) return { spells: chosen, unusedCredits, cancelled: true };
      unusedCredits += count - index;
      break;
    }
    chosen.push(choice);
  }
  return { spells: chosen, unusedCredits };
}

function fightingStyleChoicesForClass(classId) {
  const common = [
    { value: "defense", label: "Defense" },
    { value: "dueling", label: "Dueling" },
    { value: "greatWeaponFighting", label: "Great Weapon Fighting" },
  ];
  if (classId === "fighter") return [...common, { value: "archery", label: "Archery" }];
  if (classId === "ranger") return [{ value: "archery", label: "Archery" }, { value: "dueling", label: "Dueling" }];
  if (classId === "paladin") return common;
  return [];
}

async function chooseFightingStyle(classId) {
  const choices = fightingStyleChoicesForClass(classId);
  if (!choices.length) return null;
  return showChoiceDialog({
    title: "Fighting Style",
    message: "Choose a fighting style.",
    progress: heroCreationProgress.training,
    choices: withBackChoice(choices),
  });
}


function proficiencyChoiceLabel(type, id) {
  return type === "tool" ? toolName(id) : skillName(id);
}

async function chooseUniqueProficiencies({ title, message, count, choices, selected = [], valuePrefix = "" }) {
  const picked = [...selected];
  const newlyPicked = [];
  for (let index = 0; index < count; index += 1) {
    const available = choices.filter((id) => !picked.includes(id));
    if (!available.length) break;
    const choice = await showChoiceDialog({
      title,
      message: `${message} (${index + 1}/${count})`,
      progress: heroCreationProgress.training,
      choices: withBackChoice(available.map((id) => ({ value: `${valuePrefix}${id}`, label: valuePrefix === "tool:" ? toolName(id) : skillName(id) }))),
    });
    if (choice === dialogBackValue) {
      if (index === 0) return dialogBackValue;
      const removed = newlyPicked.pop();
      if (removed) picked.splice(picked.lastIndexOf(removed), 1);
      index -= 2;
      continue;
    }
    if (!choice) return null;
    const cleanChoice = valuePrefix ? choice.slice(valuePrefix.length) : choice;
    picked.push(cleanChoice);
    newlyPicked.push(cleanChoice);
  }
  return newlyPicked;
}

async function chooseExpertiseProficiencies({ title, message, count, skillProficiencies = [], toolProficiencies = [], existingSkillExpertise = [], existingToolExpertise = [], skillsOnly = false, allowedTools = null }) {
  const expertiseSkills = [...existingSkillExpertise];
  const expertiseTools = [...existingToolExpertise];
  const gained = { skills: [], tools: [] };
  for (let index = 0; index < count; index += 1) {
    const skillChoices = skillProficiencies
      .filter((skillId) => !expertiseSkills.includes(skillId))
      .map((skillId) => ({ value: `skill:${skillId}`, label: skillName(skillId), description: "Double proficiency bonus for this skill." }));
    const eligibleTools = skillsOnly ? [] : toolProficiencies.filter((toolId) => !allowedTools || allowedTools.includes(toolId));
    const toolChoices = eligibleTools
      .filter((toolId) => !expertiseTools.includes(toolId))
      .map((toolId) => ({ value: `tool:${toolId}`, label: toolName(toolId), description: "Double proficiency bonus for this tool." }));
    const choices = [...skillChoices, ...toolChoices];
    if (!choices.length) break;
    const choice = await showChoiceDialog({ title, message: `${message} (${index + 1}/${count})`, progress: heroCreationProgress.training, choices: withBackChoice(choices) });
    if (choice === dialogBackValue) {
      if (index === 0) return dialogBackValue;
      const lastSkill = gained.skills.pop();
      const lastTool = lastSkill ? null : gained.tools.pop();
      if (lastSkill) expertiseSkills.splice(expertiseSkills.lastIndexOf(lastSkill), 1);
      if (lastTool) expertiseTools.splice(expertiseTools.lastIndexOf(lastTool), 1);
      index -= 2;
      continue;
    }
    if (!choice) return null;
    const [type, id] = choice.split(":");
    if (type === "tool") {
      expertiseTools.push(id);
      gained.tools.push(id);
    } else {
      expertiseSkills.push(id);
      gained.skills.push(id);
    }
  }
  return gained;
}

async function chooseCharacterProficiencies(classId = defaultContent.heroClass, raceSelection = defaultRaceSelection) {
  const raceTraits = raceTraitsForSelection(raceSelection);
  const classPlan = classProficiencyPlan(classId);
  const skillProficiencies = [...(raceTraits.skillProficiencies ?? [])];
  const toolProficiencies = uniqueValues([...(raceTraits.toolProficiencies ?? []), ...classToolProficiencies(classId)]);
  const expertiseSkills = [];
  const expertiseTools = [];

  if (raceTraits.skillChoiceCount) {
    const picked = await chooseUniqueProficiencies({
      title: "Race Skill Proficiency",
      message: `${raceTraits.raceName} grants extra skill training. Choose a skill proficiency.`,
      count: raceTraits.skillChoiceCount,
      choices: raceTraits.skillChoices?.length ? raceTraits.skillChoices : allSkillIds,
      selected: skillProficiencies,
    });
    if (picked === dialogBackValue) return dialogBackValue;
    if (!picked) return null;
    skillProficiencies.push(...picked);
  }

  if (raceTraits.toolChoiceCount) {
    const picked = await chooseUniqueProficiencies({
      title: "Race Tool Proficiency",
      message: `${raceTraits.raceName} grants tool training. Choose a tool proficiency.`,
      count: raceTraits.toolChoiceCount,
      choices: raceTraits.toolChoices ?? [],
      selected: toolProficiencies,
      valuePrefix: "tool:",
    });
    if (picked === dialogBackValue) return dialogBackValue;
    if (!picked) return null;
    toolProficiencies.push(...picked);
  }

  if (classPlan.skillChoiceCount) {
    const classTemplate = getHeroTemplate(classId);
    const picked = await chooseUniqueProficiencies({
      title: "Class Skill Proficiency",
      message: `${classTemplate.className ?? classTemplate.name ?? "Class"} training. Choose a skill proficiency.`,
      count: classPlan.skillChoiceCount,
      choices: classPlan.skillChoices ?? allSkillIds,
      selected: skillProficiencies,
    });
    if (picked === dialogBackValue) return dialogBackValue;
    if (!picked) return null;
    skillProficiencies.push(...picked);
  }

  if (classPlan.toolChoiceCount) {
    const picked = await chooseUniqueProficiencies({
      title: "Class Tool Proficiency",
      message: "Choose a tool proficiency.",
      count: classPlan.toolChoiceCount,
      choices: classPlan.toolChoices ?? [],
      selected: toolProficiencies,
      valuePrefix: "tool:",
    });
    if (picked === dialogBackValue) return dialogBackValue;
    if (!picked) return null;
    toolProficiencies.push(...picked);
  }

  const levelOneExpertise = expertisePlanForClassLevel(classId, 1);
  if (levelOneExpertise?.count) {
    const gained = await chooseExpertiseProficiencies({
      title: "Expertise",
      message: "Choose a proficiency to master.",
      count: levelOneExpertise.count,
      skillProficiencies,
      toolProficiencies,
      skillsOnly: Boolean(levelOneExpertise.skillsOnly),
      allowedTools: levelOneExpertise.allowedTools ?? null,
    });
    if (gained === dialogBackValue) return dialogBackValue;
    if (!gained) return null;
    expertiseSkills.push(...gained.skills);
    expertiseTools.push(...gained.tools);
  }

  return {
    skillProficiencies: uniqueValues(skillProficiencies),
    toolProficiencies: uniqueValues(toolProficiencies),
    expertiseSkills: uniqueValues(expertiseSkills),
    expertiseTools: uniqueValues(expertiseTools),
  };
}

function quickPickUniqueProficiencies({ choices = [], count = 0, selected = [] }) {
  const picked = [];
  const existing = new Set(selected);
  for (const choice of choices) {
    if (picked.length >= count) break;
    if (existing.has(choice)) continue;
    picked.push(choice);
    existing.add(choice);
  }
  return picked;
}

function quickStartProficiencies(classId = defaultContent.heroClass, raceSelection = defaultRaceSelection) {
  const raceTraits = raceTraitsForSelection(raceSelection);
  const classPlan = classProficiencyPlan(classId);
  const skillProficiencies = [...(raceTraits.skillProficiencies ?? [])];
  const toolProficiencies = uniqueValues([...(raceTraits.toolProficiencies ?? []), ...classToolProficiencies(classId)]);
  skillProficiencies.push(
    ...quickPickUniqueProficiencies({
      choices: raceTraits.skillChoices?.length ? raceTraits.skillChoices : allSkillIds,
      count: raceTraits.skillChoiceCount ?? 0,
      selected: skillProficiencies,
    }),
  );
  toolProficiencies.push(
    ...quickPickUniqueProficiencies({
      choices: raceTraits.toolChoices ?? [],
      count: raceTraits.toolChoiceCount ?? 0,
      selected: toolProficiencies,
    }),
  );
  skillProficiencies.push(
    ...quickPickUniqueProficiencies({
      choices: classPlan.skillChoices ?? allSkillIds,
      count: classPlan.skillChoiceCount ?? 0,
      selected: skillProficiencies,
    }),
  );
  toolProficiencies.push(
    ...quickPickUniqueProficiencies({
      choices: classPlan.toolChoices ?? [],
      count: classPlan.toolChoiceCount ?? 0,
      selected: toolProficiencies,
    }),
  );
  const expertise = expertisePlanForClassLevel(classId, 1);
  const expertiseSkills = expertise?.count
    ? quickPickUniqueProficiencies({
        choices: expertise.skillsOnly ? skillProficiencies : skillProficiencies,
        count: expertise.count,
        selected: [],
      })
    : [];
  return {
    skillProficiencies: uniqueValues(skillProficiencies),
    toolProficiencies: uniqueValues(toolProficiencies),
    expertiseSkills: uniqueValues(expertiseSkills),
    expertiseTools: [],
  };
}

async function chooseLevelUpExpertise(hero) {
  const plan = expertisePlanForClassLevel(hero.classId, hero.level ?? 1);
  const fallbackPlan = Object.values(classProficiencyPlan(hero.classId).expertiseByLevel ?? {})[0] ?? {};
  const activePlan = plan ?? fallbackPlan;
  const count = (plan?.count ?? 0) + (hero.unusedExpertiseChoiceCredits ?? 0);
  if (!count) return "";
  const gained = await chooseExpertiseProficiencies({
    title: "Expertise",
    message: `${hero.className ?? "Class"} expertise improves. Choose a proficiency to master.`,
    count,
    skillProficiencies: hero.skillProficiencies ?? [],
    toolProficiencies: hero.toolProficiencies ?? [],
    existingSkillExpertise: hero.expertiseSkills ?? [],
    existingToolExpertise: hero.expertiseTools ?? [],
    skillsOnly: Boolean(activePlan.skillsOnly),
    allowedTools: activePlan.allowedTools ?? null,
  });
  if (gained === dialogBackValue) {
    return null;
  }
  if (!gained) {
    return null;
  }
  hero.expertiseSkills = uniqueValues([...(hero.expertiseSkills ?? []), ...gained.skills]);
  hero.expertiseTools = uniqueValues([...(hero.expertiseTools ?? []), ...gained.tools]);
  hero.unusedExpertiseChoiceCredits = Math.max(0, count - gained.skills.length - gained.tools.length);
  const labels = [...gained.skills.map(skillName), ...gained.tools.map(toolName)];
  return labels.length ? ` Expertise gained: ${labels.join(", ")}.` : "";
}

function clericFaithHandoutText(faith) {
  const item = getContentDefinition("items", faith?.handoutItemId);
  return String(item?.handout?.text ?? item?.customDescription ?? item?.description ?? `${faith?.name ?? "Faith"}\n\n${faith?.summary ?? ""}`).trim();
}

function clericFaithDetailMarkup(faith) {
  const text = clericFaithHandoutText(faith);
  if (typeof handoutTextMarkup === "function") return handoutTextMarkup(text);
  return text
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph.replace(/^#+\s*/, ""))}</p>`)
    .join("");
}

function clericFaithChoiceMarkup(detailFaithId = "") {
  const options = clericFaithOptions();
  const detailFaith = detailFaithId ? clericFaithDefinition(detailFaithId) : null;
  return `
    ${dialogProgressMarkup(heroCreationProgress.faith)}
    <p>Choose the cleric's faith. This is a story and journal choice only; it does not change class mechanics.</p>
    <div class="cleric-faith-list">
      ${options
        .map(
          (faith) => `
            <div class="cleric-faith-option">
              <button type="button" class="cleric-faith-pick" data-faith-choice="${escapeAttribute(faith.id)}">
                <b>${escapeHtml(faith.name)}</b>
                <span>${escapeHtml(faith.summary)}</span>
                <small>${escapeHtml(faith.goodFor)}</small>
              </button>
              <button type="button" class="cleric-faith-info" data-faith-info="${escapeAttribute(faith.id)}" aria-label="More about ${escapeAttribute(faith.name)}">
                <span class="choice-info-glyph" aria-hidden="true">i</span>
              </button>
            </div>
          `,
        )
        .join("")}
    </div>
    ${
      detailFaith
        ? `<div class="cleric-faith-detail">
            <div class="subclass-guide-title"><span class="choice-info-glyph" aria-hidden="true">i</span><b>${escapeHtml(detailFaith.name)}</b></div>
            ${clericFaithDetailMarkup(detailFaith)}
          </div>`
        : `<p class="empty-note">Use the i buttons to read a faith's full church booklet before choosing.</p>`
    }
  `;
}

function chooseClericFaith(classId = defaultContent.heroClass) {
  if (classId !== "cleric") return Promise.resolve(null);
  return new Promise((resolve) => {
    restoreDialogInputField();
    let detailFaithId = "";
    els.gameDialogTitle.textContent = "Choose Cleric Faith";
    els.gameDialogField.classList.add("hidden");
    els.gameDialogActions.innerHTML = `<button type="button" class="ghost-button" data-dialog-action="back">Back</button>`;
    els.gameDialogForm.classList.add("faith-choice-dialog");

    const render = () => {
      els.gameDialogMessage.innerHTML = clericFaithChoiceMarkup(detailFaithId);
    };

    const cleanup = (value) => {
      els.gameDialogMessage.removeEventListener("click", handleMessageClick);
      els.gameDialogActions.removeEventListener("click", handleActionClick);
      els.gameDialogForm.classList.remove("faith-choice-dialog");
      els.gameDialog.classList.add("hidden");
      activeDialogCancel = null;
      resolve(value);
    };

    const handleMessageClick = (event) => {
      const infoButton = event.target.closest("[data-faith-info]");
      if (infoButton) {
        detailFaithId = infoButton.dataset.faithInfo;
        render();
        return;
      }
      const choiceButton = event.target.closest("[data-faith-choice]");
      if (choiceButton) cleanup(choiceButton.dataset.faithChoice);
    };

    const handleActionClick = (event) => {
      const button = event.target.closest("[data-dialog-action]");
      if (button?.dataset.dialogAction === "back") cleanup(dialogBackValue);
    };

    els.gameDialogMessage.addEventListener("click", handleMessageClick);
    els.gameDialogActions.addEventListener("click", handleActionClick);
    activeDialogCancel = () => cleanup(null);
    render();
    els.gameDialog.classList.remove("hidden");
    els.gameDialogMessage.querySelector("[data-faith-choice]")?.focus();
  });
}

async function createCharacterOptions(raceSelection = defaultRaceSelection, classId = defaultContent.heroClass) {
  const raceTraits = raceTraitsForSelection(raceSelection);
  let step = 0;
  let choice = null;
  let abilityScores = null;
  while (true) {
    while (step >= 0 && step < 2) {
      if (step === 0) {
        choice = await showChoiceDialog({
          title: "Ability Scores",
          message: "Choose how to create your fighter's STR, DEX, CON, INT, WIS, and CHA.",
          progress: heroCreationProgress.abilities,
          choices: withBackChoice([
            { value: "pregenerated", label: "Pregenerated" },
            { value: "standard", label: "Standard Array" },
            { value: "roll", label: "Roll Stats" },
          ]),
        });
        if (choice === dialogBackValue) return dialogBackValue;
        if (!choice) return null;
        abilityScores = choice === "pregenerated" ? (classPredefinedAbilityScores[classId] ?? pregeneratedAbilityScores) : null;
        step += 1;
      } else if (step === 1 && choice !== "pregenerated" && !abilityScores) {
        const scores = choice === "roll" ? rollAbilityScoresMinimum(72) : standardArray;
        abilityScores = await showAbilityAssignmentDialog(scores, raceSelection);
        if (abilityScores === dialogBackValue || !abilityScores) step -= 1;
        else step += 1;
      } else {
        step += 1;
      }
    }

    const gearOptions = await createHeroGearOptions(classId, raceSelection);
    if (gearOptions === dialogBackValue) {
      step = 0;
      choice = null;
      abilityScores = null;
      continue;
    }
    if (gearOptions) {
      const proficiencyOptions = await chooseCharacterProficiencies(classId, raceSelection);
      if (proficiencyOptions === dialogBackValue) continue;
      if (!proficiencyOptions) return null;
      const classTemplate = getHeroTemplate(classId);
      const classSpellList = [...(classTemplate.classSpellList ?? classTemplate.spellList ?? classTemplate.spells ?? [])];
      const classCantripList = [...(classTemplate.classCantripList ?? classTemplate.cantripList ?? [])];
      const spellChoiceCount = spellChoiceCountForClassLevel(classId, 1);
      const spellChoice = spellChoiceCount ? await chooseClassSpells({ ...classTemplate, classSpellList, level: 1 }, spellChoiceCount) : { spells: [], unusedCredits: 0 };
      if (spellChoice === dialogBackValue) continue;
      const cantripChoiceCount = cantripChoiceCountForClassLevel(classId, 1);
      const cantripChoice = cantripChoiceCount
        ? await chooseClassCantrips({ ...classTemplate, classCantripList, level: 1 }, cantripChoiceCount)
        : { spells: [], unusedCredits: 0 };
      if (cantripChoice === dialogBackValue) continue;
      const clericFaithId = await chooseClericFaith(classId);
      if (clericFaithId === dialogBackValue) continue;
      const fightingStyle = await chooseFightingStyle(classId);
      if (fightingStyle === dialogBackValue) continue;
      return {
        abilityScores,
        fightingStyle,
        clericFaithId,
        classSpellList,
        classCantripList,
        spells: [...cantripChoice.spells, ...spellChoice.spells],
        unusedSpellChoiceCredits: spellChoice.unusedCredits,
        unusedCantripChoiceCredits: cantripChoice.unusedCredits,
        startingFeatChoiceCount: raceTraits.startingFeatChoiceCount ?? 0,
        startingFeatSourceName: raceTraits.subraceName || raceTraits.raceName || "Ancestry",
        ...proficiencyOptions,
        ...gearOptions,
      };
    }
    return null;
  }
}

function createQuickStartCharacterOptions(raceSelection = defaultRaceSelection, classId = defaultContent.heroClass) {
  const classTemplate = getHeroTemplate(classId);
  const classSpellList = [...(classTemplate.classSpellList ?? classTemplate.spellList ?? classTemplate.spells ?? [])];
  const classCantripList = [...(classTemplate.classCantripList ?? classTemplate.cantripList ?? [])];
  const spellChoiceCount = spellChoiceCountForClassLevel(classId, 1);
  const cantripChoiceCount = cantripChoiceCountForClassLevel(classId, 1);
  const spellChoices = eligibleSpellChoicesFor({ ...classTemplate, classSpellList, level: 1 }).slice(0, spellChoiceCount).map((spell) => spell.id);
  const cantripChoices = eligibleCantripChoicesFor({ ...classTemplate, classCantripList, level: 1 }).slice(0, cantripChoiceCount).map((spell) => spell.id);
  const raceTraits = raceTraitsForSelection(raceSelection);
  return {
    abilityScores: classPredefinedAbilityScores[classId] ?? pregeneratedAbilityScores,
    fightingStyle: fightingStyleChoicesForClass(classId)[0]?.value ?? null,
    clericFaithId: classId === "cleric" ? normalizeClericFaithId("lioran") : null,
    classSpellList,
    classCantripList,
    spells: [...cantripChoices, ...spellChoices],
    unusedSpellChoiceCredits: Math.max(0, spellChoiceCount - spellChoices.length),
    unusedCantripChoiceCredits: Math.max(0, cantripChoiceCount - cantripChoices.length),
    startingFeatChoiceCount: 0,
    skippedStartingFeatChoiceCount: raceTraits.startingFeatChoiceCount ?? 0,
    startingFeatSourceName: raceTraits.subraceName || raceTraits.raceName || "Ancestry",
    ...quickStartProficiencies(classId, raceSelection),
    ...createQuickStartGearOptions(classId, raceSelection),
  };
}

async function startNewAdventure() {
  window.clearTimeout(monsterTurnTimer);
  if (!(await promptForSaveFolderIfNeeded())) return;
  const saveSlot = await chooseSaveSlotForAdventure();
  if (!saveSlot) return;
  const { slotId, slotName } = saveSlot;
  const setupMode = await showChoiceDialog({
    title: "Start Setup",
    message: "Jump straight into Home with a ready hero, or open the full character builder.",
    progress: heroCreationProgress.identity,
    choices: [
      { value: "quick", label: "Quick Start", description: "Create a ready human fighter with solid starter gear and Gentle Fate dice." },
      { value: "custom", label: "Customize Hero", description: "Choose name, class, species, scores, gear, skills, magic, and dice feel." },
    ],
  });
  if (!setupMode) return;
  let chosenName = "";
  let heroOptions = null;
  let chosenTokenArt = "";
  let raceSelection = defaultRaceSelection;
  let classId = defaultContent.heroClass;
  let d20Mode = null;
  let creationStep = "identity";
  if (setupMode === "quick") {
    const template = getHeroTemplate(classId);
    chosenName = template.name ?? "Aster";
    heroOptions = createQuickStartCharacterOptions(raceSelection, classId);
    d20Mode = defaultD20Mode;
  }
  while (setupMode === "custom" && (!heroOptions || !d20Mode)) {
    if (creationStep === "identity") {
      const identity = await showHeroIdentityDialog({
        title: "Character Name",
        message: "Name your adventurer before stepping into the dungeon.",
        progress: heroCreationProgress.identity,
        nameValue: chosenName || getHeroTemplate().name,
        tokenArt: chosenTokenArt,
        confirmText: "Continue",
      });
      if (!identity) return;
      chosenName = identity.name || getHeroTemplate().name;
      chosenTokenArt = identity.tokenArt;
      creationStep = "class";
      continue;
    }

    if (creationStep === "class") {
      const chosenClass = await showHeroClassDialog();
      if (chosenClass === dialogBackValue) {
        creationStep = "identity";
        continue;
      }
      if (!chosenClass) return;
      classId = chosenClass;
      heroOptions = null;
      d20Mode = null;
      creationStep = "race";
      continue;
    }

    if (creationStep === "race") {
      const chosenRace = await showHeroRaceDialog({ selection: raceSelection });
      if (chosenRace === dialogBackValue) {
        creationStep = "class";
        continue;
      }
      if (!chosenRace) return;
      raceSelection = chosenRace;
      heroOptions = null;
      d20Mode = null;
      creationStep = "options";
      continue;
    }

    if (creationStep === "options") {
      const chosenOptions = await createCharacterOptions(raceSelection, classId);
      if (chosenOptions === dialogBackValue) {
        creationStep = "race";
        continue;
      }
      if (!chosenOptions) return;
      heroOptions = chosenOptions;
      d20Mode = null;
      creationStep = "luck";
      continue;
    }

    if (creationStep === "luck") {
      const chosenD20Mode = await showD20ModeDialog({ allowBack: true });
      if (chosenD20Mode === dialogBackValue) {
        d20Mode = null;
        creationStep = "options";
        continue;
      }
      if (!chosenD20Mode) return;
      d20Mode = chosenD20Mode;
    }
  }
  heroOptions.d20Mode = normalizeD20Mode(d20Mode);
  heroOptions.saveRollMode = "manual";
  heroOptions.classId = classId;
  heroOptions.tokenArt = chosenTokenArt;
  heroOptions.raceSelection = raceSelection;
  showDungeonLayout = false;
  const initialDungeonState = createInitialState(chosenName, null, heroOptions);
  if (!(await chooseStartingFeatsForHero(initialDungeonState.fighters.hero, heroOptions.startingFeatChoiceCount, heroOptions.startingFeatSourceName))) return;
  if (heroOptions.skippedStartingFeatChoiceCount) {
    initialDungeonState.fighters.hero.unusedFeatChoiceCredits =
      (initialDungeonState.fighters.hero.unusedFeatChoiceCredits ?? 0) + heroOptions.skippedStartingFeatChoiceCount;
  }
  showLoadingScreen("Building World", "Generating your home village and nearby quest-board territory.", "This can take a moment on GitHub Pages.");
  try {
    const initialWorld = await window.DepthboundWorldTravel?.createInitialWorldState?.({
      seed: `adventure:${slotId}:${chosenName || "hero"}:${Date.now()}`,
      chunkWidth: 10,
      chunkHeight: 10,
    });
    updateLoadingScreen("Preparing Home", "Saving the new adventure.", "Almost there.");
    state = createHomeState([initialDungeonState.fighters.hero], [], { cp: 0, sp: 0, gp: 0 }, { ...initialDungeonState.party, partyTomes: initialDungeonState.partyTomes ?? [], world: initialWorld });
    state.saveSlotId = slotId;
    activeSaveSlot = slotId;
    await saveAdventure(slotId, { skipOverwriteWarning: true, slotName });
    try {
      await saveQuickstart(state);
    } catch (error) {
      updateSaveStatus(error?.message ?? "Could not write the dungeon restart save.");
    }
  } catch (error) {
    console.warn("Could not create the starting world.", error);
    hideLoadingScreen();
    updateSaveStatus("Could not generate the world map. Try Start New Adventure again.");
    return;
  }
  roomIsBuilt = false;
  hideMainMenu();
  render();
  hideLoadingScreen();
  window.DepthboundPlaytest?.syncNow?.();
  centerViewOnHero();
}

function availableDungeonThemes() {
  return window.DungeonContent
    .list("themes")
    .filter((theme) => !theme.hidden)
    .sort((a, b) => dungeonThemePlayerName(a).localeCompare(dungeonThemePlayerName(b)));
}

function dungeonThemePlayerName(themeOrId) {
  const theme = typeof themeOrId === "string" ? getContentDefinition("themes", themeOrId) : themeOrId;
  if (theme?.id === "emberveinDeepworks") return "Mine Dungeon";
  return theme?.name ?? "this dungeon";
}

function dungeonThemePlayerDescription(themeOrId) {
  const theme = typeof themeOrId === "string" ? getContentDefinition("themes", themeOrId) : themeOrId;
  if (theme?.id === "emberveinDeepworks") return "Old rails, ore seams, broken lifts, hot vents, and things that learned to live in the dark below.";
  return theme?.description ?? "";
}

function availableCustomDungeons() {
  return window.DungeonCustom?.list?.() ?? [];
}

async function chooseDungeonChoice() {
  const themes = availableDungeonThemes();
  const customDungeons = availableCustomDungeons();
  const choices = [
    ...themes.map((theme) => ({ value: `theme:${theme.id}`, label: dungeonThemePlayerName(theme), description: dungeonThemePlayerDescription(theme) })),
    ...customDungeons.map((dungeon) => ({ value: `custom:${dungeon.id}`, label: `Custom: ${dungeon.name}` })),
  ];
  if (choices.length <= 1) return choices[0]?.value ?? `theme:${defaultContent.theme}`;
  return showChoiceDialog({
    title: "Choose Dungeon",
    message: "Where do you want to venture next?",
    choices,
  });
}

async function chooseRandomDungeonChoice() {
  const themes = availableDungeonThemes();
  if (themes.length <= 1) return themes[0]?.id ?? defaultContent.theme;
  const themeId = await showChoiceDialog({
    title: "Random Runs",
    message: "Choose where the party ventures next.",
    choices: themes.map((theme) => ({ value: theme.id, label: dungeonThemePlayerName(theme), description: dungeonThemePlayerDescription(theme) })),
  });
  return themeId;
}

async function chooseCustomDungeonChoice() {
  const customDungeons = availableCustomDungeons();
  if (!customDungeons.length) {
    await showChoiceDialog({
      title: "Custom Dungeons",
      message: "No local custom dungeons are saved yet.",
      choices: [{ value: "ok", label: "Continue" }],
    });
    return "";
  }
  if (customDungeons.length <= 1) return customDungeons[0]?.id ?? "";
  return showChoiceDialog({
    title: "Custom Dungeons",
    message: "Choose a local custom dungeon.",
    choices: customDungeons.map((dungeon) => ({ value: dungeon.id, label: dungeon.name })),
  });
}

async function chooseDungeonSizeChoice(themeId) {
  const theme = getContentDefinition("themes", themeId);
  const choices = dungeonSizeOptions.map((size) => ({
    value: size.id,
    label: size.name,
    description: size.description,
  }));
  return showChoiceDialog({
    title: "Choose Size",
    message: `How deep should the party push into ${dungeonThemePlayerName(theme)}?`,
    choices,
  });
}

async function startDungeonChoiceWithHero(choice) {
  normalizeActivePartyOwnerBindings();
  const partyIds = state.party?.heroIds ?? ["hero"];
  const partyMembers = partyIds.map((id) => state.fighters[id]).filter((hero) => hero && !hero.dead);
  if (partyMembers.length === 0) {
    addLog("Choose at least one hero at the Planning Table before venturing out.", "important");
    render();
    return;
  }
  if (!choice) return;
  const themeId = choice.startsWith("theme:") ? choice.replace(/^theme:/, "") : "";
  const dungeonSizeId = themeId ? await chooseDungeonSizeChoice(themeId) : "";
  if (themeId && !dungeonSizeId) return;
  const previousState = state;
  const comfortScores = homeComfortScoresForActiveParty(state);
  const customTemplate = choice.startsWith("custom:") ? window.DungeonCustom?.get(choice.slice("custom:".length)) : null;
  if (customTemplate?.intro?.text || customTemplate?.intro?.images?.length) {
    await showDungeonStoryDialog({
      title: customTemplate.name,
      text: customTemplate.intro.text,
      images: customTemplate.intro.images,
      actionLabel: `Venture into the ${customTemplate.name}`,
      goalText: customGoalStatusForTemplate(customTemplate).text,
    });
  }
  if (choice.startsWith("custom:")) {
    state = createCustomDungeonStateForParty(partyMembers, state, choice.slice("custom:".length));
  } else {
    state = createDungeonStateForParty(partyMembers, state, themeId, dungeonSizeId);
  }
  if (!state) {
    state = previousState;
    addLog("That custom dungeon could not be loaded.", "important");
    render();
    return;
  }
  applyHomeComfortBonusesToDungeonState(state, comfortScores);
  try {
    await saveQuickstart(state);
  } catch (error) {
    updateSaveStatus(error?.message ?? "Could not write the dungeon restart save.");
  }
  roomIsBuilt = false;
  hideHomeMenu();
  render();
  window.DepthboundPlaytest?.syncNow?.();
  centerViewOnHero();
}

async function startNewDungeonWithHero() {
  const choice = await chooseDungeonChoice();
  return startDungeonChoiceWithHero(choice);
}

async function startRandomDungeonWithHero(themeId = "") {
  const selectedThemeId = themeId || await chooseRandomDungeonChoice();
  if (!selectedThemeId) return;
  return startDungeonChoiceWithHero(`theme:${selectedThemeId}`);
}

async function startCustomDungeonWithHero(customDungeonId = "") {
  const selectedCustomDungeonId = customDungeonId || await chooseCustomDungeonChoice();
  if (!selectedCustomDungeonId) return;
  return startDungeonChoiceWithHero(`custom:${selectedCustomDungeonId}`);
}

async function startOneShotDungeonWithHero(oneShotDungeonId = "") {
  const template = await window.DungeonOneShots?.get?.(oneShotDungeonId);
  if (!template) return;
  const partyIds = state.party?.heroIds ?? ["hero"];
  const partyMembers = partyIds.map((id) => state.fighters[id]).filter((hero) => hero && !hero.dead);
  const comfortScores = homeComfortScoresForActiveParty(state);
  if (template.intro?.text || template.intro?.images?.length) {
    await showDungeonStoryDialog({
      title: template.name,
      text: template.intro.text,
      images: template.intro.images,
      actionLabel: `Venture into the ${template.name}`,
      goalText: customGoalStatusForTemplate(template).text,
    });
  }
  const previousState = state;
  state = createCustomDungeonStateFromTemplate(partyMembers, state, template);
  if (!state) {
    state = previousState;
    return;
  }
  applyHomeComfortBonusesToDungeonState(state, comfortScores);
  try {
    await saveQuickstart(state);
  } catch (error) {
    updateSaveStatus(error?.message ?? "Could not write the dungeon restart save.");
  }
  roomIsBuilt = false;
  hideHomeMenu();
  render();
  window.DepthboundPlaytest?.syncNow?.();
  centerViewOnHero();
}

async function showCampaignMenu(campaignId) {
  const campaign = window.DungeonCampaigns?.get(campaignId);
  if (!campaign || !(window.DungeonCampaigns?.isUnlocked?.(campaignId, state) ?? true)) return;
  const completed = state.campaignProgress?.[campaign.id] ?? 0;
  const entries = await Promise.all(Array.from({ length: campaign.count }, (_, index) => window.DungeonCampaigns.dungeon(campaign.id, index + 1)));
  const campaignVoiceIds = campaign.id === "barrow-crown" && typeof dungeonVoiceLineIdsForPrefix === "function" && typeof campaignDescriptionVoicePrefix === "function"
    ? await dungeonVoiceLineIdsForPrefix(campaignDescriptionVoicePrefix(campaign.id))
    : [];
  const campaignDescriptionText = campaignVoiceIds.length && typeof dungeonVoiceTextForLineIds === "function"
    ? await dungeonVoiceTextForLineIds(campaignVoiceIds, campaign.description)
    : campaign.description;
  return new Promise((resolve) => {
    els.gameDialogForm.classList.add("campaign-dialog");
    els.gameDialogTitle.textContent = campaign.name;
    els.gameDialogMessage.innerHTML = campaignDescriptionMarkup(campaignDescriptionText);
    els.gameDialogMessage.classList.add("campaign-dialog-message");
    els.gameDialogField.classList.add("hidden");
    els.gameDialogActions.classList.add("campaign-dungeon-list");
    els.gameDialogActions.innerHTML = entries
      .map((entry, index) => {
        const number = index + 1;
        const unlocked = number <= completed + 1;
        const difficulty = typeof dungeonDifficultyLabelForTemplate === "function" ? dungeonDifficultyLabelForTemplate(entry) : "";
        return `<button type="button" data-campaign-dungeon="${number}" ${unlocked ? "" : "disabled"}>${number}. ${escapeHtml(entry?.name ?? `Dungeon ${number}`)}${difficulty ? ` <small class="dungeon-difficulty-label">${escapeHtml(difficulty)}</small>` : ""}${number <= completed ? " &#10003;" : unlocked ? "" : " [Locked]"}</button>`;
      })
      .join("");
    const cleanup = (value) => {
      els.gameDialogActions.removeEventListener("click", handleClick);
      if (typeof stopDungeonVoiceLine === "function") stopDungeonVoiceLine();
      els.gameDialogForm.classList.remove("campaign-dialog");
      els.gameDialogMessage.classList.remove("campaign-dialog-message");
      els.gameDialogActions.classList.remove("campaign-dungeon-list");
      els.gameDialog.classList.add("hidden");
      activeDialogCancel = null;
      resolve(value);
    };
    const handleClick = (event) => {
      const button = event.target.closest("[data-campaign-dungeon]");
      if (!button || button.disabled) return;
      cleanup(Number(button.dataset.campaignDungeon));
    };
    els.gameDialogActions.addEventListener("click", handleClick);
    activeDialogCancel = () => cleanup(null);
    els.gameDialog.classList.remove("hidden");
    if (campaignVoiceIds.length && typeof playDungeonVoiceLineSequence === "function") void playDungeonVoiceLineSequence(campaignVoiceIds);
  });
}

async function startCampaignDungeon(campaignId, options = {}) {
  const dungeonIndex = options.dungeonIndex ?? (await showCampaignMenu(campaignId));
  if (!dungeonIndex) return;
  const template = await window.DungeonCampaigns?.dungeon(campaignId, dungeonIndex);
  if (!template) return;
  const partyIds = state.party?.heroIds ?? ["hero"];
  const partyMembers = partyIds.map((id) => state.fighters[id]).filter((hero) => hero && !hero.dead);
  const comfortScores = homeComfortScoresForActiveParty(state);
  if (template.intro?.text || template.intro?.images?.length) {
    const introVoiceIds = typeof dungeonVoiceLineIdsForPrefix === "function" && typeof campaignDungeonVoicePrefix === "function"
      ? await dungeonVoiceLineIdsForPrefix(campaignDungeonVoicePrefix(campaignId, dungeonIndex, "intro"))
      : [];
    await showDungeonStoryDialog({
      title: template.name,
      text: template.intro.text,
      images: template.intro.images,
      actionLabel: `Venture into the ${template.name}`,
      goalText: customGoalStatusForTemplate(template).text,
      voiceIds: introVoiceIds,
    });
  }
  const previousState = state;
  if (template.generated) {
    const generated = template.generated ?? {};
    state = createDungeonStateForParty(
      partyMembers,
      previousState,
      generated.themeId ?? template.themeId ?? defaultContent.theme,
      generated.dungeonSizeId ?? template.dungeonSizeId ?? "small",
      generated.generatorOverrides ?? {},
    );
    if (state) {
      const entranceRoom = state.dungeon?.rooms?.find((room) => room.id === state.dungeon?.entranceRoomId) ?? state.dungeon?.rooms?.[0];
      if (template.ambientLight) state.dungeon.ambientLight = template.ambientLight;
      state.campaignId = template.campaignId ?? campaignId;
      state.campaignIndex = template.campaignIndex ?? dungeonIndex;
      state.customDungeonId = template.id;
      state.room.name = template.name;
      state.customDungeon = {
        id: template.id,
        name: template.name,
        oneShotDungeon: Boolean(template.oneShotDungeon),
        oneShotDungeonId: template.oneShotDungeonId ?? (template.oneShotDungeon ? template.id : null),
        goal: template.goal ?? { type: "reachExit" },
        monsterSummary: customDungeonMonsterSummary?.(state.fighters ?? {}) ?? {},
        intro: template.intro ?? { text: "", images: [] },
        outro: template.outro ?? { text: "", images: [] },
        storyTriggers: Array.isArray(template.storyTriggers) ? cloneData(template.storyTriggers) : [],
        storyTriggerHistory: {},
      };
      state.log = [{ text: dungeonArrivalLogText(template.name, entranceRoom?.name ?? "the entrance"), type: "important" }];
    }
  } else {
    state = createCustomDungeonStateFromTemplate(partyMembers, state, template);
  }
  if (!state) {
    state = previousState;
    return;
  }
  applyHomeComfortBonusesToDungeonState(state, comfortScores);
  try {
    await saveQuickstart(state);
  } catch (error) {
    updateSaveStatus(error?.message ?? "Could not write the dungeon restart save.");
  }
  roomIsBuilt = false;
  hideHomeMenu();
  render();
  window.DepthboundPlaytest?.syncNow?.();
  centerViewOnHero();
}

async function returnHomeEarly() {
  if (state.mode === "home" || state.mode === "combat" || !gameHasStarted) return;
  if (travelEncounterLocksRetreat()) {
    addLog(state.travelReturnCamp?.lockRetreatReason ?? "This encounter must be finished before the party can leave.", "important");
    render();
    return;
  }
  const travelReturnCamp = state.travelReturnCamp ? cloneData(state.travelReturnCamp) : null;
  const returnsToCamp = Boolean(travelReturnCamp?.world && travelReturnCamp?.camp);
  const confirmed = await showGameDialog({
    title: returnsToCamp ? "Return To Camp" : "Return Home",
    message: returnsToCamp
      ? "Return to camp now? Half your carried bag items and half your carried coins will be lost. Equipped items and the party inventory are safe."
      : "Return home now? Half your carried bag items and half your carried coins will be lost. Equipped items and the party inventory are safe.",
    confirmText: returnsToCamp ? "Return To Camp" : "Return Home",
    cancelText: "Stay Here",
  });
  if (!confirmed) return;

  const movedMaterials = moveInventoryPartyResourcesToSatchel(rosterHeroes());
  const hero = activeHero();
  const equippedIds = new Set(Object.values(hero.equipment).filter(Boolean));
  const carriedItems = hero.inventory.items.filter((item) => !equippedIds.has(item.id));
  const equippedItems = hero.inventory.items.filter((item) => equippedIds.has(item.id));
  const lostCount = Math.floor(carriedItems.length / 2);
  const shuffled = carriedItems.slice().sort(() => Math.random() - 0.5);
  const lostItems = shuffled.slice(0, lostCount);
  const keptCarried = shuffled.slice(lostCount);
  const lostCoins = Math.floor(moneyToCp(hero.inventory.money) / 2);
  hero.inventory.items = [...equippedItems, ...keptCarried];
  addMoney(hero.inventory.money, -lostCoins);

  const saveSlotId = state.saveSlotId ?? activeSaveSlot;
  if (returnsToCamp) {
    const world = window.DepthboundWorldTravel?.normalizeWorldState?.(travelReturnCamp.world) ?? travelReturnCamp.world;
    world.travelCamp = { ...travelReturnCamp.camp, active: true };
    state = createHomeState(rosterHeroes(), state.chest ?? [], state.chestMoney ?? {}, {
      ...state.party,
      worldDay: normalizeWorldDay(state.worldDay),
      campaignProgress: state.campaignProgress ?? {},
      questFlags: state.questFlags ?? {},
      partyResources: state.partyResources ?? {},
      partyTomes: state.partyTomes ?? [],
      home: state.home,
      monsterCompendium: state.monsterCompendium,
      world,
    });
    state.saveSlotId = saveSlotId;
    roomIsBuilt = false;
    const lostItemText = lostItems.length ? lostItems.map((item) => item.name).join(", ") : "no items";
    addLog(`${hero.name} retreats to camp, losing ${lostItemText} and ${moneyText(cpToMoney(lostCoins))}.`, "important");
    if (movedMaterials > 0) addLog(`${movedMaterials} material${movedMaterials === 1 ? "" : "s"} stay safe in the party's Material Satchel.`, "important");
    render();
    showTravelCampMenu();
    window.DepthboundPlaytest?.syncNow?.();
    centerViewOnHero();
    return;
  }
  state = createHomeState(rosterHeroes(), state.chest ?? [], state.chestMoney ?? {}, {
    ...state.party,
    worldDay: normalizeWorldDay(state.worldDay) + 1,
    campaignProgress: state.campaignProgress ?? {},
    questFlags: state.questFlags ?? {},
    partyResources: state.partyResources ?? {},
    partyTomes: state.partyTomes ?? [],
    home: state.home,
    monsterCompendium: state.monsterCompendium,
  });
  state.saveSlotId = saveSlotId;
  roomIsBuilt = false;
  const lostItemText = lostItems.length ? lostItems.map((item) => item.name).join(", ") : "no items";
  addLog(`${hero.name} retreats home, losing ${lostItemText} and ${moneyText(cpToMoney(lostCoins))}.`, "important");
  if (movedMaterials > 0) addLog(`${movedMaterials} material${movedMaterials === 1 ? "" : "s"} stay safe in the party's Material Satchel.`, "important");
  render();
  window.DepthboundPlaytest?.syncNow?.();
  centerViewOnHero();
}

async function loadAdventure(slotId) {
  showLoadingScreen("Loading Adventure", "Reading the save file.", "");
  try {
    const payload = await load(slotId);
    if (!payload) {
      hideLoadingScreen();
      updateSaveStatus("No saved adventure found.");
      return;
    }

    window.clearTimeout(monsterTurnTimer);
    activeSaveSlot = slotId;
    state = normalizeLoadedState(payload.state);
    selectedHeroIds = new Set([state.party.activeHeroId]);
    state.saveSlotId = slotId;
    updateLoadingScreen("Loading Adventure", "Preparing the world map.", "Old saves may need a one-time world upgrade.");
    await ensureWorldForLoadedSave(slotId).catch((error) => {
      console.warn("Could not upgrade old save with a world map.", error);
      updateSaveStatus("Loaded save, but the world map upgrade could not finish. Open Travel to try again.");
      return false;
    });
    showDungeonLayout = false;
    roomIsBuilt = false;
    hideMainMenu();
    addLog(`Loaded "${payload.name}".`, "important");
    render();
    hideLoadingScreen();
    window.DepthboundPlaytest?.syncNow?.();
    centerViewOnHero();
    maybeRunMonsterTurn();
  } catch (error) {
    hideLoadingScreen();
    updateSaveStatus("Could not load the saved adventure.");
  }
}

async function ensureWorldForLoadedSave(slotId = activeSaveSlot) {
  const worldTools = window.DepthboundWorldTravel;
  if (!worldTools?.createInitialWorldState) return false;
  const needsWorld = !state?.world || worldTools.worldNeedsRegeneration?.(state.world);
  if (!needsWorld) return false;
  const active = state?.fighters?.[state?.party?.activeHeroId] ?? state?.fighters?.hero;
  const heroName = String(active?.name ?? "hero").trim() || "hero";
  const replacingFallbackWorld = Boolean(state?.world);
  const initialWorld = await worldTools.createInitialWorldState({
    seed: state?.world?.seed || `save-upgrade:${slotId || "slot"}:${heroName}:${Date.now()}`,
    chunkWidth: 10,
    chunkHeight: 10,
  });
  state.world = worldTools.normalizeWorldState?.(initialWorld) ?? initialWorld;
  if (typeof travelEnsureHomeVillageState === "function") travelEnsureHomeVillageState(state.world);
  state.worldDay = normalizeWorldDay(state.worldDay);
  if (replacingFallbackWorld) {
    if (state.questFlags?.settlementBoards) delete state.questFlags.settlementBoards;
    addLog("The placeholder grassland world on this save has been replaced with a generated world map.", "important");
  } else {
    addLog("This older save has been upgraded with a world map, home village, and local quest-board territory.", "important");
  }
  return true;
}

async function saveAdventure(slotId = activeSaveSlot, options = {}) {
  if (state?.isTutorial) {
    updateSaveStatus("The interactive tutorial uses temporary data and cannot be saved.");
    return;
  }
  if (!slotId) return;
  if (!options.skipOverwriteWarning && !(await confirmSaveSlotOverwrite(slotId, "save"))) {
    updateSaveStatus("Save cancelled.");
    return;
  }
  const nameInput = els.saveSlots.querySelector(`#save-slot-name-${slotId}`);
  const slot = getSlots().find((entry) => entry.id === slotId);
  const slotName = options.slotName?.trim?.() || nameInput?.value.trim() || slot?.name || `Save Slot ${slotId}`;
  const savedAt = new Date().toLocaleString();
  activeSaveSlot = slotId;
  state.saveSlotId = state.saveSlotId ?? slotId;
  addLog(`Saved "${slotName}" at ${savedAt}.`, "important");
  let payload = null;
  try {
    payload = await save(slotId, slotName, state);
  } catch (error) {
    updateSaveStatus(error?.message ?? "Could not write the save file. Reconnect or choose a save folder and try again.");
    return;
  }
  render();
  updateSaveStatus(`Saved "${payload.name}" at ${new Date(payload.savedAt).toLocaleString()}.`);
}

async function deleteAdventure(slotId) {
  const slot = getSlots().find((entry) => entry.id === slotId);
  if (!slot?.hasSave) return;

  const confirmed = await showGameDialog({
    title: "Delete Saved Game",
    message: `Really delete "${slot.name}"? This cannot be undone.`,
    confirmText: "Delete Save",
    cancelText: "Keep Save",
  });
  if (!confirmed) {
    updateSaveStatus("Delete cancelled.");
    return;
  }

  await remove(slotId);
  render();
  updateSaveStatus(`Deleted "${slot.name}".`);
}

async function exportAdventure(slotId) {
  const slot = getSlots().find((entry) => entry.id === slotId);
  if (!slot?.hasSave) return;
  try {
    const bundle = await window.DungeonSave.exportCompleteSave(slotId);
    if (!bundle) {
      updateSaveStatus("No saved adventure found.");
      return;
    }
    downloadJsonFile(safeExportFilename(bundle.name, slotId), bundle);
    updateSaveStatus(`Exported "${bundle.name}" with ${bundle.files.length} file${bundle.files.length === 1 ? "" : "s"}.`);
  } catch (error) {
    updateSaveStatus(error?.message ?? "Could not export that save.");
  }
}

async function importAdventure(slotId) {
  const slot = getSlots().find((entry) => entry.id === slotId);
  if (slot?.hasSave) {
    updateSaveStatus("Choose an empty slot before importing.");
    return;
  }
  try {
    const bundle = await readJsonFileFromUser();
    if (!bundle) return;
    const payload = await window.DungeonSave.importCompleteSave(bundle, slotId);
    updateSaveStatus(`Imported "${payload.name}" into Slot ${slotId}.`);
  } catch (error) {
    updateSaveStatus(error?.message ?? "Could not import that save.");
  }
}

