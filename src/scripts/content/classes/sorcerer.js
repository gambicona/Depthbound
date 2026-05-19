(() => {
const fullCasterSpellPoints = { 1: 4, 2: 6, 3: 14, 4: 17, 5: 27, 6: 32, 7: 38, 8: 44, 9: 57, 10: 64, 11: 73, 12: 73, 13: 83, 14: 83, 15: 94, 16: 94, 17: 107, 18: 114, 19: 123, 20: 133 };

const metamagicOptions = [
  { id: "metamagicDistant", name: "Distant Spell", level: 3, cost: 1, description: "Double a spell's range before choosing its target." },
  { id: "metamagicEmpowered", name: "Empowered Spell", level: 3, cost: 1, description: "Add your Charisma modifier to one spell's damage." },
  { id: "metamagicExtended", name: "Extended Spell", level: 3, cost: 1, description: "Double the duration of a spell that creates a timed effect." },
  { id: "metamagicHeightened", name: "Heightened Spell", level: 3, cost: 3, description: "Make a saving-throw spell harder to resist." },
  { id: "metamagicQuickened", name: "Quickened Spell", level: 3, cost: 2, description: "Cast an action spell with your bonus action." },
  { id: "metamagicTwinned", name: "Twinned Spell", level: 3, cost: "spellLevel", description: "Affect a second target with an eligible single-target spell." },
];

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
  spellList: ["magic_missile", "shield", "mage_armor", "burning_hands", "thunderwave", "scorching_ray", "mirror_image", "misty_step", "fireball", "lightning_bolt", "fly"],
  cantripList: ["mage-hand", "blade-ward", "fire-bolt", "mind-sliver", "thunderclap", "chill-touch", "acid-splash", "booming-blade", "frostbite", "green-flame-blade", "poison-spray", "ray-of-frost", "shocking-grasp"],
  spells: [],
  token: "S",
  classFeatures: [
    { level: 1, name: "Spellcasting", description: "You can shape class magic into prepared or known spells." },
    { level: 2, name: "Font of Magic", description: "Convert magical power into flexible sorcery points." },
    { level: 3, name: "Metamagic", description: "Choose two ways to twist spells with sorcery points." },
    { level: 10, name: "Metamagic Option", description: "Choose one additional Metamagic option." },
    { level: 17, name: "Metamagic Option", description: "Choose one additional Metamagic option." },
  ],
  metamagicOptions,
  abilities: metamagicOptions.map((option) => ({
    id: option.id,
    name: option.name,
    level: option.level,
    refresh: "longRest",
    uses: option.cost === "spellLevel" ? 1 : option.cost,
    resourcePool: "metamagic",
    metamagicOption: true,
    resource: "spellModifier",
    description: option.description,
  })),
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
