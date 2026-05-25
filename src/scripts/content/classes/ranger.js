(() => {
const halfCasterSpellPoints = { 1: 2, 2: 4, 3: 6, 4: 6, 5: 14, 6: 14, 7: 17, 8: 17, 9: 27, 10: 27, 11: 32, 12: 32, 13: 38, 14: 38, 15: 44, 16: 44, 17: 57, 18: 57, 19: 64, 20: 64 };

window.DungeonContent.register("classes", "ranger", {
  name: "Trail Warden",
  className: "Ranger",
  classId: "ranger",
  classRole: "ranger",
  casterType: "half",
  role: "Level 1 Ranger",
  level: 1,
  xp: 0,
  hitDie: 10,
  maxHp: 12,
  abilityMods: { str: 1, dex: 3, con: 2, wis: 2 },
  baseAc: 10,
  attackBonus: 5,
  damage: { count: 1, sides: 8, bonus: 3, type: "piercing", label: "1d8 + 3 piercing" },
  initiativeBonus: 3,
  speedFeet: 30,
  armorProficiencies: ["light", "medium", "shield"],
  weaponProficiencies: ["simple", "martial"],
  spellcastingAbility: "wis",
  spellPointProgression: halfCasterSpellPoints,
  spellList: ["hunters_mark", "cure_wounds", "ensnaring_strike", "hail_of_thorns", "fog_cloud", "longstrider", "zephyr-strike", "barkskin", "lesser-restoration", "spike_growth", "silence", "cordon_of_arrows", "protection-from-poison", "conjure-animals", "conjure-barrage", "daylight", "flame-arrows", "lightning-arrow", "plant-growth", "protection-from-energy", "wind-wall", "conjure-woodland-beings", "freedom-of-movement", "grasping-vine", "guardian-of-nature", "stoneskin", "conjure-volley", "swift-quiver", "wrath-of-nature"],
  spells: [],
  token: "R",
  classFeatures: [
    { level: 1, name: "Favored Foe", description: "Mark a chosen enemy and punish it with extra damage." },
    { level: 2, name: "Fighting Style", description: "Adopt a martial specialty that improves how you fight." },
    { level: 3, name: "Ranger Archetype", description: "Choose a ranger subclass. Beast Masters gain a loyal companion trained to aid them in battle." },
    { level: 5, name: "Extra Attack", description: "Attack more than once when you take the Attack action." },
  ],
  abilities: [
    {
      id: "favoredFoe",
      name: "Favored Foe",
      level: 1,
      refresh: "longRest",
      resource: "passive",
      resourcePool: "favoredFoe",
      description: "When you hit, you can mark the target with concentration. Once on each of your turns, your first damaging hit against that target deals extra nature damage.",
    },
  ],
  equipment: { mainHand: "longbow", torso: "leather", quiver: "arrows-20" },
  inventory: { money: { cp: 0, sp: 0, gp: 0 }, items: ["longbow", "leather", "arrows-20"] },
  startingGear: {
    equipment: { mainHand: "longbow", quiver: "arrows-20" },
    inventory: ["longbow", "arrows-20"],
    steps: [
      {
        title: "Starting Armor",
        message: "Choose your ranger armor.",
        choices: [
          { value: "scale-mail", label: "Scale Mail", equipment: { torso: "scale-mail" }, inventory: ["scale-mail"] },
          { value: "leather", label: "Leather Armor", equipment: { torso: "leather" }, inventory: ["leather"] },
        ],
      },
      {
        title: "Starting Weapons",
        message: "Choose your ranger melee weapons.",
        choices: [
          { value: "shortswords", label: "Two Shortswords", equipment: { mainHand: "shortsword", offHand: "shortsword" }, inventory: ["shortsword", "shortsword"] },
          {
            value: "simple-melee",
            label: "Two simple melee weapons",
            selectTwo: { pool: "simpleMeleeWeapons", title: "Choose Two Simple Melee Weapons", message: "Select two simple melee weapons.", labels: ["First Weapon", "Second Weapon"], slots: ["mainHand", "offHand"], allowSame: true },
          },
        ],
      },
    ],
  },
});
})();
