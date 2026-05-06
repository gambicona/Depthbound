(() => {
const { gridSize, feetPerSquare, tileSizePx, tokenSlideMs, templates, defaultContent } = window.DungeonConfig;
const { rollDie, rollDice, abilityLabel } = window.DungeonDice;
const { distance, isAdjacent, positionKey, findPath, reachableTiles } = window.DungeonGrid;
const { generateDungeon, roomHasCell } = window.DungeonGenerator;
const { slotCount, getSlots, save, load, remove, saveQuickstart, loadQuickstart } = window.DungeonSave;

let state = null;
let roomIsBuilt = false;
let monsterTurnTimer = null;
let gameHasStarted = false;
let activeSaveSlot = 1;
let showDungeonLayout = false;
let movementInProgress = false;
let dragPath = null;
let roomZoom = 1;
let currentInventoryDrag = null;
let mapPan = null;
let suppressNextTileClick = false;
let inventoryAdminOpen = false;
let roomScrollAnimation = null;
let inventoryAdminSearch = "";
let storeSearch = "";
let adminItemInstanceCounter = 0;
let activeDialogCancel = null;
let trapDetectionDebugLog = true;
let currentMusicKey = "";
let currentMusic = null;
const soundAssetRoot = "assets/sounds";
const soundEffects = {
  characterDamage: `${soundAssetRoot}/effects/character-damage.wav`,
  enemyDefeated: `${soundAssetRoot}/effects/enemy-defeated.wav`,
  exitReached: `${soundAssetRoot}/effects/exit-reached.wav`,
  portal: `${soundAssetRoot}/effects/portal.wav`,
  shortRestFinished: `${soundAssetRoot}/effects/short-rest-finished.wav`,
  potionDrink: `${soundAssetRoot}/effects/potion-drink.wav`,
  meleeAttack: `${soundAssetRoot}/effects/melee-attack.wav`,
  rangedAttack: `${soundAssetRoot}/effects/ranged-attack.wav`,
};

const equipmentSlots = [
  { id: "mainHand", label: "Main hand" },
  { id: "offHand", label: "Off hand" },
  { id: "head", label: "Head" },
  { id: "torso", label: "Torso" },
  { id: "boots", label: "Boots" },
  { id: "cloak", label: "Cloak" },
  { id: "bracers", label: "Bracers" },
  { id: "gauntlets", label: "Gauntlets" },
  { id: "ring1", label: "Ring 1" },
  { id: "ring2", label: "Ring 2" },
  { id: "amulet", label: "Amulet" },
  { id: "quiver", label: "Quiver" },
  { id: "belt1", label: "Belt 1" },
  { id: "belt2", label: "Belt 2" },
  { id: "belt3", label: "Belt 3" },
  { id: "belt4", label: "Belt 4" },
  { id: "belt5", label: "Belt 5" },
];

const itemAliases = {
  "item-longsword": "longsword",
  "item-chain-mail": "chain-mail",
};

const abilities = ["str", "dex", "con", "int", "wis", "cha"];
const standardArray = [15, 14, 13, 12, 10, 8];
const pregeneratedAbilityScores = { str: 15, con: 14, dex: 13, wis: 12, int: 10, cha: 8 };
const fighterAbilityScoreImprovementLevels = new Set([4, 6, 8, 12, 14, 16, 19]);

const els = {
  mainMenu: document.querySelector("#main-menu"),
  startAdventure: document.querySelector("#start-adventure"),
  saveSlots: document.querySelector("#save-slots"),
  saveStatus: document.querySelector("#save-status"),
  roomTitle: document.querySelector("#room-title"),
  room: document.querySelector("#room"),
  roomScroll: document.querySelector(".room-scroll"),
  heroCard: document.querySelector("#hero-card"),
  fighterInfo: document.querySelector("#fighter-info"),
  fighterInfoName: document.querySelector("#fighter-info-name"),
  fighterInfoBody: document.querySelector("#fighter-info-body"),
  closeFighterInfo: document.querySelector("#close-fighter-info"),
  inventoryMenu: document.querySelector("#inventory-menu"),
  inventoryBody: document.querySelector("#inventory-body"),
  closeInventory: document.querySelector("#close-inventory"),
  useItemMenu: document.querySelector("#use-item-menu"),
  useItemBody: document.querySelector("#use-item-body"),
  closeUseItem: document.querySelector("#close-use-item"),
  actionButton: document.querySelector("#action-button"),
  actionMenu: document.querySelector("#action-menu"),
  actionMenuBody: document.querySelector("#action-menu-body"),
  closeActionMenu: document.querySelector("#close-action-menu"),
  homeMenu: document.querySelector("#home-menu"),
  closeHomeMenu: document.querySelector("#close-home-menu"),
  goStore: document.querySelector("#go-store"),
  goNewDungeon: document.querySelector("#go-new-dungeon"),
  levelUp: document.querySelector("#level-up"),
  storeMenu: document.querySelector("#store-menu"),
  storeBody: document.querySelector("#store-body"),
  closeStore: document.querySelector("#close-store"),
  log: document.querySelector("#combat-log"),
  roundLabel: document.querySelector("#round-label"),
  turnLabel: document.querySelector("#turn-label"),
  initiativeList: document.querySelector("#initiative-list"),
  rollInitiative: document.querySelector("#roll-initiative"),
  attack: document.querySelector("#attack"),
  attackNote: document.querySelector("#attack-note"),
  useItem: document.querySelector("#use-item"),
  abilities: document.querySelector("#abilities"),
  abilitiesMenu: document.querySelector("#abilities-menu"),
  abilitiesBody: document.querySelector("#abilities-body"),
  closeAbilities: document.querySelector("#close-abilities"),
  shortRest: document.querySelector("#short-rest"),
  returnHome: document.querySelector("#return-home"),
  endTurn: document.querySelector("#end-turn"),
  newGame: document.querySelector("#new-game"),
  tutorial: document.querySelector("#tutorial"),
  saveGame: document.querySelector("#save-game"),
  toggleLayout: document.querySelector("#toggle-layout"),
  zoomIn: document.querySelector("#zoom-in"),
  zoomOut: document.querySelector("#zoom-out"),
  zoomLabel: document.querySelector("#zoom-label"),
  debugKill: document.querySelector("#debug-kill"),
  clearLog: document.querySelector("#clear-log"),
  gameDialog: document.querySelector("#game-dialog"),
  gameDialogForm: document.querySelector("#game-dialog-form"),
  gameDialogTitle: document.querySelector("#game-dialog-title"),
  gameDialogMessage: document.querySelector("#game-dialog-message"),
  gameDialogField: document.querySelector("#game-dialog-field"),
  gameDialogLabel: document.querySelector("#game-dialog-label"),
  gameDialogInput: document.querySelector("#game-dialog-input"),
  gameDialogActions: document.querySelector("#game-dialog-actions"),
};

function createInitialState(heroNameOverride = "", heroForDifficulty = null, heroOptions = {}, themeId = defaultContent.theme) {
  const dungeonDefinition = getContentDefinition("dungeons", defaultContent.dungeon);
  const theme = getContentDefinition("themes", themeId);
  const dungeonOptions = {
    ...(dungeonDefinition?.options ?? window.DungeonConfig.dungeon),
  };
  const isLevelOneDungeon = heroForDifficulty?.level === 1 || heroForDifficulty == null;
  if (isLevelOneDungeon) {
    dungeonOptions.roomCount = 10;
  }
  Object.assign(dungeonOptions, theme?.generator ?? {});
  const categoryRoomCount = theme?.generator?.roomCountByCategory?.[categoryForHeroLevel(heroForDifficulty?.level ?? 1)];
  if (categoryRoomCount) dungeonOptions.roomCount = categoryRoomCount;
  const dungeon = generateDungeon(dungeonOptions);
  const heroTemplate = applyHeroCreationOptions(
    {
      ...getHeroTemplate(),
      id: "hero",
      name: heroNameOverride.trim() || getHeroTemplate().name,
      position: { x: 0, y: 0 },
    },
    heroOptions,
  );
  const hero = createCombatant({
    ...heroTemplate,
  });
  hero.token = tokenFromName(hero.name, hero.token);
  hero.position = { ...dungeon.startPosition };
  const firstRoom = dungeon.rooms.find((room) => room.id === dungeon.entranceRoomId) ?? dungeon.rooms[0];
  const exit = createDungeonExit(dungeon, hero.position);
  const dungeonObjects = createDungeonObjects(dungeon, [hero.position, exit.position], themeId);
  const monsters = createDungeonMonsters(dungeon, hero.position, heroForDifficulty ?? hero, exit.roomId, dungeonObjects, themeId);

  return {
    themeId,
    combatStarted: false,
    mode: "exploration",
    round: 0,
    activeIndex: 0,
    initiative: [],
    room: {
      id: dungeon.id,
      name: theme?.name ?? dungeonDefinition?.name ?? "Generated Dungeon",
      gridSize: dungeon.gridSize,
      tileSizePx,
    },
    dungeon,
    exploration: {
      discoveredRoomIds: [dungeon.entranceRoomId],
      openedDoorKeys: [],
      openedCorridorKeys: [],
    },
    exit,
    completed: false,
    shortRestsUsed: 0,
    shortRestLimit: theme?.rest?.shortRestLimit ?? 3,
    chest: [],
    chestMoney: { cp: 0, sp: 0, gp: 0 },
    lootPiles: [],
    dungeonObjects,
    party: {
      activeHeroId: "hero",
      heroIds: ["hero"],
    },
    fighters: {
      hero,
      ...monsters,
    },
    log: [
      {
        text: `Generated ${dungeon.roomCount} rooms for ${theme?.name ?? dungeonDefinition?.name ?? "Generated Dungeon"}. ${hero.name} starts at the entrance of ${firstRoom.name}.`,
        type: "important",
      },
    ],
  };
}

function createHomeState(hero, chest = [], chestMoney = { cp: 0, sp: 0, gp: 0 }) {
  const cells = Array.from({ length: 25 }, (_, index) => ({ x: index % 5, y: Math.floor(index / 5) }));
  const homeDoor = { x: 4, y: 2, roomId: "home-room", to: "outside" };
  const restedHero = refreshDerivedStats({
    ...hero,
    hp: hero.maxHp,
    hitDiceRemaining: hero.level ?? 1,
    position: { x: 2, y: 2 },
    movementLeft: Math.floor(hero.speedFeet / feetPerSquare),
    hasAction: true,
    hasBonusAction: true,
    alive: true,
  });
  resetFighterAbilityUses(restedHero);

  return {
    combatStarted: false,
    mode: "home",
    round: 0,
    activeIndex: 0,
    initiative: [],
    room: {
      id: "home",
      name: "Home",
      gridSize: 5,
      tileSizePx,
    },
    dungeon: {
      id: "home",
      roomCount: 1,
      gridSize: 5,
      rooms: [{ id: "home-room", name: "Home", cells, doors: [homeDoor] }],
      walkable: cells,
      corridors: [],
      doors: [homeDoor],
      corridorPassages: [],
      entranceRoomId: "home-room",
      startPosition: { x: 2, y: 2 },
    },
    exploration: {
      discoveredRoomIds: ["home-room"],
      openedDoorKeys: [],
      openedCorridorKeys: [],
    },
    exit: {
      roomId: "home-room",
      position: { ...homeDoor },
    },
    completed: false,
    shortRestsUsed: 0,
    shortRestLimit: 3,
    chest,
    chestMoney: normalizeMoney(chestMoney),
    lootPiles: [],
    dungeonObjects: [],
    party: {
      activeHeroId: "hero",
      heroIds: ["hero"],
    },
    fighters: {
      hero: restedHero,
    },
    log: [
      {
        text: `${restedHero.name} returns home and takes a long rest.`,
        type: "important",
      },
    ],
  };
}

function createDungeonExit(dungeon, heroPosition) {
  const entranceRoomId = dungeon.entranceRoomId;
  const exitRoom =
    dungeon.rooms
      .filter((room) => room.id !== entranceRoomId)
      .sort((a, b) => {
        const aDistance = Math.max(...a.cells.map((cell) => distance(cell, heroPosition)));
        const bDistance = Math.max(...b.cells.map((cell) => distance(cell, heroPosition)));
        return bDistance - aDistance;
      })[0] ?? dungeon.rooms[0];
  const position =
    exitRoom.cells
      .slice()
      .sort((a, b) => distance(b, heroPosition) - distance(a, heroPosition))[0] ?? exitRoom.cells[0];

  return {
    roomId: exitRoom.id,
    position: { ...position },
  };
}

function ensureCorridorPassages(dungeon) {
  if (Array.isArray(dungeon?.corridorPassages) && dungeon.corridorPassages.length > 0) return dungeon;

  const corridors = dungeon?.corridors ?? [];
  const corridorKeys = new Set(corridors.map(positionKey));
  const edges = [];
  for (const cell of corridors) {
    for (const next of [
      { x: cell.x + 1, y: cell.y },
      { x: cell.x, y: cell.y + 1 },
    ]) {
      if (corridorKeys.has(positionKey(next))) {
        edges.push(movementEdgeKey(cell, next));
      }
    }
  }

  return {
    ...dungeon,
    corridorPassages: [
      {
        id: "legacy-corridors",
        cells: corridors.map((cell) => ({ ...cell })),
        edges,
      },
    ],
  };
}

function tokenFromName(name, fallback = "M") {
  return (name.trim()[0] || fallback).toUpperCase();
}

function combatantRoleLabel(combatant) {
  if (combatant.id === "hero") return `Level ${combatant.level ?? 1} Fighter`;
  return combatant.role;
}

function fighterAbilityDefinitions(fighter = state?.fighters?.hero) {
  const source = fighter?.abilities ?? (fighter?.id === "hero" ? getHeroTemplate().abilities : []) ?? [];
  return source.map((ability) => ({
    ...ability,
    usesByLevel: Array.isArray(ability.usesByLevel) ? ability.usesByLevel.map((entry) => ({ ...entry })) : undefined,
  }));
}

function abilityMaxUses(fighter, ability) {
  const level = fighter.level ?? 1;
  let uses = ability.uses ?? 1;
  for (const entry of ability.usesByLevel ?? []) {
    if (level >= entry.level) uses = entry.uses;
  }
  return uses;
}

function resetFighterAbilityUses(fighter) {
  fighter.abilityUses = {};
  for (const ability of fighterAbilityDefinitions(fighter)) {
    if ((fighter.level ?? 1) >= (ability.level ?? 1)) {
      fighter.abilityUses[ability.id] = 0;
    }
  }
}

function ensureFighterAbilityState(fighter) {
  fighter.abilities = fighterAbilityDefinitions(fighter);
  fighter.abilityUses = { ...(fighter.abilityUses ?? {}) };
  for (const ability of fighter.abilities) {
    if ((fighter.level ?? 1) >= (ability.level ?? 1)) {
      fighter.abilityUses[ability.id] = Math.min(fighter.abilityUses[ability.id] ?? 0, abilityMaxUses(fighter, ability));
    }
  }
  return fighter;
}

function scoreToMod(score) {
  return Math.floor((score - 10) / 2);
}

function abilityModsFromScores(scores = {}) {
  return Object.fromEntries(abilities.map((ability) => [ability, scoreToMod(scores[ability] ?? 10)]));
}

function applyHeroCreationOptions(template, options = {}) {
  const settings = { ...template, ...options };
  if (!options.abilityScores) return settings;
  const abilityScores = { ...options.abilityScores };
  const abilityMods = abilityModsFromScores(abilityScores);
  const hitDie = template.hitDie ?? 10;
  return {
    ...settings,
    abilityScores,
    abilityMods,
    baseAttackAbilityMod: template.abilityMods?.str ?? 0,
    maxHp: hitDie + abilityMods.con,
  };
}

function getContentDefinition(type, id) {
  return window.DungeonContent?.get(type, id) ?? null;
}

function currentThemeId() {
  return state?.themeId ?? defaultContent.theme ?? "default";
}

function applyThemePalette() {
  const palette = getContentDefinition("themes", currentThemeId())?.palette ?? {};
  const root = document.documentElement;
  for (const [name, value] of Object.entries(palette)) {
    if (name === "bodyBackground") continue;
    const cssName = name
      .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
      .replace(/([a-z])([0-9])/g, "$1-$2");
    root.style.setProperty(`--${cssName}`, value);
  }
  if (palette.bodyBackground) {
    document.body.style.background = palette.bodyBackground;
  } else {
    document.body.style.background = "";
  }
}

function soundPathForMusic(key) {
  if (key === "home") return `${soundAssetRoot}/music/home.mp3`;
  const theme = getContentDefinition("themes", currentThemeId());
  if (key === "exploration" && theme?.music?.exploration) return theme.music.exploration;
  if (key === "combat" && theme?.music?.combat) return theme.music.combat;
  if (key === "boss-combat" && (theme?.music?.bossCombat || theme?.music?.boss)) return theme.music.bossCombat ?? theme.music.boss;
  return `${soundAssetRoot}/music/${currentThemeId()}-${key}.mp3`;
}

function playSoundEffect(id) {
  const src = soundEffects[id];
  const soundEffectPitchVariation = 0.05;
  if (!src) return;
  const audio = new Audio(src);
  audio.volume = 0.05;
  const randomPitch = 1 + (Math.random() * 2 - 1) * soundEffectPitchVariation;
  audio.playbackRate = randomPitch;
  audio.play().catch(() => {});
}

function desiredMusicKey() {
  if (!state || !gameHasStarted) return "";
  if (state.mode === "home") return "home";
  if (state.mode === "combat") {
    return combatMonsters().some((monster) => monster.id?.startsWith("boss-")) ? "boss-combat" : "combat";
  }
  return state.mode === "exploration" ? "exploration" : "";
}

function updateBackgroundMusic() {
  const key = desiredMusicKey();
  if (key === currentMusicKey) return;

  if (currentMusic) {
    currentMusic.pause();
    currentMusic = null;
  }
  currentMusicKey = key;
  if (!key) return;

  currentMusic = new Audio(soundPathForMusic(key));
  currentMusic.loop = true;
  currentMusic.volume = 0.05;
  currentMusic.play().catch(() => {});
}

function getHeroTemplate() {
  return getContentDefinition("classes", defaultContent.heroClass) ?? templates.hero;
}

function getMonsterTemplate(monsterId = defaultContent.monster) {
  return getContentDefinition("monsters", monsterId) ?? (monsterId === defaultContent.monster ? templates.monster : null);
}

function monsterMatchesTags(monster, requiredTags = []) {
  const monsterTags = new Set(monster?.tags ?? []);
  return requiredTags.every((tag) => monsterTags.has(tag));
}

function contentMatchesAnyTagGroup(entry, tagGroups = []) {
  return tagGroups.some((requiredTags) => monsterMatchesTags(entry, requiredTags));
}

function normalizeTagGroups(primaryGroups = [], legacyTags = []) {
  if (Array.isArray(primaryGroups) && primaryGroups.length) return primaryGroups;
  return Array.isArray(legacyTags) && legacyTags.length ? [legacyTags] : [];
}

function monsterIdsMatchingTagGroups(tagGroups = [], options = {}) {
  if (!tagGroups.length) return [];
  const { includeBosses = true } = options;
  return window.DungeonContent
    .list("monsters")
    .filter((monster) => contentMatchesAnyTagGroup(monster, tagGroups))
    .filter((monster) => includeBosses || !monster.tags?.includes("boss"))
    .map((monster) => monster.id);
}

function idsMatchingTagGroups(type, tagGroups = [], options = {}) {
  if (!tagGroups.length) return [];
  const { excludeKinds = [] } = options;
  return window.DungeonContent
    .list(type)
    .filter((entry) => contentMatchesAnyTagGroup(entry, tagGroups))
    .filter((entry) => !excludeKinds.includes(entry.kind))
    .map((entry) => entry.id);
}

function dungeonMonsterIds(themeId = currentThemeId()) {
  const theme = getContentDefinition("themes", themeId);
  const tagGroups = normalizeTagGroups(theme?.monsterTagGroups, theme?.monsterTags);
  const taggedMonsterIds = monsterIdsMatchingTagGroups(tagGroups, { includeBosses: false });
  if (taggedMonsterIds.length) return taggedMonsterIds;
  return theme?.monsterIds?.length ? theme.monsterIds : [defaultContent.monster];
}

function dungeonBossMonsterIds(themeId = currentThemeId()) {
  const theme = getContentDefinition("themes", themeId);
  const bossTagGroups = normalizeTagGroups(theme?.bossMonsterTagGroups, theme?.bossMonsterTags);
  const taggedBossMonsterIds = monsterIdsMatchingTagGroups(bossTagGroups);
  if (taggedBossMonsterIds.length) return taggedBossMonsterIds;
  return theme?.bossMonsterIds ?? [];
}

function categoryForHeroLevel(level = 1) {
  return Math.max(1, Math.ceil(Math.max(1, level) / 2));
}

function heroNeedsDungeonBoss(hero) {
  return (hero.level ?? 1) % 2 === 0;
}

function monsterCategory(monster) {
  return monster.category ?? monster.cat ?? 1;
}

const monsterCategoryRingColors = {
  1: "#3fae5a",
  2: "#6caf48",
  3: "#98ad3f",
  4: "#bfa13a",
  5: "#c98532",
  6: "#c7662e",
  7: "#bd4630",
  8: "#9f2f2f",
  9: "#762323",
  10: "#4a1414",
};

function monsterCategoryRingColor(monster) {
  const category = Math.max(1, Math.min(10, Number(monsterCategory(monster)) || 1));
  return monsterCategoryRingColors[category] ?? monsterCategoryRingColors[1];
}

function weightedMonsterIdsForHero(hero, themeId = currentThemeId()) {
  const targetCategory = categoryForHeroLevel(hero.level ?? 1);
  const entries = dungeonMonsterIds(themeId)
    .map((id) => ({ id, template: getMonsterTemplate(id) }))
    .filter((entry) => entry.template && monsterCategory(entry.template) <= targetCategory)
    .map((entry) => {
      const category = monsterCategory(entry.template);
      return {
        id: entry.id,
        weight: category === targetCategory ? 3 : 1,
      };
    });

  return entries.length ? entries : dungeonMonsterIds(themeId).map((id) => ({ id, weight: 1 }));
}

function pickWeightedMonsterId(entries, usedCounts = {}) {
  const adjustedEntries = entries.map((entry) => ({
    ...entry,
    weight: entry.weight / Math.max(1, (usedCounts[entry.id] ?? 0) + 1),
  }));
  const total = adjustedEntries.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * total;
  for (const entry of adjustedEntries) {
    roll -= entry.weight;
    if (roll <= 0) return entry.id;
  }
  return adjustedEntries.at(-1)?.id ?? defaultContent.monster;
}

function bossMonsterIdForHero(hero, themeId = currentThemeId()) {
  const targetCategory = categoryForHeroLevel(hero.level ?? 1);
  const bosses = dungeonBossMonsterIds(themeId)
    .map((id) => ({ id, template: getMonsterTemplate(id) }))
    .filter((entry) => entry.template && monsterCategory(entry.template) <= targetCategory)
    .sort((a, b) => monsterCategory(b.template) - monsterCategory(a.template));
  return bosses[0]?.id ?? null;
}

function applyMonsterCategoryScaling(monster, hero) {
  const targetCategory = categoryForHeroLevel(hero.level ?? 1);
  const categoryGap = Math.max(0, targetCategory - monsterCategory(monster));
  if (categoryGap <= 0) return monster;

  const hpMultiplier = 1 + categoryGap * 0.1;
  monster.maxHp = Math.max(1, Math.ceil(monster.maxHp * hpMultiplier));
  monster.hp = monster.maxHp;
  return monster;
}

function objectTemplate(type) {
  return getContentDefinition("furniture", type);
}

function objectIsTrap(object) {
  return objectTemplate(object?.type)?.kind === "trap";
}

function objectCells(object) {
  const template = objectTemplate(object.type);
  if (!template) return [];
  const width = object.width ?? template.width ?? 1;
  const height = object.height ?? template.height ?? 1;
  return Array.from({ length: width * height }, (_, index) => ({
    x: object.position.x + (index % width),
    y: object.position.y + Math.floor(index / width),
  }));
}

function objectAt(position) {
  const tileKey = positionKey(position);
  return (state.dungeonObjects ?? []).find((object) => objectCells(object).some((cell) => positionKey(cell) === tileKey)) ?? null;
}

function objectBlocksMovement(object) {
  return Boolean(objectTemplate(object.type)?.blocksMovement);
}

function blockingObjectKeys() {
  const keys = new Set();
  for (const object of state?.dungeonObjects ?? []) {
    if (!objectBlocksMovement(object)) continue;
    objectCells(object).forEach((cell) => keys.add(positionKey(cell)));
  }
  return keys;
}

function objectBlocksLineOfSight(object) {
  return Boolean(objectTemplate(object.type)?.blocksLineOfSight);
}

function lineOfSightBlockingObjectKeys() {
  const keys = new Set();

  for (const object of state?.dungeonObjects ?? []) {
    if (!objectBlocksLineOfSight(object)) continue;

    objectCells(object).forEach((cell) => {
      keys.add(positionKey(cell));
    });
  }

  return keys;
}

function objectOverlaps(object, blockedKeys) {
  return objectCells(object).some((cell) => blockedKeys.has(positionKey(cell)));
}

function objectTouchesBlockedCell(object, blockedKeys) {
  return objectCells(object).some((cell) =>
    [cell, ...adjacentCells(cell)].some((candidate) => blockedKeys.has(positionKey(candidate))),
  );
}

function dungeonFurnitureIds(themeId = currentThemeId()) {
  const theme = getContentDefinition("themes", themeId);
  const tagGroups = normalizeTagGroups(theme?.furnitureTagGroups, theme?.furnitureTags);
  const taggedFurnitureIds = idsMatchingTagGroups("furniture", tagGroups, { excludeKinds: ["trap"] });
  if (taggedFurnitureIds.length) return taggedFurnitureIds;
  if (theme?.furnitureIds?.length) return theme.furnitureIds;
  return ["table", "bigRock", "chest", "portal"];
}

function dungeonFloorTrapIds(themeId = currentThemeId()) {
  const theme = getContentDefinition("themes", themeId);
  const tagGroups = normalizeTagGroups(theme?.trapTagGroups, theme?.trapTags);
  if (Array.isArray(theme?.trapTagGroups) && theme.trapTagGroups.length === 0) return [];
  const taggedTrapIds = idsMatchingTagGroups("furniture", tagGroups).filter((id) => objectTemplate(id)?.kind === "trap");
  if (taggedTrapIds.length) return taggedTrapIds;
  return theme?.trapIds ?? ["trap"];
}

function objectSpawnChance(type, fallback, themeId = currentThemeId()) {
  const theme = getContentDefinition("themes", themeId);
  return theme?.furnitureSpawnChances?.[type] ?? objectTemplate(type)?.spawnChance ?? fallback;
}

function roomDoorKeys(room) {
  return new Set((room.doors ?? []).map(positionKey));
}

function tryCreateTableForRoom(room, blockedKeys, id) {
  const minX = Math.min(...room.cells.map((cell) => cell.x));
  const maxX = Math.max(...room.cells.map((cell) => cell.x));
  const minY = Math.min(...room.cells.map((cell) => cell.y));
  const maxY = Math.max(...room.cells.map((cell) => cell.y));
  const centerY = Math.floor((minY + maxY) / 2);
  const centerX = Math.floor((minX + maxX - 1) / 2);
  const object = { id, type: "table", position: { x: centerX, y: centerY }, width: 2, height: 1 };
  const cellKeys = new Set(room.cells.map(positionKey));
  const doorKeys = roomDoorKeys(room);
  if (objectCells(object).some((cell) => !cellKeys.has(positionKey(cell)) || doorKeys.has(positionKey(cell)))) return null;
  if (objectTouchesBlockedCell(object, blockedKeys)) return null;
  objectCells(object).forEach((cell) => blockedKeys.add(positionKey(cell)));
  return object;
}

function wallAdjacentRoomCells(room) {
  const roomKeys = new Set(room.cells.map(positionKey));
  const doorKeys = roomDoorKeys(room);
  return room.cells.filter((cell) => {
    if (doorKeys.has(positionKey(cell))) return false;
    return adjacentCells(cell).some((neighbor) => !roomKeys.has(positionKey(neighbor)));
  });
}

function randomOpenCell(cells, blockedKeys) {
  return cells
    .slice()
    .sort(() => Math.random() - 0.5)
    .find((cell) => ![cell, ...adjacentCells(cell)].some((candidate) => blockedKeys.has(positionKey(candidate)))) ?? null;
}

function randomTrapDifficulty(type = "trap") {
  const options = objectTemplate(type)?.spotDcs ?? [{ label: "Normal", dc: 12 }];
  return options[Math.floor(Math.random() * options.length)] ?? options[1];
}

function portalCandidateCells(dungeon, blockedKeys, objects) {
  const furnitureAdjacentKeys = new Set(
    objects
      .filter((object) => objectTemplate(object.type)?.kind === "furniture")
      .flatMap((object) => objectCells(object).flatMap((cell) => [cell, ...adjacentCells(cell)]))
      .map(positionKey),
  );
  const doorKeys = new Set((dungeon.doors ?? []).map(positionKey));
  return (dungeon.rooms ?? []).flatMap((room) =>
    room.cells
      .filter((cell) => !doorKeys.has(positionKey(cell)))
      .filter((cell) => !blockedKeys.has(positionKey(cell)))
      .filter((cell) => !furnitureAdjacentKeys.has(positionKey(cell)))
      .map((cell) => ({ ...cell, roomId: room.id })),
  );
}

function tryCreatePortalPair(dungeon, blockedKeys, objects, objectId, themeId = currentThemeId()) {
  if ((dungeon.rooms?.length ?? 0) < 2 || Math.random() >= objectSpawnChance("portal", 0.35, themeId)) return;

  const candidates = portalCandidateCells(dungeon, blockedKeys, objects).sort(() => Math.random() - 0.5);
  const first = candidates[0];
  if (!first) return;
  const second = candidates.find((candidate) => candidate.roomId !== first?.roomId && distance(candidate, first) >= 8);
  if (!second) return;

  const firstId = `portal-${objects.length + 1}`;
  const secondId = `portal-${objects.length + 2}`;
  objects.push(
    { id: firstId, type: "portal", position: { x: first.x, y: first.y }, pairId: secondId },
    { id: secondId, type: "portal", position: { x: second.x, y: second.y }, pairId: firstId },
  );
  blockedKeys.add(positionKey(first));
  blockedKeys.add(positionKey(second));
}

function chestLootPool() {
  return window.DungeonContent.list("items").filter(
    (item) => item.use?.kind === "healing" || item.type === "ammunition" || item.type === "weapon",
  );
}

function randomChestLoot(count = 2) {
  const pool = chestLootPool();
  return Array.from({ length: count }, () => {
    const template = pool[Math.floor(Math.random() * pool.length)];
    return template ? createItemInstance(template.id, "chest") : null;
  }).filter(Boolean);
}

function chestTrapPool(themeId = currentThemeId()) {
  const theme = getContentDefinition("themes", themeId);
  const tagGroups = normalizeTagGroups(theme?.trapTagGroups, theme?.trapTags);
  if (Array.isArray(theme?.trapTagGroups) && theme.trapTagGroups.length === 0) return [];
  const trapIds = idsMatchingTagGroups("traps", tagGroups);
  return window.DungeonContent
    .list("traps")
    .filter((trap) => trap.placement === "chest")
    .filter((trap) => !tagGroups.length || trapIds.includes(trap.id));
}

function randomChestTrap(themeId = currentThemeId()) {
  const pool = chestTrapPool(themeId);
  const template = pool[Math.floor(Math.random() * pool.length)];
  return template
    ? {
        id: template.id,
        name: template.name,
        spotDc: template.spotDc ?? 12,
        spotDifficulty: template.spotDifficulty ?? "Normal",
        damage: { ...(template.damage ?? { count: 1, sides: 4, type: "piercing" }) },
        description: template.description ?? "A hidden chest trap.",
      }
    : null;
}

function createDungeonObjects(dungeon, reservedPositions = [], themeId = currentThemeId()) {
  const objects = [];
  const theme = getContentDefinition("themes", themeId);
  const trapSettings = theme?.traps ?? {};
  const allowedFurniture = new Set(dungeonFurnitureIds(themeId));
  const floorTrapIds = dungeonFloorTrapIds(themeId);
  const blockedKeys = new Set((dungeon.doors ?? []).map(positionKey));
  reservedPositions.forEach((position) => blockedKeys.add(positionKey(position)));
  const objectId = (type) => `${type}-${objects.length + 1}`;

  for (const room of dungeon.rooms ?? []) {
    if (allowedFurniture.has("table") && Math.random() < objectSpawnChance("table", 0.5, themeId)) {
      const table = tryCreateTableForRoom(room, blockedKeys, objectId("table"));
      if (table) objects.push(table);
    }
    if (allowedFurniture.has("bigRock") && Math.random() < objectSpawnChance("bigRock", 0.18, themeId)) {
      const position = randomOpenCell(
        room.cells.filter((cell) => !roomDoorKeys(room).has(positionKey(cell))),
        blockedKeys,
      );

      if (position) {
        objects.push({
          id: objectId("bigRock"),
          type: "bigRock",
          position: { ...position },
        });

        blockedKeys.add(positionKey(position));
      }
    }

    if (allowedFurniture.has("chest") && Math.random() < objectSpawnChance("chest", 0.2, themeId)) {
      const position = randomOpenCell(wallAdjacentRoomCells(room), blockedKeys);
      if (position) {
        const chest = {
          id: objectId("chest"),
          type: "chest",
          position: { ...position },
          items: randomChestLoot(Math.floor(Math.random() * 3)),
        };
        if (Math.random() < (trapSettings.chestChance ?? 0.3)) chest.trap = randomChestTrap(themeId);
        objects.push(chest);
        blockedKeys.add(positionKey(position));
      }
    }

    if (floorTrapIds.length && Math.random() < (trapSettings.roomChance ?? 0.28)) {
      const position = randomOpenCell(room.cells.filter((cell) => !roomDoorKeys(room).has(positionKey(cell))), blockedKeys);
      if (position) {
        const type = floorTrapIds[Math.floor(Math.random() * floorTrapIds.length)];
        const difficulty = randomTrapDifficulty(type);
        objects.push({ id: objectId(type), type, position: { ...position }, armed: true, spotDc: difficulty.dc, spotDifficulty: difficulty.label });
      }
    }
  }

  for (const corridor of dungeon.corridors ?? []) {
    if (floorTrapIds.length && Math.random() < (trapSettings.corridorChance ?? 0.035) && !blockedKeys.has(positionKey(corridor))) {
      const type = floorTrapIds[Math.floor(Math.random() * floorTrapIds.length)];
      const difficulty = randomTrapDifficulty(type);
      objects.push({ id: objectId(type), type, position: { ...corridor }, armed: true, spotDc: difficulty.dc, spotDifficulty: difficulty.label });
    }
  }

  if (allowedFurniture.has("portal")) {
    tryCreatePortalPair(dungeon, blockedKeys, objects, objectId, themeId);
  }

  return objects;
}

function getItemTemplate(itemId) {
  return getContentDefinition("items", itemId);
}

function defaultEquipment() {
  return Object.fromEntries(equipmentSlots.map((slot) => [slot.id, null]));
}

function normalizeItem(item) {
  const templateId = item?.baseItemId ?? item?.itemId;
  const aliasedId = typeof item === "string" ? itemAliases[item] ?? item : itemAliases[templateId] ?? templateId;
  if (typeof item === "string") return getItemTemplate(aliasedId) ?? { id: aliasedId, name: aliasedId, type: "item", slots: [] };
  if (templateId) {
    const template = getItemTemplate(aliasedId) ?? {};
    let finalId = item.id ?? aliasedId;
    // Generate unique ID for items without one (to prevent ID collisions when multiple items share the same template)
    if (!item.id && item !== template) {
      adminItemInstanceCounter += 1;
      finalId = `item-${aliasedId}-${Date.now()}-${adminItemInstanceCounter}`;
    }
    return { ...template, ...item, id: finalId, baseItemId: aliasedId };
  }
  return { ...item };
}

function normalizeEquipment(equipment = {}) {
  const normalized = { ...defaultEquipment(), ...equipment };
  for (const slot of equipmentSlots) {
    normalized[slot.id] = itemAliases[normalized[slot.id]] ?? normalized[slot.id];
  }
  return normalized;
}

function defaultHeroItems() {
  return (getHeroTemplate().inventory?.items ?? []).map(normalizeItem);
}

function normalizeInventory(template = {}) {
  const sourceMoney = template.money ?? {};
  const money = normalizeMoney({
    cp: sourceMoney.cp ?? 0,
    sp: (sourceMoney.sp ?? 0) + (sourceMoney.ep ?? 0) * 5,
    gp: (sourceMoney.gp ?? 0) + (sourceMoney.pp ?? 0) * 10,
  });
  const heroTokens = Math.max(0, Math.floor(template.heroTokens ?? 0));
  const items = Array.isArray(template.items) ? template.items.map(normalizeItem) : [];
  
  // Ensure duplicate items have unique IDs
  const idCounts = {};
  for (const item of items) {
    idCounts[item.id] = (idCounts[item.id] ?? 0) + 1;
  }
  const duplicateIds = Object.keys(idCounts).filter(id => idCounts[id] > 1);
  
  if (duplicateIds.length > 0) {
    let duplicateIndex = 0;
    for (let i = 0; i < items.length; i++) {
      if (duplicateIds.includes(items[i].id)) {
        if (duplicateIndex > 0) {
          adminItemInstanceCounter += 1;
          items[i].id = `item-${items[i].baseItemId ?? items[i].id}-${Date.now()}-${adminItemInstanceCounter}`;
        }
        duplicateIndex += 1;
      }
    }
  }
  
  return { money, heroTokens, items };
}

function moneyToCp(money = {}) {
  return (money.cp ?? 0) + (money.sp ?? 0) * 10 + (money.gp ?? 0) * 100 + (money.pp ?? 0) * 1000;
}

function cpToMoney(totalCp) {
  let remaining = Math.max(0, Math.floor(totalCp));
  const gp = Math.floor(remaining / 100);
  remaining -= gp * 100;
  const sp = Math.floor(remaining / 10);
  remaining -= sp * 10;
  return { gp, sp, cp: remaining };
}

function normalizeMoney(money = {}) {
  return cpToMoney(moneyToCp(money));
}

function addMoney(money, cpAmount) {
  const normalized = cpToMoney(moneyToCp(money) + cpAmount);
  money.gp = normalized.gp;
  money.sp = normalized.sp;
  money.cp = normalized.cp;
  delete money.ep;
  delete money.pp;
}

function ammoStackLimit(item) {
  return item?.type === "ammunition" ? 20 : Infinity;
}

function updateAmmoStackName(item) {
  if (!item?.ammo) return item;
  const kind = item.ammo.kind ?? "ammo";
  const label = kind === "bolt" ? "Crossbow Bolts" : `${kind[0]?.toUpperCase() ?? "A"}${kind.slice(1)}s`;
  item.name = `${label} (${item.ammo.quantity ?? 0})`;
  return item;
}

function addItemToInventory(fighter, item, prefix = "stack") {
  if (!fighter || !item) return [];
  if (item.type !== "ammunition" || !item.ammo?.kind) {
    fighter.inventory.items.push(item);
    return [item];
  }

  const added = [];
  let remaining = Math.max(0, item.ammo.quantity ?? 0);
  const limit = ammoStackLimit(item);
  for (const stack of fighter.inventory.items) {
    if (remaining <= 0) break;
    if (stack.type !== "ammunition" || stack.ammo?.kind !== item.ammo.kind) continue;
    const room = Math.max(0, limit - (stack.ammo.quantity ?? 0));
    if (room <= 0) continue;
    const moved = Math.min(room, remaining);
    stack.ammo.quantity = (stack.ammo.quantity ?? 0) + moved;
    updateAmmoStackName(stack);
    remaining -= moved;
  }

  while (remaining > 0) {
    const quantity = Math.min(limit, remaining);
    const stack =
      remaining === (item.ammo.quantity ?? 0)
        ? item
        : createItemInstance(item.baseItemId ?? item.itemId ?? item.id, prefix);
    if (!stack) break;
    stack.ammo = { ...(stack.ammo ?? {}), kind: item.ammo.kind, quantity };
    updateAmmoStackName(stack);
    fighter.inventory.items.push(stack);
    added.push(stack);
    remaining -= quantity;
  }

  return added;
}

function spendMoney(money, cpAmount) {
  if (moneyToCp(money) < cpAmount) return false;
  addMoney(money, -cpAmount);
  return true;
}

function createItemInstance(templateId, prefix = "item") {
  const template = getItemTemplate(templateId);
  if (!template) return null;

  adminItemInstanceCounter += 1;
  return normalizeItem({
    ...template,
    id: `${prefix}-${templateId}-${Date.now()}-${adminItemInstanceCounter}`,
    baseItemId: templateId,
  });
}

function ensureStarterHeroEquipment(fighter) {
  if (fighter.id !== "hero") return;

  if ((fighter.inventory.items ?? []).length === 0) {
    const starterItems = defaultHeroItems();
    const itemIds = new Set(fighter.inventory.items.map((item) => item.id));
    for (const item of starterItems) {
      if (!itemIds.has(item.id)) fighter.inventory.items.push(item);
    }
  }

  const templateEquipment = getHeroTemplate().equipment ?? {};
  for (const slot of equipmentSlots) {
    if (fighter.equipment[slot.id] === undefined) {
      fighter.equipment[slot.id] = templateEquipment[slot.id] ?? null;
    }
  }
}

function itemForId(fighter, itemId) {
  if (!itemId) return null;
  return fighter.inventory.items.find((item) => item.id === itemId) ?? null;
}

function chestItemForId(itemId) {
  return (state.chest ?? []).find((item) => item.id === itemId) ?? null;
}

function itemCanUseSlot(item, slotId) {
  return Array.isArray(item?.slots) && item.slots.includes(slotId);
}

function itemCanEquipInSlot(fighter, item, slotId) {
  return itemCanUseSlot(item, slotId) && (slotId !== "torso" || armorStrengthRequirementMet(fighter, item));
}

function isHandSlot(slotId) {
  return ["mainHand", "offHand"].includes(slotId);
}

function isBeltSlot(slotId) {
  return slotId.startsWith("belt");
}

function equippedItem(fighter, slotId) {
  return itemForId(fighter, fighter.equipment?.[slotId]);
}

function abilityMod(fighter, ability) {
  if (fighter.abilityScores?.[ability] || fighter.abilityScores?.[ability] === 0) {
    return scoreToMod(fighter.abilityScores[ability]);
  }
  return fighter.abilityMods?.[ability] ?? (ability === "dex" ? fighter.initiativeBonus ?? 0 : 0);
}

function abilityScore(fighter, ability) {
  return fighter.abilityScores?.[ability] ?? 10 + abilityMod(fighter, ability) * 2;
}

function xpForNextLevel(level) {
  const thresholds = {
    1: 300,
    2: 900,
    3: 2700,
    4: 6500,
    5: 14000,
    6: 23000,
    7: 34000,
    8: 48000,
    9: 64000,
    10: 85000,
    11: 100000,
    12: 120000,
    13: 140000,
    14: 165000,
    15: 195000,
    16: 225000,
    17: 265000,
    18: 305000,
    19: 355000,
  };
  return thresholds[level] ?? Infinity;
}

function canLevelUp(hero = state.fighters.hero) {
  return (hero.xp ?? 0) >= xpForNextLevel(hero.level ?? 1);
}

function attackAbilityForWeapon(weapon) {
  if (!weapon) return "str";
  if (weapon.weaponRange === "ranged" || weapon.range?.kind === "ranged") return "dex";
  return "str";
}

function weaponIsRanged(weapon) {
  return weapon?.weaponRange === "ranged" || weapon?.range?.kind === "ranged";
}

function attackBonus(fighter) {
  const baseBonus = fighter.attackBonus ?? 0;
  const baseAbility = fighter.baseAttackAbilityMod ?? abilityMod(fighter, "str");
  return baseBonus - baseAbility + abilityMod(fighter, attackAbilityForWeapon(activeWeapon(fighter)));
}

function formatDamage(damage) {
  if (damage.flat) {
    const bonusText = damage.bonus === 0 ? "" : ` ${abilityLabel(damage.bonus)}`;
    return `${damage.flat}${bonusText}${damage.type ? ` ${damage.type}` : ""}`;
  }

  const bonus = damage.bonus ?? 0;
  const bonusText = bonus === 0 ? "" : ` ${abilityLabel(bonus)}`;
  return `${damage.count}d${damage.sides}${bonusText}${damage.type ? ` ${damage.type}` : ""}`;
}

function damageFlagMatches(flags, type) {
  if (!type) return false;
  const normalizedType = String(type).toLowerCase();
  const entries = Array.isArray(flags) ? flags : flags ? [flags] : [];
  return entries.some((flag) => String(flag).toLowerCase() === normalizedType);
}

function calculateDamageModifiers(target, damage, type) {
  const normalizedType = String(type ?? "").toLowerCase();
  if (!normalizedType) return { damage, reason: null };

  if (damageFlagMatches(target.damageImmunities, normalizedType)) {
    return { damage: 0, reason: "immune" };
  }

  if (damageFlagMatches(target.damageVulnerabilities, normalizedType)) {
    return { damage: damage * 2, reason: "vulnerable" };
  }

  if (damageFlagMatches(target.damageResistances, normalizedType)) {
    return { damage: Math.floor(damage / 2), reason: "resistant" };
  }

  return { damage, reason: null };
}

function activeWeapon(fighter) {
  return equippedItem(fighter, "mainHand") ?? equippedItem(fighter, "offHand");
}

function activeMeleeWeapon(fighter) {
  const weapons = [equippedItem(fighter, "mainHand"), equippedItem(fighter, "offHand")].filter(Boolean);
  return weapons.find((weapon) => weapon.damage && !weaponIsRanged(weapon) && weapon.range?.kind !== "ranged") ?? null;
}

function unarmedDamageProfile(fighter) {
  const damage = {
    flat: 1,
    count: 0,
    sides: 0,
    bonus: abilityMod(fighter, "str"),
    type: "bludgeoning",
    range: { kind: "melee", feet: 5 },
  };
  return { ...damage, label: formatDamage(damage), attackAbility: "str", weaponName: "Unarmed Strike" };
}

function damageProfile(fighter) {
  const weapon = activeWeapon(fighter);
  if (!weapon?.damage) {
    if (fighter.baseDamage?.count || fighter.baseDamage?.flat) {
      const damage = {
        flat: fighter.baseDamage.flat,
        count: fighter.baseDamage.count ?? 0,
        sides: fighter.baseDamage.sides ?? 0,
        bonus: fighter.baseDamage.bonus ?? 0,
        type: fighter.baseDamage.type,
        range: fighter.baseDamage.range ?? { kind: "melee", feet: 5 },
      };
      return { ...damage, label: formatDamage(damage) };
    }

    const damage = {
      flat: 1,
      count: 0,
      sides: 0,
      bonus: abilityMod(fighter, "str"),
      type: "bludgeoning",
      range: { kind: "melee", feet: 5 },
    };
    return { ...damage, label: formatDamage(damage) };
  }

  const bonusAbility = attackAbilityForWeapon(weapon);
  const bonus = abilityMod(fighter, bonusAbility);
  const oneHandingVersatile = weapon.properties?.includes("versatile") && !equippedItem(fighter, "offHand");
  const damageDice = oneHandingVersatile ? weapon.propertyData?.versatile ?? weapon.damage : weapon.damage;
  const damage = {
    flat: damageDice.flat,
    count: damageDice.count ?? 0,
    sides: damageDice.sides ?? 0,
    bonus,
    type: weapon.damage.type,
    range: weapon.range ?? { kind: "melee", feet: 5 },
  };
  return { ...damage, label: formatDamage(damage) };
}

function opportunityAttackProfile(fighter) {
  const weapon = activeMeleeWeapon(fighter);
  if (weapon) {
    return {
      ...damageProfile({ ...fighter, equipment: { ...fighter.equipment, mainHand: weapon.id, offHand: fighter.equipment?.offHand } }),
      attackAbility: attackAbilityForWeapon(weapon),
      weaponName: weapon.name,
    };
  }

  const baseRange = fighter.baseDamage?.range ?? { kind: "melee", feet: 5 };
  if (!activeWeapon(fighter) && baseRange.kind !== "ranged" && (fighter.baseDamage?.count || fighter.baseDamage?.flat)) {
    const damage = {
      flat: fighter.baseDamage.flat,
      count: fighter.baseDamage.count ?? 0,
      sides: fighter.baseDamage.sides ?? 0,
      bonus: fighter.baseDamage.bonus ?? 0,
      type: fighter.baseDamage.type,
      range: baseRange,
    };
    return { ...damage, label: formatDamage(damage), attackAbility: "str", weaponName: "Melee Attack" };
  }

  return unarmedDamageProfile(fighter);
}

function armorClass(fighter) {
  const torso = equippedItem(fighter, "torso");
  const armor = armorStrengthRequirementMet(fighter, torso) ? torso?.armor : null;
  const shield = equippedItem(fighter, "offHand");
  const shieldBonus = shield?.armor?.bonus ?? 0;
  if (!armor?.base) return (fighter.baseAc ?? 10) + abilityMod(fighter, "dex") + shieldBonus;

  const dex = abilityMod(fighter, "dex");
  const dexBonus = armor.dex === "full" ? dex : armor.dex === "max2" ? Math.min(2, dex) : 0;
  return armor.base + dexBonus + shieldBonus;
}

function itemRequiresTwoHands(item) {
  return item?.properties?.includes("two-handed");
}

function armorStrengthRequirementMet(fighter, item) {
  return !item?.requirements?.strength || abilityScore(fighter, "str") >= item.requirements.strength;
}

function itemHasUsableAmmo(fighter, item) {
  if (!item?.properties?.includes("ammunition")) return true;
  const ammo = equippedItem(fighter, "quiver");
  return Boolean(ammo?.ammo?.quantity > 0 && (!ammo.ammo.kind || !item.ammoKind || ammo.ammo.kind === item.ammoKind));
}

function spendAmmunition(fighter, item) {
  if (!item?.properties?.includes("ammunition")) return true;
  const ammo = equippedItem(fighter, "quiver");
  if (!ammo?.ammo?.quantity || (ammo.ammo.kind && item.ammoKind && ammo.ammo.kind !== item.ammoKind)) return false;

  ammo.ammo.quantity = Math.max(0, ammo.ammo.quantity - 1);
  updateAmmoStackName(ammo);
  return true;
}

function hostileFightersAdjacentTo(fighter) {
  return Object.values(state.fighters).filter((candidate) => {
    if (!candidate.alive || candidate.id === fighter.id) return false;
    if (fighter.id === "hero") return candidate.id !== "hero" && isAdjacent(fighter, candidate);
    return candidate.id === "hero" && isAdjacent(fighter, candidate);
  });
}

function refreshDerivedStats(fighter) {
  if (fighter.abilityScores) {
    fighter.abilityMods = abilityModsFromScores(fighter.abilityScores);
  }
  fighter.ac = armorClass(fighter);
  fighter.damage = damageProfile(fighter);
  fighter.currentAttackBonus = attackBonus(fighter);
  return fighter;
}

function createCombatant(template) {
  const combatant = {
    ...template,
    baseAc: template.baseAc ?? template.ac ?? 10,
    baseDamage: { ...template.damage },
    abilityScores: template.abilityScores ? { ...template.abilityScores } : undefined,
    abilityMods: { ...(template.abilityMods ?? {}) },
    baseAttackAbilityMod: template.baseAttackAbilityMod,
    level: template.level ?? 1,
    xp: template.xp ?? 0,
    hitDie: template.hitDie ?? 10,
    hitDiceRemaining: template.hitDiceRemaining ?? template.level ?? 1,
    damage: { ...template.damage },
    equipment: normalizeEquipment(template.equipment),
    inventory: normalizeInventory(template.inventory),
    abilities: fighterAbilityDefinitions(template),
    abilityUses: { ...(template.abilityUses ?? {}) },
    position: { ...template.position },
    hp: template.maxHp,
    alive: true,
    movementLeft: Math.floor(template.speedFeet / feetPerSquare),
    hasAction: true,
    hasBonusAction: true,
    dodging: false,
    disengaged: false,
  };
  if (combatant.baseAttackAbilityMod === undefined) {
    combatant.baseAttackAbilityMod = abilityMod(combatant, attackAbilityForWeapon(activeWeapon(combatant)));
  }
  ensureStarterHeroEquipment(combatant);
  ensureFighterAbilityState(combatant);
  return refreshDerivedStats(combatant);
}

function createDungeonMonsters(dungeon, heroPosition, hero, exitRoomId = "", dungeonObjects = [], themeId = currentThemeId()) {
  const monsters = {};
  const rooms = dungeon.rooms;
  const bossMonsterId = heroNeedsDungeonBoss(hero) ? bossMonsterIdForHero(hero, themeId) : null;
  const bossRoomId = bossMonsterId ? exitRoomId || createDungeonExit(dungeon, heroPosition).roomId : null;
  const monsterRooms = rooms.filter((room, index) => room.id !== bossRoomId && (index === 0 || (index > 0 && Math.random() < 0.72)));
  const monsterEntries = weightedMonsterIdsForHero(hero, themeId);
  const targetCategory = categoryForHeroLevel(hero.level ?? 1);
  const targetCategoryEntries = monsterEntries.filter((entry) => {
    const template = getMonsterTemplate(entry.id);
    return template && monsterCategory(template) === targetCategory;
  });
  const usedMonsterCounts = {};
  let spawnedTargetCategory = targetCategory <= 1;
  const objectBlockedKeys = new Set(
    dungeonObjects
      .filter(objectBlocksMovement)
      .flatMap(objectCells)
      .map(positionKey),
  );

  for (const [index, room] of monsterRooms.entries()) {
    const mustSpawnTargetCategory = !spawnedTargetCategory && targetCategoryEntries.length > 0;
    const monsterId = pickWeightedMonsterId(mustSpawnTargetCategory ? targetCategoryEntries : monsterEntries, usedMonsterCounts);
    const monsterTemplate = getMonsterTemplate(monsterId);
    if (!monsterTemplate) continue;
    usedMonsterCounts[monsterId] = (usedMonsterCounts[monsterId] ?? 0) + 1;
    spawnedTargetCategory ||= monsterCategory(monsterTemplate) === targetCategory;
    const monster = createCombatant({
      ...monsterTemplate,
      id: `monster-${room.id}`,
      name: index === 0 ? monsterTemplate.name : `${monsterTemplate.name} ${index + 1}`,
    });
    applyMonsterCategoryScaling(monster, hero);
    monster.roomId = room.id;
    monster.position =
      room.cells
        .slice()
        .filter((cell) => !objectBlockedKeys.has(positionKey(cell)))
        .sort((a, b) => distance(b, heroPosition) - distance(a, heroPosition))[0] ?? room.cells[room.cells.length - 1];
    monsters[monster.id] = monster;
  }

  if (bossMonsterId && bossRoomId) {
    const bossTemplate = getMonsterTemplate(bossMonsterId);
    const bossRoom = rooms.find((room) => room.id === bossRoomId);
    if (bossTemplate && bossRoom) {
      const boss = createCombatant({
        ...bossTemplate,
        id: `boss-${bossRoom.id}`,
        name: bossTemplate.name,
      });
      applyMonsterCategoryScaling(boss, hero);
      boss.roomId = bossRoom.id;
      boss.position =
        bossRoom.cells
          .slice()
          .filter((cell) => !objectBlockedKeys.has(positionKey(cell)))
          .sort((a, b) => distance(b, heroPosition) - distance(a, heroPosition))[0] ?? bossRoom.cells[bossRoom.cells.length - 1];
      monsters[boss.id] = boss;
    }
  }

  return monsters;
}

function aliveFighters() {
  return Object.values(state.fighters).filter((fighter) => fighter.alive);
}

function aliveMonsters() {
  return Object.values(state.fighters).filter((fighter) => fighter.id !== "hero" && fighter.alive);
}

function activeFighter() {
  const entry = state.initiative[state.activeIndex];
  return entry ? state.fighters[entry.fighterId] : null;
}

function normalizeLoadedState(loadedState) {
  const freshState = createInitialState();
  const normalized = {
    ...freshState,
    ...loadedState,
    themeId: loadedState.themeId ?? freshState.themeId ?? defaultContent.theme,
    mode: loadedState.mode ?? (loadedState.combatStarted ? "combat" : "exploration"),
    fighters: {
      ...freshState.fighters,
      ...loadedState.fighters,
    },
    dungeon: ensureCorridorPassages(loadedState.dungeon ?? freshState.dungeon),
    party: {
      activeHeroId: loadedState.party?.activeHeroId ?? "hero",
      heroIds: Array.isArray(loadedState.party?.heroIds) && loadedState.party.heroIds.length ? loadedState.party.heroIds : ["hero"],
    },
    exploration: {
      ...freshState.exploration,
      ...loadedState.exploration,
    },
    exit: loadedState.exit ?? freshState.exit,
    completed: Boolean(loadedState.completed),
    shortRestsUsed: loadedState.shortRestsUsed ?? (loadedState.shortRestUsed ? 1 : 0),
    shortRestLimit: loadedState.shortRestLimit ?? 3,
    chest: Array.isArray(loadedState.chest) ? loadedState.chest.map(normalizeItem) : [],
    chestMoney: normalizeMoney(loadedState.chestMoney ?? {}),
    lootPiles: Array.isArray(loadedState.lootPiles) ? loadedState.lootPiles : [],
    dungeonObjects: Array.isArray(loadedState.dungeonObjects) ? loadedState.dungeonObjects : [],
    log: Array.isArray(loadedState.log) ? loadedState.log : [],
    initiative: Array.isArray(loadedState.initiative) ? loadedState.initiative : [],
  };

  normalized.initiative = normalized.initiative
    .map((entry) => ({
      fighterId: entry.fighterId ?? entry.fighter?.id,
      roll: entry.roll,
      total: entry.total,
    }))
    .filter((entry) => entry.fighterId && normalized.fighters[entry.fighterId]);

  if (normalized.activeIndex >= normalized.initiative.length) {
    normalized.activeIndex = 0;
  }

  if (normalized.fighters.hero) {
    normalized.fighters.hero.id = "hero";
    normalized.fighters.hero.token = tokenFromName(normalized.fighters.hero.name, normalized.fighters.hero.token);
  }
  Object.values(normalized.fighters).forEach((fighter) => {
    fighter.baseAc = fighter.baseAc ?? fighter.ac ?? 10;
    fighter.baseDamage = { ...(fighter.baseDamage ?? fighter.damage ?? { count: 1, sides: 4, bonus: 0 }) };
    fighter.abilityScores = fighter.abilityScores ? { ...fighter.abilityScores } : fighter.abilityScores;
    fighter.abilityMods = { ...(fighter.abilityMods ?? {}) };
    fighter.baseAttackAbilityMod = fighter.baseAttackAbilityMod ?? abilityMod(fighter, attackAbilityForWeapon(activeWeapon(fighter)));
    fighter.level = fighter.level ?? 1;
    fighter.xp = fighter.xp ?? 0;
    fighter.hitDie = fighter.hitDie ?? 10;
    fighter.hitDiceRemaining = fighter.hitDiceRemaining ?? fighter.level ?? 1;
    fighter.equipment = normalizeEquipment(fighter.equipment);
    fighter.inventory = normalizeInventory(fighter.inventory);
    ensureFighterAbilityState(fighter);
    fighter.hasBonusAction = fighter.hasBonusAction ?? true;
    fighter.dodging = fighter.dodging ?? false;
    fighter.disengaged = fighter.disengaged ?? false;
    ensureStarterHeroEquipment(fighter);
    refreshDerivedStats(fighter);
  });

  return normalized;
}

function updateSaveStatus(message = "") {
  renderSaveSlots();
  if (message) {
    els.saveStatus.textContent = message;
  } else {
    const savedCount = getSlots().filter((slot) => slot.hasSave).length;
    els.saveStatus.textContent = savedCount > 0 ? `${savedCount} save slot${savedCount === 1 ? "" : "s"} available.` : "No saved adventure found.";
  }
}

function selectSaveSlot(slotId) {
  if (!Number.isInteger(slotId) || slotId < 1 || slotId > slotCount) return;
  if (activeSaveSlot === slotId) return;
  activeSaveSlot = slotId;
  renderSaveSlots();
  const input = els.saveSlots.querySelector(`#save-slot-name-${slotId}`);
  input?.focus();
  input?.setSelectionRange(input.value.length, input.value.length);
}

function escapeAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderSaveSlots() {
  els.saveSlots.innerHTML = getSlots()
    .map((slot) => {
      const savedAt = slot.savedAt ? new Date(slot.savedAt).toLocaleString() : "Empty";
      const activeClass = slot.id === activeSaveSlot ? " active" : "";
      return `
        <div class="save-slot${activeClass}" data-slot="${slot.id}">
          <div class="save-slot-main">
            <label for="save-slot-name-${slot.id}">Slot ${slot.id}</label>
            <input id="save-slot-name-${slot.id}" type="text" value="${escapeAttribute(slot.name)}" maxlength="32" />
            <span>${savedAt}</span>
          </div>
          <div class="save-slot-actions">
            <button type="button" data-action="save-slot" data-slot="${slot.id}">Save</button>
            <button type="button" data-action="load-slot" data-slot="${slot.id}" ${slot.hasSave ? "" : "disabled"}>Load</button>
            <button class="delete-save" type="button" data-action="delete-slot" data-slot="${slot.id}" ${slot.hasSave ? "" : "disabled"}>Delete</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function showMainMenu(message = "") {
  gameHasStarted = false;
  window.clearTimeout(monsterTurnTimer);
  els.mainMenu.classList.remove("hidden");
  updateSaveStatus(message);
  renderControls();
}

function hideMainMenu() {
  gameHasStarted = true;
  els.mainMenu.classList.add("hidden");
  renderControls();
}

function showGameDialog({ title, message = "", input = null, confirmText = "OK", cancelText = "Cancel" }) {
  return new Promise((resolve) => {
    els.gameDialogTitle.textContent = title;
    els.gameDialogMessage.textContent = message;
    els.gameDialogField.classList.toggle("hidden", !input);
    els.gameDialogActions.innerHTML = `
      <button type="submit" data-dialog-action="confirm">${escapeHtml(confirmText)}</button>
      <button type="button" class="ghost-button" data-dialog-action="cancel">${escapeHtml(cancelText)}</button>
    `;

    if (input) {
      els.gameDialogLabel.textContent = input.label;
      els.gameDialogInput.value = input.value ?? "";
      els.gameDialogInput.maxLength = input.maxLength ?? 32;
    }

    const cleanup = (value) => {
      els.gameDialogForm.removeEventListener("submit", handleSubmit);
      els.gameDialogActions.removeEventListener("click", handleActionClick);
      els.gameDialog.classList.add("hidden");
      activeDialogCancel = null;
      resolve(value);
    };

    const handleSubmit = (event) => {
      event.preventDefault();
      cleanup(input ? els.gameDialogInput.value.trim() : true);
    };

    const handleActionClick = (event) => {
      const button = event.target.closest("[data-dialog-action]");
      if (!button || button.dataset.dialogAction !== "cancel") return;
      cleanup(input ? null : false);
    };

    els.gameDialogForm.addEventListener("submit", handleSubmit);
    els.gameDialogActions.addEventListener("click", handleActionClick);
    activeDialogCancel = () => cleanup(input ? null : false);
    els.gameDialog.classList.remove("hidden");
    if (input) {
      els.gameDialogInput.focus();
      els.gameDialogInput.select();
    } else {
      els.gameDialogActions.querySelector("[data-dialog-action='confirm']")?.focus();
    }
  });
}

function showTwoChoiceDialog({ title, message, primaryText, secondaryText }) {
  return new Promise((resolve) => {
    els.gameDialogTitle.textContent = title;
    els.gameDialogMessage.textContent = message;
    els.gameDialogField.classList.add("hidden");
    els.gameDialogActions.innerHTML = `
      <button type="button" data-choice="primary">${escapeHtml(primaryText)}</button>
      <button type="button" class="ghost-button" data-choice="secondary">${escapeHtml(secondaryText)}</button>
    `;

    const cleanup = (value) => {
      els.gameDialogActions.removeEventListener("click", handleClick);
      els.gameDialog.classList.add("hidden");
      activeDialogCancel = null;
      resolve(value);
    };

    const handleClick = (event) => {
      const button = event.target.closest("[data-choice]");
      if (!button) return;
      cleanup(button.dataset.choice);
    };

    els.gameDialogActions.addEventListener("click", handleClick);
    activeDialogCancel = () => cleanup("primary");
    els.gameDialog.classList.remove("hidden");
    els.gameDialogActions.querySelector("[data-choice='primary']")?.focus();
  });
}

function showChoiceDialog({ title, message, choices }) {
  return new Promise((resolve) => {
    els.gameDialogTitle.textContent = title;
    els.gameDialogMessage.textContent = message;
    els.gameDialogField.classList.add("hidden");
    els.gameDialogActions.innerHTML = choices
      .map(
        (choice, index) =>
          `<button type="button" class="${index === 0 ? "" : "ghost-button"}" data-choice="${escapeAttribute(choice.value)}">${escapeHtml(choice.label)}</button>`,
      )
      .join("");

    const cleanup = (value) => {
      els.gameDialogActions.removeEventListener("click", handleClick);
      els.gameDialog.classList.add("hidden");
      activeDialogCancel = null;
      resolve(value);
    };

    const handleClick = (event) => {
      const button = event.target.closest("[data-choice]");
      if (!button) return;
      cleanup(button.dataset.choice);
    };

    els.gameDialogActions.addEventListener("click", handleClick);
    activeDialogCancel = () => cleanup(choices[0]?.value ?? null);
    els.gameDialog.classList.remove("hidden");
    els.gameDialogActions.querySelector("[data-choice]")?.focus();
  });
}

function renderSelectionOptions(items) {
  return items
    .map((item) => `<option value="${escapeAttribute(item.id)}">${escapeHtml(item.name)}</option>`)
    .join("");
}

function showSelectionDialog({ title, message, items, label, confirmText = "Select", cancelText = "Cancel" }) {
  return new Promise((resolve) => {
    els.gameDialogTitle.textContent = title;
    els.gameDialogMessage.textContent = message;
    els.gameDialogField.classList.remove("hidden");
    els.gameDialogField.innerHTML = `
      <label>
        <span>${escapeHtml(label)}</span>
        <select data-selection>${renderSelectionOptions(items)}</select>
      </label>
    `;
    els.gameDialogActions.innerHTML = `
      <button type="submit" data-dialog-action="confirm">${escapeHtml(confirmText)}</button>
      <button type="button" class="ghost-button" data-dialog-action="cancel">${escapeHtml(cancelText)}</button>
    `;

    const cleanup = (value) => {
      els.gameDialogForm.removeEventListener("submit", handleSubmit);
      els.gameDialogActions.removeEventListener("click", handleActionClick);
      els.gameDialog.classList.add("hidden");
      activeDialogCancel = null;
      resolve(value);
    };

    const handleSubmit = (event) => {
      event.preventDefault();
      const select = els.gameDialogField.querySelector("[data-selection]");
      cleanup(select?.value || null);
    };

    const handleActionClick = (event) => {
      const button = event.target.closest("[data-dialog-action]");
      if (!button || button.dataset.dialogAction !== "cancel") return;
      cleanup(null);
    };

    els.gameDialogForm.addEventListener("submit", handleSubmit);
    els.gameDialogActions.addEventListener("click", handleActionClick);
    activeDialogCancel = () => cleanup(null);
    els.gameDialog.classList.remove("hidden");
    els.gameDialogField.querySelector("select")?.focus();
  });
}

function showTwoSelectionDialog({ title, message, items, labels, confirmText = "Select", cancelText = "Cancel" }) {
  return new Promise((resolve) => {
    const options = renderSelectionOptions(items);
    els.gameDialogTitle.textContent = title;
    els.gameDialogMessage.textContent = message;
    els.gameDialogField.classList.remove("hidden");
    els.gameDialogField.innerHTML = `
      <label>
        <span>${escapeHtml(labels[0])}</span>
        <select data-selection="first">${options}</select>
      </label>
      <label>
        <span>${escapeHtml(labels[1])}</span>
        <select data-selection="second">${options}</select>
      </label>
      <p class="ability-assignment-error" aria-live="polite"></p>
    `;
    els.gameDialogActions.innerHTML = `
      <button type="submit" data-dialog-action="confirm">${escapeHtml(confirmText)}</button>
      <button type="button" class="ghost-button" data-dialog-action="cancel">${escapeHtml(cancelText)}</button>
    `;

    const cleanup = (value) => {
      els.gameDialogForm.removeEventListener("submit", handleSubmit);
      els.gameDialogActions.removeEventListener("click", handleActionClick);
      els.gameDialogField.removeEventListener("change", handleChange);
      els.gameDialog.classList.add("hidden");
      activeDialogCancel = null;
      resolve(value);
    };

    const updateOptions = () => {
      const first = els.gameDialogField.querySelector("[data-selection='first']");
      const second = els.gameDialogField.querySelector("[data-selection='second']");
      const selected = new Set([first.value, second.value]);
      for (const select of [first, second]) {
        const current = select.value;
        select.innerHTML = `
          <option value="">-</option>
          ${items
            .map((item) => {
              const disabled = selected.has(item.id) && item.id !== current ? "disabled" : "";
              return `<option value="${escapeAttribute(item.id)}" ${disabled}>${escapeHtml(item.name)}</option>`;
            })
            .join("")}
        `;
        select.value = current;
      }
    };

    const handleSubmit = (event) => {
      event.preventDefault();
      const first = els.gameDialogField.querySelector("[data-selection='first']");
      const second = els.gameDialogField.querySelector("[data-selection='second']");
      const error = els.gameDialogField.querySelector(".ability-assignment-error");
      if (!first.value || !second.value || first.value === second.value) {
        if (error) error.textContent = "Choose two different items.";
        return;
      }
      cleanup([first.value, second.value]);
    };

    const handleChange = (event) => {
      if (!event.target.matches("[data-selection='first'], [data-selection='second']")) return;
      if (els.gameDialogField.querySelector(".ability-assignment-error")) {
        els.gameDialogField.querySelector(".ability-assignment-error").textContent = "";
      }
      updateOptions();
    };

    const handleActionClick = (event) => {
      const button = event.target.closest("[data-dialog-action]");
      if (!button || button.dataset.dialogAction !== "cancel") return;
      cleanup(null);
    };

    els.gameDialogForm.addEventListener("submit", handleSubmit);
    els.gameDialogActions.addEventListener("click", handleActionClick);
    els.gameDialogField.addEventListener("change", handleChange);
    activeDialogCancel = () => cleanup(null);
    els.gameDialog.classList.remove("hidden");
    updateOptions();
    els.gameDialogField.querySelector("select")?.focus();
  });
}

async function createHeroGearOptions() {
  const heroTemplate = getHeroTemplate();
  const startingGear = heroTemplate.startingGear;
  if (!startingGear) {
    return {
      equipment: { mainHand: "longsword", torso: "chain-mail" },
      inventory: { money: { cp: 0, sp: 0, gp: 0 }, items: ["chain-mail", "longsword"] },
    };
  }

  const armorChoice = await showChoiceDialog({
    title: "Starting Armor",
    message: "Choose your starting armor package.",
    choices: startingGear.armorChoices.map((choice) => ({ value: choice.value, label: choice.label })),
  });
  if (!armorChoice) return null;

  const equipment = {};
  const items = [];
  let quiver = null;

  const selectedArmor = startingGear.armorChoices.find((choice) => choice.value === armorChoice);
  if (!selectedArmor) return null;
  Object.assign(equipment, selectedArmor.equipment ?? {});
  if (Array.isArray(selectedArmor.inventory)) {
    items.push(...selectedArmor.inventory);
  }
  if (selectedArmor.quiver) {
    quiver = selectedArmor.quiver;
  }

  const martialWeaponOptions = (startingGear.martialWeapons ?? [])
    .map((id) => getItemTemplate(id))
    .filter(Boolean);
  const handFriendlyWeapons = martialWeaponOptions.filter((item) => !item.properties?.includes("two-handed"));

  const weaponChoice = await showChoiceDialog({
    title: "Primary Weapon Loadout",
    message: "Choose whether your fighter starts with a weapon and shield or two weapons.",
    choices: startingGear.weaponChoices.map((choice) => ({ value: choice.value, label: choice.label })),
  });
  if (!weaponChoice) return null;

  const selectedWeaponChoice = startingGear.weaponChoices.find((choice) => choice.value === weaponChoice);
  if (!selectedWeaponChoice) return null;
  Object.assign(equipment, selectedWeaponChoice.equipment ?? {});

  if (weaponChoice === "weapon-shield") {
    const weaponId = await showSelectionDialog({
      title: "Choose Martial Weapon",
      message: "Select a martial weapon for your fighter.",
      items: handFriendlyWeapons,
      label: "Weapon",
      confirmText: "Choose Weapon",
    });
    if (!weaponId) return null;
    equipment.mainHand = weaponId;
    items.push(weaponId, "shield");
  } else {
    const selectedIds = await showTwoSelectionDialog({
      title: "Choose Two Martial Weapons",
      message: "Select two different martial weapons for your fighter.",
      items: handFriendlyWeapons,
      labels: ["First Weapon", "Second Weapon"],
      confirmText: "Choose Weapons",
    });
    if (!selectedIds) return null;
    equipment.mainHand = selectedIds[0];
    equipment.offHand = selectedIds[1];
    items.push(selectedIds[0], selectedIds[1]);
  }

  const extraChoice = await showChoiceDialog({
    title: "Secondary Gear",
    message: "Choose additional starting ranged gear.",
    choices: startingGear.secondaryChoices.map((choice) => ({ value: choice.value, label: choice.label })),
  });
  if (!extraChoice) return null;

  const selectedExtra = startingGear.secondaryChoices.find((choice) => choice.value === extraChoice);
  if (!selectedExtra) return null;
  if (Array.isArray(selectedExtra.inventory)) {
    items.push(...selectedExtra.inventory);
  }
  if (selectedExtra.quiver) {
    quiver = selectedExtra.quiver;
  }

  if (quiver) {
    equipment.quiver = quiver;
  }

  return {
    equipment,
    inventory: {
      money: { cp: 0, sp: 0, gp: 0 },
      items,
    },
  };
}

function showTutorial() {
  els.gameDialogTitle.textContent = "Tutorial";
  els.gameDialogField.classList.add("hidden");
  els.gameDialogMessage.innerHTML = `
    <ul class="tutorial-list">
      <li>Pan the dungeon by grabbing and dragging the map. Use the + and - buttons in the top bar to zoom.</li>
      <li>Right-click enemies and dungeon objects to inspect details and available interactions.</li>
      <li>Open inventory from the character card button I in the right panel.</li>
      <li>At home, your chest appears in the upper-right corner and is also shown in the inventory screen.</li>
    </ul>
  `;
  els.gameDialogActions.innerHTML = `<button type="button" data-tutorial-close>Close</button>`;

  const cleanup = () => {
    els.gameDialogActions.removeEventListener("click", handleClick);
    els.gameDialog.classList.add("hidden");
    activeDialogCancel = null;
  };

  const handleClick = (event) => {
    if (event.target.closest("[data-tutorial-close]")) cleanup();
  };

  els.gameDialogActions.addEventListener("click", handleClick);
  activeDialogCancel = cleanup;
  els.gameDialog.classList.remove("hidden");
  els.gameDialogActions.querySelector("[data-tutorial-close]")?.focus();
}

function rollAbilityScore() {
  const rolls = [rollDie(6), rollDie(6), rollDie(6), rollDie(6)].sort((a, b) => a - b);
  return rolls.slice(1).reduce((sum, roll) => sum + roll, 0);
}

function renderAbilityAssignmentFields(scores) {
  return abilities
    .map(
      (ability) => `
        <label>
          <span>${ability.toUpperCase()}</span>
          <select data-ability-select="${ability}"></select>
        </label>
      `,
    )
    .join("");
}

function updateAbilityAssignmentOptions(container, scores) {
  const selects = Array.from(container.querySelectorAll("[data-ability-select]"));
  const selected = new Map(selects.map((select) => [select.dataset.abilitySelect, select.value]));
  const used = new Set(Array.from(selected.values()).filter((value) => value !== ""));

  for (const select of selects) {
    const current = selected.get(select.dataset.abilitySelect) ?? "";
    const options = [`<option value="">-</option>`];
    scores.forEach((score, index) => {
      const value = String(index);
      if (value === current || !used.has(value)) {
        options.push(`<option value="${value}" ${value === current ? "selected" : ""}>${score}</option>`);
      }
    });
    select.innerHTML = options.join("");
  }
}

function showAbilityAssignmentDialog(scores) {
  return new Promise((resolve) => {
    const sortedScores = [...scores].sort((a, b) => b - a);
    els.gameDialogTitle.textContent = "Assign Ability Scores";
    els.gameDialogMessage.innerHTML = `Scores: ${sortedScores.map(escapeHtml).join(", ")}`;
    els.gameDialogField.classList.add("hidden");
    els.gameDialogActions.innerHTML = `
      <div class="ability-assignment">
        ${renderAbilityAssignmentFields(sortedScores)}
        <p class="ability-assignment-error" aria-live="polite"></p>
      </div>
      <button type="submit" data-dialog-action="confirm">Start Adventure</button>
      <button type="button" class="ghost-button" data-dialog-action="cancel">Cancel</button>
    `;

    const cleanup = (value) => {
      els.gameDialogForm.removeEventListener("submit", handleSubmit);
      els.gameDialogActions.removeEventListener("click", handleClick);
      els.gameDialogActions.removeEventListener("change", handleChange);
      els.gameDialog.classList.add("hidden");
      activeDialogCancel = null;
      resolve(value);
    };

    const handleSubmit = (event) => {
      event.preventDefault();
      const selects = Array.from(els.gameDialogActions.querySelectorAll("[data-ability-select]"));
      const selectedIndexes = selects.map((select) => select.value);
      const error = els.gameDialogActions.querySelector(".ability-assignment-error");
      if (selectedIndexes.some((value) => value === "") || new Set(selectedIndexes).size !== abilities.length) {
        if (error) error.textContent = "Assign each ability one score.";
        return;
      }

      cleanup(
        Object.fromEntries(
          selects.map((select) => [select.dataset.abilitySelect, sortedScores[Number(select.value)]]),
        ),
      );
    };

    const handleClick = (event) => {
      const button = event.target.closest("[data-dialog-action='cancel']");
      if (button) cleanup(null);
    };

    const handleChange = (event) => {
      if (!event.target.matches("[data-ability-select]")) return;
      updateAbilityAssignmentOptions(els.gameDialogActions, sortedScores);
      const error = els.gameDialogActions.querySelector(".ability-assignment-error");
      if (error) error.textContent = "";
    };

    els.gameDialogForm.addEventListener("submit", handleSubmit);
    els.gameDialogActions.addEventListener("click", handleClick);
    els.gameDialogActions.addEventListener("change", handleChange);
    activeDialogCancel = () => cleanup(null);
    els.gameDialog.classList.remove("hidden");
    updateAbilityAssignmentOptions(els.gameDialogActions, sortedScores);
    els.gameDialogActions.querySelector("select")?.focus();
  });
}

async function createCharacterOptions() {
  const choice = await showChoiceDialog({
    title: "Ability Scores",
    message: "Choose how to create your fighter's STR, DEX, CON, INT, WIS, and CHA.",
    choices: [
      { value: "pregenerated", label: "Pregenerated" },
      { value: "standard", label: "Standard Array" },
      { value: "roll", label: "Roll Stats" },
    ],
  });
  if (choice === "pregenerated") {
    const gearOptions = await createHeroGearOptions();
    return gearOptions ? { abilityScores: pregeneratedAbilityScores, ...gearOptions } : null;
  }

  const scores = choice === "roll" ? abilities.map(rollAbilityScore) : standardArray;
  const abilityScores = await showAbilityAssignmentDialog(scores);
  if (!abilityScores) return null;

  const gearOptions = await createHeroGearOptions();
  return gearOptions ? { abilityScores, ...gearOptions } : null;
}

async function startNewAdventure() {
  window.clearTimeout(monsterTurnTimer);
  const chosenName =
    (await showGameDialog({
      title: "Character Name",
      message: "Name your adventurer before stepping into the dungeon.",
      input: { label: "Character name", value: getHeroTemplate().name, maxLength: 32 },
      confirmText: "Start Adventure",
    })) || getHeroTemplate().name;
  const heroOptions = await createCharacterOptions();
  if (!heroOptions) return;
  showDungeonLayout = false;
  state = createInitialState(chosenName, null, heroOptions);
  saveQuickstart(state);
  roomIsBuilt = false;
  hideMainMenu();
  render();
  centerViewOnHero();
}

function availableDungeonThemes() {
  return window.DungeonContent
    .list("themes")
    .filter((theme) => !theme.hidden)
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function chooseDungeonThemeId() {
  const themes = availableDungeonThemes();
  if (themes.length <= 1) return themes[0]?.id ?? defaultContent.theme;
  return showChoiceDialog({
    title: "Choose Dungeon",
    message: "Where do you want to venture next?",
    choices: themes.map((theme) => ({ value: theme.id, label: theme.name })),
  });
}

async function startNewDungeonWithHero() {
  const themeId = await chooseDungeonThemeId();
  if (!themeId) return;
  const previousHero = state.fighters.hero;
  const nextState = createInitialState(previousHero.name, previousHero, {}, themeId);
  const nextHero = refreshDerivedStats({
    ...previousHero,
    position: { ...nextState.fighters.hero.position },
    hp: previousHero.maxHp,
    hitDiceRemaining: previousHero.level ?? 1,
    movementLeft: Math.floor(previousHero.speedFeet / feetPerSquare),
    hasAction: true,
    hasBonusAction: true,
    alive: true,
  });
  nextState.fighters.hero = nextHero;
  nextState.chest = state.chest ?? [];
  nextState.chestMoney = normalizeMoney(state.chestMoney ?? {});
  state = nextState;
  saveQuickstart(state);
  roomIsBuilt = false;
  hideHomeMenu();
  addLog(`${nextHero.name} leaves home for ${getContentDefinition("themes", themeId)?.name ?? "a new dungeon"}.`, "important");
  render();
  centerViewOnHero();
}

async function returnHomeEarly() {
  if (state.mode === "home" || state.mode === "combat" || !gameHasStarted) return;
  const confirmed = await showGameDialog({
    title: "Return Home",
    message: "Return home now? Half your carried bag items and half your carried coins will be lost. Equipped items and home chest contents are safe.",
    confirmText: "Return Home",
    cancelText: "Stay Here",
  });
  if (!confirmed) return;

  const hero = state.fighters.hero;
  const equippedIds = new Set(Object.values(hero.equipment).filter(Boolean));
  const carriedItems = hero.inventory.items.filter((item) => !equippedIds.has(item.id));
  const equippedItems = hero.inventory.items.filter((item) => equippedIds.has(item.id));
  const lostCount = Math.floor(carriedItems.length / 2);
  const shuffled = carriedItems.slice().sort(() => Math.random() - 0.5);
  const lostItems = shuffled.slice(0, lostCount);
  const keptCarried = shuffled.slice(lostCount);
  const lostCoins = Math.floor(moneyToCp(hero.inventory.money) / 2);
  hero.inventory.items = [...equippedItems, ...keptCarried];
  addMoney(hero.inventory.money, -lostCoins);

  state = createHomeState(hero, state.chest ?? [], state.chestMoney ?? {});
  roomIsBuilt = false;
  const lostItemText = lostItems.length ? lostItems.map((item) => item.name).join(", ") : "no items";
  addLog(`${hero.name} retreats home, losing ${lostItemText} and ${moneyText(cpToMoney(lostCoins))}.`, "important");
  render();
  centerViewOnHero();
}

function loadAdventure(slotId) {
  try {
    const payload = load(slotId);
    if (!payload) {
      updateSaveStatus("No saved adventure found.");
      return;
    }

    window.clearTimeout(monsterTurnTimer);
    activeSaveSlot = slotId;
    state = normalizeLoadedState(payload.state);
    showDungeonLayout = false;
    roomIsBuilt = false;
    hideMainMenu();
    addLog(`Loaded "${payload.name}".`, "important");
    render();
    centerViewOnHero();
    maybeRunMonsterTurn();
  } catch (error) {
    updateSaveStatus("Could not load the saved adventure.");
  }
}

function saveAdventure(slotId = activeSaveSlot) {
  const nameInput = els.saveSlots.querySelector(`#save-slot-name-${slotId}`);
  const slot = getSlots().find((entry) => entry.id === slotId);
  const slotName = nameInput?.value.trim() || slot?.name || `Save Slot ${slotId}`;
  const savedAt = new Date().toLocaleString();
  activeSaveSlot = slotId;
  addLog(`Saved "${slotName}" at ${savedAt}.`, "important");
  const payload = save(slotId, slotName, state);
  render();
  updateSaveStatus(`Saved "${payload.name}" at ${new Date(payload.savedAt).toLocaleString()}.`);
}

function deleteAdventure(slotId) {
  const slot = getSlots().find((entry) => entry.id === slotId);
  if (!slot?.hasSave) return;

  remove(slotId);
  render();
  updateSaveStatus(`Deleted "${slot.name}".`);
}

async function handleHeroDeath() {
  const hero = state?.fighters?.hero;
  if (!hero || hero.alive || state.deathPromptShown) return;
  state.deathPromptShown = true;
  window.clearTimeout(monsterTurnTimer);
  render();

  const choice = await showChoiceDialog({
    title: "Defeat",
    message: "Restart this dungeon from the hidden quicksave made when it began?",
    choices: [
      { value: "restart", label: "Restart Dungeon" },
      { value: "stay", label: "Stay Defeated" },
    ],
  });

  if (choice !== "restart") return;
  const payload = loadQuickstart();
  if (!payload?.state) {
    addLog("No dungeon restart save was found.", "important");
    render();
    return;
  }

  window.clearTimeout(monsterTurnTimer);
  state = normalizeLoadedState(payload.state);
  showDungeonLayout = false;
  roomIsBuilt = false;
  addLog("Dungeon restarted from the beginning.", "important");
  render();
  centerViewOnHero();
}

function addLog(text, type = "") {
  state.log.push({ text, type });
  if (state.log.length > 80) {
    state.log.shift();
  }
}

function resetTurnResources(fighter) {
  fighter.movementLeft = Math.floor(fighter.speedFeet / feetPerSquare);
  fighter.hasAction = true;
  fighter.hasBonusAction = true;
  fighter.dodging = false;
  fighter.disengaged = false;
}

function currentGridSize() {
  return state.dungeon?.gridSize ?? gridSize;
}

function currentTileSizePx() {
  return Math.round(tileSizePx * roomZoom);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function viewportCenterGridPoint() {
  if (!els.roomScroll || !els.room) return null;

  const tileSize = currentTileSizePx();
  return {
    x: clamp((els.roomScroll.scrollLeft + els.roomScroll.clientWidth / 2 - els.room.offsetLeft) / tileSize, 0, currentGridSize()),
    y: clamp((els.roomScroll.scrollTop + els.roomScroll.clientHeight / 2 - els.room.offsetTop) / tileSize, 0, currentGridSize()),
  };
}

function scrollRoomToGridPoint(point) {
  if (!point || !els.roomScroll || !els.room) return;

  const tileSize = currentTileSizePx();
  const scrollLeft = els.room.offsetLeft + point.x * tileSize - els.roomScroll.clientWidth / 2;
  const scrollTop = els.room.offsetTop + point.y * tileSize - els.roomScroll.clientHeight / 2;
  const maxScrollLeft = Math.max(0, els.roomScroll.scrollWidth - els.roomScroll.clientWidth);
  const maxScrollTop = Math.max(0, els.roomScroll.scrollHeight - els.roomScroll.clientHeight);

  els.roomScroll.scrollLeft = clamp(scrollLeft, 0, maxScrollLeft);
  els.roomScroll.scrollTop = clamp(scrollTop, 0, maxScrollTop);
}

function animateScrollRoomToGridPoint(point, duration = 180) {
  if (!point || !els.roomScroll || !els.room) return;

  const tileSize = currentTileSizePx();
  const targetLeft = clamp(els.room.offsetLeft + point.x * tileSize - els.roomScroll.clientWidth / 2, 0, Math.max(0, els.roomScroll.scrollWidth - els.roomScroll.clientWidth));
  const targetTop = clamp(els.room.offsetTop + point.y * tileSize - els.roomScroll.clientHeight / 2, 0, Math.max(0, els.roomScroll.scrollHeight - els.roomScroll.clientHeight));
  const startLeft = els.roomScroll.scrollLeft;
  const startTop = els.roomScroll.scrollTop;
  const deltaLeft = targetLeft - startLeft;
  const deltaTop = targetTop - startTop;
  const startTime = performance.now();

  if (roomScrollAnimation) {
    window.cancelAnimationFrame(roomScrollAnimation);
    roomScrollAnimation = null;
  }

  const ease = (t) => 1 - Math.pow(1 - t, 3);

  const step = (timestamp) => {
    const elapsed = Math.max(0, timestamp - startTime);
    const progress = Math.min(1, elapsed / duration);
    const eased = ease(progress);

    els.roomScroll.scrollLeft = startLeft + deltaLeft * eased;
    els.roomScroll.scrollTop = startTop + deltaTop * eased;

    if (progress < 1) {
      roomScrollAnimation = window.requestAnimationFrame(step);
    } else {
      roomScrollAnimation = null;
    }
  };

  roomScrollAnimation = window.requestAnimationFrame(step);
}

function centerViewOnHero({ animate = false } = {}) {
  const hero = state.fighters.hero;
  window.requestAnimationFrame(() => {
    if (animate) {
      animateScrollRoomToGridPoint({ x: hero.position.x + 0.5, y: hero.position.y + 0.5 });
    } else {
      scrollRoomToGridPoint({ x: hero.position.x + 0.5, y: hero.position.y + 0.5 });
    }
  });
}

function renderKeepingGridFocus(point) {
  render();
  window.requestAnimationFrame(() => scrollRoomToGridPoint(point));
}

function currentWalkable() {
  const walkable = new Set((state.dungeon?.walkable ?? []).map(positionKey));
  blockingObjectKeys().forEach((tileKey) => walkable.delete(tileKey));
  return walkable;
}

function positionFromKey(tileKey) {
  const [x, y] = tileKey.split(",").map(Number);
  return { x, y };
}

function exposedWallKeys() {
  const walkable = currentWalkable();
  const walls = new Set();
  for (const tileKey of walkable) {
    const position = positionFromKey(tileKey);
    if (!isKnownTile(position)) continue;

    for (const neighbor of adjacentCells(position)) {
      const neighborKey = positionKey(neighbor);
      if (!walkable.has(neighborKey)) walls.add(neighborKey);
    }
  }
  return walls;
}

function movementEdgeKey(from, to) {
  return [positionKey(from), positionKey(to)].sort().join("|");
}

function corridorTiles() {
  return new Set((state.dungeon?.corridors ?? []).map(positionKey));
}

function corridorPassageIdsForEdge(from, to) {
  const edge = movementEdgeKey(from, to);
  return (state.dungeon?.corridorPassages ?? [])
    .filter((passage) => passage.edges?.includes(edge))
    .map((passage) => passage.id);
}

function previousPositionForPath(fighter, path) {
  if (!path || path.length <= 1) return fighter.position;
  return path[path.length - 2];
}

function activeCorridorIdsAt(fighter, position, path = []) {
  if (!corridorTiles().has(positionKey(position)) || path.length === 0) return [];
  return corridorPassageIdsForEdge(previousPositionForPath(fighter, path), position);
}

function movementStateKey(fighter, position, path = []) {
  const activeCorridors = activeCorridorIdsAt(fighter, position, path);
  return `${positionKey(position)}:${activeCorridors.sort().join("+")}`;
}

function currentOpenedKeys() {
  return new Set([...(state.exploration?.openedDoorKeys ?? []), ...(state.exploration?.openedCorridorKeys ?? [])]);
}

function currentDiscoveredRoomIds() {
  return new Set(state.exploration?.discoveredRoomIds ?? []);
}

function isKnownTile(position) {
  if (showDungeonLayout) return true;
  const tileKey = positionKey(position);
  if (currentOpenedKeys().has(tileKey)) return true;
  if (doorAt(position)) {
    const door = doorAt(position);
    if (currentDiscoveredRoomIds().has(door.roomId)) return true;
    return adjacentCells(position).some((cell) => currentOpenedKeys().has(positionKey(cell)));
  }
  return (state.dungeon?.rooms ?? []).some((room) => currentDiscoveredRoomIds().has(room.id) && roomHasCell(room, position));
}

function adjacentCells(position) {
  return [
    { x: position.x, y: position.y - 1 },
    { x: position.x + 1, y: position.y },
    { x: position.x, y: position.y + 1 },
    { x: position.x - 1, y: position.y },
  ];
}

function visibleWalkable() {
  const known = new Set();
  const openedKeys = currentOpenedKeys();
  for (const room of state.dungeon?.rooms ?? []) {
    if (currentDiscoveredRoomIds().has(room.id)) {
      room.cells.forEach((cell) => known.add(positionKey(cell)));
      room.doors.forEach((door) => known.add(positionKey(door)));
    }
  }
  openedKeys.forEach((tileKey) => known.add(tileKey));
  for (const door of state.dungeon?.doors ?? []) {
    if (adjacentCells(door).some((cell) => openedKeys.has(positionKey(cell)))) {
      known.add(positionKey(door));
    }
  }
  blockingObjectKeys().forEach((tileKey) => known.delete(tileKey));
  return known;
}

function doorAt(position) {
  const tileKey = positionKey(position);
  return (state.dungeon?.doors ?? []).find((door) => positionKey(door) === tileKey) ?? null;
}

function doorPassageBetween(from, to) {
  return (state.dungeon?.doors ?? []).find((door) => {
    const doorKey = positionKey(door);
    const corridorKey = door.corridor ? positionKey(door.corridor) : "";
    const fromKey = positionKey(from);
    const toKey = positionKey(to);
    return (fromKey === doorKey && toKey === corridorKey) || (fromKey === corridorKey && toKey === doorKey);
  });
}

function canTraverseDungeonEdge(from, to) {
  const door = doorPassageBetween(from, to);
  return !door || currentOpenedKeys().has(positionKey(door));
}

function canTraverseMovementEdge(fighter, from, to, path = []) {
  const door = doorPassageBetween(from, to);
  if (door) return currentOpenedKeys().has(positionKey(door));

  const fromRoom = roomForPosition(from);
  const toRoom = roomForPosition(to);
  if (fromRoom && toRoom) return fromRoom.id === toRoom.id;

  const corridorIds = corridorPassageIdsForEdge(from, to);
  if (corridorIds.length === 0) return false;

  const activeCorridors = activeCorridorIdsAt(fighter, from, path);
  if (activeCorridors.length === 0) return true;
  return corridorIds.some((id) => activeCorridors.includes(id));
}

function reciprocalDoor(door) {
  const targetRoom = (state.dungeon?.rooms ?? []).find((room) => room.id === door.to);
  return targetRoom?.doors.find((targetDoor) => targetDoor.to === door.roomId) ?? null;
}

function roomForPosition(position) {
  return (state.dungeon?.rooms ?? []).find((room) => roomHasCell(room, position)) ?? null;
}

function doorsAtCorridorMouth(position) {
  const tileKey = positionKey(position);
  return (state.dungeon?.doors ?? []).filter((door) => door.corridor && positionKey(door.corridor) === tileKey);
}

function visibleMonsters() {
  return aliveMonsters().filter((monster) => isKnownTile(monster.position));
}

function combatMonsters() {
  return state.initiative
    .map((entry) => state.fighters[entry.fighterId])
    .filter((fighter) => fighter?.id !== "hero" && fighter.alive);
}

function adjacentMonster() {
  const hero = state.fighters.hero;
  return visibleMonsters().find((monster) => isAdjacent(hero, monster)) ?? null;
}

function attackRangeSquares(fighter) {
  const range = damageProfile(fighter).range;
  return Math.max(1, Math.floor((range?.feet ?? 5) / feetPerSquare));
}

function profileRangeSquares(profile) {
  return Math.max(1, Math.floor((profile?.range?.feet ?? 5) / feetPerSquare));
}

function attackUsesRangedProfile(fighter) {
  const weapon = activeWeapon(fighter);
  const attackDamage = damageProfile(fighter);
  return weaponIsRanged(weapon) || attackDamage.range?.kind === "ranged";
}

function lineCellsBetween(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const steps = Math.max(Math.abs(dx), Math.abs(dy)) * 8;
  const cells = [];
  let lastKey = "";
  for (let step = 0; step <= steps; step += 1) {
    const t = steps === 0 ? 0 : step / steps;
    const position = {
      x: Math.floor(from.x + 0.5 + dx * t),
      y: Math.floor(from.y + 0.5 + dy * t),
    };
    const key = positionKey(position);
    if (key !== lastKey) {
      cells.push(position);
      lastKey = key;
    }
  }
  return cells;
}

function hasClearLineOfSight(from, to) {
  const shootable = new Set((state.dungeon?.walkable ?? []).map(positionKey));

  lineOfSightBlockingObjectKeys().forEach((tileKey) => {
    shootable.delete(tileKey);
  });

  const cells = lineCellsBetween(from, to);
  if (cells.length === 0) return false;

  for (const cell of cells) {
    if (!shootable.has(positionKey(cell))) return false;
  }

  for (let index = 1; index < cells.length; index += 1) {
    const previous = cells[index - 1];
    const current = cells[index];

    if (distance(previous, current) === 1 && !canTraverseDungeonEdge(previous, current)) {
      return false;
    }
  }

  return true;
}

function isWithinAttackDistance(attacker, defender) {
  return distance(attacker.position, defender.position) <= attackRangeSquares(attacker);
}

function isInAttackRange(attacker, defender) {
  if (!isWithinAttackDistance(attacker, defender)) return false;
  return !attackUsesRangedProfile(attacker) || hasClearLineOfSight(attacker.position, defender.position);
}

function attackTarget() {
  const hero = state.fighters.hero;
  return visibleMonsters().find((monster) => isInAttackRange(hero, monster)) ?? null;
}

function nearestVisibleMonster() {
  const hero = state.fighters.hero;
  return visibleMonsters().sort((a, b) => distance(a.position, hero.position) - distance(b.position, hero.position))[0] ?? null;
}

function attackBonusForAbility(fighter, ability) {
  const baseBonus = fighter.attackBonus ?? 0;
  const baseAbility = fighter.baseAttackAbilityMod ?? abilityMod(fighter, "str");
  return baseBonus - baseAbility + abilityMod(fighter, ability);
}

function hostileTo(fighter, candidate) {
  if (!candidate.alive || candidate.id === fighter.id) return false;
  return fighter.id === "hero" ? candidate.id !== "hero" : candidate.id === "hero";
}

function canOpportunityAttack(attacker, defender, from, to) {
  if (state.mode !== "combat" || !attacker.alive || !defender.alive || !hostileTo(attacker, defender)) return false;
  if (defender.disengaged) return false;
  const profile = opportunityAttackProfile(attacker);
  const range = profileRangeSquares(profile);
  return distance(attacker.position, from) <= range && distance(attacker.position, to) > range;
}

function opportunityAttack(attacker, defender) {
  const profile = opportunityAttackProfile(attacker);
  const attackRolls = defender.dodging ? [rollDie(20), rollDie(20)] : [rollDie(20)];
  const attackRoll = Math.min(...attackRolls);
  const currentAttackBonus = attackBonusForAbility(attacker, profile.attackAbility ?? "str");
  const defenderAc = armorClass(defender);
  const totalAttack = attackRoll + currentAttackBonus;
  const isCritical = attackRoll === 20;
  const isMiss = attackRoll === 1 || totalAttack < defenderAc;

  addLog(
    `${attacker.name} makes an opportunity attack with ${profile.weaponName}${defender.dodging ? " with disadvantage" : ""}: d20 ${defender.dodging ? `${attackRolls.join(" / ")} -> ${attackRoll}` : attackRoll} ${abilityLabel(currentAttackBonus)} = ${totalAttack} vs AC ${defenderAc}.`,
    "important",
  );

  if (isMiss) {
    addLog(attackRoll === 1 ? "Natural 1. The opportunity attack misses badly." : `${defender.name} slips away.`);
    return;
  }

  const damageRoll = profile.flat
    ? { total: profile.flat, rolls: [profile.flat] }
    : rollDice(profile.count * (isCritical ? 2 : 1), profile.sides);
  const rawDamage = Math.max(1, damageRoll.total + (profile.bonus ?? 0));
  const modified = calculateDamageModifiers(defender, rawDamage, profile.type);
  defender.hp = Math.max(0, defender.hp - modified.damage);
  defender.alive = defender.hp > 0;
  if (defender.id === "hero") playSoundEffect("characterDamage");
  const adjustmentNote = modified.reason ? ` ${defender.name} is ${modified.reason} to ${profile.type} damage.` : "";
  addLog(
    `${attacker.name} hits for ${modified.damage} ${profile.type ?? "damage"} damage (${damageRoll.rolls.join(" + ")} ${abilityLabel(profile.bonus ?? 0)}).${isCritical ? " Critical hit." : ""}${adjustmentNote}`,
    "damage",
  );

  if (!defender.alive) {
    addLog(`${defender.name} drops to 0 HP.`, "important");
    if (defender.id === "hero") {
      handleHeroDeath();
    } else {
      if (attacker.id === "hero") playSoundEffect("enemyDefeated");
      awardMonsterXp(defender);
      dropLootForMonster(defender);
      if (combatMonsters().length === 0) {
        endCurrentEncounter();
        addLog("The room falls quiet. Exploration resumes.", "important");
      }
    }
  }
}

function monstersInRoom(roomId) {
  return aliveMonsters().filter((monster) => monster.roomId === roomId);
}

function isExitPosition(position) {
  return state.exit?.position && positionKey(state.exit.position) === positionKey(position);
}

function checkDungeonCompletion() {
  if (state.mode === "home" && isExitPosition(state.fighters.hero.position)) {
    showHomeMenu();
    return true;
  }
  if (state.completed || !isExitPosition(state.fighters.hero.position)) return false;
  if (monstersInRoom(state.exit.roomId).length > 0) return false;

  const hero = state.fighters.hero;
  const tokenAward = categoryForHeroLevel(hero.level ?? 1);
  hero.inventory.heroTokens = (hero.inventory.heroTokens ?? 0) + tokenAward;
  playSoundEffect("exitReached");
  state = createHomeState(hero, state.chest ?? [], state.chestMoney ?? {});
  state.combatStarted = false;
  roomIsBuilt = false;
  addLog(`${state.fighters.hero.name} reaches the exit. Dungeon complete. Gained ${tokenAward} Hero Token${tokenAward === 1 ? "" : "s"}.`, "important");
  render();
  centerViewOnHero();
  return true;
}

function createLootForMonster(monster) {
  const healingPotion = rollDie(100) <= 22 ? randomHealingPotionDrop() : null;
  const equipmentDrop = rollDie(100) <= 25 ? randomEquipmentDrop() : null;
  const items = [healingPotion, equipmentDrop, ...definedLootForMonster(monster)].filter(Boolean);
  return {
    id: `loot-${monster.id}-${Date.now()}`,
    position: { ...monster.position },
    money: { cp: rollDie(11) - 1, sp: 0, gp: 0 },
    items,
  };
}

function rollLootQuantity(loot) {
  const dice = loot.quantityDice;
  if (!dice) return loot.quantity ?? 1;
  return rollDice(dice.count ?? 1, dice.sides ?? 1).total + (dice.bonus ?? 0);
}

function definedLootForMonster(monster) {
  return (monster.extraLoot ?? [])
    .map((loot) => {
      if (loot.kind === "randomEquipment") return randomEquipmentDrop();
      if (loot.kind !== "item" || !loot.itemId) return null;
      const item = createItemInstance(loot.itemId, "loot");
      if (!item) return null;
      if (item.ammo) {
        item.ammo.quantity = Math.max(0, rollLootQuantity(loot));
        item.name = `${item.ammo.kind[0].toUpperCase()}${item.ammo.kind.slice(1)}s (${item.ammo.quantity})`;
      }
      return item;
    })
    .filter(Boolean);
}

function itemValueGp(item) {
  if (!item?.cost) return 1;
  const rates = { cp: 0.01, sp: 0.1, ep: 0.5, gp: 1, pp: 10 };
  return Math.max(0.01, (item.cost.amount ?? 0) * (rates[item.cost.unit] ?? 1));
}

function itemValueCp(item) {
  if (!item?.cost) return 0;
  return moneyToCp({ [item.cost.unit]: item.cost.amount ?? 0 });
}

function weightedPick(entries) {
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
  if (total <= 0) return null;
  let roll = Math.random() * total;
  for (const entry of entries) {
    roll -= entry.weight;
    if (roll <= 0) return entry.item;
  }
  return entries.at(-1)?.item ?? null;
}

function dungeonLootItems() {
  const table = getContentDefinition("lootTables", defaultContent.lootTable);
  const ids = table?.itemIds?.length ? new Set(table.itemIds) : null;
  return window.DungeonContent.list("items").filter((item) => !ids || ids.has(item.id));
}

function randomHealingPotionDrop() {
  const rarityWeights = {
    "potion-healing": 75,
    "potion-greater-healing": 18,
    "potion-superior-healing": 6,
    "potion-supreme-healing": 1,
  };
  const potion = weightedPick(
    dungeonLootItems()
      .filter((item) => item.use?.kind === "healing")
      .map((item) => ({ item, weight: rarityWeights[item.id] ?? 1 })),
  );
  return potion ? createItemInstance(potion.id, "loot") : null;
}

function randomEquipmentDrop() {
  const item = weightedPick(
    dungeonLootItems()
      .filter((candidate) => candidate.use?.kind !== "healing")
      .map((candidate) => ({ item: candidate, weight: 1 / Math.max(1, Math.sqrt(itemValueGp(candidate))) })),
  );
  return item ? createItemInstance(item.id, "loot") : null;
}

function dropLootForMonster(monster) {
  const loot = createLootForMonster(monster);
  state.lootPiles.push(loot);
}

function awardMonsterXp(monster) {
  const hero = state.fighters.hero;
  const xp = monster.xp ?? 50;
  hero.xp = (hero.xp ?? 0) + xp;
  addLog(`${hero.name} gains ${xp} XP.`, "important");
}

function collectLootAtPosition(fighter, position) {
  const lootIndex = state.lootPiles.findIndex((pile) => positionKey(pile.position) === positionKey(position));
  if (lootIndex < 0) return false;

  const [loot] = state.lootPiles.splice(lootIndex, 1);
  addMoney(fighter.inventory.money, moneyToCp(loot.money));
  for (const item of loot.items ?? []) {
    addItemToInventory(fighter, item, "loot-stack");
  }

  const coinText = moneyToCp(loot.money) ? moneyText(loot.money) : "";
  const itemText = (loot.items ?? []).map((item) => item.name).join(", ");
  const lootText = [coinText, itemText].filter(Boolean).join(" and ") || "nothing";
  addLog(`${fighter.name} collects ${lootText}.`, "important");
  return true;
}

function triggerTrapAtPosition(fighter, position) {
  const trap = objectAt(position);
  if (!trap || !objectIsTrap(trap) || trap.armed === false || trap.disarmed || !fighter.alive) return false;

  const template = objectTemplate(trap.type);
  const damageRoll = rollDice(template.damage.count, template.damage.sides);
  const rawDamage = damageRoll.total;
  const modified = calculateDamageModifiers(fighter, rawDamage, template.damage.type);
  fighter.hp = Math.max(0, fighter.hp - modified.damage);
  fighter.alive = fighter.hp > 0;
  if (fighter.id === "hero") playSoundEffect("characterDamage");
  trap.armed = false;
  trap.spent = true;
  trap.lastResult = `${fighter.name} triggered it for ${modified.damage} ${template.damage.type} damage (${damageRoll.rolls.join(" + ")}).`;
  const adjustmentNote = modified.reason ? ` ${fighter.name} is ${modified.reason} to ${template.damage.type} damage.` : "";
  addLog(`${fighter.name} triggers a spike trap for ${modified.damage} ${template.damage.type} damage (${damageRoll.rolls.join(" + ")}).${adjustmentNote}`, "damage");

  if (!fighter.alive) {
    addLog(`${fighter.name} drops to 0 HP.`, "important");
    handleHeroDeath();
  }
  return true;
}

function triggerPortalAtPosition(fighter, position) {
  if (state.mode === "combat" || fighter.id !== "hero" || !fighter.alive) return false;
  const portal = (state.dungeonObjects ?? []).find(
    (object) => object.type === "portal" && positionKey(object.position) === positionKey(position),
  );
  const pairedPortal = portal ? dungeonObjectForId(portal.pairId) : null;
  if (!portal || !pairedPortal) return false;

  fighter.position = { ...pairedPortal.position };
  const destinationRoom = roomForPosition(pairedPortal.position);
  if (destinationRoom) {
    state.exploration.discoveredRoomIds = Array.from(new Set([...(state.exploration.discoveredRoomIds ?? []), destinationRoom.id]));
  }
  addLog(`${fighter.name} steps through a portal and emerges elsewhere in the dungeon.`, "important");
  playSoundEffect("portal");
  centerViewOnHero({ animate: true });
  return true;
}

function checkTrapDetectionOnReveal() {
  const hero = state.fighters?.hero;
  if (!hero) return;

  for (const trap of state.dungeonObjects ?? []) {
    if (!objectIsTrap(trap) || trap.spotChecked || !objectCells(trap).some(isKnownTile)) continue;

    trap.spotChecked = true;
    const roll = rollDie(20);
    const bonus = abilityMod(hero, "wis");
    const total = roll + bonus;
    const dc = trap.spotDc ?? 12;
    trap.detected = total >= dc;
    if (trapDetectionDebugLog) {
      addLog(
        `Debug trap spot: ${hero.name} rolls Wisdom ${roll} ${abilityLabel(bonus)} = ${total} vs ${trap.spotDifficulty ?? "Normal"} DC ${dc}. ${
          trap.detected ? "Trap spotted." : "Trap missed."
        }`,
        trap.detected ? "important" : "",
      );
    }
  }

  for (const chest of state.dungeonObjects ?? []) {
    if (chest.type !== "chest" || !chest.trap || chest.trap.spotChecked || !objectCells(chest).some(isKnownTile)) continue;

    chest.trap.spotChecked = true;
    const roll = rollDie(20);
    const bonus = abilityMod(hero, "wis");
    const total = roll + bonus;
    const dc = chest.trap.spotDc ?? 12;
    chest.trap.detected = total >= dc;
    if (trapDetectionDebugLog) {
      addLog(
        `Debug chest trap spot: ${hero.name} rolls Wisdom ${roll} ${abilityLabel(bonus)} = ${total} vs ${
          chest.trap.spotDifficulty ?? "Normal"
        } DC ${dc}. ${chest.trap.detected ? "Chest trap spotted." : "Chest trap missed."}`,
        chest.trap.detected ? "important" : "",
      );
    }
  }
}

function corridorPathBetweenDoors(door, targetDoor) {
  if (!door?.corridor || !targetDoor?.corridor) return [];
  const doorKey = positionKey(door.corridor);
  const targetKey = positionKey(targetDoor.corridor);
  const passage = (state.dungeon?.corridorPassages ?? []).find((candidate) => {
    const cells = new Set((candidate.cells ?? []).map(positionKey));
    return cells.has(doorKey) && cells.has(targetKey);
  });
  if (passage) return passage.cells ?? [];

  const corridorKeys = new Set((state.dungeon?.corridors ?? []).map(positionKey));
  const queue = [{ position: door.corridor, path: [door.corridor] }];
  const visited = new Set([positionKey(door.corridor)]);
  const goalKey = positionKey(targetDoor.corridor);

  while (queue.length > 0) {
    const current = queue.shift();
    if (positionKey(current.position) === goalKey) return current.path;

    for (const next of [
      { x: current.position.x, y: current.position.y - 1 },
      { x: current.position.x + 1, y: current.position.y },
      { x: current.position.x, y: current.position.y + 1 },
      { x: current.position.x - 1, y: current.position.y },
    ]) {
      const nextKey = positionKey(next);
      if (visited.has(nextKey) || !corridorKeys.has(nextKey)) continue;
      visited.add(nextKey);
      queue.push({ position: next, path: [...current.path, next] });
    }
  }

  return [door.corridor, targetDoor.corridor];
}

function openDoor(door) {
  const targetRoom = (state.dungeon?.rooms ?? []).find((room) => room.id === door.to);
  const doorRoom = (state.dungeon?.rooms ?? []).find((room) => room.id === door.roomId);
  const targetDoor = reciprocalDoor(door);
  if (!targetRoom || !doorRoom || !targetDoor) return false;

  const discovered = currentDiscoveredRoomIds();
  const openedDoorKeys = new Set(state.exploration.openedDoorKeys);
  const openedCorridorKeys = new Set(state.exploration.openedCorridorKeys);
  const openingFromDiscoveredRoom = discovered.has(door.roomId);
  const roomToReveal = openingFromDiscoveredRoom ? null : doorRoom;

  openedDoorKeys.add(positionKey(door));
  corridorPathBetweenDoors(door, targetDoor).forEach((cell) => openedCorridorKeys.add(positionKey(cell)));

  if (roomToReveal) {
    discovered.add(roomToReveal.id);
  }

  state.exploration.discoveredRoomIds = Array.from(discovered);
  state.exploration.openedDoorKeys = Array.from(openedDoorKeys);
  state.exploration.openedCorridorKeys = Array.from(openedCorridorKeys);
  addLog(`${state.fighters.hero.name} opens the door${roomToReveal ? ` to ${roomToReveal.name}` : ""}.`, "important");

  if (roomToReveal && monstersInRoom(roomToReveal.id).length > 0) {
    addLog("Hostile movement answers from within. Roll initiative.", "important");
  }

  render();
  return true;
}

function doorCandidateForPosition(position) {
  const directDoor = doorAt(position);
  if (directDoor) return directDoor;

  if (position.x !== state.fighters.hero.position.x || position.y !== state.fighters.hero.position.y) return null;

  const corridorDoors = doorsAtCorridorMouth(position).filter((door) => !currentOpenedKeys().has(positionKey(door)));
  if (corridorDoors.length > 0) {
    const undiscovered = corridorDoors.find((door) => !currentDiscoveredRoomIds().has(door.roomId));
    return undiscovered ?? corridorDoors[0];
  }

  return adjacentCells(position).map(doorAt).filter(Boolean)[0] ?? null;
}

function canOpenDoor(position) {
  const hero = state.fighters.hero;
  const door = doorCandidateForPosition(position);
  if (!door || !isKnownTile(position) || !isKnownTile(door)) return null;
  if (currentOpenedKeys().has(positionKey(door))) return null;
  const heroRoom = roomForPosition(hero.position);
  if (heroRoom && currentDiscoveredRoomIds().has(heroRoom.id) && monstersInRoom(heroRoom.id).length > 0) {
    return null;
  }
  return distance(hero.position, door) <= 1 ? door : null;
}

function autoOpenAdjacentExplorationDoor(fighter) {
  if (fighter.id !== "hero" || state.mode !== "exploration") return false;
  const door = doorAt(fighter.position) || doorsAtCorridorMouth(fighter.position).length > 0 ? canOpenDoor(fighter.position) : null;
  return door ? openDoor(door) : false;
}

function threatPresent() {
  return visibleMonsters().length > 0;
}

function endCurrentEncounter() {
  state.combatStarted = false;
  state.mode = "exploration";
  state.initiative = [];
  state.activeIndex = 0;
  resetTurnResources(state.fighters.hero);
  checkDungeonCompletion();
}

function debugKillVisibleMonsters() {
  const targets = visibleMonsters();
  if (targets.length === 0) {
    addLog("Debug: no visible monsters to kill.");
    render();
    return;
  }

  targets.forEach((monster) => {
    dropLootForMonster(monster);
    awardMonsterXp(monster);
    monster.hp = 0;
    monster.alive = false;
  });
  endCurrentEncounter();
  addLog(`Debug: removed ${targets.length} visible monster${targets.length === 1 ? "" : "s"}.`, "important");
  render();
}

function rollInitiative() {
  if (state.combatStarted) return;

  const heroRoll = rollDie(20);
  const monsters = visibleMonsters();
  if (monsters.length === 0) return;

  const monsterEntries = monsters.map((monster) => {
    const monsterRoll = rollDie(20);
    return {
      fighterId: monster.id,
      roll: monsterRoll,
      total: monsterRoll + monster.initiativeBonus,
    };
  });

  state.initiative = [
    {
      fighterId: "hero",
      roll: heroRoll,
      total: heroRoll + state.fighters.hero.initiativeBonus,
    },
    ...monsterEntries,
  ].sort((a, b) => b.total - a.total || (a.fighterId === "hero" ? -1 : 1));

  state.combatStarted = true;
  state.mode = "combat";
  state.round = 1;
  state.activeIndex = 0;
  resetTurnResources(activeFighter());

  addLog(
    `Initiative: ${state.fighters.hero.name} rolls ${heroRoll} ${abilityLabel(state.fighters.hero.initiativeBonus)} = ${
      heroRoll + state.fighters.hero.initiativeBonus
    }; ${monsterEntries
      .map((entry) => `${state.fighters[entry.fighterId].name} rolls ${entry.roll} ${abilityLabel(state.fighters[entry.fighterId].initiativeBonus)} = ${entry.total}`)
      .join("; ")}.`,
    "important",
  );
  addLog(`${activeFighter().name} acts first.`, "important");

  render();
  maybeRunMonsterTurn();
}

function makeAttack(attacker, defender) {
  if (!attacker.alive || !defender.alive || !attacker.hasAction) return;
  const weapon = activeWeapon(attacker);

  if (!isWithinAttackDistance(attacker, defender)) {
    addLog(`${attacker.name} is too far away to attack ${defender.name}. Move closer first.`);
    render();
    return;
  }

  if (attackUsesRangedProfile(attacker) && !hasClearLineOfSight(attacker.position, defender.position)) {
    addLog(`${attacker.name} does not have a clear line of sight to ${defender.name}.`);
    render();
    return;
  }

  if (!itemHasUsableAmmo(attacker, weapon)) {
    addLog(`${attacker.name} needs ammunition in the quiver to use ${weapon.name}.`);
    render();
    return;
  }

  attacker.hasAction = false;
  spendAmmunition(attacker, weapon);

  const attackDamage = damageProfile(attacker);
  const rangedAttack = weaponIsRanged(weapon) || attackDamage.range?.kind === "ranged";
  playSoundEffect(rangedAttack ? "rangedAttack" : "meleeAttack");
  const adjacentHostiles = hostileFightersAdjacentTo(attacker).length > 0;
  const rangedDisadvantage = rangedAttack && adjacentHostiles;
  const defenderDodge = defender.dodging;
  const attackRolls = (rangedDisadvantage || defenderDodge) ? [rollDie(20), rollDie(20)] : [rollDie(20)];
  const attackRoll = Math.min(...attackRolls);
  const defenderAc = armorClass(defender);
  const currentAttackBonus = attackBonus(attacker);
  const totalAttack = attackRoll + currentAttackBonus;
  const isCritical = attackRoll === 20;
  const isMiss = attackRoll === 1 || totalAttack < defenderAc;

  addLog(
    `${attacker.name} attacks${rangedDisadvantage ? " with disadvantage" : ""}${defenderDodge ? " because the target is dodging" : ""}: d20 ${
      attackRolls.length > 1 ? `${attackRolls.join(" / ")} -> ${attackRoll}` : attackRoll
    } ${abilityLabel(currentAttackBonus)} = ${totalAttack} vs AC ${
      defenderAc
    }.`,
  );

  if (isMiss) {
    addLog(attackRoll === 1 ? "Natural 1. The attack misses badly." : `${defender.name} avoids the blow.`);
    render();
    return;
  }

  const damageRoll = attackDamage.flat
    ? { total: attackDamage.flat, rolls: [attackDamage.flat] }
    : rollDice(attackDamage.count * (isCritical ? 2 : 1), attackDamage.sides);
  const rawDamage = Math.max(1, damageRoll.total + attackDamage.bonus);
  const modified = calculateDamageModifiers(defender, rawDamage, attackDamage.type);
  defender.hp = Math.max(0, defender.hp - modified.damage);
  defender.alive = defender.hp > 0;
  if (defender.id === "hero") playSoundEffect("characterDamage");

  const critText = isCritical ? " Critical hit." : "";
  const damageTypeText = attackDamage.type ? ` ${attackDamage.type}` : "";
  const adjustmentNote = modified.reason ? ` ${defender.name} is ${modified.reason} to ${attackDamage.type} damage.` : "";
  addLog(
    `${attacker.name} hits for ${modified.damage} damage (${damageRoll.rolls.join(" + ")} ${
      abilityLabel(attackDamage.bonus)
    }${damageTypeText}).${critText}${adjustmentNote}`,
    "damage",
  );

  if (!defender.alive) {
    addLog(`${defender.name} drops to 0 HP. ${attacker.id === "hero" ? "Victory." : "Defeat."}`, "important");
    if (defender.id !== "hero") {
      if (attacker.id === "hero") playSoundEffect("enemyDefeated");
      awardMonsterXp(defender);
      dropLootForMonster(defender);
    } else {
      handleHeroDeath();
    }
    if (attacker.id === "hero" && combatMonsters().length === 0) {
      endCurrentEncounter();
      addLog("The room falls quiet. Exploration resumes.", "important");
    }
  }

  render();
}

function endTurn() {
  if (!state.combatStarted || combatMonsters().length === 0 || !state.fighters.hero.alive) {
    render();
    return;
  }

  do {
    state.activeIndex = (state.activeIndex + 1) % state.initiative.length;
    if (state.activeIndex === 0) {
      state.round += 1;
      addLog(`Round ${state.round} begins.`, "important");
    }
  } while (!activeFighter()?.alive);
  resetTurnResources(activeFighter());

  render();
  maybeRunMonsterTurn();
}

function maybeRunMonsterTurn() {
  const fighter = activeFighter();
  if (!fighter || fighter.id === "hero" || !fighter.alive || !state.fighters.hero.alive) return;

  els.attack.disabled = true;
  els.useItem.disabled = true;
  els.endTurn.disabled = true;
  window.clearTimeout(monsterTurnTimer);
  monsterTurnTimer = window.setTimeout(() => {
    const current = activeFighter();
    if (current?.id !== "hero") {
      runMonsterAi(current);
    }
  }, tokenSlideMs);
}

function movementWalkableFor(fighter) {
  return fighter.id === "hero" && state.mode === "exploration" ? visibleWalkable() : currentWalkable();
}

function movementLimitFor(fighter) {
  return state.mode === "combat" ? fighter.movementLeft : Infinity;
}

function isValidPathStep(fighter, from, to, path = []) {
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  if (dx + dy !== 1) return false;
  if (!window.DungeonGrid.isInsideGrid(to, currentGridSize())) return false;
  if (!movementWalkableFor(fighter).has(positionKey(to))) return false;
  if (!canTraverseMovementEdge(fighter, from, to, path)) return false;
  if (window.DungeonGrid.isOccupied(to, state.fighters, fighter)) return false;
  return !path.some((step) => positionKey(step) === positionKey(to));
}

function findMovementPath(fighter, destination) {
  return findPath(fighter.position, destination, fighter, state.fighters, {
    gridSize: currentGridSize(),
    walkable: movementWalkableFor(fighter),
    canTraverse: (from, to, path) => canTraverseMovementEdge(fighter, from, to, path),
    stateKey: (position, path) => movementStateKey(fighter, position, path),
  });
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function moveFighterAlongPath(fighter, path, silent = false) {
  if (!fighter.alive || (state.mode === "combat" && fighter.movementLeft <= 0)) return false;
  if (!path || path.length === 0 || path.length > movementLimitFor(fighter)) return false;

  let previous = fighter.position;
  for (const step of path) {
    if (!isValidPathStep(fighter, previous, step, path.slice(0, path.indexOf(step)))) return false;
    previous = step;
  }

  movementInProgress = true;
  dragPath = null;
  render();

  let movedSteps = 0;
  for (const step of path) {
    const opportunityAttackers = Object.values(state.fighters).filter((candidate) => canOpportunityAttack(candidate, fighter, fighter.position, step));
    for (const attacker of opportunityAttackers) {
      opportunityAttack(attacker, fighter);
      if (!fighter.alive) break;
    }
    if (!fighter.alive) break;

    fighter.position = { ...step };
    movedSteps += 1;
    collectLootAtPosition(fighter, step);
    triggerTrapAtPosition(fighter, step);
    const usedPortal = triggerPortalAtPosition(fighter, fighter.position);
    const openedDoor = autoOpenAdjacentExplorationDoor(fighter);
    render();
    await sleep(tokenSlideMs);
    if (!fighter.alive) break;
    if (usedPortal) {
      movementInProgress = false;
      dragPath = null;
      render();
      break;
    }
    if (openedDoor && threatPresent()) break;
  }

  if (state.mode === "combat") {
    fighter.movementLeft -= movedSteps;
  }

  if (!silent) {
    const suffix = state.mode === "combat" ? ` ${fighter.movementLeft * feetPerSquare} ft remains.` : "";
    addLog(`${fighter.name} moves ${movedSteps * feetPerSquare} ft.${suffix}`);
  }

  movementInProgress = false;
  if (fighter.id === "hero" && checkDungeonCompletion()) return true;
  render();
  return true;
}

async function moveFighter(fighter, destination, silent = false) {
  const path = findMovementPath(fighter, destination);
  return moveFighterAlongPath(fighter, path, silent);
}

function handleTileClick(position) {
  const hero = state.fighters.hero;
  if (suppressNextTileClick) {
    suppressNextTileClick = false;
    return;
  }
  if (movementInProgress || dragPath) return;
  if (state.mode === "combat" && (activeFighter()?.id !== "hero" || combatMonsters().length === 0)) return;

  if (state.mode === "home" && isExitPosition(position) && distance(hero.position, position) <= 1) {
    showHomeMenu();
    return;
  }

  if (state.completed) return;

  const door = canOpenDoor(position);
  if (door) {
    openDoor(door);
    return;
  }

  if (state.mode === "exploration" && threatPresent()) {
    addLog("A hostile creature is present. Roll initiative before moving.");
    render();
    return;
  }

  if (hero.position.x !== position.x || hero.position.y !== position.y) {
    addLog(`Drag ${hero.name} through each square to move.`);
    render();
  }
}

function bestPathToward(mover, target) {
  const reachable = Array.from(
    reachableTiles(mover, state.fighters, {
      gridSize: currentGridSize(),
      walkable: currentWalkable(),
      canTraverse: (from, to, path) => canTraverseMovementEdge(mover, from, to, path),
      stateKey: (position, path) => movementStateKey(mover, position, path),
    }).entries(),
  ).map(([key, cost]) => {
    const [x, y] = key.split(",").map(Number);
    return { position: { x, y }, cost };
  });

  if (reachable.length === 0) return null;

  reachable.sort((a, b) => {
    const distanceDifference = distance(a.position, target.position) - distance(b.position, target.position);
    return distanceDifference || b.cost - a.cost;
  });

  return findMovementPath(mover, reachable[0].position);
}

function normalRangeSquares(fighter) {
  const range = damageProfile(fighter).range;
  return Math.max(1, Math.floor((range?.normal ?? range?.feet ?? 5) / feetPerSquare));
}

function roomWalkableSet(room) {
  const walkable = new Set((room?.cells ?? []).map(positionKey));
  blockingObjectKeys().forEach((tileKey) => walkable.delete(tileKey));
  return walkable;
}

function roomOnlyPath(mover, destination, room) {
  const walkable = roomWalkableSet(room);
  return findPath(mover.position, destination, mover, state.fighters, {
    gridSize: currentGridSize(),
    walkable,
    canTraverse: () => true,
  });
}

function bestRoomKitePath(mover, target) {
  const room = roomForPosition(mover.position);
  if (!room) return null;

  const range = normalRangeSquares(mover);
  const reachable = Array.from(
    reachableTiles(mover, state.fighters, {
      gridSize: currentGridSize(),
      walkable: roomWalkableSet(room),
      maxCost: mover.movementLeft,
      canTraverse: () => true,
    }).entries(),
  ).map(([key, cost]) => ({ position: positionFromKey(key), cost }));

  const current = { position: mover.position, cost: 0 };
  const candidates = [current, ...reachable].filter(
    (entry) => distance(entry.position, target.position) <= range && hasClearLineOfSight(entry.position, target.position),
  );
  const pool = candidates.length ? candidates : [current, ...reachable];
  if (pool.length === 0) return null;

  pool.sort((a, b) => {
    const distanceDifference = candidates.length
      ? distance(b.position, target.position) - distance(a.position, target.position)
      : distance(a.position, target.position) - distance(b.position, target.position);
    return distanceDifference || a.cost - b.cost;
  });

  if (positionKey(pool[0].position) === positionKey(mover.position)) return null;
  return roomOnlyPath(mover, pool[0].position, room);
}

async function runMonsterAi(monster) {
  const target = state.fighters.hero;
  if (!monster.alive || !target.alive) return;

  if (monster.behavior === "rangedKiter") {
    const path = bestRoomKitePath(monster, target);
    if (path) {
      await moveFighterAlongPath(monster, path, true);
      addLog(`${monster.name} repositions inside the room.`);
    }

    window.setTimeout(() => {
      if (activeFighter()?.id === monster.id && isInAttackRange(monster, target) && monster.hasAction) {
        makeAttack(monster, target);
      }

      window.setTimeout(() => {
        if (activeFighter()?.id === monster.id && state.fighters.hero.alive) {
          endTurn();
        }
      }, tokenSlideMs);
    }, tokenSlideMs);
    return;
  }

  if (monster.behavior === "melee") {
    if (!isAdjacent(monster, target)) {
      const path = bestPathToward(monster, target);
      if (path) {
        const before = { ...monster.position };
        await moveFighterAlongPath(monster, path, true);
        const movedSquares = path.length || distance(before, monster.position);
        addLog(`${monster.name} advances ${movedSquares * feetPerSquare} ft toward ${target.name}.`);
      }
    }

    window.setTimeout(() => {
      if (activeFighter()?.id === monster.id && isInAttackRange(monster, target) && monster.hasAction) {
        makeAttack(monster, target);
      }

      window.setTimeout(() => {
        if (activeFighter()?.id === monster.id && state.fighters.hero.alive) {
          endTurn();
        }
      }, tokenSlideMs);
    }, tokenSlideMs);
  }
}

function heroCanStartMovement() {
  if (!gameHasStarted || movementInProgress || state.completed) return false;
  if (state.mode === "combat") {
    return activeFighter()?.id === "hero" && combatMonsters().length > 0 && state.fighters.hero.movementLeft > 0;
  }
  return !threatPresent();
}

function heroCanUseDoor() {
  if (!gameHasStarted || movementInProgress || state.completed) return false;
  if (state.mode === "combat") {
    return activeFighter()?.id === "hero" && combatMonsters().length > 0;
  }
  return true;
}

function tryOpenDoorFromHeroPosition() {
  if (!heroCanUseDoor()) return false;

  const door = canOpenDoor(state.fighters.hero.position);
  return door ? openDoor(door) : false;
}

function tilePositionFromPoint(clientX, clientY) {
  const tileLayer = els.room.querySelector(".tile-layer");
  const rect = tileLayer?.getBoundingClientRect();
  if (!rect || clientX < rect.left || clientX >= rect.right || clientY < rect.top || clientY >= rect.bottom) return null;

  const tileSize = rect.width / currentGridSize();
  return {
    x: Math.floor((clientX - rect.left) / tileSize),
    y: Math.floor((clientY - rect.top) / tileSize),
  };
}

function autoPathSegment(fighter, from, to, path) {
  const pathGoal = { ...to };
  const segment = [];
  const queue = [{ position: from, steps: [] }];
  const visited = new Set([positionKey(from), ...path.map(positionKey)]);
  const maxExtraSteps = Math.max(0, movementLimitFor(fighter) - path.length);

  while (queue.length > 0) {
    const current = queue.shift();
    if (positionKey(current.position) === positionKey(pathGoal)) {
      return current.steps;
    }
    if (current.steps.length >= maxExtraSteps) continue;

    for (const next of window.DungeonGrid.neighbors(current.position, currentGridSize())) {
      const nextKey = positionKey(next);
      if (visited.has(nextKey) || !isValidPathStep(fighter, current.position, next, [...path, ...current.steps])) continue;
      visited.add(nextKey);
      queue.push({ position: next, steps: [...current.steps, next] });
    }
  }

  return [];
}

function extendDragPath(position) {
  const hero = state.fighters.hero;
  if (!dragPath || !position) return;

  const key = positionKey(position);
  const existingIndex = dragPath.findIndex((step) => positionKey(step) === key);
  if (existingIndex >= 0) {
    dragPath = dragPath.slice(0, existingIndex + 1);
    renderRoom();
    return;
  }

  const originKey = positionKey(hero.position);
  if (key === originKey) {
    dragPath = [];
    renderRoom();
    return;
  }

  if (dragPath.length >= movementLimitFor(hero)) return;

  const from = dragPath[dragPath.length - 1] ?? hero.position;
  if (!isValidPathStep(hero, from, position, dragPath)) {
    const segment = autoPathSegment(hero, from, position, dragPath);
    if (segment.length === 0) return;

    dragPath = [...dragPath, ...segment];
    renderRoom();
    return;
  }

  dragPath = [...dragPath, position];
  renderRoom();
}

async function finishDragPath() {
  const path = dragPath ?? [];
  dragPath = null;
  renderRoom();
  if (path.length === 0) {
    tryOpenDoorFromHeroPosition();
    return;
  }

  const moved = await moveFighterAlongPath(state.fighters.hero, path);
  if (!moved) {
    addLog(state.mode === "combat" ? "That path is out of reach or blocked." : "That path is blocked or not discovered yet.");
    render();
  }
}

function cancelDragPath() {
  dragPath = null;
  renderRoom();
}

function handleHeroPointerDown(event) {
  if (event.button !== 0) return;
  if (!gameHasStarted || movementInProgress) return;

  if (!heroCanStartMovement()) {
    tryOpenDoorFromHeroPosition();
    return;
  }

  event.preventDefault();
  dragPath = [];
  renderRoom();

  const handlePointerMove = (moveEvent) => {
    extendDragPath(tilePositionFromPoint(moveEvent.clientX, moveEvent.clientY));
  };

  const handlePointerUp = () => {
    document.removeEventListener("pointermove", handlePointerMove);
    document.removeEventListener("pointerup", handlePointerUp);
    document.removeEventListener("pointercancel", handlePointerCancel);
    finishDragPath();
  };

  const handlePointerCancel = () => {
    document.removeEventListener("pointermove", handlePointerMove);
    document.removeEventListener("pointerup", handlePointerUp);
    document.removeEventListener("pointercancel", handlePointerCancel);
    cancelDragPath();
  };

  document.addEventListener("pointermove", handlePointerMove);
  document.addEventListener("pointerup", handlePointerUp);
  document.addEventListener("pointercancel", handlePointerCancel);
  extendDragPath(tilePositionFromPoint(event.clientX, event.clientY));
}

function handleMapPanPointerDown(event) {
  if (event.button !== 0 || !gameHasStarted || movementInProgress || dragPath) return;
  if (event.target.closest(".token.hero, .chest-token, .topbar, button:not(.tile)")) return;
  if (isPointerOnRoomScrollbar(event)) return;

  mapPan = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    scrollLeft: els.roomScroll.scrollLeft,
    scrollTop: els.roomScroll.scrollTop,
    moved: false,
  };
  els.roomScroll.setPointerCapture?.(event.pointerId);
  els.roomScroll.classList.add("panning");
}

function isPointerOnRoomScrollbar(event) {
  const rect = els.roomScroll.getBoundingClientRect();
  const verticalScrollbarWidth = els.roomScroll.offsetWidth - els.roomScroll.clientWidth;
  const horizontalScrollbarHeight = els.roomScroll.offsetHeight - els.roomScroll.clientHeight;
  const onVertical = verticalScrollbarWidth > 0 && event.clientX >= rect.right - verticalScrollbarWidth;
  const onHorizontal = horizontalScrollbarHeight > 0 && event.clientY >= rect.bottom - horizontalScrollbarHeight;
  return onVertical || onHorizontal;
}

function handleMapPanPointerMove(event) {
  if (!mapPan || mapPan.pointerId !== event.pointerId) return;

  const deltaX = event.clientX - mapPan.startX;
  const deltaY = event.clientY - mapPan.startY;
  if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) mapPan.moved = true;
  els.roomScroll.scrollLeft = mapPan.scrollLeft - deltaX;
  els.roomScroll.scrollTop = mapPan.scrollTop - deltaY;
  event.preventDefault();
}

function finishMapPan(event) {
  if (!mapPan || mapPan.pointerId !== event.pointerId) return;
  if (mapPan.moved) {
    suppressNextTileClick = true;
    window.setTimeout(() => {
      suppressNextTileClick = false;
    }, 0);
  }
  els.roomScroll.releasePointerCapture?.(event.pointerId);
  els.roomScroll.classList.remove("panning");
  mapPan = null;
}

function createCombatantToken(combatant) {
  const token = document.createElement("div");
  token.className = `token ${combatant.id}`;
  token.dataset.combatant = combatant.id;
  token.title = combatant.name;

  if (combatant.id !== "hero") {
    const category = Math.max(1, Math.min(10, Number(monsterCategory(combatant)) || 1));

    token.classList.add("monster-token", `monster-category-${category}`);
    token.dataset.category = String(category);
    token.style.setProperty("--token-ring-color", monsterCategoryRingColor(combatant));
    token.title = `${combatant.name} - Category ${category}`;
  }

  const tokenArtPath = combatantTokenArt(combatant);

  const tokenImage = document.createElement("img");
  tokenImage.className = "token-art hidden";
  tokenImage.alt = combatant.name;
  tokenImage.draggable = false;

  const tokenLabel = document.createElement("span");
  tokenLabel.className = "token-label";
  tokenLabel.textContent = combatant.token;

  if (tokenArtPath) {
    tokenImage.src = tokenArtPath;

    tokenImage.addEventListener("load", () => {
      tokenImage.classList.remove("hidden");
      tokenLabel.classList.add("hidden");
      token.classList.add("has-token-art");
    });

    tokenImage.addEventListener("error", () => {
      tokenImage.removeAttribute("src");
      tokenImage.classList.add("hidden");
      tokenLabel.classList.remove("hidden");
      token.classList.remove("has-token-art");
    });
  }

  token.append(tokenImage, tokenLabel);

  const hpBar = document.createElement("div");
  hpBar.className = "token-hp";
  const hpFill = document.createElement("div");
  hpFill.className = "token-hp-fill";
  hpBar.append(hpFill);
  token.append(hpBar);

  token.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    const current = state.fighters[combatant.id];
    if (current && (current.id === "hero" || isKnownTile(current.position))) {
      showCombatantInfo(current);
    }
  });

  if (combatant.id === "hero") {
    token.addEventListener("pointerdown", handleHeroPointerDown);
  }

  return token;
}
function combatantTokenArt(fighter) {
  return fighter.tokenArt ?? fighter.tokenImage ?? fighter.art ?? "";
}

function ensureCombatantToken(fighter) {
  if (els.room.querySelector(`[data-combatant="${fighter.id}"]`)) return;
  els.room.querySelector(".token-layer")?.prepend(createCombatantToken(fighter));
}

function buildRoom() {
  els.room.innerHTML = "";
  const mapGridSize = currentGridSize();
  const scaledTileSizePx = currentTileSizePx();
  const roomSizePx = mapGridSize * scaledTileSizePx;
  const tokenSizePx = Math.round(scaledTileSizePx * 0.62);
  els.room.style.setProperty("--grid-size", mapGridSize);
  els.room.style.setProperty("--tile-size", `${scaledTileSizePx}px`);
  els.room.style.setProperty("--room-size", `${roomSizePx}px`);
  els.room.style.setProperty("--token-size", `${tokenSizePx}px`);
  els.room.style.setProperty("--token-slide-ms", `${tokenSlideMs}ms`);

  const tileLayer = document.createElement("div");
  tileLayer.className = "tile-layer";

  for (let y = 0; y < mapGridSize; y += 1) {
    for (let x = 0; x < mapGridSize; x += 1) {
      const tile = document.createElement("button");
      tile.className = "tile";
      tile.type = "button";
      tile.dataset.x = x;
      tile.dataset.y = y;
      tile.addEventListener("click", () => handleTileClick({ x, y }));
      tileLayer.append(tile);
    }
  }

  const tokenLayer = document.createElement("div");
  tokenLayer.className = "token-layer";

  for (const fighter of Object.values(state.fighters)) {
    tokenLayer.append(createCombatantToken(fighter));
  }

  const exitToken = document.createElement("div");
  exitToken.className = "exit-token";
  exitToken.dataset.exit = "dungeon";
  tokenLayer.append(exitToken);

  const chestToken = document.createElement("button");
  chestToken.className = "chest-token hidden";
  chestToken.type = "button";
  chestToken.title = "Home chest";
  chestToken.textContent = "C";
  const openChest = (event) => {
    event?.preventDefault();
    if (state.mode === "home" && distance(state.fighters.hero.position, homeChestPosition()) <= 1) {
      showInventoryMenu();
    }
  };
  const inspectChest = (event) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (state.mode === "home") {
      showHomeChestInfo();
    }
  };
  chestToken.addEventListener("click", openChest);
  chestToken.addEventListener("contextmenu", inspectChest);
  tokenLayer.append(chestToken);

  const lootLayer = document.createElement("div");
  lootLayer.className = "loot-layer";
  tokenLayer.append(lootLayer);

  const objectLayer = document.createElement("div");
  objectLayer.className = "object-layer";
  tokenLayer.append(objectLayer);

  els.room.append(tileLayer, tokenLayer);
  roomIsBuilt = true;
}

function renderLootPiles() {
  const lootLayer = els.room.querySelector(".loot-layer");
  if (!lootLayer) return;

  lootLayer.innerHTML = "";
  const scaledTileSizePx = currentTileSizePx();
  for (const pile of state.lootPiles ?? []) {
    if (!isKnownTile(pile.position)) continue;

    const token = document.createElement("div");
    token.className = "loot-token";
    token.title = "Loot pile";
    token.textContent = "$";
    token.style.left = `${(pile.position.x + 0.5) * scaledTileSizePx}px`;
    token.style.top = `${(pile.position.y + 0.5) * scaledTileSizePx}px`;
    lootLayer.append(token);
  }
}

function renderDungeonObjects() {
  const objectLayer = els.room.querySelector(".object-layer");
  if (!objectLayer) return;

  checkTrapDetectionOnReveal();
  objectLayer.innerHTML = "";
  const scaledTileSizePx = currentTileSizePx();
  for (const object of state.dungeonObjects ?? []) {
    if (!objectCells(object).some(isKnownTile)) continue;
    const template = objectTemplate(object.type);
    if (!template) continue;
    if (objectIsTrap(object) && !object.detected && !object.spent && !object.disarmed) continue;

    const element = document.createElement("button");
    element.className = `dungeon-object ${object.type}${object.spent ? " spent" : ""}${object.disarmed ? " disarmed" : ""}${object.detected ? " detected" : ""}`;
    element.type = "button";
    element.title = template.name;
    const objectSymbols = {
      table: "T",
      trap: "!",
      portal: "P",
      chest: "C",
      bigRock: "R",
    };

element.textContent = objectSymbols[object.type] ?? (objectIsTrap(object) ? "!" : "?");
    element.style.left = `${object.position.x * scaledTileSizePx}px`;
    element.style.top = `${object.position.y * scaledTileSizePx}px`;
    element.style.width = `${(object.width ?? template.width) * scaledTileSizePx}px`;
    element.style.height = `${(object.height ?? template.height) * scaledTileSizePx}px`;
    element.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      event.stopPropagation();
      showDungeonObjectInfo(object);
    });
    objectLayer.append(element);
  }
}

