(() => {
const gp = (amount) => ({ amount, unit: "gp", text: `${amount} gp` });

function uniqueTags(tags) {
  return Array.from(new Set(tags.filter(Boolean).map((tag) => String(tag).trim().toLowerCase())));
}

function diceLabel(dice = {}) {
  if (!dice?.count || !dice?.sides) return "";
  return `${dice.count}d${dice.sides}${dice.type ? ` ${dice.type}` : ""}`;
}

function poisonDescription(poison) {
  const delivery = poison.delivery === "injury" ? "applied to a piercing or slashing weapon hit" : poison.delivery;
  const damage = diceLabel(poison.damage);
  const save = poison.saveDc ? `DC ${poison.saveDc} CON` : "CON";
  const half = poison.halfDamageOnSave ? "half damage on a success" : "no effect on a success";
  const condition = poison.conditions?.length ? ` Conditions: ${poison.conditions.map((entry) => entry.label).join(", ")}.` : "";
  const delayed = poison.delayed ? ` ${poison.delayed}` : "";
  return `${poison.name} is a ${delivery} poison (${save}; ${half}).${damage ? ` Failed save: ${damage}.` : ""}${condition}${delayed}`;
}

function registerPoison(poison) {
  const id = `poison-${poison.id}`;
  window.DungeonAfflictions ??= { poisons: {}, diseases: {}, curses: {} };
  window.DungeonAfflictions.poisons[poison.id] = { ...poison };
  window.DungeonContent.register("items", id, {
    id,
    name: poison.name,
    type: "consumable",
    category: "poison",
    cost: poison.cost,
    weightLb: 0.1,
    slots: ["belt1", "belt2", "belt3", "belt4", "belt5"],
    adminOnly: true,
    store: { buyable: false, sellable: false, reason: "admin poison test item" },
    tags: uniqueTags(["admin-only", "poison", "affliction", poison.delivery, ...(poison.tags ?? [])]),
    description: poison.description ?? poisonDescription(poison),
    use: {
      kind: "poison",
      resource: poison.delivery === "injury" ? "bonusAction" : "action",
      consume: true,
      poison: { ...poison },
    },
  });
}

[
  {
    id: "basic",
    name: "Basic Poison",
    delivery: "injury",
    cost: gp(100),
    saveDc: 10,
    damage: { count: 1, sides: 4, type: "poison" },
    tags: ["weapon-coating"],
  },
  {
    id: "assassins-blood",
    name: "Assassin's Blood",
    delivery: "ingested",
    cost: gp(150),
    saveDc: 10,
    damage: { count: 1, sides: 12, type: "poison" },
    halfDamageOnSave: true,
    conditions: [{ id: "poisoned", label: "Poisoned", durationHours: 24 }],
  },
  {
    id: "burnt-othur-fumes",
    name: "Burnt Othur Fumes",
    delivery: "inhaled",
    cost: gp(500),
    saveDc: 13,
    damage: { count: 3, sides: 6, type: "poison" },
    repeat: { at: "startOfTurn", saveDc: 13, successTarget: 3, damage: { count: 1, sides: 6, type: "poison" } },
  },
  {
    id: "crawler-mucus",
    name: "Crawler Mucus",
    delivery: "contact",
    cost: gp(200),
    saveDc: 13,
    conditions: [
      { id: "poisoned", label: "Poisoned", durationMinutes: 1, repeatSaveEnds: true },
      { id: "paralyzed", label: "Paralyzed", condition: "paralyzed", durationMinutes: 1, repeatSaveEnds: true },
    ],
  },
  {
    id: "drow-poison",
    name: "Drow Poison",
    delivery: "injury",
    cost: gp(200),
    saveDc: 13,
    conditions: [{ id: "poisoned", label: "Poisoned", durationHours: 1 }],
    failBy: [{ amount: 5, status: { id: "unconscious", label: "Unconscious", condition: "unconscious", durationHours: 1 } }],
    tags: ["weapon-coating"],
  },
  {
    id: "essence-of-ether",
    name: "Essence of Ether",
    delivery: "inhaled",
    cost: gp(300),
    saveDc: 15,
    conditions: [
      { id: "poisoned", label: "Poisoned", durationHours: 8 },
      { id: "unconscious", label: "Unconscious", condition: "unconscious", durationHours: 8 },
    ],
  },
  {
    id: "malice",
    name: "Malice",
    delivery: "inhaled",
    cost: gp(250),
    saveDc: 15,
    conditions: [
      { id: "poisoned", label: "Poisoned", durationHours: 1 },
      { id: "blinded", label: "Blinded", condition: "blinded", durationHours: 1 },
    ],
  },
  {
    id: "midnight-tears",
    name: "Midnight Tears",
    delivery: "ingested",
    cost: gp(1500),
    saveDc: 17,
    damage: { count: 9, sides: 6, type: "poison" },
    halfDamageOnSave: true,
    delayedDamage: true,
    delayed: "Officially this takes effect at midnight; this engine stores the delayed affliction and resolves it on the dungeon clock.",
    delayedStatus: {
      id: "midnight-tears-pending",
      label: "Midnight Tears",
      durationHours: 24,
      poisonTimedTrigger: { mode: "once", delayHours: 24, damage: { count: 9, sides: 6, type: "poison" }, saveDc: 17, halfDamageOnSave: true },
    },
  },
  {
    id: "oil-of-taggit",
    name: "Oil of Taggit",
    delivery: "contact",
    cost: gp(400),
    saveDc: 13,
    conditions: [
      { id: "poisoned", label: "Poisoned", durationHours: 24 },
      { id: "unconscious", label: "Unconscious", condition: "unconscious", durationHours: 24 },
    ],
  },
  {
    id: "pale-tincture",
    name: "Pale Tincture",
    delivery: "ingested",
    cost: gp(250),
    saveDc: 16,
    damage: { count: 1, sides: 6, type: "poison" },
    conditions: [
      {
        id: "poisoned",
        label: "Poisoned",
        durationDays: 7,
        poisonTimedTrigger: { mode: "repeat", intervalHours: 24, damage: { count: 1, sides: 6, type: "poison" }, damageCountStep: 1, saveDc: 16, successTarget: 7, successes: 0 },
      },
    ],
    delayed: "Repeats every 24 hours with escalating damage until seven successful saves.",
  },
  {
    id: "purple-worm-poison",
    name: "Purple Worm Poison",
    delivery: "injury",
    cost: gp(2000),
    saveDc: 19,
    damage: { count: 12, sides: 6, type: "poison" },
    halfDamageOnSave: true,
    tags: ["weapon-coating"],
  },
  {
    id: "serpent-venom",
    name: "Serpent Venom",
    delivery: "injury",
    cost: gp(200),
    saveDc: 11,
    damage: { count: 3, sides: 6, type: "poison" },
    halfDamageOnSave: true,
    tags: ["weapon-coating"],
  },
  {
    id: "torpor",
    name: "Torpor",
    delivery: "ingested",
    cost: gp(600),
    saveDc: 15,
    conditions: [{ id: "incapacitated", label: "Incapacitated", condition: "incapacitated", durationHours: 4 }],
  },
  {
    id: "truth-serum",
    name: "Truth Serum",
    delivery: "ingested",
    cost: gp(150),
    saveDc: 11,
    conditions: [{ id: "truth-serum", label: "Truth Serum", skillBonus: -2, durationHours: 1, conditionDescription: "Cannot knowingly speak a lie while affected." }],
  },
  {
    id: "wyvern-poison",
    name: "Wyvern Poison",
    delivery: "injury",
    cost: gp(1200),
    saveDc: 15,
    damage: { count: 7, sides: 6, type: "poison" },
    halfDamageOnSave: true,
    tags: ["weapon-coating"],
  },
].forEach(registerPoison);
})();
