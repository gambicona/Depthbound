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

function magicPotion(id, name, rarity, cost, description, use) {
  if (window.DungeonContent.get?.("items", id)) return;
  window.DungeonContent.register("items", id, {
    name,
    type: "consumable",
    category: "potion",
    cost,
    weightLb: 0.5,
    slots: ["belt1", "belt2", "belt3", "belt4", "belt5"],
    tags: uniqueTags(["consumable", "potion", "magic", "magic-consumable", `rarity:${rarity}`, id]),
    magic: { rarity },
    description,
    use: {
      resource: "bonusAction",
      consume: true,
      ...use,
    },
  });
}

function statusPotion(id, name, rarity, cost, description, status) {
  magicPotion(id, name, rarity, cost, description, {
    kind: "buff",
    duration: "custom",
    status,
  });
}

function resistancePotion(type, name = null) {
  const label = name ?? `${type[0].toUpperCase()}${type.slice(1)} Resistance`;
  statusPotion(
    `potion-${type}-resistance`,
    `Potion of ${label}`,
    "uncommon",
    gp(300),
    `Drink this potion to gain resistance to ${type} damage for 1 hour.`,
    { id: `potion-${type}-resistance`, label: label, resistances: [type], durationHours: 1 },
  );
}

function breathPotion(type, saveAbility = "dex", shape = "cone") {
  const label = `${type[0].toUpperCase()}${type.slice(1)} Breath`;
  magicPotion(`potion-${type}-breath`, `Potion of ${label}`, "uncommon", gp(150), `Drink this potion to gain three ${type} breath exhalations within 1 hour. Each exhalation is a 15 ft ${shape} for 4d6 ${type} damage, ${saveAbility.toUpperCase()} save for half.`, {
    kind: "breathPotion",
    resource: "bonusAction",
    status: {
      id: `potion-${type}-breath`,
      label,
      durationHours: 1,
      potionBreath: { type, saveAbility, shape, uses: 3 },
      conditionDescription: `Three remaining ${type} breath exhalations. Use an action to exhale a 15 ft ${shape}.`,
    },
  });
}

function lightGear(id, name, cost, weightLb, lightSource, description, options = {}) {
  if (window.DungeonContent.get?.("items", id)) return;
  window.DungeonContent.register("items", id, {
    name,
    type: "consumable",
    category: "light",
    cost,
    weightLb,
    stackable: Boolean(options.stackable),
    slots: options.slots ?? ["belt1", "belt2", "belt3", "belt4", "belt5"],
    description,
    use: {
      kind: "light",
      resource: "action",
      consume: false,
      fuelItemId: options.fuelItemId ?? null,
      fuelItemName: options.fuelItemName ?? null,
      requiredSlots: options.requiredSlots ?? options.slots ?? ["belt1", "belt2", "belt3", "belt4", "belt5"],
      status: {
        id: `${id}-lit`,
        label: name,
        lightSource,
        durationHours: options.durationHours ?? 1,
        consumeLightItemOnExpire: Boolean(options.consumeItemOnExpire),
      },
    },
  });
}

function adventuringSupply(id, name, cost, weightLb, description, options = {}) {
  if (window.DungeonContent.get?.("items", id)) return;
  window.DungeonContent.register("items", id, {
    name,
    type: "consumable",
    category: options.category ?? "supply",
    cost,
    weightLb,
    slots: options.slots ?? ["belt1", "belt2", "belt3", "belt4", "belt5"],
    tags: uniqueTags(["supply", ...(options.tags ?? [])]),
    description,
  });
}

