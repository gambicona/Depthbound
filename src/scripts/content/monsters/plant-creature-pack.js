(() => {
/* ============================================================
 * PLANT CREATURE MONSTER PACK
 * Theme: forest plants, jungle predators, underdark fungi, brambles, treants, carnivorous flowers, and ancient worldroot horrors.
 * Notes: Every monster starts its tags with "plant". Some use the subtag "underdark", some use "jungle", and the rest are forest/woodland plants.
 * ============================================================ */


/* ============================================================
 * CATEGORY 1 — Party Level 1/2
 * ============================================================ */

window.DungeonContent.register("monsters", "twigBlightSprinter", {
  name: "Twig Blight Sprinter",
  role: "Fast low forest skirmisher",
  tags: ["plant", "forest", "blight", "twig", "skirmisher"],
  maxHp: 13,
  category: 1,
  xp: 70,
  ac: 13,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 6,
    bonus: 2,
    type: "piercing",
    attackType: "weapon",
    label: "1d6 + 2 piercing",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["poison"],
  damageVulnerabilities: ["fire"],
  damageImmunities: [],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Brittle Dash", // After moving at least 20 ft, gains +2 damage on its next hit.
  ],
  initiativeBonus: 2,
  speedFeet: 35,
  behavior: "melee",
  token: "T",
  tokenArt: "assets/tokens/twig-blight-sprinter.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "violetFungusCluster", {
  name: "Violet Fungus Cluster",
  role: "Underdark poison hazard plant",
  tags: ["plant", "underdark", "fungus", "poison", "stationary"],
  maxHp: 14,
  category: 1,
  xp: 75,
  ac: 13,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 6,
    bonus: 2,
    type: "poison",
    attackType: "weapon",
    label: "1d6 + 2 poison",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["necrotic"],
  damageVulnerabilities: ["fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "blinded"],
  specialAbility: [
    "Rotting Tendrils", // On hit: Con save 11 or target takes 1d4 poison at start of next turn.
  ],
  initiativeBonus: 2,
  speedFeet: 10,
  behavior: "melee",
  token: "V",
  tokenArt: "assets/tokens/violet-fungus-cluster.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "jungleNeedlepod", {
  name: "Jungle Needlepod",
  role: "Weak jungle ranged thorn shooter",
  tags: ["plant", "jungle", "thorn", "ranged", "pod"],
  maxHp: 15,
  category: 1,
  xp: 85,
  ac: 13,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 6,
    bonus: 2,
    type: "piercing",
    attackType: "weapon",
    label: "1d6 + 2 piercing",
    range: { kind: "ranged", normal: 30, long: 90, feet: 30 },
  },
  damageResistances: ["poison"],
  damageVulnerabilities: ["fire"],
  damageImmunities: [],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Needle Spray", // Once per fight: attacks all creatures in a 10 ft cone for small piercing damage.
  ],
  initiativeBonus: 2,
  speedFeet: 25,
  behavior: "rangedKiter",
  token: "N",
  tokenArt: "assets/tokens/jungle-needlepod.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "brambleMatriarch", {
  name: "Bramble Matriarch",
  role: "Category 1 plant boss",
  tags: ["plant", "forest", "bramble", "boss", "controller"],
  maxHp: 34,
  category: 1,
  xp: 1855,
  ac: 14,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 10,
    bonus: 3,
    type: "piercing",
    attackType: "weapon",
    label: "1d10 + 3 piercing",
    range: { kind: "melee", feet: 10 },
  },
  damageResistances: ["poison", "piercing"],
  damageVulnerabilities: ["fire"],
  damageImmunities: [],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Root Snare", // Once per fight: nearby enemies save or lose 10 ft speed for one round.
    "Thorn Nest", // Adjacent attackers take 1 piercing damage when they hit it.
  ],
  initiativeBonus: 2,
  speedFeet: 25,
  behavior: "melee",
  token: "B",
  tokenArt: "assets/tokens/bramble-matriarch.jpg",
  flying: false,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});



/* ============================================================
 * CATEGORY 2 — Party Level 3/4
 * ============================================================ */

