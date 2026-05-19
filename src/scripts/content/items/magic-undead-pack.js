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

  window.DungeonContent.register("items", id, {
    ...base,
    name,
    type: "weapon",
    cost: gp(priceGp),
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
      resistances: magic.resistances ?? [],
      vulnerabilities: magic.vulnerabilities ?? [],
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

  window.DungeonContent.register("items", id, {
    ...base,
    name,
    type: "armor",
    cost: gp(priceGp),
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
      acBonusAppliedToArmor: acBonus,
      resistances,
      vulnerabilities,
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

  window.DungeonContent.register("items", id, {
    name,
    type: "accessory",
    category: slotGroup.toLowerCase(),
    cost: gp(priceGp),
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
      effects,
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
