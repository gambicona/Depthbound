(() => {

/* ============================================================
 * ELEMENTAL / AIR MONSTER PACK
 * Theme: air elementals, wind, dust, fog, lightning, thunder, storm, vacuum, pressure, and sky paraelementals.
 * Notes: Every monster starts its tags with "elemental" as requested.
 * ============================================================ */


/* ============================================================
 * CATEGORY 1 — Party Level 1/2
 * Theme: breeze wisps, sparkwing pests, dust devils, and weak gale screamers
 * ============================================================ */

window.DungeonContent.register("monsters", "breezeWisp", {
  name: "Breeze Wisp",
  role: "Tiny evasive air spirit",
  tags: ["elemental", "air", "breeze", "wisp", "skirmisher"],
  maxHp: 12,
  category: 1,
  xp: 55,
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
  damageResistances: ["lightning", "thunder"],
  damageVulnerabilities: ["force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Slipstream", // After attacking, may move 5 ft without provoking.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "B",
  tokenArt: "assets/tokens/breeze-wisp.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "sparkwingMephitling", {
  name: "Sparkwing Mephitling",
  role: "Weak lightning paraelemental",
  tags: ["elemental", "air", "lightning", "storm", "paraelemental", "ranged"],
  maxHp: 13,
  category: 1,
  xp: 60,
  ac: 12,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 6,
    bonus: 2,
    type: "lightning",
    attackType: "spell",
    label: "1d6 + 2 lightning",
    range: { kind: "ranged", normal: 30, long: 90, feet: 30 },
  },
  damageResistances: ["lightning"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Static Bite", // On hit: target cannot take reactions until end of next turn.
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "S",
  tokenArt: "assets/tokens/sparkwing-mephitling.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "dustDevil", {
  name: "Dust Devil",
  role: "Dust-air paraelemental spinner",
  tags: ["elemental", "air", "dust", "paraelemental", "controller"],
  maxHp: 15,
  category: 1,
  xp: 65,
  ac: 13,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 8,
    bonus: 2,
    type: "slashing",
    attackType: "weapon",
    label: "1d8 + 2 slashing",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["slashing", "lightning"],
  damageVulnerabilities: ["force", "cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Dust Spin", // Adjacent targets Dex save 11 or take slashing and lose 5 ft speed.
  ],
  initiativeBonus: 2,
  speedFeet: 25,
  behavior: "melee",
  token: "D",
  tokenArt: "assets/tokens/dust-devil.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "galeRoostScreamer", {
  name: "Gale-Roost Screamer",
  role: "Category 1 air boss",
  tags: ["elemental", "air", "gale", "boss", "screamer"],
  maxHp: 32,
  category: 1,
  xp: 150,
  ac: 14,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 10,
    bonus: 3,
    type: "thunder",
    attackType: "weapon",
    label: "1d10 + 3 thunder",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["lightning", "thunder"],
  damageVulnerabilities: ["force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Shrieking Gust", // Cone; Con save 12 or thunder damage and pushed.
    "High Roost", // Can ignore melee opportunity attacks once per fight.
  ],
  initiativeBonus: 1,
  speedFeet: 25,
  behavior: "melee",
  token: "G",
  tokenArt: "assets/tokens/gale-roost-screamer.jpg",
  flying: true,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});


/* ============================================================
 * CATEGORY 2 — Party Level 3/4
 * Theme: needlewinds, thunder sprites, fog harriers, and young storm cores
 * ============================================================ */

window.DungeonContent.register("monsters", "needlewindSkirmisher", {
  name: "Needlewind Skirmisher",
  role: "Sharp wind duelist",
  tags: ["elemental", "air", "needlewind", "skirmisher"],
  maxHp: 26,
  category: 2,
  xp: 155,
  ac: 14,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 8,
    bonus: 3,
    type: "slashing",
    attackType: "weapon",
    label: "1d8 + 3 slashing",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["lightning", "thunder"],
  damageVulnerabilities: ["force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Needle Draft", // On hit: target takes 1d4 slashing if it moves before next turn.
  ],
  initiativeBonus: 2,
  speedFeet: 35,
  behavior: "melee",
  token: "N",
  tokenArt: "assets/tokens/needlewind-skirmisher.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "thunderclapSprite", {
  name: "Thunderclap Sprite",
  role: "Small thunder caster",
  tags: ["elemental", "air", "thunder", "sprite", "ranged"],
  maxHp: 24,
  category: 2,
  xp: 160,
  ac: 15,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 8,
    bonus: 3,
    type: "thunder",
    attackType: "spell",
    label: "1d8 + 3 thunder",
    range: { kind: "ranged", normal: 30, long: 90, feet: 30 },
  },
  damageResistances: ["lightning", "thunder"],
  damageVulnerabilities: ["force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Thunderclap", // 10 ft burst; Con save 13 or thunder damage and deafened/disoriented.
  ],
  initiativeBonus: 3,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "T",
  tokenArt: "assets/tokens/thunderclap-sprite.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "fogbankHarrier", {
  name: "Fogbank Harrier",
  role: "Air-water fog paraelemental",
  tags: ["elemental", "air", "fog", "paraelemental", "harrier"],
  maxHp: 30,
  category: 2,
  xp: 170,
  ac: 13,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 10,
    bonus: 3,
    type: "cold",
    attackType: "weapon",
    label: "1d10 + 3 cold",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["cold", "lightning", "thunder"],
  damageVulnerabilities: ["force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Fog Cover", // Creates a small concealment cloud after being hit.
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "melee",
  token: "F",
  tokenArt: "assets/tokens/fogbank-harrier.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "stormShellCore", {
  name: "Storm-Shell Core",
  role: "Category 2 air boss",
  tags: ["elemental", "air", "storm", "boss", "core"],
  maxHp: 62,
  category: 2,
  xp: 380,
  ac: 15,
  attackBonus: 6,
  damage: {
    count: 2,
    sides: 6,
    bonus: 4,
    type: "lightning",
    attackType: "weapon",
    label: "2d6 + 4 lightning",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["lightning", "thunder"],
  damageVulnerabilities: ["force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Storm Shell", // First lightning/thunder damage each round heals or empowers it.
    "Crackling Pulse", // 10 ft radius; Dex save 13 or lightning damage.
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "melee",
  token: "S",
  tokenArt: "assets/tokens/storm-shell-core.jpg",
  flying: true,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});


/* ============================================================
 * CATEGORY 3 — Party Level 5/6
 * Theme: cyclone soldiers, lightning lashes, sirocco reavers, and tempest choirs
 * ============================================================ */

window.DungeonContent.register("monsters", "cycloneMyrmidon", {
  name: "Cyclone Myrmidon",
  role: "Armored wind soldier",
  tags: ["elemental", "air", "cyclone", "myrmidon"],
  maxHp: 48,
  category: 3,
  xp: 330,
  ac: 16,
  attackBonus: 6,
  damage: {
    count: 2,
    sides: 6,
    bonus: 3,
    type: "bludgeoning",
    attackType: "weapon",
    label: "2d6 + 3 bludgeoning",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["lightning", "thunder"],
  damageVulnerabilities: ["force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Cyclone Guard", // Adjacent ranged attacks against allies are partially deflected.
  ],
  initiativeBonus: 2,
  speedFeet: 35,
  behavior: "melee",
  token: "C",
  tokenArt: "assets/tokens/cyclone-myrmidon.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "lightningLashElemental", {
  name: "Lightning Lash Elemental",
  role: "Reach lightning striker",
  tags: ["elemental", "air", "lightning", "skirmisher"],
  maxHp: 52,
  category: 3,
  xp: 340,
  ac: 14,
  attackBonus: 6,
  damage: {
    count: 2,
    sides: 6,
    bonus: 4,
    type: "lightning",
    attackType: "weapon",
    label: "2d6 + 4 lightning",
    range: { kind: "melee", feet: 10 },
  },
  damageResistances: ["lightning", "thunder"],
  damageVulnerabilities: ["force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Lightning Lash", // On hit: arc 1d6 lightning to a second adjacent target.
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "melee",
  token: "L",
  tokenArt: "assets/tokens/lightning-lash-elemental.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "siroccoReaver", {
  name: "Sirocco Reaver",
  role: "Hot desert wind paraelemental",
  tags: ["elemental", "air", "sirocco", "heat", "paraelemental"],
  maxHp: 55,
  category: 3,
  xp: 350,
  ac: 16,
  attackBonus: 6,
  damage: {
    count: 2,
    sides: 8,
    bonus: 3,
    type: "fire",
    attackType: "weapon",
    label: "2d8 + 3 fire",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["fire", "lightning", "thunder"],
  damageVulnerabilities: ["cold", "force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Drying Wind", // On hit: target cannot regain HP until end of next turn.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "S",
  tokenArt: "assets/tokens/sirocco-reaver.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "tempestChoirCaller", {
  name: "Tempest Choir Caller",
  role: "Category 3 air boss",
  tags: ["elemental", "air", "tempest", "boss", "caster"],
  maxHp: 105,
  category: 3,
  xp: 780,
  ac: 17,
  attackBonus: 7,
  damage: {
    count: 2,
    sides: 8,
    bonus: 5,
    type: "thunder",
    attackType: "spell",
    label: "2d8 + 5 thunder",
    range: { kind: "ranged", normal: 60, long: 180, feet: 60 },
  },
  damageResistances: ["lightning", "thunder"],
  damageVulnerabilities: ["force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Tempest Choir", // Summons/empowers minor wind spirits once per fight.
    "Choir Blast", // Cone; Con save 14 or thunder and pushed 10 ft.
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "T",
  tokenArt: "assets/tokens/tempest-choir-caller.jpg",
  flying: true,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});


/* ============================================================
 * CATEGORY 4 — Party Level 7/8
 * Theme: razor gales, cloudstep duelists, pressure rifts, and lesser storm eyes
 * ============================================================ */

window.DungeonContent.register("monsters", "razorGale", {
  name: "Razor Gale",
  role: "High-speed cutting wind",
  tags: ["elemental", "air", "razor", "gale", "skirmisher"],
  maxHp: 78,
  category: 4,
  multiattack: { attacks: 2 },
  xp: 620,
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
  damageResistances: ["lightning", "thunder"],
  damageVulnerabilities: ["force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Razor Pass", // Can move through enemy spaces; each passed enemy saves or takes slashing.
  ],
  initiativeBonus: 3,
  speedFeet: 40,
  behavior: "melee",
  token: "R",
  tokenArt: "assets/tokens/razor-gale.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "cloudstepDuelist", {
  name: "Cloudstep Duelist",
  role: "Elegant cloud-blade fighter",
  tags: ["elemental", "air", "cloud", "duelist"],
  maxHp: 82,
  category: 4,
  multiattack: { attacks: 2 },
  xp: 640,
  ac: 16,
  attackBonus: 7,
  damage: {
    count: 2,
    sides: 8,
    bonus: 5,
    type: "piercing",
    attackType: "weapon",
    label: "2d8 + 5 piercing",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["lightning", "thunder"],
  damageVulnerabilities: ["force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Cloudstep", // Teleport-like 15 ft reposition after missing or being missed.
  ],
  initiativeBonus: 1,
  speedFeet: 35,
  behavior: "melee",
  token: "C",
  tokenArt: "assets/tokens/cloudstep-duelist.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "pressureRiftHorror", {
  name: "Pressure Rift Horror",
  role: "Vacuum-pressure controller",
  tags: ["elemental", "air", "pressure", "rift", "void", "controller"],
  maxHp: 90,
  category: 4,
  xp: 660,
  ac: 18,
  attackBonus: 7,
  damage: {
    count: 2,
    sides: 10,
    bonus: 4,
    type: "force",
    attackType: "spell",
    label: "2d10 + 4 force",
    range: { kind: "ranged", normal: 60, long: 180, feet: 60 },
  },
  damageResistances: ["force", "thunder"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Pressure Rift", // Creates a pull/push zone; Str save 15 or dragged 10 ft.
  ],
  initiativeBonus: 1,
  speedFeet: 25,
  behavior: "rangedKiter",
  token: "P",
  tokenArt: "assets/tokens/pressure-rift-horror.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "eyeOfTheLesserStorm", {
  name: "Eye of the Lesser Storm",
  role: "Category 4 air boss",
  tags: ["elemental", "air", "storm", "eye", "boss"],
  maxHp: 150,
  category: 4,
  xp: 1450,
  ac: 18,
  attackBonus: 8,
  damage: {
    count: 3,
    sides: 6,
    bonus: 6,
    type: "lightning",
    attackType: "spell",
    label: "3d6 + 6 lightning",
    range: { kind: "ranged", normal: 60, long: 180, feet: 60 },
  },
  damageResistances: ["lightning", "thunder"],
  damageVulnerabilities: ["force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Storm Eye", // Aura grants flying allies +1 attack.
    "Lesser Stormcall", // Area lightning; Dex save 15 or damage and no reactions.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "E",
  tokenArt: "assets/tokens/eye-of-the-lesser-storm.jpg",
  flying: true,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});


/* ============================================================
 * CATEGORY 5 — Party Level 9/10
 * Theme: thunderheads, glasswind assassins, vacuum maws, and sky-crowned stormlords
 * ============================================================ */

window.DungeonContent.register("monsters", "thunderheadRavager", {
  name: "Thunderhead Ravager",
  role: "Heavy thundercloud bruiser",
  tags: ["elemental", "air", "thunderhead", "brute"],
  maxHp: 118,
  category: 5,
  multiattack: { attacks: 2 },
  xp: 1000,
  ac: 18,
  attackBonus: 8,
  damage: {
    count: 3,
    sides: 8,
    bonus: 5,
    type: "thunder",
    attackType: "weapon",
    label: "3d8 + 5 thunder",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["lightning", "thunder"],
  damageVulnerabilities: ["force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Thunderhead Crash", // On hit: Con save 16 or pushed and deafened/disoriented.
  ],
  initiativeBonus: 2,
  speedFeet: 40,
  behavior: "melee",
  token: "T",
  tokenArt: "assets/tokens/thunderhead-ravager.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "glasswindAssassin", {
  name: "Glasswind Assassin",
  role: "Invisible glass-dust wind killer",
  tags: ["elemental", "air", "glass", "wind", "assassin"],
  maxHp: 105,
  category: 5,
  multiattack: { attacks: 2 },
  xp: 1030,
  ac: 17,
  attackBonus: 8,
  damage: {
    count: 3,
    sides: 6,
    bonus: 6,
    type: "slashing",
    attackType: "weapon",
    label: "3d6 + 6 slashing",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["slashing", "lightning"],
  damageVulnerabilities: ["thunder", "force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Glasswind Cut", // Deals bonus slashing against isolated targets.
  ],
  initiativeBonus: 4,
  speedFeet: 35,
  behavior: "melee",
  token: "G",
  tokenArt: "assets/tokens/glasswind-assassin.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "vacuumMaw", {
  name: "Vacuum Maw",
  role: "Airless void paraelemental",
  tags: ["elemental", "air", "vacuum", "void", "paraelemental"],
  maxHp: 125,
  category: 5,
  multiattack: { attacks: 2 },
  xp: 1060,
  ac: 18,
  attackBonus: 8,
  damage: {
    count: 3,
    sides: 10,
    bonus: 5,
    type: "force",
    attackType: "weapon",
    label: "3d10 + 5 force",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["lightning", "thunder"],
  damageVulnerabilities: ["force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Airless Bite", // On hit: Con save 16 or target cannot speak/cast verbal effects next turn.
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "melee",
  token: "V",
  tokenArt: "assets/tokens/vacuum-maw.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "skyCrownStormlord", {
  name: "Sky-Crown Stormlord",
  role: "Category 5 air boss",
  tags: ["elemental", "air", "storm", "boss", "lord"],
  maxHp: 205,
  category: 5,
  xp: 2650,
  ac: 19,
  attackBonus: 9,
  damage: {
    count: 3,
    sides: 10,
    bonus: 7,
    type: "lightning",
    attackType: "spell",
    label: "3d10 + 7 lightning",
    range: { kind: "ranged", normal: 60, long: 180, feet: 60 },
  },
  damageResistances: ["lightning", "thunder"],
  damageVulnerabilities: ["force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Sky Crown", // At round start, calls a lightning mark on one tile.
    "Stormlord Descent", // Dive attack; Dex save 16 or lightning/thunder and prone.
  ],
  initiativeBonus: 2,
  speedFeet: 35,
  behavior: "rangedKiter",
  token: "S",
  tokenArt: "assets/tokens/sky-crown-stormlord.jpg",
  flying: true,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});


/* ============================================================
 * CATEGORY 6 — Party Level 11/12
 * Theme: living tornadoes, lightning rod giants, mirage oracles, and cloud palace tyrants
 * ============================================================ */

window.DungeonContent.register("monsters", "livingTornado", {
  name: "Living Tornado",
  role: "Huge mobile vortex",
  tags: ["elemental", "air", "tornado", "hazard"],
  maxHp: 155,
  category: 6,
  multiattack: { attacks: 2 },
  xp: 1800,
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
  damageResistances: ["lightning", "thunder"],
  damageVulnerabilities: ["force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Vortex Body", // Can move through creatures; Str save 17 or carried 10 ft.
  ],
  initiativeBonus: 1,
  speedFeet: 35,
  behavior: "melee",
  token: "L",
  tokenArt: "assets/tokens/living-tornado.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "lightningRodColossus", {
  name: "Lightning Rod Colossus",
  role: "Tall storm conductor",
  tags: ["elemental", "air", "lightning", "colossus"],
  maxHp: 135,
  category: 6,
  multiattack: { attacks: 2 },
  xp: 1840,
  ac: 18,
  attackBonus: 9,
  damage: {
    count: 4,
    sides: 6,
    bonus: 7,
    type: "lightning",
    attackType: "weapon",
    label: "4d6 + 7 lightning",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["lightning", "thunder", "piercing"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Rod Draw", // Lightning attacks against nearby targets may redirect to it and empower it.
  ],
  initiativeBonus: 3,
  speedFeet: 40,
  behavior: "melee",
  token: "L",
  tokenArt: "assets/tokens/lightning-rod-colossus.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "mirageGaleOracle", {
  name: "Mirage Gale Oracle",
  role: "Illusory heat-wind caster",
  tags: ["elemental", "air", "mirage", "oracle", "caster"],
  maxHp: 165,
  category: 6,
  xp: 1880,
  ac: 19,
  attackBonus: 9,
  damage: {
    count: 4,
    sides: 10,
    bonus: 6,
    type: "psychic",
    attackType: "spell",
    label: "4d10 + 6 psychic",
    range: { kind: "ranged", normal: 60, long: 180, feet: 60 },
  },
  damageResistances: ["psychic", "fire", "lightning"],
  damageVulnerabilities: ["cold", "force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "False Horizon", // Target Wis save 17 or attacks wrong square/has disadvantage next turn.
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "M",
  tokenArt: "assets/tokens/mirage-gale-oracle.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "cloudPalaceTyrant", {
  name: "Cloud Palace Tyrant",
  role: "Category 6 air boss",
  tags: ["elemental", "air", "cloud", "boss", "tyrant"],
  maxHp: 260,
  category: 6,
  multiattack: { attacks: 2 },
  xp: 4650,
  ac: 20,
  attackBonus: 10,
  damage: {
    count: 5,
    sides: 6,
    bonus: 8,
    type: "thunder",
    attackType: "weapon",
    label: "5d6 + 8 thunder",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["lightning", "thunder"],
  damageVulnerabilities: ["force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Palace Winds", // Creates wind walls that block movement lines.
    "Tyrant Downburst", // Large cone; Str save 17 or pushed 20 ft and prone.
  ],
  initiativeBonus: 2,
  speedFeet: 35,
  behavior: "melee",
  token: "C",
  tokenArt: "assets/tokens/cloud-palace-tyrant.jpg",
  flying: true,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});


/* ============================================================
 * CATEGORY 7 — Party Level 13/14
 * Theme: hurricane myrmidons, thunder serpents, stratosphere sentinels, and open-sky barons
 * ============================================================ */

window.DungeonContent.register("monsters", "hurricaneMyrmidon", {
  name: "Hurricane Myrmidon",
  role: "Elite hurricane soldier",
  tags: ["elemental", "air", "hurricane", "myrmidon"],
  maxHp: 195,
  category: 7,
  multiattack: { attacks: 2 },
  xp: 2850,
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
  damageResistances: ["lightning", "thunder"],
  damageVulnerabilities: ["force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Hurricane Guard", // Missed melee attacks against it deal small slashing recoil.
  ],
  initiativeBonus: 2,
  speedFeet: 40,
  behavior: "melee",
  token: "H",
  tokenArt: "assets/tokens/hurricane-myrmidon.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "thunderSerpent", {
  name: "Thunder Serpent",
  role: "Serpentine storm elemental",
  tags: ["elemental", "air", "thunder", "serpent"],
  maxHp: 185,
  category: 7,
  multiattack: { attacks: 2 },
  xp: 2950,
  ac: 19,
  attackBonus: 10,
  damage: {
    count: 5,
    sides: 6,
    bonus: 7,
    type: "lightning",
    attackType: "weapon",
    label: "5d6 + 7 lightning",
    range: { kind: "melee", feet: 10 },
  },
  damageResistances: ["lightning", "thunder"],
  damageVulnerabilities: ["force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Chain Coil", // On hit: lightning arcs to all adjacent wet/metal targets.
  ],
  initiativeBonus: 2,
  speedFeet: 40,
  behavior: "melee",
  token: "T",
  tokenArt: "assets/tokens/thunder-serpent.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "stratosphereSentinel", {
  name: "Stratosphere Sentinel",
  role: "High-altitude guardian",
  tags: ["elemental", "air", "stratosphere", "sentinel"],
  maxHp: 190,
  category: 7,
  multiattack: { attacks: 2 },
  xp: 3050,
  ac: 20,
  attackBonus: 10,
  damage: {
    count: 4,
    sides: 8,
    bonus: 8,
    type: "cold",
    attackType: "weapon",
    label: "4d8 + 8 cold",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["cold", "lightning", "thunder"],
  damageVulnerabilities: ["force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Thin Air Aura", // Enemies nearby have reduced ranged accuracy and speed.
  ],
  initiativeBonus: 3,
  speedFeet: 40,
  behavior: "melee",
  token: "S",
  tokenArt: "assets/tokens/stratosphere-sentinel.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "baronOfTheOpenSky", {
  name: "Baron of the Open Sky",
  role: "Category 7 air boss",
  tags: ["elemental", "air", "sky", "boss", "baron"],
  maxHp: 315,
  category: 7,
  multiattack: { attacks: 2 },
  xp: 7300,
  ac: 21,
  attackBonus: 11,
  damage: {
    count: 5,
    sides: 8,
    bonus: 9,
    type: "thunder",
    attackType: "weapon",
    label: "5d8 + 9 thunder",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["lightning", "thunder"],
  damageVulnerabilities: ["force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Open Sky Decree", // All flying allies can reposition once per round.
    "Baronial Cyclone", // Large vortex save; pulled inward, damaged, and lifted/prone.
  ],
  initiativeBonus: 3,
  speedFeet: 40,
  behavior: "melee",
  token: "B",
  tokenArt: "assets/tokens/baron-of-the-open-sky.jpg",
  flying: true,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});


/* ============================================================
 * CATEGORY 8 — Party Level 15/16
 * Theme: worldstorms, cyclone cathedrals, aurora flyers, and high-tempest queens
 * ============================================================ */

window.DungeonContent.register("monsters", "worldstormAvatar", {
  name: "Worldstorm Avatar",
  role: "Avatar of a global storm",
  tags: ["elemental", "air", "worldstorm", "avatar"],
  maxHp: 235,
  category: 8,
  xp: 3950,
  ac: 21,
  attackBonus: 11,
  damage: {
    count: 5,
    sides: 10,
    bonus: 8,
    type: "lightning",
    attackType: "spell",
    label: "5d10 + 8 lightning",
    range: { kind: "ranged", normal: 60, long: 180, feet: 60 },
  },
  damageResistances: ["lightning", "thunder"],
  damageVulnerabilities: ["force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Worldstorm Body", // At round start, random nearby tile is struck by lightning.
  ],
  initiativeBonus: 2,
  speedFeet: 40,
  behavior: "rangedKiter",
  token: "W",
  tokenArt: "assets/tokens/worldstorm-avatar.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "cycloneCathedral", {
  name: "Cyclone Cathedral",
  role: "Massive sacred storm formation",
  tags: ["elemental", "air", "cyclone", "cathedral", "control"],
  maxHp: 220,
  category: 8,
  multiattack: { attacks: 2 },
  xp: 4050,
  ac: 20,
  attackBonus: 11,
  damage: {
    count: 5,
    sides: 8,
    bonus: 8,
    type: "thunder",
    attackType: "weapon",
    label: "5d8 + 8 thunder",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["lightning", "thunder"],
  damageVulnerabilities: ["force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Cathedral Winds", // Creates ring-shaped wind walls or difficult terrain.
  ],
  initiativeBonus: 3,
  speedFeet: 45,
  behavior: "melee",
  token: "C",
  tokenArt: "assets/tokens/cyclone-cathedral.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "auroraRazorwing", {
  name: "Aurora Razorwing",
  role: "Beautiful lethal upper-air hunter",
  tags: ["elemental", "air", "aurora", "razorwing", "skirmisher"],
  maxHp: 250,
  category: 8,
  multiattack: { attacks: 2 },
  xp: 4150,
  ac: 22,
  attackBonus: 11,
  damage: {
    count: 4,
    sides: 12,
    bonus: 9,
    type: "radiant",
    attackType: "weapon",
    label: "4d12 + 9 radiant",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["radiant", "lightning", "thunder"],
  damageVulnerabilities: ["force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Aurora Slash", // On hit: target glows, losing concealment and taking extra radiant next hit.
  ],
  initiativeBonus: 1,
  speedFeet: 35,
  behavior: "melee",
  token: "A",
  tokenArt: "assets/tokens/aurora-razorwing.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "queenOfTheHighTempest", {
  name: "Queen of the High Tempest",
  role: "Category 8 air boss",
  tags: ["elemental", "air", "tempest", "boss", "queen"],
  maxHp: 385,
  category: 8,
  xp: 9200,
  ac: 22,
  attackBonus: 12,
  damage: {
    count: 6,
    sides: 8,
    bonus: 10,
    type: "lightning",
    attackType: "spell",
    label: "6d8 + 10 lightning",
    range: { kind: "ranged", normal: 60, long: 180, feet: 60 },
  },
  damageResistances: ["lightning", "thunder"],
  damageVulnerabilities: ["force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "High Tempest Aura", // Ranged attacks against her have reduced hit chance.
    "Queenly Thunderbolt", // Line attack; Dex save 19 or lightning/thunder and stunned-like lost reaction.
  ],
  initiativeBonus: 3,
  speedFeet: 40,
  behavior: "rangedKiter",
  token: "Q",
  tokenArt: "assets/tokens/queen-of-the-high-tempest.jpg",
  flying: true,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});


/* ============================================================
 * CATEGORY 9 — Party Level 17/18
 * Theme: voidwinds, continental cyclones, heaven-splitting thunderheads, and skybreaker regents
 * ============================================================ */

window.DungeonContent.register("monsters", "gravitylessVoidwind", {
  name: "Gravityless Voidwind",
  role: "Airless anti-gravity horror",
  tags: ["elemental", "air", "void", "gravity", "paraelemental"],
  maxHp: 285,
  category: 9,
  xp: 5250,
  ac: 22,
  attackBonus: 12,
  damage: {
    count: 6,
    sides: 8,
    bonus: 9,
    type: "force",
    attackType: "spell",
    label: "6d8 + 9 force",
    range: { kind: "ranged", normal: 60, long: 180, feet: 60 },
  },
  damageResistances: ["force", "psychic", "thunder"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Gravityless Zone", // Target floats; speed becomes 0 unless pulled or save succeeds.
  ],
  initiativeBonus: 2,
  speedFeet: 45,
  behavior: "rangedKiter",
  token: "G",
  tokenArt: "assets/tokens/gravityless-voidwind.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "continentalCyclone", {
  name: "Continental Cyclone",
  role: "Cyclone large enough to erase cities",
  tags: ["elemental", "air", "cyclone", "continent", "catastrophe"],
  maxHp: 270,
  category: 9,
  multiattack: { attacks: 3 },
  xp: 5350,
  ac: 21,
  attackBonus: 12,
  damage: {
    count: 6,
    sides: 6,
    bonus: 10,
    type: "slashing",
    attackType: "weapon",
    label: "6d6 + 10 slashing",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["lightning", "thunder"],
  damageVulnerabilities: ["force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "City-Eater Winds", // Large aura deals small slashing to all enemies each round.
  ],
  initiativeBonus: 3,
  speedFeet: 45,
  behavior: "melee",
  token: "C",
  tokenArt: "assets/tokens/continental-cyclone.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "heavenSplittingThunderhead", {
  name: "Heaven-Splitting Thunderhead",
  role: "Mythic thundercloud colossus",
  tags: ["elemental", "air", "thunderhead", "colossus"],
  maxHp: 300,
  category: 9,
  multiattack: { attacks: 3 },
  xp: 5450,
  ac: 23,
  attackBonus: 12,
  damage: {
    count: 5,
    sides: 12,
    bonus: 10,
    type: "thunder",
    attackType: "weapon",
    label: "5d12 + 10 thunder",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["lightning", "thunder", "radiant"],
  damageVulnerabilities: ["force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Split the Heavens", // Huge thunder line; Con save 20 or damage and knocked prone.
  ],
  initiativeBonus: 1,
  speedFeet: 35,
  behavior: "melee",
  token: "H",
  tokenArt: "assets/tokens/heaven-splitting-thunderhead.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "theSkybreakerRegent", {
  name: "The Skybreaker Regent",
  role: "Category 9 air boss",
  tags: ["elemental", "air", "skybreaker", "boss", "regent"],
  maxHp: 460,
  category: 9,
  xp: 11800,
  ac: 23,
  attackBonus: 13,
  damage: {
    count: 6,
    sides: 10,
    bonus: 11,
    type: "lightning",
    attackType: "spell",
    label: "6d10 + 11 lightning",
    range: { kind: "ranged", normal: 60, long: 180, feet: 60 },
  },
  damageResistances: ["lightning", "thunder"],
  damageVulnerabilities: ["force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Skybreaker Law", // At initiative count, all grounded enemies save or are launched/pushed.
    "Regent Stormfall", // Massive area lightning; Dex save 20 or heavy damage.
  ],
  initiativeBonus: 3,
  speedFeet: 45,
  behavior: "rangedKiter",
  token: "T",
  tokenArt: "assets/tokens/the-skybreaker-regent.jpg",
  flying: true,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});


/* ============================================================
 * CATEGORY 10 — Party Level 19/20
 * Theme: primordial tempest, endless gale colossi, starstorms, and inner-air sovereigns
 * ============================================================ */

window.DungeonContent.register("monsters", "primordialTempest", {
  name: "Primordial Tempest",
  role: "Ancient storm incarnation",
  tags: ["elemental", "air", "primordial", "tempest", "avatar"],
  maxHp: 360,
  category: 10,
  xp: 8600,
  ac: 23,
  attackBonus: 14,
  damage: {
    count: 7,
    sides: 8,
    bonus: 11,
    type: "lightning",
    attackType: "spell",
    label: "7d8 + 11 lightning",
    range: { kind: "ranged", normal: 60, long: 180, feet: 60 },
  },
  damageResistances: ["lightning", "thunder"],
  damageVulnerabilities: ["force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Neverending Storm", // Deals small lightning/thunder aura damage every round.
  ],
  initiativeBonus: 3,
  speedFeet: 45,
  behavior: "rangedKiter",
  token: "P",
  tokenArt: "assets/tokens/primordial-tempest.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "endlessGaleColossus", {
  name: "Endless Gale Colossus",
  role: "Colossus of pure pressure and wind",
  tags: ["elemental", "air", "gale", "colossus"],
  maxHp: 340,
  category: 10,
  multiattack: { attacks: 4 },
  xp: 8800,
  ac: 23,
  attackBonus: 14,
  damage: {
    count: 7,
    sides: 6,
    bonus: 12,
    type: "bludgeoning",
    attackType: "weapon",
    label: "7d6 + 12 bludgeoning",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["lightning", "thunder"],
  damageVulnerabilities: ["force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Endless Gale", // All enemy movement toward it costs extra movement.
  ],
  initiativeBonus: 4,
  speedFeet: 50,
  behavior: "melee",
  token: "E",
  tokenArt: "assets/tokens/endless-gale-colossus.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "starstormElemental", {
  name: "Starstorm Elemental",
  role: "Upper-sky starfire storm spirit",
  tags: ["elemental", "air", "starstorm", "radiant", "storm"],
  maxHp: 380,
  category: 10,
  xp: 9000,
  ac: 24,
  attackBonus: 14,
  damage: {
    count: 8,
    sides: 6,
    bonus: 11,
    type: "radiant",
    attackType: "spell",
    label: "8d6 + 11 radiant",
    range: { kind: "ranged", normal: 60, long: 180, feet: 60 },
  },
  damageResistances: ["radiant", "lightning", "thunder", "fire"],
  damageVulnerabilities: ["force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Starstorm Fall", // Area radiant/lightning strikes; Dex save 22 or heavy damage.
  ],
  initiativeBonus: 2,
  speedFeet: 40,
  behavior: "rangedKiter",
  token: "S",
  tokenArt: "assets/tokens/starstorm-elemental.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "sovereignOfTheInnerAir", {
  name: "Sovereign of the Inner Air",
  role: "Category 10 air boss",
  tags: ["elemental", "air", "inner-plane", "boss", "sovereign"],
  maxHp: 620,
  category: 10,
  multiattack: { attacks: 3 },
  xp: 25000,
  ac: 24,
  attackBonus: 15,
  damage: {
    count: 8,
    sides: 8,
    bonus: 13,
    type: "thunder",
    attackType: "weapon",
    label: "8d8 + 13 thunder",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["lightning", "thunder"],
  damageVulnerabilities: ["force"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "restrained"],
  specialAbility: [
    "Breath of the Plane", // Changes battlefield wind direction each round; pushes all creatures.
    "Silence of No Air", // Ultimate vacuum zone; Con save 22 or force/thunder and cannot act fully next turn.
  ],
  initiativeBonus: 4,
  speedFeet: 50,
  behavior: "melee",
  token: "S",
  tokenArt: "assets/tokens/sovereign-of-the-inner-air.jpg",
  flying: true,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});

})();
