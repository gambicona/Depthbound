(() => {
window.DungeonContent.register("monsters", "rustedHalberdier", {
  name: "Rusted Halberdier",
  role: "Heavy undead guard",
  maxHp: 18,
  category: 2,
  xp: 90,
  ac: 14,
  attackBonus: 4,
  damage: { count: 1, sides: 10, bonus: 1, type: "slashing", label: "1d10 + 1 slashing", range: { kind: "melee", feet: 10 } },
  initiativeBonus: 0,
  speedFeet: 25,
  behavior: "melee",
  token: "H",
  equipment: {
    mainHand: "halberd",
    offHand: null,
  },
  inventory: {
    money: { cp: 0, sp: 1, gp: 0 },
    items: ["halberd"],
  },
});
})();