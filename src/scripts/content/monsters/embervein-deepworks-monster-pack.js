(() => {

/* ============================================================
 * EMBERVEIN DEEPWORKS MONSTER PACK
 * Dungeon theme name: The Embervein Deepworks
 * Theme: abandoned mine-forge, warped track, ore carts, anvils,
 *        forge furnaces, slag seams, coal dust, tool racks, chain hoists,
 *        steam pipes, pressure valves, broken gear assemblies, oil barrels,
 *        reinforced crates, workbenches, support beams, powder kegs,
 *        and conveyor belts.
 *
 * Notes:
 * - Each category has 3 regular monsters plus 1 boss.
 * - Every monster starts its tags with a D&D 5e creature type.
 * - Special abilities include implementation comments for future mechanics.
 * ============================================================ */


/* ============================================================
 * CATEGORY 1 — Party Level 1/2
 * ============================================================ */

window.DungeonContent.register("monsters", "sootTunnelRat", {
  name: "Soot-Tunnel Rat",
  role: "Fast mine pest",
  tags: ["beast", "mine", "soot", "skirmisher"],
  maxHp: 10,
  category: 1,
  xp: 45,
  ac: 13,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 4,
    bonus: 2,
    type: "piercing",
    attackType: "weapon",
    label: "1d4 + 2 piercing",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: [],
  damageVulnerabilities: ["fire"],
  damageImmunities: [],
  conditionImmunities: [],
  specialAbility: [
    "Dust Bite", // On hit: small chance to give the target -1 attack bonus until the end of its next turn.
  ],
  initiativeBonus: 3,
  speedFeet: 35,
  behavior: "melee",
  token: "R",
  tokenArt: "assets/tokens/soot-tunnel-rat.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "coalDustGoblin", {
  name: "Coal-Dust Goblin",
  role: "Weak ambusher with dirty tricks",
  tags: ["humanoid", "goblin", "mine", "ambusher"],
  maxHp: 12,
  category: 1,
  xp: 55,
  ac: 13,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 6,
    bonus: 1,
    type: "piercing",
    attackType: "weapon",
    label: "1d6 + 1 piercing",
    range: {
      kind: "ranged",
      normal: 30,
      long: 90,
      feet: 30,
    },
  },
  damageResistances: [],
  damageVulnerabilities: [],
  damageImmunities: [],
  conditionImmunities: [],
  specialAbility: [
    "Coal Toss", // Recharge-style trick: 10 ft cone, Dex save or blinded until the end of the target's next turn.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "G",
  tokenArt: "assets/tokens/coal-dust-goblin.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "bentGearScarab", {
  name: "Bent-Gear Scarab",
  role: "Tiny construct crawler",
  tags: ["construct", "gear", "mine", "crawler"],
  maxHp: 14,
  category: 1,
  xp: 65,
  ac: 14,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 6,
    bonus: 2,
    type: "slashing",
    attackType: "weapon",
    label: "1d6 + 2 slashing",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["poison"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Gear Nip", // On hit: target's movement is reduced by 5 ft until the end of its next turn.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "S",
  tokenArt: "assets/tokens/bent-gear-scarab.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "sootbeardShiftBoss", {
  name: "Sootbeard Shift Boss",
  role: "Category 1 mine boss",
  tags: ["humanoid", "dwarf", "duergar", "boss", "overseer"],
  maxHp: 30,
  category: 1,
  xp: 130,
  ac: 14,
  attackBonus: 4,
  damage: {
    count: 1,
    sides: 8,
    bonus: 2,
    type: "bludgeoning",
    attackType: "weapon",
    label: "1d8 + 2 bludgeoning",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: [],
  damageVulnerabilities: [],
  damageImmunities: [],
  conditionImmunities: [],
  specialAbility: [
    "Minecart Shove", // 5 ft line or adjacent target: Str save or pushed 10 ft; extra damage if pushed into furniture.
    "Bark Orders", // Once per fight: one nearby ally gains +2 attack bonus on its next attack.
  ],
  initiativeBonus: 1,
  speedFeet: 25,
  behavior: "melee",
  token: "B",
  tokenArt: "assets/tokens/sootbeard-shift-boss.jpg",
  flying: false,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});


/* ============================================================
 * CATEGORY 2 — Party Level 3/4
 * ============================================================ */

window.DungeonContent.register("monsters", "furnaceMephit", {
  name: "Furnace Mephit",
  role: "Flying fire nuisance",
  tags: ["elemental", "fire", "mephit", "flying"],
  maxHp: 24,
  category: 2,
  xp: 140,
  ac: 13,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 8,
    bonus: 2,
    type: "fire",
    attackType: "spell",
    label: "1d8 + 2 fire",
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
    "Soot Breath", // 15 ft cone, Dex save or takes fire damage and suffers -1 AC for 1 round.
  ],
  initiativeBonus: 3,
  speedFeet: 35,
  behavior: "rangedKiter",
  token: "M",
  tokenArt: "assets/tokens/furnace-mephit.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "oreShellCrawler", {
  name: "Ore-Shell Crawler",
  role: "Armored mine predator",
  tags: ["monstrosity", "ore", "crawler", "mine"],
  maxHp: 32,
  category: 2,
  xp: 170,
  ac: 16,
  attackBonus: 5,
  damage: {
    count: 1,
    sides: 10,
    bonus: 2,
    type: "piercing",
    attackType: "weapon",
    label: "1d10 + 2 piercing",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["bludgeoning"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: [],
  conditionImmunities: [],
  specialAbility: [
    "Crushing Shell", // When hit by a melee attack: small chance to retaliate for minor bludgeoning damage.
  ],
  initiativeBonus: 1,
  speedFeet: 25,
  behavior: "melee",
  token: "C",
  tokenArt: "assets/tokens/ore-shell-crawler.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "deepDwarfChainGuard", {
  name: "Deep Dwarf Chain Guard",
  role: "Mine-owner guard",
  tags: ["humanoid", "dwarf", "duergar", "guard", "chain"],
  maxHp: 28,
  category: 2,
  xp: 160,
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
  damageResistances: ["poison"],
  damageVulnerabilities: [],
  damageImmunities: [],
  conditionImmunities: [],
  specialAbility: [
    "Hook and Drag", // On hit: Str save or pull the target 5 ft toward the guard.
  ],
  initiativeBonus: 1,
  speedFeet: 25,
  behavior: "melee",
  token: "D",
  tokenArt: "assets/tokens/deep-dwarf-chain-guard.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "chainHoistOverseer", {
  name: "Chain-Hoist Overseer",
  role: "Category 2 control boss",
  tags: ["humanoid", "dwarf", "duergar", "boss", "chain"],
  maxHp: 62,
  category: 2,
  xp: 430,
  ac: 16,
  attackBonus: 6,
  damage: {
    count: 2,
    sides: 6,
    bonus: 3,
    type: "slashing",
    attackType: "weapon",
    label: "2d6 + 3 slashing",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["poison"],
  damageVulnerabilities: [],
  damageImmunities: [],
  conditionImmunities: [],
  specialAbility: [
    "Drop the Hook", // Targets a 5 ft square within 30 ft; Dex save or bludgeoning damage and knocked prone.
    "Hoist Prisoner", // On hit: target is restrained until it spends an action or wins a Str save.
  ],
  initiativeBonus: 2,
  speedFeet: 25,
  behavior: "melee",
  token: "O",
  tokenArt: "assets/tokens/chain-hoist-overseer.jpg",
  flying: false,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});


/* ============================================================
 * CATEGORY 3 — Party Level 5/6
 * ============================================================ */

window.DungeonContent.register("monsters", "slagSlime", {
  name: "Slag Slime",
  role: "Burning ooze hazard",
  tags: ["ooze", "slag", "fire", "acid"],
  maxHp: 46,
  category: 3,
  xp: 380,
  ac: 11,
  attackBonus: 6,
  damage: {
    count: 2,
    sides: 6,
    bonus: 3,
    type: "acid",
    attackType: "weapon",
    label: "2d6 + 3 acid",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["fire", "acid"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone"],
  specialAbility: [
    "Molten Trail", // Leaves a temporary hazard on its previous tile; entering it deals minor fire damage.
  ],
  initiativeBonus: -1,
  speedFeet: 20,
  behavior: "melee",
  token: "S",
  tokenArt: "assets/tokens/slag-slime.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "animatedAnvil", {
  name: "Animated Anvil",
  role: "Heavy forge construct",
  tags: ["construct", "forge", "anvil", "brute"],
  maxHp: 58,
  category: 3,
  xp: 470,
  ac: 17,
  attackBonus: 6,
  damage: {
    count: 2,
    sides: 8,
    bonus: 3,
    type: "bludgeoning",
    attackType: "weapon",
    label: "2d8 + 3 bludgeoning",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["poison", "psychic", "bludgeoning"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Anvil Drop", // Short leap or charge: Dex save or heavy bludgeoning damage and knocked prone.
  ],
  initiativeBonus: 0,
  speedFeet: 20,
  behavior: "melee",
  token: "A",
  tokenArt: "assets/tokens/animated-anvil.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "steamPipeGremlin", {
  name: "Steam-Pipe Gremlin",
  role: "Saboteur skirmisher",
  tags: ["fey", "gremlin", "steam", "saboteur"],
  maxHp: 42,
  category: 3,
  xp: 420,
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
  damageResistances: ["fire"],
  damageVulnerabilities: ["cold"],
  damageImmunities: [],
  conditionImmunities: [],
  specialAbility: [
    "Valve Twist", // Opens a nearby steam pipe: line attack, Dex save or fire damage and pushed 5 ft.
  ],
  initiativeBonus: 4,
  speedFeet: 35,
  behavior: "rangedKiter",
  token: "G",
  tokenArt: "assets/tokens/steam-pipe-gremlin.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "furnaceWardGuardian", {
  name: "Furnace-Ward Guardian",
  role: "Category 3 forge boss",
  tags: ["construct", "forge", "boss", "guardian"],
  maxHp: 108,
  category: 3,
  xp: 1050,
  ac: 18,
  attackBonus: 7,
  damage: {
    count: 2,
    sides: 10,
    bonus: 4,
    type: "fire",
    attackType: "weapon",
    label: "2d10 + 4 fire",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["fire", "poison", "psychic", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["cold", "thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Furnace Vent", // 30 ft cone, Dex save or fire damage; creates hot tiles for 1 round.
    "Hard Light of the Forge", // While above half HP, adjacent allies gain +1 AC.
  ],
  initiativeBonus: 1,
  speedFeet: 25,
  behavior: "melee",
  token: "F",
  tokenArt: "assets/tokens/furnace-ward-guardian.jpg",
  flying: false,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});


/* ============================================================
 * CATEGORY 4 — Party Level 7/8
 * ============================================================ */

window.DungeonContent.register("monsters", "magmaVeinLoper", {
  name: "Magma-Vein Loper",
  role: "Fast lava elemental",
  tags: ["elemental", "fire", "earth", "magma", "skirmisher"],
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
    type: "fire",
    attackType: "weapon",
    label: "3d6 + 4 fire",
    range: {
      kind: "melee",
      feet: 5,
    },
  },
  damageResistances: ["fire", "poison", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Lava Step", // After moving at least 20 ft, next hit deals extra fire damage.
  ],
  initiativeBonus: 4,
  speedFeet: 45,
  behavior: "melee",
  token: "L",
  tokenArt: "assets/tokens/magma-vein-loper.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "powderKegSaboteur", {
  name: "Powder-Keg Saboteur",
  role: "Explosive ranged humanoid",
  tags: ["humanoid", "kobold", "mine", "explosive"],
  maxHp: 66,
  category: 4,
  xp: 900,
  ac: 15,
  attackBonus: 8,
  damage: {
    count: 3,
    sides: 6,
    bonus: 4,
    type: "fire",
    attackType: "weapon",
    label: "3d6 + 4 fire",
    range: {
      kind: "ranged",
      normal: 60,
      long: 180,
      feet: 60,
    },
  },
  damageResistances: [],
  damageVulnerabilities: [],
  damageImmunities: [],
  conditionImmunities: [],
  specialAbility: [
    "Throw Keg", // Area attack: 10 ft radius, Dex save or fire/bludgeoning damage; can ignite oil barrels/powder kegs.
  ],
  initiativeBonus: 5,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "K",
  tokenArt: "assets/tokens/powder-keg-saboteur.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "brokenGearHorror", {
  name: "Broken-Gear Horror",
  role: "Grinding construct predator",
  tags: ["construct", "gear", "horror", "mine"],
  maxHp: 88,
  category: 4,
  multiattack: { attacks: 2 },
  xp: 1100,
  ac: 18,
  attackBonus: 8,
  damage: {
    count: 3,
    sides: 8,
    bonus: 4,
    type: "slashing",
    attackType: "weapon",
    label: "3d8 + 4 slashing",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["poison", "psychic", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Grinding Teeth", // On hit: target takes small ongoing slashing damage until it moves away or spends an action clearing gears.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "H",
  tokenArt: "assets/tokens/broken-gear-horror.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "slagmawBrute", {
  name: "Slagmaw Brute",
  role: "Category 4 molten boss",
  tags: ["elemental", "fire", "earth", "slag", "boss"],
  maxHp: 152,
  category: 4,
  multiattack: { attacks: 2 },
  xp: 2400,
  ac: 17,
  attackBonus: 9,
  damage: {
    count: 3,
    sides: 10,
    bonus: 5,
    type: "fire",
    attackType: "weapon",
    label: "3d10 + 5 fire",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["fire", "poison", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion", "prone"],
  specialAbility: [
    "Molten Slag Breath", // 15 ft cone, Dex save or fire damage and slowed by cooling slag.
    "Bright Seam", // At low HP: creates molten slag hazard tiles around itself.
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "melee",
  token: "M",
  tokenArt: "assets/tokens/slagmaw-brute.jpg",
  flying: false,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});


/* ============================================================
 * CATEGORY 5 — Party Level 9/10
 * ============================================================ */

window.DungeonContent.register("monsters", "blackFurnaceDrowOverseer", {
  name: "Black-Furnace Drow Overseer",
  role: "Cruel foundry commander",
  tags: ["humanoid", "drow", "overseer", "underdark"],
  maxHp: 108,
  category: 5,
  xp: 1900,
  ac: 17,
  attackBonus: 9,
  damage: {
    count: 4,
    sides: 6,
    bonus: 5,
    type: "poison",
    attackType: "weapon",
    label: "4d6 + 5 poison",
    range: {
      kind: "ranged",
      normal: 60,
      long: 180,
      feet: 60,
    },
  },
  damageResistances: ["poison"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: [],
  conditionImmunities: [],
  specialAbility: [
    "Sleep Poison Bolt", // On hit: Con save or target loses its reaction and has reduced speed for 1 round.
  ],
  initiativeBonus: 5,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "D",
  tokenArt: "assets/tokens/black-furnace-drow-overseer.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "smokeBelcher", {
  name: "Smoke Belcher",
  role: "Vision-denial elemental",
  tags: ["elemental", "smoke", "air", "fire", "paraelemental"],
  maxHp: 118,
  category: 5,
  xp: 2300,
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
      normal: 60,
      long: 180,
      feet: 60,
    },
  },
  damageResistances: ["fire", "necrotic", "poison", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "grappled", "restrained", "prone", "exhaustion"],
  specialAbility: [
    "Black Smoke Cloud", // Creates a cloud that blocks line of sight and gives ranged attacks through it disadvantage/penalty.
  ],
  initiativeBonus: 3,
  speedFeet: 40,
  behavior: "rangedKiter",
  token: "S",
  tokenArt: "assets/tokens/smoke-belcher.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "awakenedSupportBeam", {
  name: "Awakened Support Beam",
  role: "Living timber wall",
  tags: ["plant", "awakened", "timber", "mine"],
  maxHp: 130,
  category: 5,
  multiattack: { attacks: 2 },
  xp: 2500,
  ac: 16,
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
      feet: 10,
    },
  },
  damageResistances: ["bludgeoning", "piercing"],
  damageVulnerabilities: ["fire"],
  damageImmunities: [],
  conditionImmunities: [],
  specialAbility: [
    "Cave-In Groan", // When bloodied: 10 ft radius, Dex save or bludgeoning damage from falling rock.
  ],
  initiativeBonus: 0,
  speedFeet: 20,
  behavior: "melee",
  token: "B",
  tokenArt: "assets/tokens/awakened-support-beam.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "redValveEngine", {
  name: "Red Valve Engine",
  role: "Category 5 pressure boss",
  tags: ["construct", "engine", "steam", "boss"],
  maxHp: 220,
  category: 5,
  xp: 5200,
  ac: 19,
  attackBonus: 10,
  damage: {
    count: 4,
    sides: 10,
    bonus: 6,
    type: "fire",
    attackType: "spell",
    label: "4d10 + 6 fire",
    range: {
      kind: "ranged",
      normal: 60,
      long: 180,
      feet: 60,
    },
  },
  damageResistances: ["fire", "poison", "psychic", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["cold", "thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Pressure Release", // Rotating line attack each round; Dex save or fire damage and pushed 10 ft.
    "Valve Lock", // Interactable mechanic: using/turning a pressure valve weakens or delays one boss attack.
  ],
  initiativeBonus: 2,
  speedFeet: 20,
  behavior: "ranged",
  token: "V",
  tokenArt: "assets/tokens/red-valve-engine.jpg",
  flying: false,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});


/* ============================================================
 * CATEGORY 6 — Party Level 11/12
 * ============================================================ */

window.DungeonContent.register("monsters", "oreEatingWormling", {
  name: "Ore-Eating Wormling",
  role: "Burrowing mine monstrosity",
  tags: ["monstrosity", "worm", "burrower", "ore"],
  maxHp: 150,
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
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["bludgeoning"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: [],
  conditionImmunities: [],
  specialAbility: [
    "Burst from Below", // If it begins turn unseen or behind cover: appears adjacent to a target and attacks with bonus damage.
  ],
  initiativeBonus: 2,
  speedFeet: 40,
  behavior: "melee",
  token: "W",
  tokenArt: "assets/tokens/ore-eating-wormling.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "hellfireStoker", {
  name: "Hellfire Stoker",
  role: "Infernal forge attendant",
  tags: ["fiend", "devil", "hellfire", "stoker"],
  maxHp: 138,
  category: 6,
  xp: 3800,
  ac: 17,
  attackBonus: 10,
  damage: {
    count: 5,
    sides: 6,
    bonus: 6,
    type: "fire",
    attackType: "spell",
    label: "5d6 + 6 fire",
    range: {
      kind: "ranged",
      normal: 90,
      long: 270,
      feet: 90,
    },
  },
  damageResistances: ["cold", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Stoke the Furnace", // Buffs nearby fire/construct allies: +1 damage die or +2 damage until end of next round.
  ],
  initiativeBonus: 4,
  speedFeet: 30,
  behavior: "ranged",
  token: "H",
  tokenArt: "assets/tokens/hellfire-stoker.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "salamanderForgeNoble", {
  name: "Salamander Forge Noble",
  role: "Elite elemental weaponmaster",
  tags: ["elemental", "fire", "salamander", "forge"],
  maxHp: 176,
  category: 6,
  multiattack: { attacks: 2 },
  xp: 4700,
  ac: 18,
  attackBonus: 11,
  damage: {
    count: 5,
    sides: 8,
    bonus: 6,
    type: "fire",
    attackType: "weapon",
    label: "5d8 + 6 fire",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Heated Coil", // On hit: target makes Str save or is grappled/restrained and takes fire damage each round.
  ],
  initiativeBonus: 4,
  speedFeet: 30,
  behavior: "melee",
  token: "N",
  tokenArt: "assets/tokens/salamander-forge-noble.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "masterOfBrokenGears", {
  name: "Master of Broken Gears",
  role: "Category 6 machine boss",
  tags: ["construct", "gear", "boss", "engineer"],
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
    range: {
      kind: "melee",
      feet: 15,
    },
  },
  damageResistances: ["fire", "poison", "psychic", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion", "prone"],
  specialAbility: [
    "Gear Assembly", // Summons/activates small gear minions from broken gear furniture.
    "Grinding Floor", // Creates a short-lived hazard line; Dex save or slashing damage and slowed.
  ],
  initiativeBonus: 3,
  speedFeet: 30,
  behavior: "melee",
  token: "G",
  tokenArt: "assets/tokens/master-of-broken-gears.jpg",
  flying: false,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});


/* ============================================================
 * CATEGORY 7 — Party Level 13/14
 * ============================================================ */

window.DungeonContent.register("monsters", "adamantineMineGolem", {
  name: "Adamantine Mine Golem",
  role: "Extremely tough construct tank",
  tags: ["construct", "golem", "adamantine", "mine"],
  maxHp: 220,
  category: 7,
  multiattack: { attacks: 2 },
  xp: 6400,
  ac: 21,
  attackBonus: 11,
  damage: {
    count: 6,
    sides: 6,
    bonus: 7,
    type: "bludgeoning",
    attackType: "weapon",
    label: "6d6 + 7 bludgeoning",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["fire", "poison", "psychic", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion"],
  specialAbility: [
    "Adamantine Frame", // Critical hits against this monster become normal hits; thunder damage disables this for 1 round.
  ],
  initiativeBonus: 0,
  speedFeet: 25,
  behavior: "melee",
  token: "A",
  tokenArt: "assets/tokens/adamantine-mine-golem.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "glassSlagElemental", {
  name: "Glass-Slag Elemental",
  role: "Bleeding-shard paraelemental",
  tags: ["elemental", "earth", "fire", "glass", "slag"],
  maxHp: 195,
  category: 7,
  multiattack: { attacks: 2 },
  xp: 7100,
  ac: 19,
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
  damageResistances: ["fire", "poison", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion", "prone"],
  specialAbility: [
    "Shard Burst", // On death or bloodied: 10 ft radius, Dex save or slashing damage.
  ],
  initiativeBonus: 3,
  speedFeet: 35,
  behavior: "melee",
  token: "E",
  tokenArt: "assets/tokens/glass-slag-elemental.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "infernalChainwright", {
  name: "Infernal Chainwright",
  role: "Devil chain controller",
  tags: ["fiend", "devil", "chain", "forge"],
  maxHp: 205,
  category: 7,
  multiattack: { attacks: 2 },
  xp: 8200,
  ac: 19,
  attackBonus: 12,
  damage: {
    count: 6,
    sides: 6,
    bonus: 8,
    type: "slashing",
    attackType: "weapon",
    label: "6d6 + 8 slashing",
    range: {
      kind: "melee",
      feet: 15,
    },
  },
  damageResistances: ["cold", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned"],
  specialAbility: [
    "Living Chain", // Targets up to two enemies within 30 ft; Str save or restrained until escape.
  ],
  initiativeBonus: 5,
  speedFeet: 30,
  behavior: "melee",
  token: "C",
  tokenArt: "assets/tokens/infernal-chainwright.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "ironthaneOfTheDeepworks", {
  name: "Ironthane of the Deepworks",
  role: "Category 7 deep dwarf boss",
  tags: ["humanoid", "dwarf", "duergar", "boss", "thane"],
  maxHp: 390,
  category: 7,
  multiattack: { attacks: 2 },
  xp: 13200,
  ac: 21,
  attackBonus: 12,
  damage: {
    count: 6,
    sides: 8,
    bonus: 8,
    type: "bludgeoning",
    attackType: "weapon",
    label: "6d8 + 8 bludgeoning",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["poison", "psychic"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: [],
  conditionImmunities: [],
  specialAbility: [
    "Enlarge", // Once per fight: grows larger, gaining reach and extra weapon damage for several rounds.
    "Mine Lord's Edict", // Orders all humanoid allies to move or attack immediately.
  ],
  initiativeBonus: 2,
  speedFeet: 25,
  behavior: "melee",
  token: "T",
  tokenArt: "assets/tokens/ironthane-of-the-deepworks.jpg",
  flying: false,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});


/* ============================================================
 * CATEGORY 8 — Party Level 15/16
 * ============================================================ */

window.DungeonContent.register("monsters", "conveyorBeltDevourer", {
  name: "Conveyor-Belt Devourer",
  role: "Industrial maw construct",
  tags: ["construct", "conveyor", "devourer", "forge"],
  maxHp: 270,
  category: 8,
  multiattack: { attacks: 2 },
  xp: 9200,
  ac: 21,
  attackBonus: 12,
  damage: {
    count: 6,
    sides: 10,
    bonus: 8,
    type: "piercing",
    attackType: "weapon",
    label: "6d10 + 8 piercing",
    range: {
      kind: "melee",
      feet: 15,
    },
  },
  damageResistances: ["fire", "poison", "psychic", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion", "prone"],
  specialAbility: [
    "Dragged into the Teeth", // On hit: pulls target 10 ft; if target collides with conveyor/gear furniture, takes extra damage.
  ],
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "melee",
  token: "D",
  tokenArt: "assets/tokens/conveyor-belt-devourer.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "livingBlackOil", {
  name: "Living Black Oil",
  role: "Ignitable toxic ooze",
  tags: ["ooze", "oil", "toxic", "flammable"],
  maxHp: 245,
  category: 8,
  multiattack: { attacks: 2 },
  xp: 10000,
  ac: 14,
  attackBonus: 12,
  damage: {
    count: 6,
    sides: 8,
    bonus: 8,
    type: "poison",
    attackType: "weapon",
    label: "6d8 + 8 poison",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["acid", "necrotic", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["fire"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "prone"],
  specialAbility: [
    "Ignition Flood", // If hit by fire: becomes burning; its attacks deal fire instead of poison but it loses HP each round.
  ],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "O",
  tokenArt: "assets/tokens/living-black-oil.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "volcanicDeepDrake", {
  name: "Volcanic Deep Drake",
  role: "Lava-breath dragonkin",
  tags: ["dragon", "drake", "fire", "underground"],
  maxHp: 292,
  category: 8,
  multiattack: { attacks: 2 },
  xp: 11800,
  ac: 20,
  attackBonus: 13,
  damage: {
    count: 7,
    sides: 6,
    bonus: 8,
    type: "fire",
    attackType: "weapon",
    label: "7d6 + 8 fire",
    range: {
      kind: "melee",
      feet: 10,
    },
  },
  damageResistances: ["fire"],
  damageVulnerabilities: ["cold"],
  damageImmunities: [],
  conditionImmunities: [],
  specialAbility: [
    "Lava Breath", // 30 ft cone, Dex save or heavy fire damage; leaves molten slag tiles briefly.
  ],
  initiativeBonus: 4,
  speedFeet: 40,
  behavior: "melee",
  token: "V",
  tokenArt: "assets/tokens/volcanic-deep-drake.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "forgeheartColossus", {
  name: "Forgeheart Colossus",
  role: "Category 8 construct boss",
  tags: ["construct", "colossus", "forge", "boss"],
  maxHp: 490,
  category: 8,
  multiattack: { attacks: 2 },
  xp: 18400,
  ac: 22,
  attackBonus: 13,
  damage: {
    count: 7,
    sides: 8,
    bonus: 9,
    type: "fire",
    attackType: "weapon",
    label: "7d8 + 9 fire",
    range: {
      kind: "melee",
      feet: 15,
    },
  },
  damageResistances: ["fire", "poison", "psychic", "bludgeoning", "piercing", "slashing", "necrotic"],
  damageVulnerabilities: ["cold", "thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion", "prone"],
  specialAbility: [
    "Forgeheart Pulse", // At the start of each round: fire damage aura grows unless pressure valves are disabled.
    "Colossus Hammerfall", // Large area slam: Dex save or bludgeoning/fire damage and knocked prone.
  ],
  initiativeBonus: 1,
  speedFeet: 25,
  behavior: "melee",
  token: "F",
  tokenArt: "assets/tokens/forgeheart-colossus.jpg",
  flying: false,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});


/* ============================================================
 * CATEGORY 9 — Party Level 17/18
 * ============================================================ */

window.DungeonContent.register("monsters", "emberveinPitEngineer", {
  name: "Embervein Pit Engineer",
  role: "Infernal machine master",
  tags: ["fiend", "devil", "engineer", "hellfire"],
  maxHp: 318,
  category: 9,
  xp: 13800,
  ac: 21,
  attackBonus: 13,
  damage: {
    count: 7,
    sides: 8,
    bonus: 9,
    type: "fire",
    attackType: "spell",
    label: "7d8 + 9 fire",
    range: {
      kind: "ranged",
      normal: 120,
      long: 360,
      feet: 120,
    },
  },
  damageResistances: ["cold", "lightning", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned", "frightened"],
  specialAbility: [
    "Hell-Engine Blueprint", // Summons or repairs one construct ally; if no ally exists, creates a burning gear hazard.
  ],
  initiativeBonus: 6,
  speedFeet: 30,
  behavior: "ranged",
  token: "E",
  tokenArt: "assets/tokens/embervein-pit-engineer.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "oreveinTitan", {
  name: "Orevein Titan",
  role: "Living giant of the mine",
  tags: ["giant", "ore", "titan", "underground"],
  maxHp: 340,
  category: 9,
  multiattack: { attacks: 3 },
  xp: 15000,
  ac: 22,
  attackBonus: 13,
  damage: {
    count: 7,
    sides: 10,
    bonus: 9,
    type: "bludgeoning",
    attackType: "weapon",
    label: "7d10 + 9 bludgeoning",
    range: {
      kind: "melee",
      feet: 15,
    },
  },
  damageResistances: ["bludgeoning", "piercing", "slashing", "fire"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: [],
  conditionImmunities: [],
  specialAbility: [
    "Support-Beam Breaker", // Destroys/throws nearby mine support furniture; creates falling-rock hazard.
  ],
  initiativeBonus: 0,
  speedFeet: 35,
  behavior: "melee",
  token: "T",
  tokenArt: "assets/tokens/orevein-titan.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "pressureCoreElemental", {
  name: "Pressure-Core Elemental",
  role: "Steam and force avatar",
  tags: ["elemental", "air", "fire", "steam", "pressure"],
  maxHp: 302,
  category: 9,
  xp: 16200,
  ac: 21,
  attackBonus: 13,
  damage: {
    count: 7,
    sides: 8,
    bonus: 9,
    type: "force",
    attackType: "spell",
    label: "7d8 + 9 force",
    range: {
      kind: "ranged",
      normal: 120,
      long: 360,
      feet: 120,
    },
  },
  damageResistances: ["fire", "thunder", "poison", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "grappled", "restrained", "prone", "exhaustion"],
  specialAbility: [
    "Overpressure Burst", // 20 ft radius, Con save or force damage and pushed 15 ft; valves can reduce the radius.
  ],
  initiativeBonus: 5,
  speedFeet: 50,
  behavior: "rangedKiter",
  token: "P",
  tokenArt: "assets/tokens/pressure-core-elemental.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "queenOfCindersAndChains", {
  name: "Queen of Cinders and Chains",
  role: "Category 9 infernal boss",
  tags: ["fiend", "devil", "boss", "chain", "fire"],
  maxHp: 575,
  category: 9,
  xp: 22400,
  ac: 23,
  attackBonus: 14,
  damage: {
    count: 8,
    sides: 8,
    bonus: 10,
    type: "fire",
    attackType: "spell",
    label: "8d8 + 10 fire",
    range: {
      kind: "ranged",
      normal: 120,
      long: 360,
      feet: 120,
    },
  },
  damageResistances: ["cold", "lightning", "necrotic", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["radiant"],
  damageImmunities: ["fire", "poison"],
  conditionImmunities: ["poisoned", "charmed", "frightened"],
  specialAbility: [
    "Cinder Chain Judgment", // Targets three enemies; Dex/Str save or fire damage and restrained by chains.
    "Royal Furnace Oath", // At half HP: all active fire/construct hazards trigger once immediately.
  ],
  initiativeBonus: 7,
  speedFeet: 40,
  behavior: "ranged",
  token: "Q",
  tokenArt: "assets/tokens/queen-of-cinders-and-chains.jpg",
  flying: true,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});


/* ============================================================
 * CATEGORY 10 — Party Level 19/20
 * ============================================================ */

window.DungeonContent.register("monsters", "primordialSlagAncient", {
  name: "Primordial Slag Ancient",
  role: "World-old molten elemental",
  tags: ["elemental", "fire", "earth", "slag", "primordial"],
  maxHp: 360,
  category: 10,
  multiattack: { attacks: 3 },
  xp: 18200,
  ac: 23,
  attackBonus: 14,
  damage: {
    count: 8,
    sides: 8,
    bonus: 10,
    type: "fire",
    attackType: "weapon",
    label: "8d8 + 10 fire",
    range: {
      kind: "melee",
      feet: 15,
    },
  },
  damageResistances: ["fire", "poison", "necrotic", "radiant", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["cold"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion", "prone", "grappled", "restrained"],
  specialAbility: [
    "Continental Melt", // Creates a wide molten line; tiles remain hazardous for several rounds unless cooled.
  ],
  initiativeBonus: 2,
  speedFeet: 35,
  behavior: "melee",
  token: "S",
  tokenArt: "assets/tokens/primordial-slag-ancient.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "catastropheEngine", {
  name: "Catastrophe Engine",
  role: "Apocalyptic mining machine",
  tags: ["construct", "engine", "catastrophe", "forge"],
  maxHp: 388,
  category: 10,
  xp: 20500,
  ac: 24,
  attackBonus: 14,
  damage: {
    count: 8,
    sides: 8,
    bonus: 11,
    type: "force",
    attackType: "weapon",
    label: "8d8 + 11 force",
    range: {
      kind: "ranged",
      normal: 150,
      long: 450,
      feet: 150,
    },
  },
  damageResistances: ["fire", "cold", "lightning", "poison", "psychic", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion", "prone", "frightened"],
  specialAbility: [
    "Industrial Catastrophe", // Each round triggers one random foundry hazard: conveyor pull, pressure burst, gear grind, powder ignition, or slag eruption.
  ],
  initiativeBonus: 3,
  speedFeet: 30,
  behavior: "ranged",
  token: "C",
  tokenArt: "assets/tokens/catastrophe-engine.jpg",
  flying: false,
});

window.DungeonContent.register("monsters", "worldAnvilDragon", {
  name: "World-Anvil Dragon",
  role: "Legendary forge dragon",
  tags: ["dragon", "fire", "metal", "forge"],
  maxHp: 375,
  category: 10,
  multiattack: { attacks: 4 },
  xp: 22200,
  ac: 23,
  attackBonus: 14,
  damage: {
    count: 8,
    sides: 10,
    bonus: 10,
    type: "fire",
    attackType: "weapon",
    label: "8d10 + 10 fire",
    range: {
      kind: "melee",
      feet: 15,
    },
  },
  damageResistances: ["fire", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["cold"],
  damageImmunities: [],
  conditionImmunities: ["frightened"],
  specialAbility: [
    "Anvil Breath", // Cone of fire and ringing force; Dex save for fire, Con save or stunned/disabled briefly by thunderous impact.
  ],
  initiativeBonus: 6,
  speedFeet: 80,
  behavior: "melee",
  token: "D",
  tokenArt: "assets/tokens/world-anvil-dragon.jpg",
  flying: true,
});

window.DungeonContent.register("monsters", "theEmberveinAwakened", {
  name: "The Embervein, Awakened",
  role: "Category 10 dungeon-core boss",
  tags: ["elemental", "fire", "earth", "boss", "dungeon-core"],
  maxHp: 680,
  category: 10,
  xp: 30500,
  ac: 24,
  attackBonus: 15,
  damage: {
    count: 9,
    sides: 8,
    bonus: 12,
    type: "fire",
    attackType: "spell",
    label: "9d8 + 12 fire",
    range: {
      kind: "ranged",
      normal: 150,
      long: 450,
      feet: 150,
    },
  },
  damageResistances: ["fire", "poison", "necrotic", "radiant", "lightning", "bludgeoning", "piercing", "slashing"],
  damageVulnerabilities: ["cold", "thunder"],
  damageImmunities: ["poison"],
  conditionImmunities: ["poisoned", "exhaustion", "prone", "grappled", "restrained", "frightened"],
  specialAbility: [
    "Wake the Deepworks", // Boss phase ability: activates every furnace, conveyor, valve, gear, and minecart hazard in the room in sequence.
    "Heart of Ore and Flame", // At low HP: becomes vulnerable to cold/thunder but gains a fire aura and summons slag elementals.
  ],
  initiativeBonus: 5,
  speedFeet: 40,
  behavior: "ranged",
  token: "E",
  tokenArt: "assets/tokens/the-embervein-awakened.jpg",
  flying: false,
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});


[
  "sootTunnelRat",
  "coalDustGoblin",
  "bentGearScarab",
  "sootbeardShiftBoss",
  "furnaceMephit",
  "oreShellCrawler",
  "deepDwarfChainGuard",
  "chainHoistOverseer",
  "slagSlime",
  "animatedAnvil",
  "steamPipeGremlin",
  "furnaceWardGuardian",
  "magmaVeinLoper",
  "powderKegSaboteur",
  "brokenGearHorror",
  "slagmawBrute",
  "blackFurnaceDrowOverseer",
  "smokeBelcher",
  "awakenedSupportBeam",
  "redValveEngine",
  "oreEatingWormling",
  "hellfireStoker",
  "salamanderForgeNoble",
  "masterOfBrokenGears",
  "adamantineMineGolem",
  "glassSlagElemental",
  "infernalChainwright",
  "ironthaneOfTheDeepworks",
  "conveyorBeltDevourer",
  "livingBlackOil",
  "volcanicDeepDrake",
  "forgeheartColossus",
  "emberveinPitEngineer",
  "oreveinTitan",
  "pressureCoreElemental",
  "queenOfCindersAndChains",
  "primordialSlagAncient",
  "catastropheEngine",
  "worldAnvilDragon",
  "theEmberveinAwakened",
].forEach((id) => {
  const monster = window.DungeonContent.get("monsters", id);
  if (!monster) return;
  const tags = Array.from(new Set([...(monster.tags ?? []), "embervein-deepworks", "embervein", "deepworks", "forge", "mine"]));
  window.DungeonContent.register("monsters", id, { ...monster, tags });
});

})();
