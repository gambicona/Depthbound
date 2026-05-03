(() => {
window.DungeonContent.register("monsters", "wardenOfTheOldWatch", {
  name: "Warden of the Old Watch",
  role: "Ancient undead commander",
  maxHp: 34,
  category: 2,
  xp: 225,
  ac: 15,
  attackBonus: 5,
  damage: { count: 1, sides: 8, bonus: 3, type: "slashing", label: "1d8 + 3 slashing" },
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "W",
  equipment: {
    mainHand: "battleaxe",
    offHand: "shield",
  },
  inventory: {
    money: { cp: 0, sp: 8, gp: 2 },
    items: ["battleaxe", "shield"],
  },
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});
})();