(() => {
window.DungeonContent.register("monsters", "barricadeCrossbowman", {
  name: "Barricade Crossbowman",
  role: "Armored ranged skeleton",
  maxHp: 14,
  category: 1,
  xp: 75,
  ac: 14,
  attackBonus: 4,
  damage: { count: 1, sides: 8, bonus: 1, type: "piercing", label: "1d8 + 1 piercing", range: { kind: "ranged", normal: 80, long: 320, feet: 80 } },
  damageVulnerabilities: ["bludgeoning"],
  damageImmunities: ["poison"],
  initiativeBonus: 1,
  speedFeet: 25,
  behavior: "rangedKiter",
  token: "X",
  tokenArt: "assets/tokens/barricade-crossbowman.png",
  equipment: {
    mainHand: "light-crossbow",
    offHand: null,
    quiver: "bolts-20",
  },
  inventory: {
    money: { cp: 0, sp: 0, gp: 0 },
    items: ["light-crossbow", "bolts-20"],
  },
  extraLoot: [
    {
      kind: "item",
      itemId: "bolts-20",
      quantityDice: { count: 1, sides: 8 },
    },
  ],
});
})();