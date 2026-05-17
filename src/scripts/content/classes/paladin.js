(() => {
const halfCasterSpellPoints = { 1: 2, 2: 4, 3: 6, 4: 6, 5: 14, 6: 14, 7: 17, 8: 17, 9: 27, 10: 27, 11: 32, 12: 32, 13: 38, 14: 38, 15: 44, 16: 44, 17: 57, 18: 57, 19: 64, 20: 64 };

window.DungeonContent.register("classes", "paladin", {
  name: "Oathsworn",
  className: "Paladin",
  classId: "paladin",
  classRole: "paladin",
  casterType: "half",
  role: "Level 1 Paladin",
  level: 1,
  xp: 0,
  hitDie: 10,
  maxHp: 13,
  abilityMods: { str: 3, dex: 0, con: 2, cha: 2 },
  baseAc: 10,
  attackBonus: 5,
  damage: { count: 1, sides: 8, bonus: 3, type: "slashing", label: "1d8 + 3 slashing" },
  initiativeBonus: 0,
  speedFeet: 30,
  armorProficiencies: ["light", "medium", "heavy", "shield"],
  weaponProficiencies: ["simple", "martial"],
  spellcastingAbility: "cha",
  spellPointProgression: halfCasterSpellPoints,
  spellList: ["bless", "cure_wounds", "divine_favor", "shield_of_faith", "compelled_duel", "heroism", "thunderous_smite", "wrathful_smite", "aid", "branding_smite"],
  spells: [],
  token: "P",
  classFeatures: [
    { level: 1, name: "Lay on Hands", description: "Use a healing pool equal to 5 x paladin level to restore yourself or adjacent allies." },
    { level: 2, name: "Divine Smite", description: "Spend spell points before a weapon hit to add radiant damage; more points add more d8s." },
    { level: 5, name: "Extra Attack", description: "Attack more than once when you take the Attack action." },
    { level: 6, name: "Aura of Protection", description: "Nearby allies add your Charisma modifier to saving throws." },
  ],
  abilities: [
    { id: "layOnHands", name: "Lay on Hands", level: 1, refresh: "longRest", uses: 5, resourcePool: "layOnHands", resource: "action", description: "Spend any amount from your Lay on Hands pool to heal yourself or an adjacent wounded ally." },
    { id: "divineSmite", name: "Divine Smite", level: 2, refresh: "turn", uses: 1, resource: "bonusAction", description: "Spend spell points to charge your next weapon hit with radiant damage." },
  ],
  equipment: { mainHand: "longsword", offHand: "shield", torso: "chain-mail" },
  inventory: { money: { cp: 0, sp: 0, gp: 0 }, items: ["longsword", "shield", "chain-mail"] },
  startingGear: {
    equipment: { torso: "chain-mail" },
    inventory: ["chain-mail"],
    steps: [
      {
        title: "Primary Weapon Loadout",
        message: "Choose your paladin weapon loadout.",
        choices: [
          {
            value: "weapon-shield",
            label: "One martial weapon and a shield",
            equipment: { offHand: "shield" },
            inventory: ["shield"],
            select: { pool: "oneHandedMartialWeapons", title: "Choose Martial Weapon", message: "Select a martial weapon.", label: "Weapon", slot: "mainHand" },
          },
          {
            value: "two-weapons",
            label: "Two martial weapons",
            selectTwo: { pool: "oneHandedMartialWeapons", title: "Choose Two Martial Weapons", message: "Select two martial weapons.", labels: ["First Weapon", "Second Weapon"], slots: ["mainHand", "offHand"] },
          },
        ],
      },
      {
        title: "Secondary Weapons",
        message: "Choose your additional paladin weapons.",
        choices: [
          { value: "javelins", label: "Five Javelins", inventory: ["javelin", "javelin", "javelin", "javelin", "javelin"] },
          {
            value: "simple-melee",
            label: "Any simple melee weapon",
            select: { pool: "simpleMeleeWeapons", title: "Choose Simple Melee Weapon", message: "Select a simple melee weapon.", label: "Weapon", slot: "" },
          },
        ],
      },
    ],
  },
});
})();
