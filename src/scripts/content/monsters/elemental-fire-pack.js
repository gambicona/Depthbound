(() => {

/* ============================================================
 * ELEMENTAL / FIRE MONSTER PACK
 * Theme: fire elementals, magma spirits, smoke, ash, cinders,
 *        lava, glassfire, volcano avatars, and paraelemental hazards.
 * Notes: Every monster starts its tags with "elemental" as requested.
 *        Fire elementals usually ignore fire/poison, often hate cold,
 *        while ash/smoke paraelementals lean toward choking, blindness,
 *        movement denial, thunder vulnerability, and battlefield hazards.
 * ============================================================ */


/* ============================================================
 * CATEGORY 1 — Party Level 1/2
 * Theme: small fire spirits, cinders, ash pests, weak mephit-like paraelementals
 * ============================================================ */

window.DungeonContent.register("monsters", "emberWisp", {
  name: "Ember Wisp",
  role: "Tiny flying fire mote",
  tags: ["elemental", "fire", "wisp", "flying", "skirmisher"],
  maxHp: 9,
  category: 1,
  xp: 55,
  ac: 13,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 6,
    bonus: 2,
    type: "fire",
    attackType: "spell",
    label: "1d6 + 2 fire",
    range: {
      kind: "ranged",
      normal: 30,
      long: 90,
      feet: 30,
    },
  },
  damageResistances: ["fire"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Kindle", // On hit: target takes 1 extra fire damage at the start of its next turn unless it moves at least 10 ft.
  ],
  initiativeBonus: 3,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "E",
  tokenArt: "assets/tokens/ember-wisp.jpg",
  flying: true,
});


window.DungeonContent.register("monsters", "ashScuttler", {
  name: "Ash Scuttler",
  role: "Small choking ash pest",
  tags: ["elemental", "ash", "paraelemental", "crawler", "skirmisher"],
  maxHp: 14,
  category: 1,
  xp: 50,
  ac: 12,
  attackBonus: 3,
  damage: {
    count: 1,
    sides: 6,
    bonus: 1,
    type: "necrotic",
    attackType: "weapon",
    label: "1d6 + 1 necrotic",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["fire", "necrotic"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Ash Cough", // On hit: target makes Con save against 11 or has -1 attack bonus until end of its next turn.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "A",
  tokenArt: "assets/tokens/ash-scuttler.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "cinderSprite", {
  name: "Cinder Sprite",
  role: "Weak fire elemental ambusher",
  tags: ["elemental", "fire", "cinder", "ambusher"],
  maxHp: 11,
  category: 1,
  xp: 60,
  ac: 14,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 6,
    bonus: 2,
    type: "fire",
    attackType: "spell",
    label: "1d6 + 2 fire",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["fire"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Flare Step", // First time it is hit each fight: shift 1 cell away without provoking if there is free space.
  ],
  initiativeBonus: 4,
  speedFeet: 35,
  behavior: "melee",
  token: "C",
  tokenArt: "assets/tokens/cinder-sprite.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "kindledAshBrute", {
  name: "Kindled Ash Brute",
  role: "Category 1 elemental boss",
  tags: ["elemental", "ash", "fire", "boss", "brute"],
  maxHp: 36,
  category: 1,
  xp: 150,
  ac: 13,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 10,
    bonus: 3,
    type: "fire",
    attackType: "weapon",
    label: "1d10 + 3 fire",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["fire", "necrotic"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Ashen Burst", // Once per fight at half HP: adjacent enemies take small fire damage and make Con save or suffer -1 AC for 1 round.
  ],
  initiativeBonus: 1,
  speedFeet: 25,
  behavior: "melee",
  token: "B",
  tokenArt: "assets/tokens/kindled-ash-brute.jpg",
  flying: false,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});



/* ============================================================
 * CATEGORY 2 — Party Level 3/4
 * Theme: smoke mephits, coal servants, young magma and ash hunters
 * ============================================================ */

window.DungeonContent.register("monsters", "smokeMephitSneak", {
  name: "Smoke Mephit Sneak",
  role: "Flying smoke harrier",
  tags: ["elemental", "smoke", "paraelemental", "mephit", "flying"],
  maxHp: 22,
  category: 2,
  xp: 150,
  ac: 14,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 8,
    bonus: 3,
    type: "fire",
    attackType: "spell",
    label: "1d8 + 3 fire",
    range: {
      kind: "ranged",
      normal: 40,
      long: 120,
      feet: 40,
    },
  },
  damageResistances: ["fire", "thunder"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Smoke Veil", // When damaged: attacker makes Wis save against 12 or the mephit gains +2 AC against that attacker until next turn.
  ],
  initiativeBonus: 4,
  speedFeet: 35,
  behavior: "rangedKiter",
  token: "S",
  tokenArt: "assets/tokens/smoke-mephit-sneak.jpg",
  flying: true,
});


window.DungeonContent.register("monsters", "lavaGlassSkitterer", {
  name: "Lava-Glass Skitterer",
  role: "Fast obsidian fire beast",
  tags: ["elemental", "fire", "magma", "glass", "skirmisher"],
  maxHp: 28,
  category: 2,
  xp: 165,
  ac: 15,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 8,
    bonus: 3,
    type: "slashing",
    attackType: "weapon",
    label: "1d8 + 3 slashing",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["fire", "piercing"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Glass Splinters", // On death: adjacent enemies take small piercing damage unless they pass Dex save against 12.
  ],
  initiativeBonus: 5,
  speedFeet: 40,
  behavior: "melee",
  token: "G",
  tokenArt: "assets/tokens/lava-glass-skitterer.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "coalHeartIgniter", {
  name: "Coal-Heart Igniter",
  role: "Lesser fire artillery",
  tags: ["elemental", "fire", "coal", "ranged"],
  maxHp: 26,
  category: 2,
  xp: 160,
  ac: 13,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 10,
    bonus: 3,
    type: "fire",
    attackType: "spell",
    label: "1d10 + 3 fire",
    range: {
      kind: "ranged",
      normal: 60,
      long: 180,
      feet: 60,
    },
  },
  damageResistances: ["fire"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Ignite Ground", // On hit: target's cell becomes briefly hazardous; first creature entering it before next round takes small fire damage.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "ranged",
  token: "I",
  tokenArt: "assets/tokens/coal-heart-igniter.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "sootflameTaskmaster", {
  name: "Sootflame Taskmaster",
  role: "Category 2 elemental boss",
  tags: ["elemental", "fire", "smoke", "boss", "controller"],
  maxHp: 64,
  category: 2,
  xp: 360,
  ac: 15,
  attackBonus: 6,
  damage: {
    count: 2,
    sides: 6,
    bonus: 4,
    type: "fire",
    attackType: "spell",
    label: "2d6 + 4 fire",
    range: {
      kind: "ranged",
      normal: 50,
      long: 150,
      feet: 50,
    },
  },
  damageResistances: ["fire", "necrotic", "thunder"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Command the Coals", // Once per round: one elemental ally may move 10 ft or make a weak fire attack after the boss acts.
  ],
  initiativeBonus: 3,
  speedFeet: 30,
  behavior: "ranged",
  token: "T",
  tokenArt: "assets/tokens/sootflame-taskmaster.jpg",
  flying: false,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});



/* ============================================================
 * CATEGORY 3 — Party Level 5/6
 * Theme: lesser fire elementals, ash stranglers, magma hounds
 * ============================================================ */

window.DungeonContent.register("monsters", "lesserFireMyrmidon", {
  name: "Lesser Fire Myrmidon",
  role: "Armored fire elemental soldier",
  tags: ["elemental", "fire", "myrmidon", "soldier"],
  maxHp: 48,
  category: 3,
  xp: 320,
  ac: 16,
  attackBonus: 6,
  damage: {
    count: 2,
    sides: 6,
    bonus: 3,
    type: "fire",
    attackType: "weapon",
    label: "2d6 + 3 fire",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["fire", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Burning Guard", // Creatures that miss it with melee attacks take small fire damage.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "M",
  tokenArt: "assets/tokens/lesser-fire-myrmidon.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "ashParaelementalStrangler", {
  name: "Ash Paraelemental Strangler",
  role: "Choking ash controller",
  tags: ["elemental", "ash", "paraelemental", "controller"],
  maxHp: 42,
  category: 3,
  xp: 330,
  ac: 14,
  attackBonus: 6,
  damage: {
    count: 2,
    sides: 6,
    bonus: 3,
    type: "necrotic",
    attackType: "weapon",
    label: "2d6 + 3 necrotic",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["fire", "necrotic", "bludgeoning"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Choking Grasp", // On hit: target makes Con save against 13 or loses 10 ft speed and cannot use reactions for 1 round.
  ],
  initiativeBonus: 1,
  speedFeet: 25,
  behavior: "melee",
  token: "A",
  tokenArt: "assets/tokens/ash-paraelemental-strangler.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "magmaShardHound", {
  name: "Magma Shard Hound",
  role: "Molten pursuit beast",
  tags: ["elemental", "magma", "fire", "beast", "skirmisher"],
  maxHp: 46,
  category: 3,
  xp: 340,
  ac: 15,
  attackBonus: 7,
  damage: {
    count: 2,
    sides: 6,
    bonus: 4,
    type: "fire",
    attackType: "weapon",
    label: "2d6 + 4 fire",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["fire", "slashing"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Molten Pounce", // If it moves at least 20 ft before attacking, add extra fire damage and knock target back 1 cell on failed Str save.
  ],
  initiativeBonus: 4,
  speedFeet: 45,
  behavior: "melee",
  token: "H",
  tokenArt: "assets/tokens/magma-shard-hound.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "furnaceCoreMyrmidon", {
  name: "Furnace-Core Myrmidon",
  role: "Category 3 elemental boss",
  tags: ["elemental", "fire", "myrmidon", "boss", "soldier"],
  maxHp: 92,
  category: 3,
  xp: 700,
  ac: 17,
  attackBonus: 7,
  damage: {
    count: 2,
    sides: 8,
    bonus: 5,
    type: "fire",
    attackType: "weapon",
    label: "2d8 + 5 fire",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["fire", "poison", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Furnace Shield", // While above half HP, adjacent enemies take small fire damage at the start of their turns.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "F",
  tokenArt: "assets/tokens/furnace-core-myrmidon.jpg",
  flying: false,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});



/* ============================================================
 * CATEGORY 4 — Party Level 7/8
 * Theme: salamander-like burners, glassfire duelists, furnace guardians
 * ============================================================ */

window.DungeonContent.register("monsters", "salamanderFlameguard", {
  name: "Salamander Flameguard",
  role: "Reach fire soldier",
  tags: ["elemental", "fire", "salamander", "soldier"],
  maxHp: 70,
  category: 4,
  multiattack: { attacks: 2 },
  xp: 600,
  ac: 16,
  attackBonus: 7,
  damage: {
    count: 2,
    sides: 8,
    bonus: 4,
    type: "fire",
    attackType: "weapon",
    label: "2d8 + 4 fire",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["fire", "poison", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Heated Spear", // On hit: target takes repeat fire damage at end of next turn unless it spends movement to scrape off burning slag.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "S",
  tokenArt: "assets/tokens/salamander-flameguard.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "obsidianSmelter", {
  name: "Obsidian Smelter",
  role: "Slow armor-breaking brute",
  tags: ["elemental", "magma", "obsidian", "brute"],
  maxHp: 82,
  category: 4,
  multiattack: { attacks: 2 },
  xp: 630,
  ac: 17,
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
  damageResistances: ["fire", "poison", "piercing", "slashing"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Melt Armor", // On hit: target makes Dex save against 14 or suffers -1 AC until end of combat; does not stack more than twice.
  ],
  initiativeBonus: 0,
  speedFeet: 25,
  behavior: "melee",
  token: "O",
  tokenArt: "assets/tokens/obsidian-smelter.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "cinderstormDancer", {
  name: "Cinderstorm Dancer",
  role: "Mobile burning skirmisher",
  tags: ["elemental", "fire", "cinder", "flying", "skirmisher"],
  maxHp: 58,
  category: 4,
  multiattack: { attacks: 2 },
  xp: 620,
  ac: 18,
  attackBonus: 8,
  damage: {
    count: 2,
    sides: 6,
    bonus: 5,
    type: "fire",
    attackType: "spell",
    label: "2d6 + 5 fire",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["fire", "lightning"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Cinder Dance", // After hitting, may move 15 ft; path leaves brief cinder trail that deals small fire damage to enemies entering it.
  ],
  initiativeBonus: 6,
  speedFeet: 45,
  behavior: "melee",
  token: "D",
  tokenArt: "assets/tokens/cinderstorm-dancer.jpg",
  flying: true,
});


window.DungeonContent.register("monsters", "ashenPyreLord", {
  name: "Ashen Pyre Lord",
  role: "Category 4 elemental boss",
  tags: ["elemental", "ash", "fire", "boss", "controller"],
  maxHp: 134,
  category: 4,
  xp: 1350,
  ac: 17,
  attackBonus: 8,
  damage: {
    count: 3,
    sides: 6,
    bonus: 5,
    type: "fire",
    attackType: "spell",
    label: "3d6 + 5 fire",
    range: {
      kind: "ranged",
      normal: 60,
      long: 180,
      feet: 60,
    },
  },
  damageResistances: ["fire", "necrotic", "poison", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Pyre Command", // Once per fight: creates a 15 ft ash cloud; enemies inside make Con saves or are blinded/accuracy-reduced for 1 round.
  ],
  initiativeBonus: 3,
  speedFeet: 30,
  behavior: "ranged",
  token: "P",
  tokenArt: "assets/tokens/ashen-pyre-lord.jpg",
  flying: false,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});



/* ============================================================
 * CATEGORY 5 — Party Level 9/10
 * Theme: magma myrmidons, smoke assassins, emberstorm artillery
 * ============================================================ */

window.DungeonContent.register("monsters", "magmaMyrmidon", {
  name: "Magma Myrmidon",
  role: "Heavy molten frontline",
  tags: ["elemental", "magma", "fire", "myrmidon", "brute"],
  maxHp: 102,
  category: 5,
  multiattack: { attacks: 2 },
  xp: 1000,
  ac: 18,
  attackBonus: 8,
  damage: {
    count: 3,
    sides: 8,
    bonus: 5,
    type: "fire",
    attackType: "weapon",
    label: "3d8 + 5 fire",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["fire", "poison", "lightning", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Molten Body", // Enemies that start adjacent take small fire damage; cold damage suppresses this aura for 1 round.
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "melee",
  token: "M",
  tokenArt: "assets/tokens/magma-myrmidon.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "smokeVeilAssassin", {
  name: "Smoke-Veil Assassin",
  role: "Flying obscuring striker",
  tags: ["elemental", "smoke", "paraelemental", "flying", "ambusher"],
  maxHp: 78,
  category: 5,
  multiattack: { attacks: 2 },
  xp: 980,
  ac: 19,
  attackBonus: 9,
  damage: {
    count: 3,
    sides: 6,
    bonus: 5,
    type: "necrotic",
    attackType: "weapon",
    label: "3d6 + 5 necrotic",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["fire", "necrotic", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "grappled", "restrained"],
  specialAbility: [
    "Vanish into Soot", // After dealing damage: becomes harder to hit until start of next turn unless damaged by thunder or wind-like effect.
  ],
  initiativeBonus: 7,
  speedFeet: 50,
  behavior: "melee",
  token: "V",
  tokenArt: "assets/tokens/smoke-veil-assassin.jpg",
  flying: true,
});


window.DungeonContent.register("monsters", "emberstormArtillery", {
  name: "Emberstorm Artillery",
  role: "Long-range fire blaster",
  tags: ["elemental", "fire", "ember", "ranged", "artillery"],
  maxHp: 84,
  category: 5,
  xp: 1050,
  ac: 16,
  attackBonus: 9,
  damage: {
    count: 4,
    sides: 6,
    bonus: 4,
    type: "fire",
    attackType: "spell",
    label: "4d6 + 4 fire",
    range: {
      kind: "ranged",
      normal: 80,
      long: 240,
      feet: 80,
    },
  },
  damageResistances: ["fire", "lightning"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Ember Mortar", // On hit: splashes small fire damage to creatures adjacent to the target.
  ],
  initiativeBonus: 3,
  speedFeet: 25,
  behavior: "ranged",
  token: "E",
  tokenArt: "assets/tokens/emberstorm-artillery.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "volcanicHeartTyrant", {
  name: "Volcanic Heart Tyrant",
  role: "Category 5 elemental boss",
  tags: ["elemental", "magma", "fire", "boss", "brute"],
  maxHp: 190,
  category: 5,
  multiattack: { attacks: 2 },
  xp: 2600,
  ac: 19,
  attackBonus: 9,
  damage: {
    count: 3,
    sides: 10,
    bonus: 6,
    type: "fire",
    attackType: "weapon",
    label: "3d10 + 6 fire",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["fire", "poison", "lightning", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Volcanic Pulse", // At half HP: erupts; enemies within 20 ft make Dex save or take fire damage and are pushed 10 ft.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "T",
  tokenArt: "assets/tokens/volcanic-heart-tyrant.jpg",
  flying: false,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});



/* ============================================================
 * CATEGORY 6 — Party Level 11/12
 * Theme: lava colossi, ash cyclones, glassfire oracles
 * ============================================================ */

window.DungeonContent.register("monsters", "lavaTideColossus", {
  name: "Lava-Tide Colossus",
  role: "Huge molten area brute",
  tags: ["elemental", "lava", "magma", "brute", "giant"],
  maxHp: 134,
  category: 6,
  multiattack: { attacks: 2 },
  xp: 1800,
  ac: 18,
  attackBonus: 10,
  damage: {
    count: 4,
    sides: 8,
    bonus: 5,
    type: "fire",
    attackType: "weapon",
    label: "4d8 + 5 fire",
    range: {
      kind: "melee",
      feet: 15,
    },
  },
  damageResistances: ["fire", "poison", "lightning", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Lava Wake", // When it moves, cells it leaves become briefly hazardous molten terrain.
  ],
  initiativeBonus: 0,
  speedFeet: 25,
  behavior: "melee",
  token: "L",
  tokenArt: "assets/tokens/lava-tide-colossus.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "ashCycloneRavager", {
  name: "Ash Cyclone Ravager",
  role: "Flying ash vortex controller",
  tags: ["elemental", "ash", "air", "paraelemental", "flying"],
  maxHp: 116,
  category: 6,
  multiattack: { attacks: 2 },
  xp: 1750,
  ac: 19,
  attackBonus: 10,
  damage: {
    count: 4,
    sides: 6,
    bonus: 6,
    type: "slashing",
    attackType: "spell",
    label: "4d6 + 6 slashing",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["fire", "necrotic", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "grappled", "restrained", "prone"],
  specialAbility: [
    "Blinding Cyclone", // Once per fight: enemies in 15 ft make Con save or suffer heavy accuracy penalty for 1 round.
  ],
  initiativeBonus: 6,
  speedFeet: 55,
  behavior: "melee",
  token: "C",
  tokenArt: "assets/tokens/ash-cyclone-ravager.jpg",
  flying: true,
});


window.DungeonContent.register("monsters", "glassfireOracle", {
  name: "Glassfire Oracle",
  role: "Burning crystal spellcaster",
  tags: ["elemental", "fire", "glass", "ranged", "caster"],
  maxHp: 108,
  category: 6,
  xp: 1850,
  ac: 17,
  attackBonus: 10,
  damage: {
    count: 4,
    sides: 6,
    bonus: 7,
    type: "fire",
    attackType: "spell",
    label: "4d6 + 7 fire",
    range: {
      kind: "ranged",
      normal: 90,
      long: 270,
      feet: 90,
    },
  },
  damageResistances: ["fire", "psychic", "lightning"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Mirror Heat", // First time hit each round: attacker takes small fire damage unless it passes Wis save.
  ],
  initiativeBonus: 4,
  speedFeet: 30,
  behavior: "ranged",
  token: "O",
  tokenArt: "assets/tokens/glassfire-oracle.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "cinderCrownElder", {
  name: "Cinder-Crown Elder",
  role: "Category 6 elemental boss",
  tags: ["elemental", "fire", "ash", "boss", "caster"],
  maxHp: 260,
  category: 6,
  xp: 4600,
  ac: 20,
  attackBonus: 11,
  damage: {
    count: 5,
    sides: 6,
    bonus: 7,
    type: "fire",
    attackType: "spell",
    label: "5d6 + 7 fire",
    range: {
      kind: "ranged",
      normal: 100,
      long: 300,
      feet: 100,
    },
  },
  damageResistances: ["fire", "poison", "lightning", "necrotic", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["cold", "thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Cinder Crown", // Once per round: marks one target; marked target takes extra fire damage from all elemental attacks until end of next round.
  ],
  initiativeBonus: 5,
  speedFeet: 35,
  behavior: "ranged",
  token: "K",
  tokenArt: "assets/tokens/cinder-crown-elder.jpg",
  flying: false,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});



/* ============================================================
 * CATEGORY 7 — Party Level 13/14
 * Theme: pyroclasm titans, ash monsoons, magma drakes, efreeti-like tyrants
 * ============================================================ */

window.DungeonContent.register("monsters", "pyroclasmTitanling", {
  name: "Pyroclasm Titanling",
  role: "Siege-scale fire elemental",
  tags: ["elemental", "fire", "magma", "titan", "brute"],
  maxHp: 176,
  category: 7,
  multiattack: { attacks: 2 },
  xp: 2900,
  ac: 20,
  attackBonus: 11,
  damage: {
    count: 4,
    sides: 10,
    bonus: 7,
    type: "fire",
    attackType: "weapon",
    label: "4d10 + 7 fire",
    range: {
      kind: "melee",
      feet: 15,
    },
  },
  damageResistances: ["fire", "poison", "lightning", "necrotic", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Crater Slam", // On hit: target makes Str save against 17 or is knocked prone and adjacent cells become cracked hazardous ground.
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "melee",
  token: "P",
  tokenArt: "assets/tokens/pyroclasm-titanling.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "ashMonsoon", {
  name: "Ash Monsoon",
  role: "Massive flying ash storm",
  tags: ["elemental", "ash", "air", "paraelemental", "flying"],
  maxHp: 150,
  category: 7,
  xp: 2800,
  ac: 19,
  attackBonus: 11,
  damage: {
    count: 5,
    sides: 6,
    bonus: 6,
    type: "necrotic",
    attackType: "spell",
    label: "5d6 + 6 necrotic",
    range: {
      kind: "ranged",
      normal: 70,
      long: 210,
      feet: 70,
    },
  },
  damageResistances: ["fire", "necrotic", "lightning", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "grappled", "restrained", "prone"],
  specialAbility: [
    "Suffocating Rain", // Aura: enemies that start within 10 ft make Con save or cannot heal until start of their next turn.
  ],
  initiativeBonus: 6,
  speedFeet: 60,
  behavior: "rangedKiter",
  token: "A",
  tokenArt: "assets/tokens/ash-monsoon.jpg",
  flying: true,
});


window.DungeonContent.register("monsters", "magmaDrakeElemental", {
  name: "Magma Drake Elemental",
  role: "Molten flying predator",
  tags: ["elemental", "magma", "fire", "drake", "flying"],
  maxHp: 168,
  category: 7,
  multiattack: { attacks: 2 },
  xp: 3000,
  ac: 20,
  attackBonus: 11,
  damage: {
    count: 4,
    sides: 8,
    bonus: 8,
    type: "fire",
    attackType: "weapon",
    label: "4d8 + 8 fire",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["fire", "poison", "lightning", "necrotic", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Magma Breath", // Recharge-style attack: cone of fire; enemies make Dex save or take heavy fire damage and suffer burning for 1 round.
  ],
  initiativeBonus: 5,
  speedFeet: 50,
  behavior: "melee",
  token: "D",
  tokenArt: "assets/tokens/magma-drake-elemental.jpg",
  flying: true,
});


window.DungeonContent.register("monsters", "brassCalderaEfreet", {
  name: "Brass-Caldera Efreet",
  role: "Category 7 elemental boss",
  tags: ["elemental", "fire", "efreeti", "boss", "caster"],
  maxHp: 334,
  category: 7,
  xp: 7200,
  ac: 21,
  attackBonus: 12,
  damage: {
    count: 5,
    sides: 8,
    bonus: 8,
    type: "fire",
    attackType: "spell",
    label: "5d8 + 8 fire",
    range: {
      kind: "ranged",
      normal: 90,
      long: 270,
      feet: 90,
    },
  },
  damageResistances: ["fire", "poison", "lightning", "necrotic", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Infernal Wishflame", // Once per fight: reshapes battlefield with burning walls/tiles and empowers all fire allies for 1 round.
  ],
  initiativeBonus: 5,
  speedFeet: 40,
  behavior: "ranged",
  token: "E",
  tokenArt: "assets/tokens/brass-caldera-efreet.jpg",
  flying: false,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});



/* ============================================================
 * CATEGORY 8 — Party Level 15/16
 * Theme: living volcanoes, obsidian phoenixes, caldera wardens
 * ============================================================ */

window.DungeonContent.register("monsters", "livingVolcano", {
  name: "Living Volcano",
  role: "Walking eruption engine",
  tags: ["elemental", "fire", "magma", "volcano", "brute"],
  maxHp: 232,
  category: 8,
  multiattack: { attacks: 2 },
  xp: 3900,
  ac: 21,
  attackBonus: 12,
  damage: {
    count: 5,
    sides: 10,
    bonus: 8,
    type: "fire",
    attackType: "weapon",
    label: "5d10 + 8 fire",
    range: {
      kind: "melee",
      feet: 15,
    },
  },
  damageResistances: ["fire", "poison", "lightning", "necrotic", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Eruption Cycle", // Every few rounds: erupts, damaging all enemies in a large radius unless they break line of sight or pass Dex save.
  ],
  initiativeBonus: 0,
  speedFeet: 25,
  behavior: "melee",
  token: "V",
  tokenArt: "assets/tokens/living-volcano.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "obsidianPhoenix", {
  name: "Obsidian Phoenix",
  role: "Rebirthing firestorm flyer",
  tags: ["elemental", "fire", "obsidian", "phoenix", "flying"],
  maxHp: 190,
  category: 8,
  xp: 4000,
  ac: 21,
  attackBonus: 12,
  damage: {
    count: 5,
    sides: 8,
    bonus: 8,
    type: "fire",
    attackType: "spell",
    label: "5d8 + 8 fire",
    range: {
      kind: "ranged",
      normal: 80,
      long: 240,
      feet: 80,
    },
  },
  damageResistances: ["fire", "poison", "lightning", "necrotic", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Black Rebirth", // First time reduced to 0 HP: returns at low HP unless killed by cold damage or while chilled.
  ],
  initiativeBonus: 8,
  speedFeet: 70,
  behavior: "rangedKiter",
  token: "P",
  tokenArt: "assets/tokens/obsidian-phoenix.jpg",
  flying: true,
});


window.DungeonContent.register("monsters", "pyroglassJuggernaut", {
  name: "Pyroglass Juggernaut",
  role: "Obsidian armored destroyer",
  tags: ["elemental", "fire", "glass", "obsidian", "soldier"],
  maxHp: 248,
  category: 8,
  multiattack: { attacks: 2 },
  xp: 4100,
  ac: 23,
  attackBonus: 12,
  damage: {
    count: 4,
    sides: 12,
    bonus: 8,
    type: "slashing",
    attackType: "weapon",
    label: "4d12 + 8 slashing",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["fire", "poison", "lightning", "piercing", "slashing"],
  damageVulnerabilities: ["cold", "bludgeoning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Shattering Charge", // If it moves 20 ft before attacking, target makes Str save or is pushed 15 ft and takes extra slashing damage.
  ],
  initiativeBonus: 2,
  speedFeet: 35,
  behavior: "melee",
  token: "J",
  tokenArt: "assets/tokens/pyroglass-juggernaut.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "wardenOfTheCalderaGate", {
  name: "Warden of the Caldera Gate",
  role: "Category 8 elemental boss",
  tags: ["elemental", "magma", "fire", "boss", "guardian"],
  maxHp: 394,
  category: 8,
  multiattack: { attacks: 2 },
  xp: 9000,
  ac: 22,
  attackBonus: 13,
  damage: {
    count: 6,
    sides: 8,
    bonus: 9,
    type: "fire",
    attackType: "weapon",
    label: "6d8 + 9 fire",
    range: {
      kind: "melee",
      feet: 15,
    },
  },
  damageResistances: ["fire", "poison", "lightning", "necrotic", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Caldera Gate", // At half HP: summons lava fissures; enemies crossing them take heavy fire damage until the fight ends.
  ],
  initiativeBonus: 3,
  speedFeet: 35,
  behavior: "melee",
  token: "W",
  tokenArt: "assets/tokens/warden-of-the-caldera-gate.jpg",
  flying: false,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});



/* ============================================================
 * CATEGORY 9 — Party Level 17/18
 * Theme: apocalyptic ash, solar furnaces, worldbreaker magma elementals
 * ============================================================ */

window.DungeonContent.register("monsters", "solarFurnaceAvatar", {
  name: "Solar Furnace Avatar",
  role: "Radiant-hot fire artillery",
  tags: ["elemental", "fire", "solar", "avatar", "ranged"],
  maxHp: 242,
  category: 9,
  xp: 5200,
  ac: 22,
  attackBonus: 12,
  damage: {
    count: 6,
    sides: 8,
    bonus: 8,
    type: "fire",
    attackType: "spell",
    label: "6d8 + 8 fire",
    range: {
      kind: "ranged",
      normal: 120,
      long: 360,
      feet: 120,
    },
  },
  damageResistances: ["fire", "poison", "lightning", "necrotic", "bludgeoning", "piercing", "slashing", "radiant"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "White-Hot Beam", // Line attack: enemies in a straight path make Dex save or take fire/radiant-style damage and become exposed to fire for 1 round.
  ],
  initiativeBonus: 5,
  speedFeet: 40,
  behavior: "ranged",
  token: "S",
  tokenArt: "assets/tokens/solar-furnace-avatar.jpg",
  flying: true,
});


window.DungeonContent.register("monsters", "apocalypseAshElemental", {
  name: "Apocalypse Ash Elemental",
  role: "Soul-choking ash disaster",
  tags: ["elemental", "ash", "paraelemental", "apocalypse", "controller"],
  maxHp: 232,
  category: 9,
  xp: 5300,
  ac: 21,
  attackBonus: 12,
  damage: {
    count: 6,
    sides: 6,
    bonus: 9,
    type: "necrotic",
    attackType: "spell",
    label: "6d6 + 9 necrotic",
    range: {
      kind: "ranged",
      normal: 80,
      long: 240,
      feet: 80,
    },
  },
  damageResistances: ["fire", "necrotic", "poison", "lightning", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "grappled", "restrained", "prone", "exhaustion"],
  specialAbility: [
    "Dead Sky", // Aura: enemies have reduced healing and suffer small necrotic damage when they miss attacks.
  ],
  initiativeBonus: 4,
  speedFeet: 45,
  behavior: "rangedKiter",
  token: "A",
  tokenArt: "assets/tokens/apocalypse-ash-elemental.jpg",
  flying: true,
});


window.DungeonContent.register("monsters", "magmaWorldbreaker", {
  name: "Magma Worldbreaker",
  role: "Massive lava siege elemental",
  tags: ["elemental", "magma", "lava", "worldbreaker", "brute"],
  maxHp: 286,
  category: 9,
  multiattack: { attacks: 3 },
  xp: 5400,
  ac: 23,
  attackBonus: 12,
  damage: {
    count: 5,
    sides: 12,
    bonus: 9,
    type: "fire",
    attackType: "weapon",
    label: "5d12 + 9 fire",
    range: {
      kind: "melee",
      feet: 15,
    },
  },
  damageResistances: ["fire", "poison", "lightning", "necrotic", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Faultline Strike", // On hit: creates a line of cracked molten ground from itself to the target.
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "melee",
  token: "M",
  tokenArt: "assets/tokens/magma-worldbreaker.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "lordOfTheBurningFault", {
  name: "Lord of the Burning Fault",
  role: "Category 9 elemental boss",
  tags: ["elemental", "fire", "magma", "boss", "titan"],
  maxHp: 446,
  category: 9,
  multiattack: { attacks: 3 },
  xp: 11500,
  ac: 23,
  attackBonus: 13,
  damage: {
    count: 6,
    sides: 10,
    bonus: 10,
    type: "fire",
    attackType: "weapon",
    label: "6d10 + 10 fire",
    range: {
      kind: "melee",
      feet: 15,
    },
  },
  damageResistances: ["fire", "poison", "lightning", "necrotic", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Split the Battlefield", // Once per fight: creates a huge lava fault that divides the room and damages anyone crossing it.
  ],
  initiativeBonus: 3,
  speedFeet: 35,
  behavior: "melee",
  token: "L",
  tokenArt: "assets/tokens/lord-of-the-burning-fault.jpg",
  flying: false,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});



/* ============================================================
 * CATEGORY 10 — Party Level 19/20
 * Theme: primordial firestorms, world-ash avatars, elemental-plane manifestations
 * ============================================================ */

window.DungeonContent.register("monsters", "primordialFirestorm", {
  name: "Primordial Firestorm",
  role: "Avatar-tier flying inferno",
  tags: ["elemental", "fire", "storm", "primordial", "flying"],
  maxHp: 320,
  category: 10,
  xp: 8500,
  ac: 23,
  attackBonus: 13,
  damage: {
    count: 7,
    sides: 8,
    bonus: 10,
    type: "fire",
    attackType: "spell",
    label: "7d8 + 10 fire",
    range: {
      kind: "ranged",
      normal: 120,
      long: 360,
      feet: 120,
    },
  },
  damageResistances: ["fire", "poison", "lightning", "necrotic", "bludgeoning", "piercing", "slashing", "radiant"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "grappled", "restrained", "prone", "exhaustion"],
  specialAbility: [
    "Firestorm Body", // Aura: enemies within 15 ft take fire damage; cold damage shrinks the aura for 1 round.
  ],
  initiativeBonus: 8,
  speedFeet: 80,
  behavior: "rangedKiter",
  token: "F",
  tokenArt: "assets/tokens/primordial-firestorm.jpg",
  flying: true,
});


window.DungeonContent.register("monsters", "worldAshColossus", {
  name: "World-Ash Colossus",
  role: "Primordial ash extinction brute",
  tags: ["elemental", "ash", "paraelemental", "primordial", "colossus"],
  maxHp: 352,
  category: 10,
  multiattack: { attacks: 4 },
  xp: 8700,
  ac: 22,
  attackBonus: 13,
  damage: {
    count: 7,
    sides: 6,
    bonus: 11,
    type: "necrotic",
    attackType: "weapon",
    label: "7d6 + 11 necrotic",
    range: {
      kind: "melee",
      feet: 15,
    },
  },
  damageResistances: ["fire", "necrotic", "poison", "lightning", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "grappled", "restrained", "prone", "exhaustion"],
  specialAbility: [
    "End-Breath Ash", // Cone attack: enemies make Con save or take necrotic damage and cannot regain HP for 1 round.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "A",
  tokenArt: "assets/tokens/world-ash-colossus.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "heartOfTheElementalPyre", {
  name: "Heart of the Elemental Pyre",
  role: "Living gate to the Plane of Fire",
  tags: ["elemental", "fire", "planar", "avatar", "ranged"],
  maxHp: 304,
  category: 10,
  xp: 8800,
  ac: 24,
  attackBonus: 13,
  damage: {
    count: 8,
    sides: 6,
    bonus: 10,
    type: "fire",
    attackType: "spell",
    label: "8d6 + 10 fire",
    range: {
      kind: "ranged",
      normal: 150,
      long: 450,
      feet: 150,
    },
  },
  damageResistances: ["fire", "poison", "lightning", "necrotic", "bludgeoning", "piercing", "slashing", "radiant", "psychic"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Open the Pyre", // At the start of each round: creates an ember rift that fires at the nearest enemy unless destroyed/closed.
  ],
  initiativeBonus: 4,
  speedFeet: 20,
  behavior: "ranged",
  token: "H",
  tokenArt: "assets/tokens/heart-of-the-elemental-pyre.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "primordialSultanOfCinder", {
  name: "Primordial Sultan of Cinder",
  role: "Category 10 elemental boss",
  tags: ["elemental", "fire", "efreeti", "primordial", "boss"],
  maxHp: 610,
  category: 10,
  xp: 25000,
  ac: 24,
  attackBonus: 14,
  damage: {
    count: 8,
    sides: 8,
    bonus: 12,
    type: "fire",
    attackType: "spell",
    label: "8d8 + 12 fire",
    range: {
      kind: "ranged",
      normal: 150,
      long: 450,
      feet: 150,
    },
  },
  damageResistances: ["fire", "poison", "lightning", "necrotic", "bludgeoning", "piercing", "slashing", "radiant", "psychic"],
  damageVulnerabilities: ["cold", "thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "grappled", "restrained", "prone", "exhaustion"],
  specialAbility: [
    "Sultan's Decree of Flame", // Boss phase ability: all enemies choose to move, attack, or use an item; doing more than one triggers fire punishment that round.
    "World-Pyre Ascension", // At low HP: gains flying, increases fire aura, and summons falling cinders each round.
  ],
  initiativeBonus: 7,
  speedFeet: 40,
  behavior: "ranged",
  token: "S",
  tokenArt: "assets/tokens/primordial-sultan-of-cinder.jpg",
  flying: true,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});


})();
