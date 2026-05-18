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

function normalizeCreatorCustomItem(item, index = 0) {
  if (!item || typeof item !== "object") return null;
  const id = String(item.id || item.baseItemId || `custom-item-${index + 1}`);
  const description = String(item.customDescription ?? item.description ?? item.magic?.description ?? item.treasure?.description ?? "").trim();
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
  name: document.querySelector("#creator-name"),
  theme: document.querySelector("#creator-theme"),
  gridSize: document.querySelector("#creator-grid-size"),
  grid: document.querySelector("#creator-grid"),
  toolGrid: document.querySelector("#tool-grid"),
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
  furnitureCatalogue: document.querySelector("#furniture-catalogue"),
  monsterSearch: document.querySelector("#monster-search"),
  monsterCatalogue: document.querySelector("#monster-catalogue"),
  monsterIsBoss: document.querySelector("#monster-is-boss"),
  selectedCard: document.querySelector("#selected-card"),
  lootItem: document.querySelector("#loot-item"),
  addLoot: document.querySelector("#add-loot"),
  deleteSelected: document.querySelector("#delete-selected"),
  savedDungeons: document.querySelector("#saved-dungeons"),
  saveDungeon: document.querySelector("#save-dungeon"),
  campaignDungeons: document.querySelector("#campaign-dungeons"),
  saveCampaignOverride: document.querySelector("#save-campaign-override"),
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
  customItemWeight: document.querySelector("#custom-item-weight"),
  customItemValue: document.querySelector("#custom-item-value"),
  createCustomItem: document.querySelector("#create-custom-item"),
};

