(() => {
window.DungeonContent.register("monsters", "graveplateSentinel", {
  name: "Graveplate Sentinel",
  role: "Heavy undead guard",
  maxHp: 36,
  category: 3,
  xp: 220,
  ac: 16,
  attackBonus: 6,
  damage: { count: 1, sides: 10, bonus: 3, type: "slashing", label: "1d10 + 3 slashing" },
  damageVulnerabilities: ["bludgeoning"],
  damageImmunities: ["poison"],
  initiativeBonus: 1,
  speedFeet: 25,
  behavior: "melee",
  token: "S",
  tokenArt: "assets/tokens/graveplate-sentinel.png",
  equipment: {
    mainHand: "greatsword",
    offHand: null,
  },
  inventory: {
    money: { cp: 0, sp: 6, gp: 1 },
    items: ["greatsword"],
  },
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});
})();