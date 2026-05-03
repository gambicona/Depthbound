(() => {
window.DungeonContent.register("monsters", "guardroomCommander", {
  name: "Guardroom Commander",
  role: "Undead officer",
  maxHp: 22,
  category: 1,
  xp: 100,
  ac: 15,
  attackBonus: 5,
  damage: { count: 1, sides: 8, bonus: 3, type: "slashing", label: "1d8 + 3 slashing" },
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "B",
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});
})();
