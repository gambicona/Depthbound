(() => {
/*
CODEX IMPLEMENTATION NOTES

This file intentionally stores passive and active magic effects as data. The items will already load and can be equipped because your inventory code only checks `slots`, but most bonuses need core hooks before they affect gameplay.

Recommended core hooks:
1. Add helper: equippedMagicItems(fighter)
   - Return all equipped items from every equipment slot where item.magic exists.

2. Add helper: magicEffects(fighter)
   - Combine effects from equippedMagicItems(fighter):
     - abilityScoreBonuses: add to STR/DEX/CON/INT/WIS/CHA.
     - maxHpBonus: add to max HP while equipped.
     - acBonus: add to armorClass after armor/shield calculation.
     - initiativeBonus: add when rolling initiative.
     - speedBonusFeet: add to movement speed.
     - resistances/vulnerabilities: apply during damage resolution.
     - attackBonus/damageBonus/extraDamage: apply to attacks if you later want accessory combat bonuses.

3. Update abilityScore(fighter, ability)
   - Base score should come from fighter.abilityScores as now.
   - Add equipped magic abilityScoreBonuses[ability].
   - Respect optional magic.effects.abilityScoreCaps[ability] if present.

4. Update refreshDerivedStats(fighter)
   - Avoid permanent max HP stacking. Store fighter.baseMaxHp once, then set fighter.maxHp = fighter.baseMaxHp + equipped maxHpBonus.
   - Clamp current HP down if an item is removed and hp > maxHp.

5. Update armorClass(fighter)
   - Calculate armor/shield AC as now.
   - Add total magic.effects.acBonus from equipped accessories.
   - If an effect has acBonusCondition, only apply it when the condition is true.
     Example: Bracers of Defense apply only when no torso armor and no shield are equipped.

6. Update damage application
   - Track damage as one or more typed packets, e.g. [{ amount, type }].
   - For each packet: if defender has resistance to that type, halve it; if vulnerable, double it.
   - If both exist, let them cancel out or choose a consistent rule.

7. Update usable item menu
   - Current use menu only shows belt slots.
   - Add equipped usable accessories too: rings, amulet, cloak, boots, head, bracers, gauntlets.
   - For use.consume === false, do not delete the item.
   - Support use.charges.max and use.charges.refresh. Store remaining charges on the item instance, not the template.
   - Suggested refresh values: "shortRest", "longRest", "newDungeon", "home".

8. Update itemDetails(item)
   - For item.type === "accessory", show rarity, slot, passive bonuses, resistances/vulnerabilities, healing use, charges, and price.

9. Loot generation
   - Use item.loot.dropWeight for weighted random magic accessory drops.
   - Higher price and rarity already produce lower dropWeight values.
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

function dropWeightForPrice(priceGp, rarity) {
  const rarityPenalty = rarityRank[rarity] ?? 2;
  const pricePenalty = Math.sqrt(Math.max(1, priceGp));
  return Math.max(1, Math.round(600 / (rarityPenalty * pricePenalty)));
}

function uniqueTags(tags) {
  return Array.from(new Set(tags.filter(Boolean)));
}

function healingUse(count, sides, bonus, options = {}) {
  return {
    kind: "healing",
    resource: options.resource ?? "bonusAction",
    dice: { count, sides },
    bonus,
    consume: false,
    charges: {
      max: options.charges ?? 1,
      refresh: options.refresh ?? "newDungeon",
    },
    description: options.description ?? `Heal ${count}d${sides} + ${bonus} HP.`,
  };
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
      reason: "magic items are loot-only for now",
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
}

const d4 = (type) => ({ count: 1, sides: 4, type });
const d6 = (type) => ({ count: 1, sides: 6, type });

// Rings. Ring items can be equipped in either ring1 or ring2.
registerMagicAccessory("magic-ring-guardian", "Ring of the Guardian", ["ring1", "ring2"], "uncommon", 1200, {
  effects: { acBonus: 1 },
  description: "Grants +1 AC while equipped.",
});

registerMagicAccessory("magic-ring-iron-skin", "Ring of Iron Skin", ["ring1", "ring2"], "rare", 7000, {
  effects: { acBonus: 1, maxHpBonus: 8 },
  description: "Grants +1 AC and +8 max HP while equipped.",
});

registerMagicAccessory("magic-ring-fireward", "Ring of Fireward", ["ring1", "ring2"], "uncommon", 1800, {
  effects: { resistances: ["fire"] },
  description: "Grants resistance to fire damage.",
});

registerMagicAccessory("magic-ring-frostward", "Ring of Frostward", ["ring1", "ring2"], "uncommon", 1800, {
  effects: { resistances: ["cold"] },
  description: "Grants resistance to cold damage.",
});

registerMagicAccessory("magic-ring-stormward", "Ring of Stormward", ["ring1", "ring2"], "uncommon", 1800, {
  effects: { resistances: ["lightning"] },
  description: "Grants resistance to lightning damage.",
});

registerMagicAccessory("magic-ring-venomward", "Ring of Venomward", ["ring1", "ring2"], "uncommon", 1600, {
  effects: { resistances: ["poison"] },
  description: "Grants resistance to poison damage.",
});

registerMagicAccessory("magic-ring-ox", "Ring of the Ox", ["ring1", "ring2"], "rare", 8500, {
  effects: { abilityScoreBonuses: { str: 2 }, abilityScoreCaps: { str: 22 } },
  description: "Grants +2 STR, allowing STR to reach 22.",
});

registerMagicAccessory("magic-ring-quickstep", "Ring of Quickstep", ["ring1", "ring2"], "rare", 8500, {
  effects: { abilityScoreBonuses: { dex: 2 }, abilityScoreCaps: { dex: 22 }, initiativeBonus: 1 },
  description: "Grants +2 DEX and +1 initiative.",
});

registerMagicAccessory("magic-ring-deep-blood", "Ring of Deep Blood", ["ring1", "ring2"], "rare", 6500, {
  effects: { maxHpBonus: 15 },
  description: "Grants +15 max HP while equipped.",
});

registerMagicAccessory("magic-ring-focused-strike", "Ring of Focused Strike", ["ring1", "ring2"], "rare", 7000, {
  effects: { attackBonus: 1 },
  description: "Grants +1 to attack rolls while equipped.",
});

registerMagicAccessory("magic-ring-venom-kiss", "Ring of the Venom Kiss", ["ring1", "ring2"], "rare", 8000, {
  effects: { extraDamage: [d4("poison")] },
  description: "Weapon hits deal an extra 1d4 poison damage.",
});

registerMagicAccessory("magic-ring-second-breath", "Ring of Second Breath", ["ring1", "ring2"], "uncommon", 2200, {
  use: healingUse(2, 4, 2, { charges: 1, refresh: "newDungeon" }),
  description: "Once per new dungeon, heal 2d4 + 2 HP as a bonus action.",
});

registerMagicAccessory("magic-ring-blood-ice", "Ring of Blood-Ice", ["ring1", "ring2"], "rare", 5000, {
  effects: { maxHpBonus: 20, resistances: ["cold"], vulnerabilities: ["fire"] },
  curse: {
    name: "Thawing Heart",
    description: "The ring grants cold resistance and extra vitality, but makes the wearer vulnerable to fire damage.",
  },
  description: "Grants +20 max HP and cold resistance, but fire vulnerability.",
});

// Gauntlets.
registerMagicAccessory("magic-gauntlets-ogre-might", "Gauntlets of Ogre Might", "gauntlets", "rare", 9000, {
  weightLb: 2,
  effects: { abilityScoreBonuses: { str: 4 }, abilityScoreCaps: { str: 22 } },
  description: "Grants +4 STR, allowing STR to reach 22.",
});

registerMagicAccessory("magic-gauntlets-dexterous-grip", "Gauntlets of Dexterous Grip", "gauntlets", "uncommon", 2400, {
  weightLb: 1,
  effects: { abilityScoreBonuses: { dex: 2 }, abilityScoreCaps: { dex: 22 } },
  description: "Grants +2 DEX while equipped.",
});

registerMagicAccessory("magic-gauntlets-crushing-force", "Gauntlets of Crushing Force", "gauntlets", "rare", 7200, {
  weightLb: 2,
  effects: { damageBonus: 2, damageBonusCondition: "melee weapon attacks only" },
  description: "Melee weapon hits deal +2 damage.",
});

registerMagicAccessory("magic-gauntlets-deflection", "Gauntlets of Deflection", "gauntlets", "uncommon", 1800, {
  weightLb: 1,
  effects: { acBonus: 1 },
  description: "Grants +1 AC while equipped.",
});

registerMagicAccessory("magic-embergrip-gauntlets", "Embergrip Gauntlets", "gauntlets", "rare", 7600, {
  weightLb: 1.5,
  effects: { resistances: ["fire"], extraDamage: [d4("fire")], extraDamageCondition: "melee weapon attacks only" },
  description: "Grants fire resistance. Melee hits deal an extra 1d4 fire damage.",
});

registerMagicAccessory("magic-gauntlets-mending-touch", "Gauntlets of the Mending Touch", "gauntlets", "rare", 6500, {
  weightLb: 1,
  use: healingUse(2, 8, 4, { charges: 1, refresh: "shortRest" }),
  description: "Once per short rest, heal 2d8 + 4 HP as a bonus action.",
});

registerMagicAccessory("magic-gauntlets-giants-bargain", "Gauntlets of the Giant's Bargain", "gauntlets", "rare", 6000, {
  weightLb: 3,
  effects: {
    abilityScoreBonuses: { str: 6 },
    abilityScorePenalties: { dex: -2 },
    abilityScoreCaps: { str: 24 },
    vulnerabilities: ["lightning"],
  },
  curse: {
    name: "Giant's Bargain",
    description: "Huge strength at the cost of clumsy movement and lightning vulnerability.",
  },
  description: "Grants +6 STR, -2 DEX, and lightning vulnerability.",
});

// Bracers.
registerMagicAccessory("magic-bracers-defense", "Bracers of Defense", "bracers", "rare", 9000, {
  effects: {
    acBonus: 2,
    acBonusCondition: "only while no torso armor and no shield are equipped",
  },
  description: "Grants +2 AC only while wearing no torso armor and no shield.",
});

registerMagicAccessory("magic-bracers-archery", "Bracers of Archery", "bracers", "uncommon", 2400, {
  effects: { attackBonus: 1, damageBonus: 2, attackBonusCondition: "ranged weapon attacks only", damageBonusCondition: "ranged weapon attacks only" },
  description: "Ranged weapon attacks gain +1 to hit and +2 damage.",
});

registerMagicAccessory("magic-bracers-iron-blood", "Bracers of Iron Blood", "bracers", "uncommon", 2000, {
  effects: { maxHpBonus: 10 },
  description: "Grants +10 max HP while equipped.",
});

registerMagicAccessory("magic-bracers-thunderward", "Bracers of Thunderward", "bracers", "uncommon", 1800, {
  effects: { resistances: ["thunder"] },
  description: "Grants thunder resistance.",
});

registerMagicAccessory("magic-bracers-knife-turning", "Bracers of Knife-Turning", "bracers", "rare", 6800, {
  effects: { acBonus: 1, resistances: ["slashing"] },
  description: "Grants +1 AC and slashing resistance.",
});

registerMagicAccessory("magic-bracers-hunger", "Bracers of Hunger", "bracers", "rare", 4800, {
  effects: { abilityScoreBonuses: { str: 2 }, abilityScoreCaps: { str: 22 }, vulnerabilities: ["necrotic"] },
  curse: {
    name: "Feeding Pain",
    description: "The bracers grant strength but make necrotic damage bite deeper.",
  },
  description: "Grants +2 STR and necrotic vulnerability.",
});

// Amulets.
registerMagicAccessory("magic-amulet-health", "Amulet of Health", "amulet", "rare", 9000, {
  effects: { abilityScoreBonuses: { con: 2 }, abilityScoreCaps: { con: 22 }, maxHpBonus: 5 },
  description: "Grants +2 CON and +5 max HP.",
});

registerMagicAccessory("magic-amulet-vitality", "Amulet of Vitality", "amulet", "uncommon", 2600, {
  effects: { maxHpBonus: 15 },
  description: "Grants +15 max HP while equipped.",
});

registerMagicAccessory("magic-amulet-fire-soul", "Amulet of the Fire Soul", "amulet", "rare", 7200, {
  effects: { resistances: ["fire"], abilityScoreBonuses: { cha: 1 }, abilityScoreCaps: { cha: 22 } },
  description: "Grants fire resistance and +1 CHA.",
});

registerMagicAccessory("magic-amulet-winter-heart", "Amulet of the Winter Heart", "amulet", "rare", 7200, {
  effects: { resistances: ["cold"], abilityScoreBonuses: { wis: 1 }, abilityScoreCaps: { wis: 22 } },
  description: "Grants cold resistance and +1 WIS.",
});

registerMagicAccessory("magic-amulet-venom-filter", "Amulet of the Venom Filter", "amulet", "uncommon", 2000, {
  effects: { resistances: ["poison"] },
  description: "Grants poison resistance.",
});

registerMagicAccessory("magic-amulet-grave-silver", "Amulet of Grave Silver", "amulet", "rare", 8000, {
  effects: { resistances: ["necrotic"], maxHpBonus: 5 },
  description: "Grants necrotic resistance and +5 max HP.",
});

registerMagicAccessory("magic-amulet-renewal", "Amulet of Renewal", "amulet", "rare", 7600, {
  use: healingUse(4, 4, 4, { charges: 1, refresh: "newDungeon" }),
  description: "Once per new dungeon, heal 4d4 + 4 HP as a bonus action.",
});

registerMagicAccessory("magic-amulet-iron-will", "Amulet of Iron Will", "amulet", "uncommon", 2400, {
  effects: { abilityScoreBonuses: { wis: 2 }, abilityScoreCaps: { wis: 22 } },
  description: "Grants +2 WIS while equipped.",
});

registerMagicAccessory("magic-amulet-glass-heart", "Amulet of the Glass Heart", "amulet", "rare", 4200, {
  effects: { abilityScoreBonuses: { cha: 3 }, abilityScoreCaps: { cha: 23 }, vulnerabilities: ["piercing"] },
  curse: {
    name: "Glass Heart",
    description: "The amulet sharpens presence and charm, but even small piercing wounds become dangerous.",
  },
  description: "Grants +3 CHA and piercing vulnerability.",
});

// Cloaks.
registerMagicAccessory("magic-cloak-protection", "Cloak of Protection", "cloak", "uncommon", 2500, {
  weightLb: 1,
  effects: { acBonus: 1 },
  description: "Grants +1 AC while equipped.",
});

registerMagicAccessory("magic-cloak-shadows", "Cloak of Shadows", "cloak", "rare", 7600, {
  weightLb: 1,
  effects: { abilityScoreBonuses: { dex: 2 }, abilityScoreCaps: { dex: 22 }, resistances: ["necrotic"] },
  description: "Grants +2 DEX and necrotic resistance.",
});

registerMagicAccessory("magic-cloak-winter", "Cloak of Winter", "cloak", "uncommon", 2000, {
  weightLb: 1,
  effects: { resistances: ["cold"] },
  description: "Grants cold resistance.",
});

registerMagicAccessory("magic-cloak-salamander", "Cloak of the Salamander", "cloak", "rare", 5200, {
  weightLb: 1,
  effects: { resistances: ["fire"], vulnerabilities: ["cold"] },
  curse: {
    name: "Cold-Blooded",
    description: "The cloak drinks heat greedily, leaving the wearer vulnerable to cold.",
  },
  description: "Grants fire resistance and cold vulnerability.",
});

registerMagicAccessory("magic-cloak-miststep", "Cloak of Miststep", "cloak", "rare", 7000, {
  weightLb: 1,
  effects: { speedBonusFeet: 10, initiativeBonus: 1 },
  description: "Grants +10 ft. speed and +1 initiative.",
});

registerMagicAccessory("magic-cloak-mender", "Cloak of the Mender", "cloak", "rare", 6800, {
  weightLb: 1,
  use: healingUse(2, 8, 4, { charges: 1, refresh: "shortRest" }),
  description: "Once per short rest, heal 2d8 + 4 HP as a bonus action.",
});

registerMagicAccessory("magic-cloak-thorns", "Cloak of Thorns", "cloak", "rare", 5000, {
  weightLb: 1,
  effects: { resistances: ["piercing"], vulnerabilities: ["fire"] },
  curse: {
    name: "Dry Thorns",
    description: "The cloak turns arrows and fangs, but burns eagerly.",
  },
  description: "Grants piercing resistance and fire vulnerability.",
});

// Boots.
registerMagicAccessory("magic-boots-speed", "Boots of Speed", "boots", "rare", 7000, {
  weightLb: 1,
  effects: { speedBonusFeet: 10 },
  description: "Grants +10 ft. speed.",
});

registerMagicAccessory("magic-boots-elven-step", "Boots of Elven Step", "boots", "uncommon", 2800, {
  weightLb: 1,
  effects: { abilityScoreBonuses: { dex: 1 }, abilityScoreCaps: { dex: 22 }, speedBonusFeet: 5 },
  description: "Grants +1 DEX and +5 ft. speed.",
});

registerMagicAccessory("magic-boots-striding", "Boots of Striding", "boots", "uncommon", 2200, {
  weightLb: 1,
  effects: { speedBonusFeet: 10 },
  description: "Grants +10 ft. speed.",
  implementation: "Also add +5 ft. or advantage-equivalent to pit crossing checks if that system is implemented.",
});

registerMagicAccessory("magic-boots-mountain", "Boots of the Mountain", "boots", "rare", 6200, {
  weightLb: 2,
  effects: { abilityScoreBonuses: { str: 2 }, abilityScoreCaps: { str: 22 }, resistances: ["bludgeoning"] },
  description: "Grants +2 STR and bludgeoning resistance.",
});

registerMagicAccessory("magic-boots-frostwalk", "Boots of Frostwalk", "boots", "uncommon", 2100, {
  weightLb: 1,
  effects: { resistances: ["cold"] },
  description: "Grants cold resistance.",
});

registerMagicAccessory("magic-boots-last-stand", "Boots of the Last Stand", "boots", "rare", 5400, {
  weightLb: 1.5,
  effects: { maxHpBonus: 12, acBonus: 1, speedBonusFeet: -5 },
  description: "Grants +12 max HP and +1 AC, but reduces speed by 5 ft.",
});

registerMagicAccessory("magic-leadstep-boots", "Leadstep Boots", "boots", "uncommon", 1200, {
  weightLb: 4,
  effects: { acBonus: 1, speedBonusFeet: -10, vulnerabilities: ["lightning"] },
  curse: {
    name: "Heavy Grounding",
    description: "The boots protect, but slow the wearer and conduct lightning into the body.",
  },
  description: "Grants +1 AC, -10 ft. speed, and lightning vulnerability.",
});

// Helms / head slot.
registerMagicAccessory("magic-helm-watch", "Helm of the Watch", "head", "uncommon", 2300, {
  weightLb: 2,
  effects: { acBonus: 1, initiativeBonus: 1 },
  description: "Grants +1 AC and +1 initiative.",
});

registerMagicAccessory("magic-helm-might", "Helm of Might", "head", "rare", 7000, {
  weightLb: 2,
  effects: { abilityScoreBonuses: { str: 2 }, abilityScoreCaps: { str: 22 } },
  description: "Grants +2 STR while equipped.",
});

registerMagicAccessory("magic-helm-clear-mind", "Helm of the Clear Mind", "head", "uncommon", 2600, {
  weightLb: 1.5,
  effects: { abilityScoreBonuses: { int: 1, wis: 1 }, abilityScoreCaps: { int: 22, wis: 22 } },
  description: "Grants +1 INT and +1 WIS.",
});

registerMagicAccessory("magic-helm-vital-command", "Helm of Vital Command", "head", "rare", 6500, {
  weightLb: 2,
  effects: { maxHpBonus: 10, abilityScoreBonuses: { cha: 1 }, abilityScoreCaps: { cha: 22 } },
  description: "Grants +10 max HP and +1 CHA.",
});

registerMagicAccessory("magic-helm-fireguard", "Helm of Fireguard", "head", "uncommon", 2200, {
  weightLb: 2,
  effects: { resistances: ["fire"] },
  description: "Grants fire resistance.",
});

registerMagicAccessory("magic-crown-ash", "Crown of Ash", "head", "very rare", 24000, {
  weightLb: 1,
  effects: { acBonus: 2, abilityScoreBonuses: { cha: 2 }, abilityScoreCaps: { cha: 24 }, vulnerabilities: ["radiant"] },
  curse: {
    name: "Ashen Majesty",
    description: "The crown grants terrible presence and protection, but radiant damage burns through it.",
  },
  description: "Grants +2 AC and +2 CHA, but radiant vulnerability.",
});

registerMagicAccessory("magic-helm-bloodwake", "Helm of Bloodwake", "head", "rare", 5800, {
  weightLb: 2,
  use: healingUse(3, 6, 3, { charges: 1, refresh: "newDungeon" }),
  description: "Once per new dungeon, heal 3d6 + 3 HP as a bonus action.",
});

const magicAccessoryIds = window.DungeonContent
  .list("items")
  .filter((item) => item.tags?.includes("magic-accessory"))
  .map((item) => item.id);

window.DungeonContent.register("lootTables", "magicAccessories", {
  name: "Magic Accessories",
  itemIds: magicAccessoryIds,
  entries: magicAccessoryIds.map((id) => {
    const item = window.DungeonContent.get("items", id);
    return {
      id,
      name: item?.name ?? id,
      kind: item?.loot?.kind ?? "magic accessory",
      rarity: item?.loot?.rarity ?? "uncommon",
      priceGp: item?.loot?.priceGp ?? 1000,
      weight: item?.loot?.dropWeight ?? 1,
    };
  }),
});
})();
