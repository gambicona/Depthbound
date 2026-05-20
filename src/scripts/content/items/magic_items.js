(() => {
const gp = (amount) => ({ amount, unit: "gp", text: `${amount} gp` });

const rarityRank = {
  common: 1,
  uncommon: 2,
  rare: 3,
  "very rare": 4,
  legendary: 5,
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function slug(text) {
  return String(text)
    .toLowerCase()
    .replace(/\+/, "plus-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function dropWeightForPrice(priceGp, rarity) {
  const rarityPenalty = rarityRank[rarity] ?? 2;
  const pricePenalty = Math.sqrt(Math.max(1, priceGp));
  return Math.max(1, Math.round(500 / (rarityPenalty * pricePenalty)));
}

function getBaseItem(baseItemId) {
  const base = window.DungeonContent.get("items", baseItemId);
  if (!base) {
    console.warn(`[magic_items] Missing base item: ${baseItemId}`);
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
      reason: "magic items are loot-only for now",
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
    },
  });
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
      reason: "magic items are loot-only for now",
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
    },
  });
}

const d4 = (type) => ({ count: 1, sides: 4, type });
const d6 = (type) => ({ count: 1, sides: 6, type });
const d8 = (type) => ({ count: 1, sides: 8, type });
const twoD6 = (type) => ({ count: 2, sides: 6, type });

// Magic weapons: simple enhancement weapons.
registerMagicWeapon("magic-longsword-plus-1", "longsword", "Longsword +1", "uncommon", 750, { enhancementBonus: 1 });
registerMagicWeapon("magic-longsword-plus-2", "longsword", "Longsword +2", "rare", 6000, { enhancementBonus: 2 });
registerMagicWeapon("magic-longsword-plus-3", "longsword", "Longsword +3", "very rare", 28000, { enhancementBonus: 3 });

registerMagicWeapon("magic-dagger-plus-1", "dagger", "Dagger +1", "uncommon", 500, { enhancementBonus: 1 });
registerMagicWeapon("magic-dagger-plus-2", "dagger", "Dagger +2", "rare", 4500, { enhancementBonus: 2 });

registerMagicWeapon("magic-rapier-plus-1", "rapier", "Rapier +1", "uncommon", 900, { enhancementBonus: 1 });
registerMagicWeapon("magic-rapier-plus-2", "rapier", "Rapier +2", "rare", 7000, { enhancementBonus: 2 });

registerMagicWeapon("magic-greatsword-plus-1", "greatsword", "Greatsword +1", "uncommon", 1200, { enhancementBonus: 1 });
registerMagicWeapon("magic-greatsword-plus-2", "greatsword", "Greatsword +2", "rare", 9000, { enhancementBonus: 2 });

registerMagicWeapon("magic-longbow-plus-1", "longbow", "Longbow +1", "uncommon", 1100, { enhancementBonus: 1 });
registerMagicWeapon("magic-longbow-plus-2", "longbow", "Longbow +2", "rare", 8500, { enhancementBonus: 2 });

registerMagicWeapon("magic-warhammer-plus-1", "warhammer", "Warhammer +1", "uncommon", 850, { enhancementBonus: 1 });
registerMagicWeapon("magic-warhammer-plus-2", "warhammer", "Warhammer +2", "rare", 6500, { enhancementBonus: 2 });
registerMagicWeapon("magic-embervein-claim-hammer", "warhammer", "Embervein Claim Hammer", "uncommon", 500, {
  attackBonus: 1,
  damageBonus: 0,
  extraDamage: d4("fire"),
  unique: true,
  dropWeight: 1,
  tags: ["embervein", "forge", "dwarf", "ashmantle", "quest-item", "quest:borren-claim-hammer"],
  description: "A dwarven claim hammer with an Ashmantle maker's mark under the soot. It gives +1 to attack rolls and deals an extra 1d4 fire damage.",
});

// Magic weapons: elemental and themed weapons.
registerMagicWeapon("magic-acid-dagger", "dagger", "Acid Dagger", "uncommon", 850, {
  extraDamage: d4("acid"),
  description: "Deals its normal dagger damage plus 1d4 acid damage.",
});

registerMagicWeapon("magic-ember-dagger", "dagger", "Ember Dagger", "uncommon", 850, {
  extraDamage: d4("fire"),
  description: "Deals its normal dagger damage plus 1d4 fire damage.",
});

registerMagicWeapon("magic-frost-knife", "dagger", "Frost Knife", "uncommon", 850, {
  extraDamage: d4("cold"),
  description: "Deals its normal dagger damage plus 1d4 cold damage.",
});

