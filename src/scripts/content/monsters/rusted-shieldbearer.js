(() => {
window.DungeonContent.register("monsters", "rustedShieldbearer", {
  name: "Rusted Shieldbearer",
  role: "Defensive skeleton",
  maxHp: 16,
  category: 1,
  xp: 75,
  ac: 16,
  attackBonus: 3,
  damage: {
    count: 1,
    sides: 4,
    bonus: 1,
    type: "bludgeoning",
    label: "1d4 + 1 bludgeoning"
  },
  damageVulnerabilities: ["bludgeoning"],
  damageImmunities: ["poison"],
  initiativeBonus: 0,
  speedFeet: 20,
  behavior: "melee",
  token: "S",
  tokenArt: "assets/tokens/rusted-shieldbearer.png",
  equipment: {
    mainHand: "mace",
    offHand: "shield",
  },
  inventory: {
    money: { cp: 0, sp: 0, gp: 0 },
    items: ["mace", "shield"],
  },
});
})();