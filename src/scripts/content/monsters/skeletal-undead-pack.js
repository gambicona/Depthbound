(() => {

/* ============================================================
 * SKELETAL UNDEAD PACK
 * Consolidated from the old one-monster files.
 * ============================================================ */

window.DungeonContent.register("monsters", "armoryHaunt", {
  name: "Armory Haunt",
  role: "Possessed weapon",
  maxHp: 15,
  category: 1,
  xp: 75,
  ac: 15,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 6,
    bonus: 2,
    type: "slashing",
    label: "1d6 + 2 slashing"
  },
  damageImmunities: [
    "poison",
    "psychic"
  ],
  initiativeBonus: 3,
  speedFeet: 30,
  flying: true,
  behavior: "melee",
  token: "W",
  tokenArt: "assets/tokens/armory-haunt.jpg",
  tags: [
    "undead",
    "skeletal",
    "old-guardroom",
    "caster",
    "haunt",
    "flying",
    "slashing"
  ]
});

window.DungeonContent.register("monsters", "ashBarracksVeteran", {
  name: "Ash Barracks Veteran",
  role: "Experienced undead soldier",
  maxHp: 19,
  category: 2,
  xp: 100,
  ac: 15,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 8,
    bonus: 2,
    type: "slashing",
    label: "1d8 + 2 slashing"
  },
  damageVulnerabilities: [
    "bludgeoning"
  ],
  damageImmunities: [
    "poison"
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "melee",
  token: "V",
  tokenArt: "assets/tokens/ash-barracks-veteran.jpg",
  equipment: {
    mainHand: "longsword",
    offHand: "shield"
  },
  inventory: {
    money: {
      cp: 0,
      sp: 2,
      gp: 0
    },
    items: [
      "longsword",
      "shield"
    ]
  },
  extraLoot: [
    {
      kind: "randomEquipment"
    }
  ],
  tags: [
    "undead",
    "skeletal",
    "old-guardroom",
    "soldier",
    "slashing"
  ]
});

window.DungeonContent.register("monsters", "bannerKnight", {
  name: "Banner Knight",
  role: "Undead guardroom champion",
  maxHp: 28,
  category: 2,
  xp: 180,
  ac: 15,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 8,
    bonus: 3,
    type: "slashing",
    label: "1d8 + 3 slashing"
  },
  damageVulnerabilities: [
    "bludgeoning"
  ],
  damageImmunities: [
    "poison"
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "B",
  tokenArt: "assets/tokens/banner-knight.jpg",
  equipment: {
    mainHand: "longsword",
    offHand: "shield"
  },
  inventory: {
    money: {
      cp: 0,
      sp: 5,
      gp: 1
    },
    items: [
      "longsword",
      "shield"
    ]
  },
  extraLoot: [
    {
      kind: "randomEquipment"
    }
  ],
  tags: [
    "undead",
    "skeletal",
    "old-guardroom",
    "boss",
    "soldier",
    "slashing"
  ]
});

window.DungeonContent.register("monsters", "barricadeCrossbowman", {
  name: "Barricade Crossbowman",
  role: "Armored ranged skeleton",
  maxHp: 14,
  category: 1,
  xp: 75,
  ac: 14,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 8,
    bonus: 1,
    type: "piercing",
    label: "1d8 + 1 piercing",
    range: {
      kind: "ranged",
      normal: 80,
      long: 320,
      feet: 80
    }
  },
  damageVulnerabilities: [
    "bludgeoning"
  ],
  damageImmunities: [
    "poison"
  ],
  initiativeBonus: 1,
  speedFeet: 25,
  behavior: "rangedKiter",
  token: "X",
  tokenArt: "assets/tokens/barricade-crossbowman.jpg",
  equipment: {
    mainHand: "light-crossbow",
    offHand: null,
    quiver: "bolts-20"
  },
  inventory: {
    money: {
      cp: 0,
      sp: 0,
      gp: 0
    },
    items: [
      "light-crossbow",
      "bolts-20"
    ]
  },
  extraLoot: [
    {
      kind: "item",
      itemId: "bolts-20",
      quantityDice: {
        count: 1,
        sides: 8
      }
    }
  ],
  tags: [
    "undead",
    "skeletal",
    "old-guardroom",
    "archer",
    "ranged",
    "piercing"
  ]
});

