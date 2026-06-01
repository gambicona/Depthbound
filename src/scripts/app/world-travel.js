(() => {
  const worldVersion = 2;
  const defaultChunkWidth = 10;
  const defaultChunkHeight = 10;
  const originChunk = { chunkX: 0, chunkY: 0 };
  const chunkKey = (chunkX, chunkY) => `${Math.floor(Number(chunkX) || 0)},${Math.floor(Number(chunkY) || 0)}`;
  const originKey = chunkKey(0, 0);
  let builderFramePromise = null;
  let builderMessageRequestId = 0;

  function cloneData(value) {
    if (value === undefined) return undefined;
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return value;
    }
  }

  function nameTools() {
    return window.DepthboundWorldNames;
  }

  function biomeGroup(tile = "") {
    if (nameTools()?.biomeGroup) return nameTools().biomeGroup(tile);
    return String(tile || "").split("_")[0] || "grassland";
  }

  function cellId(chunkX, chunkY, row, col) {
    return `${chunkKey(chunkX, chunkY)}:${Math.floor(Number(row) || 0)},${Math.floor(Number(col) || 0)}`;
  }

  function hexDistance(a, b) {
    const aq = a.col - Math.floor(a.row / 2);
    const ar = a.row;
    const bq = b.col - Math.floor(b.row / 2);
    const br = b.row;
    return Math.max(Math.abs(aq - bq), Math.abs(ar - br), Math.abs((-aq - ar) - (-bq - br)));
  }

  function centerCell(width, height) {
    return {
      row: Math.max(0, Math.floor((height - 1) / 2)),
      col: Math.max(0, Math.floor((width - 1) / 2))
    };
  }

  function chunkObjectCell(object = {}) {
    return object?.generatedCell
      ? { row: Math.floor(Number(object.generatedCell.row) || 0), col: Math.floor(Number(object.generatedCell.col) || 0) }
      : null;
  }

  function cellOccupiedByStructure(chunk, cell) {
    return (chunk?.middleObjects ?? []).some((object) => {
      if (object?.layer !== "structures") return false;
      const objectCell = chunkObjectCell(object);
      return objectCell && objectCell.row === cell.row && objectCell.col === cell.col;
    });
  }

  function generatedObjectPosition(cell = { row: 0, col: 0 }) {
    const hexWidth = 149.2;
    const hexHeight = 172;
    return {
      x: cell.col * hexWidth + (cell.row % 2 ? hexWidth / 2 : 0) + hexWidth / 2,
      y: cell.row * hexHeight * 0.75 + hexHeight / 2
    };
  }

  function structureKind(tile = "") {
    return nameTools()?.structureKind?.(tile) ?? (String(tile || "").split("_")[0] || "site");
  }

  function shouldNameFeature(kind = "") {
    return nameTools()?.shouldGenerateFeatureName?.(kind) ?? ["village", "city", "lake"].includes(String(kind || "").toLowerCase());
  }

  function featureName(kind, seed, biome) {
    return nameTools()?.generateName?.(kind, { seed, biome }) ?? `${kind.slice(0, 1).toUpperCase()}${kind.slice(1)}`;
  }

  function builderFrameMessageApi(iframe) {
    return {
      ready: Promise.resolve(true),
      generateBigWorldChunkForGame(options = {}) {
        const requestId = `builder-${Date.now()}-${builderMessageRequestId += 1}`;
        return new Promise((resolve, reject) => {
          const timeout = window.setTimeout(() => {
            cleanup();
            reject(new Error("Hexagonal world builder did not answer in time."));
          }, 12000);
          const cleanup = () => {
            window.clearTimeout(timeout);
            window.removeEventListener("message", handleMessage);
          };
          const handleMessage = (event) => {
            if (event.source !== iframe.contentWindow) return;
            const data = event.data ?? {};
            if (data.type !== "depthbound-builder-result" || data.requestId !== requestId) return;
            cleanup();
            if (data.error) reject(new Error(data.error));
            else resolve(data.result);
          };
          window.addEventListener("message", handleMessage);
          iframe.contentWindow?.postMessage({ type: "depthbound-builder-generate", requestId, options }, "*");
        });
      }
    };
  }

  function builderFrame() {
    if (builderFramePromise) return builderFramePromise;
    builderFramePromise = new Promise((resolve, reject) => {
      const iframe = document.createElement("iframe");
      iframe.src = "hexagonalworldbuilder/index.html";
      iframe.title = "Hexagonal world builder generator";
      iframe.setAttribute("aria-hidden", "true");
      iframe.tabIndex = -1;
      iframe.style.cssText = "position:absolute;width:1px;height:1px;left:-9999px;top:-9999px;border:0;opacity:0;pointer-events:none;";
      iframe.addEventListener("load", async () => {
        try {
          const api = iframe.contentWindow?.HexagonalWorldBuilder;
          if (!api?.generateBigWorldChunkForGame) throw new Error("Hexagonal world builder API is unavailable.");
          await api.ready;
          resolve(api);
        } catch (error) {
          resolve(builderFrameMessageApi(iframe));
        }
      }, { once: true });
      iframe.addEventListener("error", () => reject(new Error("Could not load hexagonal world builder.")), { once: true });
      document.body.append(iframe);
    });
    return builderFramePromise;
  }

  function normalizeHex(hex, fallback = { ...originChunk, row: 0, col: 0 }) {
    return {
      chunkX: Math.floor(Number(hex?.chunkX ?? fallback.chunkX) || 0),
      chunkY: Math.floor(Number(hex?.chunkY ?? fallback.chunkY) || 0),
      row: Math.max(0, Math.floor(Number(hex?.row ?? fallback.row) || 0)),
      col: Math.max(0, Math.floor(Number(hex?.col ?? fallback.col) || 0))
    };
  }

  function normalizeObject(object, index, chunkX, chunkY, tiles) {
    const tile = String(object?.tile ?? "");
    const generatedCell = object?.generatedCell
      ? { row: Math.floor(Number(object.generatedCell.row) || 0), col: Math.floor(Number(object.generatedCell.col) || 0) }
      : null;
    const tileKind = structureKind(tile);
    const objectKind = structureKind(object?.kind || object?.nameKind || "");
    const kind = tileKind !== "generic" ? tileKind : objectKind;
    const biome = generatedCell ? tiles?.[generatedCell.row]?.[generatedCell.col] : null;
    const id = String(object?.id || `builder:${chunkKey(chunkX, chunkY)}:${tile}:${generatedCell?.row ?? "x"}:${generatedCell?.col ?? "y"}:${index}`);
    const existingNameIsGeneric = object?.generatedName && ["generic", "place"].includes(String(object?.nameKind || object?.kind || "").toLowerCase());
    const hasGeneratedName = shouldNameFeature(kind);
    const name = hasGeneratedName ? (!existingNameIsGeneric && object?.name ? object.name : featureName(kind, id, biome)) : "";
    return {
      ...cloneData(object),
      id,
      tile,
      kind,
      nameKind: kind,
      generatedCell,
      name,
      generatedName: hasGeneratedName && (object?.generatedName ?? !object?.name)
    };
  }

  function normalizeChunk(chunk, chunkX = 0, chunkY = 0) {
    const width = Math.max(1, Math.floor(Number(chunk?.width) || defaultChunkWidth));
    const height = Math.max(1, Math.floor(Number(chunk?.height) || defaultChunkHeight));
    const tiles = Array.from({ length: height }, (_, row) =>
      Array.from({ length: width }, (_, col) => String(chunk?.tiles?.[row]?.[col] ?? "grassland")),
    );
    return {
      width,
      height,
      tiles,
      climateGrid: Array.isArray(chunk?.climateGrid) ? cloneData(chunk.climateGrid) : [],
      middleObjects: Array.isArray(chunk?.middleObjects) ? chunk.middleObjects.map((object, index) => normalizeObject(object, index, chunkX, chunkY, tiles)) : [],
      rivers: Array.isArray(chunk?.rivers) ? cloneData(chunk.rivers) : [],
      roads: Array.isArray(chunk?.roads) ? cloneData(chunk.roads) : [],
      paths: Array.isArray(chunk?.paths) ? cloneData(chunk.paths) : []
    };
  }

  function chunkCells(chunk) {
    return Array.from({ length: chunk.height }, (_, row) => Array.from({ length: chunk.width }, (_, col) => ({ row, col }))).flat();
  }

  function structureMatches(object, predicate) {
    return object?.layer === "structures" && predicate(object);
  }

  function chunkHasStructure(chunk, predicate) {
    return (chunk?.middleObjects ?? []).some((object) => structureMatches(object, predicate));
  }

  function bestCellForStructure(chunk, preferredGroups = [], nearCell = null) {
    const preferred = new Set(preferredGroups.map((group) => String(group).toLowerCase()));
    const fallback = centerCell(chunk.width, chunk.height);
    return chunkCells(chunk)
      .filter((cell) => !cellOccupiedByStructure(chunk, cell))
      .map((cell) => {
        const group = biomeGroup(chunk.tiles?.[cell.row]?.[cell.col]);
        const preferredScore = preferred.size && !preferred.has(group) ? 20 : 0;
        const centerScore = hexDistance(cell, nearCell ?? fallback);
        const edgePenalty = cell.row <= 0 || cell.col <= 0 || cell.row >= chunk.height - 1 || cell.col >= chunk.width - 1 ? 2 : 0;
        return { cell, score: preferredScore + centerScore + edgePenalty };
      })
      .sort((a, b) => a.score - b.score)[0]?.cell ?? fallback;
  }

  function addGuaranteedStructure(chunk, tile, cell, chunkX = 0, chunkY = 0, extra = {}) {
    const position = generatedObjectPosition(cell);
    const id = `guaranteed:${chunkKey(chunkX, chunkY)}:${tile}:${cell.row}:${cell.col}`;
    const object = normalizeObject({
      id,
      tile,
      layer: "structures",
      x: position.x,
      y: position.y,
      scale: extra.scale ?? 0.58,
      rotation: 0,
      generatedCell: { ...cell },
      ...extra
    }, chunk.middleObjects.length, chunkX, chunkY, chunk.tiles);
    chunk.middleObjects.push(object);
    return object;
  }

  function nearestStructure(chunk, fromCell, predicate) {
    return (chunk.middleObjects ?? [])
      .filter((object) => structureMatches(object, predicate))
      .filter((object) => chunkObjectCell(object))
      .map((object) => ({ object, cell: chunkObjectCell(object), distance: hexDistance(chunkObjectCell(object), fromCell) }))
      .sort((a, b) => a.distance - b.distance)[0] ?? null;
  }

  function ensureStarterChunkRequirements(chunk, chunkX = 0, chunkY = 0) {
    if (chunkX !== 0 || chunkY !== 0 || !chunk) return chunk;
    const center = centerCell(chunk.width, chunk.height);
    if (!chunkHasStructure(chunk, (object) => (object.kind === "village" || object.nameKind === "village" || String(object.tile ?? "").startsWith("village")) && !String(object.tile ?? "").startsWith("city"))) {
      const cell = bestCellForStructure(chunk, ["grassland", "forest", "hills", "highlands"], center);
      addGuaranteedStructure(chunk, "village", cell, chunkX, chunkY, { scale: 0.62 });
    }
    const home = findHomeVillage({ chunks: { [originKey]: chunk } });
    const homeCell = home?.cell ?? center;
    if (!chunkHasStructure(chunk, (object) => object.kind === "city" || object.nameKind === "city" || String(object.tile ?? "").startsWith("city_"))) {
      const cell = bestCellForStructure(chunk, ["grassland", "forest", "hills"], homeCell);
      addGuaranteedStructure(chunk, "city_large", cell, chunkX, chunkY, { scale: 0.85 });
    }
    if (!chunkHasStructure(chunk, (object) => object.kind === "mine" || object.nameKind === "mine" || String(object.tile ?? "").includes("mine"))) {
      const cell = bestCellForStructure(chunk, ["mountain", "highlands", "hills"], homeCell);
      addGuaranteedStructure(chunk, "entrance_mine", cell, chunkX, chunkY, { scale: 0.55 });
    }
    const nearestMine = nearestStructure(chunk, homeCell, (object) => object.kind === "mine" || object.nameKind === "mine" || String(object.tile ?? "").includes("mine"));
    if (nearestMine?.object) {
      nearestMine.object.specialSite = "embervein-first-claim";
      nearestMine.object.campaignSite = "embervein";
      nearestMine.object.campaignIds = ["embervein-first-claim", "dwarven-smithy-ember-oath"];
    }
    return chunk;
  }

  function findHomeVillage(world) {
    const chunk = world?.chunks?.[originKey];
    if (!chunk) return null;
    const center = centerCell(chunk.width, chunk.height);
    return (chunk.middleObjects ?? [])
      .filter((object) => object?.layer === "structures")
      .filter((object) => String(object.tile ?? "").startsWith("village") || object.kind === "village" || object.nameKind === "village")
      .filter((object) => !String(object.tile ?? "").startsWith("city"))
      .filter((object) => object.generatedCell)
      .map((object) => {
        const cell = object.generatedCell;
        return { object, cell, distance: hexDistance(cell, center) };
      })
      .sort((a, b) => a.distance - b.distance)[0] ?? null;
  }

  async function generateChunk(chunkX = 0, chunkY = 0, options = {}) {
    const api = await builderFrame();
    const result = api.generateBigWorldChunkForGame({
      seed: options.seed,
      project: options.project,
      chunkX,
      chunkY,
      chunkWidth: options.chunkWidth ?? options.width ?? defaultChunkWidth,
      chunkHeight: options.chunkHeight ?? options.height ?? defaultChunkHeight
    });
    return {
      project: cloneData(result.project),
      chunk: ensureStarterChunkRequirements(normalizeChunk(result.chunk, chunkX, chunkY), chunkX, chunkY)
    };
  }

  async function createInitialWorldState(options = {}) {
    const seed = String(options.seed ?? `depthbound-world-${Date.now()}`);
    const generated = await generateChunk(0, 0, {
      seed,
      chunkWidth: options.chunkWidth ?? defaultChunkWidth,
      chunkHeight: options.chunkHeight ?? defaultChunkHeight
    });
    const world = {
      version: worldVersion,
      generator: "hexagonalworldbuilder.big-world",
      seed,
      chunkWidth: generated.chunk.width,
      chunkHeight: generated.chunk.height,
      worldProject: generated.project,
      currentHex: { ...originChunk, row: 0, col: 0 },
      homeHex: { ...originChunk, row: 0, col: 0 },
      homeVillageId: "",
      chunks: { [originKey]: generated.chunk },
      namedFeatures: {},
      discoveredHexes: {},
      rumoredHexes: {},
      visitedStructures: {},
      settlementsByHex: {},
      teleportCircles: {},
      teleportUnlocked: false,
      teleportIntroShown: false,
      travelPlan: [],
      routeConfirmed: false,
      routeHistory: [],
      tavernRumors: []
    };
    const home = findHomeVillage(world);
    if (home) {
      world.homeVillageId = home.object.id;
      world.homeHex = { ...originChunk, ...home.cell };
      world.currentHex = { ...originChunk, ...home.cell };
      world.discoveredHexes[cellId(0, 0, home.cell.row, home.cell.col)] = true;
    }
    return world;
  }

  function normalizeWorldState(world = null) {
    if (!world || typeof world !== "object") return null;
    const sourceChunks = world.chunks && typeof world.chunks === "object" ? world.chunks : {};
    const chunks = {};
    for (const [key, chunk] of Object.entries(sourceChunks)) {
      const [chunkX, chunkY] = key.split(",").map((value) => Math.floor(Number(value) || 0));
      chunks[key] = normalizeChunk(chunk, chunkX, chunkY);
    }
    if (chunks[originKey]) ensureStarterChunkRequirements(chunks[originKey], 0, 0);
    const origin = chunks[originKey] ?? Object.values(chunks)[0] ?? null;
    const fallbackHex = origin ? { ...originChunk, ...centerCell(origin.width, origin.height) } : { ...originChunk, row: 0, col: 0 };
    const normalized = {
      version: Math.max(worldVersion, Number(world.version) || worldVersion),
      generator: world.generator || "hexagonalworldbuilder.big-world",
      seed: String(world.seed ?? `depthbound-world-${Date.now()}`),
      chunkWidth: Math.max(1, Math.floor(Number(world.chunkWidth ?? origin?.width ?? defaultChunkWidth) || defaultChunkWidth)),
      chunkHeight: Math.max(1, Math.floor(Number(world.chunkHeight ?? origin?.height ?? defaultChunkHeight) || defaultChunkHeight)),
      worldProject: world.worldProject ? cloneData(world.worldProject) : null,
      currentHex: normalizeHex(world.currentHex, fallbackHex),
      homeHex: normalizeHex(world.homeHex, fallbackHex),
      homeVillageId: String(world.homeVillageId ?? ""),
      chunks,
      namedFeatures: world.namedFeatures && typeof world.namedFeatures === "object" ? cloneData(world.namedFeatures) : {},
      discoveredHexes: world.discoveredHexes && typeof world.discoveredHexes === "object" ? cloneData(world.discoveredHexes) : {},
      rumoredHexes: world.rumoredHexes && typeof world.rumoredHexes === "object" ? cloneData(world.rumoredHexes) : {},
      visitedStructures: world.visitedStructures && typeof world.visitedStructures === "object" ? cloneData(world.visitedStructures) : {},
      settlementsByHex: world.settlementsByHex && typeof world.settlementsByHex === "object" ? cloneData(world.settlementsByHex) : {},
      teleportCircles: world.teleportCircles && typeof world.teleportCircles === "object" ? cloneData(world.teleportCircles) : {},
      teleportUnlocked: Boolean(world.teleportUnlocked),
      teleportIntroShown: Boolean(world.teleportIntroShown),
      travelPlan: Array.isArray(world.travelPlan) ? world.travelPlan.map((hex) => normalizeHex(hex, fallbackHex)) : [],
      routeConfirmed: Boolean(world.routeConfirmed),
      routeHistory: Array.isArray(world.routeHistory) ? cloneData(world.routeHistory) : [],
      tavernRumors: Array.isArray(world.tavernRumors) ? cloneData(world.tavernRumors) : [],
      travelLog: Array.isArray(world.travelLog) ? cloneData(world.travelLog) : [],
      travelEventHistory: Array.isArray(world.travelEventHistory) ? cloneData(world.travelEventHistory) : [],
      travelCamp: world.travelCamp && typeof world.travelCamp === "object" ? cloneData(world.travelCamp) : null,
      campComforts: world.campComforts && typeof world.campComforts === "object" ? cloneData(world.campComforts) : {},
      campTentAssignments: world.campTentAssignments && typeof world.campTentAssignments === "object" ? cloneData(world.campTentAssignments) : {},
      campFurniture: world.campFurniture && typeof world.campFurniture === "object" ? cloneData(world.campFurniture) : {},
      campGearInventory: world.campGearInventory && typeof world.campGearInventory === "object" ? cloneData(world.campGearInventory) : {}
    };
    const home = findHomeVillage(normalized);
    if (home && !normalized.homeVillageId) normalized.homeVillageId = home.object.id;
    if (home && (!world.homeHex || world.homeVillageId !== normalized.homeVillageId)) normalized.homeHex = { ...originChunk, ...home.cell };
    if (!world.currentHex && home) normalized.currentHex = { ...originChunk, ...home.cell };
    if (normalized.homeHex) normalized.discoveredHexes[cellId(normalized.homeHex.chunkX, normalized.homeHex.chunkY, normalized.homeHex.row, normalized.homeHex.col)] = true;
    return normalized;
  }

  window.DepthboundWorldTravel = {
    version: worldVersion,
    chunkKey,
    cellId,
    biomeGroup,
    createInitialWorldState,
    normalizeWorldState,
    generateChunk,
    findHomeVillage
  };
})();
