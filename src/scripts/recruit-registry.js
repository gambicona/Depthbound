(() => {
const registryFile = "creator-recruits.json";
let registryRecruits = [];
let registryLoaded = false;
let registryVersion = 0;

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function slug(value) {
  return String(value || "recruit")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "recruit";
}

function normalizeRecruit(recruit = {}, index = 0) {
  if (!recruit || typeof recruit !== "object" || Array.isArray(recruit)) return null;
  const name = String(recruit.name ?? recruit.overrides?.name ?? `Recruit ${index + 1}`).trim() || `Recruit ${index + 1}`;
  const id = String(recruit.id || `recruit-${slug(name)}`).replace(/[^a-zA-Z0-9_-]/g, "-");
  return {
    ...clone(recruit),
    id,
    name,
    kind: recruit.kind === "ally" ? "ally" : "hero",
    classId: String(recruit.classId ?? recruit.overrides?.classId ?? "fighter").trim() || "fighter",
    level: Math.max(1, Math.min(20, Math.floor(Number(recruit.level ?? recruit.overrides?.level ?? 1) || 1))),
    savedRecruit: true,
  };
}

function load() {
  return (registryLoaded ? registryRecruits : []).map(normalizeRecruit).filter(Boolean);
}

async function refreshFromFile() {
  const response = await fetch(`${registryFile}?v=${Date.now()}`, { cache: "no-store" }).catch(() => null);
  const entries = response?.ok ? await response.json().catch(() => []) : [];
  registryRecruits = Array.isArray(entries) ? entries.map(normalizeRecruit).filter(Boolean) : [];
  registryLoaded = true;
  registryVersion += 1;
  return load();
}

async function saveFile(recruits = []) {
  const normalized = recruits.map(normalizeRecruit).filter(Boolean);
  const response = await fetch("/save-helper-registry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind: "recruits", entries: normalized }),
  }).catch(() => null);
  if (!response?.ok) return null;
  const result = await response.json().catch(() => null);
  if (!result?.saved) return null;
  registryRecruits = normalized;
  registryLoaded = true;
  registryVersion += 1;
  return load();
}

function upsert(recruit) {
  const normalized = normalizeRecruit(recruit);
  if (!normalized) return load();
  const next = load().filter((entry) => entry.id !== normalized.id);
  next.push(normalized);
  registryRecruits = next;
  registryLoaded = true;
  registryVersion += 1;
  return load();
}

function signature() {
  return `${registryVersion}:${JSON.stringify(load().map((entry) => entry.id))}`;
}

window.DungeonRecruitRegistry = { registryFile, load, refreshFromFile, saveFile, upsert, normalizeRecruit, signature };
})();
