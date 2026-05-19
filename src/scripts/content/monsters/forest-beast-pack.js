(() => {

/* ============================================================
 * CATEGORY 1 — Solo Fighter Level 1/2
 * Theme: wolves, boars, spiders, small forest predators
 * ============================================================ */

window.DungeonContent.register("monsters", "forestWolf", {
  name: "Forest Wolf",
  role: "Fast forest predator",
  tags: ["beast", "forest", "wolf"],
  maxHp: 5,
  category: 1,
  xp: 45,
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
  specialAbility: [
    "Hamstring Bite", // On hit: small chance to reduce target speed by 10 ft until the end of the target's next turn.
  ],
  initiativeBonus: 3,
  speedFeet: 40,
  behavior: "swarm",
  token: "W",
  tokenArt: "assets/tokens/forest-wolf.jpg",
});

window.DungeonContent.register("monsters", "brambleBoar", {
  name: "Bramble Boar",
  role: "Aggressive forest charger",
  tags: ["beast", "forest", "boar"],
  maxHp: 14,
  category: 1,
  xp: 50,
  ac: 12,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 6,
    bonus: 2,
    type: "piercing",
    attackType: "weapon",
    label: "1d6 + 2 piercing"
  },
  specialAbility: [
    "Charge", // If the boar moved at least 20 ft before attacking: add 1d4 piercing damage on hit.
  ],
  initiativeBonus: 1,
  speedFeet: 35,
  behavior: "melee",
  token: "B",
  tokenArt: "assets/tokens/bramble-boar.jpg",
});

window.DungeonContent.register("monsters", "gloomwebSpider", {
  name: "Gloomweb Spider",
  role: "Venomous forest ambusher",
  tags: ["beast", "forest", "spider", "poison"],
  maxHp: 10,
  category: 1,
  xp: 55,
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
  damageResistances: ["poison"],
  specialAbility: [
    "Venom Bite", // On hit: Con save against 11, target takes extra 1d4 poison damage if save unsuccessful.
  ],
  initiativeBonus: 3,
  speedFeet: 30,
  behavior: "melee",
  token: "S",
  tokenArt: "assets/tokens/gloomweb-spider.jpg",
});

window.DungeonContent.register("monsters", "thornbackHare", {
  name: "Thornback Hare",
  role: "Small evasive forest beast",
  tags: ["beast", "forest"],
  maxHp: 8,
  category: 1,
  xp: 35,
  ac: 14,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 4,
    bonus: 2,
    type: "slashing",
    attackType: "weapon",
    label: "1d4 + 2 slashing"
  },
  initiativeBonus: 4,
  speedFeet: 40,
  behavior: "melee",
  token: "H",
  tokenArt: "assets/tokens/thornback-hare.jpg",
});

window.DungeonContent.register("monsters", "oldTuskBoar", {
  name: "Old Tusk Boar",
  role: "Category 1 forest beast boss",
  tags: ["beast", "forest", "boar", "boss"],
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
  specialAbility: [
    "Charge", // If the boar moved at least 20 ft before attacking: add 1d6 piercing damage on hit.
    "Stubborn Beast", // Once per fight: when reduced below half HP, gain +2 AC until the start of its next turn.
  ],
  initiativeBonus: 1,
  speedFeet: 35,
  behavior: "melee",
  token: "O",
  tokenArt: "assets/tokens/old-tusk-boar.jpg",
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});


/* ============================================================
 * CATEGORY 2 — Solo Fighter Level 3/4
 * Theme: dire beasts, large predators, dangerous forest hunters
 * ============================================================ */

window.DungeonContent.register("monsters", "direForestWolf", {
  name: "Dire Forest Wolf",
  role: "Large hunting wolf",
  tags: ["beast", "forest", "wolf"],
  maxHp: 15,
  category: 2,
  xp: 130,
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
  specialAbility: [
    "Crippling Bite", // On hit: Str save against 13, target is pushed 5 ft or slowed by 10 ft if save unsuccessful.
  ],
  initiativeBonus: 3,
  speedFeet: 40,
  behavior: "swarm",
  token: "D",
  tokenArt: "assets/tokens/dire-forest-wolf.jpg",
});

window.DungeonContent.register("monsters", "mossbackBear", {
  name: "Mossback Bear",
  role: "Heavy forest brute",
  tags: ["beast", "forest", "bear"],
  maxHp: 32,
  category: 2,
  xp: 150,
  ac: 13,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 10,
    bonus: 3,
    type: "slashing",
    attackType: "weapon",
    label: "1d10 + 3 slashing"
  },
  initiativeBonus: 1,
  speedFeet: 35,
  behavior: "melee",
  token: "M",
  tokenArt: "assets/tokens/mossback-bear.jpg",
});

window.DungeonContent.register("monsters", "razorbeakRaptor", {
  name: "Razorbeak Raptor",
  role: "Fast forest striker",
  tags: ["beast", "forest", "bird", "flying"],
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
  specialAbility: [
    "Swooping Strike", // If the raptor moved at least 15 ft before attacking: add 1d4 slashing damage on hit.
  ],
  initiativeBonus: 4,
  speedFeet: 45,
  flying: true,
  behavior: "melee",
  token: "R",
  tokenArt: "assets/tokens/razorbeak-raptor.jpg",
});

