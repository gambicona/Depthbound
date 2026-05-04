(() => {
window.DungeonContent.register("monsters", "oathboundJailer", {
  name: "Oathbound Jailer",
  role: "Undead prison guard",
  maxHp: 24,
  category: 2,
  xp: 140,
  ac: 15,
  attackBonus: 5,
  damage: { count: 1, sides: 8, bonus: 2, type: "bludgeoning", label: "1d8 + 2 bludgeoning", range: { kind: "melee", feet: 10 } },
  damageVulnerabilities: ["bludgeoning"],
  damageImmunities: ["poison"],
  initiativeBonus: 1,
  speedFeet: 25,
  behavior: "melee",
  token: "J",
  tokenArt: "assets/tokens/oathbound-jailer.png",
  equipment: {
    mainHand: "chain",
    offHand: null,
  },
  inventory: {
    money: { cp: 0, sp: 3, gp: 0 },
    items: ["chain"],
  },
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});
})();