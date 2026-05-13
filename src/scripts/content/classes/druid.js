(() => {
const fullCasterSpellPoints = { 1: 4, 2: 6, 3: 14, 4: 17, 5: 27, 6: 32, 7: 38, 8: 44, 9: 57, 10: 64, 11: 73, 12: 73, 13: 83, 14: 83, 15: 94, 16: 94, 17: 107, 18: 114, 19: 123, 20: 133 };

window.DungeonContent.register("classes", "druid", {
  name: "Greenwarden",
  className: "Druid",
  classId: "druid",
  classRole: "druid",
  casterType: "full",
  role: "Level 1 Druid",
  level: 1,
  xp: 0,
  hitDie: 8,
  maxHp: 10,
  abilityMods: { str: 0, dex: 2, con: 2, wis: 3 },
  baseAc: 10,
  attackBonus: 5,
  damage: { count: 1, sides: 6, bonus: 2, type: "bludgeoning", label: "1d6 + 2 bludgeoning" },
  initiativeBonus: 2,
  speedFeet: 30,
  spellcastingAbility: "wis",
  spellPointProgression: fullCasterSpellPoints,
  spellList: ["cure_wounds", "healing_word", "entangle", "faerie_fire", "thunderwave", "barkskin", "heat_metal", "moonbeam", "spike_growth", "call_lightning"],
  spells: [],
  token: "D",
  classFeatures: [
    { level: 1, name: "Spellcasting" },
    { level: 2, name: "Wild Shape" },
    { level: 18, name: "Beast Spells" },
  ],
  abilities: [
    { id: "wildShape", name: "Wild Shape", level: 2, refresh: "shortRest", uses: 2, resource: "bonusAction", description: "Take a combat beast stance for temporary HP and melee pressure." },
  ],
  equipment: { mainHand: "quarterstaff", offHand: "shield", torso: "leather" },
  inventory: { money: { cp: 0, sp: 0, gp: 0 }, items: ["quarterstaff", "shield", "leather"] },
  startingGear: { fixed: true, equipment: { mainHand: "quarterstaff", offHand: "shield", torso: "leather" }, inventory: ["quarterstaff", "shield", "leather"] },
});
})();
