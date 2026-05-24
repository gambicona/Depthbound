(() => {
const fullCasterSpellPoints = { 1: 4, 2: 6, 3: 14, 4: 17, 5: 27, 6: 32, 7: 38, 8: 44, 9: 57, 10: 64, 11: 73, 12: 73, 13: 83, 14: 83, 15: 94, 16: 94, 17: 107, 18: 114, 19: 123, 20: 133 };

window.DungeonContent.register("classes", "bard", {
  name: "Silver Tongue",
  className: "Bard",
  classId: "bard",
  classRole: "bard",
  casterType: "full",
  role: "Level 1 Bard",
  level: 1,
  xp: 0,
  hitDie: 8,
  maxHp: 10,
  abilityMods: { str: 0, dex: 3, con: 2, cha: 3 },
  baseAc: 10,
  attackBonus: 5,
  damage: { count: 1, sides: 6, bonus: 3, type: "piercing", label: "1d6 + 3 piercing" },
  initiativeBonus: 3,
  speedFeet: 30,
  armorProficiencies: ["light"],
  weaponProficiencies: ["simple", "crossbow-hand", "longsword", "rapier", "shortsword"],
  spellcastingAbility: "cha",
  spellPointProgression: fullCasterSpellPoints,
  spellList: ["healing_word", "dissonant_whispers", "faerie_fire", "heroism", "hideous_laughter", "earth-tremor", "blindness-deafness", "calm-emotions", "cloud-of-daggers", "crown-of-madness", "enhance-ability", "phantasmal-force", "warding-wind", "bestow-curse", "enemies-abound", "fear", "plant-growth", "stinking-cloud", "charm-monster", "compulsion", "confusion", "dimension-door", "freedom-of-movement", "greater-invisibility", "animate-objects", "dominate-person", "hold-monster", "mass-cure-wounds", "skill-empowerment", "synaptic-static", "eyebite", "irresistible-dance", "true-seeing", "arcane-sword", "etherealness", "forcecage", "regenerate", "symbol", "dominate-monster", "feeblemind", "mind-blank", "power-word-stun", "foresight", "power-word-heal", "power-word-kill", "psychic-scream", "heat_metal", "hold_person", "shatter", "hypnotic_pattern", "dispel_magic", "mass_healing_word"],
  cantripList: ["vicious-mockery", "mage-hand", "blade-ward", "thunderclap", "true-strike"],
  spells: [],
  token: "B",
  classFeatures: [
    { level: 1, name: "Bardic Inspiration", description: "Use music or words to give an ally a scaling die for a missed attack or failed save." },
    { level: 2, name: "Jack of All Trades", description: "Add half your proficiency bonus to skill checks where you are not proficient." },
    { level: 3, name: "Expertise", description: "Choose two skill proficiencies to double your proficiency bonus." },
    { level: 5, name: "Font of Inspiration", description: "Your Bardic Inspiration refreshes on a short or long rest." },
    { level: 10, name: "Expertise", description: "Choose two more skill proficiencies to master." },
  ],
  abilities: [
    { id: "bardicInspiration", name: "Bardic Inspiration", level: 1, refresh: "longRest", uses: 3, resourcePool: "bardicInspiration", resource: "bonusAction", description: "Give a hero an inspiration die they can add to a missed attack or failed save. The die grows at bard levels 5, 10, and 15." },
  ],
  equipment: { mainHand: "rapier", torso: "leather" },
  inventory: { money: { cp: 0, sp: 0, gp: 0 }, items: ["rapier", "leather"] },
  startingGear: {
    equipment: { torso: "leather" },
    inventory: ["leather"],
    steps: [
      {
        title: "Starting Weapon",
        message: "Choose your bard weapon.",
        choices: [
          { value: "rapier", label: "Rapier", equipment: { mainHand: "rapier" }, inventory: ["rapier"] },
          { value: "longsword", label: "Longsword", equipment: { mainHand: "longsword" }, inventory: ["longsword"] },
          {
            value: "simple",
            label: "Any simple weapon",
            select: { pool: "simpleWeapons", title: "Choose Simple Weapon", message: "Select a simple weapon.", label: "Weapon", slot: "mainHand" },
          },
        ],
      },
    ],
  },
});
})();