function instrument(id, name, cost, weightLb, songs = []) {
  if (window.DungeonContent.get?.("items", id)) return;
  const toolId = id.replace(/^instrument-/, "");
  window.DungeonContent.register("items", id, {
    name,
    type: "tool",
    category: "instrument",
    cost,
    weightLb,
    slots: ["mainHand", "offHand", "belt1", "belt2", "belt3", "belt4", "belt5"],
    tags: uniqueTags(["tool", "instrument", `proficiency:${toolId}`]),
    description: `${name} is a musical instrument. A hero proficient with ${name.toLowerCase()} can play prepared pieces from the inventory.`,
    use: {
      kind: "instrumentPerformance",
      resource: "action",
      consume: false,
      instrument: toolId,
      requiredTool: toolId,
      songs,
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
  status: { id: "glowcap-light", label: "Glowcap", speedBonusFeet: 5, lightSource: { brightRadiusFeet: 0, dimRadiusFeet: 10, color: "#77f7cf" }, expiresAtHome: true },
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

statusPotion("potion-climbing", "Potion of Climbing", "common", gp(75), "Drink this potion to gain a climbing speed-like mobility boost for 1 hour.", {
  id: "potion-climbing",
  label: "Climbing",
  speedBonusFeet: 10,
  skillBonus: 3,
  durationHours: 1,
  conditionDescription: "You climb with ease: +10 ft speed and +3 to mobility or Athletics-style checks for 1 hour.",
});

statusPotion("potion-water-breathing", "Potion of Water Breathing", "uncommon", gp(150), "Drink this potion to breathe underwater and move through flooded spaces more easily for 1 hour.", {
  id: "potion-water-breathing",
  label: "Water Breathing",
  waterBreathing: true,
  swimSpeed: true,
  skillBonus: 2,
  durationHours: 1,
  conditionDescription: "You can breathe underwater and handle flooded movement more easily for 1 hour.",
});

["acid", "cold", "fire", "force", "lightning", "necrotic", "poison", "psychic", "radiant", "thunder"].forEach((type) => resistancePotion(type));

breathPotion("acid", "dex", "line");
breathPotion("cold", "con", "cone");
breathPotion("fire", "dex", "cone");
breathPotion("lightning", "dex", "line");
breathPotion("poison", "con", "cone");
breathPotion("force", "dex", "cone");
breathPotion("necrotic", "dex", "cone");
breathPotion("psychic", "dex", "cone");
breathPotion("radiant", "dex", "cone");
breathPotion("thunder", "dex", "cone");

[
  ["hill", 21, "uncommon", 500],
  ["frost", 23, "rare", 900],
  ["stone", 23, "rare", 900],
  ["fire", 25, "rare", 1400],
  ["cloud", 27, "very-rare", 5000],
  ["storm", 29, "legendary", 25000],
].forEach(([giant, score, rarity, value]) => {
  const label = `${giant[0].toUpperCase()}${giant.slice(1)} Giant Strength`;
  statusPotion(`potion-${giant}-giant-strength`, `Potion of ${label}`, rarity, gp(value), `Drink this potion to set your Strength to ${score} for 1 hour if it is lower.`, {
    id: `potion-${giant}-giant-strength`,
    label,
    abilityScoreMinimums: { str: score },
    durationHours: 1,
    conditionDescription: `Your Strength is ${score} for 1 hour unless it is already higher.`,
  });
});

statusPotion("potion-giant-strength", "Potion of Giant Strength", "uncommon", gp(500), "Drink this potion to gain hill giant strength: Strength 21 for 1 hour if your Strength is lower.", {
  id: "potion-giant-strength",
  label: "Hill Giant Strength",
  abilityScoreMinimums: { str: 21 },
  durationHours: 1,
  conditionDescription: "Your Strength is 21 for 1 hour unless it is already higher.",
});

statusPotion("potion-speed", "Potion of Speed", "very-rare", gp(5000), "Drink this potion to gain haste-like speed for 1 minute.", {
  id: "potion-speed",
  label: "Speed",
  acBonus: 2,
  speedMultiplier: 2,
  attackBonus: 1,
  durationMinutes: 1,
  conditionDescription: "Haste-like acceleration: doubled speed, +2 AC, and a small attack edge for 1 minute.",
});

statusPotion("potion-heroism", "Potion of Heroism", "rare", gp(1000), "Drink this potion to gain 10 temporary HP and a bless-like bonus for 1 hour.", {
  id: "potion-heroism",
  label: "Heroism",
  tempHp: 10,
  attackBonus: 2,
  saveBonus: 2,
  durationHours: 1,
  conditionDescription: "You gain 10 temporary HP and a bless-like +2 to attacks and saving throws for 1 hour.",
});

statusPotion("potion-invisibility", "Potion of Invisibility", "very-rare", gp(5000), "Drink this potion to become invisible for 1 hour or until revealed by the dungeon's invisibility rules.", {
  id: "invisible",
  label: "Invisible",
  condition: "invisible",
  ignoredByMonsters: true,
  attackAdvantage: true,
  stealthAdvantage: true,
  durationHours: 1,
  conditionDescription: "Invisible for 1 hour; the visibility system treats you as hidden from creatures that cannot see invisibility.",
});

statusPotion("potion-flying", "Potion of Flying", "very-rare", gp(5000), "Drink this potion to gain flight for 1 hour.", {
  id: "potion-flying",
  label: "Flying",
  flying: true,
  speedOverrideFeet: 30,
  durationHours: 1,
  conditionDescription: "You gain a flying speed for 1 hour and can pass many floor obstacles.",
});

lightGear("torch", "Torch", cp(1), 1, { brightRadiusFeet: 20, dimRadiusFeet: 40, color: "#ffb35c" }, "A pitch-wrapped torch. It must be held in one hand while lit, sheds bright light for 20 ft and dim light for another 20 ft, and burns for 1 hour.", {
  slots: ["mainHand", "offHand"],
  requiredSlots: ["mainHand", "offHand"],
  durationHours: 1,
  consumeItemOnExpire: true,
  stackable: true,
});
lightGear("hooded-lantern", "Lantern", gp(5), 2, { brightRadiusFeet: 30, dimRadiusFeet: 60, color: "#ffd27a" }, "A lantern with a shuttered hood. It can be held or worn on the belt, sheds bright light for 30 ft and dim light for another 30 ft, and consumes one flask of lantern oil per hour.", {
  slots: ["mainHand", "offHand", "belt1", "belt2", "belt3", "belt4", "belt5"],
  requiredSlots: ["mainHand", "offHand", "belt1", "belt2", "belt3", "belt4", "belt5"],
  fuelItemId: "lantern-oil",
  fuelItemName: "Lantern Oil",
  durationHours: 1,
});
lightGear("bullseye-lantern", "Bullseye Lantern", gp(10), 2, { brightRadiusFeet: 60, dimRadiusFeet: 120, color: "#ffe0a3" }, "A focused lantern. The cone is approximated as a longer light radius in the dungeon view.");
adventuringSupply("lantern-oil", "Lantern Oil", sp(1), 1, "A flask of lantern oil. A hooded lantern consumes one flask for each hour of light.", { category: "light", tags: ["light", "fuel"] });

instrument("instrument-bagpipes", "Bagpipes", gp(30), 6, [
  { id: "bagpipes-barley-roar", name: "Barley Roar", src: "assets/sounds/music/instruments/bagpipes-Barley Roar.mp3" },
  { id: "bagpipes-step-up", name: "Step Up", src: "assets/sounds/music/instruments/bagpipes-Step up.mp3" },
]);
instrument("instrument-drum", "Drum", gp(6), 3, [
  { id: "drum-casket-percussion", name: "Casket Percussion", src: "assets/sounds/music/instruments/drums-Casket Percussion.mp3" },
  { id: "drum-rhythm-of-the-night", name: "Rhythm of the Night", src: "assets/sounds/music/instruments/drums-Rythm of the Night.mp3" },
]);
instrument("instrument-dulcimer", "Dulcimer", gp(25), 10, [
  { id: "dulcimer-mountain-travel", name: "Mountain Travel", src: "assets/sounds/music/instruments/dulcimer-Mountain Travel.mp3" },
  { id: "dulcimer-summit", name: "Summit", src: "assets/sounds/music/instruments/dulcimer-Summit.mp3" },
]);
instrument("instrument-flute", "Flute", gp(2), 1, [
  { id: "flute-enchanted-forest", name: "Enchanted Forest", src: "assets/sounds/music/instruments/flute-Enchanted Forest.mp3" },
  { id: "flute-pinewood-grist", name: "Pinewood Grist", src: "assets/sounds/music/instruments/flute-Pinewood Grist.mp3" },
]);
instrument("instrument-lute", "Lute", gp(35), 2, [
  { id: "lute-caskfire-jigs", name: "Caskfire Jigs", src: "assets/sounds/music/instruments/lute-Caskfire Jigs.mp3" },
  { id: "lute-slow-dance", name: "Slow Dance", src: "assets/sounds/music/instruments/lute-Slow Dance.mp3" },
]);
instrument("instrument-lyre", "Lyre", gp(30), 2, [
  { id: "lyre-fire-song", name: "Fire Song", src: "assets/sounds/music/instruments/lyre-Fire Song.mp3" },
  { id: "lyre-nightly-flames", name: "Nightly Flames", src: "assets/sounds/music/instruments/lyre-Nightly Flames.mp3" },
]);
instrument("instrument-horn", "Horn", gp(3), 2, [
  { id: "horn-battle-orchestra", name: "Battle Orchestra", src: "assets/sounds/music/instruments/horn-Battle Orchestra.mp3" },
  { id: "horn-warband", name: "Warband", src: "assets/sounds/music/instruments/horn-Warband.mp3" },
]);
instrument("instrument-pan-flute", "Pan Flute", gp(12), 2, [
  { id: "pan-flute-get-charmed", name: "Get Charmed", src: "assets/sounds/music/instruments/panflute-Get Charmed.mp3" },
  { id: "pan-flute-holy-forest", name: "Holy Forest", src: "assets/sounds/music/instruments/panflute-Holy Forest.mp3" },
]);
instrument("instrument-shawm", "Shawm", gp(2), 1, [
  { id: "shawm-i-play-along", name: "I Play Along", src: "assets/sounds/music/instruments/shawm-I play along.mp3" },
  { id: "shawm-lets-go", name: "Lets Go", src: "assets/sounds/music/instruments/shawm-Lets Go.mp3" },
]);
instrument("instrument-viol", "Viol", gp(30), 1, [
  { id: "viol-velvet-bowglass", name: "Velvet Bowglass", src: "assets/sounds/music/instruments/violin-Velvet Bowglass.mp3" },
  { id: "viol-velvet-flow", name: "Velvet Flow", src: "assets/sounds/music/instruments/violin-Velvet Flow.mp3" },
]);

window.DungeonContent.register("equipmentPacks", "standardEquipment", {
  name: "Standard Weapons and Armor",
  itemIds: window.DungeonContent.list("items").map((item) => item.id),
});
})();