function placeExitToken() {
  const token = els.room.querySelector("[data-exit='dungeon']");
  if (!token || !state.exit?.position) return;

  const scaledTileSizePx = currentTileSizePx();
  token.title = state.mode === "home" ? "Home door" : "Dungeon exit";
  token.textContent = state.mode === "home" ? "H" : "E";
  token.style.left = `${(state.exit.position.x + 0.5) * scaledTileSizePx}px`;
  token.style.top = `${(state.exit.position.y + 0.5) * scaledTileSizePx}px`;
  token.classList.toggle("hidden", state.completed || !isKnownTile(state.exit.position));
}

function homeChestPosition() {
  return { x: 4, y: 0 };
}

function placeHomeChestToken() {
  const token = els.room.querySelector(".chest-token");
  if (!token) return;
  token.classList.toggle("hidden", state.mode !== "home");
  if (state.mode !== "home") return;

  const position = homeChestPosition();
  const scaledTileSizePx = currentTileSizePx();
  token.style.left = `${(position.x + 0.5) * scaledTileSizePx}px`;
  token.style.top = `${(position.y + 0.5) * scaledTileSizePx}px`;
}

function placeToken(fighter) {
  ensureCombatantToken(fighter);
  const token = els.room.querySelector(`[data-combatant="${fighter.id}"]`);
  if (!token) return;

  const scaledTileSizePx = currentTileSizePx();
  token.style.left = `${(fighter.position.x + 0.5) * scaledTileSizePx}px`;
  token.style.top = `${(fighter.position.y + 0.5) * scaledTileSizePx}px`;
  token.classList.toggle("hidden", !fighter.alive || (fighter.id !== "hero" && !isKnownTile(fighter.position)));
  token.classList.toggle("defeated", !fighter.alive);
  token.classList.toggle("dragging", fighter.id === "hero" && Boolean(dragPath));
  const hpFill = token.querySelector(".token-hp-fill");
  if (hpFill) {
    const hpPercent = Math.max(0, Math.round((fighter.hp / fighter.maxHp) * 100));
    hpFill.style.width = `${hpPercent}%`;
  }
}

