(() => {
const contentScriptPattern = /^src\/scripts\/content\/(monsters|themes)\//;
const monsterPackPattern = /^src\/scripts\/content\/monsters\//;
const clone = (value) => JSON.parse(JSON.stringify(value));

const els = {
  search: document.querySelector("#monster-search"),
  categoryFilter: document.querySelector("#monster-category-filter"),
  tagFilter: document.querySelector("#monster-tag-filter"),
  themeFilter: document.querySelector("#monster-theme-filter"),
  spawnFilter: document.querySelector("#monster-spawn-filter"),
  abilityFilter: document.querySelector("#monster-ability-filter"),
  sort: document.querySelector("#monster-sort"),
  resultsMeta: document.querySelector("#monster-results-meta"),
  list: document.querySelector("#monster-list"),
  detailTitle: document.querySelector("#detail-title"),
  detailPack: document.querySelector("#detail-pack"),
  detailBody: document.querySelector("#monster-detail-body"),
};

const state = {
  selectedId: "",
  scriptSources: [],
  packSources: new Map(),
  packByMonsterId: new Map(),
  abilityNotesByMonsterId: new Map(),
  spawnByMonsterId: new Map(),
  tokenAssetPaths: new Set(),
};

let avatarObserver = null;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}

function uniqueSorted(values) {
  return Array.from(new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function optionList(values, emptyLabel) {
  return [`<option value="">${escapeHtml(emptyLabel)}</option>`, ...values.map((value) => `<option value="${escapeAttribute(value)}">${escapeHtml(value)}</option>`)].join("");
}

function preserveSelectValue(select, render) {
  const value = select.value;
  select.innerHTML = render();
  if (Array.from(select.options).some((option) => option.value === value)) select.value = value;
}

function scriptSourceWithoutCache(src) {
  return String(src ?? "").replace(/^\.\//, "").split("?")[0];
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(src);
    script.onerror = () => reject(new Error(`Could not load ${src}`));
    document.body.append(script);
  });
}

async function discoverContentScripts() {
  const response = await fetch("index.html", { cache: "no-store" });
  if (!response.ok) throw new Error("Could not read index.html for content script discovery.");
  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  return Array.from(doc.querySelectorAll("script[src]"))
    .map((script) => script.getAttribute("src"))
    .filter(Boolean)
    .map(scriptSourceWithoutCache)
    .filter((src) => contentScriptPattern.test(src))
    .filter((src, index, all) => all.indexOf(src) === index);
}

async function loadContent() {
  state.scriptSources = await discoverContentScripts();
  for (const src of state.scriptSources) await loadScript(src);
  await loadTokenAssetIndex();
  await loadPackSources();
}

async function loadTokenAssetIndex() {
  try {
    const response = await fetch("assets/tokens/", { cache: "no-store" });
    if (!response.ok) return;
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    state.tokenAssetPaths = new Set(
      Array.from(doc.querySelectorAll("a[href]"))
        .map((link) => decodeURIComponent(link.getAttribute("href") ?? ""))
        .filter((href) => /\.(?:png|jpe?g|webp|gif)$/i.test(href))
        .map((href) => `assets/tokens/${href.split("/").pop()}`),
    );
  } catch {
    state.tokenAssetPaths = new Set();
  }
}

async function loadPackSources() {
  const packSources = state.scriptSources.filter((src) => monsterPackPattern.test(src));
  const results = await Promise.allSettled(
    packSources.map(async (src) => {
      const response = await fetch(src, { cache: "no-store" });
      if (!response.ok) throw new Error(`Could not read ${src}`);
      return [src, await response.text()];
    }),
  );
  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    const [src, source] = result.value;
    state.packSources.set(src, source);
    parsePackSource(src, source);
  }
}

function findMatchingBrace(source, openIndex) {
  let depth = 0;
  let quote = "";
  let escaping = false;
  let lineComment = false;
  let blockComment = false;
  for (let index = openIndex; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaping) {
        escaping = false;
      } else if (char === "\\") {
        escaping = true;
      } else if (char === quote) {
        quote = "";
      }
      continue;
    }
    if (char === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (char === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function findMatchingBracket(source, openIndex) {
  let depth = 0;
  let quote = "";
  let escaping = false;
  let lineComment = false;
  let blockComment = false;
  for (let index = openIndex; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaping) {
        escaping = false;
      } else if (char === "\\") {
        escaping = true;
      } else if (char === quote) {
        quote = "";
      }
      continue;
    }
    if (char === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (char === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "[") depth += 1;
    if (char === "]") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function abilityNotesFromBlock(block) {
  const specialIndex = block.search(/\bspecialAbility\s*:/);
  if (specialIndex < 0) return new Map();
  const arrayOpen = block.indexOf("[", specialIndex);
  if (arrayOpen < 0) return new Map();
  const arrayClose = findMatchingBracket(block, arrayOpen);
  if (arrayClose < 0) return new Map();
  const arraySource = block.slice(arrayOpen + 1, arrayClose);
  const notes = new Map();
  const regex = /["']([^"']+)["']\s*,?\s*(?:(?:\/\/\s*([^\n\r]*))|(?:\/\*\s*([\s\S]*?)\s*\*\/))?/g;
  let match;
  while ((match = regex.exec(arraySource))) {
    const name = match[1].trim();
    const note = String(match[2] ?? match[3] ?? "").replace(/\s+/g, " ").trim();
    if (name) notes.set(name, note);
  }
  return notes;
}

function parsePackSource(src, source) {
  const registerRegex = /DungeonContent\.register\(\s*["']monsters["']\s*,\s*["']([^"']+)["']\s*,/g;
  let match;
  while ((match = registerRegex.exec(source))) {
    const monsterId = match[1];
    const openIndex = source.indexOf("{", registerRegex.lastIndex);
    if (openIndex < 0) continue;
    const closeIndex = findMatchingBrace(source, openIndex);
    if (closeIndex < 0) continue;
    const block = source.slice(openIndex, closeIndex + 1);
    state.packByMonsterId.set(monsterId, src);
    state.abilityNotesByMonsterId.set(monsterId, abilityNotesFromBlock(block));
    registerRegex.lastIndex = closeIndex + 1;
  }
}

function monsterCategory(monster) {
  return monster?.category ?? monster?.cat ?? 1;
}

function categoryLabel(monster) {
  return Number.isFinite(Number(monsterCategory(monster))) ? `Cat ${monsterCategory(monster)}` : "Cat ?";
}

function normalizeTagGroups(primaryGroups = [], legacyTags = []) {
  if (Array.isArray(primaryGroups) && primaryGroups.length) return primaryGroups;
  return Array.isArray(legacyTags) && legacyTags.length ? [legacyTags] : [];
}

function matchesTagGroup(entry, requiredTags = []) {
  const tags = new Set(entry?.tags ?? []);
  return requiredTags.every((tag) => tags.has(tag));
}

function matchingGroups(entry, tagGroups = []) {
  return tagGroups.filter((group) => matchesTagGroup(entry, group));
}

function themeNormalMatches(theme, monster) {
  const tagGroups = normalizeTagGroups(theme?.monsterTagGroups, theme?.monsterTags);
  const groups = matchingGroups(monster, tagGroups);
  const explicit = (theme?.monsterIds ?? []).includes(monster.id);
  const bossTagged = (monster.tags ?? []).includes("boss");
  if ((groups.length && !bossTagged) || explicit) return { groups, explicit };
  return null;
}

function themeBossMatches(theme, monster) {
  const tagGroups = normalizeTagGroups(theme?.bossMonsterTagGroups, theme?.bossMonsterTags);
  const groups = matchingGroups(monster, tagGroups);
  const explicit = (theme?.bossMonsterIds ?? []).includes(monster.id);
  if (groups.length || explicit) return { groups, explicit };
  return null;
}

function rebuildSpawnIndex() {
  state.spawnByMonsterId = new Map();
  const themes = window.DungeonContent.list("themes").filter((theme) => !theme.hidden);
  const monsters = window.DungeonContent.list("monsters");
  for (const monster of monsters) {
    const normal = [];
    const boss = [];
    for (const theme of themes) {
      const normalMatch = themeNormalMatches(theme, monster);
      if (normalMatch) normal.push({ theme, ...normalMatch });
      const bossMatch = themeBossMatches(theme, monster);
      if (bossMatch) boss.push({ theme, ...bossMatch });
    }
    state.spawnByMonsterId.set(monster.id, { normal, boss });
  }
}

function spawnSummary(monster) {
  const spawn = state.spawnByMonsterId.get(monster.id) ?? { normal: [], boss: [] };
  return {
    normalCount: spawn.normal.length,
    bossCount: spawn.boss.length,
    total: spawn.normal.length + spawn.boss.length,
  };
}

function listSpawnBadge(monster) {
  const spawn = spawnSummary(monster);
  if (!spawn.total) return "";
  const isBoss = (monster.tags ?? []).includes("boss") || spawn.bossCount > 0;
  const label = isBoss ? "B" : "N";
  const title = isBoss ? "Boss spawn" : "Normal spawn";
  return `<span class="spawn-badge" title="${title}">${label}</span>`;
}

function searchableMonsterText(monster) {
  const notes = Array.from(state.abilityNotesByMonsterId.get(monster.id)?.entries() ?? []).flat().join(" ");
  const spawn = state.spawnByMonsterId.get(monster.id) ?? { normal: [], boss: [] };
  const spawnText = [...spawn.normal, ...spawn.boss].map((entry) => entry.theme.name).join(" ");
  return [
    monster.id,
    monster.name,
    monster.role,
    monster.behavior,
    monster.damage?.label,
    ...(monster.tags ?? []),
    ...(monster.specialAbility ?? []),
    notes,
    spawnText,
  ].join(" ").toLowerCase();
}

function filteredMonsters() {
  const searchTerms = String(els.search.value ?? "").trim().toLowerCase().split(/\s+/).filter(Boolean);
  const category = els.categoryFilter.value;
  const tag = els.tagFilter.value;
  const theme = els.themeFilter.value;
  const spawnType = els.spawnFilter.value;
  const ability = els.abilityFilter.value;
  const sort = els.sort.value;
  return window.DungeonContent
    .list("monsters")
    .filter((monster) => !category || String(monsterCategory(monster)) === category)
    .filter((monster) => !tag || (monster.tags ?? []).includes(tag))
    .filter((monster) => !ability || (monster.specialAbility ?? []).includes(ability))
    .filter((monster) => {
      if (!theme && !spawnType) return true;
      const spawn = state.spawnByMonsterId.get(monster.id) ?? { normal: [], boss: [] };
      const normalMatches = spawn.normal.some((entry) => !theme || entry.theme.id === theme);
      const bossMatches = spawn.boss.some((entry) => !theme || entry.theme.id === theme);
      if (spawnType === "normal") return normalMatches;
      if (spawnType === "boss") return bossMatches;
      if (spawnType === "none") return spawn.normal.length + spawn.boss.length === 0;
      return normalMatches || bossMatches;
    })
    .filter((monster) => searchTerms.every((term) => searchableMonsterText(monster).includes(term)))
    .sort((a, b) => {
      if (sort === "id") return a.id.localeCompare(b.id);
      if (sort === "category") return Number(monsterCategory(a)) - Number(monsterCategory(b)) || String(a.name ?? a.id).localeCompare(String(b.name ?? b.id));
      if (sort === "spawn") return spawnSummary(b).total - spawnSummary(a).total || String(a.name ?? a.id).localeCompare(String(b.name ?? b.id));
      return String(a.name ?? a.id).localeCompare(String(b.name ?? b.id));
    });
}

function renderFilters() {
  const monsters = window.DungeonContent.list("monsters");
  const themes = window.DungeonContent.list("themes").filter((theme) => !theme.hidden).sort((a, b) => a.name.localeCompare(b.name));
  preserveSelectValue(els.categoryFilter, () => optionList(uniqueSorted(monsters.map((monster) => String(monsterCategory(monster)))), "All categories"));
  preserveSelectValue(els.tagFilter, () => optionList(uniqueSorted(monsters.flatMap((monster) => monster.tags ?? [])), "All tags"));
  preserveSelectValue(els.abilityFilter, () => optionList(uniqueSorted(monsters.flatMap((monster) => monster.specialAbility ?? [])), "All abilities"));
  preserveSelectValue(els.themeFilter, () => [
    `<option value="">All themes</option>`,
    ...themes.map((theme) => `<option value="${escapeAttribute(theme.id)}">${escapeHtml(theme.name)}</option>`),
  ].join(""));
}

function renderList() {
  const monsters = filteredMonsters();
  if (!state.selectedId || !monsters.some((monster) => monster.id === state.selectedId)) {
    state.selectedId = monsters[0]?.id ?? "";
  }
  els.resultsMeta.textContent = `${monsters.length.toLocaleString()} of ${window.DungeonContent.list("monsters").length.toLocaleString()} monsters`;
  els.list.innerHTML = monsters.map((monster) => {
    return `
      <button type="button" data-id="${escapeAttribute(monster.id)}" class="${monster.id === state.selectedId ? "active" : ""}">
        ${avatarHtml(monster, "monster-list-avatar")}
        <span class="monster-list-title">
          <b>${escapeHtml(monster.name ?? monster.id)}</b>
          <span class="category-badge">${escapeHtml(categoryLabel(monster))}</span>
          ${listSpawnBadge(monster)}
        </span>
      </button>
    `;
  }).join("");
  activateMonsterImages(els.list);
  renderDetail();
}

function joinedList(values, fallback = "None") {
  return values?.length ? values.map(escapeHtml).join(", ") : fallback;
}

function formatDamage(damage = null) {
  if (!damage) return "None";
  const label = damage.label || [damage.count && damage.sides ? `${damage.count}d${damage.sides}` : "", Number.isFinite(damage.bonus) ? `${damage.bonus >= 0 ? "+" : ""}${damage.bonus}` : "", damage.type].filter(Boolean).join(" ");
  const range = damage.range ? `${damage.range.kind ?? "range"}${damage.range.feet ? ` ${damage.range.feet} ft` : ""}` : "";
  return [label, range, damage.attackType].filter(Boolean).join(" | ");
}

function formatMoney(money = {}) {
  return ["pp", "gp", "ep", "sp", "cp"].map((unit) => money[unit] ? `${money[unit]} ${unit}` : "").filter(Boolean).join(", ") || "None";
}

function formatEquipment(equipment = {}) {
  const entries = Object.entries(equipment).filter(([, value]) => value);
  return entries.length ? entries.map(([slot, item]) => `${slot}: ${item}`).join(", ") : "None";
}

function formatInventory(inventory = {}) {
  const items = (inventory.items ?? []).map((item) => item.itemId ?? item.id ?? item.name ?? String(item));
  return [formatMoney(inventory.money), items.length ? items.join(", ") : ""].filter(Boolean).join(" | ");
}

function renderPills(values, fallback = "None") {
  return values?.length ? `<div class="pill-row">${values.map((value) => `<span class="pill">${escapeHtml(value)}</span>`).join("")}</div>` : `<span class="small-note">${escapeHtml(fallback)}</span>`;
}

function renderAbilities(monster) {
  const abilities = monster.specialAbility ?? [];
  if (!abilities.length) return `<p class="small-note">No special abilities listed.</p>`;
  const notes = state.abilityNotesByMonsterId.get(monster.id) ?? new Map();
  return `<div class="ability-list">${abilities.map((ability) => `
    <article class="ability-card">
      <b>${escapeHtml(ability)}</b>
      <p>${escapeHtml(notes.get(ability) || "No pack-file commentary found beside this ability.")}</p>
    </article>
  `).join("")}</div>`;
}

function groupText(groups = [], explicit = false) {
  const tags = groups.map((group) => group.join(" + "));
  if (explicit) tags.unshift("explicit id");
  return tags.join("; ") || "theme fallback";
}

function renderSpawn(monster) {
  const spawn = state.spawnByMonsterId.get(monster.id) ?? { normal: [], boss: [] };
  const minimumHeroLevel = Math.max(1, Number(monsterCategory(monster)) * 2 - 1);
  const renderEntries = (entries, type) => entries.map((entry) => `
    <article class="spawn-card">
      <b>${escapeHtml(entry.theme.name)} <span class="small-note">(${escapeHtml(type)})</span></b>
      <p>${escapeHtml(groupText(entry.groups, entry.explicit))}</p>
    </article>
  `).join("");
  const html = [renderEntries(spawn.normal, "normal room"), renderEntries(spawn.boss, "boss room")].filter(Boolean).join("");
  return `
    <p class="small-note">Runtime category gate: appears when party target category is ${escapeHtml(monsterCategory(monster))} or higher, roughly hero level ${minimumHeroLevel}+.</p>
    <div class="spawn-list">${html || `<article class="spawn-card"><b>No theme spawn match</b><p>This monster is registered but no current visible theme selects it by tag group or explicit id.</p></article>`}</div>
  `;
}

function avatarHtml(monster, className) {
  const fallback = (hidden = false) => `<span ${hidden ? `class="hidden" ` : ""}data-monster-avatar-fallback>${escapeHtml(monster.token ?? "?")}</span>`;
  if (!monster.tokenArt || !state.tokenAssetPaths.has(monster.tokenArt)) return `<span class="${className}">${fallback()}</span>`;
  return `
    <span class="${className}" data-monster-avatar-src="${escapeAttribute(monster.tokenArt)}">
      ${fallback()}
    </span>
  `;
}

function resolveAvatar(container) {
  const src = container?.dataset?.monsterAvatarSrc;
  if (!src || container.dataset.avatarResolved === "true") return;
  container.dataset.avatarResolved = "true";
  const image = document.createElement("img");
  image.src = src;
  image.alt = "";
  image.loading = "lazy";
  image.addEventListener("load", () => {
    container.querySelector("[data-monster-avatar-fallback]")?.classList.add("hidden");
  }, { once: true });
  image.addEventListener("error", () => {
    image.remove();
    container.querySelector("[data-monster-avatar-fallback]")?.classList.remove("hidden");
  }, { once: true });
  container.prepend(image);
}

function avatarIsVisible(container) {
  const rect = container.getBoundingClientRect();
  return rect.bottom >= 0 && rect.top <= window.innerHeight;
}

function activateMonsterImages(root = document, options = {}) {
  if (!avatarObserver && "IntersectionObserver" in window) {
    avatarObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        avatarObserver.unobserve(entry.target);
        resolveAvatar(entry.target);
      });
    }, { rootMargin: "160px" });
  }
  root.querySelectorAll("[data-monster-avatar-src]").forEach((container) => {
    if (options.immediate || avatarIsVisible(container)) {
      resolveAvatar(container);
      return;
    }
    avatarObserver?.observe(container);
  });
}

function renderDetail() {
  const monster = window.DungeonContent.get("monsters", state.selectedId);
  if (!monster) {
    els.detailTitle.textContent = "Select a monster";
    els.detailPack.textContent = "";
    els.detailBody.innerHTML = `<p class="empty-state">No monster matches the current filters.</p>`;
    return;
  }
  const pack = state.packByMonsterId.get(monster.id) ?? "";
  els.detailTitle.textContent = monster.name ?? monster.id;
  els.detailPack.textContent = pack.replace("src/scripts/content/monsters/", "");
  els.detailBody.innerHTML = `
    <div class="monster-detail-grid">
      <div class="detail-panel">
        <div class="monster-identity">
          ${avatarHtml(monster, "monster-token")}
          <div class="monster-name-block">
            <h2>${escapeHtml(monster.name ?? monster.id)}</h2>
            <code>${escapeHtml(monster.id)}</code>
            <p class="small-note">${escapeHtml(monster.role ?? "No role text.")}</p>
            ${monster.tokenArt ? `<p class="small-note">Token art: ${escapeHtml(monster.tokenArt)}</p>` : ""}
          </div>
        </div>
        <div class="stat-grid">
          <div class="stat-tile"><span>Category</span><b>${escapeHtml(monsterCategory(monster))}</b></div>
          <div class="stat-tile"><span>HP</span><b>${escapeHtml(monster.maxHp ?? "?")}</b></div>
          <div class="stat-tile"><span>AC</span><b>${escapeHtml(monster.ac ?? monster.baseAc ?? "?")}</b></div>
          <div class="stat-tile"><span>Attack</span><b>${escapeHtml(monster.attackBonus ?? "?")}</b></div>
          <div class="stat-tile"><span>XP</span><b>${escapeHtml(monster.xp ?? 0)}</b></div>
          <div class="stat-tile"><span>Speed</span><b>${escapeHtml(monster.speedFeet ?? "?")} ft</b></div>
          <div class="stat-tile"><span>Behavior</span><b>${escapeHtml(monster.behavior ?? "melee")}</b></div>
          <div class="stat-tile"><span>Size</span><b>${escapeHtml(monster.sizeSquares ?? monster.spaceSquares ?? "1")}</b></div>
        </div>
        <section>
          <h3>Tags</h3>
          ${renderPills(monster.tags ?? [])}
        </section>
        <section>
          <h3>Spawn</h3>
          ${renderSpawn(monster)}
        </section>
        <section>
          <h3>Special Abilities</h3>
          ${renderAbilities(monster)}
        </section>
      </div>

      <div class="detail-panel">
        <h3>Combat Profile</h3>
        <table class="info-table">
          <tbody>
            <tr><th>Damage</th><td>${escapeHtml(formatDamage(monster.damage))}</td></tr>
            <tr><th>Multiattack</th><td>${escapeHtml(typeof monster.multiattack === "number" ? monster.multiattack : monster.multiattack?.attacks ?? "1")}</td></tr>
            <tr><th>Ability Scores</th><td>${escapeHtml(Object.entries(monster.abilityScores ?? {}).map(([key, value]) => `${key.toUpperCase()} ${value}`).join(", ") || "None")}</td></tr>
            <tr><th>Damage Resistances</th><td>${joinedList(monster.damageResistances ?? [])}</td></tr>
            <tr><th>Damage Vulnerabilities</th><td>${joinedList(monster.damageVulnerabilities ?? [])}</td></tr>
            <tr><th>Damage Immunities</th><td>${joinedList(monster.damageImmunities ?? [])}</td></tr>
            <tr><th>Condition Immunities</th><td>${joinedList(monster.conditionImmunities ?? [])}</td></tr>
            <tr><th>Flying</th><td>${monster.flying ? "Yes" : "No"}</td></tr>
            <tr><th>Equipment</th><td>${escapeHtml(formatEquipment(monster.equipment))}</td></tr>
            <tr><th>Inventory</th><td>${escapeHtml(formatInventory(monster.inventory))}</td></tr>
            <tr><th>Extra Loot</th><td>${escapeHtml((monster.extraLoot ?? []).map((entry) => entry.itemId ?? entry.kind ?? JSON.stringify(entry)).join(", ") || "None")}</td></tr>
          </tbody>
        </table>
      </div>

      <div class="detail-panel">
        <h3>Raw Monster Definition</h3>
        <pre class="raw-json">${escapeHtml(JSON.stringify(clone(monster), null, 2))}</pre>
      </div>
    </div>
  `;
  activateMonsterImages(els.detailBody, { immediate: true });
}

function bindEvents() {
  [els.search, els.categoryFilter, els.tagFilter, els.themeFilter, els.spawnFilter, els.abilityFilter, els.sort].forEach((element) => {
    element.addEventListener("input", renderList);
    element.addEventListener("change", renderList);
  });
  els.list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-id]");
    if (!button) return;
    state.selectedId = button.dataset.id;
    renderList();
  });
}

async function init() {
  bindEvents();
  try {
    await loadContent();
    rebuildSpawnIndex();
    renderFilters();
    renderList();
  } catch (error) {
    els.resultsMeta.textContent = error?.message ?? "Could not load monster catalogue.";
    els.detailBody.innerHTML = `<p class="empty-state">${escapeHtml(error?.message ?? "Could not load monster catalogue.")}</p>`;
  }
}

window.addEventListener("DOMContentLoaded", init);
})();
