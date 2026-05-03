(() => {
window.DungeonContent.register("monsters", "hollowMarksman", {
  name: "Hollow Marksman",
  role: "Veteran skeletal archer",
  maxHp: 14,
  category: 2,
  xp: 80,
  ac: 13,
  attackBonus: 5,
  damage: { count: 1, sides: 8, bonus: 1, type: "piercing", label: "1d8 + 1 piercing", range: { kind: "ranged", normal: 80, long: 320, feet: 80 } },
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "M",
  abilityMods: { dex: 2, str: 0 },
  equipment: {
    mainHand: "longbow",
    offHand: null,
    quiver: "arrows-20",
  },
  inventory: {
    money: { cp: 0, sp: 1, gp: 0 },
    items: ["longbow", "arrows-20"],
  },
  extraLoot: [
    {
      kind: "item",
      itemId: "arrows-20",
      quantityDice: { count: 1, sides: 10 },
    },
  ],
});
})();