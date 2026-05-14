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
let pendingEldritchBlast = null;
let pendingMultiTargetSpell = null;
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
  chooseSaveFolder: document.querySelector("#choose-save-folder"),
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

