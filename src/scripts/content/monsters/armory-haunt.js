(() => {
window.DungeonContent.register("monsters", "armoryHaunt", {
  name: "Armory Haunt",
  role: "Possessed weapon",
  maxHp: 15,
  category: 1,
  xp: 75,
  ac: 15,
  attackBonus: 5,
  damage: { count: 1, sides: 6, bonus: 2, type: "slashing", label: "1d6 + 2 slashing" },
  initiativeBonus: 3,
  speedFeet: 30,
  behavior: "melee",
  token: "W",
});
})();