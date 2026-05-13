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
let dragHeroId = null;
let roomZoom = 1;
let currentInventoryDrag = null;
let mapPan = null;
let suppressNextTileClick = false;
let pendingSpellTargeting = null;
let adminMode = false;
let adminTeleportEnabled = false;
let adminGodMode = false;
let inventoryAdminOpen = false;
let adminMonsterCatalogOpen = false;
let roomScrollAnimation = null;
let inventoryAdminSearch = "";
let adminMonsterSearch = "";
let storeSearch = "";
let adminItemInstanceCounter = 0;
let activeDialogCancel = null;
let currentMusicKey = "";
let currentMusic = null;
let soundVolume = Number(window.localStorage.getItem("dungeonCrawler.soundVolume.v1") ?? 0.5);
let selectedAttackTargetId = null;
let selectedHeroIds = new Set();
let suppressNextHeroClick = false;
let initiativePromptQueued = false;
let initiativePromptOpen = false;
let fledMonsterIds = new Set();
let interactiveTutorialActive = false;
let interactiveTutorialStep = 0;
let predefinedHeroTokenArt = [];
let renderedTileKeys = new Set();
let pathfindingJobsThisTurn = 0;
let perfOverlayElement = null;
const activeCorridorRadius = 14;
const monsterAiDecisionIntervalMs = 250;
const monsterPathfindingBudgetPerTurn = 6;
const perfStats = {
  frames: 0,
  lastSecondAt: performance.now(),
  fps: 0,
  visibleTiles: 0,
  renderedTiles: 0,
  totalEntities: 0,
  activeEntities: 0,
  sleepingEntities: 0,
  renderedEntities: 0,
  aiUpdates: 0,
  aiUpdatesPerSecond: 0,
  pathfindingJobs: 0,
  pathfindingJobsLastFrame: 0,
  pathfindingJobsPerSecond: 0,
  renderMs: 0,
};
const heldMovementKeys = new Map();
const dialogBackValue = "__back";
const noHeroTokenArtValue = "__none";
const customHeroTokenArtPrefix = "custom:";
const heroTokenArtStorageKey = "dungeonCrawler.heroTokenArt.v1";
const heroTokenArtSize = 256;
const heroTokenPreviewSize = 74;
const preheroTokenManifestPath = "assets/tokens/preheros/manifest.json";
const longMoveFastAfterSteps = 5;
const longMoveFastMultiplier = 0.45;
const defaultD20Mode = "karmic";
const d20ModeLabels = {
  random: "Truly Random",
  karmic: "Karmic / Mercy Mode",
  tymora: "Tymora's Favorite",
};
const defaultRaceSelection = { raceId: "human", subraceId: "standard-human", dragonAncestryId: "red", abilityChoices: [] };
const dragonAncestries = {
  chromatic: {
    black: { name: "Black", damageType: "acid" },
    blue: { name: "Blue", damageType: "lightning" },
    green: { name: "Green", damageType: "poison" },
    red: { name: "Red", damageType: "fire" },
    white: { name: "White", damageType: "cold" },
  },
  gem: {
    amethyst: { name: "Amethyst", damageType: "force" },
    crystal: { name: "Crystal", damageType: "radiant" },
    emerald: { name: "Emerald", damageType: "psychic" },
    sapphire: { name: "Sapphire", damageType: "thunder" },
    topaz: { name: "Topaz", damageType: "necrotic" },
  },
  metallic: {
    brass: { name: "Brass", damageType: "fire" },
    bronze: { name: "Bronze", damageType: "lightning" },
    copper: { name: "Copper", damageType: "acid" },
    gold: { name: "Gold", damageType: "fire" },
    silver: { name: "Silver", damageType: "cold" },
  },
};
const speciesDefinitions = {
  human: {
    name: "Human",
    base: { abilityBonuses: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 }, speedFeet: 30 },
    subraces: {
      "standard-human": { name: "Standard Human", traits: ["Standard Human: +1 to every ability score."] },
    },
  },
  dwarf: {
    name: "Dwarf",
    base: {
      abilityBonuses: { con: 2 },
      speedFeet: 25,
      damageResistances: ["poison"],
      weaponProficiencies: ["battleaxe", "handaxe", "light-hammer", "warhammer"],
      traits: ["Dwarven Resilience: poison damage resistance.", "Dwarven Combat Training."],
    },
    subraces: {
      duergar: {
        name: "Duergar",
        abilityBonuses: { str: 1 },
        traits: ["Duergar Resilience stored for future condition/magic saves."],
        spellTraits: ["Enlarge/Reduce", "Invisibility"],
      },
      "hill-dwarf": {
        name: "Hill Dwarf",
        abilityBonuses: { wis: 1 },
        hpPerLevel: 1,
        traits: ["Dwarven Toughness: +1 max HP per level."],
      },
      "mountain-dwarf": {
        name: "Mountain Dwarf",
        abilityBonuses: { str: 2 },
        armorProficiencies: ["light", "medium"],
        traits: ["Dwarven Armor Training: light and medium armor proficiency."],
      },
    },
  },
  elf: {
    name: "Elf",
    base: {
      abilityBonuses: { dex: 2 },
      speedFeet: 30,
      skillProficiencies: ["perception"],
      traits: ["Keen Senses stored as Perception proficiency.", "Fey Ancestry stored for future charm/sleep handling."],
    },
    subraces: {
      drow: {
        name: "Drow",
        abilityBonuses: { cha: 1 },
        weaponProficiencies: ["rapier", "shortsword", "crossbow-hand"],
        spellTraits: ["Dancing Lights", "Faerie Fire", "Darkness"],
      },
      eladrin: {
        name: "Eladrin",
        abilityBonuses: { int: 1 },
        weaponProficiencies: ["longsword", "shortsword", "shortbow", "longbow"],
        traits: ["Fey Step stored for a future teleport action."],
      },
      "high-elf": {
        name: "High Elf",
        abilityBonuses: { int: 1 },
        weaponProficiencies: ["longsword", "shortsword", "shortbow", "longbow"],
        spellTraits: ["Wizard Cantrip"],
      },
      "shadar-kai": {
        name: "Shadar-kai",
        abilityBonuses: { con: 1 },
        damageResistances: ["necrotic"],
        traits: ["Blessing of the Raven Queen stored for a future teleport action."],
      },
      "wood-elf": {
        name: "Wood Elf",
        abilityBonuses: { wis: 1 },
        speedFeet: 35,
        weaponProficiencies: ["longsword", "shortsword", "shortbow", "longbow"],
        traits: ["Fleet of Foot: 35 ft speed.", "Mask of the Wild stored for future stealth rules."],
      },
    },
  },
  dragonborn: {
    name: "Dragonborn",
    base: {
      abilityBonuses: { str: 2, cha: 1 },
      speedFeet: 30,
      traits: ["Draconic Resistance from ancestry.", "Breath Weapon stored for a future area action."],
    },
    subraces: {
      chromatic: { name: "Chromatic", dragonCategory: "chromatic", traits: ["Chromatic Warding stored for future use."] },
      gem: { name: "Gem", dragonCategory: "gem", traits: ["Psionic Mind and Gem Flight stored for future systems."] },
      metallic: { name: "Metallic", dragonCategory: "metallic", traits: ["Metallic Breath Weapon stored for future use."] },
    },
  },
  gnome: {
    name: "Gnome",
    base: { abilityBonuses: { int: 2 }, speedFeet: 25, size: "small", traits: ["Gnome Cunning stored for future magic-save context."] },
    subraces: {
      "deep-gnome": { name: "Deep Gnome", abilityBonuses: { dex: 1 }, traits: ["Stone Camouflage stored for future stealth rules."] },
      "forest-gnome": { name: "Forest Gnome", abilityBonuses: { dex: 1 }, spellTraits: ["Minor Illusion"], traits: ["Speak with Small Beasts omitted for dungeon combat."] },
      "rock-gnome": { name: "Rock Gnome", abilityBonuses: { con: 1 }, traits: ["Artificer's Lore and Tinker stored for future noncombat/tool systems."] },
    },
  },
  "half-elf": {
    name: "Half-Elf",
    base: {
      abilityBonuses: { cha: 2 },
      speedFeet: 30,
      abilityChoiceCount: 2,
      traits: ["Fey Ancestry stored for future charm/sleep handling.", "Skill Versatility omitted until skill choices exist."],
    },
    subraces: {
      "drow-half-elf": { name: "Drow Descent", spellTraits: ["Drow Magic"] },
      "high-half-elf": { name: "High Elf Descent", spellTraits: ["Wizard Cantrip"] },
      "wood-half-elf": { name: "Wood Elf Descent", traits: ["Wood elf descent stored; Fleet of Foot choice is not auto-applied."] },
    },
  },
  halfling: {
    name: "Halfling",
    base: {
      abilityBonuses: { dex: 2 },
      speedFeet: 25,
      size: "small",
      halflingLucky: true,
      traits: ["Lucky: reroll d20 natural 1s.", "Brave stored for future frightened saves.", "Nimbleness stored for future creature-size movement."],
    },
    subraces: {
      ghostwise: { name: "Ghostwise", abilityBonuses: { wis: 1 }, traits: ["Silent Speech omitted until social/telepathy systems exist."] },
      lightfoot: { name: "Lightfoot", abilityBonuses: { cha: 1 }, traits: ["Naturally Stealthy stored for future stealth rules."] },
      stout: { name: "Stout", abilityBonuses: { con: 1 }, damageResistances: ["poison"], traits: ["Stout Resilience: poison damage resistance."] },
    },
  },
  "half-orc": {
    name: "Half-Orc",
    base: {
      abilityBonuses: { str: 2, con: 1 },
      speedFeet: 30,
      relentlessEndurance: true,
      savageAttacks: true,
      skillProficiencies: ["intimidation"],
      traits: ["Relentless Endurance: drop to 1 HP once per long rest.", "Savage Attacks: extra weapon die on melee crits."],
    },
    subraces: {
      "standard-half-orc": { name: "Standard Half-Orc" },
    },
  },
  tiefling: {
    name: "Tiefling",
    base: { speedFeet: 30, damageResistances: ["fire"], traits: ["Hellish Resistance: fire damage resistance."] },
    subraces: {
      baalzebul: { name: "Baalzebul", abilityBonuses: { cha: 2, int: 1 }, spellTraits: ["Thaumaturgy", "Ray of Sickness", "Crown of Madness"] },
      dispater: { name: "Dispater", abilityBonuses: { cha: 2, dex: 1 }, spellTraits: ["Thaumaturgy", "Disguise Self", "Detect Thoughts"] },
      fierna: { name: "Fierna", abilityBonuses: { cha: 2, wis: 1 }, spellTraits: ["Friends", "Charm Person", "Suggestion"] },
      glasya: { name: "Glasya", abilityBonuses: { cha: 2, dex: 1 }, spellTraits: ["Minor Illusion", "Disguise Self", "Invisibility"] },
      levistus: { name: "Levistus", abilityBonuses: { cha: 2, con: 1 }, spellTraits: ["Ray of Frost", "Armor of Agathys", "Darkness"] },
      mammon: { name: "Mammon", abilityBonuses: { cha: 2, int: 1 }, spellTraits: ["Mage Hand", "Tenser's Floating Disk", "Arcane Lock"] },
      mephistopheles: { name: "Mephistopheles", abilityBonuses: { cha: 2, int: 1 }, spellTraits: ["Mage Hand", "Burning Hands", "Flame Blade"] },
      zariel: { name: "Zariel", abilityBonuses: { cha: 2, str: 1 }, spellTraits: ["Thaumaturgy", "Searing Smite", "Branding Smite"] },
    },
  },
};
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
const classAbilityScoreImprovementLevels = {
  fighter: new Set([4, 6, 8, 12, 14, 16, 19]),
  rogue: new Set([4, 8, 10, 12, 16, 19]),
};
const classPredefinedAbilityScores = {
  barbarian: { str: 15, dex: 13, con: 14, int: 8, wis: 12, cha: 10 },
  bard: { str: 8, dex: 14, con: 13, int: 10, wis: 12, cha: 15 },
  cleric: { str: 13, dex: 10, con: 14, int: 8, wis: 15, cha: 12 },
  druid: { str: 8, dex: 13, con: 14, int: 12, wis: 15, cha: 10 },
  fighter: { str: 15, dex: 13, con: 14, int: 10, wis: 12, cha: 8 },
  monk: { str: 12, dex: 15, con: 13, int: 10, wis: 14, cha: 8 },
  paladin: { str: 15, dex: 12, con: 13, int: 8, wis: 10, cha: 14 },
  ranger: { str: 12, dex: 15, con: 13, int: 10, wis: 14, cha: 8 },
  rogue: { str: 8, dex: 15, con: 14, int: 13, wis: 12, cha: 10 },
  sorcerer: { str: 8, dex: 13, con: 14, int: 10, wis: 12, cha: 15 },
  warlock: { str: 10, dex: 13, con: 14, int: 8, wis: 12, cha: 15 },
  wizard: { str: 8, dex: 13, con: 14, int: 15, wis: 12, cha: 10 },
};

const els = {
  mainMenu: document.querySelector("#main-menu"),
  startAdventure: document.querySelector("#start-adventure"),
  mainTutorial: document.querySelector("#main-tutorial"),
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
  selectParty: document.querySelector("#select-party"),
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
  toggleAdminMode: document.querySelector("#toggle-admin-mode"),
  toggleLayout: document.querySelector("#toggle-layout"),
  zoomIn: document.querySelector("#zoom-in"),
  zoomOut: document.querySelector("#zoom-out"),
  zoomLabel: document.querySelector("#zoom-label"),
  volumeSlider: document.querySelector("#volume-slider"),
  volumeLabel: document.querySelector("#volume-label"),
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
  tutorialTour: document.querySelector("#tutorial-tour"),
  tutorialHighlight: document.querySelector("#tutorial-highlight"),
  tutorialTourStep: document.querySelector("#tutorial-tour-step"),
  tutorialTourTitle: document.querySelector("#tutorial-tour-title"),
  tutorialTourBody: document.querySelector("#tutorial-tour-body"),
  tutorialTourBack: document.querySelector("#tutorial-tour-back"),
  tutorialTourNext: document.querySelector("#tutorial-tour-next"),
  tutorialTourClose: document.querySelector("#tutorial-tour-close"),
};

function createInitialState(heroNameOverride = "", heroForDifficulty = null, heroOptions = {}, themeId = defaultContent.theme) {
  const dungeonDefinition = getContentDefinition("dungeons", defaultContent.dungeon);
  const theme = getContentDefinition("themes", themeId);
  const dungeonOptions = {
    ...(dungeonDefinition?.options ?? window.DungeonConfig.dungeon),
  };
  const partySize = partySizeForSwarm(heroForDifficulty);
  const isSoloFirstLevelDungeon = (heroForDifficulty?.level === 1 || heroForDifficulty == null) && partySize <= 1;
  if (isSoloFirstLevelDungeon) {
    dungeonOptions.roomCount = 10;
  }
  Object.assign(dungeonOptions, theme?.generator ?? {});
  const category = categoryForHeroLevel(heroForDifficulty?.level ?? 1);
  const categoryRoomCount = theme?.generator?.roomCountByCategory?.[category];
  if (categoryRoomCount && (category !== 1 || partySize <= 1)) dungeonOptions.roomCount = categoryRoomCount;
  const dungeon = generateDungeon(dungeonOptions);
  const classId = heroOptions.classId ?? defaultContent.heroClass;
  const heroTemplate = applyHeroCreationOptions(
    {
      ...getHeroTemplate(classId),
      id: "hero",
      name: heroNameOverride.trim() || getHeroTemplate(classId).name,
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
    d20Mode: heroOptions.d20Mode ?? defaultD20Mode,
    d20FailureStreak: 0,
    shortRestsUsed: 0,
    shortRestLimit: theme?.rest?.shortRestLimit ?? 3,
    chest: [],
    chestMoney: { cp: 0, sp: 0, gp: 0 },
    lootPiles: [],
    dungeonObjects,
    party: {
      activeHeroId: "hero",
      heroIds: ["hero"],
      rosterIds: ["hero"],
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

function dungeonStartPositions(dungeon, count, blockedKeys = new Set()) {
  const entranceRoom = dungeon.rooms.find((room) => room.id === dungeon.entranceRoomId) ?? dungeon.rooms[0];
  const blocked = new Set([...(entranceRoom?.doors ?? []).map(positionKey), ...blockedKeys]);
  return (entranceRoom?.cells ?? [])
    .filter((cell) => !blocked.has(positionKey(cell)))
    .sort((a, b) => distance(a, dungeon.startPosition) - distance(b, dungeon.startPosition))
    .slice(0, count);
}

function createDungeonStateForParty(partyMembers, previousState, themeId = defaultContent.theme) {
  const leader = partyMembers[0] ?? previousState?.fighters?.hero;
  const partyDifficulty = {
    ...(leader ?? {}),
    level: averagePartyLevel({ level: leader?.level ?? 1 }),
    partySize: partyMembers.length,
  };
  const nextState = createInitialState(leader?.name ?? getHeroTemplate().name, partyDifficulty, {}, themeId);
  const blockedKeys = new Set((nextState.dungeonObjects ?? []).filter(objectBlocksMovement).flatMap(objectCells).map(positionKey));
  const positions = dungeonStartPositions(nextState.dungeon, partyMembers.length, blockedKeys);
  const partyIds = new Set(partyMembers.map((hero) => hero.id));
  const previousRosterIds = previousState?.party?.rosterIds ?? partyMembers.map((hero) => hero.id);
  const previousRoster = previousRosterIds.map((id) => previousState?.fighters?.[id]).filter(Boolean);
  const heroes = {};
  partyMembers.forEach((hero, index) => {
    const position = positions[index] ?? nextState.dungeon.startPosition;
    refreshItemChargesForFighter(hero, "newDungeon");
    heroes[hero.id] = refreshDerivedStats({
      ...hero,
      position: { ...position },
      hp: hero.maxHp,
      hitDiceRemaining: hero.level ?? 1,
      movementLeft: Math.floor(hero.speedFeet / feetPerSquare),
      hasAction: true,
      hasBonusAction: true,
      alive: true,
    });
    resetFighterAbilityUses(heroes[hero.id]);
  });
  previousRoster
    .filter((hero) => !partyIds.has(hero.id))
    .forEach((hero) => {
      heroes[hero.id] = {
        ...hero,
        position: { x: -1, y: -1 },
        alive: false,
      };
    });
  const monsters = Object.fromEntries(Object.entries(nextState.fighters).filter(([id]) => !nextState.party.heroIds.includes(id)));
  nextState.fighters = { ...heroes, ...monsters };
  nextState.party = {
    activeHeroId: partyMembers[0]?.id ?? "hero",
    heroIds: partyMembers.map((hero) => hero.id).slice(0, 4),
    rosterIds: previousRosterIds,
  };
  nextState.saveSlotId = previousState?.saveSlotId ?? activeSaveSlot;
  nextState.chest = previousState?.chest ?? [];
  nextState.chestMoney = normalizeMoney(previousState?.chestMoney ?? {});
  nextState.d20Mode = normalizeD20Mode(previousState?.d20Mode);
  nextState.d20FailureStreak = previousState?.d20FailureStreak ?? 0;
  return nextState;
}

function homeHeroPositions(heroIds) {
  return heroIds.map((id, index) => ({ id, position: { x: 3 + (index % 4), y: 5 + Math.floor(index / 4) } }));
}

function prepareRestedHero(hero, position) {
  refreshItemChargesForFighter(hero, "home");
  refreshItemChargesForFighter(hero, "longRest");
  refreshItemChargesForFighter(hero, "newDungeon");
  if (hero.dead) {
    return refreshDerivedStats({
      ...hero,
      hp: 0,
      position: { ...position },
      alive: false,
      deathSaves: hero.deathSaves ?? { successes: 0, failures: 3 },
    });
  }
  const restedHero = refreshDerivedStats({
    ...hero,
    hp: hero.maxHp,
    hitDiceRemaining: hero.level ?? 1,
    position: { ...position },
    movementLeft: Math.floor(hero.speedFeet / feetPerSquare),
    hasAction: true,
    hasBonusAction: true,
    alive: true,
    deathSaves: { successes: 0, failures: 0 },
    relentlessEnduranceUsed: false,
  });
  resetFighterAbilityUses(restedHero);
  restedHero.spellPoints = spellPointMaximum(restedHero);
  ensureSpellPointState(restedHero);
  return restedHero;
}

function createHomeState(heroOrHeroes, chest = [], chestMoney = { cp: 0, sp: 0, gp: 0 }, partyData = null) {
  const cells = Array.from({ length: 100 }, (_, index) => ({ x: index % 10, y: Math.floor(index / 10) }));
  const homeDoor = { x: 9, y: 5, roomId: "home-room", to: "outside" };
  const incomingHeroes = Array.isArray(heroOrHeroes) ? heroOrHeroes : [heroOrHeroes];
  const rosterIds = partyData?.rosterIds?.length ? partyData.rosterIds : incomingHeroes.map((hero) => hero.id);
  const livingRosterIds = rosterIds.filter((id) => !incomingHeroes.find((hero) => hero.id === id)?.dead);
  const heroIds = (partyData?.heroIds?.length ? partyData.heroIds : livingRosterIds.slice(0, 1)).filter((id) => livingRosterIds.includes(id));
  const positions = new Map(homeHeroPositions(rosterIds).map((entry) => [entry.id, entry.position]));
  const fighters = Object.fromEntries(
    incomingHeroes.map((hero, index) => {
      const id = hero.id ?? (index === 0 ? "hero" : `hero-${Date.now()}-${index}`);
      const position = positions.get(id) ?? { x: 3 + (index % 4), y: 5 + Math.floor(index / 4) };
      return [id, prepareRestedHero({ ...hero, id, partyRole: hero.partyRole ?? (id === "hero" ? "tank" : "dd") }, position)];
    }),
  );
  const activeHeroId = fighters[partyData?.activeHeroId] && !fighters[partyData.activeHeroId].dead ? partyData.activeHeroId : heroIds.find((id) => fighters[id] && !fighters[id].dead) ?? livingRosterIds[0] ?? "hero";

  return {
    combatStarted: false,
    mode: "home",
    round: 0,
    activeIndex: 0,
    initiative: [],
    room: {
      id: "home",
      name: "Home",
      gridSize: 10,
      tileSizePx,
    },
    dungeon: {
      id: "home",
      roomCount: 1,
      gridSize: 10,
      rooms: [{ id: "home-room", name: "Home", cells, doors: [homeDoor] }],
      walkable: cells,
      corridors: [],
      doors: [homeDoor],
      corridorPassages: [],
      entranceRoomId: "home-room",
      startPosition: { x: 4, y: 5 },
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
    d20Mode: normalizeD20Mode(partyData?.d20Mode ?? state?.d20Mode ?? defaultD20Mode),
    d20FailureStreak: partyData?.d20FailureStreak ?? state?.d20FailureStreak ?? 0,
    shortRestsUsed: 0,
    shortRestLimit: 3,
    chest,
    chestMoney: normalizeMoney(chestMoney),
    lootPiles: [],
    dungeonObjects: [],
    party: {
      activeHeroId,
      heroIds: heroIds.filter((id) => fighters[id] && !fighters[id].dead).slice(0, 4),
      rosterIds: rosterIds.filter((id) => fighters[id]),
    },
    fighters,
    log: [
      {
        text: `${fighters[activeHeroId]?.name ?? "The party"} returns home and takes a long rest.`,
        type: "important",
      },
    ],
  };
}

function isPartyHeroId(id) {
  return (state?.party?.heroIds ?? ["hero"]).includes(id);
}

function isRosterHeroId(id) {
  return (state?.party?.rosterIds ?? state?.party?.heroIds ?? ["hero"]).includes(id);
}

function normalizeD20Mode(mode) {
  return Object.prototype.hasOwnProperty.call(d20ModeLabels, mode) ? mode : defaultD20Mode;
}

function d20ModeOptionsMarkup(selectedMode = state?.d20Mode ?? defaultD20Mode) {
  const selected = normalizeD20Mode(selectedMode);
  return Object.entries(d20ModeLabels)
    .map(([value, label]) => `<option value="${value}" ${value === selected ? "selected" : ""}>${escapeHtml(label)}</option>`)
    .join("");
}

function playerControlledFighter(fighter) {
  return Boolean(fighter && (isPartyHeroId(fighter.id) || isRosterHeroId(fighter.id) || fighter.friendly || fighter.team === "heroes"));
}

function tymoraD20Roll() {
  const first = rollDie(20);
  if (Math.random() >= 0.35) return first;
  return Math.max(first, rollDie(20));
}

function baseD20ForMode(mode = state?.d20Mode) {
  return normalizeD20Mode(mode) === "tymora" ? tymoraD20Roll() : rollDie(20);
}

function karmicD20Bonus() {
  const streak = state?.d20FailureStreak ?? 0;
  if (streak >= 4) return 5;
  if (streak >= 3) return 2;
  return 0;
}

function rollD20ForFighter(fighter, options = {}) {
  const usePlayerMode = playerControlledFighter(fighter);
  const mode = usePlayerMode ? normalizeD20Mode(state?.d20Mode) : "random";
  const rollOne = () => {
    const roll = baseD20ForMode(mode);
    if (fighter?.racialTraits?.halflingLucky && roll === 1) {
      if (state?.log) addLog(`${fighter.name}'s Halfling Lucky rerolls a natural 1.`, "important");
      return baseD20ForMode(mode);
    }
    return roll;
  };
  const rawRolls = options.disadvantage || options.advantage ? [rollOne(), rollOne()] : [rollOne()];
  const hiddenBonus = usePlayerMode && mode === "karmic" ? karmicD20Bonus() : 0;
  const rolls = rawRolls.map((roll) => Math.min(20, roll + hiddenBonus));
  const roll = options.disadvantage ? Math.min(...rolls) : options.advantage ? Math.max(...rolls) : rolls[0];
  return { roll, rolls, rawRolls };
}

function recordD20OutcomeForFighter(fighter, success) {
  if (!playerControlledFighter(fighter) || normalizeD20Mode(state?.d20Mode) !== "karmic") return;
  state.d20FailureStreak = success ? 0 : Math.max(0, Math.floor(state.d20FailureStreak ?? 0)) + 1;
}

function activeHero() {
  const activeId = state?.party?.activeHeroId ?? "hero";
  return state?.fighters?.[activeId] ?? state?.fighters?.hero;
}

function setActiveHero(heroId) {
  if (!state?.fighters?.[heroId] || state.fighters[heroId].dead || !isRosterHeroId(heroId)) return false;
  if (state.mode !== "home" && !isPartyHeroId(heroId)) return false;
  state.party.activeHeroId = heroId;
  selectedHeroIds = new Set([heroId]);
  return true;
}

function selectableHeroIds() {
  return new Set(
    (state.mode === "home" ? rosterHeroes() : partyHeroes())
      .filter((hero) => heroCanAct(hero))
      .map((hero) => hero.id),
  );
}

function selectedMovableHeroes(anchorId = activeHero()?.id) {
  const allowedIds = selectableHeroIds();
  const ids = Array.from(selectedHeroIds).filter((id) => allowedIds.has(id));
  if (anchorId && allowedIds.has(anchorId) && !ids.includes(anchorId)) ids.unshift(anchorId);
  return ids.map((id) => state.fighters[id]).filter(Boolean);
}

function toggleHeroSelection(heroId) {
  const allowedIds = selectableHeroIds();
  if (!allowedIds.has(heroId)) return false;
  const nextSelection = new Set(selectedHeroIds);
  if (nextSelection.has(heroId) && nextSelection.size > 1) {
    nextSelection.delete(heroId);
  } else {
    nextSelection.add(heroId);
  }
  selectedHeroIds = nextSelection;
  state.party.activeHeroId = heroId;
  return true;
}

function selectActivePartyForMovement() {
  const ids = partyHeroes()
    .filter((hero) => heroCanAct(hero))
    .map((hero) => hero.id);
  if (ids.length === 0) return false;
  selectedHeroIds = new Set(ids);
  if (!selectedHeroIds.has(state.party.activeHeroId)) state.party.activeHeroId = ids[0];
  render();
  return true;
}

function rosterHeroes() {
  return (state?.party?.rosterIds ?? state?.party?.heroIds ?? ["hero"])
    .map((id) => state.fighters[id])
    .filter(Boolean);
}

function livingPartyHeroIds() {
  return (state.party?.heroIds ?? ["hero"]).filter((id) => state.fighters[id] && !state.fighters[id].dead);
}

function promoteMainHero(heroId) {
  if (!state.fighters[heroId] || state.fighters[heroId].dead) return;
  const currentIds = (state.party.heroIds ?? ["hero"]).filter((id) => id !== heroId && state.fighters[id] && !state.fighters[id].dead);
  state.party.heroIds = [heroId, ...currentIds].slice(0, 4);
  state.party.activeHeroId = heroId;
}

function normalizeHomeLayout(gameState) {
  if (gameState?.mode !== "home") return;
  const cells = Array.from({ length: 100 }, (_, index) => ({ x: index % 10, y: Math.floor(index / 10) }));
  const homeDoor = { x: 9, y: 5, roomId: "home-room", to: "outside" };
  gameState.combatStarted = false;
  gameState.activeIndex = 0;
  gameState.initiative = [];
  gameState.room = {
    id: "home",
    name: "Home",
    gridSize: 10,
    tileSizePx,
  };
  gameState.dungeon = {
    ...(gameState.dungeon ?? {}),
    id: "home",
    roomCount: 1,
    gridSize: 10,
    rooms: [{ id: "home-room", name: "Home", cells, doors: [homeDoor] }],
    walkable: cells,
    corridors: [],
    doors: [homeDoor],
    corridorPassages: [],
    entranceRoomId: "home-room",
    startPosition: { x: 4, y: 5 },
  };
  gameState.exit = { roomId: "home-room", position: { ...homeDoor } };
  gameState.exploration = {
    ...(gameState.exploration ?? {}),
    discoveredRoomIds: ["home-room"],
    openedDoorKeys: [],
    openedCorridorKeys: [],
  };
  gameState.dungeonObjects = [];
  gameState.lootPiles = [];
  const rosterIds = new Set(gameState.party?.rosterIds ?? gameState.party?.heroIds ?? ["hero"]);
  for (const fighterId of Object.keys(gameState.fighters ?? {})) {
    if (!rosterIds.has(fighterId)) delete gameState.fighters[fighterId];
  }
  const positions = new Map(homeHeroPositions(gameState.party?.rosterIds ?? ["hero"]).map((entry) => [entry.id, entry.position]));
  for (const heroId of gameState.party?.rosterIds ?? ["hero"]) {
    const hero = gameState.fighters?.[heroId];
    if (!hero) continue;
    hero.position = { ...(positions.get(heroId) ?? { x: 4, y: 5 }) };
    if (!hero.dead) hero.alive = true;
  }
  gameState.party.heroIds = (gameState.party.heroIds ?? ["hero"]).filter((id) => gameState.fighters[id] && !gameState.fighters[id].dead).slice(0, 4);
  if (!gameState.fighters[gameState.party.activeHeroId] || gameState.fighters[gameState.party.activeHeroId].dead) {
    gameState.party.activeHeroId = gameState.party.heroIds[0] ?? gameState.party.rosterIds.find((id) => gameState.fighters[id] && !gameState.fighters[id].dead) ?? "hero";
  }
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

function loadCustomHeroTokenArt() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(heroTokenArtStorageKey) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((entry) => entry?.id && entry?.dataUrl) : [];
  } catch {
    return [];
  }
}

function saveCustomHeroTokenArt(entries) {
  window.localStorage.setItem(heroTokenArtStorageKey, JSON.stringify(entries));
}

async function loadPredefinedHeroTokenArt() {
  try {
    const response = await fetch(preheroTokenManifestPath, { cache: "no-cache" });
    if (!response.ok) return;
    const files = await response.json();
    predefinedHeroTokenArt = (Array.isArray(files) ? files : [])
      .filter((file) => typeof file === "string" && /\.(png|jpe?g|webp|gif|svg)$/i.test(file))
      .map((file) => ({
        name: file.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
        path: `assets/tokens/preheros/${file}`,
      }));
  } catch {
    predefinedHeroTokenArt = [];
  }
}

function heroTokenArtOptions() {
  const presets = predefinedHeroTokenArt.map((entry) => ({
    label: entry.name,
    value: entry.path,
    custom: false,
  }));
  const custom = loadCustomHeroTokenArt().map((entry) => ({
    label: entry.tokenName ?? entry.name ?? "Custom token",
    value: `${customHeroTokenArtPrefix}${entry.id}`,
    dataUrl: entry.dataUrl,
    custom: true,
  }));
  return [
    { label: "No picture", value: noHeroTokenArtValue },
    ...presets,
    ...custom,
  ];
}

function resolveHeroTokenArtSelection(value) {
  if (!value || value === noHeroTokenArtValue) return "";
  if (!value.startsWith(customHeroTokenArtPrefix)) return value;
  const customId = value.slice(customHeroTokenArtPrefix.length);
  return loadCustomHeroTokenArt().find((entry) => entry.id === customId)?.dataUrl ?? "";
}

function selectionValueForHeroTokenArt(tokenArt) {
  if (!tokenArt) return noHeroTokenArtValue;
  const custom = loadCustomHeroTokenArt().find((entry) => entry.dataUrl === tokenArt);
  return custom ? `${customHeroTokenArtPrefix}${custom.id}` : tokenArt;
}

function safeTokenArtName(name, suffix) {
  const cleaned = String(name || "hero")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
  return `${cleaned || "hero"}_${suffix}`;
}

function deleteCustomHeroTokenArt(selectionValue) {
  if (!selectionValue?.startsWith(customHeroTokenArtPrefix)) return false;
  const customId = selectionValue.slice(customHeroTokenArtPrefix.length);
  const entries = loadCustomHeroTokenArt();
  const nextEntries = entries.filter((entry) => entry.id !== customId);
  if (nextEntries.length === entries.length) return false;
  saveCustomHeroTokenArt(nextEntries);
  return true;
}

function renameCustomHeroTokenArt(selectionValue, heroName) {
  if (!selectionValue?.startsWith(customHeroTokenArtPrefix)) return;
  const customId = selectionValue.slice(customHeroTokenArtPrefix.length);
  const entries = loadCustomHeroTokenArt();
  const entry = entries.find((candidate) => candidate.id === customId);
  if (!entry) return;
  entry.name = safeTokenArtName(heroName, "token");
  entry.fullName = safeTokenArtName(heroName, "full");
  entry.tokenName = safeTokenArtName(heroName, "token");
  saveCustomHeroTokenArt(entries);
}

function imageFileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith("image/")) {
      reject(new Error("Not an image file."));
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("error", () => reject(new Error("Could not read image.")));
    reader.addEventListener("load", () => resolve(reader.result));
    reader.readAsDataURL(file);
  });
}

function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("error", () => reject(new Error("Could not load image.")));
    image.addEventListener("load", () => resolve(image));
    image.src = src;
  });
}

function tokenCropDrawMetrics(imageSize, outputSize, crop = {}) {
  const width = Math.max(1, imageSize?.width ?? outputSize);
  const height = Math.max(1, imageSize?.height ?? outputSize);
  const zoom = clamp(Number(crop.zoom ?? 1), 1, 4);
  const scale = Math.max(outputSize / width, outputSize / height) * zoom;
  const centerX = clamp(Number(crop.x ?? 0.5), 0, 1) * width;
  const centerY = clamp(Number(crop.y ?? 0.5), 0, 1) * height;
  return {
    width,
    height,
    scale,
    drawWidth: width * scale,
    drawHeight: height * scale,
    left: outputSize / 2 - centerX * scale,
    top: outputSize / 2 - centerY * scale,
  };
}

async function cropTokenDataUrl(fullDataUrl, crop = {}) {
  const image = await loadImageElement(fullDataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = heroTokenArtSize;
  canvas.height = heroTokenArtSize;
  const context = canvas.getContext("2d");
  const metrics = tokenCropDrawMetrics(image, heroTokenArtSize, crop);
  context.clearRect(0, 0, heroTokenArtSize, heroTokenArtSize);
  context.drawImage(
    image,
    metrics.left,
    metrics.top,
    metrics.drawWidth,
    metrics.drawHeight,
  );
  return canvas.toDataURL("image/png");
}

function combatantRoleLabel(combatant) {
  const species = combatant?.speciesName ? ` ${combatant.speciesName}` : "";
  if (combatant.id === "hero" || isRosterHeroId(combatant?.id)) return `Level ${combatant.level ?? 1}${species} ${combatant.className ?? "Fighter"}`;
  return combatant.role;
}

function fighterAbilityDefinitions(fighter = state?.fighters?.hero) {
  const source = fighter?.abilities ?? (isRosterHeroId(fighter?.id) ? getHeroTemplate(fighter?.classId).abilities : []) ?? [];
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

function spellPointMaximum(fighter) {
  const level = fighter?.level ?? 1;
  const progression = fighter?.spellPointProgression ?? {};
  let points = fighter?.spellPointMax ?? progression[level] ?? 0;
  for (const [entryLevel, value] of Object.entries(progression)) {
    if (level >= Number(entryLevel)) points = value;
  }
  return Math.max(0, Number(points) || 0);
}

function classSpellListForFighter(fighter = state?.fighters?.hero) {
  return [...(fighter?.classSpellList ?? fighter?.spellList ?? fighter?.spells ?? [])];
}

function spellDefinitionsForFighter(fighter = state?.fighters?.hero) {
  return (fighter?.spells ?? [])
    .map((spellId) => getContentDefinition("spells", spellId))
    .filter((spell) => spell && spellUnlockedForFighter(fighter, spell));
}

function casterTypeForFighter(fighter) {
  return fighter?.casterType ?? (["paladin", "ranger"].includes(fighter?.classId) ? "half" : fighter?.classId === "warlock" ? "pact" : "full");
}

function maxSpellLevelForFighter(fighter) {
  const level = fighter?.level ?? 1;
  const casterType = casterTypeForFighter(fighter);
  if (casterType === "none") return 0;
  if (casterType === "pact") return level >= 9 ? 5 : level >= 7 ? 4 : level >= 5 ? 3 : level >= 3 ? 2 : 1;
  if (casterType === "half") return level >= 17 ? 5 : level >= 13 ? 4 : level >= 9 ? 3 : level >= 5 ? 2 : 1;
  return level >= 17 ? 9 : level >= 15 ? 8 : level >= 13 ? 7 : level >= 11 ? 6 : level >= 9 ? 5 : level >= 7 ? 4 : level >= 5 ? 3 : level >= 3 ? 2 : 1;
}

function spellUnlockedForFighter(fighter, spell) {
  if (!fighter || !spell) return false;
  return spellBaseLevel(spell) <= maxSpellLevelForFighter(fighter);
}

function ensureSpellPointState(fighter) {
  const max = spellPointMaximum(fighter);
  fighter.spellPointMax = max;
  fighter.spellPoints = Math.min(max, fighter.spellPoints ?? max);
  fighter.classSpellList = classSpellListForFighter(fighter);
  fighter.spells = [...(fighter.spells ?? [])].filter((spellId) => fighter.classSpellList.includes(spellId));
  return fighter;
}

function resetFighterAbilityUses(fighter, refresh = "all") {
  fighter.abilityUses = refresh === "all" ? {} : { ...(fighter.abilityUses ?? {}) };
  for (const ability of fighterAbilityDefinitions(fighter)) {
    if ((fighter.level ?? 1) >= (ability.level ?? 1) && (refresh === "all" || ability.refresh === refresh || ability.refresh === "turn")) {
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
  ensureSpellPointState(fighter);
  return fighter;
}

function scoreToMod(score) {
  return Math.floor((score - 10) / 2);
}

function abilityModsFromScores(scores = {}) {
  return Object.fromEntries(abilities.map((ability) => [ability, scoreToMod(scores[ability] ?? 10)]));
}

function proficiencyBonus(fighter) {
  return 2 + Math.floor(((fighter?.level ?? 1) - 1) / 4);
}

function firstSubraceId(raceId) {
  return Object.keys(speciesDefinitions[raceId]?.subraces ?? {})[0] ?? "";
}

function normalizeRaceSelection(selection = defaultRaceSelection) {
  const raceId = speciesDefinitions[selection?.raceId] ? selection.raceId : defaultRaceSelection.raceId;
  const subraces = speciesDefinitions[raceId]?.subraces ?? {};
  const subraceId = subraces[selection?.subraceId] ? selection.subraceId : firstSubraceId(raceId);
  const subrace = subraces[subraceId] ?? {};
  const dragonCategory = subrace.dragonCategory;
  const ancestries = dragonCategory ? dragonAncestries[dragonCategory] ?? {} : {};
  const dragonAncestryId =
    dragonCategory && ancestries[selection?.dragonAncestryId]
      ? selection.dragonAncestryId
      : dragonCategory
        ? Object.keys(ancestries)[0]
        : "";
  return {
    raceId,
    subraceId,
    dragonAncestryId,
    abilityChoices: Array.isArray(selection?.abilityChoices) ? selection.abilityChoices.filter((ability) => abilities.includes(ability)) : [],
  };
}

function mergeAbilityBonuses(...bonuses) {
  const merged = {};
  for (const bonus of bonuses) {
    for (const [ability, value] of Object.entries(bonus ?? {})) {
      if (!abilities.includes(ability)) continue;
      merged[ability] = (merged[ability] ?? 0) + value;
    }
  }
  return merged;
}

function uniqueValues(values = []) {
  return Array.from(new Set(values.filter(Boolean)));
}

function raceTraitsForSelection(selection = defaultRaceSelection) {
  const normalized = normalizeRaceSelection(selection);
  const race = speciesDefinitions[normalized.raceId];
  const subrace = race?.subraces?.[normalized.subraceId] ?? {};
  const base = race?.base ?? {};
  const ancestry = subrace.dragonCategory ? dragonAncestries[subrace.dragonCategory]?.[normalized.dragonAncestryId] : null;
  const chosenBonuses = {};
  const choiceCount = base.abilityChoiceCount ?? subrace.abilityChoiceCount ?? 0;
  for (const ability of normalized.abilityChoices.slice(0, choiceCount)) {
    chosenBonuses[ability] = (chosenBonuses[ability] ?? 0) + 1;
  }
  const abilityBonuses = mergeAbilityBonuses(base.abilityBonuses, subrace.abilityBonuses, chosenBonuses);
  const damageResistances = uniqueValues([...(base.damageResistances ?? []), ...(subrace.damageResistances ?? []), ancestry?.damageType]);
  return {
    raceId: normalized.raceId,
    subraceId: normalized.subraceId,
    dragonAncestryId: normalized.dragonAncestryId,
    raceName: race?.name ?? "Human",
    subraceName: subrace.name ?? "Standard Human",
    ancestryName: ancestry?.name ?? "",
    abilityBonuses,
    speedFeet: subrace.speedFeet ?? base.speedFeet ?? 30,
    size: subrace.size ?? base.size ?? "medium",
    hpPerLevel: (base.hpPerLevel ?? 0) + (subrace.hpPerLevel ?? 0),
    damageResistances,
    weaponProficiencies: uniqueValues([...(base.weaponProficiencies ?? []), ...(subrace.weaponProficiencies ?? [])]),
    armorProficiencies: uniqueValues([...(base.armorProficiencies ?? []), ...(subrace.armorProficiencies ?? [])]),
    skillProficiencies: uniqueValues([...(base.skillProficiencies ?? []), ...(subrace.skillProficiencies ?? [])]),
    traits: uniqueValues([...(base.traits ?? []), ...(subrace.traits ?? [])]),
    spellTraits: uniqueValues([...(base.spellTraits ?? []), ...(subrace.spellTraits ?? [])]),
    halflingLucky: Boolean(base.halflingLucky || subrace.halflingLucky),
    relentlessEndurance: Boolean(base.relentlessEndurance || subrace.relentlessEndurance),
    savageAttacks: Boolean(base.savageAttacks || subrace.savageAttacks),
    dragonDamageType: ancestry?.damageType ?? "",
  };
}

function raceAbilityBonuses(selection = defaultRaceSelection) {
  return raceTraitsForSelection(selection).abilityBonuses;
}

function raceDisplayName(selection = defaultRaceSelection) {
  const traits = raceTraitsForSelection(selection);
  const ancestry = traits.ancestryName ? ` (${traits.ancestryName})` : "";
  return `${traits.raceName} - ${traits.subraceName}${ancestry}`;
}

function abilityBonusSummary(bonuses = {}) {
  const parts = abilities
    .filter((ability) => bonuses[ability])
    .map((ability) => `${ability.toUpperCase()} ${abilityLabel(bonuses[ability])}`);
  return parts.length ? parts.join(", ") : "No ability bonus";
}

function applyHeroCreationOptions(template, options = {}) {
  const settings = { ...template, ...options };
  const classId = options.classId ?? settings.classId ?? defaultContent.heroClass;
  const raceSelection = normalizeRaceSelection(options.raceSelection);
  const raceTraits = raceTraitsForSelection(raceSelection);
  const abilityScores = options.abilityScores
    ? Object.fromEntries(abilities.map((ability) => [ability, (options.abilityScores[ability] ?? 10) + (raceTraits.abilityBonuses[ability] ?? 0)]))
    : undefined;
  const abilityMods = abilityScores ? abilityModsFromScores(abilityScores) : { ...(settings.abilityMods ?? {}) };
  const hitDie = template.hitDie ?? 10;
  const level = settings.level ?? 1;
  const maxHp = abilityScores ? hitDie + abilityMods.con + (raceTraits.hpPerLevel ?? 0) * level : (settings.maxHp ?? template.maxHp);
  return {
    ...settings,
    classId,
    className: settings.className ?? settings.class ?? "Fighter",
    raceSelection,
    race: raceTraits.raceId,
    subrace: raceTraits.subraceId,
    speciesName: raceTraits.raceName,
    subraceName: raceTraits.subraceName,
    dragonAncestryId: raceTraits.dragonAncestryId,
    racialAbilityBonuses: raceTraits.abilityBonuses,
    racialHpPerLevel: raceTraits.hpPerLevel,
    racialTraits: {
      halflingLucky: raceTraits.halflingLucky,
      relentlessEndurance: raceTraits.relentlessEndurance,
      savageAttacks: raceTraits.savageAttacks,
      dragonDamageType: raceTraits.dragonDamageType,
      traits: raceTraits.traits,
      spellTraits: raceTraits.spellTraits,
    },
    size: raceTraits.size,
    baseSpeedFeet: raceTraits.speedFeet,
    speedFeet: raceTraits.speedFeet,
    damageResistances: uniqueValues([...(settings.damageResistances ?? []), ...raceTraits.damageResistances]),
    weaponProficiencies: uniqueValues([...(settings.weaponProficiencies ?? []), ...raceTraits.weaponProficiencies]),
    armorProficiencies: uniqueValues([...(settings.armorProficiencies ?? []), ...raceTraits.armorProficiencies]),
    skillProficiencies: uniqueValues([...(settings.skillProficiencies ?? []), ...raceTraits.skillProficiencies]),
    abilityScores,
    abilityMods,
    baseAttackAbilityMod: template.abilityMods?.str ?? 0,
    baseMaxHp: maxHp,
    maxHp,
    hp: maxHp,
    relentlessEnduranceUsed: false,
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
  root.style.setProperty("--wall-edge", palette.wallEdge ?? palette.wallDetail ?? palette.wallLine ?? "rgba(246, 234, 216, 0.32)");
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
  audio.volume = 0.1 * soundVolume;
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
  currentMusic.volume = 0.1 * soundVolume;
  currentMusic.play().catch(() => {});
}

function getHeroTemplate(classId = defaultContent.heroClass) {
  return getContentDefinition("classes", classId) ?? getContentDefinition("classes", defaultContent.heroClass) ?? templates.hero;
}

function getMonsterTemplate(monsterId = defaultContent.monster) {
  return getContentDefinition("monsters", monsterId) ?? (monsterId === defaultContent.monster ? templates.monster : null);
}

function adminEnabled() {
  return adminMode && gameHasStarted;
}

function disableAdminModeOptions() {
  showDungeonLayout = false;
  adminTeleportEnabled = false;
  adminGodMode = false;
  inventoryAdminOpen = false;
  adminMonsterCatalogOpen = false;
  adminMonsterSearch = "";
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

const swarmSpawnTuning = {
  minimumCount: 2,
  maximumPartySize: 4,
  basePartySize: 1,
  extraPerPartyMember: 1,
  extraPerCategoryGap: 1,
  maximumExtraFromLevelGap: 4,
  absoluteMaximum: 8,
};

const roomMonsterSpawnTuning = {
  baseCount: 1,
  extraPerPartyMember: 0.65,
  categoryGapBonus: 0.45,
  randomSpread: 0.6,
  maximumCount: 5,
  entranceRoomSpawnChance: 0,
  roomSpawnChance: 0.72,
};

const monsterThrownWeaponPickupChance = 0.02;
const monsterSpecialAbilityTuning = {
  activeUseChance: 0.72,
  onHitUseChance: 0.82,
  defensiveUseChance: 0.9,
  saveDcBase: 10,
  saveDcPerCategory: 1,
  chargeMinFeet: 20,
  lineRangeFeet: 15,
  burstRangeFeet: 10,
  rangedSpecialFeet: 30,
  shellGuardAcBonus: 2,
  bossRoarAttackPenalty: -1,
};

function monsterCategoryRingColor(monster) {
  const category = Math.max(1, Math.min(10, Number(monsterCategory(monster)) || 1));
  return monsterCategoryRingColors[category] ?? monsterCategoryRingColors[1];
}

function averagePartyLevel(hero = state?.fighters?.hero) {
  const heroIds = state?.party?.heroIds ?? ["hero"];
  const heroes = heroIds.map((id) => state?.fighters?.[id]).filter(Boolean);
  if (heroes.length === 0) return hero?.level ?? 1;
  return heroes.reduce((sum, entry) => sum + (entry.level ?? 1), 0) / heroes.length;
}

function partySizeForSwarm(hero = state?.fighters?.hero) {
  const stateSize = state?.party?.heroIds?.length;
  const explicitSize = hero?.partySize ?? hero?.party?.size;
  return clamp(Number(stateSize ?? explicitSize ?? 1) || 1, 1, swarmSpawnTuning.maximumPartySize);
}

function swarmSpawnCount(monsterTemplate, hero) {
  const partySize = partySizeForSwarm(hero);
  const partyLevelCategory = categoryForHeroLevel(averagePartyLevel(hero));
  const categoryGap = Math.max(0, partyLevelCategory - monsterCategory(monsterTemplate));
  const partyExtra = Math.max(0, partySize - swarmSpawnTuning.basePartySize) * swarmSpawnTuning.extraPerPartyMember;
  const levelExtra = Math.min(swarmSpawnTuning.maximumExtraFromLevelGap, categoryGap * swarmSpawnTuning.extraPerCategoryGap);
  return clamp(swarmSpawnTuning.minimumCount + partyExtra + levelExtra, swarmSpawnTuning.minimumCount, swarmSpawnTuning.absoluteMaximum);
}

function roomMonsterSpawnCount(monsterTemplate, hero) {
  if (monsterTemplate.behavior === "swarm") return swarmSpawnCount(monsterTemplate, hero);
  const partySize = partySizeForSwarm(hero);
  const partyLevelCategory = categoryForHeroLevel(averagePartyLevel(hero));
  const categoryGap = Math.max(0, partyLevelCategory - monsterCategory(monsterTemplate));
  const expected =
    roomMonsterSpawnTuning.baseCount +
    Math.max(0, partySize - 1) * roomMonsterSpawnTuning.extraPerPartyMember +
    categoryGap * roomMonsterSpawnTuning.categoryGapBonus;
  const spread = partySize > 1 || categoryGap > 0 ? roomMonsterSpawnTuning.randomSpread : 0;
  const minimum = clamp(Math.floor(expected - spread), 1, roomMonsterSpawnTuning.maximumCount);
  const maximum = clamp(Math.ceil(expected + spread + categoryGap * 0.2), minimum, roomMonsterSpawnTuning.maximumCount);
  return minimum + Math.floor(Math.random() * (maximum - minimum + 1));
}

function weightedMonsterIdsForHero(hero, themeId = currentThemeId()) {
  const targetCategory = categoryForHeroLevel(hero.level ?? 1);
  const allowedMonsterIds = dungeonMonsterIds(themeId);
  const entries = allowedMonsterIds
    .map((id) => ({ id, template: getMonsterTemplate(id) }))
    .filter((entry) => entry.template && monsterCategory(entry.template) <= targetCategory)
    .map((entry) => {
      const category = monsterCategory(entry.template);
      return {
        id: entry.id,
        weight: category === targetCategory ? 3 : 1,
      };
    });

  return entries.length ? entries : allowedMonsterIds.map((id) => ({ id, weight: 1 }));
}

function pickWeightedMonsterId(entries, usedCounts = {}, fallbackId = defaultContent.monster) {
  if (entries.length === 0) return fallbackId;
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
  return adjustedEntries.at(-1)?.id ?? fallbackId;
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
    surroundingCells(cell).some((candidate) => blockedKeys.has(positionKey(candidate))),
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
    .find((cell) => !surroundingCells(cell).some((candidate) => blockedKeys.has(positionKey(candidate)))) ?? null;
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
    (item) => (item.use?.kind === "healing" && !item.use?.charges) || item.type === "ammunition" || (item.type === "weapon" && item.store?.buyable !== false),
  );
}

function randomChestLoot(count = 2, category = currentLootCategory()) {
  const pool = chestLootPool();
  const items = Array.from({ length: count }, () => {
    const template = pool[Math.floor(Math.random() * pool.length)];
    return template ? createItemInstance(template.id, "chest") : null;
  }).filter(Boolean);
  const treasureChance = Math.min(0.5, 0.18 + category * 0.06);
  if (Math.random() < treasureChance) {
    const treasure = randomTreasureDrop(category);
    if (treasure) items.push(treasure);
  }
  const magicChance = Math.min(0.14, 0.015 + category * 0.02);
  if (Math.random() < magicChance) {
    const magic = randomMagicLootDrop(category);
    if (magic) items.push(magic);
  }
  return items;
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

function cloneData(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function normalizeItem(item) {
  const templateId = item?.baseItemId ?? item?.itemId;
  const aliasedId = typeof item === "string" ? itemAliases[item] ?? item : itemAliases[templateId] ?? templateId;
  if (typeof item === "string") return cloneData(getItemTemplate(aliasedId)) ?? { id: aliasedId, name: aliasedId, type: "item", slots: [] };
  if (templateId) {
    const template = cloneData(getItemTemplate(aliasedId) ?? {});
    let finalId = item.id ?? aliasedId;
    // Generate unique ID for items without one (to prevent ID collisions when multiple items share the same template)
    if (!item.id && item !== template) {
      adminItemInstanceCounter += 1;
      finalId = `item-${aliasedId}-${Date.now()}-${adminItemInstanceCounter}`;
    }
    return { ...template, ...cloneData(item), id: finalId, baseItemId: aliasedId };
  }
  return cloneData(item);
}

function starterEquipmentItem(itemId) {
  return {
    id: itemId,
    itemId,
    starterEquipment: true,
    sell: { valueCp: 0, rate: 0 },
  };
}

function starterEquipmentItems(itemIds = []) {
  return itemIds.map((itemId) => (typeof itemId === "string" ? starterEquipmentItem(itemId) : { ...itemId, starterEquipment: true, sell: { ...(itemId.sell ?? {}), valueCp: 0, rate: 0 } }));
}

function normalizeEquipment(equipment = {}) {
  const normalized = { ...defaultEquipment(), ...equipment };
  for (const slot of equipmentSlots) {
    normalized[slot.id] = itemAliases[normalized[slot.id]] ?? normalized[slot.id];
  }
  return normalized;
}

function defaultHeroItems(fighter = null) {
  return starterEquipmentItems(getHeroTemplate(fighter?.classId).inventory?.items ?? []).map(normalizeItem);
}

function normalizeInventory(template = {}) {
  const sourceMoney = template.money ?? {};
  const money = normalizeMoney({
    cp: sourceMoney.cp ?? 0,
    sp: (sourceMoney.sp ?? 0) + (sourceMoney.ep ?? 0) * 5,
    gp: (sourceMoney.gp ?? 0) + (sourceMoney.pp ?? 0) * 10,
  });
  const heroTokens = Math.max(0, Math.floor(template.heroTokens ?? 0));
  const items = Array.isArray(template.items) ? template.items.map((item) => ensureItemCharges(normalizeItem(item))) : [];
  
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
    if (Boolean(stack.starterEquipment) !== Boolean(item.starterEquipment)) continue;
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
  return ensureItemCharges(normalizeItem({
    ...template,
    id: `${prefix}-${templateId}-${Date.now()}-${adminItemInstanceCounter}`,
    baseItemId: templateId,
  }));
}

function ensureStarterHeroEquipment(fighter) {
  if (fighter.id !== "hero") return;

  if ((fighter.inventory.items ?? []).length === 0) {
    const starterItems = defaultHeroItems(fighter);
    const itemIds = new Set(fighter.inventory.items.map((item) => item.id));
    for (const item of starterItems) {
      if (!itemIds.has(item.id)) fighter.inventory.items.push(item);
    }
  }

  const templateEquipment = getHeroTemplate(fighter.classId).equipment ?? {};
  for (const slot of equipmentSlots) {
    if (fighter.equipment[slot.id] === undefined) {
      fighter.equipment[slot.id] = templateEquipment[slot.id] ?? null;
    }
  }
}

function itemForId(fighter, itemId) {
  if (!itemId) return null;
  return fighter?.inventory?.items?.find((item) => item.id === itemId) ?? null;
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

function equippedMagicItems(fighter) {
  if (!fighter?.equipment) return [];
  const seen = new Set();
  return equipmentSlots
    .map((slot) => equippedItem(fighter, slot.id))
    .filter((item) => {
      if (!item?.magic || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
}

function magicEffects(fighter) {
  const merged = {
    abilityScoreBonuses: {},
    abilityScorePenalties: {},
    abilityScoreCaps: {},
    maxHpBonus: 0,
    acBonus: 0,
    initiativeBonus: 0,
    speedBonusFeet: 0,
    attackBonus: 0,
    damageBonus: 0,
    resistances: [],
    vulnerabilities: [],
    extraDamage: [],
  };

  for (const item of equippedMagicItems(fighter)) {
    const effects = item.magic?.effects ?? {};
    for (const [ability, value] of Object.entries(effects.abilityScoreBonuses ?? {})) {
      merged.abilityScoreBonuses[ability] = (merged.abilityScoreBonuses[ability] ?? 0) + value;
    }
    for (const [ability, value] of Object.entries(effects.abilityScorePenalties ?? {})) {
      merged.abilityScorePenalties[ability] = (merged.abilityScorePenalties[ability] ?? 0) + value;
    }
    for (const [ability, value] of Object.entries(effects.abilityScoreCaps ?? {})) {
      merged.abilityScoreCaps[ability] = Math.max(merged.abilityScoreCaps[ability] ?? 0, value);
    }
    merged.maxHpBonus += effects.maxHpBonus ?? 0;
    merged.initiativeBonus += effects.initiativeBonus ?? 0;
    merged.speedBonusFeet += effects.speedBonusFeet ?? 0;
    if (magicAcBonusApplies(fighter, item)) merged.acBonus += effects.acBonus ?? 0;
    if (magicAttackConditionApplies(fighter, effects.attackBonusCondition)) merged.attackBonus += effects.attackBonus ?? 0;
    if (magicAttackConditionApplies(fighter, effects.damageBonusCondition)) merged.damageBonus += effects.damageBonus ?? 0;
    merged.resistances.push(...(effects.resistances ?? []), ...(item.magic?.resistances ?? []));
    merged.vulnerabilities.push(...(effects.vulnerabilities ?? []), ...(item.magic?.vulnerabilities ?? []));
    if (magicAttackConditionApplies(fighter, effects.extraDamageCondition)) merged.extraDamage.push(...(effects.extraDamage ?? []));
  }

  merged.resistances = Array.from(new Set(merged.resistances));
  merged.vulnerabilities = Array.from(new Set(merged.vulnerabilities));
  return merged;
}

function magicAcBonusApplies(fighter, item) {
  const condition = item.magic?.effects?.acBonusCondition;
  if (!condition) return true;
  if (condition.includes("no torso armor") || condition.includes("no shield")) {
    return !equippedItem(fighter, "torso") && !equippedItem(fighter, "offHand")?.armor?.bonus;
  }
  return true;
}

function magicAttackConditionApplies(fighter, condition = "") {
  if (!condition) return true;
  const weapon = activeWeapon(fighter);
  const ranged = weaponIsRanged(weapon) || weapon?.range?.kind === "ranged";
  const normalized = condition.toLowerCase();
  if (normalized.includes("ranged")) return ranged;
  if (normalized.includes("melee")) return !ranged;
  return true;
}

function baseAbilityScore(fighter, ability) {
  if (fighter?.abilityScores?.[ability] || fighter?.abilityScores?.[ability] === 0) return fighter.abilityScores[ability];
  if (fighter?.abilityMods?.[ability] || fighter?.abilityMods?.[ability] === 0) return fighter.abilityMods[ability] * 2 + 10;
  return 10;
}

function abilityMod(fighter, ability) {
  return scoreToMod(abilityScore(fighter, ability));
}

function abilityScore(fighter, ability) {
  const effects = magicEffects(fighter);
  const value = baseAbilityScore(fighter, ability) + (effects.abilityScoreBonuses[ability] ?? 0) + (effects.abilityScorePenalties[ability] ?? 0);
  const cap = effects.abilityScoreCaps[ability];
  return cap ? Math.min(cap, value) : value;
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

function attackAbilityForWeapon(weapon, fighter = null) {
  if (!weapon) return "str";
  if (weapon.weaponRange === "ranged" || weapon.range?.kind === "ranged") return "dex";
  if (fighter && weapon.properties?.includes("finesse") && abilityMod(fighter, "dex") > abilityMod(fighter, "str")) return "dex";
  return "str";
}

function monsterThrownUsesRemaining(fighter, weapon) {
  if (isPartyHeroId(fighter?.id) || !weapon?.properties?.includes("thrown")) return Infinity;
  return Math.max(0, 4 - (fighter.thrownWeaponUses?.[weapon.id] ?? 0));
}

function monsterCanThrowWeapon(fighter, weapon) {
  return monsterThrownUsesRemaining(fighter, weapon) > 0;
}

function recordMonsterThrownWeaponUse(fighter, weapon) {
  if (isPartyHeroId(fighter?.id) || !weapon?.properties?.includes("thrown")) return;
  fighter.thrownWeaponUses = { ...(fighter.thrownWeaponUses ?? {}) };
  fighter.thrownWeaponUses[weapon.id] = (fighter.thrownWeaponUses[weapon.id] ?? 0) + 1;
}

function weaponIsRanged(weapon) {
  return weapon?.weaponRange === "ranged" || weapon?.range?.kind === "ranged";
}

function attackBonus(fighter) {
  return attackBonusForWeapon(fighter, activeWeapon(fighter));
}

function attackBonusForWeapon(fighter, weapon = activeWeapon(fighter)) {
  const baseBonus = fighter.attackBonus ?? 0;
  const baseAbility = fighter.baseAttackAbilityMod ?? abilityMod(fighter, "str");
  const statusBonus = (fighter.statusEffects ?? []).reduce((sum, effect) => sum + (effect.attackBonus ?? 0), 0);
  return baseBonus - baseAbility + abilityMod(fighter, attackAbilityForWeapon(weapon, fighter)) + (weapon?.magic?.attackBonus ?? 0) + magicEffects(fighter).attackBonus + statusBonus;
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
  const effects = magicEffects(target);
  const resistances = [...(target.damageResistances ?? []), ...effects.resistances];
  const vulnerabilities = [...(target.damageVulnerabilities ?? []), ...effects.vulnerabilities];
  if ((target.statusEffects ?? []).some((effect) => effect.id === "rage") && ["bludgeoning", "piercing", "slashing"].includes(normalizedType)) {
    resistances.push(normalizedType);
  }

  if (damageFlagMatches(target.damageImmunities, normalizedType)) {
    return { damage: 0, reason: "immune" };
  }

  const vulnerable = damageFlagMatches(vulnerabilities, normalizedType);
  const resistant = damageFlagMatches(resistances, normalizedType);
  if (vulnerable && resistant) return { damage, reason: "resistance and vulnerability cancel" };
  if (vulnerable) return { damage: damage * 2, reason: "vulnerable" };
  if (resistant) return { damage: Math.floor(damage / 2), reason: "resistant" };

  return { damage, reason: null };
}

function activeWeapon(fighter) {
  return equippedItem(fighter, "mainHand") ?? equippedItem(fighter, "offHand");
}

function weaponFromSlot(fighter, slotId = "mainHand") {
  return equippedItem(fighter, slotId);
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
    bonus: abilityMod(fighter, "str") + magicEffects(fighter).damageBonus,
    type: "bludgeoning",
    range: { kind: "melee", feet: 5 },
    extraDamage: magicEffects(fighter).extraDamage,
  };
  return { ...damage, label: formatDamage(damage), attackAbility: "str", weaponName: "Unarmed Strike" };
}

function damageProfile(fighter, options = {}) {
  const weapon = options.weapon ?? activeWeapon(fighter);
  const includeDamageModifier = options.includeDamageModifier !== false;
  const statusDamageBonus = (fighter.statusEffects ?? []).reduce((sum, effect) => sum + (effect.damageBonus ?? 0), 0);
  if (!options.forceThrown && !isPartyHeroId(fighter?.id) && weapon?.properties?.includes("thrown") && weapon.range?.kind === "thrown" && !monsterCanThrowWeapon(fighter, weapon)) {
    return {
      ...weapon.damage,
      bonus: (includeDamageModifier ? abilityMod(fighter, "str") : 0) + (weapon.magic?.damageBonus ?? 0) + magicEffects(fighter).damageBonus + statusDamageBonus,
      range: { kind: "melee", feet: 5 },
      extraDamage: [...(weapon.magic?.extraDamage ?? []), ...magicEffects(fighter).extraDamage],
      label: formatDamage({
        ...weapon.damage,
        bonus: (includeDamageModifier ? abilityMod(fighter, "str") : 0) + (weapon.magic?.damageBonus ?? 0) + magicEffects(fighter).damageBonus + statusDamageBonus,
      }),
    };
  }
  if (!weapon?.damage) {
    if (fighter.baseDamage?.count || fighter.baseDamage?.flat) {
      const damage = {
        flat: fighter.baseDamage.flat,
        count: fighter.baseDamage.count ?? 0,
        sides: fighter.baseDamage.sides ?? 0,
        bonus: (includeDamageModifier ? (fighter.baseDamage.bonus ?? 0) : 0) + magicEffects(fighter).damageBonus + statusDamageBonus,
        type: fighter.baseDamage.type,
        range: fighter.baseDamage.range ?? { kind: "melee", feet: 5 },
        weaponName: fighter.baseDamage.weaponName,
        extraDamage: magicEffects(fighter).extraDamage,
      };
      return { ...damage, label: formatDamage(damage) };
    }

    const damage = {
      flat: 1,
      count: 0,
      sides: 0,
      bonus: (includeDamageModifier ? abilityMod(fighter, "str") : 0) + magicEffects(fighter).damageBonus + statusDamageBonus,
      type: "bludgeoning",
      range: { kind: "melee", feet: 5 },
      extraDamage: magicEffects(fighter).extraDamage,
    };
    return { ...damage, label: formatDamage(damage) };
  }

  const bonusAbility = attackAbilityForWeapon(weapon, fighter);
  const bonus = includeDamageModifier ? abilityMod(fighter, bonusAbility) : 0;
  const oneHandingVersatile = weapon.properties?.includes("versatile") && !equippedItem(fighter, "offHand");
  const damageDice = oneHandingVersatile ? weapon.propertyData?.versatile ?? weapon.damage : weapon.damage;
  const damage = {
    flat: damageDice.flat,
    count: damageDice.count ?? 0,
    sides: damageDice.sides ?? 0,
    bonus: bonus + (weapon.magic?.damageBonus ?? 0) + magicEffects(fighter).damageBonus + statusDamageBonus,
    type: weapon.damage.type,
    range: weapon.range ?? { kind: "melee", feet: 5 },
    extraDamage: [...(weapon.magic?.extraDamage ?? []), ...magicEffects(fighter).extraDamage],
  };
  return { ...damage, label: formatDamage(damage) };
}

function opportunityAttackProfile(fighter) {
  const weapon = activeMeleeWeapon(fighter);
  if (weapon) {
    return {
      ...damageProfile({ ...fighter, equipment: { ...fighter.equipment, mainHand: weapon.id, offHand: fighter.equipment?.offHand } }),
      attackAbility: attackAbilityForWeapon(weapon, fighter),
      weaponName: weapon.name,
      weapon,
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
    return { ...damage, label: formatDamage(damage), attackAbility: "str", weaponName: fighter.baseDamage.weaponName ?? "Melee Attack" };
  }

  return unarmedDamageProfile(fighter);
}

function armorClass(fighter) {
  const torso = equippedItem(fighter, "torso");
  const armor = armorStrengthRequirementMet(fighter, torso) ? torso?.armor : null;
  const shield = equippedItem(fighter, "offHand");
  const shieldBonus = shield?.armor?.bonus ?? 0;
  const magicAc = magicEffects(fighter).acBonus;
  const statusAc = (fighter.statusEffects ?? []).reduce((sum, effect) => sum + (effect.acBonus ?? 0), 0);
  if (!armor?.base) return (fighter.baseAc ?? 10) + abilityMod(fighter, "dex") + shieldBonus + magicAc + statusAc;

  const dex = abilityMod(fighter, "dex");
  const dexBonus = armor.dex === "full" ? dex : armor.dex === "max2" ? Math.min(2, dex) : 0;
  return armor.base + dexBonus + shieldBonus + magicAc + statusAc;
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
    return hostileTo(fighter, candidate) && hasMeleeAccess(fighter, candidate);
  });
}

function refreshDerivedStats(fighter) {
  fighter.baseMaxHp = fighter.baseMaxHp ?? fighter.maxHp ?? 1;
  const effects = magicEffects(fighter);
  const statusSpeedBonus = (fighter.statusEffects ?? []).reduce((sum, effect) => sum + (effect.speedBonusFeet ?? 0), 0);
  const statusMaxHpBonus = (fighter.statusEffects ?? []).reduce((sum, effect) => sum + (effect.maxHpBonus ?? 0), 0);
  fighter.maxHp = Math.max(1, fighter.baseMaxHp + (effects.maxHpBonus ?? 0) + statusMaxHpBonus);
  if (fighter.hp > fighter.maxHp) fighter.hp = fighter.maxHp;
  fighter.speedFeet = Math.max(5, (fighter.baseSpeedFeet ?? fighter.speedFeet ?? 30) + (effects.speedBonusFeet ?? 0) + statusSpeedBonus);
  if (fighter.abilityScores) {
    fighter.abilityMods = abilityModsFromScores(fighter.abilityScores);
  }
  if (isPartyHeroId(fighter.id)) {
    fighter.initiativeBonus = abilityMod(fighter, "dex") + (effects.initiativeBonus ?? 0);
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
    baseMaxHp: template.baseMaxHp ?? template.maxHp,
    baseSpeedFeet: template.baseSpeedFeet ?? template.speedFeet,
    damage: { ...template.damage },
    equipment: normalizeEquipment(template.equipment),
    inventory: normalizeInventory(template.inventory),
    abilities: fighterAbilityDefinitions(template),
    abilityUses: { ...(template.abilityUses ?? {}) },
    casterType: template.casterType,
    spellcastingAbility: template.spellcastingAbility,
    spellPointProgression: template.spellPointProgression ? { ...template.spellPointProgression } : undefined,
    spellPointMax: template.spellPointMax,
    spellPoints: template.spellPoints,
    classSpellList: [...(template.classSpellList ?? template.spellList ?? template.spells ?? [])],
    spells: [...(template.spells ?? [])],
    partyRole: template.partyRole ?? (template.id === "hero" ? "tank" : undefined),
    position: { ...template.position },
    hp: template.maxHp,
    alive: true,
    movementLeft: Math.floor((template.baseSpeedFeet ?? template.speedFeet) / feetPerSquare),
    hasAction: true,
    hasBonusAction: true,
    dodging: false,
    disengaged: false,
    canMoveThroughMonsters: false,
  };
  if (combatant.baseAttackAbilityMod === undefined) {
    combatant.baseAttackAbilityMod = scoreToMod(baseAbilityScore(combatant, attackAbilityForWeapon(activeWeapon(combatant), combatant)));
  }
  ensureStarterHeroEquipment(combatant);
  ensureFighterAbilityState(combatant);
  ensureSpellPointState(combatant);
  return refreshDerivedStats(combatant);
}

function spawnFloorKeysForDungeon(dungeon = state?.dungeon) {
  return new Set((dungeon?.walkable ?? []).map(positionKey));
}

function openRoomCellsForSpawn(room, blockedKeys = new Set(), gridSize = currentGridSize(), includeDoors = false, floorKeys = null) {
  const doorKeys = roomDoorKeys(room);
  return (room?.cells ?? []).filter((cell) => {
    const key = positionKey(cell);
    return (
      window.DungeonGrid.isInsideGrid(cell, gridSize) &&
      roomHasCell(room, cell) &&
      (!floorKeys || floorKeys.has(key)) &&
      (includeDoors || !doorKeys.has(key)) &&
      !blockedKeys.has(key)
    );
  });
}

function roomSpawnCells(room, blockedKeys = new Set(), gridSize = currentGridSize(), floorKeys = null) {
  const interiorCells = openRoomCellsForSpawn(room, blockedKeys, gridSize, false, floorKeys);
  return interiorCells.length ? interiorCells : openRoomCellsForSpawn(room, blockedKeys, gridSize, true, floorKeys);
}

function clusteredSpawnCells(room, count, origin, blockedKeys = new Set(), gridSize = currentGridSize(), floorKeys = null) {
  const openCells = roomSpawnCells(room, blockedKeys, gridSize, floorKeys);
  if (openCells.length === 0) return [];
  const openKeys = new Set(openCells.map(positionKey));
  const seeds = openCells
    .slice()
    .sort((a, b) => distance(b, origin) - distance(a, origin));

  for (const seed of seeds) {
    const cluster = [];
    const queue = [seed];
    const visited = new Set();
    while (queue.length > 0 && cluster.length < count) {
      const current = queue.shift();
      const key = positionKey(current);
      if (visited.has(key) || !openKeys.has(key)) continue;
      visited.add(key);
      cluster.push(current);
      adjacentCells(current)
        .filter((cell) => openKeys.has(positionKey(cell)) && !visited.has(positionKey(cell)))
        .sort((a, b) => distance(a, seed) - distance(b, seed))
        .forEach((cell) => queue.push(cell));
    }
    if (cluster.length >= Math.min(count, openCells.length)) return cluster;
  }

  return openCells.slice(0, count);
}

function safeRoomSpawnCell(room, origin, blockedKeys = new Set(), gridSize = currentGridSize(), floorKeys = null) {
  return clusteredSpawnCells(room, 1, origin, blockedKeys, gridSize, floorKeys)[0] ?? null;
}

function createMonsterForRoom(monsterTemplate, room, position, id, name, hero) {
  const monster = createCombatant({
    ...monsterTemplate,
    id,
    name,
  });
  applyMonsterCategoryScaling(monster, hero);
  monster.roomId = room.id;
  monster.position = { ...position };
  return monster;
}

function createDungeonMonsters(dungeon, heroPosition, hero, exitRoomId = "", dungeonObjects = [], themeId = currentThemeId()) {
  const monsters = {};
  const rooms = dungeon.rooms;
  const bossMonsterId = heroNeedsDungeonBoss(hero) ? bossMonsterIdForHero(hero, themeId) : null;
  const bossRoomId = bossMonsterId ? exitRoomId || createDungeonExit(dungeon, heroPosition).roomId : null;
  const monsterEntries = weightedMonsterIdsForHero(hero, themeId);
  const usedMonsterCounts = {};
  const floorKeys = spawnFloorKeysForDungeon(dungeon);
  const objectBlockedKeys = new Set(
    [
      heroPosition,
      ...dungeonObjects.filter(objectBlocksMovement).flatMap(objectCells),
    ].map(positionKey),
  );

  for (const [index, room] of rooms.entries()) {
    const isEntranceRoom = room.id === dungeon.entranceRoomId;
    const spawnChance = isEntranceRoom ? roomMonsterSpawnTuning.entranceRoomSpawnChance : roomMonsterSpawnTuning.roomSpawnChance;
    if (room.id === bossRoomId || Math.random() >= spawnChance) continue;
    const monsterId = pickWeightedMonsterId(monsterEntries, usedMonsterCounts, monsterEntries[0]?.id);
    const monsterTemplate = getMonsterTemplate(monsterId);
    if (!monsterTemplate) continue;
    const spawnCount = roomMonsterSpawnCount(monsterTemplate, hero);
    const spawnCells = clusteredSpawnCells(room, spawnCount, heroPosition, objectBlockedKeys, dungeon.gridSize, floorKeys);
    if (spawnCells.length === 0) continue;
    usedMonsterCounts[monsterId] = (usedMonsterCounts[monsterId] ?? 0) + 1;
    const actualCount = Math.min(spawnCount, spawnCells.length);
    for (let swarmIndex = 0; swarmIndex < actualCount; swarmIndex += 1) {
      const position = spawnCells[swarmIndex];
      if (!position) continue;
      const suffix = spawnCount > 1 ? ` ${swarmIndex + 1}` : index === 0 ? "" : ` ${index + 1}`;
      const monster = createMonsterForRoom(monsterTemplate, room, position, `monster-${room.id}${spawnCount > 1 ? `-${swarmIndex + 1}` : ""}`, `${monsterTemplate.name}${suffix}`, hero);
      monsters[monster.id] = monster;
      objectBlockedKeys.add(positionKey(position));
    }
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
      boss.position = safeRoomSpawnCell(bossRoom, heroPosition, objectBlockedKeys, dungeon.gridSize, floorKeys);
      if (boss.position) monsters[boss.id] = boss;
    }
  }

  return monsters;
}

function normalizeMonsterRoomPositions(gameState) {
  const dungeon = gameState?.dungeon;
  if (!dungeon?.rooms || !gameState?.fighters) return;
  const floorKeys = spawnFloorKeysForDungeon(dungeon);
  const blockedKeys = new Set(
    (gameState.dungeonObjects ?? [])
      .filter(objectBlocksMovement)
      .flatMap(objectCells)
      .map(positionKey),
  );
  Object.values(gameState.fighters)
    .filter((fighter) => fighter.id === "hero" || gameState.party?.heroIds?.includes(fighter.id))
    .forEach((fighter) => blockedKeys.add(positionKey(fighter.position)));

  for (const fighter of Object.values(gameState.fighters)) {
    if (fighter.id === "hero" || gameState.party?.heroIds?.includes(fighter.id) || !fighter.alive) continue;
    const assignedRoom = dungeon.rooms.find((room) => room.id === fighter.roomId);
    const currentRoom = dungeon.rooms.find((room) => roomHasCell(room, fighter.position));
    const room = assignedRoom ?? currentRoom;
    if (!room) {
      delete gameState.fighters[fighter.id];
      continue;
    }

    const currentKey = positionKey(fighter.position);
    const legalKeys = new Set(roomSpawnCells(room, blockedKeys, dungeon.gridSize, floorKeys).map(positionKey));
    if (legalKeys.has(currentKey)) {
      fighter.roomId = room.id;
      blockedKeys.add(currentKey);
      continue;
    }

    const replacement = safeRoomSpawnCell(room, gameState.fighters.hero?.position ?? fighter.position, blockedKeys, dungeon.gridSize, floorKeys);
    if (!replacement) {
      delete gameState.fighters[fighter.id];
      continue;
    }
    fighter.position = { ...replacement };
    fighter.roomId = room.id;
    blockedKeys.add(positionKey(replacement));
  }
}

function aliveFighters() {
  return Object.values(state.fighters).filter((fighter) => fighter.alive);
}

function aliveMonsters() {
  const heroIds = new Set([...(state.party?.heroIds ?? ["hero"]), ...(state.party?.rosterIds ?? [])]);
  return Object.values(state.fighters).filter((fighter) => !heroIds.has(fighter.id) && fighter.alive);
}

function activeFighter() {
  const entry = state.initiative[state.activeIndex];
  return entry ? state.fighters[entry.fighterId] : null;
}

function syncActiveHeroToTurn() {
  const fighter = activeFighter();
  if (!isPartyHeroId(fighter?.id)) return false;
  state.party.activeHeroId = fighter.id;
  selectedHeroIds = new Set([fighter.id]);
  return true;
}

function normalizeLoadedState(loadedState) {
  const freshState = createInitialState();
  const loadedFighters =
    loadedState.fighters && Object.keys(loadedState.fighters).length
      ? { ...loadedState.fighters }
      : { ...freshState.fighters };
  if (!loadedFighters.hero && freshState.fighters.hero) loadedFighters.hero = freshState.fighters.hero;
  const normalized = {
    ...freshState,
    ...loadedState,
    themeId: loadedState.themeId ?? freshState.themeId ?? defaultContent.theme,
    saveSlotId: loadedState.saveSlotId ?? activeSaveSlot,
    mode: loadedState.mode ?? (loadedState.combatStarted ? "combat" : "exploration"),
    fighters: loadedFighters,
    dungeon: ensureCorridorPassages(loadedState.dungeon ?? freshState.dungeon),
    party: {
      activeHeroId: loadedState.party?.activeHeroId ?? "hero",
      heroIds: Array.isArray(loadedState.party?.heroIds) && loadedState.party.heroIds.length ? loadedState.party.heroIds : ["hero"],
      rosterIds:
        Array.isArray(loadedState.party?.rosterIds) && loadedState.party.rosterIds.length
          ? loadedState.party.rosterIds
          : Array.isArray(loadedState.party?.heroIds) && loadedState.party.heroIds.length
            ? loadedState.party.heroIds
            : ["hero"],
    },
    exploration: {
      ...freshState.exploration,
      ...loadedState.exploration,
    },
    exit: loadedState.exit ?? freshState.exit,
    completed: Boolean(loadedState.completed),
    d20Mode: normalizeD20Mode(loadedState.d20Mode ?? freshState.d20Mode),
    d20FailureStreak: Math.max(0, Math.floor(loadedState.d20FailureStreak ?? freshState.d20FailureStreak ?? 0)),
    shortRestsUsed: loadedState.shortRestsUsed ?? (loadedState.shortRestUsed ? 1 : 0),
    shortRestLimit: loadedState.shortRestLimit ?? 3,
    chest: Array.isArray(loadedState.chest) ? loadedState.chest.map(normalizeItem) : [],
    chestMoney: normalizeMoney(loadedState.chestMoney ?? {}),
    lootPiles: Array.isArray(loadedState.lootPiles) ? loadedState.lootPiles : [],
    dungeonObjects: Array.isArray(loadedState.dungeonObjects) ? loadedState.dungeonObjects : [],
    log: Array.isArray(loadedState.log) ? loadedState.log : [],
    initiative: Array.isArray(loadedState.initiative) ? loadedState.initiative : [],
  };

  normalizeMonsterRoomPositions(normalized);

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
    normalized.fighters.hero.partyRole = normalized.fighters.hero.partyRole ?? "tank";
    normalized.fighters.hero.token = tokenFromName(normalized.fighters.hero.name, normalized.fighters.hero.token);
  }
  Object.values(normalized.fighters).forEach((fighter) => {
    if (fighter.dead) {
      fighter.hp = 0;
      fighter.alive = false;
      fighter.deathSaves = fighter.deathSaves ?? { successes: 0, failures: 3 };
    } else if (normalized.party.rosterIds.includes(fighter.id)) {
      fighter.deathSaves = fighter.deathSaves ?? { successes: 0, failures: 0 };
    }
  });
  normalized.party.rosterIds = normalized.party.rosterIds.filter((id) => normalized.fighters[id]);
  if (!normalized.party.rosterIds.includes("hero") && normalized.fighters.hero) normalized.party.rosterIds.unshift("hero");
  normalized.party.heroIds = normalized.party.heroIds.filter((id) => normalized.fighters[id]).slice(0, 4);
  if (normalized.party.heroIds.length === 0 && normalized.fighters.hero) normalized.party.heroIds = ["hero"];
  if (!normalized.fighters[normalized.party.activeHeroId]) normalized.party.activeHeroId = normalized.party.heroIds[0] ?? "hero";
  for (const heroId of normalized.party.heroIds ?? ["hero"]) {
    if (normalized.fighters[heroId]) {
      normalized.fighters[heroId].partyRole = normalized.fighters[heroId].partyRole ?? (heroId === "hero" ? "tank" : "dd");
    }
  }
  normalizeHomeLayout(normalized);
  Object.values(normalized.fighters).forEach((fighter) => {
    fighter.baseAc = fighter.baseAc ?? fighter.ac ?? 10;
    fighter.baseDamage = { ...(fighter.baseDamage ?? fighter.damage ?? { count: 1, sides: 4, bonus: 0 }) };
    fighter.baseMaxHp = fighter.baseMaxHp ?? fighter.maxHp ?? 1;
    fighter.baseSpeedFeet = fighter.baseSpeedFeet ?? fighter.speedFeet ?? 30;
    fighter.abilityScores = fighter.abilityScores ? { ...fighter.abilityScores } : fighter.abilityScores;
    fighter.abilityMods = { ...(fighter.abilityMods ?? {}) };
    fighter.raceSelection = normalizeRaceSelection(fighter.raceSelection ?? { raceId: fighter.race, subraceId: fighter.subrace, dragonAncestryId: fighter.dragonAncestryId });
    const raceTraits = raceTraitsForSelection(fighter.raceSelection);
    fighter.race = fighter.race ?? raceTraits.raceId;
    fighter.subrace = fighter.subrace ?? raceTraits.subraceId;
    fighter.speciesName = fighter.speciesName ?? raceTraits.raceName;
    fighter.subraceName = fighter.subraceName ?? raceTraits.subraceName;
    fighter.racialAbilityBonuses = fighter.racialAbilityBonuses ?? raceTraits.abilityBonuses;
    fighter.racialHpPerLevel = fighter.racialHpPerLevel ?? raceTraits.hpPerLevel;
    fighter.racialTraits = {
      halflingLucky: Boolean(fighter.racialTraits?.halflingLucky),
      relentlessEndurance: Boolean(fighter.racialTraits?.relentlessEndurance),
      savageAttacks: Boolean(fighter.racialTraits?.savageAttacks),
      dragonDamageType: fighter.racialTraits?.dragonDamageType ?? raceTraits.dragonDamageType,
      traits: fighter.racialTraits?.traits ?? raceTraits.traits,
      spellTraits: fighter.racialTraits?.spellTraits ?? raceTraits.spellTraits,
    };
    fighter.damageResistances = uniqueValues(fighter.damageResistances ?? []);
    fighter.weaponProficiencies = uniqueValues(fighter.weaponProficiencies ?? []);
    fighter.armorProficiencies = uniqueValues(fighter.armorProficiencies ?? []);
    fighter.skillProficiencies = uniqueValues(fighter.skillProficiencies ?? []);
    fighter.classId = fighter.classId ?? defaultContent.heroClass;
    const classTemplate = getHeroTemplate(fighter.classId);
    fighter.className = fighter.className ?? classTemplate.className ?? "Fighter";
    fighter.casterType = fighter.casterType ?? classTemplate.casterType;
    fighter.spellcastingAbility = fighter.spellcastingAbility ?? classTemplate.spellcastingAbility;
    fighter.spellPointProgression = fighter.spellPointProgression ?? classTemplate.spellPointProgression;
    fighter.classSpellList = fighter.classSpellList ?? classTemplate.classSpellList ?? classTemplate.spellList ?? classTemplate.spells ?? [];
    fighter.spells = fighter.spells ?? [];
    fighter.baseAttackAbilityMod = fighter.baseAttackAbilityMod ?? scoreToMod(baseAbilityScore(fighter, attackAbilityForWeapon(activeWeapon(fighter), fighter)));
    fighter.level = fighter.level ?? 1;
    fighter.xp = fighter.xp ?? 0;
    fighter.hitDie = fighter.hitDie ?? 10;
    fighter.hitDiceRemaining = fighter.hitDiceRemaining ?? fighter.level ?? 1;
    fighter.equipment = normalizeEquipment(fighter.equipment);
    fighter.inventory = normalizeInventory(fighter.inventory);
    ensureFighterAbilityState(fighter);
    ensureSpellPointState(fighter);
    fighter.hasBonusAction = fighter.hasBonusAction ?? true;
    fighter.dodging = fighter.dodging ?? false;
    fighter.disengaged = fighter.disengaged ?? false;
    fighter.canMoveThroughMonsters = fighter.canMoveThroughMonsters ?? false;
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

async function confirmSaveSlotOverwrite(slotId, context = "save") {
  const slot = getSlots().find((entry) => entry.id === slotId);
  if (!slot?.hasSave) return true;
  const ownsSlot = state?.saveSlotId === slotId;
  if (ownsSlot) return true;
  const choice = await showGameDialog({
    title: "Overwrite Save Slot?",
    message:
      context === "new"
        ? `Slot ${slotId} already contains "${slot.name}". Starting this adventure here will overwrite that game.`
        : `Slot ${slotId} contains "${slot.name}", which is not the selected slot for this game. Overwrite it?`,
    confirmText: "Overwrite",
    cancelText: "Choose Another",
  });
  return Boolean(choice);
}

async function chooseSaveSlotForAdventure() {
  const slots = getSlots();
  while (true) {
    const selected = await showChoiceDialog({
      title: "Choose Save Slot",
      message: "Choose the save slot this game will use. Saves during this game will go to that slot unless you deliberately overwrite another one.",
      choices: slots.map((slot) => ({
        value: String(slot.id),
        label: `Slot ${slot.id}: ${slot.hasSave ? slot.name : "Empty"}`,
      })),
    });
    if (!selected) return null;
    const slotId = Number(selected);
    if (await confirmSaveSlotOverwrite(slotId, "new")) return slotId;
  }
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
      const canSaveCurrentGame = Boolean(state?.saveSlotId);
      return `
        <div class="save-slot${activeClass}" data-slot="${slot.id}">
          <div class="save-slot-main">
            <label for="save-slot-name-${slot.id}">Slot ${slot.id}</label>
            <input id="save-slot-name-${slot.id}" type="text" value="${escapeAttribute(slot.name)}" maxlength="32" />
            <span>${savedAt}</span>
          </div>
          <div class="save-slot-actions">
            <button type="button" data-action="save-slot" data-slot="${slot.id}" ${canSaveCurrentGame ? "" : "disabled"}>Save</button>
            <button type="button" data-action="load-slot" data-slot="${slot.id}" ${slot.hasSave ? "" : "disabled"}>Load</button>
            <button class="delete-save" type="button" data-action="delete-slot" data-slot="${slot.id}" ${slot.hasSave ? "" : "disabled"}>Delete</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function restoreDialogInputField() {
  els.gameDialogField.className = "dialog-field hidden";
  els.gameDialogField.innerHTML = `
    <span id="game-dialog-label">Name</span>
    <input id="game-dialog-input" type="text" autocomplete="off" />
  `;
  els.gameDialogLabel = els.gameDialogField.querySelector("#game-dialog-label");
  els.gameDialogInput = els.gameDialogField.querySelector("#game-dialog-input");
}

function showMainMenu(message = "") {
  interactiveTutorialActive = false;
  els.tutorialTour?.classList.add("hidden");
  els.tutorialHighlight?.classList.add("hidden");
  gameHasStarted = false;
  adminMode = false;
  disableAdminModeOptions();
  clearHeldMovementKeys();
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
    restoreDialogInputField();
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

function showHeroIdentityDialog({ title, message, nameValue, tokenArt = "", confirmText = "OK", cancelText = "Cancel" }) {
  return new Promise((resolve) => {
    els.gameDialogTitle.textContent = title;
    els.gameDialogMessage.textContent = message;
    els.gameDialogField.classList.remove("hidden");
    els.gameDialogActions.innerHTML = `
      <button type="submit" data-dialog-action="confirm">${escapeHtml(confirmText)}</button>
      <button type="button" class="ghost-button" data-dialog-action="cancel">${escapeHtml(cancelText)}</button>
    `;

    let selectedValue = selectionValueForHeroTokenArt(tokenArt);
    let errorText = "";
    let pendingFullDataUrl = "";
    let pendingImageSize = null;
    let pendingCrop = { x: 0.5, y: 0.5, zoom: 1 };
    let cropDrag = null;

    const currentName = () => els.gameDialogField.querySelector("[data-hero-identity-name]")?.value ?? nameValue ?? "";
    const updateCropPreviewTransform = () => {
      const image = els.gameDialogField.querySelector("[data-token-crop-preview] img");
      if (image) {
        const metrics = tokenCropDrawMetrics(pendingImageSize, heroTokenPreviewSize, pendingCrop);
        image.style.width = `${metrics.drawWidth}px`;
        image.style.height = `${metrics.drawHeight}px`;
        image.style.left = `${metrics.left}px`;
        image.style.top = `${metrics.top}px`;
      }
    };

    const renderField = () => {
      const options = heroTokenArtOptions();
      if (!options.some((option) => option.value === selectedValue)) selectedValue = noHeroTokenArtValue;
      const resolvedArt = resolveHeroTokenArtSelection(selectedValue);
      const previewArt = pendingFullDataUrl || resolvedArt;
      const previewMetrics = pendingFullDataUrl ? tokenCropDrawMetrics(pendingImageSize, heroTokenPreviewSize, pendingCrop) : null;
      const previewStyle = previewMetrics
        ? `width:${previewMetrics.drawWidth}px;height:${previewMetrics.drawHeight}px;left:${previewMetrics.left}px;top:${previewMetrics.top}px;`
        : "";
      els.gameDialogField.innerHTML = `
        <label>
          <span>Character name</span>
          <input data-hero-identity-name type="text" maxlength="32" value="${escapeAttribute(nameValue ?? "")}" />
        </label>
        <label>
          <span>Token picture</span>
          <select data-hero-token-select>
            ${options.map((option) => `<option value="${escapeAttribute(option.value)}" ${option.value === selectedValue ? "selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}
          </select>
        </label>
        <div class="hero-token-tools">
          <div class="hero-token-preview ${previewArt ? "editable" : "empty"}" data-token-crop-preview>
            ${previewArt ? `<img src="${escapeAttribute(previewArt)}" alt="Selected token picture" style="${escapeAttribute(previewStyle)}" />` : `<span>${escapeHtml(tokenFromName(nameValue ?? "H", "H"))}</span>`}
          </div>
          <div class="hero-token-actions">
            <input data-hero-token-file type="file" accept="image/*" />
            ${
              pendingFullDataUrl
                ? `<label class="token-zoom">
                    <span>Zoom</span>
                    <input data-token-zoom type="range" min="1" max="4" step="0.05" value="${pendingCrop.zoom}" />
                  </label>
                  <button type="button" data-action="save-token-crop">Save Token Crop</button>`
                : ""
            }
            <button type="button" class="ghost-button" data-action="delete-custom-token" ${selectedValue.startsWith(customHeroTokenArtPrefix) ? "" : "disabled"}>Delete Custom Picture</button>
            <p class="empty-note">Paste an image while this window is open, or choose an image file. Drag and zoom the picture inside the circle before saving it.</p>
            <p class="ability-assignment-error" aria-live="polite">${escapeHtml(errorText)}</p>
          </div>
        </div>
      `;
    };

    const cleanup = (value) => {
      els.gameDialogForm.removeEventListener("submit", handleSubmit);
      els.gameDialogActions.removeEventListener("click", handleActionClick);
      els.gameDialogField.removeEventListener("change", handleFieldChange);
      els.gameDialogField.removeEventListener("click", handleFieldClick);
      els.gameDialogField.removeEventListener("input", handleFieldInput);
      els.gameDialogField.removeEventListener("pointerdown", handleCropPointerDown);
      window.removeEventListener("pointermove", handleCropPointerMove);
      window.removeEventListener("pointerup", handleCropPointerUp);
      window.removeEventListener("paste", handlePaste);
      els.gameDialog.classList.add("hidden");
      activeDialogCancel = null;
      resolve(value);
    };

    const addCustomToken = async (file) => {
      try {
        pendingFullDataUrl = await imageFileToDataUrl(file);
        const image = await loadImageElement(pendingFullDataUrl);
        pendingImageSize = { width: image.width, height: image.height };
        pendingCrop = { x: 0.5, y: 0.5, zoom: 1 };
        errorText = "";
        nameValue = currentName();
        renderField();
      } catch (error) {
        errorText = error?.message ?? "Could not add that image.";
        renderField();
      }
    };

    const savePendingCrop = async () => {
      if (!pendingFullDataUrl) return true;
      try {
        const heroName = currentName();
        const dataUrl = await cropTokenDataUrl(pendingFullDataUrl, pendingCrop);
        const entries = loadCustomHeroTokenArt();
        const id = `${safeTokenArtName(heroName, "token")}-${Date.now()}`;
        entries.push({
          id,
          name: safeTokenArtName(heroName, "token"),
          fullName: safeTokenArtName(heroName, "full"),
          tokenName: safeTokenArtName(heroName, "token"),
          fullDataUrl: pendingFullDataUrl,
          dataUrl,
          crop: { ...pendingCrop },
        });
        saveCustomHeroTokenArt(entries);
        selectedValue = `${customHeroTokenArtPrefix}${id}`;
        pendingFullDataUrl = "";
        pendingImageSize = null;
        errorText = "";
        nameValue = heroName;
        renderField();
        return true;
      } catch (error) {
        errorText = error?.message ?? "Could not save that token crop.";
        renderField();
        return false;
      }
    };

    const handleSubmit = async (event) => {
      event.preventDefault();
      if (pendingFullDataUrl && !(await savePendingCrop())) return;
      const name = currentName().trim();
      renameCustomHeroTokenArt(selectedValue, name);
      cleanup({ name, tokenArt: resolveHeroTokenArtSelection(selectedValue) });
    };

    const handleActionClick = (event) => {
      const button = event.target.closest("[data-dialog-action]");
      if (!button || button.dataset.dialogAction !== "cancel") return;
      cleanup(null);
    };

    const handleFieldChange = (event) => {
      if (event.target.matches("[data-hero-token-select]")) {
        selectedValue = event.target.value;
        pendingFullDataUrl = "";
        pendingImageSize = null;
        nameValue = currentName();
        errorText = "";
        renderField();
      }
      if (event.target.matches("[data-hero-token-file]")) {
        const file = event.target.files?.[0];
        if (file) addCustomToken(file);
      }
      if (event.target.matches("[data-hero-identity-name]")) {
        nameValue = event.target.value;
      }
    };

    const handleFieldInput = (event) => {
      if (event.target.matches("[data-token-zoom]")) {
        pendingCrop.zoom = Number(event.target.value);
        nameValue = currentName();
        updateCropPreviewTransform();
      }
      if (event.target.matches("[data-hero-identity-name]")) nameValue = event.target.value;
    };

    const handleFieldClick = async (event) => {
      const saveButton = event.target.closest("[data-action='save-token-crop']");
      if (saveButton) {
        await savePendingCrop();
        return;
      }
      const button = event.target.closest("[data-action='delete-custom-token']");
      if (!button) return;
      if (deleteCustomHeroTokenArt(selectedValue)) {
        selectedValue = noHeroTokenArtValue;
        errorText = "";
        nameValue = currentName();
        renderField();
      }
    };

    const handleCropPointerDown = (event) => {
      if (!pendingFullDataUrl || !event.target.closest("[data-token-crop-preview]")) return;
      cropDrag = {
        startX: event.clientX,
        startY: event.clientY,
        cropX: pendingCrop.x,
        cropY: pendingCrop.y,
      };
      event.preventDefault();
    };

    const handleCropPointerMove = (event) => {
      if (!cropDrag) return;
      const preview = els.gameDialogField.querySelector("[data-token-crop-preview]");
      const size = preview?.getBoundingClientRect().width || 1;
      const metrics = tokenCropDrawMetrics(pendingImageSize, size, pendingCrop);
      pendingCrop.x = clamp(cropDrag.cropX - (event.clientX - cropDrag.startX) / metrics.drawWidth, 0, 1);
      pendingCrop.y = clamp(cropDrag.cropY - (event.clientY - cropDrag.startY) / metrics.drawHeight, 0, 1);
      nameValue = currentName();
      updateCropPreviewTransform();
    };

    const handleCropPointerUp = () => {
      cropDrag = null;
    };

    const handlePaste = (event) => {
      if (els.gameDialog.classList.contains("hidden")) return;
      const file = Array.from(event.clipboardData?.items ?? [])
        .find((item) => item.type.startsWith("image/"))
        ?.getAsFile();
      if (!file) return;
      event.preventDefault();
      addCustomToken(file);
    };

    els.gameDialogForm.addEventListener("submit", handleSubmit);
    els.gameDialogActions.addEventListener("click", handleActionClick);
    els.gameDialogField.addEventListener("change", handleFieldChange);
    els.gameDialogField.addEventListener("click", handleFieldClick);
    els.gameDialogField.addEventListener("input", handleFieldInput);
    els.gameDialogField.addEventListener("pointerdown", handleCropPointerDown);
    window.addEventListener("pointermove", handleCropPointerMove);
    window.addEventListener("pointerup", handleCropPointerUp);
    window.addEventListener("paste", handlePaste);
    activeDialogCancel = () => cleanup(null);
    renderField();
    els.gameDialog.classList.remove("hidden");
    els.gameDialogField.querySelector("[data-hero-identity-name]")?.focus();
  });
}

function showChoiceDialog({ title, message, choices }) {
  return new Promise((resolve) => {
    els.gameDialogTitle.textContent = title;
    els.gameDialogMessage.textContent = message;
    els.gameDialogField.classList.add("hidden");
    els.gameDialogActions.innerHTML = choices
      .map(
        (choice) =>
          `<button type="button" class="${choice.value === dialogBackValue ? "ghost-button" : ""}" data-choice="${escapeAttribute(choice.value)}">${escapeHtml(
            choice.label,
          )}</button>`,
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
    activeDialogCancel = () => cleanup(null);
    els.gameDialog.classList.remove("hidden");
    els.gameDialogActions.querySelector("[data-choice]")?.focus();
  });
}

function showInitiativeDialog(entries) {
  return new Promise((resolve) => {
    restoreDialogInputField();
    els.gameDialogForm.classList.add("wide-dialog");
    els.gameDialogTitle.textContent = "Roll Initiative";
    els.gameDialogMessage.textContent = "Combatants roll one at a time.";
    els.gameDialogField.classList.add("hidden");
    els.gameDialogField.innerHTML = `
      <div class="initiative-roll-list">
        ${entries
          .map(
            (entry, index) => `
              <div class="initiative-roll-row" data-initiative-roll-row="${index}">
                ${combatantArtworkMarkup(entry.fighter, "initiative-art")}
                <span>${escapeHtml(entry.fighter.name)}</span>
                <strong data-initiative-roll-result>${entry.side === "hero" ? "Hero" : "Monster"}</strong>
              </div>
            `,
          )
          .join("")}
      </div>
    `;
    els.gameDialogField.classList.remove("hidden");
    els.gameDialogActions.innerHTML = `
      <button type="button" data-initiative-roll-start>Roll Initiative</button>
      <button type="button" class="ghost-button" data-initiative-roll-cancel>Cancel</button>
    `;

    let rolling = false;

    const cleanup = (value) => {
      els.gameDialogActions.removeEventListener("click", handleClick);
      els.gameDialog.classList.add("hidden");
      els.gameDialogForm.classList.remove("wide-dialog");
      restoreDialogInputField();
      activeDialogCancel = null;
      resolve(value);
    };

    const revealRolls = async () => {
      rolling = true;
      els.gameDialogActions.innerHTML = `<button type="button" disabled>Rolling...</button>`;
      for (let index = 0; index < entries.length; index += 1) {
        const entry = entries[index];
        const row = els.gameDialogField.querySelector(`[data-initiative-roll-row="${index}"]`);
        const result = row?.querySelector("[data-initiative-roll-result]");
        row?.classList.add("rolling");
        if (result) result.textContent = "Rolling...";
        await sleep(260);
        row?.classList.remove("rolling");
        row?.classList.add("rolled");
        if (result) result.textContent = `${entry.roll} ${abilityLabel(entry.fighter.initiativeBonus)} = ${entry.total}`;
      }
      els.gameDialogActions.innerHTML = `<button type="button" data-initiative-roll-continue>Start Combat</button>`;
      els.gameDialogActions.querySelector("[data-initiative-roll-continue]")?.focus();
    };

    const handleClick = (event) => {
      const start = event.target.closest("[data-initiative-roll-start]");
      const cancel = event.target.closest("[data-initiative-roll-cancel]");
      const proceed = event.target.closest("[data-initiative-roll-continue]");
      if (start && !rolling) {
        revealRolls();
        return;
      }
      if (cancel && !rolling) cleanup(false);
      if (proceed) cleanup(true);
    };

    els.gameDialogActions.addEventListener("click", handleClick);
    activeDialogCancel = () => {
      if (!rolling) cleanup(false);
    };
    els.gameDialog.classList.remove("hidden");
    els.gameDialogActions.querySelector("[data-initiative-roll-start]")?.focus();
  });
}

function withBackChoice(choices) {
  return [...choices, { value: dialogBackValue, label: "Back" }];
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

async function createHeroGearOptions(classId = defaultContent.heroClass) {
  const heroTemplate = getHeroTemplate(classId);
  const startingGear = heroTemplate.startingGear;
  if (startingGear?.fixed) {
    return {
      equipment: { ...(startingGear.equipment ?? heroTemplate.equipment ?? {}) },
      inventory: { money: { cp: 0, sp: 0, gp: 0 }, items: starterEquipmentItems(startingGear.inventory ?? heroTemplate.inventory?.items ?? []) },
    };
  }
  if (!startingGear) {
    return {
      equipment: { mainHand: "longsword", torso: "chain-mail" },
      inventory: { money: { cp: 0, sp: 0, gp: 0 }, items: starterEquipmentItems(["chain-mail", "longsword"]) },
    };
  }

  const martialWeaponOptions = (startingGear.martialWeapons ?? [])
    .map((id) => getItemTemplate(id))
    .filter(Boolean);
  const handFriendlyWeapons = martialWeaponOptions.filter((item) => !item.properties?.includes("two-handed"));

  let step = 0;
  let armorChoice = null;
  let weaponChoice = null;
  let weaponIds = null;
  let extraChoice = null;
  while (step >= 0 && step < 4) {
    if (step === 0) {
      armorChoice = await showChoiceDialog({
        title: "Starting Armor",
        message: "Choose your starting armor package.",
        choices: withBackChoice(startingGear.armorChoices.map((choice) => ({ value: choice.value, label: choice.label }))),
      });
      if (armorChoice === dialogBackValue) return dialogBackValue;
      if (!armorChoice) return null;
      step += 1;
    } else if (step === 1) {
      weaponChoice = await showChoiceDialog({
        title: "Primary Weapon Loadout",
        message: "Choose whether your fighter starts with a weapon and shield or two weapons.",
        choices: withBackChoice(startingGear.weaponChoices.map((choice) => ({ value: choice.value, label: choice.label }))),
      });
      if (weaponChoice === dialogBackValue) step -= 1;
      else if (!weaponChoice) return null;
      else step += 1;
    } else if (step === 2) {
      weaponIds =
        weaponChoice === "weapon-shield"
          ? await showSelectionDialog({
              title: "Choose Martial Weapon",
              message: "Select a martial weapon for your fighter.",
              items: handFriendlyWeapons,
              label: "Weapon",
              confirmText: "Choose Weapon",
              cancelText: "Back",
            })
          : await showTwoSelectionDialog({
              title: "Choose Two Martial Weapons",
              message: "Select two different martial weapons for your fighter.",
              items: handFriendlyWeapons,
              labels: ["First Weapon", "Second Weapon"],
              confirmText: "Choose Weapons",
              cancelText: "Back",
            });
      if (!weaponIds) step -= 1;
      else step += 1;
    } else if (step === 3) {
      extraChoice = await showChoiceDialog({
        title: "Secondary Gear",
        message: "Choose additional starting ranged gear.",
        choices: withBackChoice(startingGear.secondaryChoices.map((choice) => ({ value: choice.value, label: choice.label }))),
      });
      if (extraChoice === dialogBackValue) step -= 1;
      else if (!extraChoice) return null;
      else step += 1;
    }
  }
  if (step < 4) return null;

  const equipment = {};
  const items = [];
  let quiver = null;
  const selectedArmor = startingGear.armorChoices.find((choice) => choice.value === armorChoice);
  const selectedWeaponChoice = startingGear.weaponChoices.find((choice) => choice.value === weaponChoice);
  const selectedExtra = startingGear.secondaryChoices.find((choice) => choice.value === extraChoice);
  if (!selectedArmor || !selectedWeaponChoice || !selectedExtra) return null;

  Object.assign(equipment, selectedArmor.equipment ?? {}, selectedWeaponChoice.equipment ?? {});
  if (Array.isArray(selectedArmor.inventory)) items.push(...selectedArmor.inventory);
  if (selectedArmor.quiver) quiver = selectedArmor.quiver;

  if (weaponChoice === "weapon-shield") {
    equipment.mainHand = weaponIds;
    items.push(weaponIds, "shield");
  } else {
    equipment.mainHand = weaponIds[0];
    equipment.offHand = weaponIds[1];
    items.push(weaponIds[0], weaponIds[1]);
  }

  if (Array.isArray(selectedExtra.inventory)) items.push(...selectedExtra.inventory);
  if (selectedExtra.quiver) quiver = selectedExtra.quiver;
  if (quiver) equipment.quiver = quiver;

  return {
    equipment,
    inventory: {
      money: { cp: 0, sp: 0, gp: 0 },
      items: starterEquipmentItems(items),
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

function showD20ModeDialog({ allowBack = true } = {}) {
  return showChoiceDialog({
    title: "D20 Luck",
    message: "Choose how friendly d20 rolls behave. This can be changed later at the Planning Table.",
    choices: [
      { value: "karmic", label: "Karmic / Mercy Mode" },
      { value: "random", label: "Truly Random" },
      { value: "tymora", label: "Tymora's Favorite" },
      ...(allowBack ? [{ value: dialogBackValue, label: "Back" }] : []),
    ],
  });
}

function raceSelectOptions(selectedRaceId) {
  return Object.entries(speciesDefinitions)
    .map(([raceId, race]) => `<option value="${escapeAttribute(raceId)}" ${raceId === selectedRaceId ? "selected" : ""}>${escapeHtml(race.name)}</option>`)
    .join("");
}

function subraceSelectOptions(raceId, selectedSubraceId) {
  return Object.entries(speciesDefinitions[raceId]?.subraces ?? {})
    .map(([subraceId, subrace]) => `<option value="${escapeAttribute(subraceId)}" ${subraceId === selectedSubraceId ? "selected" : ""}>${escapeHtml(subrace.name)}</option>`)
    .join("");
}

function dragonAncestrySelectOptions(category, selectedAncestryId) {
  return Object.entries(dragonAncestries[category] ?? {})
    .map(([ancestryId, ancestry]) => `<option value="${escapeAttribute(ancestryId)}" ${ancestryId === selectedAncestryId ? "selected" : ""}>${escapeHtml(ancestry.name)} (${escapeHtml(ancestry.damageType)})</option>`)
    .join("");
}

function raceFeatureSummaryMarkup(selection) {
  const traits = raceTraitsForSelection(selection);
  const details = activeRaceFeatureLines(traits);
  return `<p class="empty-note">${details.map(escapeHtml).join("<br>")}</p>`;
}

function activeRaceFeatureLines(traits) {
  const lines = [
    `Ability bonuses: ${abilityBonusSummary(traits.abilityBonuses)}`,
    `Speed: ${traits.speedFeet} ft`,
  ];
  if (traits.damageResistances?.length) lines.push(`Resistances: ${traits.damageResistances.join(", ")}`);
  if (traits.hpPerLevel) lines.push(`Dwarven Toughness: +${traits.hpPerLevel} max HP per level`);
  if (traits.halflingLucky) lines.push("Lucky: reroll d20 natural 1s once");
  if (traits.relentlessEndurance) lines.push("Relentless Endurance: drop to 1 HP once per long rest");
  if (traits.savageAttacks) lines.push("Savage Attacks: extra weapon damage die on melee critical hits");
  if (traits.weaponProficiencies?.length) lines.push(`Weapon proficiencies: ${traits.weaponProficiencies.join(", ")}`);
  if (traits.armorProficiencies?.length) lines.push(`Armor proficiencies: ${traits.armorProficiencies.join(", ")}`);
  return lines;
}

function activeRaceFeatureLinesForFighter(fighter) {
  const traits = raceTraitsForSelection(fighter?.raceSelection);
  return activeRaceFeatureLines({
    ...traits,
    damageResistances: uniqueValues(fighter?.damageResistances ?? traits.damageResistances),
    weaponProficiencies: uniqueValues(fighter?.weaponProficiencies ?? traits.weaponProficiencies),
    armorProficiencies: uniqueValues(fighter?.armorProficiencies ?? traits.armorProficiencies),
    hpPerLevel: fighter?.racialHpPerLevel ?? traits.hpPerLevel,
    halflingLucky: Boolean(fighter?.racialTraits?.halflingLucky),
    relentlessEndurance: Boolean(fighter?.racialTraits?.relentlessEndurance),
    savageAttacks: Boolean(fighter?.racialTraits?.savageAttacks),
  });
}

function showHeroRaceDialog({ selection = defaultRaceSelection, allowBack = true } = {}) {
  return new Promise((resolve) => {
    let current = normalizeRaceSelection(selection);

    const renderField = (errorText = "") => {
      current = normalizeRaceSelection(current);
      const subrace = speciesDefinitions[current.raceId]?.subraces?.[current.subraceId] ?? {};
      const dragonCategory = subrace.dragonCategory;
      const abilityChoiceCount = speciesDefinitions[current.raceId]?.base?.abilityChoiceCount ?? subrace.abilityChoiceCount ?? 0;
      const choiceSelects = Array.from({ length: abilityChoiceCount }, (_, index) => {
        const selectedAbility = current.abilityChoices[index] ?? "";
        return `
          <label>
            <span>Half-Elf +1 Ability ${index + 1}</span>
            <select data-race-ability-choice="${index}">
              <option value="">-</option>
              ${abilities
                .map((ability) => `<option value="${ability}" ${ability === selectedAbility ? "selected" : ""}>${ability.toUpperCase()}</option>`)
                .join("")}
            </select>
          </label>
        `;
      }).join("");

      els.gameDialogField.innerHTML = `
        <label>
          <span>Race / Species</span>
          <select data-race-select>${raceSelectOptions(current.raceId)}</select>
        </label>
        <label>
          <span>Subrace</span>
          <select data-subrace-select>${subraceSelectOptions(current.raceId, current.subraceId)}</select>
        </label>
        ${
          dragonCategory
            ? `<label>
                <span>Draconic Ancestry</span>
                <select data-dragon-ancestry-select>${dragonAncestrySelectOptions(dragonCategory, current.dragonAncestryId)}</select>
              </label>`
            : ""
        }
        ${choiceSelects}
        ${raceFeatureSummaryMarkup(current)}
        <p class="ability-assignment-error" aria-live="polite">${escapeHtml(errorText)}</p>
      `;
    };

    const cleanup = (value) => {
      els.gameDialogForm.removeEventListener("submit", handleSubmit);
      els.gameDialogActions.removeEventListener("click", handleClick);
      els.gameDialogField.removeEventListener("change", handleChange);
      els.gameDialog.classList.add("hidden");
      activeDialogCancel = null;
      resolve(value);
    };

    const handleSubmit = (event) => {
      event.preventDefault();
      const abilityChoiceCount = speciesDefinitions[current.raceId]?.base?.abilityChoiceCount ?? speciesDefinitions[current.raceId]?.subraces?.[current.subraceId]?.abilityChoiceCount ?? 0;
      if (abilityChoiceCount) {
        const selected = current.abilityChoices.slice(0, abilityChoiceCount);
        if (selected.length !== abilityChoiceCount || selected.some((ability) => !ability) || new Set(selected).size !== selected.length) {
          renderField("Choose two different Half-Elf ability bonuses.");
          return;
        }
      }
      cleanup(normalizeRaceSelection(current));
    };

    const handleClick = (event) => {
      const button = event.target.closest("[data-dialog-action]");
      if (!button) return;
      if (button.dataset.dialogAction === "confirm") return;
      cleanup(button.dataset.dialogAction === "back" ? dialogBackValue : null);
    };

    const handleChange = (event) => {
      if (event.target.matches("[data-race-select]")) {
        current = { raceId: event.target.value, subraceId: firstSubraceId(event.target.value), dragonAncestryId: "", abilityChoices: [] };
        renderField();
        return;
      }
      if (event.target.matches("[data-subrace-select]")) {
        current = { ...current, subraceId: event.target.value, dragonAncestryId: "", abilityChoices: [] };
        renderField();
        return;
      }
      if (event.target.matches("[data-dragon-ancestry-select]")) {
        current = { ...current, dragonAncestryId: event.target.value };
        renderField();
        return;
      }
      if (event.target.matches("[data-race-ability-choice]")) {
        const index = Number(event.target.dataset.raceAbilityChoice);
        const abilityChoices = [...(current.abilityChoices ?? [])];
        abilityChoices[index] = event.target.value;
        current = { ...current, abilityChoices };
        renderField();
      }
    };

    els.gameDialogTitle.textContent = "Choose Race / Species";
    els.gameDialogMessage.textContent = "Choose the ancestry traits for this hero. The summary only lists mechanics currently active in this game.";
    els.gameDialogField.classList.remove("hidden");
    els.gameDialogActions.innerHTML = `
      <button type="submit" data-dialog-action="confirm">Choose Race</button>
      ${allowBack ? `<button type="button" class="ghost-button" data-dialog-action="back">Back</button>` : ""}
      <button type="button" class="ghost-button" data-dialog-action="cancel">Cancel</button>
    `;
    els.gameDialogForm.addEventListener("submit", handleSubmit);
    els.gameDialogActions.addEventListener("click", handleClick);
    els.gameDialogField.addEventListener("change", handleChange);
    activeDialogCancel = () => cleanup(null);
    renderField();
    els.gameDialog.classList.remove("hidden");
    els.gameDialogField.querySelector("select")?.focus();
  });
}

function availableHeroClasses() {
  return window.DungeonContent
    .list("classes")
    .filter((entry) => !entry.hidden)
    .sort((a, b) => (a.className ?? a.name).localeCompare(b.className ?? b.name));
}

async function showHeroClassDialog({ allowBack = true } = {}) {
  const choices = availableHeroClasses().map((entry) => ({
    value: entry.id,
    label: `${entry.className ?? entry.name}${entry.spells?.length ? " (spellcaster)" : ""}`,
  }));
  return showChoiceDialog({
    title: "Choose Class",
    message: "Choose this hero's class.",
    choices: allowBack ? withBackChoice(choices) : choices,
  });
}

const interactiveTutorialSteps = [
  {
    title: "Welcome To The Table",
    body: "This tour uses a temporary tutorial party. It does not use a normal save slot, so you can poke around freely.",
    selector: ".arena",
    enter: () => switchInteractiveTutorialScene("dungeon"),
  },
  {
    title: "Move A Hero",
    body: "Drag a hero token through adjacent squares to move. Select several heroes with Shift, Ctrl, or Cmd, then drag one selected token to move the group.",
    selector: ".token.hero",
    enter: () => switchInteractiveTutorialScene("dungeon"),
  },
  {
    title: "Move The Map",
    body: "Grab empty map space and drag to pan. The zoom controls in the top bar change how much of the dungeon you can see.",
    selector: ".room-scroll",
    enter: () => switchInteractiveTutorialScene("dungeon"),
  },
  {
    title: "Open Inventory",
    body: "Use the I button on the hero card, or press I, to open inventory and equipment.",
    selector: ".open-inventory",
  },
  {
    title: "Inventory And Equipment",
    body: "Inventory shows carried items, equipped gear, money, and home chest storage. Items can be inspected and moved from here.",
    selector: "#inventory-menu .inventory-panel",
    enter: () => showInventoryMenu(),
  },
  {
    title: "Home Objects",
    body: "Now you are at home. Left-click or right-click the chest or planning table to inspect them.",
    selector: ".chest-token, .planning-table-token, .dungeon-object",
    enter: () => {
      hideInventoryMenu();
      switchInteractiveTutorialScene("home");
    },
  },
  {
    title: "Home Door",
    body: "Step onto the home door space, or click the door token while adjacent, to open choices for the merchant or venturing into another dungeon.",
    selector: ".exit-token",
    enter: () => switchInteractiveTutorialScene("home"),
  },
  {
    title: "Action Buttons",
    body: "The bottom bar changes with context. It handles initiative, attacks, other actions, items, abilities, resting, fleeing, and ending turns. If several monsters are in weapon range, press Tab to switch targets.",
    selector: ".action-dock",
  },
  {
    title: "Menus And Controls",
    body: "The top bar has save, main menu, zoom, volume, and the text tutorial. Main Menu exits this tour.",
    selector: ".top-actions",
  },
];

function createTutorialHero(id, name, token, role, equipment, items, position) {
  const template = getHeroTemplate();
  return createCombatant({
    ...cloneData(template),
    id,
    name,
    token,
    partyRole: role,
    position,
    equipment,
    inventory: {
      money: { gp: id === "hero" ? 18 : 9 },
      heroTokens: 2,
      items,
    },
  });
}

function createInteractiveTutorialState() {
  const tutorialState = createInteractiveTutorialDungeonState();
  tutorialState.log = [
    {
      text: "Interactive tutorial started. This temporary party is separate from your save slots.",
      type: "important",
    },
  ];
  return tutorialState;
}

function createInteractiveTutorialDungeonState() {
  const tutorialState = createInitialState("Tutorial Guard");
  const blockedKeys = new Set((tutorialState.dungeonObjects ?? []).filter(objectBlocksMovement).flatMap(objectCells).map(positionKey));
  const positions = dungeonStartPositions(tutorialState.dungeon, 2, blockedKeys);
  const guard = createTutorialHero(
    "hero",
    "Tutorial Guard",
    "G",
    "tank",
    { mainHand: "longsword", offHand: "shield", torso: "chain-mail" },
    ["longsword", "shield", "chain-mail", "potion-healing"],
    positions[0] ?? tutorialState.dungeon.startPosition,
  );
  const scout = createTutorialHero(
    "tutorial-scout",
    "Tutorial Scout",
    "S",
    "dd",
    { mainHand: "shortbow", torso: "leather", quiver: "arrows-20" },
    ["shortbow", "leather", "arrows-20", "dagger"],
    positions[1] ?? { x: tutorialState.dungeon.startPosition.x + 1, y: tutorialState.dungeon.startPosition.y },
  );
  tutorialState.fighters = { hero: guard, "tutorial-scout": scout };
  tutorialState.party = {
    activeHeroId: "hero",
    heroIds: ["hero", "tutorial-scout"],
    rosterIds: ["hero", "tutorial-scout"],
  };
  Object.values(tutorialState.fighters).forEach(refreshDerivedStats);
  tutorialState.isTutorial = true;
  tutorialState.tutorialScene = "dungeon";
  tutorialState.saveSlotId = null;
  tutorialState.combatStarted = false;
  tutorialState.initiative = [];
  tutorialState.chest = [createItemInstance("potion-healing", "tutorial-chest")];
  tutorialState.chestMoney = normalizeMoney({ gp: 25 });
  tutorialState.lootPiles = [];
  return tutorialState;
}

function switchInteractiveTutorialScene(scene) {
  if (!interactiveTutorialActive || state?.tutorialScene === scene) return;
  const heroes = rosterHeroes();
  const chest = state.chest ?? [];
  const chestMoney = state.chestMoney ?? {};
  const party = state.party;
  if (scene === "home") {
    state = createHomeState(heroes, chest, chestMoney, party);
    state.isTutorial = true;
    state.tutorialScene = "home";
    selectedHeroIds = new Set([state.party.activeHeroId]);
    roomIsBuilt = false;
    render();
    centerViewOnHero();
  } else if (scene === "dungeon") {
    state = createInteractiveTutorialDungeonState();
    state.log = [
      {
        text: "Interactive tutorial dungeon loaded. This temporary party is separate from your save slots.",
        type: "important",
      },
    ];
    selectedHeroIds = new Set([state.party.activeHeroId]);
    roomIsBuilt = false;
    render();
    centerViewOnHero();
  }
}

function tutorialTargetRect(selector) {
  if (!selector) return null;
  const elements = Array.from(document.querySelectorAll(selector)).filter((element) => {
    if (element.classList.contains("hidden")) return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });
  if (!elements.length) return null;
  return elements
    .map((element) => element.getBoundingClientRect())
    .reduce((bounds, rect) => ({
      left: Math.min(bounds.left, rect.left),
      top: Math.min(bounds.top, rect.top),
      right: Math.max(bounds.right, rect.right),
      bottom: Math.max(bounds.bottom, rect.bottom),
      width: Math.max(bounds.right, rect.right) - Math.min(bounds.left, rect.left),
      height: Math.max(bounds.bottom, rect.bottom) - Math.min(bounds.top, rect.top),
    }));
}

function updateInteractiveTutorial() {
  if (!interactiveTutorialActive || !els.tutorialTour) return;
  const step = interactiveTutorialSteps[interactiveTutorialStep];
  if (!step) return;

  step.enter?.();
  els.tutorialTourStep.textContent = `Tutorial ${interactiveTutorialStep + 1} / ${interactiveTutorialSteps.length}`;
  els.tutorialTourTitle.textContent = step.title;
  els.tutorialTourBody.textContent = step.body;
  els.tutorialTourBack.disabled = interactiveTutorialStep === 0;
  els.tutorialTourNext.textContent = interactiveTutorialStep === interactiveTutorialSteps.length - 1 ? "Done" : "Next";

  window.requestAnimationFrame(() => {
    const rect = tutorialTargetRect(step.selector);
    if (!rect) {
      els.tutorialHighlight.classList.add("hidden");
      return;
    }
    els.tutorialHighlight.classList.remove("hidden");
    els.tutorialHighlight.style.left = `${Math.max(8, rect.left - 8)}px`;
    els.tutorialHighlight.style.top = `${Math.max(8, rect.top - 8)}px`;
    els.tutorialHighlight.style.width = `${rect.width + 16}px`;
    els.tutorialHighlight.style.height = `${rect.height + 16}px`;
  });
}

function startInteractiveTutorial() {
  window.clearTimeout(monsterTurnTimer);
  activeSaveSlot = null;
  state = createInteractiveTutorialState();
  selectedHeroIds = new Set([state.party.activeHeroId]);
  showDungeonLayout = false;
  roomIsBuilt = false;
  interactiveTutorialActive = true;
  interactiveTutorialStep = 0;
  hideMainMenu();
  hideFighterInfo();
  hideInventoryMenu();
  hideUseItemMenu();
  hideAbilitiesMenu();
  hideHomeMenu();
  hideStoreMenu();
  render();
  centerViewOnHero();
  els.tutorialTour.classList.remove("hidden");
  updateInteractiveTutorial();
}

function finishInteractiveTutorial() {
  interactiveTutorialActive = false;
  els.tutorialTour?.classList.add("hidden");
  els.tutorialHighlight?.classList.add("hidden");
  hideInventoryMenu();
  if (state?.isTutorial) showMainMenu("Tutorial ended. Start a new adventure when you are ready.");
}

function rollAbilityScore() {
  const rolls = [rollDie(6), rollDie(6), rollDie(6), rollDie(6)].sort((a, b) => a - b);
  return rolls.slice(1).reduce((sum, roll) => sum + roll, 0);
}

function renderAbilityAssignmentFields(scores, raceSelection = defaultRaceSelection) {
  const bonuses = raceAbilityBonuses(raceSelection);
  return abilities
    .map(
      (ability) => `
        <label>
          <span>${ability.toUpperCase()}${bonuses[ability] ? ` ${abilityLabel(bonuses[ability])}` : ""}</span>
          <select data-ability-select="${ability}"></select>
        </label>
      `,
    )
    .join("");
}

function updateAbilityAssignmentOptions(container, scores, raceSelection = defaultRaceSelection) {
  const bonuses = raceAbilityBonuses(raceSelection);
  const selects = Array.from(container.querySelectorAll("[data-ability-select]"));
  const selected = new Map(selects.map((select) => [select.dataset.abilitySelect, select.value]));
  const used = new Set(Array.from(selected.values()).filter((value) => value !== ""));

  for (const select of selects) {
    const current = selected.get(select.dataset.abilitySelect) ?? "";
    const bonus = bonuses[select.dataset.abilitySelect] ?? 0;
    const options = [`<option value="">-</option>`];
    scores.forEach((score, index) => {
      const value = String(index);
      if (value === current || !used.has(value)) {
        const label = bonus ? `${score} ${abilityLabel(bonus)} = ${score + bonus}` : `${score}`;
        options.push(`<option value="${value}" ${value === current ? "selected" : ""}>${label}</option>`);
      }
    });
    select.innerHTML = options.join("");
  }
}

function showAbilityAssignmentDialog(scores, raceSelection = defaultRaceSelection) {
  return new Promise((resolve) => {
    const sortedScores = [...scores].sort((a, b) => b - a);
    els.gameDialogTitle.textContent = "Assign Ability Scores";
    els.gameDialogMessage.innerHTML = `
      Scores: ${sortedScores.map(escapeHtml).join(", ")}
      <br><span class="empty-note">${escapeHtml(raceDisplayName(raceSelection))}: ${escapeHtml(abilityBonusSummary(raceAbilityBonuses(raceSelection)))}</span>
    `;
    els.gameDialogField.classList.add("hidden");
    els.gameDialogActions.innerHTML = `
      <div class="ability-assignment">
        ${renderAbilityAssignmentFields(sortedScores, raceSelection)}
        <p class="ability-assignment-error" aria-live="polite"></p>
      </div>
      <button type="submit" data-dialog-action="confirm">Start Adventure</button>
      <button type="button" class="ghost-button" data-dialog-action="cancel">Back</button>
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
      updateAbilityAssignmentOptions(els.gameDialogActions, sortedScores, raceSelection);
      const error = els.gameDialogActions.querySelector(".ability-assignment-error");
      if (error) error.textContent = "";
    };

    els.gameDialogForm.addEventListener("submit", handleSubmit);
    els.gameDialogActions.addEventListener("click", handleClick);
    els.gameDialogActions.addEventListener("change", handleChange);
    activeDialogCancel = () => cleanup(null);
    els.gameDialog.classList.remove("hidden");
    updateAbilityAssignmentOptions(els.gameDialogActions, sortedScores, raceSelection);
    els.gameDialogActions.querySelector("select")?.focus();
  });
}

function spellChoiceCountForClassLevel(classId, level) {
  const template = getHeroTemplate(classId);
  const casterType = template.casterType ?? "none";
  if (casterType === "none") return 0;
  if (casterType === "full") return level === 1 ? 2 : 1;
  if (casterType === "half") return level === 1 || (level > 1 && level % 2 === 1) ? 1 : 0;
  if (casterType === "pact") return level === 1 ? 2 : level >= 3 && level <= 17 && level % 2 === 1 ? 1 : 0;
  return 0;
}

function eligibleSpellChoicesFor(classSource, chosenSpellIds = []) {
  const chosen = new Set(chosenSpellIds);
  const maxLevel = maxSpellLevelForFighter(classSource);
  return classSpellListForFighter(classSource)
    .map((spellId) => getContentDefinition("spells", spellId))
    .filter((spell) => spell && !chosen.has(spell.id) && spellBaseLevel(spell) <= maxLevel);
}

async function chooseClassSpells(classSource, count, chosenSpellIds = []) {
  const chosen = [...chosenSpellIds];
  let unusedCredits = 0;
  for (let index = 0; index < count; index += 1) {
    const eligible = eligibleSpellChoicesFor(classSource, chosen);
    if (!eligible.length) {
      unusedCredits += 1;
      continue;
    }
    const choice = await showChoiceDialog({
      title: "Choose Spell",
      message: `Choose a ${classSource.className ?? "class"} spell (${index + 1}/${count}).`,
      choices: eligible.map((spell) => ({
        value: spell.id,
        label: `${spell.name} (L${spellBaseLevel(spell)})`,
      })),
    });
    if (!choice) {
      unusedCredits += count - index;
      break;
    }
    chosen.push(choice);
  }
  return { spells: chosen, unusedCredits };
}

async function createCharacterOptions(raceSelection = defaultRaceSelection, classId = defaultContent.heroClass) {
  let step = 0;
  let choice = null;
  let abilityScores = null;
  while (true) {
    while (step >= 0 && step < 2) {
      if (step === 0) {
        choice = await showChoiceDialog({
          title: "Ability Scores",
          message: "Choose how to create your fighter's STR, DEX, CON, INT, WIS, and CHA.",
          choices: withBackChoice([
            { value: "pregenerated", label: "Pregenerated" },
            { value: "standard", label: "Standard Array" },
            { value: "roll", label: "Roll Stats" },
          ]),
        });
        if (choice === dialogBackValue) return dialogBackValue;
        if (!choice) return null;
        abilityScores = choice === "pregenerated" ? (classPredefinedAbilityScores[classId] ?? pregeneratedAbilityScores) : null;
        step += 1;
      } else if (step === 1 && choice !== "pregenerated" && !abilityScores) {
        const scores = choice === "roll" ? abilities.map(rollAbilityScore) : standardArray;
        abilityScores = await showAbilityAssignmentDialog(scores, raceSelection);
        if (!abilityScores) step -= 1;
        else step += 1;
      } else {
        step += 1;
      }
    }

    const gearOptions = await createHeroGearOptions(classId);
    if (gearOptions === dialogBackValue) {
      step = 0;
      choice = null;
      abilityScores = null;
      continue;
    }
    if (gearOptions) {
      const classTemplate = getHeroTemplate(classId);
      const classSpellList = [...(classTemplate.classSpellList ?? classTemplate.spellList ?? classTemplate.spells ?? [])];
      const spellChoiceCount = spellChoiceCountForClassLevel(classId, 1);
      const spellChoice = spellChoiceCount ? await chooseClassSpells({ ...classTemplate, classSpellList, level: 1 }, spellChoiceCount) : { spells: [], unusedCredits: 0 };
      return { abilityScores, classSpellList, spells: spellChoice.spells, unusedSpellChoiceCredits: spellChoice.unusedCredits, ...gearOptions };
    }
    return null;
  }
}

async function startNewAdventure() {
  window.clearTimeout(monsterTurnTimer);
  const slotId = await chooseSaveSlotForAdventure();
  if (!slotId) return;
  let chosenName = "";
  let heroOptions = null;
  let chosenTokenArt = "";
  let raceSelection = defaultRaceSelection;
  let classId = defaultContent.heroClass;
  while (!heroOptions) {
    const identity = await showHeroIdentityDialog({
      title: "Character Name",
      message: "Name your adventurer before stepping into the dungeon.",
      nameValue: chosenName || getHeroTemplate().name,
      tokenArt: chosenTokenArt,
      confirmText: "Start Adventure",
    });
    if (!identity) return;
    chosenName = identity.name || getHeroTemplate().name;
    chosenTokenArt = identity.tokenArt;
    const chosenClass = await showHeroClassDialog();
    if (chosenClass === dialogBackValue) {
      heroOptions = null;
      continue;
    }
    if (!chosenClass) return;
    classId = chosenClass;
    const chosenRace = await showHeroRaceDialog({ selection: raceSelection });
    if (chosenRace === dialogBackValue) {
      heroOptions = null;
      continue;
    }
    if (!chosenRace) return;
    raceSelection = chosenRace;
    heroOptions = await createCharacterOptions(raceSelection, classId);
    if (heroOptions === dialogBackValue) {
      heroOptions = null;
      continue;
    }
    if (!heroOptions) return;
  }
  const d20Mode = await showD20ModeDialog({ allowBack: false });
  if (!d20Mode) return;
  heroOptions.d20Mode = normalizeD20Mode(d20Mode);
  heroOptions.classId = classId;
  heroOptions.tokenArt = chosenTokenArt;
  heroOptions.raceSelection = raceSelection;
  showDungeonLayout = false;
  state = createInitialState(chosenName, null, heroOptions);
  state.saveSlotId = slotId;
  activeSaveSlot = slotId;
  await saveAdventure(slotId, { skipOverwriteWarning: true });
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
  const partyIds = state.party?.heroIds ?? ["hero"];
  const partyMembers = partyIds.map((id) => state.fighters[id]).filter((hero) => hero && !hero.dead);
  if (partyMembers.length === 0) {
    addLog("Choose at least one hero at the Planning Table before venturing out.", "important");
    render();
    return;
  }
  const themeId = await chooseDungeonThemeId();
  if (!themeId) return;
  state = createDungeonStateForParty(partyMembers, state, themeId);
  saveQuickstart(state);
  roomIsBuilt = false;
  hideHomeMenu();
  addLog(`${partyMembers.map((hero) => hero.name).join(", ")} leave home for ${getContentDefinition("themes", themeId)?.name ?? "a new dungeon"}.`, "important");
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

  const hero = activeHero();
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

  const saveSlotId = state.saveSlotId ?? activeSaveSlot;
  state = createHomeState(rosterHeroes(), state.chest ?? [], state.chestMoney ?? {}, state.party);
  state.saveSlotId = saveSlotId;
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
    selectedHeroIds = new Set([state.party.activeHeroId]);
    state.saveSlotId = slotId;
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

async function saveAdventure(slotId = activeSaveSlot, options = {}) {
  if (state?.isTutorial) {
    updateSaveStatus("The interactive tutorial uses temporary data and cannot be saved.");
    return;
  }
  if (!slotId) return;
  if (!options.skipOverwriteWarning && !(await confirmSaveSlotOverwrite(slotId, "save"))) {
    updateSaveStatus("Save cancelled.");
    return;
  }
  const nameInput = els.saveSlots.querySelector(`#save-slot-name-${slotId}`);
  const slot = getSlots().find((entry) => entry.id === slotId);
  const slotName = nameInput?.value.trim() || slot?.name || `Save Slot ${slotId}`;
  const savedAt = new Date().toLocaleString();
  activeSaveSlot = slotId;
  state.saveSlotId = state.saveSlotId ?? slotId;
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
  if (!partyDefeatedOrDying() || state.deathPromptShown) return;
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
  selectedHeroIds = new Set([state.party.activeHeroId]);
  showDungeonLayout = false;
  roomIsBuilt = false;
  addLog("Dungeon restarted from the beginning.", "important");
  render();
  centerViewOnHero();
}

function downHero(hero) {
  hero.hp = 0;
  hero.alive = true;
  hero.deathSaves = hero.deathSaves ?? { successes: 0, failures: 0 };
  hero.hasAction = false;
  hero.hasBonusAction = false;
  hero.movementLeft = 0;
}

function killHero(hero) {
  hero.hp = 0;
  hero.alive = false;
  hero.dead = true;
  hero.deathSaves = { successes: 0, failures: 3 };
  dropLootForHero(hero);
  state.party.heroIds = livingPartyHeroIds();
  if (state.party.activeHeroId === hero.id) {
    state.party.activeHeroId = state.party.heroIds[0] ?? state.party.rosterIds.find((id) => state.fighters[id] && !state.fighters[id].dead) ?? "hero";
  }
  addLog(`${hero.name} dies.`, "important");
  handleHeroDeath();
}

function applyDamageToFighter(defender, damage) {
  const wasDown = isPartyHeroId(defender.id) && defender.hp <= 0;
  const previousHp = defender.hp;
  defender.hp = Math.max(0, defender.hp - damage);
  checkConcentrationAfterDamage(defender, damage);
  if (!isPartyHeroId(defender.id)) {
    defender.alive = defender.hp > 0;
    return;
  }
  playSoundEffect("characterDamage");
  if (
    defender.hp <= 0 &&
    previousHp > 0 &&
    defender.racialTraits?.relentlessEndurance &&
    !defender.relentlessEnduranceUsed
  ) {
    defender.hp = 1;
    defender.alive = true;
    defender.relentlessEnduranceUsed = true;
    addLog(`${defender.name}'s Relentless Endurance keeps them standing at 1 HP.`, "important");
    return;
  }
  if (defender.hp > 0) {
    defender.alive = true;
    defender.deathSaves = { successes: 0, failures: 0 };
    return;
  }
  if (wasDown) {
    defender.deathSaves.failures += 1;
    addLog(`${defender.name} takes damage while down: death save failure ${defender.deathSaves.failures}/3.`, "important");
    if (defender.deathSaves.failures >= 3) killHero(defender);
    else handleHeroDeath();
    return;
  }
  downHero(defender);
  addLog(`${defender.name} drops to 0 HP and starts making death saves.`, "important");
  handleHeroDeath();
}

function checkConcentrationAfterDamage(fighter, damage) {
  if (!fighter?.concentration || damage <= 0 || fighter.hp <= 0) return;
  const dc = Math.max(10, Math.floor(damage / 2));
  const save = savingThrow(fighter, "con", dc);
  addLog(`${fighter.name} makes a concentration save: CON ${save.roll} ${abilityLabel(save.bonus)} = ${save.total} vs DC ${dc}${save.success ? " (success)" : " (failure)"}.`, save.success ? "" : "important");
  if (!save.success) endConcentration(fighter, "failed concentration save");
}

function showDeathSaveMenu(hero) {
  return new Promise((resolve) => {
    const message = `${hero.name} is at 0 HP and must make a death saving throw.`;
    let resultRoll = null;
    addLog(message, "important");
    els.gameDialogTitle.textContent = "Death Save";
    els.gameDialogMessage.innerHTML = `
      <p>${escapeHtml(message)}</p>
      <p>Roll d20. 10 or higher is a success, 1 counts as two failures, and 20 brings the hero back with 1 HP.</p>
    `;
    els.gameDialogField.classList.add("hidden");
    els.gameDialogActions.innerHTML = `<button type="button" data-death-save-roll>Roll Death Save</button>`;

    const cleanup = () => {
      if (resultRoll === null) return;
      els.gameDialogActions.removeEventListener("click", handleClick);
      els.gameDialog.classList.add("hidden");
      activeDialogCancel = null;
      resolve(resultRoll);
    };

    const handleClick = (event) => {
      if (event.target.closest("[data-death-save-close]")) {
        cleanup();
        return;
      }
      if (!event.target.closest("[data-death-save-roll]")) return;
      resultRoll = rollD20ForFighter(hero).roll;
      const resultText =
        resultRoll === 20
          ? "20: the hero gets back up with 1 HP."
          : resultRoll === 1
            ? "Natural 1: two death save failures."
            : resultRoll >= 10
              ? "Success."
              : "Failure.";
      els.gameDialogMessage.innerHTML = `
        <p>${escapeHtml(message)}</p>
        <p><b>Result:</b> ${resultRoll}. ${escapeHtml(resultText)}</p>
      `;
      els.gameDialogActions.innerHTML = `<button type="button" data-death-save-close>Close</button>`;
      activeDialogCancel = cleanup;
      els.gameDialogActions.querySelector("[data-death-save-close]")?.focus();
    };

    els.gameDialogActions.addEventListener("click", handleClick);
    activeDialogCancel = () => {};
    els.gameDialog.classList.remove("hidden");
    els.gameDialogActions.querySelector("[data-death-save-roll]")?.focus();
  });
}

async function rollDeathSave(hero) {
  if (!isPartyHeroId(hero.id) || hero.hp > 0 || hero.dead) return;
  hero.deathSaves = hero.deathSaves ?? { successes: 0, failures: 0 };
  if (hero.deathSaves.successes >= 3) {
    addLog(`${hero.name} is stable at 0 HP.`, "important");
    return;
  }
  const roll = await showDeathSaveMenu(hero);
  if (roll === 20) {
    hero.hp = 1;
    hero.alive = true;
    hero.deathSaves = { successes: 0, failures: 0 };
    addLog(`${hero.name} rolls a 20 death save and gets back up with 1 HP.`, "important");
    recordD20OutcomeForFighter(hero, true);
    return;
  }
  if (roll === 1) hero.deathSaves.failures += 2;
  else if (roll >= 10) hero.deathSaves.successes += 1;
  else hero.deathSaves.failures += 1;
  recordD20OutcomeForFighter(hero, roll >= 10);
  addLog(`${hero.name} death save: ${roll}. Successes ${hero.deathSaves.successes}/3, failures ${hero.deathSaves.failures}/3.`, "important");
  if (hero.deathSaves.failures >= 3) killHero(hero);
  else if (hero.deathSaves.successes >= 3) {
    hero.alive = true;
    hero.deathSaves = { successes: 3, failures: 0 };
    addLog(`${hero.name} stabilizes.`, "important");
  }
}

function heroCanAct(fighter) {
  return fighter?.alive && !fighter.dead && fighter.hp > 0;
}

function heroIsStableAtZero(hero) {
  return Boolean(hero?.alive && !hero.dead && hero.hp <= 0 && (hero.deathSaves?.successes ?? 0) >= 3);
}

function heroIsUnstableDying(hero) {
  return Boolean(hero?.alive && !hero.dead && hero.hp <= 0 && (hero.deathSaves?.successes ?? 0) < 3);
}

function unstableDyingPartyHeroes() {
  return partyHeroes().filter(heroIsUnstableDying);
}

function stableUnconsciousPartyHeroes() {
  return partyHeroes().filter(heroIsStableAtZero);
}

function partyDefeatedOrDying() {
  const heroes = partyHeroes();
  return heroes.length === 0 || heroes.every((hero) => !heroCanAct(hero));
}

function addLog(text, type = "") {
  state.log.push({ text, type });
  if (state.log.length > 80) {
    state.log.shift();
  }
}

function turnLogSideForFighter(fighter) {
  if (isPartyHeroId(fighter?.id)) return "hero";
  if (fighter?.friendly || fighter?.team === "heroes") return "friendly";
  return "enemy";
}

function addTurnStartLog(fighter) {
  if (!fighter) return;
  const side = turnLogSideForFighter(fighter);
  addLog(`${fighter.name}'s turn starts.`, `turn-start turn-${side}`);
}

function resetTurnResources(fighter) {
  tickStatusDurations(fighter);
  fighter.statusEffects = (fighter.statusEffects ?? []).filter((effect) => !effect.expiresAtStartOfTurn);
  for (const ability of fighterAbilityDefinitions(fighter).filter((entry) => entry.refresh === "turn")) {
    fighter.abilityUses = { ...(fighter.abilityUses ?? {}), [ability.id]: 0 };
  }
  refreshDerivedStats(fighter);
  if (isPartyHeroId(fighter?.id) && fighter.hp <= 0) {
    endConcentration(fighter, "defeated");
    fighter.movementLeft = 0;
    fighter.hasAction = false;
    fighter.attacksRemaining = 0;
    fighter.hasBonusAction = false;
    fighter.dodging = false;
    fighter.disengaged = false;
    fighter.canMoveThroughMonsters = false;
    return;
  }
  const movementLocked = (fighter.statusEffects ?? []).some((effect) => effect.speedLocked);
  const actionLocked = (fighter.statusEffects ?? []).some((effect) => effect.actionLocked);
  fighter.movementLeft = movementLocked ? 0 : Math.floor(fighter.speedFeet / feetPerSquare);
  fighter.hasAction = !actionLocked;
  fighter.attacksRemaining = fighter.hasAction ? attacksPerAttackAction(fighter) : 0;
  fighter.sneakAttackUsedThisTurn = false;
  fighter.hasBonusAction = !actionLocked;
  fighter.dodging = false;
  fighter.disengaged = false;
  fighter.canMoveThroughMonsters = false;
}

function tickStatusDurations(fighter) {
  if (!fighter?.statusEffects?.length) return;
  const expired = [];
  fighter.statusEffects = fighter.statusEffects
    .map((effect) => {
      if (!effect.durationRounds) return effect;
      return { ...effect, durationRounds: effect.durationRounds - 1 };
    })
    .filter((effect) => {
      const keep = !effect.durationRounds || effect.durationRounds > 0;
      if (!keep) expired.push(effect.label ?? effect.id);
      return keep;
    });
  if (expired.length) addLog(`${fighter.name}'s ${expired.join(", ")} ${expired.length === 1 ? "expires" : "expire"}.`);
}

function attacksPerAttackAction(fighter) {
  const level = fighter?.level ?? 1;
  if (!["barbarian", "fighter", "monk", "paladin", "ranger"].includes(fighter?.classId)) return 1;
  if (fighter.classId === "fighter") return level >= 20 ? 4 : level >= 11 ? 3 : level >= 5 ? 2 : 1;
  return level >= 5 ? 2 : 1;
}

function sneakAttackDice(fighter) {
  if (fighter?.classId !== "rogue") return 0;
  return Math.ceil((fighter.level ?? 1) / 2);
}

function canApplySneakAttack(attacker, defender, weapon, rangedAttack) {
  if (attacker?.classId !== "rogue" || attacker.sneakAttackUsedThisTurn) return false;
  const eligibleWeapon = rangedAttack || weapon?.properties?.includes("finesse");
  if (!eligibleWeapon) return false;
  return Object.values(state.fighters).some(
    (fighter) =>
      fighter.id !== attacker.id &&
      fighter.id !== defender.id &&
      fighter.alive &&
      !fighter.dead &&
      isPartyHeroId(fighter.id) === isPartyHeroId(attacker.id) &&
      hasMeleeAccess(fighter, defender),
  );
}

function consumeWeaponRider(attacker) {
  const rider = (attacker.statusEffects ?? []).find((effect) => effect.weaponRider || ["thunderous-smite", "wrathful-smite", "branding-smite", "ensnaring-strike", "hail-of-thorns"].includes(effect.id));
  if (!rider) return null;
  attacker.statusEffects = (attacker.statusEffects ?? []).filter((effect) => effect.id !== rider.id);
  return rider;
}

function expireEndOfTurnEffects(fighter) {
  if (!fighter) return;
  fighter.statusEffects = (fighter.statusEffects ?? []).filter((effect) => !effect.expiresAtEndOfTurn);
  refreshDerivedStats(fighter);
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
  const hero = activeHero();
  window.requestAnimationFrame(() => {
    if (animate) {
      animateScrollRoomToGridPoint({ x: hero.position.x + 0.5, y: hero.position.y + 0.5 });
    } else {
      scrollRoomToGridPoint({ x: hero.position.x + 0.5, y: hero.position.y + 0.5 });
    }
  });
}

function nudgeViewForHeroNearEdge() {
  if (!els.roomScroll || !els.room) return;
  const hero = activeHero();
  const tileSize = currentTileSizePx();
  const heroCenterX = els.room.offsetLeft + (hero.position.x + 0.5) * tileSize;
  const heroCenterY = els.room.offsetTop + (hero.position.y + 0.5) * tileSize;
  const left = els.roomScroll.scrollLeft;
  const top = els.roomScroll.scrollTop;
  const right = left + els.roomScroll.clientWidth;
  const bottom = top + els.roomScroll.clientHeight;
  const marginX = Math.min(els.roomScroll.clientWidth * 0.28, tileSize * 3);
  const marginY = Math.min(els.roomScroll.clientHeight * 0.28, tileSize * 3);
  const nearEdge = heroCenterX < left + marginX || heroCenterX > right - marginX || heroCenterY < top + marginY || heroCenterY > bottom - marginY;

  if (nearEdge) {
    animateScrollRoomToGridPoint({ x: hero.position.x + 0.5, y: hero.position.y + 0.5 }, 240);
  }
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

function dungeonFloorKeys() {
  return new Set((state.dungeon?.walkable ?? []).map(positionKey));
}

function positionFromKey(tileKey) {
  const [x, y] = tileKey.split(",").map(Number);
  return { x, y };
}

function exposedWallKeys() {
  const walkable = currentWalkable();
  const activeKeys = activeTileKeys();
  const walls = new Set();
  for (const tileKey of walkable) {
    if (!activeKeys.has(tileKey)) continue;
    const position = positionFromKey(tileKey);
    if (!isKnownTile(position)) continue;

    for (const neighbor of adjacentCells(position)) {
      const neighborKey = positionKey(neighbor);
      if (!walkable.has(neighborKey)) walls.add(neighborKey);
    }
  }
  return walls;
}

function visibleFloorEdgeKeys() {
  const keys = new Set();
  const walkable = currentWalkable();
  for (const tileKey of visibleWalkable()) {
    if (!walkable.has(tileKey)) continue;
    keys.add(tileKey);
  }
  return keys;
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

function activeRoomIds() {
  const rooms = state.dungeon?.rooms ?? [];
  if (showDungeonLayout) return new Set(rooms.map((room) => room.id));
  if (state.mode === "home") return new Set(["home-room"]);

  const ids = new Set();
  const heroPositions = partyHeroes().map((hero) => hero.position);
  const addRoomAt = (position) => {
    const room = roomForPosition(position);
    if (room) ids.add(room.id);
  };

  partyHeroes().forEach((hero) => addRoomAt(hero.position));
  const active = activeFighter();
  if (active?.position) addRoomAt(active.position);
  combatMonsters().forEach((monster) => addRoomAt(monster.position));

  const opened = currentOpenedKeys();
  const discovered = currentDiscoveredRoomIds();
  for (const room of rooms) {
    if (ids.has(room.id) || !discovered.has(room.id)) continue;
    const hasNearbyOpenedDoor = room.doors.some((door) => {
      const doorKey = positionKey(door);
      if (!opened.has(doorKey)) return false;
      const corridor = door.corridor ?? door;
      return heroPositions.some((heroPosition) => distance(heroPosition, corridor) <= activeCorridorRadius);
    });
    if (hasNearbyOpenedDoor) ids.add(room.id);
  }

  return ids;
}

function activeTileKeys() {
  const keys = new Set();
  const rooms = state.dungeon?.rooms ?? [];
  if (showDungeonLayout) {
    (state.dungeon?.walkable ?? []).forEach((cell) => keys.add(positionKey(cell)));
    (state.dungeon?.doors ?? []).forEach((door) => keys.add(positionKey(door)));
    return keys;
  }

  const activeRooms = activeRoomIds();
  for (const room of rooms) {
    if (!activeRooms.has(room.id)) continue;
    room.cells.forEach((cell) => keys.add(positionKey(cell)));
    room.doors.forEach((door) => keys.add(positionKey(door)));
  }

  const heroPositions = partyHeroes().map((hero) => hero.position);
  const opened = currentOpenedKeys();
  for (const tileKey of opened) {
    const position = positionFromKey(tileKey);
    if (heroPositions.some((heroPosition) => distance(heroPosition, position) <= activeCorridorRadius)) {
      keys.add(tileKey);
      adjacentCells(position).forEach((cell) => {
        const key = positionKey(cell);
        if (opened.has(key)) keys.add(key);
      });
    }
  }

  for (const door of state.dungeon?.doors ?? []) {
    const doorKey = positionKey(door);
    const corridorKey = door.corridor ? positionKey(door.corridor) : "";
    if (activeRooms.has(door.roomId) || keys.has(corridorKey)) keys.add(doorKey);
  }

  return keys;
}

function rememberedTileKeys() {
  const keys = activeTileKeys();
  if (showDungeonLayout) return keys;

  const discovered = currentDiscoveredRoomIds();
  for (const room of state.dungeon?.rooms ?? []) {
    if (!discovered.has(room.id)) continue;
    room.cells.forEach((cell) => keys.add(positionKey(cell)));
    room.doors.forEach((door) => keys.add(positionKey(door)));
  }

  const opened = currentOpenedKeys();
  opened.forEach((tileKey) => keys.add(tileKey));
  for (const door of state.dungeon?.doors ?? []) {
    if (adjacentCells(door).some((cell) => opened.has(positionKey(cell)))) {
      keys.add(positionKey(door));
    }
  }

  return keys;
}

function isTileActive(position) {
  return activeTileKeys().has(positionKey(position));
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

function surroundingCells(position) {
  const cells = [];
  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      cells.push({ x: position.x + dx, y: position.y + dy });
    }
  }
  return cells;
}

function visibleWalkable() {
  const known = new Set();
  const openedKeys = currentOpenedKeys();
  const discovered = currentDiscoveredRoomIds();
  for (const room of state.dungeon?.rooms ?? []) {
    if (discovered.has(room.id)) {
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

function canSeeThroughDungeonEdge(from, to) {
  const door = doorPassageBetween(from, to);
  if (door) return currentOpenedKeys().has(positionKey(door));

  const fromRoom = roomForPosition(from);
  const toRoom = roomForPosition(to);
  if (fromRoom && toRoom) return fromRoom.id === toRoom.id;
  return corridorPassageIdsForEdge(from, to).length > 0;
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

function hasVisibleWallEdge(position, delta, visibleWallKeys = exposedWallKeys(), visibleFloorKeys = visibleFloorEdgeKeys()) {
  const neighbor = { x: position.x + delta.x, y: position.y + delta.y };
  if (!window.DungeonGrid.isInsideGrid(neighbor, currentGridSize())) return false;
  const walkable = currentWalkable();
  const positionWalkable = walkable.has(positionKey(position));
  const neighborWalkable = walkable.has(positionKey(neighbor));
  if (!positionWalkable || !visibleFloorKeys.has(positionKey(position))) return false;
  if (!neighborWalkable) return isKnownTile(neighbor) || visibleWallKeys.has(positionKey(neighbor));
  if (doorPassageBetween(position, neighbor)) return false;
  if (!visibleFloorKeys.has(positionKey(neighbor)) && canTraverseMovementEdge(activeHero(), position, neighbor, [])) return false;
  return !canTraverseMovementEdge(activeHero(), position, neighbor, []);
}

function wallEdgeSegments() {
  const segments = [];
  const walkable = currentWalkable();
  const activeKeys = activeTileKeys();
  const visibleWallKeys = exposedWallKeys();
  const visibleFloorKeys = visibleFloorEdgeKeys();
  const north = { x: 0, y: -1 };
  const west = { x: -1, y: 0 };
  for (const tileKey of walkable) {
    if (!activeKeys.has(tileKey)) continue;
    const position = positionFromKey(tileKey);
    if (!visibleFloorKeys.has(tileKey)) continue;
    if (hasVisibleWallEdge(position, { x: 1, y: 0 }, visibleWallKeys, visibleFloorKeys)) segments.push({ position, direction: "east" });
    if (hasVisibleWallEdge(position, { x: 0, y: 1 }, visibleWallKeys, visibleFloorKeys)) segments.push({ position, direction: "south" });
    if (!walkable.has(positionKey({ x: position.x + north.x, y: position.y + north.y })) && hasVisibleWallEdge(position, north, visibleWallKeys, visibleFloorKeys)) {
      segments.push({ position, direction: "north" });
    }
    if (!walkable.has(positionKey({ x: position.x + west.x, y: position.y + west.y })) && hasVisibleWallEdge(position, west, visibleWallKeys, visibleFloorKeys)) {
      segments.push({ position, direction: "west" });
    }
  }
  return segments;
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
  const activeTiles = activeTileKeys();
  const activeInitiativeIds = new Set((state.initiative ?? []).map((entry) => entry.fighterId));
  return aliveMonsters().filter((monster) => (activeInitiativeIds.has(monster.id) || activeTiles.has(positionKey(monster.position))) && isKnownTile(monster.position));
}

function monsterHasLineOfSightToHero(monster) {
  return partyHeroes().some((hero) => hasClearLineOfSight(monster.position, hero.position));
}

function monsterThreatensHeroes(monster) {
  if (fledMonsterIds.has(monster.id)) {
    return monsterHasLineOfSightToHero(monster);
  }

  const monsterRoom = roomForPosition(monster.position);
  if (!monsterRoom) return true;
  return partyHeroes().some((hero) => {
    const heroRoom = roomForPosition(hero.position);
    return !heroRoom || heroRoom.id === monsterRoom.id;
  });
}

function threateningMonsters() {
  return visibleMonsters().filter(monsterThreatensHeroes);
}

function combatMonsters() {
  const heroIds = new Set([...(state.party?.heroIds ?? ["hero"]), ...(state.party?.rosterIds ?? [])]);
  return state.initiative
    .map((entry) => state.fighters[entry.fighterId])
    .filter((fighter) => fighter && !heroIds.has(fighter.id) && fighter.alive);
}

function hasMeleeAccess(attacker, defender) {
  const dx = Math.abs(attacker.position.x - defender.position.x);
  const dy = Math.abs(attacker.position.y - defender.position.y);
  if (Math.max(dx, dy) !== 1) return false;
  if (dx + dy === 1) return canTraverseMovementEdge(attacker, attacker.position, defender.position, []);

  const cornerA = { x: defender.position.x, y: attacker.position.y };
  const cornerB = { x: attacker.position.x, y: defender.position.y };
  const walkable = dungeonFloorKeys();
  const canReachViaA =
    walkable.has(positionKey(cornerA)) &&
    canTraverseMovementEdge(attacker, attacker.position, cornerA, []) &&
    canTraverseMovementEdge(attacker, cornerA, defender.position, []);
  const canReachViaB =
    walkable.has(positionKey(cornerB)) &&
    canTraverseMovementEdge(attacker, attacker.position, cornerB, []) &&
    canTraverseMovementEdge(attacker, cornerB, defender.position, []);
  return canReachViaA || canReachViaB;
}

function adjacentMonster() {
  const hero = activeHero();
  return visibleMonsters().find((monster) => hasMeleeAccess(hero, monster)) ?? null;
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

function attackGridDistance(a, b) {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
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
    const dx = Math.abs(current.x - previous.x);
    const dy = Math.abs(current.y - previous.y);

    if (dx + dy === 1) {
      if (!canSeeThroughDungeonEdge(previous, current)) return false;
      continue;
    }

    if (dx === 1 && dy === 1) {
      const cornerA = { x: current.x, y: previous.y };
      const cornerB = { x: previous.x, y: current.y };
      const pathA =
        shootable.has(positionKey(cornerA)) &&
        canSeeThroughDungeonEdge(previous, cornerA) &&
        canSeeThroughDungeonEdge(cornerA, current);
      const pathB =
        shootable.has(positionKey(cornerB)) &&
        canSeeThroughDungeonEdge(previous, cornerB) &&
        canSeeThroughDungeonEdge(cornerB, current);
      if (!pathA && !pathB) return false;
    }
  }

  return true;
}

function isWithinAttackDistance(attacker, defender) {
  const range = attackRangeSquares(attacker);
  if (range <= 1) return hasMeleeAccess(attacker, defender);
  return attackGridDistance(attacker.position, defender.position) <= range;
}

function isInAttackRange(attacker, defender) {
  if (!isWithinAttackDistance(attacker, defender)) return false;
  if (attackRangeSquares(attacker) > 1) return hasClearLineOfSight(attacker.position, defender.position);
  return !attackUsesRangedProfile(attacker) || hasClearLineOfSight(attacker.position, defender.position);
}

function isInAttackRangeWithProfile(attacker, defender, profile) {
  const range = profileRangeSquares(profile);
  const withinDistance = range <= 1 ? hasMeleeAccess(attacker, defender) : attackGridDistance(attacker.position, defender.position) <= range;
  if (!withinDistance) return false;
  if (range > 1) return hasClearLineOfSight(attacker.position, defender.position);
  return profile.range?.kind !== "ranged" || hasClearLineOfSight(attacker.position, defender.position);
}

function attackTargets() {
  const hero = activeFighter();
  if (state.mode !== "combat" || !hero || !isPartyHeroId(hero.id) || combatMonsters().length === 0) return [];
  return visibleMonsters().filter((monster) => isInAttackRange(hero, monster));
}

function isValidAttackTargetId(targetId) {
  return attackTargets().some((monster) => monster.id === targetId);
}

function selectedAttackTarget() {
  if (!isValidAttackTargetId(selectedAttackTargetId)) selectedAttackTargetId = null;
  const targets = attackTargets();
  if (!selectedAttackTargetId && targets.length > 0) selectedAttackTargetId = targets[0].id;
  return targets.find((monster) => monster.id === selectedAttackTargetId) ?? null;
}

function attackTarget() {
  return selectedAttackTarget();
}

function selectAttackTarget(targetId) {
  if (!isValidAttackTargetId(targetId)) return false;
  selectedAttackTargetId = targetId;
  render();
  return true;
}

function selectedHeroCanTargetMonster(monster) {
  const hero = activeFighter();
  return Boolean(monster?.alive && hero && isPartyHeroId(hero.id) && isInAttackRange(hero, monster));
}

function cycleAttackTarget() {
  const targets = attackTargets();
  if (targets.length <= 1) return false;
  const currentIndex = targets.findIndex((monster) => monster.id === selectedAttackTargetId);
  selectedAttackTargetId = targets[(currentIndex + 1) % targets.length].id;
  render();
  return true;
}

function canOffHandAttack(fighter) {
  if (state.mode !== "combat" || !fighter?.hasBonusAction || !heroCanAct(fighter) || !isPartyHeroId(fighter.id)) return false;
  const main = weaponFromSlot(fighter, "mainHand");
  const offHand = weaponFromSlot(fighter, "offHand");
  if (!main?.damage || !offHand?.damage) return false;
  if (!main.properties?.includes("light") || !offHand.properties?.includes("light")) return false;
  const target = attackTarget();
  if (!target) return false;
  const profile = damageProfile(fighter, { weapon: offHand, includeDamageModifier: false });
  return isInAttackRangeWithProfile(fighter, target, profile);
}

function nearestVisibleMonster() {
  const hero = activeHero();
  return visibleMonsters().sort((a, b) => distance(a.position, hero.position) - distance(b.position, hero.position))[0] ?? null;
}

function attackBonusForAbility(fighter, ability) {
  const baseBonus = fighter.attackBonus ?? 0;
  const baseAbility = fighter.baseAttackAbilityMod ?? abilityMod(fighter, "str");
  return baseBonus - baseAbility + abilityMod(fighter, ability) + (activeWeapon(fighter)?.magic?.attackBonus ?? 0) + magicEffects(fighter).attackBonus;
}

function hostileTo(fighter, candidate) {
  if (!candidate.alive || candidate.id === fighter.id) return false;
  const heroIds = new Set(state.party?.heroIds ?? ["hero"]);
  const fighterIsHero = heroIds.has(fighter.id);
  const candidateIsHero = heroIds.has(candidate.id);
  return fighterIsHero ? !candidateIsHero : candidateIsHero;
}

function canOpportunityAttack(attacker, defender, from, to) {
  if (state.mode !== "combat" || !attacker.alive || !defender.alive || !hostileTo(attacker, defender)) return false;
  if (defender.disengaged) return false;
  const profile = opportunityAttackProfile(attacker);
  const range = profileRangeSquares(profile);
  const hadThreat = range <= 1 ? hasMeleeAccess(attacker, { ...defender, position: from }) : attackGridDistance(attacker.position, from) <= range && hasClearLineOfSight(attacker.position, from);
  const keepsThreat = range <= 1 ? hasMeleeAccess(attacker, { ...defender, position: to }) : attackGridDistance(attacker.position, to) <= range && hasClearLineOfSight(attacker.position, to);
  return hadThreat && !keepsThreat;
}

async function finishEncounterAfterLastMonsterFalls() {
  if (combatMonsters().length > 0) return false;

  const dyingHeroes = unstableDyingPartyHeroes();
  if (dyingHeroes.length > 0) {
    addLog("The enemies are down, but death saves continue.", "important");
    while (unstableDyingPartyHeroes().length > 0) {
      const hero = unstableDyingPartyHeroes()[0];
      await rollDeathSave(hero);
      render();
      if (partyHeroes().length === 0) break;
    }
  }

  if (partyDefeatedOrDying()) {
    await handleHeroDeath();
    return true;
  }

  if (combatMonsters().length === 0 && state.combatStarted && !partyDefeatedOrDying()) {
    endCurrentEncounter();
    addLog("The room falls quiet. Exploration resumes.", "important");
  }
  return true;
}

async function opportunityAttack(attacker, defender) {
  const profile = opportunityAttackProfile(attacker);
  const attackRollResult = rollD20ForFighter(attacker, { disadvantage: defender.dodging });
  const attackRolls = attackRollResult.rolls;
  const attackRoll = attackRollResult.roll;
  const currentAttackBonus = profile.weapon ? attackBonusForWeapon(attacker, profile.weapon) : attackBonusForAbility(attacker, profile.attackAbility ?? "str");
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
    recordD20OutcomeForFighter(attacker, false);
    return;
  }
  recordD20OutcomeForFighter(attacker, true);

  const damageRoll = profile.flat
    ? { total: profile.flat, rolls: [profile.flat] }
    : rollDice(profile.count * (isCritical ? 2 : 1), profile.sides);
  const packets = [
    {
      raw: Math.max(1, damageRoll.total + (profile.bonus ?? 0)),
      type: profile.type,
      label: `${damageRoll.rolls.join(" + ")} ${abilityLabel(profile.bonus ?? 0)} ${profile.type ?? "damage"}`,
    },
  ];
  for (const extra of profile.extraDamage ?? []) {
    const extraRoll = rollDice((extra.count ?? 1) * (isCritical ? 2 : 1), extra.sides ?? 4);
    packets.push({
      raw: Math.max(1, extraRoll.total + (extra.bonus ?? 0)),
      type: extra.type,
      label: `${extraRoll.rolls.join(" + ")}${extra.bonus ? ` ${abilityLabel(extra.bonus)}` : ""} ${extra.type}`,
    });
  }
  if (isPartyHeroId(defender.id) && adminEnabled() && adminGodMode) {
    addLog(`God mode prevents ${attacker.name}'s opportunity damage to ${defender.name}.`, "important");
    return;
  }
  const resolvedPackets = packets.map((packet) => ({ ...packet, ...calculateDamageModifiers(defender, packet.raw, packet.type) }));
  const totalDamage = resolvedPackets.reduce((sum, packet) => sum + packet.damage, 0);
  applyDamageToFighter(defender, totalDamage);
  defender.lastDamagedById = attacker.id;
  const adjustmentNote = resolvedPackets
    .filter((packet) => packet.reason)
    .map((packet) => `${defender.name} is ${packet.reason} to ${packet.type} damage.`)
    .join(" ");
  addLog(
    `${attacker.name} hits for ${totalDamage} damage (${resolvedPackets.map((packet) => packet.label).join("; ")}).${isCritical ? " Critical hit." : ""}${adjustmentNote ? ` ${adjustmentNote}` : ""}`,
    "damage",
  );

  if (!defender.alive) {
    addLog(`${defender.name} drops to 0 HP.`, "important");
    if (isPartyHeroId(defender.id)) {
      handleHeroDeath();
    } else {
      if (isPartyHeroId(attacker.id)) playSoundEffect("enemyDefeated");
      awardMonsterXp(defender);
      dropLootForMonster(defender);
      await finishEncounterAfterLastMonsterFalls();
    }
  }
}

function monstersInRoom(roomId) {
  return aliveMonsters().filter((monster) => monster.roomId === roomId);
}

function isExitPosition(position) {
  return state.exit?.position && positionKey(state.exit.position) === positionKey(position);
}

function canHeroUseHomeExit(hero = activeHero()) {
  return state.mode === "home" && hero?.alive && isPartyHeroId(hero.id);
}

function checkDungeonCompletion(hero = activeHero()) {
  if (canHeroUseHomeExit(hero) && isExitPosition(hero.position)) {
    showHomeMenu();
    return true;
  }
  if (state.completed || !hero || !isExitPosition(hero.position)) return false;
  if (monstersInRoom(state.exit.roomId).length > 0) return false;

  const tokenAward = categoryForHeroLevel(hero.level ?? 1);
  for (const partyHero of partyHeroes()) {
    partyHero.inventory.heroTokens = (partyHero.inventory.heroTokens ?? 0) + tokenAward;
  }
  playSoundEffect("exitReached");
  state = createHomeState(rosterHeroes(), state.chest ?? [], state.chestMoney ?? {}, state.party);
  state.combatStarted = false;
  roomIsBuilt = false;
  addLog(`${hero.name} reaches the exit. Dungeon complete. The party gained ${tokenAward} Hero Token${tokenAward === 1 ? "" : "s"} each.`, "important");
  render();
  centerViewOnHero();
  return true;
}

function createLootForMonster(monster) {
  const category = Math.max(currentLootCategory(), monsterCategory(monster));
  const boss = monster.id?.startsWith("boss-") || monster.tags?.includes("boss");
  const healingPotion = rollDie(100) <= (boss ? 30 : 5) ? randomHealingPotionDrop() : null;
  const equipmentDrop = rollDie(100) <= (boss ? 18 : 2) ? randomEquipmentDrop() : null;
  const treasureDrop = rollDie(100) <= (boss ? 75 : 2) ? randomTreasureDrop(category) : null;
  const magicDrop = rollDie(100) <= (boss ? Math.min(55, 20 + category * 8) : Math.min(2, Math.max(1, Math.floor(category / 2)))) ? randomMagicLootDrop(category) : null;
  const items = [healingPotion, equipmentDrop, treasureDrop, magicDrop, ...(monster.pickedUpItems ?? []), ...definedLootForMonster(monster)].filter(Boolean);
  return {
    id: `loot-${monster.id}-${Date.now()}`,
    position: { ...monster.position },
    money: boss ? normalizeMoney({ gp: rollDie(category * 4), sp: rollDie(10), cp: rollDie(10) }) : { cp: rollDie(11) - 1, sp: 0, gp: 0 },
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

function itemSellValueCp(item) {
  if (item?.starterEquipment) return 0;
  if (item?.sell?.valueCp !== undefined) return Math.max(0, Math.floor(item.sell.valueCp));
  const sellRate = item?.sell?.rate ?? (item?.store?.sellable === true ? 0.5 : 0.5);
  return Math.floor(itemValueCp(item) * sellRate);
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

function currentLootCategory() {
  return Math.max(1, categoryForHeroLevel(averagePartyLevel(activeHero())));
}

function maxLootPriceGpForCategory(category = currentLootCategory()) {
  const caps = {
    1: 2500,
    2: 9000,
    3: 35000,
    4: 90000,
    5: 200000,
  };
  return caps[Math.min(5, Math.max(1, category))] ?? 2500;
}

function lootItemAllowedForCategory(item, category = currentLootCategory()) {
  const priceGp = item.loot?.priceGp ?? item.treasure?.valueGp ?? itemValueGp(item);
  return priceGp <= maxLootPriceGpForCategory(category);
}

function weightedLootPick(items, category = currentLootCategory()) {
  const entries = items
    .filter((item) => lootItemAllowedForCategory(item, category))
    .map((item) => ({
      item,
      weight: item.loot?.dropWeight ?? item.treasure?.dropWeight ?? Math.max(1, Math.round(400 / Math.sqrt(Math.max(1, itemValueGp(item))))),
    }));
  return weightedPick(entries);
}

function randomMagicLootDrop(category = currentLootCategory()) {
  const item = weightedLootPick(
    window.DungeonContent.list("items").filter((candidate) => candidate.tags?.includes("loot:magic") || candidate.tags?.includes("magic-item")),
    category,
  );
  return item ? createItemInstance(item.id, "magic-loot") : null;
}

function randomTreasureDrop(category = currentLootCategory()) {
  const item = weightedLootPick(
    window.DungeonContent.list("items").filter((candidate) => candidate.type === "treasure" || candidate.tags?.includes("treasure")),
    category,
  );
  return item ? createItemInstance(item.id, "treasure") : null;
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
      .filter((candidate) => candidate.use?.kind !== "healing" && candidate.store?.buyable !== false && !candidate.tags?.includes("loot:magic") && candidate.type !== "treasure")
      .map((candidate) => ({ item: candidate, weight: 1 / Math.max(1, Math.sqrt(itemValueGp(candidate))) })),
  );
  return item ? createItemInstance(item.id, "loot") : null;
}

function dropLootForMonster(monster) {
  const loot = createLootForMonster(monster);
  addLootPile(loot);
}

function addLootPile(loot) {
  if (!loot) return null;
  const existing = (state.lootPiles ?? []).find((pile) => positionKey(pile.position) === positionKey(loot.position));
  if (!existing) {
    state.lootPiles = [...(state.lootPiles ?? []), loot];
    return loot;
  }
  existing.money = cpToMoney(moneyToCp(existing.money ?? {}) + moneyToCp(loot.money ?? {}));
  existing.heroTokens = (existing.heroTokens ?? 0) + (loot.heroTokens ?? 0);
  existing.items = [...(existing.items ?? []), ...(loot.items ?? [])];
  existing.thrownByHero = Boolean(existing.thrownByHero || loot.thrownByHero);
  return existing;
}

function thrownWeaponLandingPosition(targetPosition) {
  const walkable = currentWalkable();
  const blocked = blockingObjectKeys();
  const candidates = [...adjacentCells(targetPosition), targetPosition];
  return (
    candidates.find(
      (position) =>
        walkable.has(positionKey(position)) &&
        !blocked.has(positionKey(position)) &&
        !window.DungeonGrid.isOccupied(position, state.fighters),
    ) ?? targetPosition
  );
}

function dropThrownWeapon(attacker, weapon, targetPosition) {
  if (!isPartyHeroId(attacker?.id)) return;
  if (!weapon || !attacker?.inventory?.items?.some((item) => item.id === weapon.id)) return;
  for (const slot of equipmentSlots) {
    if (attacker.equipment[slot.id] === weapon.id) attacker.equipment[slot.id] = null;
  }
  attacker.inventory.items = attacker.inventory.items.filter((item) => item.id !== weapon.id);
  addLootPile({
    id: `loot-thrown-${weapon.id}-${Date.now()}`,
    position: thrownWeaponLandingPosition(targetPosition),
    money: normalizeMoney(),
    items: [weapon],
    thrownByHero: isPartyHeroId(attacker.id),
  });
  refreshDerivedStats(attacker);
  addLog(`${attacker.name} throws ${weapon.name}. It lands near the target.`, "important");
}

function createLootForHero(hero) {
  const inventory = hero.inventory ?? normalizeInventory();
  return {
    id: `loot-${hero.id}-${Date.now()}`,
    position: { ...hero.position },
    money: normalizeMoney(inventory.money),
    heroTokens: Math.max(0, Math.floor(inventory.heroTokens ?? 0)),
    items: [...(inventory.items ?? [])],
  };
}

function dropLootForHero(hero) {
  if (!hero || hero.deathLootDropped) return;
  const loot = createLootForHero(hero);
  const hasCoins = moneyToCp(loot.money) > 0;
  const hasHeroTokens = (loot.heroTokens ?? 0) > 0;
  const hasItems = (loot.items ?? []).length > 0;
  if (hasCoins || hasHeroTokens || hasItems) {
    addLootPile(loot);
    const lootText = [
      hasCoins ? moneyText(loot.money) : "",
      hasHeroTokens ? `${loot.heroTokens} Hero Token${loot.heroTokens === 1 ? "" : "s"}` : "",
      hasItems ? `${loot.items.length} item${loot.items.length === 1 ? "" : "s"}` : "",
    ]
      .filter(Boolean)
      .join(" and ");
    addLog(`${hero.name}'s belongings drop as a loot pile (${lootText}).`, "important");
  }
  hero.deathLootDropped = true;
  hero.inventory = {
    ...(hero.inventory ?? normalizeInventory()),
    money: normalizeMoney(),
    heroTokens: 0,
    items: [],
  };
  hero.equipment = normalizeEquipment();
  refreshDerivedStats(hero);
}

function awardMonsterXp(monster) {
  const xp = monster.xp ?? 50;
  const heroes = partyHeroes();
  const share = Math.max(1, Math.ceil(xp / Math.max(1, heroes.length)));
  heroes.forEach((hero) => {
    hero.xp = (hero.xp ?? 0) + share;
  });
  addLog(`${heroes.map((hero) => hero.name).join(", ")} gain ${share} XP.`, "important");
}

function awardHeroXp(xp, reason = "") {
  const hero = activeHero();
  hero.xp = (hero.xp ?? 0) + xp;
  addLog(`${hero.name} gains ${xp} XP${reason ? ` for ${reason}` : ""}.`, "important");
}

function collectLootAtPosition(fighter, position) {
  const lootIndex = state.lootPiles.findIndex((pile) => positionKey(pile.position) === positionKey(position));
  if (lootIndex < 0) return false;
  if (!isPartyHeroId(fighter.id)) return maybeMonsterPickUpThrownWeapon(fighter, lootIndex);

  const [loot] = state.lootPiles.splice(lootIndex, 1);
  addMoney(fighter.inventory.money, moneyToCp(loot.money));
  fighter.inventory.heroTokens = (fighter.inventory.heroTokens ?? 0) + (loot.heroTokens ?? 0);
  for (const item of loot.items ?? []) {
    addItemToInventory(fighter, item, "loot-stack");
  }

  const coinText = moneyToCp(loot.money) ? moneyText(loot.money) : "";
  const tokenText = loot.heroTokens ? `${loot.heroTokens} Hero Token${loot.heroTokens === 1 ? "" : "s"}` : "";
  const itemText = (loot.items ?? []).map((item) => item.name).join(", ");
  const lootText = [coinText, tokenText, itemText].filter(Boolean).join(" and ") || "nothing";
  addLog(`${fighter.name} collects ${lootText}.`, "important");
  return true;
}

function maybeMonsterPickUpThrownWeapon(monster, lootIndex) {
  const pile = state.lootPiles[lootIndex];
  if (!pile?.thrownByHero || (pile.items ?? []).length === 0 || Math.random() >= monsterThrownWeaponPickupChance) return false;
  const [loot] = state.lootPiles.splice(lootIndex, 1);
  monster.pickedUpItems = [...(monster.pickedUpItems ?? []), ...(loot.items ?? [])];
  addLog(`${monster.name} snatches up ${loot.items[0].name}.`, "important");
  return true;
}

function triggerTrapAtPosition(fighter, position) {
  const trap = objectAt(position);
  if (!trap || !objectIsTrap(trap) || trap.armed === false || trap.disarmed || !fighter.alive) return false;

  const template = objectTemplate(trap.type);
  const damageRoll = rollDice(template.damage.count, template.damage.sides);
  const rawDamage = damageRoll.total;
  if (isPartyHeroId(fighter.id) && adminEnabled() && adminGodMode) {
    trap.armed = false;
    trap.spent = true;
    trap.lastResult = `${fighter.name} triggered it, but god mode prevented the damage.`;
    addLog(`${fighter.name} triggers a spike trap. God mode prevents the damage.`, "important");
    return true;
  }
  const modified = calculateDamageModifiers(fighter, rawDamage, template.damage.type);
  applyDamageToFighter(fighter, modified.damage);
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
  const heroes = partyHeroes();
  if (!heroes.length) return;
  const activeTiles = activeTileKeys();

  for (const trap of state.dungeonObjects ?? []) {
    if (!objectIsTrap(trap) || trap.detected || !objectCells(trap).some((cell) => activeTiles.has(positionKey(cell)) && isKnownTile(cell))) continue;

    trap.spotCheckedBy = trap.spotCheckedBy ?? [];
    for (const hero of heroes.filter((entry) => !trap.spotCheckedBy.includes(entry.id))) {
      trap.spotCheckedBy.push(hero.id);
      const roll = rollD20ForFighter(hero).roll;
      const bonus = abilityMod(hero, "wis");
      const total = roll + bonus;
      const dc = trap.spotDc ?? 12;
      trap.detected = total >= dc;
      recordD20OutcomeForFighter(hero, trap.detected);
      if (trap.detected) {
        addLog(`${hero.name} spots a hidden trap.`, "important");
        break;
      }
    }
  }

  for (const chest of state.dungeonObjects ?? []) {
    if (chest.type !== "chest" || !chest.trap || chest.trap.detected || !objectCells(chest).some((cell) => activeTiles.has(positionKey(cell)) && isKnownTile(cell))) continue;

    chest.trap.spotCheckedBy = chest.trap.spotCheckedBy ?? [];
    for (const hero of heroes.filter((entry) => !chest.trap.spotCheckedBy.includes(entry.id))) {
      chest.trap.spotCheckedBy.push(hero.id);
      const roll = rollD20ForFighter(hero).roll;
      const bonus = abilityMod(hero, "wis");
      const total = roll + bonus;
      const dc = chest.trap.spotDc ?? 12;
      chest.trap.detected = total >= dc;
      recordD20OutcomeForFighter(hero, chest.trap.detected);
      if (chest.trap.detected) {
        addLog(`${hero.name} spots a hidden trap on a chest.`, "important");
        break;
      }
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
  const relatedDoors = (state.dungeon?.doors ?? []).filter(
    (entry) => entry.roomId === door.roomId && positionKey(entry) === positionKey(door),
  );
  const doorsToOpen = relatedDoors.length ? relatedDoors : [door];

  const discovered = currentDiscoveredRoomIds();
  const openedDoorKeys = new Set(state.exploration.openedDoorKeys);
  const openedCorridorKeys = new Set(state.exploration.openedCorridorKeys);
  const revealedRooms = [];
  let openedAnyPassage = false;

  for (const entry of doorsToOpen) {
    const targetRoom = (state.dungeon?.rooms ?? []).find((room) => room.id === entry.to);
    const doorRoom = (state.dungeon?.rooms ?? []).find((room) => room.id === entry.roomId);
    const targetDoor = reciprocalDoor(entry);
    if (!targetRoom || !doorRoom || !targetDoor) continue;

    const openingFromDiscoveredRoom = discovered.has(entry.roomId);
    const roomToReveal = openingFromDiscoveredRoom ? null : doorRoom;

    openedDoorKeys.add(positionKey(entry));
    corridorPathBetweenDoors(entry, targetDoor).forEach((cell) => openedCorridorKeys.add(positionKey(cell)));
    openedAnyPassage = true;

    if (roomToReveal && !discovered.has(roomToReveal.id)) {
      discovered.add(roomToReveal.id);
      revealedRooms.push(roomToReveal);
    }
  }

  if (!openedAnyPassage) return false;

  state.exploration.discoveredRoomIds = Array.from(discovered);
  state.exploration.openedDoorKeys = Array.from(openedDoorKeys);
  state.exploration.openedCorridorKeys = Array.from(openedCorridorKeys);
  addLog(`${activeHero()?.name ?? "The party"} opens the door${revealedRooms.length === 1 ? ` to ${revealedRooms[0].name}` : ""}.`, "important");

  if (revealedRooms.some((room) => monstersInRoom(room.id).length > 0)) {
    addLog("Hostile movement answers from within. Roll initiative.", "important");
  }

  render();
  return true;
}

function doorCandidateForPosition(position, actor = activeHero()) {
  const directDoor = doorAt(position);
  if (directDoor) return directDoor;

  const hero = actor;
  if (!hero || position.x !== hero.position.x || position.y !== hero.position.y) return null;

  const corridorDoors = doorsAtCorridorMouth(position).filter((door) => !currentOpenedKeys().has(positionKey(door)));
  if (corridorDoors.length > 0) {
    const undiscovered = corridorDoors.find((door) => !currentDiscoveredRoomIds().has(door.roomId));
    return undiscovered ?? corridorDoors[0];
  }

  return adjacentCells(position).map(doorAt).filter(Boolean)[0] ?? null;
}

function doorPassageIsOpen(door) {
  const targetDoor = reciprocalDoor(door);
  if (!targetDoor) return currentOpenedKeys().has(positionKey(door));
  const openedKeys = currentOpenedKeys();
  return openedKeys.has(positionKey(door)) && corridorPathBetweenDoors(door, targetDoor).every((cell) => openedKeys.has(positionKey(cell)));
}

function sharedDoorPassagesAreOpen(door) {
  const relatedDoors = (state.dungeon?.doors ?? []).filter(
    (entry) => entry.roomId === door.roomId && positionKey(entry) === positionKey(door),
  );
  return (relatedDoors.length ? relatedDoors : [door]).every(doorPassageIsOpen);
}

function canOpenDoor(position, actor = activeHero()) {
  const hero = actor;
  const door = doorCandidateForPosition(position, actor);
  if (!hero || !door || !isKnownTile(position) || !isKnownTile(door)) return null;
  if (sharedDoorPassagesAreOpen(door)) return null;
  const heroRoom = roomForPosition(hero.position);
  if (heroRoom && currentDiscoveredRoomIds().has(heroRoom.id) && monstersInRoom(heroRoom.id).length > 0) {
    return null;
  }
  return distance(hero.position, door) <= 1 ? door : null;
}

function autoOpenAdjacentExplorationDoor(fighter) {
  if (!isPartyHeroId(fighter.id) || state.mode !== "exploration") return false;
  const door = doorAt(fighter.position) || doorsAtCorridorMouth(fighter.position).length > 0 ? canOpenDoor(fighter.position, fighter) : null;
  return door ? openDoor(door) : false;
}

function threatPresent() {
  return threateningMonsters().length > 0;
}

function endCurrentEncounter() {
  state.combatStarted = false;
  state.mode = "exploration";
  state.initiative = [];
  state.activeIndex = 0;
  partyHeroes().forEach(resetTurnResources);
  checkDungeonCompletion();
}

function combatBlockingOverlayOpen() {
  return [els.mainMenu, els.fighterInfo, els.inventoryMenu, els.useItemMenu, els.abilitiesMenu, els.homeMenu, els.storeMenu, els.gameDialog].some(
    (element) => element && !element.classList.contains("hidden"),
  );
}

function shouldPromptForInitiative() {
  return (
    gameHasStarted &&
    !state.completed &&
    !movementInProgress &&
    state.mode !== "combat" &&
    !state.combatStarted &&
    !initiativePromptOpen &&
    !activeDialogCancel &&
    !combatBlockingOverlayOpen() &&
    threatPresent()
  );
}

function scheduleInitiativePromptIfNeeded() {
  if (initiativePromptQueued || !shouldPromptForInitiative()) return;
  initiativePromptQueued = true;
  window.setTimeout(async () => {
    initiativePromptQueued = false;
    if (!shouldPromptForInitiative()) return;
    initiativePromptOpen = true;
    await rollInitiative();
    initiativePromptOpen = false;
  }, 0);
}

function activateFledMonstersWithLineOfSight() {
  if (state.mode !== "combat" || !state.combatStarted || fledMonsterIds.size === 0) return;
  const activeIds = new Set(state.initiative.map((entry) => entry.fighterId));
  const joining = visibleMonsters().filter(
    (monster) => fledMonsterIds.has(monster.id) && !activeIds.has(monster.id) && monsterHasLineOfSightToHero(monster),
  );
  for (const monster of joining) {
    fledMonsterIds.delete(monster.id);
    addMonsterToInitiative(monster);
    addLog(`${monster.name} spots the party and joins the fight.`, "important");
  }
}

function fleeCombatStatus() {
  if (!gameHasStarted || state.mode !== "combat" || !state.combatStarted) {
    return { ok: false, reason: "Fleeing is only possible during combat." };
  }
  const heroes = partyHeroes();
  const monsters = combatMonsters();
  if (heroes.length === 0 || monsters.length === 0) {
    return { ok: false, reason: "There is no active fight to flee." };
  }

  const heroRooms = new Set();
  for (const hero of heroes) {
    const room = roomForPosition(hero.position);
    if (!room) return { ok: false, reason: "All heroes must be inside a room, not in a hallway." };
    heroRooms.add(room.id);
  }

  for (const monster of monsters) {
    const room = roomForPosition(monster.position);
    if (!room) return { ok: false, reason: "A monster is already in the hallway." };
    if (heroRooms.has(room.id)) return { ok: false, reason: "A monster is in the same room as a hero." };
  }

  for (const monster of aliveMonsters()) {
    const room = roomForPosition(monster.position);
    if (room && heroRooms.has(room.id)) return { ok: false, reason: "A hero's room still has a monster in it." };
  }

  return { ok: true, reason: "" };
}

function canFleeCombat() {
  return fleeCombatStatus().ok;
}

async function fleeCombat() {
  const status = fleeCombatStatus();
  if (!status.ok) {
    addLog(status.reason, "important");
    render();
    return;
  }

  const confirmed = await showGameDialog({
    title: "Flee Combat",
    message: "End turn order and keep exploring? This is only allowed because every hero is safely away from the monsters.",
    confirmText: "Flee",
    cancelText: "Stay",
  });
  if (!confirmed) return;

  fledMonsterIds = new Set(combatMonsters().map((monster) => monster.id));
  endCurrentEncounter();
  addLog("The party breaks contact. Exploration resumes.", "important");
  render();
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

async function rollInitiative() {
  if (state.combatStarted) return;

  const monsters = threateningMonsters();
  if (monsters.length === 0) return;
  const heroEntries = partyHeroes().map((hero) => {
    const heroRoll = rollD20ForFighter(hero).roll;
    return {
      fighterId: hero.id,
      fighter: hero,
      side: "hero",
      roll: heroRoll,
      total: heroRoll + hero.initiativeBonus,
    };
  });

  const monsterEntries = monsters.map((monster) => {
    const monsterRoll = rollDie(20);
    return {
      fighterId: monster.id,
      fighter: monster,
      side: "monster",
      roll: monsterRoll,
      total: monsterRoll + monster.initiativeBonus,
    };
  });

  const rolled = await showInitiativeDialog([...heroEntries, ...monsterEntries]);
  if (!rolled) return;

  state.initiative = [
    ...heroEntries,
    ...monsterEntries,
  ]
    .map(({ fighter, side, ...entry }) => entry)
    .sort((a, b) => b.total - a.total || (isPartyHeroId(a.fighterId) ? -1 : 1));

  state.combatStarted = true;
  state.mode = "combat";
  monsterEntries.forEach((entry) => fledMonsterIds.delete(entry.fighterId));
  state.round = 1;
  state.activeIndex = 0;
  syncActiveHeroToTurn();
  resetTurnResources(activeFighter());

  addLog(
    `Initiative: ${[...heroEntries, ...monsterEntries]
      .map((entry) => `${state.fighters[entry.fighterId].name} rolls ${entry.roll} ${abilityLabel(state.fighters[entry.fighterId].initiativeBonus)} = ${entry.total}`)
      .join("; ")}.`,
    "important",
  );
  addTurnStartLog(activeFighter());

  render();
  maybeRunMonsterTurn();
}

async function makeAttack(attacker, defender, options = {}) {
  if (isPartyHeroId(attacker?.id) && attacker.hp <= 0) return;
  const usesBonusAction = options.resource === "bonusAction";
  if (!attacker.alive || !defender.alive || (usesBonusAction ? !attacker.hasBonusAction : !attacker.hasAction)) return;
  const weapon = options.weapon ?? (options.weaponSlot ? weaponFromSlot(attacker, options.weaponSlot) : activeWeapon(attacker));
  const thrownAsMelee = weapon?.properties?.includes("thrown") && hasMeleeAccess(attacker, defender);
  const attackDamage = damageProfile(attacker, { weapon, includeDamageModifier: options.includeDamageModifier });
  if (thrownAsMelee) attackDamage.range = { kind: "melee", feet: 5 };

  if (!isInAttackRangeWithProfile(attacker, defender, attackDamage)) {
    addLog(`${attacker.name} is too far away to attack ${defender.name}. Move closer first.`);
    render();
    return;
  }

  if (profileRangeSquares(attackDamage) > 1 && !hasClearLineOfSight(attacker.position, defender.position)) {
    addLog(`${attacker.name} does not have a clear line of sight to ${defender.name}.`);
    render();
    return;
  }

  if (!itemHasUsableAmmo(attacker, weapon)) {
    addLog(`${attacker.name} needs ammunition in the quiver to use ${weapon.name}.`);
    render();
    return;
  }

  if (usesBonusAction) attacker.hasBonusAction = false;
  else {
    attacker.attacksRemaining = Math.max(0, (attacker.attacksRemaining ?? attacksPerAttackAction(attacker)) - 1);
    attacker.hasAction = attacker.attacksRemaining > 0;
  }
  spendAmmunition(attacker, weapon);
  if (weapon?.properties?.includes("thrown") && !thrownAsMelee) {
    recordMonsterThrownWeaponUse(attacker, weapon);
    dropThrownWeapon(attacker, weapon, defender.position);
  }

  const rangedAttack = !thrownAsMelee && (weaponIsRanged(weapon) || ["ranged", "thrown"].includes(attackDamage.range?.kind));
  playSoundEffect(rangedAttack ? "rangedAttack" : "meleeAttack");
  const adjacentHostiles = hostileFightersAdjacentTo(attacker).length > 0;
  const rangedDisadvantage = rangedAttack && adjacentHostiles;
  const defenderDodge = defender.dodging;
  const attackRollResult = rollD20ForFighter(attacker, { disadvantage: rangedDisadvantage || defenderDodge });
  const attackRolls = attackRollResult.rolls;
  const attackRoll = attackRollResult.roll;
  const defenderAc = armorClass(defender);
  const currentAttackBonus = attackBonusForWeapon(attacker, weapon);
  const totalAttack = attackRoll + currentAttackBonus;
  const isCritical = attackRoll === 20;
  const isMiss = attackRoll === 1 || totalAttack < defenderAc;

  addLog(
    `${attacker.name} ${options.actionLabel ?? "attacks"}${rangedDisadvantage ? " with disadvantage" : ""}${defenderDodge ? " because the target is dodging" : ""}: d20 ${
      attackRolls.length > 1 ? `${attackRolls.join(" / ")} -> ${attackRoll}` : attackRoll
    } ${abilityLabel(currentAttackBonus)} = ${totalAttack} vs AC ${
      defenderAc
    }.`,
  );

  if (isMiss) {
    addLog(attackRoll === 1 ? "Natural 1. The attack misses badly." : `${defender.name} avoids the blow.`);
    recordD20OutcomeForFighter(attacker, false);
    render();
    return;
  }
  recordD20OutcomeForFighter(attacker, true);

  const damageRoll = attackDamage.flat
    ? { total: attackDamage.flat, rolls: [attackDamage.flat] }
    : rollDice(attackDamage.count * (isCritical ? 2 : 1), attackDamage.sides);
  const packets = [
    {
      raw: Math.max(1, damageRoll.total + attackDamage.bonus),
      type: attackDamage.type,
      label: `${damageRoll.rolls.join(" + ")} ${abilityLabel(attackDamage.bonus)}${attackDamage.type ? ` ${attackDamage.type}` : ""}`,
    },
  ];
  if (isCritical && !rangedAttack && attacker.racialTraits?.savageAttacks && attackDamage.sides) {
    const savageRoll = rollDice(1, attackDamage.sides);
    packets.push({
      raw: savageRoll.total,
      type: attackDamage.type,
      label: `Savage Attacks ${savageRoll.rolls.join(" + ")}${attackDamage.type ? ` ${attackDamage.type}` : ""}`,
    });
  }
  for (const extra of attackDamage.extraDamage ?? []) {
    const extraRoll = rollDice((extra.count ?? 1) * (isCritical ? 2 : 1), extra.sides ?? 4);
    packets.push({
      raw: Math.max(1, extraRoll.total + (extra.bonus ?? 0)),
      type: extra.type,
      label: `${extraRoll.rolls.join(" + ")}${extra.bonus ? ` ${abilityLabel(extra.bonus)}` : ""} ${extra.type}`,
    });
  }
  if (canApplySneakAttack(attacker, defender, weapon, rangedAttack)) {
    const diceCount = sneakAttackDice(attacker) * (isCritical ? 2 : 1);
    const sneakRoll = rollDice(diceCount, 6);
    packets.push({
      raw: sneakRoll.total,
      type: attackDamage.type,
      label: `Sneak Attack ${sneakRoll.rolls.join(" + ")} ${attackDamage.type}`,
    });
    attacker.sneakAttackUsedThisTurn = true;
  }
  const rider = consumeWeaponRider(attacker);
  if (rider?.damageBonus) {
    packets.push({
      raw: rider.damageBonus,
      type: rider.damageType ?? "radiant",
      label: `${rider.label ?? "Weapon rider"} ${rider.damageBonus} ${rider.damageType ?? "radiant"}`,
    });
    addLog(`${attacker.name}'s ${rider.label ?? "weapon rider"} is released on the hit.`, "important");
  }
  if (isPartyHeroId(defender.id) && adminEnabled() && adminGodMode) {
    addLog(`God mode prevents ${attacker.name}'s damage to ${defender.name}.`, "important");
    render();
    return;
  }
  const resolvedPackets = packets.map((packet) => ({ ...packet, ...calculateDamageModifiers(defender, packet.raw, packet.type) }));
  const totalDamage = resolvedPackets.reduce((sum, packet) => sum + packet.damage, 0);
  applyDamageToFighter(defender, totalDamage);
  defender.lastDamagedById = attacker.id;
  if (!isPartyHeroId(attacker.id)) {
    await applyMonsterOnHitSpecials(attacker, defender, totalDamage, isCritical);
  }

  const critText = isCritical ? " Critical hit." : "";
  const adjustmentNote = resolvedPackets
    .filter((packet) => packet.reason)
    .map((packet) => `${defender.name} is ${packet.reason} to ${packet.type} damage.`)
    .join(" ");
  addLog(
    `${attacker.name} hits for ${totalDamage} damage (${resolvedPackets.map((packet) => packet.label).join("; ")}).${critText}${adjustmentNote ? ` ${adjustmentNote}` : ""}`,
    "damage",
  );

  if (!defender.alive && maybeUseUndeadFortitude(defender, totalDamage)) {
    addLog(`${defender.name} refuses to fall and remains at 1 HP.`, "important");
  }

  if (!defender.alive) {
    addLog(`${defender.name} drops to 0 HP. ${isPartyHeroId(attacker.id) ? "Victory." : "Defeat."}`, "important");
    if (!isPartyHeroId(defender.id)) {
      if (isPartyHeroId(attacker.id)) playSoundEffect("enemyDefeated");
      awardMonsterXp(defender);
      dropLootForMonster(defender);
    } else {
      handleHeroDeath();
    }
    if (isPartyHeroId(attacker.id)) await finishEncounterAfterLastMonsterFalls();
  }

  render();
}

function monsterSpecialNames(monster) {
  return (monster?.specialAbility ?? []).map((name) => String(name));
}

function hasMonsterSpecial(monster, pattern) {
  return monsterSpecialNames(monster).some((name) => pattern.test(name));
}

function monsterSpecialDc(monster) {
  return monsterSpecialAbilityTuning.saveDcBase + monsterCategory(monster) * monsterSpecialAbilityTuning.saveDcPerCategory;
}

function shouldUseMonsterSpecial(kind = "active") {
  const chance =
    kind === "onHit"
      ? monsterSpecialAbilityTuning.onHitUseChance
      : kind === "defensive"
        ? monsterSpecialAbilityTuning.defensiveUseChance
        : monsterSpecialAbilityTuning.activeUseChance;
  return Math.random() < chance;
}

function savingThrow(target, ability, dc) {
  const roll = rollD20ForFighter(target).roll;
  const statusBonus = (target.statusEffects ?? []).reduce((sum, effect) => sum + (effect.saveBonus ?? 0), 0);
  const bonus = abilityMod(target, ability) + statusBonus;
  const total = roll + bonus;
  const success = total >= dc;
  recordD20OutcomeForFighter(target, success);
  return { roll, bonus, total, success };
}

function showSavingThrowMenu({ target, ability, dc, message }) {
  return new Promise((resolve) => {
    const abilityText = ability.toUpperCase();
    let resultSave = null;
    els.gameDialogTitle.textContent = "Saving Throw";
    els.gameDialogMessage.innerHTML = `
      <p>${escapeHtml(message)}</p>
      <p>${escapeHtml(target.name)} must roll a ${abilityText} save against DC ${dc}.</p>
    `;
    els.gameDialogField.classList.add("hidden");
    els.gameDialogActions.innerHTML = `
      <button type="button" data-save-roll>Roll ${abilityText} Save</button>
    `;

    const cleanup = () => {
      if (!resultSave) return;
      els.gameDialogActions.removeEventListener("click", handleClick);
      els.gameDialog.classList.add("hidden");
      activeDialogCancel = null;
      resolve(resultSave);
    };

    const handleClick = (event) => {
      if (event.target.closest("[data-save-close]")) {
        cleanup();
        return;
      }
      if (!event.target.closest("[data-save-roll]")) return;
      resultSave = savingThrow(target, ability, dc);
      els.gameDialogMessage.innerHTML = `
        <p>${escapeHtml(message)}</p>
        <p><b>Result:</b> ${resultSave.roll} ${escapeHtml(abilityLabel(resultSave.bonus))} = ${resultSave.total} vs DC ${dc}.</p>
        <p>${resultSave.success ? "Success." : "Failure."}</p>
      `;
      els.gameDialogActions.innerHTML = `<button type="button" data-save-close>Close</button>`;
      activeDialogCancel = cleanup;
      els.gameDialogActions.querySelector("[data-save-close]")?.focus();
    };

    els.gameDialogActions.addEventListener("click", handleClick);
    activeDialogCancel = () => {};
    els.gameDialog.classList.remove("hidden");
    els.gameDialogActions.querySelector("[data-save-roll]")?.focus();
  });
}

async function rollSavingThrow(target, ability, dc, message) {
  if (!isPartyHeroId(target?.id)) {
    const save = savingThrow(target, ability, dc);
    addLog(`${target.name} rolls ${ability.toUpperCase()} save: ${save.roll} ${abilityLabel(save.bonus)} = ${save.total} vs DC ${dc}${save.success ? " (success)" : " (failure)"}.`, save.success ? "" : "important");
    return save;
  }
  addLog(message, "important");
  const save = await showSavingThrowMenu({ target, ability, dc, message });
  addLog(`${target.name} rolls ${ability.toUpperCase()} save: ${save.roll} ${abilityLabel(save.bonus)} = ${save.total} vs DC ${dc}${save.success ? " (success)" : " (failure)"}.`, save.success ? "" : "important");
  return save;
}

function applyStatusEffect(target, effect) {
  target.statusEffects = (target.statusEffects ?? []).filter((entry) => entry.id !== effect.id);
  target.statusEffects.push(effect);
  refreshDerivedStats(target);
  if (effect.tempHp) {
    target.hp = Math.min(target.maxHp, target.hp + effect.tempHp);
  }
}

function specialDamageDice(monster, sides = 6) {
  const category = monsterCategory(monster);
  return { count: Math.max(1, Math.ceil(category / 2)), sides, bonus: Math.max(0, category - 1) };
}

function applySpecialDamage(source, target, damage, type, label) {
  if (isPartyHeroId(target.id) && adminEnabled() && adminGodMode) {
    addLog(`God mode prevents ${source.name}'s ${label} damage to ${target.name}.`, "important");
    return 0;
  }
  const modified = calculateDamageModifiers(target, damage, type);
  applyDamageToFighter(target, modified.damage);
  const note = modified.reason ? ` ${target.name} is ${modified.reason} to ${type} damage.` : "";
  addLog(`${source.name}'s ${label} deals ${modified.damage} ${type} damage to ${target.name}.${note}`, "damage");
  return modified.damage;
}

function spellcastingAbility(fighter) {
  return fighter?.spellcastingAbility ?? "wis";
}

function spellSaveDc(fighter) {
  return 8 + proficiencyBonus(fighter) + abilityMod(fighter, spellcastingAbility(fighter));
}

function spellAttackBonus(fighter) {
  return proficiencyBonus(fighter) + abilityMod(fighter, spellcastingAbility(fighter));
}

function spellBaseLevel(spell) {
  return Math.max(1, Math.min(9, spell?.level ?? 1));
}

function spellCastLevel(spell) {
  return Math.max(spellBaseLevel(spell), Math.min(9, spell?.castLevel ?? spellBaseLevel(spell)));
}

function spellPointCost(spell, castLevel = spellCastLevel(spell)) {
  return spell?.costsByLevel?.[castLevel] ?? spell?.cost ?? ({ 1: 2, 2: 3, 3: 5, 4: 6, 5: 7, 6: 9, 7: 10, 8: 11, 9: 13 }[castLevel] ?? 2);
}

function spellAvailableCastLevels(fighter, spell) {
  if (!spell) return [];
  const maxSpellLevel = maxSpellLevelForFighter(fighter);
  const levels = [];
  for (let level = spellBaseLevel(spell); level <= maxSpellLevel; level += 1) levels.push(level);
  return levels;
}

function spellWithCastLevel(spell, castLevel = spellBaseLevel(spell)) {
  return { ...spell, castLevel: Math.max(spellBaseLevel(spell), Math.min(9, Number(castLevel) || spellBaseLevel(spell))) };
}

function spellResourceLabel(spell) {
  if (spell?.resource === "bonusAction") return "Quick action";
  if (spell?.resource === "reaction") return "Reaction";
  if (spell?.resource === "weaponRider") return "Weapon rider";
  return "Action";
}

function concentrationId(caster) {
  return caster?.id ? `concentration-${caster.id}` : "";
}

function endConcentration(caster, reason = "") {
  if (!caster?.concentration) return;
  const id = caster.concentration.id;
  const spellName = caster.concentration.spellName;
  for (const fighter of Object.values(state.fighters ?? {})) {
    fighter.statusEffects = (fighter.statusEffects ?? []).filter((effect) => effect.concentrationId !== id);
    refreshDerivedStats(fighter);
  }
  caster.concentration = null;
  addLog(`${caster.name}'s concentration on ${spellName} ends${reason ? ` (${reason})` : ""}.`, "important");
}

function startConcentration(caster, spell) {
  if (!spell?.concentration) return;
  endConcentration(caster, "new concentration spell");
  caster.concentration = { id: concentrationId(caster), spellId: spell.id, spellName: spell.name };
  addLog(`${caster.name} concentrates on ${spell.name}.`, "important");
}

function canPaySpellCost(caster, spell) {
  ensureSpellPointState(caster);
  return (caster.spellPoints ?? 0) >= spellPointCost(spell);
}

function canCastSpell(caster, spell) {
  if (!heroCanAct(caster) || !spell || !canPaySpellCost(caster, spell)) return false;
  if (state.mode === "combat") {
    if (activeFighter()?.id !== caster.id) return false;
    if (["bonusAction", "reaction", "weaponRider"].includes(spell.resource)) return Boolean(caster.hasBonusAction);
    return Boolean(caster.hasAction);
  }
  return true;
}

function spendSpellResources(caster, spell) {
  if (spell.concentration) startConcentration(caster, spell);
  const cost = spellPointCost(spell);
  caster.spellPoints = Math.max(0, (caster.spellPoints ?? 0) - cost);
  addLog(`${caster.name} spends ${cost} SP on ${spell.name} (spell level ${spellCastLevel(spell)}).`, "important");
  if (state.mode === "combat") {
    if (["bonusAction", "reaction", "weaponRider"].includes(spell.resource)) caster.hasBonusAction = false;
    else caster.hasAction = false;
  }
}

function spellRangeSquares(spell) {
  return Math.max(1, Math.floor((spell.range?.feet ?? 5) / feetPerSquare));
}

function spellAreaSquares(spell) {
  const extraFeet = Math.max(0, spellCastLevel(spell) - spellBaseLevel(spell)) * (spell.upcast?.areaRadiusFeetPerLevel ?? 0);
  return Math.max(0, Math.floor(((spell.area?.radiusFeet ?? 0) + extraFeet) / feetPerSquare));
}

function spellCanTargetPoint(spell) {
  return spell?.target === "point" || (spell?.area && spell?.range?.kind === "ranged" && spell?.effect?.kind !== "healing");
}

function spellTargetingMode(spell) {
  if (spell.target === "direction" || ["breath", "cone"].includes(spell.area?.shape)) return "direction";
  if (spellCanTargetPoint(spell)) return "point";
  return "target";
}

function currentPendingSpellTargeting() {
  if (!pendingSpellTargeting) return null;
  const caster = state.fighters[pendingSpellTargeting.casterId];
  const spell = getContentDefinition("spells", pendingSpellTargeting.spellId);
  const castSpell = spell ? spellWithCastLevel(spell, pendingSpellTargeting.castLevel) : null;
  if (!caster || !castSpell || !canCastSpell(caster, castSpell)) {
    pendingSpellTargeting = null;
    return null;
  }
  return { ...pendingSpellTargeting, caster, spell: castSpell };
}

function clearPendingSpellTargeting() {
  if (!pendingSpellTargeting) return;
  pendingSpellTargeting = null;
  renderRoom();
}

function fighterAtPosition(position) {
  if (!position) return null;
  return Object.values(state.fighters).find(
    (fighter) => fighter.alive && !fighter.dead && fighter.position.x === position.x && fighter.position.y === position.y,
  ) ?? null;
}

function spellTargetsFor(caster, spell) {
  const range = spellRangeSquares(spell);
  if (spell.target === "self") {
    return caster?.alive ? [caster] : [];
  }
  if (spell.target === "ally") {
    return partyHeroes().filter((hero) => hero.alive && distance(caster.position, hero.position) <= range);
  }
  if (spell.target === "enemy") {
    return visibleMonsters().filter((monster) => monster.alive && distance(caster.position, monster.position) <= range && hasClearLineOfSight(caster.position, monster.position));
  }
  if (spell.target === "creature") {
    return Object.values(state.fighters).filter(
      (fighter) => fighter.alive && !fighter.dead && isKnownTile(fighter.position) && distance(caster.position, fighter.position) <= range && hasClearLineOfSight(caster.position, fighter.position),
    );
  }
  if (spell.target === "point") {
    return visibleMonsters().filter((monster) => monster.alive && distance(caster.position, monster.position) <= range && hasClearLineOfSight(caster.position, monster.position));
  }
  return [];
}

function isValidSpellTarget(caster, spell, target) {
  if (!caster || !spell || !target?.alive || target.dead) return false;
  return spellTargetsFor(caster, spell).some((entry) => entry.id === target.id);
}

function isValidSpellPointTarget(caster, spell, position) {
  if (!caster || !spell || !position) return false;
  const key = positionKey(position);
  if (!window.DungeonGrid.isInsideGrid(position, currentGridSize())) return false;
  if (!isKnownTile(position) || !currentWalkable().has(key)) return false;
  if (distance(caster.position, position) > spellRangeSquares(spell)) return false;
  if (!hasClearLineOfSight(caster.position, position)) return false;
  const casterRoom = roomForPosition(caster.position);
  const targetRoom = roomForPosition(position);
  return !casterRoom || targetRoom?.id === casterRoom.id;
}

function spellAreaCells(originPosition, spell) {
  if (!originPosition) return [];
  if (!spell.area) return [{ ...originPosition }];
  const radius = spellAreaSquares(spell);
  const cells = [];
  const walkable = currentWalkable();
  const grid = currentGridSize();
  for (let y = originPosition.y - radius; y <= originPosition.y + radius; y += 1) {
    for (let x = originPosition.x - radius; x <= originPosition.x + radius; x += 1) {
      const cell = { x, y };
      if (!window.DungeonGrid.isInsideGrid(cell, grid) || !walkable.has(positionKey(cell))) continue;
      if (spell.area.shape === "cube") {
        if (Math.abs(x - originPosition.x) <= radius && Math.abs(y - originPosition.y) <= radius) cells.push(cell);
      } else if (distance(cell, originPosition) <= radius) {
        cells.push(cell);
      }
    }
  }
  return cells;
}

function spellTargetsFromCells(cells) {
  const keys = new Set(cells.map(positionKey));
  return Object.values(state.fighters).filter((fighter) => fighter.alive && !fighter.dead && keys.has(positionKey(fighter.position)));
}

function areaTargetsForSpell(origin, spell, caster) {
  const originPosition = origin?.position ?? origin;
  const targets = spell.area ? spellTargetsFromCells(spellAreaCells(originPosition, spell)) : spellTargetsFromCells([originPosition]);
  return targets.filter((target) => spellAffectsFighter(caster, spell, target));
}

function spellAffectsFighter(caster, spell, target) {
  if (!caster || !spell || !target?.alive || target.dead) return false;
  if (spell.target === "ally" || spell.effect?.kind === "healing") return isPartyHeroId(target.id);
  if (spell.target === "self") return target.id === caster.id;
  if (["damage", "attackDamage", "status"].includes(spell.effect?.kind)) return hostileTo(caster, target);
  return true;
}

function directionFromCasterToPosition(caster, position) {
  if (!caster || !position) return null;
  const dx = position.x - caster.position.x;
  const dy = position.y - caster.position.y;
  if (dx === 0 && dy === 0) return null;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "east" : "west";
  return dy > 0 ? "south" : "north";
}

function spellDirectionCells(caster, direction, spell) {
  if (!caster || !direction) return [];
  const length = Math.max(1, Math.floor((spell.area?.lengthFeet ?? spell.range?.feet ?? 15) / feetPerSquare));
  const width = Math.max(1, Math.floor((spell.area?.widthFeet ?? 5) / feetPerSquare));
  const deltas = {
    north: { x: 0, y: -1 },
    east: { x: 1, y: 0 },
    south: { x: 0, y: 1 },
    west: { x: -1, y: 0 },
  };
  const delta = deltas[direction] ?? deltas.north;
  const cells = [];
  for (const tileKey of currentWalkable()) {
    const cell = positionFromKey(tileKey);
    const dx = cell.x - caster.position.x;
    const dy = cell.y - caster.position.y;
    const forward = delta.x ? dx * delta.x : dy * delta.y;
    const side = delta.x ? Math.abs(dy) : Math.abs(dx);
    if (forward <= 0 || forward > length) continue;
    if (spell.area?.shape === "cone") {
      if (side <= forward) cells.push(cell);
    } else if (side < width) {
      cells.push(cell);
    }
  }
  return cells;
}

function spellPreviewCells(targeting = currentPendingSpellTargeting()) {
  if (!targeting?.hoverPosition) return new Set();
  if (targeting.mode === "point") {
    if (!isValidSpellPointTarget(targeting.caster, targeting.spell, targeting.hoverPosition)) return new Set();
    return new Set(spellAreaCells(targeting.hoverPosition, targeting.spell).map(positionKey));
  }
  if (targeting.mode === "direction") {
    const direction = directionFromCasterToPosition(targeting.caster, targeting.hoverPosition);
    return new Set(spellDirectionCells(targeting.caster, direction, targeting.spell).map(positionKey));
  }
  const target = fighterAtPosition(targeting.hoverPosition);
  if (!isValidSpellTarget(targeting.caster, targeting.spell, target)) return new Set();
  return new Set((targeting.spell.area ? spellAreaCells(target.position, targeting.spell) : [target.position]).map(positionKey));
}

function hoverSpellTarget(position) {
  if (!currentPendingSpellTargeting()) return;
  pendingSpellTargeting.hoverPosition = position ? { ...position } : null;
  renderRoom();
}

function isSpellTokenTargetable(targeting, fighter) {
  if (!targeting || !fighter?.position) return false;
  if (targeting.mode === "point") return isValidSpellPointTarget(targeting.caster, targeting.spell, fighter.position);
  if (targeting.mode === "direction") return Boolean(directionFromCasterToPosition(targeting.caster, fighter.position));
  return isValidSpellTarget(targeting.caster, targeting.spell, fighter);
}

function startSpellTargeting(caster, spell) {
  const mode = spellTargetingMode(spell);
  pendingSpellTargeting = {
    casterId: caster.id,
    spellId: spell.id,
    castLevel: spellCastLevel(spell),
    mode,
    hoverPosition: mode === "target" ? spellTargetsFor(caster, spell)[0]?.position ?? null : caster.position,
  };
  const instructions = {
    point: "Choose a square for the spell area.",
    direction: "Choose a direction from the caster.",
    target: "Choose a creature to center or target the spell.",
  };
  addLog(`${caster.name} readies ${spell.name} at spell level ${spellCastLevel(spell)} for ${spellPointCost(spell)} SP. ${instructions[mode]}`, "important");
  hideAbilitiesMenu();
  render();
}

async function confirmPendingSpellTarget(position) {
  const targeting = currentPendingSpellTargeting();
  if (!targeting) return false;
  const { caster, spell, mode } = targeting;
  pendingSpellTargeting = null;
  if (mode === "point") {
    if (!isValidSpellPointTarget(caster, spell, position)) {
      pendingSpellTargeting = { casterId: caster.id, spellId: spell.id, castLevel: spellCastLevel(spell), mode, hoverPosition: position };
      addLog(`${spell.name} needs a visible square in range inside this room.`, "important");
      render();
      return true;
    }
    await castSpellAtPoint(caster, spell, position);
    return true;
  }
  if (mode === "direction") {
    const direction = directionFromCasterToPosition(caster, position);
    if (!direction) {
      pendingSpellTargeting = { casterId: caster.id, spellId: spell.id, castLevel: spellCastLevel(spell), mode, hoverPosition: position };
      render();
      return true;
    }
    await castSpellInDirection(caster, spell, direction);
    return true;
  }
  const target = fighterAtPosition(position);
  if (!isValidSpellTarget(caster, spell, target)) {
    pendingSpellTargeting = { casterId: caster.id, spellId: spell.id, castLevel: spellCastLevel(spell), mode, hoverPosition: position };
    addLog(`That is not a valid target for ${spell.name}.`, "important");
    render();
    return true;
  }
  await castSpellAtTarget(caster, spell, target);
  return true;
}

function breathTemplateTargets(caster, direction, spell) {
  return spellTargetsFromCells(spellDirectionCells(caster, direction, spell)).filter((fighter) => spellAffectsFighter(caster, spell, fighter));
}

function scaledSpellDice(spell) {
  const dice = { ...(spell.effect?.dice ?? { count: 1, sides: 6 }) };
  const extraLevels = Math.max(0, spellCastLevel(spell) - spellBaseLevel(spell));
  if (spell.upcast?.diceAtLevel?.[spellCastLevel(spell)]) {
    dice.count = spell.upcast.diceAtLevel[spellCastLevel(spell)];
  } else {
    dice.count = (dice.count ?? 1) + extraLevels * (spell.upcast?.dicePerLevel ?? 0);
  }
  dice.bonus = (dice.bonus ?? 0) + extraLevels * (spell.upcast?.bonusPerLevel ?? 0);
  return dice;
}

async function applySpellDamage(caster, target, spell) {
  const dice = scaledSpellDice(spell);
  const roll = rollDice(dice.count, dice.sides);
  let raw = Math.max(1, roll.total + (dice.bonus ?? 0));
  let save = null;
  if (spell.save) {
    save = await rollSavingThrow(target, spell.save.ability, spellSaveDc(caster), `${caster.name}'s ${spell.name} forces ${target.name} to make a ${spell.save.ability.toUpperCase()} save.`);
    if (save.success && spell.save.halfDamage) raw = Math.floor(raw / 2);
  }
  applySpecialDamage(caster, target, raw, spell.effect.type ?? "force", spell.name);
  if (spell.effect?.status && (!save || !save.success)) await applySpellStatus(caster, target, spell, { skipSave: true });
}

function applySpellHealing(caster, target, spell) {
  const dice = scaledSpellDice(spell);
  const roll = rollDice(dice.count, dice.sides);
  const bonus = spell.effect?.abilityBonus === "spellcasting" ? abilityMod(caster, spellcastingAbility(caster)) : spell.effect?.bonus ?? 0;
  const healed = applyHealingToHero(target, Math.max(0, roll.total + bonus));
  addLog(`${caster.name}'s ${spell.name} heals ${target.name} for ${healed} HP (${roll.rolls.join(" + ")} ${abilityLabel(bonus)}).`, "heal");
}

async function applySpellAttack(caster, target, spell) {
  const rollResult = rollD20ForFighter(caster);
  const roll = rollResult.roll;
  const bonus = spellAttackBonus(caster);
  const total = roll + bonus;
  const targetAc = armorClass(target);
  addLog(`${caster.name} casts ${spell.name}: spell attack ${roll} ${abilityLabel(bonus)} = ${total} vs AC ${targetAc}.`, "important");
  recordD20OutcomeForFighter(caster, roll !== 1 && total >= targetAc);
  if (roll === 1 || total < targetAc) {
    addLog(`${spell.name} misses ${target.name}.`);
    return;
  }
  const dice = scaledSpellDice(spell);
  const damageRoll = rollDice(dice.count * (roll === 20 ? 2 : 1), dice.sides);
  const extra = spell.effect?.abilityBonus === "spellcasting" ? abilityMod(caster, spellcastingAbility(caster)) : 0;
  applySpecialDamage(caster, target, Math.max(1, damageRoll.total + (dice.bonus ?? 0) + extra), spell.effect?.type ?? "force", spell.name);
  if (spell.effect?.status) await applySpellStatus(caster, target, spell);
}

async function applySpellStatus(caster, target, spell, options = {}) {
  if (spell.save && !options.skipSave) {
    const save = await rollSavingThrow(target, spell.save.ability, spellSaveDc(caster), `${caster.name}'s ${spell.name} forces ${target.name} to make a ${spell.save.ability.toUpperCase()} save.`);
    if (save.success && spell.save.negatesStatus) {
      addLog(`${target.name} resists ${spell.name}.`);
      return;
    }
  }
  const effect = {
    ...(spell.effect?.status ?? {}),
    id: spell.effect?.status?.id ?? spell.id,
    label: spell.effect?.status?.label ?? spell.name,
  };
  if (spell.concentration) effect.concentrationId = concentrationId(caster);
  if (spell.resource === "weaponRider") effect.weaponRider = true;
  if ((target.id?.startsWith("boss-") || target.tags?.includes("boss")) && effect.actionLocked) {
    delete effect.actionLocked;
    effect.speedBonusFeet = Math.min(effect.speedBonusFeet ?? 0, -10);
    effect.label = `${effect.label} Resisted`;
  }
  applyStatusEffect(target, effect);
  addLog(`${caster.name}'s ${spell.name} applies ${effect.label} to ${target.name}.`, "important");
}

async function castSpellAtTarget(caster, spell, target) {
  if (!canCastSpell(caster, spell) || !target) return;
  spendSpellResources(caster, spell);
  if (spell.effect?.kind === "healing") {
    applySpellHealing(caster, target, spell);
  } else if (spell.effect?.kind === "status") {
    await applySpellStatus(caster, target, spell);
  } else if (spell.effect?.kind === "attackDamage") {
    const wasAlive = target.alive;
    await applySpellAttack(caster, target, spell);
    if (wasAlive && !target.alive && !isPartyHeroId(target.id)) {
      if (isPartyHeroId(caster.id)) playSoundEffect("enemyDefeated");
      awardMonsterXp(target);
      dropLootForMonster(target);
      await finishEncounterAfterLastMonsterFalls();
    }
  } else if (spell.effect?.kind === "damage") {
    const targets = spell.area ? areaTargetsForSpell(target, spell, caster) : [target];
    addLog(`${caster.name} casts ${spell.name} at spell level ${spellCastLevel(spell)} for ${spellPointCost(spell)} SP${spell.area ? ` at ${target.name}` : ""}.`, "important");
    for (const entry of targets) {
      const wasAlive = entry.alive;
      await applySpellDamage(caster, entry, spell);
      if (!entry.alive && isPartyHeroId(entry.id)) handleHeroDeath();
      if (wasAlive && !entry.alive && !isPartyHeroId(entry.id)) {
        if (isPartyHeroId(caster.id)) playSoundEffect("enemyDefeated");
        awardMonsterXp(entry);
        dropLootForMonster(entry);
      }
    }
    if (isPartyHeroId(caster.id)) await finishEncounterAfterLastMonsterFalls();
  }
  refreshDerivedStats(caster);
  hideAbilitiesMenu();
  render();
}

async function castSpellAtPoint(caster, spell, position) {
  if (!canCastSpell(caster, spell) || !position) return;
  if (spell.effect?.kind === "teleport") {
    if (window.DungeonGrid.isOccupied(position, state.fighters, caster)) {
      addLog(`${spell.name} needs an empty destination.`, "important");
      render();
      return;
    }
    spendSpellResources(caster, spell);
    caster.position = { ...position };
    addLog(`${caster.name} casts ${spell.name} at spell level ${spellCastLevel(spell)} for ${spellPointCost(spell)} SP and teleports.`, "important");
    refreshDerivedStats(caster);
    hideAbilitiesMenu();
    render();
    return;
  }
  spendSpellResources(caster, spell);
  const targets = spell.area ? areaTargetsForSpell(position, spell, caster) : spellTargetsFromCells([position]);
  addLog(`${caster.name} casts ${spell.name} at spell level ${spellCastLevel(spell)} for ${spellPointCost(spell)} SP at (${position.x + 1}, ${position.y + 1}).`, "important");
  for (const target of targets) {
    const wasAlive = target.alive;
    if (spell.effect?.kind === "damage") await applySpellDamage(caster, target, spell);
    else if (spell.effect?.kind === "status") await applySpellStatus(caster, target, spell);
    if (!target.alive && isPartyHeroId(target.id)) handleHeroDeath();
    if (wasAlive && !target.alive && !isPartyHeroId(target.id)) {
      if (isPartyHeroId(caster.id)) playSoundEffect("enemyDefeated");
      awardMonsterXp(target);
      dropLootForMonster(target);
    }
  }
  if (isPartyHeroId(caster.id)) await finishEncounterAfterLastMonsterFalls();
  refreshDerivedStats(caster);
  hideAbilitiesMenu();
  render();
}

async function castSpellInDirection(caster, spell, direction) {
  if (!canCastSpell(caster, spell)) return;
  spendSpellResources(caster, spell);
  const targets = breathTemplateTargets(caster, direction, spell);
  addLog(`${caster.name} casts ${spell.name} at spell level ${spellCastLevel(spell)} for ${spellPointCost(spell)} SP ${direction}.`, "important");
  for (const target of targets) {
    const wasAlive = target.alive;
    if (spell.effect?.kind === "damage") await applySpellDamage(caster, target, spell);
    else if (spell.effect?.kind === "status") await applySpellStatus(caster, target, spell);
    if (wasAlive && !target.alive && !isPartyHeroId(target.id)) {
      if (isPartyHeroId(caster.id)) playSoundEffect("enemyDefeated");
      awardMonsterXp(target);
      dropLootForMonster(target);
    }
    if (!target.alive && isPartyHeroId(target.id)) handleHeroDeath();
  }
  if (isPartyHeroId(caster.id)) await finishEncounterAfterLastMonsterFalls();
  hideAbilitiesMenu();
  render();
}

async function chooseAndCastSpell(spellId, castLevel = null) {
  const caster = state.mode === "combat" ? activeFighter() : activeHero();
  const baseSpell = spellDefinitionsForFighter(caster).find((entry) => entry.id === spellId);
  const spell = baseSpell ? spellWithCastLevel(baseSpell, castLevel ?? spellBaseLevel(baseSpell)) : null;
  if (!canCastSpell(caster, spell)) return;
  if (spell?.target === "self") {
    await castSpellAtTarget(caster, spell, caster);
    return;
  }
  if (spellTargetingMode(spell) === "target" && !spellTargetsFor(caster, spell).length) {
    addLog(`No valid target for ${spell.name}.`, "important");
    renderLog();
    return;
  }
  startSpellTargeting(caster, spell);
}

function pushTargetAway(source, target) {
  const dx = Math.sign(target.position.x - source.position.x);
  const dy = Math.sign(target.position.y - source.position.y);
  const destination = { x: target.position.x + dx, y: target.position.y + dy };
  if (!window.DungeonGrid.isInsideGrid(destination, currentGridSize())) return false;
  if (!movementWalkableFor(target).has(positionKey(destination))) return false;
  if (!canTraverseMovementEdge(target, target.position, destination, [])) return false;
  if (window.DungeonGrid.isOccupied(destination, state.fighters, target)) return false;
  target.position = destination;
  return true;
}

async function applyMonsterOnHitSpecials(monster, target, baseDamage, critical) {
  if (!target.alive) return;
  const names = monsterSpecialNames(monster);
  if (!names.length || !shouldUseMonsterSpecial("onHit")) return;
  const normalized = names.join(" | ");
  const dc = monsterSpecialDc(monster);

  if (/venom|poison|sickening|claw fever|deep venom/i.test(normalized)) {
    const save = await rollSavingThrow(target, "con", dc, `${monster.name}'s venom forces ${target.name} to make a CON save.`);
    if (!save.success) {
      const dice = specialDamageDice(monster, critical ? 8 : 6);
      const roll = rollDice(dice.count, dice.sides);
      applySpecialDamage(monster, target, Math.max(1, roll.total + dice.bonus), "poison", "venom");
      if (/sickening|claw fever/i.test(normalized)) {
        applyStatusEffect(target, { id: "sickened", label: "Sickened", attackBonus: -1, expiresAtEndOfTurn: true });
      }
    }
  }

  if (/crippling|hamstring|web|snare|dragging grasp|drowning grip/i.test(normalized)) {
    const ability = /web|snare/i.test(normalized) ? "dex" : "str";
    const save = await rollSavingThrow(target, ability, dc, `${monster.name}'s restraint forces ${target.name} to make a ${ability.toUpperCase()} save.`);
    if (!save.success) {
      if (/hamstring|crippling/i.test(normalized)) {
        applyStatusEffect(target, { id: "hamstrung", label: "Hamstrung", speedBonusFeet: -10, expiresAtEndOfTurn: true });
        addLog(`${target.name}'s speed is reduced by 10 ft until the end of their next turn.`, "important");
      } else {
        applyStatusEffect(target, { id: "snared", label: "Snared", speedLocked: true, expiresAtEndOfTurn: true });
        addLog(`${target.name}'s movement is stopped until the end of their next turn.`, "important");
      }
    }
  }

  if (/charge|pounce|lunge|rush|swooping|stomp|slam/i.test(normalized) && (monster.lastMoveFeet ?? 0) >= monsterSpecialAbilityTuning.chargeMinFeet) {
    const dice = specialDamageDice(monster, critical ? 8 : 6);
    const roll = rollDice(dice.count, dice.sides);
    applySpecialDamage(monster, target, Math.max(1, roll.total + dice.bonus), "bludgeoning", "charge");
    const save = await rollSavingThrow(target, "str", dc, `${monster.name}'s charge forces ${target.name} to make a STR save.`);
    if (!save.success && pushTargetAway(monster, target)) {
      addLog(`${target.name} is shoved back by ${monster.name}.`, "important");
    }
  }
}

function maybeUseUndeadFortitude(monster, incomingDamage = 0) {
  if (isPartyHeroId(monster?.id) || !hasMonsterSpecial(monster, /undead fortitude/i)) return false;
  if (!shouldUseMonsterSpecial("defensive")) return false;
  const dc = Math.max(10, 5 + incomingDamage);
  const save = savingThrow(monster, "con", dc);
  addLog(`${monster.name} tests Undead Fortitude: CON ${save.roll} ${abilityLabel(save.bonus)} = ${save.total} vs DC ${dc}.`);
  if (!save.success) return false;
  monster.hp = 1;
  monster.alive = true;
  return true;
}

function targetsInMonsterSpecialRange(monster, feet = monsterSpecialAbilityTuning.rangedSpecialFeet) {
  const maxSquares = feet / feetPerSquare;
  return partyHeroes().filter((hero) => hero.alive && distance(monster.position, hero.position) <= maxSquares && hasClearLineOfSight(monster.position, hero.position));
}

async function tryMonsterAreaSpecial(monster, namePattern, label, damageType, saveAbility, rangeFeet) {
  if (!hasMonsterSpecial(monster, namePattern) || !monster.hasAction || !shouldUseMonsterSpecial("active")) return false;
  const targets = targetsInMonsterSpecialRange(monster, rangeFeet);
  if (!targets.length) return false;
  monster.hasAction = false;
  const dc = monsterSpecialDc(monster);
  const dice = specialDamageDice(monster, namePattern.test("Fireball") ? 8 : 6);
  addLog(`${monster.name} uses ${label}.`, "important");
  for (const target of targets.slice(0, 3)) {
    const save = await rollSavingThrow(target, saveAbility, dc, `${monster.name}'s ${label} forces ${target.name} to make a ${saveAbility.toUpperCase()} save.`);
    const roll = rollDice(dice.count, dice.sides);
    const raw = Math.max(1, roll.total + dice.bonus);
    const damage = save.success ? Math.floor(raw / 2) : raw;
    if (save.success) addLog(`${target.name} takes half damage from ${label}.`);
    applySpecialDamage(monster, target, damage, damageType, label);
    if (!target.alive) handleHeroDeath();
  }
  return true;
}

async function maybeUseMonsterStartSpecial(monster) {
  if (!monster?.alive || isPartyHeroId(monster.id)) return false;
  monster.usedSpecials = monster.usedSpecials ?? {};

  if (hasMonsterSpecial(monster, /selfheal/i) && !monster.usedSpecials.SelfHeal && monster.hp <= monster.maxHp / 2 && shouldUseMonsterSpecial("defensive")) {
    const heal = rollDice(1, 6).total + monsterCategory(monster);
    monster.hp = Math.min(monster.maxHp, monster.hp + heal);
    monster.usedSpecials.SelfHeal = true;
    addLog(`${monster.name} uses Self Heal and recovers ${heal} HP.`, "heal");
    render();
    return false;
  }

  if (hasMonsterSpecial(monster, /shellguard|thornhide|briarhide|stubborn beast/i) && !monster.usedSpecials.ShellGuard && shouldUseMonsterSpecial("defensive")) {
    applyStatusEffect(monster, { id: "guarded", label: "Guarded", acBonus: monsterSpecialAbilityTuning.shellGuardAcBonus, expiresAtEndOfTurn: true });
    monster.usedSpecials.ShellGuard = true;
    addLog(`${monster.name} braces defensively (+${monsterSpecialAbilityTuning.shellGuardAcBonus} AC this turn).`, "important");
    render();
    return false;
  }

  if (hasMonsterSpecial(monster, /bloodfrenzy/i) && monster.hp <= monster.maxHp / 2) {
    applyStatusEffect(monster, { id: "blood-frenzy", label: "Blood Frenzy", attackBonus: 1, expiresAtEndOfTurn: true });
  }

  if (await tryMonsterAreaSpecial(monster, /fireball/i, "Fireball", "fire", "dex", monsterSpecialAbilityTuning.rangedSpecialFeet)) return true;
  if (await tryMonsterAreaSpecial(monster, /plague breath|bile spray|blight belch|rot burst|rot crown pulse/i, "Plague Breath", "poison", "con", monsterSpecialAbilityTuning.burstRangeFeet)) return true;
  if (await tryMonsterAreaSpecial(monster, /stampede|gravequake|stormhorn burst|root-rending roar|bossroar/i, "Roar", "bludgeoning", "str", monsterSpecialAbilityTuning.burstRangeFeet)) {
    for (const target of partyHeroes()) {
      if (distance(monster.position, target.position) <= monsterSpecialAbilityTuning.burstRangeFeet / feetPerSquare) {
        applyStatusEffect(target, { id: "shaken", label: "Shaken", attackBonus: monsterSpecialAbilityTuning.bossRoarAttackPenalty, expiresAtEndOfTurn: true });
      }
    }
    return true;
  }
  if (await tryMonsterAreaSpecial(monster, /web snare|websnare|venom spit|grave spark/i, "Special Shot", /venom/i.test(monsterSpecialNames(monster).join(" ")) ? "poison" : "necrotic", "dex", monsterSpecialAbilityTuning.rangedSpecialFeet)) return true;

  return false;
}

async function endTurn() {
  if (!state.combatStarted || combatMonsters().length === 0 || partyDefeatedOrDying()) {
    render();
    return;
  }

  expireEndOfTurnEffects(activeFighter());
  do {
    state.activeIndex = (state.activeIndex + 1) % state.initiative.length;
    if (state.activeIndex === 0) {
      state.round += 1;
      addLog(`Round ${state.round} begins.`, "important");
    }
  } while (!activeFighter()?.alive);
  syncActiveHeroToTurn();
  resetTurnResources(activeFighter());
  addTurnStartLog(activeFighter());
  if (isPartyHeroId(activeFighter()?.id) && activeFighter().hp <= 0) {
    await rollDeathSave(activeFighter());
    render();
    if (state.combatStarted && combatMonsters().length > 0 && !partyDefeatedOrDying()) {
      window.setTimeout(endTurn, tokenSlideMs);
    }
    return;
  }

  render();
  maybeRunMonsterTurn();
}

function maybeRunMonsterTurn() {
  const fighter = activeFighter();
  if (!fighter || isPartyHeroId(fighter.id) || !fighter.alive || partyDefeatedOrDying()) return;

  els.attack.disabled = true;
  els.useItem.disabled = true;
  els.endTurn.disabled = true;
  window.clearTimeout(monsterTurnTimer);
  const now = performance.now();
  const dueAt = fighter.nextAiDecisionAt ?? 0;
  const delay = Math.max(tokenSlideMs, dueAt - now);
  monsterTurnTimer = window.setTimeout(() => {
    const current = activeFighter();
    if (current && !isPartyHeroId(current.id)) {
      current.nextAiDecisionAt = performance.now() + monsterAiDecisionIntervalMs;
      pathfindingJobsThisTurn = 0;
      perfStats.aiUpdates += 1;
      runMonsterAi(current);
    }
  }, delay);
}

function movementWalkableFor(fighter) {
  return isRosterHeroId(fighter.id) && (state.mode === "exploration" || state.mode === "home") ? visibleWalkable() : currentWalkable();
}

function detectedArmedTrapKeys() {
  const keys = new Set();
  for (const object of state.dungeonObjects ?? []) {
    if (!objectIsTrap(object) || !object.detected || object.spent || object.disarmed || object.armed === false) continue;
    objectCells(object).forEach((cell) => keys.add(positionKey(cell)));
  }
  return keys;
}

function isDetectedArmedTrapPosition(position) {
  return detectedArmedTrapKeys().has(positionKey(position));
}

function trapAwareWalkableFor(fighter, destination = null) {
  const walkable = new Set(movementWalkableFor(fighter));
  const destinationKey = destination ? positionKey(destination) : "";
  const currentKey = positionKey(fighter.position);
  detectedArmedTrapKeys().forEach((tileKey) => {
    if (tileKey !== currentKey && tileKey !== destinationKey) walkable.delete(tileKey);
  });
  return walkable;
}

function movementLimitFor(fighter) {
  return state.mode === "combat" ? fighter.movementLeft : Infinity;
}

function occupyingFighterAt(position, ignoredFighter = null) {
  return Object.values(state.fighters).find(
    (fighter) =>
      fighter.alive &&
      fighter.id !== ignoredFighter?.id &&
      fighter.position.x === position.x &&
      fighter.position.y === position.y,
  ) ?? null;
}

function canMoveThroughOccupiedTile(fighter, position) {
  const occupant = occupyingFighterAt(position, fighter);
  if (occupant && state.mode === "home" && isRosterHeroId(fighter.id) && isRosterHeroId(occupant.id)) return true;
  if (occupant && isPartyHeroId(fighter.id) && isPartyHeroId(occupant.id)) return true;
  return Boolean(fighter.canMoveThroughMonsters && occupant && hostileTo(fighter, occupant));
}

function isValidPathStep(fighter, from, to, path = []) {
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  if (dx + dy !== 1) return false;
  if (!window.DungeonGrid.isInsideGrid(to, currentGridSize())) return false;
  if (!movementWalkableFor(fighter).has(positionKey(to))) return false;
  if (!canTraverseMovementEdge(fighter, from, to, path)) return false;
  if (window.DungeonGrid.isOccupied(to, state.fighters, fighter) && !canMoveThroughOccupiedTile(fighter, to)) return false;
  return !path.some((step) => positionKey(step) === positionKey(to));
}

function findMovementPath(fighter, destination) {
  const options = {
    gridSize: currentGridSize(),
    canTraverse: (from, to, path) => canTraverseMovementEdge(fighter, from, to, path),
    stateKey: (position, path) => movementStateKey(fighter, position, path),
    canEnterOccupied: (position) => canMoveThroughOccupiedTile(fighter, position),
  };
  const safePath = findPath(fighter.position, destination, fighter, state.fighters, {
    ...options,
    walkable: trapAwareWalkableFor(fighter, destination),
  });
  if (safePath) return safePath;
  return findPath(fighter.position, destination, fighter, state.fighters, {
    ...options,
    walkable: movementWalkableFor(fighter),
  });
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function moveFighterAlongPath(fighter, path, silent = false) {
  if (!heroCanAct(fighter) || (state.mode === "combat" && fighter.movementLeft <= 0)) return false;
  if (!path || path.length === 0 || path.length > movementLimitFor(fighter)) return false;
  if (window.DungeonGrid.isOccupied(path.at(-1), state.fighters, fighter)) return false;

  let previous = fighter.position;
  for (const step of path) {
    if (!isValidPathStep(fighter, previous, step, path.slice(0, path.indexOf(step)))) return false;
    previous = step;
  }

  movementInProgress = true;
  dragPath = null;
  dragHeroId = null;
  render();

  let movedSteps = 0;
  for (const step of path) {
    const opportunityAttackers = Object.values(state.fighters).filter((candidate) => canOpportunityAttack(candidate, fighter, fighter.position, step));
    for (const attacker of opportunityAttackers) {
      await opportunityAttack(attacker, fighter);
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
    const stepDelay = movedSteps > longMoveFastAfterSteps ? Math.max(25, Math.round(tokenSlideMs * longMoveFastMultiplier)) : tokenSlideMs;
    await sleep(stepDelay);
    if (!fighter.alive) break;
    if (usedPortal) {
      movementInProgress = false;
      dragPath = null;
      dragHeroId = null;
      render();
      break;
    }
    if (openedDoor && threatPresent()) break;
  }

  if (state.mode === "combat") {
    fighter.movementLeft -= movedSteps;
  }
  fighter.lastMoveFeet = movedSteps * feetPerSquare;

  if (!silent) {
    const suffix = state.mode === "combat" ? ` ${fighter.movementLeft * feetPerSquare} ft remains.` : "";
    addLog(`${fighter.name} moves ${movedSteps * feetPerSquare} ft.${suffix}`);
  }

  movementInProgress = false;
  if (isPartyHeroId(fighter.id) && checkDungeonCompletion(fighter)) return true;
  render();
  return true;
}

async function moveFighter(fighter, destination, silent = false) {
  const path = findMovementPath(fighter, destination);
  return moveFighterAlongPath(fighter, path, silent);
}

function occupiedByUnselectedHeroOrObstacle(position, movingHeroIds) {
  return Object.values(state.fighters).some(
    (fighter) =>
      fighter.alive &&
      fighter.position.x === position.x &&
      fighter.position.y === position.y &&
      !movingHeroIds.has(fighter.id),
  );
}

function groupMoveDestinations(destination, heroes, anchorHero = heroes[0]) {
  const movingHeroIds = new Set(heroes.map((hero) => hero.id));
  const walkable = state.mode === "home" || state.mode === "exploration" ? visibleWalkable() : movementWalkableFor(heroes[0]);
  const assigned = new Set();
  const sortedHeroes = [
    anchorHero,
    ...heroes
      .filter((hero) => hero.id !== anchorHero?.id)
      .sort((a, b) => distance(a.position, destination) - distance(b.position, destination)),
  ].filter(Boolean);
  const candidates = Array.from(walkable)
    .map(positionFromKey)
    .filter((position) => !occupiedByUnselectedHeroOrObstacle(position, movingHeroIds))
    .sort((a, b) => distance(a, destination) - distance(b, destination));

  const plans = [];
  for (const hero of sortedHeroes) {
    const heroCandidates =
      plans.length === 0
        ? [destination, ...candidates]
        : candidates;
    const target = heroCandidates.find((position) => {
      const key = positionKey(position);
      if (assigned.has(key)) return false;
      if (!walkable.has(key)) return false;
      if (occupiedByUnselectedHeroOrObstacle(position, movingHeroIds)) return false;
      const path = findMovementPath(hero, position);
      if (!path?.length && positionKey(hero.position) !== key) return false;
      plans.push({ hero, destination: position, path: path ?? [] });
      assigned.add(key);
      return true;
    });
    if (!target) return [];
  }

  return plans;
}

async function moveFightersAlongPathsTogether(plans) {
  const activePlans = plans.filter((plan) => plan.path.length > 0);
  if (!activePlans.length) return false;

  movementInProgress = true;
  dragPath = null;
  dragHeroId = null;
  render();

  const maxLength = Math.max(...activePlans.map((plan) => plan.path.length));
  for (let stepIndex = 0; stepIndex < maxLength; stepIndex += 1) {
    for (const plan of activePlans) {
      const step = plan.path[stepIndex];
      if (!step || !plan.hero.alive) continue;
      plan.hero.position = { ...step };
      collectLootAtPosition(plan.hero, step);
      triggerTrapAtPosition(plan.hero, step);
      triggerPortalAtPosition(plan.hero, plan.hero.position);
      autoOpenAdjacentExplorationDoor(plan.hero);
      render();
      await sleep(Math.max(20, Math.round(tokenSlideMs * 0.18)));
    }
    await sleep(Math.max(30, Math.round(tokenSlideMs * 0.35)));
  }

  for (const plan of activePlans) {
    plan.hero.lastMoveFeet = plan.path.length * feetPerSquare;
  }
  addLog(`${activePlans.length} heroes move together.`);
  movementInProgress = false;
  const exitHero = activePlans.map((plan) => plan.hero).find((hero) => isPartyHeroId(hero.id) && isExitPosition(hero.position));
  if (exitHero && checkDungeonCompletion(exitHero)) return true;
  render();
  return true;
}

async function moveSelectedHeroesTo(destination, anchorHero) {
  if (state.mode === "combat") return false;
  const heroes = selectedMovableHeroes(anchorHero.id);
  if (heroes.length <= 1) return false;
  const plans = groupMoveDestinations(destination, heroes, anchorHero);
  if (plans.length !== heroes.length) return false;
  return moveFightersAlongPathsTogether(plans);
}

function canAdminTeleportTo(position) {
  if (!adminEnabled() || !adminTeleportEnabled) return false;
  const key = positionKey(position);
  if (!window.DungeonGrid.isInsideGrid(position, currentGridSize())) return false;
  if (!isKnownTile(position)) return false;
  if (!dungeonFloorKeys().has(key)) return false;
  if (blockingObjectKeys().has(key)) return false;
  if (window.DungeonGrid.isOccupied(position, state.fighters, activeHero())) return false;
  return true;
}

function adminTeleportHero(position) {
  const hero = activeHero();
  if (!hero?.alive || state.completed) return false;
  if (!canAdminTeleportTo(position)) {
    addLog("Admin teleport needs an empty dungeon floor, room, door, or hallway tile.", "important");
    render();
    return false;
  }

  hero.position = { ...position };
  dragPath = null;
  dragHeroId = null;
  collectLootAtPosition(hero, position);
  triggerTrapAtPosition(hero, position);
  autoOpenAdjacentExplorationDoor(hero);
  addLog(`Admin teleported ${hero.name}.`, "important");
  if (checkDungeonCompletion()) return true;
  render();
  window.requestAnimationFrame(nudgeViewForHeroNearEdge);
  return true;
}

function handleTileClick(position) {
  const hero = activeHero();
  if (suppressNextTileClick) {
    suppressNextTileClick = false;
    return;
  }
  if (pendingSpellTargeting) {
    void confirmPendingSpellTarget(position);
    return;
  }
  if (movementInProgress || dragPath) return;
  if (adminEnabled() && adminTeleportEnabled) {
    adminTeleportHero(position);
    return;
  }
  if (state.mode === "combat" && (activeFighter()?.id !== hero?.id || combatMonsters().length === 0)) return;
  if (state.mode === "combat" && hero.hp <= 0) return;

  if (canHeroUseHomeExit(hero) && isExitPosition(position) && distance(hero.position, position) <= 1) {
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

async function moveHeroByKeyboard(delta) {
  if (!gameHasStarted || movementInProgress || dragPath || state.completed) return;
  const hero = activeHero();
  if (!heroCanAct(hero)) return;
  if (state.mode === "combat" && (activeFighter()?.id !== hero.id || combatMonsters().length === 0)) return;
  if (state.mode === "combat" && hero.hp <= 0) return;

  const destination = { x: hero.position.x + delta.x, y: hero.position.y + delta.y };
  if (!window.DungeonGrid.isInsideGrid(destination, currentGridSize())) return;

  const door = canOpenDoor(destination);
  if (door) {
    openDoor(door);
    return;
  }

  if (state.mode === "exploration" && threatPresent()) {
    addLog("A hostile creature is present. Roll initiative before moving.");
    render();
    return;
  }

  if (state.mode !== "combat" && selectedMovableHeroes(hero.id).length > 1) {
    const movedTogether = await moveSelectedHeroesTo(destination, hero);
    if (movedTogether) {
      window.requestAnimationFrame(nudgeViewForHeroNearEdge);
      return true;
    }
  }

  if (!isValidPathStep(hero, hero.position, destination, [])) return;
  await moveFighterAlongPath(hero, [destination]);
  window.requestAnimationFrame(nudgeViewForHeroNearEdge);
  return true;
}

function movementDeltaForKey(key) {
  const movementKeys = {
    arrowup: { x: 0, y: -1 },
    w: { x: 0, y: -1 },
    arrowright: { x: 1, y: 0 },
    d: { x: 1, y: 0 },
    arrowdown: { x: 0, y: 1 },
    s: { x: 0, y: 1 },
    arrowleft: { x: -1, y: 0 },
    a: { x: -1, y: 0 },
  };
  return movementKeys[key] ?? null;
}

function clearHeldMovementKeys() {
  heldMovementKeys.clear();
}

function startHeldMovement(key, delta) {
  if (heldMovementKeys.has(key)) return;

  const entry = { active: true, moving: false, timer: null };
  heldMovementKeys.set(key, entry);

  const step = async () => {
    if (!entry.active || entry.moving) return;
    entry.moving = true;
    const moved = await moveHeroByKeyboard(delta);
    entry.moving = false;
    if (!entry.active || !moved) {
      stopHeldMovement(key);
      return;
    }
    entry.timer = window.setTimeout(step, 45);
  };

  step();
}

function stopHeldMovement(key) {
  const entry = heldMovementKeys.get(key);
  if (!entry) return;
  entry.active = false;
  if (entry.timer) window.clearTimeout(entry.timer);
  heldMovementKeys.delete(key);
}

function partyHeroes() {
  return (state.party?.heroIds ?? ["hero"])
    .map((id) => state.fighters[id])
    .filter((fighter) => fighter?.alive && !fighter.dead);
}

function partyRoleFor(fighter) {
  if ((state.party?.heroIds ?? ["hero"]).length <= 1 && fighter?.id === "hero") return "tank";
  return fighter?.partyRole ?? "dd";
}

function visibleTrapKeysForMonster(monster) {
  if (abilityScore(monster, "wis") <= 10) return new Set();
  const keys = new Set();
  for (const object of state.dungeonObjects ?? []) {
    if (!objectIsTrap(object) || !object.detected || object.spent || object.disarmed || object.armed === false) continue;
    objectCells(object).forEach((cell) => keys.add(positionKey(cell)));
  }
  return keys;
}

function monsterMovementWalkable(monster, baseWalkable = currentWalkable()) {
  const walkable = new Set(baseWalkable);
  visibleTrapKeysForMonster(monster).forEach((tileKey) => {
    if (tileKey !== positionKey(monster.position)) walkable.delete(tileKey);
  });
  return walkable;
}

function consumeMonsterPathfindingJob(monster) {
  if (!monster || !monster.alive) return false;
  if (pathfindingJobsThisTurn >= monsterPathfindingBudgetPerTurn) return false;
  pathfindingJobsThisTurn += 1;
  perfStats.pathfindingJobs += 1;
  perfStats.pathfindingJobsLastFrame += 1;
  return true;
}

function monsterReachableTiles(monster, options) {
  if (!consumeMonsterPathfindingJob(monster)) return new Map();
  return reachableTiles(monster, state.fighters, options);
}

function pathProvokesOpportunity(mover, path = []) {
  let from = mover.position;
  for (const step of path) {
    if (Object.values(state.fighters).some((candidate) => canOpportunityAttack(candidate, mover, from, step))) return true;
    from = step;
  }
  return false;
}

function canAttackFromPosition(attacker, target, position) {
  const range = attackRangeSquares(attacker);
  if (range <= 1) {
    return hasMeleeAccess({ ...attacker, position }, target);
  }
  return attackGridDistance(position, target.position) <= range && hasClearLineOfSight(position, target.position);
}

function pathForMonster(monster, destination, walkable = monsterMovementWalkable(monster)) {
  if (!consumeMonsterPathfindingJob(monster)) return null;
  return findPath(monster.position, destination, monster, state.fighters, {
    gridSize: currentGridSize(),
    walkable,
    canTraverse: (from, to, path) => canTraverseMovementEdge(monster, from, to, path),
    stateKey: (position, path) => movementStateKey(monster, position, path),
  });
}

function attackPlanAgainst(monster, target, avoidOpportunity = false, baseWalkable = currentWalkable()) {
  const monsterRoom = monster.behavior === "rangedKiter" ? roomForPosition(monster.position) : null;
  const movementBase = monsterRoom ? roomWalkableSet(monsterRoom) : baseWalkable;
  const walkable = monsterMovementWalkable(monster, movementBase);
  const reachable = Array.from(
    monsterReachableTiles(monster, {
      gridSize: currentGridSize(),
      walkable,
      maxCost: monster.movementLeft,
      canTraverse: (from, to, path) => canTraverseMovementEdge(monster, from, to, path),
      stateKey: (position, path) => movementStateKey(monster, position, path),
    }).keys(),
  ).map(positionFromKey);

  const candidates = [monster.position, ...reachable]
    .filter((position, index, positions) => positions.findIndex((entry) => positionKey(entry) === positionKey(position)) === index)
    .filter((position) => canAttackFromPosition(monster, target, position))
    .map((position) => {
      const path = positionKey(position) === positionKey(monster.position) ? [] : pathForMonster(monster, position, walkable);
      return path ? { target, position, path, cost: path.length } : null;
    })
    .filter(Boolean)
    .filter((plan) => !avoidOpportunity || !pathProvokesOpportunity(monster, plan.path));

  return candidates.sort((a, b) => a.cost - b.cost || distance(a.position, target.position) - distance(b.position, target.position))[0] ?? null;
}

function closestTargetTo(monster, targets = partyHeroes()) {
  return targets.slice().sort((a, b) => distance(monster.position, a.position) - distance(monster.position, b.position) || a.id.localeCompare(b.id))[0] ?? activeHero();
}

function lowestLifeTarget(targets) {
  return targets
    .slice()
    .sort((a, b) => a.hp / Math.max(1, a.maxHp) - b.hp / Math.max(1, b.maxHp) || a.hp - b.hp || a.id.localeCompare(b.id))[0] ?? null;
}

function chooseMonsterAttackPlan(monster) {
  const targets = partyHeroes();
  if (targets.length === 0) return null;
  const intelligence = abilityScore(monster, "int");
  const smarterMovement = intelligence >= 11;

  const planFor = (target, avoid = smarterMovement) => target ? attackPlanAgainst(monster, target, avoid) : null;
  const closestPlan = (avoid = smarterMovement) => {
    const sorted = targets.slice().sort((a, b) => distance(monster.position, a.position) - distance(monster.position, b.position) || a.id.localeCompare(b.id));
    return sorted.map((target) => planFor(target, avoid)).find(Boolean) ?? null;
  };

  if (intelligence < 5) {
    const revengeTarget = targets.find((target) => target.id === monster.lastDamagedById);
    return planFor(revengeTarget, false) ?? closestPlan(false);
  }
  if (intelligence < 10) return closestPlan(false);
  if (intelligence <= 14) {
    return planFor(lowestLifeTarget(targets), true) ?? closestPlan(true) ?? closestPlan(false);
  }

  const healer = targets.find((target) => partyRoleFor(target) === "heal");
  return planFor(healer, true) ?? closestPlan(true) ?? closestPlan(false);
}

function bestPathToward(mover, target, avoidOpportunity = false) {
  const walkable = monsterMovementWalkable(mover);
  const reachable = Array.from(
    monsterReachableTiles(mover, {
      gridSize: currentGridSize(),
      walkable,
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

  for (const entry of reachable) {
    const path = pathForMonster(mover, entry.position, walkable);
    if (path && (!avoidOpportunity || !pathProvokesOpportunity(mover, path))) return path;
  }
  return null;
}

function normalRangeSquares(fighter) {
  const range = damageProfile(fighter).range;
  return Math.max(1, Math.floor((range?.normal ?? range?.feet ?? 5) / feetPerSquare));
}

function roomWalkableSet(room, fighter = null) {
  const walkable = new Set((room?.cells ?? []).map(positionKey));
  blockingObjectKeys().forEach((tileKey) => walkable.delete(tileKey));
  return fighter ? monsterMovementWalkable(fighter, walkable) : walkable;
}

function roomOnlyPath(mover, destination, room) {
  const walkable = roomWalkableSet(room, mover);
  if (!consumeMonsterPathfindingJob(mover)) return null;
  return findPath(mover.position, destination, mover, state.fighters, {
    gridSize: currentGridSize(),
    walkable,
    canTraverse: () => true,
  });
}

function bestRoomKitePath(mover, target, avoidOpportunity = false) {
  const room = roomForPosition(mover.position);
  if (!room) return null;

  const range = normalRangeSquares(mover);
  const reachable = Array.from(
    monsterReachableTiles(mover, {
      gridSize: currentGridSize(),
      walkable: roomWalkableSet(room, mover),
      maxCost: mover.movementLeft,
      canTraverse: () => true,
    }).entries(),
  ).map(([key, cost]) => ({ position: positionFromKey(key), cost }));

  const current = { position: mover.position, cost: 0 };
  const candidates = [current, ...reachable].filter(
    (entry) => attackGridDistance(entry.position, target.position) <= range && hasClearLineOfSight(entry.position, target.position),
  );
  const pool = candidates.length ? candidates : [current, ...reachable];
  if (pool.length === 0) return null;

  pool.sort((a, b) => {
    const distanceDifference = candidates.length
      ? distance(b.position, target.position) - distance(a.position, target.position)
      : distance(a.position, target.position) - distance(b.position, target.position);
    return distanceDifference || a.cost - b.cost;
  });

  for (const entry of pool) {
    if (positionKey(entry.position) === positionKey(mover.position)) return null;
    const path = roomOnlyPath(mover, entry.position, room);
    if (path && (!avoidOpportunity || !pathProvokesOpportunity(mover, path))) return path;
  }
  return null;
}

function swarmTargetFor(monster) {
  const monsterRoom = roomForPosition(monster.position);
  const heroes = (state.party?.heroIds ?? ["hero"])
    .map((id) => state.fighters[id])
    .filter((fighter) => fighter?.alive);
  const sameRoomHeroes = monsterRoom ? heroes.filter((fighter) => roomForPosition(fighter.position)?.id === monsterRoom.id) : [];
  const candidates = sameRoomHeroes.length ? sameRoomHeroes : heroes;
  const swarmMates = monsterRoom
    ? aliveMonsters().filter((entry) => entry.behavior === "swarm" && roomForPosition(entry.position)?.id === monsterRoom.id)
    : [monster];
  return candidates
    .sort((a, b) => {
      const distanceToA = Math.min(...swarmMates.map((entry) => distance(entry.position, a.position)));
      const distanceToB = Math.min(...swarmMates.map((entry) => distance(entry.position, b.position)));
      return distanceToA - distanceToB || a.id.localeCompare(b.id);
    })[0] ?? activeHero();
}

function bestSwarmPath(mover, target) {
  if (hasMeleeAccess(mover, target)) return null;

  const walkable = monsterMovementWalkable(mover);
  const reachable = Array.from(
    monsterReachableTiles(mover, {
      gridSize: currentGridSize(),
      walkable,
      maxCost: mover.movementLeft,
      canTraverse: (from, to, path) => canTraverseMovementEdge(mover, from, to, path),
      stateKey: (position, path) => movementStateKey(mover, position, path),
    }).entries(),
  ).map(([key, cost]) => ({ position: positionFromKey(key), cost }));

  const targetRoom = roomForPosition(target.position);
  const adjacentOpen = adjacentCells(target.position)
    .filter((position) => walkable.has(positionKey(position)))
    .filter((position) => !targetRoom || roomForPosition(position)?.id === targetRoom.id)
    .filter((position) => !window.DungeonGrid.isOccupied(position, state.fighters, mover))
    .filter((position) => canTraverseMovementEdge(mover, position, target.position, []));

  const adjacentKeys = new Set(adjacentOpen.map(positionKey));
  const candidates = reachable.filter((entry) => adjacentKeys.has(positionKey(entry.position)));
  const pool = candidates.length ? candidates : reachable;
  if (pool.length === 0) return null;

  pool.sort((a, b) => {
    const distanceDifference = distance(a.position, target.position) - distance(b.position, target.position);
    return distanceDifference || a.cost - b.cost;
  });

  if (positionKey(pool[0].position) === positionKey(mover.position)) return null;
  return pathForMonster(mover, pool[0].position, walkable);
}

async function runMonsterAi(monster) {
  if (!monster.alive || partyDefeatedOrDying()) return;
  if (await maybeUseMonsterStartSpecial(monster)) {
    window.setTimeout(() => {
      if (activeFighter()?.id === monster.id && !partyDefeatedOrDying()) endTurn();
    }, tokenSlideMs);
    return;
  }

  if (monster.behavior === "swarm") {
    const swarmTarget = swarmTargetFor(monster);
    const path = bestSwarmPath(monster, swarmTarget);
    if (path) {
      await moveFighterAlongPath(monster, path, true);
      addLog(`${monster.name} swarms around ${swarmTarget.name}.`);
    }

    window.setTimeout(async () => {
      if (activeFighter()?.id === monster.id && isInAttackRange(monster, swarmTarget) && monster.hasAction) {
        await makeAttack(monster, swarmTarget);
      }

      window.setTimeout(() => {
        if (activeFighter()?.id === monster.id && !partyDefeatedOrDying()) {
          endTurn();
        }
      }, tokenSlideMs);
    }, tokenSlideMs);
    return;
  }

  if (monster.behavior === "rangedKiter") {
    const plan = chooseMonsterAttackPlan(monster);
    const target = plan?.target ?? closestTargetTo(monster);
    const avoidsOpportunity = abilityScore(monster, "int") >= 11;
    const path = plan?.path?.length
      ? plan.path
      : bestRoomKitePath(monster, target, avoidsOpportunity) ?? (avoidsOpportunity ? bestRoomKitePath(monster, target, false) : null);
    if (path) {
      await moveFighterAlongPath(monster, path, true);
      addLog(`${monster.name} repositions inside the room.`);
    }

    window.setTimeout(async () => {
      if (activeFighter()?.id === monster.id && isInAttackRange(monster, target) && monster.hasAction) {
        await makeAttack(monster, target);
      }

      window.setTimeout(() => {
        if (activeFighter()?.id === monster.id && !partyDefeatedOrDying()) {
          endTurn();
        }
      }, tokenSlideMs);
    }, tokenSlideMs);
    return;
  }

  if (monster.behavior === "melee") {
    const plan = chooseMonsterAttackPlan(monster);
    const target = plan?.target ?? closestTargetTo(monster);
    const avoidsOpportunity = abilityScore(monster, "int") >= 11;
    if (!hasMeleeAccess(monster, target)) {
      const path = plan?.path?.length
        ? plan.path
        : bestPathToward(monster, target, avoidsOpportunity) ?? (avoidsOpportunity ? bestPathToward(monster, target, false) : null);
      if (path) {
        const before = { ...monster.position };
        await moveFighterAlongPath(monster, path, true);
        const movedSquares = path.length || distance(before, monster.position);
        addLog(`${monster.name} advances ${movedSquares * feetPerSquare} ft toward ${target.name}.`);
      }
    }

    window.setTimeout(async () => {
      if (activeFighter()?.id === monster.id && isInAttackRange(monster, target) && monster.hasAction) {
        await makeAttack(monster, target);
      }

      window.setTimeout(() => {
        if (activeFighter()?.id === monster.id && !partyDefeatedOrDying()) {
          endTurn();
        }
      }, tokenSlideMs);
    }, tokenSlideMs);
  }
}

function heroCanStartMovement() {
  const hero = activeHero();
  if (!gameHasStarted || movementInProgress || state.completed) return false;
  if (state.mode === "home") return heroCanAct(hero);
  if (state.mode === "combat") {
    return activeFighter()?.id === hero?.id && combatMonsters().length > 0 && heroCanAct(hero) && hero.movementLeft > 0;
  }
  return heroCanAct(hero) && !threatPresent();
}

function heroCanUseDoor() {
  const hero = activeHero();
  if (!gameHasStarted || movementInProgress || state.completed) return false;
  if (state.mode === "combat") {
    return activeFighter()?.id === hero?.id && combatMonsters().length > 0 && heroCanAct(hero);
  }
  return heroCanAct(hero);
}

function tryOpenDoorFromHeroPosition() {
  if (!heroCanUseDoor()) return false;

  const hero = activeHero();
  const door = hero ? canOpenDoor(hero.position) : null;
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
  const maxExtraSteps = Math.max(0, movementLimitFor(fighter) - path.length);

  const search = (avoidDetectedTraps) => {
    const queue = [{ position: from, steps: [] }];
    const visited = new Set([positionKey(from), ...path.map(positionKey)]);

    while (queue.length > 0) {
      const current = queue.shift();
      if (positionKey(current.position) === positionKey(pathGoal)) {
        return current.steps;
      }
      if (current.steps.length >= maxExtraSteps) continue;

      for (const next of window.DungeonGrid.neighbors(current.position, currentGridSize())) {
        const nextKey = positionKey(next);
        if (avoidDetectedTraps && nextKey !== positionKey(pathGoal) && isDetectedArmedTrapPosition(next)) continue;
        if (visited.has(nextKey) || !isValidPathStep(fighter, current.position, next, [...path, ...current.steps])) continue;
        visited.add(nextKey);
        queue.push({ position: next, steps: [...current.steps, next] });
      }
    }

    return [];
  };

  const safeSegment = search(true);
  return safeSegment.length ? safeSegment : search(false);
}

function extendDragPath(position) {
  const hero = state.fighters[dragHeroId] ?? activeHero();
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
  const hero = state.fighters[dragHeroId] ?? activeHero();
  dragPath = null;
  dragHeroId = null;
  suppressNextHeroClick = true;
  renderRoom();
  if (path.length === 0) {
    setActiveHero(hero.id);
    render();
    tryOpenDoorFromHeroPosition();
    return;
  }

  if (state.mode !== "combat" && selectedMovableHeroes(hero.id).length > 1) {
    const movedGroup = await moveSelectedHeroesTo(path.at(-1), hero);
    if (movedGroup) return;
  }

  const moved = await moveFighterAlongPath(hero, path);
  if (!moved) {
    addLog(state.mode === "combat" ? "That path is out of reach or blocked." : "That path is blocked or not discovered yet.");
    render();
  }
}

function cancelDragPath() {
  dragPath = null;
  dragHeroId = null;
  suppressNextHeroClick = true;
  renderRoom();
}

function handleHeroPointerDown(event) {
  if (event.button !== 0) return;
  if (!gameHasStarted || movementInProgress) return;
  const heroId = event.currentTarget?.dataset?.combatant;
  if (!heroId) return;
  if (pendingSpellTargeting) {
    const hero = state.fighters[heroId];
    if (hero?.position) {
      event.preventDefault();
      event.stopPropagation();
      suppressNextHeroClick = true;
      void confirmPendingSpellTarget(hero.position);
    }
    return;
  }
  if ((event.shiftKey || event.ctrlKey || event.metaKey) && state.mode !== "combat") {
    event.preventDefault();
    event.stopPropagation();
    suppressNextHeroClick = true;
    if (toggleHeroSelection(heroId)) render();
    return;
  }
  const keepGroupSelection = state.mode !== "combat" && selectedHeroIds.size > 1 && selectedHeroIds.has(heroId);
  if (keepGroupSelection) {
    state.party.activeHeroId = heroId;
  } else if (!setActiveHero(heroId)) {
    return;
  }
  render();

  if (!heroCanStartMovement()) {
    tryOpenDoorFromHeroPosition();
    return;
  }

  event.preventDefault();
  dragPath = [];
  dragHeroId = heroId;
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
  if (event.button !== 0 || !gameHasStarted || dragPath) return;
  if (pendingSpellTargeting) {
    const position = tilePositionFromPoint(event.clientX, event.clientY);
    if (position) {
      event.preventDefault();
      event.stopPropagation();
      void confirmPendingSpellTarget(position);
    }
    return;
  }
  if (adminEnabled() && adminTeleportEnabled && event.target.closest(".tile")) return;
  if (event.target.closest(".token, .chest-token, .topbar, button:not(.tile)")) return;
  if (event.target === els.roomScroll) return;
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
  const heroToken = isRosterHeroId(combatant.id);
  token.className = `token ${heroToken ? "hero" : "monster-token"} ${combatant.id}`;
  token.dataset.combatant = combatant.id;
  token.title = combatant.name;

  if (!heroToken) {
    const category = Math.max(1, Math.min(10, Number(monsterCategory(combatant)) || 1));

    token.classList.add(`monster-category-${category}`);
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
  token.addEventListener("mouseenter", () => {
    const current = state.fighters[combatant.id];
    if (current?.position) hoverSpellTarget(current.position);
  });

  if (heroToken) {
    token.addEventListener("pointerdown", handleHeroPointerDown);
    token.addEventListener("click", (event) => {
      if (pendingSpellTargeting) {
        const current = state.fighters[combatant.id];
        if (current?.position) void confirmPendingSpellTarget(current.position);
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (suppressNextHeroClick) {
        suppressNextHeroClick = false;
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      const current = state.fighters[combatant.id];
      if (!current || !isRosterHeroId(current.id)) return;
      if ((event.shiftKey || event.ctrlKey || event.metaKey) && state.mode !== "combat") {
        toggleHeroSelection(current.id);
      } else {
        setActiveHero(current.id);
      }
      event.preventDefault();
      event.stopPropagation();
      render();
    });
  } else {
    token.addEventListener("click", (event) => {
      const current = state.fighters[combatant.id];
      if (!current?.alive || !isKnownTile(current.position)) return;
      if (pendingSpellTargeting) {
        void confirmPendingSpellTarget(current.position);
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (state.mode === "combat" && selectedHeroCanTargetMonster(current)) {
        selectAttackTarget(current.id);
      } else {
        selectAttackTarget(current.id);
        showCombatantInfo(current);
      }
      event.preventDefault();
      event.stopPropagation();
    });
  }

  return token;
}
function combatantTokenArt(fighter) {
  return fighter.tokenArt ?? fighter.tokenImage ?? fighter.art ?? "";
}

function combatantArtworkMarkup(fighter, className = "combatant-art") {
  const art = combatantTokenArt(fighter);
  if (art) {
    return `<div class="${className}"><img src="${escapeAttribute(art)}" alt="${escapeAttribute(fighter.name)} artwork" /></div>`;
  }
  return `<div class="${className} empty"><span>${escapeHtml(fighter.token ?? tokenFromName(fighter.name, "M"))}</span></div>`;
}

function ensureCombatantToken(fighter) {
  if (els.room.querySelector(`[data-combatant="${fighter.id}"]`)) return;
  els.room.querySelector(".token-layer")?.prepend(createCombatantToken(fighter));
}

function createTileButton(position) {
  const tile = document.createElement("button");
  tile.className = "tile";
  tile.type = "button";
  tile.dataset.x = String(position.x);
  tile.dataset.y = String(position.y);
  tile.addEventListener("click", () => handleTileClick(position));
  tile.addEventListener("mouseenter", () => hoverSpellTarget(position));
  tile.addEventListener("contextmenu", (event) => {
    const table = planningTablePosition();
    if (state.mode === "home" && position.y === table.y && position.x >= table.x && position.x < table.x + 2) {
      event.preventDefault();
      showPlanningTableInfo();
    }
  });
  return tile;
}

function buildRoom() {
  els.room.innerHTML = "";
  renderedTileKeys = new Set();
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

  const tokenLayer = document.createElement("div");
  tokenLayer.className = "token-layer";

  const wallEdgeLayer = document.createElement("div");
  wallEdgeLayer.className = "wall-edge-layer";

  for (const fighter of Object.values(state.fighters).filter((entry) => isRosterHeroId(entry.id))) {
    tokenLayer.append(createCombatantToken(fighter));
  }

  const exitToken = document.createElement("div");
  exitToken.className = "exit-token";
  exitToken.dataset.exit = "dungeon";
  exitToken.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const hero = activeHero();
    if (canHeroUseHomeExit(hero) && distance(hero.position, state.exit.position) <= 1) {
      showHomeMenu();
      return;
    }
    showDungeonObjectInfo({
      id: "dungeon-exit",
      type: state.mode === "home" ? "homeExit" : "dungeonExit",
      position: state.exit.position,
    });
  });
  exitToken.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    event.stopPropagation();
    showDungeonObjectInfo({
      id: "dungeon-exit",
      type: state.mode === "home" ? "homeExit" : "dungeonExit",
      position: state.exit.position,
    });
  });
  tokenLayer.append(exitToken);

  const chestToken = document.createElement("button");
  chestToken.className = "chest-token hidden";
  chestToken.type = "button";
  chestToken.title = "Home chest";
  chestToken.textContent = "C";
  const openChest = (event) => {
    event?.preventDefault();
    event?.stopPropagation();
    const hero = activeHero();
    if (state.mode === "home" && hero) {
      showHomeChestInfo();
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

  const planningToken = document.createElement("button");
  planningToken.className = "planning-table-token hidden";
  planningToken.type = "button";
  planningToken.title = "Planning Table";
  planningToken.textContent = "PT";
  planningToken.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (state.mode === "home") showPlanningTableInfo();
  });
  planningToken.addEventListener("click", (event) => {
    event.preventDefault();
    if (state.mode === "home") showPlanningTableInfo();
  });
  tokenLayer.append(planningToken);

  const lootLayer = document.createElement("div");
  lootLayer.className = "loot-layer";
  tokenLayer.append(lootLayer);

  const objectLayer = document.createElement("div");
  objectLayer.className = "object-layer";
  tokenLayer.append(objectLayer);

  els.room.append(tileLayer, wallEdgeLayer, tokenLayer);
  roomIsBuilt = true;
}

function renderWallEdges() {
  const edgeLayer = els.room.querySelector(".wall-edge-layer");
  if (!edgeLayer) return;

  edgeLayer.innerHTML = "";
  const scaledTileSizePx = currentTileSizePx();
  for (const segment of wallEdgeSegments()) {
    const edge = document.createElement("div");
    edge.className = `wall-edge wall-edge-${segment.direction}`;
    if (segment.direction === "east" || segment.direction === "west") {
      edge.style.left = `${(segment.position.x + 1) * scaledTileSizePx}px`;
      if (segment.direction === "west") edge.style.left = `${segment.position.x * scaledTileSizePx}px`;
      edge.style.top = `${segment.position.y * scaledTileSizePx}px`;
      edge.style.height = `${scaledTileSizePx + 2}px`;
    } else {
      edge.style.left = `${segment.position.x * scaledTileSizePx}px`;
      edge.style.top = `${(segment.position.y + 1) * scaledTileSizePx}px`;
      if (segment.direction === "north") edge.style.top = `${segment.position.y * scaledTileSizePx}px`;
      edge.style.width = `${scaledTileSizePx + 2}px`;
    }
    edgeLayer.append(edge);
  }
}

function renderTileButtons(tileKeys) {
  const tileLayer = els.room.querySelector(".tile-layer");
  if (!tileLayer) return;

  for (const tileKey of Array.from(renderedTileKeys)) {
    if (tileKeys.has(tileKey)) continue;
    tileLayer.querySelector(`[data-tile-key="${tileKey}"]`)?.remove();
    renderedTileKeys.delete(tileKey);
  }

  const scaledTileSizePx = currentTileSizePx();
  for (const tileKey of tileKeys) {
    const position = positionFromKey(tileKey);
    if (renderedTileKeys.has(tileKey)) {
      const existing = tileLayer.querySelector(`[data-tile-key="${tileKey}"]`);
      if (existing) {
        existing.style.left = `${position.x * scaledTileSizePx}px`;
        existing.style.top = `${position.y * scaledTileSizePx}px`;
      }
      continue;
    }
    const tile = createTileButton(position);
    tile.dataset.tileKey = tileKey;
    tile.style.left = `${position.x * scaledTileSizePx}px`;
    tile.style.top = `${position.y * scaledTileSizePx}px`;
    tileLayer.append(tile);
    renderedTileKeys.add(tileKey);
  }
}

function renderLootPiles() {
  const lootLayer = els.room.querySelector(".loot-layer");
  if (!lootLayer) return;

  lootLayer.innerHTML = "";
  const scaledTileSizePx = currentTileSizePx();
  const activeTiles = activeTileKeys();
  for (const pile of state.lootPiles ?? []) {
    if (!activeTiles.has(positionKey(pile.position)) || !isKnownTile(pile.position)) continue;

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
  const activeTiles = activeTileKeys();
  for (const object of state.dungeonObjects ?? []) {
    if (!objectCells(object).some((cell) => activeTiles.has(positionKey(cell)) && isKnownTile(cell))) continue;
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
    element.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      showDungeonObjectInfo(object);
    });
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
  return { x: 8, y: 1 };
}

function planningTablePosition() {
  return { x: 4, y: 8 };
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

function placePlanningTableToken() {
  const token = els.room.querySelector(".planning-table-token");
  if (!token) return;
  token.classList.toggle("hidden", state.mode !== "home");
  if (state.mode !== "home") return;
  const position = planningTablePosition();
  const scaledTileSizePx = currentTileSizePx();
  token.style.left = `${(position.x + 1) * scaledTileSizePx}px`;
  token.style.top = `${(position.y + 0.5) * scaledTileSizePx}px`;
  token.style.width = `${2 * scaledTileSizePx}px`;
  token.style.height = `${scaledTileSizePx}px`;
}

function placeToken(fighter) {
  ensureCombatantToken(fighter);
  const token = els.room.querySelector(`[data-combatant="${fighter.id}"]`);
  if (!token) return;

  const scaledTileSizePx = currentTileSizePx();
  token.style.left = `${(fighter.position.x + 0.5) * scaledTileSizePx}px`;
  token.style.top = `${(fighter.position.y + 0.5) * scaledTileSizePx}px`;
  const heroToken = isRosterHeroId(fighter.id);
  const visibleHero = heroToken && !fighter.dead && fighter.alive && (state.mode === "home" || isPartyHeroId(fighter.id));
  token.classList.toggle("hidden", heroToken ? !visibleHero : !fighter.alive || !isKnownTile(fighter.position));
  token.classList.toggle("defeated", !fighter.alive);
  token.classList.toggle("dragging", (fighter.id === dragHeroId || (heroToken && selectedHeroIds.has(fighter.id))) && Boolean(dragPath));
  token.classList.toggle("active-hero", fighter.id === activeHero()?.id);
  token.classList.toggle("selected-hero", heroToken && selectedHeroIds.has(fighter.id));
  token.classList.toggle("in-attack-range", !heroToken && attackTargets().some((target) => target.id === fighter.id));
  token.classList.toggle("selected-target", !heroToken && selectedAttackTarget()?.id === fighter.id);
  const spellTargeting = currentPendingSpellTargeting();
  token.classList.toggle("spell-click-target", isSpellTokenTargetable(spellTargeting, fighter));
  const art = combatantTokenArt(fighter);
  const tokenImage = token.querySelector(".token-art");
  const tokenLabel = token.querySelector(".token-label");
  if (tokenImage && tokenImage.getAttribute("src") !== art) {
    if (art) {
      tokenImage.src = art;
    } else {
      tokenImage.removeAttribute("src");
      tokenImage.classList.add("hidden");
      tokenLabel?.classList.remove("hidden");
      token.classList.remove("has-token-art");
    }
  }
  const hpFill = token.querySelector(".token-hp-fill");
  if (hpFill) {
    const hpPercent = Math.max(0, Math.round((fighter.hp / fighter.maxHp) * 100));
    hpFill.style.width = `${hpPercent}%`;
  }
}

function renderableFighters(activeTiles = activeTileKeys()) {
  const initiativeIds = new Set((state.initiative ?? []).map((entry) => entry.fighterId));
  return Object.values(state.fighters).filter((fighter) => {
    if (isRosterHeroId(fighter.id)) return true;
    if (!fighter.alive) return false;
    return showDungeonLayout || initiativeIds.has(fighter.id) || activeTiles.has(positionKey(fighter.position));
  });
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

  const hero = activeHero();
  const heroTurn = state.mode === "combat" && activeFighter()?.id === hero?.id && combatMonsters().length > 0;
  const activeTiles = activeTileKeys();
  const rememberedTiles = rememberedTileKeys();
  renderTileButtons(rememberedTiles);
  const walkable = currentWalkable();
  const doorKeys = new Set((state.dungeon?.doors ?? []).map(positionKey));
  const openedDoorKeys = new Set(state.exploration?.openedDoorKeys ?? []);
  const visibleWalls = exposedWallKeys();
  const spellTargeting = currentPendingSpellTargeting();
  const spellPreview = spellPreviewCells(spellTargeting);
  const reachable = heroTurn
      ? reachableTiles(hero, state.fighters, {
          gridSize: currentGridSize(),
          walkable,
          canTraverse: (from, to, path) => canTraverseMovementEdge(hero, from, to, path),
          stateKey: (position, path) => movementStateKey(hero, position, path),
          canEnterOccupied: (position) => canMoveThroughOccupiedTile(hero, position),
        })
      : state.mode === "exploration" || state.mode === "home"
        ? reachableTiles(hero, state.fighters, {
            gridSize: currentGridSize(),
            walkable: visibleWalkable(),
            maxCost: currentGridSize() * currentGridSize(),
            canTraverse: (from, to, path) => canTraverseMovementEdge(hero, from, to, path),
            stateKey: (position, path) => movementStateKey(hero, position, path),
            canEnterOccupied: (position) => canMoveThroughOccupiedTile(hero, position),
          })
        : new Map();

  perfStats.visibleTiles = rememberedTiles.size;
  perfStats.renderedTiles = renderedTileKeys.size;
  els.room.querySelectorAll(".tile").forEach((tile) => {
    const position = { x: Number(tile.dataset.x), y: Number(tile.dataset.y) };
    const key = positionKey(position);
    const isActiveTile = activeTiles.has(key);
    const isReachable = reachable.has(key);
    const isWalkable = walkable.has(key);
    const door = doorAt(position);
    const isDoor = doorKeys.has(key);
    const isKnown = isKnownTile(position);
    const isSeenWall = !isWalkable && visibleWalls.has(key);
    const pathIndex = dragPath?.findIndex((step) => positionKey(step) === key) ?? -1;
    const isAdminTeleportTarget = canAdminTeleportTo(position);
    const spellTargetAtTile = fighterAtPosition(position);
    const isSpellAffected = spellPreview.has(key);
    const isSpellOrigin = spellTargeting?.hoverPosition && positionKey(spellTargeting.hoverPosition) === key;
    const isSpellTargetable =
      spellTargeting?.mode === "point"
        ? isValidSpellPointTarget(spellTargeting.caster, spellTargeting.spell, position)
        : spellTargeting?.mode === "direction"
          ? Boolean(directionFromCasterToPosition(spellTargeting.caster, position))
          : isValidSpellTarget(spellTargeting?.caster, spellTargeting?.spell, spellTargetAtTile);
    tile.classList.toggle("walkable", isWalkable && isKnown);
    tile.classList.toggle("fog-memory", isKnown && !isActiveTile);
    tile.classList.toggle("hidden-tile", !isKnown && !isSeenWall);
    tile.classList.toggle("seen-wall", isSeenWall);
    tile.classList.toggle("door", isDoor && isKnown);
    tile.classList.toggle("door-north", isDoor && isKnown && door?.corridor?.y < position.y);
    tile.classList.toggle("door-east", isDoor && isKnown && door?.corridor?.x > position.x);
    tile.classList.toggle("door-south", isDoor && isKnown && door?.corridor?.y > position.y);
    tile.classList.toggle("door-west", isDoor && isKnown && door?.corridor?.x < position.x);
    tile.classList.toggle("open-door", isKnown && openedDoorKeys.has(key));
    tile.classList.toggle("reachable", isReachable && !(adminEnabled() && adminTeleportEnabled));
    tile.classList.toggle("path-preview", pathIndex >= 0);
    tile.classList.toggle("spell-targetable", Boolean(isSpellTargetable));
    tile.classList.toggle("spell-origin", Boolean(isSpellOrigin));
    tile.classList.toggle("spell-aoe-preview", isSpellAffected);
    tile.classList.toggle("spell-affected-occupied", isSpellAffected && Boolean(spellTargetAtTile));
    tile.textContent = pathIndex >= 0 ? String(pathIndex + 1) : "";
    const openableDoor = isActiveTile && Boolean(canOpenDoor(position));
    tile.classList.toggle("openable-door", openableDoor);
    tile.disabled = spellTargeting
      ? false
      : adminEnabled() && adminTeleportEnabled
        ? !isAdminTeleportTarget
        : ((!isReachable && !openableDoor) || !isKnown) && !dragPath;
    tile.title = spellTargeting
      ? isSpellAffected
        ? `${spellTargeting.spell.name} affects this square`
        : isSpellTargetable
          ? `Cast ${spellTargeting.spell.name} here`
          : ""
      : isAdminTeleportTarget
        ? "Admin teleport here"
        : openableDoor
          ? "Open door"
          : isReachable
            ? `${reachable.get(key) * feetPerSquare} ft`
            : "";
  });

  const renderable = renderableFighters(activeTiles);
  const renderableIds = new Set(renderable.map((fighter) => fighter.id));
  els.room.querySelectorAll("[data-combatant]").forEach((token) => {
    const id = token.dataset.combatant;
    if (!isRosterHeroId(id) && !renderableIds.has(id)) token.remove();
  });
  renderable.forEach(placeToken);
  perfStats.totalEntities = Object.values(state.fighters).length + (state.lootPiles?.length ?? 0) + (state.dungeonObjects?.length ?? 0);
  perfStats.activeEntities = renderable.length;
  perfStats.sleepingEntities = Math.max(0, aliveMonsters().length - renderable.filter((fighter) => !isRosterHeroId(fighter.id)).length);
  perfStats.renderedEntities = renderable.length;
  placeExitToken();
  placeHomeChestToken();
  placePlanningTableToken();
  renderLootPiles();
  renderDungeonObjects();
  renderWallEdges();
}

function renderHeroStatusCard(element, fighter) {
  refreshDerivedStats(fighter);
  const hpPercent = Math.max(0, Math.round((fighter.hp / fighter.maxHp) * 100));
  const weapon = activeWeapon(fighter);
  const armor = equippedItem(fighter, "torso");
  element.innerHTML = `
    <div class="fighter-top">
      ${combatantArtworkMarkup(fighter, "sidebar-hero-art")}
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
      ${(fighter.statusEffects ?? []).map((effect) => `<span class="status-pill status-dodge">${escapeHtml(effect.label ?? effect.id)}</span>`).join("")}
      ${fighter.hp <= 0 && !fighter.dead ? `<span class="status-pill status-dodge">Death saves ${fighter.deathSaves?.successes ?? 0}/3 | ${fighter.deathSaves?.failures ?? 0}/3</span>` : ""}
      ${fighter.dead ? '<span class="status-pill status-disengage">Dead</span>' : ""}
    </div>
    <div class="wallet-line">XP: ${fighter.xp ?? 0} / ${xpForNextLevel(fighter.level ?? 1)} - Hit Dice: ${fighter.hitDiceRemaining ?? 0}/${fighter.level ?? 1}${(fighter.spellPointMax ?? 0) > 0 ? ` - Spell Points: ${fighter.spellPoints ?? 0}/${fighter.spellPointMax ?? 0}` : ""} - Rests: ${state.shortRestsUsed ?? 0}/${state.shortRestLimit ?? 3} - Inventory: ${escapeHtml(moneyText(fighter.inventory.money))} - Hero Tokens: ${fighter.inventory.heroTokens ?? 0}</div>
  `;

  element.querySelector(".rename-hero").addEventListener("click", renameHero);
  element.querySelector(".open-inventory").addEventListener("click", showInventoryMenu);
}

async function renameHero() {
  const hero = activeHero();
  const identity = await showHeroIdentityDialog({
    title: "Character Name",
    message: "Rename your adventurer.",
    nameValue: hero.name,
    tokenArt: combatantTokenArt(hero),
    confirmText: "Rename",
  });
  if (!identity) return;

  hero.name = (identity.name || hero.name).slice(0, 32);
  hero.tokenArt = identity.tokenArt;
  hero.token = tokenFromName(hero.name, hero.token);
  addLog(`Character renamed to ${hero.name}.`, "important");
  render();
}

function showCombatantInfo(fighter) {
  refreshDerivedStats(fighter);
  const hpPercent = Math.max(0, Math.round((fighter.hp / fighter.maxHp) * 100));
  const weapon = activeWeapon(fighter);
  const profileRange = fighter.damage?.range ?? weapon?.range ?? { kind: "melee", feet: 5 };
  const range = `${profileRange.kind}${profileRange.feet ? ` ${profileRange.feet} ft` : ""}`;
  const weaponName = weapon?.name ?? fighter.damage?.weaponName ?? fighter.baseDamage?.weaponName ?? "Natural weapon";
  const abilities = ["str", "dex", "con", "int", "wis", "cha"];
  const traitLines = [
    fighter.speciesName ? `${fighter.speciesName}${fighter.subraceName ? ` - ${fighter.subraceName}` : ""}` : "",
    ...activeRaceFeatureLinesForFighter(fighter).slice(2),
  ].filter(Boolean);
  els.fighterInfoName.textContent = fighter.name;
  els.fighterInfoBody.innerHTML = `
    ${combatantArtworkMarkup(fighter, "inspect-art")}
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
      <div><b>Weapon</b><span>${escapeHtml(weaponName)}</span></div>
      <div><b>Damage</b><span>${escapeHtml(fighter.damage.label)}</span></div>
      <div><b>Range</b><span>${escapeHtml(range)}</span></div>
      ${traitLines.length ? `<div><b>Species</b><span>${escapeHtml(traitLines.join(" "))}</span></div>` : ""}
    </div>
    <div class="wallet-line">Money: ${escapeHtml(moneyText(fighter.inventory.money))} - Hero Tokens: ${fighter.inventory.heroTokens ?? 0}</div>
  `;
  els.fighterInfo.classList.remove("hidden");
}

function showDungeonObjectInfo(object) {
  const template =
    object.type === "homeChest"
      ? { name: "Home Chest", kind: "container", width: 1, height: 1, blocksMovement: true, interactable: true, description: "Your home storage chest." }
      : object.type === "dungeonExit"
        ? { name: "Dungeon Exit", kind: "exit", width: 1, height: 1, blocksMovement: false, interactable: true, description: "The way out. Reach it after clearing the exit room to complete the dungeon." }
        : object.type === "homeExit"
          ? { name: "Home Door", kind: "exit", width: 1, height: 1, blocksMovement: false, interactable: true, description: "The door leading from home to the next dungeon." }
      : objectTemplate(object.type);
  if (!template) return;
  const hero = activeHero();
  const objectAdjacent =
    object.type === "homeChest"
      ? distance(hero.position, homeChestPosition()) <= 1
      : object.type === "dungeonExit" || object.type === "homeExit"
        ? distance(hero.position, object.position) <= 1
        : objectCells(object).some((cell) => distance(hero.position, cell) === 1);
  const canActInCombat = state.mode !== "combat" || activeFighter()?.id === hero?.id;
  const canLootChest = object.type === "chest" && objectAdjacent && canActInCombat;
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
                <button type="button" data-action="home-deposit-all-coins" ${moneyToCp(hero.inventory.money) > 0 ? "" : "disabled"}>Deposit All</button>
                <button type="button" data-action="home-withdraw-all-coins" ${moneyToCp(state.chestMoney ?? {}) > 0 ? "" : "disabled"}>Withdraw All</button>
              </div>
            </div>
          </section>
          <section class="object-inventory">
            <h3>Bag</h3>
            <div class="chest-money-actions">
              <button type="button" data-action="home-store-all-items" ${unequippedInventoryItems(hero).length ? "" : "disabled"}>Deposit All</button>
            </div>
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
            <div class="chest-money-actions">
              <button type="button" data-action="home-take-all-items" ${chestItems.length ? "" : "disabled"}>Withdraw All</button>
            </div>
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
  const hero = activeHero();
  if (!trap) return false;

  const damageRoll = rollDice(trap.damage.count ?? 1, trap.damage.sides ?? 4);
  const rawDamage = damageRoll.total + (trap.damage.bonus ?? 0);
  if (adminEnabled() && adminGodMode) {
    chest.lastResult = `${hero.name} triggered ${trap.name}, but god mode prevented the damage.`;
    addLog(`${hero.name} triggers ${trap.name}. God mode prevents the damage.`, "important");
    delete chest.trap;
    return true;
  }
  const modified = calculateDamageModifiers(hero, rawDamage, trap.damage.type);
  applyDamageToFighter(hero, modified.damage);
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

function roleOptionsMarkup(selectedRole) {
  return ["tank", "dd", "heal"]
    .map((role) => `<option value="${role}" ${selectedRole === role ? "selected" : ""}>${role.toUpperCase()}</option>`)
    .join("");
}

function showPlanningTableInfo() {
  const activeIds = state.party?.heroIds ?? ["hero"];
  const rosterIds = state.party?.rosterIds ?? activeIds;
  const benchIds = rosterIds.filter((id) => !activeIds.includes(id));
  const slotMarkup = Array.from({ length: 4 }, (_, index) => {
    const heroId = activeIds[index];
    const hero = heroId ? state.fighters[heroId] : null;
    return `
      <div class="planning-slot">
        <div>
          <b>${index + 1}. ${hero ? escapeHtml(hero.name) : "Empty Slot"}</b>
          <span>${hero ? `${hero.dead ? "Dead" : `Level ${hero.level ?? 1}`}${index === 0 ? " - Main" : ""}` : "Add a hero from the roster"}</span>
        </div>
        ${
          hero
            ? `<select data-action="party-role" data-hero="${escapeAttribute(hero.id)}">${roleOptionsMarkup(partyRoleFor(hero))}</select>
               <button type="button" data-action="make-main-hero" data-hero="${escapeAttribute(hero.id)}" ${index === 0 || hero.dead ? "disabled" : ""}>Main</button>
               <button type="button" data-action="remove-party-hero" data-hero="${escapeAttribute(hero.id)}" ${activeIds.length <= 1 ? "disabled" : ""}>Remove</button>`
            : ""
        }
      </div>
    `;
  }).join("");
  const benchMarkup = benchIds.length
    ? benchIds
        .map((id) => {
          const hero = state.fighters[id];
          if (!hero) return "";
          return `
            <div class="planning-slot bench-slot">
              <div>
                <b>${escapeHtml(hero.name)}</b>
                <span>${hero.dead ? "Dead" : `Level ${hero.level ?? 1}`}</span>
              </div>
              <select data-action="party-role" data-hero="${escapeAttribute(hero.id)}">${roleOptionsMarkup(partyRoleFor(hero))}</select>
              <button type="button" data-action="add-party-hero" data-hero="${escapeAttribute(hero.id)}" ${activeIds.length >= 4 || hero.dead ? "disabled" : ""}>Add</button>
            </div>
          `;
        })
        .join("")
    : `<p class="empty-note">No reserve heroes yet.</p>`;

  els.fighterInfoName.textContent = "Planning Table";
  els.fighterInfoBody.innerHTML = `
    <div class="object-description">Choose the active party and set each hero's role before leaving home.</div>
    <section class="planning-party">
      <h3>D20 Luck</h3>
      <label class="inline-transfer">
        <span>Friendly d20 rolls</span>
        <select data-action="d20-mode">${d20ModeOptionsMarkup()}</select>
      </label>
    </section>
    <section class="planning-party">
      <h3>Active Party</h3>
      ${slotMarkup}
    </section>
    <section class="planning-party">
      <h3>Hero Roster</h3>
      ${benchMarkup}
    </section>
    <div class="object-actions">
      <button type="button" data-action="create-roster-hero">Create New Hero</button>
    </div>
  `;
  els.fighterInfo.classList.remove("hidden");
}

function defaultPartyRoleForHero(hero) {
  const role = hero?.classRole ?? hero?.className ?? hero?.class ?? "fighter";
  return String(role).toLowerCase().includes("fighter") ? "tank" : "dd";
}

async function createRosterHero() {
  let chosenName = "";
  let heroOptions = null;
  let chosenTokenArt = "";
  let raceSelection = defaultRaceSelection;
  let classId = defaultContent.heroClass;
  while (!heroOptions) {
    const identity = await showHeroIdentityDialog({
      title: "New Hero Name",
      message: "Name the new hero for your roster.",
      nameValue: chosenName || "New Hero",
      tokenArt: chosenTokenArt,
      confirmText: "Create Hero",
    });
    if (!identity) {
      showPlanningTableInfo();
      return;
    }
    chosenName = identity.name || "New Hero";
    chosenTokenArt = identity.tokenArt;
    const chosenClass = await showHeroClassDialog();
    if (chosenClass === dialogBackValue) {
      heroOptions = null;
      continue;
    }
    if (!chosenClass) {
      showPlanningTableInfo();
      return;
    }
    classId = chosenClass;
    const chosenRace = await showHeroRaceDialog({ selection: raceSelection });
    if (chosenRace === dialogBackValue) {
      heroOptions = null;
      continue;
    }
    if (!chosenRace) {
      showPlanningTableInfo();
      return;
    }
    raceSelection = chosenRace;
    heroOptions = await createCharacterOptions(raceSelection, classId);
    if (heroOptions === dialogBackValue) {
      heroOptions = null;
      continue;
    }
  }
  if (!heroOptions) {
    showPlanningTableInfo();
    return;
  }
  const heroId = `hero-${Date.now()}`;
  const hero = createCombatant(
    applyHeroCreationOptions(
      {
        ...getHeroTemplate(classId),
        id: heroId,
        name: chosenName.trim() || "New Hero",
        tokenArt: chosenTokenArt,
        position: planningTablePosition(),
      },
      { ...heroOptions, raceSelection, classId },
    ),
  );
  hero.id = heroId;
  hero.token = tokenFromName(hero.name, hero.token);
  hero.partyRole = defaultPartyRoleForHero(hero);
  const rosterIds = new Set(state.party.rosterIds ?? state.party.heroIds ?? ["hero"]);
  rosterIds.add(heroId);
  state.party.rosterIds = Array.from(rosterIds);
  state.fighters[heroId] = prepareRestedHero(hero, homeHeroPositions(state.party.rosterIds).find((entry) => entry.id === heroId)?.position ?? { x: 4, y: 6 });
  roomIsBuilt = false;
  addLog(`${hero.name} joins the roster.`, "important");
  render();
  showPlanningTableInfo();
}

function addHeroToParty(heroId) {
  if (!state.fighters[heroId] || state.fighters[heroId].dead || isPartyHeroId(heroId) || (state.party.heroIds?.length ?? 0) >= 4) return;
  state.party.heroIds = [...(state.party.heroIds ?? ["hero"]), heroId].slice(0, 4);
  state.party.activeHeroId = state.party.activeHeroId ?? heroId;
  addLog(`${state.fighters[heroId].name} joins the active party.`, "important");
  render();
  showPlanningTableInfo();
}

function removeHeroFromParty(heroId) {
  if ((state.party.heroIds ?? []).length <= 1) return;
  state.party.heroIds = (state.party.heroIds ?? ["hero"]).filter((id) => id !== heroId);
  if (state.party.heroIds.length === 0) state.party.heroIds = ["hero"];
  if (state.party.activeHeroId === heroId) state.party.activeHeroId = state.party.heroIds[0];
  addLog(`${state.fighters[heroId]?.name ?? "Hero"} leaves the active party.`, "important");
  render();
  showPlanningTableInfo();
}

function makeMainHero(heroId) {
  if (!isPartyHeroId(heroId) || state.fighters[heroId]?.dead) return;
  promoteMainHero(heroId);
  addLog(`${state.fighters[heroId].name} takes the main party slot.`, "important");
  render();
  showPlanningTableInfo();
}

function setHeroRole(heroId, role) {
  if (!["tank", "dd", "heal"].includes(role) || !state.fighters[heroId]) return;
  state.fighters[heroId].partyRole = role;
  render();
}

function setD20Mode(mode) {
  const nextMode = normalizeD20Mode(mode);
  state.d20Mode = nextMode;
  state.d20FailureStreak = 0;
  addLog(`D20 luck set to ${d20ModeLabels[nextMode]}.`, "important");
  render();
}

function takeObjectItem(objectId, itemId) {
  if (objectId === "home-chest") {
    moveChestItemToInventory(itemId);
    showHomeChestInfo();
    return;
  }

  const object = dungeonObjectForId(objectId);
  if (!object || object.type !== "chest") return;
  const hero = activeHero();
  if ((state.mode === "combat" && activeFighter()?.id !== hero.id) || !objectCells(object).some((cell) => distance(hero.position, cell) === 1)) {
    addLog(`${hero.name} needs to be next to the chest to loot it${state.mode === "combat" ? " on their turn" : ""}.`);
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

function storeAllHomeChestItems() {
  unequippedInventoryItems(activeHero())
    .map((item) => item.id)
    .forEach(moveInventoryItemToChest);
  showHomeChestInfo();
}

function takeAllHomeChestItems() {
  (state.chest ?? [])
    .map((item) => item.id)
    .forEach(moveChestItemToInventory);
  showHomeChestInfo();
}

function disarmTrap(objectId) {
  const object = dungeonObjectForId(objectId);
  const hero = activeHero();
  if (!object || state.mode === "combat" || !objectCells(object).some((cell) => distance(hero.position, cell) === 1)) return;

  const trap = object.type === "chest" ? object.trap : object;
  if (!trap || !trap.detected || trap.armed === false || trap.disarmed) return;

  const roll = rollD20ForFighter(hero).roll;
  const bonus = abilityMod(hero, "int");
  const total = roll + bonus;
  const dc = trap.spotDc ?? 12;
  if (trap.disarmAttempted) return;
  trap.disarmAttempted = true;
  const attemptText = `${hero.name} attempts to disarm the trap: INT ${roll} ${abilityLabel(bonus)} = ${total} vs DC ${dc}.`;
  object.lastResult = attemptText;
  addLog(attemptText, "important");
  if (total >= dc) {
    recordD20OutcomeForFighter(hero, true);
    if (object.type === "chest") {
      delete object.trap;
    } else {
      trap.disarmed = true;
      trap.armed = false;
      trap.spent = false;
    }
    object.lastResult += " The trap is disarmed.";
    addLog("The trap is disarmed.", "important");
    awardHeroXp(25, "disarming a trap");
  } else {
    recordD20OutcomeForFighter(hero, false);
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
  const objectRoom = roomForPosition(object.position);
  const blockedKeys = new Set([
    ...blockingObjectKeys(),
    ...Object.values(state.fighters)
      .filter((fighter) => fighter.alive)
      .map((fighter) => positionKey(fighter.position)),
  ]);
  const position = objectRoom
    ? safeRoomSpawnCell(objectRoom, activeHero().position, blockedKeys, currentGridSize(), spawnFloorKeysForDungeon())
    : nearestOpenCellAroundObject(object);
  if (!position) {
    addLog("Something stirs nearby, but there is no space for it to emerge.");
    object.lastResult = "Something stirs nearby, but there is no space for it to emerge.";
    return null;
  }

  const monsterTemplate = getMonsterTemplate(pickWeightedMonsterId(weightedMonsterIdsForHero(activeHero())));
  const monster = createCombatant({
    ...monsterTemplate,
    id: `ambush-${Date.now()}`,
    name: `${monsterTemplate.name} Ambusher`,
    position,
  });
  applyMonsterCategoryScaling(monster, activeHero());
  monster.roomId = roomForPosition(position)?.id ?? "ambush";
  state.fighters[monster.id] = monster;
  addLog(`${monster.name} bursts from hiding near the furniture.`, "important");
  object.lastResult = `${monster.name} bursts from hiding near the furniture.`;
  return monster;
}

function investigateObject(objectId) {
  const object = dungeonObjectForId(objectId);
  const hero = activeHero();
  const template = object ? objectTemplate(object.type) : null;
  if (!object || template?.kind !== "furniture" || object.investigated || state.mode === "combat") return;
  if (!objectCells(object).some((cell) => distance(hero.position, cell) === 1)) return;

  object.investigated = true;
  const roll = rollD20ForFighter(hero).roll;
  const bonus = abilityMod(hero, "int");
  const total = roll + bonus;
  recordD20OutcomeForFighter(hero, total >= 13);
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
  const magicText = item.magic ? magicItemDetails(item) : "";
  const chargeText = item.use?.charges ? `; charges ${item.use.charges.remaining ?? item.use.charges.max}/${item.use.charges.max} (${item.use.charges.refresh})` : "";
  const starterText = item.starterEquipment ? "; starter equipment, no resale value" : "";
  if (item.type === "weapon") {
    const ability = attackAbilityForWeapon(item, activeHero());
    const bonus = abilityMod(activeHero(), ability);
    const damage = formatDamage({ ...item.damage, bonus });
    const range = item.range ? `${item.range.kind}${item.range.feet ? ` ${item.range.feet} ft` : ""}` : "melee";
    const propertyText = item.properties?.length ? `; ${item.properties.join(", ")}` : "";
    return `${damage}, ${range}${propertyText}${magicText}${cost}${weight}${starterText}`;
  }
  if (item.type === "armor") {
    const ac = item.armor?.bonus ? `+${item.armor.bonus} AC` : `AC ${item.armor?.base ?? "?"}`;
    const req = item.requirements?.strength ? `; Str ${item.requirements.strength}` : "";
    const stealth = item.stealthDisadvantage ? "; stealth disadvantage" : "";
    return `${ac}${req}${stealth}${magicText}${cost}${weight}${starterText}`;
  }
  if (item.type === "ammunition") {
    return `${item.ammo?.quantity ?? 0} ${item.ammo?.kind ?? "ammo"}${cost}${weight}${starterText}`;
  }
  if (item.type === "consumable") {
    if (item.use?.kind === "healing") {
      return `${item.use.dice.count}d${item.use.dice.sides} + ${item.use.bonus} HP; ${item.use.resource === "bonusAction" ? "bonus action" : "action"}${chargeText}${cost}${weight}${starterText}`;
    }
    return `${item.category ?? "Consumable"}; ${item.use?.resource === "bonusAction" ? "bonus action" : "action"}${chargeText}${cost}${weight}${starterText}`;
  }
  if (item.type === "accessory") return `${magicText.replace(/^; /, "") || item.loot?.rarity || "magic"}${chargeText}${cost}${weight}${starterText}`;
  if (item.type === "treasure") return `${item.treasure?.kind ?? item.category ?? "treasure"}; value ${item.cost?.text ?? priceText(item.treasure?.valueCp ?? 0)}${weight}${starterText}`;
  return item.type ?? "Item";
}

function itemInventoryText(item) {
  const description = item?.magic?.description || item?.treasure?.description || item?.description;
  const starterWarning = item?.starterEquipment ? " Starter equipment has no resale value." : "";
  if (!description) return itemDetails(item);
  const chargeText = item.use?.charges ? ` Charges ${item.use.charges.remaining ?? item.use.charges.max}/${item.use.charges.max} (${item.use.charges.refresh}).` : "";
  return `${description}${chargeText}${starterWarning}`;
}

function showInventoryItemInfo(itemId) {
  const item =
    itemForId(activeHero(), itemId) ??
    chestItemForId(itemId) ??
    (state.chest ?? []).find((entry) => entry.id === itemId) ??
    getItemTemplate(itemId);
  if (!item) return;
  els.fighterInfoName.textContent = item.name;
  els.fighterInfoBody.innerHTML = `
    <div class="combatant-card">
      <p>${escapeHtml(itemInventoryText(item))}</p>
      <div class="stat-grid">
        <div class="stat-pill"><b>${escapeHtml(item.type ?? "item")}</b><span>Type</span></div>
        <div class="stat-pill"><b>${escapeHtml(item.category ?? item.magic?.kind ?? item.treasure?.kind ?? "-")}</b><span>Kind</span></div>
        <div class="stat-pill"><b>${escapeHtml(item.cost?.text ?? priceText(itemValueCp(item)))}</b><span>Value</span></div>
        <div class="stat-pill"><b>${escapeHtml(item.weightLb || item.weightLb === 0 ? `${item.weightLb} lb.` : "-")}</b><span>Weight</span></div>
      </div>
      <h3>Stats</h3>
      <p>${escapeHtml(itemDetails(item))}</p>
      ${
        item.tags?.length
          ? `<h3>Tags</h3><p>${escapeHtml(item.tags.join(", "))}</p>`
          : ""
      }
    </div>
  `;
  els.fighterInfo.classList.remove("hidden");
}

function magicItemDetails(item) {
  const magic = item.magic ?? {};
  const effects = magic.effects ?? {};
  const parts = [];
  if (magic.rarity) parts.push(magic.rarity);
  if (magic.attackBonus) parts.push(`+${magic.attackBonus} attack`);
  if (magic.damageBonus) parts.push(`+${magic.damageBonus} damage`);
  if (effects.acBonus) parts.push(`+${effects.acBonus} AC`);
  if (effects.maxHpBonus) parts.push(`+${effects.maxHpBonus} max HP`);
  if (effects.speedBonusFeet) parts.push(`${abilityLabel(effects.speedBonusFeet)} ft speed`);
  if (effects.initiativeBonus) parts.push(`${abilityLabel(effects.initiativeBonus)} initiative`);
  for (const [ability, value] of Object.entries(effects.abilityScoreBonuses ?? {})) parts.push(`${ability.toUpperCase()} ${abilityLabel(value)}`);
  for (const [ability, value] of Object.entries(effects.abilityScorePenalties ?? {})) parts.push(`${ability.toUpperCase()} ${abilityLabel(value)}`);
  const resistances = [...(effects.resistances ?? []), ...(magic.resistances ?? [])];
  const vulnerabilities = [...(effects.vulnerabilities ?? []), ...(magic.vulnerabilities ?? [])];
  if (resistances.length) parts.push(`resist ${resistances.join(", ")}`);
  if (vulnerabilities.length) parts.push(`vulnerable ${vulnerabilities.join(", ")}`);
  const extraDamage = [...(effects.extraDamage ?? []), ...(magic.extraDamage ?? [])];
  if (extraDamage.length) parts.push(`extra ${extraDamage.map((entry) => `${entry.count}d${entry.sides} ${entry.type}`).join(", ")}`);
  if (magic.curse || effects.vulnerabilities?.length) parts.push("cursed");
  return parts.length ? `; ${parts.join("; ")}` : "";
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
    item.magic?.rarity,
    item.loot?.rarity,
    item.treasure?.kind,
    item.treasure?.valueGp,
    ...(item.properties ?? []),
    ...(item.tags ?? []),
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

function searchableMonsterText(monster) {
  return [
    monster.id,
    monster.name,
    monster.role,
    monster.behavior,
    monster.category,
    monster.cat,
    ...(monster.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function adminCatalogMonsters() {
  const query = adminMonsterSearch.trim().toLowerCase();
  return window.DungeonContent
    .list("monsters")
    .filter((monster) => !query || searchableMonsterText(monster).includes(query))
    .sort((a, b) => monsterCategory(a) - monsterCategory(b) || a.name.localeCompare(b.name));
}

function renderAdminMonsterCatalog() {
  const monsters = adminCatalogMonsters();
  return `
    <section class="admin-catalog admin-monster-catalog" aria-label="Admin monster catalogue">
      <div class="admin-catalog-top">
        <label for="admin-monster-search">Spawn Monster</label>
        <button class="admin-toggle ${adminMonsterCatalogOpen ? "active" : ""}" type="button" data-action="toggle-admin-monsters">
          ${adminMonsterCatalogOpen ? "Hide" : "Show"}
        </button>
      </div>
      ${
        adminMonsterCatalogOpen
          ? `
            <input id="admin-monster-search" type="search" placeholder="Search monsters" value="${escapeAttribute(adminMonsterSearch)}" />
            <div class="admin-monster-grid">
              ${
                monsters.length
                  ? monsters
                      .map(
                        (monster) => `
                          <button type="button" data-action="spawn-admin-monster" data-monster="${escapeAttribute(monster.id)}">
                            <b>${escapeHtml(monster.name)}</b>
                            <span>Cat ${monsterCategory(monster)} - ${escapeHtml(monster.role ?? monster.behavior ?? "monster")}</span>
                          </button>
                        `,
                      )
                      .join("")
                  : `<p class="empty-note">No matching monsters.</p>`
              }
            </div>
          `
          : `<p class="empty-note">Monster catalog hidden.</p>`
      }
    </section>
  `;
}

function renderAdminModeTools() {
  if (!adminEnabled()) return "";

  return `
    <section class="admin-catalog" aria-label="Admin controls">
      <div class="admin-coin-row" aria-label="Admin toggles">
        <button class="admin-toggle ${adminTeleportEnabled ? "active" : ""}" type="button" data-action="toggle-admin-teleport">
          ${adminTeleportEnabled ? "Teleport On" : "Teleport Off"}
        </button>
        <button class="admin-toggle ${adminGodMode ? "active" : ""}" type="button" data-action="toggle-admin-god">
          ${adminGodMode ? "God Mode On" : "God Mode Off"}
        </button>
        <button type="button" data-action="admin-heal">Full Heal</button>
        <button type="button" data-action="admin-refresh">Refresh Actions</button>
        <button type="button" data-action="admin-reveal-current-room">Reveal Room</button>
        <button type="button" data-action="admin-clear-combat">Clear Combat</button>
      </div>
    </section>
    ${renderAdminMonsterCatalog()}
  `;
}

function renderAdminItemCatalog() {
  if (!adminEnabled() || !inventoryAdminOpen) return "";

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
  addMoney(activeHero().inventory.money, cpAmount);
  addLog(`Added ${moneyText(cpToMoney(cpAmount))}.`, "important");
  render();
  renderInventoryMenu();
}

function addAdminXp(xpAmount) {
  const hero = activeHero();
  hero.xp = (hero.xp ?? 0) + xpAmount;
  addLog(`Added ${xpAmount} XP to ${hero.name}.`, "important");
  render();
  renderInventoryMenu();
}

function freeAdminSpawnPosition() {
  const hero = activeHero();
  const room = roomForPosition(hero.position);
  const visibleCells = Array.from(visibleWalkable()).map(positionFromKey);
  const blockedKeys = new Set([
    ...blockingObjectKeys(),
    ...Object.values(state.fighters)
      .filter((fighter) => fighter.alive)
      .map((fighter) => positionKey(fighter.position)),
  ]);
  const candidates = room ? roomSpawnCells(room, blockedKeys, currentGridSize(), spawnFloorKeysForDungeon()) : visibleCells;
  const currentKey = positionKey(hero.position);

  return candidates
    .slice()
    .sort((a, b) => distance(a, hero.position) - distance(b, hero.position))
    .find(
    (position) =>
      window.DungeonGrid.isInsideGrid(position, currentGridSize()) &&
      currentWalkable().has(positionKey(position)) &&
      positionKey(position) !== currentKey &&
      isKnownTile(position) &&
      !window.DungeonGrid.isOccupied(position, state.fighters),
  );
}

function addMonsterToInitiative(monster) {
  const currentActiveId = activeFighter()?.id;
  const roll = rollDie(20);
  state.initiative.push({
    fighterId: monster.id,
    roll,
    total: roll + monster.initiativeBonus,
  });
  state.initiative.sort((a, b) => b.total - a.total || (isPartyHeroId(a.fighterId) ? -1 : 1));
  state.activeIndex = Math.max(0, state.initiative.findIndex((entry) => entry.fighterId === currentActiveId));
}

function spawnAdminMonster(monsterId) {
  if (!adminEnabled()) return;
  const template = getMonsterTemplate(monsterId);
  const position = template ? freeAdminSpawnPosition() : null;
  if (!template || !position) {
    addLog("Admin: no open space for that monster.", "important");
    render();
    renderInventoryMenu();
    return;
  }

  const spawnRoom = roomForPosition(position);
  const hero = activeHero();
  const spawnCount = template.behavior === "swarm" && spawnRoom ? swarmSpawnCount(template, hero) : 1;
  const blockedKeys = new Set([...blockingObjectKeys(), ...Object.values(state.fighters).filter((fighter) => fighter.alive).map((fighter) => positionKey(fighter.position))]);
  const positions = spawnRoom ? clusteredSpawnCells(spawnRoom, spawnCount, hero.position, blockedKeys, currentGridSize(), spawnFloorKeysForDungeon()) : [position];
  const spawned = positions.slice(0, Math.min(spawnCount, positions.length)).map((spawnPosition, index) => {
    adminItemInstanceCounter += 1;
    const monster = createCombatant({
      ...template,
      id: `admin-monster-${template.id}-${Date.now()}-${adminItemInstanceCounter}`,
      name: `${template.name}${spawnCount > 1 ? ` ${index + 1}` : ""} (Admin)`,
      position: spawnPosition,
    });
    applyMonsterCategoryScaling(monster, hero);
    monster.roomId = roomForPosition(spawnPosition)?.id ?? "admin-spawn";
    state.fighters[monster.id] = monster;
    return monster;
  });
  if (spawned.length === 0) {
    addLog("Admin: no open room floor for that monster.", "important");
    render();
    renderInventoryMenu();
    return;
  }
  addLog(`Admin spawned ${spawned.length} ${template.name}${spawned.length === 1 ? "" : "s"}. Roll initiative before the character acts.`, "important");

  if (state.mode === "combat" && state.combatStarted) {
    spawned.forEach(addMonsterToInitiative);
  } else {
    state.combatStarted = false;
    state.mode = "exploration";
    state.initiative = [];
    state.activeIndex = 0;
  }

  render();
  renderInventoryMenu();
}

function adminRevealCurrentRoom() {
  const heroRoom = roomForPosition(activeHero().position);
  if (!heroRoom) return;
  const discovered = new Set(state.exploration?.discoveredRoomIds ?? []);
  discovered.add(heroRoom.id);
  state.exploration.discoveredRoomIds = Array.from(discovered);
  addLog(`Admin revealed ${heroRoom.name}.`, "important");
  render();
  renderInventoryMenu();
}

function adminFullHeal() {
  const hero = activeHero();
  hero.hp = hero.maxHp;
  hero.alive = true;
  addLog("Admin restored the character to full HP.", "important");
  render();
  renderInventoryMenu();
}

function adminRefreshActions() {
  resetTurnResources(activeHero());
  addLog("Admin refreshed movement, action, and bonus action.", "important");
  render();
  renderInventoryMenu();
}

function adminClearCombat() {
  state.combatStarted = false;
  state.initiative = [];
  state.activeIndex = 0;
  if (state.mode === "combat") state.mode = "exploration";
  partyHeroes().forEach(resetTurnResources);
  addLog("Admin cleared turn order.", "important");
  render();
  renderInventoryMenu();
}

function createAdminInventoryItem(templateId) {
  return createItemInstance(templateId, "admin");
}

function addAdminItemToInventory(templateId) {
  const hero = activeHero();
  const item = createAdminInventoryItem(templateId);
  if (!item) return;

  addItemToInventory(hero, item, "admin-stack");
  addLog(`Added ${item.name} to inventory.`, "important");
  render();
  renderInventoryMenu();
}

function addAdminItemToSlot(templateId, slotId) {
  const hero = activeHero();
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
  const hero = activeHero();
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
  const hero = activeHero();
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
  addItemToInventory(activeHero(), item, "chest-stack");
  render();
  renderInventoryMenu();
}

function moveMoneyBetweenHeroAndChest(direction, cpAmount) {
  if (state.mode !== "home" || cpAmount <= 0) return;
  const heroMoney = activeHero().inventory.money;
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

  const available = direction === "deposit" ? activeHero().inventory.money : state.chestMoney;
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

  const available = direction === "deposit" ? activeHero().inventory.money : state.chestMoney;
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
      <span>${escapeHtml(itemInventoryText(item))}</span>
      <button type="button" data-action="inspect-item" data-item="${escapeAttribute(item.id)}">Inspect</button>
    </div>
  `;
}

function renderInventoryMenu() {
  const fighter = activeHero();
  refreshDerivedStats(fighter);
  const equippedIds = new Set(Object.values(fighter.equipment).filter(Boolean));
  const carriedItems = fighter.inventory.items.filter((item) => !equippedIds.has(item.id));
  const chestItems = state.chest ?? [];
  const chestMoney = normalizeMoney(state.chestMoney ?? {});

  els.inventoryBody.innerHTML = `
    <div class="inventory-stats">
      ${combatantArtworkMarkup(fighter, "inventory-hero-art")}
      <div class="stat-pill"><b>${fighter.ac}</b><span>AC</span></div>
      <div class="stat-pill"><b>${escapeHtml(fighter.damage.label)}</b><span>Damage</span></div>
      ${
        adminEnabled()
          ? `<button class="admin-toggle ${inventoryAdminOpen ? "active" : ""}" type="button" data-action="toggle-admin">
              ${inventoryAdminOpen ? "Hide Vault" : "Item Vault"}
            </button>`
          : ""
      }
      <div class="wallet-line">${escapeHtml(moneyText(fighter.inventory.money))} - Hero Tokens: ${fighter.inventory.heroTokens ?? 0}</div>
    </div>
    ${renderAdminModeTools()}
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
                      ${transferControlsForItem(fighter, item)}
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

function itemTransferRangeFeet() {
  return state.mode === "combat" ? 20 : 60;
}

function itemTransferTargets(source = activeHero()) {
  if (!source?.alive) return [];
  const candidates = state.mode === "home" ? rosterHeroes() : partyHeroes();
  const maxSquares = itemTransferRangeFeet() / feetPerSquare;
  return candidates
    .filter((hero) => hero.id !== source.id && hero.alive && !hero.dead)
    .filter((hero) => distance(source.position, hero.position) <= maxSquares);
}

function transferControlsForItem(fighter, item) {
  const targets = itemTransferTargets(fighter);
  if (!targets.length) return "";
  return `
    <label class="inline-transfer">
      <span>Give</span>
      <select data-transfer-target="${escapeAttribute(item.id)}">
        ${targets.map((hero) => `<option value="${escapeAttribute(hero.id)}">${escapeHtml(hero.name)}</option>`).join("")}
      </select>
    </label>
    <button type="button" data-action="give-item" data-item="${escapeAttribute(item.id)}">Give</button>
  `;
}

function transferInventoryItem(itemId, targetId) {
  const source = activeHero();
  const target = state.fighters[targetId];
  const item = itemForId(source, itemId);
  if (!source || !target || !item) return;
  if (Object.values(source.equipment ?? {}).includes(itemId)) {
    addLog("Unequip an item before giving it to another hero.");
    return;
  }
  if (!itemTransferTargets(source).some((hero) => hero.id === target.id)) {
    addLog(`${target.name} is too far away to receive ${item.name}.`, "important");
    renderInventoryMenu();
    return;
  }

  source.inventory.items = source.inventory.items.filter((entry) => entry.id !== itemId);
  addItemToInventory(target, item, "transfer-stack");
  addLog(`${source.name} gives ${item.name} to ${target.name}.`, "important");
  refreshDerivedStats(source);
  refreshDerivedStats(target);
  render();
  renderInventoryMenu();
}

function showInventoryMenu() {
  clearHeldMovementKeys();
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

function usableEquippedItems(fighter = state.fighters.hero) {
  const seen = new Set();
  return equipmentSlots
    .map((slot) => ({ slot, item: equippedItem(fighter, slot.id) }))
    .filter((entry) => {
      if (!entry.item?.use || seen.has(entry.item.id)) return false;
      seen.add(entry.item.id);
      return true;
    });
}

function itemUseResource(item) {
  return item?.use?.resource ?? "action";
}

function ensureItemCharges(item) {
  if (!item?.use?.charges) return item;
  item.use.charges.remaining = Math.min(item.use.charges.max ?? 1, item.use.charges.remaining ?? item.use.charges.max ?? 1);
  return item;
}

function itemHasCharges(item) {
  ensureItemCharges(item);
  return !item?.use?.charges || (item.use.charges.remaining ?? 0) > 0;
}

function spendItemCharge(item) {
  ensureItemCharges(item);
  if (!item?.use?.charges) return true;
  if ((item.use.charges.remaining ?? 0) <= 0) return false;
  item.use.charges.remaining -= 1;
  return true;
}

function refreshItemChargesForFighter(fighter, refresh) {
  for (const item of fighter?.inventory?.items ?? []) {
    if (item.use?.charges?.refresh === refresh) item.use.charges.remaining = item.use.charges.max ?? 1;
  }
}

function refreshPartyItemCharges(refresh) {
  rosterHeroes().forEach((hero) => refreshItemChargesForFighter(hero, refresh));
}

function canUseBeltItem(fighter, item) {
  if (!fighter || !item || !heroCanAct(fighter)) return false;
  if (!itemHasCharges(item)) return false;
  if (state.mode !== "combat") return true;
  const resource = itemUseResource(item);
  return resource === "bonusAction" ? fighter.hasBonusAction : fighter.hasAction;
}

function canUseHealingItemOnTarget(actor, item, target) {
  if (!actor || !target || !item || item.use?.kind !== "healing") return false;
  if (!itemHasCharges(item)) return false;
  if (!heroCanAct(actor) || target.dead || target.hp > 0) return false;
  if (!isPartyHeroId(actor.id) || !isPartyHeroId(target.id) || actor.id === target.id) return false;
  if (state.mode === "combat" && !actor.hasAction) return false;
  return hasMeleeAccess(actor, target);
}

function dyingPotionTargets(actor, item) {
  if (item?.use?.kind !== "healing") return [];
  return partyHeroes().filter((target) => canUseHealingItemOnTarget(actor, item, target));
}

function renderUseItemMenu() {
  const hero = state.mode === "combat" ? activeFighter() : activeHero();
  const entries = usableEquippedItems(hero);
  els.useItemBody.innerHTML = entries.length
    ? `
      <div class="use-item-list">
        ${entries
          .map(({ slot, item }) => {
            const disabled = canUseBeltItem(hero, item) ? "" : "disabled";
            const targetButtons = dyingPotionTargets(hero, item)
              .map((target) => {
                const targetDisabled = canUseHealingItemOnTarget(hero, item, target) ? "" : "disabled";
                return `<button type="button" data-action="use-belt-item" data-item="${item.id}" data-target="${target.id}" ${targetDisabled}>Use on ${escapeHtml(target.name)}</button>`;
              })
              .join("");
            return `
              <div class="use-item-row">
                <div>
                  <b>${escapeHtml(item.name)}</b>
                  <span>${escapeHtml(slot.label)} - ${escapeHtml(itemDetails(item))}</span>
                </div>
                <div class="use-item-actions">
                  <button type="button" data-action="use-belt-item" data-item="${item.id}" ${disabled}>Use</button>
                  ${targetButtons}
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    `
    : `<p class="empty-note">No usable equipped items.</p>`;
}

function showUseItemMenu() {
  renderUseItemMenu();
  els.useItemMenu.classList.remove("hidden");
}

function hideUseItemMenu() {
  els.useItemMenu.classList.add("hidden");
}

function adjacentDyingHeroes(fighter) {
  if (!fighter || state.mode !== "combat") return [];
  return partyHeroes().filter(
    (hero) =>
      hero.id !== fighter.id &&
      hero.alive &&
      !hero.dead &&
      hero.hp <= 0 &&
      hasMeleeAccess(fighter, hero),
  );
}

function medicineTargetsMarkup(fighter) {
  const targets = adjacentDyingHeroes(fighter);
  if (!targets.length) {
    return `<button type="button" data-action="combat-action" data-combat-action="medicine" disabled>Medicine Check</button>`;
  }
  return targets
    .map(
      (target) =>
        `<button type="button" data-action="combat-action" data-combat-action="medicine" data-target="${target.id}" ${fighter.hasAction ? "" : "disabled"}>Medicine: ${escapeHtml(target.name)}</button>`,
    )
    .join("");
}

function renderActionMenu() {
  const fighter = activeFighter();
  const canUseAttackAction = Boolean(fighter?.hasAction);
  els.actionMenuBody.innerHTML = fighter && heroCanAct(fighter) && state.mode === "combat"
    ? `
      <div class="action-options">
        <button type="button" data-action="combat-action" data-combat-action="dash" ${canUseAttackAction ? "" : "disabled"}>Dash</button>
        <p>Gain extra movement equal to your base movement. Consumes your Attack action.</p>
        <button type="button" data-action="combat-action" data-combat-action="dodge" ${canUseAttackAction ? "" : "disabled"}>Dodge</button>
        <p>Attacks against you have disadvantage until your next turn. Consumes your Attack action.</p>
        <button type="button" data-action="combat-action" data-combat-action="disengage" ${canUseAttackAction ? "" : "disabled"}>Disengage</button>
        <p>Your movement does not trigger opportunity attacks this turn. Consumes your Attack action.</p>
        <button type="button" data-action="combat-action" data-combat-action="offHandAttack" ${canOffHandAttack(fighter) ? "" : "disabled"}>Off-Hand Attack</button>
        <p>Attack with a light off-hand weapon. Consumes your Bonus action and does not add STR or DEX to damage.</p>
        <button type="button" data-action="combat-action" data-combat-action="getBehind" ${fighter.hasBonusAction ? "" : "disabled"}>Get Behind</button>
        <p>DEX check DC 12. On success, spend your Bonus action to move through monsters this turn.</p>
        ${medicineTargetsMarkup(fighter)}
        <p>WIS check DC 10 to stabilize an adjacent dying hero. Consumes your Attack action.</p>
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

function useCombatAction(action, targetId = null) {
  const fighter = activeFighter();
  if (!fighter || !heroCanAct(fighter) || state.mode !== "combat") return;
  const baseMovement = Math.floor(fighter.speedFeet / feetPerSquare);

  if (action === "getBehind") {
    if (!fighter.hasBonusAction) return;
    const roll = rollD20ForFighter(fighter).roll;
    const bonus = abilityMod(fighter, "dex");
    const total = roll + bonus;
    recordD20OutcomeForFighter(fighter, total >= 12);
    addLog(`${fighter.name} tries to Get Behind: DEX ${roll} ${abilityLabel(bonus)} = ${total} vs DC 12.`, "important");
    if (total >= 12) {
      fighter.canMoveThroughMonsters = true;
      fighter.hasBonusAction = false;
      addLog(`${fighter.name} can move through monster spaces this turn.`, "important");
    } else {
      addLog(`${fighter.name} cannot slip through the opening.`);
    }
    hideActionMenu();
    render();
    return;
  }

  if (action === "offHandAttack") {
    const target = attackTarget();
    if (!target || !canOffHandAttack(fighter)) return;
    hideActionMenu();
    void makeAttack(fighter, target, {
      weaponSlot: "offHand",
      resource: "bonusAction",
      includeDamageModifier: false,
      actionLabel: "makes an off-hand attack",
    });
    return;
  }

  if (!fighter.hasAction) return;

  if (action === "medicine") {
    const targets = adjacentDyingHeroes(fighter);
    const target = targets.find((hero) => hero.id === targetId) ?? targets[0];
    if (!target) return;
    const roll = rollD20ForFighter(fighter).roll;
    const bonus = abilityMod(fighter, "wis");
    const total = roll + bonus;
    fighter.hasAction = false;
    recordD20OutcomeForFighter(fighter, total >= 10);
    addLog(`${fighter.name} makes a Medicine check for ${target.name}: WIS ${roll} ${abilityLabel(bonus)} = ${total} vs DC 10.`, "important");
    if (total >= 10) {
      target.alive = true;
      target.deathSaves = { successes: 3, failures: 0 };
      addLog(`${target.name} is stabilized at 0 HP.`, "heal");
    } else {
      addLog(`${fighter.name} cannot stabilize ${target.name} yet.`);
    }
    hideActionMenu();
    render();
    return;
  }

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
  if (!heroCanAct(fighter) || !ability) return false;
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
  const hero = state.mode === "combat" ? activeFighter() : activeHero();
  const entries = availableFighterAbilities(hero);
  const spells = spellDefinitionsForFighter(hero);
  els.abilitiesBody.innerHTML = entries.length || spells.length
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
        ${spells
          .map((spell) => {
            const castLevels = spellAvailableCastLevels(hero, spell);
            const castButtons = castLevels
              .map((castLevel) => {
                const castSpell = spellWithCastLevel(spell, castLevel);
                const disabled = canCastSpell(hero, castSpell) ? "" : "disabled";
                const upcast = castLevel > spellBaseLevel(spell) ? ` L${castLevel}` : "";
                return `<button type="button" data-action="cast-spell" data-spell="${escapeAttribute(spell.id)}" data-cast-level="${castLevel}" ${disabled}>Cast${upcast}</button>`;
              })
              .join("");
            const costText = castLevels.map((level) => `L${level}: ${spellPointCost(spellWithCastLevel(spell, level))} SP`).join(", ");
            const concentration = spell.concentration ? " Concentration." : "";
            return `
              <div class="use-item-row">
                <div>
                  <b>${escapeHtml(spell.name)} <small>L${spellBaseLevel(spell)}</small></b>
                  <span>${escapeHtml(spell.description)} ${escapeHtml(spellResourceLabel(spell))}.${concentration} Costs: ${escapeHtml(costText)}. Spell points: ${hero.spellPoints ?? 0}/${hero.spellPointMax ?? 0}.</span>
                </div>
                <div class="use-item-actions">${castButtons}</div>
              </div>
            `;
          })
          .join("")}
      </div>
    `
    : `<p class="empty-note">No extra abilities or spells available yet.</p>`;
}

function showAbilitiesMenu() {
  renderAbilitiesMenu();
  els.abilitiesMenu.classList.remove("hidden");
}

function hideAbilitiesMenu() {
  els.abilitiesMenu.classList.add("hidden");
}

function showHomeMenu() {
  els.levelUp.disabled = !canLevelUp(activeHero());
  els.homeMenu.classList.remove("hidden");
}

function hideHomeMenu() {
  els.homeMenu.classList.add("hidden");
}

function storeStockItems() {
  const query = storeSearch.trim().toLowerCase();
  return window.DungeonContent.list("items")
    .filter((item) => ["weapon", "armor", "ammunition"].includes(item.type) || item.id === "potion-healing")
    .filter((item) => item.store?.buyable !== false && !item.tags?.includes("loot:magic") && item.type !== "treasure")
    .filter((item) => !query || searchableItemText(item).includes(query) || itemDetails(item).toLowerCase().includes(query))
    .sort((a, b) => itemCategoryLabel(a).localeCompare(itemCategoryLabel(b)) || a.name.localeCompare(b.name));
}

function renderStoreMenu() {
  const hero = activeHero();
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
                  const price = itemSellValueCp(item);
                  const starterWarning = item.starterEquipment ? " - starter gear has no resale value" : "";
                  return `
                    <div class="store-row">
                      <div>
                        <b>${escapeHtml(item.name)}</b>
                        <span>${escapeHtml(itemDetails(item))} - ${escapeHtml(priceText(price))}${escapeHtml(starterWarning)}</span>
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
  const hero = activeHero();
  const template = getItemTemplate(itemId);
  if (!template) return;

  const price = itemValueCp(template);
  if (template.store?.buyable === false || template.tags?.includes("loot:magic") || template.type === "treasure") return;
  if (!spendMoney(hero.inventory.money, price)) return;
  addItemToInventory(hero, createItemInstance(itemId, "store"), "store-stack");
  addLog(`${hero.name} buys ${template.name}.`, "important");
  render();
  renderStoreMenu();
}

function sellStoreItem(itemId) {
  const hero = activeHero();
  const equippedIds = new Set(Object.values(hero.equipment).filter(Boolean));
  if (equippedIds.has(itemId)) return;

  const item = itemForId(hero, itemId);
  if (!item) return;
  hero.inventory.items = hero.inventory.items.filter((entry) => entry.id !== itemId);
  const saleValue = itemSellValueCp(item);
  addMoney(hero.inventory.money, saleValue);
  addLog(`${hero.name} sells ${item.name} for ${priceText(saleValue)}.${item.starterEquipment ? " Starter equipment has no resale value." : ""}`, "important");
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

function abilityScoreImprovementLevelsForClass(classId) {
  return classAbilityScoreImprovementLevels[classId] ?? new Set([4, 8, 12, 16, 19]);
}

function classFeatureNames(hero, level) {
  const features = [];
  const template = getHeroTemplate(hero.classId);
  for (const feature of template.classFeatures ?? []) {
    if (feature.level === level) features.push(feature.name);
  }
  if (abilityScoreImprovementLevelsForClass(hero.classId).has(level)) features.push("Ability Score Improvement");
  return features;
}

function rageDamageBonus(hero) {
  const level = hero?.level ?? 1;
  return level >= 16 ? 4 : level >= 9 ? 3 : 2;
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
                <span>${ability.toUpperCase()} ${baseAbilityScore(hero, ability)}</span>
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
      const overCap = abilities.find((ability) => baseAbilityScore(hero, ability) + increases[ability] > 20);
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
  const hero = activeHero();
  if (state.mode !== "home" || !canLevelUp(hero)) return;
  const oldConMod = scoreToMod(baseAbilityScore(hero, "con"));
  const racialHpGain = hero.racialHpPerLevel ?? 0;
  const hpGain = Math.max(1, Math.floor((hero.hitDie ?? 10) / 2) + 1 + oldConMod + racialHpGain);
  hero.level = (hero.level ?? 1) + 1;
  hero.role = combatantRoleLabel(hero);
  hero.baseMaxHp = (hero.baseMaxHp ?? hero.maxHp) + hpGain;
  hero.maxHp = hero.baseMaxHp;
  hero.hitDiceRemaining = hero.level;
  let asiText = "";
  if (abilityScoreImprovementLevelsForClass(hero.classId).has(hero.level ?? 1)) {
    hero.abilityScores = Object.fromEntries(abilities.map((ability) => [ability, baseAbilityScore(hero, ability)]));
    const increases = await showAbilityScoreImprovementDialog(hero);
    if (increases) {
      for (const ability of abilities) {
        hero.abilityScores[ability] = Math.min(20, hero.abilityScores[ability] + (increases[ability] ?? 0));
      }
      const newConMod = scoreToMod(hero.abilityScores.con);
      const conHpGain = Math.max(0, newConMod - oldConMod) * (hero.level ?? 1);
      hero.baseMaxHp += conHpGain;
      hero.maxHp = hero.baseMaxHp;
      asiText = ` Ability scores improved${conHpGain ? `; Constitution adds ${conHpGain} max HP` : ""}.`;
    }
  }
  ensureFighterAbilityState(hero);
  let spellText = "";
  const spellChoices = spellChoiceCountForClassLevel(hero.classId, hero.level ?? 1) + (hero.unusedSpellChoiceCredits ?? 0);
  if (spellChoices > 0) {
    const result = await chooseClassSpells(hero, spellChoices, hero.spells ?? []);
    const gained = result.spells.filter((spellId) => !(hero.spells ?? []).includes(spellId));
    hero.spells = result.spells;
    hero.unusedSpellChoiceCredits = result.unusedCredits;
    if (gained.length) spellText = ` New spell${gained.length === 1 ? "" : "s"}: ${gained.map((spellId) => getContentDefinition("spells", spellId)?.name ?? spellId).join(", ")}.`;
  }
  refreshDerivedStats(hero);
  hero.hp = hero.maxHp;
  hero.spellPointMax = spellPointMaximum(hero);
  hero.spellPoints = hero.spellPointMax;
  const features = classFeatureNames(hero, hero.level);
  const featureText = features.length ? ` New feature${features.length === 1 ? "" : "s"}: ${features.join(", ")}.` : "";
  const racialHpText = racialHpGain ? ` (${racialHpGain} from Dwarven Toughness)` : "";
  const levelUpText = `${hero.name} reaches level ${hero.level} and gains ${hpGain} max HP${racialHpText}.${featureText}${asiText}${spellText}`;
  addLog(levelUpText, "important");
  hideHomeMenu();
  render();
  await showChoiceDialog({
    title: `Level ${hero.level} ${hero.className ?? "Fighter"}`,
    message: levelUpText,
    choices: [{ value: "ok", label: "Continue" }],
  });
}

function consumeEquippedItem(itemId) {
  const hero = state.mode === "combat" ? activeFighter() : activeHero();
  for (const slot of equipmentSlots) {
    if (hero.equipment[slot.id] === itemId) {
      hero.equipment[slot.id] = null;
    }
  }
  hero.inventory.items = hero.inventory.items.filter((item) => item.id !== itemId);
}

function applyHealingToHero(target, healing) {
  const before = target.hp;
  target.hp = Math.min(target.maxHp, target.hp + healing);
  if (target.hp > 0) {
    target.alive = true;
    target.deathSaves = { successes: 0, failures: 0 };
  }
  refreshDerivedStats(target);
  return target.hp - before;
}

function useBeltItem(itemId, targetId = null) {
  const hero = state.mode === "combat" ? activeFighter() : activeHero();
  const item = itemForId(hero, itemId);
  const target = targetId ? state.fighters[targetId] : hero;
  const itemAvailable = usableEquippedItems(hero).some((entry) => entry.item.id === itemId);
  const usingOnDyingHero = Boolean(targetId);
  if (!item || !itemAvailable) return;
  if (usingOnDyingHero && !canUseHealingItemOnTarget(hero, item, target)) return;
  if (!usingOnDyingHero && !canUseBeltItem(hero, item)) return;

  if (state.mode === "combat") {
    if (usingOnDyingHero) {
      hero.hasAction = false;
    } else if (itemUseResource(item) === "bonusAction") {
      hero.hasBonusAction = false;
    } else {
      hero.hasAction = false;
    }
  }

  if (item.use?.kind === "healing") {
    if (!spendItemCharge(item)) return;
    const healingRoll = rollDice(item.use.dice.count, item.use.dice.sides);
    const healing = healingRoll.total + (item.use.bonus ?? 0);
    const healed = applyHealingToHero(target, healing);
    playSoundEffect("potionDrink");
    const targetText = target.id === hero.id ? "" : ` on ${target.name}`;
    addLog(`${hero.name} uses ${item.name}${targetText} and heals ${healed} HP (${healingRoll.rolls.join(" + ")} + ${item.use.bonus ?? 0}).`, "heal");
    if (item.use?.consume !== false && !item.use?.charges) consumeEquippedItem(itemId);
  } else {
    if (!spendItemCharge(item)) return;
    addLog(`${hero.name} uses ${item.name}.`, "important");
    if (item.use?.consume !== false && !item.use?.charges) consumeEquippedItem(itemId);
  }

  refreshDerivedStats(hero);
  hideUseItemMenu();
  render();
}

function useFighterAbility(abilityId) {
  const hero = state.mode === "combat" ? activeFighter() : activeHero();
  const ability = availableFighterAbilities(hero).find((entry) => entry.id === abilityId);
  if (!canUseFighterAbility(hero, ability)) return;

  hero.abilityUses[ability.id] = (hero.abilityUses[ability.id] ?? 0) + 1;
  if (state.mode === "combat" && ability.resource === "bonusAction") {
    hero.hasBonusAction = false;
  } else if (state.mode === "combat" && ability.resource === "action") {
    hero.hasAction = false;
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

  if (ability.id === "rage") {
    applyStatusEffect(hero, { id: "rage", label: "Rage", damageBonus: rageDamageBonus(hero), durationRounds: 10 });
    addLog(`${hero.name} enters a Rage.`, "important");
  }

  if (ability.id === "recklessAttack") {
    applyStatusEffect(hero, { id: "reckless-attack", label: "Reckless", attackBonus: 2, acBonus: -2, expiresAtStartOfTurn: true });
    addLog(`${hero.name} attacks recklessly.`, "important");
  }

  if (ability.id === "patientDefense" || ability.id === "uncannyDodge") {
    hero.dodging = true;
    addLog(`${hero.name} takes a defensive stance.`, "important");
  }

  if (ability.id === "cunningActionDash") {
    hero.movementLeft = (hero.movementLeft ?? 0) + Math.floor(hero.speedFeet / feetPerSquare);
    addLog(`${hero.name} uses Cunning Action to Dash.`, "important");
  }

  if (ability.id === "eldritchMaster") {
    hero.spellPoints = spellPointMaximum(hero);
    addLog(`${hero.name} uses Eldritch Master and restores pact spell points.`, "important");
  }

  if (ability.id === "bardicInspiration") {
    applyStatusEffect(hero, { id: "bardic-inspiration", label: "Inspired", attackBonus: 2, saveBonus: 2, durationRounds: 3 });
    addLog(`${hero.name} uses Bardic Inspiration.`, "important");
  }

  if (ability.id === "wildShape") {
    applyStatusEffect(hero, { id: "wild-shape", label: "Wild Shape", tempHp: 5 + (hero.level ?? 1), damageBonus: 2, durationRounds: 3 });
    addLog(`${hero.name} takes on a combat beast shape.`, "important");
  }

  if (ability.id === "layOnHands") {
    const healing = 5 * (hero.level ?? 1);
    const healed = applyHealingToHero(hero, healing);
    addLog(`${hero.name} uses Lay on Hands and heals ${healed} HP.`, "heal");
  }

  if (ability.id === "divineSmite") {
    applyStatusEffect(hero, { id: "divine-smite", label: "Divine Smite", weaponRider: true, damageBonus: 9, damageType: "radiant", expiresAtEndOfTurn: true });
    addLog(`${hero.name} prepares a Divine Smite.`, "important");
  }

  if (ability.id === "empoweredSpell") {
    applyStatusEffect(hero, { id: "empowered-spell", label: "Empowered Spell", damageBonus: 3, durationRounds: 1 });
    addLog(`${hero.name} gathers empowered arcane force.`, "important");
  }

  if (ability.id === "arcaneRecovery") {
    const recovered = Math.min(spellPointMaximum(hero) - (hero.spellPoints ?? 0), Math.max(1, Math.ceil((hero.level ?? 1) / 2)));
    hero.spellPoints = Math.min(spellPointMaximum(hero), (hero.spellPoints ?? 0) + recovered);
    addLog(`${hero.name} uses Arcane Recovery and regains ${recovered} SP.`, "important");
  }

  if (ability.id === "channelDivinity") {
    const targets = visibleMonsters().filter((monster) => distance(hero.position, monster.position) <= 3);
    addLog(`${hero.name} uses Channel Divinity.`, "important");
    for (const target of targets) {
      applySpecialDamage(hero, target, Math.max(1, rollDice(2, 8).total + abilityMod(hero, spellcastingAbility(hero))), "radiant", "Channel Divinity");
      if (!target.alive) {
        playSoundEffect("enemyDefeated");
        awardMonsterXp(target);
        dropLootForMonster(target);
      }
    }
    void finishEncounterAfterLastMonsterFalls();
  }

  if (ability.id === "rangerCompanion") {
    const target = attackTarget() ?? visibleMonsters()[0];
    if (target) {
      const damage = Math.max(1, rollDice(1, 8).total + proficiencyBonus(hero));
      applySpecialDamage(hero, target, damage, "piercing", "Ranger Companion");
      addLog(`${hero.name}'s companion strikes ${target.name}.`, "important");
      if (!target.alive) {
        playSoundEffect("enemyDefeated");
        awardMonsterXp(target);
        dropLootForMonster(target);
        void finishEncounterAfterLastMonsterFalls();
      }
    } else {
      addLog(`${hero.name}'s companion has no target.`, "important");
    }
  }

  refreshDerivedStats(hero);
  hideAbilitiesMenu();
  render();
}

function shortRestHeroes() {
  return partyHeroes().filter((hero) => heroCanAct(hero) || heroIsStableAtZero(hero));
}

function partyNeedsShortRest() {
  return shortRestHeroes().some(
    (hero) =>
      heroIsStableAtZero(hero) ||
      (hero.hp < hero.maxHp && (hero.hitDiceRemaining ?? hero.level ?? 1) > 0) ||
      hasSpentShortRestAbility(hero),
  );
}

function finishStableHeroesAfterShortRest() {
  for (const hero of stableUnconsciousPartyHeroes()) {
    hero.hp = 1;
    hero.deathSaves = { successes: 0, failures: 0 };
    refreshDerivedStats(hero);
    addLog(`${hero.name} wakes at the end of the short rest with 1 HP.`, "heal");
  }
}

function beginPartyShortRest() {
  if ((state.shortRestsUsed ?? 0) >= (state.shortRestLimit ?? 3)) return false;
  if (unstableDyingPartyHeroes().length > 0) {
    addLog("A hero is still making death saves. Stabilize them before taking a short rest.", "important");
    return false;
  }
  state.shortRestsUsed = (state.shortRestsUsed ?? 0) + 1;
  for (const hero of shortRestHeroes()) {
    resetFighterAbilityUses(hero, "shortRest");
    if (casterTypeForFighter(hero) === "pact") {
      hero.spellPoints = spellPointMaximum(hero);
      addLog(`${hero.name}'s pact spell points refresh on the short rest.`, "important");
    }
    refreshItemChargesForFighter(hero, "shortRest");
  }
  addLog("The party takes a short rest. Short-rest abilities refresh for every active hero.", "important");
  return true;
}

function renderShortRestDialogBody(spentAny = false) {
  const heroes = shortRestHeroes();
  const shortRestsRemaining = Math.max(0, (state.shortRestLimit ?? 3) - (state.shortRestsUsed ?? 0));
  els.gameDialogMessage.innerHTML = `
    Short rests left: ${shortRestsRemaining}. A short rest is shared by the whole party and refreshes short-rest abilities for every active hero.
  `;
  els.gameDialogActions.innerHTML = `
    <div class="short-rest-panel">
      <button type="button" data-rest-action="shortRest" ${!spentAny && shortRestsRemaining > 0 ? "" : "disabled"}>Take Short Rest</button>
      ${heroes
        .map((hero) => {
          const conMod = abilityMod(hero, "con");
          hero.hitDiceRemaining = hero.hitDiceRemaining ?? hero.level ?? 1;
          const canSpend = spentAny && hero.hp > 0 && (hero.hitDiceRemaining ?? 0) > 0 && hero.hp < hero.maxHp;
          const status = heroIsStableAtZero(hero) ? " - stable; wakes at rest end" : "";
          return `
            <div class="rest-hero-row">
              <div>
                <b>${escapeHtml(hero.name)}</b>
                <span>HP ${hero.hp}/${hero.maxHp} - Hit dice ${hero.hitDiceRemaining ?? 0}/${hero.level ?? 1} - d${hero.hitDie ?? 10} ${abilityLabel(conMod)} CON${status}</span>
              </div>
              <button type="button" data-rest-action="spend" data-hero="${hero.id}" ${canSpend ? "" : "disabled"}>Roll Hit Die</button>
            </div>
          `;
        })
        .join("")}
      <button type="button" class="ghost-button" data-rest-action="finish">${spentAny ? "Finish Rest" : "No Short Rest"}</button>
    </div>
  `;
}

function showShortRestMenu() {
  return new Promise((resolve) => {
    els.gameDialogTitle.textContent = "Short Rest";
    els.gameDialogField.classList.add("hidden");
    els.gameDialogForm.classList.add("wide-dialog");
    let spentAny = false;

    const cleanup = () => {
      els.gameDialogActions.removeEventListener("click", handleClick);
      els.gameDialogForm.classList.remove("wide-dialog");
      els.gameDialog.classList.add("hidden");
      activeDialogCancel = null;
      if (spentAny) {
        finishStableHeroesAfterShortRest();
        playSoundEffect("shortRestFinished");
      }
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
        if (!spentAny && !beginPartyShortRest()) return;
        spentAny = true;
        render();
        els.gameDialog.classList.remove("hidden");
        renderShortRestDialogBody(spentAny);
        return;
      }
      if (button.dataset.restAction !== "spend") return;

      if (!spentAny) {
        if (!beginPartyShortRest()) return;
        spentAny = true;
      }
      const hero = state.fighters[button.dataset.hero];
      if (!hero || (hero.hitDiceRemaining ?? 0) <= 0 || hero.hp >= hero.maxHp) return;
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
      renderShortRestDialogBody(spentAny);
    };

    els.gameDialogActions.addEventListener("click", handleClick);
    activeDialogCancel = cleanup;
    renderShortRestDialogBody(spentAny);
    els.gameDialog.classList.remove("hidden");
    els.gameDialogActions.querySelector("[data-rest-action='spend']:not(:disabled), [data-rest-action='finish']")?.focus();
  });
}

async function takeShortRest() {
  const heroes = shortRestHeroes();
  if ((state.shortRestsUsed ?? 0) >= (state.shortRestLimit ?? 3) || state.mode === "combat" || heroes.length === 0) return;
  if (unstableDyingPartyHeroes().length > 0) {
    addLog("A hero is still making death saves. Stabilize them before taking a short rest.", "important");
    render();
    return;
  }

  for (const hero of heroes) hero.hitDiceRemaining = hero.hitDiceRemaining ?? hero.level ?? 1;
  render();
  await showShortRestMenu();
  render();
}

function unequipSlot(slotId) {
  const hero = activeHero();
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
  const hero = activeHero();
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
  const hero = activeHero();
  return ["mainHand", "offHand"].some((slotId) => slotId !== targetSlot && hero.equipment[slotId] === itemId);
}

function canDropInventoryData(data, target) {
  if (!data?.itemId || !target) return false;
  if (target.dataset.dropAdminTrash) return data.source !== "admin";
  if (target.dataset.dropChest) return state.mode === "home" && data.source !== "admin" && data.source !== "chest";
  if (target.dataset.dropInventory) return data.source !== "inventory";

  const slotId = target.dataset.dropSlot;
  const item = data.source === "admin" ? getItemTemplate(data.itemId) : data.source === "chest" ? chestItemForId(data.itemId) : itemForId(activeHero(), data.itemId);
  const handConflict = data.source !== "admin" && isItemEquippedInAnotherHand(data.itemId, slotId);
  return itemCanEquipInSlot(activeHero(), item, slotId) && !handConflict;
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
    const addedItems = addItemToInventory(activeHero(), item, "chest-stack");
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
          ${combatantArtworkMarkup(fighter, "initiative-art")}
          <span>${fighter.name}</span>
          <strong>${entry.total}</strong>
        </div>
      `;
    })
    .join("");
}

function renderLog() {
  els.log.innerHTML = state.log
    .map((entry) => `<li class="${escapeAttribute(entry.type ?? "")}">${escapeHtml(entry.text)}</li>`)
    .join("");
  els.log.scrollTop = els.log.scrollHeight;
}

function renderControls() {
  applyThemePalette();
  const fighter = activeFighter();
  const hero = activeHero();
  const heroTurn = state.mode === "combat" && fighter && isPartyHeroId(fighter.id) && combatMonsters().length > 0;
  if (!heroTurn) selectedAttackTargetId = null;
  const actingHero = heroTurn ? fighter : hero;
  const heroCanAttack = heroTurn && actingHero.hasAction && Boolean(attackTarget());
  const heroCanUseAction = heroTurn && (actingHero.hasAction || actingHero.hasBonusAction || canOffHandAttack(actingHero));
  const heroCanUseItem =
    gameHasStarted &&
    heroCanAct(actingHero) &&
    (state.mode === "combat"
      ? usableEquippedItems(actingHero).some((entry) => canUseBeltItem(actingHero, entry.item))
      : usableEquippedItems(actingHero).some((entry) => entry.item.use && itemHasCharges(entry.item)));
  const heroCanOpenAbilities =
    gameHasStarted &&
    heroCanAct(actingHero) &&
    (availableFighterAbilities(actingHero).length > 0 || spellDefinitionsForFighter(actingHero).length > 0) &&
    (state.mode !== "combat" || heroTurn);

  els.rollInitiative.disabled = !gameHasStarted || state.completed || movementInProgress || state.mode === "combat" || !threatPresent();
  els.attack.disabled = movementInProgress || !heroCanAttack;
  if (els.attackNote) {
    const weapon = activeWeapon(actingHero);
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
    shortRestHeroes().length === 0 ||
    !partyNeedsShortRest();
  const fleeStatus = state.mode === "combat" ? fleeCombatStatus() : { ok: false, reason: "" };
  els.returnHome.disabled =
    state.mode === "combat"
      ? movementInProgress || !fleeStatus.ok
      : !gameHasStarted || movementInProgress || state.mode === "home" || partyHeroes().length === 0;
  els.returnHome.textContent = state.mode === "combat" ? "Flee Combat [H]" : "Return Home [H]";
  els.returnHome.title = state.mode === "combat" ? fleeStatus.reason : "";
  els.endTurn.disabled = movementInProgress || !heroTurn;

  els.attack.style.display = state.mode === "combat" ? "" : "none";
  els.actionButton.style.display = state.mode === "combat" ? "" : "none";
  els.endTurn.style.display = state.mode === "combat" ? "" : "none";
  els.shortRest.style.display = state.mode === "combat" ? "none" : "";
  els.returnHome.style.display = "";
  els.saveGame.disabled = !gameHasStarted || Boolean(state.isTutorial);
  els.toggleLayout.textContent = showDungeonLayout ? "Hide Dungeon Layout" : "Show Dungeon Layout";
  els.toggleAdminMode.classList.toggle("active", adminEnabled());
  els.toggleAdminMode.disabled = !gameHasStarted;
  els.toggleLayout.classList.toggle("hidden", !adminEnabled());
  els.debugKill.classList.toggle("hidden", !adminEnabled());
  els.toggleLayout.disabled = !adminEnabled();
  els.zoomOut.disabled = roomZoom <= 0.5;
  els.zoomIn.disabled = roomZoom >= 2;
  els.zoomLabel.textContent = `${Math.round(roomZoom * 100)}%`;
  if (els.volumeSlider) els.volumeSlider.value = String(Math.round(soundVolume * 100));
  if (els.volumeLabel) els.volumeLabel.textContent = `${Math.round(soundVolume * 100)}%`;
  els.debugKill.disabled = !adminEnabled() || visibleMonsters().length === 0;
  els.levelUp.disabled = !gameHasStarted || state.mode !== "home" || !canLevelUp(hero);
  if (els.selectParty) {
    const selectableCount = partyHeroes().filter((entry) => heroCanAct(entry)).length;
    els.selectParty.disabled = !gameHasStarted || state.mode === "combat" || selectableCount <= 1;
  }
  if (els.roomTitle) els.roomTitle.textContent = state.mode === "home" ? "Home" : state.room.name;
  els.roundLabel.textContent = state.mode === "combat" ? `Round ${state.round}` : "Out of turn order";

  if (state.completed) {
    els.turnLabel.textContent = "Dungeon complete";
  } else if (state.mode === "home") {
    els.roundLabel.textContent = "Home";
    els.turnLabel.textContent = "Long rest complete";
  } else if (state.mode !== "combat") {
    els.turnLabel.textContent = threatPresent() ? "Danger present" : "Exploration";
  } else if (combatMonsters().length === 0 || partyDefeatedOrDying()) {
    els.turnLabel.textContent = combatMonsters().length === 0 ? "Encounter won" : "Encounter lost";
  } else {
    els.turnLabel.textContent = `${fighter.name}'s turn`;
  }
  updateBackgroundMusic();
}

function ensurePerfOverlay() {
  if (perfOverlayElement) return perfOverlayElement;
  perfOverlayElement = document.createElement("div");
  perfOverlayElement.id = "perf-overlay";
  perfOverlayElement.style.cssText = [
    "position:fixed",
    "left:12px",
    "top:12px",
    "z-index:50",
    "padding:8px 10px",
    "background:rgba(12,10,8,0.86)",
    "color:#f3e7cc",
    "border:1px solid rgba(215,168,79,0.45)",
    "border-radius:6px",
    "font:12px/1.35 monospace",
    "pointer-events:none",
    "white-space:pre",
  ].join(";");
  document.body.append(perfOverlayElement);
  return perfOverlayElement;
}

function updatePerfOverlay() {
  perfStats.frames += 1;
  const now = performance.now();
  const elapsed = now - perfStats.lastSecondAt;
  if (elapsed >= 1000) {
    perfStats.fps = Math.round((perfStats.frames * 1000) / elapsed);
    perfStats.aiUpdatesPerSecond = perfStats.aiUpdates;
    perfStats.pathfindingJobsPerSecond = perfStats.pathfindingJobs;
    perfStats.frames = 0;
    perfStats.aiUpdates = 0;
    perfStats.pathfindingJobs = 0;
    perfStats.lastSecondAt = now;
  }

  const overlay = ensurePerfOverlay();
  overlay.style.display = adminEnabled() ? "" : "none";
  if (!adminEnabled()) {
    perfStats.pathfindingJobsLastFrame = 0;
    return;
  }
  overlay.textContent = [
    `FPS ${perfStats.fps} | render ${perfStats.renderMs.toFixed(1)}ms`,
    `tiles ${perfStats.renderedTiles}/${perfStats.visibleTiles}`,
    `entities ${perfStats.activeEntities} active, ${perfStats.sleepingEntities} sleeping, ${perfStats.totalEntities} total`,
    `AI ${perfStats.aiUpdatesPerSecond}/s | paths ${perfStats.pathfindingJobsPerSecond}/s (${perfStats.pathfindingJobsLastFrame} last)`,
  ].join("\n");
  perfStats.pathfindingJobsLastFrame = 0;
}

function render() {
  const renderStart = performance.now();
  renderRoom();
  renderHeroStatusCard(els.heroCard, activeHero());
  activateFledMonstersWithLineOfSight();
  renderInitiative();
  renderLog();
  renderControls();
  scheduleInitiativePromptIfNeeded();
  updateInteractiveTutorial();
  perfStats.renderMs = performance.now() - renderStart;
  updatePerfOverlay();
}

els.rollInitiative.addEventListener("click", rollInitiative);
els.selectParty?.addEventListener("click", selectActivePartyForMovement);
els.attack.addEventListener("click", () => {
  const target = attackTarget();
  if (target) makeAttack(activeFighter(), target);
});
els.actionButton.addEventListener("click", showActionMenu);
els.useItem.addEventListener("click", showUseItemMenu);
els.abilities.addEventListener("click", showAbilitiesMenu);
els.shortRest.addEventListener("click", takeShortRest);
els.returnHome.addEventListener("click", () => {
  if (state.mode === "combat") {
    fleeCombat();
    return;
  }
  returnHomeEarly();
});
els.endTurn.addEventListener("click", endTurn);
els.heroCard.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  showCombatantInfo(activeHero());
});
els.newGame.addEventListener("click", () => {
  showMainMenu();
});
els.tutorial.addEventListener("click", showTutorial);
els.mainTutorial?.addEventListener("click", startInteractiveTutorial);
els.tutorialTourBack?.addEventListener("click", () => {
  if (!interactiveTutorialActive) return;
  interactiveTutorialStep = Math.max(0, interactiveTutorialStep - 1);
  updateInteractiveTutorial();
});
els.tutorialTourNext?.addEventListener("click", () => {
  if (!interactiveTutorialActive) return;
  if (interactiveTutorialStep >= interactiveTutorialSteps.length - 1) {
    finishInteractiveTutorial();
    return;
  }
  interactiveTutorialStep += 1;
  updateInteractiveTutorial();
});
els.tutorialTourClose?.addEventListener("click", finishInteractiveTutorial);
els.toggleAdminMode.addEventListener("click", () => {
  adminMode = !adminMode;
  if (!adminMode) disableAdminModeOptions();
  addLog(adminMode ? "Adminmode enabled." : "Adminmode disabled.", "important");
  render();
});
els.toggleLayout.addEventListener("click", () => {
  if (!adminEnabled()) return;
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
els.volumeSlider?.addEventListener("input", (event) => {
  soundVolume = clamp(Number(event.target.value) / 100, 0, 1);
  window.localStorage.setItem("dungeonCrawler.soundVolume.v1", String(soundVolume));
  if (currentMusic) currentMusic.volume = 0.1 * soundVolume;
  renderControls();
});
els.debugKill.addEventListener("click", debugKillVisibleMonsters);
els.saveGame.addEventListener("click", () => saveAdventure(state.saveSlotId ?? activeSaveSlot));
els.startAdventure.addEventListener("click", startNewAdventure);
els.saveSlots.addEventListener("click", async (event) => {
  const slotElement = event.target.closest("[data-slot]");
  if (slotElement) selectSaveSlot(Number(slotElement.dataset.slot));

  const button = event.target.closest("button");
  if (!button) return;

  const slotId = Number(button.dataset.slot);
  if (button.dataset.action === "save-slot") {
    await saveAdventure(slotId);
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
  if (button.dataset.action === "home-store-all-items") {
    storeAllHomeChestItems();
  }
  if (button.dataset.action === "home-take-all-items") {
    takeAllHomeChestItems();
  }
  if (button.dataset.action === "home-deposit-custom-coins") {
    moveCustomMoneyFromHomeChestPanel("deposit");
  }
  if (button.dataset.action === "home-withdraw-custom-coins") {
    moveCustomMoneyFromHomeChestPanel("withdraw");
  }
  if (button.dataset.action === "home-deposit-all-coins") {
    moveMoneyBetweenHeroAndChest("deposit", moneyToCp(activeHero().inventory.money));
    showHomeChestInfo();
  }
  if (button.dataset.action === "home-withdraw-all-coins") {
    moveMoneyBetweenHeroAndChest("withdraw", moneyToCp(state.chestMoney ?? {}));
    showHomeChestInfo();
  }
  if (button.dataset.action === "create-roster-hero") {
    createRosterHero();
  }
  if (button.dataset.action === "add-party-hero") {
    addHeroToParty(button.dataset.hero);
  }
  if (button.dataset.action === "remove-party-hero") {
    removeHeroFromParty(button.dataset.hero);
  }
  if (button.dataset.action === "make-main-hero") {
    makeMainHero(button.dataset.hero);
  }
});
els.fighterInfo.addEventListener("change", (event) => {
  const d20Select = event.target.closest("select[data-action='d20-mode']");
  if (d20Select) {
    setD20Mode(d20Select.value);
    showPlanningTableInfo();
    return;
  }
  const select = event.target.closest("select[data-action='party-role']");
  if (!select) return;
  setHeroRole(select.dataset.hero, select.value);
  showPlanningTableInfo();
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
    useBeltItem(button.dataset.item, button.dataset.target ?? null);
  }
});
els.actionMenu.addEventListener("click", (event) => {
  if (event.target === els.actionMenu) {
    hideActionMenu();
    return;
  }

  const button = event.target.closest("button");
  if (button?.dataset.action === "combat-action") {
    useCombatAction(button.dataset.combatAction, button.dataset.target ?? null);
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
  if (button?.dataset.action === "cast-spell") {
    void chooseAndCastSpell(button.dataset.spell, button.dataset.castLevel);
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
    if (!adminEnabled()) return;
    inventoryAdminOpen = !inventoryAdminOpen;
    renderInventoryMenu();
  }
  if (button.dataset.action === "toggle-admin-teleport") {
    adminTeleportEnabled = !adminTeleportEnabled;
    addLog(adminTeleportEnabled ? "Admin teleport enabled." : "Admin teleport disabled.", "important");
    render();
    renderInventoryMenu();
  }
  if (button.dataset.action === "toggle-admin-god") {
    adminGodMode = !adminGodMode;
    addLog(adminGodMode ? "God mode enabled." : "God mode disabled.", "important");
    render();
    renderInventoryMenu();
  }
  if (button.dataset.action === "toggle-admin-monsters") {
    adminMonsterCatalogOpen = !adminMonsterCatalogOpen;
    renderInventoryMenu();
  }
  if (button.dataset.action === "admin-heal") {
    adminFullHeal();
  }
  if (button.dataset.action === "admin-refresh") {
    adminRefreshActions();
  }
  if (button.dataset.action === "admin-reveal-current-room") {
    adminRevealCurrentRoom();
  }
  if (button.dataset.action === "admin-clear-combat") {
    adminClearCombat();
  }
  if (button.dataset.action === "spawn-admin-monster") {
    spawnAdminMonster(button.dataset.monster);
  }
  if (button.dataset.action === "add-admin-item") {
    if (!adminEnabled()) return;
    addAdminItemToInventory(button.dataset.item);
  }
  if (button.dataset.action === "add-admin-coins") {
    if (!adminEnabled()) return;
    addAdminCoins(Number(button.dataset.cp));
  }
  if (button.dataset.action === "add-admin-xp") {
    if (!adminEnabled()) return;
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
  if (button.dataset.action === "inspect-item") {
    showInventoryItemInfo(button.dataset.item);
  }
  if (button.dataset.action === "give-item") {
    const select = button.closest(".equip-actions")?.querySelector("select[data-transfer-target]");
    transferInventoryItem(button.dataset.item, select?.value);
  }
});
els.inventoryMenu.addEventListener("input", (event) => {
  if (event.target.id === "admin-item-search") {
    inventoryAdminSearch = event.target.value;
  } else if (event.target.id === "admin-monster-search") {
    adminMonsterSearch = event.target.value;
  } else {
    return;
  }
  renderInventoryMenu();
  const searchInput = els.inventoryMenu.querySelector(`#${event.target.id}`);
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
els.roomScroll.addEventListener("scroll", () => {
  if (interactiveTutorialActive) updateInteractiveTutorial();
});
window.addEventListener("resize", () => {
  if (interactiveTutorialActive) updateInteractiveTutorial();
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    clearHeldMovementKeys();
    if (pendingSpellTargeting) {
      clearPendingSpellTargeting();
      return;
    }
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
  const key = event.key.toLowerCase();
  if (key === "i" && gameHasStarted && !activeDialogCancel) {
    const target = event.target;
    if (!target?.matches?.("input, textarea, select") && !target?.isContentEditable && !event.ctrlKey && !event.altKey && !event.metaKey) {
      if (overlayOpen && els.inventoryMenu.classList.contains("hidden")) return;
      event.preventDefault();
      if (els.inventoryMenu.classList.contains("hidden")) {
        showInventoryMenu();
      } else {
        hideInventoryMenu();
      }
      return;
    }
  }
  if (activeDialogCancel || overlayOpen || event.ctrlKey || event.altKey || event.metaKey) return;
  const target = event.target;
  if (target?.matches?.("input, textarea, select") || target?.isContentEditable) return;

  const movementDelta = movementDeltaForKey(key);
  if (movementDelta) {
    event.preventDefault();
    startHeldMovement(key, movementDelta);
    return;
  }
  if (key === "tab" && cycleAttackTarget()) {
    event.preventDefault();
    return;
  }
  if (key === "r" && !els.rollInitiative.disabled) {
    event.preventDefault();
    rollInitiative();
  }
  if (key === "x" && !els.actionButton.disabled) {
    event.preventDefault();
    showActionMenu();
  }
  if (key === "t" && !els.attack.disabled) {
    event.preventDefault();
    const targetFighter = attackTarget();
    if (targetFighter) makeAttack(activeFighter(), targetFighter);
  }
  if (key === "u" && !els.useItem.disabled) {
    event.preventDefault();
    showUseItemMenu();
  }
  if (key === "b" && !els.abilities.disabled) {
    event.preventDefault();
    showAbilitiesMenu();
  }
  if (key === "q" && els.selectParty && !els.selectParty.disabled) {
    event.preventDefault();
    selectActivePartyForMovement();
    return;
  }
  if (key === "q" && !els.shortRest.disabled) {
    event.preventDefault();
    takeShortRest();
    return;
  }
  if (key === "h" && !els.returnHome.disabled) {
    event.preventDefault();
    if (state.mode === "combat") {
      fleeCombat();
    } else {
      returnHomeEarly();
    }
  }
  if (key === "e" && !els.endTurn.disabled) {
    event.preventDefault();
    endTurn();
  }
});

window.addEventListener("keyup", (event) => {
  stopHeldMovement(event.key.toLowerCase());
});

window.addEventListener("blur", clearHeldMovementKeys);

loadPredefinedHeroTokenArt().finally(() => {
  renderControls();
});
state = createInitialState();
render();
showMainMenu();
})();
