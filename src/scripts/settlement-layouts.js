(() => {
const folder = "settlement-layouts";
const layouts = [
  { id: "travel-camp", name: "Travel Camp", file: "travel-camp.json", kind: "camp" },
  { id: "inn-common-hall", name: "Inn - Common Hall", file: "inn-common-hall.json", kind: "inn" },
  { id: "inn-side-taproom", name: "Inn - Side Taproom", file: "inn-side-taproom.json", kind: "inn" },
  { id: "inn-lodge-corners", name: "Inn - Lodge Corners", file: "inn-lodge-corners.json", kind: "inn" },
  { id: "inn-longhouse", name: "Inn - Longhouse", file: "inn-longhouse.json", kind: "inn" },
];

const cache = new Map();
const sourceFetchTimeoutMs = 900;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function cellsForRect(x, y, width, height) {
  const cells = [];
  for (let cy = y; cy < y + height; cy += 1) {
    for (let cx = x; cx < x + width; cx += 1) cells.push({ x: cx, y: cy });
  }
  return cells;
}

function uniqueCells(cells) {
  return Array.from(new Map(cells.map((cell) => [`${cell.x},${cell.y}`, cell])).values());
}

function makeRoom(id, name, cells) {
  const xs = cells.map((cell) => cell.x);
  const ys = cells.map((cell) => cell.y);
  return {
    id,
    name,
    shape: "custom",
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs) + 1,
    height: Math.max(...ys) - Math.min(...ys) + 1,
    cells: uniqueCells(cells),
    doors: [],
    connections: [],
  };
}

function object(id, type, x, y, options = {}) {
  return {
    id,
    type,
    position: { x, y },
    items: [],
    ...options,
  };
}

function template({ id, name, kind, room, startPosition, exit = null, objects = [] }) {
  return {
    id,
    name,
    settlementLayout: true,
    settlementLayoutId: id,
    settlementLayoutKind: kind,
    themeId: "oldGuardroom",
    gridSize: 24,
    dungeon: {
      id,
      gridSize: 24,
      roomCount: 1,
      rooms: [room],
      corridors: [],
      corridorPassages: [],
      doors: [],
      walkable: clone(room.cells),
      entranceRoomId: room.id,
      entranceDoor: clone(startPosition),
      startPosition: clone(startPosition),
    },
    exit,
    objects,
    monsters: [],
    customItems: [],
    goal: { type: "reachExit" },
    intro: { text: "", images: [] },
    outro: { text: "", images: [] },
    storyTriggers: [],
  };
}

function builtInTravelCamp() {
  const room = makeRoom("camp-room", "Travel Camp", cellsForRect(4, 4, 17, 17));
  return template({
    id: "travel-camp",
    name: "Travel Camp",
    kind: "camp",
    room,
    startPosition: { x: 12, y: 13 },
    objects: [object("camp-fireplace", "camp-fireplace", 12, 12, { campFireplace: true })],
  });
}

function builtInInnCommonHall() {
  const room = makeRoom("inn-room", "Common Hall", [...cellsForRect(4, 5, 17, 14), ...cellsForRect(2, 11, 2, 4)]);
  return template({
    id: "inn-common-hall",
    name: "Inn - Common Hall",
    kind: "inn",
    room,
    startPosition: { x: 4, y: 12 },
    exit: { roomId: "inn-room", position: { x: 2, y: 12 } },
    objects: [
      object("inn-bar", "inn-bar", 15, 6, { width: 4, height: 1, innFixture: true }),
      object("inn-lantern-1", "modest-brass-lantern", 6, 6, { innFixture: true }),
      object("inn-lantern-2", "modest-brass-lantern", 19, 15, { innFixture: true }),
      object("inn-rug", "comfortable-thick-rug", 10, 10, { width: 2, height: 2, innFixture: true }),
      object("inn-table-1", "comfortable-round-tavern-table", 7, 8, { width: 2, height: 2, innFixture: true }),
      object("inn-table-2", "modest-breakfast-table", 7, 14, { width: 2, height: 1, innFixture: true }),
      object("inn-table-3", "comfortable-tea-table", 12, 15, { width: 2, height: 1, innFixture: true }),
      object("inn-keg-1", "poor-ale-keg", 14, 6, { innFixture: true }),
      object("inn-mug-shelf", "modest-mug-shelf", 18, 6, { width: 2, height: 1, innFixture: true }),
      object("inn-chair-1", "poor-pine-chair", 6, 8, { innFixture: true }),
      object("inn-chair-2", "poor-pine-chair", 9, 8, { innFixture: true }),
      object("inn-chair-3", "poor-pine-chair", 6, 14, { innFixture: true }),
      object("inn-chair-4", "poor-pine-chair", 9, 14, { innFixture: true }),
      object("inn-chair-5", "modest-oak-chair", 11, 15, { innFixture: true }),
      object("inn-chair-6", "modest-oak-chair", 14, 15, { innFixture: true }),
      object("inn-sideboard", "wealthy-wine-sideboard", 16, 17, { width: 2, height: 1, innFixture: true }),
      object("inn-bookcase", "comfortable-bookcase", 4, 6, { innFixture: true }),
      object("inn-screen", "poor-reed-screen", 18, 10, { width: 2, height: 1, innFixture: true }),
    ],
  });
}

function builtInInnSideTaproom() {
  const room = makeRoom("inn-room", "Side Taproom", [...cellsForRect(5, 4, 13, 16), ...cellsForRect(18, 8, 4, 7)]);
  return template({
    id: "inn-side-taproom",
    name: "Inn - Side Taproom",
    kind: "inn",
    room,
    startPosition: { x: 5, y: 12 },
    exit: { roomId: "inn-room", position: { x: 5, y: 12 } },
    objects: [
      object("inn-bar", "inn-bar", 18, 9, { width: 1, height: 4, innFixture: true }),
      object("inn-table-1", "modest-tavern-booth", 8, 7, { width: 2, height: 1, innFixture: true }),
      object("inn-table-2", "comfortable-tea-table", 9, 15, { width: 2, height: 1, innFixture: true }),
      object("inn-stewpot", "modest-hearth-stewpot", 16, 6, { innFixture: true }),
      object("inn-barstool-1", "comfortable-carved-barstool", 19, 9, { innFixture: true }),
      object("inn-barstool-2", "comfortable-carved-barstool", 19, 12, { innFixture: true }),
      object("inn-chair-1", "poor-pine-chair", 7, 7, { innFixture: true }),
      object("inn-chair-2", "poor-pine-chair", 10, 7, { innFixture: true }),
      object("inn-chair-3", "modest-oak-chair", 8, 15, { innFixture: true }),
      object("inn-chair-4", "modest-oak-chair", 11, 15, { innFixture: true }),
      object("inn-lantern-1", "modest-brass-lantern", 6, 5, { innFixture: true }),
      object("inn-lantern-2", "modest-brass-lantern", 20, 13, { innFixture: true }),
      object("inn-rug", "poor-rush-rug", 13, 10, { width: 2, height: 2, innFixture: true }),
      object("inn-sideboard", "wealthy-wine-sideboard", 15, 17, { width: 2, height: 1, innFixture: true }),
    ],
  });
}

function builtInInnLodgeCorners() {
  const room = makeRoom("inn-room", "Corner Lodge", [...cellsForRect(4, 6, 15, 12), ...cellsForRect(7, 3, 6, 3), ...cellsForRect(16, 14, 5, 5)]);
  return template({
    id: "inn-lodge-corners",
    name: "Inn - Lodge Corners",
    kind: "inn",
    room,
    startPosition: { x: 4, y: 11 },
    exit: { roomId: "inn-room", position: { x: 4, y: 11 } },
    objects: [
      object("inn-bar", "inn-bar", 8, 4, { width: 4, height: 1, innFixture: true }),
      object("inn-table-1", "wealthy-private-booth", 7, 9, { width: 2, height: 2, innFixture: true }),
      object("inn-table-2", "comfortable-tea-table", 14, 11, { width: 2, height: 1, innFixture: true }),
      object("inn-table-3", "modest-breakfast-table", 17, 16, { width: 2, height: 1, innFixture: true }),
      object("inn-trophy-board", "comfortable-trophy-board", 15, 7, { width: 2, height: 1, innFixture: true }),
      object("inn-chair-1", "poor-pine-chair", 6, 9, { innFixture: true }),
      object("inn-chair-2", "poor-pine-chair", 9, 9, { innFixture: true }),
      object("inn-chair-3", "modest-oak-chair", 13, 11, { innFixture: true }),
      object("inn-chair-4", "modest-oak-chair", 16, 11, { innFixture: true }),
      object("inn-lantern-1", "modest-brass-lantern", 5, 16, { innFixture: true }),
      object("inn-lantern-2", "modest-brass-lantern", 19, 15, { innFixture: true }),
      object("inn-bookcase", "comfortable-bookcase", 17, 7, { innFixture: true }),
      object("inn-rug", "comfortable-thick-rug", 10, 13, { width: 2, height: 2, innFixture: true }),
    ],
  });
}

function builtInInnLonghouse() {
  const room = makeRoom("inn-room", "Longhouse Taproom", [...cellsForRect(3, 7, 19, 9), ...cellsForRect(10, 4, 6, 3)]);
  return template({
    id: "inn-longhouse",
    name: "Inn - Longhouse",
    kind: "inn",
    room,
    startPosition: { x: 3, y: 11 },
    exit: { roomId: "inn-room", position: { x: 3, y: 11 } },
    objects: [
      object("inn-bar", "inn-bar", 11, 5, { width: 4, height: 1, innFixture: true }),
      object("inn-table-1", "poor-tavern-bench", 6, 9, { width: 2, height: 1, innFixture: true }),
      object("inn-table-2", "modest-breakfast-table", 11, 12, { width: 2, height: 1, innFixture: true }),
      object("inn-table-3", "comfortable-tea-table", 17, 9, { width: 2, height: 1, innFixture: true }),
      object("inn-bottle-cabinet", "wealthy-bottle-cabinet", 19, 13, { width: 2, height: 1, innFixture: true }),
      object("inn-chair-1", "poor-pine-chair", 5, 9, { innFixture: true }),
      object("inn-chair-2", "poor-pine-chair", 8, 9, { innFixture: true }),
      object("inn-chair-3", "poor-pine-chair", 10, 12, { innFixture: true }),
      object("inn-chair-4", "poor-pine-chair", 13, 12, { innFixture: true }),
      object("inn-chair-5", "modest-oak-chair", 16, 9, { innFixture: true }),
      object("inn-chair-6", "modest-oak-chair", 19, 9, { innFixture: true }),
      object("inn-lantern-1", "modest-brass-lantern", 4, 14, { innFixture: true }),
      object("inn-lantern-2", "modest-brass-lantern", 21, 8, { innFixture: true }),
      object("inn-sideboard", "wealthy-wine-sideboard", 19, 14, { width: 2, height: 1, innFixture: true }),
    ],
  });
}

const builtIns = {
  "travel-camp": builtInTravelCamp,
  "inn-common-hall": builtInInnCommonHall,
  "inn-side-taproom": builtInInnSideTaproom,
  "inn-lodge-corners": builtInInnLodgeCorners,
  "inn-longhouse": builtInInnLonghouse,
};

function entryById(id) {
  return layouts.find((entry) => entry.id === id) ?? null;
}

function normalizeTemplate(id, template) {
  const entry = entryById(id);
  if (!entry || !template) return null;
  return {
    ...clone(template),
    id,
    name: template.name ?? entry.name,
    settlementLayout: true,
    settlementLayoutId: id,
    settlementLayoutKind: entry.kind,
  };
}

function builtIn(id) {
  const templateFactory = builtIns[id];
  return templateFactory ? normalizeTemplate(id, templateFactory()) : null;
}

async function get(id) {
  const entry = entryById(id);
  if (!entry) return null;
  if (!cache.has(id)) {
    const load = (async () => {
      if (window.location.protocol === "file:") {
        const fallback = builtIn(id);
        cache.set(id, fallback ? clone(fallback) : null);
        return fallback;
      }
      const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
      const timeout = controller ? window.setTimeout(() => controller.abort(), sourceFetchTimeoutMs) : null;
      try {
        const response = await fetch(`${folder}/${entry.file}`, { cache: "no-store", signal: controller?.signal });
        const source = response.ok ? await response.json() : null;
        const template = normalizeTemplate(id, source) ?? builtIn(id);
        cache.set(id, template ? clone(template) : null);
        return template;
      } catch {
        const fallback = builtIn(id);
        cache.set(id, fallback ? clone(fallback) : null);
        return fallback;
      } finally {
        if (timeout) window.clearTimeout(timeout);
      }
    })();
    cache.set(id, load);
  }
  const template = await cache.get(id);
  return template ? clone(template) : null;
}

function getCached(id) {
  const cached = cache.get(id);
  if (!cached || typeof cached.then === "function") return builtIn(id);
  return clone(cached);
}

async function preload(ids = layouts.map((entry) => entry.id)) {
  if (window.location.protocol === "file:") return;
  await Promise.all(ids.map((id) => get(id)));
}

async function saveSource(id, template) {
  const entry = entryById(id);
  if (!entry || !template) return null;
  const normalized = {
    ...normalizeTemplate(id, template),
    updatedAt: new Date().toISOString(),
  };
  const response = await fetch("/save-source-dungeon", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind: "settlement-layout", id, template: normalized }),
  }).catch(() => null);
  if (!response?.ok) return null;
  const result = await response.json().catch(() => null);
  if (!result?.saved) return null;
  cache.set(id, Promise.resolve(clone(normalized)));
  return clone(normalized);
}

window.DungeonSettlementLayouts = {
  list: () => layouts.map(clone),
  get,
  getCached,
  builtIn,
  preload,
  saveSource,
};
void preload();
})();
