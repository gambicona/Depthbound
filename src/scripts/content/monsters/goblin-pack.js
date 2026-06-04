(() => {
const empty = [];

function kebab(id) {
  return id.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

function diceLabel(damage) {
  return `${damage.count}d${damage.sides}${damage.bonus ? ` + ${damage.bonus}` : ""} ${damage.type}`;
}

function damage(count, sides, bonus, type, attackType, range, weaponName) {
  const profile = { count, sides, bonus, type, attackType, label: diceLabel({ count, sides, bonus, type }), range };
  if (weaponName) profile.weaponName = weaponName;
  return profile;
}

function melee(feet = 5) {
  return { kind: "melee", feet };
}

function ranged(feet = 60, long = feet * 3) {
  return { kind: "ranged", normal: feet, long, feet };
}

function mods(str, dex, con, int, wis, cha) {
  return { str, dex, con, int, wis, cha };
}

function scores(abilityMods) {
  return Object.fromEntries(Object.entries(abilityMods).map(([key, value]) => [key, 10 + value * 2]));
}

function kit(mainHand, torso, options = {}) {
  const items = [mainHand, options.offHand, torso, options.quiver].filter(Boolean);
  return {
    equipment: {
      mainHand,
      offHand: options.offHand ?? null,
      head: null,
      torso: torso ?? null,
      boots: null,
      cloak: null,
      bracers: null,
      gauntlets: null,
      ring1: null,
      ring2: null,
      amulet: null,
      quiver: options.quiver ?? null,
    },
    inventory: {
      money: { cp: 0, sp: 0, gp: 0 },
      items,
    },
  };
}

const categoryXp = {
  1: { normal: 50, boss: 200 },
  2: { normal: 150, boss: 450 },
  3: { normal: 450, boss: 1200 },
  4: { normal: 1100, boss: 2900 },
  5: { normal: 2900, boss: 5900 },
  6: { normal: 7200, boss: 11500 },
  7: { normal: 13000, boss: 18000 },
  8: { normal: 20000, boss: 28000 },
  9: { normal: 30000, boss: 39000 },
  10: { normal: 50000, boss: 62000 },
};

const categoryTitles = [
  "",
  "Mud-Tooth",
  "Redcap",
  "Blackpot",
  "Iron-Tusk",
  "Mire-King",
  "Ash-Knife",
  "Wolf-Banner",
  "Hex-Crown",
  "Gloom-Pact",
  "Underboss",
];

const archetypes = [
  {
    key: "cutthroat",
    label: "Cutthroat",
    role: "Knife skirmisher with hamstring pressure",
    token: "C",
    tags: ["skirmisher", "ambusher"],
    behavior: "melee",
    hp: (cat) => 9 + cat * 13,
    ac: (cat) => 13 + Math.floor(cat / 2),
    attackBonus: (cat) => 3 + cat,
    damage: (cat) => damage(Math.max(1, Math.ceil(cat / 4)), 6, 2 + Math.ceil(cat / 2), "piercing", "weapon", melee(), "Notched Knife"),
    abilityMods: (cat) => mods(0, 3 + Math.floor(cat / 3), 1 + Math.floor(cat / 4), 0, 1, 0),
    initiativeBonus: (cat) => 3 + Math.floor(cat / 3),
    kit: () => kit("dagger", "leather"),
    specialAbility: (cat) => cat >= 7 ? ["Hamstring", "Parrying Fade"] : ["Hamstring"],
    multiattack: (cat) => (cat >= 8 ? 3 : cat >= 5 ? 2 : undefined),
  },
  {
    key: "sneakbow",
    label: "Sneakbow",
    role: "Shortbow kiter and tunnel marksman",
    token: "S",
    tags: ["ranged", "skirmisher"],
    behavior: "rangedKiter",
    hp: (cat) => 8 + cat * 11,
    ac: (cat) => 13 + Math.floor(cat / 2),
    attackBonus: (cat) => 3 + cat,
    damage: (cat) => damage(Math.max(1, Math.ceil(cat / 4)), 6, 2 + Math.ceil(cat / 2), "piercing", "weapon", ranged(80, 320), "Shortbow"),
    abilityMods: (cat) => mods(0, 3 + Math.floor(cat / 3), 1 + Math.floor(cat / 4), 0, 2, 0),
    initiativeBonus: (cat) => 3 + Math.floor(cat / 3),
    kit: () => kit("shortbow", "leather", { quiver: "arrows-20" }),
    specialAbility: (cat) => cat >= 6 ? ["Hellbow Pin"] : empty,
    multiattack: (cat) => (cat >= 8 ? 3 : cat >= 5 ? 2 : undefined),
  },
  {
    key: "snarewright",
    label: "Snarewright",
    role: "Trap handler using nets, hooks, and dirty tricks",
    token: "T",
    tags: ["trap", "controller"],
    behavior: "rangedKiter",
    hp: (cat) => 10 + cat * 12,
    ac: (cat) => 14 + Math.floor(cat / 2),
    attackBonus: (cat) => 3 + cat,
    damage: (cat) => damage(Math.max(1, Math.ceil(cat / 4)), 8, 2 + Math.ceil(cat / 2), "slashing", "weapon", ranged(30, 90), "Hooked Snare"),
    abilityMods: (cat) => mods(1, 2 + Math.floor(cat / 3), 2 + Math.floor(cat / 4), 1, 1, 0),
    initiativeBonus: (cat) => 2 + Math.floor(cat / 3),
    kit: () => kit("net", "studded-leather"),
    specialAbility: (cat) => cat >= 5 ? ["Web Snare", "Black Smoke Cloud"] : ["Web Snare"],
    multiattack: (cat) => (cat >= 9 ? 2 : undefined),
  },
  {
    key: "hexer",
    label: "Hexer",
    role: "Cackling cave caster with fear and fire",
    token: "H",
    tags: ["caster", "hex", "fire"],
    behavior: "rangedKiter",
    hp: (cat) => 7 + cat * 10,
    ac: (cat) => 12 + Math.floor(cat / 2),
    attackBonus: (cat) => 3 + cat,
    damage: (cat) => damage(Math.max(1, Math.ceil(cat / 3)), 8, 2 + Math.ceil(cat / 2), cat >= 4 ? "fire" : "necrotic", "spell", ranged(60, 180), "Goblin Hex"),
    abilityMods: (cat) => mods(0, 2 + Math.floor(cat / 4), 1 + Math.floor(cat / 4), 2 + Math.floor(cat / 2), 1, 1 + Math.floor(cat / 3)),
    initiativeBonus: (cat) => 2 + Math.floor(cat / 4),
    kit: () => kit("quarterstaff", "leather"),
    specialAbility: (cat) => cat >= 4 ? ["Dread Whisper", "Fireball"] : ["Dread Whisper"],
    multiattack: () => undefined,
  },
];

function bossEntry(cat) {
  const title = categoryTitles[cat];
  return {
    id: `goblin${title.replace(/[^A-Za-z0-9]/g, "")}Boss`,
    name: `${title} Goblin Boss`,
    role: `Category ${cat} goblin boss commander`,
    tags: ["humanoid", "goblin", "goblin-camp", "boss", "leader", "brute"],
    maxHp: 24 + cat * 34,
    category: cat,
    multiattack: cat >= 8 ? { attacks: 3 } : cat >= 4 ? { attacks: 2 } : undefined,
    xp: categoryXp[cat].boss,
    ac: 14 + Math.floor(cat * 0.8),
    attackBonus: 4 + cat,
    damage: damage(Math.max(1, Math.ceil(cat / 3)), 10, 3 + cat, "slashing", "weapon", melee(), "Boss Cleaver"),
    damageResistances: cat >= 7 ? ["poison"] : empty,
    damageVulnerabilities: empty,
    damageImmunities: empty,
    conditionImmunities: cat >= 8 ? ["frightened"] : empty,
    specialAbility: cat >= 9 ? ["Bark Orders", "Rush", "King's Return"] : cat >= 5 ? ["Bark Orders", "Rush"] : ["Bark Orders"],
    abilityMods: mods(3 + Math.floor(cat / 2), 2 + Math.floor(cat / 3), 2 + Math.floor(cat / 2), 1, 2, 2 + Math.floor(cat / 2)),
    baseAttackAbilityMod: 3 + Math.floor(cat / 2),
    initiativeBonus: 2 + Math.floor(cat / 3),
    speedFeet: 30,
    behavior: "melee",
    token: "B",
    tokenArt: `assets/tokens/goblin-${kebab(title)}-boss.jpg`,
    flying: false,
    ...kit(cat >= 5 ? "greataxe" : "scimitar", cat >= 6 ? "breastplate" : "studded-leather", { offHand: cat < 5 ? "shield" : null }),
    extraLoot: [
      { kind: "randomEquipment" },
      { kind: "item", itemId: "goblin-boss-charm", quantity: 1, chance: 0.18 },
    ],
  };
}

function registerGoblin(entry) {
  const abilityMods = entry.abilityMods;
  window.DungeonContent.register("monsters", entry.id, {
    name: entry.name,
    role: entry.role,
    tags: entry.tags,
    maxHp: entry.maxHp,
    category: entry.category,
    multiattack: entry.multiattack,
    xp: entry.xp,
    ac: entry.ac,
    attackBonus: entry.attackBonus,
    damage: entry.damage,
    damageResistances: entry.damageResistances ?? empty,
    damageVulnerabilities: entry.damageVulnerabilities ?? empty,
    damageImmunities: entry.damageImmunities ?? empty,
    conditionImmunities: entry.conditionImmunities ?? empty,
    specialAbility: entry.specialAbility ?? empty,
    abilityScores: scores(abilityMods),
    abilityMods,
    baseAttackAbilityMod: entry.baseAttackAbilityMod ?? Math.max(abilityMods.dex, abilityMods.str, abilityMods.int),
    initiativeBonus: entry.initiativeBonus,
    speedFeet: entry.speedFeet ?? 30,
    behavior: entry.behavior,
    token: entry.token,
    tokenArt: entry.tokenArt ?? `assets/tokens/${kebab(entry.id)}.jpg`,
    flying: false,
    equipment: entry.equipment,
    inventory: entry.inventory,
    extraLoot: entry.extraLoot ?? empty,
  });
}

for (let cat = 1; cat <= 10; cat += 1) {
  const title = categoryTitles[cat];
  for (const archetype of archetypes) {
    const id = `goblin${title.replace(/[^A-Za-z0-9]/g, "")}${archetype.label}`;
    registerGoblin({
      id,
      name: `${title} Goblin ${archetype.label}`,
      role: `Category ${cat} goblin ${archetype.role}`,
      tags: ["humanoid", "goblin", "goblin-camp", ...archetype.tags],
      maxHp: archetype.hp(cat),
      category: cat,
      multiattack: archetype.multiattack(cat) ? { attacks: archetype.multiattack(cat) } : undefined,
      xp: categoryXp[cat].normal,
      ac: archetype.ac(cat),
      attackBonus: archetype.attackBonus(cat),
      damage: archetype.damage(cat),
      damageResistances: empty,
      damageVulnerabilities: empty,
      damageImmunities: empty,
      conditionImmunities: empty,
      specialAbility: archetype.specialAbility(cat),
      abilityMods: archetype.abilityMods(cat),
      initiativeBonus: archetype.initiativeBonus(cat),
      speedFeet: cat >= 7 ? 35 : 30,
      behavior: archetype.behavior,
      token: archetype.token,
      ...archetype.kit(cat),
    });
  }
  registerGoblin(bossEntry(cat));
}
})();
