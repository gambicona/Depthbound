(() => {

/* ============================================================
 * FIEND / DEVIL MONSTER PACK
 * Theme: lawful infernal fiends, devils, contracts, chains,
 *        hellfire, punishment, temptation, and archdevil avatars.
 * Notes: Every monster starts its tags with "fiend" as requested.
 *        Devils tend to ignore fire/poison, fear radiant power,
 *        and often punish movement, failed saves, or wounded targets.
 * ============================================================ */


/* ============================================================
 * CATEGORY 1 — Party Level 1/2
 * Theme: minor imps, lemure soldiers, first infernal tricks
 * ============================================================ */

window.DungeonContent.register("monsters", "pitImpScout", {
  name: "Pit Imp Scout",
  role: "Tiny flying devil harrier",
  tags: ["fiend", "devil", "imp", "flying", "skirmisher"],
  maxHp: 11,
  category: 1,
  xp: 75,
  ac: 14,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 6,
    bonus: 2,
    type: "piercing",
    attackType: "weapon",
    label: "1d6 + 2 piercing",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["cold"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Infernal Sting", // On hit: Con save against 11, target takes 1d4 poison damage at the start of its next turn if save unsuccessful.
  ],
  initiativeBonus: 4,
  speedFeet: 30,
  behavior: "melee",
  token: "I",
  tokenArt: "assets/tokens/pit-imp-scout.jpg",
  flying: true,
});


window.DungeonContent.register("monsters", "cinderLemure", {
  name: "Cinder Lemure",
  role: "Slow burning fiend brute",
  tags: ["fiend", "devil", "lemure", "brute"],
  maxHp: 17,
  category: 1,
  xp: 70,
  ac: 11,
  attackBonus: 3,
  damage: {
    count: 1,
    sides: 8,
    bonus: 1,
    type: "bludgeoning",
    attackType: "weapon",
    label: "1d8 + 1 bludgeoning",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: [],
  damageVulnerabilities: ["radiant", "cold"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Cinder Body", // When hit by melee attack: attacker takes 1 fire damage.
  ],
  initiativeBonus: -1,
  speedFeet: 20,
  behavior: "melee",
  token: "L",
  tokenArt: "assets/tokens/cinder-lemure.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "contractWhelp", {
  name: "Contract Whelp",
  role: "Weak pact-mark caster",
  tags: ["fiend", "devil", "contract", "caster"],
  maxHp: 13,
  category: 1,
  xp: 85,
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
      normal: 50,
      long: 150,
      feet: 50,
    },
  },
  damageResistances: ["cold"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Petty Bargain", // Once per fight: target makes Cha save against 11 or has -1 AC until the end of its next turn.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "W",
  tokenArt: "assets/tokens/contract-whelp.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "brassHornOverseer", {
  name: "Brass-Horn Overseer",
  role: "Category 1 devil boss",
  tags: ["fiend", "devil", "boss", "overseer"],
  maxHp: 34,
  category: 1,
  xp: 1730,
  ac: 14,
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
  damageResistances: ["cold", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Command the Wretched", // Once per fight: one allied fiend within 30 ft immediately moves up to half speed and makes a basic attack.
    "Branding Lash", // 10 ft line, Dex save against 12, 2d6 fire damage and marked by hellfire if save unsuccessful, half damage if successful.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "O",
  tokenArt: "assets/tokens/brass-horn-overseer.jpg",
  flying: false,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});



/* ============================================================
 * CATEGORY 2 — Party Level 3/4
 * Theme: hellhounds, spines, hooks, early chain control
 * ============================================================ */

window.DungeonContent.register("monsters", "spinedHellion", {
  name: "Spined Hellion",
  role: "Ranged spine thrower",
  tags: ["fiend", "devil", "spined", "ranged", "flying"],
  maxHp: 26,
  category: 2,
  xp: 415,
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
      kind: "ranged",
      normal: 60,
      long: 180,
      feet: 60,
    },
  },
  damageResistances: ["cold", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Hellspines", // On ranged hit: target makes Dex save against 12 or loses 5 ft speed until the end of its next turn.
  ],
  initiativeBonus: 4,
  speedFeet: 35,
  behavior: "rangedKiter",
  token: "S",
  tokenArt: "assets/tokens/spined-hellion.jpg",
  flying: true,
});


window.DungeonContent.register("monsters", "ashMawHound", {
  name: "Ash-Maw Hound",
  role: "Fast infernal beast",
  tags: ["fiend", "devil", "hound", "beast"],
  maxHp: 34,
  category: 2,
  xp: 475,
  ac: 14,
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
  damageResistances: ["cold"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Hellhound Breath", // 15 ft cone, Dex save against 13, 3d6 fire damage if save unsuccessful, half if successful.
  ],
  initiativeBonus: 3,
  speedFeet: 40,
  behavior: "melee",
  token: "H",
  tokenArt: "assets/tokens/ash-maw-hound.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "chainSnagDevil", {
  name: "Chain-Snag Devil",
  role: "Early reach controller",
  tags: ["fiend", "devil", "chain", "controller"],
  maxHp: 30,
  category: 2,
  xp: 450,
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
      feet: 10,
    },
  },
  damageResistances: ["cold", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Hooking Chain", // On hit: Str save against 13 or pulled 5 ft toward the devil.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "C",
  tokenArt: "assets/tokens/chain-snag-devil.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "infernalGaoler", {
  name: "Infernal Gaoler",
  role: "Category 2 devil boss",
  tags: ["fiend", "devil", "boss", "chain", "jailer"],
  maxHp: 62,
  category: 2,
  xp: 12165,
  ac: 16,
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
      feet: 10,
    },
  },
  damageResistances: ["cold", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Locking Chain", // Once per fight: 15 ft radius circle, Str save against 13, restrained until the end of target's next turn if save unsuccessful.
    "Pain Tax", // When a restrained or slowed target is hit by the gaoler, add 1d6 fire damage.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "G",
  tokenArt: "assets/tokens/infernal-gaoler.jpg",
  flying: false,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});



