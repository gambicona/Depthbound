(() => {

/* ============================================================
 * CATEGORY 1 — Solo Fighter Level 1/2
 * Theme: fresh zombies, ghouls, weak corpse magic
 * ============================================================ */

window.DungeonContent.register("monsters", "shamblingCorpse", {
  name: "Shambling Corpse",
  role: "Slow undead brawler",
  tags: ["undead", "zombie"],
  maxHp: 12,
  category: 1,
  xp: 40,
  ac: 11,
  attackBonus: 3,
  damage: {
    count: 1,
    sides: 6,
    bonus: 1,
    type: "bludgeoning",
    attackType: "weapon",
    label: "1d6 + 1 bludgeoning"
  },
  damageResistances: [],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Undead Fortitude", // When reduced to 0 HP by non-radiant damage, small chance to remain at 1 HP instead.
  ],
  initiativeBonus: -1,
  speedFeet: 20,
  behavior: "melee",
  token: "Z",
  tokenArt: "assets/tokens/shambling-corpse.jpg",
});

window.DungeonContent.register("monsters", "bloatedRotter", {
  name: "Bloated Rotter",
  role: "Diseased exploding zombie",
  tags: ["undead", "zombie", "disease"],
  maxHp: 14,
  category: 1,
  xp: 50,
  ac: 10,
  attackBonus: 3,
  damage: {
    count: 1,
    sides: 6,
    bonus: 2,
    type: "bludgeoning",
    attackType: "weapon",
    label: "1d6 + 2 bludgeoning"
  },
  damageResistances: ["necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Rot Burst", // On death: 5 ft radius circle, Con save against 11, 1d6 poison damage if save unsuccessful, no damage if successful.
  ],
  initiativeBonus: -1,
  speedFeet: 20,
  behavior: "melee",
  token: "R",
  tokenArt: "assets/tokens/bloated-rotter.jpg",
});

window.DungeonContent.register("monsters", "graveGhoul", {
  name: "Grave Ghoul",
  role: "Hungry corpse predator",
  tags: ["undead", "zombie", "ghoul"],
  maxHp: 13,
  category: 1,
  xp: 60,
  ac: 12,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 6,
    bonus: 2,
    type: "slashing",
    attackType: "weapon",
    label: "1d6 + 2 slashing"
  },
  damageResistances: [],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Claw Fever", // On hit: small chance to reduce target speed by 10 ft until the end of the target's next turn.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "G",
  tokenArt: "assets/tokens/grave-ghoul.jpg",
});

window.DungeonContent.register("monsters", "corpseCandleAcolyte", {
  name: "Corpse-Candle Acolyte",
  role: "Weak undead spellcaster",
  tags: ["undead", "zombie", "caster"],
  maxHp: 11,
  category: 1,
  xp: 65,
  ac: 12,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 6,
    bonus: 2,
    type: "necrotic",
    attackType: "spell",
    label: "1d6 + 2 necrotic",
    range: { kind: "ranged", normal: 50, long: 150, feet: 50 }
  },
  damageResistances: ["necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Grave Spark", // 10 ft radius circle, Dex save against 12, 2d6 necrotic damage if save unsuccessful, half if successful.
  ],
  initiativeBonus: 1,
  speedFeet: 25,
  behavior: "rangedKiter",
  token: "C",
  tokenArt: "assets/tokens/corpse-candle-acolyte.jpg",
});

window.DungeonContent.register("monsters", "corpseHeapBrute", {
  name: "Corpse-Heap Brute",
  role: "Category 1 zombie boss",
  tags: ["undead", "zombie", "boss", "brute"],
  maxHp: 26,
  category: 1,
  xp: 120,
  ac: 12,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 8,
    bonus: 2,
    type: "bludgeoning",
    attackType: "weapon",
    label: "1d8 + 2 bludgeoning"
  },
  damageResistances: ["necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "SelfHeal", // Once per fight: restore 1d8 + 2 HP if below half HP.
    "Corpse Slam", // 10 ft line, Str save against 12, 2d6 bludgeoning damage and pushed 5 ft if save unsuccessful, half damage and no push if successful.
  ],
  initiativeBonus: 0,
  speedFeet: 25,
  behavior: "melee",
  token: "B",
  tokenArt: "assets/tokens/corpse-heap-brute.jpg",
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});


