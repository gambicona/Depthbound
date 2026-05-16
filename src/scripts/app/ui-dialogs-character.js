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
          ? "Folder-backed saves are not supported here. This does not work in Firefox yet; try Chrome or another Chromium browser on localhost/HTTPS. Legacy browser storage is still available with quota limits."
          : saveSystem.mode === "disconnected"
            ? `Reconnect save folder${saveSystem.directoryName ? ` "${saveSystem.directoryName}"` : ""} to save JSON files.`
            : "Choose a save folder to use JSON file saves.";
    const slotText = savedCount > 0 ? `${savedCount} save slot${savedCount === 1 ? "" : "s"} available.` : "No saved adventure found.";
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
      message: "Choose the save slot this game will use. Saves during this game will go to that slot unless you deliberately overwrite another one.",
      choices: slots.map((slot) => ({
        value: String(slot.id),
        label: `Slot ${slot.id}: ${slot.hasSave ? slot.name : "Empty"}`,
      })),
    });
    if (!selected) return null;
    const slotId = Number(selected);
    if (await confirmSaveSlotOverwrite(slotId, "new")) return slotId;
  }
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

function showMainMenuRoot() {
  els.menuActions?.classList.remove("hidden");
  els.mainMenuBack?.classList.add("hidden");
  els.saveSlots?.classList.add("hidden");
  els.mainSettings?.classList.add("hidden");
  renderSaveSlots();
}

function showMainMenuSubmenu(section) {
  els.menuActions?.classList.add("hidden");
  els.mainMenuBack?.classList.remove("hidden");
  els.saveSlots?.classList.toggle("hidden", section !== "load");
  els.mainSettings?.classList.toggle("hidden", section !== "settings");
  renderSaveSlots();
}

function randomizeMainMenuBackground() {
  if (!els.mainMenu || !mainMenuBackgrounds?.length) return;
  const background = mainMenuBackgrounds[Math.floor(Math.random() * mainMenuBackgrounds.length)];
  const backgroundUrl = new URL(background, window.location.href).href;
  els.mainMenu.style.setProperty("--main-menu-bg", `url("${backgroundUrl}")`);
}

async function chooseSaveFolderFromMenu() {
  try {
    const status = window.DungeonSave?.getStatus?.() ?? {};
    if (status.mode === "unsupported") {
      updateSaveStatus("Folder-backed saves do not work in Firefox yet. Try Chrome or another Chromium browser on localhost/HTTPS. Legacy browser saves are still available.");
      return false;
    }
    const connected = await window.DungeonSave.chooseSaveFolder();
    updateSaveStatus(connected ? "Save folder connected. JSON saves will be written there." : "Could not connect the save folder.");
    return connected;
  } catch (error) {
    updateSaveStatus(error?.message ?? "Could not choose a save folder.");
    return false;
  }
}

