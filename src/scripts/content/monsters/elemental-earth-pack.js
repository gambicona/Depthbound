(() => {

/* ============================================================
 * ELEMENTAL / EARTH MONSTER PACK
 * Theme: earth elementals, stone spirits, mud, crystal, metal, sand, dust, gravity, and buried-world paraelementals.
 * Notes: Every monster starts its tags with "elemental" as requested.
 * ============================================================ */


/* ============================================================
 * CATEGORY 1 — Party Level 1/2
 * Theme: pebble spirits, dust pests, mud grips, and weak stone brutes
 * ============================================================ */

window.DungeonContent.register("monsters", "pebbleling", {
  name: "Pebbleling",
  role: "Tiny stone swarm skirmisher",
  tags: ["elemental", "earth", "stone", "small", "skirmisher"],
  maxHp: 12,
  category: 1,
  xp: 70,
  ac: 13,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 6,
    bonus: 2,
    type: "bludgeoning",
    attackType: "weapon",
    label: "1d6 + 2 bludgeoning",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Pebble Scatter", // On death: adjacent creatures make Dex save 11 or take 1d4 bludgeoning.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "P",
  tokenArt: "assets/tokens/pebbleling.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "dustMephitling", {
  name: "Dust Mephitling",
  role: "Weak flying dust paraelemental",
  tags: ["elemental", "earth", "dust", "paraelemental", "flying", "ranged"],
  maxHp: 13,
  category: 1,
  xp: 75,
  ac: 12,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 6,
    bonus: 2,
    type: "necrotic",
    attackType: "spell",
    label: "1d6 + 2 necrotic",
    range: { kind: "ranged", normal: 30, long: 90, feet: 30 },
  },
  damageResistances: ["necrotic", "bludgeoning"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Dust Cough", // On hit: target has -1 to its next attack roll until end of next turn.
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "D",
  tokenArt: "assets/tokens/dust-mephitling.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "mudGripCrawler", {
  name: "Mud Grip Crawler",
  role: "Low mud restrainer",
  tags: ["elemental", "earth", "mud", "paraelemental", "crawler"],
  maxHp: 15,
  category: 1,
  xp: 85,
  ac: 13,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 8,
    bonus: 2,
    type: "bludgeoning",
    attackType: "weapon",
    label: "1d8 + 2 bludgeoning",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Mud Grip", // On hit: Str save 11 or target speed is reduced by 10 ft for one round.
  ],
  initiativeBonus: 2,
  speedFeet: 25,
  behavior: "melee",
  token: "M",
  tokenArt: "assets/tokens/mud-grip-crawler.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "barrowStoneBully", {
  name: "Barrow-Stone Bully",
  role: "Category 1 earth boss",
  tags: ["elemental", "earth", "stone", "boss", "brute"],
  maxHp: 32,
  category: 1,
  xp: 1730,
  ac: 14,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 10,
    bonus: 3,
    type: "bludgeoning",
    attackType: "weapon",
    label: "1d10 + 3 bludgeoning",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Stone Hide", // First hit each round is reduced by 2 damage.
    "Graveyard Slam", // 10 ft line, Str save 12 or 2d6 bludgeoning and pushed 5 ft.
  ],
  initiativeBonus: 1,
  speedFeet: 25,
  behavior: "melee",
  token: "B",
  tokenArt: "assets/tokens/barrow-stone-bully.jpg",
  flying: false,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});


/* ============================================================
 * CATEGORY 2 — Party Level 3/4
 * Theme: shale beasts, sandglass skirmishers, clay binders, and animated idols
 * ============================================================ */

