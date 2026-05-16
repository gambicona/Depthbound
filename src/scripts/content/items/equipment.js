(() => {
const gp = (amount) => ({ amount, unit: "gp", text: `${amount} gp` });
const sp = (amount) => ({ amount, unit: "sp", text: `${amount} sp` });
const cp = (amount) => ({ amount, unit: "cp", text: `${amount} cp` });

function diceText(damage, fallbackBonus = "") {
  if (damage.flat) return `${damage.flat}${damage.type ? ` ${damage.type}` : ""}`;
  const bonus = damage.bonus ? ` + ${damage.bonus}` : fallbackBonus;
  return `${damage.count}d${damage.sides}${bonus}${damage.type ? ` ${damage.type}` : ""}`;
}

function weaponDescription(name, category, weaponRange, damage, properties = [], propertyData = {}) {
  const propertyText = properties.length ? ` Properties: ${properties.join(", ")}.` : "";
  const rangeText = propertyData.thrown ? ` Can be thrown up to ${propertyData.thrown.feet} ft.` : weaponRange === "ranged" ? " Built for ranged attacks." : " Built for close combat.";
  return `${name} is a ${category} weapon that deals ${diceText(damage)} damage.${rangeText}${propertyText}`;
}

function armorDescription(name, category, armorData, strength, stealth) {
  const acText = armorData.bonus ? `adds +${armorData.bonus} AC` : `sets base AC to ${armorData.base}`;
  const strengthText = strength ? ` Requires STR ${strength}.` : "";
  const stealthText = stealth ? " Gives stealth disadvantage." : "";
  return `${name} is ${category} armor that ${acText}.${strengthText}${stealthText}`;
}

function uniqueTags(tags) {
  return Array.from(new Set(tags.filter(Boolean)));
}

function weaponTags(category, weaponRange) {
  const [training, style] = String(category).split(/\s+/);
  return uniqueTags([
    category,
    weaponRange,
    `${training} weapon`,
    `${style} weapon`,
    `${training} ${style}`,
    `weapon:${training}`,
    `weapon:${style}`,
    `proficiency:${category}`,
  ]);
}

function armorTags(category) {
  return uniqueTags([
    category,
    `${category} armor`,
    `armor:${category}`,
    `proficiency:${category}`,
  ]);
}

function weapon(id, name, category, weaponRange, cost, damage, weightLb, properties = [], propertyData = {}) {
  window.DungeonContent.register("items", id, {
    name,
    type: "weapon",
    category,
    weaponRange,
    cost,
    weightLb,
    slots: ["mainHand", "offHand"],
    damage,
    range: propertyData.range ?? propertyData.thrown ?? { kind: weaponRange, feet: properties.includes("reach") ? 10 : 5 },
    ammoKind: propertyData.ammoKind ?? (id.includes("crossbow") ? "bolt" : id.includes("bow") ? "arrow" : null),
    properties,
    propertyData,
    tags: weaponTags(category, weaponRange),
    description: propertyData.description ?? weaponDescription(name, category, weaponRange, damage, properties, propertyData),
  });
}

function armor(id, name, category, cost, armorData, strength, stealth, weightLb, slots = ["torso"]) {
  window.DungeonContent.register("items", id, {
    name,
    type: "armor",
    category,
    cost,
    weightLb,
    slots,
    armor: armorData,
    requirements: strength ? { strength } : {},
    stealthDisadvantage: stealth,
    tags: armorTags(category),
    description: armorDescription(name, category, armorData, strength, stealth),
  });
}

function ammunition(id, name, kind, cost, weightLb, quantity = 20) {
  window.DungeonContent.register("items", id, {
    name,
    type: "ammunition",
    category: kind,
    cost,
    weightLb,
    slots: ["quiver"],
    ammo: { kind, quantity },
    description: `${name} is ammunition for weapons that use ${kind}s. This stack contains ${quantity}.`,
  });
}

function healingPotion(id, name, dice, bonus, cost) {
  window.DungeonContent.register("items", id, {
    name,
    type: "consumable",
    category: "potion",
    cost,
    weightLb: 0.5,
    slots: ["belt1", "belt2", "belt3", "belt4", "belt5"],
    description: `${name} restores ${dice.count}d${dice.sides} + ${bonus} HP when used.`,
    use: {
      kind: "healing",
      resource: "bonusAction",
      dice,
      bonus,
    },
  });
}

function simpleConsumable(id, name, description, use = {}) {
  if (window.DungeonContent.get?.("items", id)) return;
  window.DungeonContent.register("items", id, {
    name,
    type: "consumable",
    category: "foraged",
    cost: gp(0),
    weightLb: 0,
    slots: ["belt1", "belt2", "belt3", "belt4", "belt5"],
    description,
    use: {
      kind: use.kind ?? "utility",
      resource: use.resource ?? "action",
      consume: true,
      ...(use.dice ? { dice: use.dice, bonus: use.bonus ?? 0 } : {}),
      ...(use.status ? { status: use.status } : {}),
    },
  });
}

weapon("club", "Club", "simple melee", "melee", sp(1), { count: 1, sides: 4, type: "bludgeoning", bonusAbility: "str" }, 2, ["light"]);
weapon("dagger", "Dagger", "simple melee", "melee", gp(2), { count: 1, sides: 4, type: "piercing", bonusAbility: "str" }, 1, ["finesse", "light", "thrown"], { thrown: { kind: "thrown", normal: 20, long: 60, feet: 20 } });
weapon("greatclub", "Greatclub", "simple melee", "melee", sp(2), { count: 1, sides: 8, type: "bludgeoning", bonusAbility: "str" }, 10, ["two-handed"]);
weapon("handaxe", "Handaxe", "simple melee", "melee", gp(5), { count: 1, sides: 6, type: "slashing", bonusAbility: "str" }, 2, ["light", "thrown"], { thrown: { kind: "thrown", normal: 20, long: 60, feet: 20 } });
weapon("javelin", "Javelin", "simple melee", "melee", sp(5), { count: 1, sides: 6, type: "piercing", bonusAbility: "str" }, 2, ["thrown"], { thrown: { kind: "thrown", normal: 30, long: 120, feet: 30 } });
weapon("light-hammer", "Light Hammer", "simple melee", "melee", gp(2), { count: 1, sides: 4, type: "bludgeoning", bonusAbility: "str" }, 2, ["light", "thrown"], { thrown: { kind: "thrown", normal: 20, long: 60, feet: 20 } });
weapon("mace", "Mace", "simple melee", "melee", gp(5), { count: 1, sides: 6, type: "bludgeoning", bonusAbility: "str" }, 4);
weapon("quarterstaff", "Quarterstaff", "simple melee", "melee", sp(2), { count: 1, sides: 6, type: "bludgeoning", bonusAbility: "str" }, 4, ["versatile"], { versatile: { count: 1, sides: 8 } });
weapon("sickle", "Sickle", "simple melee", "melee", gp(1), { count: 1, sides: 4, type: "slashing", bonusAbility: "str" }, 2, ["light"]);
weapon("spear", "Spear", "simple melee", "melee", gp(1), { count: 1, sides: 6, type: "piercing", bonusAbility: "str" }, 3, ["thrown", "versatile"], { thrown: { kind: "thrown", normal: 20, long: 60, feet: 20 }, versatile: { count: 1, sides: 8 } });
weapon("crossbow-light", "Crossbow, Light", "simple ranged", "ranged", gp(25), { count: 1, sides: 8, type: "piercing", bonusAbility: "dex" }, 5, ["ammunition", "loading", "two-handed"], { range: { kind: "ranged", normal: 80, long: 320, feet: 80 } });
weapon("dart", "Dart", "simple ranged", "ranged", cp(5), { count: 1, sides: 4, type: "piercing", bonusAbility: "dex" }, 0.25, ["finesse", "thrown"], { thrown: { kind: "thrown", normal: 20, long: 60, feet: 20 } });
weapon("shortbow", "Shortbow", "simple ranged", "ranged", gp(25), { count: 1, sides: 6, type: "piercing", bonusAbility: "dex" }, 2, ["ammunition", "two-handed"], { range: { kind: "ranged", normal: 80, long: 320, feet: 80 } });
weapon("sling", "Sling", "simple ranged", "ranged", sp(1), { count: 1, sides: 4, type: "bludgeoning", bonusAbility: "dex" }, 0, ["ammunition"], { range: { kind: "ranged", normal: 30, long: 120, feet: 30 }, ammoKind: "pebble" });

weapon("battleaxe", "Battleaxe", "martial melee", "melee", gp(10), { count: 1, sides: 8, type: "slashing", bonusAbility: "str" }, 4, ["versatile"], { versatile: { count: 1, sides: 10 } });
weapon("flail", "Flail", "martial melee", "melee", gp(10), { count: 1, sides: 8, type: "bludgeoning", bonusAbility: "str" }, 2);
weapon("glaive", "Glaive", "martial melee", "melee", gp(20), { count: 1, sides: 10, type: "slashing", bonusAbility: "str" }, 6, ["heavy", "reach", "two-handed"]);
weapon("greataxe", "Greataxe", "martial melee", "melee", gp(30), { count: 1, sides: 12, type: "slashing", bonusAbility: "str" }, 7, ["heavy", "two-handed"]);
weapon("greatsword", "Greatsword", "martial melee", "melee", gp(50), { count: 2, sides: 6, type: "slashing", bonusAbility: "str" }, 6, ["heavy", "two-handed"]);
weapon("halberd", "Halberd", "martial melee", "melee", gp(20), { count: 1, sides: 10, type: "slashing", bonusAbility: "str" }, 6, ["heavy", "reach", "two-handed"]);
weapon("lance", "Lance", "martial melee", "melee", gp(10), { count: 1, sides: 12, type: "piercing", bonusAbility: "str" }, 6, ["reach", "special"], { special: "Disadvantage within 5 ft.; requires two hands when not mounted." });
weapon("longsword", "Longsword", "martial melee", "melee", gp(15), { count: 1, sides: 8, type: "slashing", bonusAbility: "str" }, 3, ["versatile"], { versatile: { count: 1, sides: 10 } });
weapon("maul", "Maul", "martial melee", "melee", gp(10), { count: 2, sides: 6, type: "bludgeoning", bonusAbility: "str" }, 10, ["heavy", "two-handed"]);
weapon("morningstar", "Morningstar", "martial melee", "melee", gp(15), { count: 1, sides: 8, type: "piercing", bonusAbility: "str" }, 4);
weapon("pike", "Pike", "martial melee", "melee", gp(5), { count: 1, sides: 10, type: "piercing", bonusAbility: "str" }, 18, ["heavy", "reach", "two-handed"]);
weapon("rapier", "Rapier", "martial melee", "melee", gp(25), { count: 1, sides: 8, type: "piercing", bonusAbility: "dex" }, 2, ["finesse"]);
weapon("scimitar", "Scimitar", "martial melee", "melee", gp(25), { count: 1, sides: 6, type: "slashing", bonusAbility: "dex" }, 3, ["finesse", "light"]);
weapon("shortsword", "Shortsword", "martial melee", "melee", gp(10), { count: 1, sides: 6, type: "piercing", bonusAbility: "dex" }, 2, ["finesse", "light"]);
weapon("trident", "Trident", "martial melee", "melee", gp(5), { count: 1, sides: 6, type: "piercing", bonusAbility: "str" }, 4, ["thrown", "versatile"], { thrown: { kind: "thrown", normal: 20, long: 60, feet: 20 }, versatile: { count: 1, sides: 8 } });
weapon("war-pick", "War Pick", "martial melee", "melee", gp(5), { count: 1, sides: 8, type: "piercing", bonusAbility: "str" }, 2);
weapon("warhammer", "Warhammer", "martial melee", "melee", gp(15), { count: 1, sides: 8, type: "bludgeoning", bonusAbility: "str" }, 2, ["versatile"], { versatile: { count: 1, sides: 10 } });
weapon("whip", "Whip", "martial melee", "melee", gp(2), { count: 1, sides: 4, type: "slashing", bonusAbility: "dex" }, 3, ["finesse", "reach"]);
weapon("blowgun", "Blowgun", "martial ranged", "ranged", gp(10), { flat: 1, type: "piercing", bonus: 0 }, 1, ["ammunition", "loading"], { range: { kind: "ranged", normal: 25, long: 100, feet: 25 } });
weapon("crossbow-hand", "Crossbow, Hand", "martial ranged", "ranged", gp(75), { count: 1, sides: 6, type: "piercing", bonusAbility: "dex" }, 3, ["ammunition", "light", "loading"], { range: { kind: "ranged", normal: 30, long: 120, feet: 30 } });
weapon("crossbow-heavy", "Crossbow, Heavy", "martial ranged", "ranged", gp(50), { count: 1, sides: 10, type: "piercing", bonusAbility: "dex" }, 18, ["ammunition", "heavy", "loading", "two-handed"], { range: { kind: "ranged", normal: 100, long: 400, feet: 100 } });
weapon("longbow", "Longbow", "martial ranged", "ranged", gp(50), { count: 1, sides: 8, type: "piercing", bonusAbility: "dex" }, 2, ["ammunition", "heavy", "two-handed"], { range: { kind: "ranged", normal: 150, long: 600, feet: 150 } });

weapon("yklwa", "Yklwa", "simple melee", "melee", gp(1), { count: 1, sides: 8, type: "piercing", bonusAbility: "str" }, 3, ["thrown"], { thrown: { kind: "thrown", normal: 10, long: 30, feet: 10 }, source: "Forgotten Realms" });
weapon("hoopak", "Hoopak", "martial melee", "melee", gp(1), { count: 1, sides: 6, type: "piercing", bonusAbility: "dex" }, 2, ["ammunition", "finesse", "special", "two-handed"], { range: { kind: "ranged", normal: 40, long: 160, feet: 40 }, alternateDamage: { count: 1, sides: 4, type: "bludgeoning" }, source: "Dragonlance" });
weapon("double-bladed-scimitar", "Double-Bladed Scimitar", "martial melee", "melee", gp(100), { count: 2, sides: 4, type: "slashing", bonusAbility: "str" }, 6, ["special", "two-handed"], { bonusActionDamage: { count: 1, sides: 4, type: "slashing" }, source: "Eberron" });

armor("padded", "Padded", "light", gp(5), { base: 11, dex: "full" }, null, true, 8);
armor("leather", "Leather", "light", gp(10), { base: 11, dex: "full" }, null, false, 10);
armor("studded-leather", "Studded Leather", "light", gp(45), { base: 12, dex: "full" }, null, false, 13);
armor("hide", "Hide", "medium", gp(10), { base: 12, dex: "max2" }, null, false, 12);
armor("chain-shirt", "Chain Shirt", "medium", gp(50), { base: 13, dex: "max2" }, null, false, 20);
armor("scale-mail", "Scale Mail", "medium", gp(50), { base: 14, dex: "max2" }, null, true, 45);
armor("spiked-armor", "Spiked Armor", "medium", gp(75), { base: 14, dex: "max2" }, null, true, 45);
armor("breastplate", "Breastplate", "medium", gp(400), { base: 14, dex: "max2" }, null, false, 20);
armor("half-plate", "Half Plate", "medium", gp(750), { base: 15, dex: "max2" }, null, true, 40);
armor("ring-mail", "Ring Mail", "heavy", gp(30), { base: 14, dex: "none" }, null, true, 40);
armor("chain-mail", "Chain Mail", "heavy", gp(75), { base: 16, dex: "none" }, 13, true, 55);
armor("splint", "Splint", "heavy", gp(200), { base: 17, dex: "none" }, 15, true, 60);
armor("plate", "Plate", "heavy", gp(1500), { base: 18, dex: "none" }, 17, true, 65);
armor("shield", "Shield", "shield", gp(10), { bonus: 2 }, null, false, 6, ["offHand"]);

ammunition("arrows-20", "Arrows (20)", "arrow", gp(1), 1, 20);
ammunition("bolts-20", "Crossbow Bolts (20)", "bolt", gp(1), 1.5, 20);
ammunition("pebbles-20", "Pebbles (20)", "pebble", cp(4), 1, 20);
healingPotion("potion-healing", "Potion of Healing", { count: 2, sides: 4 }, 2, gp(10));
healingPotion("potion-greater-healing", "Potion of Greater Healing", { count: 4, sides: 4 }, 4, gp(100));
healingPotion("potion-superior-healing", "Potion of Superior Healing", { count: 8, sides: 4 }, 8, gp(500));
healingPotion("potion-supreme-healing", "Potion of Supreme Healing", { count: 10, sides: 4 }, 20, gp(5000));

simpleConsumable("berry", "Berry", "A small edible berry. It heals 1 HP when used.", { kind: "healing", resource: "bonusAction", dice: { count: 1, sides: 1 } });
simpleConsumable("medicinal-herb", "Medicinal Herb", "A field herb that heals 1d4 HP when used.", { kind: "healing", dice: { count: 1, sides: 4 } });
simpleConsumable("glowcap", "Glowcap", "A faintly glowing mushroom cap. Use it to move a little faster while it lights your path for the rest of the dungeon.", {
  status: { id: "glowcap-light", label: "Glowcap", speedBonusFeet: 5, expiresAtHome: true },
});
simpleConsumable("bitter-root", "Bitter Root", "A bitter root used as a minor poison-resisting remedy. Use it to resist poison damage for the rest of the dungeon.", {
  status: { id: "bitter-root", label: "Bitter Root", resistances: ["poison"], expiresAtHome: true },
});
simpleConsumable("cave-salt", "Cave Salt", "A sharp pinch of cave salt. Use it to steady yourself with +1 to saving throws for the rest of the dungeon.", {
  status: { id: "cave-salt", label: "Cave Salt", saveBonus: 1, expiresAtHome: true },
});
simpleConsumable("bone-charm", "Bone Charm", "A small charm sometimes used against fear or necrotic magic. Use it to resist necrotic damage for the rest of the dungeon.", {
  status: { id: "bone-charm", label: "Bone Charm", resistances: ["necrotic"], expiresAtHome: true },
});
simpleConsumable("spider-silk", "Spider Silk", "A sticky crafting material. Use it to steady ranged attacks with +1 to attack rolls for the rest of the dungeon.", {
  status: { id: "spider-silk", label: "Spider Silk", attackBonus: 1, expiresAtHome: true },
});
simpleConsumable("crystal-shard", "Crystal Shard", "A small arcane component or sellable gem shard. Use it to add +1 damage to attacks for the rest of the dungeon.", {
  status: { id: "crystal-shard", label: "Crystal Shard", damageBonus: 1, expiresAtHome: true },
});
simpleConsumable("sacred-ash", "Sacred Ash", "A pinch of ash from a consecrated flame. Use it to resist necrotic damage and gain +1 AC for the rest of the dungeon.", {
  status: { id: "sacred-ash", label: "Sacred Ash", acBonus: 1, resistances: ["necrotic"], expiresAtHome: true },
});

window.DungeonContent.register("equipmentPacks", "standardEquipment", {
  name: "Standard Weapons and Armor",
  itemIds: window.DungeonContent.list("items").map((item) => item.id),
});
})();
