(() => {
const pactSpellPoints = { 1: 2, 2: 4, 3: 6, 4: 6, 5: 10, 6: 10, 7: 12, 8: 12, 9: 14, 10: 14, 11: 21, 12: 21, 13: 21, 14: 21, 15: 21, 16: 21, 17: 28, 18: 28, 19: 28, 20: 28 };

window.DungeonContent.register("classes", "warlock", {
  name: "Pactbound",
  className: "Warlock",
  classId: "warlock",
  classRole: "warlock",
  casterType: "pact",
  role: "Level 1 Warlock",
  level: 1,
  xp: 0,
  hitDie: 8,
  maxHp: 10,
  abilityMods: { str: 0, dex: 1, con: 2, wis: 1, cha: 2 },
  baseAc: 10,
  attackBonus: 4,
  damage: { count: 1, sides: 8, bonus: 1, type: "piercing", label: "1d8 + 1 piercing" },
  initiativeBonus: 1,
  speedFeet: 30,
  armorProficiencies: ["light"],
  weaponProficiencies: ["simple"],
  spellcastingAbility: "cha",
  spellPointProgression: pactSpellPoints,
  spellList: ["armor_of_agathys", "arms_of_hadar", "hex", "hellish_rebuke", "cause_fear", "darkness", "hold_person", "misty_step", "hunger_of_hadar", "vampiric_touch"],
  cantripList: ["mage-hand", "blade-ward", "mind-sliver", "eldritch-blast", "thunderclap", "chill-touch", "booming-blade", "frostbite", "green-flame-blade", "poison-spray", "toll-the-dead"],
  spells: [],
  token: "Wk",
  classFeatures: [
    { level: 1, name: "Pact Magic", description: "Cast warlock spells through pact-granted power that refreshes quickly." },
    { level: 1, name: "Eldritch Blast", description: "Hurl a signature beam of force at your enemies." },
    { level: 2, name: "Eldritch Invocations", description: "Learn occult gifts that reshape your warlock talents." },
    { level: 3, name: "Pact Boon", description: "Receive a defining gift from your patron." },
    { level: 11, name: "Mystic Arcanum", description: "Once per long rest, invoke patron magic as a high-power force burst that can briefly banish a foe." },
    { level: 20, name: "Eldritch Master", description: "Restore pact magic through a brief appeal to your patron." },
  ],
  abilities: [
    { id: "mysticArcanum", name: "Mystic Arcanum", level: 11, refresh: "longRest", uses: 1, resource: "action", description: "Call on a once-per-rest arcanum. A visible enemy takes 6d8 force damage and is briefly banished.", subclassEffect: { kind: "damageTarget", dice: { count: 6, sides: 8 }, damageType: "force", riderStatus: "banished" } },
    { id: "eldritchMaster", name: "Eldritch Master", level: 20, refresh: "longRest", uses: 1, resource: "action", description: "Restore pact spell points." },
  ],
  equipment: { mainHand: "crossbow-light", torso: "leather", quiver: "bolts-20" },
  inventory: { money: { cp: 0, sp: 0, gp: 0 }, items: ["crossbow-light", "bolts-20", "leather", "dagger", "dagger"] },
  startingGear: {
    equipment: { torso: "leather" },
    inventory: ["leather"],
    steps: [
      {
        title: "Starting Weapon",
        message: "Choose your warlock weapon.",
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
        title: "Second Weapon",
        message: "Choose one additional simple weapon.",
        choices: [
          {
            value: "simple",
            label: "Any simple weapon",
            select: { pool: "simpleWeapons", title: "Choose Simple Weapon", message: "Select a simple weapon.", label: "Weapon", slot: "" },
          },
        ],
      },
      {
        title: "Daggers",
        message: "Your warlock also starts with two daggers.",
        choices: [
          { value: "daggers", label: "Two Daggers", inventory: ["dagger", "dagger"] },
        ],
      },
    ],
  },
});
})();