window.DungeonContent.register("monsters", "thornLashVine", {
  name: "Thorn Lash Vine",
  role: "Reach vine controller",
  tags: ["plant", "forest", "vine", "thorn", "reach"],
  maxHp: 24,
  category: 2,
  xp: 350,
  ac: 14,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 8,
    bonus: 3,
    type: "slashing",
    attackType: "weapon",
    label: "1d8 + 3 slashing",
    range: { kind: "melee", feet: 10 },
  },
  damageResistances: ["poison"],
  damageVulnerabilities: ["fire"],
  damageImmunities: [],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Dragging Lash", // On hit: pulls target 5 ft closer if it fails Str save 12.
  ],
  initiativeBonus: 2,
  speedFeet: 20,
  behavior: "melee",
  token: "L",
  tokenArt: "assets/tokens/thorn-lash-vine.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "shriekerSporecap", {
  name: "Shrieker Sporecap",
  role: "Underdark alarm and panic fungus",
  tags: ["plant", "underdark", "fungus", "spore", "controller"],
  maxHp: 26,
  category: 2,
  xp: 380,
  ac: 14,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 8,
    bonus: 3,
    type: "psychic",
    attackType: "spell",
    label: "1d8 + 3 psychic",
    range: { kind: "ranged", normal: 30, long: 90, feet: 30 },
  },
  damageResistances: ["poison"],
  damageVulnerabilities: ["fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "deafened"],
  specialAbility: [
    "Shriek Alarm", // At combat start: nearby plant/fungus allies gain +2 initiative.
    "Panic Spores", // On hit: Wis save 12 or target cannot willingly move closer for one round.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "S",
  tokenArt: "assets/tokens/shrieker-sporecap.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "bloodOrchidStalker", {
  name: "Blood Orchid Stalker",
  role: "Jungle life-draining ambusher",
  tags: ["plant", "jungle", "orchid", "ambusher", "drain"],
  maxHp: 28,
  category: 2,
  xp: 415,
  ac: 14,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 8,
    bonus: 3,
    type: "necrotic",
    attackType: "weapon",
    label: "1d8 + 3 necrotic",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["poison", "necrotic"],
  damageVulnerabilities: ["fire"],
  damageImmunities: [],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Blood Scent", // Deals +1d6 necrotic to wounded targets below half HP.
  ],
  initiativeBonus: 4,
  speedFeet: 35,
  behavior: "melee",
  token: "O",
  tokenArt: "assets/tokens/blood-orchid-stalker.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "yellowMuskCreeper", {
  name: "Yellow Musk Creeper",
  role: "Category 2 plant boss",
  tags: ["plant", "forest", "jungle", "creeper", "boss", "charm"],
  maxHp: 64,
  category: 2,
  xp: 15245,
  ac: 15,
  attackBonus: 6,
  damage: {
    count: 2,
    sides: 8,
    bonus: 4,
    type: "poison",
    attackType: "spell",
    label: "2d8 + 4 poison",
    range: { kind: "ranged", normal: 30, long: 90, feet: 30 },
  },
  damageResistances: ["poison"],
  damageVulnerabilities: ["fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "charmed"],
  specialAbility: [
    "Musk Charm", // Once per fight: Wis save or target wastes its next move approaching the creeper.
    "Zombie Seed", // A creature dropped by this monster may spawn a weak plant minion later.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "Y",
  tokenArt: "assets/tokens/yellow-musk-creeper.jpg",
  flying: false,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});



/* ============================================================
 * CATEGORY 3 — Party Level 5/6
 * ============================================================ */

window.DungeonContent.register("monsters", "assassinVine", {
  name: "Assassin Vine",
  role: "Classic restraining carnivorous vine",
  tags: ["plant", "forest", "vine", "ambusher", "restrainer"],
  maxHp: 42,
  category: 3,
  xp: 1705,
  ac: 15,
  attackBonus: 6,
  damage: {
    count: 2,
    sides: 6,
    bonus: 4,
    type: "bludgeoning",
    attackType: "weapon",
    label: "2d6 + 4 bludgeoning",
    range: { kind: "melee", feet: 10 },
  },
  damageResistances: ["poison", "bludgeoning"],
  damageVulnerabilities: ["fire"],
  damageImmunities: [],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Constricting Coil", // On hit: Str save 13 or target is restrained until it breaks free.
  ],
  initiativeBonus: 3,
  speedFeet: 20,
  behavior: "melee",
  token: "A",
  tokenArt: "assets/tokens/assassin-vine.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "myconidSporeguard", {
  name: "Myconid Sporeguard",
  role: "Underdark fungal defender",
  tags: ["plant", "underdark", "myconid", "fungus", "guardian"],
  maxHp: 45,
  category: 3,
  xp: 1845,
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
  damageResistances: ["poison"],
  damageVulnerabilities: ["fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "frightened"],
  specialAbility: [
    "Rapport Spores", // Allied plant creatures within 15 ft gain +1 attack bonus.
    "Healing Spores", // Action: heals a wounded monster ally within 30 ft.
    "Pacifying Puff", // Once per fight: Con save or target has disadvantage on next attack.
  ],
  initiativeBonus: 3,
  speedFeet: 30,
  behavior: "melee",
  token: "M",
  tokenArt: "assets/tokens/myconid-sporeguard.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "razorPalmAmbusher", {
  name: "Razor Palm Ambusher",
  role: "Jungle slashing canopy attacker",
  tags: ["plant", "jungle", "palm", "ambusher", "skirmisher"],
  maxHp: 48,
  category: 3,
  xp: 1990,
  ac: 15,
  attackBonus: 6,
  damage: {
    count: 2,
    sides: 6,
    bonus: 4,
    type: "slashing",
    attackType: "weapon",
    label: "2d6 + 4 slashing",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["poison"],
  damageVulnerabilities: ["fire"],
  damageImmunities: [],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Falling Fronds", // First attack from full HP deals +1d8 slashing.
  ],
  initiativeBonus: 5,
  speedFeet: 40,
  behavior: "melee",
  token: "R",
  tokenArt: "assets/tokens/razor-palm-ambusher.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "fungalBroodmother", {
  name: "Fungal Broodmother",
  role: "Category 3 underdark plant boss",
  tags: ["plant", "underdark", "fungus", "boss", "summoner"],
  maxHp: 105,
  category: 3,
  xp: 20850,
  ac: 16,
  attackBonus: 7,
  damage: {
    count: 3,
    sides: 8,
    bonus: 5,
    type: "poison",
    attackType: "spell",
    label: "3d8 + 5 poison",
    range: { kind: "ranged", normal: 30, long: 90, feet: 30 },
  },
  damageResistances: ["poison"],
  damageVulnerabilities: ["fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "charmed", "frightened"],
  specialAbility: [
    "Brood Spores", // Once per fight: summons two weak sporelings or heals nearby fungi.
    "Choking Colony", // Poisoned enemies near it take extra poison damage.
  ],
  initiativeBonus: 3,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "F",
  tokenArt: "assets/tokens/fungal-broodmother.jpg",
  flying: false,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});



/* ============================================================
 * CATEGORY 4 — Party Level 7/8
 * ============================================================ */

window.DungeonContent.register("monsters", "briarboundTreantling", {
  name: "Briarbound Treantling",
  role: "Young forest tree brute",
  sizeSquares: 2,
  tags: ["plant", "forest", "treant", "briar", "brute"],
  maxHp: 62,
  category: 4,
  multiattack: { attacks: 2 },
  xp: 2145,
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
  damageResistances: ["poison", "bludgeoning", "piercing"],
  damageVulnerabilities: ["fire"],
  damageImmunities: [],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Briar Slam", // On hit: target takes 1d6 piercing if it moves before next turn.
  ],
  initiativeBonus: 3,
  speedFeet: 30,
  behavior: "melee",
  token: "T",
  tokenArt: "assets/tokens/briarbound-treantling.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "hookcapMycelialHorror", {
  name: "Hookcap Mycelial Horror",
  role: "Underdark hook-fungus mauler",
  tags: ["plant", "underdark", "fungus", "hookcap", "mauler"],
  maxHp: 68,
  category: 4,
  multiattack: { attacks: 2 },
  xp: 2300,
  ac: 16,
  attackBonus: 7,
  damage: {
    count: 2,
    sides: 8,
    bonus: 5,
    type: "slashing",
    attackType: "weapon",
    label: "2d8 + 5 slashing",
    range: { kind: "melee", feet: 10 },
  },
  damageResistances: ["poison"],
  damageVulnerabilities: ["fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone"],
  specialAbility: [
    "Hookcap Pull", // On hit: pulls target adjacent and prevents disengage for one round.
  ],
  initiativeBonus: 3,
  speedFeet: 30,
  behavior: "melee",
  token: "H",
  tokenArt: "assets/tokens/hookcap-mycelial-horror.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "stranglerFigHunter", {
  name: "Strangler Fig Hunter",
  role: "Jungle grappling predator tree",
  sizeSquares: 2,
  tags: ["plant", "jungle", "fig", "grappler", "hunter"],
  maxHp: 72,
  category: 4,
  multiattack: { attacks: 2 },
  xp: 2460,
  ac: 16,
  attackBonus: 7,
  damage: {
    count: 2,
    sides: 8,
    bonus: 5,
    type: "bludgeoning",
    attackType: "weapon",
    label: "2d8 + 5 bludgeoning",
    range: { kind: "melee", feet: 10 },
  },
  damageResistances: ["poison", "necrotic"],
  damageVulnerabilities: ["fire"],
  damageImmunities: [],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Stranglehold", // On hit: target save or is grappled; grappled targets take automatic small damage.
  ],
  initiativeBonus: 3,
  speedFeet: 35,
  behavior: "melee",
  token: "S",
  tokenArt: "assets/tokens/strangler-fig-hunter.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "shamblingMoundHeart", {
  name: "Shambling Mound Heart",
  role: "Category 4 plant boss",
  tags: ["plant", "forest", "swamp", "mound", "boss", "brute"],
  maxHp: 155,
  category: 4,
  multiattack: { attacks: 2 },
  xp: 18325,
  ac: 17,
  attackBonus: 8,
  damage: {
    count: 4,
    sides: 8,
    bonus: 6,
    type: "bludgeoning",
    attackType: "weapon",
    label: "4d8 + 6 bludgeoning",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["cold", "fire"],
  damageVulnerabilities: [],
  damageImmunities: ["lightning", "poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Engulfing Mass", // On hit against restrained target: deals bonus bludgeoning and heals slightly.
    "Lightning Feed", // Lightning damage heals this boss instead of hurting it.
  ],
  initiativeBonus: 3,
  speedFeet: 30,
  behavior: "melee",
  token: "M",
  tokenArt: "assets/tokens/shambling-mound-heart.jpg",
  flying: false,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});



/* ============================================================
 * CATEGORY 5 — Party Level 9/10
 * ============================================================ */

window.DungeonContent.register("monsters", "ironbarkGuardian", {
  name: "Ironbark Guardian",
  role: "Armored forest sentinel",
  sizeSquares: 2,
  tags: ["plant", "forest", "ironbark", "guardian", "tank"],
  maxHp: 92,
  category: 5,
  multiattack: { attacks: 2 },
  xp: 2775,
  ac: 19,
  attackBonus: 8,
  damage: {
    count: 3,
    sides: 8,
    bonus: 6,
    type: "bludgeoning",
    attackType: "weapon",
    label: "3d8 + 6 bludgeoning",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "poison"],
  damageVulnerabilities: ["fire"],
  damageImmunities: [],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Ironbark Guard", // First time each round it takes weapon damage, reduce that damage by 5.
  ],
  initiativeBonus: 3,
  speedFeet: 25,
  behavior: "melee",
  token: "I",
  tokenArt: "assets/tokens/ironbark-guardian.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "umberMoldProphet", {
  name: "Umber Mold Prophet",
  role: "Underdark psychic spore caster",
  tags: ["plant", "underdark", "fungus", "mold", "psychic", "caster"],
  maxHp: 98,
  category: 5,
  xp: 3095,
  ac: 17,
  attackBonus: 8,
  damage: {
    count: 3,
    sides: 8,
    bonus: 6,
    type: "psychic",
    attackType: "spell",
    label: "3d8 + 6 psychic",
    range: { kind: "ranged", normal: 60, long: 180, feet: 60 },
  },
  damageResistances: ["psychic", "poison"],
  damageVulnerabilities: ["fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "charmed", "frightened"],
  specialAbility: [
    "Mindrot Sermon", // On hit: Wis save 15 or target cannot use reactions for one round.
    "Spore Communion", // Nearby fungi share line of sight through this monster.
  ],
  initiativeBonus: 3,
  speedFeet: 35,
  behavior: "rangedKiter",
  token: "U",
  tokenArt: "assets/tokens/umber-mold-prophet.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "venomBloomMatron", {
  name: "Venom Bloom Matron",
  role: "Jungle poison artillery plant",
  tags: ["plant", "jungle", "flower", "poison", "artillery"],
  maxHp: 105,
  category: 5,
  xp: 3415,
  ac: 17,
  attackBonus: 8,
  damage: {
    count: 3,
    sides: 8,
    bonus: 6,
    type: "poison",
    attackType: "spell",
    label: "3d8 + 6 poison",
    range: { kind: "ranged", normal: 90, long: 240, feet: 90 },
  },
  damageResistances: ["poison"],
  damageVulnerabilities: ["fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Venom Bloom", // Leaves a poison cloud on the target cell for one round.
  ],
  initiativeBonus: 3,
  speedFeet: 35,
  behavior: "rangedKiter",
  token: "V",
  tokenArt: "assets/tokens/venom-bloom-matron.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "corpseFlowerRegent", {
  name: "Corpse Flower Regent",
  role: "Category 5 corpse-fed plant boss",
  sizeSquares: 2,
  tags: ["plant", "forest", "jungle", "corpse-flower", "boss", "necrotic"],
  maxHp: 225,
  category: 5,
  multiattack: { attacks: 2 },
  xp: 28720,
  ac: 18,
  attackBonus: 9,
  damage: {
    count: 5,
    sides: 8,
    bonus: 7,
    type: "necrotic",
    attackType: "weapon",
    label: "5d8 + 7 necrotic",
    range: { kind: "melee", feet: 10 },
  },
  damageResistances: ["necrotic", "poison"],
  damageVulnerabilities: ["fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "frightened"],
  specialAbility: [
    "Corpse Compost", // Heals when a nearby creature dies.
    "Carrion Perfume", // Con save or poisoned and unable to regain HP for one round.
  ],
  initiativeBonus: 3,
  speedFeet: 35,
  behavior: "melee",
  token: "C",
  tokenArt: "assets/tokens/corpse-flower-regent.jpg",
  flying: false,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});



/* ============================================================
 * CATEGORY 6 — Party Level 11/12
 * ============================================================ */

window.DungeonContent.register("monsters", "elderVineReaver", {
  name: "Elder Vine Reaver",
  role: "High reach forest vine killer",
  tags: ["plant", "forest", "vine", "reaver", "reach"],
  maxHp: 128,
  category: 6,
  multiattack: { attacks: 2 },
  xp: 2330,
  ac: 18,
  attackBonus: 9,
  damage: {
    count: 4,
    sides: 8,
    bonus: 7,
    type: "slashing",
    attackType: "weapon",
    label: "4d8 + 7 slashing",
    range: { kind: "melee", feet: 10 },
  },
  damageResistances: ["poison", "piercing"],
  damageVulnerabilities: ["fire"],
  damageImmunities: [],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Reaving Tangle", // Can hit two adjacent targets with one sweeping lash.
  ],
  initiativeBonus: 4,
  speedFeet: 35,
  behavior: "melee",
  token: "E",
  tokenArt: "assets/tokens/elder-vine-reaver.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "glowsporeSovereign", {
  name: "Glowspore Sovereign",
  role: "Underdark luminous spore controller",
  tags: ["plant", "underdark", "fungus", "glowspore", "controller"],
  maxHp: 138,
  category: 6,
  xp: 2530,
  ac: 18,
  attackBonus: 9,
  damage: {
    count: 4,
    sides: 8,
    bonus: 7,
    type: "radiant",
    attackType: "spell",
    label: "4d8 + 7 radiant",
    range: { kind: "ranged", normal: 60, long: 180, feet: 60 },
  },
  damageResistances: ["radiant", "poison"],
  damageVulnerabilities: ["fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "blinded"],
  specialAbility: [
    "Dazzling Spores", // On hit: Con save 16 or target is blinded until end of next turn.
    "Guiding Glow", // Allies have +2 to hit blinded enemies.
  ],
  initiativeBonus: 4,
  speedFeet: 35,
  behavior: "rangedKiter",
  token: "G",
  tokenArt: "assets/tokens/glowspore-sovereign.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "jaguarThornCreeper", {
  name: "Jaguar-Thorn Creeper",
  role: "Fast jungle predatory bramble",
  tags: ["plant", "jungle", "thorn", "beastlike", "skirmisher"],
  maxHp: 148,
  category: 6,
  multiattack: { attacks: 2 },
  xp: 2735,
  ac: 18,
  attackBonus: 9,
  damage: {
    count: 4,
    sides: 8,
    bonus: 7,
    type: "piercing",
    attackType: "weapon",
    label: "4d8 + 7 piercing",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["poison"],
  damageVulnerabilities: ["fire"],
  damageImmunities: [],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Pouncing Vines", // After moving 20 ft: target save or knocked prone.
    "Thorn Hide", // Adjacent attackers take 1d6 piercing when they miss.
  ],
  initiativeBonus: 6,
  speedFeet: 50,
  behavior: "melee",
  token: "J",
  tokenArt: "assets/tokens/jaguar-thorn-creeper.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "thorncrownTreant", {
  name: "Thorncrown Treant",
  role: "Category 6 forest plant boss",
  sizeSquares: 2,
  tags: ["plant", "forest", "treant", "thorn", "boss", "commander"],
  maxHp: 310,
  category: 6,
  multiattack: { attacks: 2 },
  xp: 25030,
  ac: 19,
  attackBonus: 10,
  damage: {
    count: 6,
    sides: 8,
    bonus: 8,
    type: "bludgeoning",
    attackType: "weapon",
    label: "6d8 + 8 bludgeoning",
    range: { kind: "melee", feet: 10 },
  },
  damageResistances: ["bludgeoning", "piercing", "poison"],
  damageVulnerabilities: ["fire"],
  damageImmunities: [],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Command the Brambles", // Once per fight: creates bramble difficult terrain in a wide area.
    "Crown of Thorns", // Enemies that start adjacent take piercing damage.
  ],
  initiativeBonus: 4,
  speedFeet: 35,
  behavior: "melee",
  token: "K",
  tokenArt: "assets/tokens/thorncrown-treant.jpg",
  flying: false,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});



/* ============================================================
 * CATEGORY 7 — Party Level 13/14
 * ============================================================ */

window.DungeonContent.register("monsters", "ancientRootbreaker", {
  name: "Ancient Rootbreaker",
  role: "Massive forest root brute",
  sizeSquares: 2,
  tags: ["plant", "forest", "root", "ancient", "brute"],
  maxHp: 175,
  category: 7,
  multiattack: { attacks: 2 },
  xp: 2870,
  ac: 19,
  attackBonus: 10,
  damage: {
    count: 5,
    sides: 8,
    bonus: 8,
    type: "bludgeoning",
    attackType: "weapon",
    label: "5d8 + 8 bludgeoning",
    range: { kind: "melee", feet: 10 },
  },
  damageResistances: ["bludgeoning", "piercing", "poison"],
  damageVulnerabilities: ["fire"],
  damageImmunities: [],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Rootquake", // Once per fight: ground slam knocks nearby enemies prone on failed Str save 17.
  ],
  initiativeBonus: 4,
  speedFeet: 35,
  behavior: "melee",
  token: "R",
  tokenArt: "assets/tokens/ancient-rootbreaker.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "mindrotMycelium", {
  name: "Mindrot Mycelium",
  role: "Underdark psychic colony horror",
  tags: ["plant", "underdark", "fungus", "psychic", "horror"],
  maxHp: 190,
  category: 7,
  xp: 3155,
  ac: 19,
  attackBonus: 10,
  damage: {
    count: 5,
    sides: 8,
    bonus: 8,
    type: "psychic",
    attackType: "spell",
    label: "5d8 + 8 psychic",
    range: { kind: "ranged", normal: 90, long: 240, feet: 90 },
  },
  damageResistances: ["psychic", "necrotic", "poison"],
  damageVulnerabilities: ["fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "charmed", "frightened"],
  specialAbility: [
    "Mindrot Cloud", // Targets hit must save or suffer -1d4 on their next save.
    "Colony Thought", // Cannot be surprised while another fungus ally is alive.
  ],
  initiativeBonus: 4,
  speedFeet: 40,
  behavior: "rangedKiter",
  token: "M",
  tokenArt: "assets/tokens/mindrot-mycelium.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "emeraldHydraVine", {
  name: "Emerald Hydra-Vine",
  role: "Jungle multi-headed vine predator",
  sizeSquares: 2,
  tags: ["plant", "jungle", "vine", "hydra", "multiattack"],
  maxHp: 205,
  category: 7,
  multiattack: { attacks: 3 },
  xp: 3455,
  ac: 19,
  attackBonus: 10,
  damage: {
    count: 5,
    sides: 8,
    bonus: 8,
    type: "piercing",
    attackType: "weapon",
    label: "5d8 + 8 piercing",
    range: { kind: "melee", feet: 10 },
  },
  damageResistances: ["poison", "acid"],
  damageVulnerabilities: ["fire"],
  damageImmunities: [],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Many Maws", // If it hits, it makes a weaker second bite against the same target.
    "Regrowing Heads", // Heals at round start unless it took fire damage last round.
  ],
  initiativeBonus: 4,
  speedFeet: 40,
  behavior: "melee",
  token: "H",
  tokenArt: "assets/tokens/emerald-hydra-vine.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "sporeTitanOfTheDeep", {
  name: "Spore Titan of the Deep",
  role: "Category 7 underdark plant boss",
  sizeSquares: 2,
  tags: ["plant", "underdark", "fungus", "titan", "boss"],
  maxHp: 400,
  category: 7,
  multiattack: { attacks: 2 },
  xp: 25075,
  ac: 20,
  attackBonus: 11,
  damage: {
    count: 7,
    sides: 8,
    bonus: 9,
    type: "poison",
    attackType: "weapon",
    label: "7d8 + 9 poison",
    range: { kind: "melee", feet: 10 },
  },
  damageResistances: ["necrotic", "psychic", "poison"],
  damageVulnerabilities: ["fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "charmed", "frightened"],
  specialAbility: [
    "Titan Sporefall", // Once per fight: fills several random cells with poison spore clouds.
    "Fungal Rebirth", // First time it drops to 0 HP, returns with 25% HP unless burned.
  ],
  initiativeBonus: 4,
  speedFeet: 40,
  behavior: "melee",
  token: "D",
  tokenArt: "assets/tokens/spore-titan-of-the-deep.jpg",
  flying: false,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});



/* ============================================================
 * CATEGORY 8 — Party Level 15/16
 * ============================================================ */

window.DungeonContent.register("monsters", "wyrmwoodTreant", {
  name: "Wyrmwood Treant",
  role: "Ancient poisonous forest treant",
  sizeSquares: 2,
  tags: ["plant", "forest", "treant", "wyrmwood", "poison"],
  maxHp: 235,
  category: 8,
  multiattack: { attacks: 2 },
  xp: 4385,
  ac: 20,
  attackBonus: 11,
  damage: {
    count: 6,
    sides: 8,
    bonus: 9,
    type: "bludgeoning",
    attackType: "weapon",
    label: "6d8 + 9 bludgeoning",
    range: { kind: "melee", feet: 10 },
  },
  damageResistances: ["bludgeoning", "piercing", "poison"],
  damageVulnerabilities: ["fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Wyrmwood Sap", // Melee hits also inflict poison damage and block healing for one round.
  ],
  initiativeBonus: 4,
  speedFeet: 40,
  behavior: "melee",
  token: "W",
  tokenArt: "assets/tokens/wyrmwood-treant.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "midnightMyconidHierophant", {
  name: "Midnight Myconid Hierophant",
  role: "Underdark fungal high caster",
  tags: ["plant", "underdark", "myconid", "hierophant", "caster"],
  maxHp: 250,
  category: 8,
  xp: 4760,
  ac: 20,
  attackBonus: 11,
  damage: {
    count: 6,
    sides: 8,
    bonus: 9,
    type: "psychic",
    attackType: "spell",
    label: "6d8 + 9 psychic",
    range: { kind: "ranged", normal: 90, long: 240, feet: 90 },
  },
  damageResistances: ["psychic", "necrotic", "poison"],
  damageVulnerabilities: ["fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "blinded", "charmed"],
  specialAbility: [
    "Midnight Spores", // Once per fight: enemies save or are blinded and slowed for one round.
    "Shared Pain Hymn", // Part of damage to this monster is redirected to fungal minions.
  ],
  initiativeBonus: 4,
  speedFeet: 40,
  behavior: "rangedKiter",
  token: "N",
  tokenArt: "assets/tokens/midnight-myconid-hierophant.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "mantrapQueensFang", {
  name: "Mantrap Queen's Fang",
  role: "Elite jungle carnivorous flower",
  tags: ["plant", "jungle", "mantrap", "flower", "elite"],
  maxHp: 265,
  category: 8,
  multiattack: { attacks: 2 },
  xp: 5195,
  ac: 20,
  attackBonus: 11,
  damage: {
    count: 6,
    sides: 8,
    bonus: 9,
    type: "acid",
    attackType: "weapon",
    label: "6d8 + 9 acid",
    range: { kind: "melee", feet: 10 },
  },
  damageResistances: ["acid", "poison"],
  damageVulnerabilities: ["fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Acid Maw", // Restrained targets take double acid bonus damage.
    "Luring Scent", // First living enemy in range must save or move 10 ft closer.
  ],
  initiativeBonus: 4,
  speedFeet: 40,
  behavior: "melee",
  token: "Q",
  tokenArt: "assets/tokens/mantrap-queens-fang.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "jungleGreenheartColossus", {
  name: "Jungle Greenheart Colossus",
  role: "Category 8 jungle plant boss",
  sizeSquares: 3,
  tags: ["plant", "jungle", "greenheart", "colossus", "boss"],
  maxHp: 490,
  category: 8,
  multiattack: { attacks: 2 },
  xp: 13955,
  ac: 21,
  attackBonus: 12,
  damage: {
    count: 8,
    sides: 8,
    bonus: 10,
    type: "bludgeoning",
    attackType: "weapon",
    label: "8d8 + 10 bludgeoning",
    range: { kind: "melee", feet: 10 },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "poison"],
  damageVulnerabilities: ["fire"],
  damageImmunities: [],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Canopy Collapse", // Once per fight: drops crushing branches over a wide area.
    "Living Jungle", // Summons grasping roots around wounded enemies.
  ],
  initiativeBonus: 4,
  speedFeet: 40,
  behavior: "melee",
  token: "G",
  tokenArt: "assets/tokens/jungle-greenheart-colossus.jpg",
  flying: false,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});



/* ============================================================
 * CATEGORY 9 — Party Level 17/18
 * ============================================================ */

window.DungeonContent.register("monsters", "worldrootSentinel", {
  name: "Worldroot Sentinel",
  role: "Mythic forest guardian",
  sizeSquares: 3,
  tags: ["plant", "forest", "worldroot", "sentinel", "guardian"],
  maxHp: 295,
  category: 9,
  multiattack: { attacks: 3 },
  xp: 5205,
  ac: 22,
  attackBonus: 12,
  damage: {
    count: 7,
    sides: 8,
    bonus: 10,
    type: "bludgeoning",
    attackType: "weapon",
    label: "7d8 + 10 bludgeoning",
    range: { kind: "melee", feet: 10 },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "poison"],
  damageVulnerabilities: ["fire"],
  damageImmunities: [],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Worldroot Anchor", // Immune to forced movement; adjacent allies cannot be pulled or pushed.
    "Rooted Counter", // When missed in melee, lashes back for small bludgeoning damage.
  ],
  initiativeBonus: 5,
  speedFeet: 45,
  behavior: "melee",
  token: "S",
  tokenArt: "assets/tokens/worldroot-sentinel.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "abyssalSporeGrove", {
  name: "Abyssal Spore Grove",
  role: "Huge underdark corrupt fungus colony",
  sizeSquares: 2,
  tags: ["plant", "underdark", "fungus", "grove", "corruption"],
  maxHp: 315,
  category: 9,
  xp: 5625,
  ac: 21,
  attackBonus: 12,
  damage: {
    count: 7,
    sides: 8,
    bonus: 10,
    type: "necrotic",
    attackType: "spell",
    label: "7d8 + 10 necrotic",
    range: { kind: "ranged", normal: 90, long: 240, feet: 90 },
  },
  damageResistances: ["necrotic", "psychic", "poison"],
  damageVulnerabilities: ["fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "charmed", "frightened"],
  specialAbility: [
    "Corruptive Sporulation", // Hit targets save or lose resistance until end of next turn.
    "Grove Body", // Takes reduced damage from single-target attacks while spore pods live.
  ],
  initiativeBonus: 5,
  speedFeet: 45,
  behavior: "rangedKiter",
  token: "A",
  tokenArt: "assets/tokens/abyssal-spore-grove.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "bloodCanopyDevourer", {
  name: "Blood Canopy Devourer",
  role: "Apex jungle canopy predator",
  sizeSquares: 2,
  tags: ["plant", "jungle", "canopy", "devourer", "apex"],
  maxHp: 335,
  category: 9,
  multiattack: { attacks: 3 },
  xp: 6175,
  ac: 21,
  attackBonus: 12,
  damage: {
    count: 7,
    sides: 8,
    bonus: 10,
    type: "slashing",
    attackType: "weapon",
    label: "7d8 + 10 slashing",
    range: { kind: "melee", feet: 10 },
  },
  damageResistances: ["poison", "necrotic"],
  damageVulnerabilities: ["fire"],
  damageImmunities: [],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Canopy Snatch", // Pulls a target up to 10 ft and restrains it on failed Dex save 18.
    "Blood Rain", // When bloodied, its attacks splash necrotic damage to adjacent enemies.
  ],
  initiativeBonus: 6,
  speedFeet: 45,
  behavior: "melee",
  token: "B",
  tokenArt: "assets/tokens/blood-canopy-devourer.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "eldergroveAvatar", {
  name: "Eldergrove Avatar",
  role: "Category 9 forest plant boss",
  sizeSquares: 3,
  tags: ["plant", "forest", "eldergrove", "avatar", "boss"],
  maxHp: 575,
  category: 9,
  multiattack: { attacks: 3 },
  xp: 22910,
  ac: 22,
  attackBonus: 13,
  damage: {
    count: 9,
    sides: 8,
    bonus: 11,
    type: "radiant",
    attackType: "spell",
    label: "9d8 + 11 radiant",
    range: { kind: "melee", feet: 10 },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "poison", "radiant"],
  damageVulnerabilities: ["fire", "necrotic"],
  damageImmunities: [],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Seasonal Wrath", // Cycles each round between thorn, pollen, root, and blossom effects.
    "Ancient Photosynthesis", // Heals in bright light; loses this healing if hit by fire.
  ],
  initiativeBonus: 5,
  speedFeet: 45,
  behavior: "melee",
  token: "E",
  tokenArt: "assets/tokens/eldergrove-avatar.jpg",
  flying: false,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});