window.DungeonContent.register("monsters", "venomrootStalker", {
  name: "Venomroot Stalker",
  role: "Poisonous forest predator",
  tags: ["beast", "forest", "poison"],
  maxHp: 23,
  category: 2,
  xp: 145,
  ac: 14,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 8,
    bonus: 2,
    type: "piercing",
    attackType: "weapon",
    label: "1d8 + 2 piercing"
  },
  damageResistances: ["poison"],
  specialAbility: [
    "Venom Spit", // Ranged 30 ft, Con save against 13, 2d6 poison damage if save unsuccessful, half if successful.
  ],
  initiativeBonus: 2,
  speedFeet: 35,
  behavior: "melee",
  token: "V",
  tokenArt: "assets/tokens/venomroot-stalker.jpg",
});

window.DungeonContent.register("monsters", "thornhideBoar", {
  name: "Thornhide Boar",
  role: "Category 2 forest beast boss",
  tags: ["beast", "forest", "boar", "boss"],
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
  damageResistances: ["piercing"],
  specialAbility: [
    "Thornhide", // When hit by a melee weapon attack: attacker takes 1d4 piercing damage.
    "Mauling Rush", // 15 ft line, Str save against 14, 3d6 bludgeoning damage and pushed 5 ft if save unsuccessful, half damage and no push if successful.
  ],
  initiativeBonus: 1,
  speedFeet: 35,
  behavior: "melee",
  token: "T",
  tokenArt: "assets/tokens/thornhide-boar.jpg",
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});


/* ============================================================
 * CATEGORY 3 — Solo Fighter Level 5/6
 * Theme: ancient predators, giant beasts, powerful forest guardians
 * ============================================================ */

window.DungeonContent.register("monsters", "elderDireWolf", {
  name: "Elder Dire Wolf",
  role: "Ancient forest hunter",
  tags: ["beast", "forest", "wolf"],
  maxHp: 40,
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
  specialAbility: [
    "Predator Lunge", // If the wolf moved at least 20 ft before attacking: add 1d6 piercing damage on hit.
  ],
  initiativeBonus: 4,
  speedFeet: 45,
  behavior: "melee",
  token: "E",
  tokenArt: "assets/tokens/elder-dire-wolf.jpg",
});

window.DungeonContent.register("monsters", "giantGloomwebSpider", {
  name: "Giant Gloomweb Spider",
  role: "Huge venomous ambusher",
  tags: ["beast", "forest", "spider", "poison"],
  maxHp: 38,
  category: 3,
  xp: 260,
  ac: 15,
  attackBonus: 7,
  damage: {
    count: 1,
    sides: 8,
    bonus: 4,
    type: "piercing",
    attackType: "weapon",
    label: "1d8 + 4 piercing"
  },
  damageResistances: ["poison"],
  specialAbility: [
    "Web Snare", // Ranged 40 ft, Dex save against 14, target speed becomes 0 until the end of its next turn if save unsuccessful.
    "Deep Venom", // On hit: Con save against 14, target takes extra 2d6 poison damage if save unsuccessful, half if successful.
  ],
  initiativeBonus: 3,
  speedFeet: 35,
  behavior: "melee",
  token: "S",
  tokenArt: "assets/tokens/giant-gloomweb-spider.jpg",
});

window.DungeonContent.register("monsters", "ironbarkGorger", {
  name: "Ironbark Gorger",
  role: "Armored forest brute",
  tags: ["beast", "forest", "brute"],
  maxHp: 50,
  category: 3,
  xp: 280,
  ac: 16,
  attackBonus: 6,
  damage: {
    count: 1,
    sides: 12,
    bonus: 4,
    type: "bludgeoning",
    attackType: "weapon",
    label: "1d12 + 4 bludgeoning"
  },
  damageResistances: ["bludgeoning"],
  initiativeBonus: 0,
  speedFeet: 30,
  behavior: "melee",
  token: "I",
  tokenArt: "assets/tokens/ironbark-gorger.jpg",
});

window.DungeonContent.register("monsters", "stormhornStag", {
  name: "Stormhorn Stag",
  role: "Mystic forest charger",
  tags: ["beast", "forest", "stag"],
  maxHp: 42,
  category: 3,
  xp: 270,
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
  damageResistances: ["lightning"],
  specialAbility: [
    "Thunder Charge", // If the stag moved at least 20 ft before attacking: add 1d6 lightning damage on hit.
    "Stormhorn Burst", // 10 ft radius circle centered on self, Dex save against 14, 3d6 lightning damage if save unsuccessful, half if successful.
  ],
  initiativeBonus: 3,
  speedFeet: 50,
  behavior: "melee",
  token: "H",
  tokenArt: "assets/tokens/stormhorn-stag.jpg",
});

window.DungeonContent.register("monsters", "ancientBriarBear", {
  name: "Ancient Briar Bear",
  role: "Category 3 forest beast boss",
  tags: ["beast", "forest", "bear", "boss"],
  maxHp: 70,
  category: 3,
  xp: 430,
  ac: 16,
  attackBonus: 7,
  damage: {
    count: 1,
    sides: 12,
    bonus: 5,
    type: "slashing",
    attackType: "weapon",
    label: "1d12 + 5 slashing"
  },
  damageResistances: ["piercing", "poison"],
  specialAbility: [
    "Briarhide", // When hit by a melee weapon attack: attacker takes 1d6 piercing damage.
    "Root-Rending Roar", // 20 ft radius circle centered on self, Str save against 15, 4d6 bludgeoning damage and pushed 10 ft if save unsuccessful, half damage and no push if successful.
    "SelfHeal", // Once per fight: restore 3d8 HP if below half HP.
  ],
  initiativeBonus: 2,
  speedFeet: 35,
  behavior: "melee",
  token: "A",
  tokenArt: "assets/tokens/ancient-briar-bear.jpg",
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});

})();
