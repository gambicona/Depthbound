(() => {
window.DungeonContent.register("monsters", "skeletalSpearman", {
  name: "Skeletal Spearman",
  role: "Reach guard",
  maxHp: 14,
  category: 1,
  xp: 60,
  ac: 13,
  attackBonus: 4,
  damage: { count: 1, sides: 6, bonus: 2, type: "piercing", label: "1d6 + 2 piercing", range: { kind: "melee", feet: 10 } },
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "melee",
  token: "P",
  equipment: {
    mainHand: "spear",
    offHand: null,
  },
  inventory: {
    money: { cp: 0, sp: 0, gp: 0 },
    items: ["spear"],
  },
});
})();