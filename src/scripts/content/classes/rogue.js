(() => {
window.DungeonContent.register("classes", "rogue", {
  name: "Night Knife",
  className: "Rogue",
  classId: "rogue",
  classRole: "rogue",
  casterType: "none",
  role: "Level 1 Rogue",
  level: 1,
  xp: 0,
  hitDie: 8,
  maxHp: 10,
  abilityMods: { dex: 2, con: 2, int: 1, wis: 1 },
  baseAc: 10,
  attackBonus: 4,
  damage: { count: 1, sides: 8, bonus: 2, type: "piercing", label: "1d8 + 2 piercing" },
  initiativeBonus: 2,
  speedFeet: 30,
  armorProficiencies: ["light"],
  weaponProficiencies: ["simple", "crossbow-hand", "longsword", "rapier", "shortsword"],
  token: "G",
  classFeatures: [
    { level: 1, name: "Sneak Attack", description: "Deal extra damage when you strike with precision at the right opening." },
    { level: 1, name: "Expertise", description: "Choose two trained proficiencies to double your proficiency bonus." },
    { level: 2, name: "Cunning Action", description: "Use quick bonus actions to Dash, Disengage, or Hide." },
    { level: 5, name: "Uncanny Dodge", description: "Use your reaction to halve damage from an attack you can see." },
    { level: 6, name: "Expertise", description: "Choose two more trained proficiencies to master." },
    { level: 7, name: "Evasion", description: "Slip through dangerous effects, taking less or no damage on Dexterity saves." },
    { level: 11, name: "Reliable Talent", description: "Treat poor proficient skill rolls as competent results." },
  ],
  abilities: [
    { id: "cunningActionDash", name: "Cunning Action: Dash", level: 2, refresh: "turn", uses: 1, resource: "bonusAction", description: "Dash as a quick action." },
    { id: "steadyAim", name: "Steady Aim", level: 1, refresh: "turn", uses: 1, resource: "bonusAction", description: "Spend your bonus action and movement for advantage on your next attack, enabling Sneak Attack." },
    { id: "uncannyDodge", name: "Uncanny Dodge", level: 5, refresh: "turn", uses: 1, resource: "reaction", description: "Reaction: halve the damage from one attack that hits you." },
  ],
  equipment: { mainHand: "rapier", torso: "leather" },
  inventory: { money: { cp: 0, sp: 0, gp: 0 }, items: ["rapier", "shortbow", "arrows-20", "leather"] },
  startingGear: {
    equipment: { torso: "leather" },
    inventory: ["leather"],
    steps: [
      {
        title: "Starting Weapon",
        message: "Choose your rogue weapon.",
        choices: [
          { value: "rapier", label: "Rapier", equipment: { mainHand: "rapier" }, inventory: ["rapier"] },
          { value: "shortsword", label: "Shortsword", equipment: { mainHand: "shortsword" }, inventory: ["shortsword"] },
        ],
      },
      {
        title: "Secondary Weapon",
        message: "Choose your rogue secondary weapon.",
        choices: [
          { value: "shortbow", label: "Shortbow and 20 Arrows", inventory: ["shortbow", "arrows-20"], quiver: "arrows-20" },
          { value: "shortsword", label: "Shortsword", inventory: ["shortsword"] },
        ],
      },
    ],
  },
});
})();
