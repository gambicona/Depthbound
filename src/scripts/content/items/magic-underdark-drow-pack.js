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


// Underdark and Drow Magic Items

registerMagicWeapon("magic-underdark-drow-venom-rapier", "rapier", "Drow Venom Rapier", "rare", 6600, {
  "enhancementBonus": 1,
  "extraDamage": [
    {
      "count": 1,
      "sides": 6,
      "type": "poison"
    }
  ],
  "tags": [
    "underdark",
    "drow",
    "poison",
    "rapier"
  ],
  "description": "A black rapier lacquered in alchemical spider venom."
});

registerMagicWeapon("magic-underdark-spiderfang-dagger", "dagger", "Spiderfang Dagger", "uncommon", 800, {
  "enhancementBonus": 1,
  "extraDamage": [
    {
      "count": 1,
      "sides": 4,
      "type": "poison"
    }
  ],
  "tags": [
    "underdark",
    "drow",
    "poison",
    "spider",
    "dagger"
  ],
  "description": "A hooked dagger shaped like a spider's fang."
});

registerMagicWeapon("magic-underdark-faerzress-longbow", "longbow", "Faerzress Longbow", "rare", 7000, {
  "enhancementBonus": 1,
  "extraDamage": [
    {
      "count": 1,
      "sides": 6,
      "type": "psychic"
    }
  ],
  "tags": [
    "underdark",
    "drow",
    "poison",
    "faerzress",
    "bow"
  ],
  "description": "A bow strung with faintly luminous Underdark crystal fiber."
});

registerMagicWeapon("magic-underdark-umbral-scimitar", "scimitar", "Umbral Scimitar", "uncommon", 1000, {
  "enhancementBonus": 1,
  "extraDamage": [
    {
      "count": 1,
      "sides": 4,
      "type": "necrotic"
    }
  ],
  "tags": [
    "underdark",
    "drow",
    "poison",
    "shadow"
  ],
  "description": "A crescent blade that drinks torchlight from the air."
});

registerMagicWeapon("magic-underdark-deepstone-warhammer", "warhammer", "Deepstone Warhammer", "rare", 7200, {
  "enhancementBonus": 1,
  "extraDamage": [
    {
      "count": 1,
      "sides": 6,
      "type": "thunder"
    }
  ],
  "tags": [
    "underdark",
    "drow",
    "poison",
    "stone",
    "hammer"
  ],
  "description": "A hammer that echoes like a cave-in."
});

registerMagicWeapon("magic-underdark-matrons-whisper-shortsword", "shortsword", "Matron's Whisper Shortsword", "very rare", 23000, {
  "enhancementBonus": 2,
  "extraDamage": [
    {
      "count": 1,
      "sides": 8,
      "type": "poison"
    }
  ],
  "tags": [
    "underdark",
    "drow",
    "poison",
    "matron",
    "shortsword"
  ],
  "description": "A cruel drow blade that seems to approve of betrayal."
});

registerMagicArmor("magic-underdark-spider-silk-leather", "leather", "Spider-Silk Leather", "uncommon", 1100, {
  "enhancementBonus": 1,
  "resistances": [
    "poison"
  ],
  "tags": [
    "underdark",
    "drow",
    "poison",
    "spider",
    "silk"
  ],
  "description": "Supple armor woven from hardened spider silk."
});

// IMPLEMENTATION NOTE: Later hook: extra stealth or AC while in darkness/dim light.
registerMagicArmor("magic-underdark-drow-shadow-breastplate", "breastplate", "Drow Shadow Breastplate", "rare", 6800, {
  "enhancementBonus": 1,
  "resistances": [
    "necrotic"
  ],
  "tags": [
    "underdark",
    "drow",
    "poison",
    "shadow",
    "breastplate"
  ],
  "description": "Dark breastplate that blurs at the edges in dim light.",
  "implementation": "Dim-light stealth/AC bonus needs lighting-state hooks."
});

registerMagicArmor("magic-underdark-deepwarden-shield", "shield", "Deepwarden Shield", "rare", 6200, {
  "enhancementBonus": 1,
  "resistances": [
    "psychic"
  ],
  "tags": [
    "underdark",
    "drow",
    "poison",
    "shield",
    "deepwarden"
  ],
  "description": "A shield inset with dull violet crystal."
});

registerMagicArmor("magic-underdark-adamant-gloom-half-plate", "half-plate", "Adamant Gloom Half Plate", "very rare", 28000, {
  "enhancementBonus": 2,
  "resistances": [
    "poison",
    "psychic"
  ],
  "tags": [
    "underdark",
    "drow",
    "poison",
    "adamant",
    "half-plate"
  ],
  "description": "Half plate of black adamant and faerzress-lit runes."
});

