(() => {
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const recruitState = {
  items: ["longsword", "shield", "chain-mail", "potion-healing"],
  builtRecruit: null,
  suppressManualEdit: false,
};

function parseList(value) {
  return Array.from(new Set(String(value ?? "").split(/[,;\n]/).map((entry) => entry.trim()).filter(Boolean)));
}

function safeJsonObject(value) {
  try {
    const parsed = JSON.parse(value || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function itemLabel(itemId) {
  const template = window.DungeonContent.get("items", itemId);
  return template ? `${template.name} (${itemId})` : itemId;
}

function renderItems() {
  $("#recruit-items").innerHTML = recruitState.items.map((itemId, index) => `
    <div class="recruit-item-row">
      <input data-item-index="${index}" value="${itemId}" list="recruit-item-options" aria-label="Item id" />
      <button type="button" data-remove-item="${index}">Remove</button>
      <span class="small-note">${itemLabel(itemId)}</span>
    </div>
  `).join("");
  renderOutput();
}

function buildRecruit() {
  if (recruitState.builtRecruit) return recruitState.builtRecruit;
  const abilityScores = Object.fromEntries($$("[data-score]").map((input) => [input.dataset.score, Math.max(1, Math.min(30, Number(input.value) || 10))]));
  const extra = safeJsonObject($("#recruit-extra-json").value);
  const name = $("#recruit-name").value.trim() || "Dungeon Recruit";
  const classId = $("#recruit-class").value || "fighter";
  const level = Math.max(1, Math.min(20, Number($("#recruit-level").value) || 1));
  const overrides = {
    ...extra,
    name,
    speciesName: $("#recruit-species").value.trim(),
    subraceName: $("#recruit-subrace").value.trim(),
    partyRole: $("#recruit-role").value,
    baseMaxHp: Math.max(1, Number($("#recruit-max-hp").value) || 8),
    abilityScores,
    skillProficiencies: parseList($("#recruit-skills").value),
    inventory: {
      ...(extra.inventory ?? {}),
      money: extra.inventory?.money ?? { cp: 0, sp: 0, gp: 25 },
      items: recruitState.items.filter(Boolean),
    },
    equipment: {
      ...(extra.equipment ?? {}),
      mainHand: $("#equip-mainHand").value.trim() || null,
      offHand: $("#equip-offHand").value.trim() || null,
      torso: $("#equip-torso").value.trim() || null,
      ring: $("#equip-ring").value.trim() || null,
    },
  };
  return {
    id: `recruit-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "hero"}`,
    name,
    kind: "hero",
    classId,
    level,
    tokenArt: $("#recruit-token-art").value.trim(),
    overrides,
  };
}

function renderOutput() {
  $("#recruit-output").value = JSON.stringify(buildRecruit(), null, 2);
}

function targetLevel() {
  return Math.max(1, Math.min(20, Number($("#recruit-level").value) || 1));
}

function recruitIdFromName(name) {
  return `recruit-${String(name || "hero").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "hero"}`;
}

function cleanBuiltHeroForRecruit(hero) {
  const clean = cloneData(hero);
  delete clean.id;
  delete clean.position;
  delete clean.alive;
  delete clean.dungeonRecruit;
  delete clean.dungeonRecruitWaiting;
  delete clean.recruitMarkerId;
  delete clean.recruitDialogue;
  delete clean.spawnedBySpawnerId;
  delete clean.roomId;
  return clean;
}

function recruitFromBuiltHero(hero) {
  const classId = hero.classId || defaultContent.heroClass;
  const name = hero.name || getHeroTemplate(classId)?.name || "Dungeon Recruit";
  return {
    id: recruitIdFromName(name),
    name,
    kind: "hero",
    classId,
    level: Math.max(1, Math.min(20, Number(hero.level) || 1)),
    tokenArt: hero.tokenArt ?? "",
    overrides: cleanBuiltHeroForRecruit(hero),
  };
}

function syncFormFromHero(hero) {
  recruitState.suppressManualEdit = true;
  try {
    $("#recruit-name").value = hero.name ?? "Dungeon Recruit";
    $("#recruit-class").value = hero.classId ?? defaultContent.heroClass ?? "fighter";
    $("#recruit-level").value = Math.max(1, Math.min(20, Number(hero.level) || 1));
    $("#recruit-token-art").value = typeof hero.tokenArt === "string" ? hero.tokenArt : "";
    $("#recruit-species").value = hero.speciesName ?? "";
    $("#recruit-subrace").value = hero.subraceName ?? "";
    $("#recruit-role").value = hero.partyRole ?? "dd";
    $("#recruit-max-hp").value = hero.baseMaxHp ?? hero.maxHp ?? 8;
    for (const input of $$("[data-score]")) input.value = hero.abilityScores?.[input.dataset.score] ?? 10;
    $("#recruit-skills").value = (hero.skillProficiencies ?? []).join(", ");
    recruitState.items = (hero.inventory?.items ?? []).map((item) => item.baseItemId ?? item.itemId ?? item.id).filter(Boolean);
    for (const slot of ["mainHand", "offHand", "torso", "ring"]) {
      const input = $(`#equip-${slot}`);
      if (input) input.value = hero.equipment?.[slot] ?? "";
    }
  } finally {
    recruitState.suppressManualEdit = false;
  }
}

function ensureRecruitBuilderRuntime() {
  window.render = window.render || (() => {});
  window.renderLog = window.renderLog || (() => {});
  window.hideHomeMenu = window.hideHomeMenu || (() => {});
  window.addLog = window.addLog || ((text, type = "") => {
    if (!state?.log) return;
    state.log.push({ text, type });
  });
}

async function chooseRecruitHeroOptions() {
  let chosenName = $("#recruit-name").value.trim() || "Dungeon Recruit";
  let chosenTokenArt = $("#recruit-token-art").value.trim();
  let raceSelection = defaultRaceSelection;
  let classId = $("#recruit-class").value.trim() || defaultContent.heroClass;
  while (true) {
    const identity = await showHeroIdentityDialog({
      title: "Recruit Identity",
      message: "Name this recruit and choose their token art.",
      nameValue: chosenName,
      tokenArt: chosenTokenArt,
      confirmText: "Continue",
    });
    if (!identity) return null;
    chosenName = identity.name || "Dungeon Recruit";
    chosenTokenArt = identity.tokenArt;
    const chosenClass = await showHeroClassDialog();
    if (chosenClass === dialogBackValue) continue;
    if (!chosenClass) return null;
    classId = chosenClass;
    const chosenRace = await showHeroRaceDialog({ selection: raceSelection });
    if (chosenRace === dialogBackValue) continue;
    if (!chosenRace) return null;
    raceSelection = chosenRace;
    const heroOptions = await createCharacterOptions(raceSelection, classId);
    if (heroOptions === dialogBackValue) continue;
    if (!heroOptions) return null;
    return { chosenName, chosenTokenArt, raceSelection, classId, heroOptions };
  }
}

async function buildHeroWithDialogs() {
  if (typeof showHeroIdentityDialog !== "function" || typeof levelUpHero !== "function") {
    alert("The full hero builder could not load. Try refreshing this page.");
    return;
  }
  ensureRecruitBuilderRuntime();
  if (typeof loadPredefinedHeroTokenArt === "function") await loadPredefinedHeroTokenArt();
  const creation = await chooseRecruitHeroOptions();
  if (!creation) return;
  const { chosenName, chosenTokenArt, raceSelection, classId, heroOptions } = creation;
  const hero = createCombatant(
    applyHeroCreationOptions(
      {
        ...getHeroTemplate(classId),
        id: "hero",
        name: chosenName.trim() || "Dungeon Recruit",
        tokenArt: chosenTokenArt,
        position: { x: 4, y: 5 },
      },
      { ...heroOptions, raceSelection, classId },
    ),
  );
  gameHasStarted = true;
  state = {
    mode: "home",
    fighters: { hero },
    party: { activeHeroId: "hero", heroIds: ["hero"], rosterIds: ["hero"] },
    initiative: [],
    activeIndex: 0,
    round: 0,
    log: [],
    chest: [],
    chestMoney: { cp: 0, sp: 0, gp: 0 },
    partyResources: {},
    partyTomes: [],
    lootPiles: [],
    dungeonObjects: [],
    home: typeof createDefaultHomeLayout === "function" ? createDefaultHomeLayout() : { objects: [] },
    d20Mode: defaultD20Mode,
    d20FailureStreak: 0,
  };
  selectedHeroIds = new Set(["hero"]);
  state.fighters.hero.name = chosenName.trim() || state.fighters.hero.name;
  state.fighters.hero.tokenArt = chosenTokenArt;
  state.fighters.hero.partyRole = defaultPartyRoleForHero(state.fighters.hero);
  if (!(await chooseStartingFeatsForHero(state.fighters.hero, heroOptions.startingFeatChoiceCount, heroOptions.startingFeatSourceName))) return;
  const desiredLevel = targetLevel();
  while ((state.fighters.hero.level ?? 1) < desiredLevel) {
    const hero = state.fighters.hero;
    const beforeLevel = hero.level ?? 1;
    hero.xp = Math.max(hero.xp ?? 0, xpForNextLevel(beforeLevel));
    await levelUpHero();
    if ((hero.level ?? 1) <= beforeLevel) break;
  }
  const builtHero = cloneData(state.fighters.hero);
  recruitState.builtRecruit = recruitFromBuiltHero(builtHero);
  syncFormFromHero(builtHero);
  renderItems();
  renderOutput();
}

async function saveRecruitJson() {
  const text = $("#recruit-output").value;
  const suggestedName = `${buildRecruit().id || "recruit-hero"}.json`;
  if (window.showSaveFilePicker) {
    const handle = await window.showSaveFilePicker({
      suggestedName,
      types: [{ description: "JSON", accept: { "application/json": [".json"] } }],
    });
    const writable = await handle.createWritable();
    await writable.write(text);
    await writable.close();
    return;
  }
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = suggestedName;
  link.click();
  URL.revokeObjectURL(url);
}

function init() {
  const datalist = document.createElement("datalist");
  datalist.id = "recruit-item-options";
  datalist.innerHTML = window.DungeonContent
    .list("items")
    .sort((a, b) => String(a.name ?? a.id).localeCompare(String(b.name ?? b.id)))
    .map((item) => `<option value="${item.id}">${item.name ?? item.id}</option>`)
    .join("");
  document.body.append(datalist);
  document.addEventListener("input", (event) => {
    const itemInput = event.target.closest("[data-item-index]");
    if (!recruitState.suppressManualEdit && event.target !== $("#recruit-output")) recruitState.builtRecruit = null;
    if (itemInput) recruitState.items[Number(itemInput.dataset.itemIndex)] = itemInput.value.trim();
    renderOutput();
  });
  document.addEventListener("change", (event) => {
    if (!recruitState.suppressManualEdit && event.target !== $("#recruit-output")) recruitState.builtRecruit = null;
    renderOutput();
  });
  $("#run-hero-builder").addEventListener("click", () => {
    void buildHeroWithDialogs();
  });
  $("#add-recruit-item").addEventListener("click", () => {
    recruitState.builtRecruit = null;
    recruitState.items.push("");
    renderItems();
  });
  $("#recruit-items").addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-item]");
    if (!button) return;
    recruitState.builtRecruit = null;
    recruitState.items.splice(Number(button.dataset.removeItem), 1);
    renderItems();
  });
  $("#copy-recruit-json").addEventListener("click", () => navigator.clipboard?.writeText($("#recruit-output").value));
  $("#save-recruit-json").addEventListener("click", () => {
    void saveRecruitJson();
  });
  renderItems();
}

window.addEventListener("DOMContentLoaded", init);
})();
