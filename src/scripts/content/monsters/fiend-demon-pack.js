(() => {

/* ============================================================
 * FIEND / DEMON MONSTER PACK
 * Theme: chaotic abyssal fiends, demons, mutation, hunger,
 *        madness, plague, rifts, ruin, and demon prince avatars.
 * Notes: Every monster starts its tags with "fiend" as requested.
 *        Demons tend to resist fire/cold/lightning, ignore poison,
 *        and use chaotic mobility, fear, corruption, and burst damage.
 * ============================================================ */


/* ============================================================
 * CATEGORY 1 — Party Level 1/2
 * Theme: minor abyssal pests, dretches, claws, first corruptions
 * ============================================================ */

window.DungeonContent.register("monsters", "abyssalDretchling", {
  name: "Abyssal Dretchling",
  role: "Small stinking demon brute",
  tags: ["fiend", "demon", "dretch", "brute"],
  maxHp: 16,
  category: 1,
  xp: 55,
  ac: 11,
  attackBonus: 3,
  damage: {
    count: 1,
    sides: 8,
    bonus: 1,
    type: "slashing",
    attackType: "weapon",
    label: "1d8 + 1 slashing",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["fire"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Rot Stench", // Adjacent enemies make Con save against 11 at start of turn or suffer -1 attack bonus until end of that turn.
  ],
  initiativeBonus: 0,
  speedFeet: 25,
  behavior: "melee",
  token: "D",
  tokenArt: "assets/tokens/abyssal-dretchling.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "clawImpOfRuin", {
  name: "Claw Imp of Ruin",
  role: "Fast lesser demon skirmisher",
  tags: ["fiend", "demon", "imp", "skirmisher"],
  maxHp: 12,
  category: 1,
  xp: 60,
  ac: 14,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 6,
    bonus: 2,
    type: "slashing",
    attackType: "weapon",
    label: "1d6 + 2 slashing",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["fire"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Ruin Scratch", // On hit: target makes Wis save against 11 or cannot take reactions until the start of its next turn.
  ],
  initiativeBonus: 4,
  speedFeet: 35,
  behavior: "melee",
  token: "I",
  tokenArt: "assets/tokens/claw-imp-of-ruin.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "spiteMote", {
  name: "Spite Mote",
  role: "Floating abyssal nuisance",
  tags: ["fiend", "demon", "spirit", "flying", "ranged"],
  maxHp: 10,
  category: 1,
  xp: 65,
  ac: 13,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 6,
    bonus: 2,
    type: "psychic",
    attackType: "spell",
    label: "1d6 + 2 psychic",
    range: {
      kind: "ranged",
      normal: 40,
      long: 120,
      feet: 40,
    },
  },
  damageResistances: ["fire", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Needling Malice", // On hit: target makes Wis save against 11 or takes -1 on its next saving throw before end of next turn.
  ],
  initiativeBonus: 3,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "M",
  tokenArt: "assets/tokens/spite-mote.jpg",
  flying: true,
});


window.DungeonContent.register("monsters", "gutMawBully", {
  name: "Gut-Maw Bully",
  role: "Category 1 demon boss",
  tags: ["fiend", "demon", "boss", "brute", "maw"],
  maxHp: 36,
  category: 1,
  xp: 150,
  ac: 13,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 10,
    bonus: 3,
    type: "piercing",
    attackType: "weapon",
    label: "1d10 + 3 piercing",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["cold", "fire", "lightning"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Howl of Hunger", // Once per fight: enemies within 15 ft make Wis save against 12 or are frightened until end of their next turn.
    "Bite and Tear", // If target is below half HP, add 1d6 slashing damage on hit.
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "melee",
  token: "G",
  tokenArt: "assets/tokens/gut-maw-bully.jpg",
  flying: false,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});



/* ============================================================
 * CATEGORY 2 — Party Level 3/4
 * Theme: quasits, maw demons, fast hunters, early madness
 * ============================================================ */

window.DungeonContent.register("monsters", "quasitNeedler", {
  name: "Quasit Needler",
  role: "Tiny flying poison demon",
  tags: ["fiend", "demon", "quasit", "flying", "skirmisher"],
  maxHp: 24,
  category: 2,
  xp: 150,
  ac: 15,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 8,
    bonus: 3,
    type: "piercing",
    attackType: "weapon",
    label: "1d8 + 3 piercing",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["cold", "fire", "lightning"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Venom Needle", // On hit: Con save against 12 or target takes 1d6 poison damage and has -5 ft speed next turn.
  ],
  initiativeBonus: 5,
  speedFeet: 35,
  behavior: "melee",
  token: "Q",
  tokenArt: "assets/tokens/quasit-needler.jpg",
  flying: true,
});


window.DungeonContent.register("monsters", "mawDemonGnawer", {
  name: "Maw Demon Gnawer",
  role: "Hungry melee attacker",
  tags: ["fiend", "demon", "maw", "brute"],
  maxHp: 35,
  category: 2,
  xp: 170,
  ac: 13,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 10,
    bonus: 3,
    type: "piercing",
    attackType: "weapon",
    label: "1d10 + 3 piercing",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["cold", "fire", "lightning"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Feeding Frenzy", // If it hits a wounded target, it may move 5 ft after the attack without provoking reactions.
  ],
  initiativeBonus: 2,
  speedFeet: 35,
  behavior: "melee",
  token: "M",
  tokenArt: "assets/tokens/maw-demon-gnawer.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "bloodSmokeHowler", {
  name: "Blood-Smoke Howler",
  role: "Ranged fear screamer",
  tags: ["fiend", "demon", "howler", "ranged"],
  maxHp: 28,
  category: 2,
  xp: 160,
  ac: 14,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 8,
    bonus: 3,
    type: "thunder",
    attackType: "spell",
    label: "1d8 + 3 thunder",
    range: {
      kind: "ranged",
      normal: 50,
      long: 150,
      feet: 50,
    },
  },
  damageResistances: ["fire", "lightning"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Panic Shriek", // 15 ft cone, Wis save against 12 or target is frightened until end of its next turn.
  ],
  initiativeBonus: 3,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "H",
  tokenArt: "assets/tokens/blood-smoke-howler.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "hornedRiftGorger", {
  name: "Horned Rift-Gorger",
  role: "Category 2 demon boss",
  tags: ["fiend", "demon", "boss", "brute", "rift"],
  maxHp: 66,
  category: 2,
  xp: 360,
  ac: 15,
  attackBonus: 6,
  damage: {
    count: 1,
    sides: 12,
    bonus: 4,
    type: "slashing",
    attackType: "weapon",
    label: "1d12 + 4 slashing",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["cold", "fire", "lightning", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Rift Charge", // If it moves at least 20 ft before attacking, add 2d6 force damage and push target 5 ft on hit.
    "Abyssal Roar", // Once per fight: all enemies within 20 ft make Wis save against 13 or suffer disadvantage-like -2 on next attack.
  ],
  initiativeBonus: 2,
  speedFeet: 40,
  behavior: "melee",
  token: "R",
  tokenArt: "assets/tokens/horned-rift-gorger.jpg",
  flying: false,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});



/* ============================================================
 * CATEGORY 3 — Party Level 5/6
 * Theme: vrocks, shadow demons, abyssal berserkers
 * ============================================================ */

window.DungeonContent.register("monsters", "vrockFledgling", {
  name: "Vrock Fledgling",
  role: "Flying screeching demon",
  tags: ["fiend", "demon", "vrock", "flying", "brute"],
  maxHp: 48,
  category: 3,
  xp: 320,
  ac: 15,
  attackBonus: 6,
  damage: {
    count: 2,
    sides: 6,
    bonus: 4,
    type: "slashing",
    attackType: "weapon",
    label: "2d6 + 4 slashing",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["cold", "fire", "lightning"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Spores of Filth", // Once per fight: adjacent enemies make Con save against 14 or take 2d6 poison damage at start of next turn.
  ],
  initiativeBonus: 3,
  speedFeet: 40,
  behavior: "melee",
  token: "V",
  tokenArt: "assets/tokens/vrock-fledgling.jpg",
  flying: true,
});


window.DungeonContent.register("monsters", "shadowRiftDemon", {
  name: "Shadow Rift Demon",
  role: "Necrotic ambusher",
  tags: ["fiend", "demon", "shadow", "skirmisher"],
  maxHp: 40,
  category: 3,
  xp: 340,
  ac: 16,
  attackBonus: 7,
  damage: {
    count: 2,
    sides: 6,
    bonus: 3,
    type: "necrotic",
    attackType: "weapon",
    label: "2d6 + 3 necrotic",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["cold", "fire", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Shadow Slip", // Once per fight: teleport up to 20 ft before or after attacking.
  ],
  initiativeBonus: 5,
  speedFeet: 35,
  behavior: "melee",
  token: "S",
  tokenArt: "assets/tokens/shadow-rift-demon.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "abyssalSpineThrower", {
  name: "Abyssal Spine-Thrower",
  role: "Chaotic ranged attacker",
  tags: ["fiend", "demon", "spine", "ranged"],
  maxHp: 42,
  category: 3,
  xp: 330,
  ac: 15,
  attackBonus: 6,
  damage: {
    count: 2,
    sides: 8,
    bonus: 3,
    type: "piercing",
    attackType: "weapon",
    label: "2d8 + 3 piercing",
    range: {
      kind: "ranged",
      normal: 60,
      long: 180,
      feet: 60,
    },
  },
  damageResistances: ["cold", "fire", "lightning"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Jagged Spines", // On hit: target makes Dex save against 14 or takes 1d6 piercing damage when it next moves.
  ],
  initiativeBonus: 4,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "T",
  tokenArt: "assets/tokens/abyssal-spine-thrower.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "screamingVrockMatriarch", {
  name: "Screaming Vrock Matriarch",
  role: "Category 3 demon boss",
  tags: ["fiend", "demon", "boss", "vrock", "flying"],
  maxHp: 92,
  category: 3,
  xp: 700,
  ac: 16,
  attackBonus: 7,
  damage: {
    count: 2,
    sides: 8,
    bonus: 4,
    type: "slashing",
    attackType: "weapon",
    label: "2d8 + 4 slashing",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["cold", "fire", "lightning", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "frightened"],
  specialAbility: [
    "Stunning Screech", // Once per fight: enemies within 20 ft make Con save against 14 or lose their next reaction and action-like special use.
    "Carrion Spores", // 15 ft radius, Con save against 14, 4d6 poison damage if save unsuccessful, half if successful.
  ],
  initiativeBonus: 4,
  speedFeet: 40,
  behavior: "melee",
  token: "V",
  tokenArt: "assets/tokens/screaming-vrock-matriarch.jpg",
  flying: true,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});



/* ============================================================
 * CATEGORY 4 — Party Level 7/8
 * Theme: hezrou-like brutes, plague breath, psychic corruption
 * ============================================================ */

window.DungeonContent.register("monsters", "hezrouMudmauler", {
  name: "Hezrou Mudmauler",
  role: "Toxic heavy bruiser",
  tags: ["fiend", "demon", "hezrou", "brute"],
  maxHp: 70,
  category: 4,
  multiattack: { attacks: 2 },
  xp: 600,
  ac: 16,
  attackBonus: 7,
  damage: {
    count: 2,
    sides: 10,
    bonus: 4,
    type: "bludgeoning",
    attackType: "weapon",
    label: "2d10 + 4 bludgeoning",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["cold", "fire", "lightning", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Nauseating Bulk", // Adjacent enemies make Con save against 15 at start of turn or deal -1d6 damage on their next hit that turn.
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "melee",
  token: "H",
  tokenArt: "assets/tokens/hezrou-mudmauler.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "chaosFlameBinder", {
  name: "Chaos-Flame Binder",
  role: "Wild fire caster",
  tags: ["fiend", "demon", "caster", "fire"],
  maxHp: 54,
  category: 4,
  xp: 620,
  ac: 16,
  attackBonus: 7,
  damage: {
    count: 3,
    sides: 6,
    bonus: 4,
    type: "fire",
    attackType: "spell",
    label: "3d6 + 4 fire",
    range: {
      kind: "ranged",
      normal: 80,
      long: 240,
      feet: 80,
    },
  },
  damageResistances: ["cold", "fire", "lightning", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Unstable Fire", // 10 ft radius circle, Dex save against 15, 5d6 fire damage; on failed save target is also pushed 5 ft in a random direction.
  ],
  initiativeBonus: 4,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "F",
  tokenArt: "assets/tokens/chaos-flame-binder.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "madnessLeaper", {
  name: "Madness Leaper",
  role: "Pouncing psychic skirmisher",
  tags: ["fiend", "demon", "madness", "skirmisher"],
  maxHp: 60,
  category: 4,
  multiattack: { attacks: 2 },
  xp: 640,
  ac: 17,
  attackBonus: 8,
  damage: {
    count: 2,
    sides: 8,
    bonus: 4,
    type: "psychic",
    attackType: "weapon",
    label: "2d8 + 4 psychic",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["cold", "fire", "lightning", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Mind-Pounce", // If it moves at least 15 ft before attacking, target makes Wis save against 15 or cannot use abilities until end of its next turn.
  ],
  initiativeBonus: 6,
  speedFeet: 45,
  behavior: "melee",
  token: "L",
  tokenArt: "assets/tokens/madness-leaper.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "plagueBellyHezrou", {
  name: "Plague-Belly Hezrou",
  role: "Category 4 demon boss",
  tags: ["fiend", "demon", "boss", "hezrou", "plague"],
  maxHp: 132,
  category: 4,
  multiattack: { attacks: 2 },
  xp: 1350,
  ac: 17,
  attackBonus: 8,
  damage: {
    count: 3,
    sides: 8,
    bonus: 5,
    type: "bludgeoning",
    attackType: "weapon",
    label: "3d8 + 5 bludgeoning",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["cold", "fire", "lightning", "bludgeoning", "piercing", "slashing", "acid"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison", "acid"],
  conditionImmunities: ["poisoned", "frightened"],
  specialAbility: [
    "Vomit Plague", // 20 ft cone, Con save against 16, 6d6 acid damage and poisoned until end of next turn if save unsuccessful, half damage if successful.
    "Filth Aura", // Enemies starting adjacent take 1d6 poison damage.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "P",
  tokenArt: "assets/tokens/plague-belly-hezrou.jpg",
  flying: false,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});



/* ============================================================
 * CATEGORY 5 — Party Level 9/10
 * Theme: glabrezu-style tempters, abyssal knights, teleporting horrors
 * ============================================================ */

window.DungeonContent.register("monsters", "glabrezuPactBreaker", {
  name: "Glabrezu Pact-Breaker",
  role: "Claw caster tempter",
  tags: ["fiend", "demon", "glabrezu", "caster", "brute"],
  maxHp: 92,
  category: 5,
  multiattack: { attacks: 2 },
  xp: 1000,
  ac: 17,
  attackBonus: 8,
  damage: {
    count: 3,
    sides: 8,
    bonus: 5,
    type: "slashing",
    attackType: "weapon",
    label: "3d8 + 5 slashing",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["cold", "fire", "lightning", "bludgeoning", "piercing", "slashing", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "charmed"],
  specialAbility: [
    "False Promise", // Once per fight: target makes Cha save against 16 or is charmed/confused until end of its next turn and cannot target the demon if another enemy is available.
  ],
  initiativeBonus: 3,
  speedFeet: 35,
  behavior: "melee",
  token: "G",
  tokenArt: "assets/tokens/glabrezu-pact-breaker.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "abyssKnightRavager", {
  name: "Abyss Knight Ravager",
  role: "Armored chaotic melee elite",
  tags: ["fiend", "demon", "knight", "elite"],
  maxHp: 100,
  category: 5,
  multiattack: { attacks: 2 },
  xp: 1050,
  ac: 18,
  attackBonus: 9,
  damage: {
    count: 3,
    sides: 10,
    bonus: 5,
    type: "slashing",
    attackType: "weapon",
    label: "3d10 + 5 slashing",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["cold", "fire", "lightning", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "frightened"],
  specialAbility: [
    "Ruinous Cleave", // On hit: one adjacent secondary target takes half the slashing damage.
  ],
  initiativeBonus: 4,
  speedFeet: 35,
  behavior: "melee",
  token: "K",
  tokenArt: "assets/tokens/abyss-knight-ravager.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "blinkRiftPredator", {
  name: "Blink-Rift Predator",
  role: "Teleporting abyss hunter",
  tags: ["fiend", "demon", "teleport", "skirmisher"],
  maxHp: 84,
  category: 5,
  multiattack: { attacks: 2 },
  xp: 980,
  ac: 18,
  attackBonus: 9,
  damage: {
    count: 3,
    sides: 6,
    bonus: 5,
    type: "force",
    attackType: "weapon",
    label: "3d6 + 5 force",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["cold", "fire", "lightning", "force", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Rift Blink", // Once per fight: teleport up to 30 ft; next hit before end of turn deals +2d6 force damage.
  ],
  initiativeBonus: 7,
  speedFeet: 40,
  behavior: "melee",
  token: "B",
  tokenArt: "assets/tokens/blink-rift-predator.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "wishRotDeceiver", {
  name: "Wish-Rot Deceiver",
  role: "Category 5 demon boss",
  tags: ["fiend", "demon", "boss", "glabrezu", "deceiver"],
  maxHp: 188,
  category: 5,
  xp: 2600,
  ac: 18,
  attackBonus: 9,
  damage: {
    count: 4,
    sides: 8,
    bonus: 6,
    type: "psychic",
    attackType: "spell",
    label: "4d8 + 6 psychic",
    range: {
      kind: "ranged",
      normal: 80,
      long: 240,
      feet: 80,
    },
  },
  damageResistances: ["cold", "fire", "lightning", "bludgeoning", "piercing", "slashing", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "charmed", "frightened"],
  specialAbility: [
    "Corrupt Wish", // Once per fight: target makes Cha save against 17 or gains a harmful bargain; it either loses healing for one round or takes 6d8 psychic damage.
    "Crushing Claws", // Melee follow-up against adjacent target, Str save against 17 or restrained until end of next turn.
  ],
  initiativeBonus: 4,
  speedFeet: 35,
  behavior: "rangedKiter",
  token: "W",
  tokenArt: "assets/tokens/wish-rot-deceiver.jpg",
  flying: false,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});



/* ============================================================
 * CATEGORY 6 — Party Level 11/12
 * Theme: nalfeshnee-style judges, demonic artillery, mutation engines
 * ============================================================ */

window.DungeonContent.register("monsters", "nalfeshneeFleshJudge", {
  name: "Nalfeshnee Flesh-Judge",
  role: "Psychic judgement brute",
  tags: ["fiend", "demon", "nalfeshnee", "psychic"],
  maxHp: 132,
  category: 6,
  multiattack: { attacks: 2 },
  xp: 1800,
  ac: 18,
  attackBonus: 10,
  damage: {
    count: 4,
    sides: 8,
    bonus: 6,
    type: "psychic",
    attackType: "weapon",
    label: "4d8 + 6 psychic",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["cold", "fire", "lightning", "bludgeoning", "piercing", "slashing", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "charmed", "frightened"],
  specialAbility: [
    "Horror Judgement", // Once per fight: enemies within 20 ft make Wis save against 18 or take 5d8 psychic damage and are frightened for one turn.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "J",
  tokenArt: "assets/tokens/nalfeshnee-flesh-judge.jpg",
  flying: true,
});


window.DungeonContent.register("monsters", "abyssalMawArtillery", {
  name: "Abyssal Maw Artillery",
  role: "Long-range acid vomiter",
  tags: ["fiend", "demon", "artillery", "acid"],
  maxHp: 110,
  category: 6,
  xp: 1750,
  ac: 17,
  attackBonus: 10,
  damage: {
    count: 4,
    sides: 8,
    bonus: 6,
    type: "acid",
    attackType: "spell",
    label: "4d8 + 6 acid",
    range: {
      kind: "ranged",
      normal: 100,
      long: 300,
      feet: 100,
    },
  },
  damageResistances: ["cold", "fire", "lightning", "acid", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison", "acid"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Abyssal Bile", // 10 ft radius circle, Dex save against 18, 8d6 acid damage and armor-scorch -1 AC for one round if save unsuccessful, half damage if successful.
  ],
  initiativeBonus: 3,
  speedFeet: 25,
  behavior: "rangedKiter",
  token: "A",
  tokenArt: "assets/tokens/abyssal-maw-artillery.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "mutationGorger", {
  name: "Mutation Gorger",
  role: "Scaling melee monster",
  tags: ["fiend", "demon", "mutation", "brute"],
  maxHp: 124,
  category: 6,
  multiattack: { attacks: 2 },
  xp: 1850,
  ac: 18,
  attackBonus: 10,
  damage: {
    count: 4,
    sides: 10,
    bonus: 6,
    type: "piercing",
    attackType: "weapon",
    label: "4d10 + 6 piercing",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["cold", "fire", "lightning", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "frightened"],
  specialAbility: [
    "Feed the Mutation", // Whenever it drops a creature or bloodies a target, gains +1 AC and +1d6 damage until end of fight, max twice.
  ],
  initiativeBonus: 3,
  speedFeet: 35,
  behavior: "melee",
  token: "M",
  tokenArt: "assets/tokens/mutation-gorger.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "threeMouthedRuinJudge", {
  name: "Three-Mouthed Ruin Judge",
  role: "Category 6 demon boss",
  tags: ["fiend", "demon", "boss", "nalfeshnee", "judge"],
  maxHp: 258,
  category: 6,
  xp: 4600,
  ac: 19,
  attackBonus: 11,
  damage: {
    count: 5,
    sides: 8,
    bonus: 7,
    type: "psychic",
    attackType: "spell",
    label: "5d8 + 7 psychic",
    range: {
      kind: "ranged",
      normal: 80,
      long: 240,
      feet: 80,
    },
  },
  damageResistances: ["cold", "fire", "lightning", "bludgeoning", "piercing", "slashing", "psychic", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "charmed", "frightened"],
  specialAbility: [
    "Triple Condemnation", // Once per fight: choose up to three enemies; each makes Wis save against 18 or takes 7d8 psychic damage and is frightened for one turn.
    "Flesh Verdict", // If a frightened enemy is hit by the boss, add 3d8 necrotic damage.
  ],
  initiativeBonus: 4,
  speedFeet: 35,
  behavior: "rangedKiter",
  token: "R",
  tokenArt: "assets/tokens/three-mouthed-ruin-judge.jpg",
  flying: true,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});



/* ============================================================
 * CATEGORY 7 — Party Level 13/14
 * Theme: marilith-style weapon masters, abyssal tyrants, ruin casters
 * ============================================================ */

window.DungeonContent.register("monsters", "sixBladeMarilith", {
  name: "Six-Blade Marilith",
  role: "Multiweapon melee master",
  tags: ["fiend", "demon", "marilith", "weaponmaster"],
  maxHp: 164,
  category: 7,
  multiattack: { attacks: 3 },
  xp: 2900,
  ac: 19,
  attackBonus: 11,
  damage: {
    count: 5,
    sides: 8,
    bonus: 7,
    type: "slashing",
    attackType: "weapon",
    label: "5d8 + 7 slashing",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["cold", "fire", "lightning", "bludgeoning", "piercing", "slashing", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "charmed", "frightened"],
  specialAbility: [
    "Whirling Blades", // Adjacent enemies make Dex save against 19, 8d8 slashing damage if save unsuccessful, half if successful.
    "Parry Storm", // Once per round style: reduce one incoming weapon hit by 1d8 + 4.
  ],
  initiativeBonus: 7,
  speedFeet: 40,
  behavior: "melee",
  token: "M",
  tokenArt: "assets/tokens/six-blade-marilith.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "abyssalTyrantSpawn", {
  name: "Abyssal Tyrant Spawn",
  role: "Huge commanding brute",
  sizeSquares: 2,
  tags: ["fiend", "demon", "tyrant", "brute"],
  maxHp: 178,
  category: 7,
  multiattack: { attacks: 2 },
  xp: 3000,
  ac: 20,
  attackBonus: 11,
  damage: {
    count: 5,
    sides: 10,
    bonus: 7,
    type: "bludgeoning",
    attackType: "weapon",
    label: "5d10 + 7 bludgeoning",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["cold", "fire", "lightning", "bludgeoning", "piercing", "slashing", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "frightened"],
  specialAbility: [
    "Crushing Dominion", // On hit: target makes Str save against 19 or is knocked prone and pushed 10 ft.
  ],
  initiativeBonus: 3,
  speedFeet: 35,
  behavior: "melee",
  token: "T",
  tokenArt: "assets/tokens/abyssal-tyrant-spawn.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "ruinChoirWarlock", {
  name: "Ruin-Choir Warlock",
  role: "Abyssal chant caster",
  tags: ["fiend", "demon", "caster", "psychic"],
  maxHp: 142,
  category: 7,
  xp: 2800,
  ac: 18,
  attackBonus: 11,
  damage: {
    count: 5,
    sides: 8,
    bonus: 7,
    type: "necrotic",
    attackType: "spell",
    label: "5d8 + 7 necrotic",
    range: {
      kind: "ranged",
      normal: 100,
      long: 300,
      feet: 100,
    },
  },
  damageResistances: ["cold", "fire", "lightning", "necrotic", "bludgeoning", "piercing", "slashing", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "charmed"],
  specialAbility: [
    "Ruin Hymn", // 20 ft radius, Wis save against 19, 8d8 psychic damage and -2 to next save if unsuccessful, half damage if successful.
  ],
  initiativeBonus: 5,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "C",
  tokenArt: "assets/tokens/ruin-choir-warlock.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "bladeQueenSarthyxa", {
  name: "Blade-Queen Sarthyxa",
  role: "Category 7 demon boss",
  tags: ["fiend", "demon", "boss", "marilith", "queen"],
  maxHp: 330,
  category: 7,
  multiattack: { attacks: 3 },
  xp: 7200,
  ac: 21,
  attackBonus: 12,
  damage: {
    count: 6,
    sides: 8,
    bonus: 8,
    type: "slashing",
    attackType: "weapon",
    label: "6d8 + 8 slashing",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["cold", "fire", "lightning", "necrotic", "bludgeoning", "piercing", "slashing", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "charmed", "frightened", "restrained"],
  specialAbility: [
    "Dance of Six Deaths", // Once per fight: makes a sweeping attack against all adjacent enemies; Dex save against 20 or 10d8 slashing damage, half on success.
    "Abyssal Riposte", // Reaction-style effect: when missed by melee attack, attacker takes 3d8 slashing damage.
  ],
  initiativeBonus: 8,
  speedFeet: 45,
  behavior: "melee",
  token: "Q",
  tokenArt: "assets/tokens/blade-queen-sarthyxa.jpg",
  flying: false,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});



/* ============================================================
 * CATEGORY 8 — Party Level 15/16
 * Theme: balor-scale destroyers, storm demons, apocalypse beasts
 * ============================================================ */

window.DungeonContent.register("monsters", "balorAshbringer", {
  name: "Balor Ashbringer",
  role: "Flying fire-and-whip destroyer",
  tags: ["fiend", "demon", "balor", "flying", "destroyer"],
  maxHp: 220,
  category: 8,
  multiattack: { attacks: 2 },
  xp: 3900,
  ac: 20,
  attackBonus: 12,
  damage: {
    count: 6,
    sides: 8,
    bonus: 8,
    type: "fire",
    attackType: "weapon",
    label: "6d8 + 8 fire",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["cold", "fire", "lightning", "necrotic", "bludgeoning", "piercing", "slashing", "psychic"],
  damageVulnerabilities: ["radiant", "cold"],
  damageImmunities: ["poison", "fire"],
  conditionImmunities: ["poisoned", "charmed", "frightened"],
  specialAbility: [
    "Lightning Whip", // On hit: target makes Str save against 20 or is pulled 10 ft and takes +3d8 lightning damage.
    "Death Throes", // When reduced to 0 HP: 20 ft fire burst, Dex save against 20, 10d6 fire damage, half on success.
  ],
  initiativeBonus: 6,
  speedFeet: 45,
  behavior: "melee",
  token: "B",
  tokenArt: "assets/tokens/balor-ashbringer.jpg",
  flying: true,
});


window.DungeonContent.register("monsters", "abyssStormReaver", {
  name: "Abyss Storm Reaver",
  role: "Lightning demon artillery",
  tags: ["fiend", "demon", "storm", "artillery"],
  maxHp: 190,
  category: 8,
  xp: 4000,
  ac: 19,
  attackBonus: 12,
  damage: {
    count: 6,
    sides: 8,
    bonus: 8,
    type: "lightning",
    attackType: "spell",
    label: "6d8 + 8 lightning",
    range: {
      kind: "ranged",
      normal: 120,
      long: 360,
      feet: 120,
    },
  },
  damageResistances: ["cold", "fire", "lightning", "necrotic", "bludgeoning", "piercing", "slashing", "thunder"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison", "lightning"],
  conditionImmunities: ["poisoned", "frightened"],
  specialAbility: [
    "Abyss Storm", // 30 ft line, Dex save against 20, 10d8 lightning damage and pushed 10 ft if save unsuccessful, half if successful.
  ],
  initiativeBonus: 6,
  speedFeet: 40,
  behavior: "rangedKiter",
  token: "S",
  tokenArt: "assets/tokens/abyss-storm-reaver.jpg",
  flying: true,
});


window.DungeonContent.register("monsters", "apocalypseGoristro", {
  name: "Apocalypse Goristro",
  role: "Siege-sized charger",
  tags: ["fiend", "demon", "goristro", "siege", "brute"],
  maxHp: 245,
  category: 8,
  multiattack: { attacks: 2 },
  xp: 4100,
  ac: 21,
  attackBonus: 12,
  damage: {
    count: 6,
    sides: 10,
    bonus: 8,
    type: "bludgeoning",
    attackType: "weapon",
    label: "6d10 + 8 bludgeoning",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["cold", "fire", "lightning", "necrotic", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "frightened"],
  specialAbility: [
    "Siege Charge", // If it moves at least 20 ft before attacking, target makes Str save against 20 or takes +5d10 bludgeoning damage and is knocked prone.
  ],
  initiativeBonus: 3,
  speedFeet: 45,
  behavior: "melee",
  token: "G",
  tokenArt: "assets/tokens/apocalypse-goristro.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "balorRiftGeneral", {
  name: "Balor Rift-General",
  role: "Category 8 demon boss",
  tags: ["fiend", "demon", "boss", "balor", "general"],
  maxHp: 390,
  category: 8,
  multiattack: { attacks: 2 },
  xp: 9000,
  ac: 22,
  attackBonus: 13,
  damage: {
    count: 7,
    sides: 8,
    bonus: 8,
    type: "fire",
    attackType: "weapon",
    label: "7d8 + 8 fire",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["cold", "fire", "lightning", "necrotic", "bludgeoning", "piercing", "slashing", "psychic"],
  damageVulnerabilities: ["radiant", "cold"],
  damageImmunities: ["poison", "fire"],
  conditionImmunities: ["poisoned", "charmed", "frightened"],
  specialAbility: [
    "Abyssal Command Roar", // Once per fight: allied demons within 60 ft gain +2 attack and +10 ft speed for one round.
    "Flaming Whipstorm", // 20 ft radius, Dex save against 21, 12d8 fire damage and pulled 10 ft on failed save, half damage on success.
    "Greater Death Throes", // When reduced to 0 HP: 30 ft explosion, Dex save against 21, 14d6 fire damage, half on success.
  ],
  initiativeBonus: 7,
  speedFeet: 50,
  behavior: "melee",
  token: "R",
  tokenArt: "assets/tokens/balor-rift-general.jpg",
  flying: true,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});



/* ============================================================
 * CATEGORY 9 — Party Level 17/18
 * Theme: demon princes' heralds, abyssal siege horrors, soul eaters
 * ============================================================ */

window.DungeonContent.register("monsters", "heraldOfTheDemonPrince", {
  name: "Herald of the Demon Prince",
  role: "Prince-touched ruin commander",
  tags: ["fiend", "demon", "herald", "commander"],
  maxHp: 238,
  category: 9,
  xp: 5200,
  ac: 21,
  attackBonus: 12,
  damage: {
    count: 6,
    sides: 10,
    bonus: 9,
    type: "necrotic",
    attackType: "spell",
    label: "6d10 + 9 necrotic",
    range: {
      kind: "ranged",
      normal: 100,
      long: 300,
      feet: 100,
    },
  },
  damageResistances: ["cold", "fire", "lightning", "necrotic", "bludgeoning", "piercing", "slashing", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "charmed", "frightened"],
  specialAbility: [
    "Prince's Mark", // Once per fight: target makes Cha save against 20 or becomes marked; all demons deal +2d8 damage to marked target for one round.
  ],
  initiativeBonus: 6,
  speedFeet: 40,
  behavior: "rangedKiter",
  token: "H",
  tokenArt: "assets/tokens/herald-of-the-demon-prince.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "abyssalSiegeTitan", {
  name: "Abyssal Siege Titan",
  role: "Colossal wall-breaker demon",
  sizeSquares: 3,
  tags: ["fiend", "demon", "titan", "siege"],
  maxHp: 280,
  category: 9,
  multiattack: { attacks: 3 },
  xp: 5400,
  ac: 22,
  attackBonus: 12,
  damage: {
    count: 7,
    sides: 10,
    bonus: 9,
    type: "bludgeoning",
    attackType: "weapon",
    label: "7d10 + 9 bludgeoning",
    range: {
      kind: "melee",
      feet: 15,
    },
  },
  damageResistances: ["cold", "fire", "lightning", "necrotic", "bludgeoning", "piercing", "slashing", "force"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "frightened", "restrained"],
  specialAbility: [
    "World-Cracker Slam", // 15 ft radius circle, Str save against 20, 12d10 bludgeoning damage and knocked prone if save unsuccessful, half if successful.
  ],
  initiativeBonus: 2,
  speedFeet: 35,
  behavior: "melee",
  token: "T",
  tokenArt: "assets/tokens/abyssal-siege-titan.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "soulEaterOfTheRift", {
  name: "Soul-Eater of the Rift",
  role: "Flying life-drain executioner",
  tags: ["fiend", "demon", "soul-eater", "flying"],
  maxHp: 230,
  category: 9,
  multiattack: { attacks: 3 },
  xp: 5300,
  ac: 21,
  attackBonus: 12,
  damage: {
    count: 6,
    sides: 8,
    bonus: 9,
    type: "necrotic",
    attackType: "weapon",
    label: "6d8 + 9 necrotic",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["cold", "fire", "lightning", "necrotic", "bludgeoning", "piercing", "slashing", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "charmed", "frightened"],
  specialAbility: [
    "Devour Soul", // On hit: target makes Con save against 20 or maximum HP is reduced by damage dealt until end of fight; demon heals half damage dealt.
  ],
  initiativeBonus: 7,
  speedFeet: 50,
  behavior: "melee",
  token: "E",
  tokenArt: "assets/tokens/soul-eater-of-the-rift.jpg",
  flying: true,
});


window.DungeonContent.register("monsters", "princeSpawnGharazhul", {
  name: "Prince-Spawn Gharazhul",
  role: "Category 9 demon boss",
  tags: ["fiend", "demon", "boss", "prince-spawn", "ruin"],
  maxHp: 440,
  category: 9,
  multiattack: { attacks: 3 },
  xp: 11500,
  ac: 22,
  attackBonus: 13,
  damage: {
    count: 7,
    sides: 8,
    bonus: 9,
    type: "force",
    attackType: "weapon",
    label: "7d8 + 9 force",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["cold", "fire", "lightning", "necrotic", "bludgeoning", "piercing", "slashing", "psychic", "force"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "charmed", "frightened", "restrained"],
  specialAbility: [
    "Rift Sovereignty", // Once per fight: opens three rifts; enemies within 15 ft of a rift make Dex save against 21 or take 10d8 force damage and teleport 10 ft.
    "Spawn of Ruin", // At half HP: summons or empowers lesser demons; nearby allied fiends gain +2 attack for one round.
  ],
  initiativeBonus: 6,
  speedFeet: 45,
  behavior: "melee",
  token: "G",
  tokenArt: "assets/tokens/prince-spawn-gharazhul.jpg",
  flying: false,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});



/* ============================================================
 * CATEGORY 10 — Party Level 19/20
 * Theme: avatar-tier demons, living abyss gates, demon prince manifestations
 * ============================================================ */

window.DungeonContent.register("monsters", "abyssGateColossus", {
  name: "Abyss-Gate Colossus",
  role: "Living portal titan",
  sizeSquares: 3,
  tags: ["fiend", "demon", "gate", "titan", "brute"],
  maxHp: 330,
  category: 10,
  multiattack: { attacks: 4 },
  xp: 8500,
  ac: 22,
  attackBonus: 13,
  damage: {
    count: 8,
    sides: 8,
    bonus: 10,
    type: "force",
    attackType: "weapon",
    label: "8d8 + 10 force",
    range: {
      kind: "melee",
      feet: 15,
    },
  },
  damageResistances: ["cold", "fire", "lightning", "necrotic", "bludgeoning", "piercing", "slashing", "force", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "charmed", "frightened", "restrained"],
  specialAbility: [
    "Gate Pulse", // Once per fight: 30 ft radius, Con save against 21, 12d8 force damage and pulled 15 ft toward the colossus if save unsuccessful, half damage if successful.
    "Demon Gate", // Each round-style effect: can spawn a lesser demon or empower one allied fiend within 60 ft.
  ],
  initiativeBonus: 3,
  speedFeet: 35,
  behavior: "melee",
  token: "C",
  tokenArt: "assets/tokens/abyss-gate-colossus.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "avatarOfEndlessHunger", {
  name: "Avatar of Endless Hunger",
  role: "Demon prince hunger aspect",
  sizeSquares: 3,
  tags: ["fiend", "demon", "avatar", "hunger"],
  maxHp: 310,
  category: 10,
  multiattack: { attacks: 4 },
  xp: 8700,
  ac: 22,
  attackBonus: 13,
  damage: {
    count: 8,
    sides: 10,
    bonus: 10,
    type: "piercing",
    attackType: "weapon",
    label: "8d10 + 10 piercing",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["cold", "fire", "lightning", "necrotic", "bludgeoning", "piercing", "slashing", "acid", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison", "acid"],
  conditionImmunities: ["poisoned", "charmed", "frightened"],
  specialAbility: [
    "Unending Appetite", // When it hits a bloodied target, heals 4d8 HP and target makes Con save against 21 or loses healing until end of next turn.
    "Maw of the Abyss", // 20 ft cone, Dex save against 21, 13d10 piercing damage and pulled 10 ft if save unsuccessful, half if successful.
  ],
  initiativeBonus: 6,
  speedFeet: 45,
  behavior: "melee",
  token: "H",
  tokenArt: "assets/tokens/avatar-of-endless-hunger.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "chaosStarSeraph", {
  name: "Chaos-Star Seraph",
  role: "Flying abyssal spell destroyer",
  tags: ["fiend", "demon", "seraph", "flying", "caster"],
  maxHp: 286,
  category: 10,
  xp: 8800,
  ac: 23,
  attackBonus: 13,
  damage: {
    count: 8,
    sides: 8,
    bonus: 10,
    type: "psychic",
    attackType: "spell",
    label: "8d8 + 10 psychic",
    range: {
      kind: "ranged",
      normal: 120,
      long: 360,
      feet: 120,
    },
  },
  damageResistances: ["cold", "fire", "lightning", "necrotic", "bludgeoning", "piercing", "slashing", "radiant", "psychic"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "charmed", "frightened"],
  specialAbility: [
    "Chaos Star", // 30 ft radius, Wis save against 21, 12d8 psychic damage and confused/frightened for one turn if save unsuccessful, half damage if successful.
    "Falling Star Dive", // If it moves 30 ft before attacking, add 5d8 radiant or fire damage on hit.
  ],
  initiativeBonus: 8,
  speedFeet: 60,
  behavior: "rangedKiter",
  token: "S",
  tokenArt: "assets/tokens/chaos-star-seraph.jpg",
  flying: true,
});


window.DungeonContent.register("monsters", "manifestDemonPrinceAzrakhul", {
  name: "Manifest Demon Prince Azrakhul",
  role: "Category 10 final demon boss",
  sizeSquares: 3,
  tags: ["fiend", "demon", "boss", "demon-prince", "avatar"],
  maxHp: 600,
  category: 10,
  xp: 25000,
  ac: 23,
  attackBonus: 14,
  damage: {
    count: 9,
    sides: 8,
    bonus: 10,
    type: "necrotic",
    attackType: "spell",
    label: "9d8 + 10 necrotic",
    range: {
      kind: "ranged",
      normal: 120,
      long: 360,
      feet: 120,
    },
  },
  damageResistances: ["cold", "fire", "lightning", "necrotic", "bludgeoning", "piercing", "slashing", "force", "psychic", "radiant"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison", "fire"],
  conditionImmunities: ["poisoned", "charmed", "frightened", "restrained"],
  specialAbility: [
    "Abyss Unleashed", // Once per fight: all enemies make Wis save against 22; on failure take 14d8 psychic damage and are frightened/confused for one turn, half damage on success.
    "Reality Tear", // 30 ft line, Dex save against 22, 15d8 force damage and teleport 20 ft on failed save, half damage on success.
    "Prince's Second Form", // When first reduced to 0 HP: instead remains at 1 HP, sheds conditions, and immediately triggers a 30 ft necrotic burst.
  ],
  initiativeBonus: 8,
  speedFeet: 50,
  behavior: "rangedKiter",
  token: "A",
  tokenArt: "assets/tokens/manifest-demon-prince-azrakhul.jpg",
  flying: true,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});


})();
