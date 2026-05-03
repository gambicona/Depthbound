(() => {
window.DungeonContent.register("monsters", "cryptExecutioner", {
  name: "Crypt Executioner",
  role: "Heavy undead striker",
  maxHp: 21,
  category: 2,
  xp: 130,
  ac: 13,
  attackBonus: 4,
  damage: { count: 1, sides: 10, bonus: 2, type: "slashing", label: "1d10 + 2 slashing" },
  initiativeBonus: 0,
  speedFeet: 25,
  behavior: "melee",
  token: "E",
  equipment: {
    mainHand: "greataxe",
    offHand: null,
  },
  inventory: {
    money: { cp: 0, sp: 2, gp: 0 },
    items: ["greataxe"],
  },
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});
})();