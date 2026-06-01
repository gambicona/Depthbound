(() => {
const key = (position) => `${position.x},${position.y}`;
const clone = (value) => JSON.parse(JSON.stringify(value));

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}

function itemValueCp(item) {
  if (!item?.cost) return 0;
  const amount = Number(item.cost.amount) || 0;
  const rates = { cp: 1, sp: 10, ep: 50, gp: 100, pp: 1000 };
  return Math.max(0, Math.round(amount * (rates[item.cost.unit] ?? 100)));
}

function itemValueText(item) {
  const totalCp = itemValueCp(item);
  if (totalCp <= 0) return "0 gp";
  const gp = Math.floor(totalCp / 100);
  const sp = Math.floor((totalCp % 100) / 10);
  const cp = totalCp % 10;
  return [
    gp ? `${gp} gp` : "",
    sp ? `${sp} sp` : "",
    cp ? `${cp} cp` : "",
  ].filter(Boolean).join(", ");
}

function itemOptionLabel(item) {
  return `${item.name} (${itemValueText(item)})`;
}

function joinReadable(values) {
  return (Array.isArray(values) ? values : values ? [values] : []).filter(Boolean).join(", ");
}

function damageText(damage) {
  if (!damage) return "";
  const count = Math.max(1, Number(damage.count) || 1);
  const sides = Math.max(1, Number(damage.sides) || 1);
  const bonus = Number(damage.bonus) || 0;
  return `${count}d${sides}${bonus ? (bonus > 0 ? `+${bonus}` : String(bonus)) : ""} ${damage.type ?? "damage"}`;
}

function effectSummary(effects = {}) {
  const parts = [];
  if (effects.acBonus) parts.push(`AC ${effects.acBonus > 0 ? "+" : ""}${effects.acBonus}`);
  if (effects.attackBonus) parts.push(`attack ${effects.attackBonus > 0 ? "+" : ""}${effects.attackBonus}`);
  if (effects.damageBonus) parts.push(`damage ${effects.damageBonus > 0 ? "+" : ""}${effects.damageBonus}`);
  if (effects.saveBonus) parts.push(`saves ${effects.saveBonus > 0 ? "+" : ""}${effects.saveBonus}`);
  if (effects.skillBonus) parts.push(`skills ${effects.skillBonus > 0 ? "+" : ""}${effects.skillBonus}`);
  if (effects.maxHpBonus) parts.push(`max HP ${effects.maxHpBonus > 0 ? "+" : ""}${effects.maxHpBonus}`);
  if (effects.speedBonusFeet) parts.push(`speed ${effects.speedBonusFeet > 0 ? "+" : ""}${effects.speedBonusFeet} ft`);
  if (effects.initiativeBonus) parts.push(`initiative ${effects.initiativeBonus > 0 ? "+" : ""}${effects.initiativeBonus}`);
  for (const [ability, value] of Object.entries(effects.abilityScoreBonuses ?? {})) parts.push(`${ability.toUpperCase()} ${value > 0 ? "+" : ""}${value}`);
  for (const [ability, value] of Object.entries(effects.abilityScorePenalties ?? {})) parts.push(`${ability.toUpperCase()} ${value}`);
  if (effects.resistances?.length) parts.push(`resist ${effects.resistances.join(", ")}`);
  if (effects.vulnerabilities?.length) parts.push(`vulnerable ${effects.vulnerabilities.join(", ")}`);
  if (effects.immunities?.length) parts.push(`immune ${effects.immunities.join(", ")}`);
  if (effects.extraDamage?.length) parts.push(`extra ${effects.extraDamage.map(damageText).join(", ")}`);
  return parts.join("; ");
}

function descriptionForEntry(entry) {
  return entry?.customDescription ?? entry?.handout?.text ?? entry?.magic?.description ?? entry?.description ?? entry?.treasure?.description ?? "";
}

function infoButton(kind, id, label = "Info") {
  return `<button type="button" class="creator-info-button" data-info-${kind}="${escapeAttribute(id)}" title="${escapeAttribute(label)}" aria-label="${escapeAttribute(label)}">i</button>`;
}

function parseListInput(value) {
  return Array.from(
    new Set(
      String(value ?? "")
        .split(/[,;\n]/)
        .map((entry) => entry.trim())
        .filter(Boolean),
    ),
  );
}

function normalizeCreatorCustomItem(item, index = 0) {
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
    const categories = parseListInput([...(normalized.handout?.categories ?? []), ...(normalized.journalCategories ?? [])].join(", "));
    const temporary = Boolean(normalized.temporaryTome ?? normalized.expiresOnDungeonExit ?? normalized.handout?.temporary ?? normalized.tags?.includes("temporary-note"));
    normalized.type = "handout";
    normalized.tomeInventory = "party";
    normalized.temporaryTome = temporary;
    normalized.expiresOnDungeonExit = temporary;
    normalized.journalCategories = categories;
    normalized.handout = {
      ...(normalized.handout ?? {}),
      title: normalized.name ?? id,
      text: description,
      format: normalized.handout?.format ?? "markdown-lite",
      categories,
      temporary,
    };
  }
  return normalized;
}

function normalizeCreatorStoryTrigger(trigger, index = 0) {
  if (!trigger || typeof trigger !== "object") return null;
  const text = String(trigger.text ?? trigger.body ?? trigger.message ?? trigger.description ?? "").trim();
  const images = Array.isArray(trigger.images) ? trigger.images.map(String).map((value) => value.trim()).filter(Boolean) : [];
  const targetId = String(trigger.targetId ?? "").trim();
  if (!targetId || (!text && images.length === 0)) return null;
  return {
    id: String(trigger.id || `story-trigger-${index + 1}`).replace(/[^a-zA-Z0-9_-]/g, "-"),
    event: ["enterRoom", "inspectObject", "openObject", "killMonster"].includes(trigger.event) ? trigger.event : "enterRoom",
    targetId,
    title: String(trigger.title ?? "").trim(),
    text,
    images,
    once: trigger.once !== false,
  };
}

