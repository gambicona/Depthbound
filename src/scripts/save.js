(() => {
const legacyStoragePrefix = "dungeonCrawler.saveSlot.v1.";
const legacyQuickstartKey = "dungeonCrawler.quickstart.v1";
const metadataKey = "dungeonCrawler.saveSystem.v2";
const idbName = "depthbound-save-system";
const idbStore = "handles";
const directoryHandleKey = "save-directory";
const slotCount = 4;
const schemaVersion = 2;
const quickstartFilename = "depthbound-quickstart.json";
const slotFilename = (slotId) => `depthbound-slot-${slotId}.json`;

const state = {
  mode: "legacy",
  supported: typeof window.showDirectoryPicker === "function" && typeof window.indexedDB !== "undefined",
  directoryHandle: null,
  directoryName: "",
  permission: "unknown",
  slots: Array.from({ length: slotCount }, (_, index) => ({ id: index + 1, name: `Save Slot ${index + 1}`, savedAt: null, hasSave: false })),
  tokenUrls: new Map(),
  lastError: "",
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function metadata() {
  try {
    return JSON.parse(window.localStorage.getItem(metadataKey) ?? "{}");
  } catch {
    return {};
  }
}

function saveMetadata(next) {
  window.localStorage.setItem(metadataKey, JSON.stringify({ ...metadata(), ...next, schemaVersion }));
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(idbName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(idbStore);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function idbGet(key) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(idbStore, "readonly");
    const request = transaction.objectStore(idbStore).get(key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result ?? null);
    transaction.oncomplete = () => db.close();
  });
}

async function idbSet(key, value) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(idbStore, "readwrite");
    transaction.objectStore(idbStore).put(value, key);
    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
  });
}

function legacyLoad(slotId) {
  const raw = window.localStorage.getItem(`${legacyStoragePrefix}${slotId}`);
  if (!raw) return null;
  const payload = JSON.parse(raw);
  if (!payload.state) throw new Error("Unsupported legacy save file.");
  return sanitizeSavePayload({ ...payload, schemaVersion: payload.schemaVersion ?? payload.version ?? 1, slotId });
}

function legacyLoadQuickstart() {
  const raw = window.localStorage.getItem(legacyQuickstartKey);
  if (!raw) return null;
  const payload = JSON.parse(raw);
  if (!payload.state) throw new Error("Unsupported legacy quickstart save.");
  return sanitizeSavePayload({ ...payload, schemaVersion: payload.schemaVersion ?? payload.version ?? 1 });
}

function sanitizeTokenValue(value) {
  if (!value) return "";
  if (typeof value === "string") return state.mode === "file" && value.startsWith("data:image/") ? "" : value;
  if (typeof value !== "object") return "";
  if (value.type === "custom-file" && value.path) {
    return {
      type: "custom-file",
      path: String(value.path),
      id: value.id ? String(value.id) : "",
      name: value.name ? String(value.name) : "Custom token",
      crop: value.crop && typeof value.crop === "object" ? { ...value.crop } : undefined,
    };
  }
  if (value.dataUrl && typeof value.dataUrl === "string") return value.dataUrl;
  return "";
}

function sanitizeFighterTokens(saveState) {
  for (const fighter of Object.values(saveState?.fighters ?? {})) {
    fighter.tokenArt = sanitizeTokenValue(fighter.tokenArt);
    delete fighter.fullDataUrl;
    delete fighter.fullName;
    delete fighter.tokenImageData;
    delete fighter.originalTokenArt;
  }
}

function sanitizeSavePayload(payload) {
  const next = clone(payload);
  sanitizeFighterTokens(next.state);
  return next;
}

async function migrateStateTokenImages(saveState) {
  if (state.mode !== "file" || !state.directoryHandle) return;
  for (const fighter of Object.values(saveState?.fighters ?? {})) {
    if (typeof fighter.tokenArt !== "string" || !fighter.tokenArt.startsWith("data:image/")) continue;
    try {
      const id = `hero-token-${fighter.id ?? Date.now()}-${Date.now()}`;
      const blob = await (await fetch(fighter.tokenArt)).blob();
      const path = await writeTokenFile(id, blob);
      if (path) fighter.tokenArt = { type: "custom-file", id, path, name: `${fighter.name ?? "Hero"} token` };
    } catch (error) {
      console.warn("Could not move embedded token image into save folder.", error);
    }
  }
}

async function payloadForSlot(slotId, name, saveState) {
  const cleanState = clone(saveState);
  await migrateStateTokenImages(cleanState);
  sanitizeFighterTokens(cleanState);
  return {
    schemaVersion,
    version: schemaVersion,
    slotId,
    name: String(name ?? "").trim() || `Save Slot ${slotId}`,
    savedAt: new Date().toISOString(),
    format: { app: "Depthbound", storage: state.mode },
    state: cleanState,
  };
}

async function ensureSaveTree() {
  if (!state.directoryHandle) throw new Error("Save folder not selected.");
  await state.directoryHandle.getDirectoryHandle("tokens", { create: true });
}