/* ============================================================
 * CATEGORY 10 — Party Level 19/20
 * ============================================================ */

window.DungeonContent.register("monsters", "primevalTreantOfSeasons", {
  name: "Primeval Treant of Seasons",
  role: "Legendary forest treant avatar",
  sizeSquares: 3,
  tags: ["plant", "forest", "treant", "primeval", "seasons"],
  maxHp: 345,
  category: 10,
  multiattack: { attacks: 4 },
  xp: 4810,
  ac: 22,
  attackBonus: 14,
  damage: {
    count: 8,
    sides: 8,
    bonus: 11,
    type: "bludgeoning",
    attackType: "weapon",
    label: "8d8 + 11 bludgeoning",
    range: { kind: "melee", feet: 10 },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "cold", "poison"],
  damageVulnerabilities: ["fire", "necrotic"],
  damageImmunities: [],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Four-Season Slam", // Each hit adds a rotating rider: cold slow, radiant mark, poison cloud, or thorn bleed.
    "Ancient Bark", // Cannot take more than 25% max HP from one attack.
  ],
  initiativeBonus: 5,
  speedFeet: 45,
  behavior: "melee",
  token: "P",
  tokenArt: "assets/tokens/primeval-treant-of-seasons.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "deepMycelialOvermind", {
  name: "Deep Mycelial Overmind",
  role: "Underdark fungal psychic overmind",
  tags: ["plant", "underdark", "fungus", "mycelium", "overmind"],
  maxHp: 365,
  category: 10,
  xp: 5140,
  ac: 22,
  attackBonus: 14,
  damage: {
    count: 8,
    sides: 8,
    bonus: 11,
    type: "psychic",
    attackType: "spell",
    label: "8d8 + 11 psychic",
    range: { kind: "ranged", normal: 90, long: 240, feet: 90 },
  },
  damageResistances: ["psychic", "necrotic", "poison", "cold"],
  damageVulnerabilities: ["fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "charmed", "frightened", "stunned"],
  specialAbility: [
    "Overmind Spores", // Once per fight: enemies save or attack the nearest creature on their next turn.
    "Colony Immortality", // Transfers fatal damage to a fungal ally once per round.
  ],
  initiativeBonus: 5,
  speedFeet: 45,
  behavior: "rangedKiter",
  token: "O",
  tokenArt: "assets/tokens/deep-mycelial-overmind.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "thousandMawGodflower", {
  name: "Thousand-Maw Godflower",
  role: "Mythic jungle carnivorous blossom",
  sizeSquares: 3,
  tags: ["plant", "jungle", "flower", "thousand-maw", "mythic"],
  maxHp: 390,
  category: 10,
  multiattack: { attacks: 4 },
  xp: 5465,
  ac: 22,
  attackBonus: 14,
  damage: {
    count: 8,
    sides: 8,
    bonus: 11,
    type: "acid",
    attackType: "weapon",
    label: "8d8 + 11 acid",
    range: { kind: "melee", feet: 10 },
  },
  damageResistances: ["acid", "poison", "necrotic"],
  damageVulnerabilities: ["fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "frightened"],
  specialAbility: [
    "Thousand Maws", // Makes a weaker follow-up bite against every adjacent enemy it hit this round.
    "Devouring Bloom", // If it downs a creature, immediately heals and gains another action next round.
  ],
  initiativeBonus: 5,
  speedFeet: 45,
  behavior: "melee",
  token: "G",
  tokenArt: "assets/tokens/thousand-maw-godflower.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "rootOfTheFirstForest", {
  name: "Root of the First Forest",
  role: "Category 10 plant boss",
  sizeSquares: 3,
  tags: ["plant", "forest", "worldroot", "primordial", "boss"],
  maxHp: 660,
  category: 10,
  multiattack: { attacks: 4 },
  xp: 13675,
  ac: 23,
  attackBonus: 15,
  damage: {
    count: 10,
    sides: 8,
    bonus: 13,
    type: "bludgeoning",
    attackType: "weapon",
    label: "10d8 + 13 bludgeoning",
    range: { kind: "melee", feet: 10 },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "radiant", "cold", "poison"],
  damageVulnerabilities: ["fire", "necrotic"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "charmed", "frightened", "prone", "exhaustion"],
  specialAbility: [
    "First Forest Awakens", // Once per fight: summons roots, brambles, and healing blossoms across the arena.
    "Primordial Regrowth", // At half HP, clears conditions and regrows with temporary HP unless burned by fire.
    "Forest Judgment", // Marked enemies are restrained, then crushed if they fail a second save.
  ],
  initiativeBonus: 5,
  speedFeet: 45,
  behavior: "melee",
  token: "F",
  tokenArt: "assets/tokens/root-of-the-first-forest.jpg",
  flying: false,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});

})();