window.DungeonContent.register("monsters", "shaleHound", {
  name: "Shale Hound",
  role: "Fast jagged stone hunter",
  tags: ["elemental", "earth", "shale", "beastlike", "skirmisher"],
  maxHp: 26,
  category: 2,
  xp: 435,
  ac: 14,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 8,
    bonus: 3,
    type: "piercing",
    attackType: "weapon",
    label: "1d8 + 3 piercing",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Stone Pounce", // If it moved at least 15 ft before the hit, add 1d6 piercing.
  ],
  initiativeBonus: 2,
  speedFeet: 35,
  behavior: "melee",
  token: "S",
  tokenArt: "assets/tokens/shale-hound.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "sandglassNeedler", {
  name: "Sandglass Needler",
  role: "Ranged glass-sand striker",
  tags: ["elemental", "earth", "sand", "glass", "paraelemental", "ranged"],
  maxHp: 24,
  category: 2,
  xp: 450,
  ac: 15,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 8,
    bonus: 3,
    type: "piercing",
    attackType: "weapon",
    label: "1d8 + 3 piercing",
    range: { kind: "ranged", normal: 60, long: 180, feet: 60 },
  },
  damageResistances: ["piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Needle Spray", // Small cone attack; Dex save 13 or take piercing damage and lose 5 ft speed.
  ],
  initiativeBonus: 3,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "S",
  tokenArt: "assets/tokens/sandglass-needler.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "claybinderAcolyte", {
  name: "Claybinder Acolyte",
  role: "Binding clay caster",
  tags: ["elemental", "earth", "clay", "caster", "controller"],
  maxHp: 30,
  category: 2,
  xp: 475,
  ac: 13,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 10,
    bonus: 3,
    type: "bludgeoning",
    attackType: "spell",
    label: "1d10 + 3 bludgeoning",
    range: { kind: "ranged", normal: 30, long: 90, feet: 30 },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Clay Bind", // Ranged save effect; Str save 13 or restrained until damaged or end of next turn.
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "C",
  tokenArt: "assets/tokens/claybinder-acolyte.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "gravenIdolGuardian", {
  name: "Graven Idol Guardian",
  role: "Category 2 earth boss",
  sizeSquares: 2,
  tags: ["elemental", "earth", "idol", "stone", "boss", "guardian"],
  maxHp: 62,
  category: 2,
  xp: 12895,
  ac: 15,
  attackBonus: 6,
  damage: {
    count: 2,
    sides: 6,
    bonus: 4,
    type: "bludgeoning",
    attackType: "weapon",
    label: "2d6 + 4 bludgeoning",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Idol Ward", // Adjacent allies gain +1 AC while the guardian is alive.
    "Topple Curse", // 10 ft radius tremor; Dex save 13 or knocked prone and damaged.
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "melee",
  token: "G",
  tokenArt: "assets/tokens/graven-idol-guardian.jpg",
  flying: false,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});


/* ============================================================
 * CATEGORY 3 — Party Level 5/6
 * Theme: crystal backs, grave-soil elementals, ore soldiers, and quake champions
 * ============================================================ */

