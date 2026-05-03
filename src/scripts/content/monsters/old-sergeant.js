(() => {
window.DungeonContent.register("monsters", "oldSergeant", {
  name: "Old Sergeant",
  role: "Veteran undead guard",
  maxHp: 20,
  category: 1,
  xp: 100,
  ac: 15,
  attackBonus: 5,
  damage: { count: 1, sides: 8, bonus: 2, type: "slashing", label: "1d8 + 2 slashing" },
  initiativeBonus: 1,
  speedFeet: 25,
  behavior: "melee",
  token: "G",
  equipment: {
    mainHand: "longsword",
    offHand: "shield",
  },
  inventory: {
    money: { cp: 0, sp: 1, gp: 0 },
    items: ["longsword", "shield"],
  },
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});
})();