function furnitureIconFilename(template, type) {
  const source = template?.name || type || "";
  return source
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function furnitureIconPath(template, type) {
  const filename = furnitureIconFilename(template, type);
  return filename ? `assets/furniture/${filename}.png` : "";
}

function activateCreatorFurnitureImages(root = document) {
  root.querySelectorAll("[data-creator-furniture-image]").forEach((image) => {
    const fallback = image.nextElementSibling;
    image.addEventListener("load", () => {
      image.classList.remove("hidden");
      fallback?.classList.add("hidden");
    });
    image.addEventListener("error", () => {
      image.remove();
      fallback?.classList.remove("hidden");
    });
    if (image.complete) {
      if (image.naturalWidth > 0) {
        image.classList.remove("hidden");
        fallback?.classList.add("hidden");
      } else {
        image.remove();
        fallback?.classList.remove("hidden");
      }
    }
  });
}

const els = {
  shell: document.querySelector("#creator-shell"),
  name: document.querySelector("#creator-name"),
  theme: document.querySelector("#creator-theme"),
  gridSize: document.querySelector("#creator-grid-size"),
  gridWrap: document.querySelector(".creator-grid-wrap"),
  grid: document.querySelector("#creator-grid"),
  toolGrid: document.querySelector("#tool-grid"),
  activeTool: document.querySelector("#creator-active-tool"),
  mapSummary: document.querySelector("#creator-map-summary"),
  validation: document.querySelector("#creator-validation"),
  topSaveDungeon: document.querySelector("#top-save-dungeon"),
  addRoom: document.querySelector("#add-room"),
  roomList: document.querySelector("#room-list"),
  roomX: document.querySelector("#room-x"),
  roomY: document.querySelector("#room-y"),
  roomW: document.querySelector("#room-w"),
  roomH: document.querySelector("#room-h"),
  roomName: document.querySelector("#room-name"),
  newDungeon: document.querySelector("#new-dungeon"),
  randomLayoutControls: document.querySelector("#random-layout-controls"),
  randomLayout: document.querySelector("#random-layout"),
  randomRoomCount: document.querySelector("#random-room-count"),
  hallwayWidth: document.querySelector("#hallway-width"),
  hallwayWidthLabel: document.querySelector("#hallway-width-label"),
  furnitureSearch: document.querySelector("#furniture-search"),
  furnitureKindFilter: document.querySelector("#furniture-kind-filter"),
  furnitureTagFilter: document.querySelector("#furniture-tag-filter"),
  furnitureSort: document.querySelector("#furniture-sort"),
  furnitureCatalogue: document.querySelector("#furniture-catalogue"),
  monsterSearch: document.querySelector("#monster-search"),
  monsterCategoryFilter: document.querySelector("#monster-category-filter"),
  monsterTagFilter: document.querySelector("#monster-tag-filter"),
  monsterSort: document.querySelector("#monster-sort"),
  monsterCatalogue: document.querySelector("#monster-catalogue"),
  monsterIsBoss: document.querySelector("#monster-is-boss"),
  selectedCard: document.querySelector("#selected-card"),
  itemSearch: document.querySelector("#item-search"),
  itemTypeFilter: document.querySelector("#item-type-filter"),
  itemTagFilter: document.querySelector("#item-tag-filter"),
  scrollSpellLevelFilter: document.querySelector("#scroll-spell-level-filter"),
  scrollSpellClassFilter: document.querySelector("#scroll-spell-class-filter"),
  itemSort: document.querySelector("#item-sort"),
  lootItem: document.querySelector("#loot-item"),
  inspectLootItem: document.querySelector("#inspect-loot-item"),
  customBibliographyItems: document.querySelector("#custom-bibliography-items"),
  addLoot: document.querySelector("#add-loot"),
  deleteSelected: document.querySelector("#delete-selected"),
  savedDungeons: document.querySelector("#saved-dungeons"),
  oneShotDungeons: document.querySelector("#one-shot-dungeons"),
  settlementLayouts: document.querySelector("#settlement-layouts"),
  saveDungeon: document.querySelector("#save-dungeon"),
  campaignDungeons: document.querySelector("#campaign-dungeons"),
  saveCampaignOverride: document.querySelector("#save-campaign-override"),
  calcXp: document.querySelector("#calc-xp"),
  status: document.querySelector("#creator-status"),
  exportJson: document.querySelector("#export-json"),
  copyJson: document.querySelector("#copy-json"),
  importJson: document.querySelector("#import-json"),
  goalType: document.querySelector("#goal-type"),
  goalItem: document.querySelector("#goal-item"),
  goalMonster: document.querySelector("#goal-monster"),
  goalCount: document.querySelector("#goal-count"),
  goalConsumeItem: document.querySelector("#goal-consume-item"),
  introText: document.querySelector("#intro-text"),
  introImages: document.querySelector("#intro-images"),
  outroText: document.querySelector("#outro-text"),
  outroImages: document.querySelector("#outro-images"),
  storyTriggerEvent: document.querySelector("#story-trigger-event"),
  storyTriggerTarget: document.querySelector("#story-trigger-target"),
  storyTriggerTitle: document.querySelector("#story-trigger-title"),
  storyTriggerText: document.querySelector("#story-trigger-text"),
  storyTriggerImages: document.querySelector("#story-trigger-images"),
  storyTriggerOnce: document.querySelector("#story-trigger-once"),
  saveStoryTrigger: document.querySelector("#save-story-trigger"),
  newStoryTrigger: document.querySelector("#new-story-trigger"),
  storyTriggerList: document.querySelector("#story-trigger-list"),
  customItemTemplate: document.querySelector("#custom-item-template"),
  customItemName: document.querySelector("#custom-item-name"),
  customItemDescription: document.querySelector("#custom-item-description"),
  customItemType: document.querySelector("#custom-item-type"),
  customItemTemporary: document.querySelector("#custom-item-temporary"),
  customItemTags: document.querySelector("#custom-item-tags"),
  customItemWeight: document.querySelector("#custom-item-weight"),
  customItemValue: document.querySelector("#custom-item-value"),
  createCustomItem: document.querySelector("#create-custom-item"),
};

const state = {
  id: `custom-${Date.now()}`,
  tool: "select",
  gridSize: 36,
  gridCellSize: 22,
  rooms: [],
  corridors: [],
  corridorPassages: [],
  objects: [],
  monsters: [],
  customItems: [],
  storyTriggers: [],
  selectedStoryTriggerId: "",
  selectedFurnitureId: "",
  selectedMonsterId: "",
  selectedId: "",
  connectFromRoomId: "",
  pendingPortalId: "",
  hallwayStart: null,
  hallwayCells: [],
  hallwayWidth: 1,
  roomDrag: null,
  start: null,
  exit: null,
  campaignSource: null,
  oneShotSource: null,
};

function cellInRoom(room, position) {
  return room.cells.some((cell) => cell.x === position.x && cell.y === position.y);
}

function isBoundaryCell(room, position) {
  return Boolean(room && cellInRoom(room, position) && adjacentCells(position).some((cell) => !cellInRoom(room, cell)));
}

function roomAt(position) {
  return state.rooms.find((room) => cellInRoom(room, position)) ?? null;
}

function corridorAt(position) {
  return state.corridors.find((cell) => cell.x === position.x && cell.y === position.y) ?? null;
}

function objectIsFloorTrapType(type) {
  const template = window.DungeonContent.get("furniture", type);
  return Boolean(template?.kind === "trap" || (template?.components ?? []).some((component) => component?.type === "trap" && component?.mode === "floor"));
}

function cellPlacementArea(position) {
  const room = roomAt(position);
  if (room) return { type: "room", id: room.id, room };
  if (corridorAt(position)) return { type: "corridor", id: "corridor" };
  return null;
}

function objectCanUsePlacementArea(object, area) {
  if (!area) return false;
  if (area.type === "room") return true;
  return area.type === "corridor" && objectIsFloorTrapType(object.type);
}

function objectFitsPlacementArea(object, area) {
  if (!objectCanUsePlacementArea(object, area)) return false;
  return objectCellsForCreator(object).every((cell) => {
    if (area.type === "room") return roomAt(cell)?.id === area.id;
    return Boolean(corridorAt(cell));
  });
}

function objectAt(position) {
  const objects = objectsAt(position);
  return objects.find((object) => !objectIsTerrainFloor(object)) ?? objects[0] ?? null;
}

function objectsAt(position) {
  return state.objects.filter((object) => objectCellsForCreator(object).some((cell) => cell.x === position.x && cell.y === position.y));
}

function doorId(room, door) {
  return room && door ? `door:${room.id}:${key(door)}` : "";
}

function doorEntityById(id) {
  if (!String(id ?? "").startsWith("door:")) return null;
  for (const room of state.rooms) {
    const door = (room.doors ?? []).find((entry) => doorId(room, entry) === id);
    if (door) return { __door: true, id, room, door };
  }
  return null;
}

function doorAt(position) {
  const positionKey = key(position);
  for (const room of state.rooms) {
    const door = (room.doors ?? []).find((entry) => key(entry) === positionKey);
    if (door) return { __door: true, id: doorId(room, door), room, door };
  }
  return null;
}

function normalizeCreatorSpecialLock(lock = null) {
  if (!lock || typeof lock !== "object") return null;
  const answer = String(lock.answer ?? lock.key ?? lock.passphrase ?? "").trim();
  if (!answer) return null;
  return {
    label: String(lock.label ?? "Special Lock").trim() || "Special Lock",
    prompt: String(lock.prompt ?? "Enter the key phrase.").trim() || "Enter the key phrase.",
    answer,
    caseSensitive: Boolean(lock.caseSensitive),
  };
}

function specialLockDraft(lock = null) {
  return {
    label: String(lock?.label ?? "Special Lock").trim() || "Special Lock",
    prompt: String(lock?.prompt ?? "Enter the key phrase.").trim() || "Enter the key phrase.",
    answer: String(lock?.answer ?? "").trim(),
    caseSensitive: Boolean(lock?.caseSensitive),
  };
}

function objectCanUseSpecialLock(object) {
  const def = window.DungeonContent.get("furniture", object?.type);
  const tags = def?.tags ?? [];
  const components = def?.components ?? [];
  return Boolean(
    object?.items?.length ||
    def?.kind === "container" ||
    tags.includes("container") ||
    tags.includes("loot") ||
    components.some((component) => ["lock", "loot", "definedLootContainer"].includes(component?.type)),
  );
}

function objectHasLockComponent(object) {
  return Boolean(window.DungeonContent.get("furniture", object?.type)?.components?.some((component) => component?.type === "lock"));
}

function containerTrapTemplates() {
  return window.DungeonContent
    .list("traps")
    .filter((trap) => trap.placement === "chest")
    .sort((a, b) => String(a.name ?? a.id).localeCompare(String(b.name ?? b.id)));
}

function objectCanUseContainerTrap(object) {
  const def = window.DungeonContent.get("furniture", object?.type);
  const tags = def?.tags ?? [];
  const components = def?.components ?? [];
  return Boolean(
    def &&
      def.kind !== "trap" &&
      (object?.type === "chest" ||
        def.kind === "container" ||
        tags.includes("container") ||
        tags.includes("chest") ||
        tags.includes("crate") ||
        tags.includes("barrel") ||
        components.some((component) => ["loot", "definedLootContainer"].includes(component?.type)))
  );
}

function containerTrapDraft(trap) {
  return {
    id: trap?.id ?? "",
    spotDc: trap?.spotDc ?? 12,
  };
}

function containerTrapOptionList(selectedTrapId = "") {
  return containerTrapTemplates()
    .map((trap) => `<option value="${escapeAttribute(trap.id)}" ${trap.id === selectedTrapId ? "selected" : ""}>${escapeHtml(trap.name ?? trap.id)}</option>`)
    .join("");
}

function normalizeCreatorSpawnerConfig(config = {}) {
  return {
    monsterIds: parseListInput(config.monsterIds ?? config.monsterId ?? "forestWolf"),
    intervalSeconds: Math.max(6, Math.floor(Number(config.intervalSeconds ?? 60) || 60)),
    count: Math.max(1, Math.floor(Number(config.count ?? 1) || 1)),
    maxAlive: Math.max(1, Math.floor(Number(config.maxAlive ?? 8) || 8)),
  };
}

function normalizeCreatorRecruitConfig(config = {}) {
  const kind = config.kind === "ally" ? "ally" : "hero";
  return {
    kind,
    name: String(config.name ?? "").trim(),
    monsterId: String(config.monsterId ?? "forestWolf").trim(),
    control: config.control === "player" ? "player" : "ai",
    companionKind: config.companionKind === "companion" ? "companion" : "ally",
    classId: String(config.classId ?? "fighter").trim() || "fighter",
    level: Math.max(1, Math.min(20, Math.floor(Number(config.level ?? 1) || 1))),
    tokenArt: String(config.tokenArt ?? "").trim(),
    overridesText: typeof config.overridesText === "string" ? config.overridesText : JSON.stringify(config.overrides ?? {}, null, 2),
    dialogueTitle: String(config.dialogueTitle ?? "A Stranger Waits").trim() || "A Stranger Waits",
    dialogueText: String(config.dialogueText ?? "The recruit looks ready to join your expedition.").trim() || "The recruit looks ready to join your expedition.",
    recruitLabel: String(config.recruitLabel ?? "Recruit").trim() || "Recruit",
    backLabel: String(config.backLabel ?? "Back").trim() || "Back",
  };
}

function trapTemplateFromCreatorSelection(trapId) {
  const template = window.DungeonContent.get("traps", trapId);
  if (!template) return null;
  return {
    id: template.id,
    name: template.name,
    spotDc: template.spotDc ?? 12,
    spotDifficulty: template.spotDifficulty ?? "Normal",
    damage: { ...(template.damage ?? { count: 1, sides: 4, type: "piercing" }) },
    magical: Boolean(template.magical),
    disarmSkillOptions: clone(template.disarmSkillOptions ?? []),
    ...(template.disarmSkill ? { disarmSkill: template.disarmSkill } : {}),
    ...(template.disarmAbility ? { disarmAbility: template.disarmAbility } : {}),
    description: template.description ?? "A hidden container trap.",
  };
}

function trapDamageForTemplate(template) {
  return template?.damage ?? (template?.components ?? []).find((component) => component?.type === "trap")?.damage ?? null;
}

function trapDefaultSpotDc(template) {
  const normal = (template?.spotDcs ?? []).find((entry) => String(entry.label).toLowerCase() === "normal");
  return Math.max(1, Number(template?.spotDc ?? normal?.dc ?? template?.spotDcs?.[0]?.dc) || 12);
}

function updateObjectTrapFromCard(object, changedField) {
  const enabledInput = readSelectedLockField("data-object-field='trapEnabled'");
  if (!enabledInput?.checked) {
    delete object.trap;
    if (changedField === "trapEnabled") renderSelected();
    return;
  }
  const selectedTrapId = readSelectedLockField("data-object-field='trapId'")?.value || containerTrapTemplates()[0]?.id || "";
  const trap = trapTemplateFromCreatorSelection(selectedTrapId);
  if (!trap) {
    delete object.trap;
    return;
  }
  const spotInput = readSelectedLockField("data-object-field='trapSpotDc'");
  object.trap = {
    ...trap,
    spotDc: Math.max(1, Number(spotInput?.value) || trap.spotDc || 12),
  };
  if (changedField === "trapEnabled" || changedField === "trapId") renderSelected();
}

function updateObjectSpawnerFromCard(object, changedField = "") {
  object.spawner = normalizeCreatorSpawnerConfig({
    monsterIds: readSelectedLockField("data-object-field='spawnerMonsterIds'")?.value ?? object.spawner?.monsterIds,
    intervalSeconds: readSelectedLockField("data-object-field='spawnerIntervalSeconds'")?.value ?? object.spawner?.intervalSeconds,
    count: readSelectedLockField("data-object-field='spawnerCount'")?.value ?? object.spawner?.count,
    maxAlive: readSelectedLockField("data-object-field='spawnerMaxAlive'")?.value ?? object.spawner?.maxAlive,
  });
  if (changedField === "spawnerAddSelectedMonster" && state.selectedMonsterId) {
    object.spawner.monsterIds = Array.from(new Set([...(object.spawner.monsterIds ?? []), state.selectedMonsterId]));
    renderSelected();
  }
}

function updateObjectRecruitFromCard(object, changedField = "") {
  const existing = normalizeCreatorRecruitConfig(object.recruit);
  object.recruit = normalizeCreatorRecruitConfig({
    kind: readSelectedLockField("data-object-field='recruitKind'")?.value ?? existing.kind,
    name: readSelectedLockField("data-object-field='recruitName'")?.value ?? existing.name,
    monsterId: readSelectedLockField("data-object-field='recruitMonsterId'")?.value ?? existing.monsterId,
    control: readSelectedLockField("data-object-field='recruitControl'")?.value ?? existing.control,
    companionKind: readSelectedLockField("data-object-field='recruitCompanionKind'")?.value ?? existing.companionKind,
    overridesText: readSelectedLockField("data-object-field='recruitOverridesText'")?.value ?? existing.overridesText,
    dialogueTitle: readSelectedLockField("data-object-field='recruitDialogueTitle'")?.value ?? existing.dialogueTitle,
    dialogueText: readSelectedLockField("data-object-field='recruitDialogueText'")?.value ?? existing.dialogueText,
    recruitLabel: readSelectedLockField("data-object-field='recruitLabel'")?.value ?? existing.recruitLabel,
    backLabel: readSelectedLockField("data-object-field='recruitBackLabel'")?.value ?? existing.backLabel,
  });
  if (changedField === "recruitUseSelectedMonster" && state.selectedMonsterId) {
    object.recruit.monsterId = state.selectedMonsterId;
    renderSelected();
  }
  if (changedField === "recruitUseSaved") {
    const recruitId = readSelectedLockField("data-object-field='savedRecruitId'")?.value ?? "";
    const recruit = savedRecruitEntries().find((entry) => entry.id === recruitId);
    if (recruit) {
      object.recruit.kind = recruit.kind ?? "hero";
      object.recruit.name = recruit.name ?? "";
      object.recruit.classId = recruit.classId ?? "fighter";
      object.recruit.level = recruit.level ?? 1;
      object.recruit.tokenArt = recruit.tokenArt ?? "";
      object.recruit.overridesText = recruitOverridesText(recruit);
    }
    renderSelected();
  }
  if (changedField === "recruitKind") renderSelected();
}

function objectTypeIsTerrainFloor(type) {
  const template = window.DungeonContent.get("furniture", type);
  return Boolean((template?.tags ?? []).includes("terrain-floor"));
}

function objectIsTerrainFloor(object) {
  return Boolean(objectTypeIsTerrainFloor(object?.type));
}

function objectCellsForCreator(object) {
  const template = window.DungeonContent.get("furniture", object.type);
  const width = object.width ?? template?.width ?? 1;
  const height = object.height ?? template?.height ?? 1;
  return Array.from({ length: width * height }, (_, index) => ({
    x: object.position.x + (index % width),
    y: object.position.y + Math.floor(index / width),
  }));
}

function monsterFootprintSource(monster) {
  const template = window.DungeonContent.get("monsters", monster.monsterId);
  return { ...(template ?? {}), ...(monster.overrides ?? {}) };
}

function monsterCellsForCreator(monster, position = monster.position) {
  return window.DungeonGrid.fighterCells(monsterFootprintSource(monster), position);
}

function monsterAt(position) {
  return state.monsters.find((monster) => monsterCellsForCreator(monster).some((cell) => cell.x === position.x && cell.y === position.y)) ?? null;
}

function occupied(position, exceptId = "", incomingType = "") {
  const incomingIsTerrainFloor = objectTypeIsTerrainFloor(incomingType);
  if (!incomingIsTerrainFloor && monsterAt(position) && monsterAt(position).id !== exceptId) return true;
  return objectsAt(position).some((object) => {
    if (object.id === exceptId) return false;
    return incomingIsTerrainFloor ? objectIsTerrainFloor(object) : !objectIsTerrainFloor(object);
  });
}

function monsterCanFitAt(template, room, position) {
  return window.DungeonGrid.fighterCells(template, position).every((cell) => {
    const cellRoom = roomAt(cell);
    return cellRoom?.id === room.id && !occupied(cell);
  });
}

function roomCenter(room) {
  const total = room.cells.reduce((sum, cell) => ({ x: sum.x + cell.x, y: sum.y + cell.y }), { x: 0, y: 0 });
  return { x: Math.round(total.x / room.cells.length), y: Math.round(total.y / room.cells.length) };
}

function distance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function adjacentCells(position) {
  return [
    { x: position.x, y: position.y - 1 },
    { x: position.x + 1, y: position.y },
    { x: position.x, y: position.y + 1 },
    { x: position.x - 1, y: position.y },
  ];
}

function nearestBoundaryDoor(room, target) {
  const roomKeys = new Set(room.cells.map(key));
  const candidates = [];
  for (const cell of room.cells) {
    for (const outside of adjacentCells(cell)) {
      if (!roomKeys.has(key(outside))) candidates.push({ door: cell, outside });
    }
  }
  return candidates.sort((a, b) => distance(a.outside, target) - distance(b.outside, target))[0] ?? null;
}

function carvePath(start, end) {
  const cells = [];
  let x = start.x;
  let y = start.y;
  while (x !== end.x) {
    cells.push({ x, y });
    x += Math.sign(end.x - x);
  }
  while (y !== end.y) {
    cells.push({ x, y });
    y += Math.sign(end.y - y);
  }
  cells.push({ x, y });
  return cells;
}

function widenPath(cells, width = state.hallwayWidth) {
  const corridorWidth = Math.max(1, Math.min(3, Math.floor(Number(width) || 1)));
  const widened = new Map();
  for (let index = 0; index < cells.length; index += 1) {
    const cell = cells[index];
    const previous = cells[index - 1] ?? cell;
    const next = cells[index + 1] ?? cell;
    const horizontal = Math.abs(next.x - previous.x) >= Math.abs(next.y - previous.y);
    for (let offset = 0; offset < corridorWidth; offset += 1) {
      const sideOffset = offset - Math.floor(corridorWidth / 2);
      const widenedCell = horizontal ? { x: cell.x, y: cell.y + sideOffset } : { x: cell.x + sideOffset, y: cell.y };
      if (widenedCell.x >= 0 && widenedCell.y >= 0 && widenedCell.x < state.gridSize && widenedCell.y < state.gridSize) {
        widened.set(key(widenedCell), widenedCell);
      }
    }
  }
  return Array.from(widened.values());
}

function edgeKey(a, b) {
  return [key(a), key(b)].sort().join("|");
}

function makeCorridorPassage(id, cells, options = {}) {
  const edges = [];
  for (let index = 1; index < cells.length; index += 1) edges.push(edgeKey(cells[index - 1], cells[index]));
  return { id: `corridor-${id}`, cells: cells.map((cell) => ({ ...cell })), edges, ...options };
}

function nextCorridorPassageId() {
  const usedIds = new Set(state.corridorPassages.map((passage) => passage.id));
  let index = state.corridorPassages.length;
  while (usedIds.has(`corridor-${index}`)) index += 1;
  return index;
}

function uniqueCells(cells) {
  return Array.from(new Map(cells.map((cell) => [key(cell), cell])).values());
}

function rebuildWalkable() {
  return uniqueCells([...state.rooms.flatMap((room) => room.cells), ...state.corridors]);
}

function doorForExport(door) {
  const specialLock = normalizeCreatorSpecialLock(door.specialLock);
  const exported = { ...door };
  if (specialLock) exported.specialLock = specialLock;
  else delete exported.specialLock;
  if (exported.hidden) {
    exported.hidden = true;
    exported.spotDc = Math.max(1, Number(exported.spotDc) || 15);
  } else {
    delete exported.hidden;
    delete exported.spotDc;
  }
  return exported;
}

function roomForExport(room) {
  return {
    ...clone(room),
    doors: (room.doors ?? []).map(doorForExport),
  };
}

function buildDungeon() {
  const walkable = rebuildWalkable();
  const rooms = state.rooms.map(roomForExport);
  const doors = rooms.flatMap((room) => (room.doors ?? []).map((door) => ({ ...door, roomId: room.id })));
  const fallbackEntranceRoom = state.rooms[0];
  const startRoom = state.start ? state.rooms.find((room) => room.id === state.start.roomId && cellInRoom(room, state.start.position)) : null;
  const entranceRoom = startRoom ?? fallbackEntranceRoom;
  const startPosition =
    state.start && startRoom
      ? { ...state.start.position }
      : entranceRoom?.cells?.find((cell) => !entranceRoom.doors?.some((door) => key(door) === key(cell))) ?? entranceRoom?.cells?.[0] ?? { x: 1, y: 1 };
  return {
    id: state.id,
    gridSize: state.gridSize,
    roomCount: state.rooms.length,
    rooms,
    corridors: clone(state.corridors),
    corridorPassages: clone(state.corridorPassages),
    doors,
    walkable,
    entranceRoomId: entranceRoom?.id ?? "room-1",
    entranceDoor: entranceRoom?.doors?.[0] ?? entranceRoom?.cells?.[0] ?? { x: 1, y: 1 },
    startPosition,
  };
}

function goalFromForm() {
  const type = els.goalType.value;
  const consumeOnComplete = Boolean(els.goalConsumeItem?.checked);
  if (type === "collectItem") return { type, itemId: els.goalItem.value, ...(consumeOnComplete ? { consumeOnComplete: true } : {}) };
  if (type === "collectItemCount") return { type, itemId: els.goalItem.value, count: Math.max(1, Number(els.goalCount.value) || 1), ...(consumeOnComplete ? { consumeOnComplete: true } : {}) };
  if (type === "killMonsterType") return { type, monsterId: els.goalMonster.value, count: Math.max(1, Number(els.goalCount.value) || 1) };
  if (type === "killBoss") return { type };
  if (type === "escortNpc") return { type };
  return { type: "reachExit" };
}

function syncSelectedStoryTriggerFromForm() {
  if (!state.selectedStoryTriggerId) return;
  const index = state.storyTriggers.findIndex((entry) => entry.id === state.selectedStoryTriggerId);
  if (index < 0) return;
  const trigger = storyTriggerFromForm();
  if (!trigger.targetId || (!trigger.text && trigger.images.length === 0)) return;
  state.storyTriggers[index] = trigger;
}

function exportedCreatorObject(object) {
  const specialLock = normalizeCreatorSpecialLock(object.specialLock);
  const hasLock = objectHasLockComponent(object);
  return {
    id: object.id,
    type: object.type,
    position: { ...object.position },
    ...(object.width ? { width: object.width } : {}),
    ...(object.height ? { height: object.height } : {}),
    ...(object.pairId ? { pairId: object.pairId } : {}),
    ...(object.spotDc ? { spotDc: Math.max(1, Number(object.spotDc) || 12) } : {}),
    ...(hasLock || typeof object.locked === "boolean" ? { locked: specialLock ? true : Boolean(object.locked) } : {}),
    ...(specialLock ? { specialLock } : {}),
    ...(!specialLock && object.lockDc ? { lockDc: object.lockDc } : {}),
    ...(object.trap ? { trap: clone(object.trap) } : {}),
    ...(object.spawner ? { spawner: normalizeCreatorSpawnerConfig(object.spawner) } : {}),
    ...(object.recruit ? { recruit: normalizeCreatorRecruitConfig(object.recruit) } : {}),
    items: [...(object.items ?? [])],
  };
}

function templateFromState(options = {}) {
  syncSelectedStoryTriggerFromForm();
  const dungeon = buildDungeon();
  return {
    id: state.id,
    name: els.name.value.trim() || "Custom Dungeon",
    themeId: els.theme.value || "oldGuardroom",
    gridSize: state.gridSize,
    ...(state.oneShotSource ? { oneShotDungeon: true, oneShotDungeonId: state.oneShotSource.id } : {}),
    dungeon,
    exit: state.exit ?? { roomId: dungeon.rooms.at(-1)?.id ?? dungeon.entranceRoomId, position: dungeon.rooms.at(-1)?.cells?.[0] ?? dungeon.startPosition },
    objects: state.objects.map(exportedCreatorObject),
    monsters: state.monsters.map((monster) => ({
      id: monster.id,
      monsterId: monster.monsterId,
      name: monster.name,
      position: { ...monster.position },
      roomId: monster.roomId,
      isBoss: Boolean(monster.isBoss),
      extraLoot: [...(monster.extraLoot ?? [])],
      overrides: clone(monster.overrides ?? {}),
      customized: Boolean(monster.customized),
    })),
    customItems: clone(state.customItems),
    goal: goalFromForm(),
    intro: {
      text: els.introText.value.trim(),
      images: els.introImages.value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
    },
    outro: {
      text: els.outroText.value.trim(),
      images: els.outroImages.value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
    },
    storyTriggers: clone(state.storyTriggers),
    ...(options.includeCampaignSource && state.campaignSource
      ? { campaignId: state.campaignSource.campaignId, campaignIndex: state.campaignSource.campaignIndex }
      : {}),
  };
}

function setStatus(text) {
  els.status.textContent = text;
}

function xpForMonster(monster) {
  const template = window.DungeonContent.get("monsters", monster.monsterId) ?? {};
  const value = monster.overrides?.xp ?? template.xp ?? 0;
  return Math.max(0, Math.floor(Number(value) || 0));
}

function calculateDungeonMonsterXp() {
  const total = state.monsters.reduce((sum, monster) => sum + xpForMonster(monster), 0);
  const bossTotal = state.monsters.filter((monster) => monster.isBoss).reduce((sum, monster) => sum + xpForMonster(monster), 0);
  const missing = state.monsters.filter((monster) => xpForMonster(monster) <= 0);
  const parts = [`Monster XP: ${total.toLocaleString()} from ${state.monsters.length} monster${state.monsters.length === 1 ? "" : "s"}`];
  if (bossTotal > 0) parts.push(`boss XP: ${bossTotal.toLocaleString()}`);
  if (missing.length) parts.push(`${missing.length} missing XP`);
  setStatus(`${parts.join(" - ")}.`);
}

function furnitureEntryMatchesTool(entry, tool = state.tool) {
  if (!entry) return false;
  if (tool === "trap") return entry.kind === "trap";
  if (tool === "furniture") return entry.kind !== "trap";
  return true;
}

function ensureSelectedFurnitureForTool(tool = state.tool) {
  if (!["furniture", "trap"].includes(tool)) return;
  const selected = window.DungeonContent.get("furniture", state.selectedFurnitureId);
  if (furnitureEntryMatchesTool(selected, tool)) return;
  const first = window.DungeonContent
    .list("furniture")
    .filter((entry) => furnitureEntryMatchesTool(entry, tool))
    .sort((a, b) => a.name.localeCompare(b.name))[0];
  state.selectedFurnitureId = first?.id ?? "";
}

function setTool(tool) {
  state.tool = tool;
  state.connectFromRoomId = "";
  state.pendingPortalId = "";
  state.hallwayStart = null;
  state.hallwayCells = [];
  ensureSelectedFurnitureForTool(tool);
  renderTools();
  if (["furniture", "trap"].includes(tool)) {
    activateCreatorAssetTab("furniture");
    setCreatorPanelOpen("right", true);
    renderFurnitureCatalogue();
  }
  if (tool === "monster") {
    activateCreatorAssetTab("monsters");
    setCreatorPanelOpen("right", true);
  }
}

function toolLabel(tool = state.tool) {
  return {
    select: "Select / Edit",
    connect: "Connect Rooms",
    hallway: "Draw Hallway",
    furniture: "Place Furniture",
    trap: "Place Trap",
    monster: "Place Monster",
    start: "Set Party Start",
    exit: "Set Exit",
    portal: "Linked Portals",
    erase: "Erase",
  }[tool] ?? "Select / Edit";
}

function renderTools() {
  els.toolGrid.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", button.dataset.tool === state.tool);
  });
  if (els.activeTool) els.activeTool.textContent = toolLabel();
}

