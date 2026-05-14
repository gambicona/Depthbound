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
  spellList: ["healing_word", "dissonant_whispers", "faerie_fire", "heroism", "hideous_laughter", "heat_metal", "hold_person", "shatter", "hypnotic_pattern", "mass_healing_word"],
  cantripList: ["vicious-mockery", "mage-hand", "blade-ward", "thunderclap"],
  spells: [],
  token: "B",
  classFeatures: [
    { level: 1, name: "Bardic Inspiration" },
    { level: 2, name: "Jack of All Trades" },
    { level: 5, name: "Font of Inspiration" },
  ],
  abilities: [
    { id: "bardicInspiration", name: "Bardic Inspiration", level: 1, refresh: "longRest", uses: 3, resourcePool: "bardicInspiration", resource: "bonusAction", description: "Give a hero an inspiration die they can add to a missed attack or save." },
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
