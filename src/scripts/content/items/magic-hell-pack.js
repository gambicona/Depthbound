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


// Hell Magic Items

registerMagicWeapon("magic-hell-hellbrand-longsword", "longsword", "Hellbrand Longsword", "rare", 7500, {
  "requiresAttunement": true,
  "enhancementBonus": 1,
  "extraDamage": [
    {
      "count": 1,
      "sides": 6,
      "type": "fire"
    }
  ],
  "tags": [
    "hell",
    "fiend",
    "devil",
    "fire",
    "sword"
  ],
  "description": "A black sword branded with lawfully burning infernal script."
});

// IMPLEMENTATION NOTE: Later hook: first hit marks the target; next hit against it deals bonus fire or psychic damage.
registerMagicWeapon("magic-hell-contract-dagger", "dagger", "Infernal Contract Dagger", "uncommon", 900, {
  "requiresAttunement": true,
  "enhancementBonus": 1,
  "extraDamage": [
    {
      "count": 1,
      "sides": 4,
      "type": "fire"
    }
  ],
  "tags": [
    "hell",
    "fiend",
    "devil",
    "fire",
    "contract",
    "dagger"
  ],
  "description": "A signing knife used for contracts that demand blood.",
  "implementation": "Marked-debt damage over time needs a status effect hook."
});

// IMPLEMENTATION NOTE: Later hook: hit can pull target 1 tile closer.
registerMagicWeapon("magic-hell-barbed-chain-halberd", "halberd", "Barbed Chain Halberd", "rare", 6800, {
  "requiresAttunement": true,
  "enhancementBonus": 1,
  "extraDamage": [
    {
      "count": 1,
      "sides": 6,
      "type": "piercing"
    }
  ],
  "tags": [
    "hell",
    "fiend",
    "devil",
    "fire",
    "chain",
    "barbed"
  ],
  "description": "A hooked infernal polearm with red chain teeth.",
  "implementation": "Pulling a target needs forced-movement support."
});

registerMagicWeapon("magic-hell-brimstone-warhammer", "warhammer", "Brimstone Warhammer", "rare", 7000, {
  "requiresAttunement": true,
  "enhancementBonus": 1,
  "extraDamage": [
    {
      "count": 1,
      "sides": 6,
      "type": "fire"
    }
  ],
  "tags": [
    "hell",
    "fiend",
    "devil",
    "fire",
    "brimstone"
  ],
  "description": "A smoking hammer that strikes like a furnace door."
});

registerMagicWeapon("magic-hell-ashen-punisher-maul", "maul", "Ashen Punisher Maul", "very rare", 25000, {
  "requiresAttunement": true,
  "enhancementBonus": 2,
  "extraDamage": [
    {
      "count": 1,
      "sides": 8,
      "type": "fire"
    }
  ],
  "tags": [
    "hell",
    "fiend",
    "devil",
    "fire",
    "maul",
    "ash"
  ],
  "description": "A massive maul made for pit-judges and execution devils."
});

registerMagicWeapon("magic-hell-devils-due-longbow", "longbow", "Devil's Due Longbow", "very rare", 24000, {
  "requiresAttunement": true,
  "enhancementBonus": 2,
  "extraDamage": [
    {
      "count": 1,
      "sides": 8,
      "type": "fire"
    }
  ],
  "tags": [
    "hell",
    "fiend",
    "devil",
    "fire",
    "bow",
    "contract"
  ],
  "description": "Every arrow feels like a debt being collected."
});

registerMagicArmor("magic-hell-infernal-plate", "plate", "Infernal Plate", "very rare", 34000, {
  "requiresAttunement": true,
  "enhancementBonus": 2,
  "resistances": [
    "fire",
    "poison"
  ],
  "vulnerabilities": [
    "radiant"
  ],
  "tags": [
    "hell",
    "fiend",
    "devil",
    "fire",
    "plate",
    "cursed"
  ],
  "curse": {
    "name": "Hellbound Metal",
    "description": "The armor protects against fire and poison, but radiant damage burns through it."
  },
  "description": "Black-red plate cooled in devil blood."
});

registerMagicArmor("magic-hell-cinderhide-studded-leather", "studded-leather", "Cinderhide Studded Leather", "uncommon", 1200, {
  "requiresAttunement": true,
  "enhancementBonus": 1,
  "resistances": [
    "fire"
  ],
  "tags": [
    "hell",
    "fiend",
    "devil",
    "fire",
    "cinderhide"
  ],
  "description": "Studded leather cured in cinders and sulfur."
});

// IMPLEMENTATION NOTE: Later hook: blocking a melee hit deals small fire damage back.
registerMagicArmor("magic-hell-hellgate-shield", "shield", "Hellgate Shield", "rare", 7200, {
  "requiresAttunement": true,
  "enhancementBonus": 1,
  "resistances": [
    "fire"
  ],
  "tags": [
    "hell",
    "fiend",
    "devil",
    "fire",
    "shield",
    "gate"
  ],
  "description": "A shield shaped like the locked gate of a lower hell.",
  "implementation": "Reactive fire damage needs a block/on-hit hook."
});