window.DungeonContent.register("monsters", "blackArrowSentry", {
  name: "Black Arrow Sentry",
  role: "Elite undead archer",
  maxHp: 17,
  category: 2,
  xp: 120,
  ac: 14,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 8,
    bonus: 2,
    type: "piercing",
    label: "1d8 + 2 piercing",
    range: {
      kind: "ranged",
      normal: 100,
      long: 400,
      feet: 100
    }
  },
  damageVulnerabilities: [
    "bludgeoning"
  ],
  damageImmunities: [
    "poison"
  ],
  initiativeBonus: 3,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "N",
  tokenArt: "assets/tokens/black-arrow-sentry.jpg",
  abilityMods: {
    dex: 3,
    str: 0
  },
  equipment: {
    mainHand: "longbow",
    offHand: null,
    quiver: "arrows-20"
  },
  inventory: {
    money: {
      cp: 0,
      sp: 2,
      gp: 0
    },
    items: [
      "longbow",
      "arrows-20"
    ]
  },
  extraLoot: [
    {
      kind: "item",
      itemId: "arrows-20",
      quantityDice: {
        count: 1,
        sides: 12
      }
    }
  ],
  tags: [
    "undead",
    "skeletal",
    "old-guardroom",
    "archer",
    "ranged",
    "piercing"
  ]
});

window.DungeonContent.register("monsters", "boneLockbreaker", {
  name: "Bone Lockbreaker",
  role: "Fast skeletal skirmisher",
  maxHp: 15,
  category: 2,
  xp: 80,
  ac: 14,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 6,
    bonus: 3,
    type: "piercing",
    label: "1d6 + 3 piercing"
  },
  damageVulnerabilities: [
    "bludgeoning"
  ],
  damageImmunities: [
    "poison"
  ],
  initiativeBonus: 3,
  speedFeet: 35,
  behavior: "melee",
  token: "K",
  tokenArt: "assets/tokens/bone-lockbreaker.jpg",
  equipment: {
    mainHand: "shortsword",
    offHand: null
  },
  inventory: {
    money: {
      cp: 3,
      sp: 1,
      gp: 0
    },
    items: [
      "shortsword"
    ]
  },
  tags: [
    "undead",
    "skeletal",
    "old-guardroom",
    "piercing"
  ]
});

window.DungeonContent.register("monsters", "boneMaulBrute", {
  name: "Bone-Maul Brute",
  role: "Massive skeletal crusher",
  sizeSquares: 2,
  maxHp: 42,
  category: 3,
  xp: 250,
  ac: 14,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 12,
    bonus: 4,
    type: "bludgeoning",
    label: "1d12 + 4 bludgeoning"
  },
  damageVulnerabilities: [
    "bludgeoning"
  ],
  damageImmunities: [
    "poison"
  ],
  initiativeBonus: 0,
  speedFeet: 25,
  behavior: "melee",
  token: "M",
  tokenArt: "assets/tokens/bone-maul-brute.jpg",
  equipment: {
    mainHand: "maul",
    offHand: null
  },
  inventory: {
    money: {
      cp: 0,
      sp: 3,
      gp: 2
    },
    items: [
      "maul"
    ]
  },
  extraLoot: [
    {
      kind: "randomEquipment"
    }
  ],
  tags: [
    "undead",
    "skeletal",
    "old-guardroom",
    "brute",
    "bludgeoning"
  ]
});

window.DungeonContent.register("monsters", "boneRecruit", {
  name: "Bone Recruit",
  role: "Weak skeletal guard",
  maxHp: 5,
  category: 1,
  xp: 25,
  ac: 12,
  attackBonus: 3,
  damage: {
    count: 1,
    sides: 4,
    bonus: 1,
    type: "bludgeoning",
    label: "1d4 + 1 bludgeoning"
  },
  damageVulnerabilities: [
    "bludgeoning"
  ],
  damageImmunities: [
    "poison"
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "swarm",
  token: "R",
  tokenArt: "assets/tokens/bone-recruit.jpg",
  tags: [
    "undead",
    "skeletal",
    "old-guardroom",
    "soldier",
    "bludgeoning"
  ]
});

window.DungeonContent.register("monsters", "cryptExecutioner", {
  name: "Crypt Executioner",
  role: "Heavy undead striker",
  maxHp: 21,
  category: 2,
  xp: 130,
  ac: 13,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 10,
    bonus: 2,
    type: "slashing",
    label: "1d10 + 2 slashing"
  },
  damageVulnerabilities: [
    "bludgeoning"
  ],
  damageImmunities: [
    "poison"
  ],
  initiativeBonus: 0,
  speedFeet: 25,
  behavior: "melee",
  token: "E",
  tokenArt: "assets/tokens/crypt-executioner.jpg",
  equipment: {
    mainHand: "greataxe",
    offHand: null
  },
  inventory: {
    money: {
      cp: 0,
      sp: 2,
      gp: 0
    },
    items: [
      "greataxe"
    ]
  },
  extraLoot: [
    {
      kind: "randomEquipment"
    }
  ],
  tags: [
    "undead",
    "skeletal",
    "old-guardroom",
    "brute",
    "slashing"
  ]
});

