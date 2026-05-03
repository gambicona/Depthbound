(() => {
window.DungeonContent.register("monsters", "lanternWraith", {
  name: "Lantern Wraith",
  role: "Restless magical sentry",
  maxHp: 18,
  category: 2,
  xp: 120,
  ac: 14,
  attackBonus: 5,
  damage: { count: 1, sides: 6, bonus: 3, type: "necrotic", label: "1d6 + 3 necrotic", range: { kind: "ranged", normal: 50, long: 150, feet: 50 } },
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "L",
});
})();