function renderThemes() {
  els.theme.innerHTML = window.DungeonContent
    .list("themes")
    .filter((theme) => !theme.hidden)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((theme) => `<option value="${theme.id}">${theme.name}</option>`)
    .join("");
}

function uniqueSorted(values) {
  return Array.from(new Set(values.filter(Boolean).map(String))).sort((a, b) => a.localeCompare(b));
}

function optionList(values, allLabel = "All", labelForValue = (value) => value) {
  return [`<option value="">${escapeHtml(allLabel)}</option>`, ...values.map((value) => `<option value="${escapeAttribute(value)}">${escapeHtml(labelForValue(value))}</option>`)].join("");
}

function preserveSelectValue(select, renderOptions) {
  if (!select) return;
  const current = select.value;
  select.innerHTML = renderOptions();
  if ([...select.options].some((option) => option.value === current)) select.value = current;
}

function entrySearchText(entry, fields = []) {
  return [
    entry?.name,
    entry?.id,
    entry?.type,
    entry?.category,
    entry?.kind,
    entry?.placement,
    entry?.role,
    entry?.description,
    entry?.magic?.description,
    entry?.treasure?.description,
    ...(entry?.tags ?? []),
    ...(entry?.components ?? []).map((component) => component?.type ?? component),
    ...fields,
  ].join(" ").toLowerCase();
}

function queryTerms(input) {
  return String(input?.value ?? "").trim().toLowerCase().split(/\s+/).filter(Boolean);
}

function entryMatchesSearch(entry, input, fields = []) {
  const terms = queryTerms(input);
  if (!terms.length) return true;
  const searchable = entrySearchText(entry, fields);
  return terms.every((term) => searchable.includes(term));
}

function entryHasTag(entry, tag) {
  return !tag || (entry?.tags ?? []).includes(tag);
}

function compareByName(a, b) {
  return String(a.name ?? a.id).localeCompare(String(b.name ?? b.id));
}

function isSpellScrollItem(item) {
  return item?.use?.kind === "spellScroll" || item?.scroll?.kind === "spell" || item?.category === "spell scroll";
}

function spellScrollLevelValue(item) {
  const level = Number(item?.scroll?.level ?? item?.use?.castLevel ?? 0) || 0;
  return `spell-level:${Math.max(0, Math.min(9, level))}`;
}

function spellScrollLevelLabel(value) {
  const level = Number(String(value).replace("spell-level:", ""));
  return level === 0 ? "Cantrip" : `Level ${level}`;
}

function renderCatalogueFilters() {
  preserveSelectValue(els.furnitureKindFilter, () => optionList(uniqueSorted(window.DungeonContent.list("furniture").map((entry) => entry.floor ? "floor" : entry.kind ?? "furniture")), "All kinds"));
  preserveSelectValue(els.furnitureTagFilter, () => optionList(uniqueSorted(window.DungeonContent.list("furniture").flatMap((entry) => entry.tags ?? [])), "All tags"));
  preserveSelectValue(els.monsterCategoryFilter, () => optionList(uniqueSorted(window.DungeonContent.list("monsters").map((entry) => Number.isFinite(entry.category) ? `Category ${entry.category}` : "")), "All categories"));
  preserveSelectValue(els.monsterTagFilter, () => optionList(uniqueSorted(window.DungeonContent.list("monsters").flatMap((entry) => entry.tags ?? [])), "All tags"));
  preserveSelectValue(els.itemTypeFilter, () => optionList(uniqueSorted(window.DungeonContent.list("items").filter((item) => item.type !== "class").map((item) => item.type ?? item.category ?? "item")), "All types"));
  preserveSelectValue(els.itemTagFilter, () => optionList(uniqueSorted(window.DungeonContent.list("items").filter((item) => item.type !== "class").flatMap((item) => item.tags ?? [])), "All tags"));
  const scrolls = window.DungeonContent.list("items").filter(isSpellScrollItem);
  preserveSelectValue(els.scrollSpellLevelFilter, () => optionList(uniqueSorted(scrolls.map(spellScrollLevelValue)), "All scroll levels", spellScrollLevelLabel));
  preserveSelectValue(els.scrollSpellClassFilter, () => optionList(uniqueSorted(scrolls.flatMap((item) => item.scroll?.classes ?? [])), "All scroll classes"));
}

function catalogueButton(entry, selectedId) {
  return `<button type="button" data-id="${escapeAttribute(entry.id)}" class="${entry.id === selectedId ? "active" : ""}"><b>${escapeHtml(entry.name)}</b><br><span class="small-note">${escapeHtml(entry.id)}</span></button>`;
}

function monsterCategoryLabel(monster) {
  return Number.isFinite(monster.category) ? `Cat ${monster.category}` : "Cat ?";
}

function monsterCatalogueButton(entry, selectedId) {
  return `
    <div class="creator-catalogue-entry">
      <button type="button" data-id="${escapeAttribute(entry.id)}" class="monster-catalogue-button ${entry.id === selectedId ? "active" : ""}">
        <span class="monster-catalogue-title">
          <b>${escapeHtml(entry.name)}</b>
          <span class="monster-category-badge" title="Monster category">${escapeHtml(monsterCategoryLabel(entry))}</span>
        </span>
        <span class="small-note">${escapeHtml(entry.id)}${entry.tags?.length ? ` - ${escapeHtml(entry.tags.slice(0, 5).join(", "))}` : ""}</span>
      </button>
      ${infoButton("monster", entry.id, `Inspect ${entry.name}`)}
    </div>
  `;
}

function furnitureCatalogueButton(entry, selectedId) {
  const fallbackSymbol = entry.symbol ?? (entry.kind === "trap" ? "!" : "?");
  const iconPath = furnitureIconPath(entry, entry.id);
  const trapDamage = entry.kind === "trap" ? damageText(trapDamageForTemplate(entry)) : "";
  const meta = [
    trapDamage,
    entry.floor ? "floor" : entry.kind,
    ...(entry.tags ?? []).slice(0, trapDamage ? 2 : 3),
  ].filter(Boolean).join(" - ");
  return `
    <button type="button" data-id="${escapeAttribute(entry.id)}" class="furniture-catalogue-button ${entry.id === selectedId ? "active" : ""}">
      <span class="furniture-catalogue-icon">
        ${iconPath ? `<img class="hidden" data-creator-furniture-image src="${escapeAttribute(iconPath)}" alt="" draggable="false" />` : ""}
        <span>${escapeHtml(fallbackSymbol)}</span>
      </span>
      <span class="furniture-catalogue-copy">
        <b>${escapeHtml(entry.name)}</b>
        <span class="small-note">${escapeHtml(meta)}</span>
      </span>
    </button>
  `;
}

function renderFurnitureCatalogue() {
  const kindFilter = els.furnitureKindFilter?.value ?? "";
  const tagFilter = els.furnitureTagFilter?.value ?? "";
  const sort = els.furnitureSort?.value ?? "name";
  const entries = window.DungeonContent
    .list("furniture")
    .filter((entry) => furnitureEntryMatchesTool(entry))
    .filter((entry) => !kindFilter || (kindFilter === "floor" ? entry.floor : (entry.kind ?? "furniture") === kindFilter))
    .filter((entry) => entryHasTag(entry, tagFilter))
    .filter((entry) => entryMatchesSearch(entry, els.furnitureSearch, [entry.floor ? "floor" : ""]))
    .sort((a, b) => {
      if (sort === "id") return a.id.localeCompare(b.id);
      if (sort === "kind") return String(a.floor ? "floor" : a.kind ?? "").localeCompare(String(b.floor ? "floor" : b.kind ?? "")) || compareByName(a, b);
      return compareByName(a, b);
    });
  els.furnitureCatalogue.innerHTML = entries.map((entry) => furnitureCatalogueButton(entry, state.selectedFurnitureId)).join("");
  activateCreatorFurnitureImages(els.furnitureCatalogue);
}

function filteredMonsterEntries() {
  const categoryFilter = els.monsterCategoryFilter?.value ?? "";
  const tagFilter = els.monsterTagFilter?.value ?? "";
  const sort = els.monsterSort?.value ?? "name";
  const categoryValue = Number(categoryFilter.replace("Category ", ""));
  return window.DungeonContent
    .list("monsters")
    .filter((entry) => !categoryFilter || entry.category === categoryValue)
    .filter((entry) => entryHasTag(entry, tagFilter))
    .filter((entry) => entryMatchesSearch(entry, els.monsterSearch, [monsterCategoryLabel(entry)]))
    .sort((a, b) => {
      if (sort === "id") return a.id.localeCompare(b.id);
      if (sort === "category") return (a.category ?? 999) - (b.category ?? 999) || compareByName(a, b);
      return compareByName(a, b);
    });
}

function renderMonsterCatalogue() {
  const entries = filteredMonsterEntries();
  els.monsterCatalogue.innerHTML = entries.map((entry) => monsterCatalogueButton(entry, state.selectedMonsterId)).join("");
}

function filteredItemEntries() {
  const typeFilter = els.itemTypeFilter?.value ?? "";
  const tagFilter = els.itemTagFilter?.value ?? "";
  const scrollLevelFilter = els.scrollSpellLevelFilter?.value ?? "";
  const scrollClassFilter = els.scrollSpellClassFilter?.value ?? "";
  const sort = els.itemSort?.value ?? "name";
  return window.DungeonContent
    .list("items")
    .filter((item) => item.type !== "class")
    .filter((item) => !typeFilter || (item.type ?? item.category ?? "item") === typeFilter)
    .filter((item) => entryHasTag(item, tagFilter))
    .filter((item) => !scrollLevelFilter || (isSpellScrollItem(item) && spellScrollLevelValue(item) === scrollLevelFilter))
    .filter((item) => !scrollClassFilter || (isSpellScrollItem(item) && (item.scroll?.classes ?? []).includes(scrollClassFilter)))
    .filter((entry) => entryMatchesSearch(entry, els.itemSearch, [itemValueText(entry)]))
    .sort((a, b) => {
      if (sort === "id") return a.id.localeCompare(b.id);
      if (sort === "type") return String(a.type ?? "").localeCompare(String(b.type ?? "")) || compareByName(a, b);
      if (sort === "value") return itemValueCp(a) - itemValueCp(b) || compareByName(a, b);
      return compareByName(a, b);
    });
}

function customBibliographyItems() {
  return window.DungeonCustomItems?.load?.() ?? [];
}

function savedRecruitEntries() {
  return window.DungeonRecruitRegistry?.load?.() ?? [];
}

function savedRecruitOptions(selectedId = "") {
  const entries = savedRecruitEntries();
  if (!entries.length) return `<option value="">No saved recruits</option>`;
  return `<option value="">Choose saved recruit</option>${entries
    .sort((a, b) => String(a.name ?? a.id).localeCompare(String(b.name ?? b.id)))
    .map((recruit) => `<option value="${escapeAttribute(recruit.id)}" ${recruit.id === selectedId ? "selected" : ""}>${escapeHtml(recruit.name ?? recruit.id)} (Level ${escapeHtml(recruit.level ?? "?")})</option>`)
    .join("")}`;
}

function recruitOverridesText(recruit) {
  if (!recruit) return "{}";
  return JSON.stringify(recruit, null, 2);
}

function filteredCustomBibliographyItems(excludedIds = new Set()) {
  const scrollLevelFilter = els.scrollSpellLevelFilter?.value ?? "";
  const scrollClassFilter = els.scrollSpellClassFilter?.value ?? "";
  return customBibliographyItems()
    .filter((item) => item?.id && !excludedIds.has(item.id))
    .filter((item) => item.type !== "class")
    .filter((item) => !els.itemTypeFilter?.value || (item.type ?? item.category ?? "item") === els.itemTypeFilter.value)
    .filter((item) => entryHasTag(item, els.itemTagFilter?.value ?? ""))
    .filter((item) => !scrollLevelFilter || (isSpellScrollItem(item) && spellScrollLevelValue(item) === scrollLevelFilter))
    .filter((item) => !scrollClassFilter || (isSpellScrollItem(item) && (item.scroll?.classes ?? []).includes(scrollClassFilter)))
    .filter((item) => entryMatchesSearch(item, els.itemSearch, [itemValueText(item)]))
    .sort(compareByName);
}

function renderCustomBibliographyItems(items) {
  if (!els.customBibliographyItems) return;
  if (!customBibliographyItems().length) {
    els.customBibliographyItems.innerHTML = `<p class="small-note">No custom bibliography items loaded in this browser tab.</p>`;
    return;
  }
  if (!items.length) {
    els.customBibliographyItems.innerHTML = `<p class="small-note">No custom bibliography items match these filters.</p>`;
    return;
  }
  els.customBibliographyItems.innerHTML = items.map((item) => `
    <div class="creator-catalogue-entry">
      <button type="button" data-custom-bibliography-loot="${escapeAttribute(item.id)}">
        <b>${escapeHtml(item.name)}</b><br>
        <span class="small-note">${escapeHtml([item.type ?? item.category ?? "item", ...(item.tags ?? []).slice(0, 3)].filter(Boolean).join(" - "))}</span>
      </button>
      ${infoButton("item", item.id, `Inspect ${item.name}`)}
    </div>
  `).join("");
}

function renderItemSelects() {
  const items = filteredItemEntries();
  const registryIds = new Set(items.map((item) => item.id));
  const allBibliographyItems = filteredCustomBibliographyItems(new Set());
  const bibliographyItems = allBibliographyItems.filter((item) => !registryIds.has(item.id));
  allBibliographyItems.forEach((item) => window.DungeonContent?.register?.("items", item.id, item));
  const options = items.map((item) => `<option value="${escapeAttribute(item.id)}">${escapeHtml(itemOptionLabel(item))}</option>`).join("");
  const bibliographyOptions = bibliographyItems.map((item) => `<option value="${escapeAttribute(item.id)}">${escapeHtml(itemOptionLabel(item))}</option>`).join("");
  const customOptions = state.customItems
    .filter((item) => !registryIds.has(item.id) && !bibliographyItems.some((entry) => entry.id === item.id))
    .filter((item) => entryMatchesSearch(item, els.itemSearch, [itemValueText(item)]))
    .filter((item) => !els.itemTypeFilter?.value || (item.type ?? item.category ?? "item") === els.itemTypeFilter.value)
    .filter((item) => entryHasTag(item, els.itemTagFilter?.value ?? ""))
    .filter((item) => !els.scrollSpellLevelFilter?.value || (isSpellScrollItem(item) && spellScrollLevelValue(item) === els.scrollSpellLevelFilter.value))
    .filter((item) => !els.scrollSpellClassFilter?.value || (isSpellScrollItem(item) && (item.scroll?.classes ?? []).includes(els.scrollSpellClassFilter.value)))
    .map((item) => `<option value="${escapeAttribute(item.id)}">${escapeHtml(itemOptionLabel(item))}</option>`)
    .join("");
  const currentLoot = els.lootItem.value;
  const currentGoal = els.goalItem.value;
  const currentTemplate = els.customItemTemplate.value;
  els.lootItem.innerHTML = options + bibliographyOptions + customOptions || `<option value="">No matching items</option>`;
  els.goalItem.innerHTML = options + bibliographyOptions + customOptions || `<option value="">No matching items</option>`;
  els.customItemTemplate.innerHTML = options + bibliographyOptions;
  renderCustomBibliographyItems(allBibliographyItems);
  if ([...els.lootItem.options].some((option) => option.value === currentLoot)) els.lootItem.value = currentLoot;
  if ([...els.goalItem.options].some((option) => option.value === currentGoal)) els.goalItem.value = currentGoal;
  if ([...els.customItemTemplate.options].some((option) => option.value === currentTemplate)) els.customItemTemplate.value = currentTemplate;
  els.goalMonster.innerHTML = window.DungeonContent
    .list("monsters")
    .sort((a, b) => compareByName(a, b))
    .map((monster) => `<option value="${escapeAttribute(monster.id)}">${escapeHtml(monster.name)}</option>`)
    .join("") + state.monsters.filter((monster) => monster.customized).map((monster) => `<option value="${monster.id}">${monster.name}</option>`).join("");
}

let customBibliographySignature = "";

function currentCustomBibliographySignature() {
  return window.DungeonCustomItems?.signature?.() ?? "";
}

function syncCustomBibliographyItems(force = false) {
  if (!window.DungeonCustomItems?.registerAll) return false;
  const signature = currentCustomBibliographySignature();
  if (!force && signature === customBibliographySignature) return false;
  customBibliographySignature = signature;
  window.DungeonCustomItems.registerAll();
  renderCatalogueFilters();
  renderItemSelects();
  return true;
}