registerMagicWeapon("magic-venom-rapier", "rapier", "Venom Rapier", "rare", 6500, {
  attackBonus: 1,
  damageBonus: 1,
  extraDamage: d6("poison"),
  description: "A +1 rapier that deals an extra 1d6 poison damage.",
});

registerMagicWeapon("magic-thunder-maul", "maul", "Thunder Maul", "rare", 7000, {
  attackBonus: 1,
  damageBonus: 1,
  extraDamage: d6("thunder"),
  description: "A +1 maul that deals an extra 1d6 thunder damage.",
});

registerMagicWeapon("magic-sunspark-mace", "mace", "Sunspark Mace", "rare", 6200, {
  attackBonus: 1,
  damageBonus: 1,
  extraDamage: d6("radiant"),
  description: "A +1 mace that deals an extra 1d6 radiant damage.",
});

registerMagicWeapon("magic-gravecold-battleaxe", "battleaxe", "Gravecold Battleaxe", "rare", 7000, {
  attackBonus: 1,
  damageBonus: 1,
  extraDamage: d6("cold"),
  description: "A +1 battleaxe that deals an extra 1d6 cold damage.",
});

registerMagicWeapon("magic-stormstring-longbow", "longbow", "Stormstring Longbow", "rare", 8000, {
  attackBonus: 1,
  damageBonus: 1,
  extraDamage: d6("lightning"),
  description: "A +1 longbow that deals an extra 1d6 lightning damage.",
});

registerMagicWeapon("magic-coalsoul-greatsword", "greatsword", "Coalsoul Greatsword", "rare", 9500, {
  attackBonus: 1,
  damageBonus: 1,
  extraDamage: twoD6("fire"),
  description: "A +1 greatsword that deals an extra 2d6 fire damage.",
});

registerMagicWeapon("magic-voidglass-shortsword", "shortsword", "Voidglass Shortsword", "rare", 6800, {
  attackBonus: 1,
  damageBonus: 1,
  extraDamage: d6("necrotic"),
  description: "A +1 shortsword that deals an extra 1d6 necrotic damage.",
});

registerMagicWeapon("magic-forcebreaker-pike", "pike", "Forcebreaker Pike", "very rare", 32000, {
  attackBonus: 2,
  damageBonus: 2,
  extraDamage: d8("force"),
  description: "A +2 pike that deals an extra 1d8 force damage.",
});

registerMagicWeapon("magic-dragonfang-greatsword", "greatsword", "Dragonfang Greatsword", "very rare", 45000, {
  attackBonus: 2,
  damageBonus: 2,
  extraDamage: twoD6("fire"),
  description: "A +2 greatsword that deals an extra 2d6 fire damage.",
});

registerMagicWeapon("magic-starfall-halberd", "halberd", "Starfall Halberd", "legendary", 180000, {
  attackBonus: 3,
  damageBonus: 3,
  extraDamage: d8("radiant"),
  description: "A +3 halberd that deals an extra 1d8 radiant damage.",
});

// Cursed weapons.
registerMagicWeapon("magic-hungering-sickle", "sickle", "Hungering Sickle", "uncommon", 650, {
  attackBonus: 1,
  damageBonus: 1,
  extraDamage: d4("necrotic"),
  vulnerabilities: ["radiant"],
  curse: {
    name: "Light-Starved",
    description: "While equipped, the bearer is vulnerable to radiant damage.",
  },
  description: "A +1 sickle that deals an extra 1d4 necrotic damage, but makes the bearer vulnerable to radiant damage.",
});

registerMagicWeapon("magic-glass-edge-scimitar", "scimitar", "Glass-Edge Scimitar", "rare", 4200, {
  attackBonus: 2,
  damageBonus: 2,
  vulnerabilities: ["bludgeoning"],
  curse: {
    name: "Brittle Fortune",
    description: "While equipped, the bearer is vulnerable to bludgeoning damage.",
  },
  description: "A +2 scimitar with a brittle curse.",
});

// Enhancement armor and shields.
// AC bonuses are baked into the armor object, so these work with the current armorClass function.
registerMagicArmor("magic-leather-plus-1", "leather", "Leather Armor +1", "uncommon", 900, { enhancementBonus: 1 });
registerMagicArmor("magic-studded-leather-plus-1", "studded-leather", "Studded Leather +1", "uncommon", 1200, { enhancementBonus: 1 });

