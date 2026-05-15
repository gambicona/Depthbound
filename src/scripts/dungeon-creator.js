(() => {
const key = (position) => `${position.x},${position.y}`;
const clone = (value) => JSON.parse(JSON.stringify(value));

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
  status: document.querySelector("#creator-status"),
  exportJson: document.querySelector("#export-json"),
  copyJson: document.querySelector("#copy-json"),
  importJson: document.querySelector("#import-json"),
  goalType: document.querySelector("#goal-type"),
  goalItem: document.querySelector("#goal-item"),
  goalMonster: document.querySelector("#goal-monster"),
  goalCount: document.querySelector("#goal-count"),
  introText: document.querySelector("#intro-text"),
  introImages: document.querySelector("#intro-images"),
  outroText: document.querySelector("#outro-text"),
  outroImages: document.querySelector("#outro-images"),
  customItemTemplate: document.querySelector("#custom-item-template"),
  customItemName: document.querySelector("#custom-item-name"),
  customItemDescription: document.querySelector("#custom-item-description"),
  customItemType: document.querySelector("#custom-item-type"),
  customItemWeight: document.querySelector("#custom-item-weight"),
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
  selectedFurnitureId: "",
  selectedMonsterId: "",
  selectedId: "",
  connectFromRoomId: "",
  pendingPortalId: "",
  hallwayStart: null,
  hallwayCells: [],
  roomDrag: null,
  exit: null,
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
  return state.objects.find((object) => object.position.x === position.x && object.position.y === position.y) ?? null;
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
  const entranceRoom = state.rooms[0];
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
    startPosition: entranceRoom?.cells?.find((cell) => !entranceRoom.doors?.some((door) => key(door) === key(cell))) ?? entranceRoom?.cells?.[0] ?? { x: 1, y: 1 },
  };
}

function goalFromForm() {
  const type = els.goalType.value;
  if (type === "collectItem") return { type, itemId: els.goalItem.value };
  if (type === "collectItemCount") return { type, itemId: els.goalItem.value, count: Math.max(1, Number(els.goalCount.value) || 1) };
  if (type === "killMonsterType") return { type, monsterId: els.goalMonster.value, count: Math.max(1, Number(els.goalCount.value) || 1) };
  if (type === "killBoss") return { type };
  if (type === "escortNpc") return { type };
  return { type: "reachExit" };
}

function templateFromState() {
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
  return `<button type="button" data-id="${entry.id}" class="${entry.id === selectedId ? "active" : ""}"><b>${entry.name}</b><br><span class="small-note">${entry.id}</span></button>`;
}

function renderFurnitureCatalogue() {
  const query = els.furnitureSearch.value.trim().toLowerCase();
  const entries = window.DungeonContent
    .list("furniture")
    .filter((entry) => (state.tool === "trap" ? entry.kind === "trap" : entry.kind !== "trap"))
    .filter((entry) => !query || `${entry.name} ${entry.id} ${(entry.tags ?? []).join(" ")}`.toLowerCase().includes(query))
    .sort((a, b) => a.name.localeCompare(b.name));
  els.furnitureCatalogue.innerHTML = entries.map((entry) => catalogueButton(entry, state.selectedFurnitureId)).join("");
}

function renderMonsterCatalogue() {
  const query = els.monsterSearch.value.trim().toLowerCase();
  const entries = window.DungeonContent
    .list("monsters")
    .filter((entry) => !query || `${entry.name} ${entry.id} ${(entry.tags ?? []).join(" ")}`.toLowerCase().includes(query))
    .sort((a, b) => a.name.localeCompare(b.name));
  els.monsterCatalogue.innerHTML = entries.map((entry) => catalogueButton(entry, state.selectedMonsterId)).join("");
}

function renderItemSelects() {
  const items = window.DungeonContent
    .list("items")
    .filter((item) => item.type !== "class")
    .sort((a, b) => a.name.localeCompare(b.name));
  const options = items.map((item) => `<option value="${item.id}">${item.name}</option>`).join("");
  const customOptions = state.customItems.map((item) => `<option value="${item.id}">${item.name}</option>`).join("");
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
    if (state.exit?.roomId === oldId && cellInRoom(room, state.exit.position)) state.exit.roomId = newId;
  }
}

function renderGrid() {
  const roomMap = roomCellMap();
  const corridorKeys = new Set(state.corridors.map(key));
  const doorKeys = new Set(state.rooms.flatMap((room) => room.doors ?? []).map(key));
  const exitKey = state.exit ? key(state.exit.position) : "";
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
        exitKey === cellKey ? "exit" : "",
        portalKeys.has(cellKey) ? "portal" : "",
        hallwayPreviewKeys.has(cellKey) ? "selected-room" : "",
        room?.id === state.connectFromRoomId || room?.id === state.selectedId ? "selected-room" : "",
        y === 0 && x % 5 === 0 ? "axis-x" : "",
        x === 0 && y % 5 === 0 ? "axis-y" : "",
      ].filter(Boolean).join(" ");
      const label = monster ? "M" : object ? (object.type === "portal" ? "P" : "F") : exitKey === cellKey ? "E" : "";
      cells.push(`<button type="button" class="${classes}" data-x="${x}" data-y="${y}" data-axis-x="${x}" data-axis-y="${y}" title="${room?.name ?? ""}">${label}</button>`);
    }
  }
  els.grid.innerHTML = cells.join("");
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
      </div>`;
    return;
  }
  els.selectedCard.innerHTML = `
    <b>${selected.name}</b><br>
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

function renderExport() {
  els.exportJson.value = JSON.stringify(templateFromState(), null, 2);
}

