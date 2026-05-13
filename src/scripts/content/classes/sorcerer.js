(() => {
const fullCasterSpellPoints = { 1: 4, 2: 6, 3: 14, 4: 17, 5: 27, 6: 32, 7: 38, 8: 44, 9: 57, 10: 64, 11: 73, 12: 73, 13: 83, 14: 83, 15: 94, 16: 94, 17: 107, 18: 114, 19: 123, 20: 133 };

window.DungeonContent.register("classes", "sorcerer", {
  name: "Wild Spark",
  className: "Sorcerer",
  classId: "sorcerer",
  classRole: "sorcerer",
  casterType: "full",
  role: "Level 1 Sorcerer",
  level: 1,
  xp: 0,
  hitDie: 6,
  maxHp: 8,
  abilityMods: { str: -1, dex: 2, con: 2, cha: 3 },
  baseAc: 10,
  attackBonus: 5,
  damage: { count: 1, sides: 6, bonus: 2, type: "bludgeoning", label: "1d6 + 2 bludgeoning" },
  initiativeBonus: 2,
  speedFeet: 30,
  spellcastingAbility: "cha",
  spellPointProgression: fullCasterSpellPoints,
  spellList: ["magic_missile", "shield", "mage_armor", "burning_hands", "thunderwave", "scorching_ray", "mirror_image", "misty_step", "fireball", "lightning_bolt"],
  spells: [],
  token: "S",
  classFeatures: [
    { level: 1, name: "Spellcasting" },
    { level: 2, name: "Font of Magic" },
    { level: 3, name: "Metamagic" },
  ],
  abilities: [
    { id: "empoweredSpell", name: "Empowered Spell", level: 3, refresh: "longRest", uses: 3, usesByLevel: [{ level: 6, uses: 6 }, { level: 12, uses: 12 }, { level: 20, uses: 20 }], resource: "bonusAction", description: "Empower the next spell or attack with raw arcane force." },
  ],
  equipment: { mainHand: "quarterstaff", torso: null },
  inventory: { money: { cp: 0, sp: 0, gp: 0 }, items: ["quarterstaff"] },
  startingGear: { fixed: true, equipment: { mainHand: "quarterstaff", torso: null }, inventory: ["quarterstaff"] },
});
})();