/* ============================================================
 * CATEGORY 3 — Party Level 5/6
 * Theme: barbed enforcers, sulphur magic, winged scouts
 * ============================================================ */

window.DungeonContent.register("monsters", "barbedEnforcer", {
  name: "Barbed Enforcer",
  role: "Punishing melee bruiser",
  tags: ["fiend", "devil", "barbed", "brute"],
  maxHp: 46,
  category: 3,
  xp: 1820,
  ac: 16,
  attackBonus: 6,
  damage: {
    count: 1,
    sides: 12,
    bonus: 4,
    type: "piercing",
    attackType: "weapon",
    label: "1d12 + 4 piercing",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["cold", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Barbed Hide", // When hit by melee attack: attacker takes 1d6 piercing damage.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "B",
  tokenArt: "assets/tokens/barbed-enforcer.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "sulphurHexer", {
  name: "Sulphur Hexer",
  role: "Infernal debuff caster",
  tags: ["fiend", "devil", "caster", "hex"],
  maxHp: 38,
  category: 3,
  xp: 1935,
  ac: 15,
  attackBonus: 6,
  damage: {
    count: 2,
    sides: 6,
    bonus: 3,
    type: "fire",
    attackType: "spell",
    label: "2d6 + 3 fire",
    range: {
      kind: "ranged",
      normal: 60,
      long: 180,
      feet: 60,
    },
  },
  damageResistances: ["cold", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Sulphur Hex", // Once per fight: Wis save against 14, target deals -1d6 damage on its next successful attack if save unsuccessful.
  ],
  initiativeBonus: 3,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "X",
  tokenArt: "assets/tokens/sulphur-hexer.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "emberwingPursuer", {
  name: "Emberwing Pursuer",
  role: "Flying fire skirmisher",
  tags: ["fiend", "devil", "flying", "skirmisher"],
  maxHp: 42,
  category: 3,
  xp: 1875,
  ac: 16,
  attackBonus: 7,
  damage: {
    count: 1,
    sides: 10,
    bonus: 4,
    type: "fire",
    attackType: "weapon",
    label: "1d10 + 4 fire",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["cold", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Burning Dive", // If it moves at least 20 ft before attacking, add 1d6 fire damage on hit.
  ],
  initiativeBonus: 5,
  speedFeet: 40,
  behavior: "melee",
  token: "E",
  tokenArt: "assets/tokens/emberwing-pursuer.jpg",
  flying: true,
});


window.DungeonContent.register("monsters", "hellmarkedAdjudicator", {
  name: "Hellmarked Adjudicator",
  role: "Category 3 devil boss",
  tags: ["fiend", "devil", "boss", "contract", "caster"],
  maxHp: 88,
  category: 3,
  xp: 15385,
  ac: 17,
  attackBonus: 7,
  damage: {
    count: 2,
    sides: 8,
    bonus: 4,
    type: "fire",
    attackType: "spell",
    label: "2d8 + 4 fire",
    range: {
      kind: "ranged",
      normal: 60,
      long: 180,
      feet: 60,
    },
  },
  damageResistances: ["cold", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Infernal Verdict", // Once per fight: target makes Cha save against 14 or is branded; branded target takes +1d6 fire damage from the next hit it suffers.
    "Guilty Flame", // 15 ft radius circle, Dex save against 14, 4d6 fire damage if save unsuccessful, half if successful.
  ],
  initiativeBonus: 3,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "A",
  tokenArt: "assets/tokens/hellmarked-adjudicator.jpg",
  flying: false,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});



/* ============================================================
 * CATEGORY 4 — Party Level 7/8
 * Theme: battle devils, contract magic, stronger battlefield punishment
 * ============================================================ */

window.DungeonContent.register("monsters", "forkedSpearDevil", {
  name: "Forked-Spear Devil",
  role: "Reach-line infantry devil",
  tags: ["fiend", "devil", "soldier", "reach"],
  maxHp: 62,
  category: 4,
  multiattack: { attacks: 2 },
  xp: 1840,
  ac: 17,
  attackBonus: 7,
  damage: {
    count: 2,
    sides: 8,
    bonus: 4,
    type: "piercing",
    attackType: "weapon",
    label: "2d8 + 4 piercing",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["cold", "necrotic", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Impaling Advance", // 10 ft line, Dex save against 15, 3d8 piercing damage and pushed 5 ft if save unsuccessful, half damage if successful.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "F",
  tokenArt: "assets/tokens/forked-spear-devil.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "brimstoneBombardier", {
  name: "Brimstone Bombardier",
  role: "Area fire artillery",
  tags: ["fiend", "devil", "artillery", "caster"],
  maxHp: 54,
  category: 4,
  xp: 1900,
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
  damageResistances: ["cold", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Brimstone Shell", // 10 ft radius circle, Dex save against 15, 5d6 fire damage if save unsuccessful, half if successful.
  ],
  initiativeBonus: 3,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "M",
  tokenArt: "assets/tokens/brimstone-bombardier.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "oathbrandTempter", {
  name: "Oathbrand Tempter",
  role: "Charm and bargain fiend",
  tags: ["fiend", "devil", "tempter", "contract", "caster"],
  maxHp: 58,
  category: 4,
  xp: 1960,
  ac: 16,
  attackBonus: 7,
  damage: {
    count: 2,
    sides: 8,
    bonus: 4,
    type: "psychic",
    attackType: "spell",
    label: "2d8 + 4 psychic",
    range: {
      kind: "ranged",
      normal: 60,
      long: 180,
      feet: 60,
    },
  },
  damageResistances: ["cold", "necrotic", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned", "charmed"],
  specialAbility: [
    "Sweetened Damnation", // Once per fight: Wis save against 15, target is charmed until the end of its next turn if save unsuccessful.
  ],
  initiativeBonus: 4,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "T",
  tokenArt: "assets/tokens/oathbrand-tempter.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "chainMagistrate", {
  name: "Chain Magistrate",
  role: "Category 4 devil boss",
  tags: ["fiend", "devil", "boss", "chain", "controller"],
  maxHp: 118,
  category: 4,
  multiattack: { attacks: 2 },
  xp: 12195,
  ac: 18,
  attackBonus: 8,
  damage: {
    count: 2,
    sides: 10,
    bonus: 5,
    type: "slashing",
    attackType: "weapon",
    label: "2d10 + 5 slashing",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["cold", "necrotic", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned", "charmed"],
  specialAbility: [
    "Sentence to Chains", // Once per fight: 20 ft radius circle, Str save against 15, restrained until the end of target's next turn if save unsuccessful.
    "Juridical Cruelty", // Targets restrained by the magistrate take +2d6 necrotic damage from its attacks.
  ],
  initiativeBonus: 3,
  speedFeet: 30,
  behavior: "melee",
  token: "J",
  tokenArt: "assets/tokens/chain-magistrate.jpg",
  flying: false,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});



/* ============================================================
 * CATEGORY 5 — Party Level 9/10
 * Theme: centurions, ledgers, hellsteeds, organized infernal courts
 * ============================================================ */

window.DungeonContent.register("monsters", "hellfireCenturion", {
  name: "Hellfire Centurion",
  role: "Elite infernal frontliner",
  tags: ["fiend", "devil", "soldier", "fire"],
  maxHp: 84,
  category: 5,
  multiattack: { attacks: 2 },
  xp: 2025,
  ac: 18,
  attackBonus: 8,
  damage: {
    count: 2,
    sides: 10,
    bonus: 5,
    type: "fire",
    attackType: "weapon",
    label: "2d10 + 5 fire",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["cold", "necrotic", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Phalanx of Flame", // If adjacent to another fiend, gains +1 AC and adds 1d6 fire damage on hit.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "C",
  tokenArt: "assets/tokens/hellfire-centurion.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "soulLedgerScribe", {
  name: "Soul-Ledger Scribe",
  role: "Contract curse artillery",
  tags: ["fiend", "devil", "contract", "caster"],
  maxHp: 72,
  category: 5,
  xp: 2095,
  ac: 17,
  attackBonus: 8,
  damage: {
    count: 3,
    sides: 6,
    bonus: 5,
    type: "necrotic",
    attackType: "spell",
    label: "3d6 + 5 necrotic",
    range: {
      kind: "ranged",
      normal: 70,
      long: 210,
      feet: 70,
    },
  },
  damageResistances: ["cold", "necrotic", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned", "charmed"],
  specialAbility: [
    "Name in the Ledger", // Once per fight: target makes Cha save against 16 or cannot regain HP until the end of its next turn.
  ],
  initiativeBonus: 4,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "S",
  tokenArt: "assets/tokens/soul-ledger-scribe.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "gloomhornHellsteed", {
  name: "Gloomhorn Hellsteed",
  role: "Infernal charger mount",
  tags: ["fiend", "devil", "mount", "beast"],
  maxHp: 92,
  category: 5,
  multiattack: { attacks: 2 },
  xp: 2135,
  ac: 17,
  attackBonus: 8,
  damage: {
    count: 2,
    sides: 12,
    bonus: 5,
    type: "bludgeoning",
    attackType: "weapon",
    label: "2d12 + 5 bludgeoning",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["cold", "necrotic", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Trampling Charge", // If it moves at least 20 ft before attacking, target makes Str save against 16 or is knocked prone and takes +2d6 bludgeoning damage.
  ],
  initiativeBonus: 3,
  speedFeet: 50,
  behavior: "melee",
  token: "H",
  tokenArt: "assets/tokens/gloomhorn-hellsteed.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "crimsonContractJudge", {
  name: "Crimson Contract Judge",
  role: "Category 5 devil boss",
  tags: ["fiend", "devil", "boss", "contract", "judge"],
  maxHp: 155,
  category: 5,
  xp: 15465,
  ac: 19,
  attackBonus: 9,
  damage: {
    count: 3,
    sides: 8,
    bonus: 5,
    type: "fire",
    attackType: "spell",
    label: "3d8 + 5 fire",
    range: {
      kind: "ranged",
      normal: 70,
      long: 210,
      feet: 70,
    },
  },
  damageResistances: ["cold", "necrotic", "bludgeoning", "piercing", "slashing", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned", "charmed", "frightened"],
  specialAbility: [
    "Clause of Pain", // Once per fight: marks all enemies in 20 ft radius; marked targets take 1d6 psychic damage whenever they move willingly before judge's next turn.
    "Final Signature", // Single target Cha save against 16, 6d8 necrotic damage if save unsuccessful, half if successful.
  ],
  initiativeBonus: 4,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "J",
  tokenArt: "assets/tokens/crimson-contract-judge.jpg",
  flying: false,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});



/* ============================================================
 * CATEGORY 6 — Party Level 11/12
 * Theme: bonehooks, maledictions, siege devils, pact nobility
 * ============================================================ */

window.DungeonContent.register("monsters", "bonehookStalker", {
  name: "Bonehook Stalker",
  role: "Hooked devil assassin",
  tags: ["fiend", "devil", "bone", "stalker"],
  maxHp: 106,
  category: 6,
  multiattack: { attacks: 2 },
  xp: 1525,
  ac: 18,
  attackBonus: 9,
  damage: {
    count: 3,
    sides: 8,
    bonus: 6,
    type: "piercing",
    attackType: "weapon",
    label: "3d8 + 6 piercing",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["cold", "necrotic", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Hook and Bleed", // On hit: target makes Con save against 17 or takes 2d6 necrotic damage at the start of its next turn.
  ],
  initiativeBonus: 5,
  speedFeet: 35,
  behavior: "melee",
  token: "K",
  tokenArt: "assets/tokens/bonehook-stalker.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "nineBrandMaledictor", {
  name: "Nine-Brand Maledictor",
  role: "High curse caster",
  tags: ["fiend", "devil", "curse", "caster"],
  maxHp: 94,
  category: 6,
  xp: 1575,
  ac: 17,
  attackBonus: 9,
  damage: {
    count: 3,
    sides: 8,
    bonus: 6,
    type: "psychic",
    attackType: "spell",
    label: "3d8 + 6 psychic",
    range: {
      kind: "ranged",
      normal: 80,
      long: 240,
      feet: 80,
    },
  },
  damageResistances: ["cold", "necrotic", "psychic", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned", "charmed"],
  specialAbility: [
    "Ninefold Curse", // Once per fight: Wis save against 17, target has disadvantage-like -2 penalty on its next attack and save if save unsuccessful.
  ],
  initiativeBonus: 4,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "M",
  tokenArt: "assets/tokens/nine-brand-maledictor.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "infernalSiegeBrute", {
  name: "Infernal Siege Brute",
  role: "Massive wall-breaker devil",
  sizeSquares: 2,
  tags: ["fiend", "devil", "siege", "brute"],
  maxHp: 124,
  category: 6,
  multiattack: { attacks: 2 },
  xp: 1630,
  ac: 18,
  attackBonus: 9,
  damage: {
    count: 3,
    sides: 10,
    bonus: 6,
    type: "bludgeoning",
    attackType: "weapon",
    label: "3d10 + 6 bludgeoning",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["cold", "necrotic", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned", "frightened"],
  specialAbility: [
    "Siege Slam", // 10 ft radius circle centered on target, Str save against 17, knocked prone and 4d10 bludgeoning damage if save unsuccessful, half damage if successful.
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "melee",
  token: "B",
  tokenArt: "assets/tokens/infernal-siege-brute.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "pactDuchessOfTheRedSeal", {
  name: "Pact Duchess of the Red Seal",
  role: "Category 6 devil boss",
  tags: ["fiend", "devil", "boss", "noble", "contract", "caster"],
  maxHp: 198,
  category: 6,
  xp: 13980,
  ac: 19,
  attackBonus: 10,
  damage: {
    count: 4,
    sides: 8,
    bonus: 6,
    type: "fire",
    attackType: "spell",
    label: "4d8 + 6 fire",
    range: {
      kind: "ranged",
      normal: 80,
      long: 240,
      feet: 80,
    },
  },
  damageResistances: ["cold", "necrotic", "bludgeoning", "piercing", "slashing", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned", "charmed", "frightened"],
  specialAbility: [
    "Red Seal Edict", // Once per fight: all enemies in 20 ft make Cha save against 17 or are branded; branded targets take +2d6 fire from the next spell hit.
    "Infernal Retinue", // At half HP: summons two weak imp-like minions or grants nearby fiends temporary HP.
  ],
  initiativeBonus: 5,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "D",
  tokenArt: "assets/tokens/pact-duchess-of-the-red-seal.jpg",
  flying: false,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});



/* ============================================================
 * CATEGORY 7 — Party Level 13/14
 * Theme: elite erinyes, furnace tyrants, exarchs, infernal inquisitors
 * ============================================================ */

window.DungeonContent.register("monsters", "ashenErinyes", {
  name: "Ashen Erinyes",
  role: "Elite flying archer devil",
  tags: ["fiend", "devil", "erinyes", "flying", "ranged"],
  maxHp: 128,
  category: 7,
  xp: 1695,
  ac: 19,
  attackBonus: 10,
  damage: {
    count: 3,
    sides: 10,
    bonus: 7,
    type: "piercing",
    attackType: "weapon",
    label: "3d10 + 7 piercing",
    range: {
      kind: "ranged",
      normal: 100,
      long: 300,
      feet: 100,
    },
  },
  damageResistances: ["cold", "necrotic", "bludgeoning", "piercing", "slashing", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned", "charmed"],
  specialAbility: [
    "Hellbow Pin", // On hit: Str save against 18 or target speed becomes 0 until the end of its next turn.
  ],
  initiativeBonus: 6,
  speedFeet: 40,
  behavior: "rangedKiter",
  token: "E",
  tokenArt: "assets/tokens/ashen-erinyes.jpg",
  flying: true,
});


window.DungeonContent.register("monsters", "furnaceTyrant", {
  name: "Furnace Tyrant",
  role: "Burning aura juggernaut",
  sizeSquares: 2,
  tags: ["fiend", "devil", "furnace", "brute"],
  maxHp: 152,
  category: 7,
  multiattack: { attacks: 2 },
  xp: 1760,
  ac: 19,
  attackBonus: 10,
  damage: {
    count: 4,
    sides: 8,
    bonus: 7,
    type: "fire",
    attackType: "weapon",
    label: "4d8 + 7 fire",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["cold", "necrotic", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["radiant", "cold"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned", "frightened"],
  specialAbility: [
    "Furnace Aura", // Enemies starting turn adjacent to it take 2d6 fire damage.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "T",
  tokenArt: "assets/tokens/furnace-tyrant.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "hellchainExarch", {
  name: "Hellchain Exarch",
  role: "Elite chain commander",
  tags: ["fiend", "devil", "chain", "commander"],
  maxHp: 136,
  category: 7,
  multiattack: { attacks: 2 },
  xp: 1735,
  ac: 20,
  attackBonus: 10,
  damage: {
    count: 4,
    sides: 8,
    bonus: 7,
    type: "slashing",
    attackType: "weapon",
    label: "4d8 + 7 slashing",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["cold", "necrotic", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned", "charmed", "frightened"],
  specialAbility: [
    "Living Chains", // Once per fight: three visible enemies make Str save against 18 or are pulled 10 ft toward the exarch.
  ],
  initiativeBonus: 4,
  speedFeet: 30,
  behavior: "melee",
  token: "X",
  tokenArt: "assets/tokens/hellchain-exarch.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "inquisitorMalrec", {
  name: "Inquisitor Malrec",
  role: "Category 7 devil boss",
  tags: ["fiend", "devil", "boss", "inquisitor", "commander"],
  maxHp: 255,
  category: 7,
  multiattack: { attacks: 2 },
  xp: 15535,
  ac: 20,
  attackBonus: 11,
  damage: {
    count: 4,
    sides: 10,
    bonus: 7,
    type: "necrotic",
    attackType: "weapon",
    label: "4d10 + 7 necrotic",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["cold", "necrotic", "lightning", "bludgeoning", "piercing", "slashing", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned", "charmed", "frightened"],
  specialAbility: [
    "Confession by Fire", // Once per fight: 20 ft cone, Wis save against 18, 8d8 fire and frightened until the end of next turn if save unsuccessful, half damage only if successful.
    "Punish Cowardice", // Reaction-style effect: when an enemy moves away from Malrec, Malrec lashes it for 2d8 fire damage.
  ],
  initiativeBonus: 5,
  speedFeet: 35,
  behavior: "melee",
  token: "M",
  tokenArt: "assets/tokens/inquisitor-malrec.jpg",
  flying: false,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});



/* ============================================================
 * CATEGORY 8 — Party Level 15/16
 * Theme: pit-born devastators, soul furnaces, stygian war devils
 * ============================================================ */

window.DungeonContent.register("monsters", "pitBornDevastator", {
  name: "Pit-Born Devastator",
  role: "Huge infernal destroyer",
  sizeSquares: 2,
  tags: ["fiend", "devil", "pit", "brute"],
  maxHp: 178,
  category: 8,
  multiattack: { attacks: 2 },
  xp: 2670,
  ac: 20,
  attackBonus: 11,
  damage: {
    count: 5,
    sides: 8,
    bonus: 8,
    type: "bludgeoning",
    attackType: "weapon",
    label: "5d8 + 8 bludgeoning",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["cold", "necrotic", "lightning", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned", "frightened"],
  specialAbility: [
    "Pit Quake", // Once per fight: 15 ft radius circle, Str save against 19, 8d8 bludgeoning damage and knocked prone if save unsuccessful, half if successful.
  ],
  initiativeBonus: 2,
  speedFeet: 35,
  behavior: "melee",
  token: "P",
  tokenArt: "assets/tokens/pit-born-devastator.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "soulFurnaceHierarch", {
  name: "Soul-Furnace Hierarch",
  role: "Soul-burning archcaster",
  tags: ["fiend", "devil", "soul", "caster"],
  maxHp: 158,
  category: 8,
  xp: 2755,
  ac: 19,
  attackBonus: 11,
  damage: {
    count: 5,
    sides: 8,
    bonus: 8,
    type: "necrotic",
    attackType: "spell",
    label: "5d8 + 8 necrotic",
    range: {
      kind: "ranged",
      normal: 90,
      long: 270,
      feet: 90,
    },
  },
  damageResistances: ["cold", "necrotic", "lightning", "bludgeoning", "piercing", "slashing", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned", "charmed", "frightened"],
  specialAbility: [
    "Soul Furnace", // Once per fight: 20 ft radius circle, Con save against 19, 9d8 necrotic damage and healing received halved for one turn if save unsuccessful, half damage if successful.
  ],
  initiativeBonus: 5,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "F",
  tokenArt: "assets/tokens/soul-furnace-hierarch.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "stygianBrandDevil", {
  name: "Stygian Brand Devil",
  role: "Cold-iron infernal elite",
  tags: ["fiend", "devil", "stygian", "soldier"],
  maxHp: 168,
  category: 8,
  multiattack: { attacks: 2 },
  xp: 2715,
  ac: 21,
  attackBonus: 11,
  damage: {
    count: 4,
    sides: 10,
    bonus: 8,
    type: "cold",
    attackType: "weapon",
    label: "4d10 + 8 cold",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["necrotic", "psychic", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["radiant", "fire"],
  damageImmunities: ["cold", "poison"],
  conditionImmunities: ["poisoned", "charmed", "frightened"],
  specialAbility: [
    "Stygian Brand", // On hit: target makes Con save against 19 or has -10 ft speed and cannot take reactions until the end of its next turn.
  ],
  initiativeBonus: 3,
  speedFeet: 30,
  behavior: "melee",
  token: "S",
  tokenArt: "assets/tokens/stygian-brand-devil.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "warDukeAsteroth", {
  name: "War Duke Asteroth",
  role: "Category 8 devil boss",
  tags: ["fiend", "devil", "boss", "duke", "war"],
  maxHp: 320,
  category: 8,
  multiattack: { attacks: 2 },
  xp: 9455,
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
      feet: 10,
    },
  },
  damageResistances: ["cold", "necrotic", "lightning", "bludgeoning", "piercing", "slashing", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned", "charmed", "frightened"],
  specialAbility: [
    "Duke's War Cry", // Once per fight: all enemies in 30 ft make Wis save against 19 or are frightened until the end of their next turn.
    "Infernal Countermarch", // At half HP: all allied fiends gain +10 ft speed and +1d8 fire damage until Asteroth's next turn.
  ],
  initiativeBonus: 5,
  speedFeet: 35,
  behavior: "melee",
  token: "A",
  tokenArt: "assets/tokens/war-duke-asteroth.jpg",
  flying: false,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});



/* ============================================================
 * CATEGORY 9 — Party Level 17/18
 * Theme: praetors, archdevil hands, soul reapers, duke-tier commanders
 * ============================================================ */

window.DungeonContent.register("monsters", "hellCrownPraetor", {
  name: "Hell-Crown Praetor",
  role: "Archdevil guard captain",
  tags: ["fiend", "devil", "praetor", "commander"],
  maxHp: 225,
  category: 9,
  multiattack: { attacks: 3 },
  xp: 3570,
  ac: 21,
  attackBonus: 12,
  damage: {
    count: 5,
    sides: 10,
    bonus: 9,
    type: "slashing",
    attackType: "weapon",
    label: "5d10 + 9 slashing",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["cold", "necrotic", "lightning", "bludgeoning", "piercing", "slashing", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned", "charmed", "frightened"],
  specialAbility: [
    "Infernal Benediction", // Action: heals a wounded monster ally within 30 ft.
    "Praetor's Challenge", // Once per fight: one target makes Wis save against 20 or is compelled to attack the praetor next turn if able.
  ],
  initiativeBonus: 5,
  speedFeet: 35,
  behavior: "melee",
  token: "P",
  tokenArt: "assets/tokens/hell-crown-praetor.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "archdevilsBurningHand", {
  name: "Archdevil's Burning Hand",
  role: "Chosen infernal executioner",
  tags: ["fiend", "devil", "executioner", "fire"],
  maxHp: 212,
  category: 9,
  xp: 3705,
  ac: 20,
  attackBonus: 12,
  damage: {
    count: 6,
    sides: 8,
    bonus: 9,
    type: "fire",
    attackType: "spell",
    label: "6d8 + 9 fire",
    range: {
      kind: "ranged",
      normal: 100,
      long: 300,
      feet: 100,
    },
  },
  damageResistances: ["cold", "necrotic", "lightning", "bludgeoning", "piercing", "slashing", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned", "charmed", "frightened"],
  specialAbility: [
    "Burning Hand of Command", // 30 ft line, Dex save against 20, 10d8 fire damage and pushed 10 ft if save unsuccessful, half damage if successful.
  ],
  initiativeBonus: 6,
  speedFeet: 35,
  behavior: "rangedKiter",
  token: "H",
  tokenArt: "assets/tokens/archdevils-burning-hand.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "infernalSoulReaper", {
  name: "Infernal Soul Reaper",
  role: "Flying soul executioner",
  tags: ["fiend", "devil", "reaper", "flying"],
  maxHp: 238,
  category: 9,
  multiattack: { attacks: 3 },
  xp: 3630,
  ac: 21,
  attackBonus: 12,
  damage: {
    count: 5,
    sides: 12,
    bonus: 9,
    type: "necrotic",
    attackType: "weapon",
    label: "5d12 + 9 necrotic",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["cold", "necrotic", "lightning", "bludgeoning", "piercing", "slashing", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned", "charmed", "frightened"],
  specialAbility: [
    "Harvest Contract", // If this attack drops a target to 0 HP, the reaper heals 5d8 HP and gains +1 attack bonus for the rest of the fight.
  ],
  initiativeBonus: 7,
  speedFeet: 45,
  behavior: "melee",
  token: "R",
  tokenArt: "assets/tokens/infernal-soul-reaper.jpg",
  flying: true,
});


window.DungeonContent.register("monsters", "dukeOfChainsVoragul", {
  name: "Duke of Chains Voragul",
  role: "Category 9 devil boss",
  tags: ["fiend", "devil", "boss", "duke", "chain"],
  maxHp: 430,
  category: 9,
  multiattack: { attacks: 3 },
  xp: 14620,
  ac: 22,
  attackBonus: 13,
  damage: {
    count: 6,
    sides: 10,
    bonus: 9,
    type: "slashing",
    attackType: "weapon",
    label: "6d10 + 9 slashing",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["cold", "necrotic", "lightning", "bludgeoning", "piercing", "slashing", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned", "charmed", "frightened", "restrained"],
  specialAbility: [
    "Chains of the Ninth Gate", // Once per fight: all enemies in 30 ft make Str save against 20 or are restrained and pulled 10 ft toward Voragul.
    "Duke's Edict", // Reaction-style effect: when an enemy succeeds on a save against him, that enemy takes 3d8 psychic damage.
  ],
  initiativeBonus: 6,
  speedFeet: 35,
  behavior: "melee",
  token: "V",
  tokenArt: "assets/tokens/duke-of-chains-voragul.jpg",
  flying: false,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});



/* ============================================================
 * CATEGORY 10 — Party Level 19/20
 * Theme: avatar-tier devils, contract titans, near-archdevil threats
 * ============================================================ */

window.DungeonContent.register("monsters", "aspectOfThePit", {
  name: "Aspect of the Pit",
  role: "Avatar-level pit devil",
  sizeSquares: 2,
  tags: ["fiend", "devil", "pit", "avatar", "flying"],
  maxHp: 295,
  category: 10,
  multiattack: { attacks: 4 },
  xp: 4645,
  ac: 22,
  attackBonus: 13,
  damage: {
    count: 7,
    sides: 8,
    bonus: 10,
    type: "fire",
    attackType: "weapon",
    label: "7d8 + 10 fire",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["cold", "necrotic", "lightning", "bludgeoning", "piercing", "slashing", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned", "charmed", "frightened"],
  specialAbility: [
    "Pit Lord's Command", // Once per fight: every allied fiend within 60 ft makes one basic attack or moves up to half speed.
    "Hellfire Wings", // Enemies ending turn adjacent to it take 3d8 fire damage.
  ],
  initiativeBonus: 7,
  speedFeet: 45,
  behavior: "melee",
  token: "P",
  tokenArt: "assets/tokens/aspect-of-the-pit.jpg",
  flying: true,
});


window.DungeonContent.register("monsters", "infernalSeraphOfChains", {
  name: "Infernal Seraph of Chains",
  role: "Fallen angelic devil caster",
  tags: ["fiend", "devil", "seraph", "flying", "caster"],
  maxHp: 276,
  category: 10,
  xp: 4765,
  ac: 22,
  attackBonus: 13,
  damage: {
    count: 7,
    sides: 8,
    bonus: 10,
    type: "radiant",
    attackType: "spell",
    label: "7d8 + 10 radiant",
    range: {
      kind: "ranged",
      normal: 100,
      long: 300,
      feet: 100,
    },
  },
  damageResistances: ["cold", "necrotic", "lightning", "bludgeoning", "piercing", "slashing", "psychic", "radiant"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned", "charmed", "frightened"],
  specialAbility: [
    "Profane Radiance", // 20 ft radius circle, Con save against 21, 12d8 radiant damage and blinded until the end of next turn if save unsuccessful, half damage if successful.
    "Chains of Grace", // Once per fight: target makes Cha save against 21 or is restrained by golden-black chains for one turn.
  ],
  initiativeBonus: 6,
  speedFeet: 40,
  behavior: "rangedKiter",
  token: "S",
  tokenArt: "assets/tokens/infernal-seraph-of-chains.jpg",
  flying: true,
});


window.DungeonContent.register("monsters", "contractTitan", {
  name: "Contract Titan",
  role: "Colossal infernal enforcer",
  sizeSquares: 3,
  tags: ["fiend", "devil", "titan", "contract", "brute"],
  maxHp: 318,
  category: 10,
  multiattack: { attacks: 4 },
  xp: 4810,
  ac: 21,
  attackBonus: 13,
  damage: {
    count: 7,
    sides: 10,
    bonus: 10,
    type: "bludgeoning",
    attackType: "weapon",
    label: "7d10 + 10 bludgeoning",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["cold", "necrotic", "lightning", "bludgeoning", "piercing", "slashing", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned", "charmed", "frightened"],
  specialAbility: [
    "Titanic Clause", // Once per fight: chooses a law such as no healing, no retreat, or no ranged attacks for one round; violators take 4d8 psychic damage.
    "World-Stamp", // 15 ft radius circle, Str save against 21, 12d10 bludgeoning damage and knocked prone if save unsuccessful, half if successful.
  ],
  initiativeBonus: 2,
  speedFeet: 35,
  behavior: "melee",
  token: "T",
  tokenArt: "assets/tokens/contract-titan.jpg",
  flying: false,
});


window.DungeonContent.register("monsters", "crownedArchdevilAvatar", {
  name: "Crowned Archdevil Avatar",
  role: "Category 10 final devil boss",
  sizeSquares: 3,
  tags: ["fiend", "devil", "boss", "archdevil", "avatar"],
  maxHp: 575,
  category: 10,
  xp: 13675,
  ac: 23,
  attackBonus: 14,
  damage: {
    count: 8,
    sides: 10,
    bonus: 10,
    type: "fire",
    attackType: "spell",
    label: "8d10 + 10 fire",
    range: {
      kind: "ranged",
      normal: 120,
      long: 360,
      feet: 120,
    },
  },
  damageResistances: ["cold", "necrotic", "lightning", "bludgeoning", "piercing", "slashing", "psychic", "radiant"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned", "charmed", "frightened", "restrained"],
  specialAbility: [
    "Crown of the Ninefold Pact", // Once per fight: all enemies make Cha save against 22; on failure, take 14d8 psychic damage and are frightened for one turn, half damage on success.
    "Infernal Dominion", // At half HP: changes the battlefield into hellish ground; enemies take 2d8 fire damage when they start their turn in open terrain.
    "Final Bargain", // When first reduced to 0 HP: instead remains at 1 HP and offers a pact; if refused, detonates in a 30 ft fire burst.
  ],
  initiativeBonus: 7,
  speedFeet: 40,
  behavior: "rangedKiter",
  token: "A",
  tokenArt: "assets/tokens/crowned-archdevil-avatar.jpg",
  flying: false,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});


})();