function renderRoom() {
  if (!roomIsBuilt) buildRoom();

  const mapGridSize = currentGridSize();
  const scaledTileSizePx = currentTileSizePx();
  els.room.style.setProperty("--grid-size", mapGridSize);
  els.room.style.setProperty("--tile-size", `${scaledTileSizePx}px`);
  els.room.style.setProperty("--room-size", `${mapGridSize * scaledTileSizePx}px`);
  els.room.style.setProperty("--token-size", `${Math.round(scaledTileSizePx * 0.62)}px`);
  els.room.style.setProperty("--token-slide-ms", `${tokenSlideMs}ms`);

  const hero = state.fighters.hero;
  const heroTurn = state.mode === "combat" && activeFighter()?.id === "hero" && combatMonsters().length > 0;
  const walkable = currentWalkable();
  const doorKeys = new Set((state.dungeon?.doors ?? []).map(positionKey));
  const openedDoorKeys = new Set(state.exploration?.openedDoorKeys ?? []);
  const visibleWalls = exposedWallKeys();
  const reachable = heroTurn
      ? reachableTiles(hero, state.fighters, {
          gridSize: currentGridSize(),
          walkable,
          canTraverse: (from, to, path) => canTraverseMovementEdge(hero, from, to, path),
          stateKey: (position, path) => movementStateKey(hero, position, path),
        })
      : state.mode === "exploration"
        ? reachableTiles(hero, state.fighters, {
            gridSize: currentGridSize(),
            walkable: visibleWalkable(),
            maxCost: currentGridSize() * currentGridSize(),
            canTraverse: (from, to, path) => canTraverseMovementEdge(hero, from, to, path),
            stateKey: (position, path) => movementStateKey(hero, position, path),
          })
        : new Map();

  els.room.querySelectorAll(".tile").forEach((tile) => {
    const position = { x: Number(tile.dataset.x), y: Number(tile.dataset.y) };
    const key = positionKey(position);
    const isReachable = reachable.has(key);
    const isWalkable = walkable.has(key);
    const door = doorAt(position);
    const isDoor = doorKeys.has(key);
    const isKnown = isKnownTile(position);
    const isSeenWall = !isWalkable && visibleWalls.has(key);
    const pathIndex = dragPath?.findIndex((step) => positionKey(step) === key) ?? -1;
    tile.classList.toggle("walkable", isWalkable && isKnown);
    tile.classList.toggle("hidden-tile", !isKnown && !isSeenWall);
    tile.classList.toggle("seen-wall", isSeenWall);
    tile.classList.toggle("door", isDoor && isKnown);
    tile.classList.toggle("door-north", isDoor && isKnown && door?.corridor?.y < position.y);
    tile.classList.toggle("door-east", isDoor && isKnown && door?.corridor?.x > position.x);
    tile.classList.toggle("door-south", isDoor && isKnown && door?.corridor?.y > position.y);
    tile.classList.toggle("door-west", isDoor && isKnown && door?.corridor?.x < position.x);
    tile.classList.toggle("open-door", isKnown && openedDoorKeys.has(key));
    tile.classList.toggle("reachable", isReachable);
    tile.classList.toggle("path-preview", pathIndex >= 0);
    tile.textContent = pathIndex >= 0 ? String(pathIndex + 1) : "";
    const openableDoor = Boolean(canOpenDoor(position));
    tile.classList.toggle("openable-door", openableDoor);
    tile.disabled = ((!isReachable && !openableDoor) || !isKnown) && !dragPath;
    tile.title = openableDoor ? "Open door" : isReachable ? `${reachable.get(key) * feetPerSquare} ft` : "";
  });

  Object.values(state.fighters).forEach(placeToken);
  placeExitToken();
  placeHomeChestToken();
  renderLootPiles();
  renderDungeonObjects();
}

