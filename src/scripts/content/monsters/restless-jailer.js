(() => {
window.DungeonContent.register("monsters", "restlessJailer", {
  name: "Restless Jailer",
  role: "Chain-wielding undead",
  maxHp: 18,
  category: 1,
  xp: 90,
  ac: 14,
  attackBonus: 4,
  damage: { count: 1, sides: 8, bonus: 2, type: "bludgeoning", label: "1d8 + 2 bludgeoning", range: { kind: "melee", feet: 10 } },
  initiativeBonus: 1,
  speedFeet: 25,
  behavior: "melee",
  token: "J",
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});
})();