window.DungeonContent.register("monsters", "cryptGuard", {
  name: "Crypt Guard",
  role: "Armored skeleton",
  maxHp: 13,
  category: 1,
  xp: 50,
  ac: 13,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 6,
    bonus: 2,
    type: "piercing",
    label: "1d6 + 2 piercing"
  },
  damageVulnerabilities: [
    "bludgeoning"
  ],
  damageImmunities: [
    "poison"
  ],
  initiativeBonus: 2,
  speedFeet: 25,
  behavior: "melee",
  token: "C",
  tokenArt: "assets/tokens/crypt-guard.jpg",
  tags: [
    "undead",
    "skeletal",
    "old-guardroom",
    "soldier",
    "piercing"
  ]
});

window.DungeonContent.register("monsters", "graveBannerCastellan", {
  name: "Grave-Banner Castellan",
  role: "Undead fortress captain",
  maxHp: 54,
  category: 3,
  xp: 350,
  ac: 16,
  attackBonus: 7,
  damage: {
    count: 1,
    sides: 10,
    bonus: 5,
    type: "slashing",
    label: "1d10 + 5 slashing"
  },
  damageVulnerabilities: [
    "bludgeoning"
  ],
  damageImmunities: [
    "poison"
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "K",
  tokenArt: "assets/tokens/grave-banner-castellan.jpg",
  equipment: {
    mainHand: "greatsword",
    offHand: null
  },
  inventory: {
    money: {
      cp: 0,
      sp: 8,
      gp: 4
    },
    items: [
      "greatsword"
    ]
  },
  extraLoot: [
    {
      kind: "randomEquipment"
    }
  ],
  tags: [
    "undead",
    "skeletal",
    "old-guardroom",
    "boss",
    "slashing"
  ]
});

window.DungeonContent.register("monsters", "gravePikeman", {
  name: "Grave Pikeman",
  role: "Undead reach soldier",
  maxHp: 16,
  category: 2,
  xp: 80,
  ac: 14,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 8,
    bonus: 2,
    type: "piercing",
    label: "1d8 + 2 piercing",
    range: {
      kind: "melee",
      feet: 10
    }
  },
  damageVulnerabilities: [
    "bludgeoning"
  ],
  damageImmunities: [
    "poison"
  ],
  initiativeBonus: 1,
  speedFeet: 25,
  behavior: "melee",
  token: "P",
  tokenArt: "assets/tokens/grave-pikeman.jpg",
  equipment: {
    mainHand: "pike",
    offHand: null
  },
  inventory: {
    money: {
      cp: 0,
      sp: 1,
      gp: 0
    },
    items: [
      "pike"
    ]
  },
  tags: [
    "undead",
    "skeletal",
    "old-guardroom",
    "soldier",
    "piercing"
  ]
});

window.DungeonContent.register("monsters", "graveplateSentinel", {
  name: "Graveplate Sentinel",
  role: "Heavy undead guard",
  maxHp: 36,
  category: 3,
  xp: 220,
  ac: 16,
  attackBonus: 6,
  damage: {
    count: 1,
    sides: 10,
    bonus: 3,
    type: "slashing",
    label: "1d10 + 3 slashing"
  },
  damageVulnerabilities: [
    "bludgeoning"
  ],
  damageImmunities: [
    "poison"
  ],
  initiativeBonus: 1,
  speedFeet: 25,
  behavior: "melee",
  token: "S",
  tokenArt: "assets/tokens/graveplate-sentinel.jpg",
  equipment: {
    mainHand: "greatsword",
    offHand: null
  },
  inventory: {
    money: {
      cp: 0,
      sp: 6,
      gp: 1
    },
    items: [
      "greatsword"
    ]
  },
  extraLoot: [
    {
      kind: "randomEquipment"
    }
  ],
  tags: [
    "undead",
    "skeletal",
    "old-guardroom",
    "soldier",
    "slashing"
  ]
});

