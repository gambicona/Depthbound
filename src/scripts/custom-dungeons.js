(() => {
const storageKey = "depthbound.customDungeons.v1";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function safeParse(text, fallback) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function normalizeStoryTrigger(trigger, index) {
  if (!trigger || typeof trigger !== "object") return null;
  const event = ["enterRoom", "inspectObject", "openObject", "killMonster"].includes(trigger.event) ? trigger.event : "enterRoom";
  const targetId = String(trigger.targetId ?? "").trim();
  const text = String(trigger.text ?? trigger.body ?? trigger.message ?? trigger.description ?? "").trim();
  const images = Array.isArray(trigger.images) ? trigger.images.map(String).map((value) => value.trim()).filter(Boolean) : [];
  if (!targetId || (!text && images.length === 0)) return null;
  return {
    id: String(trigger.id || `story-trigger-${index + 1}`).replace(/[^a-zA-Z0-9_-]/g, "-"),
    event,
    targetId,
    title: String(trigger.title ?? "").trim(),
    text,
    images,
    once: trigger.once !== false,
  };
}

function normalizeStoryTriggers(triggers = []) {
  return Array.isArray(triggers) ? triggers.map(normalizeStoryTrigger).filter(Boolean) : [];
}

function normalizeStringList(values = []) {
  const source = Array.isArray(values) ? values : String(values ?? "").split(/[,;\n]/);
  return Array.from(new Set(source.map((entry) => String(entry).trim()).filter(Boolean)));
}

function normalizeCustomItem(item, index) {
  if (!item || typeof item !== "object") return null;
  const id = String(item.id || item.baseItemId || `custom-item-${index + 1}`);
  const description = String(item.customDescription ?? item.handout?.text ?? item.description ?? item.magic?.description ?? item.treasure?.description ?? "").trim();
  const normalized = clone({
    ...item,
    id,
    baseItemId: id,
    customDungeonItem: true,
    customDescription: description,
    description,
  });
  if (normalized.magic) normalized.magic.description = description;
  if (normalized.treasure) normalized.treasure.description = description;
  if (normalized.type === "handout" || normalized.handout) {
    const categories = normalizeStringList([...(normalized.handout?.categories ?? []), ...(normalized.journalCategories ?? [])]);
    normalized.type = "handout";
    normalized.tomeInventory = "party";
    normalized.journalCategories = categories;
    normalized.handout = {
      ...(normalized.handout ?? {}),
      title: normalized.name ?? id,
      text: description,
      format: normalized.handout?.format ?? "markdown-lite",
      categories,
    };
  }
  return normalized;
}

function normalizeCustomItems(items = []) {
  return Array.isArray(items) ? items.map(normalizeCustomItem).filter(Boolean) : [];
}

function normalizeTemplate(template) {
  if (!template || typeof template !== "object") return null;
  const id = String(template.id || `custom-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, "-");
  const name = String(template.name || "Custom Dungeon").trim() || "Custom Dungeon";
  const gridSize = Math.max(12, Math.min(96, Number(template.gridSize ?? template.dungeon?.gridSize ?? 36) || 36));
  const dungeon = {
    ...(template.dungeon ?? {}),
    id: template.dungeon?.id ?? id,
    gridSize,
    roomCount: template.dungeon?.rooms?.length ?? 0,
    rooms: Array.isArray(template.dungeon?.rooms) ? template.dungeon.rooms : [],
    corridors: Array.isArray(template.dungeon?.corridors) ? template.dungeon.corridors : [],
    corridorPassages: Array.isArray(template.dungeon?.corridorPassages) ? template.dungeon.corridorPassages : [],
    doors: Array.isArray(template.dungeon?.doors) ? template.dungeon.doors : [],
    walkable: Array.isArray(template.dungeon?.walkable) ? template.dungeon.walkable : [],
    entranceRoomId: template.dungeon?.entranceRoomId ?? template.dungeon?.rooms?.[0]?.id ?? "room-1",
    startPosition: template.dungeon?.startPosition ?? template.dungeon?.rooms?.[0]?.cells?.[0] ?? { x: 1, y: 1 },
    entranceDoor: template.dungeon?.entranceDoor ?? template.dungeon?.rooms?.[0]?.doors?.[0] ?? template.dungeon?.rooms?.[0]?.cells?.[0] ?? { x: 1, y: 1 },
  };
  return {
    id,
    name,
    version: 1,
    createdAt: template.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    themeId: template.themeId ?? "oldGuardroom",
    gridSize,
    dungeon,
    exit: template.exit ?? { roomId: dungeon.rooms.at(-1)?.id ?? dungeon.entranceRoomId, position: dungeon.rooms.at(-1)?.cells?.[0] ?? dungeon.startPosition },
    objects: Array.isArray(template.objects) ? template.objects : [],
    monsters: Array.isArray(template.monsters) ? template.monsters : [],
    customItems: normalizeCustomItems(template.customItems),
    goal: template.goal ?? { type: "reachExit" },
    intro: {
      text: String(template.intro?.text ?? template.introText ?? ""),
      images: Array.isArray(template.intro?.images) ? template.intro.images.map(String).filter(Boolean) : [],
    },
    outro: {
      text: String(template.outro?.text ?? template.outroText ?? template.completionText ?? ""),
      images: Array.isArray(template.outro?.images) ? template.outro.images.map(String).filter(Boolean) : [],
    },
    storyTriggers: normalizeStoryTriggers(template.storyTriggers),
  };
}

function loadAll() {
  const parsed = safeParse(window.localStorage.getItem(storageKey), []);
  const entries = Array.isArray(parsed) ? parsed : [];
  return entries
    .map(normalizeTemplate)
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function saveAll(entries) {
  window.localStorage.setItem(storageKey, JSON.stringify(entries.map(normalizeTemplate).filter(Boolean)));
}

function save(template) {
  const normalized = normalizeTemplate(template);
  if (!normalized) return null;
  const entries = loadAll().filter((entry) => entry.id !== normalized.id);
  entries.push(normalized);
  saveAll(entries);
  return clone(normalized);
}

function remove(id) {
  saveAll(loadAll().filter((entry) => entry.id !== id));
}

function get(id) {
  const found = loadAll().find((entry) => entry.id === id);
  return found ? clone(found) : null;
}

function importTemplate(template) {
  return save(template);
}

function exportTemplate(id) {
  return get(id);
}

window.DungeonCustom = {
  storageKey,
  list: () => loadAll().map(clone),
  get,
  save,
  remove,
  importTemplate,
  exportTemplate,
};
})();
