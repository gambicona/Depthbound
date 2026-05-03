(() => {
window.DungeonContent.register("monsters", "boneLockbreaker", {
  name: "Bone Lockbreaker",
  role: "Fast skeletal skirmisher",
  maxHp: 15,
  category: 2,
  xp: 80,
  ac: 14,
  attackBonus: 5,
  damage: { count: 1, sides: 6, bonus: 3, type: "piercing", label: "1d6 + 3 piercing" },
  initiativeBonus: 3,
  speedFeet: 35,
  behavior: "melee",
  token: "K",
  equipment: {
    mainHand: "shortsword",
    offHand: null,
  },
  inventory: {
    money: { cp: 3, sp: 1, gp: 0 },
    items: ["shortsword"],
  },
});
})();