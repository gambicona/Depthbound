(() => {
window.DungeonContent.register("monsters", "cryptGuard", {
  name: "Crypt Guard",
  role: "Armored skeleton",
  maxHp: 13,
  category: 1,
  xp: 50,
  ac: 13,
  attackBonus: 4,
  damage: { count: 1, sides: 6, bonus: 2, type: "piercing", label: "1d6 + 2 piercing" },
  initiativeBonus: 2,
  speedFeet: 25,
  behavior: "melee",
  token: "C",
});
})();
