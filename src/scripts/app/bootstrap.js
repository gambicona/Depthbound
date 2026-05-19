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
let suppressInspectUntil = 0;
let adminMode = false;
let adminTeleportEnabled = false;
let adminGodMode = false;
let inventoryAdminOpen = false;
let adminMonsterCatalogOpen = false;
let adminProgressOpen = false;
let combatLogExpanded = false;
let roomScrollAnimation = null;
let inventoryAdminSearch = "";
let adminMonsterSearch = "";
let storeSearch = "";
let activeStoreNpcId = "general-merchant";
let questSatchelOpen = false;
let adminItemInstanceCounter = 0;
let activeDialogCancel = null;
let currentMusicKey = "";
let currentMusic = null;
let soundVolume = Number(window.localStorage.getItem("dungeonCrawler.soundVolume.v1") ?? 0.5);
let buttonTheme = window.localStorage.getItem("dungeonCrawler.buttonTheme.v1") || "verdigris";
let selectedAttackTargetId = null;
let selectedHeroIds = new Set();
let suppressNextHeroClick = false;
let initiativePromptQueued = false;
let initiativePromptOpen = false;
let fledMonsterIds = new Set();
let interactiveTutorialActive = false;
let interactiveTutorialStep = 0;
let interactiveTutorialEnteredStep = -1;
let interactiveTutorialUpdating = false;
let predefinedHeroTokenArt = [];
let renderedTileKeys = new Set();
let pathfindingJobsThisTurn = 0;
let perfOverlayElement = null;
const activeCorridorRadius = 14;
const monsterAiDecisionIntervalMs = Number(window.DungeonPlaytestTuning?.performance?.monsterAiDecisionIntervalMs ?? 250) || 250;
const monsterPathfindingBudgetPerTurn = Number(window.DungeonPlaytestTuning?.performance?.monsterPathfindingBudgetPerTurn ?? 6) || 6;
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
const mainMenuBackgrounds = [
  "assets/backgrounds/Corrupted Forest.png",
  "assets/backgrounds/Ruined armory of the undead.png",
];
const buttonThemes = new Set(["verdigris", "ember", "steel", "royal"]);
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
    black: { name: "Black", damageType: "acid", saveAbility: "dex" },
    blue: { name: "Blue", damageType: "lightning", saveAbility: "dex" },
    green: { name: "Green", damageType: "poison", saveAbility: "con" },
    red: { name: "Red", damageType: "fire", saveAbility: "dex" },
    white: { name: "White", damageType: "cold", saveAbility: "con" },
  },
  gem: {
    amethyst: { name: "Amethyst", damageType: "force", saveAbility: "dex" },
    crystal: { name: "Crystal", damageType: "radiant", saveAbility: "dex" },
    emerald: { name: "Emerald", damageType: "psychic", saveAbility: "dex" },
    sapphire: { name: "Sapphire", damageType: "thunder", saveAbility: "dex" },
    topaz: { name: "Topaz", damageType: "necrotic", saveAbility: "dex" },
  },
  metallic: {
    brass: { name: "Brass", damageType: "fire", saveAbility: "dex" },
    bronze: { name: "Bronze", damageType: "lightning", saveAbility: "dex" },
    copper: { name: "Copper", damageType: "acid", saveAbility: "dex" },
    gold: { name: "Gold", damageType: "fire", saveAbility: "dex" },
    silver: { name: "Silver", damageType: "cold", saveAbility: "con" },
  },
};

