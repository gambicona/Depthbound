(() => {
window.DungeonContent.register("monsters", "ashBarracksVeteran", {
  name: "Ash Barracks Veteran",
  role: "Experienced undead soldier",
  maxHp: 19,
  category: 2,
  xp: 100,
  ac: 15,
  attackBonus: 5,
  damage: { count: 1, sides: 8, bonus: 2, type: "slashing", label: "1d8 + 2 slashing" },
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "melee",
  token: "V",
  equipment: {
    mainHand: "longsword",
    offHand: "shield",
  },
  inventory: {
    money: { cp: 0, sp: 2, gp: 0 },
    items: ["longsword", "shield"],
  },
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});
})();