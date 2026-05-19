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


// Forest Magic Items

registerMagicWeapon("magic-forest-thornbriar-sickle", "sickle", "Thornbriar Sickle", "uncommon", 650, {
  "enhancementBonus": 1,
  "extraDamage": [
    {
      "count": 1,
      "sides": 4,
      "type": "piercing"
    }
  ],
  "tags": [
    "forest",
    "nature",
    "plant",
    "thorn"
  ],
  "description": "A curved sickle grown from black briarwood and living thorns."
});

// IMPLEMENTATION NOTE: On a critical hit, later hook can root the target for 1 round.
registerMagicWeapon("magic-forest-verdant-longbow", "longbow", "Verdant Longbow", "uncommon", 1100, {
  "enhancementBonus": 1,
  "extraDamage": [
    {
      "count": 1,
      "sides": 4,
      "type": "poison"
    }
  ],
  "tags": [
    "forest",
    "nature",
    "bow",
    "poison"
  ],
  "description": "A greenwood bow whose arrows trail pollen and venomous sap.",
  "implementation": "The poison damage is supported as extra typed damage. Entangling on critical hits needs a movement-control hook."
});

registerMagicWeapon("magic-forest-moonlit-hunter-rapier", "rapier", "Moonlit Hunter Rapier", "rare", 6200, {
  "enhancementBonus": 1,
  "extraDamage": [
    {
      "count": 1,
      "sides": 6,
      "type": "radiant"
    }
  ],
  "tags": [
    "forest",
    "nature",
    "moon",
    "fey"
  ],
  "description": "A silver-green blade favored by hunters sworn to moonlit groves."
});

// IMPLEMENTATION NOTE: Later hook: heavy hits can push the target 1 tile if there is free space.
registerMagicWeapon("magic-forest-rootbreaker-maul", "maul", "Rootbreaker Maul", "rare", 7200, {
  "enhancementBonus": 1,
  "extraDamage": [
    {
      "count": 1,
      "sides": 6,
      "type": "thunder"
    }
  ],
  "tags": [
    "forest",
    "nature",
    "root",
    "thunder"
  ],
  "description": "A knotwood maul that lands like a falling ancient oak.",
  "implementation": "Extra thunder damage is immediate. Knockback needs forced-movement support."
});

registerMagicWeapon("magic-forest-amberleaf-scimitar", "scimitar", "Amberleaf Scimitar", "uncommon", 900, {
  "enhancementBonus": 1,
  "extraDamage": [
    {
      "count": 1,
      "sides": 4,
      "type": "fire"
    }
  ],
  "tags": [
    "forest",
    "nature",
    "autumn",
    "fire"
  ],
  "description": "An amber-edged blade warm with the last fire of autumn."
});

registerMagicWeapon("magic-forest-heartwood-greatsword", "greatsword", "Heartwood Greatsword", "very rare", 26000, {
  "enhancementBonus": 2,
  "extraDamage": [
    {
      "count": 1,
      "sides": 8,
      "type": "radiant"
    }
  ],
  "tags": [
    "forest",
    "nature",
    "heartwood",
    "guardian"
  ],
  "description": "A two-handed sword of sacred heartwood and pale gold."
});

registerMagicArmor("magic-forest-barkskin-leather", "leather", "Barkskin Leather", "uncommon", 1000, {
  "enhancementBonus": 1,
  "resistances": [
    "piercing"
  ],
  "tags": [
    "forest",
    "nature",
    "barkskin"
  ],
  "description": "Supple leather layered with thin bark plates."
});

registerMagicArmor("magic-forest-mossguard-shield", "shield", "Mossguard Shield", "uncommon", 1200, {
  "enhancementBonus": 1,
  "resistances": [
    "poison"
  ],
  "tags": [
    "forest",
    "nature",
    "moss",
    "shield"
  ],
  "description": "A round shield covered in living, toxin-drinking moss."
});

// IMPLEMENTATION NOTE: Later hook: gain bonus damage or AC against enemies that moved before attacking.
registerMagicArmor("magic-forest-stagwarden-breastplate", "breastplate", "Stagwarden Breastplate", "rare", 6500, {
  "enhancementBonus": 1,
  "tags": [
    "forest",
    "nature",
    "stag",
    "warden"
  ],
  "description": "A green-bronze breastplate crested with antler motifs.",
  "implementation": "The intended anti-charge brace bonus needs a reaction or opportunity-attack hook."
});

registerMagicArmor("magic-forest-elderbark-plate", "plate", "Elderbark Plate", "very rare", 30000, {
  "enhancementBonus": 2,
  "resistances": [
    "poison",
    "necrotic"
  ],
  "vulnerabilities": [
    "fire"
  ],
  "tags": [
    "forest",
    "nature",
    "elderbark"
  ],
  "description": "Heavy plate grown around ancient bark. Strong against rot, dangerous near flame."
});