/* ============================================================
 * CATEGORY 2 — Solo Fighter Level 3/4
 * Theme: stronger ghouls, plague corpses, corpse mages
 * ============================================================ */

window.DungeonContent.register("monsters", "plagueGhast", {
  name: "Plague Ghast",
  role: "Diseased undead hunter",
  tags: ["undead", "zombie", "ghoul", "disease"],
  maxHp: 24,
  category: 2,
  xp: 130,
  ac: 14,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 8,
    bonus: 3,
    type: "slashing",
    attackType: "weapon",
    label: "1d8 + 3 slashing"
  },
  damageResistances: ["necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Sickening Claws", // On hit: Con save against 13, target has -1 attack penalty until the end of its next turn if save unsuccessful.
  ],
  initiativeBonus: 2,
  speedFeet: 35,
  behavior: "melee",
  token: "P",
  tokenArt: "assets/tokens/plague-ghast.jpg",
});

window.DungeonContent.register("monsters", "graveMireCrawler", {
  name: "Grave-Mire Crawler",
  role: "Heavy crawling corpse",
  tags: ["undead", "zombie", "brute"],
  maxHp: 30,
  category: 2,
  xp: 140,
  ac: 13,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 10,
    bonus: 2,
    type: "bludgeoning",
    attackType: "weapon",
    label: "1d10 + 2 bludgeoning"
  },
  damageResistances: ["necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Dragging Grasp", // On hit: Str save against 13, target is pulled 5 ft toward the monster if save unsuccessful.
  ],
  initiativeBonus: 0,
  speedFeet: 25,
  behavior: "melee",
  token: "M",
  tokenArt: "assets/tokens/grave-mire-crawler.jpg",
});

window.DungeonContent.register("monsters", "vomitousDead", {
  name: "Vomitous Dead",
  role: "Short-range plague attacker",
  tags: ["undead", "zombie", "disease"],
  maxHp: 25,
  category: 2,
  xp: 145,
  ac: 12,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 8,
    bonus: 3,
    type: "poison",
    attackType: "weapon",
    label: "1d8 + 3 poison",
    range: { kind: "ranged", normal: 30, long: 90, feet: 30 }
  },
  damageResistances: ["necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Bile Spray", // 15 ft cone, Con save against 13, 3d6 poison damage if save unsuccessful, half if successful.
  ],
  initiativeBonus: 1,
  speedFeet: 25,
  behavior: "rangedKiter",
  token: "V",
  tokenArt: "assets/tokens/vomitous-dead.jpg",
});

window.DungeonContent.register("monsters", "corpsefireInvoker", {
  name: "Corpsefire Invoker",
  role: "Undead fire spellcaster",
  tags: ["undead", "zombie", "caster", "fire"],
  maxHp: 22,
  category: 2,
  xp: 155,
  ac: 13,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 8,
    bonus: 3,
    type: "fire",
    attackType: "spell",
    label: "1d8 + 3 fire",
    range: { kind: "ranged", normal: 60, long: 180, feet: 60 }
  },
  damageResistances: ["fire", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Lesser Fireball", // 15 ft radius circle, Dex save against 13, 3d6 fire damage if save unsuccessful, half if successful.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "F",
  tokenArt: "assets/tokens/corpsefire-invoker.jpg",
});

