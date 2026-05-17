(() => {
window.DungeonContent.register("classes", "monk", {
  name: "Open Hand Adept",
  className: "Monk",
  classId: "monk",
  classRole: "monk",
  casterType: "none",
  role: "Level 1 Monk",
  level: 1,
  xp: 0,
  hitDie: 8,
  maxHp: 10,
  abilityMods: { str: 1, dex: 2, con: 1, wis: 2 },
  baseAc: 10,
  attackBonus: 4,
  damage: { count: 1, sides: 6, bonus: 2, type: "bludgeoning", label: "1d6 + 2 bludgeoning" },
  initiativeBonus: 2,
  speedFeet: 30,
  armorProficiencies: [],
  weaponProficiencies: ["simple", "shortsword"],
  token: "K",
  classFeatures: [
    { level: 1, name: "Martial Arts", description: "Your unarmed strikes use a Martial Arts die that grows from d4 to d10 as you level." },
    { level: 2, name: "Ki", description: "Spend ki equal to your monk level on special martial techniques, refreshing on a short or long rest." },
    { level: 2, name: "Unarmored Movement", description: "Move faster while unarmored and unshielded; the speed bonus grows as you level." },
    { level: 5, name: "Extra Attack", description: "Attack more than once when you take the Attack action." },
    { level: 5, name: "Stunning Strike", description: "Spend 1 ki before an attack. Your next hit can briefly stun the target, locking its next action." },
    { level: 20, name: "Perfect Self", description: "When combat begins and you have no ki left, recover 4 ki." },
  ],
  abilities: [
    { id: "flurryOfBlows", name: "Flurry of Blows", level: 2, refresh: "shortRest", uses: 2, resourcePool: "ki", resource: "bonusAction", description: "Spend 1 ki to make a quick unarmed strike." },
    { id: "patientDefense", name: "Patient Defense", level: 2, refresh: "shortRest", uses: 2, resourcePool: "ki", resource: "bonusAction", description: "Spend 1 ki to Dodge as a quick action." },
    { id: "stunningStrike", name: "Stunning Strike", level: 5, refresh: "shortRest", uses: 5, resourcePool: "ki", resource: "bonusAction", description: "Spend 1 ki to charge your next hit. If it lands, the enemy is stunned until the end of its next turn." },
  ],
  equipment: { mainHand: "shortsword", torso: null },
  inventory: { money: { cp: 0, sp: 0, gp: 0 }, items: ["shortsword", "dart"] },
  startingGear: {
    inventory: ["dart"],
    steps: [
      {
        title: "Starting Weapon",
        message: "Choose your monk weapon.",
        choices: [
          { value: "shortsword", label: "Shortsword", equipment: { mainHand: "shortsword" }, inventory: ["shortsword"] },
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
