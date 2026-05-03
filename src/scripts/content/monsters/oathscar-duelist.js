(() => {
window.DungeonContent.register("monsters", "oathscarDuelist", {
  name: "Oathscar Duelist",
  role: "Undead swordmaster",
  maxHp: 32,
  category: 3,
  xp: 230,
  ac: 15,
  attackBonus: 7,
  damage: { count: 1, sides: 8, bonus: 4, type: "piercing", label: "1d8 + 4 piercing" },
  initiativeBonus: 4,
  speedFeet: 35,
  behavior: "melee",
  token: "D",
  equipment: {
    mainHand: "rapier",
    offHand: null,
  },
  inventory: {
    money: { cp: 0, sp: 4, gp: 2 },
    items: ["rapier"],
  },
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});
})();