(() => {

/* ============================================================
 * GHOST UNDEAD PACK
 * Theme: incorporeal undead, haunted echoes, wraiths, banshees,
 *        poltergeists, soulfire, grave-mist, and high-tier phantoms.
 * Notes: Most ghosts fly, resist physical damage, hate radiant damage,
 *        and use fear, movement, draining, or battlefield displacement.
 * ============================================================ */

/* ============================================================
 * CATEGORY 1 — Party Level 1/2
 * Theme: weak shades, minor apparitions, early haunted-room enemies
 * ============================================================ */

window.DungeonContent.register("monsters", "whisperingShade", {
  name: "Whispering Shade",
  role: "Weak flying ghost skirmisher",
  tags: ["undead", "ghost", "shade", "flying"],
  maxHp: 10,
  category: 1,
  xp: 55,
  ac: 13,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 6,
    bonus: 2,
    type: "necrotic",
    attackType: "spell",
    label: "1d6 + 2 necrotic",
    range: { kind: "melee", feet: 5 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained"],
  specialAbility: [
    "Dread Whisper", // On hit: Wis save against 11, target has -1 attack penalty until the end of its next turn if save unsuccessful.
  ],
  initiativeBonus: 3,
  speedFeet: 30,
  behavior: "melee",
  token: "S",
  tokenArt: "assets/tokens/whispering-shade.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "candleflameWisp", {
  name: "Candleflame Wisp",
  role: "Small soul-light ranged kiter",
  tags: ["undead", "ghost", "wisp", "flying", "caster"],
  maxHp: 9,
  category: 1,
  xp: 60,
  ac: 14,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 6,
    bonus: 2,
    type: "cold",
    attackType: "spell",
    label: "1d6 + 2 cold",
    range: { kind: "ranged", normal: 50, long: 150, feet: 50 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "cold", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained"],
  specialAbility: [
    "False Lantern", // Once per fight: creates a ghost-light lure; target makes Wis save against 11 or moves 5 ft toward the wisp on its next turn.
  ],
  initiativeBonus: 4,
  speedFeet: 35,
  behavior: "rangedKiter",
  token: "W",
  tokenArt: "assets/tokens/candleflame-wisp.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "mourningApparition", {
  name: "Mourning Apparition",
  role: "Fragile fear ghost",
  tags: ["undead", "ghost", "apparition", "flying"],
  maxHp: 12,
  category: 1,
  xp: 65,
  ac: 12,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 8,
    bonus: 1,
    type: "necrotic",
    attackType: "spell",
    label: "1d8 + 1 necrotic",
    range: { kind: "melee", feet: 5 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "cold", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained"],
  specialAbility: [
    "Mournful Cry", // 10 ft radius circle, Wis save against 11, frightened until the end of target's next turn if save unsuccessful.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "A",
  tokenArt: "assets/tokens/mourning-apparition.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "graveLanternSpecter", {
  name: "Grave-Lantern Specter",
  role: "Category 1 ghost boss",
  tags: ["undead", "ghost", "specter", "boss", "flying", "caster"],
  maxHp: 30,
  category: 1,
  xp: 150,
  ac: 14,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 10,
    bonus: 3,
    type: "necrotic",
    attackType: "spell",
    label: "1d10 + 3 necrotic",
    range: { kind: "ranged", normal: 60, long: 180, feet: 60 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "cold", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained"],
  specialAbility: [
    "Soul Lantern", // Once per fight: 15 ft radius circle, Wis save against 12, 2d6 necrotic damage and -10 ft speed if save unsuccessful, half damage and no slow if successful.
    "Fading Retreat", // When first bloodied: teleport up to 20 ft to a visible empty cell.
  ],
  initiativeBonus: 4,
  speedFeet: 35,
  behavior: "rangedKiter",
  token: "L",
  tokenArt: "assets/tokens/grave-lantern-specter.jpg",
  flying: true,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});


/* ============================================================
 * CATEGORY 2 — Party Level 3/4
 * Theme: poltergeists, chain spirits, stronger haunted-house enemies
 * ============================================================ */

window.DungeonContent.register("monsters", "chillingPoltergeist", {
  name: "Chilling Poltergeist",
  role: "Telekinetic object thrower",
  tags: ["undead", "ghost", "poltergeist", "flying", "caster"],
  maxHp: 24,
  category: 2,
  xp: 150,
  ac: 15,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 8,
    bonus: 3,
    type: "bludgeoning",
    attackType: "spell",
    label: "1d8 + 3 bludgeoning",
    range: { kind: "ranged", normal: 60, long: 180, feet: 60 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "cold", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained"],
  specialAbility: [
    "Hurl Debris", // 10 ft radius circle, Dex save against 13, 2d6 bludgeoning damage if save unsuccessful, half if successful.
  ],
  initiativeBonus: 4,
  speedFeet: 35,
  behavior: "rangedKiter",
  token: "P",
  tokenArt: "assets/tokens/chilling-poltergeist.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "hollowWailSpirit", {
  name: "Hollow-Wail Spirit",
  role: "Fear-based ghost caster",
  tags: ["undead", "ghost", "spirit", "flying", "caster"],
  maxHp: 22,
  category: 2,
  xp: 160,
  ac: 14,
  attackBonus: 6,
  damage: {
    count: 1,
    sides: 10,
    bonus: 3,
    type: "psychic",
    attackType: "spell",
    label: "1d10 + 3 psychic",
    range: { kind: "ranged", normal: 70, long: 210, feet: 70 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "cold", "necrotic", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained"],
  specialAbility: [
    "Hollow Wail", // 15 ft cone, Wis save against 13, 2d8 psychic damage and frightened until end of next turn if save unsuccessful, half damage and no fear if successful.
  ],
  initiativeBonus: 3,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "H",
  tokenArt: "assets/tokens/hollow-wail-spirit.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "chainboundPhantom", {
  name: "Chainbound Phantom",
  role: "Melee ghost controller",
  tags: ["undead", "ghost", "phantom", "chain", "flying"],
  maxHp: 28,
  category: 2,
  xp: 175,
  ac: 14,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 10,
    bonus: 3,
    type: "necrotic",
    attackType: "spell",
    label: "1d10 + 3 necrotic",
    range: { kind: "melee", feet: 10 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "cold", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained"],
  specialAbility: [
    "Spectral Chain", // On hit: Str save against 13, pull target 5 ft toward the phantom if save unsuccessful.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "C",
  tokenArt: "assets/tokens/chainbound-phantom.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "wraithOfTheLockedDoor", {
  name: "Wraith of the Locked Door",
  role: "Category 2 ghost boss",
  tags: ["undead", "ghost", "wraith", "boss", "flying"],
  maxHp: 48,
  category: 2,
  xp: 320,
  ac: 15,
  attackBonus: 6,
  damage: {
    count: 1,
    sides: 10,
    bonus: 4,
    type: "necrotic",
    attackType: "spell",
    label: "1d10 + 4 necrotic",
    range: { kind: "melee", feet: 5 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "cold", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained"],
  specialAbility: [
    "Life Drain", // On hit: Con save against 13, target takes +1d8 necrotic and loses 5 ft speed until end of next turn if save unsuccessful.
    "Locked Passage", // Once per fight: creates a 10 ft spectral wall/door that blocks movement but not line of sight for 1 round.
  ],
  initiativeBonus: 4,
  speedFeet: 35,
  behavior: "melee",
  token: "D",
  tokenArt: "assets/tokens/wraith-of-the-locked-door.jpg",
  flying: true,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});


/* ============================================================
 * CATEGORY 3 — Party Level 5/6
 * Theme: banshees, will-o-wisps, duelist spirits
 * ============================================================ */

window.DungeonContent.register("monsters", "corpseLightWillOWisp", {
  name: "Corpse-Light Will-o'-Wisp",
  role: "Fast evasive ranged ghost",
  tags: ["undead", "ghost", "wisp", "flying", "caster"],
  maxHp: 34,
  category: 3,
  xp: 260,
  ac: 17,
  attackBonus: 7,
  damage: {
    count: 1,
    sides: 10,
    bonus: 4,
    type: "lightning",
    attackType: "spell",
    label: "1d10 + 4 lightning",
    range: { kind: "ranged", normal: 80, long: 240, feet: 80 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "cold", "necrotic", "lightning"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained"],
  specialAbility: [
    "Flicker Step", // After attacking: may move 10 ft without provoking opportunity attacks.
  ],
  initiativeBonus: 6,
  speedFeet: 45,
  behavior: "rangedKiter",
  token: "I",
  tokenArt: "assets/tokens/corpse-light-will-o-wisp.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "graveMistBanshee", {
  name: "Grave-Mist Banshee",
  role: "Area fear and psychic damage caster",
  tags: ["undead", "ghost", "banshee", "flying", "caster"],
  maxHp: 40,
  category: 3,
  xp: 300,
  ac: 15,
  attackBonus: 7,
  damage: {
    count: 2,
    sides: 6,
    bonus: 4,
    type: "psychic",
    attackType: "spell",
    label: "2d6 + 4 psychic",
    range: { kind: "ranged", normal: 70, long: 210, feet: 70 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "cold", "necrotic", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained"],
  specialAbility: [
    "Banshee Keening", // 20 ft cone, Wis save against 14, 3d8 psychic damage and frightened if save unsuccessful, half damage and no fear if successful.
  ],
  initiativeBonus: 4,
  speedFeet: 35,
  behavior: "rangedKiter",
  token: "B",
  tokenArt: "assets/tokens/grave-mist-banshee.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "spectralDuelist", {
  name: "Spectral Duelist",
  role: "Precise melee ghost striker",
  tags: ["undead", "ghost", "duelist", "flying"],
  maxHp: 44,
  category: 3,
  xp: 310,
  ac: 16,
  attackBonus: 8,
  damage: {
    count: 1,
    sides: 12,
    bonus: 5,
    type: "force",
    attackType: "spell",
    label: "1d12 + 5 force",
    range: { kind: "melee", feet: 5 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "cold", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained"],
  specialAbility: [
    "Parrying Fade", // First time hit each round: reduce incoming weapon damage by 1d6.
  ],
  initiativeBonus: 5,
  speedFeet: 40,
  behavior: "melee",
  token: "E",
  tokenArt: "assets/tokens/spectral-duelist.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "widowOfTheWhiteBell", {
  name: "Widow of the White Bell",
  role: "Category 3 ghost boss",
  tags: ["undead", "ghost", "banshee", "boss", "flying", "caster"],
  maxHp: 74,
  category: 3,
  xp: 520,
  ac: 16,
  attackBonus: 8,
  damage: {
    count: 2,
    sides: 6,
    bonus: 5,
    type: "psychic",
    attackType: "spell",
    label: "2d6 + 5 psychic",
    range: { kind: "ranged", normal: 80, long: 240, feet: 80 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "cold", "necrotic", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained", "charmed"],
  specialAbility: [
    "White Bell Wail", // 20 ft radius circle, Con save against 15, 4d8 psychic damage and stunned until end of next turn if save unsuccessful, half damage and no stun if successful.
    "Grief Pulse", // Once per fight when bloodied: all enemies within 15 ft make Wis save against 15 or become frightened for 1 round.
  ],
  initiativeBonus: 5,
  speedFeet: 40,
  behavior: "rangedKiter",
  token: "W",
  tokenArt: "assets/tokens/widow-of-the-white-bell.jpg",
  flying: true,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});


/* ============================================================
 * CATEGORY 4 — Party Level 7/8
 * Theme: possession spirits, phantom knights, haunted armor echoes
 * ============================================================ */

window.DungeonContent.register("monsters", "possessingRemnant", {
  name: "Possessing Remnant",
  role: "Control-oriented ghost",
  tags: ["undead", "ghost", "possession", "flying", "caster"],
  maxHp: 58,
  category: 4,
  xp: 520,
  ac: 16,
  attackBonus: 8,
  damage: {
    count: 2,
    sides: 6,
    bonus: 5,
    type: "necrotic",
    attackType: "spell",
    label: "2d6 + 5 necrotic",
    range: { kind: "ranged", normal: 70, long: 210, feet: 70 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "cold", "fire", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained", "charmed"],
  specialAbility: [
    "Lesser Possession", // Once per fight: Wis save against 15, target loses its reaction and moves 10 ft in a chosen direction if save unsuccessful.
  ],
  initiativeBonus: 5,
  speedFeet: 40,
  behavior: "rangedKiter",
  token: "R",
  tokenArt: "assets/tokens/possessing-remnant.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "phantomKnight", {
  name: "Phantom Knight",
  role: "Durable spectral melee guard",
  tags: ["undead", "ghost", "knight", "flying"],
  maxHp: 66,
  category: 4,
  xp: 600,
  ac: 18,
  attackBonus: 9,
  damage: {
    count: 2,
    sides: 8,
    bonus: 5,
    type: "force",
    attackType: "spell",
    label: "2d8 + 5 force",
    range: { kind: "melee", feet: 5 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "cold", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained", "frightened"],
  specialAbility: [
    "Ghostly Riposte", // Once per round when missed by a melee attack: counterattack for half normal damage.
  ],
  initiativeBonus: 4,
  speedFeet: 35,
  behavior: "melee",
  token: "K",
  tokenArt: "assets/tokens/phantom-knight.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "mirrorHallHaunt", {
  name: "Mirror-Hall Haunt",
  role: "Illusory evasive ghost",
  tags: ["undead", "ghost", "haunt", "illusion", "flying", "caster"],
  maxHp: 54,
  category: 4,
  xp: 610,
  ac: 17,
  attackBonus: 9,
  damage: {
    count: 2,
    sides: 6,
    bonus: 6,
    type: "psychic",
    attackType: "spell",
    label: "2d6 + 6 psychic",
    range: { kind: "ranged", normal: 90, long: 270, feet: 90 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "cold", "necrotic", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained", "charmed"],
  specialAbility: [
    "Mirror Double", // Once per fight: next attack against this monster has disadvantage or automatically misses on a low roll.
  ],
  initiativeBonus: 6,
  speedFeet: 45,
  behavior: "rangedKiter",
  token: "M",
  tokenArt: "assets/tokens/mirror-hall-haunt.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "mourningDukeEidolon", {
  name: "Mourning Duke Eidolon",
  role: "Category 4 ghost boss",
  tags: ["undead", "ghost", "eidolon", "noble", "boss", "flying"],
  maxHp: 104,
  category: 4,
  xp: 950,
  ac: 18,
  attackBonus: 9,
  damage: {
    count: 2,
    sides: 8,
    bonus: 6,
    type: "necrotic",
    attackType: "spell",
    label: "2d8 + 6 necrotic",
    range: { kind: "melee", feet: 10 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "cold", "fire", "necrotic", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained", "charmed", "frightened"],
  specialAbility: [
    "Command the Dead", // Once per fight: summon or empower one lesser ghost ally; if summons are not implemented, grants nearby undead +1 attack for 1 round.
    "Noble Possession", // Wis save against 16, target cannot attack the duke until end of next turn if save unsuccessful.
  ],
  initiativeBonus: 5,
  speedFeet: 40,
  behavior: "melee",
  token: "D",
  tokenArt: "assets/tokens/mourning-duke-eidolon.jpg",
  flying: true,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});


/* ============================================================
 * CATEGORY 5 — Party Level 9/10
 * Theme: greater wraiths, death choirs, soul-drinking phantoms
 * ============================================================ */

window.DungeonContent.register("monsters", "greaterWraith", {
  name: "Greater Wraith",
  role: "Life-draining melee striker",
  tags: ["undead", "ghost", "wraith", "flying"],
  maxHp: 82,
  category: 5,
  xp: 850,
  ac: 18,
  attackBonus: 10,
  damage: {
    count: 2,
    sides: 10,
    bonus: 5,
    type: "necrotic",
    attackType: "spell",
    label: "2d10 + 5 necrotic",
    range: { kind: "melee", feet: 5 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "acid", "cold", "fire", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained", "charmed", "frightened"],
  specialAbility: [
    "Greater Life Drain", // On hit: Con save against 16, target takes +2d8 necrotic and healing received is reduced until end of next turn if save unsuccessful.
  ],
  initiativeBonus: 6,
  speedFeet: 45,
  behavior: "melee",
  token: "W",
  tokenArt: "assets/tokens/greater-wraith.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "deathChoirBanshee", {
  name: "Death-Choir Banshee",
  role: "High-damage cone caster",
  tags: ["undead", "ghost", "banshee", "choir", "flying", "caster"],
  maxHp: 76,
  category: 5,
  xp: 900,
  ac: 17,
  attackBonus: 10,
  damage: {
    count: 3,
    sides: 6,
    bonus: 5,
    type: "psychic",
    attackType: "spell",
    label: "3d6 + 5 psychic",
    range: { kind: "ranged", normal: 90, long: 270, feet: 90 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "cold", "necrotic", "psychic", "thunder"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained", "charmed"],
  specialAbility: [
    "Death Choir", // 30 ft cone, Wis save against 16, 5d8 psychic damage and frightened if save unsuccessful, half damage and no fear if successful.
  ],
  initiativeBonus: 5,
  speedFeet: 40,
  behavior: "rangedKiter",
  token: "C",
  tokenArt: "assets/tokens/death-choir-banshee.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "soulDrinkerPhantom", {
  name: "Soul-Drinker Phantom",
  role: "Sustaining ghost bruiser",
  tags: ["undead", "ghost", "phantom", "flying"],
  maxHp: 90,
  category: 5,
  xp: 980,
  ac: 17,
  attackBonus: 10,
  damage: {
    count: 2,
    sides: 8,
    bonus: 6,
    type: "necrotic",
    attackType: "spell",
    label: "2d8 + 6 necrotic",
    range: { kind: "melee", feet: 5 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "cold", "fire", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained", "frightened"],
  specialAbility: [
    "Soul Siphon", // When this monster deals necrotic damage, it heals for half the damage dealt once per round.
  ],
  initiativeBonus: 5,
  speedFeet: 40,
  behavior: "melee",
  token: "S",
  tokenArt: "assets/tokens/soul-drinker-phantom.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "barrowQueenInWhite", {
  name: "Barrow Queen in White",
  role: "Category 5 ghost boss",
  tags: ["undead", "ghost", "queen", "boss", "flying", "caster"],
  maxHp: 138,
  category: 5,
  xp: 1400,
  ac: 19,
  attackBonus: 11,
  damage: {
    count: 3,
    sides: 6,
    bonus: 6,
    type: "cold",
    attackType: "spell",
    label: "3d6 + 6 cold",
    range: { kind: "ranged", normal: 100, long: 300, feet: 100 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "cold", "fire", "necrotic", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained", "charmed", "frightened"],
  specialAbility: [
    "Royal Wail", // 30 ft radius circle, Con save against 17, 6d8 cold/psychic damage if save unsuccessful, half if successful.
    "White Veil", // Once per fight: becomes heavily obscured/untargetable until the start of her next turn unless hit by radiant damage.
  ],
  initiativeBonus: 6,
  speedFeet: 45,
  behavior: "rangedKiter",
  token: "Q",
  tokenArt: "assets/tokens/barrow-queen-in-white.jpg",
  flying: true,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});


/* ============================================================
 * CATEGORY 6 — Party Level 11/12
 * Theme: allips, memory eaters, dread riders, spirit storms
 * ============================================================ */

window.DungeonContent.register("monsters", "allipOfForbiddenNames", {
  name: "Allip of Forbidden Names",
  role: "Psychic knowledge-curse caster",
  tags: ["undead", "ghost", "allip", "flying", "caster"],
  maxHp: 105,
  category: 6,
  xp: 1250,
  ac: 18,
  attackBonus: 11,
  damage: {
    count: 3,
    sides: 6,
    bonus: 6,
    type: "psychic",
    attackType: "spell",
    label: "3d6 + 6 psychic",
    range: { kind: "ranged", normal: 100, long: 300, feet: 100 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "cold", "fire", "necrotic", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained", "charmed", "frightened"],
  specialAbility: [
    "Maddening Secret", // 20 ft radius circle, Int save against 17, 5d6 psychic damage and disadvantage on next attack if save unsuccessful, half damage if successful.
  ],
  initiativeBonus: 7,
  speedFeet: 45,
  behavior: "rangedKiter",
  token: "A",
  tokenArt: "assets/tokens/allip-of-forbidden-names.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "dreadCavalierGhost", {
  name: "Dread Cavalier Ghost",
  role: "Charging spectral knight",
  tags: ["undead", "ghost", "cavalier", "knight", "flying"],
  maxHp: 118,
  category: 6,
  xp: 1400,
  ac: 19,
  attackBonus: 11,
  damage: {
    count: 2,
    sides: 10,
    bonus: 7,
    type: "force",
    attackType: "spell",
    label: "2d10 + 7 force",
    range: { kind: "melee", feet: 10 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "cold", "fire", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained", "frightened"],
  specialAbility: [
    "Spectral Charge", // If it moves at least 20 ft before attacking, hit deals +2d8 force and pushes target 10 ft on failed Str save against 17.
  ],
  initiativeBonus: 6,
  speedFeet: 55,
  behavior: "melee",
  token: "V",
  tokenArt: "assets/tokens/dread-cavalier-ghost.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "graveStormApparition", {
  name: "Grave-Storm Apparition",
  role: "Lightning and thunder area ghost",
  tags: ["undead", "ghost", "storm", "flying", "caster"],
  maxHp: 110,
  category: 6,
  xp: 1450,
  ac: 18,
  attackBonus: 11,
  damage: {
    count: 3,
    sides: 6,
    bonus: 7,
    type: "lightning",
    attackType: "spell",
    label: "3d6 + 7 lightning",
    range: { kind: "ranged", normal: 100, long: 300, feet: 100 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "cold", "lightning", "necrotic", "thunder"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained"],
  specialAbility: [
    "Grave Lightning", // 30 ft line, Dex save against 17, 6d6 lightning damage if save unsuccessful, half if successful.
  ],
  initiativeBonus: 7,
  speedFeet: 50,
  behavior: "rangedKiter",
  token: "G",
  tokenArt: "assets/tokens/grave-storm-apparition.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "princeOfTheHollowName", {
  name: "Prince of the Hollow Name",
  role: "Category 6 ghost boss",
  tags: ["undead", "ghost", "allip", "prince", "boss", "flying", "caster"],
  maxHp: 176,
  category: 6,
  xp: 2250,
  ac: 20,
  attackBonus: 12,
  damage: {
    count: 3,
    sides: 8,
    bonus: 7,
    type: "psychic",
    attackType: "spell",
    label: "3d8 + 7 psychic",
    range: { kind: "ranged", normal: 110, long: 330, feet: 110 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "cold", "fire", "lightning", "necrotic", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained", "charmed", "frightened"],
  specialAbility: [
    "Erase Name", // Once per fight: Wis save against 18, target cannot benefit from buffs/healing until end of next turn if save unsuccessful.
    "Forbidden Chorus", // 20 ft radius circle, Int save against 18, 6d8 psychic damage and confused movement if save unsuccessful, half damage if successful.
  ],
  initiativeBonus: 7,
  speedFeet: 50,
  behavior: "rangedKiter",
  token: "N",
  tokenArt: "assets/tokens/prince-of-the-hollow-name.jpg",
  flying: true,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});


/* ============================================================
 * CATEGORY 7 — Party Level 13/14
 * Theme: night spirits, doom heralds, royal executioner ghosts
 * ============================================================ */

window.DungeonContent.register("monsters", "moonlessNightshade", {
  name: "Moonless Nightshade",
  role: "Darkness-wrapped ghost assassin",
  tags: ["undead", "ghost", "nightshade", "flying"],
  maxHp: 138,
  category: 7,
  xp: 1900,
  ac: 20,
  attackBonus: 12,
  damage: {
    count: 3,
    sides: 8,
    bonus: 7,
    type: "necrotic",
    attackType: "spell",
    label: "3d8 + 7 necrotic",
    range: { kind: "melee", feet: 5 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "acid", "cold", "fire", "necrotic", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained", "charmed", "frightened"],
  specialAbility: [
    "Shadow Vanish", // Once per round after being damaged: teleport 15 ft if standing in dim light/darkness or near undead terrain.
  ],
  initiativeBonus: 8,
  speedFeet: 55,
  behavior: "melee",
  token: "M",
  tokenArt: "assets/tokens/moonless-nightshade.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "doomHeraldBanshee", {
  name: "Doom-Herald Banshee",
  role: "Lethal scream artillery",
  tags: ["undead", "ghost", "banshee", "herald", "flying", "caster"],
  maxHp: 132,
  category: 7,
  xp: 2050,
  ac: 19,
  attackBonus: 13,
  damage: {
    count: 4,
    sides: 6,
    bonus: 7,
    type: "thunder",
    attackType: "spell",
    label: "4d6 + 7 thunder",
    range: { kind: "ranged", normal: 120, long: 360, feet: 120 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "cold", "necrotic", "psychic", "thunder"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained", "charmed"],
  specialAbility: [
    "Doom Scream", // 40 ft cone, Con save against 19, 8d8 thunder damage and deafened/frightened if save unsuccessful, half damage if successful.
  ],
  initiativeBonus: 7,
  speedFeet: 45,
  behavior: "rangedKiter",
  token: "H",
  tokenArt: "assets/tokens/doom-herald-banshee.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "spectralExecutioner", {
  name: "Spectral Executioner",
  role: "Heavy melee finisher",
  tags: ["undead", "ghost", "executioner", "flying"],
  maxHp: 154,
  category: 7,
  xp: 2200,
  ac: 20,
  attackBonus: 13,
  damage: {
    count: 4,
    sides: 6,
    bonus: 8,
    type: "force",
    attackType: "spell",
    label: "4d6 + 8 force",
    range: { kind: "melee", feet: 10 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "cold", "fire", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained", "frightened"],
  specialAbility: [
    "Condemning Mark", // On hit: target is marked; next hit from the executioner deals +3d8 necrotic if the mark was not removed by radiant damage/healing.
  ],
  initiativeBonus: 6,
  speedFeet: 40,
  behavior: "melee",
  token: "X",
  tokenArt: "assets/tokens/spectral-executioner.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "lordOfTheUnburiedCourt", {
  name: "Lord of the Unburied Court",
  role: "Category 7 ghost boss",
  tags: ["undead", "ghost", "court", "lord", "boss", "flying"],
  maxHp: 228,
  category: 7,
  xp: 3400,
  ac: 21,
  attackBonus: 13,
  damage: {
    count: 4,
    sides: 8,
    bonus: 8,
    type: "necrotic",
    attackType: "spell",
    label: "4d8 + 8 necrotic",
    range: { kind: "melee", feet: 10 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "acid", "cold", "fire", "lightning", "necrotic", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained", "charmed", "frightened"],
  specialAbility: [
    "Courtly Decree", // Once per fight: all enemies in 30 ft make Wis save against 20 or cannot move closer to the lord for 1 round.
    "Unburied Retinue", // When bloodied: summons/empowers two lesser ghosts; if summons are not implemented, grants self +2 AC for 1 round.
  ],
  initiativeBonus: 7,
  speedFeet: 45,
  behavior: "melee",
  token: "L",
  tokenArt: "assets/tokens/lord-of-the-unburied-court.jpg",
  flying: true,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});


/* ============================================================
 * CATEGORY 8 — Party Level 15/16
 * Theme: ancient phantoms, grave storms, memory-devouring ghosts
 * ============================================================ */

window.DungeonContent.register("monsters", "ancientPhantomDragon", {
  name: "Ancient Phantom Dragon",
  role: "Large flying breath ghost",
  tags: ["undead", "ghost", "dragon", "phantom", "flying"],
  maxHp: 188,
  category: 8,
  xp: 3000,
  ac: 21,
  attackBonus: 14,
  damage: {
    count: 5,
    sides: 6,
    bonus: 8,
    type: "cold",
    attackType: "spell",
    label: "5d6 + 8 cold",
    range: { kind: "melee", feet: 10 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "acid", "cold", "fire", "lightning", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained", "frightened"],
  specialAbility: [
    "Grave Breath", // 60 ft cone, Dex save against 21, 10d6 cold/necrotic damage if save unsuccessful, half if successful.
  ],
  initiativeBonus: 8,
  speedFeet: 60,
  behavior: "melee",
  token: "D",
  tokenArt: "assets/tokens/ancient-phantom-dragon.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "memoryEaterAllip", {
  name: "Memory-Eater Allip",
  role: "Debuffing psychic elite",
  tags: ["undead", "ghost", "allip", "memory", "flying", "caster"],
  maxHp: 170,
  category: 8,
  xp: 3150,
  ac: 20,
  attackBonus: 14,
  damage: {
    count: 4,
    sides: 8,
    bonus: 8,
    type: "psychic",
    attackType: "spell",
    label: "4d8 + 8 psychic",
    range: { kind: "ranged", normal: 120, long: 360, feet: 120 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "cold", "fire", "lightning", "necrotic", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained", "charmed", "frightened"],
  specialAbility: [
    "Devour Memory", // On hit: Int save against 21, target loses access to one random ability/action button until end of next turn if save unsuccessful.
  ],
  initiativeBonus: 9,
  speedFeet: 50,
  behavior: "rangedKiter",
  token: "E",
  tokenArt: "assets/tokens/memory-eater-allip.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "tempestOfLostSouls", {
  name: "Tempest of Lost Souls",
  role: "Mobile storm area ghost",
  tags: ["undead", "ghost", "storm", "souls", "flying", "caster"],
  maxHp: 182,
  category: 8,
  xp: 3300,
  ac: 21,
  attackBonus: 14,
  damage: {
    count: 5,
    sides: 6,
    bonus: 9,
    type: "lightning",
    attackType: "spell",
    label: "5d6 + 9 lightning",
    range: { kind: "ranged", normal: 120, long: 360, feet: 120 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "cold", "lightning", "necrotic", "thunder"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained"],
  specialAbility: [
    "Soul Tempest", // 25 ft radius circle, Dex save against 21, 9d6 lightning/thunder damage and pushed 15 ft if save unsuccessful, half damage and no push if successful.
  ],
  initiativeBonus: 9,
  speedFeet: 60,
  behavior: "rangedKiter",
  token: "T",
  tokenArt: "assets/tokens/tempest-of-lost-souls.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "cathedralWraithSaint", {
  name: "Cathedral Wraith-Saint",
  role: "Category 8 ghost boss",
  tags: ["undead", "ghost", "wraith", "saint", "boss", "flying", "caster"],
  maxHp: 286,
  category: 8,
  xp: 5400,
  ac: 22,
  attackBonus: 15,
  damage: {
    count: 5,
    sides: 8,
    bonus: 9,
    type: "necrotic",
    attackType: "spell",
    label: "5d8 + 9 necrotic",
    range: { kind: "ranged", normal: 120, long: 360, feet: 120 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "acid", "cold", "fire", "lightning", "necrotic", "psychic", "thunder"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained", "charmed", "frightened"],
  specialAbility: [
    "Unholy Benediction", // Once per fight: heals all undead in 30 ft for 4d8 HP and gives them +1 attack until end of next round.
    "Cathedral Dirge", // 30 ft radius circle, Wis save against 22, 10d8 necrotic/psychic damage and frightened if save unsuccessful, half damage if successful.
  ],
  initiativeBonus: 8,
  speedFeet: 50,
  behavior: "rangedKiter",
  token: "S",
  tokenArt: "assets/tokens/cathedral-wraith-saint.jpg",
  flying: true,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});


/* ============================================================
 * CATEGORY 9 — Party Level 17/18
 * Theme: near-legendary death phantoms, abyssal wraiths, doom kings
 * ============================================================ */

window.DungeonContent.register("monsters", "abyssalWraith", {
  name: "Abyssal Wraith",
  role: "High-tier necrotic predator",
  tags: ["undead", "ghost", "wraith", "abyssal", "flying"],
  maxHp: 222,
  category: 9,
  xp: 4400,
  ac: 22,
  attackBonus: 15,
  damage: {
    count: 5,
    sides: 8,
    bonus: 9,
    type: "necrotic",
    attackType: "spell",
    label: "5d8 + 9 necrotic",
    range: { kind: "melee", feet: 10 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "acid", "cold", "fire", "lightning", "necrotic", "psychic", "thunder"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained", "charmed", "frightened"],
  specialAbility: [
    "Abyssal Drain", // On hit: Con save against 23, target takes +4d8 necrotic and this monster heals the same amount if save unsuccessful.
  ],
  initiativeBonus: 10,
  speedFeet: 60,
  behavior: "melee",
  token: "A",
  tokenArt: "assets/tokens/abyssal-wraith.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "oracleOfDeadStars", {
  name: "Oracle of Dead Stars",
  role: "Cosmic psychic ghost caster",
  tags: ["undead", "ghost", "oracle", "stars", "flying", "caster"],
  maxHp: 214,
  category: 9,
  xp: 4700,
  ac: 21,
  attackBonus: 15,
  damage: {
    count: 6,
    sides: 6,
    bonus: 9,
    type: "psychic",
    attackType: "spell",
    label: "6d6 + 9 psychic",
    range: { kind: "ranged", normal: 150, long: 450, feet: 150 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "cold", "fire", "lightning", "necrotic", "psychic", "thunder"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained", "charmed", "frightened"],
  specialAbility: [
    "Dead Star Vision", // Once per fight: force one target to reroll a successful save or attack; use worse result.
  ],
  initiativeBonus: 10,
  speedFeet: 55,
  behavior: "rangedKiter",
  token: "O",
  tokenArt: "assets/tokens/oracle-of-dead-stars.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "graveTitanPhantom", {
  name: "Grave-Titan Phantom",
  role: "Massive incorporeal bruiser",
  tags: ["undead", "ghost", "titan", "phantom", "flying"],
  maxHp: 246,
  category: 9,
  xp: 5200,
  ac: 22,
  attackBonus: 16,
  damage: {
    count: 6,
    sides: 6,
    bonus: 10,
    type: "force",
    attackType: "spell",
    label: "6d6 + 10 force",
    range: { kind: "melee", feet: 15 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "acid", "cold", "fire", "lightning", "necrotic", "thunder"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained", "frightened"],
  specialAbility: [
    "Ethereal Stomp", // 25 ft radius circle, Str save against 23, 10d6 force damage and knocked prone if save unsuccessful, half damage and no prone if successful.
  ],
  initiativeBonus: 7,
  speedFeet: 45,
  behavior: "melee",
  token: "T",
  tokenArt: "assets/tokens/grave-titan-phantom.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "deadKingUnderTheMoon", {
  name: "Dead King Under the Moon",
  role: "Category 9 ghost boss",
  tags: ["undead", "ghost", "king", "boss", "flying"],
  maxHp: 360,
  category: 9,
  xp: 8000,
  ac: 23,
  attackBonus: 16,
  damage: {
    count: 6,
    sides: 8,
    bonus: 10,
    type: "necrotic",
    attackType: "spell",
    label: "6d8 + 10 necrotic",
    range: { kind: "melee", feet: 15 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "acid", "cold", "fire", "lightning", "necrotic", "psychic", "thunder"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained", "charmed", "frightened"],
  specialAbility: [
    "Moonlit Dominion", // Once per fight: 40 ft radius circle, Wis save against 24, targets kneel/lose movement and take 8d8 psychic damage if save unsuccessful, half damage if successful.
    "King's Return", // When reduced to 0 HP by non-radiant damage: returns to 1 HP once and immediately teleports 30 ft.
  ],
  initiativeBonus: 9,
  speedFeet: 50,
  behavior: "melee",
  token: "K",
  tokenArt: "assets/tokens/dead-king-under-the-moon.jpg",
  flying: true,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});


/* ============================================================
 * CATEGORY 10 — Party Level 19/20
 * Theme: mythic ghosts, ancient soul monarchs, final-undead bosses
 * ============================================================ */

window.DungeonContent.register("monsters", "voidBellBanshee", {
  name: "Void-Bell Banshee",
  role: "Mythic scream caster",
  tags: ["undead", "ghost", "banshee", "void", "flying", "caster"],
  maxHp: 285,
  category: 10,
  xp: 7200,
  ac: 22,
  attackBonus: 17,
  damage: {
    count: 8,
    sides: 6,
    bonus: 10,
    type: "thunder",
    attackType: "spell",
    label: "8d6 + 10 thunder",
    range: { kind: "ranged", normal: 150, long: 450, feet: 150 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "acid", "cold", "fire", "lightning", "necrotic", "psychic", "thunder"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained", "charmed", "frightened"],
  specialAbility: [
    "Void Bell Toll", // 60 ft cone, Con save against 25, 14d8 thunder/psychic damage and stunned if save unsuccessful, half damage and no stun if successful.
  ],
  initiativeBonus: 10,
  speedFeet: 55,
  behavior: "rangedKiter",
  token: "B",
  tokenArt: "assets/tokens/void-bell-banshee.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "elderEidolon", {
  name: "Elder Eidolon",
  role: "Ancient balanced ghost champion",
  tags: ["undead", "ghost", "eidolon", "ancient", "flying"],
  maxHp: 310,
  category: 10,
  xp: 7800,
  ac: 23,
  attackBonus: 17,
  damage: {
    count: 6,
    sides: 8,
    bonus: 11,
    type: "force",
    attackType: "spell",
    label: "6d8 + 11 force",
    range: { kind: "melee", feet: 10 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "acid", "cold", "fire", "lightning", "necrotic", "psychic", "thunder"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained", "charmed", "frightened"],
  specialAbility: [
    "Eidolic Reversal", // Once per round when hit: attacker takes 2d8 force damage unless the triggering attack was radiant.
  ],
  initiativeBonus: 9,
  speedFeet: 55,
  behavior: "melee",
  token: "E",
  tokenArt: "assets/tokens/elder-eidolon.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "astralDeathWraith", {
  name: "Astral Death Wraith",
  role: "Final-tier soul reaper",
  tags: ["undead", "ghost", "wraith", "astral", "flying"],
  maxHp: 324,
  category: 10,
  xp: 8400,
  ac: 23,
  attackBonus: 18,
  damage: {
    count: 7,
    sides: 8,
    bonus: 10,
    type: "necrotic",
    attackType: "spell",
    label: "7d8 + 10 necrotic",
    range: { kind: "melee", feet: 15 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "acid", "cold", "fire", "lightning", "necrotic", "psychic", "thunder"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained", "charmed", "frightened"],
  specialAbility: [
    "Astral Reap", // On hit against a bloodied target: Con save against 25 or take +6d8 necrotic and lose all remaining movement this round.
    "Soul Eclipse", // Once per fight: extinguishes light/holy zones in 30 ft unless they are explicitly radiant.
  ],
  initiativeBonus: 11,
  speedFeet: 60,
  behavior: "melee",
  token: "R",
  tokenArt: "assets/tokens/astral-death-wraith.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "theFirstGhost", {
  name: "The First Ghost",
  role: "Category 10 ghost boss",
  tags: ["undead", "ghost", "mythic", "boss", "flying", "caster"],
  maxHp: 470,
  category: 10,
  xp: 12500,
  ac: 24,
  attackBonus: 18,
  damage: {
    count: 8,
    sides: 8,
    bonus: 12,
    type: "necrotic",
    attackType: "spell",
    label: "8d8 + 12 necrotic",
    range: { kind: "ranged", normal: 150, long: 450, feet: 150 }
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "acid", "cold", "fire", "lightning", "necrotic", "psychic", "thunder"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone", "grappled", "restrained", "charmed", "frightened"],
  specialAbility: [
    "Origin Wail", // 60 ft radius circle, Wis save against 26, 16d8 necrotic/psychic damage and frightened/stunned if save unsuccessful, half damage and no stun if successful.
    "Possess the Dungeon", // Mythic phase: at half HP, furniture/terrain in 30 ft becomes haunted hazards for 2 rounds.
    "Unfinished Death", // When reduced to 0 HP by non-radiant damage: survives at 1 HP once; radiant damage prevents this.
  ],
  initiativeBonus: 11,
  speedFeet: 60,
  behavior: "rangedKiter",
  token: "F",
  tokenArt: "assets/tokens/the-first-ghost.jpg",
  flying: true,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});

})();
