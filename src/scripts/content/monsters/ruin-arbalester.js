(() => {
window.DungeonContent.register("monsters", "ruinArbalester", {
  name: "Ruin Arbalester",
  role: "Undead heavy crossbowman",
  maxHp: 30,
  category: 3,
  xp: 220,
  ac: 15,
  attackBonus: 6,
  damage: { count: 1, sides: 10, bonus: 3, type: "piercing", label: "1d10 + 3 piercing", range: { kind: "ranged", normal: 100, long: 400, feet: 100 } },
  damageVulnerabilities: ["bludgeoning"],
  damageImmunities: ["poison"],
  initiativeBonus: 2,
  speedFeet: 25,
  behavior: "rangedKiter",
  token: "A",
  tokenArt: "assets/tokens/ruin-arbalester.png",
  abilityMods: { dex: 3, str: 0 },
  equipment: {
    mainHand: "heavy-crossbow",
    offHand: null,
    quiver: "bolts-20",
  },
  inventory: {
    money: { cp: 0, sp: 5, gp: 1 },
    items: ["heavy-crossbow", "bolts-20"],
  },
  extraLoot: [
    {
      kind: "item",
      itemId: "bolts-20",
      quantityDice: { count: 1, sides: 10 },
    },
  ],
});
})();