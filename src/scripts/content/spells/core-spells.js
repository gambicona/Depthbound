(() => {
const spellCostByLevel = { 1: 2, 2: 3, 3: 5, 4: 7, 5: 9, 6: 11, 7: 13, 8: 15, 9: 18 };

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
  "see-invisibility": ["bard", "sorcerer", "wizard"],
  shatter: ["wizard", "bard"],
  web: ["wizard"],
  "lightning-bolt": ["wizard", "sorcerer"],
  grease: ["wizard"],
  haste: ["wizard", "sorcerer"],
  fly: ["sorcerer", "warlock", "wizard"],
  "dispel-magic": ["artificer", "bard", "cleric", "druid", "paladin", "sorcerer", "warlock", "wizard"],
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
  "dancing-lights": ["bard", "sorcerer", "wizard"],
  druidcraft: ["druid"],
  "acid-splash": ["artificer", "sorcerer", "wizard"],
  "booming-blade": ["artificer", "sorcerer", "warlock", "wizard"],
  frostbite: ["artificer", "druid", "sorcerer", "warlock", "wizard"],
  "green-flame-blade": ["artificer", "sorcerer", "warlock", "wizard"],
  light: ["bard", "cleric", "sorcerer", "wizard"],
  "poison-spray": ["artificer", "druid", "sorcerer", "warlock", "wizard"],
  "primal-savagery": ["druid"],
  "ray-of-frost": ["artificer", "sorcerer", "wizard"],
  resistance: ["artificer", "cleric", "druid"],
  shillelagh: ["druid"],
  "shocking-grasp": ["artificer", "sorcerer", "wizard"],
  "toll-the-dead": ["cleric", "warlock", "wizard"],
  "true-strike": ["bard", "sorcerer", "warlock", "wizard"],
  catapult: ["sorcerer", "wizard"],
  "chaos-bolt": ["sorcerer"],
  "color-spray": ["sorcerer", "wizard"],
  command: ["cleric", "paladin"],
  "earth-tremor": ["bard", "druid", "sorcerer", "wizard"],
  "expeditious-retreat": ["sorcerer", "warlock", "wizard"],
  "false-life": ["sorcerer", "wizard"],
  "find-familiar": ["wizard"],
  "ice-knife": ["druid", "wizard"],
  sanctuary: ["cleric"],
  "searing-smite": ["paladin"],
  "zephyr-strike": ["ranger"],
  "acid-arrow": ["wizard"],
  "aganazzars-scorcher": ["sorcerer", "wizard"],
  "alter-self": ["sorcerer", "wizard"],
  "blindness-deafness": ["bard", "cleric", "sorcerer", "wizard"],
  blur: ["sorcerer", "wizard"],
  "calm-emotions": ["bard", "cleric"],
  "cloud-of-daggers": ["bard", "warlock", "wizard"],
  "crown-of-madness": ["bard", "warlock", "wizard"],
  "dust-devil": ["druid"],
  earthbind: ["druid", "sorcerer", "warlock", "wizard"],
  "enhance-ability": ["bard", "cleric", "druid", "sorcerer"],
  "enlarge-reduce": ["sorcerer", "wizard"],
  "find-steed": ["paladin"],
  "flame-blade": ["druid"],
  "flaming-sphere": ["druid", "wizard"],
  "gust-of-wind": ["druid", "sorcerer", "wizard"],
  "magic-weapon": ["paladin", "wizard"],
  "maximilians-earthen-grasp": ["sorcerer", "wizard"],
  "phantasmal-force": ["bard"],
  "prayer-of-healing": ["cleric"],
  "gentle-repose": ["cleric", "wizard"],
  "lesser-restoration": ["bard", "cleric", "druid", "paladin", "ranger"],
  "protection-from-poison": ["cleric", "druid", "paladin", "ranger"],
  "ray-of-enfeeblement": ["warlock", "wizard"],
  "shadow-blade": ["sorcerer", "warlock", "wizard"],
  "snillocs-snowball-swarm": ["sorcerer", "wizard"],
  "warding-bond": ["cleric"],
  "warding-wind": ["bard", "druid", "sorcerer", "wizard"],
  "animate-dead": ["cleric", "wizard"],
  "conjure-animals": ["druid", "ranger"],
  "aura-of-vitality": ["paladin"],
  "beacon-of-hope": ["cleric"],
  "bestow-curse": ["bard", "cleric", "wizard"],
  "blinding-smite": ["paladin"],
  blink: ["sorcerer", "wizard"],
  "conjure-barrage": ["ranger"],
  "crusaders-mantle": ["paladin"],
  "elemental-weapon": ["paladin"],
  "enemies-abound": ["bard", "warlock", "wizard"],
  "erupting-earth": ["druid", "sorcerer", "wizard"],
  fear: ["bard", "sorcerer", "warlock", "wizard"],
  "flame-arrows": ["druid", "ranger", "sorcerer", "wizard"],
  "gaseous-form": ["sorcerer", "warlock", "wizard"],
  "lightning-arrow": ["ranger"],
  "melfs-minute-meteors": ["sorcerer", "wizard"],
  "plant-growth": ["bard", "druid", "ranger"],
  "protection-from-energy": ["cleric", "druid", "ranger", "sorcerer", "wizard"],
  "sleet-storm": ["druid", "sorcerer", "wizard"],
  slow: ["sorcerer", "wizard"],
  "stinking-cloud": ["bard", "sorcerer", "wizard"],
  "thunder-step": ["sorcerer", "warlock", "wizard"],
  "tidal-wave": ["druid", "sorcerer", "wizard"],
  "wall-of-sand": ["wizard"],
  "wall-of-water": ["druid", "sorcerer", "wizard"],
  daylight: ["cleric", "druid", "paladin", "ranger", "sorcerer"],
  "wind-wall": ["druid", "ranger"],
  "aura-of-life": ["paladin"],
  "aura-of-purity": ["paladin"],
  banishment: ["cleric", "paladin", "sorcerer", "warlock", "wizard"],
  "black-tentacles": ["wizard"],
  blight: ["druid", "sorcerer", "warlock", "wizard"],
  "charm-monster": ["bard", "druid", "sorcerer", "warlock", "wizard"],
  "conjure-minor-elementals": ["druid", "wizard"],
  "conjure-woodland-beings": ["druid", "ranger"],
  compulsion: ["bard"],
  confusion: ["bard", "druid", "sorcerer", "wizard"],
  "death-ward": ["cleric", "paladin"],
  "dimension-door": ["bard", "sorcerer", "warlock", "wizard"],
  "dominate-beast": ["druid", "sorcerer"],
  "elemental-bane": ["druid", "warlock", "wizard"],
  "faithful-hound": ["wizard"],
  "fire-shield": ["wizard"],
  "freedom-of-movement": ["bard", "cleric", "druid", "ranger"],
  "grasping-vine": ["druid", "ranger"],
  "greater-invisibility": ["bard", "sorcerer", "wizard"],
  "guardian-of-faith": ["cleric"],
  "guardian-of-nature": ["druid", "ranger"],
  "ice-storm": ["druid", "sorcerer", "wizard"],
  "phantasmal-killer": ["wizard"],
  "resilient-sphere": ["wizard"],
  "shadow-of-moil": ["warlock"],
  "sickening-radiance": ["sorcerer", "warlock", "wizard"],
  "staggering-smite": ["paladin"],
  stoneskin: ["druid", "ranger", "sorcerer", "wizard"],
  "storm-sphere": ["sorcerer", "wizard"],
  "vitriolic-sphere": ["sorcerer", "wizard"],
  "wall-of-fire": ["druid", "sorcerer", "wizard"],
  "watery-sphere": ["druid", "sorcerer", "wizard"],
  "antilife-shell": ["druid"],
  "banishing-smite": ["paladin"],
  "circle-of-power": ["paladin"],
  "animate-objects": ["bard", "sorcerer", "wizard"],
  "arcane-hand": ["wizard"],
  cloudkill: ["sorcerer", "warlock", "wizard"],
  "cone-of-cold": ["sorcerer", "wizard"],
  "conjure-elemental": ["druid", "wizard"],
  "conjure-volley": ["ranger"],
  contagion: ["cleric", "druid"],
  dawn: ["cleric", "wizard"],
  "destructive-wave": ["paladin"],
  "dispel-evil-and-good": ["cleric", "paladin"],
  "dominate-person": ["bard", "sorcerer", "wizard"],
  enervation: ["sorcerer", "warlock", "wizard"],
  "far-step": ["sorcerer", "warlock", "wizard"],
  "flame-strike": ["cleric"],
  "hold-monster": ["bard", "sorcerer", "warlock", "wizard"],
  immolation: ["sorcerer", "wizard"],
  "insect-plague": ["cleric", "druid", "sorcerer"],
  maelstrom: ["druid"],
  "mass-cure-wounds": ["bard", "cleric", "druid"],
  "greater-restoration": ["bard", "cleric", "druid"],
  "negative-energy-flood": ["warlock", "wizard"],
  "raise-dead": ["bard", "cleric", "paladin"],
  revivify: ["cleric", "paladin"],
  "skill-empowerment": ["bard", "sorcerer", "wizard"],
  "steel-wind-strike": ["ranger", "wizard"],
  "swift-quiver": ["ranger"],
  "synaptic-static": ["bard", "sorcerer", "warlock", "wizard"],
  telekinesis: ["sorcerer", "wizard"],
  "transmute-rock": ["druid", "wizard"],
  "wrath-of-nature": ["druid", "ranger"],
  "blade-barrier": ["cleric"],
  "chain-lightning": ["sorcerer", "wizard"],
  "circle-of-death": ["sorcerer", "warlock", "wizard"],
  disintegrate: ["sorcerer", "wizard"],
  eyebite: ["bard", "sorcerer", "warlock", "wizard"],
  "flesh-to-stone": ["warlock", "wizard"],
  forbiddance: ["cleric"],
  "freezing-sphere": ["wizard"],
  "globe-of-invulnerability": ["sorcerer", "wizard"],
  harm: ["cleric"],
  heal: ["cleric", "druid"],
  "heroes-feast": ["cleric", "druid"],
  "investiture-of-flame": ["sorcerer", "wizard"],
  "investiture-of-ice": ["sorcerer", "wizard"],
  "investiture-of-stone": ["sorcerer", "wizard"],
  "investiture-of-wind": ["sorcerer", "wizard"],
  "irresistible-dance": ["bard", "wizard"],
  "mental-prison": ["wizard"],
  "primordial-ward": ["druid"],
  sunbeam: ["druid", "sorcerer", "wizard"],
  "true-seeing": ["bard", "cleric", "sorcerer", "warlock", "wizard"],
  "wall-of-ice": ["wizard"],
  "wall-of-thorns": ["druid"],
  "arcane-sword": ["bard", "wizard"],
  "crown-of-stars": ["sorcerer", "warlock", "wizard"],
  "delayed-blast-fireball": ["sorcerer", "wizard"],
  "divine-word": ["cleric"],
  etherealness: ["bard", "cleric", "sorcerer", "warlock", "wizard"],
  "finger-of-death": ["sorcerer", "warlock", "wizard"],
  "fire-storm": ["cleric", "druid", "sorcerer"],
  forcecage: ["bard", "warlock", "wizard"],
  "power-word-pain": ["warlock", "wizard"],
  "prismatic-spray": ["sorcerer", "wizard"],
  regenerate: ["bard", "cleric", "druid"],
  resurrection: ["bard", "cleric"],
  "reverse-gravity": ["druid", "sorcerer", "wizard"],
  symbol: ["bard", "cleric", "wizard"],
  whirlwind: ["druid", "sorcerer", "wizard"],
  "horrid-wilting": ["sorcerer", "warlock", "wizard"],
  "antimagic-field": ["cleric", "wizard"],
  "dominate-monster": ["bard", "sorcerer", "warlock", "wizard"],
  earthquake: ["cleric", "druid", "sorcerer"],
  feeblemind: ["bard", "druid", "warlock", "wizard"],
  "holy-aura": ["cleric"],
  "incendiary-cloud": ["sorcerer", "wizard"],
  "maddening-darkness": ["warlock", "wizard"],
  maze: ["wizard"],
  "mind-blank": ["bard", "wizard"],
  "power-word-stun": ["bard", "sorcerer", "warlock", "wizard"],
  sunburst: ["druid", "sorcerer", "wizard"],
  tsunami: ["druid"],
  foresight: ["bard", "druid", "warlock", "wizard"],
  "mass-heal": ["cleric"],
  "meteor-swarm": ["sorcerer", "wizard"],
  "power-word-heal": ["bard"],
  "power-word-kill": ["bard", "sorcerer", "warlock", "wizard"],
  "prismatic-wall": ["wizard"],
  "psychic-scream": ["bard", "sorcerer", "warlock", "wizard"],
  "storm-of-vengeance": ["druid"],
  simulacrum: ["wizard"],
  "true-resurrection": ["cleric", "druid"],
  weird: ["wizard"],
};

function minCharacterLevel(spellLevel, casterType = "full") {
  if (casterType === "half") return spellLevel <= 1 ? 2 : spellLevel === 2 ? 5 : spellLevel === 3 ? 9 : spellLevel === 4 ? 13 : spellLevel === 5 ? 17 : 99;
  return spellLevel <= 1 ? 1 : spellLevel === 2 ? 3 : spellLevel === 3 ? 5 : spellLevel === 4 ? 7 : spellLevel === 5 ? 9 : spellLevel === 6 ? 11 : spellLevel === 7 ? 13 : spellLevel === 8 ? 15 : 17;
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
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
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
  effect: { kind: "damage", dice: { count: 2, sides: 8 }, type: "thunder", forcedMovement: { mode: "push", distanceFeet: 10, on: "failedSave" } },
  upcast: { dicePerLevel: 1 },
  aiCategory: "control-cluster",
  description: "Short cone for 2d8 thunder, CON save half. Failed saves are pushed 10 ft. Upcast: +1d8.",
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
  effect: { kind: "status", status: { id: "invisible", label: "Invisible", stealthAdvantage: true, attackAdvantage: true, ignoredByMonsters: true, durationRounds: 3 } },
  upcast: { targetsPerLevel: 1 },
  aiCategory: "escape-mobility",
  description: "Concentration, 3 rounds. Ally gains advantage on Stealth checks and monsters ignore them while choosing targets.",
});