const skillDefinitions = {
  acrobatics: { name: "Acrobatics", ability: "dex" },
  "animal-handling": { name: "Animal Handling", ability: "wis" },
  arcana: { name: "Arcana", ability: "int" },
  athletics: { name: "Athletics", ability: "str" },
  deception: { name: "Deception", ability: "cha" },
  history: { name: "History", ability: "int" },
  insight: { name: "Insight", ability: "wis" },
  intimidation: { name: "Intimidation", ability: "cha" },
  investigation: { name: "Investigation", ability: "int" },
  medicine: { name: "Medicine", ability: "wis" },
  nature: { name: "Nature", ability: "int" },
  perception: { name: "Perception", ability: "wis" },
  performance: { name: "Performance", ability: "cha" },
  persuasion: { name: "Persuasion", ability: "cha" },
  religion: { name: "Religion", ability: "int" },
  "sleight-of-hand": { name: "Sleight of Hand", ability: "dex" },
  stealth: { name: "Stealth", ability: "dex" },
  survival: { name: "Survival", ability: "wis" },
};
const allSkillIds = Object.keys(skillDefinitions);
const toolDefinitions = {
  "thieves-tools": { name: "Thieves' Tools", category: "tool" },
  "disguise-kit": { name: "Disguise Kit", category: "tool" },
  "forgery-kit": { name: "Forgery Kit", category: "tool" },
  "herbalism-kit": { name: "Herbalism Kit", category: "tool" },
  "poisoners-kit": { name: "Poisoner's Kit", category: "tool" },
  "navigators-tools": { name: "Navigator's Tools", category: "tool" },
  "alchemists-supplies": { name: "Alchemist's Supplies", category: "artisan" },
  "smiths-tools": { name: "Smith's Tools", category: "artisan" },
  "brewers-supplies": { name: "Brewer's Supplies", category: "artisan" },
  "calligraphers-supplies": { name: "Calligrapher's Supplies", category: "artisan" },
  "masons-tools": { name: "Mason's Tools", category: "artisan" },
  "carpenters-tools": { name: "Carpenter's Tools", category: "artisan" },
  "cooks-utensils": { name: "Cook's Utensils", category: "artisan" },
  "glassblowers-tools": { name: "Glassblower's Tools", category: "artisan" },
  "jewelers-tools": { name: "Jeweler's Tools", category: "artisan" },
  "leatherworkers-tools": { name: "Leatherworker's Tools", category: "artisan" },
  "painters-supplies": { name: "Painter's Supplies", category: "artisan" },
  "potters-tools": { name: "Potter's Tools", category: "artisan" },
  "tinkers-tools": { name: "Tinker's Tools", category: "artisan" },
  "weavers-tools": { name: "Weaver's Tools", category: "artisan" },
  "woodcarvers-tools": { name: "Woodcarver's Tools", category: "artisan" },
  drum: { name: "Drum", category: "instrument" },
  flute: { name: "Flute", category: "instrument" },
  horn: { name: "Horn", category: "instrument" },
  lute: { name: "Lute", category: "instrument" },
  lyre: { name: "Lyre", category: "instrument" },
  viol: { name: "Viol", category: "instrument" },
};
const musicalInstrumentToolIds = Object.entries(toolDefinitions).filter(([, tool]) => tool.category === "instrument").map(([id]) => id);
const artisanToolIds = Object.entries(toolDefinitions).filter(([, tool]) => tool.category === "artisan").map(([id]) => id);
const classProficiencyPlans = {
  barbarian: { skillChoiceCount: 2, skillChoices: ["animal-handling", "athletics", "intimidation", "nature", "perception", "survival"] },
  bard: { skillChoiceCount: 3, skillChoices: allSkillIds, toolChoiceCount: 3, toolChoices: musicalInstrumentToolIds, expertiseByLevel: { 3: { count: 2, skillsOnly: true }, 10: { count: 2, skillsOnly: true } } },
  cleric: { skillChoiceCount: 2, skillChoices: ["history", "insight", "medicine", "persuasion", "religion"] },
  druid: { skillChoiceCount: 2, skillChoices: ["arcana", "animal-handling", "insight", "medicine", "nature", "perception", "religion", "survival"], toolProficiencies: ["herbalism-kit"] },
  fighter: { skillChoiceCount: 2, skillChoices: ["acrobatics", "animal-handling", "athletics", "history", "insight", "intimidation", "perception", "survival"] },
  monk: { skillChoiceCount: 2, skillChoices: ["acrobatics", "athletics", "history", "insight", "religion", "stealth"], toolChoiceCount: 1, toolChoices: [...artisanToolIds, ...musicalInstrumentToolIds] },
  paladin: { skillChoiceCount: 2, skillChoices: ["athletics", "insight", "intimidation", "medicine", "persuasion", "religion"] },
  ranger: { skillChoiceCount: 3, skillChoices: ["animal-handling", "athletics", "insight", "investigation", "nature", "perception", "stealth", "survival"] },
  rogue: { skillChoiceCount: 4, skillChoices: ["acrobatics", "athletics", "deception", "insight", "intimidation", "investigation", "perception", "performance", "persuasion", "sleight-of-hand", "stealth"], toolProficiencies: ["thieves-tools"], expertiseByLevel: { 1: { count: 2, allowedTools: ["thieves-tools"] }, 6: { count: 2, allowedTools: ["thieves-tools"] } } },
  sorcerer: { skillChoiceCount: 2, skillChoices: ["arcana", "deception", "insight", "intimidation", "persuasion", "religion"] },
  warlock: { skillChoiceCount: 2, skillChoices: ["arcana", "deception", "history", "intimidation", "investigation", "nature", "religion"] },
  wizard: { skillChoiceCount: 2, skillChoices: ["arcana", "history", "insight", "investigation", "medicine", "religion"] },
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
      toolChoiceCount: 1,
      toolChoices: ["smiths-tools", "brewers-supplies", "masons-tools"],
      traits: ["Dwarven Resilience: poison damage resistance.", "Dwarven Combat Training.", "Tool Proficiency: choose smith's tools, brewer's supplies, or mason's tools."],
    },
    subraces: {
      duergar: {
        name: "Duergar",
        abilityBonuses: { str: 1 },
        spellTraits: ["Duergar Enlarge active at level 3"],
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
      traits: ["Keen Senses: Perception proficiency."],
    },
    subraces: {
      drow: {
        name: "Drow",
        abilityBonuses: { cha: 1 },
        weaponProficiencies: ["rapier", "shortsword", "crossbow-hand"],
        spellTraits: ["Faerie Fire active at level 3"],
      },
      eladrin: {
        name: "Eladrin",
        abilityBonuses: { int: 1 },
        weaponProficiencies: ["longsword", "shortsword", "shortbow", "longbow"],
        traits: ["Fey Step: short-rest bonus-action teleport."],
      },
      "high-elf": {
        name: "High Elf",
        abilityBonuses: { int: 1 },
        weaponProficiencies: ["longsword", "shortsword", "shortbow", "longbow"],
        spellTraits: ["High Elf Fire Bolt cantrip"],
      },
      "shadar-kai": {
        name: "Shadar-kai",
        abilityBonuses: { con: 1 },
        damageResistances: ["necrotic"],
        traits: ["Blessing of the Raven Queen: short-rest bonus-action teleport."],
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
      traits: ["Draconic Resistance from ancestry.", "Breath Weapon: 15 ft ancestral cone."],
    },
    subraces: {
      chromatic: { name: "Chromatic", dragonCategory: "chromatic" },
      gem: { name: "Gem", dragonCategory: "gem", traits: ["Gem Flight active at level 5 as spectral wings."] },
      metallic: { name: "Metallic", dragonCategory: "metallic" },
    },
  },
  gnome: {
    name: "Gnome",
    base: { abilityBonuses: { int: 2 }, speedFeet: 25, size: "small", traits: ["Gnome Cunning stored for future magic-save context."] },
    subraces: {
      "deep-gnome": { name: "Deep Gnome", abilityBonuses: { dex: 1 }, traits: ["Stone Camouflage stored for future stealth rules."] },
      "forest-gnome": { name: "Forest Gnome", abilityBonuses: { dex: 1 }, spellTraits: ["Minor Illusion cantrip"], traits: ["Speak with Small Beasts: +2 to Animal Handling checks."] },
      "rock-gnome": { name: "Rock Gnome", abilityBonuses: { con: 1 }, toolProficiencies: ["tinkers-tools"] },
    },
  },
  "half-elf": {
    name: "Half-Elf",
    base: {
      abilityBonuses: { cha: 2 },
      speedFeet: 30,
      abilityChoiceCount: 2,
      skillChoiceCount: 2,
      traits: ["Skill Versatility: choose two skill proficiencies."],
    },
    subraces: {
      "drow-half-elf": { name: "Drow Descent", spellTraits: ["Drow Faerie Fire active at level 3"] },
      "high-half-elf": { name: "High Elf Descent", spellTraits: ["High Elf Fire Bolt cantrip"] },
      "wood-half-elf": { name: "Wood Elf Descent", speedFeet: 35, traits: ["Fleet of Foot: 35 ft speed."] },
    },
  },
  halfling: {
    name: "Halfling",
    base: {
      abilityBonuses: { dex: 2 },
      speedFeet: 25,
      size: "small",
      halflingLucky: true,
      traits: ["Lucky: reroll d20 natural 1s."],
    },
    subraces: {
      ghostwise: { name: "Ghostwise", abilityBonuses: { wis: 1 } },
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
  aasimar: {
    name: "Aasimar",
    base: {
      abilityBonuses: { cha: 2 },
      speedFeet: 30,
      damageResistances: ["necrotic", "radiant"],
      traits: ["Celestial Resistance: necrotic and radiant damage resistance.", "Healing Hands: heal a nearby hero once per long rest."],
    },
    subraces: {
      protector: { name: "Protector", abilityBonuses: { wis: 1 }, traits: ["Radiant Soul active at level 3 as a flying radiant combat transformation."] },
      scourge: { name: "Scourge", abilityBonuses: { con: 1 }, traits: ["Radiant Consumption active at level 3 as a dangerous radiant combat transformation."] },
      fallen: { name: "Fallen", abilityBonuses: { str: 1 }, traits: ["Necrotic Shroud active at level 3 as a frightening necrotic combat transformation."] },
    },
  },
  aarakocra: {
    name: "Aarakocra",
    base: {
      abilityBonuses: { dex: 2, wis: 1 },
      speedFeet: 50,
      flying: true,
      traits: ["Flight: this character is flying for movement and floor-trigger rules."],
    },
    subraces: {
      "elemental-evil": { name: "Elemental Evil" },
    },
  },
  goliath: {
    name: "Goliath",
    base: {
      abilityBonuses: { str: 2, con: 1 },
      speedFeet: 30,
      damageResistances: ["cold"],
      skillProficiencies: ["athletics"],
      powerfulBuild: true,
      traits: ["Natural Athlete: Athletics proficiency.", "Powerful Build: counts as one size larger for carrying and push/drag/lift weight.", "Stone's Endurance: reaction damage reduction once per short rest.", "Mountain Born: cold damage resistance."],
    },
    subraces: {
      "elemental-evil": { name: "Elemental Evil" },
    },
  },
  "yuan-ti": {
    name: "Yuan-ti",
    base: {
      abilityBonuses: { cha: 2, int: 1 },
      speedFeet: 30,
      damageImmunities: ["poison"],
      traits: ["Magic Resistance stored for future spell-save context.", "Poison Immunity: immune to poison damage.", "Poisoned condition immunity stored for future condition rules.", "Animal Friendship: +2 to Animal Handling checks."],
      spellTraits: ["Poison Spray cantrip", "Suggestion active at level 3"],
    },
    subraces: {
      pureblood: { name: "Pureblood" },
    },
  },
  genasi: {
    name: "Genasi",
    base: {
      abilityBonuses: { con: 2 },
      speedFeet: 30,
      traits: ["Elemental heritage."],
    },
    subraces: {
      air: { name: "Air", abilityBonuses: { dex: 1 }, speedFeet: 30, spellTraits: ["Levitate active at level 3 as a flying defensive lift"] },
      earth: { name: "Earth", abilityBonuses: { str: 1 }, spellTraits: ["Blade Ward cantrip", "Pass without Trace stored for future stealth rules"] },
      fire: { name: "Fire", abilityBonuses: { int: 1 }, damageResistances: ["fire"], traits: ["Fire Resistance: fire damage resistance."], spellTraits: ["Produce Flame cantrip", "Burning Hands active at level 3"] },
      water: { name: "Water", abilityBonuses: { wis: 1 }, damageResistances: ["acid"], traits: ["Acid Resistance: acid damage resistance."], spellTraits: ["Acid Splash cantrip"] },
    },
  },
  tiefling: {
    name: "Tiefling",
    base: { speedFeet: 30, damageResistances: ["fire"], traits: ["Hellish Resistance: fire damage resistance."] },
    subraces: {
      baalzebul: { name: "Baalzebul", abilityBonuses: { cha: 2, int: 1 }, spellTraits: ["Ray of Sickness active at level 3"] },
      dispater: { name: "Dispater", abilityBonuses: { cha: 2, dex: 1 } },
      fierna: { name: "Fierna", abilityBonuses: { cha: 2, wis: 1 } },
      glasya: { name: "Glasya", abilityBonuses: { cha: 2, dex: 1 }, spellTraits: ["Minor Illusion cantrip"] },
      levistus: { name: "Levistus", abilityBonuses: { cha: 2, con: 1 }, spellTraits: ["Ray of Frost cantrip", "Armor of Agathys active at level 3"] },
      mammon: { name: "Mammon", abilityBonuses: { cha: 2, int: 1 } },
      mephistopheles: { name: "Mephistopheles", abilityBonuses: { cha: 2, int: 1 }, spellTraits: ["Burning Hands active at level 3"] },
      zariel: { name: "Zariel", abilityBonuses: { cha: 2, str: 1 }, spellTraits: ["Branding Smite active at level 3"] },
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
  "sidekick-warrior": new Set([4, 8, 12, 14, 16, 19]),
  "sidekick-expert": new Set([4, 8, 10, 12, 16, 19]),
  "sidekick-spellcaster": new Set([4, 8, 12, 16, 18]),
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
  menuActions: document.querySelector(".menu-actions"),
  mainMenuBack: document.querySelector("#main-menu-back"),
  startAdventure: document.querySelector("#start-adventure"),
  loadMenu: document.querySelector("#load-menu"),
  settingsMenu: document.querySelector("#settings-menu"),
  mainSettings: document.querySelector("#main-settings"),
  chooseSaveFolder: document.querySelector("#choose-save-folder"),
  mainTutorial: document.querySelector("#main-tutorial"),
  saveSlots: document.querySelector("#save-slots"),
  saveStatus: document.querySelector("#save-status"),
  roomTitle: document.querySelector("#room-title"),
  bugReport: document.querySelector("#bug-report"),
  showDungeonIntro: document.querySelector("#show-dungeon-intro"),
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
  homeMainActions: document.querySelector("#home-main-actions"),
  homeAdventureActions: document.querySelector("#home-adventure-actions"),
  homeMainStoryActions: document.querySelector("#home-main-story-actions"),
  homeRandomDungeonActions: document.querySelector("#home-random-dungeon-actions"),
  homeCustomDungeonActions: document.querySelector("#home-custom-dungeon-actions"),
  goVillage: document.querySelector("#go-village"),
  goAdventure: document.querySelector("#go-adventure"),
  villageMenu: document.querySelector("#village-menu"),
  villageBody: document.querySelector("#village-body"),
  closeVillage: document.querySelector("#close-village"),
  buildHome: document.querySelector("#build-home"),
  goBarrowCrown: document.querySelector("#go-barrow-crown"),
  goThornwoodPact: document.querySelector("#go-thornwood-pact"),
  goNewDungeon: document.querySelector("#go-new-dungeon"),
  levelPanel: document.querySelector(".level-panel"),
  levelUp: document.querySelector("#level-up"),
  replaceRangerCompanion: document.querySelector("#replace-ranger-companion"),
  storeMenu: document.querySelector("#store-menu"),
  storeBody: document.querySelector("#store-body"),
  closeStore: document.querySelector("#close-store"),
  backStoreVillage: document.querySelector("#back-store-village"),
  log: document.querySelector("#combat-log"),
  roundLabel: document.querySelector("#round-label"),
  turnLabel: document.querySelector("#turn-label"),
  dungeonTimerLabel: document.querySelector("#dungeon-timer-label"),
  toggleDungeonTimer: document.querySelector("#toggle-dungeon-timer"),
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
  zoomSlider: document.querySelector("#zoom-slider"),
  volumeSliders: Array.from(document.querySelectorAll(".volume-slider")),
  volumeLabels: Array.from(document.querySelectorAll(".volume-label")),
  buttonThemeSelect: document.querySelector("#button-theme-select"),
  manageTokenArt: document.querySelector("#manage-token-art"),
  debugKill: document.querySelector("#debug-kill"),
  expandLog: document.querySelector("#expand-log"),
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