window.DungeonContent.register("monsters", "crystalbackMauler", {
  name: "Crystalback Mauler",
  role: "Crystalline melee brute",
  tags: ["elemental", "earth", "crystal", "brute"],
  maxHp: 48,
  category: 3,
  xp: 1875,
  ac: 16,
  attackBonus: 6,
  damage: {
    count: 2,
    sides: 6,
    bonus: 3,
    type: "slashing",
    attackType: "weapon",
    label: "2d6 + 3 slashing",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["slashing", "piercing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Shatter Spines", // When hit in melee: attacker takes 1d4 slashing recoil damage.
  ],
  initiativeBonus: 2,
  speedFeet: 35,
  behavior: "melee",
  token: "C",
  tokenArt: "assets/tokens/crystalback-mauler.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "graveSoilElemental", {
  name: "Grave-Soil Elemental",
  role: "Necrotic earth paraelemental",
  tags: ["elemental", "earth", "soil", "grave", "necrotic", "paraelemental"],
  maxHp: 52,
  category: 3,
  xp: 1935,
  ac: 14,
  attackBonus: 6,
  damage: {
    count: 2,
    sides: 6,
    bonus: 4,
    type: "necrotic",
    attackType: "weapon",
    label: "2d6 + 4 necrotic",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["necrotic", "bludgeoning"],
  damageVulnerabilities: ["radiant", "thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Burial Pull", // On hit: target is pulled 5 ft and slowed by grave soil.
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "melee",
  token: "G",
  tokenArt: "assets/tokens/grave-soil-elemental.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "ironOreMyrmidon", {
  name: "Iron Ore Myrmidon",
  role: "Dense ore soldier",
  tags: ["elemental", "earth", "metal", "ore", "myrmidon"],
  maxHp: 55,
  category: 3,
  xp: 1990,
  ac: 16,
  attackBonus: 6,
  damage: {
    count: 2,
    sides: 8,
    bonus: 3,
    type: "bludgeoning",
    attackType: "weapon",
    label: "2d8 + 3 bludgeoning",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "fire"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Iron Stance", // Cannot be pushed unless the effect succeeds by 5 or more.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "I",
  tokenArt: "assets/tokens/iron-ore-myrmidon.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "quakeFistChampion", {
  name: "Quake-Fist Champion",
  role: "Category 3 earth boss",
  tags: ["elemental", "earth", "quake", "boss", "brute"],
  maxHp: 105,
  category: 3,
  xp: 17125,
  ac: 17,
  attackBonus: 7,
  damage: {
    count: 2,
    sides: 8,
    bonus: 5,
    type: "bludgeoning",
    attackType: "weapon",
    label: "2d8 + 5 bludgeoning",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Quake Fist", // 10 ft cone; Str save 14 or damage plus prone.
    "Fault Step", // Once per fight: burrow up to 20 ft and emerge beside a target.
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "melee",
  token: "Q",
  tokenArt: "assets/tokens/quake-fist-champion.jpg",
  flying: false,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});


/* ============================================================
 * CATEGORY 4 — Party Level 7/8
 * Theme: obsidian blades, mudslides, granite walls, and stone-crowned wardens
 * ============================================================ */

window.DungeonContent.register("monsters", "obsidianRazor", {
  name: "Obsidian Razor",
  role: "Sharp volcanic glass duelist",
  tags: ["elemental", "earth", "obsidian", "glass", "skirmisher"],
  maxHp: 78,
  category: 4,
  multiattack: { attacks: 2 },
  xp: 1900,
  ac: 17,
  attackBonus: 7,
  damage: {
    count: 2,
    sides: 8,
    bonus: 4,
    type: "slashing",
    attackType: "weapon",
    label: "2d8 + 4 slashing",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["fire", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Bleeding Edge", // On hit: target takes 1d4 slashing at start of next turn unless healed.
  ],
  initiativeBonus: 3,
  speedFeet: 40,
  behavior: "melee",
  token: "O",
  tokenArt: "assets/tokens/obsidian-razor.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "mudslideRavager", {
  name: "Mudslide Ravager",
  role: "Heavy mud-wave charger",
  tags: ["elemental", "earth", "mud", "landslide", "paraelemental"],
  maxHp: 82,
  category: 4,
  multiattack: { attacks: 2 },
  xp: 1960,
  ac: 16,
  attackBonus: 7,
  damage: {
    count: 2,
    sides: 8,
    bonus: 5,
    type: "bludgeoning",
    attackType: "weapon",
    label: "2d8 + 5 bludgeoning",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Mudslide Rush", // Line charge; Dex save 15 or pushed and slowed.
  ],
  initiativeBonus: 1,
  speedFeet: 35,
  behavior: "melee",
  token: "M",
  tokenArt: "assets/tokens/mudslide-ravager.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "graniteBulwark", {
  name: "Granite Bulwark",
  role: "Defensive stone wall monster",
  sizeSquares: 2,
  tags: ["elemental", "earth", "granite", "guardian", "tank"],
  maxHp: 90,
  category: 4,
  multiattack: { attacks: 2 },
  xp: 2020,
  ac: 18,
  attackBonus: 7,
  damage: {
    count: 2,
    sides: 10,
    bonus: 4,
    type: "bludgeoning",
    attackType: "weapon",
    label: "2d10 + 4 bludgeoning",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Living Cover", // Allies behind it count as having half cover.
    "Guarding Slab", // Reaction idea: reduce damage to adjacent ally.
  ],
  initiativeBonus: 1,
  speedFeet: 25,
  behavior: "melee",
  token: "G",
  tokenArt: "assets/tokens/granite-bulwark.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "stoneCrownWarden", {
  name: "Stone-Crown Warden",
  role: "Category 4 earth boss",
  tags: ["elemental", "earth", "stone", "boss", "warden"],
  maxHp: 150,
  category: 4,
  multiattack: { attacks: 2 },
  xp: 14755,
  ac: 18,
  attackBonus: 8,
  damage: {
    count: 3,
    sides: 6,
    bonus: 6,
    type: "bludgeoning",
    attackType: "weapon",
    label: "3d6 + 6 bludgeoning",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Crown of Cairns", // Summon or empower small stone adds once per fight.
    "Stone Regrowth", // Action: heals a wounded monster ally within 30 ft.
    "Seismic Sentence", // 20 ft radius pulse; Dex save 15 or damage and prone.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "S",
  tokenArt: "assets/tokens/stone-crown-warden.jpg",
  flying: false,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});


/* ============================================================
 * CATEGORY 5 — Party Level 9/10
 * Theme: sandstorm burrowers, crystal seers, basalt stompers, and mountain hearts
 * ============================================================ */

window.DungeonContent.register("monsters", "sandstormBurrower", {
  name: "Sandstorm Burrower",
  role: "Burrowing abrasive paraelemental",
  tags: ["elemental", "earth", "sand", "storm", "paraelemental", "burrower"],
  maxHp: 118,
  category: 5,
  multiattack: { attacks: 2 },
  xp: 2135,
  ac: 18,
  attackBonus: 8,
  damage: {
    count: 3,
    sides: 8,
    bonus: 5,
    type: "slashing",
    attackType: "weapon",
    label: "3d8 + 5 slashing",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Sandblind Ambush", // After burrowing, first hit can blind until end of next turn.
  ],
  initiativeBonus: 2,
  speedFeet: 40,
  behavior: "melee",
  token: "S",
  tokenArt: "assets/tokens/sandstorm-burrower.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "crystalChoirSeer", {
  name: "Crystal Choir Seer",
  role: "Ranged crystal resonance caster",
  tags: ["elemental", "earth", "crystal", "caster", "ranged"],
  maxHp: 105,
  category: 5,
  xp: 2195,
  ac: 17,
  attackBonus: 8,
  damage: {
    count: 3,
    sides: 6,
    bonus: 6,
    type: "thunder",
    attackType: "spell",
    label: "3d6 + 6 thunder",
    range: { kind: "ranged", normal: 60, long: 180, feet: 60 },
  },
  damageResistances: ["psychic", "piercing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Resonant Note", // Line spell; Con save 16 or thunder damage and cannot take reactions.
  ],
  initiativeBonus: 4,
  speedFeet: 35,
  behavior: "rangedKiter",
  token: "C",
  tokenArt: "assets/tokens/crystal-choir-seer.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "basaltStomper", {
  name: "Basalt Stomper",
  role: "Massive basalt bruiser",
  sizeSquares: 2,
  tags: ["elemental", "earth", "basalt", "brute"],
  maxHp: 125,
  category: 5,
  multiattack: { attacks: 2 },
  xp: 2265,
  ac: 18,
  attackBonus: 8,
  damage: {
    count: 3,
    sides: 10,
    bonus: 5,
    type: "bludgeoning",
    attackType: "weapon",
    label: "3d10 + 5 bludgeoning",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["fire", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Crater Step", // Moving through its adjacent squares counts as difficult terrain.
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "melee",
  token: "B",
  tokenArt: "assets/tokens/basalt-stomper.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "mountainHeartGolem", {
  name: "Mountain-Heart Golem",
  role: "Category 5 earth boss",
  sizeSquares: 3,
  tags: ["elemental", "earth", "mountain", "golem", "boss"],
  maxHp: 205,
  category: 5,
  multiattack: { attacks: 2 },
  xp: 19525,
  ac: 19,
  attackBonus: 9,
  damage: {
    count: 3,
    sides: 10,
    bonus: 7,
    type: "bludgeoning",
    attackType: "weapon",
    label: "3d10 + 7 bludgeoning",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Mountain Heart", // Regains small HP when standing on natural stone.
    "Avalanche Hammer", // Cone attack; Str save 16 or heavy bludgeoning and pushed 10 ft.
  ],
  initiativeBonus: 2,
  speedFeet: 35,
  behavior: "melee",
  token: "M",
  tokenArt: "assets/tokens/mountain-heart-golem.jpg",
  flying: false,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});


/* ============================================================
 * CATEGORY 6 — Party Level 11/12
 * Theme: ironroot giants, glass-edge terrans, tremor shells, and deep mantle lords
 * ============================================================ */

window.DungeonContent.register("monsters", "ironrootColossus", {
  name: "Ironroot Colossus",
  role: "Root-and-ore giant defender",
  sizeSquares: 3,
  tags: ["elemental", "earth", "metal", "root", "colossus"],
  maxHp: 155,
  category: 6,
  multiattack: { attacks: 2 },
  xp: 1820,
  ac: 19,
  attackBonus: 9,
  damage: {
    count: 4,
    sides: 8,
    bonus: 5,
    type: "bludgeoning",
    attackType: "weapon",
    label: "4d8 + 5 bludgeoning",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "lightning"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Root Lock", // Aura: enemies starting adjacent lose 5 ft speed.
  ],
  initiativeBonus: 1,
  speedFeet: 35,
  behavior: "melee",
  token: "I",
  tokenArt: "assets/tokens/ironroot-colossus.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "glassEdgeTerran", {
  name: "Glass-Edge Terran",
  role: "High damage glass earth assassin",
  tags: ["elemental", "earth", "glass", "crystal", "skirmisher"],
  maxHp: 135,
  category: 6,
  multiattack: { attacks: 2 },
  xp: 1870,
  ac: 18,
  attackBonus: 9,
  damage: {
    count: 4,
    sides: 6,
    bonus: 7,
    type: "slashing",
    attackType: "weapon",
    label: "4d6 + 7 slashing",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["slashing", "psychic"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Glass Refract", // First ranged attack against it each round has disadvantage or reduced hit chance.
  ],
  initiativeBonus: 3,
  speedFeet: 40,
  behavior: "melee",
  token: "G",
  tokenArt: "assets/tokens/glass-edge-terran.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "tremorShellBehemoth", {
  name: "Tremor-Shell Behemoth",
  role: "Armored tremor beast",
  sizeSquares: 2,
  tags: ["elemental", "earth", "tremor", "behemoth", "tank"],
  maxHp: 165,
  category: 6,
  multiattack: { attacks: 2 },
  xp: 1910,
  ac: 19,
  attackBonus: 9,
  damage: {
    count: 4,
    sides: 10,
    bonus: 6,
    type: "bludgeoning",
    attackType: "weapon",
    label: "4d10 + 6 bludgeoning",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Tremor Shell", // When bloodied: emits tremor; Dex save 17 or prone.
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "melee",
  token: "T",
  tokenArt: "assets/tokens/tremor-shell-behemoth.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "deepMantleRegent", {
  name: "Deep Mantle Regent",
  role: "Category 6 earth boss",
  sizeSquares: 2,
  tags: ["elemental", "earth", "mantle", "boss", "regent"],
  maxHp: 260,
  category: 6,
  multiattack: { attacks: 2 },
  xp: 19715,
  ac: 20,
  attackBonus: 10,
  damage: {
    count: 5,
    sides: 6,
    bonus: 8,
    type: "bludgeoning",
    attackType: "weapon",
    label: "5d6 + 8 bludgeoning",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Mantle Command", // Once per fight: all earth allies may move or attack.
    "Magma Fault", // Line attack; Dex save 17 or bludgeoning plus fire side damage.
  ],
  initiativeBonus: 2,
  speedFeet: 35,
  behavior: "melee",
  token: "D",
  tokenArt: "assets/tokens/deep-mantle-regent.jpg",
  flying: false,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});


/* ============================================================
 * CATEGORY 7 — Party Level 13/14
 * Theme: titanlings, landslides, gem serpents, and fault kings
 * ============================================================ */

window.DungeonContent.register("monsters", "obsidianTitanling", {
  name: "Obsidian Titanling",
  role: "Young black-glass titan",
  sizeSquares: 2,
  tags: ["elemental", "earth", "obsidian", "titan", "brute"],
  maxHp: 195,
  category: 7,
  multiattack: { attacks: 2 },
  xp: 2100,
  ac: 20,
  attackBonus: 10,
  damage: {
    count: 4,
    sides: 10,
    bonus: 7,
    type: "slashing",
    attackType: "weapon",
    label: "4d10 + 7 slashing",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["fire", "slashing", "piercing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Black Glass Body", // Melee attackers take small slashing recoil.
  ],
  initiativeBonus: 2,
  speedFeet: 40,
  behavior: "melee",
  token: "O",
  tokenArt: "assets/tokens/obsidian-titanling.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "livingLandslide", {
  name: "Living Landslide",
  role: "Rolling terrain disaster",
  tags: ["elemental", "earth", "landslide", "paraelemental", "hazard"],
  maxHp: 185,
  category: 7,
  multiattack: { attacks: 2 },
  xp: 2165,
  ac: 19,
  attackBonus: 10,
  damage: {
    count: 5,
    sides: 6,
    bonus: 7,
    type: "bludgeoning",
    attackType: "weapon",
    label: "5d6 + 7 bludgeoning",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Engulfing Slide", // Can move through creatures; Str save 18 or carried 10 ft and damaged.
  ],
  initiativeBonus: 2,
  speedFeet: 40,
  behavior: "melee",
  token: "L",
  tokenArt: "assets/tokens/living-landslide.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "gemscaleEarthSerpent", {
  name: "Gemscale Earth Serpent",
  role: "Burrowing crystal serpent",
  sizeSquares: 2,
  tags: ["elemental", "earth", "crystal", "serpent", "burrower"],
  maxHp: 190,
  category: 7,
  multiattack: { attacks: 2 },
  xp: 2245,
  ac: 20,
  attackBonus: 10,
  damage: {
    count: 4,
    sides: 8,
    bonus: 8,
    type: "piercing",
    attackType: "weapon",
    label: "4d8 + 8 piercing",
    range: { kind: "melee", feet: 10 },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Gemscale Flash", // Recharge idea: Wis save 18 or blinded by crystal light for one turn.
  ],
  initiativeBonus: 3,
  speedFeet: 40,
  behavior: "melee",
  token: "G",
  tokenArt: "assets/tokens/gemscale-earth-serpent.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "kingBeneathTheFault", {
  name: "King Beneath the Fault",
  role: "Category 7 earth boss",
  tags: ["elemental", "earth", "fault", "boss", "king"],
  maxHp: 315,
  category: 7,
  multiattack: { attacks: 2 },
  xp: 21790,
  ac: 21,
  attackBonus: 11,
  damage: {
    count: 5,
    sides: 8,
    bonus: 9,
    type: "bludgeoning",
    attackType: "weapon",
    label: "5d8 + 9 bludgeoning",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Fault Throne", // Creates cracked-earth zones that become difficult terrain.
    "Royal Tremor", // Large radius; Dex save 18 or damage, prone, and pulled toward the boss.
  ],
  initiativeBonus: 3,
  speedFeet: 40,
  behavior: "melee",
  token: "K",
  tokenArt: "assets/tokens/king-beneath-the-fault.jpg",
  flying: false,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});


/* ============================================================
 * CATEGORY 8 — Party Level 15/16
 * Theme: adamantine warriors, crystal monoliths, sinkholes, and buried-city archons
 * ============================================================ */

window.DungeonContent.register("monsters", "adamantineMyrmidon", {
  name: "Adamantine Myrmidon",
  role: "Elite metal earth soldier",
  tags: ["elemental", "earth", "adamantine", "metal", "myrmidon"],
  maxHp: 235,
  category: 8,
  multiattack: { attacks: 2 },
  xp: 2930,
  ac: 21,
  attackBonus: 11,
  damage: {
    count: 5,
    sides: 10,
    bonus: 8,
    type: "bludgeoning",
    attackType: "weapon",
    label: "5d10 + 8 bludgeoning",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "fire", "lightning"],
  damageVulnerabilities: [],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Adamantine Frame", // Critical hits against it become normal hits.
  ],
  initiativeBonus: 2,
  speedFeet: 40,
  behavior: "melee",
  token: "A",
  tokenArt: "assets/tokens/adamantine-myrmidon.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "crystalMonolith", {
  name: "Crystal Monolith",
  role: "Immobile-ish ranged crystal artillery",
  tags: ["elemental", "earth", "crystal", "monolith", "ranged"],
  maxHp: 220,
  category: 8,
  xp: 3005,
  ac: 20,
  attackBonus: 11,
  damage: {
    count: 5,
    sides: 8,
    bonus: 8,
    type: "radiant",
    attackType: "spell",
    label: "5d8 + 8 radiant",
    range: { kind: "ranged", normal: 60, long: 180, feet: 60 },
  },
  damageResistances: ["radiant", "psychic", "piercing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Prismatic Lance", // Long line spell; Dex save 19 or radiant damage and marked.
  ],
  initiativeBonus: 3,
  speedFeet: 45,
  behavior: "rangedKiter",
  token: "C",
  tokenArt: "assets/tokens/crystal-monolith.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "sinkholeDevourer", {
  name: "Sinkhole Devourer",
  role: "Terrain-eating earth horror",
  sizeSquares: 2,
  tags: ["elemental", "earth", "sinkhole", "devourer", "control"],
  maxHp: 250,
  category: 8,
  multiattack: { attacks: 2 },
  xp: 3090,
  ac: 22,
  attackBonus: 11,
  damage: {
    count: 4,
    sides: 12,
    bonus: 9,
    type: "bludgeoning",
    attackType: "weapon",
    label: "4d12 + 9 bludgeoning",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Open Sinkhole", // Creates a temporary pit/slow zone under a target.
  ],
  initiativeBonus: 1,
  speedFeet: 35,
  behavior: "melee",
  token: "S",
  tokenArt: "assets/tokens/sinkhole-devourer.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "archonOfBuriedCities", {
  name: "Archon of Buried Cities",
  role: "Category 8 earth boss",
  tags: ["elemental", "earth", "ruin", "boss", "archon"],
  maxHp: 385,
  category: 8,
  multiattack: { attacks: 2 },
  xp: 11160,
  ac: 22,
  attackBonus: 12,
  damage: {
    count: 6,
    sides: 8,
    bonus: 10,
    type: "bludgeoning",
    attackType: "weapon",
    label: "6d8 + 10 bludgeoning",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Buried City Aura", // Stone furniture/obstacles near it count as hazardous.
    "Collapse District", // Huge area attack; Dex save 19 or heavy bludgeoning and restrained by rubble.
  ],
  initiativeBonus: 3,
  speedFeet: 40,
  behavior: "melee",
  token: "A",
  tokenArt: "assets/tokens/archon-of-buried-cities.jpg",
  flying: false,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});


/* ============================================================
 * CATEGORY 9 — Party Level 17/18
 * Theme: continental shards, gravity geodes, world pillars, and seismic patriarchs
 * ============================================================ */

window.DungeonContent.register("monsters", "continentalShard", {
  name: "Continental Shard",
  role: "Fragment of a living continent",
  sizeSquares: 3,
  tags: ["elemental", "earth", "continent", "shard", "titan"],
  maxHp: 285,
  category: 9,
  multiattack: { attacks: 3 },
  xp: 3600,
  ac: 22,
  attackBonus: 12,
  damage: {
    count: 6,
    sides: 8,
    bonus: 9,
    type: "bludgeoning",
    attackType: "weapon",
    label: "6d8 + 9 bludgeoning",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "fire", "cold"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Continental Weight", // Targets hit must Str save 20 or lose their next movement.
  ],
  initiativeBonus: 2,
  speedFeet: 45,
  behavior: "melee",
  token: "C",
  tokenArt: "assets/tokens/continental-shard.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "gravityGeode", {
  name: "Gravity Geode",
  role: "Gravity-bending crystal elemental",
  tags: ["elemental", "earth", "gravity", "crystal", "caster"],
  maxHp: 270,
  category: 9,
  xp: 3675,
  ac: 21,
  attackBonus: 12,
  damage: {
    count: 6,
    sides: 6,
    bonus: 10,
    type: "force",
    attackType: "spell",
    label: "6d6 + 10 force",
    range: { kind: "ranged", normal: 60, long: 180, feet: 60 },
  },
  damageResistances: ["force", "psychic"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Reverse Weight", // Save effect: target is pulled, pushed, or briefly suspended.
  ],
  initiativeBonus: 3,
  speedFeet: 45,
  behavior: "rangedKiter",
  token: "G",
  tokenArt: "assets/tokens/gravity-geode.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "worldpillarColossus", {
  name: "Worldpillar Colossus",
  role: "Tower-sized pillar guardian",
  sizeSquares: 3,
  tags: ["elemental", "earth", "worldpillar", "colossus", "guardian"],
  maxHp: 300,
  category: 9,
  multiattack: { attacks: 3 },
  xp: 3730,
  ac: 23,
  attackBonus: 12,
  damage: {
    count: 5,
    sides: 12,
    bonus: 10,
    type: "bludgeoning",
    attackType: "weapon",
    label: "5d12 + 10 bludgeoning",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "radiant"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Pillar Fall", // Line attack; Dex save 20 or massive bludgeoning and prone.
  ],
  initiativeBonus: 1,
  speedFeet: 35,
  behavior: "melee",
  token: "W",
  tokenArt: "assets/tokens/worldpillar-colossus.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "theSeismicPatriarch", {
  name: "The Seismic Patriarch",
  role: "Category 9 earth boss",
  tags: ["elemental", "earth", "seismic", "boss", "patriarch"],
  maxHp: 460,
  category: 9,
  multiattack: { attacks: 3 },
  xp: 14995,
  ac: 23,
  attackBonus: 13,
  damage: {
    count: 6,
    sides: 10,
    bonus: 11,
    type: "bludgeoning",
    attackType: "weapon",
    label: "6d10 + 11 bludgeoning",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Seismic Dominion", // Each round creates one quake zone in line of sight.
    "Tectonic Verdict", // Huge cone; Str save 20 or damage, prone, and pushed 15 ft.
  ],
  initiativeBonus: 3,
  speedFeet: 45,
  behavior: "melee",
  token: "T",
  tokenArt: "assets/tokens/the-seismic-patriarch.jpg",
  flying: false,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});


/* ============================================================
 * CATEGORY 10 — Party Level 19/20
 * Theme: primordial bedrock, diamond fault avatars, living mountains, and inner-earth sovereigns
 * ============================================================ */

window.DungeonContent.register("monsters", "primordialBedrock", {
  name: "Primordial Bedrock",
  role: "Ancient bedrock avatar",
  sizeSquares: 3,
  tags: ["elemental", "earth", "primordial", "bedrock", "avatar"],
  maxHp: 360,
  category: 10,
  multiattack: { attacks: 4 },
  xp: 4705,
  ac: 23,
  attackBonus: 14,
  damage: {
    count: 7,
    sides: 8,
    bonus: 11,
    type: "bludgeoning",
    attackType: "weapon",
    label: "7d8 + 11 bludgeoning",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "fire", "cold", "lightning"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Older Than Roads", // Immune to forced movement and cannot be knocked prone.
  ],
  initiativeBonus: 3,
  speedFeet: 45,
  behavior: "melee",
  token: "P",
  tokenArt: "assets/tokens/primordial-bedrock.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "diamondFaultAvatar", {
  name: "Diamond Fault Avatar",
  role: "Cutting diamond-earth demigod",
  sizeSquares: 3,
  tags: ["elemental", "earth", "diamond", "fault", "avatar"],
  maxHp: 340,
  category: 10,
  multiattack: { attacks: 4 },
  xp: 4810,
  ac: 23,
  attackBonus: 14,
  damage: {
    count: 7,
    sides: 6,
    bonus: 12,
    type: "slashing",
    attackType: "weapon",
    label: "7d6 + 12 slashing",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["slashing", "piercing", "radiant", "force"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Diamond Refraction", // Reflects a small part of spell/ranged damage once per round.
  ],
  initiativeBonus: 4,
  speedFeet: 50,
  behavior: "melee",
  token: "D",
  tokenArt: "assets/tokens/diamond-fault-avatar.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "livingMountain", {
  name: "Living Mountain",
  role: "Walking mountain catastrophe",
  sizeSquares: 3,
  tags: ["elemental", "earth", "mountain", "colossus", "catastrophe"],
  maxHp: 380,
  category: 10,
  multiattack: { attacks: 4 },
  xp: 4930,
  ac: 24,
  attackBonus: 14,
  damage: {
    count: 8,
    sides: 6,
    bonus: 11,
    type: "bludgeoning",
    attackType: "weapon",
    label: "8d6 + 11 bludgeoning",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "fire", "cold"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Mountain Walks", // Every move creates rubble difficult terrain behind it.
  ],
  initiativeBonus: 2,
  speedFeet: 40,
  behavior: "melee",
  token: "L",
  tokenArt: "assets/tokens/living-mountain.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "sovereignOfTheInnerEarth", {
  name: "Sovereign of the Inner Earth",
  role: "Category 10 earth boss",
  sizeSquares: 3,
  tags: ["elemental", "earth", "inner-plane", "boss", "sovereign"],
  maxHp: 620,
  category: 10,
  multiattack: { attacks: 3 },
  xp: 13675,
  ac: 24,
  attackBonus: 15,
  damage: {
    count: 8,
    sides: 8,
    bonus: 13,
    type: "bludgeoning",
    attackType: "weapon",
    label: "8d8 + 13 bludgeoning",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "petrified"],
  specialAbility: [
    "Sovereign Faultline", // Splits the arena with a damaging crack.
    "Continental Command", // Once per fight: all enemies save or are pulled, prone, and buried.
  ],
  initiativeBonus: 4,
  speedFeet: 50,
  behavior: "melee",
  token: "S",
  tokenArt: "assets/tokens/sovereign-of-the-inner-earth.jpg",
  flying: false,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});

})();