registerMagicAccessory("magic-forest-cloak-falling-leaves", "Cloak of Falling Leaves", "cloak", "uncommon", 1400, {
  "effects": {
    "initiativeBonus": 2,
    "speedBonusFeet": 5
  },
  "tags": [
    "forest",
    "nature",
    "cloak",
    "leaf"
  ],
  "description": "Grants +2 initiative and +5 ft. speed while equipped."
});

registerMagicAccessory("magic-forest-ring-green-path", "Ring of the Green Path", [
  "ring1",
  "ring2"
], "uncommon", 1500, {
  "effects": {
    "resistances": [
      "poison"
    ]
  },
  "tags": [
    "forest",
    "nature",
    "ring"
  ],
  "description": "Grants poison resistance while equipped."
});

registerMagicAccessory("magic-forest-amulet-old-grove", "Amulet of the Old Grove", "amulet", "rare", 6200, {
  "effects": {
    "maxHpBonus": 10,
    "abilityScoreBonuses": {
      "wis": 1
    }
  },
  "tags": [
    "forest",
    "nature",
    "amulet",
    "grove"
  ],
  "description": "Grants +10 max HP and +1 WIS while equipped."
});

// IMPLEMENTATION NOTE: Later hook: ignore difficult terrain from roots, vines, brambles, moss, and forest tiles.
registerMagicAccessory("magic-forest-boots-rootstep", "Boots of Rootstep", "boots", "rare", 5200, {
  "effects": {
    "speedBonusFeet": 10
  },
  "tags": [
    "forest",
    "nature",
    "boots",
    "root"
  ],
  "description": "Grants +10 ft. speed.",
  "implementation": "Ignoring plant/forest difficult terrain needs terrain-tag movement checks."
});

// IMPLEMENTATION NOTE: Later hook: when hit by melee, attacker takes small piercing damage.
registerMagicAccessory("magic-forest-bracers-thornward", "Bracers of Thornward", "bracers", "rare", 7000, {
  "effects": {
    "acBonus": 1
  },
  "tags": [
    "forest",
    "nature",
    "bracers",
    "thorn"
  ],
  "description": "Grants +1 AC.",
  "implementation": "Thorn retaliation needs an on-hit reaction hook."
});

registerMagicAccessory("magic-forest-crown-seedlight", "Crown of Seedlight", "head", "rare", 6800, {
  "use": {
    "kind": "healing",
    "resource": "bonusAction",
    "dice": {
      "count": 3,
      "sides": 6
    },
    "bonus": 3,
    "consume": false,
    "charges": {
      "max": 1,
      "refresh": "newDungeon"
    },
    "description": "Once per new dungeon, heal 3d6 + 3 HP as a bonus action."
  },
  "tags": [
    "forest",
    "nature",
    "head",
    "healing"
  ],
  "description": "A living crown of pale seeds that bloom when blood falls."
});

// IMPLEMENTATION NOTE: Needs temporary buff handling; intended +2 AC for the current dungeon.
registerMagicConsumable("magic-forest-potion-barkskin", "Potion of Barkskin", "potion", "uncommon", 500, {
  "effects": {
    "acBonus": 2
  },
  "tags": [
    "forest",
    "nature",
    "potion",
    "barkskin"
  ],
  "description": "Drink to harden the skin like bark for the current dungeon.",
  "use": {
    "kind": "buff",
    "resource": "bonusAction",
    "consume": true,
    "duration": "newDungeon",
    "effects": {
      "acBonus": 2
    },
    "description": "Gain +2 AC for the current dungeon."
  },
  "implementation": "Timed/dungeon-long AC buffs need temporary-effect support."
});

registerMagicConsumable("magic-forest-sapdraught", "Sapdraught", "potion", "common", 180, {
  "tags": [
    "forest",
    "nature",
    "potion",
    "healing"
  ],
  "description": "Thick golden sap that closes wounds.",
  "use": {
    "kind": "healing",
    "resource": "bonusAction",
    "dice": {
      "count": 2,
      "sides": 6
    },
    "bonus": 2,
    "consume": true,
    "description": "Heal 2d6 + 2 HP."
  }
});

// IMPLEMENTATION NOTE: Needs temporary weapon-buff support; intended +1d4 piercing for one encounter.
registerMagicConsumable("magic-forest-briar-oil", "Briar Oil", "oil", "uncommon", 450, {
  "effects": {
    "extraDamage": [
      {
        "count": 1,
        "sides": 4,
        "type": "piercing"
      }
    ]
  },
  "tags": [
    "forest",
    "nature",
    "oil",
    "thorn"
  ],
  "description": "Coat a weapon in thorn-sap to add piercing pain.",
  "use": {
    "kind": "weaponBuff",
    "resource": "bonusAction",
    "consume": true,
    "duration": "encounter",
    "extraDamage": {
      "count": 1,
      "sides": 4,
      "type": "piercing"
    },
    "description": "Your weapon deals +1d4 piercing damage for one encounter."
  },
  "implementation": "Needs temporary weapon-buff support."
});

window.DungeonContent.register("lootTables", "magicForestItems", {
  name: "Forest Magic Items",
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
