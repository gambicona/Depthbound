(() => {
window.DungeonContent.register("monsters", "boneMaulBrute", {
  name: "Bone-Maul Brute",
  role: "Massive skeletal crusher",
  maxHp: 42,
  category: 3,
  xp: 250,
  ac: 14,
  attackBonus: 5,
  damage: { count: 1, sides: 12, bonus: 4, type: "bludgeoning", label: "1d12 + 4 bludgeoning" },
  damageVulnerabilities: ["bludgeoning"],
  damageImmunities: ["poison"],
  initiativeBonus: 0,
  speedFeet: 25,
  behavior: "melee",
  token: "M",
  tokenArt: "assets/tokens/bone-maul-brute.png",
  equipment: {
    mainHand: "maul",
    offHand: null,
  },
  inventory: {
    money: { cp: 0, sp: 3, gp: 2 },
    items: ["maul"],
  },
  extraLoot: [
    {
      kind: "randomEquipment",
    },
  ],
});
})();