async function verifyPermission(handle, write = true) {
  if (!handle) return "denied";
  const options = { mode: write ? "readwrite" : "read" };
  if ((await handle.queryPermission?.(options)) === "granted") return "granted";
  return "prompt";
}

async function requestPermission(handle, write = true) {
  if (!handle) return "denied";
  const options = { mode: write ? "readwrite" : "read" };
  if ((await handle.queryPermission?.(options)) === "granted") return "granted";
  if ((await handle.requestPermission?.(options)) === "granted") return "granted";
  return "denied";
}

async function readJsonFile(filename) {
  if (!state.directoryHandle) return null;
  try {
    const handle = await state.directoryHandle.getFileHandle(filename);
    const file = await handle.getFile();
    const payload = JSON.parse(await file.text());
    if (!payload.state) throw new Error("Save file missing game state.");
    return sanitizeSavePayload(payload);
  } catch (error) {
    if (error?.name === "NotFoundError") return null;
    state.lastError = `Could not read ${filename}.`;
    console.warn(state.lastError, error);
    return null;
  }
}

async function writeJsonFile(filename, payload) {
  if (!state.directoryHandle) throw new Error("Save folder not selected.");
  const handle = await state.directoryHandle.getFileHandle(filename, { create: true });
  const writable = await handle.createWritable();
  await writable.write(JSON.stringify(payload, null, 2));
  await writable.close();
}

async function refreshSlots() {
  if (state.mode === "file" && state.directoryHandle) {
    const slots = [];
    for (let index = 0; index < slotCount; index += 1) {
      const slotId = index + 1;
      const payload = await readJsonFile(slotFilename(slotId));
      slots.push({
        id: slotId,
        name: payload?.name ?? `Save Slot ${slotId}`,
        savedAt: payload?.savedAt ?? null,
        hasSave: Boolean(payload),
      });
    }
    state.slots = slots;
    window.dispatchEvent(new CustomEvent("dungeon-save-slots-updated"));
    return slots;
  }

  state.slots = Array.from({ length: slotCount }, (_, index) => {
    const slotId = index + 1;
    let payload = null;
    try {
      payload = legacyLoad(slotId);
    } catch (error) {
      console.warn("Invalid legacy save.", error);
    }
    return { id: slotId, name: payload?.name ?? `Save Slot ${slotId}`, savedAt: payload?.savedAt ?? null, hasSave: Boolean(payload) };
  });
  window.dispatchEvent(new CustomEvent("dungeon-save-slots-updated"));
  return state.slots;
}

async function migrateLegacySaves() {
  if (state.mode !== "file" || !state.directoryHandle) return;
  for (let index = 0; index < slotCount; index += 1) {
    const slotId = index + 1;
    const existing = await readJsonFile(slotFilename(slotId));
    if (existing) continue;
    const legacy = legacyLoad(slotId);
    if (!legacy) continue;
    const payload = await payloadForSlot(slotId, legacy.name, legacy.state);
    await writeJsonFile(slotFilename(slotId), { ...payload, format: { app: "Depthbound", storage: "migrated-localStorage" } });
  }
  const quickstart = await readJsonFile(quickstartFilename);
  const legacyQuickstart = legacyLoadQuickstart();
  if (!quickstart && legacyQuickstart) {
    const payload = await payloadForSlot(0, legacyQuickstart.name ?? "Dungeon Restart", legacyQuickstart.state);
    await writeJsonFile(quickstartFilename, { ...payload, format: { app: "Depthbound", storage: "migrated-localStorage" } });
  }
  saveMetadata({ migrationComplete: true });
}

async function connectDirectoryHandle(handle, requestAccess = false) {
  state.directoryHandle = handle;
  state.directoryName = handle?.name ?? "Save folder";
  state.permission = requestAccess ? await requestPermission(handle) : await verifyPermission(handle);
  if (state.permission !== "granted") {
    state.mode = "disconnected";
    saveMetadata({ mode: state.mode, directoryName: state.directoryName });
    await refreshSlots();
    return false;
  }
  state.mode = "file";
  saveMetadata({ mode: state.mode, directoryName: state.directoryName });
  await ensureSaveTree();
  await migrateLegacySaves();
  await refreshSlots();
  return true;
}

async function init() {
  const meta = metadata();
  state.directoryName = meta.directoryName ?? "";
  if (!state.supported) {
    state.mode = "unsupported";
    await refreshSlots();
    return;
  }
  try {
    const handle = await idbGet(directoryHandleKey);
    if (handle) {
      await connectDirectoryHandle(handle, false);
    } else {
      state.mode = "legacy";
      await refreshSlots();
    }
  } catch (error) {
    state.lastError = "Could not reconnect save folder.";
    console.warn(state.lastError, error);
    state.mode = "legacy";
    await refreshSlots();
  }
}