window.DungeonContent.register("monsters", "guardroomCommander", {
  name: "Guardroom Commander",
  role: "Undead officer",
  maxHp: 22,
  category: 1,
  xp: 100,
  ac: 15,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 8,
    bonus: 3,
    type: "slashing",
    label: "1d8 + 3 slashing"
  },
  damageVulnerabilities: [
    "bludgeoning"
  ],
  damageImmunities: [
    "poison"
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "B",
  tokenArt: "assets/tokens/guardroom-commander.jpg",
  extraLoot: [
    {
      kind: "randomEquipment"
    }
  ],
  tags: [
    "undead",
    "skeletal",
    "old-guardroom",
    "boss",
    "slashing"
  ]
});

window.DungeonContent.register("monsters", "guardroomHound", {
  name: "Guardroom Hound",
  role: "Undead hunting dog",
  maxHp: 5,
  category: 1,
  xp: 60,
  ac: 13,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 6,
    bonus: 2,
    type: "piercing",
    label: "1d6 + 2 piercing"
  },
  damageVulnerabilities: [
    "bludgeoning"
  ],
  damageImmunities: [
    "poison"
  ],
  initiativeBonus: 3,
  speedFeet: 40,
  behavior: "swarm",
  token: "H",
  tokenArt: "assets/tokens/guardroom-hound.jpg",
  tags: [
    "undead",
    "skeletal",
    "old-guardroom",
    "hound",
    "piercing"
  ]
});

window.DungeonContent.register("monsters", "hollowMarksman", {
  name: "Hollow Marksman",
  role: "Veteran skeletal archer",
  maxHp: 14,
  category: 2,
  xp: 80,
  ac: 13,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 8,
    bonus: 1,
    type: "piercing",
    label: "1d8 + 1 piercing",
    range: {
      kind: "ranged",
      normal: 80,
      long: 320,
      feet: 80
    }
  },
  damageVulnerabilities: [
    "bludgeoning"
  ],
  damageImmunities: [
    "poison"
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "M",
  tokenArt: "assets/tokens/hollow-marksman.jpg",
  abilityMods: {
    dex: 2,
    str: 0
  },
  equipment: {
    mainHand: "longbow",
    offHand: null,
    quiver: "arrows-20"
  },
  inventory: {
    money: {
      cp: 0,
      sp: 1,
      gp: 0
    },
    items: [
      "longbow",
      "arrows-20"
    ]
  },
  extraLoot: [
    {
      kind: "item",
      itemId: "arrows-20",
      quantityDice: {
        count: 1,
        sides: 10
      }
    }
  ],
  tags: [
    "undead",
    "skeletal",
    "old-guardroom",
    "archer",
    "ranged",
    "soldier",
    "piercing"
  ]
});

window.DungeonContent.register("monsters", "lanternHexguard", {
  name: "Lantern Hexguard",
  role: "Undead arcane sentry",
  maxHp: 34,
  category: 3,
  xp: 240,
  ac: 15,
  attackBonus: 6,
  damage: {
    count: 1,
    sides: 8,
    bonus: 4,
    type: "necrotic",
    label: "1d8 + 4 necrotic",
    range: {
      kind: "ranged",
      normal: 60,
      long: 180,
      feet: 60
    }
  },
  damageImmunities: [
    "poison",
    "psychic"
  ],
  initiativeBonus: 3,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "L",
  tokenArt: "assets/tokens/lantern-hexguard.jpg",
  extraLoot: [
    {
      kind: "randomEquipment"
    }
  ],
  tags: [
    "undead",
    "skeletal",
    "old-guardroom",
    "archer",
    "ranged",
    "caster",
    "necrotic"
  ]
});