function renderHeroStatusCard(element, fighter) {
  refreshDerivedStats(fighter);
  const hpPercent = Math.max(0, Math.round((fighter.hp / fighter.maxHp) * 100));
  const weapon = activeWeapon(fighter);
  const armor = equippedItem(fighter, "torso");
  element.innerHTML = `
    <div class="fighter-top">
      <div>
        <div class="fighter-name">${fighter.name}</div>
        <div class="fighter-role">${escapeHtml(combatantRoleLabel(fighter))}</div>
      </div>
      <div class="card-actions">
        <button class="icon-button open-inventory" type="button" title="Inventory and equipment" aria-label="Inventory and equipment">I</button>
        <button class="icon-button rename-hero" type="button" title="Rename character" aria-label="Rename character">...</button>
      </div>
    </div>
    <div class="hp-line">
      <div class="hp-text"><span>HP</span><span>${fighter.hp} / ${fighter.maxHp}</span></div>
      <div class="hp-bar"><div class="hp-fill" style="width: ${hpPercent}%"></div></div>
    </div>
    <div class="loadout-line">
      <span>AC ${fighter.ac}</span>
      <span>${escapeHtml(weapon?.name ?? "Unarmed")} / ${escapeHtml(armor?.name ?? "No armor")}</span>
    </div>
    <div class="status-line">
      ${fighter.dodging ? '<span class="status-pill status-dodge">Dodging</span>' : ""}
      ${fighter.disengaged ? '<span class="status-pill status-disengage">Disengaged</span>' : ""}
    </div>
    <div class="wallet-line">XP: ${fighter.xp ?? 0} / ${xpForNextLevel(fighter.level ?? 1)} - Hit Dice: ${fighter.hitDiceRemaining ?? 0}/${fighter.level ?? 1} - Rests: ${state.shortRestsUsed ?? 0}/${state.shortRestLimit ?? 3} - Inventory: ${escapeHtml(moneyText(fighter.inventory.money))} - Hero Tokens: ${fighter.inventory.heroTokens ?? 0}</div>
  `;

  element.querySelector(".rename-hero").addEventListener("click", renameHero);
  element.querySelector(".open-inventory").addEventListener("click", showInventoryMenu);
}

