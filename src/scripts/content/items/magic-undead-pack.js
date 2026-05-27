(() => {
/*
THEME MAGIC ITEM PACK

Compatibility notes:
- Load this after equipment.js and after your main magic item helpers/base equipment are available.
- Most passive data follows the same shape as magic_items.js and magic_accessories.js.
- Lines marked "IMPLEMENTATION NOTE" describe mechanics that can stay data-only until you add the hook.
*/

const gp = (amount) => ({ amount, unit: "gp", text: `${amount} gp` });

const rarityRank = {
  common: 1,
  uncommon: 2,
  rare: 3,
  "very rare": 4,
  legendary: 5,
};

const slotLabels = {
  head: "Head",
  cloak: "Cloak",
  amulet: "Amulet",
  gauntlets: "Gauntlets",
  bracers: "Bracers",
  boots: "Boots",
  ring1: "Ring",
  ring2: "Ring",
};

const packItemIds = [];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function dropWeightForPrice(priceGp, rarity) {
  const rarityPenalty = rarityRank[rarity] ?? 2;
  const pricePenalty = Math.sqrt(Math.max(1, priceGp));
  return Math.max(1, Math.round(600 / (rarityPenalty * pricePenalty)));
}

function getBaseItem(baseItemId) {
  const base = window.DungeonContent.get("items", baseItemId);
  if (!base) {
    console.warn(`[theme_magic_pack] Missing base item: ${baseItemId}`);
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

function uniqueTags(tags) {
  return Array.from(new Set(tags.filter(Boolean)));
}

function weaponProficiencyTags(base) {
  const [training, style] = String(base.category ?? "").split(/\s+/);
  return uniqueTags([
    base.category,
    base.weaponRange,
    training ? `${training} weapon` : "",
    style ? `${style} weapon` : "",
    training && style ? `${training} ${style}` : "",
    training ? `weapon:${training}` : "",
    style ? `weapon:${style}` : "",
    base.category ? `proficiency:${base.category}` : "",
  ]);
}

function armorProficiencyTags(base) {
  return uniqueTags([
    base.category,
    base.category ? `${base.category} armor` : "",
    base.category ? `armor:${base.category}` : "",
    base.category ? `proficiency:${base.category}` : "",
  ]);
}

function effectTags(effects = {}) {
  return [
    ...(effects.acBonus ? [`ac:+${effects.acBonus}`] : []),
    ...(effects.maxHpBonus ? [`max-hp:+${effects.maxHpBonus}`] : []),
    ...(effects.speedBonusFeet ? [`speed:+${effects.speedBonusFeet}`] : []),
    ...(effects.initiativeBonus ? [`initiative:+${effects.initiativeBonus}`] : []),
    ...Object.entries(effects.abilityScoreBonuses ?? {}).map(([ability, value]) => `${ability}:+${value}`),
    ...(effects.resistances ?? []).map((type) => `resistance:${type}`),
    ...(effects.vulnerabilities ?? []).map((type) => `vulnerability:${type}`),
    ...(effects.extraDamage ?? []).map((entry) => `damage:${entry.type}`),
  ];
}

function registerMagicWeapon(id, baseItemId, name, rarity, priceGp, magic = {}) {
  const base = getBaseItem(baseItemId);
  if (!base) return;

  const attackBonus = magic.attackBonus ?? magic.enhancementBonus ?? 0;
  const damageBonus = magic.damageBonus ?? magic.enhancementBonus ?? 0;
  const extraDamage = Array.isArray(magic.extraDamage) ? magic.extraDamage : magic.extraDamage ? [magic.extraDamage] : [];
  const attunementFields = magic.requiresAttunement == null ? {} : { requiresAttunement: Boolean(magic.requiresAttunement) };

  window.DungeonContent.register("items", id, {
    ...base,
    name,
    type: "weapon",
    cost: gp(priceGp),
    ...attunementFields,
    baseEquipmentId: baseItemId,
    tags: uniqueTags([
      ...(base.tags ?? []),
      ...weaponProficiencyTags(base),
      "magic",
      "magic-item",
      "magic-weapon",
      "loot:magic",
      `rarity:${rarity}`,
      ...(attackBonus ? [`weapon:+${attackBonus}`] : []),
      ...extraDamage.map((entry) => `damage:${entry.type}`),
      ...effectTags(magic.effects ?? {}),
      ...(magic.tags ?? []),
    ]),
    store: {
      buyable: false,
      sellable: true,
      reason: "theme magic items are loot-only for now",
    },
    loot: {
      kind: "magic weapon",
      rarity,
      priceGp,
      priceCp: priceGp * 100,
      dropWeight: magic.dropWeight ?? dropWeightForPrice(priceGp, rarity),
      unique: magic.unique ?? false,
    },
    magic: {
      kind: "weapon",
      rarity,
      priceGp,
      attackBonus,
      damageBonus,
      extraDamage,
      ...attunementFields,
      resistances: magic.resistances ?? [],
      vulnerabilities: magic.vulnerabilities ?? [],
      effects: magic.effects ?? {},
      properties: magic.properties ?? [],
      curse: magic.curse ?? null,
      description: magic.description ?? "",
      implementation: magic.implementation ?? "Attack bonus, damage bonus, and flat extra typed damage follow the existing magic weapon data shape.",
    },
    ...(magic.use ? { use: magic.use } : {}),
  });
  packItemIds.push(id);
}

function registerMagicArmor(id, baseItemId, name, rarity, priceGp, magic = {}) {
  const base = getBaseItem(baseItemId);
  if (!base) return;

  const acBonus = magic.acBonus ?? magic.enhancementBonus ?? 0;
  const resistances = magic.resistances ?? [];
  const vulnerabilities = magic.vulnerabilities ?? [];
  const attunementFields = magic.requiresAttunement == null ? {} : { requiresAttunement: Boolean(magic.requiresAttunement) };

  window.DungeonContent.register("items", id, {
    ...base,
    name,
    type: "armor",
    cost: gp(priceGp),
    ...attunementFields,
    armor: boostedArmor(base.armor, acBonus),
    baseEquipmentId: baseItemId,
    tags: uniqueTags([
      ...(base.tags ?? []),
      ...armorProficiencyTags(base),
      "magic",
      "magic-item",
      "magic-armor",
      "loot:magic",
      `rarity:${rarity}`,
      ...(acBonus ? [`armor:+${acBonus}`] : []),
      ...resistances.map((type) => `resistance:${type}`),
      ...vulnerabilities.map((type) => `vulnerability:${type}`),
      ...effectTags(magic.effects ?? {}),
      ...(magic.curse ? ["cursed"] : []),
      ...(magic.tags ?? []),
    ]),
    store: {
      buyable: false,
      sellable: true,
      reason: "theme magic items are loot-only for now",
    },
    loot: {
      kind: "magic armor",
      rarity,
      priceGp,
      priceCp: priceGp * 100,
      dropWeight: magic.dropWeight ?? dropWeightForPrice(priceGp, rarity),
      unique: magic.unique ?? false,
    },
    magic: {
      kind: "armor",
      rarity,
      priceGp,
      ...attunementFields,
      acBonusAppliedToArmor: acBonus,
      resistances,
      vulnerabilities,
      effects: magic.effects ?? {},
      properties: magic.properties ?? [],
      curse: magic.curse ?? null,
      description: magic.description ?? "",
      implementation: magic.implementation ?? "AC bonus and resistance/vulnerability fields follow the existing magic armor data shape.",
    },
    ...(magic.use ? { use: magic.use } : {}),
  });
  packItemIds.push(id);
}

function registerMagicAccessory(id, name, slots, rarity, priceGp, options = {}) {
  const slotList = Array.isArray(slots) ? slots : [slots];
  const effects = options.effects ?? {};
  const use = options.use ?? null;
  const slotGroup = options.slotGroup ?? slotLabels[slotList[0]] ?? "Accessory";
  const isCursed = Boolean(options.curse || effects.vulnerabilities?.length || effects.abilityScorePenalties);
  const attunementFields = options.requiresAttunement == null ? {} : { requiresAttunement: Boolean(options.requiresAttunement) };

  window.DungeonContent.register("items", id, {
    name,
    type: "accessory",
    category: slotGroup.toLowerCase(),
    cost: gp(priceGp),
    ...attunementFields,
    weightLb: options.weightLb ?? 0.25,
    slots: slotList,
    tags: uniqueTags([
      "magic",
      "magic-item",
      "magic-accessory",
      "loot:magic",
      `rarity:${rarity}`,
      `slot:${slotGroup.toLowerCase()}`,
      ...(isCursed ? ["cursed"] : []),
      ...effectTags(effects),
      ...(use?.kind ? [`use:${use.kind}`] : []),
      ...(options.tags ?? []),
    ]),
    store: {
      buyable: false,
      sellable: true,
      reason: "theme magic items are loot-only for now",
    },
    loot: {
      kind: `magic ${slotGroup.toLowerCase()}`,
      rarity,
      priceGp,
      priceCp: priceGp * 100,
      dropWeight: options.dropWeight ?? dropWeightForPrice(priceGp, rarity),
      unique: options.unique ?? false,
    },
    magic: {
      kind: "accessory",
      slotGroup,
      rarity,
      priceGp,
      ...attunementFields,
      effects,
      properties: options.properties ?? [],
      curse: options.curse ?? null,
      description: options.description ?? "",
      implementation: options.implementation ?? "Passive while equipped unless this item also has a top-level use object.",
    },
    ...(use ? { use } : {}),
  });
  packItemIds.push(id);
}

function registerMagicConsumable(id, name, category, rarity, priceGp, options = {}) {
  const use = options.use ?? {
    kind: "special",
    resource: "action",
    consume: true,
    description: options.description ?? "Use this item to trigger its listed magic effect.",
  };

  window.DungeonContent.register("items", id, {
    name,
    type: "consumable",
    category,
    cost: gp(priceGp),
    weightLb: options.weightLb ?? 0.1,
    slots: options.slots ?? ["belt"],
    tags: uniqueTags([
      "magic",
      "magic-item",
      "magic-consumable",
      "loot:magic",
      `rarity:${rarity}`,
      `consumable:${category}`,
      ...(use?.kind ? [`use:${use.kind}`] : []),
      ...(options.tags ?? []),
    ]),
    store: {
      buyable: false,
      sellable: true,
      reason: "theme magic consumables are loot-only for now",
    },
    loot: {
      kind: `magic ${category}`,
      rarity,
      priceGp,
      priceCp: priceGp * 100,
      dropWeight: options.dropWeight ?? dropWeightForPrice(priceGp, rarity),
      unique: options.unique ?? false,
    },
    magic: {
      kind: "consumable",
      category,
      rarity,
      priceGp,
      effects: options.effects ?? {},
      description: options.description ?? use.description ?? "",
      implementation: options.implementation ?? "Needs consumable-use handling if the current use menu only supports healing potions.",
    },
    use,
  });
  packItemIds.push(id);
}

function registerMagicWondrous(id, name, slots, rarity, priceGp, options = {}) {
  const slotList = Array.isArray(slots) ? slots : [slots];
  const effects = options.effects ?? {};
  const use = options.use ?? null;
  const attunementFields = options.requiresAttunement == null ? {} : { requiresAttunement: Boolean(options.requiresAttunement) };

  window.DungeonContent.register("items", id, {
    name,
    type: "accessory",
    category: "wondrous item",
    cost: gp(priceGp),
    ...attunementFields,
    weightLb: options.weightLb ?? 1,
    slots: slotList,
    tags: uniqueTags([
      "magic",
      "magic-item",
      "magic-accessory",
      "magic-wondrous",
      "wondrous",
      "loot:magic",
      `rarity:${rarity}`,
      ...(options.curse ? ["cursed"] : []),
      ...effectTags(effects),
      ...(use?.kind ? [`use:${use.kind}`] : []),
      ...(options.tags ?? []),
    ]),
    store: {
      buyable: false,
      sellable: true,
      reason: "theme magic items are loot-only for now",
    },
    loot: {
      kind: "magic wondrous item",
      rarity,
      priceGp,
      priceCp: priceGp * 100,
      dropWeight: options.dropWeight ?? dropWeightForPrice(priceGp, rarity),
      unique: options.unique ?? false,
    },
    magic: {
      kind: "wondrous",
      rarity,
      priceGp,
      ...attunementFields,
      effects,
      properties: options.properties ?? [],
      curse: options.curse ?? null,
      description: options.description ?? "",
      implementation: options.implementation ?? "Special wondrous item properties are stored as descriptive data until a bespoke combat hook exists.",
    },
    ...(use ? { use } : {}),
  });
  packItemIds.push(id);
}

const d4 = (type) => ({ count: 1, sides: 4, type });
const d6 = (type) => ({ count: 1, sides: 6, type });
const d8 = (type) => ({ count: 1, sides: 8, type });
const twoD6 = (type) => ({ count: 2, sides: 6, type });

function healingUse(count, sides, bonus, options = {}) {
  return {
    kind: "healing",
    resource: options.resource ?? "bonusAction",
    dice: { count, sides },
    bonus,
    consume: options.consume ?? true,
    charges: options.charges ? {
      max: options.charges,
      refresh: options.refresh ?? "newDungeon",
    } : undefined,
    description: options.description ?? `Heal ${count}d${sides} + ${bonus} HP.`,
  };
}


// Undead Magic Items

registerMagicWeapon("magic-undead-gravekiss-dagger", "dagger", "Gravekiss Dagger", "uncommon", 700, {
  "requiresAttunement": true,
  "enhancementBonus": 1,
  "extraDamage": [
    {
      "count": 1,
      "sides": 4,
      "type": "necrotic"
    }
  ],
  "tags": [
    "undead",
    "necrotic",
    "grave",
    "dagger"
  ],
  "description": "A cold dagger that drinks warmth from fresh wounds."
});

registerMagicWeapon("magic-undead-ossuary-mace", "mace", "Ossuary Mace", "uncommon", 900, {
  "requiresAttunement": true,
  "enhancementBonus": 1,
  "extraDamage": [
    {
      "count": 1,
      "sides": 4,
      "type": "radiant"
    }
  ],
  "tags": [
    "undead",
    "necrotic",
    "grave",
    "bone",
    "radiant"
  ],
  "description": "A mace wrapped in saint-bones, built to break the restless dead."
});

registerMagicWeapon("magic-undead-wraithbite-longsword", "longsword", "Wraithbite Longsword", "rare", 6500, {
  "requiresAttunement": true,
  "enhancementBonus": 1,
  "extraDamage": [
    {
      "count": 1,
      "sides": 6,
      "type": "necrotic"
    }
  ],
  "tags": [
    "undead",
    "necrotic",
    "grave",
    "wraith"
  ],
  "description": "A translucent blade whose edge lingers after the swing."
});

registerMagicWeapon("magic-undead-cryptmoon-longbow", "longbow", "Cryptmoon Longbow", "rare", 7000, {
  "requiresAttunement": true,
  "enhancementBonus": 1,
  "extraDamage": [
    {
      "count": 1,
      "sides": 6,
      "type": "cold"
    }
  ],
  "tags": [
    "undead",
    "necrotic",
    "grave",
    "moon",
    "cold"
  ],
  "description": "Its arrows fall silent and frost-white, like moonlight in a tomb."
});

registerMagicWeapon("magic-undead-mourning-halberd", "halberd", "Mourning Halberd", "very rare", 24000, {
  "requiresAttunement": true,
  "enhancementBonus": 2,
  "extraDamage": [
    {
      "count": 1,
      "sides": 8,
      "type": "necrotic"
    }
  ],
  "tags": [
    "undead",
    "necrotic",
    "grave",
    "halberd"
  ],
  "description": "A polearm carried by funeral knights who never reached their graves."
});

registerMagicWeapon("magic-undead-saintfire-warhammer", "warhammer", "Saintfire Warhammer", "very rare", 26000, {
  "requiresAttunement": true,
  "enhancementBonus": 2,
  "extraDamage": [
    {
      "count": 1,
      "sides": 8,
      "type": "radiant"
    }
  ],
  "tags": [
    "undead",
    "necrotic",
    "grave",
    "radiant",
    "hammer"
  ],
  "description": "A relic hammer that burns cold bodies with white-gold fire."
});

registerMagicArmor("magic-undead-bonewarden-shield", "shield", "Bonewarden Shield", "uncommon", 1200, {
  "requiresAttunement": true,
  "enhancementBonus": 1,
  "resistances": [
    "necrotic"
  ],
  "tags": [
    "undead",
    "necrotic",
    "grave",
    "shield",
    "bone"
  ],
  "description": "A shield banded with warding bone-script."
});

registerMagicArmor("magic-undead-graveplate-chain-mail", "chain-mail", "Graveplate Chain Mail", "rare", 6200, {
  "requiresAttunement": true,
  "enhancementBonus": 1,
  "resistances": [
    "necrotic"
  ],
  "tags": [
    "undead",
    "necrotic",
    "grave",
    "chain-mail"
  ],
  "description": "Blackened chain mail that muffles the heartbeat."
});

// IMPLEMENTATION NOTE: Later hook: bonus to stealth/investigation checks inside tombs or against undead.
registerMagicArmor("magic-undead-shroud-leather", "leather", "Shroud Leather", "uncommon", 900, {
  "enhancementBonus": 1,
  "tags": [
    "undead",
    "necrotic",
    "grave",
    "shroud",
    "stealth"
  ],
  "description": "Pale leather stitched under burial shroud linen.",
  "implementation": "Stealth bonus against undead needs skill-check modifier hooks."
});

registerMagicArmor("magic-undead-deathknell-plate", "plate", "Deathknell Plate", "very rare", 32000, {
  "requiresAttunement": true,
  "enhancementBonus": 2,
  "resistances": [
    "necrotic",
    "cold"
  ],
  "vulnerabilities": [
    "radiant"
  ],
  "tags": [
    "undead",
    "necrotic",
    "grave",
    "plate",
    "cursed"
  ],
  "curse": {
    "name": "Bell of the Dead",
    "description": "You resist necrotic and cold, but become vulnerable to radiant damage."
  },
  "description": "Heavy plate that tolls softly when living blood spills."
});

registerMagicAccessory("magic-undead-ring-last-breath", "Ring of the Last Breath", [
  "ring1",
  "ring2"
], "uncommon", 1600, {
  "requiresAttunement": true,
  "effects": {
    "resistances": [
      "necrotic"
    ]
  },
  "tags": [
    "undead",
    "necrotic",
    "grave",
    "ring"
  ],
  "description": "Grants necrotic resistance."
});

// IMPLEMENTATION NOTE: Needs accessory extra-damage hook.
registerMagicAccessory("magic-undead-reliquary-gravesun", "Reliquary of the Gravesun", "amulet", "rare", 7000, {
  "requiresAttunement": true,
  "effects": {
    "resistances": [
      "necrotic"
    ],
    "extraDamage": [
      {
        "count": 1,
        "sides": 4,
        "type": "radiant"
      }
    ]
  },
  "tags": [
    "undead",
    "necrotic",
    "grave",
    "amulet",
    "radiant"
  ],
  "description": "Grants necrotic resistance and marks attacks with faint radiant force.",
  "implementation": "Accessory extra damage needs a hook that adds equipped accessory damage to weapon/spell attacks."
});

registerMagicAccessory("magic-undead-boots-tombstep", "Boots of Tombstep", "boots", "uncommon", 1300, {
  "requiresAttunement": true,
  "effects": {
    "initiativeBonus": 1,
    "speedBonusFeet": 5
  },
  "tags": [
    "undead",
    "necrotic",
    "grave",
    "boots"
  ],
  "description": "Grants +1 initiative and +5 ft. speed."
});

registerMagicAccessory("magic-undead-bracers-pallbearer", "Bracers of the Pallbearer", "bracers", "rare", 6200, {
  "requiresAttunement": true,
  "effects": {
    "maxHpBonus": 12
  },
  "tags": [
    "undead",
    "necrotic",
    "grave",
    "bracers"
  ],
  "description": "Grants +12 max HP."
});

// IMPLEMENTATION NOTE: Later hook: undead are less likely to target the wearer until attacked.
registerMagicAccessory("magic-undead-cloak-quiet-grave", "Cloak of the Quiet Grave", "cloak", "rare", 5800, {
  "requiresAttunement": true,
  "effects": {
    "acBonus": 1
  },
  "tags": [
    "undead",
    "necrotic",
    "grave",
    "cloak"
  ],
  "description": "Grants +1 AC.",
  "implementation": "Undead ignore/aggro reduction needs monster targeting AI tags."
});

registerMagicAccessory("magic-undead-crown-hollow-mourning", "Crown of Hollow Mourning", "head", "very rare", 21000, {
  "requiresAttunement": true,
  "effects": {
    "abilityScoreBonuses": {
      "cha": 2
    },
    "resistances": [
      "necrotic"
    ],
    "vulnerabilities": [
      "radiant"
    ]
  },
  "tags": [
    "undead",
    "necrotic",
    "grave",
    "head",
    "cursed"
  ],
  "description": "Grants +2 CHA and necrotic resistance, but radiant vulnerability."
});

// IMPLEMENTATION NOTE: Needs temporary buff handling; intended necrotic resistance for current dungeon.
registerMagicConsumable("magic-undead-necrotic-ward-draught", "Necrotic Ward Draught", "potion", "uncommon", 500, {
  "effects": {
    "resistances": [
      "necrotic"
    ]
  },
  "tags": [
    "undead",
    "necrotic",
    "grave",
    "potion",
    "ward"
  ],
  "description": "Drink to resist grave-cold magic for the current dungeon.",
  "use": {
    "kind": "buff",
    "resource": "bonusAction",
    "consume": true,
    "duration": "newDungeon",
    "effects": {
      "resistances": [
        "necrotic"
      ]
    },
    "description": "Gain necrotic resistance for the current dungeon."
  },
  "implementation": "Needs temporary resistance buff support."
});

registerMagicWondrous("magic-undead-barrowcrown-gravebreakers-lantern", "Gravebreaker's Lantern", [
  "mainHand",
  "offHand"
], "uncommon", 1800, {
  "requiresAttunement": true,
  "weightLb": 2,
  "tags": [
    "undead",
    "necrotic",
    "grave",
    "lantern",
    "light",
    "barrowcrown"
  ],
  "description": "A dented grave-robber's lantern whose flame burns pale blue near the restless dead. While holding this lantern, you can use a bonus action to cast its light onto one creature you can see within 30 feet. Until the start of your next turn, that creature cannot benefit from being invisible, and if it is undead, it also cannot regain hit points. Grave-Flare: once per long rest when an undead creature starts its turn within 20 feet of you, you can cause the lantern to flare. The creature must make a DC 13 Wisdom saving throw or be frightened of you until the end of its next turn. Curse-Scent: the lantern glows faintly when within 30 feet of a cursed object, hidden burial chamber, or active necromantic magic.",
  "properties": [
    "Bonus action: reveal one creature within 30 ft until your next turn and block undead healing.",
    "Once per long rest: DC 13 WIS save or one nearby undead is frightened until end of its next turn.",
    "Glows near cursed objects, hidden burial chambers, or active necromantic magic."
  ],
  "use": {
    "kind": "special",
    "resource": "bonusAction",
    "consume": false,
    "target": "one creature within 30 ft",
    "description": "Cast pale lantern-light onto one visible creature within 30 feet. Until your next turn, it cannot benefit from being invisible, and undead targets cannot regain hit points."
  },
  "implementation": "The reveal, undead healing lockout, Grave-Flare fear save, and Curse-Scent detection need bespoke dungeon/combat hooks."
});

registerMagicArmor("magic-undead-barrowcrown-shield-drowned-legion", "shield", "Shield of the Drowned Legion", "rare", 7200, {
  "requiresAttunement": true,
  "enhancementBonus": 1,
  "tags": [
    "undead",
    "necrotic",
    "grave",
    "shield",
    "barrowcrown"
  ],
  "description": "This shield is made from dark iron and decorated with hundreds of tiny bone-white faces. You gain a +1 bonus to AC while wielding this shield. Legion Wall: when a creature you can see hits you with a melee attack, you can use your reaction to reduce the damage by 1d8 + your proficiency bonus, as spectral soldiers rise around you. Drowned Advance: once per short rest, when you take the Dodge action, you may move up to 10 feet without provoking opportunity attacks. Bone-Bound: you have advantage on saving throws against being knocked prone or moved against your will.",
  "properties": [
    "Reaction: reduce melee damage by 1d8 + proficiency bonus.",
    "Once per short rest: move up to 10 ft after Dodging without provoking opportunity attacks.",
    "Advantage on saves against being knocked prone or moved against your will."
  ],
  "implementation": "The +1 shield AC is active through the armor data. Legion Wall, Drowned Advance, and Bone-Bound need reaction, Dodge, and forced-movement hooks."
});

registerMagicWondrous("magic-undead-barrowcrown-black-market-coin", "Black Market Coin", [
  "belt1",
  "belt2",
  "belt3",
  "belt4",
  "belt5"
], "rare", 6500, {
  "requiresAttunement": true,
  "weightLb": 0,
  "tags": [
    "undead",
    "necrotic",
    "grave",
    "coin",
    "cursed",
    "barrowcrown"
  ],
  "description": "A heavy black coin stamped with a skull on one side and a crown on the other. It is always cold and always returns to your pocket after being thrown. Paid in Blood: when you hit a creature with a weapon attack, you may flip the coin as a free flourish once per turn. Roll a d6. On 1-3, you take necrotic damage equal to your proficiency bonus. On 4-6, the attack deals extra necrotic damage equal to twice your proficiency bonus. Unfair Bargain: once per long rest, when you miss an attack roll, you may choose to hit instead. After the attack resolves, you suffer one level of exhaustion, or you take necrotic damage equal to twice your character level.",
  "properties": [
    "Once per turn on weapon hit: roll d6. 1-3 hurts you for necrotic damage equal to proficiency bonus; 4-6 adds necrotic damage equal to twice proficiency bonus.",
    "Once per long rest: turn a missed attack into a hit, then suffer 1 exhaustion or necrotic damage equal to twice your level.",
    "Always returns to your pocket after being thrown."
  ],
  "curse": {
    "name": "Paid in Blood",
    "description": "The coin's strongest bargain always demands blood, exhaustion, or worse."
  },
  "implementation": "Paid in Blood and Unfair Bargain need attack-roll choice prompts, once-per-turn tracking, long-rest tracking, and exhaustion/damage payment hooks."
});

registerMagicWeapon("magic-undead-barrowcrown-bell-ringers-maul", "maul", "Bell-Ringer's Maul", "rare", 7800, {
  "requiresAttunement": true,
  "enhancementBonus": 1,
  "tags": [
    "undead",
    "necrotic",
    "grave",
    "maul",
    "thunder",
    "barrowcrown"
  ],
  "description": "This heavy weapon is forged from cracked bell-bronze. When swung, it tolls with a deep funeral note. You gain a +1 bonus to attack and damage rolls made with this weapon. Funeral Toll: once per turn, when you hit a creature with this weapon, you may cause the bell-note to ring out. One different creature of your choice within 10 feet of the target takes thunder damage equal to your proficiency bonus. Resonant Strike: this weapon deals double damage to unattended objects and structures made of stone, bone, or brittle metal.",
  "properties": [
    "Once per turn on hit: another creature within 10 ft of the target takes thunder damage equal to your proficiency bonus.",
    "Deals double damage to unattended objects and structures made of stone, bone, or brittle metal."
  ],
  "implementation": "The +1 attack and damage bonus is active through weapon magic data. Funeral Toll and Resonant Strike need conditional rider/object-damage hooks."
});

registerMagicWeapon("magic-undead-barrowcrown-bell-ringers-warhammer", "warhammer", "Bell-Ringer's Warhammer", "rare", 7600, {
  "requiresAttunement": true,
  "enhancementBonus": 1,
  "tags": [
    "undead",
    "necrotic",
    "grave",
    "warhammer",
    "thunder",
    "barrowcrown"
  ],
  "description": "This heavy weapon is forged from cracked bell-bronze. When swung, it tolls with a deep funeral note. You gain a +1 bonus to attack and damage rolls made with this weapon. Funeral Toll: once per turn, when you hit a creature with this weapon, you may cause the bell-note to ring out. One different creature of your choice within 10 feet of the target takes thunder damage equal to your proficiency bonus. Resonant Strike: this weapon deals double damage to unattended objects and structures made of stone, bone, or brittle metal.",
  "properties": [
    "Once per turn on hit: another creature within 10 ft of the target takes thunder damage equal to your proficiency bonus.",
    "Deals double damage to unattended objects and structures made of stone, bone, or brittle metal."
  ],
  "implementation": "The +1 attack and damage bonus is active through weapon magic data. Funeral Toll and Resonant Strike need conditional rider/object-damage hooks."
});

registerMagicAccessory("magic-undead-barrowcrown-ring-last-heir", "Ring of the Last Heir", [
  "ring1",
  "ring2"
], "rare", 8200, {
  "requiresAttunement": true,
  "tags": [
    "undead",
    "necrotic",
    "grave",
    "ring",
    "royal",
    "barrowcrown"
  ],
  "description": "A gold signet ring bearing the crest of the buried dynasty. It grows warm when worn by someone standing before a throne, altar, or battlefield. Royal Command: once per short rest, when you hit a creature with a weapon attack, you can command it to kneel. The target must make a DC 14 Wisdom saving throw. On a failure, it falls prone and its speed becomes 0 until the start of your next turn. Creatures immune to being charmed have advantage on this save. Blood Remembers: when you are reduced to 0 hit points but not killed outright, you can use your reaction to drop to 1 hit point instead. Once this property is used, it cannot be used again until the next dawn.",
  "properties": [
    "Once per short rest on weapon hit: DC 14 WIS save or the target falls prone and speed becomes 0 until your next turn.",
    "Charm-immune creatures have advantage on the Royal Command save.",
    "Once per long rest: use your reaction when reduced to 0 HP to drop to 1 HP instead."
  ],
  "use": {
    "kind": "special",
    "resource": "reaction",
    "consume": false,
    "charges": {
      "max": 1,
      "refresh": "newDungeon"
    },
    "description": "Blood Remembers: when reduced to 0 hit points but not killed outright, drop to 1 hit point instead."
  },
  "implementation": "Royal Command needs an on-hit short-rest rider with DC 14 WIS prone/speed lock. Blood Remembers needs a death-prevention reaction hook; the use data marks it as one charge until a dawn/rest-equivalent refresh exists."
});

registerMagicWeapon("magic-undead-barrowcrown-crownshard-shortsword", "shortsword", "Crownshard Shortsword", "very rare", 32000, {
  "requiresAttunement": true,
  "enhancementBonus": 2,
  "effects": {
    "abilityScorePenalties": {
      "wis": -4
    }
  },
  "tags": [
    "undead",
    "necrotic",
    "grave",
    "shortsword",
    "radiant",
    "cursed",
    "barrowcrown"
  ],
  "curse": {
    "name": "Burden",
    "description": "While attuned to this weapon, you occasionally hear the whispers of dead rulers. Your Wisdom score has a -4 penalty."
  },
  "description": "This weapon contains a broken shard of the Barrow Crown set into its guard. Black iron veins run through the blade like cracks in old stone. You gain a +2 bonus to attack and damage rolls made with this weapon. No King Above Me: when you hit a creature that is charmed, frightened, possessed, magically commanded, or undead, the attack deals an extra 1d8 radiant or necrotic damage; choose the damage type when you hit. Sever Command: once per short rest, when you hit an undead creature with this weapon, you may attempt to command or dominate it. The target must make a DC 16 Charisma saving throw. On a failure, the undead becomes an AI ally for the duration of this combat; after combat it turns to dust and leaves nothing behind. Crownbreaker: once per long rest, when you score a critical hit, you may force all hostile creatures of your choice within 15 feet to make a DC 16 Wisdom saving throw. On a failure, a creature is frightened of you until the end of your next turn. Burden: while attuned to this weapon, your Wisdom score has a -4 penalty.",
  "properties": [
    "Conditional hit: +1d8 radiant or necrotic damage against charmed, frightened, possessed, magically commanded, or undead targets.",
    "Once per short rest on undead hit: DC 16 CHA save or the undead becomes an AI ally for this combat, then turns to dust.",
    "Once per long rest on critical hit: chosen hostile creatures within 15 ft make DC 16 WIS save or become frightened until end of your next turn."
  ],
  "implementation": "The +2 attack/damage bonus and -4 WIS curse are active through magic data. No King Above Me, Sever Command, Crownbreaker, and post-combat dusting need conditional rider and AI allegiance hooks."
});

registerMagicWeapon("magic-undead-barrowcrown-crownshard-longsword", "longsword", "Crownshard Longsword", "very rare", 34000, {
  "requiresAttunement": true,
  "enhancementBonus": 2,
  "effects": {
    "abilityScorePenalties": {
      "wis": -4
    }
  },
  "tags": [
    "undead",
    "necrotic",
    "grave",
    "longsword",
    "radiant",
    "cursed",
    "barrowcrown"
  ],
  "curse": {
    "name": "Burden",
    "description": "While attuned to this weapon, you occasionally hear the whispers of dead rulers. Your Wisdom score has a -4 penalty."
  },
  "description": "This weapon contains a broken shard of the Barrow Crown set into its guard. Black iron veins run through the blade like cracks in old stone. You gain a +2 bonus to attack and damage rolls made with this weapon. No King Above Me: when you hit a creature that is charmed, frightened, possessed, magically commanded, or undead, the attack deals an extra 1d8 radiant or necrotic damage; choose the damage type when you hit. Sever Command: once per short rest, when you hit an undead creature with this weapon, you may attempt to command or dominate it. The target must make a DC 16 Charisma saving throw. On a failure, the undead becomes an AI ally for the duration of this combat; after combat it turns to dust and leaves nothing behind. Crownbreaker: once per long rest, when you score a critical hit, you may force all hostile creatures of your choice within 15 feet to make a DC 16 Wisdom saving throw. On a failure, a creature is frightened of you until the end of your next turn. Burden: while attuned to this weapon, your Wisdom score has a -4 penalty.",
  "properties": [
    "Conditional hit: +1d8 radiant or necrotic damage against charmed, frightened, possessed, magically commanded, or undead targets.",
    "Once per short rest on undead hit: DC 16 CHA save or the undead becomes an AI ally for this combat, then turns to dust.",
    "Once per long rest on critical hit: chosen hostile creatures within 15 ft make DC 16 WIS save or become frightened until end of your next turn."
  ],
  "implementation": "The +2 attack/damage bonus and -4 WIS curse are active through magic data. No King Above Me, Sever Command, Crownbreaker, and post-combat dusting need conditional rider and AI allegiance hooks."
});

registerMagicWeapon("magic-undead-barrowcrown-crownshard-greatsword", "greatsword", "Crownshard Greatsword", "very rare", 36000, {
  "requiresAttunement": true,
  "enhancementBonus": 2,
  "effects": {
    "abilityScorePenalties": {
      "wis": -4
    }
  },
  "tags": [
    "undead",
    "necrotic",
    "grave",
    "greatsword",
    "radiant",
    "cursed",
    "barrowcrown"
  ],
  "curse": {
    "name": "Burden",
    "description": "While attuned to this weapon, you occasionally hear the whispers of dead rulers. Your Wisdom score has a -4 penalty."
  },
  "description": "This weapon contains a broken shard of the Barrow Crown set into its guard. Black iron veins run through the blade like cracks in old stone. You gain a +2 bonus to attack and damage rolls made with this weapon. No King Above Me: when you hit a creature that is charmed, frightened, possessed, magically commanded, or undead, the attack deals an extra 1d8 radiant or necrotic damage; choose the damage type when you hit. Sever Command: once per short rest, when you hit an undead creature with this weapon, you may attempt to command or dominate it. The target must make a DC 16 Charisma saving throw. On a failure, the undead becomes an AI ally for the duration of this combat; after combat it turns to dust and leaves nothing behind. Crownbreaker: once per long rest, when you score a critical hit, you may force all hostile creatures of your choice within 15 feet to make a DC 16 Wisdom saving throw. On a failure, a creature is frightened of you until the end of your next turn. Burden: while attuned to this weapon, your Wisdom score has a -4 penalty.",
  "properties": [
    "Conditional hit: +1d8 radiant or necrotic damage against charmed, frightened, possessed, magically commanded, or undead targets.",
    "Once per short rest on undead hit: DC 16 CHA save or the undead becomes an AI ally for this combat, then turns to dust.",
    "Once per long rest on critical hit: chosen hostile creatures within 15 ft make DC 16 WIS save or become frightened until end of your next turn."
  ],
  "implementation": "The +2 attack/damage bonus and -4 WIS curse are active through magic data. No King Above Me, Sever Command, Crownbreaker, and post-combat dusting need conditional rider and AI allegiance hooks."
});

window.DungeonContent.register("lootTables", "magicUndeadItems", {
  name: "Undead Magic Items",
  itemIds: packItemIds,
  entries: packItemIds.map((id) => {
    const item = window.DungeonContent.get("items", id);
    return {
      id,
      name: item?.name ?? id,
      kind: item?.loot?.kind ?? "magic item",
      rarity: item?.loot?.rarity ?? "uncommon",
      priceGp: item?.loot?.priceGp ?? 1000,
      weight: item?.loot?.dropWeight ?? 1,
    };
  }),
});
})();