window.DungeonContent.register("monsters", "lanternWraith", {
  name: "Lantern Wraith",
  role: "Restless magical sentry",
  maxHp: 18,
  category: 2,
  xp: 120,
  ac: 14,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 6,
    bonus: 3,
    type: "necrotic",
    label: "1d6 + 3 necrotic",
    range: {
      kind: "ranged",
      normal: 50,
      long: 150,
      feet: 50
    }
  },
  damageImmunities: [
    "poison",
    "psychic"
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  flying: true,
  behavior: "rangedKiter",
  token: "L",
  tokenArt: "assets/tokens/lantern-wraith.jpg",
  tags: [
    "undead",
    "skeletal",
    "old-guardroom",
    "archer",
    "ranged",
    "caster",
    "haunt",
    "flying",
    "necrotic"
  ]
});

window.DungeonContent.register("monsters", "oathboundJailer", {
  name: "Oathbound Jailer",
  role: "Undead prison guard",
  maxHp: 24,
  category: 2,
  xp: 140,
  ac: 15,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 8,
    bonus: 2,
    type: "bludgeoning",
    weaponName: "Jailer's Chain",
    label: "1d8 + 2 bludgeoning",
    range: {
      kind: "melee",
      feet: 10
    }
  },
  damageVulnerabilities: [
    "bludgeoning"
  ],
  damageImmunities: [
    "poison"
  ],
  initiativeBonus: 1,
  speedFeet: 25,
  behavior: "melee",
  token: "J",
  tokenArt: "assets/tokens/oathbound-jailer.jpg",
  equipment: {
    mainHand: "chain",
    offHand: null
  },
  inventory: {
    money: {
      cp: 0,
      sp: 3,
      gp: 0
    },
    items: [
      "chain"
    ]
  },
  extraLoot: [
    {
      kind: "randomEquipment"
    }
  ],
  tags: [
    "undead",
    "skeletal",
    "old-guardroom",
    "soldier",
    "jailer",
    "bludgeoning"
  ]
});

window.DungeonContent.register("monsters", "oathscarDuelist", {
  name: "Oathscar Duelist",
  role: "Undead swordmaster",
  maxHp: 32,
  category: 3,
  xp: 230,
  ac: 15,
  attackBonus: 7,
  damage: {
    count: 1,
    sides: 8,
    bonus: 4,
    type: "piercing",
    label: "1d8 + 4 piercing"
  },
  damageVulnerabilities: [
    "bludgeoning"
  ],
  damageImmunities: [
    "poison"
  ],
  initiativeBonus: 4,
  speedFeet: 35,
  behavior: "melee",
  token: "D",
  tokenArt: "assets/tokens/oathscar-duelist.jpg",
  equipment: {
    mainHand: "rapier",
    offHand: null
  },
  inventory: {
    money: {
      cp: 0,
      sp: 4,
      gp: 2
    },
    items: [
      "rapier"
    ]
  },
  extraLoot: [
    {
      kind: "randomEquipment"
    }
  ],
  tags: [
    "undead",
    "skeletal",
    "old-guardroom",
    "piercing"
  ]
});

window.DungeonContent.register("monsters", "oldSergeant", {
  name: "Old Sergeant",
  role: "Veteran undead guard",
  maxHp: 20,
  category: 1,
  xp: 100,
  ac: 15,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 8,
    bonus: 2,
    type: "slashing",
    label: "1d8 + 2 slashing"
  },
  damageVulnerabilities: [
    "bludgeoning"
  ],
  damageImmunities: [
    "poison"
  ],
  initiativeBonus: 1,
  speedFeet: 25,
  behavior: "melee",
  token: "G",
  tokenArt: "assets/tokens/old-sergeant.jpg",
  equipment: {
    mainHand: "longsword",
    offHand: "shield"
  },
  inventory: {
    money: {
      cp: 0,
      sp: 1,
      gp: 0
    },
    items: [
      "longsword",
      "shield"
    ]
  },
  extraLoot: [
    {
      kind: "randomEquipment"
    }
  ],
  tags: [
    "undead",
    "skeletal",
    "old-guardroom",
    "boss",
    "soldier",
    "slashing"
  ]
});

