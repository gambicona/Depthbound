(() => {
window.DungeonContent.register("monsters", "skeletonArcher", {
  name: "Skeleton Archer",
  role: "Bow-armed skeleton",
  maxHp: 9,
  category: 1,
  xp: 50,
  ac: 12,
  attackBonus: 4,
  damage: { count: 1, sides: 6, bonus: 2, type: "piercing", label: "1d6 + 2 piercing", range: { kind: "ranged", normal: 80, long: 320, feet: 80 } },
  damageVulnerabilities: ["bludgeoning"],
  damageImmunities: ["poison"],
  initiativeBonus: 2,
  speedFeet: 25,
  behavior: "rangedKiter",
  token: "A",
  tokenArt: "assets/tokens/skeleton-archer.png",
  abilityMods: { dex: 2, str: 0 },
  equipment: {
    mainHand: "shortbow",
    offHand: null,
    quiver: "arrows-20",
  },
  inventory: {
    money: { cp: 0, sp: 0, gp: 0 },
    items: ["shortbow", "arrows-20"],
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