window.DungeonContent.register("monsters", "rotCrownedGhoul", {
  name: "Rot-Crowned Ghoul",
  role: "Category 2 zombie boss",
  tags: ["undead", "zombie", "ghoul", "boss"],
  maxHp: 42,
  category: 2,
  xp: 240,
  ac: 15,
  attackBonus: 6,
  damage: {
    count: 1,
    sides: 10,
    bonus: 3,
    type: "slashing",
    attackType: "weapon",
    label: "1d10 + 3 slashing"
  },
  damageResistances: ["necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "SelfHeal", // Once per fight: restore 2d8 HP if below half HP.
    "Rot Crown Pulse", // 15 ft radius circle centered on self, Con save against 14, 3d6 necrotic damage if save unsuccessful, half if successful.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "R",
  tokenArt: "assets/tokens/rot-crowned-ghoul.jpg",
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});


/* ============================================================
 * CATEGORY 3 — Solo Fighter Level 5/6
 * Theme: corpse giants, stronger undead mages, elite plague bosses
 * ============================================================ */

window.DungeonContent.register("monsters", "corpseStitchedGoliath", {
  name: "Corpse-Stitched Goliath",
  role: "Massive zombie brute",
  tags: ["undead", "zombie", "brute"],
  sizeSquares: 2,
  maxHp: 48,
  category: 3,
  xp: 260,
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
  damageResistances: ["necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Crushing Stomp", // 10 ft radius circle centered on self, Dex save against 14, 3d6 bludgeoning damage and knocked back 5 ft if save unsuccessful, half damage and no knockback if successful.
  ],
  initiativeBonus: 0,
  speedFeet: 25,
  behavior: "melee",
  token: "G",
  tokenArt: "assets/tokens/corpse-stitched-goliath.jpg",
});

window.DungeonContent.register("monsters", "drownedGhoul", {
  name: "Drowned Ghoul",
  role: "Fast wet corpse predator",
  tags: ["undead", "zombie", "ghoul", "water"],
  maxHp: 38,
  category: 3,
  xp: 250,
  ac: 15,
  attackBonus: 7,
  damage: {
    count: 1,
    sides: 8,
    bonus: 5,
    type: "slashing",
    attackType: "weapon",
    label: "1d8 + 5 slashing"
  },
  damageResistances: ["cold", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Drowning Grip", // On hit: Con save against 14, target takes extra 1d6 necrotic damage if save unsuccessful.
  ],
  initiativeBonus: 4,
  speedFeet: 35,
  behavior: "melee",
  token: "D",
  tokenArt: "assets/tokens/drowned-ghoul.jpg",
});

window.DungeonContent.register("monsters", "blightbelcher", {
  name: "Blightbelcher",
  role: "Heavy corpse artillery",
  tags: ["undead", "zombie", "disease"],
  maxHp: 42,
  category: 3,
  xp: 270,
  ac: 13,
  attackBonus: 6,
  damage: {
    count: 1,
    sides: 10,
    bonus: 4,
    type: "poison",
    attackType: "weapon",
    label: "1d10 + 4 poison",
    range: { kind: "ranged", normal: 40, long: 120, feet: 40 }
  },
  damageResistances: ["acid", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Blight Belch", // 20 ft cone, Con save against 14, 4d6 poison damage if save unsuccessful, half if successful.
  ],
  initiativeBonus: 1,
  speedFeet: 25,
  behavior: "rangedKiter",
  token: "B",
  tokenArt: "assets/tokens/blightbelcher.jpg",
});

window.DungeonContent.register("monsters", "graveflameWarlock", {
  name: "Graveflame Warlock",
  role: "Elite undead spellcaster",
  tags: ["undead", "zombie", "caster", "fire"],
  maxHp: 36,
  category: 3,
  xp: 280,
  ac: 15,
  attackBonus: 7,
  damage: {
    count: 1,
    sides: 10,
    bonus: 4,
    type: "fire",
    attackType: "spell",
    label: "1d10 + 4 fire",
    range: { kind: "ranged", normal: 80, long: 240, feet: 80 }
  },
  damageResistances: ["fire", "necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Fireball", // 20 ft radius circle, Dex save against 14, 4d6 fire damage if save unsuccessful, half if successful.
    "SelfHeal", // Once per fight: restore 2d6 HP after dealing spell damage.
  ],
  initiativeBonus: 3,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "W",
  tokenArt: "assets/tokens/graveflame-warlock.jpg",
});

window.DungeonContent.register("monsters", "plagueGraveTitan", {
  name: "Plague-Grave Titan",
  role: "Category 3 zombie boss",
  sizeSquares: 2,
  tags: ["undead", "zombie", "boss", "brute", "disease"],
  maxHp: 68,
  category: 3,
  xp: 420,
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
  damageResistances: ["necrotic", "poison"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: [],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "SelfHeal", // Once per fight: restore 3d8 HP if below half HP.
    "Gravequake", // 20 ft radius circle centered on self, Dex save against 15, 4d6 bludgeoning damage and pushed 10 ft if save unsuccessful, half damage and no push if successful.
    "Plague Breath", // 15 ft cone, Con save against 15, 4d6 poison damage if save unsuccessful, half if successful.
  ],
  initiativeBonus: 1,
  speedFeet: 25,
  behavior: "melee",
  token: "T",
  tokenArt: "assets/tokens/plague-grave-titan.jpg",
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});

})();
