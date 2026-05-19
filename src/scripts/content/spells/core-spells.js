(() => {
const spellCostByLevel = { 1: 2, 2: 3, 3: 5 };

const availability = {
  "cure-wounds": ["cleric", "druid", "paladin", "ranger"],
  "healing-word": ["cleric", "druid", "bard"],
  "guiding-bolt": ["cleric"],
  bless: ["cleric", "paladin"],
  bane: ["cleric"],
  "shield-of-faith": ["cleric", "paladin"],
  "spiritual-weapon": ["cleric"],
  "hold-person": ["cleric", "bard"],
  "spirit-guardians": ["cleric"],
  "mass-healing-word": ["cleric", "bard"],
  entangle: ["druid"],
  "faerie-fire": ["druid", "bard"],
  thunderwave: ["druid", "sorcerer"],
  barkskin: ["druid", "ranger"],
  "heat-metal": ["druid", "bard"],
  moonbeam: ["druid"],
  "spike-growth": ["druid", "ranger"],
  "call-lightning": ["druid"],
  "magic-missile": ["wizard", "sorcerer"],
  shield: ["wizard", "sorcerer"],
  "burning-hands": ["wizard", "sorcerer"],
  "scorching-ray": ["wizard", "sorcerer"],
  "misty-step": ["wizard", "sorcerer"],
  invisibility: ["bard", "sorcerer", "warlock", "wizard"],
  shatter: ["wizard", "bard"],
  web: ["wizard"],
  "lightning-bolt": ["wizard", "sorcerer"],
  grease: ["wizard"],
  haste: ["wizard", "sorcerer"],
  fly: ["sorcerer", "warlock", "wizard"],
  "hideous-laughter": ["bard"],
  heroism: ["bard", "paladin"],
  "hypnotic-pattern": ["bard"],
  "divine-favor": ["paladin"],
  "thunderous-smite": ["paladin"],
  "wrathful-smite": ["paladin"],
  "compelled-duel": ["paladin"],
  aid: ["paladin"],
  "branding-smite": ["paladin"],
  "hunters-mark": ["ranger"],
  "ensnaring-strike": ["ranger"],
  "hail-of-thorns": ["ranger"],
  "fog-cloud": ["ranger"],
  longstrider: ["ranger"],
  "pass-without-trace": ["druid", "ranger"],
  silence: ["ranger"],
  "cordon-of-arrows": ["ranger"],
  fireball: ["wizard", "sorcerer"],
  "vicious-mockery": ["bard"],
  "mage-hand": ["artificer", "bard", "sorcerer", "warlock", "wizard"],
  "blade-ward": ["bard", "sorcerer", "warlock", "wizard"],
  guidance: ["artificer", "cleric", "druid"],
  "sacred-flame": ["cleric"],
  "spare-the-dying": ["artificer", "cleric"],
  "produce-flame": ["druid"],
  "thorn-whip": ["artificer", "druid"],
  "fire-bolt": ["artificer", "sorcerer", "wizard"],
  "mind-sliver": ["sorcerer", "warlock", "wizard"],
  "eldritch-blast": ["warlock"],
  "hellish-rebuke": ["warlock"],
  "inflict-wounds": ["cleric"],
  thunderclap: ["artificer", "bard", "druid", "sorcerer", "warlock", "wizard"],
  "chill-touch": ["sorcerer", "warlock", "wizard"],
  "acid-splash": ["artificer", "sorcerer", "wizard"],
  "booming-blade": ["artificer", "sorcerer", "warlock", "wizard"],
  frostbite: ["artificer", "druid", "sorcerer", "warlock", "wizard"],
  "green-flame-blade": ["artificer", "sorcerer", "warlock", "wizard"],
  "poison-spray": ["artificer", "druid", "sorcerer", "warlock", "wizard"],
  "primal-savagery": ["druid"],
  "ray-of-frost": ["artificer", "sorcerer", "wizard"],
  resistance: ["artificer", "cleric", "druid"],
  shillelagh: ["druid"],
  "shocking-grasp": ["artificer", "sorcerer", "wizard"],
  "toll-the-dead": ["cleric", "warlock", "wizard"],
};

function minCharacterLevel(spellLevel, casterType = "full") {
  if (casterType === "half") return spellLevel <= 1 ? 2 : 5;
  return spellLevel <= 1 ? 1 : spellLevel === 2 ? 3 : 5;
}

function spell(id, definition) {
  const classes = availability[id] ?? [];
  const isCantrip = definition.level === 0;
  window.DungeonContent.register("spells", id, {
    id,
    school: definition.school ?? "combat",
    classes,
    minCharacterLevelFull: isCantrip ? 1 : minCharacterLevel(definition.level, "full"),
    minCharacterLevelHalf: isCantrip ? 1 : minCharacterLevel(definition.level, "half"),
    costsByLevel: Object.fromEntries(
      [0, 1, 2, 3]
        .filter((level) => level >= definition.level)
        .map((level) => [level, isCantrip ? 0 : spellCostByLevel[level]]),
    ),
    ...definition,
  });
}

const action = "action";
const quick = "bonusAction";
const weaponRider = "weaponRider";
const reaction = "reaction";
const concentration3 = { concentration: true, duration: { kind: "rounds", rounds: 3 } };
const concentration10 = { concentration: true, duration: { kind: "rounds", rounds: 10 } };
const oneRound = { duration: { kind: "rounds", rounds: 1 } };

spell("dragonborn-breath", {
  name: "Breath Weapon",
  level: 0,
  resource: action,
  range: { kind: "self", feet: 15 },
  target: "direction",
  area: { shape: "cone", lengthFeet: 15 },
  save: { ability: "dex", halfDamage: true },
  saveDcAbility: "con",
  effect: { kind: "damage", dice: { count: 2, sides: 6 }, type: "fire" },
  aiCategory: "area-damage",
  description: "Ancestral 15 ft cone. DEX save for half damage. Damage type follows draconic ancestry.",
});

spell("eladrin-fey-step", {
  name: "Fey Step",
  level: 2,
  cost: 0,
  costsByLevel: { 2: 0 },
  resource: quick,
  range: { kind: "self", feet: 30 },
  target: "point",
  effect: { kind: "teleport" },
  racialAbilityId: "eladrinFeyStep",
  aiCategory: "escape-mobility",
  description: "Racial bonus action. Teleport to a visible empty square within 30 ft. Refreshes on short rest.",
});

spell("shadar-kai-blessing", {
  name: "Blessing of the Raven Queen",
  level: 2,
  cost: 0,
  costsByLevel: { 2: 0 },
  resource: quick,
  range: { kind: "self", feet: 30 },
  target: "point",
  effect: { kind: "teleport" },
  racialAbilityId: "shadarKaiBlessing",
  aiCategory: "escape-mobility",
  description: "Racial bonus action. Teleport through shadow to a visible empty square within 30 ft. Refreshes on short rest.",
});

spell("duergar-enlarge", {
  name: "Duergar Enlarge",
  level: 2,
  cost: 0,
  costsByLevel: { 2: 0 },
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  effect: { kind: "status", status: { id: "duergar-enlarge", label: "Enlarged", tempHp: 4, damageBonus: 4, durationRounds: 3 } },
  racialAbilityId: "duergarEnlarge",
  aiCategory: "buff-opener",
  description: "Racial action. Gain 4 HP and +4 weapon damage for 3 rounds. Refreshes on long rest.",
});

spell("drow-faerie-fire", {
  name: "Drow Faerie Fire",
  level: 1,
  cost: 0,
  costsByLevel: { 1: 0 },
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "point",
  area: { shape: "circle", radiusFeet: 10 },
  save: { ability: "dex", negatesStatus: true },
  saveDcAbility: "cha",
  ...concentration3,
  effect: { kind: "status", status: { id: "faerie-fire", label: "Revealed", attackBonus: -1, expiresAtEndOfTurn: true } },
  racialAbilityId: "drowFaerieFire",
  aiCategory: "control-cluster",
  description: "Racial action. DEX save or Revealed and easier to hit. Refreshes on long rest.",
});

spell("baalzebul-ray-of-sickness", {
  name: "Ray of Sickness",
  level: 1,
  cost: 0,
  costsByLevel: { 1: 0 },
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  saveDcAbility: "cha",
  attackAbility: "cha",
  effect: { kind: "attackDamage", dice: { count: 2, sides: 8 }, type: "poison", status: { id: "sickened", label: "Sickened", attackBonus: -2, expiresAtEndOfTurn: true } },
  racialAbilityId: "baalzebulRayOfSickness",
  aiCategory: "finish-target",
  description: "Racial action. Poison spell attack for 2d8 and a brief attack penalty. Refreshes on long rest.",
});

spell("levistus-armor-of-agathys", {
  name: "Armor of Agathys",
  level: 1,
  cost: 0,
  costsByLevel: { 1: 0 },
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  effect: { kind: "status", status: { id: "armor-of-agathys", label: "Armor of Agathys", tempHp: 5, resistances: ["cold"], durationRounds: 3 } },
  racialAbilityId: "levistusArmorOfAgathys",
  aiCategory: "defensive-reaction",
  description: "Racial action. Gain icy protection, cold resistance, and 5 HP for 3 rounds. Refreshes on long rest.",
});

spell("mephistopheles-burning-hands", {
  name: "Burning Hands",
  level: 1,
  cost: 0,
  costsByLevel: { 1: 0 },
  resource: action,
  range: { kind: "self", feet: 15 },
  target: "direction",
  area: { shape: "cone", lengthFeet: 15 },
  save: { ability: "dex", halfDamage: true },
  saveDcAbility: "cha",
  effect: { kind: "damage", dice: { count: 3, sides: 6 }, type: "fire" },
  racialAbilityId: "mephistophelesBurningHands",
  aiCategory: "aoe-damage",
  description: "Racial action. 15 ft cone for 3d6 fire, DEX save half. Refreshes on long rest.",
});

spell("zariel-branding-smite", {
  name: "Branding Smite",
  level: 2,
  cost: 0,
  costsByLevel: { 2: 0 },
  resource: weaponRider,
  range: { kind: "self", feet: 0 },
  target: "self",
  saveDcAbility: "cha",
  effect: { kind: "status", status: { id: "branding-smite", label: "Branding Smite", damageBonus: 8, expiresAtEndOfTurn: true } },
  racialAbilityId: "zarielBrandingSmite",
  aiCategory: "buff-opener",
  description: "Racial bonus action. Your next weapon hit this turn adds radiant branding. Refreshes on long rest.",
});

spell("minor-illusion", {
  name: "Minor Illusion",
  level: 0,
  cost: 0,
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  effect: { kind: "status", status: { id: "minor-illusion", label: "Minor Illusion", acBonus: 2, expiresAtStartOfTurn: true } },
  description: "Racial cantrip. Create a quick distraction; gain +2 AC until your next turn.",
});

spell("high-elf-fire-bolt", {
  name: "High Elf Fire Bolt",
  level: 0,
  cost: 0,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "enemy",
  attackAbility: "int",
  effect: { kind: "attackDamage", dice: { count: 1, sides: 10 }, type: "fire" },
  description: "Racial wizard cantrip. INT spell attack for fire damage. Damage scales at levels 5, 11, and 17.",
});

spell("levistus-ray-of-frost", {
  name: "Levistus Ray of Frost",
  level: 0,
  cost: 0,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  attackAbility: "cha",
  effect: { kind: "attackDamage", dice: { count: 1, sides: 8 }, type: "cold", status: { id: "ray-of-frost", label: "Slowed", speedBonusFeet: -10, expiresAtEndOfTurn: true } },
  description: "Racial cantrip. CHA spell attack for cold damage and a brief slow. Damage scales at levels 5, 11, and 17.",
});

spell("aasimar-radiant-soul", {
  name: "Radiant Soul",
  level: 3,
  cost: 0,
  costsByLevel: { 3: 0 },
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  effect: { kind: "status", status: { id: "aasimar-radiant-soul", label: "Radiant Soul", flying: true, damageBonus: 4, speedBonusFeet: 10, durationRounds: 10 } },
  racialAbilityId: "aasimarRadiantSoul",
  description: "Racial action. Divine wings: Flying, +4 damage, and +10 ft speed for 10 rounds. Refreshes on long rest.",
});

spell("gem-dragonborn-flight", {
  name: "Gem Flight",
  level: 3,
  cost: 0,
  costsByLevel: { 3: 0 },
  resource: "bonusAction",
  range: { kind: "self", feet: 0 },
  target: "self",
  effect: { kind: "status", status: { id: "gem-dragonborn-flight", label: "Gem Flight", flying: true, durationRounds: 10 } },
  racialAbilityId: "gemDragonbornFlight",
  description: "Racial bonus action. Spectral gem wings grant Flying for 10 rounds. Refreshes on long rest.",
});

spell("aasimar-radiant-consumption", {
  name: "Radiant Consumption",
  level: 3,
  cost: 0,
  costsByLevel: { 3: 0 },
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  effect: { kind: "status", status: { id: "aasimar-radiant-consumption", label: "Radiant Consumption", damageBonus: 6, acBonus: -1, durationRounds: 10 } },
  racialAbilityId: "aasimarRadiantConsumption",
  description: "Racial action. Searing form: +6 damage but -1 AC for 10 rounds. Refreshes on long rest.",
});

spell("aasimar-necrotic-shroud", {
  name: "Necrotic Shroud",
  level: 3,
  cost: 0,
  costsByLevel: { 3: 0 },
  resource: action,
  range: { kind: "self", feet: 10 },
  target: "point",
  area: { shape: "circle", radiusFeet: 10 },
  save: { ability: "cha", negatesStatus: true },
  saveDcAbility: "cha",
  effect: { kind: "status", status: { id: "frightened", label: "Frightened", attackBonus: -2, expiresAtEndOfTurn: true } },
  racialAbilityId: "aasimarNecroticShroud",
  description: "Racial action. Nearby enemies make a CHA save or become Frightened briefly. Refreshes on long rest.",
});

spell("yuan-ti-poison-spray", {
  name: "Yuan-ti Poison Spray",
  level: 0,
  cost: 0,
  resource: action,
  range: { kind: "ranged", feet: 10 },
  target: "enemy",
  save: { ability: "con" },
  saveDcAbility: "cha",
  effect: { kind: "damage", dice: { count: 1, sides: 12 }, type: "poison" },
  description: "Racial cantrip. CHA-based CON save or poison damage. Damage scales at levels 5, 11, and 17.",
});

spell("yuan-ti-suggestion", {
  name: "Suggestion",
  level: 2,
  cost: 0,
  costsByLevel: { 2: 0 },
  resource: action,
  range: { kind: "ranged", feet: 30 },
  target: "enemy",
  save: { ability: "wis", negatesStatus: true },
  saveDcAbility: "cha",
  effect: { kind: "status", status: { id: "suggested", label: "Suggested", actionLocked: true, expiresAtEndOfTurn: true } },
  racialAbilityId: "yuanTiSuggestion",
  description: "Racial action. WIS save or the enemy loses its next action. Refreshes on long rest.",
});

spell("air-genasi-levitate", {
  name: "Levitate",
  level: 2,
  cost: 0,
  costsByLevel: { 2: 0 },
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  saveDcAbility: "con",
  effect: { kind: "status", status: { id: "levitating", label: "Levitating", flying: true, acBonus: 2, speedBonusFeet: 10, durationRounds: 3 } },
  racialAbilityId: "airGenasiLevitate",
  description: "Racial action. Float above danger: Flying, +2 AC, and +10 ft speed for 3 rounds. Refreshes on long rest.",
});

spell("fire-genasi-burning-hands", {
  name: "Burning Hands",
  level: 1,
  cost: 0,
  costsByLevel: { 1: 0 },
  resource: action,
  range: { kind: "self", feet: 15 },
  target: "direction",
  area: { shape: "cone", lengthFeet: 15 },
  save: { ability: "dex", halfDamage: true },
  saveDcAbility: "con",
  effect: { kind: "damage", dice: { count: 3, sides: 6 }, type: "fire" },
  racialAbilityId: "fireGenasiBurningHands",
  aiCategory: "aoe-damage",
  description: "Racial action. 15 ft cone for 3d6 fire, DEX save half. Refreshes on long rest.",
});

spell("cure-wounds", {
  name: "Cure Wounds",
  level: 1,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "ally",
  effect: { kind: "healing", dice: { count: 1, sides: 8 }, abilityBonus: "spellcasting" },
  upcast: { dicePerLevel: 1 },
  aiCategory: "efficient-heal",
  description: "Action. Touch heal for 1d8 + spell stat. Upcast: +1d8 per spell level.",
});

spell("healing-word", {
  name: "Healing Word",
  level: 1,
  resource: quick,
  range: { kind: "ranged", feet: 60 },
  target: "ally",
  effect: { kind: "healing", dice: { count: 1, sides: 4 }, abilityBonus: "spellcasting" },
  upcast: { dicePerLevel: 1 },
  aiCategory: "emergency-heal",
  description: "Quick ranged heal for 1d4 + spell stat. Upcast: +1d4 per spell level.",
});

spell("guiding-bolt", {
  name: "Guiding Bolt",
  level: 1,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "enemy",
  effect: { kind: "attackDamage", dice: { count: 4, sides: 6 }, type: "radiant", status: { id: "exposed", label: "Exposed", attackBonus: -1, expiresAtStartOfTurn: true } },
  upcast: { dicePerLevel: 1 },
  aiCategory: "finish-target",
  description: "Ranged spell attack for 4d6 radiant and Exposed on hit. Upcast: +1d6.",
});

spell("bless", {
  name: "Bless",
  level: 1,
  resource: action,
  range: { kind: "ranged", feet: 30 },
  target: "ally",
  ...concentration3,
  effect: { kind: "status", status: { id: "blessed", label: "Blessed", attackBonus: 2, saveBonus: 2, durationRounds: 3 } },
  upcast: { targetsPerLevel: 1 },
  aiCategory: "buff-opener",
  description: "Concentration, 3 rounds. Ally gains +2 attacks and saves. Upcast: +1 target.",
});

spell("bane", {
  name: "Bane",
  level: 1,
  resource: action,
  range: { kind: "ranged", feet: 30 },
  target: "enemy",
  save: { ability: "wis", negatesStatus: true },
  ...concentration3,
  effect: { kind: "status", status: { id: "baned", label: "Baned", attackBonus: -2, saveBonus: -2, durationRounds: 3 } },
  upcast: { targetsPerLevel: 1 },
  aiCategory: "control-cluster",
  description: "Concentration, 3 rounds. WIS save or -2 attacks and saves. Upcast: +1 target.",
});

spell("shield-of-faith", {
  name: "Shield of Faith",
  level: 1,
  resource: quick,
  range: { kind: "ranged", feet: 60 },
  target: "ally",
  concentration: true,
  duration: { kind: "minutes", minutes: 10 },
  effect: { kind: "status", status: { id: "shield-of-faith", label: "Shield of Faith", acBonus: 2, durationMinutes: 10 } },
  upcast: { targetsPerLevel: 1 },
  aiCategory: "defensive-reaction",
  description: "Concentration, 10 minutes. Ally gains +2 AC. Upcast: +1 target.",
});

spell("spiritual-weapon", {
  name: "Spiritual Weapon",
  level: 2,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  effect: { kind: "attackDamage", dice: { count: 1, sides: 8 }, abilityBonus: "spellcasting", type: "radiant" },
  upcast: { diceAtLevel: { 3: 2 } },
  aiCategory: "finish-target",
  description: "Spell attack for 1d8 + spell stat radiant. Cast at 3rd: 2d8 + spell stat.",
});

spell("hold-person", {
  name: "Hold Person",
  level: 2,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  save: { ability: "wis", negatesStatus: true },
  concentration: true,
  ...oneRound,
  effect: { kind: "status", status: { id: "held", label: "Held", speedLocked: true, actionLocked: true, expiresAtEndOfTurn: true } },
  upcast: { targetsPerLevel: 1 },
  aiCategory: "control-cluster",
  description: "WIS save or Held for 1 round. Bosses receive a weaker effect.",
});

spell("spirit-guardians", {
  name: "Spirit Guardians",
  level: 3,
  resource: action,
  range: { kind: "self", feet: 15 },
  target: "self",
  ...concentration3,
  effect: { kind: "status", status: { id: "spirit-guardians", label: "Spirit Guardians", aura: { radiusFeet: 15, damage: { count: 3, sides: 8, type: "radiant" }, save: "wis" }, durationRounds: 3 } },
  aiCategory: "control-cluster",
  description: "Concentration aura for 3 rounds. Nearby enemies make WIS saves and take radiant damage.",
});

spell("mass-healing-word", {
  name: "Mass Healing Word",
  level: 3,
  resource: quick,
  range: { kind: "ranged", feet: 60 },
  target: "ally",
  area: { shape: "circle", radiusFeet: 30 },
  effect: { kind: "healing", dice: { count: 1, sides: 4 }, abilityBonus: "spellcasting" },
  aiCategory: "emergency-heal",
  description: "Quick area heal: allies in the burst heal 1d4 + spell stat.",
});

spell("entangle", {
  name: "Entangle",
  level: 1,
  resource: action,
  range: { kind: "ranged", feet: 90 },
  target: "point",
  area: { shape: "circle", radiusFeet: 10 },
  save: { ability: "str", negatesStatus: true },
  ...concentration3,
  effect: { kind: "status", status: { id: "restrained", label: "Restrained", speedLocked: true, expiresAtEndOfTurn: true } },
  upcast: { areaRadiusFeetPerLevel: 5 },
  aiCategory: "control-cluster",
  description: "Small ground burst. STR save or Restrained for 1 round. Upcast: larger area.",
});

spell("faerie-fire", {
  name: "Faerie Fire",
  level: 1,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "point",
  area: { shape: "circle", radiusFeet: 10 },
  save: { ability: "dex", negatesStatus: true },
  ...concentration3,
  effect: { kind: "status", status: { id: "faerie-fire", label: "Revealed", attackBonus: -1, expiresAtEndOfTurn: true } },
  upcast: { areaRadiusFeetPerLevel: 5 },
  aiCategory: "control-cluster",
  description: "DEX save or Revealed and Exposed. Upcast: larger area.",
});

spell("thunderwave", {
  name: "Thunderwave",
  level: 1,
  resource: action,
  range: { kind: "self", feet: 15 },
  target: "direction",
  area: { shape: "cone", lengthFeet: 15 },
  save: { ability: "con", halfDamage: true },
  effect: { kind: "damage", dice: { count: 2, sides: 8 }, type: "thunder", pushOnFailedSave: true },
  upcast: { dicePerLevel: 1 },
  aiCategory: "control-cluster",
  description: "Short cone for 2d8 thunder, CON save half. Upcast: +1d8.",
});

spell("barkskin", {
  name: "Barkskin",
  level: 2,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "ally",
  ...concentration3,
  effect: { kind: "status", status: { id: "barkskin", label: "Barkskin", acBonus: 2, durationRounds: 3 } },
  upcast: { targetsPerLevel: 1 },
  aiCategory: "buff-opener",
  description: "Concentration, 3 rounds. Ally gains +2 AC.",
});

spell("heat-metal", {
  name: "Heat Metal",
  level: 2,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  ...concentration3,
  effect: { kind: "damage", dice: { count: 2, sides: 8 }, type: "fire", status: { id: "heated-metal", label: "Heated Metal", attackBonus: -2, durationRounds: 3 } },
  upcast: { dicePerLevel: 1 },
  aiCategory: "finish-target",
  description: "Deal 2d8 fire and penalize attacks for 3 rounds. Upcast: +1d8.",
});

spell("moonbeam", {
  name: "Moonbeam",
  level: 2,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "point",
  area: { shape: "circle", radiusFeet: 5 },
  save: { ability: "con", halfDamage: true },
  ...concentration3,
  effect: { kind: "damage", dice: { count: 2, sides: 10 }, type: "radiant" },
  upcast: { dicePerLevel: 1 },
  aiCategory: "aoe-damage",
  description: "Small moonlit burst for 2d10 radiant, CON save half. Upcast: +1d10.",
});

spell("spike-growth", {
  name: "Spike Growth",
  level: 2,
  resource: action,
  range: { kind: "ranged", feet: 90 },
  target: "point",
  area: { shape: "circle", radiusFeet: 15 },
  ...concentration3,
  effect: { kind: "damage", dice: { count: 2, sides: 4 }, type: "piercing", status: { id: "slowed", label: "Slowed", speedBonusFeet: -10, expiresAtEndOfTurn: true } },
  upcast: { dicePerLevel: 1 },
  aiCategory: "control-cluster",
  description: "Thorny area deals 2d4 piercing and Slows. Upcast: +1d4.",
});

spell("call-lightning", {
  name: "Call Lightning",
  level: 3,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "point",
  area: { shape: "circle", radiusFeet: 10 },
  save: { ability: "dex", halfDamage: true },
  ...concentration3,
  effect: { kind: "damage", dice: { count: 3, sides: 10 }, type: "lightning" },
  aiCategory: "aoe-damage",
  description: "Lightning burst for 3d10, DEX save half.",
});

spell("magic-missile", {
  name: "Magic Missile",
  level: 1,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "enemy",
  effect: { kind: "damage", dice: { count: 3, sides: 4, bonus: 3 }, type: "force", autoHit: true },
  upcast: { dicePerLevel: 1, bonusPerLevel: 1 },
  aiCategory: "finish-target",
  description: "Auto-hit force darts for 3d4 + 3. Upcast: +1 dart.",
});

spell("shield", {
  name: "Shield",
  level: 1,
  resource: reaction,
  range: { kind: "self", feet: 0 },
  target: "self",
  effect: { kind: "status", status: { id: "shield", label: "Shield", acBonus: 5, expiresAtStartOfTurn: true } },
  aiCategory: "defensive-reaction",
  description: "Reaction-style stance. Gain +5 AC until your next turn.",
});

spell("burning-hands", {
  name: "Burning Hands",
  level: 1,
  resource: action,
  range: { kind: "self", feet: 15 },
  target: "direction",
  area: { shape: "cone", lengthFeet: 15 },
  save: { ability: "dex", halfDamage: true },
  effect: { kind: "damage", dice: { count: 3, sides: 6 }, type: "fire" },
  upcast: { dicePerLevel: 1 },
  aiCategory: "aoe-damage",
  description: "Cone for 3d6 fire, DEX save half. Upcast: +1d6.",
});

spell("scorching-ray", {
  name: "Scorching Ray",
  level: 2,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "enemy",
  effect: { kind: "attackDamage", dice: { count: 6, sides: 6 }, type: "fire" },
  upcast: { dicePerLevel: 2 },
  aiCategory: "finish-target",
  description: "Three simplified rays: spell attacks for 6d6 fire total. Upcast: +2d6.",
});

spell("misty-step", {
  name: "Misty Step",
  level: 2,
  resource: quick,
  range: { kind: "self", feet: 30 },
  target: "point",
  effect: { kind: "teleport" },
  aiCategory: "escape-mobility",
  description: "Quick teleport to a visible empty square within 30 ft.",
});

spell("invisibility", {
  name: "Invisibility",
  level: 2,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "ally",
  ...concentration3,
  effect: { kind: "status", status: { id: "invisible", label: "Invisible", acBonus: 2, attackBonus: 2, durationRounds: 3 } },
  upcast: { targetsPerLevel: 1 },
  aiCategory: "escape-mobility",
  description: "Concentration, 3 rounds. Ally gains better defense and attack openings.",
});

spell("shatter", {
  name: "Shatter",
  level: 2,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "point",
  area: { shape: "circle", radiusFeet: 10 },
  save: { ability: "con", halfDamage: true },
  effect: { kind: "damage", dice: { count: 3, sides: 8 }, type: "thunder" },
  upcast: { dicePerLevel: 1 },
  aiCategory: "aoe-damage",
  description: "Burst for 3d8 thunder, CON save half. Upcast: +1d8.",
});

spell("web", {
  name: "Web",
  level: 2,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "point",
  area: { shape: "circle", radiusFeet: 15 },
  save: { ability: "dex", negatesStatus: true },
  ...concentration3,
  effect: { kind: "status", status: { id: "webbed", label: "Restrained", speedLocked: true, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "Area control. DEX save or Restrained for 1 round.",
});

spell("lightning-bolt", {
  name: "Lightning Bolt",
  level: 3,
  resource: action,
  range: { kind: "self", feet: 100 },
  target: "direction",
  area: { shape: "line", lengthFeet: 100, widthFeet: 5 },
  save: { ability: "dex", halfDamage: true },
  effect: { kind: "damage", dice: { count: 8, sides: 6 }, type: "lightning" },
  aiCategory: "aoe-damage",
  description: "Line for 8d6 lightning, DEX save half.",
});

spell("grease", {
  name: "Grease",
  level: 1,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "point",
  area: { shape: "circle", radiusFeet: 10 },
  save: { ability: "dex", negatesStatus: true },
  effect: { kind: "status", status: { id: "prone", label: "Prone", speedBonusFeet: -15, expiresAtEndOfTurn: true } },
  upcast: { areaRadiusFeetPerLevel: 5 },
  aiCategory: "control-cluster",
  description: "Ground slick. DEX save or Prone/Slowed for 1 round.",
});

spell("haste", {
  name: "Haste",
  level: 3,
  resource: action,
  range: { kind: "ranged", feet: 30 },
  target: "ally",
  ...concentration3,
  effect: { kind: "status", status: { id: "haste", label: "Haste", acBonus: 2, speedBonusFeet: 30, attackBonus: 1, durationRounds: 3 } },
  aiCategory: "buff-opener",
  description: "Concentration, 3 rounds. Ally gains speed, +2 AC, and +1 attacks.",
});

spell("fly", {
  name: "Fly",
  level: 3,
  school: "transmutation",
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "ally",
  concentration: true,
  duration: { kind: "minutes", minutes: 10 },
  effect: { kind: "status", status: { id: "fly", label: "Flying", flying: true, speedOverrideFeet: 60, durationMinutes: 10 } },
  upcast: { targetsPerLevel: 1 },
  aiCategory: "escape-mobility",
  description: "Concentration, 10 minutes. Ally becomes Flying and has at least 60 ft speed. Upcast: +1 target.",
});

spell("fireball", {
  name: "Fireball",
  level: 3,
  resource: action,
  range: { kind: "ranged", feet: 150 },
  target: "point",
  area: { shape: "circle", radiusFeet: 20 },
  save: { ability: "dex", halfDamage: true },
  effect: { kind: "damage", dice: { count: 8, sides: 6 }, type: "fire" },
  aiCategory: "aoe-damage",
  description: "Large burst for 8d6 fire. Creatures make a DEX save for half.",
});

spell("hideous-laughter", {
  name: "Hideous Laughter",
  level: 1,
  resource: action,
  range: { kind: "ranged", feet: 30 },
  target: "enemy",
  save: { ability: "wis", negatesStatus: true },
  effect: { kind: "status", status: { id: "laughing", label: "Disabled", actionLocked: true, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "WIS save or target loses its next action.",
});

spell("heroism", {
  name: "Heroism",
  level: 1,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "ally",
  ...concentration3,
  effect: { kind: "status", status: { id: "heroism", label: "Heroism", tempHp: 4, attackBonus: 1, durationRounds: 3 } },
  upcast: { targetsPerLevel: 1 },
  aiCategory: "buff-opener",
  description: "Concentration, 3 rounds. Ally gains courage, +1 attacks, and temporary HP.",
});

spell("hypnotic-pattern", {
  name: "Hypnotic Pattern",
  level: 3,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "point",
  area: { shape: "circle", radiusFeet: 20 },
  save: { ability: "wis", negatesStatus: true },
  ...concentration3,
  effect: { kind: "status", status: { id: "hypnotized", label: "Stunned", actionLocked: true, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "Large area WIS save or enemies lose their next action. Bosses receive a weaker effect.",
});

spell("divine-favor", {
  name: "Divine Favor",
  level: 1,
  resource: quick,
  range: { kind: "self", feet: 0 },
  target: "self",
  ...concentration3,
  effect: { kind: "status", status: { id: "divine-favor", label: "Divine Favor", damageBonus: 3, durationRounds: 3 } },
  aiCategory: "buff-opener",
  description: "Concentration, 3 rounds. Weapon hits gain radiant damage in the slim model.",
});

spell("thunderous-smite", {
  name: "Thunderous Smite",
  level: 1,
  resource: weaponRider,
  range: { kind: "self", feet: 0 },
  target: "self",
  effect: { kind: "status", status: { id: "thunderous-smite", label: "Thunderous Smite", damageBonus: 6, expiresAtEndOfTurn: true } },
  upcast: { damageBonusPerLevel: 4 },
  aiCategory: "finish-target",
  description: "Weapon rider. Next hit gains thunder damage and pressure.",
});

spell("wrathful-smite", {
  name: "Wrathful Smite",
  level: 1,
  resource: weaponRider,
  range: { kind: "self", feet: 0 },
  target: "self",
  effect: { kind: "status", status: { id: "wrathful-smite", label: "Wrathful Smite", damageBonus: 4, attackBonus: 1, expiresAtEndOfTurn: true } },
  upcast: { damageBonusPerLevel: 4 },
  aiCategory: "finish-target",
  description: "Weapon rider. Next hit gains psychic pressure.",
});

spell("compelled-duel", {
  name: "Compelled Duel",
  level: 1,
  resource: quick,
  range: { kind: "ranged", feet: 30 },
  target: "enemy",
  save: { ability: "wis", negatesStatus: true },
  ...concentration3,
  effect: { kind: "status", status: { id: "marked", label: "Marked", attackBonus: -1, durationRounds: 3 } },
  aiCategory: "mark-priority-target",
  description: "WIS save or Marked by the paladin for 3 rounds.",
});

spell("aid", {
  name: "Aid",
  level: 2,
  resource: action,
  range: { kind: "ranged", feet: 30 },
  target: "ally",
  duration: { kind: "hours", hours: 8 },
  effect: { kind: "status", status: { id: "aid", label: "Aid", maxHpBonus: 5, tempHp: 5 } },
  upcast: { tempHpPerLevel: 5 },
  aiCategory: "efficient-heal",
  description: "Eight-hour bolster. Ally gains extra max HP and temporary HP.",
});

spell("branding-smite", {
  name: "Branding Smite",
  level: 2,
  resource: weaponRider,
  range: { kind: "self", feet: 0 },
  target: "self",
  effect: { kind: "status", status: { id: "branding-smite", label: "Branding Smite", damageBonus: 8, expiresAtEndOfTurn: true } },
  upcast: { damageBonusPerLevel: 4 },
  aiCategory: "finish-target",
  description: "Weapon rider. Next hit gains radiant damage and reveals the target.",
});

spell("hunters-mark", {
  name: "Hunter's Mark",
  level: 1,
  resource: quick,
  range: { kind: "ranged", feet: 90 },
  target: "enemy",
  ...concentration3,
  effect: { kind: "status", status: { id: "hunters-mark", label: "Hunter's Mark", markedByCaster: true, durationRounds: 3 } },
  aiCategory: "mark-priority-target",
  description: "Concentration, 3 rounds. Mark a priority target.",
});

spell("ensnaring-strike", {
  name: "Ensnaring Strike",
  level: 1,
  resource: weaponRider,
  range: { kind: "self", feet: 0 },
  target: "self",
  ...concentration3,
  effect: { kind: "status", status: { id: "ensnaring-strike", label: "Ensnaring Strike", damageBonus: 4, expiresAtEndOfTurn: true } },
  upcast: { damageBonusPerLevel: 4 },
  aiCategory: "control-cluster",
  description: "Weapon rider. Next hit adds thorn damage and restraint pressure.",
});

spell("hail-of-thorns", {
  name: "Hail of Thorns",
  level: 1,
  resource: weaponRider,
  range: { kind: "self", feet: 0 },
  target: "self",
  effect: { kind: "status", status: { id: "hail-of-thorns", label: "Hail of Thorns", damageBonus: 5, expiresAtEndOfTurn: true } },
  upcast: { damageBonusPerLevel: 5 },
  aiCategory: "aoe-damage",
  description: "Weapon rider. Next ranged hit bursts with thorns.",
});

spell("fog-cloud", {
  name: "Fog Cloud",
  level: 1,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "point",
  area: { shape: "circle", radiusFeet: 15 },
  ...concentration3,
  effect: { kind: "status", status: { id: "obscured", label: "Obscured", attackBonus: -2, durationRounds: 3 } },
  upcast: { areaRadiusFeetPerLevel: 5 },
  aiCategory: "escape-mobility",
  description: "Create fog. Creatures in the area are Obscured.",
});

spell("longstrider", {
  name: "Longstrider",
  level: 1,
  resource: quick,
  range: { kind: "touch", feet: 5 },
  target: "ally",
  duration: { kind: "hours", hours: 1 },
  effect: { kind: "status", status: { id: "longstrider", label: "Longstrider", speedBonusFeet: 10 } },
  upcast: { targetsPerLevel: 1 },
  aiCategory: "escape-mobility",
  description: "One-hour mobility buff. Ally gains +10 ft speed.",
});

spell("pass-without-trace", {
  name: "Pass without Trace",
  level: 2,
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  ...concentration3,
  effect: { kind: "status", status: { id: "pass-without-trace", label: "Pass without Trace", skillBonus: 10, durationRounds: 3 } },
  aiCategory: "escape-mobility",
  description: "Concentration, 3 rounds. Greatly boosts skill checks in the slim model.",
});

spell("silence", {
  name: "Silence",
  level: 2,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "point",
  area: { shape: "circle", radiusFeet: 15 },
  ...concentration3,
  effect: { kind: "status", status: { id: "silenced", label: "Silenced", attackBonus: -2, durationRounds: 3 } },
  aiCategory: "anti-caster",
  description: "Create a silent zone. Creatures in it suffer spellcasting pressure.",
});

spell("cordon-of-arrows", {
  name: "Cordon of Arrows",
  level: 2,
  resource: action,
  range: { kind: "ranged", feet: 30 },
  target: "point",
  area: { shape: "circle", radiusFeet: 10 },
  save: { ability: "dex", halfDamage: true },
  effect: { kind: "damage", dice: { count: 2, sides: 6 }, type: "piercing" },
  upcast: { dicePerLevel: 1 },
  aiCategory: "control-cluster",
  description: "Visible arrow trap zone. Initial burst deals 2d6 piercing, DEX save half.",
});

spell("sleep", {
  name: "Sleep",
  level: 1,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "point",
  area: { shape: "circle", radiusFeet: 15 },
  save: { ability: "wis", negatesStatus: true },
  effect: { kind: "status", status: { id: "asleep", label: "Asleep", actionLocked: true, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "Area WIS save or weak enemies fall Asleep for 1 round.",
});

spell("mage_armor", {
  name: "Mage Armor",
  level: 1,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "ally",
  duration: { kind: "hours", hours: 8 },
  effect: { kind: "status", status: { id: "mage-armor", label: "Mage Armor", acBonus: 3 } },
  aiCategory: "buff-opener",
  description: "Eight-hour defense. Ally gains +3 AC while unarmored in the slim model.",
});

spell("mirror_image", {
  name: "Mirror Image",
  level: 2,
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  effect: { kind: "status", status: { id: "mirror-image", label: "Mirror Image", acBonus: 3, durationRounds: 3 } },
  aiCategory: "defensive-reaction",
  description: "Defensive images give +3 AC for 3 rounds.",
});

spell("dissonant_whispers", {
  name: "Dissonant Whispers",
  level: 1,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  save: { ability: "wis", halfDamage: true },
  effect: { kind: "damage", dice: { count: 3, sides: 6 }, type: "psychic", status: { id: "frightened", label: "Frightened", attackBonus: -2, expiresAtEndOfTurn: true } },
  upcast: { dicePerLevel: 1 },
  aiCategory: "control-cluster",
  description: "WIS save. 3d6 psychic, half on success; failed save also Frightens.",
});

spell("armor_of_agathys", {
  name: "Armor of Agathys",
  level: 1,
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  duration: { kind: "hours", hours: 1 },
  effect: { kind: "status", status: { id: "armor-of-agathys", label: "Armor of Agathys", tempHp: 5 } },
  upcast: { tempHpPerLevel: 5 },
  aiCategory: "defensive-reaction",
  description: "One-hour ward. Gain 5 temporary HP per spell level and cold retaliation in the slim model.",
});

spell("arms_of_hadar", {
  name: "Arms of Hadar",
  level: 1,
  resource: action,
  range: { kind: "self", feet: 10 },
  target: "point",
  area: { shape: "circle", radiusFeet: 10 },
  save: { ability: "str", halfDamage: true },
  effect: { kind: "damage", dice: { count: 2, sides: 6 }, type: "necrotic", status: { id: "hadar-grasp", label: "No Reactions", expiresAtEndOfTurn: true } },
  upcast: { dicePerLevel: 1 },
  aiCategory: "control-cluster",
  description: "Close burst. STR save; 2d6 necrotic and no reactions on failed save.",
});

spell("hex", {
  name: "Hex",
  level: 1,
  resource: quick,
  range: { kind: "ranged", feet: 90 },
  target: "enemy",
  ...concentration3,
  effect: { kind: "status", status: { id: "hex", label: "Hexed", attackBonus: -1, durationRounds: 3 } },
  aiCategory: "mark-priority-target",
  description: "Concentration, 3 rounds. Mark and weaken a target.",
});

spell("hellish-rebuke", {
  name: "Hellish Rebuke",
  level: 1,
  resource: reaction,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  save: { ability: "dex", halfDamage: true },
  effect: { kind: "damage", dice: { count: 2, sides: 10 }, type: "fire" },
  upcast: { dicePerLevel: 1 },
  aiCategory: "finish-target",
  description: "Reaction-style fire blast for 2d10, DEX save half. Upcast: +1d10.",
});

spell("inflict-wounds", {
  name: "Inflict Wounds",
  level: 1,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "enemy",
  effect: { kind: "attackDamage", dice: { count: 3, sides: 10 }, type: "necrotic" },
  upcast: { dicePerLevel: 1 },
  aiCategory: "finish-target",
  description: "Melee spell attack for 3d10 necrotic. Upcast: +1d10.",
});

spell("cause_fear", {
  name: "Cause Fear",
  level: 1,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  save: { ability: "wis", negatesStatus: true },
  effect: { kind: "status", status: { id: "frightened", label: "Frightened", attackBonus: -2, durationRounds: 2 } },
  upcast: { targetsPerLevel: 1 },
  aiCategory: "control-cluster",
  description: "WIS save or Frightened for 2 rounds.",
});

spell("darkness", {
  name: "Darkness",
  level: 2,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "point",
  area: { shape: "circle", radiusFeet: 15 },
  ...concentration3,
  effect: { kind: "status", status: { id: "darkness", label: "Darkness", attackBonus: -3, durationRounds: 3 } },
  upcast: { areaRadiusFeetPerLevel: 5 },
  aiCategory: "control-cluster",
  description: "Magical darkness creates heavy obscurement for 3 rounds.",
});

spell("hunger_of_hadar", {
  name: "Hunger of Hadar",
  level: 3,
  resource: action,
  range: { kind: "ranged", feet: 90 },
  target: "point",
  area: { shape: "circle", radiusFeet: 20 },
  save: { ability: "dex", halfDamage: true },
  ...concentration3,
  effect: { kind: "damage", dice: { count: 4, sides: 6 }, type: "necrotic", status: { id: "blinded", label: "Blinded", attackBonus: -3, expiresAtEndOfTurn: true } },
  upcast: { dicePerLevel: 1 },
  aiCategory: "control-cluster",
  description: "Void zone. 4d6 mixed damage, DEX save half, failed save Blinds briefly.",
});

spell("vampiric_touch", {
  name: "Vampiric Touch",
  level: 3,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "enemy",
  ...concentration3,
  effect: { kind: "attackDamage", dice: { count: 3, sides: 6 }, type: "necrotic", status: { id: "vampiric-touch", label: "Vampiric Touch", tempHp: 4, durationRounds: 3 } },
  upcast: { dicePerLevel: 1 },
  aiCategory: "finish-target",
  description: "Melee spell attack for 3d6 necrotic; caster gains a little vitality.",
});

spell("vicious-mockery", {
  name: "Vicious Mockery",
  level: 0,
  cost: 0,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  save: { ability: "wis" },
  effect: { kind: "damage", dice: { count: 1, sides: 4 }, type: "psychic", status: { id: "mocked", label: "Mocked", attackBonus: -2, expiresAtEndOfTurn: true } },
  description: "Cantrip. WIS save or psychic damage and a short attack penalty. Damage scales at levels 5, 11, and 17.",
});

spell("mage-hand", {
  name: "Mage Hand",
  level: 0,
  cost: 0,
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  effect: { kind: "status", status: { id: "mage-hand", label: "Mage Hand", durationRounds: 10 } },
  description: "Cantrip. The next chest this hero opens is manipulated at range and will not trigger its trap.",
});

spell("blade-ward", {
  name: "Blade Ward",
  level: 0,
  cost: 0,
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  effect: { kind: "status", status: { id: "blade-ward", label: "Blade Ward", resistances: ["bludgeoning", "piercing", "slashing"], expiresAtStartOfTurn: true } },
  description: "Cantrip. Resist bludgeoning, piercing, and slashing damage until your next turn.",
});

spell("guidance", {
  name: "Guidance",
  level: 0,
  cost: 0,
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  effect: { kind: "status", status: { id: "guidance", label: "Guidance", durationRounds: 1 } },
  description: "Cantrip. Passive: while known by any active party hero, adds 1d4 to party skill checks.",
});

spell("sacred-flame", {
  name: "Sacred Flame",
  level: 0,
  cost: 0,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  save: { ability: "dex" },
  effect: { kind: "damage", dice: { count: 1, sides: 8 }, type: "radiant" },
  description: "Cantrip. DEX save or radiant damage. Damage scales at levels 5, 11, and 17.",
});

spell("spare-the-dying", {
  name: "Spare the Dying",
  level: 0,
  cost: 0,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "ally",
  effect: { kind: "status", status: { id: "spare-the-dying", label: "Stabilized", durationRounds: 1 } },
  description: "Cantrip. Stabilizes a dying hero.",
});

spell("produce-flame", {
  name: "Produce Flame",
  level: 0,
  cost: 0,
  resource: action,
  range: { kind: "ranged", feet: 30 },
  target: "enemy",
  effect: { kind: "attackDamage", dice: { count: 1, sides: 8 }, type: "fire" },
  description: "Cantrip. Ranged spell attack for fire damage. Damage scales at levels 5, 11, and 17.",
});

spell("thorn-whip", {
  name: "Thorn Whip",
  level: 0,
  cost: 0,
  resource: action,
  range: { kind: "ranged", feet: 30 },
  target: "enemy",
  effect: { kind: "attackDamage", dice: { count: 1, sides: 6 }, type: "piercing", status: { id: "thorn-whipped", label: "Pulled", speedBonusFeet: -10, expiresAtEndOfTurn: true } },
  description: "Cantrip. Spell attack for piercing damage and a brief movement penalty. Damage scales at levels 5, 11, and 17.",
});

spell("fire-bolt", {
  name: "Fire Bolt",
  level: 0,
  cost: 0,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "enemy",
  effect: { kind: "attackDamage", dice: { count: 1, sides: 10 }, type: "fire" },
  description: "Cantrip. Ranged spell attack for fire damage. Damage scales at levels 5, 11, and 17.",
});

spell("mind-sliver", {
  name: "Mind Sliver",
  level: 0,
  cost: 0,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  save: { ability: "int" },
  effect: { kind: "damage", dice: { count: 1, sides: 6 }, type: "psychic", status: { id: "mind-slivered", label: "Mind Sliver", saveBonus: -2, expiresAtEndOfTurn: true } },
  description: "Cantrip. INT save or psychic damage and a brief save penalty. Damage scales at levels 5, 11, and 17.",
});

spell("eldritch-blast", {
  name: "Eldritch Blast",
  level: 0,
  cost: 0,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "enemy",
  effect: { kind: "attackDamage", dice: { count: 1, sides: 10 }, type: "force" },
  description: "Cantrip. Click targets for force beams. Beam count scales at levels 5, 11, and 17.",
});

spell("thunderclap", {
  name: "Thunderclap",
  level: 0,
  cost: 0,
  resource: action,
  range: { kind: "self", feet: 5 },
  target: "self",
  area: { shape: "circle", radiusFeet: 5 },
  save: { ability: "con" },
  effect: { kind: "damage", dice: { count: 1, sides: 6 }, type: "thunder" },
  description: "Cantrip. Nearby enemies make a CON save or take thunder damage. Damage scales at levels 5, 11, and 17.",
});

spell("chill-touch", {
  name: "Chill Touch",
  level: 0,
  cost: 0,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "enemy",
  effect: { kind: "attackDamage", dice: { count: 1, sides: 8 }, type: "necrotic" },
  description: "Cantrip. Ranged spell attack for necrotic damage. Damage scales at levels 5, 11, and 17.",
});

spell("acid-splash", {
  name: "Acid Splash",
  level: 0,
  cost: 0,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "point",
  area: { shape: "circle", radiusFeet: 5 },
  save: { ability: "dex" },
  effect: { kind: "damage", dice: { count: 1, sides: 6 }, type: "acid" },
  description: "Cantrip. DEX save or acid damage in a small splash. Damage scales at levels 5, 11, and 17.",
});

spell("booming-blade", {
  name: "Booming Blade",
  level: 0,
  cost: 0,
  resource: weaponRider,
  range: { kind: "self", feet: 0 },
  target: "self",
  effect: { kind: "status", status: { id: "booming-blade", label: "Booming Blade", weaponRider: true, damageDice: { count: 1, sides: 8 }, damageType: "thunder", expiresAtEndOfTurn: true } },
  description: "Cantrip. Your next weapon hit this turn adds thunder damage. Damage scales at levels 5, 11, and 17.",
});

spell("frostbite", {
  name: "Frostbite",
  level: 0,
  cost: 0,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  save: { ability: "con" },
  effect: { kind: "damage", dice: { count: 1, sides: 6 }, type: "cold", status: { id: "frostbitten", label: "Frostbitten", attackBonus: -2, expiresAtEndOfTurn: true } },
  description: "Cantrip. CON save or cold damage and a brief attack penalty. Damage scales at levels 5, 11, and 17.",
});

spell("green-flame-blade", {
  name: "Green-Flame Blade",
  level: 0,
  cost: 0,
  resource: weaponRider,
  range: { kind: "self", feet: 0 },
  target: "self",
  effect: { kind: "status", status: { id: "green-flame-blade", label: "Green-Flame Blade", weaponRider: true, damageDice: { count: 1, sides: 8 }, damageType: "fire", expiresAtEndOfTurn: true } },
  description: "Cantrip. Your next weapon hit this turn adds fire damage. Damage scales at levels 5, 11, and 17.",
});

spell("poison-spray", {
  name: "Poison Spray",
  level: 0,
  cost: 0,
  resource: action,
  range: { kind: "ranged", feet: 10 },
  target: "enemy",
  save: { ability: "con" },
  effect: { kind: "damage", dice: { count: 1, sides: 12 }, type: "poison" },
  description: "Cantrip. CON save or poison damage. Damage scales at levels 5, 11, and 17.",
});

spell("primal-savagery", {
  name: "Primal Savagery",
  level: 0,
  cost: 0,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "enemy",
  effect: { kind: "attackDamage", dice: { count: 1, sides: 10 }, type: "acid" },
  description: "Cantrip. Melee spell attack for acid damage. Damage scales at levels 5, 11, and 17.",
});

spell("ray-of-frost", {
  name: "Ray of Frost",
  level: 0,
  cost: 0,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  effect: { kind: "attackDamage", dice: { count: 1, sides: 8 }, type: "cold", status: { id: "ray-of-frost", label: "Slowed", speedBonusFeet: -10, expiresAtEndOfTurn: true } },
  description: "Cantrip. Ranged spell attack for cold damage and a brief slow. Damage scales at levels 5, 11, and 17.",
});

spell("resistance", {
  name: "Resistance",
  level: 0,
  cost: 0,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "ally",
  effect: { kind: "status", status: { id: "resistance", label: "Resistance", saveBonus: 2, expiresAtStartOfTurn: true } },
  description: "Cantrip. Ally gains a short save bonus.",
});

spell("shillelagh", {
  name: "Shillelagh",
  level: 0,
  cost: 0,
  resource: "bonusAction",
  range: { kind: "self", feet: 0 },
  target: "self",
  effect: { kind: "status", status: { id: "shillelagh", label: "Shillelagh", damageBonus: 2, durationRounds: 10 } },
  description: "Cantrip. Your weapon attacks gain a small damage bonus for the encounter.",
});

spell("shocking-grasp", {
  name: "Shocking Grasp",
  level: 0,
  cost: 0,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "enemy",
  effect: { kind: "attackDamage", dice: { count: 1, sides: 8 }, type: "lightning", status: { id: "shocked", label: "Shocked", attackBonus: -1, expiresAtEndOfTurn: true } },
  description: "Cantrip. Melee spell attack for lightning damage. Damage scales at levels 5, 11, and 17.",
});

spell("toll-the-dead", {
  name: "Toll the Dead",
  level: 0,
  cost: 0,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  save: { ability: "wis" },
  effect: { kind: "damage", dice: { count: 1, sides: 8 }, type: "necrotic" },
  description: "Cantrip. WIS save or necrotic damage. Damage scales at levels 5, 11, and 17.",
});

const spellAliases = {
  cure_wounds: "cure-wounds",
  healing_word: "healing-word",
  guiding_bolt: "guiding-bolt",
  shield_of_faith: "shield-of-faith",
  spiritual_weapon: "spiritual-weapon",
  hold_person: "hold-person",
  spirit_guardians: "spirit-guardians",
  mass_healing_word: "mass-healing-word",
  faerie_fire: "faerie-fire",
  heat_metal: "heat-metal",
  spike_growth: "spike-growth",
  call_lightning: "call-lightning",
  magic_missile: "magic-missile",
  burning_hands: "burning-hands",
  scorching_ray: "scorching-ray",
  misty_step: "misty-step",
  pass_without_trace: "pass-without-trace",
  inflict_wounds: "inflict-wounds",
  lightning_bolt: "lightning-bolt",
  hideous_laughter: "hideous-laughter",
  divine_favor: "divine-favor",
  thunderous_smite: "thunderous-smite",
  wrathful_smite: "wrathful-smite",
  compelled_duel: "compelled-duel",
  branding_smite: "branding-smite",
  hunters_mark: "hunters-mark",
  ensnaring_strike: "ensnaring-strike",
  hail_of_thorns: "hail-of-thorns",
  fog_cloud: "fog-cloud",
  cordon_of_arrows: "cordon-of-arrows",
  hypnotic_pattern: "hypnotic-pattern",
  thunder_clap: "thunderclap",
  "thunder-clap": "thunderclap",
  eldritch_blast: "eldritch-blast",
  hellish_rebuke: "hellish-rebuke",
};

for (const [alias, sourceId] of Object.entries(spellAliases)) {
  const source = window.DungeonContent.get("spells", sourceId);
  if (source) window.DungeonContent.register("spells", alias, { ...source, id: alias, aliasOf: sourceId });
}
})();
