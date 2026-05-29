(() => {
const storageKey = "depthbound.customItems.v1";
const registryFile = "creator-custom-items.json";
let registryItems = [];
let registryLoaded = false;
let registryVersion = 0;

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeCustomItem(item = {}, index = 0) {
  const baseItemId = String(item.baseItemId || item.itemId || item.templateId || "").trim();
  const id = String(item.id || `custom-item-${index + 1}`).replace(/[^a-zA-Z0-9_-]/g, "-");
  if (!id) return null;
  const template = baseItemId ? window.DungeonContent?.get?.("items", baseItemId) : null;
  const merged = {
    ...(template ?? {}),
    ...clone(item),
    id,
    baseItemId: baseItemId || item.baseItemId || item.id,
    customBibliographyItem: true,
    tags: Array.from(new Set([...(template?.tags ?? []), ...(item.tags ?? []), "custom-item"].filter(Boolean))),
  };
  if (!merged.name) merged.name = template?.name ? `${template.name} Variant` : id;
  if (!merged.type) merged.type = template?.type ?? "item";
  if (!Array.isArray(merged.slots)) merged.slots = template?.slots ?? [];
  if (Array.isArray(item.curses) && item.curses.length) {
    merged.curses = item.curses.map((entry) => (typeof entry === "string" ? { id: entry } : entry)).filter((entry) => entry?.id);
    merged.tags = Array.from(new Set([...(merged.tags ?? []), "cursed"]));
    merged.magic = { ...(merged.magic ?? template?.magic ?? {}), curse: { ...(merged.magic?.curse ?? {}), name: merged.magic?.curse?.name ?? "Custom Curse", description: merged.magic?.curse?.description ?? "Created in the custom item bibliography." } };
  }
  return merged;
}

function load() {
  const source = registryLoaded ? registryItems : safeParse(window.localStorage?.getItem(storageKey), []);
  return source
    .map(normalizeCustomItem)
    .filter(Boolean);
}

function save(items = []) {
  const normalized = items.map(normalizeCustomItem).filter(Boolean);
  registryItems = normalized;
  registryLoaded = true;
  registryVersion += 1;
  return normalized;
}

async function refreshFromFile() {
  const response = await fetch(`${registryFile}?v=${Date.now()}`, { cache: "no-store" }).catch(() => null);
  const entries = response?.ok ? await response.json().catch(() => []) : [];
  registryItems = Array.isArray(entries) ? entries.map(normalizeCustomItem).filter(Boolean) : [];
  registryLoaded = true;
  registryVersion += 1;
  window.localStorage?.removeItem(storageKey);
  registerAll();
  return load();
}

async function saveFile(items = []) {
  const normalized = items.map(normalizeCustomItem).filter(Boolean);
  const response = await fetch("/save-helper-registry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind: "custom-items", entries: normalized }),
  }).catch(() => null);
  if (!response?.ok) return null;
  const result = await response.json().catch(() => null);
  if (!result?.saved) return null;
  registryItems = normalized;
  registryLoaded = true;
  registryVersion += 1;
  window.localStorage?.removeItem(storageKey);
  registerAll();
  return load();
}

function registerAll() {
  for (const item of load()) {
    window.DungeonContent?.register?.("items", item.id, item);
  }
}

function signature() {
  return `${registryVersion}:${JSON.stringify(load().map((item) => item.id))}`;
}

window.DungeonCustomItems = { storageKey, registryFile, load, save, saveFile, refreshFromFile, normalizeCustomItem, registerAll, signature };
registerAll();
void refreshFromFile();
})();
