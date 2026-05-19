(() => {
const DEFAULT_RESOURCE_TAGS = ["furniture", "resource-node", "dungeon-resource"];

function minutes(value) {
  return Math.max(1, Math.floor(Number(value) || 1)) * 60;
}

function resourceNode(id, name, tags, options = {}) {
  const reward = {
    itemId: options.itemId,
    baseQuantity: options.baseQuantity ?? 1,
    maxQuantity: options.maxQuantity ?? 4,
    quantityStep: options.quantityStep ?? 5,
  };
  window.DungeonContent.register("furniture", id, {
    name,
    kind: "resource-node",
    tags: [...DEFAULT_RESOURCE_TAGS, ...tags],
    width: options.width ?? 1,
    height: options.height ?? 1,
    blocksMovement: options.blocksMovement ?? true,
    blocksLineOfSight: Boolean(options.blocksLineOfSight),
    inspectable: false,
    interactable: true,
    symbol: options.symbol ?? "#",
    spawnChance: options.spawnChance ?? 0.04,
    placement: options.placement ?? "wall-adjacent",
    weight: options.weight ?? 500,
    description: options.description,
    components: [
      {
        type: "resourceNode",
        ability: options.ability ?? "wis",
        skill: options.skill ?? null,
        dc: options.dc ?? 12,
        timeSeconds: minutes(options.minutes ?? 15),
        rewards: [reward],
        failText: options.failText,
        successText: options.successText,
      },
    ],
  });
}

resourceNode("stone-outcrop", "Stone Outcrop", ["stone", "rock", "cave", "mine", "dungeon", "ruin"], {
  itemId: "stone-chip",
  ability: "con",
  skill: "athletics",
  dc: 12,
  minutes: 20,
  baseQuantity: 1,
  maxQuantity: 5,
  symbol: "S",
  description: "A cracked wall face with usable stone that can be pried loose, if someone is willing to sweat for it.",
});

resourceNode("ore-vein", "Ore Vein", ["ore", "metal", "rock", "cave", "mine", "forge", "industrial"], {
  itemId: "iron-scrap",
  ability: "str",
  skill: "athletics",
  dc: 14,
  minutes: 30,
  baseQuantity: 1,
  maxQuantity: 4,
  symbol: "O",
  description: "Dark iron flecks run through the stone. Mining it takes force, leverage, and patience.",
});

resourceNode("gem-seam", "Gem Seam", ["gem", "crystal", "rock", "cave", "mine", "underdark", "arcane"], {
  itemId: "crystal-shard",
  ability: "int",
  skill: "investigation",
  dc: 15,
  minutes: 25,
  baseQuantity: 1,
  maxQuantity: 3,
  symbol: "*",
  blocksLineOfSight: true,
  description: "Tiny crystal points glimmer in a narrow seam. Careless work shatters the useful pieces.",
});

resourceNode("glowcap-cluster-node", "Glowcap Cluster", ["fungus", "mushroom", "plant", "underdark", "cave", "forage", "alchemy"], {
  itemId: "glowcap",
  ability: "wis",
  skill: "nature",
  dc: 13,
  minutes: 12,
  baseQuantity: 1,
  maxQuantity: 4,
  blocksMovement: false,
  symbol: "g",
  description: "A luminous cluster of cave mushrooms grows along a damp wall. Careful cutting keeps the useful glow intact.",
});

resourceNode("infernal-iron-vein", "Infernal Iron Vein", ["ore", "metal", "iron", "infernal", "hell", "forge", "depths-of-hells"], {
  itemId: "infernal-iron-shard",
  ability: "str",
  skill: "athletics",
  dc: 15,
  minutes: 30,
  baseQuantity: 1,
  maxQuantity: 4,
  symbol: "I",
  blocksLineOfSight: true,
  description: "Black-red iron threads through the basalt like cooled blood. Breaking it free takes brutal, careful work.",
});

resourceNode("brimstone-crust", "Brimstone Crust", ["stone", "brimstone", "sulfur", "fire", "hell", "infernal", "depths-of-hells"], {
  itemId: "brimstone-chunk",
  ability: "con",
  skill: "athletics",
  dc: 13,
  minutes: 20,
  baseQuantity: 1,
  maxQuantity: 5,
  symbol: "B",
  description: "A sulfurous crust clings near a hot wall seam. Harvesting it means working through choking heat.",
});

resourceNode("herb-patch", "Wild Herb Patch", ["herb", "plant", "forest", "wilds", "swamp", "bog", "nature"], {
  itemId: "medicinal-herb",
  ability: "wis",
  skill: "medicine",
  dc: 12,
  minutes: 10,
  baseQuantity: 1,
  maxQuantity: 4,
  blocksMovement: false,
  symbol: "h",
  description: "Useful leaves grow in the shelter of the wall. A careful hand can gather them without spoiling the roots.",
});

resourceNode("vine-thicket-node", "Vine Thicket", ["vine", "plant", "forest", "wilds", "swamp", "bog", "nature"], {
  itemId: "green-vines",
  ability: "wis",
  skill: "nature",
  dc: 10,
  minutes: 10,
  baseQuantity: 1,
  maxQuantity: 5,
  blocksMovement: false,
  symbol: "v",
  description: "Long green vines cling to the stone and can be cut into usable lengths.",
});

resourceNode("briar-root-node", "Black Briar Root Cluster", ["root", "plant", "forest", "wilds", "swamp", "bog", "rot", "nature"], {
  itemId: "black-briar-root",
  ability: "wis",
  skill: "nature",
  dc: 15,
  minutes: 15,
  baseQuantity: 1,
  maxQuantity: 3,
  blocksMovement: false,
  symbol: "r",
  description: "A thorny root cluster pushes through the floor edge. It is useful, but easy to ruin.",
});

resourceNode("fallen-timber-node", "Fallen Timber", ["wood", "forest", "wilds", "ruin", "dungeon", "building"], {
  itemId: "wood-bundle",
  ability: "str",
  skill: "athletics",
  dc: 12,
  minutes: 20,
  baseQuantity: 1,
  maxQuantity: 4,
  blocksMovement: true,
  symbol: "W",
  description: "A broken beam or fallen trunk can be chopped into useful wood bundles.",
});
})();