async function renameHero() {
  const currentName = state.fighters.hero.name;
  const nextName = await showGameDialog({
    title: "Character Name",
    message: "Rename your adventurer.",
    input: { label: "Character name", value: currentName, maxLength: 32 },
    confirmText: "Rename",
  });
  if (!nextName) return;

  state.fighters.hero.name = nextName.slice(0, 32);
  state.fighters.hero.token = tokenFromName(state.fighters.hero.name, state.fighters.hero.token);
  addLog(`Character renamed to ${state.fighters.hero.name}.`, "important");
  render();
}

function showCombatantInfo(fighter) {
  refreshDerivedStats(fighter);
  const hpPercent = Math.max(0, Math.round((fighter.hp / fighter.maxHp) * 100));
  const weapon = activeWeapon(fighter);
  const range = weapon?.range ? `${weapon.range.kind}${weapon.range.feet ? ` ${weapon.range.feet} ft` : ""}` : "melee 5 ft";
  const abilities = ["str", "dex", "con", "int", "wis", "cha"];
  els.fighterInfoName.textContent = fighter.name;
  els.fighterInfoBody.innerHTML = `
    <div class="fighter-role">${escapeHtml(combatantRoleLabel(fighter))}</div>
    <div class="hp-line">
      <div class="hp-text"><span>HP</span><span>${fighter.hp} / ${fighter.maxHp}</span></div>
      <div class="hp-bar"><div class="hp-fill" style="width: ${hpPercent}%"></div></div>
    </div>
    <div class="stat-grid">
      <div class="stat-pill"><b>${fighter.ac}</b><span>AC</span></div>
      <div class="stat-pill"><b>${abilityLabel(attackBonus(fighter))}</b><span>Attack</span></div>
      <div class="stat-pill"><b>${fighter.damage.label}</b><span>Damage</span></div>
      <div class="stat-pill"><b>${fighter.speedFeet} ft</b><span>Speed</span></div>
      <div class="stat-pill"><b>${fighter.movementLeft * feetPerSquare} ft</b><span>Move Left</span></div>
      <div class="stat-pill"><b>${abilityLabel(fighter.initiativeBonus)}</b><span>Init</span></div>
      <div class="stat-pill"><b>${fighter.hasAction ? "Yes" : "No"}</b><span>Action</span></div>
      <div class="stat-pill"><b>${fighter.hasBonusAction ? "Yes" : "No"}</b><span>Bonus</span></div>
      <div class="stat-pill"><b>${fighter.alive ? "Yes" : "No"}</b><span>Alive</span></div>
      <div class="stat-pill"><b>${fighter.level ?? 1}</b><span>Level</span></div>
      <div class="stat-pill"><b>${fighter.xp ?? 0}</b><span>XP</span></div>
    </div>
    <div class="stat-grid ability-grid">
      ${abilities
        .map(
          (ability) => `
            <div class="stat-pill">
              <b>${abilityScore(fighter, ability)}</b>
              <span>${ability.toUpperCase()} ${abilityLabel(abilityMod(fighter, ability))}</span>
            </div>
          `,
        )
        .join("")}
    </div>
    <div class="equipment-summary">
      <div><b>Weapon</b><span>${escapeHtml(weapon?.name ?? "Unarmed")}</span></div>
      <div><b>Damage</b><span>${escapeHtml(fighter.damage.label)}</span></div>
      <div><b>Range</b><span>${escapeHtml(range)}</span></div>
    </div>
    <div class="wallet-line">Money: ${escapeHtml(moneyText(fighter.inventory.money))} - Hero Tokens: ${fighter.inventory.heroTokens ?? 0}</div>
  `;
  els.fighterInfo.classList.remove("hidden");
}

