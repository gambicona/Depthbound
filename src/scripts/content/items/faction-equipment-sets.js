(() => {
const gp = (amount) => ({ amount, unit: "gp", text: `${amount} gp` });

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function uniqueTags(tags) {
  return Array.from(new Set(tags.filter(Boolean)));
}

function getBaseItem(baseItemId) {
  const base = window.DungeonContent.get("items", baseItemId);
  if (!base) {
    console.warn(`[faction-equipment-sets] Missing base item: ${baseItemId}`);
    return null;
  }
  const copy = clone(base);
  delete copy.id;
  delete copy.baseItemId;
  return copy;
}

function boostedArmor(armor, bonus = 0) {
  if (!armor || !bonus) return armor;
  const next = { ...armor };
  if (typeof next.base === "number") next.base += bonus;
  if (typeof next.bonus === "number") next.bonus += bonus;
  return next;
}

function factionTags(factionId, setId, rarity, extra = []) {
  return uniqueTags([
    "magic",
    "magic-item",
    "faction-set",
    `faction:${factionId}`,
    `set:${setId}`,
    `rarity:${rarity}`,
    ...extra,
  ]);
}

function setPurchase(factionId, tier, goldGp, heroTokens) {
  return {
    factionId,
    minRank: tier,
    goldCp: goldGp * 100,
    heroTokens,
  };
}

function factionSetData(factionId, setId, setName, tier, rarity, slotKey, variantKey = slotKey) {
  return {
    factionId,
    setId,
    setName,
    tier,
    rarity,
    slotKey,
    variantKey,
  };
}

function registerFactionSetWeapon(id, baseItemId, name, set, priceGp, tokenPrice, magic = {}) {
  const base = getBaseItem(baseItemId);
  if (!base) return;
  const attackBonus = magic.attackBonus ?? magic.enhancementBonus ?? 0;
  const damageBonus = magic.damageBonus ?? magic.enhancementBonus ?? 0;
  const extraDamage = Array.isArray(magic.extraDamage) ? magic.extraDamage : magic.extraDamage ? [magic.extraDamage] : [];
  window.DungeonContent.register("items", id, {
    ...base,
    name,
    type: "weapon",
    cost: gp(priceGp),
    requiresAttunement: true,
    baseEquipmentId: baseItemId,
    factionSet: set,
    purchase: setPurchase(set.factionId, set.tier, priceGp, tokenPrice),
    tags: factionTags(set.factionId, set.setId, set.rarity, [
      ...(base.tags ?? []),
      "magic-weapon",
      ...(attackBonus ? [`weapon:+${attackBonus}`] : []),
      ...extraDamage.map((entry) => `damage:${entry.type}`),
      ...(magic.tags ?? []),
    ]),
    store: { buyable: false, sellable: true, factionShop: true },
    loot: { kind: "faction set weapon", rarity: set.rarity, priceGp, priceCp: priceGp * 100, unique: false, dropWeight: 0 },
    magic: {
      kind: "weapon",
      rarity: set.rarity,
      priceGp,
      requiresAttunement: true,
      attackBonus,
      damageBonus,
      extraDamage,
      effects: magic.effects ?? {},
      resistances: magic.resistances ?? [],
      vulnerabilities: magic.vulnerabilities ?? [],
      description: magic.description ?? "",
    },
  });
}

function registerFactionSetArmor(id, baseItemId, name, set, priceGp, tokenPrice, magic = {}) {
  const base = getBaseItem(baseItemId);
  if (!base) return;
  const acBonus = magic.acBonus ?? magic.enhancementBonus ?? 0;
  const resistances = magic.resistances ?? [];
  window.DungeonContent.register("items", id, {
    ...base,
    name,
    type: "armor",
    cost: gp(priceGp),
    requiresAttunement: true,
    armor: boostedArmor(base.armor, acBonus),
    baseEquipmentId: baseItemId,
    factionSet: set,
    purchase: setPurchase(set.factionId, set.tier, priceGp, tokenPrice),
    tags: factionTags(set.factionId, set.setId, set.rarity, [
      ...(base.tags ?? []),
      "magic-armor",
      ...(acBonus ? [`armor:+${acBonus}`] : []),
      ...resistances.map((type) => `resistance:${type}`),
      ...(magic.tags ?? []),
    ]),
    store: { buyable: false, sellable: true, factionShop: true },
    loot: { kind: "faction set armor", rarity: set.rarity, priceGp, priceCp: priceGp * 100, unique: false, dropWeight: 0 },
    magic: {
      kind: "armor",
      rarity: set.rarity,
      priceGp,
      requiresAttunement: true,
      acBonusAppliedToArmor: acBonus,
      effects: magic.effects ?? {},
      resistances,
      vulnerabilities: magic.vulnerabilities ?? [],
      description: magic.description ?? "",
    },
  });
}

function registerFactionSetAccessory(id, name, slots, set, priceGp, tokenPrice, options = {}) {
  const slotList = Array.isArray(slots) ? slots : [slots];
  const effects = options.effects ?? {};
  window.DungeonContent.register("items", id, {
    name,
    type: "accessory",
    category: options.category ?? slotList[0] ?? "accessory",
    cost: gp(priceGp),
    weightLb: options.weightLb ?? 0.25,
    slots: slotList,
    requiresAttunement: true,
    factionSet: set,
    purchase: setPurchase(set.factionId, set.tier, priceGp, tokenPrice),
    tags: factionTags(set.factionId, set.setId, set.rarity, [
      "magic-accessory",
      `slot:${options.category ?? slotList[0] ?? "accessory"}`,
      ...(effects.acBonus ? [`ac:+${effects.acBonus}`] : []),
      ...(effects.speedBonusFeet ? [`speed:+${effects.speedBonusFeet}`] : []),
      ...(effects.initiativeBonus ? [`initiative:+${effects.initiativeBonus}`] : []),
      ...(effects.extraDamage ?? []).map((entry) => `damage:${entry.type}`),
      ...(options.tags ?? []),
    ]),
    store: { buyable: false, sellable: true, factionShop: true },
    loot: { kind: "faction set accessory", rarity: set.rarity, priceGp, priceCp: priceGp * 100, unique: false, dropWeight: 0 },
    magic: {
      kind: "accessory",
      slotGroup: options.category ?? slotList[0] ?? "Accessory",
      rarity: set.rarity,
      priceGp,
      requiresAttunement: true,
      effects,
      description: options.description ?? "",
      implementation: "Passive while equipped and attuned. Counts toward its faction set.",
    },
  });
}

const trophyFactionId = "monster-guild";
const trackfangSetId = "trophy-trackfang";
const trackfangRarity = "uncommon";
const trackfangTier = 1;
const trackfangPriceGp = 1200;
const trackfangTokenPrice = 1;

window.DungeonContent.register("factionSets", trackfangSetId, {
  id: trackfangSetId,
  factionId: trophyFactionId,
  name: "Trackfang Set",
  tier: trackfangTier,
  rarity: trackfangRarity,
  requiredSlotKeys: ["armor", "weapon", "sidearm", "cloak"],
  setBonus: {
    label: "Trackfang Ambush",
    effects: {
      initiativeBonus: 2,
      skillBonus: 1,
      extraDamage: [{ count: 1, sides: 4, type: "piercing" }],
    },
    description: "While all four pieces are equipped and attuned, gain +2 initiative, +1 skill checks, and +1d4 piercing weapon damage.",
  },
  catalogItems: [
    { name: "Trackfang Mail", slotKey: "armor", slot: "Medium armor", effect: "+1 AC and +1 tracking/survival-style checks." },
    { name: "Trackfang Longbow", slotKey: "weapon", slot: "Longbow", effect: "+1 attack/damage and +1d4 piercing damage." },
    { name: "Trackfang Hunting Knife / Fang Talisman", slotKey: "sidearm", slot: "Dagger or amulet", effect: "+1 attack and +1d4 poison damage, or +1 damage and +1d4 poison from the talisman variant." },
    { name: "Trackfang Hunter's Cloak", slotKey: "cloak", slot: "Cloak", effect: "+5 ft speed and +1 initiative." },
  ],
});

window.DungeonContent.register("factionSets", "trophy-briarhook", {
  id: "trophy-briarhook",
  factionId: trophyFactionId,
  name: "Briarhook Set",
  tier: 2,
  rarity: "rare",
  requiredSlotKeys: ["armor", "weapon", "sidearm", "boots"],
  setBonus: {
    label: "Briar Snare",
    effects: {
      speedBonusFeet: 5,
      extraDamage: [{ count: 1, sides: 6, type: "poison" }],
    },
    description: "While all four pieces are attuned, gain +5 ft speed and +1d6 poison weapon damage.",
  },
  catalogItems: [
    { name: "Briarhook Hide", slotKey: "armor", slot: "Hide armor", effect: "+1 AC and poison resistance." },
    { name: "Briarhook Heavy Crossbow", slotKey: "weapon", slot: "Heavy crossbow", effect: "+1 attack/damage and +1d6 piercing against tough quarry." },
    { name: "Briarhook Handaxe / Hatchet Charm", slotKey: "sidearm", slot: "Handaxe or amulet", effect: "+1 attack/damage or +1 weapon damage with +1d4 slashing from the charm variant." },
    { name: "Briarhook Tracking Boots", slotKey: "boots", slot: "Boots", effect: "+10 ft speed and stronger tracking/terrain utility." },
  ],
});

window.DungeonContent.register("factionSets", "trophy-great-quarry", {
  id: "trophy-great-quarry",
  factionId: trophyFactionId,
  name: "Great Quarry Set",
  tier: 3,
  rarity: "very rare",
  requiredSlotKeys: ["armor", "weapon", "amulet", "bracers"],
  setBonus: {
    label: "Bring Down the Quarry",
    effects: {
      saveBonus: 1,
      extraDamage: [{ count: 1, sides: 8, type: "piercing" }],
    },
    description: "While all four pieces are attuned, gain +1 saves and +1d8 piercing weapon damage.",
  },
  catalogItems: [
    { name: "Great Quarry Scale", slotKey: "armor", slot: "Scale mail", effect: "+2 AC and durability against heavy hits." },
    { name: "Great Quarry Pike / Boar Spear", slotKey: "weapon", slot: "Pike or spear", effect: "+2 attack/damage, reach, and +1d8 piercing against bosses or elites." },
    { name: "Great Quarry Trophy Amulet", slotKey: "amulet", slot: "Amulet", effect: "+2 saves against fear/poison and poison resistance." },
    { name: "Great Quarry Bracers", slotKey: "bracers", slot: "Bracers", effect: "+1 AC and +1 melee weapon damage." },
  ],
});

window.DungeonContent.register("factionSets", "trophy-apex-stalker", {
  id: "trophy-apex-stalker",
  factionId: trophyFactionId,
  name: "Apex Stalker Set",
  tier: 4,
  rarity: "legendary",
  requiredSlotKeys: ["armor", "weapon", "sidearm", "cloak"],
  setBonus: {
    label: "Apex Predator",
    effects: {
      attackBonus: 2,
      saveBonus: 2,
      extraDamage: [{ count: 1, sides: 10, type: "piercing" }],
    },
    description: "While all four pieces are attuned, gain +2 attack, +2 saves, and +1d10 piercing weapon damage.",
  },
  catalogItems: [
    { name: "Apex Stalker Half Plate", slotKey: "armor", slot: "Half plate", effect: "+3 AC plus poison and cold resistance." },
    { name: "Apex Greatbow / War Bow", slotKey: "weapon", slot: "Greatbow or war bow", effect: "+3 attack/damage and +1d10 force or piercing against elites/bosses." },
    { name: "Apex Monster-Slayer Axe / Axe Totem", slotKey: "sidearm", slot: "Axe or amulet", effect: "+3 attack/damage, or +2 damage and +1d10 slashing from the totem variant." },
    { name: "Apex Trophy Mantle", slotKey: "cloak", slot: "Cloak", effect: "+2 initiative, +10 ft speed, and strong fear resistance." },
  ],
});

registerFactionSetArmor(
  "faction-trophy-trackfang-mail",
  "chain-shirt",
  "Trackfang Mail",
  factionSetData(trophyFactionId, trackfangSetId, "Trackfang Set", trackfangTier, trackfangRarity, "armor"),
  trackfangPriceGp,
  trackfangTokenPrice,
  {
    enhancementBonus: 1,
    effects: { skillBonus: 1 },
    description: "A quiet chain shirt reinforced with cured scale and hunting charms. Grants +1 AC and +1 to practical tracking and survival checks while attuned.",
  },
);

registerFactionSetWeapon(
  "faction-trophy-trackfang-longbow",
  "longbow",
  "Trackfang Longbow",
  factionSetData(trophyFactionId, trackfangSetId, "Trackfang Set", trackfangTier, trackfangRarity, "weapon", "longbow"),
  trackfangPriceGp,
  trackfangTokenPrice,
  {
    enhancementBonus: 1,
    extraDamage: { count: 1, sides: 4, type: "piercing" },
    description: "A lodge bow strung for killing dangerous quarry. Grants +1 attack and damage, and adds +1d4 piercing damage while attuned.",
  },
);

registerFactionSetWeapon(
  "faction-trophy-trackfang-knife",
  "dagger",
  "Trackfang Hunting Knife",
  factionSetData(trophyFactionId, trackfangSetId, "Trackfang Set", trackfangTier, trackfangRarity, "sidearm", "dagger"),
  trackfangPriceGp,
  trackfangTokenPrice,
  {
    attackBonus: 1,
    damageBonus: 0,
    extraDamage: { count: 1, sides: 4, type: "poison" },
    description: "A narrow hunting knife with a bitter green groove along the edge. Grants +1 attack and adds +1d4 poison damage while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-trophy-trackfang-fang-talisman",
  "Trackfang Fang Talisman",
  "amulet",
  factionSetData(trophyFactionId, trackfangSetId, "Trackfang Set", trackfangTier, trackfangRarity, "sidearm", "fang-talisman"),
  trackfangPriceGp,
  trackfangTokenPrice,
  {
    category: "amulet",
    weightLb: 0.5,
    effects: {
      damageBonus: 1,
      extraDamage: [{ count: 1, sides: 4, type: "poison" }],
    },
    description: "A fang-and-bone hunter charm carrying the Trackfang knife's venom rite without occupying a hand. Counts as the Trackfang sidearm piece, grants +1 weapon damage and +1d4 poison damage while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-trophy-trackfang-cloak",
  "Trackfang Hunter's Cloak",
  "cloak",
  factionSetData(trophyFactionId, trackfangSetId, "Trackfang Set", trackfangTier, trackfangRarity, "cloak"),
  trackfangPriceGp,
  trackfangTokenPrice,
  {
    category: "cloak",
    effects: { speedBonusFeet: 5, initiativeBonus: 1 },
    description: "A weather-dark cloak cut to vanish in brush and broken stone. Grants +5 ft speed and +1 initiative while attuned.",
  },
);

const briarhookSetId = "trophy-briarhook";
const briarhookRarity = "rare";
const briarhookTier = 2;
const briarhookPriceGp = 7500;
const briarhookTokenPrice = 2;

registerFactionSetArmor(
  "faction-trophy-briarhook-hide",
  "hide",
  "Briarhook Hide",
  factionSetData(trophyFactionId, briarhookSetId, "Briarhook Set", briarhookTier, briarhookRarity, "armor"),
  briarhookPriceGp,
  briarhookTokenPrice,
  {
    enhancementBonus: 1,
    resistances: ["poison"],
    description: "Monster-hide armor barbed with thorn-stitching. Grants +1 AC and poison resistance while attuned.",
  },
);

registerFactionSetWeapon(
  "faction-trophy-briarhook-heavy-crossbow",
  "crossbow-heavy",
  "Briarhook Heavy Crossbow",
  factionSetData(trophyFactionId, briarhookSetId, "Briarhook Set", briarhookTier, briarhookRarity, "weapon", "heavy-crossbow"),
  briarhookPriceGp,
  briarhookTokenPrice,
  {
    enhancementBonus: 1,
    extraDamage: { count: 1, sides: 6, type: "piercing" },
    description: "A crossbow built to pin large quarry in place. Grants +1 attack and damage, and adds +1d6 piercing damage while attuned.",
  },
);

registerFactionSetWeapon(
  "faction-trophy-briarhook-handaxe",
  "handaxe",
  "Briarhook Handaxe",
  factionSetData(trophyFactionId, briarhookSetId, "Briarhook Set", briarhookTier, briarhookRarity, "sidearm", "handaxe"),
  briarhookPriceGp,
  briarhookTokenPrice,
  {
    enhancementBonus: 1,
    extraDamage: { count: 1, sides: 4, type: "slashing" },
    description: "A hooked hatchet for close work and thrown finishers. Grants +1 attack and damage, and adds +1d4 slashing damage while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-trophy-briarhook-hatchet-charm",
  "Briarhook Hatchet Charm",
  "amulet",
  factionSetData(trophyFactionId, briarhookSetId, "Briarhook Set", briarhookTier, briarhookRarity, "sidearm", "hatchet-charm"),
  briarhookPriceGp,
  briarhookTokenPrice,
  {
    category: "amulet",
    effects: {
      damageBonus: 1,
      extraDamage: [{ count: 1, sides: 4, type: "slashing" }],
    },
    description: "A hooked hatchet charm worn at the throat. Counts as the Briarhook sidearm piece, grants +1 weapon damage and +1d4 slashing damage while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-trophy-briarhook-boots",
  "Briarhook Tracking Boots",
  "boots",
  factionSetData(trophyFactionId, briarhookSetId, "Briarhook Set", briarhookTier, briarhookRarity, "boots"),
  briarhookPriceGp,
  briarhookTokenPrice,
  {
    category: "boots",
    effects: { speedBonusFeet: 10, skillBonus: 2 },
    description: "Hook-soled boots for following blood trails over bad ground. Grants +10 ft speed and +2 practical tracking checks while attuned.",
  },
);

const greatQuarrySetId = "trophy-great-quarry";
const greatQuarryRarity = "very rare";
const greatQuarryTier = 3;
const greatQuarryPriceGp = 30000;
const greatQuarryTokenPrice = 3;

registerFactionSetArmor(
  "faction-trophy-great-quarry-scale",
  "scale-mail",
  "Great Quarry Scale",
  factionSetData(trophyFactionId, greatQuarrySetId, "Great Quarry Set", greatQuarryTier, greatQuarryRarity, "armor"),
  greatQuarryPriceGp,
  greatQuarryTokenPrice,
  {
    enhancementBonus: 2,
    effects: { maxHpBonus: 8 },
    description: "Heavy scale mail layered from trophies of hard-killed beasts. Grants +2 AC and +8 max HP while attuned.",
  },
);

registerFactionSetWeapon(
  "faction-trophy-great-quarry-pike",
  "pike",
  "Great Quarry Pike",
  factionSetData(trophyFactionId, greatQuarrySetId, "Great Quarry Set", greatQuarryTier, greatQuarryRarity, "weapon", "pike"),
  greatQuarryPriceGp,
  greatQuarryTokenPrice,
  {
    enhancementBonus: 2,
    extraDamage: { count: 1, sides: 8, type: "piercing" },
    description: "A long pike made for stopping charging monsters. Grants +2 attack and damage, and adds +1d8 piercing damage while attuned.",
  },
);

registerFactionSetWeapon(
  "faction-trophy-great-quarry-boar-spear",
  "spear",
  "Great Quarry Boar Spear",
  factionSetData(trophyFactionId, greatQuarrySetId, "Great Quarry Set", greatQuarryTier, greatQuarryRarity, "weapon", "boar-spear"),
  greatQuarryPriceGp,
  greatQuarryTokenPrice,
  {
    enhancementBonus: 2,
    extraDamage: { count: 1, sides: 8, type: "piercing" },
    description: "A reinforced spear with a crossbar below the blade. Grants +2 attack and damage, and adds +1d8 piercing damage while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-trophy-great-quarry-amulet",
  "Great Quarry Trophy Amulet",
  "amulet",
  factionSetData(trophyFactionId, greatQuarrySetId, "Great Quarry Set", greatQuarryTier, greatQuarryRarity, "amulet"),
  greatQuarryPriceGp,
  greatQuarryTokenPrice,
  {
    category: "amulet",
    effects: { saveBonus: 2, resistances: ["poison"] },
    description: "A trophy charm carved from horn, fang, and old scar tissue. Grants +2 saves and poison resistance while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-trophy-great-quarry-bracers",
  "Great Quarry Bracers",
  "bracers",
  factionSetData(trophyFactionId, greatQuarrySetId, "Great Quarry Set", greatQuarryTier, greatQuarryRarity, "bracers"),
  greatQuarryPriceGp,
  greatQuarryTokenPrice,
  {
    category: "bracers",
    effects: { acBonus: 1, damageBonus: 1 },
    description: "Thick hide-and-bronze bracers for bracing into a monster's charge. Grants +1 AC and +1 weapon damage while attuned.",
  },
);

const apexSetId = "trophy-apex-stalker";
const apexRarity = "legendary";
const apexTier = 4;
const apexPriceGp = 120000;
const apexTokenPrice = 4;

registerFactionSetArmor(
  "faction-trophy-apex-stalker-half-plate",
  "half-plate",
  "Apex Stalker Half Plate",
  factionSetData(trophyFactionId, apexSetId, "Apex Stalker Set", apexTier, apexRarity, "armor"),
  apexPriceGp,
  apexTokenPrice,
  {
    enhancementBonus: 3,
    resistances: ["poison", "cold"],
    description: "Legendary half plate built from trophy alloys and monster-bone stays. Grants +3 AC and poison and cold resistance while attuned.",
  },
);

registerFactionSetWeapon(
  "faction-trophy-apex-greatbow",
  "longbow",
  "Apex Greatbow",
  factionSetData(trophyFactionId, apexSetId, "Apex Stalker Set", apexTier, apexRarity, "weapon", "greatbow"),
  apexPriceGp,
  apexTokenPrice,
  {
    enhancementBonus: 3,
    extraDamage: { count: 1, sides: 10, type: "piercing" },
    description: "A huge bow that turns monster trophies into warnings. Grants +3 attack and damage, and adds +1d10 piercing damage while attuned.",
  },
);

registerFactionSetWeapon(
  "faction-trophy-apex-war-bow",
  "longbow",
  "Apex War Bow",
  factionSetData(trophyFactionId, apexSetId, "Apex Stalker Set", apexTier, apexRarity, "weapon", "war-bow"),
  apexPriceGp,
  apexTokenPrice,
  {
    enhancementBonus: 3,
    extraDamage: { count: 1, sides: 10, type: "force" },
    description: "A war bow bound with monster sinew and force-etched horn. Grants +3 attack and damage, and adds +1d10 force damage while attuned.",
  },
);

registerFactionSetWeapon(
  "faction-trophy-apex-monster-slayer-axe",
  "battleaxe",
  "Apex Monster-Slayer Axe",
  factionSetData(trophyFactionId, apexSetId, "Apex Stalker Set", apexTier, apexRarity, "sidearm", "axe"),
  apexPriceGp,
  apexTokenPrice,
  {
    enhancementBonus: 3,
    extraDamage: { count: 1, sides: 10, type: "slashing" },
    description: "A legendary axe for close work after the first shot lands. Grants +3 attack and damage, and adds +1d10 slashing damage while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-trophy-apex-axe-totem",
  "Apex Axe Totem",
  "amulet",
  factionSetData(trophyFactionId, apexSetId, "Apex Stalker Set", apexTier, apexRarity, "sidearm", "axe-totem"),
  apexPriceGp,
  apexTokenPrice,
  {
    category: "amulet",
    effects: {
      damageBonus: 2,
      extraDamage: [{ count: 1, sides: 10, type: "slashing" }],
    },
    description: "A trophy totem carved in the shape of an executioner's axe. Counts as the Apex sidearm piece, grants +2 weapon damage and +1d10 slashing damage while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-trophy-apex-trophy-mantle",
  "Apex Trophy Mantle",
  "cloak",
  factionSetData(trophyFactionId, apexSetId, "Apex Stalker Set", apexTier, apexRarity, "cloak"),
  apexPriceGp,
  apexTokenPrice,
  {
    category: "cloak",
    effects: { initiativeBonus: 2, speedBonusFeet: 10, saveBonus: 2 },
    description: "A legendary mantle sewn with tokens from impossible kills. Grants +2 initiative, +10 ft speed, and +2 saves while attuned.",
  },
);

const gravebinderFactionId = "gravebinders";

const gravesaltSetId = "gravebinder-gravesalt";
const gravesaltRarity = "uncommon";
const gravesaltTier = 1;
const gravesaltPriceGp = 1200;
const gravesaltTokenPrice = 1;

window.DungeonContent.register("factionSets", gravesaltSetId, {
  id: gravesaltSetId,
  factionId: gravebinderFactionId,
  name: "Gravesalt Set",
  tier: gravesaltTier,
  rarity: gravesaltRarity,
  requiredSlotKeys: ["armor", "shield", "weapon", "amulet"],
  setBonus: {
    label: "Salt Circle",
    effects: {
      acBonus: 1,
      extraDamage: [{ count: 1, sides: 4, type: "radiant" }],
    },
    description: "While four Gravesalt pieces are equipped and attuned, gain +1 AC and +1d4 radiant weapon damage.",
  },
  catalogItems: [
    { name: "Gravesalt Chain Shirt", slotKey: "armor", slot: "Chain shirt", effect: "+1 AC and necrotic resistance." },
    { name: "Gravesalt Shield", slotKey: "shield", slot: "Shield", effect: "+1 shield AC and +1 saves." },
    { name: "Gravesalt Mace", slotKey: "weapon", slot: "Mace", effect: "+1 attack/damage and +1d4 radiant damage." },
    { name: "Gravesalt Charm", slotKey: "amulet", slot: "Amulet", effect: "+1 saves and necrotic resistance." },
  ],
});

const candlewardenSetId = "gravebinder-candlewarden";
const candlewardenRarity = "rare";
const candlewardenTier = 2;
const candlewardenPriceGp = 7500;
const candlewardenTokenPrice = 2;

window.DungeonContent.register("factionSets", candlewardenSetId, {
  id: candlewardenSetId,
  factionId: gravebinderFactionId,
  name: "Candlewarden Set",
  tier: candlewardenTier,
  rarity: candlewardenRarity,
  requiredSlotKeys: ["armor", "shield", "weapon", "lantern"],
  setBonus: {
    label: "No Grave Opens",
    effects: {
      maxHpBonus: 12,
      saveBonus: 1,
      resistances: ["necrotic"],
    },
    description: "While four Candlewarden pieces are equipped and attuned, gain +12 max HP, +1 saves, and necrotic resistance.",
  },
  catalogItems: [
    { name: "Candlewarden Chain Mail", slotKey: "armor", slot: "Chain mail", effect: "+1 AC and necrotic resistance." },
    { name: "Candlewarden Shield", slotKey: "shield", slot: "Shield", effect: "+1 shield AC and +8 max HP." },
    { name: "Candlewarden Longsword", slotKey: "weapon", slot: "Longsword", effect: "+1 attack/damage and +1d6 radiant damage." },
    { name: "Candlewarden Warding Lantern", slotKey: "lantern", slot: "Belt or off hand", effect: "+2 saves and +1 initiative." },
  ],
});

const ashboundSetId = "gravebinder-ashbound";
const ashboundRarity = "very rare";
const ashboundTier = 3;
const ashboundPriceGp = 30000;
const ashboundTokenPrice = 3;

window.DungeonContent.register("factionSets", ashboundSetId, {
  id: ashboundSetId,
  factionId: gravebinderFactionId,
  name: "Ashbound Set",
  tier: ashboundTier,
  rarity: ashboundRarity,
  requiredSlotKeys: ["armor", "weapon", "cloak", "ring"],
  setBonus: {
    label: "Ashen Reprieve",
    effects: {
      maxHpBonus: 12,
      saveBonus: 1,
      extraDamage: [{ count: 1, sides: 6, type: "radiant" }],
    },
    description: "While four Ashbound pieces are equipped and attuned, gain +12 max HP, +1 saves, and +1d6 radiant weapon damage.",
  },
  catalogItems: [
    { name: "Ashbound Splint", slotKey: "armor", slot: "Splint armor", effect: "+2 AC and necrotic resistance." },
    { name: "Ashbound Warhammer", slotKey: "weapon", slot: "Warhammer", effect: "+2 attack/damage and +1d8 radiant damage." },
    { name: "Ashbound Cloak", slotKey: "cloak", slot: "Cloak", effect: "Fire and necrotic resistance, +2 saves." },
    { name: "Ashbound Ring", slotKey: "ring", slot: "Ring", effect: "+1 AC and +10 max HP." },
  ],
});

const sepulcherSetId = "gravebinder-sepulcher-oath";
const sepulcherRarity = "legendary";
const sepulcherTier = 4;
const sepulcherPriceGp = 120000;
const sepulcherTokenPrice = 4;

window.DungeonContent.register("factionSets", sepulcherSetId, {
  id: sepulcherSetId,
  factionId: gravebinderFactionId,
  name: "Sepulcher Oath Set",
  tier: sepulcherTier,
  rarity: sepulcherRarity,
  requiredSlotKeys: ["armor", "shield", "weapon", "head"],
  setBonus: {
    label: "Oath Against the Last Door",
    effects: {
      maxHpBonus: 20,
      immunities: ["necrotic"],
      extraDamage: [{ count: 1, sides: 10, type: "radiant" }],
    },
    description: "While four Sepulcher Oath pieces are equipped and attuned, gain +20 max HP, necrotic immunity, and +1d10 radiant weapon damage.",
  },
  catalogItems: [
    { name: "Sepulcher Oath Plate", slotKey: "armor", slot: "Plate armor", effect: "+3 AC, +12 max HP, and necrotic resistance." },
    { name: "Sepulcher Oath Tower Shield / Kite Shield / Shield Sigil", slotKey: "shield", slot: "Shield or amulet", effect: "+2 shield AC and +2 saves, or a shield-sigil variant for two-handed weapon users." },
    { name: "Sepulcher Executioner's Sword / Greatsword", slotKey: "weapon", slot: "Longsword or greatsword", effect: "+3 attack/damage and +1d10 radiant damage." },
    { name: "Crownless Helm", slotKey: "head", slot: "Head", effect: "+3 saves and +1 initiative." },
  ],
});

registerFactionSetArmor(
  "faction-gravebinder-gravesalt-chain-shirt",
  "chain-shirt",
  "Gravesalt Chain Shirt",
  factionSetData(gravebinderFactionId, gravesaltSetId, "Gravesalt Set", gravesaltTier, gravesaltRarity, "armor"),
  gravesaltPriceGp,
  gravesaltTokenPrice,
  {
    enhancementBonus: 1,
    resistances: ["necrotic"],
    description: "A salt-stiff chain shirt worked with candle-white links. Grants +1 AC and necrotic resistance while attuned.",
  },
);

registerFactionSetArmor(
  "faction-gravebinder-gravesalt-shield",
  "shield",
  "Gravesalt Shield",
  factionSetData(gravebinderFactionId, gravesaltSetId, "Gravesalt Set", gravesaltTier, gravesaltRarity, "shield"),
  gravesaltPriceGp,
  gravesaltTokenPrice,
  {
    enhancementBonus: 1,
    effects: { saveBonus: 1 },
    description: "A grave-salt shield etched with boundary prayers. Grants +1 shield AC and +1 saves while attuned.",
  },
);

registerFactionSetWeapon(
  "faction-gravebinder-gravesalt-mace",
  "mace",
  "Gravesalt Mace",
  factionSetData(gravebinderFactionId, gravesaltSetId, "Gravesalt Set", gravesaltTier, gravesaltRarity, "weapon"),
  gravesaltPriceGp,
  gravesaltTokenPrice,
  {
    enhancementBonus: 1,
    extraDamage: { count: 1, sides: 4, type: "radiant" },
    description: "A mace packed with blessed salt beneath the head. Grants +1 attack and damage, and +1d4 radiant damage while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-gravebinder-gravesalt-charm",
  "Gravesalt Charm",
  "amulet",
  factionSetData(gravebinderFactionId, gravesaltSetId, "Gravesalt Set", gravesaltTier, gravesaltRarity, "amulet"),
  gravesaltPriceGp,
  gravesaltTokenPrice,
  {
    category: "amulet",
    effects: { saveBonus: 1, resistances: ["necrotic"] },
    description: "A small wax-sealed packet of grave salt and names. Grants +1 saves and necrotic resistance while attuned.",
  },
);

registerFactionSetArmor(
  "faction-gravebinder-candlewarden-chain-mail",
  "chain-mail",
  "Candlewarden Chain Mail",
  factionSetData(gravebinderFactionId, candlewardenSetId, "Candlewarden Set", candlewardenTier, candlewardenRarity, "armor"),
  candlewardenPriceGp,
  candlewardenTokenPrice,
  {
    enhancementBonus: 1,
    resistances: ["necrotic"],
    description: "Heavy mail blackened by candle smoke and polished at the warding links. Grants +1 AC and necrotic resistance while attuned.",
  },
);

registerFactionSetArmor(
  "faction-gravebinder-candlewarden-shield",
  "shield",
  "Candlewarden Shield",
  factionSetData(gravebinderFactionId, candlewardenSetId, "Candlewarden Set", candlewardenTier, candlewardenRarity, "shield"),
  candlewardenPriceGp,
  candlewardenTokenPrice,
  {
    enhancementBonus: 1,
    effects: { maxHpBonus: 8 },
    description: "A shield inset with a protected votive flame. Grants +1 shield AC and +8 max HP while attuned.",
  },
);

registerFactionSetWeapon(
  "faction-gravebinder-candlewarden-longsword",
  "longsword",
  "Candlewarden Longsword",
  factionSetData(gravebinderFactionId, candlewardenSetId, "Candlewarden Set", candlewardenTier, candlewardenRarity, "weapon"),
  candlewardenPriceGp,
  candlewardenTokenPrice,
  {
    enhancementBonus: 1,
    extraDamage: { count: 1, sides: 6, type: "radiant" },
    description: "A warding blade that burns like a covered candle. Grants +1 attack and damage, and +1d6 radiant damage while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-gravebinder-candlewarden-lantern",
  "Candlewarden Warding Lantern",
  ["belt1", "belt2", "belt3", "belt4", "belt5", "offHand"],
  factionSetData(gravebinderFactionId, candlewardenSetId, "Candlewarden Set", candlewardenTier, candlewardenRarity, "lantern"),
  candlewardenPriceGp,
  candlewardenTokenPrice,
  {
    category: "lantern",
    weightLb: 2,
    effects: { saveBonus: 2, initiativeBonus: 1 },
    tags: ["light", "lantern"],
    description: "A hooded grave lantern whose flame leans away from restless dead. Grants +2 saves and +1 initiative while attuned.",
  },
);

registerFactionSetArmor(
  "faction-gravebinder-ashbound-splint",
  "splint",
  "Ashbound Splint",
  factionSetData(gravebinderFactionId, ashboundSetId, "Ashbound Set", ashboundTier, ashboundRarity, "armor"),
  ashboundPriceGp,
  ashboundTokenPrice,
  {
    enhancementBonus: 2,
    resistances: ["necrotic"],
    description: "Splint armor sealed in ash from sanctified pyres. Grants +2 AC and necrotic resistance while attuned.",
  },
);

registerFactionSetWeapon(
  "faction-gravebinder-ashbound-warhammer",
  "warhammer",
  "Ashbound Warhammer",
  factionSetData(gravebinderFactionId, ashboundSetId, "Ashbound Set", ashboundTier, ashboundRarity, "weapon"),
  ashboundPriceGp,
  ashboundTokenPrice,
  {
    enhancementBonus: 2,
    extraDamage: { count: 1, sides: 8, type: "radiant" },
    description: "A hammer blackened by funeral fires and bright along its striking face. Grants +2 attack and damage, and +1d8 radiant damage while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-gravebinder-ashbound-cloak",
  "Ashbound Cloak",
  "cloak",
  factionSetData(gravebinderFactionId, ashboundSetId, "Ashbound Set", ashboundTier, ashboundRarity, "cloak"),
  ashboundPriceGp,
  ashboundTokenPrice,
  {
    category: "cloak",
    weightLb: 1,
    effects: { saveBonus: 2, resistances: ["fire", "necrotic"] },
    description: "A cloak that smells faintly of clean ash and old incense. Grants +2 saves and resistance to fire and necrotic damage while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-gravebinder-ashbound-ring",
  "Ashbound Ring",
  ["ring1", "ring2"],
  factionSetData(gravebinderFactionId, ashboundSetId, "Ashbound Set", ashboundTier, ashboundRarity, "ring"),
  ashboundPriceGp,
  ashboundTokenPrice,
  {
    category: "ring",
    effects: { acBonus: 1, maxHpBonus: 10 },
    description: "A ring of dark silver that leaves ash on the skin. Grants +1 AC and +10 max HP while attuned.",
  },
);

registerFactionSetArmor(
  "faction-gravebinder-sepulcher-oath-plate",
  "plate",
  "Sepulcher Oath Plate",
  factionSetData(gravebinderFactionId, sepulcherSetId, "Sepulcher Oath Set", sepulcherTier, sepulcherRarity, "armor"),
  sepulcherPriceGp,
  sepulcherTokenPrice,
  {
    enhancementBonus: 3,
    resistances: ["necrotic"],
    effects: { maxHpBonus: 12 },
    description: "Legendary plate engraved with vows spoken at sealed tombs. Grants +3 AC, +12 max HP, and necrotic resistance while attuned.",
  },
);

registerFactionSetArmor(
  "faction-gravebinder-sepulcher-tower-shield",
  "shield",
  "Sepulcher Oath Tower Shield",
  factionSetData(gravebinderFactionId, sepulcherSetId, "Sepulcher Oath Set", sepulcherTier, sepulcherRarity, "shield", "tower-shield"),
  sepulcherPriceGp,
  sepulcherTokenPrice,
  {
    enhancementBonus: 2,
    effects: { saveBonus: 2 },
    description: "A towering shield painted like a sealed mausoleum door. Grants +2 shield AC and +2 saves while attuned.",
  },
);

registerFactionSetArmor(
  "faction-gravebinder-sepulcher-kite-shield",
  "shield",
  "Sepulcher Oath Kite Shield",
  factionSetData(gravebinderFactionId, sepulcherSetId, "Sepulcher Oath Set", sepulcherTier, sepulcherRarity, "shield", "kite-shield"),
  sepulcherPriceGp,
  sepulcherTokenPrice,
  {
    enhancementBonus: 2,
    effects: { saveBonus: 2 },
    description: "A kite shield edged with silver oath-script. Grants +2 shield AC and +2 saves while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-gravebinder-sepulcher-shield-sigil",
  "Sepulcher Oath Shield Sigil",
  "amulet",
  factionSetData(gravebinderFactionId, sepulcherSetId, "Sepulcher Oath Set", sepulcherTier, sepulcherRarity, "shield", "shield-sigil"),
  sepulcherPriceGp,
  sepulcherTokenPrice,
  {
    category: "amulet",
    effects: { acBonus: 2, saveBonus: 2 },
    description: "A silver door-sigil worn by two-handed oathkeepers. Counts as the Sepulcher shield piece, granting +2 AC and +2 saves while attuned.",
  },
);

registerFactionSetWeapon(
  "faction-gravebinder-sepulcher-executioner-sword",
  "longsword",
  "Sepulcher Executioner's Sword",
  factionSetData(gravebinderFactionId, sepulcherSetId, "Sepulcher Oath Set", sepulcherTier, sepulcherRarity, "weapon", "executioner-sword"),
  sepulcherPriceGp,
  sepulcherTokenPrice,
  {
    enhancementBonus: 3,
    extraDamage: { count: 1, sides: 10, type: "radiant" },
    description: "A broad oath-sword for ending what should already be dead. Grants +3 attack and damage, and +1d10 radiant damage while attuned.",
  },
);

registerFactionSetWeapon(
  "faction-gravebinder-sepulcher-greatsword",
  "greatsword",
  "Sepulcher Oath Greatsword",
  factionSetData(gravebinderFactionId, sepulcherSetId, "Sepulcher Oath Set", sepulcherTier, sepulcherRarity, "weapon", "greatsword"),
  sepulcherPriceGp,
  sepulcherTokenPrice,
  {
    enhancementBonus: 3,
    extraDamage: { count: 1, sides: 10, type: "radiant" },
    description: "A two-handed graveblade that hums near open tombs. Grants +3 attack and damage, and +1d10 radiant damage while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-gravebinder-sepulcher-crownless-helm",
  "Crownless Helm",
  "head",
  factionSetData(gravebinderFactionId, sepulcherSetId, "Sepulcher Oath Set", sepulcherTier, sepulcherRarity, "head"),
  sepulcherPriceGp,
  sepulcherTokenPrice,
  {
    category: "head",
    weightLb: 3,
    effects: { saveBonus: 3, initiativeBonus: 1 },
    description: "A helm with the crown deliberately broken away. Grants +3 saves and +1 initiative while attuned.",
  },
);

const crucibleFactionId = "crucible-collegium";

const apprenticeCrucibleSetId = "crucible-apprentice";
const apprenticeCrucibleRarity = "uncommon";
const apprenticeCrucibleTier = 1;
const apprenticeCruciblePriceGp = 1200;
const apprenticeCrucibleTokenPrice = 1;

window.DungeonContent.register("factionSets", apprenticeCrucibleSetId, {
  id: apprenticeCrucibleSetId,
  factionId: crucibleFactionId,
  name: "Apprentice Crucible Set",
  tier: apprenticeCrucibleTier,
  rarity: apprenticeCrucibleRarity,
  requiredSlotKeys: ["armor", "weapon", "ring", "gloves"],
  setBonus: {
    label: "Stable Reaction",
    effects: {
      saveBonus: 1,
      resistances: ["fire"],
      extraDamage: [{ count: 1, sides: 4, type: "fire" }],
    },
    description: "While four Apprentice Crucible pieces are equipped and attuned, gain +1 saves, fire resistance, and +1d4 fire weapon damage.",
  },
  catalogItems: [
    { name: "Apprentice Crucible Robe", slotKey: "armor", slot: "Light armor", effect: "+1 AC and fire resistance." },
    { name: "Apprentice Crucible Quarterstaff", slotKey: "weapon", slot: "Quarterstaff", effect: "+1 attack/damage and +1d4 fire damage." },
    { name: "Apprentice Focus Ring", slotKey: "ring", slot: "Ring", effect: "+1 attack and +1 saves." },
    { name: "Crucible Gloves", slotKey: "gloves", slot: "Gauntlets", effect: "+1 damage and +1 initiative." },
  ],
});

const riftSavantSetId = "crucible-rift-savant";
const riftSavantRarity = "rare";
const riftSavantTier = 2;
const riftSavantPriceGp = 7500;
const riftSavantTokenPrice = 2;

window.DungeonContent.register("factionSets", riftSavantSetId, {
  id: riftSavantSetId,
  factionId: crucibleFactionId,
  name: "Rift-Savant Set",
  tier: riftSavantTier,
  rarity: riftSavantRarity,
  requiredSlotKeys: ["armor", "weapon", "amulet", "boots"],
  setBonus: {
    label: "Controlled Rift",
    effects: {
      speedBonusFeet: 10,
      initiativeBonus: 1,
      extraDamage: [{ count: 1, sides: 6, type: "force" }],
    },
    description: "While four Rift-Savant pieces are equipped and attuned, gain +10 ft speed, +1 initiative, and +1d6 force weapon damage.",
  },
  catalogItems: [
    { name: "Rift-Savant Reinforced Coat", slotKey: "armor", slot: "Light armor", effect: "+1 AC and fire/cold resistance." },
    { name: "Rift-Savant Wand", slotKey: "weapon", slot: "Wand", effect: "+1 attack/damage and +1d6 force damage." },
    { name: "Elemental Amulet", slotKey: "amulet", slot: "Amulet", effect: "+1 saves and lightning resistance." },
    { name: "Rift-Savant Boots", slotKey: "boots", slot: "Boots", effect: "+10 ft speed and lightning resistance." },
  ],
});

const planarAttunementSetId = "crucible-planar-attunement";
const planarAttunementRarity = "very rare";
const planarAttunementTier = 3;
const planarAttunementPriceGp = 30000;
const planarAttunementTokenPrice = 3;

window.DungeonContent.register("factionSets", planarAttunementSetId, {
  id: planarAttunementSetId,
  factionId: crucibleFactionId,
  name: "Planar Attunement Set",
  tier: planarAttunementTier,
  rarity: planarAttunementRarity,
  requiredSlotKeys: ["cloak", "weapon", "bracers", "head"],
  setBonus: {
    label: "Elemental Convergence",
    effects: {
      resistances: ["fire", "cold", "lightning", "acid"],
      extraDamage: [{ count: 1, sides: 8, type: "force" }],
    },
    description: "While four Planar Attunement pieces are equipped and attuned, gain fire, cold, lightning, and acid resistance plus +1d8 force weapon damage.",
  },
  catalogItems: [
    { name: "Planar Attunement Mantle", slotKey: "cloak", slot: "Cloak", effect: "+1 AC and fire/cold/lightning/acid resistance." },
    { name: "Planar Attunement Staff", slotKey: "weapon", slot: "Staff", effect: "+2 attack/damage and +1d8 lightning damage." },
    { name: "Planar Bracers", slotKey: "bracers", slot: "Bracers", effect: "+1 AC and +1 damage." },
    { name: "Planar Circlet", slotKey: "head", slot: "Head", effect: "+2 saves and +1 initiative." },
  ],
});

const fourfoldCrucibleSetId = "crucible-fourfold";
const fourfoldCrucibleRarity = "legendary";
const fourfoldCrucibleTier = 4;
const fourfoldCruciblePriceGp = 120000;
const fourfoldCrucibleTokenPrice = 4;

window.DungeonContent.register("factionSets", fourfoldCrucibleSetId, {
  id: fourfoldCrucibleSetId,
  factionId: crucibleFactionId,
  name: "Fourfold Crucible Set",
  tier: fourfoldCrucibleTier,
  rarity: fourfoldCrucibleRarity,
  requiredSlotKeys: ["armor", "weapon", "head", "ring"],
  setBonus: {
    label: "Fourfold Mastery",
    effects: {
      maxHpBonus: 15,
      resistances: ["fire", "cold", "lightning", "acid"],
      extraDamage: [{ count: 1, sides: 10, type: "force" }],
    },
    description: "While four Fourfold Crucible pieces are equipped and attuned, gain +15 max HP, fire/cold/lightning/acid resistance, and +1d10 force weapon damage.",
  },
  catalogItems: [
    { name: "Fourfold Master Robe", slotKey: "armor", slot: "Light armor", effect: "+3 AC and four elemental resistances." },
    { name: "Fourfold Archmage Staff", slotKey: "weapon", slot: "Staff", effect: "+3 attack/damage and +1d10 force damage." },
    { name: "Elemental Crown", slotKey: "head", slot: "Head", effect: "+3 saves and +2 initiative." },
    { name: "Fourfold Attunement Ring", slotKey: "ring", slot: "Ring", effect: "+1 AC, +10 max HP, and elemental resistance." },
  ],
});

registerFactionSetArmor(
  "faction-crucible-apprentice-robe",
  "leather",
  "Apprentice Crucible Robe",
  factionSetData(crucibleFactionId, apprenticeCrucibleSetId, "Apprentice Crucible Set", apprenticeCrucibleTier, apprenticeCrucibleRarity, "armor"),
  apprenticeCruciblePriceGp,
  apprenticeCrucibleTokenPrice,
  {
    enhancementBonus: 1,
    resistances: ["fire"],
    description: "A treated robe reinforced like light armor and stitched with heat-safe thread. Grants +1 AC and fire resistance while attuned.",
  },
);

registerFactionSetWeapon(
  "faction-crucible-apprentice-quarterstaff",
  "quarterstaff",
  "Apprentice Crucible Quarterstaff",
  factionSetData(crucibleFactionId, apprenticeCrucibleSetId, "Apprentice Crucible Set", apprenticeCrucibleTier, apprenticeCrucibleRarity, "weapon"),
  apprenticeCruciblePriceGp,
  apprenticeCrucibleTokenPrice,
  {
    enhancementBonus: 1,
    extraDamage: { count: 1, sides: 4, type: "fire" },
    description: "A staff capped with a brass reaction chamber. Grants +1 attack and damage, and +1d4 fire damage while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-crucible-apprentice-focus-ring",
  "Apprentice Focus Ring",
  ["ring1", "ring2"],
  factionSetData(crucibleFactionId, apprenticeCrucibleSetId, "Apprentice Crucible Set", apprenticeCrucibleTier, apprenticeCrucibleRarity, "ring"),
  apprenticeCruciblePriceGp,
  apprenticeCrucibleTokenPrice,
  {
    category: "ring",
    effects: { attackBonus: 1, saveBonus: 1 },
    description: "A small ring that steadies volatile formulae. Grants +1 attack and +1 saves while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-crucible-apprentice-gloves",
  "Crucible Gloves",
  "gauntlets",
  factionSetData(crucibleFactionId, apprenticeCrucibleSetId, "Apprentice Crucible Set", apprenticeCrucibleTier, apprenticeCrucibleRarity, "gloves"),
  apprenticeCruciblePriceGp,
  apprenticeCrucibleTokenPrice,
  {
    category: "gauntlets",
    effects: { damageBonus: 1, initiativeBonus: 1 },
    description: "Insulated gloves with bright reagent stains. Grants +1 damage and +1 initiative while attuned.",
  },
);

registerFactionSetArmor(
  "faction-crucible-rift-savant-coat",
  "studded-leather",
  "Rift-Savant Reinforced Coat",
  factionSetData(crucibleFactionId, riftSavantSetId, "Rift-Savant Set", riftSavantTier, riftSavantRarity, "armor"),
  riftSavantPriceGp,
  riftSavantTokenPrice,
  {
    enhancementBonus: 1,
    resistances: ["fire", "cold"],
    description: "A reinforced coat lined with rift-safe plates. Grants +1 AC and fire and cold resistance while attuned.",
  },
);

registerFactionSetWeapon(
  "faction-crucible-rift-savant-wand",
  "quarterstaff",
  "Rift-Savant Wand",
  factionSetData(crucibleFactionId, riftSavantSetId, "Rift-Savant Set", riftSavantTier, riftSavantRarity, "weapon", "wand"),
  riftSavantPriceGp,
  riftSavantTokenPrice,
  {
    attackBonus: 1,
    damageBonus: 1,
    extraDamage: { count: 1, sides: 6, type: "force" },
    description: "A wand fixed to a short stabilizing rod. Grants +1 attack and damage, and +1d6 force damage while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-crucible-rift-savant-elemental-amulet",
  "Rift-Savant Elemental Amulet",
  "amulet",
  factionSetData(crucibleFactionId, riftSavantSetId, "Rift-Savant Set", riftSavantTier, riftSavantRarity, "amulet"),
  riftSavantPriceGp,
  riftSavantTokenPrice,
  {
    category: "amulet",
    effects: { saveBonus: 1, resistances: ["lightning"] },
    description: "A suspended shard that changes color around unstable doors. Grants +1 saves and lightning resistance while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-crucible-rift-savant-boots",
  "Rift-Savant Boots",
  "boots",
  factionSetData(crucibleFactionId, riftSavantSetId, "Rift-Savant Set", riftSavantTier, riftSavantRarity, "boots"),
  riftSavantPriceGp,
  riftSavantTokenPrice,
  {
    category: "boots",
    effects: { speedBonusFeet: 10, resistances: ["lightning"] },
    description: "Boots with copper grounding nails and impossible tread marks. Grants +10 ft speed and lightning resistance while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-crucible-planar-mantle",
  "Planar Attunement Mantle",
  "cloak",
  factionSetData(crucibleFactionId, planarAttunementSetId, "Planar Attunement Set", planarAttunementTier, planarAttunementRarity, "cloak"),
  planarAttunementPriceGp,
  planarAttunementTokenPrice,
  {
    category: "cloak",
    weightLb: 1,
    effects: { acBonus: 1, resistances: ["fire", "cold", "lightning", "acid"] },
    description: "A mantle whose lining shows a different sky whenever folded. Grants +1 AC and fire, cold, lightning, and acid resistance while attuned.",
  },
);

registerFactionSetWeapon(
  "faction-crucible-planar-staff",
  "quarterstaff",
  "Planar Attunement Staff",
  factionSetData(crucibleFactionId, planarAttunementSetId, "Planar Attunement Set", planarAttunementTier, planarAttunementRarity, "weapon"),
  planarAttunementPriceGp,
  planarAttunementTokenPrice,
  {
    enhancementBonus: 2,
    extraDamage: { count: 1, sides: 8, type: "lightning" },
    description: "A staff that clicks through four impossible alignments. Grants +2 attack and damage, and +1d8 lightning damage while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-crucible-planar-bracers",
  "Planar Bracers",
  "bracers",
  factionSetData(crucibleFactionId, planarAttunementSetId, "Planar Attunement Set", planarAttunementTier, planarAttunementRarity, "bracers"),
  planarAttunementPriceGp,
  planarAttunementTokenPrice,
  {
    category: "bracers",
    effects: { acBonus: 1, damageBonus: 1 },
    description: "Bracers etched with orbiting planar sigils. Grants +1 AC and +1 damage while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-crucible-planar-circlet",
  "Planar Circlet",
  "head",
  factionSetData(crucibleFactionId, planarAttunementSetId, "Planar Attunement Set", planarAttunementTier, planarAttunementRarity, "head"),
  planarAttunementPriceGp,
  planarAttunementTokenPrice,
  {
    category: "head",
    effects: { saveBonus: 2, initiativeBonus: 1 },
    description: "A circlet that briefly shows where your thoughts would land on other planes. Grants +2 saves and +1 initiative while attuned.",
  },
);

registerFactionSetArmor(
  "faction-crucible-fourfold-master-robe",
  "leather",
  "Fourfold Master Robe",
  factionSetData(crucibleFactionId, fourfoldCrucibleSetId, "Fourfold Crucible Set", fourfoldCrucibleTier, fourfoldCrucibleRarity, "armor"),
  fourfoldCruciblePriceGp,
  fourfoldCrucibleTokenPrice,
  {
    enhancementBonus: 3,
    resistances: ["fire", "cold", "lightning", "acid"],
    description: "A legendary robe-armature whose seams hold four stable reactions at once. Grants +3 AC and fire, cold, lightning, and acid resistance while attuned.",
  },
);

registerFactionSetWeapon(
  "faction-crucible-fourfold-archmage-staff",
  "quarterstaff",
  "Fourfold Archmage Staff",
  factionSetData(crucibleFactionId, fourfoldCrucibleSetId, "Fourfold Crucible Set", fourfoldCrucibleTier, fourfoldCrucibleRarity, "weapon"),
  fourfoldCruciblePriceGp,
  fourfoldCrucibleTokenPrice,
  {
    enhancementBonus: 3,
    extraDamage: { count: 1, sides: 10, type: "force" },
    description: "An archmage staff holding four elemental cores in a perfect argument. Grants +3 attack and damage, and +1d10 force damage while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-crucible-fourfold-elemental-crown",
  "Fourfold Elemental Crown",
  "head",
  factionSetData(crucibleFactionId, fourfoldCrucibleSetId, "Fourfold Crucible Set", fourfoldCrucibleTier, fourfoldCrucibleRarity, "head"),
  fourfoldCruciblePriceGp,
  fourfoldCrucibleTokenPrice,
  {
    category: "head",
    effects: { saveBonus: 3, initiativeBonus: 2 },
    description: "A crown of interlocked elemental signs that never agree on temperature. Grants +3 saves and +2 initiative while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-crucible-fourfold-attunement-ring",
  "Fourfold Attunement Ring",
  ["ring1", "ring2"],
  factionSetData(crucibleFactionId, fourfoldCrucibleSetId, "Fourfold Crucible Set", fourfoldCrucibleTier, fourfoldCrucibleRarity, "ring"),
  fourfoldCruciblePriceGp,
  fourfoldCrucibleTokenPrice,
  {
    category: "ring",
    effects: { acBonus: 1, maxHpBonus: 10, resistances: ["fire", "cold", "lightning", "acid"] },
    description: "A ring with four nested bands moving at different speeds. Grants +1 AC, +10 max HP, and four elemental resistances while attuned.",
  },
);

const antiquarianFactionId = "antiquarian-society";

const catalogerSetId = "antiquarian-cataloger";
const catalogerRarity = "uncommon";
const catalogerTier = 1;
const catalogerPriceGp = 1200;
const catalogerTokenPrice = 1;

window.DungeonContent.register("factionSets", catalogerSetId, {
  id: catalogerSetId,
  factionId: antiquarianFactionId,
  name: "Cataloger's Set",
  tier: catalogerTier,
  rarity: catalogerRarity,
  requiredSlotKeys: ["armor", "weapon", "head", "cloak"],
  setBonus: {
    label: "Cross-Referenced Weakness",
    effects: {
      attackBonus: 1,
      skillBonus: 1,
      extraDamage: [{ count: 1, sides: 4, type: "psychic" }],
    },
    description: "While four Cataloger's pieces are equipped and attuned, gain +1 attack, +1 skill checks, and +1d4 psychic weapon damage.",
  },
  catalogItems: [
    { name: "Cataloger's Scholar Coat", slotKey: "armor", slot: "Light armor", effect: "+1 AC and +1 skill checks." },
    { name: "Cataloger's Rapier", slotKey: "weapon", slot: "Rapier", effect: "+1 attack/damage and +1d4 psychic damage." },
    { name: "Cataloger's Spectacles", slotKey: "head", slot: "Head", effect: "+1 initiative and +1 skill checks." },
    { name: "Cataloger's Satchel-Cloak", slotKey: "cloak", slot: "Cloak", effect: "+5 max HP and +1 saves." },
  ],
});

const inkglassSetId = "antiquarian-inkglass";
const inkglassRarity = "rare";
const inkglassTier = 2;
const inkglassPriceGp = 7500;
const inkglassTokenPrice = 2;

window.DungeonContent.register("factionSets", inkglassSetId, {
  id: inkglassSetId,
  factionId: antiquarianFactionId,
  name: "Inkglass Set",
  tier: inkglassTier,
  rarity: inkglassRarity,
  requiredSlotKeys: ["armor", "weapon", "ring", "amulet"],
  setBonus: {
    label: "Annotated Strike",
    effects: {
      skillBonus: 1,
      saveBonus: 1,
      extraDamage: [{ count: 1, sides: 6, type: "psychic" }],
    },
    description: "While four Inkglass pieces are equipped and attuned, gain +1 skill checks, +1 saves, and +1d6 psychic weapon damage.",
  },
  catalogItems: [
    { name: "Inkglass Fine Coat", slotKey: "armor", slot: "Light armor", effect: "+1 AC and +2 skill checks." },
    { name: "Inkglass Cane-Sword", slotKey: "weapon", slot: "Rapier", effect: "+1 attack/damage and +1d6 psychic damage." },
    { name: "Inkglass Signet Ring", slotKey: "ring", slot: "Ring", effect: "+1 attack and +1 initiative." },
    { name: "Inkglass Relic Amulet", slotKey: "amulet", slot: "Amulet", effect: "+1 saves and psychic resistance." },
  ],
});

const vaultSeekerSetId = "antiquarian-vault-seeker";
const vaultSeekerRarity = "very rare";
const vaultSeekerTier = 3;
const vaultSeekerPriceGp = 30000;
const vaultSeekerTokenPrice = 3;

window.DungeonContent.register("factionSets", vaultSeekerSetId, {
  id: vaultSeekerSetId,
  factionId: antiquarianFactionId,
  name: "Vault-Seeker Set",
  tier: vaultSeekerTier,
  rarity: vaultSeekerRarity,
  requiredSlotKeys: ["armor", "weapon", "bracers", "head"],
  setBonus: {
    label: "Vault Pattern",
    effects: {
      saveBonus: 2,
      initiativeBonus: 2,
      extraDamage: [{ count: 1, sides: 8, type: "force" }],
    },
    description: "While four Vault-Seeker pieces are equipped and attuned, gain +2 saves, +2 initiative, and +1d8 force weapon damage.",
  },
  catalogItems: [
    { name: "Vault-Seeker Explorer's Coat", slotKey: "armor", slot: "Light armor", effect: "+2 AC and psychic resistance." },
    { name: "Vault-Seeker Staff", slotKey: "weapon", slot: "Quarterstaff", effect: "+2 attack/damage and +1d8 force damage." },
    { name: "Vault-Seeker Bracers", slotKey: "bracers", slot: "Bracers", effect: "+1 AC and +1 saves." },
    { name: "Vault-Seeker Lens", slotKey: "head", slot: "Head", effect: "+2 initiative and +2 skill checks." },
  ],
});

const firstArchiveSetId = "antiquarian-first-archive";
const firstArchiveRarity = "legendary";
const firstArchiveTier = 4;
const firstArchivePriceGp = 120000;
const firstArchiveTokenPrice = 4;

window.DungeonContent.register("factionSets", firstArchiveSetId, {
  id: firstArchiveSetId,
  factionId: antiquarianFactionId,
  name: "First Archive Set",
  tier: firstArchiveTier,
  rarity: firstArchiveRarity,
  requiredSlotKeys: ["cloak", "offhand", "weapon", "head"],
  setBonus: {
    label: "Original Citation",
    effects: {
      maxHpBonus: 10,
      immunities: ["psychic"],
      extraDamage: [{ count: 1, sides: 10, type: "force" }],
    },
    description: "While four First Archive pieces are equipped and attuned, gain +10 max HP, psychic immunity, and +1d10 force weapon damage.",
  },
  catalogItems: [
    { name: "First Archive Mantle", slotKey: "cloak", slot: "Cloak", effect: "+2 AC and psychic/force resistance." },
    { name: "First Archive Ancient Tome", slotKey: "offhand", slot: "Off-hand focus", effect: "+3 attack and +2 saves." },
    { name: "First Archive Jeweled Dagger", slotKey: "weapon", slot: "Dagger", effect: "+3 attack/damage and +1d10 psychic damage." },
    { name: "First Archive Crown", slotKey: "head", slot: "Head", effect: "+3 initiative and +3 skill checks." },
  ],
});

registerFactionSetArmor(
  "faction-antiquarian-cataloger-scholar-coat",
  "leather",
  "Cataloger's Scholar Coat",
  factionSetData(antiquarianFactionId, catalogerSetId, "Cataloger's Set", catalogerTier, catalogerRarity, "armor"),
  catalogerPriceGp,
  catalogerTokenPrice,
  {
    enhancementBonus: 1,
    effects: { skillBonus: 1 },
    description: "A light scholar's coat with reinforced folio pockets. Grants +1 AC and +1 skill checks while attuned.",
  },
);

registerFactionSetWeapon(
  "faction-antiquarian-cataloger-rapier",
  "rapier",
  "Cataloger's Rapier",
  factionSetData(antiquarianFactionId, catalogerSetId, "Cataloger's Set", catalogerTier, catalogerRarity, "weapon"),
  catalogerPriceGp,
  catalogerTokenPrice,
  {
    enhancementBonus: 1,
    extraDamage: { count: 1, sides: 4, type: "psychic" },
    description: "A slim blade engraved with correction marks. Grants +1 attack and damage, and +1d4 psychic damage while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-antiquarian-cataloger-spectacles",
  "Cataloger's Spectacles",
  "head",
  factionSetData(antiquarianFactionId, catalogerSetId, "Cataloger's Set", catalogerTier, catalogerRarity, "head"),
  catalogerPriceGp,
  catalogerTokenPrice,
  {
    category: "head",
    effects: { initiativeBonus: 1, skillBonus: 1 },
    description: "Fine spectacles that underline relevant details in the air. Grants +1 initiative and +1 skill checks while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-antiquarian-cataloger-satchel-cloak",
  "Cataloger's Satchel-Cloak",
  "cloak",
  factionSetData(antiquarianFactionId, catalogerSetId, "Cataloger's Set", catalogerTier, catalogerRarity, "cloak"),
  catalogerPriceGp,
  catalogerTokenPrice,
  {
    category: "cloak",
    weightLb: 1,
    effects: { maxHpBonus: 5, saveBonus: 1 },
    description: "A field satchel sewn into a weather cloak and full of impossible tabs. Grants +5 max HP and +1 saves while attuned.",
  },
);

registerFactionSetArmor(
  "faction-antiquarian-inkglass-fine-coat",
  "studded-leather",
  "Inkglass Fine Coat",
  factionSetData(antiquarianFactionId, inkglassSetId, "Inkglass Set", inkglassTier, inkglassRarity, "armor"),
  inkglassPriceGp,
  inkglassTokenPrice,
  {
    enhancementBonus: 1,
    effects: { skillBonus: 2 },
    description: "A precise black coat with hidden glass-thread lining. Grants +1 AC and +2 skill checks while attuned.",
  },
);

registerFactionSetWeapon(
  "faction-antiquarian-inkglass-cane-sword",
  "rapier",
  "Inkglass Cane-Sword",
  factionSetData(antiquarianFactionId, inkglassSetId, "Inkglass Set", inkglassTier, inkglassRarity, "weapon"),
  inkglassPriceGp,
  inkglassTokenPrice,
  {
    enhancementBonus: 1,
    extraDamage: { count: 1, sides: 6, type: "psychic" },
    description: "A polite walking cane with a very impolite blade inside. Grants +1 attack and damage, and +1d6 psychic damage while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-antiquarian-inkglass-signet-ring",
  "Inkglass Signet Ring",
  ["ring1", "ring2"],
  factionSetData(antiquarianFactionId, inkglassSetId, "Inkglass Set", inkglassTier, inkglassRarity, "ring"),
  inkglassPriceGp,
  inkglassTokenPrice,
  {
    category: "ring",
    effects: { attackBonus: 1, initiativeBonus: 1 },
    description: "A signet ring that seals arguments as neatly as letters. Grants +1 attack and +1 initiative while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-antiquarian-inkglass-relic-amulet",
  "Inkglass Relic Amulet",
  "amulet",
  factionSetData(antiquarianFactionId, inkglassSetId, "Inkglass Set", inkglassTier, inkglassRarity, "amulet"),
  inkglassPriceGp,
  inkglassTokenPrice,
  {
    category: "amulet",
    effects: { saveBonus: 1, resistances: ["psychic"] },
    description: "A verified relic sealed behind black glass. Grants +1 saves and psychic resistance while attuned.",
  },
);

registerFactionSetArmor(
  "faction-antiquarian-vault-seeker-explorer-coat",
  "studded-leather",
  "Vault-Seeker Explorer's Coat",
  factionSetData(antiquarianFactionId, vaultSeekerSetId, "Vault-Seeker Set", vaultSeekerTier, vaultSeekerRarity, "armor"),
  vaultSeekerPriceGp,
  vaultSeekerTokenPrice,
  {
    enhancementBonus: 2,
    resistances: ["psychic"],
    description: "A reinforced explorer's coat lined with dead-language warding strips. Grants +2 AC and psychic resistance while attuned.",
  },
);

registerFactionSetWeapon(
  "faction-antiquarian-vault-seeker-staff",
  "quarterstaff",
  "Vault-Seeker Staff",
  factionSetData(antiquarianFactionId, vaultSeekerSetId, "Vault-Seeker Set", vaultSeekerTier, vaultSeekerRarity, "weapon"),
  vaultSeekerPriceGp,
  vaultSeekerTokenPrice,
  {
    enhancementBonus: 2,
    extraDamage: { count: 1, sides: 8, type: "force" },
    description: "A survey staff that taps hollow walls before they admit they are doors. Grants +2 attack and damage, and +1d8 force damage while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-antiquarian-vault-seeker-bracers",
  "Vault-Seeker Bracers",
  "bracers",
  factionSetData(antiquarianFactionId, vaultSeekerSetId, "Vault-Seeker Set", vaultSeekerTier, vaultSeekerRarity, "bracers"),
  vaultSeekerPriceGp,
  vaultSeekerTokenPrice,
  {
    category: "bracers",
    effects: { acBonus: 1, saveBonus: 1 },
    description: "Bracers stamped with the measurements of lost archive rooms. Grants +1 AC and +1 saves while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-antiquarian-vault-seeker-lens",
  "Vault-Seeker Lens",
  "head",
  factionSetData(antiquarianFactionId, vaultSeekerSetId, "Vault-Seeker Set", vaultSeekerTier, vaultSeekerRarity, "head"),
  vaultSeekerPriceGp,
  vaultSeekerTokenPrice,
  {
    category: "head",
    effects: { initiativeBonus: 2, skillBonus: 2 },
    description: "A monocle-lens that catches the angle of hidden mechanisms. Grants +2 initiative and +2 skill checks while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-antiquarian-first-archive-mantle",
  "First Archive Mantle",
  "cloak",
  factionSetData(antiquarianFactionId, firstArchiveSetId, "First Archive Set", firstArchiveTier, firstArchiveRarity, "cloak"),
  firstArchivePriceGp,
  firstArchiveTokenPrice,
  {
    category: "cloak",
    weightLb: 1,
    effects: { acBonus: 2, resistances: ["psychic", "force"] },
    description: "A mantle copied from a portrait that should not exist. Grants +2 AC and psychic and force resistance while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-antiquarian-first-archive-ancient-tome",
  "First Archive Ancient Tome",
  ["offHand", "belt1", "belt2", "belt3", "belt4", "belt5"],
  factionSetData(antiquarianFactionId, firstArchiveSetId, "First Archive Set", firstArchiveTier, firstArchiveRarity, "offhand"),
  firstArchivePriceGp,
  firstArchiveTokenPrice,
  {
    category: "offhand",
    weightLb: 3,
    effects: { attackBonus: 3, saveBonus: 2 },
    description: "A chained tome whose first page always cites the reader. Grants +3 attack and +2 saves while attuned.",
  },
);

registerFactionSetWeapon(
  "faction-antiquarian-first-archive-jeweled-dagger",
  "dagger",
  "First Archive Jeweled Dagger",
  factionSetData(antiquarianFactionId, firstArchiveSetId, "First Archive Set", firstArchiveTier, firstArchiveRarity, "weapon"),
  firstArchivePriceGp,
  firstArchiveTokenPrice,
  {
    enhancementBonus: 3,
    extraDamage: { count: 1, sides: 10, type: "psychic" },
    description: "A jeweled dagger used to cut seals from impossible manuscripts. Grants +3 attack and damage, and +1d10 psychic damage while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-antiquarian-first-archive-crown",
  "First Archive Crown",
  "head",
  factionSetData(antiquarianFactionId, firstArchiveSetId, "First Archive Set", firstArchiveTier, firstArchiveRarity, "head"),
  firstArchivePriceGp,
  firstArchiveTokenPrice,
  {
    category: "head",
    effects: { initiativeBonus: 3, skillBonus: 3 },
    description: "A crown from the first room ever archived. Grants +3 initiative and +3 skill checks while attuned.",
  },
);

const expeditionFactionId = "expedition-board";

const waymarkSetId = "expedition-waymark";
const waymarkRarity = "uncommon";
const waymarkTier = 1;
const waymarkPriceGp = 1200;
const waymarkTokenPrice = 1;

window.DungeonContent.register("factionSets", waymarkSetId, {
  id: waymarkSetId,
  factionId: expeditionFactionId,
  name: "Waymark Set",
  tier: waymarkTier,
  rarity: waymarkRarity,
  requiredSlotKeys: ["armor", "shield", "weapon", "boots"],
  setBonus: {
    label: "Marked Route",
    effects: {
      speedBonusFeet: 5,
      skillBonus: 1,
      saveBonus: 1,
    },
    description: "While four Waymark pieces are equipped and attuned, gain +5 ft speed, +1 skill checks, and +1 saves.",
  },
  catalogItems: [
    { name: "Waymark Scale Harness", slotKey: "armor", slot: "Medium armor", effect: "+1 AC and +1 saves." },
    { name: "Waymark Shield", slotKey: "shield", slot: "Shield", effect: "+1 shield AC and +1 skill checks." },
    { name: "Waymark Battleaxe", slotKey: "weapon", slot: "Battleaxe", effect: "+1 attack/damage and +1d4 slashing damage." },
    { name: "Waymark Explorer Boots", slotKey: "boots", slot: "Boots", effect: "+10 ft speed and +1 initiative." },
  ],
});

const routebreakerSetId = "expedition-routebreaker";
const routebreakerRarity = "rare";
const routebreakerTier = 2;
const routebreakerPriceGp = 7500;
const routebreakerTokenPrice = 2;

window.DungeonContent.register("factionSets", routebreakerSetId, {
  id: routebreakerSetId,
  factionId: expeditionFactionId,
  name: "Routebreaker Set",
  tier: routebreakerTier,
  rarity: routebreakerRarity,
  requiredSlotKeys: ["armor", "weapon", "cloak", "amulet"],
  setBonus: {
    label: "Break Trail",
    effects: {
      speedBonusFeet: 10,
      skillBonus: 2,
      extraDamage: [{ count: 1, sides: 6, type: "bludgeoning" }],
    },
    description: "While four Routebreaker pieces are equipped and attuned, gain +10 ft speed, +2 skill checks, and +1d6 bludgeoning weapon damage.",
  },
  catalogItems: [
    { name: "Routebreaker Breastplate", slotKey: "armor", slot: "Breastplate", effect: "+1 AC and bludgeoning resistance." },
    { name: "Routebreaker Warhammer", slotKey: "weapon", slot: "Warhammer", effect: "+1 attack/damage and +1d6 bludgeoning damage." },
    { name: "Routebreaker Utility Cloak", slotKey: "cloak", slot: "Cloak", effect: "+1 AC and +2 skill checks." },
    { name: "Routebreaker Compass Amulet", slotKey: "amulet", slot: "Amulet", effect: "+1 saves and +1 initiative." },
  ],
});

const deepDelverSetId = "expedition-deep-delver";
const deepDelverRarity = "very rare";
const deepDelverTier = 3;
const deepDelverPriceGp = 30000;
const deepDelverTokenPrice = 3;

window.DungeonContent.register("factionSets", deepDelverSetId, {
  id: deepDelverSetId,
  factionId: expeditionFactionId,
  name: "Deep Delver Set",
  tier: deepDelverTier,
  rarity: deepDelverRarity,
  requiredSlotKeys: ["armor", "weapon", "gauntlets", "ring"],
  setBonus: {
    label: "Deep March",
    effects: {
      maxHpBonus: 10,
      resistances: ["poison"],
      extraDamage: [{ count: 1, sides: 8, type: "force" }],
    },
    description: "While four Deep Delver pieces are equipped and attuned, gain +10 max HP, poison resistance, and +1d8 force weapon damage.",
  },
  catalogItems: [
    { name: "Deep Delver Half Plate", slotKey: "armor", slot: "Half plate", effect: "+2 AC and poison resistance." },
    { name: "Deep Delver Greatsword", slotKey: "weapon", slot: "Greatsword", effect: "+2 attack/damage and +1d8 force damage." },
    { name: "Deep Delver Gauntlets", slotKey: "gauntlets", slot: "Gauntlets", effect: "+2 damage and +1 saves." },
    { name: "Deep Delver Ring", slotKey: "ring", slot: "Ring", effect: "+1 AC and +2 skill checks." },
  ],
});

const grandExpeditionSetId = "expedition-grand";
const grandExpeditionRarity = "legendary";
const grandExpeditionTier = 4;
const grandExpeditionPriceGp = 120000;
const grandExpeditionTokenPrice = 4;

window.DungeonContent.register("factionSets", grandExpeditionSetId, {
  id: grandExpeditionSetId,
  factionId: expeditionFactionId,
  name: "Grand Expedition Set",
  tier: grandExpeditionTier,
  rarity: grandExpeditionRarity,
  requiredSlotKeys: ["armor", "weapon", "cloak", "head"],
  setBonus: {
    label: "Lantern Marshal",
    effects: {
      maxHpBonus: 15,
      speedBonusFeet: 10,
      extraDamage: [{ count: 1, sides: 10, type: "force" }],
    },
    description: "While four Grand Expedition pieces are equipped and attuned, gain +15 max HP, +10 ft speed, and +1d10 force weapon damage.",
  },
  catalogItems: [
    { name: "Grand Expedition Plate", slotKey: "armor", slot: "Heavy plate", effect: "+3 AC and force resistance." },
    { name: "Grand Expedition Greataxe", slotKey: "weapon", slot: "Greataxe", effect: "+3 attack/damage and +1d10 force damage." },
    { name: "Grand Expedition Banner Cloak", slotKey: "cloak", slot: "Cloak", effect: "+2 saves and +10 max HP." },
    { name: "Grand Expedition Command Helm", slotKey: "head", slot: "Head", effect: "+3 initiative and +2 skill checks." },
  ],
});

registerFactionSetArmor(
  "faction-expedition-waymark-scale-harness",
  "scale-mail",
  "Waymark Scale Harness",
  factionSetData(expeditionFactionId, waymarkSetId, "Waymark Set", waymarkTier, waymarkRarity, "armor"),
  waymarkPriceGp,
  waymarkTokenPrice,
  {
    enhancementBonus: 1,
    effects: { saveBonus: 1 },
    description: "A practical scale harness marked with route stitches. Grants +1 AC and +1 saves while attuned.",
  },
);

registerFactionSetArmor(
  "faction-expedition-waymark-shield",
  "shield",
  "Waymark Shield",
  factionSetData(expeditionFactionId, waymarkSetId, "Waymark Set", waymarkTier, waymarkRarity, "shield"),
  waymarkPriceGp,
  waymarkTokenPrice,
  {
    enhancementBonus: 1,
    effects: { skillBonus: 1 },
    description: "A scarred route shield painted with safe-path marks. Grants +1 shield AC and +1 skill checks while attuned.",
  },
);

registerFactionSetWeapon(
  "faction-expedition-waymark-battleaxe",
  "battleaxe",
  "Waymark Battleaxe",
  factionSetData(expeditionFactionId, waymarkSetId, "Waymark Set", waymarkTier, waymarkRarity, "weapon"),
  waymarkPriceGp,
  waymarkTokenPrice,
  {
    enhancementBonus: 1,
    extraDamage: { count: 1, sides: 4, type: "slashing" },
    description: "A notched axe used to blaze paths into dungeon stone. Grants +1 attack and damage, and +1d4 slashing damage while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-expedition-waymark-explorer-boots",
  "Waymark Explorer Boots",
  "boots",
  factionSetData(expeditionFactionId, waymarkSetId, "Waymark Set", waymarkTier, waymarkRarity, "boots"),
  waymarkPriceGp,
  waymarkTokenPrice,
  {
    category: "boots",
    effects: { speedBonusFeet: 10, initiativeBonus: 1 },
    description: "Boots built for stairs, mud, and bad decisions. Grants +10 ft speed and +1 initiative while attuned.",
  },
);

registerFactionSetArmor(
  "faction-expedition-routebreaker-breastplate",
  "breastplate",
  "Routebreaker Breastplate",
  factionSetData(expeditionFactionId, routebreakerSetId, "Routebreaker Set", routebreakerTier, routebreakerRarity, "armor"),
  routebreakerPriceGp,
  routebreakerTokenPrice,
  {
    enhancementBonus: 1,
    resistances: ["bludgeoning"],
    description: "A dent-forgiving breastplate for clearing collapsed roads. Grants +1 AC and bludgeoning resistance while attuned.",
  },
);

registerFactionSetWeapon(
  "faction-expedition-routebreaker-warhammer",
  "warhammer",
  "Routebreaker Warhammer",
  factionSetData(expeditionFactionId, routebreakerSetId, "Routebreaker Set", routebreakerTier, routebreakerRarity, "weapon"),
  routebreakerPriceGp,
  routebreakerTokenPrice,
  {
    enhancementBonus: 1,
    extraDamage: { count: 1, sides: 6, type: "bludgeoning" },
    description: "A heavy hammer for locks, barricades, and arguments with masonry. Grants +1 attack and damage, and +1d6 bludgeoning damage while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-expedition-routebreaker-utility-cloak",
  "Routebreaker Utility Cloak",
  "cloak",
  factionSetData(expeditionFactionId, routebreakerSetId, "Routebreaker Set", routebreakerTier, routebreakerRarity, "cloak"),
  routebreakerPriceGp,
  routebreakerTokenPrice,
  {
    category: "cloak",
    weightLb: 1,
    effects: { acBonus: 1, skillBonus: 2 },
    description: "A cloak lined with loops, chalk, twine, and folded route tags. Grants +1 AC and +2 skill checks while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-expedition-routebreaker-compass-amulet",
  "Routebreaker Compass Amulet",
  "amulet",
  factionSetData(expeditionFactionId, routebreakerSetId, "Routebreaker Set", routebreakerTier, routebreakerRarity, "amulet"),
  routebreakerPriceGp,
  routebreakerTokenPrice,
  {
    category: "amulet",
    effects: { saveBonus: 1, initiativeBonus: 1 },
    description: "A brass compass that points toward the least embarrassing exit. Grants +1 saves and +1 initiative while attuned.",
  },
);

registerFactionSetArmor(
  "faction-expedition-deep-delver-half-plate",
  "half-plate",
  "Deep Delver Half Plate",
  factionSetData(expeditionFactionId, deepDelverSetId, "Deep Delver Set", deepDelverTier, deepDelverRarity, "armor"),
  deepDelverPriceGp,
  deepDelverTokenPrice,
  {
    enhancementBonus: 2,
    resistances: ["poison"],
    description: "Half plate sealed for stale air, bad water, and worse tunnels. Grants +2 AC and poison resistance while attuned.",
  },
);

registerFactionSetWeapon(
  "faction-expedition-deep-delver-greatsword",
  "greatsword",
  "Deep Delver Greatsword",
  factionSetData(expeditionFactionId, deepDelverSetId, "Deep Delver Set", deepDelverTier, deepDelverRarity, "weapon"),
  deepDelverPriceGp,
  deepDelverTokenPrice,
  {
    enhancementBonus: 2,
    extraDamage: { count: 1, sides: 8, type: "force" },
    description: "A greatsword weighted for cramped, brutal delves. Grants +2 attack and damage, and +1d8 force damage while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-expedition-deep-delver-gauntlets",
  "Deep Delver Gauntlets",
  "gauntlets",
  factionSetData(expeditionFactionId, deepDelverSetId, "Deep Delver Set", deepDelverTier, deepDelverRarity, "gauntlets"),
  deepDelverPriceGp,
  deepDelverTokenPrice,
  {
    category: "gauntlets",
    effects: { damageBonus: 2, saveBonus: 1 },
    description: "Heavy gauntlets for climbing chains and forcing old doors. Grants +2 damage and +1 saves while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-expedition-deep-delver-ring",
  "Deep Delver Ring",
  ["ring1", "ring2"],
  factionSetData(expeditionFactionId, deepDelverSetId, "Deep Delver Set", deepDelverTier, deepDelverRarity, "ring"),
  deepDelverPriceGp,
  deepDelverTokenPrice,
  {
    category: "ring",
    effects: { acBonus: 1, skillBonus: 2 },
    description: "A thick iron ring stamped with old depth marks. Grants +1 AC and +2 skill checks while attuned.",
  },
);

registerFactionSetArmor(
  "faction-expedition-grand-plate",
  "plate",
  "Grand Expedition Plate",
  factionSetData(expeditionFactionId, grandExpeditionSetId, "Grand Expedition Set", grandExpeditionTier, grandExpeditionRarity, "armor"),
  grandExpeditionPriceGp,
  grandExpeditionTokenPrice,
  {
    enhancementBonus: 3,
    resistances: ["force"],
    description: "Heavy explorer plate built to carry a route standard through a collapsing ruin. Grants +3 AC and force resistance while attuned.",
  },
);

registerFactionSetWeapon(
  "faction-expedition-grand-greataxe",
  "greataxe",
  "Grand Expedition Greataxe",
  factionSetData(expeditionFactionId, grandExpeditionSetId, "Grand Expedition Set", grandExpeditionTier, grandExpeditionRarity, "weapon"),
  grandExpeditionPriceGp,
  grandExpeditionTokenPrice,
  {
    enhancementBonus: 3,
    extraDamage: { count: 1, sides: 10, type: "force" },
    description: "A massive axe carried by route leaders who make doors where maps forgot them. Grants +3 attack and damage, and +1d10 force damage while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-expedition-grand-banner-cloak",
  "Grand Expedition Banner Cloak",
  "cloak",
  factionSetData(expeditionFactionId, grandExpeditionSetId, "Grand Expedition Set", grandExpeditionTier, grandExpeditionRarity, "cloak"),
  grandExpeditionPriceGp,
  grandExpeditionTokenPrice,
  {
    category: "cloak",
    weightLb: 2,
    effects: { saveBonus: 2, maxHpBonus: 10 },
    description: "A cloak cut from a route banner and weighted like a promise. Grants +2 saves and +10 max HP while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-expedition-grand-command-helm",
  "Grand Expedition Command Helm",
  "head",
  factionSetData(expeditionFactionId, grandExpeditionSetId, "Grand Expedition Set", grandExpeditionTier, grandExpeditionRarity, "head"),
  grandExpeditionPriceGp,
  grandExpeditionTokenPrice,
  {
    category: "head",
    effects: { initiativeBonus: 3, skillBonus: 2 },
    description: "A command helm with a lantern crest bright enough to organize panic. Grants +3 initiative and +2 skill checks while attuned.",
  },
);

const fightingPitFactionId = "fighting-pit";

const pitBloodSetId = "pit-pit-blood";
const pitBloodRarity = "uncommon";
const pitBloodTier = 1;
const pitBloodPriceGp = 1200;
const pitBloodTokenPrice = 1;

window.DungeonContent.register("factionSets", pitBloodSetId, {
  id: pitBloodSetId,
  factionId: fightingPitFactionId,
  name: "Pit-Blood Set",
  tier: pitBloodTier,
  rarity: pitBloodRarity,
  requiredSlotKeys: ["armor", "weapon", "gauntlets", "belt"],
  setBonus: {
    label: "Crowd Grit",
    effects: {
      maxHpBonus: 5,
      damageBonus: 1,
      skillBonus: 1,
    },
    description: "While four Pit-Blood pieces are equipped and attuned, gain +5 max HP, +1 weapon damage, and +1 skill checks.",
  },
  catalogItems: [
    { name: "Pit-Blood Gladiator Harness", slotKey: "armor", slot: "Heavy arena harness", effect: "+1 AC and +5 max HP." },
    { name: "Pit-Blood Longsword", slotKey: "weapon", slot: "Longsword", effect: "+1 attack/damage and +1d4 slashing damage." },
    { name: "Pit-Blood Gauntlets", slotKey: "gauntlets", slot: "Gauntlets", effect: "+1 damage and +1 saves." },
    { name: "Pit-Blood Arena Belt", slotKey: "belt", slot: "Belt", effect: "+1 initiative and +1 skill checks." },
  ],
});

const ironbellSetId = "pit-ironbell";
const ironbellRarity = "rare";
const ironbellTier = 2;
const ironbellPriceGp = 7500;
const ironbellTokenPrice = 2;

window.DungeonContent.register("factionSets", ironbellSetId, {
  id: ironbellSetId,
  factionId: fightingPitFactionId,
  name: "Ironbell Set",
  tier: ironbellTier,
  rarity: ironbellRarity,
  requiredSlotKeys: ["armor", "weapon", "bracers", "cloak"],
  setBonus: {
    label: "Bell-Rung Charge",
    effects: {
      speedBonusFeet: 10,
      saveBonus: 1,
      extraDamage: [{ count: 1, sides: 6, type: "thunder" }],
    },
    description: "While four Ironbell pieces are equipped and attuned, gain +10 ft speed, +1 saves, and +1d6 thunder weapon damage.",
  },
  catalogItems: [
    { name: "Ironbell Half Plate", slotKey: "armor", slot: "Half plate", effect: "+1 AC and thunder resistance." },
    { name: "Ironbell Greataxe", slotKey: "weapon", slot: "Greataxe", effect: "+1 attack/damage and +1d6 thunder damage." },
    { name: "Ironbell Bracers", slotKey: "bracers", slot: "Bracers", effect: "+1 AC and +1 damage." },
    { name: "Ironbell Victory Cloak", slotKey: "cloak", slot: "Cloak", effect: "+1 saves and +1 initiative." },
  ],
});

const championsHeatSetId = "pit-champions-heat";
const championsHeatRarity = "very rare";
const championsHeatTier = 3;
const championsHeatPriceGp = 30000;
const championsHeatTokenPrice = 3;

window.DungeonContent.register("factionSets", championsHeatSetId, {
  id: championsHeatSetId,
  factionId: fightingPitFactionId,
  name: "Champion's Heat Set",
  tier: championsHeatTier,
  rarity: championsHeatRarity,
  requiredSlotKeys: ["armor", "weapon", "head", "ring"],
  setBonus: {
    label: "Champion's Heat",
    effects: {
      saveBonus: 2,
      resistances: ["fire"],
      extraDamage: [{ count: 1, sides: 8, type: "fire" }],
    },
    description: "While four Champion's Heat pieces are equipped and attuned, gain +2 saves, fire resistance, and +1d8 fire weapon damage.",
  },
  catalogItems: [
    { name: "Champion's Heat Plate", slotKey: "armor", slot: "Plate", effect: "+2 AC and fire resistance." },
    { name: "Champion's Heat Maul / Warhammer", slotKey: "weapon", slot: "Maul or warhammer", effect: "+2 attack/damage and +1d8 fire damage." },
    { name: "Champion's Heat Helm", slotKey: "head", slot: "Head", effect: "+2 initiative and +1 saves." },
    { name: "Champion's Heat Ring", slotKey: "ring", slot: "Ring", effect: "+1 AC and +2 damage." },
  ],
});

const gloryKingSetId = "pit-glory-king";
const gloryKingRarity = "legendary";
const gloryKingTier = 4;
const gloryKingPriceGp = 120000;
const gloryKingTokenPrice = 4;

window.DungeonContent.register("factionSets", gloryKingSetId, {
  id: gloryKingSetId,
  factionId: fightingPitFactionId,
  name: "Glory-King Set",
  tier: gloryKingTier,
  rarity: gloryKingRarity,
  requiredSlotKeys: ["armor", "weapon", "head", "cloak"],
  setBonus: {
    label: "Glory-King Roar",
    effects: {
      maxHpBonus: 15,
      attackBonus: 1,
      extraDamage: [{ count: 1, sides: 10, type: "thunder" }],
    },
    description: "While four Glory-King pieces are equipped and attuned, gain +15 max HP, +1 attack, and +1d10 thunder weapon damage.",
  },
  catalogItems: [
    { name: "Glory-King Arena Plate", slotKey: "armor", slot: "Legendary arena plate", effect: "+3 AC and thunder/fire resistance." },
    { name: "Glory-King Massive Greatsword / Paired Greatswords", slotKey: "weapon", slot: "Greatsword variant", effect: "+3 attack/damage and +1d10 thunder damage." },
    { name: "Glory-King Champion's Crown", slotKey: "head", slot: "Head", effect: "+3 initiative and +3 skill checks." },
    { name: "Glory-King Spectator Mantle", slotKey: "cloak", slot: "Cloak", effect: "+2 saves and +10 max HP." },
  ],
});

registerFactionSetArmor(
  "faction-pit-pit-blood-gladiator-harness",
  "chain-mail",
  "Pit-Blood Gladiator Harness",
  factionSetData(fightingPitFactionId, pitBloodSetId, "Pit-Blood Set", pitBloodTier, pitBloodRarity, "armor"),
  pitBloodPriceGp,
  pitBloodTokenPrice,
  {
    enhancementBonus: 1,
    effects: { maxHpBonus: 5 },
    description: "A battered arena harness reinforced like heavy mail. Grants +1 AC and +5 max HP while attuned.",
  },
);

registerFactionSetWeapon(
  "faction-pit-pit-blood-longsword",
  "longsword",
  "Pit-Blood Longsword",
  factionSetData(fightingPitFactionId, pitBloodSetId, "Pit-Blood Set", pitBloodTier, pitBloodRarity, "weapon"),
  pitBloodPriceGp,
  pitBloodTokenPrice,
  {
    enhancementBonus: 1,
    extraDamage: { count: 1, sides: 4, type: "slashing" },
    description: "A crowd-pleasing blade with a blunted practice twin. Grants +1 attack and damage, and +1d4 slashing damage while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-pit-pit-blood-gauntlets",
  "Pit-Blood Gauntlets",
  "gauntlets",
  factionSetData(fightingPitFactionId, pitBloodSetId, "Pit-Blood Set", pitBloodTier, pitBloodRarity, "gauntlets"),
  pitBloodPriceGp,
  pitBloodTokenPrice,
  {
    category: "gauntlets",
    effects: { damageBonus: 1, saveBonus: 1 },
    description: "Scored gauntlets that remember every clinch. Grants +1 damage and +1 saves while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-pit-pit-blood-arena-belt",
  "Pit-Blood Arena Belt",
  ["belt1", "belt2", "belt3", "belt4", "belt5"],
  factionSetData(fightingPitFactionId, pitBloodSetId, "Pit-Blood Set", pitBloodTier, pitBloodRarity, "belt"),
  pitBloodPriceGp,
  pitBloodTokenPrice,
  {
    category: "belt",
    effects: { initiativeBonus: 1, skillBonus: 1 },
    description: "A championship belt from the lower brackets. Grants +1 initiative and +1 skill checks while attuned.",
  },
);

registerFactionSetArmor(
  "faction-pit-ironbell-half-plate",
  "half-plate",
  "Ironbell Half Plate",
  factionSetData(fightingPitFactionId, ironbellSetId, "Ironbell Set", ironbellTier, ironbellRarity, "armor"),
  ironbellPriceGp,
  ironbellTokenPrice,
  {
    enhancementBonus: 1,
    resistances: ["thunder"],
    description: "Half plate with a deep bell tone under every hit. Grants +1 AC and thunder resistance while attuned.",
  },
);

registerFactionSetWeapon(
  "faction-pit-ironbell-greataxe",
  "greataxe",
  "Ironbell Greataxe",
  factionSetData(fightingPitFactionId, ironbellSetId, "Ironbell Set", ironbellTier, ironbellRarity, "weapon"),
  ironbellPriceGp,
  ironbellTokenPrice,
  {
    enhancementBonus: 1,
    extraDamage: { count: 1, sides: 6, type: "thunder" },
    description: "A greataxe that rings the rail on heavy blows. Grants +1 attack and damage, and +1d6 thunder damage while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-pit-ironbell-bracers",
  "Ironbell Bracers",
  "bracers",
  factionSetData(fightingPitFactionId, ironbellSetId, "Ironbell Set", ironbellTier, ironbellRarity, "bracers"),
  ironbellPriceGp,
  ironbellTokenPrice,
  {
    category: "bracers",
    effects: { acBonus: 1, damageBonus: 1 },
    description: "Bracers that turn parries into ringing counters. Grants +1 AC and +1 damage while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-pit-ironbell-victory-cloak",
  "Ironbell Victory Cloak",
  "cloak",
  factionSetData(fightingPitFactionId, ironbellSetId, "Ironbell Set", ironbellTier, ironbellRarity, "cloak"),
  ironbellPriceGp,
  ironbellTokenPrice,
  {
    category: "cloak",
    weightLb: 1,
    effects: { saveBonus: 1, initiativeBonus: 1 },
    description: "A cloak trimmed with bell-metal discs from won bouts. Grants +1 saves and +1 initiative while attuned.",
  },
);

registerFactionSetArmor(
  "faction-pit-champions-heat-plate",
  "plate",
  "Champion's Heat Plate",
  factionSetData(fightingPitFactionId, championsHeatSetId, "Champion's Heat Set", championsHeatTier, championsHeatRarity, "armor"),
  championsHeatPriceGp,
  championsHeatTokenPrice,
  {
    enhancementBonus: 2,
    resistances: ["fire"],
    description: "Plate armor darkened by hot sand and hotter crowds. Grants +2 AC and fire resistance while attuned.",
  },
);

registerFactionSetWeapon(
  "faction-pit-champions-heat-maul",
  "maul",
  "Champion's Heat Maul",
  factionSetData(fightingPitFactionId, championsHeatSetId, "Champion's Heat Set", championsHeatTier, championsHeatRarity, "weapon", "maul"),
  championsHeatPriceGp,
  championsHeatTokenPrice,
  {
    enhancementBonus: 2,
    extraDamage: { count: 1, sides: 8, type: "fire" },
    description: "A maul whose head glows when the crowd starts chanting. Grants +2 attack and damage, and +1d8 fire damage while attuned.",
  },
);

registerFactionSetWeapon(
  "faction-pit-champions-heat-warhammer",
  "warhammer",
  "Champion's Heat Warhammer",
  factionSetData(fightingPitFactionId, championsHeatSetId, "Champion's Heat Set", championsHeatTier, championsHeatRarity, "weapon", "warhammer"),
  championsHeatPriceGp,
  championsHeatTokenPrice,
  {
    enhancementBonus: 2,
    extraDamage: { count: 1, sides: 8, type: "fire" },
    description: "A warhammer balanced for shield fighters who still want a champion's roar. Grants +2 attack and damage, and +1d8 fire damage while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-pit-champions-heat-helm",
  "Champion's Heat Helm",
  "head",
  factionSetData(fightingPitFactionId, championsHeatSetId, "Champion's Heat Set", championsHeatTier, championsHeatRarity, "head"),
  championsHeatPriceGp,
  championsHeatTokenPrice,
  {
    category: "head",
    effects: { initiativeBonus: 2, saveBonus: 1 },
    description: "A helm polished bright enough for the upper rows. Grants +2 initiative and +1 saves while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-pit-champions-heat-ring",
  "Champion's Heat Ring",
  ["ring1", "ring2"],
  factionSetData(fightingPitFactionId, championsHeatSetId, "Champion's Heat Set", championsHeatTier, championsHeatRarity, "ring"),
  championsHeatPriceGp,
  championsHeatTokenPrice,
  {
    category: "ring",
    effects: { acBonus: 1, damageBonus: 2 },
    description: "A champion's ring set with red-hot arena glass. Grants +1 AC and +2 damage while attuned.",
  },
);

registerFactionSetArmor(
  "faction-pit-glory-king-arena-plate",
  "plate",
  "Glory-King Arena Plate",
  factionSetData(fightingPitFactionId, gloryKingSetId, "Glory-King Set", gloryKingTier, gloryKingRarity, "armor"),
  gloryKingPriceGp,
  gloryKingTokenPrice,
  {
    enhancementBonus: 3,
    resistances: ["fire", "thunder"],
    description: "Legendary plate engraved with every bracket bell. Grants +3 AC and fire and thunder resistance while attuned.",
  },
);

registerFactionSetWeapon(
  "faction-pit-glory-king-massive-greatsword",
  "greatsword",
  "Glory-King Massive Greatsword",
  factionSetData(fightingPitFactionId, gloryKingSetId, "Glory-King Set", gloryKingTier, gloryKingRarity, "weapon", "massive-greatsword"),
  gloryKingPriceGp,
  gloryKingTokenPrice,
  {
    enhancementBonus: 3,
    extraDamage: { count: 1, sides: 10, type: "thunder" },
    description: "A massive greatsword made for ending finals loudly. Grants +3 attack and damage, and +1d10 thunder damage while attuned.",
  },
);

registerFactionSetWeapon(
  "faction-pit-glory-king-paired-greatswords",
  "greatsword",
  "Glory-King Paired Greatswords",
  factionSetData(fightingPitFactionId, gloryKingSetId, "Glory-King Set", gloryKingTier, gloryKingRarity, "weapon", "paired-greatswords"),
  gloryKingPriceGp,
  gloryKingTokenPrice,
  {
    enhancementBonus: 3,
    extraDamage: { count: 1, sides: 10, type: "thunder" },
    description: "A matched arena pair represented as one heavy weapon profile. Grants +3 attack and damage, and +1d10 thunder damage while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-pit-glory-king-champions-crown",
  "Glory-King Champion's Crown",
  "head",
  factionSetData(fightingPitFactionId, gloryKingSetId, "Glory-King Set", gloryKingTier, gloryKingRarity, "head"),
  gloryKingPriceGp,
  gloryKingTokenPrice,
  {
    category: "head",
    effects: { initiativeBonus: 3, skillBonus: 3 },
    description: "A crown that turns silence into anticipation. Grants +3 initiative and +3 skill checks while attuned.",
  },
);

registerFactionSetAccessory(
  "faction-pit-glory-king-spectator-mantle",
  "Glory-King Spectator Mantle",
  "cloak",
  factionSetData(fightingPitFactionId, gloryKingSetId, "Glory-King Set", gloryKingTier, gloryKingRarity, "cloak"),
  gloryKingPriceGp,
  gloryKingTokenPrice,
  {
    category: "cloak",
    weightLb: 2,
    effects: { saveBonus: 2, maxHpBonus: 10 },
    description: "A mantle sewn from hundreds of wager ribbons. Grants +2 saves and +10 max HP while attuned.",
  },
);
})();