spell("see-invisibility", {
  name: "See Invisibility",
  level: 2,
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  duration: { kind: "hours", hours: 1 },
  effect: { kind: "status", status: { id: "see-invisibility", label: "See Invisibility", senses: { seeInvisible: true }, skillBonus: 2, durationHours: 1 } },
  aiCategory: "buff-opener",
  description: "One-hour sight magic. The caster can perceive invisible creatures and gains a modest sight-based check bonus.",
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

spell("dispel-magic", {
  name: "Dispel Magic",
  level: 3,
  school: "abjuration",
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  effect: { kind: "status", status: { id: "dispel-magic-focus", label: "Dispel Magic", expiresAtEndOfTurn: true } },
  aiCategory: "utility",
  description: "End a magical effect. Outside combat, detected magical traps can be suppressed directly from their trap panel.",
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

spell("catapult", {
  name: "Catapult",
  level: 1,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  save: { ability: "dex", halfDamage: true },
  effect: { kind: "damage", dice: { count: 3, sides: 8 }, type: "bludgeoning" },
  upcast: { dicePerLevel: 1 },
  aiCategory: "finish-target",
  description: "Hurl loose debris at a target for 3d8 bludgeoning, DEX save half. Upcast: +1d8.",
});

spell("chaos-bolt", {
  name: "Chaos Bolt",
  level: 1,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "enemy",
  effect: { kind: "attackDamage", dice: { count: 2, sides: 8, bonus: 3 }, type: "force", status: { id: "chaos-spark", label: "Chaos Spark", attackBonus: -1, expiresAtEndOfTurn: true } },
  upcast: { dicePerLevel: 1 },
  aiCategory: "finish-target",
  description: "Ranged chaotic spell attack for 2d8 + 3 force and brief disruption. Upcast: +1d8.",
});

spell("color-spray", {
  name: "Color Spray",
  level: 1,
  resource: action,
  range: { kind: "self", feet: 15 },
  target: "direction",
  area: { shape: "cone", lengthFeet: 15 },
  save: { ability: "con", negatesStatus: true },
  effect: { kind: "status", status: { id: "blinded", label: "Blinded", attackBonus: -3, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "Short cone. CON save or Blinded and much less accurate for 1 round.",
});

spell("command", {
  name: "Command",
  level: 1,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  save: { ability: "wis", negatesStatus: true },
  effect: { kind: "status", status: { id: "commanded", label: "Commanded", actionLocked: true, expiresAtEndOfTurn: true } },
  upcast: { targetsPerLevel: 1 },
  aiCategory: "control-cluster",
  description: "WIS save or the target loses its next action. Upcast: +1 target.",
});

spell("earth-tremor", {
  name: "Earth Tremor",
  level: 1,
  resource: action,
  range: { kind: "self", feet: 10 },
  target: "point",
  area: { shape: "circle", radiusFeet: 10 },
  save: { ability: "dex", halfDamage: true },
  effect: { kind: "damage", dice: { count: 1, sides: 6 }, type: "bludgeoning", status: { id: "prone", label: "Prone", speedBonusFeet: -15, expiresAtEndOfTurn: true } },
  upcast: { dicePerLevel: 1 },
  aiCategory: "control-cluster",
  description: "Nearby ground shock for 1d6 bludgeoning, DEX save half; failed save also Prone/Slowed. Upcast: +1d6.",
});

spell("expeditious-retreat", {
  name: "Expeditious Retreat",
  level: 1,
  resource: quick,
  range: { kind: "self", feet: 0 },
  target: "self",
  ...concentration3,
  effect: { kind: "status", status: { id: "expeditious-retreat", label: "Expeditious Retreat", speedBonusFeet: 30, durationRounds: 3 } },
  aiCategory: "escape-mobility",
  description: "Concentration, 3 rounds. Quick mobility burst: gain +30 ft speed.",
});

spell("false-life", {
  name: "False Life",
  level: 1,
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  duration: { kind: "hours", hours: 1 },
  effect: { kind: "status", status: { id: "false-life", label: "False Life", tempHp: 7 } },
  upcast: { tempHpPerLevel: 5 },
  aiCategory: "defensive-reaction",
  description: "One-hour necromantic buffer. Gain 7 temporary HP. Upcast: +5 temporary HP.",
});

spell("ice-knife", {
  name: "Ice Knife",
  level: 1,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "point",
  area: { shape: "circle", radiusFeet: 5 },
  save: { ability: "dex", halfDamage: true },
  effect: { kind: "damage", dice: { count: 2, sides: 6 }, type: "cold", status: { id: "ice-shards", label: "Ice Shards", speedBonusFeet: -10, expiresAtEndOfTurn: true } },
  upcast: { dicePerLevel: 1 },
  aiCategory: "aoe-damage",
  description: "Small ice burst for 2d6 cold, DEX save half; failed save briefly slows. Upcast: +1d6.",
});

spell("sanctuary", {
  name: "Sanctuary",
  level: 1,
  resource: quick,
  range: { kind: "ranged", feet: 30 },
  target: "ally",
  duration: { kind: "rounds", rounds: 3 },
  effect: { kind: "status", status: { id: "sanctuary", label: "Sanctuary", acBonus: 2, ignoredByMonsters: true, durationRounds: 3 } },
  aiCategory: "defensive-reaction",
  description: "Quick ward for 3 rounds. Ally gains +2 AC and is deprioritized by monsters.",
});

spell("searing-smite", {
  name: "Searing Smite",
  level: 1,
  resource: weaponRider,
  range: { kind: "self", feet: 0 },
  target: "self",
  effect: { kind: "status", status: { id: "searing-smite", label: "Searing Smite", damageBonus: 4, damageType: "fire", expiresAtEndOfTurn: true } },
  upcast: { damageBonusPerLevel: 4 },
  aiCategory: "finish-target",
  description: "Weapon rider. Next hit adds fire damage and briefly scorches the target.",
});

spell("zephyr-strike", {
  name: "Zephyr Strike",
  level: 1,
  resource: weaponRider,
  range: { kind: "self", feet: 0 },
  target: "self",
  effect: { kind: "status", status: { id: "zephyr-strike", label: "Zephyr Strike", weaponRider: true, damageBonus: 4, damageType: "force", attackAdvantage: true, speedBonusFeet: 20, expiresAtEndOfTurn: true } },
  upcast: { damageBonusPerLevel: 4 },
  aiCategory: "finish-target",
  description: "Weapon rider. Swift movement and advantage; next hit adds force damage.",
});

spell("acid-arrow", {
  name: "Acid Arrow",
  level: 2,
  resource: action,
  range: { kind: "ranged", feet: 90 },
  target: "enemy",
  effect: { kind: "attackDamage", dice: { count: 4, sides: 4 }, type: "acid", status: { id: "acid-burn", label: "Acid Burn", acBonus: -1, durationRounds: 1 } },
  upcast: { dicePerLevel: 1 },
  aiCategory: "finish-target",
  description: "Ranged acid spell attack for 4d4 acid and a brief armor-melting burn. Upcast: +1d4.",
});

spell("aganazzars-scorcher", {
  name: "Aganazzar's Scorcher",
  level: 2,
  resource: action,
  range: { kind: "self", feet: 30 },
  target: "direction",
  area: { shape: "line", lengthFeet: 30, widthFeet: 5 },
  save: { ability: "dex", halfDamage: true },
  effect: { kind: "damage", dice: { count: 3, sides: 8 }, type: "fire" },
  upcast: { dicePerLevel: 1 },
  aiCategory: "aoe-damage",
  description: "Line of fire for 3d8 fire, DEX save half. Upcast: +1d8.",
});

spell("alter-self", {
  name: "Alter Self",
  level: 2,
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  concentration: true,
  duration: { kind: "minutes", minutes: 10 },
  effect: { kind: "status", status: { id: "alter-self", label: "Alter Self", acBonus: 1, damageBonus: 2, skillBonus: 2, durationMinutes: 10 } },
  aiCategory: "buff-opener",
  description: "Adaptive body for 10 minutes: small defense, damage, and exploration bonuses.",
});

spell("blindness-deafness", {
  name: "Blindness/Deafness",
  level: 2,
  resource: action,
  range: { kind: "ranged", feet: 30 },
  target: "enemy",
  save: { ability: "con", negatesStatus: true },
  effect: { kind: "status", status: { id: "blinded", label: "Blinded", attackBonus: -3, durationRounds: 2 } },
  upcast: { targetsPerLevel: 1 },
  aiCategory: "control-cluster",
  description: "CON save or Blinded for 2 rounds. Deafness is ignored in the crawler model. Upcast: +1 target.",
});

spell("blur", {
  name: "Blur",
  level: 2,
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  ...concentration3,
  effect: { kind: "status", status: { id: "blur", label: "Blur", acBonus: 3, durationRounds: 3 } },
  aiCategory: "defensive-reaction",
  description: "Concentration, 3 rounds. Distortion grants +3 AC.",
});

spell("calm-emotions", {
  name: "Calm Emotions",
  level: 2,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "point",
  area: { shape: "circle", radiusFeet: 10 },
  save: { ability: "cha", negatesStatus: true },
  ...concentration3,
  effect: { kind: "status", status: { id: "calmed", label: "Calmed", attackBonus: -2, durationRounds: 3 } },
  aiCategory: "control-cluster",
  description: "Calming burst. CHA save or enemies lose aggression and suffer -2 attacks for 3 rounds.",
});

spell("cloud-of-daggers", {
  name: "Cloud of Daggers",
  level: 2,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "point",
  area: { shape: "circle", radiusFeet: 5 },
  ...concentration3,
  effect: { kind: "damage", dice: { count: 4, sides: 4 }, type: "slashing" },
  upcast: { dicePerLevel: 2 },
  aiCategory: "control-cluster",
  description: "Small persistent dagger zone for 4d4 slashing. Upcast: +2d4.",
});

spell("crown-of-madness", {
  name: "Crown of Madness",
  level: 2,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "enemy",
  save: { ability: "wis", negatesStatus: true },
  ...concentration3,
  effect: { kind: "status", status: { id: "crown-of-madness", label: "Madness", actionLocked: true, attackBonus: -1, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "WIS save or madness steals the target's next action. Bosses receive a weaker effect.",
});

spell("dust-devil", {
  name: "Dust Devil",
  level: 2,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "point",
  area: { shape: "circle", radiusFeet: 5 },
  save: { ability: "str", halfDamage: true },
  ...concentration3,
  effect: { kind: "damage", dice: { count: 1, sides: 8 }, type: "bludgeoning", status: { id: "dust-blinded", label: "Dust-Blinded", attackBonus: -2, expiresAtEndOfTurn: true } },
  upcast: { dicePerLevel: 1 },
  aiCategory: "control-cluster",
  description: "Small persistent dust vortex for 1d8 bludgeoning and brief attack penalty. Upcast: +1d8.",
});

spell("earthbind", {
  name: "Earthbind",
  level: 2,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "enemy",
  save: { ability: "str", negatesStatus: true },
  ...concentration3,
  effect: { kind: "status", status: { id: "earthbound", label: "Earthbound", speedBonusFeet: -20, attackBonus: -1, durationRounds: 3 } },
  aiCategory: "control-cluster",
  description: "STR save or target is dragged toward the ground, losing speed and accuracy for 3 rounds.",
});

spell("enhance-ability", {
  name: "Enhance Ability",
  level: 2,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "ally",
  concentration: true,
  duration: { kind: "hours", hours: 1 },
  effect: { kind: "status", status: { id: "enhance-ability", label: "Enhanced", skillBonus: 4, tempHp: 4, durationHours: 1 } },
  upcast: { targetsPerLevel: 1 },
  aiCategory: "buff-opener",
  description: "One-hour ability boost. Ally gains +4 skill checks and a small temporary HP buffer. Upcast: +1 target.",
});

spell("enlarge-reduce", {
  name: "Enlarge/Reduce",
  level: 2,
  resource: action,
  range: { kind: "ranged", feet: 30 },
  target: "ally",
  ...concentration3,
  effect: { kind: "status", status: { id: "enlarged", label: "Enlarged", damageBonus: 4, tempHp: 6, durationRounds: 3 } },
  aiCategory: "buff-opener",
  description: "Simplified to Enlarge mode: ally gains damage and temporary HP for 3 rounds.",
});

spell("flame-blade", {
  name: "Flame Blade",
  level: 2,
  resource: quick,
  range: { kind: "self", feet: 0 },
  target: "self",
  ...concentration3,
  effect: { kind: "status", status: { id: "flame-blade", label: "Flame Blade", damageBonus: 5, durationRounds: 3 } },
  aiCategory: "finish-target",
  description: "Concentration, 3 rounds. Your weapon pressure gains fire damage.",
});

spell("flaming-sphere", {
  name: "Flaming Sphere",
  level: 2,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "point",
  area: { shape: "circle", radiusFeet: 5 },
  save: { ability: "dex", halfDamage: true },
  ...concentration3,
  effect: { kind: "damage", dice: { count: 2, sides: 6 }, type: "fire" },
  upcast: { dicePerLevel: 1 },
  aiCategory: "control-cluster",
  description: "Small persistent fire zone for 2d6 fire, DEX save half. Upcast: +1d6.",
});

spell("gust-of-wind", {
  name: "Gust of Wind",
  level: 2,
  resource: action,
  range: { kind: "self", feet: 30 },
  target: "direction",
  area: { shape: "line", lengthFeet: 30, widthFeet: 5 },
  save: { ability: "str", halfDamage: true },
  ...concentration3,
  effect: {
    kind: "damage",
    dice: { count: 2, sides: 6 },
    type: "bludgeoning",
    status: { id: "wind-battered", label: "Wind-Battered", speedBonusFeet: -10, expiresAtEndOfTurn: true },
    forcedMovement: { mode: "push", direction: "spell", distanceFeet: 15, on: "failedSave" },
  },
  aiCategory: "control-cluster",
  description: "Line of forceful wind for 2d6 bludgeoning, STR save half. Failed saves are pushed 15 ft with the wind and slowed.",
});

spell("magic-weapon", {
  name: "Magic Weapon",
  level: 2,
  resource: quick,
  range: { kind: "touch", feet: 5 },
  target: "ally",
  concentration: true,
  duration: { kind: "hours", hours: 1 },
  effect: { kind: "status", status: { id: "magic-weapon", label: "Magic Weapon", attackBonus: 1, damageBonus: 2, durationHours: 1 } },
  aiCategory: "buff-opener",
  description: "One-hour weapon enchantment. Ally gains +1 attacks and +2 weapon damage.",
});

spell("maximilians-earthen-grasp", {
  name: "Maximilian's Earthen Grasp",
  level: 2,
  resource: action,
  range: { kind: "ranged", feet: 30 },
  target: "enemy",
  save: { ability: "str", halfDamage: true },
  ...concentration3,
  effect: { kind: "damage", dice: { count: 2, sides: 6 }, type: "bludgeoning", status: { id: "earthen-grasp", label: "Restrained", speedLocked: true, attackBonus: -2, durationRounds: 1 } },
  aiCategory: "control-cluster",
  description: "Earthen hand crushes one target for 2d6 bludgeoning, STR save half; failed save restrains briefly.",
});

spell("phantasmal-force", {
  name: "Phantasmal Force",
  level: 2,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  save: { ability: "int", halfDamage: true },
  ...concentration3,
  effect: { kind: "damage", dice: { count: 2, sides: 6 }, type: "psychic", status: { id: "phantasmal-force", label: "Distracted", attackBonus: -2, durationRounds: 1 } },
  aiCategory: "control-cluster",
  description: "INT save. Psychic damage and a brief attack penalty on failed save.",
});

spell("prayer-of-healing", {
  name: "Prayer of Healing",
  level: 2,
  resource: action,
  range: { kind: "ranged", feet: 30 },
  target: "ally",
  area: { shape: "circle", radiusFeet: 30 },
  effect: { kind: "healing", dice: { count: 2, sides: 8 }, abilityBonus: "spellcasting" },
  upcast: { dicePerLevel: 1 },
  aiCategory: "efficient-heal",
  description: "Area prayer restores 2d8 + spell stat HP to nearby allies. Upcast: +1d8.",
});

spell("gentle-repose", {
  name: "Gentle Repose",
  level: 2,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "corpse",
  duration: { kind: "days", days: 10 },
  effect: { kind: "preserveCorpse", durationSeconds: 10 * 24 * 60 * 60 },
  aiCategory: "utility",
  description: "Preserve a dead companion's body for 10 days, stopping decomposition and keeping revival windows open.",
});

spell("lesser-restoration", {
  name: "Lesser Restoration",
  level: 2,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "ally",
  effect: { kind: "restoration", removeAll: false },
  aiCategory: "cleanse",
  description: "Remove one harmful status effect or condition from an adjacent ally.",
});

spell("protection-from-poison", {
  name: "Protection from Poison",
  level: 2,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "ally",
  duration: { kind: "hours", hours: 1 },
  effect: { kind: "status", status: { id: "protection-from-poison", label: "Poison Ward", resistances: ["poison"], saveBonus: 2, durationHours: 1 } },
  aiCategory: "defensive-reaction",
  description: "One-hour ward. Ally resists poison and gains +2 saves.",
});

spell("ray-of-enfeeblement", {
  name: "Ray of Enfeeblement",
  level: 2,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  effect: { kind: "attackDamage", dice: { count: 2, sides: 8 }, type: "necrotic", status: { id: "enfeebled", label: "Enfeebled", damageBonus: -4, durationRounds: 2 } },
  aiCategory: "control-cluster",
  description: "Ranged necrotic spell attack for 2d8 and reduced weapon damage.",
});

spell("shadow-blade", {
  name: "Shadow Blade",
  level: 2,
  resource: quick,
  range: { kind: "self", feet: 0 },
  target: "self",
  ...concentration3,
  effect: { kind: "status", status: { id: "shadow-blade", label: "Shadow Blade", damageBonus: 7, attackAdvantage: true, durationRounds: 3 } },
  aiCategory: "finish-target",
  description: "Concentration, 3 rounds. Psychic blade pressure: advantage and bonus damage.",
});

spell("snillocs-snowball-swarm", {
  name: "Snilloc's Snowball Swarm",
  level: 2,
  resource: action,
  range: { kind: "ranged", feet: 90 },
  target: "point",
  area: { shape: "circle", radiusFeet: 5 },
  save: { ability: "dex", halfDamage: true },
  effect: { kind: "damage", dice: { count: 3, sides: 6 }, type: "cold", status: { id: "snow-chilled", label: "Chilled", speedBonusFeet: -10, expiresAtEndOfTurn: true } },
  upcast: { dicePerLevel: 1 },
  aiCategory: "aoe-damage",
  description: "Small cold burst for 3d6 cold, DEX save half; failed save briefly slows. Upcast: +1d6.",
});

spell("warding-bond", {
  name: "Warding Bond",
  level: 2,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "ally",
  duration: { kind: "hours", hours: 1 },
  effect: { kind: "status", status: { id: "warding-bond", label: "Warding Bond", acBonus: 1, saveBonus: 1, resistances: ["bludgeoning", "piercing", "slashing"], durationHours: 1 } },
  aiCategory: "defensive-reaction",
  description: "One-hour protective bond. Ally gains +1 AC/saves and physical resistance in the slim model.",
});

spell("warding-wind", {
  name: "Warding Wind",
  level: 2,
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  ...concentration3,
  effect: { kind: "status", status: { id: "warding-wind", label: "Warding Wind", acBonus: 2, speedBonusFeet: 10, durationRounds: 3 } },
  aiCategory: "defensive-reaction",
  description: "Concentration, 3 rounds. Buffeting wind improves defense and movement.",
});

spell("aura-of-vitality", {
  name: "Aura of Vitality",
  level: 3,
  resource: quick,
  range: { kind: "ranged", feet: 30 },
  target: "ally",
  area: { shape: "circle", radiusFeet: 15 },
  effect: { kind: "healing", dice: { count: 2, sides: 6 }, abilityBonus: "spellcasting" },
  aiCategory: "efficient-heal",
  description: "Simplified healing aura: nearby allies recover 2d6 + spell stat HP.",
});

spell("beacon-of-hope", {
  name: "Beacon of Hope",
  level: 3,
  resource: action,
  range: { kind: "ranged", feet: 30 },
  target: "ally",
  area: { shape: "circle", radiusFeet: 30 },
  ...concentration3,
  effect: { kind: "status", status: { id: "beacon-of-hope", label: "Beacon of Hope", saveBonus: 2, tempHp: 8, durationRounds: 3 } },
  aiCategory: "buff-opener",
  description: "Concentration, 3 rounds. Nearby allies gain save support and temporary HP.",
});

spell("revivify", {
  name: "Revivify",
  level: 3,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "corpse",
  effect: { kind: "revive", hp: 1 },
  aiCategory: "revive",
  description: "Restore a companion who died within the last minute, or whose body is held fresh by Gentle Repose, to 1 HP.",
});

spell("bestow-curse", {
  name: "Bestow Curse",
  level: 3,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "enemy",
  save: { ability: "wis", negatesStatus: true },
  ...concentration3,
  effect: { kind: "status", status: { id: "bestow-curse", label: "Cursed", attackBonus: -2, saveBonus: -2, durationRounds: 3 } },
  aiCategory: "control-cluster",
  description: "WIS save or cursed for 3 rounds, weakening attacks and saves.",
});

spell("blinding-smite", {
  name: "Blinding Smite",
  level: 3,
  resource: weaponRider,
  range: { kind: "self", feet: 0 },
  target: "self",
  effect: { kind: "status", status: { id: "blinding-smite", label: "Blinding Smite", damageBonus: 13, damageType: "radiant", riderStatus: "blinded", expiresAtEndOfTurn: true } },
  aiCategory: "finish-target",
  description: "Weapon rider. Next hit adds radiant damage and blinds the target briefly.",
});

spell("blink", {
  name: "Blink",
  level: 3,
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  duration: { kind: "rounds", rounds: 3 },
  effect: { kind: "status", status: { id: "blink", label: "Blink", acBonus: 3, ignoredByMonsters: true, durationRounds: 3 } },
  aiCategory: "escape-mobility",
  description: "Phase in and out for 3 rounds: harder to hit and deprioritized by monsters.",
});

spell("conjure-barrage", {
  name: "Conjure Barrage",
  level: 3,
  resource: action,
  range: { kind: "self", feet: 60 },
  target: "direction",
  area: { shape: "cone", lengthFeet: 60 },
  save: { ability: "dex", halfDamage: true },
  effect: { kind: "damage", dice: { count: 3, sides: 8 }, type: "piercing" },
  aiCategory: "aoe-damage",
  description: "Large weapon volley cone for 3d8 piercing, DEX save half.",
});

spell("crusaders-mantle", {
  name: "Crusader's Mantle",
  level: 3,
  resource: quick,
  range: { kind: "self", feet: 0 },
  target: "self",
  ...concentration3,
  effect: { kind: "status", status: { id: "crusaders-mantle", label: "Crusader's Mantle", damageBonus: 4, durationRounds: 3 } },
  aiCategory: "buff-opener",
  description: "Concentration, 3 rounds. Your weapon attacks gain radiant pressure.",
});

spell("elemental-weapon", {
  name: "Elemental Weapon",
  level: 3,
  resource: quick,
  range: { kind: "touch", feet: 5 },
  target: "ally",
  concentration: true,
  duration: { kind: "hours", hours: 1 },
  effect: { kind: "status", status: { id: "elemental-weapon", label: "Elemental Weapon", attackBonus: 1, damageBonus: 4, durationHours: 1 } },
  aiCategory: "buff-opener",
  description: "One-hour weapon enchantment. Ally gains +1 attacks and +4 elemental damage.",
});

spell("enemies-abound", {
  name: "Enemies Abound",
  level: 3,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "enemy",
  save: { ability: "int", negatesStatus: true },
  ...concentration3,
  effect: { kind: "status", status: { id: "enemies-abound", label: "Confused", actionLocked: true, attackBonus: -2, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "INT save or confusion steals the target's next action. Bosses receive a weaker effect.",
});

spell("erupting-earth", {
  name: "Erupting Earth",
  level: 3,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "point",
  area: { shape: "circle", radiusFeet: 10 },
  save: { ability: "dex", halfDamage: true },
  effect: { kind: "damage", dice: { count: 3, sides: 12 }, type: "bludgeoning", status: { id: "broken-ground", label: "Broken Ground", speedBonusFeet: -10, expiresAtEndOfTurn: true } },
  upcast: { dicePerLevel: 1 },
  aiCategory: "aoe-damage",
  description: "Ground burst for 3d12 bludgeoning and a brief slow, DEX save half. Upcast: +1d12.",
});

spell("fear", {
  name: "Fear",
  level: 3,
  resource: action,
  range: { kind: "self", feet: 30 },
  target: "direction",
  area: { shape: "cone", lengthFeet: 30 },
  save: { ability: "wis", negatesStatus: true },
  ...concentration3,
  effect: { kind: "status", status: { id: "frightened", label: "Frightened", actionLocked: true, attackBonus: -2, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "Cone of terror. WIS save or enemies lose their next action; bosses receive a weaker effect.",
});

spell("flame-arrows", {
  name: "Flame Arrows",
  level: 3,
  resource: quick,
  range: { kind: "touch", feet: 5 },
  target: "ally",
  concentration: true,
  duration: { kind: "hours", hours: 1 },
  effect: { kind: "status", status: { id: "flame-arrows", label: "Flame Arrows", damageBonus: 4, durationHours: 1 } },
  aiCategory: "buff-opener",
  description: "One-hour ammunition enchantment. Ally gains bonus fire damage on weapon attacks.",
});

spell("gaseous-form", {
  name: "Gaseous Form",
  level: 3,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "ally",
  ...concentration3,
  effect: { kind: "status", status: { id: "gaseous-form", label: "Gaseous Form", flying: true, ignoredByMonsters: true, resistances: ["bludgeoning", "piercing", "slashing"], durationRounds: 3 } },
  aiCategory: "escape-mobility",
  description: "Concentration, 3 rounds. Ally becomes misty, flying, hard to target, and physically resistant.",
});

spell("lightning-arrow", {
  name: "Lightning Arrow",
  level: 3,
  resource: weaponRider,
  range: { kind: "self", feet: 0 },
  target: "self",
  effect: { kind: "status", status: { id: "lightning-arrow", label: "Lightning Arrow", damageBonus: 14, damageType: "lightning", expiresAtEndOfTurn: true } },
  upcast: { damageBonusPerLevel: 4 },
  aiCategory: "aoe-damage",
  description: "Weapon rider. Next ranged hit becomes a lightning burst.",
});

spell("melfs-minute-meteors", {
  name: "Melf's Minute Meteors",
  level: 3,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "point",
  area: { shape: "circle", radiusFeet: 5 },
  save: { ability: "dex", halfDamage: true },
  effect: { kind: "damage", dice: { count: 4, sides: 6 }, type: "fire" },
  aiCategory: "aoe-damage",
  description: "Simplified meteor burst for 4d6 fire in a small area, DEX save half.",
});

spell("plant-growth", {
  name: "Plant Growth",
  level: 3,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "point",
  area: { shape: "circle", radiusFeet: 20 },
  duration: { kind: "rounds", rounds: 3 },
  effect: { kind: "status", status: { id: "overgrown", label: "Overgrown", speedBonusFeet: -20, durationRounds: 3 } },
  aiCategory: "control-cluster",
  description: "Large overgrowth zone. Creatures inside are heavily slowed for 3 rounds.",
});

spell("protection-from-energy", {
  name: "Protection from Energy",
  level: 3,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "ally",
  concentration: true,
  duration: { kind: "hours", hours: 1 },
  effect: { kind: "status", status: { id: "protection-from-energy", label: "Energy Ward", resistances: ["acid", "cold", "fire", "lightning", "thunder"], durationHours: 1 } },
  aiCategory: "defensive-reaction",
  description: "One-hour elemental ward. Ally resists acid, cold, fire, lightning, and thunder in the slim model.",
});

spell("sleet-storm", {
  name: "Sleet Storm",
  level: 3,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "point",
  area: { shape: "circle", radiusFeet: 20 },
  save: { ability: "dex", negatesStatus: true },
  ...concentration3,
  effect: { kind: "status", status: { id: "sleet-storm", label: "Prone", speedBonusFeet: -20, attackBonus: -2, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "Persistent icy storm. DEX save or enemies are slowed and hindered.",
});

spell("slow", {
  name: "Slow",
  level: 3,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "point",
  area: { shape: "circle", radiusFeet: 20 },
  save: { ability: "wis", negatesStatus: true },
  ...concentration3,
  effect: { kind: "status", status: { id: "slowed", label: "Slowed", acBonus: -2, attackBonus: -2, speedBonusFeet: -20, durationRounds: 3 } },
  aiCategory: "control-cluster",
  description: "Area WIS save or enemies are slowed, easier to hit, and less accurate.",
});

spell("stinking-cloud", {
  name: "Stinking Cloud",
  level: 3,
  resource: action,
  range: { kind: "ranged", feet: 90 },
  target: "point",
  area: { shape: "circle", radiusFeet: 15 },
  save: { ability: "con", negatesStatus: true },
  ...concentration3,
  effect: { kind: "status", status: { id: "stinking-cloud", label: "Retching", actionLocked: true, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "Persistent poison cloud. CON save or targets lose their action; bosses receive a weaker effect.",
});

spell("thunder-step", {
  name: "Thunder Step",
  level: 3,
  resource: action,
  range: { kind: "self", feet: 90 },
  target: "point",
  effect: { kind: "teleport" },
  aiCategory: "escape-mobility",
  description: "Teleport to a visible empty square within 90 ft. The thunder burst is omitted until departure-area damage exists.",
});

spell("tidal-wave", {
  name: "Tidal Wave",
  level: 3,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "point",
  area: { shape: "circle", radiusFeet: 15 },
  save: { ability: "dex", halfDamage: true },
  effect: { kind: "damage", dice: { count: 4, sides: 8 }, type: "bludgeoning", status: { id: "prone", label: "Prone", speedBonusFeet: -15, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "Crashing wave for 4d8 bludgeoning, DEX save half; failed save briefly knocks targets down.",
});

spell("wall-of-sand", {
  name: "Wall of Sand",
  level: 3,
  resource: action,
  range: { kind: "self", feet: 30 },
  target: "direction",
  area: { shape: "line", lengthFeet: 30, widthFeet: 5, terrain: { shape: "line", lengthFeet: 30, widthFeet: 5, difficultTerrain: true, blocksLineOfSight: true } },
  ...concentration3,
  effect: { kind: "status", status: { id: "sand-blinded", label: "Sand-Blinded", attackBonus: -2, speedBonusFeet: -10, durationRounds: 3 } },
  aiCategory: "control-cluster",
  description: "Persistent line of sand. It blocks sight, counts as difficult terrain, and creatures in it are slowed and less accurate.",
});

spell("wall-of-water", {
  name: "Wall of Water",
  level: 3,
  resource: action,
  range: { kind: "self", feet: 30 },
  target: "direction",
  area: { shape: "line", lengthFeet: 30, widthFeet: 5, terrain: { shape: "line", lengthFeet: 30, widthFeet: 5, difficultTerrain: true } },
  ...concentration3,
  effect: { kind: "status", status: { id: "water-wall", label: "Water Wall", attackBonus: -1, speedBonusFeet: -10, resistances: ["fire"], durationRounds: 3 } },
  aiCategory: "control-cluster",
  description: "Persistent line of water. It counts as difficult terrain; creatures in it are slowed, dampened, and resist fire briefly.",
});

spell("wind-wall", {
  name: "Wind Wall",
  level: 3,
  resource: action,
  range: { kind: "self", feet: 50 },
  target: "direction",
  area: { shape: "line", lengthFeet: 50, widthFeet: 5, terrain: { shape: "line", lengthFeet: 50, widthFeet: 5, difficultTerrain: true, blocksLineOfSight: true } },
  save: { ability: "str", halfDamage: true },
  ...concentration3,
  effect: { kind: "damage", dice: { count: 3, sides: 8 }, type: "bludgeoning", status: { id: "wind-walled", label: "Wind-Walled", attackBonus: -2, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "Persistent line of roaring wind. It blocks sight, counts as difficult terrain, and deals 3d8 bludgeoning, STR save half.",
});

spell("aura-of-life", {
  name: "Aura of Life",
  level: 4,
  resource: action,
  range: { kind: "ranged", feet: 30 },
  target: "ally",
  area: { shape: "circle", radiusFeet: 15 },
  ...concentration3,
  effect: { kind: "status", status: { id: "aura-of-life", label: "Aura of Life", tempHp: 8, resistances: ["necrotic"], saveBonus: 2, durationRounds: 3 } },
  aiCategory: "buff-opener",
  description: "Concentration, 3 rounds. Nearby allies gain life-buffering temp HP, necrotic resistance, and save support.",
});

spell("aura-of-purity", {
  name: "Aura of Purity",
  level: 4,
  resource: action,
  range: { kind: "ranged", feet: 30 },
  target: "ally",
  area: { shape: "circle", radiusFeet: 15 },
  ...concentration3,
  effect: { kind: "status", status: { id: "aura-of-purity", label: "Aura of Purity", resistances: ["poison"], saveBonus: 3, durationRounds: 3 } },
  aiCategory: "buff-opener",
  description: "Concentration, 3 rounds. Nearby allies resist poison and gain strong saving throw support.",
});

spell("banishment", {
  name: "Banishment",
  level: 4,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  save: { ability: "cha", negatesStatus: true },
  ...concentration3,
  effect: { kind: "status", status: { id: "banished", label: "Banished", speedLocked: true, actionLocked: true, durationRounds: 3 } },
  upcast: { targetsPerLevel: 1 },
  aiCategory: "control-cluster",
  description: "CHA save or removed from the fight for 3 rounds. Bosses receive the normal control reduction. Upcast: +1 target.",
});

spell("black-tentacles", {
  name: "Evard's Black Tentacles",
  level: 4,
  resource: action,
  range: { kind: "ranged", feet: 90 },
  target: "point",
  area: { shape: "circle", radiusFeet: 10 },
  save: { ability: "dex", halfDamage: true },
  ...concentration3,
  effect: { kind: "damage", dice: { count: 3, sides: 6 }, type: "bludgeoning", status: { id: "black-tentacles", label: "Restrained", speedLocked: true, attackBonus: -2, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "Persistent tentacle zone. DEX save; 3d6 bludgeoning and failed saves are restrained briefly.",
});

spell("blight", {
  name: "Blight",
  level: 4,
  resource: action,
  range: { kind: "ranged", feet: 30 },
  target: "enemy",
  save: { ability: "con", halfDamage: true },
  effect: { kind: "damage", dice: { count: 8, sides: 8 }, type: "necrotic" },
  upcast: { dicePerLevel: 1 },
  aiCategory: "finish-target",
  description: "CON save for half of 8d8 necrotic damage. Upcast: +1d8.",
});

spell("charm-monster", {
  name: "Charm Monster",
  level: 4,
  resource: action,
  range: { kind: "ranged", feet: 30 },
  target: "enemy",
  save: { ability: "wis", negatesStatus: true },
  duration: { kind: "rounds", rounds: 3 },
  effect: { kind: "status", status: { id: "charm-monster", label: "Charmed", actionLocked: true, attackBonus: -2, durationRounds: 3 } },
  upcast: { targetsPerLevel: 1 },
  aiCategory: "control-cluster",
  description: "WIS save or charm locks down a monster briefly. Upcast: +1 target.",
});

spell("compulsion", {
  name: "Compulsion",
  level: 4,
  resource: action,
  range: { kind: "ranged", feet: 30 },
  target: "enemy",
  area: { shape: "circle", radiusFeet: 15 },
  save: { ability: "wis", negatesStatus: true },
  ...concentration3,
  effect: { kind: "status", status: { id: "compelled", label: "Compelled", actionLocked: true, attackBonus: -2, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "WIS save or enemies in the area lose their next action to forced movement.",
});

spell("confusion", {
  name: "Confusion",
  level: 4,
  resource: action,
  range: { kind: "ranged", feet: 90 },
  target: "point",
  area: { shape: "circle", radiusFeet: 10 },
  save: { ability: "wis", negatesStatus: true },
  ...concentration3,
  effect: { kind: "status", status: { id: "confused", label: "Confused", actionLocked: true, attackBonus: -2, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "Persistent confusion zone. WIS save or enemies waste their next action.",
});

spell("death-ward", {
  name: "Death Ward",
  level: 4,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "ally",
  duration: { kind: "hours", hours: 8 },
  effect: { kind: "status", status: { id: "death-ward", label: "Death Ward", tempHp: 18, saveBonus: 2, durationHours: 8 } },
  aiCategory: "defensive-reaction",
  description: "Eight-hour death buffer. Ally gains a large protective HP buffer and save support in the slim model.",
});

spell("dimension-door", {
  name: "Dimension Door",
  level: 4,
  resource: action,
  range: { kind: "self", feet: 120 },
  target: "point",
  effect: { kind: "teleport" },
  aiCategory: "escape-mobility",
  description: "Teleport to a visible empty square within 120 ft.",
});

spell("dominate-beast", {
  name: "Dominate Beast",
  level: 4,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  save: { ability: "wis", negatesStatus: true },
  ...concentration3,
  effect: { kind: "status", status: { id: "dominated-beast", label: "Dominated", actionLocked: true, attackBonus: -3, durationRounds: 3 } },
  aiCategory: "control-cluster",
  description: "WIS save or the beast is dominated, losing actions and accuracy in this combat model.",
});

spell("elemental-bane", {
  name: "Elemental Bane",
  level: 4,
  resource: action,
  range: { kind: "ranged", feet: 90 },
  target: "enemy",
  save: { ability: "con", negatesStatus: true },
  ...concentration3,
  effect: { kind: "status", status: { id: "elemental-bane", label: "Elemental Bane", vulnerabilities: ["acid", "cold", "fire", "lightning", "thunder"], saveBonus: -2, durationRounds: 3 } },
  aiCategory: "finish-target",
  description: "CON save or the target becomes vulnerable to common elemental damage and weaker against saves.",
});

spell("fire-shield", {
  name: "Fire Shield",
  level: 4,
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  duration: { kind: "rounds", rounds: 3 },
  effect: { kind: "status", status: { id: "fire-shield", label: "Fire Shield", acBonus: 2, damageBonus: 5, resistances: ["cold", "fire"], durationRounds: 3 } },
  aiCategory: "defensive-reaction",
  description: "Three-round shield. Gain defense, elemental resistance, and retaliatory damage in the slim model.",
});

spell("freedom-of-movement", {
  name: "Freedom of Movement",
  level: 4,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "ally",
  duration: { kind: "hours", hours: 1 },
  effect: { kind: "status", status: { id: "freedom-of-movement", label: "Freedom of Movement", speedBonusFeet: 10, saveBonus: 2, durationHours: 1 } },
  aiCategory: "escape-mobility",
  description: "One-hour mobility ward. Ally moves faster and resists restraint-like effects.",
});

spell("grasping-vine", {
  name: "Grasping Vine",
  level: 4,
  resource: quick,
  range: { kind: "ranged", feet: 30 },
  target: "point",
  area: { shape: "circle", radiusFeet: 10 },
  save: { ability: "str", negatesStatus: true },
  ...concentration3,
  effect: { kind: "status", status: { id: "grasping-vine", label: "Grasped", speedLocked: true, attackBonus: -2, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "Persistent vine zone. STR save or nearby enemies are briefly held and hindered.",
});

spell("greater-invisibility", {
  name: "Greater Invisibility",
  level: 4,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "ally",
  ...concentration3,
  effect: { kind: "status", status: { id: "greater-invisibility", label: "Greater Invisibility", attackAdvantage: true, acBonus: 3, ignoredByMonsters: true, durationRounds: 3 } },
  aiCategory: "buff-opener",
  description: "Concentration, 3 rounds. Ally attacks with advantage and is much harder for monsters to target.",
});

spell("guardian-of-faith", {
  name: "Guardian of Faith",
  level: 4,
  resource: action,
  range: { kind: "ranged", feet: 30 },
  target: "point",
  area: { shape: "circle", radiusFeet: 10 },
  duration: { kind: "rounds", rounds: 3 },
  save: { ability: "dex", halfDamage: true },
  effect: { kind: "damage", dice: { count: 5, sides: 8 }, type: "radiant" },
  aiCategory: "aoe-damage",
  description: "Persistent guardian zone. Enemies entering the ward take radiant damage, DEX save half.",
});

spell("guardian-of-nature", {
  name: "Guardian of Nature",
  level: 4,
  resource: quick,
  range: { kind: "self", feet: 0 },
  target: "self",
  ...concentration3,
  effect: { kind: "status", status: { id: "guardian-of-nature", label: "Guardian of Nature", attackAdvantage: true, damageBonus: 5, speedBonusFeet: 10, durationRounds: 3 } },
  aiCategory: "buff-opener",
  description: "Concentration, 3 rounds. Primal form grants advantage, bonus damage, and speed.",
});

spell("ice-storm", {
  name: "Ice Storm",
  level: 4,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "point",
  area: { shape: "circle", radiusFeet: 20 },
  save: { ability: "dex", halfDamage: true },
  effect: { kind: "damage", dice: { count: 4, sides: 8 }, type: "cold", status: { id: "ice-storm", label: "Icy Ground", speedBonusFeet: -10, expiresAtEndOfTurn: true } },
  upcast: { dicePerLevel: 1 },
  aiCategory: "aoe-damage",
  description: "Large freezing storm for 4d8 cold and brief slow, DEX save half. Upcast: +1d8.",
});

spell("phantasmal-killer", {
  name: "Phantasmal Killer",
  level: 4,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "enemy",
  save: { ability: "wis", halfDamage: true },
  ...concentration3,
  effect: { kind: "damage", dice: { count: 4, sides: 10 }, type: "psychic", status: { id: "frightened", label: "Frightened", attackBonus: -3, durationRounds: 3 } },
  aiCategory: "finish-target",
  description: "WIS save. 4d10 psychic, half on success; failed save also frightens.",
});

spell("resilient-sphere", {
  name: "Otiluke's Resilient Sphere",
  level: 4,
  resource: action,
  range: { kind: "ranged", feet: 30 },
  target: "creature",
  save: { ability: "dex", negatesStatus: true },
  ...concentration3,
  effect: { kind: "status", status: { id: "resilient-sphere", label: "Resilient Sphere", acBonus: 5, speedLocked: true, actionLocked: true, durationRounds: 3 } },
  aiCategory: "control-cluster",
  description: "DEX save or sealed in a protective force sphere. Useful as enemy control or emergency ally protection.",
});

spell("shadow-of-moil", {
  name: "Shadow of Moil",
  level: 4,
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  ...concentration3,
  effect: { kind: "status", status: { id: "shadow-of-moil", label: "Shadow of Moil", acBonus: 3, damageBonus: 6, ignoredByMonsters: true, durationRounds: 3 } },
  aiCategory: "defensive-reaction",
  description: "Concentration, 3 rounds. Flame-like shadow makes you hard to target and adds retaliatory necrotic pressure.",
});

spell("sickening-radiance", {
  name: "Sickening Radiance",
  level: 4,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "point",
  area: { shape: "circle", radiusFeet: 20 },
  save: { ability: "con", halfDamage: true },
  ...concentration3,
  effect: { kind: "damage", dice: { count: 4, sides: 10 }, type: "radiant", status: { id: "sickened", label: "Sickened", attackBonus: -2, saveBonus: -2, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "Persistent radiance. CON save; radiant damage and failed saves are sickened briefly.",
});

spell("staggering-smite", {
  name: "Staggering Smite",
  level: 4,
  resource: weaponRider,
  range: { kind: "self", feet: 0 },
  target: "self",
  effect: { kind: "status", status: { id: "staggering-smite", label: "Staggering Smite", damageBonus: 14, damageType: "psychic", riderStatus: "stunned", expiresAtEndOfTurn: true } },
  aiCategory: "finish-target",
  description: "Weapon rider. Next hit adds psychic damage and staggers the target into a short stun.",
});

spell("stoneskin", {
  name: "Stoneskin",
  level: 4,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "ally",
  ...concentration3,
  effect: { kind: "status", status: { id: "stoneskin", label: "Stoneskin", resistances: ["bludgeoning", "piercing", "slashing"], durationRounds: 3 } },
  aiCategory: "defensive-reaction",
  description: "Concentration, 3 rounds. Ally gains resistance to physical weapon damage.",
});

spell("storm-sphere", {
  name: "Storm Sphere",
  level: 4,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "point",
  area: { shape: "circle", radiusFeet: 15 },
  save: { ability: "str", halfDamage: true },
  ...concentration3,
  effect: { kind: "damage", dice: { count: 3, sides: 6 }, type: "lightning", status: { id: "storm-tossed", label: "Storm-Tossed", attackBonus: -2, speedBonusFeet: -10, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "Persistent storm. STR save; lightning damage with brief attack and speed penalties.",
});

spell("vitriolic-sphere", {
  name: "Vitriolic Sphere",
  level: 4,
  resource: action,
  range: { kind: "ranged", feet: 150 },
  target: "point",
  area: { shape: "circle", radiusFeet: 20 },
  save: { ability: "dex", halfDamage: true },
  effect: { kind: "damage", dice: { count: 10, sides: 4 }, type: "acid", status: { id: "acid-burn", label: "Acid Burn", acBonus: -1, expiresAtEndOfTurn: true } },
  upcast: { dicePerLevel: 2 },
  aiCategory: "aoe-damage",
  description: "Large acid burst for 10d4 acid and a brief armor penalty, DEX save half. Upcast: +2d4.",
});

spell("wall-of-fire", {
  name: "Wall of Fire",
  level: 4,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "point",
  area: { shape: "wall", lengthFeet: 60, widthFeet: 5, terrain: { shape: "wall", lengthFeet: 60, widthFeet: 5, blocksLineOfSight: true } },
  save: { ability: "dex", halfDamage: true },
  ...concentration3,
  effect: { kind: "damage", dice: { count: 5, sides: 8 }, type: "fire" },
  upcast: { dicePerLevel: 1 },
  aiCategory: "aoe-damage",
  description: "Persistent opaque fire wall. DEX save half for creatures in the wall. Upcast: +1d8.",
});

spell("watery-sphere", {
  name: "Watery Sphere",
  level: 4,
  resource: action,
  range: { kind: "ranged", feet: 90 },
  target: "point",
  area: { shape: "circle", radiusFeet: 10 },
  save: { ability: "str", negatesStatus: true },
  ...concentration3,
  effect: { kind: "status", status: { id: "watery-sphere", label: "Engulfed", speedLocked: true, attackBonus: -2, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "Persistent water sphere. STR save or enemies are engulfed and briefly held.",
});

spell("antilife-shell", {
  name: "Antilife Shell",
  level: 5,
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  ...concentration3,
  effect: { kind: "status", status: { id: "antilife-shell", label: "Antilife Shell", acBonus: 4, ignoredByMonsters: true, durationRounds: 3 } },
  aiCategory: "defensive-reaction",
  description: "Concentration, 3 rounds. Living enemies are discouraged from engaging you; modeled as strong defense and monster avoidance.",
});

spell("banishing-smite", {
  name: "Banishing Smite",
  level: 5,
  resource: weaponRider,
  range: { kind: "self", feet: 0 },
  target: "self",
  effect: { kind: "status", status: { id: "banishing-smite", label: "Banishing Smite", damageBonus: 18, damageType: "force", riderStatus: "banished", expiresAtEndOfTurn: true } },
  aiCategory: "finish-target",
  description: "Weapon rider. Next hit adds force damage and briefly banishes the target.",
});

spell("circle-of-power", {
  name: "Circle of Power",
  level: 5,
  resource: action,
  range: { kind: "ranged", feet: 30 },
  target: "ally",
  area: { shape: "circle", radiusFeet: 15 },
  ...concentration3,
  effect: { kind: "status", status: { id: "circle-of-power", label: "Circle of Power", saveBonus: 4, resistances: ["acid", "cold", "fire", "force", "lightning", "necrotic", "psychic", "radiant", "thunder"], durationRounds: 3 } },
  aiCategory: "buff-opener",
  description: "Concentration, 3 rounds. Nearby allies gain major save support and broad spell-damage resistance.",
});

spell("cloudkill", {
  name: "Cloudkill",
  level: 5,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "point",
  area: { shape: "circle", radiusFeet: 20 },
  save: { ability: "con", halfDamage: true },
  ...concentration3,
  effect: { kind: "damage", dice: { count: 5, sides: 8 }, type: "poison" },
  upcast: { dicePerLevel: 1 },
  aiCategory: "aoe-damage",
  description: "Persistent poison cloud. CON save half. Upcast: +1d8.",
});

spell("cone-of-cold", {
  name: "Cone of Cold",
  level: 5,
  resource: action,
  range: { kind: "self", feet: 60 },
  target: "direction",
  area: { shape: "cone", lengthFeet: 60 },
  save: { ability: "con", halfDamage: true },
  effect: { kind: "damage", dice: { count: 8, sides: 8 }, type: "cold" },
  upcast: { dicePerLevel: 1 },
  aiCategory: "aoe-damage",
  description: "Huge cold cone for 8d8 cold, CON save half. Upcast: +1d8.",
});

spell("conjure-volley", {
  name: "Conjure Volley",
  level: 5,
  resource: action,
  range: { kind: "ranged", feet: 150 },
  target: "point",
  area: { shape: "circle", radiusFeet: 20 },
  save: { ability: "dex", halfDamage: true },
  effect: { kind: "damage", dice: { count: 8, sides: 8 }, type: "piercing" },
  aiCategory: "aoe-damage",
  description: "Rain of spectral ammunition for 8d8 piercing in a large area, DEX save half.",
});

spell("contagion", {
  name: "Contagion",
  level: 5,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "enemy",
  effect: { kind: "attackDamage", dice: { count: 3, sides: 8 }, type: "poison", status: { id: "contagion", label: "Diseased", attackBonus: -3, saveBonus: -3, durationRounds: 3 } },
  aiCategory: "control-cluster",
  description: "Melee spell attack. Poison damage and a disease-like attack/save penalty.",
});

spell("dawn", {
  name: "Dawn",
  level: 5,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "point",
  area: { shape: "circle", radiusFeet: 15 },
  save: { ability: "con", halfDamage: true },
  ...concentration3,
  effect: { kind: "damage", dice: { count: 4, sides: 10 }, type: "radiant" },
  aiCategory: "aoe-damage",
  description: "Persistent radiant column. CON save half.",
});

spell("destructive-wave", {
  name: "Destructive Wave",
  level: 5,
  resource: action,
  range: { kind: "self", feet: 30 },
  target: "point",
  area: { shape: "circle", radiusFeet: 30 },
  save: { ability: "con", halfDamage: true },
  effect: { kind: "damage", dice: { count: 5, sides: 6 }, type: "radiant", status: { id: "prone", label: "Prone", speedBonusFeet: -15, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "Holy shockwave for 5d6 radiant/thunder pressure and brief knockdown, CON save half.",
});

spell("dispel-evil-and-good", {
  name: "Dispel Evil and Good",
  level: 5,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "ally",
  ...concentration3,
  effect: { kind: "status", status: { id: "dispel-evil-and-good", label: "Sacred Ward", acBonus: 2, saveBonus: 3, durationRounds: 3 } },
  aiCategory: "defensive-reaction",
  description: "Concentration, 3 rounds. Sacred ward improves defense and saves against supernatural threats.",
});

spell("dominate-person", {
  name: "Dominate Person",
  level: 5,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  save: { ability: "wis", negatesStatus: true },
  ...concentration3,
  effect: { kind: "status", status: { id: "dominated-person", label: "Dominated", actionLocked: true, attackBonus: -3, durationRounds: 3 } },
  aiCategory: "control-cluster",
  description: "WIS save or humanoid control is simplified into action lock and severe attack penalty.",
});

spell("enervation", {
  name: "Enervation",
  level: 5,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  save: { ability: "dex", halfDamage: true },
  ...concentration3,
  effect: { kind: "damage", dice: { count: 4, sides: 8 }, type: "necrotic", status: { id: "enervated", label: "Enervated", damageBonus: -3, durationRounds: 3 } },
  upcast: { dicePerLevel: 1 },
  aiCategory: "finish-target",
  description: "Sustained necrotic drain. DEX save half, failed save weakens damage. Upcast: +1d8.",
});

spell("far-step", {
  name: "Far Step",
  level: 5,
  resource: quick,
  range: { kind: "self", feet: 60 },
  target: "point",
  effect: { kind: "teleport" },
  aiCategory: "escape-mobility",
  description: "Bonus-action teleport to a visible empty square within 60 ft.",
});

spell("flame-strike", {
  name: "Flame Strike",
  level: 5,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "point",
  area: { shape: "circle", radiusFeet: 10 },
  save: { ability: "dex", halfDamage: true },
  effect: { kind: "damage", dice: { count: 8, sides: 6 }, type: "radiant" },
  upcast: { dicePerLevel: 1 },
  aiCategory: "aoe-damage",
  description: "Column of divine fire for 8d6 radiant/fire pressure, DEX save half. Upcast: +1d6.",
});

spell("hold-monster", {
  name: "Hold Monster",
  level: 5,
  resource: action,
  range: { kind: "ranged", feet: 90 },
  target: "enemy",
  save: { ability: "wis", negatesStatus: true },
  ...concentration3,
  effect: { kind: "status", status: { id: "paralyzed", label: "Paralyzed", speedLocked: true, actionLocked: true, durationRounds: 3 } },
  upcast: { targetsPerLevel: 1 },
  aiCategory: "control-cluster",
  description: "WIS save or paralyzed for 3 rounds. Bosses receive the normal control reduction. Upcast: +1 target.",
});

spell("immolation", {
  name: "Immolation",
  level: 5,
  resource: action,
  range: { kind: "ranged", feet: 90 },
  target: "enemy",
  save: { ability: "dex", halfDamage: true },
  ...concentration3,
  effect: { kind: "damage", dice: { count: 8, sides: 6 }, type: "fire", status: { id: "immolated", label: "Burning", acBonus: -1, durationRounds: 3 } },
  aiCategory: "finish-target",
  description: "DEX save. 8d6 fire, half on success; failed save leaves the target burning.",
});

spell("insect-plague", {
  name: "Insect Plague",
  level: 5,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "point",
  area: { shape: "circle", radiusFeet: 20 },
  save: { ability: "con", halfDamage: true },
  ...concentration3,
  effect: { kind: "damage", dice: { count: 4, sides: 10 }, type: "piercing", status: { id: "swarmed", label: "Swarmed", attackBonus: -2, expiresAtEndOfTurn: true } },
  upcast: { dicePerLevel: 1 },
  aiCategory: "control-cluster",
  description: "Persistent biting swarm. CON save half and failed saves are hindered. Upcast: +1d10.",
});

spell("maelstrom", {
  name: "Maelstrom",
  level: 5,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "point",
  area: { shape: "circle", radiusFeet: 20 },
  save: { ability: "str", halfDamage: true },
  ...concentration3,
  effect: {
    kind: "damage",
    dice: { count: 6, sides: 6 },
    type: "bludgeoning",
    status: { id: "maelstrom", label: "Dragged", speedBonusFeet: -20, expiresAtEndOfTurn: true },
    forcedMovement: { mode: "pull", distanceFeet: 10, on: "failedSave" },
  },
  aiCategory: "control-cluster",
  description: "Persistent crushing water vortex. STR save half; failed saves are pulled 10 ft toward the vortex and heavily slowed.",
});

spell("mass-cure-wounds", {
  name: "Mass Cure Wounds",
  level: 5,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "ally",
  area: { shape: "circle", radiusFeet: 30 },
  effect: { kind: "healing", dice: { count: 3, sides: 8 }, abilityBonus: "spellcasting" },
  upcast: { dicePerLevel: 1 },
  aiCategory: "efficient-heal",
  description: "Area heal restores 3d8 + spell stat HP to up to six nearby allies. Upcast: +1d8.",
});

spell("greater-restoration", {
  name: "Greater Restoration",
  level: 5,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "ally",
  effect: { kind: "restoration", removeAll: true, healDice: { count: 2, sides: 8 } },
  aiCategory: "cleanse",
  description: "Remove all harmful status effects from an adjacent ally and restore a small amount of HP.",
});

spell("raise-dead", {
  name: "Raise Dead",
  level: 5,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "corpse",
  effect: { kind: "revive", hpFraction: 0.5 },
  aiCategory: "revive",
  description: "At the graveyard or a reachable corpse, restore a companion whose body has not decomposed beyond 10 days.",
});

spell("negative-energy-flood", {
  name: "Negative Energy Flood",
  level: 5,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  save: { ability: "con", halfDamage: true },
  effect: { kind: "damage", dice: { count: 5, sides: 12 }, type: "necrotic" },
  aiCategory: "finish-target",
  description: "CON save for half of 5d12 necrotic damage.",
});

spell("skill-empowerment", {
  name: "Skill Empowerment",
  level: 5,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "ally",
  duration: { kind: "hours", hours: 1 },
  effect: { kind: "status", status: { id: "skill-empowerment", label: "Skill Empowerment", skillBonus: 5, durationHours: 1 } },
  aiCategory: "buff-opener",
  description: "One-hour expertise boost. Ally gains a large bonus to exploration and skill checks.",
});

spell("steel-wind-strike", {
  name: "Steel Wind Strike",
  level: 5,
  resource: action,
  range: { kind: "ranged", feet: 30 },
  target: "point",
  area: { shape: "circle", radiusFeet: 15 },
  effect: { kind: "damage", dice: { count: 6, sides: 10 }, type: "force" },
  aiCategory: "finish-target",
  description: "Teleporting blade flurry simplified as a force burst against nearby enemies.",
});

spell("swift-quiver", {
  name: "Swift Quiver",
  level: 5,
  resource: quick,
  range: { kind: "self", feet: 0 },
  target: "self",
  ...concentration3,
  effect: { kind: "status", status: { id: "swift-quiver", label: "Swift Quiver", attackBonus: 2, damageBonus: 6, durationRounds: 3 } },
  aiCategory: "finish-target",
  description: "Concentration, 3 rounds. Your ranged attacks gain speed, accuracy, and damage.",
});

spell("synaptic-static", {
  name: "Synaptic Static",
  level: 5,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "point",
  area: { shape: "circle", radiusFeet: 20 },
  save: { ability: "int", halfDamage: true },
  effect: { kind: "damage", dice: { count: 8, sides: 6 }, type: "psychic", status: { id: "synaptic-static", label: "Scrambled", attackBonus: -3, saveBonus: -3, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "INT save. 8d6 psychic, half on success; failed save scrambles attacks and saves.",
});

spell("telekinesis", {
  name: "Telekinesis",
  level: 5,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  save: { ability: "str", negatesStatus: true },
  ...concentration3,
  effect: { kind: "status", status: { id: "telekinesis", label: "Telekinetic Grip", speedLocked: true, attackBonus: -3, durationRounds: 3, forcedMovement: { mode: "pull", distanceFeet: 30, respectsSpeedLock: false } } },
  aiCategory: "control-cluster",
  description: "STR save or yanked up to 30 ft toward the caster and held in a telekinetic grip, locking movement and hindering attacks.",
});

spell("transmute-rock", {
  name: "Transmute Rock",
  level: 5,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "point",
  area: { shape: "circle", radiusFeet: 20 },
  save: { ability: "str", negatesStatus: true },
  duration: { kind: "rounds", rounds: 3 },
  effect: { kind: "status", status: { id: "transmute-rock", label: "Mired", speedBonusFeet: -20, attackBonus: -2, durationRounds: 3 } },
  aiCategory: "control-cluster",
  description: "Persistent mud-and-stone zone. STR save or creatures are mired, slowed, and hindered.",
});

spell("wrath-of-nature", {
  name: "Wrath of Nature",
  level: 5,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "point",
  area: { shape: "circle", radiusFeet: 20 },
  save: { ability: "str", halfDamage: true },
  ...concentration3,
  effect: { kind: "damage", dice: { count: 4, sides: 10 }, type: "bludgeoning", status: { id: "wrath-of-nature", label: "Nature's Wrath", speedBonusFeet: -10, attackBonus: -2, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "Persistent animated terrain. STR save half and failed saves are slowed and hindered.",
});

spell("blade-barrier", {
  name: "Blade Barrier",
  level: 6,
  resource: action,
  range: { kind: "ranged", feet: 90 },
  target: "point",
  area: { shape: "wall", lengthFeet: 60, widthFeet: 5, terrain: { shape: "wall", lengthFeet: 60, widthFeet: 5, difficultTerrain: true } },
  save: { ability: "dex", halfDamage: true },
  ...concentration3,
  effect: { kind: "damage", dice: { count: 6, sides: 10 }, type: "slashing", status: { id: "blade-barrier", label: "Blade Barrier", speedBonusFeet: -10, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "Persistent blade wall. The wall is difficult terrain; DEX save half and failed saves are briefly slowed.",
});

spell("chain-lightning", {
  name: "Chain Lightning",
  level: 6,
  resource: action,
  range: { kind: "ranged", feet: 150 },
  target: "point",
  area: { shape: "circle", radiusFeet: 20 },
  save: { ability: "dex", halfDamage: true },
  effect: { kind: "damage", dice: { count: 10, sides: 8 }, type: "lightning" },
  aiCategory: "aoe-damage",
  description: "Multi-target lightning simplified as a large arc burst for 10d8 lightning, DEX save half.",
});

spell("circle-of-death", {
  name: "Circle of Death",
  level: 6,
  resource: action,
  range: { kind: "ranged", feet: 150 },
  target: "point",
  area: { shape: "circle", radiusFeet: 30 },
  save: { ability: "con", halfDamage: true },
  effect: { kind: "damage", dice: { count: 8, sides: 6 }, type: "necrotic" },
  upcast: { dicePerLevel: 2 },
  aiCategory: "aoe-damage",
  description: "Huge necrotic burst for 8d6 necrotic, CON save half. Upcast: +2d6.",
});

spell("disintegrate", {
  name: "Disintegrate",
  level: 6,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  save: { ability: "dex", halfDamage: true },
  effect: { kind: "damage", dice: { count: 10, sides: 6, bonus: 40 }, type: "force" },
  upcast: { dicePerLevel: 3 },
  aiCategory: "finish-target",
  description: "DEX save for half of 10d6 + 40 force damage. Object destruction is omitted until destructible terrain exists.",
});

spell("eyebite", {
  name: "Eyebite",
  level: 6,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  save: { ability: "wis", negatesStatus: true },
  ...concentration3,
  effect: { kind: "status", status: { id: "eyebite", label: "Sickened", actionLocked: true, attackBonus: -3, durationRounds: 3 } },
  aiCategory: "control-cluster",
  description: "WIS save or a baleful gaze sickens and suppresses the target for 3 rounds.",
});

spell("flesh-to-stone", {
  name: "Flesh to Stone",
  level: 6,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  save: { ability: "con", negatesStatus: true },
  ...concentration3,
  effect: { kind: "status", status: { id: "petrifying", label: "Petrifying", speedLocked: true, actionLocked: true, acBonus: 2, durationRounds: 3 } },
  aiCategory: "control-cluster",
  description: "CON save or the target begins petrifying, locking movement and actions in the slim model.",
});

spell("forbiddance", {
  name: "Forbiddance",
  level: 6,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "point",
  area: { shape: "circle", radiusFeet: 30 },
  save: { ability: "wis", halfDamage: true },
  duration: { kind: "rounds", rounds: 3 },
  effect: { kind: "damage", dice: { count: 5, sides: 10 }, type: "radiant", status: { id: "forbidden", label: "Forbidden", speedBonusFeet: -10, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "Persistent sacred interdiction. WIS save half and failed saves are briefly slowed.",
});

spell("freezing-sphere", {
  name: "Otiluke's Freezing Sphere",
  level: 6,
  resource: action,
  range: { kind: "ranged", feet: 150 },
  target: "point",
  area: { shape: "circle", radiusFeet: 20 },
  save: { ability: "con", halfDamage: true },
  effect: { kind: "damage", dice: { count: 10, sides: 6 }, type: "cold", status: { id: "frozen-ground", label: "Frozen Ground", speedBonusFeet: -10, expiresAtEndOfTurn: true } },
  upcast: { dicePerLevel: 1 },
  aiCategory: "aoe-damage",
  description: "Freezing explosion for 10d6 cold and brief slow, CON save half. Upcast: +1d6.",
});

spell("globe-of-invulnerability", {
  name: "Globe of Invulnerability",
  level: 6,
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  ...concentration3,
  effect: { kind: "status", status: { id: "globe-of-invulnerability", label: "Globe of Invulnerability", acBonus: 4, saveBonus: 4, durationRounds: 3 } },
  aiCategory: "defensive-reaction",
  description: "Concentration, 3 rounds. Protective globe gives major defense and save bonuses against hostile magic.",
});

spell("harm", {
  name: "Harm",
  level: 6,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  save: { ability: "con", halfDamage: true },
  effect: { kind: "damage", dice: { count: 14, sides: 6 }, type: "necrotic", status: { id: "harmed", label: "Harmed", damageBonus: -4, expiresAtEndOfTurn: true } },
  aiCategory: "finish-target",
  description: "CON save. Heavy necrotic damage and failed saves briefly weaken the target.",
});

spell("heal", {
  name: "Heal",
  level: 6,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "ally",
  effect: { kind: "healing", dice: { count: 10, sides: 8 }, abilityBonus: "spellcasting" },
  aiCategory: "efficient-heal",
  description: "Massive single-target heal for 10d8 + spell stat HP.",
});

spell("heroes-feast", {
  name: "Heroes' Feast",
  level: 6,
  resource: action,
  range: { kind: "ranged", feet: 30 },
  target: "ally",
  area: { shape: "circle", radiusFeet: 30 },
  duration: { kind: "hours", hours: 8 },
  effect: { kind: "status", status: { id: "heroes-feast", label: "Heroes' Feast", tempHp: 18, saveBonus: 2, resistances: ["poison"], durationHours: 8 } },
  aiCategory: "buff-opener",
  description: "Long feast buff. Up to six allies gain temp HP, poison resistance, and save support.",
});

spell("investiture-of-flame", {
  name: "Investiture of Flame",
  level: 6,
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  ...concentration3,
  effect: { kind: "status", status: { id: "investiture-of-flame", label: "Investiture of Flame", resistances: ["fire"], damageBonus: 8, acBonus: 1, durationRounds: 3 } },
  aiCategory: "buff-opener",
  description: "Concentration, 3 rounds. Fiery form grants fire resistance, defense, and bonus damage.",
});

spell("investiture-of-ice", {
  name: "Investiture of Ice",
  level: 6,
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  ...concentration3,
  effect: { kind: "status", status: { id: "investiture-of-ice", label: "Investiture of Ice", resistances: ["cold"], acBonus: 2, speedBonusFeet: 10, durationRounds: 3 } },
  aiCategory: "defensive-reaction",
  description: "Concentration, 3 rounds. Icy form grants cold resistance, defense, and stable footing.",
});

spell("investiture-of-stone", {
  name: "Investiture of Stone",
  level: 6,
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  ...concentration3,
  effect: { kind: "status", status: { id: "investiture-of-stone", label: "Investiture of Stone", resistances: ["bludgeoning", "piercing", "slashing"], damageBonus: 5, durationRounds: 3 } },
  aiCategory: "defensive-reaction",
  description: "Concentration, 3 rounds. Stone form grants physical resistance and heavier strikes.",
});

spell("investiture-of-wind", {
  name: "Investiture of Wind",
  level: 6,
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  ...concentration3,
  effect: { kind: "status", status: { id: "investiture-of-wind", label: "Investiture of Wind", flying: true, acBonus: 3, speedBonusFeet: 20, durationRounds: 3 } },
  aiCategory: "escape-mobility",
  description: "Concentration, 3 rounds. Wind form grants flight, speed, and defense.",
});

spell("irresistible-dance", {
  name: "Otto's Irresistible Dance",
  level: 6,
  resource: action,
  range: { kind: "ranged", feet: 30 },
  target: "enemy",
  save: { ability: "wis", negatesStatus: true },
  ...concentration3,
  effect: { kind: "status", status: { id: "irresistible-dance", label: "Dancing", speedLocked: true, actionLocked: true, acBonus: -2, durationRounds: 3 } },
  aiCategory: "control-cluster",
  description: "WIS save or the target dances helplessly, losing movement/actions and becoming easier to hit.",
});

spell("mental-prison", {
  name: "Mental Prison",
  level: 6,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  save: { ability: "int", halfDamage: true },
  ...concentration3,
  effect: { kind: "damage", dice: { count: 5, sides: 10 }, type: "psychic", status: { id: "mental-prison", label: "Mental Prison", speedLocked: true, attackBonus: -3, durationRounds: 3 } },
  aiCategory: "control-cluster",
  description: "INT save. Psychic damage and failed saves trap the target in an illusionary prison.",
});

spell("primordial-ward", {
  name: "Primordial Ward",
  level: 6,
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  ...concentration3,
  effect: { kind: "status", status: { id: "primordial-ward", label: "Primordial Ward", resistances: ["acid", "cold", "fire", "lightning", "thunder"], saveBonus: 2, durationRounds: 3 } },
  aiCategory: "defensive-reaction",
  description: "Concentration, 3 rounds. Elemental ward grants broad resistance and save support.",
});

spell("sunbeam", {
  name: "Sunbeam",
  level: 6,
  resource: action,
  range: { kind: "self", feet: 60 },
  target: "direction",
  area: { shape: "line", lengthFeet: 60, widthFeet: 5 },
  save: { ability: "con", halfDamage: true },
  ...concentration3,
  effect: { kind: "damage", dice: { count: 6, sides: 8 }, type: "radiant", status: { id: "blinded", label: "Blinded", attackBonus: -3, expiresAtEndOfTurn: true } },
  lightSource: { brightRadiusFeet: 30, dimRadiusFeet: 60, magical: true, color: "#fff1a8" },
  aiCategory: "control-cluster",
  description: "Sustained radiant line. CON save half and failed saves are blinded briefly; the caster also sheds bright sunlight while concentrating.",
});

spell("true-seeing", {
  name: "True Seeing",
  level: 6,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "ally",
  duration: { kind: "hours", hours: 1 },
  effect: { kind: "status", status: { id: "true-seeing", label: "True Seeing", attackBonus: 2, skillBonus: 4, senses: { truesight: 120, seeInvisible: true }, durationHours: 1 } },
  aiCategory: "buff-opener",
  description: "One-hour truesight modeled as strong perception, accuracy, invisibility detection, and immunity to poor-light penalties.",
});

spell("wall-of-ice", {
  name: "Wall of Ice",
  level: 6,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "point",
  area: { shape: "wall", lengthFeet: 50, widthFeet: 5, terrain: { shape: "wall", lengthFeet: 50, widthFeet: 5, blocksMovement: true, blocksLineOfSight: true } },
  save: { ability: "dex", halfDamage: true },
  ...concentration3,
  effect: { kind: "damage", dice: { count: 6, sides: 6 }, type: "cold", status: { id: "wall-of-ice", label: "Icy Wall", speedBonusFeet: -20, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "Persistent ice wall. It blocks movement and sight; DEX save half and failed saves are heavily slowed.",
});

spell("wall-of-thorns", {
  name: "Wall of Thorns",
  level: 6,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "point",
  area: { shape: "wall", lengthFeet: 60, widthFeet: 5, terrain: { shape: "wall", lengthFeet: 60, widthFeet: 5, difficultTerrain: true, blocksLineOfSight: true } },
  save: { ability: "dex", halfDamage: true },
  ...concentration3,
  effect: { kind: "damage", dice: { count: 7, sides: 8 }, type: "piercing", status: { id: "wall-of-thorns", label: "Thorn Wall", speedBonusFeet: -20, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "Persistent thorn wall. It blocks sight and is difficult terrain; DEX save half and failed saves are heavily slowed.",
});

spell("arcane-sword", {
  name: "Mordenkainen's Sword",
  level: 7,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "point",
  area: { shape: "circle", radiusFeet: 5 },
  duration: { kind: "rounds", rounds: 3 },
  effect: { kind: "damage", dice: { count: 3, sides: 10 }, type: "force" },
  aiCategory: "finish-target",
  description: "Persistent force blade simplified as a small damaging zone for 3 rounds.",
});

spell("crown-of-stars", {
  name: "Crown of Stars",
  level: 7,
  resource: quick,
  range: { kind: "self", feet: 0 },
  target: "self",
  duration: { kind: "rounds", rounds: 3 },
  effect: { kind: "status", status: { id: "crown-of-stars", label: "Crown of Stars", attackBonus: 2, damageBonus: 13, durationRounds: 3 } },
  aiCategory: "finish-target",
  description: "Radiant motes simplified as 3 rounds of accuracy and bonus radiant pressure.",
});

spell("delayed-blast-fireball", {
  name: "Delayed Blast Fireball",
  level: 7,
  resource: action,
  range: { kind: "ranged", feet: 150 },
  target: "point",
  area: { shape: "circle", radiusFeet: 20 },
  save: { ability: "dex", halfDamage: true },
  effect: { kind: "damage", dice: { count: 12, sides: 6 }, type: "fire" },
  upcast: { dicePerLevel: 1 },
  aiCategory: "aoe-damage",
  description: "Delayed detonation simplified as a huge fire burst for 12d6 fire, DEX save half. Upcast: +1d6.",
});

spell("divine-word", {
  name: "Divine Word",
  level: 7,
  resource: action,
  range: { kind: "ranged", feet: 30 },
  target: "point",
  area: { shape: "circle", radiusFeet: 30 },
  save: { ability: "cha", negatesStatus: true },
  effect: { kind: "status", status: { id: "divine-word", label: "Divine Word", actionLocked: true, attackBonus: -3, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "Sacred command. CHA save or enemies are briefly overwhelmed, losing action pressure.",
});

spell("etherealness", {
  name: "Etherealness",
  level: 7,
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  duration: { kind: "rounds", rounds: 3 },
  effect: { kind: "status", status: { id: "etherealness", label: "Etherealness", ignoredByMonsters: true, flying: true, acBonus: 5, durationRounds: 3 } },
  aiCategory: "escape-mobility",
  description: "Phase out for 3 rounds: ignored by monsters, flying, and very hard to hit.",
});

spell("finger-of-death", {
  name: "Finger of Death",
  level: 7,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  save: { ability: "con", halfDamage: true },
  effect: { kind: "damage", dice: { count: 7, sides: 8, bonus: 30 }, type: "necrotic" },
  aiCategory: "finish-target",
  description: "CON save for half of 7d8 + 30 necrotic damage. Zombie creation is omitted until minion support exists.",
});

spell("fire-storm", {
  name: "Fire Storm",
  level: 7,
  resource: action,
  range: { kind: "ranged", feet: 150 },
  target: "point",
  area: { shape: "circle", radiusFeet: 30 },
  save: { ability: "dex", halfDamage: true },
  effect: { kind: "damage", dice: { count: 7, sides: 10 }, type: "fire" },
  aiCategory: "aoe-damage",
  description: "Huge shaped flames simplified as a large fire area for 7d10 fire, DEX save half.",
});

spell("forcecage", {
  name: "Forcecage",
  level: 7,
  resource: action,
  range: { kind: "ranged", feet: 100 },
  target: "point",
  area: { shape: "circle", radiusFeet: 10, terrain: { shape: "cage", radiusFeet: 10, blocksMovement: true } },
  duration: { kind: "rounds", rounds: 3 },
  effect: { kind: "status", status: { id: "forcecage", label: "Forcecaged", speedLocked: true, actionLocked: true, durationRounds: 3 } },
  aiCategory: "control-cluster",
  description: "Force prison. The cage perimeter blocks movement while creatures inside are locked down.",
});

spell("power-word-pain", {
  name: "Power Word Pain",
  level: 7,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  duration: { kind: "rounds", rounds: 3 },
  effect: { kind: "status", status: { id: "power-word-pain", label: "Agonized", attackBonus: -4, saveBonus: -4, speedBonusFeet: -10, durationRounds: 3 } },
  aiCategory: "control-cluster",
  description: "No-save agony in the slim model: the target suffers major attack, save, and speed penalties.",
});

spell("prismatic-spray", {
  name: "Prismatic Spray",
  level: 7,
  resource: action,
  range: { kind: "self", feet: 60 },
  target: "direction",
  area: { shape: "cone", lengthFeet: 60 },
  save: { ability: "dex", halfDamage: true },
  effect: { kind: "damage", dice: { count: 10, sides: 6 }, type: "force", status: { id: "prismatic-spray", label: "Prismatic Daze", attackBonus: -2, expiresAtEndOfTurn: true } },
  aiCategory: "aoe-damage",
  description: "Random rays simplified as a force cone for 10d6 damage and brief daze, DEX save half.",
});

spell("regenerate", {
  name: "Regenerate",
  level: 7,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "ally",
  duration: { kind: "rounds", rounds: 3 },
  effect: { kind: "restoration", removeAll: true, healDice: { count: 8, sides: 8 } },
  aiCategory: "efficient-heal",
  description: "Powerful regeneration restores 8d8 HP and removes harmful body conditions in the slim model.",
});

spell("resurrection", {
  name: "Resurrection",
  level: 7,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "corpse",
  effect: { kind: "revive", hpFraction: 1 },
  aiCategory: "revive",
  description: "At the graveyard, restore a dead companion even after ordinary decay has made Raise Dead insufficient.",
});

spell("reverse-gravity", {
  name: "Reverse Gravity",
  level: 7,
  resource: action,
  range: { kind: "ranged", feet: 100 },
  target: "point",
  area: { shape: "circle", radiusFeet: 30, terrain: { shape: "circle", radiusFeet: 30, difficultTerrain: true } },
  save: { ability: "dex", halfDamage: true },
  ...concentration3,
  effect: { kind: "damage", dice: { count: 6, sides: 10 }, type: "bludgeoning", status: { id: "reverse-gravity", label: "Lifted", speedLocked: true, attackBonus: -3, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "Gravity flips in a large area. DEX save half and failed saves are lifted and hindered.",
});

spell("symbol", {
  name: "Symbol",
  level: 7,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "point",
  area: { shape: "circle", radiusFeet: 20 },
  save: { ability: "wis", negatesStatus: true },
  duration: { kind: "rounds", rounds: 3 },
  effect: { kind: "status", status: { id: "symbol", label: "Symbol", actionLocked: true, attackBonus: -3, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "Triggered rune simplified as a persistent control glyph. WIS save or enemies are overwhelmed.",
});

spell("whirlwind", {
  name: "Whirlwind",
  level: 7,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "point",
  area: { shape: "circle", radiusFeet: 15 },
  save: { ability: "dex", halfDamage: true },
  ...concentration3,
  effect: {
    kind: "damage",
    dice: { count: 8, sides: 6 },
    type: "bludgeoning",
    status: { id: "whirlwind", label: "Whirlwind", speedLocked: true, attackBonus: -2, expiresAtEndOfTurn: true },
    forcedMovement: { mode: "pull", distanceFeet: 15, on: "failedSave" },
  },
  aiCategory: "control-cluster",
  description: "Persistent vortex. DEX save half; failed saves are pulled 15 ft toward the vortex, trapped, and hindered.",
});

spell("horrid-wilting", {
  name: "Abi-Dalzim's Horrid Wilting",
  level: 8,
  resource: action,
  range: { kind: "ranged", feet: 150 },
  target: "point",
  area: { shape: "circle", radiusFeet: 30 },
  save: { ability: "con", halfDamage: true },
  effect: { kind: "damage", dice: { count: 12, sides: 8 }, type: "necrotic" },
  aiCategory: "aoe-damage",
  description: "Huge desiccating burst for 12d8 necrotic damage, CON save half.",
});

spell("antimagic-field", {
  name: "Antimagic Field",
  level: 8,
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  ...concentration3,
  effect: { kind: "status", status: { id: "antimagic-field", label: "Antimagic Field", saveBonus: 5, acBonus: 3, durationRounds: 3 } },
  aiCategory: "defensive-reaction",
  description: "Concentration, 3 rounds. Magic suppression is modeled as major defense and saving throw support.",
});

spell("dominate-monster", {
  name: "Dominate Monster",
  level: 8,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  save: { ability: "wis", negatesStatus: true },
  ...concentration3,
  effect: { kind: "status", status: { id: "dominated-monster", label: "Dominated", actionLocked: true, attackBonus: -4, durationRounds: 3 } },
  aiCategory: "control-cluster",
  description: "WIS save or any monster is dominated, simplified as action lock and severe attack penalty.",
});

spell("earthquake", {
  name: "Earthquake",
  level: 8,
  resource: action,
  range: { kind: "ranged", feet: 150 },
  target: "point",
  area: { shape: "circle", radiusFeet: 30, terrain: { shape: "circle", radiusFeet: 30, difficultTerrain: true } },
  save: { ability: "dex", halfDamage: true },
  ...concentration3,
  effect: { kind: "damage", dice: { count: 8, sides: 10 }, type: "bludgeoning", status: { id: "earthquake", label: "Quaking", speedBonusFeet: -20, attackBonus: -2, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "Persistent quake. The area is difficult terrain; DEX save half and failed saves are slowed and hindered.",
});

spell("feeblemind", {
  name: "Feeblemind",
  level: 8,
  resource: action,
  range: { kind: "ranged", feet: 150 },
  target: "enemy",
  save: { ability: "int", halfDamage: true },
  effect: { kind: "damage", dice: { count: 4, sides: 6 }, type: "psychic", status: { id: "feeblemind", label: "Feeblemind", attackBonus: -4, saveBonus: -4, durationRounds: 3 } },
  aiCategory: "control-cluster",
  description: "INT save. Psychic damage and failed saves cripple attacks and saves for 3 rounds.",
});

spell("holy-aura", {
  name: "Holy Aura",
  level: 8,
  resource: action,
  range: { kind: "ranged", feet: 30 },
  target: "ally",
  area: { shape: "circle", radiusFeet: 30 },
  ...concentration3,
  effect: { kind: "status", status: { id: "holy-aura", label: "Holy Aura", acBonus: 3, saveBonus: 4, durationRounds: 3 } },
  aiCategory: "buff-opener",
  description: "Concentration, 3 rounds. Up to six allies gain major defense and save support.",
});

spell("incendiary-cloud", {
  name: "Incendiary Cloud",
  level: 8,
  resource: action,
  range: { kind: "ranged", feet: 150 },
  target: "point",
  area: { shape: "circle", radiusFeet: 20 },
  save: { ability: "dex", halfDamage: true },
  ...concentration3,
  effect: { kind: "damage", dice: { count: 10, sides: 8 }, type: "fire", status: { id: "incendiary-cloud", label: "Burning Cloud", attackBonus: -2, expiresAtEndOfTurn: true } },
  aiCategory: "aoe-damage",
  description: "Persistent burning smoke. DEX save half and failed saves are hindered.",
});

spell("maddening-darkness", {
  name: "Maddening Darkness",
  level: 8,
  resource: action,
  range: { kind: "ranged", feet: 150 },
  target: "point",
  area: { shape: "circle", radiusFeet: 30 },
  save: { ability: "wis", halfDamage: true },
  ...concentration3,
  effect: { kind: "damage", dice: { count: 8, sides: 8 }, type: "psychic", status: { id: "maddening-darkness", label: "Maddened", attackBonus: -3, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "Persistent magical darkness. WIS save half for psychic damage and failed saves suffer a strong attack penalty.",
});

spell("maze", {
  name: "Maze",
  level: 8,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  duration: { kind: "rounds", rounds: 3 },
  effect: { kind: "status", status: { id: "maze", label: "Mazed", speedLocked: true, actionLocked: true, durationRounds: 3 } },
  aiCategory: "control-cluster",
  description: "No-save dimensional maze in the slim model: the target is removed from action for 3 rounds.",
});

spell("mind-blank", {
  name: "Mind Blank",
  level: 8,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "ally",
  duration: { kind: "hours", hours: 8 },
  effect: { kind: "status", status: { id: "mind-blank", label: "Mind Blank", resistances: ["psychic"], saveBonus: 5, durationHours: 8 } },
  aiCategory: "defensive-reaction",
  description: "Eight-hour mental ward. Ally resists psychic damage and gains major save support.",
});

spell("power-word-stun", {
  name: "Power Word Stun",
  level: 8,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  duration: { kind: "rounds", rounds: 1 },
  effect: { kind: "status", status: { id: "stunned", label: "Stunned", speedLocked: true, actionLocked: true, durationRounds: 1 } },
  aiCategory: "control-cluster",
  description: "No-save stun for 1 round in the slim model.",
});

spell("sunburst", {
  name: "Sunburst",
  level: 8,
  resource: action,
  range: { kind: "ranged", feet: 150 },
  target: "point",
  area: { shape: "circle", radiusFeet: 30 },
  save: { ability: "con", halfDamage: true },
  effect: { kind: "damage", dice: { count: 12, sides: 6 }, type: "radiant", status: { id: "blinded", label: "Blinded", attackBonus: -3, expiresAtEndOfTurn: true }, dispelsMagicalDarkness: true, dispelMaxSpellLevel: 3 },
  aiCategory: "aoe-damage",
  description: "Brilliant radiant burst for 12d6 radiant, CON save half; failed saves are blinded briefly and lower-level magical darkness is burned away.",
});

spell("tsunami", {
  name: "Tsunami",
  level: 8,
  resource: action,
  range: { kind: "ranged", feet: 150 },
  target: "point",
  area: { shape: "circle", radiusFeet: 30 },
  save: { ability: "str", halfDamage: true },
  ...concentration3,
  effect: {
    kind: "damage",
    dice: { count: 8, sides: 10 },
    type: "bludgeoning",
    status: { id: "tsunami", label: "Swept Away", speedLocked: true, attackBonus: -2, expiresAtEndOfTurn: true },
    forcedMovement: { mode: "push", distanceFeet: 30, on: "failedSave" },
  },
  aiCategory: "control-cluster",
  description: "Persistent crushing wave. STR save half; failed saves are swept 30 ft away, trapped, and hindered.",
});

spell("foresight", {
  name: "Foresight",
  level: 9,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "ally",
  duration: { kind: "hours", hours: 8 },
  effect: { kind: "status", status: { id: "foresight", label: "Foresight", attackAdvantage: true, acBonus: 3, saveBonus: 4, skillBonus: 4, durationHours: 8 } },
  aiCategory: "buff-opener",
  description: "Eight-hour prophetic edge. Ally gains advantage, defense, saves, and skill support.",
});

spell("mass-heal", {
  name: "Mass Heal",
  level: 9,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "ally",
  area: { shape: "circle", radiusFeet: 30 },
  effect: { kind: "healing", dice: { count: 12, sides: 8 }, abilityBonus: "spellcasting" },
  aiCategory: "efficient-heal",
  description: "Massive group heal for up to six allies, restoring 12d8 + spell stat HP each.",
});

spell("true-resurrection", {
  name: "True Resurrection",
  level: 9,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "corpse",
  effect: { kind: "revive", hpFraction: 1 },
  aiCategory: "revive",
  description: "At the graveyard, fully restore a dead companion regardless of decomposition in the current campaign model.",
});

spell("meteor-swarm", {
  name: "Meteor Swarm",
  level: 9,
  resource: action,
  range: { kind: "ranged", feet: 150 },
  target: "point",
  area: { shape: "circle", radiusFeet: 40 },
  save: { ability: "dex", halfDamage: true },
  effect: { kind: "damage", dice: { count: 20, sides: 6 }, type: "fire" },
  aiCategory: "aoe-damage",
  description: "Cataclysmic meteor impact for 20d6 fire/bludgeoning pressure, DEX save half.",
});

spell("power-word-heal", {
  name: "Power Word Heal",
  level: 9,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "ally",
  effect: { kind: "healing", dice: { count: 16, sides: 8 }, abilityBonus: "spellcasting" },
  aiCategory: "efficient-heal",
  description: "Overwhelming single-target heal for 16d8 + spell stat HP.",
});

spell("power-word-kill", {
  name: "Power Word Kill",
  level: 9,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "enemy",
  effect: { kind: "damage", dice: { count: 20, sides: 8 }, type: "necrotic" },
  aiCategory: "finish-target",
  description: "No-save execution word represented as massive necrotic damage.",
});

spell("prismatic-wall", {
  name: "Prismatic Wall",
  level: 9,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "point",
  area: { shape: "wall", lengthFeet: 90, widthFeet: 5, terrain: { shape: "wall", lengthFeet: 90, widthFeet: 5, blocksMovement: true, blocksLineOfSight: true } },
  save: { ability: "dex", halfDamage: true },
  duration: { kind: "rounds", rounds: 3 },
  effect: { kind: "damage", dice: { count: 12, sides: 8 }, type: "force", status: { id: "prismatic-wall", label: "Prismatic Wall", attackBonus: -3, speedBonusFeet: -20, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "Persistent prismatic wall. It blocks movement and sight, deals force damage, and severely hinders failed saves.",
});

spell("psychic-scream", {
  name: "Psychic Scream",
  level: 9,
  resource: action,
  range: { kind: "ranged", feet: 90 },
  target: "point",
  area: { shape: "circle", radiusFeet: 30 },
  save: { ability: "int", halfDamage: true },
  effect: { kind: "damage", dice: { count: 14, sides: 6 }, type: "psychic", status: { id: "stunned", label: "Stunned", speedLocked: true, actionLocked: true, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "INT save. Psychic damage and failed saves are stunned briefly.",
});

spell("storm-of-vengeance", {
  name: "Storm of Vengeance",
  level: 9,
  resource: action,
  range: { kind: "ranged", feet: 150 },
  target: "point",
  area: { shape: "circle", radiusFeet: 40 },
  save: { ability: "con", halfDamage: true },
  ...concentration3,
  effect: { kind: "damage", dice: { count: 10, sides: 10 }, type: "thunder", status: { id: "storm-of-vengeance", label: "Vengeful Storm", attackBonus: -3, speedBonusFeet: -20, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "Persistent apocalyptic storm. CON save half and failed saves are slowed and hindered.",
});

spell("weird", {
  name: "Weird",
  level: 9,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "point",
  area: { shape: "circle", radiusFeet: 30 },
  save: { ability: "wis", halfDamage: true },
  ...concentration3,
  effect: { kind: "damage", dice: { count: 8, sides: 10 }, type: "psychic", status: { id: "frightened", label: "Frightened", actionLocked: true, attackBonus: -3, expiresAtEndOfTurn: true } },
  aiCategory: "control-cluster",
  description: "Persistent nightmare zone. WIS save half and failed saves are frightened briefly.",
});

spell("find-familiar", {
  name: "Find Familiar",
  level: 1,
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  duration: { kind: "hours", hours: 8 },
  effect: { kind: "summon", summon: { profile: "familiar", name: "Familiar", count: 1, durationHours: 8 } },
  aiCategory: "summon",
  description: "Summon a fragile familiar actor that scouts, harasses, and follows you until it fades.",
});

spell("find-steed", {
  name: "Find Steed",
  level: 2,
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  duration: { kind: "hours", hours: 8 },
  effect: { kind: "summon", summon: { profile: "steed", name: "Steed", count: 1, durationHours: 8, hpPerCasterLevel: 2 } },
  aiCategory: "summon",
  description: "Summon a durable steed actor that fights beside you and follows closely.",
});

spell("animate-dead", {
  name: "Animate Dead",
  level: 3,
  resource: action,
  range: { kind: "ranged", feet: 30 },
  target: "point",
  duration: { kind: "hours", hours: 8 },
  effect: { kind: "summon", summon: { profile: "skeleton", name: "Animated Dead", count: 1, durationHours: 8 } },
  upcast: { targetsPerLevel: 1 },
  aiCategory: "summon",
  description: "Raise a skeletal ally at a point in range. Upcast support allows extra summoned actors when the spell is cast higher.",
});

spell("conjure-animals", {
  name: "Conjure Animals",
  level: 3,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "point",
  ...concentration3,
  effect: { kind: "summon", summon: { profile: "beast", name: "Conjured Beast", count: 2, durationRounds: 3 } },
  aiCategory: "summon",
  description: "Concentration, 3 rounds. Summon two beast actors near the chosen point.",
});

spell("conjure-minor-elementals", {
  name: "Conjure Minor Elementals",
  level: 4,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "point",
  ...concentration3,
  effect: { kind: "summon", summon: { profile: "elemental", name: "Minor Elemental", count: 2, durationRounds: 3 } },
  aiCategory: "summon",
  description: "Concentration, 3 rounds. Summon two minor elemental actors near the chosen point.",
});

spell("conjure-woodland-beings", {
  name: "Conjure Woodland Beings",
  level: 4,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "point",
  ...concentration3,
  effect: { kind: "summon", summon: { profile: "familiar", name: "Woodland Spirit", count: 2, durationRounds: 3, hpPerCasterLevel: 2 } },
  aiCategory: "summon",
  description: "Concentration, 3 rounds. Summon two small woodland spirit actors.",
});

spell("faithful-hound", {
  name: "Mordenkainen's Faithful Hound",
  level: 4,
  resource: action,
  range: { kind: "ranged", feet: 30 },
  target: "point",
  duration: { kind: "rounds", rounds: 6 },
  effect: { kind: "summon", summon: { profile: "hound", name: "Faithful Hound", count: 1, durationRounds: 6, hpPerCasterLevel: 2 } },
  aiCategory: "summon",
  description: "Summon a vigilant hound actor that guards the chosen area and attacks enemies.",
});

spell("animate-objects", {
  name: "Animate Objects",
  level: 5,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "point",
  ...concentration3,
  effect: { kind: "summon", summon: { profile: "object", name: "Animated Object", count: 3, durationRounds: 3 } },
  aiCategory: "summon",
  description: "Concentration, 3 rounds. Animate three object actors near the chosen point.",
});

spell("arcane-hand", {
  name: "Bigby's Hand",
  level: 5,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "point",
  ...concentration3,
  effect: { kind: "summon", summon: { profile: "arcaneHand", name: "Arcane Hand", count: 1, durationRounds: 3, hpPerCasterLevel: 3 } },
  aiCategory: "summon",
  description: "Concentration, 3 rounds. Summon a powerful arcane hand actor that brawls beside the party.",
});

spell("conjure-elemental", {
  name: "Conjure Elemental",
  level: 5,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "point",
  ...concentration3,
  effect: { kind: "summon", summon: { profile: "elemental", name: "Conjured Elemental", count: 1, durationRounds: 4, hpPerCasterLevel: 3 } },
  aiCategory: "summon",
  description: "Concentration, 4 rounds. Summon a stronger elemental actor near the chosen point.",
});

spell("simulacrum", {
  name: "Simulacrum",
  level: 7,
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  duration: { kind: "hours", hours: 8 },
  effect: { kind: "summon", summon: { profile: "simulacrum", name: "Simulacrum", count: 1, durationHours: 8 } },
  aiCategory: "summon",
  description: "Create a fragile actor-copy of the caster with reduced HP and a small spell point pool.",
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
  effect: {
    kind: "damage",
    dice: { count: 3, sides: 6 },
    type: "psychic",
    status: { id: "frightened", label: "Frightened", attackBonus: -2, expiresAtEndOfTurn: true },
    forcedMovement: { mode: "flee", distanceFeet: 30, on: "failedSave" },
  },
  upcast: { dicePerLevel: 1 },
  aiCategory: "control-cluster",
  description: "WIS save. 3d6 psychic, half on success; failed save also Frightens and makes the target flee 30 ft.",
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
  description: "Magical darkness creates heavy obscurement for 3 rounds. Daylight and similar bright magic can suppress lower-level darkness.",
});

spell("daylight", {
  name: "Daylight",
  level: 3,
  resource: action,
  range: { kind: "ranged", feet: 60 },
  target: "point",
  area: { shape: "circle", radiusFeet: 60 },
  duration: { kind: "hours", hours: 1 },
  effect: { kind: "light", dispelsMagicalDarkness: true, dispelMaxSpellLevel: 3 },
  lightSource: { brightRadiusFeet: 60, dimRadiusFeet: 120, magical: true, color: "#fff6c7", suppressesMagicalDarkness: true, dispelsMagicalDarkness: true, dispelMaxSpellLevel: 3 },
  aiCategory: "buff-opener",
  description: "Creates a 60 ft bright magical light that extends another 60 ft as dim light and suppresses lower-level magical darkness.",
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
  effect: { kind: "attackDamage", dice: { count: 1, sides: 6 }, type: "piercing", status: { id: "thorn-whipped", label: "Pulled", speedBonusFeet: -10, expiresAtEndOfTurn: true }, forcedMovement: { mode: "pull", distanceFeet: 10 } },
  description: "Cantrip. Spell attack for piercing damage, pulls the target 10 ft closer, and briefly slows it. Damage scales at levels 5, 11, and 17.",
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

spell("dancing-lights", {
  name: "Dancing Lights",
  level: 0,
  cost: 0,
  resource: action,
  range: { kind: "ranged", feet: 120 },
  target: "point",
  area: { shape: "circle", radiusFeet: 10 },
  ...concentration3,
  effect: { kind: "light" },
  lightSource: { brightRadiusFeet: 0, dimRadiusFeet: 10, magical: true, color: "#9ee7ff", cellsFromArea: true },
  description: "Cantrip. Create small moving lights that shed dim light in a nearby area while you concentrate.",
});

spell("druidcraft", {
  name: "Druidcraft",
  level: 0,
  cost: 0,
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  effect: { kind: "status", status: { id: "druidcraft", label: "Druidcraft", skillBonus: 2, durationRounds: 10 } },
  description: "Cantrip. Read subtle natural signs and nudge small plants or flames; gain a small exploration skill bonus.",
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

spell("light", {
  name: "Light",
  level: 0,
  cost: 0,
  resource: action,
  range: { kind: "touch", feet: 5 },
  target: "ally",
  duration: { kind: "hours", hours: 1 },
  effect: { kind: "status", status: { id: "light", label: "Light", dismissible: true, lightSource: { brightRadiusFeet: 20, dimRadiusFeet: 40, magical: true, color: "#ffe8a3" }, durationHours: 1 } },
  description: "Cantrip. Enchant an ally's carried object with bright light for 20 ft and dim light for another 20 ft.",
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

spell("true-strike", {
  name: "True Strike",
  level: 0,
  cost: 0,
  resource: action,
  range: { kind: "self", feet: 0 },
  target: "self",
  effect: { kind: "status", status: { id: "true-strike", label: "True Strike", attackAdvantage: true, durationRounds: 2 } },
  description: "Cantrip. Study the fight and gain advantage on your next attack before the focus fades.",
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
  dispel_magic: "dispel-magic",
  chaos_bolt: "chaos-bolt",
  color_spray: "color-spray",
  earth_tremor: "earth-tremor",
  expeditious_retreat: "expeditious-retreat",
  false_life: "false-life",
  ice_knife: "ice-knife",
  find_familiar: "find-familiar",
  searing_smite: "searing-smite",
  zephyr_strike: "zephyr-strike",
  acid_arrow: "acid-arrow",
  aganazzars_scorcher: "aganazzars-scorcher",
  alter_self: "alter-self",
  blindness_deafness: "blindness-deafness",
  calm_emotions: "calm-emotions",
  cloud_of_daggers: "cloud-of-daggers",
  crown_of_madness: "crown-of-madness",
  dust_devil: "dust-devil",
  enhance_ability: "enhance-ability",
  enlarge_reduce: "enlarge-reduce",
  find_steed: "find-steed",
  flame_blade: "flame-blade",
  flaming_sphere: "flaming-sphere",
  gust_of_wind: "gust-of-wind",
  magic_weapon: "magic-weapon",
  maximilians_earthen_grasp: "maximilians-earthen-grasp",
  phantasmal_force: "phantasmal-force",
  prayer_of_healing: "prayer-of-healing",
  gentle_repose: "gentle-repose",
  lesser_restoration: "lesser-restoration",
  protection_from_poison: "protection-from-poison",
  ray_of_enfeeblement: "ray-of-enfeeblement",
  shadow_blade: "shadow-blade",
  snillocs_snowball_swarm: "snillocs-snowball-swarm",
  warding_bond: "warding-bond",
  warding_wind: "warding-wind",
  aura_of_vitality: "aura-of-vitality",
  beacon_of_hope: "beacon-of-hope",
  bestow_curse: "bestow-curse",
  blinding_smite: "blinding-smite",
  conjure_barrage: "conjure-barrage",
  crusaders_mantle: "crusaders-mantle",
  elemental_weapon: "elemental-weapon",
  enemies_abound: "enemies-abound",
  erupting_earth: "erupting-earth",
  flame_arrows: "flame-arrows",
  gaseous_form: "gaseous-form",
  lightning_arrow: "lightning-arrow",
  melfs_minute_meteors: "melfs-minute-meteors",
  plant_growth: "plant-growth",
  protection_from_energy: "protection-from-energy",
  sleet_storm: "sleet-storm",
  stinking_cloud: "stinking-cloud",
  thunder_step: "thunder-step",
  tidal_wave: "tidal-wave",
  wall_of_sand: "wall-of-sand",
  wall_of_water: "wall-of-water",
  wind_wall: "wind-wall",
  animate_dead: "animate-dead",
  conjure_animals: "conjure-animals",
  raise_dead: "raise-dead",
  aura_of_life: "aura-of-life",
  aura_of_purity: "aura-of-purity",
  black_tentacles: "black-tentacles",
  conjure_minor_elementals: "conjure-minor-elementals",
  conjure_woodland_beings: "conjure-woodland-beings",
  charm_monster: "charm-monster",
  death_ward: "death-ward",
  dimension_door: "dimension-door",
  dominate_beast: "dominate-beast",
  elemental_bane: "elemental-bane",
  faithful_hound: "faithful-hound",
  fire_shield: "fire-shield",
  freedom_of_movement: "freedom-of-movement",
  grasping_vine: "grasping-vine",
  greater_invisibility: "greater-invisibility",
  guardian_of_faith: "guardian-of-faith",
  guardian_of_nature: "guardian-of-nature",
  ice_storm: "ice-storm",
  phantasmal_killer: "phantasmal-killer",
  resilient_sphere: "resilient-sphere",
  shadow_of_moil: "shadow-of-moil",
  sickening_radiance: "sickening-radiance",
  staggering_smite: "staggering-smite",
  storm_sphere: "storm-sphere",
  vitriolic_sphere: "vitriolic-sphere",
  wall_of_fire: "wall-of-fire",
  watery_sphere: "watery-sphere",
  antilife_shell: "antilife-shell",
  banishing_smite: "banishing-smite",
  circle_of_power: "circle-of-power",
  animate_objects: "animate-objects",
  arcane_hand: "arcane-hand",
  cone_of_cold: "cone-of-cold",
  conjure_volley: "conjure-volley",
  conjure_elemental: "conjure-elemental",
  destructive_wave: "destructive-wave",
  dispel_evil_and_good: "dispel-evil-and-good",
  dominate_person: "dominate-person",
  far_step: "far-step",
  flame_strike: "flame-strike",
  hold_monster: "hold-monster",
  insect_plague: "insect-plague",
  mass_cure_wounds: "mass-cure-wounds",
  greater_restoration: "greater-restoration",
  negative_energy_flood: "negative-energy-flood",
  skill_empowerment: "skill-empowerment",
  steel_wind_strike: "steel-wind-strike",
  swift_quiver: "swift-quiver",
  synaptic_static: "synaptic-static",
  transmute_rock: "transmute-rock",
  wrath_of_nature: "wrath-of-nature",
  blade_barrier: "blade-barrier",
  chain_lightning: "chain-lightning",
  circle_of_death: "circle-of-death",
  flesh_to_stone: "flesh-to-stone",
  freezing_sphere: "freezing-sphere",
  globe_of_invulnerability: "globe-of-invulnerability",
  heroes_feast: "heroes-feast",
  investiture_of_flame: "investiture-of-flame",
  investiture_of_ice: "investiture-of-ice",
  investiture_of_stone: "investiture-of-stone",
  investiture_of_wind: "investiture-of-wind",
  irresistible_dance: "irresistible-dance",
  mental_prison: "mental-prison",
  primordial_ward: "primordial-ward",
  see_invisibility: "see-invisibility",
  true_seeing: "true-seeing",
  wall_of_ice: "wall-of-ice",
  wall_of_thorns: "wall-of-thorns",
  arcane_sword: "arcane-sword",
  crown_of_stars: "crown-of-stars",
  delayed_blast_fireball: "delayed-blast-fireball",
  divine_word: "divine-word",
  finger_of_death: "finger-of-death",
  fire_storm: "fire-storm",
  power_word_pain: "power-word-pain",
  prismatic_spray: "prismatic-spray",
  true_resurrection: "true-resurrection",
  reverse_gravity: "reverse-gravity",
  horrid_wilting: "horrid-wilting",
  antimagic_field: "antimagic-field",
  dominate_monster: "dominate-monster",
  holy_aura: "holy-aura",
  incendiary_cloud: "incendiary-cloud",
  maddening_darkness: "maddening-darkness",
  mind_blank: "mind-blank",
  power_word_stun: "power-word-stun",
  mass_heal: "mass-heal",
  meteor_swarm: "meteor-swarm",
  power_word_heal: "power-word-heal",
  power_word_kill: "power-word-kill",
  prismatic_wall: "prismatic-wall",
  psychic_scream: "psychic-scream",
  storm_of_vengeance: "storm-of-vengeance",
};

for (const [alias, sourceId] of Object.entries(spellAliases)) {
  const source = window.DungeonContent.get("spells", sourceId);
  if (source) window.DungeonContent.register("spells", alias, { ...source, id: alias, aliasOf: sourceId });
}
})();
