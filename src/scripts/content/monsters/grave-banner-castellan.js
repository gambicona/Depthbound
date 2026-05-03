(() => {
window.DungeonContent.register("monsters", "graveBannerCastellan", {
  name: "Grave-Banner Castellan",
  role: "Undead fortress captain",
  maxHp: 54,
  category: 3,
  xp: 350,
  ac: 16,
  attackBonus: 7,
  damage: { count: 1, sides: 10, bonus: 5, type: "slashing", label: "1d10 + 5 slashing" },
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "K",
  equipment: {
    mainHand: "greatsword",
    offHand: null,
  },
  inventory: {
    money: { cp: 0, sp: 8, gp: 4 },
    items: ["greatsword"],
  },
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});
})();