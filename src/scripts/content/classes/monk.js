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
    { level: 1, name: "Martial Arts", description: "Fight effectively with unarmed strikes and monk weapons." },
    { level: 2, name: "Ki", description: "Spend inner energy on special martial techniques." },
    { level: 2, name: "Unarmored Movement", description: "Move faster while unarmored and unshielded." },
    { level: 5, name: "Extra Attack", description: "Attack more than once when you take the Attack action." },
    { level: 5, name: "Stunning Strike", description: "Channel ki through a hit to try to stun a foe." },
    { level: 20, name: "Perfect Self", description: "Recover a little ki when you begin a fight empty." },
  ],
  abilities: [
    { id: "flurryOfBlows", name: "Flurry of Blows", level: 2, refresh: "shortRest", uses: 2, resourcePool: "ki", resource: "bonusAction", description: "Spend 1 ki to make a quick unarmed strike." },
    { id: "patientDefense", name: "Patient Defense", level: 2, refresh: "shortRest", uses: 2, resourcePool: "ki", resource: "bonusAction", description: "Spend 1 ki to Dodge as a quick action." },
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
