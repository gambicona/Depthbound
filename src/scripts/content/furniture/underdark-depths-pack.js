(() => {
function feature(id, name, tags, options = {}) {
  window.DungeonContent.register("furniture", id, {
    name,
    kind: options.kind ?? "feature",
    tags: ["furniture", "underdark-depths", "underdark", "cave", ...tags],
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
const light = (dimRadius = 3, color = "#77f7cf", brightRadius = 0, lightTone = "fungal") => ({ type: "lightSource", brightRadius, dimRadius, color, lightTone });
const destructible = (hp = 10, ac = 12) => ({ type: "destructibleObject", hp, ac });
const inspectEvent = (options = {}) => ({ type: "inspectEvent", dc: options.dc ?? 13, chance: options.chance ?? 1, spawnChance: options.spawnChance ?? 0.5, ...options });
const unique = (options = {}) => ({ type: "uniqueInteraction", dc: options.dc ?? 13, timeSeconds: options.timeSeconds ?? 600, ...options });

feature("glowcap-grove", "Glowcap Grove", ["fungus", "mushroom", "plant", "light"], {
  blocksMovement: false,
  inspectable: true,
  symbol: "g",
  spawnChance: 0.085,
  description: "A grove of purple glowcaps lights the stone in soft pulses.",
  components: [light(4, "#b78cff", 0, "violet-fungal"), difficult, hiddenLoot({ dc: 12, item: "glowcap", chance: 0.58 }), hazardEnter({ count: 1, sides: 4, type: "poison" }, { chance: 0.14 })],
});

feature("mycelium-nest", "Mycelium Nest", ["fungus", "spore", "nest", "plant"], {
  inspectable: true,
  symbol: "n",
  weight: 45,
  spawnChance: 0.06,
  description: "A soft nest of white mycelium breathes spores through the cracks around it.",
  components: [
    difficult,
    inspectEvent({
      dc: 13,
      monsterIds: ["violetFungusCluster", "shriekerSporecap", "myconidSporeguard", "hookcapMycelialHorror"],
      loot: { items: ["glowspore-dust", "glowcap", "verdant-sap"], count: 1 },
    }),
  ],
});

feature("crystal-stalagmite-cluster", "Crystal Stalagmite Cluster", ["crystal", "stone", "arcane"], {
  blocksMovement: true,
  blocksLineOfSight: true,
  inspectable: true,
  symbol: "*",
  weight: 900,
  spawnChance: 0.075,
  description: "Sharp crystals grow around a stone spike, throwing fractured light across the cave.",
  components: [cover("half"), hiddenLoot({ dc: 13, item: "crystal-shard", chance: 0.5 }), hazardEnter({ count: 1, sides: 4, type: "slashing" })],
});

feature("chitin-husk", "Chitin Husk", ["chitin", "beast", "shell"], {
  blocksMovement: true,
  inspectable: true,
  symbol: "h",
  weight: 180,
  spawnChance: 0.055,
  description: "A split insectoid husk lies dry and pale, its inner shell scraped by mandibles.",
  components: [
    cover("half"),
    hiddenLoot({ dc: 12, item: "beast-claw", chance: 0.35 }),
    hiddenLoot({ dc: 14, item: "spider-silk", chance: 0.24 }),
    trap({ chance: 0.14, damage: { count: 1, sides: 6, type: "piercing" } }),
  ],
});

feature("webbed-egg-sac", "Webbed Egg Sac", ["web", "spider", "eggs", "beast"], {
  inspectable: true,
  symbol: "e",
  weight: 35,
  spawnChance: 0.05,
  description: "A webbed egg sac clings to the rock, twitching with tiny movements inside.",
  components: [
    concealment(),
    inspectEvent({
      dc: 13,
      monsterIds: ["paleCaveSpider", "nightglassSpider", "stonebackBeetle", "razorMandibleBeetle"],
      loot: { items: ["spider-silk", "beast-fang", "beast-claw"], count: 1 },
    }),
    unique({ label: "Extract Egg Material", effect: "eggHarvest", dc: 14, skills: ["nature", "medicine", "animal-handling"], tooltip: "Nature, Medicine, or Animal Handling DC 14; takes 10 minutes. Safely extract webbed biological material.", failureDamage: { count: 1, sides: 6, type: "poison" } }),
  ],
});

feature("blind-stone-idol", "Blind Stone Idol", ["idol", "stone", "psychic"], {
  blocksMovement: true,
  blocksLineOfSight: true,
  inspectable: true,
  symbol: "I",
  weight: 1800,
  spawnChance: 0.04,
  description: "A faceless stone idol stares without eyes. The air around it feels pressed thin.",
  components: [
    cover("full"),
    hiddenLoot({ dc: 15, item: "crystal-shard", chance: 0.34 }),
    hiddenLoot({ dc: 16, item: "glowspore-dust", chance: 0.22 }),
    trap({ chance: 0.24, damage: { count: 2, sides: 6, type: "psychic" } }),
  ],
});

feature("blackwater-spring", "Blackwater Spring", ["water", "spring", "pool"], {
  inspectable: true,
  symbol: "~",
  weight: 20,
  spawnChance: 0.05,
  description: "A spring of cold black water pools in a hollow of stone. Something shines at the bottom.",
  components: [difficult, hiddenLoot({ dc: 13, reward: "smallGold", chance: 0.5 }), trap({ chance: 0.12, damage: { count: 1, sides: 6, type: "cold" } }), unique({ label: "Test the Water", effect: "safePool", dc: 13, skills: ["nature", "medicine", "survival"], timeSeconds: 300, tooltip: "Nature, Medicine, or Survival DC 13; takes 5 minutes. Identify safe water to heal and cleanse.", failureDamage: { count: 1, sides: 6, type: "necrotic" } })],
});

feature("acid-weeping-wall", "Acid-Weeping Wall", ["acid", "wall", "hazard"], {
  blocksMovement: false,
  inspectable: true,
  symbol: "a",
  spawnChance: 0.045,
  placement: "wall-adjacent",
  description: "Thin acid seeps from the wall, hissing through mineral stains.",
  components: [hazardEnter({ count: 1, sides: 6, type: "acid" }), hazardMove({ count: 1, sides: 4, type: "acid" }, { chance: 0.2 }), unique({ label: "Collect Acid", effect: "acidCollect", dc: 14, skills: ["nature", "arcana", "investigation"], tooltip: "Nature, Arcana, or Investigation DC 14; takes 10 minutes. Neutralize and collect acidic reagent.", failureDamage: { count: 1, sides: 6, type: "acid" } })],
});

feature("echo-chasm", "Echo Chasm", ["chasm", "stone", "terrain"], {
  blocksMovement: true,
  blocksLineOfSight: false,
  symbol: "O",
  width: 2,
  height: 1,
  weight: 1500,
  spawnChance: 0.045,
  description: "A narrow chasm drops into blackness. Every sound returns a moment too late.",
  components: [cover("half"), hazardEnter({ count: 2, sides: 6, type: "bludgeoning" }, { once: true })],
});

feature("petrified-mushroom-tree", "Petrified Mushroom Tree", ["fungus", "stone", "mushroom"], {
  blocksMovement: true,
  blocksLineOfSight: true,
  symbol: "M",
  weight: 1200,
  spawnChance: 0.06,
  description: "A huge mushroom has hardened into stone, its cap spreading like a silent roof.",
  components: [cover("full"), destructible(20, 14)],
});
})();