registerMagicArmor("magic-breastplate-plus-1", "breastplate", "Breastplate +1", "rare", 6000, { enhancementBonus: 1 });
registerMagicArmor("magic-half-plate-plus-1", "half-plate", "Half Plate +1", "rare", 7000, { enhancementBonus: 1 });
registerMagicArmor("magic-chain-mail-plus-1", "chain-mail", "Chain Mail +1", "rare", 5500, { enhancementBonus: 1 });
registerMagicArmor("magic-splint-plus-1", "splint", "Splint Armor +1", "rare", 6500, { enhancementBonus: 1 });
registerMagicArmor("magic-plate-plus-1", "plate", "Plate Armor +1", "rare", 9000, { enhancementBonus: 1 });
registerMagicArmor("magic-plate-plus-2", "plate", "Plate Armor +2", "very rare", 42000, { enhancementBonus: 2 });
registerMagicArmor("magic-plate-plus-3", "plate", "Plate Armor +3", "legendary", 165000, { enhancementBonus: 3 });

registerMagicArmor("magic-shield-plus-1", "shield", "Shield +1", "uncommon", 1000, { enhancementBonus: 1 });
registerMagicArmor("magic-shield-plus-2", "shield", "Shield +2", "rare", 8000, { enhancementBonus: 2 });
registerMagicArmor("magic-shield-plus-3", "shield", "Shield +3", "very rare", 38000, { enhancementBonus: 3 });

// Resistance armor.
// These are metadata for now until your later combat hook reads magic.resistances.
registerMagicArmor("magic-leather-of-acid-resistance", "leather", "Leather Armor of Acid Resistance", "rare", 7500, {
  resistances: ["acid"],
  description: "Light armor that grants resistance to acid damage.",
});

registerMagicArmor("magic-studded-leather-of-fire-resistance", "studded-leather", "Studded Leather of Fire Resistance", "rare", 9000, {
  resistances: ["fire"],
  description: "Light armor that grants resistance to fire damage.",
});

registerMagicArmor("magic-chain-mail-of-cold-resistance", "chain-mail", "Chain Mail of Cold Resistance", "rare", 8500, {
  resistances: ["cold"],
  description: "Heavy armor that grants resistance to cold damage.",
});

registerMagicArmor("magic-breastplate-of-lightning-resistance", "breastplate", "Breastplate of Lightning Resistance", "rare", 8500, {
  resistances: ["lightning"],
  description: "Medium armor that grants resistance to lightning damage.",
});

registerMagicArmor("magic-plate-of-necrotic-resistance", "plate", "Plate Armor of Necrotic Resistance", "very rare", 35000, {
  resistances: ["necrotic"],
  description: "Heavy armor that grants resistance to necrotic damage.",
});

registerMagicArmor("magic-shield-of-force-resistance", "shield", "Shield of Force Resistance", "very rare", 32000, {
  resistances: ["force"],
  description: "A shield that grants resistance to force damage.",
});

// Cursed armor with upside and downside.
registerMagicArmor("magic-frostfire-mail", "chain-mail", "Frostfire Mail", "rare", 6000, {
  resistances: ["cold", "fire"],
  vulnerabilities: ["slashing"],
  curse: {
    name: "Cracking Links",
    description: "The armor resists cold and fire, but its brittle links make the wearer vulnerable to slashing damage.",
  },
  description: "Chain mail with cold and fire resistance, cursed with slashing vulnerability.",
});

registerMagicArmor("magic-stonehide-breastplate", "breastplate", "Stonehide Breastplate", "rare", 6500, {
  acBonus: 1,
  resistances: ["bludgeoning"],
  vulnerabilities: ["lightning"],
  curse: {
    name: "Grounded Heart",
    description: "The wearer resists bludgeoning damage but is vulnerable to lightning damage.",
  },
  description: "A +1 breastplate with bludgeoning resistance and lightning vulnerability.",
});

registerMagicArmor("magic-needle-shield", "shield", "Needle Shield", "uncommon", 900, {
  resistances: ["piercing"],
  vulnerabilities: ["fire"],
  curse: {
    name: "Dry Thorns",
    description: "The shield resists piercing damage but makes the bearer vulnerable to fire damage.",
  },
  description: "A thorned shield that resists piercing damage, but catches magical flame too easily.",
});

registerMagicArmor("magic-sable-plate", "plate", "Sable Plate", "very rare", 30000, {
  acBonus: 1,
  resistances: ["necrotic", "cold"],
  vulnerabilities: ["radiant"],
  curse: {
    name: "Sunless Oath",
    description: "The wearer resists necrotic and cold damage but is vulnerable to radiant damage.",
  },
  description: "A +1 plate armor steeped in dead vows.",
});

const magicItemIds = window.DungeonContent
  .list("items")
  .filter((item) => item.tags?.includes("magic-item"))
  .map((item) => item.id);

window.DungeonContent.register("lootTables", "magicWeaponsAndArmor", {
  name: "Magic Weapons and Armor",
  itemIds: magicItemIds,
  entries: magicItemIds.map((id) => {
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
