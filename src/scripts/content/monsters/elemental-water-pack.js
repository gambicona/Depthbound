(() => {

/* ============================================================
 * ELEMENTAL / WATER MONSTER PACK
 * Theme: water elementals, ice, steam, mist, brine, mire, coral, pressure, tides, and deluge paraelementals.
 * Notes: Every monster starts its tags with "elemental" as requested.
 * ============================================================ */


/* ============================================================
 * CATEGORY 1 — Party Level 1/2
 * Theme: driplings, frost slicks, steam pests, and small drowned pool predators
 * ============================================================ */

window.DungeonContent.register("monsters", "dripling", {
  name: "Dripling",
  role: "Tiny water elemental nuisance",
  tags: ["elemental", "water", "small", "skirmisher"],
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
  damageResistances: ["acid", "cold", "fire"],
  damageVulnerabilities: ["lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Splash Step", // Can move through occupied spaces without provoking once per round.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "D",
  tokenArt: "assets/tokens/dripling.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "frostSlickSpriggan", {
  name: "Frost-Slick Spriggan",
  role: "Small ice slick skirmisher",
  tags: ["elemental", "water", "ice", "frost", "paraelemental"],
  maxHp: 13,
  category: 1,
  xp: 60,
  ac: 12,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 6,
    bonus: 2,
    type: "cold",
    attackType: "weapon",
    label: "1d6 + 2 cold",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["acid", "cold", "fire"],
  damageVulnerabilities: ["lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Ice Slick", // On hit: Dex save 11 or target loses 5 ft speed and cannot dash next turn.
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "melee",
  token: "F",
  tokenArt: "assets/tokens/frost-slick-spriggan.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "steamMephitling", {
  name: "Steam Mephitling",
  role: "Weak steam paraelemental caster",
  tags: ["elemental", "water", "steam", "paraelemental", "flying", "ranged"],
  maxHp: 15,
  category: 1,
  xp: 65,
  ac: 13,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 8,
    bonus: 2,
    type: "fire",
    attackType: "spell",
    label: "1d8 + 2 fire",
    range: { kind: "ranged", normal: 30, long: 90, feet: 30 },
  },
  damageResistances: ["fire", "cold"],
  damageVulnerabilities: ["lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Scalding Puff", // Small cone; Con save 11 or fire damage and -1 attack next turn.
  ],
  initiativeBonus: 2,
  speedFeet: 25,
  behavior: "rangedKiter",
  token: "S",
  tokenArt: "assets/tokens/steam-mephitling.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "drownedPoolLurker", {
  name: "Drowned-Pool Lurker",
  role: "Category 1 water boss",
  tags: ["elemental", "water", "drowned", "pool", "boss"],
  maxHp: 32,
  category: 1,
  xp: 150,
  ac: 14,
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
  damageResistances: ["acid", "cold", "fire"],
  damageVulnerabilities: ["lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Pull Under", // On hit: target pulled 5 ft and slowed.
    "Black Pool", // Creates a small difficult-terrain water patch.
  ],
  initiativeBonus: 1,
  speedFeet: 25,
  behavior: "melee",
  token: "D",
  tokenArt: "assets/tokens/drowned-pool-lurker.jpg",
  flying: false,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});


/* ============================================================
 * CATEGORY 2 — Party Level 3/4
 * Theme: brine lashes, ice shards, mist stranglers, and tidepool tyrants
 * ============================================================ */

window.DungeonContent.register("monsters", "brineLash", {
  name: "Brine Lash",
  role: "Saltwater whip striker",
  tags: ["elemental", "water", "brine", "skirmisher"],
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
    range: { kind: "melee", feet: 10 },
  },
  damageResistances: ["acid", "cold", "fire"],
  damageVulnerabilities: ["lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Salt Lash", // On hit: target cannot benefit from healing until end of next turn.
  ],
  initiativeBonus: 2,
  speedFeet: 35,
  behavior: "melee",
  token: "B",
  tokenArt: "assets/tokens/brine-lash.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "iceShardImpaler", {
  name: "Ice Shard Impaler",
  role: "Ranged ice spear elemental",
  tags: ["elemental", "water", "ice", "ranged"],
  maxHp: 24,
  category: 2,
  xp: 160,
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
  damageResistances: ["acid", "cold", "fire"],
  damageVulnerabilities: ["lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Shard Pin", // On hit: Str save 13 or speed reduced by 10 ft.
  ],
  initiativeBonus: 3,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "I",
  tokenArt: "assets/tokens/ice-shard-impaler.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "mistveilStrangler", {
  name: "Mistveil Strangler",
  role: "Misty grappling hunter",
  tags: ["elemental", "water", "mist", "paraelemental", "controller"],
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
  damageResistances: ["acid", "cold", "fire"],
  damageVulnerabilities: ["lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Mist Choke", // On hit: Con save 13 or target cannot take reactions for one round.
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "melee",
  token: "M",
  tokenArt: "assets/tokens/mistveil-strangler.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "tidepoolTyrant", {
  name: "Tidepool Tyrant",
  role: "Category 2 water boss",
  tags: ["elemental", "water", "tide", "boss", "controller"],
  maxHp: 62,
  category: 2,
  xp: 380,
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
  damageResistances: ["acid", "cold", "fire"],
  damageVulnerabilities: ["lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Tidal Pull", // 10 ft radius pull toward the boss.
    "Crushing Wave", // Cone attack; Str save 13 or pushed and damaged.
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "melee",
  token: "T",
  tokenArt: "assets/tokens/tidepool-tyrant.jpg",
  flying: false,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});


/* ============================================================
 * CATEGORY 3 — Party Level 5/6
 * Theme: river soldiers, rime hunters, boiling spray, and whitewater bosses
 * ============================================================ */

window.DungeonContent.register("monsters", "riverMyrmidon", {
  name: "River Myrmidon",
  role: "Armored current soldier",
  tags: ["elemental", "water", "river", "myrmidon"],
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
  damageResistances: ["acid", "cold", "fire"],
  damageVulnerabilities: ["lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Current Guard", // After hitting, may shift 5 ft without provoking.
  ],
  initiativeBonus: 2,
  speedFeet: 35,
  behavior: "melee",
  token: "R",
  tokenArt: "assets/tokens/river-myrmidon.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "rimefinHunter", {
  name: "Rimefin Hunter",
  role: "Fast ice-water predator",
  tags: ["elemental", "water", "ice", "hunter", "skirmisher"],
  maxHp: 52,
  category: 3,
  xp: 340,
  ac: 14,
  attackBonus: 6,
  damage: {
    count: 2,
    sides: 6,
    bonus: 4,
    type: "piercing",
    attackType: "weapon",
    label: "2d6 + 4 piercing",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["acid", "cold", "fire"],
  damageVulnerabilities: ["lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Cold Bite", // On hit: target takes 1d6 extra cold if already slowed.
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "melee",
  token: "R",
  tokenArt: "assets/tokens/rimefin-hunter.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "boilingSprayElemental", {
  name: "Boiling Spray Elemental",
  role: "Steam-water ranged burner",
  tags: ["elemental", "water", "steam", "boiling", "paraelemental", "ranged"],
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
    attackType: "spell",
    label: "2d8 + 3 fire",
    range: { kind: "ranged", normal: 60, long: 180, feet: 60 },
  },
  damageResistances: ["fire", "cold"],
  damageVulnerabilities: ["lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Boiling Spray", // Area splash; Dex save 14 or fire damage and blinded by steam for one turn.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "B",
  tokenArt: "assets/tokens/boiling-spray-elemental.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "whitewaterMatron", {
  name: "Whitewater Matron",
  role: "Category 3 water boss",
  tags: ["elemental", "water", "river", "boss", "matron"],
  maxHp: 105,
  category: 3,
  xp: 780,
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
  damageResistances: ["acid", "cold", "fire"],
  damageVulnerabilities: ["lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Whitewater Rush", // Line charge; Str save 14 or pushed 10 ft.
    "Foam Screen", // Once per fight: creates concealment around herself.
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "melee",
  token: "W",
  tokenArt: "assets/tokens/whitewater-matron.jpg",
  flying: false,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});


/* ============================================================
 * CATEGORY 4 — Party Level 7/8
 * Theme: deepcurrent crushers, snowmelt ghosts, coral guards, and brine-crowned horrors
 * ============================================================ */

window.DungeonContent.register("monsters", "deepcurrentCrusher", {
  name: "Deepcurrent Crusher",
  role: "Heavy pressure bruiser",
  tags: ["elemental", "water", "deep", "pressure", "brute"],
  maxHp: 78,
  category: 4,
  xp: 620,
  ac: 17,
  attackBonus: 7,
  damage: {
    count: 2,
    sides: 8,
    bonus: 4,
    type: "bludgeoning",
    attackType: "weapon",
    label: "2d8 + 4 bludgeoning",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["acid", "cold", "fire"],
  damageVulnerabilities: ["lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Pressure Crush", // On hit: Con save 15 or target has -1 AC until end of next turn.
  ],
  initiativeBonus: 3,
  speedFeet: 40,
  behavior: "melee",
  token: "D",
  tokenArt: "assets/tokens/deepcurrent-crusher.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "snowmeltPhantom", {
  name: "Snowmelt Phantom",
  role: "Cold mist paraelemental stalker",
  tags: ["elemental", "water", "snow", "mist", "paraelemental", "flying"],
  maxHp: 82,
  category: 4,
  xp: 640,
  ac: 16,
  attackBonus: 7,
  damage: {
    count: 2,
    sides: 8,
    bonus: 5,
    type: "cold",
    attackType: "weapon",
    label: "2d8 + 5 cold",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["acid", "cold", "fire"],
  damageVulnerabilities: ["lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Melt Away", // First time bloodied: becomes misty and moves up to 20 ft.
  ],
  initiativeBonus: 1,
  speedFeet: 35,
  behavior: "melee",
  token: "S",
  tokenArt: "assets/tokens/snowmelt-phantom.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "coralSpearSentinel", {
  name: "Coral-Spear Sentinel",
  role: "Coral-armored reach guard",
  tags: ["elemental", "water", "coral", "guardian"],
  maxHp: 90,
  category: 4,
  xp: 660,
  ac: 18,
  attackBonus: 7,
  damage: {
    count: 2,
    sides: 10,
    bonus: 4,
    type: "piercing",
    attackType: "weapon",
    label: "2d10 + 4 piercing",
    range: { kind: "melee", feet: 10 },
  },
  damageResistances: ["piercing", "cold", "fire"],
  damageVulnerabilities: ["lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Coral Snare", // On hit: target takes extra piercing if it moves before next turn.
  ],
  initiativeBonus: 1,
  speedFeet: 25,
  behavior: "melee",
  token: "C",
  tokenArt: "assets/tokens/coral-spear-sentinel.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "brineCrownedHorror", {
  name: "Brine-Crowned Horror",
  role: "Category 4 water boss",
  tags: ["elemental", "water", "brine", "boss", "horror"],
  maxHp: 150,
  category: 4,
  xp: 1450,
  ac: 18,
  attackBonus: 8,
  damage: {
    count: 3,
    sides: 6,
    bonus: 6,
    type: "necrotic",
    attackType: "weapon",
    label: "3d6 + 6 necrotic",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["acid", "cold", "necrotic"],
  damageVulnerabilities: ["lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Salt the Wound", // Targets below half HP take extra necrotic damage.
    "Crown Tide", // Aura: enemies near it cannot regain full movement.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "B",
  tokenArt: "assets/tokens/brine-crowned-horror.jpg",
  flying: false,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});


/* ============================================================
 * CATEGORY 5 — Party Level 9/10
 * Theme: glacier guardians, acidic mire, whirlpool dancers, and frost-tide leviathans
 * ============================================================ */

window.DungeonContent.register("monsters", "glacierbackGuardian", {
  name: "Glacierback Guardian",
  role: "Huge ice-backed defender",
  tags: ["elemental", "water", "ice", "glacier", "guardian"],
  maxHp: 118,
  category: 5,
  xp: 1000,
  ac: 18,
  attackBonus: 8,
  damage: {
    count: 3,
    sides: 8,
    bonus: 5,
    type: "cold",
    attackType: "weapon",
    label: "3d8 + 5 cold",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["cold", "bludgeoning", "piercing"],
  damageVulnerabilities: ["fire", "lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Glacial Guard", // Adjacent allies gain resistance to cold and +1 AC.
  ],
  initiativeBonus: 2,
  speedFeet: 40,
  behavior: "melee",
  token: "G",
  tokenArt: "assets/tokens/glacierback-guardian.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "acidicMireParaelemental", {
  name: "Acidic Mire Paraelemental",
  role: "Water-earth acid mire monster",
  tags: ["elemental", "water", "mire", "acid", "paraelemental"],
  maxHp: 105,
  category: 5,
  xp: 1030,
  ac: 17,
  attackBonus: 8,
  damage: {
    count: 3,
    sides: 6,
    bonus: 6,
    type: "acid",
    attackType: "weapon",
    label: "3d6 + 6 acid",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["acid", "cold", "fire"],
  damageVulnerabilities: ["lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Mire Acid", // Creates acid difficult terrain where it hits.
  ],
  initiativeBonus: 4,
  speedFeet: 35,
  behavior: "melee",
  token: "A",
  tokenArt: "assets/tokens/acidic-mire-paraelemental.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "whirlpoolDancer", {
  name: "Whirlpool Dancer",
  role: "Fast rotating water duelist",
  tags: ["elemental", "water", "whirlpool", "skirmisher"],
  maxHp: 125,
  category: 5,
  xp: 1060,
  ac: 18,
  attackBonus: 8,
  damage: {
    count: 3,
    sides: 10,
    bonus: 5,
    type: "slashing",
    attackType: "weapon",
    label: "3d10 + 5 slashing",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["acid", "cold", "fire"],
  damageVulnerabilities: ["lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Whirlpool Step", // Can circle around target; on hit pulls target 5 ft.
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "melee",
  token: "W",
  tokenArt: "assets/tokens/whirlpool-dancer.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "frostTideLeviathan", {
  name: "Frost-Tide Leviathan",
  role: "Category 5 water boss",
  tags: ["elemental", "water", "ice", "tide", "boss", "leviathan"],
  maxHp: 205,
  category: 5,
  xp: 2650,
  ac: 19,
  attackBonus: 9,
  damage: {
    count: 3,
    sides: 10,
    bonus: 7,
    type: "cold",
    attackType: "weapon",
    label: "3d10 + 7 cold",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["acid", "cold", "fire"],
  damageVulnerabilities: ["lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Frozen Undertow", // Area pull plus cold damage.
    "Leviathan Roll", // Huge body slam; Dex save 16 or prone.
  ],
  initiativeBonus: 2,
  speedFeet: 35,
  behavior: "melee",
  token: "F",
  tokenArt: "assets/tokens/frost-tide-leviathan.jpg",
  flying: false,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});


/* ============================================================
 * CATEGORY 6 — Party Level 11/12
 * Theme: blackwater giants, steamstorm oracles, iceberg breakers, and abyssal regents
 * ============================================================ */

window.DungeonContent.register("monsters", "blackwaterColossus", {
  name: "Blackwater Colossus",
  role: "Toxic deep-water giant",
  tags: ["elemental", "water", "blackwater", "colossus", "poison"],
  maxHp: 155,
  category: 6,
  xp: 1800,
  ac: 19,
  attackBonus: 9,
  damage: {
    count: 4,
    sides: 8,
    bonus: 5,
    type: "poison",
    attackType: "weapon",
    label: "4d8 + 5 poison",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["acid", "cold", "necrotic"],
  damageVulnerabilities: ["lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Blackwater Seep", // Adjacent enemies take 1d6 poison at start of turn.
  ],
  initiativeBonus: 1,
  speedFeet: 35,
  behavior: "melee",
  token: "B",
  tokenArt: "assets/tokens/blackwater-colossus.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "steamstormOracle", {
  name: "Steamstorm Oracle",
  role: "Steam and rain spellcaster",
  tags: ["elemental", "water", "steam", "storm", "caster", "ranged"],
  maxHp: 135,
  category: 6,
  xp: 1840,
  ac: 18,
  attackBonus: 9,
  damage: {
    count: 4,
    sides: 6,
    bonus: 7,
    type: "lightning",
    attackType: "spell",
    label: "4d6 + 7 lightning",
    range: { kind: "ranged", normal: 60, long: 180, feet: 60 },
  },
  damageResistances: ["fire", "cold", "lightning"],
  damageVulnerabilities: [],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Storm Reading", // Once per fight: imposes disadvantage/reduced hit on one incoming attack.
  ],
  initiativeBonus: 3,
  speedFeet: 40,
  behavior: "rangedKiter",
  token: "S",
  tokenArt: "assets/tokens/steamstorm-oracle.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "icebergBreaker", {
  name: "Iceberg Breaker",
  role: "Massive ice impact brute",
  tags: ["elemental", "water", "ice", "iceberg", "brute"],
  maxHp: 165,
  category: 6,
  xp: 1880,
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
  damageResistances: ["cold", "bludgeoning", "piercing"],
  damageVulnerabilities: ["fire", "lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Iceberg Break", // Cone of ice chunks; Dex save 17 or cold/piercing and slowed.
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "melee",
  token: "I",
  tokenArt: "assets/tokens/iceberg-breaker.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "pearlEyedAbyssalRegent", {
  name: "Pearl-Eyed Abyssal Regent",
  role: "Category 6 water boss",
  tags: ["elemental", "water", "deep", "abyssal", "boss", "regent"],
  maxHp: 260,
  category: 6,
  xp: 4650,
  ac: 20,
  attackBonus: 10,
  damage: {
    count: 5,
    sides: 6,
    bonus: 8,
    type: "psychic",
    attackType: "spell",
    label: "5d6 + 8 psychic",
    range: { kind: "ranged", normal: 60, long: 180, feet: 60 },
  },
  damageResistances: ["acid", "cold", "fire"],
  damageVulnerabilities: ["lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Pearl Command", // Charm/frighten-style save; target wastes movement toward water.
    "Crushing Deep", // 20 ft radius pressure pulse; Con save 17 or heavy damage.
  ],
  initiativeBonus: 2,
  speedFeet: 35,
  behavior: "rangedKiter",
  token: "P",
  tokenArt: "assets/tokens/pearl-eyed-abyssal-regent.jpg",
  flying: false,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});


/* ============================================================
 * CATEGORY 7 — Party Level 13/14
 * Theme: tsunami heralds, blood-brine ravagers, hailglass flyers, and maelstrom barons
 * ============================================================ */

window.DungeonContent.register("monsters", "tsunamiHerald", {
  name: "Tsunami Herald",
  role: "Walking wall of water",
  tags: ["elemental", "water", "tsunami", "herald"],
  maxHp: 195,
  category: 7,
  xp: 2850,
  ac: 20,
  attackBonus: 10,
  damage: {
    count: 4,
    sides: 10,
    bonus: 7,
    type: "bludgeoning",
    attackType: "weapon",
    label: "4d10 + 7 bludgeoning",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["acid", "cold", "fire"],
  damageVulnerabilities: ["lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Tsunami Front", // Line attack; Str save 18 or pushed 20 ft and prone.
  ],
  initiativeBonus: 2,
  speedFeet: 40,
  behavior: "melee",
  token: "T",
  tokenArt: "assets/tokens/tsunami-herald.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "bloodBrineRavager", {
  name: "Blood-Brine Ravager",
  role: "Red saltwater berserker",
  tags: ["elemental", "water", "brine", "blood", "ravager"],
  maxHp: 185,
  category: 7,
  xp: 2950,
  ac: 19,
  attackBonus: 10,
  damage: {
    count: 5,
    sides: 6,
    bonus: 7,
    type: "necrotic",
    attackType: "weapon",
    label: "5d6 + 7 necrotic",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["cold", "necrotic", "acid"],
  damageVulnerabilities: ["lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Blood in the Water", // Advantage/bonus damage against bloodied targets.
  ],
  initiativeBonus: 2,
  speedFeet: 40,
  behavior: "melee",
  token: "B",
  tokenArt: "assets/tokens/blood-brine-ravager.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "hailglassHarrier", {
  name: "Hailglass Harrier",
  role: "Flying ice-glass paraelemental",
  tags: ["elemental", "water", "hail", "glass", "paraelemental", "flying", "ranged"],
  maxHp: 190,
  category: 7,
  xp: 3050,
  ac: 20,
  attackBonus: 10,
  damage: {
    count: 4,
    sides: 8,
    bonus: 8,
    type: "piercing",
    attackType: "weapon",
    label: "4d8 + 8 piercing",
    range: { kind: "ranged", normal: 60, long: 180, feet: 60 },
  },
  damageResistances: ["cold", "piercing"],
  damageVulnerabilities: ["fire", "lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Hailglass Volley", // Multi-target ranged spray; Dex save 18 or piercing/cold damage.
  ],
  initiativeBonus: 3,
  speedFeet: 40,
  behavior: "rangedKiter",
  token: "H",
  tokenArt: "assets/tokens/hailglass-harrier.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "maelstromBaron", {
  name: "Maelstrom Baron",
  role: "Category 7 water boss",
  tags: ["elemental", "water", "maelstrom", "boss", "baron"],
  maxHp: 315,
  category: 7,
  xp: 7300,
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
  damageResistances: ["acid", "cold", "fire"],
  damageVulnerabilities: ["lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Maelstrom Aura", // Creatures starting nearby are pulled 5 ft.
    "Baronial Undertow", // Large vortex; Str save 18 or restrained until end of next turn.
  ],
  initiativeBonus: 3,
  speedFeet: 40,
  behavior: "melee",
  token: "M",
  tokenArt: "assets/tokens/maelstrom-baron.jpg",
  flying: false,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});


/* ============================================================
 * CATEGORY 8 — Party Level 15/16
 * Theme: living glaciers, drowning mist, coral cathedrals, and queens of the crushing deep
 * ============================================================ */

window.DungeonContent.register("monsters", "livingGlacier", {
  name: "Living Glacier",
  role: "Slow catastrophic ice mass",
  tags: ["elemental", "water", "ice", "glacier", "colossus"],
  maxHp: 235,
  category: 8,
  xp: 3950,
  ac: 21,
  attackBonus: 11,
  damage: {
    count: 5,
    sides: 10,
    bonus: 8,
    type: "cold",
    attackType: "weapon",
    label: "5d10 + 8 cold",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["cold", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["fire", "lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Glacial Advance", // Squares it leaves become ice slicks.
  ],
  initiativeBonus: 2,
  speedFeet: 40,
  behavior: "melee",
  token: "L",
  tokenArt: "assets/tokens/living-glacier.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "drowningMistArchon", {
  name: "Drowning Mist Archon",
  role: "High mist-controller elemental",
  tags: ["elemental", "water", "mist", "archon", "controller", "flying"],
  maxHp: 220,
  category: 8,
  xp: 4050,
  ac: 20,
  attackBonus: 11,
  damage: {
    count: 5,
    sides: 8,
    bonus: 8,
    type: "cold",
    attackType: "spell",
    label: "5d8 + 8 cold",
    range: { kind: "ranged", normal: 60, long: 180, feet: 60 },
  },
  damageResistances: ["acid", "cold", "fire"],
  damageVulnerabilities: ["lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Drowning Mist", // Cloud zone; enemies inside have reduced sight and take cold damage.
  ],
  initiativeBonus: 3,
  speedFeet: 45,
  behavior: "rangedKiter",
  token: "D",
  tokenArt: "assets/tokens/drowning-mist-archon.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "coralCathedralBeast", {
  name: "Coral Cathedral Beast",
  role: "Massive living coral temple",
  tags: ["elemental", "water", "coral", "cathedral", "beast"],
  maxHp: 250,
  category: 8,
  xp: 4150,
  ac: 22,
  attackBonus: 11,
  damage: {
    count: 4,
    sides: 12,
    bonus: 9,
    type: "piercing",
    attackType: "weapon",
    label: "4d12 + 9 piercing",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["piercing", "cold", "radiant"],
  damageVulnerabilities: ["lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Coral Growth", // Creates blocking coral terrain or restrains a target.
  ],
  initiativeBonus: 1,
  speedFeet: 35,
  behavior: "melee",
  token: "C",
  tokenArt: "assets/tokens/coral-cathedral-beast.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "queenOfTheCrushingDeep", {
  name: "Queen of the Crushing Deep",
  role: "Category 8 water boss",
  tags: ["elemental", "water", "deep", "boss", "queen"],
  maxHp: 385,
  category: 8,
  xp: 9200,
  ac: 22,
  attackBonus: 12,
  damage: {
    count: 6,
    sides: 8,
    bonus: 10,
    type: "cold",
    attackType: "weapon",
    label: "6d8 + 10 cold",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["acid", "cold", "fire"],
  damageVulnerabilities: ["lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Abyssal Pressure", // Aura: enemies near her have reduced movement.
    "Crush of Oceans", // Huge Con save attack; cold/bludgeoning and silence-like pressure.
  ],
  initiativeBonus: 3,
  speedFeet: 40,
  behavior: "melee",
  token: "Q",
  tokenArt: "assets/tokens/queen-of-the-crushing-deep.jpg",
  flying: false,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});


/* ============================================================
 * CATEGORY 9 — Party Level 17/18
 * Theme: ocean avatars, absolute-zero spirits, boiling worldsprings, and leviathan currents
 * ============================================================ */

window.DungeonContent.register("monsters", "oceanicAvatar", {
  name: "Oceanic Avatar",
  role: "Avatar of the open sea",
  tags: ["elemental", "water", "ocean", "avatar"],
  maxHp: 285,
  category: 9,
  xp: 5250,
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
  damageResistances: ["acid", "cold", "fire", "bludgeoning"],
  damageVulnerabilities: ["lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Open Sea Body", // Ranged weapon attacks deal reduced damage.
  ],
  initiativeBonus: 2,
  speedFeet: 45,
  behavior: "melee",
  token: "O",
  tokenArt: "assets/tokens/oceanic-avatar.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "absoluteZeroElemental", {
  name: "Absolute Zero Elemental",
  role: "Extreme cold paraelemental",
  tags: ["elemental", "water", "ice", "absolute-zero", "paraelemental"],
  maxHp: 270,
  category: 9,
  xp: 5350,
  ac: 21,
  attackBonus: 12,
  damage: {
    count: 6,
    sides: 6,
    bonus: 10,
    type: "cold",
    attackType: "weapon",
    label: "6d6 + 10 cold",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["cold", "necrotic"],
  damageVulnerabilities: ["fire", "lightning"],
  damageImmunities: ["poison", "cold"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Absolute Stillness", // On hit: Con save 20 or target cannot move next turn.
  ],
  initiativeBonus: 3,
  speedFeet: 45,
  behavior: "melee",
  token: "A",
  tokenArt: "assets/tokens/absolute-zero-elemental.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "boilingWorldspring", {
  name: "Boiling Worldspring",
  role: "Scalding world-source spirit",
  tags: ["elemental", "water", "boiling", "spring", "paraelemental", "ranged"],
  maxHp: 300,
  category: 9,
  xp: 5450,
  ac: 23,
  attackBonus: 12,
  damage: {
    count: 5,
    sides: 12,
    bonus: 10,
    type: "fire",
    attackType: "spell",
    label: "5d12 + 10 fire",
    range: { kind: "ranged", normal: 60, long: 180, feet: 60 },
  },
  damageResistances: ["fire", "cold", "radiant"],
  damageVulnerabilities: ["lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Worldspring Eruption", // Large area; Dex save 20 or fire/bludgeoning and pushed.
  ],
  initiativeBonus: 1,
  speedFeet: 35,
  behavior: "rangedKiter",
  token: "B",
  tokenArt: "assets/tokens/boiling-worldspring.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "theLeviathanCurrent", {
  name: "The Leviathan Current",
  role: "Category 9 water boss",
  tags: ["elemental", "water", "leviathan", "current", "boss"],
  maxHp: 460,
  category: 9,
  xp: 11800,
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
  damageResistances: ["acid", "cold", "fire"],
  damageVulnerabilities: ["lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Current of Kings", // Moves all creatures in the room 10 ft at initiative count.
    "Leviathan Drag", // Single target save or pulled adjacent and crushed.
  ],
  initiativeBonus: 3,
  speedFeet: 45,
  behavior: "melee",
  token: "T",
  tokenArt: "assets/tokens/the-leviathan-current.jpg",
  flying: false,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});


/* ============================================================
 * CATEGORY 10 — Party Level 19/20
 * Theme: primordial sea, polar night colossi, cloudburst world-eaters, and endless deluge sovereigns
 * ============================================================ */

window.DungeonContent.register("monsters", "primordialSea", {
  name: "Primordial Sea",
  role: "Ancient sea incarnation",
  tags: ["elemental", "water", "primordial", "sea", "avatar"],
  maxHp: 360,
  category: 10,
  xp: 8600,
  ac: 23,
  attackBonus: 14,
  damage: {
    count: 7,
    sides: 8,
    bonus: 11,
    type: "cold",
    attackType: "weapon",
    label: "7d8 + 11 cold",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["acid", "cold", "fire", "bludgeoning", "piercing"],
  damageVulnerabilities: ["lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Endless Body", // Regenerates if standing in water or mist.
  ],
  initiativeBonus: 3,
  speedFeet: 45,
  behavior: "melee",
  token: "P",
  tokenArt: "assets/tokens/primordial-sea.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "polarNightColossus", {
  name: "Polar Night Colossus",
  role: "Dark arctic colossus",
  tags: ["elemental", "water", "ice", "polar", "night", "colossus"],
  maxHp: 340,
  category: 10,
  xp: 8800,
  ac: 23,
  attackBonus: 14,
  damage: {
    count: 7,
    sides: 6,
    bonus: 12,
    type: "cold",
    attackType: "weapon",
    label: "7d6 + 12 cold",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["cold", "necrotic", "bludgeoning"],
  damageVulnerabilities: ["fire", "lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Polar Night", // Dim aura; enemies have reduced accuracy at range.
  ],
  initiativeBonus: 4,
  speedFeet: 50,
  behavior: "melee",
  token: "P",
  tokenArt: "assets/tokens/polar-night-colossus.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "cloudburstWorldEater", {
  name: "Cloudburst World-Eater",
  role: "Water-air deluge catastrophe",
  tags: ["elemental", "water", "rain", "storm", "paraelemental", "flying"],
  maxHp: 380,
  category: 10,
  xp: 9000,
  ac: 24,
  attackBonus: 14,
  damage: {
    count: 8,
    sides: 6,
    bonus: 11,
    type: "lightning",
    attackType: "spell",
    label: "8d6 + 11 lightning",
    range: { kind: "ranged", normal: 60, long: 180, feet: 60 },
  },
  damageResistances: ["cold", "lightning", "thunder"],
  damageVulnerabilities: [],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Cloudburst Devour", // Massive rain zone; lightning hits wet/slowed targets harder.
  ],
  initiativeBonus: 2,
  speedFeet: 40,
  behavior: "rangedKiter",
  token: "C",
  tokenArt: "assets/tokens/cloudburst-world-eater.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "sovereignOfTheEndlessDeluge", {
  name: "Sovereign of the Endless Deluge",
  role: "Category 10 water boss",
  tags: ["elemental", "water", "deluge", "boss", "sovereign"],
  maxHp: 620,
  category: 10,
  xp: 25000,
  ac: 24,
  attackBonus: 15,
  damage: {
    count: 8,
    sides: 8,
    bonus: 13,
    type: "cold",
    attackType: "weapon",
    label: "8d8 + 13 cold",
    range: { kind: "melee", feet: 5 },
  },
  damageResistances: ["acid", "cold", "fire"],
  damageVulnerabilities: ["lightning"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Endless Deluge", // Floods parts of the battlefield each round.
    "Drown the World", // Ultimate area attack; Str/Con save 22 or huge cold/bludgeoning and restrained.
  ],
  initiativeBonus: 4,
  speedFeet: 50,
  behavior: "melee",
  token: "S",
  tokenArt: "assets/tokens/sovereign-of-the-endless-deluge.jpg",
  flying: false,
  extraLoot: [
    { kind: "randomEquipment" },
  ],
});

})();