function decodeTransferPayload(payload) {
  const padded = String(payload ?? "").replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(String(payload ?? "").length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function importCustomItemsFromHash() {
  if (!window.DungeonCustomItems?.save || !window.location.hash.includes("customItems=")) return 0;
  const params = new URLSearchParams(window.location.hash.slice(1));
  const payload = params.get("customItems");
  if (!payload) return 0;
  try {
    const incoming = decodeTransferPayload(payload);
    if (!Array.isArray(incoming)) return 0;
    const byId = new Map(window.DungeonCustomItems.load().map((item) => [item.id, item]));
    incoming.forEach((item) => {
      if (item?.id) byId.set(item.id, item);
    });
    window.DungeonCustomItems.save([...byId.values()]);
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    return incoming.length;
  } catch (error) {
    console.warn("Failed to import custom item transfer payload.", error);
    return 0;
  }
}

function activateCreatorPanelTab(tab) {
  document.querySelectorAll("[data-panel-tab]").forEach((button) => button.classList.toggle("active", button.dataset.panelTab === tab));
  document.querySelectorAll("[data-panel-page]").forEach((page) => page.classList.toggle("active", page.dataset.panelPage === tab));
}

function activateCreatorAssetTab(tab) {
  document.querySelectorAll("[data-asset-tab]").forEach((button) => button.classList.toggle("active", button.dataset.assetTab === tab));
  document.querySelectorAll("[data-asset-page]").forEach((page) => page.classList.toggle("active", page.dataset.assetPage === tab));
}

function setCreatorPanelOpen(side, open) {
  if (!els.shell) return;
  els.shell.classList.toggle(`${side}-collapsed`, !open);
  document.querySelectorAll(`[data-toggle-panel='${side}']`).forEach((button) => button.classList.toggle("active", open));
  const panel = document.querySelector(`#creator-${side}-panel`);
  panel?.classList.toggle("hidden-mobile", !open);
}

function creatorPanelIsOpen(side) {
  return !els.shell?.classList.contains(`${side}-collapsed`);
}

function toggleCreatorPanel(side) {
  setCreatorPanelOpen(side, !creatorPanelIsOpen(side));
}

function fitCreatorGridToViewport() {
  if (!els.gridWrap || !state.gridSize) return;
  const availableWidth = Math.max(240, els.gridWrap.clientWidth - 54);
  const availableHeight = Math.max(240, els.gridWrap.clientHeight - 54);
  const fitted = Math.floor((Math.min(availableWidth, availableHeight) - state.gridSize) / state.gridSize);
  state.gridCellSize = Math.max(12, Math.min(28, fitted || 22));
  renderGrid();
}

function adjustCreatorZoom(action) {
  if (action === "fit") {
    fitCreatorGridToViewport();
    return;
  }
  if (action === "reset") state.gridCellSize = 22;
  if (action === "in") state.gridCellSize = Math.min(34, (Number(state.gridCellSize) || 22) + 2);
  if (action === "out") state.gridCellSize = Math.max(12, (Number(state.gridCellSize) || 22) - 2);
  renderGrid();
}

function roomCellMap() {
  const map = new Map();
  for (const room of state.rooms) {
    for (const cell of room.cells) map.set(key(cell), room);
  }
  return map;
}

function roomCellsForRect(x, y, width, height) {
  const cells = [];
  for (let cy = y; cy < y + height; cy += 1) {
    for (let cx = x; cx < x + width; cx += 1) {
      if (cx >= 0 && cy >= 0 && cx < state.gridSize && cy < state.gridSize) cells.push({ x: cx, y: cy });
    }
  }
  return cells;
}

function nextUniqueRoomNumber() {
  const usedNumbers = new Set(
    state.rooms
      .map((room) => /^room-(\d+)$/.exec(room.id ?? "")?.[1])
      .filter(Boolean)
      .map(Number),
  );
  let number = 1;
  while (usedNumbers.has(number)) number += 1;
  return number;
}

function repairDuplicateRoomIds() {
  const seen = new Set();
  for (const room of state.rooms) {
    if (!seen.has(room.id)) {
      seen.add(room.id);
      continue;
    }
    const oldId = room.id;
    const newId = `room-${nextUniqueRoomNumber()}`;
    room.id = newId;
    seen.add(newId);
    state.objects
      .filter((object) => object.roomId === oldId && cellInRoom(room, object.position))
      .forEach((object) => {
        object.roomId = newId;
      });
    state.monsters
      .filter((monster) => monster.roomId === oldId && cellInRoom(room, monster.position))
      .forEach((monster) => {
        monster.roomId = newId;
      });
    state.storyTriggers
      .filter((trigger) => trigger.targetId === oldId)
      .forEach((trigger) => {
        trigger.targetId = newId;
      });
    if (state.exit?.roomId === oldId && cellInRoom(room, state.exit.position)) state.exit.roomId = newId;
    if (state.start?.roomId === oldId && cellInRoom(room, state.start.position)) state.start.roomId = newId;
  }
}

function renderGrid() {
  const roomMap = roomCellMap();
  const corridorKeys = new Set(state.corridors.map(key));
  const doorKeys = new Set(state.rooms.flatMap((room) => room.doors ?? []).map(key));
  const exitKey = state.exit ? key(state.exit.position) : "";
  const startKey = state.start ? key(state.start.position) : "";
  const portalKeys = new Set(state.objects.filter((object) => object.type === "portal").map((object) => key(object.position)));
  const hallwayPreviewKeys = new Set(state.hallwayCells.map(key));
  const cellSize = Math.max(12, Math.min(34, Number(state.gridCellSize) || 22));
  els.shell?.style.setProperty("--creator-cell-size", `${cellSize}px`);
  els.grid.style.gridTemplateColumns = `repeat(${state.gridSize}, var(--creator-cell-size))`;
  const cells = [];
  for (let y = 0; y < state.gridSize; y += 1) {
    for (let x = 0; x < state.gridSize; x += 1) {
      const position = { x, y };
      const cellKey = key(position);
      const room = roomMap.get(cellKey);
      const monster = monsterAt(position);
      const object = objectAt(position);
      const door = room ? (room.doors ?? []).find((entry) => key(entry) === cellKey) : null;
      const terrainObject = objectsAt(position).find(objectIsTerrainFloor);
      const classes = [
        "creator-cell",
        room ? "room" : "",
        corridorKeys.has(cellKey) ? "corridor" : "",
        doorKeys.has(cellKey) ? "door" : "",
        door?.hidden ? "hidden-door" : "",
        startKey === cellKey ? "start" : "",
        exitKey === cellKey ? "exit" : "",
        portalKeys.has(cellKey) ? "portal" : "",
        terrainObject ? `object-${String(terrainObject.type).replace(/[^a-z0-9_-]/gi, "-")}` : "",
        object ? `object-${String(object.type).replace(/[^a-z0-9_-]/gi, "-")}` : "",
        hallwayPreviewKeys.has(cellKey) ? "selected-room" : "",
        room?.id === state.connectFromRoomId || room?.id === state.selectedId ? "selected-room" : "",
        door && state.selectedId === doorId(room, door) ? "selected-room" : "",
        y === 0 && x % 5 === 0 ? "axis-x" : "",
        x === 0 && y % 5 === 0 ? "axis-y" : "",
      ].filter(Boolean).join(" ");
      const template = object ? window.DungeonContent.get("furniture", object.type) : null;
      const label = monster ? "M" : object ? (template?.symbol ?? (object.type === "portal" ? "P" : "F")) : startKey === cellKey ? "S" : exitKey === cellKey ? "E" : door?.hidden ? "H" : door ? "D" : "";
      const iconPath = object ? furnitureIconPath(template, object.type) : "";
      const content = object && !monster
        ? `${iconPath ? `<img class="creator-cell-object-icon hidden" data-creator-furniture-image src="${escapeAttribute(iconPath)}" alt="" draggable="false" />` : ""}<span>${escapeHtml(label)}</span>`
        : escapeHtml(label);
      const title = object ? template?.name ?? object.type : door ? `${door.hidden ? "Hidden door" : "Door"} in ${room?.name ?? room?.id ?? "room"}` : room?.name ?? "";
      cells.push(`<button type="button" class="${classes}" data-x="${x}" data-y="${y}" data-axis-x="${x}" data-axis-y="${y}" ${door ? `data-door-id="${escapeAttribute(doorId(room, door))}"` : ""} title="${escapeAttribute(title)}">${content}</button>`);
    }
  }
  els.grid.innerHTML = cells.join("");
  activateCreatorFurnitureImages(els.grid);
}

function selectedEntity() {
  return doorEntityById(state.selectedId) ??
    state.objects.find((object) => object.id === state.selectedId) ??
    state.monsters.find((monster) => monster.id === state.selectedId) ??
    state.rooms.find((room) => room.id === state.selectedId) ??
    null;
}

function itemName(itemId) {
  return state.customItems.find((item) => item.id === itemId)?.name ?? window.DungeonContent.get("items", itemId)?.name ?? itemId;
}

function itemTemplateForInfo(itemId) {
  return state.customItems.find((item) => item.id === itemId) ?? window.DungeonContent.get("items", itemId) ?? null;
}

function lootItemsMarkup(itemIds = []) {
  if (!itemIds.length) return "none";
  return `
    <div class="creator-inline-list">
      ${itemIds.map((itemId) => `
        <div class="creator-inline-entry">
          ${infoButton("item", itemId, `Inspect ${itemName(itemId)}`)}
          <span>${escapeHtml(itemName(itemId))}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function triggerEventLabel(event) {
  return {
    enterRoom: "Walk into room",
    inspectObject: "Inspect object",
    openObject: "Open/loot object",
    killMonster: "Kill monster",
  }[event] ?? "Story trigger";
}

function triggerTargetEntries(event = els.storyTriggerEvent.value) {
  if (event === "enterRoom") {
    return state.rooms.map((room) => ({ id: room.id, label: `${room.name} (${room.id})` }));
  }
  if (event === "killMonster") {
    return state.monsters.map((monster) => ({ id: monster.id, label: `${monster.name} (${monster.id})` }));
  }
  return state.objects.map((object) => {
    const template = window.DungeonContent.get("furniture", object.type);
    return { id: object.id, label: `${template?.name ?? object.type} (${object.id})` };
  });
}

function renderStoryTriggerTargetSelect() {
  const current = els.storyTriggerTarget.value;
  const entries = triggerTargetEntries();
  els.storyTriggerTarget.innerHTML = entries.length
    ? entries.map((entry) => `<option value="${entry.id}">${entry.label}</option>`).join("")
    : `<option value="">Add a matching target first</option>`;
  if (entries.some((entry) => entry.id === current)) els.storyTriggerTarget.value = current;
}

function storyTriggerTargetLabel(trigger) {
  return triggerTargetEntries(trigger.event).find((entry) => entry.id === trigger.targetId)?.label ?? trigger.targetId;
}

function renderStoryTriggerList() {
  els.storyTriggerList.innerHTML = state.storyTriggers.length
    ? state.storyTriggers.map((trigger) => `
      <div class="creator-list-item">
        <div>
          <b>${trigger.title || triggerEventLabel(trigger.event)}</b><br>
          <span class="small-note">${triggerEventLabel(trigger.event)}: ${storyTriggerTargetLabel(trigger)}${trigger.once === false ? " - repeatable" : ""}</span>
        </div>
        <div>
          <button type="button" data-trigger-action="edit" data-id="${trigger.id}">Edit</button>
          <button type="button" class="ghost-button" data-trigger-action="delete" data-id="${trigger.id}">Delete</button>
        </div>
      </div>
    `).join("")
    : `<p class="small-note">No story triggers yet.</p>`;
}

function readSelectedLockField(field) {
  return els.selectedCard.querySelector(`[${field}]`);
}

function updateObjectSpecialLockFromCard(object, changedField) {
  const enabledInput = readSelectedLockField("data-object-field='specialLockEnabled'");
  const enabled = Boolean(enabledInput?.checked);
  if (!enabled) {
    delete object.specialLock;
    if (objectHasLockComponent(object)) object.locked = false;
    if (changedField === "specialLockEnabled") renderSelected();
    return;
  }
  object.specialLock = {
    label: readSelectedLockField("data-object-field='specialLockLabel'")?.value.trim() || "Special Lock",
    prompt: readSelectedLockField("data-object-field='specialLockPrompt'")?.value.trim() || "Enter the key phrase.",
    answer: readSelectedLockField("data-object-field='specialLockAnswer'")?.value.trim() ?? "",
    caseSensitive: Boolean(readSelectedLockField("data-object-field='specialLockCaseSensitive'")?.checked),
  };
  object.locked = true;
  delete object.lockDc;
  if (changedField === "specialLockEnabled") renderSelected();
}

function updateDoorSpecialLockFromCard(entity, changedField) {
  const enabledInput = readSelectedLockField("data-door-lock-field='enabled'");
  const enabled = Boolean(enabledInput?.checked);
  if (!enabled) {
    delete entity.door.specialLock;
    if (changedField === "enabled") renderSelected();
    return;
  }
  entity.door.specialLock = {
    label: readSelectedLockField("data-door-lock-field='label'")?.value.trim() || "Special Lock",
    prompt: readSelectedLockField("data-door-lock-field='prompt'")?.value.trim() || "Enter the key phrase.",
    answer: readSelectedLockField("data-door-lock-field='answer'")?.value.trim() ?? "",
    caseSensitive: Boolean(readSelectedLockField("data-door-lock-field='caseSensitive'")?.checked),
  };
  if (changedField === "enabled") renderSelected();
}

function updateDoorHiddenFromCard(entity, changedField) {
  const hiddenInput = readSelectedLockField("data-door-hidden-field='hidden'");
  const hidden = Boolean(hiddenInput?.checked);
  if (!hidden) {
    delete entity.door.hidden;
    delete entity.door.spotDc;
    if (changedField === "hidden") renderSelected();
    return;
  }
  entity.door.hidden = true;
  entity.door.spotDc = Math.max(1, Number(readSelectedLockField("data-door-hidden-field='spotDc'")?.value) || 15);
  if (changedField === "hidden") renderSelected();
}

function clearStoryTriggerForm() {
  state.selectedStoryTriggerId = "";
  els.storyTriggerTitle.value = "";
  els.storyTriggerText.value = "";
  els.storyTriggerImages.value = "";
  els.storyTriggerOnce.checked = true;
  els.saveStoryTrigger.textContent = "Add Story Trigger";
  renderStoryTriggerTargetSelect();
}

function loadStoryTriggerForm(trigger) {
  if (!trigger) return;
  state.selectedStoryTriggerId = trigger.id;
  els.storyTriggerEvent.value = trigger.event;
  renderStoryTriggerTargetSelect();
  els.storyTriggerTarget.value = trigger.targetId;
  els.storyTriggerTitle.value = trigger.title ?? "";
  els.storyTriggerText.value = trigger.text ?? "";
  els.storyTriggerImages.value = (trigger.images ?? []).join("\n");
  els.storyTriggerOnce.checked = trigger.once !== false;
  els.saveStoryTrigger.textContent = "Update Story Trigger";
}

function storyTriggerFromForm() {
  const targetId = els.storyTriggerTarget.value;
  const event = els.storyTriggerEvent.value;
  const id = state.selectedStoryTriggerId || `story-trigger-${state.storyTriggers.length + 1}-${Date.now()}`;
  return {
    id,
    event,
    targetId,
    title: els.storyTriggerTitle.value.trim(),
    text: els.storyTriggerText.value.trim(),
    images: els.storyTriggerImages.value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
    once: els.storyTriggerOnce.checked,
  };
}

function detailRows(rows) {
  return `<dl>${rows
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "")
    .map(([label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`)
    .join("")}</dl>`;
}

function showCreatorInfo(title, subtitle, rows) {
  let modal = document.querySelector("#creator-info-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "creator-info-modal";
    modal.className = "creator-info-modal hidden";
    modal.innerHTML = `
      <div class="creator-info-panel" role="dialog" aria-modal="true" aria-labelledby="creator-info-title">
        <header>
          <div>
            <h3 id="creator-info-title"></h3>
            <span class="small-note" data-info-subtitle></span>
          </div>
          <button type="button" class="creator-info-button" data-close-info aria-label="Close">x</button>
        </header>
        <div data-info-body></div>
      </div>
    `;
    document.body.append(modal);
    modal.addEventListener("click", (event) => {
      if (event.target === modal || event.target.closest("[data-close-info]")) modal.classList.add("hidden");
    });
  }
  modal.querySelector("#creator-info-title").textContent = title;
  modal.querySelector("[data-info-subtitle]").textContent = subtitle;
  modal.querySelector("[data-info-body]").innerHTML = detailRows(rows);
  modal.classList.remove("hidden");
}

function showItemInfo(itemId) {
  const item = itemTemplateForInfo(itemId);
  if (!item) {
    showCreatorInfo(itemId, "Missing item", [["ID", itemId]]);
    return;
  }
  const magic = item.magic ?? {};
  const effects = magic.effects ?? {};
  const rows = [
    ["ID", item.id],
    ["Type", [item.type, item.category].filter(Boolean).join(" - ")],
    ["Value", itemValueText(item)],
    ["Weight", item.weightLb || item.weightLb === 0 ? `${item.weightLb} lb` : ""],
    ["Slots", joinReadable(item.slots)],
    ["Requires Attunement", item.requiresAttunement || magic.requiresAttunement ? "yes" : ""],
    ["Scroll Spell", item.scroll?.spellName],
    ["Scroll Level", isSpellScrollItem(item) ? spellScrollLevelLabel(spellScrollLevelValue(item)) : ""],
    ["Scroll Classes", joinReadable(item.scroll?.classes)],
    ["Damage", damageText(item.damage)],
    ["Armor", item.armor?.bonus ? `+${item.armor.bonus} AC` : item.armor?.base ? `AC ${item.armor.base}` : ""],
    ["Properties", joinReadable(item.properties)],
    ["Magic", [
      magic.rarity,
      magic.attackBonus ? `attack +${magic.attackBonus}` : "",
      magic.damageBonus ? `damage +${magic.damageBonus}` : "",
      magic.extraDamage?.length ? `extra ${magic.extraDamage.map(damageText).join(", ")}` : "",
      magic.resistances?.length ? `resist ${magic.resistances.join(", ")}` : "",
      magic.vulnerabilities?.length ? `vulnerable ${magic.vulnerabilities.join(", ")}` : "",
      effectSummary(effects),
    ].filter(Boolean).join("; ")],
    ["Special", joinReadable(magic.properties)],
    ["Use", item.use?.description ?? (item.use?.kind ? `${item.use.kind}${item.use.resource ? ` (${item.use.resource})` : ""}` : "")],
    ["Description", descriptionForEntry(item)],
    ["Tags", joinReadable(item.tags)],
  ];
  showCreatorInfo(item.name ?? item.id, "Item", rows);
}

function showMonsterInfo(monsterId) {
  const placed = state.monsters.find((monster) => monster.id === monsterId);
  const monster = placed ? { ...(window.DungeonContent.get("monsters", placed.monsterId) ?? {}), ...(placed.overrides ?? {}), id: placed.id, name: placed.name } : window.DungeonContent.get("monsters", monsterId);
  if (!monster) {
    showCreatorInfo(monsterId, "Missing monster", [["ID", monsterId]]);
    return;
  }
  const lootItems = placed?.extraLoot ?? monster.extraLoot ?? monster.loot ?? [];
  const rows = [
    ["ID", monster.id],
    ["Template", placed?.monsterId],
    ["Category", Number.isFinite(monster.category) ? String(monster.category) : ""],
    ["Role", monster.role],
    ["HP", monster.maxHp],
    ["AC", monster.ac],
    ["Speed", monster.speedFeet ? `${monster.speedFeet} ft` : ""],
    ["Attack Bonus", monster.attackBonus],
    ["Damage", monster.damage?.label ?? damageText(monster.damage)],
    ["Senses", Object.entries(monster.senses ?? {}).map(([sense, value]) => `${sense} ${value === true ? "" : value}`).join(", ")],
    ["Saves", joinReadable(monster.savingThrowProficiencies)],
    ["Skills", joinReadable(monster.skillProficiencies)],
    ["Resistances", joinReadable(monster.damageResistances)],
    ["Vulnerabilities", joinReadable(monster.damageVulnerabilities)],
    ["Immunities", joinReadable(monster.damageImmunities)],
    ["Condition Immunities", joinReadable(monster.conditionImmunities)],
    ["Special", joinReadable(monster.specialAbility)],
    ["Equipment", Object.entries(monster.equipment ?? {}).map(([slot, item]) => `${slot}: ${item}`).join(", ")],
    ["Loot", lootItems.map(itemName).join(", ")],
    ["Description", descriptionForEntry(monster)],
    ["Tags", joinReadable(monster.tags)],
  ];
  showCreatorInfo(monster.name ?? monster.id, "Monster", rows);
}

function saveStoryTrigger() {
  const trigger = storyTriggerFromForm();
  if (!trigger.targetId) {
    setStatus("Add the target room, object, or monster before saving this story trigger.");
    return;
  }
  if (!trigger.text && trigger.images.length === 0) {
    setStatus("Story triggers need text or at least one image URL.");
    return;
  }
  const index = state.storyTriggers.findIndex((entry) => entry.id === trigger.id);
  if (index >= 0) state.storyTriggers[index] = trigger;
  else state.storyTriggers.push(trigger);
  state.selectedStoryTriggerId = trigger.id;
  setStatus(`Saved story trigger for ${storyTriggerTargetLabel(trigger)}.`);
  renderAll();
  loadStoryTriggerForm(trigger);
}

function removeStoryTriggersForTarget(targetId) {
  state.storyTriggers = state.storyTriggers.filter((trigger) => trigger.targetId !== targetId);
  if (state.selectedStoryTriggerId && !state.storyTriggers.some((trigger) => trigger.id === state.selectedStoryTriggerId)) {
    clearStoryTriggerForm();
  }
}

function renderSelected() {
  const selected = selectedEntity();
  if (!selected) {
    els.selectedCard.innerHTML = "Nothing selected.";
    return;
  }
  if (selected.__door) {
    const lock = specialLockDraft(selected.door.specialLock);
    const enabled = Boolean(selected.door.specialLock);
    const hidden = Boolean(selected.door.hidden);
    const spotDc = Math.max(1, Number(selected.door.spotDc) || 15);
    els.selectedCard.innerHTML = `<b>Door</b><br>Door in ${escapeHtml(selected.room.name ?? selected.room.id)} at ${selected.door.x}, ${selected.door.y}
      <label><input data-door-lock-field="enabled" type="checkbox" ${enabled ? "checked" : ""} /> Special phrase lock</label>
      <label>Lock name <input data-door-lock-field="label" value="${escapeAttribute(lock.label)}" ${enabled ? "" : "disabled"} /></label>
      <label>Prompt <input data-door-lock-field="prompt" value="${escapeAttribute(lock.prompt)}" ${enabled ? "" : "disabled"} /></label>
      <label>Correct key <input data-door-lock-field="answer" value="${escapeAttribute(lock.answer)}" ${enabled ? "" : "disabled"} /></label>
      <label><input data-door-lock-field="caseSensitive" type="checkbox" ${lock.caseSensitive ? "checked" : ""} ${enabled ? "" : "disabled"} /> Case-sensitive answer</label>
      <small>When a player opens this door, they must enter the exact configured key before it opens.</small>
      <hr>
      <label><input data-door-hidden-field="hidden" type="checkbox" ${hidden ? "checked" : ""} /> Hidden door</label>
      <label>Spot DC <input data-door-hidden-field="spotDc" type="number" min="1" value="${spotDc}" ${hidden ? "" : "disabled"} /></label>
      <small>Hidden doors look like normal wall until a passive or active Investigation check reveals them.</small>`;
    return;
  }
  if (selected.monsterId) {
    const template = window.DungeonContent.get("monsters", selected.monsterId);
    els.selectedCard.innerHTML = `<div class="creator-inline-entry"><b>${escapeHtml(selected.name)}</b>${infoButton("monster", selected.id, `Inspect ${selected.name}`)}</div>${selected.isBoss ? "Boss " : ""}Monster at ${selected.position.x}, ${selected.position.y}<br>
      <label>Name <input data-monster-field="name" value="${selected.name}" /></label>
      <label>HP <input data-monster-field="maxHp" type="number" value="${selected.overrides?.maxHp ?? template?.maxHp ?? ""}" /></label>
      <label>AC <input data-monster-field="ac" type="number" value="${selected.overrides?.ac ?? template?.ac ?? ""}" /></label>
      <label>Attack bonus <input data-monster-field="attackBonus" type="number" value="${selected.overrides?.attackBonus ?? template?.attackBonus ?? ""}" /></label>
      <label>Damage dice count <input data-monster-field="damageCount" type="number" value="${selected.overrides?.damage?.count ?? template?.damage?.count ?? ""}" /></label>
      <label>Damage die sides <input data-monster-field="damageSides" type="number" value="${selected.overrides?.damage?.sides ?? template?.damage?.sides ?? ""}" /></label>
      <label>Damage bonus <input data-monster-field="damageBonus" type="number" value="${selected.overrides?.damage?.bonus ?? template?.damage?.bonus ?? ""}" /></label>
      <label>Damage label <input data-monster-field="damageLabel" value="${selected.overrides?.damage?.label ?? template?.damage?.label ?? ""}" /></label>
      <label>Main hand item id <input data-monster-field="mainHand" value="${selected.overrides?.equipment?.mainHand ?? template?.equipment?.mainHand ?? ""}" /></label>
      <label>Armor item id <input data-monster-field="torso" value="${selected.overrides?.equipment?.torso ?? template?.equipment?.torso ?? ""}" /></label>
      <small>Extra loot:</small>${lootItemsMarkup(selected.extraLoot ?? [])}`;
    return;
  }
  if (selected.type) {
    const def = window.DungeonContent.get("furniture", selected.type);
    const isFloorTrap = objectIsFloorTrapType(selected.type);
    const placementArea = cellPlacementArea(selected.position);
    const trapDamage = isFloorTrap ? damageText(trapDamageForTemplate(def)) : "";
    const selectedSpotDc = Math.max(1, Number(selected.spotDc) || trapDefaultSpotDc(def));
    const lock = (def?.components ?? []).find((component) => component?.type === "lock");
    const specialLock = specialLockDraft(selected.specialLock);
    const specialLockEnabled = Boolean(selected.specialLock);
    const canUseSpecialLock = objectCanUseSpecialLock(selected);
    const canUseContainerTrap = objectCanUseContainerTrap(selected);
    const trapDraft = containerTrapDraft(selected.trap);
    const trapOptions = containerTrapOptionList(trapDraft.id);
    const spawner = normalizeCreatorSpawnerConfig(selected.spawner);
    const recruit = normalizeCreatorRecruitConfig(selected.recruit);
    const isContinuousSpawner = selected.type === "continuous-spawner";
    const isRecruitmentMarker = selected.type === "recruitment-marker";
    els.selectedCard.innerHTML = `<b>${def?.name ?? selected.type}</b><br>${def?.kind === "trap" ? "Trap" : "Furniture"} at ${selected.position.x}, ${selected.position.y}${placementArea?.type === "corridor" ? " in hallway" : ""}<br>
      ${isFloorTrap ? `Damage: ${escapeHtml(trapDamage || "unknown")}<br><label>Spot DC <input data-object-field="spotDc" type="number" min="1" value="${selectedSpotDc}" /></label>` : `Loot: ${lootItemsMarkup(selected.items ?? [])}`}
      ${
        isContinuousSpawner
          ? `<hr>
             <b>Continuous Spawner</b>
             <label>Monster ids <textarea data-object-field="spawnerMonsterIds" rows="3">${escapeHtml((spawner.monsterIds ?? []).join(", "))}</textarea></label>
             <button type="button" data-action="spawner-add-selected-monster" ${state.selectedMonsterId ? "" : "disabled"}>Add selected monster</button>
             <label>Interval seconds <input data-object-field="spawnerIntervalSeconds" type="number" min="6" value="${spawner.intervalSeconds}" /></label>
             <label>Spawn count <input data-object-field="spawnerCount" type="number" min="1" value="${spawner.count}" /></label>
             <label>Max alive from this spawner <input data-object-field="spawnerMaxAlive" type="number" min="1" value="${spawner.maxAlive}" /></label>
             <small>This marker is invisible to players and spawns valid selected monsters around itself.</small>`
          : ""
      }
      ${
        isRecruitmentMarker
          ? `<hr>
             <b>Recruitment Marker</b>
             <label>Dialogue title <input data-object-field="recruitDialogueTitle" value="${escapeAttribute(recruit.dialogueTitle)}" /></label>
             <label>Dialogue text <textarea data-object-field="recruitDialogueText" rows="3">${escapeHtml(recruit.dialogueText)}</textarea></label>
             <div class="creator-row">
               <label>Recruit button <input data-object-field="recruitLabel" value="${escapeAttribute(recruit.recruitLabel)}" /></label>
               <label>Back button <input data-object-field="recruitBackLabel" value="${escapeAttribute(recruit.backLabel)}" /></label>
             </div>
             <div class="creator-row">
               <label>Saved recruit <select data-object-field="savedRecruitId">${savedRecruitOptions()}</select></label>
               <button type="button" data-action="recruit-use-saved">Use saved recruit</button>
             </div>
             <label>Recruit JSON <textarea data-object-field="recruitOverridesText" rows="8">${escapeHtml(recruit.overridesText || "{}")}</textarea></label>
             <small>Pick a saved recruit from creator-recruits.json or paste JSON from the Recruit Creator. The recruit appears when this room is revealed, then joins only if clicked and recruited.</small>`
          : ""
      }
      ${
        lock && !specialLockEnabled
          ? `<label><input data-object-field="locked" type="checkbox" ${selected.locked ? "checked" : ""} /> Locked in this dungeon</label>
             <label>Lock DC <input data-object-field="lockDc" type="number" value="${selected.lockDc ?? lock.dc ?? 12}" /></label>`
          : ""
      }
      ${
        canUseSpecialLock
          ? `<label><input data-object-field="specialLockEnabled" type="checkbox" ${specialLockEnabled ? "checked" : ""} /> Special phrase lock</label>
             <label>Lock name <input data-object-field="specialLockLabel" value="${escapeAttribute(specialLock.label)}" ${specialLockEnabled ? "" : "disabled"} /></label>
             <label>Prompt <input data-object-field="specialLockPrompt" value="${escapeAttribute(specialLock.prompt)}" ${specialLockEnabled ? "" : "disabled"} /></label>
             <label>Correct key <input data-object-field="specialLockAnswer" value="${escapeAttribute(specialLock.answer)}" ${specialLockEnabled ? "" : "disabled"} /></label>
             <label><input data-object-field="specialLockCaseSensitive" type="checkbox" ${specialLock.caseSensitive ? "checked" : ""} ${specialLockEnabled ? "" : "disabled"} /> Case-sensitive answer</label>`
          : ""
      }
      ${
        canUseContainerTrap
          ? `<label><input data-object-field="trapEnabled" type="checkbox" ${selected.trap ? "checked" : ""} /> Trapped container</label>
             <label>Trap
               <select data-object-field="trapId" ${selected.trap ? "" : "disabled"}>
                 ${trapOptions}
               </select>
             </label>
             <label>Trap Spot DC <input data-object-field="trapSpotDc" type="number" value="${trapDraft.spotDc}" ${selected.trap ? "" : "disabled"} /></label>
             ${selected.trap ? `<small>Damage: ${escapeHtml(damageText(selected.trap.damage))}</small>` : ""}
             ${selected.trap?.description ? `<small>${escapeHtml(selected.trap.description)}</small>` : ""}`
          : ""
      }
      <div class="room-move-controls">
        <span></span><button type="button" data-action="move-object" data-dx="0" data-dy="-1">↑</button><span></span>
        <button type="button" data-action="move-object" data-dx="-1" data-dy="0">←</button><span>•</span><button type="button" data-action="move-object" data-dx="1" data-dy="0">→</button>
        <span></span><button type="button" data-action="move-object" data-dx="0" data-dy="1">↓</button><span></span>
      </div>
      ${Math.max(def?.width ?? 1, def?.height ?? 1) > 1 ? `<button type="button" data-action="rotate-object">Rotate</button>` : ""}`;
    return;
  }
  els.selectedCard.innerHTML = `
    <b>${selected.name}</b><br>
    <label>Room name <input data-room-field="name" value="${escapeAttribute(selected.name)}" /></label>
    ${selected.cells.length} cells at ${selected.x}, ${selected.y}
    <div class="room-move-controls" aria-label="Move selected room">
      <span></span>
      <button type="button" data-action="move-room" data-dx="0" data-dy="-1">↑</button>
      <span></span>
      <button type="button" data-action="move-room" data-dx="-1" data-dy="0">←</button>
      <span>•</span>
      <button type="button" data-action="move-room" data-dx="1" data-dy="0">→</button>
      <span></span>
      <button type="button" data-action="move-room" data-dx="0" data-dy="1">↓</button>
      <span></span>
    </div>
  `;
}

function renderRoomList() {
  els.roomList.innerHTML = state.rooms.length
    ? state.rooms
        .map(
          (room) => `
            <button type="button" data-room-select="${room.id}" class="${room.id === state.selectedId ? "active" : ""}">
              <b>${room.name}</b><br><span class="small-note">${room.id} at ${room.x}, ${room.y}</span>
            </button>
          `,
        )
        .join("")
    : `<p class="small-note">No rooms yet.</p>`;
}

function creatorListCategory(title, body, { open = false } = {}) {
  return `
    <details class="creator-list-category" ${open ? "open" : ""}>
      <summary>${escapeHtml(title)}</summary>
      <div class="creator-list-category-body">${body}</div>
    </details>
  `;
}

function renderSavedDungeons() {
  const entries = window.DungeonCustom?.list?.() ?? [];
  const body = entries.length
    ? entries.map((entry) => `
      <div class="creator-list-item">
        <div><b>${entry.name}</b><br><span class="small-note">${entry.id}</span></div>
        <div>
          <button type="button" data-action="load" data-id="${entry.id}">Load</button>
          <button type="button" class="ghost-button" data-action="delete" data-id="${entry.id}">Delete</button>
        </div>
      </div>
    `).join("")
    : `<p class="small-note">No custom dungeons saved yet.</p>`;
  els.savedDungeons.innerHTML = creatorListCategory(`Custom Dungeons (${entries.length})`, body, { open: true });
}

function renderOneShotDungeons() {
  if (!els.oneShotDungeons) return;
  const entries = window.DungeonOneShots?.list?.() ?? [];
  const body = entries.length
    ? entries.map((entry) => {
      const overridden = window.DungeonOneShots?.hasOverride?.(entry.id);
      return `
        <div class="creator-list-item">
          <div>
            <b>${escapeHtml(entry.name)}</b><br>
            <span class="small-note">One-shot template${overridden ? " - edited override" : ""}</span>
          </div>
          <div>
            <button type="button" data-action="load-one-shot" data-id="${escapeAttribute(entry.id)}">Load</button>
            ${overridden ? `<button type="button" class="ghost-button" data-action="load-original-one-shot" data-id="${escapeAttribute(entry.id)}">Original</button>` : ""}
            ${overridden ? `<button type="button" class="ghost-button" data-action="reset-one-shot" data-id="${escapeAttribute(entry.id)}">Reset</button>` : ""}
          </div>
        </div>
      `;
    }).join("")
    : `<p class="small-note">No one-shot dungeons found.</p>`;
  els.oneShotDungeons.innerHTML = creatorListCategory(`One-Shot Dungeons (${entries.length})`, body);
}

async function renderCampaignDungeons() {
  if (!els.campaignDungeons || !window.DungeonCampaigns) return;
  els.campaignDungeons.innerHTML = creatorListCategory("Campaign Dungeons", `<p class="small-note">Loading campaign dungeons...</p>`);
  const campaigns = window.DungeonCampaigns.list();
  const sections = [];
  for (const campaign of campaigns) {
    const rows = await Promise.all(
      Array.from({ length: campaign.count }, async (_, index) => {
        const number = index + 1;
        const template = await window.DungeonCampaigns.dungeon(campaign.id, number);
        const overridden = window.DungeonCampaigns.hasOverride?.(campaign.id, number);
        return `
          <div class="creator-list-item">
            <div>
              <b>${number}. ${escapeHtml(template?.name ?? `Dungeon ${number}`)}</b><br>
              <span class="small-note">${escapeHtml(campaign.name)}${overridden ? " - edited override" : ""}</span>
            </div>
            <div>
              <button type="button" data-action="load-campaign" data-campaign="${escapeAttribute(campaign.id)}" data-index="${number}">Load</button>
              ${overridden ? `<button type="button" class="ghost-button" data-action="load-original-campaign" data-campaign="${escapeAttribute(campaign.id)}" data-index="${number}">Original</button>` : ""}
              ${overridden ? `<button type="button" class="ghost-button" data-action="reset-campaign" data-campaign="${escapeAttribute(campaign.id)}" data-index="${number}">Reset</button>` : ""}
            </div>
          </div>
        `;
      }),
    );
    sections.push(creatorListCategory(`${campaign.name} (${campaign.count})`, rows.join("")));
  }
  els.campaignDungeons.innerHTML = creatorListCategory("Campaign Dungeons", sections.join("") || `<p class="small-note">No campaign dungeons found.</p>`);
  renderCampaignSaveState();
}

async function renderSettlementLayouts() {
  if (!els.settlementLayouts || !window.DungeonSettlementLayouts) return;
  const entries = window.DungeonSettlementLayouts.list();
  const body = entries.length
    ? entries.map((entry) => `
      <div class="creator-list-item">
        <div>
          <b>${escapeHtml(entry.name)}</b><br>
          <span class="small-note">${escapeHtml(entry.kind === "camp" ? "Travel camp source" : "Inn source")} - ${escapeHtml(entry.id)}</span>
        </div>
        <div>
          <button type="button" data-action="load-settlement-layout" data-id="${escapeAttribute(entry.id)}">Load</button>
          <button type="button" class="ghost-button" data-action="load-original-settlement-layout" data-id="${escapeAttribute(entry.id)}">Built-In</button>
        </div>
      </div>
    `).join("")
    : `<p class="small-note">No settlement layouts found.</p>`;
  els.settlementLayouts.innerHTML = creatorListCategory("Settlement Inns / Camps", body);
}

function renderCampaignSaveState() {
  if (!els.saveCampaignOverride) return;
  const campaignSource = state.campaignSource;
  const oneShotSource = state.oneShotSource;
  const settlementLayoutSource = state.settlementLayoutSource;
  els.saveCampaignOverride.disabled = !campaignSource && !oneShotSource && !settlementLayoutSource;
  els.saveCampaignOverride.textContent = campaignSource
    ? `Overwrite ${campaignSource.campaignName ?? campaignSource.campaignId} Dungeon ${campaignSource.campaignIndex}`
    : oneShotSource
      ? `Overwrite ${oneShotSource.name ?? oneShotSource.id}`
      : settlementLayoutSource
        ? `Overwrite ${settlementLayoutSource.name ?? settlementLayoutSource.id}`
    : "Overwrite Loaded Source";
  if (els.topSaveDungeon) {
    els.topSaveDungeon.textContent = campaignSource || oneShotSource || settlementLayoutSource ? "Overwrite" : "Save";
  }
}

function hasLoadedSource() {
  return Boolean(state.campaignSource || state.oneShotSource || state.settlementLayoutSource);
}

function canRerollRandomLayout() {
  return (
    state.objects.length === 0 &&
    state.monsters.length === 0 &&
    state.storyTriggers.length === 0
  );
}

function renderRandomLayoutControls() {
  if (!els.randomLayout) return;
  const width = Math.max(1, Math.min(3, Number(els.hallwayWidth?.value) || state.hallwayWidth || 1));
  state.hallwayWidth = width;
  if (els.hallwayWidthLabel) els.hallwayWidthLabel.textContent = `${width} square${width === 1 ? "" : "s"}`;
  els.randomLayout.disabled = !canRerollRandomLayout() && !hasLoadedSource();
}

function creatorValidationItems() {
  const goal = goalFromForm();
  const goalTargetReady =
    goal.type === "reachExit" ||
    goal.type === "killBoss" ||
    goal.type === "escortNpc" ||
    Boolean(goal.itemId || goal.monsterId);
  return [
    { label: "Rooms", ready: state.rooms.length > 0, detail: `${state.rooms.length}` },
    { label: "Party start", ready: Boolean(state.start), detail: state.start ? `${state.start.position.x}, ${state.start.position.y}` : "missing" },
    { label: "Exit", ready: Boolean(state.exit), detail: state.exit ? `${state.exit.position.x}, ${state.exit.position.y}` : "missing" },
    { label: "Goal", ready: goalTargetReady, detail: goal.type },
    { label: "Monsters", ready: state.monsters.length > 0, detail: `${state.monsters.length}` },
    { label: "Story triggers", ready: true, detail: `${state.storyTriggers.length}` },
  ];
}

function renderCreatorSummary() {
  if (els.mapSummary) {
    els.mapSummary.textContent = `${state.rooms.length} room${state.rooms.length === 1 ? "" : "s"} - ${state.objects.length} object${state.objects.length === 1 ? "" : "s"} - ${state.monsters.length} monster${state.monsters.length === 1 ? "" : "s"}`;
  }
  if (!els.validation) return;
  els.validation.innerHTML = creatorValidationItems()
    .map((item) => `<div class="${item.ready ? "ready" : "warn"}"><span>${escapeHtml(item.label)}</span><b>${escapeHtml(item.detail)}</b></div>`)
    .join("");
}

function renderExport() {
  els.exportJson.value = JSON.stringify(templateFromState({ includeCampaignSource: Boolean(state.campaignSource) }), null, 2);
}

function renderAll() {
  repairDuplicateRoomIds();
  renderTools();
  renderFurnitureCatalogue();
  renderMonsterCatalogue();
  renderStoryTriggerTargetSelect();
  renderStoryTriggerList();
  renderGrid();
  renderRoomList();
  renderSelected();
  renderSavedDungeons();
  void renderSettlementLayouts();
  renderCampaignSaveState();
  renderRandomLayoutControls();
  renderCreatorSummary();
  renderExport();
}

function addRoom() {
  const x = Number(els.roomX.value) || 1;
  const y = Number(els.roomY.value) || 1;
  const width = Math.max(3, Number(els.roomW.value) || 5);
  const height = Math.max(3, Number(els.roomH.value) || 5);
  const roomNumber = nextUniqueRoomNumber();
  const id = `room-${roomNumber}`;
  const cells = roomCellsForRect(x, y, width, height);
  state.rooms.push({
    id,
    name: `${els.roomName.value || "Dungeon Room"} ${roomNumber}`,
    shape: "rectangle",
    x,
    y,
    width,
    height,
    cells,
    doors: [],
    connections: [],
  });
  state.selectedId = id;
  renderAll();
}

function connectRooms(a, b) {
  if (!a || !b || a.id === b.id || a.connections.includes(b.id)) return;
  const aConnection = nearestBoundaryDoor(a, roomCenter(b));
  const bConnection = nearestBoundaryDoor(b, roomCenter(a));
  if (!aConnection || !bConnection) return;
  const baseCells = carvePath(aConnection.outside, bConnection.outside);
  const cells = widenPath(baseCells);
  const passage = makeCorridorPassage(nextCorridorPassageId(), cells, { roomIds: [a.id, b.id] });
  state.corridors = uniqueCells([...state.corridors, ...cells]);
  state.corridorPassages.push(passage);
  a.doors.push({ ...aConnection.door, corridor: { ...aConnection.outside }, to: b.id });
  b.doors.push({ ...bConnection.door, corridor: { ...bConnection.outside }, to: a.id });
  a.connections.push(b.id);
  b.connections.push(a.id);
  state.connectFromRoomId = "";
}

function uniqueValues(values) {
  return Array.from(new Set(values));
}

function addManualHallway(start, end, cells) {
  if (!start || !end || cells.length === 0) return;
  if (start.room && end.room && start.room.id === end.room.id) return;
  const basePath = uniqueCells(cells);
  const path = uniqueCells(widenPath(basePath));
  state.corridors = uniqueCells([...state.corridors, ...path]);
  state.corridorPassages.push(makeCorridorPassage(nextCorridorPassageId(), path, { roomIds: [start.room?.id, end.room?.id].filter(Boolean) }));
  if (start.room) start.room.doors.push({ ...start.position, corridor: { ...basePath[0] }, ...(end.room ? { to: end.room.id } : {}) });
  if (end.room) end.room.doors.push({ ...end.position, corridor: { ...basePath.at(-1) }, ...(start.room ? { to: start.room.id } : {}) });
  if (start.room && end.room) {
    start.room.connections = uniqueValues([...(start.room.connections ?? []), end.room.id]);
    end.room.connections = uniqueValues([...(end.room.connections ?? []), start.room.id]);
  }
}

function handleHallwayClick(position) {
  const room = roomAt(position);
  const onCorridor = state.corridors.some((cell) => key(cell) === key(position));
  if (!state.hallwayStart) {
    if ((!room || !isBoundaryCell(room, position)) && !onCorridor) return;
    state.hallwayStart = { room: room && isBoundaryCell(room, position) ? room : null, position: { ...position } };
    state.hallwayCells = [];
    setStatus("Hallway started. Click adjacent tiles, then finish on another room wall or an existing hallway.");
    return;
  }
  if ((room && isBoundaryCell(room, position)) || onCorridor) {
    if (room && state.hallwayStart.room && room.id === state.hallwayStart.room.id) return;
    if (state.hallwayCells.length === 0) return;
    const previous = state.hallwayCells.at(-1) ?? state.hallwayStart.position;
    if (distance(previous, position) !== 1) return;
    addManualHallway(state.hallwayStart, { room: room && isBoundaryCell(room, position) ? room : null, position: { ...position } }, state.hallwayCells);
    state.hallwayStart = null;
    state.hallwayCells = [];
    setStatus("Hallway added.");
    return;
  }
  const previous = state.hallwayCells.at(-1) ?? state.hallwayStart.position;
  if (distance(previous, position) !== 1) return;
  state.hallwayCells.push({ ...position });
}

function rebuildAllCorridors() {
  const pairs = [];
  for (const room of state.rooms) {
    for (const targetId of room.connections ?? []) {
      if (room.id < targetId) pairs.push([room.id, targetId]);
    }
    room.doors = [];
  }
  state.corridors = [];
  state.corridorPassages = [];
  for (const [aId, bId] of pairs) {
    const a = state.rooms.find((room) => room.id === aId);
    const b = state.rooms.find((room) => room.id === bId);
    if (!a || !b) continue;
    a.connections = (a.connections ?? []).filter((id) => id !== b.id);
    b.connections = (b.connections ?? []).filter((id) => id !== a.id);
    connectRooms(a, b);
  }
}

function moveSelectedRoom(dx, dy) {
  const room = selectedEntity();
  if (!room?.cells || (!dx && !dy)) return;
  const nextX = room.x + dx;
  const nextY = room.y + dy;
  const nextCells = roomCellsForRect(nextX, nextY, room.width, room.height);
  if (nextCells.length !== room.width * room.height) return;
  const ownKeys = new Set(room.cells.map(key));
  const overlapsOtherRoom = nextCells.some((cell) => {
    const occupant = roomAt(cell);
    return occupant && occupant.id !== room.id && !ownKeys.has(key(cell));
  });
  if (overlapsOtherRoom) return;
  const delta = { x: dx, y: dy };
  room.x = nextX;
  room.y = nextY;
  room.cells = nextCells;
  state.objects.filter((object) => object.roomId === room.id).forEach((object) => {
    object.position = { x: object.position.x + delta.x, y: object.position.y + delta.y };
  });
  state.monsters.filter((monster) => monster.roomId === room.id).forEach((monster) => {
    monster.position = { x: monster.position.x + delta.x, y: monster.position.y + delta.y };
  });
  if (state.exit?.roomId === room.id) {
    state.exit.position = { x: state.exit.position.x + delta.x, y: state.exit.position.y + delta.y };
  }
  if (state.start?.roomId === room.id) {
    state.start.position = { x: state.start.position.x + delta.x, y: state.start.position.y + delta.y };
  }
  rebuildAllCorridors();
  renderAll();
}

function previewDraggedRoom(room, dx, dy, origin = { x: room.x, y: room.y }) {
  const nextX = origin.x + dx;
  const nextY = origin.y + dy;
  const nextCells = roomCellsForRect(nextX, nextY, room.width, room.height);
  if (nextCells.length !== room.width * room.height) return null;
  const ownKeys = new Set(room.cells.map(key));
  const overlapsOtherRoom = nextCells.some((cell) => {
    const occupant = roomAt(cell);
    return occupant && occupant.id !== room.id && !ownKeys.has(key(cell));
  });
  return overlapsOtherRoom ? null : { x: nextX, y: nextY, cells: nextCells };
}

function beginRoomDrag(position) {
  if (state.tool !== "select") return;
  if (doorAt(position)) return;
  const room = roomAt(position);
  if (!room || monsterAt(position) || objectAt(position)) return;
  state.selectedId = room.id;
  state.roomDrag = {
    roomId: room.id,
    startPointer: { ...position },
    origin: { x: room.x, y: room.y },
    lastDelta: { x: 0, y: 0 },
  };
  renderAll();
}

function updateRoomDrag(position) {
  const drag = state.roomDrag;
  if (!drag) return;
  const room = state.rooms.find((entry) => entry.id === drag.roomId);
  if (!room) return;
  const dx = position.x - drag.startPointer.x;
  const dy = position.y - drag.startPointer.y;
  if (dx === drag.lastDelta.x && dy === drag.lastDelta.y) return;
  drag.lastDelta = { x: dx, y: dy };
  const preview = previewDraggedRoom(room, dx, dy, drag.origin);
  if (!preview) return;
  room.x = preview.x;
  room.y = preview.y;
  room.cells = preview.cells;
  renderGrid();
  renderRoomList();
  renderSelected();
}

function finishRoomDrag() {
  const drag = state.roomDrag;
  if (!drag) return;
  const room = state.rooms.find((entry) => entry.id === drag.roomId);
  if (!room) {
    state.roomDrag = null;
    return;
  }
  const dx = room.x - drag.origin.x;
  const dy = room.y - drag.origin.y;
  room.x = drag.origin.x;
  room.y = drag.origin.y;
  room.cells = roomCellsForRect(room.x, room.y, room.width, room.height);
  state.roomDrag = null;
  if (dx || dy) moveSelectedRoom(dx, dy);
  else renderAll();
}

function moveSelectedObject(dx, dy) {
  const object = selectedEntity();
  if (!object?.type || (!dx && !dy)) return;
  const position = { x: object.position.x + dx, y: object.position.y + dy };
  const nextObject = { ...object, position };
  const area = cellPlacementArea(position);
  if (!objectFitsPlacementArea(nextObject, area) || objectCellsForCreator(nextObject).some((cell) => occupied(cell, object.id, object.type))) return;
  object.position = position;
  object.roomId = area?.type === "room" ? area.id : null;
  renderAll();
}

function rotateSelectedObject() {
  const object = selectedEntity();
  if (!object?.type) return;
  const template = window.DungeonContent.get("furniture", object.type);
  const width = object.width ?? template?.width ?? 1;
  const height = object.height ?? template?.height ?? 1;
  if (width === height) return;
  const rotated = { ...object, width: height, height: width };
  const area = cellPlacementArea(object.position);
  if (!objectFitsPlacementArea(rotated, area) || objectCellsForCreator(rotated).some((cell) => occupied(cell, object.id, object.type))) return;
  object.width = height;
  object.height = width;
  renderAll();
}

function createCustomItem() {
  const template = window.DungeonContent.get("items", els.customItemTemplate.value);
  if (!template) return;
  const id = `custom-item-${state.customItems.length + 1}`;
  const description = els.customItemDescription.value.trim() || template.handout?.text || template.description || template.magic?.description || template.treasure?.description || "";
  const valueGp = Math.max(0, Number(els.customItemValue.value) || 0);
  const customItem = {
    ...clone(template),
    id,
    baseItemId: id,
    name: els.customItemName.value.trim() || `${template.name} Variant`,
    description,
    customDungeonItem: true,
    customDescription: description,
    type: els.customItemType.value.trim() || template.type,
    weightLb: Number(els.customItemWeight.value) || template.weightLb || 0,
    cost: { amount: valueGp, unit: "gp" },
  };
  customItem.cost.text = itemValueText(customItem);
  if (customItem.magic) customItem.magic = { ...customItem.magic, description };
  if (customItem.treasure) customItem.treasure = { ...customItem.treasure, description };
  if (customItem.type === "handout" || template.type === "handout" || template.handout) {
    const categories = parseListInput(els.customItemTags?.value || (template.handout?.categories ?? []).join(", "));
    const temporary = Boolean(els.customItemTemporary?.checked);
    customItem.type = "handout";
    customItem.category = "journal";
    customItem.tomeInventory = "party";
    customItem.temporaryTome = temporary;
    customItem.expiresOnDungeonExit = temporary;
    customItem.journalCategories = categories;
    customItem.tags = Array.from(new Set([...(customItem.tags ?? []), "handout", "journal", "ancient-tome", ...(temporary ? ["temporary-note"] : []), ...categories]));
    customItem.handout = {
      ...(template.handout ?? {}),
      ...(customItem.handout ?? {}),
      title: customItem.name,
      text: description,
      format: customItem.handout?.format ?? template.handout?.format ?? "markdown-lite",
      categories,
      temporary,
    };
  }
  state.customItems.push(customItem);
  renderCatalogueFilters();
  renderItemSelects();
  renderExport();
  setStatus(`Created local item ${state.customItems.at(-1).name}.`);
}

function placeFurniture(position) {
  if (!state.selectedFurnitureId) return;
  const template = window.DungeonContent.get("furniture", state.selectedFurnitureId);
  if (!furnitureEntryMatchesTool(template, state.tool)) return;
  const id = `${state.selectedFurnitureId}-${state.objects.length + 1}`;
  const area = cellPlacementArea(position);
  const object = {
    id,
    type: state.selectedFurnitureId,
    position: { ...position },
    items: [],
    roomId: area?.type === "room" ? area.id : null,
    ...(objectIsFloorTrapType(state.selectedFurnitureId) ? { spotDc: trapDefaultSpotDc(template) } : {}),
  };
  if (objectHasLockComponent(object)) object.locked = false;
  if (state.selectedFurnitureId === "continuous-spawner") object.spawner = normalizeCreatorSpawnerConfig({ monsterIds: state.selectedMonsterId || "forestWolf" });
  if (state.selectedFurnitureId === "recruitment-marker") object.recruit = normalizeCreatorRecruitConfig({ monsterId: state.selectedMonsterId || "forestWolf" });
  if (!objectFitsPlacementArea(object, area) || objectCellsForCreator(object).some((cell) => occupied(cell, "", object.type))) return;
  state.objects.push(object);
  state.selectedId = id;
}

function placeMonster(position) {
  const room = roomAt(position);
  const template = window.DungeonContent.get("monsters", state.selectedMonsterId);
  if (!room || !state.selectedMonsterId || !template || !monsterCanFitAt(template, room, position)) return;
  const id = `${els.monsterIsBoss.checked ? "boss" : "monster"}-custom-${state.monsters.length + 1}`;
  state.monsters.push({
    id,
    monsterId: state.selectedMonsterId,
    name: template.name,
    position: { ...position },
    roomId: room.id,
    isBoss: els.monsterIsBoss.checked,
    extraLoot: [],
    overrides: {},
  });
  state.selectedId = id;
}

function setExit(position) {
  const room = roomAt(position);
  if (!room) return;
  state.exit = { roomId: room.id, position: { ...position } };
  setStatus(`Exit placed at ${position.x}, ${position.y}.`);
}

function setPartyStart(position) {
  const room = roomAt(position);
  if (!room) return;
  state.start = { roomId: room.id, position: { ...position } };
  setStatus(`Party start set in ${room.name ?? room.id} at ${position.x}, ${position.y}.`);
}

function placePortal(position) {
  const room = roomAt(position);
  if (!room || occupied(position, "", "portal")) return;
  if (!state.pendingPortalId) {
    const id = `portal-custom-${state.objects.length + 1}`;
    state.objects.push({ id, type: "portal", position: { ...position }, items: [], roomId: room.id });
    state.pendingPortalId = id;
    state.selectedId = id;
    setStatus("First portal placed. Click the second portal location.");
    return;
  }
  const first = state.objects.find((object) => object.id === state.pendingPortalId);
  if (!first) {
    state.pendingPortalId = "";
    return;
  }
  const id = `portal-custom-${state.objects.length + 1}`;
  state.objects.push({ id, type: "portal", position: { ...position }, items: [], roomId: room.id, pairId: first.id });
  first.pairId = id;
  state.selectedId = id;
  state.pendingPortalId = "";
  setStatus("Linked portal pair placed.");
}

function eraseAt(position) {
  const monster = monsterAt(position);
  if (monster) {
    state.monsters = state.monsters.filter((entry) => entry.id !== monster.id);
    removeStoryTriggersForTarget(monster.id);
    if (state.selectedId === monster.id) state.selectedId = "";
    return;
  }
  const object = objectAt(position);
  if (object) {
    state.objects = state.objects.filter((entry) => entry.id !== object.id && entry.id !== object.pairId);
    removeStoryTriggersForTarget(object.id);
    if (object.pairId) removeStoryTriggersForTarget(object.pairId);
    if (state.selectedId === object.id) state.selectedId = "";
    return;
  }
  if (state.exit && key(state.exit.position) === key(position)) state.exit = null;
  if (state.start && key(state.start.position) === key(position)) state.start = null;
  const passage = state.corridorPassages.find((entry) => (entry.cells ?? []).some((cell) => key(cell) === key(position)));
  if (passage) {
    const removedKeys = new Set((passage.cells ?? []).map(key));
    state.corridorPassages = state.corridorPassages.filter((entry) => entry.id !== passage.id);
    state.corridors = uniqueCells(state.corridorPassages.flatMap((entry) => entry.cells ?? []));
    state.rooms.forEach((room) => {
      room.doors = (room.doors ?? []).filter((door) => !removedKeys.has(key(door.corridor ?? door)));
      if (Array.isArray(passage.roomIds) && passage.roomIds.length === 2 && passage.roomIds.includes(room.id)) {
        room.connections = (room.connections ?? []).filter((id) => !passage.roomIds.includes(id));
      }
    });
    setStatus("Hallway removed.");
  }
}

function handleGridClick(position) {
  const room = roomAt(position);
  if (state.tool === "connect") {
    if (!room) return;
    if (!state.connectFromRoomId) {
      state.connectFromRoomId = room.id;
    } else {
      connectRooms(state.rooms.find((entry) => entry.id === state.connectFromRoomId), room);
    }
  } else if (state.tool === "hallway") {
    handleHallwayClick(position);
  } else if (state.tool === "furniture") {
    placeFurniture(position);
  } else if (state.tool === "trap") {
    placeFurniture(position);
  } else if (state.tool === "monster") {
    placeMonster(position);
  } else if (state.tool === "start") {
    setPartyStart(position);
  } else if (state.tool === "exit") {
    setExit(position);
  } else if (state.tool === "portal") {
    placePortal(position);
  } else if (state.tool === "erase") {
    eraseAt(position);
  } else {
    state.selectedId = monsterAt(position)?.id ?? objectAt(position)?.id ?? doorAt(position)?.id ?? room?.id ?? "";
    if (state.selectedId) setCreatorPanelOpen("right", true);
  }
  renderAll();
}

function addLootItemToSelected(itemId) {
  const selected = selectedEntity();
  if (!selected || !itemId) return;
  if (selected.monsterId) selected.extraLoot = [...(selected.extraLoot ?? []), itemId];
  if (selected.type) selected.items = [...(selected.items ?? []), itemId];
  renderAll();
}

function addLootToSelected() {
  addLootItemToSelected(els.lootItem.value);
}

function deleteSelected() {
  const selected = selectedEntity();
  if (!selected) return;
  if (selected.monsterId) state.monsters = state.monsters.filter((entry) => entry.id !== selected.id);
  if (selected.monsterId) removeStoryTriggersForTarget(selected.id);
  else if (selected.type) {
    state.objects = state.objects.filter((entry) => entry.id !== selected.id && entry.id !== selected.pairId);
    removeStoryTriggersForTarget(selected.id);
    if (selected.pairId) removeStoryTriggersForTarget(selected.pairId);
  }
  else if (selected.cells) {
    state.rooms = state.rooms.filter((entry) => entry.id !== selected.id);
    removeStoryTriggersForTarget(selected.id);
    state.rooms.forEach((room) => {
      room.connections = (room.connections ?? []).filter((id) => id !== selected.id);
    });
    state.objects = state.objects.filter((entry) => entry.roomId !== selected.id);
    state.monsters = state.monsters.filter((entry) => entry.roomId !== selected.id);
    if (state.exit?.roomId === selected.id) state.exit = null;
    if (state.start?.roomId === selected.id) state.start = null;
    rebuildAllCorridors();
  }
  state.selectedId = "";
  renderAll();
}

function saveDungeon() {
  if (state.rooms.length === 0) {
    setStatus("Add at least one room first.");
    return;
  }
  if (!state.exit) {
    const dungeon = buildDungeon();
    state.exit = { roomId: dungeon.rooms.at(-1)?.id ?? dungeon.entranceRoomId, position: dungeon.rooms.at(-1)?.cells?.[0] ?? dungeon.startPosition };
  }
  const saved = window.DungeonCustom.save(templateFromState());
  state.id = saved.id;
  state.campaignSource = null;
  state.oneShotSource = null;
  state.settlementLayoutSource = null;
  setStatus(`Saved ${saved.name}. It will appear at the Home Door as a Custom dungeon.`);
  renderAll();
}

function primarySaveDungeon() {
  if (hasLoadedSource()) {
    void saveCampaignOverride();
    return;
  }
  saveDungeon();
}

async function saveCampaignOverride() {
  if (!state.campaignSource && !state.oneShotSource && !state.settlementLayoutSource) {
    setStatus("Load a main story, one-shot, inn, or camp source first.");
    return;
  }
  if (state.settlementLayoutSource) {
    const template = templateFromState();
    const saved = await window.DungeonSettlementLayouts?.saveSource?.(state.settlementLayoutSource.id, template);
    if (!saved) {
      setStatus("Could not save the settlement layout file. Run through playtest-server.js so Dungeon Creator can write game files.");
      return;
    }
    setStatus(`Saved ${state.settlementLayoutSource.name ?? state.settlementLayoutSource.id} to its game file.`);
    await renderSettlementLayouts();
    renderAll();
    return;
  }
  if (state.oneShotSource) {
    const template = templateFromState({ includeOneShotSource: true });
    const saved = await window.DungeonOneShots?.saveSource?.(
      state.oneShotSource.id,
      template,
    );
    if (!saved) {
      setStatus("Could not save the one-shot dungeon file. Run through playtest-server.js so Dungeon Creator can write game files.");
      return;
    }
    setStatus(`Saved ${state.oneShotSource.name ?? state.oneShotSource.id} to its game file.`);
    renderOneShotDungeons();
    renderAll();
    return;
  }
  const template = templateFromState({ includeCampaignSource: true });
  const saved = await window.DungeonCampaigns?.saveSource?.(
    state.campaignSource.campaignId,
    state.campaignSource.campaignIndex,
    template,
  );
  if (!saved) {
    setStatus("Could not save the campaign dungeon file. Run through playtest-server.js so Dungeon Creator can write game files.");
    return;
  }
  setStatus(`Saved ${state.campaignSource.campaignName ?? state.campaignSource.campaignId} Dungeon ${state.campaignSource.campaignIndex} to its game file.`);
  await renderCampaignDungeons();
  renderAll();
}

function loadTemplate(template, options = {}) {
  const customItems = Array.isArray(template.customItems) ? template.customItems.map(normalizeCreatorCustomItem).filter(Boolean) : [];
  const storyTriggers = Array.isArray(template.storyTriggers) ? template.storyTriggers.map(normalizeCreatorStoryTrigger).filter(Boolean) : [];
  state.id = template.id;
  state.campaignSource = options.campaignSource ?? (
    template.campaignId && template.campaignIndex
      ? {
          campaignId: template.campaignId,
          campaignIndex: Number(template.campaignIndex),
          campaignName: window.DungeonCampaigns?.get?.(template.campaignId)?.name ?? template.campaignId,
        }
      : null
  );
  state.oneShotSource = options.oneShotSource ?? (
    template.oneShotDungeonId
      ? {
          id: template.oneShotDungeonId,
          name: window.DungeonOneShots?.list?.().find((entry) => entry.id === template.oneShotDungeonId)?.name ?? template.name ?? template.oneShotDungeonId,
        }
      : null
  );
  state.settlementLayoutSource = options.settlementLayoutSource ?? (
    template.settlementLayoutId
      ? {
          id: template.settlementLayoutId,
          name: template.name ?? template.settlementLayoutId,
        }
      : null
  );
  if (state.campaignSource) state.oneShotSource = null;
  if (state.campaignSource || state.oneShotSource) state.settlementLayoutSource = null;
  if (state.oneShotSource || state.settlementLayoutSource) state.campaignSource = null;
  if (state.settlementLayoutSource) state.oneShotSource = null;
  state.gridSize = template.gridSize ?? template.dungeon?.gridSize ?? 36;
  state.rooms = clone(template.dungeon?.rooms ?? []);
  state.corridors = clone(template.dungeon?.corridors ?? []);
  state.corridorPassages = clone(template.dungeon?.corridorPassages ?? []);
  state.objects = clone(template.objects ?? []);
  state.monsters = clone(template.monsters ?? []);
  state.customItems = customItems;
  state.storyTriggers = storyTriggers;
  state.selectedStoryTriggerId = "";
  state.exit = clone(template.exit ?? null);
  const startPosition = template.dungeon?.startPosition;
  const entranceRoomId = template.dungeon?.entranceRoomId;
  const startRoom = startPosition
    ? state.rooms.find((room) => room.id === entranceRoomId && cellInRoom(room, startPosition)) ?? state.rooms.find((room) => cellInRoom(room, startPosition))
    : null;
  state.start = startRoom && startPosition ? { roomId: startRoom.id, position: { x: Math.floor(startPosition.x), y: Math.floor(startPosition.y) } } : null;
  repairDuplicateRoomIds();
  state.selectedId = "";
  state.connectFromRoomId = "";
  state.pendingPortalId = "";
  state.hallwayStart = null;
  state.hallwayCells = [];
  els.name.value = template.name ?? "Custom Dungeon";
  els.theme.value = template.themeId ?? "oldGuardroom";
  els.gridSize.value = String(state.gridSize);
  els.goalType.value = template.goal?.type ?? "reachExit";
  if (template.goal?.itemId) els.goalItem.value = template.goal.itemId;
  if (template.goal?.monsterId) els.goalMonster.value = template.goal.monsterId;
  if (template.goal?.count) els.goalCount.value = String(template.goal.count);
  els.goalConsumeItem.checked = Boolean(template.goal?.consumeOnComplete);
  els.introText.value = template.intro?.text ?? template.introText ?? "";
  els.introImages.value = (template.intro?.images ?? []).join("\n");
  els.outroText.value = template.outro?.text ?? template.outroText ?? template.completionText ?? "";
  els.outroImages.value = (template.outro?.images ?? []).join("\n");
  clearStoryTriggerForm();
  renderItemSelects();
  if (template.goal?.itemId) els.goalItem.value = template.goal.itemId;
  if (template.goal?.monsterId) els.goalMonster.value = template.goal.monsterId;
  renderAll();
}

function newBlankDungeon() {
  state.id = `custom-${Date.now()}`;
  state.gridSize = Math.max(16, Math.min(72, Number(els.gridSize.value) || 36));
  state.rooms = [];
  state.corridors = [];
  state.corridorPassages = [];
  state.objects = [];
  state.monsters = [];
  state.customItems = [];
  state.storyTriggers = [];
  state.selectedStoryTriggerId = "";
  state.exit = null;
  state.campaignSource = null;
  state.oneShotSource = null;
  state.settlementLayoutSource = null;
  state.start = null;
  state.selectedId = "";
  state.connectFromRoomId = "";
  state.pendingPortalId = "";
  state.hallwayStart = null;
  state.hallwayCells = [];
  clearStoryTriggerForm();
  renderAll();
}

function randomLayoutRoomOptions(gridSize, requestedRooms) {
  const density = Math.max(1, Math.sqrt(Math.max(1, requestedRooms)));
  const maxRoom = Math.max(4, Math.min(11, Math.floor(gridSize / (density + 1))));
  const minRoom = Math.max(3, Math.min(5, maxRoom - 1));
  const tight = requestedRooms > Math.max(4, Math.floor(gridSize / 4));
  return {
    layout: "branching",
    roomShapes: maxRoom <= 5 ? ["rectangle", "square"] : ["rectangle", "square", "l", "t"],
    roomWidth: { min: minRoom, max: maxRoom },
    roomHeight: { min: minRoom, max: Math.max(minRoom, maxRoom - 1) },
    squareSize: { min: minRoom, max: maxRoom },
    corridorLength: { min: Math.max(2, state.hallwayWidth + 1), max: Math.max(4, state.hallwayWidth + 4) },
    corridorWidth: state.hallwayWidth,
    corridorStyle: "random-bend",
    roomPadding: tight ? 1 : 2,
    corridorPadding: state.hallwayWidth > 1 ? 0 : 1,
    roomOffset: { min: Math.max(3, minRoom), max: Math.max(5, maxRoom) },
    roomJitter: { x: [1, Math.max(2, Math.floor(maxRoom / 2))], y: [1, Math.max(2, Math.floor(maxRoom / 2))] },
    extraConnectionRatio: 0.2,
    maxAttempts: Math.max(900, requestedRooms * 120),
  };
}

function farthestRoomFromStart(rooms, startRoom) {
  const startCenter = roomCenter(startRoom);
  return rooms
    .slice()
    .sort((a, b) => distance(roomCenter(b), startCenter) - distance(roomCenter(a), startCenter))[0] ?? startRoom;
}

function randomOpenRoomCell(room) {
  const doorKeys = new Set((room.doors ?? []).map(key));
  return room.cells.find((cell) => !doorKeys.has(key(cell))) ?? room.cells[0] ?? { x: 1, y: 1 };
}

function applyGeneratedDungeonLayout(generated) {
  state.rooms = clone(generated.rooms ?? []);
  state.corridors = uniqueCells(clone(generated.corridors ?? []));
  state.corridorPassages = clone(generated.corridorPassages ?? []);
  state.objects = [];
  state.monsters = [];
  state.storyTriggers = [];
  state.selectedStoryTriggerId = "";
  state.selectedId = "";
  state.connectFromRoomId = "";
  state.pendingPortalId = "";
  state.hallwayStart = null;
  state.hallwayCells = [];
  const entranceRoom = state.rooms.find((room) => room.id === generated.entranceRoomId) ?? state.rooms[0] ?? null;
  const exitRoom = entranceRoom ? farthestRoomFromStart(state.rooms, entranceRoom) : state.rooms.at(-1) ?? null;
  state.start = entranceRoom ? { roomId: entranceRoom.id, position: generated.startPosition ?? randomOpenRoomCell(entranceRoom) } : null;
  state.exit = exitRoom ? { roomId: exitRoom.id, position: randomOpenRoomCell(exitRoom) } : null;
}

function generateRandomLayout() {
  const loadedSource = hasLoadedSource();
  if (!canRerollRandomLayout() && !loadedSource) {
    setStatus("Random Layout is locked once furniture, traps, monsters, or story triggers have been placed. Use New Blank Dungeon first.");
    return;
  }
  if (loadedSource) {
    const confirmed = window.confirm(
      "Generate a new room layout for this loaded source dungeon?\n\nThis will replace the current rooms, hallways, furniture, traps, monsters, start, exit, and story triggers in the editor. The source link will stay attached so the next Overwrite saves back to the loaded template.",
    );
    if (!confirmed) return;
  }
  state.gridSize = Math.max(16, Math.min(72, Number(els.gridSize.value) || state.gridSize || 36));
  state.hallwayWidth = Math.max(1, Math.min(3, Number(els.hallwayWidth?.value) || 1));
  const requestedRooms = Math.max(1, Math.min(80, Number(els.randomRoomCount?.value) || 10));
  const generated = window.DungeonGenerator.generateDungeon({
    gridSize: state.gridSize,
    roomCount: requestedRooms,
    ...randomLayoutRoomOptions(state.gridSize, requestedRooms),
  });
  applyGeneratedDungeonLayout(generated);
  els.gridSize.value = String(state.gridSize);
  setStatus(loadedSource
    ? `Generated a new layout for the loaded source with ${state.rooms.length} of ${requestedRooms} requested rooms. Click Overwrite to save it back to that template.`
    : `Random layout created with ${state.rooms.length} of ${requestedRooms} requested rooms.`);
  renderAll();
}

async function init() {
  await window.DungeonCustomItems?.refreshFromFile?.();
  await window.DungeonRecruitRegistry?.refreshFromFile?.();
  const importedCustomItems = importCustomItemsFromHash();
  renderThemes();
  syncCustomBibliographyItems(true);
  renderCatalogueFilters();
  renderItemSelects();
  els.customItemTemplate.dispatchEvent(new Event("change"));
  newBlankDungeon();
  setTool("select");
  renderOneShotDungeons();
  void renderCampaignDungeons();
  setCreatorPanelOpen("left", !window.matchMedia("(max-width: 700px)").matches);
  setCreatorPanelOpen("right", false);
  if (importedCustomItems) setStatus(`Imported ${importedCustomItems} custom item${importedCustomItems === 1 ? "" : "s"} from the item creator.`);

  els.toolGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tool]");
    if (button) setTool(button.dataset.tool);
  });
  document.querySelectorAll("[data-toggle-panel]").forEach((button) => {
    button.addEventListener("click", () => toggleCreatorPanel(button.dataset.togglePanel));
  });
  document.querySelectorAll("[data-open-panel]").forEach((button) => {
    button.addEventListener("click", () => setCreatorPanelOpen(button.dataset.openPanel, true));
  });
  document.querySelectorAll("[data-panel-tab]").forEach((button) => {
    button.addEventListener("click", () => activateCreatorPanelTab(button.dataset.panelTab));
  });
  document.querySelectorAll("[data-asset-tab]").forEach((button) => {
    button.addEventListener("click", () => activateCreatorAssetTab(button.dataset.assetTab));
  });
  document.querySelectorAll("[data-creator-zoom]").forEach((button) => {
    button.addEventListener("click", () => adjustCreatorZoom(button.dataset.creatorZoom));
  });
  els.grid.addEventListener("click", (event) => {
    const cell = event.target.closest("[data-x]");
    if (!cell) return;
    if (state.tool === "select" && cell.dataset.doorId) {
      state.selectedId = cell.dataset.doorId;
      setCreatorPanelOpen("right", true);
      renderAll();
      return;
    }
    handleGridClick({ x: Number(cell.dataset.x), y: Number(cell.dataset.y) });
  });
  els.grid.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    const cell = event.target.closest("[data-x]");
    if (!cell) return;
    beginRoomDrag({ x: Number(cell.dataset.x), y: Number(cell.dataset.y) });
  });
  els.grid.addEventListener("pointermove", (event) => {
    if (!state.roomDrag) return;
    const cell = event.target.closest("[data-x]");
    if (!cell) return;
    updateRoomDrag({ x: Number(cell.dataset.x), y: Number(cell.dataset.y) });
  });
  window.addEventListener("pointerup", finishRoomDrag);
  window.addEventListener("storage", (event) => {
    if (event.key === window.DungeonCustomItems?.storageKey) syncCustomBibliographyItems(true);
  });
  window.addEventListener("focus", () => {
    void window.DungeonCustomItems?.refreshFromFile?.().then(() => syncCustomBibliographyItems(true));
    void window.DungeonRecruitRegistry?.refreshFromFile?.().then(() => renderSelected());
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      void window.DungeonCustomItems?.refreshFromFile?.().then(() => syncCustomBibliographyItems(true));
      void window.DungeonRecruitRegistry?.refreshFromFile?.().then(() => renderSelected());
    }
  });
  els.roomList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-room-select]");
    if (!button) return;
    state.selectedId = button.dataset.roomSelect;
    setTool("select");
    setCreatorPanelOpen("right", true);
    renderAll();
  });
  els.addRoom.addEventListener("click", addRoom);
  els.newDungeon.addEventListener("click", newBlankDungeon);
  els.randomLayout?.addEventListener("click", generateRandomLayout);
  els.randomRoomCount?.addEventListener("input", renderRandomLayoutControls);
  els.hallwayWidth?.addEventListener("input", () => {
    state.hallwayWidth = Math.max(1, Math.min(3, Number(els.hallwayWidth.value) || 1));
    renderRandomLayoutControls();
  });
  els.gridSize.addEventListener("change", newBlankDungeon);
  els.furnitureSearch.addEventListener("input", renderFurnitureCatalogue);
  [els.furnitureKindFilter, els.furnitureTagFilter, els.furnitureSort].forEach((element) => element?.addEventListener("change", renderFurnitureCatalogue));
  els.monsterSearch.addEventListener("input", renderMonsterCatalogue);
  [els.monsterCategoryFilter, els.monsterTagFilter, els.monsterSort].forEach((element) => element?.addEventListener("change", renderMonsterCatalogue));
  els.itemSearch?.addEventListener("input", renderItemSelects);
  [els.itemTypeFilter, els.itemTagFilter, els.scrollSpellLevelFilter, els.scrollSpellClassFilter, els.itemSort].forEach((element) => element?.addEventListener("change", renderItemSelects));
  els.furnitureCatalogue.addEventListener("click", (event) => {
    const button = event.target.closest("[data-id]");
    if (!button) return;
    state.selectedFurnitureId = button.dataset.id;
    const entry = window.DungeonContent.get("furniture", button.dataset.id);
    setTool(entry?.kind === "trap" ? "trap" : "furniture");
    renderAll();
  });
  els.monsterCatalogue.addEventListener("contextmenu", (event) => {
    const button = event.target.closest("[data-id]");
    if (!button) return;
    event.preventDefault();
    const monster = window.DungeonContent.get("monsters", button.dataset.id);
    if (!monster) return;
    els.selectedCard.innerHTML = `<b>${monster.name}</b><br>HP ${monster.maxHp ?? "?"} · AC ${monster.ac ?? "?"} · Attack ${monster.attackBonus ?? "?"}<br>${monster.damage?.label ?? ""}<br><span class="small-note">${monster.role ?? ""}</span>`;
  });
  els.monsterCatalogue.addEventListener("click", (event) => {
    const info = event.target.closest("[data-info-monster]");
    if (info) {
      event.preventDefault();
      event.stopPropagation();
      showMonsterInfo(info.dataset.infoMonster);
      return;
    }
    const button = event.target.closest("[data-id]");
    if (!button) return;
    state.selectedMonsterId = button.dataset.id;
    setTool("monster");
    renderAll();
  });
  els.addLoot.addEventListener("click", addLootToSelected);
  els.inspectLootItem?.addEventListener("click", () => showItemInfo(els.lootItem.value));
  els.customBibliographyItems?.addEventListener("click", (event) => {
    const info = event.target.closest("[data-info-item]");
    if (info) {
      event.preventDefault();
      event.stopPropagation();
      showItemInfo(info.dataset.infoItem);
      return;
    }
    const button = event.target.closest("[data-custom-bibliography-loot]");
    if (!button) return;
    addLootItemToSelected(button.dataset.customBibliographyLoot);
  });
  els.deleteSelected.addEventListener("click", deleteSelected);
  els.storyTriggerEvent.addEventListener("change", renderStoryTriggerTargetSelect);
  els.saveStoryTrigger.addEventListener("click", saveStoryTrigger);
  els.newStoryTrigger.addEventListener("click", clearStoryTriggerForm);
  els.storyTriggerList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-trigger-action]");
    if (!button) return;
    const trigger = state.storyTriggers.find((entry) => entry.id === button.dataset.id);
    if (button.dataset.triggerAction === "edit") {
      loadStoryTriggerForm(trigger);
      return;
    }
    if (button.dataset.triggerAction === "delete") {
      state.storyTriggers = state.storyTriggers.filter((entry) => entry.id !== button.dataset.id);
      clearStoryTriggerForm();
      renderAll();
    }
  });
  els.createCustomItem.addEventListener("click", createCustomItem);
  els.customItemTemplate.addEventListener("change", () => {
    const template = window.DungeonContent.get("items", els.customItemTemplate.value);
    if (!template) return;
    const isHandout = template.type === "handout" || template.handout;
    els.customItemName.value = isHandout ? template.handout?.title ?? template.name : `${template.name} Variant`;
    els.customItemDescription.value = template.handout?.text ?? template.description ?? template.magic?.description ?? template.treasure?.description ?? "";
    els.customItemType.value = template.type ?? "";
    if (els.customItemTags) els.customItemTags.value = isHandout ? (template.handout?.categories ?? ["Promiscuous"]).join(", ") : "";
    if (els.customItemTemporary) els.customItemTemporary.checked = Boolean(template.temporaryTome ?? template.expiresOnDungeonExit ?? template.handout?.temporary);
    els.customItemWeight.value = String(template.weightLb ?? 0);
    els.customItemValue.value = String(itemValueCp(template) / 100);
  });
  els.selectedCard.addEventListener("click", (event) => {
    const itemInfo = event.target.closest("[data-info-item]");
    if (itemInfo) {
      event.preventDefault();
      showItemInfo(itemInfo.dataset.infoItem);
      return;
    }
    const monsterInfo = event.target.closest("[data-info-monster]");
    if (monsterInfo) {
      event.preventDefault();
      showMonsterInfo(monsterInfo.dataset.infoMonster);
      return;
    }
    const button = event.target.closest("[data-action]");
    if (!button) return;
    if (button.dataset.action === "move-room") moveSelectedRoom(Number(button.dataset.dx), Number(button.dataset.dy));
    if (button.dataset.action === "move-object") moveSelectedObject(Number(button.dataset.dx), Number(button.dataset.dy));
    if (button.dataset.action === "rotate-object") rotateSelectedObject();
    const selected = selectedEntity();
    if (button.dataset.action === "spawner-add-selected-monster" && selected?.type) {
      updateObjectSpawnerFromCard(selected, "spawnerAddSelectedMonster");
      renderExport();
    }
    if (button.dataset.action === "recruit-use-selected-monster" && selected?.type) {
      updateObjectRecruitFromCard(selected, "recruitUseSelectedMonster");
      renderExport();
    }
    if (button.dataset.action === "recruit-use-saved" && selected?.type) {
      updateObjectRecruitFromCard(selected, "recruitUseSaved");
      renderExport();
    }
  });
  els.selectedCard.addEventListener("input", (event) => {
    const selected = selectedEntity();
    const doorInput = event.target.closest("[data-door-lock-field]");
    if (doorInput && selected?.__door) {
      updateDoorSpecialLockFromCard(selected, doorInput.dataset.doorLockField);
      renderExport();
      return;
    }

    const hiddenDoorInput = event.target.closest("[data-door-hidden-field]");
    if (hiddenDoorInput && selected?.__door) {
      updateDoorHiddenFromCard(selected, hiddenDoorInput.dataset.doorHiddenField);
      renderGrid();
      renderExport();
      return;
    }

    const roomInput = event.target.closest("[data-room-field]");
    if (roomInput && selected?.cells) {
      if (roomInput.dataset.roomField === "name") {
        selected.name = roomInput.value.trim() || "Dungeon Room";
        renderRoomList();
        renderStoryTriggerTargetSelect();
        renderExport();
      }
      return;
    }

    const objectInput = event.target.closest("[data-object-field]");
    if (objectInput && selected?.type) {
      const field = objectInput.dataset.objectField;
      if (field === "locked") selected.locked = objectInput.checked;
      if (field === "lockDc") selected.lockDc = Math.max(1, Number(objectInput.value) || 12);
      if (field === "spotDc") selected.spotDc = Math.max(1, Number(objectInput.value) || 12);
      if (field.startsWith("specialLock")) updateObjectSpecialLockFromCard(selected, field);
      if (field.startsWith("trap")) updateObjectTrapFromCard(selected, field);
      if (field.startsWith("spawner")) updateObjectSpawnerFromCard(selected, field);
      if (field.startsWith("recruit")) updateObjectRecruitFromCard(selected, field);
      renderExport();
      return;
    }

    const input = event.target.closest("[data-monster-field]");
    if (!input || !selected?.monsterId) return;
    selected.overrides ??= {};
    selected.customized = true;
    if (input.dataset.monsterField === "name") selected.name = input.value;
    if (input.dataset.monsterField === "maxHp") selected.overrides.maxHp = Number(input.value) || undefined;
    if (input.dataset.monsterField === "ac") selected.overrides.ac = Number(input.value) || undefined;
    if (input.dataset.monsterField === "attackBonus") selected.overrides.attackBonus = Number(input.value) || undefined;
    if (input.dataset.monsterField === "damageLabel") selected.overrides.damage = { ...(selected.overrides.damage ?? {}), label: input.value };
    if (input.dataset.monsterField === "damageCount") selected.overrides.damage = { ...(selected.overrides.damage ?? {}), count: Number(input.value) || 0 };
    if (input.dataset.monsterField === "damageSides") selected.overrides.damage = { ...(selected.overrides.damage ?? {}), sides: Number(input.value) || 0 };
    if (input.dataset.monsterField === "damageBonus") selected.overrides.damage = { ...(selected.overrides.damage ?? {}), bonus: Number(input.value) || 0 };
    if (input.dataset.monsterField === "mainHand") selected.overrides.equipment = { ...(selected.overrides.equipment ?? {}), mainHand: input.value || null };
    if (input.dataset.monsterField === "torso") selected.overrides.equipment = { ...(selected.overrides.equipment ?? {}), torso: input.value || null };
    renderItemSelects();
    renderExport();
  });
  els.selectedCard.addEventListener("change", (event) => {
    const selected = selectedEntity();
    const objectInput = event.target.closest("[data-object-field]");
    if (!objectInput || !selected?.type) return;
    const field = objectInput.dataset.objectField;
    if (field === "locked") selected.locked = objectInput.checked;
    if (field === "lockDc") selected.lockDc = Math.max(1, Number(objectInput.value) || 12);
    if (field === "spotDc") selected.spotDc = Math.max(1, Number(objectInput.value) || 12);
    if (field.startsWith("specialLock")) updateObjectSpecialLockFromCard(selected, field);
    if (field.startsWith("trap")) updateObjectTrapFromCard(selected, field);
    if (field.startsWith("spawner")) updateObjectSpawnerFromCard(selected, field);
    if (field.startsWith("recruit")) updateObjectRecruitFromCard(selected, field);
    renderExport();
  });
  els.saveDungeon.addEventListener("click", saveDungeon);
  els.topSaveDungeon?.addEventListener("click", primarySaveDungeon);
  els.saveCampaignOverride?.addEventListener("click", () => {
    void saveCampaignOverride();
  });
  els.copyJson.addEventListener("click", renderExport);
  els.calcXp?.addEventListener("click", calculateDungeonMonsterXp);
  els.importJson.addEventListener("click", () => {
    try {
      loadTemplate(JSON.parse(els.exportJson.value));
      setStatus("Imported JSON into the editor. Click Save Dungeon For Game to add it to the Home Door.");
    } catch (error) {
      setStatus(error?.message ?? "Could not import JSON.");
    }
  });
  els.savedDungeons.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    if (button.dataset.action === "load") {
      const template = window.DungeonCustom.get(button.dataset.id);
      if (template) loadTemplate(template);
    }
    if (button.dataset.action === "delete") {
      window.DungeonCustom.remove(button.dataset.id);
      renderAll();
    }
  });
  els.oneShotDungeons?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const oneShotId = button.dataset.id;
    if (button.dataset.action === "load-one-shot") void window.DungeonOneShots?.get?.(oneShotId).then((template) => {
      if (!template) {
        setStatus("Could not load that one-shot dungeon.");
        return;
      }
      const entry = window.DungeonOneShots?.list?.().find((item) => item.id === oneShotId);
      loadTemplate(template, { oneShotSource: { id: oneShotId, name: entry?.name ?? template.name ?? oneShotId } });
      setStatus(`Loaded ${entry?.name ?? template.name ?? "one-shot dungeon"}. Save Source Override to replace it in the one-shot menu.`);
    });
    if (button.dataset.action === "load-original-one-shot") void window.DungeonOneShots?.original?.(oneShotId).then((template) => {
      if (!template) {
        setStatus("Could not load the original one-shot JSON.");
        return;
      }
      const entry = window.DungeonOneShots?.list?.().find((item) => item.id === oneShotId);
      loadTemplate(template, { oneShotSource: { id: oneShotId, name: entry?.name ?? template.name ?? oneShotId } });
      setStatus(`Loaded original JSON for ${entry?.name ?? template.name ?? oneShotId}. Save Source Override to replace the edited version.`);
    });
    if (button.dataset.action === "reset-one-shot") {
      window.DungeonOneShots?.removeOverride?.(oneShotId);
      if (state.oneShotSource?.id === oneShotId) {
        state.oneShotSource = null;
        renderAll();
      }
      renderOneShotDungeons();
      setStatus("One-shot override removed. The original JSON dungeon will be used again.");
    }
  });
  els.settlementLayouts?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const layoutId = button.dataset.id;
    const entry = window.DungeonSettlementLayouts?.list?.().find((item) => item.id === layoutId);
    if (button.dataset.action === "load-settlement-layout") void window.DungeonSettlementLayouts?.get?.(layoutId).then((template) => {
      if (!template) {
        setStatus("Could not load that settlement layout.");
        return;
      }
      loadTemplate(template, { settlementLayoutSource: { id: layoutId, name: entry?.name ?? template.name ?? layoutId } });
      setStatus(`Loaded ${entry?.name ?? template.name ?? "settlement layout"}. Click Overwrite to replace its source JSON.`);
    });
    if (button.dataset.action === "load-original-settlement-layout") {
      const template = window.DungeonSettlementLayouts?.builtIn?.(layoutId);
      if (!template) {
        setStatus("Could not load that built-in settlement layout.");
        return;
      }
      loadTemplate(template, { settlementLayoutSource: { id: layoutId, name: entry?.name ?? template.name ?? layoutId } });
      setStatus(`Loaded built-in ${entry?.name ?? template.name ?? layoutId}. Click Overwrite to replace the source JSON.`);
    }
  });
  els.campaignDungeons?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const campaignId = button.dataset.campaign;
    const index = Number(button.dataset.index);
    if (button.dataset.action === "load-campaign") {
      void window.DungeonCampaigns.dungeon(campaignId, index).then((template) => {
        if (!template) {
          setStatus("Could not load that campaign dungeon.");
          return;
        }
        const campaign = window.DungeonCampaigns.get(campaignId);
        loadTemplate(template, { campaignSource: { campaignId, campaignIndex: index, campaignName: campaign?.name ?? campaignId } });
        setStatus(`Loaded ${campaign?.name ?? campaignId} Dungeon ${index}. Click Overwrite to replace it in the main story menu.`);
      });
    }
    if (button.dataset.action === "load-original-campaign") {
      void window.DungeonCampaigns.originalDungeon(campaignId, index).then((template) => {
        if (!template) {
          setStatus("Could not load the original campaign JSON.");
          return;
        }
        const campaign = window.DungeonCampaigns.get(campaignId);
        loadTemplate(template, { campaignSource: { campaignId, campaignIndex: index, campaignName: campaign?.name ?? campaignId } });
        setStatus(`Loaded original JSON for ${campaign?.name ?? campaignId} Dungeon ${index}. Click Overwrite to replace the edited version.`);
      });
    }
    if (button.dataset.action === "reset-campaign") {
      window.DungeonCampaigns.removeOverride?.(campaignId, index);
      if (state.campaignSource?.campaignId === campaignId && state.campaignSource?.campaignIndex === index) {
        state.campaignSource = null;
        renderAll();
      }
      void renderCampaignDungeons();
      setStatus("Campaign override removed. The original JSON dungeon will be used again.");
    }
  });
  ["input", "change"].forEach((eventName) => {
    [els.name, els.theme, els.goalType, els.goalItem, els.goalMonster, els.goalCount, els.goalConsumeItem, els.introText, els.introImages, els.outroText, els.outroImages, els.storyTriggerTitle, els.storyTriggerText, els.storyTriggerImages, els.storyTriggerOnce].forEach((element) => {
      element.addEventListener(eventName, renderExport);
    });
  });
}

window.addEventListener("DOMContentLoaded", () => void init());
})();
