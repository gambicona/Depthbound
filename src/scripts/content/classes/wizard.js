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
  spellList: ["magic_missile", "shield", "burning_hands", "sleep", "grease", "scorching_ray", "web", "misty_step", "fireball", "haste"],
  cantripList: ["mage-hand", "blade-ward", "fire-bolt", "mind-sliver", "thunderclap", "chill-touch", "acid-splash", "booming-blade", "frostbite", "green-flame-blade", "ray-of-frost", "shocking-grasp", "toll-the-dead"],
  spells: [],
  token: "W",
  classFeatures: [
    { level: 1, name: "Spellcasting", description: "You can shape class magic into prepared or known spells." },
    { level: 1, name: "Spellbook", description: "Keep wizard spells in a written book and expand them over time." },
    { level: 1, name: "Arcane Recovery", description: "Recover some spent magical energy after a short rest." },
    { level: 18, name: "Spell Mastery", description: "Cast chosen low-level wizard spells without spending resources." },
    { level: 20, name: "Signature Spells", description: "Choose favored spells that are always ready and easier to cast." },
  ],
  abilities: [
    { id: "arcaneRecovery", name: "Arcane Recovery", level: 1, refresh: "longRest", uses: 1, resourcePool: "arcaneRecovery", resource: "none", description: "Recover spell points equal to half wizard level, rounded up." },
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
