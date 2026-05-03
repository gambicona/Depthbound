(() => {
window.DungeonContent.register("monsters", "blackArrowSentry", {
  name: "Black Arrow Sentry",
  role: "Elite undead archer",
  maxHp: 17,
  category: 2,
  xp: 120,
  ac: 14,
  attackBonus: 5,
  damage: { count: 1, sides: 8, bonus: 2, type: "piercing", label: "1d8 + 2 piercing", range: { kind: "ranged", normal: 100, long: 400, feet: 100 } },
  initiativeBonus: 3,
  speedFeet: 30,
  behavior: "rangedKiter",
  token: "N",
  abilityMods: { dex: 3, str: 0 },
  equipment: {
    mainHand: "longbow",
    offHand: null,
    quiver: "arrows-20",
  },
  inventory: {
    money: { cp: 0, sp: 2, gp: 0 },
    items: ["longbow", "arrows-20"],
  },
  extraLoot: [
    {
      kind: "item",
      itemId: "arrows-20",
      quantityDice: { count: 1, sides: 12 },
    },
  ],
});
})();