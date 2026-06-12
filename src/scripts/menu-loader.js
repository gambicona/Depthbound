(() => {
  const gameScriptSelector = "script[data-depthbound-src]";
  const gameScriptVersion = "menu-fast-1";
  let gameLoadPromise = null;
  const lazyScriptPromises = new Map();

  const $ = (selector) => document.querySelector(selector);
  const els = {
    mainMenu: $("#main-menu"),
    mainMenuBack: $("#main-menu-back"),
    menuActions: $(".menu-actions"),
    startAdventure: $("#start-adventure"),
    loadMenu: $("#load-menu"),
    saveSlots: $("#save-slots"),
    saveStatus: $("#save-status"),
    achievementsMenu: $("#achievements-menu"),
    achievementsPanel: $("#main-achievements"),
    mainTutorial: $("#main-tutorial"),
    readComicMenu: $("#read-comic-menu"),
    comicsPanel: $("#main-comics"),
    settingsMenu: $("#settings-menu"),
    settingsPanel: $("#main-settings"),
    buttonThemeSelect: $("#button-theme-select"),
    volumeSliders: [...document.querySelectorAll(".volume-slider")],
    volumeLabels: [...document.querySelectorAll(".volume-label")],
    chooseSaveFolder: $("#choose-save-folder"),
    loadingScreen: $("#loading-screen"),
    loadingTitle: $("#loading-title"),
    loadingMessage: $("#loading-message"),
    loadingDetail: $("#loading-detail"),
  };

  function setSaveStatus(message = "") {
    if (els.saveStatus) els.saveStatus.textContent = message;
  }

  function showLoading(title = "Loading", message = "Preparing the adventure.", detail = "") {
    if (!els.loadingScreen) return;
    if (els.loadingTitle) els.loadingTitle.textContent = title;
    if (els.loadingMessage) els.loadingMessage.textContent = message;
    if (els.loadingDetail) els.loadingDetail.textContent = detail;
    els.loadingScreen.classList.remove("hidden");
  }

  function hideLoading() {
    els.loadingScreen?.classList.add("hidden");
  }

  function showMainMenuRoot() {
    els.menuActions?.classList.remove("hidden");
    els.mainMenuBack?.classList.add("hidden");
    els.saveSlots?.classList.add("hidden");
    els.comicsPanel?.classList.add("hidden");
    els.achievementsPanel?.classList.add("hidden");
    els.settingsPanel?.classList.add("hidden");
    els.loadMenu?.setAttribute("aria-expanded", "false");
    els.achievementsMenu?.setAttribute("aria-expanded", "false");
    els.readComicMenu?.setAttribute("aria-expanded", "false");
    els.settingsMenu?.setAttribute("aria-expanded", "false");
  }

  function showMainMenuSubmenu(section) {
    els.menuActions?.classList.add("hidden");
    els.mainMenuBack?.classList.remove("hidden");
    els.saveSlots?.classList.toggle("hidden", section !== "load");
    els.comicsPanel?.classList.toggle("hidden", section !== "comics");
    els.achievementsPanel?.classList.toggle("hidden", section !== "achievements");
    els.settingsPanel?.classList.toggle("hidden", section !== "settings");
    els.loadMenu?.setAttribute("aria-expanded", String(section === "load"));
    els.achievementsMenu?.setAttribute("aria-expanded", String(section === "achievements"));
    els.readComicMenu?.setAttribute("aria-expanded", String(section === "comics"));
    els.settingsMenu?.setAttribute("aria-expanded", String(section === "settings"));
  }

  function formatSavedAt(value) {
    if (!value) return "Empty";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Saved adventure" : date.toLocaleString();
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function renderSaveSlots() {
    const slots = window.DungeonSave?.getSlots?.() ?? [];
    if (!els.saveSlots) return;
    els.saveSlots.innerHTML = slots
      .map((slot) => `
        <article class="save-slot ${slot.hasSave ? "" : "empty"}">
          <div>
            <strong>${escapeHtml(slot.name ?? `Save Slot ${slot.id}`)}</strong>
            <span>${formatSavedAt(slot.savedAt)}</span>
          </div>
          <div class="save-slot-actions">
            <button type="button" data-action="load-slot" data-slot="${slot.id}" ${slot.hasSave ? "" : "disabled"}>Load</button>
          </div>
        </article>
      `)
      .join("");
  }

  function updateSaveStatus() {
    const status = window.DungeonSave?.getStatus?.();
    if (!status) {
      setSaveStatus("Save system is starting.");
      return;
    }
    const readyText = `${window.DungeonSave?.slotCount ?? 3} save slots ready.`;
    if (status.mode === "file") {
      setSaveStatus(`Folder saves are ready${status.directoryName ? ` in "${status.directoryName}"` : ""}. ${readyText}`);
      return;
    }
    if (status.mode === "disconnected") {
      setSaveStatus(`Save folder permission is missing. Browser saves are still available. ${readyText}`);
      return;
    }
    setSaveStatus(`Browser saves are ready. Folder saves work in Chrome or another Chromium browser. ${readyText}`);
  }

  function loadScript(src) {
    if (lazyScriptPromises.has(src)) return lazyScriptPromises.get(src);
    const promise = new Promise((resolve, reject) => {
      if ([...document.scripts].some((script) => script.src.endsWith(src) || script.dataset.loadedSrc === src)) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.defer = false;
      script.dataset.loadedSrc = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Could not load ${src}`));
      document.body.append(script);
    });
    lazyScriptPromises.set(src, promise);
    return promise;
  }

  function loadGameScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.defer = false;
      script.dataset.loadedByMenu = gameScriptVersion;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Could not load ${src}`));
      document.body.append(script);
    });
  }

  async function ensureGameLoaded() {
    if (window.DepthboundAppLoaded) return;
    if (!gameLoadPromise) {
      gameLoadPromise = (async () => {
        const scripts = [...document.querySelectorAll(gameScriptSelector)].map((script) => script.dataset.depthboundSrc).filter(Boolean);
        const total = scripts.length;
        for (let index = 0; index < total; index += 1) {
          const src = scripts[index];
          if (els.loadingDetail) els.loadingDetail.textContent = `Loading game code ${index + 1}/${total}`;
          await loadGameScript(src);
        }
      })().catch((error) => {
        gameLoadPromise = null;
        throw error;
      });
    }
    await gameLoadPromise;
  }

  async function runGameAction(event, title, message, action) {
    event?.preventDefault();
    event?.stopImmediatePropagation();
    showLoading(title, message);
    try {
      await ensureGameLoaded();
      await action();
    } catch (error) {
      console.error(error);
      setSaveStatus("The game could not finish loading. Refresh the page and try again.");
      hideLoading();
    }
  }

  function applyLightweightSettings() {
    const buttonTheme = window.localStorage.getItem("dungeonCrawler.buttonTheme.v1") || "verdigris";
    const soundVolume = Math.max(0, Math.min(1, Number(window.localStorage.getItem("dungeonCrawler.soundVolume.v1") ?? 0.5)));
    const localWorkshopTools = ["localhost", "127.0.0.1", ""].includes(window.location.hostname) || window.location.protocol === "file:";
    document.body.dataset.buttonTheme = buttonTheme;
    document.body.classList.toggle("workshop-tools-enabled", localWorkshopTools);
    if (els.buttonThemeSelect) els.buttonThemeSelect.value = buttonTheme;
    els.volumeSliders.forEach((slider) => {
      slider.value = String(Math.round(soundVolume * 100));
    });
    els.volumeLabels.forEach((label) => {
      label.textContent = `${Math.round(soundVolume * 100)}%`;
    });
  }

  window.DepthboundLazyScripts = {
    load: loadScript,
    loadCustomDungeons: () => loadScript("src/scripts/custom-dungeons.js"),
    loadCustomItems: () => loadScript("src/scripts/custom-items.js"),
  };

  function bindMenu() {
    applyLightweightSettings();
    showMainMenuRoot();

    window.DungeonSave?.ready?.finally(() => {
      renderSaveSlots();
      updateSaveStatus();
    });

    els.mainMenuBack?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      showMainMenuRoot();
    });
    els.loadMenu?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      renderSaveSlots();
      showMainMenuSubmenu("load");
    });
    els.settingsMenu?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      showMainMenuSubmenu("settings");
    });
    els.readComicMenu?.addEventListener("click", (event) => {
      void runGameAction(event, "Loading Comics", "Opening the comic reader.", async () => {
        window.showMainMenuSubmenu?.("comics");
      });
    });
    els.achievementsMenu?.addEventListener("click", (event) => {
      void runGameAction(event, "Loading Achievements", "Opening the achievement archive.", async () => {
        if (window.DepthboundAchievements?.show) window.DepthboundAchievements.show();
        else window.showMainMenuSubmenu?.("achievements");
      });
    });
    els.mainTutorial?.addEventListener("click", (event) => {
      void runGameAction(event, "Loading Tutorial", "Preparing the training dungeon.", async () => {
        await window.startInteractiveTutorial?.();
      });
    });
    els.startAdventure?.addEventListener("click", (event) => {
      void runGameAction(event, "Starting Adventure", "Loading heroes, dungeons, and world tools.", async () => {
        await window.startNewAdventure?.();
      });
    });
    els.saveSlots?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-action='load-slot']");
      if (!button) return;
      const slotId = Number(button.dataset.slot);
      void runGameAction(event, "Loading Save", `Opening Save Slot ${slotId}.`, async () => {
        await window.loadAdventure?.(slotId);
      });
    });
    els.chooseSaveFolder?.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      try {
        await window.DungeonSave?.chooseSaveFolder?.();
        renderSaveSlots();
        updateSaveStatus();
      } catch (error) {
        console.error(error);
        setSaveStatus("Could not connect the save folder.");
      }
    });
    els.buttonThemeSelect?.addEventListener("change", (event) => {
      const theme = event.target.value || "verdigris";
      document.body.dataset.buttonTheme = theme;
      window.localStorage.setItem("dungeonCrawler.buttonTheme.v1", theme);
    });
    els.volumeSliders.forEach((slider) => {
      slider.addEventListener("input", (event) => {
        const volume = Math.max(0, Math.min(1, Number(event.target.value) / 100));
        window.localStorage.setItem("dungeonCrawler.soundVolume.v1", String(volume));
        els.volumeSliders.forEach((linkedSlider) => {
          if (linkedSlider !== event.target) linkedSlider.value = event.target.value;
        });
        els.volumeLabels.forEach((label) => {
          label.textContent = `${Math.round(volume * 100)}%`;
        });
      });
    });
    window.addEventListener("dungeon-save-slots-updated", () => {
      renderSaveSlots();
      updateSaveStatus();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bindMenu, { once: true });
  else bindMenu();
})();