function showDungeonObjectInfo(object) {
  const template =
    object.type === "homeChest"
      ? { name: "Home Chest", kind: "container", width: 1, height: 1, blocksMovement: true, interactable: true, description: "Your home storage chest." }
      : objectTemplate(object.type);
  if (!template) return;
  const hero = state.fighters.hero;
  const objectAdjacent = object.type === "homeChest" ? distance(hero.position, homeChestPosition()) <= 1 : objectCells(object).some((cell) => distance(hero.position, cell) === 1);
  const canLootChest = object.type === "chest" && state.mode !== "combat" && objectAdjacent;
  const isHomeChest = object.type === "homeChest";
  const canDisarm =
    state.mode !== "combat" &&
    objectAdjacent &&
    ((objectIsTrap(object) && object.detected && object.armed !== false && !object.disarmed) ||
      (object.type === "chest" && object.trap?.detected && !object.trap.disarmAttempted));
  const canInvestigate = state.mode !== "combat" && template.kind === "furniture" && objectAdjacent && !object.investigated;
  const chestItems = object.type === "chest" || isHomeChest ? object.items ?? [] : [];

  els.fighterInfoName.textContent = template.name;
  els.fighterInfoBody.innerHTML = `
    <div class="fighter-role">${escapeHtml(template.kind)}</div>
    <p class="empty-note">${escapeHtml(template.description)}</p>
    ${object.lastResult ? `<p class="object-result">${escapeHtml(object.lastResult)}</p>` : ""}
    <div class="stat-grid">
      <div class="stat-pill"><b>${object.width ?? template.width}x${object.height ?? template.height}</b><span>Size</span></div>
      <div class="stat-pill"><b>${template.blocksMovement ? "No" : "Yes"}</b><span>Crossable</span></div>
      <div class="stat-pill"><b>${template.interactable ? "Yes" : "No"}</b><span>Interactable</span></div>
      ${objectIsTrap(object) ? `<div class="stat-pill"><b>${object.armed === false ? "Spent" : "Armed"}</b><span>State</span></div>` : ""}
      ${objectIsTrap(object) ? `<div class="stat-pill"><b>${object.spotDc ?? 12}</b><span>Spot DC</span></div>` : ""}
      ${objectIsTrap(object) ? `<div class="stat-pill"><b>${object.detected ? "Spotted" : "Hidden"}</b><span>Detection</span></div>` : ""}
      ${object.type === "chest" && object.trap?.detected ? `<div class="stat-pill"><b>${object.trap.spotDc ?? 12}</b><span>Trap DC</span></div>` : ""}
    </div>
    ${
      template.kind === "furniture"
        ? `<button type="button" data-action="investigate-object" data-object="${escapeAttribute(object.id)}" ${canInvestigate ? "" : "disabled"}>${
            object.investigated ? "Investigated" : "Investigate"
          }</button>`
        : ""
    }
    ${
      objectIsTrap(object)
        ? `<button type="button" data-action="disarm-trap" data-object="${escapeAttribute(object.id)}" ${canDisarm ? "" : "disabled"}>Disarm</button>`
        : ""
    }
    ${
      object.type === "chest"
        ? `
          ${
            object.trap?.detected
              ? `<button type="button" data-action="disarm-trap" data-object="${escapeAttribute(object.id)}" ${canDisarm ? "" : "disabled"}>Disarm ${escapeHtml(
                  object.trap.name,
                )}</button>`
              : ""
          }
          <section class="object-inventory">
            <h3>Contents</h3>
            ${
              chestItems.length
                ? chestItems
                    .map(
                      (item) => `
                        <div class="object-inventory-row">
                          <div>
                            <b>${escapeHtml(item.name)}</b>
                            <span>${escapeHtml(itemDetails(item))}</span>
                          </div>
                          <button type="button" data-action="take-object-item" data-object="${escapeAttribute(object.id)}" data-item="${escapeAttribute(item.id)}" ${
                            canLootChest ? "" : "disabled"
                          }>Add to Bag</button>
                        </div>
                      `,
                    )
                    .join("")
                : `<p class="empty-note">Empty.</p>`
            }
          </section>
        `
        : ""
    }
    ${
      isHomeChest
        ? `
          <section class="object-inventory">
            <h3>Stored Coins</h3>
            <div class="chest-money">
              <div><b>Carried Coins</b><span>${escapeHtml(moneyText(hero.inventory.money))}</span></div>
              <div><b>Chest Coins</b><span>${escapeHtml(moneyText(state.chestMoney ?? {}))}</span></div>
              <div class="chest-coin-fields" aria-label="Coin amount">
                <label><span>CP</span><input type="number" inputmode="numeric" min="0" step="1" value="0" data-home-coin-input="cp" /></label>
                <label><span>SP</span><input type="number" inputmode="numeric" min="0" step="1" value="0" data-home-coin-input="sp" /></label>
                <label><span>GP</span><input type="number" inputmode="numeric" min="0" step="1" value="0" data-home-coin-input="gp" /></label>
              </div>
              <p class="chest-money-error" aria-live="polite"></p>
              <div class="chest-money-actions">
                <button type="button" data-action="home-deposit-custom-coins">Deposit</button>
                <button type="button" data-action="home-withdraw-custom-coins">Withdraw</button>
              </div>
            </div>
          </section>
          <section class="object-inventory">
            <h3>Bag</h3>
            ${
              unequippedInventoryItems(hero).length
                ? unequippedInventoryItems(hero)
                    .map(
                      (item) => `
                        <div class="object-inventory-row">
                          <div><b>${escapeHtml(item.name)}</b><span>${escapeHtml(itemDetails(item))}</span></div>
                          <button type="button" data-action="home-store-item" data-item="${escapeAttribute(item.id)}">Store</button>
                        </div>
                      `,
                    )
                    .join("")
                : `<p class="empty-note">No carried bag items.</p>`
            }
          </section>
          <section class="object-inventory">
            <h3>Chest Contents</h3>
            ${
              chestItems.length
                ? chestItems
                    .map(
                      (item) => `
                        <div class="object-inventory-row">
                          <div><b>${escapeHtml(item.name)}</b><span>${escapeHtml(itemDetails(item))}</span></div>
                          <button type="button" data-action="take-object-item" data-object="home-chest" data-item="${escapeAttribute(item.id)}">Add to Bag</button>
                        </div>
                      `,
                    )
                    .join("")
                : `<p class="empty-note">Empty.</p>`
            }
          </section>
        `
        : ""
    }
  `;
  els.fighterInfo.classList.remove("hidden");
}

function dungeonObjectForId(objectId) {
  return (state.dungeonObjects ?? []).find((object) => object.id === objectId) ?? null;
}

function triggerChestTrap(chest) {
  const trap = chest.trap;
  const hero = state.fighters.hero;
  if (!trap) return false;

  const damageRoll = rollDice(trap.damage.count ?? 1, trap.damage.sides ?? 4);
  const rawDamage = damageRoll.total + (trap.damage.bonus ?? 0);
  const modified = calculateDamageModifiers(hero, rawDamage, trap.damage.type);
  hero.hp = Math.max(0, hero.hp - modified.damage);
  hero.alive = hero.hp > 0;
  playSoundEffect("characterDamage");
  chest.lastResult = `${hero.name} triggered ${trap.name} for ${modified.damage} ${trap.damage.type ?? "damage"} damage (${damageRoll.rolls.join(" + ")}).`;
  const adjustmentNote = modified.reason ? ` ${hero.name} is ${modified.reason} to ${trap.damage.type} damage.` : "";
  addLog(`${hero.name} triggers ${trap.name} for ${modified.damage} ${trap.damage.type ?? "damage"} damage (${damageRoll.rolls.join(" + ")}).${adjustmentNote}`, "damage");
  if (!hero.alive) {
    addLog(`${hero.name} drops to 0 HP.`, "important");
    handleHeroDeath();
  }
  delete chest.trap;
  return true;
}

function homeChestObject() {
  return {
    id: "home-chest",
    type: "homeChest",
    position: homeChestPosition(),
    items: state.chest ?? [],
  };
}

function showHomeChestInfo() {
  showDungeonObjectInfo(homeChestObject());
}

function takeObjectItem(objectId, itemId) {
  if (objectId === "home-chest") {
    moveChestItemToInventory(itemId);
    showHomeChestInfo();
    return;
  }

  const object = dungeonObjectForId(objectId);
  if (!object || object.type !== "chest") return;
  const hero = state.fighters.hero;
  if (state.mode === "combat" || !objectCells(object).some((cell) => distance(hero.position, cell) === 1)) {
    addLog(`${hero.name} needs to be out of combat and next to the chest to loot it.`);
    renderLog();
    return;
  }

  if (object.trap) {
    triggerChestTrap(object);
    render();
    showDungeonObjectInfo(object);
    return;
  }

  const item = (object.items ?? []).find((entry) => entry.id === itemId);
  if (!item) return;

  object.items = (object.items ?? []).filter((entry) => entry.id !== itemId);
  addItemToInventory(hero, item, "object-stack");
  addLog(`${hero.name} takes ${item.name} from the chest.`, "important");
  render();
  showDungeonObjectInfo(object);
}

function storeHomeChestItem(itemId) {
  moveInventoryItemToChest(itemId);
  showHomeChestInfo();
}

function disarmTrap(objectId) {
  const object = dungeonObjectForId(objectId);
  const hero = state.fighters.hero;
  if (!object || state.mode === "combat" || !objectCells(object).some((cell) => distance(hero.position, cell) === 1)) return;

  const trap = object.type === "chest" ? object.trap : object;
  if (!trap || !trap.detected || trap.armed === false || trap.disarmed) return;

  const roll = rollDie(20);
  const bonus = abilityMod(hero, "int");
  const total = roll + bonus;
  const dc = trap.spotDc ?? 12;
  if (trap.disarmAttempted) return;
  trap.disarmAttempted = true;
  const attemptText = `${hero.name} attempts to disarm the trap: INT ${roll} ${abilityLabel(bonus)} = ${total} vs DC ${dc}.`;
  object.lastResult = attemptText;
  addLog(attemptText, "important");
  if (total >= dc) {
    if (object.type === "chest") {
      delete object.trap;
    } else {
      trap.disarmed = true;
      trap.armed = false;
      trap.spent = false;
    }
    object.lastResult += " The trap is disarmed.";
    addLog("The trap is disarmed.", "important");
  } else {
    object.lastResult += " The trap remains armed.";
    addLog("The trap remains armed.");
  }
  render();
  showDungeonObjectInfo(object);
}

function nearestOpenCellAroundObject(object) {
  const startCells = objectCells(object);
  const walkable = currentWalkable();
  const queue = startCells.flatMap((cell) => adjacentCells(cell).map((position) => ({ position, distance: 1 })));
  const visited = new Set(startCells.map(positionKey));

  while (queue.length > 0) {
    const current = queue.shift();
    const key = positionKey(current.position);
    if (visited.has(key)) continue;
    visited.add(key);

    if (
      walkable.has(key) &&
      !window.DungeonGrid.isOccupied(current.position, state.fighters) &&
      window.DungeonGrid.isInsideGrid(current.position, currentGridSize())
    ) {
      return current.position;
    }

    for (const next of adjacentCells(current.position)) {
      const nextKey = positionKey(next);
      if (!visited.has(nextKey) && window.DungeonGrid.isInsideGrid(next, currentGridSize())) {
        queue.push({ position: next, distance: current.distance + 1 });
      }
    }
  }

  return null;
}

function spawnInvestigationAmbush(object) {
  const position = nearestOpenCellAroundObject(object);
  if (!position) {
    addLog("Something stirs nearby, but there is no space for it to emerge.");
    object.lastResult = "Something stirs nearby, but there is no space for it to emerge.";
    return null;
  }

  const monsterTemplate = getMonsterTemplate(pickWeightedMonsterId(weightedMonsterIdsForHero(state.fighters.hero)));
  const monster = createCombatant({
    ...monsterTemplate,
    id: `ambush-${Date.now()}`,
    name: `${monsterTemplate.name} Ambusher`,
    position,
  });
  applyMonsterCategoryScaling(monster, state.fighters.hero);
  monster.roomId = roomForPosition(position)?.id ?? "ambush";
  state.fighters[monster.id] = monster;
  addLog(`${monster.name} bursts from hiding near the furniture.`, "important");
  object.lastResult = `${monster.name} bursts from hiding near the furniture.`;
  return monster;
}

function investigateObject(objectId) {
  const object = dungeonObjectForId(objectId);
  const hero = state.fighters.hero;
  const template = object ? objectTemplate(object.type) : null;
  if (!object || template?.kind !== "furniture" || object.investigated || state.mode === "combat") return;
  if (!objectCells(object).some((cell) => distance(hero.position, cell) === 1)) return;

  object.investigated = true;
  const roll = rollDie(20);
  const bonus = abilityMod(hero, "int");
  const total = roll + bonus;
  const checkText = `${hero.name} investigates ${template.name}: INT ${roll} ${abilityLabel(bonus)} = ${total} vs DC 13.`;
  object.lastResult = checkText;
  addLog(checkText, "important");

  if (roll === 1) {
    spawnInvestigationAmbush(object);
  } else if (total >= 13 && Math.random() < 0.5) {
    if (Math.random() < 0.5) {
      const potion = createItemInstance("potion-healing", "found");
      if (potion) {
        addItemToInventory(hero, potion, "found-stack");
        object.lastResult += ` Found ${potion.name}.`;
        addLog(`${hero.name} finds ${potion.name}.`, "important");
      }
    } else {
      const coins = rollDie(10);
      addMoney(hero.inventory.money, coins);
      object.lastResult += ` Found ${moneyText(cpToMoney(coins))}.`;
      addLog(`${hero.name} finds ${moneyText(cpToMoney(coins))}.`, "important");
    }
  } else {
    object.lastResult += " Found nothing out of the ordinary.";
    addLog(`${hero.name} finds nothing out of the ordinary.`);
  }

  render();
  showDungeonObjectInfo(object);
}

function hideFighterInfo() {
  els.fighterInfo.classList.add("hidden");
}

function moneyText(money) {
  const totalCp = moneyToCp(money);
  if (totalCp === 0) return "0 gp";
  const parts = [];
  const normalized = normalizeMoney(money);
  if (normalized.gp) parts.push(`${normalized.gp} gp`);
  if (normalized.sp) parts.push(`${normalized.sp} sp`);
  if (normalized.cp) parts.push(`${normalized.cp} cp`);
  return parts.join(", ");
}

function priceText(cpAmount) {
  return moneyText(cpToMoney(cpAmount));
}

function itemDetails(item) {
  if (!item) return "Empty";
  const cost = item.cost?.text ? `; ${item.cost.text}` : "";
  const weight = item.weightLb || item.weightLb === 0 ? `; ${item.weightLb} lb.` : "";
  if (item.type === "weapon") {
    const ability = attackAbilityForWeapon(item);
    const bonus = abilityMod(state.fighters.hero, ability);
    const damage = formatDamage({ ...item.damage, bonus });
    const range = item.range ? `${item.range.kind}${item.range.feet ? ` ${item.range.feet} ft` : ""}` : "melee";
    const propertyText = item.properties?.length ? `; ${item.properties.join(", ")}` : "";
    return `${damage}, ${range}${propertyText}${cost}${weight}`;
  }
  if (item.type === "armor") {
    const ac = item.armor?.bonus ? `+${item.armor.bonus} AC` : `AC ${item.armor?.base ?? "?"}`;
    const req = item.requirements?.strength ? `; Str ${item.requirements.strength}` : "";
    const stealth = item.stealthDisadvantage ? "; stealth disadvantage" : "";
    return `${ac}${req}${stealth}${cost}${weight}`;
  }
  if (item.type === "ammunition") {
    return `${item.ammo?.quantity ?? 0} ${item.ammo?.kind ?? "ammo"}${cost}${weight}`;
  }
  if (item.type === "consumable") {
    if (item.use?.kind === "healing") {
      return `${item.use.dice.count}d${item.use.dice.sides} + ${item.use.bonus} HP; ${item.use.resource === "bonusAction" ? "bonus action" : "action"}${cost}${weight}`;
    }
    return `${item.category ?? "Consumable"}; ${item.use?.resource === "bonusAction" ? "bonus action" : "action"}${cost}${weight}`;
  }
  return item.type ?? "Item";
}

function itemCategoryLabel(item) {
  const type = item.type ? item.type[0].toUpperCase() + item.type.slice(1) : "Item";
  return item.category ? `${type} - ${item.category}` : type;
}

