(() => {
const folder = "One-Shot Dungeons";

const dungeons = [
  { id: "one-shot-cat1-lantern-that-lies", name: "Cat 1 - The Lantern That Lies", file: "one-shot-cat1-lantern-that-lies.json" },
  { id: "one-shot-cat2-locked-door-wraith", name: "Cat 2 - The Door That Remembered", file: "one-shot-cat2-locked-door-wraith.json" },
  { id: "one-shot-cat3-tempest-choir", name: "Cat 3 - The Tempest Choir Rehearsal", file: "one-shot-cat3-tempest-choir.json" },
  { id: "one-shot-cat4-slagmaw-cooling-line", name: "Cat 4 - Slagmaw and the Cooling Line", file: "one-shot-cat4-slagmaw-cooling-line.json" },
  { id: "one-shot-cat5-corpse-flower-regent", name: "Cat 5 - The Regent Who Bloomed Twice", file: "one-shot-cat5-corpse-flower-regent.json" },
  { id: "one-shot-cat6-broken-gears", name: "Cat 6 - The Master of Broken Gears", file: "one-shot-cat6-broken-gears.json" },
  { id: "one-shot-cat7-blade-queen", name: "Cat 7 - The Six Blades Contract", file: "one-shot-cat7-blade-queen.json" },
  { id: "one-shot-cat8-crushing-deep", name: "Cat 8 - The Crown Tide Audit", file: "one-shot-cat8-crushing-deep.json" },
  { id: "one-shot-cat9-cinders-and-chains", name: "Cat 9 - The Queen of Cinders and Chains", file: "one-shot-cat9-cinders-and-chains.json" },
  { id: "one-shot-cat10-root-first-forest", name: "Cat 10 - Root of the First Forest", file: "one-shot-cat10-root-first-forest.json" },
];

const cache = new Map();
const overrideStorageKey = "depthbound.oneShotDungeonOverrides.v1";

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

function oneShotById(id) {
  return dungeons.find((entry) => entry.id === id) ?? null;
}

function loadOverrides() {
  const parsed = safeParse(window.localStorage.getItem(overrideStorageKey), {});
  return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
}

function saveOverrides(overrides) {
  window.localStorage.setItem(overrideStorageKey, JSON.stringify(overrides));
}

function normalizeOverrideTemplate(template, id) {
  if (!template || typeof template !== "object") return null;
  return {
    ...clone(template),
    oneShotDungeon: true,
    oneShotDungeonId: id,
    updatedAt: new Date().toISOString(),
  };
}

function getOverride(id) {
  const template = loadOverrides()[id];
  return template ? normalizeOverrideTemplate(template, id) : null;
}

function saveOverride(id, template) {
  if (!oneShotById(id)) return null;
  const normalized = normalizeOverrideTemplate(template, id);
  if (!normalized) return null;
  const overrides = loadOverrides();
  overrides[id] = normalized;
  saveOverrides(overrides);
  cache.set(id, Promise.resolve(clone(normalized)));
  return clone(normalized);
}

function removeOverride(id) {
  const overrides = loadOverrides();
  delete overrides[id];
  saveOverrides(overrides);
  cache.delete(id);
}

function hasOverride(id) {
  return Boolean(loadOverrides()[id]);
}

async function get(id) {
  const entry = oneShotById(id);
  if (!entry) return null;
  const override = getOverride(id);
  if (override) return override;
  if (!cache.has(id)) {
    cache.set(
      id,
      fetch(`${folder}/${entry.file}`)
        .then((response) => (response.ok ? response.json() : null))
        .then((template) => template ? { ...template, oneShotDungeon: true, oneShotDungeonId: id } : null)
        .catch(() => null),
    );
  }
  const template = await cache.get(id);
  return template ? clone(template) : null;
}

async function original(id) {
  const entry = oneShotById(id);
  if (!entry) return null;
  return fetch(`${folder}/${entry.file}`)
    .then((response) => (response.ok ? response.json() : null))
    .then((template) => template ? { ...template, oneShotDungeon: true, oneShotDungeonId: id } : null)
    .catch(() => null);
}

window.DungeonOneShots = {
  list: () => dungeons.map(clone),
  get,
  original,
  hasOverride,
  saveOverride,
  removeOverride,
};
})();