function renderAll() {
  repairDuplicateRoomIds();
  renderTools();
  renderFurnitureCatalogue();
  renderMonsterCatalogue();
  renderGrid();
  renderRoomList();
  renderSelected();
  renderSavedDungeons();
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
  const cells = carvePath(aConnection.outside, bConnection.outside);
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
  const path = uniqueCells(cells);
  state.corridors = uniqueCells([...state.corridors, ...path]);
  state.corridorPassages.push(makeCorridorPassage(state.corridorPassages.length, path, { roomIds: [start.room?.id, end.room?.id].filter(Boolean) }));
  if (start.room) start.room.doors.push({ ...start.position, corridor: { ...path[0] }, ...(end.room ? { to: end.room.id } : {}) });
  if (end.room) end.room.doors.push({ ...end.position, corridor: { ...path.at(-1) }, ...(start.room ? { to: start.room.id } : {}) });
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
  rebuildAllCorridors();
  renderAll();
}

function previewDraggedRoom(room, dx, dy) {
  const nextX = room.x + dx;
  const nextY = room.y + dy;
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
  const preview = previewDraggedRoom(room, dx, dy);
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
  if (!room || occupied(position, object.id)) return;
  object.position = position;
  object.roomId = room.id;
  renderAll();
}

function createCustomItem() {
  const template = window.DungeonContent.get("items", els.customItemTemplate.value);
  if (!template) return;
  const id = `custom-item-${state.customItems.length + 1}`;
  state.customItems.push({
    ...clone(template),
    id,
    baseItemId: id,
    name: els.customItemName.value.trim() || `${template.name} Variant`,
    description: els.customItemDescription.value.trim() || template.description || "",
    type: els.customItemType.value.trim() || template.type,
    weightLb: Number(els.customItemWeight.value) || template.weightLb || 0,
  });
  renderItemSelects();
  renderExport();
  setStatus(`Created local item ${state.customItems.at(-1).name}.`);
}

function placeFurniture(position) {
  const room = roomAt(position);
  if (!room || !state.selectedFurnitureId || occupied(position)) return;
  const id = `${state.selectedFurnitureId}-${state.objects.length + 1}`;
  state.objects.push({ id, type: state.selectedFurnitureId, position: { ...position }, items: [], roomId: room.id });
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
    if (state.selectedId === monster.id) state.selectedId = "";
    return;
  }
  const object = objectAt(position);
  if (object) {
    state.objects = state.objects.filter((entry) => entry.id !== object.id && entry.id !== object.pairId);
    if (state.selectedId === object.id) state.selectedId = "";
    return;
  }
  if (state.exit && key(state.exit.position) === key(position)) state.exit = null;
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
  else if (selected.type) state.objects = state.objects.filter((entry) => entry.id !== selected.id && entry.id !== selected.pairId);
  else if (selected.cells) {
    state.rooms = state.rooms.filter((entry) => entry.id !== selected.id);
    state.rooms.forEach((room) => {
      room.connections = (room.connections ?? []).filter((id) => id !== selected.id);
    });
    state.objects = state.objects.filter((entry) => entry.roomId !== selected.id);
    state.monsters = state.monsters.filter((entry) => entry.roomId !== selected.id);
    if (state.exit?.roomId === selected.id) state.exit = null;
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
  setStatus(`Saved ${saved.name}. It will appear at the Home Door as a Custom dungeon.`);
  renderAll();
}

function loadTemplate(template) {
  state.id = template.id;
  state.gridSize = template.gridSize ?? template.dungeon?.gridSize ?? 36;
  state.rooms = clone(template.dungeon?.rooms ?? []);
  state.corridors = clone(template.dungeon?.corridors ?? []);
  state.corridorPassages = clone(template.dungeon?.corridorPassages ?? []);
  state.objects = clone(template.objects ?? []);
  state.monsters = clone(template.monsters ?? []);
  state.customItems = clone(template.customItems ?? []);
  state.exit = clone(template.exit ?? null);
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
  els.introText.value = template.intro?.text ?? "";
  els.introImages.value = (template.intro?.images ?? []).join("\n");
  els.outroText.value = template.outro?.text ?? "";
  els.outroImages.value = (template.outro?.images ?? []).join("\n");
  renderItemSelects();
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
  state.exit = null;
  state.selectedId = "";
  state.connectFromRoomId = "";
  state.pendingPortalId = "";
  state.hallwayStart = null;
  state.hallwayCells = [];
  renderAll();
}

function init() {
  renderThemes();
  renderItemSelects();
  els.customItemTemplate.dispatchEvent(new Event("change"));
  newBlankDungeon();
  setTool("select");

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
  els.createCustomItem.addEventListener("click", createCustomItem);
  els.customItemTemplate.addEventListener("change", () => {
    const template = window.DungeonContent.get("items", els.customItemTemplate.value);
    if (!template) return;
    els.customItemName.value = `${template.name} Variant`;
    els.customItemDescription.value = template.description ?? "";
    els.customItemType.value = template.type ?? "";
    els.customItemWeight.value = String(template.weightLb ?? 0);
  });
  els.selectedCard.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    if (button.dataset.action === "move-room") moveSelectedRoom(Number(button.dataset.dx), Number(button.dataset.dy));
    if (button.dataset.action === "move-object") moveSelectedObject(Number(button.dataset.dx), Number(button.dataset.dy));
  });
  els.selectedCard.addEventListener("input", (event) => {
    const selected = selectedEntity();
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
  ["input", "change"].forEach((eventName) => {
    [els.name, els.theme, els.goalType, els.goalItem, els.goalMonster, els.goalCount, els.introText, els.introImages, els.outroText, els.outroImages].forEach((element) => {
      element.addEventListener(eventName, renderExport);
    });
  });
}

window.addEventListener("DOMContentLoaded", init);
})();
