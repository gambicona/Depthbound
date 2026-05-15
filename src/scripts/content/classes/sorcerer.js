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
  armorProficiencies: [],
  weaponProficiencies: ["dagger", "dart", "sling", "quarterstaff", "crossbow-light"],
  spellcastingAbility: "cha",
  spellPointProgression: fullCasterSpellPoints,
  spellList: ["magic_missile", "shield", "mage_armor", "burning_hands", "thunderwave", "scorching_ray", "mirror_image", "misty_step", "fireball", "lightning_bolt"],
  cantripList: ["mage-hand", "blade-ward", "fire-bolt", "mind-sliver", "thunderclap", "chill-touch", "acid-splash", "booming-blade", "frostbite", "green-flame-blade", "poison-spray", "ray-of-frost", "shocking-grasp"],
  spells: [],
  token: "S",
  classFeatures: [
    { level: 1, name: "Spellcasting", description: "You can shape class magic into prepared or known spells." },
    { level: 2, name: "Font of Magic", description: "Convert magical power into flexible sorcery points." },
    { level: 3, name: "Metamagic", description: "Twist spells with special sorcerous modifications." },
  ],
  abilities: [
    { id: "empoweredSpell", name: "Empowered Spell", level: 3, refresh: "longRest", uses: 3, resourcePool: "metamagic", resource: "bonusAction", description: "Spend metamagic to empower the next spell or attack with raw arcane force." },
  ],
  equipment: { mainHand: "quarterstaff", torso: null },
  inventory: { money: { cp: 0, sp: 0, gp: 0 }, items: ["quarterstaff"] },
  startingGear: {
    steps: [
      {
        title: "Starting Weapon",
        message: "Choose your sorcerer weapon.",
        choices: [
          { value: "light-crossbow", label: "Light Crossbow and 20 Bolts", equipment: { mainHand: "crossbow-light" }, inventory: ["crossbow-light", "bolts-20"], quiver: "bolts-20" },
          {
            value: "simple",
            label: "Any simple weapon",
            select: { pool: "simpleWeapons", title: "Choose Simple Weapon", message: "Select a simple weapon.", label: "Weapon", slot: "mainHand" },
          },
        ],
      },
      {
        title: "Daggers",
        message: "Your sorcerer also starts with two daggers.",
        choices: [
          { value: "daggers", label: "Two Daggers", inventory: ["dagger", "dagger"] },
        ],
      },
    ],
  },
});
})();
