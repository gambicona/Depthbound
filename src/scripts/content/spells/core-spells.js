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
  shatter: ["wizard", "bard"],
  web: ["wizard"],
  "lightning-bolt": ["wizard", "sorcerer"],
  grease: ["wizard"],
  haste: ["wizard", "sorcerer"],
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
  silence: ["ranger"],
  "cordon-of-arrows": ["ranger"],
  fireball: ["wizard", "sorcerer"],
};

function minCharacterLevel(spellLevel, casterType = "full") {
  if (casterType === "half") return spellLevel <= 1 ? 2 : 5;
  return spellLevel <= 1 ? 1 : spellLevel === 2 ? 3 : 5;
}

function spell(id, definition) {
  const classes = availability[id] ?? [];
  window.DungeonContent.register("spells", id, {
    id,
    school: definition.school ?? "combat",
    classes,
    minCharacterLevelFull: minCharacterLevel(definition.level, "full"),
    minCharacterLevelHalf: minCharacterLevel(definition.level, "half"),
    costsByLevel: Object.fromEntries(
      [1, 2, 3]
        .filter((level) => level >= definition.level)
        .map((level) => [level, spellCostByLevel[level]]),
    ),
    ...definition,
  });
}

const action = "action";
const quick = "bonusAction";
const weaponRider = "weaponRider";
const reaction = "reaction";
const concentration3 = { concentration: true, duration: { kind: "rounds", rounds: 3 } };
const oneRound = { duration: { kind: "rounds", rounds: 1 } };

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
  description: "Concentration, 3 rounds. Ally gains +2 attacks and saves. Upcast: +1 target later.",
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
  description: "Concentration, 3 rounds. WIS save or -2 attacks and saves. Upcast: +1 target later.",
});

spell("shield-of-faith", {
  name: "Shield of Faith",
  level: 1,
  resource: quick,
  range: { kind: "ranged", feet: 60 },
  target: "ally",
  ...concentration3,
  effect: { kind: "status", status: { id: "shield-of-faith", label: "Shield of Faith", acBonus: 2, durationRounds: 3 } },
  upcast: { targetsPerLevel: 1 },
  aiCategory: "defensive-reaction",
  description: "Concentration, 3 rounds. Ally gains +2 AC. Upcast: +1 target later.",
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
  description: "Concentration aura for 3 rounds. Nearby enemies are slowed and take radiant damage in later full implementation.",
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
  effect: { kind: "status", status: { id: "aid", label: "Aid", maxHpBonus: 5, tempHp: 5 } },
  upcast: { tempHpPerLevel: 5 },
  aiCategory: "efficient-heal",
  description: "Bolster an ally with extra max HP and temporary HP.",
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
  effect: { kind: "status", status: { id: "longstrider", label: "Longstrider", speedBonusFeet: 10 } },
  upcast: { targetsPerLevel: 1 },
  aiCategory: "escape-mobility",
  description: "Encounter mobility buff. Ally gains +10 ft speed.",
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
  effect: { kind: "status", status: { id: "mage-armor", label: "Mage Armor", acBonus: 3 } },
  aiCategory: "buff-opener",
  description: "Encounter defense. Ally gains +3 AC while unarmored in the slim model.",
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
  effect: { kind: "status", status: { id: "armor-of-agathys", label: "Armor of Agathys", tempHp: 5 } },
  upcast: { tempHpPerLevel: 5 },
  aiCategory: "defensive-reaction",
  description: "Gain 5 temporary HP per spell level and cold retaliation in the slim model.",
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

spell("hellish_rebuke", {
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
};

for (const [alias, sourceId] of Object.entries(spellAliases)) {
  const source = window.DungeonContent.get("spells", sourceId);
  if (source) window.DungeonContent.register("spells", alias, { ...source, id: alias, aliasOf: sourceId });
}
})();
