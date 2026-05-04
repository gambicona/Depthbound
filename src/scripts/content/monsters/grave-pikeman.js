(() => {
window.DungeonContent.register("monsters", "gravePikeman", {
  name: "Grave Pikeman",
  role: "Undead reach soldier",
  maxHp: 16,
  category: 2,
  xp: 80,
  ac: 14,
  attackBonus: 5,
  damage: { count: 1, sides: 8, bonus: 2, type: "piercing", label: "1d8 + 2 piercing", range: { kind: "melee", feet: 10 } },
  damageVulnerabilities: ["bludgeoning"],
  damageImmunities: ["poison"],
  initiativeBonus: 1,
  speedFeet: 25,
  behavior: "melee",
  token: "P",
  tokenArt: "assets/tokens/grave-pikeman.png",
  equipment: {
    mainHand: "pike",
    offHand: null,
  },
  inventory: {
    money: { cp: 0, sp: 1, gp: 0 },
    items: ["pike"],
  },
});
})();