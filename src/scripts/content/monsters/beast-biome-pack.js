(() => {
  window.MonsterSpecialAbilityNotes = {
    ...(window.MonsterSpecialAbilityNotes || {}),
    Charge: "If the monster moved at least 20 ft before attacking, add the listed bonus damage on hit.",
    Pounce: "If the monster moved at least 20 ft before attacking, the target makes a Str save or is pushed 5 ft.",
    VenomBite: "On hit: Con save. On failure, the target takes extra poison damage.",
    WebSnare: "Ranged special attack. Dex save. On failure, target speed becomes 0 until end of next turn.",
    BurrowAmbush: "If this monster starts combat hidden or underground, it gains advantage or +2 to its first attack.",
    ShellGuard: "Once per fight: gain +2 AC until the start of its next turn.",
    ThickHide: "Passive flavor ability. This monster has the listed resistance.",
    BloodFrenzy: "When below half HP, gain +1 attack bonus.",
    FrostHide: "Passive flavor ability. This monster has the listed cold resistance.",
    MarshAmbush: "First attack against a target in difficult terrain gains +2 to hit.",
    SewerSkulk: "This monster has better movement and hiding in urban ruins or sewers.",
    Aquatic: "This monster is intended for water rooms and should not be slowed by water.",
    RockClimber: "This monster is intended for cliffs, ledges, and mountain rooms.",
    Stampede: "15 ft line, Str save. On failure, 2d6/3d6/4d6 bludgeoning damage by category and pushed 5 ft.",
    BossRoar: "Once per fight: 10 ft radius, Wis save. On failure, target suffers -1 attack penalty until end of next turn.",
    SelfHeal: "Once per fight: restore a small amount of HP when below half HP.",
  };

  window.BeastBiomeMonsterIds = window.BeastBiomeMonsterIds || {};


  /* ============================================================
   * BEAST + DESERT
   * ============================================================ */

  // Category 1
  window.DungeonContent.register("monsters", "duneJackal", {
    name: "Dune Jackal",
    role: "Small desert predator",
    tags: [
      "beast",
      "desert",
      "jackal"
    ],
    maxHp: 9,
    category: 1,
    xp: 40,
    ac: 13,
    attackBonus: 4,
    damage: {
      count: 1,
      sides: 4,
      bonus: 2,
      type: "piercing",
      attackType: "weapon",
      label: "1d4 + 2 piercing"
    },
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "D",

    tokenArt: "assets/tokens/dune-jackal.jpg",
    specialAbility: [
      "Pounce"
    ]
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("duneJackal");

  window.DungeonContent.register("monsters", "sandScorpion", {
    name: "Sand Scorpion",
    role: "Venomous desert beast",
    tags: [
      "beast",
      "desert",
      "scorpion",
      "poison"
    ],
    maxHp: 12,
    category: 1,
    xp: 50,
    ac: 13,
    attackBonus: 4,
    damage: {
      count: 1,
      sides: 6,
      bonus: 2,
      type: "piercing",
      attackType: "weapon",
      label: "1d6 + 2 piercing"
    },
    initiativeBonus: 2,
    speedFeet: 35,
    behavior: "melee",
    token: "S",


    tokenArt: "assets/tokens/sand-scorpion.jpg",
    damageResistances: [
      "poison"
    ],
    specialAbility: [
      "VenomBite"
    ]
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("sandScorpion");

  window.DungeonContent.register("monsters", "dustHyena", {
    name: "Dust Hyena",
    role: "Lean desert scavenger",
    tags: [
      "beast",
      "desert",
      "hyena"
    ],
    maxHp: 12,
    category: 1,
    xp: 50,
    ac: 13,
    attackBonus: 4,
    damage: {
      count: 1,
      sides: 6,
      bonus: 2,
      type: "slashing",
      attackType: "weapon",
      label: "1d6 + 2 slashing"
    },
    initiativeBonus: 2,
    speedFeet: 35,
    behavior: "melee",
    token: "D",
    tokenArt: "assets/tokens/dust-hyena.jpg",
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("dustHyena");

  window.DungeonContent.register("monsters", "sunbackTortoise", {
    name: "Sunback Tortoise",
    role: "Armored desert beast",
    tags: [
      "beast",
      "desert",
      "tortoise"
    ],
    maxHp: 18,
    category: 1,
    xp: 65,
    ac: 14,
    attackBonus: 3,
    damage: {
      count: 1,
      sides: 6,
      bonus: 2,
      type: "bludgeoning",
      attackType: "weapon",
      label: "1d6 + 2 bludgeoning"
    },
    initiativeBonus: 0,
    speedFeet: 25,
    behavior: "melee",
    token: "S",


    tokenArt: "assets/tokens/sunback-tortoise.jpg",
    specialAbility: [
      "ShellGuard"
    ]
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("sunbackTortoise");

  window.DungeonContent.register("monsters", "oldDuneBoar", {
    name: "Old Dune Boar",
    role: "Category 1 desert beast boss",
    tags: [
      "beast",
      "desert",
      "boar",
      "boss"
    ],
    maxHp: 28,
    category: 1,
    xp: 120,
    ac: 13,
    attackBonus: 5,
    damage: {
      count: 1,
      sides: 8,
      bonus: 3,
      type: "piercing",
      attackType: "weapon",
      label: "1d8 + 3 piercing"
    },
    initiativeBonus: 1,
    speedFeet: 35,
    behavior: "melee",
    token: "O",


    tokenArt: "assets/tokens/old-dune-boar.jpg",
    specialAbility: [
      "Charge",
      "BossRoar"
    ],
    extraLoot: [
      {
        kind: "randomEquipment"
      }
    ]
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("oldDuneBoar");

  // Category 2
  window.DungeonContent.register("monsters", "glassFangViper", {
    name: "Glass-Fang Viper",
    role: "Fast venomous desert hunter",
    tags: [
      "beast",
      "desert",
      "snake",
      "poison"
    ],
    maxHp: 22,
    category: 2,
    xp: 130,
    ac: 15,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 8,
      bonus: 3,
      type: "piercing",
      attackType: "weapon",
      label: "1d8 + 3 piercing"
    },
    initiativeBonus: 4,
    speedFeet: 45,
    behavior: "melee",
    token: "G",

    tokenArt: "assets/tokens/glass-fang-viper.jpg",
    damageResistances: [
      "poison"
    ],
    specialAbility: [
      "VenomBite"
    ]
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("glassFangViper");

  window.DungeonContent.register("monsters", "duneLion", {
    name: "Dune Lion",
    role: "Large desert stalker",
    tags: [
      "beast",
      "desert",
      "cat"
    ],
    maxHp: 25,
    category: 2,
    xp: 140,
    ac: 14,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 8,
      bonus: 3,
      type: "slashing",
      attackType: "weapon",
      label: "1d8 + 3 slashing"
    },
    initiativeBonus: 2,
    speedFeet: 35,
    behavior: "melee",
    token: "D",


    tokenArt: "assets/tokens/dune-lion.jpg",
    specialAbility: [
      "Pounce"
    ]
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("duneLion");

  window.DungeonContent.register("monsters", "ashbackCamel", {
    name: "Ashback Camel",
    role: "Heavy desert charger",
    tags: [
      "beast",
      "desert",
      "camel"
    ],
    maxHp: 32,
    category: 2,
    xp: 155,
    ac: 13,
    attackBonus: 5,
    damage: {
      count: 1,
      sides: 10,
      bonus: 3,
      type: "bludgeoning",
      attackType: "weapon",
      label: "1d10 + 3 bludgeoning"
    },
    initiativeBonus: 0,
    speedFeet: 30,
    behavior: "melee",
    token: "A",


    tokenArt: "assets/tokens/ashback-camel.jpg",
    specialAbility: [
      "Charge"
    ]
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("ashbackCamel");

  window.DungeonContent.register("monsters", "spineTailMonitor", {
    name: "Spine-Tail Monitor",
    role: "Armored desert lizard",
    tags: [
      "beast",
      "desert",
      "lizard"
    ],
    maxHp: 36,
    category: 2,
    xp: 165,
    ac: 16,
    attackBonus: 5,
    damage: {
      count: 1,
      sides: 8,
      bonus: 3,
      type: "piercing",
      attackType: "weapon",
      label: "1d8 + 3 piercing"
    },
    initiativeBonus: 0,
    speedFeet: 25,
    behavior: "melee",
    token: "S",


    tokenArt: "assets/tokens/spine-tail-monitor.jpg",
    damageResistances: [
      "slashing"
    ],
    specialAbility: [
      "ThickHide"
    ]
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("spineTailMonitor");

  window.DungeonContent.register("monsters", "scarredSandManticore", {
    name: "Scarred Sand Manticore",
    role: "Category 2 desert beast boss",
    tags: [
      "beast",
      "desert",
      "manticore",
      "flying",
      "boss"
    ],
    maxHp: 46,
    category: 2,
    xp: 250,
    ac: 15,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 10,
      bonus: 4,
      type: "piercing",
      attackType: "weapon",
      label: "1d10 + 4 piercing"
    },
    initiativeBonus: 2,
    speedFeet: 35,
    flying: true,
    behavior: "melee",
    token: "S",


    tokenArt: "assets/tokens/scarred-sand-manticore.jpg",
    specialAbility: [
      "Pounce",
      "BossRoar"
    ],
    extraLoot: [
      {
        kind: "randomEquipment"
      }
    ]
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("scarredSandManticore");

  // Category 3
  window.DungeonContent.register("monsters", "stormDuneRaptor", {
    name: "Storm-Dune Raptor",
    role: "Swift desert apex predator",
    tags: [
      "beast",
      "desert",
      "raptor"
    ],
    maxHp: 38,
    category: 3,
    xp: 250,
    ac: 16,
    attackBonus: 7,
    damage: {
      count: 1,
      sides: 8,
      bonus: 5,
      type: "slashing",
      attackType: "weapon",
      label: "1d8 + 5 slashing"
    },
    initiativeBonus: 4,
    speedFeet: 50,
    behavior: "melee",
    token: "S",

    tokenArt: "assets/tokens/storm-dune-raptor.jpg",
    specialAbility: [
      "Pounce"
    ]
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("stormDuneRaptor");

  window.DungeonContent.register("monsters", "bonecrackScorpion", {
    name: "Bonecrack Scorpion",
    role: "Huge venomous desert beast",
    tags: [
      "beast",
      "desert",
      "scorpion",
      "poison"
    ],
    maxHp: 42,
    category: 3,
    xp: 260,
    ac: 15,
    attackBonus: 7,
    damage: {
      count: 1,
      sides: 10,
      bonus: 4,
      type: "piercing",
      attackType: "weapon",
      label: "1d10 + 4 piercing"
    },
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "B",


    tokenArt: "assets/tokens/bonecrack-scorpion.jpg",
    damageResistances: [
      "poison"
    ],
    specialAbility: [
      "VenomBite"
    ]
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("bonecrackScorpion");

  window.DungeonContent.register("monsters", "dunehornRhino", {
    name: "Dunehorn Rhino",
    role: "Massive desert charger",
    tags: [
      "beast",
      "desert",
      "rhino"
    ],
    maxHp: 52,
    category: 3,
    xp: 280,
    ac: 14,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 12,
      bonus: 4,
      type: "piercing",
      attackType: "weapon",
      label: "1d12 + 4 piercing"
    },
    initiativeBonus: 0,
    speedFeet: 30,
    behavior: "melee",
    token: "D",


    tokenArt: "assets/tokens/dunehorn-rhino.jpg",
    specialAbility: [
      "Charge"
    ]
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("dunehornRhino");

  window.DungeonContent.register("monsters", "ancientGlassbackTortoise", {
    name: "Ancient Glassback Tortoise",
    role: "Ancient armored desert beast",
    tags: [
      "beast",
      "desert",
      "tortoise"
    ],
    maxHp: 56,
    category: 3,
    xp: 290,
    ac: 16,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 10,
      bonus: 4,
      type: "bludgeoning",
      attackType: "weapon",
      label: "1d10 + 4 bludgeoning"
    },
    initiativeBonus: 0,
    speedFeet: 25,
    behavior: "melee",
    token: "A",


    tokenArt: "assets/tokens/ancient-glassback-tortoise.jpg",
    damageResistances: [
      "slashing"
    ],
    specialAbility: [
      "ShellGuard",
      "ThickHide"
    ]
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("ancientGlassbackTortoise");

  window.DungeonContent.register("monsters", "titanSandmaw", {
    name: "Titan Sandmaw",
    role: "Category 3 desert beast boss",
    tags: [
      "beast",
      "desert",
      "worm",
      "boss"
    ],
    maxHp: 70,
    category: 3,
    xp: 430,
    ac: 16,
    attackBonus: 7,
    damage: {
      count: 1,
      sides: 12,
      bonus: 5,
      type: "piercing",
      attackType: "weapon",
      label: "1d12 + 5 piercing"
    },
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "T",


    tokenArt: "assets/tokens/titan-sandmaw.jpg",
    specialAbility: [
      "BurrowAmbush",
      "BossRoar"
    ],
    extraLoot: [
      {
        kind: "randomEquipment"
      }
    ]
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("titanSandmaw");


  /* ============================================================
   * BEAST + UNDERGROUND
   * ============================================================ */

  // Category 1
  window.DungeonContent.register("monsters", "caveRat", {
    name: "Cave Rat",
    role: "Small underground scavenger",
    tags: [
      "beast",
      "underground",
      "rat"
    ],
    maxHp: 5,
    category: 1,
    xp: 40,
    ac: 13,
    attackBonus: 4,
    damage: {
      count: 1,
      sides: 4,
      bonus: 2,
      type: "piercing",
      attackType: "weapon",
      label: "1d4 + 2 piercing"
    },
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "swarm",
    token: "C",
    tokenArt: "assets/tokens/cave-rat.jpg",
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("caveRat");

  window.DungeonContent.register("monsters", "blindCaveHound", {
    name: "Blind Cave Hound",
    role: "Echo-hunting cave predator",
    tags: [
      "beast",
      "underground",
      "hound"
    ],
    maxHp: 12,
    category: 1,
    xp: 50,
    ac: 13,
    attackBonus: 4,
    damage: {
      count: 1,
      sides: 6,
      bonus: 2,
      type: "piercing",
      attackType: "weapon",
      label: "1d6 + 2 piercing"
    },
    initiativeBonus: 2,
    speedFeet: 35,
    behavior: "melee",
    token: "B",


    tokenArt: "assets/tokens/blind-cave-hound.jpg",
    specialAbility: [
      "Pounce"
    ]
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("blindCaveHound");

  window.DungeonContent.register("monsters", "stonebackBeetle", {
    name: "Stoneback Beetle",
    role: "Armored cave insect",
    tags: [
      "beast",
      "underground",
      "beetle"
    ],
    maxHp: 18,
    category: 1,
    xp: 65,
    ac: 14,
    attackBonus: 3,
    damage: {
      count: 1,
      sides: 6,
      bonus: 2,
      type: "bludgeoning",
      attackType: "weapon",
      label: "1d6 + 2 bludgeoning"
    },
    initiativeBonus: 0,
    speedFeet: 25,
    behavior: "melee",
    token: "S",


    tokenArt: "assets/tokens/stoneback-beetle.jpg",
    damageResistances: [
      "bludgeoning"
    ],
    specialAbility: [
      "ThickHide"
    ]
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("stonebackBeetle");

  window.DungeonContent.register("monsters", "paleCaveSpider", {
    name: "Pale Cave Spider",
    role: "Venomous underground ambusher",
    tags: [
      "beast",
      "underground",
      "spider",
      "poison"
    ],
    maxHp: 12,
    category: 1,
    xp: 50,
    ac: 13,
    attackBonus: 4,
    damage: {
      count: 1,
      sides: 6,
      bonus: 2,
      type: "piercing",
      attackType: "weapon",
      label: "1d6 + 2 piercing"
    },
    initiativeBonus: 2,
    speedFeet: 35,
    behavior: "melee",
    token: "P",


    tokenArt: "assets/tokens/pale-cave-spider.jpg",
    damageResistances: [
      "poison"
    ],
    specialAbility: [
      "VenomBite"
    ]
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("paleCaveSpider");

  window.DungeonContent.register("monsters", "deepTunnelBoar", {
    name: "Deep-Tunnel Boar",
    role: "Category 1 underground beast boss",
    tags: [
      "beast",
      "underground",
      "boar",
      "boss"
    ],
    maxHp: 28,
    category: 1,
    xp: 120,
    ac: 13,
    attackBonus: 5,
    damage: {
      count: 1,
      sides: 8,
      bonus: 3,
      type: "piercing",
      attackType: "weapon",
      label: "1d8 + 3 piercing"
    },
    initiativeBonus: 1,
    speedFeet: 35,
    behavior: "melee",
    token: "D",


    tokenArt: "assets/tokens/deep-tunnel-boar.jpg",
    specialAbility: [
      "Charge",
      "BossRoar"
    ],
    extraLoot: [
      {
        kind: "randomEquipment"
      }
    ]
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("deepTunnelBoar");

  // Category 2
  window.DungeonContent.register("monsters", "gloomMole", {
    name: "Gloom Mole",
    role: "Burrowing underground beast",
    tags: [
      "beast",
      "underground",
      "mole"
    ],
    maxHp: 25,
    category: 2,
    xp: 140,
    ac: 14,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 8,
      bonus: 3,
      type: "slashing",
      attackType: "weapon",
      label: "1d8 + 3 slashing"
    },
    initiativeBonus: 2,
    speedFeet: 35,
    behavior: "melee",
    token: "G",

    tokenArt: "assets/tokens/gloom-mole.jpg",
    specialAbility: [
      "BurrowAmbush"
    ]
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("gloomMole");

  window.DungeonContent.register("monsters", "cragToad", {
    name: "Crag Toad",
    role: "Heavy cave ambusher",
    tags: [
      "beast",
      "underground",
      "toad"
    ],
    maxHp: 32,
    category: 2,
    xp: 155,
    ac: 13,
    attackBonus: 5,
    damage: {
      count: 1,
      sides: 10,
      bonus: 3,
      type: "bludgeoning",
      attackType: "weapon",
      label: "1d10 + 3 bludgeoning"
    },
    initiativeBonus: 0,
    speedFeet: 30,
    behavior: "melee",
    token: "C",
    tokenArt: "assets/tokens/crag-toad.jpg",
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("cragToad");

  window.DungeonContent.register("monsters", "razorMandibleBeetle", {
    name: "Razor-Mandible Beetle",
    role: "Armored biting cave insect",
    tags: [
      "beast",
      "underground",
      "beetle"
    ],
    maxHp: 36,
    category: 2,
    xp: 165,
    ac: 16,
    attackBonus: 5,
    damage: {
      count: 1,
      sides: 8,
      bonus: 3,
      type: "piercing",
      attackType: "weapon",
      label: "1d8 + 3 piercing"
    },
    initiativeBonus: 0,
    speedFeet: 25,
    behavior: "melee",
    token: "R",


    tokenArt: "assets/tokens/razor-mandible-beetle.jpg",
    damageResistances: [
      "slashing"
    ],
    specialAbility: [
      "ThickHide"
    ]
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("razorMandibleBeetle");

  window.DungeonContent.register("monsters", "darkmantlePanther", {
    name: "Darkmantle Panther",
    role: "Silent underground stalker",
    tags: [
      "beast",
      "underground",
      "cat"
    ],
    maxHp: 22,
    category: 2,
    xp: 130,
    ac: 15,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 8,
      bonus: 3,
      type: "slashing",
      attackType: "weapon",
      label: "1d8 + 3 slashing"
    },
    initiativeBonus: 4,
    speedFeet: 45,
    behavior: "melee",
    token: "D",


    tokenArt: "assets/tokens/darkmantle-panther.jpg",
    specialAbility: [
      "Pounce"
    ]
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("darkmantlePanther");

  window.DungeonContent.register("monsters", "oldCavernCroc", {
    name: "Old Cavern Croc",
    role: "Category 2 underground beast boss",
    tags: [
      "beast",
      "underground",
      "crocodile",
      "boss"
    ],
    maxHp: 46,
    category: 2,
    xp: 250,
    ac: 15,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 10,
      bonus: 4,
      type: "piercing",
      attackType: "weapon",
      label: "1d10 + 4 piercing"
    },
    initiativeBonus: 2,
    speedFeet: 35,
    behavior: "melee",
    token: "O",


    tokenArt: "assets/tokens/old-cavern-croc.jpg",
    specialAbility: [
      "BloodFrenzy",
      "BossRoar"
    ],
    extraLoot: [
      {
        kind: "randomEquipment"
      }
    ]
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("oldCavernCroc");

  // Category 3
  window.DungeonContent.register("monsters", "deepRiftStalker", {
    name: "Deep-Rift Stalker",
    role: "Elite cave predator",
    tags: [
      "beast",
      "underground",
      "stalker"
    ],
    maxHp: 38,
    category: 3,
    xp: 250,
    ac: 16,
    attackBonus: 7,
    damage: {
      count: 1,
      sides: 8,
      bonus: 5,
      type: "slashing",
      attackType: "weapon",
      label: "1d8 + 5 slashing"
    },
    initiativeBonus: 4,
    speedFeet: 50,
    behavior: "melee",
    token: "D",

    tokenArt: "assets/tokens/deep-rift-stalker.jpg",
    specialAbility: [
      "BurrowAmbush"
    ]
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("deepRiftStalker");

  window.DungeonContent.register("monsters", "crystalCarapaceScarab", {
    name: "Crystal-Carapace Scarab",
    role: "Huge armored underground beetle",
    tags: [
      "beast",
      "underground",
      "beetle"
    ],
    maxHp: 56,
    category: 3,
    xp: 290,
    ac: 16,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 10,
      bonus: 4,
      type: "bludgeoning",
      attackType: "weapon",
      label: "1d10 + 4 bludgeoning"
    },
    initiativeBonus: 0,
    speedFeet: 25,
    behavior: "melee",
    token: "C",


    tokenArt: "assets/tokens/crystal-carapace-scarab.jpg",
    damageResistances: [
      "bludgeoning",
      "slashing"
    ],
    specialAbility: [
      "ShellGuard"
    ]
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("crystalCarapaceScarab");

  window.DungeonContent.register("monsters", "basaltMauler", {
    name: "Basalt Mauler",
    role: "Massive cave brute",
    tags: [
      "beast",
      "underground",
      "brute"
    ],
    maxHp: 52,
    category: 3,
    xp: 280,
    ac: 14,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 12,
      bonus: 4,
      type: "bludgeoning",
      attackType: "weapon",
      label: "1d12 + 4 bludgeoning"
    },
    initiativeBonus: 0,
    speedFeet: 30,
    behavior: "melee",
    token: "B",


    tokenArt: "assets/tokens/basalt-mauler.jpg",
    damageResistances: [
      "bludgeoning"
    ],
    specialAbility: [
      "ThickHide"
    ]
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("basaltMauler");

  window.DungeonContent.register("monsters", "nightglassSpider", {
    name: "Nightglass Spider",
    role: "Huge venomous cave hunter",
    tags: [
      "beast",
      "underground",
      "spider",
      "poison"
    ],
    maxHp: 42,
    category: 3,
    xp: 260,
    ac: 15,
    attackBonus: 7,
    damage: {
      count: 1,
      sides: 10,
      bonus: 4,
      type: "piercing",
      attackType: "weapon",
      label: "1d10 + 4 piercing"
    },
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "N",


    tokenArt: "assets/tokens/nightglass-spider.jpg",
    damageResistances: [
      "poison"
    ],
    specialAbility: [
      "VenomBite",
      "WebSnare"
    ]
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("nightglassSpider");

  window.DungeonContent.register("monsters", "tunnelKingWorm", {
    name: "Tunnel-King Worm",
    role: "Category 3 underground beast boss",
    tags: [
      "beast",
      "underground",
      "worm",
      "boss"
    ],
    maxHp: 70,
    category: 3,
    xp: 430,
    ac: 16,
    attackBonus: 7,
    damage: {
      count: 1,
      sides: 12,
      bonus: 5,
      type: "piercing",
      attackType: "weapon",
      label: "1d12 + 5 piercing"
    },
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "T",


    tokenArt: "assets/tokens/tunnel-king-worm.jpg",
    specialAbility: [
      "BurrowAmbush",
      "BossRoar"
    ],
    extraLoot: [
      {
        kind: "randomEquipment"
      }
    ]
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("tunnelKingWorm");


  /* ============================================================
   * BEAST + SWAMP
   * ============================================================ */

  // Category 1
  window.DungeonContent.register("monsters", "bogFrog", {
    name: "Bog Frog",
    role: "Leaping swamp beast",
    tags: [
      "beast",
      "swamp",
      "frog"
    ],
    maxHp: 9,
    category: 1,
    xp: 40,
    ac: 13,
    attackBonus: 4,
    damage: {
      count: 1,
      sides: 4,
      bonus: 2,
      type: "bludgeoning",
      attackType: "weapon",
      label: "1d4 + 2 bludgeoning"
    },
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "B",
    tokenArt: "assets/tokens/bog-frog.jpg",
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("bogFrog");

  window.DungeonContent.register("monsters", "mudSnapper", {
    name: "Mud Snapper",
    role: "Small swamp biter",
    tags: [
      "beast",
      "swamp",
      "turtle"
    ],
    maxHp: 12,
    category: 1,
    xp: 50,
    ac: 13,
    attackBonus: 4,
    damage: {
      count: 1,
      sides: 6,
      bonus: 2,
      type: "piercing",
      attackType: "weapon",
      label: "1d6 + 2 piercing"
    },
    initiativeBonus: 2,
    speedFeet: 35,
    behavior: "melee",
    token: "M",
    tokenArt: "assets/tokens/mud-snapper.jpg",
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("mudSnapper");

  window.DungeonContent.register("monsters", "leechHound", {
    name: "Leech Hound",
    role: "Hungry swamp predator",
    tags: [
      "beast",
      "swamp",
      "hound"
    ],
    maxHp: 12,
    category: 1,
    xp: 50,
    ac: 13,
    attackBonus: 4,
    damage: {
      count: 1,
      sides: 6,
      bonus: 2,
      type: "piercing",
      attackType: "weapon",
      label: "1d6 + 2 piercing"
    },
    initiativeBonus: 2,
    speedFeet: 35,
    behavior: "melee",
    token: "L",


    tokenArt: "assets/tokens/leech-hound.jpg",
    specialAbility: [
      "BloodFrenzy"
    ]
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("leechHound");

  window.DungeonContent.register("monsters", "reedViper", {
    name: "Reed Viper",
    role: "Venomous swamp snake",
    tags: [
      "beast",
      "swamp",
      "snake",
      "poison"
    ],
    maxHp: 9,
    category: 1,
    xp: 40,
    ac: 13,
    attackBonus: 4,
    damage: {
      count: 1,
      sides: 4,
      bonus: 2,
      type: "piercing",
      attackType: "weapon",
      label: "1d4 + 2 piercing"
    },
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "R",


    tokenArt: "assets/tokens/reed-viper.jpg",
    damageResistances: [
      "poison"
    ],
    specialAbility: [
      "VenomBite"
    ]
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("reedViper");

  window.DungeonContent.register("monsters", "oldBogGator", {
    name: "Old Bog Gator",
    role: "Category 1 swamp beast boss",
    tags: [
      "beast",
      "swamp",
      "crocodile",
      "boss"
    ],
    maxHp: 28,
    category: 1,
    xp: 120,
    ac: 13,
    attackBonus: 5,
    damage: {
      count: 1,
      sides: 8,
      bonus: 3,
      type: "piercing",
      attackType: "weapon",
      label: "1d8 + 3 piercing"
    },
    initiativeBonus: 1,
    speedFeet: 35,
    behavior: "melee",
    token: "O",


    tokenArt: "assets/tokens/old-bog-gator.jpg",
    specialAbility: [
      "BloodFrenzy",
      "BossRoar"
    ],
    extraLoot: [
      {
        kind: "randomEquipment"
      }
    ]
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("oldBogGator");

  // Category 2
  window.DungeonContent.register("monsters", "mireStag", {
    name: "Mire Stag",
    role: "Swamp charger",
    tags: [
      "beast",
      "swamp",
      "stag"
    ],
    maxHp: 25,
    category: 2,
    xp: 140,
    ac: 14,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 8,
      bonus: 3,
      type: "piercing",
      attackType: "weapon",
      label: "1d8 + 3 piercing"
    },
    initiativeBonus: 2,
    speedFeet: 35,
    behavior: "melee",
    token: "M",

    tokenArt: "assets/tokens/mire-stag.jpg",
    specialAbility: [
      "Charge"
    ]
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("mireStag");

  window.DungeonContent.register("monsters", "rotwaterCroc", {
    name: "Rotwater Croc",
    role: "Large swamp ambusher",
    tags: [
      "beast",
      "swamp",
      "crocodile"
    ],
    maxHp: 32,
    category: 2,
    xp: 155,
    ac: 13,
    attackBonus: 5,
    damage: {
      count: 1,
      sides: 10,
      bonus: 3,
      type: "piercing",
      attackType: "weapon",
      label: "1d10 + 3 piercing"
    },
    initiativeBonus: 0,
    speedFeet: 30,
    behavior: "melee",
    token: "R",


    tokenArt: "assets/tokens/rotwater-croc.jpg",
    specialAbility: [
      "MarshAmbush"
    ]
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("rotwaterCroc");

  window.DungeonContent.register("monsters", "bogbackBoar", {
    name: "Bogback Boar",
    role: "Heavy swamp beast",
    tags: [
      "beast",
      "swamp",
      "boar"
    ],
    maxHp: 36,
    category: 2,
    xp: 165,
    ac: 16,
    attackBonus: 5,
    damage: {
      count: 1,
      sides: 8,
      bonus: 3,
      type: "piercing",
      attackType: "weapon",
      label: "1d8 + 3 piercing"
    },
    initiativeBonus: 0,
    speedFeet: 25,
    behavior: "melee",
    token: "B",


    tokenArt: "assets/tokens/bogback-boar.jpg",
    damageResistances: [
      "piercing"
    ],
    specialAbility: [
      "ThickHide"
    ]
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("bogbackBoar");

  window.DungeonContent.register("monsters", "plagueMireToad", {
    name: "Plague-Mire Toad",
    role: "Poisonous swamp brute",
    tags: [
      "beast",
      "swamp",
      "toad",
      "poison"
    ],
    maxHp: 23,
    category: 2,
    xp: 145,
    ac: 14,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 8,
      bonus: 3,
      type: "poison",
      attackType: "weapon",
      label: "1d8 + 3 poison",
      range: {
        kind: "ranged",
        normal: 50,
        long: 150,
        feet: 50
      }
    },
    initiativeBonus: 3,
    speedFeet: 35,
    behavior: "rangedKiter",
    token: "P",


    tokenArt: "assets/tokens/plague-mire-toad.jpg",
    damageResistances: [
      "poison"
    ],
    specialAbility: [
      "VenomBite"
    ]
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("plagueMireToad");

  window.DungeonContent.register("monsters", "mossjawCroc", {
    name: "Mossjaw Croc",
    role: "Category 2 swamp beast boss",
    tags: [
      "beast",
      "swamp",
      "crocodile",
      "boss"
    ],
    maxHp: 46,
    category: 2,
    xp: 250,
    ac: 15,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 10,
      bonus: 4,
      type: "piercing",
      attackType: "weapon",
      label: "1d10 + 4 piercing"
    },
    initiativeBonus: 2,
    speedFeet: 35,
    behavior: "melee",
    token: "M",


    tokenArt: "assets/tokens/mossjaw-croc.jpg",
    specialAbility: [
      "MarshAmbush",
      "BossRoar"
    ],
    extraLoot: [
      {
        kind: "randomEquipment"
      }
    ]
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("mossjawCroc");

  // Category 3
  window.DungeonContent.register("monsters", "fenReaperCat", {
    name: "Fen Reaper Cat",
    role: "Fast swamp predator",
    tags: [
      "beast",
      "swamp",
      "cat"
    ],
    maxHp: 38,
    category: 3,
    xp: 250,
    ac: 16,
    attackBonus: 7,
    damage: {
      count: 1,
      sides: 8,
      bonus: 5,
      type: "slashing",
      attackType: "weapon",
      label: "1d8 + 5 slashing"
    },
    initiativeBonus: 4,
    speedFeet: 50,
    behavior: "melee",
    token: "F",

    tokenArt: "assets/tokens/fen-reaper-cat.jpg",
    specialAbility: [
      "Pounce"
    ]
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("fenReaperCat");

  window.DungeonContent.register("monsters", "giantSwampLeech", {
    name: "Giant Swamp Leech",
    role: "Huge blood-drinking beast",
    tags: [
      "beast",
      "swamp",
      "leech"
    ],
    maxHp: 42,
    category: 3,
    xp: 260,
    ac: 15,
    attackBonus: 7,
    damage: {
      count: 1,
      sides: 10,
      bonus: 4,
      type: "piercing",
      attackType: "weapon",
      label: "1d10 + 4 piercing"
    },
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "G",


    tokenArt: "assets/tokens/giant-swamp-leech.jpg",
    specialAbility: [
      "BloodFrenzy"
    ]
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("giantSwampLeech");

  window.DungeonContent.register("monsters", "mudmawBehemoth", {
    name: "Mudmaw Behemoth",
    role: "Massive swamp brute",
    tags: [
      "beast",
      "swamp",
      "behemoth"
    ],
    maxHp: 52,
    category: 3,
    xp: 280,
    ac: 14,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 12,
      bonus: 4,
      type: "bludgeoning",
      attackType: "weapon",
      label: "1d12 + 4 bludgeoning"
    },
    initiativeBonus: 0,
    speedFeet: 30,
    behavior: "melee",
    token: "M",


    tokenArt: "assets/tokens/mudmaw-behemoth.jpg",
    damageResistances: [
      "bludgeoning"
    ],
    specialAbility: [
      "ThickHide"
    ]
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("mudmawBehemoth");

  window.DungeonContent.register("monsters", "venomBogHydra", {
    name: "Venom-Bog Hydra",
    role: "Poisonous swamp monster",
    tags: [
      "beast",
      "swamp",
      "hydra",
      "poison"
    ],
    maxHp: 42,
    category: 3,
    xp: 260,
    ac: 15,
    attackBonus: 7,
    damage: {
      count: 1,
      sides: 10,
      bonus: 4,
      type: "piercing",
      attackType: "weapon",
      label: "1d10 + 4 piercing"
    },
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "V",


    tokenArt: "assets/tokens/venom-bog-hydra.jpg",
    damageResistances: [
      "poison"
    ],
    specialAbility: [
      "VenomBite"
    ]
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("venomBogHydra");

  window.DungeonContent.register("monsters", "ancientMireGator", {
    name: "Ancient Mire Gator",
    role: "Category 3 swamp beast boss",
    tags: [
      "beast",
      "swamp",
      "crocodile",
      "boss"
    ],
    maxHp: 70,
    category: 3,
    xp: 430,
    ac: 16,
    attackBonus: 7,
    damage: {
      count: 1,
      sides: 12,
      bonus: 5,
      type: "piercing",
      attackType: "weapon",
      label: "1d12 + 5 piercing"
    },
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "A",


    tokenArt: "assets/tokens/ancient-mire-gator.jpg",
    specialAbility: [
      "MarshAmbush",
      "BossRoar"
    ],
    extraLoot: [
      {
        kind: "randomEquipment"
      }
    ]
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("ancientMireGator");


  /* ============================================================
   * BEAST + ARCTIC
   * ============================================================ */

  // Category 1
  window.DungeonContent.register("monsters", "snowHare", {
    name: "Snow Hare",
    role: "Small arctic beast",
    tags: [
      "beast",
      "arctic",
      "hare"
    ],
    maxHp: 9,
    category: 1,
    xp: 40,
    ac: 13,
    attackBonus: 4,
    damage: {
      count: 1,
      sides: 4,
      bonus: 2,
      type: "slashing",
      attackType: "weapon",
      label: "1d4 + 2 slashing"
    },
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "S",
    tokenArt: "assets/tokens/snow-hare.jpg",
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("snowHare");

  window.DungeonContent.register("monsters", "iceFox", {
    name: "Ice Fox",
    role: "Quick arctic predator",
    tags: [
      "beast",
      "arctic",
      "fox"
    ],
    maxHp: 9,
    category: 1,
    xp: 40,
    ac: 13,
    attackBonus: 4,
    damage: {
      count: 1,
      sides: 4,
      bonus: 2,
      type: "piercing",
      attackType: "weapon",
      label: "1d4 + 2 piercing"
    },
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "I",


    tokenArt: "assets/tokens/ice-fox.jpg",
    damageResistances: [
      "cold"
    ],
    specialAbility: [
      "FrostHide"
    ]
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("iceFox");

  window.DungeonContent.register("monsters", "frostWolf", {
    name: "Frost Wolf",
    role: "Cold-land hunter",
    tags: [
      "beast",
      "arctic",
      "wolf"
    ],
    maxHp: 12,
    category: 1,
    xp: 50,
    ac: 13,
    attackBonus: 4,
    damage: {
      count: 1,
      sides: 6,
      bonus: 2,
      type: "piercing",
      attackType: "weapon",
      label: "1d6 + 2 piercing"
    },
    initiativeBonus: 2,
    speedFeet: 35,
    behavior: "melee",
    token: "F",


    tokenArt: "assets/tokens/frost-wolf.jpg",
    damageResistances: [
      "cold"
    ],
    specialAbility: [
      "Pounce"
    ]
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("frostWolf");

  window.DungeonContent.register("monsters", "snowbackBoar", {
    name: "Snowback Boar",
    role: "Hardy arctic charger",
    tags: [
      "beast",
      "arctic",
      "boar"
    ],
    maxHp: 16,
    category: 1,
    xp: 60,
    ac: 12,
    attackBonus: 4,
    damage: {
      count: 1,
      sides: 8,
      bonus: 2,
      type: "piercing",
      attackType: "weapon",
      label: "1d8 + 2 piercing"
    },
    initiativeBonus: 0,
    speedFeet: 30,
    behavior: "melee",
    token: "S",


    tokenArt: "assets/tokens/snowback-boar.jpg",
    damageResistances: [
      "cold"
    ],
    specialAbility: [
      "Charge"
    ]
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("snowbackBoar");

  window.DungeonContent.register("monsters", "oldIcehornRam", {
    name: "Old Icehorn Ram",
    role: "Category 1 arctic beast boss",
    tags: [
      "beast",
      "arctic",
      "ram",
      "boss"
    ],
    maxHp: 28,
    category: 1,
    xp: 120,
    ac: 13,
    attackBonus: 5,
    damage: {
      count: 1,
      sides: 8,
      bonus: 3,
      type: "bludgeoning",
      attackType: "weapon",
      label: "1d8 + 3 bludgeoning"
    },
    initiativeBonus: 1,
    speedFeet: 35,
    behavior: "melee",
    token: "O",


    tokenArt: "assets/tokens/old-icehorn-ram.jpg",
    damageResistances: [
      "cold"
    ],
    specialAbility: [
      "Charge",
      "BossRoar"
    ],
    extraLoot: [
      {
        kind: "randomEquipment"
      }
    ]
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("oldIcehornRam");

  // Category 2
  window.DungeonContent.register("monsters", "whiteDireWolf", {
    name: "White Dire Wolf",
    role: "Large arctic wolf",
    tags: [
      "beast",
      "arctic",
      "wolf"
    ],
    maxHp: 25,
    category: 2,
    xp: 140,
    ac: 14,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 8,
      bonus: 3,
      type: "piercing",
      attackType: "weapon",
      label: "1d8 + 3 piercing"
    },
    initiativeBonus: 2,
    speedFeet: 35,
    behavior: "melee",
    token: "W",

    tokenArt: "assets/tokens/white-dire-wolf.jpg",
    damageResistances: [
      "cold"
    ],
    specialAbility: [
      "Pounce"
    ]
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("whiteDireWolf");

  window.DungeonContent.register("monsters", "iceClawLynx", {
    name: "Ice-Claw Lynx",
    role: "Fast arctic hunter",
    tags: [
      "beast",
      "arctic",
      "cat"
    ],
    maxHp: 22,
    category: 2,
    xp: 130,
    ac: 15,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 8,
      bonus: 3,
      type: "slashing",
      attackType: "weapon",
      label: "1d8 + 3 slashing"
    },
    initiativeBonus: 4,
    speedFeet: 45,
    behavior: "melee",
    token: "I",


    tokenArt: "assets/tokens/ice-claw-lynx.jpg",
    damageResistances: [
      "cold"
    ]
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("iceClawLynx");

  window.DungeonContent.register("monsters", "tundraOx", {
    name: "Tundra Ox",
    role: "Heavy arctic beast",
    tags: [
      "beast",
      "arctic",
      "ox"
    ],
    maxHp: 36,
    category: 2,
    xp: 165,
    ac: 16,
    attackBonus: 5,
    damage: {
      count: 1,
      sides: 8,
      bonus: 3,
      type: "bludgeoning",
      attackType: "weapon",
      label: "1d8 + 3 bludgeoning"
    },
    initiativeBonus: 0,
    speedFeet: 25,
    behavior: "melee",
    token: "T",


    tokenArt: "assets/tokens/tundra-ox.jpg",
    damageResistances: [
      "cold"
    ],
    specialAbility: [
      "ThickHide"
    ]
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("tundraOx");

  window.DungeonContent.register("monsters", "frostbiteViper", {
    name: "Frostbite Viper",
    role: "Cold venom snake",
    tags: [
      "beast",
      "arctic",
      "snake",
      "poison"
    ],
    maxHp: 22,
    category: 2,
    xp: 130,
    ac: 15,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 8,
      bonus: 3,
      type: "piercing",
      attackType: "weapon",
      label: "1d8 + 3 piercing"
    },
    initiativeBonus: 4,
    speedFeet: 45,
    behavior: "melee",
    token: "F",


    tokenArt: "assets/tokens/frostbite-viper.jpg",
    damageResistances: [
      "cold",
      "poison"
    ],
    specialAbility: [
      "VenomBite"
    ]
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("frostbiteViper");

  window.DungeonContent.register("monsters", "snowhideBear", {
    name: "Snowhide Bear",
    role: "Category 2 arctic beast boss",
    tags: [
      "beast",
      "arctic",
      "bear",
      "boss"
    ],
    maxHp: 46,
    category: 2,
    xp: 250,
    ac: 15,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 10,
      bonus: 4,
      type: "slashing",
      attackType: "weapon",
      label: "1d10 + 4 slashing"
    },
    initiativeBonus: 2,
    speedFeet: 35,
    behavior: "melee",
    token: "S",


    tokenArt: "assets/tokens/snowhide-bear.jpg",
    damageResistances: [
      "cold"
    ],
    specialAbility: [
      "FrostHide",
      "BossRoar"
    ],
    extraLoot: [
      {
        kind: "randomEquipment"
      }
    ]
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("snowhideBear");

  // Category 3
  window.DungeonContent.register("monsters", "glacierWolf", {
    name: "Glacier Wolf",
    role: "Elite arctic predator",
    tags: [
      "beast",
      "arctic",
      "wolf"
    ],
    maxHp: 38,
    category: 3,
    xp: 250,
    ac: 16,
    attackBonus: 7,
    damage: {
      count: 1,
      sides: 8,
      bonus: 5,
      type: "piercing",
      attackType: "weapon",
      label: "1d8 + 5 piercing"
    },
    initiativeBonus: 4,
    speedFeet: 50,
    behavior: "melee",
    token: "G",

    tokenArt: "assets/tokens/glacier-wolf.jpg",
    damageResistances: [
      "cold"
    ],
    specialAbility: [
      "Pounce"
    ]
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("glacierWolf");

  window.DungeonContent.register("monsters", "mammothCalfRampager", {
    name: "Mammoth Calf Rampager",
    role: "Young but massive arctic charger",
    tags: [
      "beast",
      "arctic",
      "mammoth"
    ],
    maxHp: 52,
    category: 3,
    xp: 280,
    ac: 14,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 12,
      bonus: 4,
      type: "bludgeoning",
      attackType: "weapon",
      label: "1d12 + 4 bludgeoning"
    },
    initiativeBonus: 0,
    speedFeet: 30,
    behavior: "melee",
    token: "M",


    tokenArt: "assets/tokens/mammoth-calf-rampager.jpg",
    damageResistances: [
      "cold"
    ],
    specialAbility: [
      "Charge"
    ]
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("mammothCalfRampager");

  window.DungeonContent.register("monsters", "iceplateTortoise", {
    name: "Iceplate Tortoise",
    role: "Armored arctic beast",
    tags: [
      "beast",
      "arctic",
      "tortoise"
    ],
    maxHp: 56,
    category: 3,
    xp: 290,
    ac: 16,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 10,
      bonus: 4,
      type: "bludgeoning",
      attackType: "weapon",
      label: "1d10 + 4 bludgeoning"
    },
    initiativeBonus: 0,
    speedFeet: 25,
    behavior: "melee",
    token: "I",


    tokenArt: "assets/tokens/iceplate-tortoise.jpg",
    damageResistances: [
      "cold",
      "slashing"
    ],
    specialAbility: [
      "ShellGuard"
    ]
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("iceplateTortoise");

  window.DungeonContent.register("monsters", "polarMauler", {
    name: "Polar Mauler",
    role: "Huge arctic bear",
    tags: [
      "beast",
      "arctic",
      "bear"
    ],
    maxHp: 42,
    category: 3,
    xp: 260,
    ac: 15,
    attackBonus: 7,
    damage: {
      count: 1,
      sides: 10,
      bonus: 4,
      type: "slashing",
      attackType: "weapon",
      label: "1d10 + 4 slashing"
    },
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "P",


    tokenArt: "assets/tokens/polar-mauler.jpg",
    damageResistances: [
      "cold"
    ],
    specialAbility: [
      "BloodFrenzy"
    ]
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("polarMauler");

  window.DungeonContent.register("monsters", "ancientFrosthornMammoth", {
    name: "Ancient Frosthorn Mammoth",
    role: "Category 3 arctic beast boss",
    tags: [
      "beast",
      "arctic",
      "mammoth",
      "boss"
    ],
    maxHp: 70,
    category: 3,
    xp: 430,
    ac: 16,
    attackBonus: 7,
    damage: {
      count: 1,
      sides: 12,
      bonus: 5,
      type: "bludgeoning",
      attackType: "weapon",
      label: "1d12 + 5 bludgeoning"
    },
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "A",


    tokenArt: "assets/tokens/ancient-frosthorn-mammoth.jpg",
    damageResistances: [
      "cold"
    ],
    specialAbility: [
      "Stampede",
      "BossRoar"
    ],
    extraLoot: [
      {
        kind: "randomEquipment"
      }
    ]
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("ancientFrosthornMammoth");


  /* ============================================================
   * BEAST + URBAN
   * ============================================================ */

  // Category 1
  window.DungeonContent.register("monsters", "alleyRat", {
    name: "Alley Rat",
    role: "Urban scavenger",
    tags: [
      "beast",
      "urban",
      "rat"
    ],
    maxHp: 5,
    category: 1,
    xp: 40,
    ac: 13,
    attackBonus: 4,
    damage: {
      count: 1,
      sides: 4,
      bonus: 2,
      type: "piercing",
      attackType: "weapon",
      label: "1d4 + 2 piercing"
    },
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "swarm",
    token: "A",

    tokenArt: "assets/tokens/alley-rat.jpg",
    specialAbility: [
      "SewerSkulk"
    ]
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("alleyRat");

  window.DungeonContent.register("monsters", "strayFightingDog", {
    name: "Stray Fighting Dog",
    role: "Aggressive street hound",
    tags: [
      "beast",
      "urban",
      "dog"
    ],
    maxHp: 12,
    category: 1,
    xp: 50,
    ac: 13,
    attackBonus: 4,
    damage: {
      count: 1,
      sides: 6,
      bonus: 2,
      type: "piercing",
      attackType: "weapon",
      label: "1d6 + 2 piercing"
    },
    initiativeBonus: 2,
    speedFeet: 35,
    behavior: "melee",
    token: "S",


    tokenArt: "assets/tokens/stray-fighting-dog.jpg",
    specialAbility: [
      "Pounce"
    ]
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("strayFightingDog");

  window.DungeonContent.register("monsters", "roofCrowSwarm", {
    name: "Roof Crow Swarm",
    role: "Aggressive urban bird swarm",
    tags: [
      "beast",
      "urban",
      "bird",
      "flying",
      "swarm"
    ],
    maxHp: 10,
    category: 1,
    xp: 55,
    ac: 13,
    attackBonus: 4,
    damage: {
      count: 1,
      sides: 6,
      bonus: 2,
      type: "slashing",
      attackType: "weapon",
      label: "1d6 + 2 slashing",
      range: {
        kind: "ranged",
        normal: 40,
        long: 120,
        feet: 40
      }
    },
    initiativeBonus: 2,
    speedFeet: 30,
    flying: true,
    behavior: "rangedKiter",
    token: "R",
    tokenArt: "assets/tokens/roof-crow-swarm.jpg",
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("roofCrowSwarm");

  window.DungeonContent.register("monsters", "sewerSnapper", {
    name: "Sewer Snapper",
    role: "Small sewer beast",
    tags: [
      "beast",
      "urban",
      "turtle"
    ],
    maxHp: 18,
    category: 1,
    xp: 65,
    ac: 14,
    attackBonus: 3,
    damage: {
      count: 1,
      sides: 6,
      bonus: 2,
      type: "piercing",
      attackType: "weapon",
      label: "1d6 + 2 piercing"
    },
    initiativeBonus: 0,
    speedFeet: 25,
    behavior: "melee",
    token: "S",


    tokenArt: "assets/tokens/sewer-snapper.jpg",
    specialAbility: [
      "SewerSkulk"
    ]
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("sewerSnapper");

  window.DungeonContent.register("monsters", "oldYardMastiff", {
    name: "Old Yard Mastiff",
    role: "Category 1 urban beast boss",
    tags: [
      "beast",
      "urban",
      "dog",
      "boss"
    ],
    maxHp: 28,
    category: 1,
    xp: 120,
    ac: 13,
    attackBonus: 5,
    damage: {
      count: 1,
      sides: 8,
      bonus: 3,
      type: "piercing",
      attackType: "weapon",
      label: "1d8 + 3 piercing"
    },
    initiativeBonus: 1,
    speedFeet: 35,
    behavior: "melee",
    token: "O",


    tokenArt: "assets/tokens/old-yard-mastiff.jpg",
    specialAbility: [
      "Pounce",
      "BossRoar"
    ],
    extraLoot: [
      {
        kind: "randomEquipment"
      }
    ]
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("oldYardMastiff");

  // Category 2
  window.DungeonContent.register("monsters", "sewerGator", {
    name: "Sewer Gator",
    role: "Large sewer predator",
    tags: [
      "beast",
      "urban",
      "crocodile"
    ],
    maxHp: 32,
    category: 2,
    xp: 155,
    ac: 13,
    attackBonus: 5,
    damage: {
      count: 1,
      sides: 10,
      bonus: 3,
      type: "piercing",
      attackType: "weapon",
      label: "1d10 + 3 piercing"
    },
    initiativeBonus: 0,
    speedFeet: 30,
    behavior: "melee",
    token: "S",

    tokenArt: "assets/tokens/sewer-gator.jpg",
    specialAbility: [
      "SewerSkulk"
    ]
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("sewerGator");

  window.DungeonContent.register("monsters", "chimneyMarten", {
    name: "Chimney Marten",
    role: "Fast rooftop predator",
    tags: [
      "beast",
      "urban",
      "marten"
    ],
    maxHp: 22,
    category: 2,
    xp: 130,
    ac: 15,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 8,
      bonus: 3,
      type: "slashing",
      attackType: "weapon",
      label: "1d8 + 3 slashing"
    },
    initiativeBonus: 4,
    speedFeet: 45,
    behavior: "melee",
    token: "C",


    tokenArt: "assets/tokens/chimney-marten.jpg",
    specialAbility: [
      "Pounce"
    ]
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("chimneyMarten");

  window.DungeonContent.register("monsters", "mangeWolf", {
    name: "Mange Wolf",
    role: "Diseased city wolf",
    tags: [
      "beast",
      "urban",
      "wolf"
    ],
    maxHp: 25,
    category: 2,
    xp: 140,
    ac: 14,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 8,
      bonus: 3,
      type: "piercing",
      attackType: "weapon",
      label: "1d8 + 3 piercing"
    },
    initiativeBonus: 2,
    speedFeet: 35,
    behavior: "melee",
    token: "M",


    tokenArt: "assets/tokens/mange-wolf.jpg",
    specialAbility: [
      "BloodFrenzy"
    ]
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("mangeWolf");

  window.DungeonContent.register("monsters", "ironhideSewerBoar", {
    name: "Ironhide Sewer Boar",
    role: "Armored urban brute",
    tags: [
      "beast",
      "urban",
      "boar"
    ],
    maxHp: 36,
    category: 2,
    xp: 165,
    ac: 16,
    attackBonus: 5,
    damage: {
      count: 1,
      sides: 8,
      bonus: 3,
      type: "piercing",
      attackType: "weapon",
      label: "1d8 + 3 piercing"
    },
    initiativeBonus: 0,
    speedFeet: 25,
    behavior: "melee",
    token: "I",


    tokenArt: "assets/tokens/ironhide-sewer-boar.jpg",
    damageResistances: [
      "piercing"
    ],
    specialAbility: [
      "ThickHide"
    ]
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("ironhideSewerBoar");

  window.DungeonContent.register("monsters", "kingOfTheKennels", {
    name: "King of the Kennels",
    role: "Category 2 urban beast boss",
    tags: [
      "beast",
      "urban",
      "dog",
      "boss"
    ],
    maxHp: 46,
    category: 2,
    xp: 250,
    ac: 15,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 10,
      bonus: 4,
      type: "piercing",
      attackType: "weapon",
      label: "1d10 + 4 piercing"
    },
    initiativeBonus: 2,
    speedFeet: 35,
    behavior: "melee",
    token: "K",


    tokenArt: "assets/tokens/king-of-the-kennels.jpg",
    specialAbility: [
      "Pounce",
      "BossRoar"
    ],
    extraLoot: [
      {
        kind: "randomEquipment"
      }
    ]
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("kingOfTheKennels");

  // Category 3
  window.DungeonContent.register("monsters", "direSewerGator", {
    name: "Dire Sewer Gator",
    role: "Huge sewer predator",
    tags: [
      "beast",
      "urban",
      "crocodile"
    ],
    maxHp: 52,
    category: 3,
    xp: 280,
    ac: 14,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 12,
      bonus: 4,
      type: "piercing",
      attackType: "weapon",
      label: "1d12 + 4 piercing"
    },
    initiativeBonus: 0,
    speedFeet: 30,
    behavior: "melee",
    token: "D",

    tokenArt: "assets/tokens/dire-sewer-gator.jpg",
    specialAbility: [
      "SewerSkulk"
    ]
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("direSewerGator");

  window.DungeonContent.register("monsters", "rooftopRazorwing", {
    name: "Rooftop Razorwing",
    role: "Large urban flying predator",
    tags: [
      "beast",
      "urban",
      "bird",
      "flying"
    ],
    maxHp: 38,
    category: 3,
    xp: 250,
    ac: 16,
    attackBonus: 7,
    damage: {
      count: 1,
      sides: 8,
      bonus: 5,
      type: "slashing",
      attackType: "weapon",
      label: "1d8 + 5 slashing"
    },
    initiativeBonus: 4,
    speedFeet: 50,
    flying: true,
    behavior: "melee",
    token: "R",


    tokenArt: "assets/tokens/rooftop-razorwing.jpg",
    specialAbility: [
      "Pounce"
    ]
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("rooftopRazorwing");

  window.DungeonContent.register("monsters", "plagueAlleyMastiff", {
    name: "Plague Alley Mastiff",
    role: "Diseased elite street beast",
    tags: [
      "beast",
      "urban",
      "dog"
    ],
    maxHp: 42,
    category: 3,
    xp: 260,
    ac: 15,
    attackBonus: 7,
    damage: {
      count: 1,
      sides: 10,
      bonus: 4,
      type: "piercing",
      attackType: "weapon",
      label: "1d10 + 4 piercing"
    },
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "P",


    tokenArt: "assets/tokens/plague-alley-mastiff.jpg",
    damageResistances: [
      "poison"
    ],
    specialAbility: [
      "BloodFrenzy"
    ]
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("plagueAlleyMastiff");

  window.DungeonContent.register("monsters", "cisternShellback", {
    name: "Cistern Shellback",
    role: "Armored cistern beast",
    tags: [
      "beast",
      "urban",
      "turtle"
    ],
    maxHp: 56,
    category: 3,
    xp: 290,
    ac: 16,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 10,
      bonus: 4,
      type: "bludgeoning",
      attackType: "weapon",
      label: "1d10 + 4 bludgeoning"
    },
    initiativeBonus: 0,
    speedFeet: 25,
    behavior: "melee",
    token: "C",


    tokenArt: "assets/tokens/cistern-shellback.jpg",
    damageResistances: [
      "slashing"
    ],
    specialAbility: [
      "ShellGuard"
    ]
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("cisternShellback");

  window.DungeonContent.register("monsters", "oldSewerKing", {
    name: "Old Sewer King",
    role: "Category 3 urban beast boss",
    tags: [
      "beast",
      "urban",
      "crocodile",
      "boss"
    ],
    maxHp: 70,
    category: 3,
    xp: 430,
    ac: 16,
    attackBonus: 7,
    damage: {
      count: 1,
      sides: 12,
      bonus: 5,
      type: "piercing",
      attackType: "weapon",
      label: "1d12 + 5 piercing"
    },
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "O",


    tokenArt: "assets/tokens/old-sewer-king.jpg",
    specialAbility: [
      "SewerSkulk",
      "BossRoar"
    ],
    extraLoot: [
      {
        kind: "randomEquipment"
      }
    ]
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("oldSewerKing");


  /* ============================================================
   * BEAST + WATER
   * ============================================================ */

  // Category 1
  window.DungeonContent.register("monsters", "reefEel", {
    name: "Reef Eel",
    role: "Small aquatic biter",
    tags: [
      "beast",
      "water",
      "eel"
    ],
    maxHp: 9,
    category: 1,
    xp: 40,
    ac: 13,
    attackBonus: 4,
    damage: {
      count: 1,
      sides: 4,
      bonus: 2,
      type: "piercing",
      attackType: "weapon",
      label: "1d4 + 2 piercing"
    },
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "R",

    tokenArt: "assets/tokens/reef-eel.jpg",
    specialAbility: [
      "Aquatic"
    ]
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("reefEel");

  window.DungeonContent.register("monsters", "riverSnapper", {
    name: "River Snapper",
    role: "Armored freshwater beast",
    tags: [
      "beast",
      "water",
      "turtle"
    ],
    maxHp: 18,
    category: 1,
    xp: 65,
    ac: 14,
    attackBonus: 3,
    damage: {
      count: 1,
      sides: 6,
      bonus: 2,
      type: "piercing",
      attackType: "weapon",
      label: "1d6 + 2 piercing"
    },
    initiativeBonus: 0,
    speedFeet: 25,
    behavior: "melee",
    token: "R",


    tokenArt: "assets/tokens/river-snapper.jpg",
    specialAbility: [
      "Aquatic",
      "ShellGuard"
    ]
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("riverSnapper");

  window.DungeonContent.register("monsters", "silverfinPiranha", {
    name: "Silverfin Piranha",
    role: "Aggressive fish predator",
    tags: [
      "beast",
      "water",
      "fish"
    ],
    maxHp: 12,
    category: 1,
    xp: 50,
    ac: 13,
    attackBonus: 4,
    damage: {
      count: 1,
      sides: 6,
      bonus: 2,
      type: "piercing",
      attackType: "weapon",
      label: "1d6 + 2 piercing"
    },
    initiativeBonus: 2,
    speedFeet: 35,
    behavior: "melee",
    token: "S",


    tokenArt: "assets/tokens/silverfin-piranha.jpg",
    specialAbility: [
      "BloodFrenzy"
    ]
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("silverfinPiranha");

  window.DungeonContent.register("monsters", "marshOtter", {
    name: "Marsh Otter",
    role: "Quick aquatic hunter",
    tags: [
      "beast",
      "water",
      "otter"
    ],
    maxHp: 9,
    category: 1,
    xp: 40,
    ac: 13,
    attackBonus: 4,
    damage: {
      count: 1,
      sides: 4,
      bonus: 2,
      type: "slashing",
      attackType: "weapon",
      label: "1d4 + 2 slashing"
    },
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "M",


    tokenArt: "assets/tokens/marsh-otter.jpg",
    specialAbility: [
      "Aquatic"
    ]
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("marshOtter");

  window.DungeonContent.register("monsters", "oldRiverCroc", {
    name: "Old River Croc",
    role: "Category 1 water beast boss",
    tags: [
      "beast",
      "water",
      "crocodile",
      "boss"
    ],
    maxHp: 28,
    category: 1,
    xp: 120,
    ac: 13,
    attackBonus: 5,
    damage: {
      count: 1,
      sides: 8,
      bonus: 3,
      type: "piercing",
      attackType: "weapon",
      label: "1d8 + 3 piercing"
    },
    initiativeBonus: 1,
    speedFeet: 35,
    behavior: "melee",
    token: "O",


    tokenArt: "assets/tokens/old-river-croc.jpg",
    specialAbility: [
      "Aquatic",
      "BossRoar"
    ],
    extraLoot: [
      {
        kind: "randomEquipment"
      }
    ]
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("oldRiverCroc");

  // Category 2
  window.DungeonContent.register("monsters", "razorfinBarracuda", {
    name: "Razorfin Barracuda",
    role: "Fast aquatic striker",
    tags: [
      "beast",
      "water",
      "fish"
    ],
    maxHp: 22,
    category: 2,
    xp: 130,
    ac: 15,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 8,
      bonus: 3,
      type: "piercing",
      attackType: "weapon",
      label: "1d8 + 3 piercing"
    },
    initiativeBonus: 4,
    speedFeet: 45,
    behavior: "melee",
    token: "R",

    tokenArt: "assets/tokens/razorfin-barracuda.jpg",
    specialAbility: [
      "Aquatic",
      "Pounce"
    ]
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("razorfinBarracuda");

  window.DungeonContent.register("monsters", "blackwaterCroc", {
    name: "Blackwater Croc",
    role: "Large aquatic ambusher",
    tags: [
      "beast",
      "water",
      "crocodile"
    ],
    maxHp: 32,
    category: 2,
    xp: 155,
    ac: 13,
    attackBonus: 5,
    damage: {
      count: 1,
      sides: 10,
      bonus: 3,
      type: "piercing",
      attackType: "weapon",
      label: "1d10 + 3 piercing"
    },
    initiativeBonus: 0,
    speedFeet: 30,
    behavior: "melee",
    token: "B",


    tokenArt: "assets/tokens/blackwater-croc.jpg",
    specialAbility: [
      "Aquatic"
    ]
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("blackwaterCroc");

  window.DungeonContent.register("monsters", "giantReefCrab", {
    name: "Giant Reef Crab",
    role: "Armored aquatic beast",
    tags: [
      "beast",
      "water",
      "crab"
    ],
    maxHp: 36,
    category: 2,
    xp: 165,
    ac: 16,
    attackBonus: 5,
    damage: {
      count: 1,
      sides: 8,
      bonus: 3,
      type: "bludgeoning",
      attackType: "weapon",
      label: "1d8 + 3 bludgeoning"
    },
    initiativeBonus: 0,
    speedFeet: 25,
    behavior: "melee",
    token: "G",


    tokenArt: "assets/tokens/giant-reef-crab.jpg",
    damageResistances: [
      "slashing"
    ],
    specialAbility: [
      "Aquatic",
      "ShellGuard"
    ]
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("giantReefCrab");

  window.DungeonContent.register("monsters", "shockEel", {
    name: "Shock Eel",
    role: "Electric water predator",
    tags: [
      "beast",
      "water",
      "eel"
    ],
    maxHp: 23,
    category: 2,
    xp: 145,
    ac: 14,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 8,
      bonus: 3,
      type: "lightning",
      attackType: "weapon",
      label: "1d8 + 3 lightning",
      range: {
        kind: "ranged",
        normal: 50,
        long: 150,
        feet: 50
      }
    },
    initiativeBonus: 3,
    speedFeet: 35,
    behavior: "rangedKiter",
    token: "S",


    tokenArt: "assets/tokens/shock-eel.jpg",
    damageResistances: [
      "lightning"
    ],
    specialAbility: [
      "Aquatic"
    ]
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("shockEel");

  window.DungeonContent.register("monsters", "reefjawShark", {
    name: "Reefjaw Shark",
    role: "Category 2 water beast boss",
    tags: [
      "beast",
      "water",
      "shark",
      "boss"
    ],
    maxHp: 46,
    category: 2,
    xp: 250,
    ac: 15,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 10,
      bonus: 4,
      type: "piercing",
      attackType: "weapon",
      label: "1d10 + 4 piercing"
    },
    initiativeBonus: 2,
    speedFeet: 35,
    behavior: "melee",
    token: "R",


    tokenArt: "assets/tokens/reefjaw-shark.jpg",
    specialAbility: [
      "Aquatic",
      "BloodFrenzy"
    ],
    extraLoot: [
      {
        kind: "randomEquipment"
      }
    ]
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("reefjawShark");

  // Category 3
  window.DungeonContent.register("monsters", "deepwaterShark", {
    name: "Deepwater Shark",
    role: "Large aquatic predator",
    tags: [
      "beast",
      "water",
      "shark"
    ],
    maxHp: 42,
    category: 3,
    xp: 260,
    ac: 15,
    attackBonus: 7,
    damage: {
      count: 1,
      sides: 10,
      bonus: 4,
      type: "piercing",
      attackType: "weapon",
      label: "1d10 + 4 piercing"
    },
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "D",

    tokenArt: "assets/tokens/deepwater-shark.jpg",
    specialAbility: [
      "Aquatic",
      "BloodFrenzy"
    ]
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("deepwaterShark");

  window.DungeonContent.register("monsters", "armoredReefCrab", {
    name: "Armored Reef Crab",
    role: "Huge shell-armored beast",
    tags: [
      "beast",
      "water",
      "crab"
    ],
    maxHp: 56,
    category: 3,
    xp: 290,
    ac: 16,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 10,
      bonus: 4,
      type: "bludgeoning",
      attackType: "weapon",
      label: "1d10 + 4 bludgeoning"
    },
    initiativeBonus: 0,
    speedFeet: 25,
    behavior: "melee",
    token: "A",


    tokenArt: "assets/tokens/armored-reef-crab.jpg",
    damageResistances: [
      "slashing",
      "piercing"
    ],
    specialAbility: [
      "Aquatic",
      "ShellGuard"
    ]
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("armoredReefCrab");

  window.DungeonContent.register("monsters", "stormEel", {
    name: "Storm Eel",
    role: "Lightning aquatic predator",
    tags: [
      "beast",
      "water",
      "eel"
    ],
    maxHp: 36,
    category: 3,
    xp: 270,
    ac: 15,
    attackBonus: 7,
    damage: {
      count: 1,
      sides: 10,
      bonus: 4,
      type: "lightning",
      attackType: "weapon",
      label: "1d10 + 4 lightning",
      range: {
        kind: "ranged",
        normal: 60,
        long: 180,
        feet: 60
      }
    },
    initiativeBonus: 3,
    speedFeet: 35,
    behavior: "rangedKiter",
    token: "S",


    tokenArt: "assets/tokens/storm-eel.jpg",
    damageResistances: [
      "lightning"
    ],
    specialAbility: [
      "Aquatic"
    ]
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("stormEel");

  window.DungeonContent.register("monsters", "tideMauler", {
    name: "Tide Mauler",
    role: "Massive aquatic brute",
    tags: [
      "beast",
      "water",
      "behemoth"
    ],
    maxHp: 52,
    category: 3,
    xp: 280,
    ac: 14,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 12,
      bonus: 4,
      type: "bludgeoning",
      attackType: "weapon",
      label: "1d12 + 4 bludgeoning"
    },
    initiativeBonus: 0,
    speedFeet: 30,
    behavior: "melee",
    token: "T",


    tokenArt: "assets/tokens/tide-mauler.jpg",
    specialAbility: [
      "Aquatic"
    ]
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("tideMauler");

  window.DungeonContent.register("monsters", "ancientHarborShark", {
    name: "Ancient Harbor Shark",
    role: "Category 3 water beast boss",
    tags: [
      "beast",
      "water",
      "shark",
      "boss"
    ],
    maxHp: 70,
    category: 3,
    xp: 430,
    ac: 16,
    attackBonus: 7,
    damage: {
      count: 1,
      sides: 12,
      bonus: 5,
      type: "piercing",
      attackType: "weapon",
      label: "1d12 + 5 piercing"
    },
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "A",


    tokenArt: "assets/tokens/ancient-harbor-shark.jpg",
    specialAbility: [
      "Aquatic",
      "BossRoar"
    ],
    extraLoot: [
      {
        kind: "randomEquipment"
      }
    ]
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("ancientHarborShark");


  /* ============================================================
   * BEAST + MOUNTAIN
   * ============================================================ */

  // Category 1
  window.DungeonContent.register("monsters", "cliffGoat", {
    name: "Cliff Goat",
    role: "Sure-footed mountain beast",
    tags: [
      "beast",
      "mountain",
      "goat"
    ],
    maxHp: 12,
    category: 1,
    xp: 50,
    ac: 13,
    attackBonus: 4,
    damage: {
      count: 1,
      sides: 6,
      bonus: 2,
      type: "bludgeoning",
      attackType: "weapon",
      label: "1d6 + 2 bludgeoning"
    },
    initiativeBonus: 2,
    speedFeet: 35,
    behavior: "melee",
    token: "C",

    tokenArt: "assets/tokens/cliff-goat.jpg",
    specialAbility: [
      "RockClimber"
    ]
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("cliffGoat");

  window.DungeonContent.register("monsters", "stoneMarmot", {
    name: "Stone Marmot",
    role: "Small mountain biter",
    tags: [
      "beast",
      "mountain",
      "marmot"
    ],
    maxHp: 9,
    category: 1,
    xp: 40,
    ac: 13,
    attackBonus: 4,
    damage: {
      count: 1,
      sides: 4,
      bonus: 2,
      type: "piercing",
      attackType: "weapon",
      label: "1d4 + 2 piercing"
    },
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "S",


    tokenArt: "assets/tokens/stone-marmot.jpg",
    specialAbility: [
      "RockClimber"
    ]
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("stoneMarmot");

  window.DungeonContent.register("monsters", "cragWolf", {
    name: "Crag Wolf",
    role: "Mountain wolf",
    tags: [
      "beast",
      "mountain",
      "wolf"
    ],
    maxHp: 12,
    category: 1,
    xp: 50,
    ac: 13,
    attackBonus: 4,
    damage: {
      count: 1,
      sides: 6,
      bonus: 2,
      type: "piercing",
      attackType: "weapon",
      label: "1d6 + 2 piercing"
    },
    initiativeBonus: 2,
    speedFeet: 35,
    behavior: "melee",
    token: "C",


    tokenArt: "assets/tokens/crag-wolf.jpg",
    specialAbility: [
      "Pounce",
      "RockClimber"
    ]
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("cragWolf");

  window.DungeonContent.register("monsters", "talonHawk", {
    name: "Talon Hawk",
    role: "Mountain bird predator",
    tags: [
      "beast",
      "mountain",
      "bird",
      "flying"
    ],
    maxHp: 10,
    category: 1,
    xp: 55,
    ac: 13,
    attackBonus: 4,
    damage: {
      count: 1,
      sides: 6,
      bonus: 2,
      type: "slashing",
      attackType: "weapon",
      label: "1d6 + 2 slashing",
      range: {
        kind: "ranged",
        normal: 40,
        long: 120,
        feet: 40
      }
    },
    initiativeBonus: 2,
    speedFeet: 30,
    flying: true,
    behavior: "rangedKiter",
    token: "T",
    tokenArt: "assets/tokens/talon-hawk.jpg",
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("talonHawk");

  window.DungeonContent.register("monsters", "oldGraniteRam", {
    name: "Old Granite Ram",
    role: "Category 1 mountain beast boss",
    tags: [
      "beast",
      "mountain",
      "ram",
      "boss"
    ],
    maxHp: 28,
    category: 1,
    xp: 120,
    ac: 13,
    attackBonus: 5,
    damage: {
      count: 1,
      sides: 8,
      bonus: 3,
      type: "bludgeoning",
      attackType: "weapon",
      label: "1d8 + 3 bludgeoning"
    },
    initiativeBonus: 1,
    speedFeet: 35,
    behavior: "melee",
    token: "O",


    tokenArt: "assets/tokens/old-granite-ram.jpg",
    specialAbility: [
      "Charge",
      "RockClimber"
    ],
    extraLoot: [
      {
        kind: "randomEquipment"
      }
    ]
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("oldGraniteRam");

  // Category 2
  window.DungeonContent.register("monsters", "direCragWolf", {
    name: "Dire Crag Wolf",
    role: "Large mountain hunter",
    tags: [
      "beast",
      "mountain",
      "wolf"
    ],
    maxHp: 25,
    category: 2,
    xp: 140,
    ac: 14,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 8,
      bonus: 3,
      type: "piercing",
      attackType: "weapon",
      label: "1d8 + 3 piercing"
    },
    initiativeBonus: 2,
    speedFeet: 35,
    behavior: "melee",
    token: "D",

    tokenArt: "assets/tokens/dire-crag-wolf.jpg",
    specialAbility: [
      "Pounce",
      "RockClimber"
    ]
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("direCragWolf");

  window.DungeonContent.register("monsters", "boulderBoar", {
    name: "Boulder Boar",
    role: "Heavy mountain charger",
    tags: [
      "beast",
      "mountain",
      "boar"
    ],
    maxHp: 32,
    category: 2,
    xp: 155,
    ac: 13,
    attackBonus: 5,
    damage: {
      count: 1,
      sides: 10,
      bonus: 3,
      type: "piercing",
      attackType: "weapon",
      label: "1d10 + 3 piercing"
    },
    initiativeBonus: 0,
    speedFeet: 30,
    behavior: "melee",
    token: "B",


    tokenArt: "assets/tokens/boulder-boar.jpg",
    specialAbility: [
      "Charge"
    ]
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("boulderBoar");

  window.DungeonContent.register("monsters", "ironhornRam", {
    name: "Ironhorn Ram",
    role: "Armored mountain beast",
    tags: [
      "beast",
      "mountain",
      "ram"
    ],
    maxHp: 36,
    category: 2,
    xp: 165,
    ac: 16,
    attackBonus: 5,
    damage: {
      count: 1,
      sides: 8,
      bonus: 3,
      type: "bludgeoning",
      attackType: "weapon",
      label: "1d8 + 3 bludgeoning"
    },
    initiativeBonus: 0,
    speedFeet: 25,
    behavior: "melee",
    token: "I",


    tokenArt: "assets/tokens/ironhorn-ram.jpg",
    damageResistances: [
      "bludgeoning"
    ],
    specialAbility: [
      "ThickHide",
      "RockClimber"
    ]
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("ironhornRam");

  window.DungeonContent.register("monsters", "ridgeLion", {
    name: "Ridge Lion",
    role: "Fast mountain predator",
    tags: [
      "beast",
      "mountain",
      "cat"
    ],
    maxHp: 22,
    category: 2,
    xp: 130,
    ac: 15,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 8,
      bonus: 3,
      type: "slashing",
      attackType: "weapon",
      label: "1d8 + 3 slashing"
    },
    initiativeBonus: 4,
    speedFeet: 45,
    behavior: "melee",
    token: "R",


    tokenArt: "assets/tokens/ridge-lion.jpg",
    specialAbility: [
      "Pounce",
      "RockClimber"
    ]
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("ridgeLion");

  window.DungeonContent.register("monsters", "scarredPeakBear", {
    name: "Scarred Peak Bear",
    role: "Category 2 mountain beast boss",
    tags: [
      "beast",
      "mountain",
      "bear",
      "boss"
    ],
    maxHp: 46,
    category: 2,
    xp: 250,
    ac: 15,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 10,
      bonus: 4,
      type: "slashing",
      attackType: "weapon",
      label: "1d10 + 4 slashing"
    },
    initiativeBonus: 2,
    speedFeet: 35,
    behavior: "melee",
    token: "S",


    tokenArt: "assets/tokens/scarred-peak-bear.jpg",
    specialAbility: [
      "BossRoar",
      "RockClimber"
    ],
    extraLoot: [
      {
        kind: "randomEquipment"
      }
    ]
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("scarredPeakBear");

  // Category 3
  window.DungeonContent.register("monsters", "avalancheRam", {
    name: "Avalanche Ram",
    role: "Elite mountain charger",
    tags: [
      "beast",
      "mountain",
      "ram"
    ],
    maxHp: 42,
    category: 3,
    xp: 260,
    ac: 15,
    attackBonus: 7,
    damage: {
      count: 1,
      sides: 10,
      bonus: 4,
      type: "bludgeoning",
      attackType: "weapon",
      label: "1d10 + 4 bludgeoning"
    },
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "A",

    tokenArt: "assets/tokens/avalanche-ram.jpg",
    specialAbility: [
      "Charge",
      "RockClimber"
    ]
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("avalancheRam");

  window.DungeonContent.register("monsters", "skyTalonRocling", {
    name: "Sky-Talon Rocling",
    role: "Young giant mountain bird",
    tags: [
      "beast",
      "mountain",
      "bird",
      "flying"
    ],
    maxHp: 38,
    category: 3,
    xp: 250,
    ac: 16,
    attackBonus: 7,
    damage: {
      count: 1,
      sides: 8,
      bonus: 5,
      type: "slashing",
      attackType: "weapon",
      label: "1d8 + 5 slashing"
    },
    initiativeBonus: 4,
    speedFeet: 50,
    flying: true,
    behavior: "melee",
    token: "S",


    tokenArt: "assets/tokens/sky-talon-rocling.jpg",
    specialAbility: [
      "Pounce"
    ]
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("skyTalonRocling");

  window.DungeonContent.register("monsters", "granitebackBear", {
    name: "Graniteback Bear",
    role: "Huge armored mountain bear",
    tags: [
      "beast",
      "mountain",
      "bear"
    ],
    maxHp: 56,
    category: 3,
    xp: 290,
    ac: 16,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 10,
      bonus: 4,
      type: "slashing",
      attackType: "weapon",
      label: "1d10 + 4 slashing"
    },
    initiativeBonus: 0,
    speedFeet: 25,
    behavior: "melee",
    token: "G",


    tokenArt: "assets/tokens/graniteback-bear.jpg",
    damageResistances: [
      "bludgeoning"
    ],
    specialAbility: [
      "ThickHide"
    ]
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("granitebackBear");

  window.DungeonContent.register("monsters", "mountainManeLion", {
    name: "Mountain-Mane Lion",
    role: "Apex mountain cat",
    tags: [
      "beast",
      "mountain",
      "cat"
    ],
    maxHp: 42,
    category: 3,
    xp: 260,
    ac: 15,
    attackBonus: 7,
    damage: {
      count: 1,
      sides: 10,
      bonus: 4,
      type: "slashing",
      attackType: "weapon",
      label: "1d10 + 4 slashing"
    },
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "M",


    tokenArt: "assets/tokens/mountain-mane-lion.jpg",
    specialAbility: [
      "Pounce",
      "BloodFrenzy"
    ]
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("mountainManeLion");

  window.DungeonContent.register("monsters", "ancientStonehornYak", {
    name: "Ancient Stonehorn Yak",
    role: "Category 3 mountain beast boss",
    tags: [
      "beast",
      "mountain",
      "yak",
      "boss"
    ],
    maxHp: 70,
    category: 3,
    xp: 430,
    ac: 16,
    attackBonus: 7,
    damage: {
      count: 1,
      sides: 12,
      bonus: 5,
      type: "bludgeoning",
      attackType: "weapon",
      label: "1d12 + 5 bludgeoning"
    },
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "A",


    tokenArt: "assets/tokens/ancient-stonehorn-yak.jpg",
    damageResistances: [
      "bludgeoning"
    ],
    specialAbility: [
      "Stampede",
      "BossRoar"
    ],
    extraLoot: [
      {
        kind: "randomEquipment"
      }
    ]
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("ancientStonehornYak");


  /* ============================================================
   * BEAST + GRASSLAND
   * ============================================================ */

  // Category 1
  window.DungeonContent.register("monsters", "prairieJackal", {
    name: "Prairie Jackal",
    role: "Small grassland hunter",
    tags: [
      "beast",
      "grassland",
      "jackal"
    ],
    maxHp: 9,
    category: 1,
    xp: 40,
    ac: 13,
    attackBonus: 4,
    damage: {
      count: 1,
      sides: 4,
      bonus: 2,
      type: "piercing",
      attackType: "weapon",
      label: "1d4 + 2 piercing"
    },
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "P",

    tokenArt: "assets/tokens/prairie-jackal.jpg",
    specialAbility: [
      "Pounce"
    ]
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("prairieJackal");

  window.DungeonContent.register("monsters", "fieldBoar", {
    name: "Field Boar",
    role: "Aggressive grassland charger",
    tags: [
      "beast",
      "grassland",
      "boar"
    ],
    maxHp: 16,
    category: 1,
    xp: 60,
    ac: 12,
    attackBonus: 4,
    damage: {
      count: 1,
      sides: 8,
      bonus: 2,
      type: "piercing",
      attackType: "weapon",
      label: "1d8 + 2 piercing"
    },
    initiativeBonus: 0,
    speedFeet: 30,
    behavior: "melee",
    token: "F",


    tokenArt: "assets/tokens/field-boar.jpg",
    specialAbility: [
      "Charge"
    ]
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("fieldBoar");

  window.DungeonContent.register("monsters", "swiftStepAntelope", {
    name: "Swift-Step Antelope",
    role: "Fast grassland beast",
    tags: [
      "beast",
      "grassland",
      "antelope"
    ],
    maxHp: 9,
    category: 1,
    xp: 40,
    ac: 13,
    attackBonus: 4,
    damage: {
      count: 1,
      sides: 4,
      bonus: 2,
      type: "bludgeoning",
      attackType: "weapon",
      label: "1d4 + 2 bludgeoning"
    },
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "S",
    tokenArt: "assets/tokens/swift-step-antelope.jpg",
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("swiftStepAntelope");

  window.DungeonContent.register("monsters", "burrowMongoose", {
    name: "Burrow Mongoose",
    role: "Small darting hunter",
    tags: [
      "beast",
      "grassland",
      "mongoose"
    ],
    maxHp: 12,
    category: 1,
    xp: 50,
    ac: 13,
    attackBonus: 4,
    damage: {
      count: 1,
      sides: 6,
      bonus: 2,
      type: "piercing",
      attackType: "weapon",
      label: "1d6 + 2 piercing"
    },
    initiativeBonus: 2,
    speedFeet: 35,
    behavior: "melee",
    token: "B",
    tokenArt: "assets/tokens/burrow-mongoose.jpg",
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("burrowMongoose");

  window.DungeonContent.register("monsters", "oldPlainstusk", {
    name: "Old Plainstusk",
    role: "Category 1 grassland beast boss",
    tags: [
      "beast",
      "grassland",
      "boar",
      "boss"
    ],
    maxHp: 28,
    category: 1,
    xp: 120,
    ac: 13,
    attackBonus: 5,
    damage: {
      count: 1,
      sides: 8,
      bonus: 3,
      type: "piercing",
      attackType: "weapon",
      label: "1d8 + 3 piercing"
    },
    initiativeBonus: 1,
    speedFeet: 35,
    behavior: "melee",
    token: "O",


    tokenArt: "assets/tokens/old-plainstusk.jpg",
    specialAbility: [
      "Charge",
      "BossRoar"
    ],
    extraLoot: [
      {
        kind: "randomEquipment"
      }
    ]
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("oldPlainstusk");

  // Category 2
  window.DungeonContent.register("monsters", "savannaLioness", {
    name: "Savanna Lioness",
    role: "Large grassland predator",
    tags: [
      "beast",
      "grassland",
      "cat"
    ],
    maxHp: 22,
    category: 2,
    xp: 130,
    ac: 15,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 8,
      bonus: 3,
      type: "slashing",
      attackType: "weapon",
      label: "1d8 + 3 slashing"
    },
    initiativeBonus: 4,
    speedFeet: 45,
    behavior: "melee",
    token: "S",

    tokenArt: "assets/tokens/savanna-lioness.jpg",
    specialAbility: [
      "Pounce"
    ]
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("savannaLioness");

  window.DungeonContent.register("monsters", "plainstalkerHyena", {
    name: "Plainstalker Hyena",
    role: "Enduring scavenger hunter",
    tags: [
      "beast",
      "grassland",
      "hyena"
    ],
    maxHp: 25,
    category: 2,
    xp: 140,
    ac: 14,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 8,
      bonus: 3,
      type: "piercing",
      attackType: "weapon",
      label: "1d8 + 3 piercing"
    },
    initiativeBonus: 2,
    speedFeet: 35,
    behavior: "melee",
    token: "P",


    tokenArt: "assets/tokens/plainstalker-hyena.jpg",
    specialAbility: [
      "BloodFrenzy"
    ]
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("plainstalkerHyena");

  window.DungeonContent.register("monsters", "thunderhoofBison", {
    name: "Thunderhoof Bison",
    role: "Heavy grassland charger",
    tags: [
      "beast",
      "grassland",
      "bison"
    ],
    maxHp: 32,
    category: 2,
    xp: 155,
    ac: 13,
    attackBonus: 5,
    damage: {
      count: 1,
      sides: 10,
      bonus: 3,
      type: "bludgeoning",
      attackType: "weapon",
      label: "1d10 + 3 bludgeoning"
    },
    initiativeBonus: 0,
    speedFeet: 30,
    behavior: "melee",
    token: "T",


    tokenArt: "assets/tokens/thunderhoof-bison.jpg",
    specialAbility: [
      "Charge"
    ]
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("thunderhoofBison");

  window.DungeonContent.register("monsters", "shieldbackPangolin", {
    name: "Shieldback Pangolin",
    role: "Armored grassland beast",
    tags: [
      "beast",
      "grassland",
      "pangolin"
    ],
    maxHp: 36,
    category: 2,
    xp: 165,
    ac: 16,
    attackBonus: 5,
    damage: {
      count: 1,
      sides: 8,
      bonus: 3,
      type: "slashing",
      attackType: "weapon",
      label: "1d8 + 3 slashing"
    },
    initiativeBonus: 0,
    speedFeet: 25,
    behavior: "melee",
    token: "S",


    tokenArt: "assets/tokens/shieldback-pangolin.jpg",
    damageResistances: [
      "slashing"
    ],
    specialAbility: [
      "ShellGuard"
    ]
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("shieldbackPangolin");

  window.DungeonContent.register("monsters", "scarredSavannaLion", {
    name: "Scarred Savanna Lion",
    role: "Category 2 grassland beast boss",
    tags: [
      "beast",
      "grassland",
      "cat",
      "boss"
    ],
    maxHp: 46,
    category: 2,
    xp: 250,
    ac: 15,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 10,
      bonus: 4,
      type: "slashing",
      attackType: "weapon",
      label: "1d10 + 4 slashing"
    },
    initiativeBonus: 2,
    speedFeet: 35,
    behavior: "melee",
    token: "S",


    tokenArt: "assets/tokens/scarred-savanna-lion.jpg",
    specialAbility: [
      "Pounce",
      "BossRoar"
    ],
    extraLoot: [
      {
        kind: "randomEquipment"
      }
    ]
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("scarredSavannaLion");

  // Category 3
  window.DungeonContent.register("monsters", "elderPrairieLion", {
    name: "Elder Prairie Lion",
    role: "Elite grassland predator",
    tags: [
      "beast",
      "grassland",
      "cat"
    ],
    maxHp: 38,
    category: 3,
    xp: 250,
    ac: 16,
    attackBonus: 7,
    damage: {
      count: 1,
      sides: 8,
      bonus: 5,
      type: "slashing",
      attackType: "weapon",
      label: "1d8 + 5 slashing"
    },
    initiativeBonus: 4,
    speedFeet: 50,
    behavior: "melee",
    token: "E",

    tokenArt: "assets/tokens/elder-prairie-lion.jpg",
    specialAbility: [
      "Pounce"
    ]
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("elderPrairieLion");

  window.DungeonContent.register("monsters", "stampedeBison", {
    name: "Stampede Bison",
    role: "Massive grassland charger",
    tags: [
      "beast",
      "grassland",
      "bison"
    ],
    maxHp: 52,
    category: 3,
    xp: 280,
    ac: 14,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 12,
      bonus: 4,
      type: "bludgeoning",
      attackType: "weapon",
      label: "1d12 + 4 bludgeoning"
    },
    initiativeBonus: 0,
    speedFeet: 30,
    behavior: "melee",
    token: "S",


    tokenArt: "assets/tokens/stampede-bison.jpg",
    specialAbility: [
      "Stampede"
    ]
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("stampedeBison");

  window.DungeonContent.register("monsters", "ironhideRhino", {
    name: "Ironhide Rhino",
    role: "Armored grassland brute",
    tags: [
      "beast",
      "grassland",
      "rhino"
    ],
    maxHp: 56,
    category: 3,
    xp: 290,
    ac: 16,
    attackBonus: 6,
    damage: {
      count: 1,
      sides: 10,
      bonus: 4,
      type: "piercing",
      attackType: "weapon",
      label: "1d10 + 4 piercing"
    },
    initiativeBonus: 0,
    speedFeet: 25,
    behavior: "melee",
    token: "I",


    tokenArt: "assets/tokens/ironhide-rhino.jpg",
    damageResistances: [
      "piercing"
    ],
    specialAbility: [
      "ThickHide",
      "Charge"
    ]
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("ironhideRhino");

  window.DungeonContent.register("monsters", "razorManeHyena", {
    name: "Razor-Mane Hyena",
    role: "Savage grassland scavenger",
    tags: [
      "beast",
      "grassland",
      "hyena"
    ],
    maxHp: 42,
    category: 3,
    xp: 260,
    ac: 15,
    attackBonus: 7,
    damage: {
      count: 1,
      sides: 10,
      bonus: 4,
      type: "piercing",
      attackType: "weapon",
      label: "1d10 + 4 piercing"
    },
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "R",


    tokenArt: "assets/tokens/razor-mane-hyena.jpg",
    specialAbility: [
      "BloodFrenzy"
    ]
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("razorManeHyena");

  window.DungeonContent.register("monsters", "ancientThunderhoof", {
    name: "Ancient Thunderhoof",
    role: "Category 3 grassland beast boss",
    tags: [
      "beast",
      "grassland",
      "bison",
      "boss"
    ],
    maxHp: 70,
    category: 3,
    xp: 430,
    ac: 16,
    attackBonus: 7,
    damage: {
      count: 1,
      sides: 12,
      bonus: 5,
      type: "bludgeoning",
      attackType: "weapon",
      label: "1d12 + 5 bludgeoning"
    },
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "A",


    tokenArt: "assets/tokens/ancient-thunderhoof.jpg",
    specialAbility: [
      "Stampede",
      "BossRoar"
    ],
    extraLoot: [
      {
        kind: "randomEquipment"
      }
    ]
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("ancientThunderhoof");
})();
