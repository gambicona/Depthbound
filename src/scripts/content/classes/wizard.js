(() => {
const fullCasterSpellPoints = { 1: 4, 2: 6, 3: 14, 4: 17, 5: 27, 6: 32, 7: 38, 8: 44, 9: 57, 10: 64, 11: 73, 12: 73, 13: 83, 14: 83, 15: 94, 16: 94, 17: 107, 18: 114, 19: 123, 20: 133 };

window.DungeonContent.register("classes", "wizard", {
  name: "Rune Scholar",
  className: "Wizard",
  classId: "wizard",
  classRole: "wizard",
  casterType: "full",
  role: "Level 1 Wizard",
  level: 1,
  xp: 0,
  hitDie: 6,
  maxHp: 8,
  abilityMods: { str: -1, dex: 2, con: 2, int: 3 },
  baseAc: 10,
  attackBonus: 5,
  damage: { count: 1, sides: 6, bonus: 2, type: "bludgeoning", label: "1d6 + 2 bludgeoning" },
  initiativeBonus: 2,
  speedFeet: 30,
  armorProficiencies: [],
  weaponProficiencies: ["dagger", "dart", "sling", "quarterstaff", "crossbow-light"],
  spellcastingAbility: "int",
  spellPointProgression: fullCasterSpellPoints,
  spellList: ["magic_missile", "shield", "burning_hands", "sleep", "grease", "catapult", "color-spray", "earth-tremor", "expeditious-retreat", "false-life", "find-familiar", "ice-knife", "acid-arrow", "aganazzars-scorcher", "alter-self", "blindness-deafness", "blur", "cloud-of-daggers", "crown-of-madness", "earthbind", "enlarge-reduce", "flaming-sphere", "gust-of-wind", "magic-weapon", "maximilians-earthen-grasp", "ray-of-enfeeblement", "shadow-blade", "snillocs-snowball-swarm", "animate-dead", "bestow-curse", "blink", "enemies-abound", "erupting-earth", "flame-arrows", "gaseous-form", "melfs-minute-meteors", "plant-growth", "protection-from-energy", "sleet-storm", "slow", "stinking-cloud", "thunder-step", "wall-of-sand", "wall-of-water", "banishment", "black-tentacles", "blight", "charm-monster", "confusion", "conjure-minor-elementals", "dimension-door", "elemental-bane", "faithful-hound", "fire-shield", "greater-invisibility", "ice-storm", "phantasmal-killer", "resilient-sphere", "sickening-radiance", "stoneskin", "storm-sphere", "vitriolic-sphere", "wall-of-fire", "watery-sphere", "animate-objects", "arcane-hand", "cloudkill", "conjure-elemental", "cone-of-cold", "dawn", "dominate-person", "enervation", "far-step", "hold-monster", "immolation", "negative-energy-flood", "skill-empowerment", "steel-wind-strike", "synaptic-static", "telekinesis", "transmute-rock", "chain-lightning", "circle-of-death", "disintegrate", "eyebite", "flesh-to-stone", "freezing-sphere", "globe-of-invulnerability", "investiture-of-flame", "investiture-of-ice", "investiture-of-stone", "investiture-of-wind", "irresistible-dance", "mental-prison", "sunbeam", "true-seeing", "wall-of-ice", "arcane-sword", "crown-of-stars", "delayed-blast-fireball", "etherealness", "finger-of-death", "forcecage", "power-word-pain", "prismatic-spray", "reverse-gravity", "simulacrum", "symbol", "whirlwind", "horrid-wilting", "antimagic-field", "dominate-monster", "feeblemind", "incendiary-cloud", "maddening-darkness", "maze", "mind-blank", "power-word-stun", "sunburst", "foresight", "meteor-swarm", "power-word-kill", "prismatic-wall", "psychic-scream", "weird", "scorching_ray", "web", "misty_step", "fireball", "haste", "fly", "dispel_magic"],
  cantripList: ["mage-hand", "blade-ward", "fire-bolt", "mind-sliver", "thunderclap", "chill-touch", "acid-splash", "booming-blade", "frostbite", "green-flame-blade", "ray-of-frost", "shocking-grasp", "toll-the-dead", "true-strike"],
  spells: [],
  token: "W",
  classFeatures: [
    { level: 1, name: "Spellcasting", description: "You can shape class magic into prepared or known spells." },
    { level: 1, name: "Arcane Recovery", description: "Recover some spent magical energy after a short rest." },
    { level: 18, name: "Spell Mastery", description: "Once per short rest, recover 4 spell points to represent free low-level spell mastery." },
    { level: 20, name: "Signature Spells", description: "Once per long rest, recover 10 spell points for your favored high-level wizard magic." },
  ],
  abilities: [
    { id: "arcaneRecovery", name: "Arcane Recovery", level: 1, refresh: "longRest", uses: 1, resourcePool: "arcaneRecovery", resource: "none", description: "Recover spell points equal to half wizard level, rounded up." },
    { id: "spellMastery", name: "Spell Mastery", level: 18, refresh: "shortRest", uses: 1, resource: "none", description: "Recover 4 spell points once per short rest for your mastered low-level magic." },
    { id: "signatureSpells", name: "Signature Spells", level: 20, refresh: "longRest", uses: 1, resource: "none", description: "Recover 10 spell points once per long rest for your signature wizard spells." },
  ],
  equipment: { mainHand: "quarterstaff", torso: null },
  inventory: { money: { cp: 0, sp: 0, gp: 0 }, items: ["quarterstaff"] },
  startingGear: {
    steps: [
      {
        title: "Starting Weapon",
        message: "Choose your wizard weapon.",
        choices: [
          { value: "quarterstaff", label: "Quarterstaff", equipment: { mainHand: "quarterstaff" }, inventory: ["quarterstaff"] },
          { value: "dagger", label: "Dagger", equipment: { mainHand: "dagger" }, inventory: ["dagger"] },
        ],
      },
    ],
  },
});
})();
