(() => {
window.DungeonContent.register("classes", "barbarian", {
  name: "Stonebreaker",
  className: "Barbarian",
  classId: "barbarian",
  classRole: "barbarian",
  casterType: "none",
  role: "Level 1 Barbarian",
  level: 1,
  xp: 0,
  hitDie: 12,
  maxHp: 14,
  abilityMods: { str: 2, dex: 1, con: 2, wis: 1 },
  baseAc: 10,
  attackBonus: 4,
  damage: { count: 1, sides: 12, bonus: 2, type: "slashing", label: "1d12 + 2 slashing" },
  initiativeBonus: 1,
  speedFeet: 30,
  armorProficiencies: ["light", "medium", "shield"],
  weaponProficiencies: ["simple", "martial"],
  token: "B",
  classFeatures: [
    { level: 1, name: "Rage", description: "Enter a battle fury that hardens you against harm and strengthens your melee blows." },
    { level: 1, name: "Unarmored Defense", description: "While not wearing armor, your toughness and reflexes help protect you." },
    { level: 2, name: "Reckless Attack", description: "Trade defense for offense, striking with abandon to improve your attacks." },
    { level: 5, name: "Extra Attack", description: "Attack more than once when you take the Attack action." },
    { level: 5, name: "Fast Movement", description: "Your speed increases while you are not wearing heavy armor." },
    { level: 20, name: "Primal Champion", description: "Your physical might reaches legendary heights." },
  ],
  abilities: [
    { id: "rage", name: "Rage", level: 1, refresh: "longRest", uses: 2, usesByLevel: [{ level: 3, uses: 3 }, { level: 6, uses: 4 }, { level: 12, uses: 5 }, { level: 17, uses: 6 }, { level: 20, uses: 99 }], resource: "bonusAction", description: "Enter Rage: gain physical toughness and melee damage for the encounter. Cannot be used in heavy armor." },
    { id: "recklessAttack", name: "Reckless Attack", level: 2, refresh: "turn", uses: 1, resource: "none", description: "Fight recklessly for better offense but worse defense." },
  ],
  equipment: { mainHand: "greataxe", torso: null },
  inventory: { money: { cp: 0, sp: 0, gp: 0 }, items: ["greataxe", "javelin", "javelin", "javelin", "javelin"] },
  startingGear: {
    steps: [
      {
        title: "Starting Weapon",
        message: "Choose your primary barbarian weapon.",
        choices: [
          { value: "greataxe", label: "Greataxe", equipment: { mainHand: "greataxe" }, inventory: ["greataxe"] },
          {
            value: "martial-melee",
            label: "Any martial melee weapon",
            select: { pool: "martialMeleeWeapons", title: "Choose Martial Melee Weapon", message: "Select a martial melee weapon.", label: "Weapon", slot: "mainHand" },
          },
        ],
      },
      {
        title: "Secondary Weapons",
        message: "Choose your additional barbarian weapons.",
        choices: [
          { value: "handaxes", label: "Two Handaxes", inventory: ["handaxe", "handaxe"] },
          {
            value: "simple",
            label: "Any simple weapon",
            select: { pool: "simpleWeapons", title: "Choose Simple Weapon", message: "Select a simple weapon.", label: "Weapon", slot: "" },
          },
        ],
      },
    ],
  },
});
})();