registerMagicArmor("magic-hell-chainmail-nine-hells", "chain-mail", "Chain Mail of the Nine Hells", "rare", 8500, {
  "requiresAttunement": true,
  "enhancementBonus": 1,
  "resistances": [
    "fire",
    "poison"
  ],
  "tags": [
    "hell",
    "fiend",
    "devil",
    "fire",
    "chain-mail"
  ],
  "description": "Infernal chain links that hiss when touched by holy water."
});

// IMPLEMENTATION NOTE: Needs accessory extra-damage hook.
registerMagicAccessory("magic-hell-ring-hellfire", "Ring of Hellfire", [
  "ring1",
  "ring2"
], "rare", 6800, {
  "requiresAttunement": true,
  "effects": {
    "resistances": [
      "fire"
    ],
    "extraDamage": [
      {
        "count": 1,
        "sides": 4,
        "type": "fire"
      }
    ]
  },
  "tags": [
    "hell",
    "fiend",
    "devil",
    "fire",
    "ring"
  ],
  "description": "Grants fire resistance and adds hellfire to attacks.",
  "implementation": "Accessory extra damage needs attack hook support."
});

registerMagicAccessory("magic-hell-amulet-infernal-bargain", "Amulet of Infernal Bargain", "amulet", "rare", 6200, {
  "requiresAttunement": true,
  "effects": {
    "abilityScoreBonuses": {
      "cha": 2
    },
    "vulnerabilities": [
      "radiant"
    ]
  },
  "tags": [
    "hell",
    "fiend",
    "devil",
    "fire",
    "amulet",
    "cursed"
  ],
  "description": "Grants +2 CHA but radiant vulnerability."
});

registerMagicAccessory("magic-hell-boots-cinderstride", "Boots of Cinderstride", "boots", "uncommon", 1500, {
  "requiresAttunement": true,
  "effects": {
    "speedBonusFeet": 10,
    "resistances": [
      "fire"
    ]
  },
  "tags": [
    "hell",
    "fiend",
    "devil",
    "fire",
    "boots",
    "cinder"
  ],
  "description": "Grants +10 ft. speed and fire resistance."
});

// IMPLEMENTATION NOTE: Later hook: when reduced below half HP, create smoke/concealment once per dungeon.
registerMagicAccessory("magic-hell-cloak-smoke-sulfur", "Cloak of Smoke and Sulfur", "cloak", "rare", 6500, {
  "requiresAttunement": true,
  "effects": {
    "acBonus": 1,
    "initiativeBonus": 1
  },
  "tags": [
    "hell",
    "fiend",
    "devil",
    "fire",
    "cloak",
    "smoke"
  ],
  "description": "Grants +1 AC and +1 initiative.",
  "implementation": "Smoke concealment on low HP needs a triggered stealth/concealment hook."
});

registerMagicAccessory("magic-hell-gauntlets-pit", "Gauntlets of the Pit", "gauntlets", "rare", 7000, {
  "requiresAttunement": true,
  "effects": {
    "abilityScoreBonuses": {
      "str": 2
    }
  },
  "tags": [
    "hell",
    "fiend",
    "devil",
    "fire",
    "gauntlets"
  ],
  "description": "Grants +2 STR."
});

// IMPLEMENTATION NOTE: Later hook: can command/charm a low-category fiend once per dungeon.
registerMagicAccessory("magic-hell-crown-tyrant-flame", "Crown of Tyrant Flame", "head", "very rare", 22000, {
  "requiresAttunement": true,
  "effects": {
    "abilityScoreBonuses": {
      "cha": 2
    },
    "resistances": [
      "fire"
    ]
  },
  "tags": [
    "hell",
    "fiend",
    "devil",
    "fire",
    "head",
    "crown"
  ],
  "description": "Grants +2 CHA and fire resistance.",
  "implementation": "Commanding lesser fiends needs monster-tag charm/control logic."
});

registerMagicConsumable("magic-hell-infernal-draught", "Infernal Draught", "potion", "uncommon", 450, {
  "tags": [
    "hell",
    "fiend",
    "devil",
    "fire",
    "potion",
    "healing"
  ],
  "description": "Burning black liquor that seals wounds with scar tissue.",
  "use": {
    "kind": "healing",
    "resource": "bonusAction",
    "dice": {
      "count": 2,
      "sides": 6
    },
    "bonus": 4,
    "consume": true,
    "description": "Heal 2d6 + 4 HP."
  }
});

registerMagicConsumable("magic-hell-devils-contract-seal", "Devil's Contract Seal", "consumable", "rare", 1100, {
  "effects": {
    "attackBonus": 2,
    "damageBonus": 2
  },
  "tags": [
    "hell",
    "fiend",
    "devil",
    "fire",
    "contract",
    "buff"
  ],
  "description": "Break the seal to gain infernal precision for one encounter.",
  "use": {
    "kind": "buff",
    "resource": "bonusAction",
    "consume": true,
    "duration": "encounter",
    "effects": {
      "attackBonus": 2,
      "damageBonus": 2
    },
    "description": "Gain +2 attack and +2 damage for one encounter."
  },
  "implementation": "Temporary attack and damage bonuses are supported as a status effect."
});

window.DungeonContent.register("lootTables", "magicHellItems", {
  name: "Hell Magic Items",
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
