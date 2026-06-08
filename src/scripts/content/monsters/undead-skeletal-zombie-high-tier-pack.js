(() => {

/* ============================================================
 * UNDEAD SKELETAL + ZOMBIE HIGH-TIER MONSTER PACK
 * Categories: 4 through 10 only.
 * Structure per category:
 * - 2 undead + skeletal monsters
 * - 1 undead + skeletal boss
 * - 2 undead + zombie monsters
 * - 1 undead + zombie boss
 *
 * Every monster starts tags with the D&D 5e type "undead".
 * The second tag marks the requested combo: "skeletal" or "zombie".
 * Existing specialAbility names are used where possible.
 * NEW abilities include comments describing intended mechanics.
 * ============================================================ */


/* ============================================================
 * CATEGORY 4 — Party Level 7/8
 * ============================================================ */

window.DungeonContent.register("monsters", "ashboneDuelist", {
  name: "Ashbone Duelist",
  role: "Fast skeletal swordfighter",
  tags: ["undead", "skeletal", "old-guardroom", "duelist", "ash"],
  maxHp: 82,
  category: 4,
  multiattack: { attacks: 2 },
  xp: 2610,
  ac: 17,
  attackBonus: 8,
  damage: {
    count: 3,
    sides: 6,
    bonus: 4,
    type: "slashing",
    attackType: "weapon",
    label: "3d6 + 4 slashing",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["necrotic", "poison"],
  damageVulnerabilities: ["bludgeoning", "radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Bleeding Edge", // Implemented cutting rider: Dex save or extra slashing damage.
    "Parrying Fade", // Implemented ghost-style evasive/parry identity; if not hooked for skeletons, treat as a short defensive stance.
  ],
  initiativeBonus: 5,
  speedFeet: 35,
  behavior: "melee",
  token: "D",
  tokenArt: "assets/tokens/ashbone-duelist.jpg",
});

window.DungeonContent.register("monsters", "ribcageArbalester", {
  name: "Ribcage Arbalester",
  role: "Skeletal ranged pinning unit",
  tags: ["undead", "skeletal", "old-guardroom", "archer", "ossuary"],
  maxHp: 76,
  category: 4,
  xp: 2765,
  ac: 16,
  attackBonus: 8,
  damage: {
    count: 3,
    sides: 6,
    bonus: 4,
    type: "piercing",
    attackType: "weapon",
    label: "3d6 + 4 piercing",
    range: {
      kind: "ranged",
      normal: 90,
      long: 270,
      feet: 90,
    },
  },
  damageResistances: ["necrotic", "poison"],
  damageVulnerabilities: ["bludgeoning", "radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Shard Pin", // Implemented shard rider: Dex save or slashing damage and slowed movement.
    "Needle Spray", // Implemented area shard attack: Dex save or slashing damage.
  ],
  initiativeBonus: 4,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "A",
  tokenArt: "assets/tokens/ribcage-arbalester.jpg",
});

window.DungeonContent.register("monsters", "ossuaryCaptain", {
  name: "Ossuary Captain",
  role: "Category 4 skeletal boss",
  tags: ["undead", "skeletal", "old-guardroom", "boss", "captain"],
  maxHp: 158,
  category: 4,
  multiattack: { attacks: 2 },
  xp: 24425,
  ac: 18,
  attackBonus: 9,
  damage: {
    count: 4,
    sides: 8,
    bonus: 5,
    type: "slashing",
    attackType: "weapon",
    label: "4d8 + 5 slashing",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["necrotic", "poison", "piercing", "slashing"],
  damageVulnerabilities: ["bludgeoning", "radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Command the Dead", // Implemented undead command-style aura; nearby undead allies gain a short attack bonus.
    "Bone Cage", // NEW: rib bones erupt around one target; Str save or briefly restrained.
    "Unfinished Death", // Implemented death-defiance family: one-time survival at 1 HP.
  ],
  initiativeBonus: 3,
  speedFeet: 30,
  behavior: "melee",
  token: "C",
  tokenArt: "assets/tokens/ossuary-captain.jpg",
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});

window.DungeonContent.register("monsters", "plagueBloatedGuard", {
  name: "Plague-Bloated Guard",
  role: "Durable zombie shield body",
  tags: ["undead", "zombie", "plague", "guard"],
  maxHp: 104,
  category: 4,
  multiattack: { attacks: 2 },
  xp: 2765,
  ac: 15,
  attackBonus: 8,
  damage: {
    count: 3,
    sides: 8,
    bonus: 4,
    type: "bludgeoning",
    attackType: "weapon",
    label: "3d8 + 4 bludgeoning",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["necrotic", "bludgeoning"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Undead Fortitude", // Implemented zombie durability; should resist dropping to 0 HP.
    "Sickening Claws", // Implemented poison rider: Con save or poison damage and attack penalty.
  ],
  initiativeBonus: 0,
  speedFeet: 25,
  behavior: "melee",
  token: "Z",
  tokenArt: "assets/tokens/plague-bloated-guard.jpg",
});

window.DungeonContent.register("monsters", "graveyardMauler", {
  name: "Graveyard Mauler",
  role: "Charging corpse brute",
  tags: ["undead", "zombie", "brute", "graveyard"],
  maxHp: 112,
  category: 4,
  multiattack: { attacks: 2 },
  xp: 3220,
  ac: 14,
  attackBonus: 8,
  damage: {
    count: 3,
    sides: 10,
    bonus: 4,
    type: "bludgeoning",
    attackType: "weapon",
    label: "3d10 + 4 bludgeoning",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["necrotic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Corpse Slam", // Implemented charge/slam family: moved-far hit adds damage and may knock prone.
    "Dragging Grasp", // Implemented slow/grab rider: failed save reduces or stops movement briefly.
  ],
  initiativeBonus: -1,
  speedFeet: 30,
  behavior: "melee",
  token: "M",
  tokenArt: "assets/tokens/graveyard-mauler.jpg",
});

window.DungeonContent.register("monsters", "rotgutBannerbearer", {
  name: "Rotgut Bannerbearer",
  role: "Category 4 zombie boss",
  tags: ["undead", "zombie", "boss", "standard-bearer"],
  maxHp: 178,
  category: 4,
  multiattack: { attacks: 2 },
  xp: 26485,
  ac: 16,
  attackBonus: 9,
  damage: {
    count: 4,
    sides: 8,
    bonus: 5,
    type: "necrotic",
    attackType: "weapon",
    label: "4d8 + 5 necrotic",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["necrotic", "bludgeoning", "piercing"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Rot Crown Pulse", // Implemented plague/poison burst: area save or poison/acid-style damage and debuff.
    "Command the Dead", // Implemented undead command-style aura; nearby undead allies gain a short attack bonus.
    "Undead Fortitude", // Implemented zombie durability; should resist dropping to 0 HP.
  ],
  initiativeBonus: 1,
  speedFeet: 25,
  behavior: "melee",
  token: "B",
  tokenArt: "assets/tokens/rotgut-bannerbearer.jpg",
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});


/* ============================================================
 * CATEGORY 5 — Party Level 9/10
 * ============================================================ */

window.DungeonContent.register("monsters", "crownlessGraveKnight", {
  name: "Crownless Grave Knight",
  role: "Elite skeletal knight",
  tags: ["undead", "skeletal", "old-guardroom", "knight", "grave"],
  maxHp: 126,
  category: 5,
  multiattack: { attacks: 2 },
  xp: 3840,
  ac: 19,
  attackBonus: 9,
  damage: {
    count: 4,
    sides: 6,
    bonus: 5,
    type: "slashing",
    attackType: "weapon",
    label: "4d6 + 5 slashing",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["necrotic", "poison", "slashing"],
  damageVulnerabilities: ["bludgeoning", "radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Spectral Charge", // Implemented charge/rush style ability: moved-far hit adds damage and can shove/knock prone.
    "Condemning Mark", // Implemented curse/malice rider: Wis save or short attack/save penalty.
  ],
  initiativeBonus: 4,
  speedFeet: 35,
  behavior: "melee",
  token: "K",
  tokenArt: "assets/tokens/crownless-grave-knight.jpg",
});

window.DungeonContent.register("monsters", "bonefluteHexer", {
  name: "Boneflute Hexer",
  role: "Skeletal curse caster",
  tags: ["undead", "skeletal", "old-guardroom", "caster", "hex"],
  maxHp: 106,
  category: 5,
  xp: 4055,
  ac: 16,
  attackBonus: 9,
  damage: {
    count: 4,
    sides: 6,
    bonus: 5,
    type: "necrotic",
    attackType: "spell",
    label: "4d6 + 5 necrotic",
    range: {
      kind: "ranged",
      normal: 90,
      long: 270,
      feet: 90,
    },
  },
  damageResistances: ["necrotic", "poison"],
  damageVulnerabilities: ["bludgeoning", "radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Dread Whisper", // Implemented fear/curse rider: Wis save or short attack/save penalty.
    "Hollow Wail", // Implemented dread burst: area save or psychic/thunder damage and possible fear.
  ],
  initiativeBonus: 3,
  speedFeet: 30,
  behavior: "ranged",
  token: "H",
  tokenArt: "assets/tokens/boneflute-hexer.jpg",
});

window.DungeonContent.register("monsters", "marrowMagistrate", {
  name: "Marrow Magistrate",
  role: "Category 5 skeletal boss",
  tags: ["undead", "skeletal", "old-guardroom", "boss", "magistrate"],
  maxHp: 248,
  category: 5,
  xp: 38305,
  ac: 20,
  attackBonus: 10,
  damage: {
    count: 5,
    sides: 8,
    bonus: 6,
    type: "necrotic",
    attackType: "spell",
    label: "5d8 + 6 necrotic",
    range: {
      kind: "ranged",
      normal: 60,
      long: 180,
      feet: 60,
    },
  },
  damageResistances: ["necrotic", "poison", "piercing", "slashing"],
  damageVulnerabilities: ["bludgeoning", "radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion", "frightened"],
  specialAbility: [
    "Sentence to Chains", // Implemented binding/chains special: targets save or are briefly restrained and pulled.
    "Void Bell Toll", // Implemented dread burst: area save or psychic/thunder damage and possible fear.
    "Marrow Verdict", // NEW: marks a low-HP target; if hit again this round, it takes bonus necrotic damage.
  ],
  initiativeBonus: 4,
  speedFeet: 30,
  behavior: "ranged",
  token: "M",
  tokenArt: "assets/tokens/marrow-magistrate.jpg",
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});

window.DungeonContent.register("monsters", "corpseBloomHulk", {
  name: "Corpse-Bloom Hulk",
  role: "Poisonous swollen zombie",
  sizeSquares: 2,
  tags: ["undead", "zombie", "plague", "hulk"],
  maxHp: 150,
  category: 5,
  multiattack: { attacks: 2 },
  xp: 4690,
  ac: 15,
  attackBonus: 9,
  damage: {
    count: 4,
    sides: 8,
    bonus: 5,
    type: "poison",
    attackType: "weapon",
    label: "4d8 + 5 poison",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["necrotic", "poison"],
  damageVulnerabilities: ["radiant", "fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Bile Spray", // Implemented plague burst: area save or poison/acid damage and possible poisoned/scorched effect.
    "SelfHeal", // Implemented start-of-turn self-heal once per fight at or below half HP.
  ],
  initiativeBonus: -1,
  speedFeet: 25,
  behavior: "melee",
  token: "H",
  tokenArt: "assets/tokens/corpse-bloom-hulk.jpg",
});

window.DungeonContent.register("monsters", "drownedCryptZombie", {
  name: "Drowned Crypt Zombie",
  role: "Dragging waterlogged corpse",
  tags: ["undead", "zombie", "drowned", "crypt"],
  maxHp: 138,
  category: 5,
  multiattack: { attacks: 2 },
  xp: 4270,
  ac: 15,
  attackBonus: 9,
  damage: {
    count: 4,
    sides: 8,
    bonus: 5,
    type: "bludgeoning",
    attackType: "weapon",
    label: "4d8 + 5 bludgeoning",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["necrotic", "cold"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Drowning Grip", // Implemented slow/grapple-like rider: failed save reduces or stops movement briefly.
    "Pull Under", // Implemented pull rider: Str save or pulled 5 ft and possibly restrained.
  ],
  initiativeBonus: 0,
  speedFeet: 25,
  behavior: "melee",
  token: "D",
  tokenArt: "assets/tokens/drowned-crypt-zombie.jpg",
});

window.DungeonContent.register("monsters", "blightcartAbomination", {
  name: "Blightcart Abomination",
  role: "Category 5 zombie boss",
  tags: ["undead", "zombie", "boss", "abomination"],
  maxHp: 282,
  category: 5,
  multiattack: { attacks: 2 },
  xp: 41975,
  ac: 17,
  attackBonus: 10,
  damage: {
    count: 5,
    sides: 8,
    bonus: 6,
    type: "poison",
    attackType: "weapon",
    label: "5d8 + 6 poison",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["necrotic", "bludgeoning", "poison"],
  damageVulnerabilities: ["radiant", "fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Blight Belch", // Implemented plague burst: area save or poison/acid damage and possible poisoned effect.
    "Crushing Stomp", // Implemented slam/quake hit: moved-far hit adds damage and may knock prone.
    "Corpse Cart Spill", // NEW: drops a short-lived diseased terrain patch; entering it causes poison damage or movement penalty.
  ],
  initiativeBonus: 0,
  speedFeet: 25,
  behavior: "melee",
  token: "A",
  tokenArt: "assets/tokens/blightcart-abomination.jpg",
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});


/* ============================================================
 * CATEGORY 6 — Party Level 11/12
 * ============================================================ */

window.DungeonContent.register("monsters", "blackboneHalberdier", {
  name: "Black-Bone Halberdier",
  role: "Reach skeletal elite",
  tags: ["undead", "skeletal", "old-guardroom", "halberdier", "black-bone"],
  maxHp: 164,
  category: 6,
  multiattack: { attacks: 2 },
  xp: 3450,
  ac: 20,
  attackBonus: 10,
  damage: {
    count: 5,
    sides: 6,
    bonus: 6,
    type: "slashing",
    attackType: "weapon",
    label: "5d6 + 6 slashing",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["necrotic", "poison", "piercing", "slashing"],
  damageVulnerabilities: ["bludgeoning", "radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Impaling Advance", // Implemented charge/rush family: moved-far hit adds damage and can shove/knock prone.
    "Shard Pin", // Implemented shard rider: Dex save or slashing damage and slowed movement.
  ],
  initiativeBonus: 4,
  speedFeet: 35,
  behavior: "melee",
  token: "L",
  tokenArt: "assets/tokens/black-bone-halberdier.jpg",
});

window.DungeonContent.register("monsters", "ossuarySpellblade", {
  name: "Ossuary Spellblade",
  role: "Mobile skeletal necro-duelist",
  tags: ["undead", "skeletal", "old-guardroom", "spellblade", "ossuary"],
  maxHp: 152,
  category: 6,
  multiattack: { attacks: 2 },
  xp: 3855,
  ac: 19,
  attackBonus: 10,
  damage: {
    count: 5,
    sides: 6,
    bonus: 6,
    type: "necrotic",
    attackType: "weapon",
    label: "5d6 + 6 necrotic",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["necrotic", "poison", "necrotic"],
  damageVulnerabilities: ["bludgeoning", "radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Life Drain", // Implemented soul drain rider: Con save or necrotic damage, drained movement, possible healing.
    "Fading Retreat", // Implemented ghost mobility/evasion; if not hooked here, treat as short reposition after being hit.
  ],
  initiativeBonus: 6,
  speedFeet: 40,
  behavior: "melee",
  token: "S",
  tokenArt: "assets/tokens/ossuary-spellblade.jpg",
});

window.DungeonContent.register("monsters", "bonePriestOfTheHollowChoir", {
  name: "Bone-Priest of the Hollow Choir",
  role: "Category 6 skeletal boss",
  tags: ["undead", "skeletal", "old-guardroom", "boss", "priest", "choir"],
  maxHp: 330,
  category: 6,
  xp: 36460,
  ac: 20,
  attackBonus: 11,
  damage: {
    count: 6,
    sides: 8,
    bonus: 7,
    type: "necrotic",
    attackType: "spell",
    label: "6d8 + 7 necrotic",
    range: {
      kind: "ranged",
      normal: 90,
      long: 270,
      feet: 90,
    },
  },
  damageResistances: ["necrotic", "poison", "piercing", "slashing", "necrotic"],
  damageVulnerabilities: ["bludgeoning", "radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion", "frightened"],
  specialAbility: [
    "Cathedral Dirge", // Implemented dread burst: area save or psychic/thunder damage and possible fear.
    "Grave Benediction", // Action: heals a wounded monster ally within 30 ft.
    "Grave Breath", // Implemented necrotic burst: area save or necrotic damage and drain.
    "Hollow Choir Rebuild", // NEW: once per fight, reforms one destroyed lesser skeletal ally at low HP.
  ],
  initiativeBonus: 4,
  speedFeet: 30,
  behavior: "ranged",
  token: "P",
  tokenArt: "assets/tokens/bone-priest-of-the-hollow-choir.jpg",
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});

window.DungeonContent.register("monsters", "stitchedSiegeCorpse", {
  name: "Stitched Siege Corpse",
  role: "Huge stitched zombie attacker",
  sizeSquares: 2,
  tags: ["undead", "zombie", "stitched", "siege"],
  maxHp: 198,
  category: 6,
  multiattack: { attacks: 2 },
  xp: 4260,
  ac: 16,
  attackBonus: 10,
  damage: {
    count: 5,
    sides: 10,
    bonus: 6,
    type: "bludgeoning",
    attackType: "weapon",
    label: "5d10 + 6 bludgeoning",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["necrotic", "bludgeoning", "piercing"],
  damageVulnerabilities: ["radiant", "fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Siege Charge", // Implemented charge/rush family: moved-far hit adds damage and can shove/knock prone.
    "Undead Fortitude", // Implemented zombie durability; should resist dropping to 0 HP.
  ],
  initiativeBonus: -1,
  speedFeet: 30,
  behavior: "melee",
  token: "S",
  tokenArt: "assets/tokens/stitched-siege-corpse.jpg",
});

window.DungeonContent.register("monsters", "graveTarVomiter", {
  name: "Grave-Tar Vomiter",
  role: "Ranged plague zombie",
  tags: ["undead", "zombie", "tar", "plague"],
  maxHp: 172,
  category: 6,
  xp: 3955,
  ac: 15,
  attackBonus: 10,
  damage: {
    count: 5,
    sides: 6,
    bonus: 6,
    type: "acid",
    attackType: "spell",
    label: "5d6 + 6 acid",
    range: {
      kind: "ranged",
      normal: 60,
      long: 180,
      feet: 60,
    },
  },
  damageResistances: ["necrotic", "acid"],
  damageVulnerabilities: ["radiant", "fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Plague Breath", // Implemented plague burst: area save or poison/acid damage and possible poisoned effect.
    "Dragging Grasp", // Implemented slow/grab rider: failed save reduces or stops movement briefly.
  ],
  initiativeBonus: 0,
  speedFeet: 25,
  behavior: "ranged",
  token: "V",
  tokenArt: "assets/tokens/grave-tar-vomiter.jpg",
});

window.DungeonContent.register("monsters", "corpseMasonJuggernaut", {
  name: "Corpse-Mason Juggernaut",
  role: "Category 6 zombie boss",
  sizeSquares: 2,
  tags: ["undead", "zombie", "boss", "juggernaut"],
  maxHp: 372,
  category: 6,
  multiattack: { attacks: 2 },
  xp: 39435,
  ac: 18,
  attackBonus: 11,
  damage: {
    count: 6,
    sides: 8,
    bonus: 7,
    type: "bludgeoning",
    attackType: "weapon",
    label: "6d8 + 7 bludgeoning",
    range: {
      kind: "melee",
      feet: 15,
    },
  },
  damageResistances: ["necrotic", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Gravequake", // Implemented earth/quake style burst: area save or bludgeoning damage and pushed/shaken.
    "Rot Burst", // Implemented plague burst: area save or poison/acid damage and possible poisoned effect.
    "Mass Grave Mortar", // NEW: throws corpse rubble at range; area Dex save or bludgeoning/necrotic damage.
  ],
  initiativeBonus: 0,
  speedFeet: 25,
  behavior: "melee",
  token: "J",
  tokenArt: "assets/tokens/corpse-mason-juggernaut.jpg",
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});


/* ============================================================
 * CATEGORY 7 — Party Level 13/14
 * ============================================================ */

window.DungeonContent.register("monsters", "adamantBoneSentinel", {
  name: "Adamant-Bone Sentinel",
  role: "High-AC skeletal guardian",
  tags: ["undead", "skeletal", "old-guardroom", "sentinel", "adamant"],
  maxHp: 220,
  category: 7,
  multiattack: { attacks: 2 },
  xp: 4705,
  ac: 22,
  attackBonus: 11,
  damage: {
    count: 6,
    sides: 6,
    bonus: 7,
    type: "slashing",
    attackType: "weapon",
    label: "6d6 + 7 slashing",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["necrotic", "poison", "piercing", "slashing", "necrotic"],
  damageVulnerabilities: ["bludgeoning", "radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Adamantine Frame", // Implemented defensive brace: reduces/caps damage or grants a short defensive stance.
    "Guarding Slab", // Implemented defensive stance family; use as guard/brace identity for this sentinel.
  ],
  initiativeBonus: 2,
  speedFeet: 25,
  behavior: "melee",
  token: "S",
  tokenArt: "assets/tokens/adamant-bone-sentinel.jpg",
});

window.DungeonContent.register("monsters", "marrowStandardBearer", {
  name: "Marrow Standard Bearer",
  role: "Skeletal command unit",
  tags: ["undead", "skeletal", "old-guardroom", "standard-bearer", "commander"],
  maxHp: 196,
  category: 7,
  multiattack: { attacks: 2 },
  xp: 5070,
  ac: 20,
  attackBonus: 11,
  damage: {
    count: 6,
    sides: 6,
    bonus: 7,
    type: "necrotic",
    attackType: "weapon",
    label: "6d6 + 7 necrotic",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["necrotic", "poison", "piercing", "slashing"],
  damageVulnerabilities: ["bludgeoning", "radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion", "frightened"],
  specialAbility: [
    "Command the Dead", // Implemented undead command-style aura; nearby undead allies gain a short attack bonus.
    "Royal Tremor", // Implemented earth burst: area save or bludgeoning damage and pushed/shaken.
  ],
  initiativeBonus: 3,
  speedFeet: 30,
  behavior: "melee",
  token: "B",
  tokenArt: "assets/tokens/marrow-standard-bearer.jpg",
});

window.DungeonContent.register("monsters", "barrowboneCastellan", {
  name: "Barrowbone Castellan",
  role: "Category 7 skeletal boss",
  tags: ["undead", "skeletal", "old-guardroom", "boss", "castellan"],
  maxHp: 430,
  category: 7,
  multiattack: { attacks: 2 },
  xp: 39445,
  ac: 22,
  attackBonus: 12,
  damage: {
    count: 7,
    sides: 8,
    bonus: 8,
    type: "necrotic",
    attackType: "weapon",
    label: "7d8 + 8 necrotic",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["necrotic", "poison", "piercing", "slashing", "necrotic"],
  damageVulnerabilities: ["bludgeoning", "radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion", "frightened"],
  specialAbility: [
    "King's Return", // Implemented death-defiance family: one-time survival at 1 HP.
    "Burial Pull", // Implemented pull rider: Str save or pulled 5 ft and possibly restrained.
    "Castellan's Lockstep", // NEW: all skeletal allies may immediately move 5 ft without provoking/triggering movement penalties.
  ],
  initiativeBonus: 4,
  speedFeet: 30,
  behavior: "melee",
  token: "C",
  tokenArt: "assets/tokens/barrowbone-castellan.jpg",
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});

window.DungeonContent.register("monsters", "graveMoundDevourer", {
  name: "Grave-Mound Devourer",
  role: "Hungry corpse mass",
  sizeSquares: 2,
  tags: ["undead", "zombie", "devourer", "grave-mound"],
  maxHp: 248,
  category: 7,
  multiattack: { attacks: 2 },
  xp: 5580,
  ac: 17,
  attackBonus: 11,
  damage: {
    count: 6,
    sides: 8,
    bonus: 7,
    type: "necrotic",
    attackType: "weapon",
    label: "6d8 + 7 necrotic",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["necrotic", "bludgeoning", "piercing"],
  damageVulnerabilities: ["radiant", "fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Unending Appetite", // Implemented soul drain/bloodied-style rider: necrotic damage, movement penalty, possible self-heal.
    "Feeding Frenzy", // Implemented bloodied finisher: extra damage against targets at or below half HP.
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "melee",
  token: "D",
  tokenArt: "assets/tokens/grave-mound-devourer.jpg",
});

window.DungeonContent.register("monsters", "rottingPlagueGiant", {
  name: "Rotting Plague Giant",
  role: "Oversized zombie plague brute",
  sizeSquares: 2,
  tags: ["undead", "zombie", "giant", "plague"],
  maxHp: 270,
  category: 7,
  multiattack: { attacks: 2 },
  xp: 6025,
  ac: 17,
  attackBonus: 12,
  damage: {
    count: 6,
    sides: 10,
    bonus: 7,
    type: "bludgeoning",
    attackType: "weapon",
    label: "6d10 + 7 bludgeoning",
    range: {
      kind: "melee",
      feet: 15,
    },
  },
  damageResistances: ["necrotic", "bludgeoning", "poison"],
  damageVulnerabilities: ["radiant", "fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Crushing Stomp", // Implemented slam/quake hit: moved-far hit adds damage and may knock prone.
    "Vomit Plague", // Implemented plague burst: area save or poison/acid damage and possible poisoned effect.
  ],
  initiativeBonus: -1,
  speedFeet: 30,
  behavior: "melee",
  token: "G",
  tokenArt: "assets/tokens/rotting-plague-giant.jpg",
});

window.DungeonContent.register("monsters", "carrionCrownBrute", {
  name: "Carrion Crown Brute",
  role: "Category 7 zombie boss",
  tags: ["undead", "zombie", "boss", "carrion-crown"],
  maxHp: 460,
  category: 7,
  multiattack: { attacks: 2 },
  xp: 43315,
  ac: 19,
  attackBonus: 12,
  damage: {
    count: 7,
    sides: 8,
    bonus: 8,
    type: "poison",
    attackType: "weapon",
    label: "7d8 + 8 poison",
    range: {
      kind: "melee",
      feet: 15,
    },
  },
  damageResistances: ["necrotic", "bludgeoning", "piercing", "poison"],
  damageVulnerabilities: ["radiant", "fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion", "frightened"],
  specialAbility: [
    "Rot Crown Pulse", // Implemented plague burst: area save or poison/acid damage and possible poisoned effect.
    "Undead Fortitude", // Implemented zombie durability; should resist dropping to 0 HP.
    "Carrion Crown Command", // NEW: zombie allies immediately use their movement toward the nearest wounded hero.
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "melee",
  token: "R",
  tokenArt: "assets/tokens/carrion-crown-brute.jpg",
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});


/* ============================================================
 * CATEGORY 8 — Party Level 15/16
 * ============================================================ */

window.DungeonContent.register("monsters", "royalOssuaryLancer", {
  name: "Royal Ossuary Lancer",
  role: "Devastating skeletal charger",
  tags: ["undead", "skeletal", "old-guardroom", "lancer", "royal"],
  maxHp: 266,
  category: 8,
  multiattack: { attacks: 2 },
  xp: 6835,
  ac: 22,
  attackBonus: 12,
  damage: {
    count: 7,
    sides: 6,
    bonus: 8,
    type: "piercing",
    attackType: "weapon",
    label: "7d6 + 8 piercing",
    range: {
      kind: "melee",
      feet: 15,
    },
  },
  damageResistances: ["necrotic", "poison", "piercing", "slashing", "necrotic"],
  damageVulnerabilities: ["bludgeoning", "radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Impaling Advance", // Implemented charge/rush family: moved-far hit adds damage and can shove/knock prone.
    "Spectral Chain", // Implemented pull rider: Str save or pulled 5 ft and possibly restrained.
  ],
  initiativeBonus: 5,
  speedFeet: 40,
  behavior: "melee",
  token: "L",
  tokenArt: "assets/tokens/royal-ossuary-lancer.jpg",
});

window.DungeonContent.register("monsters", "shardboneReaper", {
  name: "Shardbone Reaper",
  role: "Skeletal executioner",
  tags: ["undead", "skeletal", "old-guardroom", "reaper", "shardbone"],
  maxHp: 248,
  category: 8,
  multiattack: { attacks: 3 },
  xp: 7285,
  ac: 21,
  attackBonus: 12,
  damage: {
    count: 7,
    sides: 8,
    bonus: 8,
    type: "slashing",
    attackType: "weapon",
    label: "7d8 + 8 slashing",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["necrotic", "poison", "piercing", "slashing"],
  damageVulnerabilities: ["bludgeoning", "radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Shatter Spines", // Implemented reactive body/riposte family: melee attackers may take reactive damage.
    "Flesh Verdict", // Implemented bloodied finisher: extra damage against targets at or below half HP.
  ],
  initiativeBonus: 4,
  speedFeet: 35,
  behavior: "melee",
  token: "R",
  tokenArt: "assets/tokens/shardbone-reaper.jpg",
});

window.DungeonContent.register("monsters", "boneTaxCollector", {
  name: "Bone Tax Collector",
  role: "Category 8 skeletal boss",
  tags: ["undead", "skeletal", "old-guardroom", "boss", "reaper", "tax-collector"],
  maxHp: 520,
  category: 8,
  multiattack: { attacks: 3 },
  xp: 22340,
  ac: 23,
  attackBonus: 13,
  damage: {
    count: 8,
    sides: 8,
    bonus: 9,
    type: "necrotic",
    attackType: "weapon",
    label: "8d8 + 9 necrotic",
    range: {
      kind: "melee",
      feet: 15,
    },
  },
  damageResistances: ["necrotic", "poison", "piercing", "slashing", "necrotic", "cold"],
  damageVulnerabilities: ["bludgeoning", "radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion", "frightened"],
  specialAbility: [
    "Triple Condemnation", // Implemented dread burst: area save or psychic/thunder damage and possible fear.
    "Devour Soul", // Implemented life/soul drain: Con save or necrotic damage, drained movement, possible healing.
    "Bone Debt", // NEW: each time a hero uses a potion/item near this boss, the boss gains a small shield or healing pulse.
  ],
  initiativeBonus: 5,
  speedFeet: 35,
  behavior: "melee",
  token: "T",
  tokenArt: "assets/tokens/bone-tax-collector.jpg",
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});

window.DungeonContent.register("monsters", "corpseTideColossus", {
  name: "Corpse-Tide Colossus",
  role: "Mass of corpses that pushes the room",
  sizeSquares: 3,
  tags: ["undead", "zombie", "colossus", "corpse-tide"],
  maxHp: 330,
  category: 8,
  multiattack: { attacks: 2 },
  xp: 7805,
  ac: 18,
  attackBonus: 12,
  damage: {
    count: 7,
    sides: 10,
    bonus: 8,
    type: "bludgeoning",
    attackType: "weapon",
    label: "7d10 + 8 bludgeoning",
    range: {
      kind: "melee",
      feet: 15,
    },
  },
  damageResistances: ["necrotic", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["radiant", "fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion", "prone"],
  specialAbility: [
    "Crushing Wave", // Implemented tide burst: area save or bludgeoning/cold/fire damage and pushed/pulled/slowed.
    "Corpse Tide", // NEW: line or cone push; targets save or are pushed and take bludgeoning/necrotic damage.
  ],
  initiativeBonus: 0,
  speedFeet: 30,
  behavior: "melee",
  token: "C",
  tokenArt: "assets/tokens/corpse-tide-colossus.jpg",
});

window.DungeonContent.register("monsters", "blackMoldCadaver", {
  name: "Black Mold Cadaver",
  role: "Fungal plague zombie",
  tags: ["undead", "zombie", "mold", "plague"],
  maxHp: 286,
  category: 8,
  multiattack: { attacks: 2 },
  xp: 7430,
  ac: 17,
  attackBonus: 12,
  damage: {
    count: 7,
    sides: 6,
    bonus: 8,
    type: "poison",
    attackType: "weapon",
    label: "7d6 + 8 poison",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["necrotic", "poison", "necrotic"],
  damageVulnerabilities: ["radiant", "fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Midnight Spores", // Implemented plague/spore burst: area save or poison/acid damage and possible poisoned effect.
    "Fungal Rebirth", // Implemented death-defiance family: one-time survival at 1 HP.
  ],
  initiativeBonus: 1,
  speedFeet: 25,
  behavior: "melee",
  token: "M",
  tokenArt: "assets/tokens/black-mold-cadaver.jpg",
});

window.DungeonContent.register("monsters", "plagueKingsCarcass", {
  name: "Plague King's Carcass",
  role: "Category 8 zombie boss",
  tags: ["undead", "zombie", "boss", "plague-king"],
  maxHp: 555,
  category: 8,
  xp: 24025,
  ac: 20,
  attackBonus: 13,
  damage: {
    count: 8,
    sides: 8,
    bonus: 9,
    type: "poison",
    attackType: "spell",
    label: "8d8 + 9 poison",
    range: {
      kind: "ranged",
      normal: 90,
      long: 270,
      feet: 90,
    },
  },
  damageResistances: ["necrotic", "bludgeoning", "piercing", "slashing", "poison"],
  damageVulnerabilities: ["radiant", "fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion", "frightened"],
  specialAbility: [
    "Rot Crown Pulse", // Implemented plague burst: area save or poison/acid damage and possible poisoned effect.
    "Plague Breath", // Implemented plague burst: area save or poison/acid damage and possible poisoned effect.
    "Plague King's Mass", // NEW: when damaged, may shed a lesser zombie minion or corpse hazard tile.
  ],
  initiativeBonus: 2,
  speedFeet: 25,
  behavior: "ranged",
  token: "K",
  tokenArt: "assets/tokens/plague-king-s-carcass.jpg",
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});


/* ============================================================
 * CATEGORY 9 — Party Level 17/18
 * ============================================================ */

window.DungeonContent.register("monsters", "paleBellMarrowKnight", {
  name: "Pale-Bell Marrow Knight",
  role: "Skeletal terror knight",
  tags: ["undead", "skeletal", "old-guardroom", "knight", "bell"],
  maxHp: 318,
  category: 9,
  multiattack: { attacks: 3 },
  xp: 9460,
  ac: 23,
  attackBonus: 13,
  damage: {
    count: 8,
    sides: 6,
    bonus: 9,
    type: "necrotic",
    attackType: "weapon",
    label: "8d6 + 9 necrotic",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["necrotic", "poison", "piercing", "slashing", "necrotic", "psychic"],
  damageVulnerabilities: ["bludgeoning", "radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion", "frightened"],
  specialAbility: [
    "White Bell Wail", // Implemented dread burst: area save or psychic/thunder damage and possible fear.
    "Life Drain", // Implemented soul drain rider: Con save or necrotic damage, drained movement, possible healing.
  ],
  initiativeBonus: 5,
  speedFeet: 35,
  behavior: "melee",
  token: "B",
  tokenArt: "assets/tokens/pale-bell-marrow-knight.jpg",
});

window.DungeonContent.register("monsters", "tombStarArbalest", {
  name: "Tomb-Star Arbalest",
  role: "High-tier skeletal artillery",
  tags: ["undead", "skeletal", "old-guardroom", "artillery", "tomb-star"],
  maxHp: 292,
  category: 9,
  xp: 9950,
  ac: 21,
  attackBonus: 13,
  damage: {
    count: 8,
    sides: 8,
    bonus: 9,
    type: "piercing",
    attackType: "weapon",
    label: "8d8 + 9 piercing",
    range: {
      kind: "ranged",
      normal: 150,
      long: 450,
      feet: 150,
    },
  },
  damageResistances: ["necrotic", "poison", "piercing", "slashing", "necrotic"],
  damageVulnerabilities: ["bludgeoning", "radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Prismatic Lance", // Implemented shard/glass rider: Dex save or slashing damage; use as bone-star lance damage.
    "Needle Spray", // Implemented area shard attack: Dex save or slashing damage.
  ],
  initiativeBonus: 4,
  speedFeet: 30,
  behavior: "ranged",
  token: "A",
  tokenArt: "assets/tokens/tomb-star-arbalest.jpg",
});

window.DungeonContent.register("monsters", "ossuaryRegent", {
  name: "Ossuary Regent",
  role: "Category 9 skeletal boss",
  tags: ["undead", "skeletal", "old-guardroom", "boss", "regent"],
  maxHp: 610,
  category: 9,
  xp: 28490,
  ac: 24,
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
  damageResistances: ["necrotic", "poison", "piercing", "slashing", "necrotic", "psychic"],
  damageVulnerabilities: ["bludgeoning", "radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion", "frightened", "charmed"],
  specialAbility: [
    "Royal Wail", // Implemented dread burst: area save or psychic/thunder damage and possible fear.
    "Unburied Retinue", // Implemented/minion-flavored undead special; if not hooked, spawn or empower skeletal allies.
    "Regent's Ossuary Law", // NEW: for one round, heroes damaged by skeletal undead cannot regain HP until the next turn.
  ],
  initiativeBonus: 6,
  speedFeet: 35,
  behavior: "ranged",
  token: "O",
  tokenArt: "assets/tokens/ossuary-regent.jpg",
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});

window.DungeonContent.register("monsters", "thousandStitchCorpseEngine", {
  name: "Thousand-Stitch Corpse Engine",
  role: "Engine of sewn corpses",
  sizeSquares: 3,
  tags: ["undead", "zombie", "stitched", "engine"],
  maxHp: 380,
  category: 9,
  multiattack: { attacks: 3 },
  xp: 10630,
  ac: 20,
  attackBonus: 13,
  damage: {
    count: 8,
    sides: 10,
    bonus: 9,
    type: "bludgeoning",
    attackType: "weapon",
    label: "8d10 + 9 bludgeoning",
    range: {
      kind: "melee",
      feet: 15,
    },
  },
  damageResistances: ["necrotic", "bludgeoning", "piercing", "slashing", "poison"],
  damageVulnerabilities: ["radiant", "fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion", "frightened"],
  specialAbility: [
    "Industrial Catastrophe", // Implemented death burst family: on death, nearby heroes save or take area damage.
    "Undead Fortitude", // Implemented zombie durability; should resist dropping to 0 HP.
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "melee",
  token: "E",
  tokenArt: "assets/tokens/thousand-stitch-corpse-engine.jpg",
});

window.DungeonContent.register("monsters", "hungerPitCorpse", {
  name: "Hunger-Pit Corpse",
  role: "Soul-hungry zombie pit brute",
  tags: ["undead", "zombie", "hunger", "pit"],
  maxHp: 355,
  category: 9,
  multiattack: { attacks: 3 },
  xp: 10285,
  ac: 19,
  attackBonus: 13,
  damage: {
    count: 8,
    sides: 8,
    bonus: 9,
    type: "necrotic",
    attackType: "weapon",
    label: "8d8 + 9 necrotic",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["necrotic", "necrotic", "bludgeoning"],
  damageVulnerabilities: ["radiant", "fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Unending Appetite", // Implemented soul drain/bloodied-style rider: necrotic damage, movement penalty, possible self-heal.
    "Devour Soul", // Implemented life/soul drain: Con save or necrotic damage, drained movement, possible healing.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "H",
  tokenArt: "assets/tokens/hunger-pit-corpse.jpg",
});

window.DungeonContent.register("monsters", "rotSovereignOfTheMassGrave", {
  name: "Rot Sovereign of the Mass Grave",
  role: "Category 9 zombie boss",
  tags: ["undead", "zombie", "boss", "rot-sovereign"],
  maxHp: 640,
  category: 9,
  xp: 31175,
  ac: 21,
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
  damageResistances: ["necrotic", "bludgeoning", "piercing", "slashing", "poison", "necrotic"],
  damageVulnerabilities: ["radiant", "fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion", "frightened"],
  specialAbility: [
    "Drown the World", // Implemented tide-style area burst: save or damage and pushed/pulled/slowed; reflavor as corpses flooding the battlefield.
    "Rot Crown Pulse", // Implemented plague burst: area save or poison/acid damage and possible poisoned effect.
    "Mass Grave Rebuild", // NEW: absorbs corpse tokens/minions to heal, or revives once if enough corpses are nearby.
  ],
  initiativeBonus: 3,
  speedFeet: 30,
  behavior: "ranged",
  token: "S",
  tokenArt: "assets/tokens/rot-sovereign-of-the-mass-grave.jpg",
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});


/* ============================================================
 * CATEGORY 10 — Party Level 19/20
 * ============================================================ */

window.DungeonContent.register("monsters", "ancientBoneTyrant", {
  name: "Ancient Bone Tyrant",
  role: "Legendary skeletal tyrant",
  tags: ["undead", "skeletal", "old-guardroom", "tyrant", "ancient"],
  maxHp: 405,
  category: 10,
  multiattack: { attacks: 4 },
  xp: 9960,
  ac: 24,
  attackBonus: 14,
  damage: {
    count: 9,
    sides: 8,
    bonus: 10,
    type: "slashing",
    attackType: "weapon",
    label: "9d8 + 10 slashing",
    range: {
      kind: "melee",
      feet: 15,
    },
  },
  damageResistances: ["necrotic", "poison", "piercing", "slashing", "necrotic", "psychic"],
  damageVulnerabilities: ["bludgeoning", "radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion", "frightened", "charmed"],
  specialAbility: [
    "King's Return", // Implemented death-defiance family: one-time survival at 1 HP.
    "Tectonic Verdict", // Implemented earth burst: area save or bludgeoning/slashing damage and pushed/shaken.
  ],
  initiativeBonus: 6,
  speedFeet: 40,
  behavior: "melee",
  token: "T",
  tokenArt: "assets/tokens/ancient-bone-tyrant.jpg",
});

window.DungeonContent.register("monsters", "starvedLegionAvatar", {
  name: "Starved Legion Avatar",
  role: "Composite skeleton legion",
  sizeSquares: 2,
  tags: ["undead", "skeletal", "old-guardroom", "legion", "avatar"],
  maxHp: 430,
  category: 10,
  multiattack: { attacks: 4 },
  xp: 11220,
  ac: 23,
  attackBonus: 14,
  damage: {
    count: 9,
    sides: 8,
    bonus: 10,
    type: "necrotic",
    attackType: "weapon",
    label: "9d8 + 10 necrotic",
    range: {
      kind: "melee",
      feet: 15,
    },
  },
  damageResistances: ["necrotic", "poison", "piercing", "slashing", "necrotic", "psychic"],
  damageVulnerabilities: ["bludgeoning", "radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion", "frightened"],
  specialAbility: [
    "Death Choir", // Implemented/known ghost pack special; treat as dread burst or ally-supporting death chant.
    "Shard Burst", // Implemented reactive/death burst family: melee attackers or nearby heroes may take shard damage.
  ],
  initiativeBonus: 5,
  speedFeet: 35,
  behavior: "melee",
  token: "L",
  tokenArt: "assets/tokens/starved-legion-avatar.jpg",
});

window.DungeonContent.register("monsters", "firstSkeletonKing", {
  name: "The First Skeleton King",
  role: "Category 10 skeletal boss",
  tags: ["undead", "skeletal", "old-guardroom", "boss", "king"],
  maxHp: 720,
  category: 10,
  xp: 16685,
  ac: 25,
  attackBonus: 15,
  damage: {
    count: 10,
    sides: 8,
    bonus: 12,
    type: "necrotic",
    attackType: "spell",
    label: "10d8 + 12 necrotic",
    range: {
      kind: "ranged",
      normal: 150,
      long: 450,
      feet: 150,
    },
  },
  damageResistances: ["necrotic", "poison", "piercing", "slashing", "necrotic", "psychic", "cold"],
  damageVulnerabilities: ["bludgeoning", "radiant"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion", "frightened", "charmed"],
  specialAbility: [
    "King's Return", // Implemented death-defiance family: one-time survival at 1 HP.
    "Void Bell Toll", // Implemented dread burst: area save or psychic/thunder damage and possible fear.
    "Crown of Bones", // NEW: boss phase; summons skeletal elites and gives skeletal allies damage resistance until the crown is broken.
  ],
  initiativeBonus: 7,
  speedFeet: 40,
  behavior: "ranged",
  token: "K",
  tokenArt: "assets/tokens/the-first-skeleton-king.jpg",
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});

window.DungeonContent.register("monsters", "worldGraveColossus", {
  name: "World-Grave Colossus",
  role: "Apocalyptic zombie giant",
  sizeSquares: 3,
  tags: ["undead", "zombie", "colossus", "world-grave"],
  maxHp: 460,
  category: 10,
  multiattack: { attacks: 4 },
  xp: 11490,
  ac: 21,
  attackBonus: 14,
  damage: {
    count: 9,
    sides: 10,
    bonus: 10,
    type: "bludgeoning",
    attackType: "weapon",
    label: "9d10 + 10 bludgeoning",
    range: {
      kind: "melee",
      feet: 15,
    },
  },
  damageResistances: ["necrotic", "bludgeoning", "piercing", "slashing", "poison", "necrotic"],
  damageVulnerabilities: ["radiant", "fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion", "frightened"],
  specialAbility: [
    "World-Stamp", // Implemented charge/slam family: moved-far hit adds damage and can shove/knock prone.
    "Gravequake", // Implemented earth/quake style burst: area save or bludgeoning damage and pushed/shaken.
  ],
  initiativeBonus: 0,
  speedFeet: 35,
  behavior: "melee",
  token: "W",
  tokenArt: "assets/tokens/world-grave-colossus.jpg",
});

window.DungeonContent.register("monsters", "crownRotDevourer", {
  name: "Crown-Rot Devourer",
  role: "Royal corpse-eating horror",
  sizeSquares: 2,
  tags: ["undead", "zombie", "devourer", "crown-rot"],
  maxHp: 438,
  category: 10,
  multiattack: { attacks: 4 },
  xp: 12150,
  ac: 20,
  attackBonus: 14,
  damage: {
    count: 9,
    sides: 8,
    bonus: 10,
    type: "necrotic",
    attackType: "weapon",
    label: "9d8 + 10 necrotic",
    range: {
      kind: "melee",
      feet: 15,
    },
  },
  damageResistances: ["necrotic", "bludgeoning", "piercing", "slashing", "poison", "necrotic"],
  damageVulnerabilities: ["radiant", "fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion", "frightened"],
  specialAbility: [
    "Devour Soul", // Implemented life/soul drain: Con save or necrotic damage, drained movement, possible healing.
    "Thousand Maws", // Implemented bloodied finisher: extra damage against targets at or below half HP.
  ],
  initiativeBonus: 3,
  speedFeet: 35,
  behavior: "melee",
  token: "D",
  tokenArt: "assets/tokens/crown-rot-devourer.jpg",
});

window.DungeonContent.register("monsters", "lastCorpseEmperor", {
  name: "The Last Corpse Emperor",
  role: "Category 10 zombie boss",
  tags: ["undead", "zombie", "boss", "emperor"],
  maxHp: 760,
  category: 10,
  xp: 17780,
  ac: 22,
  attackBonus: 15,
  damage: {
    count: 10,
    sides: 8,
    bonus: 12,
    type: "necrotic",
    attackType: "spell",
    label: "10d8 + 12 necrotic",
    range: {
      kind: "ranged",
      normal: 150,
      long: 450,
      feet: 150,
    },
  },
  damageResistances: ["necrotic", "bludgeoning", "piercing", "slashing", "poison", "necrotic", "cold"],
  damageVulnerabilities: ["radiant", "fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion", "frightened", "charmed"],
  specialAbility: [
    "Rot Crown Pulse", // Implemented plague burst: area save or poison/acid damage and possible poisoned effect.
    "Drown the World", // Implemented tide-style area burst: save or damage and pushed/pulled/slowed; reflavor as corpse tide.
    "Imperial Corpse Decree", // NEW: each round either summons a zombie guard, empowers zombie allies, or turns corpse terrain into a hazard.
  ],
  initiativeBonus: 4,
  speedFeet: 30,
  behavior: "ranged",
  token: "E",
  tokenArt: "assets/tokens/the-last-corpse-emperor.jpg",
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});


})();