function searchableItemText(item) {
  return [
    item.name,
    item.type,
    item.category,
    item.weaponRange,
    item.ammo?.kind,
    item.armor?.base,
    item.armor?.bonus,
    ...(item.properties ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function adminCatalogItems() {
  const query = inventoryAdminSearch.trim().toLowerCase();
  return window.DungeonContent.list("items")
    .filter((item) => !query || searchableItemText(item).includes(query))
    .sort((a, b) => itemCategoryLabel(a).localeCompare(itemCategoryLabel(b)) || a.name.localeCompare(b.name));
}

function renderAdminItemCatalog() {
  if (!inventoryAdminOpen) return "";

  const items = adminCatalogItems();
  const groups = new Map();
  for (const item of items) {
    const category = itemCategoryLabel(item);
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(item);
  }

  const groupMarkup = Array.from(groups.entries())
    .map(
      ([category, groupItems]) => `
        <details class="admin-item-group" open>
          <summary>${escapeHtml(category)} <span>${groupItems.length}</span></summary>
          <div class="admin-item-grid">
            ${groupItems
              .map(
                (item) => `
                  <div class="admin-item-card">
                    ${draggableItemCard(item, "admin")}
                    <button type="button" data-action="add-admin-item" data-item="${item.id}">Add to Bag</button>
                  </div>
                `,
              )
              .join("")}
          </div>
        </details>
      `,
    )
    .join("");

  return `
    <section class="admin-catalog" data-drop-admin-trash="true" aria-label="Admin item catalogue">
      <div class="admin-catalog-top">
        <label for="admin-item-search">Item Vault</label>
        <input id="admin-item-search" type="search" placeholder="Search items" value="${escapeAttribute(inventoryAdminSearch)}" />
      </div>
      <div class="admin-coin-row" aria-label="Admin coins">
        <button type="button" data-action="add-admin-coins" data-cp="100">+1 gp</button>
        <button type="button" data-action="add-admin-coins" data-cp="1000">+10 gp</button>
        <button type="button" data-action="add-admin-coins" data-cp="10000">+100 gp</button>
        <button type="button" data-action="add-admin-coins" data-cp="100000">+1000 gp</button>
      </div>
      <div class="admin-coin-row" aria-label="Admin experience">
        <button type="button" data-action="add-admin-xp" data-xp="50">+50 XP</button>
        <button type="button" data-action="add-admin-xp" data-xp="300">+300 XP</button>
        <button type="button" data-action="add-admin-xp" data-xp="1000">+1000 XP</button>
      </div>
      <div class="admin-trash">Drop carried or equipped items here to delete them.</div>
      ${groupMarkup || `<p class="empty-note">No matching items.</p>`}
    </section>
  `;
}

function addAdminCoins(cpAmount) {
  addMoney(state.fighters.hero.inventory.money, cpAmount);
  addLog(`Added ${moneyText(cpToMoney(cpAmount))}.`, "important");
  render();
  renderInventoryMenu();
}

function addAdminXp(xpAmount) {
  const hero = state.fighters.hero;
  hero.xp = (hero.xp ?? 0) + xpAmount;
  addLog(`Added ${xpAmount} XP to ${hero.name}.`, "important");
  render();
  renderInventoryMenu();
}

function createAdminInventoryItem(templateId) {
  return createItemInstance(templateId, "admin");
}

function addAdminItemToInventory(templateId) {
  const hero = state.fighters.hero;
  const item = createAdminInventoryItem(templateId);
  if (!item) return;

  addItemToInventory(hero, item, "admin-stack");
  addLog(`Added ${item.name} to inventory.`, "important");
  render();
  renderInventoryMenu();
}

function addAdminItemToSlot(templateId, slotId) {
  const hero = state.fighters.hero;
  const item = createAdminInventoryItem(templateId);
  if (!item || !itemCanEquipInSlot(hero, item, slotId)) return;

  const addedItems = addItemToInventory(hero, item, "admin-stack");
  addLog(`Added ${item.name} to ${equipmentSlots.find((slot) => slot.id === slotId)?.label ?? "equipment"}.`, "important");
  equipItem(addedItems[0]?.id ?? item.id, slotId);
}

function equipActionForItem(fighter, item) {
  const usableSlots = equipmentSlots.filter((slot) => itemCanUseSlot(item, slot.id));
  if (!usableSlots.length) return "";

  return usableSlots
    .map((slot) => {
      const disabledReason =
        slot.id === "torso" && !armorStrengthRequirementMet(fighter, item)
          ? `Requires STR ${item.requirements.strength}`
          : "";
      return disabledReason
        ? `<button type="button" disabled>${disabledReason}</button>`
        : `<button type="button" data-action="equip" data-item="${item.id}" data-slot="${slot.id}">${slot.label}</button>`;
    })
    .join("");
}

function removeInventoryItem(itemId) {
  const hero = state.fighters.hero;
  const item = itemForId(hero, itemId);
  if (!item) return;

  for (const slot of equipmentSlots) {
    if (hero.equipment[slot.id] === itemId) {
      hero.equipment[slot.id] = null;
    }
  }
  hero.inventory.items = hero.inventory.items.filter((entry) => entry.id !== itemId);
  addLog(`Deleted ${item.name} from inventory.`, "important");
  refreshDerivedStats(hero);
  render();
  renderInventoryMenu();
}

function moveInventoryItemToChest(itemId) {
  if (state.mode !== "home") return;
  const hero = state.fighters.hero;
  const item = itemForId(hero, itemId);
  if (!item) return;

  for (const slot of equipmentSlots) {
    if (hero.equipment[slot.id] === itemId) {
      hero.equipment[slot.id] = null;
    }
  }
  hero.inventory.items = hero.inventory.items.filter((entry) => entry.id !== itemId);
  state.chest = [...(state.chest ?? []), item];
  refreshDerivedStats(hero);
  render();
  renderInventoryMenu();
}

function moveChestItemToInventory(itemId) {
  if (state.mode !== "home") return;
  const item = chestItemForId(itemId);
  if (!item) return;

  state.chest = (state.chest ?? []).filter((entry) => entry.id !== itemId);
  addItemToInventory(state.fighters.hero, item, "chest-stack");
  render();
  renderInventoryMenu();
}

function moveMoneyBetweenHeroAndChest(direction, cpAmount) {
  if (state.mode !== "home" || cpAmount <= 0) return;
  const heroMoney = state.fighters.hero.inventory.money;
  state.chestMoney = normalizeMoney(state.chestMoney ?? {});
  const from = direction === "deposit" ? heroMoney : state.chestMoney;
  const to = direction === "deposit" ? state.chestMoney : heroMoney;
  if (!spendMoney(from, cpAmount)) return;
  addMoney(to, cpAmount);
  addLog(`${direction === "deposit" ? "Stored" : "Withdrew"} ${moneyText(cpToMoney(cpAmount))}.`, "important");
  render();
  renderInventoryMenu();
}

function readChestCoinTransferAmount() {
  const values = { cp: 0, sp: 0, gp: 0 };
  for (const unit of Object.keys(values)) {
    const input = els.inventoryMenu.querySelector(`[data-coin-input="${unit}"]`);
    const rawValue = input?.value.trim() ?? "0";
    const value = rawValue === "" ? 0 : Number(rawValue);
    if (!Number.isInteger(value) || value < 0) {
      return { error: "Use whole coin amounts of 0 or more." };
    }
    values[unit] = value;
  }

  const cpAmount = moneyToCp(values);
  if (cpAmount <= 0) return { error: "Enter at least one coin to transfer." };
  return { cpAmount };
}

function showChestMoneyError(message) {
  const error = els.inventoryMenu.querySelector(".chest-money-error");
  if (error) error.textContent = message;
}

function moveCustomMoneyBetweenHeroAndChest(direction) {
  const result = readChestCoinTransferAmount();
  if (result.error) {
    showChestMoneyError(result.error);
    return;
  }

  const available = direction === "deposit" ? state.fighters.hero.inventory.money : state.chestMoney;
  if (moneyToCp(available) < result.cpAmount) {
    showChestMoneyError(direction === "deposit" ? "You do not have that many carried coins." : "The chest does not hold that many coins.");
    return;
  }

  moveMoneyBetweenHeroAndChest(direction, result.cpAmount);
}

function readHomeChestCoinTransferAmount() {
  const values = { cp: 0, sp: 0, gp: 0 };
  for (const unit of Object.keys(values)) {
    const input = els.fighterInfo.querySelector(`[data-home-coin-input="${unit}"]`);
    const rawValue = input?.value.trim() ?? "0";
    const value = rawValue === "" ? 0 : Number(rawValue);
    if (!Number.isInteger(value) || value < 0) {
      return { error: "Use whole coin amounts of 0 or more." };
    }
    values[unit] = value;
  }

  const cpAmount = moneyToCp(values);
  if (cpAmount <= 0) return { error: "Enter at least one coin to transfer." };
  return { cpAmount };
}

function showHomeChestMoneyError(message) {
  const error = els.fighterInfo.querySelector(".chest-money-error");
  if (error) error.textContent = message;
}

function moveCustomMoneyFromHomeChestPanel(direction) {
  const result = readHomeChestCoinTransferAmount();
  if (result.error) {
    showHomeChestMoneyError(result.error);
    return;
  }

  const available = direction === "deposit" ? state.fighters.hero.inventory.money : state.chestMoney;
  if (moneyToCp(available) < result.cpAmount) {
    showHomeChestMoneyError(direction === "deposit" ? "You do not have that many carried coins." : "The chest does not hold that many coins.");
    return;
  }

  moveMoneyBetweenHeroAndChest(direction, result.cpAmount);
  showHomeChestInfo();
}

function slotLayoutClass(slotId) {
  const classes = {
    head: "slot-head",
    cloak: "slot-cloak",
    amulet: "slot-amulet",
    mainHand: "slot-main-hand",
    torso: "slot-torso",
    offHand: "slot-off-hand",
    bracers: "slot-bracers",
    gauntlets: "slot-gauntlets",
    ring1: "slot-ring-one",
    ring2: "slot-ring-two",
    boots: "slot-boots",
    quiver: "slot-quiver",
    belt1: "slot-belt-one",
    belt2: "slot-belt-two",
    belt3: "slot-belt-three",
    belt4: "slot-belt-four",
    belt5: "slot-belt-five",
  };
  return classes[slotId] ?? "";
}

function draggableItemCard(item, source = "") {
  if (!item) return `<span class="equipment-empty">Empty</span>`;

  return `
    <div class="equipment-item" draggable="true" data-drag-item="${item.id}" data-drag-source="${source}">
      <b>${escapeHtml(item.name)}</b>
      <span>${escapeHtml(itemDetails(item))}</span>
    </div>
  `;
}

function renderInventoryMenu() {
  const fighter = state.fighters.hero;
  refreshDerivedStats(fighter);
  const equippedIds = new Set(Object.values(fighter.equipment).filter(Boolean));
  const carriedItems = fighter.inventory.items.filter((item) => !equippedIds.has(item.id));
  const chestItems = state.chest ?? [];
  const chestMoney = normalizeMoney(state.chestMoney ?? {});

  els.inventoryBody.innerHTML = `
    <div class="inventory-stats">
      <div class="stat-pill"><b>${fighter.ac}</b><span>AC</span></div>
      <div class="stat-pill"><b>${escapeHtml(fighter.damage.label)}</b><span>Damage</span></div>
      <button class="admin-toggle ${inventoryAdminOpen ? "active" : ""}" type="button" data-action="toggle-admin">
        ${inventoryAdminOpen ? "Hide Vault" : "Item Vault"}
      </button>
      <div class="wallet-line">${escapeHtml(moneyText(fighter.inventory.money))} - Hero Tokens: ${fighter.inventory.heroTokens ?? 0}</div>
    </div>
    ${renderAdminItemCatalog()}
    <section class="paper-doll" aria-label="Equipment slots">
      ${equipmentSlots
        .map((slot) => {
          const item = equippedItem(fighter, slot.id);
          return `
            <div class="equipment-slot ${slotLayoutClass(slot.id)}" data-drop-slot="${slot.id}">
              <div class="slot-label">
                <b>${slot.label}</b>
              </div>
              ${draggableItemCard(item, slot.id)}
              <button type="button" data-action="unequip" data-slot="${slot.id}" ${item ? "" : "disabled"}>Unequip</button>
            </div>
          `;
        })
        .join("")}
    </section>
    <section class="inventory-list" data-drop-inventory="true" aria-label="Carried items">
      <h3>Carried Items</h3>
      ${
        carriedItems.length
          ? carriedItems
              .map(
                (item) => `
                  <div class="inventory-item">
                    ${draggableItemCard(item, "inventory")}
                    <div class="equip-actions">
                      ${equipActionForItem(fighter, item)}
                    </div>
                  </div>
                `,
              )
              .join("")
          : `<p class="empty-note">No carried items outside equipped gear.</p>`
      }
    </section>
    ${
      state.mode === "home"
        ? `
          <section class="inventory-list chest-list" data-drop-chest="true" aria-label="Home chest">
            <h3>Home Chest</h3>
            <div class="chest-money">
              <div>
                <b>Carried Coins</b>
                <span>${escapeHtml(moneyText(fighter.inventory.money))}</span>
              </div>
              <div>
                <b>Chest Coins</b>
                <span>${escapeHtml(moneyText(chestMoney))}</span>
              </div>
              <div class="chest-coin-fields" aria-label="Coin amount">
                <label><span>CP</span><input type="number" inputmode="numeric" min="0" step="1" value="0" data-coin-input="cp" /></label>
                <label><span>SP</span><input type="number" inputmode="numeric" min="0" step="1" value="0" data-coin-input="sp" /></label>
                <label><span>GP</span><input type="number" inputmode="numeric" min="0" step="1" value="0" data-coin-input="gp" /></label>
              </div>
              <p class="chest-money-error" aria-live="polite"></p>
              <div class="chest-money-actions" aria-label="Coin transfers">
                <button type="button" data-action="deposit-custom-coins">Deposit</button>
                <button type="button" data-action="withdraw-custom-coins">Withdraw</button>
                <button type="button" data-action="deposit-coins" data-cp="${moneyToCp(fighter.inventory.money)}" ${moneyToCp(fighter.inventory.money) > 0 ? "" : "disabled"}>Store All</button>
                <button type="button" data-action="withdraw-coins" data-cp="${moneyToCp(chestMoney)}" ${moneyToCp(chestMoney) > 0 ? "" : "disabled"}>Take All</button>
              </div>
            </div>
            ${
              chestItems.length
                ? chestItems
                    .map(
                      (item) => `
                        <div class="inventory-item">
                          ${draggableItemCard(item, "chest")}
                        </div>
                      `,
                    )
                    .join("")
                : `<p class="empty-note">Drop items here to leave them at home.</p>`
            }
          </section>
        `
        : ""
    }
  `;
}

function unequippedInventoryItems(fighter) {
  const equippedIds = new Set(Object.values(fighter.equipment).filter(Boolean));
  return fighter.inventory.items.filter((item) => !equippedIds.has(item.id));
}

function showInventoryMenu() {
  renderInventoryMenu();
  els.inventoryMenu.classList.remove("hidden");
}

function hideInventoryMenu() {
  els.inventoryMenu.classList.add("hidden");
}

function beltItems(fighter = state.fighters.hero) {
  return equipmentSlots
    .filter((slot) => isBeltSlot(slot.id))
    .map((slot) => ({ slot, item: equippedItem(fighter, slot.id) }))
    .filter((entry) => entry.item);
}

function itemUseResource(item) {
  return item?.use?.resource ?? "action";
}

function canUseBeltItem(fighter, item) {
  if (state.mode !== "combat") return true;
  const resource = itemUseResource(item);
  return resource === "bonusAction" ? fighter.hasBonusAction : fighter.hasAction;
}

function renderUseItemMenu() {
  const hero = state.fighters.hero;
  const entries = beltItems(hero).filter((entry) => entry.item.use);
  els.useItemBody.innerHTML = entries.length
    ? `
      <div class="use-item-list">
        ${entries
          .map(({ slot, item }) => {
            const disabled = canUseBeltItem(hero, item) ? "" : "disabled";
            return `
              <div class="use-item-row">
                <div>
                  <b>${escapeHtml(item.name)}</b>
                  <span>${escapeHtml(slot.label)} - ${escapeHtml(itemDetails(item))}</span>
                </div>
                <button type="button" data-action="use-belt-item" data-item="${item.id}" ${disabled}>Use</button>
              </div>
            `;
          })
          .join("")}
      </div>
    `
    : `<p class="empty-note">No usable items on the belt.</p>`;
}

function showUseItemMenu() {
  renderUseItemMenu();
  els.useItemMenu.classList.remove("hidden");
}

function hideUseItemMenu() {
  els.useItemMenu.classList.add("hidden");
}

function renderActionMenu() {
  const fighter = state.fighters.hero;
  els.actionMenuBody.innerHTML = fighter && fighter.alive && state.mode === "combat"
    ? `
      <div class="action-options">
        <button type="button" data-action="combat-action" data-combat-action="dash">Dash</button>
        <p>Gain extra movement equal to your base movement. Consumes your Attack action.</p>
        <button type="button" data-action="combat-action" data-combat-action="dodge">Dodge</button>
        <p>Attacks against you have disadvantage until your next turn. Consumes your Attack action.</p>
        <button type="button" data-action="combat-action" data-combat-action="disengage">Disengage</button>
        <p>Your movement does not trigger opportunity attacks this turn. Consumes your Attack action.</p>
      </div>
    `
    : `<p class="empty-note">No action options available.</p>`;
}

function showActionMenu() {
  renderActionMenu();
  els.actionMenu.classList.remove("hidden");
}

function hideActionMenu() {
  els.actionMenu.classList.add("hidden");
}

function useCombatAction(action) {
  const fighter = state.fighters.hero;
  if (!fighter || !fighter.alive || !fighter.hasAction || state.mode !== "combat") return;
  const baseMovement = Math.floor(fighter.speedFeet / feetPerSquare);

  if (action === "dash") {
    fighter.movementLeft = (fighter.movementLeft ?? 0) + baseMovement;
    fighter.hasAction = false;
    addLog(`${fighter.name} uses Dash and gains ${baseMovement} extra movement.`, "important");
  }

  if (action === "dodge") {
    fighter.dodging = true;
    fighter.hasAction = false;
    addLog(`${fighter.name} uses Dodge. Attacks against them have disadvantage until their next turn.`, "important");
  }

  if (action === "disengage") {
    fighter.disengaged = true;
    fighter.hasAction = false;
    addLog(`${fighter.name} uses Disengage. Movement this turn does not trigger opportunity attacks.`, "important");
  }

  hideActionMenu();
  render();
}

function availableFighterAbilities(fighter = state.fighters.hero) {
  ensureFighterAbilityState(fighter);
  return fighter.abilities.filter((ability) => (fighter.level ?? 1) >= (ability.level ?? 1));
}

function canUseFighterAbility(fighter, ability) {
  if (!fighter?.alive || !ability) return false;
  if ((fighter.abilityUses?.[ability.id] ?? 0) >= abilityMaxUses(fighter, ability)) return false;
  if (ability.id === "actionSurge" && state.mode !== "combat") return false;
  if (state.mode === "combat") {
    if (activeFighter()?.id !== fighter.id) return false;
    if (ability.resource === "bonusAction" && !fighter.hasBonusAction) return false;
    if (ability.id === "actionSurge" && fighter.hasAction) return false;
  }
  return true;
}

function hasSpentShortRestAbility(fighter) {
  return availableFighterAbilities(fighter).some((ability) => (fighter.abilityUses?.[ability.id] ?? 0) > 0 && ability.refresh === "shortRest");
}

function renderAbilitiesMenu() {
  const hero = state.fighters.hero;
  const entries = availableFighterAbilities(hero);
  els.abilitiesBody.innerHTML = entries.length
    ? `
      <div class="use-item-list">
        ${entries
          .map((ability) => {
            const used = hero.abilityUses?.[ability.id] ?? 0;
            const maxUses = abilityMaxUses(hero, ability);
            const disabled = canUseFighterAbility(hero, ability) ? "" : "disabled";
            return `
              <div class="use-item-row">
                <div>
                  <b>${escapeHtml(ability.name)}</b>
                  <span>${escapeHtml(ability.description)} Uses: ${used}/${maxUses}.</span>
                </div>
                <button type="button" data-action="use-fighter-ability" data-ability="${escapeAttribute(ability.id)}" ${disabled}>Use</button>
              </div>
            `;
          })
          .join("")}
      </div>
    `
    : `<p class="empty-note">No extra abilities available yet.</p>`;
}

function showAbilitiesMenu() {
  renderAbilitiesMenu();
  els.abilitiesMenu.classList.remove("hidden");
}

function hideAbilitiesMenu() {
  els.abilitiesMenu.classList.add("hidden");
}

function showHomeMenu() {
  els.levelUp.disabled = !canLevelUp();
  els.homeMenu.classList.remove("hidden");
}

function hideHomeMenu() {
  els.homeMenu.classList.add("hidden");
}

function storeStockItems() {
  const query = storeSearch.trim().toLowerCase();
  return window.DungeonContent.list("items")
    .filter((item) => ["weapon", "armor", "ammunition"].includes(item.type) || item.id === "potion-healing")
    .filter((item) => !query || searchableItemText(item).includes(query) || itemDetails(item).toLowerCase().includes(query))
    .sort((a, b) => itemCategoryLabel(a).localeCompare(itemCategoryLabel(b)) || a.name.localeCompare(b.name));
}

function renderStoreMenu() {
  const hero = state.fighters.hero;
  const equippedIds = new Set(Object.values(hero.equipment).filter(Boolean));
  const query = storeSearch.trim().toLowerCase();
  const sellableItems = hero.inventory.items
    .filter((item) => !equippedIds.has(item.id))
    .filter((item) => !query || searchableItemText(item).includes(query) || itemDetails(item).toLowerCase().includes(query));
  els.storeBody.innerHTML = `
    <div class="store-wallet">${escapeHtml(moneyText(hero.inventory.money))}</div>
    <label class="store-search" for="store-search">
      <span>Search</span>
      <input id="store-search" type="search" placeholder="Search store" value="${escapeAttribute(storeSearch)}" />
    </label>
    <section class="store-section">
      <h3>Buy</h3>
      <div class="store-list">
        ${storeStockItems()
          .map((item) => {
            const price = itemValueCp(item);
            return `
              <div class="store-row">
                <div>
                  <b>${escapeHtml(item.name)}</b>
                  <span>${escapeHtml(itemDetails(item))} - ${escapeHtml(priceText(price))}</span>
                </div>
                <button type="button" data-action="buy-store-item" data-item="${item.id}" ${moneyToCp(hero.inventory.money) >= price ? "" : "disabled"}>Buy</button>
              </div>
            `;
          })
          .join("")}
      </div>
    </section>
    <section class="store-section">
      <h3>Sell</h3>
      <div class="store-list">
        ${
          sellableItems.length
            ? sellableItems
                .map((item) => {
                  const price = Math.floor(itemValueCp(item) / 2);
                  return `
                    <div class="store-row">
                      <div>
                        <b>${escapeHtml(item.name)}</b>
                        <span>${escapeHtml(itemDetails(item))} - ${escapeHtml(priceText(price))}</span>
                      </div>
                      <button type="button" data-action="sell-store-item" data-item="${item.id}">Sell</button>
                    </div>
                  `;
                })
                .join("")
            : `<p class="empty-note">No carried items to sell.</p>`
        }
      </div>
    </section>
  `;
}

function showStoreMenu() {
  hideHomeMenu();
  renderStoreMenu();
  els.storeMenu.classList.remove("hidden");
}

function hideStoreMenu() {
  els.storeMenu.classList.add("hidden");
}

function buyStoreItem(itemId) {
  const hero = state.fighters.hero;
  const template = getItemTemplate(itemId);
  if (!template) return;

  const price = itemValueCp(template);
  if (!spendMoney(hero.inventory.money, price)) return;
  addItemToInventory(hero, createItemInstance(itemId, "store"), "store-stack");
  addLog(`${hero.name} buys ${template.name}.`, "important");
  render();
  renderStoreMenu();
}

function sellStoreItem(itemId) {
  const hero = state.fighters.hero;
  const equippedIds = new Set(Object.values(hero.equipment).filter(Boolean));
  if (equippedIds.has(itemId)) return;

  const item = itemForId(hero, itemId);
  if (!item) return;
  hero.inventory.items = hero.inventory.items.filter((entry) => entry.id !== itemId);
  addMoney(hero.inventory.money, Math.floor(itemValueCp(item) / 2));
  addLog(`${hero.name} sells ${item.name}.`, "important");
  render();
  renderStoreMenu();
}

function fighterClassFeatureNames(level) {
  const features = [];
  if (level === 1) features.push("Second Wind");
  if (level === 2) features.push("Action Surge");
  if (fighterAbilityScoreImprovementLevels.has(level)) features.push("Ability Score Improvement");
  return features;
}

function showAbilityScoreImprovementDialog(hero) {
  return new Promise((resolve) => {
    els.gameDialogTitle.textContent = "Ability Score Improvement";
    els.gameDialogMessage.textContent = "Increase one ability score by 2, or two ability scores by 1. No score can go above 20.";
    els.gameDialogField.classList.add("hidden");
    els.gameDialogActions.innerHTML = `
      <div class="ability-assignment">
        ${abilities
          .map(
            (ability) => `
              <label>
                <span>${ability.toUpperCase()} ${abilityScore(hero, ability)}</span>
                <input type="number" inputmode="numeric" min="0" max="2" step="1" value="0" data-asi-input="${ability}" />
              </label>
            `,
          )
          .join("")}
        <p class="ability-assignment-error" aria-live="polite"></p>
      </div>
      <button type="submit" data-dialog-action="confirm">Apply Improvement</button>
      <button type="button" class="ghost-button" data-dialog-action="cancel">Skip</button>
    `;

    const cleanup = (value) => {
      els.gameDialogForm.removeEventListener("submit", handleSubmit);
      els.gameDialogActions.removeEventListener("click", handleClick);
      els.gameDialogActions.removeEventListener("input", handleInput);
      els.gameDialog.classList.add("hidden");
      activeDialogCancel = null;
      resolve(value);
    };

    const readIncreases = () =>
      Object.fromEntries(
        Array.from(els.gameDialogActions.querySelectorAll("[data-asi-input]")).map((input) => [
          input.dataset.asiInput,
          Math.max(0, Math.floor(Number(input.value) || 0)),
        ]),
      );

    const validate = () => {
      const increases = readIncreases();
      const values = Object.values(increases);
      const error = els.gameDialogActions.querySelector(".ability-assignment-error");
      const total = values.reduce((sum, value) => sum + value, 0);
      const legalShape = values.filter(Boolean).length === 1 && values.includes(2) || values.filter((value) => value === 1).length === 2;
      const overCap = abilities.find((ability) => abilityScore(hero, ability) + increases[ability] > 20);
      if (total !== 2 || !legalShape) return "Choose either one +2 or two +1 increases.";
      if (overCap) return `${overCap.toUpperCase()} cannot be increased above 20.`;
      if (error) error.textContent = "";
      return "";
    };

    const handleSubmit = (event) => {
      event.preventDefault();
      const errorText = validate();
      const error = els.gameDialogActions.querySelector(".ability-assignment-error");
      if (errorText) {
        if (error) error.textContent = errorText;
        return;
      }
      cleanup(readIncreases());
    };

    const handleClick = (event) => {
      const button = event.target.closest("[data-dialog-action='cancel']");
      if (button) cleanup(null);
    };

    const handleInput = (event) => {
      if (!event.target.matches("[data-asi-input]")) return;
      event.target.value = String(clamp(Math.floor(Number(event.target.value) || 0), 0, 2));
      validate();
    };

    els.gameDialogForm.addEventListener("submit", handleSubmit);
    els.gameDialogActions.addEventListener("click", handleClick);
    els.gameDialogActions.addEventListener("input", handleInput);
    activeDialogCancel = () => cleanup(null);
    els.gameDialog.classList.remove("hidden");
    els.gameDialogActions.querySelector("input")?.focus();
  });
}

async function levelUpHero() {
  if (state.mode !== "home" || !canLevelUp()) return;
  const hero = state.fighters.hero;
  const oldConMod = abilityMod(hero, "con");
  const hpGain = 6 + abilityMod(hero, "con");
  hero.level = (hero.level ?? 1) + 1;
  hero.role = combatantRoleLabel(hero);
  hero.maxHp += hpGain;
  hero.hitDiceRemaining = hero.level;
  let asiText = "";
  if (fighterAbilityScoreImprovementLevels.has(hero.level ?? 1)) {
    hero.abilityScores = Object.fromEntries(abilities.map((ability) => [ability, abilityScore(hero, ability)]));
    const increases = await showAbilityScoreImprovementDialog(hero);
    if (increases) {
      for (const ability of abilities) {
        hero.abilityScores[ability] = Math.min(20, hero.abilityScores[ability] + (increases[ability] ?? 0));
      }
      const newConMod = scoreToMod(hero.abilityScores.con);
      const conHpGain = Math.max(0, newConMod - oldConMod) * (hero.level ?? 1);
      hero.maxHp += conHpGain;
      asiText = ` Ability scores improved${conHpGain ? `; Constitution adds ${conHpGain} max HP` : ""}.`;
    }
  }
  ensureFighterAbilityState(hero);
  hero.hp = hero.maxHp;
  const features = fighterClassFeatureNames(hero.level);
  const featureText = features.length ? ` New feature${features.length === 1 ? "" : "s"}: ${features.join(", ")}.` : "";
  const levelUpText = `${hero.name} reaches level ${hero.level} and gains ${hpGain} max HP.${featureText}${asiText}`;
  addLog(levelUpText, "important");
  hideHomeMenu();
  render();
  await showChoiceDialog({
    title: `Level ${hero.level} Fighter`,
    message: levelUpText,
    choices: [{ value: "ok", label: "Continue" }],
  });
}

function consumeEquippedItem(itemId) {
  const hero = state.fighters.hero;
  for (const slot of equipmentSlots) {
    if (hero.equipment[slot.id] === itemId) {
      hero.equipment[slot.id] = null;
    }
  }
  hero.inventory.items = hero.inventory.items.filter((item) => item.id !== itemId);
}

function useBeltItem(itemId) {
  const hero = state.fighters.hero;
  const item = itemForId(hero, itemId);
  const itemAvailable = beltItems(hero).some((entry) => entry.item.id === itemId);
  if (!item || !itemAvailable || !canUseBeltItem(hero, item)) return;

  if (state.mode === "combat") {
    if (itemUseResource(item) === "bonusAction") {
      hero.hasBonusAction = false;
    } else {
      hero.hasAction = false;
    }
  }

  if (item.use?.kind === "healing") {
    const healingRoll = rollDice(item.use.dice.count, item.use.dice.sides);
    const healing = healingRoll.total + (item.use.bonus ?? 0);
    const before = hero.hp;
    hero.hp = Math.min(hero.maxHp, hero.hp + healing);
    playSoundEffect("potionDrink");
    addLog(`${hero.name} uses ${item.name} and heals ${hero.hp - before} HP (${healingRoll.rolls.join(" + ")} + ${item.use.bonus ?? 0}).`, "heal");
    consumeEquippedItem(itemId);
  } else {
    addLog(`${hero.name} uses ${item.name}.`, "important");
    if (item.use?.consume !== false) consumeEquippedItem(itemId);
  }

  refreshDerivedStats(hero);
  hideUseItemMenu();
  render();
}

function useFighterAbility(abilityId) {
  const hero = state.fighters.hero;
  const ability = availableFighterAbilities(hero).find((entry) => entry.id === abilityId);
  if (!canUseFighterAbility(hero, ability)) return;

  hero.abilityUses[ability.id] = (hero.abilityUses[ability.id] ?? 0) + 1;
  if (state.mode === "combat" && ability.resource === "bonusAction") {
    hero.hasBonusAction = false;
  }

  if (ability.id === "secondWind") {
    const healingRoll = rollDice(1, 10);
    const healing = healingRoll.total + (hero.level ?? 1);
    const before = hero.hp;
    hero.hp = Math.min(hero.maxHp, hero.hp + healing);
    addLog(`${hero.name} uses Second Wind and heals ${hero.hp - before} HP (${healingRoll.rolls[0]} + ${hero.level ?? 1}).`, "heal");
  }

  if (ability.id === "actionSurge") {
    hero.hasAction = true;
    addLog(`${hero.name} uses Action Surge and regains an action.`, "important");
  }

  refreshDerivedStats(hero);
  hideAbilitiesMenu();
  render();
}

function renderShortRestDialogBody(hero, spentAny = false) {
  const conMod = abilityMod(hero, "con");
  els.gameDialogMessage.innerHTML = `
    HP ${hero.hp} / ${hero.maxHp}. Hit dice left: ${hero.hitDiceRemaining ?? 0}. Short rests left: ${Math.max(
      0,
      (state.shortRestLimit ?? 3) - (state.shortRestsUsed ?? 0),
    )}.
  `;
  const shortRestsRemaining = Math.max(0, (state.shortRestLimit ?? 3) - (state.shortRestsUsed ?? 0));
  els.gameDialogActions.innerHTML = `
    <div class="short-rest-panel">
      <p class="empty-note">Spend one d${hero.hitDie ?? 10} hit die at a time. Each die heals the roll ${abilityLabel(conMod)} CON.</p>
      <button type="button" data-rest-action="spend" ${(hero.hitDiceRemaining ?? 0) > 0 && hero.hp < hero.maxHp ? "" : "disabled"}>Spend Hit Die</button>
      <button type="button" data-rest-action="shortRest" ${shortRestsRemaining > 0 ? "" : "disabled"}>Short Rest</button>
      <button type="button" class="ghost-button" data-rest-action="finish">${spentAny ? "Finish Rest" : "Continue Without Rest"}</button>
    </div>
  `;
}

function showShortRestMenu(hero) {
  return new Promise((resolve) => {
    els.gameDialogTitle.textContent = "Short Rest";
    els.gameDialogField.classList.add("hidden");
    let spentAny = false;

    const cleanup = () => {
      els.gameDialogActions.removeEventListener("click", handleClick);
      els.gameDialog.classList.add("hidden");
      activeDialogCancel = null;
      if (spentAny) playSoundEffect("shortRestFinished");
      resolve(spentAny);
    };

    const handleClick = (event) => {
      const button = event.target.closest("[data-rest-action]");
      if (!button) return;
      if (button.dataset.restAction === "finish") {
        cleanup();
        return;
      }
      if (button.dataset.restAction === "shortRest") {
        const shortRestsRemaining = Math.max(0, (state.shortRestLimit ?? 3) - (state.shortRestsUsed ?? 0));
        if (shortRestsRemaining <= 0) return;
        if (!spentAny) {
          spentAny = true;
          state.shortRestsUsed = (state.shortRestsUsed ?? 0) + 1;
          resetFighterAbilityUses(hero);
          addLog(`${hero.name} takes a short rest.`, "important");
        }
        render();
        els.gameDialog.classList.remove("hidden");
        renderShortRestDialogBody(hero, spentAny);
        return;
      }
      if (button.dataset.restAction !== "spend" || (hero.hitDiceRemaining ?? 0) <= 0 || hero.hp >= hero.maxHp) return;

      if (!spentAny) {
        spentAny = true;
        state.shortRestsUsed = (state.shortRestsUsed ?? 0) + 1;
        resetFighterAbilityUses(hero);
        addLog(`${hero.name} takes a short rest.`, "important");
      }
      const healingRoll = rollDice(1, hero.hitDie ?? 10);
      const conHealing = abilityMod(hero, "con");
      const healing = Math.max(0, healingRoll.total + conHealing);
      const before = hero.hp;
      hero.hitDiceRemaining = Math.max(0, (hero.hitDiceRemaining ?? 0) - 1);
      hero.hp = Math.min(hero.maxHp, hero.hp + healing);
      addLog(`${hero.name} spends a hit die and heals ${hero.hp - before} HP (${healingRoll.rolls[0]} ${abilityLabel(conHealing)}).`, "heal");
      refreshDerivedStats(hero);
      render();
      els.gameDialog.classList.remove("hidden");
      renderShortRestDialogBody(hero, spentAny);
    };

    els.gameDialogActions.addEventListener("click", handleClick);
    activeDialogCancel = cleanup;
    renderShortRestDialogBody(hero, spentAny);
    els.gameDialog.classList.remove("hidden");
    els.gameDialogActions.querySelector("[data-rest-action='spend']:not(:disabled), [data-rest-action='finish']")?.focus();
  });
}

async function takeShortRest() {
  const hero = state.fighters.hero;
  if ((state.shortRestsUsed ?? 0) >= (state.shortRestLimit ?? 3) || state.mode === "combat" || !hero.alive) return;

  hero.hitDiceRemaining = hero.hitDiceRemaining ?? hero.level ?? 1;
  render();
  await showShortRestMenu(hero);
  render();
}

function unequipSlot(slotId) {
  const hero = state.fighters.hero;
  const item = equippedItem(hero, slotId);
  if (itemRequiresTwoHands(item) && ["mainHand", "offHand"].includes(slotId)) {
    hero.equipment.mainHand = null;
    hero.equipment.offHand = null;
  } else {
    hero.equipment[slotId] = null;
  }
  refreshDerivedStats(hero);
  render();
  renderInventoryMenu();
}

function equipItem(itemId, slotId) {
  const hero = state.fighters.hero;
  const item = itemForId(hero, itemId);
  if (!itemCanEquipInSlot(hero, item, slotId)) {
    if (item?.requirements?.strength) {
      addLog(`${hero.name} needs Strength ${item.requirements.strength} to equip ${item.name}.`);
      renderLog();
    }
    return;
  }

  const equippingHand = isHandSlot(slotId);
  for (const slot of equipmentSlots) {
    if (hero.equipment[slot.id] === itemId || (equippingHand && isHandSlot(slot.id) && itemRequiresTwoHands(equippedItem(hero, slot.id)))) {
      hero.equipment[slot.id] = null;
    }
  }
  if (itemRequiresTwoHands(item)) {
    hero.equipment.mainHand = itemId;
    hero.equipment.offHand = itemId;
  } else {
    hero.equipment[slotId] = itemId;
  }
  refreshDerivedStats(hero);
  render();
  renderInventoryMenu();
}

function clearInventoryDropTargets() {
  els.inventoryMenu.querySelectorAll(".drag-over, .drag-invalid").forEach((element) => {
    element.classList.remove("drag-over", "drag-invalid");
  });
}

function handleInventoryDragStart(event) {
  const itemElement = event.target.closest("[data-drag-item]");
  if (!itemElement) return;

  currentInventoryDrag = {
    itemId: itemElement.dataset.dragItem,
    source: itemElement.dataset.dragSource ?? "inventory",
  };
  event.dataTransfer.effectAllowed = currentInventoryDrag.source === "admin" ? "copy" : "move";
  event.dataTransfer.setData("application/json", JSON.stringify(currentInventoryDrag));
  itemElement.classList.add("dragging");
}

function draggedInventoryItem(event) {
  if (currentInventoryDrag) return currentInventoryDrag;
  try {
    return JSON.parse(event.dataTransfer.getData("application/json"));
  } catch {
    return null;
  }
}

function isItemEquippedInAnotherHand(itemId, targetSlot) {
  if (!["mainHand", "offHand"].includes(targetSlot)) return false;
  const hero = state.fighters.hero;
  return ["mainHand", "offHand"].some((slotId) => slotId !== targetSlot && hero.equipment[slotId] === itemId);
}

function canDropInventoryData(data, target) {
  if (!data?.itemId || !target) return false;
  if (target.dataset.dropAdminTrash) return data.source !== "admin";
  if (target.dataset.dropChest) return state.mode === "home" && data.source !== "admin" && data.source !== "chest";
  if (target.dataset.dropInventory) return data.source !== "inventory";

  const slotId = target.dataset.dropSlot;
  const item = data.source === "admin" ? getItemTemplate(data.itemId) : data.source === "chest" ? chestItemForId(data.itemId) : itemForId(state.fighters.hero, data.itemId);
  const handConflict = data.source !== "admin" && isItemEquippedInAnotherHand(data.itemId, slotId);
  return itemCanEquipInSlot(state.fighters.hero, item, slotId) && !handConflict;
}

function handleInventoryDragOver(event) {
  const target = event.target.closest("[data-drop-slot], [data-drop-inventory], [data-drop-admin-trash], [data-drop-chest]");
  if (!target) return;

  const data = draggedInventoryItem(event);
  const valid = canDropInventoryData(data, target);
  event.preventDefault();
  event.dataTransfer.dropEffect = valid ? (data.source === "admin" ? "copy" : "move") : "none";
  target.classList.toggle("drag-over", valid);
  target.classList.toggle("drag-invalid", !valid);
}

function handleInventoryDragLeave(event) {
  const target = event.target.closest("[data-drop-slot], [data-drop-inventory], [data-drop-admin-trash], [data-drop-chest]");
  if (!target || target.contains(event.relatedTarget)) return;
  target.classList.remove("drag-over", "drag-invalid");
}

function handleInventoryDrop(event) {
  const target = event.target.closest("[data-drop-slot], [data-drop-inventory], [data-drop-admin-trash], [data-drop-chest]");
  if (!target) return;

  event.preventDefault();
  const data = draggedInventoryItem(event);
  clearInventoryDropTargets();
  if (!canDropInventoryData(data, target)) return;

  if (target.dataset.dropAdminTrash) {
    removeInventoryItem(data.itemId);
    return;
  }

  if (target.dataset.dropChest) {
    moveInventoryItemToChest(data.itemId);
    return;
  }

  if (target.dataset.dropInventory) {
    if (data.source === "admin") {
      addAdminItemToInventory(data.itemId);
      return;
    }
    if (data.source === "chest") {
      moveChestItemToInventory(data.itemId);
      return;
    }
    unequipSlot(data.source);
    return;
  }

  if (data.source === "admin") {
    addAdminItemToSlot(data.itemId, target.dataset.dropSlot);
    return;
  }
  if (data.source === "chest") {
    const item = chestItemForId(data.itemId);
    if (!item) return;
    state.chest = (state.chest ?? []).filter((entry) => entry.id !== data.itemId);
    const addedItems = addItemToInventory(state.fighters.hero, item, "chest-stack");
    equipItem(addedItems[0]?.id ?? data.itemId, target.dataset.dropSlot);
    return;
  }

  equipItem(data.itemId, target.dataset.dropSlot);
}

function handleInventoryDragEnd(event) {
  event.target.closest("[data-drag-item]")?.classList.remove("dragging");
  currentInventoryDrag = null;
  clearInventoryDropTargets();
}

function monsterCardFighter() {
  const visible = nearestVisibleMonster();
  if (visible) return visible;
  const monsterTemplate = getMonsterTemplate();
  return {
    ...monsterTemplate,
    hp: 0,
    movementLeft: Math.floor(monsterTemplate.speedFeet / feetPerSquare),
    hasAction: false,
    alive: false,
    name: "No visible enemy",
    role: "Exploration",
  };
}

function renderInitiative() {
  if (state.mode !== "combat") {
    els.initiativeList.innerHTML = "";
    return;
  }

  els.initiativeList.innerHTML = state.initiative
    .map((entry, index) => {
      const fighter = state.fighters[entry.fighterId];
      const activeClass = index === state.activeIndex ? " active" : "";
      return `
        <div class="initiative-item${activeClass}">
          <span>${fighter.name}</span>
          <strong>${entry.total}</strong>
        </div>
      `;
    })
    .join("");
}

function renderLog() {
  els.log.innerHTML = state.log
    .map((entry) => `<li class="${entry.type}">${escapeHtml(entry.text)}</li>`)
    .join("");
  els.log.scrollTop = els.log.scrollHeight;
}

function renderControls() {
  applyThemePalette();
  const fighter = activeFighter();
  const heroTurn = state.mode === "combat" && fighter?.id === "hero" && combatMonsters().length > 0;
  const heroCanAttack = heroTurn && state.fighters.hero.hasAction && Boolean(attackTarget());
  const heroCanUseAction = heroTurn && state.fighters.hero.hasAction;
  const heroCanUseItem =
    gameHasStarted &&
    state.fighters.hero.alive &&
    (state.mode === "combat"
      ? beltItems(state.fighters.hero).some((entry) => canUseBeltItem(state.fighters.hero, entry.item))
      : beltItems(state.fighters.hero).some((entry) => entry.item.use));
  const heroCanOpenAbilities =
    gameHasStarted &&
    state.fighters.hero.alive &&
    availableFighterAbilities(state.fighters.hero).length > 0 &&
    (state.mode !== "combat" || heroTurn);

  els.rollInitiative.disabled = !gameHasStarted || state.completed || movementInProgress || state.mode === "combat" || !threatPresent();
  els.attack.disabled = movementInProgress || !heroCanAttack;
  if (els.attackNote) {
    const weapon = activeWeapon(state.fighters.hero);
    const target = attackTarget();
    els.attackNote.textContent = target
      ? `${weapon?.name ?? "Unarmed Strike"} -> ${target.name}`
      : `${weapon?.name ?? "Unarmed Strike"}`;
  }
  els.actionButton.disabled = movementInProgress || !heroCanUseAction;
  els.useItem.disabled = movementInProgress || !heroCanUseItem;
  els.abilities.disabled = movementInProgress || !heroCanOpenAbilities;
  els.shortRest.disabled =
    !gameHasStarted ||
    movementInProgress ||
    (state.shortRestsUsed ?? 0) >= (state.shortRestLimit ?? 3) ||
    state.mode === "combat" ||
    !state.fighters.hero.alive ||
    (state.fighters.hero.hp >= state.fighters.hero.maxHp &&
      (state.fighters.hero.hitDiceRemaining ?? 0) <= 0 &&
      !hasSpentShortRestAbility(state.fighters.hero));
  els.returnHome.disabled = !gameHasStarted || movementInProgress || state.mode === "home" || state.mode === "combat" || !state.fighters.hero.alive;
  els.endTurn.disabled = movementInProgress || !heroTurn;

  els.attack.style.display = state.mode === "combat" ? "" : "none";
  els.actionButton.style.display = state.mode === "combat" ? "" : "none";
  els.endTurn.style.display = state.mode === "combat" ? "" : "none";
  els.shortRest.style.display = state.mode === "combat" ? "none" : "";
  els.returnHome.style.display = state.mode === "combat" ? "none" : "";
  els.saveGame.disabled = !gameHasStarted;
  els.toggleLayout.textContent = showDungeonLayout ? "Hide Dungeon Layout" : "Show Dungeon Layout";
  els.toggleLayout.disabled = !gameHasStarted;
  els.zoomOut.disabled = roomZoom <= 0.5;
  els.zoomIn.disabled = roomZoom >= 2;
  els.zoomLabel.textContent = `${Math.round(roomZoom * 100)}%`;
  els.debugKill.disabled = !gameHasStarted || visibleMonsters().length === 0;
  els.levelUp.disabled = !gameHasStarted || state.mode !== "home" || !canLevelUp();
  if (els.roomTitle) els.roomTitle.textContent = state.mode === "home" ? "Home" : state.room.name;
  els.roundLabel.textContent = state.mode === "combat" ? `Round ${state.round}` : "Out of turn order";

  if (state.completed) {
    els.turnLabel.textContent = "Dungeon complete";
  } else if (state.mode === "home") {
    els.roundLabel.textContent = "Home";
    els.turnLabel.textContent = "Long rest complete";
  } else if (state.mode !== "combat") {
    els.turnLabel.textContent = threatPresent() ? "Danger present" : "Exploration";
  } else if (combatMonsters().length === 0 || !state.fighters.hero.alive) {
    els.turnLabel.textContent = state.fighters.hero.alive ? "Encounter won" : "Encounter lost";
  } else {
    els.turnLabel.textContent = `${fighter.name}'s turn`;
  }
  updateBackgroundMusic();
}

function render() {
  renderRoom();
  renderHeroStatusCard(els.heroCard, state.fighters.hero);
  renderInitiative();
  renderLog();
  renderControls();
}

els.rollInitiative.addEventListener("click", rollInitiative);
els.attack.addEventListener("click", () => {
  const target = attackTarget();
  if (target) makeAttack(state.fighters.hero, target);
});
els.actionButton.addEventListener("click", showActionMenu);
els.useItem.addEventListener("click", showUseItemMenu);
els.abilities.addEventListener("click", showAbilitiesMenu);
els.shortRest.addEventListener("click", takeShortRest);
els.returnHome.addEventListener("click", returnHomeEarly);
els.endTurn.addEventListener("click", endTurn);
els.heroCard.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  showCombatantInfo(state.fighters.hero);
});
els.newGame.addEventListener("click", () => {
  showMainMenu();
});
els.tutorial.addEventListener("click", showTutorial);
els.toggleLayout.addEventListener("click", () => {
  showDungeonLayout = !showDungeonLayout;
  render();
});
els.zoomOut.addEventListener("click", () => {
  const focusPoint = viewportCenterGridPoint();
  roomZoom = Math.max(0.5, Number((roomZoom - 0.1).toFixed(1)));
  renderKeepingGridFocus(focusPoint);
});
els.zoomIn.addEventListener("click", () => {
  const focusPoint = viewportCenterGridPoint();
  roomZoom = Math.min(2, Number((roomZoom + 0.1).toFixed(1)));
  renderKeepingGridFocus(focusPoint);
});
els.debugKill.addEventListener("click", debugKillVisibleMonsters);
els.saveGame.addEventListener("click", () => saveAdventure(activeSaveSlot));
els.startAdventure.addEventListener("click", startNewAdventure);
els.saveSlots.addEventListener("click", (event) => {
  const slotElement = event.target.closest("[data-slot]");
  if (slotElement) selectSaveSlot(Number(slotElement.dataset.slot));

  const button = event.target.closest("button");
  if (!button) return;

  const slotId = Number(button.dataset.slot);
  if (button.dataset.action === "save-slot") {
    saveAdventure(slotId);
  }
  if (button.dataset.action === "load-slot") {
    loadAdventure(slotId);
  }
  if (button.dataset.action === "delete-slot") {
    deleteAdventure(slotId);
  }
});
els.saveSlots.addEventListener("input", (event) => {
  const slotElement = event.target.closest("[data-slot]");
  if (slotElement) activeSaveSlot = Number(slotElement.dataset.slot);
});
els.clearLog.addEventListener("click", () => {
  state.log = [];
  renderLog();
});
els.closeFighterInfo.addEventListener("click", hideFighterInfo);
els.fighterInfo.addEventListener("click", (event) => {
  if (event.target === els.fighterInfo) {
    hideFighterInfo();
    return;
  }

  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.action === "take-object-item") {
    takeObjectItem(button.dataset.object, button.dataset.item);
  }
  if (button.dataset.action === "disarm-trap") {
    disarmTrap(button.dataset.object);
  }
  if (button.dataset.action === "investigate-object") {
    investigateObject(button.dataset.object);
  }
  if (button.dataset.action === "home-store-item") {
    storeHomeChestItem(button.dataset.item);
  }
  if (button.dataset.action === "home-deposit-custom-coins") {
    moveCustomMoneyFromHomeChestPanel("deposit");
  }
  if (button.dataset.action === "home-withdraw-custom-coins") {
    moveCustomMoneyFromHomeChestPanel("withdraw");
  }
});
els.closeInventory.addEventListener("click", hideInventoryMenu);
els.closeUseItem.addEventListener("click", hideUseItemMenu);
els.closeActionMenu.addEventListener("click", hideActionMenu);
els.closeAbilities.addEventListener("click", hideAbilitiesMenu);
els.closeHomeMenu.addEventListener("click", hideHomeMenu);
els.closeStore.addEventListener("click", hideStoreMenu);
els.goStore.addEventListener("click", showStoreMenu);
els.goNewDungeon.addEventListener("click", startNewDungeonWithHero);
els.levelUp.addEventListener("click", levelUpHero);
els.storeMenu.addEventListener("click", (event) => {
  if (event.target === els.storeMenu) {
    hideStoreMenu();
    return;
  }

  const button = event.target.closest("button");
  if (button?.dataset.action === "buy-store-item") {
    buyStoreItem(button.dataset.item);
  }
  if (button?.dataset.action === "sell-store-item") {
    sellStoreItem(button.dataset.item);
  }
});
els.storeMenu.addEventListener("input", (event) => {
  if (event.target.id !== "store-search") return;
  storeSearch = event.target.value;
  renderStoreMenu();
  const searchInput = els.storeMenu.querySelector("#store-search");
  searchInput?.focus();
  searchInput?.setSelectionRange(searchInput.value.length, searchInput.value.length);
});
els.gameDialog.addEventListener("click", (event) => {
  if (event.target === els.gameDialog && activeDialogCancel) {
    activeDialogCancel();
  }
});
els.homeMenu.addEventListener("click", (event) => {
  if (event.target === els.homeMenu) {
    hideHomeMenu();
  }
});
els.useItemMenu.addEventListener("click", (event) => {
  if (event.target === els.useItemMenu) {
    hideUseItemMenu();
    return;
  }

  const button = event.target.closest("button");
  if (button?.dataset.action === "use-belt-item") {
    useBeltItem(button.dataset.item);
  }
});
els.actionMenu.addEventListener("click", (event) => {
  if (event.target === els.actionMenu) {
    hideActionMenu();
    return;
  }

  const button = event.target.closest("button");
  if (button?.dataset.action === "combat-action") {
    useCombatAction(button.dataset.combatAction);
  }
});
els.abilitiesMenu.addEventListener("click", (event) => {
  if (event.target === els.abilitiesMenu) {
    hideAbilitiesMenu();
    return;
  }

  const button = event.target.closest("button");
  if (button?.dataset.action === "use-fighter-ability") {
    useFighterAbility(button.dataset.ability);
  }
});
els.inventoryMenu.addEventListener("click", (event) => {
  if (event.target === els.inventoryMenu) {
    hideInventoryMenu();
    return;
  }

  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.action === "toggle-admin") {
    inventoryAdminOpen = !inventoryAdminOpen;
    renderInventoryMenu();
  }
  if (button.dataset.action === "add-admin-item") {
    addAdminItemToInventory(button.dataset.item);
  }
  if (button.dataset.action === "add-admin-coins") {
    addAdminCoins(Number(button.dataset.cp));
  }
  if (button.dataset.action === "add-admin-xp") {
    addAdminXp(Number(button.dataset.xp));
  }
  if (button.dataset.action === "deposit-coins") {
    moveMoneyBetweenHeroAndChest("deposit", Number(button.dataset.cp));
  }
  if (button.dataset.action === "withdraw-coins") {
    moveMoneyBetweenHeroAndChest("withdraw", Number(button.dataset.cp));
  }
  if (button.dataset.action === "deposit-custom-coins") {
    moveCustomMoneyBetweenHeroAndChest("deposit");
  }
  if (button.dataset.action === "withdraw-custom-coins") {
    moveCustomMoneyBetweenHeroAndChest("withdraw");
  }
  if (button.dataset.action === "unequip") {
    unequipSlot(button.dataset.slot);
  }
  if (button.dataset.action === "equip") {
    equipItem(button.dataset.item, button.dataset.slot);
  }
});
els.inventoryMenu.addEventListener("input", (event) => {
  if (event.target.id !== "admin-item-search") return;
  inventoryAdminSearch = event.target.value;
  renderInventoryMenu();
  const searchInput = els.inventoryMenu.querySelector("#admin-item-search");
  searchInput?.focus();
  searchInput?.setSelectionRange(searchInput.value.length, searchInput.value.length);
});
els.inventoryMenu.addEventListener("dragstart", handleInventoryDragStart);
els.inventoryMenu.addEventListener("dragover", handleInventoryDragOver);
els.inventoryMenu.addEventListener("dragleave", handleInventoryDragLeave);
els.inventoryMenu.addEventListener("drop", handleInventoryDrop);
els.inventoryMenu.addEventListener("dragend", handleInventoryDragEnd);
els.roomScroll.addEventListener("pointerdown", handleMapPanPointerDown);
els.roomScroll.addEventListener("pointermove", handleMapPanPointerMove);
els.roomScroll.addEventListener("pointerup", finishMapPan);
els.roomScroll.addEventListener("pointercancel", finishMapPan);
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (activeDialogCancel) {
      activeDialogCancel();
      return;
    }
    hideFighterInfo();
    hideInventoryMenu();
    hideUseItemMenu();
    hideAbilitiesMenu();
    hideHomeMenu();
    hideStoreMenu();
    return;
  }

  const overlayOpen = [els.mainMenu, els.fighterInfo, els.inventoryMenu, els.useItemMenu, els.abilitiesMenu, els.homeMenu, els.storeMenu].some(
    (element) => !element.classList.contains("hidden"),
  );
  if (activeDialogCancel || overlayOpen || event.ctrlKey || event.altKey || event.metaKey || event.repeat) return;
  const target = event.target;
  if (target?.matches?.("input, textarea, select") || target?.isContentEditable) return;

  const key = event.key.toLowerCase();
  if (key === "r" && !els.rollInitiative.disabled) {
    event.preventDefault();
    rollInitiative();
  }
  if (key === "a" && !els.attack.disabled) {
    event.preventDefault();
    const targetFighter = attackTarget();
    if (targetFighter) makeAttack(state.fighters.hero, targetFighter);
  }
  if (key === "e" && !els.endTurn.disabled) {
    event.preventDefault();
    endTurn();
  }
});

state = createInitialState();
render();
showMainMenu();
})();