window.DungeonContent.register("monsters", "restlessJailer", {
  name: "Restless Jailer",
  role: "Chain-wielding undead",
  maxHp: 18,
  category: 1,
  xp: 90,
  ac: 14,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 8,
    bonus: 2,
    type: "bludgeoning",
    weaponName: "Jailer's Chain",
    label: "1d8 + 2 bludgeoning",
    range: {
      kind: "melee",
      feet: 10
    }
  },
  damageVulnerabilities: [
    "bludgeoning"
  ],
  damageImmunities: [
    "poison"
  ],
  initiativeBonus: 1,
  speedFeet: 25,
  behavior: "melee",
  token: "J",
  tokenArt: "assets/tokens/restless-jailer.jpg",
  extraLoot: [
    {
      kind: "randomEquipment"
    }
  ],
  tags: [
    "undead",
    "skeletal",
    "old-guardroom",
    "jailer",
    "bludgeoning"
  ]
});

window.DungeonContent.register("monsters", "ruinArbalester", {
  name: "Ruin Arbalester",
  role: "Undead heavy crossbowman",
  maxHp: 30,
  category: 3,
  xp: 220,
  ac: 15,
  attackBonus: 6,
  damage: {
    count: 1,
    sides: 10,
    bonus: 3,
    type: "piercing",
    label: "1d10 + 3 piercing",
    range: {
      kind: "ranged",
      normal: 100,
      long: 400,
      feet: 100
    }
  },
  damageVulnerabilities: [
    "bludgeoning"
  ],
  damageImmunities: [
    "poison"
  ],
  initiativeBonus: 2,
  speedFeet: 25,
  behavior: "rangedKiter",
  token: "A",
  tokenArt: "assets/tokens/ruin-arbalester.jpg",
  abilityMods: {
    dex: 3,
    str: 0
  },
  equipment: {
    mainHand: "heavy-crossbow",
    offHand: null,
    quiver: "bolts-20"
  },
  inventory: {
    money: {
      cp: 0,
      sp: 5,
      gp: 1
    },
    items: [
      "heavy-crossbow",
      "bolts-20"
    ]
  },
  extraLoot: [
    {
      kind: "item",
      itemId: "bolts-20",
      quantityDice: {
        count: 1,
        sides: 10
      }
    }
  ],
  tags: [
    "undead",
    "skeletal",
    "old-guardroom",
    "archer",
    "ranged",
    "piercing"
  ]
});

window.DungeonContent.register("monsters", "rustedHalberdier", {
  name: "Rusted Halberdier",
  role: "Heavy undead guard",
  maxHp: 18,
  category: 2,
  xp: 90,
  ac: 14,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 10,
    bonus: 1,
    type: "slashing",
    label: "1d10 + 1 slashing",
    range: {
      kind: "melee",
      feet: 10
    }
  },
  damageVulnerabilities: [
    "bludgeoning"
  ],
  damageImmunities: [
    "poison"
  ],
  initiativeBonus: 0,
  speedFeet: 25,
  behavior: "melee",
  token: "H",
  tokenArt: "assets/tokens/rusted-halberdier.jpg",
  equipment: {
    mainHand: "halberd",
    offHand: null
  },
  inventory: {
    money: {
      cp: 0,
      sp: 1,
      gp: 0
    },
    items: [
      "halberd"
    ]
  },
  tags: [
    "undead",
    "skeletal",
    "old-guardroom",
    "soldier",
    "slashing"
  ]
});

window.DungeonContent.register("monsters", "rustedShieldbearer", {
  name: "Rusted Shieldbearer",
  role: "Defensive skeleton",
  maxHp: 16,
  category: 1,
  xp: 75,
  ac: 16,
  attackBonus: 3,
  damage: {
    count: 1,
    sides: 4,
    bonus: 1,
    type: "bludgeoning",
    label: "1d4 + 1 bludgeoning"
  },
  damageVulnerabilities: [
    "bludgeoning"
  ],
  damageImmunities: [
    "poison"
  ],
  initiativeBonus: 0,
  speedFeet: 20,
  behavior: "melee",
  token: "S",
  tokenArt: "assets/tokens/rusted-shieldbearer.jpg",
  equipment: {
    mainHand: "mace",
    offHand: "shield"
  },
  inventory: {
    money: {
      cp: 0,
      sp: 0,
      gp: 0
    },
    items: [
      "mace",
      "shield"
    ]
  },
  tags: [
    "undead",
    "skeletal",
    "old-guardroom",
    "shield",
    "bludgeoning"
  ]
});

