(() => {
function feature(id, name, tags, options = {}) {
  window.DungeonContent.register("furniture", id, {
    name,
    kind: options.kind ?? "feature",
    tags: ["furniture", "desert-ruins", "desert", ...tags],
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
const hazardMove = (damage, options = {}) => ({ type: "hazardOnMove", damage, ...options });
const difficult = { type: "difficultTerrain", label: "difficult terrain" };
const cover = (amount = "half") => ({ type: "cover", amount, label: `${amount} cover` });
const concealment = (amount = "partial") => ({ type: "concealment", amount, label: `${amount} concealment` });
const light = (radius = 3) => ({ type: "lightSource", radius });
const destructible = (hp = 10, ac = 12) => ({ type: "destructibleObject", hp, ac });
const inspectEvent = (options = {}) => ({ type: "inspectEvent", dc: options.dc ?? 12, chance: options.chance ?? 1, spawnChance: options.spawnChance ?? 0.5, ...options });
const unique = (options = {}) => ({ type: "uniqueInteraction", dc: options.dc ?? 13, timeSeconds: options.timeSeconds ?? 600, ...options });

feature("sand-drift", "Sand Drift", ["sand", "terrain"], {
  symbol: "~",
  spawnChance: 0.12,
  description: "A wind-piled drift of sand makes footing loose and slow.",
  components: [difficult, concealment()],
});

feature("sun-cracked-obelisk", "Sun-Cracked Obelisk", ["stone", "sun-temple", "arcane"], {
  blocksMovement: true,
  blocksLineOfSight: true,
  inspectable: true,
  symbol: "O",
  weight: 3200,
  spawnChance: 0.06,
  description: "An old obelisk split by heat and time. Something still glints in its carved cracks.",
  components: [cover("full"), hiddenLoot({ dc: 14, item: "crystal-shard", chance: 0.45 }), trap({ chance: 0.18, damage: { count: 1, sides: 6, type: "radiant" } })],
});

feature("broken-amphora", "Broken Amphora", ["clay", "container"], {
  inspectable: true,
  symbol: "a",
  weight: 30,
  spawnChance: 0.08,
  description: "A cracked clay storage jar lies half-buried in sand.",
  components: [hiddenLoot({ dc: 10, reward: "smallGold", chance: 0.55 }), destructible(3, 10)],
});

feature("burial-urn", "Burial Urn", ["clay", "container", "undead", "desert-tomb"], {
  inspectable: true,
  symbol: "u",
  weight: 40,
  spawnChance: 0.07,
  description: "A sealed burial urn, dry as dust and marked with old funerary script.",
  components: [
    inspectEvent({
      dc: 12,
      monsterIds: ["armoryHaunt", "lanternWraith", "graveGhoul", "drownedGhoul", "whisperingShade", "candleflameWisp", "mourningApparition", "graveLanternSpecter"],
      loot: { items: ["bone-dust", "grave-wax"], count: 1 },
    }),
    trap({ chance: 0.12, damage: { count: 1, sides: 4, type: "necrotic" } }),
    unique({ label: "Perform Burial Rite", effect: "burialRite", dc: 14, skills: ["religion", "history"], tooltip: "Religion or History DC 14; takes 10 minutes. Respectfully open it to avoid an undead backlash and recover a burial reagent.", failureDamage: { count: 1, sides: 6, type: "necrotic" } }),
  ],
});

feature("date-palm-skeleton", "Date Palm Skeleton", ["wood", "plant"], {
  blocksMovement: true,
  blocksLineOfSight: true,
  symbol: "P",
  weight: 666,
  spawnChance: 0.05,
  description: "A dead palm trunk leans over the ruin, brittle fronds rattling like old bones.",
  components: [cover("half"), hazardEnter({ count: 1, sides: 4, type: "piercing" }, { once: true })],
});

feature("dry-well", "Dry Well", ["stone", "water"], {
  blocksMovement: true,
  inspectable: true,
  symbol: "W",
  weight: 1800,
  spawnChance: 0.045,
  description: "A stone well gone dry. Salt and old offerings cling to the inner rim.",
  components: [cover("half"), hiddenLoot({ dc: 12, item: "cave-salt", chance: 0.45 })],
});

feature("sun-brazier", "Sun Brazier", ["sun-temple", "fire", "light"], {
  blocksMovement: true,
  inspectable: true,
  symbol: "B",
  weight: 120,
  spawnChance: 0.05,
  description: "A bronze brazier burns with a low, stubborn heat.",
  components: [light(4), hazardEnter({ count: 1, sides: 4, type: "fire" }), unique({ label: "Set Sun Ward", effect: "incenseWard", dc: 13, skills: ["religion", "arcana", "medicine"], resistance: "radiant", timeSeconds: 300, tooltip: "Religion, Arcana, or Medicine DC 13; takes 5 minutes. Gain radiant resistance for the next encounter.", failureDamage: { count: 1, sides: 4, type: "fire" } })],
});

feature("fallen-sandstone-block", "Fallen Sandstone Block", ["stone", "sandstone", "obstacle"], {
  blocksMovement: true,
  symbol: "S",
  weight: 1100,
  spawnChance: 0.1,
  description: "A heavy sandstone block has fallen from the wall or ceiling.",
  components: [cover("half"), destructible(18, 13)],
});

feature("scarab-burrow", "Scarab Burrow", ["beast", "sand", "burrow"], {
  inspectable: true,
  symbol: "b",
  weight: 666,
  spawnChance: 0.045,
  description: "A small burrow breaks the sand crust. Tracks and shed shell fragments surround it.",
  components: [
    inspectEvent({
      dc: 12,
      monsterIds: ["sandScorpion", "bonecrackScorpion"],
      loot: { items: ["beast-claw", "beast-fang", "monster-blood"], count: 1 },
    }),
  ],
});

feature("mirage-crystal", "Mirage Crystal", ["crystal", "arcane"], {
  blocksMovement: true,
  inspectable: true,
  symbol: "*",
  weight: 260,
  spawnChance: 0.04,
  description: "A heat-hazy crystal throws false colors across the floor.",
  components: [hiddenLoot({ dc: 14, item: "crystal-shard", chance: 0.5 }), concealment(), trap({ chance: 0.16, damage: { count: 1, sides: 6, type: "psychic" } }), unique({ label: "Dispel Mirage", effect: "mirageCrystal", dc: 14, skills: ["arcana", "insight"], timeSeconds: 300, tooltip: "Arcana or Insight DC 14; takes 5 minutes. Reveal nearby hidden dangers. Success by 5 grants a mirage decoy.", failureDamage: { count: 1, sides: 6, type: "psychic" } })],
});
})();
