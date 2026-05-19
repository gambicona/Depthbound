(() => {
function feature(id, name, tags, options = {}) {
  window.DungeonContent.register("furniture", id, {
    name,
    kind: options.kind ?? "feature",
    tags: ["furniture", "depths-of-hells", "hell", "infernal", ...tags],
    width: options.width ?? 1,
    height: options.height ?? 1,
    blocksMovement: Boolean(options.blocksMovement),
    blocksLineOfSight: Boolean(options.blocksLineOfSight),
    inspectable: Boolean(options.inspectable),
    interactable: Boolean(options.inspectable || options.interactable),
    symbol: options.symbol ?? "?",
    spawnChance: options.spawnChance ?? 0.04,
    placement: options.placement ?? "random-room-cell",
    weight: options.weight ?? ((options.width ?? 1) > 1 || (options.height ?? 1) > 1 ? 666 : undefined),
    description: options.description ?? `${name}.`,
    components: options.components ?? [],
  });
}

const hiddenLoot = (options = {}) => ({ type: "hiddenLoot", dc: options.dc ?? 12, chance: options.chance ?? 1, ...options });
const trap = (options = {}) => ({ type: "trap", chance: options.chance ?? 1, ...options });
const hazardEnter = (damage, options = {}) => ({ type: "hazardOnEnter", damage, ...options });
const hazardMove = (damage, options = {}) => ({ type: "hazardOnMovement", damage, ...options });
const difficult = { type: "difficultTerrain", label: "difficult terrain" };
const cover = (amount = "half") => ({ type: "cover", amount, label: `${amount} cover` });
const concealment = (amount = "partial") => ({ type: "concealment", amount, label: `${amount} concealment` });
const light = (radius = 4) => ({ type: "lightSource", radius });
const destructible = (hp = 12, ac = 13) => ({ type: "destructibleObject", hp, ac });
const inspectEvent = (options = {}) => ({ type: "inspectEvent", dc: options.dc ?? 13, chance: options.chance ?? 1, spawnChance: options.spawnChance ?? 0.5, ...options });
const unique = (options = {}) => ({ type: "uniqueInteraction", dc: options.dc ?? 13, timeSeconds: options.timeSeconds ?? 600, ...options });

feature("basalt-column", "Basalt Column", ["basalt", "stone", "obstacle"], {
  blocksMovement: true,
  blocksLineOfSight: true,
  symbol: "C",
  weight: 1500,
  spawnChance: 0.1,
  description: "A black basalt column rises from the floor, cracked by heat and pressure.",
  components: [cover("full"), destructible(24, 15)],
});

feature("ash-drift", "Ash Drift", ["ash", "terrain"], {
  symbol: "~",
  spawnChance: 0.11,
  description: "A drift of hot gray ash muffles steps and hides uneven stone beneath it.",
  components: [difficult, concealment(), hazardMove({ count: 1, sides: 4, type: "fire" }, { chance: 0.2 })],
});

feature("infernal-brazier", "Infernal Brazier", ["fire", "light", "forge"], {
  blocksMovement: true,
  inspectable: true,
  symbol: "B",
  weight: 120,
  spawnChance: 0.07,
  description: "A black iron brazier burns with a steady red flame that never consumes its fuel.",
  components: [light(5), hazardEnter({ count: 1, sides: 6, type: "fire" }), unique({ label: "Set Infernal Ward", effect: "incenseWard", dc: 13, skills: ["religion", "arcana", "medicine"], resistance: "fire", timeSeconds: 300, tooltip: "Religion, Arcana, or Medicine DC 13; takes 5 minutes. Gain fire resistance for the next encounter.", failureDamage: { count: 1, sides: 6, type: "fire" } })],
});

feature("chain-curtain", "Chain Curtain", ["chain", "metal", "obstacle"], {
  blocksMovement: false,
  blocksLineOfSight: true,
  symbol: "|",
  weight: 70,
  spawnChance: 0.065,
  description: "Heavy chains hang from the ceiling in a rattling curtain of hooked iron.",
  components: [difficult, concealment(), hazardMove({ count: 1, sides: 4, type: "slashing" }, { chance: 0.28 })],
});

feature("soul-cage", "Soul Cage", ["soul", "prison", "chain"], {
  blocksMovement: true,
  blocksLineOfSight: true,
  inspectable: true,
  symbol: "G",
  weight: 260,
  spawnChance: 0.055,
  description: "A cage of black iron trembles with pale light and muffled whispers.",
  components: [
    inspectEvent({
      dc: 14,
      monsterIds: ["contractWhelp", "pitImpScout", "spiteMote", "soulLedgerScribe", "infernalSoulReaper", "soulEaterOfTheRift"],
      loot: { items: ["soul-echo", "devil-blood", "demon-ichor"], count: 1 },
    }),
    cover("half"),
    unique({ label: "Free Soul", effect: "soulCage", dc: 16, skills: ["persuasion", "intimidation", "religion"], tooltip: "Persuasion, Intimidation, or Religion DC 16; takes 10 minutes. Free the soul to grant party temporary HP.", failureDamage: { count: 1, sides: 8, type: "psychic" }, failureStatus: { id: "shaken", label: "Shaken", attackBonus: -1, durationRounds: 1 } }),
  ],
});

feature("contract-lectern", "Contract Lectern", ["contract", "script", "caster"], {
  blocksMovement: true,
  inspectable: true,
  symbol: "L",
  weight: 80,
  spawnChance: 0.05,
  description: "A lectern of bone and iron holds curling contracts written in ember-bright script.",
  components: [
    hiddenLoot({ dc: 14, item: "devil-blood", chance: 0.36 }),
    hiddenLoot({ dc: 16, item: "chaos-shard", chance: 0.18 }),
    trap({ chance: 0.22, damage: { count: 2, sides: 6, type: "psychic" } }),
    unique({ label: "Find Loophole", effect: "contractLectern", dc: 15, skills: ["insight", "religion", "deception"], tooltip: "Insight, Religion, or Deception DC 15; takes 10 minutes. Win fire resistance for the next encounter. Success by 5 finds a contract reagent.", failureDamage: { count: 1, sides: 8, type: "psychic" } }),
  ],
});

feature("hell-forge", "Hell Forge", ["forge", "fire", "metal"], {
  blocksMovement: true,
  blocksLineOfSight: true,
  inspectable: true,
  symbol: "F",
  width: 2,
  height: 1,
  weight: 2600,
  spawnChance: 0.045,
  description: "A squat forge glows with banked hellfire and half-melted black iron.",
  components: [
    cover("half"),
    light(5),
    hazardEnter({ count: 1, sides: 8, type: "fire" }),
    hiddenLoot({ dc: 14, item: "infernal-iron-shard", chance: 0.5 }),
    hiddenLoot({ dc: 15, item: "hellfire-ember", chance: 0.3 }),
    unique({ label: "Draw Hellfire", effect: "forgeHeat", dc: 14, skills: ["arcana", "athletics", "investigation"], tooltip: "Arcana, Athletics, or Investigation DC 14; takes 10 minutes. Draw heat into a reagent. Success by 5 empowers weapon fire.", failureDamage: { count: 2, sides: 6, type: "fire" } }),
  ],
});

feature("brimstone-cluster", "Brimstone Cluster", ["brimstone", "stone", "fire"], {
  blocksMovement: true,
  inspectable: true,
  symbol: "S",
  weight: 280,
  spawnChance: 0.075,
  description: "Yellow-black brimstone crystals jut from the basalt and smoke at their edges.",
  components: [cover("half"), hazardEnter({ count: 1, sides: 4, type: "fire" }), hiddenLoot({ dc: 12, item: "brimstone-chunk", chance: 0.45 }), unique({ label: "Draw Brimstone Heat", effect: "forgeHeat", dc: 14, skills: ["arcana", "athletics", "investigation"], tooltip: "Arcana, Athletics, or Investigation DC 14; takes 10 minutes. Draw heat into brimstone.", failureDamage: { count: 1, sides: 6, type: "fire" } })],
});

feature("torture-wheel", "Torture Wheel", ["torture", "machine", "chain"], {
  blocksMovement: true,
  inspectable: true,
  symbol: "W",
  weight: 340,
  spawnChance: 0.045,
  description: "A barbed iron wheel is locked in place, its mechanisms still eager to move.",
  components: [cover("half"), trap({ chance: 0.28, damage: { count: 2, sides: 6, type: "piercing" } }), hiddenLoot({ dc: 13, reward: "smallGold", chance: 0.42 })],
});

feature("iron-maiden-of-hells", "Iron Maiden of Hells", ["torture", "container", "iron"], {
  blocksMovement: true,
  blocksLineOfSight: true,
  inspectable: true,
  symbol: "M",
  weight: 1300,
  spawnChance: 0.035,
  description: "A person-shaped iron cabinet stands closed, hot chains wrapped around its doors.",
  components: [
    inspectEvent({
      dc: 15,
      monsterIds: ["chainSnagDevil", "infernalGaoler", "chainMagistrate", "hellchainExarch", "chainboundPhantom"],
      loot: { items: ["infernal-iron-shard", "devil-blood", "grave-wax"], count: 1 },
    }),
  ],
});

feature("abyssal-rift", "Abyssal Rift", ["rift", "demon", "arcane"], {
  blocksMovement: true,
  blocksLineOfSight: false,
  inspectable: true,
  symbol: "R",
  weight: 666,
  spawnChance: 0.04,
  description: "A jagged tear in the air leaks black wind, sparks, and distant howls.",
  components: [
    light(3),
    hazardEnter({ count: 1, sides: 8, type: "force" }),
    inspectEvent({
      dc: 15,
      monsterIds: ["clawImpOfRuin", "spiteMote", "quasitNeedler", "bloodSmokeHowler", "shadowRiftDemon", "blinkRiftPredator"],
      loot: { items: ["chaos-shard", "demon-ichor", "abyssal-bile"], count: 1 },
    }),
  ],
});

feature("obsidian-throne", "Obsidian Throne", ["obsidian", "throne", "noble"], {
  blocksMovement: true,
  blocksLineOfSight: true,
  inspectable: true,
  symbol: "T",
  width: 2,
  height: 1,
  weight: 2200,
  spawnChance: 0.03,
  description: "A throne of obsidian and red iron radiates command, cruelty, and old ownership.",
  components: [
    cover("half"),
    hiddenLoot({ dc: 16, reward: "smallGold", chance: 0.6 }),
    hiddenLoot({ dc: 18, item: "soul-echo", chance: 0.22 }),
    trap({ chance: 0.25, damage: { count: 2, sides: 8, type: "necrotic" } }),
  ],
});

feature("blood-sigil", "Blood Sigil", ["sigil", "ritual", "floor"], {
  inspectable: true,
  symbol: "*",
  weight: 20,
  spawnChance: 0.055,
  placement: "random-room-cell",
  description: "A wet red sigil stains the floor, pulsing whenever a living creature comes close.",
  components: [
    hazardEnter({ count: 1, sides: 6, type: "necrotic" }, { once: true }),
    hiddenLoot({ dc: 14, item: "devil-blood", chance: 0.32 }),
    trap({ chance: 0.18, damage: { count: 1, sides: 8, type: "necrotic" } }),
  ],
});

feature("screaming-skull-pile", "Screaming Skull Pile", ["bone", "skull", "undead"], {
  blocksMovement: false,
  inspectable: true,
  symbol: "K",
  weight: 35,
  spawnChance: 0.06,
  description: "A pile of skulls clicks and mutters in a dozen dry voices.",
  components: [
    difficult,
    hiddenLoot({ dc: 12, item: "bone-dust", chance: 0.5 }),
    hiddenLoot({ dc: 15, item: "soul-echo", chance: 0.12 }),
    trap({ chance: 0.16, damage: { count: 1, sides: 6, type: "psychic" } }),
  ],
});
})();