const state = {
  id: `custom-${Date.now()}`,
  tool: "select",
  gridSize: 36,
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

function objectAt(position) {
  return state.objects.find((object) => objectCellsForCreator(object).some((cell) => cell.x === position.x && cell.y === position.y)) ?? null;
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

function monsterAt(position) {
  return state.monsters.find((monster) => monster.position.x === position.x && monster.position.y === position.y) ?? null;
}

function occupied(position, exceptId = "") {
  return Boolean(monsterAt(position) && monsterAt(position).id !== exceptId) || Boolean(objectAt(position) && objectAt(position).id !== exceptId);
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

function uniqueCells(cells) {
  return Array.from(new Map(cells.map((cell) => [key(cell), cell])).values());
}

function rebuildWalkable() {
  return uniqueCells([...state.rooms.flatMap((room) => room.cells), ...state.corridors]);
}

function buildDungeon() {
  const walkable = rebuildWalkable();
  const doors = state.rooms.flatMap((room) => (room.doors ?? []).map((door) => ({ ...door, roomId: room.id })));
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
    rooms: clone(state.rooms),
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

function templateFromState(options = {}) {
  syncSelectedStoryTriggerFromForm();
  const dungeon = buildDungeon();
  return {
    id: state.id,
    name: els.name.value.trim() || "Custom Dungeon",
    themeId: els.theme.value || "oldGuardroom",
    gridSize: state.gridSize,
    dungeon,
    exit: state.exit ?? { roomId: dungeon.rooms.at(-1)?.id ?? dungeon.entranceRoomId, position: dungeon.rooms.at(-1)?.cells?.[0] ?? dungeon.startPosition },
    objects: state.objects.map((object) => ({
      id: object.id,
      type: object.type,
      position: { ...object.position },
      ...(object.width ? { width: object.width } : {}),
      ...(object.height ? { height: object.height } : {}),
      ...(object.pairId ? { pairId: object.pairId } : {}),
      ...(typeof object.locked === "boolean" ? { locked: object.locked } : {}),
      ...(object.lockDc ? { lockDc: object.lockDc } : {}),
      items: [...(object.items ?? [])],
    })),
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

function setTool(tool) {
  state.tool = tool;
  state.connectFromRoomId = "";
  state.pendingPortalId = "";
  state.hallwayStart = null;
  state.hallwayCells = [];
  renderTools();
}

function renderTools() {
  els.toolGrid.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", button.dataset.tool === state.tool);
  });
}

function renderThemes() {
  els.theme.innerHTML = window.DungeonContent
    .list("themes")
    .filter((theme) => !theme.hidden)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((theme) => `<option value="${theme.id}">${theme.name}</option>`)
    .join("");
}

function catalogueButton(entry, selectedId) {
  return `<button type="button" data-id="${escapeAttribute(entry.id)}" class="${entry.id === selectedId ? "active" : ""}"><b>${escapeHtml(entry.name)}</b><br><span class="small-note">${escapeHtml(entry.id)}</span></button>`;
}

function monsterCategoryLabel(monster) {
  return Number.isFinite(monster.category) ? `Cat ${monster.category}` : "Cat ?";
}

function monsterCatalogueButton(entry, selectedId) {
  return `
    <button type="button" data-id="${escapeAttribute(entry.id)}" class="monster-catalogue-button ${entry.id === selectedId ? "active" : ""}">
      <span class="monster-catalogue-title">
        <b>${escapeHtml(entry.name)}</b>
        <span class="monster-category-badge" title="Monster category">${escapeHtml(monsterCategoryLabel(entry))}</span>
      </span>
      <span class="small-note">${escapeHtml(entry.id)}</span>
    </button>
  `;
}

function furnitureCatalogueButton(entry, selectedId) {
  const fallbackSymbol = entry.symbol ?? (entry.kind === "trap" ? "!" : "?");
  const iconPath = furnitureIconPath(entry, entry.id);
  return `
    <button type="button" data-id="${escapeAttribute(entry.id)}" class="furniture-catalogue-button ${entry.id === selectedId ? "active" : ""}">
      <span class="furniture-catalogue-icon">
        ${iconPath ? `<img class="hidden" data-creator-furniture-image src="${escapeAttribute(iconPath)}" alt="" draggable="false" />` : ""}
        <span>${escapeHtml(fallbackSymbol)}</span>
      </span>
      <b>${escapeHtml(entry.name)}</b>
    </button>
  `;
}

function renderFurnitureCatalogue() {
  const query = els.furnitureSearch.value.trim().toLowerCase();
  const entries = window.DungeonContent
    .list("furniture")
    .filter((entry) => (state.tool === "trap" ? entry.kind === "trap" : entry.kind !== "trap"))
    .filter((entry) => !query || `${entry.name} ${entry.id} ${(entry.tags ?? []).join(" ")}`.toLowerCase().includes(query))
    .sort((a, b) => a.name.localeCompare(b.name));
  els.furnitureCatalogue.innerHTML = entries.map((entry) => furnitureCatalogueButton(entry, state.selectedFurnitureId)).join("");
  activateCreatorFurnitureImages(els.furnitureCatalogue);
}

function renderMonsterCatalogue() {
  const query = els.monsterSearch.value.trim().toLowerCase();
  const entries = window.DungeonContent
    .list("monsters")
    .filter((entry) => !query || `${entry.name} ${entry.id} ${monsterCategoryLabel(entry)} ${(entry.tags ?? []).join(" ")}`.toLowerCase().includes(query))
    .sort((a, b) => a.name.localeCompare(b.name));
  els.monsterCatalogue.innerHTML = entries.map((entry) => monsterCatalogueButton(entry, state.selectedMonsterId)).join("");
}

function renderItemSelects() {
  const items = window.DungeonContent
    .list("items")
    .filter((item) => item.type !== "class")
    .sort((a, b) => a.name.localeCompare(b.name));
  const options = items.map((item) => `<option value="${escapeAttribute(item.id)}">${escapeHtml(itemOptionLabel(item))}</option>`).join("");
  const customOptions = state.customItems.map((item) => `<option value="${escapeAttribute(item.id)}">${escapeHtml(itemOptionLabel(item))}</option>`).join("");
  els.lootItem.innerHTML = options + customOptions;
  els.goalItem.innerHTML = options + customOptions;
  els.customItemTemplate.innerHTML = options;
  els.goalMonster.innerHTML = window.DungeonContent
    .list("monsters")
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((monster) => `<option value="${monster.id}">${monster.name}</option>`)
    .join("") + state.monsters.filter((monster) => monster.customized).map((monster) => `<option value="${monster.id}">${monster.name}</option>`).join("");
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
  els.grid.style.gridTemplateColumns = `repeat(${state.gridSize}, 22px)`;
  const cells = [];
  for (let y = 0; y < state.gridSize; y += 1) {
    for (let x = 0; x < state.gridSize; x += 1) {
      const position = { x, y };
      const cellKey = key(position);
      const room = roomMap.get(cellKey);
      const monster = monsterAt(position);
      const object = objectAt(position);
      const classes = [
        "creator-cell",
        room ? "room" : "",
        corridorKeys.has(cellKey) ? "corridor" : "",
        doorKeys.has(cellKey) ? "door" : "",
        startKey === cellKey ? "start" : "",
        exitKey === cellKey ? "exit" : "",
        portalKeys.has(cellKey) ? "portal" : "",
        hallwayPreviewKeys.has(cellKey) ? "selected-room" : "",
        room?.id === state.connectFromRoomId || room?.id === state.selectedId ? "selected-room" : "",
        y === 0 && x % 5 === 0 ? "axis-x" : "",
        x === 0 && y % 5 === 0 ? "axis-y" : "",
      ].filter(Boolean).join(" ");
      const template = object ? window.DungeonContent.get("furniture", object.type) : null;
      const label = monster ? "M" : object ? (template?.symbol ?? (object.type === "portal" ? "P" : "F")) : startKey === cellKey ? "S" : exitKey === cellKey ? "E" : "";
      const iconPath = object ? furnitureIconPath(template, object.type) : "";
      const content = object && !monster
        ? `${iconPath ? `<img class="creator-cell-object-icon hidden" data-creator-furniture-image src="${escapeAttribute(iconPath)}" alt="" draggable="false" />` : ""}<span>${escapeHtml(label)}</span>`
        : escapeHtml(label);
      cells.push(`<button type="button" class="${classes}" data-x="${x}" data-y="${y}" data-axis-x="${x}" data-axis-y="${y}" title="${escapeAttribute(room?.name ?? "")}">${content}</button>`);
    }
  }
  els.grid.innerHTML = cells.join("");
  activateCreatorFurnitureImages(els.grid);
}

function selectedEntity() {
  return state.objects.find((object) => object.id === state.selectedId) ??
    state.monsters.find((monster) => monster.id === state.selectedId) ??
    state.rooms.find((room) => room.id === state.selectedId) ??
    null;
}

function itemName(itemId) {
  return state.customItems.find((item) => item.id === itemId)?.name ?? window.DungeonContent.get("items", itemId)?.name ?? itemId;
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
  if (selected.monsterId) {
    const template = window.DungeonContent.get("monsters", selected.monsterId);
    els.selectedCard.innerHTML = `<b>${selected.name}</b><br>${selected.isBoss ? "Boss " : ""}Monster at ${selected.position.x}, ${selected.position.y}<br>
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
      <small>Extra loot: ${(selected.extraLoot ?? []).map(itemName).join(", ") || "none"}</small>`;
    return;
  }
  if (selected.type) {
    const def = window.DungeonContent.get("furniture", selected.type);
    const lock = (def?.components ?? []).find((component) => component?.type === "lock");
    els.selectedCard.innerHTML = `<b>${def?.name ?? selected.type}</b><br>${def?.kind === "trap" ? "Trap" : "Furniture"} at ${selected.position.x}, ${selected.position.y}<br>Loot: ${(selected.items ?? []).map(itemName).join(", ") || "none"}
      ${
        lock
          ? `<label><input data-object-field="locked" type="checkbox" ${selected.locked ? "checked" : ""} /> Locked in this dungeon</label>
             <label>Lock DC <input data-object-field="lockDc" type="number" value="${selected.lockDc ?? lock.dc ?? 12}" /></label>`
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

function renderSavedDungeons() {
  const entries = window.DungeonCustom?.list?.() ?? [];
  els.savedDungeons.innerHTML = entries.length
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
}

async function renderCampaignDungeons() {
  if (!els.campaignDungeons || !window.DungeonCampaigns) return;
  els.campaignDungeons.innerHTML = `<p class="small-note">Loading campaign dungeons...</p>`;
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
    sections.push(`<div class="small-note"><b>${escapeHtml(campaign.name)}</b></div>${rows.join("")}`);
  }
  els.campaignDungeons.innerHTML = sections.join("") || `<p class="small-note">No campaign dungeons found.</p>`;
  renderCampaignSaveState();
}

function renderCampaignSaveState() {
  if (!els.saveCampaignOverride) return;
  const source = state.campaignSource;
  els.saveCampaignOverride.disabled = !source;
  els.saveCampaignOverride.textContent = source
    ? `Save ${source.campaignName ?? source.campaignId} Dungeon ${source.campaignIndex} Override`
    : "Save Campaign Override";
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
  els.randomLayout.disabled = !canRerollRandomLayout();
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
  renderCampaignSaveState();
  renderRandomLayoutControls();
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
  const passage = makeCorridorPassage(state.corridorPassages.length, cells, { roomIds: [a.id, b.id] });
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
  state.corridorPassages.push(makeCorridorPassage(state.corridorPassages.length, path, { roomIds: [start.room?.id, end.room?.id].filter(Boolean) }));
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
  const room = roomAt(position);
  const nextObject = { ...object, position };
  if (
    !room ||
    objectCellsForCreator(nextObject).some((cell) => !roomAt(cell) || roomAt(cell).id !== room.id || occupied(cell, object.id))
  ) return;
  object.position = position;
  object.roomId = room.id;
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
  const room = roomAt(object.position);
  if (!room || objectCellsForCreator(rotated).some((cell) => !roomAt(cell) || roomAt(cell).id !== room.id || occupied(cell, object.id))) return;
  object.width = height;
  object.height = width;
  renderAll();
}

function createCustomItem() {
  const template = window.DungeonContent.get("items", els.customItemTemplate.value);
  if (!template) return;
  const id = `custom-item-${state.customItems.length + 1}`;
  const description = els.customItemDescription.value.trim() || template.description || template.magic?.description || template.treasure?.description || "";
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
  state.customItems.push(customItem);
  renderItemSelects();
  renderExport();
  setStatus(`Created local item ${state.customItems.at(-1).name}.`);
}

function placeFurniture(position) {
  const room = roomAt(position);
  if (!room || !state.selectedFurnitureId) return;
  const id = `${state.selectedFurnitureId}-${state.objects.length + 1}`;
  const object = { id, type: state.selectedFurnitureId, position: { ...position }, items: [], roomId: room.id };
  if (objectCellsForCreator(object).some((cell) => !roomAt(cell) || roomAt(cell).id !== room.id || occupied(cell))) return;
  state.objects.push(object);
  state.selectedId = id;
}

function placeMonster(position) {
  const room = roomAt(position);
  if (!room || !state.selectedMonsterId || occupied(position)) return;
  const template = window.DungeonContent.get("monsters", state.selectedMonsterId);
  if (!template) return;
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
  if (!room || occupied(position)) return;
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
    state.selectedId = monsterAt(position)?.id ?? objectAt(position)?.id ?? room?.id ?? "";
  }
  renderAll();
}

function addLootToSelected() {
  const selected = selectedEntity();
  const itemId = els.lootItem.value;
  if (!selected || !itemId) return;
  if (selected.monsterId) selected.extraLoot = [...(selected.extraLoot ?? []), itemId];
  if (selected.type) selected.items = [...(selected.items ?? []), itemId];
  renderAll();
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
  setStatus(`Saved ${saved.name}. It will appear at the Home Door as a Custom dungeon.`);
  renderAll();
}

async function saveCampaignOverride() {
  if (!state.campaignSource) {
    setStatus("Load a campaign dungeon first.");
    return;
  }
  const saved = window.DungeonCampaigns?.saveOverride?.(
    state.campaignSource.campaignId,
    state.campaignSource.campaignIndex,
    templateFromState({ includeCampaignSource: true }),
  );
  if (!saved) {
    setStatus("Could not save the campaign override.");
    return;
  }
  setStatus(`Saved override for ${state.campaignSource.campaignName ?? state.campaignSource.campaignId} Dungeon ${state.campaignSource.campaignIndex}.`);
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
  if (!canRerollRandomLayout()) {
    setStatus("Random Layout is locked once furniture, traps, monsters, or story triggers have been placed. Use New Blank Dungeon first.");
    return;
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
  setStatus(`Random layout created with ${state.rooms.length} of ${requestedRooms} requested rooms.`);
  renderAll();
}

function init() {
  renderThemes();
  renderItemSelects();
  els.customItemTemplate.dispatchEvent(new Event("change"));
  newBlankDungeon();
  setTool("select");
  void renderCampaignDungeons();

  els.toolGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tool]");
    if (button) setTool(button.dataset.tool);
  });
  els.grid.addEventListener("click", (event) => {
    const cell = event.target.closest("[data-x]");
    if (!cell) return;
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
  els.roomList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-room-select]");
    if (!button) return;
    state.selectedId = button.dataset.roomSelect;
    setTool("select");
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
  els.monsterSearch.addEventListener("input", renderMonsterCatalogue);
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
    const button = event.target.closest("[data-id]");
    if (!button) return;
    state.selectedMonsterId = button.dataset.id;
    setTool("monster");
    renderAll();
  });
  els.addLoot.addEventListener("click", addLootToSelected);
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
    els.customItemName.value = `${template.name} Variant`;
    els.customItemDescription.value = template.description ?? template.magic?.description ?? template.treasure?.description ?? "";
    els.customItemType.value = template.type ?? "";
    els.customItemWeight.value = String(template.weightLb ?? 0);
    els.customItemValue.value = String(itemValueCp(template) / 100);
  });
  els.selectedCard.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    if (button.dataset.action === "move-room") moveSelectedRoom(Number(button.dataset.dx), Number(button.dataset.dy));
    if (button.dataset.action === "move-object") moveSelectedObject(Number(button.dataset.dx), Number(button.dataset.dy));
    if (button.dataset.action === "rotate-object") rotateSelectedObject();
  });
  els.selectedCard.addEventListener("input", (event) => {
    const selected = selectedEntity();
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
      if (objectInput.dataset.objectField === "locked") selected.locked = objectInput.checked;
      if (objectInput.dataset.objectField === "lockDc") selected.lockDc = Math.max(1, Number(objectInput.value) || 12);
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
  els.saveDungeon.addEventListener("click", saveDungeon);
  els.saveCampaignOverride?.addEventListener("click", () => {
    void saveCampaignOverride();
  });
  els.copyJson.addEventListener("click", renderExport);
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
        setStatus(`Loaded ${campaign?.name ?? campaignId} Dungeon ${index}. Save Campaign Override to replace it in the campaign menu.`);
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
        setStatus(`Loaded original JSON for ${campaign?.name ?? campaignId} Dungeon ${index}. Save Campaign Override to replace the edited version.`);
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

window.addEventListener("DOMContentLoaded", init);
})();