window.DungeonContent.register("monsters", "skeletalSpearman", {
  name: "Skeletal Spearman",
  role: "Reach guard",
  maxHp: 14,
  category: 1,
  xp: 60,
  ac: 13,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 6,
    bonus: 2,
    type: "piercing",
    label: "1d6 + 2 piercing",
    range: {
      kind: "melee",
      feet: 10
    }
  },
  damageVulnerabilities: [
    "bludgeoning"
  ],
  damageImmunities: [
    "poison"
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "melee",
  token: "P",
  tokenArt: "assets/tokens/skeletal-spearman.jpg",
  equipment: {
    mainHand: "spear",
    offHand: null
  },
  inventory: {
    money: {
      cp: 0,
      sp: 0,
      gp: 0
    },
    items: [
      "spear"
    ]
  },
  tags: [
    "undead",
    "skeletal",
    "old-guardroom",
    "soldier",
    "piercing"
  ]
});

window.DungeonContent.register("monsters", "skeletonArcher", {
  name: "Skeleton Archer",
  role: "Bow-armed skeleton",
  maxHp: 9,
  category: 1,
  xp: 50,
  ac: 12,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 6,
    bonus: 2,
    type: "piercing",
    label: "1d6 + 2 piercing",
    range: {
      kind: "ranged",
      normal: 80,
      long: 320,
      feet: 80
    }
  },
  damageVulnerabilities: [
    "bludgeoning"
  ],
  damageImmunities: [
    "poison"
  ],
  initiativeBonus: 2,
  speedFeet: 25,
  behavior: "rangedKiter",
  token: "A",
  tokenArt: "assets/tokens/skeleton-archer.jpg",
  abilityMods: {
    dex: 2,
    str: 0
  },
  equipment: {
    mainHand: "shortbow",
    offHand: null,
    quiver: "arrows-20"
  },
  inventory: {
    money: {
      cp: 0,
      sp: 0,
      gp: 0
    },
    items: [
      "shortbow",
      "arrows-20"
    ]
  },
  extraLoot: [
    {
      kind: "item",
      itemId: "arrows-20",
      quantityDice: {
        count: 1,
        sides: 10
      }
    }
  ],
  tags: [
    "undead",
    "skeletal",
    "old-guardroom",
    "archer",
    "ranged",
    "piercing"
  ]
});

window.DungeonContent.register("monsters", "towerShieldRemnant", {
  name: "Tower Shield Remnant",
  role: "Heavily armored undead",
  maxHp: 22,
  category: 2,
  xp: 120,
  ac: 16,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 6,
    bonus: 2,
    type: "bludgeoning",
    label: "1d6 + 2 bludgeoning"
  },
  damageVulnerabilities: [
    "bludgeoning"
  ],
  damageImmunities: [
    "poison"
  ],
  initiativeBonus: 0,
  speedFeet: 20,
  behavior: "melee",
  token: "T",
  tokenArt: "assets/tokens/tower-shield-remnant.jpg",
  equipment: {
    mainHand: "mace",
    offHand: "tower-shield"
  },
  inventory: {
    money: {
      cp: 0,
      sp: 2,
      gp: 0
    },
    items: [
      "mace",
      "tower-shield"
    ]
  },
  tags: [
    "undead",
    "skeletal",
    "old-guardroom",
    "shield",
    "bludgeoning"
  ]
});

window.DungeonContent.register("monsters", "wardenOfTheOldWatch", {
  name: "Warden of the Old Watch",
  role: "Ancient undead commander",
  maxHp: 34,
  category: 2,
  xp: 225,
  ac: 15,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 8,
    bonus: 3,
    type: "slashing",
    label: "1d8 + 3 slashing"
  },
  damageVulnerabilities: [
    "bludgeoning"
  ],
  damageImmunities: [
    "poison"
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "W",
  tokenArt: "assets/tokens/warden-of-the-old-watch.jpg",
  equipment: {
    mainHand: "battleaxe",
    offHand: "shield"
  },
  inventory: {
    money: {
      cp: 0,
      sp: 8,
      gp: 2
    },
    items: [
      "battleaxe",
      "shield"
    ]
  },
  extraLoot: [
    {
      kind: "randomEquipment"
    }
  ],
  tags: [
    "undead",
    "skeletal",
    "old-guardroom",
    "boss",
    "slashing"
  ]
});

})();