async function chooseSaveFolder() {
  if (!state.supported) {
    state.mode = "unsupported";
    state.lastError = "Your browser does not support folder-backed saves.";
    window.dispatchEvent(new CustomEvent("dungeon-save-slots-updated"));
    return false;
  }
  const handle = await window.showDirectoryPicker({ mode: "readwrite" });
  await idbSet(directoryHandleKey, handle);
  return connectDirectoryHandle(handle, true);
}

async function writeTokenFile(id, blob) {
  if (state.mode !== "file" || !state.directoryHandle) return null;
  const tokens = await state.directoryHandle.getDirectoryHandle("tokens", { create: true });
  const filename = `${id}.png`;
  const handle = await tokens.getFileHandle(filename, { create: true });
  const writable = await handle.createWritable();
  await writable.write(blob);
  await writable.close();
  return `tokens/${filename}`;
}

async function resolveTokenPath(path) {
  if (!path || state.mode !== "file" || !state.directoryHandle) return "";
  if (state.tokenUrls.has(path)) return state.tokenUrls.get(path);
  try {
    const [folder, filename] = String(path).split("/");
    const directory = folder ? await state.directoryHandle.getDirectoryHandle(folder) : state.directoryHandle;
    const handle = await directory.getFileHandle(filename ?? folder);
    const file = await handle.getFile();
    const url = URL.createObjectURL(file);
    state.tokenUrls.set(path, url);
    return url;
  } catch (error) {
    state.lastError = `Token image missing: ${path}`;
    console.warn(state.lastError, error);
    return "";
  }
}

async function deleteTokenFile(path) {
  if (!path || state.mode !== "file" || !state.directoryHandle) return false;
  try {
    const parts = String(path).split("/");
    const filename = parts.pop();
    const folder = parts.join("/");
    const directory = folder ? await state.directoryHandle.getDirectoryHandle(folder) : state.directoryHandle;
    await directory.removeEntry(filename);
    const url = state.tokenUrls.get(path);
    if (url) URL.revokeObjectURL(url);
    state.tokenUrls.delete(path);
    return true;
  } catch (error) {
    if (error?.name === "NotFoundError") return false;
    state.lastError = `Could not delete token image: ${path}`;
    console.warn(state.lastError, error);
    return false;
  }
}

function rememberTokenUrl(path, url) {
  if (path && url) state.tokenUrls.set(path, url);
}

window.DungeonSave = {
  slotCount,
  init,
  chooseSaveFolder,
  refreshSlots,
  getStatus: () => ({ mode: state.mode, supported: state.supported, directoryName: state.directoryName, permission: state.permission, lastError: state.lastError }),
  getSlots: () => clone(state.slots),
  hasSave: (slotId) => state.slots.some((slot) => slot.id === slotId && slot.hasSave),
  writeTokenFile,
  deleteTokenFile,
  resolveTokenPath,
  rememberTokenUrl,
  cachedTokenUrl: (path) => state.tokenUrls.get(path) ?? "",

  async remove(slotId) {
    if (state.mode === "disconnected") throw new Error("Save folder permission is missing. Reconnect the save folder first.");
    if (state.mode === "file" && state.directoryHandle) {
      try {
        await state.directoryHandle.removeEntry(slotFilename(slotId));
      } catch (error) {
        if (error?.name !== "NotFoundError") throw error;
      }
      await refreshSlots();
      return;
    }
    window.localStorage.removeItem(`${legacyStoragePrefix}${slotId}`);
    await refreshSlots();
  },

  async saveQuickstart(saveState) {
    const payload = await payloadForSlot(0, "Dungeon Restart", saveState);
    if (state.mode === "disconnected") throw new Error("Save folder permission is missing. Reconnect the save folder first.");
    if (state.mode === "file" && state.directoryHandle) {
      await writeJsonFile(quickstartFilename, payload);
      return payload;
    }
    try {
      window.localStorage.setItem(legacyQuickstartKey, JSON.stringify(payload));
    } catch (error) {
      state.lastError = "Local storage quota exceeded during legacy quickstart save.";
      throw error;
    }
    return payload;
  },

  async loadQuickstart() {
    if (state.mode === "file" && state.directoryHandle) return readJsonFile(quickstartFilename);
    return legacyLoadQuickstart();
  },

  async save(slotId, name, saveState) {
    const payload = await payloadForSlot(slotId, name, saveState);
    if (state.mode === "disconnected") throw new Error("Save folder permission is missing. Reconnect the save folder first.");
    if (state.mode === "file" && state.directoryHandle) {
      await writeJsonFile(slotFilename(slotId), payload);
      await refreshSlots();
      return payload;
    }
    try {
      window.localStorage.setItem(`${legacyStoragePrefix}${slotId}`, JSON.stringify(payload));
    } catch (error) {
      state.lastError = "Local storage quota exceeded during legacy save.";
      throw error;
    }
    await refreshSlots();
    return payload;
  },

  async load(slotId) {
    if (state.mode === "file" && state.directoryHandle) return readJsonFile(slotFilename(slotId));
    return legacyLoad(slotId);
  },
};

window.DungeonSave.ready = init();
})();