async function promptForSaveFolderIfNeeded() {
  const status = window.DungeonSave?.getStatus?.() ?? {};
  if (status.mode === "file" || status.mode === "unsupported") return true;
  const choice = await showTwoChoiceDialog({
    title: status.mode === "disconnected" ? "Reconnect Save Folder" : "Choose Save Folder",
    message:
      status.mode === "disconnected"
        ? `Depthbound needs permission for${status.directoryName ? ` "${status.directoryName}"` : " your save folder"} again before it can write JSON saves.`
        : "Choose a save folder now to keep your adventures as JSON files. You can continue with browser storage if you prefer.",
    primaryText: status.mode === "disconnected" ? "Reconnect Folder" : "Choose Folder",
    secondaryText: "Use Browser Storage",
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
  randomizeMainMenuBackground();
  document.body.classList.add("menu-active");
  els.mainMenu.classList.remove("hidden");
  showMainMenuRoot();
  updateSaveStatus(message);
  renderControls();
}

function hideMainMenu() {
  gameHasStarted = true;
  document.body.classList.remove("menu-active");
  els.mainMenu.classList.add("hidden");
  showMainMenuRoot();
  renderControls();
}

function showGameDialog({ title, message = "", input = null, confirmText = "OK", cancelText = "Cancel" }) {
  return new Promise((resolve) => {
    restoreDialogInputField();
    els.gameDialogTitle.textContent = title;
    els.gameDialogMessage.textContent = message;
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

function showTwoChoiceDialog({ title, message, primaryText, secondaryText }) {
  return new Promise((resolve) => {
    els.gameDialogTitle.textContent = title;
    els.gameDialogMessage.textContent = message;
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

function showHeroIdentityDialog({ title, message, nameValue, tokenArt = "", confirmText = "OK", cancelText = "Cancel" }) {
  return new Promise((resolve) => {
    els.gameDialogTitle.textContent = title;
    els.gameDialogMessage.textContent = message;
    els.gameDialogField.classList.remove("hidden");
    els.gameDialogActions.innerHTML = `
      <button type="submit" data-dialog-action="confirm">${escapeHtml(confirmText)}</button>
      <button type="button" class="ghost-button" data-dialog-action="cancel">${escapeHtml(cancelText)}</button>
    `;

    let selectedValue = selectionValueForHeroTokenArt(tokenArt);
    let errorText = "";
    let pendingFullDataUrl = "";
    let pendingImageSize = null;
    let pendingCrop = { x: 0.5, y: 0.5, zoom: 1 };
    let cropDrag = null;

    const currentName = () => els.gameDialogField.querySelector("[data-hero-identity-name]")?.value ?? nameValue ?? "";
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
            <p class="empty-note">Paste an image while this window is open, or choose an image file. Drag and zoom the picture inside the circle before saving it.</p>
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
      if (!button || button.dataset.dialogAction !== "cancel") return;
      cleanup(null);
    };

    const handleFieldChange = (event) => {
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
      if (deleteCustomHeroTokenArt(selectedValue)) {
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

function dialogMessageMarkup(message, actor = null) {
  return `${dialogActorMarkup(actor)}<p>${escapeHtml(message ?? "")}</p>`;
}

function showChoiceDialog({ title, message, choices, actor = null }) {
  return new Promise((resolve) => {
    els.gameDialogTitle.textContent = title;
    els.gameDialogMessage.innerHTML = actor ? dialogMessageMarkup(message, actor) : escapeHtml(message ?? "");
    els.gameDialogField.classList.add("hidden");
    els.gameDialogActions.innerHTML = choices
      .map(
        (choice) =>
          `<button type="button" class="${choice.value === dialogBackValue ? "ghost-button" : ""} ${choice.description ? "choice-with-description" : ""}" data-choice="${escapeAttribute(choice.value)}" ${
            choice.description ? `title="${escapeAttribute(choice.description)}"` : ""
          }>
            <b>${escapeHtml(choice.label)}</b>
            ${choice.description ? `<span class="choice-description">${escapeHtml(choice.description)}</span>` : ""}
          </button>`,
      )
      .join("");

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
    activeDialogCancel = () => cleanup(null);
    els.gameDialog.classList.remove("hidden");
    els.gameDialogActions.querySelector("[data-choice]")?.focus();
  });
}

function storyImageMarkup(images = []) {
  return images
    .slice(0, 2)
    .map((image) => `<img class="story-image" src="${escapeAttribute(image)}" alt="" />`)
    .join("");
}

function storyTextMarkup(text = "") {
  return String(text)
    .trim()
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
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
  if (goal.type === "killBoss") return { text: "Defeat the boss monster." };
  if (goal.type === "killMonsterType") {
    const target = Math.max(1, Number(goal.count) || 1);
    const monster = getMonsterTemplate(goal.monsterId);
    return { text: `Defeat ${target} ${monster?.name ?? goal.monsterId ?? "chosen monster"}${target === 1 ? "" : "s"} (0/${target}).` };
  }
  return { text: "Complete the dungeon goal." };
}

function showDungeonStoryDialog({ title, text = "", images = [], actionLabel = "Continue", goalText = "" }) {
  return new Promise((resolve) => {
    els.gameDialogTitle.textContent = title;
    els.gameDialogMessage.innerHTML = `
      <div class="story-dialog-content">
        ${storyImageMarkup(images)}
        ${text ? storyTextMarkup(text) : ""}
        ${goalText ? `<p class="story-goal"><b>Goal:</b> ${escapeHtml(goalText)}</p>` : ""}
      </div>
    `;
    els.gameDialogField.classList.add("hidden");
    els.gameDialogActions.innerHTML = `<button type="button" data-story-continue>${escapeHtml(actionLabel)}</button>`;
    const button = els.gameDialogActions.querySelector("[data-story-continue]");
    const cleanup = () => {
      button.removeEventListener("click", cleanup);
      els.gameDialog.classList.add("hidden");
      activeDialogCancel = null;
      resolve(true);
    };
    button.addEventListener("click", cleanup);
    activeDialogCancel = cleanup;
    els.gameDialog.classList.remove("hidden");
    button.focus();
  });
}

function showReactionPrompt({ actor = null, title = "Reaction", message = "", acceptLabel = "Use Reaction", declineLabel = "Skip" } = {}) {
  return new Promise((resolve) => {
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
  return window.DungeonContent
    .list("items")
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

function showTutorial() {
  els.gameDialogTitle.textContent = "Tutorial";
  els.gameDialogField.classList.add("hidden");
  els.gameDialogMessage.innerHTML = `
    <ul class="tutorial-list">
      <li>Pan the dungeon by grabbing and dragging the map. Use the + and - buttons in the top bar to zoom.</li>
      <li>Right-click enemies and dungeon objects to inspect details and available interactions.</li>
      <li>Open inventory from the character card button I in the right panel.</li>
      <li>At home, your chest appears in the upper-right corner and is also shown in the inventory screen.</li>
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
    title: "D20 Luck",
    message: "Choose how friendly d20 rolls behave. This can be changed later at the Planning Table.",
    choices: [
      { value: "karmic", label: "Karmic / Mercy Mode" },
      { value: "random", label: "Truly Random" },
      { value: "tymora", label: "Tymora's Favorite" },
      ...(allowBack ? [{ value: dialogBackValue, label: "Back" }] : []),
    ],
  });
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

function activeRaceFeatureLines(traits, selection = null) {
  const lines = [
    `Ability bonuses: ${abilityBonusSummary(traits.abilityBonuses)}`,
    `Speed: ${traits.speedFeet} ft`,
  ];
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
      const choiceSelects = Array.from({ length: abilityChoiceCount }, (_, index) => {
        const selectedAbility = current.abilityChoices[index] ?? "";
        return `
          <label>
            <span>Half-Elf +1 Ability ${index + 1}</span>
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
          renderField("Choose two different Half-Elf ability bonuses.");
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
    els.gameDialogMessage.textContent = "Choose the ancestry traits for this hero. The summary only lists mechanics currently active in this game.";
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
    choices: allowBack ? withBackChoice(choices) : choices,
  });
}

const interactiveTutorialSteps = [
  {
    title: "Welcome To The Table",
    body: "This tour uses a temporary tutorial party. It does not use a normal save slot, so you can poke around freely.",
    selector: ".arena",
    enter: () => switchInteractiveTutorialScene("dungeon"),
  },
  {
    title: "Move A Hero",
    body: "Drag a hero token through adjacent squares to move. Select several heroes with Shift, Ctrl, or Cmd, then drag one selected token to move the group.",
    selector: ".token.hero",
    enter: () => switchInteractiveTutorialScene("dungeon"),
  },
  {
    title: "Move The Map",
    body: "Grab empty map space and drag to pan. The zoom controls in the top bar change how much of the dungeon you can see.",
    selector: ".room-scroll",
    enter: () => switchInteractiveTutorialScene("dungeon"),
  },
  {
    title: "Open Inventory",
    body: "Use the I button on the hero card, or press I, to open inventory and equipment.",
    selector: ".open-inventory",
  },
  {
    title: "Inventory And Equipment",
    body: "Inventory shows carried items, equipped gear, money, and home chest storage. Items can be inspected and moved from here.",
    selector: "#inventory-menu .inventory-panel",
    enter: () => showInventoryMenu(),
  },
  {
    title: "Home Objects",
    body: "Now you are at home. Left-click or right-click the chest or planning table to inspect them.",
    selector: ".chest-token, .planning-table-token, .dungeon-object",
    enter: () => {
      hideInventoryMenu();
      switchInteractiveTutorialScene("home");
    },
  },
  {
    title: "Home Door",
    body: "Step onto the home door space, or click the door token while adjacent, to open choices for the merchant or venturing into another dungeon.",
    selector: ".exit-token",
    enter: () => switchInteractiveTutorialScene("home"),
  },
  {
    title: "Action Buttons",
    body: "The bottom bar changes with context. It handles initiative, attacks, other actions, items, abilities, resting, fleeing, and ending turns. If several monsters are in weapon range, press Tab to switch targets.",
    selector: ".action-dock",
  },
  {
    title: "Menus And Controls",
    body: "The top bar has save, main menu, zoom, admin tools, and the text tutorial. Main Menu exits this tour.",
    selector: ".top-actions",
  },
];

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
    state = createHomeState(heroes, chest, chestMoney, { ...party, campaignProgress: loadedState.campaignProgress ?? {} });
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
  const step = interactiveTutorialSteps[interactiveTutorialStep];
  if (!step) return;

  step.enter?.();
  els.tutorialTourStep.textContent = `Tutorial ${interactiveTutorialStep + 1} / ${interactiveTutorialSteps.length}`;
  els.tutorialTourTitle.textContent = step.title;
  els.tutorialTourBody.textContent = step.body;
  els.tutorialTourBack.disabled = interactiveTutorialStep === 0;
  els.tutorialTourNext.textContent = interactiveTutorialStep === interactiveTutorialSteps.length - 1 ? "Done" : "Next";

  window.requestAnimationFrame(() => {
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
  });
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
      Scores: ${sortedScores.map(escapeHtml).join(", ")}
      <br><span class="empty-note">${escapeHtml(raceDisplayName(raceSelection))}: ${escapeHtml(abilityBonusSummary(raceAbilityBonuses(raceSelection)))}</span>
    `;
    els.gameDialogField.classList.add("hidden");
    els.gameDialogActions.innerHTML = `
      <div class="ability-assignment">
        ${renderAbilityAssignmentFields(sortedScores, raceSelection)}
        <p class="ability-assignment-error" aria-live="polite"></p>
      </div>
      <button type="submit" data-dialog-action="confirm">Start Adventure</button>
      <button type="button" class="ghost-button" data-dialog-action="cancel">Back</button>
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
      const button = event.target.closest("[data-dialog-action='cancel']");
      if (button) cleanup(null);
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
  if (casterType === "full") return level === 1 ? 2 : 1;
  if (casterType === "half") return level === 1 || (level > 1 && level % 2 === 1) ? 1 : 0;
  if (casterType === "pact") return level === 1 ? 2 : level >= 3 && level <= 17 && level % 2 === 1 ? 1 : 0;
  return 0;
}

function cantripChoiceCountForClassLevel(classId, level) {
  const template = getHeroTemplate(classId);
  if (!(template.cantripList ?? []).length) return 0;
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

async function chooseClassSpells(classSource, count, chosenSpellIds = []) {
  const chosen = [...chosenSpellIds];
  let unusedCredits = 0;
  for (let index = 0; index < count; index += 1) {
    const eligible = eligibleSpellChoicesFor(classSource, chosen);
    if (!eligible.length) {
      unusedCredits += 1;
      continue;
    }
    const choice = await showChoiceDialog({
      title: "Choose Spell",
      message: `Choose a ${classSource.className ?? "class"} spell (${index + 1}/${count}).`,
      choices: eligible.map((spell) => ({
        value: spell.id,
        label: `${spell.name} (L${spellBaseLevel(spell)})`,
        description: spellChoiceDescription(spell),
      })),
    });
    if (!choice) {
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

async function chooseClassCantrips(classSource, count, chosenSpellIds = []) {
  const chosen = [...chosenSpellIds];
  let unusedCredits = 0;
  for (let index = 0; index < count; index += 1) {
    const eligible = eligibleCantripChoicesFor(classSource, chosen);
    if (!eligible.length) {
      unusedCredits += 1;
      continue;
    }
    const choice = await showChoiceDialog({
      title: "Choose Cantrip",
      message: `Choose a ${classSource.className ?? "class"} cantrip (${index + 1}/${count}).`,
      choices: eligible.map((spell) => ({ value: spell.id, label: spell.name, description: spellChoiceDescription(spell) })),
    });
    if (!choice) {
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
    choices,
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
      choices: available.map((id) => ({ value: `${valuePrefix}${id}`, label: valuePrefix === "tool:" ? toolName(id) : skillName(id) })),
    });
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
    const choice = await showChoiceDialog({ title, message: `${message} (${index + 1}/${count})`, choices });
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
  if (!gained) {
    hero.unusedExpertiseChoiceCredits = count;
    return " Expertise choice deferred.";
  }
  hero.expertiseSkills = uniqueValues([...(hero.expertiseSkills ?? []), ...gained.skills]);
  hero.expertiseTools = uniqueValues([...(hero.expertiseTools ?? []), ...gained.tools]);
  hero.unusedExpertiseChoiceCredits = Math.max(0, count - gained.skills.length - gained.tools.length);
  const labels = [...gained.skills.map(skillName), ...gained.tools.map(toolName)];
  return labels.length ? ` Expertise gained: ${labels.join(", ")}.` : "";
}

async function createCharacterOptions(raceSelection = defaultRaceSelection, classId = defaultContent.heroClass) {
  let step = 0;
  let choice = null;
  let abilityScores = null;
  while (true) {
    while (step >= 0 && step < 2) {
      if (step === 0) {
        choice = await showChoiceDialog({
          title: "Ability Scores",
          message: "Choose how to create your fighter's STR, DEX, CON, INT, WIS, and CHA.",
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
        if (!abilityScores) step -= 1;
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
      if (!proficiencyOptions) return null;
      const classTemplate = getHeroTemplate(classId);
      const classSpellList = [...(classTemplate.classSpellList ?? classTemplate.spellList ?? classTemplate.spells ?? [])];
      const classCantripList = [...(classTemplate.classCantripList ?? classTemplate.cantripList ?? [])];
      const spellChoiceCount = spellChoiceCountForClassLevel(classId, 1);
      const spellChoice = spellChoiceCount ? await chooseClassSpells({ ...classTemplate, classSpellList, level: 1 }, spellChoiceCount) : { spells: [], unusedCredits: 0 };
      const cantripChoiceCount = cantripChoiceCountForClassLevel(classId, 1);
      const cantripChoice = cantripChoiceCount
        ? await chooseClassCantrips({ ...classTemplate, classCantripList, level: 1 }, cantripChoiceCount)
        : { spells: [], unusedCredits: 0 };
      const fightingStyle = await chooseFightingStyle(classId);
      return {
        abilityScores,
        fightingStyle,
        classSpellList,
        classCantripList,
        spells: [...cantripChoice.spells, ...spellChoice.spells],
        unusedSpellChoiceCredits: spellChoice.unusedCredits,
        unusedCantripChoiceCredits: cantripChoice.unusedCredits,
        ...proficiencyOptions,
        ...gearOptions,
      };
    }
    return null;
  }
}

async function startNewAdventure() {
  window.clearTimeout(monsterTurnTimer);
  if (!(await promptForSaveFolderIfNeeded())) return;
  const slotId = await chooseSaveSlotForAdventure();
  if (!slotId) return;
  let chosenName = "";
  let heroOptions = null;
  let chosenTokenArt = "";
  let raceSelection = defaultRaceSelection;
  let classId = defaultContent.heroClass;
  while (!heroOptions) {
    const identity = await showHeroIdentityDialog({
      title: "Character Name",
      message: "Name your adventurer before stepping into the dungeon.",
      nameValue: chosenName || getHeroTemplate().name,
      tokenArt: chosenTokenArt,
      confirmText: "Start Adventure",
    });
    if (!identity) return;
    chosenName = identity.name || getHeroTemplate().name;
    chosenTokenArt = identity.tokenArt;
    const chosenClass = await showHeroClassDialog();
    if (chosenClass === dialogBackValue) {
      heroOptions = null;
      continue;
    }
    if (!chosenClass) return;
    classId = chosenClass;
    const chosenRace = await showHeroRaceDialog({ selection: raceSelection });
    if (chosenRace === dialogBackValue) {
      heroOptions = null;
      continue;
    }
    if (!chosenRace) return;
    raceSelection = chosenRace;
    heroOptions = await createCharacterOptions(raceSelection, classId);
    if (heroOptions === dialogBackValue) {
      heroOptions = null;
      continue;
    }
    if (!heroOptions) return;
  }
  const d20Mode = await showD20ModeDialog({ allowBack: false });
  if (!d20Mode) return;
  heroOptions.d20Mode = normalizeD20Mode(d20Mode);
  heroOptions.classId = classId;
  heroOptions.tokenArt = chosenTokenArt;
  heroOptions.raceSelection = raceSelection;
  showDungeonLayout = false;
  const initialDungeonState = createInitialState(chosenName, null, heroOptions);
  state = createHomeState([initialDungeonState.fighters.hero], [], { cp: 0, sp: 0, gp: 0 }, initialDungeonState.party);
  state.saveSlotId = slotId;
  activeSaveSlot = slotId;
  await saveAdventure(slotId, { skipOverwriteWarning: true });
  try {
    await saveQuickstart(state);
  } catch (error) {
    updateSaveStatus(error?.message ?? "Could not write the dungeon restart save.");
  }
  roomIsBuilt = false;
  hideMainMenu();
  render();
  centerViewOnHero();
}

function availableDungeonThemes() {
  return window.DungeonContent
    .list("themes")
    .filter((theme) => !theme.hidden)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function availableCustomDungeons() {
  return window.DungeonCustom?.list?.() ?? [];
}

async function chooseDungeonChoice() {
  const themes = availableDungeonThemes();
  const customDungeons = availableCustomDungeons();
  const choices = [
    ...themes.map((theme) => ({ value: `theme:${theme.id}`, label: theme.name })),
    ...customDungeons.map((dungeon) => ({ value: `custom:${dungeon.id}`, label: `Custom: ${dungeon.name}` })),
  ];
  if (choices.length <= 1) return choices[0]?.value ?? `theme:${defaultContent.theme}`;
  return showChoiceDialog({
    title: "Choose Dungeon",
    message: "Where do you want to venture next?",
    choices,
  });
}

async function startNewDungeonWithHero() {
  const partyIds = state.party?.heroIds ?? ["hero"];
  const partyMembers = partyIds.map((id) => state.fighters[id]).filter((hero) => hero && !hero.dead);
  if (partyMembers.length === 0) {
    addLog("Choose at least one hero at the Planning Table before venturing out.", "important");
    render();
    return;
  }
  const choice = await chooseDungeonChoice();
  if (!choice) return;
  const previousState = state;
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
    state = createDungeonStateForParty(partyMembers, state, choice.replace(/^theme:/, ""));
  }
  if (!state) {
    state = previousState;
    addLog("That custom dungeon could not be loaded.", "important");
    render();
    return;
  }
  try {
    await saveQuickstart(state);
  } catch (error) {
    updateSaveStatus(error?.message ?? "Could not write the dungeon restart save.");
  }
  roomIsBuilt = false;
  hideHomeMenu();
  addLog(`${partyMembers.map((hero) => hero.name).join(", ")} leave home for ${state.customDungeon?.name ?? getContentDefinition("themes", state.themeId)?.name ?? "a new dungeon"}.`, "important");
  render();
  centerViewOnHero();
}

async function showCampaignMenu(campaignId) {
  const campaign = window.DungeonCampaigns?.get(campaignId);
  if (!campaign) return;
  const completed = state.campaignProgress?.[campaign.id] ?? 0;
  const entries = await Promise.all(Array.from({ length: campaign.count }, (_, index) => window.DungeonCampaigns.dungeon(campaign.id, index + 1)));
  return new Promise((resolve) => {
    els.gameDialogForm.classList.add("campaign-dialog");
    els.gameDialogTitle.textContent = campaign.name;
    els.gameDialogMessage.textContent = campaign.description;
    els.gameDialogMessage.classList.add("campaign-dialog-message");
    els.gameDialogField.classList.add("hidden");
    els.gameDialogActions.classList.add("campaign-dungeon-list");
    els.gameDialogActions.innerHTML = entries
      .map((entry, index) => {
        const number = index + 1;
        const unlocked = number <= completed + 1;
        return `<button type="button" data-campaign-dungeon="${number}" ${unlocked ? "" : "disabled"}>${number}. ${escapeHtml(entry?.name ?? `Dungeon ${number}`)}${number <= completed ? " ✓" : unlocked ? "" : " 🔒"}</button>`;
      })
      .join("");
    const cleanup = (value) => {
      els.gameDialogActions.removeEventListener("click", handleClick);
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
  });
}

async function startCampaignDungeon(campaignId) {
  const dungeonIndex = await showCampaignMenu(campaignId);
  if (!dungeonIndex) return;
  const template = await window.DungeonCampaigns?.dungeon(campaignId, dungeonIndex);
  if (!template) return;
  const partyIds = state.party?.heroIds ?? ["hero"];
  const partyMembers = partyIds.map((id) => state.fighters[id]).filter((hero) => hero && !hero.dead);
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
  try {
    await saveQuickstart(state);
  } catch (error) {
    updateSaveStatus(error?.message ?? "Could not write the dungeon restart save.");
  }
  roomIsBuilt = false;
  hideHomeMenu();
  addLog(`${partyMembers.map((hero) => hero.name).join(", ")} leave home for ${template.name}.`, "important");
  render();
  centerViewOnHero();
}

async function returnHomeEarly() {
  if (state.mode === "home" || state.mode === "combat" || !gameHasStarted) return;
  const confirmed = await showGameDialog({
    title: "Return Home",
    message: "Return home now? Half your carried bag items and half your carried coins will be lost. Equipped items and home chest contents are safe.",
    confirmText: "Return Home",
    cancelText: "Stay Here",
  });
  if (!confirmed) return;

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
  state = createHomeState(rosterHeroes(), state.chest ?? [], state.chestMoney ?? {}, { ...state.party, campaignProgress: state.campaignProgress ?? {} });
  state.saveSlotId = saveSlotId;
  roomIsBuilt = false;
  const lostItemText = lostItems.length ? lostItems.map((item) => item.name).join(", ") : "no items";
  addLog(`${hero.name} retreats home, losing ${lostItemText} and ${moneyText(cpToMoney(lostCoins))}.`, "important");
  render();
  centerViewOnHero();
}

async function loadAdventure(slotId) {
  try {
    const payload = await load(slotId);
    if (!payload) {
      updateSaveStatus("No saved adventure found.");
      return;
    }

    window.clearTimeout(monsterTurnTimer);
    activeSaveSlot = slotId;
    state = normalizeLoadedState(payload.state);
    selectedHeroIds = new Set([state.party.activeHeroId]);
    state.saveSlotId = slotId;
    showDungeonLayout = false;
    roomIsBuilt = false;
    hideMainMenu();
    addLog(`Loaded "${payload.name}".`, "important");
    render();
    centerViewOnHero();
    maybeRunMonsterTurn();
  } catch (error) {
    updateSaveStatus("Could not load the saved adventure.");
  }
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
  const slotName = nameInput?.value.trim() || slot?.name || `Save Slot ${slotId}`;
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

  await remove(slotId);
  render();
  updateSaveStatus(`Deleted "${slot.name}".`);
}