// IMPLEMENTATION NOTE: Later hook: wearer can see normally in darkness / ignores dark-room penalties.
registerMagicAccessory("magic-underdark-ring-darkvision", "Ring of Deep Sight", [
  "ring1",
  "ring2"
], "uncommon", 1400, {
  "effects": {
    "initiativeBonus": 1
  },
  "tags": [
    "underdark",
    "drow",
    "poison",
    "ring",
    "darkvision"
  ],
  "description": "Grants +1 initiative.",
  "implementation": "Darkvision needs visibility/lighting rules."
});

// IMPLEMENTATION NOTE: Needs accessory extra-damage hook.
registerMagicAccessory("magic-underdark-amulet-lolths-venom", "Amulet of Lolth's Venom", "amulet", "rare", 6800, {
  "effects": {
    "resistances": [
      "poison"
    ],
    "extraDamage": [
      {
        "count": 1,
        "sides": 4,
        "type": "poison"
      }
    ]
  },
  "tags": [
    "underdark",
    "drow",
    "poison",
    "amulet",
    "spider"
  ],
  "description": "Grants poison resistance and venomous attacks.",
  "implementation": "Accessory extra damage needs attack hook support."
});

// IMPLEMENTATION NOTE: Later hook: ignore web difficult terrain; optional climbing movement.
registerMagicAccessory("magic-underdark-boots-webwalker", "Boots of the Webwalker", "boots", "rare", 5600, {
  "effects": {
    "speedBonusFeet": 10
  },
  "tags": [
    "underdark",
    "drow",
    "poison",
    "boots",
    "web"
  ],
  "description": "Grants +10 ft. speed.",
  "implementation": "Ignoring web terrain and wall/climb movement need terrain and movement-mode hooks."
});

registerMagicAccessory("magic-underdark-cloak-deep-shadow", "Cloak of Deep Shadow", "cloak", "rare", 6500, {
  "effects": {
    "acBonus": 1,
    "initiativeBonus": 2
  },
  "tags": [
    "underdark",
    "drow",
    "poison",
    "cloak",
    "shadow"
  ],
  "description": "Grants +1 AC and +2 initiative."
});

// IMPLEMENTATION NOTE: Needs ranged-only extra-damage support.
registerMagicAccessory("magic-underdark-bracers-spider-silk-archery", "Bracers of Spider-Silk Archery", "bracers", "uncommon", 1600, {
  "effects": {
    "extraDamage": [
      {
        "count": 1,
        "sides": 4,
        "type": "poison"
      }
    ]
  },
  "tags": [
    "underdark",
    "drow",
    "poison",
    "bracers",
    "archery"
  ],
  "description": "Intended to add poison damage to ranged attacks.",
  "implementation": "Needs ranged-only accessory damage hook."
});

// IMPLEMENTATION NOTE: Later hook: bonus to deception/intimidation dialogue checks.
registerMagicAccessory("magic-underdark-mask-matrons-lie", "Mask of the Matron's Lie", "head", "very rare", 19000, {
  "effects": {
    "abilityScoreBonuses": {
      "cha": 2
    },
    "resistances": [
      "psychic"
    ]
  },
  "tags": [
    "underdark",
    "drow",
    "poison",
    "head",
    "mask"
  ],
  "description": "Grants +2 CHA and psychic resistance.",
  "implementation": "Dialogue/deception bonuses need social skill hooks if those become relevant."
});

// IMPLEMENTATION NOTE: Secondary poison resistance needs temporary buff support.
registerMagicConsumable("magic-underdark-myconid-spore-draught", "Myconid Spore Draught", "potion", "uncommon", 500, {
  "tags": [
    "underdark",
    "plant",
    "myconid",
    "potion"
  ],
  "description": "A fungal tonic that numbs poison and closes wounds.",
  "use": {
    "kind": "healing",
    "resource": "bonusAction",
    "dice": {
      "count": 2,
      "sides": 6
    },
    "bonus": 2,
    "consume": true,
    "secondaryEffect": {
      "resistances": [
        "poison"
      ],
      "duration": "encounter"
    },
    "description": "Heal 2d6 + 2 HP; intended to grant poison resistance for the encounter."
  },
  "implementation": "Healing works if supported; secondary temporary poison resistance needs buff handling."
});

window.DungeonContent.register("lootTables", "magicUnderdarkDrowItems", {
  name: "Underdark and Drow Magic Items",
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
