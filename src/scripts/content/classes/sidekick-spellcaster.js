(() => {
const sidekickSpellPoints = {
  1: 4, 2: 4, 3: 6, 4: 6, 5: 14, 6: 14, 7: 17, 8: 17, 9: 27, 10: 27,
  11: 31, 12: 31, 13: 36, 14: 36, 15: 39, 16: 39, 17: 44, 18: 44, 19: 47, 20: 47,
};

window.DungeonContent.register("classes", "sidekick-spellcaster", {
  hidden: true,
  sidekickOnly: true,
  name: "Spellcaster Sidekick",
  className: "Spellcaster Sidekick",
  classId: "sidekick-spellcaster",
  classRole: "spellcaster",
  casterType: "sidekick",
  role: "Level 1 Spellcaster Sidekick",
  level: 1,
  xp: 0,
  hitDie: 6,
  maxHp: 6,
  abilityMods: { int: 2, wis: 2, cha: 2 },
  baseAc: 10,
  attackBonus: 3,
  damage: { count: 1, sides: 4, bonus: 1, type: "bludgeoning", label: "1d4 + 1 bludgeoning" },
  initiativeBonus: 1,
  speedFeet: 30,
  armorProficiencies: ["light"],
  weaponProficiencies: [],
  savingThrowProficiencies: ["wis"],
  skillProficiencies: [],
  spellPointProgression: sidekickSpellPoints,
  classCantripList: [],
  classSpellList: [],
  spells: [],
  token: "S",
  classFeatures: [
    { level: 1, name: "Bonus Proficiencies", description: "The sidekick gains save, skill, armor, and sometimes weapon training." },
    { level: 1, name: "Spellcasting", description: "Choose Mage, Healer, or Prodigy to determine spell list and spellcasting ability." },
    { level: 6, name: "Potent Cantrips", description: "Add spellcasting ability modifier to cantrip damage." },
    { level: 14, name: "Empowered Spells", description: "Choose a school of magic to empower slot spell damage or healing." },
    { level: 20, name: "Focused Casting", description: "Damage cannot break concentration." },
  ],
  abilities: [],
  equipment: {},
  inventory: {
    money: { cp: 0, sp: 0, gp: 0 },
    items: [],
  },
});
})();
