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
  spellcastingAbility: "int",
  spellPointProgression: fullCasterSpellPoints,
  spellList: ["magic_missile", "shield", "burning_hands", "sleep", "grease", "scorching_ray", "web", "misty_step", "fireball", "haste"],
  spells: [],
  token: "W",
  classFeatures: [
    { level: 1, name: "Spellcasting" },
    { level: 1, name: "Spellbook" },
    { level: 1, name: "Arcane Recovery" },
    { level: 18, name: "Spell Mastery" },
    { level: 20, name: "Signature Spells" },
  ],
  abilities: [
    { id: "arcaneRecovery", name: "Arcane Recovery", level: 1, refresh: "longRest", uses: 1, resource: "none", description: "Recover spell points equal to half wizard level, rounded up." },
  ],
  equipment: { mainHand: "quarterstaff", torso: null },
  inventory: { money: { cp: 0, sp: 0, gp: 0 }, items: ["quarterstaff"] },
  startingGear: { fixed: true, equipment: { mainHand: "quarterstaff", torso: null }, inventory: ["quarterstaff"] },
});
})();
