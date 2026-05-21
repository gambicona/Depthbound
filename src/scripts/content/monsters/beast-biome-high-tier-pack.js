(() => {
  window.BeastBiomeMonsterIds = window.BeastBiomeMonsterIds || {};

  window.BeastBiomeHighTierPackNotes = {
    ...(window.BeastBiomeHighTierPackNotes || {}),
    scope: "High-tier beast expansion for categories 4-10.",
    structure: "Each biome receives 2 regular beasts and 1 boss per category.",
    biomes: ["forest", "desert", "underground", "swamp", "arctic", "urban", "water", "mountain", "grassland"],
  };

  /* ============================================================
   * BEAST BIOME HIGH-TIER PACK
   * Categories 4-10
   * 9 biomes x 7 categories x 3 monsters = 189 monsters
   *
   * First tag is always the D&D-style creature type: "beast".
   * ============================================================ */


  /* ============================================================
   * BEAST + FOREST
   * ============================================================ */


  // Category 4 — Party Level 7/8

  window.DungeonContent.register("monsters", "highTierIronwoodBear", {
    name: "Ironwood Bear",
    role: "Armored forest bruiser",
    sizeSquares: 2,
    tags: [
      "beast",
      "forest",
      "bear"
    ],
    maxHp: 78,
    category: 4,
    multiattack: { attacks: 2 },
    xp: 850,
    ac: 16,
    attackBonus: 8,
    damage: {
      count: 3,
      sides: 6,
      bonus: 4,
      type: "bludgeoning",
      attackType: "weapon",
      label: "3d6 + 4 bludgeoning",
    },
    specialAbility: [
      "Briarhide", // Defensive brace: briefly reduces incoming damage or grants a defensive stance.
      "Mauling Rush", // Charge/pounce hit: if moved far enough, adds damage and may shove/prone.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "I",
    tokenArt: "assets/tokens/ironwood-bear.jpg",
  });
  window.BeastBiomeMonsterIds.forest = window.BeastBiomeMonsterIds.forest || [];
  window.BeastBiomeMonsterIds.forest.push("highTierIronwoodBear");

  window.DungeonContent.register("monsters", "highTierThornbackStag", {
    name: "Thornback Stag",
    role: "Charging antler predator",
    tags: [
      "beast",
      "forest",
      "stag"
    ],
    maxHp: 88,
    category: 4,
    multiattack: { attacks: 2 },
    xp: 1100,
    ac: 17,
    attackBonus: 8,
    damage: {
      count: 3,
      sides: 8,
      bonus: 4,
      type: "bludgeoning",
      attackType: "weapon",
      label: "3d8 + 4 bludgeoning",
    },
    specialAbility: [
      "Charge", // If the monster moved at least 20 ft before attacking, hit adds bonus damage and may shove.
      "Thornhide", // Defensive brace/riposte: reduces damage or harms melee attackers.
    ],
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "T",
    tokenArt: "assets/tokens/thornback-stag.jpg",
  });
  window.BeastBiomeMonsterIds.forest = window.BeastBiomeMonsterIds.forest || [];
  window.BeastBiomeMonsterIds.forest.push("highTierThornbackStag");

  window.DungeonContent.register("monsters", "highTierElderBriarboar", {
    name: "Elder Briarboar",
    role: "Category 4 forest beast boss",
    tags: [
      "beast",
      "forest",
      "boar",
      "boss"
    ],
    maxHp: 152,
    category: 4,
    multiattack: { attacks: 2 },
    xp: 2400,
    ac: 18,
    attackBonus: 9,
    damage: {
      count: 3,
      sides: 10,
      bonus: 5,
      type: "bludgeoning",
      attackType: "weapon",
      label: "3d10 + 5 bludgeoning",
    },
    specialAbility: [
      "Charge", // If the monster moved at least 20 ft before attacking, hit adds bonus damage and may shove.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
      "SelfHeal", // Once per fight below half HP: heals a small amount.
    ],
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "E",
    tokenArt: "assets/tokens/elder-briarboar.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.forest = window.BeastBiomeMonsterIds.forest || [];
  window.BeastBiomeMonsterIds.forest.push("highTierElderBriarboar");


  // Category 5 — Party Level 9/10

  window.DungeonContent.register("monsters", "highTierMoonfangDireWolf", {
    name: "Moonfang Dire Wolf",
    role: "Fast pack hunter",
    tags: [
      "beast",
      "forest",
      "wolf"
    ],
    maxHp: 108,
    category: 5,
    multiattack: { attacks: 2 },
    xp: 1900,
    ac: 17,
    attackBonus: 9,
    damage: {
      count: 4,
      sides: 6,
      bonus: 5,
      type: "slashing",
      attackType: "weapon",
      label: "4d6 + 5 slashing",
    },
    specialAbility: [
      "Hamstring Bite", // On hit: target saves or movement is reduced briefly.
      "BloodFrenzy", // Start-of-turn: at or below half HP, gains +1 attack for that turn.
    ],
    initiativeBonus: 4,
    speedFeet: 50,
    behavior: "melee",
    token: "M",
    tokenArt: "assets/tokens/moonfang-dire-wolf.jpg",
  });
  window.BeastBiomeMonsterIds.forest = window.BeastBiomeMonsterIds.forest || [];
  window.BeastBiomeMonsterIds.forest.push("highTierMoonfangDireWolf");

  window.DungeonContent.register("monsters", "highTierGloomwebBroodmother", {
    name: "Gloomweb Broodmother",
    role: "Huge venomous spider",
    sizeSquares: 2,
    tags: [
      "beast",
      "forest",
      "spider",
      "poison"
    ],
    maxHp: 126,
    category: 5,
    multiattack: { attacks: 2 },
    xp: 2300,
    ac: 16,
    attackBonus: 9,
    damage: {
      count: 4,
      sides: 8,
      bonus: 5,
      type: "piercing",
      attackType: "weapon",
      label: "4d8 + 5 piercing",
    },
    damageResistances: [
      "poison"
    ],
    specialAbility: [
      "WebSnare", // Ranged/status: Dex save or speed becomes 0 briefly.
      "VenomBite", // On hit: Con save or extra poison damage.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "G",
    tokenArt: "assets/tokens/gloomweb-broodmother.jpg",
  });
  window.BeastBiomeMonsterIds.forest = window.BeastBiomeMonsterIds.forest || [];
  window.BeastBiomeMonsterIds.forest.push("highTierGloomwebBroodmother");

  window.DungeonContent.register("monsters", "highTierOakmawCaveBear", {
    name: "Oakmaw Cave Bear",
    role: "Category 5 forest beast boss",
    sizeSquares: 2,
    tags: [
      "beast",
      "forest",
      "bear",
      "boss"
    ],
    maxHp: 220,
    category: 5,
    multiattack: { attacks: 2 },
    xp: 5200,
    ac: 19,
    attackBonus: 10,
    damage: {
      count: 4,
      sides: 10,
      bonus: 6,
      type: "bludgeoning",
      attackType: "weapon",
      label: "4d10 + 6 bludgeoning",
    },
    specialAbility: [
      "Mauling Rush", // Charge/pounce hit: if moved far enough, adds damage and may shove/prone.
      "Briarhide", // Defensive brace: briefly reduces incoming damage or grants a defensive stance.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 30,
    behavior: "melee",
    token: "O",
    tokenArt: "assets/tokens/oakmaw-cave-bear.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.forest = window.BeastBiomeMonsterIds.forest || [];
  window.BeastBiomeMonsterIds.forest.push("highTierOakmawCaveBear");


  // Category 6 — Party Level 11/12

  window.DungeonContent.register("monsters", "highTierMossHornMegaloceros", {
    name: "Moss-Horn Megaloceros",
    role: "Huge trampling forest grazer",
    sizeSquares: 2,
    tags: [
      "beast",
      "forest",
      "stag"
    ],
    maxHp: 148,
    category: 6,
    multiattack: { attacks: 2 },
    xp: 3400,
    ac: 18,
    attackBonus: 10,
    damage: {
      count: 5,
      sides: 6,
      bonus: 6,
      type: "bludgeoning",
      attackType: "weapon",
      label: "5d6 + 6 bludgeoning",
    },
    specialAbility: [
      "Stampede", // Line/charge effect: save or take bludgeoning damage and be pushed.
      "Charge", // If the monster moved at least 20 ft before attacking, hit adds bonus damage and may shove.
    ],
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "M",
    tokenArt: "assets/tokens/moss-horn-megaloceros.jpg",
  });
  window.BeastBiomeMonsterIds.forest = window.BeastBiomeMonsterIds.forest || [];
  window.BeastBiomeMonsterIds.forest.push("highTierMossHornMegaloceros");

  window.DungeonContent.register("monsters", "highTierGreenfangPanther", {
    name: "Greenfang Panther",
    role: "Silent forest ambusher",
    tags: [
      "beast",
      "forest",
      "cat"
    ],
    maxHp: 172,
    category: 6,
    multiattack: { attacks: 2 },
    xp: 4700,
    ac: 17,
    attackBonus: 11,
    damage: {
      count: 5,
      sides: 8,
      bonus: 6,
      type: "slashing",
      attackType: "weapon",
      label: "5d8 + 6 slashing",
    },
    specialAbility: [
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
      "Predator Lunge", // Charge/pounce hit: if moved far enough, adds damage and may shove/prone.
    ],
    initiativeBonus: 4,
    speedFeet: 50,
    behavior: "melee",
    token: "G",
    tokenArt: "assets/tokens/greenfang-panther.jpg",
  });
  window.BeastBiomeMonsterIds.forest = window.BeastBiomeMonsterIds.forest || [];
  window.BeastBiomeMonsterIds.forest.push("highTierGreenfangPanther");

  window.DungeonContent.register("monsters", "highTierThousandBrambleBoar", {
    name: "Thousand-Bramble Boar",
    role: "Category 6 forest beast boss",
    tags: [
      "beast",
      "forest",
      "boar",
      "boss"
    ],
    maxHp: 310,
    category: 6,
    multiattack: { attacks: 2 },
    xp: 8600,
    ac: 20,
    attackBonus: 11,
    damage: {
      count: 5,
      sides: 10,
      bonus: 7,
      type: "bludgeoning",
      attackType: "weapon",
      label: "5d10 + 7 bludgeoning",
    },
    specialAbility: [
      "Charge", // If the monster moved at least 20 ft before attacking, hit adds bonus damage and may shove.
      "Thornhide", // Defensive brace/riposte: reduces damage or harms melee attackers.
      "Root-Rending Roar", // Boss roar-style control: nearby targets save or take a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "T",
    tokenArt: "assets/tokens/thousand-bramble-boar.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.forest = window.BeastBiomeMonsterIds.forest || [];
  window.BeastBiomeMonsterIds.forest.push("highTierThousandBrambleBoar");


  // Category 7 — Party Level 13/14

  window.DungeonContent.register("monsters", "highTierAncientDireOwlbear", {
    name: "Ancient Dire Owlbear",
    role: "Savage old-growth predator",
    sizeSquares: 2,
    tags: [
      "beast",
      "forest",
      "owlbear"
    ],
    maxHp: 196,
    category: 7,
    multiattack: { attacks: 3 },
    xp: 6400,
    ac: 19,
    attackBonus: 11,
    damage: {
      count: 6,
      sides: 6,
      bonus: 7,
      type: "slashing",
      attackType: "weapon",
      label: "6d6 + 7 slashing",
    },
    specialAbility: [
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
      "BloodFrenzy", // Start-of-turn: at or below half HP, gains +1 attack for that turn.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "A",
    tokenArt: "assets/tokens/ancient-dire-owlbear.jpg",
  });
  window.BeastBiomeMonsterIds.forest = window.BeastBiomeMonsterIds.forest || [];
  window.BeastBiomeMonsterIds.forest.push("highTierAncientDireOwlbear");

  window.DungeonContent.register("monsters", "highTierVenomrootSerpent", {
    name: "Venomroot Serpent",
    role: "Poisonous root-colored constrictor",
    sizeSquares: 2,
    tags: [
      "beast",
      "forest",
      "snake",
      "poison"
    ],
    maxHp: 224,
    category: 7,
    multiattack: { attacks: 3 },
    xp: 8200,
    ac: 18,
    attackBonus: 12,
    damage: {
      count: 6,
      sides: 8,
      bonus: 7,
      type: "piercing",
      attackType: "weapon",
      label: "6d8 + 7 piercing",
    },
    damageResistances: [
      "poison"
    ],
    specialAbility: [
      "VenomBite", // On hit: Con save or extra poison damage.
      "Constricting Coil", // On hit/status: target saves or is briefly restrained.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "V",
    tokenArt: "assets/tokens/venomroot-serpent.jpg",
  });
  window.BeastBiomeMonsterIds.forest = window.BeastBiomeMonsterIds.forest || [];
  window.BeastBiomeMonsterIds.forest.push("highTierVenomrootSerpent");

  window.DungeonContent.register("monsters", "highTierHartOfTheSleepingGrove", {
    name: "Hart of the Sleeping Grove",
    role: "Category 7 forest beast boss",
    tags: [
      "beast",
      "forest",
      "stag",
      "boss"
    ],
    maxHp: 390,
    category: 7,
    multiattack: { attacks: 3 },
    xp: 13200,
    ac: 21,
    attackBonus: 12,
    damage: {
      count: 6,
      sides: 10,
      bonus: 8,
      type: "bludgeoning",
      attackType: "weapon",
      label: "6d10 + 8 bludgeoning",
    },
    specialAbility: [
      "Stampede", // Line/charge effect: save or take bludgeoning damage and be pushed.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
      "SelfHeal", // Once per fight below half HP: heals a small amount.
    ],
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "H",
    tokenArt: "assets/tokens/hart-of-the-sleeping-grove.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.forest = window.BeastBiomeMonsterIds.forest || [];
  window.BeastBiomeMonsterIds.forest.push("highTierHartOfTheSleepingGrove");


  // Category 8 — Party Level 15/16

  window.DungeonContent.register("monsters", "highTierElderMossbackMammoth", {
    name: "Elder Mossback Mammoth",
    role: "Massive forest trampler",
    sizeSquares: 2,
    tags: [
      "beast",
      "forest",
      "mammoth"
    ],
    maxHp: 248,
    category: 8,
    multiattack: { attacks: 3 },
    xp: 9200,
    ac: 20,
    attackBonus: 12,
    damage: {
      count: 6,
      sides: 10,
      bonus: 8,
      type: "bludgeoning",
      attackType: "weapon",
      label: "6d10 + 8 bludgeoning",
    },
    specialAbility: [
      "Stampede", // Line/charge effect: save or take bludgeoning damage and be pushed.
      "ThickHide", // Passive/defensive: expresses physical toughness or resistance.
    ],
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "E",
    tokenArt: "assets/tokens/elder-mossback-mammoth.jpg",
  });
  window.BeastBiomeMonsterIds.forest = window.BeastBiomeMonsterIds.forest || [];
  window.BeastBiomeMonsterIds.forest.push("highTierElderMossbackMammoth");

  window.DungeonContent.register("monsters", "highTierNightleafRoc", {
    name: "Nightleaf Roc",
    role: "Dark-winged forest hunter",
    sizeSquares: 2,
    tags: [
      "beast",
      "forest",
      "bird",
      "flying"
    ],
    maxHp: 288,
    category: 8,
    multiattack: { attacks: 3 },
    xp: 11800,
    ac: 19,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 8,
      bonus: 8,
      type: "slashing",
      attackType: "weapon",
      label: "7d8 + 8 slashing",
    },
    specialAbility: [
      "Swooping Strike", // Flying charge hit: if moved far enough, hit adds damage and may shove/prone.
      "Predator Lunge", // Charge/pounce hit: if moved far enough, adds damage and may shove/prone.
    ],
    initiativeBonus: 4,
    speedFeet: 60,
    flying: true,
    behavior: "melee",
    token: "N",
    tokenArt: "assets/tokens/nightleaf-roc.jpg",
  });
  window.BeastBiomeMonsterIds.forest = window.BeastBiomeMonsterIds.forest || [];
  window.BeastBiomeMonsterIds.forest.push("highTierNightleafRoc");

  window.DungeonContent.register("monsters", "highTierRootTuskBehemoth", {
    name: "Root-Tusk Behemoth",
    role: "Category 8 forest beast boss",
    sizeSquares: 2,
    tags: [
      "beast",
      "forest",
      "boar",
      "boss"
    ],
    maxHp: 490,
    category: 8,
    multiattack: { attacks: 3 },
    xp: 18400,
    ac: 22,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 10,
      bonus: 9,
      type: "bludgeoning",
      attackType: "weapon",
      label: "7d10 + 9 bludgeoning",
    },
    specialAbility: [
      "Thunder Charge", // Charge hit: save or thunder damage and shove/prone.
      "Briarhide", // Defensive brace: briefly reduces incoming damage or grants a defensive stance.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "R",
    tokenArt: "assets/tokens/root-tusk-behemoth.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.forest = window.BeastBiomeMonsterIds.forest || [];
  window.BeastBiomeMonsterIds.forest.push("highTierRootTuskBehemoth");


  // Category 9 — Party Level 17/18

  window.DungeonContent.register("monsters", "highTierPrimevalFangcat", {
    name: "Primeval Fangcat",
    role: "Apex old-forest stalker",
    tags: [
      "beast",
      "forest",
      "cat"
    ],
    maxHp: 318,
    category: 9,
    multiattack: { attacks: 3 },
    xp: 13800,
    ac: 21,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 8,
      bonus: 9,
      type: "slashing",
      attackType: "weapon",
      label: "7d8 + 9 slashing",
    },
    specialAbility: [
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
      "BloodFrenzy", // Start-of-turn: at or below half HP, gains +1 attack for that turn.
    ],
    initiativeBonus: 4,
    speedFeet: 50,
    behavior: "melee",
    token: "P",
    tokenArt: "assets/tokens/primeval-fangcat.jpg",
  });
  window.BeastBiomeMonsterIds.forest = window.BeastBiomeMonsterIds.forest || [];
  window.BeastBiomeMonsterIds.forest.push("highTierPrimevalFangcat");

  window.DungeonContent.register("monsters", "highTierStormbarkElk", {
    name: "Stormbark Elk",
    role: "Thunderous antlered giant",
    sizeSquares: 2,
    tags: [
      "beast",
      "forest",
      "elk"
    ],
    maxHp: 348,
    category: 9,
    multiattack: { attacks: 3 },
    xp: 16200,
    ac: 20,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 10,
      bonus: 9,
      type: "bludgeoning",
      attackType: "weapon",
      label: "7d10 + 9 bludgeoning",
    },
    specialAbility: [
      "Thunder Charge", // Charge hit: save or thunder damage and shove/prone.
      "Charge", // If the monster moved at least 20 ft before attacking, hit adds bonus damage and may shove.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "S",
    tokenArt: "assets/tokens/stormbark-elk.jpg",
  });
  window.BeastBiomeMonsterIds.forest = window.BeastBiomeMonsterIds.forest || [];
  window.BeastBiomeMonsterIds.forest.push("highTierStormbarkElk");

  window.DungeonContent.register("monsters", "highTierOldKingBear", {
    name: "Old King Bear",
    role: "Category 9 forest beast boss",
    sizeSquares: 2,
    tags: [
      "beast",
      "forest",
      "bear",
      "boss"
    ],
    maxHp: 575,
    category: 9,
    multiattack: { attacks: 3 },
    xp: 22400,
    ac: 23,
    attackBonus: 14,
    damage: {
      count: 8,
      sides: 10,
      bonus: 10,
      type: "bludgeoning",
      attackType: "weapon",
      label: "8d10 + 10 bludgeoning",
    },
    specialAbility: [
      "Mauling Rush", // Charge/pounce hit: if moved far enough, adds damage and may shove/prone.
      "SelfHeal", // Once per fight below half HP: heals a small amount.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 30,
    behavior: "melee",
    token: "O",
    tokenArt: "assets/tokens/old-king-bear.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.forest = window.BeastBiomeMonsterIds.forest || [];
  window.BeastBiomeMonsterIds.forest.push("highTierOldKingBear");


  // Category 10 — Party Level 19/20

  window.DungeonContent.register("monsters", "highTierWorldwoodMammoth", {
    name: "Worldwood Mammoth",
    role: "Living mountain of forest flesh",
    sizeSquares: 3,
    tags: [
      "beast",
      "forest",
      "mammoth"
    ],
    maxHp: 368,
    category: 10,
    multiattack: { attacks: 3 },
    xp: 18200,
    ac: 22,
    attackBonus: 14,
    damage: {
      count: 8,
      sides: 8,
      bonus: 10,
      type: "bludgeoning",
      attackType: "weapon",
      label: "8d8 + 10 bludgeoning",
    },
    specialAbility: [
      "Stampede", // Line/charge effect: save or take bludgeoning damage and be pushed.
      "ThickHide", // Passive/defensive: expresses physical toughness or resistance.
    ],
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "W",
    tokenArt: "assets/tokens/worldwood-mammoth.jpg",
  });
  window.BeastBiomeMonsterIds.forest = window.BeastBiomeMonsterIds.forest || [];
  window.BeastBiomeMonsterIds.forest.push("highTierWorldwoodMammoth");

  window.DungeonContent.register("monsters", "highTierGreenEclipseRoc", {
    name: "Green Eclipse Roc",
    role: "Vast canopy-shadow bird",
    sizeSquares: 3,
    tags: [
      "beast",
      "forest",
      "bird",
      "flying"
    ],
    maxHp: 398,
    category: 10,
    multiattack: { attacks: 4 },
    xp: 22200,
    ac: 23,
    attackBonus: 14,
    damage: {
      count: 8,
      sides: 10,
      bonus: 10,
      type: "slashing",
      attackType: "weapon",
      label: "8d10 + 10 slashing",
    },
    specialAbility: [
      "Swooping Strike", // Flying charge hit: if moved far enough, hit adds damage and may shove/prone.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 4,
    speedFeet: 60,
    flying: true,
    behavior: "melee",
    token: "G",
    tokenArt: "assets/tokens/green-eclipse-roc.jpg",
  });
  window.BeastBiomeMonsterIds.forest = window.BeastBiomeMonsterIds.forest || [];
  window.BeastBiomeMonsterIds.forest.push("highTierGreenEclipseRoc");

  window.DungeonContent.register("monsters", "highTierTheFirstWolfOfTheWildwood", {
    name: "The First Wolf of the Wildwood",
    role: "Category 10 forest beast boss",
    tags: [
      "beast",
      "forest",
      "wolf",
      "boss"
    ],
    maxHp: 680,
    category: 10,
    multiattack: { attacks: 4 },
    xp: 30500,
    ac: 24,
    attackBonus: 15,
    damage: {
      count: 9,
      sides: 10,
      bonus: 12,
      type: "slashing",
      attackType: "weapon",
      label: "9d10 + 12 slashing",
    },
    specialAbility: [
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
      "BloodFrenzy", // Start-of-turn: at or below half HP, gains +1 attack for that turn.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
      "SelfHeal", // Once per fight below half HP: heals a small amount.
    ],
    initiativeBonus: 4,
    speedFeet: 50,
    behavior: "melee",
    token: "T",
    tokenArt: "assets/tokens/the-first-wolf-of-the-wildwood.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.forest = window.BeastBiomeMonsterIds.forest || [];
  window.BeastBiomeMonsterIds.forest.push("highTierTheFirstWolfOfTheWildwood");


  /* ============================================================
   * BEAST + DESERT
   * ============================================================ */


  // Category 4 — Party Level 7/8

  window.DungeonContent.register("monsters", "highTierGlassduneScorpion", {
    name: "Glassdune Scorpion",
    role: "Crystal-shelled desert stinger",
    tags: [
      "beast",
      "desert",
      "scorpion",
      "poison"
    ],
    maxHp: 78,
    category: 4,
    multiattack: { attacks: 2 },
    xp: 850,
    ac: 16,
    attackBonus: 8,
    damage: {
      count: 3,
      sides: 6,
      bonus: 4,
      type: "piercing",
      attackType: "weapon",
      label: "3d6 + 4 piercing",
    },
    damageResistances: [
      "fire",
      "poison",
      "bludgeoning"
    ],
    damageVulnerabilities: [
      "cold"
    ],
    specialAbility: [
      "VenomBite", // On hit: Con save or extra poison damage.
      "ShellGuard", // Once per fight: gains a short defensive stance or damage reduction.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "G",
    tokenArt: "assets/tokens/glassdune-scorpion.jpg",
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("highTierGlassduneScorpion");

  window.DungeonContent.register("monsters", "highTierSunmaneLion", {
    name: "Sunmane Lion",
    role: "Golden desert ambusher",
    tags: [
      "beast",
      "desert",
      "lion"
    ],
    maxHp: 88,
    category: 4,
    multiattack: { attacks: 2 },
    xp: 1100,
    ac: 17,
    attackBonus: 8,
    damage: {
      count: 3,
      sides: 8,
      bonus: 4,
      type: "slashing",
      attackType: "weapon",
      label: "3d8 + 4 slashing",
    },
    damageResistances: [
      "fire"
    ],
    damageVulnerabilities: [
      "cold"
    ],
    specialAbility: [
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
      "BloodFrenzy", // Start-of-turn: at or below half HP, gains +1 attack for that turn.
    ],
    initiativeBonus: 2,
    speedFeet: 50,
    behavior: "melee",
    token: "S",
    tokenArt: "assets/tokens/sunmane-lion.jpg",
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("highTierSunmaneLion");

  window.DungeonContent.register("monsters", "highTierOldGlassbackScorpion", {
    name: "Old Glassback Scorpion",
    role: "Category 4 desert beast boss",
    tags: [
      "beast",
      "desert",
      "scorpion",
      "poison",
      "boss"
    ],
    maxHp: 152,
    category: 4,
    multiattack: { attacks: 2 },
    xp: 2400,
    ac: 18,
    attackBonus: 9,
    damage: {
      count: 3,
      sides: 10,
      bonus: 5,
      type: "piercing",
      attackType: "weapon",
      label: "3d10 + 5 piercing",
    },
    damageResistances: [
      "fire",
      "poison"
    ],
    damageVulnerabilities: [
      "cold"
    ],
    specialAbility: [
      "VenomBite", // On hit: Con save or extra poison damage.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
      "Sandblind Ambush", // Dust/choking rider: target saves or suffers brief attack/movement penalties.
    ],
    initiativeBonus: 3,
    speedFeet: 30,
    behavior: "melee",
    token: "O",
    tokenArt: "assets/tokens/old-glassback-scorpion.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("highTierOldGlassbackScorpion");


  // Category 5 — Party Level 9/10

  window.DungeonContent.register("monsters", "highTierDuneplateTortoise", {
    name: "Duneplate Tortoise",
    role: "Slow desert fortress-beast",
    sizeSquares: 2,
    tags: [
      "beast",
      "desert",
      "tortoise"
    ],
    maxHp: 108,
    category: 5,
    multiattack: { attacks: 2 },
    xp: 1900,
    ac: 17,
    attackBonus: 9,
    damage: {
      count: 4,
      sides: 6,
      bonus: 5,
      type: "slashing",
      attackType: "weapon",
      label: "4d6 + 5 slashing",
    },
    damageResistances: [
      "fire",
      "bludgeoning"
    ],
    damageVulnerabilities: [
      "cold"
    ],
    specialAbility: [
      "ShellGuard", // Once per fight: gains a short defensive stance or damage reduction.
      "ThickHide", // Passive/defensive: expresses physical toughness or resistance.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "D",
    tokenArt: "assets/tokens/duneplate-tortoise.jpg",
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("highTierDuneplateTortoise");

  window.DungeonContent.register("monsters", "highTierAshwindRaptor", {
    name: "Ashwind Raptor",
    role: "Fast hot-wind pack predator",
    tags: [
      "beast",
      "desert",
      "raptor"
    ],
    maxHp: 126,
    category: 5,
    multiattack: { attacks: 2 },
    xp: 2300,
    ac: 16,
    attackBonus: 9,
    damage: {
      count: 4,
      sides: 8,
      bonus: 5,
      type: "slashing",
      attackType: "weapon",
      label: "4d8 + 5 slashing",
    },
    damageResistances: [
      "fire"
    ],
    damageVulnerabilities: [
      "cold"
    ],
    specialAbility: [
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
      "Dust Cough", // On hit: Con save or short attack/movement penalty from choking dust.
    ],
    initiativeBonus: 4,
    speedFeet: 50,
    behavior: "melee",
    token: "A",
    tokenArt: "assets/tokens/ashwind-raptor.jpg",
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("highTierAshwindRaptor");

  window.DungeonContent.register("monsters", "highTierMirageManeManticore", {
    name: "Mirage-Mane Manticore",
    role: "Category 5 desert beast boss",
    sizeSquares: 2,
    tags: [
      "beast",
      "desert",
      "manticore",
      "flying",
      "boss"
    ],
    maxHp: 220,
    category: 5,
    multiattack: { attacks: 2 },
    xp: 5200,
    ac: 19,
    attackBonus: 10,
    damage: {
      count: 4,
      sides: 10,
      bonus: 6,
      type: "slashing",
      attackType: "weapon",
      label: "4d10 + 6 slashing",
    },
    damageResistances: [
      "fire"
    ],
    damageVulnerabilities: [
      "cold"
    ],
    specialAbility: [
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
      "Sandblind Ambush", // Dust/choking rider: target saves or suffers brief attack/movement penalties.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 4,
    speedFeet: 60,
    flying: true,
    behavior: "melee",
    token: "M",
    tokenArt: "assets/tokens/mirage-mane-manticore.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("highTierMirageManeManticore");


  // Category 6 — Party Level 11/12

  window.DungeonContent.register("monsters", "highTierBoneDuneBulette", {
    name: "Bone-Dune Bulette",
    role: "Burrowing desert landshark",
    sizeSquares: 2,
    tags: [
      "beast",
      "desert",
      "bulette",
      "burrower"
    ],
    maxHp: 148,
    category: 6,
    multiattack: { attacks: 2 },
    xp: 3400,
    ac: 18,
    attackBonus: 10,
    damage: {
      count: 5,
      sides: 6,
      bonus: 6,
      type: "bludgeoning",
      attackType: "weapon",
      label: "5d6 + 6 bludgeoning",
    },
    damageResistances: [
      "fire"
    ],
    damageVulnerabilities: [
      "cold"
    ],
    specialAbility: [
      "BurrowAmbush", // Movement identity: first attack from hiding/burrowing gains a bonus.
      "Charge", // If the monster moved at least 20 ft before attacking, hit adds bonus damage and may shove.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "B",
    tokenArt: "assets/tokens/bone-dune-bulette.jpg",
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("highTierBoneDuneBulette");

  window.DungeonContent.register("monsters", "highTierSunspineBasilisk", {
    name: "Sunspine Basilisk",
    role: "Heat-staring desert reptile",
    tags: [
      "beast",
      "desert",
      "lizard"
    ],
    maxHp: 172,
    category: 6,
    multiattack: { attacks: 2 },
    xp: 4700,
    ac: 17,
    attackBonus: 11,
    damage: {
      count: 5,
      sides: 8,
      bonus: 6,
      type: "slashing",
      attackType: "weapon",
      label: "5d8 + 6 slashing",
    },
    damageResistances: [
      "fire"
    ],
    damageVulnerabilities: [
      "cold"
    ],
    specialAbility: [
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
      "Dust Bite", // On hit: Con save or short attack/movement penalty from dust.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "S",
    tokenArt: "assets/tokens/sunspine-basilisk.jpg",
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("highTierSunspineBasilisk");

  window.DungeonContent.register("monsters", "highTierGreatSandmawWorm", {
    name: "Great Sandmaw Worm",
    role: "Category 6 desert beast boss",
    sizeSquares: 2,
    tags: [
      "beast",
      "desert",
      "worm",
      "burrower",
      "boss"
    ],
    maxHp: 310,
    category: 6,
    multiattack: { attacks: 2 },
    xp: 8600,
    ac: 20,
    attackBonus: 11,
    damage: {
      count: 5,
      sides: 10,
      bonus: 7,
      type: "bludgeoning",
      attackType: "weapon",
      label: "5d10 + 7 bludgeoning",
    },
    damageResistances: [
      "fire"
    ],
    damageVulnerabilities: [
      "cold"
    ],
    specialAbility: [
      "BurrowAmbush", // Movement identity: first attack from hiding/burrowing gains a bonus.
      "Stampede", // Line/charge effect: save or take bludgeoning damage and be pushed.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 30,
    behavior: "melee",
    token: "G",
    tokenArt: "assets/tokens/great-sandmaw-worm.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("highTierGreatSandmawWorm");


  // Category 7 — Party Level 13/14

  window.DungeonContent.register("monsters", "highTierSiroccoWyvern", {
    name: "Sirocco Wyvern",
    role: "Hot-wind flying hunter",
    sizeSquares: 2,
    tags: [
      "beast",
      "desert",
      "wyvern",
      "flying",
      "poison"
    ],
    maxHp: 196,
    category: 7,
    multiattack: { attacks: 3 },
    xp: 6400,
    ac: 19,
    attackBonus: 11,
    damage: {
      count: 6,
      sides: 6,
      bonus: 7,
      type: "piercing",
      attackType: "weapon",
      label: "6d6 + 7 piercing",
    },
    damageResistances: [
      "fire",
      "poison"
    ],
    damageVulnerabilities: [
      "cold"
    ],
    specialAbility: [
      "VenomBite", // On hit: Con save or extra poison damage.
      "Swooping Strike", // Flying charge hit: if moved far enough, hit adds damage and may shove/prone.
    ],
    initiativeBonus: 4,
    speedFeet: 60,
    flying: true,
    behavior: "melee",
    token: "S",
    tokenArt: "assets/tokens/sirocco-wyvern.jpg",
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("highTierSiroccoWyvern");

  window.DungeonContent.register("monsters", "highTierSaltjawCrocodile", {
    name: "Saltjaw Crocodile",
    role: "Desert oasis ambusher",
    sizeSquares: 2,
    tags: [
      "beast",
      "desert",
      "crocodile"
    ],
    maxHp: 224,
    category: 7,
    multiattack: { attacks: 3 },
    xp: 8200,
    ac: 18,
    attackBonus: 12,
    damage: {
      count: 6,
      sides: 8,
      bonus: 7,
      type: "piercing",
      attackType: "weapon",
      label: "6d8 + 7 piercing",
    },
    damageResistances: [
      "fire"
    ],
    damageVulnerabilities: [
      "cold"
    ],
    specialAbility: [
      "MarshAmbush", // Movement identity: first attack against targets in swamp/difficult terrain gains bonus.
      "BloodFrenzy", // Start-of-turn: at or below half HP, gains +1 attack for that turn.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "S",
    tokenArt: "assets/tokens/saltjaw-crocodile.jpg",
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("highTierSaltjawCrocodile");

  window.DungeonContent.register("monsters", "highTierDuneEmperorLion", {
    name: "Dune-Emperor Lion",
    role: "Category 7 desert beast boss",
    tags: [
      "beast",
      "desert",
      "lion",
      "boss"
    ],
    maxHp: 390,
    category: 7,
    multiattack: { attacks: 3 },
    xp: 13200,
    ac: 21,
    attackBonus: 12,
    damage: {
      count: 6,
      sides: 10,
      bonus: 8,
      type: "slashing",
      attackType: "weapon",
      label: "6d10 + 8 slashing",
    },
    damageResistances: [
      "fire"
    ],
    damageVulnerabilities: [
      "cold"
    ],
    specialAbility: [
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
      "BloodFrenzy", // Start-of-turn: at or below half HP, gains +1 attack for that turn.
    ],
    initiativeBonus: 3,
    speedFeet: 50,
    behavior: "melee",
    token: "D",
    tokenArt: "assets/tokens/dune-emperor-lion.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("highTierDuneEmperorLion");


  // Category 8 — Party Level 15/16

  window.DungeonContent.register("monsters", "highTierThunderDuneTrampler", {
    name: "Thunder-Dune Trampler",
    role: "Massive horned desert charger",
    sizeSquares: 2,
    tags: [
      "beast",
      "desert",
      "trampler"
    ],
    maxHp: 248,
    category: 8,
    multiattack: { attacks: 3 },
    xp: 9200,
    ac: 20,
    attackBonus: 12,
    damage: {
      count: 6,
      sides: 10,
      bonus: 8,
      type: "bludgeoning",
      attackType: "weapon",
      label: "6d10 + 8 bludgeoning",
    },
    damageResistances: [
      "fire"
    ],
    damageVulnerabilities: [
      "cold"
    ],
    specialAbility: [
      "Stampede", // Line/charge effect: save or take bludgeoning damage and be pushed.
      "Thunder Charge", // Charge hit: save or thunder damage and shove/prone.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "T",
    tokenArt: "assets/tokens/thunder-dune-trampler.jpg",
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("highTierThunderDuneTrampler");

  window.DungeonContent.register("monsters", "highTierCrystalViperMatriarch", {
    name: "Crystal Viper Matriarch",
    role: "Huge venomous glass snake",
    sizeSquares: 2,
    tags: [
      "beast",
      "desert",
      "snake",
      "poison"
    ],
    maxHp: 288,
    category: 8,
    multiattack: { attacks: 3 },
    xp: 11800,
    ac: 19,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 8,
      bonus: 8,
      type: "piercing",
      attackType: "weapon",
      label: "7d8 + 8 piercing",
    },
    damageResistances: [
      "fire",
      "poison"
    ],
    damageVulnerabilities: [
      "cold"
    ],
    specialAbility: [
      "VenomBite", // On hit: Con save or extra poison damage.
      "Sandblind Ambush", // Dust/choking rider: target saves or suffers brief attack/movement penalties.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "C",
    tokenArt: "assets/tokens/crystal-viper-matriarch.jpg",
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("highTierCrystalViperMatriarch");

  window.DungeonContent.register("monsters", "highTierTheWalkingDune", {
    name: "The Walking Dune",
    role: "Category 8 desert beast boss",
    sizeSquares: 3,
    tags: [
      "beast",
      "desert",
      "tortoise",
      "boss"
    ],
    maxHp: 490,
    category: 8,
    multiattack: { attacks: 3 },
    xp: 18400,
    ac: 22,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 10,
      bonus: 9,
      type: "bludgeoning",
      attackType: "weapon",
      label: "7d10 + 9 bludgeoning",
    },
    damageResistances: [
      "fire",
      "bludgeoning"
    ],
    damageVulnerabilities: [
      "cold"
    ],
    specialAbility: [
      "ShellGuard", // Once per fight: gains a short defensive stance or damage reduction.
      "Stampede", // Line/charge effect: save or take bludgeoning damage and be pushed.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 30,
    behavior: "melee",
    token: "T",
    tokenArt: "assets/tokens/the-walking-dune.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("highTierTheWalkingDune");


  // Category 9 — Party Level 17/18

  window.DungeonContent.register("monsters", "highTierRedMirageRoc", {
    name: "Red Mirage Roc",
    role: "Blazing sky predator",
    sizeSquares: 2,
    tags: [
      "beast",
      "desert",
      "bird",
      "flying"
    ],
    maxHp: 318,
    category: 9,
    multiattack: { attacks: 3 },
    xp: 13800,
    ac: 21,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 8,
      bonus: 9,
      type: "slashing",
      attackType: "weapon",
      label: "7d8 + 9 slashing",
    },
    damageResistances: [
      "fire"
    ],
    damageVulnerabilities: [
      "cold"
    ],
    specialAbility: [
      "Swooping Strike", // Flying charge hit: if moved far enough, hit adds damage and may shove/prone.
      "Dust Cough", // On hit: Con save or short attack/movement penalty from choking dust.
    ],
    initiativeBonus: 4,
    speedFeet: 60,
    flying: true,
    behavior: "melee",
    token: "R",
    tokenArt: "assets/tokens/red-mirage-roc.jpg",
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("highTierRedMirageRoc");

  window.DungeonContent.register("monsters", "highTierBlackglassDuneLurker", {
    name: "Blackglass Dune Lurker",
    role: "Buried cutting ambusher",
    tags: [
      "beast",
      "desert",
      "lizard",
      "burrower"
    ],
    maxHp: 348,
    category: 9,
    multiattack: { attacks: 3 },
    xp: 16200,
    ac: 20,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 10,
      bonus: 9,
      type: "slashing",
      attackType: "weapon",
      label: "7d10 + 9 slashing",
    },
    damageResistances: [
      "fire"
    ],
    damageVulnerabilities: [
      "cold"
    ],
    specialAbility: [
      "BurrowAmbush", // Movement identity: first attack from hiding/burrowing gains a bonus.
      "Razor Pass", // Shard/cut rider: target saves or takes slashing damage and is slowed.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "B",
    tokenArt: "assets/tokens/blackglass-dune-lurker.jpg",
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("highTierBlackglassDuneLurker");

  window.DungeonContent.register("monsters", "highTierSultanScorpionOfTheWastes", {
    name: "Sultan Scorpion of the Wastes",
    role: "Category 9 desert beast boss",
    tags: [
      "beast",
      "desert",
      "scorpion",
      "poison",
      "boss"
    ],
    maxHp: 575,
    category: 9,
    multiattack: { attacks: 3 },
    xp: 22400,
    ac: 23,
    attackBonus: 14,
    damage: {
      count: 8,
      sides: 10,
      bonus: 10,
      type: "piercing",
      attackType: "weapon",
      label: "8d10 + 10 piercing",
    },
    damageResistances: [
      "fire",
      "poison",
      "bludgeoning"
    ],
    damageVulnerabilities: [
      "cold"
    ],
    specialAbility: [
      "VenomBite", // On hit: Con save or extra poison damage.
      "ShellGuard", // Once per fight: gains a short defensive stance or damage reduction.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 30,
    behavior: "melee",
    token: "S",
    tokenArt: "assets/tokens/sultan-scorpion-of-the-wastes.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("highTierSultanScorpionOfTheWastes");


  // Category 10 — Party Level 19/20

  window.DungeonContent.register("monsters", "highTierTitanDuneWorm", {
    name: "Titan Dune Worm",
    role: "Colossal desert burrower",
    sizeSquares: 3,
    tags: [
      "beast",
      "desert",
      "worm",
      "burrower"
    ],
    maxHp: 368,
    category: 10,
    multiattack: { attacks: 4 },
    xp: 18200,
    ac: 22,
    attackBonus: 14,
    damage: {
      count: 8,
      sides: 8,
      bonus: 10,
      type: "bludgeoning",
      attackType: "weapon",
      label: "8d8 + 10 bludgeoning",
    },
    damageResistances: [
      "fire"
    ],
    damageVulnerabilities: [
      "cold"
    ],
    specialAbility: [
      "BurrowAmbush", // Movement identity: first attack from hiding/burrowing gains a bonus.
      "Stampede", // Line/charge effect: save or take bludgeoning damage and be pushed.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "T",
    tokenArt: "assets/tokens/titan-dune-worm.jpg",
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("highTierTitanDuneWorm");

  window.DungeonContent.register("monsters", "highTierSolarFangManticore", {
    name: "Solar Fang Manticore",
    role: "Radiant-hot desert aerial brute",
    sizeSquares: 2,
    tags: [
      "beast",
      "desert",
      "manticore",
      "flying"
    ],
    maxHp: 398,
    category: 10,
    multiattack: { attacks: 4 },
    xp: 22200,
    ac: 23,
    attackBonus: 14,
    damage: {
      count: 8,
      sides: 10,
      bonus: 10,
      type: "slashing",
      attackType: "weapon",
      label: "8d10 + 10 slashing",
    },
    damageResistances: [
      "fire"
    ],
    damageVulnerabilities: [
      "cold"
    ],
    specialAbility: [
      "Swooping Strike", // Flying charge hit: if moved far enough, hit adds damage and may shove/prone.
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
    ],
    initiativeBonus: 4,
    speedFeet: 60,
    flying: true,
    behavior: "melee",
    token: "S",
    tokenArt: "assets/tokens/solar-fang-manticore.jpg",
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("highTierSolarFangManticore");

  window.DungeonContent.register("monsters", "highTierTheSandThatHunts", {
    name: "The Sand That Hunts",
    role: "Category 10 desert beast boss",
    sizeSquares: 3,
    tags: [
      "beast",
      "desert",
      "worm",
      "burrower",
      "boss"
    ],
    maxHp: 680,
    category: 10,
    multiattack: { attacks: 4 },
    xp: 30500,
    ac: 24,
    attackBonus: 15,
    damage: {
      count: 9,
      sides: 10,
      bonus: 12,
      type: "slashing",
      attackType: "weapon",
      label: "9d10 + 12 slashing",
    },
    damageResistances: [
      "fire"
    ],
    damageVulnerabilities: [
      "cold"
    ],
    specialAbility: [
      "BurrowAmbush", // Movement identity: first attack from hiding/burrowing gains a bonus.
      "Sandblind Ambush", // Dust/choking rider: target saves or suffers brief attack/movement penalties.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
      "SelfHeal", // Once per fight below half HP: heals a small amount.
    ],
    initiativeBonus: 3,
    speedFeet: 30,
    behavior: "melee",
    token: "T",
    tokenArt: "assets/tokens/the-sand-that-hunts.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.desert = window.BeastBiomeMonsterIds.desert || [];
  window.BeastBiomeMonsterIds.desert.push("highTierTheSandThatHunts");


  /* ============================================================
   * BEAST + UNDERGROUND
   * ============================================================ */


  // Category 4 — Party Level 7/8

  window.DungeonContent.register("monsters", "highTierCavebackHookclaw", {
    name: "Caveback Hookclaw",
    role: "Blind cavern ambusher",
    tags: [
      "beast",
      "underground",
      "cave",
      "claw"
    ],
    maxHp: 78,
    category: 4,
    multiattack: { attacks: 2 },
    xp: 850,
    ac: 16,
    attackBonus: 8,
    damage: {
      count: 3,
      sides: 6,
      bonus: 4,
      type: "slashing",
      attackType: "weapon",
      label: "3d6 + 4 slashing",
    },
    specialAbility: [
      "BurrowAmbush", // Movement identity: first attack from hiding/burrowing gains a bonus.
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "C",
    tokenArt: "assets/tokens/caveback-hookclaw.jpg",
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("highTierCavebackHookclaw");

  window.DungeonContent.register("monsters", "highTierIronfangMolebear", {
    name: "Ironfang Molebear",
    role: "Digging brute",
    sizeSquares: 2,
    tags: [
      "beast",
      "underground",
      "bear",
      "burrower"
    ],
    maxHp: 88,
    category: 4,
    multiattack: { attacks: 2 },
    xp: 1100,
    ac: 17,
    attackBonus: 8,
    damage: {
      count: 3,
      sides: 8,
      bonus: 4,
      type: "slashing",
      attackType: "weapon",
      label: "3d8 + 4 slashing",
    },
    specialAbility: [
      "BurrowAmbush", // Movement identity: first attack from hiding/burrowing gains a bonus.
      "ThickHide", // Passive/defensive: expresses physical toughness or resistance.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "I",
    tokenArt: "assets/tokens/ironfang-molebear.jpg",
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("highTierIronfangMolebear");

  window.DungeonContent.register("monsters", "highTierDeepclawMatriarch", {
    name: "Deepclaw Matriarch",
    role: "Category 4 underground beast boss",
    tags: [
      "beast",
      "underground",
      "cave",
      "boss"
    ],
    maxHp: 152,
    category: 4,
    multiattack: { attacks: 2 },
    xp: 2400,
    ac: 18,
    attackBonus: 9,
    damage: {
      count: 3,
      sides: 10,
      bonus: 5,
      type: "slashing",
      attackType: "weapon",
      label: "3d10 + 5 slashing",
    },
    damageResistances: [
      "bludgeoning"
    ],
    specialAbility: [
      "BurrowAmbush", // Movement identity: first attack from hiding/burrowing gains a bonus.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
      "ShellGuard", // Once per fight: gains a short defensive stance or damage reduction.
    ],
    initiativeBonus: 3,
    speedFeet: 30,
    behavior: "melee",
    token: "D",
    tokenArt: "assets/tokens/deepclaw-matriarch.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("highTierDeepclawMatriarch");


  // Category 5 — Party Level 9/10

  window.DungeonContent.register("monsters", "highTierEchoBatSwarmking", {
    name: "Echo-Bat Swarmking",
    role: "Shrieking cavern flier",
    tags: [
      "beast",
      "underground",
      "bat",
      "flying"
    ],
    maxHp: 108,
    category: 5,
    multiattack: { attacks: 2 },
    xp: 1900,
    ac: 17,
    attackBonus: 9,
    damage: {
      count: 4,
      sides: 6,
      bonus: 5,
      type: "slashing",
      attackType: "weapon",
      label: "4d6 + 5 slashing",
    },
    specialAbility: [
      "Swooping Strike", // Flying charge hit: if moved far enough, hit adds damage and may shove/prone.
      "Thunderclap", // Thunder burst/rider: save or thunder damage and possible reaction loss/push.
    ],
    initiativeBonus: 4,
    speedFeet: 60,
    flying: true,
    behavior: "melee",
    token: "E",
    tokenArt: "assets/tokens/echo-bat-swarmking.jpg",
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("highTierEchoBatSwarmking");

  window.DungeonContent.register("monsters", "highTierRockhideCaveRhino", {
    name: "Rockhide Cave Rhino",
    role: "Armored underground charger",
    sizeSquares: 2,
    tags: [
      "beast",
      "underground",
      "rhino"
    ],
    maxHp: 126,
    category: 5,
    multiattack: { attacks: 2 },
    xp: 2300,
    ac: 16,
    attackBonus: 9,
    damage: {
      count: 4,
      sides: 8,
      bonus: 5,
      type: "bludgeoning",
      attackType: "weapon",
      label: "4d8 + 5 bludgeoning",
    },
    specialAbility: [
      "Charge", // If the monster moved at least 20 ft before attacking, hit adds bonus damage and may shove.
      "RockClimber", // Movement identity: intended for cliffs, ledges, and rocky rooms.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "R",
    tokenArt: "assets/tokens/rockhide-cave-rhino.jpg",
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("highTierRockhideCaveRhino");

  window.DungeonContent.register("monsters", "highTierTheBlindTunnelBull", {
    name: "The Blind Tunnel Bull",
    role: "Category 5 underground beast boss",
    sizeSquares: 2,
    tags: [
      "beast",
      "underground",
      "bull",
      "boss"
    ],
    maxHp: 220,
    category: 5,
    multiattack: { attacks: 2 },
    xp: 5200,
    ac: 19,
    attackBonus: 10,
    damage: {
      count: 4,
      sides: 10,
      bonus: 6,
      type: "bludgeoning",
      attackType: "weapon",
      label: "4d10 + 6 bludgeoning",
    },
    specialAbility: [
      "Charge", // If the monster moved at least 20 ft before attacking, hit adds bonus damage and may shove.
      "Stampede", // Line/charge effect: save or take bludgeoning damage and be pushed.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "T",
    tokenArt: "assets/tokens/the-blind-tunnel-bull.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("highTierTheBlindTunnelBull");


  // Category 6 — Party Level 11/12

  window.DungeonContent.register("monsters", "highTierCrystalbackCaveSpider", {
    name: "Crystalback Cave Spider",
    role: "Gem-shelled web predator",
    tags: [
      "beast",
      "underground",
      "spider",
      "poison"
    ],
    maxHp: 148,
    category: 6,
    multiattack: { attacks: 2 },
    xp: 3400,
    ac: 18,
    attackBonus: 10,
    damage: {
      count: 5,
      sides: 6,
      bonus: 6,
      type: "piercing",
      attackType: "weapon",
      label: "5d6 + 6 piercing",
    },
    damageResistances: [
      "poison"
    ],
    specialAbility: [
      "WebSnare", // Ranged/status: Dex save or speed becomes 0 briefly.
      "VenomBite", // On hit: Con save or extra poison damage.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "C",
    tokenArt: "assets/tokens/crystalback-cave-spider.jpg",
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("highTierCrystalbackCaveSpider");

  window.DungeonContent.register("monsters", "highTierDeepMawBadger", {
    name: "Deep Maw Badger",
    role: "Ripping burrow hunter",
    tags: [
      "beast",
      "underground",
      "badger",
      "burrower"
    ],
    maxHp: 172,
    category: 6,
    multiattack: { attacks: 2 },
    xp: 4700,
    ac: 17,
    attackBonus: 11,
    damage: {
      count: 5,
      sides: 8,
      bonus: 6,
      type: "slashing",
      attackType: "weapon",
      label: "5d8 + 6 slashing",
    },
    specialAbility: [
      "BurrowAmbush", // Movement identity: first attack from hiding/burrowing gains a bonus.
      "Bite and Tear", // Bloodied finisher: extra damage if target is at or below half HP.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "D",
    tokenArt: "assets/tokens/deep-maw-badger.jpg",
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("highTierDeepMawBadger");

  window.DungeonContent.register("monsters", "highTierGloomhornUnderRhino", {
    name: "Gloomhorn Under-Rhino",
    role: "Category 6 underground beast boss",
    sizeSquares: 2,
    tags: [
      "beast",
      "underground",
      "rhino",
      "boss"
    ],
    maxHp: 310,
    category: 6,
    multiattack: { attacks: 2 },
    xp: 8600,
    ac: 20,
    attackBonus: 11,
    damage: {
      count: 5,
      sides: 10,
      bonus: 7,
      type: "bludgeoning",
      attackType: "weapon",
      label: "5d10 + 7 bludgeoning",
    },
    damageResistances: [
      "bludgeoning"
    ],
    specialAbility: [
      "Charge", // If the monster moved at least 20 ft before attacking, hit adds bonus damage and may shove.
      "ShellGuard", // Once per fight: gains a short defensive stance or damage reduction.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 30,
    behavior: "melee",
    token: "G",
    tokenArt: "assets/tokens/gloomhorn-under-rhino.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("highTierGloomhornUnderRhino");


  // Category 7 — Party Level 13/14

  window.DungeonContent.register("monsters", "highTierPaleCaveWyvern", {
    name: "Pale Cave Wyvern",
    role: "Winged cavern stinger",
    sizeSquares: 2,
    tags: [
      "beast",
      "underground",
      "wyvern",
      "flying",
      "poison"
    ],
    maxHp: 196,
    category: 7,
    multiattack: { attacks: 3 },
    xp: 6400,
    ac: 19,
    attackBonus: 11,
    damage: {
      count: 6,
      sides: 6,
      bonus: 7,
      type: "piercing",
      attackType: "weapon",
      label: "6d6 + 7 piercing",
    },
    damageResistances: [
      "poison"
    ],
    specialAbility: [
      "VenomBite", // On hit: Con save or extra poison damage.
      "Swooping Strike", // Flying charge hit: if moved far enough, hit adds damage and may shove/prone.
    ],
    initiativeBonus: 4,
    speedFeet: 60,
    flying: true,
    behavior: "melee",
    token: "P",
    tokenArt: "assets/tokens/pale-cave-wyvern.jpg",
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("highTierPaleCaveWyvern");

  window.DungeonContent.register("monsters", "highTierBasaltShelledAnkylosaur", {
    name: "Basalt-Shelled Ankylosaur",
    role: "Armored tail-crusher",
    sizeSquares: 2,
    tags: [
      "beast",
      "underground",
      "dinosaur"
    ],
    maxHp: 224,
    category: 7,
    multiattack: { attacks: 3 },
    xp: 8200,
    ac: 18,
    attackBonus: 12,
    damage: {
      count: 6,
      sides: 8,
      bonus: 7,
      type: "bludgeoning",
      attackType: "weapon",
      label: "6d8 + 7 bludgeoning",
    },
    damageResistances: [
      "bludgeoning"
    ],
    specialAbility: [
      "ShellGuard", // Once per fight: gains a short defensive stance or damage reduction.
      "Crushing Stomp", // Slam hit: if moved or against adjacent target, may knock prone on failed save.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "B",
    tokenArt: "assets/tokens/basalt-shelled-ankylosaur.jpg",
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("highTierBasaltShelledAnkylosaur");

  window.DungeonContent.register("monsters", "highTierOldStoneEater", {
    name: "Old Stone-Eater",
    role: "Category 7 underground beast boss",
    tags: [
      "beast",
      "underground",
      "molebear",
      "boss"
    ],
    maxHp: 390,
    category: 7,
    multiattack: { attacks: 3 },
    xp: 13200,
    ac: 21,
    attackBonus: 12,
    damage: {
      count: 6,
      sides: 10,
      bonus: 8,
      type: "slashing",
      attackType: "weapon",
      label: "6d10 + 8 slashing",
    },
    specialAbility: [
      "BurrowAmbush", // Movement identity: first attack from hiding/burrowing gains a bonus.
      "ThickHide", // Passive/defensive: expresses physical toughness or resistance.
      "SelfHeal", // Once per fight below half HP: heals a small amount.
    ],
    initiativeBonus: 3,
    speedFeet: 30,
    behavior: "melee",
    token: "O",
    tokenArt: "assets/tokens/old-stone-eater.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("highTierOldStoneEater");


  // Category 8 — Party Level 15/16

  window.DungeonContent.register("monsters", "highTierCavernLeviathanCub", {
    name: "Cavern Leviathan Cub",
    role: "Massive tunnel serpent",
    sizeSquares: 2,
    tags: [
      "beast",
      "underground",
      "serpent"
    ],
    maxHp: 248,
    category: 8,
    multiattack: { attacks: 3 },
    xp: 9200,
    ac: 20,
    attackBonus: 12,
    damage: {
      count: 6,
      sides: 10,
      bonus: 8,
      type: "slashing",
      attackType: "weapon",
      label: "6d10 + 8 slashing",
    },
    specialAbility: [
      "Constricting Coil", // On hit/status: target saves or is briefly restrained.
      "BurrowAmbush", // Movement identity: first attack from hiding/burrowing gains a bonus.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "C",
    tokenArt: "assets/tokens/cavern-leviathan-cub.jpg",
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("highTierCavernLeviathanCub");

  window.DungeonContent.register("monsters", "highTierDiamondEyedBasilisk", {
    name: "Diamond-Eyed Basilisk",
    role: "Crystalline cave reptile",
    tags: [
      "beast",
      "underground",
      "lizard"
    ],
    maxHp: 288,
    category: 8,
    multiattack: { attacks: 3 },
    xp: 11800,
    ac: 19,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 8,
      bonus: 8,
      type: "slashing",
      attackType: "weapon",
      label: "7d8 + 8 slashing",
    },
    specialAbility: [
      "RockClimber", // Movement identity: intended for cliffs, ledges, and rocky rooms.
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "D",
    tokenArt: "assets/tokens/diamond-eyed-basilisk.jpg",
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("highTierDiamondEyedBasilisk");

  window.DungeonContent.register("monsters", "highTierEchoTyrantBat", {
    name: "Echo Tyrant Bat",
    role: "Category 8 underground beast boss",
    tags: [
      "beast",
      "underground",
      "bat",
      "flying",
      "boss"
    ],
    maxHp: 490,
    category: 8,
    multiattack: { attacks: 3 },
    xp: 18400,
    ac: 22,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 10,
      bonus: 9,
      type: "slashing",
      attackType: "weapon",
      label: "7d10 + 9 slashing",
    },
    specialAbility: [
      "Swooping Strike", // Flying charge hit: if moved far enough, hit adds damage and may shove/prone.
      "Thunderclap", // Thunder burst/rider: save or thunder damage and possible reaction loss/push.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 4,
    speedFeet: 60,
    flying: true,
    behavior: "melee",
    token: "E",
    tokenArt: "assets/tokens/echo-tyrant-bat.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("highTierEchoTyrantBat");


  // Category 9 — Party Level 17/18

  window.DungeonContent.register("monsters", "highTierAbyssalCaveBear", {
    name: "Abyssal Cave Bear",
    role: "Huge pale apex brute",
    sizeSquares: 2,
    tags: [
      "beast",
      "underground",
      "bear"
    ],
    maxHp: 318,
    category: 9,
    multiattack: { attacks: 3 },
    xp: 13800,
    ac: 21,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 8,
      bonus: 9,
      type: "bludgeoning",
      attackType: "weapon",
      label: "7d8 + 9 bludgeoning",
    },
    specialAbility: [
      "Mauling Rush", // Charge/pounce hit: if moved far enough, adds damage and may shove/prone.
      "BloodFrenzy", // Start-of-turn: at or below half HP, gains +1 attack for that turn.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "A",
    tokenArt: "assets/tokens/abyssal-cave-bear.jpg",
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("highTierAbyssalCaveBear");

  window.DungeonContent.register("monsters", "highTierSubterraneanThunderhorn", {
    name: "Subterranean Thunderhorn",
    role: "Cave-cracking horned beast",
    sizeSquares: 2,
    tags: [
      "beast",
      "underground",
      "rhino"
    ],
    maxHp: 348,
    category: 9,
    multiattack: { attacks: 3 },
    xp: 16200,
    ac: 20,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 10,
      bonus: 9,
      type: "bludgeoning",
      attackType: "weapon",
      label: "7d10 + 9 bludgeoning",
    },
    specialAbility: [
      "Thunder Charge", // Charge hit: save or thunder damage and shove/prone.
      "RockClimber", // Movement identity: intended for cliffs, ledges, and rocky rooms.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "S",
    tokenArt: "assets/tokens/subterranean-thunderhorn.jpg",
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("highTierSubterraneanThunderhorn");

  window.DungeonContent.register("monsters", "highTierMotherOfTheBlackTunnels", {
    name: "Mother of the Black Tunnels",
    role: "Category 9 underground beast boss",
    tags: [
      "beast",
      "underground",
      "spider",
      "poison",
      "boss"
    ],
    maxHp: 575,
    category: 9,
    multiattack: { attacks: 3 },
    xp: 22400,
    ac: 23,
    attackBonus: 14,
    damage: {
      count: 8,
      sides: 10,
      bonus: 10,
      type: "piercing",
      attackType: "weapon",
      label: "8d10 + 10 piercing",
    },
    damageResistances: [
      "poison"
    ],
    specialAbility: [
      "WebSnare", // Ranged/status: Dex save or speed becomes 0 briefly.
      "VenomBite", // On hit: Con save or extra poison damage.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 30,
    behavior: "melee",
    token: "M",
    tokenArt: "assets/tokens/mother-of-the-black-tunnels.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("highTierMotherOfTheBlackTunnels");


  // Category 10 — Party Level 19/20

  window.DungeonContent.register("monsters", "highTierWorldRootBurrower", {
    name: "World-Root Burrower",
    role: "Legendary tunneling beast",
    sizeSquares: 3,
    tags: [
      "beast",
      "underground",
      "burrower"
    ],
    maxHp: 368,
    category: 10,
    multiattack: { attacks: 3 },
    xp: 18200,
    ac: 22,
    attackBonus: 14,
    damage: {
      count: 8,
      sides: 8,
      bonus: 10,
      type: "bludgeoning",
      attackType: "weapon",
      label: "8d8 + 10 bludgeoning",
    },
    specialAbility: [
      "BurrowAmbush", // Movement identity: first attack from hiding/burrowing gains a bonus.
      "Stampede", // Line/charge effect: save or take bludgeoning damage and be pushed.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "W",
    tokenArt: "assets/tokens/world-root-burrower.jpg",
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("highTierWorldRootBurrower");

  window.DungeonContent.register("monsters", "highTierTitanCaveDrakebeast", {
    name: "Titan Cave Drakebeast",
    role: "Winged cavern apex beast",
    sizeSquares: 3,
    tags: [
      "beast",
      "underground",
      "drake",
      "flying"
    ],
    maxHp: 398,
    category: 10,
    multiattack: { attacks: 4 },
    xp: 22200,
    ac: 23,
    attackBonus: 14,
    damage: {
      count: 8,
      sides: 10,
      bonus: 10,
      type: "slashing",
      attackType: "weapon",
      label: "8d10 + 10 slashing",
    },
    specialAbility: [
      "Swooping Strike", // Flying charge hit: if moved far enough, hit adds damage and may shove/prone.
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
    ],
    initiativeBonus: 4,
    speedFeet: 60,
    flying: true,
    behavior: "melee",
    token: "T",
    tokenArt: "assets/tokens/titan-cave-drakebeast.jpg",
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("highTierTitanCaveDrakebeast");

  window.DungeonContent.register("monsters", "highTierTheMawBelowAllRoads", {
    name: "The Maw Below All Roads",
    role: "Category 10 underground beast boss",
    sizeSquares: 3,
    tags: [
      "beast",
      "underground",
      "worm",
      "burrower",
      "boss"
    ],
    maxHp: 680,
    category: 10,
    multiattack: { attacks: 4 },
    xp: 30500,
    ac: 24,
    attackBonus: 15,
    damage: {
      count: 9,
      sides: 10,
      bonus: 12,
      type: "slashing",
      attackType: "weapon",
      label: "9d10 + 12 slashing",
    },
    specialAbility: [
      "BurrowAmbush", // Movement identity: first attack from hiding/burrowing gains a bonus.
      "Bite and Tear", // Bloodied finisher: extra damage if target is at or below half HP.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
      "SelfHeal", // Once per fight below half HP: heals a small amount.
    ],
    initiativeBonus: 3,
    speedFeet: 30,
    behavior: "melee",
    token: "T",
    tokenArt: "assets/tokens/the-maw-below-all-roads.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.underground = window.BeastBiomeMonsterIds.underground || [];
  window.BeastBiomeMonsterIds.underground.push("highTierTheMawBelowAllRoads");


  /* ============================================================
   * BEAST + SWAMP
   * ============================================================ */


  // Category 4 — Party Level 7/8

  window.DungeonContent.register("monsters", "highTierBogTuskBoar", {
    name: "Bog-Tusk Boar",
    role: "Mud-splattered charger",
    tags: [
      "beast",
      "swamp",
      "boar"
    ],
    maxHp: 78,
    category: 4,
    multiattack: { attacks: 2 },
    xp: 850,
    ac: 16,
    attackBonus: 8,
    damage: {
      count: 3,
      sides: 6,
      bonus: 4,
      type: "bludgeoning",
      attackType: "weapon",
      label: "3d6 + 4 bludgeoning",
    },
    specialAbility: [
      "MarshAmbush", // Movement identity: first attack against targets in swamp/difficult terrain gains bonus.
      "Charge", // If the monster moved at least 20 ft before attacking, hit adds bonus damage and may shove.
    ],
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "B",
    tokenArt: "assets/tokens/bog-tusk-boar.jpg",
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("highTierBogTuskBoar");

  window.DungeonContent.register("monsters", "highTierLeechhideCrocodile", {
    name: "Leechhide Crocodile",
    role: "Blood-drinking swamp predator",
    sizeSquares: 2,
    tags: [
      "beast",
      "swamp",
      "crocodile"
    ],
    maxHp: 88,
    category: 4,
    multiattack: { attacks: 2 },
    xp: 1100,
    ac: 17,
    attackBonus: 8,
    damage: {
      count: 3,
      sides: 8,
      bonus: 4,
      type: "piercing",
      attackType: "weapon",
      label: "3d8 + 4 piercing",
    },
    specialAbility: [
      "Blood in the Water", // Bloodied finisher: extra damage against wounded targets; strong for aquatic predators.
      "Pull Under", // Pull rider: target saves or is pulled/dragged and briefly slowed.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "L",
    tokenArt: "assets/tokens/leechhide-crocodile.jpg",
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("highTierLeechhideCrocodile");

  window.DungeonContent.register("monsters", "highTierOldMireCrocodile", {
    name: "Old Mire Crocodile",
    role: "Category 4 swamp beast boss",
    sizeSquares: 2,
    tags: [
      "beast",
      "swamp",
      "crocodile",
      "boss"
    ],
    maxHp: 152,
    category: 4,
    multiattack: { attacks: 2 },
    xp: 2400,
    ac: 18,
    attackBonus: 9,
    damage: {
      count: 3,
      sides: 10,
      bonus: 5,
      type: "piercing",
      attackType: "weapon",
      label: "3d10 + 5 piercing",
    },
    specialAbility: [
      "Pull Under", // Pull rider: target saves or is pulled/dragged and briefly slowed.
      "MarshAmbush", // Movement identity: first attack against targets in swamp/difficult terrain gains bonus.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 30,
    behavior: "melee",
    token: "O",
    tokenArt: "assets/tokens/old-mire-crocodile.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("highTierOldMireCrocodile");


  // Category 5 — Party Level 9/10

  window.DungeonContent.register("monsters", "highTierMirefangPanther", {
    name: "Mirefang Panther",
    role: "Silent reed hunter",
    tags: [
      "beast",
      "swamp",
      "cat"
    ],
    maxHp: 108,
    category: 5,
    multiattack: { attacks: 2 },
    xp: 1900,
    ac: 17,
    attackBonus: 9,
    damage: {
      count: 4,
      sides: 6,
      bonus: 5,
      type: "slashing",
      attackType: "weapon",
      label: "4d6 + 5 slashing",
    },
    specialAbility: [
      "MarshAmbush", // Movement identity: first attack against targets in swamp/difficult terrain gains bonus.
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
    ],
    initiativeBonus: 4,
    speedFeet: 50,
    behavior: "melee",
    token: "M",
    tokenArt: "assets/tokens/mirefang-panther.jpg",
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("highTierMirefangPanther");

  window.DungeonContent.register("monsters", "highTierRotwaterSerpent", {
    name: "Rotwater Serpent",
    role: "Venomous marsh constrictor",
    sizeSquares: 2,
    tags: [
      "beast",
      "swamp",
      "snake",
      "poison"
    ],
    maxHp: 126,
    category: 5,
    multiattack: { attacks: 2 },
    xp: 2300,
    ac: 16,
    attackBonus: 9,
    damage: {
      count: 4,
      sides: 8,
      bonus: 5,
      type: "piercing",
      attackType: "weapon",
      label: "4d8 + 5 piercing",
    },
    damageResistances: [
      "poison"
    ],
    specialAbility: [
      "VenomBite", // On hit: Con save or extra poison damage.
      "Constricting Coil", // On hit/status: target saves or is briefly restrained.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "R",
    tokenArt: "assets/tokens/rotwater-serpent.jpg",
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("highTierRotwaterSerpent");

  window.DungeonContent.register("monsters", "highTierBlackfenHydraBeast", {
    name: "Blackfen Hydra-Beast",
    role: "Category 5 swamp beast boss",
    sizeSquares: 2,
    tags: [
      "beast",
      "swamp",
      "hydra",
      "boss"
    ],
    maxHp: 220,
    category: 5,
    multiattack: { attacks: 2 },
    xp: 5200,
    ac: 19,
    attackBonus: 10,
    damage: {
      count: 4,
      sides: 10,
      bonus: 6,
      type: "slashing",
      attackType: "weapon",
      label: "4d10 + 6 slashing",
    },
    specialAbility: [
      "Bite and Tear", // Bloodied finisher: extra damage if target is at or below half HP.
      "BloodFrenzy", // Start-of-turn: at or below half HP, gains +1 attack for that turn.
      "SelfHeal", // Once per fight below half HP: heals a small amount.
    ],
    initiativeBonus: 3,
    speedFeet: 30,
    behavior: "melee",
    token: "B",
    tokenArt: "assets/tokens/blackfen-hydra-beast.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("highTierBlackfenHydraBeast");


  // Category 6 — Party Level 11/12

  window.DungeonContent.register("monsters", "highTierStiltLegHorrorCrane", {
    name: "Stilt-Leg Horror Crane",
    role: "Tall stabbing marsh bird",
    tags: [
      "beast",
      "swamp",
      "bird"
    ],
    maxHp: 148,
    category: 6,
    multiattack: { attacks: 2 },
    xp: 3400,
    ac: 18,
    attackBonus: 10,
    damage: {
      count: 5,
      sides: 6,
      bonus: 6,
      type: "slashing",
      attackType: "weapon",
      label: "5d6 + 6 slashing",
    },
    specialAbility: [
      "Needle Draft", // Shard/cut rider: target saves or takes slashing damage and movement penalty.
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
    ],
    initiativeBonus: 4,
    speedFeet: 50,
    behavior: "melee",
    token: "S",
    tokenArt: "assets/tokens/stilt-leg-horror-crane.jpg",
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("highTierStiltLegHorrorCrane");

  window.DungeonContent.register("monsters", "highTierMudbackBehemoth", {
    name: "Mudback Behemoth",
    role: "Huge swamp trampler",
    sizeSquares: 2,
    tags: [
      "beast",
      "swamp",
      "behemoth"
    ],
    maxHp: 172,
    category: 6,
    multiattack: { attacks: 2 },
    xp: 4700,
    ac: 17,
    attackBonus: 11,
    damage: {
      count: 5,
      sides: 8,
      bonus: 6,
      type: "bludgeoning",
      attackType: "weapon",
      label: "5d8 + 6 bludgeoning",
    },
    specialAbility: [
      "Stampede", // Line/charge effect: save or take bludgeoning damage and be pushed.
      "MarshAmbush", // Movement identity: first attack against targets in swamp/difficult terrain gains bonus.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "M",
    tokenArt: "assets/tokens/mudback-behemoth.jpg",
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("highTierMudbackBehemoth");

  window.DungeonContent.register("monsters", "highTierTheDrowningBoar", {
    name: "The Drowning Boar",
    role: "Category 6 swamp beast boss",
    tags: [
      "beast",
      "swamp",
      "boar",
      "boss"
    ],
    maxHp: 310,
    category: 6,
    multiattack: { attacks: 2 },
    xp: 8600,
    ac: 20,
    attackBonus: 11,
    damage: {
      count: 5,
      sides: 10,
      bonus: 7,
      type: "bludgeoning",
      attackType: "weapon",
      label: "5d10 + 7 bludgeoning",
    },
    specialAbility: [
      "Charge", // If the monster moved at least 20 ft before attacking, hit adds bonus damage and may shove.
      "Drowning Grip", // Cold/slow or pull rider: target saves or is slowed/restrained briefly.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "T",
    tokenArt: "assets/tokens/the-drowning-boar.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("highTierTheDrowningBoar");


  // Category 7 — Party Level 13/14

  window.DungeonContent.register("monsters", "highTierCorpseReedAlligator", {
    name: "Corpse-Reed Alligator",
    role: "Grave-water ambusher",
    sizeSquares: 2,
    tags: [
      "beast",
      "swamp",
      "alligator"
    ],
    maxHp: 196,
    category: 7,
    multiattack: { attacks: 3 },
    xp: 6400,
    ac: 19,
    attackBonus: 11,
    damage: {
      count: 6,
      sides: 6,
      bonus: 7,
      type: "piercing",
      attackType: "weapon",
      label: "6d6 + 7 piercing",
    },
    specialAbility: [
      "Pull Under", // Pull rider: target saves or is pulled/dragged and briefly slowed.
      "Blood in the Water", // Bloodied finisher: extra damage against wounded targets; strong for aquatic predators.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "C",
    tokenArt: "assets/tokens/corpse-reed-alligator.jpg",
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("highTierCorpseReedAlligator");

  window.DungeonContent.register("monsters", "highTierVileMosquitoQueen", {
    name: "Vile Mosquito Queen",
    role: "Venomous flying swarm mother",
    tags: [
      "beast",
      "swamp",
      "insect",
      "flying",
      "poison"
    ],
    maxHp: 224,
    category: 7,
    multiattack: { attacks: 3 },
    xp: 8200,
    ac: 18,
    attackBonus: 12,
    damage: {
      count: 6,
      sides: 8,
      bonus: 7,
      type: "piercing",
      attackType: "weapon",
      label: "6d8 + 7 piercing",
    },
    damageResistances: [
      "poison"
    ],
    specialAbility: [
      "VenomBite", // On hit: Con save or extra poison damage.
      "Swooping Strike", // Flying charge hit: if moved far enough, hit adds damage and may shove/prone.
    ],
    initiativeBonus: 4,
    speedFeet: 60,
    flying: true,
    behavior: "melee",
    token: "V",
    tokenArt: "assets/tokens/vile-mosquito-queen.jpg",
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("highTierVileMosquitoQueen");

  window.DungeonContent.register("monsters", "highTierSloughbackTyrant", {
    name: "Sloughback Tyrant",
    role: "Category 7 swamp beast boss",
    sizeSquares: 2,
    tags: [
      "beast",
      "swamp",
      "crocodile",
      "boss"
    ],
    maxHp: 390,
    category: 7,
    multiattack: { attacks: 3 },
    xp: 13200,
    ac: 21,
    attackBonus: 12,
    damage: {
      count: 6,
      sides: 10,
      bonus: 8,
      type: "piercing",
      attackType: "weapon",
      label: "6d10 + 8 piercing",
    },
    damageResistances: [
      "bludgeoning"
    ],
    specialAbility: [
      "Pull Under", // Pull rider: target saves or is pulled/dragged and briefly slowed.
      "ShellGuard", // Once per fight: gains a short defensive stance or damage reduction.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 30,
    behavior: "melee",
    token: "S",
    tokenArt: "assets/tokens/sloughback-tyrant.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("highTierSloughbackTyrant");


  // Category 8 — Party Level 15/16

  window.DungeonContent.register("monsters", "highTierFenLeviathanSpawn", {
    name: "Fen Leviathan Spawn",
    role: "Gigantic water serpent",
    sizeSquares: 2,
    tags: [
      "beast",
      "swamp",
      "serpent",
      "aquatic"
    ],
    maxHp: 248,
    category: 8,
    multiattack: { attacks: 3 },
    xp: 9200,
    ac: 20,
    attackBonus: 12,
    damage: {
      count: 6,
      sides: 10,
      bonus: 8,
      type: "piercing",
      attackType: "weapon",
      label: "6d10 + 8 piercing",
    },
    specialAbility: [
      "Aquatic", // Identity/mechanics: intended for water rooms and should not be slowed by water.
      "Constricting Coil", // On hit/status: target saves or is briefly restrained.
    ],
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "F",
    tokenArt: "assets/tokens/fen-leviathan-spawn.jpg",
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("highTierFenLeviathanSpawn");

  window.DungeonContent.register("monsters", "highTierMoldhornRhinobeast", {
    name: "Moldhorn Rhinobeast",
    role: "Fungal marsh charger",
    sizeSquares: 2,
    tags: [
      "beast",
      "swamp",
      "rhino"
    ],
    maxHp: 288,
    category: 8,
    multiattack: { attacks: 3 },
    xp: 11800,
    ac: 19,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 8,
      bonus: 8,
      type: "piercing",
      attackType: "weapon",
      label: "7d8 + 8 piercing",
    },
    specialAbility: [
      "Charge", // If the monster moved at least 20 ft before attacking, hit adds bonus damage and may shove.
      "Sickening Claws", // On hit: Con save or poison damage and a small attack penalty.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "M",
    tokenArt: "assets/tokens/moldhorn-rhinobeast.jpg",
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("highTierMoldhornRhinobeast");

  window.DungeonContent.register("monsters", "highTierMudCrownedBehemoth", {
    name: "Mud-Crowned Behemoth",
    role: "Category 8 swamp beast boss",
    sizeSquares: 2,
    tags: [
      "beast",
      "swamp",
      "behemoth",
      "boss"
    ],
    maxHp: 490,
    category: 8,
    multiattack: { attacks: 3 },
    xp: 18400,
    ac: 22,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 10,
      bonus: 9,
      type: "bludgeoning",
      attackType: "weapon",
      label: "7d10 + 9 bludgeoning",
    },
    specialAbility: [
      "Stampede", // Line/charge effect: save or take bludgeoning damage and be pushed.
      "MarshAmbush", // Movement identity: first attack against targets in swamp/difficult terrain gains bonus.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 30,
    behavior: "melee",
    token: "M",
    tokenArt: "assets/tokens/mud-crowned-behemoth.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("highTierMudCrownedBehemoth");


  // Category 9 — Party Level 17/18

  window.DungeonContent.register("monsters", "highTierBlackwaterFangcat", {
    name: "Blackwater Fangcat",
    role: "Huge nocturnal swamp cat",
    sizeSquares: 2,
    tags: [
      "beast",
      "swamp",
      "cat"
    ],
    maxHp: 318,
    category: 9,
    multiattack: { attacks: 3 },
    xp: 13800,
    ac: 21,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 8,
      bonus: 9,
      type: "slashing",
      attackType: "weapon",
      label: "7d8 + 9 slashing",
    },
    specialAbility: [
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
      "BloodFrenzy", // Start-of-turn: at or below half HP, gains +1 attack for that turn.
    ],
    initiativeBonus: 4,
    speedFeet: 50,
    behavior: "melee",
    token: "B",
    tokenArt: "assets/tokens/blackwater-fangcat.jpg",
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("highTierBlackwaterFangcat");

  window.DungeonContent.register("monsters", "highTierGravefenCrocolisk", {
    name: "Gravefen Crocolisk",
    role: "Ancient armored swamp hunter",
    sizeSquares: 2,
    tags: [
      "beast",
      "swamp",
      "crocodile"
    ],
    maxHp: 348,
    category: 9,
    multiattack: { attacks: 3 },
    xp: 16200,
    ac: 20,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 10,
      bonus: 9,
      type: "piercing",
      attackType: "weapon",
      label: "7d10 + 9 piercing",
    },
    damageResistances: [
      "bludgeoning"
    ],
    specialAbility: [
      "ShellGuard", // Once per fight: gains a short defensive stance or damage reduction.
      "Pull Under", // Pull rider: target saves or is pulled/dragged and briefly slowed.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "G",
    tokenArt: "assets/tokens/gravefen-crocolisk.jpg",
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("highTierGravefenCrocolisk");

  window.DungeonContent.register("monsters", "highTierMotherMosquitoOfTheMire", {
    name: "Mother Mosquito of the Mire",
    role: "Category 9 swamp beast boss",
    tags: [
      "beast",
      "swamp",
      "insect",
      "flying",
      "poison",
      "boss"
    ],
    maxHp: 575,
    category: 9,
    multiattack: { attacks: 3 },
    xp: 22400,
    ac: 23,
    attackBonus: 14,
    damage: {
      count: 8,
      sides: 10,
      bonus: 10,
      type: "piercing",
      attackType: "weapon",
      label: "8d10 + 10 piercing",
    },
    damageResistances: [
      "poison"
    ],
    specialAbility: [
      "VenomBite", // On hit: Con save or extra poison damage.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
      "Blood in the Water", // Bloodied finisher: extra damage against wounded targets; strong for aquatic predators.
    ],
    initiativeBonus: 4,
    speedFeet: 60,
    flying: true,
    behavior: "melee",
    token: "M",
    tokenArt: "assets/tokens/mother-mosquito-of-the-mire.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("highTierMotherMosquitoOfTheMire");


  // Category 10 — Party Level 19/20

  window.DungeonContent.register("monsters", "highTierWorldMireCrocodile", {
    name: "World-Mire Crocodile",
    role: "Colossal swamp apex beast",
    sizeSquares: 3,
    tags: [
      "beast",
      "swamp",
      "crocodile"
    ],
    maxHp: 368,
    category: 10,
    multiattack: { attacks: 4 },
    xp: 18200,
    ac: 22,
    attackBonus: 14,
    damage: {
      count: 8,
      sides: 8,
      bonus: 10,
      type: "piercing",
      attackType: "weapon",
      label: "8d8 + 10 piercing",
    },
    specialAbility: [
      "Pull Under", // Pull rider: target saves or is pulled/dragged and briefly slowed.
      "Blood in the Water", // Bloodied finisher: extra damage against wounded targets; strong for aquatic predators.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "W",
    tokenArt: "assets/tokens/world-mire-crocodile.jpg",
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("highTierWorldMireCrocodile");

  window.DungeonContent.register("monsters", "highTierPlaguewingMarshRoc", {
    name: "Plaguewing Marsh Roc",
    role: "Toxic swamp sky hunter",
    sizeSquares: 2,
    tags: [
      "beast",
      "swamp",
      "bird",
      "flying",
      "poison"
    ],
    maxHp: 398,
    category: 10,
    multiattack: { attacks: 3 },
    xp: 22200,
    ac: 23,
    attackBonus: 14,
    damage: {
      count: 8,
      sides: 10,
      bonus: 10,
      type: "piercing",
      attackType: "weapon",
      label: "8d10 + 10 piercing",
    },
    damageResistances: [
      "poison"
    ],
    specialAbility: [
      "Swooping Strike", // Flying charge hit: if moved far enough, hit adds damage and may shove/prone.
      "VenomBite", // On hit: Con save or extra poison damage.
    ],
    initiativeBonus: 4,
    speedFeet: 60,
    flying: true,
    behavior: "melee",
    token: "P",
    tokenArt: "assets/tokens/plaguewing-marsh-roc.jpg",
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("highTierPlaguewingMarshRoc");

  window.DungeonContent.register("monsters", "highTierTheFenThatBites", {
    name: "The Fen That Bites",
    role: "Category 10 swamp beast boss",
    sizeSquares: 3,
    tags: [
      "beast",
      "swamp",
      "crocodile",
      "boss"
    ],
    maxHp: 680,
    category: 10,
    multiattack: { attacks: 4 },
    xp: 30500,
    ac: 24,
    attackBonus: 15,
    damage: {
      count: 9,
      sides: 10,
      bonus: 12,
      type: "piercing",
      attackType: "weapon",
      label: "9d10 + 12 piercing",
    },
    specialAbility: [
      "Pull Under", // Pull rider: target saves or is pulled/dragged and briefly slowed.
      "MarshAmbush", // Movement identity: first attack against targets in swamp/difficult terrain gains bonus.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
      "SelfHeal", // Once per fight below half HP: heals a small amount.
    ],
    initiativeBonus: 3,
    speedFeet: 30,
    behavior: "melee",
    token: "T",
    tokenArt: "assets/tokens/the-fen-that-bites.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.swamp = window.BeastBiomeMonsterIds.swamp || [];
  window.BeastBiomeMonsterIds.swamp.push("highTierTheFenThatBites");


  /* ============================================================
   * BEAST + ARCTIC
   * ============================================================ */


  // Category 4 — Party Level 7/8

  window.DungeonContent.register("monsters", "highTierFrostmaneWolf", {
    name: "Frostmane Wolf",
    role: "Cold pack killer",
    tags: [
      "beast",
      "arctic",
      "wolf",
      "cold"
    ],
    maxHp: 78,
    category: 4,
    multiattack: { attacks: 2 },
    xp: 850,
    ac: 16,
    attackBonus: 8,
    damage: {
      count: 3,
      sides: 6,
      bonus: 4,
      type: "piercing",
      attackType: "weapon",
      label: "3d6 + 4 piercing",
    },
    damageResistances: [
      "cold"
    ],
    damageVulnerabilities: [
      "fire"
    ],
    specialAbility: [
      "Cold Bite", // On hit: save or suffer cold damage and a brief movement penalty.
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
    ],
    initiativeBonus: 4,
    speedFeet: 50,
    behavior: "melee",
    token: "F",
    tokenArt: "assets/tokens/frostmane-wolf.jpg",
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("highTierFrostmaneWolf");

  window.DungeonContent.register("monsters", "highTierSnowplateBear", {
    name: "Snowplate Bear",
    role: "Armored polar bruiser",
    sizeSquares: 2,
    tags: [
      "beast",
      "arctic",
      "bear",
      "cold"
    ],
    maxHp: 88,
    category: 4,
    multiattack: { attacks: 2 },
    xp: 1100,
    ac: 17,
    attackBonus: 8,
    damage: {
      count: 3,
      sides: 8,
      bonus: 4,
      type: "piercing",
      attackType: "weapon",
      label: "3d8 + 4 piercing",
    },
    damageResistances: [
      "cold"
    ],
    damageVulnerabilities: [
      "fire"
    ],
    specialAbility: [
      "FrostHide", // Passive/defensive: expresses cold resistance or brief defensive stance.
      "Mauling Rush", // Charge/pounce hit: if moved far enough, adds damage and may shove/prone.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "S",
    tokenArt: "assets/tokens/snowplate-bear.jpg",
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("highTierSnowplateBear");

  window.DungeonContent.register("monsters", "highTierWhitefangPackmother", {
    name: "Whitefang Packmother",
    role: "Category 4 arctic beast boss",
    tags: [
      "beast",
      "arctic",
      "wolf",
      "cold",
      "boss"
    ],
    maxHp: 152,
    category: 4,
    multiattack: { attacks: 2 },
    xp: 2400,
    ac: 18,
    attackBonus: 9,
    damage: {
      count: 3,
      sides: 10,
      bonus: 5,
      type: "piercing",
      attackType: "weapon",
      label: "3d10 + 5 piercing",
    },
    damageResistances: [
      "cold"
    ],
    damageVulnerabilities: [
      "fire"
    ],
    specialAbility: [
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
      "FrostHide", // Passive/defensive: expresses cold resistance or brief defensive stance.
    ],
    initiativeBonus: 4,
    speedFeet: 50,
    behavior: "melee",
    token: "W",
    tokenArt: "assets/tokens/whitefang-packmother.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("highTierWhitefangPackmother");


  // Category 5 — Party Level 9/10

  window.DungeonContent.register("monsters", "highTierIcehookOwl", {
    name: "Icehook Owl",
    role: "Silent arctic flier",
    tags: [
      "beast",
      "arctic",
      "bird",
      "flying",
      "cold"
    ],
    maxHp: 108,
    category: 5,
    multiattack: { attacks: 2 },
    xp: 1900,
    ac: 17,
    attackBonus: 9,
    damage: {
      count: 4,
      sides: 6,
      bonus: 5,
      type: "piercing",
      attackType: "weapon",
      label: "4d6 + 5 piercing",
    },
    damageResistances: [
      "cold"
    ],
    damageVulnerabilities: [
      "fire"
    ],
    specialAbility: [
      "Swooping Strike", // Flying charge hit: if moved far enough, hit adds damage and may shove/prone.
      "Cold Bite", // On hit: save or suffer cold damage and a brief movement penalty.
    ],
    initiativeBonus: 4,
    speedFeet: 60,
    flying: true,
    behavior: "melee",
    token: "I",
    tokenArt: "assets/tokens/icehook-owl.jpg",
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("highTierIcehookOwl");

  window.DungeonContent.register("monsters", "highTierRimehornElk", {
    name: "Rimehorn Elk",
    role: "Cold antler charger",
    tags: [
      "beast",
      "arctic",
      "elk",
      "cold"
    ],
    maxHp: 126,
    category: 5,
    multiattack: { attacks: 2 },
    xp: 2300,
    ac: 16,
    attackBonus: 9,
    damage: {
      count: 4,
      sides: 8,
      bonus: 5,
      type: "piercing",
      attackType: "weapon",
      label: "4d8 + 5 piercing",
    },
    damageResistances: [
      "cold"
    ],
    damageVulnerabilities: [
      "fire"
    ],
    specialAbility: [
      "Charge", // If the monster moved at least 20 ft before attacking, hit adds bonus damage and may shove.
      "FrostHide", // Passive/defensive: expresses cold resistance or brief defensive stance.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "R",
    tokenArt: "assets/tokens/rimehorn-elk.jpg",
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("highTierRimehornElk");

  window.DungeonContent.register("monsters", "highTierOldSnowmawBear", {
    name: "Old Snowmaw Bear",
    role: "Category 5 arctic beast boss",
    sizeSquares: 2,
    tags: [
      "beast",
      "arctic",
      "bear",
      "cold",
      "boss"
    ],
    maxHp: 220,
    category: 5,
    multiattack: { attacks: 2 },
    xp: 5200,
    ac: 19,
    attackBonus: 10,
    damage: {
      count: 4,
      sides: 10,
      bonus: 6,
      type: "piercing",
      attackType: "weapon",
      label: "4d10 + 6 piercing",
    },
    damageResistances: [
      "cold"
    ],
    damageVulnerabilities: [
      "fire"
    ],
    specialAbility: [
      "Mauling Rush", // Charge/pounce hit: if moved far enough, adds damage and may shove/prone.
      "SelfHeal", // Once per fight below half HP: heals a small amount.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 30,
    behavior: "melee",
    token: "O",
    tokenArt: "assets/tokens/old-snowmaw-bear.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("highTierOldSnowmawBear");


  // Category 6 — Party Level 11/12

  window.DungeonContent.register("monsters", "highTierGlacierbackMammoth", {
    name: "Glacierback Mammoth",
    role: "Huge arctic trampler",
    sizeSquares: 2,
    tags: [
      "beast",
      "arctic",
      "mammoth",
      "cold"
    ],
    maxHp: 148,
    category: 6,
    multiattack: { attacks: 2 },
    xp: 3400,
    ac: 18,
    attackBonus: 10,
    damage: {
      count: 5,
      sides: 6,
      bonus: 6,
      type: "piercing",
      attackType: "weapon",
      label: "5d6 + 6 piercing",
    },
    damageResistances: [
      "cold"
    ],
    damageVulnerabilities: [
      "fire"
    ],
    specialAbility: [
      "Stampede", // Line/charge effect: save or take bludgeoning damage and be pushed.
      "FrostHide", // Passive/defensive: expresses cold resistance or brief defensive stance.
    ],
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "G",
    tokenArt: "assets/tokens/glacierback-mammoth.jpg",
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("highTierGlacierbackMammoth");

  window.DungeonContent.register("monsters", "highTierIceflowSealion", {
    name: "Iceflow Sealion",
    role: "Amphibious cold-water hunter",
    tags: [
      "beast",
      "arctic",
      "sealion",
      "aquatic",
      "cold"
    ],
    maxHp: 172,
    category: 6,
    multiattack: { attacks: 2 },
    xp: 4700,
    ac: 17,
    attackBonus: 11,
    damage: {
      count: 5,
      sides: 8,
      bonus: 6,
      type: "piercing",
      attackType: "weapon",
      label: "5d8 + 6 piercing",
    },
    damageResistances: [
      "cold"
    ],
    damageVulnerabilities: [
      "fire"
    ],
    specialAbility: [
      "Aquatic", // Identity/mechanics: intended for water rooms and should not be slowed by water.
      "Cold Bite", // On hit: save or suffer cold damage and a brief movement penalty.
    ],
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "I",
    tokenArt: "assets/tokens/iceflow-sealion.jpg",
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("highTierIceflowSealion");

  window.DungeonContent.register("monsters", "highTierRimeTuskMammoth", {
    name: "Rime-Tusk Mammoth",
    role: "Category 6 arctic beast boss",
    sizeSquares: 2,
    tags: [
      "beast",
      "arctic",
      "mammoth",
      "cold",
      "boss"
    ],
    maxHp: 310,
    category: 6,
    multiattack: { attacks: 2 },
    xp: 8600,
    ac: 20,
    attackBonus: 11,
    damage: {
      count: 5,
      sides: 10,
      bonus: 7,
      type: "piercing",
      attackType: "weapon",
      label: "5d10 + 7 piercing",
    },
    damageResistances: [
      "cold"
    ],
    damageVulnerabilities: [
      "fire"
    ],
    specialAbility: [
      "Stampede", // Line/charge effect: save or take bludgeoning damage and be pushed.
      "Glacial Advance", // Cold area/slow: targets save or take cold damage and are slowed.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "R",
    tokenArt: "assets/tokens/rime-tusk-mammoth.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("highTierRimeTuskMammoth");


  // Category 7 — Party Level 13/14

  window.DungeonContent.register("monsters", "highTierPaleSabertooth", {
    name: "Pale Sabertooth",
    role: "Frozen saber-cat",
    tags: [
      "beast",
      "arctic",
      "cat",
      "cold"
    ],
    maxHp: 196,
    category: 7,
    multiattack: { attacks: 3 },
    xp: 6400,
    ac: 19,
    attackBonus: 11,
    damage: {
      count: 6,
      sides: 6,
      bonus: 7,
      type: "piercing",
      attackType: "weapon",
      label: "6d6 + 7 piercing",
    },
    damageResistances: [
      "cold"
    ],
    damageVulnerabilities: [
      "fire"
    ],
    specialAbility: [
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
      "Cold Bite", // On hit: save or suffer cold damage and a brief movement penalty.
    ],
    initiativeBonus: 4,
    speedFeet: 50,
    behavior: "melee",
    token: "P",
    tokenArt: "assets/tokens/pale-sabertooth.jpg",
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("highTierPaleSabertooth");

  window.DungeonContent.register("monsters", "highTierWhiteoutRoc", {
    name: "Whiteout Roc",
    role: "Snowstorm sky predator",
    sizeSquares: 2,
    tags: [
      "beast",
      "arctic",
      "bird",
      "flying",
      "cold"
    ],
    maxHp: 224,
    category: 7,
    multiattack: { attacks: 3 },
    xp: 8200,
    ac: 18,
    attackBonus: 12,
    damage: {
      count: 6,
      sides: 8,
      bonus: 7,
      type: "piercing",
      attackType: "weapon",
      label: "6d8 + 7 piercing",
    },
    damageResistances: [
      "cold"
    ],
    damageVulnerabilities: [
      "fire"
    ],
    specialAbility: [
      "Swooping Strike", // Flying charge hit: if moved far enough, hit adds damage and may shove/prone.
      "FrostHide", // Passive/defensive: expresses cold resistance or brief defensive stance.
    ],
    initiativeBonus: 4,
    speedFeet: 60,
    flying: true,
    behavior: "melee",
    token: "W",
    tokenArt: "assets/tokens/whiteout-roc.jpg",
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("highTierWhiteoutRoc");

  window.DungeonContent.register("monsters", "highTierKingWalrusOfTheIceShelf", {
    name: "King Walrus of the Ice Shelf",
    role: "Category 7 arctic beast boss",
    tags: [
      "beast",
      "arctic",
      "walrus",
      "aquatic",
      "cold",
      "boss"
    ],
    maxHp: 390,
    category: 7,
    multiattack: { attacks: 3 },
    xp: 13200,
    ac: 21,
    attackBonus: 12,
    damage: {
      count: 6,
      sides: 10,
      bonus: 8,
      type: "piercing",
      attackType: "weapon",
      label: "6d10 + 8 piercing",
    },
    damageResistances: [
      "cold"
    ],
    damageVulnerabilities: [
      "fire"
    ],
    specialAbility: [
      "Aquatic", // Identity/mechanics: intended for water rooms and should not be slowed by water.
      "Crushing Stomp", // Slam hit: if moved or against adjacent target, may knock prone on failed save.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "K",
    tokenArt: "assets/tokens/king-walrus-of-the-ice-shelf.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("highTierKingWalrusOfTheIceShelf");


  // Category 8 — Party Level 15/16

  window.DungeonContent.register("monsters", "highTierFrostscaleSpinosaur", {
    name: "Frostscale Spinosaur",
    role: "Cold river dinosaur",
    sizeSquares: 2,
    tags: [
      "beast",
      "arctic",
      "dinosaur",
      "aquatic",
      "cold"
    ],
    maxHp: 248,
    category: 8,
    multiattack: { attacks: 3 },
    xp: 9200,
    ac: 20,
    attackBonus: 12,
    damage: {
      count: 6,
      sides: 10,
      bonus: 8,
      type: "piercing",
      attackType: "weapon",
      label: "6d10 + 8 piercing",
    },
    damageResistances: [
      "cold"
    ],
    damageVulnerabilities: [
      "fire"
    ],
    specialAbility: [
      "Aquatic", // Identity/mechanics: intended for water rooms and should not be slowed by water.
      "Blood in the Water", // Bloodied finisher: extra damage against wounded targets; strong for aquatic predators.
    ],
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "F",
    tokenArt: "assets/tokens/frostscale-spinosaur.jpg",
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("highTierFrostscaleSpinosaur");

  window.DungeonContent.register("monsters", "highTierAuroraSerpent", {
    name: "Aurora Serpent",
    role: "Shimmering arctic snake",
    sizeSquares: 2,
    tags: [
      "beast",
      "arctic",
      "snake",
      "cold"
    ],
    maxHp: 288,
    category: 8,
    multiattack: { attacks: 3 },
    xp: 11800,
    ac: 19,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 8,
      bonus: 8,
      type: "piercing",
      attackType: "weapon",
      label: "7d8 + 8 piercing",
    },
    damageResistances: [
      "cold"
    ],
    damageVulnerabilities: [
      "fire"
    ],
    specialAbility: [
      "Cold Bite", // On hit: save or suffer cold damage and a brief movement penalty.
      "Constricting Coil", // On hit/status: target saves or is briefly restrained.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "A",
    tokenArt: "assets/tokens/aurora-serpent.jpg",
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("highTierAuroraSerpent");

  window.DungeonContent.register("monsters", "highTierTheWhiteMammoth", {
    name: "The White Mammoth",
    role: "Category 8 arctic beast boss",
    sizeSquares: 2,
    tags: [
      "beast",
      "arctic",
      "mammoth",
      "cold",
      "boss"
    ],
    maxHp: 490,
    category: 8,
    multiattack: { attacks: 3 },
    xp: 18400,
    ac: 22,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 10,
      bonus: 9,
      type: "piercing",
      attackType: "weapon",
      label: "7d10 + 9 piercing",
    },
    damageResistances: [
      "cold"
    ],
    damageVulnerabilities: [
      "fire"
    ],
    specialAbility: [
      "Stampede", // Line/charge effect: save or take bludgeoning damage and be pushed.
      "FrostHide", // Passive/defensive: expresses cold resistance or brief defensive stance.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "T",
    tokenArt: "assets/tokens/the-white-mammoth.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("highTierTheWhiteMammoth");


  // Category 9 — Party Level 17/18

  window.DungeonContent.register("monsters", "highTierPolarNightBear", {
    name: "Polar Night Bear",
    role: "Huge shadow-white killer",
    sizeSquares: 2,
    tags: [
      "beast",
      "arctic",
      "bear",
      "cold"
    ],
    maxHp: 318,
    category: 9,
    multiattack: { attacks: 3 },
    xp: 13800,
    ac: 21,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 8,
      bonus: 9,
      type: "piercing",
      attackType: "weapon",
      label: "7d8 + 9 piercing",
    },
    damageResistances: [
      "cold"
    ],
    damageVulnerabilities: [
      "fire"
    ],
    specialAbility: [
      "Polar Night", // Cold/psychological pressure: target saves or suffers cold damage/penalty.
      "Mauling Rush", // Charge/pounce hit: if moved far enough, adds damage and may shove/prone.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "P",
    tokenArt: "assets/tokens/polar-night-bear.jpg",
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("highTierPolarNightBear");

  window.DungeonContent.register("monsters", "highTierIcecliffWyvern", {
    name: "Icecliff Wyvern",
    role: "Frozen cliff flier",
    sizeSquares: 2,
    tags: [
      "beast",
      "arctic",
      "wyvern",
      "flying",
      "cold"
    ],
    maxHp: 348,
    category: 9,
    multiattack: { attacks: 3 },
    xp: 16200,
    ac: 20,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 10,
      bonus: 9,
      type: "piercing",
      attackType: "weapon",
      label: "7d10 + 9 piercing",
    },
    damageResistances: [
      "cold"
    ],
    damageVulnerabilities: [
      "fire"
    ],
    specialAbility: [
      "Swooping Strike", // Flying charge hit: if moved far enough, hit adds damage and may shove/prone.
      "Cold Bite", // On hit: save or suffer cold damage and a brief movement penalty.
    ],
    initiativeBonus: 4,
    speedFeet: 60,
    flying: true,
    behavior: "melee",
    token: "I",
    tokenArt: "assets/tokens/icecliff-wyvern.jpg",
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("highTierIcecliffWyvern");

  window.DungeonContent.register("monsters", "highTierGlacierjawTyrant", {
    name: "Glacierjaw Tyrant",
    role: "Category 9 arctic beast boss",
    sizeSquares: 2,
    tags: [
      "beast",
      "arctic",
      "dinosaur",
      "cold",
      "boss"
    ],
    maxHp: 575,
    category: 9,
    multiattack: { attacks: 3 },
    xp: 22400,
    ac: 23,
    attackBonus: 14,
    damage: {
      count: 8,
      sides: 10,
      bonus: 10,
      type: "piercing",
      attackType: "weapon",
      label: "8d10 + 10 piercing",
    },
    damageResistances: [
      "cold"
    ],
    damageVulnerabilities: [
      "fire"
    ],
    specialAbility: [
      "Cold Bite", // On hit: save or suffer cold damage and a brief movement penalty.
      "BloodFrenzy", // Start-of-turn: at or below half HP, gains +1 attack for that turn.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 30,
    behavior: "melee",
    token: "G",
    tokenArt: "assets/tokens/glacierjaw-tyrant.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("highTierGlacierjawTyrant");


  // Category 10 — Party Level 19/20

  window.DungeonContent.register("monsters", "highTierWorldIceMammoth", {
    name: "World-Ice Mammoth",
    role: "Legendary glacier trampler",
    sizeSquares: 3,
    tags: [
      "beast",
      "arctic",
      "mammoth",
      "cold"
    ],
    maxHp: 368,
    category: 10,
    multiattack: { attacks: 3 },
    xp: 18200,
    ac: 22,
    attackBonus: 14,
    damage: {
      count: 8,
      sides: 8,
      bonus: 10,
      type: "piercing",
      attackType: "weapon",
      label: "8d8 + 10 piercing",
    },
    damageResistances: [
      "cold"
    ],
    damageVulnerabilities: [
      "fire"
    ],
    specialAbility: [
      "Stampede", // Line/charge effect: save or take bludgeoning damage and be pushed.
      "Glacial Advance", // Cold area/slow: targets save or take cold damage and are slowed.
    ],
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "W",
    tokenArt: "assets/tokens/world-ice-mammoth.jpg",
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("highTierWorldIceMammoth");

  window.DungeonContent.register("monsters", "highTierAuroraCrownRoc", {
    name: "Aurora Crown Roc",
    role: "Colossal polar sky hunter",
    sizeSquares: 3,
    tags: [
      "beast",
      "arctic",
      "bird",
      "flying",
      "cold"
    ],
    maxHp: 398,
    category: 10,
    multiattack: { attacks: 3 },
    xp: 22200,
    ac: 23,
    attackBonus: 14,
    damage: {
      count: 8,
      sides: 10,
      bonus: 10,
      type: "piercing",
      attackType: "weapon",
      label: "8d10 + 10 piercing",
    },
    damageResistances: [
      "cold"
    ],
    damageVulnerabilities: [
      "fire"
    ],
    specialAbility: [
      "Swooping Strike", // Flying charge hit: if moved far enough, hit adds damage and may shove/prone.
      "Polar Night", // Cold/psychological pressure: target saves or suffers cold damage/penalty.
    ],
    initiativeBonus: 4,
    speedFeet: 60,
    flying: true,
    behavior: "melee",
    token: "A",
    tokenArt: "assets/tokens/aurora-crown-roc.jpg",
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("highTierAuroraCrownRoc");

  window.DungeonContent.register("monsters", "highTierTheFirstWinterBear", {
    name: "The First Winter Bear",
    role: "Category 10 arctic beast boss",
    sizeSquares: 2,
    tags: [
      "beast",
      "arctic",
      "bear",
      "cold",
      "boss"
    ],
    maxHp: 680,
    category: 10,
    multiattack: { attacks: 4 },
    xp: 30500,
    ac: 24,
    attackBonus: 15,
    damage: {
      count: 9,
      sides: 10,
      bonus: 12,
      type: "piercing",
      attackType: "weapon",
      label: "9d10 + 12 piercing",
    },
    damageResistances: [
      "cold"
    ],
    damageVulnerabilities: [
      "fire"
    ],
    specialAbility: [
      "FrostHide", // Passive/defensive: expresses cold resistance or brief defensive stance.
      "Mauling Rush", // Charge/pounce hit: if moved far enough, adds damage and may shove/prone.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
      "SelfHeal", // Once per fight below half HP: heals a small amount.
    ],
    initiativeBonus: 3,
    speedFeet: 30,
    behavior: "melee",
    token: "T",
    tokenArt: "assets/tokens/the-first-winter-bear.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.arctic = window.BeastBiomeMonsterIds.arctic || [];
  window.BeastBiomeMonsterIds.arctic.push("highTierTheFirstWinterBear");


  /* ============================================================
   * BEAST + URBAN
   * ============================================================ */


  // Category 4 — Party Level 7/8

  window.DungeonContent.register("monsters", "highTierGutterfangDireRat", {
    name: "Gutterfang Dire Rat",
    role: "Oversized sewer pack beast",
    tags: [
      "beast",
      "urban",
      "rat",
      "sewer"
    ],
    maxHp: 78,
    category: 4,
    multiattack: { attacks: 2 },
    xp: 850,
    ac: 16,
    attackBonus: 8,
    damage: {
      count: 3,
      sides: 6,
      bonus: 4,
      type: "slashing",
      attackType: "weapon",
      label: "3d6 + 4 slashing",
    },
    specialAbility: [
      "SewerSkulk", // Movement identity: better movement and hiding in urban ruins/sewers.
      "BloodFrenzy", // Start-of-turn: at or below half HP, gains +1 attack for that turn.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "G",
    tokenArt: "assets/tokens/gutterfang-dire-rat.jpg",
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("highTierGutterfangDireRat");

  window.DungeonContent.register("monsters", "highTierRooftopRazorbat", {
    name: "Rooftop Razorbat",
    role: "City flier ambusher",
    tags: [
      "beast",
      "urban",
      "bat",
      "flying"
    ],
    maxHp: 88,
    category: 4,
    multiattack: { attacks: 2 },
    xp: 1100,
    ac: 17,
    attackBonus: 8,
    damage: {
      count: 3,
      sides: 8,
      bonus: 4,
      type: "slashing",
      attackType: "weapon",
      label: "3d8 + 4 slashing",
    },
    specialAbility: [
      "Swooping Strike", // Flying charge hit: if moved far enough, hit adds damage and may shove/prone.
      "SewerSkulk", // Movement identity: better movement and hiding in urban ruins/sewers.
    ],
    initiativeBonus: 4,
    speedFeet: 60,
    flying: true,
    behavior: "melee",
    token: "R",
    tokenArt: "assets/tokens/rooftop-razorbat.jpg",
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("highTierRooftopRazorbat");

  window.DungeonContent.register("monsters", "highTierOldUnderbridgeBoar", {
    name: "Old Underbridge Boar",
    role: "Category 4 urban beast boss",
    tags: [
      "beast",
      "urban",
      "boar",
      "sewer",
      "boss"
    ],
    maxHp: 152,
    category: 4,
    multiattack: { attacks: 2 },
    xp: 2400,
    ac: 18,
    attackBonus: 9,
    damage: {
      count: 3,
      sides: 10,
      bonus: 5,
      type: "bludgeoning",
      attackType: "weapon",
      label: "3d10 + 5 bludgeoning",
    },
    specialAbility: [
      "Charge", // If the monster moved at least 20 ft before attacking, hit adds bonus damage and may shove.
      "SewerSkulk", // Movement identity: better movement and hiding in urban ruins/sewers.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "O",
    tokenArt: "assets/tokens/old-underbridge-boar.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("highTierOldUnderbridgeBoar");


  // Category 5 — Party Level 9/10

  window.DungeonContent.register("monsters", "highTierKennelBornDireHound", {
    name: "Kennel-Born Dire Hound",
    role: "War-trained city beast",
    tags: [
      "beast",
      "urban",
      "hound"
    ],
    maxHp: 108,
    category: 5,
    multiattack: { attacks: 2 },
    xp: 1900,
    ac: 17,
    attackBonus: 9,
    damage: {
      count: 4,
      sides: 6,
      bonus: 5,
      type: "slashing",
      attackType: "weapon",
      label: "4d6 + 5 slashing",
    },
    specialAbility: [
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
      "Hamstring Bite", // On hit: target saves or movement is reduced briefly.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "K",
    tokenArt: "assets/tokens/kennel-born-dire-hound.jpg",
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("highTierKennelBornDireHound");

  window.DungeonContent.register("monsters", "highTierBellTowerVulture", {
    name: "Bell-Tower Vulture",
    role: "Carrion city flier",
    tags: [
      "beast",
      "urban",
      "bird",
      "flying"
    ],
    maxHp: 126,
    category: 5,
    multiattack: { attacks: 2 },
    xp: 2300,
    ac: 16,
    attackBonus: 9,
    damage: {
      count: 4,
      sides: 8,
      bonus: 5,
      type: "slashing",
      attackType: "weapon",
      label: "4d8 + 5 slashing",
    },
    specialAbility: [
      "Swooping Strike", // Flying charge hit: if moved far enough, hit adds damage and may shove/prone.
      "BloodFrenzy", // Start-of-turn: at or below half HP, gains +1 attack for that turn.
    ],
    initiativeBonus: 4,
    speedFeet: 60,
    flying: true,
    behavior: "melee",
    token: "B",
    tokenArt: "assets/tokens/bell-tower-vulture.jpg",
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("highTierBellTowerVulture");

  window.DungeonContent.register("monsters", "highTierSewerCrocodileAncient", {
    name: "Sewer Crocodile Ancient",
    role: "Category 5 urban beast boss",
    sizeSquares: 2,
    tags: [
      "beast",
      "urban",
      "crocodile",
      "sewer",
      "boss"
    ],
    maxHp: 220,
    category: 5,
    multiattack: { attacks: 2 },
    xp: 5200,
    ac: 19,
    attackBonus: 10,
    damage: {
      count: 4,
      sides: 10,
      bonus: 6,
      type: "piercing",
      attackType: "weapon",
      label: "4d10 + 6 piercing",
    },
    specialAbility: [
      "SewerSkulk", // Movement identity: better movement and hiding in urban ruins/sewers.
      "Pull Under", // Pull rider: target saves or is pulled/dragged and briefly slowed.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 30,
    behavior: "melee",
    token: "S",
    tokenArt: "assets/tokens/sewer-crocodile-ancient.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("highTierSewerCrocodileAncient");


  // Category 6 — Party Level 11/12

  window.DungeonContent.register("monsters", "highTierMarketShadowPanther", {
    name: "Market-Shadow Panther",
    role: "Escaped exotic stalker",
    tags: [
      "beast",
      "urban",
      "cat"
    ],
    maxHp: 148,
    category: 6,
    multiattack: { attacks: 2 },
    xp: 3400,
    ac: 18,
    attackBonus: 10,
    damage: {
      count: 5,
      sides: 6,
      bonus: 6,
      type: "slashing",
      attackType: "weapon",
      label: "5d6 + 6 slashing",
    },
    specialAbility: [
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
      "SewerSkulk", // Movement identity: better movement and hiding in urban ruins/sewers.
    ],
    initiativeBonus: 4,
    speedFeet: 50,
    behavior: "melee",
    token: "M",
    tokenArt: "assets/tokens/market-shadow-panther.jpg",
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("highTierMarketShadowPanther");

  window.DungeonContent.register("monsters", "highTierRustManeHyena", {
    name: "Rust-Mane Hyena",
    role: "Street scavenger brute",
    tags: [
      "beast",
      "urban",
      "hyena"
    ],
    maxHp: 172,
    category: 6,
    multiattack: { attacks: 2 },
    xp: 4700,
    ac: 17,
    attackBonus: 11,
    damage: {
      count: 5,
      sides: 8,
      bonus: 6,
      type: "slashing",
      attackType: "weapon",
      label: "5d8 + 6 slashing",
    },
    specialAbility: [
      "BloodFrenzy", // Start-of-turn: at or below half HP, gains +1 attack for that turn.
      "Bite and Tear", // Bloodied finisher: extra damage if target is at or below half HP.
    ],
    initiativeBonus: 2,
    speedFeet: 50,
    behavior: "melee",
    token: "R",
    tokenArt: "assets/tokens/rust-mane-hyena.jpg",
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("highTierRustManeHyena");

  window.DungeonContent.register("monsters", "highTierTheKennelKing", {
    name: "The Kennel King",
    role: "Category 6 urban beast boss",
    tags: [
      "beast",
      "urban",
      "hound",
      "boss"
    ],
    maxHp: 310,
    category: 6,
    multiattack: { attacks: 2 },
    xp: 8600,
    ac: 20,
    attackBonus: 11,
    damage: {
      count: 5,
      sides: 10,
      bonus: 7,
      type: "slashing",
      attackType: "weapon",
      label: "5d10 + 7 slashing",
    },
    specialAbility: [
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
      "Hamstring Bite", // On hit: target saves or movement is reduced briefly.
    ],
    initiativeBonus: 3,
    speedFeet: 30,
    behavior: "melee",
    token: "T",
    tokenArt: "assets/tokens/the-kennel-king.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("highTierTheKennelKing");


  // Category 7 — Party Level 13/14

  window.DungeonContent.register("monsters", "highTierChimneyNestHorrorBat", {
    name: "Chimney Nest Horror Bat",
    role: "Huge soot-winged flier",
    sizeSquares: 2,
    tags: [
      "beast",
      "urban",
      "bat",
      "flying"
    ],
    maxHp: 196,
    category: 7,
    multiattack: { attacks: 3 },
    xp: 6400,
    ac: 19,
    attackBonus: 11,
    damage: {
      count: 6,
      sides: 6,
      bonus: 7,
      type: "slashing",
      attackType: "weapon",
      label: "6d6 + 7 slashing",
    },
    specialAbility: [
      "Swooping Strike", // Flying charge hit: if moved far enough, hit adds damage and may shove/prone.
      "Dust Cough", // On hit: Con save or short attack/movement penalty from choking dust.
    ],
    initiativeBonus: 4,
    speedFeet: 60,
    flying: true,
    behavior: "melee",
    token: "C",
    tokenArt: "assets/tokens/chimney-nest-horror-bat.jpg",
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("highTierChimneyNestHorrorBat");

  window.DungeonContent.register("monsters", "highTierFoundryYardBull", {
    name: "Foundry Yard Bull",
    role: "Industrial charging beast",
    sizeSquares: 2,
    tags: [
      "beast",
      "urban",
      "bull"
    ],
    maxHp: 224,
    category: 7,
    multiattack: { attacks: 3 },
    xp: 8200,
    ac: 18,
    attackBonus: 12,
    damage: {
      count: 6,
      sides: 8,
      bonus: 7,
      type: "bludgeoning",
      attackType: "weapon",
      label: "6d8 + 7 bludgeoning",
    },
    specialAbility: [
      "Charge", // If the monster moved at least 20 ft before attacking, hit adds bonus damage and may shove.
      "Stampede", // Line/charge effect: save or take bludgeoning damage and be pushed.
    ],
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "F",
    tokenArt: "assets/tokens/foundry-yard-bull.jpg",
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("highTierFoundryYardBull");

  window.DungeonContent.register("monsters", "highTierGutterMawSwarmQueen", {
    name: "Gutter-Maw Swarm Queen",
    role: "Category 7 urban beast boss",
    tags: [
      "beast",
      "urban",
      "rat",
      "sewer",
      "boss"
    ],
    maxHp: 390,
    category: 7,
    multiattack: { attacks: 3 },
    xp: 13200,
    ac: 21,
    attackBonus: 12,
    damage: {
      count: 6,
      sides: 10,
      bonus: 8,
      type: "slashing",
      attackType: "weapon",
      label: "6d10 + 8 slashing",
    },
    specialAbility: [
      "SewerSkulk", // Movement identity: better movement and hiding in urban ruins/sewers.
      "BloodFrenzy", // Start-of-turn: at or below half HP, gains +1 attack for that turn.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 30,
    behavior: "melee",
    token: "G",
    tokenArt: "assets/tokens/gutter-maw-swarm-queen.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("highTierGutterMawSwarmQueen");


  // Category 8 — Party Level 15/16

  window.DungeonContent.register("monsters", "highTierStoneMastiffRavager", {
    name: "Stone-Mastiff Ravager",
    role: "Armored guard-beast gone feral",
    tags: [
      "beast",
      "urban",
      "hound"
    ],
    maxHp: 248,
    category: 8,
    multiattack: { attacks: 3 },
    xp: 9200,
    ac: 20,
    attackBonus: 12,
    damage: {
      count: 6,
      sides: 10,
      bonus: 8,
      type: "slashing",
      attackType: "weapon",
      label: "6d10 + 8 slashing",
    },
    specialAbility: [
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
      "ThickHide", // Passive/defensive: expresses physical toughness or resistance.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "S",
    tokenArt: "assets/tokens/stone-mastiff-ravager.jpg",
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("highTierStoneMastiffRavager");

  window.DungeonContent.register("monsters", "highTierAqueductSerpent", {
    name: "Aqueduct Serpent",
    role: "Waterway constrictor",
    sizeSquares: 2,
    tags: [
      "beast",
      "urban",
      "snake",
      "aquatic"
    ],
    maxHp: 288,
    category: 8,
    multiattack: { attacks: 3 },
    xp: 11800,
    ac: 19,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 8,
      bonus: 8,
      type: "piercing",
      attackType: "weapon",
      label: "7d8 + 8 piercing",
    },
    specialAbility: [
      "Aquatic", // Identity/mechanics: intended for water rooms and should not be slowed by water.
      "Constricting Coil", // On hit/status: target saves or is briefly restrained.
    ],
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "A",
    tokenArt: "assets/tokens/aqueduct-serpent.jpg",
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("highTierAqueductSerpent");

  window.DungeonContent.register("monsters", "highTierTheBellTowerRoc", {
    name: "The Bell-Tower Roc",
    role: "Category 8 urban beast boss",
    sizeSquares: 2,
    tags: [
      "beast",
      "urban",
      "bird",
      "flying",
      "boss"
    ],
    maxHp: 490,
    category: 8,
    multiattack: { attacks: 3 },
    xp: 18400,
    ac: 22,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 10,
      bonus: 9,
      type: "slashing",
      attackType: "weapon",
      label: "7d10 + 9 slashing",
    },
    specialAbility: [
      "Swooping Strike", // Flying charge hit: if moved far enough, hit adds damage and may shove/prone.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
      "BloodFrenzy", // Start-of-turn: at or below half HP, gains +1 attack for that turn.
    ],
    initiativeBonus: 4,
    speedFeet: 60,
    flying: true,
    behavior: "melee",
    token: "T",
    tokenArt: "assets/tokens/the-bell-tower-roc.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("highTierTheBellTowerRoc");


  // Category 9 — Party Level 17/18

  window.DungeonContent.register("monsters", "highTierPalaceMenagerieLion", {
    name: "Palace Menagerie Lion",
    role: "Royal predator unleashed",
    tags: [
      "beast",
      "urban",
      "lion"
    ],
    maxHp: 318,
    category: 9,
    multiattack: { attacks: 3 },
    xp: 13800,
    ac: 21,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 8,
      bonus: 9,
      type: "slashing",
      attackType: "weapon",
      label: "7d8 + 9 slashing",
    },
    specialAbility: [
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
      "BloodFrenzy", // Start-of-turn: at or below half HP, gains +1 attack for that turn.
    ],
    initiativeBonus: 2,
    speedFeet: 50,
    behavior: "melee",
    token: "P",
    tokenArt: "assets/tokens/palace-menagerie-lion.jpg",
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("highTierPalaceMenagerieLion");

  window.DungeonContent.register("monsters", "highTierOldPlagueRatTitan", {
    name: "Old Plague Rat Titan",
    role: "Huge diseased sewer beast",
    sizeSquares: 2,
    tags: [
      "beast",
      "urban",
      "rat",
      "sewer"
    ],
    maxHp: 348,
    category: 9,
    multiattack: { attacks: 3 },
    xp: 16200,
    ac: 20,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 10,
      bonus: 9,
      type: "piercing",
      attackType: "weapon",
      label: "7d10 + 9 piercing",
    },
    specialAbility: [
      "SewerSkulk", // Movement identity: better movement and hiding in urban ruins/sewers.
      "Sickening Claws", // On hit: Con save or poison damage and a small attack penalty.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "O",
    tokenArt: "assets/tokens/old-plague-rat-titan.jpg",
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("highTierOldPlagueRatTitan");

  window.DungeonContent.register("monsters", "highTierTheThingUnderTheBridge", {
    name: "The Thing Under the Bridge",
    role: "Category 9 urban beast boss",
    sizeSquares: 2,
    tags: [
      "beast",
      "urban",
      "crocodile",
      "sewer",
      "boss"
    ],
    maxHp: 575,
    category: 9,
    multiattack: { attacks: 3 },
    xp: 22400,
    ac: 23,
    attackBonus: 14,
    damage: {
      count: 8,
      sides: 10,
      bonus: 10,
      type: "piercing",
      attackType: "weapon",
      label: "8d10 + 10 piercing",
    },
    specialAbility: [
      "Pull Under", // Pull rider: target saves or is pulled/dragged and briefly slowed.
      "SewerSkulk", // Movement identity: better movement and hiding in urban ruins/sewers.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 30,
    behavior: "melee",
    token: "T",
    tokenArt: "assets/tokens/the-thing-under-the-bridge.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("highTierTheThingUnderTheBridge");


  // Category 10 — Party Level 19/20

  window.DungeonContent.register("monsters", "highTierCityEaterDireRat", {
    name: "City-Eater Dire Rat",
    role: "Colossal urban infestation beast",
    sizeSquares: 3,
    tags: [
      "beast",
      "urban",
      "rat",
      "sewer"
    ],
    maxHp: 368,
    category: 10,
    multiattack: { attacks: 3 },
    xp: 18200,
    ac: 22,
    attackBonus: 14,
    damage: {
      count: 8,
      sides: 8,
      bonus: 10,
      type: "slashing",
      attackType: "weapon",
      label: "8d8 + 10 slashing",
    },
    specialAbility: [
      "SewerSkulk", // Movement identity: better movement and hiding in urban ruins/sewers.
      "BloodFrenzy", // Start-of-turn: at or below half HP, gains +1 attack for that turn.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "C",
    tokenArt: "assets/tokens/city-eater-dire-rat.jpg",
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("highTierCityEaterDireRat");

  window.DungeonContent.register("monsters", "highTierClocktowerHarrierRoc", {
    name: "Clocktower Harrier Roc",
    role: "Vast bird nesting over the city",
    sizeSquares: 2,
    tags: [
      "beast",
      "urban",
      "bird",
      "flying"
    ],
    maxHp: 398,
    category: 10,
    multiattack: { attacks: 3 },
    xp: 22200,
    ac: 23,
    attackBonus: 14,
    damage: {
      count: 8,
      sides: 10,
      bonus: 10,
      type: "slashing",
      attackType: "weapon",
      label: "8d10 + 10 slashing",
    },
    specialAbility: [
      "Swooping Strike", // Flying charge hit: if moved far enough, hit adds damage and may shove/prone.
      "Thunderclap", // Thunder burst/rider: save or thunder damage and possible reaction loss/push.
    ],
    initiativeBonus: 4,
    speedFeet: 60,
    flying: true,
    behavior: "melee",
    token: "C",
    tokenArt: "assets/tokens/clocktower-harrier-roc.jpg",
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("highTierClocktowerHarrierRoc");

  window.DungeonContent.register("monsters", "highTierTheBlackKennelBeast", {
    name: "The Black Kennel Beast",
    role: "Category 10 urban beast boss",
    tags: [
      "beast",
      "urban",
      "hound",
      "boss"
    ],
    maxHp: 680,
    category: 10,
    multiattack: { attacks: 4 },
    xp: 30500,
    ac: 24,
    attackBonus: 15,
    damage: {
      count: 9,
      sides: 10,
      bonus: 12,
      type: "slashing",
      attackType: "weapon",
      label: "9d10 + 12 slashing",
    },
    specialAbility: [
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
      "Hamstring Bite", // On hit: target saves or movement is reduced briefly.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
      "SelfHeal", // Once per fight below half HP: heals a small amount.
    ],
    initiativeBonus: 3,
    speedFeet: 30,
    behavior: "melee",
    token: "T",
    tokenArt: "assets/tokens/the-black-kennel-beast.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.urban = window.BeastBiomeMonsterIds.urban || [];
  window.BeastBiomeMonsterIds.urban.push("highTierTheBlackKennelBeast");


  /* ============================================================
   * BEAST + WATER
   * ============================================================ */


  // Category 4 — Party Level 7/8

  window.DungeonContent.register("monsters", "highTierReefclawShark", {
    name: "Reefclaw Shark",
    role: "Coral reef predator",
    sizeSquares: 2,
    tags: [
      "beast",
      "water",
      "shark",
      "aquatic"
    ],
    maxHp: 78,
    category: 4,
    multiattack: { attacks: 2 },
    xp: 850,
    ac: 16,
    attackBonus: 8,
    damage: {
      count: 3,
      sides: 6,
      bonus: 4,
      type: "piercing",
      attackType: "weapon",
      label: "3d6 + 4 piercing",
    },
    specialAbility: [
      "Aquatic", // Identity/mechanics: intended for water rooms and should not be slowed by water.
      "Blood in the Water", // Bloodied finisher: extra damage against wounded targets; strong for aquatic predators.
    ],
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "R",
    tokenArt: "assets/tokens/reefclaw-shark.jpg",
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("highTierReefclawShark");

  window.DungeonContent.register("monsters", "highTierPearlbackTurtle", {
    name: "Pearlback Turtle",
    role: "Armored sea beast",
    sizeSquares: 2,
    tags: [
      "beast",
      "water",
      "turtle",
      "aquatic"
    ],
    maxHp: 88,
    category: 4,
    multiattack: { attacks: 2 },
    xp: 1100,
    ac: 17,
    attackBonus: 8,
    damage: {
      count: 3,
      sides: 8,
      bonus: 4,
      type: "piercing",
      attackType: "weapon",
      label: "3d8 + 4 piercing",
    },
    damageResistances: [
      "bludgeoning"
    ],
    specialAbility: [
      "Aquatic", // Identity/mechanics: intended for water rooms and should not be slowed by water.
      "ShellGuard", // Once per fight: gains a short defensive stance or damage reduction.
    ],
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "P",
    tokenArt: "assets/tokens/pearlback-turtle.jpg",
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("highTierPearlbackTurtle");

  window.DungeonContent.register("monsters", "highTierOldReefShark", {
    name: "Old Reef Shark",
    role: "Category 4 water beast boss",
    sizeSquares: 2,
    tags: [
      "beast",
      "water",
      "shark",
      "aquatic",
      "boss"
    ],
    maxHp: 152,
    category: 4,
    multiattack: { attacks: 2 },
    xp: 2400,
    ac: 18,
    attackBonus: 9,
    damage: {
      count: 3,
      sides: 10,
      bonus: 5,
      type: "piercing",
      attackType: "weapon",
      label: "3d10 + 5 piercing",
    },
    specialAbility: [
      "Aquatic", // Identity/mechanics: intended for water rooms and should not be slowed by water.
      "Blood in the Water", // Bloodied finisher: extra damage against wounded targets; strong for aquatic predators.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "O",
    tokenArt: "assets/tokens/old-reef-shark.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("highTierOldReefShark");


  // Category 5 — Party Level 9/10

  window.DungeonContent.register("monsters", "highTierTidefangCrocodile", {
    name: "Tidefang Crocodile",
    role: "Brackish ambusher",
    sizeSquares: 2,
    tags: [
      "beast",
      "water",
      "crocodile",
      "aquatic"
    ],
    maxHp: 108,
    category: 5,
    multiattack: { attacks: 2 },
    xp: 1900,
    ac: 17,
    attackBonus: 9,
    damage: {
      count: 4,
      sides: 6,
      bonus: 5,
      type: "piercing",
      attackType: "weapon",
      label: "4d6 + 5 piercing",
    },
    specialAbility: [
      "Aquatic", // Identity/mechanics: intended for water rooms and should not be slowed by water.
      "Pull Under", // Pull rider: target saves or is pulled/dragged and briefly slowed.
    ],
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "T",
    tokenArt: "assets/tokens/tidefang-crocodile.jpg",
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("highTierTidefangCrocodile");

  window.DungeonContent.register("monsters", "highTierStingrayMatriarch", {
    name: "Stingray Matriarch",
    role: "Venomous gliding hunter",
    tags: [
      "beast",
      "water",
      "ray",
      "aquatic",
      "poison"
    ],
    maxHp: 126,
    category: 5,
    multiattack: { attacks: 2 },
    xp: 2300,
    ac: 16,
    attackBonus: 9,
    damage: {
      count: 4,
      sides: 8,
      bonus: 5,
      type: "piercing",
      attackType: "weapon",
      label: "4d8 + 5 piercing",
    },
    damageResistances: [
      "poison"
    ],
    specialAbility: [
      "Aquatic", // Identity/mechanics: intended for water rooms and should not be slowed by water.
      "VenomBite", // On hit: Con save or extra poison damage.
    ],
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "S",
    tokenArt: "assets/tokens/stingray-matriarch.jpg",
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("highTierStingrayMatriarch");

  window.DungeonContent.register("monsters", "highTierBlackfinSawshark", {
    name: "Blackfin Sawshark",
    role: "Category 5 water beast boss",
    sizeSquares: 2,
    tags: [
      "beast",
      "water",
      "shark",
      "aquatic",
      "boss"
    ],
    maxHp: 220,
    category: 5,
    multiattack: { attacks: 2 },
    xp: 5200,
    ac: 19,
    attackBonus: 10,
    damage: {
      count: 4,
      sides: 10,
      bonus: 6,
      type: "piercing",
      attackType: "weapon",
      label: "4d10 + 6 piercing",
    },
    specialAbility: [
      "Blood in the Water", // Bloodied finisher: extra damage against wounded targets; strong for aquatic predators.
      "Bite and Tear", // Bloodied finisher: extra damage if target is at or below half HP.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "B",
    tokenArt: "assets/tokens/blackfin-sawshark.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("highTierBlackfinSawshark");


  // Category 6 — Party Level 11/12

  window.DungeonContent.register("monsters", "highTierKelpStranglerSerpent", {
    name: "Kelp-Strangler Serpent",
    role: "Water constrictor",
    sizeSquares: 2,
    tags: [
      "beast",
      "water",
      "serpent",
      "aquatic"
    ],
    maxHp: 148,
    category: 6,
    multiattack: { attacks: 2 },
    xp: 3400,
    ac: 18,
    attackBonus: 10,
    damage: {
      count: 5,
      sides: 6,
      bonus: 6,
      type: "piercing",
      attackType: "weapon",
      label: "5d6 + 6 piercing",
    },
    specialAbility: [
      "Aquatic", // Identity/mechanics: intended for water rooms and should not be slowed by water.
      "Constricting Coil", // On hit/status: target saves or is briefly restrained.
    ],
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "K",
    tokenArt: "assets/tokens/kelp-strangler-serpent.jpg",
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("highTierKelpStranglerSerpent");

  window.DungeonContent.register("monsters", "highTierWhitewaterBullHippo", {
    name: "Whitewater Bull Hippo",
    role: "Violent river beast",
    sizeSquares: 2,
    tags: [
      "beast",
      "water",
      "hippo",
      "aquatic"
    ],
    maxHp: 172,
    category: 6,
    multiattack: { attacks: 2 },
    xp: 4700,
    ac: 17,
    attackBonus: 11,
    damage: {
      count: 5,
      sides: 8,
      bonus: 6,
      type: "piercing",
      attackType: "weapon",
      label: "5d8 + 6 piercing",
    },
    specialAbility: [
      "Aquatic", // Identity/mechanics: intended for water rooms and should not be slowed by water.
      "Whitewater Rush", // Charge/water hit: save or bludgeoning damage and push.
    ],
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "W",
    tokenArt: "assets/tokens/whitewater-bull-hippo.jpg",
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("highTierWhitewaterBullHippo");

  window.DungeonContent.register("monsters", "highTierTheRiverMaw", {
    name: "The River Maw",
    role: "Category 6 water beast boss",
    sizeSquares: 2,
    tags: [
      "beast",
      "water",
      "crocodile",
      "aquatic",
      "boss"
    ],
    maxHp: 310,
    category: 6,
    multiattack: { attacks: 2 },
    xp: 8600,
    ac: 20,
    attackBonus: 11,
    damage: {
      count: 5,
      sides: 10,
      bonus: 7,
      type: "piercing",
      attackType: "weapon",
      label: "5d10 + 7 piercing",
    },
    specialAbility: [
      "Pull Under", // Pull rider: target saves or is pulled/dragged and briefly slowed.
      "Blood in the Water", // Bloodied finisher: extra damage against wounded targets; strong for aquatic predators.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "T",
    tokenArt: "assets/tokens/the-river-maw.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("highTierTheRiverMaw");


  // Category 7 — Party Level 13/14

  window.DungeonContent.register("monsters", "highTierAbyssLanternEel", {
    name: "Abyss Lantern Eel",
    role: "Deep electric hunter",
    tags: [
      "beast",
      "water",
      "eel",
      "aquatic"
    ],
    maxHp: 196,
    category: 7,
    multiattack: { attacks: 3 },
    xp: 6400,
    ac: 19,
    attackBonus: 11,
    damage: {
      count: 6,
      sides: 6,
      bonus: 7,
      type: "piercing",
      attackType: "weapon",
      label: "6d6 + 7 piercing",
    },
    specialAbility: [
      "Aquatic", // Identity/mechanics: intended for water rooms and should not be slowed by water.
      "Lightning Lash", // On hit: save or lightning damage and possible pull/lost reaction.
    ],
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "A",
    tokenArt: "assets/tokens/abyss-lantern-eel.jpg",
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("highTierAbyssLanternEel");

  window.DungeonContent.register("monsters", "highTierRiptideOrca", {
    name: "Riptide Orca",
    role: "Fast pack whale predator",
    sizeSquares: 2,
    tags: [
      "beast",
      "water",
      "orca",
      "aquatic"
    ],
    maxHp: 224,
    category: 7,
    multiattack: { attacks: 3 },
    xp: 8200,
    ac: 18,
    attackBonus: 12,
    damage: {
      count: 6,
      sides: 8,
      bonus: 7,
      type: "piercing",
      attackType: "weapon",
      label: "6d8 + 7 piercing",
    },
    specialAbility: [
      "Aquatic", // Identity/mechanics: intended for water rooms and should not be slowed by water.
      "Blood in the Water", // Bloodied finisher: extra damage against wounded targets; strong for aquatic predators.
    ],
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "R",
    tokenArt: "assets/tokens/riptide-orca.jpg",
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("highTierRiptideOrca");

  window.DungeonContent.register("monsters", "highTierCoralShellDragonTurtle", {
    name: "Coral-Shell Dragon Turtle",
    role: "Category 7 water beast boss",
    sizeSquares: 2,
    tags: [
      "beast",
      "water",
      "turtle",
      "aquatic",
      "boss"
    ],
    maxHp: 390,
    category: 7,
    multiattack: { attacks: 3 },
    xp: 13200,
    ac: 21,
    attackBonus: 12,
    damage: {
      count: 6,
      sides: 10,
      bonus: 8,
      type: "piercing",
      attackType: "weapon",
      label: "6d10 + 8 piercing",
    },
    damageResistances: [
      "bludgeoning"
    ],
    specialAbility: [
      "ShellGuard", // Once per fight: gains a short defensive stance or damage reduction.
      "Crushing Wave", // Area water burst: save or take bludgeoning damage and be pushed/slowed.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "C",
    tokenArt: "assets/tokens/coral-shell-dragon-turtle.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("highTierCoralShellDragonTurtle");


  // Category 8 — Party Level 15/16

  window.DungeonContent.register("monsters", "highTierLeviathanCalf", {
    name: "Leviathan Calf",
    role: "Young sea titan",
    sizeSquares: 2,
    tags: [
      "beast",
      "water",
      "leviathan",
      "aquatic"
    ],
    maxHp: 248,
    category: 8,
    multiattack: { attacks: 3 },
    xp: 9200,
    ac: 20,
    attackBonus: 12,
    damage: {
      count: 6,
      sides: 10,
      bonus: 8,
      type: "piercing",
      attackType: "weapon",
      label: "6d10 + 8 piercing",
    },
    specialAbility: [
      "Aquatic", // Identity/mechanics: intended for water rooms and should not be slowed by water.
      "Leviathan Drag", // New/unsupported: implement as a short thematic monster special.
    ],
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "L",
    tokenArt: "assets/tokens/leviathan-calf.jpg",
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("highTierLeviathanCalf");

  window.DungeonContent.register("monsters", "highTierStormfinManta", {
    name: "Stormfin Manta",
    role: "Huge thunderstorm ray",
    sizeSquares: 2,
    tags: [
      "beast",
      "water",
      "ray",
      "aquatic"
    ],
    maxHp: 288,
    category: 8,
    multiattack: { attacks: 3 },
    xp: 11800,
    ac: 19,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 8,
      bonus: 8,
      type: "piercing",
      attackType: "weapon",
      label: "7d8 + 8 piercing",
    },
    specialAbility: [
      "Aquatic", // Identity/mechanics: intended for water rooms and should not be slowed by water.
      "Thunderclap", // Thunder burst/rider: save or thunder damage and possible reaction loss/push.
    ],
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "S",
    tokenArt: "assets/tokens/stormfin-manta.jpg",
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("highTierStormfinManta");

  window.DungeonContent.register("monsters", "highTierOldWhitewaterHippo", {
    name: "Old Whitewater Hippo",
    role: "Category 8 water beast boss",
    sizeSquares: 2,
    tags: [
      "beast",
      "water",
      "hippo",
      "aquatic",
      "boss"
    ],
    maxHp: 490,
    category: 8,
    multiattack: { attacks: 3 },
    xp: 18400,
    ac: 22,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 10,
      bonus: 9,
      type: "piercing",
      attackType: "weapon",
      label: "7d10 + 9 piercing",
    },
    specialAbility: [
      "Whitewater Rush", // Charge/water hit: save or bludgeoning damage and push.
      "Stampede", // Line/charge effect: save or take bludgeoning damage and be pushed.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "O",
    tokenArt: "assets/tokens/old-whitewater-hippo.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("highTierOldWhitewaterHippo");


  // Category 9 — Party Level 17/18

  window.DungeonContent.register("monsters", "highTierAbyssalSawtoothShark", {
    name: "Abyssal Sawtooth Shark",
    role: "Deep black apex shark",
    sizeSquares: 2,
    tags: [
      "beast",
      "water",
      "shark",
      "aquatic"
    ],
    maxHp: 318,
    category: 9,
    multiattack: { attacks: 3 },
    xp: 13800,
    ac: 21,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 8,
      bonus: 9,
      type: "piercing",
      attackType: "weapon",
      label: "7d8 + 9 piercing",
    },
    specialAbility: [
      "Aquatic", // Identity/mechanics: intended for water rooms and should not be slowed by water.
      "Blood in the Water", // Bloodied finisher: extra damage against wounded targets; strong for aquatic predators.
    ],
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "A",
    tokenArt: "assets/tokens/abyssal-sawtooth-shark.jpg",
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("highTierAbyssalSawtoothShark");

  window.DungeonContent.register("monsters", "highTierCrownEelOfTheDeep", {
    name: "Crown-Eel of the Deep",
    role: "Huge lightning eel",
    sizeSquares: 2,
    tags: [
      "beast",
      "water",
      "eel",
      "aquatic"
    ],
    maxHp: 348,
    category: 9,
    multiattack: { attacks: 3 },
    xp: 16200,
    ac: 20,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 10,
      bonus: 9,
      type: "piercing",
      attackType: "weapon",
      label: "7d10 + 9 piercing",
    },
    specialAbility: [
      "Aquatic", // Identity/mechanics: intended for water rooms and should not be slowed by water.
      "Queenly Thunderbolt", // Lightning burst/rider: save or lightning damage and possible lost reaction.
    ],
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "C",
    tokenArt: "assets/tokens/crown-eel-of-the-deep.jpg",
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("highTierCrownEelOfTheDeep");

  window.DungeonContent.register("monsters", "highTierTheTideLeviathan", {
    name: "The Tide Leviathan",
    role: "Category 9 water beast boss",
    sizeSquares: 3,
    tags: [
      "beast",
      "water",
      "leviathan",
      "aquatic",
      "boss"
    ],
    maxHp: 575,
    category: 9,
    multiattack: { attacks: 3 },
    xp: 22400,
    ac: 23,
    attackBonus: 14,
    damage: {
      count: 8,
      sides: 10,
      bonus: 10,
      type: "piercing",
      attackType: "weapon",
      label: "8d10 + 10 piercing",
    },
    specialAbility: [
      "Leviathan Drag", // New/unsupported: implement as a short thematic monster special.
      "Crushing Deep", // New/unsupported: implement as a short thematic monster special.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "T",
    tokenArt: "assets/tokens/the-tide-leviathan.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("highTierTheTideLeviathan");


  // Category 10 — Party Level 19/20

  window.DungeonContent.register("monsters", "highTierWorldSeaSerpent", {
    name: "World-Sea Serpent",
    role: "Colossal ocean constrictor",
    sizeSquares: 3,
    tags: [
      "beast",
      "water",
      "serpent",
      "aquatic"
    ],
    maxHp: 368,
    category: 10,
    multiattack: { attacks: 3 },
    xp: 18200,
    ac: 22,
    attackBonus: 14,
    damage: {
      count: 8,
      sides: 8,
      bonus: 10,
      type: "piercing",
      attackType: "weapon",
      label: "8d8 + 10 piercing",
    },
    specialAbility: [
      "Aquatic", // Identity/mechanics: intended for water rooms and should not be slowed by water.
      "Constricting Coil", // On hit/status: target saves or is briefly restrained.
    ],
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "W",
    tokenArt: "assets/tokens/world-sea-serpent.jpg",
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("highTierWorldSeaSerpent");

  window.DungeonContent.register("monsters", "highTierAbyssCrownWhale", {
    name: "Abyss Crown Whale",
    role: "Ancient deep whale beast",
    sizeSquares: 3,
    tags: [
      "beast",
      "water",
      "whale",
      "aquatic"
    ],
    maxHp: 398,
    category: 10,
    multiattack: { attacks: 4 },
    xp: 22200,
    ac: 23,
    attackBonus: 14,
    damage: {
      count: 8,
      sides: 10,
      bonus: 10,
      type: "piercing",
      attackType: "weapon",
      label: "8d10 + 10 piercing",
    },
    specialAbility: [
      "Aquatic", // Identity/mechanics: intended for water rooms and should not be slowed by water.
      "Crush of Oceans", // Major water burst: save or take heavy bludgeoning/cold damage and be moved.
    ],
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "A",
    tokenArt: "assets/tokens/abyss-crown-whale.jpg",
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("highTierAbyssCrownWhale");

  window.DungeonContent.register("monsters", "highTierTheFirstShark", {
    name: "The First Shark",
    role: "Category 10 water beast boss",
    sizeSquares: 3,
    tags: [
      "beast",
      "water",
      "shark",
      "aquatic",
      "boss"
    ],
    maxHp: 680,
    category: 10,
    multiattack: { attacks: 4 },
    xp: 30500,
    ac: 24,
    attackBonus: 15,
    damage: {
      count: 9,
      sides: 10,
      bonus: 12,
      type: "piercing",
      attackType: "weapon",
      label: "9d10 + 12 piercing",
    },
    specialAbility: [
      "Blood in the Water", // Bloodied finisher: extra damage against wounded targets; strong for aquatic predators.
      "Bite and Tear", // Bloodied finisher: extra damage if target is at or below half HP.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
      "SelfHeal", // Once per fight below half HP: heals a small amount.
    ],
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "T",
    tokenArt: "assets/tokens/the-first-shark.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.water = window.BeastBiomeMonsterIds.water || [];
  window.BeastBiomeMonsterIds.water.push("highTierTheFirstShark");


  /* ============================================================
   * BEAST + MOUNTAIN
   * ============================================================ */


  // Category 4 — Party Level 7/8

  window.DungeonContent.register("monsters", "highTierCragclawLion", {
    name: "Cragclaw Lion",
    role: "Mountain ledge stalker",
    tags: [
      "beast",
      "mountain",
      "lion"
    ],
    maxHp: 78,
    category: 4,
    multiattack: { attacks: 2 },
    xp: 850,
    ac: 16,
    attackBonus: 8,
    damage: {
      count: 3,
      sides: 6,
      bonus: 4,
      type: "slashing",
      attackType: "weapon",
      label: "3d6 + 4 slashing",
    },
    specialAbility: [
      "RockClimber", // Movement identity: intended for cliffs, ledges, and rocky rooms.
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
    ],
    initiativeBonus: 2,
    speedFeet: 50,
    behavior: "melee",
    token: "C",
    tokenArt: "assets/tokens/cragclaw-lion.jpg",
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("highTierCragclawLion");

  window.DungeonContent.register("monsters", "highTierIronhornRam", {
    name: "Ironhorn Ram",
    role: "Cliffside charger",
    tags: [
      "beast",
      "mountain",
      "ram"
    ],
    maxHp: 88,
    category: 4,
    multiattack: { attacks: 2 },
    xp: 1100,
    ac: 17,
    attackBonus: 8,
    damage: {
      count: 3,
      sides: 8,
      bonus: 4,
      type: "bludgeoning",
      attackType: "weapon",
      label: "3d8 + 4 bludgeoning",
    },
    specialAbility: [
      "Charge", // If the monster moved at least 20 ft before attacking, hit adds bonus damage and may shove.
      "RockClimber", // Movement identity: intended for cliffs, ledges, and rocky rooms.
    ],
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "I",
    tokenArt: "assets/tokens/ironhorn-ram.jpg",
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("highTierIronhornRam");

  window.DungeonContent.register("monsters", "highTierOldCragRam", {
    name: "Old Crag Ram",
    role: "Category 4 mountain beast boss",
    sizeSquares: 2,
    tags: [
      "beast",
      "mountain",
      "ram",
      "boss"
    ],
    maxHp: 152,
    category: 4,
    multiattack: { attacks: 2 },
    xp: 2400,
    ac: 18,
    attackBonus: 9,
    damage: {
      count: 3,
      sides: 10,
      bonus: 5,
      type: "bludgeoning",
      attackType: "weapon",
      label: "3d10 + 5 bludgeoning",
    },
    specialAbility: [
      "Charge", // If the monster moved at least 20 ft before attacking, hit adds bonus damage and may shove.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
      "RockClimber", // Movement identity: intended for cliffs, ledges, and rocky rooms.
    ],
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "O",
    tokenArt: "assets/tokens/old-crag-ram.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("highTierOldCragRam");


  // Category 5 — Party Level 9/10

  window.DungeonContent.register("monsters", "highTierRazorwingEagle", {
    name: "Razorwing Eagle",
    role: "High-cliff hunter",
    tags: [
      "beast",
      "mountain",
      "bird",
      "flying"
    ],
    maxHp: 108,
    category: 5,
    multiattack: { attacks: 2 },
    xp: 1900,
    ac: 17,
    attackBonus: 9,
    damage: {
      count: 4,
      sides: 6,
      bonus: 5,
      type: "slashing",
      attackType: "weapon",
      label: "4d6 + 5 slashing",
    },
    specialAbility: [
      "Swooping Strike", // Flying charge hit: if moved far enough, hit adds damage and may shove/prone.
      "RockClimber", // Movement identity: intended for cliffs, ledges, and rocky rooms.
    ],
    initiativeBonus: 4,
    speedFeet: 60,
    flying: true,
    behavior: "melee",
    token: "R",
    tokenArt: "assets/tokens/razorwing-eagle.jpg",
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("highTierRazorwingEagle");

  window.DungeonContent.register("monsters", "highTierStonebackGoatbeast", {
    name: "Stoneback Goatbeast",
    role: "Hardy ledge bruiser",
    tags: [
      "beast",
      "mountain",
      "goat"
    ],
    maxHp: 126,
    category: 5,
    multiattack: { attacks: 2 },
    xp: 2300,
    ac: 16,
    attackBonus: 9,
    damage: {
      count: 4,
      sides: 8,
      bonus: 5,
      type: "slashing",
      attackType: "weapon",
      label: "4d8 + 5 slashing",
    },
    specialAbility: [
      "RockClimber", // Movement identity: intended for cliffs, ledges, and rocky rooms.
      "ThickHide", // Passive/defensive: expresses physical toughness or resistance.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "S",
    tokenArt: "assets/tokens/stoneback-goatbeast.jpg",
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("highTierStonebackGoatbeast");

  window.DungeonContent.register("monsters", "highTierCliffManeSabertooth", {
    name: "Cliff-Mane Sabertooth",
    role: "Category 5 mountain beast boss",
    tags: [
      "beast",
      "mountain",
      "cat",
      "boss"
    ],
    maxHp: 220,
    category: 5,
    multiattack: { attacks: 2 },
    xp: 5200,
    ac: 19,
    attackBonus: 10,
    damage: {
      count: 4,
      sides: 10,
      bonus: 6,
      type: "slashing",
      attackType: "weapon",
      label: "4d10 + 6 slashing",
    },
    specialAbility: [
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
      "RockClimber", // Movement identity: intended for cliffs, ledges, and rocky rooms.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 4,
    speedFeet: 50,
    behavior: "melee",
    token: "C",
    tokenArt: "assets/tokens/cliff-mane-sabertooth.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("highTierCliffManeSabertooth");


  // Category 6 — Party Level 11/12

  window.DungeonContent.register("monsters", "highTierThunderhornYak", {
    name: "Thunderhorn Yak",
    role: "Storm-mountain charger",
    sizeSquares: 2,
    tags: [
      "beast",
      "mountain",
      "yak"
    ],
    maxHp: 148,
    category: 6,
    multiattack: { attacks: 2 },
    xp: 3400,
    ac: 18,
    attackBonus: 10,
    damage: {
      count: 5,
      sides: 6,
      bonus: 6,
      type: "bludgeoning",
      attackType: "weapon",
      label: "5d6 + 6 bludgeoning",
    },
    specialAbility: [
      "Thunder Charge", // Charge hit: save or thunder damage and shove/prone.
      "ThickHide", // Passive/defensive: expresses physical toughness or resistance.
    ],
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "T",
    tokenArt: "assets/tokens/thunderhorn-yak.jpg",
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("highTierThunderhornYak");

  window.DungeonContent.register("monsters", "highTierGranitebackBear", {
    name: "Graniteback Bear",
    role: "Stone-furred mountain bear",
    sizeSquares: 2,
    tags: [
      "beast",
      "mountain",
      "bear"
    ],
    maxHp: 172,
    category: 6,
    multiattack: { attacks: 2 },
    xp: 4700,
    ac: 17,
    attackBonus: 11,
    damage: {
      count: 5,
      sides: 8,
      bonus: 6,
      type: "bludgeoning",
      attackType: "weapon",
      label: "5d8 + 6 bludgeoning",
    },
    specialAbility: [
      "Mauling Rush", // Charge/pounce hit: if moved far enough, adds damage and may shove/prone.
      "RockClimber", // Movement identity: intended for cliffs, ledges, and rocky rooms.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "G",
    tokenArt: "assets/tokens/graniteback-bear.jpg",
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("highTierGranitebackBear");

  window.DungeonContent.register("monsters", "highTierIronbeakRoc", {
    name: "Ironbeak Roc",
    role: "Category 6 mountain beast boss",
    sizeSquares: 2,
    tags: [
      "beast",
      "mountain",
      "bird",
      "flying",
      "boss"
    ],
    maxHp: 310,
    category: 6,
    multiattack: { attacks: 2 },
    xp: 8600,
    ac: 20,
    attackBonus: 11,
    damage: {
      count: 5,
      sides: 10,
      bonus: 7,
      type: "slashing",
      attackType: "weapon",
      label: "5d10 + 7 slashing",
    },
    specialAbility: [
      "Swooping Strike", // Flying charge hit: if moved far enough, hit adds damage and may shove/prone.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
      "RockClimber", // Movement identity: intended for cliffs, ledges, and rocky rooms.
    ],
    initiativeBonus: 4,
    speedFeet: 60,
    flying: true,
    behavior: "melee",
    token: "I",
    tokenArt: "assets/tokens/ironbeak-roc.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("highTierIronbeakRoc");


  // Category 7 — Party Level 13/14

  window.DungeonContent.register("monsters", "highTierAvalancheMammoth", {
    name: "Avalanche Mammoth",
    role: "Snow-mountain trampler",
    sizeSquares: 2,
    tags: [
      "beast",
      "mountain",
      "mammoth",
      "cold"
    ],
    maxHp: 196,
    category: 7,
    multiattack: { attacks: 3 },
    xp: 6400,
    ac: 19,
    attackBonus: 11,
    damage: {
      count: 6,
      sides: 6,
      bonus: 7,
      type: "piercing",
      attackType: "weapon",
      label: "6d6 + 7 piercing",
    },
    damageResistances: [
      "cold"
    ],
    damageVulnerabilities: [
      "fire"
    ],
    specialAbility: [
      "Stampede", // Line/charge effect: save or take bludgeoning damage and be pushed.
      "Avalanche Hammer", // Charge/quaking hit: if moved far enough, hit adds damage and may knock prone.
    ],
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "A",
    tokenArt: "assets/tokens/avalanche-mammoth.jpg",
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("highTierAvalancheMammoth");

  window.DungeonContent.register("monsters", "highTierSkycragWyvern", {
    name: "Skycrag Wyvern",
    role: "Cliff-nesting stinger",
    sizeSquares: 2,
    tags: [
      "beast",
      "mountain",
      "wyvern",
      "flying",
      "poison"
    ],
    maxHp: 224,
    category: 7,
    multiattack: { attacks: 3 },
    xp: 8200,
    ac: 18,
    attackBonus: 12,
    damage: {
      count: 6,
      sides: 8,
      bonus: 7,
      type: "piercing",
      attackType: "weapon",
      label: "6d8 + 7 piercing",
    },
    damageResistances: [
      "poison"
    ],
    specialAbility: [
      "Swooping Strike", // Flying charge hit: if moved far enough, hit adds damage and may shove/prone.
      "VenomBite", // On hit: Con save or extra poison damage.
    ],
    initiativeBonus: 4,
    speedFeet: 60,
    flying: true,
    behavior: "melee",
    token: "S",
    tokenArt: "assets/tokens/skycrag-wyvern.jpg",
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("highTierSkycragWyvern");

  window.DungeonContent.register("monsters", "highTierTheStonehornBull", {
    name: "The Stonehorn Bull",
    role: "Category 7 mountain beast boss",
    sizeSquares: 2,
    tags: [
      "beast",
      "mountain",
      "bull",
      "boss"
    ],
    maxHp: 390,
    category: 7,
    multiattack: { attacks: 3 },
    xp: 13200,
    ac: 21,
    attackBonus: 12,
    damage: {
      count: 6,
      sides: 10,
      bonus: 8,
      type: "bludgeoning",
      attackType: "weapon",
      label: "6d10 + 8 bludgeoning",
    },
    specialAbility: [
      "Thunder Charge", // Charge hit: save or thunder damage and shove/prone.
      "Stampede", // Line/charge effect: save or take bludgeoning damage and be pushed.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "T",
    tokenArt: "assets/tokens/the-stonehorn-bull.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("highTierTheStonehornBull");


  // Category 8 — Party Level 15/16

  window.DungeonContent.register("monsters", "highTierPeakTyrantEagle", {
    name: "Peak-Tyrant Eagle",
    role: "Gigantic mountain bird",
    sizeSquares: 2,
    tags: [
      "beast",
      "mountain",
      "bird",
      "flying"
    ],
    maxHp: 248,
    category: 8,
    multiattack: { attacks: 3 },
    xp: 9200,
    ac: 20,
    attackBonus: 12,
    damage: {
      count: 6,
      sides: 10,
      bonus: 8,
      type: "slashing",
      attackType: "weapon",
      label: "6d10 + 8 slashing",
    },
    specialAbility: [
      "Swooping Strike", // Flying charge hit: if moved far enough, hit adds damage and may shove/prone.
      "Thunderclap", // Thunder burst/rider: save or thunder damage and possible reaction loss/push.
    ],
    initiativeBonus: 4,
    speedFeet: 60,
    flying: true,
    behavior: "melee",
    token: "P",
    tokenArt: "assets/tokens/peak-tyrant-eagle.jpg",
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("highTierPeakTyrantEagle");

  window.DungeonContent.register("monsters", "highTierShalehideDinosaur", {
    name: "Shalehide Dinosaur",
    role: "Plate-backed mountain relic",
    sizeSquares: 2,
    tags: [
      "beast",
      "mountain",
      "dinosaur"
    ],
    maxHp: 288,
    category: 8,
    multiattack: { attacks: 3 },
    xp: 11800,
    ac: 19,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 8,
      bonus: 8,
      type: "bludgeoning",
      attackType: "weapon",
      label: "7d8 + 8 bludgeoning",
    },
    damageResistances: [
      "bludgeoning"
    ],
    specialAbility: [
      "ShellGuard", // Once per fight: gains a short defensive stance or damage reduction.
      "Crushing Stomp", // Slam hit: if moved or against adjacent target, may knock prone on failed save.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "S",
    tokenArt: "assets/tokens/shalehide-dinosaur.jpg",
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("highTierShalehideDinosaur");

  window.DungeonContent.register("monsters", "highTierTheAvalancheBear", {
    name: "The Avalanche Bear",
    role: "Category 8 mountain beast boss",
    sizeSquares: 2,
    tags: [
      "beast",
      "mountain",
      "bear",
      "cold",
      "boss"
    ],
    maxHp: 490,
    category: 8,
    multiattack: { attacks: 3 },
    xp: 18400,
    ac: 22,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 10,
      bonus: 9,
      type: "piercing",
      attackType: "weapon",
      label: "7d10 + 9 piercing",
    },
    damageResistances: [
      "cold"
    ],
    damageVulnerabilities: [
      "fire"
    ],
    specialAbility: [
      "Mauling Rush", // Charge/pounce hit: if moved far enough, adds damage and may shove/prone.
      "FrostHide", // Passive/defensive: expresses cold resistance or brief defensive stance.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 30,
    behavior: "melee",
    token: "T",
    tokenArt: "assets/tokens/the-avalanche-bear.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("highTierTheAvalancheBear");


  // Category 9 — Party Level 17/18

  window.DungeonContent.register("monsters", "highTierCloudpiercerRoc", {
    name: "Cloudpiercer Roc",
    role: "Sky-shadow apex flier",
    sizeSquares: 2,
    tags: [
      "beast",
      "mountain",
      "bird",
      "flying"
    ],
    maxHp: 318,
    category: 9,
    multiattack: { attacks: 3 },
    xp: 13800,
    ac: 21,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 8,
      bonus: 9,
      type: "bludgeoning",
      attackType: "weapon",
      label: "7d8 + 9 bludgeoning",
    },
    specialAbility: [
      "Swooping Strike", // Flying charge hit: if moved far enough, hit adds damage and may shove/prone.
      "Thunder Charge", // Charge hit: save or thunder damage and shove/prone.
    ],
    initiativeBonus: 4,
    speedFeet: 60,
    flying: true,
    behavior: "melee",
    token: "C",
    tokenArt: "assets/tokens/cloudpiercer-roc.jpg",
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("highTierCloudpiercerRoc");

  window.DungeonContent.register("monsters", "highTierWorldCragMammoth", {
    name: "World-Crag Mammoth",
    role: "Colossal mountain trampler",
    sizeSquares: 3,
    tags: [
      "beast",
      "mountain",
      "mammoth"
    ],
    maxHp: 348,
    category: 9,
    multiattack: { attacks: 3 },
    xp: 16200,
    ac: 20,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 10,
      bonus: 9,
      type: "bludgeoning",
      attackType: "weapon",
      label: "7d10 + 9 bludgeoning",
    },
    specialAbility: [
      "Stampede", // Line/charge effect: save or take bludgeoning damage and be pushed.
      "RockClimber", // Movement identity: intended for cliffs, ledges, and rocky rooms.
    ],
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "W",
    tokenArt: "assets/tokens/world-crag-mammoth.jpg",
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("highTierWorldCragMammoth");

  window.DungeonContent.register("monsters", "highTierKingThunderhorn", {
    name: "King Thunderhorn",
    role: "Category 9 mountain beast boss",
    sizeSquares: 2,
    tags: [
      "beast",
      "mountain",
      "yak",
      "boss"
    ],
    maxHp: 575,
    category: 9,
    multiattack: { attacks: 3 },
    xp: 22400,
    ac: 23,
    attackBonus: 14,
    damage: {
      count: 8,
      sides: 10,
      bonus: 10,
      type: "bludgeoning",
      attackType: "weapon",
      label: "8d10 + 10 bludgeoning",
    },
    specialAbility: [
      "Thunder Charge", // Charge hit: save or thunder damage and shove/prone.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
      "ThickHide", // Passive/defensive: expresses physical toughness or resistance.
    ],
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "K",
    tokenArt: "assets/tokens/king-thunderhorn.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("highTierKingThunderhorn");


  // Category 10 — Party Level 19/20

  window.DungeonContent.register("monsters", "highTierTitanCliffLion", {
    name: "Titan Cliff Lion",
    role: "Legendary mountain stalker",
    sizeSquares: 2,
    tags: [
      "beast",
      "mountain",
      "lion"
    ],
    maxHp: 368,
    category: 10,
    multiattack: { attacks: 4 },
    xp: 18200,
    ac: 22,
    attackBonus: 14,
    damage: {
      count: 8,
      sides: 8,
      bonus: 10,
      type: "slashing",
      attackType: "weapon",
      label: "8d8 + 10 slashing",
    },
    specialAbility: [
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
      "RockClimber", // Movement identity: intended for cliffs, ledges, and rocky rooms.
    ],
    initiativeBonus: 2,
    speedFeet: 50,
    behavior: "melee",
    token: "T",
    tokenArt: "assets/tokens/titan-cliff-lion.jpg",
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("highTierTitanCliffLion");

  window.DungeonContent.register("monsters", "highTierStormcrownRoc", {
    name: "Stormcrown Roc",
    role: "Colossal bird of mountain storms",
    sizeSquares: 3,
    tags: [
      "beast",
      "mountain",
      "bird",
      "flying"
    ],
    maxHp: 398,
    category: 10,
    multiattack: { attacks: 3 },
    xp: 22200,
    ac: 23,
    attackBonus: 14,
    damage: {
      count: 8,
      sides: 10,
      bonus: 10,
      type: "slashing",
      attackType: "weapon",
      label: "8d10 + 10 slashing",
    },
    specialAbility: [
      "Swooping Strike", // Flying charge hit: if moved far enough, hit adds damage and may shove/prone.
      "Thunderclap", // Thunder burst/rider: save or thunder damage and possible reaction loss/push.
    ],
    initiativeBonus: 4,
    speedFeet: 60,
    flying: true,
    behavior: "melee",
    token: "S",
    tokenArt: "assets/tokens/stormcrown-roc.jpg",
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("highTierStormcrownRoc");

  window.DungeonContent.register("monsters", "highTierTheMountainSFirstRam", {
    name: "The Mountain's First Ram",
    role: "Category 10 mountain beast boss",
    sizeSquares: 2,
    tags: [
      "beast",
      "mountain",
      "ram",
      "boss"
    ],
    maxHp: 680,
    category: 10,
    multiattack: { attacks: 4 },
    xp: 30500,
    ac: 24,
    attackBonus: 15,
    damage: {
      count: 9,
      sides: 10,
      bonus: 12,
      type: "bludgeoning",
      attackType: "weapon",
      label: "9d10 + 12 bludgeoning",
    },
    specialAbility: [
      "Thunder Charge", // Charge hit: save or thunder damage and shove/prone.
      "Stampede", // Line/charge effect: save or take bludgeoning damage and be pushed.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
      "SelfHeal", // Once per fight below half HP: heals a small amount.
    ],
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "T",
    tokenArt: "assets/tokens/the-mountain-s-first-ram.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.mountain = window.BeastBiomeMonsterIds.mountain || [];
  window.BeastBiomeMonsterIds.mountain.push("highTierTheMountainSFirstRam");


  /* ============================================================
   * BEAST + GRASSLAND
   * ============================================================ */


  // Category 4 — Party Level 7/8

  window.DungeonContent.register("monsters", "highTierTallgrassSaberCat", {
    name: "Tallgrass Saber Cat",
    role: "Ambush predator in high grass",
    tags: [
      "beast",
      "grassland",
      "cat"
    ],
    maxHp: 78,
    category: 4,
    multiattack: { attacks: 2 },
    xp: 850,
    ac: 16,
    attackBonus: 8,
    damage: {
      count: 3,
      sides: 6,
      bonus: 4,
      type: "slashing",
      attackType: "weapon",
      label: "3d6 + 4 slashing",
    },
    specialAbility: [
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
      "BloodFrenzy", // Start-of-turn: at or below half HP, gains +1 attack for that turn.
    ],
    initiativeBonus: 4,
    speedFeet: 50,
    behavior: "melee",
    token: "T",
    tokenArt: "assets/tokens/tallgrass-saber-cat.jpg",
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("highTierTallgrassSaberCat");

  window.DungeonContent.register("monsters", "highTierRedhornAurochs", {
    name: "Redhorn Aurochs",
    role: "Heavy plains charger",
    sizeSquares: 2,
    tags: [
      "beast",
      "grassland",
      "aurochs"
    ],
    maxHp: 88,
    category: 4,
    multiattack: { attacks: 2 },
    xp: 1100,
    ac: 17,
    attackBonus: 8,
    damage: {
      count: 3,
      sides: 8,
      bonus: 4,
      type: "bludgeoning",
      attackType: "weapon",
      label: "3d8 + 4 bludgeoning",
    },
    specialAbility: [
      "Charge", // If the monster moved at least 20 ft before attacking, hit adds bonus damage and may shove.
      "Stampede", // Line/charge effect: save or take bludgeoning damage and be pushed.
    ],
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "R",
    tokenArt: "assets/tokens/redhorn-aurochs.jpg",
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("highTierRedhornAurochs");

  window.DungeonContent.register("monsters", "highTierOldRedhornBull", {
    name: "Old Redhorn Bull",
    role: "Category 4 grassland beast boss",
    sizeSquares: 2,
    tags: [
      "beast",
      "grassland",
      "aurochs",
      "boss"
    ],
    maxHp: 152,
    category: 4,
    multiattack: { attacks: 2 },
    xp: 2400,
    ac: 18,
    attackBonus: 9,
    damage: {
      count: 3,
      sides: 10,
      bonus: 5,
      type: "bludgeoning",
      attackType: "weapon",
      label: "3d10 + 5 bludgeoning",
    },
    specialAbility: [
      "Charge", // If the monster moved at least 20 ft before attacking, hit adds bonus damage and may shove.
      "Stampede", // Line/charge effect: save or take bludgeoning damage and be pushed.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "O",
    tokenArt: "assets/tokens/old-redhorn-bull.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("highTierOldRedhornBull");


  // Category 5 — Party Level 9/10

  window.DungeonContent.register("monsters", "highTierSteppeHyenaMatron", {
    name: "Steppe Hyena Matron",
    role: "Pack scavenger leader",
    tags: [
      "beast",
      "grassland",
      "hyena"
    ],
    maxHp: 108,
    category: 5,
    multiattack: { attacks: 2 },
    xp: 1900,
    ac: 17,
    attackBonus: 9,
    damage: {
      count: 4,
      sides: 6,
      bonus: 5,
      type: "slashing",
      attackType: "weapon",
      label: "4d6 + 5 slashing",
    },
    specialAbility: [
      "BloodFrenzy", // Start-of-turn: at or below half HP, gains +1 attack for that turn.
      "Bite and Tear", // Bloodied finisher: extra damage if target is at or below half HP.
    ],
    initiativeBonus: 2,
    speedFeet: 50,
    behavior: "melee",
    token: "S",
    tokenArt: "assets/tokens/steppe-hyena-matron.jpg",
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("highTierSteppeHyenaMatron");

  window.DungeonContent.register("monsters", "highTierBladegrassRaptor", {
    name: "Bladegrass Raptor",
    role: "Fast plains runner",
    tags: [
      "beast",
      "grassland",
      "raptor"
    ],
    maxHp: 126,
    category: 5,
    multiattack: { attacks: 2 },
    xp: 2300,
    ac: 16,
    attackBonus: 9,
    damage: {
      count: 4,
      sides: 8,
      bonus: 5,
      type: "slashing",
      attackType: "weapon",
      label: "4d8 + 5 slashing",
    },
    specialAbility: [
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
      "Hamstring Bite", // On hit: target saves or movement is reduced briefly.
    ],
    initiativeBonus: 4,
    speedFeet: 50,
    behavior: "melee",
    token: "B",
    tokenArt: "assets/tokens/bladegrass-raptor.jpg",
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("highTierBladegrassRaptor");

  window.DungeonContent.register("monsters", "highTierTheGoldenMane", {
    name: "The Golden Mane",
    role: "Category 5 grassland beast boss",
    tags: [
      "beast",
      "grassland",
      "lion",
      "boss"
    ],
    maxHp: 220,
    category: 5,
    multiattack: { attacks: 2 },
    xp: 5200,
    ac: 19,
    attackBonus: 10,
    damage: {
      count: 4,
      sides: 10,
      bonus: 6,
      type: "slashing",
      attackType: "weapon",
      label: "4d10 + 6 slashing",
    },
    specialAbility: [
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
      "BloodFrenzy", // Start-of-turn: at or below half HP, gains +1 attack for that turn.
    ],
    initiativeBonus: 3,
    speedFeet: 50,
    behavior: "melee",
    token: "T",
    tokenArt: "assets/tokens/the-golden-mane.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("highTierTheGoldenMane");


  // Category 6 — Party Level 11/12

  window.DungeonContent.register("monsters", "highTierPrairieThunderbeast", {
    name: "Prairie Thunderbeast",
    role: "Rhino-like plains charger",
    sizeSquares: 2,
    tags: [
      "beast",
      "grassland",
      "rhino"
    ],
    maxHp: 148,
    category: 6,
    multiattack: { attacks: 2 },
    xp: 3400,
    ac: 18,
    attackBonus: 10,
    damage: {
      count: 5,
      sides: 6,
      bonus: 6,
      type: "bludgeoning",
      attackType: "weapon",
      label: "5d6 + 6 bludgeoning",
    },
    specialAbility: [
      "Thunder Charge", // Charge hit: save or thunder damage and shove/prone.
      "Stampede", // Line/charge effect: save or take bludgeoning damage and be pushed.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "P",
    tokenArt: "assets/tokens/prairie-thunderbeast.jpg",
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("highTierPrairieThunderbeast");

  window.DungeonContent.register("monsters", "highTierDustwingVulture", {
    name: "Dustwing Vulture",
    role: "Carrion sky predator",
    tags: [
      "beast",
      "grassland",
      "bird",
      "flying"
    ],
    maxHp: 172,
    category: 6,
    multiattack: { attacks: 2 },
    xp: 4700,
    ac: 17,
    attackBonus: 11,
    damage: {
      count: 5,
      sides: 8,
      bonus: 6,
      type: "slashing",
      attackType: "weapon",
      label: "5d8 + 6 slashing",
    },
    specialAbility: [
      "Swooping Strike", // Flying charge hit: if moved far enough, hit adds damage and may shove/prone.
      "BloodFrenzy", // Start-of-turn: at or below half HP, gains +1 attack for that turn.
    ],
    initiativeBonus: 4,
    speedFeet: 60,
    flying: true,
    behavior: "melee",
    token: "D",
    tokenArt: "assets/tokens/dustwing-vulture.jpg",
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("highTierDustwingVulture");

  window.DungeonContent.register("monsters", "highTierGreatSteppeRhino", {
    name: "Great Steppe Rhino",
    role: "Category 6 grassland beast boss",
    sizeSquares: 2,
    tags: [
      "beast",
      "grassland",
      "rhino",
      "boss"
    ],
    maxHp: 310,
    category: 6,
    multiattack: { attacks: 2 },
    xp: 8600,
    ac: 20,
    attackBonus: 11,
    damage: {
      count: 5,
      sides: 10,
      bonus: 7,
      type: "bludgeoning",
      attackType: "weapon",
      label: "5d10 + 7 bludgeoning",
    },
    specialAbility: [
      "Charge", // If the monster moved at least 20 ft before attacking, hit adds bonus damage and may shove.
      "ThickHide", // Passive/defensive: expresses physical toughness or resistance.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 30,
    behavior: "melee",
    token: "G",
    tokenArt: "assets/tokens/great-steppe-rhino.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("highTierGreatSteppeRhino");


  // Category 7 — Party Level 13/14

  window.DungeonContent.register("monsters", "highTierCrownedPlainsLion", {
    name: "Crowned Plains Lion",
    role: "Apex savanna hunter",
    tags: [
      "beast",
      "grassland",
      "lion"
    ],
    maxHp: 196,
    category: 7,
    multiattack: { attacks: 3 },
    xp: 6400,
    ac: 19,
    attackBonus: 11,
    damage: {
      count: 6,
      sides: 6,
      bonus: 7,
      type: "slashing",
      attackType: "weapon",
      label: "6d6 + 7 slashing",
    },
    specialAbility: [
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
      "Predator Lunge", // Charge/pounce hit: if moved far enough, adds damage and may shove/prone.
    ],
    initiativeBonus: 2,
    speedFeet: 50,
    behavior: "melee",
    token: "C",
    tokenArt: "assets/tokens/crowned-plains-lion.jpg",
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("highTierCrownedPlainsLion");

  window.DungeonContent.register("monsters", "highTierIronhideBuffaloHerdmaster", {
    name: "Ironhide Buffalo Herdmaster",
    role: "Armored herd brute",
    tags: [
      "beast",
      "grassland",
      "buffalo"
    ],
    maxHp: 224,
    category: 7,
    multiattack: { attacks: 3 },
    xp: 8200,
    ac: 18,
    attackBonus: 12,
    damage: {
      count: 6,
      sides: 8,
      bonus: 7,
      type: "bludgeoning",
      attackType: "weapon",
      label: "6d8 + 7 bludgeoning",
    },
    specialAbility: [
      "Stampede", // Line/charge effect: save or take bludgeoning damage and be pushed.
      "ThickHide", // Passive/defensive: expresses physical toughness or resistance.
    ],
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    token: "I",
    tokenArt: "assets/tokens/ironhide-buffalo-herdmaster.jpg",
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("highTierIronhideBuffaloHerdmaster");

  window.DungeonContent.register("monsters", "highTierHyenaQueenOfTheDryGrass", {
    name: "Hyena Queen of the Dry Grass",
    role: "Category 7 grassland beast boss",
    tags: [
      "beast",
      "grassland",
      "hyena",
      "boss"
    ],
    maxHp: 390,
    category: 7,
    multiattack: { attacks: 3 },
    xp: 13200,
    ac: 21,
    attackBonus: 12,
    damage: {
      count: 6,
      sides: 10,
      bonus: 8,
      type: "slashing",
      attackType: "weapon",
      label: "6d10 + 8 slashing",
    },
    specialAbility: [
      "BloodFrenzy", // Start-of-turn: at or below half HP, gains +1 attack for that turn.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
      "Bite and Tear", // Bloodied finisher: extra damage if target is at or below half HP.
    ],
    initiativeBonus: 3,
    speedFeet: 50,
    behavior: "melee",
    token: "H",
    tokenArt: "assets/tokens/hyena-queen-of-the-dry-grass.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("highTierHyenaQueenOfTheDryGrass");


  // Category 8 — Party Level 15/16

  window.DungeonContent.register("monsters", "highTierThunderstepElephant", {
    name: "Thunderstep Elephant",
    role: "Huge plains trampler",
    sizeSquares: 2,
    tags: [
      "beast",
      "grassland",
      "elephant"
    ],
    maxHp: 248,
    category: 8,
    multiattack: { attacks: 3 },
    xp: 9200,
    ac: 20,
    attackBonus: 12,
    damage: {
      count: 6,
      sides: 10,
      bonus: 8,
      type: "bludgeoning",
      attackType: "weapon",
      label: "6d10 + 8 bludgeoning",
    },
    specialAbility: [
      "Stampede", // Line/charge effect: save or take bludgeoning damage and be pushed.
      "Thunder Charge", // Charge hit: save or thunder damage and shove/prone.
    ],
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "T",
    tokenArt: "assets/tokens/thunderstep-elephant.jpg",
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("highTierThunderstepElephant");

  window.DungeonContent.register("monsters", "highTierGoldenRocOfTheSavanna", {
    name: "Golden Roc of the Savanna",
    role: "Huge plains sky hunter",
    sizeSquares: 2,
    tags: [
      "beast",
      "grassland",
      "bird",
      "flying"
    ],
    maxHp: 288,
    category: 8,
    multiattack: { attacks: 3 },
    xp: 11800,
    ac: 19,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 8,
      bonus: 8,
      type: "slashing",
      attackType: "weapon",
      label: "7d8 + 8 slashing",
    },
    specialAbility: [
      "Swooping Strike", // Flying charge hit: if moved far enough, hit adds damage and may shove/prone.
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
    ],
    initiativeBonus: 4,
    speedFeet: 60,
    flying: true,
    behavior: "melee",
    token: "G",
    tokenArt: "assets/tokens/golden-roc-of-the-savanna.jpg",
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("highTierGoldenRocOfTheSavanna");

  window.DungeonContent.register("monsters", "highTierTheRedGrassTyrant", {
    name: "The Red Grass Tyrant",
    role: "Category 8 grassland beast boss",
    sizeSquares: 2,
    tags: [
      "beast",
      "grassland",
      "dinosaur",
      "boss"
    ],
    maxHp: 490,
    category: 8,
    multiattack: { attacks: 3 },
    xp: 18400,
    ac: 22,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 10,
      bonus: 9,
      type: "slashing",
      attackType: "weapon",
      label: "7d10 + 9 slashing",
    },
    specialAbility: [
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
      "BloodFrenzy", // Start-of-turn: at or below half HP, gains +1 attack for that turn.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 30,
    behavior: "melee",
    token: "T",
    tokenArt: "assets/tokens/the-red-grass-tyrant.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("highTierTheRedGrassTyrant");


  // Category 9 — Party Level 17/18

  window.DungeonContent.register("monsters", "highTierWorldHerdMammoth", {
    name: "World-Herd Mammoth",
    role: "Colossal herd leader",
    sizeSquares: 3,
    tags: [
      "beast",
      "grassland",
      "mammoth"
    ],
    maxHp: 318,
    category: 9,
    multiattack: { attacks: 3 },
    xp: 13800,
    ac: 21,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 8,
      bonus: 9,
      type: "bludgeoning",
      attackType: "weapon",
      label: "7d8 + 9 bludgeoning",
    },
    specialAbility: [
      "Stampede", // Line/charge effect: save or take bludgeoning damage and be pushed.
      "ThickHide", // Passive/defensive: expresses physical toughness or resistance.
    ],
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "W",
    tokenArt: "assets/tokens/world-herd-mammoth.jpg",
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("highTierWorldHerdMammoth");

  window.DungeonContent.register("monsters", "highTierEclipseManeLion", {
    name: "Eclipse-Mane Lion",
    role: "Mythic plains hunter",
    tags: [
      "beast",
      "grassland",
      "lion"
    ],
    maxHp: 348,
    category: 9,
    multiattack: { attacks: 3 },
    xp: 16200,
    ac: 20,
    attackBonus: 13,
    damage: {
      count: 7,
      sides: 10,
      bonus: 9,
      type: "slashing",
      attackType: "weapon",
      label: "7d10 + 9 slashing",
    },
    specialAbility: [
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
      "BloodFrenzy", // Start-of-turn: at or below half HP, gains +1 attack for that turn.
    ],
    initiativeBonus: 2,
    speedFeet: 50,
    behavior: "melee",
    token: "E",
    tokenArt: "assets/tokens/eclipse-mane-lion.jpg",
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("highTierEclipseManeLion");

  window.DungeonContent.register("monsters", "highTierTheHerdbreakerAurochs", {
    name: "The Herdbreaker Aurochs",
    role: "Category 9 grassland beast boss",
    sizeSquares: 2,
    tags: [
      "beast",
      "grassland",
      "aurochs",
      "boss"
    ],
    maxHp: 575,
    category: 9,
    multiattack: { attacks: 3 },
    xp: 22400,
    ac: 23,
    attackBonus: 14,
    damage: {
      count: 8,
      sides: 10,
      bonus: 10,
      type: "bludgeoning",
      attackType: "weapon",
      label: "8d10 + 10 bludgeoning",
    },
    specialAbility: [
      "Stampede", // Line/charge effect: save or take bludgeoning damage and be pushed.
      "Thunder Charge", // Charge hit: save or thunder damage and shove/prone.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
    ],
    initiativeBonus: 3,
    speedFeet: 40,
    behavior: "melee",
    token: "T",
    tokenArt: "assets/tokens/the-herdbreaker-aurochs.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("highTierTheHerdbreakerAurochs");


  // Category 10 — Party Level 19/20

  window.DungeonContent.register("monsters", "highTierTitanSteppeElephant", {
    name: "Titan Steppe Elephant",
    role: "Legendary plains trampler",
    sizeSquares: 3,
    tags: [
      "beast",
      "grassland",
      "elephant"
    ],
    maxHp: 368,
    category: 10,
    multiattack: { attacks: 4 },
    xp: 18200,
    ac: 22,
    attackBonus: 14,
    damage: {
      count: 8,
      sides: 8,
      bonus: 10,
      type: "bludgeoning",
      attackType: "weapon",
      label: "8d8 + 10 bludgeoning",
    },
    specialAbility: [
      "Stampede", // Line/charge effect: save or take bludgeoning damage and be pushed.
      "Thunder Charge", // Charge hit: save or thunder damage and shove/prone.
    ],
    initiativeBonus: 2,
    speedFeet: 40,
    behavior: "melee",
    token: "T",
    tokenArt: "assets/tokens/titan-steppe-elephant.jpg",
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("highTierTitanSteppeElephant");

  window.DungeonContent.register("monsters", "highTierSunCrownedRaptor", {
    name: "Sun-Crowned Raptor",
    role: "Ancient plains pursuit predator",
    tags: [
      "beast",
      "grassland",
      "raptor"
    ],
    maxHp: 398,
    category: 10,
    multiattack: { attacks: 4 },
    xp: 22200,
    ac: 23,
    attackBonus: 14,
    damage: {
      count: 8,
      sides: 10,
      bonus: 10,
      type: "slashing",
      attackType: "weapon",
      label: "8d10 + 10 slashing",
    },
    specialAbility: [
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
      "Hamstring Bite", // On hit: target saves or movement is reduced briefly.
    ],
    initiativeBonus: 4,
    speedFeet: 50,
    behavior: "melee",
    token: "S",
    tokenArt: "assets/tokens/sun-crowned-raptor.jpg",
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("highTierSunCrownedRaptor");

  window.DungeonContent.register("monsters", "highTierTheFirstLionOfTheOpenSky", {
    name: "The First Lion of the Open Sky",
    role: "Category 10 grassland beast boss",
    tags: [
      "beast",
      "grassland",
      "lion",
      "boss"
    ],
    maxHp: 680,
    category: 10,
    multiattack: { attacks: 4 },
    xp: 30500,
    ac: 24,
    attackBonus: 15,
    damage: {
      count: 9,
      sides: 10,
      bonus: 12,
      type: "slashing",
      attackType: "weapon",
      label: "9d10 + 12 slashing",
    },
    specialAbility: [
      "Pounce", // If moved at least 20 ft before attacking, target saves or is pushed/knocked prone.
      "BloodFrenzy", // Start-of-turn: at or below half HP, gains +1 attack for that turn.
      "BossRoar", // Boss action: nearby heroes save or suffer a short attack penalty.
      "SelfHeal", // Once per fight below half HP: heals a small amount.
    ],
    initiativeBonus: 3,
    speedFeet: 50,
    behavior: "melee",
    token: "T",
    tokenArt: "assets/tokens/the-first-lion-of-the-open-sky.jpg",
    extraLoot: [
      {
        kind: "randomEquipment",
      },
    ],
  });
  window.BeastBiomeMonsterIds.grassland = window.BeastBiomeMonsterIds.grassland || [];
  window.BeastBiomeMonsterIds.grassland.push("highTierTheFirstLionOfTheOpenSky");

})();
