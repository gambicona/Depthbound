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
  armorProficiencies: ["light", "medium", "shield"],
  weaponProficiencies: ["club", "dagger", "dart", "javelin", "mace", "quarterstaff", "scimitar", "sickle", "sling", "spear"],
  spellcastingAbility: "wis",
  spellPointProgression: fullCasterSpellPoints,
  spellList: ["cure_wounds", "healing_word", "entangle", "faerie_fire", "thunderwave", "barkskin", "heat_metal", "moonbeam", "spike_growth", "call_lightning"],
  cantripList: ["guidance", "produce-flame", "thorn-whip", "thunderclap", "frostbite", "poison-spray", "primal-savagery", "resistance", "shillelagh"],
  spells: [],
  token: "D",
  classFeatures: [
    { level: 1, name: "Spellcasting" },
    { level: 2, name: "Wild Shape" },
    { level: 18, name: "Beast Spells" },
  ],
  abilities: [
    { id: "wildShape", name: "Wild Shape", level: 2, refresh: "shortRest", uses: 2, resourcePool: "wildShape", resource: "bonusAction", description: "Take a combat beast stance for temporary HP and melee pressure." },
  ],
  equipment: { mainHand: "quarterstaff", offHand: "shield", torso: "leather" },
  inventory: { money: { cp: 0, sp: 0, gp: 0 }, items: ["quarterstaff", "shield", "leather"] },
  startingGear: {
    equipment: { torso: "leather" },
    inventory: ["leather"],
    steps: [
      {
        title: "Shield or Weapon",
        message: "Choose your first druid item.",
        choices: [
          { value: "wooden-shield", label: "Wooden Shield", equipment: { offHand: "shield" }, inventory: ["shield"] },
          {
            value: "simple",
            label: "Any simple weapon",
            select: { pool: "simpleWeapons", title: "Choose Simple Weapon", message: "Select a simple weapon.", label: "Weapon", slot: "mainHand" },
          },
        ],
      },
      {
        title: "Melee Weapon",
        message: "Choose your druid melee weapon.",
        choices: [
          { value: "scimitar", label: "Scimitar", equipment: { mainHand: "scimitar" }, inventory: ["scimitar"] },
          {
            value: "simple-melee",
            label: "Any simple melee weapon",
            select: { pool: "simpleMeleeWeapons", title: "Choose Simple Melee Weapon", message: "Select a simple melee weapon.", label: "Weapon", slot: "mainHand" },
          },
        ],
      },
    ],
  },
});
})();
