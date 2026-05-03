(() => {
window.DungeonContent.register("monsters", "lanternHexguard", {
  name: "Lantern Hexguard",
  role: "Undead arcane sentry",
  maxHp: 34,
  category: 3,
  xp: 240,
  ac: 15,
  attackBonus: 6,
  damage: { count: 1, sides: 8, bonus: 4, type: "necrotic", label: "1d8 + 4 necrotic", range: { kind: "ranged", normal: 60, long: 180, feet: 60 } },
  initiativeBonus: 3,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "L",
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});
})();