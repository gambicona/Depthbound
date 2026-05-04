(() => {
window.DungeonContent.register("monsters", "bannerKnight", {
  name: "Banner Knight",
  role: "Undead guardroom champion",
  maxHp: 28,
  category: 2,
  xp: 180,
  ac: 15,
  attackBonus: 5,
  damage: { count: 1, sides: 8, bonus: 3, type: "slashing", label: "1d8 + 3 slashing" },
  damageVulnerabilities: ["bludgeoning"],
  damageImmunities: ["poison"],
  initiativeBonus: 2,
  speedFeet: 30,
  behavior: "melee",
  token: "B",
  tokenArt: "assets/tokens/banner-knight.png",
  equipment: {
    mainHand: "longsword",
    offHand: "shield",
  },
  inventory: {
    money: { cp: 0, sp: 5, gp: 1 },
    items: ["longsword", "shield"],
  },
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});
})();