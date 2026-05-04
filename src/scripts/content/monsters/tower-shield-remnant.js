(() => {
window.DungeonContent.register("monsters", "towerShieldRemnant", {
  name: "Tower Shield Remnant",
  role: "Heavily armored undead",
  maxHp: 22,
  category: 2,
  xp: 120,
  ac: 16,
  attackBonus: 4,
  damage: { count: 1, sides: 6, bonus: 2, type: "bludgeoning", label: "1d6 + 2 bludgeoning" },
  damageVulnerabilities: ["bludgeoning"],
  damageImmunities: ["poison"],
  initiativeBonus: 0,
  speedFeet: 20,
  behavior: "melee",
  token: "T",
  tokenArt: "assets/tokens/tower-shield-remnant.png",
  equipment: {
    mainHand: "mace",
    offHand: "tower-shield",
  },
  inventory: {
    money: { cp: 0, sp: 2, gp: 0 },
    items: ["mace", "tower-shield"],
  },
});
})();